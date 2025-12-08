-- Attribute crawler campaign support
-- Creates storage for attribute extraction results and indexes for campaign workflows

BEGIN;

CREATE TABLE IF NOT EXISTS crawler_attribute_results (
    id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES crawlee_results(id) ON DELETE CASCADE,
    crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE CASCADE,
    seeder_service_id VARCHAR(255),
    campaign_id VARCHAR(255),
    url TEXT NOT NULL,
    attribute_name TEXT NOT NULL,
    raw_value JSONB,
    string_value TEXT,
    number_value DOUBLE PRECISION,
    boolean_value BOOLEAN,
    array_value TEXT[],
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crawler_attribute_results_name
    ON crawler_attribute_results(attribute_name);

CREATE INDEX IF NOT EXISTS idx_crawler_attribute_results_crawler
    ON crawler_attribute_results(crawler_id);

CREATE INDEX IF NOT EXISTS idx_crawler_attribute_results_campaign
    ON crawler_attribute_results(campaign_id);

CREATE INDEX IF NOT EXISTS idx_crawler_attribute_results_seeder
    ON crawler_attribute_results(seeder_service_id);

CREATE INDEX IF NOT EXISTS idx_crawler_attribute_results_url
    ON crawler_attribute_results(url);

CREATE INDEX IF NOT EXISTS idx_crawler_attribute_results_json
    ON crawler_attribute_results USING GIN(raw_value);

COMMIT;
