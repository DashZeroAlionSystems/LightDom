-- ============================================================================
-- Workflow Process Schemas and Task Definitions
-- Complete schema for scraping, crawling, SEO, scheduling, and generators
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- Workflow Process Types
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_process_type') THEN
    CREATE TYPE workflow_process_type AS ENUM (
      'scraping',
      'crawling',
      'seo_optimization',
      'url_seeding',
      'scheduling',
      'content_generation',
      'data_mining',
      'analysis',
      'notification',
      'validation'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM (
      'pending',
      'queued',
      'running',
      'completed',
      'failed',
      'cancelled',
      'retry'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_frequency') THEN
    CREATE TYPE schedule_frequency AS ENUM (
      'once',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'custom_cron'
    );
  END IF;
END$$;

-- ============================================================================
-- Workflow Process Definitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_process_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  process_type workflow_process_type NOT NULL,
  description TEXT,
  
  -- Schema definition for this process
  schema JSONB DEFAULT '{}'::jsonb,
  
  -- Input/output contracts
  input_schema JSONB DEFAULT '{}'::jsonb,
  output_schema JSONB DEFAULT '{}'::jsonb,
  
  -- Configuration options
  config_schema JSONB DEFAULT '{}'::jsonb,
  default_config JSONB DEFAULT '{}'::jsonb,
  
  -- Dependencies on other processes
  depends_on UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Service handlers
  handler_service TEXT,  -- e.g., 'WebCrawlerService', 'SEODataCollector'
  handler_method TEXT,   -- e.g., 'crawlWebsite', 'analyzeSEO'
  
  -- N8N workflow integration
  n8n_workflow_id TEXT,
  n8n_webhook_path TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  version TEXT DEFAULT '1.0.0',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (name, version)
);

CREATE INDEX idx_workflow_process_definitions_type ON workflow_process_definitions(process_type);
CREATE INDEX idx_workflow_process_definitions_tags ON workflow_process_definitions USING gin(tags);
CREATE INDEX idx_workflow_process_definitions_active ON workflow_process_definitions(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- Task Definitions (sub-tasks of processes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES workflow_process_definitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Task ordering within process
  execution_order INTEGER DEFAULT 0,
  
  -- Task schema
  schema JSONB DEFAULT '{}'::jsonb,
  input_schema JSONB DEFAULT '{}'::jsonb,
  output_schema JSONB DEFAULT '{}'::jsonb,
  
  -- Execution configuration
  timeout_seconds INTEGER DEFAULT 300,
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Conditional execution
  run_condition JSONB DEFAULT '{}'::jsonb,  -- e.g., {"if": "$previous.success === true"}
  
  -- Parallel execution
  can_run_parallel BOOLEAN DEFAULT FALSE,
  parallel_group TEXT,  -- Tasks with same group can run in parallel
  
  -- Handler
  handler_function TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (process_id, name)
);

CREATE INDEX idx_task_definitions_process ON task_definitions(process_id);
CREATE INDEX idx_task_definitions_order ON task_definitions(process_id, execution_order);

-- ============================================================================
-- Workflow Process Instances (actual executions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_process_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_definition_id UUID NOT NULL REFERENCES workflow_process_definitions(id) ON DELETE CASCADE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  
  -- Instance details
  name TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  
  -- Input/output data
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_data JSONB DEFAULT '{}'::jsonb,
  
  -- Configuration for this instance
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Execution tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  
  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0,
  progress_message TEXT,
  
  -- Resource usage
  cpu_time_ms INTEGER,
  memory_used_mb INTEGER,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_process_instances_definition ON workflow_process_instances(process_definition_id);
CREATE INDEX idx_workflow_process_instances_workflow ON workflow_process_instances(workflow_instance_id);
CREATE INDEX idx_workflow_process_instances_status ON workflow_process_instances(status);
CREATE INDEX idx_workflow_process_instances_created ON workflow_process_instances(created_at DESC);

-- ============================================================================
-- Task Instances (actual task executions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_instance_id UUID NOT NULL REFERENCES workflow_process_instances(id) ON DELETE CASCADE,
  task_definition_id UUID NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
  
  -- Task details
  name TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  
  -- Input/output
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_data JSONB DEFAULT '{}'::jsonb,
  
  -- Execution tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  
  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  
  -- Logs
  logs TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_instances_process ON task_instances(process_instance_id);
CREATE INDEX idx_task_instances_definition ON task_instances(task_definition_id);
CREATE INDEX idx_task_instances_status ON task_instances(status);

-- ============================================================================
-- Workflow Schedules
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  process_definition_id UUID REFERENCES workflow_process_definitions(id) ON DELETE CASCADE,
  
  -- Schedule details
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Frequency configuration
  frequency schedule_frequency NOT NULL,
  cron_expression TEXT,  -- Used when frequency is 'custom_cron'
  
  -- Time window
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- Execution limits
  max_executions INTEGER,
  execution_count INTEGER DEFAULT 0,
  
  -- Last execution tracking
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_schedules_active ON workflow_schedules(is_active, next_execution_at) WHERE is_active = TRUE;
CREATE INDEX idx_workflow_schedules_workflow ON workflow_schedules(workflow_instance_id);

-- ============================================================================
-- URL Seed Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS url_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  
  -- URL details
  url TEXT NOT NULL,
  domain TEXT,
  normalized_url TEXT,
  
  -- Categorization
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER DEFAULT 5,
  
  -- Crawl configuration
  max_depth INTEGER DEFAULT 3,
  respect_robots_txt BOOLEAN DEFAULT TRUE,
  rate_limit_ms INTEGER DEFAULT 1000,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  last_crawled_at TIMESTAMPTZ,
  last_status_code INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (url, workflow_instance_id)
);

CREATE INDEX idx_url_seeds_workflow ON url_seeds(workflow_instance_id);
CREATE INDEX idx_url_seeds_domain ON url_seeds(domain);
CREATE INDEX idx_url_seeds_active ON url_seeds(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_url_seeds_category ON url_seeds(category);

-- ============================================================================
-- Crawl Results
-- ============================================================================

CREATE TABLE IF NOT EXISTS crawl_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_seed_id UUID REFERENCES url_seeds(id) ON DELETE CASCADE,
  process_instance_id UUID REFERENCES workflow_process_instances(id) ON DELETE CASCADE,
  
  -- Request/response details
  url TEXT NOT NULL,
  status_code INTEGER,
  content_type TEXT,
  content_length INTEGER,
  
  -- Extracted data
  title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  h1_tags TEXT[],
  h2_tags TEXT[],
  images JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  
  -- SEO data
  seo_score INTEGER,
  seo_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Performance metrics
  response_time_ms INTEGER,
  dom_content_loaded_ms INTEGER,
  load_complete_ms INTEGER,
  
  -- Content
  content_hash TEXT,
  full_content TEXT,  -- Can be large, consider external storage
  
  -- Analysis
  sentiment_score NUMERIC(3,2),
  readability_score NUMERIC(3,2),
  keyword_density JSONB DEFAULT '{}'::jsonb,
  
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crawl_results_seed ON crawl_results(url_seed_id);
CREATE INDEX idx_crawl_results_process ON crawl_results(process_instance_id);
CREATE INDEX idx_crawl_results_crawled ON crawl_results(crawled_at DESC);
CREATE INDEX idx_crawl_results_hash ON crawl_results(content_hash);

-- ============================================================================
-- Process Dependencies & Relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_process_id UUID NOT NULL REFERENCES workflow_process_definitions(id) ON DELETE CASCADE,
  child_process_id UUID NOT NULL REFERENCES workflow_process_definitions(id) ON DELETE CASCADE,
  
  -- Dependency type
  dependency_type TEXT NOT NULL,  -- 'required', 'optional', 'conditional'
  
  -- Data mapping between processes
  data_mapping JSONB DEFAULT '{}'::jsonb,  -- Maps output of parent to input of child
  
  -- Condition for execution
  execution_condition JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (parent_process_id, child_process_id)
);

CREATE INDEX idx_process_dependencies_parent ON process_dependencies(parent_process_id);
CREATE INDEX idx_process_dependencies_child ON process_dependencies(child_process_id);

-- ============================================================================
-- Seed Pre-defined Workflow Processes
-- ============================================================================

-- Web Crawling Process
INSERT INTO workflow_process_definitions (name, process_type, description, schema, input_schema, output_schema, handler_service, handler_method, tags) VALUES
(
  'Web Crawling',
  'crawling',
  'Crawl websites and extract content, links, and metadata',
  '{
    "type": "crawling",
    "capabilities": ["content_extraction", "link_discovery", "metadata_extraction"],
    "protocols": ["http", "https"]
  }'::jsonb,
  '{
    "url": {"type": "string", "required": true, "format": "url"},
    "maxDepth": {"type": "integer", "default": 3, "min": 1, "max": 10},
    "respectRobotsTxt": {"type": "boolean", "default": true},
    "rateLimit": {"type": "integer", "default": 1000, "description": "Milliseconds between requests"},
    "userAgent": {"type": "string", "default": "LightDomCrawler/1.0"},
    "includePatterns": {"type": "array", "items": {"type": "string"}},
    "excludePatterns": {"type": "array", "items": {"type": "string"}}
  }'::jsonb,
  '{
    "crawledUrls": {"type": "array", "items": {"type": "object"}},
    "totalPages": {"type": "integer"},
    "successfulCrawls": {"type": "integer"},
    "failedCrawls": {"type": "integer"},
    "extractedLinks": {"type": "array"},
    "errors": {"type": "array"}
  }'::jsonb,
  'WebCrawlerService',
  'crawlWebsite',
  ARRAY['crawling', 'web', 'extraction']
),
(
  'SEO Analysis',
  'seo_optimization',
  'Analyze web pages for SEO optimization opportunities',
  '{
    "type": "seo_analysis",
    "analyzes": ["meta_tags", "headings", "content_quality", "performance", "keywords"],
    "provides_recommendations": true
  }'::jsonb,
  '{
    "url": {"type": "string", "required": true, "format": "url"},
    "targetKeywords": {"type": "array", "items": {"type": "string"}},
    "competitorUrls": {"type": "array", "items": {"type": "string"}},
    "analyzeBacklinks": {"type": "boolean", "default": false},
    "checkMobileFriendly": {"type": "boolean", "default": true}
  }'::jsonb,
  '{
    "seoScore": {"type": "integer", "min": 0, "max": 100},
    "issues": {"type": "array"},
    "recommendations": {"type": "array"},
    "metaTagsAnalysis": {"type": "object"},
    "contentAnalysis": {"type": "object"},
    "performanceMetrics": {"type": "object"},
    "keywordDensity": {"type": "object"}
  }'::jsonb,
  'SEODataCollector',
  'analyzeSEO',
  ARRAY['seo', 'analysis', 'optimization']
),
(
  'Content Scraping',
  'scraping',
  'Extract specific content from web pages using selectors',
  '{
    "type": "scraping",
    "supports_selectors": ["css", "xpath", "regex"],
    "handles_dynamic_content": true
  }'::jsonb,
  '{
    "url": {"type": "string", "required": true, "format": "url"},
    "selectors": {"type": "object", "required": true, "description": "CSS/XPath selectors for data extraction"},
    "waitForSelector": {"type": "string", "description": "Wait for element before scraping"},
    "executeJavaScript": {"type": "string", "description": "JavaScript to run before scraping"},
    "pagination": {"type": "object", "properties": {"enabled": {"type": "boolean"}, "maxPages": {"type": "integer"}}}
  }'::jsonb,
  '{
    "extractedData": {"type": "array", "items": {"type": "object"}},
    "totalItems": {"type": "integer"},
    "pagesScraped": {"type": "integer"},
    "errors": {"type": "array"}
  }'::jsonb,
  'WebCrawlerService',
  'scrapeContent',
  ARRAY['scraping', 'extraction', 'data']
),
(
  'URL Seeding',
  'url_seeding',
  'Discover and seed URLs for crawling and analysis',
  '{
    "type": "url_seeding",
    "discovery_methods": ["sitemap", "link_extraction", "api", "manual"],
    "validates_urls": true
  }'::jsonb,
  '{
    "seedUrls": {"type": "array", "items": {"type": "string"}, "required": true},
    "discoverFromSitemap": {"type": "boolean", "default": true},
    "discoverFromLinks": {"type": "boolean", "default": true},
    "maxDepth": {"type": "integer", "default": 2},
    "filters": {"type": "object", "properties": {"includeDomains": {"type": "array"}, "excludePatterns": {"type": "array"}}}
  }'::jsonb,
  '{
    "discoveredUrls": {"type": "array", "items": {"type": "string"}},
    "totalUrls": {"type": "integer"},
    "validUrls": {"type": "integer"},
    "invalidUrls": {"type": "integer"},
    "duplicateUrls": {"type": "integer"}
  }'::jsonb,
  'WebCrawlerService',
  'seedUrls',
  ARRAY['url', 'seeding', 'discovery']
),
(
  'Content Generation',
  'content_generation',
  'Generate SEO-optimized content using AI',
  '{
    "type": "content_generation",
    "uses_ai": true,
    "supports_templates": true,
    "seo_optimized": true
  }'::jsonb,
  '{
    "topic": {"type": "string", "required": true},
    "keywords": {"type": "array", "items": {"type": "string"}, "required": true},
    "wordCount": {"type": "integer", "default": 1000, "min": 100, "max": 5000},
    "tone": {"type": "string", "enum": ["professional", "casual", "technical", "friendly"], "default": "professional"},
    "includeImages": {"type": "boolean", "default": true},
    "includeHeadings": {"type": "boolean", "default": true},
    "targetAudience": {"type": "string"}
  }'::jsonb,
  '{
    "content": {"type": "string"},
    "title": {"type": "string"},
    "metaDescription": {"type": "string"},
    "headings": {"type": "array"},
    "keywords": {"type": "array"},
    "seoScore": {"type": "integer"},
    "readabilityScore": {"type": "integer"}
  }'::jsonb,
  'ContentGeneratorService',
  'generateContent',
  ARRAY['content', 'generation', 'ai', 'seo']
);

