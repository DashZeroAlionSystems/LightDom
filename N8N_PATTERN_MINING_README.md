# N8N Workflow Creator & Pattern Mining System

## 🎯 Overview

Advanced system for creating N8N workflows from prompts, detecting JS/HTML patterns, mining 3D DOM layers, and orchestrating headless browser workers.

## ✨ New Features

### 1. N8N Workflow Creator API
Schema-driven N8N workflow generation with sub-task orchestration and automatic workflow management.

### 2. JS/HTML Pattern Mining
Detect and analyze:
- Function triggers and event handlers
- Observer patterns (Mutation, Intersection, Resize, Performance)
- Event delegation patterns
- Component lifecycle hooks (React, Vue, Angular)
- 3D DOM layer analysis
- Background layer activity

### 3. Puppeteer Workflow Generation
Auto-generate Puppeteer workflows for:
- Pattern detection
- Data extraction
- Screenshot capture
- Headless API workers

## 🚀 Quick Start

### Environment Setup

Add to your `.env`:

```bash
# N8N Configuration
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

### Start Services

```bash
# Start API server (includes all new routes)
npm run start:dev

# Start N8N (if not already running)
docker run -p 5678:5678 n8nio/n8n
```

## 📚 API Endpoints

### N8N Workflow Creator

#### Create Workflow from Prompt
```bash
POST /api/n8n/create-from-prompt
{
  "prompt": "Create a workflow to crawl websites and analyze SEO metrics",
  "options": {
    "autoActivate": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lightdomWorkflow": { "id": "workflow_123", ... },
    "n8nWorkflow": { "id": "n8n_456", "active": true, ... }
  }
}
```

#### Create Workflow from Schema
```bash
POST /api/n8n/create-from-schema
{
  "schema": {
    "name": "SEO Analysis Workflow",
    "tasks": [
      {
        "id": "crawl",
        "service": "crawler",
        "action": "crawl_pages",
        "input": { "url": "https://example.com" }
      },
      {
        "id": "analyze",
        "service": "seo-analyzer",
        "action": "analyze_seo",
        "input": { "pages": "${task:crawl.output}" }
      }
    ]
  }
}
```

#### Activate/Deactivate Workflow
```bash
POST /api/n8n/:workflowId/activate
POST /api/n8n/:workflowId/deactivate
```

#### Execute Workflow
```bash
POST /api/n8n/:workflowId/execute
{
  "data": {
    "url": "https://example.com"
  }
}
```

#### Create Sub-Task Workflow
```bash
POST /api/n8n/subtasks
{
  "parentWorkflowId": "workflow_123",
  "subTasks": [
    {
      "id": "subtask1",
      "service": "crawler",
      "action": "crawl_pages"
    }
  ]
}
```

#### List All Workflows
```bash
GET /api/n8n/workflows
```

#### Delete Workflow
```bash
DELETE /api/n8n/:workflowId
```

#### Health Check
```bash
GET /api/n8n/health
```

### Pattern Mining

#### Analyze URL for Patterns
```bash
POST /api/pattern-mining/analyze
{
  "url": "https://example.com",
  "options": {
    "captureConsole": true,
    "waitForNetworkIdle": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "timestamp": "2025-11-03T...",
    "patterns": {
      "functionTriggers": [
        {
          "type": "event-listener",
          "event": "click",
          "element": "BUTTON",
          "selector": "#submit-btn"
        }
      ],
      "observers": [
        {
          "type": "MutationObserver",
          "count": 2,
          "scriptSrc": "app.js"
        }
      ],
      "lifecycleHooks": [
        {
          "framework": "React",
          "hook": "useEffect",
          "scriptSrc": "bundle.js"
        }
      ],
      "dom3DInfo": {
        "compositedLayers": [
          {
            "element": "DIV",
            "selector": ".hero",
            "triggers": {
              "transform": true,
              "willChange": true
            }
          }
        ]
      }
    }
  }
}
```

#### Get Pattern Summary
```bash
GET /api/pattern-mining/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFunctionTriggers": 15,
    "totalObservers": 3,
    "totalEventDelegation": 2,
    "totalLifecycleHooks": 8,
    "total3DLayers": 12,
    "frameworks": ["React", "Vue"]
  }
}
```

#### Generate Puppeteer Workflow
```bash
POST /api/pattern-mining/puppeteer-workflow
{
  "url": "https://example.com",
  "options": {
    "selectors": [".product", ".price"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pattern-workflow-123",
    "name": "Pattern Detection Workflow",
    "steps": [
      { "action": "navigate", "url": "https://example.com" },
      { "action": "inject-script", "script": "pattern-detector.js" },
      { "action": "evaluate", "function": "detectAllPatterns" },
      { "action": "screenshot", "fullPage": true },
      { "action": "extract-data", "selectors": [".product"] }
    ]
  }
}
```

#### Create Headless Worker Workflow
```bash
POST /api/pattern-mining/headless-worker
{
  "tasks": [
    { "url": "https://example.com/page1", "action": "crawl" },
    { "url": "https://example.com/page2", "action": "crawl" },
    { "url": "https://example.com/page3", "action": "crawl" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "headless-worker-123",
    "workers": [
      { "id": "worker-0", "task": {...} },
      { "id": "worker-1", "task": {...} },
      { "id": "worker-2", "task": {...} }
    ],
    "coordination": {
      "type": "parallel",
      "maxConcurrency": 5
    }
  }
}
```

## 💡 Usage Examples

### Example 1: Complete SEO Workflow with N8N

```javascript
// 1. Create workflow from prompt
const response = await fetch('http://localhost:3001/api/n8n/create-from-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Crawl example.com, analyze SEO, and send results to Slack',
    options: { autoActivate: true }
  })
});

