# Schema Linking Service

Comprehensive database schema analysis and linking service for LightDom platform. Automatically discovers relationships between database tables, identifies feature groupings, and generates linked schema maps for automated workflow and dashboard generation.

## Features

- 🔍 **Automatic Schema Discovery**: Analyzes all database tables and their structure
- 🔗 **Relationship Mapping**: Discovers foreign key and semantic relationships
- 🎯 **Feature Identification**: Groups related tables into logical features
- 📊 **Dashboard Generation**: Auto-generates dashboard configurations from schemas
- 🔄 **Workflow Automation**: Creates workflow configurations from linked schemas
- 🚀 **Automated Runner**: Background service for continuous schema maintenance
- 🌐 **REST API**: Full API for schema management and querying

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Schema Linking Service                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │   Database   │───│    Schema    │───│  Feature     │    │
│  │   Analysis   │   │   Linking    │   │  Grouping    │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Linked Schema Map Generator                │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │ Dashboards │   │  Workflows   │   │    API       │     │
│  └────────────┘   └──────────────┘   └──────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Installation

The service is already integrated into the LightDom platform. No additional installation required.

## Usage

### CLI Usage

#### Run Schema Analysis Once

```bash
node services/schema-linking-runner.js run-once
```

#### Start Automated Runner

```bash
node services/schema-linking-runner.js start
```

The runner will:
- Analyze database schema immediately
- Run periodic analysis every hour
- Export linked schemas to `data/linked-schemas/`
- Generate summary reports

### API Usage

The schema linking API is available at `/api/schema-linking` when the API server is running.

#### Analyze Database Schema

```bash
curl http://localhost:3001/api/schema-linking/analyze
```

#### Get All Tables

```bash
curl http://localhost:3001/api/schema-linking/tables
```

#### Get Relationships

```bash
# All relationships
curl http://localhost:3001/api/schema-linking/relationships

# Filter by type
curl http://localhost:3001/api/schema-linking/relationships?type=foreign_key
```

#### Get Features

```bash
curl http://localhost:3001/api/schema-linking/features
```

#### Get Feature Schema Map

```bash
curl http://localhost:3001/api/schema-linking/features/user
```

#### Get Dashboards for Feature

```bash
curl http://localhost:3001/api/schema-linking/dashboards/seo_client
```

#### Get Workflows for Feature

```bash
curl http://localhost:3001/api/schema-linking/workflows/optimization
```

#### Export Schemas

```bash
curl -X POST http://localhost:3001/api/schema-linking/export \
  -H "Content-Type: application/json" \
  -d '{"outputPath": "./my-schemas.json"}'
```

#### Runner Control

```bash
# Get runner status
curl http://localhost:3001/api/schema-linking/runner/status

# Start runner
curl -X POST http://localhost:3001/api/schema-linking/runner/start

# Stop runner
curl -X POST http://localhost:3001/api/schema-linking/runner/stop

# Run single cycle
curl -X POST http://localhost:3001/api/schema-linking/runner/run
```

### Programmatic Usage

```javascript
import SchemaLinkingService from './services/schema-linking-service.js';

const service = new SchemaLinkingService({
  host: 'localhost',
  port: 5434,
  database: 'lightdom',
  user: 'lightdom_user',
  password: 'lightdom_password'
});

// Analyze schema
const result = await service.analyzeDatabaseSchema();
console.log(`Found ${result.tables} tables`);
console.log(`Found ${result.relationships} relationships`);
console.log(`Found ${result.features} features`);

// Get linked schema for a feature
const userSchema = service.generateLinkedSchemaMap('user');
console.log('User feature dashboards:', userSchema.dashboards);
console.log('User feature workflows:', userSchema.workflows);

// Export all schemas
await service.exportLinkedSchemas('./linked-schemas.json');

// Clean up
await service.close();
```

## Schema Link Types

The service discovers three types of relationships:

### 1. Foreign Key Relationships

Direct database foreign key constraints.

```json
{
  "type": "foreign_key",
  "source": {
    "schema": "public",
    "table": "optimizations",
    "column": "user_id"
  },
  "target": {
    "schema": "public",
    "table": "users",
    "column": "id"
  },
  "constraints": {
    "updateRule": "NO ACTION",
    "deleteRule": "CASCADE"
  },
  "strength": 1.0
}
```

### 2. Semantic Relationships

Discovered through common columns and field analysis.

```json
{
  "type": "semantic",
  "source": {
    "schema": "public",
    "table": "seo_clients"
  },
  "target": {
    "schema": "public",
    "table": "seo_analytics"
  },
  "commonFields": ["client_id", "config", "settings"],
  "strength": 0.8,
  "bidirectional": true
}
```

### 3. Naming Pattern Relationships

Discovered through table naming conventions.

```json
{
  "type": "naming_pattern",
  "source": {
    "schema": "public",
    "table": "blockchain_events"
  },
  "target": {
    "schema": "public",
    "table": "blockchain_schema"
  },
  "pattern": "common_base",
  "strength": 0.7
}
```

## Feature Groupings

Tables are automatically grouped into features based on naming patterns:

```json
{
  "name": "seo_client",
  "tables": [
    {
      "tableName": "seo_clients",
      "columns": [...],
      "primaryKeys": ["id"]
    },
    {
      "tableName": "seo_analytics",
      "columns": [...],
      "primaryKeys": ["id"]
    }
  ],
  "settings": ["config", "settings"],
  "options": ["subscription_tier", "status"]
}
```

