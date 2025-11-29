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

DO $$
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'client_id'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN client_id VARCHAR(255)';
      EXECUTE 'UPDATE campaigns SET client_id = COALESCE(client_id, ''legacy-client'')';
      BEGIN
        EXECUTE 'ALTER TABLE campaigns ALTER COLUMN client_id SET NOT NULL';
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Could not enforce NOT NULL on campaigns.client_id: %', SQLERRM;
      END;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'client_id' AND is_nullable = 'YES'
    ) THEN
      BEGIN
        EXECUTE 'UPDATE campaigns SET client_id = COALESCE(client_id, ''legacy-client'') WHERE client_id IS NULL';
        EXECUTE 'ALTER TABLE campaigns ALTER COLUMN client_id SET NOT NULL';
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Could not enforce NOT NULL on existing campaigns.client_id column: %', SQLERRM;
      END;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'plan'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN plan VARCHAR(50)';
      EXECUTE 'UPDATE campaigns SET plan = COALESCE(plan, ''free'')';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'plan' AND is_nullable = 'YES'
    ) THEN
      BEGIN
        EXECUTE 'UPDATE campaigns SET plan = COALESCE(plan, ''free'') WHERE plan IS NULL';
        EXECUTE 'ALTER TABLE campaigns ALTER COLUMN plan SET NOT NULL';
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Could not enforce NOT NULL on campaigns.plan: %', SQLERRM;
      END;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'limits'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN limits JSONB DEFAULT ''{}''::jsonb';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'usage'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN usage JSONB DEFAULT ''{}''::jsonb';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'status'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN status VARCHAR(50) DEFAULT ''active''';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'billing_cycle'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN billing_cycle VARCHAR(50)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'next_billing_date'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN next_billing_date TIMESTAMP';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'auto_stop_config'
    ) THEN
      EXECUTE 'ALTER TABLE campaigns ADD COLUMN auto_stop_config JSONB';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_campaigns_client'
    ) THEN
      EXECUTE 'CREATE INDEX idx_campaigns_client ON campaigns(client_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_campaigns_status'
    ) THEN
      EXECUTE 'CREATE INDEX idx_campaigns_status ON campaigns(status)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_campaigns_plan'
    ) THEN
      EXECUTE 'CREATE INDEX idx_campaigns_plan ON campaigns(plan)';
    END IF;
  END IF;
END;
$$;

DO $$
DECLARE
  campaign_id_type TEXT := 'VARCHAR(255)';
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    SELECT format_type(a.atttypid, a.atttypmod)
    INTO campaign_id_type
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'campaigns'
      AND a.attname = 'id'
      AND a.attisdropped = false
    LIMIT 1;
  ELSE
    RAISE NOTICE 'Skipping campaign links; campaigns table not found.';
  END IF;

  IF campaign_id_type IS NULL THEN
    campaign_id_type := 'VARCHAR(255)';
  END IF;

  IF to_regclass('public.mcp_servers') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'campaign_id'
    ) THEN
      EXECUTE format('ALTER TABLE mcp_servers ADD COLUMN campaign_id %s', campaign_id_type);
    END IF;
  ELSE
    RAISE NOTICE 'Skipping campaign_id on mcp_servers; table not found.';
  END IF;

  IF to_regclass('public.mcp_stream_sessions') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_stream_sessions' AND column_name = 'campaign_id'
    ) THEN
      EXECUTE format('ALTER TABLE mcp_stream_sessions ADD COLUMN campaign_id %s', campaign_id_type);
    END IF;
  ELSE
    RAISE NOTICE 'Skipping campaign_id on mcp_stream_sessions; table not found.';
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF to_regclass('public.schemas') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE schemas ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false';
    EXECUTE 'ALTER TABLE schemas ADD COLUMN IF NOT EXISTS trust_score DECIMAL(5,4)';
    EXECUTE 'ALTER TABLE schemas ADD COLUMN IF NOT EXISTS based_on_pattern_id INTEGER';
  ELSE
    RAISE NOTICE 'Skipping schema alterations; schemas table missing.';
  END IF;
END;
$$;

DO $$
DECLARE
  orchestration_campaign_type TEXT := 'VARCHAR(255)';
  orchestration_statement TEXT;
  campaigns_available BOOLEAN := to_regclass('public.campaigns') IS NOT NULL;
BEGIN
  IF campaigns_available THEN
    SELECT format_type(a.atttypid, a.atttypmod)
    INTO orchestration_campaign_type
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'campaigns'
      AND a.attname = 'id'
      AND a.attisdropped = false
    LIMIT 1;
  END IF;

  IF orchestration_campaign_type IS NULL THEN
    orchestration_campaign_type := 'VARCHAR(255)';
  END IF;

  IF to_regclass('public.orchestrations') IS NULL THEN
    orchestration_statement := format(
      'CREATE TABLE orchestrations (
         id VARCHAR(255) PRIMARY KEY,
         campaign_id %s%s,
         schema_ids JSONB NOT NULL,
         task JSONB NOT NULL,
         results JSONB,
         errors JSONB,
         created_at TIMESTAMP DEFAULT NOW(),
         completed_at TIMESTAMP,
         duration_ms INTEGER
       )',
      orchestration_campaign_type,
      CASE
        WHEN campaigns_available THEN ' REFERENCES campaigns(id)'
        ELSE ''
      END
    );

    BEGIN
      EXECUTE orchestration_statement;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Failed to create orchestrations with FK constraint: %', SQLERRM;
        orchestration_statement := format(
          'CREATE TABLE orchestrations (
             id VARCHAR(255) PRIMARY KEY,
             campaign_id %s,
             schema_ids JSONB NOT NULL,
             task JSONB NOT NULL,
             results JSONB,
             errors JSONB,
             created_at TIMESTAMP DEFAULT NOW(),
             completed_at TIMESTAMP,
             duration_ms INTEGER
           )',
          orchestration_campaign_type
        );
        EXECUTE orchestration_statement;
    END;
  END IF;

  IF to_regclass('public.orchestrations') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'orchestrations' AND column_name = 'campaign_id'
    ) THEN
      EXECUTE format('ALTER TABLE orchestrations ADD COLUMN campaign_id %s', orchestration_campaign_type);
    END IF;
  END IF;
END;
$$;

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
DO $$
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW campaign_health AS
      SELECT 
        c.id,
        c.name,
        c.plan,
        c.status,
        (c.usage->>'executions')::int AS used_executions,
        (c.limits->>'maxExecutions')::int AS max_executions,
        CASE 
          WHEN (c.limits->>'maxExecutions')::int = -1 THEN 100
          ELSE ((c.usage->>'executions')::float / NULLIF((c.limits->>'maxExecutions')::int, 0) * 100)
        END AS usage_percentage,
        c.next_billing_date,
        EXTRACT(DAYS FROM (c.next_billing_date - NOW())) AS days_until_billing
      FROM campaigns c
      WHERE c.status = 'active'
    $view$;
  ELSE
    RAISE NOTICE 'Skipping campaign_health view; campaigns table missing.';
  END IF;
END;
$$;

-- Trust leaderboard
DO $$
BEGIN
  IF to_regclass('public.trust_scores') IS NOT NULL THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW trust_leaderboard AS
      SELECT 
        type,
        identifier,
        total_executions,
        successful_executions,
        (successful_executions::float / NULLIF(total_executions, 0)) AS success_rate,
        last_used,
        CASE 
          WHEN (successful_executions::float / NULLIF(total_executions, 0)) > 0.9 THEN 'excellent'
          WHEN (successful_executions::float / NULLIF(total_executions, 0)) > 0.7 THEN 'good'
          WHEN (successful_executions::float / NULLIF(total_executions, 0)) > 0.5 THEN 'acceptable'
          ELSE 'poor'
        END AS trust_level
      FROM trust_scores
      WHERE total_executions > 10
      ORDER BY success_rate DESC, total_executions DESC
    $view$;
  ELSE
    RAISE NOTICE 'Skipping trust_leaderboard view; trust_scores table missing.';
  END IF;
END;
$$;

-- Atomic component hierarchy
DO $$
BEGIN
  IF to_regclass('public.atomic_components') IS NOT NULL THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW component_hierarchy AS
      WITH RECURSIVE component_tree AS (
        SELECT 
          id,
          component_type,
          name,
          category,
          trust_score,
          usage_count,
          parent_components,
          1 AS depth,
          ARRAY[id] AS path
        FROM atomic_components
        WHERE parent_components IS NULL OR parent_components = '{}'

        UNION ALL

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
        WHERE ac.id != ALL(ct.path)
      )
      SELECT * FROM component_tree
      ORDER BY depth, trust_score DESC
    $view$;
  ELSE
    RAISE NOTICE 'Skipping component_hierarchy view; atomic_components table missing.';
  END IF;
END;
$$;

-- Free plan conversion insights
DO $$
BEGIN
  IF to_regclass('public.free_plan_engagement') IS NOT NULL THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW free_plan_insights AS
      SELECT 
        user_id,
        COUNT(*) AS total_actions,
        COUNT(DISTINCT action) AS unique_actions,
        MAX(timestamp) AS last_active,
        MIN(timestamp) AS first_active,
        EXTRACT(DAYS FROM (MAX(timestamp) - MIN(timestamp))) AS days_active,
        COUNT(*) / NULLIF(EXTRACT(DAYS FROM (MAX(timestamp) - MIN(timestamp))), 0) AS avg_daily_actions,
        CASE 
          WHEN COUNT(*) > 100 THEN 'high'
          WHEN COUNT(*) > 50 THEN 'medium'
          ELSE 'low'
        END AS conversion_potential
      FROM free_plan_engagement
      GROUP BY user_id
    $view$;
  ELSE
    RAISE NOTICE 'Skipping free_plan_insights view; free_plan_engagement table missing.';
  END IF;
END;
$$;

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

DO $$
DECLARE
  campaign_id_type TEXT;
  is_numeric_id BOOLEAN := false;
  has_campaign_code BOOLEAN := false;
  has_prompt BOOLEAN := false;
  base_columns TEXT;
  free_values TEXT;
  pro_values TEXT;
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    SELECT format_type(a.atttypid, a.atttypmod)
    INTO campaign_id_type
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'campaigns'
      AND a.attname = 'id'
      AND a.attisdropped = false
    LIMIT 1;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'campaign_id'
    ) INTO has_campaign_code;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'prompt'
    ) INTO has_prompt;

    IF campaign_id_type ILIKE 'int%' OR campaign_id_type ILIKE 'bigint%' THEN
      is_numeric_id := true;
    END IF;

    base_columns := 'client_id, name, plan, limits, usage, billing_cycle, next_billing_date, auto_stop_config';
    free_values := format('%s, %s, %s, %s::jsonb, %s::jsonb, %s, NOW() + INTERVAL ''30 days'', %s::jsonb',
      quote_literal('client-001'),
      quote_literal('Free Tier Campaign'),
      quote_literal('free'),
      quote_literal('{"maxExecutions": 100, "maxSchemas": 3, "maxBundles": 1, "autoOptimization": false}'),
      quote_literal('{"executions": 0, "schemas": 0, "bundles": 0}'),
      quote_literal('monthly'),
      quote_literal('{"onBillingEnd": true, "onLimitReached": true}')
    );

    pro_values := format('%s, %s, %s, %s::jsonb, %s::jsonb, %s, NOW() + INTERVAL ''30 days'', %s::jsonb',
      quote_literal('client-002'),
      quote_literal('Pro Campaign'),
      quote_literal('pro'),
      quote_literal('{"maxExecutions": 10000, "maxSchemas": 50, "maxBundles": 20, "autoOptimization": true}'),
      quote_literal('{"executions": 0, "schemas": 0, "bundles": 0}'),
      quote_literal('monthly'),
      quote_literal('{"onBillingEnd": true, "onLimitReached": false}')
    );

    IF has_campaign_code THEN
      base_columns := base_columns || ', campaign_id';
      free_values := free_values || ', ' || quote_literal('campaign-free-001');
      pro_values := pro_values || ', ' || quote_literal('campaign-pro-001');
    END IF;

    IF has_prompt THEN
      base_columns := base_columns || ', prompt';
      free_values := free_values || ', ' || quote_literal('Automated system-generated campaign prompt.');
      pro_values := pro_values || ', ' || quote_literal('Automated professional campaign prompt.');
    END IF;

    IF is_numeric_id THEN
      IF NOT EXISTS (
        SELECT 1 FROM campaigns WHERE name = 'Free Tier Campaign'
      ) THEN
        EXECUTE format('INSERT INTO campaigns (%s) VALUES (%s)', base_columns, free_values);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM campaigns WHERE name = 'Pro Campaign'
      ) THEN
        EXECUTE format('INSERT INTO campaigns (%s) VALUES (%s)', base_columns, pro_values);
      END IF;
    ELSE
      base_columns := 'id, ' || base_columns;
      free_values := quote_literal('campaign-free-001') || ', ' || free_values;
      pro_values := quote_literal('campaign-pro-001') || ', ' || pro_values;

      EXECUTE format(
        'INSERT INTO campaigns (%s) VALUES (%s), (%s) ON CONFLICT (id) DO NOTHING',
        base_columns,
        free_values,
        pro_values
      );
    END IF;
  ELSE
    RAISE NOTICE 'Skipping campaign seed data; campaigns table missing.';
  END IF;
END;
$$;

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
DO $$
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE campaigns IS ''Campaign governance with billing integration and resource limits''';
  END IF;

  IF to_regclass('public.trust_scores') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE trust_scores IS ''Trust scoring system for patterns, configs, and schemas''';
  END IF;

  IF to_regclass('public.atomic_components') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE atomic_components IS ''Atomic design components: atoms, molecules, organisms, templates, pages''';
  END IF;

  IF to_regclass('public.trusted_paths') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE trusted_paths IS ''Proven progression paths for efficient resource usage''';
  END IF;

  IF to_regclass('public.failure_analysis') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE failure_analysis IS ''Self-evaluation and auto-fix suggestions''';
  END IF;

  IF to_regclass('public.orchestrations') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE orchestrations IS ''Multi-schema parallel task execution for campaigns''';
  END IF;

  IF to_regclass('public.free_plan_engagement') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE free_plan_engagement IS ''Free user engagement tracking for conversion insights''';
  END IF;
END;
$$;
