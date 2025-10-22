#!/usr/bin/env node

// ESM - package.json has type: module
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'automation.env' });
dotenv.config({ path: '.env.automation' });
dotenv.config();

const CURSOR_API = process.env.CURSOR_API_URL || 'https://api.cursor.com/v0/agents';
const API_KEY = process.env.CURSOR_API_KEY || '';
const ENABLE_AGENT = String(process.env.AUTOPILOT_ENABLE_AGENT || 'false').toLowerCase() === 'true';
const REQUESTED_MODEL = process.env.LLM_MODEL || 'sonnet-mini';
const ALLOWED_MODELS = (process.env.AGENT_ALLOWED_MODELS || 'sonnet-mini,haiku,fast')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Cursor API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function launchAgentWithPrompt(promptPath) {
  if (!ENABLE_AGENT) throw new Error('Background agent disabled by AUTOPILOT_ENABLE_AGENT=false');
  if (!API_KEY) throw new Error('CURSOR_API_KEY missing');
  const model = REQUESTED_MODEL.toLowerCase();
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error(`Requested model '${REQUESTED_MODEL}' not in allowed list: ${ALLOWED_MODELS.join(', ')}`);
  }
  const text = await fs.readFile(promptPath, 'utf8');
  const body = {
    prompt: { text },
    model: model,
    source: {
      repository: 'https://github.com/DashZeroAlionSystems/LightDom',
      ref: 'main'
    }
  };
  return postJson(CURSOR_API, body);
}

// CLI usage: node scripts/automation/cursor-api.js automation-mermaid-prompt.txt
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const prompt = process.argv[2] || 'automation-mermaid-prompt.txt';
    const out = await launchAgentWithPrompt(prompt);
    await fs.writeFile('.cursor/last-agent.json', JSON.stringify(out, null, 2));
    console.log(`Launched Cursor agent: ${out.id || 'unknown'}`);
  })().catch((e) => { console.error(e.message || e); process.exit(1); });
}


