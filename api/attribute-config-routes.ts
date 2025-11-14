/**
 * Attribute Configuration API Routes
 * 
 * Provides REST API for accessing and managing SEO attribute configurations
 */

import express, { Request, Response, NextFunction } from 'express';
import { getAttributeConfigLoader } from '../services/attribute-config-loader';

const router = express.Router();

/**
 * GET /api/seo/attribute-config
 * Get all attribute configurations
 */
router.get('/attribute-config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configLoader = getAttributeConfigLoader();
    const configs = configLoader.getAllConfigsAsObject();
    const stats = configLoader.getStats();
    
    res.json({
      success: true,
      data: configs,
      meta: {
        ...stats,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting attribute configurations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve attribute configurations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/attribute-config/:name
 * Get specific attribute configuration
 */
router.get('/attribute-config/:name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    const configLoader = getAttributeConfigLoader();
    const config = configLoader.getConfig(name);
    
    if (!config) {
      return res.status(404).json({ 
        success: false, 
        error: 'Attribute not found',
        attributeName: name
      });
    }
    
    res.json({ 
      success: true, 
      data: config,
      meta: {
        attributeName: name,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting attribute configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve attribute configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/attribute-config/category/:category
 * Get attributes by category
 */
router.get('/attribute-config/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const configLoader = getAttributeConfigLoader();
    const configs = configLoader.getByCategory(category);
    
    res.json({ 
      success: true, 
      data: configs,
      meta: {
        category,
        count: configs.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting attributes by category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve attributes by category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/attribute-config/importance/:importance
 * Get attributes by importance level
 */
router.get('/attribute-config/importance/:importance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { importance } = req.params;
    
    if (!['critical', 'high', 'medium', 'low'].includes(importance)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid importance level',
        validValues: ['critical', 'high', 'medium', 'low']
      });
    }
    
    const configLoader = getAttributeConfigLoader();
    const configs = configLoader.getByImportance(importance as any);
    
    res.json({ 
      success: true, 
      data: configs,
      meta: {
        importance,
        count: configs.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting attributes by importance:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve attributes by importance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/attribute-config/critical
 * Get critical attributes (ML weight > 0.10 or importance = critical)
 */
router.get('/attribute-config/critical', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configLoader = getAttributeConfigLoader();
    const configs = configLoader.getCriticalAttributes();
    
    res.json({ 
      success: true, 
      data: configs,
      meta: {
        count: configs.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting critical attributes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve critical attributes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/attribute-config/stats
 * Get configuration statistics
 */
router.get('/attribute-config/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configLoader = getAttributeConfigLoader();
    const stats = configLoader.getStats();
    
    res.json({ 
      success: true, 
      data: stats,
      meta: {
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting configuration stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve configuration statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/attribute-config/validate
 * Validate attribute value against configuration
 */
router.post('/attribute-config/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attributeName, value } = req.body;
    
    if (!attributeName) {
      return res.status(400).json({
        success: false,
        error: 'attributeName is required'
      });
    }
    
    const configLoader = getAttributeConfigLoader();
    const validation = configLoader.validateAttribute(attributeName, value);
    
    res.json({ 
      success: true, 
      data: {
        attributeName,
        value,
        ...validation
      },
      meta: {
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating attribute:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to validate attribute',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/optimizations
 * Get all optimization recommendations
 */
router.get('/optimizations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configLoader = getAttributeConfigLoader();
    const optimizations = configLoader.getAllOptimizations();
    
    res.json({ 
      success: true, 
      data: optimizations,
      meta: {
        count: optimizations.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting optimizations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve optimization recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/optimizations/:id
 * Get specific optimization recommendation
 */
router.get('/optimizations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const configLoader = getAttributeConfigLoader();
    const optimization = configLoader.getOptimization(id);
    
    if (!optimization) {
      return res.status(404).json({ 
        success: false, 
        error: 'Optimization recommendation not found',
        optimizationId: id
      });
    }
    
    res.json({ 
      success: true, 
      data: optimization,
      meta: {
        optimizationId: id,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting optimization:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve optimization recommendation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/optimizations/priority/:priority
 * Get optimization recommendations by priority
 */
router.get('/optimizations/priority/:priority', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { priority } = req.params;
    const configLoader = getAttributeConfigLoader();
    const optimizations = configLoader.getOptimizationsByPriority(priority);
    
    res.json({ 
      success: true, 
      data: optimizations,
      meta: {
        priority,
        count: optimizations.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting optimizations by priority:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve optimization recommendations by priority',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/attribute-config/reload
 * Reload configuration from file
 */
router.post('/attribute-config/reload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configLoader = getAttributeConfigLoader();
    configLoader.reload();
    const stats = configLoader.getStats();
    
    res.json({ 
      success: true, 
      message: 'Configuration reloaded successfully',
      data: stats,
      meta: {
        reloadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error reloading configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reload configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
