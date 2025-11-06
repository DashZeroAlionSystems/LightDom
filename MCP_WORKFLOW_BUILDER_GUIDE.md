# MCP N8N-Style Workflow Builder Integration

This document explains how to use the MCP (Model Context Protocol) workflow builder integration in LightDom, inspired by the salacoste/mcp-n8n-workflow-builder.

## Overview

LightDom now includes a comprehensive visual workflow builder with MCP integration, allowing you to:

- **Create workflows visually** using React Flow
- **Manage workflows via AI** using Claude or Cursor IDE
- **Multi-instance support** for production, staging, and development environments
- **Natural language workflow generation** powered by AI
- **Real-time execution monitoring** and visualization

## Architecture

### Components

1. **EnhancedWorkflowBuilder** - React Flow-based visual editor
2. **MCPWorkflowServer** - Model Context Protocol server for AI integration
3. **WorkflowManagementDashboard** - Comprehensive workflow management interface

### Key Features

- **Visual Node Editor**: Drag-and-drop interface with React Flow
- **AI-Powered Generation**: Generate workflows from natural language descriptions
- **Multi-Environment**: Manage workflows across production, staging, and development
- **Real-Time Execution**: Monitor workflow execution in real-time
- **Template Library**: Pre-built workflow templates for common use cases

## Installation

### 1. Install Dependencies

The required dependencies should already be in package.json:

```bash
npm install
```

Key packages:
- `reactflow` - Visual workflow editor
- `@modelcontextprotocol/sdk` - MCP protocol implementation

### 2. Configure Environments

Create a `.mcp-config.json` file in the project root:

```json
{
  "environments": {
    "production": {
      "apiUrl": "https://your-production-api.com",
      "apiKey": "your_production_key"
    },
    "staging": {
      "apiUrl": "https://your-staging-api.com",
      "apiKey": "your_staging_key"
    },
    "development": {
      "apiUrl": "http://localhost:3001",
      "apiKey": "dev_key"
    }
  },
  "defaultEnv": "development"
}
```

### 3. Start the MCP Server

```bash
npm run mcp:workflow
```

This starts the MCP server that Claude/Cursor can connect to.

## Usage

### Visual Workflow Builder

Access the visual workflow builder at `/workflow-builder` or through the Workflow Management Dashboard:

```tsx
import WorkflowManagementDashboard from './components/workflow/WorkflowManagementDashboard';

function App() {
  return <WorkflowManagementDashboard />;
}
```

### Creating Workflows Visually

1. Click **"Create Workflow"** button
2. Drag nodes from the palette onto the canvas
3. Connect nodes by dragging from output to input
4. Configure each node by clicking on it
5. Save and execute the workflow

### Node Types

#### Triggers
- **Trigger** - Schedule-based workflow trigger
- **Webhook** - HTTP webhook trigger

#### Actions
- **HTTP Request** - Make API calls
- **Data Mining** - Extract and mine data
- **SEO Analysis** - Analyze SEO metrics
- **AI Processing** - AI-powered processing
- **Database** - Database operations
- **Function** - Custom JavaScript code
- **Notification** - Send notifications

#### Logic
- **Decision** - Conditional branching

### Using the MCP Server with Claude

