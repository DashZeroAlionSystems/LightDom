#!/usr/bin/env node

// Manually test the autopilot ticket creation function
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

async function run(cmd, opts = {}) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024, ...opts });
    return { ok: true, stdout, stderr };
  } catch (e) {
    return { ok: false, stdout: e.stdout || '', stderr: e.stderr || e.message };
  }
}

async function enqueueTicketsFromCompliance(text) {
  try {
    const items = [];
    const add = (title, description) => items.push({ title, description });

    if (/Electron not working|Electron not installed/i.test(text)) {
      add('Fix Electron runtime availability', 'Ensure Electron is installed and accessible (global or npx). Update scripts and CI to verify electron --version.');
    }
    if (/API server using mock|mock.*data|fake.*data|Using fake API server|mock API server/i.test(text)) {
      add('Switch to real API server', 'Replace simple-api-server.js with api-server-express.js in all start scripts and ensure health endpoint returns real data.');
    }
    if (/Frontend not accessible|Frontend.*not.*accessible|blank|white screen/i.test(text)) {
      add('Restore frontend accessibility', 'Resolve Vite/dev server startup and port conflicts; verify http://localhost:3000 reachable and styled.');
    }
    if (/API server cannot start|API server startup failed/i.test(text)) {
      add('Fix API server startup', 'API server cannot start - investigate and fix startup issues. Check port conflicts, dependencies, and configuration.');
    }
    if (/Database: Broken|PostgreSQL not running|Database not running/i.test(text)) {
      add('Start and connect to PostgreSQL/Redis', 'Spin up postgres/redis via docker-compose and add graceful fallbacks.');
    }

    if (items.length === 0) {
      // Generic ticket as fallback
      add('Investigate failing compliance checks', 'Review automation output and logs to identify root causes; fix services until compliance passes.');
    }

    console.log(`Found ${items.length} tickets to create:`, items.map(i => i.title));

    const port = process.env.TICKET_QUEUE_PORT || 3099;
    for (const it of items) {
      console.log(`Creating ticket: ${it.title}`);
      const response = await fetch(`http://localhost:${port}/api/tickets/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: it.title, description: it.description, priority: 'High' })
      });
      const result = await response.json();
      console.log(`✅ ${it.title}:`, result);
    }
    console.log(`Queued ${items.length} ticket(s) from compliance output`);
  } catch (e) {
    console.error(`Failed to enqueue tickets from compliance: ${e.message}`);
  }
}

async function main() {
  console.log('🧪 Testing Manual Autopilot Ticket Creation...');
  
  // Run compliance check
  console.log('1. Running compliance check...');
  const comp = await run('npm run compliance:check');
  const output = (comp.stdout || '') + (comp.stderr || '');
  console.log('Compliance output length:', output.length);
  
  // Check if it found critical issues
  const failed = /❌|CRITICAL|🚨/.test(output);
  console.log('Found critical issues:', failed);
  
  if (failed) {
    console.log('2. Creating tickets from compliance output...');
    await enqueueTicketsFromCompliance(output);
  }
  
  // Check final status
  const statusResponse = await fetch('http://localhost:3099/api/tickets/status');
  const status = await statusResponse.json();
  console.log('📊 Final queue status:', status);
}

main().catch(console.error);