const { data } = await response.json();
console.log('N8N Workflow ID:', data.n8nWorkflow.id);

// 2. Execute workflow
await fetch(`http://localhost:3001/api/n8n/${data.n8nWorkflow.id}/execute`, {
  method: 'POST',
  body: JSON.stringify({ data: { url: 'https://example.com' } })
});
```

### Example 2: Pattern Mining Workflow

```javascript
// 1. Analyze patterns
const patterns = await fetch('http://localhost:3001/api/pattern-mining/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await patterns.json();

// 2. Check for React usage
const hasReact = result.data.patterns.lifecycleHooks.some(
  hook => hook.framework === 'React'
);

// 3. Analyze 3D layers
const compositedLayers = result.data.patterns.dom3DInfo.compositedLayers;
console.log(`Found ${compositedLayers.length} composited layers`);

// 4. Generate Puppeteer workflow based on findings
const workflow = await fetch('http://localhost:3001/api/pattern-mining/puppeteer-workflow', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      selectors: compositedLayers.map(layer => layer.selector)
    }
  })
});
```

### Example 3: Headless Worker Pool

```javascript
// Create parallel worker workflow
const tasks = [
  { url: 'https://example.com/page1', action: 'analyze' },
  { url: 'https://example.com/page2', action: 'analyze' },
  { url: 'https://example.com/page3', action: 'analyze' }
];

const workflow = await fetch('http://localhost:3001/api/pattern-mining/headless-worker', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tasks })
});

const { data } = await workflow.json();
console.log(`Created ${data.workers.length} workers`);
```

## 🔧 Advanced Features

### Schema Mappings

The system automatically maps LightDom service types to N8N node types:

| Service Type | N8N Node Type | Purpose |
|-------------|---------------|---------|
| `crawler` | `httpRequest` | HTTP requests for crawling |
| `ai` | `httpRequest` | AI API calls |
| `seo-analyzer` | `function` | Custom SEO analysis |
| `data-processor` | `set` | Data transformation |
| `database` | `postgres` | Database operations |
| `notification` | `emailSend` | Email notifications |
| `webhook-trigger` | `webhook` | Webhook triggers |
| `schedule-trigger` | `scheduleTrigger` | Scheduled execution |

### Pattern Detection Features

**Function Triggers:**
- Inline event handlers (`onclick`, `onload`, etc.)
- Event listeners (via Chrome DevTools Protocol when available)
- Event delegation patterns

**Observer Detection:**
- MutationObserver
- IntersectionObserver
- ResizeObserver
- PerformanceObserver

**Framework Detection:**
- React hooks and lifecycle methods
- Vue lifecycle hooks
- Angular lifecycle methods

**3D Layer Analysis:**
- Composited layers (transforms, opacity, will-change)
- Paint layers (backgrounds, borders)
- Transform layers (3D transforms, matrix3d)

### Background Layer Highlighting

The pattern mining service uses Chrome DevTools Protocol to highlight:
- GPU-accelerated layers
- Compositing triggers
- Paint boundaries
- Z-index stacking contexts

## 📊 Integration with Existing Systems

### With Workflow Orchestrator

```javascript
import workflowOrchestrator from './services/workflow-orchestrator.js';
import n8nService from './services/n8n-workflow-creator.js';

