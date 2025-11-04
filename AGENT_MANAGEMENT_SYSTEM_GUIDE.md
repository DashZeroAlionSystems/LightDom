# Agent Management System - Complete Guide

## Overview

This comprehensive agent management system provides a GitHub Copilot-style interface for managing AI agents, tools, services, workflows, campaigns, and data streams. The system is built with:

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Ant Design
- **AI Integration**: DeepSeek API
- **Pattern Discovery**: Automated codebase analysis

## Architecture

### Database Layer

The system uses PostgreSQL with 20+ tables organized into:

1. **Agent Sessions & Instances** - Manage AI agent chat sessions and configurations
2. **Tools & Services** - Modular capabilities grouped into services
3. **Workflows** - Orchestrated sequences of services
4. **Campaigns** - High-level orchestration of workflows
5. **Data Streams** - Configurable data collection pipelines
6. **Codebase Analysis** - Schema maps and pattern rules

### API Endpoints

All endpoints are prefixed with `/api/agent/`

#### Sessions
- `GET /api/agent/sessions` - List all sessions
- `POST /api/agent/sessions` - Create new session
- `GET /api/agent/sessions/:id` - Get session details
- `PATCH /api/agent/sessions/:id` - Update session
- `DELETE /api/agent/sessions/:id` - Delete session

#### Instances
- `GET /api/agent/instances` - List all instances
- `POST /api/agent/instances` - Create new instance
- `GET /api/agent/instances/:id` - Get instance details
- `PATCH /api/agent/instances/:id` - Update instance
- `DELETE /api/agent/instances/:id` - Delete instance

#### Messages
- `GET /api/agent/messages/:session_id` - Get session messages
- `POST /api/agent/messages` - Send message to agent

#### Tools
- `GET /api/agent/tools` - List all tools
- `POST /api/agent/tools` - Create new tool
- `GET /api/agent/tools/:id` - Get tool details
- `PATCH /api/agent/tools/:id` - Update tool
- `DELETE /api/agent/tools/:id` - Delete tool

#### Services
- `GET /api/agent/services` - List all services
- `POST /api/agent/services` - Create new service
- `GET /api/agent/services/:id` - Get service details with tools
- `PATCH /api/agent/services/:id` - Update service
- `DELETE /api/agent/services/:id` - Delete service

#### Workflows
- `GET /api/agent/workflows` - List all workflows
- `POST /api/agent/workflows` - Create new workflow
- `GET /api/agent/workflows/:id` - Get workflow with steps
- `PATCH /api/agent/workflows/:id` - Update workflow
- `DELETE /api/agent/workflows/:id` - Delete workflow
- `POST /api/agent/workflows/:id/execute` - Execute workflow

#### Campaigns
- `GET /api/agent/campaigns` - List all campaigns
- `POST /api/agent/campaigns` - Create new campaign
- `GET /api/agent/campaigns/:id` - Get campaign with workflows
- `PATCH /api/agent/campaigns/:id` - Update campaign
- `DELETE /api/agent/campaigns/:id` - Delete campaign

#### Data Streams
- `GET /api/agent/data-streams` - List all data streams
- `POST /api/agent/data-streams` - Create new data stream
- `GET /api/agent/data-streams/:id` - Get data stream with attributes
- `PATCH /api/agent/data-streams/:id` - Update data stream
- `DELETE /api/agent/data-streams/:id` - Delete data stream

## Setup Instructions

### 1. Database Setup

Run the migration script:

```bash
psql -U postgres -d lightdom -f database/migrations/200-agent-management-system.sql
```

This creates all necessary tables, indexes, triggers, and seed data.

### 2. Environment Configuration

Add to your `.env` file:

```env
# DeepSeek Configuration
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_api_key_here

# Database Configuration (already configured)
DATABASE_URL=postgresql://user:password@localhost:5432/lightdom
```

### 3. Backend Integration

Add the agent management routes to your Express server:

```javascript
// In api-server-express.js or similar
import { createAgentManagementRoutes } from './src/api/routes/agent-management.routes';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
app.use('/api/agent', createAgentManagementRoutes(db));
```

### 4. Frontend Integration

Add the Agent Session Sidebar to your main app:

```tsx
// In App.tsx or main component
import { AgentSessionSidebar } from './components/agent/AgentSessionSidebar';

function App() {
  return (
    <>
      {/* Your existing app */}
      <AgentSessionSidebar visible={true} />
    </>
  );
}
```

