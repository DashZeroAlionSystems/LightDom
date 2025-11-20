-- ============================================================================
-- 24/7 Continuous Scraping System Schema
-- ============================================================================
-- Description: Database schema for continuous web scraping with resource
--              management, no-duplicate scraping, and comprehensive tracking
-- Created: 2025-11-13
-- ============================================================================

-- Scraping Queue Table
-- Stores all scraping jobs to be processed
CREATE TABLE IF NOT EXISTS scraping_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
    metadata JSONB DEFAULT '{}',
    retries INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    notes TEXT,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Indexes for performance
    CONSTRAINT unique_pending_url UNIQUE (url, status) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_scraping_queue_status ON scraping_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_priority ON scraping_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_scheduled ON scraping_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_url ON scraping_queue(url);

-- Scraped URLs Table
-- Tracks all URLs that have been scraped to prevent duplicates
CREATE TABLE IF NOT EXISTS scraped_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    url_hash VARCHAR(64) GENERATED ALWAYS AS (encode(sha256(url::bytea), 'hex')) STORED,
    status VARCHAR(50) DEFAULT 'completed',
    first_scraped_at TIMESTAMP DEFAULT NOW(),
    last_scraped_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    scrape_count INTEGER DEFAULT 1,
    schema_version INTEGER DEFAULT 1, -- For re-scraping when schema changes
    
    -- Metadata
    domain VARCHAR(255),
    path TEXT,
    
    CONSTRAINT scraped_urls_url_key UNIQUE (url)
);

CREATE INDEX IF NOT EXISTS idx_scraped_urls_hash ON scraped_urls(url_hash);
CREATE INDEX IF NOT EXISTS idx_scraped_urls_domain ON scraped_urls(domain);
CREATE INDEX IF NOT EXISTS idx_scraped_urls_status ON scraped_urls(status);
CREATE INDEX IF NOT EXISTS idx_scraped_urls_schema_version ON scraped_urls(schema_version);

-- Scraped Data Table
-- Stores the actual scraped content and data
CREATE TABLE IF NOT EXISTS scraped_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    data JSONB NOT NULL,
    raw_html TEXT,
    
    -- SEO Attributes
    title TEXT,
    description TEXT,
    keywords TEXT[],
    og_tags JSONB,
    twitter_tags JSONB,
    schema_markup JSONB,
    
    -- Structured Data
    structured_data JSONB,
    headings JSONB, -- H1, H2, H3, etc.
    links JSONB,
    images JSONB,
    scripts JSONB,
    styles JSONB,
    
    -- Component Analysis
    components JSONB,
    frameworks JSONB,
    design_tokens JSONB,
    
    -- Metadata
    scraped_at TIMESTAMP DEFAULT NOW(),
    job_id UUID REFERENCES scraping_queue(id),
    update_count INTEGER DEFAULT 0,
    content_hash VARCHAR(64),
    
    -- Performance metrics
    load_time_ms INTEGER,
    response_size_bytes INTEGER,
    http_status INTEGER,
    
    CONSTRAINT scraped_data_url_key UNIQUE (url)
);

