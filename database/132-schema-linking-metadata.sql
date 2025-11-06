-- Schema Linking Metadata Tables
-- Stores schema analysis results and relationship mappings

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Schema Analysis Results Table
-- Stores results of schema analysis runs
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_analysis_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_timestamp TIMESTAMP DEFAULT NOW(),
  total_tables INTEGER NOT NULL,
  total_relationships INTEGER NOT NULL,
  total_features INTEGER NOT NULL,
  analysis_duration_ms INTEGER,
  export_path TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schema_analysis_runs_timestamp ON schema_analysis_runs(run_timestamp);
CREATE INDEX idx_schema_analysis_runs_status ON schema_analysis_runs(status);

-- =====================================================
-- Discovered Table Metadata Table
-- Stores metadata about discovered tables
-- =====================================================
CREATE TABLE IF NOT EXISTS discovered_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES schema_analysis_runs(id) ON DELETE CASCADE,
  schema_name VARCHAR(255) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(512) NOT NULL,
  column_count INTEGER NOT NULL,
  primary_keys JSONB DEFAULT '[]',
  indexes JSONB DEFAULT '[]',
  columns JSONB NOT NULL,
  discovered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(analysis_run_id, schema_name, table_name)
);

CREATE INDEX idx_discovered_tables_run ON discovered_tables(analysis_run_id);
CREATE INDEX idx_discovered_tables_schema ON discovered_tables(schema_name);
CREATE INDEX idx_discovered_tables_name ON discovered_tables(table_name);
CREATE INDEX idx_discovered_tables_full_name ON discovered_tables(full_name);

-- =====================================================
-- Schema Relationships Table
-- Stores discovered relationships between tables
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES schema_analysis_runs(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('foreign_key', 'semantic', 'naming_pattern')),
  source_schema VARCHAR(255) NOT NULL,
  source_table VARCHAR(255) NOT NULL,
  source_column VARCHAR(255),
  target_schema VARCHAR(255),
  target_table VARCHAR(255),
  target_column VARCHAR(255),
  common_fields JSONB DEFAULT '[]',
  pattern VARCHAR(100),
  strength DECIMAL(3, 2) DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  bidirectional BOOLEAN DEFAULT false,
  constraints JSONB DEFAULT '{}',
  discovered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schema_relationships_run ON schema_relationships(analysis_run_id);
CREATE INDEX idx_schema_relationships_type ON schema_relationships(relationship_type);
CREATE INDEX idx_schema_relationships_source ON schema_relationships(source_schema, source_table);
CREATE INDEX idx_schema_relationships_target ON schema_relationships(target_schema, target_table);

-- =====================================================
-- Feature Groupings Table
-- Stores identified feature groupings
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_groupings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES schema_analysis_runs(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  table_count INTEGER NOT NULL,
  settings_count INTEGER DEFAULT 0,
  options_count INTEGER DEFAULT 0,
  tables JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '[]',
  options JSONB DEFAULT '[]',
  relationships JSONB DEFAULT '[]',
  discovered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(analysis_run_id, feature_name)
);

CREATE INDEX idx_feature_groupings_run ON feature_groupings(analysis_run_id);
CREATE INDEX idx_feature_groupings_name ON feature_groupings(feature_name);
CREATE INDEX idx_feature_groupings_table_count ON feature_groupings(table_count);

-- =====================================================
-- Generated Dashboards Table
-- Stores auto-generated dashboard configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id UUID REFERENCES feature_groupings(id) ON DELETE CASCADE,
  dashboard_id VARCHAR(255) UNIQUE NOT NULL,
  dashboard_name VARCHAR(255) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  component_count INTEGER NOT NULL,
  components JSONB NOT NULL DEFAULT '[]',
  layout JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_dashboards_feature ON generated_dashboards(feature_id);
CREATE INDEX idx_generated_dashboards_id ON generated_dashboards(dashboard_id);
CREATE INDEX idx_generated_dashboards_table ON generated_dashboards(table_name);
CREATE INDEX idx_generated_dashboards_active ON generated_dashboards(is_active);

-- =====================================================
-- Generated Workflows Table
-- Stores auto-generated workflow configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id UUID REFERENCES feature_groupings(id) ON DELETE CASCADE,
  workflow_id VARCHAR(255) UNIQUE NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  step_count INTEGER NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  triggers JSONB DEFAULT '[]',
  automation JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_workflows_feature ON generated_workflows(feature_id);
