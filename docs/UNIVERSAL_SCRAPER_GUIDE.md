# Universal Web Scraper - Complete Guide

## 🌐 Overview

The Universal Web Scraper is an intelligent, adaptive system that can **discover and scrape data from ANY web source** without manual configuration. It uses AI-powered selector generation, Schema.org extraction, and automated source discovery.

## ✨ Key Features

### 🤖 Intelligent Source Discovery
- **Automatic Discovery**: Search queries find relevant sources automatically
- **Multi-Source Support**: Scrape from multiple domains simultaneously
- **Competitor Intelligence**: Monitor competitor websites automatically

### 🧠 AI-Powered Extraction
- **Smart Selectors**: AI generates CSS selectors based on data types
- **Adaptive Scraping**: Works with any site structure
- **Schema.org Extraction**: Automatically extracts structured data

### 📦 Complete Data Pipeline
- **Pagination Handling**: Automatically follows next page links
- **Image Processing**: Downloads and processes images
- **Data Cleaning**: Validates and cleans extracted data
- **Multiple Storage**: Database, JSON, CSV, or API export

### 🔄 Production-Ready
- **Error Handling**: Robust retry logic and error recovery
- **Rate Limiting**: Respects server limits
- **Scheduling**: Periodic scraping with cron
- **Monitoring**: Track data quality and success rates

## 🚀 Quick Start

### 1. Create a Universal Scraper

```javascript
// Scrape ANY data from discovered sources
const scraper = await mcp('create_universal_scraper', {
  name: 'My Universal Scraper',
  searchQuery: 'best tech products 2025', // Optional: finds sources
  dataTypes: ['title', 'price', 'description', 'image', 'rating'],
  maxPages: 10,
  storageType: 'database',
  includeSchemaOrg: true,
  useAISelectors: true,
  activate: true
});
```

### 2. Search-Based Scraper

```javascript
// Discover sources via search and scrape automatically
const searchScraper = await mcp('create_search_scraper', {
  searchQuery: 'AI automation tools pricing',
  dataTypes: ['name', 'price', 'features', 'reviews'],
  activate: true
});
```

### 3. Competitor Intelligence

```javascript
// Monitor competitors automatically
const competitorScraper = await mcp('create_competitor_scraper', {
  competitors: [
    'https://competitor1.com',
    'https://competitor2.com',
    'https://competitor3.com'
  ],
  activate: true
});

// Extracts: prices, products, ratings, reviews, features, availability
// Scheduled: Daily at midnight
// Storage: Database with change tracking
```

### 4. Product Catalog Scraper

```javascript
// Scrape entire product catalogs
const productScraper = await mcp('create_product_scraper', {
  categories: ['laptops', 'smartphones', 'tablets'],
  activate: true
});

// Extracts: name, price, brand, SKU, rating, specs, availability
// Scheduled: Every 2 days
// Includes: Schema.org Product data
```

### 5. Content Aggregator

```javascript
// Aggregate news, blogs, articles
const aggregator = await mcp('create_content_aggregator', {
  sources: [
    'https://techcrunch.com',
    'https://theverge.com',
    'https://arstechnica.com'
  ],
  topics: ['AI', 'automation', 'web3'],
  activate: true
});

// Extracts: title, author, date, content, category, tags
// Scheduled: Every 2 hours
// Includes: Schema.org Article data
```

## 📋 Configuration Options

### UniversalScraperConfig

```typescript
{
  name: string;                    // Scraper name
  searchQuery?: string;            // Search query to discover sources
  targetDomains?: string[];        // Specific domains to scrape
  dataTypes: string[];             // Data types to extract
  maxPages?: number;               // Max pages per source (default: 10)
  schedule?: string;               // Cron schedule (e.g., '0 */6 * * *')
  storageType: 'database' | 'json' | 'csv' | 'api';
  includeSchemaOrg?: boolean;      // Extract Schema.org (default: true)
  useAISelectors?: boolean;        // Use AI selectors (default: true)
  activate?: boolean;              // Activate immediately
}
```

### Common Data Types

```
Content:        title, description, content, text, summary
Pricing:        price, originalPrice, discount, currency
Products:       name, brand, SKU, category, specifications
Media:          image, video, thumbnail, gallery
Social:         rating, reviews, reviewCount, likes
Metadata:       author, date, publishedDate, modifiedDate
Classification: category, tags, keywords
Links:          url, link, href
Contact:        email, phone, address
Availability:   inStock, availability, status
```

