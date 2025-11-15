# Schema Orchestration System

Complete schema-driven workflow orchestration with MCP server integration for declarative, configuration-based development.

## Overview

The Schema Orchestration System enables you to define complex workflows, campaigns, and data pipelines using JSON schemas instead of writing code. This reduces development time, enables rapid iteration through simulation, and provides extensibility through MCP (Model Context Protocol) servers.

## Key Concepts

### 1. Workflow Templates

Reusable JSON schemas that define workflow structure:

```typescript
{
  "name": "SEO Analysis Pipeline",
  "category": "seo",
  "schema": {
    "steps": [
      {
        "name": "crawl_site",
        "service": "web_crawler",
        "config": { "depth": 3 }
      },
      {
        "name": "analyze_content",
        "service": "seo_analyzer",
        "config": { "checkKeywords": true }
      },
      {
        "name": "generate_report",
        "service": "report_generator",
        "config": { "format": "pdf" }
      }
    ]
  }
}
```

### 2. Schema Links

Define relationships between schemas:

```typescript
// Link schemas to show data flow
await schemaOrchestration.linkSchemas(
  crawlerSchemaId,
  analyzerSchemaId,
  'outputs_to',
  { data_format: 'json' }
);
```

**Link Types:**
- `outputs_to` - Data flows from source to target
- `depends_on` - Target depends on source completion
- `extends` - Target extends source functionality
- `includes` - Target includes source as a component

### 3. Schema Hierarchies

Organize schemas by use case:

```typescript
await schemaOrchestration.createSchemaHierarchy({
  name: 'SEO Services',
  root_schema_id: rootSchemaId,
  level: 0,
  use_case: 'seo_optimization',
  config: { priority: 'high' }
});
```

### 4. MCP Server Integration

Extend functionality without code changes:

```typescript
// Register an MCP server
const server = await mcpServer.registerMCPServer({
  name: 'GitHub API Server',
  endpoint_url: 'http://localhost:3000/mcp',
  auth_type: 'api_key',
  auth_config: { api_key: process.env.GITHUB_API_KEY }
});

// Discover available tools
const capabilities = await mcpServer.discoverCapabilities(server.server_id);

// Execute a tool
const result = await mcpServer.executeMCPTool(
  server.server_id,
  'list_repositories',
  { org: 'myorg' }
);
```

### 5. Workflow Simulation

Test before executing:

```typescript
const simulation = await schemaOrchestration.simulateWorkflow(
  workflowId,
  { url: 'https://example.com' }
);

console.log(simulation.estimated_duration_ms);  // 5000
console.log(simulation.resource_requirements);  // { cpu: 30, memory: 300, network: 150 }
console.log(simulation.simulated_output);  // Predicted output structure
```

## Setup

### 1. Install Dependencies

```bash
npm install axios  # For MCP server communication
```

### 2. Run Migration

```bash
psql -U postgres -d lightdom -f database/migrations/203-schema-orchestration-system.sql
```

### 3. Import Services

```typescript
import schemaOrchestrationService from './services/schema-orchestration.service';
import mcpServerService from './services/mcp-server-integration.service';
```

### 4. Mount Routes

```typescript
import schemaOrchestrationRoutes from './api/routes/schema-orchestration.routes';

app.use('/api/schema', schemaOrchestrationRoutes);
```

## Usage Examples

### Create and Use Templates

```typescript
// 1. Create template
const template = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'Content Pipeline',
  category: 'content',
  schema: {
    steps: [
      { name: 'research', service: 'researcher', config: {} },
      { name: 'write', service: 'ai_writer', config: {} },
      { name: 'optimize', service: 'seo_optimizer', config: {} }
    ]
  }
});

// 2. Generate workflow from template
const workflow = await schemaOrchestrationService.generateWorkflowFromTemplate(
  template.template_id,
  {
    name: 'Blog Post Pipeline',
    overrides: { write: { tone: 'casual' } }
  }
);

// 3. Simulate workflow
const simulation = await schemaOrchestrationService.simulateWorkflow(
  workflow.workflow_id,
  { topic: 'AI trends' }
);

// 4. Execute if simulation looks good
// (use existing workflow execution APIs)
```

### Build Schema Maps

```typescript
// 1. Create schemas (templates)
const crawlerTemplate = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'Web Crawler',
  category: 'data_collection',
  schema: { /* ... */ }
});

const analyzerTemplate = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'SEO Analyzer',
  category: 'analysis',
  schema: { /* ... */ }
});

// 2. Link schemas
await schemaOrchestrationService.linkSchemas(
  crawlerTemplate.template_id,
  analyzerTemplate.template_id,
  'outputs_to',
  { data_format: 'json', required_fields: ['url', 'content'] }
);

// 3. Create hierarchy
await schemaOrchestrationService.createSchemaHierarchy({
  name: 'SEO Pipeline',
  root_schema_id: crawlerTemplate.template_id,
  level: 0,
  use_case: 'seo_optimization'
});

// 4. Get complete schema map
const map = await schemaOrchestrationService.getSchemaMap(
  crawlerTemplate.template_id,
  3  // max depth
);

// Returns:
// {
//   schema_id: 'crawler-id',
//   depth: 0,
//   links: [
//     {
//       link_type: 'outputs_to',
//       link_config: { data_format: 'json' },
//       schema: {
//         schema_id: 'analyzer-id',
//         depth: 1,
//         links: [...]
//       }
//     }
//   ]
// }
```

