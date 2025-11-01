-- ============================================================================
-- Data Mining and Training Schema for Neural Network Workflow Management
-- ============================================================================
-- This schema collects comprehensive training data for neural networks to:
-- 1. Learn optimal workflow patterns from user behavior
-- 2. Predict resource requirements and execution times
-- 3. Recommend workflow optimizations
-- 4. Generate workflows from natural language
-- 5. Detect anomalies and predict failures
-- ============================================================================

-- Drop existing objects if they exist
DROP MATERIALIZED VIEW IF EXISTS ml_training_dataset_view CASCADE;
DROP MATERIALIZED VIEW IF EXISTS workflow_performance_features_view CASCADE;
DROP TABLE IF EXISTS ml_model_metadata CASCADE;
DROP TABLE IF EXISTS ml_training_jobs CASCADE;
DROP TABLE IF EXISTS ml_predictions CASCADE;
DROP TABLE IF EXISTS ml_feature_importance CASCADE;
DROP TABLE IF EXISTS workflow_execution_features CASCADE;
DROP TABLE IF EXISTS user_interaction_events CASCADE;
DROP TABLE IF EXISTS pattern_usage_analytics CASCADE;
DROP TABLE IF EXISTS ai_generation_feedback CASCADE;
DROP TABLE IF EXISTS workflow_optimization_suggestions CASCADE;
DROP TABLE IF EXISTS anomaly_detection_logs CASCADE;
DROP TYPE IF EXISTS ml_model_type CASCADE;
DROP TYPE IF EXISTS training_job_status CASCADE;
DROP TYPE IF EXISTS interaction_event_type CASCADE;
DROP TYPE IF EXISTS optimization_type CASCADE;

-- Create custom types
CREATE TYPE ml_model_type AS ENUM (
  'workflow_predictor',
  'resource_estimator',
  'duration_predictor',
  'pattern_recommender',
  'anomaly_detector',
  'nlp_generator',
  'optimization_suggester',
  'failure_predictor'
);

