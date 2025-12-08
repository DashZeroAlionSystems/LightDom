-- AI Research Pipeline Database Schema
-- Comprehensive schema for AI/ML/LLM research article management and analysis

-- Article sources and monitoring
CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'blog', 'documentation', 'forum', 'repository'
    topics TEXT[] DEFAULT ARRAY['ai', 'ml', 'llm', 'nlp', 'deep-learning'],
    scraping_schedule VARCHAR(50) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    last_scraped_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    rate_limit_per_hour INTEGER DEFAULT 100,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research articles collected
CREATE TABLE IF NOT EXISTS research_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES research_sources(id),
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author VARCHAR(255),
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    excerpt TEXT,
    tags TEXT[],
    reading_time_minutes INTEGER,
    word_count INTEGER,
    code_examples_count INTEGER DEFAULT 0,
    has_implementation BOOLEAN DEFAULT false,
    relevance_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    priority_score INTEGER DEFAULT 0, -- 0-100
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'analyzed', 'implemented', 'archived'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extracted topics and keywords
CREATE TABLE IF NOT EXISTS research_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100), -- 'ai', 'ml', 'llm', 'nlp', 'computer-vision', 'reinforcement-learning'
    description TEXT,
    parent_topic_id UUID REFERENCES research_topics(id),
    article_count INTEGER DEFAULT 0,
    trending_score DECIMAL(5,2) DEFAULT 0.0,
    is_actionable BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article-topic relationships
CREATE TABLE IF NOT EXISTS article_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES research_articles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES research_topics(id) ON DELETE CASCADE,
    relevance_weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, topic_id)
);

-- Code examples extracted from articles
CREATE TABLE IF NOT EXISTS research_code_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES research_articles(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    code_snippet TEXT NOT NULL,
    description TEXT,
    context TEXT,
    line_count INTEGER,
    is_complete BOOLEAN DEFAULT false,
    quality_score DECIMAL(3,2) DEFAULT 0.5,
    is_tested BOOLEAN DEFAULT false,
    implementation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product feature recommendations derived from research
CREATE TABLE IF NOT EXISTS feature_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES research_articles(id),
    feature_name VARCHAR(255) NOT NULL,
    feature_description TEXT,
    category VARCHAR(100), -- 'enhancement', 'new-feature', 'optimization', 'integration'
    impact_level VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    effort_estimate VARCHAR(50) DEFAULT 'medium', -- 'small', 'medium', 'large', 'x-large'
    revenue_potential VARCHAR(50), -- 'none', 'low', 'medium', 'high'
    implementation_complexity INTEGER DEFAULT 5, -- 1-10
    status VARCHAR(50) DEFAULT 'proposed', -- 'proposed', 'approved', 'in-progress', 'completed', 'rejected'
    related_features TEXT[],
    dependencies TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research campaigns for continuous monitoring
CREATE TABLE IF NOT EXISTS research_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) DEFAULT 'continuous', -- 'one-time', 'continuous', 'scheduled'
    search_queries TEXT[],
    target_sources UUID[],
    topic_filters TEXT[],
    schedule_cron VARCHAR(100), -- cron expression for scheduling
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    total_articles_found INTEGER DEFAULT 0,
    total_features_identified INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO insights and patterns from research
CREATE TABLE IF NOT EXISTS seo_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES research_articles(id),
    pattern_type VARCHAR(100), -- 'keyword', 'structure', 'meta', 'content-length', 'link-strategy'
    pattern_name VARCHAR(255),
    pattern_data JSONB NOT NULL,
    effectiveness_score DECIMAL(3,2) DEFAULT 0.5,
    applicability VARCHAR(50) DEFAULT 'high', -- 'low', 'medium', 'high'
    implementation_examples TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service packages generated from research
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    package_type VARCHAR(100), -- 'seo', 'ai-consulting', 'integration', 'optimization', 'training'
    features TEXT[],
    pricing_tier VARCHAR(50), -- 'basic', 'professional', 'enterprise', 'custom'
    estimated_revenue DECIMAL(10,2),
    development_cost DECIMAL(10,2),
    time_to_market_days INTEGER,
    target_market TEXT[],
    competitive_advantage TEXT,
    based_on_articles UUID[],
    status VARCHAR(50) DEFAULT 'concept', -- 'concept', 'validated', 'development', 'launched'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product research papers generated
