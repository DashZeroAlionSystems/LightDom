# Campaign Web Crawler Workers - Real-Time Data Mining with LLM Integration

## Overview

The Campaign Web Crawler Worker system extends the campaign orchestration platform with containerized, headless web crawlers that support:

- **Real-time data streaming** for visual components and analytics
- **Two-way communication** for live configuration updates
- **Schema-based LLM integration** for AI-powered data mining
- **Virtual simulations** for self-improvement
- **Container isolation** for parallel campaign execution

## Architecture

```
Campaign
    ↓
Container Manager
    ↓
[Container 1] [Container 2] [Container 3]
    ↓              ↓              ↓
[Worker 1-1]   [Worker 2-1]   [Worker 3-1]
[Worker 1-2]   [Worker 2-2]   [Worker 3-2]
    ↓              ↓              ↓
Real-time Data Stream ← → LLM Tools
    ↓
Aggregated Analytics
```

## Components

### 1. CampaignWebCrawlerWorker

**Purpose**: Headless web crawler that executes attribute-based data mining with real-time capabilities.

**Key Features**:
- Headless Chrome operation via Puppeteer
- 8 mining algorithms (DOM, meta, link, image, SEO, performance, event, computed)
- Real-time data streaming
- Two-way communication for config updates
- Schema-driven extraction
- LLM tool registration
- Virtual simulation support

**Example Usage**:
```javascript
import CampaignWebCrawlerWorker from './services/campaign-web-crawler-worker.js';

// Create worker
const worker = new CampaignWebCrawlerWorker({
  headless: true,
  realTimeStreaming: true,
  enableSimulation: true
});

// Initialize with mining instance
await worker.initialize(miningId);

// Subscribe to real-time data
worker.subscribe((data) => {
  console.log('Real-time data:', data);
});

// Send config update
worker.emit('configUpdate', {
  type: 'rate_limit',
  value: 1500
});

// Start crawling
await worker.start();

// Get status
const status = worker.getStatus();
```

### 2. CampaignContainerManager

**Purpose**: Manages containerized worker instances with LLM integration and simulation environments.

**Key Features**:
- Container lifecycle management
- Worker orchestration
- Real-time data aggregation
- Schema plugin system for LLM configuration
- Simulation environment creation
- Two-way communication hub

**Example Usage**:
```javascript
import CampaignContainerManager from './services/campaign-container-manager.js';

// Create manager
const manager = new CampaignContainerManager({
  maxContainers: 20,
  enableLLMIntegration: true
});

// Create container for campaign
const container = await manager.createContainer(campaignId);

// Spawn workers
const worker1 = await manager.spawnWorker(container.containerId);
const worker2 = await manager.spawnWorker(container.containerId);

// Subscribe to aggregated data
manager.subscribeToAggregatedData((data, containerId) => {
  console.log('Aggregated data from', containerId, ':', data);
});

// Get LLM configuration
const llmConfig = manager.getLLMConfiguration(container.containerId);
console.log('LLM Tools:', llmConfig.tools);

// Start container (starts all workers)
await manager.startContainer(container.containerId);
```

## Real-Time Data Streaming

Workers emit data in real-time as they extract information:

```javascript
// Worker data stream events
worker.on('dataExtracted', (data) => {
  console.log('Extracted:', data);
  // {
  //   attribute_id: 'attr_123',
  //   attribute_name: 'page_title',
  //   value: 'Example Product Page',
  //   url: 'https://example.com/product/1',
  //   timestamp: '2025-11-04T20:00:00.000Z',
  //   extraction_time_ms: 45,
  //   is_valid: true
  // }
});

// Subscribe to stream
const unsubscribe = worker.subscribe((data) => {
  // Process real-time data
  updateDashboard(data);
  sendToAnalytics(data);
  feedToLLM(data);
});
```

## Two-Way Communication

Configuration can be updated in real-time:

```javascript
// Update rate limit on the fly
worker.emit('configUpdate', {
  type: 'rate_limit',
  value: 2000 // ms
});

// Update attribute configuration
worker.emit('configUpdate', {
  type: 'attribute_config',
  attributeId: 'attr_123',
  config: {
    enabled: true,
    options: {
      max_length: 500,
      trim_whitespace: true
    }
  }
});

// Listen for applied updates
worker.on('configApplied', (update) => {
  console.log('Config applied:', update);
});
```

