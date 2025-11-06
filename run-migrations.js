import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

const { Pool } = pg;

// Get the current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5434,
  database: 'lightdom',
  user: 'lightdom_user',
  password: 'lightdom_password',
});

// List of schema files to execute in order
const migrationFiles = [
  '01-blockchain.sql',
  '02-optimization.sql',
  '03-bridge.sql',
  'blockchain_schema.sql',
  'optimization_schema.sql',
  'bridge_schema.sql',
  'ai_content_generation_schema.sql',
  'billing_schema.sql',
  'metaverse_schema.sql',
  'seo_service_schema.sql',
  'unified_metaverse_migration.sql'
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Create migrations table if it doesn't exist (outside of transaction)
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get already executed migrations
    const { rows: executedMigrations } = await client.query('SELECT name FROM migrations');
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

    // Execute pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Running migration: ${file}`);
        const filePath = path.join(__dirname, 'database', file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Start a new transaction for each migration
        try {
          await client.query('BEGIN');
          
          // Execute the migration
          await client.query(sql);
          
          // Record the migration
          await client.query('INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [file]);
          await client.query('COMMIT');
          console.log(`✓ ${file} executed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          
          if (error.code === '42P07') { // Duplicate table error
            console.log(`ℹ️  ${file} contains tables that already exist, marking as executed`);
            await client.query('INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [file]);
          } else {
            console.error(`❌ Error in migration ${file}:`, error.message);
            console.log('Continuing with next migration...');
            // Continue with next migration instead of exiting
          }
        }
      } else {
        console.log(`✓ ${file} already executed, skipping`);
      }
    }

    console.log('\nMigration process completed!');
  } catch (error) {
    console.error('Unexpected error during migration process:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
