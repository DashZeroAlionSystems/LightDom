#!/usr/bin/env node

/**
 * Script to manually start default seeding instances from config/data-mining-config.json
 * Usage: node scripts/start-default-seeding.js [--api http://localhost:3001]
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const apiBase =
  process.env.API_BASE || process.argv.includes('--api')
    ? process.argv[process.argv.indexOf('--api') + 1]
    : 'http://localhost:3001';

async function main() {
  try {
    const cfgPath = path.resolve(process.cwd(), 'config/data-mining-config.json');
    const raw = await fs.readFile(cfgPath, 'utf-8');
    const cfg = JSON.parse(raw);
    const mining = cfg.miningInstances || {};

    for (const [instanceKey, inst] of Object.entries(mining)) {
      if (!inst || !inst.enableAutoSeeding) continue;
      const instanceId = inst.instanceId || instanceKey;
      const payload = {
        instanceId,
        name: inst.name || `auto_${instanceId}`,
        seeds: inst.seedUrls || inst.seeds || [],
      };

      try {
        await axios.post(`${apiBase}/api/seeding/config`, payload);
        await axios.post(`${apiBase}/api/seeding/start/${instanceId}`);
        console.log('Started seeding instance:', instanceId);
      } catch (err) {
        console.warn(
          'Failed to start instance',
          instanceId,
          err?.response?.data || err.message || err
        );
      }
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
