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
  
  const migrationFile = path.join(__dirname, '..', 'migrations', 'create-workflow-tables.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.error('❌ Migration file not found:', migrationFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFile, 'utf8');
  
  try {
    await pool.query(sql);
    console.log('✅ Workflow tables created successfully!');
    console.log('\nCreated tables:');
    console.log('  - workflows');
    console.log('  - workflow_tasks');
    console.log('  - workflow_attributes');
    console.log('  - workflow_runs');
    console.log('  - workflow_run_tasks');
    console.log('\nWorkflow system is now ready to use! 🎉\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
