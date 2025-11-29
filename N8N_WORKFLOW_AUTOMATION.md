# N8N Workflow Automation Integration

Complete n8n workflow automation system for LightDom crawler campaigns with event-based triggers, template library, and DeepSeek AI integration.

## 🚀 Features

- **Event-Based Triggers**: Automatically execute workflows when campaign events occur
- **Template Library**: Pre-built workflows from awesome-n8n and GitHub
- **DeepSeek AI Integration**: AI-powered workflow generation
- **Docker Support**: n8n runs in Docker container with PostgreSQL and Redis
- **4GB RAM Optimized**: Efficient resource usage for systems with limited RAM
- **Admin Interface**: Post workflows from admin panel
- **Multi-Step Triggers**: Chain workflows with conditional execution

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Workflow Triggers](#workflow-triggers)
4. [Templates](#templates)
5. [API Reference](#api-reference)
6. [Integration Guide](#integration-guide)
7. [Best Practices](#best-practices)

## 🚀 Quick Start

### Start All Services with n8n

```bash
./start-all-services-with-n8n.sh
```

This starts:
- n8n (http://localhost:5678)
- PostgreSQL (for n8n workflows)
- Redis (for caching)
- API Server (http://localhost:3001)
- Frontend (http://localhost:3000)
- Ollama (with 4GB-optimized models)

### Manual n8n Start

```bash
# Using Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Or standalone Docker
docker run -d \
  --name lightdom-n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n:latest
```

### Environment Variables

```bash
# .env
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_deepseek_key
```

## 🏗️ Architecture

```
Campaign Event
     ↓
Trigger Service (evaluates conditions)
     ↓
n8n API (executes workflow)
     ↓
Workflow Actions (notifications, data processing, etc.)
     ↓
Campaign Updates
```

### Components

1. **N8NWorkflowTriggerService** (`services/n8n-workflow-trigger-service.js`)
   - Event listener and trigger manager
   - Condition evaluation
   - DeepSeek AI integration
   - Template library

2. **WorkflowTriggerManager** (`src/components/WorkflowTriggerManager.tsx`)
   - UI for managing triggers
   - Template browser
   - Execution history viewer
   - Statistics dashboard

3. **API Routes** (`src/api/routes/n8n-trigger.routes.js`)
   - REST API for trigger CRUD
   - Event emission endpoint
   - Statistics and history

4. **Start Script** (`start-all-services-with-n8n.sh`)
   - Docker Compose orchestration
   - Service health checks
   - 4GB RAM optimization

## 🔥 Workflow Triggers

### Trigger Types

1. **schema-discovered**: Triggers when new schema type is found
2. **url-collected**: Triggers when URLs are collected by seeder
3. **data-mined**: Triggers when crawling completes
4. **cluster-scaled**: Triggers when cluster needs scaling
5. **error-threshold**: Triggers when error rate exceeds limit
6. **training-ready**: Triggers when ML training dataset is ready

### Create Trigger (API)

```javascript
POST /api/n8n/triggers

{
  "campaignId": "campaign_123",
  "eventType": "campaign.schema.discovered",
  "condition": "{{schema.type}} === 'Product'",
  "description": "Process product schema discoveries",
  "enabled": true,
  "useTemplate": "schema-discovered" // Optional
}
```

### Create Trigger (UI)

```tsx
import WorkflowTriggerManager from './components/WorkflowTriggerManager';

<WorkflowTriggerManager campaignId="campaign_123" />
```

### Emit Event (from Campaign)

```javascript
import { triggerService } from './api/routes/n8n-trigger.routes.js';

// Emit event when schema is discovered
triggerService.emitCampaignEvent('campaign.schema.discovered', {
  campaignId: 'campaign_123',
  schema: {
    type: 'Product',
    url: 'https://example.com/product',
    fields: ['name', 'price', 'sku']
  },
  timestamp: new Date().toISOString()
});
```

## 📚 Templates

### Available Templates

1. **Schema Discovery Trigger**
   - Event: `campaign.schema.discovered`
   - Actions: Notification, Update seeding, Start specialized crawler, Generate training data

2. **URL Collection Trigger**
   - Event: `campaign.seeder.urls_collected`
   - Actions: Validate URLs, Filter by robots.txt, Add to queue, Update stats

3. **Data Mining Complete Trigger**
   - Event: `campaign.crawler.data_mined`
   - Actions: Store in database, Extract schemas, Run OCR, Update analytics

4. **Cluster Auto-Scale Trigger**
   - Event: `campaign.cluster.scale_needed`
   - Actions: Spawn crawler, Rebalance load, Update config, Send alert

5. **Error Threshold Trigger**
   - Event: `campaign.error.threshold_exceeded`
   - Actions: Pause campaign, Send alert, Rotate proxies, Adjust rate limits

6. **Training Data Ready Trigger**
   - Event: `campaign.training.ready`
   - Actions: Prepare dataset, Start training, Validate quality, Generate report

### Use Template

```javascript
// From API
POST /api/n8n/triggers
{
  "campaignId": "campaign_123",
  "useTemplate": "schema-discovered",
  "description": "Custom description"
}

// From UI
// Select template in dropdown, wizard pre-fills configuration
```

### Custom Template

```javascript
// Add to N8NWorkflowTriggerService.loadTemplates()
'custom-event': {
  name: 'Custom Event Trigger',
  description: 'Your custom trigger description',
  event: 'campaign.custom.event',
  condition: '{{custom.field}} > 100',
  workflow: null,
  defaultActions: [
    'Custom action 1',
    'Custom action 2'
  ]
}
```

## 📡 API Reference

### Triggers

```bash
# List triggers
GET /api/n8n/triggers?campaignId=campaign_123&enabled=true

# Get trigger
GET /api/n8n/triggers/{triggerId}

# Create trigger
POST /api/n8n/triggers
{
  "campaignId": "campaign_123",
  "eventType": "campaign.schema.discovered",
  "workflowId": "workflow_456", // Optional
  "condition": "{{schema.type}} === 'Product'",
  "description": "Product schema handler",
  "enabled": true,
  "useTemplate": "schema-discovered" // Optional
}

# Update trigger
PATCH /api/n8n/triggers/{triggerId}
{
  "enabled": false,
  "condition": "{{schema.type}} === 'Product' && {{data.count}} > 10"
}

# Delete trigger
DELETE /api/n8n/triggers/{triggerId}
```

### Templates

```bash
# List templates
GET /api/n8n/trigger-templates

# Response
{
  "success": true,
  "count": 6,
  "templates": [
    {
      "key": "schema-discovered",
      "name": "Schema Discovery Trigger",
      "description": "...",
      "event": "campaign.schema.discovered",
      "condition": "{{schema.type}} !== null",
      "defaultActions": [...]
    }
  ]
}
```

### Statistics

```bash
# Get stats
GET /api/n8n/triggers/stats

# Response
{
  "success": true,
  "stats": {
    "total": 10,
    "enabled": 8,
    "disabled": 2,
    "totalExecutions": 523,
    "recentExecutions": 45,
    "successRate": 98
  }
}
```

### Execution History

```bash
# Get execution history
GET /api/n8n/triggers/executions?limit=50&triggerId=trigger_123

# Response
{
  "success": true,
  "count": 45,
  "history": [
    {
      "triggerId": "trigger_123",
      "workflowId": "workflow_456",
      "executionId": "exec_789",
      "eventData": {...},
      "timestamp": "2025-11-18T14:00:00Z",
      "success": true
    }
  ]
}
```

### Event Emission

```bash
# Emit event (for testing)
POST /api/n8n/triggers/emit-event
{
  "eventType": "campaign.schema.discovered",
  "data": {
    "schema": {"type": "Product"},
    "url": "https://example.com"
  }
}
```

## 🔧 Integration Guide

### Campaign Orchestrator Integration

```javascript
// In campaign-instance-orchestrator.js
import { triggerService } from '../api/routes/n8n-trigger.routes.js';

class CampaignInstanceOrchestrator {
  async createCampaignWithInstances(config) {
    // ... create campaign ...
    
    // Setup default triggers
    await this.setupDefaultTriggers(campaign.id);
    
    // ... rest of setup ...
  }
  
  async setupDefaultTriggers(campaignId) {
    // Schema discovery trigger
    await triggerService.createTrigger({
      campaignId,
      useTemplate: 'schema-discovered',
      description: 'Auto-process schema discoveries',
      enabled: true
    });
    
    // URL collection trigger
    await triggerService.createTrigger({
      campaignId,
      useTemplate: 'url-collected',
      description: 'Validate and queue collected URLs',
      enabled: true
    });
    
    // Data mining complete trigger
    await triggerService.createTrigger({
      campaignId,
      useTemplate: 'data-mined',
      description: 'Process crawled data',
      enabled: true
    });
  }
  
  // Emit events during campaign execution
  async onSchemaDiscovered(campaignId, schema) {
    triggerService.emitCampaignEvent('campaign.schema.discovered', {
      campaignId,
      schema,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Seeding Service Integration

```javascript
// In enhanced-seeding-service.js
import { triggerService } from '../api/routes/n8n-trigger.routes.js';

class EnhancedSeedingService {
  async collectUrls(seederId) {
    const urls = await this.scrapeUrls(seederId);
    
    // Emit event
    triggerService.emitCampaignEvent('campaign.seeder.urls_collected', {
      seederId,
      urls,
      count: urls.length,
      timestamp: new Date().toISOString()
    });
    
    return urls;
  }
}
```

### Crawler Integration

```javascript
// In crawler-campaign-service.js
import { triggerService } from '../api/routes/n8n-trigger.routes.js';

class CrawlerCampaignService {
  async crawlUrl(url, campaignId) {
    const data = await this.extractData(url);
    
    // Emit event
    triggerService.emitCampaignEvent('campaign.crawler.data_mined', {
      campaignId,
      url,
      data,
      success: true,
      timestamp: new Date().toISOString()
    });
    
    return data;
  }
}
```

## 📊 4GB RAM Optimization

### Ollama Models for 4GB Systems

The start script automatically pulls optimized models:

```bash
# Models for 4GB RAM systems
phi:latest              # 1.6GB - Fast and efficient
deepseek-r1:1.5b       # 1.5GB - Optimized DeepSeek
orca-mini:latest       # 1.9GB - Good for general tasks
```

### n8n Resource Limits

```yaml
# docker-compose.dev.yml
n8n:
  image: n8nio/n8n:latest
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '1.0'
      reservations:
        memory: 512M
        cpus: '0.5'
```

## 🎯 Best Practices

### 1. Use Templates

Start with templates and customize rather than building from scratch:

```javascript
// Good
await triggerService.createTrigger({
  campaignId,
  useTemplate: 'schema-discovered',
  condition: '{{schema.type}} === "Product"' // Customize condition
});

// Avoid - manually creating complex workflows
```

### 2. Conditional Execution

Use conditions to avoid unnecessary workflow executions:

```javascript
// Efficient
condition: '{{urls.length}} > 10 && {{urls.length}} < 1000'

// Wasteful - no condition
condition: 'true'
```

### 3. Error Handling

Always include error threshold triggers:

```javascript
await triggerService.createTrigger({
  campaignId,
  useTemplate: 'error-threshold',
  enabled: true
});
```

### 4. Monitor Execution

Check execution history and success rates:

```bash
curl http://localhost:3001/api/n8n/triggers/stats
curl http://localhost:3001/api/n8n/triggers/executions?limit=20
```

### 5. Test Triggers

Use the emit-event endpoint to test triggers:

```bash
curl -X POST http://localhost:3001/api/n8n/triggers/emit-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "campaign.schema.discovered",
    "data": {"schema": {"type": "Product"}}
  }'
```

## 🔍 Troubleshooting

### n8n Not Starting

```bash
# Check Docker logs
docker logs lightdom-n8n

# Restart n8n
docker restart lightdom-n8n

# Check port availability
lsof -i :5678
```

### Triggers Not Executing

1. Check trigger is enabled: `GET /api/n8n/triggers/{id}`
2. Check workflow is active in n8n: http://localhost:5678
3. Check execution history: `GET /api/n8n/triggers/executions`
4. Test event emission: `POST /api/n8n/triggers/emit-event`

### DeepSeek API Errors

```bash
# Verify API key
echo $DEEPSEEK_API_KEY

# Test API directly
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

### Memory Issues (4GB Systems)

```bash
# Check memory usage
free -h

# Stop unused services
docker stop lightdom-postgres-dev lightdom-redis-dev

# Use smaller Ollama model
ollama pull phi:latest
```

## 📖 References

- [n8n Documentation](https://docs.n8n.io/)
- [awesome-n8n](https://github.com/siteworxpro/awesome-n8n)
- [n8n Community Workflows](https://n8n.io/workflows/)
- [DeepSeek API](https://platform.deepseek.com/docs)
- [Ollama Models](https://ollama.com/library)

## 🤝 Contributing

To add new trigger templates:

1. Add template to `N8NWorkflowTriggerService.loadTemplates()`
2. Test with `useTemplate` parameter
3. Document in this README
4. Submit PR

## 📝 License

Part of LightDom project - see main LICENSE file.
