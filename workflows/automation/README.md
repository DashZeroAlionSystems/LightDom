# n8n Workflow Examples and Patterns

This directory contains n8n workflow templates and examples for the LightDom project.

## Directory Structure

```
workflows/automation/
├── n8n-workflow-templates.json    # Pre-built workflow templates
├── ollama-prompts/                 # Prompt engineering templates
│   └── prompt-templates.json
├── generated/                      # AI-generated workflows
├── ci-cd/                         # CI/CD workflows
├── monitoring/                    # Monitoring workflows
└── security/                      # Security workflows
```

## Workflow Templates

### Available Templates

The `n8n-workflow-templates.json` file contains several pre-built workflow templates:

1. **DOM Analysis Workflow** - Comprehensive DOM analysis for optimization
2. **JavaScript Execution Workflow** - Execute custom JavaScript in headless Chrome
3. **Cursor API Workflow** - Execute Cursor API functions through n8n
4. **Optimization Pipeline** - Complete DOM optimization with Cursor and n8n integration

### Using Templates

#### Load Template Programmatically

```javascript
const fs = require('fs');
const templates = JSON.parse(fs.readFileSync('n8n-workflow-templates.json'));

// Access specific template
const domWorkflow = templates.dom_analysis_workflow;
console.log(domWorkflow.name);
console.log(domWorkflow.nodes.length);
```

#### Import to n8n

1. Copy the workflow JSON from the template
2. Open n8n UI
3. Click "Import from File" or "Import from URL"
4. Paste the JSON
5. Activate the workflow

## Generating Workflows with AI

### Using the Workflow Builder

```bash
# Interactive mode
npm run n8n:workflow:build:interactive

# Generate specific workflow
npm run n8n:workflow:build -- --generate "Create a workflow for email automation"

# Batch generate from file
npm run n8n:workflow:batch -- descriptions.txt
```

### Workflow Description Format

When describing workflows for AI generation, be specific:

**Good Description:**
```
Create a workflow that:
1. Triggers on webhook POST to /api/analyze
2. Validates input has 'url' field
3. Crawls the URL with Puppeteer
4. Extracts DOM metrics
5. Stores results in PostgreSQL
6. Returns analysis via webhook response
```

**Poor Description:**
```
Make a workflow for web stuff
```

## Workflow Patterns

### Pattern 1: Webhook Triggered

```json
{
  "trigger": "webhook",
  "steps": [
    "validate_input",
    "process_data",
    "store_result",
    "send_response"
  ]
}
```

**Use Cases:**
- API endpoints
- External integrations
- Real-time processing

### Pattern 2: Scheduled Tasks

```json
{
  "trigger": "schedule",
  "steps": [
    "fetch_data",
    "transform_data",
    "store_data",
    "send_notification"
  ]
}
```

**Use Cases:**
- Data synchronization
- Report generation
- Monitoring checks

### Pattern 3: Event-Driven

```json
{
  "trigger": "event",
  "steps": [
    "check_condition",
    "execute_action",
    "log_result"
  ]
}
```

**Use Cases:**
- Database triggers
- File system watchers
- Message queue processing

## Common Node Types

### Triggers
- `n8n-nodes-base.webhook` - HTTP webhook trigger
- `n8n-nodes-base.cron` - Scheduled trigger
- `n8n-nodes-base.manualTrigger` - Manual execution

### Processing
- `n8n-nodes-base.function` - Execute JavaScript
- `n8n-nodes-base.code` - Execute Python or custom code
- `n8n-nodes-base.httpRequest` - Make HTTP requests

### Data
- `n8n-nodes-base.postgres` - PostgreSQL operations
- `n8n-nodes-base.redis` - Redis operations
- `n8n-nodes-base.mongodb` - MongoDB operations

### Utilities
- `n8n-nodes-base.wait` - Delay execution
- `n8n-nodes-base.merge` - Combine data from multiple sources
- `n8n-nodes-base.if` - Conditional routing

### Responses
- `n8n-nodes-base.respondToWebhook` - Send webhook response
- `n8n-nodes-base.emailSend` - Send emails
- `n8n-nodes-base.slack` - Slack notifications

## Best Practices

### 1. Error Handling

Always include error handling nodes:

```json
{
  "id": "error-handler",
  "type": "n8n-nodes-base.function",
  "name": "Error Handler",
  "onError": "continueErrorOutput",
  "parameters": {
    "functionCode": "// Log error and return gracefully"
  }
}
```

### 2. Input Validation

Validate inputs early in the workflow:

```json
{
  "id": "validate",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "if (!$json.url) throw new Error('URL required');"
  }
}
```

### 3. Logging

Add logging for debugging:

```json
{
  "id": "log",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://localhost:3001/api/logs",
    "body": "={{ JSON.stringify($json) }}"
  }
}
```

### 4. Configuration

Use environment variables for configuration:

```json
{
  "parameters": {
    "url": "={{ $env.API_BASE_URL }}/endpoint"
  }
}
```

### 5. Reusability

Design modular workflows that can be combined:

- Keep workflows focused on single tasks
- Use sub-workflows for complex processes
- Extract common patterns into templates

## Testing Workflows

### 1. Local Testing

```bash
# Start n8n locally
npm run n8n:start

# Access UI
open http://localhost:5678

# Execute workflow manually
# Check execution logs
```

### 2. Webhook Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:5678/webhook/test-workflow \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 3. Integration Testing

Use the test suite:

```bash
node scripts/automation/test-cursor-n8n-integration.js
```

## Workflow Examples

### Example 1: DOM Analysis API

```json
{
  "name": "DOM Analysis API",
  "nodes": [
    {
      "id": "webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "analyze-dom"
      }
    },
    {
      "id": "validate",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "if (!$json.url) throw new Error('URL required'); return [$json];"
      }
    },
    {
      "id": "crawl",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3001/api/crawl",
        "body": "={{ JSON.stringify({ url: $json.url }) }}"
      }
    },
    {
      "id": "respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify($json) }}"
      }
    }
  ],
  "connections": {
    "webhook": { "main": [["validate"]] },
    "validate": { "main": [["crawl"]] },
    "crawl": { "main": [["respond"]] }
  }
}
```

### Example 2: Scheduled Report Generation

See `n8n-workflow-templates.json` for complete examples.

## Troubleshooting

### Workflow Not Executing

1. Check workflow is activated
2. Verify trigger configuration
3. Check n8n logs: `npm run n8n:logs`
4. Test manually in n8n UI

### Connection Errors

1. Verify API endpoints are accessible
2. Check credentials configuration
3. Review firewall/network settings
4. Test with curl or Postman first

### Invalid JSON

1. Use JSON validator
2. Check for trailing commas
3. Verify node IDs are unique
4. Ensure connections reference existing nodes

## Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [Workflow Examples Repository](https://n8n.io/workflows)
- [LightDom Integration Guide](../../OLLAMA_N8N_INTEGRATION_GUIDE.md)

## Contributing

When adding new templates:

1. Follow the existing JSON structure
2. Include clear descriptions
3. Add error handling
4. Document required credentials
5. Provide usage examples
6. Test thoroughly

## License

MIT - See LICENSE file for details
