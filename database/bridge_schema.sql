-- Bridge and Chat System Database Schema
-- PostgreSQL schema for dimensional bridges and chat functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE bridge_status AS ENUM (
    'active', 'inactive', 'maintenance', 'upgrading'
);

CREATE TYPE message_type AS ENUM (
    'text', 'system', 'optimization', 'space_mined', 'bridge_event'
);

-- Dimensional bridges table (connects different blockchain networks)
CREATE TABLE dimensional_bridges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bridge_id VARCHAR(50) UNIQUE NOT NULL,
    source_chain VARCHAR(50) NOT NULL,
    target_chain VARCHAR(50) NOT NULL,
    bridge_capacity BIGINT DEFAULT 0,
    current_volume BIGINT DEFAULT 0,
    is_operational BOOLEAN DEFAULT TRUE,
    validator_count INTEGER DEFAULT 0,
    last_transaction TIMESTAMP WITH TIME ZONE,
    status bridge_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bridge chat messages table
CREATE TABLE bridge_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id VARCHAR(50) UNIQUE NOT NULL,
    bridge_id VARCHAR(50) NOT NULL REFERENCES dimensional_bridges(bridge_id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_id UUID,
    message_text TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bridge participants table (users who have joined bridge chats)
CREATE TABLE bridge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bridge_id VARCHAR(50) NOT NULL REFERENCES dimensional_bridges(bridge_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Space mining to bridge connections table
CREATE TABLE space_bridge_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    optimization_id UUID NOT NULL,
    bridge_id VARCHAR(50) NOT NULL REFERENCES dimensional_bridges(bridge_id) ON DELETE CASCADE,
    space_mined_kb DECIMAL(10, 2) NOT NULL,
    biome_type VARCHAR(50),
    connection_strength DECIMAL(5, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bridge events table (for tracking bridge activities)
CREATE TABLE bridge_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bridge_id VARCHAR(50) NOT NULL REFERENCES dimensional_bridges(bridge_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_dimensional_bridges_status ON dimensional_bridges(status);
CREATE INDEX idx_dimensional_bridges_operational ON dimensional_bridges(is_operational);
CREATE INDEX idx_dimensional_bridges_volume ON dimensional_bridges(current_volume DESC);

CREATE INDEX idx_bridge_messages_bridge_id ON bridge_messages(bridge_id);
CREATE INDEX idx_bridge_messages_created_at ON bridge_messages(created_at DESC);
CREATE INDEX idx_bridge_messages_type ON bridge_messages(message_type);
CREATE INDEX idx_bridge_messages_user ON bridge_messages(user_name);

CREATE INDEX idx_bridge_participants_bridge_id ON bridge_participants(bridge_id);
CREATE INDEX idx_bridge_participants_user_id ON bridge_participants(user_id);
CREATE INDEX idx_bridge_participants_active ON bridge_participants(is_active);

CREATE INDEX idx_space_bridge_connections_optimization ON space_bridge_connections(optimization_id);
CREATE INDEX idx_space_bridge_connections_bridge ON space_bridge_connections(bridge_id);
CREATE INDEX idx_space_bridge_connections_biome ON space_bridge_connections(biome_type);

CREATE INDEX idx_bridge_events_bridge_id ON bridge_events(bridge_id);
CREATE INDEX idx_bridge_events_type ON bridge_events(event_type);
CREATE INDEX idx_bridge_events_created_at ON bridge_events(created_at DESC);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_bridge_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating bridge timestamps
CREATE TRIGGER update_dimensional_bridges_updated_at
    BEFORE UPDATE ON dimensional_bridges
    FOR EACH ROW
    EXECUTE FUNCTION update_bridge_updated_at_column();

-- Function to create a new bridge
CREATE OR REPLACE FUNCTION create_bridge(
    p_bridge_id VARCHAR(50),
    p_source_chain VARCHAR(50),
    p_target_chain VARCHAR(50),
    p_capacity BIGINT DEFAULT 1000000
) RETURNS UUID AS $$
DECLARE
    bridge_uuid UUID;
BEGIN
    INSERT INTO dimensional_bridges (bridge_id, source_chain, target_chain, bridge_capacity)
    VALUES (p_bridge_id, p_source_chain, p_target_chain, p_capacity)
    RETURNING id INTO bridge_uuid;
    
    RETURN bridge_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to add a message to bridge chat
CREATE OR REPLACE FUNCTION add_bridge_message(
    p_bridge_id VARCHAR(50),
    p_user_name VARCHAR(100),
    p_user_id UUID,
    p_message_text TEXT,
    p_message_type message_type DEFAULT 'text',
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    message_uuid UUID;
    message_id_str VARCHAR(50);
BEGIN
    -- Generate unique message ID
    message_id_str := 'msg_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
    
    INSERT INTO bridge_messages (message_id, bridge_id, user_name, user_id, message_text, message_type, metadata)
    VALUES (message_id_str, p_bridge_id, p_user_name, p_user_id, p_message_text, p_message_type, p_metadata)
    RETURNING id INTO message_uuid;
    
    RETURN message_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to connect space mining to bridge
CREATE OR REPLACE FUNCTION connect_space_to_bridge(
    p_optimization_id UUID,
    p_bridge_id VARCHAR(50),
    p_space_mined_kb DECIMAL(10, 2),
    p_biome_type VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    connection_uuid UUID;
BEGIN
    INSERT INTO space_bridge_connections (optimization_id, bridge_id, space_mined_kb, biome_type)
    VALUES (p_optimization_id, p_bridge_id, p_space_mined_kb, p_biome_type)
    RETURNING id INTO connection_uuid;
    
    RETURN connection_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get bridge statistics
CREATE OR REPLACE FUNCTION get_bridge_stats(p_bridge_id VARCHAR(50))
RETURNS TABLE (
    total_messages BIGINT,
    active_participants BIGINT,
    total_space_connected DECIMAL(10, 2),
    last_message_at TIMESTAMP WITH TIME ZONE,
    bridge_capacity BIGINT,
    current_volume BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(bm.id) as total_messages,
        COUNT(DISTINCT bp.user_id) as active_participants,
        COALESCE(SUM(sbc.space_mined_kb), 0) as total_space_connected,
        MAX(bm.created_at) as last_message_at,
        db.bridge_capacity,
        db.current_volume
    FROM dimensional_bridges db
    LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
    LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
    LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
    WHERE db.bridge_id = p_bridge_id
    GROUP BY db.bridge_id, db.bridge_capacity, db.current_volume;
END;
$$ LANGUAGE plpgsql;

-- Insert sample bridges
INSERT INTO dimensional_bridges (bridge_id, source_chain, target_chain, bridge_capacity, current_volume, is_operational, validator_count) VALUES
('bridge_ethereum_polygon', 'Ethereum', 'Polygon', 1000000, 250000, TRUE, 5),
('bridge_polygon_arbitrum', 'Polygon', 'Arbitrum', 500000, 125000, TRUE, 3),
('bridge_arbitrum_optimism', 'Arbitrum', 'Optimism', 750000, 200000, TRUE, 4),
('bridge_web_dom_metaverse', 'Web DOM', 'Metaverse', 2000000, 500000, TRUE, 8),
('bridge_lightdom_space', 'LightDom Space', 'Virtual Reality', 1500000, 300000, TRUE, 6);

-- Insert sample bridge messages
INSERT INTO bridge_messages (message_id, bridge_id, user_name, message_text, message_type) VALUES
('msg_1', 'bridge_ethereum_polygon', 'Alice', 'Welcome to the Ethereum-Polygon bridge!', 'system'),
('msg_2', 'bridge_ethereum_polygon', 'Bob', 'Just bridged 1000 ETH to Polygon', 'text'),
('msg_3', 'bridge_web_dom_metaverse', 'Charlie', 'Mined 50KB of space from example.com!', 'space_mined'),
('msg_4', 'bridge_lightdom_space', 'Diana', 'Created new virtual land parcel', 'optimization');

-- Insert sample space-bridge connections
INSERT INTO space_bridge_connections (optimization_id, bridge_id, space_mined_kb, biome_type) VALUES
('00000000-0000-0000-0000-000000000001', 'bridge_web_dom_metaverse', 25.5, 'digital'),
('00000000-0000-0000-0000-000000000002', 'bridge_lightdom_space', 42.3, 'commercial'),
('00000000-0000-0000-0000-000000000003', 'bridge_web_dom_metaverse', 18.7, 'knowledge');

-- Create views for common queries
CREATE VIEW active_bridges AS
SELECT 
    db.bridge_id,
    db.source_chain,
    db.target_chain,
    db.bridge_capacity,
    db.current_volume,
    db.validator_count,
    COUNT(bm.id) as message_count,
    COUNT(DISTINCT bp.user_id) as participant_count,
    MAX(bm.created_at) as last_message_at
FROM dimensional_bridges db
LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
WHERE db.is_operational = TRUE
GROUP BY db.bridge_id, db.source_chain, db.target_chain, db.bridge_capacity, db.current_volume, db.validator_count
ORDER BY db.current_volume DESC;

CREATE VIEW bridge_chat_summary AS
SELECT 
    db.bridge_id,
    db.source_chain,
    db.target_chain,
    COUNT(bm.id) as total_messages,
    COUNT(DISTINCT bm.user_name) as unique_users,
    MAX(bm.created_at) as last_activity,
    COALESCE(SUM(sbc.space_mined_kb), 0) as total_space_connected
FROM dimensional_bridges db
LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
GROUP BY db.bridge_id, db.source_chain, db.target_chain
ORDER BY total_space_connected DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lightdom_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lightdom_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO lightdom_user;