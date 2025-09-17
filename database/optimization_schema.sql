-- Space Optimization Database Schema
-- PostgreSQL schema for tracking space optimizations and metaverse assets

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE biome_type AS ENUM (
    'digital', 'commercial', 'knowledge', 'entertainment', 
    'social', 'community', 'professional', 'production'
);

CREATE TYPE optimization_type AS ENUM (
    'light-dom', 'css-optimization', 'js-optimization', 
    'image-optimization', 'html-optimization', 'ai-optimization'
);

CREATE TYPE asset_type AS ENUM (
    'land', 'ai_node', 'storage_shard', 'bridge'
);

-- Harvesters table
CREATE TABLE harvesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(42) UNIQUE NOT NULL,
    reputation INTEGER DEFAULT 0,
    total_space_harvested BIGINT DEFAULT 0,
    total_tokens_earned DECIMAL(18, 8) DEFAULT 0,
    optimization_count INTEGER DEFAULT 0,
    land_parcels INTEGER DEFAULT 0,
    ai_nodes INTEGER DEFAULT 0,
    storage_shards INTEGER DEFAULT 0,
    bridges INTEGER DEFAULT 0,
    staking_rewards DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimizations table
CREATE TABLE optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proof_hash VARCHAR(64) UNIQUE NOT NULL,
    harvester_id UUID REFERENCES harvesters(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    space_saved_bytes BIGINT NOT NULL,
    space_saved_kb INTEGER NOT NULL,
    optimization_type optimization_type NOT NULL,
    biome_type biome_type NOT NULL,
    quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
    reputation_multiplier DECIMAL(5, 2) NOT NULL,
    token_reward DECIMAL(18, 8) NOT NULL,
    before_hash VARCHAR(64),
    after_hash VARCHAR(64),
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metaverse assets table
CREATE TABLE metaverse_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    optimization_id UUID REFERENCES optimizations(id) ON DELETE CASCADE,
    harvester_id UUID REFERENCES harvesters(id) ON DELETE CASCADE,
    asset_type asset_type NOT NULL,
    biome_type biome_type NOT NULL,
    size INTEGER NOT NULL,
    staking_rewards DECIMAL(18, 8) NOT NULL,
    development_level INTEGER DEFAULT 1 CHECK (development_level >= 1 AND development_level <= 10),
    source_url TEXT NOT NULL,
    is_staked BOOLEAN DEFAULT FALSE,
    staked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staking rewards table
CREATE TABLE staking_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    harvester_id UUID REFERENCES harvesters(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES metaverse_assets(id) ON DELETE CASCADE,
    reward_amount DECIMAL(18, 8) NOT NULL,
    reward_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    reward_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimization analytics table (for caching)
CREATE TABLE optimization_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(10) NOT NULL, -- '1h', '24h', '7d', '30d'
    total_optimizations INTEGER NOT NULL,
    total_space_harvested BIGINT NOT NULL,
    total_tokens_distributed DECIMAL(18, 8) NOT NULL,
    average_quality_score DECIMAL(5, 2) NOT NULL,
    biome_stats JSONB NOT NULL,
    type_stats JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period, calculated_at)
);

-- Create indexes for performance
CREATE INDEX idx_harvesters_address ON harvesters(address);
CREATE INDEX idx_harvesters_reputation ON harvesters(reputation DESC);
CREATE INDEX idx_harvesters_space_harvested ON harvesters(total_space_harvested DESC);

CREATE INDEX idx_optimizations_proof_hash ON optimizations(proof_hash);
CREATE INDEX idx_optimizations_harvester_id ON optimizations(harvester_id);
CREATE INDEX idx_optimizations_timestamp ON optimizations(timestamp DESC);
CREATE INDEX idx_optimizations_biome_type ON optimizations(biome_type);
CREATE INDEX idx_optimizations_optimization_type ON optimizations(optimization_type);
CREATE INDEX idx_optimizations_url ON optimizations USING gin(url gin_trgm_ops);

CREATE INDEX idx_metaverse_assets_harvester_id ON metaverse_assets(harvester_id);
CREATE INDEX idx_metaverse_assets_asset_type ON metaverse_assets(asset_type);
CREATE INDEX idx_metaverse_assets_biome_type ON metaverse_assets(biome_type);
CREATE INDEX idx_metaverse_assets_is_staked ON metaverse_assets(is_staked);

CREATE INDEX idx_staking_rewards_harvester_id ON staking_rewards(harvester_id);
CREATE INDEX idx_staking_rewards_asset_id ON staking_rewards(asset_id);
CREATE INDEX idx_staking_rewards_claimed_at ON staking_rewards(claimed_at);

