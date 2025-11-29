/**
 * API Routes for Neural Network Instance Management
 * RESTful API for creating, training, and managing per-client neural network instances
 */

import { Router } from 'express';
import { NeuralNetworkInstanceManager } from '../services/NeuralNetworkInstanceManager';

/**
 * @param {Pool} dbPool
 * @returns {import('express').Router}
 */
export function createNeuralNetworkRoutes(dbPool) {
  const router = Router();
  const manager = new NeuralNetworkInstanceManager(dbPool);

  // Initialize manager
  manager.initialize().catch(console.error);

  /**
   * GET /api/neural-networks/instances
   * List all neural network instances
   */
  router.get('/instances', async (req, res) => {
    try {
      const { clientId, modelType, status } = req.query;

      let instances = manager.getAllInstances();

      // Filter by clientId
      if (clientId) {
        instances = instances.filter(i => i.clientId === clientId);
      }

      // Filter by modelType
      if (modelType) {
        instances = instances.filter(i => i.modelType === modelType);
      }

      // Filter by status
      if (status) {
        instances = instances.filter(i => i.status === status);
      }

      res.json(instances);
    } catch (error) {
      console.error('Error listing instances:', error);
      res.status(500).json({ error: 'Failed to list instances' });
    }
  });

  /**
   * GET /api/neural-networks/instances/:id
   * Get a specific neural network instance
   */
  router.get('/instances/:id', async (req, res) => {
    try {
      const instance = manager.getInstance(req.params.id);

      if (!instance) {
        return res.status(404).json({ error: 'Instance not found' });
      }

      res.json(instance);
    } catch (error) {
      console.error('Error getting instance:', error);
      res.status(500).json({ error: 'Failed to get instance' });
    }
  });

  /**
   * POST /api/neural-networks/instances
   * Create a new neural network instance
   */
  router.post('/instances', async (req, res) => {
    try {
      const instance = await manager.createInstance(req.body);
      res.status(201).json(instance);
    } catch (error) {
      console.error('Error creating instance:', error);
      res.status(500).json({ error: 'Failed to create instance' });
    }
  });

  /**
   * POST /api/neural-networks/instances/:id/train
   * Train a neural network instance
   */
  router.post('/instances/:id/train', async (req, res) => {
    try {
      const performance = await manager.trainInstance(req.params.id);
      res.json({ success: true, performance });
    } catch (error) {
      console.error('Error training instance:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Training failed' });
    }
  });

  /**
   * POST /api/neural-networks/instances/:id/predict
   * Make predictions using a neural network instance
   */
  router.post('/instances/:id/predict', async (req, res) => {
    try {
      const prediction = await manager.predict(req.params.id, req.body.input);
      res.json({ success: true, prediction });
    } catch (error) {
      console.error('Error making prediction:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Prediction failed' });
    }
  });

  /**
   * POST /api/neural-networks/datasets/upload
   * Upload training dataset for a neural network instance
   */
  router.post('/datasets/upload', async (req, res) => {
    try {
      const multer = await import('multer');
      const upload = multer.default({ dest: 'uploads/' });
      
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: 'File upload failed', message: err.message });
        }

        const { instanceId, datasetName, datasetType } = req.body;
        const file = req.file;

        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Here you would process the uploaded dataset
        // For now, we'll just acknowledge the upload
        res.json({
          success: true,
          message: 'Dataset uploaded successfully',
          dataset: {
            instanceId,
            name: datasetName,
            type: datasetType,
            filename: file.originalname,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
        });
      });
    } catch (error) {
      console.error('Error uploading dataset:', error);
      res.status(500).json({ error: 'Failed to upload dataset', message: error.message });
    }
  });

  /**
   * GET /api/neural-networks/model-types
   * Get available model types
   */
  router.get('/model-types', async (req, res) => {
    try {
      const modelTypes = [
        {
          value: 'seo_optimization',
          label: 'SEO Optimization',
          description: 'Optimize content for search engines',
          defaultModels: ['scraping', 'data_mining'],
        },
        {
          value: 'content_generation',
          label: 'Content Generation',
          description: 'Generate high-quality content',
          defaultModels: ['text_generation', 'nlp'],
        },
        {
          value: 'crawler_optimization',
          label: 'Crawler Optimization',
          description: 'Improve web crawling efficiency',
          defaultModels: ['scraping', 'pattern_recognition'],
        },
        {
          value: 'data_mining',
          label: 'Data Mining',
          description: 'Extract valuable insights from data',
          defaultModels: ['data_mining', 'clustering'],
        },
        {
          value: 'pattern_recognition',
          label: 'Pattern Recognition',
          description: 'Identify patterns in data',
          defaultModels: ['classification', 'pattern_recognition'],
        },
        {
          value: 'sentiment_analysis',
          label: 'Sentiment Analysis',
          description: 'Analyze sentiment in text',
          defaultModels: ['nlp', 'sentiment'],
        },
      ];

      res.json(modelTypes);
    } catch (error) {
      console.error('Error getting model types:', error);
      res.status(500).json({ error: 'Failed to get model types' });
    }
  });

  return router;
}

export default createNeuralNetworkRoutes;
