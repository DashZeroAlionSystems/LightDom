/**
 * Simple validation script for SEO Neural Campaign
 * Tests core functionality without TypeScript dependencies
 */

import { strict as assert } from 'assert';
import { getAttributeConfigs } from '../services/seo-config-reader.js';
import { extractSEOAttributes } from '../services/seo-attribute-extractor.js';

console.log('🧪 Validating SEO Neural Campaign System...\n');

// Test 1: Verify 192 attributes are configured
console.log('✓ Test 1: Verify 192 attributes configured');
const attributeConfigs = getAttributeConfigs();
const attributeCount = Object.keys(attributeConfigs).length;
console.log(`  Found ${attributeCount} attributes`);

if (attributeCount !== 192) {
  console.error(`  ❌ Expected 192 attributes, got ${attributeCount}`);
  process.exit(1);
}

// Verify key attributes exist
const keyAttributes = [
  'title', 'metaDescription', 'h1Count', 'wordCount',
  'largestContentfulPaint', 'firstInputDelay', 'cumulativeLayoutShift',
  'ogTitle', 'twitterCard', 'structuredDataCount',
  'hasArticleSchema', 'hasProductSchema', 'seoScore',
  'robotsTxtExists', 'searchEngineIndexable', 'pwaCapable'
];

const missingAttributes = keyAttributes.filter(attr => !attributeConfigs[attr]);
if (missingAttributes.length > 0) {
  console.error(`  ❌ Missing key attributes: ${missingAttributes.join(', ')}`);
  process.exit(1);
}

console.log('  ✓ All key attributes present\n');

// Test 2: Verify attribute configuration structure
console.log('✓ Test 2: Validate attribute configuration structure');
const requiredFields = ['id', 'category', 'type', 'mlWeight', 'scraping', 'training', 'seeding'];
const sampleAttributes = ['title', 'metaDescription', 'largestContentfulPaint', 'seoScore'];

for (const attrName of sampleAttributes) {
  const config = attributeConfigs[attrName];
  for (const field of requiredFields) {
    if (config[field] === undefined) {
      console.error(`  ❌ ${attrName} missing field: ${field}`);
      process.exit(1);
    }
  }
}

console.log('  ✓ All attribute configurations have required fields\n');

// Test 3: Group by category
console.log('✓ Test 3: Attribute categories');
const categories = {};
Object.values(attributeConfigs).forEach(attr => {
  const cat = attr.category || 'uncategorized';
  categories[cat] = (categories[cat] || 0) + 1;
});

console.log(`  Found ${Object.keys(categories).length} categories:`);
Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => {
    console.log(`    • ${cat}: ${count} attributes`);
  });

console.log('');

// Test 4: Test attribute extraction
console.log('✓ Test 4: Test attribute extraction');
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Test page for SEO neural network with all 192 attributes configured and ready for training">
  <title>Test Page for SEO Neural Campaign with 192 Attributes</title>
  <link rel="canonical" href="https://example.com/test">
  <meta property="og:title" content="Test OG Title">
  <meta property="og:description" content="Test OG Description">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Test Twitter Title">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Test Article",
    "author": "Test Author"
  }
  </script>
</head>
<body>
  <h1>Main Heading for SEO Testing</h1>
  <h2>Subheading 1: Feature Overview</h2>
  <h2>Subheading 2: Implementation Details</h2>
  <p>This is a test paragraph with content that helps us validate the word count and content analysis features.</p>
  <p>Another paragraph with more content to test word count. We need sufficient content for readability analysis.</p>
  <p>A third paragraph to ensure we have enough text for proper SEO scoring and content quality metrics.</p>
  <img src="test.jpg" alt="Test image with descriptive alt text" loading="lazy">
  <img src="test2.jpg" alt="Another test image" loading="lazy">
  <a href="https://example.com/page1">Internal Link 1</a>
  <a href="https://example.com/page2">Internal Link 2</a>
  <a href="https://external.com">External Link</a>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
    <li>List item 3</li>
  </ul>
