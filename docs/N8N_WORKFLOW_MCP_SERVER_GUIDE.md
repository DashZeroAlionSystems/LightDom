# N8N Workflow Lifecycle MCP Server

## Overview

This MCP (Model Context Protocol) server provides complete n8n workflow lifecycle management through AI-powered tools. It enables AI agents (Claude, DeepSeek, Cursor, etc.) to create, manage, and optimize n8n workflows with full stage-by-stage control.

## Features

- **Complete Workflow Creation**: Create workflows with all stages (triggers, actions, conditions, error handling, sub-workflows, response)
- **Stage-Based Execution**: Execute workflows starting from specific stages
- **Template System**: Create workflows from pre-built templates
- **Error Management**: Get errors, analyze with DeepSeek, track health scores
- **Execution Tracking**: Monitor workflow executions and history
- **DeepSeek Integration**: Enable AI-powered workflow management and optimization

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- N8N instance (optional, for syncing workflows)
- DeepSeek API key (optional, for error analysis)

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://localhost:5432/lightdom

# N8N (optional)
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key

# DeepSeek (optional)
DEEPSEEK_API_KEY=your_deepseek_key
```

## Usage

### Starting the MCP Server

```bash
# Using npm
npm run mcp:workflow-lifecycle

# Or directly with node
node src/mcp/n8n-workflow-lifecycle-mcp-server.ts
```

### MCP Configuration

Add to your MCP client configuration (e.g., Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "n8n-workflow-lifecycle": {
      "command": "node",
      "args": [
        "/path/to/LightDom/src/mcp/n8n-workflow-lifecycle-mcp-server.ts"
      ],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/lightdom",
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your_key"
      }
    }
  }
}
```

## Available Tools

### 1. create_complete_workflow

Create a complete workflow with all stages specified.

**Example**:
```
Create a complete workflow named "API Integration" with:
- Webhook trigger on path "/api-data"
- HTTP request action to fetch data from https://api.example.com
- Database action to store results
- Error handling enabled with notifications
- JSON response
```

**Response**: Workflow ID, name, stage information, node count

### 2. create_from_template

Create workflow from a pre-built template.

**Templates**:
- `complete_api_workflow` - API integration with all stages
- `scheduled_data_processor` - Cron-based data processing
- `event_driven_router` - Event routing with switch conditions

**Example**:
```
Create a workflow from template "complete_api_workflow" with config:
- webhookPath: "user-data"
- apiUrl: "https://api.example.com/users"
- enableRetry: true
- maxRetries: 3
- notifyOnError: true
```

### 3. execute_at_stage

Execute workflow starting from a specific stage/node.

**Example**:
```
Execute workflow wf_abc123 starting at stage "Process Data" with input:
{
  "userId": "12345",
  "action": "update"
}
```

**Use Cases**:
- Testing specific workflow stages
- Resuming failed workflows
- Partial workflow execution
- Stage-by-stage debugging

### 4. get_workflow_errors

Get error log for DeepSeek analysis.

**Example**:
```
Get all high-severity errors for workflow wf_abc123
```

**Response**: Errors with timestamp, severity, context, message

### 5. analyze_error

Request DeepSeek to analyze an error and provide fixes.

**Example**:
```
Analyze error exec_xyz789 in workflow wf_abc123
```

**Response**:
- Root cause analysis
- Suggested fixes
- Prevention strategies
- Priority level (1-5)

### 6. get_workflow_stats

Get comprehensive workflow statistics.

**Response**:
- Execution stats (total, success, failed, running)
- Performance metrics (avg execution time)
- Error summary by severity
- Health score (0-100)
- Recommendations for improvement

### 7. enable_deepseek_management

Enable DeepSeek to proactively manage a workflow.

**Capabilities**:
- Automatic error analysis
- Performance optimization
- Auto-fixing issues
- Proactive monitoring

### 8. list_templates

List all available workflow templates with stage information.

**Response**: Template ID, name, description, stages, config options

### 9. get_stage_types

Get all available N8N workflow stage types.

