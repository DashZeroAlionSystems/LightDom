#!/usr/bin/env node

/**
 * Generates a high-level Mermaid diagram of the LightDom system
 * Scans key folders and infers services and relationships
 * ESM module (package.json has type: module)
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();

function node(label) {
  return label.replaceAll('"', '\\"');
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
  const sections = [];

  const hasApi = await exists(path.join(ROOT, 'api-server-express.js')) || await exists(path.join(ROOT, 'simple-api-server.js'));
  const hasFrontend = await exists(path.join(ROOT, 'src', 'main.tsx')) || await exists(path.join(ROOT, 'frontend'));
  const hasElectron = await exists(path.join(ROOT, 'electron', 'main.cjs')) || await exists(path.join(ROOT, 'electron', 'main.js'));
  const hasDb = await exists(path.join(ROOT, 'docker-compose.yml')) || await exists(path.join(ROOT, 'docker-compose-config', 'docker-compose-config.yaml'));
  const hasBlockchain = await exists(path.join(ROOT, 'contracts')) && await exists(path.join(ROOT, 'hardhat.config.ts'));
  const hasCrawler = await exists(path.join(ROOT, 'simple-api-server.js')) || await exists(path.join(ROOT, 'web-crawler-service.js')) || await exists(path.join(ROOT, 'crawler'));

  const lines = [];
  lines.push('flowchart TD');
  if (hasFrontend) lines.push('  Frontend["React/Vite Frontend"]');
  if (hasElectron) lines.push('  Electron["Electron Shell"]');
  if (hasApi) lines.push('  API["Express API Server"]');
  if (hasDb) lines.push('  DB[(PostgreSQL)]');
  lines.push('  Redis[(Redis)]');
  if (hasBlockchain) lines.push('  Chain["Hardhat + Contracts"]');
  if (hasCrawler) lines.push('  Crawler["Web Crawler / Puppeteer"]');

  // Edges
  if (hasFrontend && hasApi) lines.push('  Frontend -->|REST/WebSocket| API');
  if (hasElectron && hasFrontend) lines.push('  Electron -->|loads dev/prod| Frontend');
  if (hasApi) lines.push('  API -->|cache| Redis');
  if (hasApi && hasDb) lines.push('  API -->|SQL| DB');
  if (hasApi && hasBlockchain) lines.push('  API -->|ethers| Chain');
  if (hasApi && hasCrawler) lines.push('  API -->|controls| Crawler');

  const mermaid = lines.join('\n');

  const prompt = `You are a senior Staff+ level software engineer acting as an autonomous Background Agent. Your objective is to complete the LightDom application end-to-end using iterative rounds, with deep architectural reasoning and high-quality edits. You must:

1) Read the repository and architecture. Build a concrete plan from the Mermaid, then implement it.
2) Make minimal, safe, additive edits. Do not delete existing code unless obviously dead and justify.
3) Prefer TypeScript, strict typing, error handling, and enterprise patterns. Follow repo rules.
4) Ensure Windows dev experience works: Vite dev server, Electron shell, Express API, Docker (Postgres, Redis), Hardhat optional.
5) After each round: run the app or scripts, capture errors, fix them, and iterate.
6) Stop only when npm run compliance:check passes and the Electron app loads the frontend successfully.

Provide a brief round plan, then perform changes, then run commands, then verify, and repeat.

Mermaid (system view):

${mermaid}

Key success criteria:
- Electron loads frontend (dev) using dynamic port detection; no local file:// errors.
- API uses real server (api-server-express.js), health and core endpoints return data.
- Postgres and Redis available via Docker, or graceful local fallback when Docker absent.
- compliance:check exits 0; main dashboards render with styles.
- No secrets are committed; environment via .env.
`;

  await fs.writeFile('automation-mermaid.mmd', mermaid, 'utf8');
  await fs.writeFile('automation-mermaid-prompt.txt', prompt, 'utf8');

  console.log('Generated automation-mermaid.mmd and automation-mermaid-prompt.txt');
}

main().catch((e) => { console.error(e); process.exit(1); });


