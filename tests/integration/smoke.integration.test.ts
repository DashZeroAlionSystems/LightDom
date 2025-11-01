import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';
import { test, expect } from 'vitest';

const execAsync = promisify(exec);

test('smoke_crawler_write populates seo_features.training_contributions', async () => {
  // Run the smoke script (it applies migrations best-effort and inserts a sample row)
  const cmd = 'node ./scripts/smoke_crawler_write.js';
  const { stdout, stderr } = await execAsync(cmd, { timeout: 120000 });
  console.log(stdout);
  if (stderr) console.error(stderr);

  // Connect to DB using env or defaults consistent with scripts
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    const res = await pool.query(`SELECT COUNT(*) AS cnt FROM seo_features.training_contributions`);
    const cnt = Number(res.rows[0].cnt);
    console.log('training_contributions count:', cnt);
    expect(cnt).toBeGreaterThan(0);
  } finally {
    await pool.end();
  }
}, 180000);
