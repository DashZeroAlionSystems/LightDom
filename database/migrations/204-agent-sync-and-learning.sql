-- Agent Sync and Self-Learning System Migration
-- Creates tables for agent synchronization, auto-config generation, and self-learning

-- ============================================================================
-- AGENT SYNCHRONIZATION TABLES
-- ============================================================================

-- Sync channels for two-way communication
CREATE TABLE IF NOT EXISTS agent_sync_channels (
  channel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('unidirectional', 'bidirectional', 'broadcast')),
  sync_strategy VARCHAR(50) NOT NULL CHECK (sync_strategy IN ('immediate', 'batched', 'scheduled')),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_channels_type ON agent_sync_channels(channel_type);

-- Agent channel subscriptions
CREATE TABLE IF NOT EXISTS agent_channel_subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES agent_sync_channels(channel_id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  UNIQUE(agent_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_agent ON agent_channel_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel ON agent_channel_subscriptions(channel_id);

-- Sync events
CREATE TABLE IF NOT EXISTS agent_sync_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES agent_sync_channels(channel_id) ON DELETE CASCADE,
  source_agent_id UUID,
  event_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sync_events_channel ON agent_sync_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_processed ON agent_sync_events(processed);
CREATE INDEX IF NOT EXISTS idx_sync_events_timestamp ON agent_sync_events(timestamp DESC);

-- Agent state snapshots
CREATE TABLE IF NOT EXISTS agent_state_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  state_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(agent_id, version)
);

CREATE INDEX IF NOT EXISTS idx_state_snapshots_agent ON agent_state_snapshots(agent_id);
CREATE INDEX IF NOT EXISTS idx_state_snapshots_version ON agent_state_snapshots(agent_id, version DESC);

-- ============================================================================
-- AUTO-CONFIGURATION GENERATION TABLES
-- ============================================================================

-- Auto-generated configurations
CREATE TABLE IF NOT EXISTS auto_generated_configs (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type VARCHAR(255) NOT NULL,
  generated_config JSONB NOT NULL,
  generation_method VARCHAR(50) NOT NULL CHECK (generation_method IN ('pattern_based', 'ml_optimized', 'hybrid')),
  source_patterns UUID[] DEFAULT '{}',
  confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_auto_configs_workflow_type ON auto_generated_configs(workflow_type);
CREATE INDEX IF NOT EXISTS idx_auto_configs_confidence ON auto_generated_configs(confidence_score DESC);

-- Configuration test results
CREATE TABLE IF NOT EXISTS config_test_results (
  test_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES auto_generated_configs(config_id) ON DELETE CASCADE,
  test_input JSONB NOT NULL,
  simulation_result JSONB NOT NULL,
  success BOOLEAN NOT NULL,
  performance_metrics JSONB DEFAULT '{}',
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_config_tests_config ON config_test_results(config_id);
CREATE INDEX IF NOT EXISTS idx_config_tests_success ON config_test_results(success);

-- ============================================================================
-- SELF-LEARNING ORCHESTRATION TABLES
-- ============================================================================

-- Learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  focus_area VARCHAR(255) NOT NULL,
  learning_budget JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  metrics JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_agent ON learning_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_focus ON learning_sessions(focus_area);

-- Research campaigns
CREATE TABLE IF NOT EXISTS research_campaigns (
  campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(255) NOT NULL,
  data_sources TEXT[] NOT NULL,
  mining_depth INTEGER DEFAULT 3,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'completed', 'failed')),
  findings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_research_campaigns_status ON research_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_research_campaigns_topic ON research_campaigns(topic);

-- Learning patterns
CREATE TABLE IF NOT EXISTS learning_patterns (
  pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_category VARCHAR(100) NOT NULL,
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER DEFAULT 0,
  description TEXT,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_learning_patterns_category ON learning_patterns(pattern_category);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_confidence ON learning_patterns(confidence_score DESC);

-- Optimizations
CREATE TABLE IF NOT EXISTS optimizations (
  optimization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES learning_patterns(pattern_id) ON DELETE CASCADE,
  target VARCHAR(100) NOT NULL,
  proposed_changes JSONB NOT NULL,
  estimated_improvement DECIMAL(5,4) NOT NULL,
  cost_benefit_ratio DECIMAL(10,4) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('proposed', 'tested', 'applied', 'rejected')),
  test_results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_optimizations_pattern ON optimizations(pattern_id);
CREATE INDEX IF NOT EXISTS idx_optimizations_status ON optimizations(status);
CREATE INDEX IF NOT EXISTS idx_optimizations_cbr ON optimizations(cost_benefit_ratio DESC);

-- Optimization metrics
CREATE TABLE IF NOT EXISTS optimization_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  optimization_id UUID NOT NULL REFERENCES optimizations(optimization_id) ON DELETE CASCADE,
  improvement_value DECIMAL(10,4) NOT NULL,
  cost_savings DECIMAL(10,2) DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_optimization_metrics_agent ON optimization_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_optimization_metrics_optimization ON optimization_metrics(optimization_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Sample sync channels
INSERT INTO agent_sync_channels (name, description, channel_type, sync_strategy, config) VALUES
('global-sync', 'Global synchronization channel for all agents', 'broadcast', 'immediate', '{"max_subscribers": 1000}'),
('seo-agents', 'Sync channel for SEO-related agents', 'bidirectional', 'immediate', '{"topic": "seo"}'),
('simulation-results', 'Channel for propagating simulation results', 'broadcast', 'batched', '{"batch_size": 10}'),
('agent-updates', 'Channel for agent state updates', 'bidirectional', 'scheduled', '{"schedule": "*/5 * * * *"}')
ON CONFLICT (name) DO NOTHING;

-- Sample learning patterns
INSERT INTO learning_patterns (pattern_category, pattern_data, confidence_score, description, usage_count) VALUES
('high_success_workflow', '{"workflow_id": "seo-analysis", "success_rate": 0.95, "avg_duration": 5000, "executions": 100}', 0.95, 'High success SEO analysis workflow', 100),
('cost_efficient_workflow', '{"workflow_id": "content-gen", "avg_cost": 0.50, "avg_duration": 3000}', 0.85, 'Cost-efficient content generation', 75),
('high_security_instance', '{"instance_id": "secure-agent-1", "security_score": 98, "check_count": 200}', 0.90, 'High security instance configuration', 200),
('parallel_execution', '{"parallelism": 5, "execution_time_reduction": 0.60}', 0.82, 'Parallel execution pattern', 50),
('caching_strategy', '{"cache_hit_rate": 0.85, "cost_reduction": 0.40}', 0.88, 'Effective caching strategy', 120),
('error_recovery', '{"retry_strategy": "exponential_backoff", "success_after_retry": 0.75}', 0.78, 'Error recovery pattern', 60),
('resource_optimization', '{"cpu_reduction": 0.30, "memory_reduction": 0.25}', 0.80, 'Resource usage optimization', 40),
('batch_processing', '{"batch_size": 100, "throughput_improvement": 0.50}', 0.83, 'Batch processing optimization', 90),
('lazy_loading', '{"initial_load_time_reduction": 0.45, "memory_savings": 0.35}', 0.81, 'Lazy loading pattern', 65),
('circuit_breaker', '{"failure_prevention_rate": 0.92, "system_stability": 0.95}', 0.89, 'Circuit breaker pattern', 110)
ON CONFLICT DO NOTHING;

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sync_channels_updated_at BEFORE UPDATE ON agent_sync_channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
