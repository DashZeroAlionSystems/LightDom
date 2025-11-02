-- ============================================================================
-- Dashboard Generator Schema
-- Extends the design system with dashboard-specific tables
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- Dashboard Generator Types
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dashboard_layout_type') THEN
    CREATE TYPE dashboard_layout_type AS ENUM (
      'grid',
      'flex',
      'masonry',
      'split',
      'tabs',
      'sidebar',
      'custom'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'widget_type') THEN
    CREATE TYPE widget_type AS ENUM (
      'stat_card',
      'chart',
      'table',
      'list',
      'calendar',
      'timeline',
      'kanban',
      'form',
      'map',
      'custom'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chart_type') THEN
    CREATE TYPE chart_type AS ENUM (
      'line',
      'bar',
      'pie',
      'donut',
      'area',
      'scatter',
      'radar',
      'heatmap',
      'funnel',
      'gauge'
    );
  END IF;
END$$;

-- ============================================================================
-- Generated Dashboards Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL, -- Main topic/subject of the dashboard
  prompt TEXT NOT NULL, -- Original AI prompt
  
  -- Layout configuration
  layout_type dashboard_layout_type DEFAULT 'grid',
  layout_config JSONB DEFAULT '{}'::jsonb, -- Grid columns, gap, etc.
  
  -- Dashboard schema
  schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of widget configurations
  
  -- Metadata
  created_by UUID, -- Reference to user
  is_published BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  version TEXT DEFAULT '1.0.0',
  tags TEXT[] DEFAULT '{}'::text[],
  
  -- AI generation metadata
  ai_generated BOOLEAN DEFAULT TRUE,
  ai_model TEXT DEFAULT 'deepseek-r1',
  ai_reasoning TEXT, -- AI's reasoning for dashboard structure
  user_edits JSONB DEFAULT '{}'::jsonb, -- Track user modifications
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  clone_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for generated_dashboards
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_subject ON generated_dashboards(subject);
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_created_by ON generated_dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_is_published ON generated_dashboards(is_published);
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_is_template ON generated_dashboards(is_template);
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_tags ON generated_dashboards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_schema ON generated_dashboards USING GIN(schema);
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_created_at ON generated_dashboards(created_at);

-- Full-text search on dashboards
CREATE INDEX IF NOT EXISTS idx_generated_dashboards_search 
  ON generated_dashboards USING GIN(to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(subject, '') || ' ' || 
    coalesce(prompt, '')
  ));

