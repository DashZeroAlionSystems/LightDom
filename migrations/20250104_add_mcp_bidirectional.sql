-- Migration: Add MCP Bundles and Event Recording Tables
-- Purpose: Support bi-directional communication, auto-bundling, and config optimization

-- ====================================
-- MCP Bundles Table
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_bundles (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  server_ids JSONB NOT NULL, -- Array of server IDs in the bundle
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  execution_count INTEGER DEFAULT 0
);

DO $$
BEGIN
  IF to_regclass('public.mcp_bundles') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_bundles_name'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_bundles_name ON mcp_bundles(name)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_bundles_created'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_bundles_created ON mcp_bundles(created_at)';
    END IF;
  END IF;
END;
$$;

-- ====================================
-- MCP Events Table (for recording and optimization)
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- e.g., 'client-message', 'bundle-execution', 'schema-edited'
  server_id INTEGER REFERENCES mcp_servers(id) ON DELETE SET NULL,
  bundle_id VARCHAR(255) REFERENCES mcp_bundles(id) ON DELETE SET NULL,
  stream_id VARCHAR(255),
  session_id VARCHAR(255),
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration INTEGER -- milliseconds
);

DO $$
BEGIN
  IF to_regclass('public.mcp_events') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_events_type'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_events_type ON mcp_events(event_type)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_events_server'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_events_server ON mcp_events(server_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_events_bundle'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_events_bundle ON mcp_events(bundle_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_events_timestamp'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_events_timestamp ON mcp_events(timestamp)';
    END IF;
  END IF;
END;
$$;

-- ====================================
-- MCP Stream Sessions Table
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_stream_sessions (
  id VARCHAR(255) PRIMARY KEY,
  server_id INTEGER REFERENCES mcp_servers(id) ON DELETE CASCADE,
  client_id VARCHAR(255) NOT NULL,
  config JSONB DEFAULT '{}',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  messages_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

DO $$
BEGIN
  IF to_regclass('public.mcp_stream_sessions') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_stream_sessions' AND column_name = 'client_id'
    ) THEN
      EXECUTE 'ALTER TABLE mcp_stream_sessions ADD COLUMN client_id VARCHAR(255)';
      EXECUTE 'UPDATE mcp_stream_sessions SET client_id = COALESCE(client_id, ''legacy-client'')';
    END IF;

    BEGIN
      EXECUTE 'ALTER TABLE mcp_stream_sessions ALTER COLUMN client_id SET NOT NULL';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not enforce NOT NULL on mcp_stream_sessions.client_id: %', SQLERRM;
    END;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_streams_server'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_streams_server ON mcp_stream_sessions(server_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_streams_active'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_streams_active ON mcp_stream_sessions(active)';
    END IF;
  END IF;
END;
$$;

-- ====================================
-- MCP Config Optimization History
-- ====================================
CREATE TABLE IF NOT EXISTS mcp_config_history (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES mcp_servers(id) ON DELETE CASCADE,
  bundle_id VARCHAR(255) REFERENCES mcp_bundles(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  performance_score DECIMAL(5,2), -- 0-100 score
  events_analyzed INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  applied BOOLEAN DEFAULT false
);

DO $$
BEGIN
  IF to_regclass('public.mcp_config_history') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_config_server'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_config_server ON mcp_config_history(server_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_mcp_config_score'
    ) THEN
      EXECUTE 'CREATE INDEX idx_mcp_config_score ON mcp_config_history(performance_score)';
    END IF;
  END IF;
END;
$$;

-- ====================================
-- Views for Analytics
-- ====================================

-- Active streams view
DO $$
BEGIN
  IF to_regclass('public.mcp_stream_sessions') IS NOT NULL
     AND to_regclass('public.mcp_servers') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'agent_type'
     ) THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW mcp_active_streams AS
      SELECT 
        s.*,
        ms.name AS server_name,
        ms.agent_type,
        EXTRACT(EPOCH FROM (NOW() - s.started_at)) AS uptime_seconds
      FROM mcp_stream_sessions s
      JOIN mcp_servers ms ON s.server_id = ms.id
      WHERE s.active = true
    $view$;
  ELSE
    RAISE NOTICE 'Skipping view mcp_active_streams; dependent tables or columns missing.';
  END IF;
END;
$$;

-- Bundle performance view
CREATE OR REPLACE VIEW mcp_bundle_performance AS
SELECT 
  b.id,
  b.name,
  b.execution_count,
  COUNT(e.id) as total_events,
  AVG(e.duration) as avg_duration_ms,
  COUNT(CASE WHEN e.event_type = 'bundle-execution' THEN 1 END) as executions
