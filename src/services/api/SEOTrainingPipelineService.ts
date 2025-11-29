/**
 * SEO Training Pipeline Service
 *
 * Manages continuous data mining and ML model training for SEO optimization.
 * This service:
 * - Collects training data from all client sites
 * - Extracts SEO features
 * - Trains and updates ML models
 * - Deploys improved models
 * - Manages blockchain rewards for data contributions
 */

import * as tf from '@tensorflow/tfjs';
import { createRequire } from 'module';
import { createClient } from 'redis';

const requireTF = createRequire(import.meta.url);

const TENSORFLOW_BACKEND = (() => {
  try {
    requireTF('@tensorflow/tfjs-node');
    if (typeof tf.setBackend === 'function' && typeof tf.findBackend === 'function' && tf.findBackend('tensorflow')) {
      tf.setBackend('tensorflow').catch(() => {});
    }
    console.log('SEOTrainingPipelineService: native TensorFlow backend enabled');
    return 'tensorflow';
  } catch (err) {
    console.warn('SEOTrainingPipelineService: native TensorFlow bindings unavailable, using @tensorflow/tfjs fallback');
    return 'tfjs';
  }
})();

const TF_NODE_AVAILABLE = TENSORFLOW_BACKEND === 'tensorflow';

interface TrainingDataPoint {
  url: string;
  features: number[];
  featureNames: string[];
  rankingBefore: number;
  rankingAfter: number;
  seoScoreBefore: number;
  seoScoreAfter: number;
  optimizationType: string;
  effectivenessScore: number;
}

interface ModelMetrics {
  accuracy: number;
  f1Score: number;
  mse: number;
  mae: number;
  r2Score: number;
}

interface TrainingConfig {
  modelType: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  earlyStoppingPatience: number;
}

export class SEOTrainingPipelineService {
  private pgPool: any;
  private redisClient: any;
  private currentModels: Map<string, tf.LayersModel> = new Map();
  private trainingInProgress: Set<string> = new Set();

  constructor(pgPool: any) {
    this.pgPool = pgPool;
    this.initRedis();
    this.loadCurrentModels();
  }