-- ============================================================================
-- Seed Task Definitions for Each Process
-- ============================================================================

-- Web Crawling Tasks
INSERT INTO task_definitions (process_id, name, description, execution_order, schema, handler_function) VALUES
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Web Crawling'),
  'Initialize Crawler',
  'Set up crawler configuration and validate inputs',
  1,
  '{"validates": ["url", "maxDepth", "rateLimits"], "prepares": "browser_instance"}'::jsonb,
  'initializeCrawler'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Web Crawling'),
  'Fetch Robots.txt',
  'Download and parse robots.txt file',
  2,
  '{"downloads": "robots.txt", "parses_rules": true, "optional": true}'::jsonb,
  'fetchRobotsTxt'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Web Crawling'),
  'Crawl Pages',
  'Visit pages and extract content',
  3,
  '{"visits_pages": true, "extracts": ["html", "links", "metadata"], "parallel": true}'::jsonb,
  'crawlPages'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Web Crawling'),
  'Extract Links',
  'Extract and normalize links from crawled pages',
  4,
  '{"extracts": "links", "normalizes": true, "filters_duplicates": true}'::jsonb,
  'extractLinks'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Web Crawling'),
  'Store Results',
  'Save crawled data to database',
  5,
  '{"stores": "database", "creates_relationships": true}'::jsonb,
  'storeResults'
);

