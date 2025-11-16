#!/usr/bin/env node
/**
 * Generate Training Data
 * 
 * Run massive simulations to generate ML training data
 */

import { Pool } from 'pg';
import TrainingDataGenerator from '../services/training-data-generator.js';
import CodebaseIndexingService from '../services/codebase-indexing-service.js';

async function main() {
  console.log('🎲 Training Data Generation\n');
  
  // Parse args
  const args = process.argv.slice(2);
  const simulations = parseInt(args.find(a => a.startsWith('--simulations='))?.split('=')[1]) || 1000000;
  const workers = parseInt(args.find(a => a.startsWith('--workers='))?.split('=')[1]) || require('os').cpus().length;
  const output = args.find(a => a.startsWith('--output='))?.split('=')[1] || './training-data';
  
  console.log(`Configuration:`);
  console.log(`  Simulations: ${simulations.toLocaleString()}`);
  console.log(`  Workers: ${workers}`);
  console.log(`  Output: ${output}\n`);
  
  // Setup database
  const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/knowledge_graph',
  });
  
  try {
    await db.query('SELECT 1');
    console.log('✅ Connected to database\n');
  } catch (error) {
    console.warn('⚠️  Database not available, proceeding without historical data\n');
  }
  
  // Create generator
  const generator = new TrainingDataGenerator({
    db,
    numSimulations: simulations,
    parallelWorkers: workers,
    outputDir: output,
  });
  
  // Generate
  const result = await generator.generate();
  
  console.log('\n✅ Training data generation complete!');
  console.log(`\nOutput files:`);
  console.log(`  ${output}/patterns.jsonl`);
  console.log(`  ${output}/data-highways.json`);
  console.log(`  ${output}/performance-metrics.json`);
  console.log(`  ${output}/metadata.json`);
  
  await db.end();
}

// Usage
if (process.argv.includes('--help')) {
  console.log(`
Training Data Generation

Options:
  --simulations=N  Number of simulations to run (default: 1000000)
  --workers=N      Number of parallel workers (default: CPU count)
  --output=PATH    Output directory (default: ./training-data)

Examples:
  # Generate 1M samples
  node scripts/generate-training-data.js
  
  # Generate 10M samples with 16 workers
  node scripts/generate-training-data.js --simulations=10000000 --workers=16
  
  # Custom output directory
  node scripts/generate-training-data.js --output=/data/training
  `);
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
