#!/usr/bin/env node

/**
 * DeepSeek Automation Startup Script
 * 
 * Starts the DeepSeek automation system with the main application.
 * Auto-monitors services, detects errors, and manages workflows.
 */

import { DeepSeekAutomationOrchestrator } from './services/deepseek-automation-orchestrator.js';
import { Pool } from 'pg';

// Configuration
const config = {
  autoStart: true,
  monitoringInterval: 30000, // 30 seconds
  errorAnalysisEnabled: true,
  autoFixEnabled: process.env.DEEPSEEK_AUTO_FIX !== 'false',
  cicdEnabled: process.env.DEEPSEEK_CICD !== 'false',
  memoryEnabled: true,
  safeMode: process.env.DEEPSEEK_SAFE_MODE !== 'false',
  
  // Database config
  db: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10
  })
};

console.log('🤖 DeepSeek Automation System');
console.log('================================');
console.log(`Auto-fix: ${config.autoFixEnabled ? '✅ enabled' : '❌ disabled'}`);
console.log(`CI/CD: ${config.cicdEnabled ? '✅ enabled' : '❌ disabled'}`);
console.log(`Safe mode: ${config.safeMode ? '✅ enabled' : '❌ disabled'}`);
console.log('');

async function main() {
  try {
    // Create orchestrator
    const orchestrator = new DeepSeekAutomationOrchestrator(config);

    // Listen to events
    orchestrator.on('started', () => {
      console.log('✅ DeepSeek automation started successfully');
    });

    orchestrator.on('service-checked', ({ name, health }) => {
      if (health.score < 50) {
        console.log(`⚠️ Service ${name} health: ${health.score}%`);
      }
    });

    orchestrator.on('critical-service-down', ({ name }) => {
      console.log(`🚨 CRITICAL: Service ${name} is down!`);
    });

    orchestrator.on('stopped', () => {
      console.log('🛑 DeepSeek automation stopped');
    });

    // Start
    await orchestrator.start();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n📦 Graceful shutdown...');
      await orchestrator.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n📦 Graceful shutdown...');
      await orchestrator.stop();
      process.exit(0);
    });

    // Keep alive
    console.log('🎯 DeepSeek automation is now running. Press Ctrl+C to stop.');
    
    // Export for use in API server
    global.deepseekOrchestrator = orchestrator;

  } catch (error) {
    console.error('❌ Failed to start DeepSeek automation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as startDeepSeekAutomation };
