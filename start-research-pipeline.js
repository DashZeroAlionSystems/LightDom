#!/usr/bin/env node

/**
 * Start Research Pipeline
 * 
 * Comprehensive research mining and content suggestion system
 * 
 * Usage:
 *   npm run research:start              # Full pipeline
 *   npm run research:mine               # Mine articles only
 *   npm run research:deepseek           # Process DeepSeek queue
 *   npm run research:stats              # Show statistics
 */

import ResearchPipelineService from './services/research-pipeline-service.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// CLI arguments
const args = process.argv.slice(2);
const command = args[0] || 'full';

// Configuration
const CONFIG = {
  database: {
    schemaFile: './database/research-pipeline-schema.sql',
    checkConnection: true,
  },
  mining: {
    priority: args.includes('--priority') ? args[args.indexOf('--priority') + 1] : 'high',
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 50,
    skipExtracted: !args.includes('--reprocess'),
  },
  deepseek: {
    enabled: !args.includes('--no-deepseek'),
  }
};

class ResearchPipelineCLI {
  constructor() {
    this.pipeline = new ResearchPipelineService();
    this.startTime = Date.now();
  }

  /**
   * Main entry point
   */
  async run() {
    try {
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║     🔬 LightDom Research Pipeline                       ║');
      console.log('║     Deep Research Mining & Content Suggestion System    ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');

      // Setup database
      if (command === 'setup' || command === 'full') {
        await this.setupDatabase();
      }

      // Initialize pipeline
      await this.pipeline.initialize();

      // Execute command
      switch (command) {
        case 'full':
          await this.runFullPipeline();
          break;
        case 'mine':
          await this.runMining();
          break;
        case 'deepseek':
          await this.runDeepSeek();
          break;
        case 'stats':
          await this.showStatistics();
          break;
        case 'setup':
          console.log('✅ Setup completed');
          break;
        case 'help':
          this.showHelp();
          break;
        default:
          console.log(`Unknown command: ${command}`);
          this.showHelp();
      }

      // Show summary
      await this.showSummary();

      // Cleanup
      await this.pipeline.cleanup();

      console.log('\n✅ Research Pipeline completed successfully\n');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Setup database
   */
  async setupDatabase() {
    console.log('📊 Setting up database...\n');

    try {
      // Check if PostgreSQL is running
      const { stdout } = await execAsync('pg_isready 2>&1 || echo "not ready"');
      
      if (stdout.includes('not ready')) {
        console.log('⚠️  PostgreSQL not detected. Please ensure it is running.');
        console.log('   Start with: sudo service postgresql start');
        console.log('   Or use Docker: docker-compose up -d postgres\n');
        
        if (process.env.NODE_ENV === 'production') {
          throw new Error('PostgreSQL not available');
        }
      }

      // Execute schema file
      const schemaPath = CONFIG.database.schemaFile;
      const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dom_space_harvester';

      console.log(`  📁 Loading schema from: ${schemaPath}`);
      
      try {
        await execAsync(`psql "${dbUrl}" -f ${schemaPath} 2>&1`);
        console.log('  ✅ Database schema loaded\n');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('  ℹ️  Database schema already exists\n');
        } else {
          console.log('  ⚠️  Schema load failed (may already exist):', error.message);
          console.log('  Continuing anyway...\n');
        }
      }
    } catch (error) {
      console.log('⚠️  Database setup warning:', error.message);
      console.log('Continuing with existing schema...\n');
    }
  }

  /**
   * Run full pipeline
   */
  async runFullPipeline() {
    console.log('🚀 Running full research pipeline\n');
    console.log('Steps:');
    console.log('  1. Mine research articles');
    console.log('  2. Process DeepSeek queue');
    console.log('  3. Generate suggestions');
    console.log('');

    // Step 1: Mining
    await this.runMining();

    // Step 2: DeepSeek processing
    if (CONFIG.deepseek.enabled) {
      await this.runDeepSeek();
    }

    // Step 3: Show results
    await this.showStatistics();
  }

  /**
   * Run mining only
   */
  async runMining() {
    console.log('\n⛏️  MINING PHASE\n');
    console.log('Settings:');
    console.log(`  • Priority: ${CONFIG.mining.priority}`);
    console.log(`  • Limit: ${CONFIG.mining.limit} articles`);
    console.log(`  • Skip extracted: ${CONFIG.mining.skipExtracted}`);
    console.log('');

    const stats = await this.pipeline.startMining(CONFIG.mining);

    console.log('\n📊 Mining Results:');
    console.log(`  • Processed: ${stats.articlesProcessed}`);
    console.log(`  • Extracted: ${stats.articlesExtracted}`);
    console.log(`  • Failed: ${stats.articlesFailed}`);
    console.log(`  • Topics: ${stats.topicsIdentified}`);
    console.log(`  • Seeds: ${stats.seedsCrawled}`);
  }

  /**
   * Run DeepSeek processing
   */
  async runDeepSeek() {
    console.log('\n🤖 DEEPSEEK PROCESSING PHASE\n');

    if (!process.env.DEEPSEEK_API_KEY) {
      console.log('⚠️  DEEPSEEK_API_KEY not set. Skipping DeepSeek processing.');
      console.log('   Set it in .env file to enable AI-powered suggestions.\n');
      return;
    }

    await this.pipeline.processDeepSeekQueue();

    console.log('\n✅ DeepSeek processing completed');
  }

  /**
   * Show statistics
   */
  async showStatistics() {
    console.log('\n📈 PIPELINE STATISTICS\n');

    const stats = await this.pipeline.getStatistics();

    console.log('Database Status:');
    console.log(`  • Total Articles: ${stats.totalArticles}`);
    console.log(`  • Extracted: ${stats.extractedArticles}`);
    console.log(`  • Pending: ${stats.pendingArticles}`);
    console.log(`  • Topics: ${stats.totalTopics}`);
    console.log(`  • Research Seeds: ${stats.totalSeeds}`);
    console.log(`  • Content Queue: ${stats.pendingQueue}`);
    console.log(`  • AI Suggestions: ${stats.suggestions}`);

    const extractionRate = stats.totalArticles > 0 
      ? ((stats.extractedArticles / stats.totalArticles) * 100).toFixed(1)
      : 0;

    console.log(`\n  Extraction Rate: ${extractionRate}%`);
  }

  /**
   * Show summary
   */
  async showSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log('\n' + '═'.repeat(60));
    console.log('Summary');
    console.log('═'.repeat(60));
    console.log(`Duration: ${duration}s`);
    
    const stats = await this.pipeline.getStatistics();
    console.log(`Total Articles: ${stats.totalArticles}`);
    console.log(`Extracted: ${stats.extractedArticles}`);
    console.log(`AI Suggestions: ${stats.suggestions}`);
    console.log('═'.repeat(60) + '\n');
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
Research Pipeline Commands:

  npm run research:start              Run full pipeline (setup + mine + deepseek)
  npm run research:mine               Mine articles only
  npm run research:deepseek           Process DeepSeek queue only
  npm run research:stats              Show statistics
  npm run research:setup              Setup database only

Options:

  --priority <level>                  Set mining priority (high, medium, low)
  --limit <number>                    Limit number of articles to process
  --reprocess                         Reprocess already extracted articles
  --no-deepseek                       Skip DeepSeek processing

Examples:

  npm run research:start              # Full pipeline with defaults
  npm run research:mine -- --priority high --limit 20
  npm run research:mine -- --reprocess
  npm run research:stats

Environment Variables:

  DATABASE_URL                        PostgreSQL connection string
  DEEPSEEK_API_KEY                    DeepSeek API key for AI suggestions

For more information, see docs/research/ai-series-352/README.md
    `);
  }
}

// Run CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ResearchPipelineCLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default ResearchPipelineCLI;
