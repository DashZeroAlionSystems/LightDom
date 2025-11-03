/**
 * TensorFlow Service
 * Manages TensorFlow.js models, training, and inference
 */

import * as tf from '@tensorflow/tfjs';

export interface ModelConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'sequence' | 'generation';
  architecture: LayerConfig[];
  hyperparameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
    validationSplit: number;
  };
}

export interface LayerConfig {
  type: string;
  units?: number;
  activation?: string;
  inputShape?: number[];
  returnSequences?: boolean;
  dropout?: number;
}

export interface TrainingData {
  inputs: number[][];
  labels: number[][];
}

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface ModelMetrics {
  accuracy: number;
  loss: number;
  valAccuracy?: number;
  valLoss?: number;
  trainingTime: number;
  totalEpochs: number;
}

export class TensorFlowService {
  private models: Map<string, tf.LayersModel> = new Map();
  private trainingCallbacks: Map<string, ((progress: TrainingProgress) => void)[]> = new Map();

  /**
   * Initialize TensorFlow backend
   */
  async initialize(): Promise<void> {
    await tf.ready();
    console.log('TensorFlow.js initialized. Backend:', tf.getBackend());
  }

  /**
   * Create a model from configuration
   */
  createModel(config: ModelConfig): tf.LayersModel {
    const model = tf.sequential();

    config.architecture.forEach((layerConfig, index) => {
      const layer = this.createLayer(layerConfig, index === 0);
      model.add(layer);
    });

    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: config.type === 'classification' ? 'categoricalCrossentropy' : 'meanSquaredError',
      metrics: ['accuracy'],
    });

    this.models.set(config.id, model);
    return model;
  }

  /**
   * Create a single layer
   */
  private createLayer(config: LayerConfig, isFirstLayer: boolean): tf.layers.Layer {
    const baseConfig: any = {};
    
    if (isFirstLayer && config.inputShape) {
      baseConfig.inputShape = config.inputShape;
    }

    switch (config.type.toLowerCase()) {
      case 'dense':
        return tf.layers.dense({
          units: config.units || 64,
          activation: config.activation,
          ...baseConfig,
        });
      
      case 'lstm':
        return tf.layers.lstm({
          units: config.units || 64,
          returnSequences: config.returnSequences,
          ...baseConfig,
        });
      
      case 'dropout':
        return tf.layers.dropout({
          rate: config.dropout || 0.2,
        });
      
      case 'embedding':
        return tf.layers.embedding({
          inputDim: config.units || 1000,
          outputDim: config.inputShape?.[0] || 128,
          ...baseConfig,
        });
      
      case 'conv2d':
        return tf.layers.conv2d({
          filters: config.units || 32,
          kernelSize: 3,
          activation: config.activation,
          ...baseConfig,
        });
      
      case 'maxpooling2d':
        return tf.layers.maxPooling2d({
          poolSize: [2, 2],
        });
      
      case 'flatten':
        return tf.layers.flatten();
      
      default:
        throw new Error(`Unsupported layer type: ${config.type}`);
    }
  }

  /**
   * Train a model
   */
  async trainModel(
    modelId: string,
    data: TrainingData,
    config: ModelConfig,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<ModelMetrics> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const startTime = Date.now();

    // Convert data to tensors
    const xs = tf.tensor2d(data.inputs);
    const ys = tf.tensor2d(data.labels);

    // Training callbacks
    const callbacks: tf.CustomCallbackArgs = {
      onEpochEnd: async (epoch, logs) => {
        const progress: TrainingProgress = {
          epoch: epoch + 1,
          loss: logs?.loss || 0,
          accuracy: logs?.accuracy || 0,
          valLoss: logs?.val_loss,
          valAccuracy: logs?.val_accuracy,
        };
        
        if (onProgress) {
          onProgress(progress);
        }

        // Store callbacks for later use
        const callbacks = this.trainingCallbacks.get(modelId) || [];
        callbacks.forEach(cb => cb(progress));
      },
    };

    // Train the model
    const history = await model.fit(xs, ys, {
      epochs: config.hyperparameters.epochs,
      batchSize: config.hyperparameters.batchSize,
      validationSplit: config.hyperparameters.validationSplit,
      callbacks,
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    const trainingTime = Date.now() - startTime;
    const lastEpoch = history.history.loss.length - 1;

    return {
      accuracy: (history.history.accuracy?.[lastEpoch] as number) || 0,
      loss: history.history.loss[lastEpoch],
      valAccuracy: (history.history.val_accuracy?.[lastEpoch] as number),
      valLoss: history.history.val_loss?.[lastEpoch],
      trainingTime,
      totalEpochs: config.hyperparameters.epochs,
    };
  }

  /**
   * Make predictions
   */
  async predict(modelId: string, input: number[][]): Promise<number[][]> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const inputTensor = tf.tensor2d(input);
    const predictions = model.predict(inputTensor) as tf.Tensor;
    const result = await predictions.array() as number[][];
    
    inputTensor.dispose();
    predictions.dispose();
    
    return result;
  }

  /**
   * Save model
   */
  async saveModel(modelId: string, savePath: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    await model.save(savePath);
  }

  /**
   * Load model
   */
  async loadModel(modelId: string, loadPath: string): Promise<void> {
    const model = await tf.loadLayersModel(loadPath);
    this.models.set(modelId, model);
  }

  /**
   * Get model summary
   */
  getModelSummary(modelId: string): string {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    let summary = '';
    model.summary(undefined, undefined, (line) => {
      summary += line + '\n';
    });
    
    return summary;
  }

  /**
   * Register training callback
   */
  onTrainingProgress(modelId: string, callback: (progress: TrainingProgress) => void): void {
    const callbacks = this.trainingCallbacks.get(modelId) || [];
    callbacks.push(callback);
    this.trainingCallbacks.set(modelId, callbacks);
  }

  /**
   * Dispose model and free memory
   */
  disposeModel(modelId: string): void {
    const model = this.models.get(modelId);
    if (model) {
      model.dispose();
      this.models.delete(modelId);
      this.trainingCallbacks.delete(modelId);
    }
  }

  /**
   * Get memory info
   */
  getMemoryInfo(): tf.MemoryInfo {
    return tf.memory();
  }

  /**
   * Generate sample training data (for demo purposes)
   */
  generateSampleData(
    numSamples: number,
    inputDim: number,
    outputDim: number
  ): TrainingData {
    const inputs: number[][] = [];
    const labels: number[][] = [];

    for (let i = 0; i < numSamples; i++) {
      const input = Array(inputDim).fill(0).map(() => Math.random());
      const label = Array(outputDim).fill(0).map(() => Math.random());
      
      inputs.push(input);
      labels.push(label);
    }

    return { inputs, labels };
  }
}

// Singleton instance
export const tensorFlowService = new TensorFlowService();
