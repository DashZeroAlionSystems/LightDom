# DeepSeek AI Integration Guide for LightDom Portfolio Management

## 🚀 Overview

This guide explains how to integrate DeepSeek AI into the LightDom platform for real-time portfolio management, automated decision-making, and blockchain optimization.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Schema-Based Workflow Configuration](#schema-based-workflow-configuration)
3. [Headless Calculation Engine](#headless-calculation-engine)
4. [DeepSeek AI Integration](#deepseek-ai-integration)
5. [API-Based Functional Step Chaining](#api-based-functional-step-chaining)
6. [Real-Time Data Streams](#real-time-data-streams)
7. [Setup and Configuration](#setup-and-configuration)
8. [Usage Examples](#usage-examples)

## 🏗️ Architecture Overview

The LightDom platform is structured into several key layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Dashboard   │  │  Analytics   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  REST API    │  │  WebSocket   │  │  GraphQL     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  DeepSeek AI │  │ Calculation  │  │  Blockchain  │     │
│  │ Integration  │  │   Engine     │  │  Automation  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                  Automation Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Workflow   │  │  Data Stream │  │    Rules     │     │
│  │   Engine     │  │  Processor   │  │   Engine     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │  Blockchain  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

- **src/ai/DeepSeekIntegration.ts** - AI integration for portfolio analysis
- **src/automation/WorkflowSchema.ts** - Schema-based workflow configuration
- **src/services/HeadlessCalculationEngine.ts** - High-performance calculations
- **src/automation/BlockchainAutomationManager.ts** - Blockchain automation orchestration
- **src/api/** - REST API endpoints for all services

## 📊 Schema-Based Workflow Configuration

### Workflow Schema Structure

Workflows are defined using declarative JSON schemas that specify:

1. **Steps** - Individual actions in the workflow
2. **Rules** - Conditional logic and validations
3. **Triggers** - When and how the workflow executes
4. **Outputs** - Where results are sent

### Example Workflow

```typescript
import { WorkflowSchema, ExampleWorkflows } from './src/automation/WorkflowSchema';

// Use pre-built workflow
const portfolioOptimization = ExampleWorkflows.portfolioOptimization;

// Or create custom workflow
const customWorkflow: WorkflowSchema = {
  id: 'my-workflow',
  name: 'Custom Portfolio Strategy',
  steps: [
    {
      id: 'fetch-data',
      type: 'data-fetch',
      config: {
        handler: 'marketDataFetcher',
        parameters: { symbols: ['BTC', 'ETH'] }
      },
      dependencies: [],
      timeout: 30000
    },
    {
      id: 'ai-analysis',
      type: 'ai-analyze',
      config: {
        handler: 'deepseekAnalyzer',
        parameters: { model: 'deepseek-chat' }
      },
      dependencies: ['fetch-data'],
      timeout: 60000
    }
  ],
  rules: [
    {
      id: 'risk-check',
      type: 'validation',
      conditions: [
        { field: 'risk.level', operator: 'lt', value: 'high' }
      ],
      actions: [
        { type: 'log', config: { level: 'info' } }
      ]
    }
  ]
};
```

### Functional Step Chaining

Each step can chain to the next by:
- Referencing previous step outputs
- Applying conditional logic
- Transform data between steps

```typescript
{
  id: 'transform-data',
  type: 'transform',
  inputs: [
    {
      name: 'rawData',
      source: 'previous-step',
      sourceId: 'fetch-data',
      transform: 'normalize'
    }
  ],
  dependencies: ['fetch-data']
}
```

## ⚡ Headless Calculation Engine

The headless calculation engine provides high-performance numerical computations:

### Features
- Multi-threaded worker pool
- Task queuing and priority management
- Result caching
- Real-time metrics

### Usage

```typescript
import HeadlessCalculationEngine from './src/services/HeadlessCalculationEngine';

// Initialize engine
const engine = new HeadlessCalculationEngine({
  maxWorkers: 8,
  enableCaching: true
});

await engine.initialize();

// Submit calculation task
const result = await engine.submitTask({
  id: 'portfolio-val-1',
  type: 'portfolio_valuation',
  inputs: {
    holdings: { BTC: 1.5, ETH: 10 },
    prices: { BTC: 45000, ETH: 2500 }
  },
  priority: 1,
  timeout: 30000
});

console.log('Portfolio Value:', result.data.totalValue);
```

### Supported Calculations

1. **Portfolio Valuation** - Calculate total portfolio value
2. **Risk Analysis** - Volatility, Sharpe ratio, VaR
3. **Portfolio Optimization** - Mean-variance optimization
4. **Market Prediction** - Simple trend-based predictions
5. **Custom** - Plugin custom calculation formulas

## 🤖 DeepSeek AI Integration

### Setup

```typescript
import DeepSeekIntegration from './src/ai/DeepSeekIntegration';

const deepseek = new DeepSeekIntegration({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  apiEndpoint: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000,
  streamingEnabled: true
});

await deepseek.initialize();
```

### Real-Time Data Stream Monitoring

```typescript
// Register a custom data stream
deepseek.registerDataStream({
  id: 'custom-stream',
  name: 'My Market Data',
  type: 'market',
  source: 'https://api.example.com/market-data',
  frequency: 30000, // 30 seconds
  status: 'paused'
});

// Start monitoring with callback
await deepseek.startStreamMonitoring('custom-stream', (feedback) => {
  console.log('AI Analysis:', feedback.analysis);
  console.log('Sentiment:', feedback.sentiment);
  console.log('Urgency:', feedback.urgency);
  
  if (feedback.actionRequired) {
    console.log('Suggested Actions:', feedback.suggestedActions);
  }
});
```

### Portfolio Analysis

```typescript
// Request comprehensive analysis
const analysis = await deepseek.analyzePortfolio({
  id: 'analysis-1',
  type: 'portfolio_optimization',
  dataStreams: ['market-data', 'portfolio-state'],
  context: {
    riskTolerance: 'moderate',
    investmentHorizon: '1year'
  },
  priority: 1,
  timestamp: new Date()
});

console.log('Insights:', analysis.insights);
console.log('Recommendations:', analysis.recommendations);
```

## 🔗 API-Based Functional Step Chaining

### Creating a Complete Workflow

```typescript
// 1. Define workflow steps as API calls
const workflowSteps = [
  {
    name: 'Fetch Market Data',
    api: '/api/data/market',
    method: 'GET',
    params: { symbols: 'BTC,ETH,SOL' }
  },
  {
    name: 'AI Analysis',
    api: '/api/ai/analyze',
    method: 'POST',
    body: {
      type: 'portfolio_optimization',
      data: '{{step1.result}}'  // Reference previous step
    }
  },
  {
    name: 'Calculate Optimal Allocation',
    api: '/api/calculate/optimize',
    method: 'POST',
    body: {
      recommendations: '{{step2.recommendations}}'
    }
  },
  {
    name: 'Execute Trades',
    api: '/api/blockchain/execute',
    method: 'POST',
    body: {
      allocation: '{{step3.allocation}}',
      slippage: 0.5
    },
    condition: '{{step3.confidence > 0.8}}'  // Conditional execution
  }
];

// 2. Execute workflow
async function executeWorkflow(steps) {
  const context = {};
  
  for (const [index, step] of steps.entries()) {
    // Replace template variables
    const processedBody = replaceTemplateVars(step.body, context);
    
    // Check condition
    if (step.condition && !evaluateCondition(step.condition, context)) {
      continue;
    }
    
    // Make API call
    const result = await fetch(step.api, {
      method: step.method,
      body: JSON.stringify(processedBody),
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json());
    
    // Store in context
    context[`step${index + 1}`] = result;
  }
  
  return context;
}
```

## 📡 Real-Time Data Streams

### Available Data Streams

1. **market-data** - Real-time cryptocurrency prices
2. **blockchain-metrics** - On-chain metrics and gas prices
3. **portfolio-state** - Current portfolio holdings and value
4. **analytics** - Calculated metrics and indicators

### Custom Stream Example

```typescript
// Create custom stream service
class CustomDataStream {
  async fetchData() {
    // Your data fetching logic
    const response = await fetch('https://your-api.com/data');
    return response.json();
  }
}

// Register with DeepSeek
deepseek.registerDataStream({
  id: 'my-custom-stream',
  name: 'Custom Trading Signals',
  type: 'analytics',
  source: 'https://your-api.com/data',
  frequency: 10000,
  status: 'paused'
});
```

## ⚙️ Setup and Configuration

### 1. Environment Variables

```bash
# .env file
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_PRIVATE_KEY=your_private_key

# Database
DATABASE_URL=postgresql://localhost:5432/lightdom
REDIS_URL=redis://localhost:6379
```

### 2. Install Dependencies

```bash
npm install axios @types/node
```

### 3. Initialize Services

```typescript
import DeepSeekIntegration from './src/ai/DeepSeekIntegration';
import HeadlessCalculationEngine from './src/services/HeadlessCalculationEngine';
import { BlockchainAutomationManager } from './src/automation/BlockchainAutomationManager';

async function initializeServices() {
  // 1. Initialize calculation engine
  const calculationEngine = new HeadlessCalculationEngine();
  await calculationEngine.initialize();
  
  // 2. Initialize DeepSeek AI
  const deepseek = new DeepSeekIntegration({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    apiEndpoint: process.env.DEEPSEEK_API_ENDPOINT!,
    model: process.env.DEEPSEEK_MODEL!,
    temperature: 0.7,
    maxTokens: 2000,
    streamingEnabled: true
  });
  await deepseek.initialize();
  
  // 3. Initialize blockchain automation
  const automation = new BlockchainAutomationManager(config);
  await automation.initialize();
  
  return { calculationEngine, deepseek, automation };
}
```

## 💡 Usage Examples

### Example 1: Real-Time Portfolio Monitoring

```typescript
// Setup real-time monitoring
const { deepseek } = await initializeServices();

// Monitor market data stream
await deepseek.startStreamMonitoring('market-data', async (feedback) => {
  console.log(`[${feedback.timestamp}] Market Update:`);
  console.log(`Sentiment: ${feedback.sentiment}`);
  console.log(`Analysis: ${feedback.analysis}`);
  
  if (feedback.urgency === 'critical' && feedback.actionRequired) {
    // Trigger automated response
    await handleCriticalAlert(feedback);
  }
});
```

### Example 2: Automated Portfolio Rebalancing

```typescript
import { ExampleWorkflows } from './src/automation/WorkflowSchema';

// Use pre-built optimization workflow
const workflow = ExampleWorkflows.portfolioOptimization;

// Execute workflow
async function rebalancePortfolio() {
  // 1. Fetch current state
  const portfolio = await getCurrentPortfolio();
  
  // 2. Get AI recommendations
  const analysis = await deepseek.analyzePortfolio({
    id: `rebalance-${Date.now()}`,
    type: 'portfolio_optimization',
    dataStreams: ['market-data', 'portfolio-state'],
    context: { currentPortfolio: portfolio },
    priority: 1,
    timestamp: new Date()
  });
  
  // 3. Calculate optimal trades
  const trades = await calculationEngine.submitTask({
    id: `calc-${Date.now()}`,
    type: 'optimization',
    inputs: {
      current: portfolio,
      target: analysis.recommendations
    },
    priority: 1,
    timeout: 30000
  });
  
  // 4. Execute if confidence is high
  if (analysis.confidence > 0.8) {
    await executeTradesOnBlockchain(trades.data);
  }
}
```

### Example 3: Custom Workflow with Rules

```typescript
// Define custom workflow with rules
const tradingWorkflow: WorkflowSchema = {
  id: 'adaptive-trading',
  name: 'Adaptive Trading Strategy',
  steps: [
    {
      id: 'fetch-signals',
      type: 'data-fetch',
      // ... step configuration
    },
    {
      id: 'ai-decision',
      type: 'ai-analyze',
      // ... AI analysis step
    }
  ],
  rules: [
    {
      id: 'volume-check',
      name: 'Minimum Volume Requirement',
      type: 'validation',
      conditions: [
        { field: 'volume', operator: 'gt', value: 1000000 }
      ],
      actions: [
        { type: 'log', config: { message: 'Volume sufficient' } }
      ],
      priority: 1,
      enabled: true
    },
    {
      id: 'risk-limit',
      name: 'Risk Exposure Limit',
      type: 'decision',
      conditions: [
        { field: 'portfolio.exposure', operator: 'gt', value: 0.7 }
      ],
      actions: [
        { type: 'trigger-workflow', config: { workflowId: 'reduce-exposure' } }
      ],
      priority: 2,
      enabled: true
    }
  ],
  triggers: [
    {
      type: 'schedule',
      config: { schedule: '*/15 * * * *' }, // Every 15 minutes
      enabled: true
    }
  ]
};
```

## 🎯 Best Practices

1. **Use Schema Validation** - Always validate workflows before execution
2. **Monitor Performance** - Track calculation metrics and AI response times
3. **Implement Circuit Breakers** - Prevent cascading failures
4. **Cache Aggressively** - Cache calculation results and AI responses
5. **Handle Errors Gracefully** - Implement retry logic and fallbacks
6. **Test Workflows** - Use dry-run mode before production
7. **Monitor Costs** - Track AI API usage and blockchain gas costs
8. **Secure Credentials** - Never commit API keys or private keys

## 📚 Additional Resources

- [DeepSeek API Documentation](https://deepseek.com/docs)
- [Workflow Schema Reference](./src/automation/WorkflowSchema.ts)
- [Calculation Engine API](./src/services/HeadlessCalculationEngine.ts)
- [AI Integration Guide](./src/ai/DeepSeekIntegration.ts)

## 🔧 Troubleshooting

### Common Issues

1. **DeepSeek API Connection Failed**
   - Check API key validity
   - Verify endpoint URL
   - Check network connectivity

2. **Calculation Engine Timeout**
   - Increase worker count
   - Reduce calculation complexity
   - Enable result caching

3. **Workflow Validation Errors**
   - Check for circular dependencies
   - Validate step configurations
   - Ensure all required fields are present

### Getting Help

For issues or questions:
1. Check the troubleshooting section
2. Review example workflows
3. Check API logs for detailed error messages
4. Contact support with workflow schema and error logs

---

**Built with ❤️ by the LightDom Team**
# DeepSeek System Integration Guide

Complete guide for using the DeepSeek AI-powered workflow automation system with all integrated components.

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [API Reference](#api-reference)
5. [React UI Components](#react-ui-components)
6. [Complete Examples](#complete-examples)
7. [Integration Patterns](#integration-patterns)
8. [Best Practices](#best-practices)

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

```bash
# Required
DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional
GITHUB_TOKEN=your_github_token
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
```

### Basic Usage

```typescript
import { DeepSeekSystemIntegrator } from './src/services/deepseek-system-integrator';

const integrator = new DeepSeekSystemIntegrator({
  githubToken: process.env.GITHUB_TOKEN,
  n8nApiUrl: process.env.N8N_API_URL,
  n8nApiKey: process.env.N8N_API_KEY,
  enableAutoTraining: true,
  enableAutoAPI: true,
  enableRouteHistory: true
});

// Create and deploy a workflow
const result = await integrator.createAndDeployWorkflow(
  'SEO campaign: crawl site, analyze content, generate recommendations'
);
```

## System Architecture

### Component Hierarchy

```
DeepSeekSystemIntegrator (Orchestration Layer)
├── WorkflowOrchestrator (Workflow Execution)
├── SchemaGenerator (Schema Generation)
├── DeepSeekPromptEngine (AI Prompts)
├── GitStateManager (Version Control)
├── N8NIntegrationService (N8N Workflows)
├── GitHubPatternMiningService (Pattern Learning)
├── ServiceInstantiationEngine (Service Simulation)
├── DeepSeekPatternTrainingService (AI Training)
├── ModelTrainingConfigService (Training Config)
├── MCPAutoAPIService (Auto-API Generation)
└── RouteHistoryMiningService (Route Analytics)
```

### Data Flow

```
Natural Language → DeepSeek AI → Workflow/Schema/Component
                                          ↓
                                    Execution Engine
                                          ↓
                        ┌─────────────────┼─────────────────┐
                        ↓                 ↓                 ↓
                   Git State          N8N Workflow    Route History
                                          ↓
                                    Live Monitoring
```

## Core Features

### 1. Workflow Automation

**Generate workflows from natural language:**

```typescript
const workflow = await integrator.createAndDeployWorkflow(
  'Data pipeline: extract from API, transform data, load to database',
  {
    generateSchema: true,
    createN8N: true,
    trackRoutes: true
  }
);
```

**Features:**
- Natural language to workflow conversion
- Dependency resolution
- Parallel task execution
- Error handling with retry
- Real-time monitoring
- State persistence

### 2. Schema Generation

**Auto-generate schemas with relationships:**

```typescript
const api = await integrator.generateCompleteAPI(
  'E-commerce with User, Product, Order, Payment',
  'shop-api'
);

// Returns:
// - schemas: Array of JSON schemas
// - schemaMap: Relationships between entities
// - api: CRUD endpoints
// - bundle: Unified API
```

**Features:**
- Natural language to JSON Schema
- Relationship detection
- Validation rules
- GraphQL/Database schema support
- Schema map generation

### 3. GitHub Pattern Mining

**Learn from existing projects:**

```typescript
const patterns = await integrator.learnFromGitHub(
  [
    { owner: 'facebook', repo: 'react' },
    { owner: 'vercel', repo: 'next.js' }
  ],
  'modern-react-app'
);

// Returns:
// - patterns: Detected architecture patterns
// - template: Generated project template
// - training: DeepSeek training results
// - project: Generated project structure
```

**Features:**
- Folder structure analysis
- Architecture pattern detection (MVC, microservices, monorepo)
- Naming convention detection
- Template generation
- DeepSeek training

### 4. Service Instantiation

**Simulate services in real-time:**

```typescript
const result = await integrator.simulateService(
  {
    name: 'API Server',
    type: 'rest-api',
    dataStreams: [{
      source: 'client',
      destination: 'database',
      enrichment: [
        { attribute: 'metadata', source: 'api' }
      ]
    }]
  },
  60000 // 60 seconds
);

// Returns:
// - instance: Service instance details
// - data: Recorded data messages
```

**Features:**
- Real-time process simulation
- Configurable data rates (1-100+ msg/sec)
- Multi-source data enrichment
- Data stream linking
- Service bundling

### 5. SEO Campaign Automation

**Complete SEO workflow:**

```typescript
const seo = await integrator.runSEOCampaign(
  'https://example.com',
  ['react', 'javascript', 'web development']
);

// Returns:
// - workflow: SEO workflow definition
// - schemas: SEO data structures
// - execution: Campaign execution status
// - routes: Route usage patterns
// - recommendations: SEO recommendations
```

**Features:**
- Automated site crawling
- SEO analysis
- Schema.org markup
- Core Web Vitals monitoring
- Recommendation generation

### 6. MCP Auto-API

**Auto-generate CRUD APIs:**

```typescript
const crud = await mcpAPI.generateCRUDAPI(schema);

// Generates:
// POST /entity - Create
// GET /entity - List all
// GET /entity/:id - Get one
// PUT /entity/:id - Update
// DELETE /entity/:id - Delete
```

**Bundle multiple services:**

```typescript
const bundle = await mcpAPI.bundleServicesAPI(
  'ecommerce',
  [userSchema, productSchema, orderSchema],
  {
    includeRelationships: true,
    addWebhooks: true
  }
);

// Creates unified API with:
// - All CRUD endpoints
// - Relationship endpoints
// - Webhook management
// - Schema navigation
```

### 7. Model Training

**Train DeepSeek on your data:**

```typescript
const config = trainingConfig.getTrainingConfig();

// Training sources (weighted):
// - Database tables (40%)
// - Codebase (30%)
// - API routes (20%)
// - Workflow history (10%)
```

**Memory configuration:**

```typescript
const memory = trainingConfig.getMemoryConfig();

// Returns:
// - shortTerm: 1000 items, 1hr retention
// - longTerm: PostgreSQL + vector store
// - workingMemory: 8k context
```

## API Reference

### DeepSeek Workflows API

**Base URL:** `/api/deepseek`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/config` | GET/PUT | Configuration management |
| `/templates` | GET | List prompt templates |
| `/schema/generate` | POST | Generate schema from NL |
| `/schema/map/generate` | POST | Generate schema map |
| `/workflow/generate` | POST | Generate workflow from NL |
| `/workflow/:id/execute` | POST | Execute workflow |
| `/workflow/:id` | GET | Get workflow details |
| `/workflows` | GET | List all workflows |
| `/execution/:id` | GET | Get execution status |
| `/executions` | GET | List all executions |
| `/state/history/:type/:id` | GET | Get state history |
| `/state/rollback` | POST | Rollback to commit |
| `/state/tag` | POST | Create snapshot tag |
| `/health` | GET | System health |

### Pattern Mining API

**Base URL:** `/api/pattern-mining`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/repository/mine` | POST | Mine GitHub repo |
| `/template/generate` | POST | Generate template |
| `/templates` | GET | List templates |
| `/instantiate` | POST | Instantiate service |
| `/simulate/:id` | POST | Start simulation |
| `/simulate/:id/stop` | POST | Stop simulation |
| `/bundle` | POST | Bundle services |
| `/instances` | GET | List instances |
| `/train-pattern` | POST | Train DeepSeek |
| `/generate-project` | POST | Generate project |

### Advanced Config API

**Base URL:** `/api/config` and `/api/mcp`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/config/training` | GET | Training configuration |
| `/config/project-status/:id` | GET | Project health metrics |
| `/config/templates` | GET | Default templates |
| `/config/campaign-defaults/:type` | GET | Campaign defaults |
| `/config/memory` | GET | Memory configuration |
| `/mcp/generate-crud` | POST | Generate CRUD API |
| `/mcp/bundle-api` | POST | Bundle services |
| `/mcp/bundles` | GET | List bundles |
| `/route-mining/simulate-workflow` | POST | Simulate workflow |
| `/route-mining/history` | GET | Route history |
| `/route-mining/patterns` | GET | Extracted patterns |
| `/route-mining/defaults` | GET | Compiled defaults |

## React UI Components

### DeepSeekWorkflowDashboard

Complete dashboard for managing workflows, schemas, and executions.

```tsx
import { DeepSeekWorkflowDashboard } from './components/DeepSeekWorkflowDashboard';

function App() {
  return <DeepSeekWorkflowDashboard />;
}
```

**Features:**
- Workflow management (create, execute, view)
- Schema visualization
- Execution monitoring
- Timeline view
- System health status
- Real-time statistics

## Complete Examples

See `deepseek-complete-examples.js` for 10 comprehensive examples:

1. **E-commerce Project Generation** - Learn from repos, generate project
2. **Auto-Generate API** - Complete CRUD API with schemas
3. **SEO Campaign** - Automated SEO workflow
4. **Service Simulation** - Real-time service data
5. **End-to-End Workflow** - Complete workflow with N8N
6. **Multi-Repo Learning** - Learn from multiple repos
7. **Data Mining Pipeline** - Automated data pipeline
8. **System Health** - Monitor system status
9. **Comprehensive Workflow** - API + Workflow + SEO
10. **Complete Lifecycle** - Full project lifecycle

**Run all examples:**

```bash
node deepseek-complete-examples.js
```

## Integration Patterns

### Pattern 1: API-First Development

```typescript
// 1. Generate API from description
const api = await integrator.generateCompleteAPI(
  'Blog with User, Post, Comment',
  'blog-api'
);

// 2. Create workflows for the API
const workflows = await integrator.createAndDeployWorkflow(
  'Content pipeline: create post, moderate, publish, notify'
);

// 3. Monitor and optimize
const seo = await integrator.runSEOCampaign(
  'https://blog.example.com',
  ['blogging']
);
```

### Pattern 2: Learning-Driven Development

```typescript
// 1. Learn from successful projects
const patterns = await integrator.learnFromGitHub(
  [{ owner: 'vercel', repo: 'next.js' }],
  'nextjs-app'
);

// 2. Generate new project using learned patterns
// Project automatically includes best practices

// 3. Customize and extend
const customWorkflow = await integrator.createAndDeployWorkflow(
  'Add payment processing to project'
);
```

### Pattern 3: Continuous Optimization

```typescript
// 1. Simulate service to collect data
const simulation = await integrator.simulateService(config, 60000);

// 2. Analyze routes and patterns
const routes = await routeMining.extractPatterns();

// 3. Generate optimizations
const optimizations = routes.recommendations;

// 4. Apply and test
const workflow = await integrator.createAndDeployWorkflow(
  `Optimize based on: ${optimizations.join(', ')}`
);
```

## Best Practices

### 1. Configuration Management

```typescript
// Use environment variables
const integrator = new DeepSeekSystemIntegrator({
  githubToken: process.env.GITHUB_TOKEN,
  enableAutoTraining: process.env.NODE_ENV === 'production'
});
```

### 2. Error Handling

```typescript
try {
  const result = await integrator.createAndDeployWorkflow(description);
} catch (error) {
  console.error('Workflow failed:', error);
  // Rollback if needed
  await stateManager.rollbackToCommit(lastGoodCommit);
}
```

### 3. Monitoring

```typescript
// Check system health regularly
const health = integrator.getSystemHealth();
if (!health.services.orchestrator) {
  console.warn('Orchestrator offline');
}
```

### 4. State Management

```typescript
// Save state frequently
await stateManager.saveWorkflowState(workflowId, data);

// Create snapshots at milestones
await stateManager.createTag(workflowId, 'v1.0-stable');
```

### 5. Performance

```typescript
// Use simulation for testing
const testResult = await integrator.simulateService(config, 10000);

// Validate before production
if (testResult.data.length > 0) {
  // Deploy to production
}
```

## Troubleshooting

### Common Issues

1. **GitHub rate limiting**
   - Use authentication token
   - Implement caching
   - Batch requests

2. **DeepSeek API errors**
   - Check API key validity
   - Monitor rate limits
   - Implement retry logic

3. **Workflow timeouts**
   - Increase timeout values
   - Split into smaller tasks
   - Enable parallel execution

4. **Memory issues**
   - Configure memory limits
   - Enable compression
   - Use streaming for large datasets

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Documentation: See individual README files
- Examples: `deepseek-complete-examples.js`

## License

MIT
