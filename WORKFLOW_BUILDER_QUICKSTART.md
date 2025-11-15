# MCP N8N Workflow Builder Integration - Quick Start

## Overview

LightDom now includes a visual workflow builder inspired by n8n and the salacoste/mcp-n8n-workflow-builder, featuring:

- **Visual Workflow Editor** - React Flow-based drag-and-drop interface
- **MCP Protocol Server** - AI-powered workflow management via Claude/Cursor
- **Multi-Instance Support** - Manage production, staging, and development environments
- **AI Generation** - Create workflows from natural language descriptions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Visual Builder

Access the workflow management dashboard in your React app:

```tsx
import WorkflowManagementDashboard from './components/workflow/WorkflowManagementDashboard';

function App() {
  return <WorkflowManagementDashboard />;
}
```

### 3. Start the MCP Server (for Claude/Cursor Integration)

```bash
npm run mcp:workflow
```

## Features

### Visual Workflow Builder

- Drag-and-drop node editor
- 10+ node types (triggers, HTTP requests, AI processing, data mining, SEO, database, etc.)
- Visual connection management
- Node configuration with JSON editing
- Workflow import/export

### MCP Integration

Available MCP tools:
- `list_workflows` - List all workflows
- `create_workflow` - Create new workflows
- `get_workflow` - Get workflow details
- `update_workflow` - Update workflows
- `delete_workflow` - Delete workflows  
- `execute_workflow` - Execute workflows
- `ai_generate_workflow` - AI-powered generation

### AI-Powered Features

Generate workflows from natural language:

```
"Create a workflow that fetches data from an API, 
analyzes it with AI, and stores results in a database"
```

## File Structure

```
src/components/workflow/
├── EnhancedWorkflowBuilder.tsx      # React Flow visual editor
└── WorkflowManagementDashboard.tsx  # Management interface

src/services/
└── mcp-workflow-server.ts           # MCP protocol server

workflow-templates.json              # Pre-built templates
.mcp-config.json.example             # Multi-instance configuration
MCP_WORKFLOW_BUILDER_GUIDE.md       # Comprehensive documentation
```

## Configuration

### Multi-Instance Setup

Copy `.mcp-config.json.example` to `.mcp-config.json`:

```json
{
  "environments": {
    "production": {
      "apiUrl": "https://prod-api.example.com",
      "apiKey": "prod_key"
    },
    "development": {
      "apiUrl": "http://localhost:3001",
      "apiKey": "dev_key"
    }
  },
  "defaultEnv": "development"
}
```

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lightdom-workflows": {
      "command": "node",
      "args": ["path/to/src/services/mcp-workflow-server.ts"],
      "env": {
        "LIGHTDOM_API_URL": "http://localhost:3001",
        "LIGHTDOM_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Workflow Templates

Three pre-built templates included:

1. **SEO Analysis Workflow** - Automated SEO analysis and optimization
2. **Data Mining Workflow** - Web data extraction and storage
3. **AI Content Pipeline** - AI-powered content generation

## Usage Examples

### Creating a Workflow Visually

1. Open the Workflow Management Dashboard
2. Click "Create Workflow"
3. Switch to "Visual Builder" tab
4. Drag nodes from the palette
5. Connect nodes by clicking and dragging
6. Configure each node
7. Save and execute

### Using AI Generation

1. Click "AI Generate" button
2. Describe your workflow in natural language
3. AI generates the complete workflow
4. Review and modify as needed
5. Save and execute

### Claude/Cursor Integration

Once MCP server is running:

```
User: "List all workflows in development"
Claude: [calls list_workflows tool]

User: "Create a workflow for daily SEO analysis"
Claude: [calls create_workflow with appropriate nodes]

User: "Execute the SEO analysis workflow"
Claude: [calls execute_workflow]
```

## Documentation

See `MCP_WORKFLOW_BUILDER_GUIDE.md` for comprehensive documentation including:

- Detailed architecture
- All available node types
- API endpoints
- Advanced configuration
- Troubleshooting
- Example workflows

## NPM Scripts

```bash
npm run mcp:workflow       # Start MCP server
npm run mcp:workflow:dev   # Start MCP server with auto-reload
```

## Support

For detailed information, see:
- `MCP_WORKFLOW_BUILDER_GUIDE.md` - Complete documentation
- `workflow-templates.json` - Example templates
- `.mcp-config.json.example` - Configuration examples

## Next Steps

1. Explore the visual workflow builder interface
2. Try creating a workflow from a template
3. Test AI-powered workflow generation
4. Connect Claude/Cursor for AI assistance
5. Build your first automated workflow!