CREATE TABLE IF NOT EXISTS research_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    executive_summary TEXT,
    full_content TEXT,
    paper_type VARCHAR(100) DEFAULT 'feature-analysis', -- 'feature-analysis', 'market-research', 'technical-review', 'integration-guide'
    focus_areas TEXT[],
    key_findings TEXT[],
    recommendations TEXT[],
    related_articles UUID[],
    related_features UUID[],
    related_packages UUID[],
    confidence_score DECIMAL(3,2) DEFAULT 0.7,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'published', 'archived'
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis jobs and their results
CREATE TABLE IF NOT EXISTS research_analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(100) NOT NULL, -- 'article-analysis', 'feature-extraction', 'seo-pattern', 'code-extraction'
    input_data JSONB NOT NULL,
    output_data JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    priority INTEGER DEFAULT 5,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_source ON research_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON research_articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_relevance ON research_articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_priority ON research_articles(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_scraped ON research_articles(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON research_articles USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_topics_category ON research_topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_trending ON research_topics(trending_score DESC);

CREATE INDEX IF NOT EXISTS idx_code_language ON research_code_examples(language);
CREATE INDEX IF NOT EXISTS idx_code_quality ON research_code_examples(quality_score DESC);

CREATE INDEX IF NOT EXISTS idx_features_status ON feature_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_features_impact ON feature_recommendations(impact_level);
CREATE INDEX IF NOT EXISTS idx_features_revenue ON feature_recommendations(revenue_potential);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON research_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_next_run ON research_campaigns(next_run_at);

CREATE INDEX IF NOT EXISTS idx_seo_effectiveness ON seo_insights(effectiveness_score DESC);

CREATE INDEX IF NOT EXISTS idx_packages_status ON service_packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_tier ON service_packages(pricing_tier);

CREATE INDEX IF NOT EXISTS idx_papers_status ON research_papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_generated ON research_papers(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON research_analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON research_analysis_jobs(priority DESC);

-- Insert initial research sources
INSERT INTO research_sources (name, base_url, source_type, topics) VALUES
    ('Dev.to', 'https://dev.to', 'blog', ARRAY['ai', 'ml', 'llm', 'nlp', 'deep-learning', 'automation']),
    ('Medium AI', 'https://medium.com/tag/artificial-intelligence', 'blog', ARRAY['ai', 'ml', 'data-science']),
    ('Towards Data Science', 'https://towardsdatascience.com', 'blog', ARRAY['ml', 'data-science', 'nlp']),
    ('Hugging Face Blog', 'https://huggingface.co/blog', 'blog', ARRAY['llm', 'transformers', 'nlp']),
    ('OpenAI Blog', 'https://openai.com/blog', 'blog', ARRAY['ai', 'llm', 'gpt']),
    ('Google AI Blog', 'https://ai.googleblog.com', 'blog', ARRAY['ai', 'ml', 'research'])
ON CONFLICT DO NOTHING;

-- Insert common AI/ML topics
INSERT INTO research_topics (name, category, description) VALUES
    ('Large Language Models', 'llm', 'GPT, BERT, and other transformer-based language models'),
    ('Natural Language Processing', 'nlp', 'Text processing, understanding, and generation'),
    ('Machine Learning', 'ml', 'General machine learning algorithms and techniques'),
    ('Deep Learning', 'ml', 'Neural networks and deep learning architectures'),
    ('AI Agents', 'ai', 'Autonomous AI agents and multi-agent systems'),
    ('Prompt Engineering', 'llm', 'Techniques for crafting effective prompts'),
    ('RAG (Retrieval Augmented Generation)', 'llm', 'Combining retrieval with generation'),
    ('Fine-tuning', 'ml', 'Model adaptation and transfer learning'),
    ('Computer Vision', 'ai', 'Image and video processing with AI'),
    ('Reinforcement Learning', 'ml', 'Learning through interaction and rewards'),
    ('AI Ethics', 'ai', 'Responsible AI and ethical considerations'),
    ('MLOps', 'ml', 'ML operations and deployment practices'),
    ('Vector Databases', 'ai', 'Semantic search and embeddings storage'),
    ('Agentic AI', 'ai', 'AI systems with autonomous decision-making'),
    ('SEO Automation', 'ai', 'AI-powered SEO tools and techniques')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE research_sources IS 'Sources for research article scraping and monitoring';
COMMENT ON TABLE research_articles IS 'Collected research articles from various sources';
COMMENT ON TABLE research_topics IS 'AI/ML/LLM topics and their relationships';
COMMENT ON TABLE article_topics IS 'Many-to-many relationship between articles and topics';
COMMENT ON TABLE research_code_examples IS 'Code examples extracted from research articles';
COMMENT ON TABLE feature_recommendations IS 'Product features recommended based on research';
COMMENT ON TABLE research_campaigns IS 'Automated campaigns for continuous research monitoring';
COMMENT ON TABLE seo_insights IS 'SEO patterns and insights extracted from successful content';
COMMENT ON TABLE service_packages IS 'Service offerings generated from research insights';
COMMENT ON TABLE research_papers IS 'Generated product research papers';
COMMENT ON TABLE research_analysis_jobs IS 'Background jobs for research analysis';
