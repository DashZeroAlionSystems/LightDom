CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS error_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_report_id UUID REFERENCES error_reports(id) ON DELETE SET NULL,
    service VARCHAR(120) NOT NULL,
    attribute VARCHAR(255),
    status VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_event_logs_report ON error_event_logs(error_report_id);
CREATE INDEX IF NOT EXISTS idx_error_event_logs_service ON error_event_logs(service);
CREATE INDEX IF NOT EXISTS idx_error_event_logs_created ON error_event_logs(created_at DESC);