CREATE TYPE training_job_status AS ENUM (
  'pending',
  'preparing_data',
  'training',
  'validating',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE interaction_event_type AS ENUM (
  'prompt_entered',
  'component_generated',
  'schema_edited',
  'workflow_created',
  'dashboard_generated',
  'pattern_deployed',
  'animation_previewed',
  'template_reused',
  'navigation_clicked',
  'widget_configured',
  'process_executed',
  'task_completed',
  'error_encountered',
  'optimization_accepted',
  'feedback_submitted'
);

CREATE TYPE optimization_type AS ENUM (
  'parallel_execution',
  'resource_allocation',
  'caching_strategy',
  'task_reordering',
  'data_flow_optimization',
  'performance_tuning',
  'cost_reduction',
  'error_prevention'
);

-- ============================================================================
-- Core Training Data Tables
-- ============================================================================

-- User interaction events for behavior analysis
CREATE TABLE user_interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id UUID NOT NULL,
  event_type interaction_event_type NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Context
  component_type TEXT,
  feature_area TEXT,
  user_role TEXT,
  
  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- User input/output
  user_input TEXT,
  system_output JSONB DEFAULT '{}'::jsonb,
  
  -- Timing
  response_time_ms INTEGER,
  user_dwell_time_ms INTEGER,
  
  -- Outcome
  success BOOLEAN,
  error_message TEXT,
  
  -- Device/browser context
  device_type TEXT,
  browser TEXT,
  screen_resolution TEXT,
  
  -- Indexes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_interaction_events_user_id ON user_interaction_events(user_id);
CREATE INDEX idx_user_interaction_events_session_id ON user_interaction_events(session_id);
CREATE INDEX idx_user_interaction_events_event_type ON user_interaction_events(event_type);
CREATE INDEX idx_user_interaction_events_timestamp ON user_interaction_events(event_timestamp);
CREATE INDEX idx_user_interaction_events_feature_area ON user_interaction_events(feature_area);

-- Workflow execution features for ML training
CREATE TABLE workflow_execution_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL,
  process_type TEXT NOT NULL,
  
  -- Input features
  input_size_bytes BIGINT,
  input_complexity_score DECIMAL(5,2),
  number_of_tasks INTEGER,
  parallel_tasks_count INTEGER,
  sequential_tasks_count INTEGER,
  
  -- Resource features
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_mb BIGINT,
  network_io_kb BIGINT,
  disk_io_kb BIGINT,
  
  -- Execution features
  total_duration_ms BIGINT,
  queue_time_ms BIGINT,
  execution_time_ms BIGINT,
  idle_time_ms BIGINT,
  
  -- Task features
  tasks_completed INTEGER,
  tasks_failed INTEGER,
  tasks_retried INTEGER,
  average_task_duration_ms BIGINT,
  
  -- Dependency features
  dependency_wait_time_ms BIGINT,
  data_transfer_time_ms BIGINT,
  
  -- Environmental features
  time_of_day INTEGER, -- Hour 0-23
  day_of_week INTEGER, -- 0-6
  system_load DECIMAL(5,2),
  concurrent_workflows INTEGER,
  
  -- Outcome features
  success BOOLEAN,
  error_code TEXT,
  output_size_bytes BIGINT,
  quality_score DECIMAL(5,2),
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_execution_features_instance ON workflow_execution_features(workflow_instance_id);
CREATE INDEX idx_workflow_execution_features_process ON workflow_execution_features(process_type);
CREATE INDEX idx_workflow_execution_features_success ON workflow_execution_features(success);
CREATE INDEX idx_workflow_execution_features_created ON workflow_execution_features(created_at);

-- AI generation feedback for model improvement
CREATE TABLE ai_generation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL,
  generation_type TEXT NOT NULL, -- component|workflow|dashboard|animation|pattern
  
  -- Input
  original_prompt TEXT NOT NULL,
  prompt_tokens INTEGER,
  prompt_complexity_score DECIMAL(5,2),
  
  -- Generated output
  generated_schema JSONB NOT NULL,
  generation_time_ms INTEGER,
  model_name TEXT,
  model_version TEXT,
  model_confidence DECIMAL(5,4),
  
  -- User edits (training signals)
  user_edited BOOLEAN DEFAULT FALSE,
  edit_operations JSONB DEFAULT '[]'::jsonb, -- Array of edit operations
  edits_count INTEGER DEFAULT 0,
  time_to_first_edit_ms INTEGER,
  total_edit_time_ms INTEGER,
  
  -- Final schema (with user edits)
  final_schema JSONB,
  
  -- User feedback
  user_accepted BOOLEAN,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback_text TEXT,
  
  -- Quality metrics
  schema_validity_score DECIMAL(5,2),
  md3_compliance_score DECIMAL(5,2),
  accessibility_score DECIMAL(5,2),
  performance_score DECIMAL(5,2),
  
  -- Usage tracking
  times_reused INTEGER DEFAULT 0,
  deployment_success BOOLEAN,
  
  -- Metadata
  user_id TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_generation_feedback_type ON ai_generation_feedback(generation_type);
CREATE INDEX idx_ai_generation_feedback_accepted ON ai_generation_feedback(user_accepted);
CREATE INDEX idx_ai_generation_feedback_rating ON ai_generation_feedback(user_rating);
CREATE INDEX idx_ai_generation_feedback_created ON ai_generation_feedback(created_at);

-- Pattern usage analytics
CREATE TABLE pattern_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  
  -- Usage context
  user_id TEXT NOT NULL,
  context_data JSONB DEFAULT '{}'::jsonb,
  
  -- Pattern instantiation
  parameters_used JSONB DEFAULT '{}'::jsonb,
  customizations JSONB DEFAULT '{}'::jsonb,
  
  -- Performance
  instantiation_time_ms INTEGER,
  rendering_time_ms INTEGER,
  first_interaction_time_ms INTEGER,
  
  -- User engagement
  interaction_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  feature_usage JSONB DEFAULT '{}'::jsonb,
  
  -- Motion and sound
  animations_triggered JSONB DEFAULT '[]'::jsonb,
  sounds_played JSONB DEFAULT '[]'::jsonb,
  
  -- Outcome
  task_completion_rate DECIMAL(5,2),
  error_rate DECIMAL(5,2),
  user_satisfaction_score DECIMAL(5,2),
  
  -- Reuse
  pattern_cloned BOOLEAN DEFAULT FALSE,
  template_saved BOOLEAN DEFAULT FALSE,
  shared_with_team BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  first_used_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pattern_usage_pattern_id ON pattern_usage_analytics(pattern_id);
CREATE INDEX idx_pattern_usage_user_id ON pattern_usage_analytics(user_id);
CREATE INDEX idx_pattern_usage_type ON pattern_usage_analytics(pattern_type);
CREATE INDEX idx_pattern_usage_created ON pattern_usage_analytics(created_at);

-- Workflow optimization suggestions
CREATE TABLE workflow_optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL,
  
  -- Optimization details
  optimization_type optimization_type NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  
  -- Predicted impact
  predicted_time_saving_ms BIGINT,
  predicted_cost_saving_percent DECIMAL(5,2),
  predicted_resource_reduction_percent DECIMAL(5,2),
  confidence_score DECIMAL(5,4),
  
  -- Suggestion details
  suggested_changes JSONB NOT NULL,
  implementation_complexity TEXT, -- low|medium|high
  risk_level TEXT, -- low|medium|high
  
  -- User action
  user_viewed BOOLEAN DEFAULT FALSE,
  user_accepted BOOLEAN,
  user_rejected BOOLEAN,
  rejection_reason TEXT,
  
  -- Actual impact (if implemented)
  actual_time_saving_ms BIGINT,
  actual_cost_saving_percent DECIMAL(5,2),
  actual_resource_reduction_percent DECIMAL(5,2),
  
  -- Model metadata
  model_version TEXT,
  model_confidence DECIMAL(5,4),
  
  -- Timestamps
  suggested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_optimization_instance ON workflow_optimization_suggestions(workflow_instance_id);
CREATE INDEX idx_workflow_optimization_type ON workflow_optimization_suggestions(optimization_type);
CREATE INDEX idx_workflow_optimization_accepted ON workflow_optimization_suggestions(user_accepted);
CREATE INDEX idx_workflow_optimization_created ON workflow_optimization_suggestions(created_at);

-- Anomaly detection logs
CREATE TABLE anomaly_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Anomaly context
  entity_type TEXT NOT NULL, -- workflow|task|component|pattern
  entity_id UUID NOT NULL,
  
  -- Anomaly details
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- low|medium|high|critical
  description TEXT NOT NULL,
  
  -- Detection
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detection_method TEXT, -- statistical|ml_model|rule_based
  anomaly_score DECIMAL(5,4),
  threshold_value DECIMAL(10,4),
  actual_value DECIMAL(10,4),
  
  -- Context data
  context_features JSONB DEFAULT '{}'::jsonb,
  historical_baseline JSONB DEFAULT '{}'::jsonb,
  
  -- Impact
  impacted_workflows INTEGER,
  impacted_users INTEGER,
  estimated_impact_severity DECIMAL(5,2),
  
  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolution_action TEXT,
  resolved_at TIMESTAMPTZ,
  time_to_resolution_ms BIGINT,
  
  -- False positive feedback
  false_positive BOOLEAN,
  false_positive_reason TEXT,
  
  -- Model metadata
  model_version TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anomaly_detection_entity ON anomaly_detection_logs(entity_type, entity_id);
CREATE INDEX idx_anomaly_detection_severity ON anomaly_detection_logs(severity);
CREATE INDEX idx_anomaly_detection_resolved ON anomaly_detection_logs(resolved);
CREATE INDEX idx_anomaly_detection_created ON anomaly_detection_logs(created_at);

-- ============================================================================
-- ML Model Management Tables
-- ============================================================================

-- ML model metadata
CREATE TABLE ml_model_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL UNIQUE,
  model_type ml_model_type NOT NULL,
  version TEXT NOT NULL,
  
  -- Architecture
  architecture_description TEXT,
  hyperparameters JSONB DEFAULT '{}'::jsonb,
  
  -- Training info
  training_dataset_size INTEGER,
  training_duration_seconds INTEGER,
  training_completed_at TIMESTAMPTZ,
  
  -- Performance metrics
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  mae DECIMAL(10,4), -- Mean Absolute Error
  rmse DECIMAL(10,4), -- Root Mean Squared Error
  r2_score DECIMAL(5,4), -- R-squared
  
  -- Validation metrics
  validation_accuracy DECIMAL(5,4),
  cross_validation_score DECIMAL(5,4),
  
  -- Model artifacts
  model_file_path TEXT,
  model_size_mb DECIMAL(10,2),
  
  -- Deployment
  is_active BOOLEAN DEFAULT FALSE,
  deployed_at TIMESTAMPTZ,
  last_inference_at TIMESTAMPTZ,
  total_inferences BIGINT DEFAULT 0,
  
  -- Performance tracking
  average_inference_time_ms INTEGER,
  p95_inference_time_ms INTEGER,
  p99_inference_time_ms INTEGER,
  
  -- Quality tracking
  user_satisfaction_score DECIMAL(5,2),
  feedback_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ml_model_metadata_type ON ml_model_metadata(model_type);
CREATE INDEX idx_ml_model_metadata_active ON ml_model_metadata(is_active);
CREATE INDEX idx_ml_model_metadata_created ON ml_model_metadata(created_at);

-- ML training jobs
CREATE TABLE ml_training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  model_type ml_model_type NOT NULL,
  status training_job_status NOT NULL DEFAULT 'pending',
  
  -- Configuration
  training_config JSONB DEFAULT '{}'::jsonb,
  hyperparameters JSONB DEFAULT '{}'::jsonb,
  
  -- Dataset
  training_data_query TEXT,
  training_data_size INTEGER,
  validation_data_size INTEGER,
  test_data_size INTEGER,
  
  -- Progress
  current_epoch INTEGER,
  total_epochs INTEGER,
  current_batch INTEGER,
  total_batches INTEGER,
  progress_percent DECIMAL(5,2),
  
  -- Metrics
  current_loss DECIMAL(10,6),
  best_loss DECIMAL(10,6),
  current_accuracy DECIMAL(5,4),
  best_accuracy DECIMAL(5,4),
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_completion_at TIMESTAMPTZ,
  
  -- Resources
  gpu_used BOOLEAN,
  cpu_cores INTEGER,
  memory_allocated_gb DECIMAL(5,2),
  
  -- Output
  output_model_id UUID REFERENCES ml_model_metadata(id),
  training_logs JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ml_training_jobs_status ON ml_training_jobs(status);
CREATE INDEX idx_ml_training_jobs_model_type ON ml_training_jobs(model_type);
CREATE INDEX idx_ml_training_jobs_created ON ml_training_jobs(created_at);

-- ML predictions log
CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ml_model_metadata(id) NOT NULL,
  
  -- Input
  input_features JSONB NOT NULL,
  
  -- Prediction
  prediction_output JSONB NOT NULL,
  confidence_score DECIMAL(5,4),
  
  -- Context
  prediction_context JSONB DEFAULT '{}'::jsonb,
  
  -- Timing
  inference_time_ms INTEGER,
  
  -- Actual outcome (for feedback)
  actual_outcome JSONB,
  prediction_correct BOOLEAN,
  
  -- User feedback
  user_feedback_provided BOOLEAN DEFAULT FALSE,
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
  
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  outcome_recorded_at TIMESTAMPTZ
);

