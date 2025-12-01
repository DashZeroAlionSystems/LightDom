/**
 * Universal Database Access Layer
 * 
 * Provides a unified interface for all database operations with:
 * - Automatic connection pooling
 * - Query logging
 * - Error handling
 * - Transaction support
 * - Schema introspection
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { EventEmitter } from 'events';

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  enableLogging?: boolean;
  maxLogSize?: number;
}

export interface QueryLog {
  sql: string;
  params: any[];
  duration: number;
  rowCount?: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export class DatabaseAccessLayer extends EventEmitter {
  private pool: Pool | null = null;
  private queryLog: QueryLog[] = [];
  private config: Required<DatabaseConfig>;
  private maxLogSize: number;
  private enableLogging: boolean;

  constructor(config: DatabaseConfig = {}) {
    super();
    
    this.config = {
      host: config.host || process.env.DB_HOST || 'localhost',
      port: config.port || parseInt(process.env.DB_PORT || '5432'),
      database: config.database || process.env.DB_NAME || 'lightdom',
      user: config.user || process.env.DB_USER || 'postgres',
      password: config.password || process.env.DB_PASSWORD || '',
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
      enableLogging: config.enableLogging !== false,
      maxLogSize: config.maxLogSize || 1000,
    };
    
    this.maxLogSize = this.config.maxLogSize;
    this.enableLogging = this.config.enableLogging;
  }

  /**
   * Initialize database connection pool
   */
  async initialize(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    this.pool = new Pool(this.config);
    
    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
      this.emit('error', err);
    });
    
    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection pool initialized');
      this.emit('connected');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      this.emit('connection-failed', error);
      throw error;
    }
    
    return this.pool;
  }

  /**
   * Execute a query
   */
  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.pool) {
      await this.initialize();
    }

    const start = Date.now();
    
    try {
      const result = await this.pool!.query(sql, params);
      const duration = Date.now() - start;
      
      // Log query
      if (this.enableLogging) {
        this.logQuery({
          sql,
          params,
          duration,
          rowCount: result.rowCount || 0,
          success: true,
          timestamp: new Date().toISOString(),
        });
      }
      
      this.emit('query', { sql, params, duration, rowCount: result.rowCount });
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - start;
      
      // Log error
      if (this.enableLogging) {
        this.logQuery({
          sql,
          params,
          duration,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      
      this.emit('query-error', { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute queries in a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool!.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Insert a record
   */
  async insert(table: string, data: Record<string, any>, returning: string = '*'): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returning}
    `;
    
    const result = await this.query(sql, values);
    return result.rows[0];
  }

  /**
   * Update records
   */
  async update(table: string, data: Record<string, any>, where: string, whereParams: any[] = []): Promise<any[]> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = where || 'TRUE';
    
    const sql = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;
    
    const result = await this.query(sql, [...values, ...whereParams]);
    return result.rows;
  }

  /**
   * Select records
   */
  async select(table: string, options: any = {}): Promise<any[]> {
    const {
      columns = '*',
      where,
      whereParams = [],
      orderBy,
      limit,
      offset,
    } = options;
    
    let sql = `SELECT ${columns} FROM ${table}`;
    
    if (where) {
      sql += ` WHERE ${where}`;
    }
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    if (offset) {
      sql += ` OFFSET ${offset}`;
    }
    
    const result = await this.query(sql, whereParams);
    return result.rows;
  }

  /**
   * Upsert (insert or update)
   */
  async upsert(table: string, data: Record<string, any>, conflictColumns: string[], returning: string = '*'): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const updateSet = keys
      .filter(key => !conflictColumns.includes(key))
      .map(key => `${key} = EXCLUDED.${key}`)
      .join(', ');
    
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumns.join(', ')})
      DO UPDATE SET ${updateSet}
      RETURNING ${returning}
    `;
    
    const result = await this.query(sql, values);
    return result.rows[0];
  }

  /**
   * Log query
   */
  private logQuery(log: QueryLog): void {
    this.queryLog.push(log);
    
    // Keep log size manageable
    if (this.queryLog.length > this.maxLogSize) {
      this.queryLog.shift();
    }
  }

  /**
   * Get query log
   */
  getQueryLog(limit: number = 100): QueryLog[] {
    return this.queryLog.slice(-limit);
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      totalConnections: this.pool?.totalCount || 0,
      idleConnections: this.pool?.idleCount || 0,
      waitingClients: this.pool?.waitingCount || 0,
      queryLog: this.queryLog.length,
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.emit('closed');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health');
      return {
        healthy: true,
        ...this.getStats(),
      };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

// Singleton instance
let dbInstance: DatabaseAccessLayer | null = null;

/**
 * Get database instance
 */
export function getDatabase(config?: DatabaseConfig): DatabaseAccessLayer {
  if (!dbInstance) {
    dbInstance = new DatabaseAccessLayer(config);
  }
  return dbInstance;
}

/**
 * Initialize database with tables for neural network training
 */
export async function initializeNeuralNetworkTables(db: DatabaseAccessLayer): Promise<void> {
  // Training data table
  await db.query(`
    CREATE TABLE IF NOT EXISTS nn_training_data (
      id SERIAL PRIMARY KEY,
      component_type VARCHAR(100),
      features JSONB NOT NULL,
      metrics JSONB NOT NULL,
      user_rating FLOAT,
      created_at TIMESTAMP DEFAULT NOW(),
      metadata JSONB
    )
  `);

  // Model metadata table
  await db.query(`
    CREATE TABLE IF NOT EXISTS nn_models (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      version VARCHAR(50) NOT NULL,
      architecture JSONB NOT NULL,
      training_config JSONB NOT NULL,
      performance JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      status VARCHAR(50) DEFAULT 'active',
      UNIQUE(name, version)
    )
  `);

  // Crawler instances table
  await db.query(`
    CREATE TABLE IF NOT EXISTS crawler_instances (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      config JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'idle',
      started_at TIMESTAMP,
      last_heartbeat TIMESTAMP,
      total_pages_crawled INTEGER DEFAULT 0,
      total_errors INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      metadata JSONB
    )
  `);

  // Crawler logs table
  await db.query(`
    CREATE TABLE IF NOT EXISTS crawler_logs (
      id SERIAL PRIMARY KEY,
      instance_id INTEGER REFERENCES crawler_instances(id),
      url TEXT,
      status VARCHAR(50),
      response_time INTEGER,
      error TEXT,
      data JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Neural network database tables initialized');
}

export default getDatabase;
