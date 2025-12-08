-- Migration: SEO Attribute Management System
-- Purpose: Create tables for managing SEO attributes, campaigns, workflows, and data streams
-- Created: 2025-11-16

-- ============================================================================
-- SEO Attribute Definitions Table
-- Stores the master list of all 192+ SEO attributes with their configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_attribute_definitions (
    id SERIAL PRIMARY KEY,
    attribute_key VARCHAR(100) UNIQUE NOT NULL,
    attribute_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    selector TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'string', 'integer', 'float', 'boolean', 'url', 'array'
    ml_weight NUMERIC(5,3) DEFAULT 0.05,
    
    -- Validation rules
    validation_rules JSONB DEFAULT '{}',
    required BOOLEAN DEFAULT FALSE,
    
    -- Scraping configuration
    scraping_method VARCHAR(50) NOT NULL, -- 'text', 'attr', 'computed', 'count'
    scraping_config JSONB DEFAULT '{}',
    
    -- Training configuration
    feature_type VARCHAR(50), -- 'numerical', 'categorical', 'text', 'embedding'
    importance VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
    normalization VARCHAR(50), -- 'none', 'minmax', 'zscore'
    
    -- Seeding configuration
    seeding_source VARCHAR(100) DEFAULT 'crawler',
    refresh_frequency VARCHAR(50) DEFAULT 'daily',
    quality_threshold NUMERIC(3,2) DEFAULT 0.85,
    
    -- Status and metadata
    active BOOLEAN DEFAULT TRUE,
    description TEXT,
    seo_rules JSONB DEFAULT '[]', -- Array of SEO rules to follow
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attribute_defs_category ON seo_attribute_definitions(category);
CREATE INDEX IF NOT EXISTS idx_attribute_defs_active ON seo_attribute_definitions(active);
CREATE INDEX IF NOT EXISTS idx_attribute_defs_importance ON seo_attribute_definitions(importance);
CREATE INDEX IF NOT EXISTS idx_attribute_defs_ml_weight ON seo_attribute_definitions(ml_weight DESC);

-- ============================================================================
-- SEO Campaigns Table
-- Manages SEO campaigns that contain multiple attributes
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INTEGER,
    
    -- Campaign configuration
    target_keywords TEXT[],
    target_urls TEXT[],
    industry VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'archived'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Scheduling
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    schedule_cron VARCHAR(100),
    
    -- Neural network optimization
    neural_network_enabled BOOLEAN DEFAULT FALSE,
    neural_network_config JSONB DEFAULT '{}',
    
    -- Active mining configuration
    active_mining BOOLEAN DEFAULT FALSE,
    mining_rules JSONB DEFAULT '{}',
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON seo_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON seo_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_mining ON seo_campaigns(active_mining) WHERE active_mining = TRUE;

-- ============================================================================
-- Campaign Attributes Table
-- Links attributes to campaigns with campaign-specific configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_attributes (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(campaign_id) ON DELETE CASCADE,
    attribute_key VARCHAR(100) REFERENCES seo_attribute_definitions(attribute_key) ON DELETE CASCADE,
    
    -- Campaign-specific attribute configuration
    enabled BOOLEAN DEFAULT TRUE,
    weight_override NUMERIC(5,3), -- Override ML weight for this campaign
    custom_validation JSONB,
    custom_scraping_config JSONB,
    
    -- Data stream configuration
    data_stream_id VARCHAR(255),
    stream_enabled BOOLEAN DEFAULT TRUE,
    
    -- Mining configuration
    mine_actively BOOLEAN DEFAULT FALSE,
    mining_priority INTEGER DEFAULT 5,
    mining_algorithm VARCHAR(100), -- 'neural', 'rule-based', 'hybrid'
    
    -- Performance tracking
    success_rate NUMERIC(5,2) DEFAULT 0,
    avg_extraction_time_ms INTEGER DEFAULT 0,
    last_extracted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, attribute_key)
);

