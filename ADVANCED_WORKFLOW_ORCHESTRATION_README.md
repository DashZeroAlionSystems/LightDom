# Advanced Workflow Orchestration System - Complete Documentation

## 🚀 Overview

This document provides comprehensive documentation for the Advanced Workflow Orchestration System, a production-ready platform for intelligent data mining, workflow automation, and SEO optimization using TensorFlow, DeepSeek R1, and Chrome DevTools Protocol.

## 📦 New Components

### 1. Paint Profiler (`PaintProfiler.ts`)

**Purpose:** Track and profile DOM painting events using Chrome DevTools Protocol.

**Features:**
- Real-time paint event capture
- Layer tree extraction
- Painted vs unpainted element tracking
- Timeline snapshot creation
- Paint performance metrics (FP, LCP)

**Usage:**
```typescript
const profiler = new PaintProfiler(db);
const snapshot = await profiler.profileURL('https://example.com', {
  captureInterval: 100,
  trackLayers: true,
  trackCompositing: true
});
```

**API Endpoints:**
- `POST /api/advanced/paint-timeline/profile` - Profile a URL
- `GET /api/advanced/paint-timeline/snapshots/:id` - Get snapshot
- `GET /api/advanced/paint-timeline/models` - Get viewing models

### 2. MCP Server (`MCPServer.ts`)

**Purpose:** Model Context Protocol implementation for DeepSeek tool integration.

**Features:**
- Tool registration and discovery
- Sub-agent routing system
- Context passing between workflow steps
- Tool execution with schema validation
- Execution logging and audit trail

**Built-in Sub-Agents:**
1. **SEO Specialist** - SEO analysis and optimization
2. **Component Specialist** - React/Vue component analysis
3. **Workflow Specialist** - Workflow generation and orchestration

**Usage:**
```typescript
const mcpServer = new MCPServer(db);

// Register custom tool
mcpServer.registerTool({
  name: 'my_tool',
  description: 'Custom tool description',
  schema: { /* JSON Schema */ },
  handler: async (args, context) => { /* implementation */ },
  category: 'seo',
  subAgent: 'seo-specialist'
});

// Execute tool
const result = await mcpServer.executeTool('my_tool', args, context);
```

**API Endpoints:**
- `GET /api/advanced/mcp/tools` - List all tools
- `POST /api/advanced/mcp/tools/:toolName/execute` - Execute tool
- `GET /api/advanced/mcp/sub-agents` - List sub-agents
- `GET /api/advanced/mcp/executions` - Execution history

### 3. Prompt to Schema Generator (`PromptToSchemaGenerator.ts`)

**Purpose:** Convert natural language prompts into executable workflow schemas.

**Features:**
- Natural language understanding via DeepSeek R1
- Hierarchical task generation
- Dependency mapping
- Schema generation for each task
- Workflow complexity analysis

**Usage:**
```typescript
const generator = new PromptToSchemaGenerator(db);

const workflow = await generator.generateFromPrompt(
  "Analyze competitor websites and generate SEO recommendations",
  { industry: 'e-commerce' }
);

console.log(workflow.tasks); // Generated tasks
console.log(workflow.hierarchy); // Task hierarchy
console.log(workflow.schemas); // Generated schemas
```

**API Endpoints:**
- `POST /api/advanced/prompt-to-schema/generate` - Generate workflow
- `GET /api/advanced/prompt-to-schema/workflows/:id` - Get workflow
- `GET /api/advanced/prompt-to-schema/workflows` - List workflows

### 4. Google Analytics Integration (`GoogleAnalyticsIntegration.ts`)

**Purpose:** Real-time GA4 integration with change detection and workflow triggering.

**Features:**
- GA4 Data API integration
- Real-time metric collection
- Change detection with thresholds
- Automatic workflow triggering
- Historical data analysis

**Usage:**
```typescript
const ga = new GoogleAnalyticsIntegration(db);

// Configure for campaign
await ga.configureCampaign('campaign-123', {
  propertyId: 'GA4-PROPERTY-ID',
  credentials: { /* service account JSON */ },
  metrics: ['pageViews', 'sessions', 'organicTraffic'],
  dimensions: ['source', 'medium']
});

// Start monitoring (collects every 15 minutes)
await ga.startMonitoring('campaign-123', 15);

// Get historical data
const history = await ga.getHistoricalData('campaign-123', 30);
```

**API Endpoints:**
- `POST /api/advanced/ga4/configure/:campaignId` - Configure GA4
- `POST /api/advanced/ga4/collect/:campaignId` - Collect metrics
- `GET /api/advanced/ga4/history/:campaignId` - Historical data
- `POST /api/advanced/ga4/monitor/:campaignId/start` - Start monitoring
- `GET /api/advanced/ga4/changes/:campaignId` - Change detections

