/**
 * Neural SEO Campaign API Routes
 * 
 * Exposes the integrated SEO campaign service via REST API
 */

import { Router } from 'express';
import { Pool } from 'pg';
import IntegratedSEOCampaignService from '../services/integrated-seo-campaign-service.js';

export function createNeuralSEOCampaignRoutes(dbPool) {
  const router = Router();
  
  // Initialize the integrated service
  const seoCampaignService = new IntegratedSEOCampaignService({
    db: dbPool,
    campaignName: 'api-campaign',
    enableNeuralNetwork: true,
    enableDataStreams: true,
    enableMonitoring: true,
    continuousCrawling: false // Controlled via API
  });

  // Initialize on module load
  let initPromise = seoCampaignService.initialize().catch(error => {
    console.error('Failed to initialize SEO Campaign Service:', error);
  });

  // ===========================================
  // Service Status & Health
  // ===========================================

  /**
   * GET /api/neural-seo/health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    try {
      const status = seoCampaignService.getStatus();
      res.json({
        status: status.isRunning ? 'healthy' : 'initializing',
        timestamp: new Date().toISOString(),
        service: status
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/status
   * Get full service status
   */
  router.get('/status', async (req, res) => {
    try {
      await initPromise; // Wait for initialization
      const status = seoCampaignService.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/monitoring
   * Get monitoring metrics
   */
  router.get('/monitoring', async (req, res) => {
    try {
      const monitoring = seoCampaignService.getMonitoring();
      res.json(monitoring);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Campaign Management
  // ===========================================

  /**
   * POST /api/neural-seo/campaigns
   * Create a new SEO campaign
   */
  router.post('/campaigns', async (req, res) => {
    try {
      await initPromise;
      
      const { name, type, startUrls, config } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Campaign name is required' });
      }
      
      if (!startUrls || !Array.isArray(startUrls) || startUrls.length === 0) {
        return res.status(400).json({ error: 'At least one start URL is required' });
      }

      const campaign = await seoCampaignService.createCampaign({
        name,
        type: type || 'continuous',
        startUrls,
        ...config
      });

      res.status(201).json({
        message: 'Campaign created successfully',
        campaign: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          neuralInstanceId: campaign.neuralInstance?.id,
          dataStreams: campaign.dataStreams,
          stats: campaign.stats
        }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/campaigns
   * Get all campaigns
   */
  router.get('/campaigns', async (req, res) => {
    try {
      await initPromise;
      const campaigns = seoCampaignService.getAllCampaigns();
      res.json({
        total: campaigns.length,
        campaigns: campaigns.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          status: c.status,
          stats: c.stats
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/campaigns/:id
   * Get specific campaign
   */
  router.get('/campaigns/:id', async (req, res) => {
    try {
      await initPromise;
      const campaign = seoCampaignService.getCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-seo/campaigns/:id/queue-url
   * Add URL to campaign queue
   */
  router.post('/campaigns/:id/queue-url', async (req, res) => {
    try {
      await initPromise;
      
      const { url, priority, depth } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      await seoCampaignService.queueUrl(
        req.params.id,
        url,
        depth || 0,
        priority || 0
      );

      res.json({
        message: 'URL queued successfully',
        url,
        campaignId: req.params.id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/campaigns/:id/results
   * Get campaign crawl results
   */
  router.get('/campaigns/:id/results', async (req, res) => {
    try {
      await initPromise;
      
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      const result = await dbPool.query(
        `SELECT * FROM seo_campaign_crawl_results 
         WHERE campaign_id = $1 
         ORDER BY crawled_at DESC 
         LIMIT $2 OFFSET $3`,
        [req.params.id, limit, offset]
      );

      res.json({
        total: result.rows.length,
        limit,
        offset,
        results: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/campaigns/:id/metrics
   * Get campaign metrics
   */
  router.get('/campaigns/:id/metrics', async (req, res) => {
    try {
      await initPromise;
      
      const timeWindow = req.query.timeWindow || '24h';
      
      const result = await dbPool.query(
        `SELECT metric_type, AVG(metric_value) as avg_value, 
                MAX(metric_value) as max_value, MIN(metric_value) as min_value
         FROM seo_campaign_metrics 
         WHERE campaign_id = $1 
         AND recorded_at > NOW() - INTERVAL '${timeWindow}'
         GROUP BY metric_type`,
        [req.params.id]
      );

      res.json({
        timeWindow,
        metrics: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Data Streams
  // ===========================================

  /**
   * GET /api/neural-seo/streams
   * Get all data streams
   */
  router.get('/streams', async (req, res) => {
    try {
      await initPromise;
      
      if (!seoCampaignService.dataStreamService) {
        return res.status(503).json({ error: 'Data stream service not available' });
      }

      const streams = seoCampaignService.dataStreamService.getAllStreams();
      res.json({
        total: streams.length,
        streams: streams.map(s => ({
          id: s.id,
          name: s.name,
          type: s.type,
          attributes: s.attributes,
          status: s.status,
          metrics: s.metrics,
          subscriberCount: s.subscribers?.size || 0
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-seo/streams
   * Create a new data stream
   */
  router.post('/streams', async (req, res) => {
    try {
      await initPromise;
      
      if (!seoCampaignService.dataStreamService) {
        return res.status(503).json({ error: 'Data stream service not available' });
      }

      const { name, attributes, type } = req.body;
      
      if (!name || !attributes) {
        return res.status(400).json({ error: 'Name and attributes are required' });
      }

      let stream;
      if (type === 'single' && attributes.length === 1) {
        stream = await seoCampaignService.dataStreamService.createAttributeStream(
          attributes[0],
          { name }
        );
      } else {
        stream = await seoCampaignService.dataStreamService.createBundledStream(
          name,
          attributes
        );
      }

      res.status(201).json({
        message: 'Stream created successfully',
        stream: {
          id: stream.id,
          name: stream.name,
          type: stream.type,
          attributes: stream.attributes
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/streams/:id
   * Get specific stream
   */
  router.get('/streams/:id', async (req, res) => {
    try {
      await initPromise;
      
      if (!seoCampaignService.dataStreamService) {
        return res.status(503).json({ error: 'Data stream service not available' });
      }

      const stream = seoCampaignService.dataStreamService.getStream(req.params.id);
      
      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }

      res.json(stream);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-seo/streams/:id/push
   * Push data to stream
   */
  router.post('/streams/:id/push', async (req, res) => {
    try {
      await initPromise;
      
      if (!seoCampaignService.dataStreamService) {
        return res.status(503).json({ error: 'Data stream service not available' });
      }

      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Data is required' });
      }

      const message = await seoCampaignService.dataStreamService.pushToStream(
        req.params.id,
        data
      );

      res.json({
        message: 'Data pushed successfully',
        messageId: message.id,
        timestamp: message.timestamp
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Neural Network
  // ===========================================

  /**
   * GET /api/neural-seo/neural/status
   * Get neural network status
   */
  router.get('/neural/status', async (req, res) => {
    try {
      await initPromise;
      
      if (!seoCampaignService.neuralOrchestrator) {
        return res.status(503).json({ error: 'Neural orchestrator not available' });
      }

      const status = seoCampaignService.neuralOrchestrator.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-seo/neural/train
   * Train neural network with provided data
   */
  router.post('/neural/train', async (req, res) => {
    try {
      await initPromise;
      
      if (!seoCampaignService.neuralOrchestrator) {
        return res.status(503).json({ error: 'Neural orchestrator not available' });
      }

      const { instanceId, trainingData } = req.body;
      
      if (!instanceId || !trainingData) {
        return res.status(400).json({ error: 'Instance ID and training data are required' });
      }

      const metrics = await seoCampaignService.neuralOrchestrator.trainNeuralNetwork(
        instanceId,
        trainingData
      );

      res.json({
        message: 'Training completed',
        metrics
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Configuration & Attributes
  // ===========================================

  /**
   * GET /api/neural-seo/attributes
   * Get all attribute configurations
   */
  router.get('/attributes', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT * FROM attribute_configurations WHERE active = true'
      );

      res.json({
        total: result.rows.length,
        attributes: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/attributes/:name
   * Get specific attribute configuration
   */
  router.get('/attributes/:name', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT * FROM attribute_configurations WHERE attribute_name = $1',
        [req.params.name]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attribute not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // WebSocket Support (for real-time streaming)
  // ===========================================

  /**
   * WebSocket endpoint would be handled separately
   * This route provides the WebSocket connection info
   */
  router.get('/ws-info', (req, res) => {
    res.json({
      websocketUrl: process.env.WS_URL || 'ws://localhost:3002',
      protocols: ['websocket'],
      description: 'Connect to this URL for real-time data streaming'
    });
  });

  // ===========================================
  // Background Mining & Advanced Features
  // ===========================================

  /**
   * POST /api/neural-seo/background-mining/start
   * Start background attribute mining
   */
  router.post('/background-mining/start', async (req, res) => {
    try {
      await initPromise;
      
      const { urls } = req.body;
      
      if (urls && Array.isArray(urls)) {
        seoCampaignService.config.backgroundMiningUrls = urls;
      }
      
      await seoCampaignService.startBackgroundMining();
      
      res.json({
        message: 'Background mining started',
        status: 'active',
        interval: seoCampaignService.config.backgroundMiningInterval
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-seo/background-mining/stop
   * Stop background attribute mining
   */
  router.post('/background-mining/stop', async (req, res) => {
    try {
      await initPromise;
      
      seoCampaignService.stopBackgroundMining();
      
      res.json({
        message: 'Background mining stopped',
        status: 'inactive'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-seo/backlink/recommendations/:url
   * Get backlink recommendations for a URL
   */
  router.get('/backlink/recommendations/:url', async (req, res) => {
    try {
      await initPromise;
      
      const url = decodeURIComponent(req.params.url);
      
      // Get recent crawl data for URL
      const result = await dbPool.query(
        'SELECT attributes FROM seo_campaign_crawl_results WHERE url = $1 ORDER BY crawled_at DESC LIMIT 1',
        [url]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'URL not found in crawl results' });
      }
      
      const attributes = result.rows[0].attributes;
      const recommendations = await seoCampaignService.getBacklinkRecommendations(url, attributes);
      
      res.json({
        url,
        recommendations: recommendations || { message: 'Backlink neural network not available' }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // List Creation Service (for DeepSeek)
  // ===========================================

  /**
   * POST /api/neural-seo/list/create
   * Create a list view with configurable templates
   */
  router.post('/list/create', async (req, res) => {
    try {
      await initPromise;
      
      const listView = seoCampaignService.createListView(req.body);
      
      res.json({
        message: 'List view created',
        listView
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-seo/list/panel/create
   * Create a multi-list panel
   */
  router.post('/list/panel/create', async (req, res) => {
    try {
      await initPromise;
      
      const panel = seoCampaignService.createListPanel(req.body);
      
      res.json({
        message: 'List panel created',
        panel
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // DeepSeek Query Interface
  // ===========================================

  /**
   * GET /api/neural-seo/deepseek/query
   * Query service status for DeepSeek AI
   * Provides comprehensive system state for AI decision making
   */
  router.get('/deepseek/query', async (req, res) => {
    try {
      await initPromise;
      
      const queryResult = await seoCampaignService.queryForDeepSeek();
      
      res.json(queryResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createNeuralSEOCampaignRoutes;