## 💡 Real-World Examples

### Example 1: E-commerce Price Monitor

```javascript
// Monitor prices across multiple stores
const priceMonitor = await mcp('create_universal_scraper', {
  name: 'Price Comparison Monitor',
  targetDomains: [
    'https://amazon.com/dp/B08X123ABC',
    'https://bestbuy.com/product/123456',
    'https://walmart.com/ip/789012'
  ],
  dataTypes: [
    'name',
    'price',
    'originalPrice',
    'discount',
    'availability',
    'rating',
    'reviewCount',
    'seller'
  ],
  maxPages: 1, // Just product pages
  schedule: '0 */4 * * *', // Every 4 hours
  storageType: 'database',
  includeSchemaOrg: true,
  useAISelectors: true,
  activate: true
});

console.log('Price monitor active - tracking 3 products every 4 hours');
```

### Example 2: Job Listing Aggregator

```javascript
// Aggregate tech jobs from multiple sources
const jobAggregator = await mcp('create_search_scraper', {
  searchQuery: 'remote software engineer jobs',
  dataTypes: [
    'title',
    'company',
    'location',
    'salary',
    'description',
    'requirements',
    'benefits',
    'applicationLink',
    'postedDate'
  ],
  activate: true
});

// Automatically discovers:
// - LinkedIn Jobs
// - Indeed
// - Remote.co
// - WeWorkRemotely
// - And more...
```

### Example 3: Real Estate Market Analysis

```javascript
// Track real estate listings
const realEstateScraper = await mcp('create_universal_scraper', {
  name: 'Real Estate Tracker',
  searchQuery: 'houses for sale San Francisco',
  dataTypes: [
    'address',
    'price',
    'bedrooms',
    'bathrooms',
    'squareFeet',
    'lotSize',
    'yearBuilt',
    'description',
    'features',
    'images',
    'agentName',
    'agentPhone',
    'listingDate'
  ],
  maxPages: 50,
  schedule: '0 8 * * *', // Daily at 8 AM
  storageType: 'database',
  includeSchemaOrg: true,
  useAISelectors: true,
  activate: true
});
```

### Example 4: News Sentiment Analysis

```javascript
// Aggregate news for sentiment analysis
const newsAggregator = await mcp('create_content_aggregator', {
  sources: [
    'https://reuters.com',
    'https://bloomberg.com',
    'https://cnbc.com',
    'https://ft.com'
  ],
  topics: ['stock market', 'cryptocurrency', 'tech stocks'],
  activate: true
});

// Extracts articles every 2 hours
// Perfect for feeding into sentiment analysis
```

### Example 5: Academic Paper Scraper

```javascript
// Scrape research papers
const paperScraper = await mcp('create_universal_scraper', {
  name: 'Academic Paper Scraper',
  searchQuery: 'machine learning papers 2025',
  dataTypes: [
    'title',
    'authors',
    'abstract',
    'publicationDate',
    'journal',
    'doi',
    'keywords',
    'citations',
    'pdfLink',
    'references'
  ],
  maxPages: 100,
  schedule: '0 0 * * 0', // Weekly on Sunday
  storageType: 'database',
  includeSchemaOrg: true,
  useAISelectors: true,
  activate: true
});
```

### Example 6: Restaurant Menu Scraper

```javascript
// Scrape restaurant menus for price comparison
const menuScraper = await mcp('create_universal_scraper', {
  name: 'Restaurant Menu Scraper',
  targetDomains: [
    'https://restaurant1.com/menu',
    'https://restaurant2.com/menu',
    'https://restaurant3.com/menu'
  ],
  dataTypes: [
    'dishName',
    'description',
    'price',
    'category',
    'ingredients',
    'allergens',
    'calories',
    'image',
    'isVegetarian',
    'isVegan',
    'spiceLevel'
  ],
  maxPages: 5,
  schedule: '0 0 1 * *', // Monthly
  storageType: 'database',
  includeSchemaOrg: true,
  useAISelectors: true,
  activate: true
});
```

### Example 7: Social Media Influencer Tracker