CREATE INDEX IF NOT EXISTS idx_scraped_data_url ON scraped_data(url);
CREATE INDEX IF NOT EXISTS idx_scraped_data_scraped_at ON scraped_data(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraped_data_job_id ON scraped_data(job_id);
CREATE INDEX IF NOT EXISTS idx_scraped_data_content_hash ON scraped_data(content_hash);

-- Scraping Statistics Table
-- Tracks performance and resource usage
CREATE TABLE IF NOT EXISTS scraping_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Counts
    total_scraped INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    throttled_count INTEGER DEFAULT 0,
    
    -- Resource usage
    cpu_percent NUMERIC(5,2),
    memory_mb NUMERIC(10,2),
    active_jobs INTEGER DEFAULT 0,
    
    -- Performance
    avg_scrape_time_ms INTEGER,
    min_scrape_time_ms INTEGER,
    max_scrape_time_ms INTEGER,
    
    -- Service info
    service_version VARCHAR(50),
    instance_id VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_scraping_stats_timestamp ON scraping_stats(timestamp DESC);

-- Scraping Errors Table
-- Detailed error tracking
CREATE TABLE IF NOT EXISTS scraping_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES scraping_queue(id),
    url TEXT NOT NULL,
    error_type VARCHAR(100),
    error_message TEXT,
    error_stack TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Context
    resource_state JSONB, -- CPU, memory at time of error
    request_metadata JSONB,
    
    occurred_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraping_errors_job_id ON scraping_errors(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_errors_url ON scraping_errors(url);
CREATE INDEX IF NOT EXISTS idx_scraping_errors_occurred_at ON scraping_errors(occurred_at DESC);

-- Schema Versions Table
-- Track schema changes for re-scraping logic
CREATE TABLE IF NOT EXISTS scraping_schema_versions (
    id SERIAL PRIMARY KEY,
    version INTEGER NOT NULL UNIQUE,
    description TEXT,
    fields JSONB NOT NULL, -- List of fields being extracted
    created_at TIMESTAMP DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

INSERT INTO scraping_schema_versions (version, description, fields) VALUES
(1, 'Initial schema with basic SEO attributes', 
 '["title", "description", "keywords", "og_tags", "twitter_tags", "schema_markup"]'::jsonb)
ON CONFLICT (version) DO NOTHING;

-- URL Seeding Sources Table
-- Track where URLs come from
CREATE TABLE IF NOT EXISTS url_seeding_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('manual', 'prompt', 'sitemap', 'api', 'crawler')),
    description TEXT,
    config JSONB,
    
    -- Stats
    urls_generated INTEGER DEFAULT 0,
    urls_scraped INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_url_seeding_sources_type ON url_seeding_sources(source_type);

-- URL Seed to Queue Mapping
CREATE TABLE IF NOT EXISTS url_seed_queue_mapping (
    seed_source_id UUID REFERENCES url_seeding_sources(id),
    queue_id UUID REFERENCES scraping_queue(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (seed_source_id, queue_id)
);

-- Topic-based Seeding Table
CREATE TABLE IF NOT EXISTS topic_seeding_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    prompt TEXT NOT NULL,
    generated_urls JSONB, -- Array of generated URLs
    status VARCHAR(50) DEFAULT 'pending',
    
    -- AI Generation metadata
    ai_model VARCHAR(100),
    ai_response JSONB,
    confidence_score NUMERIC(3,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topic_seeding_topic ON topic_seeding_jobs(topic);
CREATE INDEX IF NOT EXISTS idx_topic_seeding_status ON topic_seeding_jobs(status);

-- Resource Monitoring Table
-- Track resource usage over time
CREATE TABLE IF NOT EXISTS resource_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- System resources
    cpu_percent NUMERIC(5,2),
    memory_used_mb NUMERIC(10,2),
    memory_total_mb NUMERIC(10,2),
    memory_free_mb NUMERIC(10,2),
    
    -- Service resources
    active_scrapers INTEGER,
    queued_jobs INTEGER,
    throttled BOOLEAN DEFAULT FALSE,
    throttle_reason TEXT,
    
    -- Database metrics
    db_connections INTEGER,
    db_query_time_ms NUMERIC(10,2)
);

CREATE INDEX IF NOT EXISTS idx_resource_monitoring_timestamp ON resource_monitoring(timestamp DESC);

-- Views for easy querying

-- Active scraping jobs view
CREATE OR REPLACE VIEW active_scraping_jobs AS
SELECT 
    sq.id,
    sq.url,
    sq.priority,
    sq.status,
    sq.retries,
    sq.started_at,
    EXTRACT(EPOCH FROM (NOW() - sq.started_at)) as duration_seconds
FROM scraping_queue sq
WHERE sq.status = 'in_progress'
ORDER BY sq.started_at;

-- Scraping health view
CREATE OR REPLACE VIEW scraping_health_status AS
SELECT 
    (SELECT COUNT(*) FROM scraping_queue WHERE status = 'pending') as pending_jobs,
    (SELECT COUNT(*) FROM scraping_queue WHERE status = 'in_progress') as active_jobs,
    (SELECT COUNT(*) FROM scraping_queue WHERE status = 'failed') as failed_jobs,
    (SELECT COUNT(*) FROM scraped_urls) as total_scraped_urls,
    (SELECT AVG(load_time_ms) FROM scraped_data WHERE scraped_at > NOW() - INTERVAL '1 hour') as avg_load_time_ms,
    (SELECT cpu_percent FROM resource_monitoring ORDER BY timestamp DESC LIMIT 1) as current_cpu_percent,
    (SELECT memory_used_mb FROM resource_monitoring ORDER BY timestamp DESC LIMIT 1) as current_memory_mb;

-- Duplicate URLs check view
CREATE OR REPLACE VIEW potential_duplicate_urls AS
SELECT 
    su.url,
    su.first_scraped_at,
    su.scrape_count,
    sq.id as queue_id,
    sq.status as queue_status
FROM scraped_urls su
INNER JOIN scraping_queue sq ON su.url = sq.url
WHERE sq.status IN ('pending', 'in_progress');

-- Functions

-- Function to check if URL needs re-scraping based on schema version
CREATE OR REPLACE FUNCTION needs_rescraping(url_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_schema_version INTEGER;
    url_schema_version INTEGER;
BEGIN
    SELECT version INTO current_schema_version
    FROM scraping_schema_versions
    WHERE active = TRUE
    ORDER BY version DESC
    LIMIT 1;
    
    SELECT schema_version INTO url_schema_version
    FROM scraped_urls
    WHERE url = url_to_check;
    
    RETURN (url_schema_version IS NULL OR url_schema_version < current_schema_version);
END;
$$ LANGUAGE plpgsql;

-- Function to add URL to scraping queue
CREATE OR REPLACE FUNCTION add_to_scraping_queue(
    url_to_add TEXT,
    priority_level INTEGER DEFAULT 0,
    job_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_job_id UUID;
BEGIN
    -- Check if already scraped
    IF EXISTS (SELECT 1 FROM scraped_urls WHERE url = url_to_add AND status = 'completed') THEN
        -- Check if needs re-scraping
        IF NOT needs_rescraping(url_to_add) THEN
            RAISE NOTICE 'URL already scraped: %', url_to_add;
            RETURN NULL;
        END IF;
    END IF;
    
    -- Add to queue
    INSERT INTO scraping_queue (url, priority, metadata)
    VALUES (url_to_add, priority_level, job_metadata)
    ON CONFLICT (url, status) WHERE status = 'pending'
    DO UPDATE SET priority = EXCLUDED.priority, metadata = EXCLUDED.metadata
    RETURNING id INTO new_job_id;
    
    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old completed jobs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_scraping_jobs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM scraping_queue
    WHERE status IN ('completed', 'skipped')
    AND completed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Comments for documentation
COMMENT ON TABLE scraping_queue IS '24/7 continuous scraping job queue with priority and resource management';
COMMENT ON TABLE scraped_urls IS 'Registry of all scraped URLs to prevent duplicates';
COMMENT ON TABLE scraped_data IS 'Comprehensive scraped content with SEO attributes and structured data';
COMMENT ON TABLE scraping_stats IS 'Performance metrics and resource usage statistics';
COMMENT ON TABLE topic_seeding_jobs IS 'AI-generated URL seeding based on topics and prompts';

-- Initial data
-- This can be expanded with sample seed sources
