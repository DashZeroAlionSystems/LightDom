/**
 * Storybook Discovery API Routes
 * 
 * REST API for Storybook discovery, crawling, and component mining
 */

import express from 'express';
import { StorybookCrawler } from '../services/storybook-crawler.js';
import { StorybookSeederService } from '../services/storybook-seeder-service.js';
import { StorybookDiscoveryService } from '../services/storybook-discovery-service.js';

const router = express.Router();

// Store active crawler instances
const activeCrawlers = new Map();

/**
 * Get crawler instance or create new one
 */
function getCrawler(sessionId = 'default') {
  if (!activeCrawlers.has(sessionId)) {
    const crawler = new StorybookCrawler({
      maxConcurrency: 3,
      requestDelay: 2000,
      maxDepth: 2,
    });
    activeCrawlers.set(sessionId, crawler);
  }
  return activeCrawlers.get(sessionId);
}

/**
 * Start Storybook discovery and crawling
 * POST /api/storybook-discovery/start
 */
router.post('/start', async (req, res) => {
  try {
    const {
      sessionId = 'default',
      maxSeeds = 50,
      discover = true,
      config = {},
    } = req.body;
    
    const crawler = new StorybookCrawler(config);
    activeCrawlers.set(sessionId, crawler);
    
    // Start crawling in background
    crawler.start({ maxSeeds, discover }).catch(error => {
      console.error('Crawler error:', error);
    });
    
    // Listen for events
    crawler.on('instance:crawled', (data) => {
      console.log(`Instance crawled: ${data.url}`);
    });
    
    res.json({
      success: true,
      sessionId,
      message: 'Storybook discovery started',
      status: 'running',
    });
    
  } catch (error) {
    console.error('Failed to start discovery:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Stop active crawler
 * POST /api/storybook-discovery/stop
 */
router.post('/stop', async (req, res) => {
  try {
    const { sessionId = 'default' } = req.body;
    
    if (!activeCrawlers.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Crawler session not found',
      });
    }
    
    const crawler = activeCrawlers.get(sessionId);
    await crawler.stop();
    
    res.json({
      success: true,
      message: 'Crawler stopped',
      stats: crawler.getStats(),
    });
    
  } catch (error) {
    console.error('Failed to stop crawler:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get crawler statistics
 * GET /api/storybook-discovery/stats
 */
router.get('/stats', (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    
    if (!activeCrawlers.has(sessionId)) {
      return res.json({
        success: true,
        stats: {
          instancesCrawled: 0,
          componentsMined: 0,
          status: 'not started',
        },
      });
    }
    
    const crawler = activeCrawlers.get(sessionId);
    const stats = crawler.getStats();
    
    res.json({
      success: true,
      stats,
    });
    
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get crawled data
 * GET /api/storybook-discovery/data
 */
router.get('/data', async (req, res) => {
  try {
    const { sessionId = 'default', format = 'json' } = req.query;
    
    if (!activeCrawlers.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Crawler session not found',
      });
    }
    
    const crawler = activeCrawlers.get(sessionId);
    const data = await crawler.exportData(format);
    
    res.json({
      success: true,
      data: typeof data === 'string' ? JSON.parse(data) : data,
    });
    
  } catch (error) {
    console.error('Failed to get crawled data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate seeds for Storybook discovery
 * POST /api/storybook-discovery/seeds/generate
 */
router.post('/seeds/generate', async (req, res) => {
  try {
    const config = req.body.config || {};
    const seeder = new StorybookSeederService(config);
    
    const seeds = await seeder.generateSeeds();
    const stats = seeder.getStats();
    
    res.json({
      success: true,
      seeds: seeds.slice(0, 100), // Return first 100
      total: seeds.length,
      stats,
    });
    
  } catch (error) {
    console.error('Failed to generate seeds:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Discover Storybook instances from URLs
 * POST /api/storybook-discovery/discover
 */
router.post('/discover', async (req, res) => {
  try {
    const { urls, config = {} } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'URLs array is required',
      });
    }
    
    const discovery = new StorybookDiscoveryService(config);
    await discovery.initialize();
    
    // Start discovery in background
    discovery.start(urls).catch(error => {
      console.error('Discovery error:', error);
    });
    
    // Wait a bit for initial results
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const stats = discovery.getStats();
    
    res.json({
      success: true,
      message: 'Discovery started',
      stats,
    });
    
  } catch (error) {
    console.error('Failed to start discovery:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Crawl specific Storybook URL
 * POST /api/storybook-discovery/crawl
 */
router.post('/crawl', async (req, res) => {
  try {
    const { url, sessionId = 'default', config = {} } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }
    
    const crawler = getCrawler(sessionId);
    await crawler.initialize();
    
    // Crawl single instance
    await crawler.crawlStorybookInstance(url);
    
    const stats = crawler.getStats();
    
    res.json({
      success: true,
      message: 'Crawl complete',
      stats,
    });
    
  } catch (error) {
    console.error('Failed to crawl:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get list of active sessions
 * GET /api/storybook-discovery/sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = Array.from(activeCrawlers.keys()).map(sessionId => {
      const crawler = activeCrawlers.get(sessionId);
      return {
        sessionId,
        stats: crawler.getStats(),
      };
    });
    
    res.json({
      success: true,
      sessions,
      total: sessions.length,
    });
    
  } catch (error) {
    console.error('Failed to get sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Cleanup inactive crawlers
 */
setInterval(() => {
  for (const [sessionId, crawler] of activeCrawlers.entries()) {
    if (!crawler.isRunning) {
      crawler.close().catch(console.error);
      activeCrawlers.delete(sessionId);
      console.log(`🧹 Cleaned up inactive crawler: ${sessionId}`);
    }
  }
}, 300000); // Every 5 minutes

export default router;
