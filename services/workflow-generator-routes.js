/**
 * Workflow Generator API Routes
 * Endpoints for setup/settings management and self-generating workflows
 */

import express from 'express';
import ConfigurationManager from './configuration-manager.js';
import WorkflowGenerator from './workflow-generator.js';

const router = express.Router();

// Singleton instances
let configManager = null;
let workflowGenerator = null;

function getConfigManager() {
  if (!configManager) {
    configManager = new ConfigurationManager();
  }
  return configManager;
}

function getWorkflowGenerator() {
  if (!workflowGenerator) {
    workflowGenerator = new WorkflowGenerator();
  }
  return workflowGenerator;
}

/**
 * GET /api/workflow-generator/config/summary
 * Get summary of all configurations
 */
router.get('/config/summary', async (req, res) => {
  try {
    const manager = getConfigManager();
    const summary = await manager.getConfigurationSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflow-generator/settings
 * List all settings
 */
router.get('/settings', async (req, res) => {
  try {
    const manager = getConfigManager();
    const settings = await manager.listSettings();
    
    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflow-generator/settings/:name
 * Get a specific setting
 */
router.get('/settings/:name', async (req, res) => {
  try {
    const manager = getConfigManager();
    const setting = await manager.loadSetting(req.params.name);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/settings
 * Save a new setting
 */
router.post('/settings', async (req, res) => {
  try {
    const { name, ...config } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Setting name is required'
      });
    }
    
    const manager = getConfigManager();
    const setting = await manager.saveSetting(name, config);
    
    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflow-generator/setups
 * List all setups
 */
router.get('/setups', async (req, res) => {
  try {
    const manager = getConfigManager();
    const setups = await manager.listSetups();
    
    res.json({
      success: true,
      data: { setups }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflow-generator/setups/:name
 * Get a specific setup
 */
router.get('/setups/:name', async (req, res) => {
  try {
    const manager = getConfigManager();
    const setup = await manager.loadSetup(req.params.name);
    
    if (!setup) {
      return res.status(404).json({
        success: false,
        error: 'Setup not found'
      });
    }
    
    res.json({
      success: true,
      data: setup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/setups
 * Save a new setup
 */
router.post('/setups', async (req, res) => {
  try {
    const { name, ...config } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Setup name is required'
      });
    }
    
    const manager = getConfigManager();
    const setup = await manager.saveSetup(name, config);
    
    res.json({
      success: true,
      data: setup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/generate
 * Generate a workflow from a prompt
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }
    
    const generator = getWorkflowGenerator();
    const workflow = await generator.generateWorkflowFromPrompt(prompt);
    
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Workflow generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/execute/:name
 * Execute a generated workflow
 */
router.post('/execute/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const userInputs = req.body || {};
    
    const generator = getWorkflowGenerator();
    const result = await generator.executeGeneratedWorkflow(name, userInputs);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflow-generator/config/:name
 * Get workflow configuration file
 */
router.get('/config/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const generator = getWorkflowGenerator();
    const config = await generator.generateWorkflowConfig(name);
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/self-generating
 * Create a self-generating workflow
 */
router.post('/self-generating', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Workflow prompt is required'
      });
    }
    
    const manager = getConfigManager();
    const workflow = await manager.createSelfGeneratingWorkflow(
      { name: prompt.name || prompt },
      options
    );
    
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/bundle/component
 * Bundle atoms into a component
 */
router.post('/bundle/component', async (req, res) => {
  try {
    const { name, atoms, ...config } = req.body;
    
    if (!name || !atoms) {
      return res.status(400).json({
        success: false,
        error: 'Component name and atoms are required'
      });
    }
    
    const manager = getConfigManager();
    const component = await manager.bundleAtomsToComponent(name, atoms, config);
    
    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/bundle/dashboard
 * Bundle components into a dashboard
 */
router.post('/bundle/dashboard', async (req, res) => {
  try {
    const { name, components, layout } = req.body;
    
    if (!name || !components) {
      return res.status(400).json({
        success: false,
        error: 'Dashboard name and components are required'
      });
    }
    
    const manager = getConfigManager();
    const dashboard = await manager.bundleComponentsToDashboard(name, components, layout);
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflow-generator/bundle/workflow
 * Bundle dashboards into a workflow
 */
router.post('/bundle/workflow', async (req, res) => {
  try {
    const { name, dashboards, triggers, automation } = req.body;
    
    if (!name || !dashboards) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name and dashboards are required'
      });
    }
    
    const manager = getConfigManager();
    const workflow = await manager.bundleDashboardsToWorkflow(
      name,
      dashboards,
      triggers,
      automation
    );
    
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflow-generator/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'workflow-generator',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
