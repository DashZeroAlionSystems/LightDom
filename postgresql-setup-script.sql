-- DOM Space Harvester Database Schema
-- PostgreSQL setup script for blockchain-based web optimization mining

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- CORE CRAWLING TABLES
-- =====================================================

-- Crawl targets and queue management
CREATE TABLE crawl_targets (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error', 'skipped')),
    discovered_at TIMESTAMP DEFAULT NOW(),
    last_crawled_at TIMESTAMP,
    crawl_depth INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Active crawler workers
CREATE TABLE active_crawlers (
    crawler_id VARCHAR(50) PRIMARY KEY,
    specialization VARCHAR(100) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'processing', 'error')),
    current_url TEXT,
    pages_per_second DECIMAL(5,2) DEFAULT 0,
    efficiency_percent DECIMAL(5,2) DEFAULT 0,
    db_connections INTEGER DEFAULT 0,
    queue_depth INTEGER DEFAULT 0,
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP DEFAULT NOW(),
    total_pages_processed INTEGER DEFAULT 0,
    total_space_harvested BIGINT DEFAULT 0
);

-- =====================================================
-- DOM OPTIMIZATION TABLES
-- =====================================================

-- DOM optimizations and space harvesting
CREATE TABLE dom_optimizations (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    space_saved_bytes BIGINT NOT NULL,
    tokens_earned DECIMAL(18,8) DEFAULT 0,
    optimization_types TEXT[] DEFAULT '{}',
    crawl_timestamp TIMESTAMP DEFAULT NOW(),
    metaverse_impact JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    optimization_proof TEXT,
    worker_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Detailed optimization breakdown
CREATE TABLE optimization_details (
    id SERIAL PRIMARY KEY,
    optimization_id INTEGER REFERENCES dom_optimizations(id) ON DELETE CASCADE,
    optimization_type VARCHAR(50) NOT NULL,
    element_selector TEXT,
    bytes_saved BIGINT NOT NULL,
    description TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SCHEMA.ORG DATA EXTRACTION
-- =====================================================

-- Extracted schema.org structured data
CREATE TABLE schema_data (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    schema_type VARCHAR(100) NOT NULL,
    schema_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'warning')),
    extracted_at TIMESTAMP DEFAULT NOW(),
    content_tsvector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', schema_data::text)) STORED
);

