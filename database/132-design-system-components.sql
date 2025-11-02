-- ---------------------------------------------------------------------------
-- Design System Component Schema
-- Atomic design pattern: Atoms → Components → Dashboards → Workflows
-- Schema-based component generation and linking system
-- ---------------------------------------------------------------------------

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- ---------------------------------------------------------------------------
-- Component Types and Enums
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'component_type') THEN
    CREATE TYPE component_type AS ENUM (
      'atom',           -- Basic UI elements (button, input, icon)
      'molecule',       -- Simple groups (form field, search bar)
      'organism',       -- Complex components (navigation, card)
      'template',       -- Page layouts
      'page'            -- Full pages
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'field_type') THEN
    CREATE TYPE field_type AS ENUM (
      'string',
      'number',
      'boolean',
      'select',
      'multiselect',
      'date',
      'datetime',
      'color',
      'json',
      'array',
      'object',
      'reference'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'validation_type') THEN
    CREATE TYPE validation_type AS ENUM (
      'required',
      'minLength',
      'maxLength',
      'pattern',
      'email',
      'url',
      'min',
      'max',
      'custom'
    );
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Enhanced Atom Definitions (Design System Tokens)
-- ---------------------------------------------------------------------------

-- Drop and recreate with enhanced schema
DROP TABLE IF EXISTS atom_definitions CASCADE;

CREATE TABLE atom_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- button, input, icon, typography, spacing, color
  description TEXT,
  
  -- Schema definition for this atom
  schema JSONB DEFAULT '{}'::jsonb,
  
  -- Design tokens (colors, spacing, typography, etc.)
  design_tokens JSONB DEFAULT '{}'::jsonb,
  
  -- Extraction rules for data mining from existing components
  extraction_rules JSONB DEFAULT '{}'::jsonb,
  
  -- Component code template (React, HTML, etc.)
  template TEXT,
  
  -- Styling information
  styles JSONB DEFAULT '{}'::jsonb,
  
  -- Props/attributes definition
  props JSONB DEFAULT '[]'::jsonb,
  
  -- Accessibility metadata
  a11y_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Usage statistics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (name, category, version)
);

CREATE INDEX idx_atom_definitions_category ON atom_definitions(category);
CREATE INDEX idx_atom_definitions_tags ON atom_definitions USING gin(tags);
CREATE INDEX idx_atom_definitions_search ON atom_definitions USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ---------------------------------------------------------------------------
-- Enhanced Component Definitions
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS component_definitions CASCADE;

CREATE TABLE component_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type component_type NOT NULL DEFAULT 'organism',
  variant TEXT DEFAULT 'default',
  description TEXT,
  
  -- Full component schema
  schema JSONB DEFAULT '{}'::jsonb,
  
  -- Component metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Props interface definition
  props_schema JSONB DEFAULT '{}'::jsonb,
  
  -- Component template/code
  template TEXT,
  
  -- Styling information
  styles JSONB DEFAULT '{}'::jsonb,
  
  -- State management
  state_schema JSONB DEFAULT '{}'::jsonb,
  
  -- Event handlers
  events JSONB DEFAULT '[]'::jsonb,
  
  -- Dependencies on other components
  dependencies JSONB DEFAULT '[]'::jsonb,
  
  -- Category for organization
  category TEXT,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  parent_version_id UUID REFERENCES component_definitions(id),
  
  -- Tags for search and filtering
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Publishing status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (name, variant, version)
);

CREATE INDEX idx_component_definitions_type ON component_definitions(type);
CREATE INDEX idx_component_definitions_category ON component_definitions(category);
CREATE INDEX idx_component_definitions_tags ON component_definitions USING gin(tags);
CREATE INDEX idx_component_definitions_search ON component_definitions USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_component_definitions_published ON component_definitions(is_published) WHERE is_published = TRUE;

-- ---------------------------------------------------------------------------
-- Component-Atom Relationships
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS component_atoms CASCADE;

CREATE TABLE component_atoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_definitions(id) ON DELETE CASCADE,
  atom_id UUID NOT NULL REFERENCES atom_definitions(id) ON DELETE CASCADE,
  
  -- Role/purpose of this atom in the component
  role TEXT,
  
  -- Property binding configuration
  binding JSONB DEFAULT '{}'::jsonb,
  
  -- Slot or position information
  slot TEXT,
  position INTEGER DEFAULT 0,
  
  -- Conditional rendering rules
  conditions JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (component_id, atom_id, slot)
);

