# DeepSeek System Integration Guide

Complete guide for using the DeepSeek AI-powered workflow automation system with all integrated components.

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [API Reference](#api-reference)
5. [React UI Components](#react-ui-components)
6. [Complete Examples](#complete-examples)
7. [Integration Patterns](#integration-patterns)
8. [Best Practices](#best-practices)

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

```bash
# Required
DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional
GITHUB_TOKEN=your_github_token
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
```

### Basic Usage

```typescript
import { DeepSeekSystemIntegrator } from './src/services/deepseek-system-integrator';

const integrator = new DeepSeekSystemIntegrator({
  githubToken: process.env.GITHUB_TOKEN,
  n8nApiUrl: process.env.N8N_API_URL,
  n8nApiKey: process.env.N8N_API_KEY,
  enableAutoTraining: true,
  enableAutoAPI: true,
  enableRouteHistory: true
});

// Create and deploy a workflow
const result = await integrator.createAndDeployWorkflow(
  'SEO campaign: crawl site, analyze content, generate recommendations'
);
```

## System Architecture

### Component Hierarchy

```
DeepSeekSystemIntegrator (Orchestration Layer)
├── WorkflowOrchestrator (Workflow Execution)
├── SchemaGenerator (Schema Generation)
├── DeepSeekPromptEngine (AI Prompts)
├── GitStateManager (Version Control)
├── N8NIntegrationService (N8N Workflows)
├── GitHubPatternMiningService (Pattern Learning)
├── ServiceInstantiationEngine (Service Simulation)
├── DeepSeekPatternTrainingService (AI Training)
├── ModelTrainingConfigService (Training Config)
├── MCPAutoAPIService (Auto-API Generation)
└── RouteHistoryMiningService (Route Analytics)
```

### Data Flow

```
Natural Language → DeepSeek AI → Workflow/Schema/Component
                                          ↓
                                    Execution Engine
                                          ↓
                        ┌─────────────────┼─────────────────┐
                        ↓                 ↓                 ↓
                   Git State          N8N Workflow    Route History
                                          ↓
                                    Live Monitoring
```

## Core Features

### 1. Workflow Automation

**Generate workflows from natural language:**

```typescript
const workflow = await integrator.createAndDeployWorkflow(
  'Data pipeline: extract from API, transform data, load to database',
  {
    generateSchema: true,
    createN8N: true,
    trackRoutes: true
  }
);
```

**Features:**
- Natural language to workflow conversion
- Dependency resolution
- Parallel task execution
- Error handling with retry
- Real-time monitoring
- State persistence

### 2. Schema Generation

**Auto-generate schemas with relationships:**

```typescript
const api = await integrator.generateCompleteAPI(
  'E-commerce with User, Product, Order, Payment',
  'shop-api'
);

// Returns:
// - schemas: Array of JSON schemas
// - schemaMap: Relationships between entities
// - api: CRUD endpoints
// - bundle: Unified API
```

**Features:**
- Natural language to JSON Schema
- Relationship detection
- Validation rules
- GraphQL/Database schema support
- Schema map generation

### 3. GitHub Pattern Mining

**Learn from existing projects:**

```typescript
const patterns = await integrator.learnFromGitHub(
  [
    { owner: 'facebook', repo: 'react' },
    { owner: 'vercel', repo: 'next.js' }
  ],
  'modern-react-app'
);

// Returns:
// - patterns: Detected architecture patterns
// - template: Generated project template
// - training: DeepSeek training results
// - project: Generated project structure
```

**Features:**
- Folder structure analysis
- Architecture pattern detection (MVC, microservices, monorepo)
- Naming convention detection
- Template generation
- DeepSeek training

### 4. Service Instantiation

**Simulate services in real-time:**

```typescript
const result = await integrator.simulateService(
  {
    name: 'API Server',
    type: 'rest-api',
    dataStreams: [{
      source: 'client',
      destination: 'database',
      enrichment: [
        { attribute: 'metadata', source: 'api' }
      ]
    }]
  },
  60000 // 60 seconds
);

// Returns:
// - instance: Service instance details
// - data: Recorded data messages
```

**Features:**
- Real-time process simulation
- Configurable data rates (1-100+ msg/sec)
- Multi-source data enrichment
- Data stream linking
- Service bundling

### 5. SEO Campaign Automation

**Complete SEO workflow:**

```typescript
const seo = await integrator.runSEOCampaign(
  'https://example.com',
  ['react', 'javascript', 'web development']
);

// Returns:
// - workflow: SEO workflow definition
// - schemas: SEO data structures
// - execution: Campaign execution status
// - routes: Route usage patterns
// - recommendations: SEO recommendations
```

**Features:**
- Automated site crawling
- SEO analysis
- Schema.org markup
- Core Web Vitals monitoring
- Recommendation generation

### 6. MCP Auto-API

**Auto-generate CRUD APIs:**

```typescript
const crud = await mcpAPI.generateCRUDAPI(schema);

// Generates:
// POST /entity - Create
// GET /entity - List all
// GET /entity/:id - Get one
// PUT /entity/:id - Update
// DELETE /entity/:id - Delete
```

**Bundle multiple services:**

```typescript
const bundle = await mcpAPI.bundleServicesAPI(
  'ecommerce',
  [userSchema, productSchema, orderSchema],
  {
    includeRelationships: true,
    addWebhooks: true
  }
);

// Creates unified API with:
// - All CRUD endpoints
// - Relationship endpoints
// - Webhook management
// - Schema navigation
```

### 7. Model Training

**Train DeepSeek on your data:**

```typescript
const config = trainingConfig.getTrainingConfig();

// Training sources (weighted):
// - Database tables (40%)
// - Codebase (30%)
// - API routes (20%)
// - Workflow history (10%)
```

**Memory configuration:**

```typescript
const memory = trainingConfig.getMemoryConfig();

// Returns:
// - shortTerm: 1000 items, 1hr retention
// - longTerm: PostgreSQL + vector store
// - workingMemory: 8k context
```

## API Reference

### DeepSeek Workflows API

**Base URL:** `/api/deepseek`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/config` | GET/PUT | Configuration management |
| `/templates` | GET | List prompt templates |
| `/schema/generate` | POST | Generate schema from NL |
| `/schema/map/generate` | POST | Generate schema map |
| `/workflow/generate` | POST | Generate workflow from NL |
| `/workflow/:id/execute` | POST | Execute workflow |
| `/workflow/:id` | GET | Get workflow details |
| `/workflows` | GET | List all workflows |
| `/execution/:id` | GET | Get execution status |
| `/executions` | GET | List all executions |
| `/state/history/:type/:id` | GET | Get state history |
| `/state/rollback` | POST | Rollback to commit |
| `/state/tag` | POST | Create snapshot tag |
| `/health` | GET | System health |

### Pattern Mining API

**Base URL:** `/api/pattern-mining`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/repository/mine` | POST | Mine GitHub repo |
| `/template/generate` | POST | Generate template |
| `/templates` | GET | List templates |
| `/instantiate` | POST | Instantiate service |
| `/simulate/:id` | POST | Start simulation |
| `/simulate/:id/stop` | POST | Stop simulation |
| `/bundle` | POST | Bundle services |
| `/instances` | GET | List instances |
| `/train-pattern` | POST | Train DeepSeek |
| `/generate-project` | POST | Generate project |

### Advanced Config API

**Base URL:** `/api/config` and `/api/mcp`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/config/training` | GET | Training configuration |
| `/config/project-status/:id` | GET | Project health metrics |
| `/config/templates` | GET | Default templates |
| `/config/campaign-defaults/:type` | GET | Campaign defaults |
| `/config/memory` | GET | Memory configuration |
| `/mcp/generate-crud` | POST | Generate CRUD API |
| `/mcp/bundle-api` | POST | Bundle services |
| `/mcp/bundles` | GET | List bundles |
| `/route-mining/simulate-workflow` | POST | Simulate workflow |
| `/route-mining/history` | GET | Route history |
| `/route-mining/patterns` | GET | Extracted patterns |
| `/route-mining/defaults` | GET | Compiled defaults |

## React UI Components

### DeepSeekWorkflowDashboard

Complete dashboard for managing workflows, schemas, and executions.

```tsx
import { DeepSeekWorkflowDashboard } from './components/DeepSeekWorkflowDashboard';

function App() {
  return <DeepSeekWorkflowDashboard />;
}
```

**Features:**
- Workflow management (create, execute, view)
- Schema visualization
- Execution monitoring
- Timeline view
- System health status
- Real-time statistics

## Complete Examples

See `deepseek-complete-examples.js` for 10 comprehensive examples:

1. **E-commerce Project Generation** - Learn from repos, generate project
2. **Auto-Generate API** - Complete CRUD API with schemas
3. **SEO Campaign** - Automated SEO workflow
4. **Service Simulation** - Real-time service data
5. **End-to-End Workflow** - Complete workflow with N8N
6. **Multi-Repo Learning** - Learn from multiple repos
7. **Data Mining Pipeline** - Automated data pipeline
8. **System Health** - Monitor system status
9. **Comprehensive Workflow** - API + Workflow + SEO
10. **Complete Lifecycle** - Full project lifecycle

**Run all examples:**

```bash
node deepseek-complete-examples.js
```

## Integration Patterns

### Pattern 1: API-First Development

```typescript
// 1. Generate API from description
const api = await integrator.generateCompleteAPI(
  'Blog with User, Post, Comment',
  'blog-api'
);

// 2. Create workflows for the API
const workflows = await integrator.createAndDeployWorkflow(
  'Content pipeline: create post, moderate, publish, notify'
);

// 3. Monitor and optimize
const seo = await integrator.runSEOCampaign(
  'https://blog.example.com',
  ['blogging']
);
```

### Pattern 2: Learning-Driven Development

```typescript
// 1. Learn from successful projects
const patterns = await integrator.learnFromGitHub(
  [{ owner: 'vercel', repo: 'next.js' }],
  'nextjs-app'
);

// 2. Generate new project using learned patterns
// Project automatically includes best practices

// 3. Customize and extend
const customWorkflow = await integrator.createAndDeployWorkflow(
  'Add payment processing to project'
);
```

### Pattern 3: Continuous Optimization

```typescript
// 1. Simulate service to collect data
const simulation = await integrator.simulateService(config, 60000);

// 2. Analyze routes and patterns
const routes = await routeMining.extractPatterns();

// 3. Generate optimizations
const optimizations = routes.recommendations;

// 4. Apply and test
const workflow = await integrator.createAndDeployWorkflow(
  `Optimize based on: ${optimizations.join(', ')}`
);
```

## Best Practices

### 1. Configuration Management

```typescript
// Use environment variables
const integrator = new DeepSeekSystemIntegrator({
  githubToken: process.env.GITHUB_TOKEN,
  enableAutoTraining: process.env.NODE_ENV === 'production'
});
```

### 2. Error Handling

```typescript
try {
  const result = await integrator.createAndDeployWorkflow(description);
} catch (error) {
  console.error('Workflow failed:', error);
  // Rollback if needed
  await stateManager.rollbackToCommit(lastGoodCommit);
}
```

### 3. Monitoring

```typescript
// Check system health regularly
const health = integrator.getSystemHealth();
if (!health.services.orchestrator) {
  console.warn('Orchestrator offline');
}
```

### 4. State Management

```typescript
// Save state frequently
await stateManager.saveWorkflowState(workflowId, data);

// Create snapshots at milestones
await stateManager.createTag(workflowId, 'v1.0-stable');
```

### 5. Performance

```typescript
// Use simulation for testing
const testResult = await integrator.simulateService(config, 10000);

// Validate before production
if (testResult.data.length > 0) {
  // Deploy to production
}
```

## Troubleshooting

### Common Issues

1. **GitHub rate limiting**
   - Use authentication token
   - Implement caching
   - Batch requests

2. **DeepSeek API errors**
   - Check API key validity
   - Monitor rate limits
   - Implement retry logic

3. **Workflow timeouts**
   - Increase timeout values
   - Split into smaller tasks
   - Enable parallel execution

4. **Memory issues**
   - Configure memory limits
   - Enable compression
   - Use streaming for large datasets

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Documentation: See individual README files
- Examples: `deepseek-complete-examples.js`

## License

MIT
