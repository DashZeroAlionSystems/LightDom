# Caching Layer Configuration Guide

## Overview

The Caching Layer Configuration system provides a flexible, profile-based approach to configuring caching strategies for large-scale data mining operations. It allows you to:

- **Switch between pre-configured profiles** for different use cases
- **Apply custom overrides** without modifying config files
- **Configure cache sizes and TTL** for different cache types
- **Enable/disable features** dynamically
- **Define URL-specific strategies** for fine-grained control

## Quick Start

### 1. Basic Usage

```javascript
import { CachingLayerConfig } from './services/caching-layer-config.js';
import { AdvancedCacheManager } from './services/advanced-cache-manager.js';
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

// Load configuration (reads from config/caching-strategies.json)
const config = new CachingLayerConfig();

// Create cache manager with config
const cacheManager = new AdvancedCacheManager({ cachingConfig: config });
await cacheManager.initialize();

// Create crawler with config
const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();
```

### 2. Switch Profiles

```javascript
// List available profiles
const profiles = config.listProfiles();
console.log(profiles);

// Switch to aggressive caching for high-frequency crawls
config.switchProfile('aggressive');

// Switch to minimal caching for fresh data
config.switchProfile('minimal');

// Switch to training-data profile for ML data collection
config.switchProfile('training-data');
```

### 3. Run the Demo

```bash
node demo-caching-layer-config.js
```

## Configuration File Structure

The configuration is stored in `config/caching-strategies.json`:

```json
{
  "version": "1.0.0",
  "profiles": { ... },
  "strategies": { ... },
  "database": { ... },
  "serviceWorker": { ... },
  "features": { ... },
  "customStrategies": { ... }
}
```

## Available Profiles

### 1. Default (Balanced Caching)

**Best for**: General-purpose data mining with balanced performance

```javascript
config.switchProfile('default');
```

**Configuration**:
- URL cache: 10,000 entries, 24h TTL
- Asset cache: 5,000 entries, 7d TTL
- Screenshot cache: 1,000 entries, 30d TTL
- OCR cache: 500 entries, 30d TTL
- Strategy: stale-while-revalidate

**Use Cases**:
- Regular web crawling
- Balanced memory usage
- Good cache hit rates

### 2. Aggressive Caching

**Best for**: High-frequency repeated crawls, maximum performance

```javascript
config.switchProfile('aggressive');
```

**Configuration**:
- URL cache: 50,000 entries, 7d TTL
- Asset cache: 20,000 entries, 30d TTL
- Screenshot cache: 5,000 entries, 90d TTL
- OCR cache: 2,000 entries, 90d TTL
- Strategy: cache-first

**Use Cases**:
- Monitoring sites for changes
- High-frequency crawling
- Large-scale repeated operations

### 3. Minimal Caching

**Best for**: Fresh data requirements, low memory usage

```javascript
config.switchProfile('minimal');
```

**Configuration**:
- URL cache: 1,000 entries, 1h TTL
- Asset cache: 500 entries, 24h TTL
- Screenshot cache: 100 entries, 1h TTL (disabled)
- OCR cache: 50 entries, 1h TTL (disabled)
- Strategy: network-first

**Use Cases**:
- Real-time data mining
- Fresh content requirements
- Low memory environments

### 4. Training Data Collection

**Best for**: Neural network training data with deduplication

```javascript
config.switchProfile('training-data');
```

**Configuration**:
- URL cache: 25,000 entries, 2d TTL
- Asset cache: 10,000 entries, 7d TTL
- Screenshot cache: 3,000 entries, 30d TTL
- OCR cache: 1,500 entries, 30d TTL
- Strategy: stale-while-revalidate

**Features**:
- enableDeduplication: true
- qualityScoring: true
- visualDiff: true
- autoLabeling: true

**Use Cases**:
- ML training data collection
- Dataset building
- Feature extraction

### 5. Offline PWA Mining

**Best for**: Detecting and mining Progressive Web Apps

```javascript
config.switchProfile('offline-mining');
```

**Configuration**:
- URL cache: 5,000 entries, 24h TTL
- Asset cache: 10,000 entries, 30d TTL
- Screenshot cache: 2,000 entries, 30d TTL
- OCR cache: 100 entries, 24h TTL (disabled)
- Strategy: cache-first

**Features**:
- offlineMining: true
- serviceWorkerInspection: true
- pwaDetection: true
- cacheEnumeration: true

**Use Cases**:
- PWA discovery
- Service worker analysis
- Offline capability testing

## Caching Strategies

The system supports five caching strategies:

### 1. cache-first

Check cache first, fallback to network if not found.

**Best for**: Static assets, rarely changing content

```json
{
  "priority": "cache",
  "fallback": "network",
  "updateCache": true
}
```

### 2. network-first

Fetch from network first, fallback to cache on failure.

**Best for**: Fresh data, API endpoints

```json
{
  "priority": "network",
  "fallback": "cache",
  "updateCache": true
}
```

### 3. stale-while-revalidate

