# Advanced Data Mining Orchestration - Quick Start Guide

Get up and running with the Advanced Data Mining Orchestration System in minutes.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Running Demos](#running-demos)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Common Use Cases](#common-use-cases)

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Chrome/Chromium (for Puppeteer)

### Install Dependencies

```bash
npm install
```

This will install:
- `puppeteer` - Browser automation
- `express` - API server
- `react` and `antd` - UI components (if generating frontend)

## Basic Usage

### 1. Initialize the Orchestrator

```javascript
import AdvancedDataMiningOrchestrator from './services/advanced-datamining-orchestrator.js';

const orchestrator = new AdvancedDataMiningOrchestrator({
  headless: true,
  maxConcurrentJobs: 10,
  timeout: 30000
});
```

### 2. List Available Tools

```javascript
const tools = orchestrator.listTools();
console.log('Available tools:', tools);
```

Output:
```
Available tools: [
  {
    id: 'puppeteer-scraper',
    name: 'Puppeteer Web Scraper',
    description: 'High-performance web scraping with Chrome DevTools Protocol',
    capabilities: ['scraping', 'screenshots', 'pdf-generation', 'network-monitoring']
  },
  // ... more tools
]
```

### 3. Create a Simple Workflow

```javascript
const workflow = await orchestrator.createWorkflow({
  name: 'My First Workflow',
  description: 'Scrape a website',
  steps: [
    {
      name: 'Extract Data',
      tool: 'puppeteer-scraper',
      config: {
        url: 'https://example.com',
        selectors: {
          title: 'h1',
          content: 'p'
        }
      }
    }
  ]
});

console.log('Workflow created:', workflow.id);
```

### 4. Execute the Workflow

```javascript
const result = await orchestrator.executeWorkflow(workflow.id);
console.log('Results:', result);
```

## Running Demos

The repository includes 8 comprehensive demos:

```bash
# Run all demos (sync demos only)
node demo-advanced-datamining.js

# Run individual demos
node -e "import('./demo-advanced-datamining.js').then(m => m.demo1_ListAvailableTools())"
node -e "import('./demo-advanced-datamining.js').then(m => m.demo6_ComponentGeneration())"
```

### Available Demos

1. **demo1_ListAvailableTools** - Shows all available data mining tools
2. **demo2_SimpleWorkflow** - Basic web scraping workflow
3. **demo3_AdvancedWorkflow** - Multi-step analysis workflow
4. **demo4_HybridPatternMining** - Pattern extraction and training data
5. **demo5_CampaignManagement** - Campaign with multiple workflows
6. **demo6_ComponentGeneration** - Auto-generate React components
7. **demo7_CRUDAPI** - CRUD operations on workflows
8. **demo8_ConfigBasedComponents** - Configuration-driven component generation

## API Integration

### Start the API Server

Add to your Express app:

```javascript
import express from 'express';
import dataminingRoutes, { initializeOrchestrator } from './api/advanced-datamining-routes.js';

const app = express();
app.use(express.json());

// Initialize orchestrator
initializeOrchestrator({
  headless: true,
  db: yourDatabaseConnection
});

// Mount routes
app.use('/api/datamining', dataminingRoutes);

app.listen(3001, () => {
  console.log('API server running on port 3001');
});
```

### Make API Requests

```bash
# List tools
curl http://localhost:3001/api/datamining/tools

# Create workflow
curl -X POST http://localhost:3001/api/datamining/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Workflow",
    "steps": [{
      "name": "Scrape",
      "tool": "puppeteer-scraper",
      "config": {"url": "https://example.com"}
    }]
  }'

# Execute workflow
curl -X POST http://localhost:3001/api/datamining/workflows/WORKFLOW_ID/execute

# Get workflow
curl http://localhost:3001/api/datamining/workflows/WORKFLOW_ID

# List all workflows
curl http://localhost:3001/api/datamining/workflows
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test file
npm test test/advanced-datamining.test.js

# Run with coverage
npm run test:coverage
```

## Common Use Cases

### Use Case 1: Web Scraping

```javascript
const workflow = await orchestrator.createWorkflow({
  name: 'Product Scraper',
  steps: [{
    name: 'Scrape Products',
    tool: 'puppeteer-scraper',
    config: {
      url: 'https://example-shop.com/products',
      selectors: {
        products: '.product',
        title: '.product-title',
        price: '.product-price'
      },
      screenshot: true
    }
  }]
});

const result = await orchestrator.executeWorkflow(workflow.id);
```

### Use Case 2: Performance Analysis

```javascript
const workflow = await orchestrator.createWorkflow({
  name: 'Performance Audit',
  steps: [
    {
      name: 'Performance Metrics',
      tool: 'devtools-performance',
      config: { url: 'https://your-site.com' }
    },
    {
      name: 'Code Coverage',
      tool: 'devtools-coverage',
      config: { url: 'https://your-site.com' }
    }
  ]
});

const result = await orchestrator.executeWorkflow(workflow.id);
```

### Use Case 3: Competitor Analysis Campaign

```javascript
const campaign = await orchestrator.createCampaign({
  name: 'Competitor Analysis',
  workflows: [
    {
      name: 'Competitor A',
      steps: [{
        name: 'Analyze',
        tool: 'hybrid-pattern-miner',
        config: { url: 'https://competitor-a.com' }
      }]
    },
    {
      name: 'Competitor B',
      steps: [{
        name: 'Analyze',
        tool: 'hybrid-pattern-miner',
        config: { url: 'https://competitor-b.com' }
      }]
    }
  ]
});

const result = await orchestrator.executeCampaign(campaign.id);
```

### Use Case 4: Generate CRUD UI

```javascript
import VisualComponentGenerator from './services/visual-component-generator.js';

const generator = new VisualComponentGenerator();

const components = generator.generateComponentPackage('Product', 
  {
    list: '/api/products',
    create: '/api/products',
    update: '/api/products/:id',
    delete: '/api/products/:id',
    view: '/api/products/:id'
  },
  {
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'description', type: 'textarea' }
    ]
  }
);

// components now contains: list, create, edit, view, visualEditor, configEditor
```

### Use Case 5: Monitor Workflow Events

```javascript
orchestrator.on('workflowStarted', (workflow) => {
  console.log(`Workflow ${workflow.id} started`);
});

orchestrator.on('stepCompleted', ({ workflow, step, result }) => {
  console.log(`Step ${step} completed`);
});

orchestrator.on('workflowCompleted', (workflow) => {
  console.log(`Workflow completed with ${workflow.results.length} results`);
});

await orchestrator.executeWorkflow(workflowId);
```

## Configuration Options

### Orchestrator Configuration

```javascript
new AdvancedDataMiningOrchestrator({
  // Browser settings
  headless: true,              // Run browser in headless mode
  enablePlaywright: true,      // Enable Playwright tools
  enablePuppeteer: true,       // Enable Puppeteer tools
  
  // Chrome DevTools settings
  enableCDP: true,             // Enable Chrome DevTools Protocol
  enableLayerAnalysis: true,   // Enable layer analysis
  enablePerformanceProfiling: true,
  
  // Orchestration settings
  maxConcurrentJobs: 10,       // Max parallel workflows
  maxRetries: 3,               // Retry failed steps
  timeout: 30000,              // Default timeout (ms)
  
  // Storage
  db: databaseConnection,      // Database for persistence
  redis: redisConnection       // Redis for caching
});
```

### Component Generator Configuration

```javascript
new VisualComponentGenerator({
  framework: 'react',          // UI framework (currently react only)
  uiLibrary: 'antd',          // UI library (antd, material-ui, etc.)
  typescript: false            // Generate TypeScript code
});
```

## Troubleshooting

### Issue: Browser fails to launch

**Solution**: Ensure Puppeteer's Chromium is installed:
```bash
npx puppeteer browsers install chrome
```

### Issue: Timeout errors

**Solution**: Increase timeout in configuration:
```javascript
const orchestrator = new AdvancedDataMiningOrchestrator({
  timeout: 60000  // 60 seconds
});
```

### Issue: Memory issues

**Solution**: Limit concurrent jobs:
```javascript
const orchestrator = new AdvancedDataMiningOrchestrator({
  maxConcurrentJobs: 3
});
```

## Next Steps

1. Read the [full documentation](./ADVANCED_DATAMINING_ORCHESTRATION_README.md)
2. Explore the [research document](./PLAYWRIGHT_PUPPETEER_RESEARCH.md)
3. Check out the [demo file](./demo-advanced-datamining.js)
4. Review the [test suite](./test/advanced-datamining.test.js)
5. Integrate with your existing application

## Additional Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [API Reference](./ADVANCED_DATAMINING_ORCHESTRATION_README.md#api-endpoints)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review test examples
- Run demo scripts for reference

---

**Happy Data Mining! 🚀**
