# Campaign Automation System

Complete multi-step automation orchestration for campaign management, data processing, and workflow execution.

## Overview

The Campaign Automation System allows you to create and run complex workflows that execute multiple tasks in sequence to accomplish complete goals. Each automation can include API calls, data transformations, enrichment operations, validation, loops, conditionals, and parallel execution.

## Architecture

```
Automation Request
    ↓
Campaign Automation Orchestrator
    ↓
Task Execution Engine
    ├─ API Calls
    ├─ Data Transformations
    ├─ Enrichment Jobs
    ├─ Validation
    ├─ Aggregation
    ├─ Loops & Conditionals
    └─ Parallel Execution
    ↓
Results & Reports
```

## Task Types

### 1. API Call

Execute HTTP requests to internal or external APIs.

```json
{
  "id": "fetch_data",
  "type": "api_call",
  "method": "POST",
  "endpoint": "http://localhost:3000/api/entities",
  "input": {
    "entityType": "Product",
    "limit": 100
  },
  "timeout": 30000,
  "onFailure": "retry"
}
```

### 2. Data Transformation

Transform data using Lodash or Ramda functions.

```json
{
  "id": "filter_data",
  "type": "data_transformation",
  "transformation": "filter",
  "predicate": { "active": true },
  "input": {
    "data": "${previousResults.fetch_data.entities}"
  }
}
```

### 3. Enrichment

Queue background enrichment jobs (AI, SEO, external APIs).

```json
{
  "id": "enrich_entities",
  "type": "enrichment",
  "enrichmentType": "ai-summary",
  "input": {
    "entityIds": "${previousResults.fetch_data.entities.*.id}",
    "config": {
      "model": "deepseek-reasoner",
      "temperature": 0.7
    }
  },
  "timeout": 300000
}
```

### 4. Validation

Validate data against JSON Schema.

```json
{
  "id": "validate_data",
  "type": "validation",
  "schema": {
    "type": "object",
    "properties": {
      "quality_score": { "type": "number", "minimum": 70 }
    }
  },
  "input": {
    "data": "${previousResults.fetch_data.entities}"
  },
  "onInvalid": "filter"
}
```

### 5. Aggregation

Calculate metrics and aggregate data.

```json
{
  "id": "aggregate_results",
  "type": "aggregation",
  "input": {
    "data": "${previousResults.fetch_data.entities}"
  },
  "aggregations": ["count", "avg", "groupBy"],
  "avgField": "quality_score",
  "groupByField": "category"
}
```

### 6. Loop

Iterate over items and execute subtasks.

```json
{
  "id": "process_items",
  "type": "loop",
  "input": {
    "items": "${previousResults.fetch_data.entities}"
  },
  "maxIterations": 100,
  "subtasks": [
    {
      "id": "process_item",
      "type": "api_call",
      "method": "POST",
      "endpoint": "http://localhost:3000/api/process",
      "input": {
        "item": "${loopItem}"
      }
    }
  ]
}
```

### 7. Conditional

Execute tasks based on conditions.

```json
{
  "id": "check_quality",
  "type": "conditional",
  "condition": {
    "type": "greaterThan",
    "field": "quality_score",
    "value": 80
  },
  "then": [
    {
      "id": "publish",
      "type": "api_call",
      "method": "POST",
      "endpoint": "http://localhost:3000/api/publish",
      "input": {}
    }
  ],
  "else": [
    {
      "id": "queue_review",
      "type": "api_call",
      "method": "POST",
      "endpoint": "http://localhost:3000/api/review/queue",
      "input": {}
    }
  ]
}
```

### 8. Parallel

Execute tasks in parallel.

```json
{
  "id": "parallel_enrichment",
  "type": "parallel",
  "subtasks": [
    {
      "id": "ai_enrichment",
      "type": "enrichment",
      "enrichmentType": "ai-summary",
      "input": {}
    },
    {
      "id": "seo_enrichment",
      "type": "enrichment",
      "enrichmentType": "seo-analysis",
      "input": {}
    }
  ]
}
```

### 9. Wait

Pause execution for a specified time.

```json
{
  "id": "wait_rate_limit",
  "type": "wait",
  "delay": 5000
}
```

