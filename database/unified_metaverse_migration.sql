-- Unified Metaverse Migration Script
-- Combines bridge_schema.sql and metaverse_schema.sql with enhancements

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS metaverse;

-- ====================================
-- Space Bridges Table (Unified)
-- ====================================
CREATE TABLE IF NOT EXISTS metaverse.space_bridges (
    id VARCHAR(255) PRIMARY KEY,
    bridge_id VARCHAR(255) UNIQUE NOT NULL, -- For socket.io compatibility
    source_url TEXT NOT NULL,
    source_site_id VARCHAR(255) NOT NULL,
    source_chain VARCHAR(50) DEFAULT 'lightdom',
    target_chain VARCHAR(50) DEFAULT 'metaverse',
    space_available BIGINT NOT NULL,
    space_used BIGINT DEFAULT 0,
    slots JSONB DEFAULT '[]',
    chat_rooms JSONB DEFAULT '[]',
    efficiency INTEGER CHECK (efficiency >= 0 AND efficiency <= 100),
    last_optimized TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    -- Real-time properties
    is_operational BOOLEAN DEFAULT true,
    validator_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'upgrading')),
    current_volume BIGINT DEFAULT 0,
    bridge_capacity BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_space_bridges_status ON metaverse.space_bridges(status);
CREATE INDEX idx_space_bridges_operational ON metaverse.space_bridges(is_operational);
CREATE INDEX idx_space_bridges_source_site ON metaverse.space_bridges(source_site_id);

-- ====================================
-- Bridge Messages Table
-- ====================================
CREATE TABLE IF NOT EXISTS metaverse.bridge_messages (
    id VARCHAR(255) PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    bridge_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'system', 'optimization', 'space_mined', 'bridge_event')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bridge_id) REFERENCES metaverse.space_bridges(bridge_id) ON DELETE CASCADE
);

CREATE INDEX idx_bridge_messages_bridge ON metaverse.bridge_messages(bridge_id);
CREATE INDEX idx_bridge_messages_user ON metaverse.bridge_messages(user_id);
CREATE INDEX idx_bridge_messages_created ON metaverse.bridge_messages(created_at DESC);

-- ====================================
-- Metaverse Chat Rooms (Enhanced)
-- ====================================
CREATE TABLE IF NOT EXISTS metaverse.chat_rooms (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_address VARCHAR(255) NOT NULL,
    slot_ids JSONB DEFAULT '[]',
    total_space BIGINT DEFAULT 0,
    participants JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    price DECIMAL(18, 6) DEFAULT 0,
    revenue DECIMAL(18, 6) DEFAULT 0,
    coordinates JSONB NOT NULL,
    expires_at TIMESTAMP,
    -- Bridge integration
    primary_bridge_id VARCHAR(255),
    bridge_allocations JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_bridge_id) REFERENCES metaverse.space_bridges(bridge_id) ON DELETE SET NULL
);

CREATE INDEX idx_chat_rooms_owner ON metaverse.chat_rooms(owner_address);
CREATE INDEX idx_chat_rooms_expires ON metaverse.chat_rooms(expires_at);
CREATE INDEX idx_chat_rooms_coordinates ON metaverse.chat_rooms USING GIN (coordinates);

-- ====================================
-- Chat Messages (with Bridge Support)
-- ====================================
CREATE TABLE IF NOT EXISTS metaverse.chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    sender_address VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    -- Bridge message link
    bridge_message_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES metaverse.chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (bridge_message_id) REFERENCES metaverse.bridge_messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_chat_messages_room ON metaverse.chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON metaverse.chat_messages(sender_address);
CREATE INDEX idx_chat_messages_created ON metaverse.chat_messages(created_at DESC);

-- ====================================
-- Space Bridge Connections (New)
-- ====================================
CREATE TABLE IF NOT EXISTS metaverse.space_bridge_connections (
    id VARCHAR(255) PRIMARY KEY,
    optimization_id VARCHAR(255),
    bridge_id VARCHAR(255) NOT NULL,
    space_mined_kb INTEGER NOT NULL,
    biome_type VARCHAR(50),
    connection_strength DECIMAL(5, 2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bridge_id) REFERENCES metaverse.space_bridges(bridge_id) ON DELETE CASCADE
);

CREATE INDEX idx_bridge_connections_bridge ON metaverse.space_bridge_connections(bridge_id);
CREATE INDEX idx_bridge_connections_optimization ON metaverse.space_bridge_connections(optimization_id);

-- ====================================
-- Bridge Analytics Table (New)
-- ====================================
CREATE TABLE IF NOT EXISTS metaverse.bridge_analytics (
    id SERIAL PRIMARY KEY,
    bridge_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    active_participants INTEGER DEFAULT 0,
    space_utilized BIGINT DEFAULT 0,
    efficiency_score DECIMAL(5, 2),
    performance_metrics JSONB DEFAULT '{}',
    FOREIGN KEY (bridge_id) REFERENCES metaverse.space_bridges(bridge_id) ON DELETE CASCADE
);

CREATE INDEX idx_bridge_analytics_bridge ON metaverse.bridge_analytics(bridge_id);
CREATE INDEX idx_bridge_analytics_timestamp ON metaverse.bridge_analytics(timestamp DESC);

-- ====================================
-- Migration Functions
-- ====================================

