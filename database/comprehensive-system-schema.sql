-- Comprehensive System Schema for LightDom
-- All core tables with attribute metadata for auto-generating CRUD and use-case APIs
-- Created: 2025-11-06

-- ============================================================================
-- CORE SYSTEM TABLES
-- ============================================================================

-- Table: workflows
-- Purpose: Store workflow definitions for automation
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  workflow_type VARCHAR(100),
  trigger_config JSONB,
  steps JSONB,
  variables JSONB,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,
  
  -- Metadata for auto-generation
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["status", "workflow_type", "is_active"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);

-- Table: services
-- Purpose: Microservice configuration and management
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  service_type VARCHAR(100),
  endpoint_url VARCHAR(500),
  config JSONB,
  health_check_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'stopped',
  port INTEGER,
  environment VARCHAR(50) DEFAULT 'development',
  dependencies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_health_check TIMESTAMP,
  uptime_percentage DECIMAL(5,2),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["service_type", "status", "environment"], "use_cases": ["health_check", "restart", "logs"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_services_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_env ON services(environment);

-- Table: data_streams
-- Purpose: Manage data flow between services
CREATE TABLE IF NOT EXISTS data_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(100),
  source_config JSONB,
  destination_type VARCHAR(100),
  destination_config JSONB,
  transformation_rules JSONB,
  status VARCHAR(50) DEFAULT 'inactive',
  data_format VARCHAR(50),
  throughput_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_records_processed BIGINT DEFAULT 0,
  last_processed_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["status", "source_type", "destination_type"], "use_cases": ["start_stream", "stop_stream", "metrics"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_streams_status ON data_streams(status);
CREATE INDEX IF NOT EXISTS idx_data_streams_source ON data_streams(source_type);

-- Table: attributes
-- Purpose: Define metadata attributes for other entities
CREATE TABLE IF NOT EXISTS attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(50),
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  validation_rules JSONB,
  display_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["entity_type", "attribute_name"], "filter_fields": ["entity_type", "attribute_type", "is_required"]}'::jsonb,
  
  UNIQUE(entity_type, attribute_name)
);

CREATE INDEX IF NOT EXISTS idx_attributes_entity ON attributes(entity_type);

