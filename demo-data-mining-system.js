#!/usr/bin/env node

/**
 * Advanced Data Mining System Demo
 * Demonstrates headless browser pool, schema workflows, and URL seeding
 */

import HeadlessBrowserPool from './services/headless-browser-pool.js';
import DataMiningOrchestrator from './services/data-mining-orchestrator.js';
import SchemaWorkflowGenerator from './services/schema-workflow-generator.js';
import { URLSeedingService } from './services/url-seeding-service.js';

async function runDemo() {
  console.log('🚀 Advanced Data Mining System Demo\n');

  try {
    // Demo 1: Browser Pool
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Demo 1: Browser Pool Management');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pool = new HeadlessBrowserPool({ minBrowsers: 2, maxBrowsers: 5, headless: true });
    await pool.initialize();
    console.log('✅ Browser pool initialized');
    console.log('Stats:', pool.getStats());
    await pool.shutdown();

    // Demo 2: Schema Generator
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🕸️  Demo 2: Schema & Workflow Generation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const generator = new SchemaWorkflowGenerator();
    const schemaId = generator.generateSchemaFromTemplate('seo-content-mining');
    console.log('✅ Schema generated:', schemaId);

    const graphId = generator.createKnowledgeGraph(schemaId);
    console.log('✅ Knowledge graph created:', graphId);

    const workflowId = generator.generateWorkflowConfig(schemaId, graphId);
    console.log('✅ Workflow config generated:', workflowId);

    // Demo 3: URL Seeding
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌱 Demo 3: URL Seeding & Discovery');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const seeding = new URLSeedingService();
    await seeding.start();
    const urls = await seeding.discoverURLsByTopic('react-development', { maxUrls: 10 });
    console.log(`✅ Discovered ${urls.length} URLs for react-development`);
    await seeding.stop();

    console.log('\n✅ All demos completed successfully!\n');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

runDemo();
