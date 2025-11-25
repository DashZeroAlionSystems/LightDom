/**
 * Pretrained Model Training Service
 * 
 * Connects TensorFlow pretrained models with crawler data mining and neural network training.
 * Provides a complete pipeline from data collection to model training and inference.
 * 
 * Features:
 * - Load pretrained models from TensorFlow Hub / Hugging Face
 * - Collect and process training data from crawler
 * - Train models with transfer learning
 * - Track training progress and metrics
 * - Deploy models for inference
 * 
 * @module services/pretrained-model-training-service
 */

import { EventEmitter } from 'events';
import { SEOPreTrainedModelsRegistry } from './seo-pretrained-models-registry.js';
import { NeuralNetworkSEOTrainer } from './neural-network-seo-trainer.js';

class PretrainedModelTrainingService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.db = options.db;
    this.modelsRegistry = new SEOPreTrainedModelsRegistry(options);
    
    // Configuration
    this.config = {
      modelsDir: options.modelsDir || './models/pretrained',
      minTrainingDataPoints: options.minTrainingDataPoints || 100,
      defaultBatchSize: options.defaultBatchSize || 32,
      defaultEpochs: options.defaultEpochs || 50,
      defaultLearningRate: options.defaultLearningRate || 0.001,
      defaultValidationSplit: options.defaultValidationSplit || 0.2,
      qualityThreshold: options.qualityThreshold || 70,
      enableTransferLearning: options.enableTransferLearning !== false,
      ...options.config
    };
    
    // Runtime state
    this.loadedModels = new Map();
    this.activePipelines = new Map();
    this.trainingSessions = new Map();
    
    // Statistics
    this.stats = {
      modelsLoaded: 0,
      totalTrainingRuns: 0,
      successfulTrainingRuns: 0,
      totalInferences: 0,
      averageTrainingTime: 0
    };
    
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Pretrained Model Training Service...');
    
    try {
      // Load available models from database
      if (this.db) {
        await this.loadModelsFromDatabase();
      }
      
      // Load registry statistics
      const registryStats = this.modelsRegistry.getStatistics();
      console.log(`📊 Model Registry Stats:`);
      console.log(`   - Total models: ${registryStats.total}`);
      console.log(`   - TensorFlow Hub: ${registryStats.bySource['tensorflow-hub']}`);
      console.log(`   - Hugging Face: ${registryStats.bySource['huggingface']}`);
      console.log(`   - Average accuracy: ${(registryStats.averageAccuracy * 100).toFixed(1)}%`);
      
      this.initialized = true;
      this.emit('initialized');
      
      console.log('✅ Pretrained Model Training Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Load pretrained models from database
   */
  async loadModelsFromDatabase() {
    try {
      const result = await this.db.query(`
        SELECT * FROM pretrained_models
        WHERE status = 'available'
        ORDER BY accuracy DESC
      `);
      
      console.log(`📦 Loaded ${result.rows.length} pretrained models from database`);
      
      for (const row of result.rows) {
        this.loadedModels.set(row.model_id, {
          ...row,
          registryModel: this.modelsRegistry.getModel(row.model_id)
        });
      }
      
      this.stats.modelsLoaded = this.loadedModels.size;
    } catch (error) {
      console.warn('Could not load models from database:', error.message);
    }
  }

  /**
   * Get all available pretrained models
   */
  getAvailableModels() {
    const registryModels = this.modelsRegistry.listAllModels();
    
    return registryModels.map(model => ({
      modelId: model.id,
      name: model.name,
      source: model.source,
      task: model.task,
      seoUseCase: model.seoUseCase,
      accuracy: model.accuracy,
      performance: model.performance,
      sizeMb: model.size_mb,
      seoApplications: model.seoApplications,
      isLoaded: this.loadedModels.has(model.id),
      transferLearningConfig: model.transferLearningConfig
    }));
  }

  /**
   * Get models by SEO use case
   */
  getModelsByUseCase(useCase) {
    return this.modelsRegistry.getModelsByUseCase(useCase);
  }

  /**
   * Get models suitable for crawler real-time analysis
   */
  getCrawlerPipelineModels() {
    return this.modelsRegistry.getCrawlerPipeline();
  }

  /**
   * Create a training pipeline
   */
  async createTrainingPipeline(config) {
    if (!this.db) {
      throw new Error('Database connection required for training pipeline');
    }

    const {
      name,
      description,
      clientId,
      sourceType = 'crawler',
      pretrainedModelId,
      neuralNetworkId,
      trainingConfig = {},
      scheduleType = 'manual'
    } = config;

    // Get pretrained model details
    const pretrainedModel = this.modelsRegistry.getModel(pretrainedModelId);
    if (!pretrainedModel) {
      throw new Error(`Pretrained model not found: ${pretrainedModelId}`);
    }

    // Merge training config with defaults and model recommendations
    const finalTrainingConfig = {
      epochs: trainingConfig.epochs || this.config.defaultEpochs,
      batchSize: trainingConfig.batchSize || this.config.defaultBatchSize,
      learningRate: trainingConfig.learningRate || this.config.defaultLearningRate,
      validationSplit: trainingConfig.validationSplit || this.config.defaultValidationSplit,
      optimizer: trainingConfig.optimizer || 'adam',
      earlyStopping: trainingConfig.earlyStopping !== false,
      patience: trainingConfig.patience || 5,
      ...trainingConfig
    };

    // Create pipeline in database
    const result = await this.db.query(`
      INSERT INTO training_pipelines (
        name, description, client_id, source_type, source_config,
        neural_network_id, pretrained_model_id, training_config,
        schedule_type, min_data_points, quality_threshold, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 
        (SELECT id FROM pretrained_models WHERE model_id = $7),
        $8, $9, $10, $11, 'active')
      RETURNING *
    `, [
      name,
      description || `Training pipeline for ${pretrainedModel.name}`,
      clientId,
      sourceType,
      JSON.stringify({ crawler: true, realtime: sourceType === 'crawler' }),
      neuralNetworkId,
      pretrainedModelId,
      JSON.stringify(finalTrainingConfig),
      scheduleType,
      this.config.minTrainingDataPoints,
      this.config.qualityThreshold
    ]);

    const pipeline = result.rows[0];
    this.activePipelines.set(pipeline.id, pipeline);

    this.emit('pipeline:created', pipeline);
    console.log(`✅ Created training pipeline: ${name} (${pipeline.id})`);

    return pipeline;
  }

  /**
   * Collect training data from crawler
   */
  async collectTrainingData(crawlerData, clientId, targetModelTypes = []) {
    if (!this.db) {
      throw new Error('Database connection required for data collection');
    }

    const {
      url,
      content,
      metaData = {},
      seoAttributes = {},
      domStructure = {},
      performanceMetrics = {},
      schemaMarkup = []
    } = crawlerData;

    // Calculate quality score
    const qualityScore = this.calculateQualityScore(crawlerData);

    // Store training data
    const result = await this.db.query(`
      SELECT add_crawler_training_data(
        $1, $2, $3, $4, $5, $6, $7
      ) as id
    `, [
      url,
      clientId,
      JSON.stringify(seoAttributes),
      content,
      JSON.stringify(metaData),
      JSON.stringify(domStructure),
      qualityScore
    ]);

    const dataId = result.rows[0].id;

    // Update with additional fields
    await this.db.query(`
      UPDATE crawler_training_data
      SET 
        performance_metrics = $1,
        schema_markup = $2,
        target_model_types = $3,
        status = 'ready'
      WHERE id = $4
    `, [
      JSON.stringify(performanceMetrics),
      JSON.stringify(schemaMarkup),
      JSON.stringify(targetModelTypes),
      dataId
    ]);

    this.emit('data:collected', { id: dataId, url, qualityScore });

    return {
      id: dataId,
      qualityScore,
      status: 'ready'
    };
  }

  /**
   * Calculate quality score for training data
   */
  calculateQualityScore(data) {
    let score = 0;
    let factors = 0;

    // Content completeness
    if (data.content && data.content.length > 100) {
      score += Math.min(100, data.content.length / 50);
      factors++;
    }

    // SEO attributes completeness
    const seoAttrCount = Object.keys(data.seoAttributes || {}).length;
    score += Math.min(100, seoAttrCount * 2);
    factors++;

    // Meta data presence
    if (data.metaData) {
      const metaScore = (
        (data.metaData.title ? 20 : 0) +
        (data.metaData.description ? 20 : 0) +
        (data.metaData.keywords ? 10 : 0) +
        (data.metaData.canonical ? 10 : 0)
      );
      score += metaScore;
      factors++;
    }

    // DOM structure analysis
    if (data.domStructure && Object.keys(data.domStructure).length > 0) {
      score += 50;
      factors++;
    }

    // Performance metrics
    if (data.performanceMetrics && Object.keys(data.performanceMetrics).length > 0) {
      score += 50;
      factors++;
    }

    // Schema markup
    if (data.schemaMarkup && data.schemaMarkup.length > 0) {
      score += 50;
      factors++;
    }

    return factors > 0 ? Math.min(100, score / factors) : 0;
  }

  /**
   * Start a training run
   */
  async startTrainingRun(pipelineId, options = {}) {
    if (!this.db) {
      throw new Error('Database connection required for training');
    }

    // Get pipeline
    const pipelineResult = await this.db.query(`
      SELECT * FROM v_training_pipeline_status WHERE id = $1
    `, [pipelineId]);

    if (pipelineResult.rows.length === 0) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    const pipeline = pipelineResult.rows[0];

    // Check available training data
    if (pipeline.available_training_data < this.config.minTrainingDataPoints) {
      throw new Error(
        `Insufficient training data: ${pipeline.available_training_data} < ${this.config.minTrainingDataPoints}`
      );
    }

    // Get pretrained model
    const pretrainedModel = this.modelsRegistry.getModel(pipeline.pretrained_model_id);

    console.log(`🎓 Starting training run for pipeline: ${pipeline.name}`);
    console.log(`   - Pretrained model: ${pipeline.pretrained_model_name || 'Custom'}`);
    console.log(`   - Available data: ${pipeline.available_training_data} samples`);

    // Create training run
    const runResult = await this.db.query(`
      SELECT start_training_run($1, $2, $3) as run_id
    `, [
      pipelineId,
      pipeline.neural_network_id,
      pipeline.pretrained_model_id
    ]);

    const runId = runResult.rows[0].run_id;

    // Load training data
    const trainingData = await this.loadTrainingData(
      pipeline.client_id,
      pipeline.neural_network_id,
      pipeline.training_config
    );

    // Create neural network trainer
    const trainer = new NeuralNetworkSEOTrainer({
      usePretrainedModel: !!pretrainedModel,
      pretrainedModelId: pretrainedModel?.id,
      enableTransferLearning: this.config.enableTransferLearning,
      ...pipeline.training_config
    });

    await trainer.initialize();

    // Track training session
    this.trainingSessions.set(runId, {
      id: runId,
      pipelineId,
      trainer,
      startTime: Date.now(),
      status: 'training'
    });

    // Start training (async)
    this.executeTraining(runId, trainer, trainingData, pipeline.training_config)
      .catch(error => {
        console.error(`Training run ${runId} failed:`, error);
        this.handleTrainingError(runId, error);
      });

    this.emit('training:started', { runId, pipelineId });
    this.stats.totalTrainingRuns++;

    return {
      runId,
      pipelineId,
      status: 'training',
      trainingSamples: trainingData.length
    };
  }

  /**
   * Execute training process
   */
  async executeTraining(runId, trainer, trainingData, config) {
    const startTime = Date.now();

    try {
      // Update status to training
      await this.db.query(`
        UPDATE neural_network_training_runs
        SET status = 'training', updated_at = NOW()
        WHERE id = $1
      `, [runId]);

      // Train the model
      const history = await trainer.train(trainingData, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            // Update progress in database
            await this.updateTrainingProgress(runId, epoch, logs);
            this.emit('training:progress', { runId, epoch, logs });
          }
        }
      });

      const duration = Date.now() - startTime;

      // Get final metrics
      const finalMetrics = {
        epochs_completed: history.epoch.length,
        loss: history.history.loss[history.history.loss.length - 1],
        accuracy: history.history.acc ? history.history.acc[history.history.acc.length - 1] : null,
        val_loss: history.history.val_loss ? history.history.val_loss[history.history.val_loss.length - 1] : null,
        val_accuracy: history.history.val_acc ? history.history.val_acc[history.history.val_acc.length - 1] : null
      };

      // Complete training run
      await this.db.query(`
        SELECT complete_training_run($1, $2, $3)
      `, [
        runId,
        JSON.stringify(finalMetrics),
        JSON.stringify(history.history)
      ]);

      // Update session
      const session = this.trainingSessions.get(runId);
      if (session) {
        session.status = 'completed';
        session.endTime = Date.now();
        session.metrics = finalMetrics;
      }

      // Update stats
      this.stats.successfulTrainingRuns++;
      this.stats.averageTrainingTime = (
        (this.stats.averageTrainingTime * (this.stats.successfulTrainingRuns - 1) + duration) /
        this.stats.successfulTrainingRuns
      );

      this.emit('training:completed', { runId, metrics: finalMetrics, duration });

      console.log(`✅ Training run ${runId} completed:`);
      console.log(`   - Duration: ${(duration / 1000).toFixed(1)}s`);
      console.log(`   - Final accuracy: ${(finalMetrics.accuracy * 100).toFixed(2)}%`);

      return finalMetrics;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Update training progress in database
   */
  async updateTrainingProgress(runId, epoch, logs) {
    await this.db.query(`
      UPDATE neural_network_training_runs
      SET 
        epochs_completed = $1,
        training_history = jsonb_set(
          training_history,
          '{loss}',
          (training_history->'loss') || to_jsonb($2::numeric)
        ),
        updated_at = NOW()
      WHERE id = $3
    `, [epoch + 1, logs.loss, runId]);
  }

  /**
   * Handle training error
   */
  async handleTrainingError(runId, error) {
    await this.db.query(`
      UPDATE neural_network_training_runs
      SET 
        status = 'failed',
        error_message = $1,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
    `, [error.message, runId]);

    const session = this.trainingSessions.get(runId);
    if (session) {
      session.status = 'failed';
      session.error = error.message;
    }

    this.emit('training:failed', { runId, error: error.message });
  }

  /**
   * Load training data from database
   */
  async loadTrainingData(clientId, modelType, config = {}) {
    const result = await this.db.query(`
      SELECT * FROM get_training_data_for_model($1, $2, $3, $4)
    `, [
      clientId,
      modelType,
      config.maxDataPoints || 10000,
      config.minQuality || this.config.qualityThreshold
    ]);

    // Transform data for training
    return result.rows.map(row => ({
      attributes: row.seo_attributes,
      labels: row.labels,
      optimizations: this.extractOptimizations(row.labels),
      results: this.extractResults(row.labels)
    }));
  }

  /**
   * Extract optimizations from labels
   */
  extractOptimizations(labels) {
    if (!labels || typeof labels !== 'object') return [];
    
    return Object.entries(labels).map(([key, value], index) => ({
      id: key,
      name: key,
      value: value
    }));
  }

  /**
   * Extract results from labels
   */
  extractResults(labels) {
    if (!labels || typeof labels !== 'object') return {};
    
    const results = {};
    Object.entries(labels).forEach(([key, value]) => {
      results[key] = { success: value === true || value === 1 };
    });
    return results;
  }

  /**
   * Make inference with pretrained model
   */
  async predict(neuralNetworkId, input, options = {}) {
    const session = Array.from(this.trainingSessions.values())
      .find(s => s.pipelineId && s.status === 'completed');

    if (!session || !session.trainer) {
      throw new Error('No trained model available for inference');
    }

    const startTime = Date.now();
    const prediction = await session.trainer.predict(input);
    const inferenceTime = Date.now() - startTime;

    // Log inference
    if (this.db) {
      await this.db.query(`
        SELECT log_model_inference($1, $2, $3, $4, $5, $6)
      `, [
        neuralNetworkId,
        JSON.stringify(input),
        JSON.stringify(prediction),
        prediction.confidence || 0.5,
        inferenceTime,
        options.clientId
      ]);
    }

    this.stats.totalInferences++;
    this.emit('inference:completed', { neuralNetworkId, inferenceTime });

    return prediction;
  }

  /**
   * Get training statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      registryStats: this.modelsRegistry.getStatistics(),
      activePipelines: this.activePipelines.size,
      activeTrainingSessions: Array.from(this.trainingSessions.values())
        .filter(s => s.status === 'training').length
    };
  }

  /**
   * Get training run status
   */
  async getTrainingRunStatus(runId) {
    const session = this.trainingSessions.get(runId);
    
    if (this.db) {
      const result = await this.db.query(`
        SELECT * FROM v_recent_training_runs WHERE id = $1
      `, [runId]);
      
      if (result.rows.length > 0) {
        return {
          ...result.rows[0],
          inMemoryStatus: session?.status
        };
      }
    }
    
    return session || null;
  }

  /**
   * Get training data quality summary
   */
  async getTrainingDataQuality(clientId) {
    if (!this.db) {
      return null;
    }

    const result = await this.db.query(`
      SELECT * FROM v_training_data_quality
      WHERE client_id = $1
    `, [clientId]);

    return result.rows[0] || null;
  }

  /**
   * Clean up resources
   */
  async dispose() {
    console.log('🧹 Cleaning up Pretrained Model Training Service...');
    
    // Stop any active training sessions
    for (const [runId, session] of this.trainingSessions) {
      if (session.status === 'training') {
        console.log(`   Stopping training run: ${runId}`);
        // In a real implementation, we would stop the TensorFlow training
      }
    }
    
    this.trainingSessions.clear();
    this.activePipelines.clear();
    this.loadedModels.clear();
    
    this.emit('disposed');
    console.log('✅ Cleanup complete');
  }
}

export default PretrainedModelTrainingService;
export { PretrainedModelTrainingService };
