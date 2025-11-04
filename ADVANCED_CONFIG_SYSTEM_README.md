# Advanced Configuration & Automation System

## Overview

This system provides comprehensive configuration, training, and automation capabilities for the DeepSeek-powered LightDom platform. It enables model training on your database and codebase, auto-generates APIs, mines route patterns, and manages campaigns with intelligent defaults.

## Table of Contents

1. [Model Training Configuration](#model-training-configuration)
2. [MCP Auto-API Service](#mcp-auto-api-service)
3. [Route History Mining](#route-history-mining)
4. [Campaign Defaults](#campaign-defaults)
5. [Memory Configuration](#memory-configuration)
6. [High-Success Automation](#high-success-automation)
7. [API Reference](#api-reference)

## Model Training Configuration

### Training on Database and Codebase

The system can train DeepSeek on your specific database schema and codebase patterns:

```typescript
import { ModelTrainingConfigService } from './services/model-training-config';

const trainingConfig = new ModelTrainingConfigService();

// Get training configuration
const config = trainingConfig.getTrainingConfig();
/*
{
  baseModel: 'deepseek-chat',
  trainingData: {
    sources: [
      { type: 'database', weight: 0.4 },
      { type: 'codebase', weight: 0.3 },
      { type: 'api-routes', weight: 0.2 },
      { type: 'workflow-history', weight: 0.1 }
    ]
  },
  patterns: {
    reinforcePatterns: ['mvc-architecture', 'microservices', ...],
    repetitionCount: 100,
    successThreshold: 0.95
  }
}
*/
```

### Data Sources

**Database** (40% weight):
- Tables: workflows, schemas, executions, patterns
- Includes metadata and relationships
- Minimum 100 records per table

**Codebase** (30% weight):
- Directories: src, services, api
- File types: .ts, .js, .tsx, .jsx
- Includes tests

**API Routes** (20% weight):
- Request/response patterns
- Usage statistics
- Schema validation rules

**Workflow History** (10% weight):
- Successful executions
- Failure patterns
- Optimization opportunities

### Project Status Determination

Analyze project health based on usage patterns and coding practices:

```typescript
const status = await trainingConfig.analyzeProjectStatus('project-123');
/*
{
  id: 'project-123',
  usageCount: 150,
  defaultPattern: 'microservices',
  codingPatterns: {
    architecture: 'microservices',
    naming: 'kebab-case',
    structure: 'standard'
  },
  health: 'healthy',  // 'healthy' | 'warning' | 'critical'
  metrics: {
    codeQuality: 0.85,
    testCoverage: 0.75,
    patternConsistency: 0.90
  }
}
*/
```

## MCP Auto-API Service

### Auto-Generate CRUD APIs

Automatically create complete REST APIs from schemas:

```typescript
import { MCPAutoAPIService } from './services/mcp-auto-api';

const mcpAPI = new MCPAutoAPIService();

// Generate CRUD for a schema
const api = mcpAPI.generateCRUDAPI(schema);
// Creates: POST, GET (list), GET (single), PUT, DELETE
```

**Generated Endpoints:**
```
POST   /{entity}           - Create new entity
GET    /{entity}           - List entities (with pagination)
GET    /{entity}/:id       - Get single entity
PUT    /{entity}/:id       - Update entity
DELETE /{entity}/:id       - Delete entity
```

### Bundle Services API

Combine multiple services into a unified API with relationship navigation:

```typescript
// Bundle multiple schemas
const bundle = await mcpAPI.bundleServicesAPI(
  'ecommerce-bundle',
  [productSchema, orderSchema, userSchema],
  {
    includeRelationships: true,
    enableCaching: true,
    addWebhooks: true
  }
);

/*
Generates:
- CRUD for each entity
- Relationship endpoints (e.g., GET /products/:id/orders)
- Webhook registration
- Schema map navigation
- Bundle management endpoints
*/
```

### Real-Time Schema Navigation

Navigate schema relationships in real-time to achieve goals:

```typescript
// POST /api/{bundleId}/navigate
{
  "from": "user-schema",
  "to": "product-schema",
  "goal": "seo-optimization"
}

// Response:
{
  "path": [
    "user-schema",
    { "relationship": "one-to-many", "target": "order-schema" },
    { "relationship": "many-to-many", "target": "product-schema" }
  ],
  "actions": [
    { "action": "start", "schema": "user-schema" },
    { "action": "navigate", "via": "one-to-many", "to": "order-schema" },
    { "action": "navigate", "via": "many-to-many", "to": "product-schema" }
  ]
}
```

## Route History Mining

### Workflow Simulation

Simulate workflows to generate route history and patterns:

```typescript
import { RouteHistoryMiningService } from './services/route-history-mining';

const routeMining = new RouteHistoryMiningService();

// Simulate workflow
const result = await routeMining.simulateWorkflow(workflow, 100);
/*
{
  workflowId: 'seo-campaign',
  executionCount: 100,
  successRate: 0.95,
  avgDuration: 2500,
  routesGenerated: [...],
  patterns: [...],
  recommendations: [
    'High traffic on POST /api/crawl - consider caching',
    'Slow response on POST /api/analyze - optimize query'
  ]
}
*/
```

### Default Rules and Templates

Compile defaults from route patterns:

```typescript
const defaults = routeMining.compileDefaults();
/*
{
  routes: [
    { path: '/api/crawl', method: 'POST', usageCount: 150, recommended: true }
  ],
  patterns: [...],
  rules: [
    {
      id: 'api-design',
      category: 'api',
      rules: [
        {
          condition: 'method === "POST"',
          actions: ['addValidation', 'addRateLimit'],
          priority: 1
        }
      ]
    }
  ],
  templates: [
    {
      id: 'api-template',
      name: 'REST API Template',
      routes: [...],
      middleware: ['cors', 'rateLimit', 'auth']
    }
  ]
}
*/
```

### Pre-Configured Rule Sets

**API Design Rules:**
- Auto-add caching for GET with :id
- Add validation and rate limiting for POST
- Add pagination, filtering, sorting for collections

**SEO Campaign Rules:**
- Add product schema for product pages
- Optimize assets for slow pages (>2.5s)
- Generate Schema.org markup when missing

**Data Mining Rules:**
- Clean data when quality < 0.8
- Detect and link relationships automatically
- Enrich from API sources

**Workflow Automation Rules:**
- Check dependencies before execution
- Add retry policy for high error rates (>10%)
- Optimize task parallelization

## Campaign Defaults

### SEO Campaign Defaults

```typescript
const seoDefaults = trainingConfig.getCampaignDefaults('seo');
/*
{
  type: 'seo',
  objectives: [
    'Improve organic rankings',
    'Increase click-through rates',
    'Enhance Schema.org markup',
    'Optimize Core Web Vitals'
  ],
  metrics: [
    'organic_traffic',
    'keyword_rankings',
    'conversion_rate',
    'page_load_time',
    'schema_validation_score'
  ],
  workflows: [
    'sitemap-discovery',
    'page-crawl',
    'seo-analysis',
    'technical-audit'
  ],
  dataSources: [
    'google-search-console',
    'google-analytics',
    'crawler-data'
  ],
  enrichmentRules: [
    { attribute: 'competitors', source: 'api' },
    { attribute: 'keywords', source: 'database' }
  ]
}
*/
```

### Data Mining Campaign Defaults

```typescript
const miningDefaults = trainingConfig.getCampaignDefaults('data-mining');
/*
{
  type: 'data-mining',
  objectives: [
    'Extract structured data',
    'Build training datasets',
    'Identify patterns',
    'Enrich existing data'
  ],
  metrics: [
    'records_extracted',
    'data_quality_score',
    'pattern_confidence',
    'enrichment_rate'
  ],
  workflows: [
    'source-discovery',
    'data-extraction',
    'cleaning',
    'enrichment'
  ]
}
*/
```

## Memory Configuration

Configure DeepSeek's memory for optimal performance:

```typescript
const memoryConfig = trainingConfig.getMemoryConfig();
/*
{
  shortTerm: {
    capacity: 1000,              // Max items
    retentionMs: 3600000,        // 1 hour
    indexingStrategy: 'lru'      // Least Recently Used
  },
  longTerm: {
    database: 'postgresql',
    vectorStore: true,           // Semantic search enabled
    embeddingModel: 'text-embedding-ada-002',
    searchAlgorithm: 'hybrid'    // Keyword + Semantic
  },
  workingMemory: {
    maxContextSize: 8000,        // Tokens
    compressionEnabled: true,
    summarizationThreshold: 6000 // Start compressing at 6k tokens
  }
}
*/
```

## High-Success Automation

Configuration optimized for high success rates:

```typescript
const highSuccessConfig = trainingConfig.generateHighSuccessConfig();
/*
{
  schemaGeneration: {
    useTemplates: true,
    validateAgainstExisting: true,
    autoLinkRelationships: true,
    confidenceThreshold: 0.85
  },
  linkMapping: {
    autoDetect: true,
    requireExplicitLinks: false,
    inferFromNaming: true,        // Use naming conventions
    validateCircular: true
  },
  fineTuning: {
    useHistoricalData: true,
    reinforceSuccessPatterns: true,
    penalizeFailurePatterns: true,
    adaptiveLearningRate: true
  }
}
*/
```

## Automation Attributes

Required and optional attributes for automations:

```typescript
const attributes = trainingConfig.getAutomationAttributes();
/*
{
  required: [
    'name',
    'type',
    'objective',
    'dataSources',
    'workflows'
  ],
  optional: [
    'schedule',
    'notifications',
    'retryPolicy',
    'monitoring'
  ],
  defaults: {
    schedule: { type: 'manual', enabled: false },
    notifications: { enabled: true, channels: ['email'] },
    retryPolicy: { maxRetries: 3, backoffMs: 1000 },
    monitoring: { enabled: true, metrics: ['duration', 'success_rate'] }
  }
}
*/
```

## API Reference

### Configuration Endpoints

```bash
# Get training configuration
GET /api/config/training

# Get project status
GET /api/config/project-status/:projectId

# List templates
GET /api/config/templates?category=api

# Get template by category
GET /api/config/template/:category

# Get campaign defaults
GET /api/config/campaign-defaults/:type

# Get memory configuration
GET /api/config/memory

# Get automation attributes
GET /api/config/automation-attributes

# Get high-success config
GET /api/config/high-success-config
```

### MCP Auto-API Endpoints

```bash
# Generate CRUD API
POST /api/mcp/generate-crud
{
  "schemaId": "user-schema-123"
}

# Bundle services API
POST /api/mcp/bundle-api
{
  "bundleId": "ecommerce",
  "schemaIds": ["product-schema", "order-schema"],
  "config": {
    "includeRelationships": true,
    "enableCaching": true,
    "addWebhooks": true
  }
}

# List bundles
GET /api/mcp/bundles

# Get bundle details
GET /api/mcp/bundle/:bundleId
```

### Route Mining Endpoints

```bash
# Simulate workflow
POST /api/route-mining/simulate-workflow
{
  "workflow": { ... },
  "simulationCount": 100
}

# Get route history
GET /api/route-mining/history?limit=20

# Get patterns
GET /api/route-mining/patterns

# Get compiled defaults
GET /api/route-mining/defaults

# Get default rules
GET /api/route-mining/rules?category=api

# Track route usage
POST /api/route-mining/track
{
  "path": "/api/users",
  "method": "GET",
  "responseTime": 150,
  "error": false
}
```

## Usage Examples

### Complete SEO Campaign Setup

```typescript
// 1. Get SEO campaign defaults
const seoDefaults = trainingConfig.getCampaignDefaults('seo');

// 2. Generate schemas for SEO data
const pageSchema = await schemaGenerator.generateSchema({
  description: 'Web page with SEO metadata',
  context: { domain: 'seo', purpose: 'page-analysis' }
});

// 3. Create MCP bundle
const seoBundle = await mcpAPI.bundleServicesAPI(
  'seo-campaign',
  [pageSchema],
  { includeRelationships: true }
);

// 4. Simulate campaign workflow
const simulation = await routeMining.simulateWorkflow(seoWorkflow, 50);

// 5. Apply recommendations
for (const rec of simulation.recommendations) {
  console.log('Apply:', rec);
}
```

### Auto-Generate API for Data Model

```typescript
// 1. Train model on codebase
const trainingConfig = new ModelTrainingConfigService();
const config = trainingConfig.getTrainingConfig();

// 2. Generate schemas from description
const userSchema = await schemaGenerator.generateSchema({
  description: 'User with profile and preferences'
});

const productSchema = await schemaGenerator.generateSchema({
  description: 'Product with pricing and inventory'
});

// 3. Auto-generate CRUD APIs
const userAPI = mcpAPI.generateCRUDAPI(userSchema);
const productAPI = mcpAPI.generateCRUDAPI(productSchema);

// 4. Bundle into unified API
const appBundle = await mcpAPI.bundleServicesAPI(
  'my-app',
  [userSchema, productSchema],
  {
    includeRelationships: true,
    enableCaching: true,
    addWebhooks: true
  }
);

// 5. Navigate schema map for goals
// POST /api/my-app/navigate
// { "from": "user", "to": "product", "goal": "purchase-flow" }
```

## Best Practices

1. **Training Data Quality**: Ensure minimum record counts for database training
2. **Pattern Reinforcement**: Set repetitionCount to 100+ for consistent patterns
3. **Success Thresholds**: Use 0.85+ confidence for production
4. **Memory Management**: Enable compression for large context windows
5. **Route Mining**: Simulate workflows 100+ times for reliable patterns
6. **Rule Priority**: Higher priority rules execute first
7. **Bundle Organization**: Group related services in bundles
8. **Schema Navigation**: Use for complex multi-entity operations

## Configuration Files

All configurations support JSON export/import:

```bash
# Export training config
GET /api/config/training > training-config.json

# Export defaults
GET /api/route-mining/defaults > defaults.json

# Export memory config
GET /api/config/memory > memory-config.json
```

## Troubleshooting

**Low success rate in simulations:**
- Increase simulation count
- Review and apply recommendations
- Adjust rule priorities

**High memory usage:**
- Reduce shortTerm.capacity
- Enable compression earlier
- Use LRU indexing strategy

**API generation fails:**
- Validate schema structure
- Check for circular dependencies
- Review relationship definitions

**Pattern detection low confidence:**
- Increase route tracking
- Run more workflow simulations
- Review default rules applicability

## Next Steps

1. Integrate with existing workflow system
2. Add UI for configuration management
3. Implement real-time pattern updates
4. Build recommendation engine
5. Add A/B testing for configurations

## License

MIT
