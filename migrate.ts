#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Runs all SQL migration files in the database/ directory
 * Usage: npm run migrate
 */

import { getDatabaseService } from './src/services/DatabaseService.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting database migrations...\n');

  const dbService = getDatabaseService();

  try {
    // Initialize database connection
    await dbService.initialize();

    // Run migrations
    const result = await dbService.runMigrations();

    // Report results
    console.log('\n📊 Migration Results:');
    console.log(`   Applied: ${result.appliedMigrations.length} migrations`);
    
    if (result.appliedMigrations.length > 0) {
      result.appliedMigrations.forEach((migration) => {
        console.log(`   ✅ ${migration}`);
      });
    }

    if (result.errors.length > 0) {
      console.log(`\n   Errors: ${result.errors.length}`);
      result.errors.forEach((error) => {
        console.log(`   ❌ ${error}`);
      });
    }

    if (result.success) {
      console.log('\n✨ All migrations completed successfully!');
    } else {
      console.log('\n⚠️  Some migrations failed. Check errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await dbService.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
