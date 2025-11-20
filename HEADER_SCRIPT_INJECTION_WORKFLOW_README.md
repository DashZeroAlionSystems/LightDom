# Header Script Injection Workflow System

Complete workflow system for managing client site header script injection with n8n and DeepSeek AI integration.

## Overview

This system provides an end-to-end solution for:
- 🚀 **Easy client onboarding** with automated header script generation
- 📊 **Real-time monitoring** of injected scripts
- ⚡ **Automatic optimizations** pushed to client sites
- 🤖 **DeepSeek AI integration** for workflow creation and management
- 📈 **Comprehensive tracking** of injection status and performance

## Architecture

```
┌─────────────────┐
│  Client Sites   │ ← Header Script Injected
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   API Server    │ ← Express.js with WebSocket
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌───────┐  ┌──────────┐
│  n8n  │  │ DeepSeek │ ← Workflow Generation & Management
└───┬───┘  └────┬─────┘
    │           │
    └─────┬─────┘
          ↓
    ┌──────────┐
    │PostgreSQL│ ← Client Data & Workflow Logs
    └──────────┘
```

## Database Schema

### Tables

#### `seo_clients` (enhanced)
Stores client site information with script injection tracking:
```sql
- id: UUID (primary key)
- domain: VARCHAR(255) (unique)
- api_key: VARCHAR(64) (unique)
- script_injected: BOOLEAN
- script_injection_date: TIMESTAMP
- injection_workflow_id: VARCHAR(255)
- monitoring_workflow_id: VARCHAR(255)
- optimization_workflow_id: VARCHAR(255)
- header_script_content: TEXT
- script_version: VARCHAR(50)
- last_script_update: TIMESTAMP
- auto_optimize: BOOLEAN
- realtime_updates: BOOLEAN
```

#### `script_injection_events`
Tracks all script injection activities:
```sql
- id: UUID (primary key)
- client_id: UUID (foreign key)
- event_type: VARCHAR(50) (injection, update, removal, error)
- workflow_id: VARCHAR(255)
- script_version: VARCHAR(50)
- status: VARCHAR(50) (pending, success, failed, rolled_back)
- details: JSONB
- error_message: TEXT
- created_at: TIMESTAMP
```

#### `workflow_execution_logs`
Logs all workflow executions:
```sql
- id: UUID (primary key)
- workflow_id: VARCHAR(255)
- client_id: UUID (foreign key)
- execution_id: VARCHAR(255)
- status: VARCHAR(50) (running, completed, failed, cancelled)
- input_data: JSONB
- output_data: JSONB
- error_message: TEXT
- execution_time_ms: INTEGER
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
```

## API Endpoints

### Client Site Management

#### Create Client Site
```http
POST /api/client-sites
Content-Type: application/json

{
  "domain": "example.com",
  "userId": "uuid",
  "subscriptionTier": "starter",
  "config": {}
}
```

Response:
```json
{
  "success": true,
  "client": {
    "id": "uuid",
    "domain": "example.com",
    "apiKey": "generated-key-store-securely",
    "subscriptionTier": "starter",
    "status": "active"
  }
}
```

#### Generate Header Script
```http
POST /api/client-sites/{clientId}/generate-script
Content-Type: application/json

{
  "autoOptimize": true,
  "realtimeUpdates": true
}
```

Response:
```json
{
  "success": true,
  "headerScript": "<!-- LightDom script -->...",
  "scriptVersion": "v1.0.0",
  "instructions": {
    "step1": "Copy the header script above",
    "step2": "Paste it in the <head> section...",
    ...
  }
}
```

#### Create Workflows for Client
```http
POST /api/client-sites/{clientId}/create-workflows
Content-Type: application/json

{
  "workflowTypes": ["injection", "monitoring", "optimization"],
  "useDeepseek": false
}
```

Response:
```json
{
  "success": true,
  "workflows": {
    "injection": {
      "id": "workflow-id",
      "name": "Client Header Script Injection - example.com",
      "active": true
    },
    "monitoring": {...},
    "optimization": {...}
  }
}
```

#### Get Injection Status
```http
GET /api/client-sites/{clientId}/injection-status
```

Response:
```json
{
  "success": true,
  "client": {
    "id": "uuid",
    "domain": "example.com",
    "script_injected": true,
    "script_version": "v1.0.0",
    ...
  },
  "injectionHistory": [...],
  "workflowExecutions": [...]
}
```

### DeepSeek Workflow Management

#### Chat with DeepSeek
```http
POST /api/deepseek-workflows/chat
Content-Type: application/json

{
  "message": "Create a workflow to monitor example.com every 15 minutes",
  "conversationHistory": []
}
```

#### List Workflow Templates
```http
GET /api/deepseek-workflows/templates?category=header-script
```

#### Create Workflow from Template
```http
POST /api/deepseek-workflows/from-template
Content-Type: application/json

{
  "templateName": "scriptInjection",
  "customName": "My Custom Injection Workflow",
  "clientId": "uuid",
  "activate": true
}
```

