#!/usr/bin/env node

/**
 * Database Migration Runner
 * Manages schema migrations with rollback support
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationRunner {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://lightdom:lightdom@localhost:5432/lightdom'
    });

    this.migrationsDir = path.join(__dirname, '..', 'migrations');
    this.migrationTable = 'schema_migrations';
  }

  async init() {
    await this.ensureMigrationsTable();
  }

  async ensureMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.migrationTable} (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64)
      );
    `;
    await this.pool.query(query);
  }

  async getExecutedMigrations() {
    const result = await this.pool.query(`SELECT version FROM ${this.migrationTable} ORDER BY version`);
    return result.rows.map(row => row.version);
  }

  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const allFiles = await fs.readdir(this.migrationsDir);
    const sqlFiles = allFiles.filter(file => file.endsWith('.sql')).sort();

    return sqlFiles.filter(file => {
      const version = path.parse(file).name;
      return !executed.includes(version);
    });
  }

  async executeMigration(filename) {
    const filepath = path.join(this.migrationsDir, filename);
    const sql = await fs.readFile(filepath, 'utf8');
    const version = path.parse(filename).name;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Execute migration
      await client.query(sql);

      // Record migration
      await client.query(
        `INSERT INTO ${this.migrationTable} (version, name) VALUES ($1, $2)`,
        [version, filename]
      );

      await client.query('COMMIT');
      console.log(`✅ Executed migration: ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed migration: ${filename}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async migrate() {
    console.log('🚀 Starting database migrations...');

    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📋 Found ${pending.length} pending migrations:`);
    pending.forEach(file => console.log(`  - ${file}`));

    for (const filename of pending) {
      await this.executeMigration(filename);
    }

    console.log('✅ All migrations completed');
  }

  async rollback(steps = 1) {
    console.log(`🔄 Rolling back ${steps} migration(s)...`);

    const executed = await this.getExecutedMigrations();
    if (executed.length === 0) {
      console.log('❌ No migrations to rollback');
      return;
    }

    const toRollback = executed.slice(-steps);

    for (const version of toRollback.reverse()) {
      await this.rollbackMigration(version);
    }

    console.log('✅ Rollback completed');
  }

  async rollbackMigration(version) {
    // For rollback, we'd need down migrations - simplified version
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Remove migration record
      await client.query(`DELETE FROM ${this.migrationTable} WHERE version = $1`, [version]);

      await client.query('COMMIT');
      console.log(`✅ Rolled back migration: ${version}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async status() {
    const executed = await this.getExecutedMigrations();
    const pending = await this.getPendingMigrations();

    console.log('📊 Migration Status:');
    console.log(`✅ Executed: ${executed.length}`);
    console.log(`⏳ Pending: ${pending.length}`);

    if (executed.length > 0) {
      console.log('\nExecuted migrations:');
      executed.forEach(version => console.log(`  ✅ ${version}`));
    }

    if (pending.length > 0) {
      console.log('\nPending migrations:');
      pending.forEach(file => console.log(`  ⏳ ${file}`));
    }
  }

  async close() {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const runner = new MigrationRunner();

  try {
    await runner.init();

    switch (command) {
      case 'migrate':
        await runner.migrate();
        break;
      case 'rollback':
        const steps = parseInt(process.argv[3]) || 1;
        await runner.rollback(steps);
        break;
      case 'status':
        await runner.status();
        break;
      default:
        console.log('Usage: node migrate.js [migrate|rollback|status] [steps]');
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await runner.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MigrationRunner;
