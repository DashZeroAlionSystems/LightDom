-- Migration: Create campaign orchestration and attribute-based mining tables
-- Description: Add comprehensive tables for research-driven campaigns with attribute discovery
-- Created: 2025-11-04

-- Research instances - tracks deep-dive wiki/schema research campaigns
CREATE TABLE IF NOT EXISTS research_instances (
    id SERIAL PRIMARY KEY,
    research_id VARCHAR(255) UNIQUE NOT NULL,
    topic TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'initializing',
    -- Status: initializing, researching, analyzing, completed, failed
    research_depth VARCHAR(50) DEFAULT 'deep',
    -- Depth: shallow, medium, deep, comprehensive
    discovered_schemas JSONB DEFAULT '[]',
    wiki_links JSONB DEFAULT '[]',
    knowledge_graph JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Attribute definitions - stores discovered attributes with mining algorithms
CREATE TABLE IF NOT EXISTS attribute_definitions (
    id SERIAL PRIMARY KEY,
    attribute_id VARCHAR(255) UNIQUE NOT NULL,
    research_id VARCHAR(255) REFERENCES research_instances(research_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    -- Category: content, metadata, structure, behavior, performance, seo, etc.
    description TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    -- Data type: string, number, boolean, date, array, object, url, image
    selector_strategy JSONB DEFAULT '{}',
    -- CSS selectors, XPath, or extraction patterns
    mining_algorithm VARCHAR(100) DEFAULT 'dom_extraction',
    -- Algorithm: dom_extraction, api_fetch, computed, derived, ml_inference
    validation_rules JSONB DEFAULT '{}',
    transformation_function TEXT,
    priority INTEGER DEFAULT 5,
    is_required BOOLEAN DEFAULT FALSE,
    configurable_options JSONB DEFAULT '[]',
    -- List of user-configurable options for this attribute
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data mining instances - manages mining operations with configurable attributes
CREATE TABLE IF NOT EXISTS data_mining_instances (
    id SERIAL PRIMARY KEY,
    mining_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    research_id VARCHAR(255) REFERENCES research_instances(research_id),
    status VARCHAR(50) DEFAULT 'configuring',
    -- Status: configuring, queued, running, paused, completed, failed
    target_urls JSONB DEFAULT '[]',
    enabled_attributes JSONB DEFAULT '[]',
    -- Array of attribute_ids that are enabled for this instance
    attribute_config JSONB DEFAULT '{}',
    -- Per-attribute configuration overrides
    schedule JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 5,
    max_depth INTEGER DEFAULT 3,
    max_urls INTEGER DEFAULT 100,
    rate_limit_ms INTEGER DEFAULT 1000,
    results_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Seeding instances - manages URL seeding, backlinking, and competitor scraping
CREATE TABLE IF NOT EXISTS seeding_instances (
    id SERIAL PRIMARY KEY,
    seeding_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mining_id VARCHAR(255) REFERENCES data_mining_instances(mining_id) ON DELETE CASCADE,
    seeding_strategy VARCHAR(100) DEFAULT 'manual',
    -- Strategy: manual, sitemap, backlink_discovery, competitor_analysis, search_engine
    seed_urls JSONB DEFAULT '[]',
    discovered_urls JSONB DEFAULT '[]',
    backlink_sources JSONB DEFAULT '[]',
    competitor_sites JSONB DEFAULT '[]',
    url_filters JSONB DEFAULT '{}',
    -- Include/exclude patterns
    priority_rules JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'pending',
    discovered_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow instances - links data mining to workflow execution
CREATE TABLE IF NOT EXISTS workflow_instances (
    id SERIAL PRIMARY KEY,
    workflow_instance_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflows(workflow_id),
    mining_id VARCHAR(255) REFERENCES data_mining_instances(mining_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'created',
    configuration JSONB DEFAULT '{}',
    execution_count INTEGER DEFAULT 0,
    last_execution_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service instances - manages service connections and integrations
CREATE TABLE IF NOT EXISTS service_instances (
    id SERIAL PRIMARY KEY,
    service_instance_id VARCHAR(255) UNIQUE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    -- Type: crawler, api, storage, analytics, notification, integration
    mining_id VARCHAR(255) REFERENCES data_mining_instances(mining_id),
    name VARCHAR(255) NOT NULL,
    endpoint_url TEXT,
    configuration JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    -- Encrypted credentials
    status VARCHAR(50) DEFAULT 'inactive',
    health_check_url TEXT,
    last_health_check TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API instances - manages external API connections for data mining
CREATE TABLE IF NOT EXISTS api_instances (
    id SERIAL PRIMARY KEY,
    api_instance_id VARCHAR(255) UNIQUE NOT NULL,
    mining_id VARCHAR(255) REFERENCES data_mining_instances(mining_id),
    api_name VARCHAR(255) NOT NULL,
    api_type VARCHAR(100) DEFAULT 'rest',
    -- Type: rest, graphql, soap, grpc
    base_url TEXT NOT NULL,
    authentication JSONB DEFAULT '{}',
    -- Auth config: type, credentials, tokens
    endpoints JSONB DEFAULT '[]',
    -- Available endpoints and their mappings
    rate_limits JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'configured',
    request_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign orchestration - coordinates all instances in a complete campaign
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    -- Original prompt that initiated the campaign
    status VARCHAR(50) DEFAULT 'initializing',
    -- Status: initializing, researching, configuring, ready, running, paused, completed, failed
    research_id VARCHAR(255) REFERENCES research_instances(research_id),
    mining_id VARCHAR(255) REFERENCES data_mining_instances(mining_id),
    seeding_id VARCHAR(255) REFERENCES seeding_instances(seeding_id),
    workflow_instance_id VARCHAR(255) REFERENCES workflow_instances(workflow_instance_id),
    linked_services JSONB DEFAULT '[]',
    -- Array of service_instance_ids
    linked_apis JSONB DEFAULT '[]',
    -- Array of api_instance_ids
    configuration JSONB DEFAULT '{}',
    progress JSONB DEFAULT '{}',
    -- Track progress of each phase
    metrics JSONB DEFAULT '{}',
    -- Campaign-level metrics and analytics
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Attribute mining tasks - queued tasks for mining specific attributes
CREATE TABLE IF NOT EXISTS attribute_mining_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    mining_id VARCHAR(255) REFERENCES data_mining_instances(mining_id) ON DELETE CASCADE,
    attribute_id VARCHAR(255) REFERENCES attribute_definitions(attribute_id),
    target_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'queued',
    -- Status: queued, processing, completed, failed, skipped
    priority INTEGER DEFAULT 5,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    extracted_data JSONB,
    error TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Campaign execution log - detailed audit trail
CREATE TABLE IF NOT EXISTS campaign_execution_log (
    id SERIAL PRIMARY KEY,
    log_id VARCHAR(255) UNIQUE NOT NULL,
    campaign_id VARCHAR(255) REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    -- Type: phase_started, phase_completed, instance_created, task_queued, error, etc.
    event_data JSONB DEFAULT '{}',
    severity VARCHAR(50) DEFAULT 'info',
    -- Severity: debug, info, warning, error, critical
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_instances_status ON research_instances(status);
CREATE INDEX IF NOT EXISTS idx_research_instances_topic ON research_instances USING gin(to_tsvector('english', topic));
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_research ON attribute_definitions(research_id);
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_category ON attribute_definitions(category);
CREATE INDEX IF NOT EXISTS idx_data_mining_instances_status ON data_mining_instances(status);
CREATE INDEX IF NOT EXISTS idx_data_mining_instances_research ON data_mining_instances(research_id);
CREATE INDEX IF NOT EXISTS idx_seeding_instances_mining ON seeding_instances(mining_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_mining ON workflow_instances(mining_id);
CREATE INDEX IF NOT EXISTS idx_service_instances_mining ON service_instances(mining_id);
CREATE INDEX IF NOT EXISTS idx_api_instances_mining ON api_instances(mining_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_research ON campaigns(research_id);
CREATE INDEX IF NOT EXISTS idx_attribute_mining_tasks_mining ON attribute_mining_tasks(mining_id);
CREATE INDEX IF NOT EXISTS idx_attribute_mining_tasks_status ON attribute_mining_tasks(status);
CREATE INDEX IF NOT EXISTS idx_campaign_execution_log_campaign ON campaign_execution_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_execution_log_created ON campaign_execution_log(created_at DESC);

-- Add updated_at triggers
CREATE TRIGGER update_research_instances_updated_at BEFORE UPDATE ON research_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_mining_instances_updated_at BEFORE UPDATE ON data_mining_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeding_instances_updated_at BEFORE UPDATE ON seeding_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_instances_updated_at BEFORE UPDATE ON service_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_instances_updated_at BEFORE UPDATE ON api_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
