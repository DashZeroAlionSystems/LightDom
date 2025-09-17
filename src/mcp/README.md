# n8n MCP Integration

This directory contains the n8n MCP (Model Context Protocol) integration for the LightDom project.

## Overview

The n8n MCP server provides seamless integration between Cursor IDE and n8n workflows, allowing developers to:

- Create, read, update, and delete n8n workflows
- Execute workflows and monitor their execution
- Create and manage webhooks
- Export and import workflow configurations
- Validate workflow definitions
- Get workflow statistics and analytics

## Files

- `n8n-mcp-server.ts` - Main MCP server implementation
- `n8n-mcp-cli.ts` - Command-line interface for managing the integration

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install @modelcontextprotocol/sdk axios commander chalk ora
   ```

2. **Run the setup script**:

   ```bash
   node scripts/setup-n8n-mcp.js
   ```

3. **Configure environment variables in `.env`**:

   ```
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

6. **Add the MCP configuration to Cursor**:
   - Copy `mcp-config.json` to your Cursor MCP settings
   - Restart Cursor

## Usage

### MCP Tools Available

The MCP server provides the following tools:

- `list_workflows` - List all workflows
- `get_workflow` - Get a specific workflow
- `create_workflow` - Create a new workflow
- `update_workflow` - Update an existing workflow
- `delete_workflow` - Delete a workflow
- `execute_workflow` - Execute a workflow
- `get_execution` - Get execution details
- `list_executions` - List workflow executions
- `create_webhook` - Create a webhook
- `trigger_webhook` - Trigger a webhook
- `export_workflow` - Export workflow as JSON
- `import_workflow` - Import workflow from JSON
- `validate_workflow` - Validate workflow configuration
- `get_workflow_statistics` - Get workflow statistics

### CLI Usage

You can also use the CLI directly:

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
```

## Configuration

The MCP server can be configured through environment variables:

- `N8N_BASE_URL` - Base URL of your n8n instance (default: http://localhost:5678)
- `N8N_API_KEY` - API key for authentication (optional)
- `N8N_WEBHOOK_URL` - Base URL for webhooks (optional)
- `N8N_TIMEOUT` - Request timeout in milliseconds (default: 30000)

## Security

- API keys are stored in environment variables, not in code
- All requests are made over HTTPS in production
- Input validation is performed on all workflow data
- Workflow execution is sandboxed by n8n

## Troubleshooting

### Connection Issues

1. Verify n8n is running: `curl http://localhost:5678/api/v1/workflows`
2. Check API key configuration
3. Verify firewall settings

### Build Issues

1. Ensure TypeScript is installed: `npm install -g typescript`
2. Check Node.js version (requires 16+)
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### MCP Issues

1. Verify mcp-config.json is correctly formatted
2. Check Cursor MCP settings
3. Restart Cursor after configuration changes

## Examples

### Creating a Simple Workflow

```typescript
const workflow = {
  name: 'My Workflow',
  nodes: [
    {
      id: 'webhook',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'my-webhook',
      },
    },
  ],
  connections: {},
  active: false,
};
```

### Executing a Workflow

```typescript
const result = await executeWorkflow({
  workflowId: 'workflow-id',
  inputData: { message: 'Hello World' },
});
```

## Contributing

When contributing to the n8n MCP integration:

1. Follow the existing code style
2. Add TypeScript types for new features
3. Update documentation
4. Add tests for new functionality
5. Follow security best practices

## License

This integration is part of the LightDom project and follows the same license terms.
