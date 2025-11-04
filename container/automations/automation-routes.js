/**
 * Campaign Automation API Routes
 * 
 * Endpoints for running complex multi-step automations
 */

import express from 'express';
import CampaignAutomationOrchestrator from './campaign-automation-orchestrator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize orchestrator (will be configured with services in main server)
let orchestrator = null;

/**
 * Initialize with services
 */
function initializeOrchestrator(services) {
  orchestrator = new CampaignAutomationOrchestrator(services);
  
  // Set up event listeners
  orchestrator.on('automation:started', (data) => {
    console.log(`[Automation] Started: ${data.name} (${data.automationId})`);
  });
  
  orchestrator.on('task:started', (data) => {
    console.log(`[Automation] Task started: ${data.taskName} (${data.taskId})`);
  });
  
  orchestrator.on('task:completed', (data) => {
    console.log(`[Automation] Task completed: ${data.taskId}`);
  });
  
  orchestrator.on('task:failed', (data) => {
    console.error(`[Automation] Task failed: ${data.taskId} - ${data.error}`);
  });
  
  orchestrator.on('automation:completed', (data) => {
    console.log(`[Automation] Completed: ${data.automationId} in ${data.duration}ms`);
  });
  
  orchestrator.on('automation:failed', (data) => {
    console.error(`[Automation] Failed: ${data.automationId} - ${data.error}`);
  });
  
  return orchestrator;
}

/**
 * Load automation config from file
 */
async function loadConfig(configName) {
  const configPath = path.join(__dirname, 'configs', `${configName}.json`);
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

/**
 * POST /api/automations/run/:configName
 * Run a predefined automation
 */
router.post('/run/:configName', async (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(500).json({ error: 'Orchestrator not initialized' });
    }
    
    const { configName } = req.params;
    const context = req.body.context || {};
    
    // Load config
    const config = await loadConfig(configName);
    
    // Run automation (async, don't wait)
    const automationPromise = orchestrator.runAutomation(config, context);
    
    // Return immediately with automation ID
    const automationStatus = Array.from(orchestrator.runningAutomations.values())
      .find(a => a.name === config.name);
    
    if (automationStatus) {
      res.json({
        success: true,
        automationId: automationStatus.id,
        name: config.name,
        status: 'running',
        message: 'Automation started successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'Automation queued'
      });
    }
    
  } catch (error) {
    console.error('Automation run error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/automations/run-custom
 * Run a custom automation config
 */
router.post('/run-custom', async (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(500).json({ error: 'Orchestrator not initialized' });
    }
    
    const { config, context } = req.body;
    
    if (!config || !config.tasks) {
      return res.status(400).json({ error: 'Invalid automation config' });
    }
    
    // Run automation
    const result = await orchestrator.runAutomation(config, context || {});
    
    res.json(result);
    
  } catch (error) {
    console.error('Custom automation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/status/:automationId
 * Get automation status
 */
router.get('/status/:automationId', (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(500).json({ error: 'Orchestrator not initialized' });
    }
    
    const { automationId } = req.params;
    const status = orchestrator.getAutomationStatus(automationId);
    
    if (!status) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    res.json({ automation: status });
    
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/metrics
 * Get orchestrator metrics
 */
router.get('/metrics', (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(500).json({ error: 'Orchestrator not initialized' });
    }
    
    const metrics = orchestrator.getMetrics();
    res.json({ metrics });
    
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/history
 * Get automation history
 */
router.get('/history', (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(500).json({ error: 'Orchestrator not initialized' });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const history = orchestrator.getHistory(limit);
    
    res.json({ history });
    
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/configs
 * List available automation configs
 */
router.get('/configs', async (req, res) => {
  try {
    const configsDir = path.join(__dirname, 'configs');
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
    
    res.json({ configs });
    
  } catch (error) {
    console.error('List configs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/running
 * Get all running automations
 */
router.get('/running', (req, res) => {
  try {
    if (!orchestrator) {
      return res.status(500).json({ error: 'Orchestrator not initialized' });
    }
    
    const running = Array.from(orchestrator.runningAutomations.values());
    res.json({ automations: running });
    
  } catch (error) {
    console.error('Get running error:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router, initializeOrchestrator };
