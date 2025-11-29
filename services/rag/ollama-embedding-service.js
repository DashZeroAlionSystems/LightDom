/**
 * Ollama Embedding Service with Model Switching
 * 
 * Supports multiple embedding models with different use cases:
 * - mxbai-embed-large: Highest quality embeddings for precise semantic search (1024 dimensions)
 * - nomic-embed-text: Fast, efficient embeddings for general use (768 dimensions)
 * - all-minilm: Lightweight embeddings for resource-constrained environments (384 dimensions)
 * 
 * Features:
 * - Model switching at runtime
 * - Model preloading and availability checking
 * - Automatic dimension detection
 * - Batch embedding with configurable concurrency
 * - Embedding caching for performance
 * - Health monitoring and statistics
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

/**
 * Supported embedding models with their configurations
 */
export const EMBEDDING_MODELS = {
  'mxbai-embed-large': {
    name: 'mxbai-embed-large',
    description: 'Highest quality embeddings, best for precise semantic search',
    dimensions: 1024,
    contextLength: 512,
    useCase: 'high-quality',
    performance: 'slower',
    recommended: true,
  },
  'nomic-embed-text': {
    name: 'nomic-embed-text',
    description: 'Fast, efficient embeddings for general use',
    dimensions: 768,
    contextLength: 8192,
    useCase: 'general',
    performance: 'fast',
    recommended: false,
  },
  'all-minilm': {
    name: 'all-minilm',
    description: 'Lightweight embeddings for resource-constrained environments',
    dimensions: 384,
    contextLength: 256,
    useCase: 'lightweight',
    performance: 'fastest',
    recommended: false,
  },
  'snowflake-arctic-embed': {
    name: 'snowflake-arctic-embed',
    description: 'Enterprise-grade embeddings with strong performance',
    dimensions: 1024,
    contextLength: 512,
    useCase: 'enterprise',
    performance: 'medium',
    recommended: false,
  },
};

/**
 * Default model for different use cases
 */
export const DEFAULT_MODELS = {
  'high-quality': 'mxbai-embed-large',
  'general': 'nomic-embed-text',
  'lightweight': 'all-minilm',
  'enterprise': 'snowflake-arctic-embed',
  'codebase-indexing': 'mxbai-embed-large',  // Best for codebase indexing
};

/**
 * OllamaEmbeddingService - Advanced embedding service with model switching
 */
