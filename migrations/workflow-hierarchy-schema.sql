-- ====================================================================
-- Workflow Hierarchy and Real-Time Data Stream Schema
-- ====================================================================
-- Purpose: Define complete workflow hierarchy with services, dashboards,
--          and real-time two-way data streams
-- Created: 2025-11-06
-- ====================================================================

-- ====================================================================
-- PART 1: Core Workflow Hierarchy
-- ====================================================================

-- Enhanced workflows table with hierarchy support
CREATE TABLE IF NOT EXISTS workflow_hierarchy (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_workflow_id VARCHAR(255) REFERENCES workflow_hierarchy(workflow_id),
    hierarchy_level INTEGER DEFAULT 0,
    hierarchy_path TEXT, -- Materialized path: /root/parent/child
    workflow_type VARCHAR(100) NOT NULL, -- 'root', 'composite', 'atomic'
    category VARCHAR(100), -- 'seo', 'data-mining', 'ai-content', etc.
    
    -- Configuration
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Status and lifecycle
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'archived'
    version VARCHAR(20) DEFAULT '1.0.0',
    is_template BOOLEAN DEFAULT FALSE,
    template_id VARCHAR(255),
    
    -- Auto-generated schema
    auto_schema JSONB, -- Automatically generated schema definition
    schema_version VARCHAR(20),
    schema_last_generated_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    CONSTRAINT valid_hierarchy_level CHECK (hierarchy_level >= 0)
);

