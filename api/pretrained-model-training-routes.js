/**
 * Pretrained Model Training API Routes
 * 
 * RESTful API endpoints for managing pretrained model training pipelines,
 * collecting training data, and running training jobs.
 * 
 * Endpoints:
 * - GET /api/pretrained-models - List available pretrained models
 * - GET /api/pretrained-models/:modelId - Get model details
 * - POST /api/training-pipelines - Create training pipeline
 * - GET /api/training-pipelines - List training pipelines
 * - POST /api/training-pipelines/:id/start - Start training
 * - GET /api/training-runs/:id - Get training run status
 * - POST /api/training-data - Submit training data from crawler
 * - GET /api/training-data/quality - Get training data quality stats
 * - POST /api/inference - Make predictions with trained model
 */

import { Router } from 'express';
import { PretrainedModelTrainingService } from '../services/pretrained-model-training-service.js';

/**
 * Create pretrained model training routes
 * @param {Pool} dbPool - PostgreSQL connection pool
 * @returns {Router} Express router
 */
export function createPretrainedModelRoutes(dbPool) {
  const router = Router();
  
  // Initialize service
  const trainingService = new PretrainedModelTrainingService({
    db: dbPool
  });
  
  // Initialize service on first request
  let initialized = false;
  
  const ensureInitialized = async (req, res, next) => {
    if (!initialized) {
      try {
        await trainingService.initialize();
        initialized = true;
      } catch (error) {
        console.error('Failed to initialize training service:', error);
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
   * GET /api/pretrained-models
   * List all available pretrained models
   */
  router.get('/pretrained-models', async (req, res) => {
    try {
      const { useCase, performance, task } = req.query;
      
      let models = trainingService.getAvailableModels();
      
      // Filter by use case
      if (useCase) {
        models = models.filter(m => 
          m.seoUseCase === useCase || 
          m.seoApplications?.some(app => 
            app.toLowerCase().includes(useCase.toLowerCase())
          )
        );
      }
      
      // Filter by performance
      if (performance) {
        models = models.filter(m => m.performance === performance);
      }
      
      // Filter by task
      if (task) {
        models = models.filter(m => m.task === task);
      }
      
      res.json({
        success: true,
        data: {
          models,
          total: models.length,
          statistics: trainingService.getStatistics().registryStats
        }
      });
    } catch (error) {
      console.error('Error listing pretrained models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list pretrained models'
      });
    }
  });

  /**
   * GET /api/pretrained-models/:modelId
   * Get details for a specific pretrained model
   */
  router.get('/pretrained-models/:modelId', async (req, res) => {
    try {
      const { modelId } = req.params;
      
      const models = trainingService.getAvailableModels();
      const model = models.find(m => m.modelId === modelId);
      
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

  /**
   * GET /api/pretrained-models/pipeline/crawler
   * Get recommended models for crawler integration
   */
  router.get('/pretrained-models/pipeline/crawler', async (req, res) => {
    try {
      const pipeline = trainingService.getCrawlerPipelineModels();
      
      res.json({
        success: true,
        data: pipeline
      });
    } catch (error) {
      console.error('Error getting crawler pipeline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get crawler pipeline'
      });
    }
  });

  // ==========================================================================
  // TRAINING PIPELINES
  // ==========================================================================

  /**
   * POST /api/training-pipelines
   * Create a new training pipeline
   */
  router.post('/training-pipelines', async (req, res) => {
    try {
      const {
        name,
        description,
        clientId,
        pretrainedModelId,
        neuralNetworkId,
        sourceType,
        trainingConfig,
        scheduleType
      } = req.body;
      
      if (!name || !clientId || !pretrainedModelId) {
        return res.status(400).json({
          success: false,
          error: 'name, clientId, and pretrainedModelId are required'
        });
      }
      
      const pipeline = await trainingService.createTrainingPipeline({
        name,
        description,
        clientId,
        pretrainedModelId,
        neuralNetworkId,
        sourceType,
        trainingConfig,
        scheduleType
      });
      
      res.status(201).json({
        success: true,
        data: pipeline
      });
    } catch (error) {
      console.error('Error creating training pipeline:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create training pipeline'
      });
    }
  });

  /**
   * GET /api/training-pipelines
   * List training pipelines
   */
  router.get('/training-pipelines', async (req, res) => {
    try {
      const { clientId, status } = req.query;
      
      let query = 'SELECT * FROM v_training_pipeline_status WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (clientId) {
        query += ` AND client_id = $${paramIndex}`;
        params.push(clientId);
        paramIndex++;
      }
      
      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await dbPool.query(query, params);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error listing training pipelines:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list training pipelines'
      });
    }
  });

  /**
   * GET /api/training-pipelines/:id
   * Get training pipeline details
   */
  router.get('/training-pipelines/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await dbPool.query(`
        SELECT * FROM v_training_pipeline_status WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pipeline not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting pipeline details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pipeline details'
      });
    }
  });

  /**
   * POST /api/training-pipelines/:id/start
   * Start a training run for a pipeline
   */
  router.post('/training-pipelines/:id/start', async (req, res) => {
    try {
      const { id } = req.params;
      const options = req.body || {};
      
      const result = await trainingService.startTrainingRun(id, options);
      
      res.status(202).json({
        success: true,
        data: result,
        message: 'Training run started'
      });
    } catch (error) {
      console.error('Error starting training run:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start training run'
      });
    }
  });

  // ==========================================================================
  // TRAINING RUNS
  // ==========================================================================

  /**
   * GET /api/training-runs
   * List training runs
   */
  router.get('/training-runs', async (req, res) => {
    try {
      const { pipelineId, status, limit = 50 } = req.query;
      
      let query = 'SELECT * FROM v_recent_training_runs WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (pipelineId) {
        query += ` AND pipeline_id = $${paramIndex}`;
        params.push(pipelineId);
        paramIndex++;
      }
      
      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      
      const result = await dbPool.query(query, params);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error listing training runs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list training runs'
      });
    }
  });

  /**
   * GET /api/training-runs/:id
   * Get training run status and details
   */
  router.get('/training-runs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const status = await trainingService.getTrainingRunStatus(id);
      
      if (!status) {
        return res.status(404).json({
          success: false,
          error: 'Training run not found'
        });
      }
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting training run status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get training run status'
      });
    }
  });

  // ==========================================================================
  // TRAINING DATA
  // ==========================================================================

  /**
   * POST /api/training-data
   * Submit training data from crawler
   */
  router.post('/training-data', async (req, res) => {
    try {
      const {
        url,
        clientId,
        content,
        metaData,
        seoAttributes,
        domStructure,
        performanceMetrics,
        schemaMarkup,
        targetModelTypes
      } = req.body;
      
      if (!url || !clientId) {
        return res.status(400).json({
          success: false,
          error: 'url and clientId are required'
        });
      }
      
      const result = await trainingService.collectTrainingData(
        {
          url,
          content,
          metaData,
          seoAttributes,
          domStructure,
          performanceMetrics,
          schemaMarkup
        },
        clientId,
        targetModelTypes || []
      );
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error collecting training data:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to collect training data'
      });
    }
  });

  /**
   * POST /api/training-data/batch
   * Submit multiple training data records
   */
  router.post('/training-data/batch', async (req, res) => {
    try {
      const { clientId, items, targetModelTypes } = req.body;
      
      if (!clientId || !items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'clientId and items array are required'
        });
      }
      
      const results = [];
      const errors = [];
      
      for (const item of items) {
        try {
          const result = await trainingService.collectTrainingData(
            item,
            clientId,
            targetModelTypes || []
          );
          results.push(result);
        } catch (error) {
          errors.push({
            url: item.url,
            error: error.message
          });
        }
      }
      
      res.status(201).json({
        success: true,
        data: {
          collected: results.length,
          failed: errors.length,
          results,
          errors
        }
      });
    } catch (error) {
      console.error('Error collecting batch training data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to collect batch training data'
      });
    }
  });

  /**
   * GET /api/training-data/quality
   * Get training data quality statistics
   */
  router.get('/training-data/quality', async (req, res) => {
    try {
      const { clientId } = req.query;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: 'clientId is required'
        });
      }
      
      const quality = await trainingService.getTrainingDataQuality(clientId);
      
      res.json({
        success: true,
        data: quality
      });
    } catch (error) {
      console.error('Error getting training data quality:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get training data quality'
      });
    }
  });

  /**
   * GET /api/training-data/summary
   * Get training data summary across all clients
   */
  router.get('/training-data/summary', async (req, res) => {
    try {
      const result = await dbPool.query(`
        SELECT * FROM v_training_data_quality
        ORDER BY total_records DESC
      `);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting training data summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get training data summary'
      });
    }
  });

  // ==========================================================================
  // INFERENCE
  // ==========================================================================

  /**
   * POST /api/inference
   * Make predictions using trained model
   */
  router.post('/inference', async (req, res) => {
    try {
      const { neuralNetworkId, input, clientId } = req.body;
      
      if (!neuralNetworkId || !input) {
        return res.status(400).json({
          success: false,
          error: 'neuralNetworkId and input are required'
        });
      }
      
      const prediction = await trainingService.predict(
        neuralNetworkId,
        input,
        { clientId }
      );
      
      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      console.error('Error making prediction:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to make prediction'
      });
    }
  });

  // ==========================================================================
  // MODEL PERFORMANCE
  // ==========================================================================

  /**
   * GET /api/model-performance
   * Get model performance comparison
   */
  router.get('/model-performance', async (req, res) => {
    try {
      const result = await dbPool.query(`
        SELECT * FROM v_model_performance_comparison
      `);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting model performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get model performance'
      });
    }
  });

  // ==========================================================================
  // SERVICE STATISTICS
  // ==========================================================================

  /**
   * GET /api/training-service/stats
   * Get training service statistics
   */
  router.get('/training-service/stats', async (req, res) => {
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

  // ==========================================================================
  // SEO ATTRIBUTE DEFINITIONS
  // ==========================================================================

  /**
   * GET /api/seo-attributes
   * Get SEO attribute definitions
   */
  router.get('/seo-attributes', async (req, res) => {
    try {
      const { category, isActive = true } = req.query;
      
      let query = 'SELECT * FROM seo_attribute_definitions WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(isActive === 'true' || isActive === true);
        paramIndex++;
      }
      
      query += ' ORDER BY category, attribute_name';
      
      const result = await dbPool.query(query, params);
      
      // Group by category
      const grouped = result.rows.reduce((acc, row) => {
        if (!acc[row.category]) {
          acc[row.category] = [];
        }
        acc[row.category].push(row);
        return acc;
      }, {});
      
      res.json({
        success: true,
        data: {
          attributes: result.rows,
          byCategory: grouped,
          total: result.rows.length
        }
      });
    } catch (error) {
      console.error('Error getting SEO attributes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get SEO attributes'
      });
    }
  });

  return router;
}

export default createPretrainedModelRoutes;
