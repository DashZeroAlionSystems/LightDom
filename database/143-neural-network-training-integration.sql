-- =============================================================================
-- Neural Network Training Data Integration Schema
-- Comprehensive database migration for connecting TensorFlow pretrained models
-- with crawler data mining and training pipelines
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PRETRAINED MODELS REGISTRY
-- Stores available TensorFlow/Hugging Face pretrained models
-- =============================================================================

CREATE TABLE IF NOT EXISTS pretrained_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('tensorflow-hub', 'huggingface', 'custom', 'local')),
  task VARCHAR(100) NOT NULL,
  seo_use_case VARCHAR(100),
  description TEXT,
  
  -- Model specifications
  download_url TEXT,
  model_url TEXT,
  format VARCHAR(50) DEFAULT 'tfjs',
  input_dimensions JSONB,
  output_dimensions JSONB,
  size_mb DECIMAL(10, 2),
  accuracy DECIMAL(5, 4),
  performance_tier VARCHAR(20) CHECK (performance_tier IN ('very-fast', 'fast', 'medium', 'slow')),
  
  -- SEO applications
  seo_applications JSONB DEFAULT '[]',
  
  -- Transfer learning configuration
  transfer_learning_config JSONB DEFAULT '{}',
  
  -- Status and availability
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'downloading', 'loaded', 'error', 'deprecated')),
  is_loaded BOOLEAN DEFAULT false,
  last_loaded_at TIMESTAMP,
  load_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for pretrained_models
CREATE INDEX IF NOT EXISTS idx_pretrained_models_source ON pretrained_models(source);
CREATE INDEX IF NOT EXISTS idx_pretrained_models_task ON pretrained_models(task);
CREATE INDEX IF NOT EXISTS idx_pretrained_models_performance ON pretrained_models(performance_tier);
CREATE INDEX IF NOT EXISTS idx_pretrained_models_status ON pretrained_models(status);
CREATE INDEX IF NOT EXISTS idx_pretrained_models_seo_use_case ON pretrained_models(seo_use_case);

-- =============================================================================
-- CRAWLER TRAINING DATA
-- Stores mined data from crawler for neural network training
-- =============================================================================

