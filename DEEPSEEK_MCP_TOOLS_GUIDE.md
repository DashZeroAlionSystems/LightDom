# DeepSeek MCP Tools Configuration Guide

## Overview

This guide explains the comprehensive MCP (Model Context Protocol) tools configuration for DeepSeek integration with the LightDom platform. The system enables DeepSeek to interact with the codebase through a rich set of tools, automated schema relationship mapping, and intelligent workflow execution.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation & Setup](#installation--setup)
3. [Available Tools](#available-tools)
4. [Schema Relationship Mapping](#schema-relationship-mapping)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    DeepSeek Agent                            │
│              (Uses MCP Protocol)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 DeepSeek MCP Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         DeepSeek Tools Registry                       │  │
│  │  • Schema Tools      • Workflow Tools                 │  │
│  │  • Code Analysis     • Database Tools                 │  │
│  │  • File System       • Configuration Tools            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          Schema Relationship Mapper                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Algorithms:                                          │  │
│  │  • Property Match      • Naming Convention            │  │
│  │  • Type Compatibility  • Structural Similarity        │  │
│  │  • Semantic Analysis   • Transitive Inference         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  LightDom Platform                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Database   │  │  File System │  │  Workflows   │     │
│  │  (PostgreSQL)│  │              │  │   (n8n)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

✅ **Tool Registry System** - Comprehensive catalog of tools DeepSeek can use
✅ **Schema Relationship Mapping** - Auto-discovery of schema relationships using multiple algorithms
✅ **Configuration-Based Behavior** - DeepSeek behavior controlled by schema relationships and config
✅ **Permission System** - Fine-grained permissions for tool execution
✅ **Automatic Schema Generation** - Generate schemas from code and vice versa
✅ **Workflow Automation** - Create and execute workflows with schema binding
✅ **Graph Visualization** - Export schema maps in multiple formats (Mermaid, Graphviz, Cytoscape)

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- DeepSeek API key (optional, for AI features)
- n8n instance (optional, for workflow integration)

### Step 1: Install Dependencies

```bash
npm install @modelcontextprotocol/sdk pg ts-node typescript
```

### Step 2: Database Setup

Ensure your PostgreSQL database has the required schema tables:

```sql
-- Schemas table
CREATE TABLE IF NOT EXISTS schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  schema_definition JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schema relationships table
CREATE TABLE IF NOT EXISTS schema_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
  target_schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_schema_id, target_schema_id, relationship_type)
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  workflow_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow tasks table
CREATE TABLE IF NOT EXISTS workflow_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(workflow_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  ordering INTEGER NOT NULL,
  handler_config JSONB DEFAULT '{}',
  dependencies UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Workflow runs table
CREATE TABLE IF NOT EXISTS workflow_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(workflow_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  input_data JSONB DEFAULT '{}',
  result_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Environment Configuration

Create or update your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=postgres

# DeepSeek API
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-chat

# n8n (optional)
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

### Step 4: Configure MCP

Copy the DeepSeek MCP configuration:

```bash
cp deepseek-mcp-config.json mcp-config.json
```

Or manually add the `deepseek-tools` server to your existing `mcp-config.json`:

```json
{
  "mcpServers": {
    "deepseek-tools": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "src/mcp/deepseek-mcp-server.ts"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "info",
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "lightdom",
        "DB_USER": "postgres",
        "DB_PASSWORD": "postgres"
      }
    }
  }
}
```

### Step 5: Start the MCP Server

```bash
# Test the server
node --loader ts-node/esm src/mcp/deepseek-mcp-server.ts

# Or use npm script (if configured)
npm run mcp:deepseek
```

---

## Available Tools

### Schema Tools

#### 1. `query_schema`
Query schema definitions and relationships from the database.

```typescript
{
  schemaName: string;
  includeRelations?: boolean;
  depth?: number;
}
```

#### 2. `create_schema`
Create a new schema definition with automatic relationship detection.

```typescript
{
  name: string;
  category?: string;
  schemaDefinition: object;
  autoLinkRelations?: boolean;
}
```

#### 3. `find_schema_relationships`
Discover and map relationships between schemas using algorithms.

```typescript
{
  schemaId: string;
  algorithm?: 'property-match' | 'semantic' | 'structural' | 'all';
}
```

#### 4. `generate_schema_map`
Generate a comprehensive map of all schema relationships.

```typescript
{
  algorithm?: 'graph-traversal' | 'property-similarity' | 'semantic-analysis' | 'hybrid';
  includeInferred?: boolean;
  outputFormat?: 'json' | 'mermaid' | 'graphviz' | 'cytoscape';
}
```

### Workflow Tools

#### 5. `create_workflow`
Create a new workflow with schema-based task configuration.

```typescript
{
  name: string;
  workflowType?: 'sequential' | 'parallel' | 'dag';
  tasks: Array<{
    name: string;
    type: string;
    config: object;
  }>;
  schemaBinding?: object;
}
```

#### 6. `execute_workflow`
Execute a workflow with given input parameters.

```typescript
{
  workflowId: string;
  inputData?: object;
  validateAgainstSchema?: boolean;
}
```

### Code Analysis Tools

#### 7. `analyze_codebase`
Analyze codebase structure and extract schema patterns.

```typescript
{
  targetPath: string;
  analysisType?: 'schema' | 'component' | 'api' | 'full';
  outputFormat?: 'json' | 'graph' | 'markdown';
}
```

#### 8. `generate_schema_from_code`
Auto-generate schema definitions from existing code.

```typescript
{
  filePath: string;
  schemaType?: 'typescript' | 'json-schema' | 'graphql' | 'prisma';
  includeComments?: boolean;
}
```

### Database Tools

#### 9. `query_database`
Execute safe database queries with schema validation.

```typescript
{
  query: string;
  params?: any[];
  validateWithSchema?: string;
}
```

### File System Tools

#### 10. `read_file`
Read file contents with optional schema parsing.

```typescript
{
  filePath: string;
  parseAsSchema?: boolean;
}
```

#### 11. `write_file`
Write file with optional schema validation.

```typescript
{
  filePath: string;
  content: string;
  validateWithSchema?: string;
}
```

### Configuration Tools

#### 12. `get_deepseek_config`
Retrieve DeepSeek configuration including behavior settings.

```typescript
{
  section?: 'api' | 'memory' | 'reasoning' | 'naming' | 'behavior' | 'all';
}
```

#### 13. `update_deepseek_config`
Update DeepSeek configuration settings.

```typescript
{
  section: 'api' | 'memory' | 'reasoning' | 'naming' | 'behavior';
  updates: object;
}
```

---

## Schema Relationship Mapping

### Algorithms

The system uses multiple algorithms to discover and map relationships between schemas:

#### 1. Property Match Algorithm
Finds relationships based on common property names.

- **Confidence Calculation**: `commonProperties / max(props1.length, props2.length)`
- **Use Case**: Identifying schemas with similar data structures

#### 2. Naming Convention Algorithm
Detects references based on naming patterns.

- **Patterns Detected**:
  - `userId` → References `User` schema
  - `product_id` → References `Product` schema
  - `userRef`, `productKey`, etc.
- **Confidence**: 0.8 (high confidence for clear naming patterns)

#### 3. Type Compatibility Algorithm
Finds relationships based on compatible property types.

- **Compatible Pairs**: string/text, integer/number, boolean/bool
- **Use Case**: Finding schemas that can exchange data

#### 4. Structural Similarity Algorithm
Analyzes overall structure similarity using Jaccard index.

- **Features Compared**: property types, required fields, nested structures
- **Use Case**: Finding schemas with similar architectural patterns

#### 5. Semantic Analysis Algorithm
Uses semantic similarity for property names.

- **Method**: Levenshtein distance for string similarity
- **Use Case**: Finding schemas with semantically related names

#### 6. Transitive Inference
Automatically infers indirect relationships.

- **Rule**: If A → B and B → C, then A → C
- **Confidence**: `min(conf(A→B), conf(B→C)) × 0.7`

### Generating Schema Maps

```typescript
// Example: Generate comprehensive schema map
const result = await executeTool('generate_schema_map', {
  algorithm: 'hybrid',
  includeInferred: true,
  outputFormat: 'mermaid'
});

// Output formats:
// - json: Standard JSON graph structure
// - mermaid: Mermaid diagram syntax
// - graphviz: DOT format for Graphviz
// - cytoscape: Cytoscape.js JSON format
```

### Example Mermaid Output

```mermaid
graph TD
  User["User"]:::model
  Product["Product"]:::model
  Order["Order"]:::model
  
  User -->|foreign-key (80%)| Order
  Product -->|foreign-key (80%)| Order
  User -->|property-match (65%)| Product
  
  classDef model fill:#f3e5f5
```

---

## Configuration

### DeepSeek Behavior Configuration

The `deepseek-mcp-config.json` file controls DeepSeek's behavior:

```json
{
  "behaviorConfiguration": {
    "deepseek": {
      "autoGenerateSchemas": true,
      "autoLinkRelationships": true,
      "enableSelfImprovement": true,
      "learningMode": "active",
      "reasoningPattern": "chain-of-thought",
      "safetyMode": "strict",
      "maxSelfModifications": 5,
      "requireHumanApprovalFor": [
        "database:write",
        "file:delete",
        "schema:delete",
        "workflow:execute:production"
      ]
    }
  }
}
```

### Schema Configuration

```json
{
  "schemaConfiguration": {
    "autoDiscovery": {
      "enabled": true,
      "scanIntervalMinutes": 60,
      "includePaths": ["schemas/**/*.json", "src/**/*.schema.ts"]
    },
    "relationshipMapping": {
      "algorithms": [
        "property-match",
        "naming-convention",
        "type-compatibility",
        "structural-similarity",
        "semantic-analysis"
      ],
      "minConfidence": 0.3,
      "autoSaveToDatabase": true,
      "enableTransitiveInference": true
    }
  }
}
```

---

## Usage Examples

### Example 1: Query Existing Schema

```typescript
// Query a schema with its relationships
const schema = await executeTool('query_schema', {
  schemaName: 'User',
  includeRelations: true,
  depth: 2
});

console.log(schema);
// Output:
// {
//   id: 'uuid',
//   name: 'User',
//   category: 'model',
//   schema_definition: { ... },
//   relations: [
//     { targetSchemaName: 'Order', type: 'has-many', confidence: 0.9 }
//   ]
// }
```

### Example 2: Create Schema with Auto-Linking

```typescript
// Create a new schema and automatically link it to related schemas
const newSchema = await executeTool('create_schema', {
  name: 'UserProfile',
  category: 'model',
  schemaDefinition: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
      bio: { type: 'string' },
      avatar: { type: 'string', format: 'uri' }
    },
    required: ['userId']
  },
  autoLinkRelations: true
});

