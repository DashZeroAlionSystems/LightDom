-- Enhanced User Schema with User Types, Plans, and Configs
-- Supports: DeepSeek users, Admin users, Paid/Free plan users
-- Date: November 6, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- User Types and Plans Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS user_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_name VARCHAR(50) UNIQUE NOT NULL CHECK (type_name IN ('deepseek_user', 'admin_user', 'paid_plan_user', 'free_plan_user')),
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  default_role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name VARCHAR(50) UNIQUE NOT NULL CHECK (tier_name IN ('free', 'basic', 'professional', 'enterprise', 'deepseek_premium')),
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Enhanced Users Table
-- =====================================================

CREATE TABLE IF NOT EXISTS users_enhanced (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  
  -- User type and role
  user_type VARCHAR(50) NOT NULL REFERENCES user_types(type_name),
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'moderator', 'user', 'viewer')),
  
  -- Plan information
  plan_tier VARCHAR(50) NOT NULL REFERENCES plan_tiers(tier_name),
  
  -- User configuration (JSONB for flexibility)
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Authentication
  password_hash VARCHAR(255),
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_modified_by UUID REFERENCES users_enhanced(id),
  
  -- Additional metadata
  avatar VARCHAR(500),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_enhanced_email ON users_enhanced(email);
CREATE INDEX idx_users_enhanced_username ON users_enhanced(username);
CREATE INDEX idx_users_enhanced_user_type ON users_enhanced(user_type);
CREATE INDEX idx_users_enhanced_plan_tier ON users_enhanced(plan_tier);
CREATE INDEX idx_users_enhanced_status ON users_enhanced(status);
CREATE INDEX idx_users_enhanced_config ON users_enhanced USING GIN(config);

-- =====================================================
-- Service Configurations Table
-- Defines available services as standalone modules
-- Services are ONLY active when included in user config
-- =====================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  -- Module definition - standalone service config
  module_path VARCHAR(500), -- Path to service module (e.g., 'src/services/deepseek-ai')
  entry_point VARCHAR(255), -- Main entry file (e.g., 'index.ts')
  dependencies JSONB DEFAULT '[]', -- Required npm packages or other services
  
  -- Default configuration for the service
  default_config JSONB DEFAULT '{}',
  
  -- Availability rules (config-driven inclusion/exclusion)
  available_for_user_types JSONB DEFAULT '["admin_user"]', -- Array of user types
  available_for_plans JSONB DEFAULT '["enterprise"]', -- Array of plan tiers
  excluded_for_user_types JSONB DEFAULT '[]', -- Explicit exclusions
  excluded_for_plans JSONB DEFAULT '[]', -- Explicit plan exclusions
  
  -- Service module metadata
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_standalone BOOLEAN DEFAULT true, -- Can run independently
  requires_api_key BOOLEAN DEFAULT false,
  requires_database BOOLEAN DEFAULT false,
  requires_redis BOOLEAN DEFAULT false,
  
  -- Load configuration
  auto_load BOOLEAN DEFAULT false, -- Auto-load on startup if in config
  load_priority INTEGER DEFAULT 100, -- Lower = higher priority
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_name ON services(service_name);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_standalone ON services(is_standalone);
CREATE INDEX idx_services_available_types ON services USING GIN(available_for_user_types);
CREATE INDEX idx_services_available_plans ON services USING GIN(available_for_plans);

-- =====================================================
-- User Service Mappings
-- Maps users to their enabled services with custom configs
-- Service is ONLY active/loaded if this mapping exists AND enabled=true
-- This provides complete config-driven inclusion/exclusion
-- =====================================================

CREATE TABLE IF NOT EXISTS user_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Core activation - service only runs if enabled=true
  enabled BOOLEAN DEFAULT true,
  
  -- User-specific service configuration overrides
  config JSONB DEFAULT '{}',
  
  -- Module loading control
  load_on_startup BOOLEAN DEFAULT false, -- Load when user logs in
  keep_in_memory BOOLEAN DEFAULT false, -- Keep service loaded
  
  -- Custom limits (overrides service defaults)
  custom_limits JSONB DEFAULT '{}',
  
  -- Usage tracking
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  total_api_calls INTEGER DEFAULT 0,
  
  -- Activation/deactivation tracking
  activated_at TIMESTAMP DEFAULT NOW(),
  deactivated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, service_id)
);

CREATE INDEX idx_user_services_user ON user_services(user_id);
CREATE INDEX idx_user_services_service ON user_services(service_id);
CREATE INDEX idx_user_services_enabled ON user_services(enabled);
CREATE INDEX idx_user_services_load_startup ON user_services(load_on_startup);

