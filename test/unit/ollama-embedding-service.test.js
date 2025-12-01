/**
 * Ollama Embedding Service Unit Tests
 * Tests for OllamaEmbeddingService with model switching
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Import after setting up mocks
const { OllamaEmbeddingService, EMBEDDING_MODELS, DEFAULT_MODELS } = await import('../../services/rag/ollama-embedding-service.js');

describe('OllamaEmbeddingService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OllamaEmbeddingService({
      baseUrl: 'http://localhost:11434',
      model: 'mxbai-embed-large',
      cacheEnabled: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('EMBEDDING_MODELS configuration', () => {
    it('should have mxbai-embed-large as the recommended model', () => {
      expect(EMBEDDING_MODELS['mxbai-embed-large']).toBeDefined();
      expect(EMBEDDING_MODELS['mxbai-embed-large'].recommended).toBe(true);
      expect(EMBEDDING_MODELS['mxbai-embed-large'].dimensions).toBe(1024);
    });

    it('should have nomic-embed-text as general purpose model', () => {
      expect(EMBEDDING_MODELS['nomic-embed-text']).toBeDefined();
      expect(EMBEDDING_MODELS['nomic-embed-text'].dimensions).toBe(768);
      expect(EMBEDDING_MODELS['nomic-embed-text'].useCase).toBe('general');
    });

    it('should have all-minilm as lightweight model', () => {
      expect(EMBEDDING_MODELS['all-minilm']).toBeDefined();
      expect(EMBEDDING_MODELS['all-minilm'].dimensions).toBe(384);
      expect(EMBEDDING_MODELS['all-minilm'].useCase).toBe('lightweight');
    });
  });

  describe('DEFAULT_MODELS configuration', () => {
    it('should recommend mxbai-embed-large for codebase indexing', () => {
      expect(DEFAULT_MODELS['codebase-indexing']).toBe('mxbai-embed-large');
    });

    it('should recommend mxbai-embed-large for high-quality embeddings', () => {
      expect(DEFAULT_MODELS['high-quality']).toBe('mxbai-embed-large');
    });

    it('should recommend nomic-embed-text for general use', () => {
      expect(DEFAULT_MODELS['general']).toBe('nomic-embed-text');
    });
  });

  describe('constructor', () => {
    it('should use mxbai-embed-large as default model', () => {
      const defaultService = new OllamaEmbeddingService({});
      expect(defaultService.currentModel).toBe('mxbai-embed-large');
    });

    it('should allow custom model configuration', () => {
      const customService = new OllamaEmbeddingService({
        model: 'nomic-embed-text',
      });
      expect(customService.currentModel).toBe('nomic-embed-text');
    });

    it('should initialize with correct base URL', () => {
      expect(service.baseUrl).toBe('http://localhost:11434');
    });
  });

  describe('getModelInfo', () => {
    it('should return current model information', () => {
      const info = service.getModelInfo();
      expect(info.currentModel).toBe('mxbai-embed-large');
      expect(info.info.dimensions).toBe(1024);
      expect(info.supportedModels).toContain('mxbai-embed-large');
      expect(info.supportedModels).toContain('nomic-embed-text');
    });
  });

  describe('listModels', () => {
    it('should list all supported models', () => {
      const models = service.listModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models.some(m => m.name === 'mxbai-embed-large')).toBe(true);
      expect(models.some(m => m.name === 'nomic-embed-text')).toBe(true);
    });

    it('should mark current model', () => {
      const models = service.listModels();
      const currentModel = models.find(m => m.current);
      expect(currentModel.name).toBe('mxbai-embed-large');
    });
  });

  describe('getBestModelForUseCase', () => {
    it('should return mxbai-embed-large for high-quality use case', () => {
      const model = service.getBestModelForUseCase('high-quality');
      expect(model.name).toBe('mxbai-embed-large');
    });

    it('should return nomic-embed-text for general use case', () => {
      const model = service.getBestModelForUseCase('general');
      expect(model.name).toBe('nomic-embed-text');
    });

    it('should return all-minilm for lightweight use case', () => {
      const model = service.getBestModelForUseCase('lightweight');
      expect(model.name).toBe('all-minilm');
    });
  });

  describe('switchModel', () => {
    beforeEach(() => {
      // Mock successful model check
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ models: [{ name: 'nomic-embed-text' }] }),
      });
    });

    it('should switch to a different model', async () => {
      const result = await service.switchModel('nomic-embed-text');
      expect(result.previousModel).toBe('mxbai-embed-large');
      expect(result.currentModel).toBe('nomic-embed-text');
      expect(service.currentModel).toBe('nomic-embed-text');
    });

    it('should throw error for unknown model without allowUnknown', async () => {
      await expect(service.switchModel('unknown-model')).rejects.toThrow('Unknown model');
    });

    it('should allow unknown model with allowUnknown option', async () => {
      const result = await service.switchModel('custom-model', { allowUnknown: true });
      expect(result.currentModel).toBe('custom-model');
    });

    it('should track model switches in stats', async () => {
      await service.switchModel('nomic-embed-text');
      expect(service.stats.modelSwitches).toBe(1);
    });
  });

  describe('embed', () => {
    beforeEach(() => {
      // Mock embedding response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          embedding: new Array(1024).fill(0.1) 
        }),
      });
    });

    it('should generate embedding for a single text', async () => {
      const embedding = await service.embed('test text');
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1024);
    });

    it('should call Ollama API with correct model', async () => {
      await service.embed('test text');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/embeddings',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('mxbai-embed-large'),
        })
      );
    });
  });

  describe('embedBatch', () => {
    beforeEach(() => {
      // Mock embedding response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          embedding: new Array(1024).fill(0.1) 
        }),
      });
    });

    it('should generate embeddings for multiple texts', async () => {
      const embeddings = await service.embedBatch(['text1', 'text2', 'text3']);
      expect(embeddings.length).toBe(3);
      expect(embeddings.every(e => Array.isArray(e))).toBe(true);
    });

    it('should use cache for repeated texts', async () => {
      await service.embedBatch(['text1']);
      const callCount = global.fetch.mock.calls.length;
      
      await service.embedBatch(['text1']);
      expect(global.fetch.mock.calls.length).toBe(callCount); // No new calls
      expect(service.stats.cacheHits).toBeGreaterThan(0);
    });

    it('should update stats correctly', async () => {
      await service.embedBatch(['text1', 'text2']);
      expect(service.stats.totalEmbeddings).toBe(2);
    });
  });

  describe('cache management', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          embedding: new Array(1024).fill(0.1) 
        }),
      });
    });

    it('should cache embeddings', async () => {
      await service.embed('cached text');
      const cacheStats = service.getCacheStats();
      expect(cacheStats.size).toBe(1);
    });

    it('should clear cache', async () => {
      await service.embed('text to cache');
      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    it('should respect cache max size', async () => {
      const smallCacheService = new OllamaEmbeddingService({
        cacheMaxSize: 2,
        cacheEnabled: true,
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ embedding: [0.1, 0.2] }),
      });

      await smallCacheService.embed('text1');
      await smallCacheService.embed('text2');
      await smallCacheService.embed('text3');

      const stats = smallCacheService.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(2);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [1, 0, 0];
      expect(service.cosineSimilarity(embedding1, embedding2)).toBeCloseTo(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const embedding1 = [1, 0];
      const embedding2 = [0, 1];
      expect(service.cosineSimilarity(embedding1, embedding2)).toBeCloseTo(0);
    });

    it('should handle different length embeddings', () => {
      const embedding1 = [1, 0];
      const embedding2 = [1, 0, 0];
      expect(service.cosineSimilarity(embedding1, embedding2)).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return comprehensive statistics', () => {
      const stats = service.getStats();
      expect(stats).toHaveProperty('totalEmbeddings');
      expect(stats).toHaveProperty('cacheHits');
      expect(stats).toHaveProperty('cacheMisses');
      expect(stats).toHaveProperty('modelSwitches');
      expect(stats).toHaveProperty('currentModel');
      expect(stats).toHaveProperty('cache');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when Ollama is connected', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          models: [{ name: 'mxbai-embed-large' }],
          embedding: new Array(1024).fill(0.1),
        }),
      });

      const health = await service.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.model).toBe('mxbai-embed-large');
    });

    it('should return unhealthy status when Ollama is not connected', async () => {
      global.fetch.mockRejectedValue(new Error('Connection refused'));

      const health = await service.healthCheck();
      expect(health.status).toBe('unhealthy');
      expect(health.error).toBeDefined();
    });
  });
});
