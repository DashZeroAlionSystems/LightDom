#!/usr/bin/env node
import fs from 'fs';
import fetch from 'node-fetch';
const cfgPath = process.argv[2] || 'config/mining_job_example.json';
if (!fs.existsSync(cfgPath)) {
  console.error('Config not found:', cfgPath);
  process.exit(2);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const API = process.env.LIGHTDOM_API || 'http://localhost:3060';
(async () => {
  const res = await fetch(`${API}/api/mining-jobs/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  const j = await res.json();
  console.log('Enqueue response:', j);
})();
