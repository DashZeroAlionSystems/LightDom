/**
 * Workflow Hierarchy API Routes
 * 
 * Complete CRUD endpoints for:
 * - Workflows with hierarchy
 * - Services bundled in workflows
 * - Real-time data streams
 * - Dashboards
 * - DeepSeek workflow generation
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Import the CRUD service (will be lazy-loaded)
let WorkflowHierarchyCRUDService;
let DeepSeekIntegrationService;
let crudService;

// Initialize services
async function initServices() {
  if (!crudService) {
    try {
      const { default: CRUDService } = await import('../src/services/workflow-hierarchy-crud.service');
      const { DeepSeekIntegrationService: DSService } = await import('../src/services/deepseek-integration.service');
      
      WorkflowHierarchyCRUDService = CRUDService;
      DeepSeekIntegrationService = DSService;
      
      const deepseek = new DSService(pool);
      crudService = new WorkflowHierarchyCRUDService(pool, deepseek);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }
  return crudService;
}

// ===================================================================
// WORKFLOW CRUD ENDPOINTS
// ===================================================================

/**
 * GET /api/workflow-hierarchy/workflows
 * List all workflows with optional filtering
 */
router.get('/workflows', async (req, res) => {
  try {
    const service = await initServices();
    const { parent_id, category, status, hierarchy_level, limit, offset } = req.query;

    const workflows = await service.listWorkflows({
      parent_id: parent_id as string,
      category: category as string,
      status: status as string,
      hierarchy_level: hierarchy_level ? parseInt(hierarchy_level as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({
      success: true,
      count: workflows.length,
      workflows
    });
  } catch (error) {
    console.error('Error listing workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list workflows',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-hierarchy/workflows/:id
 * Get a specific workflow by ID
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const service = await initServices();
    const workflow = await service.getWorkflow(req.params.id);

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
    console.error('Error getting workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-hierarchy/workflows/:id/complete
 * Get complete workflow with all related entities
 */
router.get('/workflows/:id/complete', async (req, res) => {
  try {
    const service = await initServices();
    const complete = await service.getWorkflowComplete(req.params.id);

    if (!complete) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      workflow: complete
    });
  } catch (error) {
    console.error('Error getting complete workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get complete workflow',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow-hierarchy/workflows
 * Create a new workflow
 */
router.post('/workflows', async (req, res) => {
  try {
    const service = await initServices();
    const workflow = await service.createWorkflow(req.body);

    res.status(201).json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow',
      details: error.message
    });
  }
});

/**
 * PUT /api/workflow-hierarchy/workflows/:id
 * Update a workflow
 */
router.put('/workflows/:id', async (req, res) => {
  try {
    const service = await initServices();
    const workflow = await service.updateWorkflow(req.params.id, req.body);

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workflow',
      details: error.message
    });
  }
});

/**
 * DELETE /api/workflow-hierarchy/workflows/:id
 * Delete a workflow
 */
router.delete('/workflows/:id', async (req, res) => {
  try {
    const service = await initServices();
    const deleted = await service.deleteWorkflow(req.params.id);

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
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workflow',
      details: error.message
    });
  }
});

// ===================================================================
// HIERARCHY NAVIGATION ENDPOINTS
// ===================================================================

/**
 * GET /api/workflow-hierarchy/roots
 * Get all root-level workflows
 */
router.get('/roots', async (req, res) => {
  try {
    const service = await initServices();
    const roots = await service.getRootWorkflows();

    res.json({
      success: true,
      count: roots.length,
      workflows: roots
    });
  } catch (error) {
    console.error('Error getting root workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get root workflows',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-hierarchy/workflows/:id/children
 * Get child workflows
 */
router.get('/workflows/:id/children', async (req, res) => {
  try {
    const service = await initServices();
    const children = await service.getWorkflowChildren(req.params.id);

    res.json({
      success: true,
      count: children.length,
      workflows: children
    });
  } catch (error) {
    console.error('Error getting child workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get child workflows',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-hierarchy/workflows/:id/ancestors
 * Get ancestor workflows (breadcrumb trail)
 */
router.get('/workflows/:id/ancestors', async (req, res) => {
  try {
    const service = await initServices();
    const ancestors = await service.getWorkflowAncestors(req.params.id);

    res.json({
      success: true,
      count: ancestors.length,
      workflows: ancestors
    });
  } catch (error) {
    console.error('Error getting ancestor workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ancestor workflows',
      details: error.message
    });
  }
});

// ===================================================================
// SERVICE CRUD ENDPOINTS
// ===================================================================

/**
 * GET /api/workflow-hierarchy/workflows/:id/services
 * List all services for a workflow
 */
router.get('/workflows/:id/services', async (req, res) => {
  try {
    const service = await initServices();
    const services = await service.listServices(req.params.id);

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Error listing services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list services',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow-hierarchy/services
 * Create a new service
 */
router.post('/services', async (req, res) => {
  try {
    const service = await initServices();
    const newService = await service.createService(req.body);

    res.status(201).json({
      success: true,
      service: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      details: error.message
    });
  }
});

/**
 * PUT /api/workflow-hierarchy/services/:id
 * Update a service
 */
router.put('/services/:id', async (req, res) => {
  try {
    const service = await initServices();
    const updatedService = await service.updateService(req.params.id, req.body);

    res.json({
      success: true,
      service: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      details: error.message
    });
  }
});

/**
 * DELETE /api/workflow-hierarchy/services/:id
 * Delete a service
 */
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await initServices();
    const deleted = await service.deleteService(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      details: error.message
    });
  }
});

// ===================================================================
// DATA STREAM ENDPOINTS
// ===================================================================

/**
 * GET /api/workflow-hierarchy/workflows/:id/streams
 * List data streams for a workflow
 */
router.get('/workflows/:id/streams', async (req, res) => {
  try {
    const service = await initServices();
    const streams = await service.listDataStreams(req.params.id);

    res.json({
      success: true,
      count: streams.length,
      streams
    });
  } catch (error) {
    console.error('Error listing data streams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list data streams',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow-hierarchy/streams
 * Create a new data stream
 */
router.post('/streams', async (req, res) => {
  try {
    const service = await initServices();
    const stream = await service.createDataStream(req.body);

    res.status(201).json({
      success: true,
      stream
    });
  } catch (error) {
    console.error('Error creating data stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create data stream',
      details: error.message
    });
  }
});

// ===================================================================
// DASHBOARD ENDPOINTS
// ===================================================================

/**
 * GET /api/workflow-hierarchy/workflows/:id/dashboards
 * List dashboards for a workflow
 */
router.get('/workflows/:id/dashboards', async (req, res) => {
  try {
    const service = await initServices();
    const dashboards = await service.listDashboards(req.params.id);

    res.json({
      success: true,
      count: dashboards.length,
      dashboards
    });
  } catch (error) {
    console.error('Error listing dashboards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list dashboards',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow-hierarchy/dashboards
 * Create a new dashboard
 */
router.post('/dashboards', async (req, res) => {
  try {
    const service = await initServices();
    const dashboard = await service.createDashboard(req.body);

    res.status(201).json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dashboard',
      details: error.message
    });
  }
});

// ===================================================================
// DEEPSEEK AI GENERATION ENDPOINT
// ===================================================================

/**
 * POST /api/workflow-hierarchy/generate-from-prompt
 * Generate complete workflow from natural language using DeepSeek
 */
router.post('/generate-from-prompt', async (req, res) => {
  try {
    const service = await initServices();
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const result = await service.createWorkflowFromPrompt(prompt, context);

    res.status(201).json({
      success: true,
      message: 'Workflow generated successfully',
      workflow: result.workflow,
      services: result.services,
      streams: result.streams,
      dashboard: result.dashboard,
      generated_by: 'deepseek'
    });
  } catch (error) {
    console.error('Error generating workflow from prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate workflow',
      details: error.message
    });
  }
});

// ===================================================================
// SCHEMA ENDPOINTS
// ===================================================================

/**
 * GET /api/workflow-hierarchy/workflows/:id/schema
 * Get auto-generated schema for a workflow
 */
router.get('/workflows/:id/schema', async (req, res) => {
  try {
    const service = await initServices();
    const workflow = await service.getWorkflow(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      schema: workflow.auto_schema,
      schema_version: workflow.schema_version,
      last_generated: workflow.schema_last_generated_at
    });
  } catch (error) {
    console.error('Error getting workflow schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow schema',
      details: error.message
    });
  }
});

module.exports = router;
