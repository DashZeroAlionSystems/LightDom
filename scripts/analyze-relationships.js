#!/usr/bin/env node
/**
 * Analyze Code Relationships
 * 
 * Find patterns, duplicates, and structural issues
 */

import { Pool } from 'pg';
import RelationshipBasedIndexer from '../services/relationship-based-indexer.js';

async function main() {
  console.log('🔍 Relationship-Based Code Analysis\n');
  
  // Setup database
  const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/knowledge_graph',
  });
  
  try {
    await db.query('SELECT 1');
    console.log('✅ Connected to database\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Create indexer
  const indexer = new RelationshipBasedIndexer({
    db,
    duplicateThreshold: parseFloat(process.env.DUPLICATE_THRESHOLD) || 0.85,
    maxFilesPerDir: parseInt(process.env.MAX_FILES_PER_DIR) || 50,
    complexityThreshold: parseInt(process.env.COMPLEXITY_THRESHOLD) || 10,
  });
  
  // Analyze
  const recommendations = await indexer.analyzeByRelationships();
  
  console.log('\n📋 Top Recommendations:\n');
  
  // Show top 10
  for (let i = 0; i < Math.min(10, recommendations.length); i++) {
    const rec = recommendations[i];
    const score = rec.priority * rec.impact;
    
    console.log(`${i + 1}. [Score: ${score.toFixed(1)}] ${rec.title}`);
    console.log(`   Type: ${rec.type}`);
    console.log(`   Effort: ${rec.estimatedEffort.toFixed(1)}h, Impact: ${rec.impact}/10`);
    console.log(`   ${rec.description.substring(0, 100)}...`);
    console.log();
  }
  
  console.log(`\n📊 Total recommendations: ${recommendations.length}`);
  console.log(`\nTo view all recommendations:`);
  console.log(`  psql -d knowledge_graph -c "SELECT * FROM code_recommendations ORDER BY priority * impact DESC;"`);
  
  await db.end();
}

// Usage
if (process.argv.includes('--help')) {
  console.log(`
Relationship-Based Code Analysis

Environment Variables:
  DATABASE_URL          - PostgreSQL connection string
  DUPLICATE_THRESHOLD   - Similarity threshold (default: 0.85)
  MAX_FILES_PER_DIR     - Max files per directory (default: 50)
  COMPLEXITY_THRESHOLD  - Complexity warning threshold (default: 10)

Examples:
  # Basic analysis
  node scripts/analyze-relationships.js
  
  # Strict duplicate detection
  DUPLICATE_THRESHOLD=0.95 node scripts/analyze-relationships.js
  
  # Lower file count threshold
  MAX_FILES_PER_DIR=30 node scripts/analyze-relationships.js
  `);
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
