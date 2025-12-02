#!/usr/bin/env node

/**
 * Simple RAG Test Script
 * 
 * Tests the RAG system end-to-end:
 * 1. Health check
 * 2. Index a document
 * 3. Search for content
 * 4. Chat with context
 * 
 * Usage:
 *   node scripts/test-simple-rag.js
 *   node scripts/test-simple-rag.js --endpoint http://localhost:3001
 */

const RAG_ENDPOINT = process.env.RAG_ENDPOINT || 'http://localhost:3001/api/rag';

// Parse command line args
const args = process.argv.slice(2);
let endpoint = RAG_ENDPOINT;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--endpoint' && args[i + 1]) {
    endpoint = args[i + 1];
    if (!endpoint.endsWith('/api/rag')) {
      endpoint = endpoint.replace(/\/$/, '') + '/api/rag';
    }
  }
}

console.log('='.repeat(60));
console.log('LightDom Simple RAG Test');
console.log('='.repeat(60));
console.log(`Endpoint: ${endpoint}`);
console.log('');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await fn();
    console.log('✅ PASSED');
    passed++;
  } catch (error) {
    console.log('❌ FAILED');
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

async function main() {
  // Test 1: Health check
  await test('Health Check', async () => {
    const response = await fetch(`${endpoint}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'ok') {
      console.log(`   Warning: Status is ${data.status}`);
    }
  });

  // Test 2: Get config
  await test('Get Config', async () => {
    const response = await fetch(`${endpoint}/config`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data.embeddingModel) {
      throw new Error('Missing embeddingModel in config');
    }
    console.log(`   Model: ${data.llmModel}, Embedding: ${data.embeddingModel}`);
  });

  // Test 3: Index a test document
  await test('Index Document', async () => {
    const response = await fetch(`${endpoint}/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: {
          id: 'test-doc-1',
          content: `
            LightDom is a revolutionary DOM optimization platform that combines 
            blockchain technology with web performance analytics. The platform 
            features proof-of-optimization mining, where users can earn tokens 
            by identifying and implementing DOM optimizations.
            
            Key features include:
            - Web crawler for automatic site analysis
            - Real-time DOM performance monitoring
            - Blockchain-based optimization proofs
            - Metaverse bridge integration
            - NFT marketplace for optimizations
            
            The mining algorithm analyzes DOM structures and rewards users for 
            identifying inefficiencies and suggesting improvements.
          `,
          metadata: { type: 'documentation', version: '1.0' },
        },
      }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Index returned success=false');
    }
    console.log(`   Indexed ${data.indexed} document(s)`);
  });

  // Test 4: List documents
  await test('List Documents', async () => {
    const response = await fetch(`${endpoint}/documents`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log(`   Found ${data.count} document(s)`);
  });

  // Test 5: Search
  await test('Vector Search', async () => {
    const response = await fetch(`${endpoint}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What is proof of optimization mining?',
        topK: 3,
      }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Search returned success=false');
    }
    console.log(`   Found ${data.results.length} result(s), top score: ${data.results[0]?.score?.toFixed(3) || 'N/A'}`);
  });

  // Test 6: RAG Chat
  await test('RAG Chat', async () => {
    const response = await fetch(`${endpoint}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What are the key features of LightDom?',
        topK: 3,
      }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Chat returned success=false');
    }
    
    console.log(`   Response: ${data.response?.substring(0, 100)}...`);
    console.log(`   Context: ${data.context?.documents?.length || 0} docs used`);
    console.log(`   Timing: ${data.timing?.total}ms total`);
  });

  // Test 7: Get stats
  await test('Get Statistics', async () => {
    const response = await fetch(`${endpoint}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log(`   Documents: ${data.documents}, Chunks: ${data.chunks}, Queries: ${data.queries}`);
  });

  // Test 8: Delete test document (cleanup)
  await test('Delete Document', async () => {
    const response = await fetch(`${endpoint}/documents/test-doc-1`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error('Delete returned success=false');
    }
  });

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
