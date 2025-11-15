# Category Instance Service System

## Overview

The Category Instance Service System provides a unified interface for creating, managing, and orchestrating different types of service components in the LightDom platform. It implements a hierarchical structure where applications contain campaigns, campaigns run workflows, workflows use data streams, and data streams bundle attributes.

## Architecture

### Hierarchy Structure

```
App (Top Level)
├── Campaigns
│   ├── Workflows
│   │   └── Data Streams
│   │       └── Attributes
│   ├── Services
│   ├── Crawlers
│   ├── Data Mining Jobs
│   └── Neural Networks
├── Seeds
├── Schedulers
└── Attributes (Global)
```

### Category Types

1. **App**: Top-level application container
2. **Campaign**: Can run multiple workflows, contains various services
3. **Service**: Named service instances with exposed API functions
4. **Workflow**: Automation workflows that include data streams
5. **Seed**: URL and data seeding for crawlers
6. **Crawler**: Web crawler job configuration
7. **Scheduler**: Job scheduling and cron management
8. **Neural Network**: TensorFlow/ML model instances
9. **Data Mining**: Data extraction and mining jobs
10. **Data Stream**: Data flow between services with transformation rules
11. **Attribute**: Metadata attribute definitions bundled in data streams

## Database Schema

The system uses the following tables:

- `apps` - Top-level application containers
- `campaigns` - Campaign management
- `service_instances` - Named service instances with API functions
- `workflow_instances` - Workflow definitions
- `seed_instances` - URL/data seeding configuration
- `crawler_instances` - Web crawler jobs
- `scheduler_instances` - Job scheduling
- `neural_network_instances` - ML model management
- `data_mining_instances` - Data extraction jobs
- `data_stream_instances` - Data flow configuration
- `attribute_instances` - Metadata attributes
- `category_relationships` - Tracks relationships between instances
- `instance_execution_history` - Execution history for all instances

See `database/category-instances-schema.sql` for the complete schema.

## API Endpoints

### List Categories

```bash
GET /api/categories
```

Returns all available category types with their configurations.

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "type": "app",
      "table": "apps",
      "defaultConfig": {...},
      "hierarchyRules": {...}
    },
    ...
  ],
  "total": 11
}
```

### Get Default Configuration

```bash
GET /api/categories/:category/config?name=MyApp&description=Description
```

Generate a default configuration for a specific category type.

**Example:**
```bash
curl "http://localhost:3001/api/categories/campaign/config?name=SEO-Campaign&campaign_type=seo"
```

**Response:**
```json
{
  "success": true,
  "category": "campaign",
  "config": {
    "name": "SEO-Campaign",
    "campaign_type": "seo",
    "status": "draft",
    "config": {},
    "progress": 0,
    "description": "Auto-generated campaign instance"
  }
}
```

### Get All Configs

```bash
GET /api/categories/config/all?appName=demo-app
```

Generate default configurations for all category types.

### Create Instance

```bash
POST /api/categories/:category
```

Create a new instance of a specific category.

**Example:**
```bash
curl -X POST http://localhost:3001/api/categories/app \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app",
    "description": "My Application",
    "status": "active"
  }'
```

**Response:**
```json
{
  "success": true,
  "category": "app",
  "instance": {
    "id": "uuid-here",
    "name": "my-app",
    "description": "My Application",
    "status": "active",
    "created_at": "2025-11-14T...",
    ...
  },
  "message": "app instance created successfully"
}
```

### Create Batch Instances

```bash
POST /api/categories/batch
```

Create multiple instances at once.

**Example:**
```bash
curl -X POST http://localhost:3001/api/categories/batch \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [
      {
        "category": "app",
        "data": {"name": "app1", "description": "First app"}
      },
      {
        "category": "campaign",
        "data": {"name": "campaign1", "app_id": "uuid-here"}
      }
    ]
  }'
```

### Create Hierarchy

```bash
POST /api/categories/hierarchy
```

Create a complete hierarchy from a configuration object.

**Example:**
```bash
curl -X POST http://localhost:3001/api/categories/hierarchy \
  -H "Content-Type: application/json" \
  -d '{
    "app": {
      "name": "demo-app",
      "_ref": "main_app"
    },
    "campaign": {
      "name": "demo-campaign",
      "app_id_ref": "app.main_app"
    },
    "workflow": {
      "name": "demo-workflow",
      "campaign_id_ref": "campaign.main_campaign"
    }
  }'
