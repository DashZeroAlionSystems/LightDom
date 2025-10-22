-- LightDom SEO Service Database Schema
-- Comprehensive schema for automated SEO optimization service

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SEO Clients Table
-- Stores information about clients using the SEO service
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES harvesters(id) ON DELETE CASCADE,
  domain VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  api_key_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of API key
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'starter',
  subscription_id UUID, -- Reference to billing_subscriptions
  monthly_page_views BIGINT DEFAULT 0,
  page_view_limit BIGINT DEFAULT 10000,
  api_calls_today INTEGER DEFAULT 0,
  api_call_limit INTEGER DEFAULT 10000,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'trial')),
  trial_ends_at TIMESTAMP,
  config JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_clients_user_id ON seo_clients(user_id);
CREATE INDEX idx_seo_clients_api_key ON seo_clients(api_key);
CREATE INDEX idx_seo_clients_domain ON seo_clients(domain);
CREATE INDEX idx_seo_clients_status ON seo_clients(status);

-- =====================================================
-- SEO Analytics Table
-- Stores analytics data collected from client sites
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  page_title TEXT,
  meta_description TEXT,
  core_web_vitals JSONB DEFAULT '{}', -- {lcp, fid, cls, inp, ttfb, fcp}
  seo_score DECIMAL(5,2) DEFAULT 0,
  performance_score DECIMAL(5,2) DEFAULT 0,
  technical_score DECIMAL(5,2) DEFAULT 0,
  content_score DECIMAL(5,2) DEFAULT 0,
  ux_score DECIMAL(5,2) DEFAULT 0,
  search_rankings JSONB DEFAULT '{}', -- {keyword: position}
  traffic_sources JSONB DEFAULT '{}',
  user_behavior JSONB DEFAULT '{}', -- {bounce_rate, time_on_page, scroll_depth, interactions}
  optimization_applied JSONB DEFAULT '{}',
  session_id VARCHAR(64),
  referrer TEXT,
  user_agent TEXT,
  device_type VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_analytics_client_id ON seo_analytics(client_id);
CREATE INDEX idx_seo_analytics_url ON seo_analytics(url);
CREATE INDEX idx_seo_analytics_timestamp ON seo_analytics(timestamp);
CREATE INDEX idx_seo_analytics_session_id ON seo_analytics(session_id);
CREATE INDEX idx_seo_analytics_seo_score ON seo_analytics(seo_score);

-- =====================================================
-- SEO Optimization Configs Table
-- Stores optimization configurations for different page patterns
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_optimization_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  page_pattern VARCHAR(255) NOT NULL, -- e.g., "/products/*", "/blog/*", "*"
  json_ld_schemas JSONB NOT NULL DEFAULT '[]',
  meta_tags JSONB NOT NULL DEFAULT '{}',
  ab_test_variant VARCHAR(1) CHECK (ab_test_variant IN ('A', 'B')),
  performance_metrics JSONB DEFAULT '{}',
  conversion_rate DECIMAL(5,4),
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority configs are applied first
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_optimization_configs_client_id ON seo_optimization_configs(client_id);
CREATE INDEX idx_seo_optimization_configs_pattern ON seo_optimization_configs(page_pattern);
CREATE INDEX idx_seo_optimization_configs_active ON seo_optimization_configs(active);
CREATE UNIQUE INDEX idx_seo_optimization_configs_unique ON seo_optimization_configs(client_id, page_pattern, ab_test_variant);

-- =====================================================
-- SEO Training Data Table
-- Stores data for ML model training
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  features JSONB NOT NULL, -- 194 SEO features
  ranking_before INTEGER,
  ranking_after INTEGER,
  seo_score_before DECIMAL(5,2),
  seo_score_after DECIMAL(5,2),
  optimization_type VARCHAR(100),
  optimization_details JSONB,
  effectiveness_score DECIMAL(5,2),
  time_period_days INTEGER DEFAULT 7,
  verified BOOLEAN DEFAULT FALSE,
  blockchain_proof_hash VARCHAR(66),
  blockchain_tx_hash VARCHAR(66),
  reward_amount DECIMAL(18,8),
  quality_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

