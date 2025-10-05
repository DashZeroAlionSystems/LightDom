# n8n MCP Integration for LightDom

This document describes the n8n MCP (Model Context Protocol) integration for the LightDom project, enabling seamless workflow automation and management directly from the Cursor IDE.

## Overview

The n8n MCP server provides a bridge between Cursor IDE and n8n workflows, allowing developers to:

- **Create and manage workflows** directly from Cursor
- **Execute workflows** and monitor their progress
- **Handle webhooks** for real-time integrations
- **Export/import** workflow configurations
- **Validate** workflow definitions
- **Get analytics** on workflow performance

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cursor IDE    │◄──►│  n8n MCP Server  │◄──►│   n8n Instance  │
│                 │    │                  │    │                 │
│ • Code Editor   │    │ • Tool Handlers  │    │ • Workflows     │
│ • MCP Client    │    │ • API Client     │    │ • Executions    │
│ • Chat Interface│    │ • Validation     │    │ • Webhooks      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Installation

### Prerequisites

- Node.js 16+ 
- n8n instance running (local or remote)
- Cursor IDE with MCP support

### Setup Steps

1. **Install dependencies**:
   ```bash
   npm install @modelcontextprotocol/sdk axios commander chalk ora
   ```

2. **Run the setup script**:
   ```bash
   node scripts/setup-n8n-mcp.js
   ```

3. **Configure environment**:
   ```bash
   # Edit .env file
   N8N_BASE_URL=http://localhost:5678
   N8N_API_KEY=your_api_key_here
   N8N_TIMEOUT=30000
   ```

4. **Build the MCP server**:
   ```bash
   npm run build:n8n-mcp
   ```

5. **Test the connection**:
   ```bash
   npm run test:n8n-mcp
   ```

6. **Configure Cursor**:
   - Copy `mcp-config.json` to your Cursor MCP settings
   - Restart Cursor

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `N8N_BASE_URL` | Base URL of n8n instance | `http://localhost:5678` |
| `N8N_API_KEY` | API key for authentication | - |
| `N8N_WEBHOOK_URL` | Base URL for webhooks | - |
| `N8N_TIMEOUT` | Request timeout (ms) | `30000` |

### MCP Configuration

The `mcp-config.json` file configures the MCP server:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["dist/src/mcp/n8n-mcp-server.js"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "",
        "N8N_WEBHOOK_URL": "",
        "N8N_TIMEOUT": "30000"
      }
    }
  }
}
```

## Available MCP Tools

### Workflow Management

#### `list_workflows`
List all workflows in your n8n instance.

**Parameters:**
- `active` (boolean, optional): Filter by active status

**Example:**
```typescript
// List all workflows
await list_workflows({});

// List only active workflows
await list_workflows({ active: true });
```

#### `get_workflow`
Get details of a specific workflow.

**Parameters:**
- `workflowId` (string, required): The workflow ID

**Example:**
```typescript
await get_workflow({ workflowId: "123" });
```

#### `create_workflow`
Create a new workflow.

**Parameters:**
- `name` (string, required): Workflow name
- `nodes` (array, required): Workflow nodes
- `connections` (object, required): Node connections
- `active` (boolean, optional): Whether to activate

**Example:**
```typescript
await create_workflow({
  name: "My Workflow",
  nodes: [
    {
      id: "webhook",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        httpMethod: "POST",
        path: "my-webhook"
      }
    }
  ],
  connections: {},
  active: false
});
```

#### `update_workflow`
Update an existing workflow.

**Parameters:**
- `workflowId` (string, required): The workflow ID
- `name` (string, optional): New name
- `nodes` (array, optional): Updated nodes
- `connections` (object, optional): Updated connections
- `active` (boolean, optional): Active status

#### `delete_workflow`
Delete a workflow.

**Parameters:**
- `workflowId` (string, required): The workflow ID

### Execution Management

#### `execute_workflow`
Execute a workflow.

**Parameters:**
- `workflowId` (string, required): The workflow ID
- `inputData` (object, optional): Input data

**Example:**
```typescript
await execute_workflow({
  workflowId: "123",
  inputData: { message: "Hello World" }
});
```

#### `get_execution`
Get execution details.

**Parameters:**
- `executionId` (string, required): The execution ID

#### `list_executions`
List workflow executions.

**Parameters:**
- `workflowId` (string, optional): Filter by workflow ID
- `limit` (number, optional): Maximum results (default: 20)

### Webhook Management

#### `create_webhook`
Create a webhook for a workflow.

**Parameters:**
- `workflowId` (string, required): The workflow ID
- `httpMethod` (string, optional): HTTP method (default: POST)
- `path` (string, optional): Webhook path

#### `trigger_webhook`
Trigger a workflow via webhook.

**Parameters:**
- `webhookUrl` (string, required): The webhook URL
- `method` (string, optional): HTTP method (default: POST)
- `data` (object, optional): Data to send
- `headers` (object, optional): Additional headers

### Import/Export

#### `export_workflow`
Export workflow as JSON.

**Parameters:**
- `workflowId` (string, required): The workflow ID
- `filePath` (string, optional): File path to save

#### `import_workflow`
Import workflow from JSON file.

**Parameters:**
- `filePath` (string, required): Path to JSON file
- `name` (string, optional): New name for imported workflow

### Validation and Analytics

#### `validate_workflow`
Validate workflow configuration.

**Parameters:**
- `workflow` (object, required): Workflow definition

#### `get_workflow_statistics`
Get workflow execution statistics.

**Parameters:**
- `workflowId` (string, required): The workflow ID
- `timeRange` (string, optional): Time range (hour/day/week/month)

## CLI Usage

The MCP server includes a CLI tool for direct management:

```bash
# Test connection
npm run cli:n8n-mcp test