CREATE INDEX idx_optimization_analytics_period ON optimization_analytics(period);
CREATE INDEX idx_optimization_analytics_calculated_at ON optimization_analytics(calculated_at DESC);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_harvesters_updated_at 
    BEFORE UPDATE ON harvesters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate staking rewards
CREATE OR REPLACE FUNCTION calculate_staking_rewards(
    p_asset_id UUID,
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
) RETURNS DECIMAL(18, 8) AS $$
DECLARE
    asset_record metaverse_assets%ROWTYPE;
    reward_amount DECIMAL(18, 8);
    time_diff INTERVAL;
    days_diff DECIMAL(10, 4);
BEGIN
    -- Get asset details
    SELECT * INTO asset_record 
    FROM metaverse_assets 
    WHERE id = p_asset_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate time difference
    time_diff := p_period_end - p_period_start;
    days_diff := EXTRACT(EPOCH FROM time_diff) / 86400; -- Convert to days
    
    -- Calculate rewards based on asset type and development level
    reward_amount := asset_record.staking_rewards * days_diff;
    
    -- Apply development level multiplier
    reward_amount := reward_amount * (1 + (asset_record.development_level - 1) * 0.1);
    
    RETURN reward_amount;
END;
$$ LANGUAGE plpgsql;

-- Create function to update harvester stats after optimization
CREATE OR REPLACE FUNCTION update_harvester_stats_after_optimization()
RETURNS TRIGGER AS $$
DECLARE
    harvester_record harvesters%ROWTYPE;
    land_count INTEGER;
    ai_node_count INTEGER;
    storage_shard_count INTEGER;
    bridge_count INTEGER;
BEGIN
    -- Get harvester record
    SELECT * INTO harvester_record 
    FROM harvesters 
    WHERE id = NEW.harvester_id;
    
    -- Count metaverse assets for this optimization
    SELECT 
        COUNT(*) FILTER (WHERE asset_type = 'land'),
        COUNT(*) FILTER (WHERE asset_type = 'ai_node'),
        COUNT(*) FILTER (WHERE asset_type = 'storage_shard'),
        COUNT(*) FILTER (WHERE asset_type = 'bridge')
    INTO land_count, ai_node_count, storage_shard_count, bridge_count
    FROM metaverse_assets 
    WHERE optimization_id = NEW.id;
    
    -- Update harvester stats
    UPDATE harvesters SET
        reputation = reputation + NEW.space_saved_kb,
        total_space_harvested = total_space_harvested + NEW.space_saved_bytes,
        total_tokens_earned = total_tokens_earned + NEW.token_reward,
        optimization_count = optimization_count + 1,
        land_parcels = land_parcels + land_count,
        ai_nodes = ai_nodes + ai_node_count,
        storage_shards = storage_shards + storage_shard_count,
        bridges = bridges + bridge_count,
        updated_at = NOW()
    WHERE id = NEW.harvester_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update harvester stats
CREATE TRIGGER update_harvester_stats_trigger
    AFTER INSERT ON optimizations
    FOR EACH ROW EXECUTE FUNCTION update_harvester_stats_after_optimization();

