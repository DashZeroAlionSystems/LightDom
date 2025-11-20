-- Migration: Advanced Bi-Directional Protocol with Trust Scoring & Self-Learning
-- Purpose: Campaign governance, atomic data mining, trust scoring, live evaluation

-- ====================================
-- Campaigns Table (Billing & Governance)
-- ====================================
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL, -- 'free', 'basic', 'pro', 'enterprise'
  limits JSONB NOT NULL,
  usage JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'stopped', 'suspended'
  created_at TIMESTAMP DEFAULT NOW(),
  stopped_at TIMESTAMP,
  stop_reason TEXT,
  billing_cycle VARCHAR(50), -- 'monthly', 'annual'
  next_billing_date TIMESTAMP,
  auto_stop_config JSONB
);

CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_plan ON campaigns(plan);

-- Link campaigns to MCP servers
ALTER TABLE mcp_servers ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(255) REFERENCES campaigns(id);
ALTER TABLE mcp_stream_sessions ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(255) REFERENCES campaigns(id);

-- ====================================
-- Trust Scoring System
-- ====================================
CREATE TABLE IF NOT EXISTS trust_scores (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL, -- 'atom', 'molecule', 'organism', 'template', 'schema', 'config'
  identifier VARCHAR(255) NOT NULL,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(type, identifier)
);

CREATE INDEX IF NOT EXISTS idx_trust_type ON trust_scores(type);
CREATE INDEX IF NOT EXISTS idx_trust_identifier ON trust_scores(identifier);
CREATE INDEX IF NOT EXISTS idx_trust_success_rate ON trust_scores((successful_executions::float / NULLIF(total_executions, 0)));

-- ====================================
-- Atomic Component Data Mining
-- ====================================
CREATE TABLE IF NOT EXISTS atomic_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  data JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atomic_category ON atomic_events(category);
CREATE INDEX IF NOT EXISTS idx_atomic_timestamp ON atomic_events(timestamp);

