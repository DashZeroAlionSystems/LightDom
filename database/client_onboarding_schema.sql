-- =====================================================
-- Client Onboarding Database Schema
-- Comprehensive schema for secure step-by-step client onboarding
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Onboarding Sessions Table
-- Tracks the onboarding process for each new client
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Will be NULL until user is created
  email VARCHAR(255) NOT NULL,
  
  -- Session tracking
  session_token VARCHAR(128) UNIQUE NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 7,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'failed')),
  
  -- Collected data (stored securely)
  company_name VARCHAR(255),
  website_url VARCHAR(500),
  industry VARCHAR(100),
  business_size VARCHAR(50), -- 'startup', 'small', 'medium', 'enterprise'
  
  -- SEO goals and preferences
  goals JSONB DEFAULT '[]', -- Array of selected goals
  target_keywords TEXT[], -- Keywords they want to rank for
  competitor_urls TEXT[], -- Competitor websites for analysis
  
  -- Plan selection
  selected_plan VARCHAR(50), -- 'starter', 'professional', 'business', 'enterprise'
  billing_cycle VARCHAR(20), -- 'monthly', 'annual'
  
  -- Setup preferences
  integration_type VARCHAR(50), -- 'script_injection', 'api', 'plugin'
  technical_level VARCHAR(20), -- 'beginner', 'intermediate', 'expert'
  
  -- Progress tracking
  steps_completed JSONB DEFAULT '{}', -- { step_number: { completed: true, timestamp: ISO8601 } }
  metadata JSONB DEFAULT '{}',
  
  -- Analytics
  referral_source VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_source VARCHAR(255),
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onboarding_sessions_email ON onboarding_sessions(email);
CREATE INDEX idx_onboarding_sessions_token ON onboarding_sessions(session_token);
CREATE INDEX idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);

-- =====================================================
-- Onboarding Steps Table
-- Defines the structure of each onboarding step
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_step_definitions (
  id SERIAL PRIMARY KEY,
  step_number INTEGER UNIQUE NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_title VARCHAR(255) NOT NULL,
  step_description TEXT,
  
  -- Step configuration
  required_fields JSONB DEFAULT '[]', -- List of required field names
  optional_fields JSONB DEFAULT '[]',
  validation_rules JSONB DEFAULT '{}',
  
  -- UI configuration
  component_type VARCHAR(50), -- 'form', 'selection', 'analysis', 'setup'
  display_order INTEGER,
  estimated_duration_seconds INTEGER DEFAULT 60,
  
  -- Help and guidance
  help_text TEXT,
  help_video_url VARCHAR(500),
  documentation_url VARCHAR(500),
  
  -- Conditional logic
  skip_conditions JSONB DEFAULT '{}', -- Conditions under which to skip this step
  next_step_logic JSONB DEFAULT '{}', -- Custom logic for determining next step
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default onboarding steps
INSERT INTO onboarding_step_definitions (step_number, step_name, step_title, step_description, component_type, display_order) VALUES
(1, 'welcome', 'Welcome to LightDom', 'Let''s get started with your SEO optimization journey', 'welcome', 1),
(2, 'business_info', 'Tell Us About Your Business', 'Help us understand your business and goals', 'form', 2),
(3, 'seo_analysis', 'Initial SEO Analysis', 'We''ll analyze your website to identify opportunities', 'analysis', 3),
(4, 'plan_selection', 'Choose Your Plan', 'Select the plan that best fits your needs', 'selection', 4),
(5, 'setup_method', 'Setup Your Integration', 'Choose how you want to integrate LightDom', 'selection', 5),
(6, 'configuration', 'Configure Your Settings', 'Customize your SEO optimization preferences', 'form', 6),
(7, 'complete', 'You''re All Set!', 'Your account is ready to start optimizing', 'completion', 7);

-- =====================================================
-- Onboarding Tasks Table
-- Tracks individual tasks within each step
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  
  task_name VARCHAR(100) NOT NULL,
  task_description TEXT,
  task_type VARCHAR(50), -- 'form_field', 'api_call', 'validation', 'setup'
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  
  -- Task data
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onboarding_tasks_session_id ON onboarding_tasks(session_id);
CREATE INDEX idx_onboarding_tasks_step ON onboarding_tasks(step_number);
CREATE INDEX idx_onboarding_tasks_status ON onboarding_tasks(status);

-- =====================================================
-- Client Dashboard Configurations
-- Stores personalized dashboard configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS client_dashboard_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  
  -- Dashboard layout
  layout_type VARCHAR(50) DEFAULT 'default', -- 'default', 'compact', 'detailed'
  theme VARCHAR(50) DEFAULT 'dark',
  
  -- Visible components (encrypted to protect what metrics we track)
  components JSONB NOT NULL DEFAULT '[]',
  
  -- Widget configurations
  widgets JSONB DEFAULT '{}',
  
  -- Display preferences
  show_competitor_comparison BOOLEAN DEFAULT FALSE,
  show_keyword_rankings BOOLEAN DEFAULT TRUE,
  show_traffic_analytics BOOLEAN DEFAULT TRUE,
  show_conversion_metrics BOOLEAN DEFAULT TRUE,
  
  -- Obfuscation settings (what details to hide from client)
  obfuscate_strategies BOOLEAN DEFAULT TRUE, -- Hide our SEO strategies
  obfuscate_algorithms BOOLEAN DEFAULT TRUE, -- Hide algorithm details
  show_performance_only BOOLEAN DEFAULT TRUE, -- Only show results, not methods
  
  -- Custom branding (for white-label plans)
  custom_logo_url VARCHAR(500),
  custom_colors JSONB DEFAULT '{}',
  custom_domain VARCHAR(255),
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_dashboard_configs_client_id ON client_dashboard_configs(client_id);

-- =====================================================
-- Client Reports Table
-- Stores generated reports for clients
-- =====================================================
CREATE TABLE IF NOT EXISTS client_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  
  report_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'custom'
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  -- Report data (encrypted sensitive details)
  report_data JSONB NOT NULL,
  
  -- Obfuscated metrics for display
  public_metrics JSONB NOT NULL DEFAULT '{}',
  
  -- Infographics and visualizations
  infographics JSONB DEFAULT '[]', -- Array of infographic configurations
  charts JSONB DEFAULT '[]', -- Array of chart data
  
  -- File storage
  pdf_url VARCHAR(500),
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- Delivery
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP,
  delivery_method VARCHAR(50), -- 'email', 'dashboard', 'api'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_reports_client_id ON client_reports(client_id);
CREATE INDEX idx_client_reports_type ON client_reports(report_type);
CREATE INDEX idx_client_reports_period ON client_reports(report_period_start, report_period_end);

-- =====================================================
-- Encrypted Campaign Data Table
-- Stores encrypted SEO campaign strategies
-- =====================================================
CREATE TABLE IF NOT EXISTS encrypted_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50), -- 'seo', 'content', 'link_building', 'technical'
  
  -- Encrypted strategy data
  encrypted_data JSONB NOT NULL, -- { encrypted, iv, tag, salt }
  data_fingerprint VARCHAR(64) NOT NULL, -- SHA-256 fingerprint for integrity
  
  -- Public metadata (safe to show clients)
  public_metadata JSONB DEFAULT '{}',
  
  -- Performance (results we can show)
  performance_metrics JSONB DEFAULT '{}',
  
  -- Access control
  encryption_key_version VARCHAR(20),
  requires_authorization BOOLEAN DEFAULT TRUE,
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_encrypted_campaigns_client_id ON encrypted_campaigns(client_id);
CREATE INDEX idx_encrypted_campaigns_type ON encrypted_campaigns(campaign_type);
CREATE INDEX idx_encrypted_campaigns_fingerprint ON encrypted_campaigns(data_fingerprint);

