/**
 * Crawlee API Routes
 * Provides REST API endpoints for managing Crawlee crawlers
 */

import express from 'express';
import CrawleeService from '../services/crawlee-service.js';

export function createCrawleeRoutes(db) {
  const router = express.Router();
  const crawleeService = new CrawleeService(db);

  // Create a new crawler
  router.post('/crawlers', async (req, res) => {
    try {
      const crawler = await crawleeService.createCrawler(req.body);
      res.json({ success: true, crawler });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // List crawlers
  router.get('/crawlers', async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        campaign_id: req.query.campaign_id,
        type: req.query.type,
        limit: parseInt(req.query.limit) || undefined
      };
      const crawlers = await crawleeService.listCrawlers(filters);
      res.json({ success: true, crawlers });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get crawler details
  router.get('/crawlers/:id', async (req, res) => {
    try {
      const crawler = await crawleeService.getCrawler(req.params.id);
      res.json({ success: true, crawler });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  });

  // Update crawler
  router.put('/crawlers/:id', async (req, res) => {
    try {
      await crawleeService.updateCrawler(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete crawler
  router.delete('/crawlers/:id', async (req, res) => {
    try {
      await crawleeService.deleteCrawler(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Start crawler
  router.post('/crawlers/:id/start', async (req, res) => {
    try {
      const result = await crawleeService.startCrawler(req.params.id, req.body.seedUrls || []);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Pause crawler
  router.post('/crawlers/:id/pause', async (req, res) => {
    try {
      await crawleeService.pauseCrawler(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Resume crawler
  router.post('/crawlers/:id/resume', async (req, res) => {
    try {
      await crawleeService.resumeCrawler(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Stop crawler
  router.post('/crawlers/:id/stop', async (req, res) => {
    try {
      await crawleeService.stopCrawler(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get crawler statistics
  router.get('/crawlers/:id/stats', async (req, res) => {
    try {
      const stats = await crawleeService.getCrawlerStats(req.params.id);
      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Add seeds to crawler
  router.post('/crawlers/:id/seeds', async (req, res) => {
    try {
      const result = await crawleeService.addSeeds(req.params.id, req.body.seeds);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get crawler results
  router.get('/crawlers/:id/results', async (req, res) => {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0
      };
      const results = await crawleeService.getCrawlerResults(req.params.id, options);
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get crawler logs
  router.get('/crawlers/:id/logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const level = req.query.level;
      
      let query = 'SELECT * FROM crawlee_logs WHERE crawler_id = $1';
      const params = [req.params.id];
      
      if (level) {
        query += ' AND level = $2';
        params.push(level);
      }
      
      query += ' ORDER BY created_at DESC LIMIT $' + (level ? 3 : 2);
      params.push(limit);
      
      const result = await db.query(query, params);
      res.json({ success: true, logs: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get crawler types (available crawler types)
  router.get('/crawler-types', (req, res) => {
    res.json({
      success: true,
      types: [
        {
          id: 'cheerio',
          name: 'Cheerio Crawler',
          description: 'Fast HTML parser, best for static pages',
          features: ['Fast', 'Low memory', 'No JavaScript execution']
        },
        {
          id: 'playwright',
          name: 'Playwright Crawler',
          description: 'Full browser automation with Playwright',
          features: ['JavaScript execution', 'Modern browser', 'Network control']
        },
        {
          id: 'puppeteer',
          name: 'Puppeteer Crawler',
          description: 'Chrome/Chromium automation',
          features: ['JavaScript execution', 'Chrome DevTools Protocol', 'Screenshots']
        },
        {
          id: 'jsdom',
          name: 'JSDOM Crawler',
          description: 'JavaScript DOM implementation',
          features: ['JavaScript execution', 'Fast', 'Node.js based']
        },
        {
          id: 'http',
          name: 'HTTP Crawler',
          description: 'Simple HTTP client',
          features: ['Very fast', 'Minimal overhead', 'Raw HTTP']
        }
      ]
    });
  });

  // Get default configuration template
  router.get('/config-template', (req, res) => {
    res.json({
      success: true,
      template: {
        name: 'My Crawler',
        description: 'Crawler description',
        type: 'cheerio',
        config: {
          maxRequestsPerCrawl: 1000,
          maxConcurrency: 10,
          minConcurrency: 1,
          maxRequestRetries: 3,
          requestHandlerTimeoutSecs: 60
        },
        url_patterns: {
          include: ['*'],
          exclude: [],
          maxDepth: 3,
          sameDomain: true,
          respectRobotsTxt: true
        },
        selectors: {
          title: 'h1',
          description: 'meta[name="description"]',
          content: '.main-content'
        }
      }
    });
  });

  return router;
}

export default createCrawleeRoutes;
