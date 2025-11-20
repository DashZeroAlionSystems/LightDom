#!/usr/bin/env node

/**
 * Initialize Data Mining Database
 * Creates SQLite database with required tables for agent tools
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(path.dirname(__dirname), 'data');
const dbPath = path.join(dataDir, 'data-mining.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

console.log('🚀 Initializing data mining database...');
console.log(`📁 Database path: ${dbPath}`);

const db = new Database(dbPath);

// Create tables
const tables = [
  {
    name: 'mining_operations',
    sql: `
      CREATE TABLE IF NOT EXISTS mining_operations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('scraping', 'analysis', 'processing', 'training', 'validation')),
        status TEXT CHECK(status IN ('pending', 'running', 'completed', 'failed', 'paused')) DEFAULT 'pending',
        priority INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME,
        duration_seconds INTEGER,
        error_message TEXT,
        metadata TEXT
      )
    `,
  },
  {
    name: 'scraping_configs',
    sql: `
      CREATE TABLE IF NOT EXISTS scraping_configs (
        id TEXT PRIMARY KEY,
        operation_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        source_type TEXT CHECK(source_type IN ('website', 'api', 'database', 'file', 'feed')),
        base_url TEXT,
        selectors TEXT,
        max_depth INTEGER DEFAULT 3,
        max_concurrency INTEGER DEFAULT 5,
        timeout INTEGER DEFAULT 30000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'scraping_schedules',
    sql: `
      CREATE TABLE IF NOT EXISTS scraping_schedules (
        id TEXT PRIMARY KEY,
        config_id TEXT NOT NULL,
        name TEXT NOT NULL,
        schedule_type TEXT CHECK(schedule_type IN ('once', 'interval', 'cron')),
        interval_minutes INTEGER,
        cron_expression TEXT,
        enabled BOOLEAN DEFAULT 1,
        last_run DATETIME,
        next_run DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (config_id) REFERENCES scraping_configs(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'scraped_data',
    sql: `
      CREATE TABLE IF NOT EXISTS scraped_data (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        operation_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        extracted_data TEXT,
        scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processing_status TEXT DEFAULT 'pending',
        FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
      )
    `,
  },
  {
    name: 'custom_tables',
    sql: `
      CREATE TABLE IF NOT EXISTS custom_tables (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        table_name TEXT UNIQUE NOT NULL,
        schema_definition TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
];

// Create each table
for (const table of tables) {
  try {
    db.prepare(table.sql).run();
    console.log(`✅ Table created: ${table.name}`);
  } catch (error) {
    console.error(`❌ Error creating table ${table.name}:`, error.message);
  }
}

// Create indexes for better query performance
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_operations_status ON mining_operations(status)',
  'CREATE INDEX IF NOT EXISTS idx_operations_created ON mining_operations(created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_scraped_data_operation ON scraped_data(operation_id)',
  'CREATE INDEX IF NOT EXISTS idx_scraped_data_url ON scraped_data(url)',
];

for (const indexSql of indexes) {
  try {
    db.prepare(indexSql).run();
    console.log('✅ Index created');
  } catch (error) {
    console.error('❌ Error creating index:', error.message);
  }
}

// Insert sample data
const sampleOperation = {
  id: 'sample_op_1',
  name: 'Sample Kaggle Mining',
  description: 'Example data mining configuration for Kaggle notebooks',
  type: 'scraping',
  status: 'pending',
};

try {
  db.prepare(
    `
    INSERT OR IGNORE INTO mining_operations (id, name, description, type, status)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(
    sampleOperation.id,
    sampleOperation.name,
    sampleOperation.description,
    sampleOperation.type,
    sampleOperation.status
  );
  console.log('✅ Sample data inserted');
} catch (error) {
  console.error('⚠️ Sample data already exists or error:', error.message);
}

db.close();

console.log('');
console.log('✨ Data mining database initialized successfully!');
console.log('📊 Available tables:');
console.log('   - mining_operations');
console.log('   - scraping_configs');
console.log('   - scraping_schedules');
console.log('   - scraped_data');
console.log('   - custom_tables');
console.log('');
console.log('🎯 DeepSeek can now use these tools:');
console.log('   - create_data_mining_config');
console.log('   - start_mining_operation');
console.log('   - list_mining_configs');
console.log('   - get_mining_results');
console.log('   - create_database_schema');
console.log('   - execute_sql_query');
console.log('');
console.log('💬 Try asking DeepSeek: "Set up a data mining config for Kaggle components"');
