#!/usr/bin/env node
import { Pool } from 'pg';
import HeadlessExtractor from '../crawler/headlessExtractor.js';

async function main() {
  const url = process.argv[2] || process.env.TARGET_URL;
  if (!url) {
    console.error('Usage: node workers/headless-worker.js <url>  OR set TARGET_URL env var');
    process.exit(2);
  }

  const extractor = new HeadlessExtractor();
  try {
    console.log('Worker: extracting', url);
    const analysis = await extractor.extract(url, { timeout: 60000 });

    // If API_URL is provided, attempt to POST results to the internal API
    const apiUrl = process.env.API_URL || process.env.INTERNAL_API_URL;
    if (apiUrl) {
      try {
        const body = {
          url,
          analysis,
          schemas: analysis.schemas || [],
          backlinks: analysis.backlinks || [],
        };
        const r = await fetch(`${apiUrl.replace(/\/$/, '')}/internal/worker/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!r.ok) console.warn('Worker: failed to POST result to API', r.status);
        else console.log('Worker: posted result to API');
      } catch (err) {
        console.warn('Worker: API post failed', err && err.message ? err.message : err);
      }
    }

    // If DB is available, write a minimal seo_mining_results row
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      try {
        const pool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME || 'dom_space_harvester',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
        });
        const query = `INSERT INTO seo_mining_results (url, attributes, seo_score, sampled_at) VALUES ($1,$2,$3,NOW()) RETURNING id`;
        const features = analysis ? JSON.stringify(analysis) : JSON.stringify({});
        const seoScore = 0; // worker does not compute final score; SEOCrawlerIntegration or API will do that
        const res = await pool.query(query, [url, features, seoScore]);
        console.log('Worker: inserted seo_mining_results id=', res.rows[0].id);
        await pool.end();
      } catch (err) {
        console.warn('Worker: DB write failed', err && err.message ? err.message : err);
      }
    }

    // Fallback: log results locally (trimmed)
    console.log('Worker: analysis', JSON.stringify(analysis, null, 2).slice(0, 2000));
  } catch (err) {
    console.error('Worker failed:', err && err.message ? err.message : err);
  } finally {
    try {
      await extractor.close();
    } catch (e) {}
    process.exit(0);
  }
}

main();
