/**
 * Crawler Admin API
 * Provides endpoints for admin dashboard to access crawler data
 */

import express from 'express';
import { crawlerDatabaseService } from '../services/CrawlerDatabaseService';

const router = express.Router();

/**
 * Get crawler statistics
 */
router.get('/crawler/stats', async (req, res) => {
  try {
    const stats = await crawlerDatabaseService.getCrawlerStats();

    res.json(stats || {
      total_urls_crawled: 0,
      total_space_saved: 0,
      total_tokens_earned: 0,
      avg_space_per_url: 0,
      active_workers: 0,
      statusBreakdown: []
    });

  } catch (error) {
    console.error('Error getting crawler stats:', error);
    res.status(500).json({
      error: 'Failed to get crawler statistics',
      message: error.message
    });
  }
});

/**
 * Get recent optimizations
 */
router.get('/crawler/optimizations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const optimizations = await crawlerDatabaseService.getRecentOptimizations(limit);

    res.json(optimizations);

  } catch (error) {
    console.error('Error getting optimizations:', error);
    res.status(500).json({
      error: 'Failed to get optimizations',
      message: error.message
    });
  }
});

/**
 * Get active crawlers
 */
router.get('/crawler/active', async (req, res) => {
  try {
    const crawlers = await crawlerDatabaseService.getActiveCrawlers();

    res.json(crawlers);

  } catch (error) {
    console.error('Error getting active crawlers:', error);
    res.status(500).json({
      error: 'Failed to get active crawlers',
      message: error.message
    });
  }
});

/**
 * Manually trigger a crawl
 */
router.post('/crawler/crawl', async (req, res) => {
  try {
    const { url, priority = 5 } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const domain = parsedUrl.hostname;

    // Add to crawl queue
    await crawlerDatabaseService.saveCrawlTarget(url, domain, priority);

    res.json({
      success: true,
      message: 'URL added to crawl queue',
      url,
      domain,
      priority
    });

  } catch (error) {
    console.error('Error triggering crawl:', error);
    res.status(500).json({
      error: 'Failed to trigger crawl',
      message: error.message
    });
  }
});

/**
 * Get crawl targets by status
 */
router.get('/crawler/targets', async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;

    await crawlerDatabaseService.initialize();

    let query = 'SELECT * FROM crawl_targets';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
      query += ' ORDER BY priority DESC, discovered_at DESC LIMIT $2';
      params.push(limit);
    } else {
      query += ' ORDER BY priority DESC, discovered_at DESC LIMIT $1';
      params.push(limit);
    }

    const result = await (await import('../services/DatabaseIntegration.js')).databaseIntegration.query(query, params);

    res.json({
      total: result.rows.length,
      targets: result.rows
    });

  } catch (error) {
    console.error('Error getting crawl targets:', error);
    res.status(500).json({
      error: 'Failed to get crawl targets',
      message: error.message
    });
  }
});

/**
 * Get crawl statistics over time
 */
router.get('/crawler/stats/timeline', async (req, res) => {
  try {
    const { days = 7 } = req.query;

    await crawlerDatabaseService.initialize();

    const result = await (await import('../services/DatabaseIntegration.js')).databaseIntegration.query(
      `SELECT
        DATE(crawl_timestamp) as date,
        COUNT(*) as urls_crawled,
        SUM(space_saved_bytes) as total_space_saved,
        SUM(tokens_earned) as total_tokens_earned,
        AVG(space_saved_bytes) as avg_space_saved
       FROM dom_optimizations
       WHERE crawl_timestamp > NOW() - INTERVAL '${parseInt(days as string)} days'
       GROUP BY DATE(crawl_timestamp)
       ORDER BY date ASC`
    );

    res.json({
      days: parseInt(days as string),
      timeline: result.rows
    });

  } catch (error) {
    console.error('Error getting timeline stats:', error);
    res.status(500).json({
      error: 'Failed to get timeline statistics',
      message: error.message
    });
  }
});

/**
 * Get top optimized domains
 */
router.get('/crawler/top-domains', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    await crawlerDatabaseService.initialize();

    const result = await (await import('../services/DatabaseIntegration.js')).databaseIntegration.query(
      `SELECT
        SUBSTRING(url FROM 'https?://([^/]+)') as domain,
        COUNT(*) as optimization_count,
        SUM(space_saved_bytes) as total_space_saved,
        SUM(tokens_earned) as total_tokens_earned,
        AVG(space_saved_bytes) as avg_space_saved
       FROM dom_optimizations
       GROUP BY domain
       ORDER BY total_space_saved DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error getting top domains:', error);
    res.status(500).json({
      error: 'Failed to get top domains',
      message: error.message
    });
  }
});

export default router;
