/**
 * Storybook Model Training API Routes
 * 
 * REST API endpoints for storybook mining with pretrained model training.
 * Provides access to the 11 pretrained models for training on storybook data.
 * 
 * Endpoints:
 * - GET /api/storybook-training/models - List available pretrained models
 * - GET /api/storybook-training/models/recommended - Get recommended models for storybook
 * - POST /api/storybook-training/mine - Mine storybooks and collect training data
 * - POST /api/storybook-training/sessions - Start a training session
 * - GET /api/storybook-training/sessions - List training sessions
 * - GET /api/storybook-training/sessions/:id - Get session status
 * - GET /api/storybook-training/data/stats - Get training data statistics
 * - GET /api/storybook-training/stats - Get service statistics
 */

import { Router } from 'express';
import { StorybookModelTrainingService } from '../services/storybook-model-training-service.js';

/**
 * Create storybook model training routes
 * @param {Object} config - Configuration with database pool
 * @returns {Router} Express router
 */
export function createStorybookTrainingRoutes(config = {}) {
  const router = Router();
  
  // Initialize service
  const trainingService = new StorybookModelTrainingService({
    db: config.db
  });
  
  // Initialize service on first request
  let initialized = false;
  
  const ensureInitialized = async (req, res, next) => {
    if (!initialized) {
      try {
        await trainingService.initialize();
        initialized = true;
      } catch (error) {
        console.error('Failed to initialize storybook training service:', error);
        return res.status(500).json({
          success: false,
          error: 'Service initialization failed'
        });
      }
    }
    next();
  };
  
  router.use(ensureInitialized);

  // ==========================================================================
  // PRETRAINED MODELS
  // ==========================================================================

  /**
   * GET /api/storybook-training/models
   * List all available pretrained models (11 models)
   */
  router.get('/models', async (req, res) => {
    try {
      const models = trainingService.getAvailableModels();
      
      res.json({
        success: true,
        data: {
          models,
          total: models.length,
          description: 'Available pretrained models for storybook mining training'
        }
      });
    } catch (error) {
      console.error('Error listing models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list models'
      });
    }
  });

  /**
   * GET /api/storybook-training/models/recommended
   * Get recommended models for storybook training
   */
  router.get('/models/recommended', async (req, res) => {
    try {
      const models = trainingService.getRecommendedModels();
      
      res.json({
        success: true,
        data: {
          models,
          total: models.length,
          description: 'Models recommended for storybook component mining and analysis'
        }
      });
    } catch (error) {
      console.error('Error getting recommended models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommended models'
      });
    }
  });

  /**
   * GET /api/storybook-training/models/:modelId
   * Get details for a specific model
   */
  router.get('/models/:modelId', async (req, res) => {
    try {
      const { modelId } = req.params;
      const models = trainingService.getAvailableModels();
      const model = models.find(m => m.id === modelId);
      
      if (!model) {
        return res.status(404).json({
          success: false,
          error: `Model not found: ${modelId}`
        });
      }
      
      res.json({
        success: true,
        data: model
      });
    } catch (error) {
      console.error('Error getting model details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get model details'
      });
    }
  });

  // ==========================================================================
  // MINING & DATA COLLECTION
  // ==========================================================================

  /**
   * POST /api/storybook-training/mine
   * Mine storybooks and collect training data
   */
  router.post('/mine', async (req, res) => {
    try {
      const { urls, modelTypes, validateData } = req.body;
      
      const result = await trainingService.mineAndCollectTrainingData(
        urls || [],
        { modelTypes, validateData }
      );
      
      res.json({
        success: true,
        data: result,
        message: `Mined ${result.sitesSuccessful} sites and collected ${result.trainingDataCollected} training samples`
      });
    } catch (error) {
      console.error('Error mining storybooks:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mine storybooks'
      });
    }
  });

  /**
   * GET /api/storybook-training/data/stats
   * Get training data statistics
   */
  router.get('/data/stats', async (req, res) => {
    try {
      const stats = await trainingService.getTrainingDataStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting training data stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get training data statistics'
      });
    }
  });

  // ==========================================================================
  // TRAINING SESSIONS
  // ==========================================================================

  /**
   * POST /api/storybook-training/sessions
   * Start a new training session
   */
  router.post('/sessions', async (req, res) => {
    try {
      const { name, pretrainedModelId, trainingConfig } = req.body;
      
      if (!pretrainedModelId) {
        return res.status(400).json({
          success: false,
          error: 'pretrainedModelId is required'
        });
      }
      
      const session = await trainingService.startTrainingSession({
        name,
        pretrainedModelId,
        trainingConfig
      });
      
      res.status(202).json({
        success: true,
        data: session,
        message: 'Training session started'
      });
    } catch (error) {
      console.error('Error starting training session:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start training session'
      });
    }
  });

  /**
   * GET /api/storybook-training/sessions
   * List training sessions
   */
  router.get('/sessions', async (req, res) => {
    try {
      const { status, limit = 100 } = req.query;
      
      const sessions = await trainingService.getTrainingSessions({
        status,
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: sessions,
        total: sessions.length
      });
    } catch (error) {
      console.error('Error listing sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list training sessions'
      });
    }
  });

  /**
   * GET /api/storybook-training/sessions/:id
   * Get training session status
   */
  router.get('/sessions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const session = await trainingService.getSessionStatus(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error getting session status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session status'
      });
    }
  });

  // ==========================================================================
  // SERVICE STATISTICS
  // ==========================================================================

  /**
   * GET /api/storybook-training/stats
   * Get service statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = trainingService.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting service stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get service statistics'
      });
    }
  });

  /**
   * GET /api/storybook-training/health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    try {
      const stats = trainingService.getStatistics();
      
      res.json({
        success: true,
        status: 'healthy',
        initialized: stats.initialized,
        modelsLoaded: stats.modelsLoaded,
        activeSessions: stats.activeSessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  });

  return router;
}

export default createStorybookTrainingRoutes;
