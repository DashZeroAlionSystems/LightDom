#!/usr/bin/env node

/**
 * LightDom Service Orchestrator
 * ----------------------------------------
 * Replaces the PowerShell startup script with a Node-based orchestrator that:
 *  - Starts and supervises all core services (API, frontend, Electron, DeepSeek, crawler, Ollama, n8n, seeding demo)
 *  - Performs health checks with auto-restart and exponential backoff
 *  - Watches source files and hot-restarts relevant services on change
 *  - Surfaces structured status over HTTP for the frontend sidebar badges
 *  - Requests remediation suggestions from the local DeepSeek service when repeated failures occur
 *  - Emits push-style notifications via webhook (if PUSH_NOTIFY_WEBHOOK is supplied)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import axios from 'axios';
import express from 'express';
import os from 'os';
import pidusage from 'pidusage';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__filename), '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const DEFAULT_HEALTH_INTERVAL = Number(process.env.ORCHESTRATOR_HEALTH_INTERVAL_MS || 15000);
const MAX_RESTART_ATTEMPTS = Number(process.env.ORCHESTRATOR_MAX_RESTARTS || 5);
const DEEPSEEK_ENDPOINT = process.env.DEEPSEEK_HEALTH_URL || 'http://localhost:4100';
const PUSH_NOTIFY_WEBHOOK = process.env.PUSH_NOTIFY_WEBHOOK;
const INCIDENT_WEBHOOK = process.env.ORCHESTRATOR_INCIDENT_ENDPOINT || 'http://localhost:3001/api/system/incidents';
const STATUS_PORT = Number(process.env.ORCHESTRATOR_STATUS_PORT || 5050);

const fsp = fs.promises;
const MANIFEST_DIR = path.join(ROOT_DIR, 'config', 'service-manifests');
const SERVICE_CONFIG_DIR = path.join(ROOT_DIR, 'config', 'service-configs');
const FEATURE_FLAG_FILE = path.join(ROOT_DIR, 'config', 'features.json');

const logPrefix = (serviceId) => `\x1b[36m[${serviceId}]\x1b[0m`;
const ORCHESTRATOR_SCOPE = 'orchestrator';

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const buildRegistryIndex = (definitions) =>
  Object.fromEntries(definitions.map((definition) => [definition.id, definition]));

const createInitialState = (definition, previousState) => {
  if (previousState) {
    return { ...previousState, severity: previousState.severity ?? 'unknown', badgeColor: previousState.badgeColor ?? 'gray' };
  }

  return {
    status: 'stopped',
    restarts: 0,
    lastError: null,
    lastHealthy: null,
    lastStarted: null,
    process: null,
    healthHistory: [],
    remediation: [],
    metrics: null,
    lastExitCode: null,
    lastFailureAt: null,
    lastLatencyMs: null,
    severity: 'unknown',
    badgeColor: 'gray',
  };
};

const buildInitialStateMap = (definitions, previousState = new Map()) => {
  const nextState = new Map();
  for (const definition of definitions) {
    nextState.set(definition.id, createInitialState(definition, previousState.get(definition.id)));
  }
  return nextState;
};

const getMaxRestarts = (definition) => {
  const candidate = definition?.restartPolicy?.maxRestarts;
  return Number.isFinite(candidate) && candidate >= 0 ? candidate : MAX_RESTART_ATTEMPTS;
};

const computeBackoffDelay = (definition, restartCount) => {
  const policy = definition?.restartPolicy ?? {};

  if (Array.isArray(policy.backoffMs) && policy.backoffMs.length > 0) {
    const index = Math.max(0, Math.min(restartCount - 1, policy.backoffMs.length - 1));
    const value = policy.backoffMs[index];
    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
  }

  const baseDelay = Number.isFinite(policy.baseDelayMs) && policy.baseDelayMs > 0 ? policy.baseDelayMs : 2000;
  const factor = Number.isFinite(policy.backoffFactor) && policy.backoffFactor > 0 ? policy.backoffFactor : 1.6;
  const maxDelay = Number.isFinite(policy.maxDelayMs) && policy.maxDelayMs > 0 ? policy.maxDelayMs : 30000;

  return Math.min(maxDelay, baseDelay * Math.pow(factor, Math.max(0, restartCount)));
};

const safeResolve = (relativePath, baseDir = ROOT_DIR) =>
  relativePath && typeof relativePath === 'string' ? path.resolve(baseDir, relativePath) : undefined;

const readOptionalFile = async (filePath) => {
  if (!filePath) return undefined;
  try {
    const data = await fsp.readFile(filePath, 'utf8');
    return data;
  } catch (error) {
    console.warn(`${logPrefix(ORCHESTRATOR_SCOPE)} Unable to read ${path.relative(ROOT_DIR, filePath)}:`, error.message);
    return undefined;
  }
};

async function loadJsonFile(filePath) {
  const raw = await fsp.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
  }
}

const validateManifest = (manifest, sourceLabel) => {
  const errors = [];

  if (!isPlainObject(manifest)) {
    return [`Manifest must be an object (${sourceLabel})`];
  }

  if (!manifest.id || typeof manifest.id !== 'string') {
    errors.push('Missing required "id" (string).');
  }

  if (!manifest.type || !['process', 'docker', 'oneshot'].includes(manifest.type)) {
    errors.push('Invalid or missing "type". Supported: process | docker | oneshot.');
  }

  if (manifest.type === 'process' && (!manifest.command || typeof manifest.command !== 'string')) {
    errors.push('Process services require a "command" string.');
  }

  if (manifest.type === 'docker' && (!manifest.start || typeof manifest.start !== 'object')) {
    errors.push('Docker services require a "start" configuration.');
  }

  if (manifest.health && !isPlainObject(manifest.health)) {
    errors.push('"health" should be an object when provided.');
  }

  return errors;
};

const manifestHealthToDefinition = (manifest = {}) => {
  if (!manifest) return undefined;
  const kind = manifest.kind || manifest.type;
  if (!kind) return undefined;

  const health = { type: kind };
  if (manifest.url) health.url = manifest.url;
  if (manifest.intervalMs) health.intervalMs = manifest.intervalMs;
  if (manifest.timeoutMs) health.timeoutMs = manifest.timeoutMs;
  return health;
};

const manifestToDefinition = async (manifest, manifestPath) => {
  const cwd = manifest.cwd ? safeResolve(manifest.cwd) : ROOT_DIR;
  const configSchemaPath = manifest.configSchema ? safeResolve(manifest.configSchema) : undefined;
  const configPath = manifest.configPath ? safeResolve(manifest.configPath) : undefined;

  if (configSchemaPath) {
    try {
      await fsp.access(configSchemaPath);
    } catch (error) {
      console.warn(
        `${logPrefix(ORCHESTRATOR_SCOPE)} Config schema not accessible for ${manifest.id}: ${path.relative(
          ROOT_DIR,
          configSchemaPath,
        )} (${error.message})`,
      );
    }
  }

  if (configPath) {
    await readOptionalFile(configPath);
  }

  return {
    id: manifest.id,
    name: manifest.name || manifest.id,
    type: manifest.type || 'process',
    command: manifest.command,
    args: Array.isArray(manifest.args) ? manifest.args : [],
    cwd,
    env: isPlainObject(manifest.env) ? manifest.env : undefined,
    dependsOn: Array.isArray(manifest.dependsOn) ? manifest.dependsOn : undefined,
    watch: Array.isArray(manifest.watch) ? manifest.watch : undefined,
    health: manifestHealthToDefinition(manifest.health),
    restartPolicy: manifest.restartPolicy,
    featureFlags: Array.isArray(manifest.featureFlags) ? manifest.featureFlags : undefined,
    bundle: manifest.bundle,
    metadata: {
      manifestPath,
      configSchemaPath,
      configPath,
      tags: Array.isArray(manifest.tags) ? manifest.tags : undefined,
    },
    source: 'manifest',
  };
};

async function loadServiceManifests() {
  try {
    const entries = await fsp.readdir(MANIFEST_DIR, { withFileTypes: true });
    const definitions = [];

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const manifestPath = path.join(MANIFEST_DIR, entry.name);
      try {
        const manifest = await loadJsonFile(manifestPath);
        const errors = validateManifest(manifest, entry.name);
        if (errors.length) {
          console.warn(`${logPrefix(ORCHESTRATOR_SCOPE)} Skipping manifest ${entry.name}: ${errors.join(' ')}`);
          continue;
        }
        const definition = await manifestToDefinition(manifest, manifestPath);
        definitions.push(definition);
      } catch (error) {
        console.error(`${logPrefix(ORCHESTRATOR_SCOPE)} Failed to load manifest ${entry.name}:`, error.message);
      }
    }

    return definitions;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error(`${logPrefix(ORCHESTRATOR_SCOPE)} Unable to read service manifests:`, error.message);
    return [];
  }
}

/**
 * Exec helpers
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: false,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`${command} ${args.join(' ')} exited with code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        error.code = code;
        reject(error);
      }
    });
  });
}

/**
 * Push notification (webhook) helper
 */
