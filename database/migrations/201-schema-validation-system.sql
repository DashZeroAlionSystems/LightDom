-- Schema Validation System Migration
-- Creates tables for storing and managing validation schemas

-- Validation Schemas table
CREATE TABLE IF NOT EXISTS validation_schemas (
  schema_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  json_schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  UNIQUE(entity_type, version)
);

-- Validation History table - tracks all validation attempts
CREATE TABLE IF NOT EXISTS validation_history (
  validation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  schema_version VARCHAR(50),
  validation_status VARCHAR(50) NOT NULL, -- success, failed, warning
  input_data JSONB,
  errors JSONB DEFAULT '[]',
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Schema Evolution table - tracks schema changes over time
CREATE TABLE IF NOT EXISTS schema_evolution (
  evolution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  from_version VARCHAR(50),
  to_version VARCHAR(50) NOT NULL,
  changes JSONB NOT NULL,
  migration_script TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  applied_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_validation_schemas_entity ON validation_schemas(entity_type);
CREATE INDEX IF NOT EXISTS idx_validation_schemas_active ON validation_schemas(is_active);
CREATE INDEX IF NOT EXISTS idx_validation_history_entity ON validation_history(entity_type);
CREATE INDEX IF NOT EXISTS idx_validation_history_status ON validation_history(validation_status);
CREATE INDEX IF NOT EXISTS idx_validation_history_time ON validation_history(validated_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_evolution_entity ON schema_evolution(entity_type);

-- Trigger for updated_at
CREATE TRIGGER update_validation_schemas_updated_at 
  BEFORE UPDATE ON validation_schemas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default validation schemas
INSERT INTO validation_schemas (entity_type, version, json_schema, is_active) VALUES
(
  'agent_session',
  '1.0.0',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["name", "agent_type"],
    "properties": {
      "name": {"type": "string", "minLength": 1, "maxLength": 255},
      "description": {"type": "string", "maxLength": 1000},
      "agent_type": {"type": "string", "enum": ["deepseek", "gpt4", "claude", "custom"]},
      "configuration": {"type": "object"},
      "context_data": {"type": "object"}
    },
    "additionalProperties": false
  }'::jsonb,
  true
),
(
  'agent_instance',
  '1.0.0',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["session_id", "name", "model_name"],
    "properties": {
      "session_id": {"type": "string", "format": "uuid"},
      "name": {"type": "string", "minLength": 1, "maxLength": 255},
      "model_name": {"type": "string", "minLength": 1},
      "model_version": {"type": "string"},
      "fine_tune_config": {"type": "object"},
      "tools_enabled": {"type": "array", "items": {"type": "string"}},
      "services_enabled": {"type": "array", "items": {"type": "string"}},
      "max_tokens": {"type": "integer", "minimum": 1, "maximum": 32768},
      "temperature": {"type": "number", "minimum": 0, "maximum": 2}
    },
    "additionalProperties": false
  }'::jsonb,
  true
),
(
  'agent_tool',
  '1.0.0',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["name", "handler_function", "input_schema", "output_schema"],
    "properties": {
      "name": {"type": "string", "minLength": 1, "maxLength": 255},
      "description": {"type": "string", "maxLength": 1000},
      "category": {"type": "string"},
      "service_type": {"type": "string"},
      "handler_function": {"type": "string", "minLength": 1},
      "input_schema": {"type": "object"},
      "output_schema": {"type": "object"},
      "configuration": {"type": "object"},
      "is_active": {"type": "boolean"},
      "requires_auth": {"type": "boolean"},
      "rate_limit": {"type": "integer", "minimum": 0}
    },
    "additionalProperties": false
  }'::jsonb,
  true
),
(
  'agent_workflow',
  '1.0.0',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["name", "workflow_type", "configuration"],
    "properties": {
      "name": {"type": "string", "minLength": 1, "maxLength": 255},
      "description": {"type": "string", "maxLength": 1000},
      "workflow_type": {"type": "string", "enum": ["sequential", "parallel", "dag", "conditional"]},
      "configuration": {"type": "object"},
      "input_schema": {"type": "object"},
      "output_schema": {"type": "object"},
      "is_template": {"type": "boolean"},
      "is_active": {"type": "boolean"}
    },
    "additionalProperties": false
  }'::jsonb,
  true
)
ON CONFLICT (entity_type, version) DO NOTHING;
