# Caching Layer Configuration - Quick Reference

## Configuration File Location

```
config/caching-strategies.json
```

## Quick Start

```javascript
import { CachingLayerConfig } from './services/caching-layer-config.js';
import { CacheAwareCrawler } from './services/cache-aware-crawler.js';

// Load config
const config = new CachingLayerConfig();

// Use with crawler
const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();
```

## Profile Comparison

| Profile | URLs | TTL | Strategy | Best For |
|---------|------|-----|----------|----------|
| **default** | 10K | 24h | stale-while-revalidate | General purpose |
| **aggressive** | 50K | 7d | cache-first | High-frequency crawls |
| **minimal** | 1K | 1h | network-first | Fresh data |
| **training-data** | 25K | 2d | stale-while-revalidate | ML datasets |
| **offline-mining** | 5K | 24h | cache-first | PWA detection |

## Switch Profiles

```javascript
config.switchProfile('aggressive');    // Max performance
config.switchProfile('minimal');       // Fresh data
config.switchProfile('training-data'); // ML collection
config.switchProfile('offline-mining');// PWA mining
config.switchProfile('default');       // Balanced
```

## Apply Custom Overrides

```javascript
// Override cache settings
config.setCacheOverride('url', { 
  size: 30000, 
  ttl: 172800000 // 2 days
});

// Enable/disable features
config.setFeatureOverride('enableOCR', true);
config.setFeatureOverride('enableScreenshots', true);

// Reset all overrides
config.resetOverrides();
```

## URL-Specific Strategies

```javascript
// Get strategy for URL
const strategy = config.getUrlStrategy('https://api.example.com/data');
console.log(strategy.strategy); // 'network-first'
console.log(strategy.ttl);      // 60000

// Defined patterns:
// - API endpoints    → network-first (1 min)
// - Static assets    → cache-first (30 days)
// - HTML pages       → stale-while-revalidate (1 day)
```

## NPM Commands

```bash
npm run cache:config     # Run configuration demo (7 demos)
npm run cache:profiles   # List all available profiles
npm run cache:demo       # Run main caching system demo
npm run cache:stats      # View cache statistics
npm run cache:cleanup    # Clean expired cache entries
```

## Configuration Helpers

```javascript
// List profiles
const profiles = config.listProfiles();

// Get active profile
const active = config.getActiveProfile();

// Get cache size
const urlSize = config.getCacheSize('url');

// Get TTL
const urlTTL = config.getCacheTTL('url');

// Check if enabled
const enabled = config.isCacheEnabled('screenshot');

// Get full config
const fullConfig = config.getFullConfig();

// Export config
const path = config.exportConfig();

// Save changes
config.saveConfig();
```

## Events

```javascript
config.on('profile-switched', ({ profile }) => {
  console.log('Switched to:', profile);
});

config.on('cache-override', ({ cacheName, options }) => {
  console.log('Override applied:', cacheName);
});

config.on('config-reloaded', ({ profile }) => {
  console.log('Config reloaded');
});
```

## Profile Management

```javascript
// Create new profile
config.createProfile('my-profile', {
  name: 'My Custom Profile',
  strategy: 'cache-first',
  caches: {
    url: { size: 15000, ttl: 86400000 }
  }
});

// Update profile
config.updateProfile('my-profile', {
  caches: { url: { size: 20000 } }
});

// Delete profile
config.deleteProfile('my-profile');
```

## Integration Examples

### Example 1: Balanced Crawling

```javascript
const config = new CachingLayerConfig(); // Uses default profile
const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();

const result = await crawler.crawl('https://example.com');
```

### Example 2: Training Data Collection

```javascript
const config = new CachingLayerConfig();
config.switchProfile('training-data'); // Enables deduplication

const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();

for (const url of sites) {
  const result = await crawler.collectTrainingData(url, {
    labels: { category: 'blog' },
    qualityScore: 0.9
  });
}
```

### Example 3: Aggressive Caching

```javascript
const config = new CachingLayerConfig();
config.switchProfile('aggressive'); // 50K URLs, 7d TTL

const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();

// Very fast repeated crawls
const result = await crawler.crawl(url);
```

### Example 4: Custom Configuration

```javascript
const config = new CachingLayerConfig();

// Start with default
config.switchProfile('default');

// Apply custom tweaks
config.setCacheOverride('url', { size: 30000 });
config.setCacheOverride('screenshot', { enabled: true, size: 5000 });
config.setFeatureOverride('enableOCR', true);

const crawler = new CacheAwareCrawler({ cachingConfig: config });
await crawler.initialize();
```

## Cache Strategies

| Strategy | Priority | Fallback | Update Cache | Best For |
|----------|----------|----------|--------------|----------|
| cache-first | Cache | Network | Yes | Static assets |
| network-first | Network | Cache | Yes | API endpoints |
| stale-while-revalidate | Cache | Network | Background | Balanced |
| cache-only | Cache | None | No | Offline only |
| network-only | Network | None | No | No caching |

## Configuration Structure

```
caching-strategies.json
├── version
├── profiles
│   ├── default
│   ├── aggressive
│   ├── minimal
│   ├── training-data
│   └── offline-mining
├── strategies
│   ├── cache-first
│   ├── network-first
│   ├── stale-while-revalidate
│   ├── cache-only
│   └── network-only
├── database
│   ├── enabled
│   └── tables (8)
├── serviceWorker
│   ├── enabled
│   ├── cacheNames (4)
│   └── indexedDB (5 stores)
├── features
│   ├── enableOfflineMining
│   ├── enableVisualDiffTracking
│   ├── enableNetworkMonitoring
│   └── compressionEnabled
└── customStrategies
    └── url-patterns
        ├── api-endpoints
        ├── static-assets
        └── html-pages
```

## Troubleshooting

**Config not loading?**
```javascript
// Check if file exists
const fs = require('fs');
console.log(fs.existsSync('./config/caching-strategies.json'));

// Load with defaults if missing
const config = new CachingLayerConfig();
```

**Profile not found?**
```javascript
try {
  config.switchProfile('my-profile');
} catch (error) {
  console.log('Profile not found, using default');
  config.switchProfile('default');
}
```

**Override not working?**
```javascript
// Check active config
const active = config.getActiveProfile();
console.log('URL cache size:', active.caches.url.size);

// Verify overrides
console.log('Overrides:', config.customOverrides);
```

## Complete Documentation

- **Full Guide**: `CACHING_LAYER_CONFIGURATION_GUIDE.md`
- **System README**: `ADVANCED_CACHING_SYSTEM_README.md`
- **Quick Start**: `ADVANCED_CACHING_QUICKSTART.md`
- **Visual Architecture**: `ADVANCED_CACHING_VISUAL_ARCHITECTURE.md`

## Run Demos

```bash
# Configuration demo (7 demos)
node demo-caching-layer-config.js

# Main caching system demo
node demo-advanced-caching-system.js
```

---

**Quick Links**:
- Configuration file: `config/caching-strategies.json`
- Service: `services/caching-layer-config.js`
- Demo: `demo-caching-layer-config.js`
