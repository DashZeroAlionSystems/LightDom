#!/usr/bin/env node
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function tableCount(name) {
  try {
    const res = await pool.query(`SELECT COUNT(*)::int as c FROM ${name}`);
    return res.rows[0].c;
  } catch (e) {
    return null;
  }
}

async function run() {
  try {
    const analytics = await tableCount('seo_analytics');
    const training = await tableCount('seo_training_data');
    const mining = await tableCount('seo_mining_results');

    console.log('seo_analytics:', analytics === null ? 'MISSING' : analytics);
    console.log('seo_training_data:', training === null ? 'MISSING' : training);
    console.log('seo_mining_results:', mining === null ? 'MISSING' : mining);
  } catch (err) {
    console.error('DB check failed', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
