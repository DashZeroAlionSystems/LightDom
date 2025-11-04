# MCP Server Management System

A comprehensive workflow for managing Model Context Protocol (MCP) server instances with CRUD operations, schema linking, and agent orchestration.

## 🎯 Overview

This implementation provides a complete system for managing DeepSeek and other AI agent instances through the MCP protocol, with topic-specific schema linking for enhanced context and performance.

## 🏗️ Architecture

### Components

1. **Backend API** (`/api/mcp/*`)
   - CRUD operations for MCP server instances
   - Schema linking and management
   - Tool execution and history tracking
   - Health monitoring and statistics

2. **Frontend Dashboard** (`src/components/MCPServerDashboard.tsx`)
   - Visual management interface
   - Server creation and editing
   - Schema linking UI
   - Tool execution interface
   - Execution history timeline

3. **Database Schema** (`migrations/20250104_create_mcp_servers.sql`)
   - `mcp_servers` - Agent instance configuration
   - `mcp_server_schemas` - Schema-to-server linking
   - `mcp_tool_executions` - Execution history
   - `schemas` - Available schemas for linking

4. **Navigation Integration**
   - ProfessionalSidebar menu item
   - DashboardLayout menu under "AI & Agents"

## 📡 API Endpoints

### Server Management

#### List Servers
```http
GET /api/mcp/servers?active=true&agentType=deepseek
```

Response:
```json
{
  "success": true,
  "servers": [
    {
      "id": 1,
      "name": "SEO Specialist Agent",
      "description": "DeepSeek instance specialized in SEO",
      "agent_type": "deepseek",
      "model_name": "deepseek-r1",
      "topic": "seo",
      "linked_schemas_count": 2,
      "active": true
    }
  ],
  "total": 1
}
```

#### Get Server Details
```http
GET /api/mcp/servers/:id
```

Response includes linked schemas and recent executions.

#### Create Server
```http
POST /api/mcp/servers
Content-Type: application/json

{
  "name": "SEO Specialist Agent",
  "description": "DeepSeek instance for SEO optimization",
  "agent_type": "deepseek",
  "model_name": "deepseek-r1",
  "topic": "seo",
  "schema_ids": [1, 2],
  "config": {
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "active": true
}
```

#### Update Server
```http
PUT /api/mcp/servers/:id
Content-Type: application/json

{
  "description": "Updated description",
  "schema_ids": [1, 2, 3],
  "active": false
}
```

#### Delete Server
```http
DELETE /api/mcp/servers/:id
```

### Schema Management

#### List Schemas
```http
GET /api/mcp/schemas?category=seo&search=optimization
```

#### Link Schemas
```http
POST /api/mcp/servers/:id/schemas
Content-Type: application/json

{
  "schema_ids": [1, 2, 3]
}
```

#### Unlink Schema
```http
DELETE /api/mcp/servers/:id/schemas/:schema_id
```

### Tool Execution

#### Execute Tool
```http
POST /api/mcp/servers/:id/execute
Content-Type: application/json

{
  "tool_name": "analyze_seo",
  "args": {
    "url": "https://example.com",
    "metrics": ["speed", "seo"]
  },
  "context": {
    "campaign": "test-campaign"
  }
}
```

Response:
```json
{
  "success": true,
  "result": {
    "executionId": "exec-1234567890",
    "serverId": 1,
    "serverName": "SEO Specialist Agent",
    "toolName": "analyze_seo",
    "linkedSchemas": [
      { "id": 1, "name": "SEO Analysis Schema" }
    ],
    "timestamp": "2025-01-04T19:00:00Z",
    "status": "success"
  }
}
```

#### Get Execution History
```http
GET /api/mcp/servers/:id/executions?limit=50&offset=0
```

### System Health

#### Health Check
```http
GET /api/mcp/health
```

