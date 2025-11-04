-- TensorFlow Workflow Orchestration Database Schema
-- Tables for managing workflows, training data, and neural network configurations

-- Training Data Configurations Table
CREATE TABLE IF NOT EXISTS training_data_configs (
    id VARCHAR(255) PRIMARY KEY,
    neural_network_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    source JSONB NOT NULL,
    preprocessing JSONB NOT NULL,
    storage JSONB NOT NULL,
    triggers JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    total_samples INTEGER DEFAULT 0,
    last_collection TIMESTAMP,
    CONSTRAINT fk_neural_network
        FOREIGN KEY (neural_network_id)
        REFERENCES neural_network_instances(id)
        ON DELETE CASCADE
);

-- Training Samples Table
CREATE TABLE IF NOT EXISTS training_samples (
    id VARCHAR(255) PRIMARY KEY,
    neural_network_id VARCHAR(255) NOT NULL,
    features JSONB NOT NULL,
    labels JSONB,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    quality_score DECIMAL(3,2),
    CONSTRAINT fk_neural_network_samples
        FOREIGN KEY (neural_network_id)
        REFERENCES neural_network_instances(id)
        ON DELETE CASCADE
);

-- Workflow Configurations Table
CREATE TABLE IF NOT EXISTS workflow_configs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    neural_network_id VARCHAR(255),
    steps JSONB NOT NULL,
    triggers JSONB NOT NULL,
    outputs JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_neural_network_workflow
        FOREIGN KEY (neural_network_id)
        REFERENCES neural_network_instances(id)
        ON DELETE SET NULL
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    steps JSONB,
    outputs JSONB,
    inputs JSONB,
    error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workflow
        FOREIGN KEY (workflow_id)
        REFERENCES workflow_configs(id)
        ON DELETE CASCADE
);

-- Service Registry Table
CREATE TABLE IF NOT EXISTS service_registry (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    capabilities JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    config JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tool Executions Log Table
CREATE TABLE IF NOT EXISTS tool_executions (
    id SERIAL PRIMARY KEY,
    tool_name VARCHAR(255) NOT NULL,
    arguments JSONB NOT NULL,
    result JSONB,
    success BOOLEAN DEFAULT false,
    error TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Client SEO Campaigns Table
CREATE TABLE IF NOT EXISTS client_seo_campaigns (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    neural_network_id VARCHAR(255),
    target_url VARCHAR(500) NOT NULL,
    keywords JSONB NOT NULL,
    competitors JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    api_key VARCHAR(255) UNIQUE NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    config JSONB,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_neural_network_campaign
        FOREIGN KEY (neural_network_id)
        REFERENCES neural_network_instances(id)
        ON DELETE SET NULL
);

-- SEO Reports Table
CREATE TABLE IF NOT EXISTS seo_reports (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    insights JSONB,
    recommendations JSONB,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES client_seo_campaigns(id)
        ON DELETE CASCADE
);

-- Schema Relationships Table (for linking workflows)
CREATE TABLE IF NOT EXISTS schema_relationships (
    id SERIAL PRIMARY KEY,
    from_schema VARCHAR(255) NOT NULL,
    to_schema VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    config JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_configs_nn ON training_data_configs(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_training_configs_status ON training_data_configs(status);
CREATE INDEX IF NOT EXISTS idx_training_samples_nn ON training_samples(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_training_samples_created ON training_samples(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_configs_type ON workflow_configs(type);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_service_registry_status ON service_registry(status);
CREATE INDEX IF NOT EXISTS idx_tool_executions_name ON tool_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_client ON client_seo_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_status ON client_seo_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_seo_reports_campaign ON seo_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_seo_reports_generated ON seo_reports(generated_at DESC);

-- Insert default services into registry
INSERT INTO service_registry (id, name, type, endpoint, capabilities, status, created_at, updated_at)
VALUES 
    ('admin.workflow.api.neuralnetwork', 'Neural Network API', 'api', '/api/neural-networks', 
     '["create", "train", "predict", "manage"]', 'active', NOW(), NOW()),
    ('admin.workflow.api.training-data', 'Training Data Service', 'data', '/api/training-data', 
     '["collect", "preprocess", "store", "retrieve"]', 'active', NOW(), NOW()),
    ('admin.workflow.api.crawler', 'Web Crawler Service', 'crawler', '/api/crawler', 
     '["crawl", "extract", "analyze"]', 'active', NOW(), NOW()),
    ('admin.workflow.api.deepseek', 'DeepSeek Integration', 'ai', '/api/deepseek', 
     '["generate", "analyze", "optimize"]', 'active', NOW(), NOW()),
    ('admin.workflow.api.dashboard', 'Dashboard Service', 'ui', '/api/dashboard', 
     '["visualize", "report", "monitor"]', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE training_data_configs IS 'Configurations for automated training data collection';
COMMENT ON TABLE training_samples IS 'Individual training samples for neural networks';
COMMENT ON TABLE workflow_configs IS 'Workflow definitions for orchestration';
COMMENT ON TABLE workflow_executions IS 'Execution history of workflows';
COMMENT ON TABLE service_registry IS 'Registry of available services for workflows';
COMMENT ON TABLE tool_executions IS 'Log of DeepSeek tool executions';
COMMENT ON TABLE client_seo_campaigns IS 'Client SEO campaigns with neural network integration';
COMMENT ON TABLE seo_reports IS 'Generated SEO reports for clients';
COMMENT ON TABLE schema_relationships IS 'Relationships between schema configurations';
