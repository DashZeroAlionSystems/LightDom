/**
 * Neural Network Instance Manager
 * Manages per-client neural network instances with isolated training data
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import * as tf from '@tensorflow/tfjs-node';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface NeuralNetworkInstance {
  id: string;
  clientId: string;
  modelType: string;
  status: 'initializing' | 'training' | 'ready' | 'predicting' | 'updating' | 'paused' | 'error' | 'archived';
  version: string;
  trainingConfig: TrainingConfig;
  dataConfig: DataConfig;
  architecture?: ModelArchitecture;
  performance?: PerformanceMetrics;
  deployment?: DeploymentConfig;
  metadata: Metadata;
}

interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
  earlyStopping?: boolean;
  patience?: number;
}

interface DataConfig {
  source: 'database' | 'file' | 'stream' | 'api';
  isolation: 'strict' | 'shared' | 'federated';
  dataPath: string;
  minDataPoints: number;
  maxDataPoints?: number;
  features?: string[];
  labels?: string[];
}

interface ModelArchitecture {
  inputShape: number[];
  layers: LayerConfig[];
  outputShape: number[];
}

interface LayerConfig {
  type: string;
  units?: number;
  activation?: string;
  dropout?: number;
  [key: string]: any;
}

interface PerformanceMetrics {
  accuracy?: number;
  loss?: number;
  validationAccuracy?: number;
  validationLoss?: number;
  trainingTime?: number;
  inferenceTime?: number;
  lastTrainingDate?: string;
  predictionCount?: number;
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  endpoint?: string;
  autoUpdate?: boolean;
  updateSchedule?: string;
}

interface Metadata {
  name: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
}

export class NeuralNetworkInstanceManager extends EventEmitter {
  private instances: Map<string, NeuralNetworkInstance> = new Map();
  private models: Map<string, tf.LayersModel> = new Map();
  private dbPool: Pool;
  private modelsDir: string;
  private configDir: string;

  constructor(dbPool: Pool, modelsDir = './models', configDir = './config/neural-networks') {
    super();
    this.dbPool = dbPool;
    this.modelsDir = modelsDir;
    this.configDir = configDir;

    // Ensure directories exist
    [this.modelsDir, this.configDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialize manager and load existing instances
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Neural Network Instance Manager...');
    
    // Load instances from database
    await this.loadInstancesFromDatabase();
    
    // Load active models into memory
    await this.loadActiveModels();
    
    console.log(`✅ Loaded ${this.instances.size} neural network instances`);
  }

  /**
   * Create a new neural network instance for a client
   */
  async createInstance(config: Partial<NeuralNetworkInstance>): Promise<NeuralNetworkInstance> {
    if (!config.clientId || !config.modelType) {
      throw new Error('clientId and modelType are required');
    }

    const id = `nn-${config.clientId}-${config.modelType}-${Date.now()}`;
    
    const instance: NeuralNetworkInstance = {
      id,
      clientId: config.clientId,
      modelType: config.modelType,
      status: 'initializing',
      version: 'v1.0.0',
      trainingConfig: config.trainingConfig || {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2,
        optimizer: 'adam',
        earlyStopping: true,
        patience: 5
      },
      dataConfig: config.dataConfig || {
        source: 'database',
        isolation: 'strict',
        dataPath: `SELECT * FROM training_data WHERE client_id = '${config.clientId}' AND model_type = '${config.modelType}'`,
        minDataPoints: 1000
      },
      metadata: {
        name: config.metadata?.name || `${config.modelType} for ${config.clientId}`,
        description: config.metadata?.description,
        tags: config.metadata?.tags || [config.modelType, config.clientId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: config.metadata?.createdBy
      }
    };

    // Save to database
    await this.saveInstanceToDatabase(instance);
    
    // Save configuration file
    this.saveInstanceConfig(instance);
    
    // Add to instances map
    this.instances.set(id, instance);
    
    this.emit('instance:created', instance);
    console.log(`✅ Created neural network instance: ${id}`);
    
    return instance;
  }

  /**
   * Train a neural network instance
   */
  async trainInstance(instanceId: string): Promise<PerformanceMetrics> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    console.log(`🎓 Training neural network: ${instanceId}`);
    instance.status = 'training';
    this.emit('instance:training:start', instance);

    try {
      // Load training data with client isolation
      const trainingData = await this.loadTrainingData(instance);
      
      if (trainingData.length < instance.dataConfig.minDataPoints) {
        throw new Error(`Insufficient training data: ${trainingData.length} < ${instance.dataConfig.minDataPoints}`);
      }

      // Preprocess data
      const { features, labels } = await this.preprocessData(trainingData, instance);
      
      // Build or load model
      let model = this.models.get(instanceId);
      if (!model) {
        model = await this.buildModel(instance);
      }

      // Train model
      const startTime = Date.now();
      const history = await model.fit(
        tf.tensor2d(features),
        tf.tensor2d(labels),
        {
          epochs: instance.trainingConfig.epochs,
          batchSize: instance.trainingConfig.batchSize,
          validationSplit: instance.trainingConfig.validationSplit,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              this.emit('instance:training:progress', {
                instanceId,
                epoch,
                logs
              });
            }
          }
        }
      );

      const trainingTime = Date.now() - startTime;

      // Calculate performance metrics
      const performance: PerformanceMetrics = {
        accuracy: history.history.acc?.[history.history.acc.length - 1] as number,
        loss: history.history.loss?.[history.history.loss.length - 1] as number,
        validationAccuracy: history.history.val_acc?.[history.history.val_acc.length - 1] as number,
        validationLoss: history.history.val_loss?.[history.history.val_loss.length - 1] as number,
        trainingTime,
        lastTrainingDate: new Date().toISOString(),
        predictionCount: 0
      };

      // Update instance
      instance.performance = performance;
      instance.status = 'ready';
      instance.metadata.updatedAt = new Date().toISOString();

      // Increment version
      instance.version = this.incrementVersion(instance.version);

      // Save model
      await this.saveModel(instanceId, model);
      this.models.set(instanceId, model);

      // Update database
      await this.updateInstanceInDatabase(instance);
      this.saveInstanceConfig(instance);

      this.emit('instance:training:complete', { instance, performance });
      console.log(`✅ Training complete for ${instanceId} - Accuracy: ${performance.accuracy?.toFixed(4)}`);

      return performance;

    } catch (error) {
      instance.status = 'error';
      this.emit('instance:training:error', { instance, error });
      console.error(`❌ Training failed for ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Make predictions using a neural network instance
   */
  async predict(instanceId: string, input: any): Promise<any> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    if (instance.status !== 'ready') {
      throw new Error(`Instance not ready: ${instance.status}`);
    }

    let model = this.models.get(instanceId);
    if (!model) {
      model = await this.loadModel(instanceId);
      this.models.set(instanceId, model);
    }

    const startTime = Date.now();
    instance.status = 'predicting';

    try {
      // Preprocess input
      const processedInput = await this.preprocessInput(input, instance);
      
      // Make prediction
      const prediction = model.predict(tf.tensor2d([processedInput])) as tf.Tensor;
      const result = await prediction.array();

      // Track inference time
      const inferenceTime = Date.now() - startTime;
      if (instance.performance) {
        instance.performance.inferenceTime = inferenceTime;
        instance.performance.predictionCount = (instance.performance.predictionCount || 0) + 1;
      }

      instance.status = 'ready';
      this.emit('instance:prediction', { instanceId, inferenceTime });

      return result[0];

    } catch (error) {
      instance.status = 'ready';
      console.error(`❌ Prediction failed for ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Get instance by ID
   */
  getInstance(instanceId: string): NeuralNetworkInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Get all instances for a client
   */
  getClientInstances(clientId: string): NeuralNetworkInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.clientId === clientId
    );
  }

  /**
   * Get all instances by model type
   */
  getInstancesByModelType(modelType: string): NeuralNetworkInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.modelType === modelType
    );
  }

  /**
   * Delete an instance
   */
  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    // Archive instead of delete
    instance.status = 'archived';
    await this.updateInstanceInDatabase(instance);
    
    // Remove from memory
    this.instances.delete(instanceId);
    this.models.delete(instanceId);
    
    this.emit('instance:deleted', instance);
    console.log(`🗑️  Archived neural network instance: ${instanceId}`);
  }

  /**
   * Load training data with client isolation
   */
  private async loadTrainingData(instance: NeuralNetworkInstance): Promise<any[]> {
    if (instance.dataConfig.source === 'database') {
      // Query with client isolation
      const query = instance.dataConfig.dataPath;
      const result = await this.dbPool.query(query);
      return result.rows;
    }
    
    // Handle other data sources (file, stream, api)
    throw new Error(`Data source not implemented: ${instance.dataConfig.source}`);
  }

  /**
   * Preprocess training data
   */
  private async preprocessData(data: any[], instance: NeuralNetworkInstance): Promise<{ features: number[][], labels: number[][] }> {
    // Extract features and labels based on configuration
    const features: number[][] = [];
    const labels: number[][] = [];

    for (const row of data) {
      const featureRow: number[] = [];
      const labelRow: number[] = [];

      // Extract features
      if (instance.dataConfig.features) {
        for (const feature of instance.dataConfig.features) {
          featureRow.push(parseFloat(row[feature]) || 0);
        }
      }

      // Extract labels
      if (instance.dataConfig.labels) {
        for (const label of instance.dataConfig.labels) {
          labelRow.push(parseFloat(row[label]) || 0);
        }
      }

      features.push(featureRow);
      labels.push(labelRow);
    }

    return { features, labels };
  }

  /**
   * Preprocess input for prediction
   */
  private async preprocessInput(input: any, instance: NeuralNetworkInstance): Promise<number[]> {
    const processed: number[] = [];
    
    if (instance.dataConfig.features) {
      for (const feature of instance.dataConfig.features) {
        processed.push(parseFloat(input[feature]) || 0);
      }
    }
    
    return processed;
  }

  /**
   * Build neural network model
   */
  private async buildModel(instance: NeuralNetworkInstance): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Default architecture if not specified
    const inputDim = instance.dataConfig.features?.length || 10;
    const outputDim = instance.dataConfig.labels?.length || 1;

    // Input layer
    model.add(tf.layers.dense({
      inputDim,
      units: 64,
      activation: 'relu'
    }));

    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Output layer
    model.add(tf.layers.dense({
      units: outputDim,
      activation: outputDim === 1 ? 'sigmoid' : 'softmax'
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(instance.trainingConfig.learningRate),
      loss: outputDim === 1 ? 'binaryCrossentropy' : 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Save model to disk
   */
  private async saveModel(instanceId: string, model: tf.LayersModel): Promise<void> {
    const modelPath = join(this.modelsDir, instanceId);
    await model.save(`file://${modelPath}`);
    console.log(`💾 Saved model: ${modelPath}`);
  }

  /**
   * Load model from disk
   */
  private async loadModel(instanceId: string): Promise<tf.LayersModel> {
    const modelPath = join(this.modelsDir, instanceId, 'model.json');
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log(`📂 Loaded model: ${instanceId}`);
    return model;
  }

  /**
   * Load instances from database
   */
  private async loadInstancesFromDatabase(): Promise<void> {
    try {
      const result = await this.dbPool.query(`
        SELECT * FROM neural_network_instances
        WHERE status != 'archived'
        ORDER BY created_at DESC
      `);

      for (const row of result.rows) {
        const instance: NeuralNetworkInstance = {
          id: row.id,
          clientId: row.client_id,
          modelType: row.model_type,
          status: row.status,
          version: row.version,
          trainingConfig: row.training_config,
          dataConfig: row.data_config,
          architecture: row.architecture,
          performance: row.performance,
          deployment: row.deployment,
          metadata: row.metadata
        };
        this.instances.set(instance.id, instance);
      }
    } catch (error) {
      console.warn('Could not load instances from database:', error);
    }
  }

  /**
   * Load active models into memory
   */
  private async loadActiveModels(): Promise<void> {
    for (const instance of this.instances.values()) {
      if (instance.status === 'ready') {
        try {
          const model = await this.loadModel(instance.id);
          this.models.set(instance.id, model);
        } catch (error) {
          console.warn(`Could not load model for ${instance.id}:`, error);
        }
      }
    }
  }

  /**
   * Save instance to database
   */
  private async saveInstanceToDatabase(instance: NeuralNetworkInstance): Promise<void> {
    await this.dbPool.query(`
      INSERT INTO neural_network_instances (
        id, client_id, model_type, status, version,
        training_config, data_config, architecture,
        performance, deployment, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
      instance.id,
      instance.clientId,
      instance.modelType,
      instance.status,
      instance.version,
      JSON.stringify(instance.trainingConfig),
      JSON.stringify(instance.dataConfig),
      JSON.stringify(instance.architecture),
      JSON.stringify(instance.performance),
      JSON.stringify(instance.deployment),
      JSON.stringify(instance.metadata)
    ]);
  }

  /**
   * Update instance in database
   */
  private async updateInstanceInDatabase(instance: NeuralNetworkInstance): Promise<void> {
    await this.dbPool.query(`
      UPDATE neural_network_instances
      SET status = $1, version = $2, performance = $3,
          metadata = $4, updated_at = NOW()
      WHERE id = $5
    `, [
      instance.status,
      instance.version,
      JSON.stringify(instance.performance),
      JSON.stringify(instance.metadata),
      instance.id
    ]);
  }

  /**
   * Save instance configuration to file
   */
  private saveInstanceConfig(instance: NeuralNetworkInstance): void {
    const configPath = join(this.configDir, `${instance.id}.json`);
    writeFileSync(configPath, JSON.stringify(instance, null, 2));
  }

  /**
   * Increment semantic version
   */
  private incrementVersion(version: string): string {
    const match = version.match(/^v(\d+)\.(\d+)\.(\d+)$/);
    if (!match) return 'v1.0.0';
    
    const [, major, minor, patch] = match;
    return `v${major}.${minor}.${parseInt(patch) + 1}`;
  }
}
