/**
 * Real-Time Client API Routes
 * 
 * HTTP endpoints for managing real-time client connections
 * and content generation. WebSocket connections are handled
 * by RealTimeClientAPIService directly.
 */

import express from 'express';

const router = express.Router();

/**
 * Initialize routes with realtime service
 */
export function createRealtimeRoutes(realtimeService) {
  
  /**
   * GET /api/realtime/status
   * Get real-time service status
   */
  router.get('/status', (req, res) => {
    try {
      const stats = realtimeService.getStatistics();
      
      res.json({
        success: true,
        status: 'running',
        statistics: stats
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get status',
        message: error.message
      });
    }
  });

  /**
   * GET /api/realtime/clients
   * Get all connected clients
   */
  router.get('/clients', (req, res) => {
    try {
      const { siteId } = req.query;
      
      const clients = realtimeService.getConnectedClients(siteId || null);
      
      res.json({
        success: true,
        clients,
        total: clients.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get clients',
        message: error.message
      });
    }
  });

  /**
   * GET /api/realtime/sites
   * Get all monitored sites
   */
  router.get('/sites', (req, res) => {
    try {
      const sites = realtimeService.getAllSiteMonitors();
      
      res.json({
        success: true,
        sites,
        total: sites.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get sites',
        message: error.message
      });
    }
  });

  /**
   * GET /api/realtime/sites/:siteId
   * Get specific site monitor
   */
  router.get('/sites/:siteId', (req, res) => {
    try {
      const { siteId } = req.params;
      
      const monitor = realtimeService.getSiteMonitor(siteId);
      
      if (!monitor) {
        return res.status(404).json({
          error: 'Site not found',
          siteId
        });
      }
      
      res.json({
        success: true,
        monitor
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get site',
        message: error.message
      });
    }
  });

  /**
   * POST /api/realtime/command
   * Send command to a specific client
   */
  router.post('/command', (req, res) => {
    try {
      const { clientId, command, data } = req.body;
      
      if (!clientId || !command) {
        return res.status(400).json({
          error: 'clientId and command are required'
        });
      }
      
      realtimeService.sendCommand(clientId, command, data || {});
      
      res.json({
        success: true,
        message: 'Command sent',
        clientId,
        command
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to send command',
        message: error.message
      });
    }
  });

  /**
   * POST /api/realtime/broadcast
   * Broadcast message to all clients of a site
   */
  router.post('/broadcast', (req, res) => {
    try {
      const { siteId, event, data } = req.body;
      
      if (!siteId || !event) {
        return res.status(400).json({
          error: 'siteId and event are required'
        });
      }
      
      realtimeService.broadcastToSite(siteId, event, data || {});
      
      res.json({
        success: true,
        message: 'Message broadcasted',
        siteId,
        event
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to broadcast',
        message: error.message
      });
    }
  });

  /**
   * POST /api/realtime/optimization/send
   * Send optimization result to client
   */
  router.post('/optimization/send', (req, res) => {
    try {
      const { clientId, optimizationData } = req.body;
      
      if (!clientId || !optimizationData) {
        return res.status(400).json({
          error: 'clientId and optimizationData are required'
        });
      }
      
      realtimeService.sendOptimizationResult(clientId, optimizationData);
      
      res.json({
        success: true,
        message: 'Optimization sent',
        clientId
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to send optimization',
        message: error.message
      });
    }
  });

  /**
   * POST /api/realtime/content/stream
   * Stream content chunk to client
   */
  router.post('/content/stream', (req, res) => {
    try {
      const { streamId, chunk } = req.body;
      
      if (!streamId || !chunk) {
        return res.status(400).json({
          error: 'streamId and chunk are required'
        });
      }
      
      realtimeService.streamContentChunk(streamId, chunk);
      
      res.json({
        success: true,
        message: 'Chunk streamed',
        streamId
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to stream chunk',
        message: error.message
      });
    }
  });

  /**
   * POST /api/realtime/content/complete
   * Complete content stream
   */
  router.post('/content/complete', (req, res) => {
    try {
      const { streamId, metadata } = req.body;
      
      if (!streamId) {
        return res.status(400).json({
          error: 'streamId is required'
        });
      }
      
      realtimeService.completeContentStream(streamId, metadata || {});
      
      res.json({
        success: true,
        message: 'Stream completed',
        streamId
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to complete stream',
        message: error.message
      });
    }
  });

  return router;
}

export default router;