CREATE TABLE IF NOT EXISTS crawler_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Source identification
  url VARCHAR(2048) NOT NULL,
  domain VARCHAR(255),
  crawl_session_id UUID,
  campaign_id UUID,
  
  -- Client association for data isolation
  client_id VARCHAR(255) NOT NULL,
  
  -- Extracted data
  content_text TEXT,
  meta_data JSONB DEFAULT '{}',
  
  -- 192 SEO attributes as JSONB for flexibility
  seo_attributes JSONB DEFAULT '{}',
  
  -- Structural analysis
  dom_structure JSONB DEFAULT '{}',
  heading_hierarchy JSONB DEFAULT '[]',
  link_analysis JSONB DEFAULT '{}',
  image_analysis JSONB DEFAULT '[]',
  
  -- Performance metrics
  performance_metrics JSONB DEFAULT '{}',
  core_web_vitals JSONB DEFAULT '{}',
  
  -- Schema markup
  schema_markup JSONB DEFAULT '[]',
  structured_data JSONB DEFAULT '{}',
  
  -- Quality scoring
  quality_score DECIMAL(5, 2),
  completeness_score DECIMAL(5, 2),
  relevance_score DECIMAL(5, 2),
  
  -- Labels (for supervised training)
  labels JSONB DEFAULT '{}',
  is_labeled BOOLEAN DEFAULT false,
  labeled_by VARCHAR(255),
  labeled_at TIMESTAMP,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'used', 'archived', 'error')),
  error_message TEXT,
  
  -- Model association
  target_model_types JSONB DEFAULT '[]',
  used_in_training_runs JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Indexes for crawler_training_data
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_client ON crawler_training_data(client_id);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_domain ON crawler_training_data(domain);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_status ON crawler_training_data(status);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_quality ON crawler_training_data(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_labeled ON crawler_training_data(is_labeled);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_created ON crawler_training_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_campaign ON crawler_training_data(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_url ON crawler_training_data(url);

-- GIN index for JSONB search
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_seo_attrs ON crawler_training_data USING GIN(seo_attributes);
CREATE INDEX IF NOT EXISTS idx_crawler_training_data_labels ON crawler_training_data USING GIN(labels);

-- =============================================================================
-- TRAINING DATA TO MODEL MAPPING
-- Links training data to specific neural network instances
-- =============================================================================

CREATE TABLE IF NOT EXISTS training_data_model_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_data_id UUID NOT NULL REFERENCES crawler_training_data(id) ON DELETE CASCADE,
  neural_network_id VARCHAR(255) NOT NULL,
  pretrained_model_id UUID REFERENCES pretrained_models(id),
  
  -- Usage tracking
  used_for VARCHAR(50) NOT NULL CHECK (used_for IN ('training', 'validation', 'testing')),
  epoch_used INTEGER,
  batch_used INTEGER,
  
  -- Data transformation applied
  preprocessing_applied JSONB DEFAULT '[]',
  feature_extraction_config JSONB DEFAULT '{}',
  
  -- Contribution metrics
  contribution_score DECIMAL(5, 4),
  gradient_magnitude DECIMAL(10, 6),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(training_data_id, neural_network_id, used_for)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_mapping_nn ON training_data_model_mapping(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_training_mapping_pretrained ON training_data_model_mapping(pretrained_model_id);
CREATE INDEX IF NOT EXISTS idx_training_mapping_usage ON training_data_model_mapping(used_for);

-- =============================================================================
-- MODEL DEPLOYMENT REGISTRY
-- Tracks deployed pretrained models with their configurations
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pretrained_model_id UUID NOT NULL REFERENCES pretrained_models(id),
  neural_network_id VARCHAR(255),
  
  -- Deployment configuration
  deployment_name VARCHAR(255) NOT NULL,
  environment VARCHAR(50) DEFAULT 'development' CHECK (environment IN ('development', 'staging', 'production')),
  endpoint_url TEXT,
  
  -- Model state
  model_path TEXT,
  model_size_bytes BIGINT,
  is_active BOOLEAN DEFAULT false,
  
  -- Transfer learning state
  is_fine_tuned BOOLEAN DEFAULT false,
  fine_tune_config JSONB DEFAULT '{}',
  frozen_layers INTEGER,
  additional_layers JSONB DEFAULT '[]',
  
  -- Performance tracking
  inference_count BIGINT DEFAULT 0,
  avg_inference_time_ms DECIMAL(10, 2),
  last_inference_at TIMESTAMP,
  
  -- Accuracy tracking
  initial_accuracy DECIMAL(5, 4),
  current_accuracy DECIMAL(5, 4),
  accuracy_history JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'active', 'inactive', 'error', 'archived')),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deployed_at TIMESTAMP,
  last_updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_model_deployments_pretrained ON model_deployments(pretrained_model_id);
CREATE INDEX IF NOT EXISTS idx_model_deployments_nn ON model_deployments(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_model_deployments_status ON model_deployments(status);
CREATE INDEX IF NOT EXISTS idx_model_deployments_active ON model_deployments(is_active);
CREATE INDEX IF NOT EXISTS idx_model_deployments_environment ON model_deployments(environment);

-- =============================================================================
-- TRAINING PIPELINE CONFIGURATION
-- Defines training pipelines connecting data sources to models
-- =============================================================================

CREATE TABLE IF NOT EXISTS training_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Client association
  client_id VARCHAR(255),
  
  -- Source configuration
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('crawler', 'database', 'api', 'file', 'stream')),
  source_config JSONB NOT NULL,
  
  -- Target neural network
  neural_network_id VARCHAR(255),
  pretrained_model_id UUID REFERENCES pretrained_models(id),
  
  -- Data processing configuration
  preprocessing_steps JSONB DEFAULT '[]',
  feature_extraction_config JSONB DEFAULT '{}',
  augmentation_config JSONB DEFAULT '{}',
  
  -- Training configuration
  training_config JSONB DEFAULT '{
    "epochs": 50,
    "batchSize": 32,
    "learningRate": 0.001,
    "validationSplit": 0.2,
    "optimizer": "adam",
    "earlyStopping": true,
    "patience": 5
  }',
  
  -- Scheduling
  schedule_type VARCHAR(50) CHECK (schedule_type IN ('manual', 'on_data', 'scheduled', 'continuous')),
  schedule_config JSONB DEFAULT '{}',
  
  -- Data thresholds
  min_data_points INTEGER DEFAULT 1000,
  max_data_points INTEGER DEFAULT 100000,
  quality_threshold DECIMAL(5, 2) DEFAULT 70.0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'archived')),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  run_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_pipelines_client ON training_pipelines(client_id);