CREATE INDEX idx_ml_predictions_model_id ON ml_predictions(model_id);
CREATE INDEX idx_ml_predictions_correct ON ml_predictions(prediction_correct);
CREATE INDEX idx_ml_predictions_predicted_at ON ml_predictions(predicted_at);

-- Feature importance tracking
CREATE TABLE ml_feature_importance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ml_model_metadata(id) NOT NULL,
  
  feature_name TEXT NOT NULL,
  importance_score DECIMAL(5,4) NOT NULL,
  importance_rank INTEGER,
  
  -- Statistical measures
  correlation_with_target DECIMAL(5,4),
  mutual_information DECIMAL(5,4),
  
  -- Interpretation
  feature_description TEXT,
  impact_direction TEXT, -- positive|negative|neutral
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(model_id, feature_name)
);

CREATE INDEX idx_ml_feature_importance_model ON ml_feature_importance(model_id);
CREATE INDEX idx_ml_feature_importance_score ON ml_feature_importance(importance_score DESC);

-- ============================================================================
-- Materialized Views for ML Training
-- ============================================================================

-- Comprehensive training dataset view
CREATE MATERIALIZED VIEW ml_training_dataset_view AS
SELECT 
  w.id as workflow_id,
  w.process_type,
  wef.input_size_bytes,
  wef.input_complexity_score,
  wef.number_of_tasks,
  wef.parallel_tasks_count,
  wef.sequential_tasks_count,
  wef.cpu_usage_percent,
  wef.memory_usage_mb,
  wef.network_io_kb,
  wef.disk_io_kb,
  wef.total_duration_ms,
  wef.queue_time_ms,
  wef.execution_time_ms,
  wef.tasks_completed,
  wef.tasks_failed,
  wef.average_task_duration_ms,
  wef.time_of_day,
  wef.day_of_week,
  wef.system_load,
  wef.concurrent_workflows,
  wef.success,
  wef.quality_score,
  COUNT(uie.id) as user_interactions_count,
  AVG(uie.response_time_ms) as avg_response_time,
  COUNT(DISTINCT pua.user_id) as unique_users,
  AVG(pua.user_satisfaction_score) as avg_satisfaction_score,
  wef.created_at
