#!/usr/bin/env node

/**
 * Agent Orchestration API Routes
 * 
 * Express routes for agent-driven workflows:
 * - POST /api/agent/orchestrate - Execute workflow from prompt
 * - GET /api/agent/workflows - Get workflow history
 * - GET /api/agent/workflows/:id - Get workflow details
 * - GET /api/agent/components - Get component registry
 * - POST /api/agent/components/generate - Generate component
 * - GET /api/agent/schemas - List available schemas
 */

import express from 'express';
import { AgentWorkflowOrchestrator } from './agent-workflow-orchestrator.js';
import { AtomicComponentGenerator } from './atomic-component-generator.js';

const router = express.Router();

// Initialize services
let orchestrator;
let componentGenerator;

/**
 * Initialize agent services
 */
export async function initializeAgentServices(config = {}) {
  console.log('🚀 Initializing Agent Orchestration Services...');
  
  orchestrator = new AgentWorkflowOrchestrator(config);
  await orchestrator.initialize();
  
  componentGenerator = new AtomicComponentGenerator(config.components);
  await componentGenerator.initialize();
  
  console.log('✅ Agent services initialized');
}

/**
 * POST /api/agent/orchestrate
 * Execute workflow from natural language prompt
 */
router.post('/orchestrate', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log(`📝 Executing workflow from prompt: ${prompt}`);
    
    const result = await orchestrator.executeFromPrompt(prompt, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/workflows
 * Get workflow history
 */
router.get('/workflows', async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    
    let workflows = orchestrator.getWorkflowHistory(parseInt(limit as string));
    
    if (status) {
      workflows = workflows.filter(w => w.status === status);
    }
    
    res.json({
      success: true,
      data: {
        workflows,
        total: workflows.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/workflows/:id
 * Get specific workflow details
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const workflow = orchestrator.getWorkflowStatus(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      data: workflow
    });
    
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/workflows/active
 * Get active workflows
 */
router.get('/workflows/active', async (req, res) => {
  try {
    const activeWorkflows = orchestrator.getActiveWorkflows();
    
    res.json({
      success: true,
      data: {
        workflows: activeWorkflows,
        count: activeWorkflows.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching active workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/components
 * Get component registry
 */
router.get('/components', async (req, res) => {
  try {
    const registry = componentGenerator.getRegistry();
    
    res.json({
      success: true,
      data: {
        components: registry,
        total: registry.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/components/generate
 * Generate component from schema
 */
router.post('/components/generate', async (req, res) => {
  try {
    const { componentName, options = {} } = req.body;
    
    if (!componentName) {
      return res.status(400).json({
        success: false,
        error: 'Component name is required'
      });
    }

    console.log(`🔨 Generating component: ${componentName}`);
    
    const result = await componentGenerator.generateComponent(componentName, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Component generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/components/generate-all
 * Generate all components from schemas
 */
router.post('/components/generate-all', async (req, res) => {
  try {
    const { options = {} } = req.body;

    console.log('🔨 Generating all components...');
    
    const results = await componentGenerator.generateAll(options);
    
    const successful = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful,
          failed: results.length - successful
        }
      }
    });
    
  } catch (error) {
    console.error('Bulk generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/schemas
 * List available component schemas
 */
router.get('/schemas', async (req, res) => {
  try {
    const { category, type } = req.query;
    
    let schemas = Array.from(componentGenerator.schemaCache.values());
    
    if (category) {
      schemas = schemas.filter(s => s['lightdom:category'] === category);
    }
    
    if (type) {
      schemas = schemas.filter(s => s['lightdom:componentType'] === type);
    }
    
    res.json({
      success: true,
      data: {
        schemas,
        total: schemas.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/stats
 * Get orchestration statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const workflows = orchestrator.getWorkflowHistory(1000);
    const activeWorkflows = orchestrator.getActiveWorkflows();
    const components = componentGenerator.getRegistry();
    
    const completed = workflows.filter(w => w.status === 'completed').length;
    const failed = workflows.filter(w => w.status === 'failed').length;
    
    const stats = {
      workflows: {
        total: workflows.length,
        active: activeWorkflows.length,
        completed,
        failed,
        successRate: workflows.length > 0 ? Math.round((completed / workflows.length) * 100) : 0
      },
      components: {
        total: components.length,
        generated: components.filter(c => c.generated).length,
        pending: components.filter(c => !c.generated).length
      },
      intents: {}
    };
    
    // Count by intent type
    workflows.forEach(w => {
      const type = w.intent?.type || 'unknown';
      stats.intents[type] = (stats.intents[type] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    services: {
      orchestrator: !!orchestrator,
      componentGenerator: !!componentGenerator
    }
  });
});

export { router as agentOrchestratorRoutes };
export default router;