-- Create function to get optimization statistics
CREATE OR REPLACE FUNCTION get_optimization_stats(
    p_period_hours INTEGER DEFAULT 24
) RETURNS TABLE (
    total_optimizations BIGINT,
    total_space_harvested BIGINT,
    total_tokens_distributed DECIMAL(18, 8),
    average_quality_score DECIMAL(5, 2),
    top_harvester_address VARCHAR(42),
    top_harvester_space BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_optimizations,
        COALESCE(SUM(space_saved_bytes), 0) as total_space_harvested,
        COALESCE(SUM(token_reward), 0) as total_tokens_distributed,
        COALESCE(AVG(quality_score), 0) as average_quality_score,
        (SELECT h.address FROM harvesters h 
         JOIN optimizations o ON h.id = o.harvester_id 
         WHERE o.timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour' * p_period_hours)
         GROUP BY h.address 
         ORDER BY SUM(o.space_saved_bytes) DESC 
         LIMIT 1) as top_harvester_address,
        (SELECT SUM(o.space_saved_bytes) FROM optimizations o 
         JOIN harvesters h ON h.id = o.harvester_id 
         WHERE o.timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour' * p_period_hours)
         GROUP BY h.address 
         ORDER BY SUM(o.space_saved_bytes) DESC 
         LIMIT 1) as top_harvester_space
    FROM optimizations o
    WHERE o.timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour' * p_period_hours);
END;
$$ LANGUAGE plpgsql;

-- Create function to get metaverse statistics
CREATE OR REPLACE FUNCTION get_metaverse_stats()
RETURNS TABLE (
    total_land BIGINT,
    total_ai_nodes BIGINT,
    total_storage_shards BIGINT,
    total_bridges BIGINT,
    total_staking_rewards DECIMAL(18, 8),
    staked_assets BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE asset_type = 'land') as total_land,
        COUNT(*) FILTER (WHERE asset_type = 'ai_node') as total_ai_nodes,
        COUNT(*) FILTER (WHERE asset_type = 'storage_shard') as total_storage_shards,
        COUNT(*) FILTER (WHERE asset_type = 'bridge') as total_bridges,
        COALESCE(SUM(staking_rewards), 0) as total_staking_rewards,
        COUNT(*) FILTER (WHERE is_staked = TRUE) as staked_assets
    FROM metaverse_assets;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO harvesters (address, reputation, total_space_harvested, total_tokens_earned, optimization_count) VALUES
('0x1234567890123456789012345678901234567890', 1500, 500000, 2.5, 25),
('0x2345678901234567890123456789012345678901', 800, 300000, 1.8, 15),
('0x3456789012345678901234567890123456789012', 2000, 800000, 4.2, 40);

-- Insert sample optimizations
INSERT INTO optimizations (proof_hash, harvester_id, url, space_saved_bytes, space_saved_kb, optimization_type, biome_type, quality_score, reputation_multiplier, token_reward, timestamp) VALUES
('abc123def456', (SELECT id FROM harvesters WHERE address = '0x1234567890123456789012345678901234567890'), 'https://example.com', 50000, 48, 'light-dom', 'digital', 85, 2.0, 0.096, EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour')),
('def456ghi789', (SELECT id FROM harvesters WHERE address = '0x2345678901234567890123456789012345678901'), 'https://test.com', 75000, 73, 'css-optimization', 'commercial', 92, 1.5, 0.1095, EXTRACT(EPOCH FROM NOW() - INTERVAL '2 hours')),
('ghi789jkl012', (SELECT id FROM harvesters WHERE address = '0x3456789012345678901234567890123456789012'), 'https://demo.com', 120000, 117, 'ai-optimization', 'professional', 95, 5.0, 0.585, EXTRACT(EPOCH FROM NOW() - INTERVAL '30 minutes'));

-- Insert sample metaverse assets
INSERT INTO metaverse_assets (optimization_id, harvester_id, asset_type, biome_type, size, staking_rewards, source_url) VALUES
((SELECT id FROM optimizations WHERE proof_hash = 'abc123def456'), (SELECT id FROM harvesters WHERE address = '0x1234567890123456789012345678901234567890'), 'land', 'digital', 100, 1.0, 'https://example.com'),
((SELECT id FROM optimizations WHERE proof_hash = 'def456ghi789'), (SELECT id FROM harvesters WHERE address = '0x2345678901234567890123456789012345678901'), 'land', 'commercial', 100, 2.0, 'https://test.com'),
((SELECT id FROM optimizations WHERE proof_hash = 'ghi789jkl012'), (SELECT id FROM harvesters WHERE address = '0x3456789012345678901234567890123456789012'), 'ai_node', 'professional', 1000, 10.0, 'https://demo.com');

-- Create views for common queries
CREATE VIEW harvester_leaderboard AS
SELECT 
    h.address,
    h.reputation,
    h.total_space_harvested,
    h.total_tokens_earned,
    h.optimization_count,
    h.land_parcels,
    h.ai_nodes,
    h.storage_shards,
    h.bridges,
    RANK() OVER (ORDER BY h.total_space_harvested DESC) as rank_by_space,
    RANK() OVER (ORDER BY h.reputation DESC) as rank_by_reputation
FROM harvesters h
ORDER BY h.total_space_harvested DESC;

CREATE VIEW recent_optimizations AS
SELECT 
    o.proof_hash,
    o.url,
    o.space_saved_kb,
    o.token_reward,
    o.biome_type,
    o.optimization_type,
    o.quality_score,
    h.address as harvester_address,
    o.timestamp,
    o.created_at
FROM optimizations o
JOIN harvesters h ON h.id = o.harvester_id
ORDER BY o.timestamp DESC;

CREATE VIEW metaverse_asset_summary AS
SELECT 
    asset_type,
    biome_type,
    COUNT(*) as count,
    SUM(size) as total_size,
    SUM(staking_rewards) as total_staking_rewards,
    COUNT(*) FILTER (WHERE is_staked = TRUE) as staked_count
FROM metaverse_assets
GROUP BY asset_type, biome_type
ORDER BY asset_type, biome_type;
