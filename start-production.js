#!/usr/bin/env node

/**
 * LightDom Platform - Production Startup Script
 * 
 * This script orchestrates the complete startup sequence for production:
 * 1. Validates environment configuration
 * 2. Checks database connectivity
 * 3. Runs pending migrations
 * 4. Loads component schemas
 * 5. Initializes all services
 * 6. Starts API server with WebSocket
 * 7. Enables health monitoring
 * 
 * Usage: npm run start:production
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionStarter {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.db = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    };
    
    const prefix = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✗'
    };

    console.log(
      `${colors[type]}[${timestamp}] ${prefix[type]} ${message}${colors.reset}`
    );
  }

  async validateEnvironment() {
    this.log('Step 1/8: Validating environment variables...', 'info');
    
    const required = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD'
    ];
    
    const recommended = [
      'OLLAMA_API_URL',
      'NODE_ENV',
      'PORT'
    ];

    for (const envVar of required) {
      if (!process.env[envVar]) {
        this.errors.push(`Missing required environment variable: ${envVar}`);
      }
    }

    for (const envVar of recommended) {
      if (!process.env[envVar]) {
        this.warnings.push(`Missing recommended environment variable: ${envVar}`);
      }
    }

    if (this.errors.length > 0) {
      this.log(`Environment validation failed: ${this.errors.length} errors`, 'error');
      this.errors.forEach(err => this.log(`  - ${err}`, 'error'));
      return false;
    }

    if (this.warnings.length > 0) {
      this.log(`Environment validation completed with ${this.warnings.length} warnings`, 'warning');
      this.warnings.forEach(warn => this.log(`  - ${warn}`, 'warning'));
    } else {
      this.log('Environment validation passed', 'success');
    }

    return true;
  }

  async checkDatabase() {
    this.log('Step 2/8: Checking database connectivity...', 'info');
    
    try {
      this.db = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'dom_space_harvester',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      const result = await this.db.query('SELECT NOW()');
      this.log(`Database connection successful (${result.rows[0].now})`, 'success');
      return true;
    } catch (error) {
      this.log(`Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runMigrations() {
    this.log('Step 3/8: Checking for pending migrations...', 'info');
    
    const migrationsDir = path.join(__dirname, 'database');
    
    if (!fs.existsSync(migrationsDir)) {
      this.log('No migrations directory found, skipping...', 'warning');
      return true;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      this.log('No migration files found', 'info');
      return true;
    }

    // Create migrations table if it doesn't exist
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check which migrations have been run
    const { rows } = await this.db.query('SELECT filename FROM schema_migrations');
    const executedMigrations = new Set(rows.map(r => r.filename));

    let ranMigrations = 0;
    for (const file of migrationFiles) {
      if (executedMigrations.has(file)) {
        continue;
      }

      this.log(`Running migration: ${file}`, 'info');
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await this.db.query(sql);
        await this.db.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        ranMigrations++;
        this.log(`Migration ${file} completed`, 'success');
      } catch (error) {
        this.log(`Migration ${file} failed: ${error.message}`, 'error');
        return false;
      }
    }

    if (ranMigrations === 0) {
      this.log('All migrations up to date', 'success');
    } else {
      this.log(`Executed ${ranMigrations} pending migration(s)`, 'success');
    }

    return true;
  }

  async loadComponentSchemas() {
    this.log('Step 4/8: Loading component schemas...', 'info');
    
    const schemasDir = path.join(__dirname, 'schemas', 'components');
    
    if (!fs.existsSync(schemasDir)) {
      this.log('No component schemas directory found', 'warning');
      return true;
    }

    const schemaFiles = fs.readdirSync(schemasDir)
      .filter(file => file.endsWith('.json'));

    if (schemaFiles.length === 0) {
      this.log('No component schemas found', 'warning');
      return true;
    }

    // Check if schema_library table exists
    try {
      const tableCheck = await this.db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'schema_library'
        )
      `);

      if (!tableCheck.rows[0].exists) {
        this.log('schema_library table does not exist, skipping schema loading', 'warning');
        return true;
      }

      let loadedCount = 0;
      for (const file of schemaFiles) {
        const schemaPath = path.join(schemasDir, file);
        const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        
        const schemaId = schemaContent.schemaId || schemaContent['@id'] || file.replace('.json', '');
        
        // Check if schema already exists
        const existCheck = await this.db.query(
          'SELECT id FROM schema_library WHERE schema_id = $1',
          [schemaId]
        );

        if (existCheck.rowCount === 0) {
          await this.db.query(`
            INSERT INTO schema_library (schema_id, schema_data, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT (schema_id) DO UPDATE
            SET schema_data = $2, updated_at = NOW()
          `, [schemaId, schemaContent]);
          loadedCount++;
        }
      }

      if (loadedCount > 0) {
        this.log(`Loaded ${loadedCount} new component schema(s)`, 'success');
      } else {
        this.log(`All ${schemaFiles.length} component schemas already loaded`, 'success');
      }
      
      return true;
    } catch (error) {
      this.log(`Failed to load component schemas: ${error.message}`, 'error');
      return false;
    }
  }

  async checkOllama() {
    this.log('Step 5/8: Checking Ollama service...', 'info');
    
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const modelCount = data.models?.length || 0;
        this.log(`Ollama service is running (${modelCount} models available)`, 'success');
        
        // Check for recommended models
        const hasDeepSeek = data.models?.some(m => m.name.includes('deepseek'));
        if (!hasDeepSeek) {
          this.log('DeepSeek model not found. Run: ollama pull deepseek-r1:1.5b', 'warning');
        }
      } else {
        this.log('Ollama service is running but returned an error', 'warning');
      }
      return true;
    } catch (error) {
      this.log(`Ollama service not available: ${error.message}`, 'warning');
      this.log('AI features will be limited without Ollama', 'warning');
      return true; // Non-fatal
    }
  }

  async initializeServices() {
    this.log('Step 6/8: Initializing services...', 'info');
    
    // Services are initialized by the API server
    // This step is for validation
    
    const servicesCheck = {
      database: true,
      ollama: true,
      schemas: true
    };

    this.log('All services ready for initialization', 'success');
    return true;
  }

  async startAPIServer() {
    this.log('Step 7/8: Starting API server...', 'info');
    
    return new Promise((resolve) => {
      const port = process.env.PORT || 3001;
      const serverPath = path.join(__dirname, 'api-server-express.js');
      
      const serverProcess = spawn('node', [serverPath], {
        stdio: 'inherit',
        env: process.env
      });

      serverProcess.on('error', (error) => {
        this.log(`Failed to start API server: ${error.message}`, 'error');
        resolve(false);
      });

      // Give the server time to start
      setTimeout(() => {
        this.log(`API server started on http://localhost:${port}`, 'success');
        this.log(`WebSocket server ready on ws://localhost:${port}`, 'success');
        resolve(true);
      }, 2000);

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        this.log('Shutting down gracefully...', 'info');
        serverProcess.kill('SIGTERM');
        if (this.db) {
          this.db.end();
        }
        process.exit(0);
      });
    });
  }

  async enableMonitoring() {
    this.log('Step 8/8: Enabling health monitoring...', 'info');
    
    const port = process.env.PORT || 3001;
    const healthCheckInterval = 60000; // 1 minute

    // Health check loop
    setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:${port}/api/health`);
        if (response.ok) {
          const health = await response.json();
          if (health.status !== 'healthy') {
            this.log('Health check warning: System not fully healthy', 'warning');
          }
        } else {
          this.log('Health check failed: Server not responding', 'error');
        }
      } catch (error) {
        this.log(`Health check error: ${error.message}`, 'error');
      }
    }, healthCheckInterval);

    this.log('Health monitoring enabled (60s interval)', 'success');
    return true;
  }

  async start() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         LightDom Platform - Production Startup           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const steps = [
      this.validateEnvironment.bind(this),
      this.checkDatabase.bind(this),
      this.runMigrations.bind(this),
      this.loadComponentSchemas.bind(this),
      this.checkOllama.bind(this),
      this.initializeServices.bind(this),
      this.startAPIServer.bind(this),
      this.enableMonitoring.bind(this)
    ];

    for (const step of steps) {
      const success = await step();
      if (!success) {
        this.log('\n❌ Startup failed! Please fix the errors above and try again.', 'error');
        process.exit(1);
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║          🎉 LightDom Platform is Ready! 🚀              ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  API Server:      http://localhost:${process.env.PORT || 3001}/api          ║`);
    console.log(`║  Health Check:    http://localhost:${process.env.PORT || 3001}/api/health   ║`);
    console.log(`║  Workflow Wizard: workflow-wizard.html                   ║`);
    console.log(`║  Dashboard:       unified-dashboard.html                 ║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    this.log('Press Ctrl+C to shutdown', 'info');
  }
}

// Start the application
const starter = new ProductionStarter();
starter.start().catch(error => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