-- Schema type statistics
CREATE TABLE schema_type_stats (
    schema_type VARCHAR(100) PRIMARY KEY,
    total_count INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- BACKLINK NETWORK ANALYSIS
-- =====================================================

-- Backlink network mapping
CREATE TABLE backlink_network (
    id SERIAL PRIMARY KEY,
    source_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    source_domain TEXT NOT NULL,
    target_domain TEXT NOT NULL,
    anchor_text TEXT,
    link_type VARCHAR(20) DEFAULT 'external' CHECK (link_type IN ('internal', 'external', 'nofollow', 'sponsored')),
    link_strength DECIMAL(3,2) DEFAULT 1.0,
    context_data JSONB DEFAULT '{}',
    discovered_at TIMESTAMP DEFAULT NOW(),
    last_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Domain authority tracking
CREATE TABLE domain_authority (
    domain TEXT PRIMARY KEY,
    authority_score DECIMAL(5,2) DEFAULT 0,
    total_inbound_links INTEGER DEFAULT 0,
    unique_linking_domains INTEGER DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT NOW(),
    trust_flow DECIMAL(5,2) DEFAULT 0,
    citation_flow DECIMAL(5,2) DEFAULT 0
);

-- =====================================================
-- METAVERSE INFRASTRUCTURE TABLES
-- =====================================================

-- Virtual land parcels (NFTs)
CREATE TABLE virtual_land_parcels (
    id SERIAL PRIMARY KEY,
    parcel_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    source_url TEXT NOT NULL,
    source_domain TEXT NOT NULL,
    biome_type VARCHAR(50) DEFAULT 'digital' CHECK (biome_type IN ('digital', 'commercial', 'knowledge', 'entertainment', 'social', 'community', 'professional', 'production')),
    parcel_size DECIMAL(10,2) NOT NULL, -- in square meters
    development_level INTEGER DEFAULT 1 CHECK (development_level BETWEEN 1 AND 10),
    space_harvested_kb DECIMAL(10,2) NOT NULL,
    owner_address VARCHAR(42), -- Ethereum address
    is_nft_minted BOOLEAN DEFAULT false,
    nft_token_id BIGINT,
    staking_rewards DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI consensus nodes
CREATE TABLE ai_consensus_nodes (
    id SERIAL PRIMARY KEY,
    node_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    operator_address VARCHAR(42) NOT NULL,
    compute_power DECIMAL(10,2) NOT NULL, -- in TFLOPS
    consensus_weight DECIMAL(5,4) DEFAULT 0,
    consensus_type VARCHAR(50) DEFAULT 'optimization' CHECK (consensus_type IN ('optimization', 'validation', 'storage', 'bridge')),
    consensus_participations INTEGER DEFAULT 0,
    successful_validations INTEGER DEFAULT 0,
    rewards_generated DECIMAL(18,8) DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_heartbeat TIMESTAMP DEFAULT NOW()
);

-- Storage shards
CREATE TABLE storage_shards (
    id SERIAL PRIMARY KEY,
    shard_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    provider_address VARCHAR(42) NOT NULL,
    capacity_gb DECIMAL(10,2) NOT NULL,
    used_gb DECIMAL(10,2) DEFAULT 0,
    replication_factor INTEGER DEFAULT 3,
    is_operational BOOLEAN DEFAULT true,
    performance_score DECIMAL(3,2) DEFAULT 1.0,
    last_sync TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dimensional bridges (cross-chain)
CREATE TABLE dimensional_bridges (
    id SERIAL PRIMARY KEY,
    bridge_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    source_chain VARCHAR(50) NOT NULL,
    target_chain VARCHAR(50) NOT NULL,
    bridge_capacity DECIMAL(18,8) DEFAULT 0,
    current_volume DECIMAL(18,8) DEFAULT 0,
    is_operational BOOLEAN DEFAULT true,
    validator_count INTEGER DEFAULT 0,
    last_transaction TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reality anchors (virtual-to-real connections)
CREATE TABLE reality_anchors (
    id SERIAL PRIMARY KEY,
    anchor_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    domain TEXT NOT NULL,
    virtual_coordinates JSONB NOT NULL,
    real_world_url TEXT NOT NULL,
    connection_strength DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    last_verified TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SITE ANALYSIS AND BIOMES
-- =====================================================

-- Site analysis and biome classification
CREATE TABLE site_analysis (
    domain TEXT PRIMARY KEY,
    biome_type VARCHAR(50) DEFAULT 'digital',
    total_pages_crawled INTEGER DEFAULT 0,
    total_space_harvested BIGINT DEFAULT 0,
    performance_score DECIMAL(3,2) DEFAULT 0,
    schema_richness DECIMAL(3,2) DEFAULT 0,
    backlink_authority DECIMAL(5,2) DEFAULT 0,
    last_analyzed TIMESTAMP DEFAULT NOW(),
    analysis_data JSONB DEFAULT '{}'
);

-- =====================================================
-- BLOCKCHAIN INTEGRATION
-- =====================================================

-- Token transactions and rewards
CREATE TABLE token_transactions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE,
    from_address VARCHAR(42),
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('mining', 'staking', 'reward', 'transfer', 'burn')),
    block_number BIGINT,
    gas_used BIGINT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

-- Staking pools
CREATE TABLE staking_pools (
    id SERIAL PRIMARY KEY,
    pool_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    pool_type VARCHAR(50) NOT NULL CHECK (pool_type IN ('land', 'ai_node', 'storage', 'bridge')),
    total_staked DECIMAL(18,8) DEFAULT 0,
    reward_rate DECIMAL(5,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_reward_distribution TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Crawl targets indexes
CREATE INDEX idx_crawl_targets_status ON crawl_targets(status);
CREATE INDEX idx_crawl_targets_domain ON crawl_targets(domain);
CREATE INDEX idx_crawl_targets_priority ON crawl_targets(priority DESC);
CREATE INDEX idx_crawl_targets_discovered ON crawl_targets(discovered_at);

-- DOM optimizations indexes
CREATE INDEX idx_dom_optimizations_url ON dom_optimizations(url);
CREATE INDEX idx_dom_optimizations_timestamp ON dom_optimizations(crawl_timestamp DESC);
CREATE INDEX idx_dom_optimizations_space_saved ON dom_optimizations(space_saved_bytes DESC);

-- Schema data indexes
CREATE INDEX idx_schema_data_url ON schema_data(url);
CREATE INDEX idx_schema_data_type ON schema_data(schema_type);
CREATE INDEX idx_schema_data_confidence ON schema_data(confidence_score DESC);
CREATE INDEX idx_schema_data_content_search ON schema_data USING GIN(content_tsvector);

-- Backlink network indexes
CREATE INDEX idx_backlink_source ON backlink_network(source_domain);
CREATE INDEX idx_backlink_target ON backlink_network(target_domain);
CREATE INDEX idx_backlink_strength ON backlink_network(link_strength DESC);
CREATE INDEX idx_backlink_type ON backlink_network(link_type);

-- Virtual land indexes
CREATE INDEX idx_virtual_land_biome ON virtual_land_parcels(biome_type);
CREATE INDEX idx_virtual_land_owner ON virtual_land_parcels(owner_address);
CREATE INDEX idx_virtual_land_size ON virtual_land_parcels(parcel_size DESC);

-- AI nodes indexes
CREATE INDEX idx_ai_nodes_active ON ai_consensus_nodes(is_active);
CREATE INDEX idx_ai_nodes_power ON ai_consensus_nodes(compute_power DESC);
CREATE INDEX idx_ai_nodes_operator ON ai_consensus_nodes(operator_address);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_crawl_targets_updated_at BEFORE UPDATE ON crawl_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_land_updated_at BEFORE UPDATE ON virtual_land_parcels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate space harvested per domain
CREATE OR REPLACE FUNCTION calculate_domain_space_harvested(domain_name TEXT)
RETURNS BIGINT AS $$
DECLARE
    total_space BIGINT;
BEGIN
    SELECT COALESCE(SUM(space_saved_bytes), 0)
    INTO total_space
    FROM dom_optimizations do
    JOIN crawl_targets ct ON do.url = ct.url
    WHERE ct.domain = domain_name;
    
    RETURN total_space;
END;
$$ LANGUAGE plpgsql;

-- Function to generate virtual land from optimizations
CREATE OR REPLACE FUNCTION generate_virtual_land_from_optimization()
RETURNS TRIGGER AS $$
DECLARE
    domain_name TEXT;
    biome_type VARCHAR(50);
    space_kb DECIMAL(10,2);
BEGIN
    -- Get domain from URL
    SELECT ct.domain INTO domain_name
    FROM crawl_targets ct
    WHERE ct.url = NEW.url;
    
    -- Determine biome type based on domain
    SELECT COALESCE(sa.biome_type, 'digital')
    INTO biome_type
    FROM site_analysis sa
    WHERE sa.domain = domain_name;
    
    -- Calculate space in KB
    space_kb := NEW.space_saved_bytes / 1024.0;
    
    -- Generate virtual land parcel
    INSERT INTO virtual_land_parcels (
        source_url,
        source_domain,
        biome_type,
        parcel_size,
        space_harvested_kb,
        development_level
    ) VALUES (
        NEW.url,
        domain_name,
        biome_type,
        GREATEST(space_kb * 0.1, 1.0), -- Minimum 1 square meter
        space_kb,
        LEAST(CEIL(space_kb / 100), 10) -- Development level based on space
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate virtual land
CREATE TRIGGER trigger_generate_virtual_land
    AFTER INSERT ON dom_optimizations
    FOR EACH ROW
    EXECUTE FUNCTION generate_virtual_land_from_optimization();

-- =====================================================
-- SAMPLE DATA AND VIEWS
-- =====================================================

-- View for dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM crawl_targets) as total_targets,
    (SELECT COUNT(*) FROM crawl_targets WHERE status = 'completed') as completed_targets,
    (SELECT COUNT(*) FROM dom_optimizations) as total_optimizations,
    (SELECT COALESCE(SUM(space_saved_bytes), 0) FROM dom_optimizations) as total_space_harvested,
    (SELECT COUNT(*) FROM virtual_land_parcels) as virtual_land_parcels,
    (SELECT COUNT(*) FROM ai_consensus_nodes WHERE is_active = true) as active_ai_nodes,
    (SELECT COUNT(*) FROM storage_shards WHERE is_operational = true) as operational_storage_shards,
    (SELECT COUNT(*) FROM dimensional_bridges WHERE is_operational = true) as operational_bridges;

-- View for top performing domains
CREATE VIEW top_domains AS
SELECT 
    ct.domain,
    COUNT(do.id) as optimization_count,
    COALESCE(SUM(do.space_saved_bytes), 0) as total_space_saved,
    COALESCE(AVG(do.space_saved_bytes), 0) as avg_space_saved,
    COUNT(vlp.id) as virtual_land_count
FROM crawl_targets ct
LEFT JOIN dom_optimizations do ON ct.url = do.url
LEFT JOIN virtual_land_parcels vlp ON ct.domain = vlp.source_domain
GROUP BY ct.domain
ORDER BY total_space_saved DESC;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert some sample crawl targets
INSERT INTO crawl_targets (url, domain, priority) VALUES
('https://example.com', 'example.com', 8),
('https://httpbin.org', 'httpbin.org', 7),
('https://jsonplaceholder.typicode.com', 'jsonplaceholder.typicode.com', 6),
('https://httpstat.us', 'httpstat.us', 5);

-- Insert sample site analysis
INSERT INTO site_analysis (domain, biome_type, total_pages_crawled, performance_score) VALUES
('example.com', 'commercial', 0, 0.85),
('httpbin.org', 'digital', 0, 0.90),
('jsonplaceholder.typicode.com', 'professional', 0, 0.88);

-- Create initial staking pools
INSERT INTO staking_pools (pool_type, reward_rate) VALUES
('land', 0.05),
('ai_node', 0.08),
('storage', 0.06),
('bridge', 0.07);

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Create application user
-- CREATE USER dom_harvester WITH PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE dom_space_harvester TO dom_harvester;
-- GRANT USAGE ON SCHEMA public TO dom_harvester;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dom_harvester;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dom_harvester;

COMMENT ON DATABASE dom_space_harvester IS 'DOM Space Harvester - Blockchain-based web optimization mining database';
COMMENT ON TABLE crawl_targets IS 'Queue of websites to crawl and optimize';
COMMENT ON TABLE dom_optimizations IS 'Record of DOM optimizations and space harvested';
COMMENT ON TABLE virtual_land_parcels IS 'Virtual land NFTs generated from optimizations';
COMMENT ON TABLE ai_consensus_nodes IS 'AI-powered consensus nodes for blockchain validation';
COMMENT ON TABLE storage_shards IS 'Distributed storage network shards';
COMMENT ON TABLE dimensional_bridges IS 'Cross-chain bridges for blockchain interoperability';

-- =====================================================
-- OPTIMIZATION PROOFS (ON-CHAIN + LOCAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS optimization_proofs (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    before_hash TEXT,
    after_hash TEXT,
    space_saved_bytes BIGINT NOT NULL DEFAULT 0,
    tx_hash TEXT,
    recorded_at TIMESTAMP DEFAULT NOW(),
    on_chain BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_proofs_domain ON optimization_proofs(domain);
CREATE INDEX IF NOT EXISTS idx_proofs_url ON optimization_proofs(url);
CREATE INDEX IF NOT EXISTS idx_proofs_recorded_at ON optimization_proofs(recorded_at DESC);

-- =====================================================
-- MONETIZATION: PLANS, API KEYS, SUBSCRIPTIONS, BOUNTIES, PAYMENTS
-- =====================================================

-- Pricing plans
CREATE TABLE IF NOT EXISTS pricing_plans (
    id SERIAL PRIMARY KEY,
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    monthly_price_cents INTEGER NOT NULL,
    requests_included INTEGER NOT NULL,
    overage_price_cents_per_1k INTEGER NOT NULL,
    stripe_price_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API keys for paid access
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key_hash TEXT UNIQUE NOT NULL,
    owner_email TEXT NOT NULL,
    plan_id INTEGER REFERENCES pricing_plans(id),
    is_active BOOLEAN DEFAULT TRUE,
    requests_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP
);

-- Subscriptions linking owners to plans
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    owner_email TEXT NOT NULL,
    plan_id INTEGER REFERENCES pricing_plans(id),
    current_period_start TIMESTAMP NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','past_due','canceled')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Paid optimization bounties
CREATE TABLE IF NOT EXISTS optimization_bounties (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    description TEXT,
    reward_cents INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','claimed','paid','canceled')),
    posted_by TEXT NOT NULL,
    claimed_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments (external processor references stored only)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    owner_email TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    provider VARCHAR(20) NOT NULL,
    provider_payment_id TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'succeeded' CHECK (status IN ('succeeded','pending','failed','refunded')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices for subscription periods and overages
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    owner_email TEXT NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    amount_cents INTEGER NOT NULL,
    line_items JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','paid','void')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  owner_email TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bridge messages table for chat persistence
CREATE TABLE IF NOT EXISTS bridge_messages (
    message_id SERIAL PRIMARY KEY,
    bridge_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS bridge_typing (
    typing_id SERIAL PRIMARY KEY,
    bridge_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    is_typing BOOLEAN DEFAULT true,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bridge_id, user_name)
);

-- Create blockchain optimizations table
CREATE TABLE IF NOT EXISTS blockchain_optimizations (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    url TEXT NOT NULL,
    dom_analysis JSONB,
    space_saved INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'confirmed', 'failed')),
    tx_hash VARCHAR(66),
    block_number BIGINT,
    gas_used BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blockchain mining sessions table
CREATE TABLE IF NOT EXISTS blockchain_mining_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    extension_id VARCHAR(255),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'error')),
    blocks_mined INTEGER DEFAULT 0,
    optimizations_submitted INTEGER DEFAULT 0,
    total_space_saved BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blockchain metrics table
CREATE TABLE IF NOT EXISTS blockchain_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON api_keys(owner_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON subscriptions(owner_email);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON optimization_bounties(status);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON payments(owner_email);

-- ALGORITHM STORAGE TABLES
-- ========================

-- Store DOM analysis algorithms
CREATE TABLE IF NOT EXISTS dom_algorithms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    algorithm_type VARCHAR(50) NOT NULL CHECK (algorithm_type IN ('detection', 'optimization', 'quantification', 'validation')),
    code TEXT NOT NULL, -- JavaScript code for the algorithm
    version VARCHAR(20) DEFAULT '1.0.0',
    author VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store algorithm performance metrics
CREATE TABLE IF NOT EXISTS algorithm_performance (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER REFERENCES dom_algorithms(id) ON DELETE CASCADE,
    test_url TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    accuracy_score DECIMAL(5,4), -- 0.0000 to 1.0000
    false_positives INTEGER DEFAULT 0,
    false_negatives INTEGER DEFAULT 0,
    space_saved_bytes BIGINT DEFAULT 0,
    metadata JSONB,
    tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store ML model training data
CREATE TABLE IF NOT EXISTS ml_training_data (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER REFERENCES dom_algorithms(id) ON DELETE CASCADE,
    feature_vector JSONB NOT NULL, -- Input features for ML model
    target_value DECIMAL(10,4), -- Expected output/target
    data_source VARCHAR(100), -- e.g., 'crawler', 'manual', 'synthetic'
    quality_score DECIMAL(3,2) DEFAULT 1.0, -- 0.00 to 1.00
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store trained ML models
CREATE TABLE IF NOT EXISTS ml_models (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER REFERENCES dom_algorithms(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- e.g., 'linear_regression', 'neural_network', 'decision_tree'
    model_data JSONB NOT NULL, -- Serialized model parameters/weights
    training_accuracy DECIMAL(5,4),
    validation_accuracy DECIMAL(5,4),
    training_samples INTEGER,
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Store algorithm execution logs
CREATE TABLE IF NOT EXISTS algorithm_execution_logs (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER REFERENCES dom_algorithms(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    execution_status VARCHAR(20) DEFAULT 'success' CHECK (execution_status IN ('success', 'error', 'timeout')),
    execution_time_ms INTEGER,
    error_message TEXT,
    results JSONB,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for algorithm tables
CREATE INDEX IF NOT EXISTS idx_dom_algorithms_type ON dom_algorithms(algorithm_type);
CREATE INDEX IF NOT EXISTS idx_dom_algorithms_active ON dom_algorithms(is_active);
CREATE INDEX IF NOT EXISTS idx_algorithm_performance_algorithm ON algorithm_performance(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_algorithm ON ml_training_data(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_algorithm ON ml_models(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_logs_algorithm ON algorithm_execution_logs(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_logs_status ON algorithm_execution_logs(execution_status);