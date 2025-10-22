#!/usr/bin/env node

// Unified non-interactive autopilot entry
// Orchestrates: services -> autopilot rounds -> compliance -> exit code

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import process from 'process';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

async function run(cmd, opts = {}) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024, ...opts });
    return { ok: true, stdout, stderr };
  } catch (e) {
    return { ok: false, stdout: e.stdout || '', stderr: e.stderr || e.message };
  }
}

async function ensureDeps() {
  const list = await run('npm list --depth=0');
  if (!list.ok) {
    log('Installing dependencies...');
    const install = await run('npm install --legacy-peer-deps');
    if (!install.ok) throw new Error('Dependency installation failed');
  }
}

async function ensureElectronInstalled() {
  const local = await run('npx electron --version');
  if (local.ok) {
    log(`Electron available (local): ${local.stdout.trim()}`);
    return;
  }
  const global = await run('electron --version');
  if (global.ok) {
    log(`Electron available (global): ${global.stdout.trim()}`);
    return;
  }
  log('Electron not found, installing globally...');
  await run('npm install -g electron');
}

async function httpGet(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => resolve({ ok: (res.statusCode || 0) < 500, status: res.statusCode }));
    req.on('error', () => resolve({ ok: false }));
    req.setTimeout(timeoutMs, () => { try { req.destroy(); } catch {} resolve({ ok: false }); });
  });
}

async function ensureTicketQueueHealthy() {
  const port = process.env.TICKET_QUEUE_PORT || 3099;
  const statusUrl = `http://localhost:${port}/api/tickets/status`;
  const healthy = await httpGet(statusUrl);
  if (healthy.ok) {
    log(`Ticket queue healthy at ${statusUrl}`);
    return true;
  }
  log('Ticket queue not running. Starting it...');
  // Start in background without blocking
  try {
    const p = spawn('node', ['scripts/ticket-queue-server.js'], {
      cwd: process.cwd(),
      stdio: 'ignore',
      detached: true,
      shell: false
    });
    p.unref();
  } catch (e) {
    log(`Failed to start ticket queue: ${e.message}`, 'warn');
  }
  // Wait until healthy (up to ~15s)
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const check = await httpGet(statusUrl);
    if (check.ok) {
      log('Ticket queue is now healthy');
      return true;
    }
  }
  log('Ticket queue failed to become healthy', 'warn');
  return false;
}

async function startServices() {
  // Use the existing complete system starter which manages readiness
  log('Starting core services...');
  const start = await run('node start-complete-system.js');
  // Note: start-complete-system keeps running; in CI you may want it in background.
  return start;
}

async function runAutopilotRounds() {
  const state = await readState();
  const maxRounds = Number(process.env.AUTOMATION_MAX_ROUNDS || 5);
  const startRound = Number(state?.nextRound || 1);
  for (let round = startRound; round <= maxRounds; round++) {
    log(`Autopilot round ${round}/${maxRounds} - running compliance check`);
    const comp = await run('npm run compliance:check');
    const output = (comp.stdout || '') + (comp.stderr || '');
    const failed = /❌|CRITICAL|🚨/.test(output);
    if (comp.ok && !failed) {
      log('All checks passing. Autopilot success.');
      await writeState({ nextRound: 1, lastSuccessAt: Date.now(), lastTicketSummary: await summarizeTicketsSafe() });
      return true;
    }
    log('Checks not yet passing. Creating actionable tickets from compliance output...');
    await ensureTicketQueueHealthy();
    await enqueueTicketsFromCompliance(output);
    log('Triggering agent and Linear pipeline, then retrying...');
    await run('node scripts/automation/autopilot.js');
    // Run enhanced automation with Linear to create issues, branches, and PRs as needed
    await ensureTicketQueueHealthy();
    await run('npm run automation:cursor-linear');
    // If things still look off, run diagnostics (won't fail pipeline)
    await run('npm run diagnose:agent');
    await writeState({ nextRound: round + 1, lastFailureAt: Date.now(), lastTicketSummary: await summarizeTicketsSafe() });
  }
  return false;
}