CREATE INDEX IF NOT EXISTS idx_training_pipelines_nn ON training_pipelines(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_training_pipelines_status ON training_pipelines(status);
CREATE INDEX IF NOT EXISTS idx_training_pipelines_schedule ON training_pipelines(schedule_type);

-- =============================================================================
-- TRAINING RUN HISTORY
-- Tracks individual training runs and their results
-- =============================================================================

CREATE TABLE IF NOT EXISTS neural_network_training_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES training_pipelines(id),
  neural_network_id VARCHAR(255) NOT NULL,
  pretrained_model_id UUID REFERENCES pretrained_models(id),
  
  -- Training data stats
  total_samples INTEGER NOT NULL,
  training_samples INTEGER,
  validation_samples INTEGER,
  test_samples INTEGER,
  
  -- Configuration used
  epochs_configured INTEGER,
  epochs_completed INTEGER DEFAULT 0,
  batch_size INTEGER,
  learning_rate DECIMAL(10, 8),
  
  -- Metrics over time
  training_history JSONB DEFAULT '{"loss": [], "accuracy": [], "val_loss": [], "val_accuracy": []}',
  
  -- Final metrics
  final_loss DECIMAL(10, 6),
  final_accuracy DECIMAL(5, 4),
  final_val_loss DECIMAL(10, 6),
  final_val_accuracy DECIMAL(5, 4),
  
  -- Additional metrics
  precision_score DECIMAL(5, 4),
  recall_score DECIMAL(5, 4),
  f1_score DECIMAL(5, 4),
  
  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  avg_epoch_time_seconds DECIMAL(10, 2),
  
  -- Resource usage
  gpu_memory_peak_mb INTEGER,
  cpu_utilization_avg DECIMAL(5, 2),
  
  -- Model output
  model_checkpoint_path TEXT,
  model_version VARCHAR(20),
  
  -- Status
  status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'initializing', 'training', 'evaluating', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  triggered_by VARCHAR(255)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_runs_pipeline ON neural_network_training_runs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_training_runs_nn ON neural_network_training_runs(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_training_runs_status ON neural_network_training_runs(status);
CREATE INDEX IF NOT EXISTS idx_training_runs_started ON neural_network_training_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_runs_accuracy ON neural_network_training_runs(final_accuracy DESC);

-- =============================================================================
-- INFERENCE LOG
-- Tracks model inferences for monitoring and continuous learning
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_inference_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neural_network_id VARCHAR(255) NOT NULL,
  pretrained_model_id UUID REFERENCES pretrained_models(id),
  deployment_id UUID REFERENCES model_deployments(id),
  
  -- Input/Output
  input_data JSONB NOT NULL,
  input_hash VARCHAR(64),
  output_prediction JSONB NOT NULL,
  confidence_score DECIMAL(5, 4),
  
  -- Context
  request_source VARCHAR(255),
  request_url TEXT,
  client_id VARCHAR(255),
  
  -- Performance
  inference_time_ms DECIMAL(10, 2),
  preprocessing_time_ms DECIMAL(10, 2),
  
  -- Feedback for continuous learning
  feedback_label JSONB,
  feedback_correct BOOLEAN,
  feedback_at TIMESTAMP,
  feedback_by VARCHAR(255),
  
  -- Used for retraining
  used_for_retraining BOOLEAN DEFAULT false,
  retraining_run_id UUID,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inference_log_nn ON model_inference_log(neural_network_id);
CREATE INDEX IF NOT EXISTS idx_inference_log_client ON model_inference_log(client_id);
CREATE INDEX IF NOT EXISTS idx_inference_log_created ON model_inference_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inference_log_feedback ON model_inference_log(feedback_correct);
CREATE INDEX IF NOT EXISTS idx_inference_log_retraining ON model_inference_log(used_for_retraining);

-- Partition by month for large-scale data
-- ALTER TABLE model_inference_log SET (autovacuum_vacuum_scale_factor = 0.05);

-- =============================================================================
-- SEO ATTRIBUTE DEFINITIONS
-- Defines the 192 SEO attributes that can be extracted and used for training
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_attribute_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'meta', 'content', 'technical', 'performance', 'structure',
    'links', 'images', 'mobile', 'security', 'social', 'schema'
  )),
  
  -- Attribute specification
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN (
    'numeric', 'boolean', 'string', 'array', 'object', 'timestamp'
  )),
  description TEXT,
  example_value TEXT,
  
  -- Extraction configuration
  extraction_method VARCHAR(50) CHECK (extraction_method IN (
    'dom_selector', 'regex', 'api', 'calculation', 'ml_model'
  )),
  extraction_config JSONB DEFAULT '{}',
  
  -- Normalization
  normalization_method VARCHAR(50) CHECK (normalization_method IN (
    'min_max', 'z_score', 'log', 'binary', 'one_hot', 'none'
  )),
  normalization_config JSONB DEFAULT '{}',
  
  -- Importance for different use cases
  importance_weights JSONB DEFAULT '{
    "seo_optimization": 0.5,
    "content_quality": 0.5,
    "performance": 0.5,
    "crawler_efficiency": 0.5
  }',
  
  -- Model compatibility
  compatible_models JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seo_attr_defs_category ON seo_attribute_definitions(category);
CREATE INDEX IF NOT EXISTS idx_seo_attr_defs_active ON seo_attribute_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_seo_attr_defs_type ON seo_attribute_definitions(data_type);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View: Active pretrained models with statistics
CREATE OR REPLACE VIEW v_pretrained_models_stats AS
SELECT 
  pm.*,
  COUNT(DISTINCT md.id) AS deployment_count,
  COUNT(DISTINCT ntr.id) AS training_run_count,
  COALESCE(SUM(md.inference_count), 0) AS total_inferences,
  AVG(md.current_accuracy) AS avg_deployment_accuracy
