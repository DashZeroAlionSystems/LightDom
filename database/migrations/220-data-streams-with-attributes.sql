-- Data Streams with Attributes Management
-- Migration: 220-data-streams-with-attributes.sql
-- Purpose: Enhanced data streams management with attribute relationships

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DATA STREAMS TABLE
-- ============================================================================

-- Enhanced data_streams table (compatible with existing schema)
CREATE TABLE IF NOT EXISTS data_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(100),
  source_config JSONB DEFAULT '{}',
  destination_type VARCHAR(100),
  destination_config JSONB DEFAULT '{}',
  transformation_rules JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'paused', 'error')),
  data_format VARCHAR(50),
  throughput_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_records_processed BIGINT DEFAULT 0,
  last_processed_at TIMESTAMP,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["status", "source_type", "destination_type"], "use_cases": ["start_stream", "stop_stream", "metrics"]}'::jsonb
);

-- Create indexes for data_streams
CREATE INDEX IF NOT EXISTS idx_data_streams_status ON data_streams(status);
CREATE INDEX IF NOT EXISTS idx_data_streams_source ON data_streams(source_type);
CREATE INDEX IF NOT EXISTS idx_data_streams_destination ON data_streams(destination_type);
CREATE INDEX IF NOT EXISTS idx_data_streams_created_at ON data_streams(created_at);

-- ============================================================================
-- DATA STREAM ATTRIBUTES TABLE
-- ============================================================================

-- Junction table for many-to-many relationship between data streams and attributes
CREATE TABLE IF NOT EXISTS data_stream_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_stream_id UUID NOT NULL REFERENCES data_streams(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(100),
  is_required BOOLEAN DEFAULT false,
  transformation_config JSONB DEFAULT '{}',
  validation_config JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0, -- Order of attributes in the stream
  is_included BOOLEAN DEFAULT true, -- Whether attribute is currently included
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(data_stream_id, attribute_name)
);

-- Create indexes for data_stream_attributes
CREATE INDEX IF NOT EXISTS idx_data_stream_attributes_stream ON data_stream_attributes(data_stream_id);
CREATE INDEX IF NOT EXISTS idx_data_stream_attributes_attr_id ON data_stream_attributes(attribute_id);
CREATE INDEX IF NOT EXISTS idx_data_stream_attributes_name ON data_stream_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_data_stream_attributes_included ON data_stream_attributes(is_included);

-- ============================================================================
-- ATTRIBUTE LISTS TABLE
-- ============================================================================

-- Table to manage predefined attribute lists/bundles
CREATE TABLE IF NOT EXISTS attribute_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  is_system BOOLEAN DEFAULT false, -- System-defined vs user-defined
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  _meta JSONB DEFAULT '{"api_enabled": true, "crud_enabled": true, "search_fields": ["name", "description"], "filter_fields": ["category", "is_active"]}'::jsonb
);

-- Create indexes for attribute_lists
CREATE INDEX IF NOT EXISTS idx_attribute_lists_category ON attribute_lists(category);
CREATE INDEX IF NOT EXISTS idx_attribute_lists_active ON attribute_lists(is_active);

-- ============================================================================
-- ATTRIBUTE LIST ITEMS TABLE
-- ============================================================================

-- Items in an attribute list
CREATE TABLE IF NOT EXISTS attribute_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES attribute_lists(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(100),
  position INTEGER DEFAULT 0,
  default_config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(list_id, attribute_name)
);

-- Create indexes for attribute_list_items
CREATE INDEX IF NOT EXISTS idx_attribute_list_items_list ON attribute_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_attribute_list_items_attr_id ON attribute_list_items(attribute_id);
CREATE INDEX IF NOT EXISTS idx_attribute_list_items_position ON attribute_list_items(list_id, position);

-- ============================================================================
-- DATA STREAM ATTRIBUTE LISTS TABLE
-- ============================================================================

