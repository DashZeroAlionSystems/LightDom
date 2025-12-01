#!/usr/bin/env node
/**
 * Example: Codebase Indexing
 * 
 * Demonstrates how to index a codebase and build knowledge graph
 */

import { Pool } from 'pg';
import CodebaseIndexingService from '../services/codebase-indexing-service.js';
import DeepSeekCodebaseIntegration from '../services/deepseek-codebase-integration.js';

async function main() {
  console.log('📊 Codebase Indexing Demo\n');
  
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
  
  // Setup DeepSeek (optional)
  let deepseekService = null;
  if (process.env.DEEPSEEK_API_KEY) {
    deepseekService = new DeepSeekCodebaseIntegration({
      apiKey: process.env.DEEPSEEK_API_KEY,
      db,
    });
    console.log('✅ DeepSeek integration enabled\n');
  } else {
    console.log('⚠️  Running without DeepSeek (limited AI features)\n');
  }
  
  // Create indexer
  const indexer = new CodebaseIndexingService({
    rootDir: process.cwd(),
    db,
    deepseekService,
    enableEmbeddings: !!deepseekService,
    ignorePaths: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  });
  
  console.log('Configuration:');
  console.log(`  Root: ${indexer.config.rootDir}`);
  console.log(`  Embeddings: ${indexer.config.enableEmbeddings}`);
  console.log(`  Max file size: ${indexer.config.maxFileSize} bytes\n`);
  
  // Start indexing
  console.log('🚀 Starting codebase indexing...\n');
  console.log('═'.repeat(60));
  
  try {
    const result = await indexer.indexCodebase({
      incremental: false,
    });
    
    console.log('\n═'.repeat(60));
    console.log('\n✅ Indexing completed!\n');
    
    // Show statistics
    console.log('Statistics:');
    console.log(`  Session ID: ${result.sessionId}`);
    console.log(`  Files processed: ${result.stats.filesProcessed}`);
    console.log(`  Entities found: ${result.stats.entitiesFound}`);
    console.log(`  Relationships: ${result.stats.relationshipsFound}`);
    console.log(`  Issues detected: ${result.stats.issuesDetected}`);
    console.log(`  Duration: ${((result.stats.endTime - result.stats.startTime) / 1000).toFixed(2)}s\n`);
    
    // Query some results
    console.log('Sample Queries:\n');
    
    // Top entities by type
    const entitiesByType = await db.query(`
      SELECT entity_type, COUNT(*) as count
      FROM code_entities
      GROUP BY entity_type
      ORDER BY count DESC
    `);
    
    console.log('Entities by type:');
    entitiesByType.rows.forEach(row => {
      console.log(`  ${row.entity_type}: ${row.count}`);
    });
    
    // Top issues
    const topIssues = await db.query(`
      SELECT severity, category, COUNT(*) as count
      FROM code_issues
      WHERE status = 'open'
      GROUP BY severity, category
      ORDER BY 
        CASE severity 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        count DESC
      LIMIT 5
    `);
    
    if (topIssues.rows.length > 0) {
      console.log('\nTop issues:');
      topIssues.rows.forEach(row => {
        console.log(`  ${row.severity} ${row.category}: ${row.count}`);
      });
    }
    
    // Most complex functions
    const complex = await db.query(`
      SELECT name, file_path, complexity_score
      FROM code_entities
      WHERE entity_type = 'function'
      AND complexity_score > 0
      ORDER BY complexity_score DESC
      LIMIT 5
    `);
    
    if (complex.rows.length > 0) {
      console.log('\nMost complex functions:');
      complex.rows.forEach(row => {
        console.log(`  ${row.name} (${row.complexity_score.toFixed(1)}): ${row.file_path}`);
      });
    }
    
    // Orphaned code
    const orphaned = await db.query(`
      SELECT COUNT(*) as count FROM orphaned_code
    `);
    
    if (orphaned.rows[0].count > 0) {
      console.log(`\nOrphaned code: ${orphaned.rows[0].count} functions`);
    }
    
  } catch (error) {
    console.error('\n❌ Indexing failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Usage
if (process.argv.includes('--help')) {
  console.log(`
Codebase Indexing - Example Usage

Environment Variables:
  DATABASE_URL       - PostgreSQL connection string
  DEEPSEEK_API_KEY   - DeepSeek API key (optional, enables AI features)

Examples:
  # Basic indexing
  node examples/codebase-indexing-example.js
  
  # With AI analysis
  DEEPSEEK_API_KEY=xxx node examples/codebase-indexing-example.js
  
  # Custom database
  DATABASE_URL=postgresql://user:pass@host/db node examples/codebase-indexing-example.js
  `);
  process.exit(0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