FROM workflow_execution_features wef
LEFT JOIN workflow_process_definitions wpd ON wpd.process_type::text = wef.process_type
LEFT JOIN workflow_process_instances w ON w.id = wef.workflow_instance_id
LEFT JOIN user_interaction_events uie ON uie.event_data->>'workflow_id' = wef.workflow_instance_id::text
LEFT JOIN pattern_usage_analytics pua ON pua.pattern_id = wef.workflow_instance_id
GROUP BY 
  w.id, w.process_type, wef.input_size_bytes, wef.input_complexity_score,
  wef.number_of_tasks, wef.parallel_tasks_count, wef.sequential_tasks_count,
  wef.cpu_usage_percent, wef.memory_usage_mb, wef.network_io_kb,
  wef.disk_io_kb, wef.total_duration_ms, wef.queue_time_ms,
  wef.execution_time_ms, wef.tasks_completed, wef.tasks_failed,
  wef.average_task_duration_ms, wef.time_of_day, wef.day_of_week,
  wef.system_load, wef.concurrent_workflows, wef.success,
  wef.quality_score, wef.created_at;

CREATE UNIQUE INDEX idx_ml_training_dataset_view_id ON ml_training_dataset_view(workflow_id);
CREATE INDEX idx_ml_training_dataset_view_process ON ml_training_dataset_view(process_type);
CREATE INDEX idx_ml_training_dataset_view_created ON ml_training_dataset_view(created_at);