Return cached data immediately, update in background.

**Best for**: Balance between speed and freshness

```json
{
  "priority": "cache",
  "fallback": "network",
  "updateCache": true,
  "backgroundRevalidate": true
}
```

### 4. cache-only

Only use cache, never fetch from network.

**Best for**: Offline mode, testing

```json
{
  "priority": "cache",
  "fallback": null,
  "updateCache": false
}
```

### 5. network-only

Always fetch from network, no caching.

**Best for**: Real-time data, no caching needed

```json
{
  "priority": "network",
  "fallback": null,
  "updateCache": false
}
```

## Custom Overrides

Apply temporary overrides without modifying the config file:

### Cache-Specific Overrides

```javascript
// Override URL cache settings
config.setCacheOverride('url', {
  size: 25000,
  ttl: 172800000, // 2 days
  enabled: true
});

// Override screenshot cache
config.setCacheOverride('screenshot', {
  size: 5000,
  ttl: 7776000000 // 90 days
});
```

### Feature Overrides

```javascript
// Enable OCR
config.setFeatureOverride('enableOCR', true);

// Enable screenshots
config.setFeatureOverride('enableScreenshots', true);

// Enable offline mining
config.setFeatureOverride('enableOfflineMining', true);
```

### Reset Overrides

```javascript
// Reset all custom overrides
config.resetOverrides();
```

## URL-Specific Strategies

Define caching strategies based on URL patterns:

### Example from Config

```json
{
  "customStrategies": {
    "url-patterns": {
      "api-endpoints": {
        "pattern": "^https?://[^/]+/api/",
        "strategy": "network-first",
        "ttl": 60000
      },
      "static-assets": {
        "pattern": "\\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf)$",
        "strategy": "cache-first",
        "ttl": 2592000000
      },
      "html-pages": {
        "pattern": "^https?://[^/]+(/[^?]*)?$",
        "strategy": "stale-while-revalidate",
        "ttl": 86400000
      }
    }
  }
}
```

### Usage

```javascript
// Get strategy for specific URL
const strategy = config.getUrlStrategy('https://api.example.com/data');
console.log(strategy.strategy); // 'network-first'
console.log(strategy.ttl);      // 60000

const assetStrategy = config.getUrlStrategy('https://cdn.example.com/style.css');
console.log(assetStrategy.strategy); // 'cache-first'
console.log(assetStrategy.ttl);      // 2592000000
```

## Integration Examples

### Example 1: Balanced Crawling

```javascript
import { CachingLayerConfig } from './services/caching-layer-config.js';
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

// Use default balanced profile
const config = new CachingLayerConfig();
const crawler = new CacheAwareCrawler({ cachingConfig: config });

await crawler.initialize();

// Crawl with balanced caching
const result = await crawler.crawl('https://example.com');
console.log('From cache:', result.fromCache);
```

### Example 2: Aggressive Training Data Collection

```javascript
import { CachingLayerConfig } from './services/caching-layer-config.js';
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

// Use training-data profile
const config = new CachingLayerConfig();
config.switchProfile('training-data');

const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();

// Collect training data with deduplication
const sites = ['site1.com', 'site2.com', 'site3.com'];

for (const site of sites) {
  const result = await crawler.collectTrainingData(`https://${site}`, {
    labels: { category: 'blog' },
    qualityScore: 0.9
  });
  console.log(`${site}: duplicate=${result.duplicate}`);
}
```

### Example 3: Offline PWA Mining

```javascript
import { CachingLayerConfig } from './services/caching-layer-config.js';
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

// Use offline-mining profile
const config = new CachingLayerConfig();
config.switchProfile('offline-mining');

const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();

// Mine offline sites
const result = await crawler.mineOfflineSite('https://pwa-example.com');

if (result.success) {
  console.log('PWA detected!');
  console.log('Cached resources:', result.cachedResources.length);
}
```

### Example 4: Custom Configuration

```javascript
import { CachingLayerConfig } from './services/caching-layer-config.js';
import { AdvancedCacheManager } from './services/advanced-cache-manager.js';

// Start with default
const config = new CachingLayerConfig();

// Apply custom overrides
config.setCacheOverride('url', { size: 30000, ttl: 172800000 });
config.setCacheOverride('screenshot', { size: 5000, enabled: true });
config.setFeatureOverride('enableOCR', true);
config.setFeatureOverride('enableScreenshots', true);

// Use with cache manager
const cacheManager = new AdvancedCacheManager({ cachingConfig: config });
await cacheManager.initialize();
```

## Profile Management

### Create New Profile

```javascript
config.createProfile('my-custom-profile', {
  name: 'My Custom Profile',
  description: 'Custom caching for my use case',
  strategy: 'cache-first',
  caches: {
    url: { enabled: true, size: 15000, ttl: 86400000, strategy: 'lru' },
    asset: { enabled: true, size: 8000, ttl: 604800000, strategy: 'lru' }
  },
  features: {
    enableOCR: true,
    enableScreenshots: true
  }
});
```

### Update Profile

```javascript
config.updateProfile('my-custom-profile', {
  caches: {
    url: { size: 20000 }
  }
});
```

### Delete Profile

```javascript
config.deleteProfile('my-custom-profile');
```

### Save Configuration

```javascript
// Save changes to file
config.saveConfig();

