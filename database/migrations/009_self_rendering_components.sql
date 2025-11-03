-- Self-Rendering Component System Database Schema
-- Migration 009: Component schema linking, Material Design, self-rendering, and fine-tuning

-- Component Schema Links Table
CREATE TABLE IF NOT EXISTS component_schema_links (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  elements JSONB NOT NULL,
  patterns JSONB NOT NULL,
  template_schema_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_component_schema_links_url ON component_schema_links(url);
CREATE INDEX idx_component_schema_links_template ON component_schema_links(template_schema_id);

-- Material Design Schema Table
CREATE TABLE IF NOT EXISTS material_design_schema (
  id SERIAL PRIMARY KEY,
  schema JSONB NOT NULL,
  version TEXT DEFAULT 'MD3',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert complete Material Design 3 schema
INSERT INTO material_design_schema (schema, version) VALUES (
  '{
    "components": {
      "buttons": [
        {"name": "Filled Button", "category": "buttons", "usage": "Primary actions", "elevation": 2, "schema": {"type": "button", "variant": "filled"}},
        {"name": "Outlined Button", "category": "buttons", "usage": "Secondary actions", "elevation": 0, "schema": {"type": "button", "variant": "outlined"}},
        {"name": "Text Button", "category": "buttons", "usage": "Low emphasis actions", "elevation": 0, "schema": {"type": "button", "variant": "text"}}
      ],
      "cards": [
        {"name": "Elevated Card", "category": "cards", "usage": "Content container", "elevation": 1, "schema": {"type": "card", "variant": "elevated"}},
        {"name": "Filled Card", "category": "cards", "usage": "Prominent content", "elevation": 0, "schema": {"type": "card", "variant": "filled"}},
        {"name": "Outlined Card", "category": "cards", "usage": "Subtle content", "elevation": 0, "schema": {"type": "card", "variant": "outlined"}}
      ],
      "chips": [
        {"name": "Input Chip", "category": "chips", "usage": "User input", "schema": {"type": "chip", "variant": "input"}},
        {"name": "Filter Chip", "category": "chips", "usage": "Filtering", "schema": {"type": "chip", "variant": "filter"}},
        {"name": "Suggestion Chip", "category": "chips", "usage": "Suggestions", "schema": {"type": "chip", "variant": "suggestion"}}
      ],
      "dialogs": [
        {"name": "Basic Dialog", "category": "dialogs", "usage": "User decisions", "schema": {"type": "dialog", "variant": "basic"}},
        {"name": "Full Screen Dialog", "category": "dialogs", "usage": "Complex tasks", "schema": {"type": "dialog", "variant": "fullscreen"}}
      ],
      "navigation": [
        {"name": "Navigation Bar", "category": "navigation", "usage": "Primary navigation", "schema": {"type": "navigation", "variant": "bar"}},
        {"name": "Navigation Drawer", "category": "navigation", "usage": "Secondary navigation", "schema": {"type": "navigation", "variant": "drawer"}},
        {"name": "Navigation Rail", "category": "navigation", "usage": "Compact navigation", "schema": {"type": "navigation", "variant": "rail"}}
      ],
      "text_fields": [
        {"name": "Filled TextField", "category": "inputs", "usage": "User input", "schema": {"type": "textfield", "variant": "filled"}},
        {"name": "Outlined TextField", "category": "inputs", "usage": "User input", "schema": {"type": "textfield", "variant": "outlined"}}
      ],
      "lists": [
        {"name": "List Item", "category": "lists", "usage": "Content list", "schema": {"type": "list", "variant": "item"}}
      ],
      "menus": [
        {"name": "Menu", "category": "menus", "usage": "Options display", "schema": {"type": "menu", "variant": "basic"}}
      ],
      "progress": [
        {"name": "Linear Progress", "category": "progress", "usage": "Loading state", "schema": {"type": "progress", "variant": "linear"}},
        {"name": "Circular Progress", "category": "progress", "usage": "Loading state", "schema": {"type": "progress", "variant": "circular"}}
      ],
      "sliders": [
        {"name": "Slider", "category": "sliders", "usage": "Value selection", "schema": {"type": "slider", "variant": "basic"}}
      ],
      "switches": [
        {"name": "Switch", "category": "switches", "usage": "Toggle state", "schema": {"type": "switch", "variant": "basic"}}
      ],
      "tabs": [
        {"name": "Tabs", "category": "tabs", "usage": "Content organization", "schema": {"type": "tabs", "variant": "basic"}}
      ]
    },
    "colorSystem": {
      "primary": {"main": "#6750A4", "light": "#D0BCFF", "dark": "#4F378B", "contrastText": "#FFFFFF"},
      "secondary": {"main": "#625B71", "light": "#E8DEF8", "dark": "#4A4458", "contrastText": "#FFFFFF"},
      "tertiary": {"main": "#7D5260", "light": "#FFD8E4", "dark": "#633B48", "contrastText": "#FFFFFF"},
      "error": {"main": "#B3261E", "light": "#F2B8B5", "dark": "#8C1D18", "contrastText": "#FFFFFF"},
      "neutral": {"main": "#79747E", "light": "#E6E0E9", "dark": "#49454F", "contrastText": "#FFFFFF"}
    },
    "typography": {
      "display": {"large": "57px/64px", "medium": "45px/52px", "small": "36px/44px"},
      "headline": {"large": "32px/40px", "medium": "28px/36px", "small": "24px/32px"},
      "title": {"large": "22px/28px", "medium": "16px/24px", "small": "14px/20px"},
      "body": {"large": "16px/24px", "medium": "14px/20px", "small": "12px/16px"},
      "label": {"large": "14px/20px", "medium": "12px/16px", "small": "11px/16px"}
    },
    "elevation": [
      {"level": 0, "shadow": "none"},
      {"level": 1, "shadow": "0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px rgba(0,0,0,0.15)"},
      {"level": 2, "shadow": "0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px rgba(0,0,0,0.15)"},
      {"level": 3, "shadow": "0px 4px 8px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.3)"},
      {"level": 4, "shadow": "0px 6px 10px rgba(0,0,0,0.15), 0px 1px 18px rgba(0,0,0,0.12)"},
      {"level": 5, "shadow": "0px 8px 12px rgba(0,0,0,0.15), 0px 4px 16px rgba(0,0,0,0.12)"}
    ],
    "shape": {
      "none": "0px",
      "small": "4px",
      "medium": "8px",
      "large": "16px",
      "extraLarge": "28px",
      "full": "9999px"
    },
    "stateLayers": {
      "hover": 0.08,
      "focus": 0.12,
      "pressed": 0.12,
      "dragged": 0.16,
      "disabled": 0.38
    },
    "motion": {
      "duration": {"short1": "50ms", "short2": "100ms", "short3": "150ms", "short4": "200ms", "medium1": "250ms", "medium2": "300ms", "medium3": "350ms", "medium4": "400ms", "long1": "450ms", "long2": "500ms", "long3": "550ms", "long4": "600ms"},
      "easing": {"standard": "cubic-bezier(0.2, 0.0, 0, 1.0)", "emphasized": "cubic-bezier(0.05, 0.7, 0.1, 1.0)"}
    }
  }',
  'MD3'
) ON CONFLICT DO NOTHING;

-- Style Guide Templates Table
CREATE TABLE IF NOT EXISTS style_guide_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  style_guide TEXT NOT NULL,
  framework TEXT NOT NULL,
  framework_version TEXT,
  components JSONB NOT NULL,
  patterns JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_style_guide_templates_style_guide ON style_guide_templates(style_guide);
CREATE INDEX idx_style_guide_templates_framework ON style_guide_templates(framework);

-- Self-Rendering Configs Table
CREATE TABLE IF NOT EXISTS self_rendering_configs (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  style_guide TEXT,
  framework TEXT DEFAULT 'react',
  seo_optimized BOOLEAN DEFAULT true,
  accessible BOOLEAN DEFAULT true,
  responsive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated Websites Table
CREATE TABLE IF NOT EXISTS generated_websites (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  components JSONB NOT NULL,
  pages JSONB NOT NULL,
  styles JSONB NOT NULL,
  build_config JSONB NOT NULL,
  preview JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_websites_created ON generated_websites(created_at DESC);

-- Component Usage Patterns Table
CREATE TABLE IF NOT EXISTS component_usage_patterns (
  id SERIAL PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  elements JSONB NOT NULL,
  framework TEXT NOT NULL,
  material_mapping TEXT,
  usage TEXT,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_component_usage_patterns_name ON component_usage_patterns(pattern_name);
CREATE INDEX idx_component_usage_patterns_frequency ON component_usage_patterns(frequency DESC);

-- Insert common usage patterns
INSERT INTO component_usage_patterns (pattern_name, elements, framework, material_mapping, usage, frequency) VALUES
('navigation', '["nav", "ul", "li", "a"]', 'react', 'NavigationBar', 'Site navigation menu', 50),
('card', '["div.card", "div.card-header", "div.card-body"]', 'react', 'Card', 'Content card display', 45),
('form', '["form", "input", "button"]', 'react', 'TextField', 'User input form', 40),
('hero', '["section.hero", "h1", "p", "button"]', 'react', 'Container', 'Hero section', 35),
('footer', '["footer", "div.container", "p"]', 'react', 'Container', 'Page footer', 30),
('header', '["header", "nav", "div.logo"]', 'react', 'AppBar', 'Page header', 48),
('button', '["button"]', 'react', 'Button', 'Action button', 100),
('input', '["input", "textarea"]', 'react', 'TextField', 'Input field', 90),
('grid', '["div.grid", "div.grid-item"]', 'react', 'Grid', 'Content grid', 38),
('modal', '["div.modal", "div.modal-content"]', 'react', 'Dialog', 'Modal dialog', 25)
ON CONFLICT DO NOTHING;

-- DeepSeek Training Data Table
CREATE TABLE IF NOT EXISTS deepseek_training_data (
  id TEXT PRIMARY KEY,
  input TEXT NOT NULL,
  output JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deepseek_training_data_source ON deepseek_training_data((metadata->>'source'));
CREATE INDEX idx_deepseek_training_data_complexity ON deepseek_training_data((metadata->>'complexity'));
CREATE INDEX idx_deepseek_training_data_quality ON deepseek_training_data(((metadata->>'quality_score')::float) DESC);

-- DeepSeek Fine-Tuning Jobs Table
CREATE TABLE IF NOT EXISTS deepseek_fine_tuning_jobs (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  status TEXT NOT NULL,
  config JSONB NOT NULL,
  metrics JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT
);

CREATE INDEX idx_deepseek_fine_tuning_jobs_status ON deepseek_fine_tuning_jobs(status);
CREATE INDEX idx_deepseek_fine_tuning_jobs_started ON deepseek_fine_tuning_jobs(started_at DESC);

-- Workflow Mining Datasets Table
CREATE TABLE IF NOT EXISTS workflow_mining_datasets (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  samples JSONB NOT NULL,
  statistics JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_mining_datasets_version ON workflow_mining_datasets(version);
CREATE INDEX idx_workflow_mining_datasets_created ON workflow_mining_datasets(created_at DESC);

-- Comments
COMMENT ON TABLE component_schema_links IS 'Links DOM elements to 3D painted/unpainted status and Material Design schemas';
COMMENT ON TABLE material_design_schema IS 'Complete Material Design 3 specification with 60+ components';
COMMENT ON TABLE style_guide_templates IS 'Generated template schemas from detected component patterns';
COMMENT ON TABLE self_rendering_configs IS 'Configuration for self-rendering component generation';
COMMENT ON TABLE generated_websites IS 'Complete generated websites with components, pages, and build configs';
COMMENT ON TABLE component_usage_patterns IS 'Common component usage patterns for training';
COMMENT ON TABLE deepseek_training_data IS 'Training samples for DeepSeek R1 fine-tuning';
COMMENT ON TABLE deepseek_fine_tuning_jobs IS 'Fine-tuning job tracking and metrics';
COMMENT ON TABLE workflow_mining_datasets IS 'Datasets for workflow pattern mining and model training';
