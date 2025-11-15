-- Create dev persistence tables used by minimal-api-server-proxy

CREATE TABLE IF NOT EXISTS deepseek_memory (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255),
  key VARCHAR(255),
  value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prompt_executions (
  id SERIAL PRIMARY KEY,
  model VARCHAR(255),
  prompt TEXT,
  response TEXT,
  tokens INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_processes (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255),
  pid INTEGER,
  command TEXT,
  args JSONB,
  status VARCHAR(50),
  start_time TIMESTAMP,
  stop_time TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
