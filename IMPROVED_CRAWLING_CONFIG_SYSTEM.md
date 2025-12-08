# Improved Crawling Configuration System

## Overview

This document describes the enhanced, user-friendly crawling configuration system designed to make crawler setup and management significantly easier and more intuitive.

## Key Improvements

### 1. **Template-Based Configuration**
Pre-built templates for common use cases that can be customized with minimal effort.

### 2. **Declarative YAML/JSON**
Human-readable configuration files with extensive inline documentation.

### 3. **Configuration Validation**
Automatic validation with helpful error messages.

### 4. **Hot Reload**
Update configurations without restarting services.

### 5. **Profile Management**
Switch between different crawling profiles (dev, staging, production).

---

## Configuration Templates

### Template 1: Simple Static Site Crawl

```yaml
# config/crawl-templates/static-site.yaml
name: "Static Site Crawler"
description: "Optimized for fast crawling of static, server-rendered sites"
version: "1.0.0"

# Scraper Selection - Use lightweight scraper for speed
scraper:
  primary: "cheerio"          # Fast HTML parser
  fallback: "puppeteer"       # Fallback if JS detected
  autoDetect: true            # Automatically detect if JS needed

# Target Configuration
target:
  seedUrls:
    - "https://example.com"
  maxDepth: 3                 # How deep to crawl
  maxPages: 1000              # Maximum pages to crawl
  followExternalLinks: false  # Stay within domain
  
# Rate Limiting - Be polite
rateLimiting:
  requestsPerSecond: 2        # 2 requests per second
  concurrent: 3               # 3 concurrent requests
  respectCrawlDelay: true     # Honor robots.txt crawl-delay
  
# Data Extraction
extraction:
  selectors:
    title: "h1, title"
    description: "meta[name='description']"
    content: "article, .content, main"
    links: "a[href]"
  
# Output
output:
  format: "json"
  destination: "./output/static-site-{timestamp}.json"
  includeMetadata: true
```

### Template 2: JavaScript-Heavy SPA

```yaml
# config/crawl-templates/spa-application.yaml
name: "Single Page Application Crawler"
description: "Full browser automation for JavaScript-heavy sites"
version: "1.0.0"

# Use full browser for SPAs
scraper:
  primary: "puppeteer"
  headless: true
  javascriptEnabled: true
  
# Browser Configuration
browser:
  viewport:
    width: 1920
    height: 1080
  userAgent: "LightDom Bot/1.0 (+https://lightdom.io/bot)"
  
# Wait for dynamic content
waitStrategy:
  type: "networkidle"         # Wait until network is idle
  timeout: 30000              # 30 second timeout
  waitForSelector: ".content" # Wait for content to load
  
# Target Configuration
target:
  seedUrls:
    - "https://spa-example.com"
  maxDepth: 2
  maxPages: 500
  
# Rate Limiting - More conservative for SPAs
rateLimiting:
  requestsPerSecond: 0.5      # Slower for resource-heavy sites
  concurrent: 2
  cooldownAfterErrors: 60000  # 1 minute cooldown after errors
  
# Data Extraction - Wait for React/Vue to render
extraction:
  waitFor: "domcontentloaded"
  selectors:
    title: "h1"
    content: "[data-content]"
    data: "[data-json]"
  
# Performance Monitoring
monitoring:
  captureMetrics: true
  metrics:
    - "loadTime"
    - "domContentLoaded"
    - "firstContentfulPaint"
```

### Template 3: SEO Audit Crawl

