# N8N Workflow Integration - Complete Documentation

## Overview

This documentation covers the complete n8n workflow automation system integrated with DeepSeek AI and MCP (Model Context Protocol) for the LightDom platform.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation & Setup](#installation--setup)
3. [Services](#services)
4. [API Reference](#api-reference)
5. [UI Components](#ui-components)
6. [DeepSeek Integration](#deepseek-integration)
7. [MCP Server](#mcp-server)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │ N8N Workflow     │  │  Workflow Execution          │   │
│  │ Builder          │  │  Dashboard                    │   │
│  └──────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
│  /api/n8n/workflows - CRUD operations                       │
│  /api/n8n/schemas - Schema generation                       │
│  /api/n8n/deepseek - AI workflow generation                 │
│  /api/n8n/mcp - MCP tool management                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Service Layer (Node.js)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  N8N Schema Generator                                │  │
│  │  - Extract workflow schemas                          │  │
│  │  - Generate OpenAPI/JSON Schema                      │  │
│  │  - Create MCP tool definitions                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DeepSeek Prompt Engine                              │  │
│  │  - Template-based prompt generation                  │  │
│  │  - Workflow type mapping                             │  │
│  │  - Response structuring                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  N8N MCP Server                                      │  │
│  │  - Tool registration                                  │  │
│  │  - Workflow execution                                │  │
│  │  - SSE streaming                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               External Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ N8N Server   │  │ DeepSeek AI  │  │ PostgreSQL   │     │
│  │ :5678        │  │ API          │  │ :5432        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Workflow Creation**
   - User describes workflow in UI or via API
   - DeepSeek generates workflow definition
   - Schema generator creates metadata
   - Workflow saved to n8n

2. **Workflow Execution**
   - Trigger event activates workflow
   - N8N executes nodes in sequence
   - Results stored in database
   - Notifications sent via configured channels

3. **MCP Tool Access**
   - AI agents discover available tools
   - Execute workflows via MCP protocol
   - Receive structured responses
   - Chain multiple workflows

---

## Installation & Setup

### Prerequisites

```bash
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis (optional, for caching)
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# N8N Configuration
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=lightdom_n8n_password

# DeepSeek Configuration
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat

# MCP Server Configuration
MCP_PORT=8090
MCP_AUTH_TOKEN=your_mcp_auth_token

# Database Configuration
DATABASE_URL=postgresql://lightdom_user:lightdom_password@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=lightdom_user
DB_PASSWORD=lightdom_password
```

### Starting Services

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services including n8n
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f n8n
```

#### Option 2: Using Start Script

```bash
# Make script executable
chmod +x start-all-services.sh

# Start all services
./start-all-services.sh

# Services will start on:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - N8N: http://localhost:5678
# - MCP Server: http://localhost:8090
```

#### Option 3: Individual Services

```bash
# Start n8n
npm run n8n:start

# Start MCP server
node services/n8n-mcp-server-start.js

# Start API server
npm run api

# Start frontend
npm run dev
```

### Initial Setup

1. **Access N8N**
   - Navigate to http://localhost:5678
   - Login with credentials from .env
   - Create your first workflow

2. **Generate Schemas**
   ```bash
   curl -X POST http://localhost:3001/api/n8n/schemas/generate
   ```

3. **Refresh MCP Tools**
   ```bash
   curl -X POST http://localhost:3001/api/n8n/mcp/refresh
   ```

4. **Verify Installation**
   ```bash
   # Check n8n health
   curl http://localhost:3001/api/n8n/health
   
   # List MCP tools
   curl http://localhost:8090/mcp/tools
   ```

---

## Services

### N8N Schema Generator

**Location**: `services/n8n-schema-generator.js`

Automatically extracts schemas from n8n workflows.

#### Features

- OpenAPI/JSON Schema generation
- MCP tool definitions
- DeepSeek function calling schemas
- Workflow metadata extraction
- Type inference
- Validation rules

#### Usage

```javascript
import { n8nSchemaGenerator } from './services/n8n-schema-generator.js';

// Generate all schemas
const result = await n8nSchemaGenerator.generateAllSchemas();
console.log(`Generated ${result.count} schemas`);

// Get specific schema
const schema = n8nSchemaGenerator.getCachedSchema('workflow-id');

// Validate workflow data
const validation = await n8nSchemaGenerator.validateWorkflow('workflow-id', data);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

#### Generated Schema Structure

```json
{
  "workflowId": "workflow-123",
  "workflowName": "SEO Data Mining",
  "version": "1.0.0",
  "description": "Extract SEO attributes from web pages",
  "input": {
    "type": "object",
    "properties": {
      "url": { "type": "string", "format": "uri" }
    }
  },
  "output": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "result": { "type": "object" }
    }
  },
  "mcpTool": {
    "name": "seo_data_mining",
    "description": "Extract SEO attributes from web pages",
    "inputSchema": {...},
    "outputSchema": {...}
  },
  "deepseekFunction": {
    "type": "function",
    "function": {
      "name": "seo_data_mining",
      "description": "Execute n8n workflow: SEO Data Mining",
      "parameters": {...}
    }
  }
}
```

---

### DeepSeek Prompt Engine

**Location**: `services/deepseek-prompt-templates.js`

Template-based prompt generation system for DeepSeek AI.

#### Features

- Pre-built templates for common workflows
- Variable interpolation
- Context-aware generation
- Response structuring
- Category organization

#### Template Categories

1. **Workflow Generation**
   - basic
   - seoDataMining
   - apiIntegration
   - dataProcessing

2. **Data Structuring**
   - schemaGeneration
   - dataTransformation
   - responseStructuring

3. **Automation**
   - processAutomation
   - sequentialWorkflow
   - conditionalWorkflow

4. **Component Generation**
   - visualEditor
   - workflowBuilder

5. **Code Generation**
   - functionNode
   - customNode

#### Usage

```javascript
import { promptEngine } from './services/deepseek-prompt-templates.js';

// Generate workflow prompt
const prompt = promptEngine.createWorkflowPrompt('seoDataMining', {
  attributes_list: 'title, meta description, h1, h2, canonical URL',
  target_urls: 'https://example.com'
});

// List available templates
const templates = promptEngine.listTemplates();

// Get specific template
const template = promptEngine.getTemplate('workflowGeneration', 'basic');

// Render custom prompt
const rendered = promptEngine.render('automation', 'processAutomation', {
  process_name: 'Customer Onboarding',
  process_steps: ['Create account', 'Send welcome email', 'Setup trial'],
  trigger_conditions: 'New user signup',
  automated_actions: 'Account provisioning, email notification',
  success_criteria: 'Account created and email sent'
});
```

---

### N8N MCP Server

**Location**: `services/n8n-mcp-server.js`

MCP-compliant server exposing n8n workflows as AI agent tools.

#### Features

- MCP protocol implementation
- Tool registration from workflows
- Workflow execution
- SSE streaming
- Authentication
- Input validation

#### Starting the Server

```bash
# Using starter script
node services/n8n-mcp-server-start.js

# Or programmatically
import { n8nMCPServer } from './services/n8n-mcp-server.js';
await n8nMCPServer.start();
```

#### MCP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/health` | GET | Health check |
| `/mcp/tools` | GET | List available tools |
| `/mcp/tools/:toolName` | GET | Get tool definition |
| `/mcp/tools/:toolName/execute` | POST | Execute tool |
| `/mcp/executions/:executionId` | GET | Get execution status |
| `/mcp/stream` | GET | SSE stream |
| `/mcp/refresh` | POST | Refresh tools |

#### Usage Example

```bash
# List tools
curl http://localhost:8090/mcp/tools

# Execute tool
curl -X POST http://localhost:8090/mcp/tools/seo_data_mining/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_mcp_auth_token" \
  -d '{"input": {"url": "https://example.com"}}'

# Check execution
curl http://localhost:8090/mcp/executions/exec-123

# Stream updates
curl http://localhost:8090/mcp/stream
```

---

## API Reference

### Workflow Management

#### List Workflows

```http
GET /api/n8n/workflows
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "workflows": [
    {
      "id": "workflow-1",
      "name": "SEO Data Mining",
      "active": true,
      "tags": ["seo"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### Get Workflow

```http
GET /api/n8n/workflows/:id
```

#### Create Workflow

```http
POST /api/n8n/workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Workflow description",
  "nodes": [...],
  "connections": {...},
  "active": false
}
```

#### Update Workflow

```http
PUT /api/n8n/workflows/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "nodes": [...]
}
```

#### Delete Workflow

```http
DELETE /api/n8n/workflows/:id
```

#### Execute Workflow

```http
POST /api/n8n/workflows/:id/execute
Content-Type: application/json

{
  "data": {
    "url": "https://example.com"
  }
}
```

### Schema Management

#### Generate All Schemas

```http
POST /api/n8n/schemas/generate
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "schemas": [...]
}
```

#### Get Workflow Schema

```http
GET /api/n8n/schemas/:workflowId
```

### DeepSeek Integration

#### Create Workflow with AI

```http
POST /api/n8n/deepseek/create-workflow
Content-Type: application/json

{
  "type": "seoDataMining",
  "description": "Create a workflow that extracts title, meta description, and h1 from web pages",
  "parameters": {
    "inputs": {},
    "outputs": {}
  }
}
```

#### List Prompt Templates

```http
GET /api/n8n/prompt-templates
```

### MCP Management

#### Refresh MCP Tools

```http
POST /api/n8n/mcp/refresh
```

#### Get MCP Tools

```http
GET /api/n8n/mcp/tools
```

---

## UI Components

### N8N Workflow Builder

**Location**: `src/components/N8NWorkflowBuilder.tsx`

Comprehensive visual workflow builder component.

#### Features

- Drag-and-drop node placement
- Node palette with categorized nodes
- Configuration drawer
- AI workflow generation
- Workflow execution
- Import/Export

#### Usage

```tsx
import N8NWorkflowBuilder from './components/N8NWorkflowBuilder';

function App() {
  return <N8NWorkflowBuilder />;
}
```

#### Props

None required - component manages its own state.

#### Storybook

View component documentation and examples in Storybook:

```bash
npm run storybook
```

Navigate to: `Automation` → `N8NWorkflowBuilder`

---

## DeepSeek Integration

### Workflow Generation

DeepSeek AI generates complete n8n workflows from natural language descriptions.

#### Example Request

```javascript
const response = await fetch('/api/n8n/deepseek/create-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'apiIntegration',
    description: 'Create a workflow that fetches user data from the GitHub API, transforms it, and stores in PostgreSQL',
    parameters: {
      inputs: {},
      outputs: {}
    }
  })
});

