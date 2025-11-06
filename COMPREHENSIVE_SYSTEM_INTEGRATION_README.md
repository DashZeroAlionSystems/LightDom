# Comprehensive System Integration Guide

## Overview

This guide documents the complete integration of blockchain, database schema, and auto-generated APIs in the LightDom system.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Auto-Generated APIs](#auto-generated-apis)
3. [Blockchain Integration](#blockchain-integration)
4. [Startup System](#startup-system)
5. [API Reference](#api-reference)
6. [Examples](#examples)

## Database Schema

### Core Tables

The system includes 13 core tables with auto-generation metadata:

1. **workflows** - Workflow automation definitions
2. **services** - Microservice configuration
3. **data_streams** - Data pipeline management
4. **attributes** - Dynamic entity attributes
5. **datamining** - Data mining job definitions
6. **seeding** - URL and data seeding
7. **seo** - SEO analysis and optimization
8. **users** - User management
9. **tasks** - Task queue and execution
10. **agents** - AI agent management
11. **schemas** - Schema definitions for dynamic entities
12. **configs** - System configuration
13. **schema_relationships** - Schema relationship mappings

### Metadata-Driven API Generation

Each table includes a `_meta` JSONB column that defines:

```json
{
  "api_enabled": true,
  "crud_enabled": true,
  "search_fields": ["name", "description"],
  "filter_fields": ["status", "type"],
  "use_cases": ["execute", "pause", "resume"]
}
```

### Schema Creation

Initialize the database schema:

```bash
# Via startup script (automatic)
npm run start:enhanced

# Or manually with psql
psql -U postgres -d dom_space_harvester -f database/comprehensive-system-schema.sql
```

## Auto-Generated APIs

### How It Works

1. **Schema Scanning**: The `ApiAutoGeneratorService` scans all tables with `_meta` column
2. **Route Generation**: Creates Express routers with CRUD and use-case endpoints
3. **Automatic Mounting**: Mounts routes to the main Express app at startup

### Generated Endpoints

For each table (e.g., `workflows`):

**CRUD Operations:**
```
POST   /api/workflows              - Create new workflow
GET    /api/workflows              - List workflows (with pagination, search, filters)
GET    /api/workflows/:id          - Get single workflow
PUT    /api/workflows/:id          - Update workflow
DELETE /api/workflows/:id          - Delete workflow
```

**Use-Case Operations:**
```
POST   /api/workflows/:id/execute  - Execute workflow
POST   /api/workflows/:id/pause    - Pause workflow
POST   /api/workflows/:id/resume   - Resume workflow
```

### Listing All Generated APIs

Get a complete list of auto-generated endpoints:

```bash
curl http://localhost:3001/api/auto-generated/routes
```

Response:
```json
{
  "success": true,
  "total_routes": 13,
  "routes": [
    {
      "table": "workflows",
      "basePath": "/api/workflows",
      "crud": true,
      "useCases": ["execute", "pause", "resume"],
      "endpoints": [...]
    }
  ]
}
```

## Blockchain Integration

### Startup Configuration

The blockchain node is automatically started as part of the enhanced startup system:

```javascript
// Automatically starts Hardhat local blockchain on port 8545
// Check status:
curl http://localhost:8545
```

### Blockchain Features

- **Local Hardhat Node**: Development blockchain with instant mining
- **Smart Contracts**: Pre-deployed DOMSpaceToken, ProofOfOptimization, MetaverseMarketplace
- **Integration**: Available to all services via port 8545

## Startup System

### Enhanced Startup Flow

```
1. Check Prerequisites
   ├── Docker
   ├── Docker Compose
   ├── Node.js
   └── Required Files

2. Initialize Database Schema
   ├── Connect to PostgreSQL
   ├── Execute comprehensive schema
   └── Verify table creation

3. Start Blockchain Node
   ├── Check for Hardhat config
   ├── Start Hardhat node
   └── Wait for ready state

4. Start Core Services
   ├── API Server (with auto-generated APIs)
   ├── WebSocket server
   └── Health check endpoints

5. Run Demo (optional)
   ├── Component Dashboard Generator
   └── Display results

6. Start Containers (optional)
   ├── Workload-specific containers
   └── Data mining worker containers

7. Display System Status
   └── Show all running services
```

### Starting the System

```bash
# Development with demo
npm run start:enhanced

# Production without demo
npm run start:enhanced:production

# Custom options
node start-lightdom-enhanced.js --no-demo --workload datamining
```

## API Reference

### Workflows API

**Create Workflow:**
```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SEO Content Pipeline",
    "description": "Automated SEO content generation and optimization",
    "workflow_type": "seo_automation",
    "status": "draft",
    "steps": [
      {"action": "crawl_url", "params": {"url": "example.com"}},
      {"action": "analyze_seo", "params": {}},
      {"action": "generate_content", "params": {}}
    ]
  }'
```

**List Workflows with Filters:**
```bash
curl "http://localhost:3001/api/workflows?status=active&page=1&limit=10&search=SEO"
```

**Execute Workflow:**
```bash
curl -X POST http://localhost:3001/api/workflows/{workflow_id}/execute
```

### Services API

**Register Service:**
```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "seo-analyzer",
    "service_type": "microservice",
    "endpoint_url": "http://localhost:3020",
    "health_check_url": "http://localhost:3020/health",
    "port": 3020,
    "environment": "production"
  }'
```

**Health Check:**
```bash
curl -X POST http://localhost:3001/api/services/{service_id}/health-check
```

**Restart Service:**
```bash
curl -X POST http://localhost:3001/api/services/{service_id}/restart
```

### Data Mining API

**Create Mining Job:**
```bash
curl -X POST http://localhost:3001/api/datamining \
  -H "Content-Type: application/json" \
  -d '{
    "job_name": "E-commerce Product Scraper",
    "target_type": "website",
    "target_config": {
      "urls": ["https://example.com/products"],
      "selectors": {
        "title": ".product-title",
        "price": ".product-price"
      }
    },
    "mining_strategy": "recursive_crawl",
    "priority": 7
  }'
```

**Execute Job:**
```bash
curl -X POST http://localhost:3001/api/datamining/{job_id}/execute-job
```

**Schedule Job:**
```bash
curl -X POST http://localhost:3001/api/datamining/{job_id}/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_config": {"cron": "0 */6 * * *"},
    "next_run_at": "2025-11-07T00:00:00Z"
  }'
```

### SEO API

**Analyze URL:**
```bash
curl -X POST http://localhost:3001/api/seo \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "title": "Example Website",
    "description": "Sample description"
  }'
```

**Run SEO Analysis:**
```bash
curl -X POST http://localhost:3001/api/seo/{seo_id}/analyze
```

### Tasks API

**Create Task:**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "seo_analysis",
    "title": "Analyze competitor websites",
    "description": "SEO analysis of top 10 competitors",
    "priority": 8,
    "input_data": {
      "urls": ["competitor1.com", "competitor2.com"]
    }
  }'
```

**Execute Task:**
```bash
curl -X POST http://localhost:3001/api/tasks/{task_id}/execute
```

**Retry Failed Task:**
```bash
curl -X POST http://localhost:3001/api/tasks/{task_id}/retry
```

### Agents API

**Create AI Agent:**
```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SEO Content Optimizer",
    "agent_type": "seo_optimizer",
    "description": "AI agent for SEO content optimization",
    "configuration": {
      "model": "deepseek-chat",
      "temperature": 0.7
    },
    "capabilities": ["seo_analysis", "content_generation"]
  }'
```

**Activate Agent:**
```bash
curl -X POST http://localhost:3001/api/agents/{agent_id}/activate
```

### Schemas API

**Create Schema:**
```bash
curl -X POST http://localhost:3001/api/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "schema_name": "product_schema",
    "entity_type": "products",
    "fields": {
      "name": {"type": "string", "required": true},
      "price": {"type": "number"},
      "category": {"type": "string"}
    },
    "api_config": {
      "auto_crud": true,
      "use_cases": ["publish", "archive"]
    }
  }'
```

**Generate API from Schema:**
```bash
curl -X POST http://localhost:3001/api/schemas/{schema_id}/generate-api
```

## Examples

### Complete Workflow Example

```javascript
// 1. Create a workflow
const workflowRes = await fetch('http://localhost:3001/api/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'SEO Pipeline',
    workflow_type: 'seo_automation',
    steps: [
      { action: 'seed_urls', params: {} },
      { action: 'crawl', params: {} },
      { action: 'analyze_seo', params: {} },
      { action: 'generate_report', params: {} }
    ]
  })
});

