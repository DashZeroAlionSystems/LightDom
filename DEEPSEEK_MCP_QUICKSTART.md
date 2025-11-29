# DeepSeek MCP Tools - Quick Start

## 🚀 Quick Setup

Get started with DeepSeek MCP tools in 3 steps:

### 1. Run Setup Script

```bash
npm run mcp:deepseek:setup
```

This will:
- ✅ Check prerequisites (Node.js 18+, PostgreSQL)
- ✅ Create database tables
- ✅ Generate default configuration
- ✅ Test the installation

### 2. Configure (Optional)

Edit `deepseek-config.json` to customize:
- API settings (DeepSeek API key, model)
- Memory configuration
- Reasoning patterns
- Behavior settings

### 3. Start Using

#### Option A: Run Examples

```bash
npm run mcp:deepseek:examples
```

This demonstrates all 13 tools with practical examples.

#### Option B: Start MCP Server

```bash
npm run mcp:deepseek:start
```

Configure your MCP client (e.g., Cursor IDE) with `deepseek-mcp-config.json`.

---

## 📦 What's Included

### Tools (13 Total)

**Schema Tools**
- `query_schema` - Query schemas and relationships
- `create_schema` - Create new schemas with auto-linking
- `find_schema_relationships` - Discover relationships using AI algorithms
- `generate_schema_map` - Generate visual schema maps

**Workflow Tools**
- `create_workflow` - Create workflows with schema binding
- `execute_workflow` - Execute workflows with validation

**Code Analysis Tools**
- `analyze_codebase` - Analyze code structure
- `generate_schema_from_code` - Auto-generate schemas from code

**Database Tools**
- `query_database` - Safe database queries

**File System Tools**
- `read_file` - Read files with schema parsing
- `write_file` - Write files with validation

**Configuration Tools**
- `get_deepseek_config` - Retrieve configuration
- `update_deepseek_config` - Update settings

### Algorithms (6 Total)

1. **Property Match** - Common property detection
2. **Naming Convention** - Reference pattern detection (userId → User)
3. **Type Compatibility** - Compatible type mapping
4. **Structural Similarity** - Jaccard index comparison
5. **Semantic Analysis** - Name similarity analysis
6. **Transitive Inference** - Indirect relationship discovery

---

## 🎯 Common Use Cases

### Generate Schema Map

```bash
npm run mcp:schema:map
```

Outputs a Mermaid diagram of all schema relationships.

### List Available Tools

```bash
npm run mcp:tools:list
```

Shows all 13 tools with descriptions.

### Run Integration Tests

```bash
npm run mcp:deepseek:test
```

Runs comprehensive examples of all features.

---

## 📚 Documentation

- **Complete Guide**: `DEEPSEEK_MCP_TOOLS_GUIDE.md`
- **API Reference**: See guide above
- **Examples**: `examples/deepseek-mcp-tools-examples.ts`
- **Configuration**: `deepseek-mcp-config.json`

---

## 🔧 NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `mcp:deepseek:setup` | Run initial setup |
| `mcp:deepseek:start` | Start MCP server |
| `mcp:deepseek:examples` | Run all examples |
| `mcp:deepseek:test` | Test installation |
| `mcp:schema:map` | Generate schema map |
| `mcp:tools:list` | List available tools |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         DeepSeek Agent                   │
│         (MCP Client)                     │
└─────────────────────────────────────────┘
                  ↓ MCP Protocol
┌─────────────────────────────────────────┐
│      DeepSeek MCP Server                 │
│  ┌────────────────────────────────┐    │
│  │  Tools Registry (13 tools)     │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Schema Relationship Mapper             │
│   (6 algorithms)                         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   LightDom Platform                      │
│   • Database  • Files  • Workflows      │
└─────────────────────────────────────────┘
```

---

## ⚙️ Configuration Options

### API Configuration

```json
{
  "api": {
    "apiKey": "your-key",
    "model": "deepseek-chat",
    "defaultTemperature": 0.7,
    "timeout": 60000
  }
}
```

### Behavior Configuration

```json
{
  "behavior": {
    "autoGenerateSchemas": true,
    "autoLinkRelationships": true,
    "safetyMode": "strict",
    "requireHumanApproval": true
  }
}
```

### Schema Mapping Configuration

```json
{
  "schemaConfiguration": {
    "relationshipMapping": {
      "algorithms": [
        "property-match",
        "naming-convention",
        "type-compatibility"
      ],
      "minConfidence": 0.3,
      "autoSaveToDatabase": true
    }
  }
}
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check database is running
psql -h localhost -U postgres -d lightdom

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=lightdom
export DB_USER=postgres
export DB_PASSWORD=postgres
```

### MCP Server Won't Start

```bash
# Check Node.js version
node --version  # Should be 18+

# Check TypeScript
npx tsc --version

# View detailed logs
npm run mcp:deepseek:start 2>&1 | tee mcp-server.log
```

### No Relationships Found

Lower the confidence threshold in `deepseek-mcp-config.json`:

```json
{
  "schemaConfiguration": {
    "relationshipMapping": {
      "minConfidence": 0.2  // Lower from 0.3
    }
  }
}
```

---

## 🎓 Learning Path

1. **Beginner**: Run `npm run mcp:deepseek:examples`
2. **Intermediate**: Read `DEEPSEEK_MCP_TOOLS_GUIDE.md`
3. **Advanced**: Modify tools in `src/mcp/deepseek-tools-registry.ts`
4. **Expert**: Add custom algorithms to `src/services/schema-relationship-mapper.ts`

---

## 🤝 Support

- 📖 Documentation: `DEEPSEEK_MCP_TOOLS_GUIDE.md`
- 💡 Examples: `examples/deepseek-mcp-tools-examples.ts`
- 🔍 Source: `src/mcp/` and `src/services/`
- 🐛 Issues: Open on GitHub

---

## 📝 License

Part of the LightDom project. Same license terms apply.

---

## ✨ Features at a Glance

✅ **13 Tools** for comprehensive codebase interaction
✅ **6 Algorithms** for intelligent schema mapping
✅ **Auto-Discovery** of schema relationships
✅ **Multi-Format Export** (JSON, Mermaid, Graphviz, Cytoscape)
✅ **Configuration-Based Behavior** for DeepSeek
✅ **Workflow Automation** with schema validation
✅ **Permission System** for secure operations
✅ **Database Integration** with PostgreSQL
✅ **File System Access** with validation
✅ **Code Analysis** and schema generation

---

**Ready to get started?** Run `npm run mcp:deepseek:setup` now!
