/**
 * Neural Network Dashboard API Routes
 * Comprehensive API for managing neural network instances, data streams,
 * attributes, and integrations
 */

import express from 'express';
import { NeuralNetworkInstanceService } from '../services/NeuralNetworkInstanceService.js';

export function createNeuralNetworkDashboardRoutes(dbPool) {
  const router = express.Router();
  const service = new NeuralNetworkInstanceService(dbPool);

  // ============================================================================
  // INSTANCE MANAGEMENT
  // ============================================================================

  /**
   * GET /api/neural-network-dashboard/instances
   * List all neural network instances
   */
  router.get('/instances', async (req, res) => {
    try {
      const { model_type, status } = req.query;
      const filters = {};
      
      if (model_type) filters.model_type = model_type;
      if (status) filters.status = status;

      const instances = await service.getAllInstances(filters);
      
      res.json({
        success: true,
        data: instances,
        count: instances.length
      });
    } catch (error) {
      console.error('Error listing instances:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list instances',
        message: error.message
      });
    }
  });

  /**
   * GET /api/neural-network-dashboard/instances/:id
   * Get a specific neural network instance with all relationships
   */
  router.get('/instances/:id', async (req, res) => {
    try {
      const instance = await service.getInstance(req.params.id);
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      res.json({
        success: true,
        data: instance
      });
    } catch (error) {
      console.error('Error getting instance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get instance',
        message: error.message
      });
    }
  });

  /**
   * POST /api/neural-network-dashboard/instances
   * Create a new neural network instance
   */
  router.post('/instances', async (req, res) => {
    try {
      const instance = await service.createInstance(req.body);
      
      res.status(201).json({
        success: true,
        data: instance,
        message: 'Neural network instance created successfully'
      });
    } catch (error) {
      console.error('Error creating instance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create instance',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/neural-network-dashboard/instances/:id
   * Delete a neural network instance
   */
  router.delete('/instances/:id', async (req, res) => {
    try {
      const success = await service.deleteInstance(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      res.json({
        success: true,
        message: 'Instance deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting instance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete instance',
        message: error.message
      });
    }
  });

  // ============================================================================
  // DATA STREAM MANAGEMENT
  // ============================================================================

  /**
   * POST /api/neural-network-dashboard/instances/:id/data-streams
   * Add a data stream to a neural network instance
   */
  router.post('/instances/:id/data-streams', async (req, res) => {
    try {
      const stream = await service.addDataStream(req.params.id, req.body);
      
      res.status(201).json({
        success: true,
        data: stream,
        message: 'Data stream added successfully'
      });
    } catch (error) {
      console.error('Error adding data stream:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add data stream',
        message: error.message
      });
    }
  });

  /**
   * POST /api/neural-network-dashboard/instances/:id/combine-attributes
   * Combine multiple attributes into a data stream
   */
  router.post('/instances/:id/combine-attributes', async (req, res) => {
    try {
      const { attribute_ids, stream_name } = req.body;
      
      if (!attribute_ids || !Array.isArray(attribute_ids) || attribute_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'attribute_ids array is required'
        });
      }

      if (!stream_name) {
        return res.status(400).json({
          success: false,
          error: 'stream_name is required'
        });
      }

      const stream = await service.combineAttributes(
        req.params.id,
        attribute_ids,
        stream_name
      );
      
      res.status(201).json({
        success: true,
        data: stream,
        message: 'Attributes combined into data stream successfully'
      });
    } catch (error) {
      console.error('Error combining attributes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to combine attributes',
        message: error.message
      });
    }
  });

  // ============================================================================
  // ATTRIBUTE MANAGEMENT
  // ============================================================================

  /**
   * GET /api/neural-network-dashboard/attributes/:id/drilldown
   * Get drilldown data for a specific attribute
   */
  router.get('/attributes/:id/drilldown', async (req, res) => {
    try {
      const drilldown = await service.getAttributeDrilldown(req.params.id);
      
      if (!drilldown) {
        return res.status(404).json({
          success: false,
          error: 'Attribute not found'
        });
      }

      res.json({
        success: true,
        data: drilldown
      });
    } catch (error) {
      console.error('Error getting attribute drilldown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get attribute drilldown',
        message: error.message
      });
    }
  });

  // ============================================================================
  // TRAINING DATA MANAGEMENT
  // ============================================================================

  /**
   * POST /api/neural-network-dashboard/instances/:id/training-data
   * Add training data to a neural network instance
   */
  router.post('/instances/:id/training-data', async (req, res) => {
    try {
      const trainingData = await service.addTrainingData(req.params.id, req.body);
      
      res.status(201).json({
        success: true,
        data: trainingData,
        message: 'Training data added successfully'
      });
    } catch (error) {
      console.error('Error adding training data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add training data',
        message: error.message
      });
    }
  });

  // ============================================================================
  // PROJECT ORGANIZATION RESEARCH
  // ============================================================================

  /**
   * POST /api/neural-network-dashboard/instances/:id/setup-research
   * Setup project organization research for the neural network
   */
  router.post('/instances/:id/setup-research', async (req, res) => {
    try {
      const research = await service.setupProjectOrganizationResearch(req.params.id);
      
      res.status(201).json({
        success: true,
        data: research,
        message: 'Project organization research setup successfully'
      });
    } catch (error) {
      console.error('Error setting up research:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to setup research',
        message: error.message
      });
    }
  });

  // ============================================================================
  // MODEL CATALOG
  // ============================================================================

  /**
   * GET /api/neural-network-dashboard/models
   * List available pre-trained models
   */
  router.get('/models', async (req, res) => {
    try {
      const { model_type, status } = req.query;
      
      let query = 'SELECT * FROM neural_network_models WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (model_type) {
        query += ` AND model_type = $${paramIndex}`;
        params.push(model_type);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ' ORDER BY is_default DESC, model_name';

      const result = await dbPool.query(query, params);
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error listing models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list models',
        message: error.message
      });
    }
  });

  // ============================================================================
  // STATISTICS AND OVERVIEW
  // ============================================================================

  /**
   * GET /api/neural-network-dashboard/stats
   * Get overall statistics for neural network dashboard
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = await dbPool.query(`
        SELECT 
          COUNT(*) as total_instances,
          COUNT(*) FILTER (WHERE status = 'ready') as ready_instances,
          COUNT(*) FILTER (WHERE status = 'training') as training_instances,
          COUNT(*) FILTER (WHERE status = 'error') as error_instances,
          (SELECT COUNT(*) FROM neural_network_data_streams WHERE status = 'active') as active_streams,
          (SELECT COUNT(*) FROM neural_network_attributes WHERE is_active = true) as active_attributes,
          (SELECT COUNT(*) FROM neural_network_training_data) as total_training_records,
          (SELECT COUNT(*) FROM neural_network_models WHERE is_default = true) as default_models,
          (SELECT AVG(accuracy) FROM neural_network_instances WHERE accuracy IS NOT NULL) as avg_accuracy
        FROM neural_network_instances
      `);

      res.json({
        success: true,
        data: stats.rows[0]
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
        message: error.message
      });
    }
  });

  // ============================================================================
  // CONFIGURATION TEMPLATES
  // ============================================================================

  /**
   * GET /api/neural-network-dashboard/templates
   * Get configuration templates for different use cases
   */
  router.get('/templates', async (req, res) => {
    try {
      const templates = {
        scraping: {
          name: 'Web Scraping Neural Network',
          description: 'Optimized for web scraping with Crawlee integration',
          model_type: 'scraping',
          architecture: {
            layers: [
              { type: 'dense', units: 128, activation: 'relu' },
              { type: 'dropout', rate: 0.3 },
              { type: 'dense', units: 64, activation: 'relu' },
              { type: 'dense', units: 1, activation: 'sigmoid' }
            ]
          },
          training_config: {
            epochs: 50,
            batch_size: 32,
            learning_rate: 0.001,
            validation_split: 0.2
          },
          load_default_models: true
        },
        seo: {
          name: 'SEO Optimization Neural Network',
          description: 'Optimized for SEO analysis and content optimization',
          model_type: 'seo',
          architecture: {
            layers: [
              { type: 'dense', units: 256, activation: 'relu' },
              { type: 'dropout', rate: 0.4 },
              { type: 'dense', units: 128, activation: 'relu' },
              { type: 'dropout', rate: 0.3 },
              { type: 'dense', units: 64, activation: 'relu' },
              { type: 'dense', units: 1, activation: 'linear' }
            ]
          },
          training_config: {
            epochs: 100,
            batch_size: 64,
            learning_rate: 0.0001,
            validation_split: 0.2
          },
          load_default_models: true
        },
        data_mining: {
          name: 'Data Mining Neural Network',
          description: 'Optimized for data mining and pattern detection',
          model_type: 'data_mining',
          architecture: {
            layers: [
              { type: 'dense', units: 512, activation: 'relu' },
              { type: 'dropout', rate: 0.5 },
              { type: 'dense', units: 256, activation: 'relu' },
              { type: 'dropout', rate: 0.4 },
              { type: 'dense', units: 128, activation: 'relu' },
              { type: 'dense', units: 3, activation: 'softmax' }
            ]
          },
          training_config: {
            epochs: 75,
            batch_size: 128,
            learning_rate: 0.0005,
            validation_split: 0.2
          },
          load_default_models: true
        }
      };

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get templates',
        message: error.message
      });
    }
  });

  return router;
}
