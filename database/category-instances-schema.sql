-- Category Instances Schema for LightDom
-- Hierarchical service creation system for managing application components
-- Created: 2025-11-14

-- ============================================================================
-- CATEGORY INSTANCE TABLES
-- ============================================================================

-- Table: apps
-- Purpose: Top-level application container
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'archived')),
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["status"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);

-- Table: campaigns (extends existing if needed, or creates new)
-- Purpose: Campaign management - can run multiple workflows
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  campaign_type VARCHAR(100),
  config JSONB DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP,
  completed_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["status", "campaign_type"], "use_cases": ["start", "pause", "resume", "complete"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_campaigns_app ON campaigns(app_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Table: service_instances
-- Purpose: Named service instances with API function exposure
CREATE TABLE IF NOT EXISTS service_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(100) NOT NULL,
  instance_config JSONB DEFAULT '{}',
  api_functions JSONB DEFAULT '[]', -- Array of exposed API function definitions
  endpoint_base VARCHAR(500),
  status VARCHAR(50) DEFAULT 'stopped' CHECK (status IN ('stopped', 'starting', 'running', 'stopping', 'error', 'maintenance')),
  port INTEGER,
  health_check_config JSONB,
  last_health_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["service_type", "status"], "use_cases": ["start", "stop", "restart", "health_check", "call_function"]}'::jsonb,
  
  UNIQUE(app_id, name)
);

CREATE INDEX IF NOT EXISTS idx_service_instances_app ON service_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_service_instances_campaign ON service_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_service_instances_type ON service_instances(service_type);
CREATE INDEX IF NOT EXISTS idx_service_instances_status ON service_instances(status);

-- Table: workflow_instances (extends existing workflows table concept)
-- Purpose: Workflow definitions that include data streams
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  service_instance_id UUID REFERENCES service_instances(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(100),
  trigger_config JSONB,
  steps JSONB DEFAULT '[]',
  data_stream_ids UUID[], -- Array of data stream IDs
  variables JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["workflow_type", "status"], "use_cases": ["execute", "pause", "resume", "validate"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_campaign ON workflow_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_service ON workflow_instances(service_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);

-- Table: seed_instances
-- Purpose: URL and data seeding configuration
CREATE TABLE IF NOT EXISTS seed_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  seed_type VARCHAR(100) NOT NULL,
  seed_value TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'failed', 'archived')),
  parent_seed_id UUID REFERENCES seed_instances(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["seed_value", "description"], "filter_fields": ["seed_type", "status", "priority"], "use_cases": ["activate", "deactivate", "test"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_seed_instances_app ON seed_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_seed_instances_campaign ON seed_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_seed_instances_type ON seed_instances(seed_type);
CREATE INDEX IF NOT EXISTS idx_seed_instances_status ON seed_instances(status);

-- Table: crawler_instances
-- Purpose: Web crawler job configuration
CREATE TABLE IF NOT EXISTS crawler_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  crawler_type VARCHAR(100) DEFAULT 'puppeteer',
  target_config JSONB NOT NULL, -- URLs, selectors, etc.
  extraction_rules JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'paused', 'completed', 'failed', 'error')),
  concurrency INTEGER DEFAULT 1,
  schedule_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  total_runs INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["crawler_type", "status"], "use_cases": ["start", "stop", "pause", "resume", "results"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crawler_instances_app ON crawler_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_crawler_instances_campaign ON crawler_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crawler_instances_workflow ON crawler_instances(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_crawler_instances_status ON crawler_instances(status);

-- Table: scheduler_instances
-- Purpose: Job scheduling and cron management
CREATE TABLE IF NOT EXISTS scheduler_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schedule_type VARCHAR(100) DEFAULT 'cron', -- cron, interval, once
  schedule_expression VARCHAR(255), -- Cron expression or interval
  target_entity_type VARCHAR(100), -- What to schedule: workflow, crawler, datamining, etc.
  target_entity_id UUID,
  payload JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'paused', 'expired', 'error')),
  timezone VARCHAR(100) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  total_runs INTEGER DEFAULT 0,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["schedule_type", "status", "target_entity_type"], "use_cases": ["activate", "deactivate", "run_now", "update_schedule"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_scheduler_instances_app ON scheduler_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_scheduler_instances_status ON scheduler_instances(status);
CREATE INDEX IF NOT EXISTS idx_scheduler_instances_next_run ON scheduler_instances(next_run_at);

-- Table: neural_network_instances
-- Purpose: TensorFlow/neural network model management
CREATE TABLE IF NOT EXISTS neural_network_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type VARCHAR(100),
  architecture JSONB, -- Model architecture definition
  training_config JSONB,
  model_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'untrained' CHECK (status IN ('untrained', 'training', 'trained', 'deployed', 'error')),
  accuracy DECIMAL(5,2),
  loss DECIMAL(10,4),
  epochs_trained INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_trained_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["model_type", "status"], "use_cases": ["train", "predict", "evaluate", "deploy"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_neural_network_instances_app ON neural_network_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_neural_network_instances_campaign ON neural_network_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_neural_network_instances_status ON neural_network_instances(status);

-- Table: data_mining_instances
-- Purpose: Data extraction and mining job configuration
CREATE TABLE IF NOT EXISTS data_mining_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  job_name VARCHAR(255) NOT NULL,
  description TEXT,
  target_type VARCHAR(100),
  target_config JSONB,
  mining_strategy VARCHAR(100),
  extraction_rules JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'scheduled')),
  priority INTEGER DEFAULT 5,
  schedule_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  total_runs INTEGER DEFAULT 0,
  records_extracted INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["job_name", "description"], "filter_fields": ["status", "target_type", "priority"], "use_cases": ["execute", "schedule", "results", "export"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_mining_instances_app ON data_mining_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_data_mining_instances_campaign ON data_mining_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_data_mining_instances_workflow ON data_mining_instances(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_data_mining_instances_status ON data_mining_instances(status);

-- Table: data_stream_instances
-- Purpose: Data flow configuration between services
CREATE TABLE IF NOT EXISTS data_stream_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(100),
  source_config JSONB,
  destination_type VARCHAR(100),
  destination_config JSONB,
  transformation_rules JSONB DEFAULT '[]',
  attribute_ids UUID[], -- Array of attribute IDs used in this stream
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'paused', 'error')),
  data_format VARCHAR(50),
  throughput_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_records_processed BIGINT DEFAULT 0,
  last_processed_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["status", "source_type", "destination_type"], "use_cases": ["start", "stop", "pause", "metrics"]}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_stream_instances_workflow ON data_stream_instances(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_data_stream_instances_status ON data_stream_instances(status);

-- Table: attribute_instances
-- Purpose: Metadata attribute definitions bundled in data streams
CREATE TABLE IF NOT EXISTS attribute_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(50),
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}',
  display_config JSONB DEFAULT '{}',
  data_stream_ids UUID[], -- Which data streams use this attribute
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["entity_type", "attribute_name"], "filter_fields": ["entity_type", "attribute_type", "is_required"], "use_cases": ["validate", "transform"]}'::jsonb,
  
  UNIQUE(app_id, entity_type, attribute_name)
);

