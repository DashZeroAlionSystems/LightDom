# Quick Start: N8N Workflow MCP Server

## 1-Minute Setup

### Start the MCP Server

```bash
# Set database URL
export DATABASE_URL="postgresql://localhost:5432/lightdom"

# Start MCP server
npm run mcp:workflow-lifecycle
```

The server is now running and ready for MCP clients.

## Connect with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "workflows": {
      "command": "npm",
      "args": ["run", "mcp:workflow-lifecycle"],
      "cwd": "/path/to/LightDom",
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/lightdom"
      }
    }
  }
}
```

Restart Claude Desktop, and you'll see the workflow tools available.

## Try It Out

### Example 1: Create a Webhook Workflow

In Claude:
```
Create a workflow that:
- Has a webhook trigger on path "/process"
- Validates incoming data
- Calls an external API with retry logic
- Stores results in database
- Handles errors with notifications
```

Claude will use the `create_complete_workflow` tool to build this.

### Example 2: Execute at Specific Stage

```
I have workflow wf_abc123 and it failed at the "Store Results" stage. 
Can you execute it starting from that stage with the data from the last execution?
```

Claude will use `execute_at_stage` to resume from that point.

### Example 3: Analyze Errors

```
What errors has my workflow wf_abc123 had?
Analyze the most critical one and suggest fixes.
```

Claude will:
1. Use `get_workflow_errors` to list errors
2. Use `analyze_error` to get DeepSeek analysis
3. Provide recommendations

## Available Tools

- ✅ **create_complete_workflow** - Build complete workflows
- ✅ **execute_at_stage** - Start from specific stage
- ✅ **create_from_template** - Use pre-built templates
- ✅ **get_workflow_errors** - View error log
- ✅ **analyze_error** - Get AI analysis
- ✅ **get_workflow_stats** - Health scores
- ✅ And 8 more tools...

## Common Use Cases

### Test a Specific Stage

```
Test just the "Validate Input" stage of my workflow with sample data
```

### Create from Template

```
Create a scheduled workflow that processes data every hour using a template
```

### Monitor Health

```
What's the health score of my workflow? Any recommendations?
```

### Enable AI Management

```
Enable DeepSeek to automatically manage and optimize this workflow
```

## Troubleshooting

**MCP Server won't start:**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check Node.js version (18+)

**Tools not appearing in Claude:**
- Restart Claude Desktop
- Check config path is correct
- Verify MCP server is running

**Workflows not executing:**
- Check workflow is active
- View errors with `get_workflow_errors`
- Verify n8n connection (optional)

## Next Steps

- Read full guide: `docs/N8N_WORKFLOW_MCP_SERVER_GUIDE.md`
- Explore templates: Use `list_templates` tool
- View stage types: Use `get_stage_types` tool
- Enable DeepSeek: Use `enable_deepseek_management` tool

## Development Mode

For auto-reload during development:

```bash
npm run mcp:workflow-lifecycle:dev
```

This will restart the server when files change.
