-- LightDom Blockchain Database Schema
-- Comprehensive schema for blockchain-based DOM optimization platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for blockchain addresses
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    reputation_score INTEGER DEFAULT 0,
    total_space_harvested BIGINT DEFAULT 0,
    optimization_count INTEGER DEFAULT 0,
    successful_optimizations INTEGER DEFAULT 0,
    optimization_streak INTEGER DEFAULT 0,
    staked_amount DECIMAL(36, 18) DEFAULT 0,
    staking_start_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Optimizations table
CREATE TABLE optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    space_bytes BIGINT NOT NULL,
    proof_hash VARCHAR(66) UNIQUE NOT NULL,
    biome_type VARCHAR(50) NOT NULL,
    verification_score INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Metaverse infrastructure table
CREATE TABLE metaverse_infrastructure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('land', 'node', 'shard', 'bridge')),
    infrastructure_id INTEGER NOT NULL,
    biome_type VARCHAR(50),
    size BIGINT,
    compute_power BIGINT,
    capacity BIGINT,
    source_chain VARCHAR(50),
    target_chain VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staking transactions table
CREATE TABLE staking_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('stake', 'unstake', 'claim')),
    amount DECIMAL(36, 18) NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token transfers table
CREATE TABLE token_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_address VARCHAR(42),
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    transfer_type VARCHAR(20) DEFAULT 'transfer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain events table
CREATE TABLE blockchain_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    log_index INTEGER NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Network statistics table
CREATE TABLE network_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_optimizations BIGINT DEFAULT 0,
    total_space_saved BIGINT DEFAULT 0,
    total_tokens_minted DECIMAL(36, 18) DEFAULT 0,
    total_staked DECIMAL(36, 18) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    virtual_land_count INTEGER DEFAULT 0,
    ai_node_count INTEGER DEFAULT 0,
    storage_shard_count INTEGER DEFAULT 0,
    bridge_count INTEGER DEFAULT 0,
    block_number BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimization recommendations table
CREATE TABLE optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    optimization_id UUID REFERENCES optimizations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('element', 'css', 'js', 'image', 'font')),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    potential_savings BIGINT NOT NULL,
    selector TEXT,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Mining sessions table
CREATE TABLE mining_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_optimizations INTEGER DEFAULT 0,
    total_space_saved BIGINT DEFAULT 0,
    total_tokens_earned DECIMAL(36, 18) DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Performance metrics table
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15, 6) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_reputation_score ON users(reputation_score DESC);
CREATE INDEX idx_optimizations_user_id ON optimizations(user_id);
CREATE INDEX idx_optimizations_url ON optimizations(url);
CREATE INDEX idx_optimizations_proof_hash ON optimizations(proof_hash);
CREATE INDEX idx_optimizations_created_at ON optimizations(created_at DESC);
CREATE INDEX idx_optimizations_verification_score ON optimizations(verification_score DESC);
CREATE INDEX idx_metaverse_infrastructure_user_id ON metaverse_infrastructure(user_id);
CREATE INDEX idx_metaverse_infrastructure_type ON metaverse_infrastructure(type);
CREATE INDEX idx_staking_transactions_user_id ON staking_transactions(user_id);
CREATE INDEX idx_staking_transactions_type ON staking_transactions(type);
CREATE INDEX idx_token_transfers_to_address ON token_transfers(to_address);
CREATE INDEX idx_token_transfers_from_address ON token_transfers(from_address);
CREATE INDEX idx_token_transfers_created_at ON token_transfers(created_at DESC);
CREATE INDEX idx_blockchain_events_event_type ON blockchain_events(event_type);
CREATE INDEX idx_blockchain_events_contract_address ON blockchain_events(contract_address);
CREATE INDEX idx_blockchain_events_block_number ON blockchain_events(block_number DESC);
CREATE INDEX idx_optimization_recommendations_optimization_id ON optimization_recommendations(optimization_id);
CREATE INDEX idx_optimization_recommendations_type ON optimization_recommendations(type);
CREATE INDEX idx_optimization_recommendations_severity ON optimization_recommendations(severity);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX idx_mining_sessions_session_id ON mining_sessions(session_id);
CREATE INDEX idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.wallet_address,
    u.username,
    u.reputation_score,
    u.total_space_harvested,
    u.optimization_count,
    u.successful_optimizations,
    u.optimization_streak,
    u.staked_amount,
    COUNT(o.id) as total_optimizations,
    COALESCE(SUM(o.space_bytes), 0) as total_space_saved,
    COALESCE(AVG(o.verification_score), 0) as avg_verification_score
FROM users u
LEFT JOIN optimizations o ON u.id = o.user_id
GROUP BY u.id, u.wallet_address, u.username, u.reputation_score, 
         u.total_space_harvested, u.optimization_count, u.successful_optimizations,
         u.optimization_streak, u.staked_amount;

CREATE VIEW optimization_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as optimizations_count,
    SUM(space_bytes) as total_space_saved,
    AVG(verification_score) as avg_verification_score,
    COUNT(CASE WHEN is_verified THEN 1 END) as verified_count
FROM optimizations
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE VIEW metaverse_stats AS
SELECT 
    type,
    COUNT(*) as count,
    SUM(size) as total_size,
    AVG(size) as avg_size
FROM metaverse_infrastructure
GROUP BY type;

-- Stored procedures
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET
            optimization_count = optimization_count + 1,
            total_space_harvested = total_space_harvested + NEW.space_bytes,
            successful_optimizations = successful_optimizations + 1,
            optimization_streak = optimization_streak + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_verified = false AND NEW.is_verified = true THEN
            UPDATE users SET
                successful_optimizations = successful_optimizations + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.user_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating user stats
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT OR UPDATE ON optimizations
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Function to get user leaderboard
CREATE OR REPLACE FUNCTION get_user_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    rank BIGINT,
    wallet_address VARCHAR(42),
    username VARCHAR(50),
    reputation_score INTEGER,
    total_space_harvested BIGINT,
    optimization_count INTEGER,
    successful_optimizations INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.reputation_score DESC, u.total_space_harvested DESC) as rank,
        u.wallet_address,
        u.username,
        u.reputation_score,
        u.total_space_harvested,
        u.optimization_count,
        u.successful_optimizations
    FROM users u
    WHERE u.is_active = true
    ORDER BY u.reputation_score DESC, u.total_space_harvested DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get optimization analytics
CREATE OR REPLACE FUNCTION get_optimization_analytics(days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    optimizations_count BIGINT,
    total_space_saved BIGINT,
    avg_verification_score NUMERIC,
    verified_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as optimizations_count,
        SUM(space_bytes) as total_space_saved,
        AVG(verification_score) as avg_verification_score,
        COUNT(CASE WHEN is_verified THEN 1 END) as verified_count
    FROM optimizations
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert initial network statistics
INSERT INTO network_statistics (
    total_optimizations,
    total_space_saved,
    total_tokens_minted,
    total_staked,
    active_users,
    virtual_land_count,
    ai_node_count,
    storage_shard_count,
    bridge_count
) VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lightdom_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lightdom_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO lightdom_user;