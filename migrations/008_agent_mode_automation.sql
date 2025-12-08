-- Migration: Agent Mode and Automation System
-- Purpose: Tables for agent spawning, investigation contexts, and GitHub automation
-- Created: 2025-11-16

-- ============================================================================
-- Agent Investigation Contexts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_investigation_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to error report (optional)
    error_report_id UUID REFERENCES error_reports(id) ON DELETE CASCADE,
    
    -- Context data
    context_data JSONB NOT NULL,
    
    -- Metadata
    file_count INTEGER DEFAULT 0,
    line_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigation_contexts_error ON agent_investigation_contexts(error_report_id);
CREATE INDEX IF NOT EXISTS idx_investigation_contexts_created ON agent_investigation_contexts(created_at DESC);

-- ============================================================================
-- DeepSeek Agent Instances Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS deepseek_agent_instances (
    id UUID PRIMARY KEY,
    
    -- Task reference
    task_id UUID,
    
    -- Agent details
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'spawning' CHECK (status IN ('spawning', 'running', 'completed', 'failed', 'terminated')),
    
    -- Context and results
    context JSONB,
    result JSONB,
    error TEXT,
    
    -- Lifecycle tracking
    spawned_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_instances_status ON deepseek_agent_instances(status);
CREATE INDEX IF NOT EXISTS idx_agent_instances_type ON deepseek_agent_instances(type);
CREATE INDEX IF NOT EXISTS idx_agent_instances_spawned ON deepseek_agent_instances(spawned_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_instances_task ON deepseek_agent_instances(task_id);

-- ============================================================================
-- DeepSeek Agent Tasks Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS deepseek_agent_tasks (
    id UUID PRIMARY KEY,
    
    -- Task details
    type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    
    -- Task context
    context JSONB NOT NULL,
    
    -- Agent assignment
    agent_id UUID REFERENCES deepseek_agent_instances(id) ON DELETE SET NULL,
    
    -- Retry tracking
    attempts INTEGER DEFAULT 0,
    error TEXT,
    
    -- Timestamps
    queued_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON deepseek_agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON deepseek_agent_tasks(type);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON deepseek_agent_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_queued ON deepseek_agent_tasks(queued_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON deepseek_agent_tasks(agent_id);

-- ============================================================================
-- GitHub Issues Table (for tracking automated issues)
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Issue details
    issue_number INTEGER NOT NULL,
    issue_url TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    state VARCHAR(20) DEFAULT 'open',
    
    -- Labels and assignees
    labels TEXT[],
    assignees TEXT[],
    
    -- Source tracking
    source_type VARCHAR(50) CHECK (source_type IN ('error_report', 'agent_task', 'manual')),
    source_id UUID,
    error_report_id UUID REFERENCES error_reports(id) ON DELETE SET NULL,
    
    -- GitHub metadata
    github_created_at TIMESTAMPTZ,
    github_updated_at TIMESTAMPTZ,
    github_closed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_issues_number ON github_issues(issue_number);
CREATE INDEX IF NOT EXISTS idx_github_issues_state ON github_issues(state);
CREATE INDEX IF NOT EXISTS idx_github_issues_error ON github_issues(error_report_id);
CREATE INDEX IF NOT EXISTS idx_github_issues_source ON github_issues(source_type, source_id);

-- ============================================================================
-- GitHub Pull Requests Table (for tracking automated PRs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS github_pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- PR details
    pr_number INTEGER NOT NULL,
    pr_url TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    state VARCHAR(20) DEFAULT 'open',
    draft BOOLEAN DEFAULT true,
    
    -- Branch information
    head_branch VARCHAR(255) NOT NULL,
    base_branch VARCHAR(255) NOT NULL,
    
    -- Source tracking
    error_report_id UUID REFERENCES error_reports(id) ON DELETE SET NULL,
    agent_task_id UUID REFERENCES deepseek_agent_tasks(id) ON DELETE SET NULL,
    
    -- Related issue
    github_issue_id UUID REFERENCES github_issues(id) ON DELETE SET NULL,
    
    -- Review status
    reviewers TEXT[],
    review_status VARCHAR(50),
    
    -- GitHub metadata
    github_created_at TIMESTAMPTZ,
    github_updated_at TIMESTAMPTZ,
    github_merged_at TIMESTAMPTZ,
    github_closed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_prs_number ON github_pull_requests(pr_number);
CREATE INDEX IF NOT EXISTS idx_github_prs_state ON github_pull_requests(state);
CREATE INDEX IF NOT EXISTS idx_github_prs_error ON github_pull_requests(error_report_id);
CREATE INDEX IF NOT EXISTS idx_github_prs_task ON github_pull_requests(agent_task_id);
CREATE INDEX IF NOT EXISTS idx_github_prs_issue ON github_pull_requests(github_issue_id);

-- ============================================================================
-- Service Health Status Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_health_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Service identification
    service_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    
    -- Health status
    status VARCHAR(50) DEFAULT 'unknown' CHECK (status IN ('healthy', 'unhealthy', 'unknown', 'error')),
    healthy BOOLEAN DEFAULT false,
    
    -- Sub-services status
    sub_services JSONB DEFAULT '{}',
    
    -- Error information
    error_message TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Timestamps
    last_check TIMESTAMPTZ,
    last_success TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_health_service ON service_health_status(service_id);
CREATE INDEX IF NOT EXISTS idx_service_health_status ON service_health_status(status);
CREATE INDEX IF NOT EXISTS idx_service_health_updated ON service_health_status(updated_at DESC);

-- Create unique constraint for service_id
ALTER TABLE service_health_status 
ADD CONSTRAINT unique_service_health_service_id UNIQUE (service_id);

-- ============================================================================
-- Codebase Index Table (for knowledge graph integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS codebase_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- File information
    file_path TEXT NOT NULL UNIQUE,
    file_type VARCHAR(50),
    content TEXT,
    
    -- Metadata
    size_bytes INTEGER,
    last_modified TIMESTAMPTZ,
    
    -- Dependencies and relationships
    imports TEXT[],
    exports TEXT[],
    dependencies TEXT[],
    
    -- Analysis
    complexity_score INTEGER,
    lines_of_code INTEGER,
    
    -- Timestamps
    indexed_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codebase_index_path ON codebase_index(file_path);
CREATE INDEX IF NOT EXISTS idx_codebase_index_type ON codebase_index(file_type);
CREATE INDEX IF NOT EXISTS idx_codebase_index_updated ON codebase_index(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_codebase_index_content ON codebase_index USING GIN(to_tsvector('english', content));

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE TRIGGER update_investigation_contexts_updated_at
    BEFORE UPDATE ON agent_investigation_contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_issues_updated_at
    BEFORE UPDATE ON github_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_prs_updated_at
    BEFORE UPDATE ON github_pull_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_health_updated_at
    BEFORE UPDATE ON service_health_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_codebase_index_updated_at
    BEFORE UPDATE ON codebase_index
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Views
-- ============================================================================

-- Active agents view
CREATE OR REPLACE VIEW active_agents AS
SELECT 
    id,
    task_id,
    type,
    status,
    spawned_at,
    last_activity,
    EXTRACT(EPOCH FROM (NOW() - spawned_at)) as runtime_seconds
FROM deepseek_agent_instances
WHERE status IN ('spawning', 'running')
ORDER BY spawned_at DESC;

-- Pending tasks view
CREATE OR REPLACE VIEW pending_tasks AS
SELECT 
    id,
    type,
    priority,
    status,
    queued_at,
    attempts,
    EXTRACT(EPOCH FROM (NOW() - queued_at)) as wait_time_seconds
FROM deepseek_agent_tasks
WHERE status IN ('queued', 'processing')
ORDER BY priority ASC, queued_at ASC;

-- GitHub issues summary
CREATE OR REPLACE VIEW github_issues_summary AS
SELECT 
    state,
    source_type,
    COUNT(*) as total,
    COUNT(DISTINCT error_report_id) as unique_errors,
    MAX(github_updated_at) as most_recent_update
FROM github_issues
GROUP BY state, source_type;

-- Service health summary
CREATE OR REPLACE VIEW service_health_summary AS
SELECT 
    status,
    COUNT(*) as service_count,
    ARRAY_AGG(service_name) as services
FROM service_health_status
GROUP BY status;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE agent_investigation_contexts IS 'Stores investigation contexts generated for errors and features';
COMMENT ON TABLE deepseek_agent_instances IS 'Tracks spawned DeepSeek agent instances';
COMMENT ON TABLE deepseek_agent_tasks IS 'Queue for agent tasks';
COMMENT ON TABLE github_issues IS 'Tracks GitHub issues created by automation';
COMMENT ON TABLE github_pull_requests IS 'Tracks GitHub PRs created by automation';
COMMENT ON TABLE service_health_status IS 'Real-time service health tracking';
COMMENT ON TABLE codebase_index IS 'Indexed codebase for knowledge graph queries';
