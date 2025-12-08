#!/usr/bin/env node

/**
 * Comprehensive Data Mining Example
 * 
 * This example demonstrates all major features of the data mining system:
 * 1. Schema-driven workflow generation
 * 2. URL discovery and seeding
 * 3. Custom scraper registration
 * 4. 3D layer scraping
 * 5. Knowledge graph creation
 * 6. Data bundling and export
 * 7. Workflow simulation
 */

import DataMiningOrchestrator from './services/data-mining-orchestrator.js';
import SchemaWorkflowGenerator from './services/schema-workflow-generator.js';
import { URLSeedingService } from './services/url-seeding-service.js';
import fs from 'fs/promises';
import path from 'path';

class ComprehensiveDataMiningExample {
  constructor() {
    this.orchestrator = null;
    this.generator = null;
    this.results = {
      schemas: [],
      workflows: [],
      graphs: [],
      miningInstances: [],
      dataBundles: []
    };
  }

  /**
   * Example 1: Create and simulate a complete SEO content mining workflow
   */
  async example1_SEOContentMining() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 1: SEO Content Mining Workflow');
    console.log('='.repeat(60) + '\n');

    // Initialize generator
    this.generator = new SchemaWorkflowGenerator();

    // Generate schema from template
    console.log('Step 1: Generating schema from template...');
    const schemaId = this.generator.generateSchemaFromTemplate('seo-content-mining', {
      name: 'Complete SEO Mining Example'
    });
    this.results.schemas.push(schemaId);
    console.log(`✅ Schema created: ${schemaId}`);

    // Create knowledge graph
    console.log('\nStep 2: Creating knowledge graph...');
    const graphId = this.generator.createKnowledgeGraph(schemaId);
    const graph = this.generator.getKnowledgeGraph(graphId);
    this.results.graphs.push(graphId);
    console.log(`✅ Knowledge graph created with ${graph.nodes.length} nodes`);

    // Generate workflow configuration
    console.log('\nStep 3: Generating workflow configuration...');
    const workflowId = this.generator.generateWorkflowConfig(schemaId, graphId);
    const workflow = this.generator.getWorkflow(workflowId);
    this.results.workflows.push(workflowId);
    console.log(`✅ Workflow created with ${workflow.pipeline.length} steps`);

    // Simulate workflow
    console.log('\nStep 4: Simulating workflow execution...');
    const simulation = await this.generator.simulateWorkflow(workflowId, {
      urlCount: 25
    });
    console.log(`✅ Simulation complete:`);
    console.log(`   - Estimated duration: ${(simulation.estimatedDuration / 1000).toFixed(2)}s`);
    console.log(`   - Estimated data points: ${simulation.estimatedDataPoints}`);

    // Export workflow
    console.log('\nStep 5: Exporting workflow configuration...');
    const exportedWorkflow = this.generator.exportWorkflow(workflowId);
    console.log(`✅ Workflow exported (${(exportedWorkflow.length / 1024).toFixed(2)}KB)`);

