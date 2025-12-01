#!/usr/bin/env node

/**
 * Agent Mode Orchestration System Startup Script
 * 
 * Initializes and starts the complete agent orchestration system
 * 
 * Usage:
 *   node start-agent-orchestration.js [options]
 * 
 * Options:
 *   --no-health-checks     Disable health check service
 *   --no-github            Disable GitHub automation
 *   --no-git-bridge        Disable Git MCP bridge
 *   --no-continuous        Disable continuous task creation
 *   --port <port>          API port (default: 3001)
 *   --ws-port <port>       WebSocket port (default: 3002)
 */

import express from 'express';
import pg from 'pg';
import { AgentOrchestrationIntegration } from './services/agent-orchestration-integration.service.js';
import { createAgentOrchestrationRoutes } from './api/agent-orchestration-routes.js';

const args = process.argv.slice(2);

const config = {
  port: parseInt(args[args.indexOf('--port') + 1] || '3001'),
  wsPort: parseInt(args[args.indexOf('--ws-port') + 1] || '3002'),
  enableHealthChecks: !args.includes('--no-health-checks'),
  enableGitHubAutomation: !args.includes('--no-github'),
  enableGitMcpBridge: !args.includes('--no-git-bridge'),
  continuousTaskCreation: !args.includes('--no-continuous'),
};

console.log('🚀 Starting Agent Mode Orchestration System');
console.log('=' .repeat(60));
console.log('\nConfiguration:');
console.log(`  API Port: ${config.port}`);
console.log(`  WebSocket Port: ${config.wsPort}`);
console.log(`  Health Checks: ${config.enableHealthChecks ? '✅' : '❌'}`);
console.log(`  GitHub Automation: ${config.enableGitHubAutomation ? '✅' : '❌'}`);
console.log(`  Git MCP Bridge: ${config.enableGitMcpBridge ? '✅' : '❌'}`);
console.log(`  Continuous Tasks: ${config.continuousTaskCreation ? '✅' : '❌'}`);
console.log('');

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://lightdom_user:lightdom_password@localhost:5432/lightdom',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize orchestration system
async function initializeOrchestration() {
  console.log('\n📦 Initializing orchestration system...');
  
  const orchestration = new AgentOrchestrationIntegration({
    db: pool,
    enableHealthChecks: config.enableHealthChecks,
    enableGitHubAutomation: config.enableGitHubAutomation,
    enableGitMcpBridge: config.enableGitMcpBridge,
    continuousTaskCreation: config.continuousTaskCreation,
    maxConcurrentAgents: parseInt(process.env.MAX_CONCURRENT_AGENTS || '5'),
  });
  
  await orchestration.initialize();
  
  return orchestration;
}

// Setup Express API
function setupAPI(orchestration) {
  console.log('\n🌐 Setting up API server...');
  
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });
  
  // Mount orchestration routes
  app.use('/api/agent-orchestration', createAgentOrchestrationRoutes(orchestration));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        orchestration: orchestration.isInitialized,
      },
    });
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Agent Mode Orchestration System',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        status: '/api/agent-orchestration/status',
        health: '/api/agent-orchestration/health',
        docs: '/api/agent-orchestration',
      },
    });
  });
  
  return app;
}

// Start server
async function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(config.port, () => {
      console.log(`✅ API server listening on port ${config.port}`);
      console.log(`   http://localhost:${config.port}`);
      resolve(server);
    });
  });
}

// Display information
function displayInfo() {
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Agent Mode Orchestration System Ready!\n');
  console.log('API Endpoints:');
  console.log(`  Status:        http://localhost:${config.port}/api/agent-orchestration/status`);
  console.log(`  Health:        http://localhost:${config.port}/api/agent-orchestration/health`);
  console.log(`  Investigate:   POST http://localhost:${config.port}/api/agent-orchestration/investigate/error/:id`);
  console.log(`  Queue Task:    POST http://localhost:${config.port}/api/agent-orchestration/agent/task`);
  console.log(`  Active Agents: GET http://localhost:${config.port}/api/agent-orchestration/agents/active`);
  
  if (config.enableHealthChecks) {
    console.log(`\nHealth Stream:`);
    console.log(`  WebSocket:     ws://localhost:${config.wsPort}/health-stream`);
  }
  
  console.log('\nPress Ctrl+C to stop\n');
  console.log('='.repeat(60) + '\n');
}

// Graceful shutdown
function setupShutdown(orchestration, server) {
  const shutdown = async () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    
    // Close server
    server.close(() => {
      console.log('✅ API server closed');
    });
    
    // Shutdown orchestration
    await orchestration.shutdown();
    
    // Close database pool
    await pool.end();
    console.log('✅ Database pool closed');
    
    console.log('\n👋 Goodbye!\n');
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Main startup sequence
async function main() {
  try {
    // Test database
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('\n❌ Cannot start without database connection');
      process.exit(1);
    }
    
    // Initialize orchestration
    const orchestration = await initializeOrchestration();
    
    // Setup API
    const app = setupAPI(orchestration);
    
    // Start server
    const server = await startServer(app);
    
    // Setup graceful shutdown
    setupShutdown(orchestration, server);
    
    // Display info
    displayInfo();
    
    // Log periodic status
    setInterval(() => {
      const status = orchestration.getStatus();
      const agentStatus = status.services.agentSpawner;
      
      if (agentStatus) {
        console.log(`📊 Status: ${agentStatus.activeAgents} active agents, ${agentStatus.queueStatus.queued} queued tasks`);
      }
    }, 60000); // Every minute
    
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
main();
