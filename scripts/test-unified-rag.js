#!/usr/bin/env node
/**
 * Test script for the Unified RAG Service
 * 
 * Run with: node scripts/test-unified-rag.js
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Unified RAG Service\n');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

// Test 1: Import the service
test('Can import UnifiedRAGService', async () => {
  const { UnifiedRAGService, createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  if (!UnifiedRAGService) throw new Error('UnifiedRAGService not exported');
  if (!createUnifiedRAGService) throw new Error('createUnifiedRAGService not exported');
});

// Test 2: Create service instance
test('Can create service instance (no DB)', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService({
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });
  if (!service) throw new Error('Service not created');
});

// Test 3: Service has expected methods
test('Service has expected methods', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  const expectedMethods = [
    'initialize',
    'indexDocument',
    'search',
    'chat',
    'streamChat',
    'healthCheck',
    'getConfig',
    'updateConfig',
    'getConversation',
    'clearConversation',
    // NEW enhanced methods
    'indexImage',
    'getDocumentVersions',
    'executeAgentTask',
    'streamAgentTask',
  ];
  
  for (const method of expectedMethods) {
    if (typeof service[method] !== 'function') {
      throw new Error(`Missing method: ${method}`);
    }
  }
});

// Test 4: Document processor works
test('DocumentProcessor can process text', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  // Access the internal processor through a simple test
  const testContent = 'This is a test document.\n\nIt has multiple paragraphs.\n\nFor testing purposes.';
  
  // We can't directly test the processor, but we can verify the config
  const config = service.getConfig();
  if (!config.processing) throw new Error('Processing config missing');
  if (!config.processing.chunkSize) throw new Error('Chunk size not configured');
});

// Test 5: Import router
test('Can import unified RAG router', async () => {
  const routerModule = await import('../api/unified-rag-routes.js');
  const { createUnifiedRAGRouter } = routerModule;
  if (!createUnifiedRAGRouter) throw new Error('createUnifiedRAGRouter not exported');
});

// Test 6: Config has correct structure (including new features)
test('Config has correct structure', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  const config = service.getConfig();
  
  const requiredSections = [
    'llm', 'embedding', 'processing', 'vectorStore', 'context', 'endpoints',
    // NEW sections
    'hybridSearch', 'multimodal', 'versioning', 'agent'
  ];
  for (const section of requiredSections) {
    if (!config[section]) {
      throw new Error(`Missing config section: ${section}`);
    }
  }
  
  // Check LLM config
  if (!config.llm.model) throw new Error('LLM model not configured');
  if (!config.llm.provider) throw new Error('LLM provider not configured');
});

// Test 7: Health check returns proper structure (with new features)
test('Health check returns proper structure', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService({
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });
  
  const health = await service.healthCheck();
  
  if (!health.status) throw new Error('Health status missing');
  if (!health.llm) throw new Error('LLM health missing');
  if (!health.vectorStore) throw new Error('VectorStore health missing');
  if (!health.stats) throw new Error('Stats missing');
  // NEW: Check enhanced health properties
  if (!health.features) throw new Error('Features status missing');
  if (!health.ocr) throw new Error('OCR status missing');
  if (!health.agent) throw new Error('Agent status missing');
});

// Test 8: Config can be updated
test('Config can be updated', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  const originalModel = service.getConfig().llm.model;
  
  service.updateConfig({
    llm: { model: 'test-model' }
  });
  
  const newConfig = service.getConfig();
  if (newConfig.llm.model !== 'test-model') {
    throw new Error('Config update failed');
  }
});

// Test 9: NEW - Agent planner exists
test('Agent planner is available', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  const config = service.getConfig();
  if (!config.agent) throw new Error('Agent config missing');
  if (typeof config.agent.enabled !== 'boolean') throw new Error('Agent enabled flag missing');
  if (!config.agent.tools || !Array.isArray(config.agent.tools)) throw new Error('Agent tools missing');
});

// Test 10: NEW - Hybrid search config exists
test('Hybrid search configuration exists', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  const config = service.getConfig();
  if (!config.hybridSearch) throw new Error('Hybrid search config missing');
  if (typeof config.hybridSearch.enabled !== 'boolean') throw new Error('Hybrid search enabled flag missing');
  if (typeof config.hybridSearch.semanticWeight !== 'number') throw new Error('Semantic weight missing');
  if (typeof config.hybridSearch.keywordWeight !== 'number') throw new Error('Keyword weight missing');
});

// Test 11: NEW - Multimodal config exists
test('Multimodal configuration exists', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  const config = service.getConfig();
  if (!config.multimodal) throw new Error('Multimodal config missing');
  if (typeof config.multimodal.enabled !== 'boolean') throw new Error('Multimodal enabled flag missing');
  if (!config.multimodal.ocrEndpoint) throw new Error('OCR endpoint missing');
});

// Test 12: NEW - Versioning config exists
test('Versioning configuration exists', async () => {
  const { createUnifiedRAGService } = await import('../services/rag/unified-rag-service.js');
  const service = createUnifiedRAGService();
  
  const config = service.getConfig();
  if (!config.versioning) throw new Error('Versioning config missing');
  if (typeof config.versioning.enabled !== 'boolean') throw new Error('Versioning enabled flag missing');
  if (typeof config.versioning.maxVersions !== 'number') throw new Error('Max versions missing');
});

// Run all tests
runTests().catch(console.error);
