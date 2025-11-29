/**
 * Advanced Data Mining API Routes
 * 
 * RESTful API endpoints for the Advanced Data Mining Orchestrator
 * Provides comprehensive CRUD operations for workflows, campaigns, and tools
 */

import express from 'express';
import AdvancedDataMiningOrchestrator from '../services/advanced-datamining-orchestrator.js';

const router = express.Router();

// Initialize orchestrator (will be injected via middleware)
let orchestrator = null;

/**
 * Middleware to initialize orchestrator
 */
export function initializeOrchestrator(config = {}) {
  orchestrator = new AdvancedDataMiningOrchestrator(config);
  return orchestrator;
}

/**
 * Middleware to ensure orchestrator is initialized
 */
function ensureOrchestrator(req, res, next) {
  if (!orchestrator) {
    orchestrator = new AdvancedDataMiningOrchestrator();
  }
  req.orchestrator = orchestrator;
  next();
}

router.use(ensureOrchestrator);

// =============================================================================
// TOOLS ENDPOINTS
// =============================================================================

/**
 * GET /api/datamining/tools
 * List all available data mining tools
 */
router.get('/tools', (req, res) => {
  try {
    const tools = orchestrator.listTools();
    res.json({
      success: true,
      tools,
      count: tools.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/datamining/tools/:toolId
 * Get details about a specific tool
 */
router.get('/tools/:toolId', (req, res) => {
  try {
    const tools = orchestrator.listTools();
    const tool = tools.find(t => t.id === req.params.toolId);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    res.json({
      success: true,
      tool
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// WORKFLOW ENDPOINTS
// =============================================================================

/**
 * POST /api/datamining/workflows
 * Create a new workflow
 * 
 * Body:
 * {
 *   "name": "My Workflow",
 *   "description": "Description",
 *   "steps": [
 *     {
 *       "name": "Step 1",
 *       "tool": "puppeteer-scraper",
 *       "config": { "url": "https://example.com" }
 *     }
 *   ]
 * }
 */
router.post('/workflows', async (req, res) => {
  try {
    const workflow = await orchestrator.createWorkflow(req.body);
    res.status(201).json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/datamining/workflows
 * List all workflows
 */
router.get('/workflows', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const workflows = api.listWorkflows();
    
    res.json({
      success: true,
      workflows,
      count: workflows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/datamining/workflows/:workflowId
 * Get a specific workflow
 */
router.get('/workflows/:workflowId', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const workflow = api.getWorkflow(req.params.workflowId);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/datamining/workflows/:workflowId
 * Update a workflow
 */
router.put('/workflows/:workflowId', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const workflow = api.updateWorkflow(req.params.workflowId, req.body);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/datamining/workflows/:workflowId
 * Delete a workflow
 */
router.delete('/workflows/:workflowId', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const deleted = api.deleteWorkflow(req.params.workflowId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/datamining/workflows/:workflowId/execute
 * Execute a workflow
 */
router.post('/workflows/:workflowId/execute', async (req, res) => {
  try {
    const result = await orchestrator.executeWorkflow(
      req.params.workflowId,
      req.body.options || {}
    );
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// CAMPAIGN ENDPOINTS
// =============================================================================

/**
 * POST /api/datamining/campaigns
 * Create a new campaign (bundle of workflows)
 * 
 * Body:
 * {
 *   "name": "SEO Campaign",
 *   "description": "Comprehensive SEO analysis",
 *   "workflows": [
 *     {
 *       "name": "Competitor Analysis",
 *       "steps": [...]
 *     }
 *   ]
 * }
 */
router.post('/campaigns', async (req, res) => {
  try {
    const campaign = await orchestrator.createCampaign(req.body);
    res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/datamining/campaigns
 * List all campaigns
 */
router.get('/campaigns', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const campaigns = api.listCampaigns();
    
    res.json({
      success: true,
      campaigns,
      count: campaigns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/datamining/campaigns/:campaignId
 * Get a specific campaign
 */
router.get('/campaigns/:campaignId', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const campaign = api.getCampaign(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/datamining/campaigns/:campaignId
 * Update a campaign
 */
router.put('/campaigns/:campaignId', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const campaign = api.updateCampaign(req.params.campaignId, req.body);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/datamining/campaigns/:campaignId
 * Delete a campaign
 */
router.delete('/campaigns/:campaignId', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const deleted = api.deleteCampaign(req.params.campaignId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/datamining/campaigns/:campaignId/execute
 * Execute a campaign
 */
router.post('/campaigns/:campaignId/execute', async (req, res) => {
  try {
    const result = await orchestrator.executeCampaign(
      req.params.campaignId,
      req.body.options || {}
    );
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// COMPONENT GENERATION ENDPOINTS
// =============================================================================

/**
 * POST /api/datamining/components/generate
 * Generate visual components from CRUD API definition
 * 
 * Body:
 * {
 *   "entityName": "Workflow",
 *   "fields": [
 *     { "name": "name", "type": "string", "required": true },
 *     { "name": "description", "type": "text" }
 *   ]
 * }
 */
router.post('/components/generate', (req, res) => {
  try {
    const { entityName, fields, options = {} } = req.body;
    
    if (!entityName || !fields) {
      return res.status(400).json({
        success: false,
        error: 'entityName and fields are required'
      });
    }

    const component = generateCRUDComponent(entityName, fields, options);
    
    res.json({
      success: true,
      component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/datamining/components/generate-from-workflow
 * Generate components from an existing workflow definition
 */
router.post('/components/generate-from-workflow', (req, res) => {
  try {
    const { workflowId } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId is required'
      });
    }

    const api = orchestrator.getCRUDAPI();
    const workflow = api.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Generate components based on workflow configuration
    const components = generateWorkflowComponents(workflow);
    
    res.json({
      success: true,
      components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

/**
 * GET /api/datamining/analytics/summary
 * Get overall analytics summary
 */
router.get('/analytics/summary', (req, res) => {
  try {
    const api = orchestrator.getCRUDAPI();
    const workflows = api.listWorkflows();
    const campaigns = api.listCampaigns();
    
    const summary = {
      workflows: {
        total: workflows.length,
        completed: workflows.filter(w => w.status === 'completed').length,
        running: workflows.filter(w => w.status === 'running').length,
        failed: workflows.filter(w => w.status === 'failed').length
      },
      campaigns: {
        total: campaigns.length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        running: campaigns.filter(c => c.status === 'running').length,
        failed: campaigns.filter(c => c.status === 'failed').length
      },
      tools: {
        total: orchestrator.listTools().length
      }
    };
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate CRUD component definition
 */
function generateCRUDComponent(entityName, fields, options = {}) {
  const componentName = `${entityName}Manager`;
  
  return {
    name: componentName,
    type: 'crud-manager',
    entity: entityName,
    fields,
    components: {
      list: generateListComponent(entityName, fields, options),
      create: generateCreateComponent(entityName, fields, options),
      edit: generateEditComponent(entityName, fields, options),
      view: generateViewComponent(entityName, fields, options)
    },
    api: {
      list: `/api/datamining/${entityName.toLowerCase()}s`,
      create: `/api/datamining/${entityName.toLowerCase()}s`,
      update: `/api/datamining/${entityName.toLowerCase()}s/:id`,
      delete: `/api/datamining/${entityName.toLowerCase()}s/:id`,
      view: `/api/datamining/${entityName.toLowerCase()}s/:id`
    }
  };
}

function generateListComponent(entityName, fields, options) {
  return {
    type: 'list',
    name: `${entityName}List`,
    columns: fields.map(f => ({
      key: f.name,
      title: f.label || f.name,
      type: f.type,
      sortable: f.sortable !== false
    })),
    actions: ['view', 'edit', 'delete'],
    pagination: options.pagination !== false,
    search: options.search !== false,
    filters: fields.filter(f => f.filterable).map(f => ({
      field: f.name,
      type: f.filterType || f.type
    }))
  };
}

function generateCreateComponent(entityName, fields, options) {
  return {
    type: 'create',
    name: `${entityName}Create`,
    fields: fields.map(f => ({
      name: f.name,
      label: f.label || f.name,
      type: f.type,
      required: f.required || false,
      validation: f.validation || null,
      placeholder: f.placeholder || `Enter ${f.label || f.name}`,
      helpText: f.helpText || null
    })),
    submitText: options.submitText || `Create ${entityName}`,
    cancelText: options.cancelText || 'Cancel'
  };
}

function generateEditComponent(entityName, fields, options) {
  return {
    type: 'edit',
    name: `${entityName}Edit`,
    fields: fields.map(f => ({
      name: f.name,
      label: f.label || f.name,
      type: f.type,
      required: f.required || false,
      validation: f.validation || null,
      placeholder: f.placeholder || `Enter ${f.label || f.name}`,
      helpText: f.helpText || null,
      disabled: f.editable === false
    })),
    submitText: options.submitText || `Update ${entityName}`,
    cancelText: options.cancelText || 'Cancel'
  };
}

function generateViewComponent(entityName, fields, options) {
  return {
    type: 'view',
    name: `${entityName}View`,
    fields: fields.map(f => ({
      name: f.name,
      label: f.label || f.name,
      type: f.type,
      format: f.format || null
    })),
    actions: ['edit', 'delete', 'back']
  };
}

/**
 * Generate components from workflow configuration
 */
function generateWorkflowComponents(workflow) {
  const components = [];
  
  // Generate a workflow visualizer component
  components.push({
    type: 'workflow-visualizer',
    name: 'WorkflowVisualizer',
    workflow: {
      id: workflow.id,
      name: workflow.name,
      steps: workflow.steps.map(step => ({
        name: step.name,
        tool: step.tool,
        status: 'pending'
      }))
    }
  });
  
  // Generate step configuration components
  for (const step of workflow.steps) {
    components.push({
      type: 'step-configurator',
      name: `${step.name}Configurator`,
      step: {
        name: step.name,
        tool: step.tool,
        config: step.config
      }
    });
  }
  
  // Generate results viewer component
  components.push({
    type: 'results-viewer',
    name: 'WorkflowResultsViewer',
    workflow: {
      id: workflow.id,
      name: workflow.name
    }
  });
  
  return components;
}

export default router;
export { initializeOrchestrator };
