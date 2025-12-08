/**
 * UI/UX Neural Network Training System
 * 
 * This module trains neural networks to understand what makes great UI/UX
 * by analyzing component patterns, user interactions, and design metrics.
 */

import * as tf from '@tensorflow/tfjs';
import { EventEmitter } from 'events';

export interface UIUXMetrics {
  accessibility: {
    contrastRatio: number;
    ariaCompliance: number;
    keyboardNavigation: number;
    semanticHTML: number;
    score: number;
  };
  performance: {
    renderTime: number;
    interactionTime: number;
    layoutShifts: number;
    resourceSize: number;
    score: number;
  };
  aesthetics: {
    colorHarmony: number;
    spacing: number;
    typography: number;
    visualHierarchy: number;
    score: number;
  };
  usability: {
    clickTargetSize: number;
    formValidation: number;
    errorHandling: number;
    consistency: number;
    score: number;
  };
  overallScore: number;
}

export interface ComponentFeatures {
  // Visual features
  colors: number[];
  spacing: number[];
  typography: {
    sizes: number[];
    weights: number[];
    lineHeights: number[];
  };
  
  // Layout features
  layoutType: string;
  gridColumns: number;
  flexDirection: string;
  
  // Interactive features
  hasHoverStates: boolean;
  hasFocusStates: boolean;
  hasActiveStates: boolean;
  hasAnimations: boolean;
  
  // Accessibility features
  hasAriaLabels: boolean;
  hasSemanticHTML: boolean;
  keyboardAccessible: boolean;
  screenReaderOptimized: boolean;
  
  // Content features
  textLength: number;
  imageCount: number;
  iconCount: number;
  
  // Metadata
  componentType: string;
  complexity: number;
  userInteractions: number;
}

export interface TrainingData {
  features: ComponentFeatures;
  metrics: UIUXMetrics;
  userRating?: number;
  timestamp: number;
}

export interface ModelConfig {
  architecture: {
    inputSize: number;
    hiddenLayers: number[];
    outputSize: number;
    activation: string;
  };
  training: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    validationSplit: number;
    optimizer: 'adam' | 'sgd' | 'rmsprop';
  };
}

export class UIUXNeuralNetwork extends EventEmitter {
  private model: tf.LayersModel | null = null;
  private trainingData: TrainingData[] = [];
  private isTraining: boolean = false;
  private modelConfig: ModelConfig;
  
