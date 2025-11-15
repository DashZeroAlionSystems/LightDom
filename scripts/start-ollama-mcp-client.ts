#!/usr/bin/env ts-node

/**
 * LightDom Ollama MCP Client Launcher
 *
 * Wraps the `ollmcp` Python package so we can run our MCP servers as tools
 * for DeepSeek/Ollama without leaving the Node-based workflow. The script
 * checks that `ollmcp` is installed and then forwards CLI arguments to it,
 * defaulting to the DeepSeek model and bundled MCP configuration.
 */

import { spawn, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { DEFAULT_OLLAMA_HOST, normalizeHost } from './lib/ollama-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const defaultConfig = path.join(projectRoot, 'config', 'mcp', 'ollama-mcp-servers.json');

function resolvePythonExecutable(): string {
  const win = process.platform === 'win32';
  const candidates = [
    process.env.LIGHTDOM_PYTHON?.trim(),
    process.env.OLLAMA_MCP_PYTHON?.trim(),
    process.env.PYTHON?.trim(),
    path.join(projectRoot, '.conda', win ? 'python.exe' : 'bin/python'),
    path.join(projectRoot, '.venv', win ? 'Scripts/python.exe' : 'bin/python'),
    win ? 'python' : undefined,
    'python3',
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const isPathLike = candidate.includes(path.sep) || candidate.includes('/') || candidate.includes('\\');
    if (isPathLike) {
      const resolved = path.isAbsolute(candidate) ? candidate : path.resolve(projectRoot, candidate);
      if (existsSync(resolved)) {
        return resolved;
      }
      continue;
    }

    // Rely on PATH resolution for plain command names like "python".
    return candidate;
  }

  return win ? 'python.exe' : 'python3';
}

const pythonExecutable = resolvePythonExecutable();

const model = process.env.OLLAMA_MCP_MODEL || process.env.OLLAMA_MODEL || 'deepseek-r1:latest';
const configPath = process.env.OLLAMA_MCP_SERVERS || defaultConfig;
const host = normalizeHost(process.env.OLLAMA_HOST || process.env.OLLAMA_ENDPOINT || DEFAULT_OLLAMA_HOST);

function ensureOllmcpInstalled(): void {
  const probe = spawnSync(pythonExecutable, ['-m', 'mcp_client_for_ollama', '--version'], {
    stdio: 'ignore',
  });

  if (probe.status !== 0) {
    console.error('⚠️  The `ollmcp` package is not installed for the current Python environment.');
    console.error('   Install it with:');
    console.error(`   ${pythonExecutable} -m pip install --upgrade ollmcp`);
    console.error('   You can override the Python interpreter via LIGHTDOM_PYTHON or OLLAMA_MCP_PYTHON.');
    process.exit(1);
  }
}

function run(): void {
  ensureOllmcpInstalled();

  const args = ['-m', 'mcp_client_for_ollama'];

  if (model) {
    args.push('--model', model);
  }

  if (host) {
    args.push('--host', host);
  }

  if (configPath && existsSync(configPath)) {
    args.push('--servers-json', configPath);
  } else {
    console.warn('⚠️  MCP configuration JSON not found. Continuing without explicit server config.');
    console.warn(`   Looked for: ${configPath}`);
  }

  args.push(...process.argv.slice(2));

  console.log('🚀 Starting ollmcp client...');
  console.log(`   Python: ${pythonExecutable}`);
  console.log(`   Model: ${model}`);
  if (host) {
    console.log(`   Host: ${host}`);
  }
  if (configPath && existsSync(configPath)) {
    console.log(`   MCP config: ${configPath}`);
  }

  const child = spawn(pythonExecutable, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  });

  child.on('exit', code => {
    process.exit(code === null ? 1 : code);
  });
}

run();
