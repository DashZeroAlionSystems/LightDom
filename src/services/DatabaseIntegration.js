/**
 * DatabaseIntegration - Connects all unused database schemas and functionality
 * Integrates blockchain, optimization, bridge, and billing schemas
 *
 * Note: This module is server-only. It lazily imports Node dependencies
 * to avoid bundling issues in the browser (Vite/Electron renderer).
 */

let PoolCtor = null;
let fsPromises = null;
let pathMod = null;

export class DatabaseIntegration {
  constructor(config = {}) {
    console.log('🗄️ Initializing DatabaseIntegration with all schemas...');
    
    const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
    this.config = {
      host: config.host || env.DB_HOST || 'localhost',
      port: config.port || env.DB_PORT || 5432,
      database: config.database || env.DB_NAME || 'lightdom',
      user: config.user || env.DB_USER || 'postgres',
      password: config.password || env.DB_PASSWORD || 'postgres',
      max: config.maxConnections || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ...config
    };
    
    this.pool = null;
    this.schemas = {
      blockchain: 'database/blockchain_schema.sql',
      optimization: 'database/optimization_schema.sql',
      bridge: 'database/bridge_schema.sql',
      billing: 'database/billing_schema.sql',
      metaverse: 'database/metaverse_schema.sql',
      unified_metaverse: 'database/unified_metaverse_migration.sql',
      blockchain_alt: 'database/01-blockchain.sql',
      optimization_alt: 'database/02-optimization.sql',
      bridge_alt: 'database/03-bridge.sql',
      seo_service: 'database/seo_service_schema.sql',
      seo_training: 'src/seo/database/training-data-migrations.sql',
      workflow_training: 'database/129-workflow-training.sql'
    };
    
    this.initialized = false;
  }
  