-- SEO Analysis Tasks
INSERT INTO task_definitions (process_id, name, description, execution_order, schema, handler_function) VALUES
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'SEO Analysis'),
  'Fetch Page Content',
  'Download and parse HTML content',
  1,
  '{"fetches": "html", "parses": true, "timeout": 30000}'::jsonb,
  'fetchPageContent'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'SEO Analysis'),
  'Analyze Meta Tags',
  'Extract and analyze meta tags',
  2,
  '{"analyzes": ["title", "description", "keywords", "og_tags"], "validates_length": true}'::jsonb,
  'analyzeMetaTags'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'SEO Analysis'),
  'Analyze Content',
  'Analyze content quality and keyword usage',
  3,
  '{"analyzes": ["headings", "paragraphs", "keywords", "readability"]}'::jsonb,
  'analyzeContent'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'SEO Analysis'),
  'Check Performance',
  'Measure page load performance',
  4,
  '{"measures": ["load_time", "dom_content_loaded", "first_contentful_paint"], "parallel": true}'::jsonb,
  'checkPerformance'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'SEO Analysis'),
  'Generate Recommendations',
  'Create SEO improvement recommendations',
  5,
  '{"generates": "recommendations", "prioritizes": true, "ai_enhanced": true}'::jsonb,
  'generateRecommendations'
);

