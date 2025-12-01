/**
 * Campaign Orchestration API Routes
 * 
 * Provides REST API endpoints for campaign management and orchestration.
 */

import express from 'express';
import campaignOrchestrationService from '../services/campaign-orchestration-service.js';
import researchInstanceService from '../services/research-instance-service.js';
import attributeDiscoveryService from '../services/attribute-discovery-service.js';
import dataMiningInstanceService from '../services/data-mining-instance-service.js';

const router = express.Router();

/**
 * POST /api/campaigns/from-prompt
 * Create a complete campaign from a natural language prompt
 */
router.post('/from-prompt', async (req, res) => {
  try {
    const { prompt, name, description, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    const campaign = await campaignOrchestrationService.createCampaignFromPrompt(prompt, {
      name,
      description,
      ...options
    });

    res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      details: error.message
    });
  }
});

/**
 * GET /api/campaigns
 * List all campaigns
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;

    const campaigns = await campaignOrchestrationService.listCampaigns({
      status,
      limit: limit ? parseInt(limit) : undefined
    });

    res.json({
      success: true,
      campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({
      error: 'Failed to list campaigns',
      details: error.message
    });
  }
});

/**
 * GET /api/campaigns/:campaignId
 * Get campaign details
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await campaignOrchestrationService.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      error: 'Failed to get campaign',
      details: error.message
    });
  }
});

/**
 * POST /api/campaigns/:campaignId/start
 * Start campaign execution
 */
router.post('/:campaignId/start', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await campaignOrchestrationService.startCampaign(campaignId);

    res.json({
      success: true,
      campaign,
      message: 'Campaign started successfully'
    });
  } catch (error) {
    console.error('Start campaign error:', error);
    res.status(500).json({
      error: 'Failed to start campaign',
      details: error.message
    });
  }
});

/**
 * POST /api/research/kickoff
 * Kickoff a research instance
 */
router.post('/research/kickoff', async (req, res) => {
  try {
    const { topic, prompt, options } = req.body;

    if (!topic || !prompt) {
      return res.status(400).json({
        error: 'Topic and prompt are required'
      });
    }

    const research = await researchInstanceService.kickoffResearch(topic, prompt, options || {});

    res.status(201).json({
      success: true,
      research
    });
  } catch (error) {
    console.error('Kickoff research error:', error);
    res.status(500).json({
      error: 'Failed to kickoff research',
      details: error.message
    });
  }
});

/**
 * GET /api/research/:researchId
 * Get research instance details
 */
router.get('/research/:researchId', async (req, res) => {
  try {
    const { researchId } = req.params;

    const research = await researchInstanceService.getResearch(researchId);

    if (!research) {
      return res.status(404).json({
        error: 'Research instance not found'
      });
    }

    res.json({
      success: true,
      research
    });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({
      error: 'Failed to get research',
      details: error.message
    });
  }
});

/**
 * GET /api/research
 * List research instances
 */
router.get('/research', async (req, res) => {
  try {
    const { status, topic, limit } = req.query;

    const research = await researchInstanceService.listResearch({
      status,
      topic,
      limit: limit ? parseInt(limit) : undefined
    });

    res.json({
      success: true,
      research,
      count: research.length
    });
  } catch (error) {
    console.error('List research error:', error);
    res.status(500).json({
      error: 'Failed to list research',
      details: error.message
    });
  }
});

/**
 * POST /api/attributes/discover/:researchId
 * Discover attributes from a research instance
 */
router.post('/attributes/discover/:researchId', async (req, res) => {
  try {
    const { researchId } = req.params;
    const { options } = req.body;

    const attributes = await attributeDiscoveryService.discoverAttributes(researchId, options || {});

    res.status(201).json({
      success: true,
      attributes,
      count: attributes.length
    });
  } catch (error) {
    console.error('Discover attributes error:', error);
    res.status(500).json({
      error: 'Failed to discover attributes',
      details: error.message
    });
  }
});

/**
 * GET /api/attributes/research/:researchId
 * Get attributes for a research instance
 */
