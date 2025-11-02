/**
 * Chrome Layers Panel API Routes
 * 
 * Provides REST API endpoints for Chrome DevTools-style layer analysis
 * and 3D component mapping.
 */

import express from 'express';
import { ChromeLayersService } from './chrome-layers-service.js';

const router = express.Router();

// Initialize service
let layersService = null;

/**
 * Initialize the service on first use
 */
async function ensureService() {
  if (!layersService) {
    layersService = new ChromeLayersService({
      headless: process.env.HEADLESS !== 'false',
      cacheEnabled: process.env.CACHE_ENABLED !== 'false'
    });
    await layersService.initialize();
  }
  return layersService;
}

/**
 * GET /api/layers/status
 * Get service status
 */
router.get('/status', async (req, res) => {
  try {
    const service = await ensureService();
    res.json({
      success: true,
      data: {
        status: 'operational',
        initialized: !!service.browser,
        cacheEnabled: !!service.redisClient,
        timestamp: new Date().toISOString()
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
 * POST /api/layers/analyze
 * Analyze a URL for layer information
 * 
 * Body:
 * {
 *   "url": "https://example.com",
 *   "options": {
 *     "includeTrainingData": true,
 *     "designRules": { ... }
 *   }
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const service = await ensureService();
    const analysis = await service.analyzeLayersForUrl(url, options);

    // Optionally include training data
    let trainingData = null;
    if (options.includeTrainingData) {
      trainingData = await service.extractTrainingData(url, analysis, options);
    }

    res.json({
      success: true,
      data: {
        analysis,
        trainingData
      }
    });
  } catch (error) {
    console.error('Layer analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/layers/3d-map
 * Generate 3D map data for visualization
 * 
 * Body:
 * {
 *   "url": "https://example.com",
 *   "format": "threejs" | "d3" | "raw"
 * }
 */
router.post('/3d-map', async (req, res) => {
  try {
    const { url, format = 'raw' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const service = await ensureService();
    const analysis = await service.analyzeLayersForUrl(url);

    // Transform data based on format
    let map3D = analysis.map3D;
    
    if (format === 'threejs') {
      map3D = transformForThreeJS(map3D);
    } else if (format === 'd3') {
      map3D = transformForD3(map3D);
    }

    res.json({
      success: true,
      data: {
        map3D,
        metadata: analysis.metadata,
        format
      }
    });
  } catch (error) {
    console.error('3D map generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/layers/component-map
 * Get component position mapping
 * 
 * Body:
 * {
 *   "url": "https://example.com",
 *   "includeSchemas": true
 * }
 */
router.post('/component-map', async (req, res) => {
  try {
    const { url, includeSchemas = false } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const service = await ensureService();
    const analysis = await service.analyzeLayersForUrl(url);

    // Sort components by position
    const orderedComponents = [...analysis.componentMap].sort((a, b) => {
      // Sort by Y position (top to bottom), then X position (left to right)
      if (Math.abs(a.bounds.y - b.bounds.y) > 10) {
        return a.bounds.y - b.bounds.y;
      }
      return a.bounds.x - b.bounds.x;
    });

    // Optionally link to schemas
    let linkedSchemas = null;
    if (includeSchemas) {
      linkedSchemas = await linkComponentsToSchemas(orderedComponents, req.db);
    }

    res.json({
      success: true,
      data: {
        componentMap: orderedComponents,
        linkedSchemas,
        totalComponents: orderedComponents.length
      }
    });
  } catch (error) {
    console.error('Component mapping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/layers/training-data
 * Extract and save training data
 * 
 * Body:
 * {
 *   "url": "https://example.com",
 *   "designRules": { ... },
 *   "saveToDB": true
 * }
 */
router.post('/training-data', async (req, res) => {
  try {
    const { url, designRules = {}, saveToDB = true } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const service = await ensureService();
    const analysis = await service.analyzeLayersForUrl(url);
    const trainingData = await service.extractTrainingData(url, analysis, { designRules });

    // Save to database if requested
    let saved = false;
    if (saveToDB && req.db) {
      try {
        await saveTrainingData(req.db, trainingData);
        saved = true;
      } catch (error) {
        console.error('Failed to save training data:', error);
      }
    }

    res.json({
      success: true,
      data: {
        trainingData,
        saved
      }
    });
  } catch (error) {
    console.error('Training data extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/layers/batch-analyze
 * Analyze multiple URLs in batch
 * 
 * Body:
 * {
 *   "urls": ["https://example1.com", "https://example2.com"],
 *   "options": { ... }
 * }
 */
router.post('/batch-analyze', async (req, res) => {
  try {
    const { urls, options = {} } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'URLs array is required'
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 URLs allowed per batch'
      });
    }

    const service = await ensureService();
    const results = [];

    for (const url of urls) {
      try {
        const analysis = await service.analyzeLayersForUrl(url, options);
        results.push({
          url,
          success: true,
          data: analysis
        });
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    }

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
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/layers/design-rules
 * Get recommended design rules
 */
router.get('/design-rules', (req, res) => {
  res.json({
    success: true,
    data: {
      recommended: {
        maxZIndex: 10000,
        minComponentSize: { width: 10, height: 10 },
        maxCompositingLayers: 50,
        compositingBestPractices: true,
        performanceThresholds: {
          maxLayerCount: 500,
          maxPaintComplexity: 1000
        }
      },
      examples: [
        {
          name: 'E-commerce',
          rules: {
            maxZIndex: 5000,
            maxCompositingLayers: 30
          }
        },
        {
          name: 'Dashboard',
          rules: {
            maxZIndex: 3000,
            maxCompositingLayers: 40
          }
        },
        {
          name: 'Blog',
          rules: {
            maxZIndex: 1000,
            maxCompositingLayers: 20
          }
        }
      ]
    }
  });
});

/**
 * Helper: Transform 3D map for Three.js
 */
function transformForThreeJS(map3D) {
  return map3D.map(layer => ({
    geometry: {
      type: 'BoxGeometry',
      args: [layer.dimensions.width, layer.dimensions.height, layer.dimensions.depth]
    },
    material: {
      type: 'MeshStandardMaterial',
      color: layer.color,
      opacity: layer.metadata.opacity,
      transparent: layer.metadata.opacity < 1
    },
    position: {
      x: layer.position.x,
      y: -layer.position.y, // Invert Y for Three.js
      z: layer.position.z
    },
    userData: layer.metadata
  }));
}

/**
 * Helper: Transform 3D map for D3
 */
function transformForD3(map3D) {
  return {
    nodes: map3D.map(layer => ({
      id: layer.layerId,
      x: layer.position.x,
      y: layer.position.y,
      z: layer.position.z,
      width: layer.dimensions.width,
      height: layer.dimensions.height,
      color: layer.color,
      ...layer.metadata
    })),
    links: [] // Can be populated with component relationships
  };
}

/**
 * Helper: Link components to database schemas
 */
async function linkComponentsToSchemas(components, db) {
  if (!db) return null;

  const linkedSchemas = [];

  try {
    // Query schema linking data
    const result = await db.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        table_schema
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Map components to potential schemas based on naming patterns
    components.forEach(component => {
      const matches = [];

      // Check data attributes for schema hints
      if (component.dataAttributes) {
        Object.keys(component.dataAttributes).forEach(attr => {
          const attrName = attr.replace('data-', '');
          
          // Find matching tables
          result.rows.forEach(row => {
            if (row.table_name.includes(attrName) || attrName.includes(row.table_name)) {
              matches.push({
                table: row.table_name,
                column: row.column_name,
                type: row.data_type,
                confidence: 0.8
              });
            }
          });
        });
      }

      // Check role attribute
      if (component.role) {
        result.rows.forEach(row => {
          if (row.table_name.includes(component.role)) {
            matches.push({
              table: row.table_name,
              column: row.column_name,
              type: row.data_type,
              confidence: 0.6
            });
          }
        });
      }

      if (matches.length > 0) {
        linkedSchemas.push({
          componentId: component.componentId,
          schemas: matches
        });
      }
    });
  } catch (error) {
    console.error('Schema linking error:', error);
  }

  return linkedSchemas;
}

/**
 * Helper: Save training data to database
 */
async function saveTrainingData(db, trainingData) {
  if (!db) throw new Error('Database not available');

  await db.query(`
    INSERT INTO layer_training_data (
      url,
      timestamp,
      layer_count,
      compositing_layer_count,
      max_depth,
      component_count,
      patterns,
      components,
      relationships,
      design_rules
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    trainingData.url,
    trainingData.timestamp,
    trainingData.structure.layerCount,
    trainingData.structure.compositingLayerCount,
    trainingData.structure.maxDepth,
    trainingData.structure.componentCount,
    JSON.stringify(trainingData.patterns),
    JSON.stringify(trainingData.components),
    JSON.stringify(trainingData.relationships),
    JSON.stringify(trainingData.designRules)
  ]);
}

/**
 * Middleware to attach database to request
 */
router.use((req, res, next) => {
  // Database will be attached by main server
  next();
});

export default router;
