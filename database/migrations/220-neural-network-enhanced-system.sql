-- Enhanced Neural Network System with Relationships and Data Streams
-- Implements comprehensive neural network management for LightDom
-- Created: 2025-11-23

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- NEURAL NETWORK DATA STREAMS
-- ============================================================================

-- Table: neural_network_data_streams
-- Purpose: Data streams specifically for neural network input/output
CREATE TABLE IF NOT EXISTS neural_network_data_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stream_type VARCHAR(100) NOT NULL, -- input, output, training, evaluation
  source_type VARCHAR(100),
  source_config JSONB DEFAULT '{}',
  destination_type VARCHAR(100),
  destination_config JSONB DEFAULT '{}',
  transformation_rules JSONB DEFAULT '[]',
  attribute_mappings JSONB DEFAULT '[]', -- Maps attributes to neural network inputs
  status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT nn_stream_type_check CHECK (stream_type IN ('input', 'output', 'training', 'evaluation', 'prediction'))
);

CREATE INDEX IF NOT EXISTS idx_nn_data_streams_nn_id ON neural_network_data_streams(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_nn_data_streams_type ON neural_network_data_streams(stream_type);
CREATE INDEX IF NOT EXISTS idx_nn_data_streams_status ON neural_network_data_streams(status);

-- ============================================================================
-- NEURAL NETWORK ATTRIBUTES
-- ============================================================================

-- Table: neural_network_attributes
-- Purpose: Configurable attributes for neural network feature engineering
CREATE TABLE IF NOT EXISTS neural_network_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(100) NOT NULL, -- seo, crawling, content, performance, etc.
  description TEXT,
  
  -- Algorithm configuration
  algorithm_config JSONB DEFAULT '{
    "enabled": true,
    "algorithm_type": "standard",
    "preprocessing": [],
    "feature_extraction": {}
  }',
  
  -- Data mining configuration
  mining_config JSONB DEFAULT '{
    "enabled": false,
    "mining_strategy": "periodic",
    "sources": [],
    "update_frequency": "daily"
  }',
  
  -- Drill down configuration
  drilldown_config JSONB DEFAULT '{
    "enabled": true,
    "related_attributes": [],
    "visualization_type": "tree",
    "depth_limit": 3
  }',
  
  -- Training configuration
  training_config JSONB DEFAULT '{
    "enabled": true,
    "importance_weight": 1.0,
    "normalization": "standard",
    "encoding": "auto"
  }',
  
  -- SEO specific configuration (for seo attributes)
  seo_config JSONB DEFAULT '{
    "rank_weight": 1.0,
    "trust_score": 0.5,
    "optimization_priority": "medium"
  }',
  
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(neural_network_id, attribute_name)
);