## LLM Integration

### Schema Plugins

Schemas are automatically registered as LLM tools:

```javascript
// Get LLM configuration for a container
const llmConfig = manager.getLLMConfiguration(containerId);

// llmConfig.tools contains:
[
  {
    type: 'function',
    function: {
      name: 'extract_page_title',
      description: 'Extract page title from web page',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to extract data from' },
          enabled: { type: 'boolean', default: true },
          max_length: { type: 'number', default: 200 }
        },
        required: ['url']
      }
    }
  },
  // ... more tools
]

// llmConfig.systemPrompt contains:
"You are a data mining AI assistant with access to 12 specialized tools..."
```

### Using with LLM

```javascript
// Configure LLM (e.g., OpenAI)
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: llmConfig.systemPrompt },
    { role: 'user', content: 'Extract product data from https://shop.example.com' }
  ],
  tools: llmConfig.tools
});

// LLM can call the registered extraction functions
```

## Virtual Simulations

Test different configurations in isolation:

```javascript
// Create simulation environment
const simEnv = await manager.createSimulationEnvironment(campaignId, [
  {
    id: 'faster_rate',
    config: { rate_limit_ms: 500 }
  },
  {
    id: 'slower_rate',
    config: { rate_limit_ms: 3000 }
  },
  {
    id: 'deeper_crawl',
    config: { max_depth: 5 }
  }
]);

// Run simulation
const results = await manager.runSimulation(simEnv.envId);

// Compare results
results.forEach(result => {
  console.log(`Scenario: ${result.scenarioId}`);
  console.log(`Data extracted: ${result.dataExtracted}`);
  console.log(`Success rate: ${result.stats.successRate}%`);
});

// Worker can also self-improve
await worker.runSimulation('faster_rate');
await worker.learnFromSimulations();
```

## API Endpoints

All endpoints are prefixed with `/api/workers`

### Container Management

#### Create Container
```http
POST /api/workers/containers/create
Content-Type: application/json

{
  "campaignId": "campaign_123",
  "config": {
    "maxWorkers": 5,
    "isolation": "process"
  }
}
```

#### Spawn Worker
```http
POST /api/workers/containers/{containerId}/spawn
Content-Type: application/json

{
  "config": {
    "headless": true,
    "realTimeStreaming": true
  }
}
```

#### Start Container
```http
POST /api/workers/containers/{containerId}/start
```

#### Stop Container
```http
POST /api/workers/containers/{containerId}/stop
```

#### Get Container Status
```http
GET /api/workers/containers/{containerId}/status
```

#### List Containers
```http
GET /api/workers/containers
```

### LLM Integration

#### Get LLM Configuration
```http
GET /api/workers/containers/{containerId}/llm-config
```

Response:
```json
{
  "success": true,
  "llmConfig": {
    "tools": [...],
    "metadata": [...],
    "systemPrompt": "...",
    "capabilities": ["extract_content", "extract_seo", ...]
  }
}
```

### Real-Time Communication

#### Send Config Update
```http
POST /api/workers/containers/{containerId}/config-update
Content-Type: application/json

{
  "workerId": "worker_123",
  "update": {
    "type": "rate_limit",
    "value": 2000
  }
}
```

#### Real-Time Data Stream (SSE)
```http
GET /api/workers/containers/{containerId}/data-stream
```

Response (Server-Sent Events):
```
data: {"type":"extraction","workerId":"worker_123","data":{...}}

data: {"type":"metrics","workerId":"worker_123","stats":{...}}
```

### Simulation

#### Create Simulation Environment
```http
POST /api/workers/simulation/create
Content-Type: application/json

{
  "campaignId": "campaign_123",
  "scenarios": [
    {
      "id": "fast",
      "config": { "rate_limit_ms": 500 }
    },
    {
      "id": "slow",
      "config": { "rate_limit_ms": 3000 }
    }
  ]
}
```

#### Run Simulation
```http
POST /api/workers/simulation/{envId}/run
```

#### Destroy Container
```http
DELETE /api/workers/containers/{containerId}
```