    return { schemaId, graphId, workflowId, simulation };
  }

  /**
   * Example 2: URL discovery and seeding by topic
   */
  async example2_URLDiscovery() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 2: Automated URL Discovery');
    console.log('='.repeat(60) + '\n');

    const topics = ['react-development', 'nodejs-best-practices', 'seo-optimization'];

    for (const topic of topics) {
      console.log(`\nDiscovering URLs for topic: "${topic}"`);
      
      const seeding = new URLSeedingService({
        enableSearchAlgorithms: true,
        enableRelatedURLDiscovery: true
      });

      await seeding.start();

      const discoveredUrls = await seeding.discoverURLsByTopic(topic, {
        maxUrls: 10,
        minQuality: 0.7,
        sources: ['search', 'authority']
      });

      console.log(`✅ Discovered ${discoveredUrls.length} URLs:`);
      discoveredUrls.slice(0, 3).forEach((urlData, i) => {
        console.log(`   ${i + 1}. ${urlData.url}`);
        console.log(`      Source: ${urlData.source}, Quality: ${urlData.quality.toFixed(2)}`);
      });

      await seeding.stop();
    }
  }

  /**
   * Example 3: Register and use custom scrapers
   */
  async example3_CustomScrapers() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 3: Custom Scraper Framework');
    console.log('='.repeat(60) + '\n');

    // Initialize orchestrator
    this.orchestrator = new DataMiningOrchestrator({
      browserPoolConfig: {
        minBrowsers: 1,
        maxBrowsers: 3,
        headless: true
      }
    });
    await this.orchestrator.initialize();

    // Register multiple custom scrapers
    console.log('Registering custom scrapers...\n');

    // 1. Technical SEO Scraper
    this.orchestrator.registerCustomScraper('technical-seo', async (page, url) => {
      return await page.evaluate(() => {
        return {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          hasServiceWorker: 'serviceWorker' in navigator,
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          resourceCount: performance.getEntriesByType('resource').length,
          hasCanonical: !!document.querySelector('link[rel="canonical"]'),
          hasRobotsMeta: !!document.querySelector('meta[name="robots"]')
        };
      });
    });
    console.log('✅ Registered: technical-seo');

    // 2. Social Media Scraper
    this.orchestrator.registerCustomScraper('social-media', async (page, url) => {
      return await page.evaluate(() => {
        const socialLinks = {
          twitter: document.querySelectorAll('a[href*="twitter.com"]').length,
          facebook: document.querySelectorAll('a[href*="facebook.com"]').length,
          linkedin: document.querySelectorAll('a[href*="linkedin.com"]').length,
          github: document.querySelectorAll('a[href*="github.com"]').length
        };

        const ogTags = {};
        document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
          const prop = tag.getAttribute('property').replace('og:', '');
          ogTags[prop] = tag.getAttribute('content');
        });

        return { socialLinks, ogTags };
      });
    });
    console.log('✅ Registered: social-media');

    // 3. Content Structure Scraper
    this.orchestrator.registerCustomScraper('content-structure', async (page, url) => {
      return await page.evaluate(() => {
        const structure = {
          wordCount: document.body.innerText.split(/\s+/).length,
          paragraphs: document.querySelectorAll('p').length,
          headings: {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length,
            h4: document.querySelectorAll('h4').length,
            h5: document.querySelectorAll('h5').length,
            h6: document.querySelectorAll('h6').length
          },
          lists: {
            ul: document.querySelectorAll('ul').length,
            ol: document.querySelectorAll('ol').length
          },
          codeBlocks: document.querySelectorAll('pre, code').length,
          images: document.querySelectorAll('img').length,
          links: {
            internal: document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]').length,
            external: document.querySelectorAll('a[href^="http"]').length - document.querySelectorAll('a[href^="' + window.location.origin + '"]').length
          }
        };
        return structure;
      });
    });
    console.log('✅ Registered: content-structure\n');

    console.log('✅ Total custom scrapers registered: 3');
  }

  /**
   * Example 4: Create mining instance with all features
   */
  async example4_FullFeaturedMining() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 4: Full-Featured Mining Instance');
    console.log('='.repeat(60) + '\n');

    if (!this.orchestrator) {
      await this.example3_CustomScrapers();
    }

    console.log('Creating comprehensive mining instance...\n');

    const miningId = await this.orchestrator.createMiningInstance({
      name: 'Comprehensive Content Analysis',
      topic: 'web-development-best-practices',
      seedUrls: [
        'https://web.dev',
        'https://developer.mozilla.org'
      ],
      attributes: [
        {
          name: 'page_title',
          selector: 'title',
          dataType: 'text',
          priority: 10
        },
        {
          name: 'meta_description',
          selector: 'meta[name="description"]',
          dataType: 'attribute',
          attributeName: 'content',
          priority: 9
        },
        {
          name: 'main_heading',
          selector: 'h1',
          dataType: 'text',
          priority: 9
        },
        {
          name: 'subheadings',
          selector: 'h2, h3',
          dataType: 'text',
          priority: 7,
          multiple: true
        },
        {
          name: 'article_links',
          selector: 'article a',
          dataType: 'url',
          priority: 6,
          multiple: true
        }
      ],
      customScrapers: [
        'technical-seo',
        'social-media',
        'content-structure',
        'seo-metadata',
        'performance-metrics',
        'accessibility'
      ],
      enableAutoSeeding: true,
      enable3DLayer: false,
      config: {
        timeout: 30000,
        maxUrls: 20,
        rateLimitMs: 2000
      }
    });

    this.results.miningInstances.push(miningId);

    console.log(`✅ Mining instance created: ${miningId}`);
    console.log('\nInstance Configuration:');
    console.log('   - Topic: web-development-best-practices');
    console.log('   - Seed URLs: 2');
    console.log('   - Attributes: 5');
    console.log('   - Custom Scrapers: 6');
    console.log('   - Auto URL Seeding: Enabled');
    console.log('   - 3D Layer Scraping: Disabled');

    // Get stats
    const stats = this.orchestrator.getStats();
    console.log('\n📊 Orchestrator Stats:');
    console.log(`   - Active Instances: ${stats.activeInstances}`);
    console.log(`   - Browser Pool: ${stats.browserPoolStats.browsers || 0} browsers`);
  }

  /**
   * Example 5: Export and save results
   */
  async example5_ExportResults() {
    console.log('\n' + '='.repeat(60));
    console.log('Example 5: Export Results');
    console.log('='.repeat(60) + '\n');

    // Create output directory
    const outputDir = path.join(process.cwd(), 'data-mining-output');
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Export schemas
    console.log('Exporting schemas...');
    for (const schemaId of this.results.schemas) {
      const schema = this.generator.getSchema(schemaId);
      const filePath = path.join(outputDir, `schema-${schemaId}.json`);
      await fs.writeFile(filePath, JSON.stringify(schema, null, 2));
      console.log(`✅ Exported: ${filePath}`);
    }

    // Export knowledge graphs
    console.log('\nExporting knowledge graphs...');
    for (const graphId of this.results.graphs) {
      const graph = this.generator.getKnowledgeGraph(graphId);
      const filePath = path.join(outputDir, `knowledge-graph-${graphId}.json`);
      await fs.writeFile(filePath, JSON.stringify(graph, null, 2));
      console.log(`✅ Exported: ${filePath}`);
    }

    // Export workflows
    console.log('\nExporting workflows...');
    for (const workflowId of this.results.workflows) {
      const workflow = this.generator.getWorkflow(workflowId);
      const filePath = path.join(outputDir, `workflow-${workflowId}.json`);
      await fs.writeFile(filePath, JSON.stringify(workflow, null, 2));
      console.log(`✅ Exported: ${filePath}`);
    }

    console.log(`\n✅ All results exported to: ${outputDir}`);
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   Comprehensive Data Mining System - All Examples         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    try {
      await this.example1_SEOContentMining();
      await this.example2_URLDiscovery();
      await this.example3_CustomScrapers();
      await this.example4_FullFeaturedMining();
      await this.example5_ExportResults();

      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('✅ All Examples Completed Successfully!');
      console.log('='.repeat(60) + '\n');

      console.log('Summary:');
      console.log(`   - Schemas Created: ${this.results.schemas.length}`);
      console.log(`   - Knowledge Graphs: ${this.results.graphs.length}`);
      console.log(`   - Workflows Generated: ${this.results.workflows.length}`);
      console.log(`   - Mining Instances: ${this.results.miningInstances.length}`);
      console.log('\nCheck the "data-mining-output" directory for exported files.\n');

    } catch (error) {
      console.error('\n❌ Example failed:', error);
      throw error;
    } finally {
      // Cleanup
      if (this.orchestrator) {
        await this.orchestrator.shutdown();
      }
    }
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = new ComprehensiveDataMiningExample();
  example.runAllExamples().catch(console.error);
}

export default ComprehensiveDataMiningExample;
