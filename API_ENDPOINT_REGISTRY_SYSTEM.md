# API Endpoint Registry and Service Composition System

## Overview

A comprehensive system for cataloging API endpoints, composing services from multiple endpoints, and building workflows through configuration-driven wizards. This system enables modular, plug-and-play architecture where endpoints can be discovered, registered, and combined into complex workflows.

## Architecture

### Core Components

1. **API Endpoint Registry** - Centralized catalog of all API endpoints
2. **Service Composition Orchestrator** - Executes composed services and endpoint chains
3. **Workflow Wizard Service** - Configuration-driven workflow creation
4. **Endpoint Discovery** - Automatic scanning and registration of endpoints

### Database Schema

The system uses 6 primary tables:

#### 1. `api_endpoints`
Catalog of all API endpoints with metadata:
- Endpoint identification (path, method, title, description)
- Request/response schemas (JSON Schema)
- Authentication and rate limiting
- Performance metrics
- Modular file location for imports

#### 2. `service_endpoint_bindings`
Links endpoints to workflow services:
- Data flow mappings (input/output)
- Execution order
- Error handling policies
- Conditional execution rules

#### 3. `workflow_endpoint_chains`
Sequential, parallel, or conditional endpoint execution:
- Chain type (sequential/parallel/conditional)
- Data flow between endpoints
- Retry strategies
- Execution statistics

#### 4. `workflow_wizard_configs`
Configuration-driven wizard definitions:
- Wizard steps and UI configuration
- Form schema (JSON Schema)
- Available endpoints/services
- Validation rules
- Output templates

#### 5. `service_module_registry`
Registry of modular service files:
- File paths and exports
- Dependencies and peer modules
- Version compatibility
- Load priority

#### 6. `endpoint_execution_logs`
Execution logs for monitoring:
- Request/response details
- Performance metrics
- Error tracking

## Key Features

### 1. Automatic Endpoint Discovery

Scans codebase for API routes and automatically generates metadata:

```javascript
import APIEndpointDiscovery from './services/api-endpoint-discovery.js';

const discovery = new APIEndpointDiscovery({
  routesDirectory: './api',
  includePatterns: ['*routes.js', '*routes.ts']
});

const endpoints = await discovery.discoverEndpoints();
```

**Discovers:**
- Route paths and HTTP methods
- Request/response schemas
- Query and path parameters
- Authentication requirements
- Service types

### 2. Service Composition

Combine multiple endpoints into a single service:

```javascript
import ServiceCompositionOrchestrator from './services/service-composition-orchestrator.js';

const orchestrator = new ServiceCompositionOrchestrator(registry);

// Execute service with bound endpoints
const result = await orchestrator.executeService('my-service-id', {
  input: 'data'
});
```

**Features:**
- Sequential, parallel, or conditional execution
- Data flow mapping between endpoints
- Error handling with retries and fallbacks
- Transform scripts for data manipulation
- Execution logging and monitoring

### 3. Endpoint Chains

Create chains of endpoints that execute in sequence:

```javascript
// Create chain
await registry.createEndpointChain('workflow-123', {
  name: 'Data Processing Chain',
  chain_type: 'sequential',
  endpoints: [
    {
      endpoint_id: 'fetch-data',
      config: { output_mapping: { data: 'rawData' } }
    },
    {
      endpoint_id: 'process-data',
      config: { input_mapping: { input: 'rawData' } }
    },
    {
      endpoint_id: 'save-results',
      config: { input_mapping: { data: 'processedData' } }
    }
  ]
});

// Execute chain
const result = await orchestrator.executeChain('chain-id', { input: 'data' });
```

### 4. Workflow Wizard

Configuration-driven UI for building workflows:

```javascript
import WorkflowWizardService from './services/workflow-wizard-service.js';

const wizardService = new WorkflowWizardService(db);

// Auto-generate wizard from category
const config = await wizardService.generateWizardFromCategory(
  'data-mining',
  registry
);

// Process wizard submission
const workflow = await wizardService.processWizardSubmission(
  configId,
  formData,
  registry,
  orchestrator
);
```

**Wizard Capabilities:**
- Multi-step forms with validation
- Endpoint selection and configuration
- Data flow visualization
- Pre-configured templates
- Context-sensitive help

## API Endpoints

### Endpoint Registry API

