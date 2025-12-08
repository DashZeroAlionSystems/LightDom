/**
 * Scraper Manager Service
 * Orchestrates multiple mining/crawler instances with seeded URL configurations
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export class ScraperManagerService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.db = config.db || new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
    
    this.instances = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Initializing Scraper Manager Service...');
      
      // Ensure database tables exist
      await this.ensureTables();
      
      // Load existing instances from database
      await this.loadInstances();
      
      this.isInitialized = true;
      console.log('✅ Scraper Manager Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Scraper Manager:', error.message);
      throw error;
    }
  }

  async ensureTables() {
    const createTablesSQL = `
      -- Scraper instances table
      CREATE TABLE IF NOT EXISTS scraper_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'stopped',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        stopped_at TIMESTAMP,
        stats JSONB DEFAULT '{}'
      );

      -- URL seeds table for crawler instances
      CREATE TABLE IF NOT EXISTS url_seeds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES scraper_instances(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        tags JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        crawled_at TIMESTAMP,
        error TEXT
      );

      -- Crawl results table
      CREATE TABLE IF NOT EXISTS crawl_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES scraper_instances(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        title TEXT,
        content TEXT,
        metadata JSONB DEFAULT '{}',
        extracted_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_scraper_instances_status ON scraper_instances(status);
      CREATE INDEX IF NOT EXISTS idx_url_seeds_instance ON url_seeds(instance_id);
      CREATE INDEX IF NOT EXISTS idx_url_seeds_status ON url_seeds(status);
      CREATE INDEX IF NOT EXISTS idx_crawl_results_instance ON crawl_results(instance_id);
      CREATE INDEX IF NOT EXISTS idx_crawl_results_created ON crawl_results(created_at DESC);
    `;

    await this.db.query(createTablesSQL);
  }

  async loadInstances() {
    const result = await this.db.query(
      'SELECT * FROM scraper_instances ORDER BY created_at DESC'
    );
    
    for (const row of result.rows) {
      this.instances.set(row.id, {
        ...row,
        runtime: null,
      });
    }
    
    console.log(`📦 Loaded ${this.instances.size} scraper instances`);
  }

  async createInstance(name, config = {}) {
    const id = uuidv4();
    
    await this.db.query(
      `INSERT INTO scraper_instances (id, name, config, status)
       VALUES ($1, $2, $3, 'stopped')`,
      [id, name, JSON.stringify(config)]
    );
    
    const instance = {
      id,
      name,
      status: 'stopped',
      config,
      created_at: new Date(),
      updated_at: new Date(),
      stats: {},
      runtime: null,
    };
    
    this.instances.set(id, instance);
    this.emit('instance:created', instance);
    
    console.log(`✅ Created scraper instance: ${name} (${id})`);
    return instance;
  }

  async addUrlSeed(instanceId, url, options = {}) {
    const { priority = 5, tags = [], metadata = {} } = options;
    
    const result = await this.db.query(
      `INSERT INTO url_seeds (instance_id, url, priority, tags, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [instanceId, url, priority, JSON.stringify(tags), JSON.stringify(metadata)]
    );
    
    this.emit('seed:added', result.rows[0]);
    return result.rows[0];
  }

  async addUrlSeeds(instanceId, urls) {
    const seeds = [];
    
    for (const urlConfig of urls) {
      const url = typeof urlConfig === 'string' ? urlConfig : urlConfig.url;
      const options = typeof urlConfig === 'object' ? urlConfig : {};
      
      const seed = await this.addUrlSeed(instanceId, url, options);
      seeds.push(seed);
    }
    
    return seeds;
  }

  async startInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }
    
    if (instance.status === 'running') {
      console.log(`⚠️  Instance ${instanceId} is already running`);
      return instance;
    }
    
    // Update status in database
    await this.db.query(
      `UPDATE scraper_instances 
       SET status = 'running', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [instanceId]
    );
    
    // Update local instance
    instance.status = 'running';
    instance.started_at = new Date();
    
    // Start crawling process (would integrate with actual crawler here)
    instance.runtime = {
      startedAt: new Date(),
      crawledCount: 0,
    };
    
    this.emit('instance:started', instance);
    console.log(`🚀 Started scraper instance: ${instance.name} (${instanceId})`);
    
    return instance;
  }

  async stopInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }
    
    if (instance.status === 'stopped') {
      console.log(`⚠️  Instance ${instanceId} is already stopped`);
      return instance;
    }
    
    // Update status in database
    await this.db.query(
      `UPDATE scraper_instances 
       SET status = 'stopped', stopped_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [instanceId]
    );
    
    // Update local instance
    instance.status = 'stopped';
    instance.stopped_at = new Date();
    instance.runtime = null;
    
    this.emit('instance:stopped', instance);
    console.log(`🛑 Stopped scraper instance: ${instance.name} (${instanceId})`);
    
    return instance;
  }

  async getInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      // Try loading from database
      const result = await this.db.query(
        'SELECT * FROM scraper_instances WHERE id = $1',
        [instanceId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Instance ${instanceId} not found`);
      }
      
      const dbInstance = result.rows[0];
      this.instances.set(instanceId, { ...dbInstance, runtime: null });
      return this.instances.get(instanceId);
    }
    
    return instance;
  }

  async listInstances() {
    return Array.from(this.instances.values());
  }

  async getInstanceSeeds(instanceId, status = null) {
    let query = 'SELECT * FROM url_seeds WHERE instance_id = $1';
    const params = [instanceId];
    
    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY priority DESC, created_at ASC';
    
    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getInstanceStats(instanceId) {
    const [seedsResult, resultsResult] = await Promise.all([
      this.db.query(
        `SELECT status, COUNT(*) as count 
         FROM url_seeds 
         WHERE instance_id = $1 
         GROUP BY status`,
        [instanceId]
      ),
      this.db.query(
        `SELECT COUNT(*) as total_results,
         MAX(created_at) as last_crawl
         FROM crawl_results 
         WHERE instance_id = $1`,
        [instanceId]
      ),
    ]);
    
    const seedStats = {};
    for (const row of seedsResult.rows) {
      seedStats[row.status] = parseInt(row.count);
    }
    
    return {
      seeds: seedStats,
      results: resultsResult.rows[0] || {},
    };
  }

  async deleteInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }
    
    // Stop if running
    if (instance.status === 'running') {
      await this.stopInstance(instanceId);
    }
    
    // Delete from database (cascade will delete seeds and results)
    await this.db.query('DELETE FROM scraper_instances WHERE id = $1', [instanceId]);
    
    this.instances.delete(instanceId);
    this.emit('instance:deleted', instance);
    
    console.log(`🗑️  Deleted scraper instance: ${instance.name} (${instanceId})`);
  }

  async getStatus() {
    const instances = Array.from(this.instances.values());
    
    return {
      initialized: this.isInitialized,
      totalInstances: instances.length,
      runningInstances: instances.filter(i => i.status === 'running').length,
      stoppedInstances: instances.filter(i => i.status === 'stopped').length,
      instances: instances.map(i => ({
        id: i.id,
        name: i.name,
        status: i.status,
        created_at: i.created_at,
        started_at: i.started_at,
      })),
    };
  }

  async close() {
    console.log('🛑 Closing Scraper Manager Service...');
    
    // Stop all running instances
    for (const [id, instance] of this.instances) {
      if (instance.status === 'running') {
        await this.stopInstance(id);
      }
    }
    
    await this.db.end();
    console.log('✅ Scraper Manager Service closed');
  }
}

export default ScraperManagerService;