# List workflows
npm run cli:n8n-mcp list

# Create sample workflow
npm run cli:n8n-mcp create-sample

# Export workflow
npm run cli:n8n-mcp export <workflow-id>

# Import workflow
npm run cli:n8n-mcp import <file-path>

# Generate MCP config
npm run cli:n8n-mcp generate-config
```

## Usage Examples

### Creating a DOM Optimization Workflow

```typescript
// Create a workflow for DOM optimization
const optimizationWorkflow = {
  name: "DOM Optimization Pipeline",
  nodes: [
    {
      id: "webhook-trigger",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        httpMethod: "POST",
        path: "optimize-dom"
      }
    },
    {
      id: "crawl-url",
      name: "Crawl URL",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        url: "={{ $json.url }}",
        method: "GET"
      }
    },
    {
      id: "optimize-dom",
      name: "Optimize DOM",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        functionCode: `
          const html = items[0].json.data;
          // DOM optimization logic here
          const optimized = optimizeDOM(html);
          return [{ json: { optimizedHTML: optimized } }];
        `
      }
    },
    {
      id: "save-result",
      name: "Save Result",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 1,
      position: [900, 300],
      parameters: {
        url: "http://localhost:3000/api/optimization-results",
        method: "POST",
        body: {
          originalURL: "={{ $json.url }}",
          optimizedHTML: "={{ $json.optimizedHTML }}",
          timestamp: "={{ new Date().toISOString() }}"
        }
      }
    }
  ],
  connections: {
    "webhook-trigger": {
      main: [[{ node: "crawl-url", type: "main", index: 0 }]]
    },
    "crawl-url": {
      main: [[{ node: "optimize-dom", type: "main", index: 0 }]]
    },
    "optimize-dom": {
      main: [[{ node: "save-result", type: "main", index: 0 }]]
    }
  },
  active: false
};

// Create the workflow
await create_workflow(optimizationWorkflow);
```

### Monitoring Workflow Execution

```typescript
// Execute the workflow
const execution = await execute_workflow({
  workflowId: "optimization-workflow-id",
  inputData: { url: "https://example.com" }
});

// Monitor execution
const executionDetails = await get_execution({
  executionId: execution.id
});

console.log(`Execution status: ${executionDetails.status}`);
```

### Setting up Webhooks

```typescript
// Create webhook for real-time processing
const webhook = await create_webhook({
  workflowId: "optimization-workflow-id",
  httpMethod: "POST",
  path: "optimize"
});

console.log(`Webhook URL: ${webhook.webhookUrl}`);
```

## Integration with LightDom

The n8n MCP integration enhances LightDom's capabilities by:

### 1. Automated DOM Optimization
- Trigger optimization workflows from code changes
- Process multiple URLs in parallel
- Store results in blockchain for proof of optimization

### 2. Blockchain Integration
- Execute smart contract interactions
- Mint tokens for optimization achievements
- Record optimization proofs on-chain

### 3. Real-time Monitoring
- Monitor optimization pipeline health
- Get alerts for failed optimizations
- Track performance metrics

### 4. CI/CD Integration
- Automate workflow deployment
- Run optimization tests on code changes
- Generate optimization reports

## Security Considerations

### API Security
- Store API keys in environment variables
- Use HTTPS for all communications
- Implement rate limiting
- Validate all input data

### Workflow Security
- Sanitize workflow inputs
- Use sandboxed execution environments
- Implement access controls
- Audit workflow executions

### Data Protection
- Encrypt sensitive data in transit
- Implement proper backup strategies
- Follow GDPR compliance requirements
- Use secure storage for workflow data

## Troubleshooting

### Common Issues

#### Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5678
```
**Solution:** Ensure n8n is running and accessible at the configured URL.

#### Authentication Failed
```
Error: 401 Unauthorized
```
**Solution:** Check API key configuration and permissions.

#### Build Errors
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```
**Solution:** Run `npm install` to install dependencies.

#### MCP Not Working in Cursor
**Solution:** 
1. Verify `mcp-config.json` is in Cursor settings
2. Restart Cursor after configuration changes
3. Check Cursor console for error messages

### Debug Mode

Enable debug mode for detailed logging:

```bash
N8N_DEBUG=true npm run start:n8n-mcp
```

### Logs

Check logs for troubleshooting:
- MCP server logs: Console output
- n8n logs: n8n instance logs
- Cursor logs: Cursor developer console

## Performance Optimization

### Caching
- Cache workflow definitions
- Implement request deduplication
- Use connection pooling

### Rate Limiting
- Respect n8n API rate limits
- Implement exponential backoff
- Queue requests when necessary

### Monitoring
- Track response times
- Monitor error rates
- Set up alerts for failures

## Contributing

When contributing to the n8n MCP integration:

1. **Follow coding standards**:
   - Use TypeScript for type safety
   - Follow existing code patterns
   - Add comprehensive error handling

2. **Add tests**:
   - Unit tests for new functions
   - Integration tests for API calls
   - End-to-end tests for workflows

3. **Update documentation**:
   - Document new features
   - Update examples
   - Maintain troubleshooting guides

4. **Security review**:
   - Validate all inputs
   - Follow security best practices
   - Test for vulnerabilities

## License

This integration is part of the LightDom project and follows the same license terms.

## Support

For support and questions:

1. Check the troubleshooting section
2. Review n8n documentation
3. Check Cursor MCP documentation
4. Create an issue in the LightDom repository

---

*Last updated: December 2024*
