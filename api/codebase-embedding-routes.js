/**
 * Codebase Embedding API Routes
 * 
 * API endpoints for codebase indexing, searching, and context retrieval
 * using high-quality embeddings (mxbai-embed-large).
 * 
 * Endpoints:
 * - POST /api/codebase-index/build - Build or update the index
 * - GET /api/codebase-index/search - Search the codebase
 * - GET /api/codebase-index/context - Get context for a query
 * - GET /api/codebase-index/similar - Find similar files
 * - GET /api/codebase-index/related - Find related code
 * - GET /api/codebase-index/stats - Get index statistics
 * - POST /api/codebase-index/model - Switch embedding model
 * - GET /api/codebase-index/models - List available models
 * - POST /api/codebase-index/export - Export index
 * - POST /api/codebase-index/import - Import index
 * - DELETE /api/codebase-index - Clear the index
 */

import { Router } from 'express';
import { CodebaseEmbeddingIndexer, createCodebaseEmbeddingIndexer } from './codebase-embedding-indexer.js';
import { EMBEDDING_MODELS, DEFAULT_MODELS } from './ollama-embedding-service.js';

const router = Router();

// Store indexer instance
let indexer = null;

/**
 * Initialize the indexer
 */
async function getIndexer(config = {}) {
  if (!indexer) {
    indexer = createCodebaseEmbeddingIndexer({
      rootPath: config.rootPath || process.cwd(),
      model: config.model || DEFAULT_MODELS['codebase-indexing'],
      ...config,
    });
    await indexer.initialize();
  }
  return indexer;
}

/**
 * GET /api/codebase-index/health
 * Health check for the embedding service
 */
router.get('/health', async (req, res) => {
  try {
    const idx = await getIndexer();
    const health = await idx.embeddingService.healthCheck();
    
    res.json({
      success: true,
      status: health.status,
      model: health.model,
      modelInfo: health.modelInfo,
      dimensions: health.dimensions,
      indexStats: idx.getStats(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/build
 * Build or update the codebase index
 */
router.post('/build', async (req, res) => {
  try {
    const { incremental = false, patterns = null, rootPath } = req.body;
    
    const idx = await getIndexer({ rootPath });
    const stats = await idx.buildIndex({ incremental, patterns });
    
    res.json({
      success: true,
      message: 'Index built successfully',
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/codebase-index/search
 * Search the codebase
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query, topK = 10, threshold = 0.5, fileTypes, files } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }
    
    const idx = await getIndexer();
    const results = await idx.search(query, {
      topK: parseInt(topK),
      threshold: parseFloat(threshold),
      fileTypes: fileTypes ? fileTypes.split(',') : null,
      files: files ? files.split(',') : null,
    });
    
    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/search
 * Search with POST body (for longer queries)
 */
router.post('/search', async (req, res) => {
  try {
    const { query, topK = 10, threshold = 0.5, fileTypes = null, files = null } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required in request body',
      });
    }
    
    const idx = await getIndexer();
    const results = await idx.search(query, { topK, threshold, fileTypes, files });
    
    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/codebase-index/context
 * Get context for a query (for AI models)
 */
router.get('/context', async (req, res) => {
  try {
    const { q: query, maxTokens = 4000, topK = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }
    
    const idx = await getIndexer();
    const context = await idx.getContext(query, {
      maxTokens: parseInt(maxTokens),
      topK: parseInt(topK),
    });
    
    res.json({
      success: true,
      ...context,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/context
 * Get context with POST body
 */
router.post('/context', async (req, res) => {
  try {
    const { query, maxTokens = 4000, topK = 5, fileTypes = null, files = null } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required in request body',
      });
    }
    
    const idx = await getIndexer();
    const context = await idx.getContext(query, { maxTokens, topK, fileTypes, files });
    
    res.json({
      success: true,
      ...context,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/codebase-index/similar
 * Find files similar to a given file
 */
router.get('/similar', async (req, res) => {
  try {
    const { file, topK = 5, threshold = 0.7 } = req.query;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'File parameter is required',
      });
    }
    
    const idx = await getIndexer();
    const results = await idx.getSimilarFiles(file, {
      topK: parseInt(topK),
      threshold: parseFloat(threshold),
    });
    
    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/related
 * Find code related to a snippet
 */
router.post('/related', async (req, res) => {
  try {
    const { code, topK = 5, threshold = 0.6, excludeFile = null } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code snippet is required in request body',
      });
    }
    
    const idx = await getIndexer();
    const results = await idx.getRelatedCode(code, { topK, threshold, excludeFile });
    
    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/codebase-index/stats
 * Get index statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const idx = await getIndexer();
    const stats = idx.getStats();
    const embeddingStats = idx.embeddingService.getStats();
    
    res.json({
      success: true,
      index: stats,
      embedding: embeddingStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/codebase-index/files
 * Get list of indexed files
 */
router.get('/files', async (req, res) => {
  try {
    const idx = await getIndexer();
    const files = idx.getIndexedFiles();
    
    res.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/model
 * Switch embedding model
 */
router.post('/model', async (req, res) => {
  try {
    const { model, reindex = false, pullIfMissing = true } = req.body;
    
    if (!model) {
      return res.status(400).json({
        success: false,
        error: 'Model name is required',
        availableModels: Object.keys(EMBEDDING_MODELS),
      });
    }
    
    const idx = await getIndexer();
    const result = await idx.switchModel(model, { reindex, pullIfMissing });
    
    res.json({
      success: true,
      message: `Switched to model: ${model}`,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/codebase-index/models
 * List available embedding models
 */
router.get('/models', async (req, res) => {
  try {
    const idx = await getIndexer();
    const modelInfo = idx.embeddingService.getModelInfo();
    const models = idx.embeddingService.listModels();
    
    res.json({
      success: true,
      currentModel: modelInfo.currentModel,
      models,
      defaultModels: DEFAULT_MODELS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/export
 * Export the index
 */
router.post('/export', async (req, res) => {
  try {
    const { outputPath } = req.body;
    
    if (!outputPath) {
      return res.status(400).json({
        success: false,
        error: 'Output path is required',
      });
    }
    
    const idx = await getIndexer();
    const path = await idx.exportIndex(outputPath);
    
    res.json({
      success: true,
      message: 'Index exported successfully',
      path,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/codebase-index/import
 * Import an index
 */
router.post('/import', async (req, res) => {
  try {
    const { inputPath } = req.body;
    
    if (!inputPath) {
      return res.status(400).json({
        success: false,
        error: 'Input path is required',
      });
    }
    
    const idx = await getIndexer();
    const stats = await idx.importIndex(inputPath);
    
    res.json({
      success: true,
      message: 'Index imported successfully',
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/codebase-index
 * Clear the index
 */
router.delete('/', async (req, res) => {
  try {
    const idx = await getIndexer();
    await idx.clearIndex();
    
    res.json({
      success: true,
      message: 'Index cleared successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Reset the indexer instance (for configuration changes)
 */
export function resetIndexer() {
  indexer = null;
}

export default router;
