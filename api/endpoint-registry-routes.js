/**
 * API Endpoint Registry Routes
 * 
 * Provides RESTful API for managing API endpoints, service compositions,
 * and workflow chains.
 */

import express from 'express';
import APIEndpointDiscovery from '../services/api-endpoint-discovery.js';
import APIEndpointRegistry from '../services/api-endpoint-registry.js';
import ServiceCompositionOrchestrator from '../services/service-composition-orchestrator.js';

const router = express.Router();

/**
 * Initialize services
 */
function initializeServices(db) {
  const registry = new APIEndpointRegistry(db);
  const orchestrator = new ServiceCompositionOrchestrator(registry);
  const discovery = new APIEndpointDiscovery();
  
  return { registry, orchestrator, discovery };
}

/**
 * GET /api/endpoint-registry/discover
 * Discover all API endpoints in the codebase
 */
router.get('/discover', async (req, res) => {
  try {
    const { registry, discovery } = initializeServices(req.app.locals.db);
    
    console.log('🔍 Starting endpoint discovery...');
    const endpoints = await discovery.discoverEndpoints();
    
    // Optionally register discovered endpoints
    if (req.query.register === 'true') {
      console.log('📝 Registering discovered endpoints...');
      const results = await registry.bulkRegisterEndpoints(endpoints);
      
      const summary = {
        discovered: endpoints.length,
        registered: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        errors: results.filter(r => !r.success).map(r => ({
          endpoint_id: r.endpoint_id,
          error: r.error
        }))
      };
      
      res.json({
        success: true,
        message: 'Endpoint discovery completed',
        summary,
        statistics: discovery.getStatistics()
      });
    } else {
      // Just return discovered endpoints without registering
      res.json({
        success: true,
        message: 'Endpoint discovery completed',
        count: endpoints.length,
        endpoints,
        statistics: discovery.getStatistics()
      });
    }
  } catch (error) {
    console.error('Error discovering endpoints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover endpoints',
      message: error.message
    });
  }
});

/**
 * POST /api/endpoint-registry/endpoints
 * Register a new endpoint
 */
router.post('/endpoints', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const endpoint = await registry.registerEndpoint(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Endpoint registered successfully',
      endpoint
    });
  } catch (error) {
    console.error('Error registering endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register endpoint',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/endpoints
 * Get all endpoints with optional filters
 */
router.get('/endpoints', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    
    const filters = {
      category: req.query.category,
      method: req.query.method,
      service_type: req.query.service_type,
      requires_auth: req.query.requires_auth === 'true' ? true : 
                      req.query.requires_auth === 'false' ? false : undefined,
      is_active: req.query.is_active === 'true' ? true :
                  req.query.is_active === 'false' ? false : undefined,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };
    
    const endpoints = await registry.getEndpoints(filters);
    
    res.json({
      success: true,
      count: endpoints.length,
      endpoints
    });
  } catch (error) {
    console.error('Error getting endpoints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get endpoints',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/endpoints/search
 * Search endpoints by text
 */
router.get('/endpoints/search', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term required',
        message: 'Please provide a search term using ?q=term'
      });
    }
    
    const endpoints = await registry.searchEndpoints(searchTerm);
    
    res.json({
      success: true,
      query: searchTerm,
      count: endpoints.length,
      endpoints
    });
  } catch (error) {
    console.error('Error searching endpoints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search endpoints',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/endpoints/:endpointId
 * Get endpoint by ID
 */
router.get('/endpoints/:endpointId', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const endpoint = await registry.getEndpointById(req.params.endpointId);
    
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }
    
    res.json({
      success: true,
      endpoint
    });
  } catch (error) {
    console.error('Error getting endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get endpoint',
      message: error.message
    });
  }
});

/**
 * PUT /api/endpoint-registry/endpoints/:endpointId
 * Update endpoint
 */
router.put('/endpoints/:endpointId', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const endpoint = await registry.updateEndpoint(req.params.endpointId, req.body);
    
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Endpoint updated successfully',
      endpoint
    });
  } catch (error) {
    console.error('Error updating endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update endpoint',
      message: error.message
    });
  }
});

