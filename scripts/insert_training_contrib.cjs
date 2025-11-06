#!/usr/bin/env node
// Insert a high-quality training contribution for local testing
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

(async function(){
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to DB');

    const sampleFeatures = {
      url_length: 20,
      url_has_https: true,
      lcp: 1200,
      cls: 0.02,
      total_elements: 1200,
      unused_elements: 50,
      space_saved: 512
    };

    const crypto = require('crypto');

    const insert = `
      INSERT INTO seo_features.training_contributions (url, keyword, contributor_address, features_provided, quality_score, reward_amount, blockchain_tx_hash, data_hash, timestamp, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING id
    `;

    const featuresJson = JSON.stringify(sampleFeatures);
    const hash = crypto.createHash('sha256').update(featuresJson).digest('hex');

    const values = [
      'https://example.com/demo-high-quality',
      'demo',
      '0x0000000000000000000000000000000000000000',
      featuresJson,
      85,
      0,
      null,
      hash
    ];

    const res = await pool.query(insert, values);
    console.log('Inserted training_contribution id:', res.rows[0].id);
  } catch (err) {
    console.error('Error inserting training contribution:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
