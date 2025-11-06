#!/usr/bin/env node

// Background Agent and Ticket System Diagnostics
// Checks: env keys, network, dependencies, ticket queue health, Cursor API access, GitHub CLI

import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

function log(msg, type = 'info') {
  const p = { info: '🧪', ok: '✅', warn: '⚠️', err: '❌' }[type] || '🧪';
  console.log(`${p} ${msg}`);
}

async function checkEnvVars() {
  const required = [
    { key: 'LINEAR_API_KEY', optional: false },
    { key: 'CURSOR_API_KEY', optional: true },
  ];
  let ok = true;
  for (const r of required) {
    if (!process.env[r.key]) {
      log(`${r.key} ${r.optional ? 'not set (optional)' : 'MISSING'}`, r.optional ? 'warn' : 'err');
      if (!r.optional) ok = false;
    } else {
      log(`${r.key} present`, 'ok');
    }
  }
  return ok;
}

async function checkModule(cmd, name) {
  try {
    const { stdout } = await execAsync(cmd);
    log(`${name} available: ${stdout.split('\n')[0]}`, 'ok');
    return true;
  } catch (e) {
    log(`${name} not available: ${e.message}`, 'warn');
    return false;
  }
}

async function httpGet(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ ok: res.statusCode && res.statusCode < 500, status: res.statusCode });
    });
    req.on('error', () => resolve({ ok: false, status: 0 }));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve({ ok: false, status: -1 }); });
  });
}

async function checkTicketQueue() {
  const port = process.env.TICKET_QUEUE_PORT || 3099;
  const url = `http://localhost:${port}/api/tickets/status`;
  const res = await httpGet(url);
  if (res.ok) {
    log(`Ticket queue healthy at ${url} (status ${res.status})`, 'ok');
    return true;
  }
  log(`Ticket queue NOT reachable at ${url}. Start it with: npm run tickets:queue`, 'err');
  return false;
}

async function checkCursorApi() {
  if (!process.env.CURSOR_API_KEY) {
    log('CURSOR_API_KEY not set; background agent checks will be limited', 'warn');
    return true;
  }
  try {
    const { stdout } = await execAsync('node -e "console.log(!!process.env.CURSOR_API_KEY)"');
    if (stdout.trim() === 'true') {
      log('Cursor API key accessible in Node env', 'ok');
      return true;
    }
  } catch {}
  log('Cursor API key not accessible to subprocess environment', 'warn');
  return false;
}

async function main() {
  log('Running background agent diagnostics...');
  const envOk = await checkEnvVars();
  await checkModule('npx concurrently --version', 'concurrently');
  await checkModule('gh --version', 'GitHub CLI');
  await checkModule('node -e "require(\'@linear/sdk\')"', '@linear/sdk import test');
  const queueOk = await checkTicketQueue();
  if (!queueOk) {
    // Attempt self-heal by starting queue and re-checking
    try {
      await execAsync('node scripts/ticket-queue-server.js &');
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
    await checkTicketQueue();
  }
  await checkCursorApi();

  if (!envOk || !queueOk) {
    process.exitCode = 1;
  }
}

main().catch((e) => { log(e.message || e, 'err'); process.exit(1); });


