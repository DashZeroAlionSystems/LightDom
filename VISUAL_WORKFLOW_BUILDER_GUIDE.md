# N8N Visual Workflow Builder Guide

Complete guide for using DeepSeek AI to generate n8n workflows from natural language descriptions.

## Overview

The N8N Visual Workflow Builder integrates DeepSeek AI with n8n to enable intelligent workflow creation. Simply describe what you want in plain English, and the system generates a complete, production-ready n8n workflow.

## Features

- ✅ Natural language to n8n workflow conversion
- ✅ Template-based workflow creation
- ✅ Node configuration and connection optimization  
- ✅ Deployment to running n8n Docker instance
- ✅ Workflow versioning and rollback
- ✅ Visual builder UI integration
- ✅ Best practices enforcement
- ✅ Error handling automation

## Quick Start

### Generate Workflow from Prompt

```javascript
import { N8NVisualWorkflowBuilder } from './services/n8n-visual-workflow-builder.js';

const builder = new N8NVisualWorkflowBuilder({
  n8nBaseUrl: 'http://localhost:5678',
  n8nApiKey: process.env.N8N_API_KEY,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY
});

const workflow = await builder.generateFromPrompt({
  prompt: `Create a workflow that:
    1. Triggers when a product schema is discovered
    2. Validates the schema structure
    3. Saves to PostgreSQL database
    4. Sends Slack notification
    5. Updates seeding configuration
  `,
  campaignId: 'campaign_123',
  variables: {
    database: 'lightdom_blockchain',
    slackChannel: '#alerts'
  }
});

// Deploy to n8n
const result = await builder.deployToN8N(workflow);
console.log(`Workflow deployed: ${result.url}`);
```

### Use Template

```javascript
const workflow = await builder.generateFromPrompt({
  useTemplate: 'schema-processing',
  campaignId: 'campaign_123',
  variables: {
    notificationEmail: 'admin@example.com',
    database: 'lightdom_blockchain'
  }
});
```

## Workflow Templates

### Schema Processing
Processes discovered schemas with validation and storage:
- Webhook trigger
- Schema validation
- PostgreSQL insert
- Email notification

### URL Validation
Validates and enriches collected URLs:
- Webhook trigger
- robots.txt check
- URL enrichment
- Queue insertion

### Data Processing
Processes mined data with OCR and extraction:
- Webhook trigger
- Schema extraction
- OCR processing
- Database storage

## Generated Workflow Structure

DeepSeek AI generates complete n8n workflows:

```json
{
  "name": "Product Schema Processing",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Schema Discovered Webhook",
      "parameters": {
        "path": "schema-discovered",
        "method": "POST"
      },
      "position": [0, 0]
    },
    {
      "type": "n8n-nodes-base.function",
      "name": "Validate Schema",
      "parameters": {
        "functionCode": "const schema = items[0].json.schema;\nif (!schema.type || !schema.fields) {\n  throw new Error('Invalid schema');\n}\nreturn items;"
      },
      "position": [200, 0]
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Save to Database",
      "parameters": {
        "operation": "insert",
        "table": "discovered_schemas",
        "columns": ["schema_type", "fields", "url", "campaign_id"]
      },
      "position": [400, 0]
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Send Notification",
      "parameters": {
        "channel": "#alerts",
        "text": "New schema discovered: {{$json['schema']['type']}}"
      },
      "position": [600, 0]
    }
  ],
  "connections": {
    "Schema Discovered Webhook": {
      "main": [[{"node": "Validate Schema", "type": "main", "index": 0}]]
    },
    "Validate Schema": {
      "main": [[{"node": "Save to Database", "type": "main", "index": 0}]]
    },
    "Save to Database": {
      "main": [[{"node": "Send Notification", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "timezone": "UTC",
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "tags": [
    {"name": "auto-generated"},
    {"name": "campaign-campaign_123"}
  ]
}
```

## API Reference

### Generate Workflow
```
POST /api/n8n/workflows/generate
Body: {
  prompt: string,
  campaignId: string,
  useTemplate?: string,
  variables?: object
}
Response: { workflow, validated: boolean }
```

### Deploy Workflow
```
POST /api/n8n/workflows/deploy
Body: { workflow: object }
Response: { success: true, workflowId: string, url: string }
```

### List Templates
```
GET /api/n8n/workflows/templates
Response: [{ id, name, description, nodeCount }, ...]
```

### Get Workflow
```
GET /api/n8n/workflows/:id
Response: { workflow object }
```