const workflow = await workflowRes.json();

// 2. Create seeding data
await fetch('http://localhost:3001/api/seeding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    seed_type: 'url',
    seed_value: 'https://example.com',
    priority: 10
  })
});

// 3. Create data mining job
const jobRes = await fetch('http://localhost:3001/api/datamining', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    job_name: 'SEO Data Mining',
    target_type: 'url_seed',
    mining_strategy: 'seo_focused'
  })
});

const job = await jobRes.json();

// 4. Execute workflow
await fetch(`http://localhost:3001/api/workflows/${workflow.data.id}/execute`, {
  method: 'POST'
});

// 5. Execute mining job
await fetch(`http://localhost:3001/api/datamining/${job.data.id}/execute-job`, {
  method: 'POST'
});

// 6. Check results
const seoRes = await fetch('http://localhost:3001/api/seo?limit=10&sort=score&order=DESC');
const seoData = await seoRes.json();
console.log('Top SEO Results:', seoData.data);
```

### Custom Use-Case Handler Example

```javascript
// In your application code, register a custom use-case handler
import { ApiAutoGeneratorService } from './services/api-auto-generator.service.js';

const apiGenerator = new ApiAutoGeneratorService(dbPool);

// Register custom use-case for workflows
apiGenerator.registerUseCaseHandler('workflows', 'export', async (db, id, params) => {
  const result = await db.query('SELECT * FROM workflows WHERE id = $1', [id]);
  const workflow = result.rows[0];
  
  const exportData = {
    ...workflow,
    exported_at: new Date().toISOString(),
    format: params.format || 'json'
  };
  
  return {
    success: true,
    export: exportData
  };
});