FROM pretrained_models pm
LEFT JOIN model_deployments md ON pm.id = md.pretrained_model_id
LEFT JOIN neural_network_training_runs ntr ON pm.id = ntr.pretrained_model_id
WHERE pm.status != 'deprecated'
GROUP BY pm.id;

-- View: Training data quality summary by client
CREATE OR REPLACE VIEW v_training_data_quality AS
SELECT 
  client_id,
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE is_labeled) AS labeled_records,
  AVG(quality_score) AS avg_quality,
  AVG(completeness_score) AS avg_completeness,
  AVG(relevance_score) AS avg_relevance,
  COUNT(*) FILTER (WHERE status = 'ready') AS ready_for_training,
  COUNT(DISTINCT domain) AS unique_domains,
  MIN(created_at) AS first_record,
  MAX(created_at) AS latest_record
FROM crawler_training_data
WHERE status != 'archived'
GROUP BY client_id;

-- View: Training pipeline status
CREATE OR REPLACE VIEW v_training_pipeline_status AS
SELECT 
  tp.*,
  pm.name AS pretrained_model_name,
  pm.task AS model_task,
  (SELECT COUNT(*) FROM crawler_training_data ctd 
   WHERE ctd.client_id = tp.client_id 
   AND ctd.status = 'ready') AS available_training_data,
  (SELECT COUNT(*) FROM neural_network_training_runs ntr 
   WHERE ntr.pipeline_id = tp.id) AS total_runs,
  (SELECT MAX(final_accuracy) FROM neural_network_training_runs ntr 
   WHERE ntr.pipeline_id = tp.id AND ntr.status = 'completed') AS best_accuracy
FROM training_pipelines tp
LEFT JOIN pretrained_models pm ON tp.pretrained_model_id = pm.id;

-- View: Recent training runs with details
CREATE OR REPLACE VIEW v_recent_training_runs AS
SELECT 
  ntr.*,
  pm.name AS pretrained_model_name,
  tp.name AS pipeline_name,
  tp.client_id
FROM neural_network_training_runs ntr
LEFT JOIN pretrained_models pm ON ntr.pretrained_model_id = pm.id
LEFT JOIN training_pipelines tp ON ntr.pipeline_id = tp.id
ORDER BY ntr.started_at DESC
LIMIT 100;

-- View: Model performance comparison
CREATE OR REPLACE VIEW v_model_performance_comparison AS
SELECT 
  pm.model_id,
  pm.name,
  pm.task,
  pm.accuracy AS baseline_accuracy,
  AVG(ntr.final_accuracy) AS avg_trained_accuracy,
  MAX(ntr.final_accuracy) AS max_trained_accuracy,
  COUNT(ntr.id) AS training_runs,
  AVG(ntr.duration_seconds) AS avg_training_time
