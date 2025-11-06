-- Migration: Add schema-driven workflow support
-- Description: Add fields for JSON schema-based workflow templates
-- Created: 2025-11-03

-- Add schema fields to workflows table
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS template_id VARCHAR(255);
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add schema fields to workflow_tasks table
ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]';
ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS condition JSONB;
ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS output_mapping JSONB;

-- Add index for template lookups
CREATE INDEX IF NOT EXISTS idx_workflows_template_id ON workflows(template_id);
CREATE INDEX IF NOT EXISTS idx_workflows_version ON workflows(version);

-- Create workflow_templates table for storing reusable templates
CREATE TABLE IF NOT EXISTS workflow_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    schema_definition JSONB NOT NULL,
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for template searches
CREATE INDEX IF NOT EXISTS idx_workflow_templates_type ON workflow_templates(type);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);

-- Add updated_at trigger for workflow_templates
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add validation field to workflow_attributes
ALTER TABLE workflow_attributes ADD COLUMN IF NOT EXISTS validation JSONB;

COMMENT ON TABLE workflow_templates IS 'Reusable workflow templates with JSON schema definitions';
COMMENT ON COLUMN workflows.template_id IS 'Reference to workflow_templates.template_id if instantiated from template';
COMMENT ON COLUMN workflows.version IS 'Schema version for compatibility tracking';
COMMENT ON COLUMN workflows.config IS 'Workflow-level configuration (parallel execution, retry policy, etc.)';
COMMENT ON COLUMN workflows.metadata IS 'Additional metadata (author, tags, category, etc.)';
COMMENT ON COLUMN workflow_tasks.dependencies IS 'Array of task IDs that must complete before this task';
COMMENT ON COLUMN workflow_tasks.condition IS 'Conditional execution rules';
COMMENT ON COLUMN workflow_tasks.output_mapping IS 'Output variable mappings for task chaining';