```javascript
// Track influencer metrics
const influencerTracker = await mcp('create_universal_scraper', {
  name: 'Influencer Analytics',
  targetDomains: [
    'https://instagram.com/influencer1',
    'https://youtube.com/@influencer2',
    'https://tiktok.com/@influencer3'
  ],
  dataTypes: [
    'followers',
    'following',
    'posts',
    'engagement',
    'recentPosts',
    'views',
    'likes',
    'comments',
    'shares'
  ],
  maxPages: 10,
  schedule: '0 0 * * *', // Daily
  storageType: 'database',
  includeSchemaOrg: false, // Social media doesn't use Schema.org much
  useAISelectors: true,
  activate: true
});
```

## 🔍 How It Works

### 1. Source Discovery Phase

```
If searchQuery provided:
  → Execute web searches
  → Extract search result URLs
  → Validate discovered sources
Else if targetDomains provided:
  → Validate target URLs
  → Add to scraping queue
```

### 2. Page Fetching Phase

```
For each source:
  → Fetch HTML with retry logic
  → Rotate user agents
  → Handle redirects
  → Respect robots.txt
  → Apply rate limiting
```

### 3. Data Extraction Phase

```
AI Selector Generation (if enabled):
  → Analyze HTML structure
  → Generate smart CSS selectors
  → Match common patterns

Schema.org Extraction (if enabled):
  → Extract JSON-LD scripts
  → Parse microdata
  → Validate schemas

Generic Extraction:
  → Apply generated/configured selectors
  → Extract specified data types
  → Handle arrays and nested data
```

### 4. Data Processing Phase

```
Image Processing:
  → Extract all image URLs
  → Convert relative to absolute
  → Optionally download images

Data Cleaning:
  → Remove extra whitespace
  → Parse prices and dates
  → Validate data formats
  → Calculate quality score
```

### 5. Pagination Phase

```
Find next page link:
  → Look for "next" buttons
  → Find pagination patterns
  → Respect maxPages limit
  → Add to queue if found
```

### 6. Storage Phase

```
Enrich with metadata:
  → Add timestamps
  → Generate unique IDs
  → Add quality scores

Store data:
  → Database (PostgreSQL)
  → JSON file export
  → CSV export
  → Send to API endpoint
```

## 📊 Data Quality Metrics

The scraper automatically calculates data quality:

```javascript
{
  dataQuality: {
    score: 0.85,              // 0-1 scale
    completeness: 85,         // Percentage
    fieldsExtracted: 12,      // Number of fields
    fieldsRequested: 14,      // Number requested
    cleanedAt: "2025-11-01T10:00:00Z"
  }
}
```

## 🎯 Best Practices

### 1. Choose the Right Scraper Type

```javascript
// Use search scraper for discovery
create_search_scraper({ searchQuery: '...' })

// Use domain scraper for specific sites
create_universal_scraper({ targetDomains: [...] })

// Use competitor scraper for monitoring
create_competitor_scraper({ competitors: [...] })

// Use product scraper for e-commerce
create_product_scraper({ categories: [...] })

// Use content aggregator for articles
create_content_aggregator({ sources: [...], topics: [...] })
```

### 2. Optimize Data Types

```javascript
// Be specific with data types
dataTypes: [
  'productName',      // Better than 'name'
  'currentPrice',     // Better than 'price'
  'customerRating',   // Better than 'rating'
  'featuredImage'     // Better than 'image'
]
```

### 3. Set Appropriate Schedules

```javascript
// Prices change frequently
schedule: '0 */4 * * *'  // Every 4 hours

// News updates often
schedule: '0 */2 * * *'  // Every 2 hours

// Product catalogs change slowly
schedule: '0 0 */2 * *'  // Every 2 days

// Real estate listings weekly
schedule: '0 8 * * 0'     // Sunday at 8 AM
```

### 4. Handle Large Datasets

```javascript
// For large scraping jobs
{
  maxPages: 100,           // Limit pages
  storageType: 'database', // Use database
  schedule: '0 0 * * *',   // Daily batch job
  includeSchemaOrg: true,  // Get structured data
  useAISelectors: true     // Better extraction
}
```

### 5. Monitor Performance

```javascript
// After scraping, check the report
{
  success: true,
  totalItems: 127,
  summary: {
    pagesScraped: 127,
    imagesFound: 543,
    schemasFound: 98,
    avgDataQuality: 0.87,
    domains: ['site1.com', 'site2.com'],
    dataTypes: ['title', 'price', 'image', ...]
  }
}
```

## 🛡️ Error Handling

The scraper includes comprehensive error handling:

