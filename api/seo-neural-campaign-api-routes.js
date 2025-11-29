/**
 * SEO Neural Campaign API Routes
 * 
 * REST API for managing SEO optimization campaigns with neural networks,
 * all 192 attributes, pretrained models, and configurable batch sizes
 */

import { Router } from 'express';
import SEONeuralCampaignService from '../services/seo-neural-campaign-service.js';

export function createSEONeuralCampaignRoutes(db) {
  const router = Router();
  
  // Campaign service instances (one per client)
  const campaigns = new Map();

  /**
   * Helper to get or create campaign service for client
   */
  async function getCampaignService(clientId, config = {}) {
    if (!campaigns.has(clientId)) {
      const service = new SEONeuralCampaignService({
        clientId,
        ...config
      });
      
      await service.initialize();
      campaigns.set(clientId, service);
    }
    
    return campaigns.get(clientId);
  }

  // ===========================================
  // Campaign Management
  // ===========================================

  /**
   * POST /api/seo-neural-campaign/create
   * Create a new SEO neural campaign
   */
  router.post('/create', async (req, res) => {
    try {
      const { clientId, config } = req.body;

      if (!clientId) {
        return res.status(400).json({ error: 'clientId is required' });
      }

      const campaign = await getCampaignService(clientId, config);
      const stats = campaign.getStats();

      res.json({
        message: 'Campaign created successfully',
        clientId,
        stats
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/seo-neural-campaign/:clientId/stats
   * Get campaign statistics
   */
  router.get('/:clientId/stats', async (req, res) => {
    try {
      const { clientId } = req.params;
      
      const campaign = await getCampaignService(clientId);
      const stats = campaign.getStats();

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Attribute Management
  // ===========================================

  /**
   * GET /api/seo-neural-campaign/attributes
   * Get all 192 SEO attribute configurations
   */
  router.get('/attributes', async (req, res) => {
    try {
      // Use default campaign to get attribute configs
      const campaign = await getCampaignService('default');
      const config = campaign.getAttributeConfiguration();

      res.json({
        totalAttributes: config.totalAttributes,
        categories: Object.keys(config.categories).map(cat => ({
          category: cat,
          count: config.categories[cat].length,
          attributes: config.categories[cat]
        }))
      });
    } catch (error) {
      console.error('Error getting attributes:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/seo-neural-campaign/attributes/category/:category
   * Get attributes by category
   */
  router.get('/attributes/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      
      const campaign = await getCampaignService('default');
      const config = campaign.getAttributeConfiguration();
      
      const categoryAttrs = config.categories[category];
      
      if (!categoryAttrs) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({
        category,
        count: categoryAttrs.length,
        attributes: categoryAttrs
      });
    } catch (error) {
      console.error('Error getting category attributes:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // SEO Analysis & Recommendations
  // ===========================================

  /**
   * POST /api/seo-neural-campaign/:clientId/analyze
   * Analyze a page and get optimization recommendations
   */
  router.post('/:clientId/analyze', async (req, res) => {
    try {
      const { clientId } = req.params;
      const { html, url } = req.body;

      if (!html || !url) {
        return res.status(400).json({ error: 'html and url are required' });
      }

      const campaign = await getCampaignService(clientId);
      const results = await campaign.getOptimizationRecommendations(html, url);

      res.json({
        success: true,
        ...results
      });
    } catch (error) {
      console.error('Error analyzing page:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/seo-neural-campaign/:clientId/extract-attributes
   * Extract all 192 attributes from a page
   */
  router.post('/:clientId/extract-attributes', async (req, res) => {
    try {
      const { clientId } = req.params;
      const { html, url } = req.body;

      if (!html || !url) {
        return res.status(400).json({ error: 'html and url are required' });
      }

      const campaign = await getCampaignService(clientId);
      const { attributes, extractedCount } = await campaign.extractAndVectorizeAttributes(html, url);

      res.json({
        success: true,
        url,
        extractedCount,
        expectedCount: 192,
        attributes
      });
    } catch (error) {
      console.error('Error extracting attributes:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Model Training
  // ===========================================

  /**
   * POST /api/seo-neural-campaign/:clientId/train
   * Train the neural network with collected data
   */
  router.post('/:clientId/train', async (req, res) => {
    try {
      const { clientId } = req.params;
      const { trainingData, options } = req.body;

      if (!trainingData || !Array.isArray(trainingData)) {
        return res.status(400).json({ error: 'trainingData array is required' });
      }

      const campaign = await getCampaignService(clientId);
      const history = await campaign.trainWithData(trainingData, options);

      res.json({
        success: true,
        samplesUsed: trainingData.length,
        history: history.history,
        finalAccuracy: history.history.acc[history.history.acc.length - 1]
      });
    } catch (error) {
      console.error('Error training model:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/seo-neural-campaign/:clientId/batch-size
   * Update batch size for training
   */
  router.put('/:clientId/batch-size', async (req, res) => {
    try {
      const { clientId } = req.params;
      const { batchSize } = req.body;

      if (!batchSize || typeof batchSize !== 'number') {
        return res.status(400).json({ error: 'batchSize (number) is required' });
      }

      const campaign = await getCampaignService(clientId);
      campaign.setBatchSize(batchSize);

      res.json({
        success: true,
        message: 'Batch size updated',
        batchSize
      });
    } catch (error) {
      console.error('Error updating batch size:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Pretrained Models
  // ===========================================

  /**
   * GET /api/seo-neural-campaign/models/pretrained
   * List all pretrained models
   */
  router.get('/models/pretrained', async (req, res) => {
    try {
      const { tags, architecture } = req.query;
      
      const filter = {};
      if (tags) filter.tags = tags.split(',');
      if (architecture) filter.architecture = architecture;

      const campaign = await getCampaignService('default');
      const models = campaign.listPretrainedModels(filter);

      res.json({
        total: models.length,
        models
      });
    } catch (error) {
      console.error('Error listing models:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/seo-neural-campaign/:clientId/model/save
   * Save current model state
   */
  router.post('/:clientId/model/save', async (req, res) => {
    try {
      const { clientId } = req.params;
      const { path } = req.body;

      if (!path) {
        return res.status(400).json({ error: 'path is required' });
      }

      const campaign = await getCampaignService(clientId);
      await campaign.saveModel(path);

      res.json({
        success: true,
        message: 'Model saved successfully',
        path
      });
    } catch (error) {
      console.error('Error saving model:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===========================================
  // Health & Status
  // ===========================================

  /**
   * GET /api/seo-neural-campaign/health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    try {
      const activeCampaigns = campaigns.size;
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        activeCampaigns,
        features: {
          totalAttributes: 192,
          pretrainedModels: true,
          transferLearning: true,
          configurableBatchSize: true,
          dataSeeding: true
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createSEONeuralCampaignRoutes;