CREATE INDEX idx_component_atoms_component ON component_atoms(component_id);
CREATE INDEX idx_component_atoms_atom ON component_atoms(atom_id);

-- ---------------------------------------------------------------------------
-- Schema Fields (for dynamic form generation)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schema_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to parent (atom or component)
  parent_id UUID NOT NULL,
  parent_type TEXT NOT NULL, -- 'atom' or 'component'
  
  -- Field definition
  field_key TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type field_type NOT NULL,
  description TEXT,
  
  -- Options for select/multiselect
  options JSONB DEFAULT '[]'::jsonb,
  
  -- Default value
  default_value JSONB,
  
  -- Validation rules
  validations JSONB DEFAULT '[]'::jsonb,
  
  -- UI hints
  ui_hints JSONB DEFAULT '{}'::jsonb,
  
  -- Grouping and ordering
  field_group TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Conditional display
  display_conditions JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (parent_id, parent_type, field_key)
);

CREATE INDEX idx_schema_fields_parent ON schema_fields(parent_id, parent_type);
CREATE INDEX idx_schema_fields_group ON schema_fields(field_group);

-- ---------------------------------------------------------------------------
-- Schema Relationships (linking between schemas)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schema_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source schema
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'atom', 'component', 'dashboard', 'workflow'
  
  -- Target schema
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  
  -- Relationship type
  relationship_type TEXT NOT NULL, -- 'contains', 'extends', 'references', 'uses'
  
  -- Relationship metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Field mappings
  field_mappings JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (source_id, source_type, target_id, target_type, relationship_type)
);

CREATE INDEX idx_schema_relationships_source ON schema_relationships(source_id, source_type);
CREATE INDEX idx_schema_relationships_target ON schema_relationships(target_id, target_type);

-- ---------------------------------------------------------------------------
-- Enhanced Dashboard Definitions
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS dashboard_definitions CASCADE;

CREATE TABLE dashboard_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Dashboard type
  domain TEXT, -- 'admin', 'client', 'workflow', 'analytics'
  
  -- Layout configuration
  layout JSONB DEFAULT '{}'::jsonb,
  
  -- Grid system configuration
  grid_config JSONB DEFAULT '{}'::jsonb,
  
  -- Dashboard metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Access control
  access_level TEXT DEFAULT 'user', -- 'admin', 'user', 'public'
  allowed_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Customization options
  is_customizable BOOLEAN DEFAULT TRUE,
  customization_schema JSONB DEFAULT '{}'::jsonb,
  
  -- Version control
  version TEXT DEFAULT '1.0.0',
  parent_version_id UUID REFERENCES dashboard_definitions(id),
  
  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (name, version)
);

CREATE INDEX idx_dashboard_definitions_domain ON dashboard_definitions(domain);
CREATE INDEX idx_dashboard_definitions_access_level ON dashboard_definitions(access_level);
CREATE INDEX idx_dashboard_definitions_tags ON dashboard_definitions USING gin(tags);
CREATE INDEX idx_dashboard_definitions_published ON dashboard_definitions(is_published) WHERE is_published = TRUE;

-- ---------------------------------------------------------------------------
-- Dashboard-Component Relationships
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS dashboard_components CASCADE;