-- Table: datamining
-- Purpose: Data mining job configuration
CREATE TABLE IF NOT EXISTS datamining (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(255) NOT NULL,
  description TEXT,
  target_type VARCHAR(100),
  target_config JSONB,
  mining_strategy VARCHAR(100),
  extraction_rules JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  schedule_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  total_runs INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["job_name", "description"], "filter_fields": ["status", "target_type", "priority"], "use_cases": ["execute_job", "schedule", "results"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_datamining_status ON datamining(status);
CREATE INDEX IF NOT EXISTS idx_datamining_next_run ON datamining(next_run_at);

-- Table: seeding
-- Purpose: URL and data seeding for crawlers
CREATE TABLE IF NOT EXISTS seeding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_type VARCHAR(100) NOT NULL,
  seed_value TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 5,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  parent_seed_id UUID REFERENCES seeding(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["seed_value", "description"], "filter_fields": ["seed_type", "status", "priority"], "use_cases": ["validate", "discover_related"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_seeding_type ON seeding(seed_type);
CREATE INDEX IF NOT EXISTS idx_seeding_status ON seeding(status);
CREATE INDEX IF NOT EXISTS idx_seeding_priority ON seeding(priority);

-- Table: seo
-- Purpose: SEO analysis and optimization data
CREATE TABLE IF NOT EXISTS seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(1000) NOT NULL,
  title TEXT,
  description TEXT,
  keywords JSONB,
  score INTEGER,
  issues JSONB,
  recommendations JSONB,
  meta_tags JSONB,
  performance_metrics JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  last_crawled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["url", "title"], "filter_fields": ["score"], "use_cases": ["analyze", "optimize", "compare"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_seo_url ON seo(url);
CREATE INDEX IF NOT EXISTS idx_seo_score ON seo(score);

-- Table: users
-- Purpose: User management and authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["username", "email", "full_name"], "filter_fields": ["role", "status"], "use_cases": ["authenticate", "change_password", "permissions"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Table: tasks
-- Purpose: Task queue and execution tracking
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  assigned_to UUID REFERENCES users(id),
  workflow_id UUID REFERENCES workflows(id),
  input_data JSONB,
  output_data JSONB,
  error_details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["title", "description"], "filter_fields": ["task_type", "status", "priority"], "use_cases": ["execute", "retry", "cancel"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow ON tasks(workflow_id);

-- Table: agents (extends the existing agent_instances)
-- Purpose: AI agent management
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  agent_type VARCHAR(100),
  description TEXT,
  configuration JSONB,
  capabilities JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'inactive',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP,
  performance_score DECIMAL(5,2),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["agent_type", "status"], "use_cases": ["activate", "execute", "train"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Table: schemas
-- Purpose: Schema definitions for dynamic entities
CREATE TABLE IF NOT EXISTS schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_name VARCHAR(255) NOT NULL UNIQUE,
  version VARCHAR(50) DEFAULT '1.0.0',
  description TEXT,
  entity_type VARCHAR(100),
  fields JSONB NOT NULL,
  validation_rules JSONB,
  relationships JSONB,
  ui_config JSONB,
  api_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["schema_name", "description"], "filter_fields": ["entity_type", "is_active"], "use_cases": ["generate_api", "generate_ui", "validate"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_schemas_name ON schemas(schema_name);
CREATE INDEX IF NOT EXISTS idx_schemas_entity ON schemas(entity_type);

-- Table: configs
-- Purpose: System configuration management
CREATE TABLE IF NOT EXISTS configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(255) NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_sensitive BOOLEAN DEFAULT false,
  environment VARCHAR(50) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["config_key", "description"], "filter_fields": ["category", "environment"], "use_cases": ["get_by_key", "update_value", "backup"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_configs_key ON configs(config_key);
CREATE INDEX IF NOT EXISTS idx_configs_category ON configs(category);

-- ============================================================================
-- RELATIONSHIP TABLES
-- ============================================================================

-- Table: schema_relationships
-- Purpose: Define relationships between schemas for auto-generating linked APIs
CREATE TABLE IF NOT EXISTS schema_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
  target_schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL, -- one-to-one, one-to-many, many-to-many
  relationship_name VARCHAR(255) NOT NULL,
  source_field VARCHAR(255),
  target_field VARCHAR(255),
  cascade_rules JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_schema_rel_source ON schema_relationships(source_schema_id);
CREATE INDEX IF NOT EXISTS idx_schema_rel_target ON schema_relationships(target_schema_id);

-- Table: entity_attributes
-- Purpose: Link attributes to entities dynamically
CREATE TABLE IF NOT EXISTS entity_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
  attribute_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true}'::jsonb,
  
  UNIQUE(entity_type, entity_id, attribute_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_attr_type ON entity_attributes(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_attr_id ON entity_attributes(entity_id);

-- ============================================================================
-- API GENERATION METADATA TABLE
-- ============================================================================

-- Table: api_definitions
-- Purpose: Store auto-generated API configurations
CREATE TABLE IF NOT EXISTS api_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(255) NOT NULL,
  api_path VARCHAR(500) NOT NULL UNIQUE,
  http_methods JSONB DEFAULT '["GET", "POST", "PUT", "DELETE"]'::jsonb,
  crud_operations JSONB,
  use_case_operations JSONB,
  authentication_required BOOLEAN DEFAULT true,
  rate_limit_config JSONB,
  validation_schema JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_api_def_table ON api_definitions(table_name);
CREATE INDEX IF NOT EXISTS idx_api_def_path ON api_definitions(api_path);

-- ============================================================================
-- SEED DATA FOR CRITICAL TABLES
-- ============================================================================

-- Insert default admin user
INSERT INTO users (id, username, email, password_hash, full_name, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@lightdom.local',
  '$2b$10$placeholder', -- In production, use properly hashed password
  'System Administrator',
  'admin',
  'active'
) ON CONFLICT (username) DO NOTHING;

-- Insert default system configs
INSERT INTO configs (config_key, config_value, description, category, environment)
VALUES 
  ('system.blockchain.enabled', 'true', 'Enable blockchain integration', 'blockchain', 'all'),
  ('system.blockchain.network', '"local"', 'Blockchain network to use', 'blockchain', 'all'),
  ('system.blockchain.port', '8545', 'Blockchain node port', 'blockchain', 'all'),
  ('api.auto_generate.enabled', 'true', 'Enable auto-generation of CRUD APIs', 'api', 'all'),
  ('api.auto_generate.include_use_cases', 'true', 'Generate use-case specific endpoints', 'api', 'all')
ON CONFLICT (config_key) DO NOTHING;

-- Insert base schemas for core entities
INSERT INTO schemas (schema_name, entity_type, fields, api_config)
VALUES
  (
    'workflow_schema',
    'workflows',
    '{"name": {"type": "string", "required": true}, "status": {"type": "string", "enum": ["draft", "active", "paused", "completed"]}, "steps": {"type": "array"}}'::jsonb,
    '{"auto_crud": true, "use_cases": ["execute", "pause", "resume"]}'::jsonb
  ),
  (
    'service_schema',
    'services',
    '{"name": {"type": "string", "required": true}, "endpoint_url": {"type": "string"}, "status": {"type": "string"}}'::jsonb,
    '{"auto_crud": true, "use_cases": ["health_check", "restart", "logs"]}'::jsonb
  )
ON CONFLICT (schema_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE workflows IS 'Workflow definitions with auto-generated CRUD and use-case APIs';
COMMENT ON TABLE services IS 'Microservice configurations with health check and management APIs';
COMMENT ON TABLE data_streams IS 'Data pipeline configurations with streaming APIs';
COMMENT ON TABLE attributes IS 'Metadata attribute definitions for dynamic entity configuration';
COMMENT ON TABLE datamining IS 'Data mining job definitions with execution APIs';
COMMENT ON TABLE seeding IS 'URL and data seeds with validation and discovery APIs';
COMMENT ON TABLE seo IS 'SEO analysis data with optimization APIs';
COMMENT ON TABLE users IS 'User management with authentication APIs';
COMMENT ON TABLE tasks IS 'Task queue with execution and retry APIs';
COMMENT ON TABLE agents IS 'AI agent definitions with activation and training APIs';
COMMENT ON TABLE schemas IS 'Schema definitions for auto-generating APIs and UIs';
COMMENT ON TABLE configs IS 'System configuration with versioning';
COMMENT ON TABLE schema_relationships IS 'Schema relationship definitions for linked API generation';
COMMENT ON TABLE api_definitions IS 'Auto-generated API configuration metadata';

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
