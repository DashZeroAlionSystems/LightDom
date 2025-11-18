/**
 * Crawler Campaign API Routes
 * 
 * RESTful API endpoints for managing crawler campaigns with DeepSeek integration
 */

import express from 'express';
import campaignService from '../../services/crawler-campaign-service.js';
import deepSeekService from '../../services/deepseek-api-service.js';

const router = express.Router();

/**
 * @route   POST /api/campaigns/create-from-prompt
 * @desc    Create a new campaign from natural language prompt
 * @access  Public (add auth in production)
 */
router.post('/create-from-prompt', async (req, res) => {
  try {
    const { prompt, clientSiteUrl, options } = req.body;

    if (!prompt || !clientSiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and clientSiteUrl are required'
      });
    }

    const campaign = await campaignService.createCampaignFromPrompt(
      prompt,
      clientSiteUrl,
      options || {}
    );

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign from prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignId/start
 * @desc    Start a campaign
 * @access  Public
 */
router.post('/:campaignId/start', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const result = await campaignService.startCampaign(campaignId, req.body);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignId/stop
 * @desc    Stop a campaign
 * @access  Public
 */
router.post('/:campaignId/stop', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const result = await campaignService.stopCampaign(campaignId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error stopping campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignId/pause
 * @desc    Pause a campaign
 * @access  Public
 */
router.post('/:campaignId/pause', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const result = await campaignService.pauseCampaign(campaignId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error pausing campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignId/resume
 * @desc    Resume a paused campaign
 * @access  Public
 */
router.post('/:campaignId/resume', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const result = await campaignService.resumeCampaign(campaignId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error resuming campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns
 * @desc    List all campaigns
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const filter = {
      status: req.query.status,
      clientSiteUrl: req.query.clientSiteUrl
    };

    const campaigns = campaignService.listCampaigns(filter);

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/:campaignId
 * @desc    Get campaign details
 * @access  Public
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = campaignService.getCampaign(campaignId);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/campaigns/:campaignId
 * @desc    Update campaign configuration
 * @access  Public
 */
router.put('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await campaignService.updateCampaignConfig(campaignId, req.body);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/:campaignId/analytics
 * @desc    Get campaign analytics
 * @access  Public
 */
router.get('/:campaignId/analytics', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const analytics = campaignService.getCampaignAnalytics(campaignId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignId/schedule
 * @desc    Schedule campaign execution
 * @access  Public
 */
router.post('/:campaignId/schedule', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { frequency, time, enabled } = req.body;

    if (!frequency) {
      return res.status(400).json({
        success: false,
        error: 'Frequency is required'
      });
    }

    const schedule = await campaignService.scheduleCampaign(campaignId, {
      frequency,
      time,
      enabled
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/stats/service
 * @desc    Get service statistics
 * @access  Public
 */
router.get('/stats/service', async (req, res) => {
  try {
    const stats = campaignService.getServiceStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting service stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/deepseek/generate-workflow
 * @desc    Generate workflow from prompt using DeepSeek
 * @access  Public
 */
router.post('/deepseek/generate-workflow', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const workflow = await deepSeekService.generateWorkflowFromPrompt(prompt, options || {});

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error generating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/deepseek/generate-seeds
 * @desc    Generate URL seeds using DeepSeek
 * @access  Public
 */
router.post('/deepseek/generate-seeds', async (req, res) => {
  try {
    const { campaignDescription, clientSiteUrl, options } = req.body;

    if (!campaignDescription || !clientSiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Campaign description and client site URL are required'
      });
    }

    const seeds = await deepSeekService.generateURLSeeds(
      campaignDescription,
      clientSiteUrl,
      options || {}
    );

    res.json({
      success: true,
      data: seeds
    });
  } catch (error) {
    console.error('Error generating seeds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/deepseek/build-schema
 * @desc    Build crawler schema using DeepSeek
 * @access  Public
 */
router.post('/deepseek/build-schema', async (req, res) => {
  try {
    const { purpose, existingSchemas, options } = req.body;

    if (!purpose) {
      return res.status(400).json({
        success: false,
        error: 'Purpose is required'
      });
    }

    const schema = await deepSeekService.buildCrawlerSchema(
      purpose,
      existingSchemas || [],
      options || {}
    );

    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    console.error('Error building schema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/deepseek/generate-pipeline
 * @desc    Generate workflow pipeline from schemas using DeepSeek
 * @access  Public
 */
router.post('/deepseek/generate-pipeline', async (req, res) => {
  try {
    const { schemas, goal, options } = req.body;

    if (!schemas || !goal) {
      return res.status(400).json({
        success: false,
        error: 'Schemas and goal are required'
      });
    }

    const pipeline = await deepSeekService.generateWorkflowPipeline(
      schemas,
      goal,
      options || {}
    );

    res.json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    console.error('Error generating pipeline:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/deepseek/research-neural-network
 * @desc    Research neural network server setup using DeepSeek
 * @access  Public
 */
router.post('/deepseek/research-neural-network', async (req, res) => {
  try {
    const { requirements, options } = req.body;

    const research = await deepSeekService.researchNeuralNetworkSetup(
      requirements || {},
      options || {}
    );

    res.json({
      success: true,
      data: research
    });
  } catch (error) {
    console.error('Error researching neural network setup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/deepseek/health
 * @desc    Check DeepSeek API health
 * @access  Public
 */
router.get('/deepseek/health', async (req, res) => {
  try {
    const health = await deepSeekService.healthCheck();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error checking DeepSeek health:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CRAWLER CLUSTER ROUTES ====================

/**
 * @route   POST /api/campaigns/clusters
 * @desc    Create a new crawler cluster
 * @access  Public
 */
router.post('/clusters', async (req, res) => {
  try {
    const { name, description, reason, strategy, maxCrawlers, autoScale } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Cluster name is required'
      });
    }

    const cluster = await campaignService.createCluster({
      name,
      description,
      reason,
      strategy: strategy || 'load-balanced',
      maxCrawlers: maxCrawlers || 10,
      autoScale: autoScale !== false
    });

    res.json({
      success: true,
      data: cluster,
      message: 'Cluster created successfully'
    });
  } catch (error) {
    console.error('Error creating cluster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/clusters
 * @desc    List all crawler clusters
 * @access  Public
 */
router.get('/clusters', async (req, res) => {
  try {
    const filter = {
      status: req.query.status
    };

    const clusters = await campaignService.listClusters(filter);

    res.json({
      success: true,
      data: clusters,
      count: clusters.length
    });
  } catch (error) {
    console.error('Error listing clusters:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/clusters/:clusterId
 * @desc    Get cluster details with campaigns
 * @access  Public
 */
router.get('/clusters/:clusterId', async (req, res) => {
  try {
    const { clusterId } = req.params;
    const cluster = await campaignService.getClusterWithCampaigns(clusterId);

    res.json({
      success: true,
      data: cluster
    });
  } catch (error) {
    console.error('Error getting cluster:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/campaigns/clusters/:clusterId
 * @desc    Update cluster configuration
 * @access  Public
 */
router.put('/clusters/:clusterId', async (req, res) => {
  try {
    const { clusterId } = req.params;
    const cluster = await campaignService.updateCluster(clusterId, req.body);

    res.json({
      success: true,
      data: cluster
    });
  } catch (error) {
    console.error('Error updating cluster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/campaigns/clusters/:clusterId
 * @desc    Delete a crawler cluster
 * @access  Public
 */
router.delete('/clusters/:clusterId', async (req, res) => {
  try {
    const { clusterId } = req.params;
    await campaignService.deleteCluster(clusterId);

    res.json({
      success: true,
      message: 'Cluster deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cluster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/clusters/:clusterId/campaigns/:campaignId
 * @desc    Add campaign to cluster
 * @access  Public
 */
router.post('/clusters/:clusterId/campaigns/:campaignId', async (req, res) => {
  try {
    const { clusterId, campaignId } = req.params;
    const { priority, role } = req.body;

    const result = await campaignService.addCampaignToCluster(clusterId, campaignId, {
      priority: priority || 5,
      role
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error adding campaign to cluster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/campaigns/clusters/:clusterId/campaigns/:campaignId
 * @desc    Remove campaign from cluster
 * @access  Public
 */
router.delete('/clusters/:clusterId/campaigns/:campaignId', async (req, res) => {
  try {
    const { clusterId, campaignId } = req.params;
    await campaignService.removeCampaignFromCluster(clusterId, campaignId);

    res.json({
      success: true,
      message: 'Campaign removed from cluster'
    });
  } catch (error) {
    console.error('Error removing campaign from cluster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SEEDING SERVICE ROUTES ====================

/**
 * @route   POST /api/campaigns/seeding-services
 * @desc    Create a new seeding service
 * @access  Public
 */
router.post('/seeding-services', async (req, res) => {
  try {
    const { name, type, description, config } = req.body;

    if (!name || !type || !config) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and config are required'
      });
    }

    const service = await campaignService.createSeedingService({
      name,
      type,
      description,
      config
    });

    res.json({
      success: true,
      data: service,
      message: 'Seeding service created successfully'
    });
  } catch (error) {
    console.error('Error creating seeding service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/seeding-services
 * @desc    List all seeding services
 * @access  Public
 */
router.get('/seeding-services', async (req, res) => {
  try {
    const filter = {
      type: req.query.type,
      status: req.query.status
    };

    const services = await campaignService.listSeedingServices(filter);

    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error listing seeding services:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/seeding-services/:serviceId
 * @desc    Get seeding service details
 * @access  Public
 */
router.get('/seeding-services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await campaignService.getSeedingService(serviceId);

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error getting seeding service:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/campaigns/seeding-services/:serviceId
 * @desc    Update seeding service
 * @access  Public
 */
router.put('/seeding-services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await campaignService.updateSeedingService(serviceId, req.body);

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error updating seeding service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/campaigns/seeding-services/:serviceId
 * @desc    Delete a seeding service
 * @access  Public
 */
router.delete('/seeding-services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    await campaignService.deleteSeedingService(serviceId);

    res.json({
      success: true,
      message: 'Seeding service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seeding service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/:campaignId/seeding-services/:serviceId
 * @desc    Attach seeding service to campaign
 * @access  Public
 */
router.post('/:campaignId/seeding-services/:serviceId', async (req, res) => {
  try {
    const { campaignId, serviceId } = req.params;
    const { configOverrides, enabled } = req.body;

    const result = await campaignService.attachSeedingService(campaignId, serviceId, {
      configOverrides,
      enabled: enabled !== false
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error attaching seeding service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/campaigns/seeding-services/:serviceId/collect
 * @desc    Trigger seeding service to collect URLs
 * @access  Public
 */
router.post('/seeding-services/:serviceId/collect', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { campaignId } = req.body;

    const result = await campaignService.runSeedingService(serviceId, campaignId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error running seeding service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/:campaignId/seeds
 * @desc    Get collected seeds for a campaign
 * @access  Public
 */
router.get('/:campaignId/seeds', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, limit } = req.query;

    const seeds = await campaignService.getCollectedSeeds(campaignId, {
      status,
      limit: limit ? parseInt(limit) : 100
    });

    res.json({
      success: true,
      data: seeds,
      count: seeds.length
    });
  } catch (error) {
    console.error('Error getting collected seeds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/campaigns/:campaignId
 * @desc    Delete a campaign
 * @access  Public
 */
router.delete('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    await campaignService.deleteCampaign(campaignId);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/campaigns/endpoints/list
 * @desc    List all API endpoints for documentation
 * @access  Public
 */
router.get('/endpoints/list', (req, res) => {
  const endpoints = [
    // Campaign CRUD
    { method: 'POST', path: '/api/campaigns/create-from-prompt', description: 'Create campaign from natural language' },
    { method: 'GET', path: '/api/campaigns', description: 'List all campaigns' },
    { method: 'GET', path: '/api/campaigns/:campaignId', description: 'Get campaign details' },
    { method: 'PUT', path: '/api/campaigns/:campaignId', description: 'Update campaign' },
    { method: 'DELETE', path: '/api/campaigns/:campaignId', description: 'Delete campaign' },
    
    // Campaign Control
    { method: 'POST', path: '/api/campaigns/:campaignId/start', description: 'Start campaign' },
    { method: 'POST', path: '/api/campaigns/:campaignId/stop', description: 'Stop campaign' },
    { method: 'POST', path: '/api/campaigns/:campaignId/pause', description: 'Pause campaign' },
    { method: 'POST', path: '/api/campaigns/:campaignId/resume', description: 'Resume campaign' },
    
    // Campaign Analytics
    { method: 'GET', path: '/api/campaigns/:campaignId/analytics', description: 'Get campaign analytics' },
    { method: 'POST', path: '/api/campaigns/:campaignId/schedule', description: 'Schedule campaign' },
    { method: 'GET', path: '/api/campaigns/stats/service', description: 'Get service statistics' },
    
    // Cluster Management
    { method: 'POST', path: '/api/campaigns/clusters', description: 'Create crawler cluster' },
    { method: 'GET', path: '/api/campaigns/clusters', description: 'List all clusters' },
    { method: 'GET', path: '/api/campaigns/clusters/:clusterId', description: 'Get cluster with campaigns' },
    { method: 'PUT', path: '/api/campaigns/clusters/:clusterId', description: 'Update cluster' },
    { method: 'DELETE', path: '/api/campaigns/clusters/:clusterId', description: 'Delete cluster' },
    { method: 'POST', path: '/api/campaigns/clusters/:clusterId/campaigns/:campaignId', description: 'Add campaign to cluster' },
    { method: 'DELETE', path: '/api/campaigns/clusters/:clusterId/campaigns/:campaignId', description: 'Remove campaign from cluster' },
    
    // Seeding Services
    { method: 'POST', path: '/api/campaigns/seeding-services', description: 'Create seeding service' },
    { method: 'GET', path: '/api/campaigns/seeding-services', description: 'List seeding services' },
    { method: 'GET', path: '/api/campaigns/seeding-services/:serviceId', description: 'Get seeding service' },
    { method: 'PUT', path: '/api/campaigns/seeding-services/:serviceId', description: 'Update seeding service' },
    { method: 'DELETE', path: '/api/campaigns/seeding-services/:serviceId', description: 'Delete seeding service' },
    { method: 'POST', path: '/api/campaigns/:campaignId/seeding-services/:serviceId', description: 'Attach seeding service to campaign' },
    { method: 'POST', path: '/api/campaigns/seeding-services/:serviceId/collect', description: 'Trigger URL collection' },
    { method: 'GET', path: '/api/campaigns/:campaignId/seeds', description: 'Get collected seeds' },
    
    // DeepSeek AI Integration
    { method: 'POST', path: '/api/campaigns/deepseek/generate-workflow', description: 'Generate workflow from prompt' },
    { method: 'POST', path: '/api/campaigns/deepseek/generate-seeds', description: 'Generate URL seeds' },
    { method: 'POST', path: '/api/campaigns/deepseek/build-schema', description: 'Build data extraction schema' },
    { method: 'POST', path: '/api/campaigns/deepseek/generate-pipeline', description: 'Generate workflow pipeline' },
    { method: 'POST', path: '/api/campaigns/deepseek/research-neural-network', description: 'Research neural network setup' },
    { method: 'GET', path: '/api/campaigns/deepseek/health', description: 'Check DeepSeek API health' }
  ];

  res.json({
    success: true,
    data: endpoints,
    count: endpoints.length
  });
});

export default router;