/**
 * DELETE /api/endpoint-registry/endpoints/:endpointId
 * Delete endpoint
 */
router.delete('/endpoints/:endpointId', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const endpoint = await registry.deleteEndpoint(req.params.endpointId);
    
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Endpoint deleted successfully',
      endpoint
    });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete endpoint',
      message: error.message
    });
  }
});

/**
 * POST /api/endpoint-registry/services/:serviceId/bind-endpoint
 * Bind an endpoint to a service
 */
router.post('/services/:serviceId/bind-endpoint', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const { serviceId } = req.params;
    const { endpoint_id, ...config } = req.body;
    
    if (!endpoint_id) {
      return res.status(400).json({
        success: false,
        error: 'endpoint_id is required'
      });
    }
    
    const binding = await registry.bindEndpointToService(serviceId, endpoint_id, config);
    
    res.status(201).json({
      success: true,
      message: 'Endpoint bound to service successfully',
      binding
    });
  } catch (error) {
    console.error('Error binding endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bind endpoint',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/services/:serviceId/bindings
 * Get service endpoint bindings
 */
router.get('/services/:serviceId/bindings', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const bindings = await registry.getServiceBindings(req.params.serviceId);
    
    res.json({
      success: true,
      service_id: req.params.serviceId,
      count: bindings.length,
      bindings
    });
  } catch (error) {
    console.error('Error getting service bindings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service bindings',
      message: error.message
    });
  }
});

/**
 * POST /api/endpoint-registry/services/:serviceId/execute
 * Execute a service composition
 */
router.post('/services/:serviceId/execute', async (req, res) => {
  try {
    const { registry, orchestrator } = initializeServices(req.app.locals.db);
    const { serviceId } = req.params;
    const inputData = req.body;
    
    const result = await orchestrator.executeService(serviceId, inputData);
    
    res.json({
      success: true,
      message: 'Service executed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error executing service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute service',
      message: error.message
    });
  }
});

/**
 * POST /api/endpoint-registry/chains
 * Create an endpoint chain
 */
router.post('/chains', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const chain = await registry.createEndpointChain(req.body.workflow_id, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Endpoint chain created successfully',
      chain
    });
  } catch (error) {
    console.error('Error creating chain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chain',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/workflows/:workflowId/chains
 * Get chains for a workflow
 */
router.get('/workflows/:workflowId/chains', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const chains = await registry.getWorkflowChains(req.params.workflowId);
    
    res.json({
      success: true,
      workflow_id: req.params.workflowId,
      count: chains.length,
      chains
    });
  } catch (error) {
    console.error('Error getting workflow chains:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow chains',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/chains/:chainId/execution-plan
 * Get execution plan for a chain
 */
router.get('/chains/:chainId/execution-plan', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const plan = await registry.getChainExecutionPlan(req.params.chainId);
    
    res.json({
      success: true,
      chain_id: req.params.chainId,
      plan
    });
  } catch (error) {
    console.error('Error getting execution plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get execution plan',
      message: error.message
    });
  }
});

/**
 * POST /api/endpoint-registry/chains/:chainId/execute
 * Execute an endpoint chain
 */
router.post('/chains/:chainId/execute', async (req, res) => {
  try {
    const { registry, orchestrator } = initializeServices(req.app.locals.db);
    const { chainId } = req.params;
    const inputData = req.body;
    
    const result = await orchestrator.executeChain(chainId, inputData);
    
    res.json({
      success: true,
      message: 'Chain executed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error executing chain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute chain',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/stats
 * Get registry statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const stats = await registry.getEndpointStats();
    const categories = await registry.getCategoriesWithCounts();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        categories
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/categories
 * Get categories with endpoint counts
 */
router.get('/categories', async (req, res) => {
  try {
    const { registry } = initializeServices(req.app.locals.db);
    const categories = await registry.getCategoriesWithCounts();
    
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      message: error.message
    });
  }
});

/**
 * GET /api/endpoint-registry/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  res.json({
    success: true,
    service: 'API Endpoint Registry',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
