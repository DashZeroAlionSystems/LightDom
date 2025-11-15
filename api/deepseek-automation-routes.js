/**
 * DeepSeek Automation API Routes
 * 
 * REST API for DeepSeek automation system:
 * - System status and health
 * - Service monitoring and management
 * - Memory queries
 * - Workflow execution
 * - Error analysis
 * - CI/CD operations
 */

import express from 'express';

const router = express.Router();

// Import orchestrator (will be initialized by API server)
let orchestrator = null;

export function setOrchestrator(orch) {
  orchestrator = orch;
}

// ============================================================================
// SYSTEM STATUS
// ============================================================================

router.get('/status', async (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(503).json({ error: 'Orchestrator not initialized' });
    }

    const status = await orchestrator.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health', async (req, res) => {
  try {
    if (!orchestrator || !orchestrator.isRunning) {
      return res.status(503).json({ healthy: false, error: 'Not running' });
    }

    res.json({ healthy: true, uptime: Date.now() - orchestrator.startTime });
  } catch (error) {
    res.status(500).json({ healthy: false, error: error.message });
  }
});

// ============================================================================
// SERVICE MANAGEMENT
// ============================================================================

router.get('/services', async (req, res) => {
  try {
    const services = await orchestrator.monitorAllServices();
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services/:name/status', async (req, res) => {
  try {
    const service = orchestrator.services.get(req.params.name);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/services/:name/restart', async (req, res) => {
  try {
    const service = orchestrator.services.get(req.params.name);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (!service.restart) {
      return res.status(400).json({ error: 'Service cannot be restarted' });
    }

    await service.restart();
    res.json({ success: true, message: `Service ${req.params.name} restarted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// MEMORY SYSTEM
// ============================================================================

router.get('/memory/tasks', async (req, res) => {
  try {
    const { pattern, limit = 10 } = req.query;
    
    const episodes = await orchestrator.memory.recallEpisodes(pattern || '', parseInt(limit));
    res.json({ episodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memory/solutions', async (req, res) => {
  try {
    const { pattern } = req.query;
    
    if (pattern) {
      const solution = await orchestrator.memory.recallSolution(pattern);
      res.json({ solution });
    } else {
      const stats = await orchestrator.memory.getStatistics();
      res.json({ statistics: stats });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/memory/learn', async (req, res) => {
  try {
    const { taskId, feedback } = req.body;
    
    await orchestrator.memory.learn(taskId, feedback);
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

router.post('/workflows/execute', async (req, res) => {
  try {
    const { workflow, params } = req.body;
    
    if (!workflow) {
      return res.status(400).json({ error: 'Workflow name required' });
    }

    const result = await orchestrator.executeWorkflow(workflow, params);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workflows/active', async (req, res) => {
  try {
    const query = 'SELECT * FROM deepseek_workflows WHERE status = $1 ORDER BY created_at DESC';
    const result = await orchestrator.db.query(query, ['running']);
    
    res.json({ workflows: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workflows/:id/status', async (req, res) => {
  try {
    const query = 'SELECT * FROM deepseek_workflows WHERE workflow_id = $1';
    const result = await orchestrator.db.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ERROR ANALYSIS
// ============================================================================

router.post('/errors/analyze', async (req, res) => {
  try {
    const { error } = req.body;
    
    if (!error) {
      return res.status(400).json({ error: 'Error message required' });
    }

    await orchestrator.analyzeAndFixError(error);
    res.json({ success: true, message: 'Error analysis started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/errors/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT * FROM deepseek_errors
      ORDER BY timestamp DESC
      LIMIT $1
    `;
    
    const result = await orchestrator.db.query(query, [parseInt(limit)]);
    res.json({ errors: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CI/CD OPERATIONS
// ============================================================================

router.post('/deploy/dev', async (req, res) => {
  try {
    const { branchName } = req.body;
    
    if (!branchName) {
      return res.status(400).json({ error: 'Branch name required' });
    }

    const result = await orchestrator.cicd.deployToDev(branchName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/deploy/staging', async (req, res) => {
  try {
    const { branchName } = req.body;
    
    if (!branchName) {
      return res.status(400).json({ error: 'Branch name required' });
    }

    const result = await orchestrator.cicd.deployToStaging(branchName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/deploy/production', async (req, res) => {
  try {
    const { branchName, strategy, rollbackOnError } = req.body;
    
    if (!branchName) {
      return res.status(400).json({ error: 'Branch name required' });
    }

    const result = await orchestrator.cicd.deployToProduction(branchName, {
      strategy,
      rollbackOnError
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/deploy/rollback', async (req, res) => {
  try {
    const { deploymentId } = req.body;
    
    if (!deploymentId) {
      return res.status(400).json({ error: 'Deployment ID required' });
    }

    await orchestrator.cicd.rollback(deploymentId);
    res.json({ success: true, message: 'Rollback complete' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/deploy/status', async (req, res) => {
  try {
    const active = orchestrator.cicd.getActiveDeployments();
    const history = orchestrator.cicd.getDeploymentHistory();
    
    res.json({ active, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
