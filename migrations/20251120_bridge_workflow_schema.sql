-- Bridge Migration: Align existing workflow tables with application expectations
-- Created: 2025-11-20
-- Purpose: Convert legacy UUID-based workflow tables to VARCHAR identifiers,
--          add missing metadata columns, and ensure supporting tables exist so
--          that downstream migrations (create-workflow-tables.sql, etc.) apply cleanly.

BEGIN;

-- Drop legacy foreign keys that block identifier type conversions
ALTER TABLE IF EXISTS workflow_tasks
    DROP CONSTRAINT IF EXISTS workflow_tasks_workflow_id_fkey;

ALTER TABLE IF EXISTS workflow_runs
    DROP CONSTRAINT IF EXISTS workflow_runs_workflow_id_fkey;

-- Ensure workflows table uses VARCHAR identifiers and has the required metadata columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflows' AND column_name = 'workflow_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE workflows
            ALTER COLUMN workflow_id DROP DEFAULT,
            ALTER COLUMN workflow_id TYPE VARCHAR(255) USING workflow_id::text;
    END IF;
END;
$$;

ALTER TABLE workflows
    ADD COLUMN IF NOT EXISTS id SERIAL,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'datamining',
    ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS script_injected BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS n8n_workflow_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS tensorflow_instance_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS seo_score INTEGER,
    ADD COLUMN IF NOT EXISTS automation_threshold INTEGER DEFAULT 120,
    ADD COLUMN IF NOT EXISTS pending_automation BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Backfill the new type column from legacy workflow_type if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflows' AND column_name = 'workflow_type'
    ) THEN
        EXECUTE 'UPDATE workflows SET type = workflow_type WHERE type IS NULL AND workflow_type IS NOT NULL';
    END IF;
END;
$$;

-- Ensure status column defaults to draft and updated_at auto-refreshes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflows' AND column_name = 'status'
    ) THEN
        ALTER TABLE workflows ALTER COLUMN status SET DEFAULT 'draft';
    END IF;
END;
$$;

UPDATE workflows
SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP),
    owner_name = COALESCE(owner_name, 'Admin User'),
    owner_email = COALESCE(owner_email, 'admin@lightdom.io'),
    pending_automation = COALESCE(pending_automation, TRUE),
    automation_threshold = COALESCE(automation_threshold, 120);

-- Add primary key and unique constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflows' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE workflows ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflows' AND constraint_name = 'workflows_workflow_id_key'
    ) THEN
        ALTER TABLE workflows ADD CONSTRAINT workflows_workflow_id_key UNIQUE (workflow_id);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(type);

-- Align workflow_runs identifiers and columns with application expectations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_runs' AND column_name = 'run_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE workflow_runs
            ALTER COLUMN run_id TYPE VARCHAR(255) USING run_id::text;
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_runs' AND column_name = 'workflow_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE workflow_runs
            ALTER COLUMN workflow_id TYPE VARCHAR(255) USING workflow_id::text;
    END IF;
END;
$$;

ALTER TABLE workflow_runs
    ADD COLUMN IF NOT EXISTS id SERIAL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_task VARCHAR(255),
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS error TEXT,
    ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_runs' AND column_name = 'status'
    ) THEN
        ALTER TABLE workflow_runs ALTER COLUMN status SET DEFAULT 'pending';
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_runs' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE workflow_runs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
    END IF;
END;
$$;

UPDATE workflow_runs
SET started_at = COALESCE(started_at, created_at, CURRENT_TIMESTAMP),
    status = COALESCE(status, 'pending'),
    progress = COALESCE(progress, 0),
    results = COALESCE(results, result_data, '{}'::jsonb);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflow_runs' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE workflow_runs ADD CONSTRAINT workflow_runs_pkey PRIMARY KEY (id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflow_runs' AND constraint_name = 'workflow_runs_run_id_key'
    ) THEN
        ALTER TABLE workflow_runs ADD CONSTRAINT workflow_runs_run_id_key UNIQUE (run_id);
    END IF;
END;
$$;

-- Ensure workflow_tasks table uses VARCHAR identifiers and has expected columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_tasks' AND column_name = 'task_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE workflow_tasks
            ALTER COLUMN task_id TYPE VARCHAR(255) USING task_id::text;
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_tasks' AND column_name = 'workflow_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE workflow_tasks
            ALTER COLUMN workflow_id TYPE VARCHAR(255) USING workflow_id::text;
    END IF;
END;
$$;

ALTER TABLE workflow_tasks
    ADD COLUMN IF NOT EXISTS id SERIAL,
    ADD COLUMN IF NOT EXISTS label VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS handler_type VARCHAR(100) DEFAULT 'generic',
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Handler config should default to JSON object for new inserts
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_tasks' AND column_name = 'handler_config'
    ) THEN
        ALTER TABLE workflow_tasks ALTER COLUMN handler_config SET DEFAULT '{}'::jsonb;
    END IF;
END;
$$;

UPDATE workflow_tasks
SET label = COALESCE(label, name, CONCAT('Task-', task_id)),
    description = COALESCE(description, ''),
    handler_type = COALESCE(handler_type, task_type, 'generic'),
    status = COALESCE(status, 'pending'),
    is_optional = COALESCE(is_optional, FALSE),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

-- Add primary key and foreign key if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflow_tasks' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE workflow_tasks ADD CONSTRAINT workflow_tasks_pkey PRIMARY KEY (id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflow_tasks' AND constraint_name = 'workflow_tasks_task_id_key'
    ) THEN
        ALTER TABLE workflow_tasks ADD CONSTRAINT workflow_tasks_task_id_key UNIQUE (task_id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflow_tasks' AND constraint_name = 'workflow_tasks_workflow_id_fkey'
    ) THEN
        ALTER TABLE workflow_tasks
            ADD CONSTRAINT workflow_tasks_workflow_id_fkey
            FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE;
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'workflow_runs' AND constraint_name = 'workflow_runs_workflow_id_fkey'
    ) THEN
        ALTER TABLE workflow_runs
            ADD CONSTRAINT workflow_runs_workflow_id_fkey
            FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE;
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow_id ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_ordering ON workflow_tasks(workflow_id, ordering);

-- Ensure update trigger exists to maintain updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_tasks_updated_at
    BEFORE UPDATE ON workflow_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create workflow_attributes table if missing (structure expected by application)
CREATE TABLE IF NOT EXISTS workflow_attributes (
    id SERIAL PRIMARY KEY,
    attribute_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    enrichment_prompt TEXT,
    drilldown_prompts JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure workflow_runs table exists with compatible schema
CREATE TABLE IF NOT EXISTS workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_task VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error TEXT,
    results JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status);

-- Create workflow_run_tasks table if missing
CREATE TABLE IF NOT EXISTS workflow_run_tasks (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) REFERENCES workflow_runs(run_id) ON DELETE CASCADE,
    task_id VARCHAR(255) REFERENCES workflow_tasks(task_id),
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    output JSONB DEFAULT '{}',
    error TEXT
);

COMMIT;
