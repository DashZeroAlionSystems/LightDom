-- Crawlee Crawler System Tables
-- Tables for managing Crawlee-based crawlers with full configuration

-- Main Crawlee Crawlers table
CREATE TABLE IF NOT EXISTS crawlee_crawlers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'cheerio', -- cheerio, playwright, puppeteer, jsdom, http
    status VARCHAR(50) DEFAULT 'idle', -- idle, running, paused, completed, error
    
    -- Configuration
    config JSONB DEFAULT '{
        "maxRequestsPerCrawl": 1000,
        "maxConcurrency": 10,
        "minConcurrency": 1,
        "maxRequestRetries": 3,
        "requestHandlerTimeoutSecs": 60,
        "navigationTimeoutSecs": 60,
        "keepAlive": true,
        "useSessionPool": true,
        "persistCookiesPerSession": true
    }'::jsonb,
    
    -- Request configuration
    request_config JSONB DEFAULT '{
        "headers": {},
        "proxy": null,
        "useChrome": false,
        "ignoreSslErrors": false,
        "headless": true
    }'::jsonb,
    
    -- Autoscaling configuration
    autoscaling_config JSONB DEFAULT '{
        "enabled": true,
        "minConcurrency": 1,
        "maxConcurrency": 10,
        "desiredConcurrency": 5,
        "desiredConcurrencyRatio": 0.9,
        "scaleUpStepRatio": 0.1,
        "scaleDownStepRatio": 0.05
    }'::jsonb,
    
    -- Session pool configuration
    session_pool_config JSONB DEFAULT '{
        "maxPoolSize": 1000,
        "sessionOptions": {
            "maxAgeSecs": 3000,
            "maxUsageCount": 50,
            "maxErrorScore": 3
        }
    }'::jsonb,
    
    -- Proxy configuration
    proxy_config JSONB DEFAULT '{
        "enabled": false,
        "proxyUrls": [],
        "newUrlFunction": null,
        "groups": []
    }'::jsonb,
    
    -- Storage configuration
    storage_config JSONB DEFAULT '{
        "enableDatasets": true,
        "enableKeyValueStores": true,
        "enableRequestQueues": true,
        "persistStorage": true,
        "purgeOnStart": false
    }'::jsonb,
    
    -- Request queue configuration
    request_queue_config JSONB DEFAULT '{
        "maxConcurrency": 1000,
        "maxRequestsPerMinute": 120,
        "autoRequestQueueCleanup": true
    }'::jsonb,
    
    -- Error handling configuration
    error_handling_config JSONB DEFAULT '{
        "maxRequestRetries": 3,
        "retryDelayMs": 1000,
        "maxRetryDelayMs": 60000,
        "retryMultiplier": 2,
        "ignoreHttpErrors": false,
        "ignoreSslErrors": false
    }'::jsonb,
    
    -- URL patterns and filters
    url_patterns JSONB DEFAULT '{
        "include": ["*"],
        "exclude": [],
        "maxDepth": 3,
        "sameDomain": true,
        "respectRobotsTxt": true
    }'::jsonb,
    
    -- Data extraction selectors
    selectors JSONB DEFAULT '{}'::jsonb,
    
    -- Request handler code (stored as string for execution)
    request_handler TEXT,
    failed_request_handler TEXT,
    
    -- Pre and post navigation hooks
    pre_navigation_hooks TEXT[],
    post_navigation_hooks TEXT[],
    
    -- Schedule configuration
    schedule JSONB,
    
    -- Campaign association
    campaign_id VARCHAR(255),
    
    -- Seeder service association
    seeder_service_id VARCHAR(255),
    
    -- Statistics
    stats JSONB DEFAULT '{
        "requestsFinished": 0,
        "requestsFailed": 0,
        "requestsTotal": 0,
        "requestsPerMinute": 0,
        "requestAverageFinishedDurationMillis": 0,
        "requestAverageFailedDurationMillis": 0,
        "crawlerRuntimeMillis": 0
    }'::jsonb,
    
    -- Metadata
    created_by VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    last_run_at TIMESTAMP
);

CREATE INDEX idx_crawlee_crawlers_status ON crawlee_crawlers(status);
CREATE INDEX idx_crawlee_crawlers_type ON crawlee_crawlers(type);
CREATE INDEX idx_crawlee_crawlers_campaign ON crawlee_crawlers(campaign_id);
CREATE INDEX idx_crawlee_crawlers_seeder ON crawlee_crawlers(seeder_service_id);
CREATE INDEX idx_crawlee_crawlers_created ON crawlee_crawlers(created_at);

