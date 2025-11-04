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

export default router;
