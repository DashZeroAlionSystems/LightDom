/**
 * Neural Network Crawler Orchestrator
 * 
 * Comprehensive service that orchestrates:
 * - TensorFlow neural network training and inference
 * - Intelligent web crawling with ML-based decision making
 * - Data stream management for 192 SEO attributes
 * - Continuous learning and optimization
 * - Service bundling and API exposure
 */

import EventEmitter from 'events';
import { Pool } from 'pg';

class NeuralCrawlerOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // TensorFlow Configuration
      enableTensorFlow: config.enableTensorFlow !== false,
      enableBrainJS: config.enableBrainJS || false, // Fallback for browser
      modelArchitecture: config.modelArchitecture || 'sequential',
      
      // Crawler Configuration
      maxConcurrency: config.maxConcurrency || 10,
      intelligentPrioritization: config.intelligentPrioritization !== false,
      adaptiveDepth: config.adaptiveDepth !== false,
      
      // Data Stream Configuration
      attributeCount: config.attributeCount || 192,
      streamBufferSize: config.streamBufferSize || 1000,
      realTimeUpdates: config.realTimeUpdates !== false,
      
      // Training Configuration
      continuousLearning: config.continuousLearning !== false,
      trainingBatchSize: config.trainingBatchSize || 32,
      retrainingThreshold: config.retrainingThreshold || 1000, // New samples before retraining
      
      // Monitoring Configuration
      enableMonitoring: config.enableMonitoring !== false,
      metricsUpdateInterval: config.metricsUpdateInterval || 5000,
      
      ...config
    };

    // State management
    this.isRunning = false;
    this.tensorFlowBackend = null;
    this.brainNetwork = null;
    this.activeModels = new Map();
    this.crawlerInstances = new Map();
    this.dataStreams = new Map();
    this.trainingQueue = [];
    
    // Performance metrics
    this.metrics = {
      totalCrawls: 0,
      successfulCrawls: 0,
      failedCrawls: 0,
      totalTraining: 0,
      modelAccuracy: 0,
      averageCrawlTime: 0,
      attributesMined: 0,
      dataStreamsThroughput: 0,
      activeCrawlers: 0,
      queuedUrls: 0
    };

    // Database connection
    this.db = config.db || new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20
    });
  }

  /**
   * Initialize the orchestrator and all sub-systems
   */
  async initialize() {
    console.log('🚀 Initializing Neural Crawler Orchestrator...');
    
    try {
      // Initialize TensorFlow backend
      if (this.config.enableTensorFlow) {
        await this.initializeTensorFlow();
      } else if (this.config.enableBrainJS) {
        await this.initializeBrainJS();
      }

      // Initialize database tables
      await this.initializeDatabase();

      // Initialize data streams
      await this.initializeDataStreams();

      // Initialize monitoring
      if (this.config.enableMonitoring) {
        this.startMonitoring();
      }

      this.isRunning = true;
      console.log('✅ Neural Crawler Orchestrator initialized successfully');
      
      this.emit('initialized');
      
      return {
        success: true,
        backend: this.tensorFlowBackend ? 'tensorflow' : 'brainjs',
        config: this.config
      };
    } catch (error) {
      console.error('❌ Failed to initialize Neural Crawler Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Initialize TensorFlow backend (Node.js or browser)
   */
  async initializeTensorFlow() {
    console.log('🧠 Initializing TensorFlow backend...');
    
    try {
      // Try to load tfjs-node first (better performance for server)
      try {
        const tf = await import('@tensorflow/tfjs-node');
        this.tensorFlowBackend = tf;
        console.log('✅ TensorFlow.js-node loaded successfully');
      } catch (nodeError) {
        // Fallback to browser version
        console.log('⚠️ tfjs-node not available, falling back to browser version');
        const tf = await import('@tensorflow/tfjs');
        this.tensorFlowBackend = tf;
        console.log('✅ TensorFlow.js (browser) loaded successfully');
      }

      // Set backend
      const backend = await this.tensorFlowBackend.getBackend();
      console.log(`   Backend: ${backend}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize TensorFlow:', error);
      if (this.config.enableBrainJS) {
        console.log('⚠️ Falling back to Brain.js');
        await this.initializeBrainJS();
      } else {
        throw error;
      }
    }
  }

  /**
   * Initialize Brain.js as lightweight alternative
   */
  async initializeBrainJS() {
    console.log('🧠 Initializing Brain.js backend...');
    
    try {
      const brain = await import('brain.js');
      this.brainNetwork = new brain.NeuralNetwork({
        hiddenLayers: [256, 128, 64],
        activation: 'sigmoid',
        learningRate: 0.001
      });
      
      console.log('✅ Brain.js initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Brain.js:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables for neural crawler system
   */
  async initializeDatabase() {
    console.log('💾 Initializing database tables...');
    
    const migrations = [
      // Neural network instances table
      `CREATE TABLE IF NOT EXISTS neural_crawler_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_name VARCHAR(255) NOT NULL,
        model_type VARCHAR(50) NOT NULL,
        model_config JSONB NOT NULL,
        training_samples INTEGER DEFAULT 0,
        accuracy FLOAT,
        last_trained_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'initialized',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Crawler sessions table
      `CREATE TABLE IF NOT EXISTS neural_crawler_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        neural_instance_id UUID REFERENCES neural_crawler_instances(id),
        session_name VARCHAR(255) NOT NULL,
        start_url TEXT NOT NULL,
        max_depth INTEGER DEFAULT 3,
        max_pages INTEGER DEFAULT 1000,
        status VARCHAR(50) DEFAULT 'pending',
        pages_crawled INTEGER DEFAULT 0,
        pages_queued INTEGER DEFAULT 0,
        attributes_mined INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Data streams table
      `CREATE TABLE IF NOT EXISTS neural_crawler_data_streams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stream_name VARCHAR(255) NOT NULL UNIQUE,
        stream_type VARCHAR(50) NOT NULL,
        attributes JSONB NOT NULL,
        configuration JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        messages_processed BIGINT DEFAULT 0,
        last_message_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Mined attributes table (optimized for 192 attributes)
      `CREATE TABLE IF NOT EXISTS neural_crawler_mined_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES neural_crawler_sessions(id),
        url TEXT NOT NULL,
        attributes JSONB NOT NULL,
        seo_score FLOAT,
        ml_confidence FLOAT,
        crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        INDEX idx_session (session_id),
        INDEX idx_url (url),
        INDEX idx_crawled_at (crawled_at)
      )`,
      
      // Training data table
      `CREATE TABLE IF NOT EXISTS neural_crawler_training_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        neural_instance_id UUID REFERENCES neural_crawler_instances(id),
        data_type VARCHAR(50) NOT NULL,
        input_features JSONB NOT NULL,
        target_labels JSONB NOT NULL,
        metadata JSONB,
        used_for_training BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Monitoring metrics table
      `CREATE TABLE IF NOT EXISTS neural_crawler_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_type VARCHAR(100) NOT NULL,
        metric_value FLOAT NOT NULL,
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_metric_type (metric_type),
        INDEX idx_recorded_at (recorded_at)
      )`
    ];

    for (const migration of migrations) {
      try {
        await this.db.query(migration);
      } catch (error) {
        // Ignore table already exists errors
        if (!error.message.includes('already exists')) {
          console.error('Migration error:', error);
        }
      }
    }

    console.log('✅ Database tables initialized');
  }

  /**
   * Initialize data streams for 192 attributes
   */
  async initializeDataStreams() {
    console.log('📊 Initializing data streams for attributes...');
    
    // Load attribute configuration
    const attributeConfig = await this.loadAttributeConfig();
    
    // Create data streams by category
    const categories = this.groupAttributesByCategory(attributeConfig);
    
    for (const [category, attributes] of Object.entries(categories)) {
      const streamName = `seo-${category}-stream`;
      const stream = await this.createDataStream({
        name: streamName,
        type: 'attribute-stream',
        attributes: attributes,
        bufferSize: this.config.streamBufferSize,
        realTime: this.config.realTimeUpdates
      });
      
      this.dataStreams.set(streamName, stream);
      console.log(`   ✓ Created stream: ${streamName} (${attributes.length} attributes)`);
    }

    console.log('✅ Data streams initialized');
  }

  /**
   * Load attribute configuration from database or config file
   */
  async loadAttributeConfig() {
    try {
      // Try to load from database first
      const result = await this.db.query(
        'SELECT * FROM attribute_configurations WHERE active = true'
      );
      
      if (result.rows.length > 0) {
        return result.rows.reduce((acc, row) => {
          acc[row.attribute_name] = row.config;
          return acc;
        }, {});
      }
    } catch (error) {
      console.log('⚠️ Could not load from database, using config file');
    }

    // Fallback to config file
    try {
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'config', 'seo-attributes.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return configData.attributes || {};
    } catch (error) {
      console.error('❌ Failed to load attribute config:', error);
      return {};
    }
  }

  /**
   * Group attributes by category for data streaming
   */
  groupAttributesByCategory(attributeConfig) {
    const categories = {};
    
    for (const [name, config] of Object.entries(attributeConfig)) {
      const category = config.category || 'uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ name, ...config });
    }
    
    return categories;
  }

  /**
   * Create a data stream
   */
  async createDataStream(config) {
    const stream = {
      id: crypto.randomUUID(),
      name: config.name,
      type: config.type,
      attributes: config.attributes,
      buffer: [],
      bufferSize: config.bufferSize || 1000,
      realTime: config.realTime || false,
      status: 'active',
      metrics: {
        messagesProcessed: 0,
        lastMessageAt: null,
        throughput: 0
      }
    };

    // Save to database
    try {
      await this.db.query(
        `INSERT INTO neural_crawler_data_streams 
         (stream_name, stream_type, attributes, configuration, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (stream_name) DO UPDATE SET
         attributes = $3, configuration = $4, updated_at = CURRENT_TIMESTAMP`,
        [
          stream.name,
          stream.type,
          JSON.stringify(stream.attributes),
          JSON.stringify(config),
          stream.status
        ]
      );
    } catch (error) {
      console.error('Failed to save stream to database:', error);
    }

    return stream;
  }

  /**
   * Create a new neural network instance
   */
  async createNeuralInstance(config) {
    console.log(`🧠 Creating neural network instance: ${config.name}`);
    
    const instance = {
      id: crypto.randomUUID(),
      name: config.name,
      modelType: config.modelType || 'sequential',
      model: null,
      trainingData: [],
      metrics: {
        accuracy: 0,
        loss: 0,
        trainingSamples: 0,
        lastTrained: null
      }
    };

    // Build the model
    if (this.tensorFlowBackend) {
      instance.model = await this.buildTensorFlowModel(config);
    } else if (this.brainNetwork) {
      instance.model = this.brainNetwork;
    }

    // Save to database
    await this.db.query(
      `INSERT INTO neural_crawler_instances 
       (instance_name, model_type, model_config, status)
       VALUES ($1, $2, $3, $4)`,
      [instance.name, instance.modelType, JSON.stringify(config), 'ready']
    );

    this.activeModels.set(instance.id, instance);
    
    console.log(`✅ Neural instance created: ${instance.name}`);
    
    return instance;
  }

  /**
   * Build TensorFlow model
   */
  async buildTensorFlowModel(config) {
    const tf = this.tensorFlowBackend;
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      inputShape: [config.inputDimensions || 192],
      units: config.hiddenLayers?.[0] || 256,
      activation: 'relu',
      kernelInitializer: 'glorotUniform'
    }));

    // Dropout
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Hidden layers
    const hiddenLayers = config.hiddenLayers || [256, 128, 64];
    for (let i = 1; i < hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: hiddenLayers[i],
        activation: 'relu'
      }));
      model.add(tf.layers.batchNormalization());
      model.add(tf.layers.dropout({ rate: 0.2 }));
    }

    // Output layer
    model.add(tf.layers.dense({
      units: config.outputDimensions || 50,
      activation: 'sigmoid'
    }));

    // Compile
    model.compile({
      optimizer: tf.train.adam(config.learningRate || 0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  /**
   * Start a crawler session with neural network guidance
   */
  async startCrawlerSession(config) {
    console.log(`🕷️ Starting neural crawler session: ${config.name}`);
    
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      name: config.name,
      startUrl: config.startUrl,
      neuralInstance: config.neuralInstanceId ? 
        this.activeModels.get(config.neuralInstanceId) : null,
      maxDepth: config.maxDepth || 3,
      maxPages: config.maxPages || 1000,
      status: 'running',
      stats: {
        pagesCrawled: 0,
        pagesQueued: 1,
        attributesMined: 0,
        startTime: Date.now()
      }
    };

    // Save to database
    await this.db.query(
      `INSERT INTO neural_crawler_sessions 
       (session_name, start_url, max_depth, max_pages, status, started_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [session.name, session.startUrl, session.maxDepth, session.maxPages, 'running']
    );

    this.crawlerInstances.set(sessionId, session);
    
    // Start crawling
    this.executeCrawlerSession(session);
    
    return session;
  }

  /**
   * Execute crawler session with neural guidance
   */
  async executeCrawlerSession(session) {
    // This would integrate with the existing RealWebCrawlerSystem
    // For now, emit events for monitoring
    this.emit('sessionStarted', session);
    
    // TODO: Integrate with RealWebCrawlerSystem
    // TODO: Use neural network for URL prioritization
    // TODO: Stream attributes to data streams in real-time
  }

  /**
   * Train neural network on collected data
   */
  async trainNeuralNetwork(instanceId, trainingData) {
    console.log(`🏋️ Training neural network: ${instanceId}`);
    
    const instance = this.activeModels.get(instanceId);
    if (!instance) {
      throw new Error(`Neural instance not found: ${instanceId}`);
    }

    if (this.tensorFlowBackend) {
      return await this.trainTensorFlowModel(instance, trainingData);
    } else if (this.brainNetwork) {
      return await this.trainBrainJSModel(instance, trainingData);
    }
  }

  /**
   * Train TensorFlow model
   */
  async trainTensorFlowModel(instance, trainingData) {
    const tf = this.tensorFlowBackend;
    
    // Prepare tensors
    const xs = tf.tensor2d(trainingData.inputs);
    const ys = tf.tensor2d(trainingData.outputs);

    // Train
    const history = await instance.model.fit(xs, ys, {
      epochs: this.config.trainingEpochs || 100,
      batchSize: this.config.trainingBatchSize,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          this.emit('trainingProgress', {
            instanceId: instance.id,
            epoch,
            logs
          });
        }
      }
    });

    // Cleanup
    xs.dispose();
    ys.dispose();

    // Update metrics
    instance.metrics.accuracy = history.history.acc[history.history.acc.length - 1];
    instance.metrics.loss = history.history.loss[history.history.loss.length - 1];
    instance.metrics.trainingSamples = trainingData.inputs.length;
    instance.metrics.lastTrained = new Date();

    // Save to database
    await this.db.query(
      `UPDATE neural_crawler_instances 
       SET accuracy = $1, training_samples = $2, last_trained_at = CURRENT_TIMESTAMP
       WHERE instance_name = $3`,
      [instance.metrics.accuracy, instance.metrics.trainingSamples, instance.name]
    );

    console.log(`✅ Training complete. Accuracy: ${instance.metrics.accuracy.toFixed(4)}`);
    
    return instance.metrics;
  }

  /**
   * Train Brain.js model
   */
  async trainBrainJSModel(instance, trainingData) {
    const trainData = trainingData.inputs.map((input, i) => ({
      input,
      output: trainingData.outputs[i]
    }));

    const stats = instance.model.train(trainData, {
      iterations: 20000,
      errorThresh: 0.005,
      log: true,
      logPeriod: 1000
    });

    instance.metrics.accuracy = 1 - stats.error;
    instance.metrics.trainingSamples = trainData.length;
    instance.metrics.lastTrained = new Date();

    console.log(`✅ Brain.js training complete. Error: ${stats.error.toFixed(4)}`);
    
    return instance.metrics;
  }

  /**
   * Start monitoring service
   */
  startMonitoring() {
    console.log('📊 Starting monitoring service...');
    
    setInterval(async () => {
      await this.updateMetrics();
      this.emit('metricsUpdated', this.metrics);
    }, this.config.metricsUpdateInterval);
  }

  /**
   * Update system metrics
   */
  async updateMetrics() {
    this.metrics.activeCrawlers = this.crawlerInstances.size;
    this.metrics.activeModels = this.activeModels.size;
    this.metrics.activeStreams = this.dataStreams.size;

    // Save to database
    try {
      const metricsToSave = [
        ['active_crawlers', this.metrics.activeCrawlers],
        ['active_models', this.metrics.activeModels],
        ['total_crawls', this.metrics.totalCrawls],
        ['model_accuracy', this.metrics.modelAccuracy]
      ];

      for (const [type, value] of metricsToSave) {
        await this.db.query(
          `INSERT INTO neural_crawler_metrics (metric_type, metric_value)
           VALUES ($1, $2)`,
          [type, value]
        );
      }
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      backend: this.tensorFlowBackend ? 'tensorflow' : 'brainjs',
      metrics: this.metrics,
      activeModels: Array.from(this.activeModels.keys()),
      activeCrawlers: Array.from(this.crawlerInstances.keys()),
      activeStreams: Array.from(this.dataStreams.keys())
    };
  }

  /**
   * Shutdown orchestrator
   */
  async shutdown() {
    console.log('🛑 Shutting down Neural Crawler Orchestrator...');
    
    this.isRunning = false;
    
    // Close database connection
    await this.db.end();
    
    console.log('✅ Shutdown complete');
  }
}

export default NeuralCrawlerOrchestrator;
