#!/usr/bin/env node

/**
 * DeepSeek MCP Setup Script
 * Quick setup for DeepSeek MCP tools integration
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   DeepSeek MCP Tools - Setup Script                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

/**
 * Step 1: Check Prerequisites
 */
async function checkPrerequisites() {
  console.log('📋 Step 1: Checking Prerequisites\n');

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js version 18+ required. Current:', nodeVersion);
    process.exit(1);
  }
  console.log('✓ Node.js version:', nodeVersion);

  // Check PostgreSQL
  try {
    const { stdout } = await execAsync('psql --version');
    console.log('✓ PostgreSQL installed:', stdout.trim());
  } catch (error) {
    console.log('⚠ PostgreSQL not found in PATH');
  }

  console.log('');
}

/**
 * Step 2: Setup Database
 */
async function setupDatabase() {
  console.log('🗄️  Step 2: Setting Up Database\n');

  const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Test connection
    await db.query('SELECT NOW()');
    console.log('✓ Database connection successful');

    // Create schemas table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS schemas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        schema_definition JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Schemas table ready');

    // Create schema relationships table
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
        target_schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
        relationship_type VARCHAR(100) NOT NULL,
        confidence DECIMAL(3, 2) DEFAULT 1.0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_schema_id, target_schema_id, relationship_type)
      )
    `);
    console.log('✓ Schema relationships table ready');

    // Create workflows table
    await db.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        workflow_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Workflows table ready');

    // Create workflow tasks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS workflow_tasks (
        task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(workflow_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        task_type VARCHAR(100) NOT NULL,
        ordering INTEGER NOT NULL,
        handler_config JSONB DEFAULT '{}',
        dependencies UUID[] DEFAULT ARRAY[]::UUID[]
      )
    `);
    console.log('✓ Workflow tasks table ready');

    // Create workflow runs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS workflow_runs (
        run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(workflow_id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        input_data JSONB DEFAULT '{}',
        result_data JSONB,
        progress_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Workflow runs table ready');

    console.log('');
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nMake sure PostgreSQL is running and credentials are correct.');
    console.error('Set environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD\n');
  } finally {
    await db.end();
  }
}

/**
 * Step 3: Create Configuration
 */
async function createConfiguration() {
  console.log('⚙️  Step 3: Creating Configuration\n');

  // Check if deepseek-config.json exists
  const configPath = './deepseek-config.json';
  
  try {
    await fs.access(configPath);
    console.log('✓ Configuration file already exists:', configPath);
  } catch {
    // Create default configuration
    const defaultConfig = {
      api: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
        streamEnabled: false,
        retryAttempts: 3,
        retryDelayMs: 1000,
        timeout: 60000
      },
      memory: {
        contextWindowSize: 8000,
        memoryPersistence: 'database',
        memoryRetentionDays: 30,
        enableSemanticSearch: true
      },
      reasoning: {
        defaultPattern: 'chain-of-thought',
        enableSelfReflection: true,
        enableCriticalAnalysis: true,
        maxReasoningSteps: 10
      },
      naming: {
        schemaNamePattern: '{domain}_{entity}_schema',
        workflowNamePattern: '{purpose}_{timestamp}_workflow',
        componentNamePattern: '{Component}{Type}',
        variableNamingStyle: 'camelCase',
        fileNamingStyle: 'kebab-case'
      },
      behavior: {
        autoGenerateSchemas: true,
        validateBeforeExecution: true,
        enableSelfImprovement: true,
        safetyMode: 'strict',
        maxSelfModifications: 5,
        requireHumanApproval: true
      }
    };

    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✓ Created configuration file:', configPath);
  }

  console.log('');
}

/**
 * Step 4: Check MCP Config
 */
async function checkMCPConfig() {
  console.log('🔧 Step 4: Checking MCP Configuration\n');

  const mcpConfigPath = './deepseek-mcp-config.json';
  
  try {
    await fs.access(mcpConfigPath);
    console.log('✓ MCP configuration exists:', mcpConfigPath);
    
    const content = await fs.readFile(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);
    
    if (config.mcpServers?.['deepseek-tools']) {
      console.log('✓ DeepSeek tools server configured');
    } else {
      console.log('⚠ DeepSeek tools server not found in MCP config');
    }
  } catch {
    console.log('⚠ MCP configuration not found:', mcpConfigPath);
  }

  console.log('');
}

/**
 * Step 5: Test Installation
 */
async function testInstallation() {
  console.log('🧪 Step 5: Testing Installation\n');

  try {
    // Dynamic import for ESM
    const { DeepSeekToolsRegistry } = await import('./src/mcp/deepseek-tools-registry.js');
    const { Pool } = await import('pg');

    const db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    const registry = new DeepSeekToolsRegistry(db);
    const tools = registry.listTools();

    console.log('✓ Tools registry initialized');
    console.log(`✓ Available tools: ${tools.length}`);

    // List tools by category
    const categories = [...new Set(tools.map(t => t.category))];
    console.log(`✓ Tool categories: ${categories.join(', ')}`);

    await db.end();
  } catch (error: any) {
    console.error('❌ Installation test failed:', error.message);
  }

  console.log('');
}

/**
 * Step 6: Display Next Steps
 */
function displayNextSteps() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   ✓ Setup Complete!                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📚 Next Steps:\n');
  console.log('1. Review and update configuration:');
  console.log('   - Edit: deepseek-config.json');
  console.log('   - Add your DeepSeek API key (optional)\n');

  console.log('2. Start the MCP server:');
  console.log('   npm run mcp:deepseek:start\n');

  console.log('3. Run examples to test functionality:');
  console.log('   npm run mcp:deepseek:examples\n');

  console.log('4. View available tools:');
  console.log('   npm run mcp:tools:list\n');

  console.log('5. Generate schema map:');
  console.log('   npm run mcp:schema:map\n');

  console.log('6. Read the complete guide:');
  console.log('   cat DEEPSEEK_MCP_TOOLS_GUIDE.md\n');

  console.log('7. Configure your MCP client:');
  console.log('   - Copy deepseek-mcp-config.json to your MCP settings');
  console.log('   - Restart your MCP client (e.g., Cursor IDE)\n');

  console.log('📖 Documentation:');
  console.log('   - DEEPSEEK_MCP_TOOLS_GUIDE.md - Complete guide');
  console.log('   - examples/deepseek-mcp-tools-examples.ts - Code examples\n');

  console.log('🐛 Troubleshooting:');
  console.log('   - Check database connection: npm run db:health');
  console.log('   - View server logs: npm run mcp:deepseek:start 2>&1 | tee mcp.log');
  console.log('   - Test tools: npm run mcp:deepseek:test\n');
}

/**
 * Main setup function
 */
async function main() {
  try {
    await checkPrerequisites();
    await setupDatabase();
    await createConfiguration();
    await checkMCPConfig();
    await testInstallation();
    displayNextSteps();
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run setup
main().catch(console.error);
