/**
 * MCP Bi-Directional Communication Routes
 * Enables two-way streaming, auto-bundling, and config optimization
 */

import express from 'express';
import { EventEmitter } from 'events';

export function createMCPBidirectionalRoutes(db, io) {
  const router = express.Router();
  
  // Event bus for bi-directional communication
  const mcpEventBus = new EventEmitter();
  mcpEventBus.setMaxListeners(100); // Support many concurrent connections
  
  // Active streaming connections registry
  const activeStreams = new Map();
  
  // Bundle registry for auto-bundling instances
  const bundleRegistry = new Map();
  
  // Event recorder for config optimization
  const eventRecorder = [];
  const MAX_EVENTS = 10000; // Keep last 10k events for analysis

  // ====================================
  // BI-DIRECTIONAL STREAMING
  // ====================================

  /**
   * POST /api/mcp/stream/start
   * Start a bi-directional streaming session
   */
  router.post('/stream/start', async (req, res) => {
    try {
      const { serverId, clientId, streamConfig } = req.body;
      
      if (!serverId || !clientId) {
        return res.status(400).json({
          success: false,
          error: 'serverId and clientId required'
        });
      }
      
      const streamId = `stream-${serverId}-${clientId}-${Date.now()}`;
      
      // Register stream
      activeStreams.set(streamId, {
        serverId,
        clientId,
        config: streamConfig || {},
        startedAt: new Date(),
        messagesReceived: 0,
        messagesSent: 0,
        active: true
      });
      
      // Set up WebSocket namespace for this stream
      const streamNamespace = io.of(`/mcp-stream/${streamId}`);
      
      streamNamespace.on('connection', (socket) => {
        console.log(`Client connected to stream ${streamId}`);
        
        // Client -> Server messages
        socket.on('client-message', async (data) => {
          const stream = activeStreams.get(streamId);
          if (stream) {
            stream.messagesReceived++;
            
            // Record event for optimization
            recordEvent({
              type: 'client-message',
              streamId,
              serverId,
              timestamp: new Date(),
              data
            });
            
            // Process and broadcast to all clients in stream
            streamNamespace.emit('server-response', {
              streamId,
              timestamp: new Date(),
              data: await processClientMessage(serverId, data)
            });
            
            stream.messagesSent++;
          }
        });
        
        // Server -> Client broadcast subscription
        socket.on('subscribe-topic', (topic) => {
          socket.join(topic);
          console.log(`Client subscribed to topic: ${topic}`);
        });
        
        socket.on('disconnect', () => {
          console.log(`Client disconnected from stream ${streamId}`);
        });
      });
      
      res.json({
        success: true,
        streamId,
        wsUrl: `/mcp-stream/${streamId}`,
        message: 'Bi-directional stream started'
      });
      
    } catch (error) {
      console.error('Error starting stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/mcp/stream/status
   * Get status of all active streams
   */
  router.get('/stream/status', async (req, res) => {
    try {
      const streams = Array.from(activeStreams.entries()).map(([id, stream]) => ({
        id,
        ...stream,
        uptime: Date.now() - new Date(stream.startedAt).getTime()
      }));
      
      res.json({
        success: true,
        activeStreams: streams.length,
        streams
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/mcp/stream/stop
   * Stop a streaming session
   */
  router.post('/stream/stop', async (req, res) => {
    try {
      const { streamId } = req.body;
      
      if (activeStreams.has(streamId)) {
        const stream = activeStreams.get(streamId);
        stream.active = false;
        
        // Close WebSocket namespace
        const namespace = io.of(`/mcp-stream/${streamId}`);
        namespace.removeAllListeners();
        
        activeStreams.delete(streamId);
        
        res.json({
          success: true,
          message: 'Stream stopped'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Stream not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ====================================
  // AUTO-BUNDLING INSTANCES
  // ====================================

  /**
   * POST /api/mcp/bundle/create
   * Create a bundle of interconnected MCP instances
   */
  router.post('/bundle/create', async (req, res) => {
    try {
      const { bundleName, serverIds, bundleConfig } = req.body;
      
      if (!bundleName || !serverIds || !Array.isArray(serverIds)) {
        return res.status(400).json({
          success: false,
          error: 'bundleName and serverIds array required'
        });
      }
      
      const bundleId = `bundle-${Date.now()}`;
      
      // Verify all servers exist
      const serverCheck = await db.query(
        `SELECT id, name, agent_type FROM mcp_servers WHERE id = ANY($1)`,
        [serverIds]
      );
      
      if (serverCheck.rows.length !== serverIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more server IDs not found'
        });
      }
      
      // Create bundle
      const bundle = {
        id: bundleId,
        name: bundleName,
        servers: serverCheck.rows,
        config: bundleConfig || {},
        createdAt: new Date(),
        executionCount: 0,
        interconnections: []
      };
      
      bundleRegistry.set(bundleId, bundle);
      
      // Store in database
      await db.query(
        `INSERT INTO mcp_bundles (id, name, server_ids, config, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET 
           name = $2, server_ids = $3, config = $4`,
        [bundleId, bundleName, JSON.stringify(serverIds), JSON.stringify(bundleConfig || {}), new Date()]
      );
      
      recordEvent({
        type: 'bundle-created',
        bundleId,
        serverIds,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        bundle
      });
      
    } catch (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/mcp/bundle/execute
   * Execute a bundled workflow across multiple instances
   */
  router.post('/bundle/execute', async (req, res) => {
    try {
      const { bundleId, workflow, context } = req.body;
      
      const bundle = bundleRegistry.get(bundleId);
      if (!bundle) {
        return res.status(404).json({
          success: false,
          error: 'Bundle not found'
        });
      }
      
      const executionId = `exec-bundle-${Date.now()}`;
      const results = [];
      
      // Execute workflow across all servers in bundle
      for (const server of bundle.servers) {
        const result = await executeOnServer(server.id, workflow, context);
        results.push({
          serverId: server.id,
          serverName: server.name,
          result
        });
        
        // Record interconnection
        bundle.interconnections.push({
          from: context.previousServer || null,
          to: server.id,
          timestamp: new Date()
        });
      }
      
      bundle.executionCount++;
      
      recordEvent({
        type: 'bundle-execution',
        bundleId,
        executionId,
        serversUsed: bundle.servers.length,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        executionId,
        results
      });
      
    } catch (error) {
      console.error('Error executing bundle:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/mcp/bundle/list
   * List all bundles
   */
  router.get('/bundle/list', async (req, res) => {
    try {
      const bundles = Array.from(bundleRegistry.values()).map(b => ({
        id: b.id,
        name: b.name,
        serverCount: b.servers.length,
        executionCount: b.executionCount,
        interconnectionCount: b.interconnections.length,
        createdAt: b.createdAt
      }));
      
      res.json({
        success: true,
        bundles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ====================================
  // EVENT RECORDING & CONFIG OPTIMIZATION
  // ====================================

  /**
   * GET /api/mcp/events/analyze
   * Analyze recorded events to suggest optimal configs
   */
  router.get('/events/analyze', async (req, res) => {
    try {
      const { serverId, bundleId } = req.query;
      
      let relevantEvents = eventRecorder;
      
      if (serverId) {
        relevantEvents = relevantEvents.filter(e => e.serverId === parseInt(serverId));
      }
      
      if (bundleId) {
        relevantEvents = relevantEvents.filter(e => e.bundleId === bundleId);
      }
      
      const analysis = analyzeEvents(relevantEvents);
      
      res.json({
        success: true,
        analysis,
        eventCount: relevantEvents.length,
        recommendations: generateConfigRecommendations(analysis)
      });
      
    } catch (error) {
      console.error('Error analyzing events:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/mcp/config/optimize
   * Auto-generate optimal config based on event history
   */
  router.post('/config/optimize', async (req, res) => {
    try {
      const { serverId, bundleId } = req.body;
      
      // Get relevant events
      let events = eventRecorder;
      if (serverId) {
        events = events.filter(e => e.serverId === parseInt(serverId));
      }
      if (bundleId) {
        events = events.filter(e => e.bundleId === bundleId);
      }
      
      const analysis = analyzeEvents(events);
      const optimalConfig = generateOptimalConfig(analysis);
      
      // If serverId provided, update the server config
      if (serverId) {
        await db.query(
          `UPDATE mcp_servers 
           SET config = $1, updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(optimalConfig), serverId]
        );
      }
      
      recordEvent({
        type: 'config-optimized',
        serverId,
        bundleId,
        timestamp: new Date(),
        optimalConfig
      });
      
      res.json({
        success: true,
        optimalConfig,
        basedOnEvents: events.length,
        message: serverId ? 'Config applied to server' : 'Config generated'
      });
      
    } catch (error) {
      console.error('Error optimizing config:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/mcp/events/export
   * Export event history for external analysis
   */
  router.get('/events/export', async (req, res) => {
    try {
      const { format = 'json', startDate, endDate } = req.query;
      
      let events = eventRecorder;
      
      if (startDate) {
        events = events.filter(e => new Date(e.timestamp) >= new Date(startDate));
      }
      
      if (endDate) {
        events = events.filter(e => new Date(e.timestamp) <= new Date(endDate));
      }
      
      if (format === 'csv') {
        const csv = convertToCSV(events);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=mcp-events.csv');
        res.send(csv);
      } else {
        res.json({
          success: true,
          events,
          count: events.length
        });
      }
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ====================================
  // INTERACTIVE SCHEMA CONFIG EDITOR
  // ====================================

  /**
   * POST /api/mcp/schema-editor/session
   * Start an interactive schema editing session
   */
  router.post('/schema-editor/session', async (req, res) => {
    try {
      const { serverId, clientId } = req.body;
      
      const sessionId = `schema-edit-${serverId}-${Date.now()}`;
      
      // Set up WebSocket for real-time schema editing
      const editorNamespace = io.of(`/schema-editor/${sessionId}`);
      
      editorNamespace.on('connection', (socket) => {
        console.log(`Schema editor connected: ${sessionId}`);
        
        // Send current schemas
        db.query(
          `SELECT s.* FROM schemas s
           JOIN mcp_server_schemas msl ON s.id = msl.schema_id
           WHERE msl.server_id = $1`,
          [serverId]
        ).then(result => {
          socket.emit('schemas-loaded', result.rows);
        });
        
        // Handle schema updates
        socket.on('update-schema', async (data) => {
          try {
            const { schemaId, updates } = data;
            
            await db.query(
              `UPDATE schemas SET 
                schema_definition = $1,
                updated_at = NOW()
               WHERE id = $2`,
              [JSON.stringify(updates), schemaId]
            );
            
            // Broadcast to all connected editors
            editorNamespace.emit('schema-updated', {
              schemaId,
              updates,
              timestamp: new Date()
            });
            
            recordEvent({
              type: 'schema-edited',
              sessionId,
              schemaId,
              timestamp: new Date()
            });
            
          } catch (error) {
            socket.emit('error', { message: error.message });
          }
        });
        
        // Handle schema linking/unlinking
        socket.on('link-schema', async (data) => {
          try {
            const { schemaId } = data;
            
            await db.query(
              `INSERT INTO mcp_server_schemas (server_id, schema_id, linked_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT DO NOTHING`,
              [serverId, schemaId]
            );
            
            editorNamespace.emit('schema-linked', {
              serverId,
              schemaId,
              timestamp: new Date()
            });
            
          } catch (error) {
            socket.emit('error', { message: error.message });
          }
        });
        
        socket.on('unlink-schema', async (data) => {
          try {
            const { schemaId } = data;
            
            await db.query(
              `DELETE FROM mcp_server_schemas 
               WHERE server_id = $1 AND schema_id = $2`,
              [serverId, schemaId]
            );
            
            editorNamespace.emit('schema-unlinked', {
              serverId,
              schemaId,
              timestamp: new Date()
            });
            
          } catch (error) {
            socket.emit('error', { message: error.message });
          }
        });
      });
      
      res.json({
        success: true,
        sessionId,
        wsUrl: `/schema-editor/${sessionId}`
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ====================================
  // HELPER FUNCTIONS
  // ====================================

  function recordEvent(event) {
    eventRecorder.push(event);
    
    // Trim to max size
    if (eventRecorder.length > MAX_EVENTS) {
      eventRecorder.shift();
    }
    
    // Emit to monitoring systems
    mcpEventBus.emit('event-recorded', event);
  }

  async function processClientMessage(serverId, data) {
    // Process message through MCP server
    // This would integrate with the main MCP server logic
    return {
      processed: true,
      serverId,
      timestamp: new Date(),
      response: `Processed: ${JSON.stringify(data)}`
    };
  }

  async function executeOnServer(serverId, workflow, context) {
    // Execute workflow on specific server
    // This would integrate with the existing tool execution
    return {
      success: true,
      serverId,
      result: 'Workflow executed'
    };
  }

  function analyzeEvents(events) {
    const analysis = {
      totalEvents: events.length,
      eventTypes: {},
      avgExecutionTime: 0,
      successRate: 0,
      commonPatterns: []
    };
    
    // Count event types
    events.forEach(e => {
      analysis.eventTypes[e.type] = (analysis.eventTypes[e.type] || 0) + 1;
    });
    
    // Calculate metrics
    const executions = events.filter(e => e.type === 'bundle-execution');
    if (executions.length > 0) {
      analysis.avgExecutionTime = executions.reduce((sum, e) => 
        sum + (e.duration || 0), 0) / executions.length;
    }
    
    return analysis;
  }

  function generateConfigRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.avgExecutionTime > 1000) {
      recommendations.push({
        type: 'performance',
        message: 'Consider reducing max_tokens or temperature for faster execution',
        suggestedConfig: {
          max_tokens: 1500,
          temperature: 0.5
        }
      });
    }
    
    if (analysis.eventTypes['bundle-execution'] > 100) {
      recommendations.push({
        type: 'bundling',
        message: 'High bundle usage detected - consider creating permanent bundle',
        action: 'create-permanent-bundle'
      });
    }
    
    return recommendations;
  }

  function generateOptimalConfig(analysis) {
    // Generate optimal config based on analysis
    return {
      temperature: 0.7,
      max_tokens: 2000,
      bundling_enabled: analysis.eventTypes['bundle-execution'] > 50,
      streaming_enabled: analysis.eventTypes['client-message'] > 100,
      auto_optimize: true,
      generated_at: new Date(),
      based_on_events: analysis.totalEvents
    };
  }

  function convertToCSV(events) {
    if (events.length === 0) return '';
    
    const headers = Object.keys(events[0]);
    const rows = events.map(e => headers.map(h => 
      JSON.stringify(e[h] || '')).join(','));
    
    return [headers.join(','), ...rows].join('\n');
  }

  return router;
}

export default createMCPBidirectionalRoutes;