-- Junction table for data streams using attribute lists
CREATE TABLE IF NOT EXISTS data_stream_attribute_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_stream_id UUID NOT NULL REFERENCES data_streams(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES attribute_lists(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  override_config JSONB DEFAULT '{}', -- Override default configs from list
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(data_stream_id, list_id)
);

-- Create indexes for data_stream_attribute_lists
CREATE INDEX IF NOT EXISTS idx_ds_attr_lists_stream ON data_stream_attribute_lists(data_stream_id);
CREATE INDEX IF NOT EXISTS idx_ds_attr_lists_list ON data_stream_attribute_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_ds_attr_lists_active ON data_stream_attribute_lists(is_active);

-- ============================================================================
-- DATA STREAM PROCESSING LOG TABLE
-- ============================================================================

-- Log of data stream processing activities
CREATE TABLE IF NOT EXISTS data_stream_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_stream_id UUID NOT NULL REFERENCES data_streams(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- start, stop, pause, resume, error
  status VARCHAR(50),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for data_stream_processing_log
CREATE INDEX IF NOT EXISTS idx_ds_log_stream ON data_stream_processing_log(data_stream_id);
CREATE INDEX IF NOT EXISTS idx_ds_log_processed_at ON data_stream_processing_log(processed_at);
CREATE INDEX IF NOT EXISTS idx_ds_log_action ON data_stream_processing_log(action);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_data_stream_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for data_streams
DROP TRIGGER IF EXISTS trigger_data_streams_updated_at ON data_streams;
CREATE TRIGGER trigger_data_streams_updated_at
    BEFORE UPDATE ON data_streams
    FOR EACH ROW
    EXECUTE FUNCTION update_data_stream_updated_at();

-- Trigger for data_stream_attributes
DROP TRIGGER IF EXISTS trigger_data_stream_attributes_updated_at ON data_stream_attributes;
CREATE TRIGGER trigger_data_stream_attributes_updated_at
    BEFORE UPDATE ON data_stream_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_data_stream_updated_at();

-- Trigger for attribute_lists
DROP TRIGGER IF EXISTS trigger_attribute_lists_updated_at ON attribute_lists;
CREATE TRIGGER trigger_attribute_lists_updated_at
    BEFORE UPDATE ON attribute_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_data_stream_updated_at();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View to get data streams with their attributes
CREATE OR REPLACE VIEW data_streams_with_attributes AS
SELECT 
  ds.id,
  ds.name,
  ds.description,
  ds.source_type,
  ds.destination_type,
  ds.status,
  ds.data_format,
  ds.created_at,
  ds.updated_at,
  ds.total_records_processed,
  ds.last_processed_at,
  COALESCE(
    json_agg(
      json_build_object(
        'attribute_id', dsa.attribute_id,
        'attribute_name', dsa.attribute_name,
        'attribute_type', dsa.attribute_type,
        'is_required', dsa.is_required,
        'is_included', dsa.is_included,
        'position', dsa.position
      ) ORDER BY dsa.position
    ) FILTER (WHERE dsa.id IS NOT NULL),
    '[]'::json
  ) as attributes
FROM data_streams ds
LEFT JOIN data_stream_attributes dsa ON ds.id = dsa.data_stream_id
GROUP BY ds.id;

-- View to get attribute lists with their items
CREATE OR REPLACE VIEW attribute_lists_with_items AS
SELECT 
  al.id,
  al.name,
  al.description,
  al.category,
  al.is_active,
  al.created_at,
  COALESCE(
    json_agg(
      json_build_object(
        'attribute_id', ali.attribute_id,
        'attribute_name', ali.attribute_name,
        'attribute_type', ali.attribute_type,
        'position', ali.position,
        'default_config', ali.default_config
      ) ORDER BY ali.position
    ) FILTER (WHERE ali.id IS NOT NULL),
    '[]'::json
  ) as items
FROM attribute_lists al
LEFT JOIN attribute_list_items ali ON al.id = ali.list_id
GROUP BY al.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE data_streams IS 'Data streams for managing data flow between services with attribute support';
COMMENT ON TABLE data_stream_attributes IS 'Junction table for many-to-many relationship between data streams and attributes';
COMMENT ON TABLE attribute_lists IS 'Predefined attribute lists/bundles for reuse across data streams';
COMMENT ON TABLE attribute_list_items IS 'Individual attributes within an attribute list';
COMMENT ON TABLE data_stream_attribute_lists IS 'Junction table for data streams using attribute lists';
COMMENT ON TABLE data_stream_processing_log IS 'Log of data stream processing activities';

COMMENT ON VIEW data_streams_with_attributes IS 'View of data streams with their associated attributes';
COMMENT ON VIEW attribute_lists_with_items IS 'View of attribute lists with their items';