#### Generate Workflow from Description
```http
POST /api/deepseek-workflows/generate
Content-Type: application/json

{
  "description": "Monitor client site performance and alert if load time exceeds 3 seconds",
  "requirements": [
    "Check every 30 minutes",
    "Send email alerts",
    "Log all metrics to database"
  ],
  "context": {
    "clientId": "uuid",
    "domain": "example.com"
  }
}
```

#### Execute Workflow
```http
POST /api/deepseek-workflows/{workflowId}/execute
Content-Type: application/json

{
  "inputData": {
    "targetUrl": "https://example.com"
  },
  "logExecution": true
}
```

## Workflow Templates

### 1. Script Injection Workflow
Generates and tracks header script for client sites.

**Trigger:** Webhook (`POST /webhook/client/script-injection`)

**Flow:**
1. Validate Client Data
2. Generate Header Script
3. Store in Database
4. Log Injection Event
5. Send Success Notification

**n8n Nodes:**
- Webhook Trigger
- Function (Validation)
- Function (Script Generation)
- Postgres (Store)
- Postgres (Log Event)
- HTTP Request (Notification)

### 2. Site Monitoring Workflow
Monitors client sites with injected scripts every 15 minutes.

**Trigger:** Schedule (every 15 minutes)

**Flow:**
1. Get Active Clients
2. For Each Client
3. Check Site Health
4. Verify Script Injection
5. Update Monitoring Status
6. Alert if Issues

**n8n Nodes:**
- Schedule Trigger
- Postgres (Get Clients)
- Split In Batches
- HTTP Request (Check Site)
- Function (Verify Script)
- Postgres (Update Status)
- IF Node (Check Issues)
- HTTP Request (Send Alert)

### 3. Optimization Update Workflow
Automatically pushes SEO optimizations to client sites.

**Trigger:** Webhook (`POST /webhook/optimization/push-update`)

**Flow:**
1. Get Client Info
2. Generate Optimization
3. Push to Client
4. Log Update
5. Notify Success

**n8n Nodes:**
- Webhook Trigger
- Postgres (Get Client)
- Function (Generate Optimization)
- HTTP Request (Push)
- Postgres (Log)
- HTTP Request (Notify)

## DeepSeek Integration

### Available Tools

DeepSeek has access to the following workflow management tools:

1. **list_workflow_templates** - List all available templates
2. **create_workflow_from_template** - Create workflow from template
3. **create_custom_workflow** - Create custom workflow from scratch
4. **edit_workflow** - Edit existing workflow
5. **execute_workflow** - Execute workflow with input data
6. **get_workflow_status** - Get workflow status and details
7. **delete_workflow** - Delete workflow
8. **add_workflow_node** - Add node to existing workflow
9. **generate_workflow_from_description** - Generate from natural language

### Example Conversations

#### Create Monitoring Workflow
```
User: "I need a workflow to monitor example.com every hour and alert me if the site is down"

DeepSeek: "I'll create a monitoring workflow for you. Let me use the appropriate template and customize it."
[Uses: create_workflow_from_template with monitoring template]

Result: Workflow created with hourly schedule and email alerts configured
```

#### Generate Custom Workflow
```
User: "Create a workflow that fetches data from an API, processes it with custom logic, and stores results in our database"

DeepSeek: "I'll generate a custom workflow for you."
[Uses: generate_workflow_from_description]

Result: Complete n8n workflow with HTTP Request, Function, and Postgres nodes
```

## Quick Start

### 1. Run Database Migration
```bash
npm run db:migrate
# Or manually:
psql $DATABASE_URL < migrations/20251116_add_script_injection_tracking.sql
```

### 2. Configure Environment
```bash
# .env
DATABASE_URL=postgresql://...
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-n8n-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
LIGHTDOM_CDN_URL=https://cdn.lightdom.io/seo/v1/lightdom-seo.js
```

### 3. Start Services
```bash
# Start n8n (in separate terminal)
n8n start

# Start API server
npm run api
```

### 4. Create Your First Client

#### Using API
```bash
curl -X POST http://localhost:3001/api/client-sites \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "subscriptionTier": "starter"
  }'
```

#### Using DeepSeek
```bash
curl -X POST http://localhost:3001/api/deepseek-workflows/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a new client site for example.com and set up all workflows"
  }'
```

### 5. Generate Header Script
```bash
curl -X POST http://localhost:3001/api/client-sites/{clientId}/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "autoOptimize": true,
    "realtimeUpdates": true
  }'
```

Copy the returned script and paste it into your client's website `<head>` section.

### 6. Create Workflows
```bash
curl -X POST http://localhost:3001/api/client-sites/{clientId}/create-workflows \
  -H "Content-Type: application/json" \
  -d '{
    "workflowTypes": ["injection", "monitoring", "optimization"]
  }'
```

## Monitoring & Debugging