-- =====================================================
-- Workflow Templates
-- Defines available workflows as standalone modules
-- Workflows are ONLY active when included in user config
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  -- Module definition - standalone workflow config
  module_path VARCHAR(500), -- Path to workflow module (e.g., 'src/workflows/content-approval')
  entry_point VARCHAR(255), -- Main entry file
  dependencies JSONB DEFAULT '[]', -- Required packages or services
  
  -- Workflow definition
  workflow_schema JSONB NOT NULL,
  
  -- Default permissions
  default_permissions JSONB DEFAULT '{"canCreate": false, "canRead": true, "canUpdate": false, "canDelete": false, "canExecute": false}',
  
  -- Availability rules (config-driven inclusion/exclusion)
  available_for_user_types JSONB DEFAULT '["admin_user"]',
  available_for_plans JSONB DEFAULT '["professional", "enterprise"]',
  excluded_for_user_types JSONB DEFAULT '[]', -- Explicit exclusions
  excluded_for_plans JSONB DEFAULT '[]', -- Explicit plan exclusions
  requires_services JSONB DEFAULT '[]', -- Array of required service names
  
  -- Workflow module metadata
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_standalone BOOLEAN DEFAULT true, -- Can run independently
  is_system BOOLEAN DEFAULT false, -- System workflow (can't be disabled)
  
  -- Load configuration
  auto_load BOOLEAN DEFAULT false, -- Auto-load on startup if in config
  load_priority INTEGER DEFAULT 100, -- Lower = higher priority
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users_enhanced(id)
);

CREATE INDEX idx_workflow_templates_name ON workflow_templates(name);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(is_active);
CREATE INDEX idx_workflow_templates_standalone ON workflow_templates(is_standalone);
CREATE INDEX idx_workflow_templates_available_types ON workflow_templates USING GIN(available_for_user_types);
CREATE INDEX idx_workflow_templates_available_plans ON workflow_templates USING GIN(available_for_plans);

-- =====================================================
-- User Workflow Mappings
-- Maps users to their accessible workflows with permissions
-- Workflow is ONLY active/loaded if this mapping exists AND enabled=true
-- This provides complete config-driven inclusion/exclusion
-- =====================================================

CREATE TABLE IF NOT EXISTS user_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,
  workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  
  -- Core activation - workflow only runs if enabled=true
  enabled BOOLEAN DEFAULT true,
  auto_execute BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{"canCreate": false, "canRead": true, "canUpdate": false, "canDelete": false, "canExecute": false}',
  
  -- Module loading control
  load_on_startup BOOLEAN DEFAULT false, -- Load when user logs in
  keep_in_memory BOOLEAN DEFAULT false, -- Keep workflow loaded
  
  -- Schedule (cron expression)
  schedule VARCHAR(100),
  
  -- Triggers
  triggers JSONB DEFAULT '[]',
  
  -- Custom config (overrides template defaults)
  config JSONB DEFAULT '{}',
  
  -- Custom limits
  custom_limits JSONB DEFAULT '{}',
  
  -- Usage tracking
  last_executed TIMESTAMP,
  execution_count INTEGER DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  
  -- Activation/deactivation tracking
  activated_at TIMESTAMP DEFAULT NOW(),
  deactivated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, workflow_template_id)
);

CREATE INDEX idx_user_workflows_user ON user_workflows(user_id);
CREATE INDEX idx_user_workflows_template ON user_workflows(workflow_template_id);
CREATE INDEX idx_user_workflows_enabled ON user_workflows(enabled);
CREATE INDEX idx_user_workflows_load_startup ON user_workflows(load_on_startup);
CREATE INDEX idx_user_workflows_auto_execute ON user_workflows(auto_execute);

-- =====================================================
-- User Quotas and Usage Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS user_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users_enhanced(id) ON DELETE CASCADE,
  
  -- Storage quotas
  storage_quota_gb INTEGER NOT NULL DEFAULT 1,
  storage_used_gb DECIMAL(10, 3) DEFAULT 0,
  
  -- API quotas
  api_calls_per_day INTEGER NOT NULL DEFAULT 100,
  api_calls_today INTEGER DEFAULT 0,
  api_calls_reset_at TIMESTAMP DEFAULT NOW(),
  
  -- Workflow quotas
  workflow_executions_per_day INTEGER NOT NULL DEFAULT 10,
  workflow_executions_today INTEGER DEFAULT 0,
  workflow_executions_reset_at TIMESTAMP DEFAULT NOW(),
  
  max_concurrent_workflows INTEGER NOT NULL DEFAULT 1,
  current_concurrent_workflows INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_quotas_user ON user_quotas(user_id);

