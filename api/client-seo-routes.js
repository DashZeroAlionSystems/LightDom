/**
 * Client API Routes for SEO Dashboard Embed
 * 
 * Handles API key authentication and provides data for embedded dashboards
 */

import { Router } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

/**
 * @param {Pool} dbPool
 * @returns {import('express').Router}
 */
export function createClientAPIRoutes(dbPool) {
  const router = Router();

  /**
   * Middleware: Verify API key
   */
  const verifyApiKey = async (req, res, next) => {
    try {
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      // Look up campaign by API key
      const result = await dbPool.query(
        'SELECT * FROM client_seo_campaigns WHERE api_key = $1 AND status = $2',
        [apiKey, 'active']
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Attach campaign to request
      req.campaign = result.rows[0];
      next();
    } catch (error) {
      console.error('Error verifying API key:', error);
      res.status(500).json({ error: 'Failed to verify API key' });
    }
  };

  /**
   * GET /api/tensorflow/client/verify
   * Verify API key is valid
   */
  router.get('/verify', verifyApiKey, async (req, res) => {
    res.json({
      valid: true,
      campaignId: req.campaign.id,
      planType: req.campaign.plan_type,
    });
  });

  /**
   * GET /api/tensorflow/client/campaign
   * Get campaign details
   */
  router.get('/campaign', verifyApiKey, async (req, res) => {
    try {
      const campaign = req.campaign;

      res.json({
        id: campaign.id,
        targetUrl: campaign.target_url,
        keywords: campaign.keywords,
        competitors: campaign.competitors,
        status: campaign.status,
        neuralNetworkId: campaign.neural_network_id,
        planType: campaign.plan_type,
        metadata: campaign.metadata,
        createdAt: campaign.created_at,
      });
    } catch (error) {
      console.error('Error getting campaign:', error);
      res.status(500).json({ error: 'Failed to get campaign' });
    }
  });

  /**
   * GET /api/tensorflow/client/reports
   * Get SEO reports for campaign
   */
  router.get('/reports', verifyApiKey, async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const result = await dbPool.query(
        `SELECT * FROM seo_reports 
         WHERE campaign_id = $1 
         ORDER BY generated_at DESC 
         LIMIT $2`,
        [req.campaign.id, limit]
      );

      res.json(result.rows.map(row => ({
        id: row.id,
        reportType: row.report_type,
        data: row.data,
        insights: row.insights,
        recommendations: row.recommendations,
        generatedAt: row.generated_at,
      })));
    } catch (error) {
      console.error('Error getting reports:', error);
      res.status(500).json({ error: 'Failed to get reports' });
    }
  });

  /**
   * GET /api/tensorflow/client/training-metrics
   * Get neural network training metrics
   */
  router.get('/training-metrics', verifyApiKey, async (req, res) => {
    try {
      const neuralNetworkId = req.campaign.neural_network_id;

      if (!neuralNetworkId) {
        return res.json({
          accuracy: 0,
          loss: 0,
          epochs: 0,
          samples: 0,
          status: 'not_started',
        });
      }

      // Get neural network instance
      const nnResult = await dbPool.query(
        'SELECT * FROM neural_network_instances WHERE id = $1',
        [neuralNetworkId]
      );

      if (nnResult.rows.length === 0) {
        return res.json({
          accuracy: 0,
          loss: 0,
          epochs: 0,
          samples: 0,
          status: 'not_found',
        });
      }

      const nn = nnResult.rows[0];
      const performance = nn.performance || {};

      res.json({
        accuracy: performance.accuracy || 0,
        loss: performance.loss || 0,
        epochs: performance.epochs || 0,
        samples: performance.totalSamples || 0,
        status: nn.status || 'unknown',
      });
    } catch (error) {
      console.error('Error getting training metrics:', error);
      res.status(500).json({ error: 'Failed to get training metrics' });
    }
  });

  /**
   * POST /api/tensorflow/client/campaigns
   * Create a new client SEO campaign (admin only)
   */
  router.post('/campaigns', async (req, res) => {
    try {
      const {
        clientId,
        targetUrl,
        keywords,
        competitors,
        planType,
        config,
      } = req.body;

      // Generate unique API key
      const apiKey = crypto.randomBytes(32).toString('hex');

      // Insert campaign
      const result = await dbPool.query(
        `INSERT INTO client_seo_campaigns 
        (id, client_id, target_url, keywords, competitors, status, api_key, plan_type, config, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          `campaign-${Date.now()}`,
          clientId,
          targetUrl,
          JSON.stringify(keywords),
          JSON.stringify(competitors || []),
          'active',
          apiKey,
          planType,
          JSON.stringify(config || {}),
          JSON.stringify({}),
          new Date(),
          new Date(),
        ]
      );

      const campaign = result.rows[0];

      res.status(201).json({
        id: campaign.id,
        clientId: campaign.client_id,
        targetUrl: campaign.target_url,
        apiKey: campaign.api_key,
        planType: campaign.plan_type,
        embedCode: `<script src="${req.protocol}://${req.get('host')}/embed/seo-dashboard.js" data-api-key="${campaign.api_key}"></script>`,
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  /**
   * POST /api/tensorflow/client/reports
   * Generate a new SEO report (triggered by system or admin)
   */
  router.post('/reports', async (req, res) => {
    try {
      const {
        campaignId,
        reportType,
        data,
        insights,
        recommendations,
      } = req.body;

      const result = await dbPool.query(
        `INSERT INTO seo_reports 
        (campaign_id, report_type, data, insights, recommendations, generated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          campaignId,
          reportType,
          JSON.stringify(data),
          JSON.stringify(insights || {}),
          JSON.stringify(recommendations || []),
          new Date(),
        ]
      );

      res.status(201).json({
        id: result.rows[0].id,
        campaignId: result.rows[0].campaign_id,
        reportType: result.rows[0].report_type,
        generatedAt: result.rows[0].generated_at,
      });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Failed to create report' });
    }
  });

  /**
   * GET /api/tensorflow/client/campaigns/:campaignId/embed-code
   * Get embed code for a campaign (admin only)
   */
  router.get('/campaigns/:campaignId/embed-code', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT api_key FROM client_seo_campaigns WHERE id = $1',
        [req.params.campaignId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const apiKey = result.rows[0].api_key;
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      res.json({
        embedCode: `<script src="${baseUrl}/embed/seo-dashboard.js" data-api-key="${apiKey}"></script>`,
        apiKey: apiKey,
        instructions: `Copy and paste this code into your website where you want the SEO dashboard to appear.`,
      });
    } catch (error) {
      console.error('Error getting embed code:', error);
      res.status(500).json({ error: 'Failed to get embed code' });
    }
  });

  return router;
}

export default createClientAPIRoutes;
