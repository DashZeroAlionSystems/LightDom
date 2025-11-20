-- Migration: Error Reporting and DeepSeek Integration System
-- Purpose: Store runtime errors, analysis results, and automated remediation actions
-- Created: 2025-11-14

-- ============================================================================
-- Error Reports Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Error identification
    error_hash VARCHAR(64) NOT NULL,
    error_type VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'error', 'warning', 'info')),
    
    -- Error details
    message TEXT NOT NULL,
    stack_trace TEXT,
    component VARCHAR(255) NOT NULL,
    service VARCHAR(255),
    
    -- Context
    context JSONB DEFAULT '{}',
    environment VARCHAR(50) DEFAULT 'development',
    
    -- Metadata
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    occurrence_count INTEGER DEFAULT 1,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'analyzing', 'analyzed', 'actioned', 'resolved', 'ignored')),
    
    -- DeepSeek analysis
    analysis_requested_at TIMESTAMPTZ,
    analysis_completed_at TIMESTAMPTZ,
    analysis_result JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_error_reports_hash ON error_reports(error_hash);
CREATE INDEX IF NOT EXISTS idx_error_reports_component ON error_reports(component);
CREATE INDEX IF NOT EXISTS idx_error_reports_severity ON error_reports(severity);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_last_seen ON error_reports(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_reports_context ON error_reports USING GIN(context);

-- ============================================================================
-- Error Actions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_report_id UUID NOT NULL REFERENCES error_reports(id) ON DELETE CASCADE,
    
    -- Action details
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('log_only', 'create_ticket', 'generate_pr', 'auto_fix', 'escalate')),
    action_status VARCHAR(50) DEFAULT 'pending' CHECK (action_status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    
    -- DeepSeek recommendations
    recommended_by VARCHAR(100) DEFAULT 'deepseek',
    recommendation JSONB NOT NULL,
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Implementation details
    implementation_plan TEXT,
    commit_message TEXT,
    diff_summary TEXT,
    related_files TEXT[],
    
    -- Execution tracking
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result JSONB,
    
    -- Git workflow
    branch_name VARCHAR(255),
    pr_url TEXT,
    ticket_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_actions_report ON error_actions(error_report_id);
CREATE INDEX IF NOT EXISTS idx_error_actions_type ON error_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_error_actions_status ON error_actions(action_status);
CREATE INDEX IF NOT EXISTS idx_error_actions_created ON error_actions(created_at DESC);

-- ============================================================================
-- Error Aggregations Table (for pattern detection)
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Aggregation key
    pattern_hash VARCHAR(64) NOT NULL UNIQUE,
    pattern_type VARCHAR(50) NOT NULL,
    
    -- Pattern details
    error_pattern JSONB NOT NULL,
    affected_components TEXT[],
    total_occurrences INTEGER DEFAULT 0,
    
    -- Analysis
    root_cause_hypothesis TEXT,
    recommended_actions JSONB,
    
    -- Tracking
    first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_aggregations_pattern ON error_aggregations(pattern_hash);
CREATE INDEX IF NOT EXISTS idx_error_aggregations_status ON error_aggregations(status);
CREATE INDEX IF NOT EXISTS idx_error_aggregations_updated ON error_aggregations(last_updated_at DESC);

-- ============================================================================
-- DeepSeek Analysis Log (for audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deepseek_analysis_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request details
    request_type VARCHAR(50) NOT NULL,
    request_payload JSONB NOT NULL,
    
    -- Response
    response_payload JSONB,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    
    -- Security audit
    secrets_redacted BOOLEAN DEFAULT TRUE,
    ip_address INET,
    user_agent TEXT,
    
    -- Performance
    duration_ms INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'timeout')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deepseek_log_type ON deepseek_analysis_log(request_type);
CREATE INDEX IF NOT EXISTS idx_deepseek_log_status ON deepseek_analysis_log(status);
CREATE INDEX IF NOT EXISTS idx_deepseek_log_created ON deepseek_analysis_log(created_at DESC);

-- ============================================================================
-- Configuration Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_orchestration_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Config key
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    schema_version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO error_orchestration_config (config_key, config_value, description) VALUES
('analysis.rate_limit', '{"max_requests_per_minute": 10, "max_concurrent": 3}', 'Rate limiting for DeepSeek analysis'),
('analysis.thresholds', '{"min_occurrences": 3, "min_confidence": 0.7, "auto_fix_confidence": 0.9}', 'Thresholds for automated actions'),
('git.workflow', '{"auto_commit": false, "require_approval": true, "branch_prefix": "fix/deepseek-"}', 'Git workflow preferences'),
('security.redaction', '{"patterns": ["password", "api_key", "secret", "token"], "enabled": true}', 'Secret redaction patterns'),
('ollama.endpoint', '{"url": "http://127.0.0.1:11434", "model": "deepseek-coder", "timeout_ms": 30000}', 'Ollama/DeepSeek connection settings')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- Triggers for automatic timestamp updates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_error_reports_updated_at
    BEFORE UPDATE ON error_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_error_actions_updated_at
    BEFORE UPDATE ON error_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_error_orchestration_config_updated_at
    BEFORE UPDATE ON error_orchestration_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Views for common queries
-- ============================================================================
CREATE OR REPLACE VIEW error_reports_summary AS
SELECT 
    component,
    severity,
    error_type,
    COUNT(*) as total_reports,
    SUM(occurrence_count) as total_occurrences,
    MAX(last_seen_at) as most_recent,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as pending_analysis,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
FROM error_reports
GROUP BY component, severity, error_type
ORDER BY total_occurrences DESC;

CREATE OR REPLACE VIEW pending_error_analysis AS
SELECT 
    er.id,
    er.error_hash,
    er.component,
    er.severity,
    er.message,
    er.occurrence_count,
    er.last_seen_at,
    er.status
FROM error_reports er
WHERE er.status IN ('new', 'analyzing')
    AND er.severity IN ('critical', 'error')
ORDER BY 
    CASE er.severity 
        WHEN 'critical' THEN 1
        WHEN 'error' THEN 2
    END,
    er.occurrence_count DESC,
    er.last_seen_at DESC;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to upsert error report (handles deduplication)
CREATE OR REPLACE FUNCTION upsert_error_report(
    p_error_hash VARCHAR,
    p_error_type VARCHAR,
    p_severity VARCHAR,
    p_message TEXT,
    p_stack_trace TEXT,
    p_component VARCHAR,
    p_service VARCHAR,
    p_context JSONB
)
RETURNS UUID AS $$
DECLARE
    v_report_id UUID;
BEGIN
    INSERT INTO error_reports (
        error_hash, error_type, severity, message, 
        stack_trace, component, service, context,
        first_seen_at, last_seen_at, occurrence_count
    )
    VALUES (
        p_error_hash, p_error_type, p_severity, p_message,
        p_stack_trace, p_component, p_service, p_context,
        NOW(), NOW(), 1
    )
    ON CONFLICT (error_hash) 
    DO UPDATE SET
        last_seen_at = NOW(),
        occurrence_count = error_reports.occurrence_count + 1,
        status = CASE 
            WHEN error_reports.status = 'resolved' THEN 'new'
            ELSE error_reports.status
        END
    RETURNING id INTO v_report_id;
    
    RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on error_hash for deduplication
ALTER TABLE error_reports ADD CONSTRAINT unique_error_hash UNIQUE (error_hash);

COMMENT ON TABLE error_reports IS 'Stores all runtime errors captured by the system';
COMMENT ON TABLE error_actions IS 'Tracks automated remediation actions recommended by DeepSeek';
COMMENT ON TABLE error_aggregations IS 'Aggregates error patterns for root cause analysis';
COMMENT ON TABLE deepseek_analysis_log IS 'Audit log for all DeepSeek API interactions';
COMMENT ON TABLE error_orchestration_config IS 'Configuration for error orchestration system';
