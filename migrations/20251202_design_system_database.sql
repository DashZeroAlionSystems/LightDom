-- Migration: Design System Database Tables
-- Creates tables for storing design system configuration, styleguide rules,
-- Storybook entries, and reusable React components

-- Design System Configuration Table
CREATE TABLE IF NOT EXISTS design_system_config (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  tokens JSONB NOT NULL DEFAULT '{}',
  theme_config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Styleguide Rules Table
CREATE TABLE IF NOT EXISTS styleguide_rules (
  id SERIAL PRIMARY KEY,
  design_system_id INTEGER REFERENCES design_system_config(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- e.g., 'colors', 'typography', 'spacing', 'components'
  rule_name VARCHAR(255) NOT NULL,
  rule_description TEXT,
  rule_config JSONB NOT NULL DEFAULT '{}',
  examples JSONB DEFAULT '[]',
  severity VARCHAR(20) DEFAULT 'warning', -- 'error', 'warning', 'info'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_system_id, category, rule_name)
);

-- Design System Components Table (stores React component code)
CREATE TABLE IF NOT EXISTS design_system_components (
  id SERIAL PRIMARY KEY,
  design_system_id INTEGER REFERENCES design_system_config(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  category VARCHAR(100), -- e.g., 'atoms', 'molecules', 'organisms', 'templates'
  component_code TEXT NOT NULL, -- The actual React component code
  props_schema JSONB DEFAULT '{}', -- TypeScript/PropTypes schema
  default_props JSONB DEFAULT '{}',
  css_styles TEXT, -- Component-specific CSS
  dependencies JSONB DEFAULT '[]', -- npm package dependencies
  internal_dependencies TEXT[] DEFAULT '{}', -- references to other components by name
  usage_examples JSONB DEFAULT '[]',
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'published', 'deprecated'
  preview_url TEXT,
  figma_link TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_system_id, name, version)
);

-- Storybook Entries Table (must come after design_system_components)
CREATE TABLE IF NOT EXISTS storybook_entries (
  id SERIAL PRIMARY KEY,
  design_system_id INTEGER REFERENCES design_system_config(id) ON DELETE SET NULL,
  component_id INTEGER REFERENCES design_system_components(id) ON DELETE CASCADE,
  story_name VARCHAR(255) NOT NULL,
  story_path VARCHAR(500) NOT NULL, -- e.g., 'Design System/Components/Button'
  story_kind VARCHAR(100) NOT NULL, -- e.g., 'story', 'docs', 'autodocs'
  story_config JSONB NOT NULL DEFAULT '{}',
  args_config JSONB DEFAULT '{}',
  decorators JSONB DEFAULT '[]',
  parameters JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY['autodocs'],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_path, story_name)
);

-- Component Usage Analytics
CREATE TABLE IF NOT EXISTS component_usage_analytics (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES design_system_components(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  used_in_projects JSONB DEFAULT '[]',
  user_ratings JSONB DEFAULT '[]',
  avg_rating FLOAT DEFAULT 0,
  feedback TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Design System Themes
CREATE TABLE IF NOT EXISTS design_system_themes (
  id SERIAL PRIMARY KEY,
  design_system_id INTEGER REFERENCES design_system_config(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme_type VARCHAR(50) DEFAULT 'light', -- 'light', 'dark', 'custom'
  color_tokens JSONB NOT NULL DEFAULT '{}',
  typography_tokens JSONB DEFAULT '{}',
  spacing_tokens JSONB DEFAULT '{}',
  elevation_tokens JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_system_id, name)
);

-- Component Variants
CREATE TABLE IF NOT EXISTS component_variants (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES design_system_components(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  variant_props JSONB NOT NULL DEFAULT '{}',
  variant_code TEXT, -- Override code if different from base
  description TEXT,
  preview_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(component_id, variant_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_design_system_config_name ON design_system_config(name);
CREATE INDEX IF NOT EXISTS idx_design_system_config_active ON design_system_config(active);
CREATE INDEX IF NOT EXISTS idx_styleguide_rules_category ON styleguide_rules(category);
CREATE INDEX IF NOT EXISTS idx_styleguide_rules_design_system ON styleguide_rules(design_system_id);
CREATE INDEX IF NOT EXISTS idx_storybook_entries_path ON storybook_entries(story_path);
CREATE INDEX IF NOT EXISTS idx_storybook_entries_component ON storybook_entries(component_id);
CREATE INDEX IF NOT EXISTS idx_components_category ON design_system_components(category);
CREATE INDEX IF NOT EXISTS idx_components_status ON design_system_components(status);
CREATE INDEX IF NOT EXISTS idx_components_design_system ON design_system_components(design_system_id);
CREATE INDEX IF NOT EXISTS idx_components_name ON design_system_components(name);
CREATE INDEX IF NOT EXISTS idx_components_tags ON design_system_components USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_themes_design_system ON design_system_themes(design_system_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_design_system_config_updated_at ON design_system_config;
CREATE TRIGGER update_design_system_config_updated_at
    BEFORE UPDATE ON design_system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_styleguide_rules_updated_at ON styleguide_rules;
CREATE TRIGGER update_styleguide_rules_updated_at
    BEFORE UPDATE ON styleguide_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_storybook_entries_updated_at ON storybook_entries;
CREATE TRIGGER update_storybook_entries_updated_at
    BEFORE UPDATE ON storybook_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_system_components_updated_at ON design_system_components;
CREATE TRIGGER update_design_system_components_updated_at
    BEFORE UPDATE ON design_system_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_system_themes_updated_at ON design_system_themes;
CREATE TRIGGER update_design_system_themes_updated_at
    BEFORE UPDATE ON design_system_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