FROM pretrained_models pm
LEFT JOIN neural_network_training_runs ntr ON pm.id = ntr.pretrained_model_id
WHERE pm.status = 'available'
GROUP BY pm.id, pm.model_id, pm.name, pm.task, pm.accuracy
ORDER BY pm.accuracy DESC;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function: Add crawler data for training
CREATE OR REPLACE FUNCTION add_crawler_training_data(
  p_url TEXT,
  p_client_id VARCHAR(255),
  p_seo_attributes JSONB,
  p_content_text TEXT DEFAULT NULL,
  p_meta_data JSONB DEFAULT '{}',
  p_dom_structure JSONB DEFAULT '{}',
  p_quality_score DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_domain VARCHAR(255);
BEGIN
  -- Extract domain from URL
  v_domain := regexp_replace(p_url, '^https?://([^/]+).*$', '\1');
  
  INSERT INTO crawler_training_data (
    url, domain, client_id, content_text, meta_data,
    seo_attributes, dom_structure, quality_score, status
  )
  VALUES (
    p_url, v_domain, p_client_id, p_content_text, p_meta_data,
    p_seo_attributes, p_dom_structure, p_quality_score, 'pending'
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Link training data to neural network
CREATE OR REPLACE FUNCTION link_training_data_to_model(
  p_training_data_id UUID,
  p_neural_network_id VARCHAR(255),
  p_pretrained_model_id UUID DEFAULT NULL,
  p_used_for VARCHAR(50) DEFAULT 'training'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO training_data_model_mapping (
    training_data_id, neural_network_id, pretrained_model_id, used_for
  )
  VALUES (
    p_training_data_id, p_neural_network_id, p_pretrained_model_id, p_used_for
  )
  ON CONFLICT (training_data_id, neural_network_id, used_for) DO UPDATE
  SET pretrained_model_id = EXCLUDED.pretrained_model_id
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Start training run
CREATE OR REPLACE FUNCTION start_training_run(
  p_pipeline_id UUID,
  p_neural_network_id VARCHAR(255),
  p_pretrained_model_id UUID DEFAULT NULL,
  p_config JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_pipeline training_pipelines%ROWTYPE;
  v_sample_count INTEGER;
BEGIN
  -- Get pipeline config
  SELECT * INTO v_pipeline FROM training_pipelines WHERE id = p_pipeline_id;
  
  IF v_pipeline IS NULL THEN
    RAISE EXCEPTION 'Pipeline not found: %', p_pipeline_id;
  END IF;
  
  -- Count available samples
  SELECT COUNT(*) INTO v_sample_count
  FROM crawler_training_data
  WHERE client_id = v_pipeline.client_id
    AND status = 'ready'
    AND quality_score >= v_pipeline.quality_threshold;
  
  IF v_sample_count < v_pipeline.min_data_points THEN
    RAISE EXCEPTION 'Insufficient training data: % < %', v_sample_count, v_pipeline.min_data_points;
  END IF;
  
  -- Create training run
  INSERT INTO neural_network_training_runs (
    pipeline_id, neural_network_id, pretrained_model_id,
    total_samples, training_samples, validation_samples,
    epochs_configured, batch_size, learning_rate,
    status, started_at
  )
  VALUES (
    p_pipeline_id, p_neural_network_id, COALESCE(p_pretrained_model_id, v_pipeline.pretrained_model_id),
    v_sample_count,
    FLOOR(v_sample_count * 0.8),
    FLOOR(v_sample_count * 0.2),
    (v_pipeline.training_config->>'epochs')::INTEGER,
    (v_pipeline.training_config->>'batchSize')::INTEGER,
    (v_pipeline.training_config->>'learningRate')::DECIMAL,
    'initializing', NOW()
  )
  RETURNING id INTO v_id;
  
  -- Update pipeline last run
  UPDATE training_pipelines
  SET last_run_at = NOW(), run_count = run_count + 1
  WHERE id = p_pipeline_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Complete training run
CREATE OR REPLACE FUNCTION complete_training_run(
  p_run_id UUID,
  p_final_metrics JSONB,
  p_training_history JSONB DEFAULT NULL,
  p_model_path TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE neural_network_training_runs
  SET 
    status = 'completed',
    completed_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
    epochs_completed = (p_final_metrics->>'epochs_completed')::INTEGER,
    final_loss = (p_final_metrics->>'loss')::DECIMAL,
    final_accuracy = (p_final_metrics->>'accuracy')::DECIMAL,
    final_val_loss = (p_final_metrics->>'val_loss')::DECIMAL,
    final_val_accuracy = (p_final_metrics->>'val_accuracy')::DECIMAL,
    precision_score = (p_final_metrics->>'precision')::DECIMAL,
    recall_score = (p_final_metrics->>'recall')::DECIMAL,
    f1_score = (p_final_metrics->>'f1')::DECIMAL,
    training_history = COALESCE(p_training_history, training_history),
    model_checkpoint_path = p_model_path,
    updated_at = NOW()
  WHERE id = p_run_id;
  
  -- Update neural network instance performance
  UPDATE neural_network_instances
  SET 
    performance = jsonb_build_object(
      'accuracy', (p_final_metrics->>'accuracy')::DECIMAL,
      'loss', (p_final_metrics->>'loss')::DECIMAL,
      'validationAccuracy', (p_final_metrics->>'val_accuracy')::DECIMAL,
      'lastTrainingDate', NOW()::TEXT
    ),
    status = 'ready',
    updated_at = NOW()
  WHERE id = (SELECT neural_network_id FROM neural_network_training_runs WHERE id = p_run_id);
END;
$$ LANGUAGE plpgsql;

-- Function: Log inference
CREATE OR REPLACE FUNCTION log_model_inference(
  p_neural_network_id VARCHAR(255),
  p_input_data JSONB,
  p_output_prediction JSONB,
  p_confidence_score DECIMAL,
  p_inference_time_ms DECIMAL,
  p_client_id VARCHAR(255) DEFAULT NULL,
  p_pretrained_model_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO model_inference_log (
    neural_network_id, pretrained_model_id, input_data, 
    input_hash, output_prediction, confidence_score,
    inference_time_ms, client_id
  )
  VALUES (
    p_neural_network_id, p_pretrained_model_id, p_input_data,
    encode(sha256(p_input_data::TEXT::BYTEA), 'hex'),
    p_output_prediction, p_confidence_score,
    p_inference_time_ms, p_client_id
  )
  RETURNING id INTO v_id;
  
  -- Update deployment inference count if exists
  UPDATE model_deployments
  SET inference_count = inference_count + 1,
      last_inference_at = NOW(),
      avg_inference_time_ms = (avg_inference_time_ms * inference_count + p_inference_time_ms) / (inference_count + 1)
  WHERE neural_network_id = p_neural_network_id
    AND is_active = true;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get training data for neural network
CREATE OR REPLACE FUNCTION get_training_data_for_model(
  p_client_id VARCHAR(255),
  p_model_type VARCHAR(100),
  p_limit INTEGER DEFAULT 10000,
  p_min_quality DECIMAL DEFAULT 70.0
)
RETURNS TABLE (
  id UUID,
  url VARCHAR(2048),
  seo_attributes JSONB,
  labels JSONB,
  quality_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ctd.id,
    ctd.url,
    ctd.seo_attributes,
    ctd.labels,
    ctd.quality_score
  FROM crawler_training_data ctd
  WHERE ctd.client_id = p_client_id
    AND ctd.status = 'ready'
    AND ctd.quality_score >= p_min_quality
    AND (ctd.target_model_types ? p_model_type OR ctd.target_model_types = '[]')
  ORDER BY ctd.quality_score DESC, ctd.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger: Update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pretrained_models_updated
  BEFORE UPDATE ON pretrained_models
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_crawler_training_data_updated
  BEFORE UPDATE ON crawler_training_data
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_model_deployments_updated
  BEFORE UPDATE ON model_deployments
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_training_pipelines_updated
  BEFORE UPDATE ON training_pipelines
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_training_runs_updated
  BEFORE UPDATE ON neural_network_training_runs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_seo_attr_defs_updated
  BEFORE UPDATE ON seo_attribute_definitions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- SEED DATA: PRETRAINED MODELS
-- =============================================================================

-- Insert the 11 pretrained models from the registry
INSERT INTO pretrained_models (model_id, name, source, task, seo_use_case, description, download_url, format, input_dimensions, output_dimensions, size_mb, accuracy, performance_tier, seo_applications, transfer_learning_config)
VALUES
  -- Text Analysis Models
  ('universal-sentence-encoder', 'Universal Sentence Encoder', 'tensorflow-hub', 'text-embedding', 'content-similarity', 
   'Encodes text into 512-dimensional embeddings for semantic similarity analysis',
   'https://tfhub.dev/google/universal-sentence-encoder/4', 'tfjs',
   '"variable"', '512', 1024, 0.92, 'medium',
   '["Content similarity detection", "Duplicate content identification", "Semantic keyword analysis", "Related content recommendations"]',
   '{"freezeLayers": 0, "additionalLayers": [{"type": "dense", "units": 256, "activation": "relu"}]}'),

  ('bert-base-uncased', 'BERT Base Uncased', 'huggingface', 'text-classification', 'content-quality-analysis',
   'Bidirectional encoder for understanding text context and quality',
   'https://huggingface.co/bert-base-uncased', 'transformers',
   '512', '768', 440, 0.93, 'medium',
   '["Content quality scoring", "Readability analysis", "Topic classification", "Intent detection"]',
   '{"freezeLayers": 8, "additionalLayers": [{"type": "dense", "units": 512, "activation": "relu"}]}'),

  ('distilbert-sst2-sentiment', 'DistilBERT SST-2 Sentiment', 'huggingface', 'sentiment-analysis', 'user-sentiment-analysis',
   'Lightweight sentiment analysis for user-generated content',
   'https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english', 'transformers',
   '512', '2', 268, 0.915, 'fast',
   '["Review sentiment analysis", "User feedback classification", "Comment tone detection"]',
   '{"freezeLayers": 4, "additionalLayers": [{"type": "dense", "units": 128, "activation": "relu"}]}'),

  ('sentence-transformers-minilm', 'All MiniLM L6 v2', 'huggingface', 'sentence-embedding', 'fast-content-embedding',
   'Fast and efficient sentence embeddings for large-scale analysis',
   'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2', 'transformers',
   '256', '384', 90, 0.88, 'very-fast',
   '["Bulk content analysis", "Fast similarity checks", "Real-time crawling optimization"]',
   '{"freezeLayers": 0, "additionalLayers": [{"type": "dense", "units": 192, "activation": "relu"}]}'),

  -- Image Analysis Models
  ('mobilenet-v2', 'MobileNet V2', 'tensorflow-hub', 'image-classification', 'image-analysis',
   'Lightweight image analysis for alt text generation and image SEO',
   'https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/5', 'tfjs',
   '[224, 224, 3]', '1001', 14, 0.87, 'very-fast',
   '["Automatic alt text generation", "Image content classification", "Visual quality assessment"]',
   '{"freezeLayers": 0, "additionalLayers": [{"type": "dense", "units": 512, "activation": "relu"}]}'),

  ('efficientnet-b0', 'EfficientNet B0', 'tensorflow-hub', 'image-classification', 'advanced-image-analysis',
   'High-accuracy image analysis for detailed visual SEO',
   'https://tfhub.dev/tensorflow/efficientnet/b0/classification/1', 'tfjs',
   '[224, 224, 3]', '1000', 20, 0.91, 'medium',
   '["High-quality image classification", "Product image analysis", "Visual content optimization"]',
   '{"freezeLayers": 5, "additionalLayers": [{"type": "globalAveragePooling2D"}]}'),

  -- SEO-Specific Models
  ('toxicity-detection', 'Toxicity Detection', 'tensorflow-hub', 'text-classification', 'content-safety',
   'Detects toxic content for brand safety and content moderation',
   'https://storage.googleapis.com/tfjs-models/savedmodel/toxicity/model.json', 'tfjs',
   '"variable"', '7', 50, 0.89, 'fast',
   '["User-generated content filtering", "Comment moderation", "Brand safety checks"]',
   '{"freezeLayers": 0, "additionalLayers": []}'),

  ('question-answering-bert', 'BERT Question Answering', 'huggingface', 'question-answering', 'faq-optimization',
   'Extracts answers from content for FAQ and featured snippet optimization',
   'https://huggingface.co/deepset/bert-base-cased-squad2', 'transformers',
   '512', '2', 420, 0.88, 'medium',
   '["FAQ generation from content", "Featured snippet optimization", "Answer extraction for voice search"]',
   '{"freezeLayers": 6, "additionalLayers": [{"type": "dense", "units": 256, "activation": "relu"}]}'),

  ('named-entity-recognition', 'BERT NER', 'huggingface', 'token-classification', 'entity-extraction',
   'Extracts named entities for schema markup and knowledge graphs',
   'https://huggingface.co/dslim/bert-base-NER', 'transformers',
   '512', '9', 420, 0.91, 'medium',
   '["Automatic schema markup generation", "Entity-based SEO", "Knowledge graph building"]',
   '{"freezeLayers": 8, "additionalLayers": [{"type": "dense", "units": 128, "activation": "relu"}]}'),

  -- Ranking and Prediction Models
  ('zero-shot-classification', 'BART Zero-Shot Classification', 'huggingface', 'zero-shot-classification', 'topic-classification',
   'Classifies content into arbitrary categories without training',
   'https://huggingface.co/facebook/bart-large-mnli', 'transformers',
   '1024', '"variable"', 1600, 0.90, 'slow',
   '["Dynamic content categorization", "Topical authority mapping", "Content cluster generation"]',
   '{"freezeLayers": 10, "additionalLayers": [{"type": "dense", "units": 512, "activation": "relu"}]}'),

  ('text-summarization', 'BART Summarization', 'huggingface', 'summarization', 'meta-description-generation',
   'Generates concise summaries for meta descriptions and snippets',
   'https://huggingface.co/facebook/bart-large-cnn', 'transformers',
   '1024', '1024', 1600, 0.87, 'slow',
   '["Automatic meta description generation", "Snippet optimization", "Content preview generation"]',
   '{"freezeLayers": 8, "additionalLayers": [{"type": "dense", "units": 512, "activation": "relu"}]}')
ON CONFLICT (model_id) DO NOTHING;

-- =============================================================================
-- SEED DATA: SEO ATTRIBUTE DEFINITIONS (sample of 192 attributes)
-- =============================================================================

INSERT INTO seo_attribute_definitions (attribute_name, category, data_type, description, extraction_method, importance_weights)
VALUES
  -- Meta attributes
  ('title_length', 'meta', 'numeric', 'Character count of page title', 'dom_selector', '{"seo_optimization": 0.9}'),
  ('meta_description_length', 'meta', 'numeric', 'Character count of meta description', 'dom_selector', '{"seo_optimization": 0.9}'),
  ('has_canonical', 'meta', 'boolean', 'Page has canonical URL defined', 'dom_selector', '{"seo_optimization": 0.8}'),
  ('og_tags_count', 'meta', 'numeric', 'Number of Open Graph tags', 'dom_selector', '{"seo_optimization": 0.7, "social": 0.9}'),
  ('twitter_card_type', 'meta', 'string', 'Twitter card type', 'dom_selector', '{"social": 0.8}'),
  
  -- Content attributes
  ('word_count', 'content', 'numeric', 'Total word count of main content', 'calculation', '{"content_quality": 0.8}'),
  ('paragraph_count', 'content', 'numeric', 'Number of paragraphs', 'dom_selector', '{"content_quality": 0.6}'),
  ('readability_score', 'content', 'numeric', 'Flesch-Kincaid readability score', 'calculation', '{"content_quality": 0.9}'),
  ('keyword_density', 'content', 'numeric', 'Primary keyword density percentage', 'calculation', '{"seo_optimization": 0.9}'),
  ('unique_words_ratio', 'content', 'numeric', 'Ratio of unique words to total', 'calculation', '{"content_quality": 0.7}'),
  
  -- Technical attributes
  ('page_load_time', 'performance', 'numeric', 'Time to fully load page (ms)', 'api', '{"performance": 1.0}'),
  ('time_to_first_byte', 'performance', 'numeric', 'Server response time (ms)', 'api', '{"performance": 0.9}'),
  ('dom_content_loaded', 'performance', 'numeric', 'DOMContentLoaded event time (ms)', 'api', '{"performance": 0.9}'),
  ('largest_contentful_paint', 'performance', 'numeric', 'LCP metric (ms)', 'api', '{"performance": 1.0}'),
  ('first_input_delay', 'performance', 'numeric', 'FID metric (ms)', 'api', '{"performance": 0.9}'),
  ('cumulative_layout_shift', 'performance', 'numeric', 'CLS metric', 'api', '{"performance": 0.9}'),
  
  -- Structure attributes
  ('h1_count', 'structure', 'numeric', 'Number of H1 headings', 'dom_selector', '{"seo_optimization": 0.9}'),
  ('heading_hierarchy_valid', 'structure', 'boolean', 'Heading structure follows proper hierarchy', 'calculation', '{"seo_optimization": 0.8}'),
  ('dom_depth', 'structure', 'numeric', 'Maximum DOM tree depth', 'calculation', '{"performance": 0.6}'),
  ('total_elements', 'structure', 'numeric', 'Total DOM elements count', 'calculation', '{"performance": 0.7}'),
  
  -- Links attributes
  ('internal_links_count', 'links', 'numeric', 'Number of internal links', 'dom_selector', '{"seo_optimization": 0.8}'),
  ('external_links_count', 'links', 'numeric', 'Number of external links', 'dom_selector', '{"seo_optimization": 0.6}'),
  ('broken_links_count', 'links', 'numeric', 'Number of broken links', 'api', '{"seo_optimization": 0.9}'),
  
  -- Images attributes
  ('images_count', 'images', 'numeric', 'Total number of images', 'dom_selector', '{"content_quality": 0.6}'),
  ('images_with_alt', 'images', 'numeric', 'Images with alt text', 'dom_selector', '{"seo_optimization": 0.9}'),
  ('images_lazy_loaded', 'images', 'numeric', 'Images using lazy loading', 'dom_selector', '{"performance": 0.7}'),
  
  -- Mobile attributes
  ('is_mobile_friendly', 'mobile', 'boolean', 'Page passes mobile-friendly test', 'api', '{"seo_optimization": 1.0}'),
  ('viewport_configured', 'mobile', 'boolean', 'Viewport meta tag configured', 'dom_selector', '{"mobile": 0.9}'),
  ('touch_targets_valid', 'mobile', 'boolean', 'Touch targets appropriately sized', 'calculation', '{"mobile": 0.8}'),
  
  -- Security attributes
  ('uses_https', 'security', 'boolean', 'Page served over HTTPS', 'calculation', '{"seo_optimization": 1.0}'),
  ('has_hsts', 'security', 'boolean', 'HSTS header present', 'api', '{"security": 0.8}'),
  
  -- Schema attributes
  ('schema_types', 'schema', 'array', 'Types of schema.org markup present', 'dom_selector', '{"seo_optimization": 0.9}'),
  ('has_organization_schema', 'schema', 'boolean', 'Organization schema present', 'dom_selector', '{"seo_optimization": 0.8}'),
  ('has_breadcrumb_schema', 'schema', 'boolean', 'Breadcrumb schema present', 'dom_selector', '{"seo_optimization": 0.7}'),
  ('has_faq_schema', 'schema', 'boolean', 'FAQ schema present', 'dom_selector', '{"seo_optimization": 0.8}')
ON CONFLICT (attribute_name) DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE pretrained_models IS 'Registry of available TensorFlow/Hugging Face pretrained models for SEO optimization';
COMMENT ON TABLE crawler_training_data IS 'Training data collected from web crawler for neural network training';
COMMENT ON TABLE training_data_model_mapping IS 'Links training data records to neural network instances';
COMMENT ON TABLE model_deployments IS 'Tracks deployed pretrained models with their configurations';
COMMENT ON TABLE training_pipelines IS 'Defines training pipelines connecting data sources to models';
COMMENT ON TABLE neural_network_training_runs IS 'Tracks individual training runs and their results';
COMMENT ON TABLE model_inference_log IS 'Logs model inferences for monitoring and continuous learning';
COMMENT ON TABLE seo_attribute_definitions IS 'Defines the SEO attributes that can be extracted and used for training';

-- =============================================================================
-- COMPLETION
-- =============================================================================

-- Grant permissions (adjust role names as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lightdom_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lightdom_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO lightdom_app;

-- Output completion message
DO $$
BEGIN
  RAISE NOTICE 'Neural Network Training Integration Schema successfully created!';
  RAISE NOTICE 'Tables created: pretrained_models, crawler_training_data, training_data_model_mapping, model_deployments, training_pipelines, neural_network_training_runs, model_inference_log, seo_attribute_definitions';
  RAISE NOTICE 'Views created: v_pretrained_models_stats, v_training_data_quality, v_training_pipeline_status, v_recent_training_runs, v_model_performance_comparison';
  RAISE NOTICE 'Functions created: add_crawler_training_data, link_training_data_to_model, start_training_run, complete_training_run, log_model_inference, get_training_data_for_model';
  RAISE NOTICE '11 pretrained models seeded into pretrained_models table';
  RAISE NOTICE '35 SEO attribute definitions seeded into seo_attribute_definitions table';
END $$;