// =========================
// Persistence of state
// =========================
const STATE_DIR = path.join(process.cwd(), '.autopilot');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

async function readState() {
  try {
    const text = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(text);
  } catch {
    return { nextRound: 1 };
  }
}

async function writeState(partial) {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    const prev = await readState();
    const merged = { ...prev, ...partial };
    await fs.writeFile(STATE_FILE, JSON.stringify(merged, null, 2));
  } catch (e) {
    log(`Failed to write state: ${e.message}`);
  }
}

// =========================
// Ticket summary for resume
// =========================
async function summarizeTicketsSafe() {
  try {
    if (!process.env.LINEAR_API_KEY) return null;
    const { LinearClient } = await import('@linear/sdk');
    const client = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
    const teams = await client.teams();
    const team = teams.nodes[0];
    if (!team) return null;
    const label = (process.env.TICKETS_LABEL || 'automation').toLowerCase();
    const issuesRes = await client.issues({ first: 100, filter: { team: { id: { eq: team.id } } } });
    const issues = (issuesRes.nodes || []).filter(i => (i.labels?.nodes || []).some(l => (l.name || '').toLowerCase() === label));
    const byState = new Map();
    for (const i of issues) {
      const s = i.state?.name || 'Unknown';
      byState.set(s, (byState.get(s) || 0) + 1);
    }
    return { total: issues.length, byState: Object.fromEntries(byState) };
  } catch (e) {
    log(`Ticket summary failed: ${e.message}`);
    return null;
  }
}

// =========================
// Create tickets from compliance output
// =========================
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

    const port = process.env.TICKET_QUEUE_PORT || 3099;
    for (const it of items) {
      await fetch(`http://localhost:${port}/api/tickets/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: it.title, description: it.description, priority: 'High' })
      }).catch(() => {});
    }
    log(`Queued ${items.length} ticket(s) from compliance output`);
  } catch (e) {
    log(`Failed to enqueue tickets from compliance: ${e.message}`);
  }
}

async function main() {
  try {
    await ensureDeps();
    await ensureElectronInstalled();
    // Start services directly without concurrently dependency
    log('Starting services directly...');
    // Start ticket queue first
    await ensureTicketQueueHealthy();
    
    // Start other services in background
    log('Starting API server...');
    spawn('node', ['api-server-express.js'], { 
      cwd: process.cwd(), 
      stdio: 'ignore', 
      detached: true,
      env: { ...process.env, LINEAR_API_KEY: process.env.LINEAR_API_KEY }
    }).unref();
    
    log('Starting frontend...');
    spawn('node', ['node_modules/.bin/vite'], { 
      cwd: process.cwd(), 
      stdio: 'ignore', 
      detached: true,
      env: { ...process.env, LINEAR_API_KEY: process.env.LINEAR_API_KEY }
    }).unref();
    
    log('Starting blockchain...');
    spawn('npx', ['hardhat', 'node'], { 
      cwd: process.cwd(), 
      stdio: 'ignore', 
      detached: true,
      env: { ...process.env, LINEAR_API_KEY: process.env.LINEAR_API_KEY }
    }).unref();
    
    // Wait a bit for services to start
    await new Promise(r => setTimeout(r, 5000));

    // Self-restart loop with backoff so autopilot can recover and continue
    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      const success = await runAutopilotRounds();
      if (success) {
        process.exit(0);
      }
      log(`Autopilot cycle incomplete. Attempt ${attempts}/5 will retry after backoff...`);
      await new Promise(r => setTimeout(r, Math.min(30000, 5000 * attempts)));
    }
    process.exit(1);
  } catch (e) {
    log(`Autopilot failed: ${e.message || e}`);
    process.exit(1);
  }
}

main();


