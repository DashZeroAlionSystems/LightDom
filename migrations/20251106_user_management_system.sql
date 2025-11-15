-- User Management System Migration
-- Comprehensive schema for user CRUD, roles, plans, and authentication
-- Created: 2025-11-06

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================
-- Define available user roles in the system
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL CHECK (role_name IN ('admin', 'deepseek', 'pro', 'enterprise', 'free', 'guest')),
    role_label VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system roles
INSERT INTO user_roles (role_name, role_label, description, permissions, is_system_role) VALUES
    ('admin', 'Administrator', 'Full system access with user management privileges', 
     '{"users": ["create", "read", "update", "delete"], "settings": ["read", "update"], "billing": ["read", "update"], "monitoring": ["read"], "security": ["read", "update"]}'::jsonb, true),
    ('deepseek', 'DeepSeek AI User', 'Special AI/automation user with API and workflow access',
     '{"api": ["read", "use"], "workflows": ["read", "create", "update", "delete"], "automation": ["read", "create", "update"], "mining": ["read", "create"]}'::jsonb, true),
    ('enterprise', 'Enterprise User', 'Full featured access for enterprise customers',
     '{"optimizations": ["unlimited"], "mining": ["unlimited"], "analytics": ["read"], "team": ["read", "create", "update", "delete"], "automation": ["read", "create", "update", "delete"]}'::jsonb, true),
    ('pro', 'Professional User', 'Enhanced features for professional users',
     '{"optimizations": ["limited"], "mining": ["limited"], "analytics": ["read"], "api": ["read", "use"]}'::jsonb, true),
    ('free', 'Free User', 'Basic access with limited features',
     '{"optimizations": ["limited"], "mining": ["limited"], "dashboard": ["read"]}'::jsonb, true),
    ('guest', 'Guest User', 'Read-only access for guests',
     '{"dashboard": ["read"]}'::jsonb, true)
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================================
-- USER PLANS TABLE
-- ============================================================================
-- Define subscription plans with features and limits
CREATE TABLE IF NOT EXISTS user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name VARCHAR(50) UNIQUE NOT NULL CHECK (plan_name IN ('free', 'pro', 'enterprise', 'admin', 'deepseek')),
    plan_label VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) DEFAULT 0.00,
    price_yearly DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Can users subscribe to this plan?
    sort_order INTEGER DEFAULT 0,
    stripe_price_id VARCHAR(255),
    stripe_product_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans with comprehensive limits
INSERT INTO user_plans (plan_name, plan_label, description, price_monthly, price_yearly, trial_days, features, limits, is_public, sort_order) VALUES
    ('free', 'Free Plan', 'Perfect for getting started with basic features', 0.00, 0.00, 0,
     '["Basic Dashboard", "Limited Optimizations", "Community Support"]'::jsonb,
     '{"optimizations_per_month": 10, "sites_monitored": 3, "api_calls_per_day": 100, "mining_sessions": 1, "storage_mb": 100, "team_members": 0, "custom_domains": 0, "advanced_analytics": false, "priority_support": false, "api_access": false, "automation_workflows": 0, "export_data": false}'::jsonb,
     true, 1),
    ('pro', 'Professional Plan', 'Advanced features for professionals and small teams', 29.00, 290.00, 14,
     '["Advanced Dashboard", "100 Optimizations/month", "API Access", "Analytics", "Priority Email Support", "Data Export"]'::jsonb,
     '{"optimizations_per_month": 100, "sites_monitored": 25, "api_calls_per_day": 1000, "mining_sessions": 5, "storage_mb": 1000, "team_members": 3, "custom_domains": 3, "advanced_analytics": true, "priority_support": false, "api_access": true, "automation_workflows": 10, "export_data": true}'::jsonb,
     true, 2),
    ('enterprise', 'Enterprise Plan', 'Unlimited access for large organizations', 99.00, 990.00, 30,
     '["Unlimited Everything", "Dedicated Support", "Custom Integration", "SLA Guarantee", "Advanced Security"]'::jsonb,
     '{"optimizations_per_month": -1, "sites_monitored": -1, "api_calls_per_day": -1, "mining_sessions": -1, "storage_mb": -1, "team_members": -1, "custom_domains": -1, "advanced_analytics": true, "priority_support": true, "api_access": true, "automation_workflows": -1, "export_data": true}'::jsonb,
     true, 3),
    ('admin', 'Admin Plan', 'Full system access for administrators', 0.00, 0.00, 0,
     '["Full System Access", "User Management", "System Settings", "Monitoring", "Security Controls"]'::jsonb,
     '{"optimizations_per_month": -1, "sites_monitored": -1, "api_calls_per_day": -1, "mining_sessions": -1, "storage_mb": -1, "team_members": -1, "custom_domains": -1, "advanced_analytics": true, "priority_support": true, "api_access": true, "automation_workflows": -1, "export_data": true, "admin_panel": true, "system_settings": true, "user_management": true, "billing_management": true, "security_settings": true}'::jsonb,
     false, 4),
    ('deepseek', 'DeepSeek AI Plan', 'Special plan for DeepSeek AI automation user', 0.00, 0.00, 0,
     '["Unlimited API Access", "Workflow Automation", "Advanced Mining", "AI Model Access"]'::jsonb,
     '{"optimizations_per_month": -1, "sites_monitored": -1, "api_calls_per_day": -1, "mining_sessions": -1, "storage_mb": -1, "team_members": 0, "custom_domains": 0, "advanced_analytics": true, "priority_support": false, "api_access": true, "automation_workflows": -1, "export_data": true, "ai_model_access": true, "workflow_builder": true}'::jsonb,
     false, 5)
