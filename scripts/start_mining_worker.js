#!/usr/bin/env node
import CommerceBridgeMiner from '../services/commerce-bridge-miner.js';
const args = process.argv.slice(2);
const urlArgIndex = args.indexOf('--url');
const clientArgIndex = args.indexOf('--clientId');
const url = urlArgIndex >= 0 ? args[urlArgIndex + 1] : null;
const clientId = clientArgIndex >= 0 ? args[clientArgIndex + 1] : 'demo_client';

(async () => {
  if (!url) {
    console.error('Usage: node scripts/start_mining_worker.js --url <url> --clientId <clientId>');
    process.exit(2);
  }
  const miner = new CommerceBridgeMiner();
  console.log('Running single-run miner for', url);
  try {
    const r = await miner.createBridgeStoreFromSite(clientId, url, {
      bridgeName: `AutoStore for ${clientId}`,
    });
    console.log('Result:', r);
  } catch (e) {
    console.error('Mining failed:', e?.message || e);
    process.exit(1);
  }
  process.exit(0);
})();