-- Workflow performance features aggregated
CREATE MATERIALIZED VIEW workflow_performance_features_view AS
SELECT 
  process_type,
  COUNT(*) as total_executions,
  AVG(total_duration_ms) as avg_duration_ms,
  STDDEV(total_duration_ms) as stddev_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_duration_ms) as median_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_duration_ms) as p95_duration_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY total_duration_ms) as p99_duration_ms,
  AVG(cpu_usage_percent) as avg_cpu_usage,
  AVG(memory_usage_mb) as avg_memory_usage,
  AVG(tasks_completed) as avg_tasks_completed,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) as success_rate,
  AVG(quality_score) as avg_quality_score,
  AVG(number_of_tasks) as avg_task_count,
  AVG(parallel_tasks_count) as avg_parallel_tasks,
  MAX(created_at) as last_execution_at
FROM workflow_execution_features
GROUP BY process_type;

CREATE UNIQUE INDEX idx_workflow_performance_features_process ON workflow_performance_features_view(process_type);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to extract training features from workflow execution
CREATE OR REPLACE FUNCTION extract_workflow_features(
  p_workflow_instance_id UUID
) RETURNS UUID AS $$
DECLARE
  v_feature_id UUID;
  v_instance RECORD;
  v_tasks_count INTEGER;
  v_parallel_count INTEGER;
  v_sequential_count INTEGER;
