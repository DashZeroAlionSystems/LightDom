/**
 * Automated SEO Campaign API Routes
 * 
 * Complete API for client onboarding, campaign management,
 * neural network training, and real-time optimization
 */

import express from 'express';
import { AutomatedSEOCampaignService } from '../../services/automated-seo-campaign-service.js';
import { SVGSEOWidgetRenderer } from '../../services/svg-seo-widget-renderer.js';
import { NeuralNetworkSEOTrainer } from '../../services/neural-network-seo-trainer.js';
import { VisualStyleGuideGenerator } from '../../services/visual-style-guide-generator.js';

const router = express.Router();

// Initialize services
const campaignService = new AutomatedSEOCampaignService();
const widgetRenderer = new SVGSEOWidgetRenderer();
const neuralTrainer = new NeuralNetworkSEOTrainer();
const styleGuideGenerator = new VisualStyleGuideGenerator();

/**
 * @route   POST /api/seo/onboard-client
 * @desc    Onboard a new client with automated setup
 * @access  Public
 */
router.post('/onboard-client', async (req, res) => {
  try {
    const { businessName, websiteUrl, industry, targetKeywords, competitors, paymentPlan } = req.body;

    if (!businessName || !websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Business name and website URL are required'
      });
    }

    const result = await campaignService.onboardClient({
      businessName,
      websiteUrl,
      industry,
      targetKeywords,
      competitors,
      paymentPlan
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error onboarding client:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seo/mine-attributes
 * @desc    Execute comprehensive data mining with 192+ attributes
 * @access  Public
 */
router.post('/mine-attributes', async (req, res) => {
  try {
    const { url, options } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const result = await campaignService.executeDataMining(url, options || {});

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error mining attributes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seo/generate-styleguide
 * @desc    Generate visual style guide from 3D DOM data
 * @access  Public
 */
router.post('/generate-styleguide', async (req, res) => {
  try {
    const { dom3dData, layerData } = req.body;

    if (!dom3dData) {
      return res.status(400).json({
        success: false,
        error: '3D DOM data is required'
      });
    }

    const styleGuide = await styleGuideGenerator.generateFromDOM3D(dom3dData, layerData || {});

    res.json({
      success: true,
      data: styleGuide
    });
  } catch (error) {
    console.error('Error generating style guide:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seo/generate-widgets
 * @desc    Generate SVG SEO widgets for real-time display
 * @access  Public
 */
router.post('/generate-widgets', async (req, res) => {
  try {
    const { score, competitors, schemas, recommendations } = req.body;

    const widgets = [];

    if (score !== undefined) {
      widgets.push(widgetRenderer.generateSEOScoreWidget({
        score,
        trend: req.body.trend || 0,
        history: req.body.history || []
      }));
    }

    if (competitors) {
      widgets.push(widgetRenderer.generateCompetitorWidget({
        clientScore: score,
        competitors
      }));
    }

    if (schemas) {
      widgets.push(widgetRenderer.generateRichSnippetWidget(schemas));
    }

    if (recommendations) {
      widgets.push(widgetRenderer.generateRecommendationsWidget(recommendations));
    }

    // Generate injectable script
    const script = widgetRenderer.generateInjectableScript(widgets);

    res.json({
      success: true,
      data: {
        widgets,
        script
      }
    });
  } catch (error) {
    console.error('Error generating widgets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seo/train-neural-network
 * @desc    Train neural network on SEO data
 * @access  Public
 */
router.post('/train-neural-network', async (req, res) => {
  try {
    const { trainingData, options } = req.body;

    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'Training data array is required'
      });
    }

    // Initialize if not done
    if (!neuralTrainer.model) {
      await neuralTrainer.initialize();
    }

    const history = await neuralTrainer.train(trainingData, options || {});

    res.json({
      success: true,
      data: {
        history: history.history,
        summary: neuralTrainer.getModelSummary()
      }
    });
  } catch (error) {
    console.error('Error training neural network:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seo/predict-optimizations
 * @desc    Predict SEO optimizations using trained model
 * @access  Public
 */
router.post('/predict-optimizations', async (req, res) => {
  try {
    const { attributes } = req.body;

    if (!attributes) {
      return res.status(400).json({
        success: false,
        error: 'Attributes are required'
      });
    }

    const recommendations = await neuralTrainer.predict(attributes);

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
        autoApplyCount: recommendations.filter(r => r.autoApply).length
      }
    });
  } catch (error) {
    console.error('Error predicting optimizations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/seo/client/:clientId
 * @desc    Get client details and campaign status
 * @access  Public
 */
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = campaignService.clients.get(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Get associated campaigns
    const campaigns = Array.from(campaignService.campaigns.values())
      .filter(c => c.clientId === clientId);

    res.json({
      success: true,
      data: {
        client,
        campaigns,
        totalCampaigns: campaigns.length
      }
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/seo/campaign/:campaignId
 * @desc    Get campaign details and metrics
 * @access  Public
 */
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = campaignService.campaigns.get(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/seo/live-data
 * @desc    Get live SEO data for widgets (used by injected script)
 * @access  Public
 */
router.get('/live-data', async (req, res) => {
  try {
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    // Find client by API key
    const client = Array.from(campaignService.clients.values())
      .find(c => c.apiKey === apiKey);

    if (!client) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    // Get latest campaign data
    const campaigns = Array.from(campaignService.campaigns.values())
      .filter(c => c.clientId === client.id);

    const latestCampaign = campaigns[campaigns.length - 1];

    res.json({
      success: true,
      data: {
        score: latestCampaign?.metrics?.seoScore || 0,
        trend: 0, // Calculate from history
        competitors: latestCampaign?.metrics?.competitorComparison || {},
        schemas: {}, // Latest schemas
        recommendations: [] // Latest recommendations
      }
    });
  } catch (error) {
    console.error('Error getting live data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/seo/stats
 * @desc    Get service statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalClients: campaignService.clients.size,
        totalCampaigns: campaignService.campaigns.size,
        activeClients: Array.from(campaignService.clients.values())
          .filter(c => c.status === 'active').length,
        neuralNetworkStatus: neuralTrainer.getModelSummary()
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
