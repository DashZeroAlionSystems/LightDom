/**
 * TensorFlow Model Manager
 * 
 * Manages per-client TensorFlow model instances for SEO optimization
 * Supports prompt-based training configuration and model lifecycle management
 */

import * as tf from '@tensorflow/tfjs-node';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface ModelConfig {
  inputDimensions?: number;
  hiddenLayers?: number[];
  outputDimensions?: number;
  learningRate?: number;
  batchSize?: number;
  epochs?: number;
  validationSplit?: number;
  modelArchitecture?: 'transformer' | 'cnn' | 'rnn' | 'sequential';
  dropout?: number;
  activation?: string;
}

export interface TrainingData {
  inputs: number[];
  outputs: number[];
  metadata?: any;
}

export interface ModelMetrics {
  loss: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  trainingTime?: number;
  lastTrained?: string;
}

export class TensorFlowModelManager {
  private models: Map<string, tf.LayersModel> = new Map();
  private configs: Map<string, ModelConfig> = new Map();
  private metrics: Map<string, ModelMetrics> = new Map();
  private modelsDir: string;

  constructor(modelsDir?: string) {
    this.modelsDir = modelsDir || join(__dirname, '../models');
    if (!existsSync(this.modelsDir)) {
      mkdirSync(this.modelsDir, { recursive: true });
    }
  }

  /**
   * Create a new client model with specified configuration
   */
  async createClientModel(
    clientId: string,
    config: ModelConfig = {}
  ): Promise<tf.LayersModel> {
    console.log(`🧠 Creating TensorFlow model for client: ${clientId}`);

    const modelConfig: ModelConfig = {
      inputDimensions: config.inputDimensions || 192,
      hiddenLayers: config.hiddenLayers || [256, 128, 64],
      outputDimensions: config.outputDimensions || 50,
      learningRate: config.learningRate || 0.001,
      batchSize: config.batchSize || 32,
      epochs: config.epochs || 100,
      validationSplit: config.validationSplit || 0.2,
      modelArchitecture: config.modelArchitecture || 'sequential',
      dropout: config.dropout || 0.3,
      activation: config.activation || 'relu'
    };

    const model = await this.buildModel(modelConfig);
    
    this.models.set(clientId, model);
    this.configs.set(clientId, modelConfig);

    console.log(`✅ Model created for client ${clientId}`);
    console.log(`   Architecture: ${modelConfig.modelArchitecture}`);
    console.log(`   Input: ${modelConfig.inputDimensions}, Output: ${modelConfig.outputDimensions}`);

    return model;
  }

