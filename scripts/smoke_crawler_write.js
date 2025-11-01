#!/usr/bin/env node
// Smoke test: write a sample crawl result using SEOCrawlerIntegration and verify canonical insert

import SEOCrawlerIntegration from '../crawler/SEOCrawlerIntegration.js';

(async () => {
  const integration = new SEOCrawlerIntegration();

  const sample = {
    url: 'https://example.com/sample-page',
    analysis: {
      pageTitle: 'Sample Page',
      metaDescription: 'This is a sample page for smoke testing the crawler integration',
      performance: { lcp: 1200, fid: 30, cls: 0.02, ttfb: 100, fcp: 400, score: 85 },
      domStats: { totalElements: 2000, unusedElements: 200, deadCSS: 2, orphanedJS: 1, memoryLeaks: 0 },
      spaceSaved: 512,
      optimizations: [{ type: 'remove-dead-css', savings: 256 }]
    },
    schemas: [{ '@type': 'Article' }],
    backlinks: [{ href: 'https://example.com/other' }, { href: 'https://external.com/page' }],
    merkleRoot: null,
    contributorAddress: '0x0000000000000000000000000000000000000000',
    keyword: 'sample'
  };

  try {
    // Ensure core SEO schemas exist (best-effort): seo_service and seo_features
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const seoServicePath = path.join(process.cwd(), 'database', 'seo_service_schema.sql');
      const trainingPath = path.join(process.cwd(), 'src', 'seo', 'database', 'training-data-migrations.sql');

      try {
        const seoSql = await fs.readFile(seoServicePath, 'utf8');
        if (seoSql && seoSql.trim()) {
          console.log('Applying seo_service schema (best-effort). If privileged statements fail they will be ignored.');
          try {
            await integration.pool.query(seoSql);
          } catch (applyErr) {
            console.warn('Applying full seo_service schema failed (this may require superuser privileges). Creating minimal seo_training_data table for smoke test...');
            // Create a minimal seo_training_data table sufficient for the crawler's insert
            const minimal = `
              CREATE TABLE IF NOT EXISTS seo_training_data (
                id SERIAL PRIMARY KEY,
                client_id TEXT,
                url TEXT NOT NULL,
                features JSONB NOT NULL,
                ranking_before INTEGER,
                ranking_after INTEGER,
                seo_score_before DECIMAL(5,2),
                seo_score_after DECIMAL(5,2),
                optimization_type VARCHAR(100),
                optimization_details JSONB,
                effectiveness_score DECIMAL(5,2),
                verified BOOLEAN DEFAULT FALSE,
                blockchain_proof_hash VARCHAR(66),
                blockchain_tx_hash VARCHAR(66),
                reward_amount DECIMAL(18,8),
                quality_score DECIMAL(5,2),
                created_at TIMESTAMP DEFAULT NOW()
              );
            `;
            await integration.pool.query(minimal);
            // Ensure required columns exist in case an older, different schema exists
            const ensureCols = `
              ALTER TABLE seo_training_data
                ADD COLUMN IF NOT EXISTS features JSONB,
                ADD COLUMN IF NOT EXISTS seo_score_before DECIMAL(5,2),
                ADD COLUMN IF NOT EXISTS seo_score_after DECIMAL(5,2),
                ADD COLUMN IF NOT EXISTS optimization_type VARCHAR(100),
                ADD COLUMN IF NOT EXISTS optimization_details JSONB,
                ADD COLUMN IF NOT EXISTS effectiveness_score DECIMAL(5,2),
                ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2),
                ADD COLUMN IF NOT EXISTS blockchain_proof_hash VARCHAR(66),
                ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66),
                ADD COLUMN IF NOT EXISTS reward_amount DECIMAL(18,8),
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
            `;
            try {
              await integration.pool.query(ensureCols);
            } catch (e) {
              // non-fatal if ALTER fails
            }
            // Ensure 'domain' exists (older schemas may include it as NOT NULL)
            try {
              await integration.pool.query(`ALTER TABLE seo_training_data ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT '';`);
              try { await integration.pool.query(`ALTER TABLE seo_training_data ALTER COLUMN domain DROP NOT NULL;`); } catch(e) { /* ignore */ }
            } catch(e) { /* ignore */ }
          }
        }
      } catch (e) {
        // ignore if file missing
      }

      try {
        const trainSql = await fs.readFile(trainingPath, 'utf8');
        if (trainSql && trainSql.trim()) {
          console.log('Applying seo_features training migrations (if missing)...');
          await integration.pool.query(trainSql);
        }
      } catch (e) {
        // ignore if file missing
      }
    } catch (e) {
      console.warn('Could not apply schema files automatically:', e.message);
    }

    const id = await integration.saveSEOTrainingData(sample);
    console.log('Saved seo_training_data id:', id);

    // Verify canonical table
    const verifyQuery = `SELECT id, url, keyword, contributor_address, quality_score FROM seo_features.training_contributions WHERE url = $1 LIMIT 1`;
    try {
      const res = await integration.pool.query(verifyQuery, [sample.url]);
      if (res.rows && res.rows.length > 0) {
        console.log('Found training contribution:', res.rows[0]);
      } else {
        console.error('No training contribution found for url:', sample.url);
        process.exitCode = 2;
      }
    } catch (err) {
      // If the schema/table doesn't exist, attempt to apply migrations (best-effort)
      if (err && err.code === '42P01') {
        console.log('Training table not found, attempting to apply migrations from src/seo/database/training-data-migrations.sql');
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const sqlPath = path.join(process.cwd(), 'src', 'seo', 'database', 'training-data-migrations.sql');
          const sql = await fs.readFile(sqlPath, 'utf8');
          await integration.pool.query(sql);
          console.log('Applied training-data migrations, retrying verification...');
          const retry = await integration.pool.query(verifyQuery, [sample.url]);
          if (retry.rows && retry.rows.length > 0) {
            console.log('Found training contribution after migration:', retry.rows[0]);
          } else {
            console.error('Still no training contribution found after applying migrations.');
            process.exitCode = 3;
          }
        } catch (mErr) {
          console.error('Failed to apply migrations or verify table:', mErr);
          process.exitCode = 4;
        }
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exitCode = 1;
  } finally {
    await integration.close();
  }
})();
