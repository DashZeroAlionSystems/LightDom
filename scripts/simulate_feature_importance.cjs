// Simple script to upsert sample feature importance rows into seo_features.feature_usage_stats
// Usage: node ./scripts/simulate_feature_importance.cjs

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dom_space_harvester';

(async () => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    console.log('Connecting to DB:', DATABASE_URL.split('@').pop());
    await pool.query('SELECT 1');

    const sample = [
      { feature: 'domain_authority', importance: 0.15 },
      { feature: 'content_quality_score', importance: 0.13 },
      { feature: 'total_backlinks', importance: 0.09 }
    ];

    for (const f of sample) {
      const q = `
        INSERT INTO seo_features.feature_usage_stats (feature_name, usage_count, importance_score, last_updated)
        VALUES ($1, 1, $2, NOW())
        ON CONFLICT (feature_name) DO UPDATE SET
          usage_count = seo_features.feature_usage_stats.usage_count + 1,
          importance_score = ((seo_features.feature_usage_stats.importance_score * seo_features.feature_usage_stats.usage_count) + EXCLUDED.importance_score) / (seo_features.feature_usage_stats.usage_count + 1),
          last_updated = NOW()
      `;
      await pool.query(q, [f.feature, f.importance]);
      console.log('Upserted feature importance for', f.feature);
    }

    const res = await pool.query('SELECT feature_name, usage_count, importance_score FROM seo_features.feature_usage_stats ORDER BY importance_score DESC LIMIT 10');
    console.table(res.rows);
  } catch (err) {
    console.error('Error running simulate_feature_importance:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
