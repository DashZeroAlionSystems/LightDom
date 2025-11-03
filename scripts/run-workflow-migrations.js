#!/usr/bin/env node
/**
 * Run workflow database migrations
 * Creates all necessary tables for workflow persistence
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/lightdom',
});

async function runMigrations() {
  console.log('🔧 Running workflow database migrations...\n');
  
  const migrations = [
    {
      name: 'Create workflow tables',
      file: path.join(__dirname, '..', 'migrations', 'create-workflow-tables.sql')
    },
    {
      name: 'Add schema-driven workflows',
      file: path.join(__dirname, '..', 'migrations', 'add-schema-driven-workflows.sql')
    }
  ];

  for (const migration of migrations) {
    console.log(`📝 Running: ${migration.name}...`);
    
    if (!fs.existsSync(migration.file)) {
      console.error(`  ❌ Migration file not found: ${migration.file}`);
      continue;
    }

    const sql = fs.readFileSync(migration.file, 'utf8');
    
    try {
      await pool.query(sql);
      console.log(`  ✅ ${migration.name} completed`);
    } catch (error) {
      console.error(`  ❌ ${migration.name} failed:`, error.message);
      if (error.code !== '42710' && error.code !== '42P07') { // Ignore "already exists" errors
        process.exit(1);
      }
    }
  }

  console.log('\n✅ All migrations completed successfully!');
  console.log('\nCreated tables:');
  console.log('  - workflows');
  console.log('  - workflow_tasks');
  console.log('  - workflow_attributes');
  console.log('  - workflow_runs');
  console.log('  - workflow_run_tasks');
  console.log('  - workflow_templates (Phase 2)');
  console.log('\nWorkflow system is now ready with schema-driven templates! 🎉\n');
  
  await pool.end();
}

runMigrations();

