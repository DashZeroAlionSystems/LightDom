# DeepSeek n8n Workflow System - Complete Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Workflow Creation Guide](#workflow-creation-guide)
7. [Prompt Engineering](#prompt-engineering)
8. [Long-Running Tasks](#long-running-tasks)
9. [n8n Integration](#n8n-integration)
10. [Monitoring & Metrics](#monitoring--metrics)
11. [Examples & Templates](#examples--templates)

---

## Overview

The DeepSeek n8n Workflow System is a comprehensive AI-powered automation platform that combines:

- **DeepSeek AI** for intelligent workflow generation and decision-making
- **n8n** for visual workflow editing and execution
- **PostgreSQL** for robust data persistence
- **MCP (Model Context Protocol)** for AI agent integration
- **Long-running task support** with automatic polling
- **Self-generating schemas** for rapid development

### Key Features

✅ **Natural Language Workflow Creation** - Describe workflows in plain English
✅ **Prompt Template System** - Reusable AI prompt templates with variable interpolation  
✅ **Schema Generation** - Auto-generate and link data schemas
✅ **Workflow Orchestration** - Sequential, parallel, and DAG execution modes
✅ **Long-Running Task Polling** - Automatic status polling for async operations
✅ **n8n Integration** - Seamless integration with n8n workflows
✅ **Real-time Monitoring** - Live metrics and health tracking
✅ **CRUD APIs** - Complete RESTful API for all operations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Workflow API │  │ Schema API   │  │ Prompt API   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Service Layer (Business Logic)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         DeepSeek Workflow Orchestrator               │  │
│  │  • Task Execution  • Polling  • Event Management     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         DeepSeek Workflow CRUD Service               │  │
│  │  • Database Operations  • Query Management           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (PostgreSQL)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Workflows  │  │    Schemas   │  │   Prompts    │     │
│  │   Executions │  │ Relationships│  │ Task Queue   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               External Integrations                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DeepSeek AI  │  │  n8n Server  │  │ MCP Server   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Prerequisites

```bash
# Node.js 18+ and PostgreSQL 14+
node --version  # v18.0.0+
psql --version  # PostgreSQL 14+
```

### 2. Install Dependencies

```bash
npm install pg uuid axios express
npm install --save-dev @types/pg @types/uuid @types/express
```

### 3. Environment Configuration

Create `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=your_password

# DeepSeek Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# n8n Configuration
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Application Configuration
API_URL=http://localhost:3001
NODE_ENV=development
```

### 4. Database Setup

```bash
# Run the schema migration
psql -U postgres -d lightdom -f database/deepseek-n8n-workflow-schema.sql
```

### 5. Start the Services

```bash
# Start the API server (includes workflow orchestration)
npm run start:api

# Or integrate into existing server
node api-server-express.js
```

---

## Database Schema

### Core Tables

#### 1. **prompt_templates** - Reusable AI Prompt Templates
- Stores prompt templates with variable placeholders
- Categories: workflow, schema, component, analysis, optimization
- Supports versioning and examples

#### 2. **generated_schemas** - AI-Generated Schemas
- Stores schemas created by DeepSeek
- Types: json-schema, graphql, database, component
- Includes validation rules and relationships

#### 3. **orchestrated_workflows** - Workflow Definitions
- Main workflow configurations
- Types: sequential, parallel, dag, event-driven
- Schedule and retry policies

#### 4. **orchestrated_tasks** - Individual Task Definitions
- Task configurations within workflows
- Types: deepseek, n8n, crawler, api, database, custom
- Dependencies and conditional logic

#### 5. **orchestrated_workflow_runs** - Execution Instances
- Tracks workflow executions
- Real-time status and progress
- Execution results and errors

#### 6. **long_running_tasks** - Async Task Management
- Polling configuration and status
- External system integration
- Automatic retry logic

### Key Relationships

```sql
workflows (1) ────→ (*) tasks
workflows (1) ────→ (*) runs
runs (1) ──────────→ (*) task_executions
task_executions (1) → (0..1) long_running_tasks
schemas (1) ────────→ (*) schema_relationships
```

---

## API Reference

### Base URL: `/api`

### Prompt Templates

#### Create Template
```http
POST /prompts/templates
Content-Type: application/json

{
  "name": "Workflow Generation",
  "category": "workflow",
  "template_content": "Generate workflow for {{purpose}}...",
  "variables": ["purpose", "domain"],
  "examples": [...]
}
```

#### List Templates
```http
GET /prompts/templates?category=workflow&is_active=true&limit=50
```

#### Get Template
```http
GET /prompts/templates/:template_id
```

#### Update Template
```http
PUT /prompts/templates/:template_id
Content-Type: application/json

{
  "template_content": "Updated template...",
  "is_active": true
}
```

### Schemas

#### Create Schema
```http
POST /schemas
Content-Type: application/json

{
  "name": "User Profile",
  "schema_type": "json-schema",
  "schema_content": {
    "type": "object",
    "properties": {...}
  },
  "validation_rules": {...}
}
```

#### Link Schemas
```http
POST /schemas/link
Content-Type: application/json

{
  "from_schema_id": "schema_123",
  "to_schema_id": "schema_456",
  "relationship_type": "one-to-many",
  "relationship_name": "user_orders"
}
```

#### List Schemas
```http
GET /schemas?schema_type=json-schema&is_validated=true&limit=50
```

### Workflows

#### Create Workflow
```http
POST /workflows
Content-Type: application/json

{
  "name": "SEO Analysis Workflow",
  "workflow_type": "sequential",
  "description": "Crawl and analyze website SEO",
  "configuration": {
    "maxRetries": 3,
    "timeout": 3600
  },
  "schedule": {
    "cron": "0 9 * * *"
  },
  "status": "draft"
}
```

#### Add Task to Workflow
```http
POST /workflows/:workflowId/tasks
Content-Type: application/json

{
  "name": "Analyze Content",
  "task_type": "deepseek",
  "ordering": 1,
  "handler_config": {
    "promptTemplateId": "prompt_123",
    "variables": {
      "url": "{{workflow.input.url}}"
    }
  },
  "dependencies": [],
  "timeout_seconds": 300
}
```

#### Execute Workflow
```http
POST /workflows/:workflowId/execute
Content-Type: application/json

{
  "executionMode": "manual",
  "triggerData": {
    "url": "https://example.com",
    "depth": 3
  }
}

Response:
{
  "success": true,
  "data": {
    "run_id": "run_abc123",
    "status": "pending",
    "progress_percentage": 0
  },
  "message": "Workflow execution started"
}
```

#### Get Workflow Run Status
```http
GET /workflows/runs/:runId

Response:
{
  "success": true,
  "data": {
    "run_id": "run_abc123",
    "workflow_id": "workflow_xyz",
    "status": "running",
    "progress_percentage": 45,
    "current_task_id": "task_2",
    "started_at": "2025-11-04T10:00:00Z"
  }
}
```

#### List Workflow Runs
```http
GET /workflows/:workflowId/runs?status=running&limit=20
```

### Monitoring

#### Get Workflow Metrics
```http
GET /workflows/:workflowId/metrics?start_date=2025-11-01&end_date=2025-11-04
```

#### Get System Health
```http
GET /system/health?limit=10
```

---

## Workflow Creation Guide

### Step-by-Step: Create a Complete Workflow

#### Step 1: Define the Workflow

```javascript
const workflow = {
  name: "Competitor SEO Analysis",
  workflow_type: "sequential",
  description: "Analyze competitor websites for SEO opportunities",
  configuration: {
    maxRetries: 3,
    timeout: 3600
  },
  status: "active"
};

const response = await fetch('/api/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(workflow)
});

const { data: createdWorkflow } = await response.json();
```

#### Step 2: Add Tasks

```javascript
// Task 1: Crawl competitor website
const crawlTask = {
  name: "Crawl Website",
  task_type: "crawler",
  ordering: 1,
  handler_config: {
    maxDepth: 3,
    respectRobotsTxt: true,
    timeout: 30000
  },
  dependencies: []
};

// Task 2: Analyze with DeepSeek
const analyzeTask = {
  name: "AI SEO Analysis",
  task_type: "deepseek",
  ordering: 2,
  handler_config: {
    promptTemplateId: "seo-analysis-v1",
    variables: {
      crawlData: "{{task_1.output}}"
    },
    parseJson: true
  },
  dependencies: ["task_1"]
};

// Task 3: Store results
const storeTask = {
  name: "Store Results",
  task_type: "database",
  ordering: 3,
  handler_config: {
    query: "INSERT INTO seo_analyses (data) VALUES ($1)",
    params: ["{{task_2.output}}"]
  },
  dependencies: ["task_2"]
};

// Add all tasks
for (const task of [crawlTask, analyzeTask, storeTask]) {
  await fetch(`/api/workflows/${createdWorkflow.workflow_id}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
}
```

#### Step 3: Execute the Workflow

```javascript
const execution = await fetch(`/api/workflows/${createdWorkflow.workflow_id}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    executionMode: 'manual',
    triggerData: {
      targetUrl: 'https://competitor.com'
    }
  })
});

const { data: run } = await execution.json();
console.log('Workflow started:', run.run_id);
```

#### Step 4: Poll for Status

```javascript
async function pollWorkflowStatus(runId) {
  const checkStatus = async () => {
    const response = await fetch(`/api/workflows/runs/${runId}`);
    const { data: run } = await response.json();
    
    console.log(`Status: ${run.status}, Progress: ${run.progress_percentage}%`);
    
    if (run.status === 'success' || run.status === 'failed') {
      clearInterval(interval);
      console.log('Final result:', run.result_data);
    }
  };
  
  const interval = setInterval(checkStatus, 2000);
  checkStatus(); // Initial check
}

pollWorkflowStatus(run.run_id);
```

---

## Prompt Engineering

### DeepSeek Best Practices

Based on research, DeepSeek R1 requires specific prompting techniques:

#### 1. **Use Minimal, Direct Prompts**

✅ Good:
```
Analyze this webpage for SEO opportunities:
{{url}}

Provide top 5 improvements.
```

❌ Bad:
```
Please carefully analyze this webpage step by step, considering every
aspect of SEO including meta tags, content quality, backlinks, and more...
```

#### 2. **Avoid Explicit Chain-of-Thought**

DeepSeek R1 has built-in reasoning. Don't use "Let's think step by step".

✅ Good:
```
Generate a workflow to crawl {{website}} and extract product data.
Output in JSON format.
```

❌ Bad:
```
Let's think step by step about how to build a workflow for {{website}}.
First, consider the crawling strategy...
```

#### 3. **Use Structured Output Tags**

```
<think>
Analyze the requirements and plan the workflow
</think>

<answer>
{
  "workflow": {
    "name": "...",
    "tasks": [...]
  }
}
</answer>
```

#### 4. **Template Variables**

Always use `{{variableName}}` for interpolation:

```
TASK: Analyze {{domain}} for {{analysisType}}
CONTEXT: {{userContext}}

Provide recommendations in JSON format with:
- issues: []
- recommendations: []
- priority: 1-10
```

### Creating Custom Prompt Templates

```javascript
const template = {
  name: "Schema Generation from Description",
  category: "schema",
  template_content: `Generate a JSON schema for: {{description}}

Requirements:
- Type: {{schemaType}}
- Include validation rules
- Add relationships to: {{relatedSchemas}}

Output format:
{
  "schema": {...},
  "relationships": [...],
  "validation": {...}
}`,
  variables: ["description", "schemaType", "relatedSchemas"],
  examples: [
    {
      input: {
        description: "User profile with authentication",
        schemaType: "database",
        relatedSchemas: "roles, permissions"
      },
      output: "{...}"
    }
  ]
};

await fetch('/api/prompts/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(template)
});
```

---

## Long-Running Tasks

### How It Works

1. **Task Submission** - Task is created with status `submitted`
2. **Polling Service** - Background service checks tasks every 5 seconds
3. **Status Updates** - Task status changes: `processing` → `completed`/`failed`
4. **Notification** - Workflow continues execution when task completes

### Creating a Long-Running Task

```javascript
// In a custom task handler
const longRunningTask = await crudService.createLongRunningTask({
  execution_id: context.runId,
  task_type: 'ml-training',
  external_id: trainingJobId,
  status: 'submitted',
  status_url: `https://ml-service.com/jobs/${trainingJobId}/status`,
  polling_interval_seconds: 10,
  max_polling_attempts: 360 // 1 hour max
});

// Wait for completion
const result = await orchestrator.waitForTaskCompletion(
  longRunningTask.task_id,
  3600 // 1 hour timeout
);
```

### Callback Pattern

For services that support callbacks:

```javascript
// Task handler includes callback URL
const webhookUrl = `${process.env.API_URL}/api/workflows/callback/${taskId}`;

await externalService.submitJob({
  data: taskData,
  callbackUrl: webhookUrl
});

// External service POSTs to callback when done
// POST /api/workflows/callback/:taskId
// { status: 'completed', result: {...} }
```

---

## n8n Integration

### Connecting to n8n

```javascript
// Configure n8n
const n8nConfig = {
  apiUrl: 'http://localhost:5678/api/v1',
  apiKey: process.env.N8N_API_KEY,
  webhookUrl: 'http://localhost:5678/webhook'
};

// Create n8n task
const n8nTask = {
  name: "Run n8n Workflow",
  task_type: "n8n",
  ordering: 2,
  handler_config: {
    n8nWorkflowId: "workflow_123",
    input: {
      url: "{{task_1.output.url}}",
      depth: 3
    },
    timeout: 600
  },
  dependencies: ["task_1"]
};
```

### n8n Workflow Template

Example n8n workflow that integrates with LightDom:

```json
{
  "name": "LightDom Integration",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "lightdom/crawler",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const data = items[0].json;\n// Process data\nreturn [{ json: result }];"
      }
    },
    {
      "name": "Callback to LightDom",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{$json._callbackUrl}}",
        "jsonParameters": true,
        "options": {
          "bodyParametersJson": "{\"status\":\"completed\",\"result\":{{$json}}}"
        }
      }
    }
  ]
}
```

---

## Monitoring & Metrics

### Real-Time Status Updates

```javascript
// Subscribe to workflow events
orchestrator.on('workflow:started', ({ runId, workflowId }) => {
  console.log(`Workflow ${workflowId} started: ${runId}`);
});

