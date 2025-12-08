/**
 * Enhanced Model Library Integration Service
 * 
 * Extends the base model-library-integration-service with:
 * - Integration with SEOPreTrainedModelsRegistry
 * - Enhanced search with SEO-specific filtering
 * - Automatic model setup for crawler integration
 * - Production-ready deployment helpers
 */

import { SEOPreTrainedModelsRegistry } from './seo-pretrained-models-registry.js';
import { EventEmitter } from 'events';

class EnhancedModelLibraryService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.db = options.db;
    this.seoRegistry = new SEOPreTrainedModelsRegistry(options);
    
    // Configuration
    this.config = {
      autoSetupModels: options.autoSetupModels !== false,
      prioritizeFastModels: options.prioritizeFastModels !== false,
      enableTransferLearning: options.enableTransferLearning !== false,
      ...options.config
    };

    this.initialized = false;
  }

  /**
   * Initialize the enhanced service
   */
  async initialize() {
    if (this.initialized) return;

    console.log('🚀 Initializing Enhanced Model Library Service...');

    try {
      // Initialize base components
      if (this.db) {
        await this.initializeDatabaseTables();
      }

      // Auto-setup recommended models if enabled
      if (this.config.autoSetupModels) {
        await this.setupRecommendedModels();
      }

      this.initialized = true;
      this.emit('initialized');

      console.log('✅ Enhanced Model Library Service initialized');
      this.logServiceInfo();

    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Model Library Service:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables for model tracking
   */
  async initializeDatabaseTables() {
    if (!this.db) return;

    const tables = [
      // Track deployed models
      `CREATE TABLE IF NOT EXISTS deployed_models (
        id SERIAL PRIMARY KEY,
        model_id TEXT NOT NULL,
        model_name TEXT NOT NULL,
        source TEXT NOT NULL,
        task TEXT NOT NULL,
        seo_use_case TEXT,
        deployed_at TIMESTAMPTZ DEFAULT NOW(),
        last_used TIMESTAMPTZ,
        usage_count INTEGER DEFAULT 0,
        performance_metrics JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        UNIQUE(model_id)
      )`,

      // Track model inferences
      `CREATE TABLE IF NOT EXISTS model_inferences (
        id SERIAL PRIMARY KEY,
        model_id TEXT NOT NULL,
        url TEXT NOT NULL,
        inference_time_ms INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        result JSONB,
        error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Track transfer learning jobs
      `CREATE TABLE IF NOT EXISTS transfer_learning_jobs (
        id SERIAL PRIMARY KEY,
        base_model_id TEXT NOT NULL,
        job_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        config JSONB NOT NULL,
        training_samples INTEGER,
        epochs_completed INTEGER DEFAULT 0,
        final_accuracy NUMERIC,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    ];

    for (const sql of tables) {
      try {
        await this.db.query(sql);
      } catch (error) {
        console.error('Failed to create table:', error.message);
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_model_inferences_model_id ON model_inferences(model_id)',
      'CREATE INDEX IF NOT EXISTS idx_model_inferences_url ON model_inferences(url)',
      'CREATE INDEX IF NOT EXISTS idx_model_inferences_created_at ON model_inferences(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transfer_learning_jobs_status ON transfer_learning_jobs(status)'
    ];

    for (const sql of indexes) {
      try {
        await this.db.query(sql);
      } catch (error) {
        console.error('Failed to create index:', error.message);
      }
    }
  }

  /**
   * Setup recommended models for crawler
   */
  async setupRecommendedModels() {
    console.log('📦 Setting up recommended models for crawler...');

    const pipeline = this.seoRegistry.getCrawlerPipeline();
    const modelsToSetup = [
      ...pipeline.realtime,
      ...pipeline.batch.slice(0, 2) // Setup first 2 batch models
    ];

    for (const modelId of modelsToSetup) {
      const model = this.seoRegistry.getModel(modelId);
      if (model) {
        await this.registerModel(model);
      }
    }

    console.log(`✅ Setup ${modelsToSetup.length} recommended models`);
  }

  /**
   * Register a model in the database
   */
  async registerModel(model) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO deployed_models (
          model_id, model_name, source, task, seo_use_case
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (model_id) DO UPDATE
        SET last_used = NOW()`,
        [model.id, model.name, model.source, model.task, model.seoUseCase]
      );

      this.emit('model_registered', { modelId: model.id, name: model.name });
    } catch (error) {
      console.error(`Failed to register model ${model.id}:`, error.message);
    }
  }

  /**
   * Search models with SEO-specific filtering
   */
  async searchModelsForSEO(options = {}) {
    const {
      useCase,
      performance = null,
      minAccuracy = 0.85,
      maxSizeMB = 1000,
      limit = 10
    } = options;

    let models = this.seoRegistry.listAllModels();

    // Filter by use case
    if (useCase) {
      models = models.filter(m => 
        m.seoUseCase === useCase || 
        m.seoApplications.some(app => app.toLowerCase().includes(useCase.toLowerCase()))
      );
    }

    // Filter by performance
    if (performance) {
      models = models.filter(m => m.performance === performance);
    }

    // Filter by accuracy
    models = models.filter(m => m.accuracy >= minAccuracy);

    // Filter by size
    models = models.filter(m => m.size_mb <= maxSizeMB);

    // Sort by relevance (accuracy * performance factor)
    const perfFactor = { 'very-fast': 1.2, 'fast': 1.1, 'medium': 1.0, 'slow': 0.9 };
    models.sort((a, b) => {
      const aScore = a.accuracy * (perfFactor[a.performance] || 1.0);
      const bScore = b.accuracy * (perfFactor[b.performance] || 1.0);
      return bScore - aScore;
    });

    return models.slice(0, limit);
  }

  /**
   * Get optimal model for specific SEO task
   */
  getOptimalModelForTask(task, requireFast = false) {
    const models = this.seoRegistry.listAllModels().filter(m => {
      const matchesTask = m.task === task || m.seoUseCase === task;
      const isFastEnough = !requireFast || 
        m.performance === 'very-fast' || 
        m.performance === 'fast';
      return matchesTask && isFastEnough;
    });

    // Return highest accuracy model
    return models.sort((a, b) => b.accuracy - a.accuracy)[0] || null;
  }

  /**
   * Create deployment configuration for crawler
   */
  async createCrawlerDeployment(options = {}) {
    const {
      enableRealtime = true,
      enableBatch = true,
      enableDetailed = false,
      customModels = []
    } = options;

    const pipeline = this.seoRegistry.getCrawlerPipeline();
    const deployment = {
      realtime: [],
      batch: [],
      detailed: [],
      custom: customModels
    };

    if (enableRealtime) {
      deployment.realtime = pipeline.realtime.map(id => {
        const model = this.seoRegistry.getModel(id);
        return {
          modelId: id,
          name: model.name,
          task: model.task,
          expectedLatency: this.estimateLatency(model),
          priority: 'high'
        };
      });
    }

    if (enableBatch) {
      deployment.batch = pipeline.batch.map(id => {
        const model = this.seoRegistry.getModel(id);
        return {
          modelId: id,
          name: model.name,
          task: model.task,
          expectedLatency: this.estimateLatency(model),
          priority: 'medium'
        };
      });
    }

    if (enableDetailed) {
      deployment.detailed = pipeline.detailed.map(id => {
        const model = this.seoRegistry.getModel(id);
        return {
          modelId: id,
          name: model.name,
          task: model.task,
          expectedLatency: this.estimateLatency(model),
          priority: 'low'
        };
      });
    }

    // Save deployment config to database
    if (this.db) {
      try {
        await this.db.query(
          `INSERT INTO deployment_configs (config, created_at) VALUES ($1, NOW())`,
          [JSON.stringify(deployment)]
        );
      } catch (error) {
        // Table might not exist, that's okay
      }
    }

    return deployment;
  }

  /**
   * Estimate inference latency for a model
   */
  estimateLatency(model) {
    const baseLatency = {
      'very-fast': 50,
      'fast': 100,
      'medium': 250,
      'slow': 500
    };

    const base = baseLatency[model.performance] || 250;
    const sizeFactor = Math.log(model.size_mb + 1) / 10;

    return Math.round(base * (1 + sizeFactor));
  }

  /**
   * Record model inference for tracking
   */
  async recordInference(modelId, url, inferenceTimeMs, success, result = null, error = null) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO model_inferences (
          model_id, url, inference_time_ms, success, result, error
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [modelId, url, inferenceTimeMs, success, result, error]
      );

      // Update deployed model stats
      await this.db.query(
        `UPDATE deployed_models 
         SET usage_count = usage_count + 1, last_used = NOW()
         WHERE model_id = $1`,
        [modelId]
      );

      this.emit('inference_recorded', { modelId, url, success });
    } catch (error) {
      console.error('Failed to record inference:', error.message);
    }
  }

  /**
   * Get model performance statistics
   */
  async getModelStats(modelId, days = 7) {
    if (!this.db) return null;

    try {
      const result = await this.db.query(
        `SELECT 
          COUNT(*) as total_inferences,
          AVG(inference_time_ms) as avg_latency,
          SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
         FROM model_inferences
         WHERE model_id = $1 
         AND created_at > NOW() - INTERVAL '${days} days'`,
        [modelId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get model stats:', error.message);
      return null;
    }
  }

  /**
   * Create transfer learning job
   */
  async createTransferLearningJob(baseModelId, jobName, config) {
    if (!this.db) {
      throw new Error('Database connection required for transfer learning jobs');
    }

    const model = this.seoRegistry.getModel(baseModelId);
    if (!model) {
      throw new Error(`Model not found: ${baseModelId}`);
    }

    const transferConfig = model.transferLearningConfig;
    if (!transferConfig) {
      throw new Error(`Model ${baseModelId} does not support transfer learning`);
    }

    try {
      const result = await this.db.query(
        `INSERT INTO transfer_learning_jobs (
          base_model_id, job_name, status, config
        ) VALUES ($1, $2, 'pending', $3)
        RETURNING id`,
        [baseModelId, jobName, JSON.stringify({ ...transferConfig, ...config })]
      );

      const jobId = result.rows[0].id;

      this.emit('transfer_learning_job_created', { 
        jobId, 
        baseModelId, 
        jobName 
      });

      return jobId;
    } catch (error) {
      console.error('Failed to create transfer learning job:', error.message);
      throw error;
    }
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    const stats = this.seoRegistry.getStatistics();
    
    return {
      status: 'initialized',
      totalModels: stats.total,
      modelsBySource: stats.bySource,
      modelsByPerformance: stats.byPerformance,
      averageAccuracy: `${(stats.averageAccuracy * 100).toFixed(2)}%`,
      configuration: this.config,
      capabilities: {
        seoOptimization: true,
        transferLearning: this.config.enableTransferLearning,
        realtimeCrawling: true,
        batchProcessing: true
      }
    };
  }

  /**
   * Log service information
   */
  logServiceInfo() {
    const info = this.getServiceInfo();
    
    console.log('\n📊 Service Information:');
    console.log(`   Total Models: ${info.totalModels}`);
    console.log(`   Average Accuracy: ${info.averageAccuracy}`);
    console.log(`   Transfer Learning: ${info.capabilities.transferLearning ? 'Enabled' : 'Disabled'}`);
    console.log(`   Auto Setup: ${this.config.autoSetupModels ? 'Enabled' : 'Disabled'}\n`);
  }

  /**
   * Get SEO registry
   */
  getSEORegistry() {
    return this.seoRegistry;
  }
}

export default EnhancedModelLibraryService;
export { EnhancedModelLibraryService };
