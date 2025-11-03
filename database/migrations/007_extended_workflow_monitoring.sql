-- Extended Schema for Campaign Monitoring, State Machine, and 3D DOM Mining
-- Adds support for workflow state management, simulation plans, and rich snippet mining

-- Workflow State Machine Table
CREATE TABLE IF NOT EXISTS workflow_states (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('initial', 'processing', 'decision', 'final', 'error')),
    description TEXT,
    schema_config JSONB NOT NULL,
    allowed_transitions JSONB NOT NULL,
    actions JSONB NOT NULL,
    conditions JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workflow_state
        FOREIGN KEY (workflow_id)
        REFERENCES workflow_configs(id)
        ON DELETE CASCADE
);

-- Workflow Simulations Table
CREATE TABLE IF NOT EXISTS workflow_simulations (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    plan JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    results JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMP,
    CONSTRAINT fk_workflow_simulation
        FOREIGN KEY (workflow_id)
        REFERENCES workflow_configs(id)
        ON DELETE CASCADE
);

-- Campaign Training Status Table
CREATE TABLE IF NOT EXISTS campaign_training_status (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    neural_network_id VARCHAR(255),
    data_collection_status VARCHAR(50) NOT NULL,
    training_status VARCHAR(50) NOT NULL,
    metrics JSONB NOT NULL,
    health JSONB NOT NULL,
    checked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campaign_status
        FOREIGN KEY (campaign_id)
        REFERENCES client_seo_campaigns(id)
        ON DELETE CASCADE
);

-- DOM 3D Mining Results Table
CREATE TABLE IF NOT EXISTS dom_3d_mining_results (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    campaign_id VARCHAR(255),
    dom_model JSONB NOT NULL,
    rich_snippets JSONB NOT NULL,
    schema_graph JSONB NOT NULL,
    seo_score DECIMAL(5,2) NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campaign_mining
        FOREIGN KEY (campaign_id)
        REFERENCES client_seo_campaigns(id)
        ON DELETE SET NULL
);

-- Rich Snippet Elements Table (for tracking individual snippets)
CREATE TABLE IF NOT EXISTS rich_snippet_elements (
    id SERIAL PRIMARY KEY,
    mining_result_id INTEGER NOT NULL,
    element_id VARCHAR(255) NOT NULL,
    snippet_type VARCHAR(100) NOT NULL,
    schema_type VARCHAR(255) NOT NULL,
    properties JSONB NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    validation_errors JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_mining_result
        FOREIGN KEY (mining_result_id)
        REFERENCES dom_3d_mining_results(id)
        ON DELETE CASCADE
);

-- Component Data Reuse Library Table
CREATE TABLE IF NOT EXISTS component_data_library (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    component_type VARCHAR(100) NOT NULL,
    schema JSONB NOT NULL,
    data_template JSONB NOT NULL,
    example_usage JSONB,
    tags JSONB,
    usage_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workflow Tasks Table (with subtasks)
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255),
    parent_task_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    schema_config JSONB NOT NULL,
    linked_schemas JSONB,
    assigned_to VARCHAR(255),
    priority INTEGER DEFAULT 0,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workflow_task
        FOREIGN KEY (workflow_id)
        REFERENCES workflow_configs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_parent_task
        FOREIGN KEY (parent_task_id)
        REFERENCES workflow_tasks(id)
        ON DELETE CASCADE
);

