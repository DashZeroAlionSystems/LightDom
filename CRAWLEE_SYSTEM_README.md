# Crawlee SEO Data Mining System

A comprehensive, highly configurable web crawling system built on top of [Crawlee](https://crawlee.dev/), designed for 24/7 SEO data mining and extraction.

## 🚀 Features

- **5 Crawler Types**: Cheerio, Playwright, Puppeteer, JSDOM, HTTP
- **Highly Configurable**: 100+ configuration options
- **Campaign Integration**: Connect crawlers to campaigns
- **Seeder Service**: Automatic URL seeding
- **Real-time Monitoring**: Live stats and progress tracking
- **Database Persistence**: All data saved to PostgreSQL
- **Easy to Use**: Intuitive UI with sensible defaults
- **24/7 Operation**: Run crawlers continuously
- **Scalable**: Autoscaling and concurrency control

## 📦 Installation

Crawlee is already installed and configured. The system is ready to use!

```bash
# Install dependencies (already done)
npm install crawlee --legacy-peer-deps

# Run database migrations
node scripts/run-all-migrations.js migrate
```

## 🗄️ Database Schema

The system uses 7 comprehensive database tables:

1. **crawlee_crawlers** - Main crawler configurations
2. **crawlee_crawler_seeds** - URLs to crawl
3. **crawlee_results** - Extracted data
4. **crawlee_request_queue** - Persistent request queue
5. **crawlee_sessions** - Session management
6. **crawlee_logs** - Detailed logging
7. **crawlee_stats_snapshots** - Historical statistics

Migration file: `database/migrations/crawlee-crawler-system.sql`

## 🎯 Quick Start

### 1. Start the Services

```bash
# Start API server (includes Crawlee routes)
npm run api

# Start frontend
npm run dev
```

### 2. Access the UI

Navigate to: http://localhost:3000/crawlee-manager

### 3. Create Your First Crawler

1. Click "Create Crawler"
2. Fill in basic settings:
   - Name: "My SEO Crawler"
   - Type: "cheerio" (fastest for static pages)
   - Description: What it does
3. Configure settings:
   - Max Requests: 1000
   - Concurrency: 10
   - Retries: 3
4. Define URL patterns:
   ```json
   {
     "include": ["*"],
     "exclude": [],
     "maxDepth": 3,
     "sameDomain": true,
     "respectRobotsTxt": true
   }
   ```
5. Add selectors for data extraction:
   ```json
   {
     "title": "h1",
     "description": "meta[name='description']",
     "keywords": "meta[name='keywords']",
     "price": ".price",
     "content": ".main-content"
   }
   ```
6. Click "Create Crawler"

### 4. Add Seed URLs

```bash
# Via API
curl -X POST http://localhost:3001/api/crawlee/crawlers/{id}/seeds \
  -H "Content-Type: application/json" \
  -d '{
    "seeds": [
      "https://example.com",
      "https://example.com/products"
    ]
  }'
```

### 5. Start Crawling

Click the "Start" button in the UI, or via API:

```bash
curl -X POST http://localhost:3001/api/crawlee/crawlers/{id}/start
```

## 📚 API Reference

### Endpoints

All endpoints are prefixed with `/api/crawlee`

#### Crawlers

- `POST /crawlers` - Create crawler
- `GET /crawlers` - List crawlers (with filters)
- `GET /crawlers/:id` - Get crawler details
- `PUT /crawlers/:id` - Update crawler
- `DELETE /crawlers/:id` - Delete crawler

#### Operations

- `POST /crawlers/:id/start` - Start crawler
- `POST /crawlers/:id/pause` - Pause crawler
- `POST /crawlers/:id/resume` - Resume crawler
- `POST /crawlers/:id/stop` - Stop crawler

#### Data

- `POST /crawlers/:id/seeds` - Add seed URLs
- `GET /crawlers/:id/results` - Get extracted results
- `GET /crawlers/:id/stats` - Get statistics
- `GET /crawlers/:id/logs` - Get logs

#### Metadata

- `GET /crawler-types` - List available crawler types
- `GET /config-template` - Get default config template

### Example Usage

#### Create a Crawler

```javascript
const response = await axios.post('/api/crawlee/crawlers', {
  name: 'Product Crawler',
  type: 'cheerio',
  selectors: {
    title: 'h1.product-title',
    price: '.price',
    description: '.description'
  },
  url_patterns: {
    include: ['**/products/**'],
    exclude: ['**/cart', '**/checkout'],
    maxDepth: 2
  }
});
```

#### Start Crawler with Seeds

```javascript
await axios.post(`/api/crawlee/crawlers/${crawlerId}/start`, {
  seedUrls: [
    'https://example.com/products',
    'https://example.com/products/category-1'
  ]
});
```

#### Get Results

```javascript
const response = await axios.get(`/api/crawlee/crawlers/${crawlerId}/results`, {
  params: {
    limit: 100,
    offset: 0
  }
});
```

## 🔧 Configuration Options

### Crawler Types

| Type | Best For | Features |
|------|---------|----------|
| **cheerio** | Static pages | Fast, low memory, no JS execution |
| **playwright** | Modern SPAs | Full browser, network control |
| **puppeteer** | Chrome-based | DevTools Protocol, screenshots |
| **jsdom** | Node.js DOM | JS execution, fast, no browser |
| **http** | API endpoints | Minimal overhead, raw HTTP |

### Core Configuration

```json
{
  "maxRequestsPerCrawl": 1000,
  "maxConcurrency": 10,
  "minConcurrency": 1,
  "maxRequestRetries": 3,
  "requestHandlerTimeoutSecs": 60,
  "navigationTimeoutSecs": 60,
  "keepAlive": true,
  "useSessionPool": true,
  "persistCookiesPerSession": true
}
```

### Autoscaling

```json
{
  "enabled": true,
  "minConcurrency": 1,
  "maxConcurrency": 10,
  "desiredConcurrency": 5,
  "desiredConcurrencyRatio": 0.9,
  "scaleUpStepRatio": 0.1,
  "scaleDownStepRatio": 0.05
}
```

### Session Pool

```json
{
  "maxPoolSize": 1000,
  "sessionOptions": {
    "maxAgeSecs": 3000,
    "maxUsageCount": 50,
    "maxErrorScore": 3
  }
}
```

### Error Handling

```json
{
  "maxRequestRetries": 3,
  "retryDelayMs": 1000,
  "maxRetryDelayMs": 60000,
  "retryMultiplier": 2,
  "ignoreHttpErrors": false,
  "ignoreSslErrors": false
}
```

## 🎨 Selector Syntax

### Simple Selectors

```json
{
  "title": "h1",
  "price": ".price",
  "description": "meta[name='description']"
}
```

### Advanced Selectors

```json
{
  "title": {
    "selector": "h1.product-title",
    "attribute": null
  },
  "image": {
    "selector": "img.main-image",
    "attribute": "src"
  },
  "tags": {
    "selector": ".tag",
    "multiple": true
  }
}
```

## 🔗 Integration

### With Campaigns

```javascript
await crawleeService.createCrawler({
  name: 'Campaign Crawler',
  campaign_id: 'campaign_xyz123',
  // ... other config
});
```

### With Seeder Service

```javascript
await crawleeService.createCrawler({
  name: 'Seeded Crawler',
  seeder_service_id: 'seeder_abc456',
  // ... other config
});
```

## 📊 Monitoring

### Real-time Stats

The UI displays:
- Total requests
- Requests finished/failed
- Success rate
- Average duration
- Current concurrency
- Progress percentage

### Historical Data

Stats are saved every minute to `crawlee_stats_snapshots` for:
- Performance analysis
- Trend visualization
- Capacity planning

## 🐛 Debugging

### Enable Detailed Logging

```javascript
const crawleeService = new CrawleeService(db, {
  enableLogging: true
});
```

### View Logs

```bash
# Via API
curl http://localhost:3001/api/crawlee/crawlers/{id}/logs?level=error&limit=100
```

### Common Issues

1. **Crawler not starting**: Check seed URLs are valid
2. **No data extracted**: Verify selectors match page structure
3. **High failure rate**: Reduce concurrency, increase timeout
4. **Memory issues**: Lower maxConcurrency, use Cheerio instead of browsers

## 🧪 Testing

Run the test suite:

```bash
node test-crawlee-service.js
```

This tests:
- Database connection
- Service initialization
- CRUD operations
- Seed management
- Stats collection

## 🚀 Production Deployment

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres
```

### Performance Tuning

For high-volume crawling:

1. Increase database connection pool
2. Use Redis for session storage
3. Scale horizontally with multiple instances
4. Use Cheerio crawler for static pages
5. Enable autoscaling

### Monitoring

- Check `crawlee_stats_snapshots` for performance
- Monitor `crawlee_logs` for errors
- Set up alerts for failed crawlers

## 📖 Additional Resources

- [Crawlee Documentation](https://crawlee.dev/docs)
- [Puppeteer Docs](https://pptr.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Cheerio Docs](https://cheerio.js.org/)

## 🤝 Support

For issues or questions:
1. Check logs in UI or database
2. Review configuration
3. Test with simple examples first
4. Reduce complexity if issues persist

## 📝 License

Part of LightDom Space Bridge Platform
