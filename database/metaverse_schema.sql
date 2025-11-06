-- Metaverse and Space Bridge Database Schema
-- Extends the blockchain schema with metaverse functionality

-- Crawled Sites Table
CREATE TABLE IF NOT EXISTS crawled_sites (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    last_crawled TIMESTAMP NOT NULL,
    crawl_frequency INTEGER DEFAULT 24, -- hours
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
    optimization_potential BIGINT DEFAULT 0,
    current_size BIGINT NOT NULL,
    optimized_size BIGINT NOT NULL,
    space_reclaimed BIGINT DEFAULT 0,
    blockchain_recorded BOOLEAN DEFAULT false,
    transaction_hash VARCHAR(66),
    metaverse_slot_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_crawled_domain (domain),
    INDEX idx_crawled_priority (priority, last_crawled),
    INDEX idx_crawled_space (space_reclaimed)
);

-- Space Allocations Table
CREATE TABLE IF NOT EXISTS space_allocations (
    site_id VARCHAR(255) PRIMARY KEY REFERENCES crawled_sites(id) ON DELETE CASCADE,
    total_space BIGINT NOT NULL,
    used_space BIGINT DEFAULT 0,
    available_space BIGINT NOT NULL,
    slots JSONB NOT NULL, -- Array of LightDomSlot objects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (used_space <= total_space),
    CHECK (available_space = total_space - used_space)
);

-- Metaverse Chatrooms Table
CREATE TABLE IF NOT EXISTS metaverse_chatrooms (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner VARCHAR(42) NOT NULL, -- wallet address
    slot_ids JSONB NOT NULL, -- Array of slot IDs
    total_space BIGINT NOT NULL,
    participants JSONB NOT NULL, -- Array of ChatParticipant objects
    settings JSONB NOT NULL, -- ChatRoomSettings object
    price VARCHAR(50) DEFAULT '0', -- LDOM tokens
    revenue VARCHAR(50) DEFAULT '0', -- LDOM earned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    coordinates JSONB NOT NULL, -- MetaverseCoordinates
    
    INDEX idx_chatroom_owner (owner),
    INDEX idx_chatroom_expires (expires_at),
    INDEX idx_chatroom_name (name)
);

-- Chat Messages Table (partitioned by month for performance)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) NOT NULL,
    room_id VARCHAR(255) NOT NULL REFERENCES metaverse_chatrooms(id) ON DELETE CASCADE,
    sender VARCHAR(42) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'file', 'system')),
    timestamp TIMESTAMP NOT NULL,
    reactions JSONB DEFAULT '{}',
    reply_to VARCHAR(255),
    edited BOOLEAN DEFAULT false,
    metadata JSONB,
    
    PRIMARY KEY (id, timestamp),
    INDEX idx_message_room (room_id, timestamp),
    INDEX idx_message_sender (sender, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions for messages
CREATE TABLE chat_messages_2024_01 PARTITION OF chat_messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE chat_messages_2024_02 PARTITION OF chat_messages
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
    
-- Add more partitions as needed...

-- Metaverse Portals Table
CREATE TABLE IF NOT EXISTS metaverse_portals (
    from_room VARCHAR(255) NOT NULL REFERENCES metaverse_chatrooms(id) ON DELETE CASCADE,
    to_room VARCHAR(255) NOT NULL REFERENCES metaverse_chatrooms(id) ON DELETE CASCADE,
    bidirectional BOOLEAN DEFAULT true,
    price VARCHAR(50) DEFAULT '0', -- LDOM tokens
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    
    PRIMARY KEY (from_room, to_room),
    INDEX idx_portal_to (to_room)
);

-- LDOM Economy Tables

-- User Economy Table
CREATE TABLE IF NOT EXISTS user_economy (
    wallet_address VARCHAR(42) PRIMARY KEY,
    balance VARCHAR(50) DEFAULT '0',
    staked_balance VARCHAR(50) DEFAULT '0',
    staking_rewards VARCHAR(50) DEFAULT '0',
    total_earned VARCHAR(50) DEFAULT '0',
    total_spent VARCHAR(50) DEFAULT '0',
    transaction_history JSONB DEFAULT '[]',
    staking_history JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_economy_balance (balance),
    INDEX idx_economy_staked (staked_balance)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('reward', 'purchase', 'transfer', 'stake', 'unstake', 'fee')),
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    block_number BIGINT,
    
    INDEX idx_tx_from (from_address, timestamp),
    INDEX idx_tx_to (to_address, timestamp),
    INDEX idx_tx_status (status, timestamp)
);

