# Advanced Caching System - Quick Start Guide

Get started with the Advanced Caching System in under 5 minutes!

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm packages installed

## Quick Setup

### 1. Install Dependencies

The required packages (`puppeteer`, `lru-cache`, `pg`) are already included in the project.

### 2. Configure Database

Ensure your PostgreSQL connection is configured in `.env`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Run the Demo

```bash
# Run the comprehensive demo
node demo-advanced-caching-system.js
```

This will demonstrate:
- ✅ Cache-aware crawling
- ✅ Asset caching
- ✅ Screenshot comparison
- ✅ Training data collection
- ✅ Offline mining attempts
- ✅ Cache statistics
- ✅ Network monitoring

## Basic Usage

### Simple Crawling with Cache

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler();
await crawler.initialize();

// First crawl - fetches from network
const result1 = await crawler.crawl('https://example.com');
console.log('From cache:', result1.fromCache); // false
console.log('Time:', result1.data.timestamp);

// Second crawl - uses cache (much faster!)
const result2 = await crawler.crawl('https://example.com');
console.log('From cache:', result2.fromCache); // true

await crawler.close();
```

### Collect Training Data

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler({ enableScreenshots: true });
await crawler.initialize();

// Collect training data with labels
const result = await crawler.collectTrainingData('https://example.com', {
  labels: {
    category: 'e-commerce',
    hasServiceWorker: false,
    isResponsive: true
  },
  qualityScore: 0.9
});

console.log('Duplicate:', result.duplicate);
console.log('Data hash:', result.dataHash);

await crawler.close();
```

### Offline Mining

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler({ enableOfflineMining: true });
await crawler.initialize();

// Try to mine a site offline
const result = await crawler.mineOfflineSite('https://pwa-example.com');

if (result.success) {
  console.log('Site works offline!');
  console.log('Cached resources:', result.cachedResources.length);
} else {
  console.log('Site requires network');
}

await crawler.close();
```

### Visual Change Detection

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler({ enableScreenshots: true });
await crawler.initialize();

// Capture initial screenshot
const initial = await crawler.crawl('https://example.com', { forceRefresh: true });
console.log('Initial hash:', initial.data.screenshot.hash);

// Wait and capture again
await new Promise(resolve => setTimeout(resolve, 5000));

const updated = await crawler.crawl('https://example.com', { forceRefresh: true });
console.log('Updated hash:', updated.data.screenshot.hash);

if (initial.data.screenshot.hash !== updated.data.screenshot.hash) {
  console.log('Visual changes detected!');
}

await crawler.close();
```

## Configuration Options

### Cache Manager Options

```javascript
import { AdvancedCacheManager } from './services/advanced-cache-manager.js';

const cacheManager = new AdvancedCacheManager({
  // LRU cache sizes
  urlCacheSize: 10000,
  assetCacheSize: 5000,
  screenshotCacheSize: 1000,
  ocrCacheSize: 500,
  
  // TTL settings
  urlCacheTTL: 1000 * 60 * 60 * 24,      // 24 hours
  assetCacheTTL: 1000 * 60 * 60 * 24 * 7, // 7 days
  defaultCacheTTL: 1000 * 60 * 60 * 24,   // 24 hours
  
  // Features
  enableOfflineMining: true,
  enableVisualDiffTracking: true,
  enableNetworkMonitoring: true,
  staleWhileRevalidate: true,
  compressionEnabled: true
});

await cacheManager.initialize();
```

### Crawler Options

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler({
  cacheManager: customCacheManager, // Optional: provide your own
  enableCDP: true,                   // Chrome DevTools Protocol
  enableOfflineMining: true,         // Offline site mining
  enableScreenshots: true,           // Screenshot capture
  enableOCR: true,                   // OCR integration
  screenshotDir: './data/screenshots'
});

await crawler.initialize();
```

## CLI Commands

### Run Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test
npm run test:integration -- --grep "Advanced Caching"
```

### View Cache Statistics

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler();
await crawler.initialize();

const stats = await crawler.getStats();
console.log(JSON.stringify(stats, null, 2));

await crawler.close();
```

### Cleanup Expired Cache

```javascript
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

const crawler = new CacheAwareCrawler();
await crawler.initialize();

const cleaned = await crawler.cleanup();
console.log(`Cleaned ${cleaned} expired entries`);

await crawler.close();
```

## Common Use Cases

### 1. Efficient Web Crawling

```javascript
// Crawl multiple URLs with caching
const urls = ['url1', 'url2', 'url3'];

for (const url of urls) {
  const result = await crawler.crawl(url);
  
  if (result.fromCache) {
    console.log(`✓ ${url} (cached)`);
  } else {
    console.log(`→ ${url} (fresh)`);
  }
}
```

### 2. Monitor Website Changes

```javascript
// Monitor a site every hour
setInterval(async () => {
  const result = await crawler.crawl('https://example.com', { 
    forceRefresh: true 
  });
  
  if (result.data.screenshot?.hasChanged) {
    console.log('🚨 Visual changes detected!');
    // Send notification, trigger analysis, etc.
  }
}, 3600000); // 1 hour
```

### 3. Build Training Dataset

```javascript
// Collect training data from multiple sites
const sites = [
  { url: 'https://shop1.com', category: 'e-commerce' },
  { url: 'https://blog1.com', category: 'blog' },
  { url: 'https://news1.com', category: 'news' }
];