async function sendNotification(payload) {
  if (!PUSH_NOTIFY_WEBHOOK) {
    return;
  }

  try {
    await axios.post(PUSH_NOTIFY_WEBHOOK, {
      timestamp: new Date().toISOString(),
      host: os.hostname(),
      ...payload,
    });
  } catch (error) {
    console.warn('⚠️  Failed to deliver push notification:', error.message);
  }
}

async function reportIncident(payload) {
  if (!INCIDENT_WEBHOOK) return;

  try {
    await axios.post(INCIDENT_WEBHOOK, {
      timestamp: new Date().toISOString(),
      host: os.hostname(),
      ...payload,
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('⚠️  Failed to report orchestrator incident:', error.message);
  }
}

/**
 * DeepSeek remediation helper
 */
async function fetchDeepSeekSuggestions(serviceName, errorMessage) {
  try {
    const response = await axios.post(`${DEEPSEEK_ENDPOINT}/workflow/generate`, {
      prompt: `The ${serviceName} service failed with the following error:\n\n${errorMessage}\n\nGenerate three actionable recovery options with commands/scripts to execute. Format as JSON with keys options (array of {title, description, command}).`,
    }, {
      timeout: 10000,
    });

    return response.data?.workflow?.options ?? [];
  } catch (error) {
    console.warn('⚠️  DeepSeek suggestion request failed:', error.message);
    return [];
  }
}

/**
 * Built-in service definitions (fallback when no manifest is provided)
 */
const BUILTIN_SERVICE_DEFINITIONS = [
  {
    id: 'api',
    name: 'LightDom API',
    type: 'process',
    command: 'node',
    args: ['api-server-express.js'],
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PORT: process.env.API_PORT || '3001',
      DB_DISABLED: process.env.DB_DISABLED ?? 'false',
      DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || 'http://localhost:11434',
    },
    watch: [
      'api-server-express.js',
      'src/api/**/*.js',
      'src/api/**/*.ts',
      'src/services/**/*.ts',
    ],
    health: { type: 'http', url: process.env.API_HEALTH_URL || 'http://localhost:3001/api/health' },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Orchestration',
    type: 'process',
    command: 'node',
    args: ['scripts/start-deepseek-service.js'],
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      DEEPSEEK_PORT: process.env.DEEPSEEK_PORT || '4100',
      DEEPSEEK_HOST: process.env.DEEPSEEK_HOST || '127.0.0.1',
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    },
    watch: ['scripts/start-deepseek-service.js', 'services/deepseek-api-service.js', 'src/services/ai/**/*.ts'],
    dependsOn: ['ollama'],
    health: { type: 'http', url: `${DEEPSEEK_ENDPOINT}/health` },
  },
  {
    id: 'crawler',
    name: 'Enhanced Crawler',
    type: 'process',
    command: 'node',
    args: ['scripts/start-crawler-service.js'],
    cwd: ROOT_DIR,
    watch: ['scripts/start-crawler-service.js', 'enhanced-web-crawler-service.js'],
    health: { type: 'http', url: process.env.CRAWLER_HEALTH_URL || 'http://localhost:4200/health' },
  },
  {
    id: 'frontend',
    name: 'Frontend (Vite)',
    type: 'process',
    command: npmCmd,
    args: ['run', 'dev'],
    cwd: FRONTEND_DIR,
    env: {
      ...process.env,
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3001',
    },
    watch: ['frontend/src/**/*', 'frontend/tailwind.config.*', 'frontend/vite.config.*'],
    health: { type: 'http', url: process.env.FRONTEND_HEALTH_URL || 'http://localhost:3000' },
    readyPattern: /VITE v.* ready in/i,
  },
  {
    id: 'electron',
    name: 'Electron Shell',
    type: 'process',
    command: npmCmd,
    args: ['run', 'electron:dev'],
    cwd: ROOT_DIR,
    watch: ['electron/**/*.cjs', 'electron/**/*.js'],
    dependsOn: ['frontend'],
    health: { type: 'process' },
  },
  {
    id: 'ollama',
    name: 'Ollama Serve',
    type: 'process',
    command: 'ollama',
    args: ['serve'],
    cwd: ROOT_DIR,
    watch: [],
    health: { type: 'http', url: process.env.OLLAMA_HEALTH_URL || 'http://localhost:11434/api/tags' },
    postStart: async () => {
      if (process.env.OLLAMA_MODEL) {
        try {
          await runCommand('ollama', ['pull', process.env.OLLAMA_MODEL]);
        } catch (error) {
          console.warn('⚠️  Ollama model pull failed:', error.message);
        }
      }
    },
  },
  {
    id: 'n8n',
    name: 'n8n Automation',
    type: 'docker',
    start: () => runCommand('docker', ['compose', 'up', 'n8n', '-d'], { cwd: ROOT_DIR }),
    stop: () => runCommand('docker', ['compose', 'stop', 'n8n'], { cwd: ROOT_DIR }).catch(() => undefined),
    health: { type: 'http', url: process.env.N8N_HEALTH_URL || 'http://localhost:5678/healthz' },
  },
  {
    id: 'seeding-demo',
    name: 'Seeding Demo Runner',
    type: 'oneshot',
    start: () => runCommand(npmCmd, ['run', 'seeding:demo'], { cwd: ROOT_DIR }),
    intervalMs: Number(process.env.SEEDING_DEMO_INTERVAL_MS || 0),
    health: { type: 'lastRun' },
  },
];

