# Web Crawler Research & Best Practices

## Overview

This document provides in-depth research on web crawling technology, best practices, and advanced techniques used in the LightDom Background Data Mining System.

## Table of Contents

1. [Crawler Architecture](#crawler-architecture)
2. [Advanced Techniques](#advanced-techniques)
3. [Ethical Considerations](#ethical-considerations)
4. [Performance Optimization](#performance-optimization)
5. [AI Integration](#ai-integration)
6. [Future Directions](#future-directions)

## Crawler Architecture

### Core Components

#### 1. **Browser Automation (Puppeteer)**

**Why Puppeteer?**
- Full Chrome/Chromium browser with JavaScript execution
- Handles Single Page Applications (SPAs)
- Renders dynamic content
- Can simulate user interactions
- Screenshot and PDF generation capabilities

**Alternatives Considered:**
- **Cheerio**: Faster but no JavaScript execution
- **Playwright**: Similar to Puppeteer but multi-browser
- **Selenium**: Older, slower, more complex setup

**Our Implementation:**
```javascript
const browser = await puppeteer.launch({
  headless: true,  // No UI needed
  args: [
    '--no-sandbox',  // Required for Docker/containers
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',  // Overcome limited shared memory
    '--disable-gpu'  // No GPU needed for crawling
  ]
});
```

#### 2. **Multi-Worker Architecture**

**Pattern**: Worker Pool Pattern
- Fixed number of worker threads
- Tasks assigned from centralized queue
- Each worker independent, fails isolated
- Configurable worker count based on system resources

**Benefits:**
- Parallel processing = faster crawling
- Fault tolerance (one worker crash doesn't stop others)
- Rate limiting enforced across all workers
- Resource management (limit concurrent browsers)

**Implementation:**
```javascript
for (let i = 0; i < workerCount; i++) {
  this.startWorker(i);
}
```

#### 3. **Priority-Based Task Queue**

**Algorithm**: Priority Queue with FIFO within priority levels

**Priority Factors:**
1. Attribute priority (user-defined 1-10)
2. URL freshness (older URLs get higher priority)
3. Error count (fewer errors = higher priority)

**Benefits:**
- Important data extracted first
- Efficient use of crawl budget
- Better user experience (see results faster)

### Data Flow

```
Seed URLs → URL Queue → Workers → Puppeteer → Page → Extract → Validate → Store → DB
                ↑                                                            ↓
                └──────────────── Discovered Links ────────────────────────┘
```

## Advanced Techniques

### 1. **Smart Deduplication**

**Challenge**: Don't waste resources crawling the same URL repeatedly

**Solution**: Multi-level caching
```
Level 1: In-memory cache (Map) for session
Level 2: Database persistence for long-term
Level 3: Schema version tracking for re-mining triggers
```

**Re-mining Logic:**
```javascript
shouldReMine(url, attribute) {
  if (!cached) return true;  // Not cached = mine
  if (!cached.attributes[attr.name]) return true;  // Attribute missing = mine
  if (age > TTL) return true;  // Stale data = mine
  if (schemaChanged) return true;  // Definition changed = mine
  return false;  // Fresh data = skip
}
```

### 2. **Attribute-Based Extraction**

**Concept**: Break down complex pages into discrete, focused extraction tasks

**Traditional Approach:**
```javascript
// Extract everything at once
const data = {
  title: extractTitle(),
  price: extractPrice(),
  description: extractDescription(),
  // ... 20 more fields
};
```

**Our Approach:**
```javascript
// One task per attribute
Task 1: Extract only 'title' from URL
Task 2: Extract only 'price' from URL
Task 3: Extract only 'description' from URL
```

**Benefits:**
- Partial success (some attributes extracted even if others fail)
- Selective re-crawling (only missing attributes)
- Priority-based extraction (important fields first)
- Better error isolation
- Easier debugging

### 3. **Robust Selector Strategies**

**Problem**: Sites change, selectors break

**Solution**: Fallback chains
```javascript
const selectors = [
  'h1.main-title',          // Specific
  'h1.title',               // Less specific
  'article h1',             // Contextual
  'h1',                     // Generic
  '[role="heading"][aria-level="1"]'  // Accessibility-based
];

for (const selector of selectors) {
  const result = await page.$(selector);
  if (result) return result;
}
```

**Best Practices:**
1. Start specific, fall back to generic
2. Use stable attributes (data-*, role, aria-*)
3. Combine CSS with XPath for complex cases
4. Test selectors on multiple pages
5. Document selector rationale in schema

### 4. **Intelligent Link Discovery**

**Strategies:**

**1. Sitemap Parsing**
```javascript
// Fetch and parse XML sitemap
const response = await fetch('https://site.com/sitemap.xml');
const xml = await response.text();
const urls = extractUrlsFromSitemap(xml);
```

**2. Link Extraction with Filtering**
```javascript
// Extract links with smart filtering
const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.href)
    .filter(href => {
      const url = new URL(href);
      // Same domain only
      if (url.hostname !== window.location.hostname) return false;
      // No anchors
      if (url.hash) return false;
      // No query strings (optional)
      if (url.search) return false;
      return true;
    });
});
```

**3. Depth-Limited Crawling**
```javascript
// BFS with depth tracking
const queue = seedUrls.map(url => ({ url, depth: 0 }));
while (queue.length > 0) {
  const { url, depth } = queue.shift();
  if (depth > maxDepth) continue;
  
  const links = await crawl(url);
  links.forEach(link => {
    queue.push({ url: link, depth: depth + 1 });
  });
}
```

## Ethical Considerations

### robots.txt Compliance

**Always respect robots.txt**
```javascript
async fetchRobotsTxt(domain) {
  const response = await fetch(`https://${domain}/robots.txt`);
  const txt = await response.text();
  return parseRobotsTxt(txt);
}

async canCrawl(url) {
  const robotsTxt = await this.fetchRobotsTxt(url.hostname);
  return robotsTxt.isAllowed(this.userAgent, url.pathname);
}
```

### Rate Limiting

**Be a good citizen**
```javascript
// Delay between requests
await sleep(rateLimitMs);

// Respect Crawl-Delay directive
const crawlDelay = robotsTxt.getCrawlDelay(userAgent);
await sleep(crawlDelay * 1000);
```

**Best Practices:**
- 1-2 seconds between requests minimum
- Longer delays for small/personal sites
- Shorter for large sites with explicit permission
- Exponential backoff on errors
- Respect 429 (Too Many Requests) responses

### User-Agent Identification

**Be transparent**
```javascript
const userAgent = 'LightDomMiningBot/1.0 (+https://lightdom.example.com/bot)';
```

**Include:**
- Bot name
- Version
- Contact URL with bot info
- Opt-out instructions

### Data Privacy

**Considerations:**
- Don't crawl private/authenticated content
- Respect user privacy (no personal data without consent)
- Comply with GDPR, CCPA, etc.
- Provide opt-out mechanism
- Secure storage of mined data
- Regular data purging

## Performance Optimization

### 1. **Connection Pooling**

```javascript
// Reuse browser contexts
const context = await browser.createIncognitoBrowserContext();
const page = await context.newPage();

// Reuse database connections
const pool = new Pool({ max: 20 });
```

### 2. **Request Filtering**

**Block unnecessary resources**
```javascript
await page.setRequestInterception(true);
page.on('request', req => {
  const resourceType = req.resourceType();
  if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
    req.abort();  // Don't need for data extraction
  } else {
    req.continue();
  }
});
```

**Benefits:**
- 50-70% faster page loads
- Lower bandwidth usage
- Reduced memory consumption

### 3. **Caching Strategies**

**Multi-level cache:**
```javascript
// L1: In-memory (milliseconds)
const memCache = new Map();

// L2: Redis (microseconds)
const redis = new Redis();

// L3: Database (slower but persistent)
const db = new Pool();

async function getCached(key) {
  let value = memCache.get(key);
  if (value) return value;
  
  value = await redis.get(key);
  if (value) {
    memCache.set(key, value);
    return value;
  }
  
  value = await db.query('SELECT * FROM cache WHERE key = $1', [key]);
  if (value) {
    await redis.set(key, value, 'EX', 3600);
    memCache.set(key, value);
    return value;
  }
  
  return null;
}
```

### 4. **Batch Processing**

**Batch database writes**
```javascript
const batch = [];
for (const result of results) {
  batch.push(result);
  
  if (batch.length >= 100) {
    await saveBatch(batch);
    batch.length = 0;
  }
}
if (batch.length > 0) {
  await saveBatch(batch);
}
```

## AI Integration

### 1. **Config Generation with LLMs**

**Prompt Engineering Principles:**

**1. Clear System Role**
```
You are an expert web scraping configuration generator.
Your task is to analyze requests and generate precise crawler configs.
```

**2. Structured Output Format**
```
Output must be valid JSON following this schema: {...}
```

**3. Domain Expertise**
```
Include web scraping best practices:
- CSS selectors
- Data validation
- Rate limiting
- URL patterns
```

**4. Examples**
```
Example 1: Blog posts → config
Example 2: E-commerce → config
```

### 2. **Model Selection**

**DeepSeek-R1** (Recommended)
- Pros: Excellent reasoning, best for complex extraction
- Cons: Slower, more resource-intensive
- Use for: Complex sites, custom logic

**Llama3**
- Pros: Fast, accurate, good general purpose
- Cons: Less reasoning capability
- Use for: Standard extraction, simple sites

**Mixtral**
- Pros: Very high quality, detailed outputs
- Cons: Slowest, highest resource usage
- Use for: Production configs, critical applications

### 3. **Fallback Strategies**

**When AI fails:**
1. Parse prompt for keywords
2. Match to template library
3. Generate basic config
4. User refines manually

```javascript
async generateConfig(prompt) {
  try {
    return await this.callAI(prompt);
  } catch (aiError) {
    console.warn('AI failed, using fallback');
    return this.generateFallbackConfig(prompt);
  }
}
```

## Future Directions

### 1. **Distributed Crawling**

**Architecture:**
```
Coordinator → Task Queue (Redis)
                ↓
    Worker 1, Worker 2, Worker 3... Worker N
                ↓
        Results Storage (S3/Database)
```

**Benefits:**
- Scale horizontally
- Faster for large jobs
- Fault tolerance
- Geographic distribution

### 2. **Machine Learning Enhancements**

**Selector Prediction**
- Train model on HTML + label pairs
- Predict selectors for new sites
- Reduce manual configuration

**Content Classification**
- Automatically categorize extracted content
- Filter noise/ads
- Improve data quality

**Anomaly Detection**
- Detect site structure changes
- Alert on extraction failures
- Auto-adjust selectors

### 3. **Real-time Processing**

**Stream Processing:**
```
Crawler → Kafka → Stream Processor → Real-time DB → Dashboard
```

**Use cases:**
- Live news monitoring
- Price tracking
- Social media analysis
- SEO monitoring

### 4. **Advanced JavaScript Handling**

**Techniques:**
- Wait for network idle
- Detect and wait for lazy loading
- Handle infinite scroll
- Execute custom JavaScript
- Mock APIs for testing

```javascript
// Wait for dynamic content
await page.waitForSelector('.dynamic-content');
await page.waitForFunction(() => window.dataLoaded === true);

// Handle infinite scroll
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(2000);
```

### 5. **Visual ML Integration**

**Computer Vision for Extraction:**
- OCR for image-based content
- Layout analysis
- Visual element detection
- Screenshot comparison for change detection

**Tools:**
- Tesseract (OCR)
- TensorFlow.js (ML in browser)
- OpenCV (image processing)

## Best Practices Summary

### Do's ✅

1. **Respect robots.txt** always
2. **Rate limit** appropriately (1-2s minimum)
3. **Use clear user-agent** with contact info
4. **Cache aggressively** to avoid re-crawling
5. **Handle errors gracefully** with retries
6. **Validate extracted data** before storing
7. **Monitor performance** and adjust
8. **Document selectors** and rationale
9. **Test thoroughly** before production
10. **Provide opt-out** mechanism

### Don'ts ❌

1. Don't ignore robots.txt
2. Don't crawl too fast (DDoS-like behavior)
3. Don't crawl private/authenticated content without permission
4. Don't store personal data without consent
5. Don't hammer servers on errors (exponential backoff)
6. Don't use anonymous/misleading user-agents
7. Don't crawl during peak hours (if possible)
8. Don't extract copyrighted content for commercial use
9. Don't ignore 429/503 responses
10. Don't crawl infinitely (set limits)

## Resources

### Tools & Libraries
- **Puppeteer**: https://pptr.dev/
- **Playwright**: https://playwright.dev/
- **Cheerio**: https://cheerio.js.org/
- **Axios**: https://axios-http.com/

### Standards & Specs
- **robots.txt**: https://www.robotstxt.org/
- **Sitemaps**: https://www.sitemaps.org/
- **HTML Microdata**: https://schema.org/
- **Open Graph**: https://ogp.me/

### Learning Resources
- **MDN Web Docs**: https://developer.mozilla.org/
- **Web Scraping Best Practices**: Various articles and guides
- **GDPR Compliance**: https://gdpr.eu/
- **Ethical Web Scraping**: Community guidelines

## Conclusion

Web crawling is a powerful tool for data collection, but with great power comes great responsibility. Always prioritize:

1. **Ethics**: Respect sites, users, and data privacy
2. **Performance**: Be efficient with resources
3. **Quality**: Extract accurate, validated data
4. **Reliability**: Handle errors, adapt to changes
5. **Transparency**: Clear identification, opt-out options

The LightDom Background Data Mining System implements these principles while providing a powerful, flexible, and intelligent crawling solution for neural network training data collection.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Authors**: LightDom Development Team
