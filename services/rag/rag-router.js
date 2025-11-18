import { randomUUID } from 'crypto';
import express from 'express';
import multer from 'multer';
import ingestCodebase from './codebase-ingestor.js';
import {
  buildDocumentMetadata,
  extractTextFromUpload,
  extractTextFromUrl,
} from './content-extractors.js';
import createDeepSeekClient from './deepseek-client.js';
import createOllamaEmbeddingClient from './ollama-embedding-client.js';
import createEmbeddingClient from './openai-embedding-client.js';
import createRagService from './rag-service.js';
import createVectorStore from './vector-store.js';
import { RagHealthMonitor } from './rag-health-monitor.js';
import { createManagedRagService } from './rag-connection-manager.js';

function normalizeEndpoint(url) {
  if (!url) return null;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function hasRemoteKey() {
  return Boolean(process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY);
}

function isReadyEnvironment() {
  const hasRemote = hasRemoteKey();
  const localEndpoint =
    normalizeEndpoint(process.env.OLLAMA_ENDPOINT || process.env.OLLAMA_API_URL) ||
    'http://127.0.0.1:11434';
  const isLocalConfigured = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(localEndpoint);
  return hasRemote || isLocalConfigured;
}

export function createRagRouter({ db, logger = console, chunker } = {}) {
  if (!db) {
    throw new Error('RAG router requires a PostgreSQL pool instance (db)');
  }

  const router = express.Router();
  router.use(express.json({ limit: '2mb' }));
  router.use(express.urlencoded({ extended: true, limit: '2mb' }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: Number.parseInt(process.env.RAG_UPLOAD_MAX_BYTES || `${50 * 1024 * 1024}`, 10),
    },
  });

  // Initialize health monitor
  const healthMonitor = new RagHealthMonitor({ logger });

  // Initialize managed RAG service with automatic reconnection
  const managedRagService = createManagedRagService({
    createServiceFn: async () => {
      if (!isReadyEnvironment()) {
        throw new Error('DeepSeek API key not configured and Ollama endpoint not detected');
      }

      const vectorStore = createVectorStore(db, { logger });
      const preferredOllamaEndpoint =
        normalizeEndpoint(process.env.OLLAMA_ENDPOINT || process.env.OLLAMA_API_URL) ||
        'http://127.0.0.1:11434';

      let localAvailable = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(
        preferredOllamaEndpoint
      );

      if (localAvailable) {
        try {
          const probe = await fetch(`${preferredOllamaEndpoint}/api/tags`, { method: 'GET' });
          if (!probe.ok) {
            throw new Error(`status ${probe.status}`);
          }
        } catch (error) {
          localAvailable = false;
          logger.warn?.(
            `Local Ollama not reachable at ${preferredOllamaEndpoint}: ${error.message}`
          );
        }
      }

      if (!localAvailable && !hasRemoteKey()) {
        throw new Error(
          'No RAG chat provider available. Start Ollama locally or configure DEEPSEEK_API_KEY/DEEPSEEK_KEY.'
        );
      }

      const embeddingPreference =
        process.env.RAG_EMBED_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : 'ollama');

      let embeddingClient;
      if (embeddingPreference === 'ollama') {
        embeddingClient = createOllamaEmbeddingClient({ baseUrl: preferredOllamaEndpoint });
      } else {
        try {
          embeddingClient = createEmbeddingClient({});
        } catch (error) {
          logger.warn?.(
            `Falling back to Ollama embeddings because OpenAI embedding client failed: ${error.message}`
          );
          embeddingClient = createOllamaEmbeddingClient({ baseUrl: preferredOllamaEndpoint });
        }
      }

      const remoteBase =
        normalizeEndpoint(process.env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_BASE_URL) ||
        'https://api.deepseek.com/v1';

      const deepseekClient = createDeepSeekClient({
        baseUrl: localAvailable ? preferredOllamaEndpoint : remoteBase,
      });

      const ragService = createRagService({
        vectorStore,
        embeddingClient,
        deepseekClient,
        logger,
        chunker,
      });
      await vectorStore.init?.();
      
      // Initialize health monitoring with the RAG service
      healthMonitor.initialize({ db, ragService });
      
      return ragService;
    },
    logger,
  });

  async function getRagService() {
    try {
      const service = await managedRagService.getService();
      return service;
    } catch (error) {
      logger.error('Failed to get RAG service:', error);
      throw new Error(`RAG service unavailable: ${error.message}`);
    }
  }

  function parseTags(input) {
    if (!input) return undefined;
    if (Array.isArray(input)) return input.map(tag => String(tag).trim()).filter(Boolean);
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed.map(tag => String(tag).trim()).filter(Boolean);
        }
      } catch (error) {
        // fall through to comma separation
      }
      return input
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
    }
    return undefined;
  }

  function parseJSONField(value) {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return undefined;
      }
    }
    return undefined;
  }

  async function upsertExtractedDocument({
    text,
    extractionMetadata,
    documentId,
    title,
    source,
    uploadedBy,
    workspaceId,
    tags,
    knowledgeGraph,
  }) {
    if (!text?.trim()) {
      throw new Error('No text content could be extracted from the provided input');
    }

    const ragService = await getRagService();

    const metadata = buildDocumentMetadata({
      extractionMetadata,
      uploadedBy,
      source,
      workspaceId,
      tags,
      knowledgeGraph,
    });

    const docId = documentId || randomUUID();

    const result = await ragService.upsertDocuments([
      {
        id: docId,
        title: title || source || 'Uploaded Document',
        content: text,
        metadata,
      },
    ]);

    return {
      documentId: docId,
      metadata,
      upsert: result,
    };
  }

  router.post('/upsert', async (req, res) => {
    try {
      const { documents } = req.body;
      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({ error: 'documents array is required' });
      }

      const ragService = await getRagService();
      const result = await ragService.upsertDocuments(documents);
      res.json({ status: 'ok', ...result });
    } catch (error) {
      logger.error('RAG upsert failed:', error);
      res.status(500).json({ error: error.message || 'Failed to upsert documents' });
    }
  });

  router.post('/ingest/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'file field is required' });
      }

      const options = {
        languageHint: req.body.languageHint,
        youtubeUrl: req.body.youtubeUrl,
      };

      const extraction = await extractTextFromUpload({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        options,
      });

      const result = await upsertExtractedDocument({
        text: extraction.text,
        extractionMetadata: {
          ...extraction.metadata,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        },
        documentId: req.body.documentId,
        title: req.body.title || req.file.originalname,
        source: req.body.source || 'upload',
        uploadedBy: req.body.uploadedBy,
        workspaceId: req.body.workspaceId,
        tags: parseTags(req.body.tags),
        knowledgeGraph: parseJSONField(req.body.knowledgeGraph),
      });

      res.json({ status: 'ok', ...result });
    } catch (error) {
      logger.error('RAG upload ingestion failed:', error);
      res.status(500).json({ error: error.message || 'Failed to ingest uploaded document' });
    }
  });

  router.post('/ingest/url', async (req, res) => {
    try {
      const {
        url,
        youtubeUrl,
        documentId,
        title,
        source,
        uploadedBy,
        workspaceId,
        tags,
        knowledgeGraph,
        languageHint,
      } = req.body;

      if (!url && !youtubeUrl) {
        return res.status(400).json({ error: 'url or youtubeUrl is required' });
      }

      const options = {
        languageHint,
        youtubeUrl,
      };

      let extraction;
      if (youtubeUrl && (!url || youtubeUrl === url)) {
        extraction = await extractTextFromUpload({
          buffer: Buffer.alloc(0),
          mimeType: 'video/mp4',
          originalName: youtubeUrl,
          options,
        });
      } else if (url) {
        extraction = await extractTextFromUrl(url, options);
      } else {
        return res
          .status(400)
          .json({ error: 'Unable to process request without a valid url or youtubeUrl' });
      }

      const inferredSource = source || url || youtubeUrl || 'remote';

      const result = await upsertExtractedDocument({
        text: extraction.text,
        extractionMetadata: {
          ...extraction.metadata,
          url,
          youtubeUrl,
        },
        documentId,
        title: title || inferredSource,
        source: inferredSource,
        uploadedBy,
        workspaceId,
        tags: parseTags(tags),
        knowledgeGraph: parseJSONField(knowledgeGraph),
      });

      res.json({ status: 'ok', ...result });
    } catch (error) {
      logger.error('RAG URL ingestion failed:', error);
      res.status(500).json({ error: error.message || 'Failed to ingest remote document' });
    }
  });

  router.post('/ingest/codebase', async (req, res) => {
    try {
      const {
        rootDir = process.env.RAG_CODEBASE_ROOT || process.cwd(),
        includeExtensions,
        excludeDirs,
        maxFiles,
        batchSize,
      } = req.body || {};

      const ragService = await getRagService();
      const result = await ingestCodebase({
        ragService,
        rootDir,
        includeExtensions,
        excludeDirs,
        maxFiles,
        batchSize,
        logger,
      });

      res.json({ status: 'ok', ...result });
    } catch (error) {
      logger.error('RAG codebase ingestion failed:', error);
      res.status(500).json({ error: error.message || 'Failed to index codebase' });
    }
  });

  router.post('/search', async (req, res) => {
    try {
      const { query, topK, metadataFilter } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }

      const ragService = await getRagService();
      const results = await ragService.search(query, {
        limit: topK,
        metadataFilter,
      });
      res.json({ status: 'ok', results });
    } catch (error) {
      logger.error('RAG search failed:', error);
      res.status(500).json({ error: error.message || 'Search failed' });
    }
  });

  router.post('/chat/stream', async (req, res) => {
    try {
      const { messages, query, temperature, maxTokens, topK } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const ragService = await getRagService();
      const { stream, retrieved } = await ragService.streamChat(messages, {
        query,
        temperature,
        maxTokens,
        topK,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const contextEvent = {
        type: 'context',
        documents: retrieved,
      };
      res.write(`data: ${JSON.stringify(contextEvent)}\n\n`);

      let reader;
      if (typeof stream?.getReader === 'function') {
        reader = stream.getReader();
      }

      const textDecoder = new TextDecoder();

      const writeChunk = chunk => {
        const text =
          typeof chunk === 'string' ? chunk : textDecoder.decode(chunk, { stream: true });
        if (!text) return;
        const lines = text.split(/\n+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          res.write(`data: ${trimmed}\n\n`);
        }
      };

      const finalize = () => {
        res.write('data: [DONE]\n\n');
        res.end();
      };

      const handleError = error => {
        logger.error('RAG stream error:', error);
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: error.message || 'Stream error' })}\n\n`
        );
        res.end();
      };

      if (reader) {
        (async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              writeChunk(value);
            }
            finalize();
          } catch (error) {
            handleError(error);
          }
        })();
      } else if (stream?.on) {
        stream.on('data', writeChunk);
        stream.on('end', finalize);
        stream.on('error', handleError);
      } else {
        writeChunk(await stream?.text?.());
        finalize();
      }

      req.on('close', () => {
        try {
          res.end();
        } catch {}
      });
    } catch (error) {
      logger.error('RAG chat stream failed:', error);
      res.status(500).json({ error: error.message || 'Chat stream failed' });
    }
  });

  router.post('/styleguide/generate', async (req, res) => {
    try {
      const { prompt, temperature, maxTokens } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }

      const ragService = await getRagService();
      const theme = await ragService.generateStyleGuide(prompt, { temperature, maxTokens });
      res.json({ status: 'ok', theme });
    } catch (error) {
      logger.error('Style guide generation failed:', error);
      res.status(500).json({ error: error.message || 'Style guide generation failed' });
    }
  });

  router.get('/health', async (_req, res) => {
    try {
      // Get health status from monitor
      const healthStatus = healthMonitor.getStatus();
      const connectionStatus = managedRagService.getStatus();
      const circuitBreakerStatus = healthMonitor.getCircuitBreakerStatus();
      
      // Determine HTTP status code based on health
      let statusCode = 200;
      if (healthStatus.status === 'unhealthy' || circuitBreakerStatus.state === 'open') {
        statusCode = 503;
      } else if (healthStatus.status === 'degraded' || circuitBreakerStatus.state === 'half-open') {
        statusCode = 206;
      }
      
      // Return comprehensive health report
      res.status(statusCode).json({
        status: healthStatus.status,
        timestamp: healthStatus.timestamp,
        uptime: healthStatus.uptime,
        components: {
          database: healthStatus.database,
          vectorStore: healthStatus.vectorStore,
          embedding: healthStatus.embedding,
          llm: healthStatus.llm,
        },
        connection: connectionStatus,
        circuitBreaker: circuitBreakerStatus,
        environment: {
          hasOllama: isReadyEnvironment(),
          hasDeepSeek: hasRemoteKey(),
        },
      });
    } catch (error) {
      logger.error('RAG health check failed:', error);
      res.status(503).json({
        status: 'error',
        error: error.message || 'Failed to run RAG health check',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Add connection status endpoint
  router.get('/status', (_req, res) => {
    const status = managedRagService.getStatus();
    const circuitBreaker = healthMonitor.getCircuitBreakerStatus();
    
    res.json({
      connected: status.isConnected,
      available: managedRagService.isAvailable(),
      retryCount: status.retryCount,
      maxRetries: status.maxRetries,
      lastError: status.lastError,
      circuitBreaker: {
        state: circuitBreaker.state,
        failures: circuitBreaker.failures,
      },
      environment: {
        hasOllama: isReadyEnvironment(),
        hasDeepSeek: hasRemoteKey(),
      },
    });
  });

  // Add reconnect endpoint for manual recovery
  router.post('/reconnect', async (_req, res) => {
    try {
      logger.info('Manual RAG service reconnection requested');
      await managedRagService.reconnect();
      res.json({
        status: 'ok',
        message: 'RAG service reconnected successfully',
      });
    } catch (error) {
      logger.error('Manual reconnection failed:', error);
      res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
  });

  return router;
}