let serviceRegistry = [];
let registryById = {};
let serviceState = new Map();

async function initialiseServiceRegistry() {
  const manifestDefinitions = await loadServiceManifests();
  if (manifestDefinitions.length > 0) {
    console.log(`${logPrefix(ORCHESTRATOR_SCOPE)} Loaded ${manifestDefinitions.length} manifest service(s).`);
  } else {
    console.log(`${logPrefix(ORCHESTRATOR_SCOPE)} No service manifests found. Falling back to built-in defaults.`);
  }

  const manifestIds = new Set(manifestDefinitions.map((definition) => definition.id));
  const fallbackDefinitions = BUILTIN_SERVICE_DEFINITIONS.filter((definition) => !manifestIds.has(definition.id));
  if (fallbackDefinitions.length > 0) {
    console.log(`${logPrefix(ORCHESTRATOR_SCOPE)} Using ${fallbackDefinitions.length} built-in service definition(s).`);
  }

  const definitions = [...manifestDefinitions, ...fallbackDefinitions];
  serviceRegistry = definitions;
  registryById = buildRegistryIndex(definitions);
  serviceState = buildInitialStateMap(definitions, serviceState);
}

function updateState(id, patch) {
  const current = serviceState.get(id) || {};
  const definition = registryById[id];
  const next = { ...current, ...patch };
  next.severity = deriveSeverity(definition, next);
  next.badgeColor = severityToColor(next.severity);
  serviceState.set(id, next);
}