CREATE INDEX idx_seo_training_data_client_id ON seo_training_data(client_id);
CREATE INDEX idx_seo_training_data_verified ON seo_training_data(verified);
CREATE INDEX idx_seo_training_data_created_at ON seo_training_data(created_at);
CREATE INDEX idx_seo_training_data_effectiveness ON seo_training_data(effectiveness_score);

-- =====================================================
-- SEO Models Table
-- Stores trained ML models and their metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- ranking_prediction, schema_optimizer, meta_optimizer, etc.
  model_path TEXT NOT NULL, -- Path to model file or S3 URL
  accuracy DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  training_samples INTEGER,
  training_duration_seconds INTEGER,
  hyperparameters JSONB,
  feature_importance JSONB,
  performance_metrics JSONB,
  status VARCHAR(20) DEFAULT 'training' CHECK (status IN ('training', 'testing', 'active', 'archived')),
  deployed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_models_type ON seo_models(model_type);
CREATE INDEX idx_seo_models_status ON seo_models(status);
CREATE INDEX idx_seo_models_version ON seo_models(model_version);
CREATE UNIQUE INDEX idx_seo_models_unique ON seo_models(model_name, model_version);

-- =====================================================
-- SEO Alerts Table
-- Stores alerts for clients
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  url TEXT,
  alert_type VARCHAR(50) NOT NULL, -- performance, ranking, error, etc.
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved', 'ignored')),
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_alerts_client_id ON seo_alerts(client_id);
CREATE INDEX idx_seo_alerts_type ON seo_alerts(alert_type);
CREATE INDEX idx_seo_alerts_severity ON seo_alerts(severity);
CREATE INDEX idx_seo_alerts_status ON seo_alerts(status);
CREATE INDEX idx_seo_alerts_created_at ON seo_alerts(created_at);

-- =====================================================
-- SEO Keyword Rankings Table
-- Tracks keyword rankings over time
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_keyword_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  previous_position INTEGER,
  search_volume INTEGER,
  difficulty DECIMAL(3,2), -- 0.00 to 1.00
  search_engine VARCHAR(20) DEFAULT 'google',
  location VARCHAR(100) DEFAULT 'US',
  device VARCHAR(20) DEFAULT 'desktop',
  checked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_keyword_rankings_client_id ON seo_keyword_rankings(client_id);
CREATE INDEX idx_seo_keyword_rankings_keyword ON seo_keyword_rankings(keyword);
CREATE INDEX idx_seo_keyword_rankings_checked_at ON seo_keyword_rankings(checked_at);
CREATE INDEX idx_seo_keyword_rankings_position ON seo_keyword_rankings(position);

-- =====================================================
-- SEO A/B Tests Table
-- Manages A/B tests for SEO optimizations
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  test_name VARCHAR(200) NOT NULL,
  page_pattern VARCHAR(255) NOT NULL,
  variant_a_config_id UUID REFERENCES seo_optimization_configs(id) ON DELETE SET NULL,
  variant_b_config_id UUID REFERENCES seo_optimization_configs(id) ON DELETE SET NULL,
  traffic_split DECIMAL(3,2) DEFAULT 0.50, -- 0.50 = 50/50 split
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  winner VARCHAR(1) CHECK (winner IN ('A', 'B')),
  confidence_level DECIMAL(5,4),
  metrics JSONB DEFAULT '{}',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_ab_tests_client_id ON seo_ab_tests(client_id);
CREATE INDEX idx_seo_ab_tests_status ON seo_ab_tests(status);
CREATE INDEX idx_seo_ab_tests_start_date ON seo_ab_tests(start_date);

-- =====================================================
-- SEO Recommendations Table
-- Stores AI-generated recommendations
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  url TEXT,
  recommendation_type VARCHAR(50) NOT NULL, -- schema, meta_tag, content, technical, performance
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  expected_impact DECIMAL(5,2), -- Expected SEO score improvement
  implementation_difficulty VARCHAR(20) CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  auto_apply BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_recommendations_client_id ON seo_recommendations(client_id);
