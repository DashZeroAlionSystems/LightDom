#!/usr/bin/env node
/**
 * Storybook Discovery Example
 * 
 * Simple example demonstrating the Storybook discovery and mining system
 */

import { StorybookCrawler } from '../services/storybook-crawler.js';
import { StorybookSeederService } from '../services/storybook-seeder-service.js';
import { StorybookDiscoveryService } from '../services/storybook-discovery-service.js';

async function runExample() {
  console.log('🎯 Storybook Discovery Example\n');
  
  // Example 1: Generate seeds
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Example 1: Generate Seeds from Known Sources');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const seeder = new StorybookSeederService({
    enableGithub: false, // Disable GitHub to avoid API rate limits
    enableNpm: false,
    enableWebSearch: true,
  });
  
  await seeder.generateSeeds();
  const seeds = seeder.getSeeds({ limit: 10 });
  
  console.log(`Generated ${seeds.length} seeds:\n`);
  seeds.forEach((seed, index) => {
    console.log(`${index + 1}. ${seed.url}`);
    console.log(`   Priority: ${seed.priority}/10`);
    console.log(`   Source: ${seed.source}`);
    console.log(`   Tags: ${seed.tags?.join(', ') || 'none'}\n`);
  });
  
  // Example 2: Detect Storybook (requires Puppeteer/Chrome)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Example 2: Detect Storybook Instance');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Note: Detection requires Puppeteer with Chrome installed.');
  console.log('To run detection:');
  console.log('  node scripts/storybook-discovery-cli.js detect --url https://storybook.js.org\n');
  
  console.log('Example code:');
  console.log(`
  const discovery = new StorybookDiscoveryService({
    timeout: 15000,
    waitForStorybook: 3000,
  });
  
  await discovery.initialize();
  
  const testUrl = 'https://storybook.js.org';
  const isStorybook = await discovery.detectStorybook(testUrl);
  console.log('Result:', isStorybook ? '✅ Detected' : '❌ Not found');
  
  await discovery.close();
  `);
  
  // Example 3: Quick discovery (commented out to avoid long runtime)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ Example 3: Quick Discovery (Simulated)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('To run a real discovery, use:');
  console.log('  npm run storybook:discover:quick\n');
  console.log('Or programmatically:');
  console.log(`
  const crawler = new StorybookCrawler({
    maxConcurrency: 2,
    maxDepth: 1,
  });
  
  await crawler.start({
    maxSeeds: 10,
    discover: true,
  });
  
  const stats = crawler.getStats();
  console.log('Stats:', stats);
  
  await crawler.close();
  `);
  
  // Example 4: API Usage
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Example 4: API Usage');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Start the API server:');
  console.log('  npm run start:dev\n');
  
  console.log('Then use the API:');
  console.log(`
# Start discovery
curl -X POST http://localhost:3001/api/storybook-discovery/start \\
  -H "Content-Type: application/json" \\
  -d '{"maxSeeds": 20, "discover": true}'

# Get statistics
curl http://localhost:3001/api/storybook-discovery/stats

# Generate seeds
curl -X POST http://localhost:3001/api/storybook-discovery/seeds/generate

# Crawl specific URL
curl -X POST http://localhost:3001/api/storybook-discovery/crawl \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://storybook.js.org"}'
  `);
  
  // Example 5: CLI Usage
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⌨️  Example 5: CLI Usage');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Available commands:\n');
  console.log('  # List templates');
  console.log('  npm run storybook:templates\n');
  
  console.log('  # Quick discovery');
  console.log('  npm run storybook:discover:quick\n');
  
  console.log('  # Deep discovery');
  console.log('  npm run storybook:discover:deep\n');
  
  console.log('  # React-focused');
  console.log('  npm run storybook:discover:react\n');
  
  console.log('  # Generate seeds');
  console.log('  npm run storybook:seeds\n');
  
  console.log('  # Detect Storybook');
  console.log('  node scripts/storybook-discovery-cli.js detect --url https://example.com\n');
  
  console.log('  # View statistics');
  console.log('  npm run storybook:stats\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Example Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('For more information, see: STORYBOOK_DISCOVERY_README.md\n');
}

// Run example
runExample().catch(error => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});