### MCP Server Integration

```typescript
// 1. Register server
const server = await mcpServerService.registerMCPServer({
  name: 'Custom API Server',
  endpoint_url: 'http://api.example.com/mcp',
  auth_type: 'api_key',
  auth_config: { api_key: 'xxx' }
});

// 2. Discover capabilities
const capabilities = await mcpServerService.discoverCapabilities(server.server_id);
console.log(capabilities);  // [ { name: 'fetch_data', type: 'tool', ... }, ... ]

// 3. Use in workflow template
const template = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'API Data Pipeline',
  schema: {
    steps: [
      {
        name: 'fetch',
        service: 'mcp',
        config: {
          server_id: server.server_id,
          tool_name: 'fetch_data',
          input: { resource: 'users' }
        }
      },
      {
        name: 'process',
        service: 'processor',
        config: {}
      }
    ]
  }
});

// 4. Health monitoring
const health = await mcpServerService.checkServerHealth(server.server_id);
console.log(health);  // { status: 'healthy', response_time_ms: 45 }
```

### Generate Campaigns from Templates

```typescript
// Create campaign template
const campaignTemplate = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'SEO Campaign Template',
  category: 'campaign',
  schema: {
    workflows: [
      {
        name: 'Initial Audit',
        template_id: auditTemplateId,
        order: 0,
        config: { depth: 'comprehensive' }
      },
      {
        name: 'Optimization',
        template_id: optimizationTemplateId,
        order: 1,
        config: { aggressive: false }
      },
      {
        name: 'Monitoring',
        template_id: monitoringTemplateId,
        order: 2,
        config: { frequency: 'daily' }
      }
    ],
    schedule_config: {
      frequency: 'weekly',
      day: 'monday',
      time: '02:00'
    }
  }
});

// Generate complete campaign
const campaign = await schemaOrchestrationService.generateCampaignFromTemplate(
  campaignTemplate.template_id,
  {
    name: 'Q1 SEO Campaign',
    schedule_config: { frequency: 'daily' }
  }
);
// Creates campaign + all workflows + all steps automatically
```

## API Reference

### Templates

#### `POST /api/schema/templates`
Create workflow template
```json
{
  "name": "My Template",
  "category": "seo",
  "schema": { "steps": [...] }
}
```

#### `GET /api/schema/templates/:id`
Get template by ID

#### `GET /api/schema/templates?category=seo&active=true`
List templates with filters

#### `PATCH /api/schema/templates/:id`
Update template

#### `POST /api/schema/templates/:id/generate-workflow`
Generate workflow from template
```json
{
  "name": "My Workflow",
  "overrides": { "step1": { "config": {} } }
}
```

#### `POST /api/schema/templates/:id/generate-campaign`
Generate campaign from template
```json
{
  "name": "My Campaign",
  "schedule_config": { "frequency": "daily" }
}
```

### Schema Links

#### `POST /api/schema/links`
Create schema link
```json
{
  "source_schema_id": "uuid",
  "target_schema_id": "uuid",
  "link_type": "outputs_to",
  "link_config": { "data_format": "json" }
}
```

#### `GET /api/schema/links/:schema_id?link_type=outputs_to`
Get linked schemas

#### `GET /api/schema/maps/:schema_id?max_depth=3`
Get complete schema map

### Hierarchies

#### `POST /api/schema/hierarchies`
Create schema hierarchy
```json
{
  "name": "SEO Services",
  "root_schema_id": "uuid",
  "level": 0,
  "use_case": "seo_optimization"
}
```

#### `GET /api/schema/hierarchies/:id`
Get hierarchy by ID

#### `GET /api/schema/hierarchies/use-case/:use_case`
Get hierarchies by use case

### Simulations

#### `POST /api/schema/workflows/:id/simulate`
Simulate workflow execution
```json
{
  "input_field": "value"
}
```

#### `GET /api/schema/workflows/:id/simulations`
Get simulation history

### MCP Servers

#### `POST /api/schema/mcp-servers`
Register MCP server
```json
{
  "name": "GitHub API",
  "endpoint_url": "http://localhost:3000/mcp",
  "auth_type": "api_key",
  "auth_config": { "api_key": "xxx" }
}
```

#### `GET /api/schema/mcp-servers/:id`
Get server by ID

