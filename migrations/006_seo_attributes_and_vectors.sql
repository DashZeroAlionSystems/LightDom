-- Migration: SEO Attributes and Vector Storage
-- Purpose: Store ~192 SEO attributes per page with pgvector embeddings
-- Requires: pgvector extension

-- Enable pgvector extension (requires superuser or rds_superuser role)
CREATE EXTENSION IF NOT EXISTS vector;

-- SEO Attributes table (comprehensive per-page metrics)
CREATE TABLE IF NOT EXISTS seo_attributes (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  crawl_session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- META & HEAD (40+)
  title TEXT,
  title_length INTEGER,
  meta_description TEXT,
  meta_description_length INTEGER,
  meta_keywords TEXT,
  meta_author TEXT,
  meta_robots TEXT,
  meta_viewport TEXT,
  canonical TEXT,
  alternate TEXT,
  prev_url TEXT,
  next_url TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_url TEXT,
  og_type TEXT,
  og_site_name TEXT,
  og_locale TEXT,
  
  -- Twitter Card
  twitter_card TEXT,
  twitter_site TEXT,
  twitter_creator TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  
  -- Language
  lang TEXT,
  charset TEXT,
  
  -- Icons
  favicon TEXT,
  apple_touch_icon TEXT,
  
  -- HEADING STRUCTURE (20+)
  h1_count INTEGER DEFAULT 0,
  h2_count INTEGER DEFAULT 0,
  h3_count INTEGER DEFAULT 0,
  h4_count INTEGER DEFAULT 0,
  h5_count INTEGER DEFAULT 0,
  h6_count INTEGER DEFAULT 0,
  h1_text TEXT,
  h2_text TEXT,
  h3_text TEXT,
  total_headings INTEGER DEFAULT 0,
  heading_hierarchy_valid BOOLEAN DEFAULT FALSE,
  
  -- CONTENT (30+)
  body_text_length INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  paragraph_count INTEGER DEFAULT 0,
  list_count INTEGER DEFAULT 0,
  list_item_count INTEGER DEFAULT 0,
  table_count INTEGER DEFAULT 0,
  form_count INTEGER DEFAULT 0,
  input_count INTEGER DEFAULT 0,
  button_count INTEGER DEFAULT 0,
  textarea_count INTEGER DEFAULT 0,
  select_count INTEGER DEFAULT 0,
  sentence_count INTEGER DEFAULT 0,
  avg_words_per_sentence NUMERIC(10,2) DEFAULT 0,
  
  -- LINKS (25+)
  total_links INTEGER DEFAULT 0,
  internal_links_count INTEGER DEFAULT 0,
  external_links_count INTEGER DEFAULT 0,
  anchor_links_count INTEGER DEFAULT 0,
  nofollow_links_count INTEGER DEFAULT 0,
  dofollow_links_count INTEGER DEFAULT 0,
  internal_to_external_ratio NUMERIC(10,2) DEFAULT 0,
  empty_href_count INTEGER DEFAULT 0,
  
  -- IMAGES (20+)
  total_images INTEGER DEFAULT 0,
  images_with_alt INTEGER DEFAULT 0,
  images_without_alt INTEGER DEFAULT 0,
  images_with_title INTEGER DEFAULT 0,
  images_with_lazy_load INTEGER DEFAULT 0,
  alt_text_coverage NUMERIC(5,2) DEFAULT 0,
  
  -- STRUCTURED DATA (15+)
  structured_data_count INTEGER DEFAULT 0,
  schema_types TEXT,
  has_article_schema BOOLEAN DEFAULT FALSE,
  has_product_schema BOOLEAN DEFAULT FALSE,
  has_organization_schema BOOLEAN DEFAULT FALSE,
  has_breadcrumb_schema BOOLEAN DEFAULT FALSE,
  itemscope_count INTEGER DEFAULT 0,
  itemprop_count INTEGER DEFAULT 0,
  
  -- PERFORMANCE (15+)
  html_size INTEGER DEFAULT 0,
  css_link_count INTEGER DEFAULT 0,
  js_script_count INTEGER DEFAULT 0,
  inline_script_count INTEGER DEFAULT 0,
  inline_style_count INTEGER DEFAULT 0,
  prefetch_count INTEGER DEFAULT 0,
  preconnect_count INTEGER DEFAULT 0,
  preload_count INTEGER DEFAULT 0,
  dns_preconnect_count INTEGER DEFAULT 0,
  
  -- MOBILE & ACCESSIBILITY (10+)
  has_viewport_meta BOOLEAN DEFAULT FALSE,
  has_apple_mobile_web_app_capable BOOLEAN DEFAULT FALSE,
  has_theme_color BOOLEAN DEFAULT FALSE,
  aria_label_count INTEGER DEFAULT 0,
  aria_describedby_count INTEGER DEFAULT 0,
  role_count INTEGER DEFAULT 0,
  accessibility_score NUMERIC(5,2) DEFAULT 0,
  
  -- URL STRUCTURE (10+)
  protocol TEXT,
  hostname TEXT,
  pathname TEXT,
  pathname_length INTEGER,
  path_depth INTEGER,
  has_query_params BOOLEAN DEFAULT FALSE,
  query_param_count INTEGER DEFAULT 0,
  has_fragment BOOLEAN DEFAULT FALSE,
  is_secure BOOLEAN DEFAULT FALSE,
  
  -- SOCIAL SIGNALS (8+)
  facebook_count INTEGER DEFAULT 0,
  twitter_count INTEGER DEFAULT 0,
  linkedin_count INTEGER DEFAULT 0,
  instagram_count INTEGER DEFAULT 0,
  youtube_count INTEGER DEFAULT 0,
  pinterest_count INTEGER DEFAULT 0,
  social_share_count INTEGER DEFAULT 0,
  
  -- SECURITY & BEST PRACTICES (8+)
  has_https_in_links BOOLEAN DEFAULT FALSE,
  has_insecure_content BOOLEAN DEFAULT FALSE,
  has_iframe BOOLEAN DEFAULT FALSE,
  iframe_count INTEGER DEFAULT 0,
  has_external_scripts BOOLEAN DEFAULT FALSE,
  has_crossorigin_links BOOLEAN DEFAULT FALSE,
  
  -- COMPUTED SCORES (5+)
  seo_score NUMERIC(5,2) DEFAULT 0,
  content_quality_score NUMERIC(5,2) DEFAULT 0,
  technical_score NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  
  -- Embedding vector (1536 dimensions for OpenAI ada-002 or similar)
  embedding vector(1536),
  
  -- Metadata
  raw_attributes JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_attributes_url ON seo_attributes(url);
CREATE INDEX IF NOT EXISTS idx_seo_attributes_crawl_session ON seo_attributes(crawl_session_id);
CREATE INDEX IF NOT EXISTS idx_seo_attributes_timestamp ON seo_attributes(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_seo_attributes_overall_score ON seo_attributes(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_attributes_hostname ON seo_attributes(hostname);

-- Vector similarity index (HNSW for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_seo_attributes_embedding ON seo_attributes 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- SEO Training Data table (aggregated/prepared datasets for ML)
CREATE TABLE IF NOT EXISTS seo_training_data (
  id BIGSERIAL PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  description TEXT,
  
  -- Source filters
  min_overall_score NUMERIC(5,2) DEFAULT 0,
  max_overall_score NUMERIC(5,2) DEFAULT 100,
  hostname_filter TEXT[],
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  
  -- Generated artifacts
  sample_count INTEGER DEFAULT 0,
  features JSONB,
  labels JSONB,
  train_test_split JSONB,
  
  -- Storage
  artifact_path TEXT,
  artifact_format TEXT DEFAULT 'jsonl', -- 'jsonl', 'csv', 'tfrecord'
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'complete', 'failed'
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_training_data_dataset_name ON seo_training_data(dataset_name);
CREATE INDEX IF NOT EXISTS idx_seo_training_data_status ON seo_training_data(status);

-- Page Performance Metrics (time-series data for trending)
CREATE TABLE IF NOT EXISTS page_performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  seo_attributes_id BIGINT REFERENCES seo_attributes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  
  -- Performance timing
  ttfb_ms INTEGER, -- Time to first byte
  fcp_ms INTEGER, -- First contentful paint
  lcp_ms INTEGER, -- Largest contentful paint
  cls NUMERIC(5,3), -- Cumulative layout shift
  fid_ms INTEGER, -- First input delay
  
  -- Resource metrics
  dom_content_loaded_ms INTEGER,
  load_complete_ms INTEGER,
  total_request_count INTEGER,
  total_transfer_size INTEGER,
  
  measured_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_performance_url ON page_performance_metrics(url);
CREATE INDEX IF NOT EXISTS idx_page_performance_measured_at ON page_performance_metrics(measured_at DESC);

-- SEO Recommendations (ML-generated suggestions)
CREATE TABLE IF NOT EXISTS seo_recommendations (
  id BIGSERIAL PRIMARY KEY,
  seo_attributes_id BIGINT REFERENCES seo_attributes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  
  recommendation_type TEXT NOT NULL, -- 'meta', 'content', 'technical', 'accessibility', 'performance'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT,
  suggested_fix TEXT,
  
  -- ML confidence
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'acknowledged', 'in_progress', 'resolved', 'dismissed'
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_recommendations_url ON seo_recommendations(url);
CREATE INDEX IF NOT EXISTS idx_seo_recommendations_status ON seo_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_seo_recommendations_priority ON seo_recommendations(priority);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_attributes_updated_at BEFORE UPDATE ON seo_attributes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_training_data_updated_at BEFORE UPDATE ON seo_training_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_recommendations_updated_at BEFORE UPDATE ON seo_recommendations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust roles as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lightdom_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lightdom_app;