## Variable Substitution

Access previous task results and context using `${path.to.value}` syntax:

- `${context.topic}` - Context variable
- `${previousResults.task_id.field}` - Previous task result
- `${loopItem}` - Current loop item
- `${loopIndex}` - Current loop index

## Predefined Automations

### 1. SEO Campaign Complete

**File**: `seo-campaign-complete.json`

Complete SEO campaign automation (16 tasks):

1. Conduct deep-dive research
2. Discover mining attributes
3. Create mining instance
4. Create campaign container
5. Create web crawler container
6. Spawn 5 crawler workers
7. Seed initial URLs
8. Start mining campaign
9. Monitor progress (10 iterations)
10. Extract campaign results
11. Enrich mined data
12. Analyze relationships
13. Aggregate metrics
14. Validate quality
15. Generate report
16. Save campaign report

**Usage**:

```bash
curl -X POST http://localhost:3000/api/automations/run/seo-campaign-complete \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "topic": "E-commerce product SEO optimization",
      "seedUrls": ["https://example.com/products"],
      "webhookUrl": "https://example.com/webhook"
    }
  }'
```

### 2. Mass Enrichment

**File**: `mass-enrichment.json`

Enrich thousands of entities in parallel (7 tasks):

1. Fetch entities to enrich
2. Filter un-enriched entities
3. Create enrichment batches (100 per batch)
4. Enrich batches (AI + SEO + External API in parallel)
5. Validate enriched data
6. Aggregate results
7. Save enrichment summary

**Usage**:

```bash
curl -X POST http://localhost:3000/api/automations/run/mass-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "entityType": "Product",
      "externalApiUrl": "https://api.example.com/enrich",
      "apiKey": "your-api-key"
    }
  }'
```

### 3. Competitor Analysis

**File**: `competitor-analysis.json`

Analyze competitor websites (8 tasks per competitor):

1. Fetch competitor URLs
2. Loop through each competitor:
   - Crawl competitor site
   - Spawn worker
   - Start crawling
   - Wait for completion
   - Extract competitor data
   - Analyze SEO
   - Save analysis
3. Compare all competitors
4. Generate competitive insights
5. Create action recommendations
6. Save competitor report

**Usage**:

```bash
curl -X POST http://localhost:3000/api/automations/run/competitor-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "webhookUrl": "https://example.com/webhook"
    }
  }'
```

### 4. Content Optimization

**File**: `content-optimization.json`

Analyze and optimize content quality (7 tasks):

1. Fetch all content
2. Analyze quality (loop):
   - SEO analysis
   - AI content review
   - Calculate quality score
3. Prioritize improvements (quality_score < 70)
4. Generate optimization action plan
5. Create optimization tasks (max 50)
6. Save optimization report

**Usage**:

```bash
curl -X POST http://localhost:3000/api/automations/run/content-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "siteId": "site-123"
    }
  }'
```

### 5. Auto-Scaling Pipeline

**File**: `auto-scaling.json`

Automatically scale workers based on queue size (6 tasks):

1. Check processing queue size
2. Conditional: If queue > 1000:
   - Calculate workers needed
   - Spawn additional workers
   - Wait for queue to process
   - Scale down workers
3. Save scaling event

**Usage**:

```bash
curl -X POST http://localhost:3000/api/automations/run/auto-scaling \
  -H "Content-Type: application/json" \
  -d '{}'
```

## API Endpoints

### Run Predefined Automation

```
POST /api/automations/run/:configName
```

**Body**:

```json
{
  "context": {
    "key": "value"
  }
}
```

**Response**:

```json
{
  "success": true,
  "automationId": "uuid",
  "name": "Automation Name",
  "status": "running"
}
```

### Run Custom Automation

```
POST /api/automations/run-custom
```

**Body**:

```json
{
  "config": {
    "name": "Custom Automation",
    "tasks": [...]
  },
  "context": {}
}
```

### Get Automation Status

```
GET /api/automations/status/:automationId
```

**Response**:

```json
{
  "automation": {
    "id": "uuid",
    "name": "Automation Name",
    "status": "running|completed|failed",
    "completedTasks": [...],
    "failedTasks": [...],
    "results": {}
  }
}
```

