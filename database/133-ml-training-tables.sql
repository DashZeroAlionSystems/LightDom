-- =====================================================
-- ML Training Pipeline Tables
-- TensorFlow model training, data mining, and feedback
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Training Data Collection
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id TEXT NOT NULL,
  schema_context JSONB,
  prompt_text TEXT NOT NULL,
  generated_code TEXT,
  component_type TEXT,
  user_rating DECIMAL(2,1) CHECK (user_rating >= 0 AND user_rating <= 5),
  feedback_notes TEXT,
  is_validated BOOLEAN DEFAULT false,
  success_metrics JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  validated_at TIMESTAMP
);

CREATE INDEX idx_ml_training_data_template ON ml_training_data(template_id);
CREATE INDEX idx_ml_training_data_rating ON ml_training_data(user_rating);
CREATE INDEX idx_ml_training_data_validated ON ml_training_data(is_validated);

-- =====================================================
-- Training Runs
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_training_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'training', 'completed', 'failed')),
  total_epochs INTEGER NOT NULL,
  current_epoch INTEGER DEFAULT 0,
  examples_count INTEGER NOT NULL,
  batch_size INTEGER NOT NULL,
  validation_split DECIMAL(3,2),
  metrics JSONB DEFAULT '{}',
  final_metrics JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ml_training_runs_status ON ml_training_runs(status);
CREATE INDEX idx_ml_training_runs_started ON ml_training_runs(started_at);

-- =====================================================
-- Model Checkpoints
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_model_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_run_id UUID REFERENCES ml_training_runs(id) ON DELETE CASCADE,
  epoch INTEGER NOT NULL,
  checkpoint_path TEXT NOT NULL,
  metrics JSONB NOT NULL,
  model_size_mb DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ml_model_checkpoints_run ON ml_model_checkpoints(training_run_id);
CREATE INDEX idx_ml_model_checkpoints_epoch ON ml_model_checkpoints(epoch);

-- =====================================================
-- Data Mining Queue
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_training_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_type TEXT NOT NULL CHECK (task_type IN ('schema_analysis', 'component_feedback', 'workflow_pattern', 'usage_analytics')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_ml_training_queue_status ON ml_training_queue(status);
CREATE INDEX idx_ml_training_queue_priority ON ml_training_queue(priority);
CREATE INDEX idx_ml_training_queue_type ON ml_training_queue(task_type);
CREATE INDEX idx_ml_training_queue_created ON ml_training_queue(created_at);

-- =====================================================
-- Feedback Loop
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_feedback_loop (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_id UUID,
  component_code TEXT NOT NULL,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  feedback_type TEXT CHECK (feedback_type IN ('positive', 'negative', 'suggestion')),
  feedback_text TEXT,
  improvement_applied BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ml_feedback_loop_rating ON ml_feedback_loop(user_rating);
CREATE INDEX idx_ml_feedback_loop_type ON ml_feedback_loop(feedback_type);
CREATE INDEX idx_ml_feedback_loop_applied ON ml_feedback_loop(improvement_applied);

-- =====================================================
-- Component Usage Analytics
-- =====================================================

CREATE TABLE IF NOT EXISTS component_usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID,
  component_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  avg_user_rating DECIMAL(2,1),
  schemas_used JSONB DEFAULT '[]',
  common_patterns JSONB DEFAULT '{}',
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_component_usage_type ON component_usage_analytics(component_type);
CREATE INDEX idx_component_usage_count ON component_usage_analytics(usage_count);
CREATE INDEX idx_component_usage_rating ON component_usage_analytics(avg_user_rating);

-- =====================================================
-- Views
-- =====================================================

-- View: Latest training run
CREATE OR REPLACE VIEW latest_training_run AS
SELECT * FROM ml_training_runs
ORDER BY started_at DESC
LIMIT 1;

-- View: Queue statistics
CREATE OR REPLACE VIEW queue_statistics AS
SELECT 
  status,
  task_type,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_processing_time
FROM ml_training_queue
WHERE completed_at IS NOT NULL
GROUP BY status, task_type;

-- View: Training data quality
CREATE OR REPLACE VIEW training_data_quality AS
SELECT 
  template_id,
  COUNT(*) as total_examples,
  COUNT(*) FILTER (WHERE is_validated = true) as validated_examples,
  AVG(user_rating) as avg_rating,
  COUNT(*) FILTER (WHERE user_rating >= 4.0) as high_quality_examples
FROM ml_training_data
GROUP BY template_id;

-- =====================================================
-- Functions
-- =====================================================

-- Function to add training example
CREATE OR REPLACE FUNCTION add_training_example(
  p_template_id TEXT,
  p_schema_context JSONB,
  p_prompt_text TEXT,
  p_generated_code TEXT,
  p_component_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO ml_training_data (
    template_id,
    schema_context,
    prompt_text,
    generated_code,
    component_type
  ) VALUES (
    p_template_id,
    p_schema_context,
    p_prompt_text,
    p_generated_code,
    p_component_type
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to queue mining task
CREATE OR REPLACE FUNCTION queue_mining_task(
  p_task_type TEXT,
  p_priority INTEGER,
  p_input_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO ml_training_queue (
    task_type,
    priority,
    input_data
  ) VALUES (
    p_task_type,
    p_priority,
    p_input_data
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE ml_training_data IS 'Training examples for ML model';
COMMENT ON TABLE ml_training_runs IS 'TensorFlow training run history';
COMMENT ON TABLE ml_model_checkpoints IS 'Model version control and checkpoints';
COMMENT ON TABLE ml_training_queue IS 'Queue for data mining tasks';
COMMENT ON TABLE ml_feedback_loop IS 'User feedback for iterative improvement';
COMMENT ON TABLE component_usage_analytics IS 'Component usage patterns and statistics';
