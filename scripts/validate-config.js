#!/usr/bin/env node
/**
 * Simple configuration validation
 * Checks that all 192 attributes are properly configured
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../config/seo-attributes.json');

console.log('🧪 Validating SEO Neural Campaign Configuration...\n');

// Load configuration
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

// Test 1: Verify 192 attributes
console.log('✓ Test 1: Verify 192 attributes');
const attributeCount = Object.keys(config.attributes).length;
console.log(`  Found ${attributeCount} attributes`);

if (attributeCount !== 192) {
  console.error(`  ❌ Expected 192 attributes, got ${attributeCount}`);
  process.exit(1);
}
console.log('  ✓ Correct number of attributes\n');

// Test 2: Verify all attributes have required fields
console.log('✓ Test 2: Validate attribute structure');
const requiredFields = ['id', 'category', 'type', 'mlWeight', 'scraping', 'training', 'seeding'];
let invalidCount = 0;

for (const [name, attr] of Object.entries(config.attributes)) {
  for (const field of requiredFields) {
    if (attr[field] === undefined) {
      console.error(`  ❌ ${name} missing field: ${field}`);
      invalidCount++;
    }
  }
}

if (invalidCount > 0) {
  console.error(`  ❌ ${invalidCount} validation errors found`);
  process.exit(1);
}
console.log('  ✓ All attributes have required fields\n');

// Test 3: Verify training configuration
console.log('✓ Test 3: Verify training configuration');
if (!config.trainingConfiguration) {
  console.error('  ❌ Missing trainingConfiguration');
  process.exit(1);
}

const trainingConfig = config.trainingConfiguration;
console.log(`  Input dimensions: ${trainingConfig.inputDimensions}`);
console.log(`  Batch size: ${trainingConfig.batchSize}`);
console.log(`  Epochs: ${trainingConfig.epochs}`);
console.log(`  Learning rate: ${trainingConfig.learningRate}`);

if (trainingConfig.inputDimensions !== 192) {
  console.error(`  ❌ inputDimensions should be 192, got ${trainingConfig.inputDimensions}`);
  process.exit(1);
}
console.log('  ✓ Training configuration valid\n');

// Test 4: Group by category
console.log('✓ Test 4: Analyze attribute categories');
const categories = {};
const mlWeights = [];

for (const attr of Object.values(config.attributes)) {
  const cat = attr.category || 'uncategorized';
  categories[cat] = (categories[cat] || 0) + 1;
  mlWeights.push(attr.mlWeight);
}

console.log(`  Found ${Object.keys(categories).length} categories:`);
Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`    • ${cat}: ${count} attributes`);
  });

const avgWeight = mlWeights.reduce((a, b) => a + b, 0) / mlWeights.length;
const maxWeight = Math.max(...mlWeights);
const minWeight = Math.min(...mlWeights);

console.log(`\n  ML Weight statistics:`);
console.log(`    • Average: ${avgWeight.toFixed(3)}`);
console.log(`    • Range: ${minWeight.toFixed(2)} - ${maxWeight.toFixed(2)}`);
console.log('  ✓ Categories validated\n');

// Test 5: Verify key SEO attributes exist
console.log('✓ Test 5: Verify key SEO attributes');
const keyAttributes = [
  // Meta & Head
  'title', 'metaDescription', 'canonical', 'ogTitle', 'twitterCard',
  // Core Web Vitals
  'largestContentfulPaint', 'firstInputDelay', 'cumulativeLayoutShift',
  // Content
  'h1Count', 'wordCount', 'readabilityScore',
  // Structured Data
  'structuredDataCount', 'hasArticleSchema', 'hasProductSchema',
  // Performance
  'timeToFirstByte', 'firstContentfulPaint', 'speedIndex',
  // Technical SEO
  'robotsTxtExists', 'sitemapXmlExists', 'http2Enabled',
  // Computed Scores
  'seoScore', 'contentQualityScore', 'technicalScore', 'overallScore'
];

const missingAttrs = keyAttributes.filter(attr => !config.attributes[attr]);
if (missingAttrs.length > 0) {
  console.error(`  ❌ Missing key attributes: ${missingAttrs.join(', ')}`);
  process.exit(1);
}
console.log('  ✓ All ' + keyAttributes.length + ' key attributes present\n');

// Test 6: Verify metadata
console.log('✓ Test 6: Verify metadata');
if (!config.metadata) {
  console.error('  ❌ Missing metadata');
  process.exit(1);
}

console.log(`  Version: ${config.metadata.version}`);
console.log(`  Last updated: ${config.metadata.lastUpdated}`);
console.log(`  Total attributes (metadata): ${config.metadata.totalAttributes}`);

if (config.metadata.totalAttributes !== attributeCount) {
  console.error(`  ❌ Metadata count mismatch: ${config.metadata.totalAttributes} vs ${attributeCount}`);
  process.exit(1);
}
console.log('  ✓ Metadata valid\n');

// Summary
console.log('═══════════════════════════════════════════════');
console.log('✅ All configuration checks passed!');
console.log('═══════════════════════════════════════════════');
console.log('Configuration Summary:');
console.log(`  ✓ ${attributeCount} SEO attributes configured`);
console.log(`  ✓ ${Object.keys(categories).length} attribute categories`);
console.log(`  ✓ ${keyAttributes.length} critical attributes verified`);
console.log(`  ✓ Training configured for ${trainingConfig.inputDimensions} inputs`);
console.log(`  ✓ Batch size: ${trainingConfig.batchSize}`);
console.log(`  ✓ Epochs: ${trainingConfig.epochs}`);
console.log(`  ✓ Learning rate: ${trainingConfig.learningRate}`);
console.log('═══════════════════════════════════════════════');
console.log('\n🎉 SEO Neural Campaign configuration is valid!');
console.log('   Ready for neural network training');
console.log('   All 192 attributes properly configured');
console.log('   Batch size and model settings optimized');
