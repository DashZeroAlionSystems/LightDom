#!/usr/bin/env node
// Quick check for SEO training tables
import('pg').then(async ({ Pool }) => {
  const dbName = process.env.DB_NAME || process.env.DB || 'dom_space_harvester';
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: dbName,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const contrib = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.training_contributions`);
    const contribRecent = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.training_contributions WHERE timestamp > NOW() - interval '7 days'`);
    const stats = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.contributor_statistics`);

  console.log('DB:', dbName);
  console.log('training_contributions total:', contrib.rows[0].cnt);
  console.log('training_contributions recent (7d):', contribRecent.rows[0].cnt);
  console.log('contributor_statistics total:', stats.rows[0].cnt);

    // Sample top contributors
    const top = await pool.query(`SELECT contributor_address, total_contributions, total_rewards, avg_quality_score FROM seo_features.contributor_statistics ORDER BY total_contributions DESC LIMIT 5`);
    console.log('Top contributors sample:', top.rows);
  } catch (err) {
    console.error('Error checking tables:', err.message || err);
  } finally {
    await pool.end();
  }
}).catch(err => {
  console.error('Failed to import pg:', err);
  process.exit(1);
});
