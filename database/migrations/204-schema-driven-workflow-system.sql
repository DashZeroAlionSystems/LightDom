-- Schema-Driven Workflow System Database Schema
-- Implements the research from SCHEMA_AI_RESEARCH_2025.md
-- Date: November 6, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Workflows Table
-- Stores workflow definitions
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_name ON workflows(name);
CREATE INDEX idx_workflows_version ON workflows(version);

-- =====================================================
-- Workflow Steps Table
-- Stores individual steps in workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('manual', 'automated', 'ai')),
  schema JSONB NOT NULL,
  validation JSONB DEFAULT '[]',
  ai_assistance JSONB,
  next_steps JSONB DEFAULT '[]',
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_type ON workflow_steps(type);
CREATE INDEX idx_workflow_steps_position ON workflow_steps(position);

-- =====================================================
-- Workflow Transitions Table
-- Stores transitions between workflow steps
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  from_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  to_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  condition VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_transitions_workflow ON workflow_transitions(workflow_id);
CREATE INDEX idx_workflow_transitions_from ON workflow_transitions(from_step_id);
CREATE INDEX idx_workflow_transitions_to ON workflow_transitions(to_step_id);

-- =====================================================
-- Workflow Executions Table
-- Stores workflow execution instances
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  current_step_id UUID REFERENCES workflow_steps(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  context JSONB DEFAULT '{}',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_started ON workflow_executions(started_at);

-- =====================================================
-- Workflow Execution History Table
-- Stores history of step executions
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_execution_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  input JSONB,
  output JSONB,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT NOW(),
  duration_ms INTEGER
);

CREATE INDEX idx_workflow_execution_history_execution ON workflow_execution_history(execution_id);
CREATE INDEX idx_workflow_execution_history_step ON workflow_execution_history(step_id);
CREATE INDEX idx_workflow_execution_history_executed ON workflow_execution_history(executed_at);

-- =====================================================
-- Generated Components Table
-- Stores AI/schema-generated components
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('form', 'table', 'detail', 'card', 'dashboard')),
  schema JSONB NOT NULL,
  properties JSONB NOT NULL,
  ui_library VARCHAR(50) DEFAULT 'antd',
  framework VARCHAR(50) DEFAULT 'react',
  generated_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_components_name ON generated_components(name);
CREATE INDEX idx_generated_components_type ON generated_components(type);
CREATE INDEX idx_generated_components_framework ON generated_components(framework);

-- =====================================================
-- Schema Registry Table
-- Centralized schema storage and versioning
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  schema JSONB NOT NULL,
  migration JSONB,
  deprecated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, version)
);

CREATE INDEX idx_schema_registry_name ON schema_registry(name);
CREATE INDEX idx_schema_registry_version ON schema_registry(version);
CREATE INDEX idx_schema_registry_deprecated ON schema_registry(deprecated);

-- =====================================================
-- Insert Sample Workflow
-- Content Approval Pipeline from research
-- =====================================================
INSERT INTO workflows (name, description, version, metadata) VALUES
  ('Content Approval Pipeline', 'AI-assisted content review and publication workflow', '1.0', '{"category": "content", "author": "system"}')
ON CONFLICT DO NOTHING;

-- Get the workflow ID for subsequent inserts
DO $$
DECLARE
  workflow_uuid UUID;
  step1_uuid UUID;
  step2_uuid UUID;
  step3_uuid UUID;
  step4_uuid UUID;
BEGIN
  -- Get or create workflow
  SELECT id INTO workflow_uuid FROM workflows WHERE name = 'Content Approval Pipeline' LIMIT 1;
  
  IF workflow_uuid IS NOT NULL THEN
    -- Create steps
    INSERT INTO workflow_steps (workflow_id, name, type, schema, validation, position) VALUES
      (workflow_uuid, 'Content Draft', 'manual', '{"content": "string", "title": "string"}', '[{"rule": "required"}]', 1)
    RETURNING id INTO step1_uuid;
    
    INSERT INTO workflow_steps (workflow_id, name, type, schema, validation, ai_assistance, position) VALUES
      (workflow_uuid, 'AI Content Review', 'ai', '{"content": "string"}', '[]', 
       '{"model": "gpt-4", "promptTemplate": "Review this content for grammar, tone, and accuracy", "confidenceThreshold": 0.85}', 2)
    RETURNING id INTO step2_uuid;
    
    INSERT INTO workflow_steps (workflow_id, name, type, schema, validation, position) VALUES
      (workflow_uuid, 'Editor Review', 'manual', '{"approved": "boolean", "feedback": "string"}', '[]', 3)
    RETURNING id INTO step3_uuid;
    
    INSERT INTO workflow_steps (workflow_id, name, type, schema, validation, position) VALUES
      (workflow_uuid, 'Publish Content', 'automated', '{"publishDate": "date"}', '[{"rule": "required"}]', 4)
    RETURNING id INTO step4_uuid;
    
    -- Create transitions
    INSERT INTO workflow_transitions (workflow_id, from_step_id, to_step_id, condition) VALUES
      (workflow_uuid, step1_uuid, step2_uuid, 'validation_passed'),
      (workflow_uuid, step2_uuid, step3_uuid, 'validation_passed'),
      (workflow_uuid, step3_uuid, step4_uuid, 'approved'),
      (workflow_uuid, step3_uuid, step1_uuid, 'rejected');
  END IF;
END $$;

COMMENT ON TABLE workflows IS 'Stores workflow definitions with AI and automation support';
COMMENT ON TABLE workflow_steps IS 'Individual workflow steps with schema validation and AI assistance';
COMMENT ON TABLE workflow_transitions IS 'Defines allowed transitions between workflow steps';
COMMENT ON TABLE workflow_executions IS 'Tracks active and completed workflow executions';
COMMENT ON TABLE generated_components IS 'Stores schema-generated UI components';
COMMENT ON TABLE schema_registry IS 'Centralized schema versioning and migration tracking';