**Categories**:
1. **TRIGGERS**: Webhook, Schedule, Manual, Email, File, Database, SSE
2. **ACTIONS**: HTTP Request, Database, Function, File, Email, Command
3. **FLOW_CONTROL**: IF, Switch, Merge, Split in Batches, Loop
4. **ERROR_HANDLING**: Error Trigger, Node retries, Stop and Error
5. **SUB_WORKFLOWS**: Execute Workflow, Wait
6. **DATA**: Set, Filter, Aggregate, Sort
7. **RESPONSE**: Respond to Webhook, Return

### 10. list_workflows

List all workflows with execution statistics.

**Filters**: workflow_type, is_active, limit

### 11. start_workflow / stop_workflow

Activate or deactivate workflows.

### 12. get_execution_history

Get execution history for a workflow.

## Workflow Stages Explained

### Triggers (How Workflows Start)

- **Webhook**: HTTP endpoint that receives requests
- **Schedule (Cron)**: Run on schedule (e.g., every hour, daily)
- **Manual**: Trigger manually
- **Email**: Trigger on email receipt
- **File**: Trigger on file changes
- **Database**: Trigger on database events

### Actions (What Workflows Do)

- **HTTP Request**: Call external APIs
- **Database**: CRUD operations
- **Function/Code**: Custom JavaScript logic
- **File Operations**: Read/write files
- **Email**: Send emails
- **Command**: Execute shell commands

### Flow Control (How Workflows Branch)

- **IF**: Simple true/false branching
- **Switch**: Multiple conditional paths
- **Merge**: Combine data from multiple paths
- **Split in Batches**: Process large datasets in chunks

### Error Handling (Managing Failures)

- **Error Trigger**: Catch and handle errors
- **Node Retries**: Automatically retry failed nodes
- **Stop and Error**: Explicitly stop with error

### Sub-Workflows (Workflow Composition)

- **Execute Workflow**: Call other workflows
- **Wait**: Pause execution

### Data Transformation

- **Set**: Create/modify data fields
- **Filter**: Remove items that don't match criteria
- **Aggregate**: Combine/summarize data
- **Sort**: Order items

### Response (How Workflows End)

- **Respond to Webhook**: Send HTTP response
- **Return**: Return data to caller

## Stage-Based Execution

The MCP server supports executing workflows at specific stages, enabling:

### 1. Partial Execution

```
Execute workflow wf_abc123 starting at stage "Store Results"
```

Start from a specific node, skipping earlier stages.

### 2. Testing Individual Stages

```
Execute workflow wf_abc123 at stage "Validate Input" with test data
```

Test specific stages without running the entire workflow.

### 3. Resume Failed Workflows

```
Get workflow errors for wf_abc123
Analyze error exec_xyz789
Fix the issue
Execute at stage "Process Data" (skip failed stage)
```

### 4. Stage-by-Stage Debugging

```
1. Execute at stage "Fetch Data"
2. Check output
3. Execute at stage "Transform Data"
4. Check output
5. Continue...
```

## Example Conversations

### Example 1: Create Complete Workflow

**User**: "Create a workflow that processes incoming webhooks, validates the data, calls an external API, stores results in database, and handles errors"

**AI** (using MCP):
```
Using tool: create_complete_workflow
{
  "name": "Webhook Data Processor",
  "trigger": {
    "type": "WEBHOOK",
    "parameters": { "httpMethod": "POST", "path": "process-data" }
  },
  "actions": [
    {
      "name": "Validate Input",
      "type": "FUNCTION",
      "parameters": { "functionCode": "// validation code" }
    },
    {
      "name": "Call External API",
      "type": "HTTP_REQUEST",
      "parameters": { "url": "https://api.example.com" },
      "retry": { "enabled": true, "maxAttempts": 3 },
      "canFail": true
    },
    {
      "name": "Store Results",
      "type": "DATABASE",
      "parameters": { "operation": "insert", "table": "results" }
    }
  ],
  "errorHandling": { "enabled": true, "notify": true },
  "response": { "type": "json" }
}
```

