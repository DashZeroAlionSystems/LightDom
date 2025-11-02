-- Chrome Layers Panel Training Data Schema
-- Stores layer analysis data for training and visualization

-- Main training data table
CREATE TABLE IF NOT EXISTS layer_training_data (
  id SERIAL PRIMARY KEY,
  url VARCHAR(2048) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Structure metrics
  layer_count INTEGER NOT NULL,
  compositing_layer_count INTEGER NOT NULL,
  max_depth INTEGER NOT NULL,
  component_count INTEGER NOT NULL,
  
  -- Analysis data (JSON)
  patterns JSONB,
  components JSONB,
  relationships JSONB,
  design_rules JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_layer_training_url ON layer_training_data(url);
CREATE INDEX IF NOT EXISTS idx_layer_training_timestamp ON layer_training_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_layer_training_patterns ON layer_training_data USING gin(patterns);
CREATE INDEX IF NOT EXISTS idx_layer_training_components ON layer_training_data USING gin(components);

-- Layer analysis results cache
CREATE TABLE IF NOT EXISTS layer_analysis_cache (
  id SERIAL PRIMARY KEY,
  url VARCHAR(2048) NOT NULL,
  analysis_data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_url UNIQUE(url)
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_layer_cache_url ON layer_analysis_cache(url);
CREATE INDEX IF NOT EXISTS idx_layer_cache_expires ON layer_analysis_cache(expires_at);

-- 3D component map storage
CREATE TABLE IF NOT EXISTS component_3d_maps (
  id SERIAL PRIMARY KEY,
  url VARCHAR(2048) NOT NULL,
  component_id VARCHAR(255) NOT NULL,
  
  -- Position
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  position_z FLOAT NOT NULL,
  
  -- Dimensions
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  depth FLOAT NOT NULL,
  
  -- Metadata
  component_type VARCHAR(100),
  tag_name VARCHAR(50),
  role VARCHAR(100),
  z_index INTEGER,
  is_composited BOOLEAN DEFAULT false,
  
  -- Full component data
  component_data JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for 3D maps
CREATE INDEX IF NOT EXISTS idx_component_3d_url ON component_3d_maps(url);
CREATE INDEX IF NOT EXISTS idx_component_3d_type ON component_3d_maps(component_type);
CREATE INDEX IF NOT EXISTS idx_component_3d_position ON component_3d_maps(position_z, position_y, position_x);

-- Component schema links
CREATE TABLE IF NOT EXISTS component_schema_links (
  id SERIAL PRIMARY KEY,
  component_id VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  
  -- Schema information
  table_schema VARCHAR(100),
  table_name VARCHAR(100),
  column_name VARCHAR(100),
  data_type VARCHAR(100),
  
  -- Relationship metadata
  link_type VARCHAR(50) DEFAULT 'inferred', -- 'inferred', 'explicit', 'manual'
  confidence FLOAT DEFAULT 0.5,
  
  -- Link data
  link_data JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for schema links
CREATE INDEX IF NOT EXISTS idx_schema_links_component ON component_schema_links(component_id);
CREATE INDEX IF NOT EXISTS idx_schema_links_table ON component_schema_links(table_name);
CREATE INDEX IF NOT EXISTS idx_schema_links_confidence ON component_schema_links(confidence DESC);

-- Design rule violations
CREATE TABLE IF NOT EXISTS design_rule_violations (
  id SERIAL PRIMARY KEY,
  url VARCHAR(2048) NOT NULL,
  layer_id VARCHAR(255),
  
  violation_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
  
  message TEXT,
  details JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for violations
CREATE INDEX IF NOT EXISTS idx_violations_url ON design_rule_violations(url);
CREATE INDEX IF NOT EXISTS idx_violations_type ON design_rule_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON design_rule_violations(severity);

-- Layer patterns for ML training
CREATE TABLE IF NOT EXISTS layer_patterns (
  id SERIAL PRIMARY KEY,
  pattern_name VARCHAR(100) NOT NULL,
  pattern_type VARCHAR(50) NOT NULL, -- 'z-index', 'compositing', 'layout', 'component'
  
  -- Pattern characteristics
  frequency INTEGER DEFAULT 1,
  confidence FLOAT DEFAULT 0.5,
  
  -- Pattern data
  pattern_data JSONB NOT NULL,
  
  -- Examples
  example_urls TEXT[],
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for patterns
CREATE INDEX IF NOT EXISTS idx_patterns_type ON layer_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON layer_patterns(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_data ON layer_patterns USING gin(pattern_data);

-- Views for easy querying

-- Latest layer analysis per URL
CREATE OR REPLACE VIEW latest_layer_analysis AS
SELECT DISTINCT ON (url)
  id,
  url,
  layer_count,
  compositing_layer_count,
  max_depth,
  component_count,
  patterns,
  timestamp
FROM layer_training_data
ORDER BY url, timestamp DESC;

-- Top violating URLs
CREATE OR REPLACE VIEW top_violating_urls AS
SELECT 
  url,
  COUNT(*) as violation_count,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_count,
  COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_count,
  MAX(created_at) as last_violation
FROM design_rule_violations
GROUP BY url
ORDER BY violation_count DESC;

-- Component distribution
CREATE OR REPLACE VIEW component_distribution AS
SELECT 
  component_type,
  COUNT(*) as count,
  AVG(width) as avg_width,
  AVG(height) as avg_height,
  AVG(position_z) as avg_depth,
  COUNT(CASE WHEN is_composited THEN 1 END) as composited_count
FROM component_3d_maps
GROUP BY component_type
ORDER BY count DESC;

-- Schema link statistics
CREATE OR REPLACE VIEW schema_link_stats AS
SELECT 
  table_name,
  COUNT(DISTINCT component_id) as linked_components,
  AVG(confidence) as avg_confidence,
  COUNT(*) as total_links
FROM component_schema_links
GROUP BY table_name
ORDER BY linked_components DESC;

-- Functions

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM layer_analysis_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update pattern frequency
CREATE OR REPLACE FUNCTION update_pattern_frequency(
  p_pattern_name VARCHAR,
  p_pattern_type VARCHAR,
  p_pattern_data JSONB,
  p_example_url TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO layer_patterns (
    pattern_name,
    pattern_type,
    pattern_data,
    frequency,
    example_urls
  )
  VALUES (
    p_pattern_name,
    p_pattern_type,
    p_pattern_data,
    1,
    ARRAY[p_example_url]
  )
  ON CONFLICT ON CONSTRAINT layer_patterns_pkey
  DO UPDATE SET
    frequency = layer_patterns.frequency + 1,
    example_urls = array_append(layer_patterns.example_urls, p_example_url),
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_layer_training_data_updated_at
  BEFORE UPDATE ON layer_training_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layer_patterns_updated_at
  BEFORE UPDATE ON layer_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE layer_training_data IS 'Stores layer analysis data for machine learning training';
COMMENT ON TABLE layer_analysis_cache IS 'Caches layer analysis results to improve performance';
COMMENT ON TABLE component_3d_maps IS 'Stores 3D position and metadata for UI components';
COMMENT ON TABLE component_schema_links IS 'Links UI components to database schema elements';
COMMENT ON TABLE design_rule_violations IS 'Tracks violations of design rules during analysis';
COMMENT ON TABLE layer_patterns IS 'Stores common patterns found during layer analysis';