FROM mcp_bundles b
LEFT JOIN mcp_events e ON b.id = e.bundle_id
GROUP BY b.id, b.name, b.execution_count;

-- Server optimization insights
DO $$
BEGIN
  IF to_regclass('public.mcp_servers') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns WHERE table_name = 'mcp_servers' AND column_name = 'agent_type'
     ) THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW mcp_server_optimization_insights AS
      SELECT 
        ms.id,
        ms.name,
        ms.agent_type,
        COUNT(DISTINCT e.id) AS total_events,
        COUNT(DISTINCT CASE WHEN e.event_type = 'client-message' THEN e.stream_id END) AS active_streams,
        AVG(e.duration) AS avg_execution_time,
        MAX(ch.performance_score) AS best_config_score,
        (
          SELECT config
          FROM mcp_config_history
          WHERE server_id = ms.id
          ORDER BY performance_score DESC
          LIMIT 1
        ) AS best_config
      FROM mcp_servers ms
      LEFT JOIN mcp_events e ON ms.id = e.server_id
      LEFT JOIN mcp_config_history ch ON ms.id = ch.server_id
      GROUP BY ms.id, ms.name, ms.agent_type
    $view$;
  ELSE
    RAISE NOTICE 'Skipping view mcp_server_optimization_insights; required columns missing.';
  END IF;
END;
$$;

-- ====================================
-- Functions for Auto-Optimization
-- ====================================

-- Function to calculate config performance score
CREATE OR REPLACE FUNCTION calculate_config_performance(
  p_server_id INTEGER,
  p_time_window INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
  v_avg_duration DECIMAL;
  v_success_rate DECIMAL;
  v_total_events INTEGER;
BEGIN
  -- Get metrics from recent events
  SELECT 
    AVG(duration),
    COUNT(*),
    COUNT(CASE WHEN event_data->>'success' = 'true' THEN 1 END)::DECIMAL / COUNT(*)
  INTO v_avg_duration, v_total_events, v_success_rate
  FROM mcp_events
  WHERE server_id = p_server_id
    AND timestamp > NOW() - p_time_window
    AND duration IS NOT NULL;
  
  -- Calculate score (0-100)
  -- Lower duration is better, higher success rate is better
  v_score := COALESCE((v_success_rate * 50) + ((5000 - LEAST(v_avg_duration, 5000)) / 5000 * 50), 0);
  
  RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to suggest bundle from frequently used server combinations
CREATE OR REPLACE FUNCTION suggest_bundle_from_patterns()
RETURNS TABLE(
  suggested_name VARCHAR,
  server_ids INTEGER[],
  usage_count BIGINT,
  avg_performance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Auto-bundle-' || ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as suggested_name,
    ARRAY_AGG(DISTINCT server_id ORDER BY server_id) as server_ids,
    COUNT(*) as usage_count,
    AVG(duration) as avg_performance
  FROM mcp_events
  WHERE event_type IN ('bundle-execution', 'client-message')
    AND timestamp > NOW() - INTERVAL '7 days'
  GROUP BY DATE_TRUNC('hour', timestamp), stream_id
  HAVING COUNT(DISTINCT server_id) > 1
  ORDER BY usage_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- Sample Data for Testing
-- ====================================

-- Sample bundle
DO $$
BEGIN
  IF to_regclass('public.mcp_bundles') IS NOT NULL THEN
    INSERT INTO mcp_bundles (id, name, server_ids, config) VALUES
      ('bundle-sample-1', 'SEO & Content Generation Bundle', '[1, 2]', '{"auto_chain": true, "parallel": false}')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Skipping bundle seed data; mcp_bundles table missing.';
  END IF;
END;
$$;

-- Comments for documentation
DO $$
BEGIN
  IF to_regclass('public.mcp_bundles') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE mcp_bundles IS ''Bundles of interconnected MCP server instances for reusable workflows''';
  END IF;

  IF to_regclass('public.mcp_events') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE mcp_events IS ''Event recording for optimization and pattern analysis''';
  END IF;

  IF to_regclass('public.mcp_stream_sessions') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE mcp_stream_sessions IS ''Active bi-directional streaming sessions''';
  END IF;

  IF to_regclass('public.mcp_config_history') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE mcp_config_history IS ''Configuration optimization history with performance tracking''';
  END IF;

  EXECUTE 'COMMENT ON FUNCTION calculate_config_performance IS ''Calculates performance score (0-100) for a server config based on recent events''';
  EXECUTE 'COMMENT ON FUNCTION suggest_bundle_from_patterns IS ''Suggests server bundles based on usage patterns''';
END;
$$;
