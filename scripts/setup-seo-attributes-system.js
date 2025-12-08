#!/usr/bin/env node
/**
 * SEO Attributes System Setup and Demo
 * 
 * Complete setup script that:
 * 1. Checks database connection
 * 2. Runs migration
 * 3. Populates attributes
 * 4. Creates demo campaign
 * 5. Demonstrates the system
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import { readFileSync } from 'fs';
import { populateAttributes } from './populate-seo-attributes.js';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lightdom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * Check database connection
 */
async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Run database migration
 */
async function runMigration() {
  console.log('\n📦 Running database migration...');
  
  try {
    const migrationPath = join(__dirname, '../migrations/20251116_seo_attribute_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully');
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping migration');
      return true;
    }
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

/**
 * Create a demo campaign
 */
async function createDemoCampaign() {
  console.log('\n🎯 Creating demo campaign...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if demo campaign exists
    const checkQuery = 'SELECT campaign_id FROM seo_campaigns WHERE name = $1';
    const existing = await client.query(checkQuery, ['Demo SEO Campaign']);
    
    let campaignId;
    
    if (existing.rows.length > 0) {
      campaignId = existing.rows[0].campaign_id;
      console.log(`ℹ️  Demo campaign already exists: ${campaignId}`);
    } else {
      // Create campaign
      const campaignQuery = `
        INSERT INTO seo_campaigns (
          campaign_id, name, description, target_keywords, target_urls,
          industry, status, active_mining, neural_network_enabled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING campaign_id;
      `;
      
      campaignId = `campaign_demo_${Date.now()}`;
      
      await client.query(campaignQuery, [
        campaignId,
        'Demo SEO Campaign',
        'Demonstration campaign showing the SEO attributes system in action',
        ['seo', 'optimization', 'web development'],
        ['https://example.com'],
        'technology',
        'active',
        true,
        true
      ]);
      
      console.log(`✅ Created demo campaign: ${campaignId}`);
    }
    
    // Add critical attributes to campaign
    const criticalAttrs = [
      'title', 'titleLength', 'metaDescription', 'metaDescriptionLength',
      'h1Text', 'h1Count', 'wordCount', 'altTextCoverage',
      'structuredDataCount', 'isSecure', 'seoScore', 'overallScore'
    ];
    
    console.log(`\n📋 Adding ${criticalAttrs.length} critical attributes to campaign...`);
    
    for (const attrKey of criticalAttrs) {
      const attrQuery = `
        INSERT INTO campaign_attributes (
          campaign_id, attribute_key, enabled, mine_actively,
          mining_priority, mining_algorithm
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (campaign_id, attribute_key) DO NOTHING;
      `;
      
      await client.query(attrQuery, [
        campaignId, attrKey, true, true, 10, 'rule-based'
      ]);
    }
    
    console.log('✅ Attributes added to campaign');
    
    // Add demo seed URLs
    const seedUrls = [
      { url: 'https://example.com', type: 'target', priority: 10 },
      { url: 'https://example.com/about', type: 'target', priority: 8 },
      { url: 'https://example.com/products', type: 'target', priority: 9 }
    ];
    
    console.log(`\n🌱 Adding ${seedUrls.length} seed URLs...`);
    
    for (const { url, type, priority } of seedUrls) {
      const urlQuery = `
        INSERT INTO attribute_seed_urls (
          url, campaign_id, url_type, priority, crawl_frequency
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (url, campaign_id) DO NOTHING;
      `;
      
      await client.query(urlQuery, [url, campaignId, type, priority, 'daily']);
    }
    
    console.log('✅ Seed URLs added');
    
    await client.query('COMMIT');
    
    return campaignId;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to create demo campaign:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Show system statistics
 */
async function showStatistics() {
  console.log('\n📊 System Statistics');
  console.log('='.repeat(60));
  
  try {
    // Attributes by category
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM seo_attribute_definitions
      WHERE active = TRUE
      GROUP BY category
      ORDER BY count DESC;
    `;
    const categories = await pool.query(categoryQuery);
    
    console.log('\n📁 Attributes by Category:');
    for (const row of categories.rows) {
      console.log(`   ${row.category.padEnd(20)} ${row.count.toString().padStart(3)}`);
    }
    
    // Attributes by importance
    const importanceQuery = `
      SELECT importance, COUNT(*) as count
      FROM seo_attribute_definitions
      WHERE active = TRUE
      GROUP BY importance
      ORDER BY 
        CASE importance
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END;
    `;
    const importance = await pool.query(importanceQuery);
    
    console.log('\n⭐ Attributes by Importance:');
    for (const row of importance.rows) {
      console.log(`   ${row.importance.padEnd(20)} ${row.count.toString().padStart(3)}`);
    }
    
    // Campaigns
    const campaignsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE active_mining = TRUE) as mining_enabled
      FROM seo_campaigns;
    `;
    const campaigns = await pool.query(campaignsQuery);
    
    console.log('\n🎯 Campaigns:');
    console.log(`   Total:            ${campaigns.rows[0].total}`);
    console.log(`   Active:           ${campaigns.rows[0].active}`);
    console.log(`   Mining Enabled:   ${campaigns.rows[0].mining_enabled}`);
    
    // Seed URLs
    const urlsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM attribute_seed_urls;
    `;
    const urls = await pool.query(urlsQuery);
    
    console.log('\n🌱 Seed URLs:');
    console.log(`   Total:            ${urls.rows[0].total}`);
    console.log(`   Pending:          ${urls.rows[0].pending}`);
    console.log(`   Completed:        ${urls.rows[0].completed}`);
    
  } catch (error) {
    console.error('❌ Failed to fetch statistics:', error);
  }
}

/**
 * Show API endpoints
 */
function showAPIEndpoints() {
  console.log('\n🌐 API Endpoints Available');
  console.log('='.repeat(60));
  
  const endpoints = [
    { method: 'GET', path: '/api/seo/attributes', desc: 'List all attributes' },
    { method: 'POST', path: '/api/seo/attributes', desc: 'Create attribute' },
    { method: 'GET', path: '/api/seo/attributes/:key', desc: 'Get attribute' },
    { method: 'PUT', path: '/api/seo/attributes/:key', desc: 'Update attribute' },
    { method: 'GET', path: '/api/seo/campaigns', desc: 'List campaigns' },
    { method: 'POST', path: '/api/seo/campaigns', desc: 'Create campaign' },
    { method: 'GET', path: '/api/seo/campaigns/:id', desc: 'Get campaign' },
    { method: 'POST', path: '/api/seo/campaigns/:id/attributes', desc: 'Add attributes' },
    { method: 'POST', path: '/api/seo/campaigns/:id/seed-urls', desc: 'Add URLs' },
    { method: 'GET', path: '/api/seo/campaigns/:id/stats', desc: 'Get stats' }
  ];
  
  console.log('\nCore Endpoints:');
  for (const ep of endpoints) {
    console.log(`   ${ep.method.padEnd(6)} ${ep.path.padEnd(40)} ${ep.desc}`);
  }
}

/**
 * Show next steps
 */
function showNextSteps() {
  console.log('\n📝 Next Steps');
  console.log('='.repeat(60));
  console.log(`
1. Start the API server:
   npm run api

2. Test the attributes endpoint:
   curl http://localhost:3001/api/seo/attributes | jq .

3. View the demo campaign:
   curl http://localhost:3001/api/seo/campaigns | jq .

4. Start the mining service:
   node services/active-data-mining-service.js

5. View comprehensive documentation:
   cat SEO_ATTRIBUTES_SYSTEM.md

6. Integrate with your crawler:
   - Update active-data-mining-service.js
   - Replace extractAttribute() with actual crawler calls
   - Configure selectors per attribute

7. Enable neural network:
   - Implement training loop in neural network service
   - Use nn_training_data table for model training
   - Update mining algorithms based on learned patterns
  `);
}

/**
 * Main setup function
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  SEO Attributes System - Setup & Demo');
  console.log('='.repeat(60));
  
  try {
    // 1. Check database
    const dbOk = await checkDatabase();
    if (!dbOk) {
      console.error('\n❌ Setup failed: Cannot connect to database');
      console.log('Please ensure PostgreSQL is running and credentials are correct.');
      process.exit(1);
    }
    
    // 2. Run migration
    const migrationOk = await runMigration();
    if (!migrationOk) {
      console.error('\n❌ Setup failed: Migration failed');
      process.exit(1);
    }
    
    // 3. Populate attributes
    console.log('\n📥 Populating attributes...');
    await populateAttributes();
    
    // 4. Create demo campaign
    const campaignId = await createDemoCampaign();
    
    // 5. Show statistics
    await showStatistics();
    
    // 6. Show API endpoints
    showAPIEndpoints();
    
    // 7. Show next steps
    showNextSteps();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Setup completed successfully!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
