#!/usr/bin/env node

/**
 * SEO Data Mining Kickoff Script
 * 
 * This script initiates the data mining workflow for collecting
 * training data for the SEO ML models.
 * 
 * Targets:
 * - 10,000+ URLs for initial dataset
 * - 194 SEO features per URL
 * - Quality scored and validated
 * - Stored in seo_training_data table
 * 
 * Usage:
 *   node scripts/seo-data-mining-kickoff.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Database connection
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // Mining configuration
  mining: {
    targetUrls: 10000,
    batchSize: 100,
    concurrency: 10,
    delayBetweenRequests: 1000, // 1 second
    respectRobotsTxt: true,
    userAgent: 'LightDom SEO Training Bot/1.0'
  },
  
  // Feature extraction
  features: {
    technical: 50,
    content: 70,
    performance: 24,
    engagement: 40,
    competitive: 10,
    total: 194
  },
  
  // Target sites for initial crawl
  seedUrls: [
    // E-commerce
    'https://www.shopify.com',
    'https://www.amazon.com',
    'https://www.etsy.com',
    
    // News & Media
    'https://www.nytimes.com',
    'https://www.theguardian.com',
    'https://www.bbc.com',
    
    // Tech
    'https://www.github.com',
    'https://www.stackoverflow.com',
    'https://www.medium.com',
    
    // SaaS
    'https://www.stripe.com',
    'https://www.slack.com',
    'https://www.notion.so',
    
    // Content sites
    'https://www.wikipedia.org',
    'https://www.reddit.com',
    'https://www.youtube.com'
  ]
};

class SEODataMiningKickoff {
  constructor() {
    this.dbPool = null;
    this.stats = {
      urlsQueued: 0,
      urlsCrawled: 0,
      featuresExtracted: 0,
      errors: 0,
      startTime: null,
      estimatedCompletion: null
    };
  }

  async initialize() {
    console.log('🚀 SEO Data Mining Kickoff');
    console.log('=' .repeat(60));
    console.log('');
    
    // Connect to database
    console.log('📊 Connecting to database...');
    this.dbPool = new Pool(config.database);
    
    try {
      const client = await this.dbPool.connect();
      console.log('✅ Database connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    
    // Check if tables exist
    await this.checkDatabaseSchema();
    
    // Initialize mining queue
    await this.initializeMiningQueue();
  }

  async checkDatabaseSchema() {
    console.log('\n📋 Checking database schema...');
    
    const requiredTables = [
      'seo_clients',
      'seo_training_data',
      'seo_analytics',
      'seo_optimization_configs'
    ];
    
    for (const table of requiredTables) {
      const result = await this.dbPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`  ✅ Table '${table}' exists`);
      } else {
        console.log(`  ⚠️  Table '${table}' not found - may need to run migrations`);
      }
    }
  }

  async initializeMiningQueue() {
    console.log('\n🔧 Initializing mining queue...');
    
    // Create mining queue table if it doesn't exist
    await this.dbPool.query(`
      CREATE TABLE IF NOT EXISTS seo_mining_queue (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        domain VARCHAR(255),
        priority INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        last_attempt TIMESTAMP,
        features_extracted JSONB,
        quality_score DECIMAL(5,2),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_mining_queue_status ON seo_mining_queue(status);
      CREATE INDEX IF NOT EXISTS idx_mining_queue_priority ON seo_mining_queue(priority DESC);
    `);
    
    console.log('✅ Mining queue table ready');
  }

  async seedMiningQueue() {
    console.log('\n🌱 Seeding mining queue with initial URLs...');
    
    let seededCount = 0;
    
    for (const url of config.seedUrls) {
      try {
        await this.dbPool.query(`
          INSERT INTO seo_mining_queue (url, domain, priority, status)
          VALUES ($1, $2, $3, 'pending')
          ON CONFLICT (url) DO NOTHING
        `, [url, new URL(url).hostname, 10]);
        
        seededCount++;
        console.log(`  ✅ Queued: ${url}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to queue ${url}: ${error.message}`);
      }
    }
    
    this.stats.urlsQueued = seededCount;
    console.log(`\n📊 Queued ${seededCount} seed URLs`);
  }

  async displayStatus() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MINING STATUS');
    console.log('='.repeat(60));
    
    // Get queue stats
    const queueStats = await this.dbPool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM seo_mining_queue
      GROUP BY status
    `);
    
    console.log('\n🎯 Queue Status:');
    for (const row of queueStats.rows) {
      console.log(`  ${row.status}: ${row.count} URLs`);
    }
    
    // Get training data stats
    const trainingStats = await this.dbPool.query(`
      SELECT COUNT(*) as count
      FROM seo_training_data
    `);
    
    console.log(`\n📚 Training Data: ${trainingStats.rows[0].count} samples`);
    
    // Estimate completion
    const pendingCount = queueStats.rows.find(r => r.status === 'pending')?.count || 0;
    if (pendingCount > 0) {
      const timePerUrl = config.mining.delayBetweenRequests / 1000; // seconds
      const estimatedSeconds = (pendingCount * timePerUrl) / config.mining.concurrency;
      const estimatedHours = (estimatedSeconds / 3600).toFixed(1);
      
      console.log(`\n⏱️  Estimated completion: ${estimatedHours} hours`);
      console.log(`   (${pendingCount} URLs at ${config.mining.concurrency} concurrent workers)`);
    }
  }

  async createMiningConfiguration() {
    console.log('\n📝 Creating mining configuration file...');
    
    const miningConfig = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      database: {
        queueTable: 'seo_mining_queue',
        trainingTable: 'seo_training_data'
      },
      mining: config.mining,
      features: config.features,
      workers: {
        crawler: {
          enabled: true,
          count: config.mining.concurrency,
          script: 'services/enhanced-data-mining-worker.js'
        },
        featureExtractor: {
          enabled: true,
          count: 5,
          script: 'services/seo-feature-extractor-worker.js'
        },
        qualityScorer: {
          enabled: true,
          count: 2,
          script: 'services/seo-quality-scorer-worker.js'
        }
      },
      schedule: {
        continuousMining: true,
        checkInterval: 60000, // 1 minute
        batchSize: config.mining.batchSize
      }
    };
    
    const configPath = path.join(__dirname, '..', 'config', 'seo-mining-config.json');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(miningConfig, null, 2));
    
    console.log(`✅ Configuration saved to: ${configPath}`);
    return miningConfig;
  }

  async createWorkerScripts() {
    console.log('\n🔧 Creating worker script templates...');
    
    // Create workers directory
    const workersDir = path.join(__dirname, '..', 'services', 'seo-workers');
    fs.mkdirSync(workersDir, { recursive: true });
    
    // Feature extractor worker template
    const featureExtractorTemplate = `
/**
 * SEO Feature Extractor Worker
 * Extracts 194 SEO features from crawled URLs
 */