#### 1. Configure Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lightdom-workflows": {
      "command": "node",
      "args": ["path/to/LightDom/src/services/mcp-workflow-server.ts"],
      "env": {
        "LIGHTDOM_API_URL": "http://localhost:3001",
        "LIGHTDOM_API_KEY": "your_api_key"
      }
    }
  }
}
```

#### 2. Available MCP Tools

- `list_workflows` - List all workflows
- `create_workflow` - Create a new workflow
- `get_workflow` - Get workflow details
- `update_workflow` - Update an existing workflow
- `delete_workflow` - Delete a workflow
- `execute_workflow` - Execute a workflow
- `ai_generate_workflow` - Generate workflow from natural language

#### 3. Example Claude Conversations

**Creating a workflow:**
```
"Create a workflow that fetches data from an API, processes it with AI, 
and stores the results in a database"
```

**Listing workflows:**
```
"Show me all workflows in the development environment"
```

**Executing a workflow:**
```
"Execute the 'SEO Analysis' workflow with these parameters: {url: 'example.com'}"
```

### AI-Powered Workflow Generation

In the visual builder, click the **"AI Generate"** button to create workflows from natural language:

```
Example prompt: "Create a workflow that:
1. Fetches product data from an e-commerce API
2. Analyzes SEO performance for each product page
3. Generates optimization recommendations using AI
4. Stores results in PostgreSQL database
5. Sends email notification when complete"
```

The AI will generate the complete workflow with all nodes and connections.

## API Endpoints

The workflow system provides the following API endpoints:

### Workflow Management

```
GET    /api/workflow-generator/config/summary?env={environment}
POST   /api/workflow-generator/create
GET    /api/workflow-generator/config/:id
PUT    /api/workflow-generator/config/:id
DELETE /api/workflow-generator/config/:id
POST   /api/workflow-generator/execute/:id
GET    /api/workflow-generator/stats?env={environment}
```

### AI Generation

```
POST   /api/workflow-generator/ai-generate
```

Body:
```json
{
  "prompt": "Natural language workflow description"
}
```

## Workflow Structure

### Workflow JSON Format

```json
{
  "id": "workflow-123",
  "name": "My Workflow",
  "description": "Workflow description",
  "environment": "development",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Schedule Trigger",
        "config": {
          "schedule": "0 */6 * * *"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ],
  "tags": ["seo", "automation"],
  "status": "active",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

## Advanced Features

### Multi-Instance Support

Manage workflows across multiple environments:

```typescript
// Create workflow in production
const response = await fetch('/api/workflow-generator/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...workflowData,
    environment: 'production'
  })
});
```

### Custom Node Types

Extend the workflow builder with custom node types:

```typescript
const customNodeTypes = [
  {
    type: 'customProcessor',
    label: 'Custom Processor',
    icon: '⚙️',
    color: '#9c27b0',
    category: 'actions',
    description: 'Custom processing logic'
  }
];
```

### Workflow Templates

Create reusable workflow templates:

```typescript
const seoWorkflowTemplate = {
  name: 'SEO Optimization Workflow',
  description: 'Automated SEO analysis and optimization',
  nodes: [...],
  edges: [...],
  tags: ['seo', 'template']
};
```

## Best Practices

1. **Use Meaningful Names**: Give workflows and nodes descriptive names
2. **Document Complex Logic**: Add descriptions to complex workflows
3. **Test in Development**: Always test in development before deploying to production
4. **Version Control**: Export workflows as JSON for version control
5. **Monitor Execution**: Use the dashboard to monitor workflow execution
6. **Use Tags**: Tag workflows for easy organization and filtering

## Troubleshooting

### MCP Server Not Connecting

Check that:
- The MCP server is running (`npm run mcp:workflow`)
- Claude Desktop configuration is correct
- API URL and key are set correctly

### Workflow Execution Fails

Check:
- Node configurations are valid
- All required fields are filled
- API endpoints are accessible
- Environment is correctly configured

### Visual Builder Not Loading

Ensure:
- React Flow is installed (`npm install reactflow`)
- All dependencies are up to date
- No console errors in browser developer tools

## Examples

### Example 1: SEO Analysis Workflow

```json
{
  "name": "SEO Analysis Workflow",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "data": {
        "label": "Daily Trigger",
        "config": { "schedule": "0 0 * * *" }
      }
    },
    {
      "id": "crawler-1",
      "type": "httpRequest",
      "data": {
        "label": "Fetch Page",
        "config": { "url": "https://example.com" }
      }
    },
    {
      "id": "seo-1",
      "type": "seoAnalysis",
      "data": {
        "label": "Analyze SEO",
        "config": {}
      }
    },
    {
      "id": "db-1",
      "type": "database",
      "data": {
        "label": "Store Results",
        "config": { "table": "seo_analysis" }
      }
    }
  ],
  "edges": [
    { "source": "trigger-1", "target": "crawler-1" },
    { "source": "crawler-1", "target": "seo-1" },
    { "source": "seo-1", "target": "db-1" }
  ]
}
```

### Example 2: AI Data Processing Pipeline

```json
{
  "name": "AI Data Processing",
  "nodes": [
    {
      "id": "webhook-1",
      "type": "webhook",
      "data": {
        "label": "Webhook Trigger",
        "config": { "path": "/process-data" }
      }
    },
    {
      "id": "ai-1",
      "type": "aiProcess",
      "data": {
        "label": "AI Analysis",
        "config": { "model": "gpt-4" }
      }
    },
    {
      "id": "notify-1",
      "type": "notification",
      "data": {
        "label": "Send Email",
        "config": { "to": "admin@example.com" }
      }
    }
  ],
  "edges": [
    { "source": "webhook-1", "target": "ai-1" },
    { "source": "ai-1", "target": "notify-1" }
  ]
}
```

## Resources

- [React Flow Documentation](https://reactflow.dev)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [N8N Workflow Patterns](https://n8n.io)

## Support

For issues or questions:
- Check the troubleshooting section
- Review the API documentation
- Check existing workflows for examples
- Consult the LightDom main README
