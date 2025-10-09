// Simple API Server for LightDom
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import crawler from './web-crawler-service.js';
import dotenv from 'dotenv';
dotenv.config();
let databaseIntegration = null;
try {
  const mod = await import('./src/services/DatabaseIntegration.js');
  databaseIntegration = mod.databaseIntegration;
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'LightDom API Server'
  });
});

// Database health endpoint (Postgres)
app.get('/api/db/health', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      idleTimeoutMillis: 5000
    });
    const { rows } = await pool.query('SELECT 1 as ok');
    await pool.end();
    res.json({ success: true, ok: rows[0].ok === 1 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Apply database schemas (idempotent)
app.post('/api/db/apply-schemas', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const schemaFiles = [
      'database/blockchain_schema.sql',
      'database/optimization_schema.sql',
      'database/bridge_schema.sql',
      'database/billing_schema.sql',
      'database/metaverse_schema.sql',
      'database/unified_metaverse_migration.sql',
      'database/01-blockchain.sql',
      'database/02-optimization.sql',
      'database/03-bridge.sql'
    ];

    for (const relPath of schemaFiles) {
      try {
        const full = path.join(process.cwd(), relPath);
        const sql = await fs.readFile(full, 'utf8');
        if (sql && sql.trim()) {
          await pool.query(sql);
        }
      } catch (e) {
        // continue on individual file errors to be resilient
        console.warn('Schema apply warning:', relPath, e.message);
      }
    }

    await pool.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Initialize DB and apply schemas via integration (manual trigger)
app.post('/api/db/migrate', async (req, res) => {
  try {
    if (!databaseIntegration) {
      return res.status(500).json({ success: false, error: 'DatabaseIntegration unavailable' });
    }
    process.env.APPLY_SCHEMAS = 'true';
    await databaseIntegration.initialize();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mock metaverse mining data endpoint
app.get('/api/metaverse/mining-data', (req, res) => {
  const mockData = {
    totalMined: Math.floor(Math.random() * 10000),
    activeMiners: Math.floor(Math.random() * 100),
    tokensEarned: Math.floor(Math.random() * 1000),
    lastUpdate: new Date().toISOString(),
    miningRate: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100)
  };
  
  res.json(mockData);
});

// Mock blockchain data endpoint
app.get('/api/blockchain/stats', (req, res) => {
  const mockData = {
    totalTransactions: Math.floor(Math.random() * 100000),
    activeContracts: Math.floor(Math.random() * 50),
    gasPrice: Math.floor(Math.random() * 100),
    blockHeight: Math.floor(Math.random() * 1000000),
    networkHash: Math.floor(Math.random() * 1000000000)
  };
  
  res.json(mockData);
});

// Mock optimization data endpoint
app.get('/api/optimization/stats', (req, res) => {
  const mockData = {
    totalOptimizations: Math.floor(Math.random() * 1000),
    spaceSaved: Math.floor(Math.random() * 10000),
    performanceGain: Math.floor(Math.random() * 100),
    lastOptimization: new Date().toISOString()
  };
  
  res.json(mockData);
});

// Metaverse Dashboard API Endpoints

// Metaverse overview stats
app.get('/api/metaverse/stats', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    // Get bridge stats
    const bridgeStats = await pool.query(`
      SELECT 
        COUNT(*) as total_bridges,
        COUNT(*) FILTER (WHERE is_operational = true) as active_bridges,
        SUM(space_available) as total_space_available,
        SUM(space_used) as total_space_used,
        AVG(efficiency) as avg_efficiency
      FROM metaverse.space_bridges
    `);

    // Get chat room stats
    const roomStats = await pool.query(`
      SELECT 
        COUNT(*) as total_rooms,
        COUNT(DISTINCT jsonb_array_length(participants)) as active_users,
        SUM(price) as total_revenue
      FROM metaverse.chat_rooms
      WHERE expires_at IS NULL OR expires_at > NOW()
    `);

    // Get message count
    const messageStats = await pool.query(`
      SELECT COUNT(*) as total_messages
      FROM metaverse.bridge_messages
    `);

    const stats = {
      totalBridges: parseInt(bridgeStats.rows[0].total_bridges) || 0,
      activeBridges: parseInt(bridgeStats.rows[0].active_bridges) || 0,
      totalSpaceMined: parseInt(bridgeStats.rows[0].total_space_used) || 0,
      totalSpaceAvailable: parseInt(bridgeStats.rows[0].total_space_available) || 0,
      totalChatRooms: parseInt(roomStats.rows[0].total_rooms) || 0,
      activeUsers: parseInt(roomStats.rows[0].active_users) || 0,
      totalMessages: parseInt(messageStats.rows[0].total_messages) || 0,
      totalRevenue: parseFloat(roomStats.rows[0].total_revenue) || 0,
      averageEfficiency: parseFloat(bridgeStats.rows[0].avg_efficiency) || 0,
      lastUpdate: new Date().toISOString()
    };

    await pool.end();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching metaverse stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get space bridges
app.get('/api/metaverse/bridges', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const result = await pool.query(`
      SELECT * FROM metaverse.space_bridges 
      ORDER BY created_at DESC
    `);

    await pool.end();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bridges:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create space bridge
app.post('/api/metaverse/bridges', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    const b = req.body || {};
    const result = await pool.query(`
      INSERT INTO metaverse.space_bridges (
        id, bridge_id, source_url, source_site_id, source_chain, target_chain,
        space_available, space_used, efficiency, is_operational, status,
        current_volume, bridge_capacity, metadata
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,true),COALESCE($11,'active'),$12,$13,COALESCE($14,'{}'::jsonb)
      ) RETURNING *
    `, [b.id, b.bridge_id, b.source_url, b.source_site_id, b.source_chain, b.target_chain, b.space_available, b.space_used || 0, b.efficiency || 0, b.is_operational, b.status, b.current_volume || 0, b.bridge_capacity || b.space_available, b.metadata]);
    await pool.end();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating bridge:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update space bridge
app.put('/api/metaverse/bridges/:id', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    const b = req.body || {};
    const id = req.params.id;
    const result = await pool.query(`
      UPDATE metaverse.space_bridges SET 
        source_url = COALESCE($2, source_url),
        source_site_id = COALESCE($3, source_site_id),
        source_chain = COALESCE($4, source_chain),
        target_chain = COALESCE($5, target_chain),
        space_available = COALESCE($6, space_available),
        space_used = COALESCE($7, space_used),
        efficiency = COALESCE($8, efficiency),
        is_operational = COALESCE($9, is_operational),
        status = COALESCE($10, status),
        current_volume = COALESCE($11, current_volume),
        bridge_capacity = COALESCE($12, bridge_capacity),
        metadata = COALESCE($13, metadata),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [id, b.source_url, b.source_site_id, b.source_chain, b.target_chain, b.space_available, b.space_used, b.efficiency, b.is_operational, b.status, b.current_volume, b.bridge_capacity, b.metadata]);
    await pool.end();
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating bridge:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete space bridge
app.delete('/api/metaverse/bridges/:id', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    const id = req.params.id;
    const result = await pool.query(`DELETE FROM metaverse.space_bridges WHERE id = $1 RETURNING id`, [id]);
    await pool.end();
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting bridge:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get chat rooms
app.get('/api/metaverse/chatrooms', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const result = await pool.query(`
      SELECT * FROM metaverse.chat_rooms 
      ORDER BY created_at DESC
    `);

    await pool.end();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching chat rooms:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get recent messages
app.get('/api/metaverse/messages', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const result = await pool.query(`
      SELECT * FROM metaverse.bridge_messages 
      ORDER BY created_at DESC 
      LIMIT 20
    `);

    await pool.end();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get economy data
app.get('/api/metaverse/economy', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    // Get economy overview from the view
    const result = await pool.query(`
      SELECT * FROM metaverse.economy_overview
    `);

    await pool.end();
    res.json(result.rows[0] || {
      total_users: 0,
      total_balance: 0,
      total_staked: 0,
      total_transactions: 0,
      total_rewards: 0,
      marketplace_listings: 0,
      items_sold: 0
    });
  } catch (err) {
    console.error('Error fetching economy data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Space Mining API endpoints
app.get('/api/space-mining/spatial-structures', (req, res) => {
  const mockData = {
    structures: [
      {
        id: 'struct-1',
        name: 'Quantum DOM Cluster',
        type: 'spatial',
        coordinates: { x: 100, y: 200, z: 50 },
        energy: Math.floor(Math.random() * 1000),
        status: 'active',
        lastMined: new Date().toISOString()
      },
      {
        id: 'struct-2',
        name: 'Light DOM Fragment',
        type: 'fragment',
        coordinates: { x: 150, y: 300, z: 75 },
        energy: Math.floor(Math.random() * 800),
        status: 'mining',
        lastMined: new Date().toISOString()
      }
    ],
    totalStructures: 2,
    activeMining: 1
  };
  
  res.json(mockData);
});

app.get('/api/space-mining/isolated-doms', (req, res) => {
  const mockData = {
    doms: [
      {
        id: 'dom-1',
        url: 'https://example.com',
        size: Math.floor(Math.random() * 10000),
        complexity: Math.floor(Math.random() * 100),
        lastCrawled: new Date().toISOString(),
        status: 'isolated'
      },
      {
        id: 'dom-2',
        url: 'https://test.com',
        size: Math.floor(Math.random() * 8000),
        complexity: Math.floor(Math.random() * 80),
        lastCrawled: new Date().toISOString(),
        status: 'processing'
      }
    ],
    totalDOMs: 2,
    processing: 1
  };
  
  res.json(mockData);
});

app.get('/api/space-mining/bridges', (req, res) => {
  const mockData = {
    bridges: [
      {
        id: 'bridge-1',
        name: 'Metaverse Bridge Alpha',
        status: 'connected',
        throughput: Math.floor(Math.random() * 1000),
        latency: Math.floor(Math.random() * 100),
        lastActivity: new Date().toISOString()
      },
      {
        id: 'bridge-2',
        name: 'Quantum Bridge Beta',
        status: 'connecting',
        throughput: Math.floor(Math.random() * 800),
        latency: Math.floor(Math.random() * 150),
        lastActivity: new Date().toISOString()
      }
    ],
    totalBridges: 2,
    active: 1
  };
  
  res.json(mockData);
});

app.get('/api/space-mining/stats', (req, res) => {
  const mockData = {
    totalMined: Math.floor(Math.random() * 100000),
    activeMiners: Math.floor(Math.random() * 50),
    tokensEarned: Math.floor(Math.random() * 5000),
    miningRate: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100),
    lastUpdate: new Date().toISOString()
  };
  
  res.json(mockData);
});

// Web Crawler API endpoints
app.get('/api/crawler/stats', (req, res) => {
  const stats = crawler.getStats();
  res.json(stats);
});

app.get('/api/crawler/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const recent = crawler.getRecentCrawls(limit);
  res.json({ crawls: recent });
});

app.post('/api/crawler/start', (req, res) => {
  crawler.startCrawling();
  res.json({ message: 'Crawler started', status: 'success' });
});

app.post('/api/crawler/stop', (req, res) => {
  crawler.stopCrawling();
  res.json({ message: 'Crawler stopped', status: 'success' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 LightDom API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⛏️  Mining data: http://localhost:${PORT}/api/metaverse/mining-data`);
  try {
    if (process.env.APPLY_SCHEMAS === 'true' && databaseIntegration) {
      await databaseIntegration.initialize();
      console.log('✅ Schemas ensured at startup');
    }
  } catch (e) {
    console.warn('⚠️  Schema init at startup failed:', e.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 API Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 API Server shutting down...');
  process.exit(0);
});
