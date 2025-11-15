#!/usr/bin/env node
/**
 * Start Complete LightDom System
 * 
 * Orchestrates all services with health monitoring
 */

import SystemStartupOrchestrator from '../services/system-startup-orchestrator.js';

async function main() {
  console.log('🚀 LightDom System Startup\n');
  
  const orchestrator = new SystemStartupOrchestrator({
    autoRestart: process.env.AUTO_RESTART !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    maxRestarts: parseInt(process.env.MAX_RESTARTS) || 3,
  });
  
  // Listen to events
  orchestrator.on('service:output', ({ serviceId, data }) => {
    console.log(`[${serviceId}] ${data.trim()}`);
  });
  
  orchestrator.on('service:error', ({ serviceId, data }) => {
    console.error(`[${serviceId}] ERROR: ${data.trim()}`);
  });
  
  orchestrator.on('service:unhealthy', ({ serviceId, service }) => {
    console.warn(`⚠️  ${service.name} became unhealthy`);
  });
  
  orchestrator.on('service:recovered', ({ serviceId, service }) => {
    console.log(`✅ ${service.name} recovered`);
  });
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Shutting down...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  // Start system
  try {
    await orchestrator.start();
    
    // Keep running
    console.log('\n✅ System running. Press Ctrl+C to stop.\n');
    
  } catch (error) {
    console.error('\n❌ System startup failed:', error);
    process.exit(1);
  }
}

// Usage
if (process.argv.includes('--help')) {
  console.log(`
LightDom System Startup

Environment Variables:
  AUTO_RESTART           - Enable auto-restart (default: true)
  HEALTH_CHECK_INTERVAL  - Health check interval in ms (default: 30000)
  MAX_RESTARTS           - Max restart attempts (default: 3)

Examples:
  # Start with defaults
  node scripts/start-system.js
  
  # Disable auto-restart
  AUTO_RESTART=false node scripts/start-system.js
  
  # Custom health check
  HEALTH_CHECK_INTERVAL=60000 node scripts/start-system.js
  `);
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
