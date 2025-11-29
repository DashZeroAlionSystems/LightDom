#!/usr/bin/env node

/**
 * Caching Layer Configuration Demo
 * 
 * Demonstrates how to:
 * - Load and switch between caching profiles
 * - Configure cache strategies for data mining
 * - Apply custom overrides
 * - Use profiles with Cache Manager and Crawler
 */

import { CachingLayerConfig } from './services/caching-layer-config.js';
import { AdvancedCacheManager } from './services/advanced-cache-manager.js';
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

async function runDemo() {
  console.log('🚀 Caching Layer Configuration Demo\n');
  console.log('═'.repeat(70));
  
  // Demo 1: Load configuration and list profiles
  console.log('\n📋 Demo 1: Configuration Loading & Profiles');
  console.log('─'.repeat(70));
  await demoConfigLoading();
  
  // Demo 2: Switch between profiles
  console.log('\n🔄 Demo 2: Profile Switching');
  console.log('─'.repeat(70));
  await demoProfileSwitching();
  
  // Demo 3: Apply custom overrides
  console.log('\n🔧 Demo 3: Custom Overrides');
  console.log('─'.repeat(70));
  await demoCustomOverrides();
  
  // Demo 4: Use with Cache Manager
  console.log('\n💾 Demo 4: Cache Manager Integration');
  console.log('─'.repeat(70));
  await demoCacheManagerIntegration();
  
  // Demo 5: Use with Crawler
  console.log('\n🕷️  Demo 5: Crawler Integration');
  console.log('─'.repeat(70));
  await demoCrawlerIntegration();
  
  // Demo 6: URL-specific strategies
  console.log('\n🎯 Demo 6: URL-Specific Strategies');
  console.log('─'.repeat(70));
  await demoUrlStrategies();
  
  // Demo 7: Configuration export/import
  console.log('\n📤 Demo 7: Configuration Export');
  console.log('─'.repeat(70));
  await demoConfigExport();
  
  console.log('\n✅ Demo completed successfully!');
  console.log('═'.repeat(70));
}

async function demoConfigLoading() {
  const config = new CachingLayerConfig();
  
  console.log('\nLoaded configuration:');
  console.log(`  Version: ${config.config.version}`);
  console.log(`  Active profile: ${config.activeProfile}`);
  
  console.log('\nAvailable profiles:');
  const profiles = config.listProfiles();
  profiles.forEach(profile => {
    const marker = profile.active ? '→' : ' ';
    console.log(`  ${marker} ${profile.name} - ${profile.description}`);
    console.log(`    Strategy: ${profile.strategy}, Enabled: ${profile.enabled}`);
  });
}

async function demoProfileSwitching() {
  const config = new CachingLayerConfig();
  
  console.log('\nSwitching to "aggressive" profile...');
  const profile = config.switchProfile('aggressive');
  console.log(`✓ Active profile: ${config.activeProfile}`);
  console.log(`  URL cache size: ${profile.caches.url.size}`);
  console.log(`  Asset cache size: ${profile.caches.asset.size}`);
  console.log(`  Screenshot cache size: ${profile.caches.screenshot.size}`);
  
  console.log('\nSwitching to "minimal" profile...');
  const minimalProfile = config.switchProfile('minimal');
  console.log(`✓ Active profile: ${config.activeProfile}`);
  console.log(`  URL cache size: ${minimalProfile.caches.url.size}`);
  console.log(`  Asset cache size: ${minimalProfile.caches.asset.size}`);
  console.log(`  Screenshot enabled: ${minimalProfile.caches.screenshot.enabled}`);
  
  // Switch back to default
  config.switchProfile('default');
  console.log(`\n✓ Switched back to default profile`);
}

async function demoCustomOverrides() {
  const config = new CachingLayerConfig();
  
  console.log('\nApplying custom cache override for URL cache...');
  config.setCacheOverride('url', {
    size: 25000,
    ttl: 172800000 // 2 days
  });
  
  console.log('✓ URL cache override applied');
  console.log(`  New size: 25000`);
  console.log(`  New TTL: 2 days`);
  
  console.log('\nApplying feature override...');
  config.setFeatureOverride('enableOCR', true);
  console.log('✓ OCR enabled via override');
  
  console.log('\nActive configuration with overrides:');
  const activeConfig = config.getActiveProfile();
  console.log(`  URL cache size: ${activeConfig.caches.url.size}`);
  
  console.log('\nResetting overrides...');
  config.resetOverrides();
  console.log('✓ Overrides reset');
}