ON CONFLICT (plan_name) DO NOTHING;

-- ============================================================================
-- ENHANCED USERS TABLE
-- ============================================================================
-- Extend existing users table with new fields for comprehensive management
-- Note: This assumes the base users table exists from blockchain_schema.sql

-- Add new columns to users table if they don't exist
DO $$
BEGIN
    -- Add password hash for email/password authentication
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    -- Add role reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role_id') THEN
        ALTER TABLE users ADD COLUMN role_id UUID REFERENCES user_roles(id);
    END IF;
    
    -- Add plan reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan_id') THEN
        ALTER TABLE users ADD COLUMN plan_id UUID REFERENCES user_plans(id);
    END IF;
    
    -- Add name fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    END IF;
    
    -- Add avatar and bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    -- Add phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- Add company info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
        ALTER TABLE users ADD COLUMN company VARCHAR(255);
    END IF;
    
    -- Add location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN
        ALTER TABLE users ADD COLUMN location VARCHAR(255);
    END IF;
    
    -- Add timezone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'timezone') THEN
        ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
    END IF;
    
    -- Add language preference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'language') THEN
        ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;
    
    -- Add preferences JSON
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add metadata JSON
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'metadata') THEN
        ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add email verification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add account status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'account_status') THEN
        ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending'));
    END IF;
    
    -- Add subscription dates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'cancelled', 'expired', 'past_due'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_started_at') THEN
        ALTER TABLE users ADD COLUMN subscription_started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_expires_at') THEN
        ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add trial period
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add last login tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_ip') THEN
        ALTER TABLE users ADD COLUMN last_login_ip INET;
    END IF;
    
    -- Add login count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_count') THEN
        ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add deleted tracking (soft delete)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'deleted_at') THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END$$;

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Index for session lookup
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- ============================================================================
-- USER ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- e.g., 'login', 'logout', 'profile_update', 'password_change'
    resource VARCHAR(100), -- What was affected (e.g., 'user', 'project', 'settings')
    resource_id UUID, -- ID of the affected resource
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- ============================================================================
-- USER API KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL, -- Hashed API key
    api_key_prefix VARCHAR(16) NOT NULL, -- First few chars for display
    scopes JSONB DEFAULT '[]'::jsonb, -- What this key can access
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 1000, -- Requests per day
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for API key lookup
CREATE INDEX IF NOT EXISTS idx_user_api_keys_key ON user_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON user_api_keys(is_active, expires_at);

-- ============================================================================
-- INDEXES FOR USERS TABLE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- UPDATE TRIGGER FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON user_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for user details with role and plan information
CREATE OR REPLACE VIEW user_details_view AS
SELECT 
    u.id,
    u.wallet_address,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.bio,
    u.phone,
    u.company,
    u.location,
    u.timezone,
    u.language,
    u.email_verified,
    u.account_status,
    u.subscription_status,
    u.subscription_started_at,
    u.subscription_expires_at,
    u.trial_ends_at,
    u.last_login_at,
    u.login_count,
    u.reputation_score,
    u.total_space_harvested,
    u.optimization_count,
    u.created_at,
    u.updated_at,
    ur.role_name,
    ur.role_label,
    ur.permissions as role_permissions,
    up.plan_name,
    up.plan_label,
    up.features as plan_features,
    up.limits as plan_limits,
    up.price_monthly,
    up.price_yearly
FROM users u
LEFT JOIN user_roles ur ON u.role_id = ur.id
LEFT JOIN user_plans up ON u.plan_id = up.id
WHERE u.deleted_at IS NULL;

-- View for active sessions
CREATE OR REPLACE VIEW active_sessions_view AS
SELECT 
    s.id,
    s.user_id,
    u.username,
    u.email,
    s.ip_address,
    s.user_agent,
    s.last_activity_at,
    s.expires_at,
    s.created_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = true 
  AND s.expires_at > CURRENT_TIMESTAMP;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE user_roles IS 'Defines user roles with associated permissions';
COMMENT ON TABLE user_plans IS 'Subscription plans with features and pricing';
COMMENT ON TABLE user_sessions IS 'Active user sessions for authentication';
COMMENT ON TABLE user_activity_logs IS 'Audit trail of all user actions';
COMMENT ON TABLE user_api_keys IS 'API keys for programmatic access';

-- Migration complete