function appendHistory(state, entry, limit = 20) {
  const history = state?.healthHistory ? [...state.healthHistory, entry] : [entry];
  if (history.length > limit) {
    history.splice(0, history.length - limit);
  }
  return history;
}

function getFailureStreak(state) {
  if (!state?.healthHistory?.length) return 0;
  let streak = 0;
  for (let i = state.healthHistory.length - 1; i >= 0; i -= 1) {
    if (state.healthHistory[i]?.ok !== false) break;
    streak += 1;
  }
  return streak;
}

function deriveSeverity(definition, state) {
  if (!state) return 'unknown';

  if (state.status === 'failed') {
    return 'critical';
  }

  const failureStreak = getFailureStreak(state);

  if (failureStreak >= 3) {
    return 'critical';
  }

  if (state.status === 'degraded' || failureStreak >= 1 || state.lastError) {
    return 'warning';
  }

  if ((state.restarts ?? 0) >= MAX_RESTART_ATTEMPTS) {
    return 'critical';
  }

  if ((state.restarts ?? 0) >= 2) {
    return 'warning';
  }

  if (state.status === 'restarting' || state.status === 'starting' || state.status === 'reloading') {
    return 'info';
  }

  if (state.status === 'running' || state.status === 'ready' || state.status === 'completed') {
    return 'healthy';
  }

  return state.status ? 'info' : 'unknown';
}