### Update Workflow
```
PATCH /api/n8n/workflows/:id
Body: { workflow: object }
Response: { success: true, workflowId: string }
```

### Execute Workflow
```
POST /api/n8n/workflows/:id/execute
Body: { data: object }
Response: { success: true, executionId: string }
```

## Prompt Engineering Tips

### Good Prompts

✅ **Specific and Sequential**
```
Create a workflow that:
1. Triggers when data is mined
2. Extracts all schema.org schemas
3. Validates schema structure
4. Saves to PostgreSQL table "schemas"
5. Sends email to admin@example.com
```

✅ **Include Context**
```
For campaign_123, create a workflow that monitors error rates
and automatically pauses the campaign if errors exceed 10%.
Send Slack notification to #alerts channel.
```

✅ **Specify Error Handling**
```
Create workflow with:
- Main flow: validate and save data
- Error flow: log error, send alert, retry 3 times
- Success flow: update statistics
```

### Bad Prompts

❌ **Too Vague**
```
Make a workflow for my campaign
```

❌ **Missing Details**
```
Send notification when something happens
```

❌ **Conflicting Requirements**
```
Process data synchronously but also don't wait for completion
```

## Best Practices

### 1. Always Include Error Handling

```javascript
const workflow = await builder.generateFromPrompt({
  prompt: `Main flow: process data and save
           Error flow: log error, send alert, retry 3 times
           Finally: update statistics`,
  ...
});
```

### 2. Use Validation Nodes

DeepSeek automatically includes validation, but you can be explicit:

```javascript
prompt: `
  1. Webhook trigger
  2. **Validate input** (check required fields)
  3. Process data
  4. **Validate output** (check schema)
  5. Save to database
`
```

### 3. Add Logging

```javascript
prompt: `
  For each step:
  - Log input data
  - Process
  - Log output data
  - Continue
`
```

### 4. Optimize Connections

The builder automatically optimizes workflows:
- Removes duplicate nodes
- Eliminates circular references
- Consolidates parallel paths

```javascript
const optimized = builder.optimizeWorkflow(workflow);
```

## Integration with Campaign System

Workflows are auto-created for campaigns:

```javascript
import { CampaignInstanceOrchestrator } from './services/campaign-instance-orchestrator.js';

const campaign = await orchestrator.createCampaignWithInstances({
  campaignId: 'campaign_123',
  name: 'E-commerce Mining',
  options: {
    autoSetupTriggers: true, // Creates default workflows
    workflows: {
      custom: [
        {
          prompt: 'Monitor error rates and auto-pause',
          variables: { threshold: 0.1 }
        }
      ]
    }
  }
});
```

## Visual Builder UI

React component for visual workflow creation:

```tsx
import { VisualWorkflowBuilder } from './components/VisualWorkflowBuilder';

<VisualWorkflowBuilder
  campaignId="campaign_123"
  onWorkflowCreated={(workflow) => {
    console.log('Workflow created:', workflow.id);
  }}
  templates={['schema-processing', 'url-validation', 'data-processing']}
/>
```

## Troubleshooting

### Workflow Validation Errors

```javascript
const validation = builder.validateWorkflow(workflow);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Common Issues

**Issue**: "Workflow name is required"
**Solution**: Always include a descriptive name in your prompt

**Issue**: "Connection references non-existent node"
**Solution**: Run `builder.optimizeWorkflow()` before deploying

**Issue**: "Failed to deploy workflow"
**Solution**: Check n8n API key and connection

## Advanced Features

### Custom Node Types

Add custom nodes to generated workflows:

```javascript
workflow.nodes.push({
  type: 'custom-node-type',
  name: 'Custom Processor',
  parameters: { /* custom config */ }
});
```

### Workflow Versioning

```javascript
// Save current version before update
const currentWorkflow = await builder.getWorkflow(workflowId);
await saveToVersionHistory(currentWorkflow);

// Update workflow
await builder.updateWorkflow(workflowId, newWorkflow);
```

### Batch Generation

Generate multiple workflows at once:

```javascript
const prompts = [
  'Monitor schemas',
  'Validate URLs',
  'Process data'
];

const workflows = await Promise.all(
  prompts.map(prompt => builder.generateFromPrompt({ prompt, campaignId }))
);

// Deploy all
for (const workflow of workflows) {
  await builder.deployToN8N(workflow);
}
```

## Conclusion

The N8N Visual Workflow Builder with DeepSeek AI integration enables non-technical users to create production-ready automation workflows. Simply describe what you want, and the system handles all the complexity of n8n workflow configuration.