-- Crawlee Crawler Seeds table (URLs to crawl)
CREATE TABLE IF NOT EXISTS crawlee_crawler_seeds (
    id SERIAL PRIMARY KEY,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    label VARCHAR(255),
    priority INTEGER DEFAULT 0,
    method VARCHAR(10) DEFAULT 'GET',
    headers JSONB,
    payload JSONB,
    user_data JSONB DEFAULT '{}'::jsonb,
    unique_key VARCHAR(255),
    no_retry BOOLEAN DEFAULT false,
    max_retries INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, crawled, failed, skipped
    crawled_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawlee_seeds_crawler ON crawlee_crawler_seeds(crawler_id);
CREATE INDEX idx_crawlee_seeds_status ON crawlee_crawler_seeds(status);
CREATE INDEX idx_crawlee_seeds_priority ON crawlee_crawler_seeds(priority DESC);
CREATE UNIQUE INDEX idx_crawlee_seeds_unique_key ON crawlee_crawler_seeds(crawler_id, unique_key) WHERE unique_key IS NOT NULL;

-- Crawlee Results table (extracted data)
CREATE TABLE IF NOT EXISTS crawlee_results (
    id SERIAL PRIMARY KEY,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    seed_id INTEGER REFERENCES crawlee_crawler_seeds(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    title TEXT,
    
    -- Extracted data
    data JSONB NOT NULL,
    
    -- Metadata about extraction
    extraction_metadata JSONB DEFAULT '{
        "extractedAt": null,
        "durationMs": 0,
        "retryCount": 0,
        "statusCode": 200
    }'::jsonb,
    
    -- SEO data (if applicable)
    seo_data JSONB,
    
    -- Performance metrics
    performance_metrics JSONB DEFAULT '{
        "loadTime": 0,
        "domContentLoadedTime": 0,
        "responseTime": 0
    }'::jsonb,
    
    -- Screenshots and PDFs
    screenshot_url TEXT,
    pdf_url TEXT,
    
    -- HTML content (optional, can be large)
    html_content TEXT,
    
    -- Campaign association (denormalized for faster queries)
    campaign_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawlee_results_crawler ON crawlee_results(crawler_id);
CREATE INDEX idx_crawlee_results_url ON crawlee_results(url);
CREATE INDEX idx_crawlee_results_campaign ON crawlee_results(campaign_id);
CREATE INDEX idx_crawlee_results_created ON crawlee_results(created_at);
CREATE INDEX idx_crawlee_results_data ON crawlee_results USING GIN (data);

-- Crawlee Request Queue table (for persistent queue)
CREATE TABLE IF NOT EXISTS crawlee_request_queue (
    id SERIAL PRIMARY KEY,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    unique_key VARCHAR(255) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    headers JSONB,
    payload JSONB,
    user_data JSONB DEFAULT '{}'::jsonb,
    label VARCHAR(255),
    no_retry BOOLEAN DEFAULT false,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    handled_at TIMESTAMP,
    order_no BIGSERIAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawlee_queue_crawler ON crawlee_request_queue(crawler_id);
CREATE INDEX idx_crawlee_queue_unique_key ON crawlee_request_queue(unique_key);
CREATE INDEX idx_crawlee_queue_order ON crawlee_request_queue(order_no);
CREATE INDEX idx_crawlee_queue_handled ON crawlee_request_queue(handled_at);

-- Crawlee Sessions table (for session management)
CREATE TABLE IF NOT EXISTS crawlee_sessions (
    id VARCHAR(255) PRIMARY KEY,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    cookies JSONB DEFAULT '[]'::jsonb,
    user_data JSONB DEFAULT '{}'::jsonb,
    max_error_score INTEGER DEFAULT 3,
    error_score_decrement DECIMAL DEFAULT 0.5,
    error_score DECIMAL DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    max_usage_count INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX idx_crawlee_sessions_crawler ON crawlee_sessions(crawler_id);
CREATE INDEX idx_crawlee_sessions_expires ON crawlee_sessions(expires_at);

-- Crawlee Logs table (for detailed logging)
CREATE TABLE IF NOT EXISTS crawlee_logs (
    id SERIAL PRIMARY KEY,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL, -- debug, info, warning, error, critical
    message TEXT NOT NULL,
    details JSONB,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawlee_logs_crawler ON crawlee_logs(crawler_id);
CREATE INDEX idx_crawlee_logs_level ON crawlee_logs(level);
CREATE INDEX idx_crawlee_logs_created ON crawlee_logs(created_at);

-- Crawlee Statistics Snapshots (for historical tracking)
CREATE TABLE IF NOT EXISTS crawlee_stats_snapshots (
    id SERIAL PRIMARY KEY,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    stats JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawlee_stats_crawler ON crawlee_stats_snapshots(crawler_id);
CREATE INDEX idx_crawlee_stats_created ON crawlee_stats_snapshots(created_at);

-- Integration with existing campaign_seeds table (add crawler_id if needed)
-- This allows campaigns to use Crawlee crawlers
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'campaign_seeds'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'campaign_seeds' AND column_name = 'crawler_id'
        ) THEN
            ALTER TABLE campaign_seeds 
                ADD COLUMN crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE SET NULL;
            CREATE INDEX idx_campaign_seeds_crawler ON campaign_seeds(crawler_id);
        END IF;
    ELSE
        RAISE NOTICE 'campaign_seeds table not found, skipping crawler_id integration';
    END IF;
END $$;

-- Integration with seeding_services table (add crawler_id if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='seeding_services') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='seeding_services' AND column_name='crawler_id') THEN
            ALTER TABLE seeding_services ADD COLUMN crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE SET NULL;
            CREATE INDEX idx_seeding_services_crawler ON seeding_services(crawler_id);
        END IF;
    END IF;
END $$;

-- Comments
COMMENT ON TABLE crawlee_crawlers IS 'Crawlee crawler instances with comprehensive configuration';
COMMENT ON TABLE crawlee_crawler_seeds IS 'Seed URLs for Crawlee crawlers';
COMMENT ON TABLE crawlee_results IS 'Data extracted by Crawlee crawlers';
COMMENT ON TABLE crawlee_request_queue IS 'Persistent request queue for Crawlee crawlers';
COMMENT ON TABLE crawlee_sessions IS 'Session management for Crawlee crawlers';
COMMENT ON TABLE crawlee_logs IS 'Detailed logs from Crawlee crawlers';
COMMENT ON TABLE crawlee_stats_snapshots IS 'Historical statistics snapshots';