-- Content Scraping Tasks
INSERT INTO task_definitions (process_id, name, description, execution_order, schema, handler_function) VALUES
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Scraping'),
  'Navigate to Page',
  'Open browser and navigate to target URL',
  1,
  '{"opens_browser": true, "handles_redirects": true, "timeout": 30000}'::jsonb,
  'navigateToPage'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Scraping'),
  'Wait for Content',
  'Wait for dynamic content to load',
  2,
  '{"waits_for": "selector", "max_wait": 10000, "optional": true}'::jsonb,
  'waitForContent'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Scraping'),
  'Extract Data',
  'Extract data using provided selectors',
  3,
  '{"uses_selectors": ["css", "xpath"], "handles_multiple": true}'::jsonb,
  'extractData'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Scraping'),
  'Transform Data',
  'Transform and clean extracted data',
  4,
  '{"cleans": true, "validates": true, "transforms": "structured_format"}'::jsonb,
  'transformData'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Scraping'),
  'Handle Pagination',
  'Navigate to next page if pagination is enabled',
  5,
  '{"handles_pagination": true, "max_pages": 10, "optional": true}'::jsonb,
  'handlePagination'
);

-- URL Seeding Tasks
INSERT INTO task_definitions (process_id, name, description, execution_order, schema, handler_function) VALUES
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'URL Seeding'),
  'Validate Seed URLs',
  'Validate and normalize seed URLs',
  1,
  '{"validates": "url_format", "normalizes": true, "removes_duplicates": true}'::jsonb,
  'validateSeedUrls'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'URL Seeding'),
  'Fetch Sitemaps',
  'Download and parse XML sitemaps',
  2,
  '{"fetches": "sitemap.xml", "parses": true, "follows_sitemap_index": true}'::jsonb,
  'fetchSitemaps'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'URL Seeding'),
  'Discover from Links',
  'Discover URLs by following links',
  3,
  '{"follows_links": true, "max_depth": 2, "respects_filters": true, "parallel": true}'::jsonb,
  'discoverFromLinks'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'URL Seeding'),
  'Categorize URLs',
  'Categorize discovered URLs',
  4,
  '{"categorizes": true, "assigns_priority": true, "groups_by_domain": true}'::jsonb,
  'categorizeUrls'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'URL Seeding'),
  'Store Seeds',
  'Save URL seeds to database',
  5,
  '{"stores": "database", "prevents_duplicates": true}'::jsonb,
  'storeSeeds'
);