  /**
   * Initialize database connection and schemas
   */
  async initialize() {
    if (typeof window !== 'undefined') {
      throw new Error('DatabaseIntegration is server-only and cannot run in the browser');
    }
    if (this.initialized) {
      console.log('DatabaseIntegration already initialized');
      return;
    }
    
    console.log('🚀 Starting database initialization...');
    
    try {
      if (!PoolCtor) {
        const { Pool } = await import('pg');
        PoolCtor = Pool;
      }
      // Create connection pool
      this.pool = new PoolCtor(this.config);
      
      // Test connection
      await this.pool.query('SELECT NOW()');
      console.log('✅ Database connection established');
      
      // Apply schemas
      if (process.env.APPLY_SCHEMAS === 'true') {
        await this.applySchemas();
      }
      
      this.initialized = true;
      console.log('✅ DatabaseIntegration initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Apply all database schemas
   */
  async applySchemas() {
    console.log('📋 Applying database schemas...');
    
    if (!fsPromises || !pathMod) {
      const [fsImp, pathImp] = await Promise.all([
        import('fs/promises'),
        import('path')
      ]);
      fsPromises = fsImp;
      pathMod = pathImp;
    }

    for (const [name, schemaPath] of Object.entries(this.schemas)) {
      try {
        const fullPath = pathMod.join(process.cwd(), schemaPath);
        const schemaSQL = await fsPromises.readFile(fullPath, 'utf8');
        
        if (schemaSQL && schemaSQL.trim()) {
          console.log(`Applying ${name} schema...`);
          await this.pool.query(schemaSQL);
          console.log(`✅ ${name} schema applied`);
        } else {
          console.log(`⚠️  ${name} schema file is empty, skipping...`);
        }
      } catch (error) {
        console.warn(`⚠️  Schema apply warning: ${schemaPath} ${error.message}`);
        // Continue with other schemas even if one fails
      }
    }
  }
  
  // User Management
  async createUser(walletAddress, userData = {}) {
    const query = `
      INSERT INTO users (
        wallet_address, username, email, reputation_score,
        total_space_harvested, optimization_count
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (wallet_address) DO UPDATE
      SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [
      walletAddress,
      userData.username || null,
      userData.email || null,
      userData.reputation_score || 0,
      userData.total_space_harvested || 0,
      userData.optimization_count || 0
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  async getUserStats(walletAddress) {
    const query = `
      SELECT 
        u.*,
        COUNT(DISTINCT o.id) as total_optimizations,
        SUM(o.space_bytes) as total_space_saved,
        COUNT(DISTINCT m.id) as metaverse_assets,
        COUNT(DISTINCT t.id) as total_transactions
      FROM users u
      LEFT JOIN optimizations o ON u.id = o.user_id
      LEFT JOIN metaverse_infrastructure m ON u.id = m.user_id
      LEFT JOIN transactions t ON u.id = t.user_id
      WHERE u.wallet_address = $1
      GROUP BY u.id
    `;
    
    const result = await this.pool.query(query, [walletAddress]);
    return result.rows[0];
  }
  
  // Optimization Management
  async recordOptimization(userId, optimizationData) {
    const query = `
      INSERT INTO optimizations (
        user_id, url, space_bytes, proof_hash, biome_type,
        verification_score, metadata, transaction_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      userId,
      optimizationData.url,
      optimizationData.space_bytes,
      optimizationData.proof_hash,
      optimizationData.biome_type || 'general',
      optimizationData.verification_score || 0,
      JSON.stringify(optimizationData.metadata || {}),
      optimizationData.transaction_hash || null
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  async getOptimizationHistory(userId, limit = 50) {
    const query = `
      SELECT * FROM optimizations
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [userId, limit]);
    return result.rows;
  }
  
  // Metaverse Infrastructure
  async createMetaverseAsset(userId, assetData) {
    const query = `
      INSERT INTO metaverse_infrastructure (
        user_id, type, infrastructure_id, location, build_type,
        level, space_capacity, energy_generation, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      userId,
      assetData.type,
      assetData.infrastructure_id,
      assetData.location,
      assetData.build_type,
      assetData.level || 1,
      assetData.space_capacity || 0,
      assetData.energy_generation || 0,
      JSON.stringify(assetData.metadata || {})
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  // Bridge Operations
  async createBridgeRequest(requestData) {
    const query = `
      INSERT INTO bridge_requests (
        user_id, source_chain, destination_chain, asset_type,
        amount, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      requestData.user_id,
      requestData.source_chain,
      requestData.destination_chain,
      requestData.asset_type,
      requestData.amount,
      'pending',
      JSON.stringify(requestData.metadata || {})
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  // Gamification
  async awardAchievement(userId, achievementData) {
    const query = `
      INSERT INTO achievements (
        user_id, achievement_id, points_awarded, metadata
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, achievement_id) DO NOTHING
      RETURNING *
    `;
    
    const values = [
      userId,
      achievementData.achievement_id,
      achievementData.points_awarded || 0,
      JSON.stringify(achievementData.metadata || {})
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  async getLeaderboard(timeframe = 'all', limit = 100) {
    let timeCondition = '';
    if (timeframe === 'daily') {
      timeCondition = "WHERE o.created_at >= CURRENT_DATE";
    } else if (timeframe === 'weekly') {
      timeCondition = "WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (timeframe === 'monthly') {
      timeCondition = "WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    const query = `
      SELECT 
        u.wallet_address,
        u.username,
        u.reputation_score,
        COUNT(DISTINCT o.id) as optimizations,
        SUM(o.space_bytes) as total_space_saved,
        MAX(o.created_at) as last_optimization
      FROM users u
      JOIN optimizations o ON u.id = o.user_id
      ${timeCondition}
      GROUP BY u.id
      ORDER BY total_space_saved DESC
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }
  
  // Blockchain Events
  async recordBlockchainEvent(eventData) {
    const query = `
      INSERT INTO blockchain_events (
        event_type, transaction_hash, block_number, contract_address,
        event_data, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      eventData.event_type,
      eventData.transaction_hash,
      eventData.block_number,
      eventData.contract_address,
      JSON.stringify(eventData.event_data || {}),
      eventData.user_id || null
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  // Analytics
  async getSystemStats() {
    const stats = await this.pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM optimizations) as total_optimizations,
        (SELECT SUM(space_bytes) FROM optimizations) as total_space_saved,
        (SELECT COUNT(*) FROM metaverse_infrastructure) as total_metaverse_assets,
        (SELECT COUNT(*) FROM transactions) as total_transactions,
        (SELECT COUNT(*) FROM blockchain_events) as total_events
    `);
    
    return stats.rows[0];
  }
  
  // Run custom query (for advanced use cases)
  async query(text, params) {
    return await this.pool.query(text, params);
  }
  
  // Shutdown
  async shutdown() {
    console.log('🛑 Shutting down DatabaseIntegration...');
    if (this.pool) {
      await this.pool.end();
    }
    this.initialized = false;
    console.log('✅ DatabaseIntegration shutdown complete');
  }
}

// Export singleton instance (server-only). In browser, export null to avoid eval/side effects
export const databaseIntegration = (typeof window === 'undefined') ? new DatabaseIntegration() : null;


