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

-- Crawler Clusters Table (Group crawlers together for coordinated operations)
CREATE TABLE IF NOT EXISTS crawler_clusters (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reason TEXT,
  
  -- Cluster configuration
  strategy VARCHAR(50) DEFAULT 'load-balanced',
  max_crawlers INTEGER DEFAULT 10,
  auto_scale BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clusters_status ON crawler_clusters(status);
CREATE INDEX IF NOT EXISTS idx_clusters_name ON crawler_clusters(name);

-- Cluster Membership Table (Many-to-many relationship between campaigns and clusters)
CREATE TABLE IF NOT EXISTS cluster_campaigns (
  id SERIAL PRIMARY KEY,
  cluster_id VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(255) NOT NULL,
  
  -- Membership metadata
  priority INTEGER DEFAULT 5,
  role VARCHAR(100),
  
  -- Timestamps
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cluster_id) REFERENCES crawler_clusters(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  
  UNIQUE(cluster_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_cluster_campaigns_cluster ON cluster_campaigns(cluster_id);
CREATE INDEX IF NOT EXISTS idx_cluster_campaigns_campaign ON cluster_campaigns(campaign_id);

-- Seeding Services Table (Services that collect URLs for crawling)
CREATE TABLE IF NOT EXISTS seeding_services (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Configuration
  config JSONB NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  enabled BOOLEAN DEFAULT true,
  
  -- Statistics
  urls_collected INTEGER DEFAULT 0,
  last_run_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seeding_services_type ON seeding_services(type);
CREATE INDEX IF NOT EXISTS idx_seeding_services_status ON seeding_services(status);

-- Seeding Service Assignments (Connect campaigns to seeding services)
CREATE TABLE IF NOT EXISTS campaign_seeding_services (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(255) NOT NULL,
  seeding_service_id VARCHAR(255) NOT NULL,
  
  -- Configuration overrides
  config_overrides JSONB,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  
  -- Statistics
  urls_added INTEGER DEFAULT 0,
  last_execution TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (seeding_service_id) REFERENCES seeding_services(id) ON DELETE CASCADE,
  
  UNIQUE(campaign_id, seeding_service_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_seeding_campaign ON campaign_seeding_services(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_seeding_service ON campaign_seeding_services(seeding_service_id);

-- Collected Seeds Table (URLs collected by seeding services)
CREATE TABLE IF NOT EXISTS collected_seeds (
  id SERIAL PRIMARY KEY,
  seeding_service_id VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(255),
  
  -- URL information
  url VARCHAR(2048) NOT NULL,
  source VARCHAR(255),
  method VARCHAR(100),
  
  -- Metadata
  priority INTEGER DEFAULT 5,
  metadata JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  used BOOLEAN DEFAULT false,
  
  -- Timestamps
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  
  FOREIGN KEY (seeding_service_id) REFERENCES seeding_services(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_collected_seeds_service ON collected_seeds(seeding_service_id);
CREATE INDEX IF NOT EXISTS idx_collected_seeds_campaign ON collected_seeds(campaign_id);
CREATE INDEX IF NOT EXISTS idx_collected_seeds_status ON collected_seeds(status);
CREATE INDEX IF NOT EXISTS idx_collected_seeds_url ON collected_seeds(url(255));

-- Comments
COMMENT ON TABLE crawler_campaigns IS 'Manages crawler campaign configurations and lifecycle';
COMMENT ON TABLE crawler_instances IS 'Tracks individual crawler instances within campaigns';
COMMENT ON TABLE crawler_schedules IS 'Manages automated campaign execution schedules';
COMMENT ON TABLE crawl_targets IS 'URLs to be crawled with status tracking';
COMMENT ON TABLE crawler_schemas IS 'Data extraction schema definitions';
COMMENT ON TABLE workflow_pipelines IS 'Workflow pipeline configurations for linked schemas';
COMMENT ON TABLE campaign_analytics IS 'Historical analytics data for campaigns';
COMMENT ON TABLE crawler_clusters IS 'Groups campaigns together for coordinated crawling operations';
COMMENT ON TABLE cluster_campaigns IS 'Links campaigns to clusters with priority and role information';
COMMENT ON TABLE seeding_services IS 'Services that collect URLs from sitemaps and other sources';
COMMENT ON TABLE campaign_seeding_services IS 'Connects campaigns to seeding services with configuration';
COMMENT ON TABLE collected_seeds IS 'URLs collected by seeding services ready for crawling';