// The system will automatically detect that 'userId' references the 'User' schema
```

### Example 3: Find Schema Relationships

```typescript
// Discover all relationships for a schema
const relationships = await executeTool('find_schema_relationships', {
  schemaId: 'user-schema-uuid',
  algorithm: 'all'
});

console.log(relationships);
// Output:
// {
//   propertyMatches: [ ... ],
//   semantic: [ ... ],
//   structural: [ ... ],
//   combined: [ ... ]
// }
```

### Example 4: Generate Complete Schema Map

```typescript
// Generate a visual schema map
const schemaMap = await executeTool('generate_schema_map', {
  algorithm: 'hybrid',
  includeInferred: true,
  outputFormat: 'mermaid'
});

// Save to file
await executeTool('write_file', {
  filePath: './docs/schema-map.mmd',
  content: schemaMap
});
```

### Example 5: Create and Execute Workflow

```typescript
// Create a workflow
const workflow = await executeTool('create_workflow', {
  name: 'User Registration Workflow',
  workflowType: 'sequential',
  tasks: [
    {
      name: 'Validate Input',
      type: 'validation',
      config: { schemaId: 'user-input-schema' }
    },
    {
      name: 'Create User',
      type: 'database',
      config: { operation: 'insert', table: 'users' }
    },
    {
      name: 'Send Welcome Email',
      type: 'email',
      config: { template: 'welcome' }
    }
  ],
  schemaBinding: {
    input: 'user-input-schema',
    output: 'user-output-schema'
  }
});

