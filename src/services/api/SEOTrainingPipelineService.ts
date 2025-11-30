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
    if (
      typeof tf.setBackend === 'function' &&
      typeof tf.findBackend === 'function' &&
      tf.findBackend('tensorflow')
    ) {
      tf.setBackend('tensorflow').catch(() => {});
    }
    console.log('SEOTrainingPipelineService: native TensorFlow backend enabled');
    return 'tensorflow';
  } catch (err) {
    console.warn(
      'SEOTrainingPipelineService: native TensorFlow bindings unavailable, using @tensorflow/tfjs fallback'
    );
    return 'tfjs';
  }
})();

const TF_NODE_AVAILABLE = TENSORFLOW_BACKEND === 'tensorflow';

interface TrainingDataPoint {
  url: string;
  features: number[];
  featureNames: string[];
  featureVersion: string;
  schemaTypes: string[];
  richSnippetTargets: string[];
  qualityScore: number;
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
  private seoStatCatalogLoaded = false;
  private seoFeatureNames: string[] = [];
  private seoFeatureVersion = 'unknown';
  private toFeatureVector: (metrics: Record<string, number>) => number[] = () => [];
  private schemaModelMetadata: Map<string, any> = new Map();
  private schemaTemplateModule: any | null = null;

  constructor(pgPool: any) {
    this.pgPool = pgPool;
    this.initRedis();
    this.loadCurrentModels();
    void this.ensureSeoStatCatalog();
  }

  private async initRedis(): Promise<void> {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
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
        `SELECT model_name, model_type, model_path, model_version, hyperparameters
         FROM seo_models
         WHERE status = 'active'`
      );

