/**
 * SEO Model Training API Endpoints
 * Handles model training orchestration, deployment, and management
 */

import express, { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { ModelTrainingOrchestrator, ModelConfig } from '../seo/ml/ModelTrainingOrchestrator';

const router: Router = express.Router();

let orchestrator: ModelTrainingOrchestrator;
let isInitialized = false;

/**
 * Initialize service with configuration
 */
function initializeService(dbPool: Pool, blockchainConfig?: any) {
  if (isInitialized) return;
  
  orchestrator = new ModelTrainingOrchestrator(dbPool, blockchainConfig);
  isInitialized = true;
}

/**
 * POST /api/seo/models/train
 * Start training a new model
 */
router.post('/train', async (req: Request, res: Response) => {
  try {
    const config: ModelConfig = {
      modelName: req.body.modelName || 'seo-ranking-model',
      modelVersion: req.body.modelVersion || '1.0.0',
      algorithm: req.body.algorithm || 'gradient_boosting',
      hyperparameters: req.body.hyperparameters || {
        learningRate: 0.1,
        nEstimators: 100,
        maxDepth: 5,
        minSamplesLeaf: 10
      },
      features: req.body.features || [],
      targetMetric: req.body.targetMetric || 'ndcg'
    };
    
    // Validate configuration
    if (!config.modelName || !config.modelVersion) {
      return res.status(400).json({ 
        error: 'Model name and version are required' 
      });
    }
    
    // Start training (this will run asynchronously)
    // In production, this should be queued to a job system
    orchestrator.trainModel(config)
      .then(result => {
        console.log('Model training completed:', result);
      })
      .catch(error => {
        console.error('Model training failed:', error);
      });
    
    res.json({
      success: true,
      message: 'Model training started',
      config: {
        modelName: config.modelName,
        modelVersion: config.modelVersion,
        algorithm: config.algorithm
      }
    });
  } catch (error) {
    console.error('Training start error:', error);
    res.status(500).json({ 
      error: 'Failed to start training',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/models/:modelId/deploy
 * Deploy a trained model to blockchain
 */
router.post('/:modelId/deploy', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);
    const { contributors, shares } = req.body;
    
    // Validate inputs
    if (!Array.isArray(contributors) || !Array.isArray(shares)) {
      return res.status(400).json({ 
        error: 'Contributors and shares arrays are required' 
      });
    }
    
    if (contributors.length !== shares.length) {
      return res.status(400).json({ 
        error: 'Contributors and shares arrays must have the same length' 
      });
    }
    
    const totalShares = shares.reduce((sum, share) => sum + share, 0);
    if (totalShares !== 100) {
      return res.status(400).json({ 
        error: 'Shares must sum to 100' 
      });
    }
    
    // Deploy model
    const deployment = await orchestrator.deployModelToBlockchain(
      modelId,
      contributors,
      shares
    );
    
    res.json({
      success: true,
      deployment
    });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ 
      error: 'Failed to deploy model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/models
 * List all trained models
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      minAccuracy: req.query.minAccuracy ? parseFloat(req.query.minAccuracy as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };
    
    const models = await orchestrator.listModels(filters);
    
    res.json({
      success: true,
      models: models.map(m => ({
        id: m.id,
        modelName: m.model_name,
        modelVersion: m.model_version,
        accuracy: m.accuracy_score,
        datasetSize: m.dataset_size,
        status: m.status,
        trainingStartDate: m.training_start_date,
        trainingEndDate: m.training_end_date,
        blockchainTxHash: m.blockchain_tx_hash,
        modelHash: m.model_hash
      })),
      total: models.length
    });
  } catch (error) {
    console.error('Models list error:', error);
    res.status(500).json({ 
      error: 'Failed to list models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/models/:modelId
 * Get details of a specific model
 */
router.get('/:modelId', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);
    
    // Get model details and metrics
    const models = await orchestrator.listModels({ limit: 1 });
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
      return res.status(404).json({ 
        error: 'Model not found' 
      });
    }
    
    const metrics = await orchestrator.getModelMetrics(modelId);
    
    res.json({
      success: true,
      model: {
        id: model.id,
        modelName: model.model_name,
        modelVersion: model.model_version,
        accuracy: model.accuracy_score,
        datasetSize: model.dataset_size,
        status: model.status,
        trainingStartDate: model.training_start_date,
        trainingEndDate: model.training_end_date,
        blockchainTxHash: model.blockchain_tx_hash,
        modelHash: model.model_hash,
        metrics: metrics.map(m => ({
          name: m.metric_name,
          value: m.metric_value,
          testDatasetSize: m.test_dataset_size,
          measuredAt: m.measured_at
        }))
      }
    });
  } catch (error) {
    console.error('Model details error:', error);
    res.status(500).json({ 
      error: 'Failed to get model details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/models/:modelId/metrics
 * Get performance metrics for a model
 */
router.get('/:modelId/metrics', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);
    const metrics = await orchestrator.getModelMetrics(modelId);
    
    res.json({
      success: true,
      modelId,
      metrics: metrics.map(m => ({
        name: m.metric_name,
        value: m.metric_value,
        testDatasetSize: m.test_dataset_size,
        measuredAt: m.measured_at
      }))
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ 
      error: 'Failed to get model metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/models/latest
 * Get the latest deployed model
 */
router.get('/latest/deployed', async (req: Request, res: Response) => {
  try {
    const models = await orchestrator.listModels({
      status: 'completed',
      limit: 1
    });
    
    if (models.length === 0) {
      return res.status(404).json({ 
        error: 'No deployed models found' 
      });
    }
    
    const model = models[0];
    const metrics = await orchestrator.getModelMetrics(model.id);
    
    res.json({
      success: true,
      model: {
        id: model.id,
        modelName: model.model_name,
        modelVersion: model.model_version,
        accuracy: model.accuracy_score,
        datasetSize: model.dataset_size,
        trainingDate: model.training_end_date,
        blockchainTxHash: model.blockchain_tx_hash,
        metrics: metrics.map(m => ({
          name: m.metric_name,
          value: m.metric_value
        }))
      }
    });
  } catch (error) {
    console.error('Latest model error:', error);
    res.status(500).json({ 
      error: 'Failed to get latest model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/models/:modelId/predict
 * Use a model to make predictions
 */
router.post('/:modelId/predict', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);
    const { url, keyword, features } = req.body;
    
    // This would load the model and make predictions
    // For now, return mock prediction
    const prediction = {
      modelId,
      url,
      keyword,
      currentPosition: Math.floor(Math.random() * 20) + 1,
      predictedPosition: Math.floor(Math.random() * 10) + 1,
      rankingScore: Math.random() * 0.5 + 0.5,
      confidenceScore: Math.random() * 0.3 + 0.7,
      recommendations: [
        'Improve Core Web Vitals',
        'Increase content quality',
        'Build more backlinks'
      ]
    };
    
    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to make prediction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Middleware to initialize service with database pool
 */
export function initializeSEOModelTrainingAPI(dbPool: Pool, blockchainConfig?: any) {
  initializeService(dbPool, blockchainConfig);
}

export default router;
