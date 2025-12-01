/**
 * Codebase Embedding Indexer Unit Tests
 * Tests for CodebaseEmbeddingIndexer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

// Mock glob
vi.mock('glob', () => ({
  glob: vi.fn().mockResolvedValue([]),
}));

// Mock fs
vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises');
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    rm: vi.fn(),
    stat: vi.fn(),
  };
});

// Mock embedding service
vi.mock('../../services/rag/ollama-embedding-service.js', () => ({
  OllamaEmbeddingService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(true),
    embed: vi.fn().mockResolvedValue(new Array(1024).fill(0.1)),
    embedBatch: vi.fn().mockImplementation((texts) => 
      Promise.resolve(texts.map(() => new Array(1024).fill(0.1)))
    ),
    switchModel: vi.fn().mockResolvedValue({ previousModel: 'old', currentModel: 'new' }),
    cosineSimilarity: vi.fn().mockReturnValue(0.9),
    getStats: vi.fn().mockReturnValue({}),
  })),
  EMBEDDING_MODELS: {
    'mxbai-embed-large': { name: 'mxbai-embed-large', dimensions: 1024 },
    'nomic-embed-text': { name: 'nomic-embed-text', dimensions: 768 },
  },
  DEFAULT_MODELS: {
    'codebase-indexing': 'mxbai-embed-large',
  },
}));

const { CodebaseEmbeddingIndexer, createCodebaseEmbeddingIndexer } = await import('../../services/rag/codebase-embedding-indexer.js');
const { glob } = await import('glob');

describe('CodebaseEmbeddingIndexer', () => {
  let indexer;

  beforeEach(() => {
    vi.clearAllMocks();
    indexer = new CodebaseEmbeddingIndexer({
      rootPath: '/test/project',
      model: 'mxbai-embed-large',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(indexer.config.rootPath).toBe('/test/project');
      expect(indexer.config.model).toBe('mxbai-embed-large');
    });

    it('should use default ignore patterns', () => {
      expect(indexer.config.ignorePatterns).toContain('node_modules/**');
      expect(indexer.config.ignorePatterns).toContain('.git/**');
    });

    it('should create empty index', () => {
      expect(indexer.index.chunks).toEqual([]);
      expect(indexer.index.files.size).toBe(0);
    });
  });

  describe('factory function', () => {
    it('should create indexer instance', () => {
      const instance = createCodebaseEmbeddingIndexer({ rootPath: '/test' });
      expect(instance).toBeInstanceOf(CodebaseEmbeddingIndexer);
    });
  });

  describe('initialize', () => {
    it('should initialize embedding service', async () => {
      // Mock loadIndex to return false (no existing index)
      fs.readFile.mockRejectedValue({ code: 'ENOENT' });
      
      await indexer.initialize();
      
      expect(indexer.initialized).toBe(true);
      expect(indexer.embeddingService.initialize).toHaveBeenCalled();
    });
  });

  describe('chunkContent', () => {
    it('should chunk content correctly', () => {
      const content = 'line1\nline2\nline3\nline4\nline5';
      const chunks = indexer.chunkContent(content, {
        filePath: '/test/file.js',
        relativePath: 'file.js',
        fileType: 'javascript',
        chunkSize: 20,
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].filePath).toBe('/test/file.js');
      expect(chunks[0].fileType).toBe('javascript');
    });

    it('should include metadata in chunks', () => {
      const content = 'const x = 1;\nconst y = 2;';
      const chunks = indexer.chunkContent(content, {
        filePath: '/test/file.ts',
        relativePath: 'file.ts',
        fileType: 'typescript',
        chunkSize: 100,
      });

      expect(chunks[0].metadata).toBeDefined();
      expect(chunks[0].metadata.fileType).toBe('typescript');
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Setup indexer with some test data
      indexer.index.chunks = [
        {
          id: 'test1',
          filePath: '/test/auth.ts',
          relativePath: 'auth.ts',
          fileType: 'typescript',
          content: 'function authenticate(user)',
          startLine: 1,
          endLine: 10,
          embedding: new Array(1024).fill(0.1),
        },
        {
          id: 'test2',
          filePath: '/test/user.ts',
          relativePath: 'user.ts',
          fileType: 'typescript',
          content: 'function createUser(data)',
          startLine: 1,
          endLine: 10,
          embedding: new Array(1024).fill(0.2),
        },
      ];
      indexer.initialized = true;
    });

    it('should search and return results', async () => {
      const results = await indexer.search('authentication');
      
      expect(results.results).toBeDefined();
      expect(results.model).toBe('mxbai-embed-large');
    });

    it('should filter by file types', async () => {
      const results = await indexer.search('test', { fileTypes: ['typescript'] });
      
      expect(results.results.every(r => r.fileType === 'typescript')).toBe(true);
    });

    it('should respect topK parameter', async () => {
      const results = await indexer.search('test', { topK: 1 });
      
      expect(results.results.length).toBeLessThanOrEqual(1);
    });

    it('should return empty results for empty index', async () => {
      indexer.index.chunks = [];
      const results = await indexer.search('test');
      
      expect(results.results.length).toBe(0);
      expect(results.message).toBeDefined();
    });
  });

  describe('getContext', () => {
    beforeEach(() => {
      indexer.index.chunks = [
        {
          id: 'test1',
          relativePath: 'auth.ts',
          content: 'authentication code here',
          startLine: 1,
          endLine: 10,
          embedding: new Array(1024).fill(0.1),
        },
      ];
      indexer.initialized = true;
    });

    it('should return context for AI models', async () => {
      const context = await indexer.getContext('authentication');
      
      expect(context.context).toBeDefined();
      expect(context.tokenEstimate).toBeGreaterThan(0);
      expect(context.files).toBeDefined();
    });

    it('should respect maxTokens limit', async () => {
      const context = await indexer.getContext('test', { maxTokens: 100 });
      
      expect(context.tokenEstimate).toBeLessThanOrEqual(100);
    });
  });

  describe('getStats', () => {
    it('should return index statistics', () => {
      indexer.index.files.set('test.js', { chunkCount: 5 });
      indexer.index.chunks = new Array(5);
      indexer.index.model = 'mxbai-embed-large';

      const stats = indexer.getStats();

      expect(stats.fileCount).toBe(1);
      expect(stats.chunkCount).toBe(5);
      expect(stats.model).toBe('mxbai-embed-large');
    });
  });

  describe('getIndexedFiles', () => {
    it('should return list of indexed files', () => {
      indexer.index.files.set('/test/file1.js', { path: '/test/file1.js', chunkCount: 3 });
      indexer.index.files.set('/test/file2.ts', { path: '/test/file2.ts', chunkCount: 5 });

      const files = indexer.getIndexedFiles();

      expect(files.length).toBe(2);
      expect(files.some(f => f.path === '/test/file1.js')).toBe(true);
    });
  });

  describe('averageEmbeddings', () => {
    it('should calculate average of embeddings', () => {
      const embeddings = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      const avg = indexer.averageEmbeddings(embeddings);

      expect(avg).toEqual([2.5, 3.5, 4.5]);
    });

    it('should handle single embedding', () => {
      const embeddings = [[1, 2, 3]];
      const avg = indexer.averageEmbeddings(embeddings);
      expect(avg).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      const avg = indexer.averageEmbeddings([]);
      expect(avg).toEqual([]);
    });
  });

  describe('clearIndex', () => {
    it('should clear the index', async () => {
      indexer.index.files.set('test.js', {});
      indexer.index.chunks = [{ id: 'test' }];

      await indexer.clearIndex();

      expect(indexer.index.files.size).toBe(0);
      expect(indexer.index.chunks.length).toBe(0);
    });
  });

  describe('switchModel', () => {
    it('should switch embedding model', async () => {
      const result = await indexer.switchModel('nomic-embed-text');

      expect(indexer.embeddingService.switchModel).toHaveBeenCalledWith(
        'nomic-embed-text',
        expect.any(Object)
      );
      expect(indexer.index.model).toBe('nomic-embed-text');
    });
  });
});
