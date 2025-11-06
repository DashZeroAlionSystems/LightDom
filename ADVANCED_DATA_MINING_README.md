# Advanced Data Mining & Headless Browser System

## Overview

This comprehensive data mining system provides enterprise-grade capabilities for large-scale web data extraction using headless browsers (Puppeteer/Playwright). The system features automated URL discovery, schema-driven workflows, 3D layer scraping, and AI-powered decision making through DeepSeek integration.

## Architecture

### Core Components

1. **Headless Browser Pool** (`services/headless-browser-pool.js`)
   - Manages multiple browser instances for parallel processing
   - Automatic scaling based on workload
   - Health monitoring and auto-recovery
   - Support for both Puppeteer and Playwright

2. **Data Mining Orchestrator** (`services/data-mining-orchestrator.js`)
   - Coordinates multiple mining instances
   - Manages custom scrapers and 3D layer scraping
   - Topic-based data bundling
   - Real-time progress monitoring

3. **Schema Workflow Generator** (`services/schema-workflow-generator.js`)
   - Creates mining workflows from schemas
   - Knowledge graph generation
   - AI-powered schema creation via DeepSeek
   - Workflow simulation and validation

4. **URL Seeding Service** (`services/url-seeding-service.js`)
   - Automated URL discovery by topic
   - Backlink network mapping
   - Multi-strategy search algorithms
   - Related URL discovery

## Key Features

### 🔍 Multi-Browser Support
- **Puppeteer**: High-performance Chrome/Chromium automation
- **Playwright**: Cross-browser support (Chrome, Firefox, Safari)
- Dynamic browser selection based on requirements

### 🌐 URL Discovery & Seeding
- **Topic-based Discovery**: Automatically find URLs related to topics
- **Search Algorithms**: Keyword, similarity, authority, and topic-based
- **Backlink Mapping**: Build relationship networks between URLs
- **Quality Scoring**: Automatic relevance and quality assessment

### 🎨 3D Layer Scraping
- **Chrome DevTools Integration**: Layer Tree API access
- **Compositing Analysis**: Identify layer compositing reasons
- **3D Transform Extraction**: Capture transform matrices and z-index
- **Visual Hierarchy**: Build 3D DOM structure models

### 🤖 Custom Scraper Framework
Built-in scrapers:
- **seo-metadata**: Extract titles, meta tags, schema.org markup
- **performance-metrics**: Measure load time, TTFB, resources
- **accessibility**: Analyze headings, images, links, forms
- **3d-layer-scraper**: Extract layer tree and 3D context

### 📊 Schema-Driven Workflows
- **Template System**: Pre-built schemas for common scenarios
- **AI Generation**: Create schemas from natural language
- **Knowledge Graphs**: Visual workflow representation
- **Pipeline Automation**: Multi-step workflow execution

### 🗂️ Data Bundling & Organization
- **Topic-based Bundling**: Group data by topic/subject
- **Attribute Grouping**: Organize by extracted attributes
- **Multiple Formats**: Export as JSON, CSV, JSONL
- **Metadata Inclusion**: Complete provenance tracking

## Getting Started

### Installation

```bash
# Ensure dependencies are installed
npm install puppeteer
npm install playwright  # Optional, for cross-browser support
```

### Basic Configuration

Create or edit `config/data-mining-config.json`:

```json
{
  "browserPool": {
    "minBrowsers": 2,
    "maxBrowsers": 10,
    "browserType": "puppeteer"
  },
  "orchestrator": {
    "maxConcurrentInstances": 5,
    "enableURLSeeding": true,
    "enable3DLayerScraping": true
  }
}
```

### Quick Start Example

```javascript
import DataMiningOrchestrator from './services/data-mining-orchestrator.js';

// Initialize orchestrator
const orchestrator = new DataMiningOrchestrator();
await orchestrator.initialize();

// Create a mining instance
const miningId = await orchestrator.createMiningInstance({
  name: 'SEO Content Mining',
  topic: 'seo-optimization',
  seedUrls: ['https://moz.com/blog'],
  attributes: [
    {
      name: 'title',
      selector: 'h1',
      dataType: 'text',
      priority: 10
    }
  ],
  customScrapers: ['seo-metadata'],
  enableAutoSeeding: true
});

// Start mining
await orchestrator.startMiningInstance(miningId);
```

## Usage Examples

### 1. Template-Based Mining

```javascript
import SchemaWorkflowGenerator from './services/schema-workflow-generator.js';

const generator = new SchemaWorkflowGenerator();

// Generate from template
const schemaId = generator.generateSchemaFromTemplate('seo-content-mining');

// Create knowledge graph
const graphId = generator.createKnowledgeGraph(schemaId);

// Generate workflow
const workflowId = generator.generateWorkflowConfig(schemaId, graphId);

// Execute workflow
await generator.executeWorkflow(workflowId, ['https://example.com']);
```

