/**
 * Advanced Configuration API Routes
 * API endpoints for model training, MCP auto-API, and route history mining
 */

import express, { Router, Request, Response } from 'express';
import { ModelTrainingConfigService } from '../../services/model-training-config.js';
import { MCPAutoAPIService } from '../../services/mcp-auto-api.js';
import { RouteHistoryMiningService } from '../../services/route-history-mining.js';
import { SchemaGeneratorService } from '../../services/schema-generator.js';

const router: Router = express.Router();

// Initialize services
const trainingConfig = new ModelTrainingConfigService();
const mcpAPI = new MCPAutoAPIService();
const routeMining = new RouteHistoryMiningService();
const schemaGenerator = new SchemaGeneratorService();

/**
 * GET /api/config/training
 * Get model training configuration
 */
router.get('/training', (req: Request, res: Response) => {
  const config = trainingConfig.getTrainingConfig();

  res.json({
    success: true,
    config,
  });
});

/**
 * GET /api/config/project-status/:projectId
 * Get project status and health metrics
 */
router.get('/project-status/:projectId', async (req: Request, res: Response) => {
  try {
    const status = await trainingConfig.analyzeProjectStatus(req.params.projectId);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze project',
    });
  }
});

/**
 * GET /api/config/templates
 * List all default templates
 */
router.get('/templates', (req: Request, res: Response) => {
  const { category } = req.query;
  let templates = trainingConfig.listTemplates();

  if (category) {
    templates = templates.filter(t => t.category === category);
  }

  res.json({
    success: true,
    templates,
    count: templates.length,
  });
});

/**
 * GET /api/config/template/:category
 * Get default template for category
 */
router.get('/template/:category', (req: Request, res: Response) => {
  const template = trainingConfig.getDefaultTemplate(req.params.category);

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found',
    });
  }

  res.json({
    success: true,
    template,
  });
});

/**
 * GET /api/config/campaign-defaults/:type
 * Get campaign defaults
 */
router.get('/campaign-defaults/:type', (req: Request, res: Response) => {
  const defaults = trainingConfig.getCampaignDefaults(req.params.type);

  if (!defaults) {
    return res.status(404).json({
      success: false,
      error: 'Campaign defaults not found',
    });
  }

  res.json({
    success: true,
    defaults,
  });
});

/**
 * GET /api/config/memory
 * Get memory configuration
 */
router.get('/memory', (req: Request, res: Response) => {
  const config = trainingConfig.getMemoryConfig();

  res.json({
    success: true,
    config,
  });
});

/**
 * GET /api/config/automation-attributes
 * Get automation attributes list
 */
router.get('/automation-attributes', (req: Request, res: Response) => {
  const attributes = trainingConfig.getAutomationAttributes();

  res.json({
    success: true,
    attributes,
  });
});

/**
 * GET /api/config/high-success-config
 * Get configuration for high-success automation
 */
router.get('/high-success-config', (req: Request, res: Response) => {
  const config = trainingConfig.generateHighSuccessConfig();

  res.json({
    success: true,
    config,
  });
});

/**
 * POST /api/mcp/generate-crud
 * Auto-generate CRUD API from schema
 */
