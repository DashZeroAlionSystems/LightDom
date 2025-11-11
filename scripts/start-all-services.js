#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ollamaCmd = process.platform === 'win32' ? 'ollama.exe' : 'ollama';

const baseEnv = {
  ...process.env,
};

if (!baseEnv.OLLAMA_BASE_URL) {
  baseEnv.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
}

// Provide backwards-compatible alias used by some scripts
if (!baseEnv.OLLAMA_ENDPOINT) {
  baseEnv.OLLAMA_ENDPOINT = baseEnv.OLLAMA_BASE_URL;
}

if (!baseEnv.DEEPSEEK_API_URL) {
  baseEnv.DEEPSEEK_API_URL = baseEnv.OLLAMA_BASE_URL;
}

if (!baseEnv.DEEPSEEK_MODEL) {
  baseEnv.DEEPSEEK_MODEL = 'deepseek-r1:latest';
}

if (!baseEnv.RAG_EMBED_PROVIDER) {
  baseEnv.RAG_EMBED_PROVIDER = 'ollama';
}

if (!baseEnv.EMBEDDING_MODEL) {
  baseEnv.EMBEDDING_MODEL = 'nomic-embed-text';
}

if (!baseEnv.DEEPSEEK_HOST) {
  baseEnv.DEEPSEEK_HOST = '127.0.0.1';
}

if (!baseEnv.DEEPSEEK_PORT) {
  baseEnv.DEEPSEEK_PORT = '4100';
}

if (!baseEnv.API_HOST) {
  baseEnv.API_HOST = '127.0.0.1';
}

if (!baseEnv.PORT) {
  baseEnv.PORT = '3001';
}

const services = [
  {
    id: 'ollama',
    label: 'Ollama Serve',
    command: ollamaCmd,
    args: ['serve'],
    cwd: ROOT_DIR,
    optional: true,
  },
  {
    id: 'deepseek',
    label: 'DeepSeek Orchestration',
    command: 'node',
    args: ['scripts/start-deepseek-service.js'],
    cwd: ROOT_DIR,
  },
  {
    id: 'ocr',
    label: 'OCR Worker',
    command: 'node',
    args: ['scripts/run-ocr-worker.js'],
    cwd: ROOT_DIR,
    optional: true,
  },
  {
    id: 'api',
    label: 'API Server',
    command: npmCmd,
    args: ['run', 'api'],
    cwd: ROOT_DIR,
  },
  {
    id: 'crawler',
    label: 'Crawler Service',
    command: 'node',
    args: ['scripts/start-crawler-service.js'],
    cwd: ROOT_DIR,
  },
  {
    id: 'frontend',
    label: 'Frontend (Vite)',
    command: npmCmd,
    args: ['run', 'dev'],
    cwd: FRONTEND_DIR,
  },
  {
    id: 'seeder',
    label: 'Seeder Demo',
    command: npmCmd,
    args: ['run', 'seeding:demo'],
    cwd: ROOT_DIR,
  },
];

const processes = new Map();
let shuttingDown = false;

function log(id, message) {
  const prefix = `[${id}]`;
  process.stdout.write(`\x1b[36m${prefix}\x1b[0m ${message}\n`);
}

function logError(id, message) {
  const prefix = `[${id}]`;
  process.stderr.write(`\x1b[31m${prefix}\x1b[0m ${message}\n`);
}

function runChild(command, args, options = {}) {
  return new Promise(resolve => {
    try {
      const child = spawn(command, args, {
        cwd: ROOT_DIR,
        env: { ...baseEnv },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
      });

      child.on('error', error => {
        resolve({ code: 1, stdout, stderr: `${stderr}${error.message}` });
      });

      child.on('exit', code => {
        resolve({ code, stdout, stderr });
      });
    } catch (error) {
      resolve({ code: 1, stdout: '', stderr: error.message });
    }
  });
}

async function ensureOllamaAvailable() {
  log('starter', 'Checking Ollama availability…');
  const result = await runChild(ollamaCmd, ['--version']);
  if (result.code !== 0) {
    logError('starter', `Ollama CLI not available (${result.stderr.trim() || 'unknown error'})`);
    return false;
  }

  log('starter', `Ollama detected (${result.stdout.trim() || 'version unknown'})`);
  return true;
}

async function ensureOllamaModel(model) {
  log('starter', `Ensuring Ollama model "${model}" is available…`);
  const result = await runChild(ollamaCmd, ['pull', model]);
  if (result.code !== 0) {
    logError(
      'starter',
      `Failed to pull model ${model}: ${result.stderr.trim() || 'unknown error'}`
    );
    return false;
  }

  log('starter', `Model ${model} ready.`);
  return true;
}