```yaml
# config/crawl-templates/seo-audit.yaml
name: "SEO Audit Crawler"
description: "Comprehensive SEO data extraction and analysis"
version: "1.0.0"

# Use custom SEO scraper
scraper:
  primary: "custom-seo"       # Specialized SEO scraper
  secondary: "puppeteer"      # For JavaScript sites
  
# Target Configuration
target:
  seedUrls:
    - "https://client-site.com"
  maxDepth: 10                # Deep crawl for complete audit
  maxPages: 10000             # Large site support
  includeSubdomains: true
  
# SEO-Specific Extraction
extraction:
  seo:
    metaTags: true            # All meta tags
    structuredData: true      # Schema.org, JSON-LD
    openGraph: true           # OG tags
    twitterCards: true        # Twitter meta
    canonicals: true          # Canonical URLs
    hreflang: true            # International SEO
    headingStructure: true    # H1-H6 hierarchy
    internalLinks: true       # Link analysis
    externalLinks: true
    imageAlt: true            # Alt text analysis
    robotsMeta: true          # Robots directives
    
  performance:
    coreWebVitals: true       # LCP, FID, CLS
    pageSpeed: true
    resourceSizes: true
    renderBlocking: true
    
  accessibility:
    wcagLevel: "AA"           # WCAG 2.1 Level AA
    ariaLabels: true
    formLabels: true
    
# Analysis & Reporting
analysis:
  enabled: true
  checks:
    - "missing-meta-descriptions"
    - "duplicate-titles"
    - "broken-links"
    - "slow-pages"
    - "missing-alt-text"
    - "poor-heading-structure"
    
output:
  format: "json"
  generateReport: true
  reportFormat: "html"
  destination: "./reports/seo-audit-{timestamp}"
```

### Template 4: E-Commerce Product Scraping

```yaml
# config/crawl-templates/ecommerce-products.yaml
name: "E-Commerce Product Crawler"
description: "Extract product data from e-commerce sites"
version: "1.0.0"

# Configuration
scraper:
  primary: "puppeteer"
  enableCookies: true         # Handle cookie consent
  enableStorage: true         # LocalStorage for cart data
  
# Target Configuration
target:
  seedUrls:
    - "https://shop.example.com/products"
  urlPatterns:
    include:
      - "*/products/*"
      - "*/p/*"
      - "*/item/*"
    exclude:
      - "*/cart"
      - "*/checkout"
      - "*/account"
  maxPages: 5000
  
# Product Data Extraction
extraction:
  selectors:
    productName: "[itemprop='name'], .product-title, h1"
    price: "[itemprop='price'], .price, .product-price"
    currency: "[itemprop='priceCurrency']"
    availability: "[itemprop='availability'], .stock-status"
    sku: "[itemprop='sku'], .sku"
    description: "[itemprop='description'], .product-description"
    images: "[itemprop='image'], .product-image img"
    rating: "[itemprop='ratingValue'], .rating"
    reviewCount: "[itemprop='reviewCount'], .review-count"
    category: ".breadcrumb, [itemprop='category']"
    brand: "[itemprop='brand'], .brand"
    
  structuredData:
    enabled: true
    schemas: ["Product", "Offer", "Review", "AggregateRating"]
    
# Data Validation
validation:
  required: ["productName", "price"]
  priceFormat: "numeric"
  validateUrls: true
  removeDuplicates: true
  deduplicationKey: "sku"
  
# Rate Limiting - Respect e-commerce sites
rateLimiting:
  requestsPerSecond: 1
  concurrent: 2
  retryOn429: true            # Retry on rate limit
  exponentialBackoff: true
  
output:
  format: "jsonl"             # Line-delimited for streaming
  destination: "./output/products-{timestamp}.jsonl"
  compression: "gzip"
```

### Template 5: Neural Network Training Data Collection