CREATE INDEX IF NOT EXISTS idx_campaign_attrs_campaign ON campaign_attributes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_attrs_attribute ON campaign_attributes(attribute_key);
CREATE INDEX IF NOT EXISTS idx_campaign_attrs_enabled ON campaign_attributes(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_campaign_attrs_mine_actively ON campaign_attributes(mine_actively) WHERE mine_actively = TRUE;

-- ============================================================================
-- Data Streams Table
-- Manages data streams that feed attribute data
-- ============================================================================
CREATE TABLE IF NOT EXISTS attribute_data_streams (
    id SERIAL PRIMARY KEY,
    stream_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stream_type VARCHAR(100) NOT NULL, -- 'crawler', 'api', 'webhook', 'database', 'file'
    
    -- Configuration
    source_config JSONB DEFAULT '{}',
    transformation_rules JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'error', 'stopped'
    health_status VARCHAR(50) DEFAULT 'healthy', -- 'healthy', 'degraded', 'unhealthy'
    
    -- Performance metrics
    records_processed BIGINT DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    last_error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_streams_status ON attribute_data_streams(status);
CREATE INDEX IF NOT EXISTS idx_data_streams_health ON attribute_data_streams(health_status);

-- ============================================================================
-- SEO Workflows Table
-- Manages SEO optimization workflows
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(campaign_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Workflow configuration
    workflow_type VARCHAR(100) NOT NULL, -- 'extraction', 'optimization', 'monitoring', 'reporting'
    workflow_config JSONB DEFAULT '{}',
    tasks JSONB DEFAULT '[]',
    
    -- Scheduling
    schedule_type VARCHAR(50), -- 'manual', 'cron', 'event-driven'
    schedule_cron VARCHAR(100),
    triggers JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    
    -- Performance
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_runtime_seconds NUMERIC(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflows_campaign ON seo_workflows(campaign_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON seo_workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_next_run ON seo_workflows(next_run_at) WHERE status = 'active';

-- ============================================================================
-- Workflow Runs Table
-- Tracks individual workflow executions
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES seo_workflows(workflow_id) ON DELETE CASCADE,
    
    -- Execution details
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    runtime_seconds NUMERIC(10,2),
    
    -- Results
    attributes_processed INTEGER DEFAULT 0,
    urls_crawled INTEGER DEFAULT 0,
    optimizations_applied INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,
    results JSONB DEFAULT '{}',
    error_log TEXT,
    
    -- Triggering
    triggered_by VARCHAR(100), -- 'manual', 'schedule', 'event', 'api'
    triggered_by_user VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON seo_workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON seo_workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started ON seo_workflow_runs(started_at DESC);

-- ============================================================================
-- Seed URLs Table
-- Manages URLs to be crawled for attribute data
-- ============================================================================
CREATE TABLE IF NOT EXISTS attribute_seed_urls (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(campaign_id) ON DELETE CASCADE,
    
    -- URL metadata
    url_type VARCHAR(50) DEFAULT 'target', -- 'target', 'competitor', 'reference', 'example'
    priority INTEGER DEFAULT 5, -- 1 (low) to 10 (high)
    depth_limit INTEGER DEFAULT 3,
    
    -- Attribute filtering
    target_attributes TEXT[], -- Specific attributes to extract from this URL
    exclude_attributes TEXT[], -- Attributes to skip for this URL
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'crawling', 'completed', 'error', 'skipped'
    last_crawled_at TIMESTAMPTZ,
    next_crawl_at TIMESTAMPTZ,
    crawl_frequency VARCHAR(50) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
    
    -- Results
    attributes_extracted INTEGER DEFAULT 0,
    last_success BOOLEAN DEFAULT FALSE,
    last_error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(url, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_seed_urls_campaign ON attribute_seed_urls(campaign_id);
CREATE INDEX IF NOT EXISTS idx_seed_urls_status ON attribute_seed_urls(status);
CREATE INDEX IF NOT EXISTS idx_seed_urls_next_crawl ON attribute_seed_urls(next_crawl_at) WHERE status IN ('pending', 'completed');
CREATE INDEX IF NOT EXISTS idx_seed_urls_priority ON attribute_seed_urls(priority DESC);

-- ============================================================================
-- Neural Network Training Data Table
-- Stores training data for neural network optimization
-- ============================================================================
CREATE TABLE IF NOT EXISTS nn_training_data (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(campaign_id) ON DELETE CASCADE,
    
    -- Input data
    url TEXT NOT NULL,
    attribute_key VARCHAR(100) REFERENCES seo_attribute_definitions(attribute_key),
    input_features JSONB NOT NULL,
    
    -- Output/Target data
    extraction_result JSONB,
    extraction_success BOOLEAN,
    extraction_time_ms INTEGER,
    quality_score NUMERIC(5,2),
    
    -- Training metadata
    training_set VARCHAR(50) DEFAULT 'train', -- 'train', 'validation', 'test'
    used_for_training BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nn_training_campaign ON nn_training_data(campaign_id);
CREATE INDEX IF NOT EXISTS idx_nn_training_attribute ON nn_training_data(attribute_key);
CREATE INDEX IF NOT EXISTS idx_nn_training_set ON nn_training_data(training_set);

-- ============================================================================
-- DOM Manipulation Rules Table
-- Stores rules for injecting SEO-friendly attributes into client sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS dom_manipulation_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(255) UNIQUE NOT NULL,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(campaign_id) ON DELETE CASCADE,
    attribute_key VARCHAR(100) REFERENCES seo_attribute_definitions(attribute_key),
    
    -- Rule configuration
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL, -- 'inject', 'modify', 'remove', 'optimize'
    
    -- DOM targeting
    target_selector TEXT NOT NULL,
    target_position VARCHAR(50), -- 'prepend', 'append', 'replace', 'before', 'after'
    
    -- Transformation
    transformation_script TEXT,
    transformation_config JSONB DEFAULT '{}',
    
    -- Conditions
    conditions JSONB DEFAULT '[]', -- When to apply this rule
    priority INTEGER DEFAULT 5,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    tested BOOLEAN DEFAULT FALSE,
    test_results JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dom_rules_campaign ON dom_manipulation_rules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dom_rules_attribute ON dom_manipulation_rules(attribute_key);
CREATE INDEX IF NOT EXISTS idx_dom_rules_active ON dom_manipulation_rules(active) WHERE active = TRUE;

-- ============================================================================
-- Attribute Extraction Logs Table
-- Logs all attribute extraction attempts for debugging and optimization
-- ============================================================================
CREATE TABLE IF NOT EXISTS attribute_extraction_logs (
    id BIGSERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(campaign_id) ON DELETE CASCADE,
    workflow_run_id VARCHAR(255) REFERENCES seo_workflow_runs(run_id) ON DELETE SET NULL,
    
    -- Extraction details
    url TEXT NOT NULL,
    attribute_key VARCHAR(100) REFERENCES seo_attribute_definitions(attribute_key),
    
    -- Results
    success BOOLEAN NOT NULL,
    extracted_value TEXT,
    value_type VARCHAR(50),
    extraction_method VARCHAR(50),
    extraction_time_ms INTEGER,
    
    -- Validation
    validation_passed BOOLEAN,
    validation_errors TEXT[],
    quality_score NUMERIC(5,2),
    
    -- Context
    page_load_time_ms INTEGER,
    dom_ready_time_ms INTEGER,
    selector_used TEXT,
    fallback_used BOOLEAN DEFAULT FALSE,
    
    -- Error handling
    error_message TEXT,
    error_stack TEXT,
    
    extracted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_extraction_logs_campaign ON attribute_extraction_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_attribute ON attribute_extraction_logs(attribute_key);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_success ON attribute_extraction_logs(success);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_extracted_at ON attribute_extraction_logs(extracted_at DESC);

-- ============================================================================
-- Update Triggers
-- ============================================================================
CREATE TRIGGER update_attribute_defs_updated_at BEFORE UPDATE ON seo_attribute_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON seo_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_attributes_updated_at BEFORE UPDATE ON campaign_attributes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_streams_updated_at BEFORE UPDATE ON attribute_data_streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON seo_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seed_urls_updated_at BEFORE UPDATE ON attribute_seed_urls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dom_rules_updated_at BEFORE UPDATE ON dom_manipulation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Views for convenience
-- ============================================================================

-- View: Campaign attributes with full definitions
CREATE OR REPLACE VIEW v_campaign_attributes_full AS
SELECT 
    ca.*,
    ad.name as attribute_name,
    ad.category,
    ad.selector,
    ad.type as attribute_type,
    ad.ml_weight,
    ad.importance,
    ad.seo_rules
FROM campaign_attributes ca
JOIN seo_attribute_definitions ad ON ca.attribute_key = ad.attribute_key;

-- View: Active campaigns with attribute counts
CREATE OR REPLACE VIEW v_active_campaigns AS
SELECT 
    c.*,
    COUNT(DISTINCT ca.attribute_key) as total_attributes,
    COUNT(DISTINCT ca.attribute_key) FILTER (WHERE ca.enabled = TRUE) as enabled_attributes,
    COUNT(DISTINCT ca.attribute_key) FILTER (WHERE ca.mine_actively = TRUE) as actively_mined_attributes,
    COUNT(DISTINCT sw.workflow_id) as workflow_count,
    COUNT(DISTINCT asu.url) as seed_url_count
FROM seo_campaigns c
LEFT JOIN campaign_attributes ca ON c.campaign_id = ca.campaign_id
LEFT JOIN seo_workflows sw ON c.campaign_id = sw.campaign_id
LEFT JOIN attribute_seed_urls asu ON c.campaign_id = asu.campaign_id
WHERE c.status = 'active'
GROUP BY c.id;

-- View: Attribute extraction performance summary
CREATE OR REPLACE VIEW v_attribute_performance AS
SELECT 
    attribute_key,
    COUNT(*) as total_extractions,
    COUNT(*) FILTER (WHERE success = TRUE) as successful_extractions,
    ROUND(AVG(extraction_time_ms)::numeric, 2) as avg_extraction_time_ms,
    ROUND(AVG(quality_score)::numeric, 2) as avg_quality_score,
    COUNT(*) FILTER (WHERE validation_passed = TRUE) as validations_passed
FROM attribute_extraction_logs
WHERE extracted_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY attribute_key;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE seo_attribute_definitions IS 'Master configuration of all SEO attributes';
COMMENT ON TABLE seo_campaigns IS 'SEO campaigns that group attributes and workflows';
COMMENT ON TABLE campaign_attributes IS 'Links attributes to campaigns with campaign-specific settings';
COMMENT ON TABLE attribute_data_streams IS 'Data streams that feed attribute data';
COMMENT ON TABLE seo_workflows IS 'Workflows for extracting and optimizing SEO attributes';
COMMENT ON TABLE seo_workflow_runs IS 'Execution history of SEO workflows';
COMMENT ON TABLE attribute_seed_urls IS 'URLs to be crawled for attribute extraction';
COMMENT ON TABLE nn_training_data IS 'Training data for neural network optimization';
COMMENT ON TABLE dom_manipulation_rules IS 'Rules for injecting SEO-friendly content into DOM';
COMMENT ON TABLE attribute_extraction_logs IS 'Detailed logs of all attribute extraction attempts';
