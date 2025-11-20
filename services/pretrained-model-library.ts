/**
 * Pretrained Model Library Service
 * 
 * Manages pretrained TensorFlow models for SEO optimization
 * Supports model versioning, loading, and transfer learning
 */

import * as tf from '@tensorflow/tfjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

const requireTF = createRequire(import.meta.url);

// Initialize TensorFlow backend
const TENSORFLOW_BACKEND = (() => {
  try {
    requireTF('@tensorflow/tfjs-node');
    if (typeof tf.setBackend === 'function' && typeof tf.findBackend === 'function' && tf.findBackend('tensorflow')) {
      tf.setBackend('tensorflow').catch(() => {});
    }
    console.log('PretrainedModelLibrary: native TensorFlow backend enabled');
    return 'tensorflow';
  } catch (err) {
    console.warn('PretrainedModelLibrary: using @tensorflow/tfjs fallback');
    return 'tfjs';
  }
})();

const TF_NODE_AVAILABLE = TENSORFLOW_BACKEND === 'tensorflow';

export interface PretrainedModelMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  architecture: string;
  inputDimensions: number;
  outputDimensions: number;
  trainedOn: string;
  accuracy?: number;
  loss?: number;
  trainingDate: string;
  tags: string[];
  path: string;
}

export interface TransferLearningConfig {
  freezeLayers?: number[];
  learningRate?: number;
  fineTuneEpochs?: number;
  fineTuneBatchSize?: number;
}

export class PretrainedModelLibrary {
  private modelsDir: string;
  private registryPath: string;
  private registry: Map<string, PretrainedModelMetadata>;

  constructor(modelsDir?: string) {
    this.modelsDir = modelsDir || join(__dirname, '../models/pretrained');
    this.registryPath = join(this.modelsDir, 'registry.json');
    this.registry = new Map();
    
    this.initialize();
  }

  /**
   * Initialize the library
   */
  private initialize(): void {
    // Ensure directories exist
    if (!existsSync(this.modelsDir)) {
      mkdirSync(this.modelsDir, { recursive: true });
    }

    // Load registry
    this.loadRegistry();

    console.log('✅ Pretrained Model Library initialized');
    console.log(`   Models directory: ${this.modelsDir}`);
    console.log(`   Registered models: ${this.registry.size}`);
  }

  /**
   * Load model registry
   */
  private loadRegistry(): void {
    if (existsSync(this.registryPath)) {
      try {
        const data = JSON.parse(readFileSync(this.registryPath, 'utf-8'));
        this.registry = new Map(Object.entries(data));
        console.log(`📚 Loaded ${this.registry.size} pretrained models from registry`);
      } catch (error) {
        console.error('Failed to load registry:', error);
        this.registry = new Map();
      }
    } else {
      // Create empty registry
      this.saveRegistry();
    }
  }

