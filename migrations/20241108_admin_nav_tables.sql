-- Admin navigation tables for template watcher

CREATE TABLE IF NOT EXISTS admin_nav_categories (
  category_id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  schema_version TEXT,
  knowledge_graph_attributes JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category, subcategory)
);

CREATE TABLE IF NOT EXISTS admin_nav_templates (
  template_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  schema_version TEXT,
  knowledge_graph_attributes JSONB DEFAULT '{}'::jsonb,
  status_steps JSONB DEFAULT '[]'::jsonb,
  workflow_summary JSONB DEFAULT '{}'::jsonb,
  source_path TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
