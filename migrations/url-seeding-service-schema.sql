-- URL Seeding Service Database Schema
-- Creates tables for URL seeds, backlinks, configurations, and reports

-- URL Seeds Table
CREATE TABLE IF NOT EXISTS url_seeds (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    source VARCHAR(100),
    priority INTEGER DEFAULT 5,
    search_algorithm VARCHAR(100),
    attributes JSONB,
    status VARCHAR(50) DEFAULT 'active',
    crawl_count INTEGER DEFAULT 0,
    last_crawled TIMESTAMP,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, url)
);

CREATE INDEX IF NOT EXISTS idx_url_seeds_instance ON url_seeds(instance_id);
CREATE INDEX IF NOT EXISTS idx_url_seeds_status ON url_seeds(status);
CREATE INDEX IF NOT EXISTS idx_url_seeds_priority ON url_seeds(priority DESC);

-- Backlinks Table
CREATE TABLE IF NOT EXISTS backlinks (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255),
    client_id VARCHAR(255),
    source_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    relevance DECIMAL(3,2) DEFAULT 0.5,
    anchor_text TEXT,
    context TEXT,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, source_url, target_url)
);

CREATE INDEX IF NOT EXISTS idx_backlinks_instance ON backlinks(instance_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_client ON backlinks(client_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_relevance ON backlinks(relevance DESC);
CREATE INDEX IF NOT EXISTS idx_backlinks_target ON backlinks(target_url);

-- Seeding Configurations Table
CREATE TABLE IF NOT EXISTS seeding_configs (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id VARCHAR(255),
    campaign_id VARCHAR(255),
    config_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seeding_configs_instance ON seeding_configs(instance_id);
CREATE INDEX IF NOT EXISTS idx_seeding_configs_client ON seeding_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_seeding_configs_status ON seeding_configs(status);

-- Backlink Reports Table
CREATE TABLE IF NOT EXISTS backlink_reports (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    total_backlinks INTEGER DEFAULT 0,
    analysis JSONB,
    recommendations JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backlink_reports_client ON backlink_reports(client_id);

-- Domain Authority Metrics Table
CREATE TABLE IF NOT EXISTS domain_authority (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    authority INTEGER DEFAULT 0,
    trust_flow DECIMAL(5,2) DEFAULT 0,
    citation_flow DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domain_authority_domain ON domain_authority(domain);
CREATE INDEX IF NOT EXISTS idx_domain_authority_score ON domain_authority(authority DESC);

-- Rich Snippets Table
CREATE TABLE IF NOT EXISTS rich_snippets (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    schema_type VARCHAR(100),
    schema_data JSONB,
    markup TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rich_snippets_url ON rich_snippets(url);
CREATE INDEX IF NOT EXISTS idx_rich_snippets_type ON rich_snippets(schema_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_url_seeds_updated_at ON url_seeds;
CREATE TRIGGER update_url_seeds_updated_at 
    BEFORE UPDATE ON url_seeds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seeding_configs_updated_at ON seeding_configs;
CREATE TRIGGER update_seeding_configs_updated_at 
    BEFORE UPDATE ON seeding_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_backlink_reports_updated_at ON backlink_reports;
CREATE TRIGGER update_backlink_reports_updated_at 
    BEFORE UPDATE ON backlink_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rich_snippets_updated_at ON rich_snippets;
CREATE TRIGGER update_rich_snippets_updated_at 
    BEFORE UPDATE ON rich_snippets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE url_seeds IS 'Stores URL seeds for seeding service instances';
COMMENT ON TABLE backlinks IS 'Stores discovered backlink relationships';
COMMENT ON TABLE seeding_configs IS 'Stores seeding service instance configurations';
COMMENT ON TABLE backlink_reports IS 'Stores generated backlink reports for clients';
COMMENT ON TABLE domain_authority IS 'Caches domain authority metrics';
COMMENT ON TABLE rich_snippets IS 'Stores generated rich snippet schema markup';