```
Connection Errors:
  → Retry up to 3 times
  → Exponential backoff
  → Log and continue

Parsing Errors:
  → Skip invalid data
  → Log warnings
  → Continue scraping

Validation Errors:
  → Mark data as low quality
  → Store anyway with flag
  → Alert if critical

Rate Limiting:
  → Detect 429 responses
  → Wait and retry
  → Adjust schedule
```

## 📈 Advanced Features

### Dynamic Selector Generation

The AI selector generator analyzes HTML and finds the best selectors:

```javascript
// Requested: ['title', 'price', 'rating']
// Generated:
{
  title: ['h1', 'h1.title', '[itemprop="name"]', '.product-title'],
  price: ['[itemprop="price"]', '.price', 'span.price'],
  rating: ['[itemprop="ratingValue"]', '.rating', '[data-rating]']
}

// Tries each selector until one works
```

### Schema.org Priority

When Schema.org data is found, it takes priority:

```javascript
// HTML has both Schema.org and regular elements
// Priority order:
1. Schema.org JSON-LD (highest quality)
2. Schema.org Microdata
3. AI-generated selectors
4. Fallback patterns
```

### Pagination Intelligence

Smart pagination detection:

```javascript
// Finds pagination using:
- <a> tags with "next" text
- rel="next" links
- Common pagination patterns
- Page number increments
- Prevents loops and duplicates
```

## 🔧 Customization

### Custom Storage Handler

```javascript
// Add custom API storage
storageType: 'api'

// Configure in workflow:
{
  id: 'store-data',
  type: 'n8n-nodes-base.httpRequest',
  parameters: {
    method: 'POST',
    url: 'https://your-api.com/scraped-data',
    sendBody: true,
    bodyParameters: {
      parameters: [
        { name: 'data', value: '={{ JSON.stringify($json) }}' },
        { name: 'apiKey', value: '={{ $env.API_KEY }}' }
      ]
    }
  }
}
```

### Custom Data Types

```javascript
// Add custom extraction logic
dataTypes: [
  'customField1',
  'customField2',
  'customMetric'
]

// AI will generate selectors like:
[
  '.customField1',
  '#customField1',
  '[data-customfield1]',
  '[itemprop="customField1"]'
]
```

## 📝 Example Output

```json
{
  "id": "example-com-1730462400-abc123",
  "url": "https://example.com/product",
  "domain": "example.com",
  "title": "Premium Web Scraper Pro",
  "price": 299.99,
  "description": "Advanced web scraping tool with AI capabilities",
  "image": [
    "https://example.com/images/product1.jpg",
    "https://example.com/images/product2.jpg"
  ],
  "rating": 4.9,
  "reviewCount": 342,
  "availability": "In Stock",
  "schemaOrg": {
    "jsonLd": [{
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Premium Web Scraper Pro",
      "offers": {
        "@type": "Offer",
        "price": "299.99",
        "priceCurrency": "USD"
      }
    }],
    "count": 1,
    "types": ["Product"]
  },
  "images": [
    "https://example.com/images/product1.jpg",
    "https://example.com/images/product2.jpg"
  ],
  "imageCount": 2,
  "dataQuality": {
    "score": 0.91,
    "completeness": 91,
    "cleanedAt": "2025-11-01T10:00:00Z"
  },
  "metadata": {
    "scrapedAt": "2025-11-01T10:00:00Z",
    "source": "https://example.com/product",
    "domain": "example.com",
    "dataTypes": ["title", "price", "description", "rating"],
    "hasSchema": true,
    "schemaTypes": ["Product"],
    "imageCount": 2,
    "dataQuality": 0.91
  },
  "pagination": {
    "currentPage": 1,
    "hasNextPage": false,
    "maxPages": 10
  }
}
```

## 🚀 Next Steps

1. **Start Simple**: Begin with a search scraper to test
2. **Monitor Results**: Check data quality and adjust
3. **Scale Up**: Add more sources and data types
4. **Automate**: Set up schedules for periodic scraping
5. **Integrate**: Send data to your analytics/dashboard

## 📚 Related Documentation

- [N8N Windsurf MCP Guide](N8N_WINDSURF_MCP_GUIDE.md)
- [N8N Examples](N8N_EXAMPLES.md)
- [Quick Reference](../N8N_QUICK_REFERENCE.md)

---

**Happy Scraping! 🎉** The Universal Web Scraper can scrape ANY data from ANY source automatically.
