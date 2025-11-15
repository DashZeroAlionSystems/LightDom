#!/usr/bin/env node

/**
 * Start AI Research Pipeline Service
 * 
 * This script initializes and starts the AI Research Pipeline with:
 * - Automated campaign execution
 * - Scheduled monitoring
 * - Background job processing
 * - API server integration
 */

import { Pool } from 'pg';
import { AIResearchPipeline } from './services/ai-research-pipeline.js';
import chalk from 'chalk';
import fs from 'fs';

const DEFAULT_CONFIG = {
  // Campaign execution interval (in minutes)
  executionInterval: 360, // 6 hours
  
  // Default topics to monitor
  topics: ['ai', 'ml', 'llm', 'nlp', 'agents', 'seo', 'automation'],
  
  // Articles per campaign run
  articlesPerRun: 100,
  
  // Minimum relevance score
  minRelevance: 0.6,
  
  // Enable features
  enableFullScrape: true,
  enableFeatureExtraction: true,
  enableSEOAnalysis: true,
  
  // Rate limiting
  rateLimit: 50,
  
  // Headless mode
  headless: true
};

class ResearchPipelineService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.pipeline = null;
    this.db = null;
    this.campaignIntervals = new Map();
    this.running = false;
  }

  async initialize() {
    console.log(chalk.cyan.bold('\n🚀 Starting AI Research Pipeline Service\n'));
    console.log(chalk.gray('==========================================\n'));

    // Initialize database
    console.log(chalk.blue('📊 Connecting to database...'));
    this.db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    });

    try {
      await this.db.query('SELECT NOW()');
      console.log(chalk.green('✓ Database connected\n'));
    } catch (error) {
      console.error(chalk.red('✗ Database connection failed:'), error.message);
      throw error;
    }

    // Check if schema exists
    console.log(chalk.blue('🔍 Checking database schema...'));
    const schemaCheck = await this.db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'research_articles'
      );
    `);

    if (!schemaCheck.rows[0].exists) {
      console.log(chalk.yellow('⚠️  Research pipeline schema not found'));
      console.log(chalk.yellow('   Run: psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql\n'));
      
      // Try to initialize schema
      try {
        const schemaPath = './database/ai-research-pipeline-schema.sql';
        if (fs.existsSync(schemaPath)) {
          console.log(chalk.blue('📦 Initializing schema from file...'));
          const schema = fs.readFileSync(schemaPath, 'utf8');
          await this.db.query(schema);
          console.log(chalk.green('✓ Schema initialized\n'));
        }
      } catch (error) {
        console.error(chalk.red('✗ Failed to initialize schema:'), error.message);
        console.log(chalk.yellow('   Please run the schema file manually\n'));
      }
    } else {
      console.log(chalk.green('✓ Schema exists\n'));
    }

    // Initialize pipeline
    console.log(chalk.blue('🔧 Initializing AI Research Pipeline...'));
    this.pipeline = new AIResearchPipeline({
      db: this.db,
      headless: this.config.headless,
      maxConcurrent: 5,
      rateLimit: this.config.rateLimit
    });

    await this.pipeline.initialize();
    console.log(chalk.green('✓ Pipeline initialized\n'));

    // Set up event listeners
    this.setupEventListeners();

    this.running = true;
  }

  setupEventListeners() {
    this.pipeline.on('articles-scraped', (data) => {
      console.log(chalk.cyan(`📚 Scraped ${data.count} articles for topics: ${data.topics.join(', ')}`));
    });

    this.pipeline.on('campaign-executed', (data) => {
      console.log(chalk.green(`✓ Campaign ${data.campaignId} completed:`));
      console.log(chalk.gray(`  Articles: ${data.results.articlesFound}`));
      console.log(chalk.gray(`  Features: ${data.results.featuresIdentified}`));
      console.log(chalk.gray(`  Code Examples: ${data.results.codeExamplesExtracted}`));
    });

    this.pipeline.on('paper-generated', (paper) => {
      console.log(chalk.yellow(`📝 Research paper generated: ${paper.title}`));
    });

    this.pipeline.on('campaign-created', (campaign) => {
      console.log(chalk.cyan(`🎯 Campaign created: ${campaign.name}`));
    });
  }

  async startDefaultCampaign() {
    console.log(chalk.cyan.bold('\n🎯 Setting Up Default Campaign\n'));

    // Check if default campaign exists
    const existing = await this.db.query(`
      SELECT id FROM research_campaigns 
      WHERE name = 'Default AI/ML/LLM Monitoring'
      AND is_active = true
    `);

    let campaignId;

    if (existing.rows.length > 0) {
      campaignId = existing.rows[0].id;
      console.log(chalk.green(`✓ Found existing campaign: ${campaignId}\n`));
    } else {
      // Create default campaign
      const campaign = await this.pipeline.createResearchCampaign({
        name: 'Default AI/ML/LLM Monitoring',
        description: 'Continuous monitoring of AI, ML, and LLM developments for product opportunities',
        type: 'continuous',
        queries: [
          'artificial intelligence',
          'machine learning',
          'large language models',
          'nlp',
          'agentic ai',
          'seo automation',
          'ai agents',
          'prompt engineering',
          'rag retrieval',
          'vector databases'
        ],
        topics: this.config.topics,
        schedule: `0 */${Math.floor(this.config.executionInterval / 60)} * * *`,
        maxArticles: this.config.articlesPerRun,
        minRelevance: this.config.minRelevance,
        fullScrape: this.config.enableFullScrape,
        extractFeatures: this.config.enableFeatureExtraction
      });

      campaignId = campaign.id;
      console.log(chalk.green(`✓ Created default campaign: ${campaignId}\n`));
    }

    // Execute immediately
    console.log(chalk.blue('▶️  Executing initial campaign run...\n'));
    await this.executeCampaign(campaignId);

    // Schedule periodic execution
    this.scheduleCampaign(campaignId, this.config.executionInterval);

    return campaignId;
  }

  async executeCampaign(campaignId) {
    try {
      const results = await this.pipeline.executeCampaign(campaignId);
      
      // Generate research paper if enough data collected
      if (results.featuresIdentified >= 10) {
        console.log(chalk.blue('\n📝 Generating research paper...\n'));
        await this.pipeline.generateResearchPaper('ai-ml-integration', 50);
      }

      return results;
    } catch (error) {
      console.error(chalk.red(`✗ Campaign execution failed:`), error.message);
    }
  }

  scheduleCampaign(campaignId, intervalMinutes) {
    console.log(chalk.cyan(`⏰ Scheduling campaign to run every ${intervalMinutes} minutes\n`));

    const interval = setInterval(async () => {
      console.log(chalk.blue(`\n⏰ Scheduled campaign execution: ${new Date().toISOString()}\n`));
      await this.executeCampaign(campaignId);
    }, intervalMinutes * 60 * 1000);

    this.campaignIntervals.set(campaignId, interval);
  }

  async displayStats() {
    const stats = await this.db.query(`
      SELECT 
        (SELECT COUNT(*) FROM research_articles) as total_articles,
        (SELECT COUNT(*) FROM research_articles WHERE scraped_at > NOW() - INTERVAL '24 hours') as articles_today,
        (SELECT COUNT(*) FROM feature_recommendations) as total_features,
        (SELECT COUNT(*) FROM feature_recommendations WHERE revenue_potential = 'high') as high_revenue_features,
        (SELECT COUNT(*) FROM research_campaigns WHERE is_active = true) as active_campaigns,
        (SELECT COUNT(*) FROM research_papers) as total_papers,
        (SELECT COUNT(*) FROM research_code_examples) as total_code_examples
    `);

    const s = stats.rows[0];

    console.log(chalk.cyan.bold('\n📊 Current Statistics\n'));
    console.log(chalk.white('Pipeline Status:'));
    console.log(chalk.gray(`  Total Articles: ${s.total_articles}`));
    console.log(chalk.yellow(`  Articles Today: ${s.articles_today}`));
    console.log(chalk.gray(`  Total Features: ${s.total_features}`));
    console.log(chalk.green(`  High Revenue Features: ${s.high_revenue_features}`));
    console.log(chalk.gray(`  Active Campaigns: ${s.active_campaigns}`));
    console.log(chalk.gray(`  Research Papers: ${s.total_papers}`));
    console.log(chalk.gray(`  Code Examples: ${s.total_code_examples}\n`));
  }

  async start() {
    await this.initialize();
    await this.startDefaultCampaign();
    await this.displayStats();

    console.log(chalk.green.bold('\n✅ AI Research Pipeline Service Running\n'));
    console.log(chalk.white('Service Status:'));
    console.log(chalk.gray('  API Endpoints: http://localhost:3001/api/research/*'));
    console.log(chalk.gray('  Dashboard: http://localhost:3001/api/research/dashboard'));
    console.log(chalk.gray('  Monitoring: Continuous'));
    console.log(chalk.gray('  Schedule: Every ' + this.config.executionInterval + ' minutes\n'));
    
    console.log(chalk.yellow('Press Ctrl+C to stop the service\n'));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await this.stop();
    });

    process.on('SIGTERM', async () => {
      await this.stop();
    });
  }

  async stop() {
    console.log(chalk.yellow('\n\n⏹️  Stopping AI Research Pipeline Service...\n'));

    this.running = false;

    // Clear all intervals
    for (const interval of this.campaignIntervals.values()) {
      clearInterval(interval);
    }

    // Cleanup pipeline
    if (this.pipeline) {
      await this.pipeline.cleanup();
    }

    // Close database
    if (this.db) {
      await this.db.end();
    }

    console.log(chalk.green('✓ Service stopped\n'));
    process.exit(0);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const config = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--interval' && args[i + 1]) {
    config.executionInterval = parseInt(args[i + 1]);
    i++;
  } else if (arg === '--topics' && args[i + 1]) {
    config.topics = args[i + 1].split(',');
    i++;
  } else if (arg === '--articles' && args[i + 1]) {
    config.articlesPerRun = parseInt(args[i + 1]);
    i++;
  } else if (arg === '--no-headless') {
    config.headless = false;
  } else if (arg === '--help') {
    console.log(`
AI Research Pipeline Service

Usage: node start-research-pipeline.js [options]

Options:
  --interval <minutes>   Campaign execution interval (default: 360)
  --topics <topics>      Comma-separated topics (default: ai,ml,llm,nlp,agents,seo,automation)
  --articles <number>    Articles per run (default: 100)
  --no-headless          Run browser in non-headless mode
  --help                 Show this help message

Examples:
  node start-research-pipeline.js
  node start-research-pipeline.js --interval 180 --topics ai,ml,llm
  node start-research-pipeline.js --articles 50 --no-headless
`);
    process.exit(0);
  }
}

// Start service
const service = new ResearchPipelineService(config);
service.start().catch(error => {
  console.error(chalk.red('Failed to start service:'), error);
  process.exit(1);
});
