-- Migration: Create workflow management tables
-- Description: Add database persistence for workflows, runs, and task execution
-- Created: 2025-11-03

-- Workflows table - stores workflow definitions
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) DEFAULT 'datamining',
    owner_name VARCHAR(255),
    owner_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    script_injected BOOLEAN DEFAULT FALSE,
    n8n_workflow_id VARCHAR(255),
    tensorflow_instance_id VARCHAR(255),
    seo_score INTEGER,
    automation_threshold INTEGER DEFAULT 120,
    pending_automation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow tasks table - stores task definitions for workflows
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    handler_type VARCHAR(100) NOT NULL,
    handler_config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    ordering INTEGER NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    last_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow attributes table - stores SEO and enrichment attributes
CREATE TABLE IF NOT EXISTS workflow_attributes (
    id SERIAL PRIMARY KEY,
    attribute_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    enrichment_prompt TEXT,
    drilldown_prompts JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow runs table - stores execution history
CREATE TABLE IF NOT EXISTS workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_task VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error TEXT,
    results JSONB DEFAULT '{}'
);

-- Workflow run task executions - detailed task execution logs
CREATE TABLE IF NOT EXISTS workflow_run_tasks (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) REFERENCES workflow_runs(run_id) ON DELETE CASCADE,
    task_id VARCHAR(255) REFERENCES workflow_tasks(task_id),
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    output JSONB DEFAULT '{}',
    error TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(type);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow_id ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_ordering ON workflow_tasks(workflow_id, ordering);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status);

-- Add updated_at trigger for workflows
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_tasks_updated_at BEFORE UPDATE ON workflow_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
