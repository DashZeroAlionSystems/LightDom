/**
 * SEO Neural Network Campaign Integration Service
 * 
 * Integrates all 192 SEO attributes with neural network training,
 * pretrained models, data mining, and seeding services into a 
 * complete automated SEO optimization campaign.
 */

import { EventEmitter } from 'events';
import { getPretrainedModelLibrary } from './pretrained-model-library.ts';
import { NeuralNetworkSEOTrainer } from './neural-network-seo-trainer.js';
import { getTensorFlowModelManager } from './tensorflow-model-manager.ts';
import { extractSEOAttributes } from './seo-attribute-extractor.js';
import { getAttributeConfigs } from './seo-config-reader.js';

export class SEONeuralCampaignService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      clientId: config.clientId || 'default-client',
      campaignName: config.campaignName || 'SEO Neural Campaign',
      usePretrainedModel: config.usePretrainedModel !== false,
      pretrainedModelId: config.pretrainedModelId || 'base-seo-optimizer-v1',
      enableTransferLearning: config.enableTransferLearning !== false,
      batchSize: config.batchSize || 32,
      epochs: config.epochs || 100,
      learningRate: config.learningRate || 0.001,
      autoTuneBatchSize: config.autoTuneBatchSize !== false,
      collectTrainingData: config.collectTrainingData !== false,
      continuousImprovement: config.continuousImprovement !== false,
      ...config
    };

    this.pretrainedLibrary = null;
    this.modelManager = null;
    this.neuralTrainer = null;
    this.attributeConfigs = null;
    
    this.stats = {
      attributesConfigured: 0,
      modelsAvailable: 0,
      trainingDataCollected: 0,
      campaignsActive: 0,
      optimizationsApplied: 0,
      avgAccuracy: 0,
    };

    this.isInitialized = false;
  }

  /**
   * Initialize the campaign service
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('Campaign service already initialized');
      return;
    }

    console.log('🚀 Initializing SEO Neural Campaign Service...');
    console.log(`   Campaign: ${this.config.campaignName}`);
    console.log(`   Client: ${this.config.clientId}`);

    // Initialize pretrained model library
    this.pretrainedLibrary = getPretrainedModelLibrary();
    
    // Check if base model exists, create if not
    const baseModelExists = this.pretrainedLibrary.getModelMetadata(
      this.config.pretrainedModelId
    );
    
    if (!baseModelExists && this.config.usePretrainedModel) {
      console.log('📦 Base pretrained model not found, creating...');
      await this.pretrainedLibrary.createBaseModel(this.config.pretrainedModelId);
    }

    // Initialize TensorFlow model manager
    this.modelManager = getTensorFlowModelManager();

    // Load attribute configurations (all 192 attributes)
    this.attributeConfigs = getAttributeConfigs();
    this.stats.attributesConfigured = Object.keys(this.attributeConfigs).length;

    // Initialize neural trainer with configuration
    this.neuralTrainer = new NeuralNetworkSEOTrainer({
      inputDimensions: 192,
      batchSize: this.config.batchSize,
      epochs: this.config.epochs,
      learningRate: this.config.learningRate,
      usePretrainedModel: this.config.usePretrainedModel,
      pretrainedModelId: this.config.pretrainedModelId,
      enableTransferLearning: this.config.enableTransferLearning,
    });

    await this.neuralTrainer.initialize();

    // Get library statistics
    const libStats = this.pretrainedLibrary.getStatistics();
    this.stats.modelsAvailable = libStats.totalModels;
    this.stats.avgAccuracy = libStats.avgAccuracy;

    this.isInitialized = true;

    console.log('✅ SEO Neural Campaign Service initialized');
    console.log(`   ✓ 192 SEO attributes configured`);
    console.log(`   ✓ ${this.stats.modelsAvailable} pretrained models available`);
    console.log(`   ✓ Neural trainer ready`);
    console.log(`   ✓ Batch size: ${this.config.batchSize}`);
    console.log(`   ✓ Using pretrained: ${this.config.usePretrainedModel}`);

    this.emit('initialized', this.stats);
  }

  /**
   * Extract and vectorize SEO attributes from HTML
   */
  async extractAndVectorizeAttributes(html, url) {
    console.log(`📊 Extracting all 192 SEO attributes from: ${url}`);

    const attributes = await extractSEOAttributes(html, url);
    
    // Validate we got all expected attributes
    const extractedCount = Object.keys(attributes).length;
    console.log(`   ✓ Extracted ${extractedCount} attributes`);

    if (extractedCount < 180) {
      console.warn(`   ⚠️  Warning: Expected ~192 attributes, got ${extractedCount}`);
    }

    // Vectorize for neural network input
    const featureVector = this.neuralTrainer.extractFeatureVector(attributes);
    
    return {
      attributes,
      featureVector,
      extractedCount
    };
  }

  /**
   * Train model with collected data
   */
  async trainWithData(trainingData, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Campaign service not initialized');
    }

    console.log(`🏋️ Starting training with ${trainingData.length} samples...`);

    // Auto-tune batch size if enabled
    if (this.config.autoTuneBatchSize) {
      const recommendedBatchSize = this.neuralTrainer.getRecommendedBatchSize(
        trainingData.length
      );
      
      if (recommendedBatchSize !== this.config.batchSize) {
        console.log(`📊 Auto-tuning batch size: ${this.config.batchSize} → ${recommendedBatchSize}`);
        this.neuralTrainer.updateBatchSize(recommendedBatchSize);
        this.config.batchSize = recommendedBatchSize;
      }
    }

    // Train model
    const history = await this.neuralTrainer.train(trainingData, options);

    // Update statistics
    this.stats.trainingDataCollected += trainingData.length;
    this.stats.avgAccuracy = history.history.acc[history.history.acc.length - 1];

    this.emit('trainingComplete', {
      samplesUsed: trainingData.length,
      finalAccuracy: this.stats.avgAccuracy,
      batchSize: this.config.batchSize
    });

    return history;
  }

  /**
   * Get SEO optimization recommendations for a page
   */
  async getOptimizationRecommendations(html, url) {
    if (!this.isInitialized) {
      throw new Error('Campaign service not initialized');
    }

    console.log(`🎯 Generating SEO recommendations for: ${url}`);

    // Extract attributes
    const { attributes, extractedCount } = await this.extractAndVectorizeAttributes(html, url);

    // Get predictions from neural network
    const recommendations = await this.neuralTrainer.predict(attributes);

    console.log(`✅ Generated ${recommendations.length} recommendations`);
    console.log(`   Based on ${extractedCount} SEO attributes`);

    return {
      url,
      attributesAnalyzed: extractedCount,
      recommendations,
      attributes: attributes // Include full attribute set for reference
    };
  }

  /**
   * Update batch size for training
   */
  setBatchSize(newBatchSize) {
    this.neuralTrainer.updateBatchSize(newBatchSize);
    this.config.batchSize = newBatchSize;
    
    this.emit('batchSizeUpdated', { batchSize: newBatchSize });
  }

  /**
   * Get current campaign statistics
   */
  getStats() {
    return {
      ...this.stats,
      config: {
        batchSize: this.config.batchSize,
        epochs: this.config.epochs,
        learningRate: this.config.learningRate,
        usePretrainedModel: this.config.usePretrainedModel,
        pretrainedModelId: this.config.pretrainedModelId,
      },
      modelSummary: this.neuralTrainer.getModelSummary()
    };
  }

  /**
   * Save current model state
   */
  async saveModel(path) {
    if (!this.neuralTrainer) {
      throw new Error('Neural trainer not initialized');
    }

    await this.neuralTrainer.saveModel(path);
    console.log(`💾 Model saved to: ${path}`);
  }

  /**
   * Create a new client-specific model
   */
  async createClientModel(clientId, config = {}) {
    console.log(`👤 Creating model for client: ${clientId}`);

    const modelConfig = {
      inputDimensions: 192,
      batchSize: config.batchSize || this.config.batchSize,
      ...config
    };

    await this.modelManager.createClientModel(clientId, modelConfig);

    console.log(`✅ Client model created: ${clientId}`);
  }

  /**
   * List all available pretrained models
   */
  listPretrainedModels(filter) {
    return this.pretrainedLibrary.listModels(filter);
  }

  /**
   * Get attribute configuration
   */
  getAttributeConfiguration() {
    return {
      totalAttributes: this.stats.attributesConfigured,
      attributeConfigs: this.attributeConfigs,
      categories: this.groupAttributesByCategory()
    };
  }

  /**
   * Group attributes by category for analysis
   */
  groupAttributesByCategory() {
    const grouped = {};
    
    Object.entries(this.attributeConfigs).forEach(([name, config]) => {
      const category = config.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({ name, ...config });
    });

    return grouped;
  }
}

export default SEONeuralCampaignService;
