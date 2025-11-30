-- Migration: 20251124_service_session_streams.sql
-- Adds runtime service session logging and structured data stream tables

-- Ensure UUID utilities are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generic updated_at trigger helper (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SERVICE RUNTIME PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_runtime_profiles (
    profile_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id       UUID NOT NULL REFERENCES agent_services(service_id) ON DELETE CASCADE,
    profile_key      TEXT NOT NULL,
    name             TEXT NOT NULL,
    description      TEXT,
    environment      TEXT NOT NULL DEFAULT 'development',
    base_url         TEXT,
    auth_strategy    TEXT,
    default_model    TEXT,
    configuration    JSONB NOT NULL DEFAULT '{}'::jsonb,
    limits           JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, profile_key)
);

CREATE INDEX IF NOT EXISTS idx_service_runtime_profiles_service
    ON service_runtime_profiles(service_id, environment);

CREATE TRIGGER service_runtime_profiles_updated_at
    BEFORE UPDATE ON service_runtime_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SERVICE SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_sessions (
    service_session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id         UUID NOT NULL REFERENCES agent_services(service_id) ON DELETE CASCADE,
    profile_id         UUID REFERENCES service_runtime_profiles(profile_id) ON DELETE SET NULL,
    session_label      TEXT,
    status             TEXT NOT NULL DEFAULT 'initializing',
    started_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at           TIMESTAMPTZ,
    runtime_metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
    health_snapshot    JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_summary      TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_sessions_service_started
    ON service_sessions(service_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_sessions_status
    ON service_sessions(status);

CREATE TRIGGER service_sessions_updated_at
    BEFORE UPDATE ON service_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SERVICE SESSION EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_session_events (
    event_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_session_id  UUID NOT NULL REFERENCES service_sessions(service_session_id) ON DELETE CASCADE,
    event_type          TEXT NOT NULL,
    event_source        TEXT,
    severity            TEXT NOT NULL DEFAULT 'info',
    event_payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_service_session_events_session
    ON service_session_events(service_session_id, occurred_at DESC);

-- ============================================================================
-- SERVICE STREAM CHANNELS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_stream_channels (
    channel_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id        UUID NOT NULL REFERENCES agent_services(service_id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    description       TEXT,
    channel_type      TEXT NOT NULL,
    schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    retention_policy  JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, name)
);

CREATE INDEX IF NOT EXISTS idx_service_stream_channels_service
    ON service_stream_channels(service_id, channel_type);

CREATE TRIGGER service_stream_channels_updated_at
    BEFORE UPDATE ON service_stream_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SERVICE SESSION STREAM RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_session_streams (
    stream_record_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_session_id  UUID NOT NULL REFERENCES service_sessions(service_session_id) ON DELETE CASCADE,
    channel_id          UUID NOT NULL REFERENCES service_stream_channels(channel_id) ON DELETE CASCADE,
    sequence_number     BIGINT NOT NULL,
    payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
    status              TEXT NOT NULL DEFAULT 'captured',
    captured_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(service_session_id, channel_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_service_session_streams_session
    ON service_session_streams(service_session_id, captured_at DESC);

-- ============================================================================
-- SERVICE SESSION METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_session_metrics (
    metrics_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_session_id  UUID NOT NULL REFERENCES service_sessions(service_session_id) ON DELETE CASCADE,
    metric_name         TEXT NOT NULL,
    metric_value        NUMERIC(18,6) NOT NULL,
    unit                TEXT,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_service_session_metrics_session
    ON service_session_metrics(service_session_id, metric_name);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION CLARITY
-- ============================================================================
COMMENT ON TABLE service_runtime_profiles IS 'Named runtime configurations for agent services across environments.';
COMMENT ON TABLE service_sessions IS 'Records each runtime session for a service including health snapshots and errors.';
COMMENT ON TABLE service_session_events IS 'Fine-grained event log for service sessions to support diagnostics.';
COMMENT ON TABLE service_stream_channels IS 'Declarative channel definitions describing structured data streams a service emits or consumes.';
COMMENT ON TABLE service_session_streams IS 'Captured payloads for service streams during a specific session.';
COMMENT ON TABLE service_session_metrics IS 'Timeseries metrics captured for a service session (latency, cost, tokens, etc.).';
