-- SEO Campaign Management Tables
-- Tables for campaigns, services, crawlers, seeds, and data streams

-- SEO Campaigns Table (main campaign records)
CREATE TABLE IF NOT EXISTS seo_campaigns (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_url TEXT NOT NULL,
    client_id VARCHAR(255),
    keywords JSONB DEFAULT '[]'::jsonb,
    competitors JSONB DEFAULT '[]'::jsonb,
    services JSONB DEFAULT '{}'::jsonb,
    attributes JSONB DEFAULT '[]'::jsonb,
    seeds JSONB DEFAULT '[]'::jsonb,
    data_streams JSONB DEFAULT '[]'::jsonb,
    workflows JSONB DEFAULT '{}'::jsonb,
    schedule JSONB,
    notifications JSONB,
    budget JSONB,
    analytics JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'draft',
    progress JSONB DEFAULT '{"current": 0, "total": 0, "percentage": 0}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP
);

CREATE INDEX idx_seo_campaigns_status ON seo_campaigns(status);
CREATE INDEX idx_seo_campaigns_client ON seo_campaigns(client_id);
CREATE INDEX idx_seo_campaigns_created ON seo_campaigns(created_at);

-- Campaign Services Table
CREATE TABLE IF NOT EXISTS campaign_services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'inactive',
    config JSONB DEFAULT '{}'::jsonb,
    resources JSONB,
    monitoring JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_services_type ON campaign_services(type);
CREATE INDEX idx_campaign_services_status ON campaign_services(status);

-- Campaign Crawlers Table
CREATE TABLE IF NOT EXISTS campaign_crawlers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_url TEXT NOT NULL,
    seed_urls JSONB DEFAULT '[]'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    filters JSONB,
    extraction JSONB,
    storage JSONB,
    status VARCHAR(50) DEFAULT 'idle',
    progress JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_crawlers_status ON campaign_crawlers(status);
CREATE INDEX idx_campaign_crawlers_target ON campaign_crawlers(target_url);

-- Campaign Seeds Table
CREATE TABLE IF NOT EXISTS campaign_seeds (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    type VARCHAR(100) DEFAULT 'manual',
    priority INTEGER DEFAULT 5,
    depth INTEGER DEFAULT 0,
    max_pages INTEGER DEFAULT 100,
    include_patterns JSONB DEFAULT '["*"]'::jsonb,
    exclude_patterns JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    schedule JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_seeds_priority ON campaign_seeds(priority DESC);
CREATE INDEX idx_campaign_seeds_status ON campaign_seeds(status);
CREATE INDEX idx_campaign_seeds_type ON campaign_seeds(type);

-- Campaign Data Streams Table
CREATE TABLE IF NOT EXISTS campaign_data_streams (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'realtime',
    source JSONB NOT NULL,
    destination JSONB NOT NULL,
    transformation JSONB,
    filtering JSONB,
    status VARCHAR(50) DEFAULT 'inactive',
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_streams_type ON campaign_data_streams(type);
CREATE INDEX idx_campaign_streams_status ON campaign_data_streams(status);

-- SEO Mining Results Table (for storing extracted data)
CREATE TABLE IF NOT EXISTS seo_mining_results (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) REFERENCES seo_campaigns(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    crawler_id VARCHAR(255),
    attributes JSONB NOT NULL,
    seo_score DECIMAL(5,2),
    performance_score DECIMAL(5,2),
    mined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_mining_results_campaign ON seo_mining_results(campaign_id);
CREATE INDEX idx_mining_results_url ON seo_mining_results(url);
CREATE INDEX idx_mining_results_mined ON seo_mining_results(mined_at);

COMMENT ON TABLE seo_campaigns IS 'Main SEO campaign records with wired components';
COMMENT ON TABLE campaign_services IS 'Services (crawler, analyzer, miner) for campaigns';
COMMENT ON TABLE campaign_crawlers IS 'Crawler configurations for campaigns';
COMMENT ON TABLE campaign_seeds IS 'Seed URLs for crawlers';
COMMENT ON TABLE campaign_data_streams IS 'Data stream configurations';
COMMENT ON TABLE seo_mining_results IS 'Extracted SEO data from campaigns';