CREATE INDEX idx_generated_workflows_id ON generated_workflows(workflow_id);
CREATE INDEX idx_generated_workflows_active ON generated_workflows(is_active);

-- =====================================================
-- Schema Link Settings Table
-- Configuration for schema linking service
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_link_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO schema_link_settings (setting_key, setting_value, description)
VALUES 
  ('run_interval', '3600000', 'Interval between automated runs in milliseconds (default: 1 hour)'),
  ('auto_start', 'true', 'Whether to start the runner automatically'),
  ('export_enabled', 'true', 'Whether to export schemas to files'),
  ('output_directory', '{"path": "data/linked-schemas"}', 'Directory for schema exports')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- Views for Easy Querying
-- =====================================================

-- View: Latest schema analysis
CREATE OR REPLACE VIEW latest_schema_analysis AS
SELECT * FROM schema_analysis_runs
ORDER BY run_timestamp DESC
LIMIT 1;

-- View: Active dashboards with feature info
CREATE OR REPLACE VIEW active_dashboards AS
SELECT 
  gd.*,
  fg.feature_name,
  fg.table_count as feature_table_count
FROM generated_dashboards gd
JOIN feature_groupings fg ON gd.feature_id = fg.id
WHERE gd.is_active = true
ORDER BY gd.dashboard_name;

-- View: Active workflows with feature info  
CREATE OR REPLACE VIEW active_workflows AS
SELECT 
  gw.*,
  fg.feature_name,
  fg.table_count as feature_table_count
FROM generated_workflows gw
JOIN feature_groupings fg ON gw.feature_id = fg.id
WHERE gw.is_active = true
ORDER BY gw.workflow_name;

-- View: Relationship summary by type
CREATE OR REPLACE VIEW relationship_summary AS
SELECT 
  sr.analysis_run_id,
  sr.relationship_type,
  COUNT(*) as count,
  AVG(sr.strength) as avg_strength
FROM schema_relationships sr
GROUP BY sr.analysis_run_id, sr.relationship_type;

-- View: Feature summary with counts
CREATE OR REPLACE VIEW feature_summary AS
SELECT 
  fg.analysis_run_id,
  COUNT(DISTINCT fg.id) as total_features,
  SUM(fg.table_count) as total_tables,
  SUM(fg.settings_count) as total_settings,
  SUM(fg.options_count) as total_options,
  COUNT(DISTINCT gd.id) as total_dashboards,
  COUNT(DISTINCT gw.id) as total_workflows
FROM feature_groupings fg
LEFT JOIN generated_dashboards gd ON fg.id = gd.feature_id
LEFT JOIN generated_workflows gw ON fg.id = gw.feature_id
GROUP BY fg.analysis_run_id;

-- =====================================================
-- Functions
-- =====================================================

-- Function to get latest analysis summary
CREATE OR REPLACE FUNCTION get_latest_analysis_summary()
RETURNS TABLE (
  run_id UUID,
  run_time TIMESTAMP,
  tables INTEGER,
  relationships INTEGER,
  features INTEGER,
  dashboards BIGINT,
  workflows BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sar.id,
    sar.run_timestamp,
    sar.total_tables,
    sar.total_relationships,
    sar.total_features,
    COUNT(DISTINCT gd.id) as dashboards,
    COUNT(DISTINCT gw.id) as workflows
  FROM schema_analysis_runs sar
  LEFT JOIN feature_groupings fg ON sar.id = fg.analysis_run_id
  LEFT JOIN generated_dashboards gd ON fg.id = gd.feature_id
  LEFT JOIN generated_workflows gw ON fg.id = gw.feature_id
  WHERE sar.id = (SELECT id FROM latest_schema_analysis)
  GROUP BY sar.id, sar.run_timestamp, sar.total_tables, sar.total_relationships, sar.total_features;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE schema_analysis_runs IS 'Stores results of schema linking analysis runs';
COMMENT ON TABLE discovered_tables IS 'Metadata about discovered database tables';
COMMENT ON TABLE schema_relationships IS 'Discovered relationships between tables';
COMMENT ON TABLE feature_groupings IS 'Logical groupings of related tables';
COMMENT ON TABLE generated_dashboards IS 'Auto-generated dashboard configurations';
COMMENT ON TABLE generated_workflows IS 'Auto-generated workflow configurations';
COMMENT ON TABLE schema_link_settings IS 'Configuration settings for schema linking service';
