-- Migration 210: Attribute Configuration and Client Model Management
-- Creates tables for modular attribute configurations, client TensorFlow models, and animation patterns

-- Attribute configurations table
CREATE TABLE IF NOT EXISTS attribute_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_name VARCHAR(255) NOT NULL UNIQUE,
  config JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE attribute_configurations IS 'Stores modular configuration for SEO attributes including validation, scraping, and training rules';
COMMENT ON COLUMN attribute_configurations.config IS 'JSON configuration with validation, scraping, training, and seeding rules';

-- Client TensorFlow models table
CREATE TABLE IF NOT EXISTS client_tensorflow_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(255) NOT NULL,
  model_name VARCHAR(255) NOT NULL DEFAULT 'seo-optimizer',
  model_config JSONB NOT NULL,
  model_path TEXT NOT NULL,
  training_data_count INTEGER DEFAULT 0,
  accuracy FLOAT,
  loss FLOAT,
  precision FLOAT,
  recall FLOAT,
  training_time_ms INTEGER,
  last_trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, model_name)
);

COMMENT ON TABLE client_tensorflow_models IS 'Manages per-client TensorFlow model instances for SEO optimization';
COMMENT ON COLUMN client_tensorflow_models.model_config IS 'Model architecture configuration (input/hidden/output dimensions, learning rate, etc.)';
COMMENT ON COLUMN client_tensorflow_models.model_path IS 'File system path where the model is saved';

-- Animation patterns table
CREATE TABLE IF NOT EXISTS animation_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  styleguide_name VARCHAR(255) NOT NULL,
  styleguide_url TEXT NOT NULL,
  component_type VARCHAR(100) NOT NULL,
  animation_name VARCHAR(255) NOT NULL,
  code_example TEXT,
  css_rules JSONB,
  js_config JSONB,
  easing_function VARCHAR(100),
  duration INTEGER,
  properties JSONB,
  ux_purpose TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE animation_patterns IS 'Stores mined animation patterns from various styleguides for UX enhancement';
COMMENT ON COLUMN animation_patterns.css_rules IS 'CSS animation rules and keyframes';
COMMENT ON COLUMN animation_patterns.js_config IS 'JavaScript animation configuration (anime.js, Framer Motion, etc.)';
COMMENT ON COLUMN animation_patterns.properties IS 'Animated properties (scale, opacity, transform, etc.)';

-- Model training history table
CREATE TABLE IF NOT EXISTS model_training_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES client_tensorflow_models(id) ON DELETE CASCADE,
  training_data_count INTEGER NOT NULL,
  epochs INTEGER NOT NULL,
  batch_size INTEGER NOT NULL,
  learning_rate FLOAT NOT NULL,
  final_loss FLOAT NOT NULL,
  final_accuracy FLOAT,
  training_time_ms INTEGER NOT NULL,
  trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  training_config JSONB,
  notes TEXT
);

COMMENT ON TABLE model_training_history IS 'Tracks training history for each client model';

-- Optimization recommendations table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(255) NOT NULL,
  recommendation_type VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  impact_score INTEGER,
  auto_apply BOOLEAN DEFAULT false,
  attributes_analyzed JSONB,
  recommended_action JSONB,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE optimization_recommendations IS 'Stores AI-generated optimization recommendations for clients';
COMMENT ON COLUMN optimization_recommendations.confidence IS 'Model confidence in recommendation (0-1)';
COMMENT ON COLUMN optimization_recommendations.impact_score IS 'Expected SEO score improvement (0-100)';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attribute_configs_name ON attribute_configurations(attribute_name);
CREATE INDEX IF NOT EXISTS idx_attribute_configs_active ON attribute_configurations(active);
CREATE INDEX IF NOT EXISTS idx_attribute_configs_category ON attribute_configurations((config->>'category'));

CREATE INDEX IF NOT EXISTS idx_client_models_client ON client_tensorflow_models(client_id);
CREATE INDEX IF NOT EXISTS idx_client_models_name ON client_tensorflow_models(model_name);
CREATE INDEX IF NOT EXISTS idx_client_models_last_trained ON client_tensorflow_models(last_trained_at);

CREATE INDEX IF NOT EXISTS idx_animation_patterns_styleguide ON animation_patterns(styleguide_name);
CREATE INDEX IF NOT EXISTS idx_animation_patterns_component ON animation_patterns(component_type);
CREATE INDEX IF NOT EXISTS idx_animation_patterns_animation ON animation_patterns(animation_name);
CREATE INDEX IF NOT EXISTS idx_animation_patterns_tags ON animation_patterns USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_training_history_model ON model_training_history(model_id);
CREATE INDEX IF NOT EXISTS idx_training_history_trained_at ON model_training_history(trained_at);

CREATE INDEX IF NOT EXISTS idx_optimization_recs_client ON optimization_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_type ON optimization_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_priority ON optimization_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_applied ON optimization_recommendations(applied);
CREATE INDEX IF NOT EXISTS idx_optimization_recs_created ON optimization_recommendations(created_at);

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_attribute_configurations_updated_at ON attribute_configurations;
CREATE TRIGGER update_attribute_configurations_updated_at
    BEFORE UPDATE ON attribute_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_tensorflow_models_updated_at ON client_tensorflow_models;
CREATE TRIGGER update_client_tensorflow_models_updated_at
    BEFORE UPDATE ON client_tensorflow_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_animation_patterns_updated_at ON animation_patterns;
CREATE TRIGGER update_animation_patterns_updated_at
    BEFORE UPDATE ON animation_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for attribute configurations (optional, comment out if not needed)
-- This will be populated from config/seo-attributes.json by the application

-- Insert initial configuration metadata
INSERT INTO attribute_configurations (attribute_name, config, version, active)
VALUES 
  ('_metadata', 
   '{"version": "1.0.0", "totalAttributes": 192, "lastUpdated": "2025-01-13", "description": "Modular configuration for all SEO attributes"}',
   1,
   true
  )
ON CONFLICT (attribute_name) DO NOTHING;

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON attribute_configurations TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON client_tensorflow_models TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON animation_patterns TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON model_training_history TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON optimization_recommendations TO your_app_user;

-- Migration complete
SELECT 'Migration 210: Attribute Configuration and Client Model Management - Complete' AS status;