BEGIN
  -- Get workflow instance data
  SELECT * INTO v_instance
  FROM workflow_process_instances
  WHERE id = p_workflow_instance_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow instance not found: %', p_workflow_instance_id;
  END IF;
  
  -- Count task types
  SELECT 
    COUNT(*),
    SUM(CASE WHEN can_run_parallel THEN 1 ELSE 0 END),
    SUM(CASE WHEN NOT can_run_parallel THEN 1 ELSE 0 END)
  INTO v_tasks_count, v_parallel_count, v_sequential_count
  FROM workflow_task_definitions wtd
  JOIN workflow_process_definitions wpd ON wpd.id = wtd.process_id
  WHERE wpd.id = v_instance.process_id;
  
  -- Insert feature record
  INSERT INTO workflow_execution_features (
    workflow_instance_id,
    process_type,
    number_of_tasks,
    parallel_tasks_count,
    sequential_tasks_count,
    total_duration_ms,
    execution_time_ms,
    success,
    started_at,
    completed_at
  ) VALUES (
    p_workflow_instance_id,
    v_instance.process_type::text,
    v_tasks_count,
    v_parallel_count,
    v_sequential_count,
    EXTRACT(EPOCH FROM (v_instance.completed_at - v_instance.started_at)) * 1000,
    EXTRACT(EPOCH FROM (v_instance.completed_at - v_instance.started_at)) * 1000,
    v_instance.status = 'completed',
    v_instance.started_at,
    v_instance.completed_at
  )
  RETURNING id INTO v_feature_id;
  
  RETURN v_feature_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log user interaction
