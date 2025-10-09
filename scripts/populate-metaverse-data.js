/**
 * Populate Metaverse Database with Sample Data
 * This script inserts sample data into the dom_space_harvester database
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

async function populateMetaverseData() {
  try {
    console.log('🚀 Starting metaverse data population...');

    // Insert sample space bridges
    console.log('📡 Inserting space bridges...');
    await pool.query(`
      INSERT INTO metaverse.space_bridges (
        id, bridge_id, source_url, source_site_id, source_chain, target_chain,
        space_available, space_used, efficiency, is_operational, status,
        current_volume, bridge_capacity, metadata
      ) VALUES 
      ('bridge_001', 'bridge_ethereum_metaverse', 'https://ethereum.org', 'site_eth_001', 'ethereum', 'metaverse', 
       104857600, 52428800, 85, true, 'active', 52428800, 104857600, 
       '{"domain": "ethereum.org", "seoScore": 95, "optimizationLevel": "high"}'::jsonb),
      ('bridge_002', 'bridge_polygon_metaverse', 'https://polygon.technology', 'site_poly_001', 'polygon', 'metaverse',
       52428800, 26214400, 78, true, 'active', 26214400, 52428800,
       '{"domain": "polygon.technology", "seoScore": 88, "optimizationLevel": "medium"}'::jsonb),
      ('bridge_003', 'bridge_web3_metaverse', 'https://web3.foundation', 'site_web3_001', 'web3', 'metaverse',
       209715200, 104857600, 92, true, 'active', 104857600, 209715200,
       '{"domain": "web3.foundation", "seoScore": 92, "optimizationLevel": "high"}'::jsonb),
      ('bridge_004', 'bridge_lightdom_space', 'https://lightdom.io', 'site_ld_001', 'lightdom', 'space',
       157286400, 78643200, 88, true, 'active', 78643200, 157286400,
       '{"domain": "lightdom.io", "seoScore": 90, "optimizationLevel": "high"}'::jsonb),
      ('bridge_005', 'bridge_maintenance', 'https://example.com', 'site_ex_001', 'ethereum', 'metaverse',
       10485760, 5242880, 45, false, 'maintenance', 5242880, 10485760,
       '{"domain": "example.com", "seoScore": 60, "optimizationLevel": "low"}'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample chat rooms
    console.log('💬 Inserting chat rooms...');
    await pool.query(`
      INSERT INTO metaverse.chat_rooms (
        id, name, description, owner_address, total_space, price, revenue,
        participants, settings, coordinates, primary_bridge_id
      ) VALUES 
      ('room_001', 'Ethereum Space Hub', 'Main hub for Ethereum space mining discussions', 
       '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 52428800, 100.50, 1250.75,
       '[{"address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", "name": "Alice", "role": "owner"}, 
         {"address": "0x8ba1f109551bD432803012645Hac136c", "name": "Bob", "role": "member"}]'::jsonb,
       '{"maxParticipants": 50, "allowGuests": true, "moderationLevel": "medium"}'::jsonb,
       '{"sector": "ethereum", "coordinates": [100, 200, 300], "biome": "digital"}'::jsonb,
       'bridge_ethereum_metaverse'),
      ('room_002', 'Polygon Optimizers', 'Advanced optimization techniques for Polygon network',
       '0x8ba1f109551bD432803012645Hac136c', 26214400, 75.25, 850.50,
       '[{"address": "0x8ba1f109551bD432803012645Hac136c", "name": "Bob", "role": "owner"},
         {"address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", "name": "Alice", "role": "member"}]'::jsonb,
       '{"maxParticipants": 25, "allowGuests": false, "moderationLevel": "high"}'::jsonb,
       '{"sector": "polygon", "coordinates": [150, 250, 350], "biome": "technical"}'::jsonb,
       'bridge_polygon_metaverse'),
      ('room_003', 'Web3 Foundation Space', 'Official Web3 Foundation space mining community',
       '0x1234567890123456789012345678901234567890', 104857600, 200.00, 3200.00,
       '[{"address": "0x1234567890123456789012345678901234567890", "name": "Web3Admin", "role": "owner"},
         {"address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", "name": "Alice", "role": "moderator"},
         {"address": "0x8ba1f109551bD432803012645Hac136c", "name": "Bob", "role": "member"}]'::jsonb,
       '{"maxParticipants": 100, "allowGuests": true, "moderationLevel": "low"}'::jsonb,
       '{"sector": "web3", "coordinates": [200, 300, 400], "biome": "foundation"}'::jsonb,
       'bridge_web3_metaverse')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample bridge messages
    console.log('💌 Inserting bridge messages...');
    await pool.query(`
      INSERT INTO metaverse.bridge_messages (
        id, message_id, bridge_id, user_name, user_id, message_text, message_type, metadata
      ) VALUES 
      ('msg_001', 'msg_eth_001', 'bridge_ethereum_metaverse', 'Alice', 'user_alice_001', 
       'Welcome to the Ethereum-Metaverse bridge! Ready to mine some space?', 'system', 
       '{"priority": "high", "tags": ["welcome", "ethereum"]}'::jsonb),
      ('msg_002', 'msg_eth_002', 'bridge_ethereum_metaverse', 'Bob', 'user_bob_001',
       'Just mined 50KB of space from ethereum.org! Efficiency is looking great.', 'space_mined',
       '{"spaceMined": 51200, "efficiency": 85, "source": "ethereum.org"}'::jsonb),
      ('msg_003', 'msg_poly_001', 'bridge_polygon_metaverse', 'Charlie', 'user_charlie_001',
       'Polygon bridge is performing exceptionally well today. 92% efficiency!', 'optimization',
       '{"efficiency": 92, "performance": "excellent", "timestamp": "2024-01-15T10:30:00Z"}'::jsonb),
      ('msg_004', 'msg_web3_001', 'bridge_web3_metaverse', 'Diana', 'user_diana_001',
       'New optimization algorithm deployed. Expecting 15% improvement in space mining.', 'bridge_event',
       '{"eventType": "deployment", "improvement": 15, "algorithm": "space_optimizer_v2"}'::jsonb),
      ('msg_005', 'msg_ld_001', 'bridge_lightdom_space', 'Eve', 'user_eve_001',
       'LightDom space bridge is now live! Join the revolution of web optimization.', 'system',
       '{"priority": "high", "tags": ["launch", "lightdom", "space"]}'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample space bridge connections
    console.log('🔗 Inserting bridge connections...');
    await pool.query(`
      INSERT INTO metaverse.space_bridge_connections (
        id, optimization_id, bridge_id, space_mined_kb, biome_type, connection_strength
      ) VALUES 
      ('conn_001', 'opt_eth_001', 'bridge_ethereum_metaverse', 51200, 'digital', 95.5),
      ('conn_002', 'opt_poly_001', 'bridge_polygon_metaverse', 25600, 'technical', 88.2),
      ('conn_003', 'opt_web3_001', 'bridge_web3_metaverse', 102400, 'foundation', 92.8),
      ('conn_004', 'opt_ld_001', 'bridge_lightdom_space', 76800, 'optimization', 90.1),
      ('conn_005', 'opt_eth_002', 'bridge_ethereum_metaverse', 38400, 'digital', 87.3)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample bridge analytics
    console.log('📊 Inserting bridge analytics...');
    await pool.query(`
      INSERT INTO metaverse.bridge_analytics (
        bridge_id, total_messages, active_participants, space_utilized, efficiency_score, performance_metrics
      ) VALUES 
      ('bridge_ethereum_metaverse', 150, 25, 52428800, 85.5, 
       '{"avgResponseTime": 120, "uptime": 99.8, "throughput": 1000}'::jsonb),
      ('bridge_polygon_metaverse', 89, 15, 26214400, 78.2,
       '{"avgResponseTime": 95, "uptime": 99.5, "throughput": 750}'::jsonb),
      ('bridge_web3_metaverse', 203, 35, 104857600, 92.1,
       '{"avgResponseTime": 80, "uptime": 99.9, "throughput": 1500}'::jsonb),
      ('bridge_lightdom_space', 67, 12, 78643200, 88.7,
       '{"avgResponseTime": 110, "uptime": 99.6, "throughput": 900}'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Metaverse data population completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 5 space bridges created');
    console.log('   - 3 chat rooms created');
    console.log('   - 5 bridge messages created');
    console.log('   - 5 bridge connections created');
    console.log('   - 4 analytics records created');

  } catch (error) {
    console.error('❌ Error populating metaverse data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the population script
if (require.main === module) {
  populateMetaverseData()
    .then(() => {
      console.log('🎉 Database population completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database population failed:', error);
      process.exit(1);
    });
}

module.exports = { populateMetaverseData };
