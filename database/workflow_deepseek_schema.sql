-- LightDom Workflow and Data Mining Schema
-- Comprehensive database schema for AI-powered workflows with data mining and analytics

-- ============================================================================
-- WORKFLOW TABLES
-- ============================================================================

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    priority INTEGER DEFAULT 1,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT workflows_name_unique UNIQUE(name, version)
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('data-fetch', 'transform', 'calculate', 'ai-analyze', 'blockchain-tx', 'api-call', 'condition', 'loop', 'parallel', 'custom')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    timeout INTEGER DEFAULT 30000,
    retryable BOOLEAN DEFAULT true,
    retry_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT workflow_steps_unique UNIQUE(workflow_id, step_id)
);

-- Workflow step dependencies
CREATE TABLE IF NOT EXISTS workflow_step_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
    depends_on_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'sequential' CHECK (dependency_type IN ('sequential', 'parallel', 'conditional')),
    condition JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_dependency CHECK (step_id != depends_on_step_id)
);

-- Workflow rules table
CREATE TABLE IF NOT EXISTS workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    rule_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('validation', 'transformation', 'decision', 'alert')),
    priority INTEGER DEFAULT 1,
    enabled BOOLEAN DEFAULT true,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT workflow_rules_unique UNIQUE(workflow_id, rule_id)
);

-- Workflow triggers
CREATE TABLE IF NOT EXISTS workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('manual', 'schedule', 'webhook', 'event', 'condition')),
    enabled BOOLEAN DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    trigger_type VARCHAR(50),
    context JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step execution history
CREATE TABLE IF NOT EXISTS step_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    inputs JSONB DEFAULT '{}'::jsonb,
    outputs JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DATA MINING TABLES
-- ============================================================================

-- Data mining campaigns
CREATE TABLE IF NOT EXISTS data_mining_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    target_attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
    mining_rules JSONB DEFAULT '{}'::jsonb,
    schedule JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP
);

-- Data streams for campaigns
CREATE TABLE IF NOT EXISTS campaign_data_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES data_mining_campaigns(id) ON DELETE CASCADE,
    stream_id VARCHAR(255) NOT NULL,
    stream_name VARCHAR(255) NOT NULL,
    stream_type VARCHAR(100) NOT NULL CHECK (stream_type IN ('market', 'blockchain', 'portfolio', 'analytics', 'custom')),
    source_url TEXT,
    frequency INTEGER DEFAULT 60000, -- milliseconds
    enabled BOOLEAN DEFAULT true,
    last_update TIMESTAMP,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaign_stream_unique UNIQUE(campaign_id, stream_id)
);