**Response**: Workflow created with ID wf_abc123, 8 nodes, all stages configured

### Example 2: Analyze and Fix Errors

**User**: "What errors has my workflow wf_abc123 had?"

**AI**:
```
Using tool: get_workflow_errors
{ "workflowId": "wf_abc123" }
```

**Response**: 5 errors found (2 high, 3 medium)

**User**: "Analyze the high-severity error"

**AI**:
```
Using tool: analyze_error
{ "workflowId": "wf_abc123", "errorId": "exec_xyz789" }
```

**Response**:
- Root cause: API timeout (30s exceeded)
- Fix: Increase timeout to 60s, add exponential backoff
- Prevention: Implement circuit breaker pattern
- Priority: 4/5

### Example 3: Create from Template

**User**: "Create a scheduled workflow that processes data every hour"

**AI**:
```
Using tool: create_from_template
{
  "templateId": "scheduled_data_processor",
  "config": {
    "schedule": "0 * * * *",
    "dataSources": ["source1", "source2"],
    "aggregationType": "merge"
  },
  "name": "Hourly Data Processor"
}
```

**Response**: Workflow created from template with cron trigger, parallel processing, aggregation

### Example 4: Stage-Based Execution

**User**: "Test just the data validation stage of my workflow"

**AI**:
```
Using tool: execute_at_stage
{
  "workflowId": "wf_abc123",
  "stageName": "Validate Input",
  "data": { "test": "data" }
}
```

**Response**: Execution started at stage "Validate Input", execution ID exec_test123

## Monitoring and Optimization

### Health Score Calculation

The MCP server calculates workflow health scores (0-100) based on:
- Success rate (50 points max)
- Error rate (30 points max impact)
- Critical errors (5 points each)

### Recommendations

Based on health scores, the system provides:
- **Reliability**: Improve success rate
- **Performance**: Optimize execution time
- **Critical**: Fix critical errors immediately

## Integration with AI Agents

### Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "workflows": {
      "command": "node",
      "args": ["./src/mcp/n8n-workflow-lifecycle-mcp-server.ts"]
    }
  }
}
```

### Cursor IDE

Add to MCP settings in Cursor preferences.

### Custom Integration

The MCP server follows the Model Context Protocol standard and can be integrated with any MCP-compatible client.

## Message Format

All workflow events use standardized format:
```
[workflow][component][action] - [level] - message
```

Examples:
- `[workflow][mcp][create] - info - Complete workflow created`
- `[workflow][mcp][execute] - info - Workflow execution started`
- `[workflow][mcp][execute-stage] - info - Workflow execution started at stage: Process Data`
- `[workflow][mcp][analyze] - info - Error analyzed by DeepSeek`

## Troubleshooting

### MCP Server Not Starting

Check:
1. Database connection (DATABASE_URL)
2. Node.js version (18+)
3. MCP client configuration

### Workflows Not Executing

Check:
1. Workflow is active (`start_workflow` tool)
2. Required services are running
3. Error logs (`get_workflow_errors` tool)

### DeepSeek Analysis Not Working

Check:
1. DEEPSEEK_API_KEY is set
2. DeepSeek service is available
3. Enable DeepSeek management (`enable_deepseek_management` tool)

## Best Practices

1. **Always enable error handling** in workflows
2. **Use retry logic** for unreliable operations
3. **Test stages individually** before full execution
4. **Monitor health scores** regularly
5. **Enable DeepSeek management** for critical workflows
6. **Review error logs** and apply recommendations
7. **Use templates** for consistency
8. **Document workflow stages** in metadata

## API Documentation

For HTTP API access (non-MCP), see:
- `/api/n8n-workflows` - Enhanced workflow management
- `/api/deepseek-workflows` - DeepSeek AI management

For complete documentation, see:
- `docs/N8N_COMPLETE_LIFECYCLE_GUIDE.md`
- `N8N_COMPLETE_IMPLEMENTATION_SUMMARY.md`
