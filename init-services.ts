#!/usr/bin/env node

/**
 * Initialize LightDom Platform Services
 *
 * This script uses the ServiceManager to:
 * 1. Register all platform services
 * 2. Initialize services in dependency order
 * 3. Run database migrations
 * 4. Load data and verify health
 *
 * The ServiceManager pattern ensures:
 * - Services are started in correct dependency order
 * - Health checks are performed
 * - Graceful shutdown is handled
 */

import {
  getServiceManager,
  ServiceManager,
} from './src/services/ServiceManager.js';
import {
  registerAllServices,
  services,
} from './src/services/ServiceRegistry.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main initialization function
 */
async function main() {
  console.log('🚀 LightDom Platform Services Initialization\n');
  console.log('='.repeat(60));

  const manager = getServiceManager();

  // Setup graceful shutdown
  const shutdown = async () => {
    console.log('\n⚠️  Received shutdown signal...');
    await manager.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    // Step 1: Register all services
    console.log('📦 Step 1: Registering Services\n');
    registerAllServices();
    console.log('');

    // Step 2: Initialize all services in dependency order
    console.log('📦 Step 2: Initializing Services\n');
    await manager.initialize();

    // Step 3: Run database migrations
    console.log('📦 Step 3: Database Migrations');
    try {
      const dbService = services.database;
      const migrationResult = await dbService.runMigrations();

      if (!migrationResult.success) {
        console.warn('⚠️  Some migrations had errors:', migrationResult.errors);
      } else {
        console.log(
          `   ✅ Applied ${migrationResult.appliedMigrations.length} migrations`
        );
      }
    } catch (error) {
      console.warn('   ⚠️  Migrations skipped:', (error as Error).message);
    }
    console.log('');

    // Step 4: Run sample analysis (optional)
    console.log('📦 Step 4: Sample Analysis');
    try {
      const analysisService = services.analysis;
      const report = await analysisService.runSampleAnalysis();
      console.log(`   ✅ Generated analysis report: ${report.reportId}`);
      console.log(`      Coverage Score: ${report.results.coverageScore}%`);
      console.log(`      Recommendations: ${report.recommendations.length}`);
    } catch (error) {
      console.warn('   ⚠️  Analysis skipped:', (error as Error).message);
    }
    console.log('');

    // Step 5: System health check
    console.log('📦 Step 5: System Health Check');
    const health = await manager.getSystemHealth();
    console.log(`   System Status: ${health.status.toUpperCase()}`);
    for (const [name, serviceHealth] of Object.entries(health.services)) {
      const icon = serviceHealth.healthy ? '✅' : '❌';
      console.log(
        `   ${icon} ${name}: ${serviceHealth.status}${serviceHealth.message ? ` - ${serviceHealth.message}` : ''}`
      );
    }
    console.log('');

    // Print final status
    manager.printStatus();

    console.log('✨ LightDom Platform Services initialized successfully!\n');
    console.log('💡 Quick Reference:');
    console.log('   - Use ServiceManager.getService("name") to access services');
    console.log('   - Use services.database, services.wiki, etc. for typed access');
    console.log('   - Run `npm run start:dev` to start the development server');
    console.log('   - Access GraphQL API at /graphql endpoint');
    console.log('');

    // Keep the process alive for service health monitoring
    // In a real application, this would be the API server
    console.log('Press Ctrl+C to shutdown services...\n');

    // For demo purposes, shutdown after a delay
    // In production, remove this and let the API server keep the process alive
    setTimeout(async () => {
      await manager.shutdown();
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    await manager.shutdown();
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
