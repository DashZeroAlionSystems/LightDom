-- Workflow Prompt System Database Schema
-- Complete schema for workflow prompt interface, component generation, and styleguide mining

-- Workflow Prompts Table
CREATE TABLE IF NOT EXISTS workflow_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt_text TEXT NOT NULL,
  ai_response JSONB,
  workflow_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_prompts_user ON workflow_prompts(user_id);
CREATE INDEX idx_workflow_prompts_created ON workflow_prompts(created_at DESC);

-- Workflow Executions Table  
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  total_steps INTEGER DEFAULT 0,
  completed_steps INTEGER DEFAULT 0,
  execution_data JSONB,
  error_message TEXT
);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Workflow Steps Table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  config JSONB,
  input_data JSONB,
  output_data JSONB,
  logs TEXT[],
  errors TEXT[],
  metrics JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

CREATE INDEX idx_workflow_steps_execution ON workflow_steps(execution_id);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(execution_id, step_order);

-- Workflow Change History
CREATE TABLE IF NOT EXISTS workflow_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  field VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_history_workflow ON workflow_change_history(workflow_id);
CREATE INDEX idx_workflow_history_changed ON workflow_change_history(changed_at DESC);

-- User Workflow Context
CREATE TABLE IF NOT EXISTS user_workflow_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  active_project_id UUID,
  recent_workflows UUID[],
  preferences JSONB,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_context_user ON user_workflow_context(user_id);

-- Styleguide Schemas
CREATE TABLE IF NOT EXISTS styleguide_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) DEFAULT '1.0.0',
  schema_data JSONB NOT NULL,
  storybook_url VARCHAR(500),
  last_mined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_styleguide_schemas_active ON styleguide_schemas(is_active);
CREATE INDEX idx_styleguide_schemas_mined ON styleguide_schemas(last_mined_at DESC);

-- Generated Components
CREATE TABLE IF NOT EXISTS generated_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  prompt_text TEXT NOT NULL,
  styleguide_id UUID REFERENCES styleguide_schemas(id),
  component_code TEXT NOT NULL,
  story_code TEXT,
  file_paths JSONB,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL
);

CREATE INDEX idx_generated_components_user ON generated_components(user_id);
CREATE INDEX idx_generated_components_styleguide ON generated_components(styleguide_id);

-- Component Patterns
CREATE TABLE IF NOT EXISTS component_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  styleguide_id UUID REFERENCES styleguide_schemas(id),
  pattern_name VARCHAR(255) NOT NULL,
  pattern_type VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  components TEXT[],
  best_practices TEXT[],
  pattern_data JSONB,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_component_patterns_styleguide ON component_patterns(styleguide_id);
CREATE INDEX idx_component_patterns_usage ON component_patterns(usage_count DESC);

-- Seed Data
INSERT INTO styleguide_schemas (id, name, version, schema_data, storybook_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Main Design System', '1.0.0', 
'{"designSystem":{"colors":["#6366f1","#764ba2"],"typography":{"fontFamilies":["Inter"]}},"components":[],"patterns":[]}', 
'http://localhost:6006')
ON CONFLICT DO NOTHING;
