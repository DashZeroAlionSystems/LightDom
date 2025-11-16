#!/usr/bin/env node
/**
 * Example: Start Autonomous Code Agent
 * 
 * Demonstrates the complete autonomous development loop:
 * 1. Index codebase
 * 2. Detect issues
 * 3. Fix automatically
 * 4. Create PRs
 * 5. Learn from results
 */

import { Pool } from 'pg';
import AutonomousCodeAgent from '../services/autonomous-code-agent.js';
import DeepSeekCodebaseIntegration from '../services/deepseek-codebase-integration.js';

async function main() {
  console.log('🤖 Autonomous Code Agent Demo\n');
  
  // Setup database
  const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/knowledge_graph',
  });
  
  try {
    await db.query('SELECT 1');
    console.log('✅ Connected to database\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 To setup database:');
    console.log('   createdb knowledge_graph');
    console.log('   psql -d knowledge_graph -f database/schema-knowledge-graph-codebase.sql');
    process.exit(1);
  }
  
  // Setup DeepSeek (optional)
  let deepseekService = null;
  if (process.env.DEEPSEEK_API_KEY) {
    deepseekService = new DeepSeekCodebaseIntegration({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL,
      db,
    });
    console.log('✅ DeepSeek integration enabled\n');
  } else {
    console.log('⚠️  DeepSeek API key not found. AI features will be limited.\n');
    console.log('   Set DEEPSEEK_API_KEY environment variable to enable.\n');
  }
  
  // Create agent
  const agent = new AutonomousCodeAgent({
    agentId: 'agent-demo-001',
    agentType: 'general',
    
    // Configuration
    autoFix: process.env.AUTO_FIX !== 'false', // Enable/disable auto-fixing
    autoCommit: process.env.AUTO_COMMIT !== 'false',
    autoPR: process.env.AUTO_PR === 'true', // Requires GitHub token
    
    maxTasksPerRun: parseInt(process.env.MAX_TASKS) || 5,
    minConfidence: parseFloat(process.env.MIN_CONFIDENCE) || 0.7,
    
    // Services
    db,
    deepseekService,
    
    // Git settings (for PR creation)
    githubToken: process.env.GITHUB_TOKEN,
    repoOwner: process.env.GITHUB_OWNER,
    repoName: process.env.GITHUB_REPO,
    rootDir: process.cwd(),
  });
  
  console.log('Agent Configuration:');
  console.log(`  ID: ${agent.config.agentId}`);
  console.log(`  Auto-fix: ${agent.config.autoFix}`);
  console.log(`  Auto-commit: ${agent.config.autoCommit}`);
  console.log(`  Auto-PR: ${agent.config.autoPR}`);
  console.log(`  Max tasks: ${agent.config.maxTasksPerRun}`);
  console.log(`  Min confidence: ${agent.config.minConfidence}\n`);
  
  // Listen to events
  agent.on('task:started', (task) => {
    console.log(`\n📝 Task started: ${task.title}`);
  });
  
  agent.on('task:completed', (task) => {
    console.log(`✅ Task completed: ${task.title}`);
  });
  
  agent.on('task:failed', (task) => {
    console.log(`❌ Task failed: ${task.title}`);
  });
  
  // Start agent loop
  console.log('🚀 Starting autonomous agent loop...\n');
  console.log('═'.repeat(60));
  
  try {
    await agent.start();
    
    console.log('\n═'.repeat(60));
    console.log('\n✅ Agent run completed successfully!\n');
    
    // Show results
    console.log('Final Statistics:');
    console.log(`  Tasks completed: ${agent.stats.tasksCompleted}`);
    console.log(`  Issues fixed: ${agent.stats.issuesFixed}`);
    console.log(`  Branches created: ${agent.stats.branchesCreated}`);
    console.log(`  PRs created: ${agent.stats.prsCreated}`);
    console.log(`  Success rate: ${(agent.stats.successRate * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('\n❌ Agent run failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Usage information
if (process.argv.includes('--help')) {
  console.log(`
Autonomous Code Agent - Example Usage

Environment Variables:
  DATABASE_URL       - PostgreSQL connection string
  DEEPSEEK_API_KEY   - DeepSeek API key (optional)
  DEEPSEEK_BASE_URL  - DeepSeek API base URL
  GITHUB_TOKEN       - GitHub token for PR creation
  GITHUB_OWNER       - Repository owner
  GITHUB_REPO        - Repository name
  
  AUTO_FIX           - Enable auto-fixing (default: true)
  AUTO_COMMIT        - Enable auto-commit (default: true)
  AUTO_PR            - Enable auto-PR (default: false)
  MAX_TASKS          - Max tasks per run (default: 5)
  MIN_CONFIDENCE     - Min confidence for auto-fix (default: 0.7)

Examples:
  # Basic run with auto-fix
  node examples/autonomous-agent-example.js
  
  # Dry-run (no auto-fix)
  AUTO_FIX=false node examples/autonomous-agent-example.js
  
  # With PR creation
  AUTO_PR=true GITHUB_TOKEN=xxx node examples/autonomous-agent-example.js
  
  # High confidence only
  MIN_CONFIDENCE=0.9 node examples/autonomous-agent-example.js
  `);
  process.exit(0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