-- =====================================================
-- Insert Default Data
-- =====================================================

-- User Types
INSERT INTO user_types (type_name, display_name, description, default_role) VALUES
  ('deepseek_user', 'DeepSeek User', 'Users focused on AI/ML services with DeepSeek integration', 'user'),
  ('admin_user', 'Admin User', 'System administrators with full access', 'admin'),
  ('paid_plan_user', 'Paid Plan User', 'Users with paid subscription plans', 'user'),
  ('free_plan_user', 'Free Plan User', 'Users on free tier with limited features', 'user')
ON CONFLICT (type_name) DO NOTHING;

-- Plan Tiers
INSERT INTO plan_tiers (tier_name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
  ('free', 'Free', 'Basic features for getting started', 0.00, 0.00, 
   '["basic_workflows", "limited_storage", "email_support"]',
   '{"storageGB": 1, "apiCallsPerDay": 100, "workflowExecutionsPerDay": 10}'),
  ('basic', 'Basic', 'Essential features for individuals', 9.99, 99.99,
   '["unlimited_workflows", "10gb_storage", "priority_support", "basic_ai"]',
   '{"storageGB": 10, "apiCallsPerDay": 1000, "workflowExecutionsPerDay": 100}'),
  ('professional', 'Professional', 'Advanced features for professionals', 29.99, 299.99,
   '["advanced_workflows", "50gb_storage", "priority_support", "advanced_ai", "custom_integrations"]',
   '{"storageGB": 50, "apiCallsPerDay": 10000, "workflowExecutionsPerDay": 1000}'),
  ('enterprise', 'Enterprise', 'Full features for organizations', 99.99, 999.99,
   '["unlimited_workflows", "500gb_storage", "24/7_support", "enterprise_ai", "custom_integrations", "sla"]',
   '{"storageGB": 500, "apiCallsPerDay": 100000, "workflowExecutionsPerDay": 10000}'),
  ('deepseek_premium', 'DeepSeek Premium', 'Premium AI features with DeepSeek', 49.99, 499.99,
   '["deepseek_ai", "unlimited_workflows", "100gb_storage", "ai_support", "advanced_models"]',
   '{"storageGB": 100, "apiCallsPerDay": 20000, "workflowExecutionsPerDay": 2000}')
ON CONFLICT (tier_name) DO NOTHING;

-- Services (Standalone Modules)
INSERT INTO services (
  service_name, display_name, description, category, 
  module_path, entry_point, dependencies,
  default_config, 
  available_for_user_types, available_for_plans,
  is_standalone, auto_load, load_priority
) VALUES
  ('deepseek-ai', 'DeepSeek AI', 'AI chat and code generation with DeepSeek models', 'ai',
   'src/services/deepseek-ai', 'index.ts', '["axios", "@deepseek/sdk"]',
  '{"models": ["deepseek-reasoner", "deepseek-chat", "deepseek-coder"], "defaultModel": "deepseek-reasoner", "maxTokens": 4096, "temperature": 0.7}',
   '["deepseek_user", "admin_user", "paid_plan_user"]',
   '["basic", "professional", "enterprise", "deepseek_premium"]',
   true, true, 10),
   
  ('workflow-automation', 'Workflow Automation', 'Automated workflow execution and management', 'automation',
   'src/services/workflow-automation', 'index.ts', '["node-cron", "bull"]',
   '{"maxConcurrentWorkflows": 5, "enableScheduling": true}',
   '["admin_user", "paid_plan_user", "deepseek_user"]',
   '["basic", "professional", "enterprise", "deepseek_premium"]',
   true, true, 20),
   
  ('data-mining', 'Data Mining', 'Web crawling and data extraction services', 'data',
   'src/services/data-mining', 'index.ts', '["puppeteer", "cheerio"]',
   '{"maxPagesPerDay": 1000, "enableJavaScript": true}',
   '["admin_user", "paid_plan_user"]',
   '["professional", "enterprise"]',
   true, false, 30),
   
  ('analytics', 'Analytics Dashboard', 'Advanced analytics and reporting', 'analytics',
   'src/services/analytics', 'index.ts', '["chart.js", "d3"]',
   '{"dataRetentionDays": 90, "enableRealTime": true}',
   '["admin_user", "paid_plan_user"]',
   '["professional", "enterprise"]',
   true, false, 40),
   
  ('api-gateway', 'API Gateway', 'Custom API endpoints and integrations', 'integration',
   'src/services/api-gateway', 'index.ts', '["express", "rate-limiter-flexible"]',
   '{"maxEndpoints": 10, "rateLimiting": true}',
   '["admin_user", "paid_plan_user"]',
   '["professional", "enterprise"]',
   true, true, 15)
ON CONFLICT (service_name) DO NOTHING;

-- Workflow Templates (Standalone Modules)
INSERT INTO workflow_templates (
  name, description, category,
  module_path, entry_point, dependencies,
  workflow_schema,
  available_for_user_types, available_for_plans,
  requires_services, is_standalone, auto_load, load_priority
) VALUES
  ('Content Approval Pipeline', 'AI-assisted content review and publication', 'content',
   'src/workflows/content-approval', 'index.ts', '[]',
   '{"steps": [{"id": "draft", "type": "manual"}, {"id": "ai_review", "type": "ai"}, {"id": "publish", "type": "automated"}]}',
   '["admin_user", "paid_plan_user", "deepseek_user"]',
   '["professional", "enterprise", "deepseek_premium"]',
   '["deepseek-ai", "workflow-automation"]',
   true, false, 50),
   
  ('Data Collection Workflow', 'Automated data collection and processing', 'data',
   'src/workflows/data-collection', 'index.ts', '[]',
   '{"steps": [{"id": "collect", "type": "automated"}, {"id": "process", "type": "ai"}, {"id": "store", "type": "automated"}]}',
   '["admin_user", "paid_plan_user"]',
   '["professional", "enterprise"]',
   '["data-mining", "deepseek-ai", "workflow-automation"]',
   true, false, 60),
   
  ('User Onboarding', 'Automated user onboarding and setup', 'admin',
   'src/workflows/user-onboarding', 'index.ts', '[]',
   '{"steps": [{"id": "signup", "type": "manual"}, {"id": "verify", "type": "automated"}, {"id": "setup", "type": "automated"}]}',
   '["admin_user"]',
   '["enterprise"]',
   '["workflow-automation"]',
   true, true, 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to create default quota for new users
CREATE OR REPLACE FUNCTION create_default_user_quota()
RETURNS TRIGGER AS $$
DECLARE
  plan_limits JSONB;
BEGIN
  -- Get plan limits
  SELECT limits INTO plan_limits FROM plan_tiers WHERE tier_name = NEW.plan_tier;
  
  -- Create quota record
  INSERT INTO user_quotas (
    user_id,
    storage_quota_gb,
    api_calls_per_day,
    workflow_executions_per_day,
    max_concurrent_workflows
  ) VALUES (
    NEW.id,
    COALESCE((plan_limits->>'storageGB')::INTEGER, 1),
    COALESCE((plan_limits->>'apiCallsPerDay')::INTEGER, 100),
    COALESCE((plan_limits->>'workflowExecutionsPerDay')::INTEGER, 10),
    CASE 
      WHEN NEW.plan_tier = 'free' THEN 1
      WHEN NEW.plan_tier = 'basic' THEN 5
      WHEN NEW.plan_tier = 'professional' THEN 20
      ELSE 100
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default quota
CREATE TRIGGER trigger_create_user_quota
  AFTER INSERT ON users_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_quota();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Helper Functions for Config-Driven Module Loading
-- =====================================================

-- Function to check if service should be loaded for user
CREATE OR REPLACE FUNCTION should_load_service(
  p_user_id UUID,
  p_service_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_is_enabled BOOLEAN;
  v_exists BOOLEAN;
BEGIN
  -- Check if user_service mapping exists and is enabled
  SELECT 
    EXISTS(SELECT 1 FROM user_services us WHERE us.user_id = p_user_id AND us.service_id = (SELECT id FROM services WHERE service_name = p_service_name)),
    COALESCE(us.enabled, false)
  INTO v_exists, v_is_enabled
  FROM user_services us
  WHERE us.user_id = p_user_id 
    AND us.service_id = (SELECT id FROM services WHERE service_name = p_service_name);
  
  -- Service only loads if mapping exists AND enabled=true
  RETURN v_exists AND v_is_enabled;
END;
$$ LANGUAGE plpgsql;

-- Function to check if workflow should be loaded for user
CREATE OR REPLACE FUNCTION should_load_workflow(
  p_user_id UUID,
  p_workflow_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_is_enabled BOOLEAN;
  v_exists BOOLEAN;
BEGIN
  -- Check if user_workflow mapping exists and is enabled
  SELECT 
    EXISTS(SELECT 1 FROM user_workflows uw WHERE uw.user_id = p_user_id AND uw.workflow_template_id = p_workflow_id),
    COALESCE(uw.enabled, false)
  INTO v_exists, v_is_enabled
  FROM user_workflows uw
  WHERE uw.user_id = p_user_id 
    AND uw.workflow_template_id = p_workflow_id;
  
  -- Workflow only loads if mapping exists AND enabled=true
  RETURN v_exists AND v_is_enabled;
END;
$$ LANGUAGE plpgsql;

-- Function to get all active services for a user (for module loading)
CREATE OR REPLACE FUNCTION get_active_services_for_user(
  p_user_id UUID
) RETURNS TABLE (
  service_name VARCHAR,
  module_path VARCHAR,
  entry_point VARCHAR,
  config JSONB,
  load_on_startup BOOLEAN,
  load_priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.service_name,
    s.module_path,
    s.entry_point,
    COALESCE(us.config, s.default_config) as config,
    us.load_on_startup,
    s.load_priority
  FROM user_services us
  JOIN services s ON us.service_id = s.id
  WHERE us.user_id = p_user_id
    AND us.enabled = true
    AND s.is_active = true
  ORDER BY s.load_priority ASC, s.service_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all active workflows for a user (for module loading)
CREATE OR REPLACE FUNCTION get_active_workflows_for_user(
  p_user_id UUID
) RETURNS TABLE (
  workflow_id UUID,
  workflow_name VARCHAR,
  module_path VARCHAR,
  entry_point VARCHAR,
  config JSONB,
  permissions JSONB,
  load_on_startup BOOLEAN,
  load_priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.name,
    wt.module_path,
    wt.entry_point,
    COALESCE(uw.config, '{}') as config,
    uw.permissions,
    uw.load_on_startup,
    wt.load_priority
  FROM user_workflows uw
  JOIN workflow_templates wt ON uw.workflow_template_id = wt.id
  WHERE uw.user_id = p_user_id
    AND uw.enabled = true
    AND wt.is_active = true
  ORDER BY wt.load_priority ASC, wt.name;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_users_enhanced_updated_at BEFORE UPDATE ON users_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_plan_tiers_updated_at BEFORE UPDATE ON plan_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table Comments - Config-Driven Architecture
-- =====================================================

COMMENT ON TABLE users_enhanced IS 'Enhanced user table with user types, plans, and config-driven service/workflow access';
COMMENT ON TABLE user_types IS 'Defines different types of users (DeepSeek, Admin, Paid, Free)';
COMMENT ON TABLE plan_tiers IS 'Subscription plan tiers with features and limits';

COMMENT ON TABLE services IS 'Standalone service modules. Each service is a self-contained module that is ONLY loaded/active when included in user_services with enabled=true. Services can be completely included or excluded by config.';

COMMENT ON TABLE user_services IS 'Config-driven service activation. A service is ONLY active for a user if this mapping exists AND enabled=true. Removing the mapping or setting enabled=false completely excludes the service module from loading.';

COMMENT ON TABLE workflow_templates IS 'Standalone workflow modules. Each workflow is a self-contained module that is ONLY loaded/active when included in user_workflows with enabled=true. Workflows can be completely included or excluded by config.';

COMMENT ON TABLE user_workflows IS 'Config-driven workflow activation. A workflow is ONLY active for a user if this mapping exists AND enabled=true. Removing the mapping or setting enabled=false completely excludes the workflow module from loading.';

COMMENT ON TABLE user_quotas IS 'Tracks user quotas and usage limits';

-- =====================================================
-- Config-Driven Module Loading Rules
-- =====================================================
-- 
-- CRITICAL: Services and workflows are STANDALONE modules
-- 
-- A service/workflow is loaded if and ONLY if:
--   1. A mapping exists in user_services/user_workflows table
--   2. The enabled column is TRUE
--   3. The service/workflow is_active is TRUE
-- 
-- To INCLUDE a service/workflow for a user:
--   INSERT INTO user_services (user_id, service_id, enabled) VALUES (..., TRUE);
-- 
-- To EXCLUDE a service/workflow:
--   Option 1: DELETE FROM user_services WHERE user_id = ... AND service_id = ...;
--   Option 2: UPDATE user_services SET enabled = FALSE WHERE user_id = ... AND service_id = ...;
-- 
-- Service/Workflow availability by user type and plan:
--   - available_for_user_types: Which user types CAN have this module
--   - available_for_plans: Which plan tiers CAN have this module
--   - excluded_for_user_types: Explicit exclusions (override availability)
--   - excluded_for_plans: Explicit plan exclusions (override availability)
-- 
-- Module loading on user login:
--   SELECT * FROM get_active_services_for_user(user_id);
--   SELECT * FROM get_active_workflows_for_user(user_id);
-- 
-- This returns ONLY modules that should be loaded based on config.
-- Each module has module_path and entry_point for dynamic loading.
-- ====================================================