```

### List Instances

```bash
GET /api/categories/:category?status=active&service_type=api
```

List instances of a category with optional filters.

**Example:**
```bash
curl "http://localhost:3001/api/categories/service?status=running"
```

### Get Instance

```bash
GET /api/categories/:category/:id
```

Get details of a specific instance.

### Get Hierarchy

```bash
GET /api/categories/:category/:id/hierarchy
```

Get hierarchical relationships (parents and children) for an instance.

**Response:**
```json
{
  "success": true,
  "hierarchy": {
    "category": "campaign",
    "instance_id": "uuid",
    "ancestors": [
      {
        "parent_category": "app",
        "parent_id": "uuid",
        "relationship_type": "belongs_to"
      }
    ],
    "descendants": [
      {
        "child_category": "workflow",
        "child_id": "uuid",
        "relationship_type": "belongs_to"
      }
    ]
  }
}
```

### Execute Action

```bash
POST /api/categories/:category/:id/execute
```

Execute an action on an instance (start, stop, pause, resume, execute, run).

**Example:**
```bash
curl -X POST http://localhost:3001/api/categories/workflow/uuid/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "execute",
    "params": {}
  }'
```

**Available Actions:**
- `start` - Start a service/process
- `stop` - Stop a service/process
- `pause` - Pause execution
- `resume` - Resume execution
- `execute`/`run` - Execute workflow/crawler/mining job

### Update Instance

```bash
PUT /api/categories/:category/:id
```

Update an existing instance.

**Example:**
```bash
curl -X PUT http://localhost:3001/api/categories/campaign/uuid \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "progress": 50
  }'
```

### Delete Instance

```bash
DELETE /api/categories/:category/:id
```

Delete an instance.

### Call Service API Function

```bash
POST /api/categories/service/:id/api/:functionName
```

Call an exposed API function on a service instance.

**Example:**
```bash
curl -X POST http://localhost:3001/api/categories/service/uuid/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "depth": 2
    }
  }'
```

## Service Instance Configuration

Service instances can expose API functions that can be called via the API:

```json
{
  "name": "my-crawler-service",
  "service_type": "crawler",
  "api_functions": [
    {
      "name": "crawl",
      "method": "POST",
      "path": "/crawl",
      "description": "Start a crawl job",
      "params": {
        "url": "string",
        "depth": "number"
      }
    },
    {
      "name": "status",
      "method": "GET",
      "path": "/status",
      "description": "Get crawl status"
    }
  ]
}
```

## Data Stream and Attribute Bundling

Data streams expose APIs as functions by bundling attributes:

```json
{
  "workflow_instance_id": "uuid",
  "name": "seo-data-stream",
  "source_type": "crawler",
  "destination_type": "database",
  "attribute_ids": ["attr-uuid-1", "attr-uuid-2"],
  "transformation_rules": [
    {
      "type": "map",
      "source_field": "raw_title",
      "target_field": "title",
      "transform": "trim"
    }
  ]
}
```

Attributes define the metadata:

```json
{
  "entity_type": "content",
  "attribute_name": "title",
  "attribute_type": "string",
  "is_required": true,
  "validation_rules": {
    "maxLength": 255,
    "minLength": 1
  }
}
```

## Usage Examples

### Example 1: Create a Complete Application Stack

```javascript
import { CategoryInstanceFactory } from './services/category-instance-factory.js';
import { Pool } from 'pg';

const db = new Pool({ /* db config */ });
const factory = new CategoryInstanceFactory(db);

// Create hierarchy from config
const result = await factory.createHierarchyFromConfig({
  app: {
    name: "my-seo-app",
    description: "SEO optimization platform",
    _ref: "main_app"
  },
  campaign: {
    name: "q4-seo-campaign",
    campaign_type: "seo_optimization",
    app_id_ref: "app.main_app",
    _ref: "main_campaign"
  },
  workflow: {
    name: "content-extraction-workflow",
    workflow_type: "data_extraction",
    campaign_id_ref: "campaign.main_campaign",
    _ref: "main_workflow"
  },
  data_stream: {
    name: "seo-data-stream",
    workflow_instance_id_ref: "workflow.main_workflow",
    source_type: "crawler",
    destination_type: "database"
  }
});
```

### Example 2: Create Service with API Functions

```bash
curl -X POST http://localhost:3001/api/categories/service \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "app-uuid",
    "name": "crawler-service",
    "service_type": "crawler",
    "api_functions": [
      {
        "name": "crawl",
        "method": "POST",
        "path": "/crawl",
        "description": "Start crawling"
      },
      {
        "name": "status",
        "method": "GET",
        "path": "/status"
      }
    ],
    "port": 3002
  }'