-- ============================================================================
-- Dashboard Widgets Table (tracks individual widgets)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES generated_dashboards(id) ON DELETE CASCADE,
  
  -- Widget configuration
  widget_type widget_type NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Position and size
  grid_row INTEGER,
  grid_column INTEGER,
  grid_row_span INTEGER DEFAULT 1,
  grid_column_span INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  
  -- Widget schema
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_source JSONB DEFAULT '{}'::jsonb, -- API endpoint, query, etc.
  
  -- Chart-specific
  chart_type chart_type,
  chart_config JSONB DEFAULT '{}'::jsonb,
  
  -- Interactivity
  is_interactive BOOLEAN DEFAULT TRUE,
  refresh_interval INTEGER, -- Seconds
  filters JSONB DEFAULT '{}'::jsonb,
  
  -- Component linking
  component_id UUID, -- Reference to component_definitions
  atom_ids UUID[], -- References to atom_definitions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_widget_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_component_id ON dashboard_widgets(component_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_config ON dashboard_widgets USING GIN(config);

-- ============================================================================
-- Dashboard Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'analytics', 'monitoring', 'crm', 'ecommerce', etc.
  
  -- Template configuration
  template_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '{}'::jsonb, -- Template variables for customization
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5),
  
  -- Metadata
  is_official BOOLEAN DEFAULT FALSE,
  created_by UUID,
  tags TEXT[] DEFAULT '{}'::text[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for dashboard_templates
CREATE INDEX IF NOT EXISTS idx_dashboard_templates_category ON dashboard_templates(category);
CREATE INDEX IF NOT EXISTS idx_dashboard_templates_is_official ON dashboard_templates(is_official);
CREATE INDEX IF NOT EXISTS idx_dashboard_templates_tags ON dashboard_templates USING GIN(tags);

-- ============================================================================
-- Dashboard Component Relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_component_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES generated_dashboards(id) ON DELETE CASCADE,
  component_id UUID, -- Reference to component_definitions
  atom_id UUID, -- Reference to atom_definitions
  
  -- Usage context
  usage_context TEXT, -- Where/how the component is used
  configuration JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for dashboard_component_links
CREATE INDEX IF NOT EXISTS idx_dashboard_component_links_dashboard_id ON dashboard_component_links(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_component_links_component_id ON dashboard_component_links(component_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_component_links_atom_id ON dashboard_component_links(atom_id);

-- ============================================================================
-- AI Dashboard Generation History
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_dashboard_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  subject TEXT NOT NULL,
  
  -- Generation details
  generated_dashboard_id UUID REFERENCES generated_dashboards(id) ON DELETE SET NULL,
  generated_schema JSONB NOT NULL,
  ai_reasoning TEXT,
  ai_model TEXT DEFAULT 'deepseek-r1',
  
  -- User feedback
  user_edits JSONB DEFAULT '{}'::jsonb,
  accepted BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  
  -- Generation performance
  generation_time_ms INTEGER,
  tokens_used INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ai_dashboard_generations
CREATE INDEX IF NOT EXISTS idx_ai_dashboard_generations_subject ON ai_dashboard_generations(subject);
CREATE INDEX IF NOT EXISTS idx_ai_dashboard_generations_dashboard_id ON ai_dashboard_generations(generated_dashboard_id);
CREATE INDEX IF NOT EXISTS idx_ai_dashboard_generations_accepted ON ai_dashboard_generations(accepted);
CREATE INDEX IF NOT EXISTS idx_ai_dashboard_generations_created_at ON ai_dashboard_generations(created_at);

-- Full-text search on AI generations
CREATE INDEX IF NOT EXISTS idx_ai_dashboard_generations_search 
  ON ai_dashboard_generations USING GIN(to_tsvector('english', 
    coalesce(prompt, '') || ' ' || 
    coalesce(subject, '') || ' ' || 
    coalesce(feedback, '')
  ));

-- ============================================================================
-- Dashboard Analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES generated_dashboards(id) ON DELETE CASCADE,
  
  -- Event tracking
  event_type TEXT NOT NULL, -- 'view', 'clone', 'edit', 'publish', 'share'
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- User context
  user_id UUID,
  session_id TEXT,
  
  -- Technical details
  user_agent TEXT,
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for dashboard_analytics
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_dashboard_id ON dashboard_analytics(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_event_type ON dashboard_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_user_id ON dashboard_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_created_at ON dashboard_analytics(created_at);

-- ============================================================================
-- Materialized Views for Analytics
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_popularity AS
SELECT 
  gd.id,
  gd.name,
  gd.subject,
  gd.created_at,
  gd.view_count,
  gd.clone_count,
  gd.rating,
  COUNT(DISTINCT da.user_id) as unique_users,
  COUNT(CASE WHEN da.event_type = 'view' THEN 1 END) as total_views,
  COUNT(CASE WHEN da.event_type = 'clone' THEN 1 END) as total_clones,
  COUNT(CASE WHEN da.event_type = 'edit' THEN 1 END) as total_edits,
  MAX(da.created_at) as last_activity
FROM generated_dashboards gd
LEFT JOIN dashboard_analytics da ON gd.id = da.dashboard_id
GROUP BY gd.id, gd.name, gd.subject, gd.created_at, gd.view_count, gd.clone_count, gd.rating;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_popularity_id ON dashboard_popularity(id);
CREATE INDEX IF NOT EXISTS idx_dashboard_popularity_subject ON dashboard_popularity(subject);
CREATE INDEX IF NOT EXISTS idx_dashboard_popularity_total_views ON dashboard_popularity(total_views DESC);

-- View for AI generation quality
CREATE MATERIALIZED VIEW IF NOT EXISTS ai_generation_quality AS
SELECT 
  ai_model,
  subject,
  COUNT(*) as total_generations,
  COUNT(CASE WHEN accepted = TRUE THEN 1 END) as accepted_count,
  ROUND(COUNT(CASE WHEN accepted = TRUE THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as acceptance_rate,
  AVG(rating) as avg_rating,
  AVG(generation_time_ms) as avg_generation_time_ms,
  AVG(tokens_used) as avg_tokens_used,
  MAX(created_at) as last_generation
FROM ai_dashboard_generations
GROUP BY ai_model, subject;

CREATE INDEX IF NOT EXISTS idx_ai_generation_quality_model ON ai_generation_quality(ai_model);
CREATE INDEX IF NOT EXISTS idx_ai_generation_quality_subject ON ai_generation_quality(subject);
CREATE INDEX IF NOT EXISTS idx_ai_generation_quality_acceptance_rate ON ai_generation_quality(acceptance_rate DESC);

-- ============================================================================
-- Triggers for Updated Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generated_dashboards_updated_at BEFORE UPDATE ON generated_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_templates_updated_at BEFORE UPDATE ON dashboard_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Dashboard Templates
-- ============================================================================

-- Analytics Dashboard Template
INSERT INTO dashboard_templates (name, description, category, template_schema, default_widgets, is_official, tags)
VALUES (
  'Analytics Dashboard',
  'Comprehensive analytics dashboard with key metrics, charts, and trends',
  'analytics',
  '{
    "layout": "grid",
    "columns": 4,
    "gap": "md",
    "theme": "material-you"
  }'::jsonb,
  '[
    {
      "type": "stat_card",
      "title": "Total Users",
      "config": {"icon": "users", "trend": true, "comparison": true}
    },
    {
      "type": "stat_card",
      "title": "Revenue",
      "config": {"icon": "dollar", "trend": true, "comparison": true}
    },
    {
      "type": "chart",
      "title": "Traffic Overview",
      "config": {"chartType": "line", "data": "traffic"}
    },
    {
      "type": "table",
      "title": "Recent Activities",
      "config": {"pagination": true, "sorting": true}
    }
  ]'::jsonb,
  TRUE,
  ARRAY['analytics', 'dashboard', 'metrics', 'charts']
) ON CONFLICT DO NOTHING;

-- Monitoring Dashboard Template
INSERT INTO dashboard_templates (name, description, category, template_schema, default_widgets, is_official, tags)
VALUES (
  'System Monitoring Dashboard',
  'Real-time system monitoring with performance metrics and alerts',
  'monitoring',
  '{
    "layout": "grid",
    "columns": 3,
    "gap": "sm",
    "refreshInterval": 5
  }'::jsonb,
  '[
    {
      "type": "stat_card",
      "title": "CPU Usage",
      "config": {"icon": "cpu", "format": "percentage", "threshold": 80}
    },
    {
      "type": "stat_card",
      "title": "Memory Usage",
      "config": {"icon": "memory", "format": "percentage", "threshold": 85}
    },
    {
      "type": "chart",
      "title": "System Load",
      "config": {"chartType": "area", "realtime": true}
    },
    {
      "type": "list",
      "title": "Active Alerts",
      "config": {"filterable": true, "sortable": true}
    }
  ]'::jsonb,
  TRUE,
  ARRAY['monitoring', 'system', 'performance', 'alerts']
) ON CONFLICT DO NOTHING;

-- Workflow Dashboard Template
INSERT INTO dashboard_templates (name, description, category, template_schema, default_widgets, is_official, tags)
VALUES (
  'Workflow Management Dashboard',
  'Manage and monitor workflows, processes, and tasks',
  'workflow',
  '{
    "layout": "tabs",
    "tabs": ["Overview", "Processes", "Tasks", "Analytics"],
    "theme": "material-you"
  }'::jsonb,
  '[
    {
      "type": "stat_card",
      "title": "Active Workflows",
      "config": {"icon": "workflow", "link": "/workflows"}
    },
    {
      "type": "kanban",
      "title": "Task Board",
      "config": {"columns": ["Todo", "In Progress", "Done"]}
    },
    {
      "type": "timeline",
      "title": "Workflow Timeline",
      "config": {"groupBy": "process"}
    },
    {
      "type": "chart",
      "title": "Success Rate",
      "config": {"chartType": "donut", "data": "workflow_status"}
    }
  ]'::jsonb,
  TRUE,
  ARRAY['workflow', 'tasks', 'processes', 'automation']
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to refresh analytics views
CREATE OR REPLACE FUNCTION refresh_dashboard_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_popularity;
  REFRESH MATERIALIZED VIEW CONCURRENTLY ai_generation_quality;
END;
$$ LANGUAGE plpgsql;

-- Function to clone a dashboard
CREATE OR REPLACE FUNCTION clone_dashboard(
  source_dashboard_id UUID,
  new_name TEXT DEFAULT NULL,
  created_by_user UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_dashboard_id UUID;
  source_dashboard RECORD;
BEGIN
  -- Get source dashboard
  SELECT * INTO source_dashboard FROM generated_dashboards WHERE id = source_dashboard_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dashboard not found: %', source_dashboard_id;
  END IF;
  
  -- Create new dashboard
  INSERT INTO generated_dashboards (
    name, description, subject, prompt, layout_type, layout_config,
    schema, widgets, created_by, is_published, version, tags,
    ai_generated, ai_model, ai_reasoning
  ) VALUES (
    COALESCE(new_name, source_dashboard.name || ' (Copy)'),
    source_dashboard.description,
    source_dashboard.subject,
    source_dashboard.prompt,
    source_dashboard.layout_type,
    source_dashboard.layout_config,
    source_dashboard.schema,
    source_dashboard.widgets,
    created_by_user,
    FALSE, -- New clone is not published
    '1.0.0', -- Reset version
    source_dashboard.tags,
    source_dashboard.ai_generated,
    source_dashboard.ai_model,
    source_dashboard.ai_reasoning
  ) RETURNING id INTO new_dashboard_id;
  
  -- Clone widgets
  INSERT INTO dashboard_widgets (
    dashboard_id, widget_type, name, title, description,
    grid_row, grid_column, grid_row_span, grid_column_span, order_index,
    config, data_source, chart_type, chart_config,
    is_interactive, refresh_interval, filters, component_id, atom_ids
  )
  SELECT 
    new_dashboard_id, widget_type, name, title, description,
    grid_row, grid_column, grid_row_span, grid_column_span, order_index,
    config, data_source, chart_type, chart_config,
    is_interactive, refresh_interval, filters, component_id, atom_ids
  FROM dashboard_widgets
  WHERE dashboard_id = source_dashboard_id;
  
  -- Update clone count
  UPDATE generated_dashboards 
  SET clone_count = clone_count + 1 
  WHERE id = source_dashboard_id;
  
  -- Track analytics
  INSERT INTO dashboard_analytics (dashboard_id, event_type, event_data)
  VALUES (source_dashboard_id, 'clone', jsonb_build_object('new_dashboard_id', new_dashboard_id));
  
  RETURN new_dashboard_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE generated_dashboards IS 'AI-generated dashboards from prompts with full schema and widget configuration';
COMMENT ON TABLE dashboard_widgets IS 'Individual widgets/components that make up dashboards';
COMMENT ON TABLE dashboard_templates IS 'Pre-built dashboard templates for common use cases';
COMMENT ON TABLE dashboard_component_links IS 'Links between dashboards and reusable components/atoms';
COMMENT ON TABLE ai_dashboard_generations IS 'History of AI dashboard generation attempts with user feedback';
COMMENT ON TABLE dashboard_analytics IS 'Analytics events for dashboard usage tracking';
COMMENT ON MATERIALIZED VIEW dashboard_popularity IS 'Dashboard popularity metrics aggregated from analytics';
COMMENT ON MATERIALIZED VIEW ai_generation_quality IS 'AI generation quality metrics by model and subject';
COMMENT ON FUNCTION clone_dashboard IS 'Clone an existing dashboard with all widgets and configuration';
COMMENT ON FUNCTION refresh_dashboard_analytics IS 'Refresh materialized views for dashboard analytics';