const extractFeatures = async (url, html, metadata) => {
  const features = {
    // Technical SEO (50 features)
    technical: {
      hasHttps: url.startsWith('https://'),
      pageLoadTime: metadata.loadTime || 0,
      // ... 48 more technical features
    },
    
    // Content SEO (70 features)
    content: {
      titleLength: extractTitle(html).length,
      wordCount: countWords(html),
      // ... 68 more content features
    },
    
    // Performance (24 features)
    performance: {
      lcp: metadata.lcp || 0,
      inp: metadata.inp || 0,
      cls: metadata.cls || 0,
      // ... 21 more performance features
    },
    
    // User Engagement (40 features)
    engagement: {
      // Will be collected from analytics
    },
    
    // Competitive (10 features)
    competitive: {
      // Will be collected from external APIs
    }
  };
  
  return features;
};

module.exports = { extractFeatures };
    `;
    
    fs.writeFileSync(
      path.join(workersDir, 'feature-extractor.js'),
      featureExtractorTemplate.trim()
    );
    
    console.log('✅ Worker templates created');
  }

  async generateStartScript() {
    console.log('\n📝 Generating start script...');
    
    const startScript = `#!/bin/bash
# SEO Data Mining Start Script

echo "🚀 Starting SEO Data Mining Workers..."
echo ""

