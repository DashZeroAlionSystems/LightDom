#!/usr/bin/env node

/**
 * Simple Pre-Trained Models Demo
 * Demonstrates the SEO pre-trained models registry without complex dependencies
 */

import { SEOPreTrainedModelsRegistry } from './services/seo-pretrained-models-registry.js';

// ANSI colors
const c = {
  r: '\x1b[0m',
  b: '\x1b[1m',
  g: '\x1b[32m',
  y: '\x1b[33m',
  c: '\x1b[36m',
  m: '\x1b[35m'
};

console.log(`\n${c.b}${c.c}${'='.repeat(80)}${c.r}`);
console.log(`${c.b}${c.c}  Pre-Trained Models for SEO - Quick Demo${c.r}`);
console.log(`${c.b}${c.c}${'='.repeat(80)}${c.r}\n`);

try {
  const registry = new SEOPreTrainedModelsRegistry();
  
  // Statistics
  console.log(`${c.b}Registry Statistics:${c.r}`);
  const stats = registry.getStatistics();
  console.log(`  Total Models: ${stats.total}`);
  console.log(`  TensorFlow Hub: ${stats.bySource['tensorflow-hub']}`);
  console.log(`  Hugging Face: ${stats.bySource['huggingface']}`);
  console.log(`  Average Accuracy: ${(stats.averageAccuracy * 100).toFixed(2)}%`);
  console.log(`  Total Size: ${(stats.totalSize_mb / 1024).toFixed(2)} GB\n`);

  // Fast models
  console.log(`${c.b}Fast Models for Real-Time Crawling:${c.r}`);
  const fastModels = registry.getFastModelsForCrawling();
  fastModels.forEach(m => {
    console.log(`  • ${m.name} (${m.performance}, ${(m.accuracy * 100).toFixed(1)}%)`);
  });
  
  // Pipeline
  console.log(`\n${c.b}Recommended Crawler Pipeline:${c.r}`);
  const pipeline = registry.getCrawlerPipeline();
  console.log(`  Realtime: ${pipeline.realtime.length} models`);
  console.log(`  Batch: ${pipeline.batch.length} models`);
  console.log(`  Detailed: ${pipeline.detailed.length} models`);
  console.log(`  Specialized: ${pipeline.specialized.length} models`);

  // Use cases
  console.log(`\n${c.b}Models by Use Case:${c.r}`);
  const useCases = ['content-similarity', 'image-analysis', 'content-safety'];
  useCases.forEach(uc => {
    const models = registry.getModelsByUseCase(uc);
    console.log(`  ${uc}: ${models.map(m => m.name).join(', ')}`);
  });

  console.log(`\n${c.g}✓ Demo completed successfully!${c.r}\n`);
  console.log(`${c.b}Next Steps:${c.r}`);
  console.log(`  1. Review PRETRAINED_MODELS_SEO_GUIDE.md for complete documentation`);
  console.log(`  2. Integrate models with your crawler`);
  console.log(`  3. Fine-tune with transfer learning on your data\n`);
  
} catch (error) {
  console.error(`${c.y}Error:${c.r}`, error.message);
  process.exit(1);
}
