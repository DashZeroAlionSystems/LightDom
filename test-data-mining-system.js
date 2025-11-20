/**
 * Tests for Advanced Data Mining System
 */

import HeadlessBrowserPool from './services/headless-browser-pool.js';
import DataMiningOrchestrator from './services/data-mining-orchestrator.js';
import SchemaWorkflowGenerator from './services/schema-workflow-generator.js';
import { URLSeedingService } from './services/url-seeding-service.js';
import assert from 'assert';

async function testBrowserPool() {
  console.log('Testing Browser Pool...');
  
  const pool = new HeadlessBrowserPool({
    minBrowsers: 1,
    maxBrowsers: 2,
    headless: true
  });
  
  // Should initialize
  await pool.initialize();
  assert(pool.isInitialized, 'Pool should be initialized');
  
  // Should get stats
  const stats = pool.getStats();
  assert(stats.browsers >= 1, 'Should have at least 1 browser');
  
  // Should shut down
  await pool.shutdown();
  assert(!pool.isInitialized, 'Pool should be shut down');
  
  console.log('✅ Browser Pool tests passed');
}

async function testSchemaGenerator() {
  console.log('Testing Schema Generator...');
  
  const generator = new SchemaWorkflowGenerator();
  
  // Should generate schema from template
  const schemaId = generator.generateSchemaFromTemplate('seo-content-mining');
  assert(schemaId, 'Should generate schema ID');
  
  // Should retrieve schema
  const schema = generator.getSchema(schemaId);
  assert(schema, 'Should retrieve schema');
  assert(schema.name, 'Schema should have name');
  assert(schema.attributes, 'Schema should have attributes');
  
  // Should create knowledge graph
  const graphId = generator.createKnowledgeGraph(schemaId);
  assert(graphId, 'Should generate graph ID');
  
  const graph = generator.getKnowledgeGraph(graphId);
  assert(graph.nodes, 'Graph should have nodes');
  assert(graph.edges, 'Graph should have edges');
  
  // Should generate workflow
  const workflowId = generator.generateWorkflowConfig(schemaId, graphId);
  assert(workflowId, 'Should generate workflow ID');
  
  const workflow = generator.getWorkflow(workflowId);
  assert(workflow.pipeline, 'Workflow should have pipeline');
  assert(workflow.pipeline.length > 0, 'Pipeline should have steps');
  
  console.log('✅ Schema Generator tests passed');
}

async function testURLSeeding() {
  console.log('Testing URL Seeding...');
  
  const seeding = new URLSeedingService({
    maxSeedsPerInstance: 100
  });
  
  // Should start service
  await seeding.start();
  assert(seeding.isRunning, 'Service should be running');
  
  // Should add seed
  const seed = await seeding.addSeed('https://example.com', {
    topic: 'test',
    priority: 5
  });
  assert(seed, 'Should add seed');
  assert(seed.url, 'Seed should have URL');
  
  // Should discover URLs by topic
  const discovered = await seeding.discoverURLsByTopic('test-topic', {
    maxUrls: 5,
    minQuality: 0.5
  });
  assert(Array.isArray(discovered), 'Should return array');
  
  // Should stop service
  await seeding.stop();
  assert(!seeding.isRunning, 'Service should be stopped');
  
  console.log('✅ URL Seeding tests passed');
}

async function testOrchestrator() {
  console.log('Testing Data Mining Orchestrator...');
  
  const orchestrator = new DataMiningOrchestrator({
    browserPoolConfig: {
      minBrowsers: 1,
      maxBrowsers: 2,
      headless: true
    }
  });
  
  // Should initialize
  await orchestrator.initialize();
  assert(orchestrator.isInitialized, 'Orchestrator should be initialized');
  
  // Should register custom scraper
  orchestrator.registerCustomScraper('test-scraper', async (page) => {
    return { test: true };
  });
  assert(orchestrator.customScrapers.has('test-scraper'), 'Should register scraper');
  
  // Should create mining instance
  const miningId = await orchestrator.createMiningInstance({
    name: 'Test Mining',
    topic: 'test',
    seedUrls: [],
    attributes: [],
    enableAutoSeeding: false,
    enable3DLayer: false
  });
  assert(miningId, 'Should create mining instance');
  
  // Should get stats
  const stats = orchestrator.getStats();
  assert(stats, 'Should get stats');
  
  // Should shut down
  await orchestrator.shutdown();
  assert(!orchestrator.isInitialized, 'Orchestrator should be shut down');
  
  console.log('✅ Orchestrator tests passed');
}

async function runAllTests() {
  console.log('�� Running Data Mining System Tests\n');
  
  try {
    await testSchemaGenerator();
    await testURLSeeding();
    await testBrowserPool();
    await testOrchestrator();
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

runAllTests();
