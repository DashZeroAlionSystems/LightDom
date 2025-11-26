-- Migration: Create MCP Server Management Tables
-- Purpose: Store MCP server instances, agent configurations, and schema links

-- ====================================
-- MCP Servers Table
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(100) NOT NULL,
  model_name VARCHAR(255) DEFAULT 'deepseek-r1',
  endpoint_url TEXT,
  topic VARCHAR(255),
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF to_regclass('public.mcp_servers') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'agent_type'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_servers ADD COLUMN agent_type VARCHAR(100)';
      EXECUTE 'UPDATE mcp_servers SET agent_type = COALESCE(agent_type, ''deepseek'')';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'description'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_servers ADD COLUMN description TEXT';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'model_name'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_servers ADD COLUMN model_name VARCHAR(255)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'topic'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_servers ADD COLUMN topic VARCHAR(255)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'config'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_servers ADD COLUMN config JSONB DEFAULT ''{}''::jsonb';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'active'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_servers ADD COLUMN active BOOLEAN DEFAULT true';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_servers_agent_type'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'agent_type'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_servers_agent_type ON mcp_servers(agent_type)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_servers_active'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'active'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_servers_active ON mcp_servers(active)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_servers_topic'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'topic'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_servers_topic ON mcp_servers(topic)';
    END IF;
  END IF;
END;
$$;

-- ====================================
-- Schemas Table (if not exists)
-- ====================================
CREATE TABLE IF NOT EXISTS schemas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  schema_definition JSONB NOT NULL,
  version VARCHAR(50) DEFAULT '1.0.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF to_regclass('public.schemas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'schemas' AND column_name = 'category'
    ) THEN
      EXECUTE 'ALTER TABLE schemas ADD COLUMN category VARCHAR(100)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'schemas' AND column_name = 'description'
    ) THEN
      EXECUTE 'ALTER TABLE schemas ADD COLUMN description TEXT';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'schemas' AND column_name = 'schema_definition'
    ) THEN
      EXECUTE 'ALTER TABLE schemas ADD COLUMN schema_definition JSONB NOT NULL DEFAULT ''{}''::jsonb';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'schemas' AND column_name = 'version'
    ) THEN
      EXECUTE 'ALTER TABLE schemas ADD COLUMN version VARCHAR(50) DEFAULT ''1.0.0''';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_schemas_category'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'schemas' AND column_name = 'category'
    ) THEN
      EXECUTE 'CREATE INDEX idx_schemas_category ON schemas(category)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_schemas_name'
    ) THEN
      EXECUTE 'CREATE INDEX idx_schemas_name ON schemas(name)';
    END IF;
  END IF;
END;
$$;

DO $$
DECLARE
  server_type TEXT;
  schema_type TEXT;
  create_statement TEXT;
  has_mcp BOOLEAN;
  has_schema BOOLEAN;
