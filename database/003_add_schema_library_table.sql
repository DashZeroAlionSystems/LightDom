-- Schema Library table for storing component schemas
-- Migration: 003_add_schema_library_table.sql

CREATE TABLE IF NOT EXISTS schema_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schema_id VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'ld:AtomicButton', 'ld:DataTable'
    schema_type VARCHAR(100) NOT NULL, -- e.g., 'component', 'service', 'workflow'
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL, -- The actual ld-schema definition
    examples JSONB DEFAULT '[]', -- Example usage
    dependencies TEXT[] DEFAULT '{}', -- Other schema_ids this depends on
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100), -- e.g., 'ui', 'data', 'layout'
    is_atomic BOOLEAN DEFAULT false, -- True for atomic components
    is_public BOOLEAN DEFAULT true, -- Whether this schema is publicly available
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Index for schema_id lookups
CREATE INDEX IF NOT EXISTS idx_schema_library_schema_id ON schema_library(schema_id);

-- Index for type-based queries
CREATE INDEX IF NOT EXISTS idx_schema_library_schema_type ON schema_library(schema_type);

-- Index for category queries
CREATE INDEX IF NOT EXISTS idx_schema_library_category ON schema_library(category);

-- Index for tag-based searches
CREATE INDEX IF NOT EXISTS idx_schema_library_tags ON schema_library USING GIN(tags);

-- Index for atomic component queries
CREATE INDEX IF NOT EXISTS idx_schema_library_is_atomic ON schema_library(is_atomic);

-- Index for JSONB schema searches
CREATE INDEX IF NOT EXISTS idx_schema_library_schema ON schema_library USING GIN(schema);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_schema_library_updated_at
    BEFORE UPDATE ON schema_library
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