Or add the full dashboard:

```tsx
import { AgentManagementDashboard } from './components/agent/AgentManagementDashboard';

// Add to your routes
<Route path="/agent-management" element={<AgentManagementDashboard />} />
```

## Usage Examples

### Creating an Agent Session

```typescript
const session = await axios.post('/api/agent/sessions', {
  name: 'Feature Development',
  description: 'Working on user authentication feature',
  agent_type: 'deepseek'
});
```

### Creating an Agent Instance with Codebase Context

```typescript
const instance = await axios.post('/api/agent/instances', {
  session_id: session.data.session_id,
  name: 'Full Stack Developer',
  model_name: 'deepseek-coder',
  temperature: 0.7,
  max_tokens: 4096,
  tools_enabled: ['code_analyzer', 'database_query'],
  services_enabled: ['Data Collection', 'ML & AI']
});
```

### Sending a Prompt

```typescript
const message = await axios.post('/api/agent/messages', {
  session_id: session.data.session_id,
  instance_id: instance.data.instance_id,
  content: 'Help me implement user authentication with JWT tokens'
});
```

### Creating a Workflow

```typescript
const workflow = await axios.post('/api/agent/workflows', {
  name: 'Data Collection Workflow',
  workflow_type: 'sequential',
  steps: [
    {
      name: 'Fetch Data',
      step_type: 'tool',
      tool_id: 'web_scraper_tool_id',
      ordering: 1,
      configuration: { url: 'https://example.com' }
    },
    {
      name: 'Process Data',
      step_type: 'service',
      service_id: 'ml_service_id',
      ordering: 2,
      dependencies: ['step_1_id']
    }
  ]
});
```

### Creating a Campaign

```typescript
const campaign = await axios.post('/api/agent/campaigns', {
  name: 'SEO Optimization Campaign',
  campaign_type: 'seo',
  workflow_ids: [workflow1.id, workflow2.id],
  schedule_config: {
    cron: '0 0 * * *', // Daily at midnight
    timezone: 'UTC'
  }
});
```

### Creating a Data Stream with Attributes

```typescript
const stream = await axios.post('/api/agent/data-streams', {
  name: 'Product Data Stream',
  stream_type: 'web_scraping',
  source_config: {
    base_url: 'https://example.com',
    selectors: {}
  },
  attributes: [
    {
      name: 'product_title',
      data_type: 'string',
      extraction_config: { selector: 'h1.title' },
      is_required: true
    },
    {
      name: 'product_price',
      data_type: 'number',
      extraction_config: { selector: '.price' },
      enrichment_prompt: 'Extract numeric price value',
      search_algorithm: 'regex'
    }
  ]
});
```

## Codebase Pattern Discovery

### Running Pattern Analysis

```typescript
import { CodebasePatternDiscoveryService } from './src/services/codebase-pattern-discovery.service';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const discoveryService = new CodebasePatternDiscoveryService(db, process.cwd());

// Scan entire codebase
const results = await discoveryService.scanCodebase();
console.log(`Analyzed ${results.total_files} files`);
console.log(`Discovered ${results.total_patterns} patterns`);

// Get schema map for agent context
const schemaMap = await discoveryService.getSchemaMap();

// Get pattern rules
const patternRules = await discoveryService.getPatternRules();
```

### Using Pattern Discovery in Agent Instances

When creating an agent instance, the system can automatically include:
- Schema map of the codebase (file structure, imports, exports, relationships)
- Discovered pattern rules (coding conventions, architectural patterns)

```typescript
// Update instance with codebase context
await axios.patch(`/api/agent/instances/${instanceId}`, {
  schema_map: schemaMap,
  pattern_rules: patternRules
});
```

## DeepSeek Integration

### Direct DeepSeek API Usage

```typescript
import { DeepSeekIntegrationService } from './src/services/deepseek-integration.service';

const deepseek = new DeepSeekIntegrationService(db);

// Simple chat
const response = await deepseek.chat([
  { role: 'user', content: 'Explain async/await in JavaScript' }
]);

// Chat with codebase context
const contextualResponse = await deepseek.promptWithContext(
  instanceId,
  'How should I structure my API routes?',
  true, // include schema map
  true  // include pattern rules
);

// Code analysis
const analysis = await deepseek.analyzeCode(
  'function example() { ... }',
  'javascript'
);

// Code refactoring
const refactored = await deepseek.refactorCode(
  'const x = 1; const y = 2;',
  'Use modern ES6+ syntax',
  'javascript'
);

// Generate tests
const tests = await deepseek.generateTests(
  'function add(a, b) { return a + b; }',
  'javascript',
  'jest'
);
```