BEGIN
  has_mcp := to_regclass('public.mcp_servers') IS NOT NULL;
  has_schema := to_regclass('public.schemas') IS NOT NULL;

  IF to_regclass('public.mcp_server_schemas') IS NULL THEN
    IF has_mcp THEN
      SELECT format_type(a.atttypid, a.atttypmod)
      INTO server_type
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'mcp_servers'
        AND a.attname = 'id'
        AND a.attisdropped = false
      LIMIT 1;
    END IF;

    IF has_schema THEN
      SELECT format_type(a.atttypid, a.atttypmod)
      INTO schema_type
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'schemas'
        AND a.attname = 'id'
        AND a.attisdropped = false
      LIMIT 1;
    END IF;

    IF server_type IS NULL THEN
      server_type := 'INTEGER';
    END IF;

    IF schema_type IS NULL THEN
      schema_type := 'INTEGER';
    END IF;

    IF has_mcp AND has_schema THEN
      create_statement := format(
        'CREATE TABLE mcp_server_schemas (
           id SERIAL PRIMARY KEY,
           server_id %s NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
           schema_id %s NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
           linked_at TIMESTAMP DEFAULT NOW(),
           UNIQUE(server_id, schema_id)
         )',
        server_type,
        schema_type
      );
    ELSE
      create_statement := format(
        'CREATE TABLE mcp_server_schemas (
           id SERIAL PRIMARY KEY,
           server_id %s,
           schema_id %s,
           linked_at TIMESTAMP DEFAULT NOW(),
           UNIQUE(server_id, schema_id)
         )',
        server_type,
        schema_type
      );
    END IF;

    BEGIN
      EXECUTE create_statement;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Failed to create mcp_server_schemas with inferred types (% %, % %): %',
          'server_id', server_type, 'schema_id', schema_type, SQLERRM;
        EXECUTE 'CREATE TABLE IF NOT EXISTS mcp_server_schemas (
           id SERIAL PRIMARY KEY,
           server_id TEXT,
           schema_id TEXT,
           linked_at TIMESTAMP DEFAULT NOW(),
           UNIQUE(server_id, schema_id)
        )';
    END;
  END IF;

  IF to_regclass('public.mcp_server_schemas') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_server_schemas_server'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_server_schemas_server ON mcp_server_schemas(server_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_server_schemas_schema'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_server_schemas_schema ON mcp_server_schemas(schema_id)';
    END IF;
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF to_regclass('public.mcp_tool_registry') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_tool_registry_category'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_tool_registry_category ON mcp_tool_registry(category)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_tool_registry_sub_agent'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_tool_registry_sub_agent ON mcp_tool_registry(sub_agent)';
    END IF;
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF to_regclass('public.mcp_tool_executions') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_tool_executions_server'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_tool_executions_server ON mcp_tool_executions(server_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_tool_executions_tool'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_tool_executions_tool ON mcp_tool_executions(tool_name)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_tool_executions_timestamp'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_tool_executions_timestamp ON mcp_tool_executions(timestamp)';
    END IF;
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF to_regclass('public.schemas') IS NOT NULL THEN
    INSERT INTO schemas (name, description, category, schema_definition) VALUES
      ('SEO Analysis Schema', 'Schema for SEO analysis and optimization', 'seo', '{"type": "object", "properties": {"url": {"type": "string"}, "metrics": {"type": "array"}}}'),
      ('Component Extraction Schema', 'Schema for UI component extraction', 'component', '{"type": "object", "properties": {"framework": {"type": "string"}, "selectors": {"type": "array"}}}'),
      ('Workflow Generation Schema', 'Schema for workflow automation', 'workflow', '{"type": "object", "properties": {"steps": {"type": "array"}, "triggers": {"type": "object"}}}'),
      ('Content Generation Schema', 'Schema for AI content generation', 'content', '{"type": "object", "properties": {"template": {"type": "string"}, "variables": {"type": "object"}}}'),
      ('Data Mining Schema', 'Schema for data extraction and mining', 'data', '{"type": "object", "properties": {"source": {"type": "string"}, "patterns": {"type": "array"}}}')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE NOTICE 'Skipping schema sample data; schemas table missing.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.mcp_servers') IS NOT NULL THEN
    INSERT INTO mcp_servers (name, description, agent_type, model_name, topic, config) VALUES
      ('SEO Specialist Agent', 'DeepSeek instance specialized in SEO optimization', 'deepseek', 'deepseek-r1', 'seo', '{"temperature": 0.7, "max_tokens": 2000}'),
      ('Component Analyzer Agent', 'DeepSeek instance for UI component analysis', 'deepseek', 'deepseek-r1', 'components', '{"temperature": 0.5, "max_tokens": 1500}'),
      ('Workflow Orchestrator Agent', 'DeepSeek instance for workflow automation', 'deepseek', 'deepseek-r1', 'workflows', '{"temperature": 0.6, "max_tokens": 2500}')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE NOTICE 'Skipping MCP server seed data; mcp_servers table missing.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.mcp_server_schemas') IS NOT NULL
     AND to_regclass('public.mcp_servers') IS NOT NULL
     AND to_regclass('public.schemas') IS NOT NULL THEN
    INSERT INTO mcp_server_schemas (server_id, schema_id)
    SELECT ms.id, s.id
    FROM mcp_servers ms
    CROSS JOIN schemas s
    WHERE (ms.topic = 'seo' AND s.category = 'seo')
       OR (ms.topic = 'components' AND s.category = 'component')
       OR (ms.topic = 'workflows' AND s.category = 'workflow')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE NOTICE 'Skipping MCP server-schema links; required tables missing.';
  END IF;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE mcp_servers IS 'MCP server instances with agent configurations';
COMMENT ON TABLE mcp_server_schemas IS 'Links between MCP servers and schemas for topic-specific context';
COMMENT ON TABLE mcp_tool_executions IS 'Execution history for MCP tools';
COMMENT ON COLUMN mcp_servers.topic IS 'Specialized topic/domain for this agent instance';
COMMENT ON COLUMN mcp_servers.config IS 'Agent-specific configuration (temperature, max_tokens, etc.)';