```

### Example 3: Execute a Workflow

```bash
# Create workflow
WORKFLOW_ID=$(curl -X POST http://localhost:3001/api/categories/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "campaign-uuid",
    "name": "daily-seo-check",
    "workflow_type": "scheduled",
    "steps": [
      {"id": 1, "type": "crawl", "config": {}},
      {"id": 2, "type": "analyze", "config": {}},
      {"id": 3, "type": "report", "config": {}}
    ]
  }' | jq -r '.instance.id')

# Execute workflow
curl -X POST http://localhost:3001/api/categories/workflow/$WORKFLOW_ID/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "execute",
    "params": {}
  }'

# Check status
curl http://localhost:3001/api/categories/workflow/$WORKFLOW_ID
```

### Example 4: Schedule a Crawler

```bash
# Create crawler
CRAWLER_ID=$(curl -X POST http://localhost:3001/api/categories/crawler \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "app-uuid",
    "name": "product-crawler",
    "target_config": {
      "urls": ["https://example.com/products"],
      "selectors": {
        "title": "h1.product-title",
        "price": ".product-price",
        "description": ".product-description"
      }
    }
  }' | jq -r '.instance.id')

# Create scheduler
curl -X POST http://localhost:3001/api/categories/scheduler \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "app-uuid",
    "name": "daily-product-crawl",
    "schedule_type": "cron",
    "schedule_expression": "0 2 * * *",
    "target_entity_type": "crawler",
    "target_entity_id": "'$CRAWLER_ID'"
  }'
```

## Demo Script

Run the included demo to see the system in action:

```bash
# Run the demo
node demo-category-instances.js
```

This will:
1. Generate configurations for all category types
2. Create database schema
3. Create one instance of each category
4. Establish hierarchical relationships
5. Test instance execution
6. Display summary and API examples

## Integration with Existing Systems

The Category Instance System integrates with:

- **API Auto-Generator Service**: Automatically generates CRUD endpoints
- **Campaign Orchestration Service**: Manages campaign workflows
- **Worker Pool Manager**: Executes scheduled jobs
- **Data Mining Orchestrator**: Runs mining jobs
- **Neural Network Manager**: Manages ML models

## Best Practices

1. **Always specify parent IDs** when creating dependent instances (e.g., campaigns need app_id)
2. **Use references in hierarchy creation** (`_ref` and `*_ref` fields) for complex setups
3. **Validate configurations** before creating instances
4. **Monitor execution history** via `instance_execution_history` table
5. **Use batch creation** for multiple related instances to ensure consistency
6. **Define clear API functions** on service instances for proper exposure
7. **Bundle related attributes** in data streams for coherent data flow

## Troubleshooting

### Common Issues

1. **Missing parent reference**: Ensure required parent IDs are provided
2. **Invalid category type**: Use `/api/categories` to see valid types
3. **Schema not created**: Run the schema SQL file or use the demo script
4. **API function not found**: Check `api_functions` array on service instance

### Debug Commands

```bash
# List all categories
curl http://localhost:3001/api/categories

# Check instance hierarchy
curl http://localhost:3001/api/categories/campaign/uuid/hierarchy

# View execution history
psql -d dom_space_harvester -c "SELECT * FROM instance_execution_history WHERE instance_id = 'uuid' ORDER BY started_at DESC LIMIT 10;"
```

## Future Enhancements

- [ ] UI for visual hierarchy creation
- [ ] Workflow builder integration
- [ ] Real-time status monitoring dashboard
- [ ] Automated testing framework for instances
- [ ] Template marketplace for common configurations
- [ ] Advanced scheduling with dependencies
- [ ] Instance cloning and versioning
- [ ] Performance metrics and analytics

## Related Documentation

- [Comprehensive System Schema](database/comprehensive-system-schema.sql)
- [API Auto-Generator Service](services/api-auto-generator.service.js)
- [Campaign Orchestration](CAMPAIGN_ORCHESTRATION_README.md)
- [Workflow Automation](WORKFLOW_AUTOMATION.md)
