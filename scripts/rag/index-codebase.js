#!/usr/bin/env node
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

import { ingestCodebase } from '../../services/rag/codebase-ingestor.js';
import createDeepSeekClient from '../../services/rag/deepseek-client.js';
import createOllamaEmbeddingClient from '../../services/rag/ollama-embedding-client.js';
import createEmbeddingClient from '../../services/rag/openai-embedding-client.js';
import createRagService from '../../services/rag/rag-service.js';
import createVectorStore from '../../services/rag/vector-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv();

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--root' || arg === '--dir') {
      options.rootDir = args[i + 1];
      i += 1;
    } else if (arg === '--max-files') {
      options.maxFiles = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (arg === '--batch-size') {
      options.batchSize = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (arg === '--ext') {
      options.includeExtensions = args[i + 1]
        .split(',')
        .map(ext => (ext.startsWith('.') ? ext : `.${ext}`));
      i += 1;
    } else if (arg === '--exclude') {
      options.excludeDirs = args[i + 1].split(',');
      i += 1;
    }
  }
  return options;
}

function hasRemoteKey() {
  return Boolean(process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY);
}

async function main() {
  const options = parseArgs();
  const rootDir = path.resolve(
    options.rootDir || process.env.RAG_CODEBASE_ROOT || path.join(__dirname, '..', '..')
  );
  const logger = console;

  logger.log(`\n🔎 Indexing codebase for RAG from ${rootDir}`);

  const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 5,
  });

  try {
    const vectorStore = createVectorStore(db, { logger });

    const preferredOllamaEndpoint = (
      process.env.OLLAMA_ENDPOINT ||
      process.env.OLLAMA_API_URL ||
      'http://127.0.0.1:11434'
    ).replace(/\/$/, '');
    const embeddingPreference =
      process.env.RAG_EMBED_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : 'ollama');

    let embeddingClient;
    if (embeddingPreference === 'ollama') {
      embeddingClient = createOllamaEmbeddingClient({ baseUrl: preferredOllamaEndpoint });
    } else {
      try {
        embeddingClient = createEmbeddingClient({});
      } catch (error) {
        logger.warn(`Falling back to Ollama embeddings: ${error.message}`);
        embeddingClient = createOllamaEmbeddingClient({ baseUrl: preferredOllamaEndpoint });
      }
    }

    let localAvailable = true;
    try {
      const probe = await fetch(`${preferredOllamaEndpoint.replace(/\/$/, '')}/api/tags`, {
        method: 'GET',
      });
      if (!probe.ok) {
        throw new Error(`status ${probe.status}`);
      }
    } catch (error) {
      localAvailable = false;
      logger.warn(`Local Ollama not reachable at ${preferredOllamaEndpoint}: ${error.message}`);
    }

    if (!localAvailable && !hasRemoteKey()) {
      throw new Error(
        'No available chat provider. Start Ollama or configure DEEPSEEK_API_KEY/DEEPSEEK_KEY.'
      );
    }

    const deepseekClient = createDeepSeekClient({
      baseUrl: localAvailable
        ? preferredOllamaEndpoint
        : process.env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_BASE_URL,
    });
    const ragService = createRagService({
      vectorStore,
      embeddingClient,
      deepseekClient,
      logger,
    });

    await vectorStore.init?.();

    const result = await ingestCodebase({
      ragService,
      rootDir,
      includeExtensions: options.includeExtensions,
      excludeDirs: options.excludeDirs,
      maxFiles: options.maxFiles,
      batchSize: options.batchSize,
      logger,
    });

    logger.log('\n✅ Codebase indexing complete');
    logger.log(`   Files processed: ${result.documentsProcessed}/${result.filesRequested}`);
    logger.log(`   Chunks generated: ${result.chunksProcessed}`);
    logger.log(`   Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
  } catch (error) {
    logger.error('\n❌ Codebase indexing failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();