export class OllamaEmbeddingService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.baseUrl = (config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
    this.currentModel = config.model || process.env.EMBEDDING_MODEL || 'mxbai-embed-large';
    this.timeout = config.timeout || 60000;
    this.maxRetries = config.maxRetries || 3;
    this.batchSize = config.batchSize || 10;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cacheMaxSize = config.cacheMaxSize || 10000;
    
    // Cache for embeddings
    this.embeddingCache = new Map();
    
    // Statistics
    this.stats = {
      totalEmbeddings: 0,
      cacheHits: 0,
      cacheMisses: 0,
      modelSwitches: 0,
      errors: 0,
      lastUsed: null,
      modelUsage: {},
    };
    
    // Track available models
    this.availableModels = new Set();
    
    this.initialized = false;
  }

  /**
   * Initialize the embedding service
   */
  async initialize() {
    console.log(`🔄 Initializing OllamaEmbeddingService with model: ${this.currentModel}`);
    
    try {
      // Check Ollama connection
      await this.checkConnection();
      
      // Check if current model is available
      await this.ensureModelAvailable(this.currentModel);
      
      this.initialized = true;
      this.emit('initialized', { model: this.currentModel });
      console.log(`✅ OllamaEmbeddingService initialized with ${this.currentModel}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize OllamaEmbeddingService:', error.message);
      this.emit('error', { error });
      throw error;
    }
  }

  /**
   * Check Ollama connection
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Ollama connection failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update available models
      if (data.models) {
        for (const model of data.models) {
          this.availableModels.add(model.name);
        }
      }
      
      return true;
    } catch (error) {
      throw new Error(`Cannot connect to Ollama at ${this.baseUrl}: ${error.message}`);
    }
  }

  /**
   * Ensure a model is available, pulling if necessary
   */
  async ensureModelAvailable(modelName) {
    // Check if already available
    if (this.availableModels.has(modelName)) {
      return true;
    }
    
    // Try to check via tags
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      
      const data = await response.json();
      const models = data.models || [];
      
      const found = models.some(m => m.name === modelName || m.name.startsWith(`${modelName}:`));
      
      if (found) {
        this.availableModels.add(modelName);
        return true;
      }
    } catch (error) {
      // Continue to pull
    }
    
    // Pull the model
    console.log(`📥 Pulling embedding model: ${modelName}`);
    this.emit('model:pulling', { model: modelName });
    
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: false }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to pull model ${modelName}: ${text}`);
      }
      
      this.availableModels.add(modelName);
      this.emit('model:pulled', { model: modelName });
      console.log(`✅ Successfully pulled model: ${modelName}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to pull model ${modelName}:`, error.message);
      throw error;
    }
  }

  /**
   * Switch to a different embedding model
   */
  async switchModel(modelName, options = {}) {
    const { pullIfMissing = true, clearCache = false } = options;
    
    // Validate model
    const modelInfo = EMBEDDING_MODELS[modelName];
    if (!modelInfo && !options.allowUnknown) {
      const available = Object.keys(EMBEDDING_MODELS).join(', ');
      throw new Error(`Unknown model: ${modelName}. Available: ${available}`);
    }
    
    console.log(`🔄 Switching embedding model from ${this.currentModel} to ${modelName}`);
    this.emit('model:switching', { from: this.currentModel, to: modelName });
    
    // Ensure model is available
    if (pullIfMissing) {
      await this.ensureModelAvailable(modelName);
    }
    
    const previousModel = this.currentModel;
    this.currentModel = modelName;
    this.stats.modelSwitches++;
    
    // Clear cache if dimensions changed or requested
    if (clearCache || (modelInfo && EMBEDDING_MODELS[previousModel]?.dimensions !== modelInfo.dimensions)) {
      this.clearCache();
      console.log('🗑️ Cache cleared due to model switch');
    }
    
    this.emit('model:switched', { from: previousModel, to: modelName });
    console.log(`✅ Switched to model: ${modelName}`);
    
    return {
      previousModel,
      currentModel: modelName,
      modelInfo: modelInfo || { name: modelName, dimensions: 'unknown' },
    };
  }

  /**
   * Get current model information
   */
  getModelInfo() {
    return {
      currentModel: this.currentModel,
      info: EMBEDDING_MODELS[this.currentModel] || { name: this.currentModel, dimensions: 'unknown' },
      availableModels: Array.from(this.availableModels),
      supportedModels: Object.keys(EMBEDDING_MODELS),
    };
  }

  /**
   * List all supported models with their configurations
   */
  listModels() {
    return Object.entries(EMBEDDING_MODELS).map(([name, info]) => ({
      ...info,
      available: this.availableModels.has(name),
      current: this.currentModel === name,
    }));
  }

  /**
   * Get best model for a specific use case
   */
  getBestModelForUseCase(useCase) {
    const modelName = DEFAULT_MODELS[useCase];
    if (modelName) {
      return EMBEDDING_MODELS[modelName];
    }
    return EMBEDDING_MODELS['mxbai-embed-large']; // Default to highest quality
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text, options = {}) {
    const result = await this.embedBatch([text], options);
    return result[0];
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async embedBatch(texts, options = {}) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }
    
    const model = options.model || this.currentModel;
    const useCache = options.useCache !== false && this.cacheEnabled;
    
    const embeddings = [];
    const textsToEmbed = [];
    const indexMap = [];
    
    // Check cache
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const cacheKey = this.getCacheKey(text, model);
      
      if (useCache && this.embeddingCache.has(cacheKey)) {
        embeddings[i] = this.embeddingCache.get(cacheKey);
        this.stats.cacheHits++;
      } else {
        textsToEmbed.push(text);
        indexMap.push(i);
        this.stats.cacheMisses++;
      }
    }
    
    // Generate embeddings for cache misses
    if (textsToEmbed.length > 0) {
      const newEmbeddings = await this.generateEmbeddings(textsToEmbed, model);
      
      for (let i = 0; i < newEmbeddings.length; i++) {
        const originalIndex = indexMap[i];
        embeddings[originalIndex] = newEmbeddings[i];
        
        // Cache the result
        if (useCache) {
          const cacheKey = this.getCacheKey(textsToEmbed[i], model);
          this.embeddingCache.set(cacheKey, newEmbeddings[i]);
          
          // Evict old entries if cache is full
          if (this.embeddingCache.size > this.cacheMaxSize) {
            const firstKey = this.embeddingCache.keys().next().value;
            this.embeddingCache.delete(firstKey);
          }
        }
      }
    }
    
    // Update stats
    this.stats.totalEmbeddings += texts.length;
    this.stats.lastUsed = new Date();
    this.stats.modelUsage[model] = (this.stats.modelUsage[model] || 0) + texts.length;
    
    return embeddings;
  }

  /**
   * Generate embeddings using Ollama API
   */
  async generateEmbeddings(texts, model) {
    const embeddings = [];
    
    // Process in batches
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const batchEmbeddings = await this.processBatch(batch, model);
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }

  /**
   * Process a batch of texts
   */
  async processBatch(texts, model) {
    const embeddings = [];
    
    for (const text of texts) {
      let retries = 0;
      let lastError;
      
      while (retries < this.maxRetries) {
        try {
          const embedding = await this.callOllamaEmbed(text, model);
          embeddings.push(embedding);
          break;
        } catch (error) {
          lastError = error;
          retries++;
          
          if (retries < this.maxRetries) {
            await this.delay(1000 * retries);
          }
        }
      }
      
      if (retries === this.maxRetries) {
        this.stats.errors++;
        this.emit('error', { error: lastError, text: text.substring(0, 100) });
        throw lastError;
      }
    }
    
    return embeddings;
  }

  /**
   * Call Ollama embeddings API
   */
  async callOllamaEmbed(text, model) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama embedding failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.embedding;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Embedding request timed out after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Generate cache key
   */
  getCacheKey(text, model) {
    const hash = crypto.createHash('md5').update(`${model}:${text}`).digest('hex');
    return hash;
  }

  /**
   * Clear embedding cache
   */
  clearCache() {
    this.embeddingCache.clear();
    this.emit('cache:cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.embeddingCache.size,
      maxSize: this.cacheMaxSize,
      hitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0,
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      ...this.stats,
      cache: this.getCacheStats(),
      currentModel: this.currentModel,
      modelInfo: EMBEDDING_MODELS[this.currentModel],
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.checkConnection();
      
      // Try a test embedding
      const testEmbedding = await this.embed('health check test', { useCache: false });
      
      return {
        status: 'healthy',
        model: this.currentModel,
        modelInfo: EMBEDDING_MODELS[this.currentModel],
        dimensions: testEmbedding?.length,
        ollamaConnected: true,
        cacheEnabled: this.cacheEnabled,
        stats: this.getStats(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        model: this.currentModel,
        ollamaConnected: false,
      };
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find most similar texts from a list
   */
  async findSimilar(queryText, candidateTexts, options = {}) {
    const { topK = 5, threshold = 0.5 } = options;
    
    // Get query embedding
    const queryEmbedding = await this.embed(queryText);
    
    // Get candidate embeddings
    const candidateEmbeddings = await this.embedBatch(candidateTexts);
    
    // Calculate similarities
    const similarities = candidateTexts.map((text, i) => ({
      text,
      index: i,
      similarity: this.cosineSimilarity(queryEmbedding, candidateEmbeddings[i]),
    }));
    
    // Sort by similarity and filter
    return similarities
      .filter(s => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function for backward compatibility
 */
export function createOllamaEmbeddingService(config = {}) {
  return new OllamaEmbeddingService(config);
}

export default OllamaEmbeddingService;
