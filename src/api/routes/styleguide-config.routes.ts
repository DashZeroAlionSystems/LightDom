/**
 * Styleguide Configuration API Routes
 * 
 * RESTful API for managing:
 * - Styleguide categories and attributes
 * - Workflows and campaigns
 * - Headless containers
 * - Simulations and optimizations
 * - Rich snippet generation
 */

import express from 'express';
import {
  styleguideConfigSystem,
  StyleguideCategory,
  WorkflowConfig,
  CampaignConfig,
  HeadlessContainerConfig,
} from '../../config/styleguide-config-system.js';

const router = express.Router();

// ============= CATEGORIES =============

/**
 * GET /api/styleguide-config/categories
 * Get all categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = styleguideConfigSystem.getAllCategories();
    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/categories/:id
 * Get a specific category
 */
router.get('/categories/:id', (req, res) => {
  try {
    const category = styleguideConfigSystem.getCategory(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/styleguide-config/categories
 * Create a new category
 */
router.post('/categories', (req, res) => {
  try {
    const category = styleguideConfigSystem.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============= WORKFLOWS =============

/**
 * GET /api/styleguide-config/workflows
 * Get all workflows
 */
router.get('/workflows', (req, res) => {
  try {
    const workflows = styleguideConfigSystem.getAllWorkflows();
    res.json({
      success: true,
      data: workflows,
      count: workflows.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/workflows/:id
 * Get a specific workflow
 */
router.get('/workflows/:id', (req, res) => {
  try {
    const workflow = styleguideConfigSystem.getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }
    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/styleguide-config/workflows
 * Create a new workflow
 */
router.post('/workflows', (req, res) => {
  try {
    const workflow = styleguideConfigSystem.createWorkflow(req.body);
    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============= CAMPAIGNS =============

/**
 * GET /api/styleguide-config/campaigns
 * Get all campaigns
 */
router.get('/campaigns', (req, res) => {
  try {
    const campaigns = styleguideConfigSystem.getAllCampaigns();
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/campaigns/:id
 * Get a specific campaign
 */
router.get('/campaigns/:id', (req, res) => {
  try {
    const campaign = styleguideConfigSystem.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }
    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/styleguide-config/campaigns
 * Create a new campaign
 */
router.post('/campaigns', (req, res) => {
  try {
    const campaign = styleguideConfigSystem.createCampaign(req.body);
    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============= CONTAINERS =============

/**
 * GET /api/styleguide-config/containers
 * Get all headless containers
 */
router.get('/containers', (req, res) => {
  try {
    const containers = styleguideConfigSystem.getAllContainers();
    res.json({
      success: true,
      data: containers,
      count: containers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/containers/:id
 * Get a specific container
 */
router.get('/containers/:id', (req, res) => {
  try {
    const container = styleguideConfigSystem.getContainer(req.params.id);
    if (!container) {
      return res.status(404).json({
        success: false,
        error: 'Container not found',
      });
    }
    res.json({
      success: true,
      data: container,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/styleguide-config/containers
 * Create a new headless container
 */
router.post('/containers', (req, res) => {
  try {
    const container = styleguideConfigSystem.createHeadlessContainer(req.body);
    res.status(201).json({
      success: true,
      data: container,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============= ADVANCED FEATURES =============

/**
 * GET /api/styleguide-config/attributes/:id/relationships
 * Get attribute relationships and importance
 */
router.get('/attributes/:id/relationships', (req, res) => {
  try {
    const relationships = styleguideConfigSystem.getAttributeRelationships(req.params.id);
    res.json({
      success: true,
      data: relationships,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/styleguide-config/simulate
 * Run attribute optimization simulation
 */
router.post('/simulate', async (req, res) => {
  try {
    const { attributeIds, config } = req.body;
    
    if (!attributeIds || !Array.isArray(attributeIds)) {
      return res.status(400).json({
        success: false,
        error: 'attributeIds array is required',
      });
    }

    const result = await styleguideConfigSystem.runAttributeSimulation(
      attributeIds,
      config || {}
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/campaigns/:id/rich-snippets
 * Generate SEO-optimized rich snippet schema for a campaign
 */
router.get('/campaigns/:id/rich-snippets', (req, res) => {
  try {
    const schema = styleguideConfigSystem.generateRichSnippetSchema(req.params.id);
    res.json({
      success: true,
      data: schema,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/export
 * Export complete configuration
 */
router.get('/export', (req, res) => {
  try {
    const config = styleguideConfigSystem.exportConfig();
    res.json({
      success: true,
      data: config,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/styleguide-config/import
 * Import configuration
 */
router.post('/import', (req, res) => {
  try {
    styleguideConfigSystem.importConfig(req.body);
    res.json({
      success: true,
      message: 'Configuration imported successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/styleguide-config/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      categories: styleguideConfigSystem.getAllCategories().length,
      workflows: styleguideConfigSystem.getAllWorkflows().length,
      campaigns: styleguideConfigSystem.getAllCampaigns().length,
      containers: styleguideConfigSystem.getAllContainers().length,
    },
  });
});

export default router;