```
GET    /api/endpoint-registry/discover              - Discover endpoints
POST   /api/endpoint-registry/endpoints             - Register endpoint
GET    /api/endpoint-registry/endpoints             - List endpoints
GET    /api/endpoint-registry/endpoints/search      - Search endpoints
GET    /api/endpoint-registry/endpoints/:id         - Get endpoint details
PUT    /api/endpoint-registry/endpoints/:id         - Update endpoint
DELETE /api/endpoint-registry/endpoints/:id         - Delete endpoint
GET    /api/endpoint-registry/stats                 - Get statistics
GET    /api/endpoint-registry/categories            - List categories
```

### Service Composition API

```
POST   /api/endpoint-registry/services/:id/bind-endpoint  - Bind endpoint to service
GET    /api/endpoint-registry/services/:id/bindings       - Get service bindings
POST   /api/endpoint-registry/services/:id/execute        - Execute service
```

### Endpoint Chains API

```
POST   /api/endpoint-registry/chains                       - Create chain
GET    /api/endpoint-registry/workflows/:id/chains         - Get workflow chains
GET    /api/endpoint-registry/chains/:id/execution-plan    - Get execution plan
POST   /api/endpoint-registry/chains/:id/execute           - Execute chain
```

### Workflow Wizard API

```
POST   /api/workflow-wizard/configs                    - Create wizard config
GET    /api/workflow-wizard/configs                    - List wizard configs
GET    /api/workflow-wizard/configs/:id                - Get wizard config
PUT    /api/workflow-wizard/configs/:id                - Update wizard config
DELETE /api/workflow-wizard/configs/:id                - Delete wizard config
POST   /api/workflow-wizard/generate-from-category     - Auto-generate wizard
POST   /api/workflow-wizard/configs/:id/submit         - Submit wizard form
GET    /api/workflow-wizard/templates                  - Get templates
POST   /api/workflow-wizard/validate                   - Validate form data
```

## Usage Examples

### Example 1: Discover and Register Endpoints

```javascript
// 1. Discover endpoints
const response = await fetch('/api/endpoint-registry/discover?register=true');
const { summary, statistics } = await response.json();

console.log(`Discovered: ${summary.discovered}`);
console.log(`Registered: ${summary.registered}`);
```

### Example 2: Create Service Composition

```javascript
// 1. Bind endpoints to service
await fetch('/api/endpoint-registry/services/my-service/bind-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint_id: 'get-user-data',
    binding_order: 0,
    output_mapping: { user: 'userData' }
  })
});

await fetch('/api/endpoint-registry/services/my-service/bind-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint_id: 'enrich-user-data',
    binding_order: 1,
    input_mapping: { user: 'userData' }
  })
});

// 2. Execute service
const result = await fetch('/api/endpoint-registry/services/my-service/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 123 })
});
```

### Example 3: Build Workflow with Wizard

```javascript
// 1. Get wizard configuration
const wizardConfig = await fetch('/api/workflow-wizard/configs/data-pipeline-wizard');
const { config } = await wizardConfig.json();

// 2. Submit wizard form
const workflow = await fetch(`/api/workflow-wizard/configs/${config.config_id}/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Data Pipeline',
    description: 'Process customer data',
    endpoints: [
      { endpoint_id: 'fetch-customers', order: 0 },
      { endpoint_id: 'transform-data', order: 1 },
      { endpoint_id: 'save-to-db', order: 2 }
    ],
    execution_order: 'sequential',
    retry_policy: { maxRetries: 3, backoff: 'exponential' }
  })
});
```

### Example 4: Execute Endpoint Chain

```javascript
// 1. Create chain
const chain = await fetch('/api/endpoint-registry/chains', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_id: 'workflow-123',
    name: 'SEO Analysis Chain',
    chain_type: 'sequential',
    endpoints: [
      {
        endpoint_id: 'crawl-website',
        config: { output_mapping: { html: 'pageHtml' } }
      },
      {
        endpoint_id: 'extract-metadata',
        config: { 
          input_mapping: { html: 'pageHtml' },
          output_mapping: { metadata: 'seoData' }
        }
      },
      {
        endpoint_id: 'analyze-seo',
        config: { input_mapping: { data: 'seoData' } }
      }
    ]
  })
});

const { chain: { chain_id } } = await chain.json();

