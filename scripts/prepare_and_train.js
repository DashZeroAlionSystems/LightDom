#!/usr/bin/env node
// Prepare dataset from seo_features.training_contributions (quality_score >= 70),
// run the Python trainer, and insert a model run record into the DB.

const { Pool } = require('pg');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function main() {
  await pool.query('SELECT 1');
  console.log('✅ Connected to DB');

  const q = `
    SELECT url, features_provided, quality_score
    FROM seo_features.training_contributions
    WHERE quality_score >= 70
    ORDER BY RANDOM()
    LIMIT 10000
  `;

  const res = await pool.query(q);
  const rows = res.rows || [];
  console.log('Found', rows.length, 'high-quality training contributions');

  const modelsDir = path.join(process.cwd(), '.data', 'models');
  fs.mkdirSync(modelsDir, { recursive: true });
  const datasetPath = path.join(modelsDir, `training_data_local_${Date.now()}.json`);

  fs.writeFileSync(datasetPath, JSON.stringify(rows, null, 2), 'utf8');
  console.log('Wrote dataset to', datasetPath);

  // Determine python executable
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  const trainerPath = path.join(__dirname, '..', 'src', 'seo', 'ml', 'train_seo_model.py');
  if (!fs.existsSync(trainerPath)) {
    console.error('Training script not found at', trainerPath);
    process.exit(2);
  }

  const args = [trainerPath, '--dataset', datasetPath, '--model-name', 'demo_seo', '--model-version', 'v1', '--algorithm', 'neural_network', '--hyperparameters', JSON.stringify({ learningRate: 0.001 })];

  console.log('Spawning trainer:', pythonCmd, args.join(' '));

  const child = spawn(pythonCmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (d) => { stdout += d.toString(); process.stdout.write(d); });
  child.stderr.on('data', (d) => { stderr += d.toString(); process.stderr.write(d); });

  child.on('close', async (code) => {
    if (code !== 0) {
      console.error('Trainer exited with code', code);
      process.exit(3);
    }

    try {
      const parsed = JSON.parse(stdout);
      if (!parsed.success) {
        console.error('Trainer reported failure:', parsed.error || parsed);
        process.exit(4);
      }

      console.log('Trainer output parsed OK. ModelPath:', parsed.modelPath);

      // Insert model run record into DB
      const insert = `
        INSERT INTO seo_features.model_training_runs (model_name, model_version, dataset_size, features_used, hyperparameters, accuracy_score, model_hash, status, created_at, training_start_date, training_end_date)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'completed',NOW(),NOW()-interval '1 minute', NOW()) RETURNING id
      `;

      const runRes = await pool.query(insert, [
        parsed.modelName || 'demo_seo',
        parsed.modelVersion || 'v1',
        parsed.datasetSize || rows.length,
        JSON.stringify(parsed.featureImportance ? parsed.featureImportance.map(f=>f.feature) : []),
        JSON.stringify({ algorithm: parsed.algorithm || 'neural_network' }),
        parsed.accuracy || 0,
        parsed.modelHash || null
      ]);

      console.log('Inserted model_training_runs id:', runRes.rows[0].id);
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.error('Failed to parse trainer output or insert record:', err);
      process.exit(5);
    }
  });
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
