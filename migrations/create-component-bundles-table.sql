-- Migration: Create component_bundles table
CREATE TABLE IF NOT EXISTS component_bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  components JSONB NOT NULL,
  config JSONB,
  mock_data_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bundles_created ON component_bundles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundles_name ON component_bundles(name);
CREATE INDEX IF NOT EXISTS idx_bundles_components ON component_bundles USING GIN (components);
