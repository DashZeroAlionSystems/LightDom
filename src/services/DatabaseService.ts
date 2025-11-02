/**
 * Database Service
 * Manages PostgreSQL database connections and migrations
 * 
 * Features:
 * - Connection pool management
 * - Migration running
 * - Health checks
 * - Query helpers
 * 
 * @module DatabaseService
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface MigrationResult {
  success: boolean;
  appliedMigrations: string[];
  errors: string[];
}

export class DatabaseService {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private migrationsPath: string;

  constructor(config: DatabaseConfig, migrationsPath?: string) {
    this.config = {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ...config,
    };
    
    // Default to database/ directory at project root
    this.migrationsPath = migrationsPath || path.resolve(__dirname, '../../database');
  }

  /**
   * Initialize database connection pool
   */
  async initialize(): Promise<void> {
    if (this.pool) {
      console.log('Database pool already initialized');
      return;
    }

    this.pool = new Pool(this.config);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });

    // Test connection
    try {
      const result = await this.pool.query('SELECT NOW()');
      console.log('✅ Database connection pool initialized at', result.rows[0].now);
    } catch (error) {
      console.error('❌ Failed to initialize database pool:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return this.pool.connect();
  }

  /**
   * Execute a query
   */
  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return this.pool.query(sql, params);
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
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
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      appliedMigrations: [],
      errors: [],
    };

    try {
      // Ensure migrations table exists
      await this.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get list of migration files
      const files = await fs.readdir(this.migrationsPath);
      const sqlFiles = files
        .filter((f) => f.endsWith('.sql'))
        .sort(); // Alphabetical order ensures numbered migrations run in order

      for (const file of sqlFiles) {
        try {
          // Check if migration already applied
          const { rows } = await this.query(
            'SELECT name FROM schema_migrations WHERE name = $1',
            [file]
          );

          if (rows.length > 0) {
            console.log(`⏭️  Skipping already applied migration: ${file}`);
            continue;
          }

          // Read and execute migration
          const filePath = path.join(this.migrationsPath, file);
          const sql = await fs.readFile(filePath, 'utf-8');

          await this.transaction(async (client) => {
            // Execute migration SQL
            await client.query(sql);
            
            // Record migration
            await client.query(
              'INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
              [file]
            );
          });

          console.log(`✅ Applied migration: ${file}`);
          result.appliedMigrations.push(file);
        } catch (error) {
          const errorMsg = `Failed to apply migration ${file}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.success = false;
          // Continue with other migrations instead of breaking
        }
      }
    } catch (error) {
      const errorMsg = `Migration error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      result.success = false;
    }

    return result;
  }

  /**
   * Check database health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      if (!this.pool) {
        return {
          healthy: false,
          latency: 0,
          error: 'Database pool not initialized',
        };
      }

      await this.query('SELECT 1');
      const latency = Date.now() - startTime;

      return {
        healthy: true,
        latency,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection pool closed');
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

// Singleton instance
let dbServiceInstance: DatabaseService | null = null;

/**
 * Get or create DatabaseService singleton
 */
export function getDatabaseService(config?: DatabaseConfig): DatabaseService {
  if (!dbServiceInstance) {
    if (!config) {
      // Use environment variables
      config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'dom_space_harvester',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      };
    }
    dbServiceInstance = new DatabaseService(config);
  }
  return dbServiceInstance;
}

export default DatabaseService;
