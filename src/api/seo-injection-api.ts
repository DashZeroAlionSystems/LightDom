/**
 * SEO Injection API Endpoints
 *
 * Provides endpoints for the injectable SEO SDK to fetch
 * optimization configurations and submit analytics data.
 */

import express, { Request, Response, Router } from 'express';
import { SEOInjectionService } from '../services/api/SEOInjectionService';
import { SEOAnalyticsService } from '../services/api/SEOAnalyticsService';
import crypto from 'crypto';

export function createSEOInjectionAPI(pgPool: any): Router {
  const router = express.Router();
  const injectionService = new SEOInjectionService(pgPool);
  const analyticsService = new SEOAnalyticsService(pgPool);

  /**
   * GET /api/v1/seo/config/:apiKey
   * Get optimization configuration for a specific page
   */
  router.get('/config/:apiKey', async (req: Request, res: Response) => {
    try {
      const { apiKey } = req.params;
      const url = req.query.url as string;
      const pathname = req.query.path as string || '/';

      if (!apiKey || !url) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'API key and URL are required'
        });
      }

      // Check rate limit
      const withinLimit = await injectionService.checkRateLimit(apiKey);
      if (!withinLimit) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'You have exceeded your API call limit for today'
        });
      }

      // Track API usage
      await injectionService.trackApiUsage(apiKey);

      // Get optimization config
      const config = await injectionService.getOptimizationConfig(apiKey, url, pathname);

      if (!config) {
        return res.status(404).json({
          error: 'Configuration not found',
          message: 'No optimization configuration available'
        });
      }

      res.json(config);
    } catch (error: any) {
      console.error('Error in GET /api/v1/seo/config:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/seo/analytics
   * Receive analytics data from SDK
   */
  router.post('/analytics', async (req: Request, res: Response) => {
    try {
      const { apiKey, data } = req.body;

      if (!apiKey || !data) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'API key and analytics data are required'
        });
      }

      // Process analytics data
      await analyticsService.processAnalyticsData(apiKey, data);

      res.json({
        success: true,
        message: 'Analytics data received'
      });
    } catch (error: any) {
      console.error('Error in POST /api/v1/seo/analytics:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/seo/crawl
   * Request a fresh crawl for the current page
   */
  router.post('/crawl', async (req: Request, res: Response) => {
    try {
      const { apiKey, url, pathname = '/', plan, sessionId } = req.body;

      if (!apiKey || !url) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'API key and url are required'
        });
      }

      await injectionService.requestCrawl(apiKey, url, pathname, plan, sessionId);

      res.json({
        success: true,
        message: 'Crawl queued'
      });
    } catch (error: any) {
      console.error('Error in POST /api/v1/seo/crawl:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/seo/clients
   * Register a new SEO client
   */
  router.post('/clients', async (req: Request, res: Response) => {
    try {
      const { userId, domain, subscriptionTier = 'starter', config = {} } = req.body;

      if (!userId || !domain) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'User ID and domain are required'
        });
      }

      // Generate API key
      const apiKey = `ld_live_${crypto.randomBytes(24).toString('hex')}`;
      const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      // Get subscription plan limits
      const planResult = await pgPool.query(
        'SELECT page_view_limit, api_call_limit FROM seo_subscription_plans WHERE plan_name = $1',
        [subscriptionTier]
      );

      const plan = planResult.rows[0] || { page_view_limit: 10000, api_call_limit: 10000 };

      // Create client
      const result = await pgPool.query(
        `INSERT INTO seo_clients
         (user_id, domain, api_key, api_key_hash, subscription_tier,
          page_view_limit, api_call_limit, config, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, domain, api_key, subscription_tier, status, created_at`,
        [
          userId,
          domain,
          apiKey,
          apiKeyHash,
          subscriptionTier,
          plan.page_view_limit,
          plan.api_call_limit,
          JSON.stringify(config),
          'active'
        ]
      );

      const client = result.rows[0];

      res.status(201).json({
        success: true,
        client: {
          id: client.id,
          domain: client.domain,
          apiKey: client.api_key,
          subscriptionTier: client.subscription_tier,
          status: client.status,
          createdAt: client.created_at
        },
        message: 'Client registered successfully'
      });
    } catch (error: any) {
      console.error('Error in POST /api/v1/seo/clients:', error);

      if (error.code === '23505') { // Unique violation
        return res.status(409).json({
          error: 'Domain already registered',
          message: 'This domain is already registered'
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/seo/clients/:clientId
   * Get client details
   */
  router.get('/clients/:clientId', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;

      const result = await pgPool.query(
        `SELECT
           id, user_id, domain, subscription_tier, monthly_page_views,
           page_view_limit, api_calls_today, api_call_limit, status,
           config, created_at, updated_at
         FROM seo_clients
         WHERE id = $1`,
        [clientId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Client not found',
          message: 'No client found with the provided ID'
        });
      }

      const client = result.rows[0];

      // Check limits
      const limitsResult = await pgPool.query(
        'SELECT * FROM check_seo_subscription_limits($1)',
        [clientId]
      );

      const limits = limitsResult.rows[0];

      res.json({
        client,
        limits
      });
    } catch (error: any) {
      console.error('Error in GET /api/v1/seo/clients/:clientId:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/v1/seo/clients/:clientId
   * Update client configuration
   */
  router.put('/clients/:clientId', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { config, settings } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (config) {
        updates.push(`config = $${paramCount}`);
        values.push(JSON.stringify(config));
        paramCount++;
      }

      if (settings) {
        updates.push(`settings = $${paramCount}`);
        values.push(JSON.stringify(settings));
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          error: 'No updates provided',
          message: 'Please provide config or settings to update'
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(clientId);

      const result = await pgPool.query(
        `UPDATE seo_clients
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, domain, config, settings, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Client not found',
          message: 'No client found with the provided ID'
        });
      }

      res.json({
        success: true,
        client: result.rows[0],
        message: 'Client updated successfully'
      });
    } catch (error: any) {
      console.error('Error in PUT /api/v1/seo/clients/:clientId:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/v1/seo/clients/:clientId
   * Delete a client
   */
  router.delete('/clients/:clientId', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;

      const result = await pgPool.query(
        'DELETE FROM seo_clients WHERE id = $1 RETURNING id',
        [clientId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Client not found',
          message: 'No client found with the provided ID'
        });
      }

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in DELETE /api/v1/seo/clients/:clientId:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/seo/config/:clientId
   * Save optimization configuration
   */
  router.post('/config/:clientId', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { pagePattern, schemas, metaTags, abTestVariant } = req.body;

      if (!pagePattern || !schemas || !metaTags) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'Page pattern, schemas, and meta tags are required'
        });
      }

      const configId = await injectionService.saveOptimizationConfig(
        clientId,
        pagePattern,
        schemas,
        metaTags,
        abTestVariant
      );

      res.status(201).json({
        success: true,
        configId,
        message: 'Optimization configuration saved'
      });
    } catch (error: any) {
      console.error('Error in POST /api/v1/seo/config/:clientId:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/seo/analytics/:clientId
   * Get analytics dashboard data
   */
  router.get('/analytics/:clientId', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const timeRange = (req.query.timeRange as string) || '7d';

      const dashboardData = await analyticsService.getDashboardData(clientId, timeRange);

      res.json(dashboardData);
    } catch (error: any) {
      console.error('Error in GET /api/v1/seo/analytics/:clientId:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/seo/analytics/:clientId/reports
   * Generate SEO report
   */
  router.get('/analytics/:clientId/reports', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const timeRange = (req.query.timeRange as string) || '30d';

      const report = await analyticsService.generateReport(clientId, timeRange);

      res.json(report);
    } catch (error: any) {
      console.error('Error in GET /api/v1/seo/analytics/:clientId/reports:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/seo/plans
   * Get available subscription plans
   */
  router.get('/plans', async (req: Request, res: Response) => {
    try {
      const result = await pgPool.query(
        `SELECT
           plan_name, display_name, description,
           price_monthly, price_yearly,
           page_view_limit, api_call_limit,
           features, schema_types, max_domains,
           has_ab_testing, has_api_access, has_white_label,
           has_custom_models, has_priority_support, has_dedicated_support
         FROM seo_subscription_plans
         WHERE active = true
         ORDER BY price_monthly ASC`
      );

      res.json({
        plans: result.rows
      });
    } catch (error: any) {
      console.error('Error in GET /api/v1/seo/plans:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/seo/health
   * Health check endpoint
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      // Check database connection
      await pgPool.query('SELECT 1');

      res.json({
        status: 'healthy',
        service: 'SEO Injection API',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        service: 'SEO Injection API',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
}

export default createSEOInjectionAPI;
