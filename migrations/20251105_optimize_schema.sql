-- Database Optimization Script
-- Optimizes schema maps and indexes for performance

-- Create optimized indexes for agent management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_status_created
    ON agent_sessions(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_instances_session_status
    ON agent_instances(session_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_messages_session_created
    ON agent_messages(session_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_tools_category_active
    ON agent_tools(category, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_workflows_type_active
    ON agent_workflows(workflow_type, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_steps_workflow_ordering
    ON workflow_steps(workflow_id, ordering);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_executions_status_started
    ON agent_executions(status, started_at DESC);

-- Create GIN indexes for JSONB fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_config_gin
    ON agent_sessions USING gin(configuration);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_instances_tools_gin
    ON agent_instances USING gin(tools_enabled);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_workflows_config_gin
    ON agent_workflows USING gin(configuration);

-- Create partial indexes for active records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_agent_sessions
    ON agent_sessions(created_at DESC) WHERE status != 'archived';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_agent_instances
    ON agent_instances(created_at DESC) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_executions
    ON agent_executions(started_at DESC) WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Create composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_status_created
    ON agent_campaigns(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_streams_campaign_status
    ON data_streams(campaign_id, status);

-- Analyze tables for query planning
ANALYZE agent_sessions;
ANALYZE agent_instances;
ANALYZE agent_messages;
ANALYZE agent_tools;
ANALYZE agent_services;
ANALYZE agent_workflows;
ANALYZE workflow_steps;
ANALYZE agent_executions;
ANALYZE agent_campaigns;
ANALYZE data_streams;