// Execute the workflow
const run = await executeTool('execute_workflow', {
  workflowId: workflow.workflow_id,
  inputData: {
    email: 'user@example.com',
    name: 'John Doe'
  },
  validateAgainstSchema: true
});
```

### Example 6: Generate Schema from Code

```typescript
// Analyze TypeScript interface and generate schema
const generatedSchema = await executeTool('generate_schema_from_code', {
  filePath: './src/types/user.ts',
  schemaType: 'typescript',
  includeComments: true
});

// Create schema in database
await executeTool('create_schema', {
  name: 'GeneratedUserSchema',
  schemaDefinition: generatedSchema,
  autoLinkRelations: true
});
```

---

## API Reference

### Tool Execution Context

Every tool receives a context object:

```typescript
interface ToolContext {
  db: Pool;              // PostgreSQL connection pool
  userId?: string;       // Optional user ID
  sessionId?: string;    // Unique session identifier
  config: any;           // DeepSeek configuration
}
```

### Permission System

Tools require specific permissions:

- `read:schema` - Read schema definitions
- `write:schema` - Create/update schemas
- `analyze:schema` - Run analysis algorithms
- `read:workflow` - Read workflow definitions
- `write:workflow` - Create/update workflows
- `execute:workflow` - Execute workflows
- `read:files` - Read files from filesystem
- `write:files` - Write files to filesystem
- `analyze:code` - Analyze code structure
- `read:database` - Query database
- `read:config` - Read configuration
- `write:config` - Update configuration

### Error Handling

All tools return errors in a consistent format:

```json
{
  "error": "Error message",
  "stack": "Stack trace",
  "code": "ERROR_CODE"
}
```

---

## Best Practices

### 1. Schema Design

- Use clear, descriptive names
- Follow consistent naming conventions
- Include `id` or `userId` fields for relationships
- Add metadata for better relationship detection

### 2. Relationship Mapping

- Run mapping algorithms periodically
- Set appropriate confidence thresholds
- Review auto-detected relationships
- Use manual overrides when needed

### 3. Workflow Design

- Break complex workflows into smaller tasks
- Use schema binding for type safety
- Validate inputs and outputs
- Handle errors gracefully

### 4. Security

- Use strict safety mode in production
- Require approval for sensitive operations
- Limit tool permissions appropriately
- Validate all user inputs

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database is running
psql -h localhost -U postgres -d lightdom

# Verify environment variables
echo $DB_HOST $DB_PORT $DB_NAME
```