-- Content Generation Tasks
INSERT INTO task_definitions (process_id, name, description, execution_order, schema, handler_function) VALUES
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Generation'),
  'Research Topic',
  'Gather information about the topic',
  1,
  '{"researches": true, "ai_enhanced": true, "uses_existing_content": true}'::jsonb,
  'researchTopic'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Generation'),
  'Generate Outline',
  'Create content structure and outline',
  2,
  '{"generates": "outline", "includes_headings": true, "seo_optimized": true}'::jsonb,
  'generateOutline'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Generation'),
  'Write Content',
  'Generate main content using AI',
  3,
  '{"uses_ai": true, "model": "gpt-4", "includes_keywords": true, "target_word_count": true}'::jsonb,
  'writeContent'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Generation'),
  'Optimize for SEO',
  'Optimize content for search engines',
  4,
  '{"optimizes": ["keywords", "headings", "meta_tags"], "checks_readability": true}'::jsonb,
  'optimizeForSEO'
),
(
  (SELECT id FROM workflow_process_definitions WHERE name = 'Content Generation'),
  'Generate Metadata',
  'Create title, description, and other metadata',
  5,
  '{"generates": ["title", "meta_description", "keywords"], "character_limits": true}'::jsonb,
  'generateMetadata'
);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_workflow_process_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_workflow_process_definitions_updated') THEN
    CREATE TRIGGER trg_workflow_process_definitions_updated
      BEFORE UPDATE ON workflow_process_definitions
      FOR EACH ROW EXECUTE FUNCTION update_workflow_process_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_workflow_process_instances_updated') THEN
    CREATE TRIGGER trg_workflow_process_instances_updated
      BEFORE UPDATE ON workflow_process_instances
      FOR EACH ROW EXECUTE FUNCTION update_workflow_process_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_url_seeds_updated') THEN
    CREATE TRIGGER trg_url_seeds_updated
      BEFORE UPDATE ON url_seeds
      FOR EACH ROW EXECUTE FUNCTION update_workflow_process_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_workflow_schedules_updated') THEN
    CREATE TRIGGER trg_workflow_schedules_updated
      BEFORE UPDATE ON workflow_schedules
      FOR EACH ROW EXECUTE FUNCTION update_workflow_process_updated_at();
  END IF;