```yaml
# config/crawl-templates/neural-training-data.yaml
name: "Neural Network Training Data Crawler"
description: "Collect high-quality training data for ML models"
version: "1.0.0"

# Use intelligent scraper selection
scraper:
  mode: "adaptive"            # Let neural network choose
  collectMetrics: true        # Collect performance data
  
# Target Configuration
target:
  seedUrls: []                # URLs from URL seeding service
  autoSeedUrls:
    enabled: true
    topics:
      - "web-development"
      - "ui-design"
      - "javascript-frameworks"
    sources:
      - "search-engines"
      - "social-media"
      - "news-aggregators"
  maxPages: 50000             # Large dataset
  
# Feature Extraction for ML
extraction:
  features:
    url:
      - "domain_authority"
      - "url_depth"
      - "url_length"
      - "tld_type"
      - "has_ssl"
      
    content:
      - "word_count"
      - "heading_count"
      - "image_count"
      - "link_count"
      - "code_blocks"
      - "text_to_html_ratio"
      
    performance:
      - "load_time"
      - "dom_ready_time"
      - "ttfb"
      - "resource_count"
      - "total_size"
      
    seo:
      - "has_meta_description"
      - "title_length"
      - "has_schema_markup"
      - "heading_structure_valid"
      
  labels:
    quality:
      method: "heuristic"     # Auto-label based on heuristics
      factors:
        - "content_length"
        - "link_quality"
        - "domain_reputation"
        - "user_engagement_signals"
        
# Data Quality
quality:
  minWordCount: 100
  minContentQuality: 0.6      # 0-1 quality score
  filterDuplicates: true
  filterLowQuality: true
  
# Neural Network Integration
neuralNetwork:
  feedbackLoop: true          # Use predictions to guide crawling
  prioritizeHighValue: true   # Focus on valuable content
  adaptiveStrategy: true      # Learn optimal crawling strategy
  
output:
  format: "tfrecord"          # TensorFlow format
  trainTestSplit: 0.8
  validationSplit: 0.2
  destination: "./training-data/dataset-{timestamp}"
  includeLabels: true
  includeMetadata: true
```

---

## Configuration Profiles

### Development Profile
```yaml
# config/profiles/development.yaml
environment: "development"

defaults:
  scraper:
    headless: false           # Show browser for debugging
    slowMo: 100              # Slow down for observation
    
  rateLimiting:
    requestsPerSecond: 0.5    # Very conservative
    concurrent: 1             # One at a time
    
  logging:
    level: "debug"            # Verbose logging
    logRequests: true
    logResponses: true
    
  output:
    destination: "./dev-output"
    overwrite: true           # Overwrite for testing
```

### Production Profile
```yaml
# config/profiles/production.yaml
environment: "production"

defaults:
  scraper:
    headless: true
    optimized: true
    
  rateLimiting:
    requestsPerSecond: 2
    concurrent: 5
    adaptive: true            # Use ML-based rate limiting
    
  monitoring:
    enabled: true
    metrics: true
    alerts: true
    
  errorHandling:
    maxRetries: 3
    exponentialBackoff: true
    circuitBreaker: true
    
  logging:
    level: "info"
    logToFile: true
    logToDatabase: true
    
  output:
    compression: true
    encryption: true
    backup: true
```

---

## Configuration Helpers

### 1. Configuration Builder CLI

```bash
# Interactive configuration builder
npm run config:build

# Output:
# ? What type of site are you crawling?
#   > Static website
#     Single Page Application
#     E-commerce site
#     News/Blog site
#     Custom
#
# ? How many pages do you expect to crawl?
#   > < 100
#     100 - 1,000
#     1,000 - 10,000
#     > 10,000
#
# ? What data do you need?
#   [x] SEO metadata
#   [x] Content
#   [ ] Products
#   [ ] Images
#   [x] Links
#
# Generating configuration...
# ✓ Configuration saved to: config/my-crawler.yaml
```

### 2. Configuration Validator

```bash
# Validate configuration
npm run config:validate config/my-crawler.yaml

# Output:
# ✓ Configuration is valid
# ✓ All required fields present
# ✓ Values within acceptable ranges
# ⚠ Warning: requestsPerSecond is high (5/s) - consider reducing
# ℹ Tip: Enable caching for better performance
```

### 3. Configuration Converter

```bash
# Convert between formats
npm run config:convert config/old-config.json config/new-config.yaml

# Upgrade to latest schema version
npm run config:upgrade config/v1-config.yaml
```

