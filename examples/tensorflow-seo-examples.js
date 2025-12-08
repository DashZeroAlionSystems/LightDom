/**
 * Example: TensorFlow SEO Data Mining
 * 
 * This script demonstrates how to use the TensorFlow-powered SEO system
 * for intelligent crawling, learning, and optimization recommendations.
 */

import { TensorFlowSEOSystem, TensorFlowEnhancedCrawler, TensorFlowEnhancedSeeder } from './src/ml/tensorflow-crawler-integration.js';
import { SEOModelRegistry } from './src/ml/seo-tensorflow-models.js';
import puppeteer from 'puppeteer';

console.log('🚀 TensorFlow SEO Data Mining Example\n');

/**
 * Example 1: Basic ML-Enhanced Crawling
 */
async function example1_BasicCrawling() {
  console.log('📝 Example 1: Basic ML-Enhanced Crawling');
  console.log('='.repeat(50));
  
  const crawler = new TensorFlowEnhancedCrawler({
    enableML: true,
    autoLearn: true,
    modelPath: './models/seo',
    minConfidence: 0.7
  });
  
  await crawler.initialize();
  
  // Simulate crawling a page
  const testURL = 'https://example.com';
  const testHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Example Website - SEO Best Practices</title>
      <meta name="description" content="Learn about SEO best practices and optimization techniques.">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="canonical" href="https://example.com">
    </head>
    <body>
      <h1>SEO Best Practices</h1>
      <h2>Content Optimization</h2>
      <p>Content optimization is crucial for SEO success...</p>
      <img src="image.jpg" alt="SEO diagram">
    </body>
    </html>
  `;
  
  console.log(`\n🔍 Crawling: ${testURL}`);
  const attributes = await crawler.crawlPage(testURL, testHTML);
  
  console.log('\n📊 Results:');
  console.log(`  SEO Score: ${attributes.seoScore}`);
  console.log(`  ML Confidence: ${attributes.mlConfidence?.toFixed(2)}`);
  console.log(`  Recommendations: ${attributes.mlRecommendations?.length || 0}`);
  
  if (attributes.mlRecommendations && attributes.mlRecommendations.length > 0) {
    console.log('\n🎯 Top 5 Recommendations:');
    attributes.mlRecommendations.slice(0, 5).forEach((rec, idx) => {
      console.log(`  ${idx + 1}. ${rec.title} (${rec.category})`);
      console.log(`     Priority: ${rec.priority}, Impact: ${rec.estimatedImpact}`);
      console.log(`     Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    });
  }
  
  const stats = crawler.getStats();
  console.log('\n📈 Crawler Statistics:');
  console.log(`  Total Pages: ${stats.totalPages}`);
  console.log(`  ML Enabled: ${stats.mlEnabled}`);
  console.log(`  Auto-Learn: ${stats.autoLearnEnabled}`);
  
  await crawler.dispose();
  console.log('\n✅ Example 1 complete\n');
}

/**
 * Example 2: Batch Crawling with Continuous Learning
 */