CREATE INDEX IF NOT EXISTS idx_attribute_instances_app ON attribute_instances(app_id);
CREATE INDEX IF NOT EXISTS idx_attribute_instances_entity ON attribute_instances(entity_type);

-- ============================================================================
-- RELATIONSHIP TRACKING TABLE
-- ============================================================================

-- Table: category_relationships
-- Purpose: Track relationships between different category instances
CREATE TABLE IF NOT EXISTS category_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_category VARCHAR(100) NOT NULL,
  parent_id UUID NOT NULL,
  child_category VARCHAR(100) NOT NULL,
  child_id UUID NOT NULL,
  relationship_type VARCHAR(100), -- belongs_to, has_many, uses, contains, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(parent_category, parent_id, child_category, child_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_category_relationships_parent ON category_relationships(parent_category, parent_id);
CREATE INDEX IF NOT EXISTS idx_category_relationships_child ON category_relationships(child_category, child_id);

-- ============================================================================
-- INSTANCE EXECUTION HISTORY
-- ============================================================================

-- Table: instance_execution_history
-- Purpose: Track execution history for all executable instances
CREATE TABLE IF NOT EXISTS instance_execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_category VARCHAR(100) NOT NULL,
  instance_id UUID NOT NULL,
  execution_type VARCHAR(100), -- start, stop, execute, train, etc.
  status VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  input_params JSONB,
  output_result JSONB,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_instance_execution_history_instance ON instance_execution_history(instance_category, instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_execution_history_started ON instance_execution_history(started_at);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE apps IS 'Top-level application containers';
COMMENT ON TABLE campaigns IS 'Campaign instances that can run multiple workflows';
COMMENT ON TABLE service_instances IS 'Named service instances with exposed API functions';
COMMENT ON TABLE workflow_instances IS 'Workflow definitions that include data streams';
COMMENT ON TABLE seed_instances IS 'URL and data seeding configuration';
COMMENT ON TABLE crawler_instances IS 'Web crawler job configuration';
COMMENT ON TABLE scheduler_instances IS 'Job scheduling and cron management';
COMMENT ON TABLE neural_network_instances IS 'TensorFlow/neural network model instances';
COMMENT ON TABLE data_mining_instances IS 'Data extraction and mining jobs';
COMMENT ON TABLE data_stream_instances IS 'Data flow between services with attributes';
COMMENT ON TABLE attribute_instances IS 'Metadata attributes bundled in data streams';
COMMENT ON TABLE category_relationships IS 'Relationships between category instances';
COMMENT ON TABLE instance_execution_history IS 'Execution history for all instances';
