-- SEO Workflow and Campaign Management Tables
-- Supports 192+ stat mining with configurable workflows and task tracking

-- SEO Campaign Workflows Table
CREATE TABLE IF NOT EXISTS seo_campaign_workflows (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    workflow_type VARCHAR(100) NOT NULL, -- 'mining', 'analysis', 'optimization', etc.
    n8n_workflow_id VARCHAR(255),
    n8n_workflow_url TEXT,
    deepseek_prompt TEXT,
    generated_config JSONB,
    execution_count INTEGER DEFAULT 0,
    last_execution_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_seo_workflows_campaign ON seo_campaign_workflows(campaign_id);
CREATE INDEX idx_seo_workflows_status ON seo_campaign_workflows(status);
CREATE INDEX idx_seo_workflows_type ON seo_campaign_workflows(workflow_type);

-- SEO Attributes Configuration Table (192 stats)
CREATE TABLE IF NOT EXISTS seo_attributes_config (
    id SERIAL PRIMARY KEY,
    attribute_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL, -- 'seo_core', 'performance', 'structured_data', etc.
    description TEXT,
    data_type VARCHAR(50), -- 'string', 'number', 'boolean', 'array', 'object'
    extraction_algorithm TEXT,
    deepseek_prompt TEXT,
    component_schema JSONB,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_attrs_category ON seo_attributes_config(category);
CREATE INDEX idx_seo_attrs_active ON seo_attributes_config(is_active);

-- Workflow Tasks Table
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES seo_campaign_workflows(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL, -- 'attribute_mining', 'component_generation', 'analysis'
    attribute_id INTEGER REFERENCES seo_attributes_config(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    progress DECIMAL(5,2) DEFAULT 0.00,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_workflow_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX idx_workflow_tasks_status ON workflow_tasks(status);
CREATE INDEX idx_workflow_tasks_type ON workflow_tasks(task_type);

-- Workflow Execution History
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES seo_campaign_workflows(id) ON DELETE CASCADE,
    execution_status VARCHAR(50) DEFAULT 'running',
    trigger_type VARCHAR(100), -- 'manual', 'scheduled', 'webhook'
    input_data JSONB,
    output_data JSONB,
    error_details TEXT,
    duration_ms INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_workflow_exec_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_exec_status ON workflow_executions(execution_status);
CREATE INDEX idx_workflow_exec_started ON workflow_executions(started_at);

-- User Sessions for Interactive Prompting
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255),
    campaign_id VARCHAR(255),
    session_type VARCHAR(100) DEFAULT 'workflow_creation',
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    conversation_history JSONB DEFAULT '[]'::jsonb,
    generated_schemas JSONB DEFAULT '{}'::jsonb,
    workflow_ids INTEGER[],
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);

-- N8N Workflow Templates
CREATE TABLE IF NOT EXISTS n8n_workflow_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    template_type VARCHAR(100) NOT NULL,
    description TEXT,
    n8n_workflow_json JSONB NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_n8n_templates_type ON n8n_workflow_templates(template_type);
CREATE INDEX idx_n8n_templates_active ON n8n_workflow_templates(is_active);

-- Insert default 192 SEO attributes
INSERT INTO seo_attributes_config (attribute_name, category, description, data_type, priority) VALUES
-- SEO Core (30 attributes)
('page_title', 'seo_core', 'HTML title tag content', 'string', 10),
('meta_description', 'seo_core', 'Meta description tag content', 'string', 10),
('meta_keywords', 'seo_core', 'Meta keywords tag content', 'string', 5),
('h1_heading', 'seo_core', 'Primary H1 heading text', 'string', 9),
('h2_headings', 'seo_core', 'All H2 heading texts', 'array', 8),
('h3_headings', 'seo_core', 'All H3 heading texts', 'array', 7),
('canonical_url', 'seo_core', 'Canonical URL tag', 'string', 9),
('robots_meta', 'seo_core', 'Robots meta tag directives', 'string', 8),
('internal_links_count', 'seo_core', 'Number of internal links', 'number', 7),
('external_links_count', 'seo_core', 'Number of external links', 'number', 7),
('image_count', 'seo_core', 'Total images on page', 'number', 6),
('images_with_alt', 'seo_core', 'Images with alt text', 'number', 8),
('word_count', 'seo_core', 'Total word count', 'number', 7),
('keyword_density', 'seo_core', 'Primary keyword density', 'number', 6),
('content_length', 'seo_core', 'Content length in characters', 'number', 6),
('url_structure', 'seo_core', 'URL structure analysis', 'object', 7),
('breadcrumbs_present', 'seo_core', 'Breadcrumb navigation present', 'boolean', 6),
('lang_attribute', 'seo_core', 'HTML lang attribute', 'string', 5),
('hreflang_tags', 'seo_core', 'Hreflang alternate tags', 'array', 6),
('viewport_meta', 'seo_core', 'Viewport meta tag', 'string', 7),
('social_share_buttons', 'seo_core', 'Social sharing buttons count', 'number', 4),
('schema_markup_present', 'seo_core', 'Schema.org markup detected', 'boolean', 9),
('heading_hierarchy', 'seo_core', 'Proper heading hierarchy', 'boolean', 7),
('duplicate_content', 'seo_core', 'Duplicate content detected', 'boolean', 8),
('thin_content', 'seo_core', 'Thin content warning', 'boolean', 7),
('keyword_in_title', 'seo_core', 'Target keyword in title', 'boolean', 9),
('keyword_in_h1', 'seo_core', 'Target keyword in H1', 'boolean', 9),
('keyword_in_url', 'seo_core', 'Target keyword in URL', 'boolean', 8),
('keyword_in_meta', 'seo_core', 'Target keyword in meta description', 'boolean', 8),
('outbound_link_quality', 'seo_core', 'Outbound link quality score', 'number', 6),

-- Structured Data (25 attributes)
('jsonld_organization', 'structured_data', 'Organization JSON-LD schema', 'object', 8),
('jsonld_person', 'structured_data', 'Person JSON-LD schema', 'object', 7),
('jsonld_product', 'structured_data', 'Product JSON-LD schema', 'object', 9),
('jsonld_article', 'structured_data', 'Article JSON-LD schema', 'object', 8),
('jsonld_breadcrumb', 'structured_data', 'BreadcrumbList JSON-LD schema', 'object', 7),
('jsonld_review', 'structured_data', 'Review JSON-LD schema', 'object', 8),
('jsonld_faq', 'structured_data', 'FAQPage JSON-LD schema', 'object', 7),
('jsonld_howto', 'structured_data', 'HowTo JSON-LD schema', 'object', 6),
('jsonld_recipe', 'structured_data', 'Recipe JSON-LD schema', 'object', 6),
('jsonld_event', 'structured_data', 'Event JSON-LD schema', 'object', 7),
('og_title', 'structured_data', 'Open Graph title', 'string', 8),
('og_description', 'structured_data', 'Open Graph description', 'string', 8),
('og_image', 'structured_data', 'Open Graph image URL', 'string', 8),
('og_url', 'structured_data', 'Open Graph URL', 'string', 7),
('og_type', 'structured_data', 'Open Graph type', 'string', 7),
('twitter_card', 'structured_data', 'Twitter Card type', 'string', 8),
('twitter_title', 'structured_data', 'Twitter title', 'string', 7),
('twitter_description', 'structured_data', 'Twitter description', 'string', 7),
('twitter_image', 'structured_data', 'Twitter image URL', 'string', 7),
('twitter_site', 'structured_data', 'Twitter site handle', 'string', 6),
('microdata_present', 'structured_data', 'Microdata detected', 'boolean', 6),
('rdfa_present', 'structured_data', 'RDFa markup detected', 'boolean', 5),
('schema_validation', 'structured_data', 'Schema validation status', 'object', 9),
('rich_snippet_eligible', 'structured_data', 'Eligible for rich snippets', 'boolean', 9),
('structured_data_types', 'structured_data', 'All structured data types found', 'array', 8),

-- Performance (20 attributes)
('page_load_time', 'performance', 'Total page load time (ms)', 'number', 10),
('time_to_first_byte', 'performance', 'TTFB (ms)', 'number', 9),
('first_contentful_paint', 'performance', 'FCP (ms)', 'number', 9),
('largest_contentful_paint', 'performance', 'LCP (ms)', 'number', 10),
('cumulative_layout_shift', 'performance', 'CLS score', 'number', 10),
('first_input_delay', 'performance', 'FID (ms)', 'number', 9),
('time_to_interactive', 'performance', 'TTI (ms)', 'number', 9),
('total_blocking_time', 'performance', 'TBT (ms)', 'number', 8),
('speed_index', 'performance', 'Speed Index', 'number', 8),
('dom_content_loaded', 'performance', 'DOMContentLoaded time (ms)', 'number', 7),
('page_size_kb', 'performance', 'Total page size (KB)', 'number', 7),
('html_size_kb', 'performance', 'HTML size (KB)', 'number', 6),
('css_size_kb', 'performance', 'CSS size (KB)', 'number', 6),
('js_size_kb', 'performance', 'JavaScript size (KB)', 'number', 7),
('image_size_kb', 'performance', 'Images size (KB)', 'number', 7),
('requests_count', 'performance', 'Total HTTP requests', 'number', 6),
('server_response_time', 'performance', 'Server response time (ms)', 'number', 8),
('render_blocking_resources', 'performance', 'Render-blocking resources count', 'number', 8),
('unused_css_kb', 'performance', 'Unused CSS (KB)', 'number', 6),
('unused_js_kb', 'performance', 'Unused JavaScript (KB)', 'number', 6),

-- Content Quality (25 attributes)
('readability_score', 'content_quality', 'Flesch Reading Ease score', 'number', 8),
('grammar_errors', 'content_quality', 'Grammar errors count', 'number', 7),
('spelling_errors', 'content_quality', 'Spelling errors count', 'number', 7),
('sentence_count', 'content_quality', 'Total sentences', 'number', 5),
('paragraph_count', 'content_quality', 'Total paragraphs', 'number', 5),
('avg_sentence_length', 'content_quality', 'Average sentence length (words)', 'number', 6),
('avg_paragraph_length', 'content_quality', 'Average paragraph length (words)', 'number', 6),
('passive_voice_percent', 'content_quality', 'Passive voice percentage', 'number', 5),
('transition_words_percent', 'content_quality', 'Transition words percentage', 'number', 5),
('content_freshness', 'content_quality', 'Last updated timestamp', 'string', 7),
('author_present', 'content_quality', 'Author information present', 'boolean', 6),
('publish_date_present', 'content_quality', 'Publish date present', 'boolean', 6),
('multimedia_count', 'content_quality', 'Videos and other media count', 'number', 6),
('list_count', 'content_quality', 'Lists (UL/OL) count', 'number', 5),
('table_count', 'content_quality', 'Tables count', 'number', 4),
('code_block_count', 'content_quality', 'Code blocks count', 'number', 4),
('quote_count', 'content_quality', 'Blockquotes count', 'number', 4),
('external_references', 'content_quality', 'External references/citations count', 'number', 6),
('content_uniqueness', 'content_quality', 'Content uniqueness score', 'number', 8),
('topical_authority', 'content_quality', 'Topic authority score', 'number', 7),
('eeat_signals', 'content_quality', 'E-E-A-T signals detected', 'object', 8),
('content_depth', 'content_quality', 'Content depth score', 'number', 7),
('internal_link_context', 'content_quality', 'Internal links contextual relevance', 'number', 6),
('content_structure', 'content_quality', 'Content structure quality', 'number', 7),
('call_to_action', 'content_quality', 'CTA present', 'boolean', 5),

-- Technical SEO (22 attributes)
('https_enabled', 'technical_seo', 'HTTPS protocol enabled', 'boolean', 10),
('ssl_certificate_valid', 'technical_seo', 'SSL certificate validity', 'boolean', 10),
('sitemap_xml_present', 'technical_seo', 'XML sitemap exists', 'boolean', 9),
('robots_txt_present', 'technical_seo', 'robots.txt exists', 'boolean', 8),
('404_errors', 'technical_seo', '404 error count', 'number', 8),
('301_redirects', 'technical_seo', '301 redirect count', 'number', 6),
('302_redirects', 'technical_seo', '302 redirect count', 'number', 5),
('redirect_chains', 'technical_seo', 'Redirect chains detected', 'number', 7),
('broken_links', 'technical_seo', 'Broken links count', 'number', 8),
('mobile_friendly', 'technical_seo', 'Mobile-friendly test passed', 'boolean', 10),
('responsive_design', 'technical_seo', 'Responsive design implemented', 'boolean', 9),
('amp_version', 'technical_seo', 'AMP version available', 'boolean', 5),
('lazy_loading', 'technical_seo', 'Image lazy loading implemented', 'boolean', 7),
('compression_enabled', 'technical_seo', 'GZIP/Brotli compression', 'boolean', 8),
('browser_caching', 'technical_seo', 'Browser caching configured', 'boolean', 7),
('cdn_usage', 'technical_seo', 'CDN in use', 'boolean', 7),
('http2_enabled', 'technical_seo', 'HTTP/2 protocol enabled', 'boolean', 7),
('xml_sitemap_errors', 'technical_seo', 'Sitemap errors count', 'number', 7),
('indexability_issues', 'technical_seo', 'Indexability issues count', 'number', 9),
('crawlability_score', 'technical_seo', 'Crawlability score', 'number', 8),
('security_headers', 'technical_seo', 'Security headers present', 'object', 7),
('mixed_content', 'technical_seo', 'Mixed content warnings', 'number', 8),

-- 3D Layer Analysis (20 attributes)
('composited_layers', '3d_layers', 'Number of composited layers', 'number', 6),
('layer_tree_depth', '3d_layers', 'Layer tree depth', 'number', 5),
('paint_count', '3d_layers', 'Paint operation count', 'number', 6),
('layout_shifts', '3d_layers', 'Layout shift events', 'number', 7),
('forced_reflows', '3d_layers', 'Forced reflow count', 'number', 7),
('gpu_memory_usage', '3d_layers', 'GPU memory usage (MB)', 'number', 6),
('texture_uploads', '3d_layers', 'Texture upload count', 'number', 5),
('layer_animations', '3d_layers', 'Animated layers count', 'number', 5),
('transform_layers', '3d_layers', 'Transform layers count', 'number', 5),
('opacity_layers', '3d_layers', 'Opacity layers count', 'number', 5),
('will_change_usage', '3d_layers', 'will-change property usage', 'number', 6),
('backface_visibility', '3d_layers', 'backface-visibility usage', 'number', 4),
('perspective_usage', '3d_layers', 'perspective property usage', 'number', 4),
('z_index_layers', '3d_layers', 'z-index stacking contexts', 'number', 5),
('paint_areas', '3d_layers', 'Paint areas (px²)', 'number', 5),
('layer_promotion_candidates', '3d_layers', 'Layer promotion candidates', 'number', 6),
('rendering_performance', '3d_layers', 'Rendering performance score', 'number', 7),
('compositing_reasons', '3d_layers', 'Layer compositing reasons', 'array', 5),
('layer_boundaries', '3d_layers', 'Layer boundary count', 'number', 5),
('main_thread_work', '3d_layers', 'Main thread work (ms)', 'number', 7),

-- Visual Design (20 attributes)
('color_palette', 'visual_design', 'Primary color palette', 'array', 6),
('typography_fonts', 'visual_design', 'Fonts used', 'array', 6),
('font_sizes', 'visual_design', 'Font sizes detected', 'array', 5),
('line_heights', 'visual_design', 'Line heights used', 'array', 4),
('spacing_scale', 'visual_design', 'Spacing/padding scale', 'array', 5),
('border_radius_values', 'visual_design', 'Border radius values', 'array', 4),
('box_shadows', 'visual_design', 'Box shadow styles', 'array', 4),
('animation_count', 'visual_design', 'CSS animations count', 'number', 5),
('transition_count', 'visual_design', 'CSS transitions count', 'number', 5),
('svg_usage', 'visual_design', 'SVG elements count', 'number', 5),
('icon_library', 'visual_design', 'Icon library detected', 'string', 4),
('design_system', 'visual_design', 'Design system/framework', 'string', 6),
('component_library', 'visual_design', 'UI component library', 'string', 5),
('layout_type', 'visual_design', 'Layout type (grid/flex/etc)', 'string', 5),
('responsive_breakpoints', 'visual_design', 'Responsive breakpoints', 'array', 6),
('contrast_ratio', 'visual_design', 'Color contrast ratio', 'number', 7),
('visual_consistency', 'visual_design', 'Visual consistency score', 'number', 6),
('white_space_usage', 'visual_design', 'White space usage score', 'number', 5),
('visual_hierarchy', 'visual_design', 'Visual hierarchy score', 'number', 6),
('brand_consistency', 'visual_design', 'Brand consistency score', 'number', 5),

-- User Experience (15 attributes)
('navigation_clarity', 'user_experience', 'Navigation clarity score', 'number', 7),
('search_functionality', 'user_experience', 'Search feature present', 'boolean', 6),
('filter_options', 'user_experience', 'Filter/sort options count', 'number', 5),
('form_count', 'user_experience', 'Forms on page', 'number', 5),
('form_validation', 'user_experience', 'Form validation present', 'boolean', 6),
('error_messages', 'user_experience', 'Error message quality', 'number', 5),
('loading_indicators', 'user_experience', 'Loading indicators present', 'boolean', 5),
('breadcrumb_navigation', 'user_experience', 'Breadcrumb navigation quality', 'number', 6),
('footer_links', 'user_experience', 'Footer links count', 'number', 4),
('contact_info', 'user_experience', 'Contact information present', 'boolean', 6),
('privacy_policy', 'user_experience', 'Privacy policy linked', 'boolean', 6),
('terms_of_service', 'user_experience', 'Terms of service linked', 'boolean', 5),
('trust_signals', 'user_experience', 'Trust signals count', 'number', 6),
('accessibility_score', 'user_experience', 'Accessibility score', 'number', 9),
('user_engagement', 'user_experience', 'User engagement score', 'number', 7),

-- Competitor Metrics (15 attributes)
('competitor_keyword_gap', 'competitor_metrics', 'Keyword gap analysis', 'object', 7),
('competitor_backlinks', 'competitor_metrics', 'Competitor backlink count', 'object', 7),
('competitor_domain_authority', 'competitor_metrics', 'Competitor DA scores', 'object', 7),
('competitor_page_authority', 'competitor_metrics', 'Competitor PA scores', 'object', 6),
('competitor_rankings', 'competitor_metrics', 'Competitor keyword rankings', 'object', 8),
('competitor_traffic', 'competitor_metrics', 'Competitor traffic estimates', 'object', 7),
('competitor_content_gap', 'competitor_metrics', 'Content gap analysis', 'object', 7),
('competitor_tech_stack', 'competitor_metrics', 'Competitor tech stack', 'object', 5),
('competitor_performance', 'competitor_metrics', 'Competitor performance scores', 'object', 6),
('competitor_social_signals', 'competitor_metrics', 'Social signals comparison', 'object', 5),
('competitive_advantage', 'competitor_metrics', 'Competitive advantage areas', 'array', 6),
('competitive_weakness', 'competitor_metrics', 'Competitive weakness areas', 'array', 6),
('market_position', 'competitor_metrics', 'Market position ranking', 'number', 7),
('share_of_voice', 'competitor_metrics', 'Share of voice percentage', 'number', 6),
('competitor_count', 'competitor_metrics', 'Active competitors tracked', 'number', 5)
ON CONFLICT (attribute_name) DO NOTHING;

COMMENT ON TABLE seo_campaign_workflows IS 'Stores N8N workflow configurations for SEO campaigns';
COMMENT ON TABLE seo_attributes_config IS 'Configuration for all 192+ SEO attributes to be mined';
COMMENT ON TABLE workflow_tasks IS 'Individual tasks within workflows with progress tracking';
COMMENT ON TABLE workflow_executions IS 'Historical record of workflow executions';
COMMENT ON TABLE user_sessions IS 'Interactive prompt sessions for workflow creation';
COMMENT ON TABLE n8n_workflow_templates IS 'N8N workflow templates for common SEO tasks';