#### `GET /api/schema/mcp-servers?status=active`
List servers

#### `PATCH /api/schema/mcp-servers/:id`
Update server

#### `DELETE /api/schema/mcp-servers/:id`
Delete server

#### `POST /api/schema/mcp-servers/:id/discover`
Discover capabilities

#### `GET /api/schema/mcp-servers/:id/capabilities?type=tool`
Get server capabilities

#### `POST /api/schema/mcp-servers/:id/execute/:tool_name`
Execute MCP tool
```json
{
  "param1": "value1"
}
```

#### `POST /api/schema/mcp-servers/:id/health`
Check server health

#### `GET /api/schema/mcp-servers/health/all`
Check all servers health

## Benefits

### 1. Less Code, More Configuration

**Old Way:**
```typescript
// 50+ lines of code per workflow
const workflow = await service.createWorkflow({...});
await service.addStep(workflow.id, {...});
await service.addStep(workflow.id, {...});
// ...
```

**New Way:**
```json
// One-time template definition
{
  "name": "Template",
  "schema": { "steps": [...] }
}

// Infinite workflows from template
POST /api/schema/templates/{id}/generate-workflow
```

### 2. Simulation-First Development

Test configurations before deployment:
- Validate structure
- Estimate resources
- Predict outputs
- Iterate quickly

### 3. Structural Clarity

- Schema links show relationships
- Hierarchies organize by use case
- Visual workflow structure
- Clear dependencies

### 4. Extensibility

- Add APIs through MCP servers
- No code changes needed
- Dynamic capability discovery
- Plugin architecture

### 5. Rapid Iteration

- Modify schemas, not code
- Simulate changes instantly
- Deploy with confidence
- Reuse proven patterns

## Best Practices

1. **Start with Templates** - Define reusable templates for common workflows
2. **Simulate First** - Always simulate before executing
3. **Link Schemas** - Create schema maps for complex relationships
4. **Use Hierarchies** - Organize by use case for clarity
5. **Monitor MCP Servers** - Regular health checks for reliability
6. **Version Templates** - Track template changes over time
7. **Document Schemas** - Add descriptions to all templates

## Troubleshooting

### Template Not Generating Workflows

Check that schema has valid structure:
```json
{
  "steps": [
    { "name": "step1", "service": "service_name", "config": {} }
  ]
}
```

### MCP Server Unreachable

1. Check server status: `POST /api/schema/mcp-servers/:id/health`
2. Verify endpoint URL is correct
3. Check authentication configuration
4. Ensure server is running

### Simulation Fails

1. Verify workflow exists
2. Check input data format
3. Review workflow steps configuration
4. Check service availability

## Example: Complete SEO Pipeline

```typescript
// 1. Create templates
const crawlerTemplate = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'Site Crawler',
  category: 'seo',
  schema: {
    steps: [
      { name: 'crawl', service: 'web_crawler', config: { depth: 3 } }
    ]
  }
});

const analyzerTemplate = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'SEO Analyzer',
  category: 'seo',
  schema: {
    steps: [
      { name: 'analyze', service: 'seo_analyzer', config: {} }
    ]
  }
});

// 2. Link templates
await schemaOrchestrationService.linkSchemas(
  crawlerTemplate.template_id,
  analyzerTemplate.template_id,
  'outputs_to'
);

// 3. Create campaign template
const campaignTemplate = await schemaOrchestrationService.createWorkflowTemplate({
  name: 'SEO Campaign',
  category: 'campaign',
  schema: {
    workflows: [
      { name: 'Crawl', template_id: crawlerTemplate.template_id, order: 0 },
      { name: 'Analyze', template_id: analyzerTemplate.template_id, order: 1 }
    ]
  }
});

// 4. Generate campaign
const campaign = await schemaOrchestrationService.generateCampaignFromTemplate(
  campaignTemplate.template_id,
  { name: 'Client SEO Campaign' }
);

// 5. Simulate first workflow
const simulation = await schemaOrchestrationService.simulateWorkflow(
  campaign.workflows[0].workflow_id,
  { url: 'https://client.com' }
);

console.log('Estimated duration:', simulation.estimated_duration_ms);
console.log('Resources needed:', simulation.resource_requirements);

// 6. Execute if simulation looks good
// (use existing workflow execution APIs)
```

## Integration with Existing Systems

The Schema Orchestration System integrates seamlessly with:

- **Agent Management** - Templates can define agent workflows
- **Schema Validation** - All generated workflows are validated
- **Security Monitoring** - Security layers apply to template-generated workflows
- **Campaign System** - Templates can generate complete campaigns

## Conclusion

The Schema Orchestration System shifts development from code-heavy to configuration-driven, enabling:

- Faster development through reusable templates
- Safer deployments through simulation
- Better organization through schema maps and hierarchies
- Infinite extensibility through MCP servers

Define once, generate infinitely, simulate freely, deploy confidently.
