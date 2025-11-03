# Crawler Campaign System - Quick Start Guide

## Prerequisites

Before using the Crawler Campaign System, ensure you have:

1. **Node.js 20+** installed
2. **PostgreSQL** running (or set `DB_DISABLED=true` for mock mode)
3. **DeepSeek API Key** (optional - system works in mock mode without it)

## Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env and add your configuration:
# DEEPSEEK_API_KEY=your-key-here (optional)
# DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Run database migration (if using PostgreSQL)
psql -U postgres -d your_database < database/migrations/crawler-campaign-tables.sql

# Or use npm script
npm run migrate
```

## Starting the System

```bash
# Start the API server
npm run start:dev

# Or start the complete system (API + Frontend)
npm run start:complete
```

The system will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Campaign Dashboard**: http://localhost:3000/admin/crawler-campaigns

## Using the System

### 1. Via Web Dashboard

1. Navigate to http://localhost:3000/admin/crawler-campaigns
2. Click "Create Campaign"
3. Enter a natural language prompt describing your crawling goal
4. Specify the client site URL
5. Click "Generate Campaign"
6. Review the generated configuration
7. Click "Start" to begin crawling

### 2. Via API

#### Create a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/create-from-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Collect SEO training data for an e-commerce site selling outdoor gear. Crawl product pages, blog posts, and category pages.",
    "clientSiteUrl": "https://example.com",
    "options": {
      "payloadSize": 100,
      "loadBalancing": "least-busy"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign_1234567890_abc123",
    "name": "SEO Training Data Collection",
    "status": "created",
    "clientSiteUrl": "https://example.com",
    "seeds": [...],
    "configuration": {
      "parallelCrawlers": 5,
      "payloadSize": 100,
      "loadBalancing": "least-busy"
    }
  }
}
```

#### Start a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/start
```

#### Monitor Campaign Progress

```bash
curl http://localhost:3001/api/campaigns/{campaignId}/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "campaign_1234567890_abc123",
    "status": "running",
    "totalCrawlers": 5,
    "activeCrawlers": 5,
    "totalUrls": 250,
    "processedUrls": 47,
    "errorCount": 2,
    "progress": 19
  }
}
```

#### Pause a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/pause
```

#### Resume a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/resume
```

#### Stop a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/stop
```

#### Schedule a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "time": "02:00",
    "enabled": true
  }'
```

## DeepSeek AI Features

The system uses DeepSeek AI to:
1. Generate optimal crawler configurations from natural language
2. Discover and prioritize URL seeds
3. Build data extraction schemas
4. Create workflow pipelines
5. Optimize configurations based on analytics

### AI Endpoints

#### Generate Workflow

```bash
curl -X POST http://localhost:3001/api/campaigns/deepseek/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a comprehensive SEO training dataset",
    "options": {}
  }'
```

#### Generate URL Seeds

```bash
curl -X POST http://localhost:3001/api/campaigns/deepseek/generate-seeds \
  -H "Content-Type: application/json" \
  -d '{
    "campaignDescription": "SEO training data collection",
    "clientSiteUrl": "https://example.com"
  }'
```

#### Build Schema

```bash
curl -X POST http://localhost:3001/api/campaigns/deepseek/build-schema \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "E-commerce product data collection",
    "existingSchemas": ["seo_metrics", "page_performance"]
  }'
```

#### Generate Workflow Pipeline

```bash
curl -X POST http://localhost:3001/api/campaigns/deepseek/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "schemas": ["crawler_data", "seo_metrics", "training_data"],
    "goal": "Create SEO ranking prediction dataset"
  }'
```

#### Research Neural Network Setup

```bash
curl -X POST http://localhost:3001/api/campaigns/deepseek/research-neural-network \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "purpose": "SEO ranking prediction",
      "trainingDataSize": "large"
    }
  }'