// Create LightDom workflow
const workflow = await workflowOrchestrator.createWorkflowFromPrompt(
  'Crawl and analyze competitor websites'
);

// Convert to N8N
const n8nWorkflow = await n8nService.createWorkflowFromSchema(workflow.schema);
```

### With Campaign Service

```javascript
import campaignService from './services/crawler-campaign-service.js';
import n8nService from './services/n8n-workflow-creator.js';

// Create campaign
const campaign = await campaignService.createCampaignFromPrompt(
  'SEO data collection campaign',
  'https://example.com'
);

// Create N8N workflow for campaign
const schema = {
  name: `Campaign: ${campaign.name}`,
  tasks: [{
    id: 'start-campaign',
    service: 'campaign',
    action: 'execute',
    input: { campaignId: campaign.id }
  }]
};

const n8nWorkflow = await n8nService.createWorkflowFromSchema(schema);
```

## 🎯 Best Practices

### 1. Workflow Creation

**DO:**
- Use descriptive prompts with clear objectives
- Specify sub-tasks explicitly for complex workflows
- Enable auto-activation for production workflows
- Include error handling in schemas

**DON'T:**
- Create too many nested sub-workflows (max 3 levels)
- Mix synchronous and asynchronous operations carelessly
- Ignore webhook security for public endpoints

### 2. Pattern Mining

**DO:**
- Wait for network idle before pattern detection
- Capture console logs for debugging
- Use appropriate timeouts for heavy pages
- Cache pattern results for repeated analysis

**DON'T:**
- Run pattern mining on pages with CAPTCHAs
- Ignore robots.txt when mining
- Mine patterns too frequently (rate limit)

### 3. Headless Workers

**DO:**
- Use worker pools for parallel execution
- Set appropriate concurrency limits
- Implement retry logic for failed tasks
- Monitor memory usage

**DON'T:**
- Create unlimited workers (max 20 recommended)
- Share browser contexts between unrelated tasks
- Ignore worker cleanup on completion

## 🔒 Security Considerations

- **N8N API Key**: Always use environment variables
- **Webhook URLs**: Implement authentication
- **Pattern Mining**: Respect robots.txt and rate limits
- **Worker Isolation**: Use separate browser contexts
- **Data Sanitization**: Validate all user inputs

## 📈 Performance Tips

1. **N8N Workflows**: Use batching for bulk operations
2. **Pattern Mining**: Enable headless mode for faster execution
3. **Worker Pools**: Adjust concurrency based on system resources
4. **Caching**: Cache workflow schemas and pattern results
5. **Cleanup**: Always close browser instances after use

## 🐛 Troubleshooting

### N8N Connection Issues

```bash
# Check N8N health
curl http://localhost:3001/api/n8n/health

# Verify N8N is running
curl http://localhost:5678/healthz
```

### Pattern Mining Fails

```bash
# Check browser initialization
# Ensure Chrome/Chromium is installed
npm run browser:check

# Increase timeout
{
  "timeout": 60000  // 60 seconds
}
```

### Worker Pool Exhaustion

```bash
# Check system resources
npm run system:resources

# Reduce concurrency
{
  "coordination": {
    "maxConcurrency": 3  // Lower limit
  }
}
```

## 📝 API Summary

**Total Endpoints**: 14 new endpoints
- N8N Workflow: 9 endpoints
- Pattern Mining: 4 endpoints
- Health Check: 1 endpoint

**Total Services**: 2 new services
- `n8n-workflow-creator.js` (12.7KB)
- `js-html-pattern-mining.js` (16.4KB)

**Total Routes**: 2 new route files
- `n8n-workflow.routes.js` (5.4KB)
- `pattern-mining.routes.js` (3.2KB)

## 🎉 Conclusion

This system makes it incredibly easy to:
1. **Prompt → Build**: Natural language to working N8N workflows
2. **Detect → Analyze**: Automatic JS/HTML pattern detection
3. **Mine → Extract**: 3D DOM layer analysis with highlights
4. **Scale → Execute**: Headless worker pools for parallel tasks

All integrated with the existing crawler campaign and workflow orchestration systems for maximum automation and efficiency.

## 📚 Additional Resources

- [N8N Documentation](https://docs.n8n.io/)
- [Puppeteer API](https://pptr.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [LightDom Workflow Research](./DEEPSEEK_WORKFLOW_RESEARCH.md)
