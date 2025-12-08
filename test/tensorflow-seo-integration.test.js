/**
 * Test Suite for TensorFlow SEO Integration
 * 
 * Tests the TensorFlow models, pre-trained network, and crawler integration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SEOModelRegistry, SEO_MODELS } from '../src/ml/seo-tensorflow-models.js';
import { PretrainedSEONetwork } from '../src/ml/pretrained-seo-network.js';
import { 
  TensorFlowEnhancedCrawler, 
  TensorFlowEnhancedSeeder,
  TensorFlowSEOSystem 
} from '../src/ml/tensorflow-crawler-integration.js';
import fs from 'fs/promises';
import path from 'path';

describe('TensorFlow SEO Model Registry', () => {
  let registry;

  beforeAll(() => {
    registry = new SEOModelRegistry();
  });

  afterAll(() => {
    if (registry) {
      registry.disposeAll();
    }
  });

  it('should list all available models', () => {
    const models = registry.listModels();
    expect(models).toBeInstanceOf(Array);
    expect(models.length).toBe(11); // 11 predefined models
    expect(models[0]).toHaveProperty('name');
    expect(models[0]).toHaveProperty('version');
    expect(models[0]).toHaveProperty('useCase');
  });

  it('should get model configuration', () => {
    const config = registry.getModelConfig('CONTENT_QUALITY');
    expect(config).toBeDefined();
    expect(config.name).toBe('Content Quality Analyzer');
    expect(config.inputDimensions).toBe(50);
    expect(config.outputDimensions).toBe(10);
    expect(config.architecture).toBe('feedforward');
  });

  it('should initialize a model', async () => {
    await registry.initializeModel('CONTENT_QUALITY');
    expect(registry.isModelInitialized('CONTENT_QUALITY')).toBe(true);
    
    const model = registry.getModel('CONTENT_QUALITY');
    expect(model).toBeDefined();
  });

  it('should get model metadata', async () => {
    if (!registry.isModelInitialized('CONTENT_QUALITY')) {
      await registry.initializeModel('CONTENT_QUALITY');
    }
    
    const metadata = registry.getModelMetadata('CONTENT_QUALITY');
    expect(metadata).toBeDefined();
    expect(metadata.name).toBe('Content Quality Analyzer');
    expect(metadata.initialized).toBe(true);
    expect(metadata.inputDimensions).toBe(50);
  });

  it('should handle master model initialization', async () => {
    await registry.initializeModel('MASTER_SEO_PREDICTOR');
    expect(registry.isModelInitialized('MASTER_SEO_PREDICTOR')).toBe(true);
    
    const metadata = registry.getModelMetadata('MASTER_SEO_PREDICTOR');
    expect(metadata.inputDimensions).toBe(192);
    expect(metadata.outputDimensions).toBe(50);
    expect(metadata.architecture).toBe('ensemble');
  });
});

describe('Pre-trained SEO Network', () => {
  let network;
  const testModelPath = './test-models';

  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(testModelPath, { recursive: true });
    
    network = new PretrainedSEONetwork({
      modelPath: testModelPath,
      autoSave: false,
      continuousLearning: false
    });
  });

  afterAll(async () => {
    if (network) {
      await network.dispose();
    }
    
    // Clean up test directory
    try {
      await fs.rm(testModelPath, { recursive: true, force: true });
    } catch (err) {
      console.warn('Failed to clean up test directory:', err);
    }
  });

  it('should initialize successfully', async () => {
    await network.initialize();
    const status = network.getStatus();
    
    expect(status.initialized).toBe(true);
    expect(status.modelVersion).toBe('1.0.0');
  });

  it('should convert attributes to feature vector', () => {
    const testAttributes = {
      titleLength: 50,
      metaDescriptionLength: 150,
      wordCount: 500,
      h1Count: 1,
      h2Count: 3,
      internalLinksCount: 10,
      totalImages: 5,
      isSecure: true,
      hasViewportMeta: true,
      seoScore: 75,
      overallScore: 0.75
    };

    const features = network.attributesToFeatureVector(testAttributes);
    expect(features).toBeInstanceOf(Array);
    expect(features.length).toBe(192);
    expect(features.every(f => f >= 0 && f <= 1)).toBe(true);
  });

  it('should make predictions', async () => {
    await network.initialize();
    
    const testFeatures = new Array(192).fill(0.5);
    const predictions = await network.predict(testFeatures);
    
    expect(predictions).toBeInstanceOf(Array);
    expect(predictions.length).toBe(50);
    expect(predictions.every(p => p >= 0 && p <= 1)).toBe(true);
  });

  it('should generate recommendations', async () => {
    const testAttributes = {
      title: 'Test',
      titleLength: 4,
      metaDescription: '',
      metaDescriptionLength: 0,
      seoScore: 30
    };

    const testPredictions = new Array(50).fill(0);
    testPredictions[0] = 0.95; // High confidence for title optimization
    testPredictions[1] = 0.88; // High confidence for meta description

    const recommendations = network.generateRecommendations(testAttributes, testPredictions);
    
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty('title');
    expect(recommendations[0]).toHaveProperty('confidence');
    expect(recommendations[0]).toHaveProperty('priority');
    expect(recommendations[0]).toHaveProperty('estimatedImpact');
  });

  it('should generate synthetic training data', () => {
    const samples = network.generateSyntheticTrainingData(10);
    
    expect(samples).toBeInstanceOf(Array);
    expect(samples.length).toBe(10);
    expect(samples[0]).toHaveProperty('features');
    expect(samples[0]).toHaveProperty('labels');
    expect(samples[0].features.length).toBe(192);
    expect(samples[0].labels.length).toBe(50);
  });
});

describe('TensorFlow Enhanced Crawler', () => {
  let crawler;

  beforeAll(async () => {
    crawler = new TensorFlowEnhancedCrawler({
      enableML: true,
      autoLearn: false,
      modelPath: './test-models'
    });
    await crawler.initialize();
  });

  afterAll(async () => {
    if (crawler) {
      await crawler.dispose();
    }
  });

  it('should crawl page with ML enhancement', async () => {
    const testURL = 'https://test.example.com';
    const testHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Test Page Title</title>
        <meta name="description" content="Test page description">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <h1>Main Heading</h1>
        <p>Test content paragraph.</p>
      </body>
      </html>
    `;

    const attributes = await crawler.crawlPage(testURL, testHTML);
    
    expect(attributes).toBeDefined();
    expect(attributes.url).toBe(testURL);
    expect(attributes.title).toBe('Test Page Title');
    expect(attributes.processedWithML).toBe(true);
    expect(attributes).toHaveProperty('mlPredictions');
    expect(attributes).toHaveProperty('mlConfidence');
    expect(attributes).toHaveProperty('mlRecommendations');
  });

  it('should track crawler statistics', async () => {
    const stats = crawler.getStats();
    
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('totalPages');
    expect(stats).toHaveProperty('pagesWithML');
    expect(stats).toHaveProperty('mlEnabled');
    expect(stats).toHaveProperty('autoLearnEnabled');
    expect(stats.mlEnabled).toBe(true);
  });

  it('should handle batch crawling', async () => {
    const urls = [
      { url: 'https://test1.com', html: '<html><head><title>Test 1</title></head></html>' },
      { url: 'https://test2.com', html: '<html><head><title>Test 2</title></head></html>' },
      { url: 'https://test3.com', html: '<html><head><title>Test 3</title></head></html>' }
    ];

    const results = await crawler.crawlBatch(urls, { concurrency: 2 });
    
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBe(3);
  });
});

describe('TensorFlow Enhanced Seeder', () => {
  let seeder;

  beforeAll(async () => {
    seeder = new TensorFlowEnhancedSeeder({
      enableML: true,
      priorityThreshold: 0.8,
      maxQueueSize: 100
    });
    await seeder.initialize();
  });

  afterAll(async () => {
    if (seeder) {
      await seeder.dispose();
    }
  });

  it('should seed URL with priority', async () => {
    const seed = await seeder.seedURL('https://test.com', {
      html: '<html><head><title>Test Page</title></head></html>'
    });

    expect(seed).toBeDefined();
    expect(seed.url).toBe('https://test.com');
    expect(seed).toHaveProperty('priority');
    expect(seed.priority).toBeGreaterThanOrEqual(0);
    expect(seed.priority).toBeLessThanOrEqual(1);
  });

  it('should prioritize high-quality content', async () => {
    const highQualityHTML = `
      <html>
      <head>
        <title>Comprehensive SEO Guide - Best Practices 2024</title>
        <meta name="description" content="A detailed guide covering all aspects of SEO optimization including technical, on-page, and off-page strategies.">
      </head>
      <body>
        <h1>Complete SEO Guide</h1>
        ${'<p>Quality content. </p>'.repeat(100)}
      </body>
      </html>
    `;

    const lowQualityHTML = '<html><head><title>Page</title></head><body><p>Text</p></body></html>';

    const highQualitySeed = await seeder.seedURL('https://high-quality.com', { html: highQualityHTML });
    const lowQualitySeed = await seeder.seedURL('https://low-quality.com', { html: lowQualityHTML });

    expect(highQualitySeed.priority).toBeGreaterThan(lowQualitySeed.priority);
  });

  it('should manage priority queue', async () => {
    seeder.clearQueue();

    await seeder.seedURL('https://medium.com', { priority: 0.5 });
    await seeder.seedURL('https://high.com', { priority: 0.9 });
    await seeder.seedURL('https://low.com', { priority: 0.2 });

    const topURLs = seeder.getTopURLs(3);
    
    expect(topURLs[0].url).toBe('https://high.com');
    expect(topURLs[2].url).toBe('https://low.com');
  });

  it('should track seeder statistics', () => {
    const stats = seeder.getStats();
    
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('totalSeeded');
    expect(stats).toHaveProperty('highPrioritySeeds');
    expect(stats).toHaveProperty('averagePriority');
    expect(stats).toHaveProperty('queueSize');
  });
});

describe('TensorFlow SEO System', () => {
  let system;

  beforeAll(async () => {
    system = new TensorFlowSEOSystem({
      enableML: true,
      autoLearn: false,
      modelPath: './test-models'
    });
    await system.initialize();
  });

  afterAll(async () => {
    if (system) {
      await system.dispose();
    }
  });

  it('should initialize complete system', () => {
    const status = system.getStatus();
    
    expect(status).toBeDefined();
    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('crawler');
    expect(status).toHaveProperty('seeder');
  });

  it('should start and stop system', async () => {
    await system.start();
    expect(system.isRunning).toBe(true);
    
    await system.stop();
    expect(system.isRunning).toBe(false);
  });

  it('should emit events', (done) => {
    let eventsFired = 0;

    system.on('systemStarted', () => {
      eventsFired++;
      if (eventsFired === 2) done();
    });

    system.on('systemStopped', () => {
      eventsFired++;
      if (eventsFired === 2) done();
    });

    system.start().then(() => system.stop());
  });
});

describe('Model Architectures', () => {
  it('should have correct model definitions', () => {
    expect(SEO_MODELS).toBeDefined();
    expect(Object.keys(SEO_MODELS).length).toBe(11);
    
    // Check master model
    expect(SEO_MODELS.MASTER_SEO_PREDICTOR).toBeDefined();
    expect(SEO_MODELS.MASTER_SEO_PREDICTOR.inputDimensions).toBe(192);
    expect(SEO_MODELS.MASTER_SEO_PREDICTOR.outputDimensions).toBe(50);
  });

  it('should have diverse architectures', () => {
    const architectures = new Set();
    
    Object.values(SEO_MODELS).forEach(model => {
      architectures.add(model.architecture);
    });

    expect(architectures.has('feedforward')).toBe(true);
    expect(architectures.has('lstm')).toBe(true);
    expect(architectures.has('transformer')).toBe(true);
    expect(architectures.has('cnn')).toBe(true);
    expect(architectures.has('ensemble')).toBe(true);
  });

  it('should have proper layer configurations', () => {
    Object.values(SEO_MODELS).forEach(model => {
      expect(model.layers).toBeInstanceOf(Array);
      expect(model.layers.length).toBeGreaterThan(0);
      expect(model.inputDimensions).toBeGreaterThan(0);
      expect(model.outputDimensions).toBeGreaterThan(0);
    });
  });
});