### 2. AI-Powered Schema Generation

```javascript
const prompt = `
  Mine e-commerce product pages for:
  - Product names and descriptions
  - Prices and availability
  - Customer reviews and ratings
  - Images and specifications
`;

const schemaId = await generator.generateSchemaFromPrompt(prompt);
```

### 3. Custom Scraper Registration

```javascript
orchestrator.registerCustomScraper('social-metrics', async (page, url) => {
  return await page.evaluate(() => {
    return {
      shares: document.querySelector('.share-count')?.textContent,
      likes: document.querySelector('.like-count')?.textContent,
      comments: document.querySelector('.comment-count')?.textContent
    };
  });
});
```

### 4. URL Seeding by Topic

```javascript
import { URLSeedingService } from './services/url-seeding-service.js';

const seeding = new URLSeedingService();
await seeding.start();

// Discover URLs for a topic
const urls = await seeding.discoverURLsByTopic('react-development', {
  maxUrls: 50,
  minQuality: 0.7
});
```

### 5. 3D Layer Scraping

```javascript
const miningId = await orchestrator.createMiningInstance({
  name: 'UI Pattern Mining with 3D Layers',
  topic: 'ui-components',
  enable3DLayer: true,
  attributes: [
    { name: 'components', selector: '[data-component]' }
  ]
});
```

## Configuration Reference

### Browser Pool Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minBrowsers` | number | 2 | Minimum browsers in pool |
| `maxBrowsers` | number | 10 | Maximum browsers in pool |
| `maxPagesPerBrowser` | number | 5 | Pages per browser limit |
| `browserType` | string | 'puppeteer' | Browser type ('puppeteer' or 'playwright') |
| `autoScale` | boolean | true | Enable auto-scaling |
| `enableGPU` | boolean | false | Enable GPU acceleration |
| `headless` | boolean | true | Run in headless mode |

### Orchestrator Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxConcurrentInstances` | number | 5 | Max parallel mining instances |
| `enableURLSeeding` | boolean | true | Enable URL discovery |
| `enable3DLayerScraping` | boolean | true | Enable 3D layer scraping |
| `enableCustomScrapers` | boolean | true | Enable custom scrapers |

### URL Seeding Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSeedsPerInstance` | number | 1000 | Maximum seeds per instance |
| `searchDepth` | number | 3 | Search depth for discovery |
| `minBacklinkQuality` | number | 0.5 | Minimum backlink quality (0-1) |
| `enableSearchAlgorithms` | boolean | true | Enable search algorithms |

## Schema Templates

### Available Templates

1. **seo-content-mining**
   - SEO-optimized content extraction
   - Meta tags, structured data, headings
   - Perfect for blog posts and articles

2. **e-commerce-product-mining**
   - Product data extraction
   - Prices, descriptions, reviews, images
   - Ideal for product catalogs

3. **ui-pattern-mining**
   - UI component extraction
   - 3D layer analysis enabled
   - Design system analysis

4. **content-analysis-mining**
   - General content extraction
   - Text, media, links, structure
   - Versatile for various content types

## Data Mining Workflow

### Workflow Pipeline

1. **Initialize Services**
   - Browser pool setup
   - Service configuration
   - Health checks

2. **URL Seeding** (if enabled)
   - Topic-based discovery
   - Search algorithm execution
   - Backlink analysis

3. **Data Mining**
   - URL processing in parallel
   - Attribute extraction
   - Custom scraper execution

4. **3D Layer Analysis** (if enabled)
   - Layer tree capture
   - Transform extraction
   - Compositing analysis

5. **Data Bundling**
   - Topic-based grouping
   - Attribute organization
   - Metadata inclusion

6. **Export**
   - Format conversion
   - Compression
   - Storage

## SEO & DevTools Data Mining

### SEO Capabilities

The system can extract comprehensive SEO data:

- **Meta Information**: Titles, descriptions, keywords
- **Structured Data**: JSON-LD, Schema.org markup
- **Open Graph**: Social media metadata
- **Performance**: Page speed, load times, TTFB
- **Accessibility**: ARIA labels, alt text, heading structure
- **Links**: Internal/external link analysis

### DevTools Integration

Access to Chrome DevTools Protocol enables:

- **Performance Monitoring**: Timeline, metrics, profiling
- **Network Analysis**: Request/response capture
- **Coverage Analysis**: Unused CSS/JS detection
- **Console Monitoring**: Error and warning capture
- **Layer Tree**: 3D rendering analysis