const dataset = [];

for (const site of sites) {
  const result = await crawler.collectTrainingData(site.url, {
    labels: { category: site.category },
    qualityScore: 0.9
  });
  
  if (!result.duplicate) {
    dataset.push(result.features);
  }
}

console.log(`Collected ${dataset.length} unique samples`);
```

### 4. Analyze Caching Strategies

```javascript
// Analyze how sites use caching
const result = await crawler.crawl('https://example.com', { 
  forceRefresh: true 
});

const cached = result.data.networkRequests.filter(r => r.fromCache).length;
const total = result.data.networkRequests.length;
const swCached = result.data.networkRequests.filter(r => r.fromServiceWorker).length;

console.log(`Cache usage: ${(cached/total*100).toFixed(1)}%`);
console.log(`Service worker usage: ${(swCached/total*100).toFixed(1)}%`);
console.log(`Service worker detected: ${result.data.serviceWorkerDetected}`);
```

## Database Queries

### Query Cached URLs

```sql
-- Get all cached URLs
SELECT url, last_crawled, crawl_count, is_stale 
FROM url_cache 
ORDER BY last_crawled DESC;

-- Get frequently crawled URLs
SELECT url, crawl_count, last_crawled 
FROM url_cache 
ORDER BY crawl_count DESC 
LIMIT 10;

-- Get stale cache entries
SELECT url, cache_expires_at, is_stale 
FROM url_cache 
WHERE is_stale = TRUE;
```

### Query Training Data

```sql
-- Get all training data
SELECT data_type, COUNT(*) as count, AVG(quality_score) as avg_quality
FROM training_data_cache
GROUP BY data_type;

-- Get unused training data
SELECT * FROM training_data_cache 
WHERE used_in_training = FALSE 
AND quality_score > 0.8
ORDER BY quality_score DESC;

-- Get training data by category
SELECT features->>'category' as category, COUNT(*) as count
FROM training_data_cache
GROUP BY features->>'category';
```

### Query Network Activity

```sql
-- Get cache hit rate by URL
SELECT url, 
  COUNT(*) as total_requests,
  SUM(CASE WHEN from_cache THEN 1 ELSE 0 END) as cache_hits,
  ROUND(100.0 * SUM(CASE WHEN from_cache THEN 1 ELSE 0 END) / COUNT(*), 2) as cache_hit_rate
FROM network_activity_log
GROUP BY url
ORDER BY cache_hit_rate DESC;

-- Get most requested resources
SELECT request_url, resource_type, COUNT(*) as request_count
FROM network_activity_log
GROUP BY request_url, resource_type
ORDER BY request_count DESC
LIMIT 20;
```

## Performance Tips

### 1. Tune LRU Cache Sizes

```javascript
// For high-traffic crawling
const cacheManager = new AdvancedCacheManager({
  urlCacheSize: 50000,    // Increase for more URLs in memory
  assetCacheSize: 10000   // Increase for more assets in memory
});
```

### 2. Use Batch Processing

```javascript
// Process URLs in parallel batches
const concurrency = 5;
const urls = [...]; // Large array of URLs

for (let i = 0; i < urls.length; i += concurrency) {
  const batch = urls.slice(i, i + concurrency);
  await Promise.all(batch.map(url => crawler.crawl(url)));
}
```

### 3. Configure TTL Based on Content

```javascript
// Short TTL for dynamic content
await cacheManager.cacheUrl(url, data, { ttl: 1000 * 60 * 60 }); // 1 hour

// Long TTL for static content
await cacheManager.cacheAsset(assetUrl, content, { ttl: 1000 * 60 * 60 * 24 * 30 }); // 30 days
```

### 4. Regular Cleanup

```javascript
// Schedule periodic cleanup
setInterval(async () => {
  const cleaned = await crawler.cleanup();
  console.log(`Cleaned ${cleaned} expired entries`);
}, 1000 * 60 * 60); // Every hour
```

## Troubleshooting

### Cache Not Working

```javascript
// Force initialize
await cacheManager.initialize();

// Check cache status
const stats = await cacheManager.getCacheStats();
console.log('Cache stats:', stats);

// Force refresh to bypass cache
const result = await crawler.crawl(url, { forceRefresh: true });
```

### Database Connection Issues

```bash
# Test database connection
psql -U postgres -d dom_space_harvester -c "SELECT 1;"

# Check environment variables
echo $DB_HOST
echo $DB_NAME
```

### Screenshot Issues

```bash
# Create screenshot directory
mkdir -p data/screenshots

# Check permissions
ls -la data/screenshots
```

## Next Steps

- Read the [Full Documentation](ADVANCED_CACHING_SYSTEM_README.md)
- Explore [Demo Examples](demo-advanced-caching-system.js)
- Run [Integration Tests](test/integration/advanced-caching-system.test.js)
- Check [Mining System](MINING_SYSTEM_README.md)
- Review [Crawler Research](CRAWLER_RESEARCH.md)

## Support

For issues or questions:
1. Check the [Full Documentation](ADVANCED_CACHING_SYSTEM_README.md)
2. Review test examples in `test/integration/`
3. Run the demo to validate setup: `node demo-advanced-caching-system.js`

Happy caching! 🚀