#### MCP Server Not Starting

```bash
# Check Node.js version
node --version  # Should be 18+

# Check TypeScript compilation
npx tsc --noEmit

# View server logs
node --loader ts-node/esm src/mcp/deepseek-mcp-server.ts 2>&1 | tee server.log
```

#### Schema Relationships Not Found

- Check schema definitions are in database
- Lower `minConfidence` threshold
- Run multiple algorithms
- Add manual relationship hints

---

## Advanced Topics

### Custom Algorithms

You can add custom relationship detection algorithms by extending the `SchemaRelationshipMapper`:

```typescript
class CustomMapper extends SchemaRelationshipMapper {
  private myCustomAlgorithm(schemas: SchemaNode[]): SchemaRelationship[] {
    // Your custom logic here
    return relationships;
  }
}
```

### Integration with AI

DeepSeek can use these tools to:

1. Analyze your codebase structure
2. Auto-generate schemas from code
3. Discover hidden relationships
4. Create optimized workflows
5. Suggest improvements

### Performance Optimization

- Use connection pooling for database
- Cache frequently accessed schemas
- Batch relationship calculations
- Use indexes on relationship tables

---

## License

This MCP tools configuration is part of the LightDom project and follows the same license terms.

---

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check existing documentation
- Review example code
- Contact the development team
