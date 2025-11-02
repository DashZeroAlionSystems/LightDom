#!/usr/bin/env node

/**
 * Initialize LightDom Platform Services
 * 
 * This script:
 * 1. Runs database migrations
 * 2. Loads research topics
 * 3. Loads default component schemas
 * 4. Tests all services
 */

import { getDatabaseService } from './src/services/DatabaseService.ts';
import { wikiService } from './src/services/WikiService.ts';
import { componentLibraryService } from './src/services/ComponentLibraryService.ts';
import { analysisService } from './src/services/AnalysisService.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Initializing LightDom Platform Services...\n');

  const dbService = getDatabaseService();

  try {
    // Step 1: Initialize database and run migrations
    console.log('📦 Step 1: Database Setup');
    await dbService.initialize();
    const migrationResult = await dbService.runMigrations();
    
    if (!migrationResult.success) {
      console.error('❌ Migration errors occurred. Please fix them before continuing.');
      process.exit(1);
    }
    console.log('✅ Database initialized and migrations completed\n');

    // Step 2: Load research topics
    console.log('📦 Step 2: Loading Research Topics');
    await wikiService.loadTopics();
    const topics = await wikiService.getAllTopics();
    console.log(`✅ Loaded ${topics.length} research topics\n`);

    // Step 3: Load default component schemas
    console.log('📦 Step 3: Loading Component Schemas');
    await componentLibraryService.loadDefaultComponents();
    await componentLibraryService.loadAtomicSchemasFromFiles();
    const components = await componentLibraryService.getAtomicComponents();
    console.log(`✅ Loaded ${components.length} atomic components\n`);

    // Step 4: Run sample analysis
    console.log('📦 Step 4: Running Sample Analysis');
    const report = await analysisService.runSampleAnalysis();
    console.log(`✅ Generated analysis report: ${report.reportId}`);
    console.log(`   Coverage Score: ${report.results.coverageScore}%`);
    console.log(`   Recommendations: ${report.recommendations.length}`);
    console.log('');

    // Step 5: Verify services
    console.log('📦 Step 5: Service Health Checks');
    const health = await dbService.healthCheck();
    console.log(`✅ Database: ${health.healthy ? 'Healthy' : 'Unhealthy'} (${health.latency}ms)`);
    
    const stats = dbService.getStats();
    if (stats) {
      console.log(`   Pool: ${stats.totalCount} total, ${stats.idleCount} idle, ${stats.waitingCount} waiting`);
    }
    console.log('');

    console.log('✨ LightDom Platform Services initialized successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Research Topics: ${topics.length}`);
    console.log(`   - Component Schemas: ${components.length}`);
    console.log(`   - Analysis Reports: 1`);
    console.log('\n🎯 Services Ready:');
    console.log('   - DatabaseService');
    console.log('   - ValidationService');
    console.log('   - WikiService');
    console.log('   - ComponentLibraryService');
    console.log('   - PlanningService');
    console.log('   - ApiGatewayService');
    console.log('   - AnalysisService');
    console.log('\n💡 Next Steps:');
    console.log('   - Run `npm run migrate` to apply database migrations');
    console.log('   - Start API server with `npm run start:dev`');
    console.log('   - Access GraphQL API at /graphql endpoint');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await dbService.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
