// seeds a sample model_training_runs row and feature_usage_stats upserts for local dev verification
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to DB');

    // Insert a model training run
    const insertRun = `
      INSERT INTO seo_features.model_training_runs (
        model_name, model_version, dataset_size, features_used, hyperparameters,
        training_start_date, training_end_date, status, accuracy_score, model_hash, blockchain_tx_hash, created_at
      ) VALUES ($1,$2,$3,$4,$5,NOW()-interval '1 hour', NOW(), 'completed', $6, $7, $8, NOW())
      RETURNING id
    `;

    const featuresUsed = JSON.stringify(['feature_1','feature_2','feature_3']);
    const hyperparams = JSON.stringify({ learningRate: 0.01, nEstimators: 100 });
    const modelHash = 'QmTestModelHash1234567890';

    const runRes = await pool.query(insertRun, [
      'seo_model_seed', 'v1', 1234, featuresUsed, hyperparams, 0.8234, modelHash, null
    ]);

    const runId = runRes.rows[0].id;
    console.log('Inserted model_training_runs id:', runId);

    // Upsert some feature importance into feature_usage_stats
    const featureImportance = [
      { feature: 'domain_authority', importance: 0.145 },
      { feature: 'content_quality_score', importance: 0.132 },
      { feature: 'total_backlinks', importance: 0.098 }
    ];

    for (const fi of featureImportance) {
      const upsert = `
        INSERT INTO seo_features.feature_usage_stats (feature_name, usage_count, importance_score, last_updated)
        VALUES ($1, 1, $2, NOW())
        ON CONFLICT (feature_name) DO UPDATE SET
          usage_count = seo_features.feature_usage_stats.usage_count + 1,
          importance_score = ((seo_features.feature_usage_stats.importance_score * seo_features.feature_usage_stats.usage_count) + EXCLUDED.importance_score) / (seo_features.feature_usage_stats.usage_count + 1),
          last_updated = NOW()
      `;
      await pool.query(upsert, [fi.feature, fi.importance]);
      console.log('Upserted feature importance for', fi.feature);
    }

    // Report counts
    const contrib = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.training_contributions`);
    const runs = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.model_training_runs`);
    const stats = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.feature_usage_stats`);
    const contribRecent = await pool.query(`SELECT COUNT(*) as cnt FROM seo_features.training_contributions WHERE timestamp > NOW() - interval '7 days'`);

    console.log('training_contributions total:', contrib.rows[0].cnt);
    console.log('training_contributions recent (7d):', contribRecent.rows[0].cnt);
    console.log('model_training_runs total:', runs.rows[0].cnt);
    console.log('feature_usage_stats total:', stats.rows[0].cnt);

  } catch (err) {
    console.error('Error seeding ML tables:', err);
  } finally {
    await pool.end();
    console.log('🛑 DB connection closed');
  }
})();