function severityToColor(severity) {
  switch (severity) {
    case 'healthy':
      return 'green';
    case 'warning':
      return 'orange';
    case 'critical':
      return 'red';
    case 'info':
      return 'blue';
    default:
      return 'gray';
  }
}

async function collectMetrics(definition, state) {
  if (!state) return null;

  const metrics = {};

  if (state.lastStarted) {
    const started = new Date(state.lastStarted).getTime();
    if (!Number.isNaN(started)) {
      metrics.uptimeMs = Math.max(0, Date.now() - started);
    }
  }

  if (definition?.type === 'process' && state.process?.pid) {
    try {
      const stats = await pidusage(state.process.pid);
      metrics.pid = state.process.pid;
      if (Number.isFinite(stats.cpu)) {
        metrics.cpuPercent = Number(stats.cpu.toFixed(1));
      }
      if (Number.isFinite(stats.memory)) {
        metrics.memoryMb = Number((stats.memory / (1024 * 1024)).toFixed(1));
      }
    } catch (error) {
      // Process may have exited before metrics were collected.
    }
  }

  return Object.keys(metrics).length ? metrics : null;
}

function serialiseState(state) {
  if (!state) return null;
  const { process, ...rest } = state;
  return rest;
}

function buildPublicSnapshot() {
  const snapshot = {};
  for (const definition of serviceRegistry) {
    snapshot[definition.id] = serialiseState(serviceState.get(definition.id));
  }
  return snapshot;
}

function buildStatusSummary() {
  const summary = {
    total: serviceRegistry.length,
    healthy: 0,
    warning: 0,
    critical: 0,
    info: 0,
    unknown: 0,
  };

  for (const definition of serviceRegistry) {
    const severity = serviceState.get(definition.id)?.severity ?? 'unknown';
    summary[severity] = (summary[severity] || 0) + 1;
  }

  summary.operational = summary.healthy;
  summary.degraded = summary.warning;
  summary.offline = summary.critical;

  return summary;
}

/**
 * Process-based service starter
 */