-- =====================================================
-- Protected Schema Templates Table
-- Stores encrypted rich snippet schemas
-- =====================================================
CREATE TABLE IF NOT EXISTS protected_schema_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  schema_type VARCHAR(100) NOT NULL, -- 'Product', 'Article', 'LocalBusiness', etc.
  schema_category VARCHAR(100),
  
  -- Encrypted template data (our proprietary templates)
  encrypted_template JSONB NOT NULL,
  template_fingerprint VARCHAR(64) NOT NULL,
  
  -- Public information
  public_metadata JSONB NOT NULL DEFAULT '{}',
  effectiveness_score INTEGER, -- 0-100, calculated from performance
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  
  -- Version control
  version VARCHAR(20) DEFAULT '1.0',
  deprecated BOOLEAN DEFAULT FALSE,
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_protected_schema_templates_type ON protected_schema_templates(schema_type);
CREATE INDEX idx_protected_schema_templates_category ON protected_schema_templates(schema_category);

-- =====================================================
-- Schema Usage Logs Table
-- Tracks when clients use our protected schemas
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE SET NULL,
  schema_id UUID REFERENCES protected_schema_templates(id) ON DELETE SET NULL,
  
  url TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  
  -- Detect potential abuse
  request_fingerprint VARCHAR(64),
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schema_usage_logs_client_id ON schema_usage_logs(client_id);
CREATE INDEX idx_schema_usage_logs_schema_id ON schema_usage_logs(schema_id);
CREATE INDEX idx_schema_usage_logs_timestamp ON schema_usage_logs(created_at);

-- =====================================================
-- API Key Rotation Table
-- Tracks API key rotation for enhanced security
-- =====================================================
CREATE TABLE IF NOT EXISTS api_key_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  
  old_key_hash VARCHAR(64) NOT NULL,
  new_key_hash VARCHAR(64) NOT NULL,
  
  rotation_reason VARCHAR(50), -- 'scheduled', 'compromised', 'manual'
  rotated_by UUID, -- Admin user who triggered rotation
  
  old_key_expires_at TIMESTAMP,
  grace_period_ends_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_key_rotations_client_id ON api_key_rotations(client_id);
CREATE INDEX idx_api_key_rotations_created ON api_key_rotations(created_at);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_tasks_updated_at
  BEFORE UPDATE ON onboarding_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_dashboard_configs_updated_at
  BEFORE UPDATE ON client_dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encrypted_campaigns_updated_at
  BEFORE UPDATE ON encrypted_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired onboarding sessions
CREATE OR REPLACE FUNCTION cleanup_expired_onboarding_sessions()
RETURNS void AS $$
BEGIN
  UPDATE onboarding_sessions
  SET status = 'abandoned'
  WHERE status = 'in_progress'
    AND expires_at < NOW()
    AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE onboarding_sessions IS 'Tracks client onboarding progress with secure data storage';
COMMENT ON TABLE client_dashboard_configs IS 'Personalized dashboard configurations with metric obfuscation';
COMMENT ON TABLE encrypted_campaigns IS 'Stores encrypted proprietary SEO campaign strategies';
COMMENT ON TABLE protected_schema_templates IS 'Protected rich snippet templates with usage tracking';
COMMENT ON TABLE schema_usage_logs IS 'Audit log for schema usage to detect abuse';