router.get('/attributes/research/:researchId', async (req, res) => {
  try {
    const { researchId } = req.params;

    const attributes = await attributeDiscoveryService.getAttributesByResearch(researchId);

    res.json({
      success: true,
      attributes,
      count: attributes.length
    });
  } catch (error) {
    console.error('Get attributes error:', error);
    res.status(500).json({
      error: 'Failed to get attributes',
      details: error.message
    });
  }
});

/**
 * POST /api/mining/create-with-attributes
 * Create a data mining instance with attributes
 */
router.post('/mining/create-with-attributes', async (req, res) => {
  try {
    const { name, researchId, options } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Name is required'
      });
    }

    let mining;
    if (researchId) {
      mining = await dataMiningInstanceService.createFromResearch(researchId, options || {});
    } else {
      mining = await dataMiningInstanceService.createMiningInstance(name, options || {});
    }

    res.status(201).json({
      success: true,
      mining
    });
  } catch (error) {
    console.error('Create mining instance error:', error);
    res.status(500).json({
      error: 'Failed to create mining instance',
      details: error.message
    });
  }
});

/**
 * POST /api/mining/:miningId/attributes
 * Add attributes to a mining instance
 */
router.post('/mining/:miningId/attributes', async (req, res) => {
  try {
    const { miningId } = req.params;
    const { attributeIds, config } = req.body;

    if (!attributeIds || !Array.isArray(attributeIds)) {
      return res.status(400).json({
        error: 'attributeIds array is required'
      });
    }

    const mining = await dataMiningInstanceService.addAttributes(miningId, attributeIds, config || {});

    res.json({
      success: true,
      mining,
      message: `Added ${attributeIds.length} attributes`
    });
  } catch (error) {
    console.error('Add attributes error:', error);
    res.status(500).json({
      error: 'Failed to add attributes',
      details: error.message
    });
  }
});

/**
 * GET /api/mining/:miningId
 * Get mining instance details
 */
router.get('/mining/:miningId', async (req, res) => {
  try {
    const { miningId } = req.params;

    const mining = await dataMiningInstanceService.getMiningInstance(miningId);

    if (!mining) {
      return res.status(404).json({
        error: 'Mining instance not found'
      });
    }

    res.json({
      success: true,
      mining
    });
  } catch (error) {
    console.error('Get mining instance error:', error);
    res.status(500).json({
      error: 'Failed to get mining instance',
      details: error.message
    });
  }
});

/**
 * POST /api/mining/:miningId/queue
 * Queue mining instance for execution
 */
router.post('/mining/:miningId/queue', async (req, res) => {
  try {
    const { miningId } = req.params;

    const mining = await dataMiningInstanceService.queueMiningInstance(miningId);

    res.json({
      success: true,
      mining,
      message: 'Mining instance queued'
    });
  } catch (error) {
    console.error('Queue mining instance error:', error);
    res.status(500).json({
      error: 'Failed to queue mining instance',
      details: error.message
    });
  }
});

/**
 * POST /api/mining/:miningId/start
 * Start mining instance execution
 */
router.post('/mining/:miningId/start', async (req, res) => {
  try {
    const { miningId } = req.params;

    const mining = await dataMiningInstanceService.startMiningInstance(miningId);

    res.json({
      success: true,
      mining,
      message: 'Mining instance started'
    });
  } catch (error) {
    console.error('Start mining instance error:', error);
    res.status(500).json({
      error: 'Failed to start mining instance',
      details: error.message
    });
  }
});

/**
 * GET /api/mining
 * List mining instances
 */
router.get('/mining', async (req, res) => {
  try {
    const { status, researchId, limit } = req.query;

    const instances = await dataMiningInstanceService.listMiningInstances({
      status,
      researchId,
      limit: limit ? parseInt(limit) : undefined
    });

    res.json({
      success: true,
      instances,
      count: instances.length
    });
  } catch (error) {
    console.error('List mining instances error:', error);
    res.status(500).json({
      error: 'Failed to list mining instances',
      details: error.message
    });
  }
});

export default router;