// Now available at: POST /api/workflows/:id/export
```

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# Blockchain
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_PORT=8545

# API
PORT=3001
NODE_ENV=development

# Features
AUTO_GENERATE_APIS=true
RUN_DEMO=true
ENABLE_CONTAINERS=true
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -c "\l" | grep dom_space_harvester

# Create database if needed
psql -U postgres -c "CREATE DATABASE dom_space_harvester;"
```

### Blockchain Not Starting

```bash
# Verify Hardhat is installed
npx hardhat --version

# Check if port 8545 is available
lsof -i :8545

# Start blockchain manually
npx hardhat node
```

### Auto-Generated APIs Not Working

```bash
# Check logs for errors
npm run start:enhanced 2>&1 | grep "auto-generated"

# Verify tables have _meta column
psql -U postgres -d dom_space_harvester -c "SELECT table_name FROM information_schema.columns WHERE column_name = '_meta';"

# List generated routes
curl http://localhost:3001/api/auto-generated/routes
```

## Performance Optimization

### Database Indexes

All tables include optimized indexes on frequently queried columns:
- Status fields
- Type fields
- Timestamp fields (created_at, updated_at)
- Foreign keys

### API Caching

Consider adding Redis caching for frequently accessed endpoints:

```javascript
// Example with Redis caching
app.get('/api/workflows', cache('5 minutes'), async (req, res) => {
  // Handler code
});
```

### Pagination

All list endpoints support pagination:

```bash
# Default: page=1, limit=50
curl "http://localhost:3001/api/workflows"

# Custom pagination
curl "http://localhost:3001/api/workflows?page=2&limit=100"
```

## Security Considerations

1. **Authentication**: Implement authentication middleware for production
2. **Rate Limiting**: Configure appropriate rate limits per endpoint
3. **Input Validation**: All endpoints include basic validation
4. **SQL Injection Prevention**: Uses parameterized queries throughout
5. **CORS**: Configure CORS policy for production environments

## Monitoring

### Health Checks

```bash
# API Server health
curl http://localhost:3001/api/health

# Database health
curl http://localhost:3001/api/db/health

# Blockchain health
curl http://localhost:8545
```

### Metrics

Access system metrics:

```bash
# Auto-generated API metrics
curl http://localhost:3001/api/auto-generated/routes

# Service status
curl http://localhost:3001/api/services

# Active workflows
curl "http://localhost:3001/api/workflows?status=active"
```

## Next Steps

1. **Deploy to Production**: Use Docker Compose for production deployment
2. **Add Authentication**: Implement JWT or OAuth
3. **Enable Monitoring**: Set up Prometheus/Grafana
4. **Add Testing**: Write integration tests for auto-generated APIs
5. **Custom Use-Cases**: Define domain-specific use-case handlers
6. **Extend Schemas**: Create additional schemas for your specific needs

## Support

For questions or issues:
- Check the logs: `npm run start:enhanced 2>&1 | tee startup.log`
- Review generated routes: `curl http://localhost:3001/api/auto-generated/routes`
- Consult individual component READMEs in the repository
