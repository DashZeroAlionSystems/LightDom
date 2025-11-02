-- Enhanced Training Data Schema
-- Stores comprehensive training bundles with linked schemas and attribute metadata

-- Training bundles table
CREATE TABLE IF NOT EXISTS ml_training_bundles (
  id SERIAL PRIMARY KEY,
  functionality VARCHAR(100) NOT NULL,
  
  -- Configuration
  configuration JSONB NOT NULL,
  
  -- Metrics
  total_urls INTEGER NOT NULL,
  successful_urls INTEGER NOT NULL,
  total_data_points INTEGER NOT NULL,
  avg_quality_score FLOAT NOT NULL,
  
  -- Aggregated data
  attribute_coverage JSONB,
  aggregated_attributes JSONB,
  linked_schemas JSONB,
  recommendations JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ml_bundles_functionality ON ml_training_bundles(functionality);
CREATE INDEX IF NOT EXISTS idx_ml_bundles_quality ON ml_training_bundles(avg_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_ml_bundles_created ON ml_training_bundles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_bundles_config ON ml_training_bundles USING gin(configuration);

-- Mined training data table
CREATE TABLE IF NOT EXISTS mined_training_data (
  id SERIAL PRIMARY KEY,
  url VARCHAR(2048) NOT NULL,
  model_type VARCHAR(100) NOT NULL,
  
  -- Collected data
  attributes JSONB,
  raw_data JSONB,
  
  -- Quality metrics
  quality_score FLOAT,
  completeness_score FLOAT,
  
  -- Metadata
  collection_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  worker_id VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mined_data_url ON mined_training_data(url);
CREATE INDEX IF NOT EXISTS idx_mined_data_model ON mined_training_data(model_type);
CREATE INDEX IF NOT EXISTS idx_mined_data_quality ON mined_training_data(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_mined_data_attributes ON mined_training_data USING gin(attributes);

-- Attribute catalog table
CREATE TABLE IF NOT EXISTS training_attribute_catalog (
  id SERIAL PRIMARY KEY,
  attribute_name VARCHAR(100) UNIQUE NOT NULL,
  attribute_type VARCHAR(50) NOT NULL, -- 'string', 'integer', 'float', 'array', 'object', 'boolean'
  
  -- Description
  description TEXT,
  example_value TEXT,
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  avg_value_size INTEGER,
  
  -- Associated functionalities
  functionalities TEXT[],
  model_types TEXT[],
  
  -- Metadata
  is_required BOOLEAN DEFAULT false,
  importance_score FLOAT DEFAULT 0.5,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attr_catalog_name ON training_attribute_catalog(attribute_name);
CREATE INDEX IF NOT EXISTS idx_attr_catalog_usage ON training_attribute_catalog(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_attr_catalog_functionalities ON training_attribute_catalog USING gin(functionalities);

-- Schema link patterns table
CREATE TABLE IF NOT EXISTS schema_link_patterns (
  id SERIAL PRIMARY KEY,
  
  -- Pattern info
  data_attribute VARCHAR(200) NOT NULL,
  schema_table VARCHAR(100) NOT NULL,
  schema_column VARCHAR(100),
  
  -- Pattern metadata
  pattern_type VARCHAR(50), -- 'exact_match', 'partial_match', 'inferred', 'explicit'
  confidence FLOAT NOT NULL,
  
  -- Statistics
  occurrence_count INTEGER DEFAULT 1,
  success_rate FLOAT,
  
  -- Examples
  example_urls TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(data_attribute, schema_table, schema_column)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schema_patterns_attr ON schema_link_patterns(data_attribute);
CREATE INDEX IF NOT EXISTS idx_schema_patterns_table ON schema_link_patterns(schema_table);
CREATE INDEX IF NOT EXISTS idx_schema_patterns_confidence ON schema_link_patterns(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_schema_patterns_occurrences ON schema_link_patterns(occurrence_count DESC);

-- Model training jobs table
CREATE TABLE IF NOT EXISTS model_training_jobs (
  id SERIAL PRIMARY KEY,
  
  -- Job info
  job_name VARCHAR(200) NOT NULL,
  functionality VARCHAR(100) NOT NULL,
  bundle_id INTEGER REFERENCES ml_training_bundles(id),
  
  -- Status
  status VARCHAR(50) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  
  -- Configuration
  model_config JSONB,
  training_params JSONB,
  
  -- Progress
  progress_percentage FLOAT DEFAULT 0,
  current_epoch INTEGER,
  total_epochs INTEGER,
  
  -- Results
  training_metrics JSONB,
  validation_metrics JSONB,
  model_artifacts JSONB,
  
  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Metadata
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON model_training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_functionality ON model_training_jobs(functionality);
CREATE INDEX IF NOT EXISTS idx_training_jobs_bundle ON model_training_jobs(bundle_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_created ON model_training_jobs(created_at DESC);

-- Views

-- Latest bundles per functionality
CREATE OR REPLACE VIEW latest_training_bundles AS
SELECT DISTINCT ON (functionality)
  id,
  functionality,
  total_urls,
  successful_urls,
  avg_quality_score,
  created_at
FROM ml_training_bundles
ORDER BY functionality, created_at DESC;

-- Attribute usage statistics
CREATE OR REPLACE VIEW attribute_usage_stats AS
SELECT 
  attribute_name,
  attribute_type,
  usage_count,
  importance_score,
  array_length(functionalities, 1) as functionality_count,
  array_length(model_types, 1) as model_type_count
FROM training_attribute_catalog
ORDER BY usage_count DESC;

-- Schema link confidence distribution
CREATE OR REPLACE VIEW schema_link_confidence_dist AS
SELECT 
  schema_table,
  COUNT(*) as total_links,
  AVG(confidence) as avg_confidence,
  SUM(occurrence_count) as total_occurrences,
  COUNT(CASE WHEN confidence >= 0.8 THEN 1 END) as high_confidence,
  COUNT(CASE WHEN confidence >= 0.5 AND confidence < 0.8 THEN 1 END) as medium_confidence,
  COUNT(CASE WHEN confidence < 0.5 THEN 1 END) as low_confidence
FROM schema_link_patterns
GROUP BY schema_table
ORDER BY total_occurrences DESC;

-- Training job success rate
CREATE OR REPLACE VIEW training_job_stats AS
SELECT 
  functionality,
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN status = 'running' THEN 1 END) as running,
  AVG(CASE WHEN duration_seconds IS NOT NULL THEN duration_seconds END) as avg_duration_seconds
FROM model_training_jobs
GROUP BY functionality
ORDER BY total_jobs DESC;

-- Functions

-- Function to update attribute catalog
CREATE OR REPLACE FUNCTION update_attribute_catalog(
  p_attribute_name VARCHAR,
  p_attribute_type VARCHAR,
  p_functionality VARCHAR,
  p_model_type VARCHAR
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO training_attribute_catalog (
    attribute_name,
    attribute_type,
    usage_count,
    functionalities,
    model_types
  )
  VALUES (
    p_attribute_name,
    p_attribute_type,
    1,
    ARRAY[p_functionality],
    ARRAY[p_model_type]
  )
  ON CONFLICT (attribute_name)
  DO UPDATE SET
    usage_count = training_attribute_catalog.usage_count + 1,
    functionalities = array_append(
      COALESCE(training_attribute_catalog.functionalities, ARRAY[]::TEXT[]),
      p_functionality
    ),
    model_types = array_append(
      COALESCE(training_attribute_catalog.model_types, ARRAY[]::TEXT[]),
      p_model_type
    ),
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to update schema link patterns
CREATE OR REPLACE FUNCTION update_schema_link_pattern(
  p_data_attribute VARCHAR,
  p_schema_table VARCHAR,
  p_schema_column VARCHAR,
  p_confidence FLOAT,
  p_example_url TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO schema_link_patterns (
    data_attribute,
    schema_table,
    schema_column,
    confidence,
    occurrence_count,
    example_urls
  )
  VALUES (
    p_data_attribute,
    p_schema_table,
    p_schema_column,
    p_confidence,
    1,
    ARRAY[p_example_url]
  )
  ON CONFLICT (data_attribute, schema_table, schema_column)
  DO UPDATE SET
    occurrence_count = schema_link_patterns.occurrence_count + 1,
    confidence = (schema_link_patterns.confidence + p_confidence) / 2.0, -- Running average
    example_urls = array_append(schema_link_patterns.example_urls, p_example_url),
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Triggers

CREATE OR REPLACE FUNCTION update_training_bundle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bundle_timestamp
  BEFORE UPDATE ON ml_training_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_training_bundle_timestamp();

CREATE TRIGGER trigger_update_attribute_catalog_timestamp
  BEFORE UPDATE ON training_attribute_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_training_bundle_timestamp();

CREATE TRIGGER trigger_update_schema_patterns_timestamp
  BEFORE UPDATE ON schema_link_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_training_bundle_timestamp();

CREATE TRIGGER trigger_update_training_jobs_timestamp
  BEFORE UPDATE ON model_training_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_training_bundle_timestamp();

-- Comments
COMMENT ON TABLE ml_training_bundles IS 'Comprehensive training data bundles for ML models';
COMMENT ON TABLE mined_training_data IS 'Individual data points collected from web pages';
COMMENT ON TABLE training_attribute_catalog IS 'Catalog of all attributes with usage statistics';
COMMENT ON TABLE schema_link_patterns IS 'Patterns for linking UI components to database schemas';
COMMENT ON TABLE model_training_jobs IS 'Training job tracking and results';
