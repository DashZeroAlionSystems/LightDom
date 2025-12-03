-- Workflow Orchestration System Database Schema
-- Supports hierarchical entity management:
-- Campaigns → Workflows → Services → Data Streams → Attributes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for status and triggers
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived', 'error');
CREATE TYPE trigger_type AS ENUM ('manual', 'schedule', 'webhook', 'event', 'cron', 'on_demand');
CREATE TYPE attribute_type AS ENUM ('string', 'number', 'boolean', 'array', 'object', 'date', 'url');
CREATE TYPE service_type AS ENUM ('api', 'database', 'file', 'webhook', 'custom');

-- ============================================================================
-- CAMPAIGNS TABLE
-- Top-level entity that contains multiple workflows
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status DEFAULT 'draft',
    triggers JSONB DEFAULT '[{"type": "manual", "enabled": true}]'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID,
    
    CONSTRAINT valid_campaign_name CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255)
);

-- Campaign indexes
CREATE INDEX idx_workflow_campaigns_status ON workflow_campaigns(status);
CREATE INDEX idx_workflow_campaigns_created_at ON workflow_campaigns(created_at DESC);
CREATE INDEX idx_workflow_campaigns_organization ON workflow_campaigns(organization_id);

-- ============================================================================
-- WORKFLOWS TABLE
-- Individual workflows that belong to campaigns
-- Compatible with n8n workflow structure
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES workflow_campaigns(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status DEFAULT 'draft',
    triggers JSONB DEFAULT '[{"type": "manual", "enabled": true}]'::jsonb,
    nodes JSONB DEFAULT '[]'::jsonb,  -- n8n compatible node structure
    connections JSONB DEFAULT '{}'::jsonb,  -- n8n compatible connections
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    version INTEGER DEFAULT 1,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_workflow_name CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255)
);

-- Workflow indexes
CREATE INDEX idx_workflows_campaign_id ON workflows(campaign_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);

-- ============================================================================
-- SERVICES TABLE
-- Bundled APIs that belong to workflows
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status DEFAULT 'draft',
    type service_type DEFAULT 'api',
    endpoint VARCHAR(2048),
    auth_config JSONB DEFAULT '{}'::jsonb,
    headers JSONB DEFAULT '{}'::jsonb,
    rate_limit JSONB DEFAULT '{"requests_per_minute": 60}'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_service_name CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255)
);

-- Service indexes
CREATE INDEX idx_workflow_services_workflow_id ON workflow_services(workflow_id);
CREATE INDEX idx_workflow_services_type ON workflow_services(type);
CREATE INDEX idx_workflow_services_status ON workflow_services(status);

-- ============================================================================
-- DATA STREAMS TABLE
-- Streams of data that flow through services
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_data_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES workflow_services(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status DEFAULT 'draft',
    source_type VARCHAR(100) DEFAULT 'api',
    destination_type VARCHAR(100) DEFAULT 'database',
    transform_config JSONB DEFAULT '{}'::jsonb,
    validation_rules JSONB DEFAULT '[]'::jsonb,
    sampling_rate DECIMAL(5, 4) DEFAULT 1.0,  -- 1.0 = 100%
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_data_stream_name CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255),
    CONSTRAINT valid_sampling_rate CHECK (sampling_rate >= 0 AND sampling_rate <= 1)
);

-- Data stream indexes
CREATE INDEX idx_workflow_data_streams_service_id ON workflow_data_streams(service_id);
CREATE INDEX idx_workflow_data_streams_status ON workflow_data_streams(status);
CREATE INDEX idx_workflow_data_streams_source_type ON workflow_data_streams(source_type);

-- ============================================================================
-- ATTRIBUTES TABLE
-- Individual data points within data streams
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_stream_id UUID REFERENCES workflow_data_streams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255),
    description TEXT,
    type attribute_type DEFAULT 'string',
    category VARCHAR(100),
    is_required BOOLEAN DEFAULT false,
    is_unique BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_pattern VARCHAR(1000),
    min_value DECIMAL,
    max_value DECIMAL,
    enum_values JSONB DEFAULT '[]'::jsonb,
    generated_by_deepseek BOOLEAN DEFAULT false,
    deepseek_prompt TEXT,
    deepseek_model VARCHAR(100),
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_attribute_name CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255)
);

-- Attribute indexes
CREATE INDEX idx_workflow_attributes_data_stream_id ON workflow_attributes(data_stream_id);
CREATE INDEX idx_workflow_attributes_category ON workflow_attributes(category);
CREATE INDEX idx_workflow_attributes_type ON workflow_attributes(type);
CREATE INDEX idx_workflow_attributes_generated_by_deepseek ON workflow_attributes(generated_by_deepseek);
CREATE INDEX idx_workflow_attributes_name ON workflow_attributes(name);

-- ============================================================================
-- WORKFLOW BUNDLES TABLE
-- Tracks auto-created bundles for easy management
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_id UUID REFERENCES workflow_campaigns(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    service_id UUID REFERENCES workflow_services(id) ON DELETE CASCADE,
    data_stream_id UUID REFERENCES workflow_data_streams(id) ON DELETE CASCADE,
    topics JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(100),
    auto_generated BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Bundle indexes
CREATE INDEX idx_workflow_bundles_campaign_id ON workflow_bundles(campaign_id);
CREATE INDEX idx_workflow_bundles_category ON workflow_bundles(category);
CREATE INDEX idx_workflow_bundles_created_at ON workflow_bundles(created_at DESC);

-- ============================================================================
-- DEEPSEEK ATTRIBUTE SUGGESTIONS TABLE
-- Cache for DeepSeek-generated attribute suggestions
-- ============================================================================
CREATE TABLE IF NOT EXISTS deepseek_attribute_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    suggestions JSONB NOT NULL,
    model VARCHAR(100) DEFAULT 'deepseek-chat',
    prompt TEXT,
    response_tokens INTEGER,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    
    UNIQUE(topic, category)
);

