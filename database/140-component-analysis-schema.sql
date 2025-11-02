-- Component Analysis Schema
-- Tracks component breakdown, atom components, and schema mappings
-- for AI-powered dashboard generation

-- Component Analyses table
-- Stores URL analysis metadata and screenshots
CREATE TABLE IF NOT EXISTS component_analyses (
  id SERIAL PRIMARY KEY,
  analysis_id VARCHAR(255) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  screenshot_path TEXT NOT NULL,
  component_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  viewport JSONB DEFAULT '{}',
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_component_analyses_url ON component_analyses(url);
CREATE INDEX IF NOT EXISTS idx_component_analyses_captured ON component_analyses(captured_at DESC);

-- Atom Components table
-- Stores individual atomic components extracted from analyses
CREATE TABLE IF NOT EXISTS atom_components (
  id SERIAL PRIMARY KEY,
  analysis_id VARCHAR(255) NOT NULL,
  component_id VARCHAR(255) NOT NULL,
  component_type VARCHAR(100) NOT NULL,
  classification VARCHAR(100),
  semantic_role VARCHAR(100),
  interaction_type VARCHAR(100),
  visual_properties JSONB DEFAULT '{}',
  content_properties JSONB DEFAULT '{}',
  layout_properties JSONB DEFAULT '{}',
  seo_properties JSONB DEFAULT '{}',
  accessibility_properties JSONB DEFAULT '{}',
  component_family VARCHAR(100),
  schema_mapping JSONB DEFAULT '{}',
  reuse_score INTEGER DEFAULT 50,
  complexity_score INTEGER DEFAULT 50,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(analysis_id, component_id)
);

CREATE INDEX IF NOT EXISTS idx_atom_components_analysis ON atom_components(analysis_id);
CREATE INDEX IF NOT EXISTS idx_atom_components_type ON atom_components(component_type);
CREATE INDEX IF NOT EXISTS idx_atom_components_classification ON atom_components(classification);
CREATE INDEX IF NOT EXISTS idx_atom_components_family ON atom_components(component_family);
CREATE INDEX IF NOT EXISTS idx_atom_components_reuse ON atom_components(reuse_score DESC);
CREATE INDEX IF NOT EXISTS idx_atom_components_complexity ON atom_components(complexity_score DESC);

-- Component Relationships table
-- Tracks how components link together
CREATE TABLE IF NOT EXISTS component_relationships (
  id SERIAL PRIMARY KEY,
  parent_component_id INTEGER REFERENCES atom_components(id) ON DELETE CASCADE,
  child_component_id INTEGER REFERENCES atom_components(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL, -- 'contains', 'follows', 'interacts-with', etc.
  strength DECIMAL(3,2) DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_component_id, child_component_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_component_relationships_parent ON component_relationships(parent_component_id);
CREATE INDEX IF NOT EXISTS idx_component_relationships_child ON component_relationships(child_component_id);
CREATE INDEX IF NOT EXISTS idx_component_relationships_type ON component_relationships(relationship_type);

-- Dashboard Schemas table
-- Generated dashboard configurations from component analysis
CREATE TABLE IF NOT EXISTS dashboard_schemas (
  id SERIAL PRIMARY KEY,
  schema_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  analysis_id VARCHAR(255) REFERENCES component_analyses(analysis_id) ON DELETE CASCADE,
  dashboard_type VARCHAR(100), -- 'admin', 'user', 'analytics', etc.
  layout_type VARCHAR(100), -- 'grid', 'flex', 'masonry', etc.
  components JSONB DEFAULT '[]', -- Array of component configurations
  schema_links JSONB DEFAULT '[]', -- Links to other schemas
  metadata JSONB DEFAULT '{}',
  thumbnail_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_schemas_analysis ON dashboard_schemas(analysis_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_schemas_type ON dashboard_schemas(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_schemas_active ON dashboard_schemas(is_active);

-- SEO Components table
-- Specialized SEO-related components and settings
CREATE TABLE IF NOT EXISTS seo_components (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES atom_components(id) ON DELETE CASCADE,
  seo_type VARCHAR(100) NOT NULL, -- 'meta-tag', 'heading', 'schema', 'link', etc.
  seo_category VARCHAR(100), -- 'technical', 'content', 'social', 'performance'
  importance_score INTEGER DEFAULT 50, -- 0-100
  optimization_suggestions JSONB DEFAULT '[]',
  best_practices JSONB DEFAULT '{}',
  current_value TEXT,
  recommended_value TEXT,
  impact_level VARCHAR(50), -- 'critical', 'high', 'medium', 'low'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'optimized', 'needs-review'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_id, seo_type)
);

CREATE INDEX IF NOT EXISTS idx_seo_components_type ON seo_components(seo_type);
CREATE INDEX IF NOT EXISTS idx_seo_components_category ON seo_components(seo_category);
CREATE INDEX IF NOT EXISTS idx_seo_components_importance ON seo_components(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_components_impact ON seo_components(impact_level);
CREATE INDEX IF NOT EXISTS idx_seo_components_status ON seo_components(status);

-- Component Library table
-- Reusable component templates
CREATE TABLE IF NOT EXISTS component_library (
  id SERIAL PRIMARY KEY,
  library_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  component_type VARCHAR(100) NOT NULL,
  framework VARCHAR(100), -- 'react', 'vue', 'angular', 'vanilla'
  category VARCHAR(100),
  template JSONB NOT NULL, -- Component template/schema
  props_schema JSONB DEFAULT '{}',
  example_usage TEXT,
  preview_image TEXT,
  reuse_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_component_library_type ON component_library(component_type);
CREATE INDEX IF NOT EXISTS idx_component_library_framework ON component_library(framework);
CREATE INDEX IF NOT EXISTS idx_component_library_category ON component_library(category);
CREATE INDEX IF NOT EXISTS idx_component_library_reuse ON component_library(reuse_count DESC);
CREATE INDEX IF NOT EXISTS idx_component_library_rating ON component_library(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_component_library_public ON component_library(is_public);

-- Schema Visualization Data table
-- Stores data for knowledge graphs, mermaid diagrams, info charts
CREATE TABLE IF NOT EXISTS schema_visualizations (
  id SERIAL PRIMARY KEY,
  visualization_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  visualization_type VARCHAR(100) NOT NULL, -- 'knowledge-graph', 'mermaid', 'info-chart', 'flow-diagram'
  source_type VARCHAR(100), -- 'dashboard', 'components', 'analysis', 'relationships'
  source_id VARCHAR(255),
  data JSONB NOT NULL, -- Visualization data
  config JSONB DEFAULT '{}', -- Rendering configuration
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schema_visualizations_type ON schema_visualizations(visualization_type);
CREATE INDEX IF NOT EXISTS idx_schema_visualizations_source ON schema_visualizations(source_type, source_id);

-- Data Mining Workflows table
-- Automated workflows for component discovery and analysis
CREATE TABLE IF NOT EXISTS component_mining_workflows (
  id SERIAL PRIMARY KEY,
  workflow_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(100), -- 'scheduled', 'on-demand', 'triggered'
  schedule_cron VARCHAR(100), -- Cron expression for scheduled workflows
  target_urls TEXT[] DEFAULT '{}',
  analysis_config JSONB DEFAULT '{}',
  processing_steps JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'inactive', 'running', 'failed'
  last_run_at TIMESTAMP,
  last_run_status VARCHAR(50),
  last_run_results JSONB DEFAULT '{}',
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_component_mining_workflows_type ON component_mining_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_component_mining_workflows_status ON component_mining_workflows(status);
CREATE INDEX IF NOT EXISTS idx_component_mining_workflows_last_run ON component_mining_workflows(last_run_at DESC);

-- Component Analysis Logs table
-- Tracks all operations for audit trail
CREATE TABLE IF NOT EXISTS component_analysis_logs (
  id SERIAL PRIMARY KEY,
  log_id VARCHAR(255) UNIQUE NOT NULL,
  operation_type VARCHAR(100) NOT NULL, -- 'analysis', 'extraction', 'generation', 'optimization'
  entity_type VARCHAR(100), -- 'component', 'dashboard', 'workflow', 'visualization'
  entity_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- 'started', 'in-progress', 'completed', 'failed'
  details JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_component_analysis_logs_operation ON component_analysis_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_component_analysis_logs_entity ON component_analysis_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_component_analysis_logs_status ON component_analysis_logs(status);
CREATE INDEX IF NOT EXISTS idx_component_analysis_logs_created ON component_analysis_logs(created_at DESC);

-- SEO Research Data table
-- Stores SEO research, best practices, and component recommendations
CREATE TABLE IF NOT EXISTS seo_research_data (
  id SERIAL PRIMARY KEY,
  research_id VARCHAR(255) UNIQUE NOT NULL,
  topic VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- 'technical-seo', 'content-seo', 'local-seo', 'mobile-seo', etc.
  best_practices JSONB DEFAULT '[]',
  component_recommendations JSONB DEFAULT '[]',
  implementation_examples JSONB DEFAULT '[]',
  tools_and_resources JSONB DEFAULT '[]',
  impact_level VARCHAR(50), -- 'critical', 'high', 'medium', 'low'
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sources TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_research_topic ON seo_research_data(topic);
CREATE INDEX IF NOT EXISTS idx_seo_research_category ON seo_research_data(category);
CREATE INDEX IF NOT EXISTS idx_seo_research_impact ON seo_research_data(impact_level);
CREATE INDEX IF NOT EXISTS idx_seo_research_updated ON seo_research_data(last_updated DESC);

-- Component SEO Mappings table
-- Maps components to SEO features and recommendations
CREATE TABLE IF NOT EXISTS component_seo_mappings (
  id SERIAL PRIMARY KEY,
  component_type VARCHAR(100) NOT NULL,
  seo_feature VARCHAR(255) NOT NULL,
  mapping_type VARCHAR(100), -- 'direct', 'indirect', 'optional', 'recommended'
  priority INTEGER DEFAULT 50,
  implementation_guide JSONB DEFAULT '{}',
  examples JSONB DEFAULT '[]',
  best_practices JSONB DEFAULT '[]',
  tools TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_type, seo_feature)
);

CREATE INDEX IF NOT EXISTS idx_component_seo_mappings_component ON component_seo_mappings(component_type);
CREATE INDEX IF NOT EXISTS idx_component_seo_mappings_seo ON component_seo_mappings(seo_feature);
CREATE INDEX IF NOT EXISTS idx_component_seo_mappings_type ON component_seo_mappings(mapping_type);
CREATE INDEX IF NOT EXISTS idx_component_seo_mappings_priority ON component_seo_mappings(priority DESC);

-- Create views for common queries

-- View: Component Statistics
CREATE OR REPLACE VIEW component_statistics AS
SELECT 
  ac.component_type,
  ac.classification,
  ac.component_family,
  COUNT(*) as count,
  AVG(ac.reuse_score) as avg_reuse_score,
  AVG(ac.complexity_score) as avg_complexity_score,
  COUNT(DISTINCT ac.analysis_id) as unique_analyses
FROM atom_components ac
GROUP BY ac.component_type, ac.classification, ac.component_family
ORDER BY count DESC;

-- View: Dashboard Schema Summary
CREATE OR REPLACE VIEW dashboard_schema_summary AS
SELECT 
  ds.schema_id,
  ds.name,
  ds.dashboard_type,
  ds.layout_type,
  ca.url,
  jsonb_array_length(ds.components) as component_count,
  jsonb_array_length(ds.schema_links) as schema_link_count,
  ds.is_active,
  ds.created_at
FROM dashboard_schemas ds
LEFT JOIN component_analyses ca ON ds.analysis_id = ca.analysis_id
ORDER BY ds.created_at DESC;

-- View: SEO Component Health
CREATE OR REPLACE VIEW seo_component_health AS
SELECT 
  sc.seo_type,
  sc.seo_category,
  sc.impact_level,
  sc.status,
  COUNT(*) as count,
  AVG(sc.importance_score) as avg_importance_score
FROM seo_components sc
GROUP BY sc.seo_type, sc.seo_category, sc.impact_level, sc.status
ORDER BY avg_importance_score DESC;

-- View: Component Library Popular
CREATE OR REPLACE VIEW component_library_popular AS
SELECT 
  cl.library_id,
  cl.name,
  cl.component_type,
  cl.framework,
  cl.category,
  cl.reuse_count,
  cl.average_rating,
  cl.tags,
  cl.is_public
FROM component_library cl
WHERE cl.is_public = true
ORDER BY cl.reuse_count DESC, cl.average_rating DESC
LIMIT 100;

-- View: Recent Analyses
CREATE OR REPLACE VIEW recent_component_analyses AS
SELECT 
  ca.analysis_id,
  ca.url,
  ca.component_count,
  ca.captured_at,
  COUNT(DISTINCT ac.id) as atom_component_count,
  COUNT(DISTINCT ds.id) as dashboard_count
FROM component_analyses ca
LEFT JOIN atom_components ac ON ca.analysis_id = ac.analysis_id
LEFT JOIN dashboard_schemas ds ON ca.analysis_id = ds.analysis_id
GROUP BY ca.analysis_id, ca.url, ca.component_count, ca.captured_at
ORDER BY ca.captured_at DESC
LIMIT 50;

-- Functions

-- Function: Calculate component quality score
CREATE OR REPLACE FUNCTION calculate_component_quality_score(
  p_component_id INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 50;
  v_has_aria BOOLEAN;
  v_has_semantic BOOLEAN;
  v_complexity INTEGER;
  v_reuse INTEGER;
BEGIN
  SELECT 
    (accessibility_properties->>'ariaLabel' IS NOT NULL OR 
     accessibility_properties->>'role' IS NOT NULL) as has_aria,
    semantic_role != 'none' as has_semantic,
    complexity_score,
    reuse_score
  INTO v_has_aria, v_has_semantic, v_complexity, v_reuse
  FROM atom_components
  WHERE id = p_component_id;
  
  -- Add points for accessibility
  IF v_has_aria THEN v_score := v_score + 15; END IF;
  IF v_has_semantic THEN v_score := v_score + 15; END IF;
  
  -- Add points for reusability
  v_score := v_score + (v_reuse / 5);
  
  -- Subtract points for complexity
  v_score := v_score - (v_complexity / 10);
  
  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql;

-- Function: Get related components
CREATE OR REPLACE FUNCTION get_related_components(
  p_component_id INTEGER,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  related_id INTEGER,
  relationship_type VARCHAR,
  strength DECIMAL,
  component_type VARCHAR,
  classification VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    cr.relationship_type,
    cr.strength,
    ac.component_type,
    ac.classification
  FROM component_relationships cr
  JOIN atom_components ac ON ac.id = cr.child_component_id
  WHERE cr.parent_component_id = p_component_id
  ORDER BY cr.strength DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert initial SEO research data
INSERT INTO seo_research_data (research_id, topic, category, best_practices, component_recommendations, impact_level, sources)
VALUES 
  (
    'seo_meta_tags',
    'Meta Tags Optimization',
    'technical-seo',
    '[
      {"practice": "Use unique title tags (50-60 chars)", "priority": "critical"},
      {"practice": "Write compelling meta descriptions (150-160 chars)", "priority": "high"},
      {"practice": "Include Open Graph tags for social sharing", "priority": "high"},
      {"practice": "Add Twitter Card meta tags", "priority": "medium"},
      {"practice": "Use canonical URLs to avoid duplicate content", "priority": "critical"}
    ]'::jsonb,
    '[
      {"component": "MetaTitleInput", "description": "Input field for page title with character count"},
      {"component": "MetaDescriptionTextarea", "description": "Textarea for meta description with preview"},
      {"component": "OpenGraphEditor", "description": "Form for OG tags (title, description, image)"},
      {"component": "CanonicalURLInput", "description": "Input for canonical URL with validation"}
    ]'::jsonb,
    'critical',
    '{"Google Search Central", "Moz SEO Guide", "Ahrefs Blog"}'
  ),
  (
    'seo_schema_markup',
    'Structured Data & Schema.org',
    'technical-seo',
    '[
      {"practice": "Implement JSON-LD structured data", "priority": "critical"},
      {"practice": "Use appropriate schema types (Article, Product, Organization, etc.)", "priority": "high"},
      {"practice": "Validate schema with Google Rich Results Test", "priority": "high"},
      {"practice": "Include breadcrumb schema for navigation", "priority": "medium"},
      {"practice": "Add FAQ schema where applicable", "priority": "medium"}
    ]'::jsonb,
    '[
      {"component": "SchemaTypeSelector", "description": "Dropdown to select schema.org type"},
      {"component": "JSONLDEditor", "description": "Code editor for JSON-LD with validation"},
      {"component": "SchemaPreview", "description": "Preview how schema appears in search"},
      {"component": "SchemaValidator", "description": "Validates schema against Google guidelines"}
    ]'::jsonb,
    'critical',
    '{"Schema.org", "Google Structured Data Testing Tool", "JSON-LD.org"}'
  ),
  (
    'seo_headings',
    'Heading Structure Optimization',
    'content-seo',
    '[
      {"practice": "Use single H1 tag per page", "priority": "critical"},
      {"practice": "Follow hierarchical heading structure (H1 > H2 > H3)", "priority": "high"},
      {"practice": "Include target keywords in headings naturally", "priority": "high"},
      {"practice": "Keep headings concise and descriptive", "priority": "medium"}
    ]'::jsonb,
    '[
      {"component": "HeadingStructureVisualizer", "description": "Tree view of page heading hierarchy"},
      {"component": "HeadingOptimizer", "description": "Suggests heading improvements"},
      {"component": "KeywordDensityChecker", "description": "Analyzes keyword usage in headings"}
    ]'::jsonb,
    'high',
    '{"Google SEO Starter Guide", "Yoast SEO", "SEMrush"}'
  ),
  (
    'seo_core_web_vitals',
    'Core Web Vitals Performance',
    'performance',
    '[
      {"practice": "Optimize Largest Contentful Paint (LCP < 2.5s)", "priority": "critical"},
      {"practice": "Minimize First Input Delay (FID < 100ms)", "priority": "critical"},
      {"practice": "Reduce Cumulative Layout Shift (CLS < 0.1)", "priority": "critical"},
      {"practice": "Optimize images (WebP, lazy loading)", "priority": "high"},
      {"practice": "Minimize JavaScript and CSS", "priority": "high"}
    ]'::jsonb,
    '[
      {"component": "CoreWebVitalsMonitor", "description": "Real-time CWV metrics display"},
      {"component": "PerformanceScoreCard", "description": "Overall performance score with breakdown"},
      {"component": "OptimizationSuggestions", "description": "Actionable performance improvements"},
      {"component": "LabDataComparison", "description": "Compare lab vs field data"}
    ]'::jsonb,
    'critical',
    '{"Google PageSpeed Insights", "Web.dev", "Chrome User Experience Report"}'
  ),
  (
    'seo_mobile_optimization',
    'Mobile-First SEO',
    'mobile-seo',
    '[
      {"practice": "Ensure mobile-responsive design", "priority": "critical"},
      {"practice": "Use viewport meta tag", "priority": "critical"},
      {"practice": "Optimize tap targets (min 48x48px)", "priority": "high"},
      {"practice": "Avoid intrusive interstitials", "priority": "high"},
      {"practice": "Test with Google Mobile-Friendly Test", "priority": "medium"}
    ]'::jsonb,
    '[
      {"component": "MobilePreview", "description": "Shows page preview on different devices"},
      {"component": "TapTargetChecker", "description": "Validates touch target sizes"},
      {"component": "ResponsiveBreakpointTester", "description": "Tests all responsive breakpoints"},
      {"component": "MobileFriendlinessScore", "description": "Mobile-friendliness rating"}
    ]'::jsonb,
    'critical',
    '{"Google Mobile-Friendly Test", "Google Mobile-First Indexing Guide"}'
  ),
  (
    'seo_internal_linking',
    'Internal Linking Strategy',
    'content-seo',
    '[
      {"practice": "Use descriptive anchor text", "priority": "high"},
      {"practice": "Link to important pages from homepage", "priority": "high"},
      {"practice": "Create topic clusters with pillar content", "priority": "high"},
      {"practice": "Fix broken internal links", "priority": "medium"},
      {"practice": "Limit number of links per page (100-150)", "priority": "low"}
    ]'::jsonb,
    '[
      {"component": "InternalLinkGraph", "description": "Visualizes internal linking structure"},
      {"component": "OrphanPageDetector", "description": "Finds pages with no internal links"},
      {"component": "AnchorTextAnalyzer", "description": "Analyzes anchor text distribution"},
      {"component": "LinkOpportunityFinder", "description": "Suggests new internal linking opportunities"}
    ]'::jsonb,
    'high',
    '{"Moz Link Explorer", "Ahrefs Site Audit", "Screaming Frog SEO Spider"}'
  ),
  (
    'seo_image_optimization',
    'Image SEO Best Practices',
    'technical-seo',
    '[
      {"practice": "Use descriptive alt text for all images", "priority": "critical"},
      {"practice": "Optimize file sizes (compress images)", "priority": "high"},
      {"practice": "Use modern formats (WebP, AVIF)", "priority": "high"},
      {"practice": "Include target keywords in image filenames", "priority": "medium"},
      {"practice": "Implement lazy loading for below-fold images", "priority": "high"}
    ]'::jsonb,
    '[
      {"component": "ImageAltTextEditor", "description": "Bulk edit alt text for images"},
      {"component": "ImageCompressionTool", "description": "Compress images without quality loss"},
      {"component": "ImageFormatConverter", "description": "Convert to WebP/AVIF"},
      {"component": "ImageLazyLoadToggle", "description": "Enable/disable lazy loading per image"}
    ]'::jsonb,
    'high',
    '{"Google Image SEO Guide", "TinyPNG", "ImageOptim"}'
  ),
  (
    'seo_local_seo',
    'Local SEO Optimization',
    'local-seo',
    '[
      {"practice": "Claim and optimize Google Business Profile", "priority": "critical"},
      {"practice": "Use LocalBusiness schema markup", "priority": "critical"},
      {"practice": "Include NAP (Name, Address, Phone) consistently", "priority": "high"},
      {"practice": "Get listed in local directories", "priority": "medium"},
      {"practice": "Encourage customer reviews", "priority": "high"}
    ]'::jsonb,
    '[
      {"component": "LocalBusinessSchemaEditor", "description": "Form for LocalBusiness schema data"},
      {"component": "NAPConsistencyChecker", "description": "Validates NAP across web"},
      {"component": "ReviewWidgetManager", "description": "Manages review widgets and snippets"},
      {"component": "LocalDirectoryTracker", "description": "Tracks local directory listings"}
    ]'::jsonb,
    'high',
    '{"Google Business Profile Help", "Moz Local SEO Guide", "BrightLocal"}'
  )