CREATE OR REPLACE FUNCTION log_user_interaction(
  p_user_id TEXT,
  p_session_id UUID,
  p_event_type interaction_event_type,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_user_input TEXT DEFAULT NULL,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO user_interaction_events (
    user_id,
    session_id,
    event_type,
    event_data,
    user_input,
    response_time_ms,
    success
  ) VALUES (
    p_user_id,
    p_session_id,
    p_event_type,
    p_event_data,
    p_user_input,
    p_response_time_ms,
    p_success
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to suggest workflow optimization
CREATE OR REPLACE FUNCTION suggest_workflow_optimization(
  p_workflow_instance_id UUID,
  p_optimization_type optimization_type,
  p_description TEXT,
  p_suggested_changes JSONB,
  p_predicted_time_saving_ms BIGINT DEFAULT NULL,
  p_confidence_score DECIMAL DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_suggestion_id UUID;
BEGIN
  INSERT INTO workflow_optimization_suggestions (
    workflow_instance_id,
    optimization_type,
    description,
    suggested_changes,
    predicted_time_saving_ms,
    confidence_score
  ) VALUES (
    p_workflow_instance_id,
    p_optimization_type,
    p_description,
    p_suggested_changes,
    p_predicted_time_saving_ms,
    p_confidence_score
  )
  RETURNING id INTO v_suggestion_id;
  
  RETURN v_suggestion_id;
END;
$$ LANGUAGE plpgsql;

-- Function to detect anomaly
CREATE OR REPLACE FUNCTION detect_anomaly(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_anomaly_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_anomaly_score DECIMAL DEFAULT NULL,
  p_context_features JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_anomaly_id UUID;
BEGIN
  INSERT INTO anomaly_detection_logs (
    entity_type,
    entity_id,
    anomaly_type,
    severity,
    description,
    anomaly_score,
    context_features
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_anomaly_type,
    p_severity,
    p_description,
    p_anomaly_score,
    p_context_features
  )
  RETURNING id INTO v_anomaly_id;
  
  RETURN v_anomaly_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_ml_training_views() RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ml_training_dataset_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY workflow_performance_features_view;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers for Automatic Feature Extraction
-- ============================================================================

-- Trigger to automatically extract features when workflow completes
CREATE OR REPLACE FUNCTION trigger_extract_workflow_features()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' OR NEW.status = 'failed' THEN
    PERFORM extract_workflow_features(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_completion_feature_extraction
AFTER UPDATE OF status ON workflow_process_instances
FOR EACH ROW
WHEN (NEW.status IN ('completed', 'failed'))
EXECUTE FUNCTION trigger_extract_workflow_features();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE user_interaction_events IS 'Comprehensive user interaction tracking for behavior analysis and model training';
COMMENT ON TABLE workflow_execution_features IS 'Detailed workflow execution features for predictive modeling';
COMMENT ON TABLE ai_generation_feedback IS 'User feedback on AI-generated content for model improvement';
COMMENT ON TABLE pattern_usage_analytics IS 'Pattern usage metrics for recommendation systems';
COMMENT ON TABLE workflow_optimization_suggestions IS 'ML-generated workflow optimization suggestions';
COMMENT ON TABLE anomaly_detection_logs IS 'Anomaly detection results for failure prediction';
COMMENT ON TABLE ml_model_metadata IS 'Metadata for deployed machine learning models';
COMMENT ON TABLE ml_training_jobs IS 'Training job tracking and management';
COMMENT ON TABLE ml_predictions IS 'Prediction logs for model performance monitoring';
COMMENT ON TABLE ml_feature_importance IS 'Feature importance scores for model interpretability';
COMMENT ON MATERIALIZED VIEW ml_training_dataset_view IS 'Comprehensive dataset for neural network training';
COMMENT ON MATERIALIZED VIEW workflow_performance_features_view IS 'Aggregated workflow performance metrics by process type';

-- ============================================================================
-- Initial Data (Example Training Job Template)
-- ============================================================================

-- Example: Insert a sample training job configuration
INSERT INTO ml_model_metadata (
  model_name,
  model_type,
  version,
  architecture_description,
  hyperparameters,
  is_active
) VALUES (
  'workflow_duration_predictor_v1',
  'duration_predictor',
  '1.0.0',
  'Neural network with 3 hidden layers (128, 64, 32 neurons) for predicting workflow execution duration',
  '{
    "hidden_layers": [128, 64, 32],
    "activation": "relu",
    "optimizer": "adam",
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 100,
    "dropout_rate": 0.2,
    "early_stopping_patience": 10
  }'::jsonb,
  FALSE
);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
GRANT INSERT, UPDATE ON user_interaction_events TO postgres;
GRANT INSERT, UPDATE ON workflow_execution_features TO postgres;
GRANT INSERT, UPDATE ON ai_generation_feedback TO postgres;
GRANT INSERT, UPDATE ON pattern_usage_analytics TO postgres;
GRANT INSERT, UPDATE ON workflow_optimization_suggestions TO postgres;
GRANT INSERT, UPDATE ON anomaly_detection_logs TO postgres;
GRANT ALL ON ml_model_metadata TO postgres;
GRANT ALL ON ml_training_jobs TO postgres;
GRANT ALL ON ml_predictions TO postgres;
GRANT ALL ON ml_feature_importance TO postgres;

-- ============================================================================
-- End of Data Mining and Training Schema
-- ============================================================================
