/**
 * Database Configuration and Connection Pool
 */

import { Pool } from 'pg';
import config from './index.js';

let pool = null;

/**
 * Initialize database connection pool
 */
export function initializeDatabase() {
  if (config.database.enabled) {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: config.database.pool.max,
      idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
    
    console.log('✅ Database connection pool initialized');
  } else {
    console.log('ℹ️  Database disabled');
  }
  
  return pool;
}

/**
 * Get database connection pool
 */
export function getDatabase() {
  if (!pool && config.database.enabled) {
    return initializeDatabase();
  }
  
  // Return mock if database is disabled
  if (!config.database.enabled) {
    return {
      query: async () => ({ rows: [], rowCount: 0 }),
      end: async () => {},
    };
  }
  
  return pool;
}

/**
 * Close database connection pool
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection() {
  try {
    const db = getDatabase();
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

export default {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  testDatabaseConnection,
};