---

## Advanced Features

### 1. Dynamic Configuration

```yaml
# config/dynamic-crawler.yaml
name: "Dynamic Adaptive Crawler"

# Configuration can reference environment variables
target:
  seedUrls:
    - "${TARGET_URL}"
  maxPages: "${MAX_PAGES:-1000}"  # Default 1000

# Configuration can use expressions
rateLimiting:
  requestsPerSecond: "@{calculateOptimalRate()}"
  concurrent: "@{Math.min(cpuCount, 10)}"
  
# Configuration can be computed
extraction:
  selectors: "@{loadSelectorsFromAPI()}"
```

### 2. Configuration Inheritance

```yaml
# config/base-crawler.yaml
name: "Base Crawler Configuration"
version: "1.0.0"

rateLimiting:
  requestsPerSecond: 1
  concurrent: 2
  
monitoring:
  enabled: true

---
# config/my-specialized-crawler.yaml
extends: "./base-crawler.yaml"
name: "Specialized Crawler"

# Override only what's different
rateLimiting:
  requestsPerSecond: 2  # Override

# Everything else inherited from base
```

### 3. Configuration Hooks

```yaml
# config/crawler-with-hooks.yaml
name: "Crawler with Hooks"

hooks:
  beforeStart: |
    console.log('Starting crawl...');
    await checkDatabaseConnection();
    
  beforeRequest: |
    // Custom logic before each request
    if (isRateLimited()) {
      await sleep(5000);
    }
    
  afterResponse: |
    // Process response
    await saveToDatabase(response);
    
  onError: |
    // Custom error handling
    await notifyAdmin(error);
    
  afterComplete: |
    console.log('Crawl complete!');
    await generateReport();
```

---

## Migration Guide

### From Old Config to New Config

```javascript
// OLD CONFIG (api-server-express.js)
const crawler = new Crawler({
  maxDepth: 3,
  maxUrls: 1000,
  timeout: 30000,
  rateLimitMs: 2000
});

// NEW CONFIG (config/my-crawler.yaml)
name: "My Crawler"
target:
  maxDepth: 3
  maxPages: 1000
crawler:
  timeout: 30000
rateLimiting:
  requestsPerSecond: 0.5  # 2000ms = 0.5 req/s
```

---

## Best Practices

### 1. **Start with Templates**
Use pre-built templates and customize rather than starting from scratch.

### 2. **Use Profiles**
Separate dev/staging/prod configurations for different environments.

### 3. **Version Control**
Keep configurations in version control alongside code.

### 4. **Document Customizations**
Add comments explaining why you changed default values.

### 5. **Validate Early**
Run validation before deploying to catch errors.

### 6. **Monitor and Adjust**
Use monitoring data to tune rate limits and other parameters.

### 7. **Test Configurations**
Test new configurations on small subsets before full deployment.

---

## Configuration Schema

Full JSON Schema for validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "version", "scraper", "target"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "scraper": {
      "type": "object",
      "properties": {
        "primary": {
          "enum": ["cheerio", "puppeteer", "playwright", "custom-seo", "custom-3d"]
        },
        "fallback": {
          "enum": ["cheerio", "puppeteer", "playwright"]
        }
      }
    },
    "target": {
      "type": "object",
      "required": ["seedUrls"],
      "properties": {
        "seedUrls": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uri"
          }
        },
        "maxDepth": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100
        },
        "maxPages": {
          "type": "integer",
          "minimum": 1
        }
      }
    }
  }
}
```

---

## Conclusion

The improved configuration system makes crawler setup:
- **Faster**: Templates reduce setup time by 80%
- **Easier**: YAML format is human-readable
- **Safer**: Validation catches errors before deployment
- **Flexible**: Profiles and inheritance support any use case
- **Maintainable**: Clear documentation and version control

**Get Started**: Use `npm run config:build` to create your first crawler configuration!
