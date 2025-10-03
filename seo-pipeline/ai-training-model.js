// AI Training Model for Continuous SEO Performance Enhancement
// Uses machine learning to predict SEO improvements and generate optimization recommendations

import { Pool } from 'pg';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';

class SEOTrainingModel {
  constructor(config = {}) {
    this.db = new Pool({
      host: config.dbHost || process.env.DB_HOST || 'localhost',
      port: config.dbPort || process.env.DB_PORT || 5432,
      database: config.dbName || process.env.DB_NAME || 'dom_space_harvester',
      user: config.dbUser || process.env.DB_USER || 'postgres',
      password: config.dbPassword || process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.model = null;
    this.isTraining = false;
    this.trainingData = [];
    this.modelPath = config.modelPath || './models/seo-model';
    this.batchSize = config.batchSize || 32;
    this.epochs = config.epochs || 100;
    this.validationSplit = config.validationSplit || 0.2;
    
    // Feature configuration
    this.featureConfig = {
      performance: ['lcp', 'fid', 'cls', 'loadTime'],
      content: ['titleLength', 'descriptionLength', 'headingCount', 'imageCount', 'schemaCount'],
      technical: ['domElements', 'unusedElements', 'deadCSS', 'orphanedJS', 'isHTTPS'],
      backlinks: ['totalBacklinks', 'externalBacklinks']
    };

    this.initializeModel();
  }

  /**
   * Initialize the neural network model
   */
  initializeModel() {
    try {
      // Create a sequential model for SEO score prediction
      this.model = tf.sequential({
        layers: [
          // Input layer - normalized features
          tf.layers.dense({
            inputShape: [this.getFeatureCount()],
            units: 128,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.3 }),
          
          // Hidden layers
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.2 }),
          
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.1 }),
          
          // Output layer - SEO score prediction (0-100)
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae', 'mse']
      });

      console.log('🧠 AI Training Model initialized');
      console.log('Model architecture:', this.model.summary());
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      throw error;
    }
  }

  /**
   * Get total feature count
   */
  getFeatureCount() {
    return Object.values(this.featureConfig).flat().length;
  }

  /**
   * Load training data from database
   */
  async loadTrainingData(limit = 10000) {
    try {
      console.log('📊 Loading training data from database...');
      
      const result = await this.db.query(`
        SELECT insights_data FROM seo_insights 
        WHERE insights_data IS NOT NULL
        ORDER BY analysis_timestamp DESC 
        LIMIT $1
      `, [limit]);

      this.trainingData = result.rows.map(row => row.insights_data);
      console.log(`✅ Loaded ${this.trainingData.length} training samples`);
      
      return this.trainingData;
    } catch (error) {
      console.error('Failed to load training data:', error);
      throw error;
    }
  }

  /**
   * Prepare training data for the model
   */
  prepareTrainingData() {
    if (this.trainingData.length === 0) {
      throw new Error('No training data available');
    }

    const features = [];
    const labels = [];

    for (const data of this.trainingData) {
      try {
        const featureVector = this.extractFeatures(data);
        const label = this.extractLabel(data);
        
        if (featureVector && label !== null) {
          features.push(featureVector);
          labels.push(label);
        }
      } catch (error) {
        console.warn('Failed to process training sample:', error.message);
      }
    }

    if (features.length === 0) {
      throw new Error('No valid training samples found');
    }

    console.log(`📈 Prepared ${features.length} training samples`);

    return {
      features: tf.tensor2d(features),
      labels: tf.tensor2d(labels, [labels.length, 1])
    };
  }

  /**
   * Extract features from training data
   */
  extractFeatures(data) {
    const features = [];

    // Performance features
    const perf = data.performanceFactors || {};
    features.push(
      this.normalizeValue(perf.lcp || 0, 0, 10000), // LCP in ms
      this.normalizeValue(perf.fid || 0, 0, 1000),   // FID in ms
      this.normalizeValue(perf.cls || 0, 0, 1),     // CLS score
      this.normalizeValue(perf.loadTime || 0, 0, 10000) // Load time in ms
    );

    // Content features
    const content = data.contentFactors || {};
    features.push(
      this.normalizeValue(content.titleLength || 0, 0, 100),
      this.normalizeValue(content.descriptionLength || 0, 0, 200),
      this.normalizeValue(content.headingCount || 0, 0, 20),
      this.normalizeValue(content.imageCount || 0, 0, 50),
      this.normalizeValue(content.schemaCount || 0, 0, 10)
    );

    // Technical features
    const technical = data.technicalFactors || {};
    features.push(
      this.normalizeValue(technical.domElements || 0, 0, 1000),
      this.normalizeValue(technical.unusedElements || 0, 0, 100),
      this.normalizeValue(technical.deadCSS || 0, 0, 50),
      this.normalizeValue(technical.orphanedJS || 0, 0, 20),
      technical.isHTTPS ? 1 : 0
    );

    // Backlink features
    const backlinks = data.backlinkFactors || {};
    features.push(
      this.normalizeValue(backlinks.totalBacklinks || 0, 0, 100),
      this.normalizeValue(backlinks.externalBacklinks || 0, 0, 50)
    );

    return features;
  }

  /**
   * Extract label from training data
   */
  extractLabel(data) {
    return data.seoScore !== undefined ? data.seoScore / 100 : null; // Normalize to 0-1
  }

  /**
   * Normalize value to 0-1 range
   */
  normalizeValue(value, min, max) {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Train the model
   */
  async trainModel() {
    if (this.isTraining) {
      throw new Error('Model is already training');
    }

    try {
      this.isTraining = true;
      console.log('🚀 Starting model training...');

      // Load and prepare training data
      await this.loadTrainingData();
      const { features, labels } = this.prepareTrainingData();

      // Split data for validation
      const validationSplit = Math.floor(features.shape[0] * this.validationSplit);
      const trainFeatures = features.slice([0, 0], [features.shape[0] - validationSplit, features.shape[1]]);
      const trainLabels = labels.slice([0, 0], [labels.shape[0] - validationSplit, labels.shape[1]]);
      const valFeatures = features.slice([features.shape[0] - validationSplit, 0], [validationSplit, features.shape[1]]);
      const valLabels = labels.slice([labels.shape[0] - validationSplit, 0], [validationSplit, labels.shape[1]]);

      console.log(`📊 Training samples: ${trainFeatures.shape[0]}`);
      console.log(`📊 Validation samples: ${valFeatures.shape[0]}`);

      // Train the model
      const history = await this.model.fit(trainFeatures, trainLabels, {
        epochs: this.epochs,
        batchSize: this.batchSize,
        validationData: [valFeatures, valLabels],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}`);
            }
          }
        }
      });

      // Save the trained model
      await this.saveModel();

      console.log('✅ Model training completed');
      console.log('Final training loss:', history.history.loss[history.history.loss.length - 1]);
      console.log('Final validation loss:', history.history.val_loss[history.history.val_loss.length - 1]);

      // Clean up tensors
      features.dispose();
      labels.dispose();
      trainFeatures.dispose();
      trainLabels.dispose();
      valFeatures.dispose();
      valLabels.dispose();

      return history;
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Save the trained model
   */
  async saveModel() {
    try {
      // Ensure model directory exists
      if (!fs.existsSync(this.modelPath)) {
        fs.mkdirSync(this.modelPath, { recursive: true });
      }

      // Save model
      await this.model.save(`file://${this.modelPath}`);
      
      // Save model metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        trainingSamples: this.trainingData.length,
        featureCount: this.getFeatureCount(),
        epochs: this.epochs,
        batchSize: this.batchSize,
        validationSplit: this.validationSplit,
        featureConfig: this.featureConfig
      };

      fs.writeFileSync(
        path.join(this.modelPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`💾 Model saved to ${this.modelPath}`);
    } catch (error) {
      console.error('Failed to save model:', error);
      throw error;
    }
  }

  /**
   * Load a pre-trained model
   */
  async loadModel() {
    try {
      const modelPath = `file://${this.modelPath}`;
      
      if (!fs.existsSync(this.modelPath)) {
        console.log('No pre-trained model found, will train new model');
        return false;
      }

      this.model = await tf.loadLayersModel(modelPath);
      console.log('✅ Pre-trained model loaded');
      
      // Load metadata
      const metadataPath = path.join(this.modelPath, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        console.log('Model metadata:', metadata);
      }

      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }

  /**
   * Predict SEO score for given data
   */
  async predictSEO(data) {
    if (!this.model) {
      throw new Error('Model not loaded or trained');
    }

    try {
      const features = this.extractFeatures(data);
      const featureTensor = tf.tensor2d([features]);
      
      const prediction = this.model.predict(featureTensor);
      const score = await prediction.data();
      
      featureTensor.dispose();
      prediction.dispose();
      
      return Math.round(score[0] * 100); // Convert back to 0-100 scale
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  /**
   * Generate optimization recommendations using AI
   */
  async generateAIRecommendations(data) {
    try {
      const currentScore = await this.predictSEO(data);
      const recommendations = [];

      // Test different optimization scenarios
      const scenarios = this.generateOptimizationScenarios(data);
      
      for (const scenario of scenarios) {
        const predictedScore = await this.predictSEO(scenario.data);
        const improvement = predictedScore - currentScore;
        
        if (improvement > 5) { // Only recommend if improvement > 5 points
          recommendations.push({
            ...scenario,
            predictedScore,
            improvement,
            priority: this.calculatePriority(improvement, scenario.category)
          });
        }
      }

      // Sort by improvement potential
      recommendations.sort((a, b) => b.improvement - a.improvement);

      return recommendations.slice(0, 10); // Top 10 recommendations
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate optimization scenarios for testing
   */
  generateOptimizationScenarios(data) {
    const scenarios = [];

    // Performance optimization scenarios
    scenarios.push({
      category: 'performance',
      title: 'Optimize Core Web Vitals',
      description: 'Improve LCP, FID, and CLS scores',
      data: {
        ...data,
        performanceFactors: {
          ...data.performanceFactors,
          lcp: Math.max(0, data.performanceFactors.lcp - 1000),
          fid: Math.max(0, data.performanceFactors.fid - 50),
          cls: Math.max(0, data.performanceFactors.cls - 0.1),
          loadTime: Math.max(0, data.performanceFactors.loadTime - 500)
        }
      }
    });

    // Content optimization scenarios
    scenarios.push({
      category: 'content',
      title: 'Optimize Content Structure',
      description: 'Improve title, description, and heading structure',
      data: {
        ...data,
        contentFactors: {
          ...data.contentFactors,
          titleLength: Math.max(30, Math.min(60, data.contentFactors.titleLength)),
          descriptionLength: Math.max(120, Math.min(160, data.contentFactors.descriptionLength)),
          headingCount: Math.max(1, data.contentFactors.headingCount),
          schemaCount: Math.max(1, data.contentFactors.schemaCount)
        }
      }
    });

    // Technical optimization scenarios
    scenarios.push({
      category: 'technical',
      title: 'Optimize DOM Structure',
      description: 'Remove unused elements and optimize code',
      data: {
        ...data,
        technicalFactors: {
          ...data.technicalFactors,
          unusedElements: Math.max(0, data.technicalFactors.unusedElements - 10),
          deadCSS: Math.max(0, data.technicalFactors.deadCSS - 5),
          orphanedJS: Math.max(0, data.technicalFactors.orphanedJS - 2),
          isHTTPS: true
        }
      }
    });

    // Backlink optimization scenarios
    scenarios.push({
      category: 'backlinks',
      title: 'Build Quality Backlinks',
      description: 'Acquire high-quality external links',
      data: {
        ...data,
        backlinkFactors: {
          ...data.backlinkFactors,
          totalBacklinks: data.backlinkFactors.totalBacklinks + 5,
          externalBacklinks: data.backlinkFactors.externalBacklinks + 3
        }
      }
    });

    return scenarios;
  }

  /**
   * Calculate recommendation priority
   */
  calculatePriority(improvement, category) {
    const categoryWeights = {
      performance: 1.2,
      technical: 1.1,
      content: 1.0,
      backlinks: 0.9
    };

    const weightedImprovement = improvement * (categoryWeights[category] || 1.0);
    
    if (weightedImprovement >= 20) return 'high';
    if (weightedImprovement >= 10) return 'medium';
    return 'low';
  }

  /**
   * Continuous learning from new data
   */
  async continuousLearning() {
    try {
      console.log('🔄 Starting continuous learning...');

      // Load recent data
      const recentData = await this.loadTrainingData(1000);
      
      if (recentData.length < 100) {
        console.log('Not enough recent data for continuous learning');
        return;
      }

      // Prepare data for incremental training
      const { features, labels } = this.prepareTrainingData();

      // Fine-tune the model with recent data
      const history = await this.model.fit(features, labels, {
        epochs: 10,
        batchSize: this.batchSize,
        validationSplit: 0.1,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Continuous learning epoch ${epoch}: loss=${logs.loss.toFixed(4)}`);
          }
        }
      });

      // Save updated model
      await this.saveModel();

      console.log('✅ Continuous learning completed');
      
      // Clean up
      features.dispose();
      labels.dispose();

      return history;
    } catch (error) {
      console.error('Continuous learning failed:', error);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics() {
    try {
      if (!this.model) {
        return { error: 'Model not loaded' };
      }

      // Load test data
      await this.loadTrainingData(1000);
      const { features, labels } = this.prepareTrainingData();

      // Evaluate model
      const evaluation = this.model.evaluate(features, labels);
      const loss = await evaluation.data();

      // Clean up
      features.dispose();
      labels.dispose();
      evaluation.dispose();

      return {
        loss: loss[0],
        mae: loss[1],
        mse: loss[2],
        trainingSamples: this.trainingData.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get model metrics:', error);
      throw error;
    }
  }

  /**
   * Schedule continuous learning
   */
  scheduleContinuousLearning(intervalHours = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        await this.continuousLearning();
      } catch (error) {
        console.error('Scheduled continuous learning failed:', error);
      }
    }, intervalMs);

    console.log(`⏰ Continuous learning scheduled every ${intervalHours} hours`);
  }

  /**
   * Shutdown the training model
   */
  async shutdown() {
    console.log('🛑 Shutting down AI Training Model...');
    
    if (this.model) {
      this.model.dispose();
    }
    
    await this.db.end();
    console.log('✅ AI Training Model shutdown complete');
  }
}

export { SEOTrainingModel };