orchestrator.on('task:completed', ({ taskId, runId, result }) => {
  console.log(`Task ${taskId} completed in run ${runId}`);
});

orchestrator.on('workflow:failed', ({ runId, error }) => {
  console.error(`Workflow failed: ${error}`);
});
```

### Metrics Dashboard Data

```javascript
// Get workflow performance metrics
const metrics = await fetch(
  `/api/workflows/${workflowId}/metrics?start_date=2025-11-01&end_date=2025-11-04`
);

const data = await metrics.json();
// Returns: total_runs, successful_runs, failed_runs, avg_execution_time_ms
```

### System Health Monitoring

```javascript
// Record current system health
await fetch('/api/system/health', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    active_workflows: 5,
    running_tasks: 12,
    queued_tasks: 3,
    deepseek_queue_size: 2,
    avg_response_time_ms: 250,
    error_rate_percentage: 0.5,
    cpu_usage_percentage: 45.2,
    memory_usage_mb: 512
  })
});
```

---

## Examples & Templates

### Example 1: SEO Crawler Workflow

```javascript
const seoWorkflow = {
  name: "SEO Analysis Pipeline",
  workflow_type: "sequential",
  status: "active",
  tasks: [
    {
      name: "Discover URLs",
      task_type: "crawler",
      ordering: 1,
      handler_config: {
        startUrl: "{{input.website}}",
        maxDepth: 2,
        maxPages: 50
      }
    },
    {
      name: "Analyze SEO with AI",
      task_type: "deepseek",
      ordering: 2,
      handler_config: {
        promptTemplateId: "seo-analysis-v1",
        variables: {
          pages: "{{task_1.output.pages}}"
        }
      },
      dependencies: ["task_1"]
    },
    {
      name: "Generate Report",
      task_type: "n8n",
      ordering: 3,
      handler_config: {
        n8nWorkflowId: "seo_report_generator",
        input: {
          analysis: "{{task_2.output}}"
        }
      },
      dependencies: ["task_2"]
    }
  ]
};
```

### Example 2: Data Mining Workflow

```javascript
const dataMiningWorkflow = {
  name: "Competitive Intelligence",
  workflow_type: "parallel",
  status: "active",
  tasks: [
    {
      name: "Crawl Competitor A",
      task_type: "crawler",
      ordering: 1,
      handler_config: { url: "competitor-a.com" }
    },
    {
      name: "Crawl Competitor B",
      task_type: "crawler",
      ordering: 1,
      handler_config: { url: "competitor-b.com" }
    },
    {
      name: "Compare & Analyze",
      task_type: "deepseek",
      ordering: 2,
      handler_config: {
        promptTemplateId: "competitive-analysis-v1",
        variables: {
          dataA: "{{task_1.output}}",
          dataB: "{{task_2.output}}"
        }
      },
      dependencies: ["task_1", "task_2"]
    }
  ]
};
```

### Example 3: Schema Generation Workflow

```javascript
const schemaWorkflow = {
  name: "Auto-Generate Database Schema",
  workflow_type: "sequential",
  status: "active",
  tasks: [
    {
      name: "Generate Schema from Description",
      task_type: "deepseek",
      ordering: 1,
      handler_config: {
        promptTemplateId: "schema-generation-v1",
        variables: {
          description: "{{input.description}}",
          requirements: "{{input.requirements}}"
        },
        parseJson: true
      }
    },
    {
      name: "Validate Schema",
      task_type: "api",
      ordering: 2,
      handler_config: {
        method: "POST",
        url: "https://schema-validator.com/validate",
        body: "{{task_1.output}}"
      },
      dependencies: ["task_1"]
    },
    {
      name: "Store Schema",
      task_type: "database",
      ordering: 3,
      handler_config: {
        query: "INSERT INTO generated_schemas (...) VALUES (...)",
        params: ["{{task_1.output}}"]
      },
      dependencies: ["task_2"]
    }
  ]
};
```

---

## Troubleshooting

### Common Issues

#### 1. Workflow Not Starting
- Check workflow status is `active`
- Verify all task dependencies are valid
- Check database connection

#### 2. Long-Running Task Stuck
- Verify polling interval is appropriate
- Check status_url is accessible
- Review max_polling_attempts setting

#### 3. DeepSeek API Errors
- Verify API key is correct
- Check rate limits
- Review prompt template format

#### 4. n8n Integration Issues
- Ensure n8n is running and accessible
- Verify webhook URL is correct
- Check n8n workflow is activated

---

## Next Steps

1. ✅ **Set up database** - Run the SQL schema
2. ✅ **Configure environment** - Set API keys and URLs
3. ✅ **Create prompt templates** - Add your domain-specific templates
4. ✅ **Build first workflow** - Follow the step-by-step guide
5. ✅ **Test execution** - Run and monitor your workflow
6. ✅ **Integrate n8n** - Connect visual workflow editor
7. ✅ **Add monitoring** - Set up metrics collection
8. ✅ **Scale up** - Add more workflows and automations

---

## Support & Documentation

- **API Documentation**: [Full API Reference](/docs/api-reference.md)
- **Database Schema**: [Schema Documentation](/docs/database-schema.md)
- **Prompt Templates**: [Template Library](/docs/prompt-templates.md)
- **n8n Integration**: [Integration Guide](/docs/n8n-integration.md)

---

**Built with ❤️ for the LightDom Platform**