## Knowledge Graphs

### Structure

Knowledge graphs represent workflow structure:

- **Nodes**: Attributes, scrapers, services, workflows
- **Edges**: Relationships (feeds_into, executes_in, provides_urls, enhances)
- **Metadata**: Configuration, priorities, options

### Generation

```javascript
// Create from schema
const graphId = generator.createKnowledgeGraph(schemaId);

// Access graph structure
const graph = generator.getKnowledgeGraph(graphId);
console.log(`Nodes: ${graph.nodes.length}`);
console.log(`Edges: ${graph.edges.length}`);

// Export to JSON
const json = generator.exportKnowledgeGraph(graphId);
```

## DeepSeek Integration

### Configuration

```json
{
  "deepSeek": {
    "enabled": true,
    "apiKey": "${DEEPSEEK_API_KEY}",
    "enableSchemaGeneration": true,
    "enableWorkflowSimulation": true,
    "temperature": 0.7
  }
}
```

### Usage

```javascript
// Generate schema from prompt
const schemaId = await generator.generateSchemaFromPrompt(
  "Mine product reviews focusing on sentiment and rating analysis"
);

// Simulate workflow with AI
const simulation = await generator.simulateWorkflow(workflowId);
```

## Performance & Scaling

### Auto-Scaling

The browser pool automatically scales based on:
- Pool utilization (> 80% triggers scale up)
- Low utilization (< 20% triggers scale down)
- Respects min/max browser limits
- Monitors health and recovers failed browsers

### Resource Management

- **Page Pooling**: Reuse pages when possible
- **Idle Timeout**: Close inactive pages (default 5 min)
- **Health Checks**: Regular browser health monitoring
- **Error Recovery**: Automatic restart of failed browsers

## Monitoring & Metrics

### Available Metrics

```javascript
const stats = orchestrator.getStats();
// {
//   activeInstances: 2,
//   completedInstances: 5,
//   totalURLsProcessed: 150,
//   totalDataMined: 750,
//   browserPoolStats: {...}
// }
```

### Event System

```javascript
orchestrator.on('instanceCreated', (data) => {
  console.log(`New instance: ${data.miningId}`);
});

orchestrator.on('urlProcessed', (data) => {
  console.log(`Processed: ${data.url}`);
});

orchestrator.on('instanceCompleted', (data) => {
  console.log(`Completed: ${data.miningId}`);
});
```

## Error Handling

### Retry Mechanism

```json
{
  "errorHandling": {
    "maxRetries": 3,
    "retryDelay": 5000,
    "continueOnError": true,
    "logErrors": true
  }
}
```

### Recovery Strategies

- Automatic browser restart on failure
- Page-level error isolation
- Task retry with exponential backoff
- Graceful degradation for non-critical failures

## Best Practices

### 1. Browser Pool Sizing
- Start with small pool (2-5 browsers)
- Enable auto-scaling for dynamic workloads
- Monitor resource usage (CPU, memory)

### 2. URL Seeding
- Use quality thresholds (>= 0.7 recommended)
- Limit seed count to avoid overwhelming system
- Enable backlink analysis for network mapping

### 3. Custom Scrapers
- Keep scraper logic lightweight
- Handle errors gracefully
- Return structured data
- Use page.evaluate() for DOM access

### 4. Schema Design
- Start with templates when possible
- Use AI generation for complex requirements
- Validate schemas before execution
- Test with small URL sets first

### 5. Data Organization
- Enable topic bundling for better organization
- Include metadata for provenance
- Use compression for large datasets
- Regular export to prevent data loss

## Troubleshooting

### Common Issues

**Browser fails to launch:**
```bash
# Install missing dependencies
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxdamage1
```

**High memory usage:**
- Reduce `maxBrowsers` and `maxPagesPerBrowser`
- Enable idle timeout
- Close pages after use

**Slow performance:**
- Increase `rateLimitMs` to reduce server load
- Enable browser pool auto-scaling
- Use more specific selectors

## API Reference

See individual service files for detailed API documentation:
- `services/headless-browser-pool.js`
- `services/data-mining-orchestrator.js`
- `services/schema-workflow-generator.js`
- `services/url-seeding-service.js`

## Examples

Run the comprehensive demo:

```bash
node advanced-data-mining-demo.js
```

This demonstrates all features including:
- Template-based mining
- AI schema generation
- URL seeding
- Custom scrapers
- 3D layer scraping
- Knowledge graphs
- Data bundling

## Contributing

When adding new features:
1. Update relevant service files
2. Add tests
3. Update this documentation
4. Add examples to demo file

## License

See main project LICENSE file.
