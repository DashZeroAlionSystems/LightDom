-- Migration: Create MCP Server Management Tables
-- Purpose: Store MCP server instances, agent configurations, and schema links

-- ====================================
-- MCP Servers Table
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(100) NOT NULL, -- e.g., 'deepseek', 'ollama', 'openai'
  model_name VARCHAR(255) DEFAULT 'deepseek-r1',
  endpoint_url TEXT, -- Optional API endpoint for the agent
  topic VARCHAR(255), -- Topic/domain this agent specializes in
  config JSONB DEFAULT '{}', -- Agent-specific configuration
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_mcp_servers_agent_type ON mcp_servers(agent_type);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_active ON mcp_servers(active);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_topic ON mcp_servers(topic);

-- ====================================
-- Schemas Table (if not exists)
-- ====================================
CREATE TABLE IF NOT EXISTS schemas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., 'seo', 'component', 'workflow'
  schema_definition JSONB NOT NULL,
  version VARCHAR(50) DEFAULT '1.0.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schemas_category ON schemas(category);
CREATE INDEX IF NOT EXISTS idx_schemas_name ON schemas(name);

-- ====================================
-- MCP Server Schema Links
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_server_schemas (
  id SERIAL PRIMARY KEY,
  server_id INTEGER NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
  schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
  linked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(server_id, schema_id)
);

CREATE INDEX IF NOT EXISTS idx_mcp_server_schemas_server ON mcp_server_schemas(server_id);
CREATE INDEX IF NOT EXISTS idx_mcp_server_schemas_schema ON mcp_server_schemas(schema_id);

-- ====================================
-- MCP Tool Registry (if not exists from MCPServer.ts)
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_tool_registry (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  schema JSONB NOT NULL,
  category VARCHAR(100),
  sub_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_tool_registry_category ON mcp_tool_registry(category);
CREATE INDEX IF NOT EXISTS idx_mcp_tool_registry_sub_agent ON mcp_tool_registry(sub_agent);

-- ====================================
-- MCP Tool Executions
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_tool_executions (
  id VARCHAR(255) PRIMARY KEY,
  server_id INTEGER REFERENCES mcp_servers(id) ON DELETE SET NULL,
  tool_name VARCHAR(255) NOT NULL,
  args JSONB,
  context JSONB,
  result JSONB,
  error TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration INTEGER, -- milliseconds
  sub_agent VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_mcp_tool_executions_server ON mcp_tool_executions(server_id);
CREATE INDEX IF NOT EXISTS idx_mcp_tool_executions_tool ON mcp_tool_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_mcp_tool_executions_timestamp ON mcp_tool_executions(timestamp);

-- ====================================
-- DeepSeek Sub-Agents (if not exists)
-- ====================================
CREATE TABLE IF NOT EXISTS deepseek_sub_agents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  expertise JSONB, -- Array of expertise areas
  tools JSONB, -- Array of tool names
  prompt_template TEXT,
  api_endpoint TEXT,
  trained_on JSONB, -- Array of training data sources
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- Insert Sample Data
-- ====================================

-- Sample schemas for linking
INSERT INTO schemas (name, description, category, schema_definition) VALUES
  ('SEO Analysis Schema', 'Schema for SEO analysis and optimization', 'seo', '{"type": "object", "properties": {"url": {"type": "string"}, "metrics": {"type": "array"}}}'),
  ('Component Extraction Schema', 'Schema for UI component extraction', 'component', '{"type": "object", "properties": {"framework": {"type": "string"}, "selectors": {"type": "array"}}}'),
  ('Workflow Generation Schema', 'Schema for workflow automation', 'workflow', '{"type": "object", "properties": {"steps": {"type": "array"}, "triggers": {"type": "object"}}}'),
  ('Content Generation Schema', 'Schema for AI content generation', 'content', '{"type": "object", "properties": {"template": {"type": "string"}, "variables": {"type": "object"}}}'),
  ('Data Mining Schema', 'Schema for data extraction and mining', 'data', '{"type": "object", "properties": {"source": {"type": "string"}, "patterns": {"type": "array"}}}')
ON CONFLICT (name) DO NOTHING;

-- Sample MCP server instances
INSERT INTO mcp_servers (name, description, agent_type, model_name, topic, config) VALUES
  ('SEO Specialist Agent', 'DeepSeek instance specialized in SEO optimization', 'deepseek', 'deepseek-r1', 'seo', '{"temperature": 0.7, "max_tokens": 2000}'),
  ('Component Analyzer Agent', 'DeepSeek instance for UI component analysis', 'deepseek', 'deepseek-r1', 'components', '{"temperature": 0.5, "max_tokens": 1500}'),
  ('Workflow Orchestrator Agent', 'DeepSeek instance for workflow automation', 'deepseek', 'deepseek-r1', 'workflows', '{"temperature": 0.6, "max_tokens": 2500}')
ON CONFLICT DO NOTHING;

-- Link schemas to servers
INSERT INTO mcp_server_schemas (server_id, schema_id)
SELECT ms.id, s.id
FROM mcp_servers ms
CROSS JOIN schemas s
WHERE (ms.topic = 'seo' AND s.category = 'seo')
   OR (ms.topic = 'components' AND s.category = 'component')
   OR (ms.topic = 'workflows' AND s.category = 'workflow')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE mcp_servers IS 'MCP server instances with agent configurations';
COMMENT ON TABLE mcp_server_schemas IS 'Links between MCP servers and schemas for topic-specific context';
COMMENT ON TABLE mcp_tool_executions IS 'Execution history for MCP tools';
COMMENT ON COLUMN mcp_servers.topic IS 'Specialized topic/domain for this agent instance';
COMMENT ON COLUMN mcp_servers.config IS 'Agent-specific configuration (temperature, max_tokens, etc.)';
