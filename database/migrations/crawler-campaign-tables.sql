/**
 * Database Migration: Crawler Campaign Tables
 * 
 * Creates tables for managing crawler campaigns, instances, and schedules
 */

-- Crawler Campaigns Table
CREATE TABLE IF NOT EXISTS crawler_campaigns (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_site_url VARCHAR(500) NOT NULL,
  prompt TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'created',
  
  -- Configuration stored as JSONB
  workflow JSONB,
  seeds JSONB,
  schema JSONB,
  configuration JSONB NOT NULL,
  schedule JSONB,
  
  -- Analytics
  analytics JSONB DEFAULT '{"totalPages": 0, "pagesProcessed": 0, "errorCount": 0, "successRate": 100}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  stopped_at TIMESTAMP,
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON crawler_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_url ON crawler_campaigns(client_site_url);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON crawler_campaigns(created_at);

-- Crawler Instances Table
CREATE TABLE IF NOT EXISTS crawler_instances (
  id VARCHAR(255) PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL,
  crawler_index INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'initializing',
  
  -- Queue and processing info
  queue JSONB DEFAULT '[]',
  processed INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  
  -- Configuration
  configuration JSONB NOT NULL,
  
  -- Performance metrics
  pages_per_second DECIMAL(10, 2) DEFAULT 0,
  average_response_time INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  stopped_at TIMESTAMP,
  last_activity TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_instances_campaign ON crawler_instances(campaign_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON crawler_instances(status);

-- Crawler Schedules Table
CREATE TABLE IF NOT EXISTS crawler_schedules (
  id VARCHAR(255) PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL,
  
  -- Schedule configuration
  frequency VARCHAR(50) NOT NULL,
  time VARCHAR(10),
  enabled BOOLEAN DEFAULT true,
  
  -- Execution tracking
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  execution_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_schedules_campaign ON crawler_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_schedules_enabled ON crawler_schedules(enabled);
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON crawler_schedules(next_run);

-- Crawl Targets Table (URLs to be crawled)
CREATE TABLE IF NOT EXISTS crawl_targets (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL,
  crawler_id VARCHAR(255),
  
  -- URL information
  url VARCHAR(2048) NOT NULL,
  domain VARCHAR(255),
  category VARCHAR(100),
  priority INTEGER DEFAULT 5,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  
  -- Results
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  
  -- Schema data
  schema_key VARCHAR(100),
  extracted_data JSONB,
  
  -- Timestamps
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  crawled_at TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (crawler_id) REFERENCES crawler_instances(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_targets_campaign ON crawl_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_targets_crawler ON crawl_targets(crawler_id);
CREATE INDEX IF NOT EXISTS idx_targets_url ON crawl_targets(url(255));
CREATE INDEX IF NOT EXISTS idx_targets_status ON crawl_targets(status);
CREATE INDEX IF NOT EXISTS idx_targets_priority ON crawl_targets(priority);
CREATE INDEX IF NOT EXISTS idx_targets_campaign_status ON crawl_targets(campaign_id, status);

-- Crawler Schemas Table (Data extraction schemas)
CREATE TABLE IF NOT EXISTS crawler_schemas (
  id SERIAL PRIMARY KEY,
  schema_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  
  -- Schema definition
  attributes JSONB NOT NULL,
  linked_schemas JSONB,
  indexes JSONB,
  triggers JSONB,
  
  -- Metadata
  purpose TEXT,
  created_by VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schemas_name ON crawler_schemas(schema_name);

-- Workflow Pipelines Table
CREATE TABLE IF NOT EXISTS workflow_pipelines (
  id SERIAL PRIMARY KEY,
  pipeline_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Pipeline configuration
  stages JSONB NOT NULL,
  function_calls JSONB,
  
  -- Status and execution
  status VARCHAR(50) DEFAULT 'active',
  execution_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_executed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipelines_name ON workflow_pipelines(pipeline_name);
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON workflow_pipelines(status);

-- Campaign Analytics Table (Historical data)
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL,
  
  -- Metrics snapshot
  total_pages INTEGER DEFAULT 0,
  pages_processed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 100,
  average_response_time INTEGER DEFAULT 0,
  space_saved BIGINT DEFAULT 0,
  tokens_earned DECIMAL(20, 8) DEFAULT 0,
  
  -- Active resources
  active_crawlers INTEGER DEFAULT 0,
  queue_size INTEGER DEFAULT 0,
  
  -- Timestamp
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded ON campaign_analytics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign_recorded ON campaign_analytics(campaign_id, recorded_at DESC);

-- Comments
COMMENT ON TABLE crawler_campaigns IS 'Manages crawler campaign configurations and lifecycle';
COMMENT ON TABLE crawler_instances IS 'Tracks individual crawler instances within campaigns';
COMMENT ON TABLE crawler_schedules IS 'Manages automated campaign execution schedules';
COMMENT ON TABLE crawl_targets IS 'URLs to be crawled with status tracking';
COMMENT ON TABLE crawler_schemas IS 'Data extraction schema definitions';
COMMENT ON TABLE workflow_pipelines IS 'Workflow pipeline configurations for linked schemas';
COMMENT ON TABLE campaign_analytics IS 'Historical analytics data for campaigns';