async function demoCacheManagerIntegration() {
  const config = new CachingLayerConfig();
  
  // Switch to training-data profile
  config.switchProfile('training-data');
  console.log('\nUsing "training-data" profile for Cache Manager\n');
  
  // Create cache manager with config
  const cacheManager = new AdvancedCacheManager({ 
    cachingConfig: config 
  });
  
  await cacheManager.initialize();
  
  console.log('Cache Manager configuration:');
  console.log(`  URL cache size: ${cacheManager.urlCache.max}`);
  console.log(`  Asset cache size: ${cacheManager.assetCache.max}`);
  console.log(`  Screenshot cache size: ${cacheManager.screenshotCache.max}`);
  console.log(`  OCR cache size: ${cacheManager.ocrCache.max}`);
  console.log(`  Strategy: ${cacheManager.config.cacheStrategy}`);
  console.log(`  Stale-while-revalidate: ${cacheManager.config.staleWhileRevalidate}`);
  
  // Get stats
  const stats = await cacheManager.getCacheStats();
  console.log('\nCache Statistics:');
  console.log(`  URLs cached: ${stats.urls.total_urls || 0}`);
  console.log(`  Training data: ${stats.trainingData.total_training_data || 0}`);
  
  await cacheManager.close();
}

async function demoCrawlerIntegration() {
  const config = new CachingLayerConfig();
  
  // Switch to offline-mining profile
  config.switchProfile('offline-mining');
  console.log('\nUsing "offline-mining" profile for Crawler\n');
  
  // Create crawler with config
  const crawler = new CacheAwareCrawler({
    cachingConfig: config
  });
  
  await crawler.initialize();
  
  console.log('Crawler configuration:');
  console.log(`  CDP enabled: ${crawler.config.enableCDP}`);
  console.log(`  Offline mining: ${crawler.config.enableOfflineMining}`);
  console.log(`  Screenshots: ${crawler.config.enableScreenshots}`);
  console.log(`  OCR: ${crawler.config.enableOCR}`);
  console.log(`  Strategy: ${crawler.config.cacheStrategy}`);
  
  await crawler.close();
}

async function demoUrlStrategies() {
  const config = new CachingLayerConfig();
  
  const testUrls = [
    'https://api.example.com/data',
    'https://example.com/styles.css',
    'https://example.com/page.html',
    'https://cdn.example.com/logo.png'
  ];
  
  console.log('\nURL-specific caching strategies:\n');
  
  testUrls.forEach(url => {
    const strategy = config.getUrlStrategy(url);
    console.log(`  ${url}`);
    console.log(`    Strategy: ${strategy.strategy}`);
    console.log(`    TTL: ${strategy.ttl}ms`);
    console.log(`    Rule: ${strategy.name}`);
    console.log('');
  });
}

async function demoConfigExport() {
  const config = new CachingLayerConfig();
  
  // Switch to a profile
  config.switchProfile('training-data');
  
  // Apply some overrides
  config.setCacheOverride('url', { size: 30000 });
  config.setFeatureOverride('enableOCR', true);
  
  console.log('\nExporting configuration with overrides...');
  const exportPath = config.exportConfig();
  console.log(`✓ Configuration exported to: ${exportPath}`);
  
  console.log('\nExport includes:');
  console.log('  - Active profile: training-data');
  console.log('  - Custom overrides applied');
  console.log('  - Timestamp: ' + new Date().toISOString());
}

// Helper to display cache sizes in human-readable format
function formatCacheSize(size) {
  return `${(size / 1000).toFixed(1)}K entries`;
}

// Helper to display TTL in human-readable format
function formatTTL(ttl) {
  const hours = ttl / (1000 * 60 * 60);
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

// Run demo
runDemo().catch(console.error);