## Generated Dashboards

The service auto-generates dashboard configurations from table schemas:

```json
{
  "id": "seo_client-seo_clients-dashboard",
  "name": "Seo Clients Configuration",
  "table": "seo_clients",
  "components": [
    {
      "id": "seo_clients-domain-component",
      "type": "input",
      "field": "domain",
      "label": "Domain",
      "required": true,
      "validation": [
        {"type": "required", "message": "domain is required"},
        {"type": "maxLength", "value": 255}
      ]
    },
    {
      "id": "seo_clients-subscription_tier-component",
      "type": "input",
      "field": "subscription_tier",
      "label": "Subscription Tier",
      "required": true
    }
  ],
  "layout": {
    "type": "grid",
    "columns": 12,
    "responsive": true
  }
}
```

## Generated Workflows

The service creates workflow configurations for feature configuration:

```json
{
  "id": "seo_client-configuration-workflow",
  "name": "Seo Client Configuration",
  "steps": [
    {
      "id": "step-0",
      "table": "seo_clients",
      "action": "configure",
      "fields": ["domain", "api_key", "subscription_tier", ...]
    },
    {
      "id": "step-1",
      "table": "seo_analytics",
      "action": "configure",
      "fields": ["url", "seo_score", "performance_score", ...]
    }
  ],
  "triggers": [
    {"type": "manual", "description": "Manual workflow execution"},
    {"type": "api", "description": "API triggered workflow"}
  ],
  "automation": {
    "enabled": true,
    "rules": []
  }
}
```

## Output Files

### Linked Schemas Export

Located in `data/linked-schemas/`:

- `linked-schemas-{timestamp}.json` - Full schema export
- `latest.json` - Symlink to most recent export
- `report-{timestamp}.md` - Human-readable summary report

### Export Structure

```json
{
  "metadata": {
    "exportedAt": "2025-11-01T12:00:00.000Z",
    "totalTables": 25,
    "totalRelationships": 42,
    "totalFeatures": 12
  },
  "tables": [...],
  "relationships": [...],
  "features": [...],
  "linkedSchemas": {
    "user": {...},
    "optimization": {...},
    "seo_client": {...}
  }
}
```

## Configuration

Environment variables:

```bash
# Database configuration
DB_HOST=localhost
DB_PORT=5434
DB_NAME=lightdom
DB_USER=lightdom_user
DB_PASSWORD=lightdom_password
```

Runner configuration:

```javascript
const runner = new SchemaLinkingRunner({
  runInterval: 3600000,  // Run every hour (ms)
  outputDir: './data/linked-schemas',
  autoStart: true
});
```

## Integration with Existing Systems

### Add to API Server

In `api-server-express.js`:

```javascript
import schemaLinkingRoutes from './services/schema-linking-routes.js';

app.use('/api/schema-linking', schemaLinkingRoutes);
```

### Add npm Scripts

In `package.json`:

```json
{
  "scripts": {
    "schema:link": "node services/schema-linking-runner.js run-once",
    "schema:link:start": "node services/schema-linking-runner.js start"
  }
}
```

## Benefits

1. **Automated Documentation**: Always up-to-date schema documentation
2. **Feature Discovery**: Automatic identification of feature boundaries
3. **Dashboard Generation**: Auto-create configuration dashboards
4. **Workflow Automation**: Generate workflows from schema relationships
5. **API Integration**: RESTful access to schema metadata
6. **Continuous Maintenance**: Background runner keeps schemas current

## Use Cases

### 1. Generate Configuration Dashboards

```javascript
const schema = service.generateLinkedSchemaMap('seo_client');
const dashboards = schema.dashboards;

// Use dashboards to render UI
for (const dashboard of dashboards) {
  renderDashboard(dashboard);
}
```

### 2. Create Automated Workflows

```javascript
const schema = service.generateLinkedSchemaMap('optimization');
const workflow = schema.workflows;

// Execute workflow
await executeWorkflow(workflow);
```

### 3. Discover Feature Relationships

```javascript
const relationships = await service.getFeatureRelationships('user');

// Visualize relationships
visualizeGraph(relationships);
```

### 4. Monitor Schema Changes

```javascript
const runner = new SchemaLinkingRunner({ autoStart: true });
await runner.initialize();

// Gets notified of schema changes
runner.on('analysis-complete', (result) => {
  console.log('Schema updated:', result);
  notifyTeam(result);
});
```

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and credentials are correct:

```bash
psql -h localhost -p 5434 -U lightdom_user -d lightdom
```

### Missing Tables

Run database migrations first:

```bash
node run-migrations.js
```

### Permission Errors

Ensure output directory has write permissions:

```bash
mkdir -p data/linked-schemas
chmod 755 data/linked-schemas
```

## Future Enhancements

- [ ] Schema version tracking
- [ ] Change detection and notifications
- [ ] Visual schema graph generation
- [ ] Custom relationship rules
- [ ] Machine learning for semantic relationships
- [ ] Integration with existing workflow systems
- [ ] Real-time schema updates via WebSocket

## Contributing

See main project [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

Part of the LightDom platform. See main project LICENSE.
