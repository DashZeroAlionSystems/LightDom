/**
 * SEO Campaign CRUD API Routes
 * 
 * Implements schema-based CRUD operations for:
 * - Campaigns
 * - Services
 * - Crawlers
 * - Seeds
 * - Data Streams
 * - Workflows
 * 
 * Follows campaignCRUDRules for automatic wiring
 */

import { Router } from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { campaignSchemas, campaignCRUDRules, campaignDefaults } from '../schemas/campaign-schemas.js';
import EnhancedDeepSeekN8NService from '../services/enhanced-deepseek-n8n-service.js';

export function createSEOCampaignCRUDRoutes(dbPool, io) {
  const router = Router();
  const deepseekService = new EnhancedDeepSeekN8NService();

  /**
   * POST /api/seo-campaign/campaigns/create-complete
   * Create a complete SEO campaign with all wiring
   */
  router.post('/campaigns/create-complete', async (req, res) => {
    const { name, targetUrl, description, template = 'standard', keywords = [], competitors = [] } = req.body;

    try {
      // Get template defaults
      const templateConfig = campaignDefaults[template] || campaignDefaults.standard;

      // Step 1: Initialize Campaign
      const campaignId = uuidv4();
      const campaign = {
        ...campaignSchemas.campaign,
        id: campaignId,
        name: name || templateConfig.name,
        description,
        targetUrl,
        keywords,
        competitors,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Step 2: Configure Services
      const services = [];
      for (const serviceType of templateConfig.services) {
        const serviceId = uuidv4();
        const service = {
          ...campaignSchemas.service,
          id: serviceId,
          name: `${name} - ${serviceType}`,
          type: serviceType,
          status: 'active',
          config: {
            ...campaignSchemas.service.config,
            enabled: true,
            autoStart: true
          },
          createdAt: new Date().toISOString()
        };
        services.push(service);

        await dbPool.query(
          `INSERT INTO campaign_services (id, name, type, status, config, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [service.id, service.name, service.type, service.status, JSON.stringify(service.config), service.createdAt]
        );
      }

      // Step 3: Select Attributes
      let attributeIds = [];
      if (templateConfig.attributes.includes('all')) {
        const result = await dbPool.query(
          `SELECT id FROM seo_attributes_config WHERE is_active = true`
        );
        attributeIds = result.rows.map(r => r.id);
      } else {
        const result = await dbPool.query(
          `SELECT id FROM seo_attributes_config 
           WHERE is_active = true AND category = ANY($1)`,
          [templateConfig.attributes]
        );
        attributeIds = result.rows.map(r => r.id);
      }

      // Step 4: Generate Seeds
      const seeds = [];
      
      // AI-generated seeds
      const prompt = `Generate ${templateConfig.seedCount || 50} important URL seeds for crawling ${targetUrl} to gather comprehensive SEO data. Include sitemap, key pages, and category pages.`;
      try {
        const aiSeeds = await deepseekService.searchOrGenerateAlgorithm('url_seeds', 'array', prompt);
        // Parse AI response and create seeds
        const seedUrls = aiSeeds ? JSON.parse(aiSeeds) : [targetUrl];
        
        for (const url of seedUrls.slice(0, templateConfig.seedCount || 50)) {
          const seedId = uuidv4();
          const seed = {
            ...campaignSchemas.seed,
            id: seedId,
            url: url,
            type: 'ai-generated',
            priority: 5,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          seeds.push(seed);

          await dbPool.query(
            `INSERT INTO campaign_seeds (id, url, type, priority, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [seed.id, seed.url, seed.type, seed.priority, seed.status, seed.createdAt]
          );
        }
      } catch (error) {
        console.error('Error generating AI seeds:', error);
        // Fallback to target URL
        const seedId = uuidv4();
        const seed = {
          ...campaignSchemas.seed,
          id: seedId,
          url: targetUrl,
          type: 'manual',
          priority: 10,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        seeds.push(seed);

        await dbPool.query(
          `INSERT INTO campaign_seeds (id, url, type, priority, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [seed.id, seed.url, seed.type, seed.priority, seed.status, seed.createdAt]
        );
      }

      // Step 5: Configure Crawler
      const crawlerId = uuidv4();
      const crawler = {
        ...campaignSchemas.crawler,
        id: crawlerId,
        name: `${name} - Crawler`,
        description: `Crawler for ${targetUrl}`,
        targetUrl,
        seedUrls: seeds.map(s => s.url),
        config: {
          ...campaignSchemas.crawler.config,
          maxPages: templateConfig.maxPages
        },
        extraction: {
          attributes: attributeIds,
          customSelectors: {},
          dataTransforms: []
        },
        status: 'idle',
        createdAt: new Date().toISOString()
      };

      await dbPool.query(
        `INSERT INTO campaign_crawlers (id, name, description, target_url, seed_urls, config, extraction, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [crawler.id, crawler.name, crawler.description, crawler.targetUrl, JSON.stringify(crawler.seedUrls), 
         JSON.stringify(crawler.config), JSON.stringify(crawler.extraction), crawler.status, crawler.createdAt]
      );

      // Step 6: Setup Data Streams
      const dataStreams = [];
      
      // Crawler to Database stream
      const streamId1 = uuidv4();
      const stream1 = {
        ...campaignSchemas.dataStream,
        id: streamId1,
        name: `${name} - Crawler to Database`,
        type: 'realtime',
        source: { type: 'crawler', id: crawlerId },
        destination: { type: 'database', config: { table: 'seo_mining_results', schema: 'public' } },
        status: 'inactive',
        createdAt: new Date().toISOString()
      };
      dataStreams.push(stream1);

      await dbPool.query(
        `INSERT INTO campaign_data_streams (id, name, type, source, destination, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [stream1.id, stream1.name, stream1.type, JSON.stringify(stream1.source), 
         JSON.stringify(stream1.destination), stream1.status, stream1.createdAt]
      );

      // Step 7: Generate Workflows
      const workflows = [];
      
      // SEO Mining Workflow
      const workflowId = uuidv4();
      const miningWorkflow = await deepseekService.generateCompleteSEOWorkflow(targetUrl, {
        campaignId,
        crawlerId,
        attributeIds,
        template
      });

      if (miningWorkflow.success) {
        await dbPool.query(
          `INSERT INTO seo_campaign_workflows (
            campaign_id, name, description, status, workflow_type,
            n8n_workflow_id, generated_config, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id`,
          [
            campaignId,
            `${name} - SEO Mining`,
            'Comprehensive SEO data mining workflow',
            'created',
            'comprehensive_seo',
            miningWorkflow.workflow?.id || null,
            JSON.stringify(miningWorkflow.workflow || {}),
            JSON.stringify({ template, createdBy: 'campaign-crud' })
          ]
        );

        workflows.push(miningWorkflow.workflow);
      }

      // Step 8: Link Components - Update campaign with all IDs
      campaign.services = {
        crawler: services.find(s => s.type === 'crawler')?.id || null,
        analyzer: services.find(s => s.type === 'analyzer')?.id || null,
        miner: services.find(s => s.type === 'miner')?.id || null,
        neuralNetwork: services.find(s => s.type === 'neuralNetwork')?.id || null
      };
      campaign.attributes = attributeIds;
      campaign.seeds = seeds.map(s => s.id);
      campaign.dataStreams = dataStreams.map(d => d.id);
      campaign.workflows = {
        mining: workflowId,
        analysis: null,
        optimization: null,
        reporting: null
      };

      // Save complete campaign
      await dbPool.query(
        `INSERT INTO seo_campaigns (
          id, name, description, target_url, client_id, keywords, competitors,
          services, attributes, seeds, data_streams, workflows,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          campaign.id, campaign.name, campaign.description, campaign.targetUrl, null,
          JSON.stringify(campaign.keywords), JSON.stringify(campaign.competitors),
          JSON.stringify(campaign.services), JSON.stringify(campaign.attributes),
          JSON.stringify(campaign.seeds), JSON.stringify(campaign.dataStreams),
          JSON.stringify(campaign.workflows), campaign.status,
          campaign.createdAt, campaign.updatedAt
        ]
      );

      // Step 9: Activate Campaign (if template requires)
      if (template === 'professional' || template === 'enterprise') {
        await activateCampaign(campaign.id, dbPool);
      }

      res.json({
        success: true,
        campaign,
        services,
        seeds: seeds.length,
        crawler,
        dataStreams,
        workflows,
        message: 'Campaign created successfully with all components wired'
      });

    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/seo-campaign/campaigns
   * Get all campaigns with populated data
   */
  router.get('/campaigns', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT * FROM seo_campaigns ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        campaigns: result.rows
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/seo-campaign/services
   */
  router.get('/services', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT * FROM campaign_services ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        services: result.rows
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/seo-campaign/crawlers
   */
  router.get('/crawlers', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT * FROM campaign_crawlers ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        crawlers: result.rows
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/seo-campaign/seeds
   */
  router.get('/seeds', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT * FROM campaign_seeds ORDER BY priority DESC, created_at DESC`
      );

      res.json({
        success: true,
        seeds: result.rows
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/seo-campaign/data-streams
   */
  router.get('/data-streams', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT * FROM campaign_data_streams ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        streams: result.rows
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/seo-campaign/campaigns/:id/toggle
   * Toggle campaign status (active/paused)
   */
  router.post('/campaigns/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await dbPool.query(
        `UPDATE seo_campaigns 
         SET status = CASE WHEN status = 'active' THEN 'paused' ELSE 'active' END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      res.json({
        success: true,
        campaign: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * DELETE /api/seo-campaign/:type/:id
   * Generic delete endpoint
   */
  router.delete('/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const tableMap = {
        campaign: 'seo_campaigns',
        service: 'campaign_services',
        crawler: 'campaign_crawlers',
        seed: 'campaign_seeds',
        dataStream: 'campaign_data_streams'
      };

      const table = tableMap[type];
      if (!table) {
        return res.status(400).json({ success: false, error: 'Invalid entity type' });
      }

      await dbPool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

      res.json({ success: true, message: `${type} deleted successfully` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

/**
 * Helper function to activate a campaign
 */
async function activateCampaign(campaignId, dbPool) {
  // Update campaign status
  await dbPool.query(
    `UPDATE seo_campaigns SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [campaignId]
  );

  // Activate all related services
  await dbPool.query(
    `UPDATE campaign_services SET status = 'active' 
     WHERE id IN (
       SELECT jsonb_array_elements_text(services::jsonb) FROM seo_campaigns WHERE id = $1
     )`,
    [campaignId]
  );

  // Activate data streams
  await dbPool.query(
    `UPDATE campaign_data_streams SET status = 'active'
     WHERE id IN (
       SELECT jsonb_array_elements_text(data_streams::jsonb) FROM seo_campaigns WHERE id = $1
     )`,
    [campaignId]
  );

  console.log(`Campaign ${campaignId} activated`);
}

export default createSEOCampaignCRUDRoutes;
