/**
 * Database Migration: Neural Network Instances Table
 * Creates table for storing per-client neural network instances
 */

-- Create neural network instances table
CREATE TABLE IF NOT EXISTS neural_network_instances (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  model_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'initializing',
  version VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  
  -- Configuration as JSONB for flexibility
  training_config JSONB NOT NULL DEFAULT '{}',
  data_config JSONB NOT NULL DEFAULT '{}',
  architecture JSONB,
  performance JSONB,
  deployment JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN (
    'initializing', 'training', 'ready', 'predicting', 
    'updating', 'paused', 'error', 'archived'
  )),
  CONSTRAINT valid_model_type CHECK (model_type IN (
    'seo_optimization', 'component_generation', 'workflow_prediction',
    'accessibility_improvement', 'ux_pattern_recognition',
    'schema_relationship_learning', 'performance_optimization',
    'design_system_extraction', 'content_generation', 'sentiment_analysis'
  ))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nn_client_id ON neural_network_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_nn_model_type ON neural_network_instances(model_type);
CREATE INDEX IF NOT EXISTS idx_nn_status ON neural_network_instances(status);
CREATE INDEX IF NOT EXISTS idx_nn_created_at ON neural_network_instances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nn_client_model ON neural_network_instances(client_id, model_type);

-- Create a composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_nn_active_instances 
  ON neural_network_instances(client_id, status, model_type)
  WHERE status != 'archived';

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_neural_network_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_nn_instance_updated_at ON neural_network_instances;
CREATE TRIGGER trigger_update_nn_instance_updated_at
  BEFORE UPDATE ON neural_network_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_neural_network_instance_updated_at();

-- Create view for active instances summary
CREATE OR REPLACE VIEW v_active_neural_network_instances AS
SELECT 
  client_id,
  model_type,
  COUNT(*) as instance_count,
  COUNT(*) FILTER (WHERE status = 'ready') as ready_count,
  COUNT(*) FILTER (WHERE status = 'training') as training_count,
  COUNT(*) FILTER (WHERE status = 'error') as error_count,
  AVG((performance->>'accuracy')::FLOAT) as avg_accuracy,
  SUM((performance->>'predictionCount')::INTEGER) as total_predictions
FROM neural_network_instances
WHERE status != 'archived'
GROUP BY client_id, model_type;

-- Create view for instance performance metrics
CREATE OR REPLACE VIEW v_neural_network_performance AS
SELECT 
  id,
  client_id,
  model_type,
  status,
  version,
  (performance->>'accuracy')::FLOAT as accuracy,
  (performance->>'validationAccuracy')::FLOAT as validation_accuracy,
  (performance->>'loss')::FLOAT as loss,
  (performance->>'trainingTime')::INTEGER as training_time_ms,
  (performance->>'inferenceTime')::FLOAT as inference_time_ms,
  (performance->>'predictionCount')::INTEGER as prediction_count,
  (performance->>'lastTrainingDate')::TIMESTAMP as last_training_date,
  created_at,
  updated_at
FROM neural_network_instances
WHERE performance IS NOT NULL
ORDER BY (performance->>'accuracy')::FLOAT DESC NULLS LAST;

-- Add comments for documentation
COMMENT ON TABLE neural_network_instances IS 'Stores per-client neural network instances with isolated training data';
COMMENT ON COLUMN neural_network_instances.id IS 'Unique instance identifier (pattern: nn-{clientId}-{modelType}-{timestamp})';
COMMENT ON COLUMN neural_network_instances.client_id IS 'Client identifier for data isolation';
COMMENT ON COLUMN neural_network_instances.model_type IS 'Type of neural network model';
COMMENT ON COLUMN neural_network_instances.status IS 'Current instance status';
COMMENT ON COLUMN neural_network_instances.version IS 'Model version (semantic versioning)';
COMMENT ON COLUMN neural_network_instances.training_config IS 'Training hyperparameters and configuration';
COMMENT ON COLUMN neural_network_instances.data_config IS 'Data source and isolation configuration';
COMMENT ON COLUMN neural_network_instances.architecture IS 'Neural network architecture specification';
COMMENT ON COLUMN neural_network_instances.performance IS 'Performance metrics (accuracy, loss, etc.)';
COMMENT ON COLUMN neural_network_instances.deployment IS 'Deployment configuration and endpoints';
COMMENT ON COLUMN neural_network_instances.metadata IS 'Additional metadata (name, description, tags, etc.)';