CREATE INDEX idx_seo_recommendations_status ON seo_recommendations(status);
CREATE INDEX idx_seo_recommendations_priority ON seo_recommendations(priority);
CREATE INDEX idx_seo_recommendations_type ON seo_recommendations(recommendation_type);

-- =====================================================
-- SEO Competitors Table
-- Stores competitor information for analysis
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  competitor_domain VARCHAR(255) NOT NULL,
  competitor_name VARCHAR(200),
  tracking_enabled BOOLEAN DEFAULT TRUE,
  last_analyzed_at TIMESTAMP,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_competitors_client_id ON seo_competitors(client_id);
CREATE INDEX idx_seo_competitors_domain ON seo_competitors(competitor_domain);
CREATE UNIQUE INDEX idx_seo_competitors_unique ON seo_competitors(client_id, competitor_domain);

-- =====================================================
-- SEO Subscriptions Pricing Table
-- Defines SEO service pricing tiers
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  page_view_limit BIGINT NOT NULL,
  api_call_limit INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  schema_types TEXT[] NOT NULL, -- Array of allowed schema types
  max_domains INTEGER DEFAULT 1,
  has_ab_testing BOOLEAN DEFAULT FALSE,
  has_api_access BOOLEAN DEFAULT FALSE,
  has_white_label BOOLEAN DEFAULT FALSE,
  has_custom_models BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE,
  has_dedicated_support BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pricing plans
INSERT INTO seo_subscription_plans (
  plan_name, display_name, description, price_monthly, price_yearly,
  page_view_limit, api_call_limit, features, schema_types,
  max_domains, has_ab_testing, has_api_access, has_priority_support
) VALUES
(
  'starter',
  'Starter',
  'Perfect for small businesses and blogs',
  79.00,
  790.00, -- 2 months free
  10000,
  10000,
  '["Basic JSON-LD schemas", "Meta tag optimization", "Core Web Vitals monitoring", "Monthly SEO reports", "Email support"]',
  ARRAY['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article'],
  1,
  FALSE,
  FALSE,
  FALSE
),
(
  'professional',
  'Professional',
  'For growing businesses and e-commerce sites',
  249.00,
  2490.00,
  100000,
  100000,
  '["Advanced JSON-LD schemas", "Meta tag A/B testing", "Real-time Core Web Vitals", "Keyword rank tracking (100 keywords)", "Weekly SEO reports", "AI recommendations", "Priority email support", "API access", "Custom schema templates"]',
  ARRAY['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article', 'Product', 'Event', 'FAQPage', 'HowTo', 'VideoObject', 'LocalBusiness', 'Recipe', 'JobPosting', 'Course', 'Review', 'AggregateRating'],
  5,
  TRUE,
  TRUE,
  TRUE
),
(
  'business',
  'Business',
  'For agencies and high-traffic sites',
  599.00,
  5990.00,
  500000,
  500000,
  '["All JSON-LD schema types", "Advanced A/B testing with ML", "Real-time analytics dashboard", "Keyword rank tracking (500 keywords)", "Competitor analysis", "Daily SEO reports", "AI recommendations", "Priority phone + email support", "Full API access", "Custom model training", "White-label options"]',
  ARRAY['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article', 'Product', 'Event', 'FAQPage', 'HowTo', 'VideoObject', 'LocalBusiness', 'Recipe', 'JobPosting', 'Course', 'Review', 'AggregateRating', 'Service', 'Movie', 'Book', 'MusicAlbum'],
  20,
  TRUE,
  TRUE,
  TRUE
),
(
  'enterprise',
  'Enterprise',
  'For large enterprises and multi-brand organizations',
  1499.00,
  14990.00,
  999999999,
  999999999,
  '["Unlimited everything", "Dedicated AI model", "Custom schema development", "Unlimited keyword tracking", "Full competitor intelligence", "Real-time reports + predictive analytics", "24/7 dedicated support", "Full API + GraphQL", "Custom integrations", "On-premise deployment option", "SLA guarantees", "Dedicated account manager"]',
  ARRAY['*'], -- All schema types
  999,
  TRUE,
  TRUE,
  TRUE
);