-- Training Data Models Table (for storing training configurations)
CREATE TABLE IF NOT EXISTS training_data_models (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    schema_config JSONB NOT NULL,
    data_requirements JSONB NOT NULL,
    preprocessing_rules JSONB NOT NULL,
    validation_rules JSONB NOT NULL,
    example_data JSONB,
    performance_metrics JSONB,
    usage_count INTEGER DEFAULT 0,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Schema Linking Configurations Table
CREATE TABLE IF NOT EXISTS schema_linking_configs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_schema VARCHAR(255) NOT NULL,
    target_schema VARCHAR(255) NOT NULL,
    link_type VARCHAR(100) NOT NULL,
    mapping_rules JSONB NOT NULL,
    transformation_rules JSONB,
    validation_rules JSONB,
    is_bidirectional BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_states_workflow ON workflow_states(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_simulations_workflow ON workflow_simulations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_simulations_status ON workflow_simulations(status);
CREATE INDEX IF NOT EXISTS idx_campaign_training_status_campaign ON campaign_training_status(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_training_status_client ON campaign_training_status(client_id);
CREATE INDEX IF NOT EXISTS idx_campaign_training_status_checked ON campaign_training_status(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_dom_3d_mining_url ON dom_3d_mining_results(url);
CREATE INDEX IF NOT EXISTS idx_dom_3d_mining_campaign ON dom_3d_mining_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dom_3d_mining_created ON dom_3d_mining_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rich_snippet_mining_result ON rich_snippet_elements(mining_result_id);
CREATE INDEX IF NOT EXISTS idx_rich_snippet_type ON rich_snippet_elements(snippet_type);
CREATE INDEX IF NOT EXISTS idx_component_library_category ON component_data_library(category);
CREATE INDEX IF NOT EXISTS idx_component_library_type ON component_data_library(component_type);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_execution ON workflow_tasks(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_parent ON workflow_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_training_models_type ON training_data_models(model_type);
CREATE INDEX IF NOT EXISTS idx_training_models_template ON training_data_models(is_template);
CREATE INDEX IF NOT EXISTS idx_schema_linking_source ON schema_linking_configs(source_schema);
CREATE INDEX IF NOT EXISTS idx_schema_linking_target ON schema_linking_configs(target_schema);
CREATE INDEX IF NOT EXISTS idx_schema_linking_active ON schema_linking_configs(active);

-- Insert example training data models
INSERT INTO training_data_models (id, name, model_type, schema_config, data_requirements, preprocessing_rules, validation_rules, example_data, is_template, created_at, updated_at)
VALUES 
(
    'tdm-seo-basic',
    'Basic SEO Training Data Model',
    'seo_optimization',
    '{"type": "object", "properties": {"title": {"type": "string"}, "description": {"type": "string"}, "keywords": {"type": "array"}}}'::jsonb,
    '{"minSamples": 1000, "requiredFields": ["title", "description", "url"], "dataTypes": ["web_crawl", "api"]}'::jsonb,
    '{"normalization": true, "tokenization": {"enabled": true, "maxLength": 512}, "removeStopWords": true}'::jsonb,
    '{"titleLength": {"min": 10, "max": 60}, "descriptionLength": {"min": 50, "max": 160}}'::jsonb,
    '{"title": "Example SEO Title", "description": "Example meta description for SEO", "keywords": ["seo", "optimization"], "url": "https://example.com"}'::jsonb,
    true,
    NOW(),
    NOW()
),
(
    'tdm-rich-snippet',
    'Rich Snippet Training Data Model',
    'rich_snippet_generation',
    '{"type": "object", "properties": {"schemaType": {"type": "string"}, "properties": {"type": "object"}, "context": {"type": "string"}}}'::jsonb,
    '{"minSamples": 500, "requiredFields": ["schemaType", "properties"], "dataTypes": ["dom_mining", "schema_extraction"]}'::jsonb,
    '{"validateSchema": true, "extractMetadata": true, "linkRelationships": true}'::jsonb,
    '{"schemaType": {"enum": ["Article", "Product", "Event", "Organization", "Person"]}, "properties": {"required": ["name"]}}'::jsonb,
    '{"schemaType": "Article", "properties": {"name": "Example Article", "datePublished": "2024-01-01"}, "context": "https://schema.org"}'::jsonb,
    true,
    NOW(),
    NOW()
),
(
    'tdm-workflow-task',
    'Workflow Task Training Data Model',
    'workflow_optimization',
    '{"type": "object", "properties": {"taskName": {"type": "string"}, "dependencies": {"type": "array"}, "estimatedDuration": {"type": "number"}}}'::jsonb,
    '{"minSamples": 200, "requiredFields": ["taskName", "taskType"], "dataTypes": ["workflow_execution", "manual_input"]}'::jsonb,
    '{"extractDependencies": true, "calculateComplexity": true, "identifyPatterns": true}'::jsonb,
    '{"taskName": {"minLength": 5, "maxLength": 100}, "estimatedDuration": {"min": 1, "max": 86400}}'::jsonb,
    '{"taskName": "Data Collection", "taskType": "crawler", "dependencies": [], "estimatedDuration": 3600}'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert example schema linking configurations
INSERT INTO schema_linking_configs (id, name, source_schema, target_schema, link_type, mapping_rules, transformation_rules, is_bidirectional, active, created_at, updated_at)
VALUES
(
    'slc-campaign-to-workflow',
    'Campaign to Workflow Link',
    'client_seo_campaigns',
    'workflow_configs',
    'one_to_many',
    '{"campaignId": "metadata.campaignId", "keywords": "metadata.keywords", "targetUrl": "metadata.targetUrl"}'::jsonb,
    '{"generateWorkflowName": "concat(''SEO Campaign - '', campaign.targetUrl)"}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
),
(
    'slc-workflow-to-tasks',
    'Workflow to Tasks Link',
    'workflow_configs',
    'workflow_tasks',
    'one_to_many',
    '{"workflowId": "workflow_id", "steps": "schema_config.steps"}'::jsonb,
    '{"generateTasks": "steps.map(step => ({name: step.name, taskType: step.type}))"}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
),
(
    'slc-task-to-subtasks',
    'Task to Subtasks Link',
    'workflow_tasks',
    'workflow_tasks',
    'hierarchical',
    '{"parentId": "parent_task_id", "taskConfig": "schema_config"}'::jsonb,
    '{"inheritProperties": ["workflow_id", "execution_id"], "calculatePriority": "parent.priority + 1"}'::jsonb,
    false,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE workflow_states IS 'State machine states for workflow execution';
COMMENT ON TABLE workflow_simulations IS 'DeepSeek-generated simulation plans for workflows';
COMMENT ON TABLE campaign_training_status IS 'Real-time monitoring of campaign training data collection';
COMMENT ON TABLE dom_3d_mining_results IS '3D DOM models with linked rich snippets';
COMMENT ON TABLE rich_snippet_elements IS 'Individual rich snippet elements extracted from DOM';
COMMENT ON TABLE component_data_library IS 'Reusable component data templates and schemas';
COMMENT ON TABLE workflow_tasks IS 'Workflow tasks and subtasks with schema linking';
COMMENT ON TABLE training_data_models IS 'Training data model templates and configurations';
COMMENT ON TABLE schema_linking_configs IS 'Schema linking rules and transformations';
