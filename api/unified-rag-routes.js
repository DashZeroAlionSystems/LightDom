/**
 * Unified RAG API Router
 * 
 * Clean, unified API for the RAG system that integrates directly with
 * the PromptInput component and provides:
 * - Streaming chat with context
 * - Document indexing (Docling-style)
 * - Database and codebase access
 * - Health monitoring
 * 
 * @module api/unified-rag-routes
 */

import express from 'express';
import multer from 'multer';
import { createUnifiedRAGService } from '../services/rag/unified-rag-service.js';

/**
 * Create Unified RAG Router
 */
export function createUnifiedRAGRouter(options = {}) {
  const router = express.Router();
  const { db, logger = console } = options;
  
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });
  
  // Initialize RAG service
  let ragService = null;
  let initializationPromise = null;
  
  const initializeService = async () => {
    if (ragService) return ragService;
    if (initializationPromise) return initializationPromise;
    
    initializationPromise = (async () => {
      ragService = createUnifiedRAGService({
        db,
        logger,
        config: {
          llm: {
            provider: process.env.RAG_LLM_PROVIDER || 'ollama',
            model: process.env.OLLAMA_MODEL || process.env.RAG_MODEL || 'deepseek-r1:latest',
          },
          embedding: {
            model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
          },
          endpoints: {
            ollama: process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434',
            deepseek: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
          },
        },
      });
      
      await ragService.initialize();
      logger.info('✅ Unified RAG service initialized');
      return ragService;
    })();
    
    return initializationPromise;
  };
  
  // Middleware to ensure service is initialized
  const ensureInitialized = async (req, res, next) => {
    try {
      await initializeService();
      next();
    } catch (error) {
      logger.error('Failed to initialize RAG service:', error);
      res.status(503).json({
        error: 'RAG service initialization failed',
        details: error.message,
      });
    }
  };
  
  // Apply to all routes
  router.use(ensureInitialized);

  /**
   * POST /chat
   * Main chat endpoint - integrates with PromptInput
   * 
   * Body: {
   *   prompt: string,           // User's prompt
   *   conversationId?: string,  // For conversation continuity
   *   mode?: string,            // 'assistant' | 'developer' | 'codebase'
   *   includeDatabase?: boolean,
   *   includeCodebase?: boolean,
   *   stream?: boolean,
   * }
   */
  router.post('/chat', async (req, res) => {
    try {
      const {
        prompt,
        conversationId,
        mode = 'assistant',
        includeDatabase = true,
        includeCodebase = true,
        stream = false,
        temperature,
        maxTokens,
        topK,
      } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'prompt is required' });
      }
      
      if (stream) {
        // Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        
        try {
          for await (const event of ragService.streamChat(prompt, {
            conversationId,
            mode,
            includeDatabase,
            includeCodebase,
            temperature,
            maxTokens,
            topK,
          })) {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
          
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (error) {
          res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
          res.end();
        }
      } else {
        // Non-streaming response
        const result = await ragService.chat(prompt, {
          conversationId,
          mode,
          includeDatabase,
          includeCodebase,
          temperature,
          maxTokens,
          topK,
        });
        
        res.json({
          status: 'ok',
          ...result,
        });
      }
    } catch (error) {
      logger.error('Chat failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /chat/stream
   * Streaming chat endpoint (SSE)
   */
  router.post('/chat/stream', async (req, res) => {
    try {
      const {
        prompt,
        messages, // Alternative: array of messages
        conversationId,
        mode = 'assistant',
        includeDatabase = true,
        includeCodebase = true,
        temperature,
        maxTokens,
        topK,
      } = req.body;
      
      // Support both prompt and messages format
      const userPrompt = prompt || messages?.find(m => m.role === 'user')?.content;
      
      if (!userPrompt) {
        return res.status(400).json({ error: 'prompt or messages with user role required' });
      }
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      
      try {
        for await (const event of ragService.streamChat(userPrompt, {
          conversationId,
          mode,
          includeDatabase,
          includeCodebase,
          temperature,
          maxTokens,
          topK,
        })) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        logger.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
      }
      
      req.on('close', () => {
        try {
          res.end();
        } catch {
          // Ignore
        }
      });
    } catch (error) {
      logger.error('Stream setup failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /index
   * Index a document into the vector store
   */
  router.post('/index', async (req, res) => {
    try {
      const { content, documentId, title, type, metadata } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }
      
      const result = await ragService.indexDocument(content, {
        documentId,
        title,
        type,
        metadata,
      });
      
      res.json({
        status: 'ok',
        ...result,
      });
    } catch (error) {
      logger.error('Index failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /index/file
   * Index an uploaded file
   */
  router.post('/index/file', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'file is required' });
      }
      
      const content = req.file.buffer.toString('utf-8');
      const title = req.body.title || req.file.originalname;
      
      const result = await ragService.indexDocument(content, {
        documentId: req.body.documentId,
        title,
        type: detectFileType(req.file.originalname),
        metadata: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });
      
      res.json({
        status: 'ok',
        ...result,
      });
    } catch (error) {
      logger.error('File index failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /index/codebase
   * Index the project codebase
   */
  router.post('/index/codebase', async (req, res) => {
    try {
      const {
        rootDir = process.cwd(),
        patterns = ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx', '**/*.md'],
        exclude = ['node_modules', 'dist', '.git', 'build', 'coverage'],
        maxFiles = 100,
      } = req.body || {};
      
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Extract file extensions from glob patterns
      const getExtensions = (patternList) => {
        return patternList
          .filter(p => p.includes('*.'))
          .map(p => {
            const match = p.match(/\*(\.[a-zA-Z0-9]+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean);
      };
      
      const validExtensions = getExtensions(patterns);
      
      // Simple recursive file finder
      const findFiles = async (dir) => {
        const files = [];
        
        const walkDir = async (currentDir) => {
          try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
              const fullPath = path.join(currentDir, entry.name);
              const relativePath = path.relative(rootDir, fullPath);
              
              // Check exclusions
              if (exclude.some(ex => relativePath.includes(ex))) continue;
              
              if (entry.isDirectory()) {
                await walkDir(fullPath);
              } else if (entry.isFile()) {
                // Check if file extension matches any pattern
                const ext = path.extname(entry.name);
                
                if (validExtensions.includes(ext)) {
                  files.push(fullPath);
                  if (files.length >= maxFiles) return;
                }
              }
            }
          } catch (error) {
            logger.warn(`Failed to read directory ${currentDir}:`, error.message);
          }
        };
        
        await walkDir(dir);
        return files;
      };
      
      const files = await findFiles(rootDir);
      let indexed = 0;
      const errors = [];
      
      for (const filePath of files.slice(0, maxFiles)) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const relativePath = path.relative(rootDir, filePath);
          
          await ragService.indexDocument(content, {
            documentId: `codebase:${relativePath}`,
            title: relativePath,
            type: 'code',
            metadata: {
              path: relativePath,
              absolutePath: filePath,
            },
          });
          
          indexed++;
        } catch (error) {
          errors.push({ path: filePath, error: error.message });
        }
      }
      
      res.json({
        status: 'ok',
        filesFound: files.length,
        filesIndexed: indexed,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      logger.error('Codebase index failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /search
   * Semantic search in the vector store
   */
  router.post('/search', async (req, res) => {
    try {
      const { query, limit = 5, minScore } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }
      
      const results = await ragService.search(query, { limit, minScore });
      
      res.json({
        status: 'ok',
        results,
      });
    } catch (error) {
      logger.error('Search failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /conversation/:id
   * Get conversation history
   */
  router.get('/conversation/:id', (req, res) => {
    const conversation = ragService.getConversation(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
      status: 'ok',
      conversation,
    });
  });

  /**
   * DELETE /conversation/:id
   * Clear conversation history
   */
  router.delete('/conversation/:id', (req, res) => {
    ragService.clearConversation(req.params.id);
    
    res.json({
      status: 'ok',
      message: 'Conversation cleared',
    });
  });

  /**
   * GET /health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    try {
      const health = await ragService.healthCheck();
      
      const statusCode = health.status === 'healthy' ? 200 :
                         health.status === 'degraded' ? 206 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        error: error.message,
      });
    }
  });

  /**
   * GET /config
   * Get current configuration
   */
  router.get('/config', (req, res) => {
    const config = ragService.getConfig();
    
    // Don't expose sensitive data
    const safeConfig = {
      llm: {
        provider: config.llm.provider,
        model: config.llm.model,
        contextWindow: config.llm.contextWindow,
      },
      embedding: config.embedding,
      processing: config.processing,
      vectorStore: {
        tableName: config.vectorStore.tableName,
        topK: config.vectorStore.topK,
      },
    };
    
    res.json({
      status: 'ok',
      config: safeConfig,
    });
  });

  /**
   * POST /config
   * Update configuration
   */
  router.post('/config', (req, res) => {
    try {
      const updates = req.body;
      
      // Validate updates
      const allowedKeys = ['llm', 'embedding', 'processing', 'vectorStore', 'context'];
      const filteredUpdates = {};
      
      for (const key of Object.keys(updates)) {
        if (allowedKeys.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      ragService.updateConfig(filteredUpdates);
      
      res.json({
        status: 'ok',
        message: 'Configuration updated',
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * GET /models
   * List available models (when using Ollama)
   */
  router.get('/models', async (req, res) => {
    try {
      const config = ragService.getConfig();
      const ollamaEndpoint = config.endpoints.ollama;
      
      const response = await fetch(`${ollamaEndpoint}/api/tags`);
      
      if (!response.ok) {
        return res.status(502).json({
          error: 'Failed to fetch models from Ollama',
          status: response.status,
        });
      }
      
      const data = await response.json();
      
      res.json({
        status: 'ok',
        models: data.models || [],
        currentModel: config.llm.model,
        recommendedModels: [
          { name: 'deepseek-r1:latest', description: 'Best for RAG with 128K context' },
          { name: 'qwen2.5:14b', description: 'Fast, high quality, Apache 2.0 license' },
          { name: 'llama3.3:70b', description: 'Strong general purpose' },
        ],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/**
 * Detect file type from filename
 */
function detectFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const codeExtensions = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'h'];
  const markdownExtensions = ['md', 'mdx'];
  const jsonExtensions = ['json', 'jsonc'];
  
  if (codeExtensions.includes(ext)) return 'code';
  if (markdownExtensions.includes(ext)) return 'markdown';
  if (jsonExtensions.includes(ext)) return 'json';
  
  return 'text';
}

export default createUnifiedRAGRouter;
