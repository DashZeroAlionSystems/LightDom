# API Endpoint Registry Quick Start Guide

## 🚀 Quick Start

### 1. Run Database Migration

```bash
psql -d dom_space_harvester -f migrations/20251115_api_endpoint_registry.sql
```

### 2. Start API Server

The new routes are automatically loaded when you start the API server:

```bash
npm run api
# or
npm run start:dev
```

### 3. Discover and Register Endpoints

```bash
# Using curl
curl http://localhost:3001/api/endpoint-registry/discover?register=true

# Or run the demo
node demo-endpoint-registry-system.js
```

## 📋 Common Tasks

### List All Registered Endpoints

```bash
curl http://localhost:3001/api/endpoint-registry/endpoints
```

### Search Endpoints

```bash
curl http://localhost:3001/api/endpoint-registry/endpoints/search?q=workflow
```

### Filter by Category

```bash
curl "http://localhost:3001/api/endpoint-registry/endpoints?category=workflow&is_active=true"
```

### Get Registry Statistics

```bash
curl http://localhost:3001/api/endpoint-registry/stats
```

### List Categories

```bash
curl http://localhost:3001/api/endpoint-registry/categories
```

## 🔧 Create Service Composition

### 1. Bind Endpoints to Service

```bash
curl -X POST http://localhost:3001/api/endpoint-registry/services/my-service/bind-endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "get_workflows_workflow-routes",
    "binding_order": 0,
    "output_mapping": {
      "workflows": "availableWorkflows"
    }
  }'
```

### 2. Execute Service

```bash
curl -X POST http://localhost:3001/api/endpoint-registry/services/my-service/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": "data"
  }'
```

## ⛓️ Create Endpoint Chain

### 1. Create Chain

```bash
curl -X POST http://localhost:3001/api/endpoint-registry/chains \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "workflow-123",
    "name": "My Data Pipeline",
    "chain_type": "sequential",
    "endpoints": [
      {
        "endpoint_id": "endpoint-1",
        "config": {
          "output_mapping": { "result": "step1Result" }
        }
      },
      {
        "endpoint_id": "endpoint-2",
        "config": {
          "input_mapping": { "input": "step1Result" }
        }
      }
    ]
  }'
```

### 2. Execute Chain

```bash
curl -X POST http://localhost:3001/api/endpoint-registry/chains/CHAIN_ID/execute \
  -H "Content-Type: application/json" \
  -d '{
    "initialData": "value"
  }'
```

## 🧙 Workflow Wizard

### List Available Wizards

```bash
curl http://localhost:3001/api/workflow-wizard/configs
```

### Get Wizard Templates

```bash
curl http://localhost:3001/api/workflow-wizard/templates
```

### Auto-Generate Wizard from Category

```bash
curl -X POST http://localhost:3001/api/workflow-wizard/generate-from-category \
  -H "Content-Type: application/json" \
  -d '{
    "category": "workflow"
  }'
```

### Submit Wizard Form

```bash
curl -X POST http://localhost:3001/api/workflow-wizard/configs/WIZARD_ID/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workflow",
    "description": "Process data workflow",
    "endpoints": [
      { "endpoint_id": "endpoint-1", "order": 0 },
      { "endpoint_id": "endpoint-2", "order": 1 }
    ],
    "execution_order": "sequential"
  }'
```

## 🔍 Programmatic Usage

### JavaScript/Node.js

```javascript
import APIEndpointDiscovery from './services/api-endpoint-discovery.js';
import APIEndpointRegistry from './services/api-endpoint-registry.js';
import ServiceCompositionOrchestrator from './services/service-composition-orchestrator.js';

// Initialize
const registry = new APIEndpointRegistry(db);
const orchestrator = new ServiceCompositionOrchestrator(registry);

// Discover endpoints
const discovery = new APIEndpointDiscovery();
const endpoints = await discovery.discoverEndpoints();

// Register endpoints
await registry.bulkRegisterEndpoints(endpoints);

// Create and execute service
const result = await orchestrator.executeService('service-id', {
  input: 'data'
});
```

### TypeScript

