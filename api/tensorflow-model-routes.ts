/**
 * TensorFlow Model Manager API Routes
 * 
 * Provides REST API for managing per-client TensorFlow models
 */

import express, { Request, Response, NextFunction } from 'express';
import { getTensorFlowModelManager } from '../services/tensorflow-model-manager';

const router = express.Router();

/**
 * POST /api/tensorflow/models/:clientId
 * Create a new model for a client
 */
router.post('/models/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const config = req.body.config || {};
    
    const modelManager = getTensorFlowModelManager();
    
    if (modelManager.hasModel(clientId)) {
      return res.status(409).json({
        success: false,
        error: 'Model already exists for this client',
        clientId
      });
    }
    
    await modelManager.createClientModel(clientId, config);
    
    res.status(201).json({
      success: true,
      message: 'Model created successfully',
      data: {
        clientId,
        config: modelManager.getConfig(clientId)
      },
      meta: {
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create model',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/tensorflow/models/:clientId/train
 * Train a client's model
 */
router.post('/models/:clientId/train', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const { trainingData, config } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'trainingData array is required'
      });
    }
    
    const modelManager = getTensorFlowModelManager();
    
    if (!modelManager.hasModel(clientId)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found for this client',
        clientId
      });
    }
    
    const metrics = await modelManager.trainModel(clientId, trainingData, config);
    
    // Save model after training
    await modelManager.saveModel(clientId);
    
    res.json({
      success: true,
      message: 'Model trained successfully',
      data: {
        clientId,
        metrics,
        trainingDataCount: trainingData.length
      },
      meta: {
        trainedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error training model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to train model',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/tensorflow/models/:clientId/train-from-prompt
 * Train model using natural language prompt
 */
router.post('/models/:clientId/train-from-prompt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const { prompt, trainingData } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      });
    }
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'trainingData array is required'
      });
    }
    
    const modelManager = getTensorFlowModelManager();
    const metrics = await modelManager.trainFromPrompt(clientId, prompt, trainingData);
    
    // Save model after training
    await modelManager.saveModel(clientId);
    
    res.json({
      success: true,
      message: 'Model trained from prompt successfully',
      data: {
        clientId,
        prompt,
        metrics,
        trainingDataCount: trainingData.length
      },
      meta: {
        trainedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error training model from prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to train model from prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/tensorflow/models/:clientId/predict
 * Make predictions using a client's model
 */
router.post('/models/:clientId/predict', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const { attributes } = req.body;
    
    if (!attributes || !Array.isArray(attributes)) {
      return res.status(400).json({
        success: false,
        error: 'attributes array is required'
      });
    }
    
    const modelManager = getTensorFlowModelManager();
    
    if (!modelManager.hasModel(clientId)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found for this client',
        clientId
      });
    }
    
    const predictions = await modelManager.predict(clientId, attributes);
    
    res.json({
      success: true,
      data: {
        clientId,
        predictions,
        inputDimensions: attributes.length
      },
      meta: {
        predictedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error making prediction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make prediction',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/tensorflow/models/:clientId
 * Get model information
 */
router.get('/models/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const modelManager = getTensorFlowModelManager();
    
    if (!modelManager.hasModel(clientId)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found for this client',
        clientId
      });
    }
    
    const config = modelManager.getConfig(clientId);
    const metrics = modelManager.getMetrics(clientId);
    
    res.json({
      success: true,
      data: {
        clientId,
        config,
        metrics,
        exists: true
      },
      meta: {
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting model info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/tensorflow/models/:clientId/metrics
 * Get model metrics
 */
router.get('/models/:clientId/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const modelManager = getTensorFlowModelManager();
    
    if (!modelManager.hasModel(clientId)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found for this client',
        clientId
      });
    }
    
    const metrics = modelManager.getMetrics(clientId);
    
    res.json({
      success: true,
      data: {
        clientId,
        metrics
      },
      meta: {
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting model metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/tensorflow/models/:clientId/save
 * Save model to disk
 */
router.post('/models/:clientId/save', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const modelManager = getTensorFlowModelManager();
    
    if (!modelManager.hasModel(clientId)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found for this client',
        clientId
      });
    }
    
    await modelManager.saveModel(clientId);
    
    res.json({
      success: true,
      message: 'Model saved successfully',
      data: {
        clientId
      },
      meta: {
        savedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save model',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/tensorflow/models/:clientId/load
 * Load model from disk
 */
router.post('/models/:clientId/load', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const modelManager = getTensorFlowModelManager();
    
    await modelManager.loadModel(clientId);
    
    const config = modelManager.getConfig(clientId);
    const metrics = modelManager.getMetrics(clientId);
    
    res.json({
      success: true,
      message: 'Model loaded successfully',
      data: {
        clientId,
        config,
        metrics
      },
      meta: {
        loadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error loading model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load model',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/tensorflow/models/:clientId
 * Delete a client's model
 */
router.delete('/models/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;
    const modelManager = getTensorFlowModelManager();
    
    if (!modelManager.hasModel(clientId)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found for this client',
        clientId
      });
    }
    
    modelManager.deleteModel(clientId);
    
    res.json({
      success: true,
      message: 'Model deleted successfully',
      data: {
        clientId
      },
      meta: {
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete model',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/tensorflow/models
 * Get all models stats
 */
router.get('/models', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const modelManager = getTensorFlowModelManager();
    const stats = modelManager.getStats();
    
    res.json({
      success: true,
      data: stats,
      meta: {
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting models stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
