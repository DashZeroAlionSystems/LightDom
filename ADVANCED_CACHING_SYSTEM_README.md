# Advanced Caching System for Large-Scale Data Mining

## Overview

The Advanced Caching System provides comprehensive caching strategies optimized for large-scale data mining operations with LightDom. It combines Chrome DevTools Protocol (CDP), Service Workers, IndexedDB, and PostgreSQL to enable efficient crawling, offline mining, visual comparison, and training data collection.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Caching Strategies](#caching-strategies)
4. [Offline Mining](#offline-mining)
5. [Visual Comparison with OCR](#visual-comparison-with-ocr)
6. [Training Data Collection](#training-data-collection)
7. [API Reference](#api-reference)
8. [Usage Examples](#usage-examples)
9. [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   LightDom Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Cache-Aware Crawler                           │   │
│  │  - CDP Integration                                   │   │
│  │  - Network Monitoring                                │   │
│  │  - Screenshot Capture                                │   │
│  │  - Service Worker Detection                          │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│                 ▼                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Advanced Cache Manager                        │   │
│  │  - URL Cache (LRU + PostgreSQL)                      │   │
│  │  - Asset Cache (Libraries, Scripts, Styles)          │   │
│  │  - Screenshot Cache (Visual Comparison)              │   │
│  │  - OCR Cache (Text Extraction)                       │   │
│  │  - Training Data Cache (Deduplication)               │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
└─────────────────┼─────────────────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────────┐
   │         Storage Layers                        │
   ├──────────────────────────────────────────────┤
   │                                                │
   │  ┌──────────────────┐   ┌──────────────────┐ │
   │  │  In-Memory LRU   │   │   PostgreSQL     │ │
   │  │  - Hot URLs      │   │  - Persistent    │ │
   │  │  - Assets        │   │  - Full History  │ │
   │  │  - Screenshots   │   │  - Analytics     │ │
   │  └──────────────────┘   └──────────────────┘ │
   │                                                │
   │  ┌──────────────────┐   ┌──────────────────┐ │
   │  │  Service Worker  │   │   IndexedDB      │ │
   │  │  - Browser Cache │   │  - Structured    │ │
   │  │  - Offline Data  │   │  - Client-side   │ │
   │  └──────────────────┘   └──────────────────┘ │
   │                                                │
   └────────────────────────────────────────────────┘
```

## Components

### 1. Advanced Cache Manager (`services/advanced-cache-manager.js`)

The core caching engine that manages multiple cache tiers:

- **In-Memory LRU Cache**: Fast access to hot data
- **PostgreSQL Storage**: Persistent storage with full SQL capabilities
- **Cache Tables**:
  - `url_cache`: URL crawl data with TTL
  - `asset_cache`: Scripts, styles, libraries
  - `screenshot_cache`: Visual snapshots for comparison
  - `ocr_cache`: OCR text extraction results
  - `network_activity_log`: Network request monitoring
  - `offline_mining_sessions`: Offline data mining records
  - `training_data_cache`: Deduplicated ML training data

**Key Features**:
- Configurable TTL (Time-To-Live) for each cache type
- Stale-while-revalidate strategy
- Automatic cache expiration and cleanup
- Hash-based deduplication
- Compression support

### 2. Cache-Aware Crawler (`services/cache-aware-crawler.js`)

Enhanced Puppeteer crawler with cache integration:

**Features**:
- Chrome DevTools Protocol (CDP) integration
- Network activity monitoring
- Service worker detection
- Screenshot capture with visual diff
- DOM snapshot collection
- Asset caching
- Offline mining simulation
- Training data collection

**CDP Capabilities**:
- Cache hit/miss tracking
- Network throttling simulation
- Performance metrics
- Resource timing
- Cache inspection

### 3. Enhanced Service Worker (`public/sw.js`)

Advanced service worker with IndexedDB integration:

**Features**:
- Multi-tier caching (static, dynamic, API, mining)
- IndexedDB for structured data:
  - Crawl data
  - Screenshots
  - OCR results
  - Network logs
  - Training data
- Background sync for offline operations
- Push notifications for mining events
- Stale-while-revalidate strategy
- Network activity logging

## Caching Strategies

### 1. URL Caching

**Strategy**: Cache-first with TTL and stale-while-revalidate

```javascript
// Check cache before crawling
const cacheCheck = await cacheManager.isCached(url);

if (cacheCheck.cached && !cacheCheck.stale) {
  // Use cached data
  return cacheCheck.data;
}

// If stale, return cached data but revalidate in background
if (cacheCheck.stale) {
  revalidateInBackground(url);
  return cacheCheck.data;
}

// Fresh crawl if not cached
const data = await crawl(url);
await cacheManager.cacheUrl(url, data);
```

**Configuration**:
- Default TTL: 24 hours
- Stale-while-revalidate: Enabled
- LRU cache size: 10,000 URLs
- Compression: Enabled for large DOM snapshots

### 2. Asset Caching

**Strategy**: Long-term cache for static assets (libraries, scripts, styles)

```javascript
// Cache assets during crawl
await cacheManager.cacheAsset(assetUrl, content, {
  type: 'javascript',
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  metadata: { version: '1.2.3' }
});
```

**Benefits**:
- Avoid re-downloading common libraries (React, jQuery, etc.)
- Faster repeated crawls of similar sites
- Bandwidth savings
- CDN URL normalization

### 3. Screenshot Caching

**Strategy**: Store screenshots with hash-based deduplication for visual comparison

```javascript
// Capture and cache screenshot
const screenshot = await page.screenshot({ fullPage: true });
const result = await cacheManager.cacheScreenshot(url, screenshot, {
  viewportWidth: 1920,
  viewportHeight: 1080,
  deviceType: 'desktop'
});

// Check if visual changed
if (result.hasChanged) {
  console.log('Visual changes detected!');
  // Trigger OCR or visual diff analysis
}
```

**Use Cases**:
- Detect website changes without re-crawling
- Visual regression testing
- A/B testing detection
- Training data for image recognition models

### 4. OCR Result Caching

**Strategy**: Cache expensive OCR operations

```javascript
// Check OCR cache first
const cachedOCR = await cacheManager.getCachedOCR(screenshotHash);

if (cachedOCR.found) {
  return cachedOCR.data;
}

// Perform OCR if not cached
const ocrResult = await performOCR(screenshot);
await cacheManager.cacheOCR(screenshotHash, ocrResult);
```

**Benefits**:
- Avoid redundant OCR processing
- Store extracted keywords for search
- Cache entity extraction
- Store confidence scores

## Offline Mining

### Concept

Offline mining simulates network disconnection to:
1. Detect sites that work offline (PWA, service workers)
2. Mine cached resources without network access
3. Inspect service worker caches
4. Collect data from offline-first applications

### Implementation

```javascript
// Start offline mining session
const crawler = new CacheAwareCrawler({ enableOfflineMining: true });
await crawler.initialize();

const result = await crawler.mineOfflineSite('https://example.com');

if (result.success) {
  console.log('Offline mining successful!');
  console.log('Cached resources:', result.cachedResources);
  console.log('Mined data:', result.minedData);
}
```

### Use Cases

1. **PWA Detection**: Identify Progressive Web Apps
2. **Service Worker Analysis**: Understand caching strategies
3. **Offline-First Testing**: Test offline capabilities
4. **Cache Inspection**: See what resources are cached
5. **Training Data**: Collect offline app architectures

### Network Monitoring for Offline Detection

```javascript
// Monitor network activity to detect offline capability
crawler.on('networkActivity', (activity) => {
  if (activity.fromServiceWorker) {
    console.log('Resource served from service worker:', activity.url);
  }
  if (activity.fromCache) {
    console.log('Resource served from browser cache:', activity.url);
  }
});
```

## Visual Comparison with OCR

### Screenshot-Based Change Detection

```javascript
// Capture initial screenshot
const initial = await crawler.crawl('https://example.com', {
  enableScreenshots: true
});

// Wait some time...

// Capture new screenshot
const updated = await crawler.crawl('https://example.com', {
  enableScreenshots: true,
  forceRefresh: true
});

// Compare screenshots
if (initial.data.screenshot.hash !== updated.data.screenshot.hash) {
  console.log('Visual changes detected!');
  
  // Perform OCR on both
  const initialOCR = await performOCR(initial.data.screenshot);
  const updatedOCR = await performOCR(updated.data.screenshot);
  
  // Compare text content
  const textDiff = compareText(initialOCR.text, updatedOCR.text);
  console.log('Text changes:', textDiff);
}
```

### OCR Integration

The system integrates with the DeepSeek-OCR service for optical compression:

```javascript
import DeepSeekOCRService from './services/deepseek-ocr-service.js';

const ocrService = new DeepSeekOCRService({
  ocrWorkerEndpoint: 'http://localhost:8000',
  defaultCompressionRatio: 0.1 // 10× compression
});

// Process screenshot with OCR
const ocrResult = await ocrService.processImage(screenshot, {
  outputFormat: 'markdown',
  extractKeywords: true,
  extractEntities: true
});

// Cache OCR result
await cacheManager.cacheOCR(screenshotHash, ocrResult);
```

### Keyword Indexing with Layers Panel

Use Chrome Layers panel data to enhance keyword extraction:

```javascript
// Collect layers data via CDP
const client = await page.target().createCDPSession();
await client.send('LayerTree.enable');

const layersSnapshot = await client.send('LayerTree.snapshotCommandLog');

// Extract layer information
const layerData = await page.evaluate(() => {
  const layers = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT
  );
  
  let node;
  while (node = walker.nextNode()) {
    const computedStyle = window.getComputedStyle(node);
    if (computedStyle.zIndex !== 'auto') {
      layers.push({
        element: node.tagName,
        zIndex: computedStyle.zIndex,
        text: node.textContent.trim().substring(0, 100),
        position: computedStyle.position
      });
    }
  }
  
  return layers;
});

// Combine with OCR keywords
const keywords = [
  ...ocrResult.keywords,
  ...layerData.filter(l => l.text).map(l => l.text)
];
```

## Training Data Collection

### Deduplication Strategy

```javascript
// Collect training data with automatic deduplication
const trainingResult = await crawler.collectTrainingData(url, {
  labels: {
    category: 'e-commerce',
    hasServiceWorker: true,
    isResponsive: true
  },
  qualityScore: 0.95,
  dataType: 'web-crawl'
});

if (trainingResult.duplicate) {
  console.log('Duplicate data detected, skipped');
} else {
  console.log('New training data added:', trainingResult.dataHash);
}
```

### Training Data Structure

```json
{
  "sourceUrl": "https://example.com",
  "features": {
    "dom": {
      "title": "Example Site",
      "meta": [...],
      "dom": {...}
    },
    "networkRequests": [
      {
        "url": "https://cdn.example.com/script.js",
        "type": "script",
        "fromCache": true
      }
    ],
    "screenshot": {
      "hash": "abc123...",
      "hasChanged": false
    },
    "serviceWorker": true
  },
  "labels": {
    "category": "e-commerce",
    "hasServiceWorker": true,
    "isResponsive": true
  },
  "qualityScore": 0.95
}
```

### Query Training Data

```sql
-- Get all e-commerce training data
SELECT * FROM training_data_cache 
WHERE features->>'category' = 'e-commerce'
AND used_in_training = false
ORDER BY quality_score DESC
LIMIT 1000;

-- Get training data with service workers
SELECT * FROM training_data_cache 
WHERE features->'serviceWorker' = 'true'::jsonb;

-- Get unique training samples by hash
SELECT DISTINCT ON (data_hash) * 
FROM training_data_cache
WHERE quality_score > 0.8
ORDER BY data_hash, created_at DESC;
```

## API Reference

### Advanced Cache Manager

#### `initialize()`
Initialize cache manager and create database tables.

#### `isCached(url, options)`
Check if URL is cached and still valid.

**Returns**: `{ cached: boolean, data?: object, source?: string, stale?: boolean }`

#### `cacheUrl(url, data, options)`
Cache crawled URL data with TTL.

**Options**:
- `ttl`: Time-to-live in milliseconds (default: 24 hours)

#### `cacheAsset(assetUrl, content, options)`
Cache static asset with long TTL.

**Options**:
- `type`: Asset type (javascript, stylesheet, font, image, etc.)
- `ttl`: Time-to-live (default: 7 days)

#### `cacheScreenshot(url, screenshotData, options)`
Cache screenshot for visual comparison.

**Returns**: `{ screenshotHash: string, hasChanged: boolean }`

#### `cacheOCR(screenshotHash, ocrResult)`
Cache OCR extraction results.

#### `getCachedOCR(screenshotHash)`
Retrieve cached OCR results.

**Returns**: `{ found: boolean, data?: object, source?: string }`

#### `logNetworkActivity(url, networkRequest)`
Log network request for monitoring.

#### `startOfflineMiningSession(url, options)`
Start offline mining session.

**Returns**: `{ sessionId: string }`

#### `completeOfflineMiningSession(sessionId, minedData, cachedResources)`
Complete offline mining with results.

#### `addTrainingData(data, options)`
Add training data with deduplication.

**Returns**: `{ duplicate: boolean, dataHash: string }`

#### `getCacheStats()`
Get comprehensive cache statistics.

#### `cleanupExpiredCache()`
Remove expired cache entries.

### Cache-Aware Crawler

#### `initialize()`
Initialize crawler with browser and cache manager.

#### `crawl(url, options)`
Crawl URL with caching.

**Options**:
- `forceRefresh`: Bypass cache
- `timeout`: Request timeout (default: 30s)
- `cacheAssets`: Cache page assets

**Returns**: `{ fromCache: boolean, stale?: boolean, data: object }`

#### `mineOfflineSite(url, options)`
Mine site in offline mode.

**Returns**: `{ success: boolean, sessionId: string, minedData?: object }`

#### `collectTrainingData(url, options)`
Collect and cache training data.

**Options**:
- `labels`: Training labels
- `qualityScore`: Data quality (0-1)
- `dataType`: Type of data

**Returns**: `{ success: boolean, duplicate: boolean, dataHash: string }`

#### `getStats()`
Get crawler and cache statistics.

#### `cleanup()`
Clean up expired cache entries.

## Usage Examples

### Basic Crawling with Cache

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler({
  enableCDP: true,
  enableScreenshots: true,
  enableOCR: true
});

await crawler.initialize();

// First crawl - fetches from network
const result1 = await crawler.crawl('https://example.com');
console.log('From cache:', result1.fromCache); // false

// Second crawl - uses cache
const result2 = await crawler.crawl('https://example.com');
console.log('From cache:', result2.fromCache); // true

await crawler.close();
```

### Offline Mining

```javascript
const crawler = new CacheAwareCrawler({
  enableOfflineMining: true
});

await crawler.initialize();

// Check if site works offline
const offlineResult = await crawler.mineOfflineSite('https://pwa-example.com');

if (offlineResult.success) {
  console.log('Site has offline capabilities!');
  console.log('Cached resources:', offlineResult.cachedResources.length);
  console.log('Service workers detected');
}

await crawler.close();
```

### Training Data Collection

```javascript
const crawler = new CacheAwareCrawler({
  enableScreenshots: true
});

await crawler.initialize();

// Collect training data from multiple sites
const sites = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com'
];

for (const site of sites) {
  const result = await crawler.collectTrainingData(site, {
    labels: {
      category: 'blog',
      responsive: true
    },
    qualityScore: 0.9
  });
  
  console.log(`${site}: Duplicate=${result.duplicate}`);
}

// Get statistics
const stats = await crawler.getStats();
console.log('Training data samples:', stats.trainingData.total_training_data);

await crawler.close();
```

### Visual Change Detection

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';
import DeepSeekOCRService from './services/deepseek-ocr-service.js';

const crawler = new CacheAwareCrawler({ enableScreenshots: true });
const ocrService = new DeepSeekOCRService();

await crawler.initialize();

// Monitor site for changes
async function monitorSite(url, interval = 3600000) { // 1 hour
  let previousHash = null;
  
  while (true) {
    const result = await crawler.crawl(url, { forceRefresh: true });
    
    if (result.data.screenshot) {
      const currentHash = result.data.screenshot.hash;
      
      if (previousHash && currentHash !== previousHash) {
        console.log('🚨 Visual changes detected!');
        
        // Perform OCR to analyze changes
        const ocrResult = await ocrService.processImage(
          result.data.screenshot.data
        );
        
        console.log('Extracted text:', ocrResult.text);
        console.log('Keywords:', ocrResult.keywords);
      }
      
      previousHash = currentHash;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

monitorSite('https://example.com');
```

### Asset Caching for Faster Crawls

```javascript
const crawler = new CacheAwareCrawler();
await crawler.initialize();

// Crawl with asset caching
const result = await crawler.crawl('https://react-site.com', {
  cacheAssets: true
});

console.log('Network requests:', result.data.networkRequests.length);

// Cached assets
const cachedAssets = result.data.networkRequests.filter(r => r.fromCache);
console.log('Cached assets:', cachedAssets.length);

// Common libraries are now cached
// Next crawl of any React site will be faster
```

## Performance Optimization

### 1. LRU Cache Tuning

```javascript
const cacheManager = new AdvancedCacheManager({
  urlCacheSize: 50000,     // Increase for hot data
  assetCacheSize: 10000,   // Common libraries
  screenshotCacheSize: 5000,
  ocrCacheSize: 2000
});
```

### 2. TTL Configuration

```javascript
// Short TTL for dynamic content
await cacheManager.cacheUrl(url, data, {
  ttl: 1000 * 60 * 60 // 1 hour
});

// Long TTL for static assets
await cacheManager.cacheAsset(assetUrl, content, {
  ttl: 1000 * 60 * 60 * 24 * 30 // 30 days
});
```

### 3. Stale-While-Revalidate

```javascript
const cacheManager = new AdvancedCacheManager({
  staleWhileRevalidate: true // Return stale data immediately, update in background
});
```

### 4. Compression

```javascript
const cacheManager = new AdvancedCacheManager({
  compressionEnabled: true // Compress large DOM snapshots
});
```

### 5. Batch Operations

```javascript
// Collect URLs to crawl
const urls = ['url1', 'url2', 'url3', ...];

// Crawl in parallel with concurrency limit
const concurrency = 5;
const results = [];

for (let i = 0; i < urls.length; i += concurrency) {
  const batch = urls.slice(i, i + concurrency);
  const batchResults = await Promise.all(
    batch.map(url => crawler.crawl(url))
  );
  results.push(...batchResults);
}
```

## Best Practices

### 1. Cache Invalidation

```javascript
// Force refresh when needed
await crawler.crawl(url, { forceRefresh: true });

// Or mark as stale
await cacheManager.markStale(urlHash);
```

### 2. Cache Cleanup

```javascript
// Periodic cleanup
setInterval(async () => {
  const cleaned = await cacheManager.cleanupExpiredCache();
  console.log(`Cleaned ${cleaned} expired entries`);
}, 1000 * 60 * 60); // Every hour
```

### 3. Error Handling

```javascript
try {
  const result = await crawler.crawl(url);
  
  if (result.error) {
    console.error('Crawl failed:', result.data.errors);
    // Retry or log
  }
} catch (error) {
  console.error('Fatal error:', error);
}
```

### 4. Monitoring

```javascript
// Regular stats monitoring
setInterval(async () => {
  const stats = await crawler.getStats();
  
  console.log('Cache Statistics:');
  console.log('- URLs cached:', stats.urls.total_urls);
  console.log('- Assets cached:', stats.assets.total_assets);
  console.log('- Screenshots:', stats.screenshots.total_screenshots);
  console.log('- Training data:', stats.trainingData.total_training_data);
  console.log('- Memory usage:', {
    urls: stats.memory.urlCacheSize,
    assets: stats.memory.assetCacheSize
  });
}, 1000 * 60 * 5); // Every 5 minutes
```

### 5. Training Data Quality

```javascript
// Set quality thresholds
const MIN_QUALITY = 0.7;

await crawler.collectTrainingData(url, {
  qualityScore: calculateQualityScore(data),
  labels: autoGenerateLabels(data)
});

// Query only high-quality data
const highQualityData = await db.query(`
  SELECT * FROM training_data_cache 
  WHERE quality_score > $1
  ORDER BY quality_score DESC
`, [MIN_QUALITY]);
```

## Conclusion

The Advanced Caching System provides a robust foundation for large-scale data mining with:

- **Multi-tier caching** for performance
- **Offline mining** for PWA discovery
- **Visual comparison** for change detection
- **OCR integration** for text extraction
- **Training data** collection with deduplication
- **Network monitoring** for insights
- **CDP integration** for deep browser control

This system enables efficient, scalable web crawling and data mining for training neural networks and building comprehensive datasets.

## Related Documentation

- [DeepSeek OCR Integration](DEEPSEEK_OCR_INTEGRATION.md)
- [Mining System](MINING_SYSTEM_README.md)
- [Crawler Research](CRAWLER_RESEARCH.md)
- [GPU & Performance](GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md)