CREATE INDEX IF NOT EXISTS idx_nn_attributes_nn_id ON neural_network_attributes(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_nn_attributes_type ON neural_network_attributes(attribute_type);
CREATE INDEX IF NOT EXISTS idx_nn_attributes_active ON neural_network_attributes(is_active);

-- ============================================================================
-- NEURAL NETWORK CRAWLER INTEGRATION
-- ============================================================================

-- Table: neural_network_crawler_config
-- Purpose: Configuration for neural network enhanced crawling
CREATE TABLE IF NOT EXISTS neural_network_crawler_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID NOT NULL,
  crawler_instance_id UUID,
  
  -- Crawling optimization config
  optimization_config JSONB DEFAULT '{
    "enabled": true,
    "priority_scoring": true,
    "url_prediction": true,
    "content_filtering": true,
    "duplicate_detection": true
  }',
  
  -- Content extraction config
  extraction_config JSONB DEFAULT '{
    "dynamic_selectors": true,
    "structure_learning": true,
    "pattern_recognition": true
  }',
  
  -- Performance config
  performance_config JSONB DEFAULT '{
    "adaptive_concurrency": true,
    "smart_throttling": true,
    "retry_prediction": true
  }',
  
  -- Training data collection
  training_data_config JSONB DEFAULT '{
    "collect_successful_patterns": true,
    "collect_failed_patterns": true,
    "collect_performance_metrics": true
  }',
  
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nn_crawler_config_nn_id ON neural_network_crawler_config(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_nn_crawler_config_crawler_id ON neural_network_crawler_config(crawler_instance_id);

-- ============================================================================
-- NEURAL NETWORK SEEDER INTEGRATION
-- ============================================================================

-- Table: neural_network_seeder_config
-- Purpose: Configuration for neural network enhanced URL seeding
CREATE TABLE IF NOT EXISTS neural_network_seeder_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID NOT NULL,
  
  -- Topic translation config
  translation_config JSONB DEFAULT '{
    "enabled": true,
    "use_semantic_similarity": true,
    "expand_related_topics": true,
    "confidence_threshold": 0.7
  }',
  
  -- URL generation config
  url_generation_config JSONB DEFAULT '{
    "enabled": true,
    "predict_valuable_urls": true,
    "prioritize_by_relevance": true,
    "filter_duplicates": true
  }',
  
  -- Related topics config
  related_topics_config JSONB DEFAULT '{
    "enabled": true,
    "max_depth": 2,
    "max_suggestions": 10,
    "relevance_threshold": 0.6
  }',
  
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nn_seeder_config_nn_id ON neural_network_seeder_config(neural_network_id);

-- ============================================================================
-- NEURAL NETWORK SEO ATTRIBUTES
-- ============================================================================

