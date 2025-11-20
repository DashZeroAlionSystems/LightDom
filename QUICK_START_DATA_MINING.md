# Quick Start Guide - Advanced Data Mining System

Get started with the LightDom Advanced Data Mining System in 5 minutes!

## Installation

### 1. Install Dependencies

```bash
# Install Puppeteer for headless Chrome automation
npm install puppeteer

# Optional: Install Playwright for cross-browser support
npm install playwright
```

### 2. Verify Installation

```bash
# Run the test suite
node test-data-mining-system.js

# Run the demo
node demo-data-mining-system.js
```

## Basic Usage

### Example 1: Simple SEO Content Mining

```javascript
import DataMiningOrchestrator from './services/data-mining-orchestrator.js';

const orchestrator = new DataMiningOrchestrator();
await orchestrator.initialize();

const miningId = await orchestrator.createMiningInstance({
  name: 'SEO Content Mining',
  topic: 'seo-tips',
  seedUrls: ['https://moz.com/blog'],
  attributes: [
    { name: 'title', selector: 'h1', dataType: 'text' },
    { name: 'description', selector: 'meta[name="description"]', dataType: 'attribute', attributeName: 'content' }
  ],
  customScrapers: ['seo-metadata'],
  enableAutoSeeding: true
});

await orchestrator.startMiningInstance(miningId);
```

### Example 2: Schema-Based Workflow

```javascript
import SchemaWorkflowGenerator from './services/schema-workflow-generator.js';

const generator = new SchemaWorkflowGenerator();

// Use a pre-built template
const schemaId = generator.generateSchemaFromTemplate('seo-content-mining');

// Create knowledge graph
const graphId = generator.createKnowledgeGraph(schemaId);

// Generate and execute workflow
const workflowId = generator.generateWorkflowConfig(schemaId, graphId);
await generator.executeWorkflow(workflowId, ['https://example.com']);
```

### Example 3: Custom Scraper

```javascript
import DataMiningOrchestrator from './services/data-mining-orchestrator.js';

const orchestrator = new DataMiningOrchestrator();
await orchestrator.initialize();

// Register custom scraper
orchestrator.registerCustomScraper('my-scraper', async (page, url) => {
  return await page.evaluate(() => {
    return {
      customData: document.querySelector('.my-data')?.textContent,
      moreData: document.querySelectorAll('.item').length
    };
  });
});

// Use in mining instance
const miningId = await orchestrator.createMiningInstance({
  name: 'Custom Mining',
  topic: 'my-topic',
  seedUrls: ['https://example.com'],
  attributes: [],
  customScrapers: ['my-scraper']
});
```

## Configuration

Edit `config/data-mining-config.json`:

```json
{
  "browserPool": {
    "minBrowsers": 2,
    "maxBrowsers": 10
  },
  "orchestrator": {
    "maxConcurrentInstances": 5,
    "enableURLSeeding": true,
    "enable3DLayerScraping": true
  }
}
```

## Available Templates

1. **seo-content-mining** - SEO articles and blog posts
2. **e-commerce-product-mining** - Product catalogs
3. **ui-pattern-mining** - UI components with 3D analysis
4. **content-analysis-mining** - General content extraction

## Common Use Cases

### Use Case 1: Blog Content Analysis

```javascript
const schemaId = generator.generateSchemaFromTemplate('seo-content-mining', {
  name: 'Tech Blog Analysis'
});
```

### Use Case 2: Product Research

```javascript
const schemaId = generator.generateSchemaFromTemplate('e-commerce-product-mining', {
  name: 'Product Price Monitoring'
});
```

### Use Case 3: Design System Mining

```javascript
const schemaId = generator.generateSchemaFromTemplate('ui-pattern-mining', {
  name: 'Component Library Research'
});
```

## Advanced Features

### 3D Layer Scraping

Enable 3D layer analysis for UI pattern mining:

```javascript
const miningId = await orchestrator.createMiningInstance({
  name: 'UI Analysis',
  enable3DLayer: true,
  // ... other config
});
```

### URL Discovery

Automatically discover URLs by topic:

```javascript
import { URLSeedingService } from './services/url-seeding-service.js';

const seeding = new URLSeedingService();
await seeding.start();

const urls = await seeding.discoverURLsByTopic('react-development', {
  maxUrls: 50,
  minQuality: 0.7
});
```

### AI Schema Generation

Use AI to create schemas from natural language:

```javascript
const schemaId = await generator.generateSchemaFromPrompt(
  "Mine tech blogs for JavaScript tutorials with code examples"
);
```

## Monitoring & Stats

```javascript
// Get orchestrator stats
const stats = orchestrator.getStats();
console.log(stats);

// Listen to events
orchestrator.on('urlProcessed', (data) => {
  console.log(`Processed: ${data.url}`);
});

orchestrator.on('instanceCompleted', (data) => {
  console.log(`Mining complete: ${data.miningId}`);
});
```

## Troubleshooting

### Browser Won't Launch

```bash
# Ubuntu/Debian
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxdamage1

# Or run in Docker
docker run -v $(pwd):/app node:20 node /app/demo-data-mining-system.js
```

### High Memory Usage

Reduce browser pool size in config:

```json
{
  "browserPool": {
    "minBrowsers": 1,
    "maxBrowsers": 3
  }
}
```

### Slow Performance

Increase rate limiting:

```javascript
const miningId = await orchestrator.createMiningInstance({
  // ... other config
  config: {
    rateLimitMs: 3000  // 3 seconds between requests
  }
});
```

## Next Steps

- Read full documentation: `ADVANCED_DATA_MINING_README.md`
- Customize configuration: `config/data-mining-config.json`
- Create custom scrapers for your use case
- Set up automated mining schedules
- Export and analyze collected data

## Getting Help

- Check documentation in `ADVANCED_DATA_MINING_README.md`
- Review examples in demo scripts
- Examine test cases in `test-data-mining-system.js`

## Example Output

After running a mining instance, you'll get data bundles organized by topic:

```json
{
  "topic": "seo-optimization",
  "data": [
    {
      "url": "https://example.com/article",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "attributes": {
        "title": "SEO Best Practices",
        "meta_description": "Learn SEO...",
        "headings": ["Introduction", "Keywords", "Links"]
      },
      "customScraperData": {
        "seo-metadata": {
          "canonical": "https://example.com/article",
          "schemas": [...]
        }
      }
    }
  ],
  "metadata": {
    "totalRecords": 50,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

Happy Mining! 🚀