  constructor(config?: Partial<ModelConfig>) {
    super();
    this.modelConfig = {
      architecture: {
        inputSize: 50, // Feature vector size
        hiddenLayers: [128, 64, 32],
        outputSize: 5, // accessibility, performance, aesthetics, usability, overall
        activation: 'relu',
      },
      training: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2,
        optimizer: 'adam',
      },
      ...config,
    };
  }

  /**
   * Initialize the neural network model
   */
  async initializeModel(): Promise<void> {
    const { architecture } = this.modelConfig;
    
    // Create sequential model
    this.model = tf.sequential();
    
    // Input layer
    this.model.add(tf.layers.dense({
      inputShape: [architecture.inputSize],
      units: architecture.hiddenLayers[0],
      activation: architecture.activation,
      kernelInitializer: 'heNormal',
    }));
    
    // Dropout for regularization
    this.model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Hidden layers
    for (let i = 1; i < architecture.hiddenLayers.length; i++) {
      this.model.add(tf.layers.dense({
        units: architecture.hiddenLayers[i],
        activation: architecture.activation,
        kernelInitializer: 'heNormal',
      }));
      
      this.model.add(tf.layers.dropout({ rate: 0.2 }));
    }
    
    // Output layer (scores for each metric category + overall)
    this.model.add(tf.layers.dense({
      units: architecture.outputSize,
      activation: 'sigmoid', // Output scores between 0-1
    }));
    
    // Compile model
    const { training } = this.modelConfig;
    this.model.compile({
      optimizer: tf.train.adam(training.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae', 'mse'],
    });
    
    this.emit('model:initialized', { 
      summary: this.model.summary(),
      config: this.modelConfig,
    });
  }

  /**
   * Extract features from component data
   */
  extractFeatures(componentData: any): number[] {
    const features: number[] = [];
    
    // Color features (RGB values normalized)
    if (componentData.colors) {
      componentData.colors.forEach((color: string) => {
        const rgb = this.hexToRgb(color);
        features.push(rgb.r / 255, rgb.g / 255, rgb.b / 255);
      });
    }
    
    // Padding to ensure consistent size
    while (features.length < 15) features.push(0);
    
    // Spacing features (normalized)
    if (componentData.spacing) {
      const spacingNorm = componentData.spacing.map((s: number) => s / 100);
      features.push(...spacingNorm.slice(0, 5));
    }
    while (features.length < 20) features.push(0);
    
    // Typography features
    if (componentData.typography) {
      features.push(
        ...componentData.typography.sizes.slice(0, 3).map((s: number) => s / 100),
        ...componentData.typography.weights.slice(0, 3).map((w: number) => w / 1000)
      );
    }
    while (features.length < 29) features.push(0);
    
    // Layout features (one-hot encoded)
    const layoutTypes = ['flex', 'grid', 'absolute', 'relative', 'fixed'];
    const layoutIdx = layoutTypes.indexOf(componentData.layoutType || 'flex');
    for (let i = 0; i < layoutTypes.length; i++) {
      features.push(i === layoutIdx ? 1 : 0);
    }
    
    // Boolean features
    features.push(
      componentData.hasHoverStates ? 1 : 0,
      componentData.hasFocusStates ? 1 : 0,
      componentData.hasActiveStates ? 1 : 0,
      componentData.hasAnimations ? 1 : 0,
      componentData.hasAriaLabels ? 1 : 0,
      componentData.hasSemanticHTML ? 1 : 0,
      componentData.keyboardAccessible ? 1 : 0,
      componentData.screenReaderOptimized ? 1 : 0
    );
    
    // Numeric features (normalized)
    features.push(
      (componentData.textLength || 0) / 1000,
      (componentData.imageCount || 0) / 10,
      (componentData.iconCount || 0) / 10,
      (componentData.complexity || 0) / 10,
      (componentData.userInteractions || 0) / 1000
    );
    
    // Ensure exact size
    return features.slice(0, this.modelConfig.architecture.inputSize);
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Add training data
   */
  addTrainingData(data: TrainingData): void {
    this.trainingData.push(data);
    this.emit('data:added', { 
      count: this.trainingData.length,
      data,
    });
  }

  /**
   * Train the model
   */
  async train(): Promise<void> {
    if (!this.model) {
      await this.initializeModel();
    }
    
    if (this.trainingData.length < 10) {
      throw new Error('Insufficient training data. Need at least 10 samples.');
    }
    
    this.isTraining = true;
    this.emit('training:started');
    
    try {
      // Prepare training data
      const xs: number[][] = [];
      const ys: number[][] = [];
      
      for (const data of this.trainingData) {
        const features = this.extractFeatures(data.features);
        xs.push(features);
        
        // Target: [accessibility, performance, aesthetics, usability, overall]
        ys.push([
          data.metrics.accessibility.score,
          data.metrics.performance.score,
          data.metrics.aesthetics.score,
          data.metrics.usability.score,
          data.metrics.overallScore,
        ]);
      }
      
      const xTensor = tf.tensor2d(xs);
      const yTensor = tf.tensor2d(ys);
      
      // Train model
      const { training } = this.modelConfig;
      const history = await this.model!.fit(xTensor, yTensor, {
        epochs: training.epochs,
        batchSize: training.batchSize,
        validationSplit: training.validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.emit('training:progress', {
              epoch: epoch + 1,
              totalEpochs: training.epochs,
              loss: logs?.loss,
              valLoss: logs?.val_loss,
              mae: logs?.mae,
              valMae: logs?.val_mae,
            });
          },
        },
      });
      
      // Cleanup tensors
      xTensor.dispose();
      yTensor.dispose();
      
      this.emit('training:completed', { 
        history: history.history,
      });
    } catch (error) {
      this.emit('training:error', { error });
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Predict UI/UX quality metrics for a component
   */
  async predict(componentData: any): Promise<UIUXMetrics> {
    if (!this.model) {
      throw new Error('Model not initialized. Call initializeModel() first.');
    }
    
    const features = this.extractFeatures(componentData);
    const input = tf.tensor2d([features]);
    
    const prediction = this.model.predict(input) as tf.Tensor;
    const scores = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    return {
      accessibility: {
        contrastRatio: 0,
        ariaCompliance: 0,
        keyboardNavigation: 0,
        semanticHTML: 0,
        score: scores[0],
      },
      performance: {
        renderTime: 0,
        interactionTime: 0,
        layoutShifts: 0,
        resourceSize: 0,
        score: scores[1],
      },
      aesthetics: {
        colorHarmony: 0,
        spacing: 0,
        typography: 0,
        visualHierarchy: 0,
        score: scores[2],
      },
      usability: {
        clickTargetSize: 0,
        formValidation: 0,
        errorHandling: 0,
        consistency: 0,
        score: scores[3],
      },
      overallScore: scores[4],
    };
  }

  /**
   * Save model to file or IndexedDB
   */
  async saveModel(path: string = 'indexeddb://uiux-model'): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    await this.model.save(path);
    this.emit('model:saved', { path });
  }

  /**
   * Load model from file or IndexedDB
   */
  async loadModel(path: string = 'indexeddb://uiux-model'): Promise<void> {
    this.model = await tf.loadLayersModel(path);
    this.emit('model:loaded', { path });
  }

  /**
   * Get model summary
   */
  getModelSummary(): string {
    if (!this.model) {
      return 'Model not initialized';
    }
    
    return JSON.stringify({
      layers: this.model.layers.length,
      trainableParams: this.model.countParams(),
      config: this.modelConfig,
    }, null, 2);
  }

  /**
   * Evaluate model on test data
   */
  async evaluate(testData: TrainingData[]): Promise<any> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    
    const xs: number[][] = [];
    const ys: number[][] = [];
    
    for (const data of testData) {
      const features = this.extractFeatures(data.features);
      xs.push(features);
      
      ys.push([
        data.metrics.accessibility.score,
        data.metrics.performance.score,
        data.metrics.aesthetics.score,
        data.metrics.usability.score,
        data.metrics.overallScore,
      ]);
    }
    
    const xTensor = tf.tensor2d(xs);
    const yTensor = tf.tensor2d(ys);
    
    const result = await this.model.evaluate(xTensor, yTensor);
    
    xTensor.dispose();
    yTensor.dispose();
    
    if (Array.isArray(result)) {
      const values = await Promise.all(result.map(t => t.data()));
      result.forEach(t => t.dispose());
      return {
        loss: values[0][0],
        mae: values[1][0],
        mse: values[2][0],
      };
    }
    
    const value = await result.data();
    result.dispose();
    return { loss: value[0] };
  }

  /**
   * Get training status
   */
  getTrainingStatus(): { isTraining: boolean; dataCount: number } {
    return {
      isTraining: this.isTraining,
      dataCount: this.trainingData.length,
    };
  }
}
