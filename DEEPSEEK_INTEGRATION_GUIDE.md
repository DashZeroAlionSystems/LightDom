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