  /**
   * Save model registry
   */
  private saveRegistry(): void {
    const data = Object.fromEntries(this.registry);
    writeFileSync(this.registryPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Register a new pretrained model
   */
  registerModel(metadata: PretrainedModelMetadata): void {
    console.log(`📝 Registering pretrained model: ${metadata.id}`);
    
    this.registry.set(metadata.id, metadata);
    this.saveRegistry();

    console.log(`✅ Model registered: ${metadata.name} v${metadata.version}`);
  }

  /**
   * Get pretrained model metadata
   */
  getModelMetadata(modelId: string): PretrainedModelMetadata | undefined {
    return this.registry.get(modelId);
  }

  /**
   * List all available pretrained models
   */
  listModels(filter?: { tags?: string[]; architecture?: string }): PretrainedModelMetadata[] {
    let models = Array.from(this.registry.values());

    if (filter) {
      if (filter.tags && filter.tags.length > 0) {
        models = models.filter(m => 
          filter.tags!.some(tag => m.tags.includes(tag))
        );
      }

      if (filter.architecture) {
        models = models.filter(m => m.architecture === filter.architecture);
      }
    }

    return models;
  }

  /**
   * Load a pretrained model
   */
  async loadModel(modelId: string): Promise<tf.LayersModel> {
    const metadata = this.registry.get(modelId);
    if (!metadata) {
      throw new Error(`Pretrained model not found: ${modelId}`);
    }

    if (!TF_NODE_AVAILABLE) {
      throw new Error('TensorFlow native bindings are required to load pretrained models. Install @tensorflow/tfjs-node.');
    }

    console.log(`📂 Loading pretrained model: ${metadata.name} v${metadata.version}`);

    const modelPath = metadata.path;
    if (!existsSync(modelPath)) {
      throw new Error(`Model files not found at ${modelPath}`);
    }

    const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);

    console.log(`✅ Pretrained model loaded successfully`);
    console.log(`   Architecture: ${metadata.architecture}`);
    console.log(`   Input dims: ${metadata.inputDimensions}`);
    console.log(`   Output dims: ${metadata.outputDimensions}`);
    console.log(`   Accuracy: ${metadata.accuracy?.toFixed(4) || 'N/A'}`);

    return model;
  }

  /**
   * Clone a pretrained model for transfer learning
   */
  async cloneModelForTransferLearning(
    modelId: string,
    config?: TransferLearningConfig
  ): Promise<tf.LayersModel> {
    const baseModel = await this.loadModel(modelId);

    console.log('🔄 Preparing model for transfer learning...');

    // Clone the model
    const clonedModel = tf.sequential();

    // Copy layers from base model
    baseModel.layers.forEach((layer, index) => {
      const clonedLayer = layer;
      
      // Freeze specified layers
      if (config?.freezeLayers && config.freezeLayers.includes(index)) {
        clonedLayer.trainable = false;
        console.log(`   ❄️  Frozen layer ${index}: ${layer.name}`);
      } else {
        clonedLayer.trainable = true;
        console.log(`   🔥 Trainable layer ${index}: ${layer.name}`);
      }

      clonedModel.add(clonedLayer);
    });

    // Recompile with new learning rate if specified
    const learningRate = config?.learningRate || 0.0001; // Lower LR for fine-tuning
    
    clonedModel.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    console.log('✅ Model prepared for transfer learning');
    console.log(`   Learning rate: ${learningRate}`);
    console.log(`   Frozen layers: ${config?.freezeLayers?.length || 0}`);

    return clonedModel;
  }

  /**
   * Create a base pretrained model
   * This is the default model architecture used across all SEO campaigns
   */
  async createBaseModel(
    modelId: string = 'base-seo-optimizer-v1',
    config?: {
      inputDimensions?: number;
      hiddenLayers?: number[];
      outputDimensions?: number;
    }
  ): Promise<void> {
    console.log('🏗️  Creating base pretrained model...');

    const inputDims = config?.inputDimensions || 192;
    const hiddenLayers = config?.hiddenLayers || [256, 128, 64];
    const outputDims = config?.outputDimensions || 50;

    // Build model
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      inputShape: [inputDims],
      units: hiddenLayers[0],
      activation: 'relu',
      kernelInitializer: 'glorotUniform'
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Hidden layers
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
      units: outputDims,
      activation: 'sigmoid'
    }));

    // Compile
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Save model
    const modelPath = join(this.modelsDir, modelId);
    if (!existsSync(modelPath)) {
      mkdirSync(modelPath, { recursive: true });
    }

    if (!TF_NODE_AVAILABLE) {
      throw new Error('TensorFlow native bindings are required to save models. Install @tensorflow/tfjs-node.');
    }

    await model.save(`file://${modelPath}`);

    // Register metadata
    const metadata: PretrainedModelMetadata = {
      id: modelId,
      name: 'Base SEO Optimizer',
      version: '1.0.0',
      description: 'Default pretrained model for SEO optimization with 192 input attributes',
      architecture: 'sequential',
      inputDimensions: inputDims,
      outputDimensions: outputDims,
      trainedOn: 'Synthetic SEO data',
      trainingDate: new Date().toISOString(),
      tags: ['seo', 'base', 'pretrained', 'default'],
      path: modelPath
    };

    this.registerModel(metadata);

    console.log('✅ Base pretrained model created and registered');
    console.log(`   Model ID: ${modelId}`);
    console.log(`   Path: ${modelPath}`);
  }

  /**
   * Import a pretrained model from external source
   */
  async importModel(
    sourcePath: string,
    metadata: Omit<PretrainedModelMetadata, 'path'>
  ): Promise<void> {
    console.log(`📥 Importing pretrained model from: ${sourcePath}`);

    if (!existsSync(sourcePath)) {
      throw new Error(`Source path not found: ${sourcePath}`);
    }

    // Load model to validate
    const model = await tf.loadLayersModel(`file://${sourcePath}/model.json`);

    // Copy to library
    const destPath = join(this.modelsDir, metadata.id);
    if (!existsSync(destPath)) {
      mkdirSync(destPath, { recursive: true });
    }

    await model.save(`file://${destPath}`);

    // Register
    this.registerModel({
      ...metadata,
      path: destPath
    });

    console.log('✅ Model imported successfully');
  }

  /**
   * Delete a pretrained model
   */
  deleteModel(modelId: string): void {
    const metadata = this.registry.get(modelId);
    if (!metadata) {
      throw new Error(`Model not found: ${modelId}`);
    }

    this.registry.delete(modelId);
    this.saveRegistry();

    console.log(`🗑️  Model deleted from registry: ${modelId}`);
  }

  /**
   * Get recommended model for a use case
   */
  getRecommendedModel(useCase: 'ecommerce' | 'blog' | 'saas' | 'general'): string {
    const models = this.listModels();

    // Find model with matching tags
    const recommended = models.find(m => m.tags.includes(useCase));
    
    if (recommended) {
      return recommended.id;
    }

    // Fall back to base model
    return 'base-seo-optimizer-v1';
  }

  /**
   * Get statistics about the library
   */
  getStatistics(): {
    totalModels: number;
    modelsByArchitecture: { [key: string]: number };
    modelsByTags: { [key: string]: number };
    avgAccuracy: number;
  } {
    const models = Array.from(this.registry.values());

    const modelsByArchitecture: { [key: string]: number } = {};
    const modelsByTags: { [key: string]: number } = {};
    let totalAccuracy = 0;
    let modelsWithAccuracy = 0;

    models.forEach(model => {
      // Count by architecture
      modelsByArchitecture[model.architecture] = 
        (modelsByArchitecture[model.architecture] || 0) + 1;

      // Count by tags
      model.tags.forEach(tag => {
        modelsByTags[tag] = (modelsByTags[tag] || 0) + 1;
      });

      // Accumulate accuracy
      if (model.accuracy !== undefined) {
        totalAccuracy += model.accuracy;
        modelsWithAccuracy++;
      }
    });

    return {
      totalModels: models.length,
      modelsByArchitecture,
      modelsByTags,
      avgAccuracy: modelsWithAccuracy > 0 ? totalAccuracy / modelsWithAccuracy : 0
    };
  }
}

// Singleton instance
let libraryInstance: PretrainedModelLibrary | null = null;

/**
 * Get singleton instance of PretrainedModelLibrary
 */
export function getPretrainedModelLibrary(modelsDir?: string): PretrainedModelLibrary {
  if (!libraryInstance) {
    libraryInstance = new PretrainedModelLibrary(modelsDir);
  }
  return libraryInstance;
}

export default PretrainedModelLibrary;
