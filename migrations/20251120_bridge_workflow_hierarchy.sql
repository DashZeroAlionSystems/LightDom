-- Bridge Migration: Align legacy workflow data tables with hierarchy schema requirements
-- Created: 2025-11-20

BEGIN;

-- =============================================
-- Part 1: Normalize data_streams structure
-- =============================================

-- Drop legacy triggers to avoid duplicate creation later
DROP TRIGGER IF EXISTS data_streams_updated_at ON data_streams;
DROP TRIGGER IF EXISTS update_data_streams_updated_at ON data_streams;

-- Remove dependent constraints before adjusting primary key and identifier types
ALTER TABLE stream_attributes DROP CONSTRAINT IF EXISTS stream_attributes_stream_id_fkey;

-- Switch primary key from UUID stream_id to integer id while keeping stream identifiers unique
ALTER TABLE data_streams DROP CONSTRAINT IF EXISTS data_streams_pkey;

ALTER TABLE data_streams
    ADD COLUMN IF NOT EXISTS id SERIAL;

-- Ensure existing rows receive identifier values
DO $$
DECLARE
    seq_name text;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'data_streams' AND column_name = 'id'
    ) THEN
        SELECT pg_get_serial_sequence('data_streams', 'id') INTO seq_name;
        IF seq_name IS NOT NULL THEN
            EXECUTE format('UPDATE data_streams SET id = nextval(%L) WHERE id IS NULL', seq_name);
            EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(id) FROM data_streams), 0) + 1, false)', seq_name);
        END IF;
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'data_streams' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE data_streams ADD CONSTRAINT data_streams_pkey PRIMARY KEY (id);
    END IF;
END;
$$;

-- Convert stream_id from UUID to VARCHAR for compatibility with hierarchy migrations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'data_streams' AND column_name = 'stream_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE data_streams
            ALTER COLUMN stream_id DROP DEFAULT,
            ALTER COLUMN stream_id TYPE VARCHAR(255) USING stream_id::text;
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stream_attributes' AND column_name = 'stream_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE stream_attributes
            ALTER COLUMN stream_id TYPE VARCHAR(255) USING stream_id::text;
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'data_streams' AND constraint_name = 'data_streams_stream_id_key'
    ) THEN
        ALTER TABLE data_streams ADD CONSTRAINT data_streams_stream_id_key UNIQUE (stream_id);
    END IF;
END;
$$;

-- Add and align columns expected by workflow-hierarchy schema
ALTER TABLE data_streams
    ADD COLUMN IF NOT EXISTS source_service_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS destination_service_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS direction VARCHAR(50) DEFAULT 'source-to-destination',
    ADD COLUMN IF NOT EXISTS data_format VARCHAR(50) DEFAULT 'json',
    ADD COLUMN IF NOT EXISTS data_schema JSONB,
    ADD COLUMN IF NOT EXISTS attribute_bindings JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS realtime_protocol VARCHAR(50),
    ADD COLUMN IF NOT EXISTS polling_interval_ms INTEGER,
    ADD COLUMN IF NOT EXISTS buffer_size INTEGER DEFAULT 100,
    ADD COLUMN IF NOT EXISTS retry_policy JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS last_data_received_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS total_messages_sent BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_messages_received BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS auto_schema JSONB,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure created_at column exists and uses consistent type defaults
ALTER TABLE data_streams
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE data_streams
    ALTER COLUMN created_at TYPE TIMESTAMP USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at AT TIME ZONE 'UTC';

-- Harmonize main descriptive columns with expected types
ALTER TABLE data_streams
    ALTER COLUMN name TYPE VARCHAR(255),
    ALTER COLUMN stream_type TYPE VARCHAR(100);

-- Backfill new columns with sensible defaults
UPDATE data_streams
SET direction = COALESCE(direction, 'source-to-destination'),
    data_format = COALESCE(data_format, 'json'),
    attribute_bindings = COALESCE(attribute_bindings, '[]'::jsonb),
    retry_policy = COALESCE(retry_policy, '{}'::jsonb),
    buffer_size = COALESCE(buffer_size, 100),
    is_active = COALESCE(is_active, CASE WHEN status = 'inactive' THEN FALSE ELSE TRUE END),
    total_messages_sent = COALESCE(total_messages_sent, 0),
    total_messages_received = COALESCE(total_messages_received, 0),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

-- Re-establish foreign keys and indexes for the enriched schema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'data_streams' AND constraint_name = 'data_streams_source_service_id_fkey'
    ) THEN
        ALTER TABLE data_streams
            ADD CONSTRAINT data_streams_source_service_id_fkey
            FOREIGN KEY (source_service_id) REFERENCES workflow_services(service_id) ON DELETE CASCADE;
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'data_streams' AND constraint_name = 'data_streams_destination_service_id_fkey'
    ) THEN
        ALTER TABLE data_streams
            ADD CONSTRAINT data_streams_destination_service_id_fkey
            FOREIGN KEY (destination_service_id) REFERENCES workflow_services(service_id) ON DELETE CASCADE;
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_data_streams_source ON data_streams(source_service_id);
CREATE INDEX IF NOT EXISTS idx_data_streams_destination ON data_streams(destination_service_id);
CREATE INDEX IF NOT EXISTS idx_data_streams_active ON data_streams(is_active);

-- Restore stream_attributes foreign key with updated type
ALTER TABLE stream_attributes
    ADD CONSTRAINT stream_attributes_stream_id_fkey
    FOREIGN KEY (stream_id) REFERENCES data_streams(stream_id) ON DELETE CASCADE;

-- Restore updated_at trigger using shared helper
CREATE TRIGGER update_data_streams_updated_at
    BEFORE UPDATE ON data_streams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Part 2: Extend workflow_attributes for hierarchy compatibility
-- =============================================

ALTER TABLE workflow_attributes
    ADD COLUMN IF NOT EXISTS name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS attribute_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS json_schema JSONB,
    ADD COLUMN IF NOT EXISTS default_value JSONB,
    ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_system_attribute BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE workflow_attributes
SET name = COALESCE(name, label),
    attribute_type = COALESCE(attribute_type, type),
    validation_rules = COALESCE(validation_rules, '[]'::jsonb),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

CREATE INDEX IF NOT EXISTS idx_workflow_attributes_type ON workflow_attributes(attribute_type);
CREATE INDEX IF NOT EXISTS idx_workflow_attributes_category ON workflow_attributes(category);

COMMIT;
