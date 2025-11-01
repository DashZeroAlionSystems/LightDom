# Universal Scraper - Quick Examples

## 🎯 Copy-Paste Ready Examples

### 1. Discover and Scrape Tech Products

```javascript
const scraper = await mcp('create_search_scraper', {
  searchQuery: 'best AI tools 2025',
  dataTypes: ['title', 'price', 'description', 'rating', 'features'],
  activate: true
});
```

### 2. Monitor Competitor Prices

```javascript
const monitor = await mcp('create_competitor_scraper', {
  competitors: [
    'https://competitor1.com',
    'https://competitor2.com',
    'https://competitor3.com'
  ],
  activate: true
});
```

### 3. Aggregate Tech News

```javascript
const news = await mcp('create_content_aggregator', {
  sources: [
    'https://techcrunch.com',
    'https://theverge.com',
    'https://wired.com'
  ],
  topics: ['AI', 'machine learning', 'automation'],
  activate: true
});
```

### 4. Scrape Product Catalog

```javascript
const products = await mcp('create_product_scraper', {
  categories: ['laptops', 'monitors', 'keyboards'],
  activate: true
});
```

### 5. Custom Universal Scraper

```javascript
const custom = await mcp('create_universal_scraper', {
  name: 'My Custom Scraper',
  targetDomains: ['https://example.com'],
  dataTypes: [
    'title',
    'price',
    'description',
    'image',
    'rating',
    'availability'
  ],
  maxPages: 20,
  schedule: '0 */6 * * *', // Every 6 hours
  storageType: 'database',
  includeSchemaOrg: true,
  useAISelectors: true,
  activate: true
});
```

## 🔥 Popular Use Cases

### E-commerce Price Tracking

```javascript
const priceTracker = await mcp('create_universal_scraper', {
  name: 'Price Tracker',
  targetDomains: [
    'https://amazon.com/dp/B08X123ABC',
    'https://bestbuy.com/product/123456'
  ],
  dataTypes: ['name', 'price', 'availability', 'seller'],
  schedule: '0 */4 * * *',
  storageType: 'database',
  activate: true
});
```

### Job Listing Aggregator

```javascript
const jobs = await mcp('create_search_scraper', {
  searchQuery: 'remote software engineer jobs',
  dataTypes: [
    'title',
    'company',
    'location',
    'salary',
    'description',
    'link'
  ],
  activate: true
});
```

### Real Estate Monitor

```javascript
const realEstate = await mcp('create_search_scraper', {
  searchQuery: 'houses for sale Miami',
  dataTypes: [
    'address',
    'price',
    'bedrooms',
    'bathrooms',
    'squareFeet',
    'images'
  ],
  activate: true
});
```

### Restaurant Menu Scraper

```javascript
const menus = await mcp('create_universal_scraper', {
  name: 'Restaurant Menus',
  targetDomains: [
    'https://restaurant1.com/menu',
    'https://restaurant2.com/menu'
  ],
  dataTypes: [
    'dishName',
    'price',
    'description',
    'category',
    'image'
  ],
  schedule: '0 0 1 * *', // Monthly
  storageType: 'database',
  activate: true
});
```

### Academic Paper Scraper

```javascript
const papers = await mcp('create_search_scraper', {
  searchQuery: 'machine learning papers 2025',
  dataTypes: [
    'title',
    'authors',
    'abstract',
    'publicationDate',
    'pdfLink'
  ],
  activate: true
});
```

## 💡 Pro Tips

### Tip 1: Use Specific Data Types
```javascript
// Good
dataTypes: ['productName', 'currentPrice', 'customerRating']

// Less specific
dataTypes: ['name', 'price', 'rating']
```

### Tip 2: Set Appropriate Schedules
```javascript
// Prices: Every 4 hours
schedule: '0 */4 * * *'

// News: Every 2 hours
schedule: '0 */2 * * *'

// Catalogs: Every 2 days
schedule: '0 0 */2 * *'
```

### Tip 3: Always Enable AI and Schema
```javascript
{
  includeSchemaOrg: true,  // Get structured data
  useAISelectors: true     // Better extraction
}
```

### Tip 4: Start with Search, Then Target
```javascript
// First: Discover sources
const discovery = await mcp('create_search_scraper', {
  searchQuery: 'best product reviews',
  dataTypes: ['title', 'link'],
  activate: true
});

// Then: Create targeted scrapers for good sources
const targeted = await mcp('create_universal_scraper', {
  targetDomains: discoveredSources,
  dataTypes: ['full', 'data', 'extraction'],
  activate: true
});
```

## 🎨 Templates by Industry

### E-commerce
```javascript
dataTypes: ['name', 'price', 'brand', 'sku', 'rating', 'reviews', 'availability', 'image']
```

### News/Media
```javascript
dataTypes: ['title', 'author', 'date', 'content', 'category', 'tags', 'image']
```

### Real Estate
```javascript
dataTypes: ['address', 'price', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt', 'images']
```

### Jobs
```javascript
dataTypes: ['title', 'company', 'location', 'salary', 'description', 'requirements', 'applicationLink']
```

### Restaurants
```javascript
dataTypes: ['name', 'cuisine', 'rating', 'priceRange', 'hours', 'menu', 'phone', 'address']
```

### Events
```javascript
dataTypes: ['name', 'date', 'time', 'location', 'price', 'description', 'organizer']
```

## 🚀 Getting Started

1. **Choose a scraper type**
   - Search-based for discovery
   - Competitor for monitoring
   - Product for catalogs
   - Content for news/blogs

2. **Define data types**
   - Be specific
   - Include all needed fields
   - Use Schema.org when possible

3. **Set schedule (optional)**
   - Match data freshness needs
   - Consider server load
   - Use cron syntax

4. **Activate and monitor**
   - Start with activate: true
   - Check data quality
   - Adjust as needed

## 📊 Check Results

After creating a scraper:

```javascript
// List all scrapers
const scrapers = await mcp('list_workflows', { active: true });

// Get specific scraper
const scraper = await mcp('get_workflow', {
  workflowId: 'your-workflow-id'
});

// Check executions
const executions = await mcp('list_executions', {
  workflowId: 'your-workflow-id',
  limit: 10
});
```

## 🐛 Troubleshooting

### Scraper Not Finding Data?
```javascript
// Enable AI selectors
useAISelectors: true

// Try more generic data types
dataTypes: ['title', 'text', 'image', 'link']
```

### Rate Limited?
```javascript
// Reduce frequency
schedule: '0 0 * * *' // Once daily

// Reduce pages
maxPages: 5
```

### Low Data Quality?
```javascript
// Check Schema.org availability
includeSchemaOrg: true

// Use more specific domains
targetDomains: ['specific-site.com']
```

---

For more examples, see:
- [Universal Scraper Guide](../docs/UNIVERSAL_SCRAPER_GUIDE.md)
- [N8N Examples](../docs/N8N_EXAMPLES.md)