```typescript
import type { 
  APIEndpoint, 
  ServiceBinding, 
  EndpointChain 
} from './types/endpoint-registry';

const endpoint: APIEndpoint = {
  endpoint_id: 'my-endpoint',
  title: 'My Endpoint',
  path: '/api/my-resource',
  method: 'GET',
  // ... other fields
};
```

## 📊 Monitoring

### View Execution Logs

Query the `endpoint_execution_logs` table:

```sql
SELECT 
  execution_id,
  endpoint_id,
  request_method,
  request_path,
  response_status,
  response_time_ms,
  status,
  started_at
FROM endpoint_execution_logs
ORDER BY started_at DESC
LIMIT 100;
```

### Chain Statistics

```sql
SELECT 
  chain_id,
  name,
  total_executions,
  successful_executions,
  failed_executions,
  avg_execution_time_ms,
  last_executed_at
FROM workflow_endpoint_chains
ORDER BY total_executions DESC;
```

## 🛠️ Development

### Add New Endpoint Manually

```javascript
await registry.registerEndpoint({
  endpoint_id: 'custom-endpoint',
  title: 'Custom Endpoint',
  path: '/api/custom',
  method: 'POST',
  description: 'My custom endpoint',
  category: 'custom',
  service_type: 'api',
  request_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  response_schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'object' }
    }
  }
});
```

### Update Endpoint

```javascript
await registry.updateEndpoint('endpoint-id', {
  description: 'Updated description',
  is_active: true,
  rate_limit: 100
});
```

## 🔐 Security

### Authentication

Track auth requirements per endpoint:

```javascript
await registry.registerEndpoint({
  // ... other fields
  requires_auth: true,
  middleware: ['authenticate', 'authorize']
});
```

### Rate Limiting

Set rate limits per endpoint:

```javascript
await registry.updateEndpoint('endpoint-id', {
  rate_limit: 100 // requests per minute
});
```

## 📚 Data Flow Patterns

### Sequential

```javascript
{
  chain_type: 'sequential',
  endpoints: [
    { endpoint_id: 'step-1' },
    { endpoint_id: 'step-2' },
    { endpoint_id: 'step-3' }
  ]
}
```

### Parallel

```javascript
{
  chain_type: 'parallel',
  endpoints: [
    { endpoint_id: 'task-1' },
    { endpoint_id: 'task-2' },
    { endpoint_id: 'task-3' }
  ]
}
```

### Conditional

```javascript
{
  chain_type: 'conditional',
  endpoints: [
    {
      endpoint_id: 'check-condition',
      config: {
        output_mapping: { shouldProceed: 'condition' }
      }
    },
    {
      endpoint_id: 'execute-if-true',
      config: {
        condition: {
          field: 'condition',
          operator: 'equals',
          value: true
        }
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### Endpoints Not Discovered

1. Check routes directory path
2. Verify file naming patterns
3. Review discovery logs

```javascript
const discovery = new APIEndpointDiscovery({
  routesDirectory: './api',
  includePatterns: ['*routes.js', '*routes.ts']
});
```

### Service Execution Fails

1. Check endpoint bindings order
2. Verify data flow mappings
3. Review execution logs table

### Chain Not Executing

1. Verify chain is active
2. Check endpoint availability
3. Review timeout settings

## 🔄 Integration Examples

### With Express Middleware

```javascript
app.use('/api/endpoint-registry', 
  authenticate,
  endpointRegistryRoutes
);
```

### With WebSocket

```javascript
orchestrator.on('execution:start', ({ executionId }) => {
  io.emit('workflow:start', { executionId });
});

orchestrator.on('execution:complete', ({ executionId, results }) => {
  io.emit('workflow:complete', { executionId, results });
});
```

## 📖 Full Documentation

See [API_ENDPOINT_REGISTRY_SYSTEM.md](./API_ENDPOINT_REGISTRY_SYSTEM.md) for complete documentation.

## 🆘 Support

- Check execution logs in database
- Review API response errors
- Run demo script for validation
- Refer to full documentation

## ✅ Checklist

After implementation, verify:

- [ ] Database migration applied
- [ ] API server starts successfully
- [ ] Discovery endpoint works
- [ ] Endpoints registered in database
- [ ] Service composition functional
- [ ] Endpoint chains execute
- [ ] Wizard generation works
- [ ] Execution logs populated