async function example2_BatchCrawling() {
  console.log('📝 Example 2: Batch Crawling with Continuous Learning');
  console.log('='.repeat(50));
  
  const crawler = new TensorFlowEnhancedCrawler({
    enableML: true,
    autoLearn: true
  });
  
  await crawler.initialize();
  
  // Listen to learning events
  crawler.on('learningProgress', (data) => {
    console.log(`🎓 Learned from ${data.samples} pages (Total: ${data.total})`);
  });
  
  crawler.on('metricsUpdated', (metrics) => {
    console.log(`📊 Model Performance:`);
    console.log(`   Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`   F1 Score: ${(metrics.f1Score * 100).toFixed(2)}%`);
  });
  
  // Simulate batch of URLs
  const urls = [
    { url: 'https://example1.com', html: '<html><head><title>Page 1</title></head></html>' },
    { url: 'https://example2.com', html: '<html><head><title>Page 2</title></head></html>' },
    { url: 'https://example3.com', html: '<html><head><title>Page 3</title></head></html>' }
  ];
  
  console.log(`\n🔍 Crawling batch of ${urls.length} URLs...`);
  
  crawler.on('batchProgress', (progress) => {
    console.log(`  Progress: ${progress.percentage}% (${progress.processed}/${progress.total})`);
  });
  
  const results = await crawler.crawlBatch(urls);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  
  console.log(`\n✅ Batch complete: ${successful}/${urls.length} successful`);
  
  await crawler.dispose();
  console.log('\n✅ Example 2 complete\n');
}

/**
 * Example 3: Smart URL Seeding with ML Prioritization
 */
async function example3_SmartSeeding() {
  console.log('📝 Example 3: Smart URL Seeding with ML Prioritization');
  console.log('='.repeat(50));
  
  const seeder = new TensorFlowEnhancedSeeder({
    enableML: true,
    priorityThreshold: 0.8,
    maxQueueSize: 100
  });
  
  await seeder.initialize();
  
  // Seed URLs with different content qualities
  const urlsToSeed = [
    { 
      url: 'https://high-quality-content.com',
      html: `<html><head><title>Comprehensive SEO Guide</title>
             <meta name="description" content="A detailed guide covering all aspects of SEO optimization.">
             </head><body><h1>SEO Guide</h1><p>${'Lorem ipsum '.repeat(100)}</p></body></html>`
    },
    {
      url: 'https://low-quality-content.com',
      html: '<html><head><title>Page</title></head><body><p>Short content</p></body></html>'
    },
    {
      url: 'https://medium-quality-content.com',
      html: `<html><head><title>SEO Tips</title></head><body><h1>Tips</h1><p>${'Text '.repeat(50)}</p></body></html>`
    }
  ];
  
  console.log('\n🌱 Seeding URLs with ML prioritization...');
  
  for (const item of urlsToSeed) {
    const seed = await seeder.seedURL(item.url, { html: item.html });
    console.log(`  ✅ ${item.url}`);
    console.log(`     Priority: ${(seed.priority * 100).toFixed(1)}%`);
  }
  
  console.log('\n📊 Top Priority URLs:');
  const topURLs = seeder.getTopURLs(5);
  topURLs.forEach((seed, idx) => {
    console.log(`  ${idx + 1}. ${seed.url} (Priority: ${(seed.priority * 100).toFixed(1)}%)`);
  });
  
  const stats = seeder.getStats();
  console.log('\n📈 Seeder Statistics:');
  console.log(`  Total Seeded: ${stats.totalSeeded}`);
  console.log(`  High Priority: ${stats.highPrioritySeeds}`);
  console.log(`  Average Priority: ${(stats.averagePriority * 100).toFixed(1)}%`);
  console.log(`  Queue Size: ${stats.queueSize}`);
  
  await seeder.dispose();
  console.log('\n✅ Example 3 complete\n');
}

/**
 * Example 4: Complete System with Real Browser
 */
async function example4_CompleteSystem() {
  console.log('📝 Example 4: Complete TensorFlow SEO System');
  console.log('='.repeat(50));
  
  const system = new TensorFlowSEOSystem({
    enableML: true,
    autoLearn: true,
    modelPath: './models/seo'
  });
  
  await system.initialize();
  
  // Set up event listeners
  system.on('pageCrawled', (data) => {
    console.log(`✅ Crawled: ${data.url}`);
    if (data.attributes.mlRecommendations) {
      console.log(`   📊 ${data.attributes.mlRecommendations.length} recommendations generated`);
    }
  });
  
  system.on('learningProgress', (data) => {
    console.log(`🎓 Learning progress: ${data.total} total samples trained`);
  });
  
  console.log('\n🚀 System started');
  console.log('📊 System Status:');
  const status = system.getStatus();
  console.log(JSON.stringify(status, null, 2));
  
  await system.dispose();
  console.log('\n✅ Example 4 complete\n');
}

/**
 * Example 5: Working with Specific Models
 */
async function example5_SpecificModels() {
  console.log('📝 Example 5: Working with Specific Models');
  console.log('='.repeat(50));
  
  const registry = new SEOModelRegistry();
  
  // List all available models
  console.log('\n📚 Available Models:');
  const models = registry.listModels();
  models.forEach((model, idx) => {
    console.log(`\n${idx + 1}. ${model.name} (${model.key})`);
    console.log(`   Version: ${model.version}`);
    console.log(`   Use Case: ${model.useCase}`);
  });
  
  // Initialize specific models
  console.log('\n🔧 Initializing specific models...');
  
  await registry.initializeModel('CONTENT_QUALITY');
  console.log('✅ Content Quality Analyzer initialized');
  
  await registry.initializeModel('TECHNICAL_SEO');
  console.log('✅ Technical SEO Optimizer initialized');
  
  await registry.initializeModel('META_TAGS');
  console.log('✅ Meta Tags Optimizer initialized');
  
  // Get model metadata
  console.log('\n📊 Model Metadata:');
  const metadata = registry.getModelMetadata('CONTENT_QUALITY');
  console.log(JSON.stringify(metadata, null, 2));
  
  registry.disposeAll();
  console.log('\n✅ Example 5 complete\n');
}

/**
 * Example 6: Real-World Crawling with Puppeteer
 */
async function example6_RealWorldCrawling() {
  console.log('📝 Example 6: Real-World Crawling with Puppeteer');
  console.log('='.repeat(50));
  
  const crawler = new TensorFlowEnhancedCrawler({
    enableML: true,
    autoLearn: true
  });
  
  await crawler.initialize();
  
  console.log('\n🌐 Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Target URL (you can change this)
  const targetURL = 'https://example.com';
  
  console.log(`🔍 Navigating to ${targetURL}...`);
  await page.goto(targetURL, { waitUntil: 'networkidle0' });
  
  // Get HTML content
  const html = await page.content();
  
  console.log('🧠 Analyzing with TensorFlow...');
  const attributes = await crawler.crawlPage(targetURL, html);
  
  console.log('\n📊 Analysis Results:');
  console.log(`  URL: ${attributes.url}`);
  console.log(`  Title: ${attributes.title}`);
  console.log(`  SEO Score: ${attributes.seoScore}/100`);
  console.log(`  Content Quality: ${attributes.contentQualityScore}/100`);
  console.log(`  Technical Score: ${attributes.technicalScore}/100`);
  console.log(`  ML Confidence: ${(attributes.mlConfidence * 100).toFixed(1)}%`);
  
  console.log('\n🎯 ML Recommendations:');
  if (attributes.mlRecommendations) {
    attributes.mlRecommendations.slice(0, 10).forEach((rec, idx) => {
      console.log(`\n  ${idx + 1}. ${rec.title}`);
      console.log(`     Category: ${rec.category}`);
      console.log(`     Priority: ${rec.priority}/100`);
      console.log(`     Impact: ${rec.estimatedImpact}`);
      console.log(`     Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    });
  }
  
  await browser.close();
  await crawler.dispose();
  
  console.log('\n✅ Example 6 complete\n');
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🎯 Running All TensorFlow SEO Examples\n');
  console.log('='.repeat(70));
  console.log('\n');
  
  try {
    await example1_BasicCrawling();
    await example2_BatchCrawling();
    await example3_SmartSeeding();
    await example4_CompleteSystem();
    await example5_SpecificModels();
    
    // Uncomment to run real browser example (requires puppeteer)
    // await example6_RealWorldCrawling();
    
    console.log('='.repeat(70));
    console.log('✅ All examples completed successfully!');
    console.log('\n📚 Next Steps:');
    console.log('  1. Check TENSORFLOW_SEO_INTEGRATION_GUIDE.md for detailed documentation');
    console.log('  2. Customize configurations for your use case');
    console.log('  3. Integrate with your existing crawler system');
    console.log('  4. Monitor performance metrics and adjust as needed');
    console.log('  5. Scale up with production-ready infrastructure\n');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

export {
  example1_BasicCrawling,
  example2_BatchCrawling,
  example3_SmartSeeding,
  example4_CompleteSystem,
  example5_SpecificModels,
  example6_RealWorldCrawling
};
