-- Migration: 20251105_agent_schema.sql
-- Create tables for DeepSeek orchestration and dashboard analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Core orchestration tables
CREATE TABLE IF NOT EXISTS agent_sessions (
    session_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL,
    description       TEXT,
    agent_type        TEXT NOT NULL DEFAULT 'deepseek',
    status            TEXT NOT NULL DEFAULT 'active',
    configuration     JSONB NOT NULL DEFAULT '{}'::jsonb,
    context_data      JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_instances (
    instance_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id        UUID NOT NULL REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    model_name        TEXT NOT NULL,
    model_version     TEXT,
    status            TEXT NOT NULL DEFAULT 'idle',
    max_tokens        INTEGER NOT NULL DEFAULT 4096,
    temperature       NUMERIC(4,2) NOT NULL DEFAULT 0.70,
    fine_tune_config  JSONB NOT NULL DEFAULT '{}'::jsonb,
    tools_enabled     JSONB NOT NULL DEFAULT '[]'::jsonb,
    services_enabled  JSONB NOT NULL DEFAULT '[]'::jsonb,
    schema_map        JSONB NOT NULL DEFAULT '{}'::jsonb,
    pattern_rules     JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_active_at    TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_instances_session ON agent_instances(session_id);

-- Conversation trail
CREATE TABLE IF NOT EXISTS agent_messages (
    message_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id    UUID NOT NULL REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    instance_id   UUID REFERENCES agent_instances(instance_id) ON DELETE SET NULL,
    role          TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
    content       TEXT NOT NULL,
    attachments   JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_session_created
    ON agent_messages(session_id, created_at);

-- Reusable tools & services
CREATE TABLE IF NOT EXISTS agent_tools (
    tool_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             TEXT NOT NULL,
    description      TEXT,
    category         TEXT,
    service_type     TEXT,
    handler_function TEXT NOT NULL,
    input_schema     JSONB NOT NULL,
    output_schema    JSONB NOT NULL,
    configuration    JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_services (
    service_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           TEXT NOT NULL,
    description    TEXT,
    category       TEXT,
    configuration  JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_tools (
    service_id   UUID NOT NULL REFERENCES agent_services(service_id) ON DELETE CASCADE,
    tool_id      UUID NOT NULL REFERENCES agent_tools(tool_id) ON DELETE CASCADE,
    ordering     INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (service_id, tool_id)
);

-- Workflow library
CREATE TABLE IF NOT EXISTS agent_workflows (
    workflow_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           TEXT NOT NULL,
    description    TEXT,
    workflow_type  TEXT NOT NULL DEFAULT 'automation',
    configuration  JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_template    BOOLEAN NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    step_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id        UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
    name               TEXT NOT NULL,
    step_type          TEXT NOT NULL,
    service_id         UUID REFERENCES agent_services(service_id) ON DELETE SET NULL,
    tool_id            UUID REFERENCES agent_tools(tool_id) ON DELETE SET NULL,
    ordering           INTEGER NOT NULL,
    dependencies       JSONB NOT NULL DEFAULT '[]'::jsonb,
    configuration      JSONB NOT NULL DEFAULT '{}'::jsonb,
    conditional_logic  JSONB NOT NULL DEFAULT '{}'::jsonb,
    retry_policy       JSONB NOT NULL DEFAULT '{}'::jsonb,
    timeout_seconds    INTEGER NOT NULL DEFAULT 300,
    is_optional        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id, ordering);

CREATE TABLE IF NOT EXISTS workflow_subworkflows (
    subworkflow_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_workflow_id  UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
    child_workflow_id   UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
    execution_order     INTEGER NOT NULL DEFAULT 0,
    condition           JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign orchestration
CREATE TABLE IF NOT EXISTS agent_campaigns (
    campaign_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             TEXT NOT NULL,
    description      TEXT,
    campaign_type    TEXT,
    status           TEXT NOT NULL DEFAULT 'draft',
    schedule_config  JSONB NOT NULL DEFAULT '{}'::jsonb,
    configuration    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_workflows (
    campaign_id   UUID NOT NULL REFERENCES agent_campaigns(campaign_id) ON DELETE CASCADE,
    workflow_id   UUID NOT NULL REFERENCES agent_workflows(workflow_id) ON DELETE CASCADE,
    ordering      INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (campaign_id, workflow_id)
);

-- Data streams + attributes
CREATE TABLE IF NOT EXISTS data_streams (
    stream_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id          UUID REFERENCES agent_campaigns(campaign_id) ON DELETE SET NULL,
    name                 TEXT NOT NULL,
    description          TEXT,
    stream_type          TEXT NOT NULL,
    status               TEXT NOT NULL DEFAULT 'inactive',
    source_config        JSONB NOT NULL,
    target_config        JSONB NOT NULL DEFAULT '{}'::jsonb,
    transformation_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stream_attributes (
    attribute_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id           UUID NOT NULL REFERENCES data_streams(stream_id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    data_type           TEXT NOT NULL,
    extraction_config   JSONB NOT NULL,
    enrichment_prompt   TEXT,
    search_algorithm    TEXT,
    validation_rules    JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_required         BOOLEAN NOT NULL DEFAULT FALSE,
    is_included         BOOLEAN NOT NULL DEFAULT TRUE,
    default_value       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stream_attributes_stream ON stream_attributes(stream_id);

-- Execution tracking for dashboard metrics
CREATE TABLE IF NOT EXISTS agent_executions (
    execution_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID REFERENCES agent_sessions(session_id) ON DELETE SET NULL,
    instance_id     UUID REFERENCES agent_instances(instance_id) ON DELETE SET NULL,
    workflow_id     UUID REFERENCES agent_workflows(workflow_id) ON DELETE SET NULL,
    execution_type  TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    input_data      JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data     JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_data      JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_executions_workflow_status
    ON agent_executions(workflow_id, status);

CREATE INDEX IF NOT EXISTS idx_agent_executions_session
    ON agent_executions(session_id);

-- Attach updated_at triggers
CREATE TRIGGER agent_sessions_updated_at
    BEFORE UPDATE ON agent_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER agent_instances_updated_at
    BEFORE UPDATE ON agent_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER agent_tools_updated_at
    BEFORE UPDATE ON agent_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER agent_services_updated_at
    BEFORE UPDATE ON agent_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER agent_workflows_updated_at
    BEFORE UPDATE ON agent_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER workflow_steps_updated_at
    BEFORE UPDATE ON workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER workflow_subworkflows_updated_at
    BEFORE UPDATE ON workflow_subworkflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER agent_campaigns_updated_at
    BEFORE UPDATE ON agent_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER data_streams_updated_at
    BEFORE UPDATE ON data_streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER stream_attributes_updated_at
    BEFORE UPDATE ON stream_attributes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER agent_executions_updated_at
    BEFORE UPDATE ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
