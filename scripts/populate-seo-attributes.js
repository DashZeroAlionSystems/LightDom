/**
 * Populate SEO Attribute Definitions from Configuration
 * 
 * Reads config/seo-attributes.json and inserts all 192+ attributes into the database
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Database connection
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
 * Generate SEO rules for an attribute based on its configuration
 */
function generateSEORules(attributeKey, config) {
  const rules = [];
  
  // Title rules
  if (attributeKey === 'title') {
    rules.push({
      rule: 'Title should be unique for each page',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'Include primary keyword near the beginning',
      importance: 'critical',
      weight: 9
    });
    rules.push({
      rule: 'Keep length between 30-60 characters',
      importance: 'critical',
      weight: 10
    });
  }
  
  // Meta description rules
  if (attributeKey === 'metaDescription') {
    rules.push({
      rule: 'Meta description should be unique and compelling',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'Include target keywords naturally',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Keep length between 120-160 characters',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'Include a call-to-action',
      importance: 'high',
      weight: 7
    });
  }
  
  // H1 rules
  if (attributeKey === 'h1Text' || attributeKey === 'h1Count') {
    rules.push({
      rule: 'Use exactly one H1 per page',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'H1 should contain primary keyword',
      importance: 'critical',
      weight: 9
    });
    rules.push({
      rule: 'H1 should be descriptive and clear',
      importance: 'high',
      weight: 8
    });
  }
  
  // Alt text rules
  if (attributeKey.includes('alt') || attributeKey.includes('Alt')) {
    rules.push({
      rule: 'All images must have descriptive alt text',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'Alt text should be concise (50-125 characters)',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Include relevant keywords naturally',
      importance: 'medium',
      weight: 6
    });
  }
  
  // Structured data rules
  if (attributeKey.includes('schema') || attributeKey.includes('Schema') || attributeKey.includes('structured')) {
    rules.push({
      rule: 'Implement relevant schema.org markup',
      importance: 'critical',
      weight: 9
    });
    rules.push({
      rule: 'Validate structured data with Google tools',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Use appropriate schema types for content',
      importance: 'high',
      weight: 8
    });
  }
  
  // Content quality rules
  if (attributeKey === 'wordCount' || attributeKey === 'contentQualityScore') {
    rules.push({
      rule: 'Minimum 300 words for standard pages',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Optimal length 1500-2500 words for blog posts',
      importance: 'medium',
      weight: 6
    });
    rules.push({
      rule: 'Content should be original and valuable',
      importance: 'critical',
      weight: 10
    });
  }
  
  // Link rules
  if (attributeKey.includes('link') || attributeKey.includes('Link')) {
    rules.push({
      rule: 'Use descriptive anchor text',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Maintain good internal to external link ratio (3:1)',
      importance: 'medium',
      weight: 6
    });
    rules.push({
      rule: 'Fix all broken links',
      importance: 'high',
      weight: 9
    });
  }
  
  // Performance rules
  if (config.category === 'performance') {
    rules.push({
      rule: 'Minimize number of HTTP requests',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Optimize and compress resources',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Use async/defer for scripts',
      importance: 'medium',
      weight: 7
    });
  }
  
  // Mobile/Accessibility rules
  if (config.category === 'accessibility') {
    rules.push({
      rule: 'Ensure mobile-friendly design with viewport meta tag',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'Use ARIA attributes appropriately',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Maintain sufficient color contrast',
      importance: 'high',
      weight: 8
    });
  }
  
  // Security rules
  if (config.category === 'security') {
    rules.push({
      rule: 'Use HTTPS for all resources',
      importance: 'critical',
      weight: 10
    });
    rules.push({
      rule: 'Avoid mixed content warnings',
      importance: 'high',
      weight: 9
    });
    rules.push({
      rule: 'Implement security headers',
      importance: 'high',
      weight: 8
    });
  }
  
  // URL structure rules
  if (config.category === 'url_structure') {
    rules.push({
      rule: 'Use clean, descriptive URLs',
      importance: 'high',
      weight: 8
    });
    rules.push({
      rule: 'Keep URL depth shallow (3-4 levels max)',
      importance: 'medium',
      weight: 6
    });
    rules.push({
      rule: 'Use hyphens to separate words',
      importance: 'medium',
      weight: 5
    });
  }
  
  // Add general validation rules based on config
  if (config.validation) {
    if (config.validation.required) {
      rules.push({
        rule: `${attributeKey} is required`,
        importance: 'critical',
        weight: 10
      });
    }
    
    if (config.validation.minLength || config.validation.maxLength) {
      rules.push({
        rule: `Maintain optimal length (${config.validation.minLength || 'any'}-${config.validation.maxLength || 'any'} characters)`,
        importance: config.validation.required ? 'high' : 'medium',
        weight: 7
      });
    }
    
    if (config.validation.optimal) {
      rules.push({
        rule: `Optimal value: ${config.validation.optimal}`,
        importance: 'medium',
        weight: 6
      });
    }
  }
  
  return rules;
}