# Start crawler workers
echo "Starting crawler workers (${config.mining.concurrency} workers)..."
for i in {1..${config.mining.concurrency}}; do
  node services/enhanced-data-mining-worker.js --worker-id=\$i &
  echo "  ✅ Crawler worker \$i started (PID: $!)"
done

# Start feature extractor workers
echo ""
echo "Starting feature extractor workers (5 workers)..."
for i in {1..5}; do
  node services/seo-workers/feature-extractor.js --worker-id=\$i &
  echo "  ✅ Feature extractor worker \$i started (PID: $!)"
done

echo ""
echo "✅ All workers started!"
echo "📊 View status: node scripts/seo-mining-status.js"
echo "🛑 Stop workers: pkill -f 'seo.*worker'"
    `;
    
    const scriptPath = path.join(__dirname, 'start-seo-mining.sh');
    fs.writeFileSync(scriptPath, startScript.trim());
    fs.chmodSync(scriptPath, '755');
    
    console.log(`✅ Start script created: ${scriptPath}`);
  }

  async generateStatusScript() {
    console.log('\n📝 Generating status monitoring script...');
    
    const statusScript = `#!/usr/bin/env node
// SEO Mining Status Monitor

const { Pool } = require('pg');

const pool = new Pool(${JSON.stringify(config.database, null, 2)});

async function showStatus() {
  console.clear();
  console.log('📊 SEO DATA MINING STATUS');
  console.log('=' .repeat(60));
  console.log('');
  
  const stats = await pool.query(\`
    SELECT 
      status,
      COUNT(*) as count,
      AVG(quality_score) as avg_quality
    FROM seo_mining_queue
    GROUP BY status
  \`);
  
  for (const row of stats.rows) {
    console.log(\`\${row.status.toUpperCase()}: \${row.count} URLs (Quality: \${row.avg_quality?.toFixed(2) || 'N/A'})\`);
  }
  
  console.log('');
  console.log('Press Ctrl+C to exit');
}

setInterval(showStatus, 5000);
showStatus();
    `;
    
    const scriptPath = path.join(__dirname, 'seo-mining-status.js');
    fs.writeFileSync(scriptPath, statusScript.trim());
    fs.chmodSync(scriptPath, '755');
    
    console.log(`✅ Status script created: ${scriptPath}`);
  }

  async displayNextSteps() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 NEXT STEPS');
    console.log('='.repeat(60));
    console.log('');
    console.log('1. Review the configuration:');
    console.log('   config/seo-mining-config.json');
    console.log('');
    console.log('2. Start the mining workers:');
    console.log('   ./scripts/start-seo-mining.sh');
    console.log('');
    console.log('3. Monitor progress:');
    console.log('   node scripts/seo-mining-status.js');
    console.log('');
    console.log('4. Once 10,000+ URLs collected, begin ML training:');
    console.log('   node scripts/train-seo-models.js');
    console.log('');
    console.log('=' .repeat(60));
  }

  async cleanup() {
    if (this.dbPool) {
      await this.dbPool.end();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.seedMiningQueue();
      await this.displayStatus();
      
      const miningConfig = await this.createMiningConfiguration();
      await this.createWorkerScripts();
      await this.generateStartScript();
      await this.generateStatusScript();
      
      await this.displayNextSteps();
      
      console.log('\n✅ Data mining workflow initialized successfully!');
      console.log('');
      
    } catch (error) {
      console.error('\n❌ Error during kickoff:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const kickoff = new SEODataMiningKickoff();
  kickoff.run()
    .then(() => {
      console.log('✅ Kickoff complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Kickoff failed:', error);
      process.exit(1);
    });
}

module.exports = SEODataMiningKickoff;
