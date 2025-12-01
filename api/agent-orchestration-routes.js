/**
 * Agent Orchestration API Routes
 * 
 * REST API endpoints for agent orchestration services
 */

import express from 'express';

const router = express.Router();

/**
 * Initialize routes with orchestration service
 */
export function createAgentOrchestrationRoutes(orchestrationService) {
  
  // Get orchestration status
  router.get('/status', (req, res) => {
    try {
      const status = orchestrationService.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get service health status
  router.get('/health', async (req, res) => {
    try {
      const healthCheck = orchestrationService.getService('healthCheck');
      
      if (!healthCheck) {
        return res.status(503).json({ error: 'Health check service not available' });
      }
      
      const status = healthCheck.getHealthStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get specific service status
  router.get('/health/:serviceId', async (req, res) => {
    try {
      const healthCheck = orchestrationService.getService('healthCheck');
      
      if (!healthCheck) {
        return res.status(503).json({ error: 'Health check service not available' });
      }
      
      const status = healthCheck.getServiceStatus(req.params.serviceId);
      res.json(status);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });
  
  // Create investigation context for error
  router.post('/investigate/error/:errorReportId', async (req, res) => {
    try {
      const result = await orchestrationService.handleErrorReport(req.params.errorReportId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create investigation context for feature
  router.post('/investigate/feature', async (req, res) => {
    try {
      const { description, components = [] } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Description required' });
      }
      
      const result = await orchestrationService.handleFeatureRequest(description, components);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Queue agent task
  router.post('/agent/task', async (req, res) => {
    try {
      const agentSpawner = orchestrationService.getService('agentSpawner');
      
      if (!agentSpawner) {
        return res.status(503).json({ error: 'Agent spawner not available' });
      }
      
      const { type, priority, context } = req.body;
      
      if (!type || !context) {
        return res.status(400).json({ error: 'Type and context required' });
      }
      
      const taskId = await agentSpawner.queueTask({
        type,
        priority: priority || 5,
        context,
      });
      
      res.json({ taskId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get agent task status
  router.get('/agent/task/:taskId', async (req, res) => {
    try {
      const agentSpawner = orchestrationService.getService('agentSpawner');
      
      if (!agentSpawner) {
        return res.status(503).json({ error: 'Agent spawner not available' });
      }
      
      // Query task from database
      const db = orchestrationService.config.db;
      const result = await db.query(
        'SELECT * FROM deepseek_agent_tasks WHERE id = $1',
        [req.params.taskId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get agent status
  router.get('/agent/:agentId', async (req, res) => {
    try {
      const agentSpawner = orchestrationService.getService('agentSpawner');
      
      if (!agentSpawner) {
        return res.status(503).json({ error: 'Agent spawner not available' });
      }
      
      const agent = agentSpawner.getAgentStatus(req.params.agentId);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get active agents
  router.get('/agents/active', async (req, res) => {
    try {
      const agentSpawner = orchestrationService.getService('agentSpawner');
      
      if (!agentSpawner) {
        return res.status(503).json({ error: 'Agent spawner not available' });
      }
      
      const agents = agentSpawner.getActiveAgents();
      res.json({ agents });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get task queue status
  router.get('/queue/status', async (req, res) => {
    try {
      const agentSpawner = orchestrationService.getService('agentSpawner');
      
      if (!agentSpawner) {
        return res.status(503).json({ error: 'Agent spawner not available' });
      }
      
      const status = agentSpawner.getQueueStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create GitHub issue from error
  router.post('/github/issue/error/:errorReportId', async (req, res) => {
    try {
      const github = orchestrationService.getService('github');
      
      if (!github) {
        return res.status(503).json({ error: 'GitHub automation not available' });
      }
      
      const issue = await github.createIssueFromError(req.params.errorReportId);
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create GitHub issue from task
  router.post('/github/issue/task', async (req, res) => {
    try {
      const github = orchestrationService.getService('github');
      
      if (!github) {
        return res.status(503).json({ error: 'GitHub automation not available' });
      }
      
      const { description, options = {} } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Description required' });
      }
      
      const issue = await github.createIssueFromTask(description, options);
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Trigger Git sync
  router.post('/git/sync', async (req, res) => {
    try {
      const gitBridge = orchestrationService.getService('gitMcpBridge');
      
      if (!gitBridge) {
        return res.status(503).json({ error: 'Git MCP bridge not available' });
      }
      
      await gitBridge.syncWithGitHub();
      
      const status = await gitBridge.getSyncStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get Git sync status
  router.get('/git/status', async (req, res) => {
    try {
      const gitBridge = orchestrationService.getService('gitMcpBridge');
      
      if (!gitBridge) {
        return res.status(503).json({ error: 'Git MCP bridge not available' });
      }
      
      const status = await gitBridge.getSyncStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
}

export default createAgentOrchestrationRoutes;