/**
 * Insert or update an attribute definition
 */
async function upsertAttribute(client, attributeKey, config) {
  const seoRules = generateSEORules(attributeKey, config);
  
  const query = `
    INSERT INTO seo_attribute_definitions (
      attribute_key,
      attribute_id,
      name,
      category,
      selector,
      type,
      ml_weight,
      validation_rules,
      required,
      scraping_method,
      scraping_config,
      feature_type,
      importance,
      normalization,
      seeding_source,
      refresh_frequency,
      quality_threshold,
      seo_rules,
      active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, TRUE
    )
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
    RETURNING id;
  `;
  
  const values = [
    attributeKey,
    config.id,
    attributeKey,
    config.category,
    config.selector,
    config.type,
    config.mlWeight,
    JSON.stringify(config.validation),
    config.validation?.required || false,
    config.scraping.method,
    JSON.stringify(config.scraping),
    config.training.featureType,
    config.training.importance,
    config.training.normalization,
    config.seeding?.source || 'crawler',
    config.seeding?.refreshFrequency || 'daily',
    config.seeding?.qualityThreshold || 0.85,
    JSON.stringify(seoRules)
  ];
  
  const result = await client.query(query, values);
  return result.rows[0];
}

/**
 * Main function to populate all attributes
 */
async function populateAttributes() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Loading SEO attributes configuration...');
    const config = loadAttributesConfig();
    const attributes = config.attributes;
    const attributeKeys = Object.keys(attributes);
    
    console.log(`📊 Found ${attributeKeys.length} attributes to populate`);
    console.log(`📦 Configuration version: ${config.version}`);
    
    // Start transaction
    await client.query('BEGIN');
    
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (const [index, attributeKey] of attributeKeys.entries()) {
      try {
        const attributeConfig = attributes[attributeKey];
        const result = await upsertAttribute(client, attributeKey, attributeConfig);
        
        if (result.id) {
          inserted++;
        } else {
          updated++;
        }
        
        if ((index + 1) % 20 === 0) {
          console.log(`✅ Processed ${index + 1}/${attributeKeys.length} attributes...`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error processing attribute '${attributeKey}':`, error.message);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Attribute Population Complete!');
    console.log('='.repeat(60));
    console.log(`Total attributes: ${attributeKeys.length}`);
    console.log(`Successfully processed: ${inserted + updated}`);
    console.log(`Errors: ${errors}`);
    console.log('='.repeat(60));
    
    // Get category breakdown
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM seo_attribute_definitions
      WHERE active = TRUE
      GROUP BY category
      ORDER BY category;
    `;
    const categoryResult = await client.query(categoryQuery);
    
    console.log('\n📊 Category breakdown:');
    for (const row of categoryResult.rows) {
      console.log(`   ${row.category}: ${row.count}`);
    }
    
    // Get importance breakdown
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
    const importanceResult = await client.query(importanceQuery);
    
    console.log('\n⭐ Importance breakdown:');
    for (const row of importanceResult.rows) {
      console.log(`   ${row.importance}: ${row.count}`);
    }
    
    console.log('\n🎉 All attributes are now in the database and ready to use!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  populateAttributes()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { populateAttributes, generateSEORules };