-- Table: neural_network_seo_attributes
-- Purpose: SEO-specific attributes and rankings managed by neural network
CREATE TABLE IF NOT EXISTS neural_network_seo_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID NOT NULL,
  url VARCHAR(2048),
  
  -- SEO Metrics
  keyword_relevance_score DECIMAL(5,4) DEFAULT 0.0,
  content_quality_score DECIMAL(5,4) DEFAULT 0.0,
  structure_score DECIMAL(5,4) DEFAULT 0.0,
  performance_score DECIMAL(5,4) DEFAULT 0.0,
  
  -- Rankings
  predicted_rank INTEGER,
  confidence_score DECIMAL(5,4) DEFAULT 0.0,
  
  -- Trust and authority
  trust_score DECIMAL(5,4) DEFAULT 0.5,
  authority_score DECIMAL(5,4) DEFAULT 0.5,
  
  -- Optimization recommendations
  optimization_recommendations JSONB DEFAULT '[]',
  
  -- Attribute values
  attributes JSONB DEFAULT '{}',
  
  -- Metadata
  last_analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nn_seo_attributes_nn_id ON neural_network_seo_attributes(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_nn_seo_attributes_url ON neural_network_seo_attributes(url);
CREATE INDEX IF NOT EXISTS idx_nn_seo_attributes_rank ON neural_network_seo_attributes(predicted_rank);

-- ============================================================================
-- NEURAL NETWORK TRAINING DATA
-- ============================================================================

-- Table: neural_network_training_data
-- Purpose: Store training data for neural network instances
CREATE TABLE IF NOT EXISTS neural_network_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID NOT NULL,
  data_source VARCHAR(255), -- crawler, seeder, manual, import
  data_type VARCHAR(100), -- crawlee, seo, performance, content
  
  -- Training data
  input_features JSONB NOT NULL,
  target_values JSONB NOT NULL,
  
  -- Metadata
  quality_score DECIMAL(5,4),
  validated BOOLEAN DEFAULT false,
  validation_result JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nn_training_data_nn_id ON neural_network_training_data(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_nn_training_data_source ON neural_network_training_data(data_source);
CREATE INDEX IF NOT EXISTS idx_nn_training_data_type ON neural_network_training_data(data_type);
CREATE INDEX IF NOT EXISTS idx_nn_training_data_validated ON neural_network_training_data(validated);

-- ============================================================================
-- NEURAL NETWORK MODELS REGISTRY
-- ============================================================================

-- Table: neural_network_models
-- Purpose: Registry of pre-trained models for scraping and data mining
CREATE TABLE IF NOT EXISTS neural_network_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(255) NOT NULL UNIQUE,
  model_type VARCHAR(100) NOT NULL, -- scraping, data_mining, seo, content, etc.
  description TEXT,
  
  -- Model metadata
  model_path VARCHAR(500),
  model_config JSONB DEFAULT '{}',
  architecture JSONB,
  
  -- Performance metrics
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  
  -- Training info
  training_date TIMESTAMP,
  training_samples INTEGER,
  
  -- Version and status
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(50) DEFAULT 'available',
  is_default BOOLEAN DEFAULT false,
  
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nn_models_type ON neural_network_models(model_type);
CREATE INDEX IF NOT EXISTS idx_nn_models_status ON neural_network_models(status);
CREATE INDEX IF NOT EXISTS idx_nn_models_default ON neural_network_models(is_default) WHERE is_default = true;

-- ============================================================================
-- NEURAL NETWORK PROJECT ORGANIZATION
-- ============================================================================

-- Table: neural_network_project_research
-- Purpose: Store research data for project organization and development skills
CREATE TABLE IF NOT EXISTS neural_network_project_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neural_network_id UUID,
  research_topic VARCHAR(255) NOT NULL,
  research_type VARCHAR(100), -- organizing_skills, development_best_practices, architecture_patterns
  
  -- Research data
  findings JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  implementation_examples JSONB DEFAULT '[]',
  
  -- Relevance
  relevance_score DECIMAL(5,4),
  confidence_score DECIMAL(5,4),
  
  -- Sources
  sources JSONB DEFAULT '[]',
  
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nn_project_research_nn_id ON neural_network_project_research(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_nn_project_research_type ON neural_network_project_research(research_type);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: v_neural_network_overview
-- Purpose: Comprehensive overview of neural network instances with relationships
CREATE OR REPLACE VIEW v_neural_network_overview AS
SELECT 
  nni.id,
  nni.name,
  nni.description,
  nni.model_type,
  nni.status,
  nni.accuracy,
  nni.created_at,
  nni.updated_at,
  
  -- Count relationships
  (SELECT COUNT(*) FROM neural_network_data_streams WHERE neural_network_id = nni.id) as data_stream_count,
  (SELECT COUNT(*) FROM neural_network_attributes WHERE neural_network_id = nni.id AND is_active = true) as active_attribute_count,
  (SELECT COUNT(*) FROM neural_network_crawler_config WHERE neural_network_id = nni.id) as crawler_config_count,
  (SELECT COUNT(*) FROM neural_network_training_data WHERE neural_network_id = nni.id) as training_data_count,
  
  -- Latest training data
  (SELECT MAX(created_at) FROM neural_network_training_data WHERE neural_network_id = nni.id) as last_training_data_at,
  
  -- SEO metrics summary
  (SELECT AVG(trust_score) FROM neural_network_seo_attributes WHERE neural_network_id = nni.id) as avg_trust_score,
  (SELECT AVG(content_quality_score) FROM neural_network_seo_attributes WHERE neural_network_id = nni.id) as avg_quality_score
  
FROM neural_network_instances nni;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: add_data_stream_to_neural_network
-- Purpose: Add a new data stream to a neural network instance
CREATE OR REPLACE FUNCTION add_data_stream_to_neural_network(
  p_neural_network_id UUID,
  p_name VARCHAR,
  p_stream_type VARCHAR,
  p_source_type VARCHAR DEFAULT 'database',
  p_destination_type VARCHAR DEFAULT 'model',
  p_source_config JSONB DEFAULT '{}',
  p_destination_config JSONB DEFAULT '{}',
  p_attribute_mappings JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  v_stream_id UUID;
BEGIN
  INSERT INTO neural_network_data_streams (
    neural_network_id,
    name,
    stream_type,
    source_type,
    destination_type,
    source_config,
    destination_config,
    attribute_mappings,
    status
  ) VALUES (
    p_neural_network_id,
    p_name,
    p_stream_type,
    p_source_type,
    p_destination_type,
    p_source_config,
    p_destination_config,
    p_attribute_mappings,
    'active'
  )
  RETURNING id INTO v_stream_id;
  
  RETURN v_stream_id;
END;
$$ LANGUAGE plpgsql;

-- Function: combine_attributes_for_neural_network
-- Purpose: Combine multiple attributes into a data stream
CREATE OR REPLACE FUNCTION combine_attributes_for_neural_network(
  p_neural_network_id UUID,
  p_attribute_ids UUID[],
  p_stream_name VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_stream_id UUID;
  v_attributes JSONB;
BEGIN
  -- Get attribute details
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', attribute_name,
      'type', attribute_type,
      'config', algorithm_config
    )
  ) INTO v_attributes
  FROM neural_network_attributes
  WHERE id = ANY(p_attribute_ids);
  
  -- Create data stream
  v_stream_id := add_data_stream_to_neural_network(
    p_neural_network_id,
    p_stream_name,
    'input',
    'attributes',
    'model',
    jsonb_build_object('attributes', v_attributes),
    '{}',
    v_attributes
  );
  
  RETURN v_stream_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DEFAULT DATA SEEDING
-- ============================================================================

-- Insert default pre-trained models for scraping and data mining
INSERT INTO neural_network_models (model_name, model_type, description, is_default, status, tags) VALUES
  ('crawler_url_prioritization', 'scraping', 'Predicts URL crawling priority based on historical data', true, 'available', ARRAY['crawling', 'prioritization']),
  ('content_extraction_selector', 'scraping', 'Learns optimal CSS selectors for content extraction', true, 'available', ARRAY['extraction', 'selectors']),
  ('seo_keyword_optimizer', 'seo', 'Optimizes keyword placement and density for SEO', true, 'available', ARRAY['seo', 'keywords']),
  ('seo_content_quality', 'seo', 'Evaluates content quality for search engine ranking', true, 'available', ARRAY['seo', 'quality']),
  ('data_mining_pattern_detector', 'data_mining', 'Detects patterns in scraped data', true, 'available', ARRAY['mining', 'patterns']),
  ('duplicate_content_detector', 'data_mining', 'Identifies duplicate and near-duplicate content', true, 'available', ARRAY['mining', 'duplicates']),
  ('project_organization_advisor', 'development', 'Recommends project organization strategies', true, 'available', ARRAY['development', 'organization']),
  ('crawlee_tensorflow_integration', 'scraping', 'Integrates Crawlee with TensorFlow for intelligent crawling', true, 'available', ARRAY['crawling', 'tensorflow', 'crawlee'])
ON CONFLICT (model_name) DO UPDATE SET
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE neural_network_data_streams IS 'Data streams for neural network input/output processing';
COMMENT ON TABLE neural_network_attributes IS 'Configurable attributes for neural network feature engineering';
COMMENT ON TABLE neural_network_crawler_config IS 'Configuration for neural network enhanced crawling';
COMMENT ON TABLE neural_network_seeder_config IS 'Configuration for neural network enhanced URL seeding';
COMMENT ON TABLE neural_network_seo_attributes IS 'SEO-specific attributes and rankings managed by neural network';
COMMENT ON TABLE neural_network_training_data IS 'Training data for neural network instances';
COMMENT ON TABLE neural_network_models IS 'Registry of pre-trained models for scraping and data mining';
COMMENT ON TABLE neural_network_project_research IS 'Research data for project organization and development skills';

COMMENT ON FUNCTION add_data_stream_to_neural_network IS 'Adds a new data stream to a neural network instance';
COMMENT ON FUNCTION combine_attributes_for_neural_network IS 'Combines multiple attributes into a data stream for neural network processing';
