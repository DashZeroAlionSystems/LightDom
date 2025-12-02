/**
 * Simple RAG API Routes
 * 
 * Clean, minimal API for RAG operations:
 * - POST /api/rag/index     - Index documents
 * - POST /api/rag/chat      - RAG chat with context
 * - POST /api/rag/search    - Vector search only
 * - GET  /api/rag/health    - Health check
 * - GET  /api/rag/stats     - Usage statistics
 * - GET  /api/rag/documents - List indexed documents
 * - DELETE /api/rag/documents/:id - Delete document
 * 
 * @module api/simple-rag-routes
 */

import express from 'express';
import { createSimpleRagService } from '../services/rag/simple-rag-service.js';

/**
 * Create RAG router
 */
export function createSimpleRagRouter(db) {
  const router = express.Router();
  const ragService = createSimpleRagService(db);
  
  // Initialize on first request
  let initialized = false;
  
  router.use(async (req, res, next) => {
    if (!initialized) {
      try {
        await ragService.init();
        initialized = true;
      } catch (error) {
        console.error('[RAG] Initialization error:', error);
      }
    }
    next();
  });
  
  /**
   * POST /api/rag/index
   * Index one or more documents
   */
  router.post('/index', async (req, res) => {
    try {
      const { documents, document, namespace = 'default' } = req.body;
      
      // Support single document or array
      const docs = documents || (document ? [document] : []);
      
      if (docs.length === 0) {
        return res.status(400).json({
          error: 'No documents provided',
          hint: 'Provide { documents: [{ id, content, metadata }] } or { document: { id, content, metadata } }',
        });
      }
      
      const results = [];
      
      for (const doc of docs) {
        if (!doc.id || !doc.content) {
          results.push({
            error: 'Document requires id and content',
            doc: doc.id || 'unknown',
          });
          continue;
        }
        
        const result = await ragService.indexDocument({
          id: doc.id,
          content: doc.content,
          namespace: doc.namespace || namespace,
          metadata: doc.metadata || {},
        });
        
        results.push(result);
      }
      
      res.json({
        success: true,
        indexed: results.filter(r => !r.error).length,
        errors: results.filter(r => r.error).length,
        results,
      });
    } catch (error) {
      console.error('[RAG] Index error:', error);
      res.status(500).json({
        error: 'Failed to index documents',
        message: error.message,
      });
    }
  });
  
  /**
   * POST /api/rag/chat
   * Chat with RAG context
   */
  router.post('/chat', async (req, res) => {
    try {
      const { messages, message, namespace = 'default', sessionId, topK } = req.body;
      
      // Support messages array or single message
      let chatMessages;
      
      if (messages && Array.isArray(messages)) {
        chatMessages = messages;
      } else if (message) {
        chatMessages = [{ role: 'user', content: message }];
      } else {
        return res.status(400).json({
          error: 'No message provided',
          hint: 'Provide { messages: [{ role, content }] } or { message: "your question" }',
        });
      }
      
      const result = await ragService.chat(chatMessages, {
        namespace,
        sessionId,
        topK,
      });
      
      res.json({
        success: true,
        response: result.message,
        context: result.context,
        timing: result.timing,
      });
    } catch (error) {
      console.error('[RAG] Chat error:', error);
      res.status(500).json({
        error: 'Chat failed',
        message: error.message,
      });
    }
  });
  
  /**
   * POST /api/rag/chat/stream
   * Stream chat with RAG context
   */
  router.post('/chat/stream', async (req, res) => {
    try {
      const { messages, message, namespace = 'default', topK } = req.body;
      
      let chatMessages;
      
      if (messages && Array.isArray(messages)) {
        chatMessages = messages;
      } else if (message) {
        chatMessages = [{ role: 'user', content: message }];
      } else {
        return res.status(400).json({
          error: 'No message provided',
        });
      }
      
      const stream = await ragService.streamChat(chatMessages, {
        namespace,
        topK,
      });
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Pipe the stream
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      
      async function pump() {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        
        const text = decoder.decode(value);
        res.write(`data: ${text}\n\n`);
        pump();
      }
      
      pump();
    } catch (error) {
      console.error('[RAG] Stream error:', error);
      res.status(500).json({
        error: 'Stream failed',
        message: error.message,
      });
    }
  });
  
  /**
   * POST /api/rag/search
   * Vector search only (no LLM)
   */
  router.post('/search', async (req, res) => {
    try {
      const { query, namespace = 'default', topK, minScore } = req.body;
      
      if (!query) {
        return res.status(400).json({
          error: 'No query provided',
        });
      }
      
      const result = await ragService.search(query, {
        namespace,
        topK,
        minScore,
      });
      
      res.json({
        success: true,
        query,
        results: result.results,
        timeMs: result.timeMs,
      });
    } catch (error) {
      console.error('[RAG] Search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message,
      });
    }
  });
  
  /**
   * GET /api/rag/health
   * Health check
   */
  router.get('/health', async (req, res) => {
    try {
      const health = await ragService.healthCheck();
      
      const statusCode = health.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      console.error('[RAG] Health check error:', error);
      res.status(503).json({
        status: 'error',
        error: error.message,
      });
    }
  });
  
  /**
   * GET /api/rag/stats
   * Usage statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = await ragService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('[RAG] Stats error:', error);
      res.status(500).json({
        error: 'Failed to get stats',
        message: error.message,
      });
    }
  });
  
  /**
   * GET /api/rag/documents
   * List indexed documents
   */
  router.get('/documents', async (req, res) => {
    try {
      const { namespace = 'default' } = req.query;
      const documents = await ragService.listDocuments(namespace);
      
      res.json({
        namespace,
        count: documents.length,
        documents,
      });
    } catch (error) {
      console.error('[RAG] List documents error:', error);
      res.status(500).json({
        error: 'Failed to list documents',
        message: error.message,
      });
    }
  });
  
  /**
   * DELETE /api/rag/documents/:id
   * Delete a document
   */
  router.delete('/documents/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { namespace = 'default' } = req.query;
      
      await ragService.deleteDocument(id, namespace);
      
      res.json({
        success: true,
        deleted: id,
        namespace,
      });
    } catch (error) {
      console.error('[RAG] Delete document error:', error);
      res.status(500).json({
        error: 'Failed to delete document',
        message: error.message,
      });
    }
  });
  
  /**
   * GET /api/rag/config
   * Get current configuration
   */
  router.get('/config', (req, res) => {
    const config = ragService.config;
    
    res.json({
      ollamaEndpoint: config.ollamaEndpoint,
      llmModel: config.llmModel,
      embeddingModel: config.embeddingModel,
      embeddingDimension: config.embeddingDimension,
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      topK: config.topK,
      minScore: config.minScore,
    });
  });
  
  return router;
}

export default createSimpleRagRouter;