// Save to custom path
config.saveConfig('/path/to/custom-config.json');
```

## Configuration Export/Import

### Export Configuration

```javascript
// Export current config with overrides
const exportPath = config.exportConfig();
console.log('Exported to:', exportPath);

// Export includes:
// - Active profile
// - Custom overrides
// - Timestamp
```

### Load Custom Config

```javascript
// Load from custom path
const config = new CachingLayerConfig('/path/to/custom-config.json');
```

## Monitoring

### Listen to Events

```javascript
const config = new CachingLayerConfig();

config.on('profile-switched', ({ profile }) => {
  console.log('Profile switched to:', profile);
});

config.on('cache-override', ({ cacheName, options }) => {
  console.log('Cache override:', cacheName, options);
});

config.on('config-reloaded', ({ profile }) => {
  console.log('Config reloaded, active profile:', profile);
});
```

### Get Configuration Info

```javascript
// Get active profile
const activeProfile = config.getActiveProfile();
console.log('Active:', activeProfile.name);

// Get cache size
const urlCacheSize = config.getCacheSize('url');
console.log('URL cache size:', urlCacheSize);

// Get TTL
const urlTTL = config.getCacheTTL('url');
console.log('URL cache TTL:', urlTTL);

// Check if enabled
const screenshotsEnabled = config.isCacheEnabled('screenshot');
console.log('Screenshots enabled:', screenshotsEnabled);
```

## Best Practices

### 1. Choose the Right Profile

- **default**: Most use cases
- **aggressive**: High-frequency repeated crawls
- **minimal**: Fresh data, low memory
- **training-data**: ML dataset building
- **offline-mining**: PWA discovery

### 2. Use URL-Specific Strategies

Define patterns for different URL types to optimize caching:

```json
{
  "api-endpoints": { "strategy": "network-first", "ttl": 60000 },
  "static-assets": { "strategy": "cache-first", "ttl": 2592000000 },
  "html-pages": { "strategy": "stale-while-revalidate", "ttl": 86400000 }
}
```

### 3. Apply Overrides for Testing

Use overrides during development without modifying config:

```javascript
// Temporary override for testing
config.setCacheOverride('url', { size: 100, ttl: 5000 });

// Test...

// Reset when done
config.resetOverrides();
```

### 4. Monitor Cache Statistics

Regularly check cache performance:

```javascript
const stats = await cacheManager.getCacheStats();
console.log('Cache hit rate:', stats.urls.cache_hit_rate);
console.log('Memory usage:', stats.memory);
```

### 5. Export Configuration for Reuse

Export successful configurations for reuse:

```javascript
config.switchProfile('training-data');
config.setCacheOverride('url', { size: 30000 });
config.exportConfig('./my-training-config.json');
```

## Troubleshooting

### Configuration Not Loading

```javascript
// Check if file exists
const fs = require('fs');
const configPath = './config/caching-strategies.json';
console.log('Config exists:', fs.existsSync(configPath));

// Load with default if missing
const config = new CachingLayerConfig();
console.log('Active profile:', config.activeProfile);
```

### Profile Switch Fails

```javascript
try {
  config.switchProfile('invalid-profile');
} catch (error) {
  console.error('Profile not found:', error.message);
  // Use default
  config.switchProfile('default');
}
```

### Override Not Applied

```javascript
// Check active configuration
const activeConfig = config.getActiveProfile();
console.log('URL cache size:', activeConfig.caches.url.size);

// Verify override was applied
console.log('Custom overrides:', config.customOverrides);
```

## Command Line Usage

### Check Configuration

```bash
node -e "
  import('./services/caching-layer-config.js').then(m => {
    const config = new m.CachingLayerConfig();
    console.log('Active profile:', config.activeProfile);
    console.log('Profiles:', config.listProfiles());
  });
"
```

### Switch Profile via CLI

```bash
node -e "
  import('./services/caching-layer-config.js').then(m => {
    const config = new m.CachingLayerConfig();
    config.switchProfile('aggressive');
    config.saveConfig();
    console.log('Switched to aggressive profile');
  });
"
```

## Next Steps

- Review [ADVANCED_CACHING_SYSTEM_README.md](ADVANCED_CACHING_SYSTEM_README.md) for complete technical details
- Run `node demo-caching-layer-config.js` to see all features
- Customize `config/caching-strategies.json` for your use case
- Create custom profiles for specific workflows

## Related Documentation

- [Advanced Caching System README](ADVANCED_CACHING_SYSTEM_README.md)
- [Quick Start Guide](ADVANCED_CACHING_QUICKSTART.md)
- [Visual Architecture](ADVANCED_CACHING_VISUAL_ARCHITECTURE.md)
