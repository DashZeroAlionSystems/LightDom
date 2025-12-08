-- Agent Management System Schema
-- Comprehensive database schema for managing AI agent sessions, configurations, and orchestration

-- ============================================================================
-- AGENT SESSIONS & INSTANCES
-- ============================================================================

-- Agent Sessions - tracks individual agent chat/work sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(100) NOT NULL DEFAULT 'deepseek', -- deepseek, gpt4, claude, etc.
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, paused, completed, archived
  configuration JSONB NOT NULL DEFAULT '{}', -- agent-specific config
  context_data JSONB DEFAULT '{}', -- codebase schema, file mappings, patterns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Agent Instances - DeepSeek instances with specific configurations
CREATE TABLE IF NOT EXISTS agent_instances (
  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  model_name VARCHAR(100) NOT NULL DEFAULT 'deepseek-coder',
  model_version VARCHAR(50),
  fine_tuned BOOLEAN DEFAULT FALSE,
  fine_tune_config JSONB DEFAULT '{}',
  schema_map JSONB DEFAULT '{}', -- linked schema map of codebase
  pattern_rules JSONB DEFAULT '[]', -- discovered codebase patterns as rules
  tools_enabled JSONB DEFAULT '[]', -- array of tool IDs
  services_enabled JSONB DEFAULT '[]', -- array of service IDs
  max_tokens INTEGER DEFAULT 4096,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  status VARCHAR(50) NOT NULL DEFAULT 'initializing',
  endpoint_url VARCHAR(500),
  api_key_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Agent Messages - chat/prompt history
CREATE TABLE IF NOT EXISTS agent_messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  instance_id UUID REFERENCES agent_instances(instance_id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  prompt_template_id UUID, -- reference to prompt template if used
  attachments JSONB DEFAULT '[]',
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- TOOLS, SERVICES & WORKFLOWS
-- ============================================================================

-- Tools - individual capabilities available to agents
CREATE TABLE IF NOT EXISTS agent_tools (
  tool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100), -- database, api, crawler, analytics, etc.
  service_type VARCHAR(100), -- which service this belongs to
  handler_function VARCHAR(255) NOT NULL, -- function/endpoint to call
  input_schema JSONB NOT NULL DEFAULT '{}',
  output_schema JSONB NOT NULL DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  requires_auth BOOLEAN DEFAULT FALSE,
  rate_limit INTEGER, -- calls per minute
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Services - bundles of related tools
CREATE TABLE IF NOT EXISTS agent_services (
  service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100), -- data, ml, web, blockchain, etc.
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Service-Tool Relationships
CREATE TABLE IF NOT EXISTS service_tools (
  service_id UUID REFERENCES agent_services(service_id) ON DELETE CASCADE,
  tool_id UUID REFERENCES agent_tools(tool_id) ON DELETE CASCADE,
  ordering INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  configuration_override JSONB DEFAULT '{}',
  PRIMARY KEY (service_id, tool_id)
);

-- Workflows - orchestrated sequences of services
CREATE TABLE IF NOT EXISTS agent_workflows (
  workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(100) NOT NULL, -- sequential, parallel, dag, conditional
  configuration JSONB NOT NULL DEFAULT '{}',
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  version VARCHAR(50) DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Workflow Steps - individual steps in a workflow
CREATE TABLE IF NOT EXISTS workflow_steps (
  step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  step_type VARCHAR(100) NOT NULL, -- service, tool, condition, loop, etc.
  service_id UUID REFERENCES agent_services(service_id) ON DELETE SET NULL,
  tool_id UUID REFERENCES agent_tools(tool_id) ON DELETE SET NULL,
  ordering INTEGER NOT NULL,
  dependencies JSONB DEFAULT '[]', -- array of step_ids this depends on
  configuration JSONB DEFAULT '{}',
  conditional_logic JSONB DEFAULT '{}',
  retry_policy JSONB DEFAULT '{}',
  timeout_seconds INTEGER DEFAULT 300,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- CAMPAIGNS & DATA STREAMS
-- ============================================================================

-- Campaigns - high-level orchestration of workflows
CREATE TABLE IF NOT EXISTS agent_campaigns (
  campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(100), -- data_mining, seo, analytics, etc.
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, active, paused, completed
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  schedule_config JSONB DEFAULT '{}', -- cron, interval, etc.
  configuration JSONB DEFAULT '{}',
  success_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Campaign Workflows - workflows assigned to campaigns
CREATE TABLE IF NOT EXISTS campaign_workflows (
  campaign_id UUID REFERENCES agent_campaigns(campaign_id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  ordering INTEGER DEFAULT 0,
  trigger_condition JSONB DEFAULT '{}',
  configuration_override JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (campaign_id, workflow_id)
);

-- Data Streams - configurable data collection pipelines
CREATE TABLE IF NOT EXISTS data_streams (
  stream_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES agent_campaigns(campaign_id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stream_type VARCHAR(100), -- web_scraping, api_polling, database_sync, etc.
  source_config JSONB NOT NULL DEFAULT '{}',
  target_config JSONB DEFAULT '{}',
  transformation_rules JSONB DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Attributes - configurable data points for collection and enrichment
CREATE TABLE IF NOT EXISTS stream_attributes (
  attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES data_streams(stream_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data_type VARCHAR(100) NOT NULL, -- string, number, boolean, json, etc.
  extraction_config JSONB NOT NULL DEFAULT '{}', -- xpath, css_selector, regex, etc.
  enrichment_prompt TEXT, -- prompt for AI enrichment
  search_algorithm VARCHAR(100), -- algorithm for finding this attribute
  validation_rules JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT FALSE,
  is_included BOOLEAN DEFAULT TRUE,
  default_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Stream Attribute Data - collected attribute values
CREATE TABLE IF NOT EXISTS stream_attribute_data (
  data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES data_streams(stream_id) ON DELETE CASCADE,
  attribute_id UUID REFERENCES stream_attributes(attribute_id) ON DELETE CASCADE,
  source_url TEXT,
  raw_value TEXT,
  enriched_value TEXT,
  confidence_score DECIMAL(5,4),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  enriched_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- CODEBASE ANALYSIS & PATTERNS
-- ============================================================================

-- Codebase Schema Map - linked schema of code files and relationships
CREATE TABLE IF NOT EXISTS codebase_schema_map (
  schema_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_type VARCHAR(100), -- typescript, javascript, python, etc.
  component_type VARCHAR(100), -- component, service, util, api, etc.
  exports JSONB DEFAULT '[]',
  imports JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  functions JSONB DEFAULT '[]',
  classes JSONB DEFAULT '[]',
  interfaces JSONB DEFAULT '[]',
  patterns_used JSONB DEFAULT '[]',
  last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  analysis_version VARCHAR(50),
  metadata JSONB DEFAULT '{}'
);

-- Codebase Relationships - how files connect
CREATE TABLE IF NOT EXISTS codebase_relationships (
  relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_schema_id UUID REFERENCES codebase_schema_map(schema_id) ON DELETE CASCADE,
  to_schema_id UUID REFERENCES codebase_schema_map(schema_id) ON DELETE CASCADE,
  relationship_type VARCHAR(100), -- imports, extends, implements, calls, etc.
  relationship_data JSONB DEFAULT '{}',
  strength INTEGER DEFAULT 1, -- how strong the connection is
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pattern Rules - discovered coding patterns as rules
CREATE TABLE IF NOT EXISTS pattern_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pattern_type VARCHAR(100), -- architectural, naming, structure, etc.
  rule_definition JSONB NOT NULL DEFAULT '{}',
  examples JSONB DEFAULT '[]',
  applies_to JSONB DEFAULT '[]', -- file types, directories, etc.
  confidence_score DECIMAL(5,4) DEFAULT 0.8,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_validated TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- EXECUTION & MONITORING
-- ============================================================================

-- Agent Executions - track agent task executions
CREATE TABLE IF NOT EXISTS agent_executions (
  execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  instance_id UUID REFERENCES agent_instances(instance_id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES agent_workflows(workflow_id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES agent_campaigns(campaign_id) ON DELETE SET NULL,
  execution_type VARCHAR(100) NOT NULL, -- prompt, workflow, campaign
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  metadata JSONB DEFAULT '{}'
);

-- Execution Logs - detailed logs of executions
CREATE TABLE IF NOT EXISTS execution_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES agent_executions(execution_id) ON DELETE CASCADE,
  log_level VARCHAR(50) NOT NULL, -- debug, info, warning, error
  message TEXT NOT NULL,
  step_name VARCHAR(255),
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_type ON agent_sessions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_instances_session ON agent_instances(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_status ON agent_instances(status);
CREATE INDEX IF NOT EXISTS idx_agent_messages_session ON agent_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created ON agent_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tools_category ON agent_tools(category);
CREATE INDEX IF NOT EXISTS idx_agent_tools_service ON agent_tools(service_type);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_type ON agent_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id, ordering);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON agent_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_data_streams_campaign ON data_streams(campaign_id);
CREATE INDEX IF NOT EXISTS idx_stream_attributes_stream ON stream_attributes(stream_id);
CREATE INDEX IF NOT EXISTS idx_codebase_schema_path ON codebase_schema_map(file_path);
CREATE INDEX IF NOT EXISTS idx_codebase_schema_type ON codebase_schema_map(component_type);
CREATE INDEX IF NOT EXISTS idx_pattern_rules_type ON pattern_rules(pattern_type);
CREATE INDEX IF NOT EXISTS idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution ON execution_logs(execution_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_sessions_updated_at BEFORE UPDATE ON agent_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_tools_updated_at BEFORE UPDATE ON agent_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_services_updated_at BEFORE UPDATE ON agent_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_workflows_updated_at BEFORE UPDATE ON agent_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_campaigns_updated_at BEFORE UPDATE ON agent_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_streams_updated_at BEFORE UPDATE ON data_streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stream_attributes_updated_at BEFORE UPDATE ON stream_attributes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Default Tools and Services
-- ============================================================================

-- Insert default tools
INSERT INTO agent_tools (name, description, category, service_type, handler_function, input_schema, output_schema) VALUES
  ('database_query', 'Execute database queries', 'database', 'data', 'handlers.database.query', '{"query": "string", "params": "array"}', '{"rows": "array", "count": "number"}'),
  ('web_scraper', 'Scrape web pages for data', 'web', 'data', 'handlers.web.scrape', '{"url": "string", "selectors": "object"}', '{"data": "object"}'),
  ('api_caller', 'Make HTTP API calls', 'api', 'integration', 'handlers.api.call', '{"url": "string", "method": "string", "data": "object"}', '{"response": "object"}'),
  ('code_analyzer', 'Analyze codebase patterns', 'analysis', 'ml', 'handlers.analysis.analyze_code', '{"file_path": "string"}', '{"patterns": "array", "metrics": "object"}'),
  ('schema_generator', 'Generate schemas from data', 'ml', 'ml', 'handlers.ml.generate_schema', '{"sample_data": "object"}', '{"schema": "object"}'),
  ('deepseek_prompt', 'Send prompts to DeepSeek', 'ai', 'ml', 'handlers.deepseek.prompt', '{"prompt": "string", "config": "object"}', '{"response": "string"}')
ON CONFLICT (name) DO NOTHING;

-- Insert default services
INSERT INTO agent_services (name, description, category) VALUES
  ('Data Collection', 'Tools for collecting data from various sources', 'data'),
  ('ML & AI', 'Machine learning and AI tools', 'ml'),
  ('Integration', 'API and system integration tools', 'integration'),
  ('Analysis', 'Code and data analysis tools', 'analysis')
ON CONFLICT (name) DO NOTHING;

-- Link tools to services
INSERT INTO service_tools (service_id, tool_id, ordering)
SELECT s.service_id, t.tool_id, 1
FROM agent_services s, agent_tools t
WHERE s.name = 'Data Collection' AND t.name IN ('database_query', 'web_scraper')
ON CONFLICT DO NOTHING;

INSERT INTO service_tools (service_id, tool_id, ordering)
SELECT s.service_id, t.tool_id, 1
FROM agent_services s, agent_tools t
WHERE s.name = 'ML & AI' AND t.name IN ('deepseek_prompt', 'schema_generator')
ON CONFLICT DO NOTHING;

INSERT INTO service_tools (service_id, tool_id, ordering)
SELECT s.service_id, t.tool_id, 1
FROM agent_services s, agent_tools t
WHERE s.name = 'Integration' AND t.name = 'api_caller'
ON CONFLICT DO NOTHING;

INSERT INTO service_tools (service_id, tool_id, ordering)
SELECT s.service_id, t.tool_id, 1
FROM agent_services s, agent_tools t
WHERE s.name = 'Analysis' AND t.name = 'code_analyzer'
ON CONFLICT DO NOTHING;
