/**
 * URL Seeding Service API Routes
 * 
 * Provides REST API for managing URL seeding service instances.
 * 
 * Endpoints:
 * - POST /api/seeding/config - Create new seeding configuration
 * - GET /api/seeding/config/:id - Get configuration
 * - PUT /api/seeding/config/:id - Update configuration
 * - DELETE /api/seeding/config/:id - Delete configuration
 * - GET /api/seeding/config - List all configurations
 * - POST /api/seeding/start/:id - Start seeding service instance
 * - POST /api/seeding/stop/:id - Stop seeding service instance
 * - POST /api/seeding/pause/:id - Pause seeding service instance
 * - POST /api/seeding/resume/:id - Resume seeding service instance
 * - GET /api/seeding/status/:id - Get status of instance
 * - POST /api/seeding/seeds/:id - Add URL seed to instance
 * - DELETE /api/seeding/seeds/:id - Remove URL seed from instance
 * - GET /api/seeding/seeds/:id - Get seeds from instance
 * - GET /api/seeding/backlinks/:clientId - Get backlinks for client
 * - POST /api/seeding/backlinks/report/:clientId - Generate backlink report
 * - GET /api/seeding/rich-snippets/:url - Get rich snippet for URL
 * - POST /api/seeding/template - Create configuration template
 */

import express from 'express';
import { URLSeedingService } from '../url-seeding-service.js';
import { BacklinkService } from '../backlink-service.js';
import SeedingConfigManager from '../seeding-config-manager.js';

const router = express.Router();

// Service instances
const activeInstances = new Map(); // instanceId -> URLSeedingService
let configManager = null;
let backlinkService = null;

/**
 * Initialize services
 */
export function initializeSeedingServices(db) {
  configManager = new SeedingConfigManager({ db });
  backlinkService = new BacklinkService({ db });
  
  console.log('✅ URL Seeding API services initialized');
}

/**
 * Create new seeding configuration
 * POST /api/seeding/config
 */
