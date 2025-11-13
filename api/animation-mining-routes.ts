/**
 * Animation Mining API Routes
 * 
 * Provides REST API for animation pattern mining and retrieval
 */

import express, { Request, Response, NextFunction } from 'express';
import AnimationStyleguideMiner from '../services/animation-styleguide-miner';

const router = express.Router();
let miner: AnimationStyleguideMiner | null = null;

/**
 * Get or create miner instance
 */
function getMiner(): AnimationStyleguideMiner {
  if (!miner) {
    miner = new AnimationStyleguideMiner();
  }
  return miner;
}

/**
 * POST /api/styleguide/mine
 * Start mining all styleguides
 */
router.post('/mine', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const miner = getMiner();
    
    // Start mining in background
    res.json({
      success: true,
      message: 'Animation mining started',
      meta: {
        startedAt: new Date().toISOString()
      }
    });

    // Mine in background
    miner.mineAll().then((patterns) => {
      console.log(`✨ Mining complete: ${patterns.length} patterns found`);
    }).catch((error) => {
      console.error('❌ Mining failed:', error);
    });

  } catch (error) {
    console.error('Error starting mining:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start mining',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/styleguide/mine/sync
 * Mine all styleguides synchronously (wait for completion)
 */
router.post('/mine/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const miner = getMiner();
    const patterns = await miner.mineAll();
    
    res.json({
      success: true,
      message: 'Animation mining complete',
      data: {
        totalPatterns: patterns.length,
        patterns: patterns.slice(0, 10) // Return first 10 as preview
      },
      meta: {
        completedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error mining animations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mine animations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/styleguide/patterns
 * Get all animation patterns
 */
router.get('/patterns', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const miner = getMiner();
    const { styleguide, component, limit = '100' } = req.query;
    
    let patterns;
    if (styleguide) {
      patterns = await miner.getPatternsByStyleguide(styleguide as string);
    } else if (component) {
      patterns = await miner.getPatternsByComponent(component as string);
    } else {
      // Get all patterns (limited)
      const db = (miner as any).db;
      const result = await db.query(
        'SELECT * FROM animation_patterns ORDER BY created_at DESC LIMIT $1',
        [parseInt(limit as string)]
      );
      patterns = result.rows;
    }
    
    res.json({
      success: true,
      data: patterns,
      meta: {
        count: patterns.length,
        filters: { styleguide, component },
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patterns',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/styleguide/patterns/:styleguide
 * Get patterns for a specific styleguide
 */
router.get('/patterns/:styleguide', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { styleguide } = req.params;
    const miner = getMiner();
    const patterns = await miner.getPatternsByStyleguide(styleguide);
    
    res.json({
      success: true,
      data: patterns,
      meta: {
        styleguide,
        count: patterns.length,
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting styleguide patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve styleguide patterns',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/styleguide/patterns/component/:type
 * Get patterns for a specific component type
 */
router.get('/patterns/component/:type', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const miner = getMiner();
    const patterns = await miner.getPatternsByComponent(type);
    
    res.json({
      success: true,
      data: patterns,
      meta: {
        componentType: type,
        count: patterns.length,
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting component patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve component patterns',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/styleguide/patterns/search
 * Search patterns by tags
 */
router.post('/patterns/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'tags array is required'
      });
    }
    
    const miner = getMiner();
    const patterns = await miner.searchPatternsByTags(tags);
    
    res.json({
      success: true,
      data: patterns,
      meta: {
        tags,
        count: patterns.length,
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error searching patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search patterns',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/styleguide/stats
 * Get mining statistics
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const miner = getMiner();
    const stats = await miner.getStats();
    
    res.json({
      success: true,
      data: stats,
      meta: {
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/styleguide/styleguides
 * Get list of configured styleguides
 */
router.get('/styleguides', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const styleguides = [
      { name: 'anime.js', url: 'https://animejs.com', priority: 9 },
      { name: 'Material Design 3', url: 'https://m3.material.io', priority: 10 },
      { name: 'Framer Motion', url: 'https://www.framer.com/motion', priority: 9 },
      { name: 'Tailwind UI', url: 'https://tailwindui.com', priority: 8 },
      { name: 'Chakra UI', url: 'https://chakra-ui.com', priority: 8 },
      { name: 'Ant Design', url: 'https://ant.design', priority: 8 }
    ];
    
    res.json({
      success: true,
      data: styleguides,
      meta: {
        count: styleguides.length,
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting styleguides:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve styleguides',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