### Get Metrics

```
GET /api/automations/metrics
```

**Response**:

```json
{
  "metrics": {
    "totalAutomations": 150,
    "successfulAutomations": 142,
    "failedAutomations": 8,
    "averageExecutionTime": 125000,
    "runningCount": 3,
    "completedCount": 147,
    "successRate": 0.9467
  }
}
```

### Get History

```
GET /api/automations/history?limit=50
```

### List Available Configs

```
GET /api/automations/configs
```

### Get Running Automations

```
GET /api/automations/running
```

## Event System

The orchestrator emits events that you can listen to:

```javascript
orchestrator.on('automation:started', data => {
  console.log(`Automation started: ${data.name}`);
});

orchestrator.on('task:started', data => {
  console.log(`Task started: ${data.taskName}`);
});

orchestrator.on('task:completed', data => {
  console.log(`Task completed: ${data.taskId}`);
});

orchestrator.on('task:failed', data => {
  console.error(`Task failed: ${data.taskId}`);
});

orchestrator.on('automation:completed', data => {
  console.log(`Automation completed in ${data.duration}ms`);
});

orchestrator.on('automation:failed', data => {
  console.error(`Automation failed: ${data.error}`);
});
```

## Error Handling

Each task can specify error handling:

- **`onFailure: "abort"`** - Stop entire automation
- **`onFailure: "retry"`** - Retry task up to 3 times with exponential backoff
- **`onFailure: "continue"`** - Continue to next task

## Success Actions

Tasks can trigger actions on success:

```json
{
  "onSuccess": [
    {
      "type": "notify",
      "message": "Task completed successfully"
    },
    {
      "type": "webhook",
      "url": "https://example.com/webhook",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  ]
}
```

## Creating Custom Automations

1. Create a JSON file in `container/automations/configs/`
2. Define tasks with proper sequencing
3. Use variable substitution for data flow
4. Test with `/api/automations/run-custom` first
5. Deploy as predefined automation

Example:

```json
{
  "name": "My Custom Automation",
  "description": "Description of what this does",
  "version": "1.0.0",
  "tasks": [
    {
      "id": "task1",
      "name": "First Task",
      "type": "api_call",
      "method": "POST",
      "endpoint": "http://localhost:3000/api/entities",
      "input": {},
      "onFailure": "abort"
    },
    {
      "id": "task2",
      "name": "Second Task",
      "type": "data_transformation",
      "transformation": "filter",
      "predicate": { "active": true },
      "input": {
        "data": "${previousResults.task1.entities}"
      }
    }
  ]
}
```

## Performance Tips

1. **Use Parallel Tasks**: Execute independent tasks in parallel
2. **Batch Operations**: Group items into batches for mass processing
3. **Conditional Execution**: Skip unnecessary tasks with conditionals
4. **Loop Limits**: Set `maxIterations` to prevent runaway loops
5. **Timeouts**: Configure appropriate timeouts for each task
6. **Error Handling**: Use `continue` for non-critical tasks

## Integration with Services

The orchestrator requires these services to be configured:

- **EnrichmentService**: For enrichment tasks
- **EntityService**: For CRUD operations
- **RelationshipService**: For graph operations

Initialize in your main server:

```javascript
const { initializeOrchestrator } = require('./automations/automation-routes');

const orchestrator = initializeOrchestrator({
  enrichmentService: enrichmentService,
  entityService: entityService,
  relationshipService: relationshipService,
});
```

## Monitoring

- Monitor running automations via `/api/automations/running`
- Track metrics via `/api/automations/metrics`
- Review history via `/api/automations/history`
- Subscribe to events for real-time updates

## Examples

See the `configs/` directory for complete examples:

- `seo-campaign-complete.json` - Full SEO campaign (16 tasks)
- `mass-enrichment.json` - Mass data enrichment (7 tasks)
- `competitor-analysis.json` - Competitor analysis (8+ tasks)
- `content-optimization.json` - Content quality optimization (7 tasks)
- `auto-scaling.json` - Auto-scaling pipeline (6 tasks)

Each automation is designed to run end-to-end and accomplish a complete goal without manual intervention.
