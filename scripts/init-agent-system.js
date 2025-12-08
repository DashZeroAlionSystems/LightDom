/**
 * Agent Management System Initialization Script
 * Sets up and starts the agent management system with all necessary services
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeAgentSystem() {
  console.log('🤖 Initializing Agent Management System...\n');

  // Database connection
  const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lightdom',
  });

  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    const result = await db.query('SELECT version()');
    console.log('✅ Database connected successfully\n');

    // Check if migration has been run
    console.log('🔍 Checking for agent_sessions table...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agent_sessions'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Agent tables not found. Running migration...');
      
      const migrationPath = path.join(__dirname, 'database', 'migrations', '200-agent-management-system.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      
      await db.query(migrationSQL);
      console.log('✅ Migration completed successfully\n');
    } else {
      console.log('✅ Agent tables already exist\n');
    }

    // Check for existing sessions
    console.log('📋 Checking existing data...');
    const sessionCount = await db.query('SELECT COUNT(*) FROM agent_sessions');
    const toolCount = await db.query('SELECT COUNT(*) FROM agent_tools');
    const serviceCount = await db.query('SELECT COUNT(*) FROM agent_services');
    
    console.log(`   Sessions: ${sessionCount.rows[0].count}`);
    console.log(`   Tools: ${toolCount.rows[0].count}`);
    console.log(`   Services: ${serviceCount.rows[0].count}\n`);

    // Create a demo session if none exist
    if (parseInt(sessionCount.rows[0].count) === 0) {
      console.log('🎨 Creating demo session...');
      const demoSession = await db.query(`
        INSERT INTO agent_sessions (name, description, agent_type, status)
        VALUES ('Demo Session', 'A demo session for testing the agent system', 'deepseek', 'active')
        RETURNING *
      `);
      console.log(`✅ Demo session created: ${demoSession.rows[0].session_id}\n`);

      // Create a demo instance
      console.log('🤖 Creating demo agent instance...');
      const demoInstance = await db.query(`
        INSERT INTO agent_instances (
          session_id, name, model_name, status
        )
        VALUES ($1, 'Demo Agent', 'deepseek-coder', 'ready')
        RETURNING *
      `, [demoSession.rows[0].session_id]);
      console.log(`✅ Demo instance created: ${demoInstance.rows[0].instance_id}\n`);
    }

    // Check DeepSeek configuration
    console.log('🔑 Checking DeepSeek configuration...');
    if (process.env.DEEPSEEK_API_KEY) {
      console.log('✅ DeepSeek API key found');
    } else {
      console.log('⚠️  DeepSeek API key not found. Set DEEPSEEK_API_KEY in .env file');
    }
    if (process.env.DEEPSEEK_API_URL) {
      console.log(`✅ DeepSeek API URL: ${process.env.DEEPSEEK_API_URL}`);
    } else {
      console.log('ℹ️  Using default DeepSeek API URL');
    }
    console.log('');

    // Summary
    console.log('✨ Agent Management System Initialization Complete!\n');
    console.log('📚 Quick Start:');
    console.log('   1. Start the API server: npm run start:dev');
    console.log('   2. Access the agent sidebar in the UI');
    console.log('   3. Create a new session or use the demo session');
    console.log('   4. Start chatting with your AI agent!\n');
    console.log('📖 Full documentation: AGENT_MANAGEMENT_SYSTEM_GUIDE.md\n');

    // List available endpoints
    console.log('🔗 Available API Endpoints:');
    console.log('   POST   /api/agent/sessions - Create session');
    console.log('   GET    /api/agent/sessions - List sessions');
    console.log('   POST   /api/agent/instances - Create instance');
    console.log('   GET    /api/agent/instances - List instances');
    console.log('   POST   /api/agent/messages - Send message');
    console.log('   GET    /api/agent/messages/:session_id - Get messages');
    console.log('   GET    /api/agent/tools - List tools');
    console.log('   GET    /api/agent/services - List services');
    console.log('   GET    /api/agent/workflows - List workflows');
    console.log('   GET    /api/agent/campaigns - List campaigns');
    console.log('   GET    /api/agent/data-streams - List data streams\n');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeAgentSystem()
    .then(() => {
      console.log('✅ Initialization completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeAgentSystem };
