#!/usr/bin/env node

/**
 * Autopilot: runs in rounds → generate mermaid → invoke cursor agent with prompt → run compliance → repeat
 * ESM module (package.json has type: module)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import dotenv from 'dotenv';
// Load env from automation.env first (project-specific), then fallback to .env
dotenv.config({ path: 'automation.env' });
dotenv.config();
import { launchAgentWithPrompt } from './cursor-api.js';

const execAsync = promisify(exec);

function log(msg, type = 'info') {
  const p = { info: '✅', warn: '⚠️', err: '❌', step: '🔄', done: '🎉' }[type] || '✅';
  console.log(`${p} ${msg}`);
}

async function run(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
    return { ok: true, stdout, stderr };
  } catch (e) {
    return { ok: false, stdout: e.stdout || '', stderr: e.stderr || e.message };
  }
}

async function launchCursorAgent(promptFile) {
  try {
    const res = await launchAgentWithPrompt(promptFile);
    await fs.writeFile(`.cursor/agent-launch-${Date.now()}.json`, JSON.stringify(res, null, 2));
    log(`Cursor agent launched: ${res.id || 'unknown'}`);
  } catch (e) {
    // If disabled or blocked by allowed models, log and continue without failing rounds
    log(`Cursor agent skipped or failed: ${e.message}`, 'warn');
  }
}

async function parseCompliance(output) {
  const lines = output.split('\n');
  const failed = lines.some(l => /❌|ERROR|failed|not.*passing/i.test(l));
  const critical = lines.some(l => /🚨|critical/i.test(l));
  return { failed, critical };
}

async function main() {
  const maxRounds = Number(process.env.AUTOMATION_MAX_ROUNDS || 5);
  
  // Generate prompts once before rounds
  log('Generating analysis and expert prompt...', 'step');
  await run('node scripts/automation/generate-mermaid.js').catch(() => {});
  await run('node scripts/automation/generate-expert-prompt.js').catch(() => {});
  
  // Verify prompt file exists
  try {
    await fs.access('automation-expert-prompt.txt');
    log('Expert prompt ready', 'step');
  } catch {
    log('Using default prompt file', 'warn');
  }
  
  for (let round = 1; round <= maxRounds; round++) {
    log(`\n🔄 Round ${round}/${maxRounds}`, 'step');

    log('Launch Cursor background agent with expert prompt', 'step');
    await launchCursorAgent('automation-expert-prompt.txt');

    log('Run compliance:check', 'step');
    const comp = await run('npm run compliance:check');
    const parsed = await parseCompliance((comp.stdout || '') + '\n' + (comp.stderr || ''));

    await fs.writeFile(`autopilot-round-${round}.log`, (comp.stdout || '') + (comp.stderr || ''));

    if (comp.ok && !parsed.failed && !parsed.critical) {
      log('All checks passing. Autopilot complete.', 'done');
      process.exit(0);
    }

    log('Not yet passing. Proceeding to next round after agent fixes...', 'warn');
    await new Promise(r => setTimeout(r, 3000));
  }
  log('Reached maximum rounds without full pass.', 'err');
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });


