# DeepSeek Finetuning & Workflow Orchestration Integration Guide

## Overview

This guide explains how to use the integrated DeepSeek finetuning pipeline and workflow orchestration system. These systems work together to create a complete AI-powered workflow automation platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 LightDom AI Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┐  ┌────────────────────────┐  │
│  │ DeepSeek Finetuning      │  │ Workflow Orchestration │  │
│  │ Pipeline                 │  │ System                 │  │
│  └──────────────────────────┘  └────────────────────────┘  │
│                                                              │
│  Phase 1: Data Collection ──→ Campaign Management           │
│  Phase 2: Training Setup  ──→ Workflow Creation             │
│  Phase 3: Model Integration ─→ Service Configuration        │
│  Phase 4: Production      ───→ Attribute Generation          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Run the Complete Demo

```bash
node demo-complete-deepseek-integration.js
```

This demonstrates:
- ✅ 4-phase finetuning pipeline
- ✅ Workflow bundle creation
- ✅ DeepSeek attribute generation
- ✅ Campaign orchestration

### 2. Access the Dashboards

**Finetuning Dashboard:**
- Admin: `http://localhost:3000/admin/deepseek-finetuning`
- Dashboard: `http://localhost:3000/dashboard/deepseek-finetuning`

**Workflow Orchestration:**
- Admin: `http://localhost:3000/admin/workflow-orchestration`
- Dashboard: `http://localhost:3000/dashboard/workflow-orchestration`

### 3. Use the API Endpoints

All endpoints are available through the Express API server on port 3001.

## DeepSeek Finetuning Pipeline

### Phase 1: Data Infrastructure

**Collect Training Data**
```bash
POST /api/finetuning/data/collect
Content-Type: application/json

{
  "sources": ["jsonl", "api_logs", "conversations", "tool_interactions"],
  "outputPath": "./training_data/collected.jsonl"
}
```

**Score Data Quality**
```bash
POST /api/finetuning/data/score
Content-Type: application/json

{
  "dataPath": "./training_data/collected.jsonl"
}

Response:
{
  "averageScore": 0.95,
  "scores": [...]
}
```

**Generate Tool Examples**
```bash
POST /api/finetuning/data/generate-tool-examples
Content-Type: application/json

{
  "count": 10,
  "types": ["mining", "schema", "workflow", "error_handling"]
}
```

**Build Validation Dataset**
```bash
POST /api/finetuning/data/build-validation
Content-Type: application/json

{
  "inputPath": "./training_data/collected.jsonl",
  "outputDir": "./training_data",
  "splitRatio": 0.8
}
```

### Phase 2: Local Training Setup

**Create QLoRA Configuration**
```bash
POST /api/finetuning/training/qlora-config
Content-Type: application/json

{
  "baseModel": "deepseek-ai/deepseek-coder-7b-instruct-v1.5",
  "loraRank": 16,
  "loraAlpha": 32,
  "quantization": "4bit"
}
```

**Generate Training Script**
```bash
POST /api/finetuning/training/generate-script
Content-Type: application/json

{
  "config": {...},
  "outputPath": "./train_deepseek.py"
}
```

**Calculate Metrics**
```bash
POST /api/finetuning/training/evaluate
Content-Type: application/json

{
  "predictions": [...],
  "references": [...]
}
```

### Phase 3: Integration

**Register Model**
```bash
POST /api/finetuning/integration/register-model
Content-Type: application/json

{
  "name": "lightdom-deepseek-v1.0.0",
  "path": "./models/lightdom-deepseek",
  "metadata": {
    "training_examples": 1000,
    "base_model": "deepseek-coder-7b"
  }
}
```

**Create A/B Test**
```bash
POST /api/finetuning/integration/ab-test
Content-Type: application/json

{
  "modelA": "base",
  "modelB": "lightdom-deepseek-v1.0.0",
  "trafficSplit": 0.5,
  "metrics": ["accuracy", "latency"]
}
```

**Record A/B Test Results**
```bash
POST /api/finetuning/integration/ab-test/:testId/results
Content-Type: application/json

{
  "modelVersion": "modelA",
  "success": true,
  "latency": 120,
  "metadata": {}
}
```

**Promote Model**
```bash
POST /api/finetuning/integration/promote/:version
```

### Phase 4: Production

**Deploy Model**
```bash
POST /api/finetuning/production/deploy
Content-Type: application/json

{
  "version": "lightdom-deepseek-v1.0.0",
  "instances": 2,
  "config": {
    "gpu": true,
    "memory": "8GB"
  }
}
```

**Check Health**
```bash
GET /api/finetuning/production/health/:deploymentId
```

**Rollback Deployment**
```bash
POST /api/finetuning/production/rollback/:deploymentId
Content-Type: application/json

{
  "reason": "High error rate"
}
```

**Add Training Example**
```bash
POST /api/finetuning/production/training-example
Content-Type: application/json

{
  "messages": [...],
  "metadata": {
    "quality_score": 0.95
  }
}
```

**Get Pipeline Status**
```bash
GET /api/finetuning/production/status
```

## Workflow Orchestration System

### Hierarchy: Campaign → Workflow → Service → Data Stream → Attribute

### Campaigns

**Create Campaign**
```bash
POST /api/workflow-orchestration/campaigns
Content-Type: application/json

{
  "name": "Q4 SEO Campaign",
  "description": "SEO optimization for Q4",
  "status": "draft",
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**List Campaigns**
```bash
GET /api/workflow-orchestration/campaigns
```

**Get Campaign**
```bash
GET /api/workflow-orchestration/campaigns/:id
```

**Update Campaign**
```bash
PUT /api/workflow-orchestration/campaigns/:id
```

**Delete Campaign**
```bash
DELETE /api/workflow-orchestration/campaigns/:id
```

### Workflows

**Create Workflow**
```bash
POST /api/workflow-orchestration/workflows
Content-Type: application/json

{
  "campaignId": "camp_123",
  "name": "Homepage SEO Analysis",
  "description": "Analyze homepage SEO metrics",
  "triggers": ["manual", "schedule", "webhook"],
  "triggerConfig": {
    "schedule": {
      "cron": "0 0 * * *",
      "timezone": "UTC"
    }
  },
  "status": "active"
}
```

**List Workflows**
```bash
GET /api/workflow-orchestration/workflows?campaignId=camp_123
```

**Execute Workflow**
```bash
POST /api/workflow-orchestration/workflows/:id/execute
```

**Stop Workflow**
```bash
POST /api/workflow-orchestration/workflows/:id/stop
```

### Services

**Create Service**
```bash
POST /api/workflow-orchestration/services
Content-Type: application/json

{
  "workflowId": "wf_456",
  "name": "SEO Data API",
  "type": "api",
  "config": {
    "endpoint": "https://api.example.com/seo",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer token"
    }
  }
}
```

**List Services**
```bash
GET /api/workflow-orchestration/services?workflowId=wf_456
```

### Data Streams

**Create Data Stream**
```bash
POST /api/workflow-orchestration/data-streams
Content-Type: application/json

{
  "serviceId": "svc_789",
  "name": "SEO Metrics Stream",
  "source": "api",
  "destination": "database",
  "transformations": [
    {
      "type": "map",
      "field": "page_title",
      "operation": "lowercase"
    }
  ]
}
```

**Generate Attributes with DeepSeek**
```bash
POST /api/workflow-orchestration/data-streams/:id/generate-attributes
Content-Type: application/json

{
  "topic": "h1",
  "count": 5
}

Response:
{
  "attributes": [
    { "name": "h1_text", "type": "string", "generated_by": "deepseek" },
    { "name": "h1_count", "type": "number", "generated_by": "deepseek" },
    { "name": "h1_length", "type": "number", "generated_by": "deepseek" }
  ]
}
```

### Attributes

**Create Attribute**
```bash
POST /api/workflow-orchestration/attributes
Content-Type: application/json

{
  "dataStreamId": "ds_101",
  "name": "h1_text",
  "type": "string",
  "description": "H1 heading text content",
  "validation": {
    "required": true,
    "minLength": 1,
    "maxLength": 255
  },
  "generated_by": "manual"
}
```

**Get Attribute Suggestions**
```bash
POST /api/workflow-orchestration/attributes/suggest
Content-Type: application/json

{
  "topic": "meta description",
  "count": 3
}

Response:
{
  "suggestions": [
    { "name": "meta_description", "type": "string" },
    { "name": "meta_description_length", "type": "number" },
    { "name": "meta_keywords", "type": "array" }
  ]
}
```

### Workflow Bundles (Auto-Creation)

**Create Complete Bundle**
```bash
POST /api/workflow-orchestration/bundles
Content-Type: application/json

{
  "name": "SEO Mining",
  "description": "Complete SEO data mining workflow",
  "topics": ["h1", "meta", "title", "description"],
  "category": "seo",
  "triggers": ["manual", "schedule"],
  "scheduleConfig": {
    "cron": "0 2 * * *",
    "timezone": "UTC"
  }
}

Response:
{
  "campaign": { "id": "camp_123", ... },
  "workflow": { "id": "wf_456", ... },
  "service": { "id": "svc_789", ... },
  "dataStream": { "id": "ds_101", ... },
  "attributes": [
    { "name": "h1_text", "type": "string" },
    { "name": "h1_count", "type": "number" },
    ...
  ]
}
```

## Integration Patterns

### 1. Train Model on Workflow Data

```javascript
// Collect workflow execution logs
const executionLogs = await fetch('/api/workflow-orchestration/workflows/wf_456/logs');

// Convert to training data
const trainingExamples = executionLogs.map(log => ({
  messages: [
    { role: "system", content: "You are a workflow optimizer" },
    { role: "user", content: `Optimize: ${log.workflow}` },
    { role: "assistant", content: log.optimization }
  ]
}));

// Add to finetuning pipeline
await fetch('/api/finetuning/production/training-example', {
  method: 'POST',
  body: JSON.stringify({ messages: trainingExamples })
});
```

### 2. Use Finetuned Model for Attribute Generation

```javascript
// Deploy finetuned model
const deployment = await fetch('/api/finetuning/production/deploy', {
  method: 'POST',
  body: JSON.stringify({
    version: 'lightdom-deepseek-v1.0.0',
    instances: 1
  })
});

// Generate attributes using finetuned model
const attributes = await fetch('/api/workflow-orchestration/data-streams/ds_101/generate-attributes', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'seo_metrics',
    count: 10,
    useFinetunedModel: true
  })
});
```

### 3. Continuous Model Improvement

```javascript
// Monitor workflow performance
const metrics = await fetch('/api/workflow-orchestration/workflows/wf_456/metrics');

// If performance degrades, trigger retraining
if (metrics.successRate < 0.9) {
  await fetch('/api/finetuning/production/status', {
    method: 'POST',
    body: JSON.stringify({
      triggerTraining: true,
      reason: 'Low success rate'
    })
  });
}
```

## Frontend Components

### FinetuningDashboard

**Location:** `src/components/FinetuningDashboard.tsx`

**Features:**
- 4-phase navigation (Data Infrastructure, Training, Integration, Production)
- Quality scoring visualization
- QLoRA configuration form
- Model version management
- A/B test creation and monitoring
- Deployment controls
- Continuous training status

**Usage:**
```tsx
import { FinetuningDashboard } from './components';

<FinetuningDashboard />
```

**Storybook:**
```bash
npm run storybook
# Navigate to: AI/FinetuningDashboard
```

### WorkflowOrchestrationDashboard

**Location:** `src/components/WorkflowOrchestrationDashboard.tsx`

**Features:**
- Hierarchical entity management
- Campaign/Workflow/Service/DataStream/Attribute CRUD
- 🤖 DeepSeek attribute generation
- Statistics dashboard
- Breadcrumb navigation
- n8n-style trigger configuration

**Usage:**
```tsx
import { WorkflowOrchestrationDashboard } from './components';

<WorkflowOrchestrationDashboard />
```

**Storybook:**
```bash
npm run storybook
# Navigate to: Workflow/WorkflowOrchestrationDashboard
```

## Database Schema

### Workflow Orchestration Tables

```sql
-- See: database/144-workflow-orchestration-schema.sql

CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  name TEXT NOT NULL,
  triggers JSONB,
  status TEXT DEFAULT 'inactive'
);

CREATE TABLE services (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB
);

CREATE TABLE data_streams (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  name TEXT NOT NULL,
  source TEXT,
  destination TEXT
);

CREATE TABLE attributes (
  id UUID PRIMARY KEY,
  data_stream_id UUID REFERENCES data_streams(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  generated_by TEXT DEFAULT 'manual'
);
```

## Testing

### Unit Tests

**Finetuning Pipeline:**
```bash
# Run finetuning tests
npm test test/unit/deepseek-finetuning-pipeline.test.ts
```

**Workflow Orchestration:**
```bash
# Run orchestration tests
npm test test/unit/workflow-orchestration-service.test.ts
```

### Integration Demo

```bash
# Complete integration demo
node demo-complete-deepseek-integration.js
```

### API Testing

```bash
# Test all finetuning endpoints
curl -X POST http://localhost:3001/api/finetuning/data/generate-tool-examples \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "types": ["mining"]}'

# Test workflow bundle creation
curl -X POST http://localhost:3001/api/workflow-orchestration/bundles \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Bundle", "topics": ["h1", "meta"]}'
```

## Best Practices

### 1. Data Quality

- Maintain quality scores above 0.9
- Regularly review training examples
- Use diverse data sources
- Validate training data format

### 2. Model Training

- Start with small LoRA ranks (8-16)
- Use 4-bit quantization for efficiency
- Monitor validation loss
- Save checkpoints frequently

### 3. A/B Testing

- Test with real production traffic
- Monitor latency and accuracy
- Gradual rollout (50/50 → 80/20 → 100/0)
- Keep baseline model available

### 4. Workflow Design

- Use descriptive names
- Configure multiple triggers
- Add error handling
- Monitor execution metrics

### 5. Attribute Generation

- Review DeepSeek suggestions
- Add custom validation rules
- Use appropriate data types
- Document attribute purposes

## Troubleshooting

### Model Not Loading

```bash
# Check model registry
curl http://localhost:3001/api/finetuning/integration/models

# Verify model path
ls -la ./models/lightdom-deepseek-v1.0.0/
```

### Training Script Errors

```bash
# Check Python dependencies
pip install transformers peft bitsandbytes accelerate

# Run with debug
python train_deepseek.py --debug
```

### Workflow Not Executing

```bash
# Check workflow status
curl http://localhost:3001/api/workflow-orchestration/workflows/wf_456

# Review execution logs
curl http://localhost:3001/api/workflow-orchestration/workflows/wf_456/logs
```

### DeepSeek API Issues

```bash
# Verify API key
echo $DEEPSEEK_API_KEY

# Test direct API call
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY"
```

## Performance Optimization

### Caching

- Enable response caching for attribute suggestions
- Cache training data quality scores
- Use Redis for session management

### Scaling

- Deploy multiple model instances
- Use GPU acceleration for training
- Implement request queueing
- Add load balancing

### Monitoring

- Track model latency
- Monitor memory usage
- Log training metrics
- Alert on failures

## Security

### API Keys

```bash
# Store in environment variables
export DEEPSEEK_API_KEY="your-api-key"
export DATABASE_URL="postgresql://..."

# Never commit secrets to git
# Use .env files (gitignored)
```

### Rate Limiting

```javascript
// API routes implement rate limiting
// Default: 100 requests per minute per IP
```

### Data Privacy

- Anonymize training data
- Encrypt sensitive attributes
- Implement access controls
- Audit data usage

## Roadmap

### Upcoming Features

- [ ] Multi-model ensemble support
- [ ] Advanced A/B testing metrics
- [ ] Workflow versioning
- [ ] Visual workflow builder
- [ ] Real-time collaboration
- [ ] Export/import workflows
- [ ] Custom trigger types
- [ ] Webhook integrations

## Support

For questions or issues:
- GitHub Issues: [LightDom/issues](https://github.com/DashZeroAlionSystems/LightDom/issues)
- Documentation: `docs/research/DEEPSEEK_FINETUNING_GUIDE.md`
- API Reference: `api/deepseek-finetuning-routes.js`

## License

Private Use License - See LICENSE_PRIVATE_USE.md