CREATE TABLE dashboard_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboard_definitions(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES component_definitions(id) ON DELETE CASCADE,
  
  -- Position in dashboard
  position JSONB DEFAULT '{}'::jsonb, -- { x, y, w, h }
  
  -- Component instance settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Data binding configuration
  data_bindings JSONB DEFAULT '{}'::jsonb,
  
  -- Visibility rules
  visibility_conditions JSONB DEFAULT '{}'::jsonb,
  
  -- Sort order
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dashboard_components_dashboard ON dashboard_components(dashboard_id);
CREATE INDEX idx_dashboard_components_component ON dashboard_components(component_id);

-- ---------------------------------------------------------------------------
-- AI-Generated Component History (for learning)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_component_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User prompt
  prompt TEXT NOT NULL,
  
  -- Context provided
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Generated component ID
  component_id UUID REFERENCES component_definitions(id) ON DELETE SET NULL,
  
  -- Generated schema
  generated_schema JSONB NOT NULL,
  
  -- User edits made after generation
  user_edits JSONB DEFAULT '{}'::jsonb,
  
  -- Acceptance status
  accepted BOOLEAN DEFAULT FALSE,
  rejected BOOLEAN DEFAULT FALSE,
  
  -- Feedback
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Model information
  model_name TEXT,
  model_version TEXT,
  
  -- Timing
  generation_time_ms INTEGER,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_component_generations_component ON ai_component_generations(component_id);
CREATE INDEX idx_ai_component_generations_accepted ON ai_component_generations(accepted);
CREATE INDEX idx_ai_component_generations_prompt_search ON ai_component_generations USING gin(to_tsvector('english', prompt));

-- ---------------------------------------------------------------------------
-- Component Training Data
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS component_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Component reference
  component_id UUID REFERENCES component_definitions(id) ON DELETE CASCADE,
  
  -- Training category
  category TEXT NOT NULL, -- 'attribute_mapping', 'style_preference', 'usage_pattern'
  
  -- Input/output pairs for training
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  
  -- Context
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Quality score
  quality_score NUMERIC(3, 2) CHECK (quality_score >= 0 AND quality_score <= 1),
  
  -- Usage count (how many times used for training)
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_component_training_data_component ON component_training_data(component_id);
CREATE INDEX idx_component_training_data_category ON component_training_data(category);
CREATE INDEX idx_component_training_data_quality ON component_training_data(quality_score DESC);

-- ---------------------------------------------------------------------------
-- Workflow-Dashboard Relationships (from earlier schema)
-- ---------------------------------------------------------------------------

-- Already exists from 129-workflow-training.sql, adding index
CREATE INDEX IF NOT EXISTS idx_workflow_dashboards_workflow ON workflow_dashboards(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_dashboards_dashboard ON workflow_dashboards(dashboard_id);

-- ---------------------------------------------------------------------------
-- Triggers for updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_atom_definitions_updated_at') THEN
    CREATE TRIGGER trg_atom_definitions_updated_at
      BEFORE UPDATE ON atom_definitions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_component_definitions_updated_at') THEN
    CREATE TRIGGER trg_component_definitions_updated_at
      BEFORE UPDATE ON component_definitions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dashboard_definitions_updated_at') THEN
    CREATE TRIGGER trg_dashboard_definitions_updated_at
      BEFORE UPDATE ON dashboard_definitions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dashboard_components_updated_at') THEN
    CREATE TRIGGER trg_dashboard_components_updated_at
      BEFORE UPDATE ON dashboard_components
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Usage tracking triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE atom_definitions 
  SET usage_count = usage_count + 1, last_used_at = NOW()
  WHERE id = NEW.atom_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_component_atoms_usage') THEN
    CREATE TRIGGER trg_component_atoms_usage
      AFTER INSERT ON component_atoms
      FOR EACH ROW EXECUTE FUNCTION increment_usage_count();
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Seed data: Basic Material Design 3 atoms
-- ---------------------------------------------------------------------------

INSERT INTO atom_definitions (name, category, description, schema, design_tokens, props, tags) VALUES
  (
    'Button',
    'action',
    'Material Design 3 button component',
    '{"type": "button", "variants": ["filled", "outlined", "text", "elevated", "filled-tonal"]}'::jsonb,
    '{
      "colors": {
        "filled": "var(--md-sys-color-primary)",
        "outlined": "var(--md-sys-color-outline)",
        "text": "transparent"
      },
      "spacing": {
        "padding": "10px 24px",
        "gap": "8px"
      },
      "typography": {
        "fontFamily": "var(--md-sys-typescale-label-large-font)",
        "fontSize": "14px",
        "fontWeight": "500",
        "lineHeight": "20px"
      },
      "shape": {
        "borderRadius": "20px"
      }
    }'::jsonb,
    '[
      {"name": "variant", "type": "select", "options": ["filled", "outlined", "text", "elevated", "filled-tonal"], "default": "filled"},
      {"name": "size", "type": "select", "options": ["sm", "md", "lg"], "default": "md"},
      {"name": "disabled", "type": "boolean", "default": false},
      {"name": "isLoading", "type": "boolean", "default": false},
      {"name": "leftIcon", "type": "component", "optional": true},
      {"name": "rightIcon", "type": "component", "optional": true}
    ]'::jsonb,
    ARRAY['button', 'action', 'material-design']
  ),
  (
    'Input',
    'input',
    'Material Design 3 text input field',
    '{"type": "input", "variants": ["filled", "outlined"]}'::jsonb,
    '{
      "colors": {
        "filled": "var(--md-sys-color-surface-container-highest)",
        "outlined": "transparent"
      },
      "spacing": {
        "padding": "16px",
        "gap": "8px"
      },
      "typography": {
        "fontFamily": "var(--md-sys-typescale-body-large-font)",
        "fontSize": "16px",
        "lineHeight": "24px"
      },
      "shape": {
        "borderRadius": "4px"
      }
    }'::jsonb,
    '[
      {"name": "variant", "type": "select", "options": ["filled", "outlined"], "default": "outlined"},
      {"name": "label", "type": "string", "required": true},
      {"name": "placeholder", "type": "string", "optional": true},
      {"name": "disabled", "type": "boolean", "default": false},
      {"name": "error", "type": "string", "optional": true},
      {"name": "leftIcon", "type": "component", "optional": true},
      {"name": "rightIcon", "type": "component", "optional": true}
    ]'::jsonb,
    ARRAY['input', 'form', 'material-design']
  ),
  (
    'Card',
    'surface',
    'Material Design 3 card container',
    '{"type": "card", "variants": ["filled", "elevated", "outlined"]}'::jsonb,
    '{
      "colors": {
        "filled": "var(--md-sys-color-surface-container)",
        "elevated": "var(--md-sys-color-surface-container-low)",
        "outlined": "var(--md-sys-color-surface)"
      },
      "elevation": {
        "filled": "0",
        "elevated": "1",
        "outlined": "0"
      },
      "spacing": {
        "padding": "16px",
        "gap": "16px"
      },
      "shape": {
        "borderRadius": "12px"
      }
    }'::jsonb,
    '[
      {"name": "variant", "type": "select", "options": ["filled", "elevated", "outlined"], "default": "elevated"},
      {"name": "padding", "type": "select", "options": ["none", "sm", "md", "lg"], "default": "md"}
    ]'::jsonb,
    ARRAY['card', 'surface', 'container', 'material-design']
  )