```

## Configuration Options

### Campaign Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxDepth` | number | 3 | Maximum crawl depth |
| `parallelCrawlers` | number | 5 | Number of parallel crawler instances |
| `payloadSize` | number | 100 | URLs per crawler |
| `loadBalancing` | string | 'least-busy' | Load balancing strategy |
| `rateLimit` | number | 100 | Requests per minute |
| `respectRobotsTxt` | boolean | true | Honor robots.txt |
| `timeout` | number | 30000 | Request timeout (ms) |

### Load Balancing Strategies

- **`least-busy`**: Distributes URLs to the crawler with the smallest queue
- **`round-robin`**: Equal distribution across all crawlers
- **`priority-based`**: High-priority URLs to dedicated crawlers

### Schedule Frequencies

- **`hourly`**: Execute every hour
- **`daily`**: Execute once per day
- **`weekly`**: Execute once per week
- **`monthly`**: Execute once per month

## Mock Mode

If DeepSeek API is not configured, the system operates in **mock mode**:
- Generates sample workflow configurations
- Uses predefined URL patterns
- Creates basic schemas

To enable live mode:
1. Get an API key from DeepSeek
2. Set `DEEPSEEK_API_KEY` in your `.env` file
3. Restart the services

## Troubleshooting

### Campaign Won't Start

**Check:**
- Database connection is active
- URLs in seeds are accessible
- Rate limits aren't exceeded

**Solution:**
```bash
# Check API server logs
npm run start:dev

# Verify campaign status
curl http://localhost:3001/api/campaigns/{id}
```

### DeepSeek API Errors

**Issue**: API key invalid or quota exceeded

**Solution**:
- Verify your API key in `.env`
- Check DeepSeek API status
- System will fall back to mock mode automatically

### Poor Performance

**Optimize:**
1. Reduce `parallelCrawlers`
2. Increase `payloadSize`
3. Enable auto-scaling: `CRAWLER_AUTO_SCALING=true`
4. Check network bandwidth

## Example Workflows

### 1. SEO Training Data Collection

```javascript
// Campaign Prompt
"Create a comprehensive SEO training dataset for an e-commerce website. 
Crawl all product pages, blog posts, category pages, and landing pages. 
Extract titles, meta descriptions, content, headings, and structured data."

// Result
- 500+ URLs discovered
- 5 parallel crawlers
- Structured data extraction
- Daily schedule at 2 AM
```

### 2. Competitor Analysis

```javascript
// Campaign Prompt
"Analyze competitor websites in the outdoor gear industry. 
Crawl their product pages, pricing, and content strategy."

// Result
- Multiple competitor sites
- Priority-based load balancing
- Comparative metrics
- Weekly schedule
```

### 3. Content Audit

```javascript
// Campaign Prompt
"Perform a complete content audit of example.com. 
Identify broken links, missing meta tags, and optimization opportunities."

// Result
- Site-wide crawl
- Quality metrics
- Error reporting
- One-time execution
```

## Advanced Usage

### Custom Schema Building

```javascript
const schema = await deepSeekService.buildCrawlerSchema(
  'E-commerce product data for ML training',
  ['seo_metrics', 'page_performance']
);
```

### Workflow Pipeline

```javascript
const pipeline = await deepSeekService.generateWorkflowPipeline(
  ['crawler_data', 'seo_metrics', 'training_data'],
  'Create SEO ranking prediction dataset'
);
```

### Load Balancing Config

```javascript
await campaignService.updateCampaignConfig(campaignId, {
  configuration: {
    loadBalancing: 'priority-based',
    payloadSize: 150,
    parallelCrawlers: 10
  }
});
```

## Support

- **Documentation**: See `CRAWLER_CAMPAIGN_SYSTEM_README.md`
- **API Reference**: http://localhost:3001/api-docs (if enabled)
- **Issues**: GitHub Issues
- **Examples**: `/examples` directory

## Next Steps

1. Explore the admin dashboard
2. Create your first campaign
3. Monitor real-time analytics
4. Configure automated schedules
5. Integrate with your workflow

Happy Crawling! 🕷️
