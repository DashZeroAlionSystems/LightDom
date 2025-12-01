// Simple Postgres connectivity check for local/dev
// Usage: node scripts/db-health-check.cjs

const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.DB_MAX || 10),
    idleTimeoutMillis: 30000,
  };

  const pool = new Pool(config);
  try {
    const { rows } = await pool.query('SELECT NOW() as now');
    console.log('✅ Postgres connected:', rows[0].now);
    console.log('Config:', { ...config, password: config.password ? '****' : undefined });
    process.exit(0);
  } catch (err) {
    console.error('❌ Postgres connection failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end().catch(() => {});
  }
}

main();