function startProcessService(definition) {
  const state = serviceState.get(definition.id);
  const child = spawn(definition.command, definition.args, {
    cwd: definition.cwd,
    env: { ...process.env, ...(definition.env || {}) },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  updateState(definition.id, {
    status: 'starting',
    process: child,
    metrics: null,
    lastStarted: new Date().toISOString(),
    lastExitCode: null,
  });

  child.stdout.on('data', (data) => {
    const text = data.toString();
    process.stdout.write(`${logPrefix(definition.id)} ${text}`);

    if (definition.readyPattern && definition.readyPattern.test(text)) {
      updateState(definition.id, { status: 'ready' });
    }
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    process.stderr.write(`${logPrefix(definition.id)} ${text}`);
  });

  child.on('exit', async (code, signal) => {
    if (child.pid) {
      pidusage.clear?.(child.pid);
    }

    const exitError = code === 0 ? null : `Process exited unexpectedly (code ${code}${signal ? `, signal ${signal}` : ''})`;

    updateState(definition.id, {
      status: exitError ? 'failed' : 'stopped',
      process: null,
      metrics: null,
      lastExitCode: code,
      lastError: exitError ?? null,
      lastFailureAt: exitError ? new Date().toISOString() : null,
    });

    const currentState = serviceState.get(definition.id) || {};
    const previousRestarts = currentState.restarts ?? state.restarts ?? 0;
    const nextRestartCount = exitError ? previousRestarts + 1 : previousRestarts;

    if (exitError) {
      console.warn(`${logPrefix(definition.id)} ${definition.name} ${exitError}`);
      await handleFailure(definition, new Error(exitError));
    } else {
      console.log(`${logPrefix(definition.id)} ${definition.name} exited cleanly (code ${code}). Restarting...`);
    }

    if (exitError && nextRestartCount > MAX_RESTART_ATTEMPTS) {
      updateState(definition.id, {
        status: 'failed',
        restarts: nextRestartCount,
        lastError: exitError,
      });
      await handleFailure(definition, new Error(`Max restarts reached. Last exit code: ${code}`));
      return;
    }

    scheduleRestart(definition, nextRestartCount, exitError ? new Error(exitError) : null);
  });

  child.on('error', async (error) => {
    console.error(`${logPrefix(definition.id)} Failed to start:`, error.message);
    await handleFailure(definition, error);
  });

  updateState(definition.id, { status: 'running', restarts: state.restarts });
}

function stopProcessService(definition) {
  const state = serviceState.get(definition.id);
  if (state?.process) {
    state.process.kill('SIGTERM');
  }
}

/**
 * Schedule restart with backoff
 */
function scheduleRestart(definition, restartCount, error) {
  const delay = Math.min(30000, 2000 * Math.pow(1.6, restartCount));
  updateState(definition.id, {
    status: 'restarting',
    restarts: restartCount,
    metrics: null,
    lastError: error ? error.message : null,
  });

  console.log(`${logPrefix(definition.id)} Restarting in ${Math.round(delay / 1000)}s...`);
  setTimeout(() => startService(definition), delay);
}

async function handleFailure(definition, error) {
  console.error(`${logPrefix(definition.id)} ${definition.name} failed: ${error.message}`);
  await sendNotification({
    type: 'service-failure',
    service: definition.id,
    name: definition.name,
    error: error.message,
  });
  await reportIncident({
    type: 'service-failure',
    service: definition.id,
    name: definition.name,
    error: error.message,
  });

  if (serviceState.get(definition.id)?.restarts >= 2) {
    const suggestions = await fetchDeepSeekSuggestions(definition.name, error.message);
    if (suggestions.length) {
      updateState(definition.id, { remediation: suggestions });
      console.log(`${logPrefix(definition.id)} DeepSeek remediation options:`);
      for (const option of suggestions) {
        console.log(` • ${option.title}: ${option.description}${option.command ? `\n   Command: ${option.command}` : ''}`);
      }
      await sendNotification({
        type: 'service-remediation',
        service: definition.id,
        name: definition.name,
        suggestions,
      });
      await reportIncident({
        type: 'service-remediation',
        service: definition.id,
        name: definition.name,
        suggestions,
      });
    }
  }
}

function startService(definition) {
  const state = serviceState.get(definition.id);

  if (definition.dependsOn) {
    const unmet = definition.dependsOn.filter((dep) => serviceState.get(dep)?.status !== 'running' && serviceState.get(dep)?.status !== 'ready');
    if (unmet.length) {
      console.log(`${logPrefix(definition.id)} Waiting for dependencies: ${unmet.join(', ')}`);
      setTimeout(() => startService(definition), 3000);
      return;
    }
  }

  try {
    if (definition.type === 'process') {
      startProcessService(definition);
    } else if (definition.type === 'docker') {
      updateState(definition.id, { status: 'starting', restarts: state.restarts });
      definition
        .start()
        .then(() => {
          updateState(definition.id, { status: 'running', lastStarted: new Date().toISOString() });
        })
        .catch(async (error) => {
          updateState(definition.id, { status: 'failed', lastError: error.message });
          await handleFailure(definition, error);
        });
    } else if (definition.type === 'oneshot') {
      updateState(definition.id, { status: 'running', lastStarted: new Date().toISOString() });
      definition
        .start()
        .then(() => {
          updateState(definition.id, { status: 'completed', lastHealthy: new Date().toISOString() });
        })
        .catch(async (error) => {
          updateState(definition.id, { status: 'failed', lastError: error.message });
          await handleFailure(definition, error);
        });
    }
  } catch (error) {
    console.error(`${logPrefix(definition.id)} Failed to schedule start:`, error.message);
  }
}

function stopService(definition) {
  if (definition.type === 'process') {
    stopProcessService(definition);
  } else if (definition.type === 'docker') {
    definition.stop?.();
  }
}

/**
 * File watchers for hot reload
 */
function initialiseWatchers() {
  for (const definition of serviceRegistry) {
    if (!definition.watch || definition.watch.length === 0) continue;

    const watcher = chokidar.watch(definition.watch, {
      cwd: ROOT_DIR,
      ignoreInitial: true,
    });

    watcher.on('all', (event, filePath) => {
      console.log(`${logPrefix(definition.id)} Change detected (${event}) in ${filePath}. Restarting...`);
      stopService(definition);
      updateState(definition.id, { status: 'reloading' });
      setTimeout(() => startService(definition), 500);
    });
  }
}

/**
 * Health checking loop
 */
async function performHealthCheck(definition) {
  const state = serviceState.get(definition.id);
  if (!definition.health) return;

  try {
    if (definition.health.type === 'http') {
      const startedAt = Date.now();
      const response = await axios.get(definition.health.url, { timeout: 5000 });
      const latencyMs = Date.now() - startedAt;
      if (response.status >= 200 && response.status < 400) {
        const history = appendHistory(state, { ts: Date.now(), ok: true, latencyMs, status: response.status });
        const patch = {
          status: state?.status === 'running' || state?.status === 'ready' ? state.status : 'running',
          lastHealthy: new Date().toISOString(),
          healthHistory: history,
          lastError: null,
          lastLatencyMs: latencyMs,
        };
        const metrics = await collectMetrics(definition, state);
        if (metrics) {
          patch.metrics = metrics;
        }
        updateState(definition.id, patch);
        return;
      }
      throw new Error(`Health returned status ${response.status}`);
    }

    if (definition.health.type === 'process') {
      if (state?.process && !state.process.killed) {
        const history = appendHistory(state, { ts: Date.now(), ok: true });
        const patch = {
          status: state.status === 'running' || state.status === 'ready' ? state.status : 'running',
          lastHealthy: new Date().toISOString(),
          healthHistory: history,
          lastError: null,
          lastLatencyMs: null,
        };
        const metrics = await collectMetrics(definition, state);
        if (metrics) {
          patch.metrics = metrics;
        }
        updateState(definition.id, patch);
        return;
      }
      throw new Error('Process not running');
    }

    if (definition.health.type === 'lastRun') {
      const ok = state.status === 'completed' && state.lastHealthy;
      const history = appendHistory(state, { ts: Date.now(), ok });
      updateState(definition.id, {
        healthHistory: history,
        lastLatencyMs: null,
      });
      if (!ok) {
        throw new Error('Seeding demo run pending');
      }
      return;
    }
  } catch (error) {
    const failureHistory = appendHistory(state, { ts: Date.now(), ok: false, error: error.message });
    updateState(definition.id, {
      status: 'degraded',
      lastError: error.message,
      healthHistory: failureHistory,
      metrics: null,
      lastLatencyMs: null,
    });

    console.warn(`${logPrefix(definition.id)} Health check failed: ${error.message}`);
    await handleFailure(definition, error);

    if (definition.type === 'process') {
      const currentState = serviceState.get(definition.id);
      const restarts = (currentState?.restarts ?? 0) + 1;
      scheduleRestart(definition, restarts, error);
    } else if (definition.type === 'docker') {
      definition
        .start()
        .then(() => console.log(`${logPrefix(definition.id)} Docker service restart triggered.`))
        .catch((err) => console.error(`${logPrefix(definition.id)} Docker restart failed:`, err.message));
    } else if (definition.type === 'oneshot' && definition.intervalMs > 0) {
      setTimeout(() => definition.start().catch(() => undefined), definition.intervalMs);
    }
  }
}

function startHealthLoop() {
  setInterval(() => {
    for (const definition of serviceRegistry) {
      if (definition.health) {
        performHealthCheck(definition);
      }
    }
  }, DEFAULT_HEALTH_INTERVAL);
}

/**
 * HTTP status server
 */
function startStatusServer() {
  const app = express();
  app.get('/system/status', (_req, res) => {
    const services = buildPublicSnapshot();
    res.json({
      timestamp: new Date().toISOString(),
      summary: buildStatusSummary(),
      services,
    });
  });

  app.get('/system/service/:id', (req, res) => {
    const state = serialiseState(serviceState.get(req.params.id));
    if (!state) {
      return res.status(404).json({ error: 'service_not_found' });
    }
    res.json({ id: req.params.id, state });
  });

  const server = createServer(app);
  server.listen(STATUS_PORT, () => {
    console.log(`📊 Orchestrator status API listening on http://localhost:${STATUS_PORT}/system/status`);
  });
}

/**
 * Entrypoint
 */
async function main() {
  console.log('🚀 Starting LightDom Orchestrator...');

  await initialiseServiceRegistry();

  for (const definition of serviceRegistry) {
    startService(definition);
  }

  initialiseWatchers();
  startHealthLoop();
  startStatusServer();

  process.on('SIGINT', async () => {
    console.log('\n🛑 Orchestrator shutting down...');
    for (const definition of serviceRegistry) {
      stopService(definition);
    }
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('💥 Orchestrator failed to start:', error);
  process.exit(1);
});
