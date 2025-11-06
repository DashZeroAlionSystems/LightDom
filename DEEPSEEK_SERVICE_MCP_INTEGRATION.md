# DeepSeek Service with MCP Tools Integration

The DeepSeek Orchestration Service now includes integrated MCP (Model Context Protocol) tools, providing enhanced capabilities for schema management, workflow automation, and code analysis.

## Starting the Service

```bash
npm run start:deepseek
```

The service will:
1. Start the HTTP API server on port 4100
2. Initialize MCP Tools (13 tools across 6 categories)
3. Connect to the database for schema operations

## Available Endpoints

### Core DeepSeek Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check (includes MCP tools status) |
| `/workflow/generate` | POST | Generate workflow from natural language prompt |
| `/seeds/generate` | POST | Generate URL seeds for campaigns |
| `/schema/generate` | POST | Generate crawler schema |
| `/pipeline/generate` | POST | Generate workflow pipeline |
| `/config/optimize` | POST | Optimize crawler configuration |

### MCP Tools Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/tools` | GET | List all available MCP tools |
| `/mcp/tools/:category` | GET | List tools by category |
| `/mcp/execute` | POST | Execute an MCP tool |
| `/mcp/schema/map` | POST | Generate schema relationship map |

## MCP Tools Categories

When MCP tools are initialized, DeepSeek can use:

1. **Schema Tools** - Query, create, find relationships, generate maps
2. **Workflow Tools** - Create and execute workflows
3. **Code Analysis** - Analyze codebase, generate schemas from code
4. **Database Tools** - Safe database queries
5. **File System** - Read/write files with validation
6. **Configuration** - Get/update DeepSeek settings

## Usage Examples

### Check Service Health

```bash
curl http://localhost:4100/health
```

Response includes MCP tools status:
```json
{
  "status": "ok",
  "service": "DeepSeek Orchestration Service",
  "timestamp": "2025-11-05T15:00:00.000Z",
  "mcpTools": {
    "available": true,
    "toolCount": 13
  }
}
```

### List Available MCP Tools

```bash
curl http://localhost:4100/mcp/tools
```

### Execute an MCP Tool

```bash
curl -X POST http://localhost:4100/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "query_schema",
    "args": {
      "schemaName": "User",
      "includeRelations": true
    }
  }'
```

### Generate Schema Map

```bash
# Get JSON format
curl -X POST http://localhost:4100/mcp/schema/map \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "minConfidence": 0.3
  }'

# Get Mermaid diagram
curl -X POST http://localhost:4100/mcp/schema/map \
  -H "Content-Type: application/json" \
  -d '{
    "format": "mermaid",
    "minConfidence": 0.3
  }'
```

### List Tools by Category

```bash
curl http://localhost:4100/mcp/tools/schema
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEEPSEEK_PORT` | 4100 | HTTP server port |
| `DEEPSEEK_HOST` | 0.0.0.0 | HTTP server host |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | lightdom | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |

## Features

### Automatic MCP Tools Integration

- MCP tools are automatically initialized on startup
- If database connection fails, service runs without MCP tools
- Tools are accessible via HTTP REST API
- Full error handling and graceful degradation

### Tool Categories

**Schema Tools (4)**
- `query_schema` - Query schema definitions and relationships
- `create_schema` - Create new schemas with auto-linking
- `find_schema_relationships` - Discover relationships using algorithms
- `generate_schema_map` - Generate visual schema maps

**Workflow Tools (2)**
- `create_workflow` - Create workflows with schema binding
- `execute_workflow` - Execute workflows with validation

**Code Analysis Tools (2)**
- `analyze_codebase` - Analyze code structure
- `generate_schema_from_code` - Auto-generate schemas from code

**Database Tools (1)**
- `query_database` - Safe, read-only database queries

**File System Tools (2)**
- `read_file` - Read files with optional schema parsing
- `write_file` - Write files with validation

**Configuration Tools (2)**
- `get_deepseek_config` - Retrieve configuration
- `update_deepseek_config` - Update settings

## Error Handling

If MCP tools fail to initialize:
- Service continues running with core DeepSeek features
- Warning message is logged
- `/health` endpoint shows `mcpTools.available: false`
- MCP endpoints return 503 Service Unavailable

## Logging

The service logs:
- ✅ Successful database connection
- 📦 Number of MCP tools initialized
- ⚠️ Warnings if MCP tools fail to initialize
- 🛑 Shutdown sequence

## Integration with DeepSeek

DeepSeek can now:

1. **Use Tools via HTTP** - Call `/mcp/execute` to use any tool
2. **List Available Tools** - Discover what tools are available
3. **Generate Schema Maps** - Visualize codebase relationships
4. **Query Schemas** - Understand data structures
5. **Create Workflows** - Automate tasks based on schemas
6. **Analyze Code** - Extract patterns from the codebase

## Comparison with Standalone MCP Server

| Feature | DeepSeek Service | Standalone MCP Server |
|---------|------------------|----------------------|
| Protocol | HTTP REST | MCP stdio |
| Port | 4100 | N/A (stdio) |
| Integration | Built-in | External process |
| Access | HTTP endpoints | MCP client required |
| Use Case | HTTP API access | IDE integration |

## Troubleshooting

### MCP Tools Not Available

Check the service logs for initialization errors:

```bash
npm run start:deepseek
```

Look for:
- ✅ Database connected for MCP tools
- 📦 MCP Tools initialized: 13 tools available

### Database Connection Issues

Verify database is running and credentials are correct:

```bash
psql -h localhost -U postgres -d lightdom
```

### Tool Execution Errors

Check that:
1. Tool name is correct (use `/mcp/tools` to list)
2. Required arguments are provided
3. Database tables exist (run setup if needed)

## See Also

- **MCP Tools Guide**: `DEEPSEEK_MCP_TOOLS_GUIDE.md`
- **Quick Start**: `DEEPSEEK_MCP_QUICKSTART.md`
- **Architecture**: `DEEPSEEK_MCP_ARCHITECTURE.md`
- **Standalone MCP Server**: `npm run mcp:deepseek:start`