-- Function to migrate existing bridges if any
CREATE OR REPLACE FUNCTION metaverse.migrate_existing_bridges()
RETURNS void AS $$
BEGIN
    -- Check if old bridge_messages table exists and migrate
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bridge_messages' AND table_schema = 'public') THEN
        INSERT INTO metaverse.bridge_messages (id, message_id, bridge_id, user_name, user_id, message_text, message_type, metadata, created_at)
        SELECT 
            COALESCE(id, 'msg_' || extract(epoch from created_at)::text || '_' || md5(random()::text)),
            COALESCE(message_id, 'msg_' || extract(epoch from created_at)::text || '_' || md5(random()::text)),
            bridge_id,
            user_name,
            user_id,
            message_text,
            message_type,
            COALESCE(metadata, '{}')::jsonb,
            created_at
        FROM public.bridge_messages
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Check if old bridges table exists and migrate
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bridges' AND table_schema = 'public') THEN
        INSERT INTO metaverse.space_bridges (
            id, bridge_id, source_url, source_site_id, source_chain, target_chain,
            space_available, space_used, is_operational, validator_count, status,
            current_volume, bridge_capacity, created_at, updated_at
        )
        SELECT 
            COALESCE(id, 'bridge_' || md5(random()::text)),
            COALESCE(bridge_id, 'bridge_' || md5(random()::text)),
            COALESCE(source_url, 'https://example.com'),
            COALESCE(source_site_id, 'site_' || md5(random()::text)),
            COALESCE(source_chain, 'lightdom'),
            COALESCE(target_chain, 'metaverse'),
            COALESCE(bridge_capacity, 1000000),
            COALESCE(current_volume, 0),
            COALESCE(is_operational, true),
            COALESCE(validator_count, 1),
            COALESCE(status, 'active'),
            COALESCE(current_volume, 0),
            COALESCE(bridge_capacity, 1000000),
            COALESCE(created_at, CURRENT_TIMESTAMP),
            COALESCE(updated_at, CURRENT_TIMESTAMP)
        FROM public.bridges
        ON CONFLICT (id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT metaverse.migrate_existing_bridges();

-- ====================================
-- Update Triggers
-- ====================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION metaverse.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_space_bridges_updated_at
    BEFORE UPDATE ON metaverse.space_bridges
    FOR EACH ROW
    EXECUTE FUNCTION metaverse.update_updated_at();

CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON metaverse.chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION metaverse.update_updated_at();

-- ====================================
-- Views for Analytics
-- ====================================

-- Bridge utilization view
CREATE OR REPLACE VIEW metaverse.bridge_utilization AS
SELECT 
    sb.id,
    sb.bridge_id,
    sb.source_url,
    sb.space_available,
    sb.space_used,
    ROUND((sb.space_used::decimal / NULLIF(sb.space_available, 0)) * 100, 2) as utilization_percent,
    sb.efficiency,
    sb.is_operational,
    sb.status,
    COUNT(DISTINCT bm.user_id) as unique_users,
    COUNT(bm.id) as total_messages,
    sb.created_at,
    sb.last_optimized
FROM metaverse.space_bridges sb
LEFT JOIN metaverse.bridge_messages bm ON sb.bridge_id = bm.bridge_id
GROUP BY sb.id;

-- Active rooms view
CREATE OR REPLACE VIEW metaverse.active_rooms AS
SELECT 
    cr.id,
    cr.name,
    cr.owner_address,
    cr.total_space,
    cr.price,
    cr.revenue,
    COUNT(DISTINCT cm.sender_address) as active_users,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_activity,
    cr.primary_bridge_id,
    sb.efficiency as bridge_efficiency
FROM metaverse.chat_rooms cr
LEFT JOIN metaverse.chat_messages cm ON cr.id = cm.room_id
LEFT JOIN metaverse.space_bridges sb ON cr.primary_bridge_id = sb.bridge_id
WHERE cr.expires_at IS NULL OR cr.expires_at > CURRENT_TIMESTAMP
GROUP BY cr.id, sb.efficiency;

-- ====================================
-- Permissions
-- ====================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA metaverse TO lightdom_user;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA metaverse TO lightdom_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA metaverse TO lightdom_user;

-- Grant permissions on views
GRANT SELECT ON metaverse.bridge_utilization TO lightdom_user;
GRANT SELECT ON metaverse.active_rooms TO lightdom_user;

-- ====================================
-- Sample Data (for testing)
-- ====================================

-- Insert sample bridge if none exist
INSERT INTO metaverse.space_bridges (
    id, bridge_id, source_url, source_site_id, space_available, 
    space_used, efficiency, bridge_capacity, metadata
)
SELECT 
    'bridge_sample_001',
    'bridge_sample_001',
    'https://example.com',
    'site_example_001',
    10485760, -- 10MB
    1048576,  -- 1MB used
    85,
    10485760,
    '{"domain": "example.com", "seoScore": 75}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM metaverse.space_bridges);

-- Completion message
DO $$
BEGIN
    RAISE NOTICE 'Unified Metaverse Migration completed successfully!';
    RAISE NOTICE 'Tables created in metaverse schema:';
    RAISE NOTICE '  - space_bridges (unified)';
    RAISE NOTICE '  - bridge_messages';
    RAISE NOTICE '  - chat_rooms (enhanced)';
    RAISE NOTICE '  - chat_messages (with bridge support)';
    RAISE NOTICE '  - space_bridge_connections';
    RAISE NOTICE '  - bridge_analytics';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - bridge_utilization';
    RAISE NOTICE '  - active_rooms';
END $$;
