-- ============================================================================
-- DeepSeek n8n Workflow System - Complete Database Schema
-- ============================================================================
-- Description: Comprehensive schema for DeepSeek-powered n8n workflow 
--              management with prompt templates, task orchestration,
--              and execution tracking
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. PROMPT ENGINEERING TEMPLATES
-- ============================================================================

-- Prompt templates table - stores reusable AI prompt templates
CREATE TABLE IF NOT EXISTS prompt_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- workflow, schema, component, analysis, optimization
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array of variable names
    examples JSONB DEFAULT '[]', -- Example inputs/outputs
    metadata JSONB DEFAULT '{}',
    version VARCHAR(50) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prompt executions - track all prompt executions for analytics
CREATE TABLE IF NOT EXISTS prompt_executions (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) UNIQUE NOT NULL,
    template_id VARCHAR(255) REFERENCES prompt_templates(template_id),
    input_variables JSONB DEFAULT '{}',
    generated_prompt TEXT NOT NULL,
    response TEXT,
    model VARCHAR(100) DEFAULT 'deepseek-reasoner',
    tokens_used INTEGER,
    execution_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. SCHEMA GENERATION & MANAGEMENT
-- ============================================================================

-- Generated schemas table - stores AI-generated schemas
CREATE TABLE IF NOT EXISTS generated_schemas (
    id SERIAL PRIMARY KEY,
    schema_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schema_type VARCHAR(100) NOT NULL, -- json-schema, graphql, database, component
    schema_content JSONB NOT NULL,
    relationships JSONB DEFAULT '[]', -- Links to other schemas
    validation_rules JSONB DEFAULT '{}',
    prompt_execution_id VARCHAR(255) REFERENCES prompt_executions(execution_id),
    parent_schema_id VARCHAR(255) REFERENCES generated_schemas(schema_id),
    version VARCHAR(50) DEFAULT '1.0.0',
    is_validated BOOLEAN DEFAULT FALSE,
    validation_errors JSONB DEFAULT '[]',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schema relationships - explicit relationship mapping
CREATE TABLE IF NOT EXISTS schema_relationships (
    id SERIAL PRIMARY KEY,
    from_schema_id VARCHAR(255) REFERENCES generated_schemas(schema_id),
    to_schema_id VARCHAR(255) REFERENCES generated_schemas(schema_id),
    relationship_type VARCHAR(100) NOT NULL, -- one-to-one, one-to-many, many-to-many
    relationship_name VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_schema_id, to_schema_id, relationship_type)
);

-- ============================================================================
-- 3. n8n WORKFLOW INTEGRATION
-- ============================================================================

-- n8n workflows table - enhanced workflow definitions
CREATE TABLE IF NOT EXISTS n8n_workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    n8n_id VARCHAR(255), -- ID from n8n instance
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) DEFAULT 'automation', -- automation, data-mining, crawling, monitoring
    workflow_definition JSONB NOT NULL, -- Full n8n workflow JSON
    lightdom_workflow_id VARCHAR(255) REFERENCES workflows(workflow_id),
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    is_synced BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- n8n workflow executions - track execution history
CREATE TABLE IF NOT EXISTS n8n_workflow_executions (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES n8n_workflows(workflow_id),
    n8n_execution_id VARCHAR(255), -- ID from n8n instance
    status VARCHAR(50) DEFAULT 'running', -- pending, running, success, failed, waiting
    mode VARCHAR(50) DEFAULT 'trigger', -- trigger, manual, retry
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    execution_time_ms INTEGER,
    data JSONB DEFAULT '{}', -- Execution data and results
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. WORKFLOW ORCHESTRATION & TASK MANAGEMENT
-- ============================================================================

-- Orchestrated workflows - high-level workflow definitions
CREATE TABLE IF NOT EXISTS orchestrated_workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) DEFAULT 'sequential', -- sequential, parallel, dag, event-driven
    configuration JSONB DEFAULT '{}',
    schedule JSONB DEFAULT '{}', -- Cron or interval-based scheduling
    retry_policy JSONB DEFAULT '{}',
    timeout_seconds INTEGER DEFAULT 3600,
    priority INTEGER DEFAULT 5,
    tags JSONB DEFAULT '[]',
    is_template BOOLEAN DEFAULT FALSE,
    parent_template_id VARCHAR(255) REFERENCES orchestrated_workflows(workflow_id),
    created_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow tasks - individual task definitions
CREATE TABLE IF NOT EXISTS orchestrated_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES orchestrated_workflows(workflow_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100) NOT NULL, -- deepseek, n8n, crawler, api, database, custom
    handler_config JSONB NOT NULL,
    dependencies JSONB DEFAULT '[]', -- Array of task_ids that must complete first
    retry_policy JSONB DEFAULT '{}',
    timeout_seconds INTEGER DEFAULT 600,
    ordering INTEGER NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    conditional_logic JSONB DEFAULT '{}', -- Conditions for task execution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. WORKFLOW EXECUTION & MONITORING
-- ============================================================================