-- Atomic components (atoms, molecules, organisms, templates, pages)
CREATE TABLE IF NOT EXISTS atomic_components (
  id SERIAL PRIMARY KEY,
  component_type VARCHAR(50) NOT NULL, -- 'atom', 'molecule', 'organism', 'template', 'page'
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  definition JSONB NOT NULL,
  parent_components INTEGER[], -- Array of parent component IDs
  trust_score DECIMAL(5,4),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atomic_type ON atomic_components(component_type);
CREATE INDEX IF NOT EXISTS idx_atomic_category_comp ON atomic_components(category);
CREATE INDEX IF NOT EXISTS idx_atomic_trust ON atomic_components(trust_score);

-- ====================================
-- Progressive State Testing
-- ====================================
CREATE TABLE IF NOT EXISTS trusted_paths (
  id SERIAL PRIMARY KEY,
  path JSONB NOT NULL,
  success_rate DECIMAL(5,4),
  total_executions INTEGER DEFAULT 1,
  avg_resource_cost INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trusted_paths_success ON trusted_paths(success_rate);
CREATE INDEX IF NOT EXISTS idx_trusted_paths_used ON trusted_paths(last_used);

-- ====================================
-- Live Self-Evaluation
-- ====================================
CREATE TABLE IF NOT EXISTS failure_analysis (
  id SERIAL PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_code VARCHAR(100),
  context JSONB,
  code_snapshot TEXT,
  root_cause VARCHAR(255),
  fix_suggestions JSONB,
  auto_fixed BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_message ON failure_analysis(error_message);
CREATE INDEX IF NOT EXISTS idx_failure_timestamp ON failure_analysis(timestamp);

-- Auto-generated schemas
ALTER TABLE schemas ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;
ALTER TABLE schemas ADD COLUMN IF NOT EXISTS trust_score DECIMAL(5,4);
ALTER TABLE schemas ADD COLUMN IF NOT EXISTS based_on_pattern_id INTEGER;

-- ====================================
-- Multi-Schema Orchestration
-- ====================================
CREATE TABLE IF NOT EXISTS orchestrations (
  id VARCHAR(255) PRIMARY KEY,
  campaign_id VARCHAR(255) REFERENCES campaigns(id),
  schema_ids JSONB NOT NULL,
  task JSONB NOT NULL,
  results JSONB,
  errors JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_orchestrations_campaign ON orchestrations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_orchestrations_created ON orchestrations(created_at);

-- ====================================
-- Free Plan Engagement Tracking
-- ====================================
CREATE TABLE IF NOT EXISTS free_plan_engagement (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  context JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_user ON free_plan_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_action ON free_plan_engagement(action);
CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON free_plan_engagement(timestamp);

-- ====================================
-- Views for Analytics
-- ====================================

-- Campaign health view
CREATE OR REPLACE VIEW campaign_health AS
SELECT 
  c.id,
  c.name,
  c.plan,
  c.status,
  (c.usage->>'executions')::int as used_executions,
  (c.limits->>'maxExecutions')::int as max_executions,
  CASE 
    WHEN (c.limits->>'maxExecutions')::int = -1 THEN 100
    ELSE ((c.usage->>'executions')::float / NULLIF((c.limits->>'maxExecutions')::int, 0) * 100)
  END as usage_percentage,
  c.next_billing_date,
  EXTRACT(DAYS FROM (c.next_billing_date - NOW())) as days_until_billing
FROM campaigns c
WHERE c.status = 'active';

-- Trust leaderboard
CREATE OR REPLACE VIEW trust_leaderboard AS
SELECT 
  type,
  identifier,
  total_executions,
  successful_executions,
  (successful_executions::float / NULLIF(total_executions, 0)) as success_rate,
  last_used,
  CASE 
    WHEN (successful_executions::float / NULLIF(total_executions, 0)) > 0.9 THEN 'excellent'
    WHEN (successful_executions::float / NULLIF(total_executions, 0)) > 0.7 THEN 'good'
    WHEN (successful_executions::float / NULLIF(total_executions, 0)) > 0.5 THEN 'acceptable'
    ELSE 'poor'
  END as trust_level
FROM trust_scores
WHERE total_executions > 10
ORDER BY success_rate DESC, total_executions DESC;

-- Atomic component hierarchy
CREATE OR REPLACE VIEW component_hierarchy AS
WITH RECURSIVE component_tree AS (
  -- Base case: atoms (no parents)
  SELECT 
    id,
    component_type,
    name,
    category,
    trust_score,
    usage_count,
    parent_components,
    1 as depth,
    ARRAY[id] as path
  FROM atomic_components
  WHERE parent_components IS NULL OR parent_components = '{}'
  
  UNION ALL
  
  -- Recursive case: build up the hierarchy
  SELECT 
    ac.id,
    ac.component_type,
    ac.name,
    ac.category,
    ac.trust_score,
    ac.usage_count,
    ac.parent_components,
    ct.depth + 1,
    ct.path || ac.id
  FROM atomic_components ac
  JOIN component_tree ct ON ac.parent_components @> ARRAY[ct.id]
  WHERE ac.id != ALL(ct.path) -- Prevent cycles
)
SELECT * FROM component_tree
ORDER BY depth, trust_score DESC;

-- Free plan conversion insights
CREATE OR REPLACE VIEW free_plan_insights AS
SELECT 
  user_id,
  COUNT(*) as total_actions,
  COUNT(DISTINCT action) as unique_actions,
  MAX(timestamp) as last_active,
  MIN(timestamp) as first_active,
  EXTRACT(DAYS FROM (MAX(timestamp) - MIN(timestamp))) as days_active,
  COUNT(*) / NULLIF(EXTRACT(DAYS FROM (MAX(timestamp) - MIN(timestamp))), 0) as avg_daily_actions,
  CASE 
    WHEN COUNT(*) > 100 THEN 'high'
    WHEN COUNT(*) > 50 THEN 'medium'
    ELSE 'low'
  END as conversion_potential
FROM free_plan_engagement
GROUP BY user_id;

-- ====================================
-- Functions
-- ====================================

-- Function to auto-stop campaigns on billing end
CREATE OR REPLACE FUNCTION check_campaign_expiry()
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET 
    status = 'stopped',
    stopped_at = NOW(),
    stop_reason = 'billing_cycle_ended'
  WHERE 
    status = 'active'
    AND next_billing_date < NOW()
    AND (auto_stop_config->>'onBillingEnd')::boolean = true;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate component synergy
CREATE OR REPLACE FUNCTION calculate_component_synergy(
  component_ids INTEGER[]
)
RETURNS DECIMAL AS $$
DECLARE
  avg_trust DECIMAL;
  component_count INTEGER;
BEGIN
  SELECT 
    AVG(trust_score),
    COUNT(*)
  INTO avg_trust, component_count
  FROM atomic_components
  WHERE id = ANY(component_ids);
  
  -- Synergy bonus for multiple high-trust components
  IF avg_trust > 0.8 AND component_count > 1 THEN
    RETURN LEAST(avg_trust * 1.2, 1.0);
  END IF;
  
  RETURN COALESCE(avg_trust, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to suggest schema combinations
CREATE OR REPLACE FUNCTION suggest_schema_combinations(
  category VARCHAR,
  min_trust DECIMAL DEFAULT 0.7
)
RETURNS TABLE(
  schema_combination INTEGER[],
  combined_trust DECIMAL,
  usage_frequency BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ARRAY_AGG(DISTINCT schema_id ORDER BY schema_id) as schema_combination,
    AVG(trust_score) as combined_trust,
    COUNT(*) as usage_frequency
  FROM (
    SELECT 
      mss.schema_id,
      s.trust_score
    FROM mcp_server_schemas mss
    JOIN schemas s ON mss.schema_id = s.id
    WHERE s.category = $1
      AND s.trust_score >= $2
  ) sub
  GROUP BY server_id
  HAVING COUNT(*) > 1
  ORDER BY usage_frequency DESC, combined_trust DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-optimize campaign config
CREATE OR REPLACE FUNCTION auto_optimize_campaign(
  p_campaign_id VARCHAR
)
RETURNS JSONB AS $$
DECLARE
  campaign_record RECORD;
  optimal_config JSONB;
  avg_success_rate DECIMAL;
BEGIN
  -- Get campaign details
  SELECT * INTO campaign_record
  FROM campaigns
  WHERE id = p_campaign_id;
  
  IF campaign_record IS NULL THEN
    RETURN '{"error": "Campaign not found"}'::jsonb;
  END IF;
  
  -- Calculate success rate from orchestrations
  SELECT 
    AVG(
      (results::jsonb -> 'summary' -> 'successful')::int::float / 
      NULLIF((results::jsonb -> 'summary' -> 'total')::int, 0)
    )
  INTO avg_success_rate
  FROM orchestrations
  WHERE campaign_id = p_campaign_id;
  
  -- Generate optimal config based on performance
  optimal_config := jsonb_build_object(
    'temperature', CASE 
      WHEN avg_success_rate > 0.8 THEN 0.7
      WHEN avg_success_rate > 0.5 THEN 0.6
      ELSE 0.5
    END,
    'max_tokens', CASE
      WHEN campaign_record.plan = 'enterprise' THEN 4000
      WHEN campaign_record.plan = 'pro' THEN 2500
      ELSE 2000
    END,
    'parallel_execution', campaign_record.plan IN ('pro', 'enterprise'),
    'auto_optimization', true,
    'based_on_success_rate', avg_success_rate
  );
  
  RETURN optimal_config;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- Triggers
-- ====================================

-- Update trust scores automatically
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trust_score_update
BEFORE UPDATE ON trust_scores
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

-- ====================================
-- Sample Data
-- ====================================

-- Sample campaigns
INSERT INTO campaigns (id, client_id, name, plan, limits, usage, billing_cycle, next_billing_date, auto_stop_config) VALUES
  (
    'campaign-free-001',
    'client-001',
    'Free Tier Campaign',
    'free',
    '{"maxExecutions": 100, "maxSchemas": 3, "maxBundles": 1, "autoOptimization": false}'::jsonb,
    '{"executions": 0, "schemas": 0, "bundles": 0}'::jsonb,
    'monthly',
    NOW() + INTERVAL '30 days',
    '{"onBillingEnd": true, "onLimitReached": true}'::jsonb
  ),
  (
    'campaign-pro-001',
    'client-002',
    'Pro Campaign',
    'pro',
    '{"maxExecutions": 10000, "maxSchemas": 50, "maxBundles": 20, "autoOptimization": true}'::jsonb,
    '{"executions": 0, "schemas": 0, "bundles": 0}'::jsonb,
    'monthly',
    NOW() + INTERVAL '30 days',
    '{"onBillingEnd": true, "onLimitReached": false}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Sample atomic components
INSERT INTO atomic_components (component_type, name, category, definition, trust_score, usage_count) VALUES
  ('atom', 'Title Attribute', 'seo', '{"attribute": "title", "type": "string"}'::jsonb, 0.95, 1000),
  ('atom', 'Meta Description', 'seo', '{"attribute": "meta_description", "type": "string"}'::jsonb, 0.92, 950),
  ('molecule', 'SEO Title+Meta', 'seo', '{"atoms": ["Title Attribute", "Meta Description"]}'::jsonb, 0.88, 500)
ON CONFLICT DO NOTHING;

-- Sample trust scores
INSERT INTO trust_scores (type, identifier, total_executions, successful_executions, metadata) VALUES
  ('schema', 'seo-analysis', 100, 92, '{"category": "seo"}'::jsonb),
  ('config', 'temp-0.7-tokens-2000', 200, 175, '{"temperature": 0.7, "max_tokens": 2000}'::jsonb),
  ('bundle', 'seo-pipeline', 50, 48, '{"schemas": [1, 2, 3]}'::jsonb)
ON CONFLICT (type, identifier) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE campaigns IS 'Campaign governance with billing integration and resource limits';
COMMENT ON TABLE trust_scores IS 'Trust scoring system for patterns, configs, and schemas';
COMMENT ON TABLE atomic_components IS 'Atomic design components: atoms, molecules, organisms, templates, pages';
COMMENT ON TABLE trusted_paths IS 'Proven progression paths for efficient resource usage';
COMMENT ON TABLE failure_analysis IS 'Self-evaluation and auto-fix suggestions';
COMMENT ON TABLE orchestrations IS 'Multi-schema parallel task execution for campaigns';
COMMENT ON TABLE free_plan_engagement IS 'Free user engagement tracking for conversion insights';
