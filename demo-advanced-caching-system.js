#!/usr/bin/env node

/**
 * Advanced Caching System Demo
 * 
 * Demonstrates:
 * - Cache-aware crawling
 * - Offline mining
 * - Visual comparison with screenshots
 * - Training data collection
 * - Performance metrics
 */

import { CacheAwareCrawler } from './services/cache-aware-crawler.js';
import { AdvancedCacheManager } from './services/advanced-cache-manager.js';

const DEMO_URLS = [
  'https://example.com',
  'https://httpbin.org',
  'https://jsonplaceholder.typicode.com',
];

async function runDemo() {
  console.log('🚀 Advanced Caching System Demo\n');
  console.log('═'.repeat(60));
  
  // Initialize crawler
  const crawler = new CacheAwareCrawler({
    enableCDP: true,
    enableScreenshots: true,
    enableOCR: false, // Disable OCR for demo
    enableOfflineMining: true,
    screenshotDir: './data/screenshots'
  });
  
  try {
    await crawler.initialize();
    
    // Demo 1: Basic crawling with cache
    console.log('\n📋 Demo 1: Cache-Aware Crawling');
    console.log('─'.repeat(60));
    await demoCacheAwareCrawling(crawler);
    
    // Demo 2: Asset caching
    console.log('\n📦 Demo 2: Asset Caching');
    console.log('─'.repeat(60));
    await demoAssetCaching(crawler);
    
    // Demo 3: Screenshot comparison
    console.log('\n📸 Demo 3: Screenshot & Visual Comparison');
    console.log('─'.repeat(60));
    await demoScreenshotComparison(crawler);
    
    // Demo 4: Training data collection
    console.log('\n🧠 Demo 4: Training Data Collection');
    console.log('─'.repeat(60));
    await demoTrainingDataCollection(crawler);
    
    // Demo 5: Offline mining
    console.log('\n🔌 Demo 5: Offline Mining');
    console.log('─'.repeat(60));
    await demoOfflineMining(crawler);
    
    // Demo 6: Cache statistics
    console.log('\n📊 Demo 6: Cache Statistics');
    console.log('─'.repeat(60));
    await demoCacheStatistics(crawler);
    
    // Demo 7: Network activity monitoring
    console.log('\n🌐 Demo 7: Network Activity Monitoring');
    console.log('─'.repeat(60));
    await demoNetworkMonitoring(crawler);
    
    console.log('\n✅ Demo completed successfully!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await crawler.close();
  }
}

async function demoCacheAwareCrawling(crawler) {
  const url = DEMO_URLS[0];
  
  console.log(`\n1. First crawl (cold): ${url}`);
  const start1 = Date.now();
  const result1 = await crawler.crawl(url);
  const duration1 = Date.now() - start1;
  
  console.log(`   ✓ Completed in ${duration1}ms`);
  console.log(`   ✓ From cache: ${result1.fromCache}`);
  console.log(`   ✓ Status: ${result1.data.statusCode}`);
  console.log(`   ✓ Service worker: ${result1.data.serviceWorkerDetected}`);
  
  console.log(`\n2. Second crawl (warm): ${url}`);
  const start2 = Date.now();
  const result2 = await crawler.crawl(url);
  const duration2 = Date.now() - start2;
  
  console.log(`   ✓ Completed in ${duration2}ms`);
  console.log(`   ✓ From cache: ${result2.fromCache}`);
  console.log(`   ✓ Speed improvement: ${Math.round((1 - duration2/duration1) * 100)}%`);
  
  console.log(`\n3. Force refresh: ${url}`);
  const start3 = Date.now();
  const result3 = await crawler.crawl(url, { forceRefresh: true });
  const duration3 = Date.now() - start3;
  
  console.log(`   ✓ Completed in ${duration3}ms`);
  console.log(`   ✓ From cache: ${result3.fromCache}`);
}

async function demoAssetCaching(crawler) {
  const url = DEMO_URLS[1];
  
  console.log(`\nCrawling with asset caching: ${url}`);
  const result = await crawler.crawl(url, { cacheAssets: true });
  
  if (result.data.networkRequests) {
    const totalRequests = result.data.networkRequests.length;
    const cachedRequests = result.data.networkRequests.filter(r => r.fromCache).length;
    const scripts = result.data.networkRequests.filter(r => r.resourceType === 'script').length;
    const styles = result.data.networkRequests.filter(r => r.resourceType === 'stylesheet').length;
    
    console.log(`\n   Network Statistics:`);
    console.log(`   ✓ Total requests: ${totalRequests}`);
    console.log(`   ✓ Cached requests: ${cachedRequests} (${Math.round(cachedRequests/totalRequests*100)}%)`);
    console.log(`   ✓ JavaScript files: ${scripts}`);
    console.log(`   ✓ Stylesheets: ${styles}`);
  }
}

async function demoScreenshotComparison(crawler) {
  const url = DEMO_URLS[0];
  
  console.log(`\nCapturing initial screenshot: ${url}`);
  const result1 = await crawler.crawl(url, { forceRefresh: true });
  
  if (result1.data.screenshot) {
    console.log(`   ✓ Screenshot saved: ${result1.data.screenshot.path}`);
    console.log(`   ✓ Hash: ${result1.data.screenshot.hash.substring(0, 16)}...`);
    console.log(`   ✓ Visual changed: ${result1.data.screenshot.hasChanged}`);
  }
  
  console.log(`\nCapturing second screenshot (should match): ${url}`);
  const result2 = await crawler.crawl(url, { forceRefresh: true });
  
  if (result2.data.screenshot) {
    console.log(`   ✓ Screenshot saved: ${result2.data.screenshot.path}`);
    console.log(`   ✓ Hash: ${result2.data.screenshot.hash.substring(0, 16)}...`);
    console.log(`   ✓ Visual changed: ${result2.data.screenshot.hasChanged}`);
    
    if (result1.data.screenshot && result2.data.screenshot) {
      const matched = result1.data.screenshot.hash === result2.data.screenshot.hash;
      console.log(`   ✓ Hashes match: ${matched}`);
    }
  }
}

async function demoTrainingDataCollection(crawler) {
  console.log('\nCollecting training data from multiple sites...');
  
  const results = [];
  
  for (const url of DEMO_URLS) {
    console.log(`\n   Processing: ${url}`);
    
    const result = await crawler.collectTrainingData(url, {
      labels: {
        category: guessCategory(url),
        hasSW: false,
        isStatic: true
      },
      qualityScore: 0.85,
      dataType: 'demo-crawl'
    });
    
    results.push(result);
    
    console.log(`   ✓ Status: ${result.success ? 'Success' : 'Failed'}`);
    console.log(`   ✓ Duplicate: ${result.duplicate}`);
    console.log(`   ✓ Hash: ${result.dataHash?.substring(0, 16)}...`);
  }
  
  const duplicates = results.filter(r => r.duplicate).length;
  console.log(`\n   Summary:`);
  console.log(`   ✓ Total sites: ${results.length}`);
  console.log(`   ✓ New data: ${results.length - duplicates}`);
  console.log(`   ✓ Duplicates: ${duplicates}`);
}

async function demoOfflineMining(crawler) {
  // Note: This will likely fail for most sites unless they have service workers
  const pwaSites = [
    'https://app.pwa-directory.appspot.com/', // PWA directory itself
  ];
  
  console.log('\nAttempting offline mining...');
  console.log('(Most sites will fail unless they have service workers)\n');
  
  for (const url of pwaSites) {
    console.log(`   Testing: ${url}`);
    
    try {
      const result = await crawler.mineOfflineSite(url);
      
      if (result.success) {
        console.log(`   ✅ Site works offline!`);
        console.log(`   ✓ Session ID: ${result.sessionId}`);
        console.log(`   ✓ Cached resources: ${result.cachedResources?.length || 0}`);
      } else {
        console.log(`   ⚠️  Site requires network`);
        console.log(`   ✓ Reason: ${result.reason}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function demoCacheStatistics(crawler) {
  console.log('\nRetrieving cache statistics...\n');
  
  const stats = await crawler.getStats();
  
  console.log('   URL Cache:');
  console.log(`   ✓ Total URLs: ${stats.urls.total_urls || 0}`);
  console.log(`   ✓ Stale URLs: ${stats.urls.stale_urls || 0}`);
  console.log(`   ✓ Expired URLs: ${stats.urls.expired_urls || 0}`);
  console.log(`   ✓ Total crawls: ${stats.urls.total_crawls || 0}`);
  
  console.log('\n   Asset Cache:');
  console.log(`   ✓ Total assets: ${stats.assets.total_assets || 0}`);
  console.log(`   ✓ Total size: ${formatBytes(Number(stats.assets.total_size) || 0)}`);
  console.log(`   ✓ Total accesses: ${stats.assets.total_accesses || 0}`);
  
  console.log('\n   Screenshot Cache:');
  console.log(`   ✓ Total screenshots: ${stats.screenshots.total_screenshots || 0}`);
  
  console.log('\n   OCR Cache:');
  console.log(`   ✓ Total OCR results: ${stats.ocr.total_ocr_results || 0}`);
  console.log(`   ✓ Avg confidence: ${Number(stats.ocr.avg_confidence || 0).toFixed(2)}`);
  
  console.log('\n   Training Data:');
  console.log(`   ✓ Total samples: ${stats.trainingData.total_training_data || 0}`);
  console.log(`   ✓ Used in training: ${stats.trainingData.used_in_training || 0}`);
  
  console.log('\n   Memory Cache:');
  console.log(`   ✓ URL cache size: ${stats.memory.urlCacheSize}`);
  console.log(`   ✓ Asset cache size: ${stats.memory.assetCacheSize}`);
  console.log(`   ✓ Screenshot cache size: ${stats.memory.screenshotCacheSize}`);
  console.log(`   ✓ OCR cache size: ${stats.memory.ocrCacheSize}`);
}

async function demoNetworkMonitoring(crawler) {
  const url = DEMO_URLS[1];
  
  console.log(`\nMonitoring network activity: ${url}`);
  const result = await crawler.crawl(url, { forceRefresh: true });
  
  if (result.data.networkRequests) {
    const requests = result.data.networkRequests;
    
    console.log(`\n   Total requests: ${requests.length}`);
    
    // Group by resource type
    const byType = requests.reduce((acc, req) => {
      acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n   By resource type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ✓ ${type}: ${count}`);
    });
    
    // Cache statistics
    const fromCache = requests.filter(r => r.fromCache).length;
    const fromSW = requests.filter(r => r.fromServiceWorker).length;
    
    console.log('\n   Cache statistics:');
    console.log(`   ✓ From browser cache: ${fromCache} (${Math.round(fromCache/requests.length*100)}%)`);
    console.log(`   ✓ From service worker: ${fromSW} (${Math.round(fromSW/requests.length*100)}%)`);
  }
}

// Helper functions
function guessCategory(url) {
  if (url.includes('example')) return 'demo';
  if (url.includes('httpbin')) return 'api';
  if (url.includes('placeholder')) return 'api';
  return 'unknown';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Run demo
runDemo().catch(console.error);