      for (const row of result.rows) {
        try {
          if (!TF_NODE_AVAILABLE) {
            console.warn(
              `Skipping load for ${row.model_name}: native TensorFlow bindings are required to read models from disk.`
            );
            continue;
          }
          const model = await tf.loadLayersModel(`file://${row.model_path}`);
          this.currentModels.set(row.model_type, model);
          if (row.hyperparameters) {
            try {
              const hyperparameters =
                typeof row.hyperparameters === 'string'
                  ? JSON.parse(row.hyperparameters)
                  : row.hyperparameters;
              this.schemaModelMetadata.set(row.model_type, {
                ...hyperparameters,
                modelVersion: row.model_version,
                modelName: row.model_name,
              });
            } catch (err) {
              console.warn(`Unable to parse hyperparameters for ${row.model_name}:`, err);
            }
          }
          console.log(`Loaded model: ${row.model_name} (${row.model_type})`);
        } catch (error) {
          console.error(`Failed to load model ${row.model_name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading current models:', error);
    }
  }

  private async ensureSeoStatCatalog(): Promise<void> {
    if (this.seoStatCatalogLoaded) {
      return;
    }

    try {
      const catalogModule = await import('../../../lib/seo/seo-stat-catalog.js');
      this.seoFeatureNames = Array.isArray(catalogModule.getFeatureNames?.())
        ? catalogModule.getFeatureNames()
        : [];
      this.seoFeatureVersion = catalogModule.SEO_STAT_VERSION || 'unknown';
      this.toFeatureVector =
        typeof catalogModule.toFeatureVector === 'function'
          ? catalogModule.toFeatureVector
          : () => [];
      this.seoStatCatalogLoaded = true;
    } catch (error) {
      console.error('Failed to load SEO stat catalog definitions:', error);
      this.seoFeatureNames = [];
      this.toFeatureVector = () => [];
      this.seoFeatureVersion = 'unknown';
    }
  }

  /**
   * Collect training data from analytics
   */
  async collectTrainingData(minEffectivenessScore: number = 0.5): Promise<TrainingDataPoint[]> {
    try {
      await this.ensureSeoStatCatalog();

      const result = await this.pgPool.query(
        `SELECT
           t.url,
           t.features,
           t.feature_vector,
           t.feature_names,
           t.feature_version,
           t.schema_types,
           t.rich_snippet_targets,
           t.quality_score,
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

      const trainingData: TrainingDataPoint[] = result.rows.map((row: any) => {
        const { featureVector, featureNames, featureVersion } = this.deriveFeaturePayload(row);

        return {
          url: row.url,
          features: featureVector,
          featureNames,
          featureVersion,
          schemaTypes: Array.isArray(row.schema_types) ? row.schema_types : [],
          richSnippetTargets: Array.isArray(row.rich_snippet_targets)
            ? row.rich_snippet_targets
            : [],
          qualityScore: Number(row.quality_score || 0),
          rankingBefore: row.ranking_before,
          rankingAfter: row.ranking_after,
          seoScoreBefore: row.seo_score_before,
          seoScoreAfter: row.seo_score_after,
          optimizationType: row.optimization_type,
          effectivenessScore: row.effectiveness_score,
        };
      });

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
      await this.ensureSeoStatCatalog();

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
      const rawFeatures: Record<string, number> = {
        core_web_vitals_lcp: cwv.lcp || 0,
        core_web_vitals_fid: cwv.fid || 0,
        core_web_vitals_cls: cwv.cls || 0,
        core_web_vitals_inp: cwv.inp || 0,
        core_web_vitals_ttfb: cwv.ttfb || 0,
        core_web_vitals_fcp: cwv.fcp || 0,
        seo_score_overall: data.seo_score || 0,
        engagement_time_on_page: behavior.timeOnPage || 0,
        engagement_scroll_depth: behavior.scrollDepth || 0,
        engagement_interactions: behavior.interactions || 0,
        metadata_title_length: (data.page_title || '').length,
        metadata_description_length: (data.meta_description || '').length,
        metadata_title_keyword_coverage: 0,
        metadata_description_keyword_coverage: 0,
        metadata_canonical_present: 0,
        metadata_canonical_self: 0,
        metadata_robots_indexable: 1,
        metadata_viewport_present: 0,
        metadata_lang_present: 0,
        metadata_hreflang_count: 0,
      };

      return rawFeatures;
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

  private buildSchemaVocabulary(rows: any[], maxSize: number): string[] {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const schemaTypes: string[] = Array.isArray(row?.schema_types) ? row.schema_types : [];
      for (const type of schemaTypes) {
        if (!type) {
          continue;
        }
        const normalized = String(type).trim();
        if (!normalized) {
          continue;
        }
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    }

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, maxSize).map(entry => entry[0]);
  }

  private schemaTypesToVector(schemaTypes: string[], vocabulary: string[]): number[] {
    const set = new Set((schemaTypes || []).map(type => String(type).trim()));
    return vocabulary.map(type => (set.has(type) ? 1 : 0));
  }

  private prepareMultiLabelTrainingData(
    features: number[][],
    labels: number[][],
    validationSplit: number
  ): {
    xTrain: tf.Tensor2D;
    yTrain: tf.Tensor2D;
    xVal: tf.Tensor2D;
    yVal: tf.Tensor2D;
  } {
    const total = features.length;
    const indices = Array.from({ length: total }, (_, idx) => idx);
    this.shuffleArray(indices);

    const validationSize = Math.max(1, Math.floor(total * validationSplit));
    const valIndices = indices.slice(0, validationSize);
    const trainIndices = indices.slice(validationSize);

    const xTrainArr = trainIndices.map(index => features[index]);
    const yTrainArr = trainIndices.map(index => labels[index]);
    const xValArr = valIndices.map(index => features[index]);
    const yValArr = valIndices.map(index => labels[index]);

    return {
      xTrain: tf.tensor2d(xTrainArr),
      yTrain: tf.tensor2d(yTrainArr),
      xVal: tf.tensor2d(xValArr),
      yVal: tf.tensor2d(yValArr),
    };
  }

  private buildSchemaSuggestionModel(
    inputDim: number,
    outputDim: number,
    learningRate = 0.001
  ): tf.LayersModel {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: Math.min(256, Math.max(64, inputDim * 2)),
        activation: 'relu',
        inputShape: [inputDim],
        kernelInitializer: 'heNormal',
      })
    );
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(
      tf.layers.dense({
        units: Math.min(128, Math.max(32, Math.floor(inputDim * 1.5))),
        activation: 'relu',
        kernelInitializer: 'heNormal',
      })
    );
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(
      tf.layers.dense({
        units: outputDim,
        activation: 'sigmoid',
      })
    );

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private async evaluateSchemaModel(
    model: tf.LayersModel,
    xVal: tf.Tensor2D,
    yVal: tf.Tensor2D,
    threshold: number
  ): Promise<
    ModelMetrics & { precision: number; recall: number; threshold: number; vocabularySize: number }
  > {
    const predictionsTensor = model.predict(xVal) as tf.Tensor;
    const predictions = (await predictionsTensor.array()) as number[][];
    const labels = (await yVal.array()) as number[][];

    predictionsTensor.dispose();

    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let total = 0;

    for (let i = 0; i < predictions.length; i += 1) {
      for (let j = 0; j < predictions[i].length; j += 1) {
        const predicted = predictions[i][j] >= threshold ? 1 : 0;
        const actual = labels[i][j];
        if (predicted === 1 && actual === 1) {
          truePositives += 1;
        } else if (predicted === 1 && actual === 0) {
          falsePositives += 1;
        } else if (predicted === 0 && actual === 1) {
          falseNegatives += 1;
        }
        total += 1;
      }
    }

    const precision =
      truePositives + falsePositives === 0 ? 0 : truePositives / (truePositives + falsePositives);
    const recall =
      truePositives + falseNegatives === 0 ? 0 : truePositives / (truePositives + falseNegatives);
    const f1Score = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

    // Reuse existing metric structure, filling with defaults where not applicable
    const metrics: ModelMetrics = {
      accuracy: precision,
      f1Score,
      mse: 0,
      mae: 0,
      r2Score: 0,
    };

    return {
      ...metrics,
      precision,
      recall,
      threshold,
      vocabularySize: predictions[0]?.length || 0,
    };
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private alignFeatureVector(metrics: Record<string, number>, featureNames: string[]): number[] {
    if (!metrics || Object.keys(metrics).length === 0) {
      return featureNames.map(() => 0);
    }

    return featureNames.map(name => {
      const value = metrics[name];
      return Number.isFinite(value) ? Number(value) : Number(metrics[name] || 0) || 0;
    });
  }

  private deriveFeaturePayload(row: any): {
    featureVector: number[];
    featureNames: string[];
    featureVersion: string;
  } {
    const metrics: Record<string, number> = row?.features || {};
    let featureNames: string[] =
      Array.isArray(row?.feature_names) && row.feature_names.length
        ? row.feature_names
        : this.seoFeatureNames;

    if ((!featureNames || featureNames.length === 0) && metrics && Object.keys(metrics).length) {
      featureNames = Object.keys(metrics);
    }

    let featureVector: number[] = [];

    if (Array.isArray(row?.feature_vector) && row.feature_vector.length) {
      featureVector = row.feature_vector.map((value: any) => Number(value) || 0);
    } else if (featureNames && featureNames.length) {
      featureVector = this.alignFeatureVector(metrics, featureNames);
    } else if (metrics && Object.keys(metrics).length) {
      featureVector = Object.values(metrics).map((value: any) => Number(value) || 0);
      featureNames = Object.keys(metrics);
    }

    return {
      featureVector,
      featureNames,
      featureVersion: row?.feature_version || this.seoFeatureVersion,
    };
  }

  private async getSchemaTemplateModule(): Promise<any> {
    if (this.schemaTemplateModule) {
      return this.schemaTemplateModule;
    }

    try {
      this.schemaTemplateModule = await import('../../../lib/seo/schema-templates.js');
    } catch (error) {
      console.error('Failed to load schema template helpers:', error);
      this.schemaTemplateModule = {
        buildSchemaSnippets: () => ({
          snippets: [],
          suggestions: ['Schema template helpers unavailable'],
        }),
      };
    }

    return this.schemaTemplateModule;
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
        earlyStoppingPatience: config?.earlyStoppingPatience || 10,
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
          },
        },
        verbose: 0,
      });

      const trainingDuration = Math.round((Date.now() - startTime) / 1000);

      // Evaluate model
      const metrics = await this.evaluateModel(model, xVal, yVal);

      console.log('Training completed:', metrics);

      // Save model
      const modelVersion = `v${Date.now()}`;
      const modelPath = `/tmp/seo_models/${modelType}_${modelVersion}`;
      if (!TF_NODE_AVAILABLE) {
        throw new Error(
          'TensorFlow native bindings are required to save SEO training models. Install optional dependency @tensorflow/tfjs-node to enable persistence.'
        );
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
          'testing',
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

  async trainSchemaSuggestionModel(
    config?: Partial<TrainingConfig> & {
      minQualityScore?: number;
      maxVocabularySize?: number;
      threshold?: number;
    }
  ): Promise<string> {
    const modelType = 'schema_suggester';

    if (this.trainingInProgress.has(modelType)) {
      throw new Error('Training already in progress for schema suggester');
    }

    await this.ensureSeoStatCatalog();

    this.trainingInProgress.add(modelType);

    try {
      console.log('Starting training for schema suggestion model...');

      const minQualityScore =
        typeof config?.minQualityScore === 'number' ? config?.minQualityScore : 40;
      const maxVocabularySize =
        typeof config?.maxVocabularySize === 'number' ? config?.maxVocabularySize : 18;
      const validationSplit = config?.validationSplit ?? 0.2;
      const threshold = typeof config?.threshold === 'number' ? config.threshold : 0.5;

      const datasetQuery = await this.pgPool.query(
        `SELECT
           feature_vector,
           feature_names,
           feature_version,
           features,
           schema_types,
           quality_score
         FROM seo_training_data
         WHERE schema_types IS NOT NULL
           AND array_length(schema_types, 1) > 0
           AND (quality_score IS NULL OR quality_score >= $1)
         ORDER BY created_at DESC
         LIMIT 20000`,
        [minQualityScore]
      );

      if (!datasetQuery.rows.length) {
        throw new Error('No training samples available with schema annotations');
      }

      const vocabulary = this.buildSchemaVocabulary(datasetQuery.rows, maxVocabularySize);

      if (!vocabulary.length) {
        throw new Error('Unable to derive schema vocabulary from training data');
      }

      const featureLength = this.seoFeatureNames.length;
      const features: number[][] = [];
      const labels: number[][] = [];

      for (const row of datasetQuery.rows) {
        const { featureVector } = this.deriveFeaturePayload(row);
        if (!featureVector.length) {
          continue;
        }

        let alignedVector = featureVector;
        if (featureLength && featureVector.length !== featureLength) {
          alignedVector = this.alignFeatureVector(row.features || {}, this.seoFeatureNames);
        }

        if (!alignedVector.length) {
          continue;
        }

        features.push(alignedVector);
        labels.push(this.schemaTypesToVector(row.schema_types || [], vocabulary));
      }

      if (features.length < 50) {
        throw new Error('Insufficient schema training samples (minimum 50 required)');
      }

      const { xTrain, yTrain, xVal, yVal } = this.prepareMultiLabelTrainingData(
        features,
        labels,
        validationSplit
      );
      const inputDim = xTrain.shape[1];
      const outputDim = vocabulary.length;

      const model = this.buildSchemaSuggestionModel(inputDim, outputDim, config?.learningRate);

      const schemaTrainingConfig: TrainingConfig = {
        modelType,
        epochs: config?.epochs || 80,
        batchSize: config?.batchSize || 32,
        learningRate: config?.learningRate || 0.001,
        validationSplit,
        earlyStoppingPatience: config?.earlyStoppingPatience || 10,
      };

      const startTime = Date.now();

      const history = await model.fit(xTrain, yTrain, {
        epochs: schemaTrainingConfig.epochs,
        batchSize: schemaTrainingConfig.batchSize,
        validationData: [xVal, yVal],
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(
              `Schema Model Epoch ${epoch + 1}: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}`
            );
          },
        },
        verbose: 0,
      });

      const trainingDuration = Math.round((Date.now() - startTime) / 1000);

      const metrics = await this.evaluateSchemaModel(model, xVal, yVal, threshold);

      console.log('Schema suggester training completed:', metrics);

      const modelVersion = `v${Date.now()}`;
      const modelPath = `/tmp/seo_models/${modelType}_${modelVersion}`;
      if (!TF_NODE_AVAILABLE) {
        throw new Error(
          'TensorFlow native bindings are required to persist schema models. Install @tensorflow/tfjs-node.'
        );
      }
      await model.save(`file://${modelPath}`);

      const hyperparameters = {
        ...schemaTrainingConfig,
        schemaVocabulary: vocabulary,
        featureNames: this.seoFeatureNames,
        featureVersion: this.seoFeatureVersion,
        threshold,
      };

      const insertResult = await this.pgPool.query(
        `INSERT INTO seo_models (
           model_name,
           model_version,
           model_type,
           model_path,
           accuracy,
           f1_score,
           training_samples,
           training_duration_seconds,
           hyperparameters,
           performance_metrics,
           status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          `${modelType}_${modelVersion}`,
          modelVersion,
          modelType,
          modelPath,
          metrics.accuracy,
          metrics.f1Score,
          features.length,
          trainingDuration,
          JSON.stringify(hyperparameters),
          JSON.stringify(metrics),
          'testing',
        ]
      );

      this.currentModels.set(modelType, model);
      this.schemaModelMetadata.set(modelType, {
        ...hyperparameters,
        modelVersion,
        modelName: `${modelType}_${modelVersion}`,
      });

      xTrain.dispose();
      yTrain.dispose();
      xVal.dispose();
      yVal.dispose();

      console.log(`Schema suggester model saved with ID: ${insertResult.rows[0].id}`);
      return insertResult.rows[0].id;
    } catch (error) {
      console.error('Error training schema suggestion model:', error);
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

  async generateSchemaEnhancementPlan(clientId: string, url: string): Promise<Record<string, any>> {
    await this.ensureSeoStatCatalog();

    const modelType = 'schema_suggester';
    let model = this.currentModels.get(modelType);

    if (!model) {
      console.log('Schema suggester not loaded, attempting to reload active models...');
      await this.loadCurrentModels();
      model = this.currentModels.get(modelType);
    }

    if (!model) {
      throw new Error('Schema suggestion model is not available');
    }

    const metadata = this.schemaModelMetadata.get(modelType) || {};
    const schemaVocabulary: string[] = Array.isArray(metadata.schemaVocabulary)
      ? metadata.schemaVocabulary
      : [];
    const threshold: number = typeof metadata.threshold === 'number' ? metadata.threshold : 0.5;
    const expectedFeatureNames: string[] =
      Array.isArray(metadata.featureNames) && metadata.featureNames.length
        ? metadata.featureNames
        : this.seoFeatureNames;

    const crawlResult = await this.pgPool.query(
      `SELECT
         metadata,
         seo_feature_vector,
         seo_feature_names,
         seo_feature_version,
         schema_types,
         rich_snippet_targets,
         seo_quality_score
       FROM crawled_sites
       WHERE url = $1
       ORDER BY last_crawled DESC
       LIMIT 1`,
      [url]
    );

    if (!crawlResult.rows.length) {
      throw new Error('No crawl metadata available for requested URL');
    }

    const row = crawlResult.rows[0];
    const metadataPayload =
      typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {};
    const seoStats = metadataPayload?.seoStats?.metrics || metadataPayload?.seoStats || {};
    const catalogMetrics: Record<string, number> = seoStats;

    let featureVector: number[] =
      Array.isArray(row.seo_feature_vector) && row.seo_feature_vector.length
        ? row.seo_feature_vector.map((value: any) => Number(value) || 0)
        : [];

    if (!featureVector.length && catalogMetrics && Object.keys(catalogMetrics).length) {
      featureVector = this.alignFeatureVector(catalogMetrics, expectedFeatureNames);
    }

    if (!featureVector.length) {
      throw new Error('Unable to derive feature vector for schema planning');
    }

    if (expectedFeatureNames.length && featureVector.length !== expectedFeatureNames.length) {
      featureVector = this.alignFeatureVector(catalogMetrics, expectedFeatureNames);
    }

    const inputTensor = tf.tensor2d([featureVector]);
    const predictionTensor = model.predict(inputTensor) as tf.Tensor;
    const predictionValues = Array.from((await predictionTensor.data()) as Float32Array);
    predictionTensor.dispose();
    inputTensor.dispose();

    const schemaCandidates = predictionValues
      .map((score, index) => ({ type: schemaVocabulary[index], score }))
      .filter(candidate => candidate.type && candidate.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const templateModule = await this.getSchemaTemplateModule();

    const snippetPayload = templateModule.buildSchemaSnippets({
      schemaTypes: schemaCandidates.map(candidate => candidate.type),
      url,
      title: metadataPayload.title,
      description: metadataPayload.description,
      author: metadataPayload.author,
      publishDate: metadataPayload.publishDate,
      headings: metadataPayload.headingDetails || [],
      breadcrumbTrail: metadataPayload.breadcrumbTrail || [],
      product: metadataPayload.product || null,
    });

    const recommendation = {
      url,
      clientId,
      generatedAt: new Date().toISOString(),
      modelVersion: metadata.modelVersion,
      featureVersion: row.seo_feature_version || metadata.featureVersion || this.seoFeatureVersion,
      threshold,
      schemaVocabulary,
      predictedSchemas: schemaCandidates,
      qualityScore: row.seo_quality_score || metadataPayload.seoQualityScore || null,
      snippets: snippetPayload.snippets,
      additionalSuggestions: snippetPayload.suggestions,
      metadata: {
        currentSchemaTypes: row.schema_types || metadataPayload?.seoStats?.schemaTypes || [],
        currentRichSnippetTargets:
          row.rich_snippet_targets || metadataPayload?.seoStats?.richSnippetTargets || [],
        seoScore: metadataPayload.seoScore?.overall || null,
      },
    };

    await this.pgPool.query(
      `INSERT INTO seo_ml_recommendations (
         client_id,
         url,
         model_type,
         model_version,
         recommendation,
         created_at
       ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [clientId, url, modelType, metadata.modelVersion || null, JSON.stringify(recommendation)]
    );

    return recommendation;
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
    model.add(
      tf.layers.dense({
        inputDim,
        units: 128,
        activation: 'relu',
        kernelInitializer: 'heNormal',
      })
    );

    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Second hidden layer
    model.add(
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        kernelInitializer: 'heNormal',
      })
    );

    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Third hidden layer
    model.add(
      tf.layers.dense({
        units: 32,
        activation: 'relu',
        kernelInitializer: 'heNormal',
      })
    );

    // Output layer (regression)
    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'linear',
      })
    );

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse', 'mae'],
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
      r2Score: r2Value[0],
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
        throw new Error(
          'TensorFlow native bindings are required to load SEO training models from disk. Install optional dependency @tensorflow/tfjs-node to enable deployment.'
        );
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
          false, // Will be verified later
        ]
      );

      const contributionId = result.rows[0].id;

      console.log(
        `Training data contribution submitted: ${contributionId}, reward: ${rewardAmount}`
      );

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
        models: modelsResult.rows,
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
