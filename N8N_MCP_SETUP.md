# n8n MCP Integration Setup Guide

This guide will help you set up the n8n MCP (Model Context Protocol) integration for your LightDom project.

## What's Been Added

The following files have been created for the n8n MCP integration:

### Core Files
- `src/mcp/n8n-mcp-server.ts` - Main MCP server implementation
- `src/mcp/n8n-mcp-cli.ts` - Command-line interface
- `src/types/N8nTypes.ts` - TypeScript type definitions
- `mcp-config.json` - MCP configuration for Cursor

### Scripts and Tools
- `scripts/setup-n8n-mcp.js` - Automated setup script
- `scripts/quick-start-n8n-mcp.sh` - Quick start script (Unix/Linux/macOS)
- `test/mcp/n8n-mcp.test.js` - Test suite

### Documentation
- `docs/N8N_MCP_INTEGRATION.md` - Comprehensive documentation
- `src/mcp/README.md` - Quick reference guide
- `workflows/dom-optimization-template.json` - Sample workflow template

## Installation Steps

### 1. Install Dependencies

```bash
npm install @modelcontextprotocol/sdk axios commander chalk ora
```

### 2. Run the Setup Script

```bash
node scripts/setup-n8n-mcp.js
```

This script will:
- Check and install missing dependencies
- Create environment configuration files
- Generate MCP configuration
- Update package.json with MCP scripts
- Create build scripts
- Generate documentation

### 3. Configure Environment

Edit the `.env` file with your n8n configuration:

```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_URL=
N8N_TIMEOUT=30000
```

### 4. Build the MCP Server

```bash
npm run build:n8n-mcp
```

### 5. Test the Connection

```bash
npm run test:n8n-mcp
```

### 6. Configure Cursor

1. Copy the `mcp-config.json` file to your Cursor MCP settings
2. Restart Cursor
3. The n8n MCP tools should now be available in Cursor

## Available MCP Tools

Once configured, you can use these tools in Cursor:

- **Workflow Management**: `list_workflows`, `get_workflow`, `create_workflow`, `update_workflow`, `delete_workflow`
- **Execution**: `execute_workflow`, `get_execution`, `list_executions`
- **Webhooks**: `create_webhook`, `trigger_webhook`
- **Import/Export**: `export_workflow`, `import_workflow`
- **Validation**: `validate_workflow`, `get_workflow_statistics`

## CLI Usage

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

## Sample Workflow

A sample DOM optimization workflow template is included at `workflows/dom-optimization-template.json`. This workflow demonstrates:

- Webhook trigger for URL optimization requests
- Input validation and URL crawling
- DOM analysis and optimization
- Blockchain proof generation
- Database storage and notifications

## Integration with LightDom

The n8n MCP integration enhances LightDom by:

1. **Automated DOM Optimization**: Trigger optimization workflows from code changes
2. **Blockchain Integration**: Execute smart contract interactions and record optimization proofs
3. **Real-time Monitoring**: Monitor optimization pipeline health and performance
4. **CI/CD Integration**: Automate workflow deployment and testing

## Troubleshooting

### Common Issues

1. **Connection Failed**: Ensure n8n is running and accessible
2. **Authentication Failed**: Check API key configuration
3. **Build Errors**: Install TypeScript and dependencies
4. **MCP Not Working**: Verify configuration and restart Cursor

### Debug Mode

Enable debug mode for detailed logging:

```bash
N8N_DEBUG=true npm run start:n8n-mcp
```

## Next Steps

1. **Test the Integration**: Use the CLI to test connection and create sample workflows
2. **Explore MCP Tools**: Try the various MCP tools in Cursor
3. **Create Custom Workflows**: Build workflows specific to your LightDom use cases
4. **Integrate with CI/CD**: Set up automated workflow execution
5. **Monitor Performance**: Use the statistics tools to track optimization metrics

## Support

For more detailed information, see:
- `docs/N8N_MCP_INTEGRATION.md` - Comprehensive documentation
- `src/mcp/README.md` - Quick reference guide
- n8n documentation for workflow creation
- Cursor MCP documentation for IDE integration

## Security Notes

- Store API keys in environment variables, never in code
- Use HTTPS for all production communications
- Validate all workflow inputs
- Follow security best practices for webhook endpoints

---

*The n8n MCP integration is now ready to use with your LightDom project!*