Response:
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "stats": {
      "total_servers": 3,
      "active_servers": 2,
      "total_executions": 150,
      "avg_execution_time": 245
    }
  }
}
```

## 🎨 UI Features

### Dashboard Components

1. **Server List Table**
   - Sortable and filterable
   - Status indicators
   - Quick actions (Execute, Edit, Delete)
   - Schema count badges

2. **Create/Edit Modal**
   - Form validation
   - Agent type selection (DeepSeek, Ollama, OpenAI, Anthropic)
   - Schema multi-select with search
   - Configuration fields
   - Active status toggle

3. **Execute Tool Modal**
   - Tool selection dropdown
   - JSON arguments input
   - Linked schema indicator
   - Real-time execution

4. **Server Details Modal**
   - Overview tab with server info
   - Linked schemas tab with timeline
   - Recent executions tab with status
   - Detailed execution history

5. **Statistics Cards**
   - Total servers
   - Active servers
   - Total executions
   - Average execution time

## 🔧 Configuration

### Agent Types Supported

- **DeepSeek** - DeepSeek R1 and other models
- **Ollama** - Local LLM instances
- **OpenAI** - GPT models
- **Anthropic** - Claude models

### Schema Categories

- `seo` - SEO analysis and optimization
- `component` - UI component extraction
- `workflow` - Workflow automation
- `content` - Content generation
- `data` - Data mining and extraction

### Built-in Tools

- `analyze_seo` - SEO analysis
- `extract_components` - Component extraction
- `generate_workflow` - Workflow generation
- `generate_content` - Content creation
- `mine_data` - Data mining

## 🚀 Usage Examples

### Creating a Specialized Agent

```typescript
// Create an SEO specialist agent with relevant schemas
const agent = await fetch('/api/mcp/servers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'SEO Optimization Agent',
    description: 'Specialized in technical SEO and content optimization',
    agent_type: 'deepseek',
    model_name: 'deepseek-r1',
    topic: 'seo',
    schema_ids: [1, 2], // SEO Analysis and Content schemas
    config: {
      temperature: 0.7,
      max_tokens: 2000,
      context_window: 8000
    },
    active: true
  })
});
```

### Executing a Tool

```typescript
// Execute SEO analysis on the agent
const result = await fetch(`/api/mcp/servers/${serverId}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool_name: 'analyze_seo',
    args: {
      url: 'https://example.com',
      metrics: ['performance', 'accessibility', 'best-practices', 'seo'],
      deep_scan: true
    },
    context: {
      campaign_id: 'campaign-123',
      user_preferences: {
        include_recommendations: true,
        format: 'detailed'
      }
    }
  })
});
```

### Linking Schemas Dynamically

```typescript
// Add more schemas to an existing agent
await fetch(`/api/mcp/servers/${serverId}/schemas`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schema_ids: [3, 4, 5] // Add workflow and content schemas
  })
});
```

## 📊 Database Schema

### mcp_servers
```sql
CREATE TABLE mcp_servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(100) NOT NULL,
  model_name VARCHAR(255) DEFAULT 'deepseek-r1',
  endpoint_url TEXT,
  topic VARCHAR(255),
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### mcp_server_schemas
```sql
CREATE TABLE mcp_server_schemas (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES mcp_servers(id) ON DELETE CASCADE,
  schema_id INTEGER REFERENCES schemas(id) ON DELETE CASCADE,
  linked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(server_id, schema_id)
);
```

### mcp_tool_executions
```sql
CREATE TABLE mcp_tool_executions (
  id VARCHAR(255) PRIMARY KEY,
  server_id INTEGER REFERENCES mcp_servers(id),
  tool_name VARCHAR(255) NOT NULL,
  args JSONB,
  context JSONB,
  result JSONB,
  error TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration INTEGER,
  sub_agent VARCHAR(255)
);
```

## 🧪 Testing

Run the API test suite:

```bash
node test-mcp-api.js
```

This will test:
- Server listing
- Schema retrieval
- Server creation
- Server updates
- Tool execution
- Execution history
- Health checks
- Server deletion

## 🔐 Security Considerations

1. **Authentication** - Implement bearer token auth for production
2. **Schema Validation** - Validate schema definitions before linking
3. **Rate Limiting** - Apply rate limits to tool execution endpoints
4. **Input Sanitization** - Sanitize all user inputs
5. **Audit Trail** - All operations are logged in mcp_tool_executions

## 📈 Performance Optimization

1. **Caching** - Cache frequently accessed schemas
2. **Pagination** - All list endpoints support pagination
3. **Indexing** - Database indexes on frequently queried fields
4. **Batching** - Batch schema linking operations
5. **WebSocket** - Real-time updates via Socket.io

## 🔄 Integration with Existing Systems

### MCP Protocol Integration
The system integrates with existing MCP implementations:
- `knowledge-graph-mcp-server.js` - Knowledge graph queries
- `memory-workflow-mcp-server.js` - Workflow orchestration
- `src/services/ai/MCPServer.ts` - Core MCP server class

### Schema Linking System
Leverages the existing schema linking infrastructure:
- Schema registry from schema-linking services
- Component schema tools
- Workflow generation patterns

## 🛣️ Roadmap

- [ ] Agent health monitoring and auto-restart
- [ ] Multi-agent collaboration workflows
- [ ] Schema version management
- [ ] Tool marketplace integration
- [ ] Performance analytics dashboard
- [ ] A/B testing for agent configurations
- [ ] Agent training data management
- [ ] Cost tracking and optimization

## 📚 References

- [MCP Protocol Specification](https://www.skyvern.com/blog/browser-automation-mcp-servers-guide/)
- [DeepSeek Documentation](https://deepseek.com)
- Existing implementations in `/src/services/ai/MCPServer.ts`
- Schema linking system in `/services/schema-linking-routes.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

Part of the LightDom platform. See main repository license.