-- Suggestion cache indexes
CREATE INDEX idx_deepseek_suggestions_topic ON deepseek_attribute_suggestions(topic);
CREATE INDEX idx_deepseek_suggestions_expires_at ON deepseek_attribute_suggestions(expires_at);

-- ============================================================================
-- WORKFLOW EXECUTION LOGS TABLE
-- Track workflow executions for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    trigger_type trigger_type,
    trigger_data JSONB DEFAULT '{}'::jsonb,
    status workflow_status,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    error_stack TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Execution log indexes
CREATE INDEX idx_workflow_execution_logs_workflow_id ON workflow_execution_logs(workflow_id);
CREATE INDEX idx_workflow_execution_logs_started_at ON workflow_execution_logs(started_at DESC);
CREATE INDEX idx_workflow_execution_logs_status ON workflow_execution_logs(status);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_workflow_campaigns_timestamp
    BEFORE UPDATE ON workflow_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_workflows_timestamp
    BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_workflow_services_timestamp
    BEFORE UPDATE ON workflow_services
    FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_workflow_data_streams_timestamp
    BEFORE UPDATE ON workflow_data_streams
    FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER update_workflow_attributes_timestamp
    BEFORE UPDATE ON workflow_attributes
    FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

-- Function to increment workflow execution count
CREATE OR REPLACE FUNCTION increment_workflow_execution_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE workflows
    SET execution_count = execution_count + 1,
        last_executed_at = NOW()
    WHERE id = NEW.workflow_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_execution_count
    AFTER INSERT ON workflow_execution_logs
    FOR EACH ROW EXECUTE FUNCTION increment_workflow_execution_count();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Campaign statistics
CREATE OR REPLACE VIEW v_campaign_statistics AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.status AS campaign_status,
    COUNT(DISTINCT w.id) AS workflow_count,
    COUNT(DISTINCT s.id) AS service_count,
    COUNT(DISTINCT ds.id) AS data_stream_count,
    COUNT(DISTINCT a.id) AS attribute_count,
    SUM(w.execution_count) AS total_executions,
    c.created_at,
    c.updated_at
FROM workflow_campaigns c
LEFT JOIN workflows w ON c.id = w.campaign_id
LEFT JOIN workflow_services s ON w.id = s.workflow_id
LEFT JOIN workflow_data_streams ds ON s.id = ds.service_id
LEFT JOIN workflow_attributes a ON ds.id = a.data_stream_id
GROUP BY c.id, c.name, c.status, c.created_at, c.updated_at;

-- View: Full workflow hierarchy
CREATE OR REPLACE VIEW v_workflow_hierarchy AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    w.id AS workflow_id,
    w.name AS workflow_name,
    s.id AS service_id,
    s.name AS service_name,
    ds.id AS data_stream_id,
    ds.name AS data_stream_name,
    a.id AS attribute_id,
    a.name AS attribute_name,
    a.category AS attribute_category,
    a.generated_by_deepseek
FROM workflow_campaigns c
LEFT JOIN workflows w ON c.id = w.campaign_id
LEFT JOIN workflow_services s ON w.id = s.workflow_id
LEFT JOIN workflow_data_streams ds ON s.id = ds.service_id
LEFT JOIN workflow_attributes a ON ds.id = a.data_stream_id;

-- View: DeepSeek generated attributes summary
CREATE OR REPLACE VIEW v_deepseek_attributes AS
SELECT 
    a.id,
    a.name,
    a.label,
    a.category,
    a.type,
    ds.name AS data_stream_name,
    s.name AS service_name,
    w.name AS workflow_name,
    c.name AS campaign_name,
    a.deepseek_model,
    a.created_at
FROM workflow_attributes a
JOIN workflow_data_streams ds ON a.data_stream_id = ds.id
JOIN workflow_services s ON ds.service_id = s.id
JOIN workflows w ON s.workflow_id = w.id
JOIN workflow_campaigns c ON w.campaign_id = c.id
WHERE a.generated_by_deepseek = true
ORDER BY a.created_at DESC;

-- ============================================================================
-- SEED DATA (Optional)
-- ============================================================================

-- Insert sample campaign
INSERT INTO workflow_campaigns (name, description, status, triggers)
VALUES (
    'Sample SEO Mining Campaign',
    'A sample campaign for SEO data mining workflows',
    'draft',
    '[{"type": "manual", "enabled": true}, {"type": "schedule", "enabled": true}]'::jsonb
) ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE workflow_campaigns IS 'Top-level entity containing multiple workflows for organized campaign management';
COMMENT ON TABLE workflows IS 'Individual workflows with n8n-compatible structure for automation';
COMMENT ON TABLE workflow_services IS 'Bundled API services that workflows interact with';
COMMENT ON TABLE workflow_data_streams IS 'Data flow definitions between services';
COMMENT ON TABLE workflow_attributes IS 'Individual data points/fields within data streams';
COMMENT ON TABLE workflow_bundles IS 'Auto-generated entity bundles for quick workflow creation';
COMMENT ON TABLE deepseek_attribute_suggestions IS 'Cached DeepSeek suggestions for attribute generation';
COMMENT ON TABLE workflow_execution_logs IS 'Audit log for workflow executions';
