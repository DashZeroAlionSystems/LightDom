-- Migration: Add DeepSeek memory and execution tables
-- Date: 2025-11-11

-- deepseek_memory stores small pieces of memory or embeddings associated with a conversation
CREATE TABLE IF NOT EXISTS deepseek_memory (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deepseek_memory_conversation ON deepseek_memory(conversation_id);

-- prompt_executions stores individual prompt/response pairs and metadata for analytics
CREATE TABLE IF NOT EXISTS prompt_executions (
  id BIGSERIAL PRIMARY KEY,
  model TEXT,
  prompt TEXT,
  response JSONB,
  tokens INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_executions_model ON prompt_executions(model);

-- mcp_servers stores registered MCP servers and their configuration
CREATE TABLE IF NOT EXISTS mcp_servers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  url TEXT,
  type TEXT,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_servers_name ON mcp_servers(name);
