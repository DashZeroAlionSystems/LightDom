/**
 * Main Server Entry Point
 * 
 * Initializes Fastify server with all plugins and routes
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pino from 'pino';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Services
import { EntityService } from './services/entity-service.js';
import { RelationshipService } from './services/relationship-service.js';
import { EnrichmentService } from './services/enrichment-service.js';
import { ScriptingEngine } from './services/scripting-engine.js';
import { UIGenerator } from './services/ui-generator.js';

// Automation system
import { initializeOrchestrator } from '../automations/automation-routes.js';

// Load environment variables
dotenv.config();

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  }
});

// Initialize Fastify
const fastify = Fastify({
  logger,
  trustProxy: true
});

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true
});

await fastify.register(websocket);

// Create HTTP server for Socket.IO
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize services
const entityService = new EntityService();
const relationshipService = new RelationshipService();
const enrichmentService = new EnrichmentService();
const scriptingEngine = new ScriptingEngine();
const uiGenerator = new UIGenerator();

// Initialize automation orchestrator
const orchestrator = initializeOrchestrator({
  enrichmentService,
  entityService,
  relationshipService
});

/**
 * Load automation config from file
 */
async function loadAutomationConfig(configName) {
  const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../automations/configs', `${configName}.json`);
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

// Automation routes
fastify.post('/api/automations/run/:configName', async (request, reply) => {
  const { configName } = request.params;
  const context = request.body.context || {};
  
  const config = await loadAutomationConfig(configName);
  const automationPromise = orchestrator.runAutomation(config, context);
  
  const automationStatus = Array.from(orchestrator.runningAutomations.values())
    .find(a => a.name === config.name);
  
  if (automationStatus) {
    return {
      success: true,
      automationId: automationStatus.id,
      name: config.name,
      status: 'running'
    };
  } else {
    return { success: true, message: 'Automation queued' };
  }
});

fastify.get('/api/automations/status/:automationId', async (request, reply) => {
  const { automationId } = request.params;
  const status = orchestrator.getAutomationStatus(automationId);
  
  if (!status) {
    reply.code(404);
    return { error: 'Automation not found' };
  }
  
  return { automation: status };
});

fastify.get('/api/automations/metrics', async (request, reply) => {
  return { metrics: orchestrator.getMetrics() };
});

fastify.get('/api/automations/history', async (request, reply) => {
  const limit = parseInt(request.query.limit) || 50;
  return { history: orchestrator.getHistory(limit) };
});

fastify.get('/api/automations/configs', async (request, reply) => {
  const configsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../automations/configs');
  const files = await fs.readdir(configsDir);
  
  const configs = await Promise.all(
    files
      .filter(f => f.endsWith('.json'))
      .map(async (file) => {
        const configData = await fs.readFile(path.join(configsDir, file), 'utf-8');
        const config = JSON.parse(configData);
        return {
          name: file.replace('.json', ''),
          title: config.name,
          description: config.description,
          taskCount: config.tasks.length
        };
      })
  );
  
  return { configs };
});

fastify.get('/api/automations/running', async (request, reply) => {
  const running = Array.from(orchestrator.runningAutomations.values());
  return { automations: running };
});

// Health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await entityService.checkHealth(),
      redis: await enrichmentService.checkHealth(),
      queue: await enrichmentService.getQueueHealth()
    }
  };
});

// Entity CRUD routes
fastify.post('/api/entities', async (request, reply) => {
  const entity = await entityService.create(request.body);
  
  // Emit event
  io.emit('entity:created', entity);
  
  return { success: true, entity };
});

fastify.get('/api/entities/:id', async (request, reply) => {
  const { id } = request.params;
  const { include } = request.query;
  
  const entity = await entityService.getById(id, include);
  
  if (!entity) {
    reply.code(404);
    return { error: 'Entity not found' };
  }
  
  return { success: true, entity };
});

fastify.put('/api/entities/:id', async (request, reply) => {
  const { id } = request.params;
  const entity = await entityService.update(id, request.body);
  
  // Emit event
  io.emit('entity:updated', entity);
  
  return { success: true, entity };
});

fastify.delete('/api/entities/:id', async (request, reply) => {
  const { id } = request.params;
  await entityService.delete(id);
  
  // Emit event
  io.emit('entity:deleted', { id });
  
  return { success: true };
});

// Query entities with relationships
fastify.get('/api/entities', async (request, reply) => {
  const { entityType, limit = 50, offset = 0 } = request.query;
  
  const entities = await entityService.query({
    entityType,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  return { success: true, entities, count: entities.length };
});

// Relationship routes
fastify.post('/api/relationships', async (request, reply) => {
  const relationship = await relationshipService.create(request.body);
  
  // Emit event
  io.emit('relationship:created', relationship);
  
  return { success: true, relationship };
});

fastify.get('/api/relationships/traverse/:entityId', async (request, reply) => {
  const { entityId } = request.params;
  const { relationshipType, depth = 1 } = request.query;
  
  const graph = await relationshipService.traverse(
    entityId,
    relationshipType,
    parseInt(depth)
  );
  
  return { success: true, graph };
});

// Enrichment routes
fastify.post('/api/enrich/batch', async (request, reply) => {
  const { entityIds, enrichmentType, config } = request.body;
  
  const jobId = await enrichmentService.enqueueBatch(
    entityIds,
    enrichmentType,
    config
  );
  
  return { success: true, jobId };
});

fastify.get('/api/enrich/status/:jobId', async (request, reply) => {
  const { jobId } = request.params;
  const status = await enrichmentService.getJobStatus(jobId);
  
  return { success: true, status };
});

// Real-time scripting
fastify.post('/api/script/execute', async (request, reply) => {
  const { script, context } = request.body;
  
  try {
    const result = await scriptingEngine.execute(script, context);
    return { success: true, result };
  } catch (error) {
    reply.code(400);
    return { error: error.message };
  }
});

// UI Generation
fastify.post('/api/ui/generate-form', async (request, reply) => {
  const { schema, uiSchema } = request.body;
  
  const formConfig = uiGenerator.generateFormConfig(schema, uiSchema);
  
  return { success: true, formConfig };
});

// Server-Sent Events for real-time updates
fastify.get('/api/stream/entities', async (request, reply) => {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const sendEvent = (data) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Subscribe to entity events
  const listener = (data) => sendEvent(data);
  
  io.on('connection', (socket) => {
    socket.on('entity:created', listener);
    socket.on('entity:updated', listener);
    socket.on('entity:deleted', listener);
  });
  
  request.raw.on('close', () => {
    // Cleanup
  });
});

// WebSocket endpoint for two-way communication
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', async (message) => {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe') {
        // Subscribe to updates
        connection.socket.send(JSON.stringify({
          type: 'subscribed',
          channel: data.channel
        }));
      } else if (data.type === 'execute') {
        // Execute script
        try {
          const result = await scriptingEngine.execute(data.script, data.context);
          connection.socket.send(JSON.stringify({
            type: 'result',
            result
          }));
        } catch (error) {
          connection.socket.send(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      }
    });
  });
});

// Start servers
const start = async () => {
  try {
    // Start Fastify
    await fastify.listen({
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    });
    
    // Start Socket.IO
    httpServer.listen(process.env.SOCKET_PORT || 3001, () => {
      logger.info(`Socket.IO server listening on port ${process.env.SOCKET_PORT || 3001}`);
    });
    
    logger.info('Container services started successfully');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await fastify.close();
  httpServer.close();
  process.exit(0);
});

start();

export { fastify, io };