-- Marketplace Items Table
CREATE TABLE IF NOT EXISTS marketplace_items (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('chatroom', 'slot', 'portal', 'nft')),
    seller VARCHAR(42) NOT NULL,
    price VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    listed TIMESTAMP NOT NULL,
    sold TIMESTAMP,
    buyer VARCHAR(42),
    
    INDEX idx_market_type (type, listed),
    INDEX idx_market_seller (seller),
    INDEX idx_market_price (price),
    INDEX idx_market_unsold (sold) WHERE sold IS NULL
);

-- Space Bridges Table
CREATE TABLE IF NOT EXISTS space_bridges (
    id VARCHAR(255) PRIMARY KEY,
    source_url TEXT NOT NULL,
    source_site_id VARCHAR(255) REFERENCES crawled_sites(id) ON DELETE CASCADE,
    space_available BIGINT NOT NULL,
    space_used BIGINT DEFAULT 0,
    slots JSONB NOT NULL, -- Array of BridgedSlot objects
    chat_rooms JSONB DEFAULT '[]', -- Array of room IDs
    efficiency INTEGER DEFAULT 50 CHECK (efficiency >= 0 AND efficiency <= 100),
    last_optimized TIMESTAMP NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_bridge_site (source_site_id),
    INDEX idx_bridge_efficiency (efficiency),
    INDEX idx_bridge_available (space_available - space_used)
);

-- Optimization Schedule Table
CREATE TABLE IF NOT EXISTS optimization_schedule (
    bridge_id VARCHAR(255) PRIMARY KEY REFERENCES space_bridges(id) ON DELETE CASCADE,
    next_optimization TIMESTAMP NOT NULL,
    priority INTEGER DEFAULT 5,
    last_result JSONB,
    
    INDEX idx_schedule_next (next_optimization)
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crawled_sites_updated_at BEFORE UPDATE ON crawled_sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_space_allocations_updated_at BEFORE UPDATE ON space_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_economy_updated_at BEFORE UPDATE ON user_economy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_space_bridges_updated_at BEFORE UPDATE ON space_bridges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analytics Views

-- Metaverse Activity View
CREATE OR REPLACE VIEW metaverse_activity AS
SELECT 
    mc.id as room_id,
    mc.name as room_name,
    mc.owner,
    mc.total_space,
    COUNT(DISTINCT cm.sender) as unique_participants,
    COUNT(cm.id) as message_count,
    MAX(cm.timestamp) as last_activity,
    mc.revenue,
    mc.coordinates->>'sector' as sector
FROM metaverse_chatrooms mc
LEFT JOIN chat_messages cm ON mc.id = cm.room_id
WHERE mc.expires_at IS NULL OR mc.expires_at > NOW()
GROUP BY mc.id;

-- Space Utilization View
CREATE OR REPLACE VIEW space_utilization AS
SELECT 
    cs.domain,
    COUNT(cs.id) as sites_crawled,
    SUM(cs.space_reclaimed) as total_space_reclaimed,
    AVG(cs.seo_score) as avg_seo_score,
    SUM(sa.used_space) as space_allocated,
    SUM(sa.available_space) as space_available
FROM crawled_sites cs
LEFT JOIN space_allocations sa ON cs.id = sa.site_id
GROUP BY cs.domain;

-- Economy Overview View
CREATE OR REPLACE VIEW economy_overview AS
SELECT 
    COUNT(DISTINCT ue.wallet_address) as total_users,
    SUM(CAST(ue.balance AS NUMERIC)) as total_balance,
    SUM(CAST(ue.staked_balance AS NUMERIC)) as total_staked,
    COUNT(DISTINCT t.id) as total_transactions,
    SUM(CASE WHEN t.type = 'reward' THEN CAST(t.amount AS NUMERIC) ELSE 0 END) as total_rewards,
    COUNT(DISTINCT mi.id) as marketplace_listings,
    COUNT(DISTINCT mi.id) FILTER (WHERE mi.sold IS NOT NULL) as items_sold
FROM user_economy ue
CROSS JOIN transactions t
CROSS JOIN marketplace_items mi;

-- Indexes for performance
CREATE INDEX idx_crawled_sites_composite ON crawled_sites(domain, seo_score, space_reclaimed);
CREATE INDEX idx_chat_messages_composite ON chat_messages(room_id, sender, timestamp);
CREATE INDEX idx_transactions_composite ON transactions(from_address, to_address, type, timestamp);

-- Add comments for documentation
COMMENT ON TABLE crawled_sites IS 'Stores information about crawled websites and their optimization potential';
COMMENT ON TABLE space_allocations IS 'Manages LightDOM slots allocated from optimized space';
COMMENT ON TABLE metaverse_chatrooms IS 'Virtual chatrooms in the LightDOM metaverse';
COMMENT ON TABLE chat_messages IS 'Messages in metaverse chatrooms, partitioned by month';
COMMENT ON TABLE user_economy IS 'LDOM token balances and economy data for users';
COMMENT ON TABLE space_bridges IS 'Bridges between optimized web space and metaverse infrastructure';