CREATE INDEX IF NOT EXISTS idx_workflow_hierarchy_parent ON workflow_hierarchy(parent_workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_hierarchy_path ON workflow_hierarchy(hierarchy_path);
CREATE INDEX IF NOT EXISTS idx_workflow_hierarchy_type ON workflow_hierarchy(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflow_hierarchy_category ON workflow_hierarchy(category);
CREATE INDEX IF NOT EXISTS idx_workflow_hierarchy_status ON workflow_hierarchy(status);
CREATE INDEX IF NOT EXISTS idx_workflow_hierarchy_tags ON workflow_hierarchy USING GIN(tags);

-- ====================================================================
-- PART 2: Workflow Services Bundle
-- ====================================================================

-- Services that bundle API functionality
CREATE TABLE IF NOT EXISTS workflow_services (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) NOT NULL REFERENCES workflow_hierarchy(workflow_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(100) NOT NULL, -- 'api', 'data-processor', 'ai-engine', 'database', 'notification'
    
    -- API Configuration
    api_config JSONB DEFAULT '{}', -- endpoints, methods, auth
    bundled_endpoints JSONB DEFAULT '[]', -- List of API endpoints this service bundles
    
    -- Data attributes and streams
    input_attributes JSONB DEFAULT '[]', -- Input data structure
    output_attributes JSONB DEFAULT '[]', -- Output data structure
    attribute_mappings JSONB DEFAULT '{}', -- How attributes are transformed
    
    -- Real-time configuration
    supports_realtime BOOLEAN DEFAULT FALSE,
    realtime_config JSONB DEFAULT '{}', -- WebSocket, SSE, polling config
    stream_direction VARCHAR(50) DEFAULT 'bidirectional', -- 'inbound', 'outbound', 'bidirectional'
    
    -- Auto-generated schema
    auto_schema JSONB,
    schema_version VARCHAR(20),
    
    -- Ordering and status
    service_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_services_workflow ON workflow_services(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_services_type ON workflow_services(service_type);
CREATE INDEX IF NOT EXISTS idx_workflow_services_realtime ON workflow_services(supports_realtime);

-- ====================================================================
-- PART 3: Data Streams for Real-Time Communication
-- ====================================================================

-- Real-time data streams connecting services
CREATE TABLE IF NOT EXISTS data_streams (
    id SERIAL PRIMARY KEY,
    stream_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Source and destination
    source_service_id VARCHAR(255) REFERENCES workflow_services(service_id) ON DELETE CASCADE,
    destination_service_id VARCHAR(255) REFERENCES workflow_services(service_id) ON DELETE CASCADE,
    
    -- Stream configuration
    stream_type VARCHAR(100) NOT NULL, -- 'websocket', 'sse', 'polling', 'webhook'
    direction VARCHAR(50) NOT NULL, -- 'source-to-destination', 'destination-to-source', 'bidirectional'
    
    -- Data format and attributes
    data_format VARCHAR(50) DEFAULT 'json', -- 'json', 'xml', 'binary', 'text'
    data_schema JSONB, -- JSON Schema for data validation
    attribute_bindings JSONB DEFAULT '[]', -- Which attributes flow through this stream
    
    -- Real-time config
    realtime_protocol VARCHAR(50), -- 'ws', 'wss', 'sse', 'http-polling'
    polling_interval_ms INTEGER,
    buffer_size INTEGER DEFAULT 100,
    retry_policy JSONB DEFAULT '{}',
    
    -- Monitoring
    is_active BOOLEAN DEFAULT TRUE,
    last_data_received_at TIMESTAMP,
    total_messages_sent BIGINT DEFAULT 0,
    total_messages_received BIGINT DEFAULT 0,
    
    -- Auto-generated schema
    auto_schema JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_streams_source ON data_streams(source_service_id);
CREATE INDEX IF NOT EXISTS idx_data_streams_destination ON data_streams(destination_service_id);
CREATE INDEX IF NOT EXISTS idx_data_streams_type ON data_streams(stream_type);
CREATE INDEX IF NOT EXISTS idx_data_streams_active ON data_streams(is_active);

-- ====================================================================
-- PART 4: Workflow Dashboards
-- ====================================================================

-- Dashboards that display workflow data
CREATE TABLE IF NOT EXISTS workflow_dashboards (
    id SERIAL PRIMARY KEY,
    dashboard_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) NOT NULL REFERENCES workflow_hierarchy(workflow_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dashboard_type VARCHAR(100) NOT NULL, -- 'monitoring', 'analytics', 'control', 'reporting'
    
    -- Layout and configuration
    layout_config JSONB DEFAULT '{}', -- Grid layout, responsive breakpoints
    widget_config JSONB DEFAULT '[]', -- Dashboard widgets and their configs
    
    -- Data sources (links to services)
    connected_services JSONB DEFAULT '[]', -- Array of service_ids this dashboard uses
    data_refresh_interval_ms INTEGER DEFAULT 5000,
    
    -- Real-time updates
    supports_realtime BOOLEAN DEFAULT TRUE,
    realtime_update_config JSONB DEFAULT '{}',
    
    -- Auto-generated schema
    auto_schema JSONB,
    
    -- Permissions and access
    is_public BOOLEAN DEFAULT FALSE,
    allowed_roles TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_dashboards_workflow ON workflow_dashboards(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_dashboards_type ON workflow_dashboards(dashboard_type);

-- ====================================================================
-- PART 5: Attribute Definitions and Mappings
-- ====================================================================

-- Define reusable attributes across the system
CREATE TABLE IF NOT EXISTS workflow_attributes (
    id SERIAL PRIMARY KEY,
    attribute_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    attribute_type VARCHAR(100) NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array', 'date'
    
    -- Schema definition
    json_schema JSONB, -- JSON Schema for validation
    default_value JSONB,
    validation_rules JSONB DEFAULT '[]',
    
    -- Metadata
    category VARCHAR(100), -- 'user-data', 'system-data', 'computed', 'external'
    is_required BOOLEAN DEFAULT FALSE,
    is_system_attribute BOOLEAN DEFAULT FALSE,
    
    -- Auto-schema tracking
    auto_generated BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0, -- Track how many times this attribute is used
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_attributes_type ON workflow_attributes(attribute_type);
CREATE INDEX IF NOT EXISTS idx_workflow_attributes_category ON workflow_attributes(category);

-- ====================================================================
-- PART 6: Service-to-Service Relationships
-- ====================================================================

-- Track dependencies and relationships between services
CREATE TABLE IF NOT EXISTS service_relationships (
    id SERIAL PRIMARY KEY,
    relationship_id VARCHAR(255) UNIQUE NOT NULL,
    source_service_id VARCHAR(255) NOT NULL REFERENCES workflow_services(service_id) ON DELETE CASCADE,
    target_service_id VARCHAR(255) NOT NULL REFERENCES workflow_services(service_id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- 'depends-on', 'triggers', 'provides-data-to', 'consumes-data-from'
    
    -- Relationship metadata
    metadata JSONB DEFAULT '{}',
    is_critical BOOLEAN DEFAULT FALSE, -- Is this relationship critical for workflow execution?
    
    -- Auto-detected relationships
    auto_detected BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 for auto-detected relationships
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_reference CHECK (source_service_id != target_service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_relationships_source ON service_relationships(source_service_id);
CREATE INDEX IF NOT EXISTS idx_service_relationships_target ON service_relationships(target_service_id);
CREATE INDEX IF NOT EXISTS idx_service_relationships_type ON service_relationships(relationship_type);

-- ====================================================================
-- PART 7: Auto-Schema Generation Tracking
-- ====================================================================

-- Track automatic schema generation for all entities
CREATE TABLE IF NOT EXISTS auto_schema_generations (
    id SERIAL PRIMARY KEY,
    generation_id VARCHAR(255) UNIQUE NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'workflow', 'service', 'stream', 'dashboard', 'attribute'
    entity_id VARCHAR(255) NOT NULL,
    
    -- Generation details
    schema_content JSONB NOT NULL,
    schema_version VARCHAR(20),
    generation_method VARCHAR(100), -- 'manual', 'ai-inferred', 'usage-pattern', 'deepseek-generated'
    
    -- Source data used for generation
    source_data JSONB,
    confidence_score DECIMAL(3,2),
    
    -- Validation
    is_validated BOOLEAN DEFAULT FALSE,
    validation_errors JSONB,
    
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(255) -- 'system', 'deepseek', 'user:username'
);

CREATE INDEX IF NOT EXISTS idx_auto_schema_entity ON auto_schema_generations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_auto_schema_validated ON auto_schema_generations(is_validated);

-- ====================================================================
-- PART 8: DeepSeek Workflow Generation Logs
-- ====================================================================

-- Track DeepSeek's workflow generation activities
CREATE TABLE IF NOT EXISTS deepseek_workflow_generations (
    id SERIAL PRIMARY KEY,
    generation_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) REFERENCES workflow_hierarchy(workflow_id),
    
    -- Generation request
    user_prompt TEXT NOT NULL,
    context_data JSONB, -- Additional context provided
    
    -- DeepSeek response
    generated_workflow JSONB,
    generated_services JSONB DEFAULT '[]',
    generated_streams JSONB DEFAULT '[]',
    generated_dashboard JSONB,
    
    -- Quality metrics
    generation_quality_score DECIMAL(3,2),
    token_usage INTEGER,
    generation_time_ms INTEGER,
    
    -- Validation
    was_accepted BOOLEAN,
    user_modifications JSONB, -- Track what user changed
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_deepseek_generations_workflow ON deepseek_workflow_generations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_deepseek_generations_date ON deepseek_workflow_generations(created_at);

-- ====================================================================
-- PART 9: Update Triggers
-- ====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_workflow_hierarchy_updated_at BEFORE UPDATE ON workflow_hierarchy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_services_updated_at BEFORE UPDATE ON workflow_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_streams_updated_at BEFORE UPDATE ON data_streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_dashboards_updated_at BEFORE UPDATE ON workflow_dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_attributes_updated_at BEFORE UPDATE ON workflow_attributes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- PART 10: Helper Views
-- ====================================================================

-- View for complete workflow hierarchy with all related entities
CREATE OR REPLACE VIEW workflow_complete_hierarchy AS
SELECT 
    wh.*,
    COUNT(DISTINCT ws.service_id) as service_count,
    COUNT(DISTINCT wd.dashboard_id) as dashboard_count,
    COUNT(DISTINCT ds.stream_id) as stream_count,
    json_agg(DISTINCT jsonb_build_object(
        'service_id', ws.service_id,
        'name', ws.name,
        'type', ws.service_type,
        'supports_realtime', ws.supports_realtime
    )) FILTER (WHERE ws.service_id IS NOT NULL) as services,
    json_agg(DISTINCT jsonb_build_object(
        'dashboard_id', wd.dashboard_id,
        'name', wd.name,
        'type', wd.dashboard_type
    )) FILTER (WHERE wd.dashboard_id IS NOT NULL) as dashboards
FROM workflow_hierarchy wh
LEFT JOIN workflow_services ws ON wh.workflow_id = ws.workflow_id
LEFT JOIN workflow_dashboards wd ON wh.workflow_id = wd.workflow_id
LEFT JOIN data_streams ds ON ws.service_id IN (ds.source_service_id, ds.destination_service_id)
GROUP BY wh.id;

-- View for real-time data flow analysis
CREATE OR REPLACE VIEW realtime_data_flow AS
SELECT 
    ds.stream_id,
    ds.name as stream_name,
    ds.stream_type,
    ds.direction,
    source_svc.name as source_service,
    source_svc.workflow_id as source_workflow,
    dest_svc.name as destination_service,
    dest_svc.workflow_id as destination_workflow,
    ds.is_active,
    ds.total_messages_sent,
    ds.total_messages_received,
    ds.last_data_received_at
FROM data_streams ds
LEFT JOIN workflow_services source_svc ON ds.source_service_id = source_svc.service_id
LEFT JOIN workflow_services dest_svc ON ds.destination_service_id = dest_svc.service_id;

-- ====================================================================
-- PART 11: Comments for Documentation
-- ====================================================================

COMMENT ON TABLE workflow_hierarchy IS 'Complete workflow hierarchy with parent-child relationships and auto-schema support';
COMMENT ON TABLE workflow_services IS 'Services that bundle API functionality and handle data attributes';
COMMENT ON TABLE data_streams IS 'Real-time bidirectional data streams connecting services';
COMMENT ON TABLE workflow_dashboards IS 'Dashboards displaying workflow data with real-time updates';
COMMENT ON TABLE workflow_attributes IS 'Reusable attribute definitions with validation schemas';
COMMENT ON TABLE service_relationships IS 'Dependencies and relationships between services';
COMMENT ON TABLE auto_schema_generations IS 'Tracking of automatic schema generation for all entities';
COMMENT ON TABLE deepseek_workflow_generations IS 'Log of DeepSeek AI workflow generation activities';

COMMENT ON COLUMN workflow_hierarchy.auto_schema IS 'Automatically generated JSON schema for this workflow';
COMMENT ON COLUMN workflow_hierarchy.hierarchy_path IS 'Materialized path for efficient hierarchy queries (e.g., /1/5/12)';
COMMENT ON COLUMN workflow_services.attribute_mappings IS 'Defines how input attributes are transformed to output attributes';
COMMENT ON COLUMN data_streams.attribute_bindings IS 'Specifies which attributes flow through this stream';
COMMENT ON COLUMN service_relationships.auto_detected IS 'Whether this relationship was automatically detected';
