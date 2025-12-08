-- Security Monitoring System Migration
-- Creates tables for security layers, monitoring, and pattern tracking

-- Security Layers table - defines security configurations
CREATE TABLE IF NOT EXISTS security_layers (
  layer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  enabled_checks TEXT[] DEFAULT ARRAY['authentication', 'authorization', 'data_validation', 'rate_limiting', 'input_sanitization', 'output_encoding'],
  monitoring_mode VARCHAR(50) DEFAULT 'active' CHECK (monitoring_mode IN ('passive', 'active', 'strict')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Instance Security Profiles - links instances to security layers
CREATE TABLE IF NOT EXISTS instance_security_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  layer_id UUID NOT NULL REFERENCES security_layers(layer_id),
  prompt_history JSONB DEFAULT '[]',
  activity_log JSONB DEFAULT '[]',
  security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
  last_check_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'monitoring' CHECK (status IN ('secure', 'warning', 'compromised', 'monitoring')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(instance_id)
);

-- Security Checks table - logs all security checks
CREATE TABLE IF NOT EXISTS security_checks (
  check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  check_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'monitoring')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Workflow Patterns table - tracks successful and emerging patterns
CREATE TABLE IF NOT EXISTS workflow_patterns (
  pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('successful', 'failed', 'optimized', 'security_compliant')),
  execution_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (success_rate >= 0 AND success_rate <= 100),
  avg_duration_ms INTEGER DEFAULT 0,
  security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
  pattern_data JSONB DEFAULT '{}',
  emerged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(workflow_id, pattern_type)
);

-- Workflow Sub-workflows table - supports nested workflows
CREATE TABLE IF NOT EXISTS workflow_subworkflows (
  subworkflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_workflow_id UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  child_workflow_id UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  execution_order INTEGER NOT NULL DEFAULT 0,
  condition JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(parent_workflow_id, child_workflow_id, execution_order)
);

-- Security Violations table - tracks security incidents
CREATE TABLE IF NOT EXISTS security_violations (
  violation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES agent_instances(instance_id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
  violation_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  action_taken VARCHAR(255),
  resolved BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_layers_active ON security_layers(is_active);
CREATE INDEX IF NOT EXISTS idx_instance_security_profiles_instance ON instance_security_profiles(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_security_profiles_layer ON instance_security_profiles(layer_id);
CREATE INDEX IF NOT EXISTS idx_instance_security_profiles_status ON instance_security_profiles(status);
CREATE INDEX IF NOT EXISTS idx_security_checks_instance ON security_checks(instance_id);
CREATE INDEX IF NOT EXISTS idx_security_checks_workflow ON security_checks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_security_checks_time ON security_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_checks_status ON security_checks(status);
CREATE INDEX IF NOT EXISTS idx_workflow_patterns_workflow ON workflow_patterns(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_patterns_type ON workflow_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_workflow_patterns_success ON workflow_patterns(success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_subworkflows_parent ON workflow_subworkflows(parent_workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_subworkflows_child ON workflow_subworkflows(child_workflow_id);
CREATE INDEX IF NOT EXISTS idx_security_violations_instance ON security_violations(instance_id);
CREATE INDEX IF NOT EXISTS idx_security_violations_unresolved ON security_violations(resolved) WHERE resolved = FALSE;

-- Triggers for updated_at
CREATE TRIGGER update_security_layers_updated_at 
  BEFORE UPDATE ON security_layers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instance_security_profiles_updated_at 
  BEFORE UPDATE ON instance_security_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default security layer with best practices
INSERT INTO security_layers (name, description, config, monitoring_mode) VALUES
(
  'Default Security Layer',
  'Default security layer with industry best practices',
  '{
    "max_execution_time": 300000,
    "max_memory_mb": 512,
    "allowed_network_access": true,
    "require_approval": false,
    "auto_terminate_on_violation": false,
    "log_all_activities": true,
    "max_requests_per_minute": 60,
    "enable_audit_logging": true,
    "data_encryption": true,
    "secure_communication": true
  }'::jsonb,
  'active'
),
(
  'Strict Security Layer',
  'Strict security layer for sensitive operations',
  '{
    "max_execution_time": 180000,
    "max_memory_mb": 256,
    "allowed_network_access": false,
    "require_approval": true,
    "auto_terminate_on_violation": true,
    "log_all_activities": true,
    "max_requests_per_minute": 30,
    "enable_audit_logging": true,
    "data_encryption": true,
    "secure_communication": true
  }'::jsonb,
  'strict'
)
ON CONFLICT DO NOTHING;
