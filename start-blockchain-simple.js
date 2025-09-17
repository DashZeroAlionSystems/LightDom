#!/usr/bin/env node

/**
 * Simple Blockchain Startup Script
 * Simplified version that starts the basic blockchain system
 */

import { DOMSpaceHarvesterAPI } from './api-server-express.js';

// Configuration
const config = {
  port: process.env.PORT || 3001,
  blockchainEnabled: process.env.BLOCKCHAIN_ENABLED !== 'false',
  dbDisabled: process.env.DB_DISABLED === 'true'
};

let apiServer = null;

// Signal handlers for graceful shutdown
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

/**
 * Main startup function
 */
async function main() {
  try {
    console.log('🚀 Starting LightDom Blockchain System...');
    console.log('==========================================');
    console.log(`Port: ${config.port}`);
    console.log(`Blockchain Enabled: ${config.blockchainEnabled}`);
    console.log(`Database Disabled: ${config.dbDisabled}`);
    console.log('');

    // Create API server
    apiServer = new DOMSpaceHarvesterAPI(config);
    
    // Start the server
    await apiServer.start(config.port);
    
    console.log('✅ System started successfully!');
    console.log(`🌐 API Server: http://localhost:${config.port}`);
    console.log(`📊 Health Check: http://localhost:${config.port}/api/health`);
    console.log('');
    console.log('🔄 System is running. Press Ctrl+C to stop.');
    
  } catch (error) {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

/**
 * Handle shutdown signals
 */
async function handleShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    if (apiServer) {
      await apiServer.shutdown();
    }
    
    console.log('✅ Shutdown completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
