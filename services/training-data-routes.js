/**
 * Enhanced Training Data API Routes
 * 
 * Provides endpoints for:
 * - Data mining with specific model profiles
 * - Training bundle creation
 * - Attribute discovery
 * - Schema linking for training data
 */

import express from 'express';
import { EnhancedDataMiningWorker } from './enhanced-data-mining-worker.js';
import { TrainingDataBundler } from './training-data-bundler.js';

const router = express.Router();

// Initialize services
let dataMiner = null;
let bundler = null;

/**
 * Initialize services on first use
 */
async function ensureServices(db = null) {
  if (!dataMiner) {
    dataMiner = new EnhancedDataMiningWorker({ workerId: 'api-worker' });
    await dataMiner.initialize();
  }

  if (!bundler) {
    bundler = new TrainingDataBundler(db);
    await bundler.initialize();
  }

  return { dataMiner, bundler };
}

/**
 * GET /api/training-data/model-types
 * List all supported model types and their attributes
 */
router.get('/model-types', async (req, res) => {
  try {
    const { dataMiner } = await ensureServices();
    const modelTypes = dataMiner.getSupportedModelTypes();

    res.json({
      success: true,
      data: {
        modelTypes,
        total: modelTypes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training-data/mine
 * Mine data for a specific model type
 * 
 * Body:
 * {
 *   "url": "https://example.com",
 *   "modelType": "component_generator"
 * }
 */
router.post('/mine', async (req, res) => {
  try {
    const { url, modelType } = req.body;

    if (!url || !modelType) {
      return res.status(400).json({
        success: false,
        error: 'URL and modelType are required'
      });
    }

    const { dataMiner } = await ensureServices();
    const data = await dataMiner.mineDataForModel(url, modelType);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training-data/mine-batch
 * Mine data from multiple URLs
 * 
 * Body:
 * {
 *   "urls": ["https://example1.com", "https://example2.com"],
 *   "modelType": "seo_optimizer"
 * }
 */
router.post('/mine-batch', async (req, res) => {
  try {
    const { urls, modelType } = req.body;

    if (!Array.isArray(urls) || urls.length === 0 || !modelType) {
      return res.status(400).json({
        success: false,
        error: 'URLs array and modelType are required'
      });
    }

    if (urls.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 20 URLs allowed per batch'
      });
    }

    const { dataMiner } = await ensureServices();
    const results = await dataMiner.batchMineData(urls, modelType);

    res.json({
      success: true,
      data: {
        results,
        total: urls.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/training-data/functionalities
 * List all supported functionalities for training bundles
 */
router.get('/functionalities', async (req, res) => {
  try {
    const { bundler } = await ensureServices();
    const functionalities = bundler.getSupportedFunctionalities();

    res.json({
      success: true,
      data: {
        functionalities,
        total: functionalities.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training-data/create-bundle
 * Create a training data bundle for a specific functionality
 * 
 * Body:
 * {
 *   "functionality": "seo_optimization",
 *   "urls": ["https://example1.com", "https://example2.com", ...]
 * }
 */
router.post('/create-bundle', async (req, res) => {
  try {
    const { functionality, urls } = req.body;

    if (!functionality || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Functionality and URLs array are required'
      });
    }

    const { bundler } = await ensureServices(req.db);
    const bundle = await bundler.createTrainingBundle(functionality, urls);

    res.json({
      success: true,
      data: bundle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training-data/discover-attributes
 * Discover what attributes are valuable for training a specific functionality
 * 
 * Body:
 * {
 *   "functionality": "component_generation",
 *   "sampleUrls": ["https://example.com"]
 * }
 */
router.post('/discover-attributes', async (req, res) => {
  try {
    const { functionality, sampleUrls = [] } = req.body;

    if (!functionality) {
      return res.status(400).json({
        success: false,
        error: 'Functionality is required'
      });
    }

    const { bundler } = await ensureServices();
    const config = bundler.getBundleConfiguration(functionality);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Unknown functionality'
      });
    }

    // If sample URLs provided, analyze them
    let sampleData = null;
    if (sampleUrls.length > 0) {
      const { dataMiner } = await ensureServices();
      const samples = [];

      for (const url of sampleUrls.slice(0, 3)) { // Limit to 3 samples
        for (const modelType of config.modelTypes) {
          try {
            const data = await dataMiner.mineDataForModel(url, modelType);
            samples.push(data);
          } catch (error) {
            console.warn(`Failed to mine ${url}:`, error.message);
          }
        }
      }

      sampleData = samples;
    }

    res.json({
      success: true,
      data: {
        functionality,
        description: config.description,
        requiredAttributes: config.requiredAttributes,
        modelTypes: config.modelTypes,
        minQualityScore: config.minQualityScore,
        includeLayersData: config.includeLayersData,
        linkSchemas: config.linkSchemas,
        sampleData: sampleData ? {
          count: sampleData.length,
          examples: sampleData.map(s => ({
            url: s.url,
            attributesFound: Object.keys(s.attributes || {}),
            qualityScore: s.qualityScore
          }))
        } : null,
        attributeDetails: this.getAttributeDetails(config.requiredAttributes)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET attribute details helper
 */
router.getAttributeDetails = function(attributes) {
  const details = {
    dom_depth: { type: 'integer', description: 'Maximum depth of DOM tree' },
    node_count: { type: 'integer', description: 'Total number of DOM nodes' },
    form_count: { type: 'integer', description: 'Number of forms on page' },
    button_count: { type: 'integer', description: 'Number of buttons on page' },
    meta_tags: { type: 'object', description: 'Meta tags with name/content pairs' },
    heading_structure: { type: 'array', description: 'Array of headings by level (h1-h6)' },
    component_structure: { type: 'object', description: 'Component hierarchy and composition' },
    color_palette: { type: 'array', description: 'Colors used in the design' },
    performance_score: { type: 'float', description: 'Overall performance score (0-100)' },
    aria_attributes: { type: 'object', description: 'ARIA attributes usage statistics' },
    data_attributes: { type: 'object', description: 'Data attributes for schema linking' }
  };

  return attributes.map(attr => ({
    name: attr,
    ...(details[attr] || { type: 'unknown', description: 'Attribute description' })
  }));
}.bind(router);

/**
 * POST /api/training-data/link-schemas
 * Find schema links in training data
 * 
 * Body:
 * {
 *   "datasets": [...], // Training datasets
 *   "schemaContext": { ... } // Optional schema context
 * }
 */
router.post('/link-schemas', async (req, res) => {
  try {
    const { datasets, schemaContext = {} } = req.body;

    if (!Array.isArray(datasets) || datasets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datasets array is required'
      });
    }

    const { bundler } = await ensureServices(req.db);
    const linkedSchemas = await bundler.extractLinkedSchemas(datasets);

    res.json({
      success: true,
      data: {
        linkedSchemas,
        total: linkedSchemas.length,
        byConfidence: {
          high: linkedSchemas.filter(s => s.confidence >= 0.8).length,
          medium: linkedSchemas.filter(s => s.confidence >= 0.5 && s.confidence < 0.8).length,
          low: linkedSchemas.filter(s => s.confidence < 0.5).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Middleware to attach database
 */
router.use((req, res, next) => {
  // Database will be attached by main server
  next();
});

export default router;
