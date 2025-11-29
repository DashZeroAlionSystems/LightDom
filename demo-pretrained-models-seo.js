#!/usr/bin/env node

/**
 * Pre-Trained Models Demo for SEO Crawler
 * 
 * Demonstrates the integration of TensorFlow pre-trained models
 * with the SEO crawler for enhanced content analysis and optimization.
 * 
 * Usage:
 *   node demo-pretrained-models-seo.js
 */

import { SEOPreTrainedModelsRegistry } from './services/seo-pretrained-models-registry.js';
import { CrawlerNeuralIntegration } from './services/crawler-neural-integration.js';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function header(text) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}  ${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}\n`);
}

function section(text) {
  console.log(`\n${colors.bright}${colors.cyan}► ${text}${colors.reset}\n`);
}

function success(text) {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

function info(text) {
  console.log(`${colors.yellow}ℹ ${text}${colors.reset}`);
}

async function runDemo() {
  header('Pre-Trained Models for SEO Crawler - Demonstration');

  // ==========================================
  // PART 1: Model Registry Overview
  // ==========================================
  section('1. Model Registry Overview');

  const registry = new SEOPreTrainedModelsRegistry();
  
  const stats = registry.getStatistics();
  console.log(`${colors.bright}Registry Statistics:${colors.reset}`);
  console.log(`  Total Models: ${stats.total}`);
  console.log(`  TensorFlow Hub: ${stats.bySource['tensorflow-hub']}`);
  console.log(`  Hugging Face: ${stats.bySource['huggingface']}`);
  console.log(`  Average Accuracy: ${(stats.averageAccuracy * 100).toFixed(2)}%`);
  console.log(`  Total Size: ${(stats.totalSize_mb / 1024).toFixed(2)} GB`);
  
  console.log(`\n${colors.bright}Models by Task:${colors.reset}`);
  Object.entries(stats.byTask).forEach(([task, count]) => {
    console.log(`  - ${task}: ${count} models`);
  });

  console.log(`\n${colors.bright}Models by Performance:${colors.reset}`);
  Object.entries(stats.byPerformance).forEach(([perf, count]) => {
    console.log(`  - ${perf}: ${count} models`);
  });

  success('Model registry loaded successfully');

  // ==========================================
  // PART 2: Fast Models for Real-Time Crawling
  // ==========================================
  section('2. Fast Models for Real-Time Crawling');

  const fastModels = registry.getFastModelsForCrawling();
  console.log(`${colors.bright}Fast Models (${fastModels.length}):${colors.reset}`);
  
  fastModels.forEach(model => {
    console.log(`\n  ${colors.magenta}${model.name}${colors.reset}`);
    console.log(`    ID: ${model.id}`);
    console.log(`    Performance: ${model.performance}`);
    console.log(`    Accuracy: ${(model.accuracy * 100).toFixed(1)}%`);
    console.log(`    Size: ${model.size_mb} MB`);
    console.log(`    Primary Use: ${model.seoUseCase}`);
  });

  success('Identified fast models suitable for real-time processing');

  // ==========================================
  // PART 3: Model Details by Use Case
  // ==========================================
  section('3. Model Selection by Use Case');

  const useCases = [
    'content-similarity',
    'user-sentiment-analysis',
    'image-analysis',
    'content-safety',
    'entity-extraction'
  ];

  console.log(`${colors.bright}Recommended Models by Use Case:${colors.reset}\n`);

  useCases.forEach(useCase => {
    const models = registry.getModelsByUseCase(useCase);
    if (models.length > 0) {
      console.log(`  ${colors.cyan}${useCase}:${colors.reset}`);
      models.forEach(model => {
        console.log(`    - ${model.name} (${(model.accuracy * 100).toFixed(1)}% accuracy, ${model.performance})`);
      });
    }
  });

  success('Model recommendations generated for common use cases');

  // ==========================================
  // PART 4: Crawler Pipeline Configuration
  // ==========================================
  section('4. Crawler Pipeline Configuration');

  const pipeline = registry.getCrawlerPipeline();
  
  console.log(`${colors.bright}Recommended Crawler Pipeline:${colors.reset}\n`);
  
  console.log(`  ${colors.green}Realtime Stage${colors.reset} (during crawling):`);
  pipeline.realtime.forEach(modelId => {
    const model = registry.getModel(modelId);
    console.log(`    • ${model.name} - ${model.seoUseCase}`);
  });

  console.log(`\n  ${colors.yellow}Batch Stage${colors.reset} (post-crawl processing):`);
  pipeline.batch.forEach(modelId => {
    const model = registry.getModel(modelId);
    console.log(`    • ${model.name} - ${model.seoUseCase}`);
  });

  console.log(`\n  ${colors.magenta}Detailed Stage${colors.reset} (comprehensive analysis):`);
  pipeline.detailed.forEach(modelId => {
    const model = registry.getModel(modelId);
    console.log(`    • ${model.name} - ${model.seoUseCase}`);
  });

  console.log(`\n  ${colors.cyan}Specialized Stage${colors.reset} (advanced tasks):`);
  pipeline.specialized.forEach(modelId => {
    const model = registry.getModel(modelId);
    console.log(`    • ${model.name} - ${model.seoUseCase}`);
  });

  success('Optimal crawler pipeline configured with 4 processing stages');

  // ==========================================
  // PART 5: Transfer Learning Configurations
  // ==========================================
  section('5. Transfer Learning Configurations');

  const transferLearningModels = [
    'bert-base-uncased',
    'distilbert-sst2-sentiment',
    'mobilenet-v2'
  ];

  console.log(`${colors.bright}Transfer Learning Configurations:${colors.reset}\n`);

  transferLearningModels.forEach(modelId => {
    const model = registry.getModel(modelId);
    const config = model.transferLearningConfig;
    
    console.log(`  ${colors.magenta}${model.name}:${colors.reset}`);
    console.log(`    Freeze Layers: ${config.freezeLayers}`);
    console.log(`    Additional Layers: ${config.additionalLayers.length}`);
    console.log(`    Layer Details:`);
    config.additionalLayers.forEach((layer, idx) => {
      console.log(`      ${idx + 1}. ${layer.type}${layer.units ? ` (${layer.units} units)` : ''}${layer.rate ? ` (rate: ${layer.rate})` : ''}`);
    });
    console.log('');
  });

  success('Transfer learning configurations ready for fine-tuning');

  // ==========================================
  // PART 6: Model Ensemble Creation
  // ==========================================
  section('6. Model Ensemble for Improved Accuracy');

  const ensemble = registry.createModelEnsemble('text-classification', {
    maxModels: 3,
    minAccuracy: 0.85
  });

  console.log(`${colors.bright}Ensemble Configuration:${colors.reset}`);
  console.log(`  Task: ${ensemble.task}`);
  console.log(`  Models in Ensemble: ${ensemble.models.length}`);
  console.log(`  Voting Strategy: ${ensemble.votingStrategy}`);
  console.log(`  Expected Accuracy: ${(ensemble.expectedAccuracy * 100).toFixed(2)}%`);
  console.log(`\n  ${colors.bright}Ensemble Members:${colors.reset}`);
  
  ensemble.models.forEach((modelId, idx) => {
    const model = registry.getModel(modelId);
    const weight = ensemble.weights[idx];
    console.log(`    ${idx + 1}. ${model.name} (weight: ${weight.toFixed(3)})`);
  });

  success('Model ensemble created for enhanced prediction accuracy');

  // ==========================================
  // PART 7: Simulated Crawler Integration
  // ==========================================
  section('7. Crawler Integration Simulation');

  info('Initializing Crawler Neural Integration...');
  
  const integration = new CrawlerNeuralIntegration({
    enableRealtimeInference: true,
    enableBatchProcessing: true,
    batchSize: 10
  });

  await integration.initialize();
  success('Crawler Neural Integration initialized');

  // Simulate crawled page data
  const mockPageData = {
    url: 'https://example.com/product-page',
    title: 'Amazing Product - Best Quality Online Store',
    metaDescription: 'Shop our amazing products with free shipping worldwide',
    content: `
      Welcome to our online store! We offer the best products at competitive prices.
      Our customers love our service and rate us 5 stars consistently.
      Free shipping on all orders over $50. Shop now and save!
      
      Product Features:
      - High quality materials
      - Durable construction
      - 30-day money-back guarantee
      - Fast worldwide shipping
      
      Customer Reviews:
      "This product exceeded my expectations!" - Sarah J.
      "Great value for money" - Michael P.
      "Fast delivery and excellent customer service" - Emma K.
    `,
    images: [
      { src: 'product-main.jpg', alt: '' },
      { src: 'product-detail-1.jpg', alt: 'Product closeup' },
      { src: 'product-detail-2.jpg', alt: '' }
    ],
    attributes: {
      titleLength: 47,
      metaDescriptionLength: 55,
      wordCount: 120,
      h1Count: 1,
      h2Count: 2,
      totalHeadings: 5,
      paragraphCount: 4,
      internalLinksCount: 8,
      externalLinksCount: 2,
      totalImages: 3,
      altTextCoverage: 0.33,
      structuredDataCount: 0,
      isSecure: true,
      hasViewportMeta: true,
      accessibilityScore: 0.75
      // ... would include all 192 attributes in production
    }
  };

  console.log(`\n${colors.bright}Processing Page:${colors.reset} ${mockPageData.url}`);
  
  info('Running neural network analysis...');
  const results = await integration.processCrawledPage(mockPageData);

  console.log(`\n${colors.bright}Analysis Complete:${colors.reset}`);
  console.log(`  Inference Time: ${results.metadata.inferenceTime}ms`);
  console.log(`  Models Used: ${results.metadata.modelsUsed}`);
  console.log(`  Success: ${results.metadata.success}`);

  if (results.analyses.realtime) {
    console.log(`\n  ${colors.bright}Real-time Analysis:${colors.reset}`);
    
    if (results.analyses.realtime.toxicity) {
      const toxicity = results.analyses.realtime.toxicity;
      console.log(`    Toxicity Score: ${(toxicity.score * 100).toFixed(2)}%`);
      console.log(`    Content Safe: ${toxicity.isSafe ? '✓' : '✗'}`);
    }

    if (results.analyses.realtime.sentiment) {
      const sentiment = results.analyses.realtime.sentiment;
      console.log(`    Sentiment: ${sentiment.sentiment} (${(sentiment.confidence * 100).toFixed(1)}% confidence)`);
    }

    if (results.analyses.realtime.images) {
      const images = results.analyses.realtime.images;
      console.log(`    Images Analyzed: ${images.analyzedImages}`);
      console.log(`    Images Without Alt: ${images.summary.imagesWithoutAlt}`);
    }
  }

  if (results.recommendations && results.recommendations.length > 0) {
    console.log(`\n  ${colors.bright}Recommendations (${results.recommendations.length}):${colors.reset}`);
    
    results.recommendations.slice(0, 5).forEach((rec, idx) => {
      const priorityColor = 
        rec.priority === 'critical' ? colors.bright :
        rec.priority === 'high' ? colors.yellow :
        colors.reset;
      
      console.log(`\n    ${idx + 1}. [${priorityColor}${rec.priority.toUpperCase()}${colors.reset}] ${rec.title}`);
      console.log(`       ${rec.description}`);
      console.log(`       Impact: ${rec.impact} | Effort: ${rec.effort}`);
    });
  }

  success('Page processing complete with actionable recommendations');

  // ==========================================
  // PART 8: Integration Statistics
  // ==========================================
  section('8. Integration Statistics');

  const integrationStats = integration.getStatistics();
  console.log(`${colors.bright}Crawler Neural Integration Stats:${colors.reset}`);
  console.log(`  Total Inferences: ${integrationStats.totalInferences}`);
  console.log(`  Successful: ${integrationStats.successfulInferences}`);
  console.log(`  Failed: ${integrationStats.failedInferences}`);
  console.log(`  Success Rate: ${integrationStats.successRate}`);
  console.log(`  Average Inference Time: ${integrationStats.averageInferenceTime}`);
  console.log(`  Models Available: ${integrationStats.modelsAvailable}`);
  console.log(`  Models Loaded: ${integrationStats.modelsLoaded}`);

  success('Statistics retrieved successfully');

  // ==========================================
  // PART 9: Model Recommendations
  // ==========================================
  section('9. Recommended Models for Your Crawler');

  const recommendations = integration.getRecommendedModelsForCrawler();
  
  console.log(`${colors.bright}Fast Models for Real-Time Use:${colors.reset}`);
  recommendations.fastModels.slice(0, 3).forEach(model => {
    console.log(`  • ${model.name} - ${model.performance} (${(model.accuracy * 100).toFixed(1)}%)`);
    console.log(`    Use for: ${model.seoApplications[0]}`);
  });

  console.log(`\n${colors.bright}Pipeline Recommendation:${colors.reset}`);
  console.log(`  ${recommendations.recommendation}`);

  success('Model recommendations provided for optimal crawler performance');

  // ==========================================
  // PART 10: Export and Documentation
  // ==========================================
  section('10. Registry Export and Documentation');

  const registryExport = registry.exportRegistry();
  
  console.log(`${colors.bright}Registry Export Metadata:${colors.reset}`);
  console.log(`  Version: ${registryExport.metadata.version}`);
  console.log(`  Last Updated: ${new Date(registryExport.metadata.lastUpdated).toLocaleString()}`);
  console.log(`  Total Models: ${registryExport.metadata.totalModels}`);

  console.log(`\n${colors.bright}Documentation URLs:${colors.reset}`);
  const sampleModels = ['universal-sentence-encoder', 'bert-base-uncased', 'mobilenet-v2'];
  sampleModels.forEach(modelId => {
    const docUrl = registry.getModelDocumentation(modelId);
    console.log(`  ${modelId}: ${docUrl}`);
  });

  success('Registry export and documentation links generated');

  // ==========================================
  // SUMMARY
  // ==========================================
  header('Demo Summary');

  console.log(`${colors.bright}${colors.green}✓ Successfully demonstrated:${colors.reset}\n`);
  console.log(`  1. ${stats.total} pre-trained models from TensorFlow Hub & Hugging Face`);
  console.log(`  2. Crawler pipeline with 4-stage processing architecture`);
  console.log(`  3. Real-time neural network analysis during crawling`);
  console.log(`  4. Transfer learning configurations for domain adaptation`);
  console.log(`  5. Model ensemble for improved accuracy`);
  console.log(`  6. Automated recommendation generation`);
  console.log(`  7. Performance statistics and monitoring`);
  console.log(`  8. Complete integration with existing crawler infrastructure`);

  console.log(`\n${colors.bright}${colors.cyan}Next Steps:${colors.reset}\n`);
  console.log(`  1. Review PRETRAINED_MODELS_SEO_GUIDE.md for detailed documentation`);
  console.log(`  2. Integrate with your crawler using CrawlerNeuralIntegration`);
  console.log(`  3. Fine-tune models with transfer learning on your domain data`);
  console.log(`  4. Monitor performance and iterate on model selection`);
  console.log(`  5. Deploy to production for enhanced SEO campaign accuracy`);

  console.log(`\n${colors.bright}${colors.blue}For more information:${colors.reset}`);
  console.log(`  • Documentation: ./PRETRAINED_MODELS_SEO_GUIDE.md`);
  console.log(`  • Registry: ./services/seo-pretrained-models-registry.js`);
  console.log(`  • Integration: ./services/crawler-neural-integration.js`);
  console.log(`  • TensorFlow Guide: ./TENSORFLOW_WORKFLOW_README.md\n`);

  // Cleanup
  await integration.dispose();
  
  console.log(`${colors.green}${colors.bright}Demo completed successfully!${colors.reset}\n`);
}

// Run the demo
runDemo().catch(error => {
  console.error(`\n${colors.bright}${colors.yellow}Error running demo:${colors.reset}`, error);
  process.exit(1);
});

export { runDemo };