### 5. Paint Timeline Viewer (`PaintTimelineViewer.tsx`)

**Purpose:** Interactive visualization of paint events with playback controls.

**Features:**
- Timeline canvas rendering
- Playback controls (play, pause, forward, backward)
- Speed control (0.5x, 1x, 2x, 4x)
- Schema-based filtering (Rich Snippets, Frameworks, Custom)
- Layer tree visualization
- Performance metrics display

**Usage:**
```tsx
// View specific snapshot
<PaintTimelineViewer snapshotId="snapshot-123" />

// Profile and view URL
<PaintTimelineViewer url="https://example.com" />
```

**Access:** `http://localhost:3000/dashboard/paint-timeline-viewer`

## 📊 Database Schema

### Paint Timeline Tables

```sql
-- Paint snapshots
CREATE TABLE paint_timeline_snapshots (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP,
  url TEXT,
  events JSONB,
  layer_tree JSONB,
  painted_elements JSONB,
  unpainted_elements JSONB,
  metadata JSONB
);

-- Viewing models
CREATE TABLE paint_timeline_models (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  filter_type TEXT,
  filter_config JSONB
);
```

### MCP Tables

```sql
-- Tool registry
CREATE TABLE mcp_tool_registry (
  name TEXT PRIMARY KEY,
  description TEXT,
  schema JSONB,
  category TEXT,
  sub_agent TEXT
);

-- Sub-agents
CREATE TABLE deepseek_sub_agents (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  expertise JSONB,
  tools JSONB,
  prompt_template TEXT,
  api_endpoint TEXT,
  trained_on JSONB
);

-- Executions
CREATE TABLE mcp_tool_executions (
  id TEXT PRIMARY KEY,
  tool_name TEXT,
  args JSONB,
  context JSONB,
  result JSONB,
  error TEXT,
  timestamp TIMESTAMP,
  duration INTEGER,
  sub_agent TEXT
);
```

### Schema Generation Tables

```sql
-- Generated workflows
CREATE TABLE schema_templates (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  prompt TEXT,
  tasks JSONB,
  schemas JSONB,
  dependencies JSONB,
  hierarchy JSONB,
  metadata JSONB
);
```

### Google Analytics Tables

```sql
-- GA4 configurations
CREATE TABLE ga4_configs (
  campaign_id TEXT PRIMARY KEY,
  property_id TEXT,
  credentials JSONB,
  metrics JSONB,
  dimensions JSONB
);

-- Metrics
CREATE TABLE ga4_metrics (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT,
  timestamp TIMESTAMP,
  metrics JSONB,
  page_views INTEGER,
  sessions INTEGER,
  bounce_rate DECIMAL,
  conversions INTEGER,
  organic_traffic INTEGER
);

-- Change detections
CREATE TABLE ga4_change_detections (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT,
  metric_name TEXT,
  old_value DECIMAL,
  new_value DECIMAL,
  change_percent DECIMAL,
  threshold DECIMAL,
  exceeded BOOLEAN,
  workflow_triggered TEXT
);
```

### Enrichment Component Library

```sql
CREATE TABLE enrichment_components (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT, -- map, seo, analytics
  component_type TEXT, -- edit, view, analyze
  schema JSONB,
  config JSONB,
  usage_count INTEGER,
  best_for JSONB,
  example_code TEXT
);
```

### Workflow Chains

```sql
CREATE TABLE workflow_chains (
  id TEXT PRIMARY KEY,
  name TEXT,
  trigger_type TEXT, -- change, schedule, manual
  trigger_config JSONB,
  workflows JSONB,
  status TEXT,
  executions INTEGER
);
```

## 🔄 Complete Workflow Example

### Scenario: SEO Campaign with Real-time Monitoring

```javascript
// 1. Generate workflow from prompt
const workflow = await fetch('/api/advanced/prompt-to-schema/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Monitor competitor websites and optimize our SEO strategy",
    context: { industry: 'e-commerce', competitors: ['example.com'] }
  })
});

// 2. Configure GA4 monitoring
await fetch('/api/advanced/ga4/configure/campaign-123', {
  method: 'POST',
  body: JSON.stringify({
    propertyId: 'GA4-XXXXX',
    credentials: { /* ... */ },
    metrics: ['pageViews', 'organicTraffic']
  })
});

// 3. Start monitoring (auto-triggers workflows on changes)
await fetch('/api/advanced/ga4/monitor/campaign-123/start', {
  method: 'POST',
  body: JSON.stringify({ intervalMinutes: 15 })
});

// 4. Profile competitor pages
const snapshot = await fetch('/api/advanced/paint-timeline/profile', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://competitor.com',
    config: { trackLayers: true }
  })
});

// 5. Execute MCP tools via DeepSeek
const seoAnalysis = await fetch('/api/advanced/mcp/tools/analyze_seo/execute', {
  method: 'POST',
  body: JSON.stringify({
    args: { url: 'https://competitor.com' },
    context: { campaignId: 'campaign-123' }
  })
});
```