async function waitForHttp({ id, url, retries = 20, interval = 1500, optional = false }) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        log(id, `Healthy at ${url}`);
        return true;
      }
      const text = await response.text();
      logError(id, `Health check failed (${response.status}): ${text}`);
    } catch (error) {
      logError(id, `Health check attempt ${attempt} failed: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (!optional) {
    logError(id, `Service did not respond healthy after ${retries} attempts (${url}).`);
  } else {
    log(id, `Optional service not ready after ${retries} attempts (${url}). Continuing.`);
  }
  return false;
}

async function runPreflight() {
  const ollamaAvailable = await ensureOllamaAvailable();

  if (ollamaAvailable) {
    const modelsToEnsure = new Set([baseEnv.DEEPSEEK_MODEL]);
    if (baseEnv.RAG_EMBED_PROVIDER === 'ollama') {
      modelsToEnsure.add(baseEnv.EMBEDDING_MODEL);
    }

    for (const model of modelsToEnsure) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await ensureOllamaModel(model);
      if (!ok) {
        logError('starter', `Preflight failed for Ollama model ${model}.`);
      }
    }
  } else {
    logError('starter', 'Skipping Ollama preflight checks (CLI not found).');
  }
}

function startService(service) {
  try {
    const child = spawn(service.command, service.args, {
      cwd: service.cwd,
      env: { ...baseEnv },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    processes.set(service.id, child);

    child.stdout.on('data', data => {
      log(service.id, data.toString().trim());
    });

    child.stderr.on('data', data => {
      logError(service.id, data.toString().trim());
    });

    child.on('exit', (code, signal) => {
      if (shuttingDown) return;
      const reason = signal ? `signal ${signal}` : `code ${code}`;
      if (code === 0 || signal === 'SIGTERM') {
        log(service.id, `Exited (${reason})`);
      } else {
        logError(service.id, `Unexpected exit (${reason})`);
        if (!service.optional) {
          logError(service.id, 'Shutting down remaining services...');
          shutdown().catch(() => undefined);
        }
      }
    });

    log(service.id, `Started ${service.label}`);
  } catch (error) {
    if (service.optional) {
      logError(service.id, `Optional service failed to start: ${error.message}`);
    } else {
      throw error;
    }
  }
}

async function startAll() {
  log('starter', 'Running preflight checks…');
  await runPreflight();
  log('starter', 'Launching LightDom services...');

  // Helper map for quick access
  const serviceById = new Map(services.map(s => [s.id, s]));

  // Start critical services first (Ollama + DeepSeek orchestration) so models and dependencies are available
  if (serviceById.has('ollama')) startService(serviceById.get('ollama'));
  if (serviceById.has('deepseek')) startService(serviceById.get('deepseek'));

  // Start API server and wait for it to be healthy. If it fails to become healthy, start a minimal API proxy as a fallback.
  const apiService = serviceById.get('api');
  const apiBaseUrl = baseEnv.API_BASE_URL || `http://${baseEnv.API_HOST}:${baseEnv.PORT}`;
  if (apiService) {
    startService(apiService);

    // Wait for API health; if it doesn't come up, attempt fallback proxy
    const apiHealthy = await waitForHttp({
      id: 'api',
      url: `${apiBaseUrl}/api/health`,
      retries: 20,
      interval: 1500,
      optional: false,
    });
    if (!apiHealthy) {
      logError(
        'starter',
        'API server failed health checks; launching fallback minimal API proxy on port ' +
          baseEnv.PORT
      );

      // Attempt to terminate the failing API process if it's still running
      const apiChild = processes.get('api');
      if (apiChild && apiChild.kill) {
        try {
          apiChild.kill('SIGTERM');
        } catch (e) {}
        // give it a moment
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (apiChild.exitCode === null) {
          try {
            apiChild.kill('SIGKILL');
          } catch (e) {}
        }
        processes.delete('api');
      }

      // Start minimal proxy that forwards requests to Ollama (fallback)
      const fallbackService = {
        id: 'api-proxy',
        label: 'API Fallback Proxy',
        command: 'node',
        args: ['minimal-api-server-proxy.js'],
        cwd: ROOT_DIR,
        optional: true,
      };
      startService(fallbackService);
      // Wait briefly for proxy to be available
      await waitForHttp({
        id: 'api-proxy',
        url: `${apiBaseUrl}/api/health`,
        retries: 10,
        interval: 1000,
        optional: true,
      });
    }
  }

  // Start remaining services (skip ones already started)
  for (const service of services) {
    if (['ollama', 'deepseek', 'api'].includes(service.id)) continue;
    try {
      startService(service);
    } catch (error) {
      logError(service.id, `Failed to start ${service.label}: ${error.message}`);
      await shutdown();
      process.exit(1);
    }
  }

  log(
    'starter',
    'All launch commands issued. Press Ctrl+C to terminate all services.\n' +
      'Services launched: ' +
      services.map(svc => svc.label).join(', ')
  );

  const deepseekBaseUrl = `http://${baseEnv.DEEPSEEK_HOST}:${baseEnv.DEEPSEEK_PORT}`;

  // Allow services a moment to boot before health polling
  await new Promise(resolve => setTimeout(resolve, 2000));

  await Promise.all([
    waitForHttp({ id: 'ollama', url: `${baseEnv.OLLAMA_BASE_URL}/api/tags`, optional: true }),
    waitForHttp({ id: 'deepseek', url: `${deepseekBaseUrl}/health`, optional: true }),
    // api health already attempted above
    waitForHttp({ id: 'rag', url: `${apiBaseUrl}/api/rag/health`, optional: true }),
  ]);
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log('starter', 'Stopping services...');

  const stopPromises = [];
  for (const [id, child] of processes.entries()) {
    if (!child || child.exitCode !== null) continue;
    stopPromises.push(
      new Promise(resolve => {
        child.once('exit', () => resolve());
        child.kill('SIGTERM');
        setTimeout(() => {
          if (child.exitCode === null) {
            child.kill('SIGKILL');
          }
        }, 5000);
      })
    );
  }

  await Promise.all(stopPromises).catch(() => undefined);
  log('starter', 'All services stopped.');
}

process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

startAll().catch(async error => {
  logError('starter', error.message);
  await shutdown();
  process.exit(1);
});

setInterval(() => {
  // keep process alive
}, 60_000);