### Check Injection Status
```bash
curl http://localhost:3001/api/client-sites/{clientId}/injection-status | jq .
```

### View Workflow Execution Logs
```sql
SELECT * FROM workflow_execution_logs
WHERE client_id = 'uuid'
ORDER BY started_at DESC
LIMIT 10;
```

### View Script Injection Events
```sql
SELECT * FROM script_injection_events
WHERE client_id = 'uuid'
ORDER BY created_at DESC;
```

### Check n8n Workflow Status
```bash
curl http://localhost:3001/api/deepseek-workflows/{workflowId}/status
```

## Advanced Usage

### Custom Workflow with DeepSeek

Create a completely custom workflow using natural language:

```javascript
const response = await fetch('http://localhost:3001/api/deepseek-workflows/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: `
      Create a workflow that:
      1. Monitors example.com for new blog posts
      2. Extracts SEO data from each post
      3. Generates optimization recommendations
      4. Sends a weekly summary email
    `,
    requirements: [
      'Run daily at 6 AM',
      'Store all data in PostgreSQL',
      'Use our existing seo_analytics table',
      'Include error handling and retries'
    ],
    context: {
      clientId: 'uuid',
      domain: 'example.com'
    }
  })
});

const result = await response.json();
console.log('Generated workflow:', result.workflow);
```

### Programmatic Workflow Management

```javascript
import DeepSeekWorkflowManager from './services/deepseek-workflow-manager.js';

const manager = new DeepSeekWorkflowManager();

// Create from template
const workflow = await manager.createWorkflowFromTemplate({
  templateName: 'scriptInjection',
  customName: 'Custom Script Injection',
  clientId: 'client-uuid',
  activate: true
});

// Execute workflow
const execution = await manager.executeWorkflow(
  workflow.workflow.id,
  { targetUrl: 'https://example.com' },
  true // log execution
);

// Add custom node
await manager.addWorkflowNode(
  workflow.workflow.id,
  {
    name: 'Custom Processing',
    type: 'n8n-nodes-base.function',
    parameters: {
      functionCode: 'return items;'
    }
  },
  'Validate Client Data' // connect to this node
);
```

## Troubleshooting

### Script Not Injecting
1. Check client status: `GET /api/client-sites/{clientId}`
2. Verify workflow is active in n8n
3. Check injection events: `GET /api/client-sites/{clientId}/injection-status`
4. Review workflow execution logs in database

### Workflow Not Executing
1. Check n8n connection: `GET /api/n8n/health`
2. Verify workflow ID is correct
3. Check workflow status: `GET /api/deepseek-workflows/{workflowId}/status`
4. Review n8n error logs

### DeepSeek Not Responding
1. Verify API key is set: `echo $DEEPSEEK_API_KEY`
2. Check API URL configuration
3. Test with simple chat request
4. Review rate limits and quotas

## Best Practices

### Security
- ✅ Store API keys securely (never commit to git)
- ✅ Use environment variables for configuration
- ✅ Hash API keys in database (SHA-256)
- ✅ Implement rate limiting on public endpoints
- ✅ Validate all client inputs
- ✅ Use HTTPS for all external communications

### Performance
- ✅ Use connection pooling for database
- ✅ Implement caching where appropriate
- ✅ Set reasonable workflow timeouts
- ✅ Batch workflow executions when possible
- ✅ Monitor execution times and optimize slow workflows

### Maintenance
- ✅ Regularly review workflow execution logs
- ✅ Archive old injection events
- ✅ Monitor n8n instance health
- ✅ Keep workflow templates updated
- ✅ Test workflows in staging before production

## Migration Guide

### Migrating from Manual Script Injection

1. **Export existing client data** to CSV
2. **Run migration script** to import into `seo_clients` table
3. **Generate header scripts** for all existing clients
4. **Create workflows** for each client
5. **Update client sites** with new header scripts
6. **Monitor migration** for 24-48 hours
7. **Decommission old system** after validation

### Updating Workflow Templates

1. **Edit template** in `services/header-script-workflow-templates.js`
2. **Test template** with sample client
3. **Version new template** (e.g., `scriptInjectionV2`)
4. **Deploy gradually** to subset of clients
5. **Monitor for issues**
6. **Roll out to all** after validation

## Contributing

### Adding New Workflow Templates

1. Add template to `services/header-script-workflow-templates.js`
2. Follow n8n schema standards
3. Include error handling
4. Add comprehensive comments
5. Test with real n8n instance
6. Update documentation

### Adding DeepSeek Tools

1. Add tool definition to `workflowTools` array
2. Implement handler in `executeToolCalls`
3. Add API route if needed
4. Update documentation
5. Test with DeepSeek chat interface

## Support

For issues, questions, or feature requests:
- 📧 Email: support@lightdom.io
- 💬 Discord: https://discord.gg/lightdom
- 🐛 GitHub Issues: https://github.com/DashZeroAlionSystems/LightDom/issues

## License

Proprietary - Private Use Only