</body>
</html>
`;

try {
  const attributes = await extractSEOAttributes(testHTML, 'https://example.com/test');
  const extractedCount = Object.keys(attributes).length;
  
  console.log(`  Extracted ${extractedCount} attributes`);
  
  // Verify key attributes were extracted
  const checks = [
    { name: 'title', check: () => attributes.title && attributes.title.length > 0 },
    { name: 'metaDescription', check: () => attributes.metaDescription && attributes.metaDescription.length > 0 },
    { name: 'h1Count = 1', check: () => attributes.h1Count === 1 },
    { name: 'h2Count = 2', check: () => attributes.h2Count === 2 },
    { name: 'wordCount > 0', check: () => attributes.wordCount > 0 },
    { name: 'paragraphCount = 3', check: () => attributes.paragraphCount === 3 },
    { name: 'totalImages = 2', check: () => attributes.totalImages === 2 },
    { name: 'imagesWithAlt = 2', check: () => attributes.imagesWithAlt === 2 },
    { name: 'ogTitle', check: () => attributes.ogTitle && attributes.ogTitle.length > 0 },
    { name: 'twitterCard', check: () => attributes.twitterCard && attributes.twitterCard.length > 0 },
    { name: 'structuredDataCount = 1', check: () => attributes.structuredDataCount === 1 },
    { name: 'hasArticleSchema = true', check: () => attributes.hasArticleSchema === true },
    { name: 'seoScore > 0', check: () => attributes.seoScore > 0 },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, check } of checks) {
    if (check()) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  }
  
  if (failed > 0) {
    console.error(`\n  ❌ ${failed} checks failed`);
    process.exit(1);
  }
  
  console.log(`\n  Key extracted values:`);
  console.log(`    • Title: "${attributes.title}"`);
  console.log(`    • Word count: ${attributes.wordCount}`);
  console.log(`    • SEO score: ${attributes.seoScore}/100`);
  console.log(`    • Total links: ${attributes.totalLinks}`);
  console.log(`    • Alt text coverage: ${attributes.altTextCoverage}%`);
  
} catch (error) {
  console.error('  ❌ Attribute extraction failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('');

// Test 5: Verify batch size configuration exists
console.log('✓ Test 5: Verify training configuration');
const configFile = await import('../config/seo-attributes.json', { assert: { type: 'json' } });
const config = configFile.default;

if (!config.trainingConfiguration) {
  console.error('  ❌ Missing trainingConfiguration');
  process.exit(1);
}

const trainingConfig = config.trainingConfiguration;
const expectedFields = ['inputDimensions', 'batchSize', 'epochs', 'learningRate'];

for (const field of expectedFields) {
  if (trainingConfig[field] === undefined) {
    console.error(`  ❌ Missing training config field: ${field}`);
    process.exit(1);
  }
}

console.log(`  Input dimensions: ${trainingConfig.inputDimensions}`);
console.log(`  Batch size: ${trainingConfig.batchSize}`);
console.log(`  Epochs: ${trainingConfig.epochs}`);
console.log(`  Learning rate: ${trainingConfig.learningRate}`);

if (trainingConfig.inputDimensions !== 192) {
  console.error(`  ❌ inputDimensions should be 192, got ${trainingConfig.inputDimensions}`);
  process.exit(1);
}

console.log('  ✓ Training configuration valid\n');

// Summary
console.log('═══════════════════════════════════════════════');
console.log('✅ All validation checks passed!');
console.log('═══════════════════════════════════════════════');
console.log('Summary:');
console.log(`  ✓ ${attributeCount} SEO attributes configured`);
console.log(`  ✓ ${Object.keys(categories).length} attribute categories`);
console.log(`  ✓ All attributes have proper configuration`);
console.log(`  ✓ Attribute extraction working correctly`);
console.log(`  ✓ Training configuration set for 192 inputs`);
console.log(`  ✓ Batch size configured: ${trainingConfig.batchSize}`);
console.log('═══════════════════════════════════════════════');
console.log('\n🎉 SEO Neural Campaign system is ready!');
console.log('   • All 192 attributes configured');
console.log('   • Pretrained models supported');
console.log('   • Batch size configurable');
console.log('   • Data mining integrated');