ON CONFLICT (research_id) DO NOTHING;

-- Insert component SEO mappings
INSERT INTO component_seo_mappings (component_type, seo_feature, mapping_type, priority, implementation_guide, examples)
VALUES 
  ('input-text', 'Meta Title', 'direct', 100, '{"field": "title", "maxLength": 60, "validation": "required"}'::jsonb, '["Enter page title here..."]'::jsonb),
  ('textarea', 'Meta Description', 'direct', 90, '{"field": "description", "maxLength": 160, "validation": "recommended"}'::jsonb, '["Write compelling description..."]'::jsonb),
  ('input-text', 'Canonical URL', 'direct', 95, '{"field": "canonical", "validation": "url"}'::jsonb, '["https://example.com/page"]'::jsonb),
  ('select', 'Schema Type', 'direct', 95, '{"field": "schemaType", "options": ["Article", "Product", "Organization"]}'::jsonb, '["Article", "Product"]'::jsonb),
  ('code-editor', 'JSON-LD Schema', 'direct', 100, '{"language": "json", "validation": "json-ld"}'::jsonb, '["{\"@type\": \"Article\"}"]'::jsonb),
  ('image', 'Alt Text', 'direct', 100, '{"attribute": "alt", "required": true}'::jsonb, '["Descriptive alt text"]'::jsonb),
  ('heading', 'H1 Tag', 'direct', 100, '{"level": 1, "unique": true}'::jsonb, '["Main Page Heading"]'::jsonb),
  ('input-text', 'Open Graph Title', 'optional', 80, '{"field": "ogTitle", "maxLength": 60}'::jsonb, '["Social sharing title"]'::jsonb),
  ('input-text', 'Open Graph Image', 'optional', 75, '{"field": "ogImage", "validation": "url"}'::jsonb, '["https://example.com/image.jpg"]'::jsonb),
  ('number', 'Performance Score', 'indirect', 70, '{"field": "performanceScore", "min": 0, "max": 100}'::jsonb, '["85"]'::jsonb)
ON CONFLICT (component_type, seo_feature) DO NOTHING;

-- Comments
COMMENT ON TABLE component_analyses IS 'Stores URL analysis metadata and screenshots for component breakdown';
COMMENT ON TABLE atom_components IS 'Individual atomic components extracted from page analyses with full metadata';
COMMENT ON TABLE component_relationships IS 'Tracks relationships and links between components';
COMMENT ON TABLE dashboard_schemas IS 'Generated dashboard configurations from component analysis';
COMMENT ON TABLE seo_components IS 'SEO-specific component data and optimization recommendations';
COMMENT ON TABLE component_library IS 'Reusable component templates for dashboard generation';
COMMENT ON TABLE schema_visualizations IS 'Data for knowledge graphs, mermaid diagrams, and info charts';
COMMENT ON TABLE component_mining_workflows IS 'Automated workflows for component discovery and analysis';
COMMENT ON TABLE component_analysis_logs IS 'Audit trail of all component analysis operations';
COMMENT ON TABLE seo_research_data IS 'SEO research, best practices, and component recommendations';
COMMENT ON TABLE component_seo_mappings IS 'Maps component types to SEO features and implementation guides';
