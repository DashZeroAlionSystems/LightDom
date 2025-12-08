#!/usr/bin/env node

/**
 * Seed from file
 * Usage: node scripts/seed_from_file.js <path-to-file> --instance <instanceId> [--api http://localhost:3001] [--create]
 * If --create is provided and --instance is omitted, the script will create a new seeding config and start it.
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error(
    'Usage: node scripts/seed_from_file.js <file> --instance <instanceId> [--api <apiBase>] [--create]'
  );
  process.exit(1);
}

let fileArg = argv[0];
let instanceId = null;
let apiBase = process.env.API_BASE || 'http://localhost:3001';
let createIfMissing = false;

for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--instance' && argv[i + 1]) {
    instanceId = argv[i + 1];
    i++;
  } else if (a === '--api' && argv[i + 1]) {
    apiBase = argv[i + 1];
    i++;
  } else if (a === '--create') {
    createIfMissing = true;
  }
}

async function main() {
  try {
    const filePath = path.resolve(process.cwd(), fileArg);
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    if ((!instanceId || instanceId.length === 0) && createIfMissing) {
      console.log('Creating new seeding configuration...');
      const now = Date.now();
      const config = {
        instanceId: `auto_seed_${now}`,
        name: `auto_seed_${now}`,
        description: `Auto-created seed instance from file ${path.basename(filePath)}`,
        seeds: [],
        maxSeedsPerInstance: 100000,
        enableSearchAlgorithms: false,
      };

      const resp = await axios.post(`${apiBase}/api/seeding/config`, config).catch(err => {
        console.error(
          'Failed to create seeding config:',
          err?.response?.data || err.message || err
        );
        process.exit(1);
      });

      instanceId = resp.data.config.instanceId || config.instanceId;

      // Start instance
      await axios.post(`${apiBase}/api/seeding/start/${instanceId}`).catch(err => {
        console.warn(
          'Failed to auto-start seeding instance (may need to start manually):',
          err?.response?.data || err.message || err
        );
      });

      console.log('Created instance:', instanceId);
    }

    if (!instanceId) {
      console.error('No instanceId provided and --create not specified. Exiting.');
      process.exit(1);
    }

    console.log(`Seeding ${lines.length} URLs into instance ${instanceId} (api: ${apiBase})`);

    // Chunked insertion with limited concurrency
    const concurrency = 10;
    let idx = 0;

    async function worker() {
      while (idx < lines.length) {
        const i = idx++;
        const url = lines[i];
        try {
          await axios.post(
            `${apiBase}/api/seeding/seeds/${instanceId}`,
            { url, metadata: { source: 'file-import', priority: 5 } },
            { timeout: 15000 }
          );
          if ((i + 1) % 50 === 0) process.stdout.write(`. (${i + 1})`);
        } catch (err) {
          console.error(`\nFailed to add seed ${url}:`, err?.response?.data || err.message || err);
        }
      }
    }

    const workers = new Array(Math.min(concurrency, lines.length)).fill(0).map(() => worker());
    await Promise.all(workers);

    console.log(`\nSeeding complete. Added ${lines.length} URLs to ${instanceId}`);
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
}

main();