router.post('/generate-crud', async (req: Request, res: Response) => {
  try {
    const { schemaId } = req.body;

    if (!schemaId) {
      return res.status(400).json({
        success: false,
        error: 'schemaId is required',
      });
    }

    const schema = schemaGenerator.getSchema(schemaId);
    if (!schema) {
      return res.status(404).json({
        success: false,
        error: 'Schema not found',
      });
    }

    // Generate CRUD API
    const api = mcpAPI.generateCRUDAPI(schema);

    res.json({
      success: true,
      message: 'CRUD API generated',
      entity: schema.name,
      endpoints: [
        `POST /${schema.name.toLowerCase()}`,
        `GET /${schema.name.toLowerCase()}`,
        `GET /${schema.name.toLowerCase()}/:id`,
        `PUT /${schema.name.toLowerCase()}/:id`,
        `DELETE /${schema.name.toLowerCase()}/:id`,
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate CRUD API',
    });
  }
});

/**
 * POST /api/mcp/bundle-api
 * Bundle multiple services into unified API
 */
router.post('/bundle-api', async (req: Request, res: Response) => {
  try {
    const { bundleId, schemaIds, config } = req.body;

    if (!bundleId || !schemaIds || !Array.isArray(schemaIds)) {
      return res.status(400).json({
        success: false,
        error: 'bundleId and schemaIds array are required',
      });
    }

    // Get schemas
    const schemas = schemaIds
      .map((id: string) => schemaGenerator.getSchema(id))
      .filter((s): s is any => s !== undefined);

    if (schemas.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid schemas found',
      });
    }

    // Bundle APIs
    const bundledAPI = await mcpAPI.bundleServicesAPI(bundleId, schemas, config);

    res.json({
      success: true,
      bundle: {
        id: bundledAPI.bundleId,
        services: bundledAPI.services,
        endpointCount: bundledAPI.endpoints.length,
        endpoints: bundledAPI.endpoints,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bundle API',
    });
  }
});

/**
 * GET /api/mcp/bundles
 * List all bundled APIs
 */
router.get('/bundles', (req: Request, res: Response) => {
  const bundles = mcpAPI.listBundledAPIs();

  res.json({
    success: true,
    bundles: bundles.map(b => ({
      id: b.bundleId,
      services: b.services,
      endpointCount: b.endpoints.length,
    })),
    count: bundles.length,
  });
});

/**
 * GET /api/mcp/bundle/:bundleId
 * Get bundled API details
 */
router.get('/bundle/:bundleId', (req: Request, res: Response) => {
  const bundle = mcpAPI.getBundledAPI(req.params.bundleId);

  if (!bundle) {
    return res.status(404).json({
      success: false,
      error: 'Bundle not found',
    });
  }

  res.json({
    success: true,
    bundle: {
      id: bundle.bundleId,
      services: bundle.services,
      endpoints: bundle.endpoints,
    },
  });
});

/**
 * POST /api/route-mining/simulate-workflow
 * Simulate workflow to generate route history
 */
router.post('/simulate-workflow', async (req: Request, res: Response) => {
  try {
    const { workflow, simulationCount } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'workflow is required',
      });
    }

    const result = await routeMining.simulateWorkflow(
      workflow,
      simulationCount || 100
    );

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    });
  }
});

/**
 * GET /api/route-mining/history
 * Get route usage history
 */
router.get('/history', (req: Request, res: Response) => {
  const { limit } = req.query;
  const history = routeMining.getRouteHistory(limit ? Number(limit) : undefined);

  res.json({
    success: true,
    history,
    count: history.length,
  });
});

/**
 * GET /api/route-mining/patterns
 * Get route patterns
 */
router.get('/patterns', (req: Request, res: Response) => {
  const patterns = routeMining.getPatterns();

  res.json({
    success: true,
    patterns,
    count: patterns.length,
  });
});

/**
 * GET /api/route-mining/defaults
 * Compile and get defaults from patterns
 */
router.get('/defaults', (req: Request, res: Response) => {
  const defaults = routeMining.compileDefaults();

  res.json({
    success: true,
    defaults,
  });
});

/**
 * GET /api/route-mining/rules
 * Get default rule sets
 */
router.get('/rules', (req: Request, res: Response) => {
  const { category } = req.query;
  const rules = routeMining.getDefaultRules(category as string);

  res.json({
    success: true,
    rules,
    count: rules.length,
  });
});

/**
 * POST /api/route-mining/track
 * Track route usage
 */
router.post('/track', (req: Request, res: Response) => {
  try {
    const { path, method, responseTime, error } = req.body;

    if (!path || !method) {
      return res.status(400).json({
        success: false,
        error: 'path and method are required',
      });
    }

    routeMining.trackRoute(path, method, responseTime || 0, error);

    res.json({
      success: true,
      message: 'Route tracked',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track route',
    });
  }
});

/**
 * GET /api/config/health
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    services: {
      trainingConfig: 'ready',
      mcpAPI: 'ready',
      routeMining: 'ready',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