ON CONFLICT (name, category, version) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Views for easy querying
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_component_hierarchy AS
SELECT 
  c.id AS component_id,
  c.name AS component_name,
  c.type AS component_type,
  a.id AS atom_id,
  a.name AS atom_name,
  a.category AS atom_category,
  ca.role,
  ca.slot,
  ca.position
FROM component_definitions c
LEFT JOIN component_atoms ca ON ca.component_id = c.id
LEFT JOIN atom_definitions a ON a.id = ca.atom_id
ORDER BY c.name, ca.position;

CREATE OR REPLACE VIEW v_dashboard_structure AS
SELECT 
  d.id AS dashboard_id,
  d.name AS dashboard_name,
  d.domain,
  c.id AS component_id,
  c.name AS component_name,
  c.type AS component_type,
  dc.position,
  dc.sort_order
FROM dashboard_definitions d
LEFT JOIN dashboard_components dc ON dc.dashboard_id = d.id
LEFT JOIN component_definitions c ON c.id = dc.component_id
ORDER BY d.name, dc.sort_order;

COMMENT ON TABLE atom_definitions IS 'Atomic design elements - smallest UI components';
COMMENT ON TABLE component_definitions IS 'Composite components built from atoms';
COMMENT ON TABLE dashboard_definitions IS 'Dashboard layouts composed of components';
COMMENT ON TABLE schema_fields IS 'Dynamic field definitions for schema-driven forms';
COMMENT ON TABLE schema_relationships IS 'Relationships between different schema types';
COMMENT ON TABLE ai_component_generations IS 'AI-generated component history for learning';
COMMENT ON TABLE component_training_data IS 'Training data for improving component generation';