END$$;

-- ============================================================================
-- Views for easy querying
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_process_summary AS
SELECT 
  wpd.id AS process_id,
  wpd.name AS process_name,
  wpd.process_type,
  wpd.is_active,
  COUNT(DISTINCT td.id) AS task_count,
  COUNT(DISTINCT wpi.id) AS instance_count,
  COUNT(DISTINCT wpi.id) FILTER (WHERE wpi.status = 'completed') AS completed_count,
  COUNT(DISTINCT wpi.id) FILTER (WHERE wpi.status = 'failed') AS failed_count,
  COUNT(DISTINCT wpi.id) FILTER (WHERE wpi.status = 'running') AS running_count,
  AVG(wpi.execution_time_ms) AS avg_execution_time_ms
FROM workflow_process_definitions wpd
LEFT JOIN task_definitions td ON td.process_id = wpd.id
LEFT JOIN workflow_process_instances wpi ON wpi.process_definition_id = wpd.id
GROUP BY wpd.id, wpd.name, wpd.process_type, wpd.is_active;

CREATE OR REPLACE VIEW v_active_schedules AS
SELECT 
  ws.*,
  wpd.name AS process_name,
  wpd.process_type,
  wi.name AS workflow_name
FROM workflow_schedules ws
JOIN workflow_process_definitions wpd ON wpd.id = ws.process_definition_id
LEFT JOIN workflow_instances wi ON wi.id = ws.workflow_instance_id
WHERE ws.is_active = TRUE
  AND (ws.end_date IS NULL OR ws.end_date > NOW())
  AND (ws.max_executions IS NULL OR ws.execution_count < ws.max_executions)
ORDER BY ws.next_execution_at ASC;

COMMENT ON TABLE workflow_process_definitions IS 'Defines reusable workflow processes (crawling, SEO, etc.)';
COMMENT ON TABLE task_definitions IS 'Defines sub-tasks that make up each process';
COMMENT ON TABLE workflow_process_instances IS 'Actual executions of workflow processes';
COMMENT ON TABLE task_instances IS 'Actual executions of individual tasks';
COMMENT ON TABLE workflow_schedules IS 'Scheduling configuration for automated workflow execution';
COMMENT ON TABLE url_seeds IS 'URLs to be crawled or analyzed';
COMMENT ON TABLE crawl_results IS 'Results from web crawling operations';