## Use Cases

### 1. Real-Time SEO Monitoring

```javascript
// Create container for SEO campaign
const container = await fetch('/api/workers/containers/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ campaignId: seo_campaign_id })
}).then(r => r.json());

// Spawn workers
await fetch(`/api/workers/containers/${container.container.containerId}/spawn`, {
  method: 'POST'
});

// Subscribe to real-time data stream
const eventSource = new EventSource(`/api/workers/containers/${container.container.containerId}/data-stream`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'extraction') {
    updateSEODashboard(data.data);
  } else if (data.type === 'metrics') {
    updatePerformanceMetrics(data.stats);
  }
};

// Start mining
await fetch(`/api/workers/containers/${container.container.containerId}/start`, {
  method: 'POST'
});
```

### 2. AI-Powered Question Answering

```javascript
// Get LLM configuration
const llmConfig = await fetch(`/api/workers/containers/${containerId}/llm-config`)
  .then(r => r.json());

// Use with OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: llmConfig.llmConfig.systemPrompt },
    { role: 'user', content: 'What are the meta descriptions on our competitor sites?' }
  ],
  tools: llmConfig.llmConfig.tools
});

// LLM will call extract_meta_description tools on competitor URLs
```

### 3. Self-Improving Campaigns

```javascript
// Create simulation to test improvements
const simEnv = await fetch('/api/workers/simulation/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId,
    scenarios: [
      { id: 'baseline', config: currentConfig },
      { id: 'faster', config: { ...currentConfig, rate_limit_ms: 1000 } },
      { id: 'slower', config: { ...currentConfig, rate_limit_ms: 3000 } }
    ]
  })
}).then(r => r.json());

// Run simulation
const results = await fetch(`/api/workers/simulation/${simEnv.simulationEnvironment.envId}/run`, {
  method: 'POST'
}).then(r => r.json());

// Analyze and apply best configuration
const best = results.results.reduce((a, b) => a.dataExtracted > b.dataExtracted ? a : b);
console.log('Best scenario:', best.scenarioId);
```

## Integration with Google Business

Workers can answer questions about your site that Google manages:

```javascript
// Configure worker to extract Google Business data
const worker = new CampaignWebCrawlerWorker({
  headless: true,
  realTimeStreaming: true
});

await worker.initialize(miningId);

// Subscribe to extracted data
worker.subscribe((data) => {
  if (data.type === 'extraction' && data.data.attribute_name === 'structured_data') {
    // Process JSON-LD structured data
    const businessData = data.data.value;
    
    // Answer questions like:
    // - What are our business hours?
    // - What's our phone number?
    // - What services do we offer?
    // - What's our address?
    
    storeForLLM(businessData);
  }
});
```

## Best Practices

1. **Container Isolation**: Use separate containers for different campaigns to prevent interference

2. **Rate Limiting**: Start with conservative rate limits and adjust based on simulation results

3. **Real-Time Monitoring**: Subscribe to data streams to catch issues immediately

4. **LLM Integration**: Register all relevant attributes as LLM tools for maximum flexibility

5. **Simulations**: Run simulations before making major configuration changes

6. **Two-Way Communication**: Use config updates to respond to changing conditions

7. **Resource Management**: Destroy containers when campaigns complete to free resources

## Performance Considerations

- Workers use headless Chrome (Puppeteer) - memory intensive
- Limit concurrent workers based on available resources
- Use container isolation to prevent resource contention
- Real-time streaming adds network overhead
- Simulations run in parallel - plan for burst load

## Security

- Workers run in isolated containers
- Config updates require authentication (bearer token ready)
- Data streams can be encrypted (TLS/WSS)
- LLM tool access can be restricted by container

## Future Enhancements

- [ ] GPU acceleration for ML-based extraction
- [ ] Distributed container orchestration (Kubernetes)
- [ ] Advanced simulation strategies (genetic algorithms)
- [ ] Multi-modal LLM integration (vision + text)
- [ ] Real-time collaboration between workers
- [ ] Automatic anomaly detection
- [ ] Cost optimization through simulation
- [ ] Fine-tuned LLM models per campaign

## License

Part of the LightDom platform - All rights reserved.