-- =====================================================
-- Views for Analytics
-- =====================================================

-- Daily SEO metrics view
CREATE OR REPLACE VIEW seo_daily_metrics AS
SELECT
  client_id,
  DATE(timestamp) as date,
  COUNT(*) as page_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(seo_score) as avg_seo_score,
  AVG((core_web_vitals->>'lcp')::numeric) as avg_lcp,
  AVG((core_web_vitals->>'cls')::numeric) as avg_cls,
  AVG((core_web_vitals->>'inp')::numeric) as avg_inp,
  AVG((user_behavior->>'timeOnPage')::integer) as avg_time_on_page
FROM seo_analytics
GROUP BY client_id, DATE(timestamp);

-- Top performing pages view
CREATE OR REPLACE VIEW seo_top_pages AS
SELECT
  client_id,
  url,
  COUNT(*) as views,
  AVG(seo_score) as avg_score,
  AVG((user_behavior->>'timeOnPage')::integer) as avg_time_on_page,
  AVG((user_behavior->>'scrollDepth')::numeric) as avg_scroll_depth
FROM seo_analytics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY client_id, url
ORDER BY views DESC;

-- =====================================================
-- Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_seo_clients_updated_at BEFORE UPDATE ON seo_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_optimization_configs_updated_at BEFORE UPDATE ON seo_optimization_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_ab_tests_updated_at BEFORE UPDATE ON seo_ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_subscription_plans_updated_at BEFORE UPDATE ON seo_subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily API calls counter
CREATE OR REPLACE FUNCTION reset_daily_api_calls()
RETURNS void AS $$
BEGIN
  UPDATE seo_clients
  SET api_calls_today = 0,
      updated_at = NOW()
  WHERE api_calls_today > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_seo_subscription_limits(p_client_id UUID)
RETURNS TABLE(
  within_page_view_limit BOOLEAN,
  within_api_limit BOOLEAN,
  page_views_used BIGINT,
  page_view_limit BIGINT,
  api_calls_used INTEGER,
  api_call_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (sc.monthly_page_views < sc.page_view_limit) as within_page_view_limit,
    (sc.api_calls_today < sc.api_call_limit) as within_api_limit,
    sc.monthly_page_views,
    sc.page_view_limit,
    sc.api_calls_today,
    sc.api_call_limit
  FROM seo_clients sc
  WHERE sc.id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Permissions (adjust as needed)
-- =====================================================

-- Grant permissions to application user
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO lightdom_app;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO lightdom_app;

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_seo_analytics_client_timestamp ON seo_analytics(client_id, timestamp DESC);
CREATE INDEX idx_seo_analytics_url_timestamp ON seo_analytics(url, timestamp DESC);
CREATE INDEX idx_seo_training_data_effectiveness_created ON seo_training_data(effectiveness_score DESC, created_at DESC);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE seo_clients IS 'Stores client information for the SEO service';
COMMENT ON TABLE seo_analytics IS 'Stores analytics data collected from client websites';
COMMENT ON TABLE seo_optimization_configs IS 'Stores SEO optimization configurations per page pattern';
COMMENT ON TABLE seo_training_data IS 'Stores training data for ML models';
COMMENT ON TABLE seo_models IS 'Stores trained ML model metadata';
COMMENT ON TABLE seo_alerts IS 'Stores alerts for clients about SEO issues';
COMMENT ON TABLE seo_keyword_rankings IS 'Tracks keyword rankings over time';
COMMENT ON TABLE seo_ab_tests IS 'Manages A/B tests for SEO optimizations';
COMMENT ON TABLE seo_recommendations IS 'Stores AI-generated SEO recommendations';
COMMENT ON TABLE seo_competitors IS 'Stores competitor information for analysis';
COMMENT ON TABLE seo_subscription_plans IS 'Defines SEO service pricing tiers';