router.post('/config', async (req, res) => {
  try {
    const config = await configManager.createConfig(req.body);
    
    res.status(201).json({
      success: true,
      config,
      message: 'Configuration created successfully'
    });
  } catch (error) {
    console.error('Create config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get configuration
 * GET /api/seeding/config/:id
 */
router.get('/config/:id', async (req, res) => {
  try {
    const config = await configManager.readConfig(req.params.id);
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Read config error:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update configuration
 * PUT /api/seeding/config/:id
 */
router.put('/config/:id', async (req, res) => {
  try {
    const config = await configManager.updateConfig(req.params.id, req.body);
    
    res.json({
      success: true,
      config,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete configuration
 * DELETE /api/seeding/config/:id
 */
router.delete('/config/:id', async (req, res) => {
  try {
    // Stop instance if running
    if (activeInstances.has(req.params.id)) {
      const instance = activeInstances.get(req.params.id);
      await instance.stop();
      activeInstances.delete(req.params.id);
    }
    
    await configManager.deleteConfig(req.params.id);
    
    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * List all configurations
 * GET /api/seeding/config
 */
router.get('/config', async (req, res) => {
  try {
    const configs = await configManager.listConfigs(req.query);
    
    res.json({
      success: true,
      configs,
      count: configs.length
    });
  } catch (error) {
    console.error('List configs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Start seeding service instance
 * POST /api/seeding/start/:id
 */
router.post('/start/:id', async (req, res) => {
  try {
    const config = await configManager.readConfig(req.params.id);
    
    // Check if already running
    if (activeInstances.has(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Instance is already running'
      });
    }
    
    // Create and start service instance
    const instance = new URLSeedingService({
      instanceId: req.params.id,
      db: req.app.locals.db,
      crawler: req.app.locals.crawler,
      ...config
    });
    
    const result = await instance.start();
    
    // Add initial seeds from config
    if (config.seeds && config.seeds.length > 0) {
      for (const seed of config.seeds) {
        await instance.addSeed(seed, {
          source: 'initial-config',
          priority: 7
        });
      }
    }
    
    activeInstances.set(req.params.id, instance);
    
    res.json({
      success: true,
      result,
      message: 'Seeding service started'
    });
  } catch (error) {
    console.error('Start instance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stop seeding service instance
 * POST /api/seeding/stop/:id
 */
router.post('/stop/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        error: 'Instance not found or not running'
      });
    }
    
    await instance.stop();
    activeInstances.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Seeding service stopped'
    });
  } catch (error) {
    console.error('Stop instance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Pause seeding service instance
 * POST /api/seeding/pause/:id
 */
router.post('/pause/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        error: 'Instance not found or not running'
      });
    }
    
    instance.pause();
    
    res.json({
      success: true,
      message: 'Seeding service paused'
    });
  } catch (error) {
    console.error('Pause instance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Resume seeding service instance
 * POST /api/seeding/resume/:id
 */
router.post('/resume/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        error: 'Instance not found or not running'
      });
    }
    
    instance.resume();
    
    res.json({
      success: true,
      message: 'Seeding service resumed'
    });
  } catch (error) {
    console.error('Resume instance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get status of seeding service instance
 * GET /api/seeding/status/:id
 */
router.get('/status/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.json({
        success: true,
        status: {
          instanceId: req.params.id,
          isRunning: false,
          message: 'Instance not running'
        }
      });
    }
    
    const status = instance.getStatus();
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Add URL seed to instance
 * POST /api/seeding/seeds/:id
 */
router.post('/seeds/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        error: 'Instance not found or not running'
      });
    }
    
    const { url, metadata } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const seed = await instance.addSeed(url, metadata);
    
    res.status(201).json({
      success: true,
      seed,
      message: 'Seed added successfully'
    });
  } catch (error) {
    console.error('Add seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Remove URL seed from instance
 * DELETE /api/seeding/seeds/:id
 */
router.delete('/seeds/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        error: 'Instance not found or not running'
      });
    }
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const removed = await instance.removeSeed(url);
    
    res.json({
      success: true,
      removed,
      message: removed ? 'Seed removed successfully' : 'Seed not found'
    });
  } catch (error) {
    console.error('Remove seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get seeds from instance
 * GET /api/seeding/seeds/:id
 */
router.get('/seeds/:id', async (req, res) => {
  try {
    const instance = activeInstances.get(req.params.id);
    
    if (!instance) {
      return res.status(404).json({
        success: false,
        error: 'Instance not found or not running'
      });
    }
    
    const seeds = instance.getSeeds(req.query);
    
    res.json({
      success: true,
      seeds,
      count: seeds.length
    });
  } catch (error) {
    console.error('Get seeds error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get backlinks for client
 * GET /api/seeding/backlinks/:clientId
 */
router.get('/backlinks/:clientId', async (req, res) => {
  try {
    const report = await backlinkService.getBacklinksForClient(req.params.clientId);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get backlinks error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate backlink report for client
 * POST /api/seeding/backlinks/report/:clientId
 */
router.post('/backlinks/report/:clientId', async (req, res) => {
  try {
    const { clientUrls } = req.body;
    
    if (!clientUrls || !Array.isArray(clientUrls)) {
      return res.status(400).json({
        success: false,
        error: 'clientUrls array is required'
      });
    }
    
    const report = await backlinkService.generateBacklinkReport(
      req.params.clientId,
      clientUrls
    );
    
    res.json({
      success: true,
      report,
      message: 'Backlink report generated successfully'
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get rich snippet for URL
 * GET /api/seeding/rich-snippets/:url
 */
router.get('/rich-snippets/:url', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    const schemaType = req.query.schemaType || 'WebPage';
    
    const snippet = await backlinkService.generateRichSnippet(url, schemaType);
    const markup = backlinkService.generateSnippetMarkup(url);
    
    res.json({
      success: true,
      snippet,
      markup
    });
  } catch (error) {
    console.error('Get rich snippet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create configuration template
 * POST /api/seeding/template
 */
router.post('/template', async (req, res) => {
  try {
    const { name, config } = req.body;
    
    if (!name || !config) {
      return res.status(400).json({
        success: false,
        error: 'name and config are required'
      });
    }
    
    const template = await configManager.createTemplate(name, config);
    
    res.status(201).json({
      success: true,
      template,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as urlSeedingRoutes, initializeSeedingServices };
export default router;
