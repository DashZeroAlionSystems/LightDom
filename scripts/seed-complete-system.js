#!/usr/bin/env node
/**
 * Complete System Seed Data Script
 * 
 * Seeds the database with:
 * 1. All 192+ SEO attributes from config
 * 2. Crawler Campaign - for web crawling operations
 * 3. Seeding Campaign - for URL seeding and discovery
 * 4. Data Streams Campaign - for data stream processing
 * 5. SEO Campaign - for SEO optimization
 * 
 * Uses existing config and code to populate the system
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { generateSEORules } from './populate-seo-attributes.js';

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
 * Load SEO attributes configuration
 */
function loadAttributesConfig() {
  const configPath = join(__dirname, '../config/seo-attributes.json');
  const data = readFileSync(configPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Populate all attributes from config
 */
async function populateAllAttributes(client) {
  console.log('\n📥 Populating all attributes from config...');
  
  const config = loadAttributesConfig();
  const attributes = config.attributes;
  const attributeKeys = Object.keys(attributes);
  
  console.log(`📊 Found ${attributeKeys.length} attributes to populate`);
  
  let inserted = 0;
  let updated = 0;
  
  for (const attributeKey of attributeKeys) {
    try {
      const attributeConfig = attributes[attributeKey];
      const seoRules = generateSEORules(attributeKey, attributeConfig);
      
      const query = `
        INSERT INTO seo_attribute_definitions (
          attribute_key, attribute_id, name, category, selector, type, ml_weight,
          validation_rules, required, scraping_method, scraping_config,
          feature_type, importance, normalization,
          seeding_source, refresh_frequency, quality_threshold,
          seo_rules, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, TRUE)
        ON CONFLICT (attribute_key) 
        DO UPDATE SET
          attribute_id = EXCLUDED.attribute_id,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          selector = EXCLUDED.selector,
          type = EXCLUDED.type,
          ml_weight = EXCLUDED.ml_weight,
          validation_rules = EXCLUDED.validation_rules,
          required = EXCLUDED.required,
          scraping_method = EXCLUDED.scraping_method,
          scraping_config = EXCLUDED.scraping_config,
          feature_type = EXCLUDED.feature_type,
          importance = EXCLUDED.importance,
          normalization = EXCLUDED.normalization,
          seeding_source = EXCLUDED.seeding_source,
          refresh_frequency = EXCLUDED.refresh_frequency,
          quality_threshold = EXCLUDED.quality_threshold,
          seo_rules = EXCLUDED.seo_rules,
          updated_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const values = [
        attributeKey,
        attributeConfig.id,
        attributeKey,
        attributeConfig.category,
        attributeConfig.selector,
        attributeConfig.type,
        attributeConfig.mlWeight,
        JSON.stringify(attributeConfig.validation),
        attributeConfig.validation?.required || false,
        attributeConfig.scraping.method,
        JSON.stringify(attributeConfig.scraping),
        attributeConfig.training.featureType,
        attributeConfig.training.importance,
        attributeConfig.training.normalization,
        attributeConfig.seeding?.source || 'crawler',
        attributeConfig.seeding?.refreshFrequency || 'daily',
        attributeConfig.seeding?.qualityThreshold || 0.85,
        JSON.stringify(seoRules)
      ];
      
      const result = await client.query(query, values);
      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error processing attribute '${attributeKey}':`, error.message);
    }
  }
  
  console.log(`✅ Attributes populated: ${inserted} inserted, ${updated} updated`);
  return { inserted, updated, total: attributeKeys.length };
}

/**
 * Create a campaign with attributes and seed URLs
 */
async function createCampaign(client, campaignConfig) {
  const {
    name,
    description,
    targetKeywords,
    targetUrls,
    industry,
    attributeKeys,
    seedUrls,
    neuralNetworkEnabled = false,
    activeMining = true
  } = campaignConfig;
  
  console.log(`\n🎯 Creating campaign: ${name}`);
  
  // Check if campaign exists
  const checkQuery = 'SELECT campaign_id FROM seo_campaigns WHERE name = $1';
  const existing = await client.query(checkQuery, [name]);
  
  let campaignId;
  
  if (existing.rows.length > 0) {
    campaignId = existing.rows[0].campaign_id;
    console.log(`ℹ️  Campaign already exists: ${campaignId}`);
  } else {
    // Create campaign
    campaignId = `campaign_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    const campaignQuery = `
      INSERT INTO seo_campaigns (
        campaign_id, name, description, target_keywords, target_urls,
        industry, status, active_mining, neural_network_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING campaign_id;
    `;
    
    await client.query(campaignQuery, [
      campaignId,
      name,
      description,
      targetKeywords,
      targetUrls,
      industry,
      'active',
      activeMining,
      neuralNetworkEnabled
    ]);
    
    console.log(`✅ Created campaign: ${campaignId}`);
  }
  
  // Add attributes to campaign
  console.log(`📋 Adding ${attributeKeys.length} attributes to campaign...`);
  
  let attributesAdded = 0;
  for (const attrKey of attributeKeys) {
    const attrQuery = `
      INSERT INTO campaign_attributes (
        campaign_id, attribute_key, enabled, mine_actively,
        mining_priority, mining_algorithm
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (campaign_id, attribute_key) DO NOTHING;
    `;
    
    const result = await client.query(attrQuery, [
      campaignId,
      attrKey,
      true,
      true,
      attrKey.includes('Score') || attrKey.includes('score') ? 10 : 8,
      neuralNetworkEnabled ? 'neural' : 'rule-based'
    ]);
    
    if (result.rowCount > 0) {
      attributesAdded++;
    }
  }
  
  console.log(`✅ Added ${attributesAdded} attributes to campaign`);
  
  // Add seed URLs
  console.log(`🌱 Adding ${seedUrls.length} seed URLs...`);
  
  let urlsAdded = 0;
  for (const seedUrl of seedUrls) {
    const urlQuery = `
      INSERT INTO attribute_seed_urls (
        url, campaign_id, url_type, priority, depth_limit, crawl_frequency
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (url, campaign_id) DO NOTHING;
    `;
    
    const result = await client.query(urlQuery, [
      seedUrl.url,
      campaignId,
      seedUrl.type || 'target',
      seedUrl.priority || 5,
      seedUrl.depthLimit || 3,
      seedUrl.frequency || 'daily'
    ]);
    
    if (result.rowCount > 0) {
      urlsAdded++;
    }
  }
  
  console.log(`✅ Added ${urlsAdded} seed URLs`);
  
  return campaignId;
}

/**
 * Get attributes by category and importance
 */
function getAttributesByFilter(config, filters = {}) {
  const { category, importance, minWeight } = filters;
  const attributes = config.attributes;
  
  return Object.keys(attributes).filter(key => {
    const attr = attributes[key];
    
    if (category && attr.category !== category) return false;
    if (importance && attr.training.importance !== importance) return false;
    if (minWeight && attr.mlWeight < minWeight) return false;
    
    return true;
  });
}

/**
 * Main seeding function
 */
async function seedCompleteSystem() {
  console.log('\n' + '='.repeat(70));
  console.log('  Complete System Seed Data Script');
  console.log('='.repeat(70));
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Step 1: Populate all attributes
    const attrStats = await populateAllAttributes(client);
    
    // Load config for campaign setup
    const config = loadAttributesConfig();
    
    // Step 2: Create Crawler Campaign
    // Focus on technical attributes needed for crawling
    const crawlerAttributes = [
      ...getAttributesByFilter(config, { category: 'meta' }),
      ...getAttributesByFilter(config, { category: 'headings' }),
      ...getAttributesByFilter(config, { category: 'links' }),
      ...getAttributesByFilter(config, { category: 'url_structure' }),
      'wordCount', 'bodyTextLength', 'paragraphCount',
      'totalImages', 'structuredDataCount'
    ];
    
    await createCampaign(client, {
      name: 'Crawler Campaign',
      description: 'Web crawling operations - extracts core page structure and content',
      targetKeywords: ['crawler', 'web scraping', 'data extraction'],
      targetUrls: ['https://example.com'],
      industry: 'technology',
      attributeKeys: [...new Set(crawlerAttributes)], // Remove duplicates
      seedUrls: [
        { url: 'https://example.com', type: 'target', priority: 10, frequency: 'daily' },
        { url: 'https://example.com/sitemap.xml', type: 'reference', priority: 9, frequency: 'daily' },
        { url: 'https://example.com/blog', type: 'target', priority: 8, frequency: 'daily' }
      ],
      neuralNetworkEnabled: false,
      activeMining: true
    });
    
    // Step 3: Create Seeding Campaign
    // Focus on URL discovery and link analysis
    const seedingAttributes = [
      ...getAttributesByFilter(config, { category: 'links' }),
      ...getAttributesByFilter(config, { category: 'url_structure' }),
      'canonical', 'alternate', 'prevUrl', 'nextUrl',
      'sitemap', 'robotsTxt', 'internalLinksCount', 'externalLinksCount'
    ];
    
    await createCampaign(client, {
      name: 'Seeding Campaign',
      description: 'URL seeding and discovery - finds and prioritizes crawlable URLs',
      targetKeywords: ['url discovery', 'sitemap', 'link analysis'],
      targetUrls: ['https://example.com'],
      industry: 'technology',
      attributeKeys: [...new Set(seedingAttributes)],
      seedUrls: [
        { url: 'https://example.com', type: 'target', priority: 10, frequency: 'hourly', depthLimit: 5 },
        { url: 'https://example.com/sitemap.xml', type: 'reference', priority: 10, frequency: 'hourly' },
        { url: 'https://example.com/robots.txt', type: 'reference', priority: 9, frequency: 'daily' }
      ],
      neuralNetworkEnabled: false,
      activeMining: true
    });
    
    // Step 4: Create Data Streams Campaign
    // Focus on all attributes for comprehensive data collection
    const dataStreamAttributes = Object.keys(config.attributes);
    
    await createCampaign(client, {
      name: 'Data Streams Campaign',
      description: 'Data stream processing - comprehensive attribute extraction and validation',
      targetKeywords: ['data streams', 'real-time processing', 'data quality'],
      targetUrls: ['https://example.com'],
      industry: 'technology',
      attributeKeys: dataStreamAttributes,
      seedUrls: [
        { url: 'https://example.com', type: 'target', priority: 10, frequency: 'hourly' },
        { url: 'https://example.com/api', type: 'target', priority: 9, frequency: 'hourly' },
        { url: 'https://example.com/feed', type: 'target', priority: 8, frequency: 'hourly' },
        { url: 'https://example.com/data', type: 'target', priority: 8, frequency: 'daily' }
      ],
      neuralNetworkEnabled: true,
      activeMining: true
    });
    
    // Step 5: Create SEO Campaign
    // Focus on critical SEO attributes and scores
    const seoAttributes = [
      ...getAttributesByFilter(config, { importance: 'critical' }),
      ...getAttributesByFilter(config, { importance: 'high' }),
      ...getAttributesByFilter(config, { category: 'scores' }),
      ...getAttributesByFilter(config, { category: 'structured_data' }),
      ...getAttributesByFilter(config, { category: 'accessibility' }),
      ...getAttributesByFilter(config, { category: 'performance' }),
      ...getAttributesByFilter(config, { category: 'security' })
    ];
    
    await createCampaign(client, {
      name: 'SEO Campaign',
      description: 'SEO optimization - monitors and improves search engine ranking factors',
      targetKeywords: ['seo', 'search optimization', 'ranking', 'serp'],
      targetUrls: ['https://example.com'],
      industry: 'technology',
      attributeKeys: [...new Set(seoAttributes)],
      seedUrls: [
        { url: 'https://example.com', type: 'target', priority: 10, frequency: 'daily' },
        { url: 'https://example.com/products', type: 'target', priority: 9, frequency: 'daily' },
        { url: 'https://example.com/services', type: 'target', priority: 9, frequency: 'daily' },
        { url: 'https://example.com/about', type: 'target', priority: 7, frequency: 'weekly' },
        { url: 'https://competitor1.com', type: 'competitor', priority: 6, frequency: 'weekly' },
        { url: 'https://competitor2.com', type: 'competitor', priority: 6, frequency: 'weekly' }
      ],
      neuralNetworkEnabled: true,
      activeMining: true
    });
    
    await client.query('COMMIT');
    
    // Show final statistics
    console.log('\n' + '='.repeat(70));
    console.log('📊 Final System Statistics');
    console.log('='.repeat(70));
    
    // Attributes
    const attrQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE active = TRUE) as active,
        COUNT(*) FILTER (WHERE importance = 'critical') as critical,
        COUNT(*) FILTER (WHERE importance = 'high') as high
      FROM seo_attribute_definitions;
    `;
    const attrResult = await client.query(attrQuery);
    
    console.log('\n📋 Attributes:');
    console.log(`   Total:      ${attrResult.rows[0].total}`);
    console.log(`   Active:     ${attrResult.rows[0].active}`);
    console.log(`   Critical:   ${attrResult.rows[0].critical}`);
    console.log(`   High:       ${attrResult.rows[0].high}`);
    
    // Categories
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM seo_attribute_definitions
      WHERE active = TRUE
      GROUP BY category
      ORDER BY count DESC;
    `;
    const categories = await client.query(categoryQuery);
    
    console.log('\n📁 Attributes by Category:');
    for (const row of categories.rows) {
      console.log(`   ${row.category.padEnd(20)} ${row.count.toString().padStart(3)}`);
    }
    
    // Campaigns
    const campaignQuery = `
      SELECT 
        c.name,
        c.campaign_id,
        COUNT(DISTINCT ca.attribute_key) as attributes,
        COUNT(DISTINCT asu.url) as seed_urls,
        c.neural_network_enabled,
        c.active_mining
      FROM seo_campaigns c
      LEFT JOIN campaign_attributes ca ON c.campaign_id = ca.campaign_id
      LEFT JOIN attribute_seed_urls asu ON c.campaign_id = asu.campaign_id
      GROUP BY c.id, c.name, c.campaign_id, c.neural_network_enabled, c.active_mining
      ORDER BY c.created_at;
    `;
    const campaigns = await client.query(campaignQuery);
    
    console.log('\n🎯 Campaigns Created:');
    for (const row of campaigns.rows) {
      console.log(`\n   ${row.name}`);
      console.log(`     Campaign ID:     ${row.campaign_id}`);
      console.log(`     Attributes:      ${row.attributes}`);
      console.log(`     Seed URLs:       ${row.seed_urls}`);
      console.log(`     Neural Network:  ${row.neural_network_enabled ? 'Yes' : 'No'}`);
      console.log(`     Active Mining:   ${row.active_mining ? 'Yes' : 'No'}`);
    }
    
    // Total seed URLs
    const urlQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE url_type = 'target') as targets,
        COUNT(*) FILTER (WHERE url_type = 'competitor') as competitors,
        COUNT(*) FILTER (WHERE url_type = 'reference') as references
      FROM attribute_seed_urls;
    `;
    const urls = await client.query(urlQuery);
    
    console.log('\n🌱 Total Seed URLs:');
    console.log(`   Total:         ${urls.rows[0].total}`);
    console.log(`   Targets:       ${urls.rows[0].targets}`);
    console.log(`   Competitors:   ${urls.rows[0].competitors}`);
    console.log(`   References:    ${urls.rows[0].references}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Complete system seeding successful!');
    console.log('='.repeat(70));
    
    console.log('\n📝 Next Steps:');
    console.log('1. Start the API server: npm run api');
    console.log('2. View campaigns: curl http://localhost:3001/api/seo/campaigns | jq .');
    console.log('3. Start mining service: node services/active-data-mining-service.js');
    console.log('4. Check campaign stats: curl http://localhost:3001/api/seo/campaigns/{id}/stats | jq .');
    console.log('');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCompleteSystem()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { seedCompleteSystem };
