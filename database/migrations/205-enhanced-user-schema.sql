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
-- Defines available services and their default configs
-- =====================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  -- Default configuration
  default_config JSONB DEFAULT '{}',
  
  -- Availability by plan
  available_for_plans JSONB DEFAULT '["enterprise"]', -- Array of plan tiers
  
  -- Service metadata
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  requires_api_key BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_name ON services(service_name);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

-- =====================================================
-- User Service Mappings
-- Maps users to their enabled services with custom configs
-- =====================================================

CREATE TABLE IF NOT EXISTS user_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}', -- User-specific overrides
  
  -- Usage tracking
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, service_id)
);

CREATE INDEX idx_user_services_user ON user_services(user_id);
CREATE INDEX idx_user_services_service ON user_services(service_id);
CREATE INDEX idx_user_services_enabled ON user_services(enabled);

-- =====================================================
-- Workflow Templates
-- Defines available workflows
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  -- Workflow definition
  workflow_schema JSONB NOT NULL,
  
  -- Default permissions
  default_permissions JSONB DEFAULT '{"canCreate": false, "canRead": true, "canUpdate": false, "canDelete": false, "canExecute": false}',
  
  -- Availability
  available_for_user_types JSONB DEFAULT '["admin_user"]',
  available_for_plans JSONB DEFAULT '["professional", "enterprise"]',
  requires_services JSONB DEFAULT '[]', -- Array of required service names
  
  -- Workflow metadata
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users_enhanced(id)
);

CREATE INDEX idx_workflow_templates_name ON workflow_templates(name);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(is_active);

-- =====================================================
-- User Workflow Mappings
-- Maps users to their accessible workflows with permissions
-- =====================================================

CREATE TABLE IF NOT EXISTS user_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,
  workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  auto_execute BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{"canCreate": false, "canRead": true, "canUpdate": false, "canDelete": false, "canExecute": false}',
  
  -- Schedule (cron expression)
  schedule VARCHAR(100),
  
  -- Triggers
  triggers JSONB DEFAULT '[]',
  
  -- Custom config
  config JSONB DEFAULT '{}',
  
  -- Usage tracking
  last_executed TIMESTAMP,
  execution_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, workflow_template_id)
);

CREATE INDEX idx_user_workflows_user ON user_workflows(user_id);
CREATE INDEX idx_user_workflows_template ON user_workflows(workflow_template_id);
CREATE INDEX idx_user_workflows_enabled ON user_workflows(enabled);

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

-- Services
INSERT INTO services (service_name, display_name, description, category, default_config, available_for_plans) VALUES
  ('deepseek-ai', 'DeepSeek AI', 'AI chat and code generation with DeepSeek models', 'ai',
   '{"models": ["deepseek-chat", "deepseek-coder"], "maxTokens": 4096, "temperature": 0.7}',
   '["basic", "professional", "enterprise", "deepseek_premium"]'),
  ('workflow-automation', 'Workflow Automation', 'Automated workflow execution and management', 'automation',
   '{"maxConcurrentWorkflows": 5, "enableScheduling": true}',
   '["basic", "professional", "enterprise", "deepseek_premium"]'),
  ('data-mining', 'Data Mining', 'Web crawling and data extraction services', 'data',
   '{"maxPagesPerDay": 1000, "enableJavaScript": true}',
   '["professional", "enterprise"]'),
  ('analytics', 'Analytics Dashboard', 'Advanced analytics and reporting', 'analytics',
   '{"dataRetentionDays": 90, "enableRealTime": true}',
   '["professional", "enterprise"]'),
  ('api-gateway', 'API Gateway', 'Custom API endpoints and integrations', 'integration',
   '{"maxEndpoints": 10, "rateLimiting": true}',
   '["professional", "enterprise"]')
ON CONFLICT (service_name) DO NOTHING;

-- Workflow Templates
INSERT INTO workflow_templates (name, description, category, workflow_schema, available_for_user_types, available_for_plans) VALUES
  ('Content Approval Pipeline', 'AI-assisted content review and publication', 'content',
   '{"steps": [{"id": "draft", "type": "manual"}, {"id": "ai_review", "type": "ai"}, {"id": "publish", "type": "automated"}]}',
   '["admin_user", "paid_plan_user", "deepseek_user"]',
   '["professional", "enterprise", "deepseek_premium"]'),
  ('Data Collection Workflow', 'Automated data collection and processing', 'data',
   '{"steps": [{"id": "collect", "type": "automated"}, {"id": "process", "type": "ai"}, {"id": "store", "type": "automated"}]}',
   '["admin_user", "paid_plan_user"]',
   '["professional", "enterprise"]'),
  ('User Onboarding', 'Automated user onboarding and setup', 'admin',
   '{"steps": [{"id": "signup", "type": "manual"}, {"id": "verify", "type": "automated"}, {"id": "setup", "type": "automated"}]}',
   '["admin_user"]',
   '["enterprise"]')
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

-- Triggers for updated_at
CREATE TRIGGER trigger_users_enhanced_updated_at BEFORE UPDATE ON users_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_plan_tiers_updated_at BEFORE UPDATE ON plan_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users_enhanced IS 'Enhanced user table with user types, plans, and config-driven service/workflow access';
COMMENT ON TABLE user_types IS 'Defines different types of users (DeepSeek, Admin, Paid, Free)';
COMMENT ON TABLE plan_tiers IS 'Subscription plan tiers with features and limits';
COMMENT ON TABLE services IS 'Available services that can be enabled for users';
COMMENT ON TABLE user_services IS 'Maps users to their enabled services with custom configurations';
COMMENT ON TABLE workflow_templates IS 'Reusable workflow definitions';
COMMENT ON TABLE user_workflows IS 'Maps users to accessible workflows with permissions';
COMMENT ON TABLE user_quotas IS 'Tracks user quotas and usage limits';