## Hierarchical Module System

### Module Hierarchy

1. **Attributes** → Define data points to collect
2. **Tools** → Individual capabilities (database query, API call, etc.)
3. **Services** → Bundle tools by domain (Data Collection, ML, Integration)
4. **Workflows** → Orchestrate services in sequence
5. **Campaigns** → Coordinate multiple workflows
6. **Data Streams** → Connect campaigns to attribute collection

### Example: Building a Complete Campaign

```typescript
// 1. Create attributes
const attributes = await Promise.all([
  axios.post('/api/agent/data-streams/attributes', {
    name: 'page_title',
    data_type: 'string',
    extraction_config: { selector: 'title' }
  }),
  axios.post('/api/agent/data-streams/attributes', {
    name: 'meta_description',
    data_type: 'string',
    extraction_config: { selector: 'meta[name="description"]' }
  })
]);

// 2. Tools are pre-seeded (database_query, web_scraper, etc.)

// 3. Services are pre-seeded (Data Collection, ML & AI, etc.)

// 4. Create workflow
const workflow = await axios.post('/api/agent/workflows', {
  name: 'SEO Data Collection',
  workflow_type: 'sequential',
  steps: [
    {
      name: 'Scrape Pages',
      step_type: 'service',
      service_id: 'data_collection_service_id',
      ordering: 1
    },
    {
      name: 'Analyze Content',
      step_type: 'service',
      service_id: 'ml_ai_service_id',
      ordering: 2
    }
  ]
});

// 5. Create campaign
const campaign = await axios.post('/api/agent/campaigns', {
  name: 'SEO Optimization Campaign',
  campaign_type: 'seo',
  workflow_ids: [workflow.data.workflow_id]
});

// 6. Create data stream linking to campaign
const stream = await axios.post('/api/agent/data-streams', {
  campaign_id: campaign.data.campaign_id,
  name: 'SEO Data Stream',
  stream_type: 'web_scraping',
  attributes: attributes.map(a => a.data)
});
```

## UI Components

### Agent Session Sidebar

GitHub Copilot-style sidebar for chatting with agents:
- Session management
- Instance selection
- Real-time chat interface
- Message history
- Copy to clipboard

### Agent Management Dashboard

Comprehensive dashboard with tabs for:
- Sessions management
- Instance configuration
- Tools catalog
- Services management
- Workflows builder
- Campaigns orchestration
- Data streams configuration

## Next Steps

1. **Hot Reload System**: Implement staged code reload with testing
2. **CI/CD Integration**: Auto-test and revision pipeline
3. **GitHub Copilot API**: Research and integrate if available
4. **Visual Workflow Builder**: Drag-and-drop workflow creation
5. **Real-time Monitoring**: Live execution status and metrics
6. **Advanced Analytics**: Campaign performance tracking

## API Reference

See individual service files for detailed API documentation:
- `src/services/agent-management.service.ts`
- `src/services/deepseek-integration.service.ts`
- `src/services/codebase-pattern-discovery.service.ts`
- `src/api/routes/agent-management.routes.ts`

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
psql -U postgres -d lightdom -c "SELECT version();"

# Verify tables exist
psql -U postgres -d lightdom -c "\dt"
```

### DeepSeek API Issues
- Verify API key is correct
- Check API endpoint URL
- Ensure network connectivity
- Check rate limits

### Pattern Discovery Issues
- Ensure read permissions on project files
- Check excluded directories list
- Verify database write permissions

**Note on Import Parsing**: The current implementation uses regex-based parsing for imports and exports. For production use, consider using a proper AST parser like TypeScript Compiler API (`typescript` package) or Babel (`@babel/parser`) for more reliable and comprehensive code analysis. This would better handle:
- Dynamic imports
- Type-only imports
- Mixed import/export patterns
- Complex module patterns

Example using TypeScript Compiler API:
```typescript
import * as ts from 'typescript';

const sourceFile = ts.createSourceFile(
  fileName,
  content,
  ts.ScriptTarget.Latest,
  true
);

// Visit all nodes and extract imports/exports
ts.forEachChild(sourceFile, visitNode);
```