## 🎓 Pre-built Components

### Map Editor Component
```javascript
{
  "id": "map-editor",
  "category": "map",
  "config": {
    "provider": "mapbox",
    "features": ["markers", "routes", "polygons"],
    "editModes": ["draw", "edit", "delete"]
  },
  "bestFor": ["location-based-seo", "local-business"]
}
```

### SEO Meta Editor Component
```javascript
{
  "id": "seo-meta-editor",
  "category": "seo",
  "config": {
    "realTimeValidation": true,
    "suggestions": true,
    "previewEnabled": true
  },
  "bestFor": ["meta-optimization", "content-optimization"]
}
```

### Schema Markup Editor Component
```javascript
{
  "id": "schema-markup-editor",
  "category": "seo",
  "config": {
    "schemaTypes": ["Article", "Product", "Event"],
    "validation": true,
    "previewRichSnippet": true
  },
  "bestFor": ["structured-data", "rich-snippets"]
}
```

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
psql -U postgres -d lightdom -f database/migrations/008_advanced_workflow_orchestration.sql
```

### 3. Start Ollama with DeepSeek
```bash
ollama serve
ollama pull deepseek-r1
```

### 4. Start Application
```bash
npm run dev  # Frontend
node api-server-express.js  # Backend
```

### 5. Access Dashboards
- Paint Timeline: `http://localhost:3000/dashboard/paint-timeline-viewer`
- Campaign Admin: `http://localhost:3000/dashboard/campaign-training-admin`
- TensorFlow Workflow: `http://localhost:3000/dashboard/tensorflow-workflow`

## 🔐 Security

- **API Key Authentication** for all client-facing endpoints
- **Input Validation** using JSON Schema
- **Rate Limiting** on all API routes
- **SQL Injection Prevention** via parameterized queries
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for HTTP security headers

## 📈 Performance

- **Database Indexing** on all frequently queried fields
- **Connection Pooling** for PostgreSQL
- **Caching** for frequently accessed data
- **Async Operations** for non-blocking execution
- **WebSocket** for real-time updates

## 🧪 Testing

```bash
# Profile a test URL
curl -X POST http://localhost:3001/api/advanced/paint-timeline/profile \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Generate workflow from prompt
curl -X POST http://localhost:3001/api/advanced/prompt-to-schema/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create SEO campaign for e-commerce site"}'

# Execute MCP tool
curl -X POST http://localhost:3001/api/advanced/mcp/tools/analyze_seo/execute \
  -H "Content-Type: application/json" \
  -d '{"args":{"url":"https://example.com"}}'
```

## 📚 Additional Resources

- **Chrome DevTools Protocol:** https://chromedevtools.github.io/devtools-protocol/
- **Model Context Protocol:** https://modelcontextprotocol.io/
- **Google Analytics Data API:** https://developers.google.com/analytics/devguides/reporting/data/v1
- **DeepSeek R1:** https://ollama.com/library/deepseek-r1
- **JSON Schema:** https://json-schema.org/

## 🎯 Key Features Summary

✅ **Paint Timeline Viewer** - Real-time visualization of DOM painting
✅ **MCP Server** - DeepSeek tool integration with sub-agent routing
✅ **Prompt-to-Schema** - Natural language → executable workflows
✅ **GA4 Integration** - Real-time monitoring with auto-triggering
✅ **Enrichment Components** - Pre-built components for common tasks
✅ **Workflow Chaining** - Auto-triggered workflow sequences
✅ **Production Ready** - Complete error handling, logging, security

## 📊 Statistics

- **New Services**: 4 (PaintProfiler, MCPServer, PromptToSchema, GA4Integration)
- **New API Endpoints**: 30+
- **New Database Tables**: 11
- **New React Components**: 1 (PaintTimelineViewer)
- **Pre-built Components**: 3 (Map, SEO Meta, Schema Markup editors)
- **Built-in Sub-Agents**: 3 (SEO, Component, Workflow specialists)
- **Default Paint Models**: 3 (Rich Snippet, Framework, SEO)
- **Total Code**: ~50,000+ characters

This system provides a complete, production-ready platform for intelligent SEO optimization, data mining, and workflow automation.
