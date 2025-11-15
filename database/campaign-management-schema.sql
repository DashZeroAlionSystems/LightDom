-- Campaign Management Database Schema
-- Supports SEO campaigns with DeepSeek AI integration

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_by UUID,
    CONSTRAINT campaigns_name_unique UNIQUE (name)
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255),
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error TEXT,
    result JSONB
);

-- Data mining statistics table
CREATE TABLE IF NOT EXISTS data_mining_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    records_count INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    source VARCHAR(255),
    data_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'applied', 'dismissed')),
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID
);

-- Anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    type VARCHAR(50),
    severity VARCHAR(50) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    data JSONB DEFAULT '{}',
    blockchain_data JSONB
);

-- Campaign schemas table (for CRUD generation)
CREATE TABLE IF NOT EXISTS campaign_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    schema_name VARCHAR(255) NOT NULL,
    schema_definition JSONB NOT NULL,
    crud_enabled BOOLEAN DEFAULT TRUE,
    auto_generated BOOLEAN DEFAULT FALSE,
    validation_rules JSONB DEFAULT '[]',
    relationships JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaign_schemas_unique UNIQUE (campaign_id, schema_name)
);

-- Schema suggestions table (AI-generated)
CREATE TABLE IF NOT EXISTS schema_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    suggested_schema JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    source VARCHAR(50) DEFAULT 'deepseek',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- Workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    template_config JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE
);

-- DeepSeek chat history table
CREATE TABLE IF NOT EXISTS deepseek_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_session (session_id),
    INDEX idx_chat_campaign (campaign_id)
);

-- Blockchain anomaly detection results
CREATE TABLE IF NOT EXISTS blockchain_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    blockchain VARCHAR(50),
    anomaly_type VARCHAR(100),
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    detected_value DECIMAL(20,8),
    expected_value DECIMAL(20,8),
    deviation_percentage DECIMAL(5,2),
    block_number BIGINT,
    transaction_hash VARCHAR(255),
    contract_address VARCHAR(255),
    raw_data JSONB DEFAULT '{}',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_campaign ON workflows(campaign_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_data_mining_campaign ON data_mining_stats(campaign_id);
CREATE INDEX IF NOT EXISTS idx_insights_campaign ON insights(campaign_id);
CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);
CREATE INDEX IF NOT EXISTS idx_anomalies_campaign ON anomalies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_resolved ON anomalies(resolved);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_blockchain_anomalies_campaign ON blockchain_anomalies(campaign_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to workflows
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to campaign_schemas
CREATE TRIGGER update_campaign_schemas_updated_at
    BEFORE UPDATE ON campaign_schemas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default workflow templates
INSERT INTO workflow_templates (name, description, category, template_config) VALUES
(
    'SEO Data Collection',
    'Standard workflow for collecting SEO training data from websites',
    'data_mining',
    '{
        "nodes": [
            {"id": "trigger", "type": "trigger", "label": "Start"},
            {"id": "crawl", "type": "dataMining", "label": "Crawl Website"},
            {"id": "analyze", "type": "seoAnalysis", "label": "Analyze SEO"},
            {"id": "store", "type": "database", "label": "Store Data"}
        ],
        "edges": [
            {"source": "trigger", "target": "crawl"},
            {"source": "crawl", "target": "analyze"},
            {"source": "analyze", "target": "store"}
        ]
    }'::jsonb
),
(
    'Blockchain Monitoring',
    'Monitor blockchain for market anomalies and valuable patterns',
    'blockchain',
    '{
        "nodes": [
            {"id": "trigger", "type": "trigger", "label": "Schedule"},
            {"id": "monitor", "type": "blockchain", "label": "Monitor Chain"},
            {"id": "detect", "type": "decision", "label": "Detect Anomaly"},
            {"id": "alert", "type": "notification", "label": "Send Alert"}
        ],
        "edges": [
            {"source": "trigger", "target": "monitor"},
            {"source": "monitor", "target": "detect"},
            {"source": "detect", "target": "alert"}
        ]
    }'::jsonb
),
(
    'Market Analysis Pipeline',
    'Automated market trend analysis and insight generation',
    'analysis',
    '{
        "nodes": [
            {"id": "trigger", "type": "trigger", "label": "Daily"},
            {"id": "collect", "type": "dataMining", "label": "Collect Data"},
            {"id": "analyze", "type": "seoAnalysis", "label": "Analyze Trends"},
            {"id": "insights", "type": "contentGen", "label": "Generate Insights"},
            {"id": "notify", "type": "notification", "label": "Notify Team"}
        ],
        "edges": [
            {"source": "trigger", "target": "collect"},
            {"source": "collect", "target": "analyze"},
            {"source": "analyze", "target": "insights"},
            {"source": "insights", "target": "notify"}
        ]
    }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lightdom_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lightdom_user;