-- Mined data storage
CREATE TABLE IF NOT EXISTS mined_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES data_mining_campaigns(id) ON DELETE CASCADE,
    stream_id UUID REFERENCES campaign_data_streams(id) ON DELETE CASCADE,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value JSONB NOT NULL,
    confidence DECIMAL(5,4),
    data_quality_score DECIMAL(5,4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Data mining insights
CREATE TABLE IF NOT EXISTS mining_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES data_mining_campaigns(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL CHECK (insight_type IN ('pattern', 'anomaly', 'trend', 'correlation', 'prediction')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    confidence DECIMAL(5,4) NOT NULL,
    data_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    actionable BOOLEAN DEFAULT false,
    suggested_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ============================================================================
-- WORKFLOW COMPONENTS
-- ============================================================================

-- Visual components for workflows
CREATE TABLE IF NOT EXISTS workflow_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    component_type VARCHAR(100) NOT NULL CHECK (component_type IN ('chart', 'form', 'table', 'editor', 'dashboard', 'graph', 'timeline')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_order INTEGER DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_binding JSONB DEFAULT '{}'::jsonb,
    style JSONB DEFAULT '{}'::jsonb,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Component schemas (for validation and structure)
CREATE TABLE IF NOT EXISTS component_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL REFERENCES workflow_components(id) ON DELETE CASCADE,
    schema_type VARCHAR(100) NOT NULL CHECK (schema_type IN ('input', 'output', 'validation', 'display')),
    schema_definition JSONB NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONFIGURATION TABLES
-- ============================================================================

-- Service configurations
CREATE TABLE IF NOT EXISTS service_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL UNIQUE,
    service_type VARCHAR(100) NOT NULL CHECK (service_type IN ('api', 'worker', 'scheduler', 'ai', 'blockchain', 'database')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN DEFAULT true,
    version VARCHAR(50) DEFAULT '1.0.0',
    container_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service instances (for container management)
CREATE TABLE IF NOT EXISTS service_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_config_id UUID NOT NULL REFERENCES service_configs(id) ON DELETE CASCADE,
    instance_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error', 'starting', 'stopping')),
    container_id VARCHAR(255),
    port INTEGER,
    host VARCHAR(255),
    health_status VARCHAR(50),
    started_at TIMESTAMP,
    stopped_at TIMESTAMP,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_instance_unique UNIQUE(service_config_id, instance_name)
);

-- Config includes/excludes
CREATE TABLE IF NOT EXISTS config_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(100) NOT NULL CHECK (target_type IN ('workflow', 'service', 'campaign', 'component')),
    target_id UUID NOT NULL,
    filter_type VARCHAR(50) NOT NULL CHECK (filter_type IN ('include', 'exclude')),
    filter_pattern VARCHAR(500) NOT NULL,
    priority INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS AND KNOWLEDGE GRAPH
-- ============================================================================

-- Knowledge graph nodes
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type VARCHAR(100) NOT NULL CHECK (node_type IN ('entity', 'concept', 'event', 'relation', 'attribute')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    embeddings VECTOR(1536), -- For AI similarity search
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT knowledge_nodes_unique UNIQUE(node_type, name)
);

-- Knowledge graph relationships
CREATE TABLE IF NOT EXISTS knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    weight DECIMAL(5,4) DEFAULT 1.0,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_relationship CHECK (source_node_id != target_node_id)
);

-- Analytics events (for internal analytics)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES data_mining_campaigns(id) ON DELETE SET NULL,
    user_id VARCHAR(255),
    properties JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255)
);

-- AI tool usage tracking
CREATE TABLE IF NOT EXISTS ai_tool_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(255) NOT NULL,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    conversation_id VARCHAR(255),
    parameters JSONB,
    result JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    execution_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_step_executions_execution_id ON step_executions(execution_id);

-- Data mining indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON data_mining_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_workflow_id ON data_mining_campaigns(workflow_id);
CREATE INDEX IF NOT EXISTS idx_campaign_streams_campaign_id ON campaign_data_streams(campaign_id);
CREATE INDEX IF NOT EXISTS idx_mined_data_campaign_id ON mined_data(campaign_id);
CREATE INDEX IF NOT EXISTS idx_mined_data_timestamp ON mined_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mining_insights_campaign_id ON mining_insights(campaign_id);

-- Component indexes
CREATE INDEX IF NOT EXISTS idx_components_workflow_id ON workflow_components(workflow_id);
CREATE INDEX IF NOT EXISTS idx_component_schemas_component_id ON component_schemas(component_id);

-- Service indexes
CREATE INDEX IF NOT EXISTS idx_service_instances_config_id ON service_instances(service_config_id);
CREATE INDEX IF NOT EXISTS idx_service_instances_status ON service_instances(status);

-- Knowledge graph indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_type ON knowledge_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_source ON knowledge_relationships(source_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_target ON knowledge_relationships(target_node_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_tool_name ON ai_tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_timestamp ON ai_tool_usage(timestamp DESC);

-- JSONB indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_workflows_metadata ON workflows USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_config ON workflow_steps USING gin(config);
CREATE INDEX IF NOT EXISTS idx_campaign_target_attributes ON data_mining_campaigns USING gin(target_attributes);
CREATE INDEX IF NOT EXISTS idx_mined_data_value ON mined_data USING gin(attribute_value);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_rules_updated_at BEFORE UPDATE ON workflow_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON data_mining_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON workflow_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_configs_updated_at BEFORE UPDATE ON service_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA / EXAMPLES
-- ============================================================================

-- Insert default service configurations
INSERT INTO service_configs (service_name, service_type, config, enabled) VALUES
('deepseek-ollama', 'ai', '{"endpoint": "http://localhost:11434", "model": "deepseek-r1:latest"}'::jsonb, true),
('mcp-server', 'api', '{"port": 3100, "host": "localhost"}'::jsonb, true),
('calculation-engine', 'worker', '{"maxWorkers": 4, "enableCaching": true}'::jsonb, true)
ON CONFLICT (service_name) DO NOTHING;

-- Create example workflow template
INSERT INTO workflows (name, description, status, priority, config) VALUES
('Portfolio Optimization Template', 'AI-powered portfolio optimization workflow', 'draft', 1, 
 '{"environment": "production", "concurrency": 5, "timeout": 300000}'::jsonb)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE workflows IS 'Stores workflow definitions with configuration and metadata';
COMMENT ON TABLE workflow_steps IS 'Individual steps within a workflow with dependencies';
COMMENT ON TABLE data_mining_campaigns IS 'Data mining campaigns for extracting insights from data streams';
COMMENT ON TABLE workflow_components IS 'Visual components for workflow data display and editing';
COMMENT ON TABLE knowledge_nodes IS 'Nodes in the knowledge graph for AI-powered insights';
COMMENT ON TABLE ai_tool_usage IS 'Tracks AI tool usage for analytics and improvement';