  /**
   * Build model based on configuration
   */
  private async buildModel(config: ModelConfig): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      inputShape: [config.inputDimensions!],
      units: config.hiddenLayers![0],
      activation: config.activation as any,
      kernelInitializer: 'glorotUniform'
    }));

    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: config.dropout }));

    // Hidden layers
    for (let i = 1; i < config.hiddenLayers!.length; i++) {
      model.add(tf.layers.dense({
        units: config.hiddenLayers![i],
        activation: config.activation as any
      }));

      // Batch normalization
      model.add(tf.layers.batchNormalization());

      // Dropout
      model.add(tf.layers.dropout({ rate: 0.2 }));
    }

    // Output layer
    model.add(tf.layers.dense({
      units: config.outputDimensions!,
      activation: 'sigmoid' // For multi-label classification
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Train a client's model with provided data
   */
  async trainModel(
    clientId: string,
    trainingData: TrainingData[],
    config?: Partial<ModelConfig>
  ): Promise<ModelMetrics> {
    const model = this.models.get(clientId);
    if (!model) {
      throw new Error(`Model not found for client ${clientId}`);
    }

    const modelConfig = this.configs.get(clientId);
    if (!modelConfig) {
      throw new Error(`Config not found for client ${clientId}`);
    }

    console.log(`🔥 Training model for client ${clientId}...`);
    console.log(`   Training samples: ${trainingData.length}`);

    const startTime = Date.now();

    // Prepare tensors
    const xs = tf.tensor2d(trainingData.map(d => d.inputs));
    const ys = tf.tensor2d(trainingData.map(d => d.outputs));

    // Train
    const history = await model.fit(xs, ys, {
      epochs: config?.epochs || modelConfig.epochs,
      batchSize: config?.batchSize || modelConfig.batchSize,
      validationSplit: config?.validationSplit || modelConfig.validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`   Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}, acc = ${logs?.acc?.toFixed(4)}`);
          }
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    const trainingTime = Date.now() - startTime;

    // Get final metrics
    const finalLogs = history.history;
    const metrics: ModelMetrics = {
      loss: finalLogs.loss[finalLogs.loss.length - 1] as number,
      accuracy: finalLogs.acc ? finalLogs.acc[finalLogs.acc.length - 1] as number : undefined,
      trainingTime,
      lastTrained: new Date().toISOString()
    };

    this.metrics.set(clientId, metrics);

    console.log(`✅ Training complete in ${(trainingTime / 1000).toFixed(2)}s`);
    console.log(`   Final loss: ${metrics.loss.toFixed(4)}`);
    console.log(`   Final accuracy: ${metrics.accuracy?.toFixed(4)}`);

    return metrics;
  }

  /**
   * Predict optimizations for given attributes
   */
  async predict(clientId: string, attributes: number[]): Promise<number[]> {
    const model = this.models.get(clientId);
    if (!model) {
      throw new Error(`Model not found for client ${clientId}`);
    }

    const config = this.configs.get(clientId);
    if (attributes.length !== config?.inputDimensions) {
      throw new Error(
        `Input dimension mismatch: expected ${config?.inputDimensions}, got ${attributes.length}`
      );
    }

    const input = tf.tensor2d([attributes]);
    const prediction = model.predict(input) as tf.Tensor;
    const result = Array.from(await prediction.data());

    // Clean up
    input.dispose();
    prediction.dispose();

    return result;
  }

  /**
   * Train model from natural language prompt
   */
  async trainFromPrompt(
    clientId: string,
    prompt: string,
    trainingData: TrainingData[]
  ): Promise<ModelMetrics> {
    console.log(`🤖 Parsing training configuration from prompt...`);
    console.log(`   Prompt: "${prompt.substring(0, 100)}..."`);

    const config = this.parsePrompt(prompt);
    
    // Create or get model
    if (!this.models.has(clientId)) {
      await this.createClientModel(clientId, config);
    }

    return await this.trainModel(clientId, trainingData, config);
  }

  /**
   * Parse natural language prompt to extract training configuration
   */
  private parsePrompt(prompt: string): Partial<ModelConfig> {
    const config: Partial<ModelConfig> = {};

    // Extract epochs
    const epochsMatch = prompt.match(/(\d+)\s*epochs?/i);
    if (epochsMatch) {
      config.epochs = parseInt(epochsMatch[1]);
    }

    // Extract batch size
    const batchMatch = prompt.match(/batch\s*size\s*(?:of\s*)?(\d+)/i);
    if (batchMatch) {
      config.batchSize = parseInt(batchMatch[1]);
    }

    // Extract learning rate
    const lrMatch = prompt.match(/learning\s*rate\s*(?:of\s*)?([0-9.]+)/i);
    if (lrMatch) {
      config.learningRate = parseFloat(lrMatch[1]);
    }

    // Extract architecture
    if (prompt.match(/transformer/i)) {
      config.modelArchitecture = 'transformer';
    } else if (prompt.match(/cnn|convolutional/i)) {
      config.modelArchitecture = 'cnn';
    } else if (prompt.match(/rnn|recurrent|lstm/i)) {
      config.modelArchitecture = 'rnn';
    }

    console.log(`   Parsed config:`, config);

    return config;
  }

  /**
   * Save model to disk
   */
  async saveModel(clientId: string): Promise<void> {
    const model = this.models.get(clientId);
    if (!model) {
      throw new Error(`Model not found for client ${clientId}`);
    }

    const modelPath = join(this.modelsDir, clientId);
    if (!existsSync(modelPath)) {
      mkdirSync(modelPath, { recursive: true });
    }

    const savePath = `file://${modelPath}`;
    await model.save(savePath);

    // Save config and metrics
    const config = this.configs.get(clientId);
    const metrics = this.metrics.get(clientId);

    writeFileSync(
      join(modelPath, 'config.json'),
      JSON.stringify({ config, metrics }, null, 2)
    );

    console.log(`💾 Model saved for client ${clientId} at ${modelPath}`);
  }

  /**
   * Load model from disk
   */
  async loadModel(clientId: string): Promise<tf.LayersModel> {
    const modelPath = join(this.modelsDir, clientId);
    if (!existsSync(modelPath)) {
      throw new Error(`Model not found at ${modelPath}`);
    }

    const loadPath = `file://${modelPath}/model.json`;
    const model = await tf.loadLayersModel(loadPath);

    this.models.set(clientId, model);

    // Load config and metrics
    const configPath = join(modelPath, 'config.json');
    if (existsSync(configPath)) {
      const data = JSON.parse(readFileSync(configPath, 'utf-8'));
      if (data.config) this.configs.set(clientId, data.config);
      if (data.metrics) this.metrics.set(clientId, data.metrics);
    }

    console.log(`📂 Model loaded for client ${clientId}`);

    return model;
  }

  /**
   * Delete model
   */
  deleteModel(clientId: string): void {
    const model = this.models.get(clientId);
    if (model) {
      model.dispose();
      this.models.delete(clientId);
      this.configs.delete(clientId);
      this.metrics.delete(clientId);
      console.log(`🗑️  Model deleted for client ${clientId}`);
    }
  }

  /**
   * Get model metrics
   */
  getMetrics(clientId: string): ModelMetrics | undefined {
    return this.metrics.get(clientId);
  }

  /**
   * Get model configuration
   */
  getConfig(clientId: string): ModelConfig | undefined {
    return this.configs.get(clientId);
  }

  /**
   * Check if model exists for client
   */
  hasModel(clientId: string): boolean {
    return this.models.has(clientId);
  }

  /**
   * Get all client IDs with models
   */
  getAllClientIds(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Get model statistics
   */
  getStats(): {
    totalModels: number;
    clientIds: string[];
    averageLoss?: number;
    averageAccuracy?: number;
  } {
    const clientIds = this.getAllClientIds();
    const allMetrics = clientIds
      .map(id => this.metrics.get(id))
      .filter(m => m !== undefined) as ModelMetrics[];

    const averageLoss = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.loss, 0) / allMetrics.length
      : undefined;

    const accuracies = allMetrics.filter(m => m.accuracy !== undefined);
    const averageAccuracy = accuracies.length > 0
      ? accuracies.reduce((sum, m) => sum + m.accuracy!, 0) / accuracies.length
      : undefined;

    return {
      totalModels: this.models.size,
      clientIds,
      averageLoss,
      averageAccuracy
    };
  }

  /**
   * Dispose all models and clean up
   */
  dispose(): void {
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();
    this.configs.clear();
    this.metrics.clear();
    console.log('🧹 All models disposed');
  }
}

// Singleton instance
let modelManagerInstance: TensorFlowModelManager | null = null;

/**
 * Get singleton instance of TensorFlowModelManager
 */
export function getTensorFlowModelManager(modelsDir?: string): TensorFlowModelManager {
  if (!modelManagerInstance) {
    modelManagerInstance = new TensorFlowModelManager(modelsDir);
  }
  return modelManagerInstance;
}

export default TensorFlowModelManager;
