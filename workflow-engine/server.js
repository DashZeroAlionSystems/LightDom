/**
 * Workflow Engine Server
 * 
 * Executes campaign workflows with support for various node types,
 * message queue integration, and real-time status updates.
 */

const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const amqp = require('amqplib');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());

// Database connection
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Node executors
const nodeExecutors = {
  trigger: async (node, context) => {
    console.log(`Trigger node: ${node.label}`);
    return { triggered: true, timestamp: new Date() };
  },

  dataMining: async (node, context) => {
    console.log(`Data mining: ${node.label}`);
    // Simulate data collection
    const records = Math.floor(Math.random() * 1000) + 100;
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { recordsCollected: records };
  },

  seoAnalysis: async (node, context) => {
    console.log(`SEO analysis: ${node.label}`);
    // Simulate SEO analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      keywords: ['keyword1', 'keyword2', 'keyword3'],
      score: Math.floor(Math.random() * 30) + 70,
      issues: []
    };
  },

  contentGen: async (node, context) => {
    console.log(`Content generation: ${node.label}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      generated: true,
      wordCount: 500,
      quality: 0.85
    };
  },

  monitoring: async (node, context) => {
    console.log(`Monitoring: ${node.label}`);
    return {
      status: 'healthy',
      metrics: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100
      }
    };
  },

  blockchain: async (node, context) => {
    console.log(`Blockchain operation: ${node.label}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      blockNumber: 12345678,
      transactions: Math.floor(Math.random() * 50),
      anomaliesDetected: Math.random() > 0.8 ? 1 : 0
    };
  },

  notification: async (node, context) => {
    console.log(`Sending notification: ${node.label}`);
    // Simulate sending notification
    return {
      sent: true,
      recipients: node.data.recipients || ['admin@example.com']
    };
  },

  decision: async (node, context) => {
    console.log(`Decision node: ${node.label}`);
    // Evaluate condition
    const condition = node.data.condition || 'true';
    const result = eval(condition.replace(/\w+/g, 'true'));
    return { decision: result };
  },
};

// Execute workflow
async function executeWorkflow(workflowId, nodes, edges, executionId) {
  const results = {};
  const executedNodes = new Set();

  try {
    // Update execution status
    await db.query(
      'UPDATE workflow_executions SET status = $1 WHERE id = $2',
      ['running', executionId]
    );

    // Execute nodes in topological order
    const sortedNodes = topologicalSort(nodes, edges);

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i];
      
      // Broadcast progress
      io.emit('workflow:progress', {
        executionId,
        nodeId: node.id,
        progress: ((i + 1) / sortedNodes.length) * 100
      });

      // Execute node
      const executor = nodeExecutors[node.type];
      if (executor) {
        const result = await executor(node, { results, executedNodes });
        results[node.id] = result;
        executedNodes.add(node.id);

        // Store node result
        await redis.setex(
          `workflow:${executionId}:node:${node.id}`,
          3600,
          JSON.stringify(result)
        );
      } else {
        console.warn(`Unknown node type: ${node.type}`);
      }

      // Update progress
      await db.query(
        'UPDATE workflow_executions SET progress = $1 WHERE id = $2',
        [((i + 1) / sortedNodes.length) * 100, executionId]
      );
    }

    // Mark as completed
    await db.query(
      `UPDATE workflow_executions 
       SET status = $1, completed_at = NOW(), result = $2 
       WHERE id = $3`,
      ['completed', JSON.stringify(results), executionId]
    );

    // Broadcast completion
    io.emit('workflow:completed', {
      executionId,
      results
    });

    console.log(`Workflow ${executionId} completed successfully`);
    return results;

  } catch (error) {
    console.error(`Workflow ${executionId} failed:`, error);

    await db.query(
      `UPDATE workflow_executions 
       SET status = $1, error = $2, completed_at = NOW() 
       WHERE id = $3`,
      ['failed', error.message, executionId]
    );

    io.emit('workflow:failed', {
      executionId,
      error: error.message
    });

    throw error;
  }
}

// Topological sort for workflow execution order
function topologicalSort(nodes, edges) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const inDegree = new Map(nodes.map(n => [n.id, 0]));
  const adjList = new Map(nodes.map(n => [n.id, []]));

  // Build graph
  edges.forEach(edge => {
    adjList.get(edge.source).push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
  });

  // Find nodes with no dependencies
  const queue = nodes.filter(n => inDegree.get(n.id) === 0);
  const sorted = [];

  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);

    const neighbors = adjList.get(node.id) || [];
    neighbors.forEach(neighborId => {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(nodeMap.get(neighborId));
      }
    });
  }

  if (sorted.length !== nodes.length) {
    throw new Error('Workflow contains cycles');
  }

  return sorted;
}

// Message queue consumer
async function startMessageQueueConsumer() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    );
    const channel = await connection.createChannel();
    const queue = 'workflow-tasks';

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    console.log(`Waiting for messages in ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const task = JSON.parse(msg.content.toString());
          console.log('Received task:', task);

          await executeWorkflow(
            task.workflowId,
            task.nodes,
            task.edges,
            task.executionId
          );

          channel.ack(msg);
        } catch (error) {
          console.error('Task processing error:', error);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    // Retry after delay
    setTimeout(startMessageQueueConsumer, 5000);
  }
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/status', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'running') as running,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM workflow_executions
      WHERE started_at >= NOW() - INTERVAL '24 hours'
    `);

    res.json({
      status: 'operational',
      executions: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/execute', async (req, res) => {
  try {
    const { nodes, edges, name } = req.body;

    // Create execution record
    const result = await db.query(
      `INSERT INTO workflow_executions (workflow_name, config, status, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [name || 'Unnamed Workflow', JSON.stringify({ nodes, edges }), 'pending']
    );

    const execution = result.rows[0];

    // Execute asynchronously
    executeWorkflow(null, nodes, edges, execution.id).catch(err =>
      console.error('Execution error:', err)
    );

    res.status(202).json({
      executionId: execution.id,
      status: 'pending',
      message: 'Workflow execution started'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/execution/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM workflow_executions WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3002;

async function start() {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('Database connected');

    // Start message queue consumer
    startMessageQueueConsumer();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`Workflow Engine running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await db.end();
  await redis.quit();
  process.exit(0);
});