// 2. Execute chain
const result = await fetch(`/api/endpoint-registry/chains/${chain_id}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});
```

## Modular Architecture

### Plug-and-Play Design

The system supports modular service files that can be easily added or removed:

1. **Service Discovery** - Automatically finds service modules
2. **Dependency Resolution** - Manages module dependencies
3. **Version Compatibility** - Ensures compatible versions
4. **Load Priority** - Controls initialization order
5. **Hot Reload** - Supports dynamic loading/unloading

### Module Structure

```javascript
// services/my-custom-service.js
export default class MyCustomService {
  constructor(config) {
    this.config = config;
  }
  
  async execute(data) {
    // Service logic
    return result;
  }
  
  // Metadata for registry
  static getMetadata() {
    return {
      name: 'My Custom Service',
      version: '1.0.0',
      provides_endpoints: ['custom-endpoint-1'],
      dependencies: ['axios', 'lodash']
    };
  }
}
```

### Integration Points

Services can integrate at multiple levels:

1. **Endpoints** - Expose new API endpoints
2. **Middleware** - Add request/response processing
3. **Transformers** - Data transformation functions
4. **Validators** - Input/output validation
5. **Event Hooks** - React to system events

## Data Flow Patterns

### Sequential Flow
```
Input → Endpoint 1 → Endpoint 2 → Endpoint 3 → Output
```

### Parallel Flow
```
        ┌─ Endpoint 1 ─┐
Input ──┼─ Endpoint 2 ─┼─→ Merge → Output
        └─ Endpoint 3 ─┘
```

### Conditional Flow
```
Input → Endpoint 1 → Condition?
                      ├─ Yes → Endpoint 2 → Output
                      └─ No  → Endpoint 3 → Output
```

## Error Handling

### Retry Policies

```javascript
{
  maxRetries: 3,
  backoff: 'exponential', // or 'linear', 'none'
  initialDelay: 1000
}
```

### Error Strategies

- **Stop** - Halt execution on error
- **Continue** - Skip failed endpoint, continue chain
- **Retry** - Retry with backoff policy
- **Fallback** - Execute alternate endpoint

## Monitoring and Logging

### Execution Logs

All endpoint executions are logged with:
- Request/response details
- Performance metrics
- Error information
- Execution context

### Performance Metrics

- Average response time per endpoint
- Success/failure rates
- Chain execution statistics
- Service composition metrics

## Best Practices

1. **Endpoint Design**
   - Keep endpoints focused and single-purpose
   - Use clear, descriptive names
   - Document request/response schemas
   - Include examples

2. **Service Composition**
   - Map data flows explicitly
   - Handle errors gracefully
   - Use appropriate retry policies
   - Monitor execution performance

3. **Workflow Wizards**
   - Provide clear step descriptions
   - Include contextual help
   - Validate input early
   - Show execution previews

4. **Modular Services**
   - Follow semantic versioning
   - Declare dependencies explicitly
   - Provide comprehensive metadata
   - Test in isolation

## Migration Guide

### From Existing Codebase

1. **Run Discovery**
   ```bash
   curl http://localhost:3001/api/endpoint-registry/discover?register=true
   ```

2. **Review Endpoints**
   ```bash
   curl http://localhost:3001/api/endpoint-registry/endpoints
   ```

3. **Create Services**
   - Group related endpoints
   - Define data flows
   - Configure error handling

4. **Build Wizards**
   - Generate from categories
   - Customize for use cases
   - Test with users

## Database Migration

Run the migration to create required tables:

```bash
psql -d your_database -f migrations/20251115_api_endpoint_registry.sql
```

## Configuration

### Environment Variables

```env
API_BASE_URL=http://localhost:3001
DEFAULT_TIMEOUT=30000
MAX_RETRIES=3
ENABLE_DISCOVERY=true
DISCOVERY_INTERVAL=3600000  # 1 hour
```

## Security Considerations

1. **Authentication** - Track auth requirements per endpoint
2. **Rate Limiting** - Enforce limits at service level
3. **Input Validation** - Validate against schemas
4. **Execution Isolation** - Sandbox transform scripts
5. **Audit Logging** - Log all executions with context

## Future Enhancements

- [ ] Visual workflow builder UI
- [ ] Real-time execution monitoring dashboard
- [ ] AI-powered workflow recommendations
- [ ] Automatic retry optimization
- [ ] Performance profiling and optimization
- [ ] Multi-tenant service isolation
- [ ] GraphQL endpoint support
- [ ] WebSocket endpoint support
- [ ] Workflow versioning and rollback

## Support

For issues or questions:
- Check the API documentation
- Review execution logs
- Test endpoints individually
- Validate wizard configurations

## License

Private use only - See LICENSE_PRIVATE_USE.md
