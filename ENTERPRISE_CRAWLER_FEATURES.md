# Enterprise Crawler Advanced Features Guide

## Overview

This guide covers the enterprise-level advanced features integrated into the LightDom crawler system, including:

- **Rotating Proxies**: Automatic proxy rotation with health monitoring
- **robots.txt Compliance**: Automatic respect for robots.txt directives
- **Chrome DevTools Protocol (CDP)**: Deep browser instrumentation
- **3D Layers Mining**: Extract DOM 3D compositing layers
- **OCR Worker Integration**: Image text extraction with DeepSeek-OCR
- **Anti-Scraping Resilience**: Bypass detection with smart techniques
- **Performance Optimization**: Resource blocking, HTTP/2, compression

## Table of Contents

1. [Quick Start](#quick-start)
2. [Proxy Management](#proxy-management)
3. [robots.txt Compliance](#robotstxt-compliance)
4. [3D Layers Mining](#3d-layers-mining)
5. [OCR Integration](#ocr-integration)
6. [Anti-Scraping Features](#anti-scraping-features)
7. [Configuration Reference](#configuration-reference)
8. [API Reference](#api-reference)
9. [Best Practices](#best-practices)

## Quick Start

### Enable Advanced Features

```javascript
import { CrawlerCampaignService } from './services/crawler-campaign-service.js';

const campaignService = new CrawlerCampaignService({
  enableAdvancedFeatures: true,
  proxies: {
    enabled: true,
    rotation: 'smart', // round-robin, least-used, smart
  },
  robots: {
    enabled: true,
    respectCrawlDelay: true,
  },
  layers3D: {
    enabled: true,
    maxDepth: 8,
  },
  ocr: {
    enabled: true,
    compressionRatio: 0.1,
  },
});

// Initialize
await campaignService.initializeAdvancedFeatures();
```

### Test Configuration

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/test-config
```

Response:
```json
{
  "success": true,
  "data": {
    "robots": { "pass": true, "message": "Allowed" },
    "proxy": { "pass": true, "message": "proxy1.example.com:8080" },
    "layers3D": { "pass": true, "message": "Available" },
    "ocr": { "pass": true, "message": "Connected" },
    "rateLimit": { "pass": true, "message": "2 req/s" }
  }
}
```

## Proxy Management

### Overview

Rotating proxies prevent IP bans and distribute load across multiple IP addresses.

### Supported Rotation Strategies

1. **Round Robin**: Sequential rotation through proxy list
2. **Least Used**: Choose proxy with lowest usage count
3. **Smart**: Choose based on success rate and latency

### Configuration

```javascript
proxies: {
  enabled: true,
  rotation: 'smart',
  providers: [
    {
      host: 'proxy1.example.com',
      port: 8080,
      protocol: 'http',
      username: 'user',
      password: 'pass',
      country: 'US'
    }
  ],
  rotateInterval: 10, // requests per proxy
  failover: true,
  healthCheck: true,
  timeout: 10000
}
```

### Adding Proxies

**Via API:**
```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/proxies \
  -H "Content-Type: application/json" \
  -d '{
    "host": "proxy1.example.com",
    "port": 8080,
    "protocol": "http",
    "username": "user",
    "password": "pass",
    "country": "US"
  }'
```

**Programmatically:**
```javascript
const proxy = await campaignService.addProxyToCampaign(campaignId, {
  host: 'proxy1.example.com',
  port: 8080,
  protocol: 'http',
  username: 'user',
  password: 'pass',
  country: 'US',
});
```

### Proxy Statistics

```bash
curl http://localhost:3001/api/campaigns/{campaignId}/proxies/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "total": 5,
    "stats": [
      {
        "id": "proxy_123",
        "usage": 150,
        "successes": 145,
        "failures": 5,
        "successRate": 0.967,
        "avgLatency": 234,
        "lastUsed": "2025-11-18T14:30:00Z"
      }
    ]
  }
}
```

## robots.txt Compliance

### Overview

Automatic respect for `robots.txt` directives ensures ethical crawling.

### Features

- Automatic robots.txt fetching and parsing
- Caching (1 hour default)
- Crawl-delay enforcement
- User-agent specific rules
- Sitemap discovery

### Configuration

```javascript
robots: {
  enabled: true,
  cacheTime: 3600000, // 1 hour
  respectCrawlDelay: true,
  minDelay: 1000, // 1 second minimum
  maxDelay: 10000, // 10 seconds maximum
  userAgent: 'LightDomBot/1.0'
}
```

### Check robots.txt

```bash
curl http://localhost:3001/api/campaigns/{campaignId}/robots-txt
```

Response:
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "crawlDelay": 2000,
    "domain": "example.com"
  }
}
```

### robots.txt Format Support

**Standard Rules:**
```
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/
Crawl-delay: 2
Sitemap: https://example.com/sitemap.xml
```

**User-Agent Specific:**
```
User-agent: LightDomBot
Disallow: /heavy-pages/
Crawl-delay: 5

User-agent: *
Disallow: /admin/
```

## 3D Layers Mining

### Overview

Extract and analyze DOM 3D compositing layers using Chrome DevTools Protocol.

### Features

- GPU-accelerated layer detection
- Z-index and stacking context analysis
- Component-to-layer mapping
- Schema linking
- Training data generation

### Enable 3D Layers

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/3d-layers/enable \
  -H "Content-Type: application/json" \
  -d '{
    "maxDepth": 8,
    "minImportance": 0.4,
    "extractCompositing": true,
    "gpuAcceleration": "auto"
  }'
```

### Configuration

```javascript
layers3D: {
  enabled: true,
  maxDepth: 8, // Maximum DOM depth to analyze
  minImportance: 0.4, // Minimum importance score (0-1)
  extractCompositing: true, // Extract GPU layers
  gpuAcceleration: 'auto' // auto, enabled, disabled
}
```

### Output Format

```json
{
  "dom3DModel": {
    "layers": [
      {
        "id": "layer-0",
        "nodeName": "HEADER",
        "position3D": {
          "x": 0,
          "y": 0,
          "z": 1000,
          "width": 1920,
          "height": 80
        },
        "importance": 0.8,
        "isComposited": true
      }
    ],
    "bounds": { "width": 1920, "height": 3000 },
    "viewport": { "width": 1920, "height": 1080 }
  },
  "schemas": {
    "byType": {
      "Organization": [...],
      "WebPage": [...]
    }
  },
  "seoScore": 85,
  "trainingData": {...}
}
```

### Use Cases

1. **Design Analysis**: Understand visual hierarchy
2. **Performance Optimization**: Identify GPU-heavy elements
3. **SEO Training**: Generate ML training data
4. **Component Mapping**: Link UI to schemas

## OCR Integration

### Overview

Extract text from images using DeepSeek-OCR with 10-20× optical compression.

### Features

- Batch processing (200K+ pages/day)
- Configurable compression ratios
- Precision targeting
- RAG integration

### Enable OCR

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/ocr/enable \
  -H "Content-Type: application/json" \
  -d '{
    "maxImages": 4,
    "compressionRatio": 0.1,
    "minPrecision": 0.95,
    "batchSize": 20
  }'
```

### Configuration

```javascript
ocr: {
  enabled: true,
  endpoint: 'http://localhost:4205/ocr',
  maxImages: 4, // Per page
  compressionRatio: 0.1, // 10× compression
  minPrecision: 0.95, // 95% accuracy
  batchSize: 20 // Batch size for processing
}
```

### Compression Guidelines

| Use Case | Compression Ratio | Precision | Vision Tokens |
|----------|------------------|-----------|---------------|
| Legal Documents | 0.15-0.20 | 99%+ | 150-200 |
| Business Documents | 0.10-0.15 | 95%+ | 100-150 |
| Archives | 0.08-0.12 | 90%+ | 80-120 |
| Training Data | 0.05-0.08 | 60-90% | 50-80 |

### Output Format

```json
{
  "images": [
    {
      "imageUrl": "https://example.com/image.jpg",
      "text": "Extracted text content...",
      "confidence": 0.97,
      "visionTokens": 120
    }
  ],
  "text": "Combined extracted text...",
  "totalText": 1250,
  "successRate": 1.0
}
```

## Anti-Scraping Features

### User Agent Rotation

Rotates through multiple realistic user agents:

```javascript
resilience: {
  userAgentRotation: true,
  browserFingerprint: 'randomize' // randomize, fixed
}
```

### Retry with Exponential Backoff

```javascript
resilience: {
  retryAttempts: 3,
  retryDelay: 2000,
  exponentialBackoff: true,
  maxBackoff: 32000
}
```

Delay progression: 2s → 4s → 8s → 16s → 32s (max)

### Session Persistence

```javascript
resilience: {
  sessionPersistence: true,
  cookiesEnabled: true,
  javascriptEnabled: true
}
```

### CAPTCHA Solver Integration

```javascript
resilience: {
  captchaSolver: {
    provider: '2captcha', // 2captcha, anticaptcha, custom
    apiKey: 'your-api-key',
    timeout: 120000
  }
}
```

## Configuration Reference

### Complete Configuration Object

```javascript
const config = {
  // Proxy Configuration
  proxies: {
    enabled: true,
    rotation: 'smart',
    providers: [],
    rotateInterval: 10,
    failover: true,
    healthCheck: true,
    timeout: 10000
  },

  // robots.txt Compliance
  robots: {
    enabled: true,
    cacheTime: 3600000,
    respectCrawlDelay: true,
    minDelay: 1000,
    maxDelay: 10000,
    userAgent: 'LightDomBot/1.0'
  },

  // Chrome DevTools Protocol
  cdp: {
    enabled: true,
    layersPanel: true,
    performance: true,
    network: true,
    coverage: false
  },

  // 3D Layers Mining
  layers3D: {
    enabled: false,
    maxDepth: 8,
    minImportance: 0.4,
    extractCompositing: true,
    gpuAcceleration: 'auto'
  },

  // OCR Worker Integration
  ocr: {
    enabled: false,
    endpoint: 'http://localhost:4205/ocr',
    maxImages: 4,
    compressionRatio: 0.1,
    minPrecision: 0.95,
    batchSize: 20
  },

  // Anti-Scraping Resilience
  resilience: {
    retryAttempts: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
    maxBackoff: 32000,
    captchaSolver: null,
    userAgentRotation: true,
    browserFingerprint: 'randomize',
    javascriptEnabled: true,
    cookiesEnabled: true,
    sessionPersistence: false
  },

  // Performance Optimization
  performance: {
    concurrency: 5,
    requestTimeout: 30000,
    resourceBlocking: ['image', 'stylesheet', 'font'],
    caching: true,
    compression: true,
    http2: true,
    keepAlive: true,
    dns: {
      cache: true,
      prefetch: false,
      timeout: 5000
    }
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    requestsPerSecond: 2,
    burstSize: 10,
    perDomain: true,
    adaptive: false
  }
};
```

## API Reference

### Advanced Features Endpoints

```
POST   /api/campaigns/:campaignId/proxies
GET    /api/campaigns/:campaignId/proxies/stats
POST   /api/campaigns/:campaignId/3d-layers/enable
POST   /api/campaigns/:campaignId/ocr/enable
GET    /api/campaigns/:campaignId/robots-txt
POST   /api/campaigns/:campaignId/test-config
POST   /api/campaigns/:campaignId/crawl-advanced
GET    /api/campaigns/advanced/status
```

### Crawl with Advanced Features

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/crawl-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "extractImages": true,
      "extract3DLayers": true,
      "useProxy": true
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "timestamp": "2025-11-18T14:30:00Z",
    "success": true,
    "data": {
      "layers3D": {...},
      "ocr": {...}
    },
    "metadata": {
      "proxy": "proxy1.example.com:8080",
      "userAgent": "Mozilla/5.0...",
      "duration": 2340,
      "has3DLayers": true,
      "hasOCR": true
    },
    "errors": []
  }
}
```

## Best Practices

### 1. Proxy Management

✅ **DO:**
- Use smart rotation for best performance
- Monitor proxy statistics
- Remove failing proxies
- Use geographic distribution
- Test proxies before adding to pool

❌ **DON'T:**
- Use free proxies in production
- Ignore proxy health checks
- Over-rotate (causes connection overhead)
- Mix residential and datacenter proxies

### 2. robots.txt Compliance

✅ **DO:**
- Always enable robots.txt checking
- Respect crawl-delay directives
- Cache robots.txt files
- Use appropriate user-agent
- Handle missing robots.txt gracefully

❌ **DON'T:**
- Disable robots.txt in production
- Ignore crawl-delay
- Use misleading user-agents
- Crawl disallowed paths

### 3. Rate Limiting

✅ **DO:**
- Enable per-domain rate limiting
- Start conservative (1-2 req/s)
- Monitor server response times
- Implement adaptive rate limiting
- Add random jitter to requests

❌ **DON'T:**
- Disable rate limiting
- Use same rate for all domains
- Ignore 429 (Too Many Requests) responses
- Burst requests without limits

### 4. 3D Layers Mining

✅ **DO:**
- Use for training data generation
- Cache layer data
- Set appropriate depth limits
- Filter by importance score
- Use GPU acceleration when available

❌ **DON'T:**
- Enable for all pages (resource intensive)
- Extract all layers (filter by importance)
- Ignore performance impact

### 5. OCR Integration

✅ **DO:**
- Batch process images
- Use appropriate compression ratios
- Set precision targets
- Limit images per page
- Cache OCR results

❌ **DON'T:**
- Process all images
- Use highest precision unnecessarily
- Ignore OCR endpoint health
- Process duplicate images

## Troubleshooting

### Proxy Issues

**Problem**: High proxy failure rate

**Solutions**:
1. Check proxy provider status
2. Verify authentication credentials
3. Test proxies individually
4. Reduce rotation frequency
5. Use proxy health checks

### robots.txt Issues

**Problem**: URLs being blocked

**Solutions**:
1. Check robots.txt manually
2. Verify user-agent configuration
3. Check for typos in user-agent
4. Ensure proper pattern matching
5. Check cache expiration

### 3D Layers Issues

**Problem**: Service not initializing

**Solutions**:
1. Verify Chrome/Chromium installed
2. Check CDP port availability
3. Ensure sufficient memory
4. Check GPU availability
5. Review error logs

### OCR Issues

**Problem**: OCR endpoint not responding

**Solutions**:
1. Verify OCR worker running
2. Check endpoint URL
3. Test endpoint health
4. Review batch size
5. Check image formats

## Monitoring

### Key Metrics

1. **Proxy Performance**
   - Success rate per proxy
   - Average latency
   - Failure patterns
   - Geographic distribution

2. **Crawl Health**
   - robots.txt compliance rate
   - Rate limit violations
   - Retry frequency
   - Error rates

3. **Feature Usage**
   - 3D layers extraction rate
   - OCR success rate
   - Advanced crawl usage
   - Configuration test results

### Logging

Enable detailed logging:

```javascript
const campaignService = new CrawlerCampaignService({
  enableAdvancedFeatures: true,
  logging: {
    level: 'debug', // error, warn, info, debug
    proxy: true,
    robots: true,
    ocr: true,
    layers3D: true
  }
});
```

## Support

For issues or questions:
- GitHub Issues: github.com/DashZeroAlionSystems/LightDom/issues
- Documentation: See CRAWLER_SYSTEM_README.md
- API Reference: See CRAWLER_API_ENDPOINTS.md

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-18  
**Status**: Production Ready