  private async initRedis(): Promise<void> {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redisClient.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
      });

      await this.redisClient.connect();
      console.log('SEO Training Pipeline Service: Redis connected');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  /**
   * Load currently deployed models
   */
  private async loadCurrentModels(): Promise<void> {
    try {
      const result = await this.pgPool.query(
        `SELECT model_name, model_type, model_path
         FROM seo_models
         WHERE status = 'active'`
      );

      for (const row of result.rows) {
        try {
          if (!TF_NODE_AVAILABLE) {
            console.warn(`Skipping load for ${row.model_name}: native TensorFlow bindings are required to read models from disk.`);
            continue;
          }
          const model = await tf.loadLayersModel(`file://${row.model_path}`);
          this.currentModels.set(row.model_type, model);
          console.log(`Loaded model: ${row.model_name} (${row.model_type})`);
        } catch (error) {
          console.error(`Failed to load model ${row.model_name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading current models:', error);
    }
  }

  /**
   * Collect training data from analytics
   */
  async collectTrainingData(minEffectivenessScore: number = 0.5): Promise<TrainingDataPoint[]> {
    try {
      const result = await this.pgPool.query(
        `SELECT
           t.url,
           t.features,
           t.ranking_before,
           t.ranking_after,
           t.seo_score_before,
           t.seo_score_after,
           t.optimization_type,
           t.effectiveness_score
         FROM seo_training_data t
         WHERE t.verified = true
         AND t.effectiveness_score >= $1
         ORDER BY t.created_at DESC
         LIMIT 10000`,
        [minEffectivenessScore]
      );

      const trainingData: TrainingDataPoint[] = result.rows.map((row: any) => ({
        url: row.url,
        features: Object.values(row.features),
        featureNames: Object.keys(row.features),
        rankingBefore: row.ranking_before,
        rankingAfter: row.ranking_after,
        seoScoreBefore: row.seo_score_before,
        seoScoreAfter: row.seo_score_after,
        optimizationType: row.optimization_type,
        effectivenessScore: row.effectiveness_score
      }));

      console.log(`Collected ${trainingData.length} training data points`);
      return trainingData;
    } catch (error) {
      console.error('Error collecting training data:', error);
      return [];
    }
  }

  /**
   * Extract features from analytics data
   */
  async extractFeatures(clientId: string, url: string): Promise<Record<string, number>> {
    try {
      // Get latest analytics data for this URL
      const result = await this.pgPool.query(
        `SELECT
           core_web_vitals,
           seo_score,
           user_behavior,
           page_title,
           meta_description
         FROM seo_analytics
         WHERE client_id = $1 AND url = $2
         ORDER BY timestamp DESC
         LIMIT 1`,
        [clientId, url]
      );

      if (result.rows.length === 0) {
        return {};
      }

      const data = result.rows[0];
      const cwv = data.core_web_vitals || {};
      const behavior = data.user_behavior || {};

      // Extract basic features
      const features: Record<string, number> = {
        // Core Web Vitals
        lcp: cwv.lcp || 0,
        fid: cwv.fid || 0,
        cls: cwv.cls || 0,
        inp: cwv.inp || 0,
        ttfb: cwv.ttfb || 0,
        fcp: cwv.fcp || 0,

        // SEO Score
        seo_score: data.seo_score || 0,

        // User Behavior
        time_on_page: behavior.timeOnPage || 0,
        scroll_depth: behavior.scrollDepth || 0,
        interactions: behavior.interactions || 0,

        // Content Features
        title_length: (data.page_title || '').length,
        description_length: (data.meta_description || '').length,
        has_title: data.page_title ? 1 : 0,
        has_description: data.meta_description ? 1 : 0,

        // Normalized scores (0-1)
        lcp_score: this.normalizeLCP(cwv.lcp || 0),
        cls_score: this.normalizeCLS(cwv.cls || 0),
        inp_score: this.normalizeINP(cwv.inp || 0)
      };

      return features;
    } catch (error) {
      console.error('Error extracting features:', error);
      return {};
    }
  }

  /**
   * Normalize Core Web Vitals to 0-1 scores (1 = good, 0 = poor)
   */
  private normalizeLCP(lcp: number): number {
    if (lcp <= 2500) return 1;
    if (lcp >= 4000) return 0;
    return 1 - (lcp - 2500) / 1500;
  }

  private normalizeCLS(cls: number): number {
    if (cls <= 0.1) return 1;
    if (cls >= 0.25) return 0;
    return 1 - (cls - 0.1) / 0.15;
  }

  private normalizeINP(inp: number): number {
    if (inp <= 200) return 1;
    if (inp >= 500) return 0;
    return 1 - (inp - 200) / 300;
  }

  /**
   * Train ranking prediction model
   */
  async trainRankingPredictionModel(config?: Partial<TrainingConfig>): Promise<string> {
    const modelType = 'ranking_prediction';

    if (this.trainingInProgress.has(modelType)) {
      throw new Error('Training already in progress for this model type');
    }

    this.trainingInProgress.add(modelType);

    try {
      console.log('Starting training for ranking prediction model...');

      // Collect training data
      const trainingData = await this.collectTrainingData();

      if (trainingData.length < 100) {
        throw new Error('Insufficient training data (minimum 100 samples required)');
      }

      // Prepare data
      const { xTrain, yTrain, xVal, yVal, featureCount } = this.prepareTrainingData(
        trainingData,
        'ranking',
        config?.validationSplit || 0.2
      );

      // Build model
      const model = this.buildRankingModel(featureCount);

      // Training configuration
      const trainingConfig: TrainingConfig = {
        modelType,
        epochs: config?.epochs || 100,
        batchSize: config?.batchSize || 32,
        learningRate: config?.learningRate || 0.001,
        validationSplit: config?.validationSplit || 0.2,
        earlyStoppingPatience: config?.earlyStoppingPatience || 10
      };

      // Train model
      const startTime = Date.now();

      const history = await model.fit(xTrain, yTrain, {
        epochs: trainingConfig.epochs,
        batchSize: trainingConfig.batchSize,
        validationData: [xVal, yVal],
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(
              `Epoch ${epoch + 1}: loss=${logs?.loss.toFixed(4)}, ` +
              `val_loss=${logs?.val_loss?.toFixed(4)}`
            );
          }
        },
        verbose: 0
      });

      const trainingDuration = Math.round((Date.now() - startTime) / 1000);

      // Evaluate model
      const metrics = await this.evaluateModel(model, xVal, yVal);

      console.log('Training completed:', metrics);

      // Save model
      const modelVersion = `v${Date.now()}`;
      const modelPath = `/tmp/seo_models/${modelType}_${modelVersion}`;
      if (!TF_NODE_AVAILABLE) {
        throw new Error('TensorFlow native bindings are required to save SEO training models. Install optional dependency @tensorflow/tfjs-node to enable persistence.');
      }
      await model.save(`file://${modelPath}`);

      // Store model metadata in database
      const result = await this.pgPool.query(
        `INSERT INTO seo_models
         (model_name, model_version, model_type, model_path, accuracy, f1_score,
          training_samples, training_duration_seconds, hyperparameters,
          performance_metrics, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          `${modelType}_${modelVersion}`,
          modelVersion,
          modelType,
          modelPath,
          metrics.accuracy,
          metrics.f1Score,
          trainingData.length,
          trainingDuration,
          JSON.stringify(trainingConfig),
          JSON.stringify(metrics),
          'testing'
        ]
      );

      const modelId = result.rows[0].id;

      // Clean up tensors
      xTrain.dispose();
      yTrain.dispose();
      xVal.dispose();
      yVal.dispose();

      console.log(`Model saved with ID: ${modelId}`);
      return modelId;
    } catch (error) {
      console.error('Error training ranking prediction model:', error);
      throw error;
    } finally {
      this.trainingInProgress.delete(modelType);
    }
  }

  /**
   * Prepare training data for TensorFlow
   */
  private prepareTrainingData(
    data: TrainingDataPoint[],
    targetType: 'ranking' | 'score',
    validationSplit: number
  ): {
    xTrain: tf.Tensor2D;
    yTrain: tf.Tensor2D;
    xVal: tf.Tensor2D;
    yVal: tf.Tensor2D;
    featureCount: number;
  } {
    // Extract features and targets
    const features: number[][] = [];
    const targets: number[] = [];

    for (const point of data) {
      if (point.features.length > 0) {
        features.push(point.features);

        if (targetType === 'ranking') {
          // Target is ranking improvement (negative = better)
          const improvement = point.rankingBefore - point.rankingAfter;
          targets.push(improvement);
        } else {
          // Target is SEO score improvement
          const improvement = point.seoScoreAfter - point.seoScoreBefore;
          targets.push(improvement);
        }
      }
    }

    const featureCount = features[0].length;

    // Normalize features (z-score normalization)
    const normalizedFeatures = this.normalizeFeatures(features);

    // Split into training and validation sets
    const splitIndex = Math.floor(normalizedFeatures.length * (1 - validationSplit));

    const xTrainData = normalizedFeatures.slice(0, splitIndex);
    const yTrainData = targets.slice(0, splitIndex);
    const xValData = normalizedFeatures.slice(splitIndex);
    const yValData = targets.slice(splitIndex);

    // Convert to tensors
    const xTrain = tf.tensor2d(xTrainData);
    const yTrain = tf.tensor2d(yTrainData, [yTrainData.length, 1]);
    const xVal = tf.tensor2d(xValData);
    const yVal = tf.tensor2d(yValData, [yValData.length, 1]);

    return { xTrain, yTrain, xVal, yVal, featureCount };
  }

  /**
   * Normalize features using z-score normalization
   */
  private normalizeFeatures(features: number[][]): number[][] {
    const featureCount = features[0].length;
    const means: number[] = new Array(featureCount).fill(0);
    const stds: number[] = new Array(featureCount).fill(0);

    // Calculate means
    for (let i = 0; i < featureCount; i++) {
      let sum = 0;
      for (let j = 0; j < features.length; j++) {
        sum += features[j][i];
      }
      means[i] = sum / features.length;
    }

    // Calculate standard deviations
    for (let i = 0; i < featureCount; i++) {
      let sumSquaredDiff = 0;
      for (let j = 0; j < features.length; j++) {
        const diff = features[j][i] - means[i];
        sumSquaredDiff += diff * diff;
      }
      stds[i] = Math.sqrt(sumSquaredDiff / features.length);
    }

    // Normalize
    const normalized: number[][] = [];
    for (let j = 0; j < features.length; j++) {
      const normalizedRow: number[] = [];
      for (let i = 0; i < featureCount; i++) {
        const std = stds[i] === 0 ? 1 : stds[i];
        normalizedRow.push((features[j][i] - means[i]) / std);
      }
      normalized.push(normalizedRow);
    }

    return normalized;
  }

  /**
   * Build ranking prediction model architecture
   */
  private buildRankingModel(inputDim: number): tf.LayersModel {
    const model = tf.sequential();

    // Input layer + first hidden layer
    model.add(tf.layers.dense({
      inputDim,
      units: 128,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Second hidden layer
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Third hidden layer
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));

    // Output layer (regression)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse', 'mae']
    });

    return model;
  }

  /**
   * Evaluate model performance
   */
  private async evaluateModel(
    model: tf.LayersModel,
    xVal: tf.Tensor2D,
    yVal: tf.Tensor2D
  ): Promise<ModelMetrics> {
    // Get predictions
    const predictions = model.predict(xVal) as tf.Tensor2D;

    // Calculate MSE
    const mse = tf.metrics.meanSquaredError(yVal, predictions);
    const mseValue = await mse.data();

    // Calculate MAE
    const mae = tf.metrics.meanAbsoluteError(yVal, predictions);
    const maeValue = await mae.data();

    // Calculate R² score
    const yMean = yVal.mean();
    const totalSumSquares = yVal.sub(yMean).square().sum();
    const residualSumSquares = yVal.sub(predictions).square().sum();
    const r2 = tf.scalar(1).sub(residualSumSquares.div(totalSumSquares));
    const r2Value = await r2.data();

    // Calculate accuracy (within ±10% of actual)
    const threshold = 0.1;
    const yValData = await yVal.data();
    const predictionsData = await predictions.data();
    let correctPredictions = 0;

    for (let i = 0; i < yValData.length; i++) {
      const actual = yValData[i];
      const predicted = predictionsData[i];
      const error = Math.abs(predicted - actual);
      const relativeError = actual !== 0 ? error / Math.abs(actual) : error;

      if (relativeError <= threshold) {
        correctPredictions++;
      }
    }

    const accuracy = correctPredictions / yValData.length;

    // Calculate F1 score (for classification-like threshold)
    const f1Score = accuracy; // Simplified for regression

    // Clean up
    mse.dispose();
    mae.dispose();
    predictions.dispose();

    return {
      accuracy,
      f1Score,
      mse: mseValue[0],
      mae: maeValue[0],
      r2Score: r2Value[0]
    };
  }

  /**
   * Deploy model to production
   */
  async deployModel(modelId: string): Promise<void> {
    try {
      // Get model info
      const result = await this.pgPool.query(
        'SELECT model_type, model_path FROM seo_models WHERE id = $1',
        [modelId]
      );

      if (result.rows.length === 0) {
        throw new Error('Model not found');
      }

      const { model_type, model_path } = result.rows[0];

      // Archive current active model
      await this.pgPool.query(
        `UPDATE seo_models
         SET status = 'archived'
         WHERE model_type = $1 AND status = 'active'`,
        [model_type]
      );

      // Activate new model
      await this.pgPool.query(
        `UPDATE seo_models
         SET status = 'active', deployed_at = NOW()
         WHERE id = $1`,
        [modelId]
      );

      // Load model into memory
      if (!TF_NODE_AVAILABLE) {
        throw new Error('TensorFlow native bindings are required to load SEO training models from disk. Install optional dependency @tensorflow/tfjs-node to enable deployment.');
      }

      const model = await tf.loadLayersModel(`file://${model_path}`);
      this.currentModels.set(model_type, model);

      console.log(`Model ${modelId} deployed successfully`);
    } catch (error) {
      console.error('Error deploying model:', error);
      throw error;
    }
  }

  /**
   * Predict ranking improvement for a URL
   */
  async predictRankingImprovement(clientId: string, url: string): Promise<number> {
    try {
      const model = this.currentModels.get('ranking_prediction');

      if (!model) {
        throw new Error('Ranking prediction model not loaded');
      }

      // Extract features
      const features = await this.extractFeatures(clientId, url);
      const featureArray = Object.values(features);

      if (featureArray.length === 0) {
        return 0;
      }

      // Prepare input tensor
      const inputTensor = tf.tensor2d([featureArray]);

      // Make prediction
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictionValue = await prediction.data();

      // Clean up
      inputTensor.dispose();
      prediction.dispose();

      return predictionValue[0];
    } catch (error) {
      console.error('Error predicting ranking improvement:', error);
      return 0;
    }
  }

  /**
   * Submit training data contribution and calculate rewards
   */
  async submitTrainingDataContribution(
    clientId: string,
    url: string,
    optimizationType: string,
    rankingBefore: number,
    rankingAfter: number
  ): Promise<{ contributionId: string; rewardAmount: number }> {
    try {
      // Extract features
      const features = await this.extractFeatures(clientId, url);

      // Calculate effectiveness score
      const rankingImprovement = rankingBefore - rankingAfter;
      const effectivenessScore = Math.max(0, Math.min(100, rankingImprovement * 10));

      // Calculate quality score (based on feature completeness)
      const featureCount = Object.keys(features).length;
      const maxFeatures = 20; // Expected feature count
      const qualityScore = Math.min(100, (featureCount / maxFeatures) * 100);

      // Calculate reward amount (in tokens)
      const baseReward = 10;
      const effectivenessMultiplier = effectivenessScore / 100;
      const qualityMultiplier = qualityScore / 100;
      const rewardAmount = baseReward * effectivenessMultiplier * qualityMultiplier;

      // Store training data
      const result = await this.pgPool.query(
        `INSERT INTO seo_training_data
         (client_id, url, features, ranking_before, ranking_after,
          optimization_type, effectiveness_score, quality_score, reward_amount, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          clientId,
          url,
          JSON.stringify(features),
          rankingBefore,
          rankingAfter,
          optimizationType,
          effectivenessScore,
          qualityScore,
          rewardAmount,
          false // Will be verified later
        ]
      );

      const contributionId = result.rows[0].id;

      console.log(`Training data contribution submitted: ${contributionId}, reward: ${rewardAmount}`);

      return { contributionId, rewardAmount };
    } catch (error) {
      console.error('Error submitting training data contribution:', error);
      throw error;
    }
  }

  /**
   * Get training statistics
   */
  async getTrainingStats(): Promise<any> {
    try {
      const result = await this.pgPool.query(`
        SELECT
          COUNT(*) as total_samples,
          COUNT(CASE WHEN verified = true THEN 1 END) as verified_samples,
          AVG(effectiveness_score) as avg_effectiveness,
          AVG(quality_score) as avg_quality,
          SUM(reward_amount) as total_rewards,
          COUNT(DISTINCT client_id) as contributing_clients
        FROM seo_training_data
      `);

      const modelsResult = await this.pgPool.query(`
        SELECT
          model_type,
          model_version,
          accuracy,
          training_samples,
          status,
          deployed_at
        FROM seo_models
        WHERE status IN ('active', 'testing')
        ORDER BY deployed_at DESC
      `);

      return {
        data: result.rows[0],
        models: modelsResult.rows
      };
    } catch (error) {
      console.error('Error getting training stats:', error);
      throw error;
    }
  }

  /**
   * Clean up
   */
  async cleanup(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }

    // Dispose all loaded models
    for (const [type, model] of this.currentModels.entries()) {
      model.dispose();
    }
    this.currentModels.clear();
  }
}

export default SEOTrainingPipelineService;
