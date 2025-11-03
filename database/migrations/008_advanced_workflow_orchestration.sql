-- Database Migration 008: Advanced Workflow Orchestration
-- Paint timeline, MCP server, GA4 integration, enrichment components

-- Paint Timeline Snapshots
CREATE TABLE IF NOT EXISTS paint_timeline_snapshots (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL,
  layer_tree JSONB NOT NULL,
  painted_elements JSONB NOT NULL,
  unpainted_elements JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_paint_snapshots_url ON paint_timeline_snapshots(url);
CREATE INDEX idx_paint_snapshots_timestamp ON paint_timeline_snapshots(timestamp);

-- MCP Tool Registry
CREATE TABLE IF NOT EXISTS mcp_tool_registry (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  schema JSONB NOT NULL,
  category TEXT NOT NULL,
  sub_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mcp_tools_category ON mcp_tool_registry(category);
CREATE INDEX idx_mcp_tools_sub_agent ON mcp_tool_registry(sub_agent);

-- MCP Tool Executions
CREATE TABLE IF NOT EXISTS mcp_tool_executions (
  id TEXT PRIMARY KEY,
  tool_name TEXT NOT NULL REFERENCES mcp_tool_registry(name),
  args JSONB NOT NULL,
  context JSONB,
  result JSONB,
  error TEXT,
  timestamp TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  sub_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mcp_executions_tool ON mcp_tool_executions(tool_name);
CREATE INDEX idx_mcp_executions_timestamp ON mcp_tool_executions(timestamp);

-- DeepSeek Sub-Agents
CREATE TABLE IF NOT EXISTS deepseek_sub_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  expertise JSONB NOT NULL,
  tools JSONB NOT NULL,
  prompt_template TEXT NOT NULL,
  api_endpoint TEXT,
  trained_on JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sub_agents_expertise ON deepseek_sub_agents USING GIN(expertise);

-- Schema Templates (Prompt-Generated)
CREATE TABLE IF NOT EXISTS schema_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tasks JSONB NOT NULL,
  schemas JSONB NOT NULL,
  dependencies JSONB NOT NULL,
  hierarchy JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schema_templates_name ON schema_templates(name);

-- GA4 Configurations
CREATE TABLE IF NOT EXISTS ga4_configs (
  campaign_id TEXT PRIMARY KEY REFERENCES client_seo_campaigns(id),
  property_id TEXT NOT NULL,
  credentials JSONB NOT NULL,
  metrics JSONB NOT NULL,
  dimensions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GA4 Metrics
CREATE TABLE IF NOT EXISTS ga4_metrics (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES client_seo_campaigns(id),
  timestamp TIMESTAMP NOT NULL,
  metrics JSONB NOT NULL,
  dimensions JSONB NOT NULL,
  page_views INTEGER,
  sessions INTEGER,
  bounce_rate DECIMAL,
  avg_session_duration DECIMAL,
  conversions INTEGER,
  organic_traffic INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ga4_metrics_campaign ON ga4_metrics(campaign_id);
CREATE INDEX idx_ga4_metrics_timestamp ON ga4_metrics(timestamp);

-- GA4 Change Detections
CREATE TABLE IF NOT EXISTS ga4_change_detections (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES client_seo_campaigns(id),
  metric_name TEXT NOT NULL,
  old_value DECIMAL NOT NULL,
  new_value DECIMAL NOT NULL,
  change_percent DECIMAL NOT NULL,
  threshold DECIMAL NOT NULL,
  exceeded BOOLEAN NOT NULL,
  workflow_triggered TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ga4_changes_campaign ON ga4_change_detections(campaign_id);
CREATE INDEX idx_ga4_changes_exceeded ON ga4_change_detections(exceeded);

-- Enrichment Component Library
CREATE TABLE IF NOT EXISTS enrichment_components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- map, seo, analytics, accessibility
  component_type TEXT NOT NULL, -- edit, view, analyze
  schema JSONB NOT NULL,
  config JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  best_for JSONB NOT NULL, -- Use cases
  example_code TEXT,
  dependencies JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_enrichment_category ON enrichment_components(category);
CREATE INDEX idx_enrichment_type ON enrichment_components(component_type);

-- Workflow Chains
CREATE TABLE IF NOT EXISTS workflow_chains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- change, schedule, manual, threshold
  trigger_config JSONB NOT NULL,
  workflows JSONB NOT NULL, -- Array of workflow IDs
  status TEXT DEFAULT 'active',
  executions INTEGER DEFAULT 0,
  last_execution TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_chains_status ON workflow_chains(status);
CREATE INDEX idx_workflow_chains_trigger ON workflow_chains(trigger_type);

-- Paint Timeline Models (Schema viewing models)
CREATE TABLE IF NOT EXISTS paint_timeline_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  filter_type TEXT NOT NULL, -- richSnippet, framework, custom
  filter_config JSONB NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default paint timeline models
INSERT INTO paint_timeline_models (id, name, description, filter_type, filter_config) VALUES
('model-rich-snippet', 'Rich Snippet Elements', 'Filter painted elements near rich snippet content', 'richSnippet', '{
  "includeElementsNear": ["article", "product", "event", "recipe"],
  "radius": 50,
  "includeSchemaLinked": true
}'::jsonb),
('model-framework', 'Framework Components', 'Filter painted framework component elements', 'framework', '{
  "frameworks": ["react", "vue", "angular"],
  "includeComponents": true,
  "includeStateManagement": false
}'::jsonb),
('model-seo', 'SEO Elements', 'Filter painted SEO-relevant elements', 'custom', '{
  "tags": ["h1", "h2", "title", "meta", "header", "nav"],
  "hasAttributes": ["itemscope", "itemtype", "data-seo"]
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert default enrichment components
INSERT INTO enrichment_components (id, name, category, component_type, schema, config, best_for, example_code) VALUES
('map-editor', 'Interactive Map Editor', 'map', 'edit', '{
  "type": "object",
  "properties": {
    "center": {"type": "array"},
    "zoom": {"type": "number"},
    "markers": {"type": "array"}
  }
}'::jsonb, '{
  "provider": "mapbox",
  "features": ["markers", "routes", "polygons"],
  "editModes": ["draw", "edit", "delete"]
}'::jsonb, '["location-based-seo", "local-business", "geo-targeting"]'::jsonb, 'const MapEditor = () => { /* ... */ };'),

('seo-meta-editor', 'SEO Meta Tags Editor', 'seo', 'edit', '{
  "type": "object",
  "properties": {
    "title": {"type": "string", "maxLength": 60},
    "description": {"type": "string", "maxLength": 160},
    "keywords": {"type": "array"}
  }
}'::jsonb, '{
  "realTimeValidation": true,
  "suggestions": true,
  "previewEnabled": true
}'::jsonb, '["meta-optimization", "seo-enrichment", "content-optimization"]'::jsonb, 'const MetaEditor = (props) => { /* ... */ };'),

('schema-markup-editor', 'Schema.org Markup Editor', 'seo', 'edit', '{
  "type": "object",
  "properties": {
    "schemaType": {"type": "string"},
    "properties": {"type": "object"}
  }
}'::jsonb, '{
  "schemaTypes": ["Article", "Product", "Event", "Recipe"],
  "validation": true,
  "previewRichSnippet": true
}'::jsonb, '["structured-data", "rich-snippets", "seo-markup"]'::jsonb, 'const SchemaEditor = () => { /* ... */ };')
ON CONFLICT (id) DO NOTHING;

-- Comments
COMMENT ON TABLE paint_timeline_snapshots IS 'Paint profiling snapshots for timeline visualization';
COMMENT ON TABLE mcp_tool_registry IS 'Model Context Protocol tool registry for DeepSeek';
COMMENT ON TABLE deepseek_sub_agents IS 'Specialized sub-agents for task routing';
COMMENT ON TABLE schema_templates IS 'Workflow schemas generated from natural language prompts';
COMMENT ON TABLE ga4_metrics IS 'Real-time Google Analytics 4 metrics';
COMMENT ON TABLE ga4_change_detections IS 'Change detection events for workflow triggering';
COMMENT ON TABLE enrichment_components IS 'Library of pre-built enrichment components';
COMMENT ON TABLE workflow_chains IS 'Chained workflows with auto-triggering';
COMMENT ON TABLE paint_timeline_models IS 'Schema models for filtering paint timeline views';