const { workflow } = await response.json();
```

#### Generated Workflow Structure

DeepSeek generates:
- Appropriate node types
- Node configurations
- Connections between nodes
- Error handling
- Data transformations

---

## MCP Server

### Tool Discovery

AI agents can discover available workflow tools:

```javascript
const tools = await fetch('http://localhost:8090/mcp/tools');
const { tools: availableTools } = await tools.json();

// Tools are automatically generated from n8n workflows
// Each workflow becomes an executable tool
```

### Tool Execution

```javascript
const result = await fetch('http://localhost:8090/mcp/tools/seo_data_mining/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_mcp_auth_token'
  },
  body: JSON.stringify({
    input: {
      url: 'https://example.com'
    }
  })
});

const { executionId, result: data } = await result.json();
```

---

## Usage Examples

### Complete SEO Data Mining Workflow

```javascript
// 1. Create workflow with AI
const workflowResponse = await fetch('/api/n8n/deepseek/create-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'seoDataMining',
    description: 'Extract title, meta description, h1, h2, canonical URL, and word count from web pages',
    parameters: {}
  })
});

const { workflow } = await workflowResponse.json();

// 2. Execute workflow
const executeResponse = await fetch(`/api/n8n/workflows/${workflow.id}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: { url: 'https://example.com' }
  })
});

const { execution } = await executeResponse.json();

// 3. Check execution status
const statusResponse = await fetch(`/api/n8n/executions/${execution.executionId}`);
const status = await statusResponse.json();

console.log('SEO Data:', status.data);
```

---

## Troubleshooting

### Common Issues

#### N8N Not Starting

```bash
# Check Docker logs
docker-compose logs n8n

# Restart n8n
docker-compose restart n8n

# Check n8n health
curl http://localhost:5678/healthz
```

#### Schema Generation Fails

```bash
# Check n8n API key
echo $N8N_API_KEY

# Test n8n connection
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://localhost:5678/api/v1/workflows

# Regenerate schemas
curl -X POST http://localhost:3001/api/n8n/schemas/generate
```

#### MCP Server Not Responding

```bash
# Check if MCP server is running
ps aux | grep n8n-mcp-server

# Check logs
tail -f /tmp/mcp-server.log

# Restart MCP server
pkill -f n8n-mcp-server
node services/n8n-mcp-server-start.js
```

#### DeepSeek API Errors

```bash
# Check API key
echo $DEEPSEEK_API_KEY

# Test DeepSeek connection
curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  https://api.deepseek.com/v1/models
```

---

## Support

For issues, questions, or contributions:

- GitHub Issues: https://github.com/DashZeroAlionSystems/LightDom/issues
- Documentation: See README files in each service directory
- Storybook: `npm run storybook` for component documentation

---

## License

See LICENSE file in the repository root.
