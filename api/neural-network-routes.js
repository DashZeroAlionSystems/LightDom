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
   * Make a prediction using a neural network instance
   */
  router.post('/instances/:id/predict', async (req, res) => {
    try {
      const prediction = await manager.predict(req.params.id, req.body.input);
      res.json({ prediction });
    } catch (error) {
      console.error('Error making prediction:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Prediction failed' });
    }
  });

  /**
   * DELETE /api/neural-networks/instances/:id
   * Delete (archive) a neural network instance
   */
  router.delete('/instances/:id', async (req, res) => {
    try {
      await manager.deleteInstance(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting instance:', error);
      res.status(500).json({ error: 'Failed to delete instance' });
    }
  });

  /**
   * GET /api/neural-networks/client/:clientId/instances
   * Get all instances for a specific client
   */
  router.get('/client/:clientId/instances', async (req, res) => {
    try {
      const instances = manager.getClientInstances(req.params.clientId);
      res.json(instances);
    } catch (error) {
      console.error('Error getting client instances:', error);
      res.status(500).json({ error: 'Failed to get client instances' });
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
          description: 'Optimize website SEO based on best practices and data',
        },
        {
          value: 'component_generation',
          label: 'Component Generation',
          description: 'Generate React components from specifications',
        },
        {
          value: 'workflow_prediction',
          label: 'Workflow Prediction',
          description: 'Predict optimal workflows based on patterns',
        },
        {
          value: 'accessibility_improvement',
          label: 'Accessibility Improvement',
          description: 'Enhance website accessibility compliance',
        },
        {
          value: 'ux_pattern_recognition',
          label: 'UX Pattern Recognition',
          description: 'Recognize and classify UX patterns',
        },
        {
          value: 'schema_relationship_learning',
          label: 'Schema Relationship Learning',
          description: 'Learn relationships between schemas',
        },
        {
          value: 'performance_optimization',
          label: 'Performance Optimization',
          description: 'Optimize website performance metrics',
        },
        {
          value: 'design_system_extraction',
          label: 'Design System Extraction',
          description: 'Extract design systems from websites',
        },
        {
          value: 'content_generation',
          label: 'Content Generation',
          description: 'Generate optimized content',
        },
        {
          value: 'sentiment_analysis',
          label: 'Sentiment Analysis',
          description: 'Analyze sentiment in content',
        },
      ];

      res.json(modelTypes);
    } catch (error) {
      console.error('Error getting model types:', error);
      res.status(500).json({ error: 'Failed to get model types' });
    }
  });

  /**
   * GET /api/neural-networks/stats
   * Get overall statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const instances = manager.getAllInstances();

      const stats = {
        total: instances.length,
        byStatus: {
          ready: instances.filter(i => i.status === 'ready').length,
          training: instances.filter(i => i.status === 'training').length,
          error: instances.filter(i => i.status === 'error').length,
          initializing: instances.filter(i => i.status === 'initializing').length,
          paused: instances.filter(i => i.status === 'paused').length,
        },
        byModelType: instances.reduce((acc, i) => {
          acc[i.modelType] = (acc[i.modelType] || 0) + 1;
          return acc;
        }, {}),
        avgAccuracy:
          instances
            .filter(i => i.performance?.accuracy)
            .reduce((sum, i) => sum + (i.performance?.accuracy || 0), 0) /
          (instances.filter(i => i.performance?.accuracy).length || 1),
        totalPredictions: instances.reduce(
          (sum, i) => sum + (i.performance?.predictionCount || 0),
          0
        ),
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });

  return router;
}

export default createNeuralNetworkRoutes;