-- Workflow runs - execution instances
CREATE TABLE IF NOT EXISTS orchestrated_workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES orchestrated_workflows(workflow_id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, success, failed, cancelled, waiting
    execution_mode VARCHAR(50) DEFAULT 'auto', -- auto, manual, scheduled, triggered
    trigger_data JSONB DEFAULT '{}',
    progress_percentage INTEGER DEFAULT 0,
    current_task_id VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    execution_time_ms INTEGER,
    result_data JSONB DEFAULT '{}',
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    parent_run_id VARCHAR(255) REFERENCES orchestrated_workflow_runs(run_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task executions - individual task run tracking
CREATE TABLE IF NOT EXISTS orchestrated_task_executions (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) UNIQUE NOT NULL,
    run_id VARCHAR(255) REFERENCES orchestrated_workflow_runs(run_id) ON DELETE CASCADE,
    task_id VARCHAR(255) REFERENCES orchestrated_tasks(task_id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, success, failed, skipped, waiting
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    execution_time_ms INTEGER,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. LONG-RUNNING TASK POLLING
-- ============================================================================

-- Long-running tasks - tasks that require polling
CREATE TABLE IF NOT EXISTS long_running_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    execution_id VARCHAR(255) REFERENCES orchestrated_task_executions(execution_id),
    task_type VARCHAR(100) NOT NULL, -- deepseek-analysis, crawler-job, training-job, etc.
    external_id VARCHAR(255), -- ID from external system
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, processing, completed, failed
    status_url VARCHAR(500), -- URL to poll for status
    polling_interval_seconds INTEGER DEFAULT 5,
    max_polling_attempts INTEGER DEFAULT 1000,
    current_polling_attempts INTEGER DEFAULT 0,
    last_polled_at TIMESTAMP,
    next_poll_at TIMESTAMP,
    result_data JSONB DEFAULT '{}',
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Polling history - track all polling attempts
CREATE TABLE IF NOT EXISTS task_polling_history (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) REFERENCES long_running_tasks(task_id),
    polled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    response_data JSONB DEFAULT '{}',
    http_status_code INTEGER,
    error TEXT
);

-- ============================================================================
-- 7. WORKFLOW ROUTING & DEEPSEEK INTEGRATION
-- ============================================================================

-- DeepSeek routing rules - define how tasks are routed to DeepSeek
CREATE TABLE IF NOT EXISTS deepseek_routing_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type_pattern VARCHAR(255), -- Regex pattern for task types
    priority INTEGER DEFAULT 5,
    routing_config JSONB NOT NULL, -- Model, temperature, max_tokens, etc.
    prompt_template_id VARCHAR(255) REFERENCES prompt_templates(template_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DeepSeek task queue - tasks waiting for DeepSeek processing
CREATE TABLE IF NOT EXISTS deepseek_task_queue (
    id SERIAL PRIMARY KEY,
    queue_id VARCHAR(255) UNIQUE NOT NULL,
    task_execution_id VARCHAR(255) REFERENCES orchestrated_task_executions(execution_id),
    routing_rule_id VARCHAR(255) REFERENCES deepseek_routing_rules(rule_id),
    prompt_template_id VARCHAR(255) REFERENCES prompt_templates(template_id),
    input_data JSONB NOT NULL,
    priority INTEGER DEFAULT 5,
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed
    assigned_at TIMESTAMP,
    completed_at TIMESTAMP,
    result JSONB DEFAULT '{}',
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. MONITORING & METRICS
-- ============================================================================

-- Workflow metrics - aggregate metrics for workflows
CREATE TABLE IF NOT EXISTS workflow_metrics (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) REFERENCES orchestrated_workflows(workflow_id),
    metric_date DATE DEFAULT CURRENT_DATE,
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER,
    total_tasks_executed INTEGER DEFAULT 0,
    total_retries INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_id, metric_date)
);

-- System health metrics - overall system health
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id SERIAL PRIMARY KEY,
    metric_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_workflows INTEGER DEFAULT 0,
    running_tasks INTEGER DEFAULT 0,
    queued_tasks INTEGER DEFAULT 0,
    deepseek_queue_size INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    error_rate_percentage DECIMAL(5,2),
    cpu_usage_percentage DECIMAL(5,2),
    memory_usage_mb INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- 9. DATA STREAMS & WEBHOOKS
-- ============================================================================

-- Data streams - continuous data feed configurations
CREATE TABLE IF NOT EXISTS data_streams (
    id SERIAL PRIMARY KEY,
    stream_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stream_type VARCHAR(100) NOT NULL, -- webhook, polling, websocket, kafka, mqtt
    source_config JSONB NOT NULL,
    destination_workflow_id VARCHAR(255) REFERENCES orchestrated_workflows(workflow_id),
    is_active BOOLEAN DEFAULT TRUE,
    last_event_at TIMESTAMP,
    event_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stream events - individual events from streams
CREATE TABLE IF NOT EXISTS stream_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    stream_id VARCHAR(255) REFERENCES data_streams(stream_id),
    event_data JSONB NOT NULL,
    triggered_workflow_run_id VARCHAR(255) REFERENCES orchestrated_workflow_runs(run_id),
    status VARCHAR(50) DEFAULT 'received', -- received, processing, processed, failed
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- ============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Prompt templates indexes
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);

-- Prompt executions indexes
CREATE INDEX IF NOT EXISTS idx_prompt_executions_template ON prompt_executions(template_id);
CREATE INDEX IF NOT EXISTS idx_prompt_executions_status ON prompt_executions(status);
CREATE INDEX IF NOT EXISTS idx_prompt_executions_created ON prompt_executions(created_at);

-- Schemas indexes
CREATE INDEX IF NOT EXISTS idx_schemas_type ON generated_schemas(schema_type);
CREATE INDEX IF NOT EXISTS idx_schemas_validated ON generated_schemas(is_validated);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_active ON n8n_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_synced ON n8n_workflows(is_synced);
CREATE INDEX IF NOT EXISTS idx_orchestrated_workflows_status ON orchestrated_workflows(status);
CREATE INDEX IF NOT EXISTS idx_orchestrated_workflows_type ON orchestrated_workflows(workflow_type);

-- Executions indexes
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON orchestrated_workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON orchestrated_workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started ON orchestrated_workflow_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_task_executions_run ON orchestrated_task_executions(run_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON orchestrated_task_executions(status);

-- Long-running tasks indexes
CREATE INDEX IF NOT EXISTS idx_long_running_status ON long_running_tasks(status);
CREATE INDEX IF NOT EXISTS idx_long_running_next_poll ON long_running_tasks(next_poll_at);

-- DeepSeek queue indexes
CREATE INDEX IF NOT EXISTS idx_deepseek_queue_status ON deepseek_task_queue(status);
CREATE INDEX IF NOT EXISTS idx_deepseek_queue_priority ON deepseek_task_queue(priority DESC, created_at ASC);

-- Streams indexes
CREATE INDEX IF NOT EXISTS idx_data_streams_active ON data_streams(is_active);
CREATE INDEX IF NOT EXISTS idx_stream_events_stream ON stream_events(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_events_status ON stream_events(status);

-- ============================================================================
-- 11. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update updated_at timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_schemas_updated_at BEFORE UPDATE ON generated_schemas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_n8n_workflows_updated_at BEFORE UPDATE ON n8n_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orchestrated_workflows_updated_at BEFORE UPDATE ON orchestrated_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orchestrated_tasks_updated_at BEFORE UPDATE ON orchestrated_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_long_running_tasks_updated_at BEFORE UPDATE ON long_running_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deepseek_routing_rules_updated_at BEFORE UPDATE ON deepseek_routing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_metrics_updated_at BEFORE UPDATE ON workflow_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_streams_updated_at BEFORE UPDATE ON data_streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. SEED DATA - DEFAULT PROMPT TEMPLATES
-- ============================================================================

-- Insert default DeepSeek prompt templates
INSERT INTO prompt_templates (template_id, name, description, category, template_content, variables, version) VALUES
('workflow-generation-v1', 'Workflow Generation', 'Generate complete workflow from natural language', 'workflow', 
'You are an expert workflow architect for automation systems.

USER REQUEST: {{userRequest}}
DOMAIN: {{domainContext}}

Generate a complete workflow definition in JSON format following this structure:
{
  "workflow": {
    "name": "...",
    "description": "...",
    "type": "sequential|parallel|dag",
    "tasks": [
      {
        "name": "...",
        "type": "deepseek|n8n|crawler|api",
        "config": {...},
        "dependencies": [...]
      }
    ],
    "schedule": {...},
    "errorHandling": {...}
  }
}

Use chain-of-thought reasoning. Be concise and specific.',
'["userRequest", "domainContext"]'::jsonb, '1.0.0'),

('schema-generation-v1', 'Schema Generation', 'Generate linked data schemas', 'schema',
'You are a schema architect. Generate a comprehensive JSON schema with relationships.

DESCRIPTION: {{description}}
REQUIREMENTS: {{requirements}}

Output format:
{
  "schema": {
    "name": "...",
    "type": "object",
    "properties": {...},
    "relationships": [...]
  }
}',
'["description", "requirements"]'::jsonb, '1.0.0'),

('task-routing-v1', 'Task Routing Decision', 'Determine optimal task routing', 'optimization',
'Analyze this task and determine the best execution strategy.

TASK: {{taskDescription}}
AVAILABLE SERVICES: {{availableServices}}

Respond with:
{
  "routeTo": "service-name",
  "reason": "...",
  "estimatedDuration": "...",
  "priority": 1-10
}',
'["taskDescription", "availableServices"]'::jsonb, '1.0.0'),

('error-analysis-v1', 'Error Analysis & Recovery', 'Analyze errors and suggest fixes', 'analysis',
'Analyze this workflow error and suggest recovery actions.

ERROR: {{errorMessage}}
CONTEXT: {{executionContext}}

Provide:
{
  "rootCause": "...",
  "recoveryActions": [...],
  "preventionTips": [...]
}',
'["errorMessage", "executionContext"]'::jsonb, '1.0.0')

ON CONFLICT (template_id) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
