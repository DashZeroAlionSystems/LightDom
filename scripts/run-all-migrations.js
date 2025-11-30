#!/usr/bin/env node

/**
 * Comprehensive Migration Runner
 * Runs all SQL migrations in order with proper error handling
 */

import fs from 'fs';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath, pathToFileURL } from 'url';
import { promisify } from 'util';

const { Pool } = pg;
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const migrationsDir = join(projectRoot, 'migrations');

// Database configuration from environment
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create migrations tracking table
 */
async function createMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INTEGER,
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_name 
    ON schema_migrations(migration_name);
  `);
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(client) {
  const result = await client.query(
    'SELECT migration_name FROM schema_migrations WHERE success = TRUE'
  );
  return new Set(result.rows.map(row => row.migration_name));
}

/**
 * Get list of migration files
 */
async function getMigrationFiles() {
  const files = await readdir(migrationsDir);
  return files.filter(file => file.endsWith('.sql')).sort(); // Sort alphabetically to maintain order
}

/**
 * Execute a single migration
 */
async function executeMigration(client, filename) {
  const startTime = Date.now();
  const filePath = join(migrationsDir, filename);

  log(`\n📄 Running migration: ${filename}`, 'cyan');

  try {
    // Read migration file
    const sql = await readFile(filePath, 'utf8');

    // Start transaction
    await client.query('BEGIN');

    // Execute migration
    await client.query(sql);

    // Record successful migration
    const executionTime = Date.now() - startTime;
    await client.query(
      `INSERT INTO schema_migrations (migration_name, execution_time_ms, success) 
       VALUES ($1, $2, TRUE)
       ON CONFLICT (migration_name) DO UPDATE 
       SET executed_at = CURRENT_TIMESTAMP, execution_time_ms = $2, success = TRUE`,
      [filename, executionTime]
    );

    // Commit transaction
    await client.query('COMMIT');

    log(`✅ ${filename} executed successfully (${executionTime}ms)`, 'green');
    return { success: true, executionTime };
  } catch (error) {
    // Rollback transaction
    await client.query('ROLLBACK');

    // Check if error is due to existing objects (which we can tolerate)
    const isTableExistsError = error.code === '42P07';
    const isIndexExistsError = error.code === '42P07' || error.message?.includes('already exists');

    if (isTableExistsError || isIndexExistsError) {
      log(`ℹ️  ${filename} contains objects that already exist, marking as executed`, 'yellow');

      // Record as executed despite the error
      const executionTime = Date.now() - startTime;
      await client.query(
        `INSERT INTO schema_migrations (migration_name, execution_time_ms, success, error_message) 
         VALUES ($1, $2, TRUE, $3)
         ON CONFLICT (migration_name) DO UPDATE 
         SET executed_at = CURRENT_TIMESTAMP, execution_time_ms = $2, success = TRUE, error_message = $3`,
        [filename, executionTime, error.message]
      );

      return { success: true, executionTime, warning: error.message };
    }

    // Log error details
    log(`❌ Error in migration ${filename}:`, 'red');
    log(`   Code: ${error.code}`, 'gray');
    log(`   Message: ${error.message}`, 'gray');

    // Record failed migration
    const executionTime = Date.now() - startTime;
    await client.query(
      `INSERT INTO schema_migrations (migration_name, execution_time_ms, success, error_message) 
       VALUES ($1, $2, FALSE, $3)
       ON CONFLICT (migration_name) DO UPDATE 
       SET executed_at = CURRENT_TIMESTAMP, execution_time_ms = $2, success = FALSE, error_message = $3`,
      [filename, executionTime, error.message]
    );

    return { success: false, executionTime, error: error.message };
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  const client = await pool.connect();

  try {
    log('\n🚀 Starting migration process...', 'bright');
    log(`📁 Migrations directory: ${migrationsDir}`, 'gray');
    log(`🗄️  Database: ${process.env.DB_NAME || 'dom_space_harvester'}`, 'gray');

    // Create migrations tracking table
    log('\n📋 Setting up migration tracking...', 'cyan');
    await createMigrationsTable(client);

    // Get executed and pending migrations
    const executedMigrations = await getExecutedMigrations(client);
    const allMigrationFiles = await getMigrationFiles();
    const pendingMigrations = allMigrationFiles.filter(file => !executedMigrations.has(file));

    log(`\n📊 Migration Status:`, 'bright');
    log(`   Total migrations: ${allMigrationFiles.length}`, 'gray');
    log(`   Already executed: ${executedMigrations.size}`, 'green');
    log(`   Pending: ${pendingMigrations.length}`, 'yellow');

    if (pendingMigrations.length === 0) {
      log('\n✨ All migrations are up to date!', 'green');
      return;
    }

    // Execute pending migrations
    log('\n🔄 Executing pending migrations...', 'bright');

    const results = {
      successful: [],
      warnings: [],
      failed: [],
    };

    for (const filename of pendingMigrations) {
      const result = await executeMigration(client, filename);

      if (result.success) {
        if (result.warning) {
          results.warnings.push({ filename, ...result });
        } else {
          results.successful.push({ filename, ...result });
        }
      } else {
        results.failed.push({ filename, ...result });
      }
    }

    // Summary
    log('\n' + '='.repeat(60), 'gray');
    log('📈 Migration Summary', 'bright');
    log('='.repeat(60), 'gray');

    if (results.successful.length > 0) {
      log(`\n✅ Successfully executed: ${results.successful.length}`, 'green');
      results.successful.forEach(({ filename, executionTime }) => {
        log(`   • ${filename} (${executionTime}ms)`, 'gray');
      });
    }

    if (results.warnings.length > 0) {
      log(`\n⚠️  Executed with warnings: ${results.warnings.length}`, 'yellow');
      results.warnings.forEach(({ filename, warning }) => {
        log(`   • ${filename}`, 'gray');
        log(`     ${warning.substring(0, 80)}...`, 'gray');
      });
    }

    if (results.failed.length > 0) {
      log(`\n❌ Failed: ${results.failed.length}`, 'red');
      results.failed.forEach(({ filename, error }) => {
        log(`   • ${filename}`, 'gray');
        log(`     ${error.substring(0, 80)}...`, 'gray');
      });
    }

    // Final status
    const totalTime = results.successful
      .concat(results.warnings, results.failed)
      .reduce((sum, r) => sum + r.executionTime, 0);

    log(`\n⏱️  Total execution time: ${totalTime}ms`, 'cyan');

    if (results.failed.length === 0) {
      log('\n🎉 All migrations completed successfully!', 'green');
    } else {
      log(`\n⚠️  Migration completed with ${results.failed.length} error(s)`, 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log('\n💥 Unexpected error during migration:', 'red');
    log(error.message, 'red');
    if (error.stack) {
      log('\nStack trace:', 'gray');
      log(error.stack, 'gray');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Command: Check migration status
 */
async function checkStatus() {
  const client = await pool.connect();

  try {
    await createMigrationsTable(client);

    const executedMigrations = await getExecutedMigrations(client);
    const allMigrationFiles = await getMigrationFiles();
    const pendingMigrations = allMigrationFiles.filter(file => !executedMigrations.has(file));

    log('\n📊 Migration Status', 'bright');
    log('='.repeat(60), 'gray');

    log(`\nTotal migrations: ${allMigrationFiles.length}`, 'cyan');
    log(`Executed: ${executedMigrations.size}`, 'green');
    log(`Pending: ${pendingMigrations.length}`, 'yellow');

    if (pendingMigrations.length > 0) {
      log('\nPending migrations:', 'yellow');
      pendingMigrations.forEach(file => {
        log(`  • ${file}`, 'gray');
      });
    }

    if (executedMigrations.size > 0) {
      log('\nExecuted migrations:', 'green');
      const result = await client.query(
        'SELECT migration_name, executed_at, execution_time_ms FROM schema_migrations ORDER BY executed_at DESC LIMIT 10'
      );
      result.rows.forEach(row => {
        log(
          `  • ${row.migration_name} (${row.execution_time_ms}ms) - ${row.executed_at.toISOString()}`,
          'gray'
        );
      });
      if (executedMigrations.size > 10) {
        log(`  ... and ${executedMigrations.size - 10} more`, 'gray');
      }
    }
  } catch (error) {
    log('\n💥 Error checking status:', 'red');
    log(error.message, 'red');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Command: List all migrations
 */
async function listMigrations() {
  const client = await pool.connect();

  try {
    await createMigrationsTable(client);

    const allMigrationFiles = await getMigrationFiles();
    const result = await client.query(
      'SELECT migration_name, executed_at, success FROM schema_migrations ORDER BY migration_name'
    );

    const executedMap = new Map(result.rows.map(row => [row.migration_name, row]));

    log('\n📋 All Migrations', 'bright');
    log('='.repeat(80), 'gray');

    allMigrationFiles.forEach(file => {
      const executed = executedMap.get(file);
      if (executed) {
        const status = executed.success ? '✅' : '❌';
        const date = executed.executed_at.toISOString().split('T')[0];
        log(`${status} ${file} (${date})`, executed.success ? 'green' : 'red');
      } else {
        log(`⏳ ${file} (pending)`, 'yellow');
      }
    });
  } catch (error) {
    log('\n💥 Error listing migrations:', 'red');
    log(error.message, 'red');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
🗄️  Migration Runner

Usage:
  node scripts/run-all-migrations.js [command]

Commands:
  migrate    Run all pending migrations (default)
  status     Check migration status
  list       List all migrations with their status
  help       Show this help message

Environment Variables:
  DB_HOST      Database host (default: localhost)
  DB_PORT      Database port (default: 5432)
  DB_NAME      Database name (default: dom_space_harvester)
  DB_USER      Database user (default: postgres)
  DB_PASSWORD  Database password (default: postgres)

Examples:
  node scripts/run-all-migrations.js migrate
  node scripts/run-all-migrations.js status
  DB_NAME=my_db node scripts/run-all-migrations.js migrate
`);
}

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2] || 'migrate';

  switch (command) {
    case 'migrate':
      await runMigrations();
      break;
    case 'status':
      await checkStatus();
      break;
    case 'list':
      await listMigrations();
      break;
    case 'help':
    case '--help':
    case '-h':
      printUsage();
      break;
    default:
      log(`\n❌ Unknown command: ${command}`, 'red');
      printUsage();
      process.exit(1);
  }
}

// Run if called directly
const invokedUrl = (() => {
  if (!process.argv[1]) {
    return null;
  }
  try {
    return pathToFileURL(process.argv[1]).href;
  } catch (error) {
    console.warn('\n⚠️  Unable to normalize invocation path for migration runner:', error.message);
    return `file://${process.argv[1]}`;
  }
})();

if (invokedUrl && import.meta.url === invokedUrl) {
  main().catch(error => {
    log('\n💥 Fatal error:', 'red');
    log(error.message, 'red');
    process.exit(1);
  });
}

export { checkStatus, listMigrations, runMigrations };
