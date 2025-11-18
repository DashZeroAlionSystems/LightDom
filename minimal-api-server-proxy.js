// Minimal API Server (proxy-style) that forwards requests to Ollama directly
import { spawn } from 'child_process';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import servicesConfig from './scripts/services-config.js';
import DeepSeekAPIService from './services/deepseek-api-service.js';

dotenv.config();

const app = express();
const PORT = process.env.MINIMAL_API_PORT || process.env.PORT || 4100;
// Prefer the canonical OLLAMA_BASE_URL env var but fall back to older names for compatibility
const OLLAMA_ENDPOINT =
  process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11500';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-coder';
const deepSeekService = new DeepSeekAPIService();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Optional Postgres persistence for dev/prod use. When DB is available
// the minimal proxy will persist deepseek memory, prompt executions and
// service process metadata to Postgres. If DB is not configured, the
// proxy falls back to simple file-backed JSON storage under `data/`.
let pgPool = null;
const USE_DB = Boolean(process.env.DB_HOST || process.env.DATABASE_URL || process.env.DB_NAME);
const MANAGER_API_KEY = process.env.MANAGER_API_KEY || null;

if (USE_DB) {
  try {
    pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 30000,
    });
    console.log('Minimal proxy: using Postgres persistence');
  } catch (err) {
    console.warn(
      'Minimal proxy: failed to initialize Postgres pool',
      err && err.message ? err.message : err
    );
    pgPool = null;
  }
}

// Simple on-disk JSON storage for development when a DB is not configured.
const DATA_DIR = process.env.MINIMAL_API_DATA_DIR || path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data dir', err.message || err);
  }
}

async function appendJsonFile(fileName, entry) {
  const fp = path.join(DATA_DIR, fileName);
  try {
    const content = await fs.readFile(fp, 'utf-8');
    const arr = JSON.parse(content || '[]');
    arr.push(entry);
    await fs.writeFile(fp, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      await fs.writeFile(fp, JSON.stringify([entry], null, 2), 'utf-8');
    } else {
      throw err;
    }
  }
}

async function readJsonFile(fileName) {
  const fp = path.join(DATA_DIR, fileName);
  try {
    const content = await fs.readFile(fp, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

// Ensure DB schema exists for dev persistence
async function ensureDBSchema() {
  if (!pgPool) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS deepseek_memory (
        id SERIAL PRIMARY KEY,
        conversation_id VARCHAR(255),
        key VARCHAR(255),
        value JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS prompt_executions (
        id SERIAL PRIMARY KEY,
        model VARCHAR(255),
        prompt TEXT,
        response TEXT,
        tokens INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS service_processes (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(255),
        pid INTEGER,
        command TEXT,
        args JSONB,
        status VARCHAR(50),
        start_time TIMESTAMP,
        stop_time TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.warn(
      'Failed to ensure DB schema for minimal proxy:',
      err && err.message ? err.message : err
    );
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Minimal proxy API', timestamp: new Date().toISOString() });
});

// Proxy /api/ollama/health -> direct Ollama /api/models or simple health
app.get('/api/ollama/health', async (req, res) => {
  try {
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
    if (!r.ok)
      return res
        .status(502)
        .json({ success: false, error: 'Ollama /api/tags returned non-OK', status: r.status });
    const json = await r.json();
    return res.json({ success: true, status: 'ok', models: json.models });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

// POST /api/ollama/generate -> forward to Ollama generate
app.post('/api/ollama/generate', async (req, res) => {
  const { prompt, options = {} } = req.body || {};
  if (!prompt) return res.status(400).json({ success: false, error: 'prompt is required' });

  try {
    const body = { model: DEFAULT_MODEL, prompt, stream: false, options };
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({
        success: false,
        error: 'Ollama generate returned non-OK',
        status: r.status,
        details: text,
      });
    }
    const json = await r.json();
    return res.json({ success: true, response: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Failed to contact Ollama', details: err.message });
  }
});

// Streaming chat endpoint (SSE fallback) expected by the frontend at /api/rag/chat/stream
app.post('/api/rag/chat/stream', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    const normalizedMessages = messages.map(m => ({
      role: (m?.role || 'user').toString(),
      content: (m?.content || '').toString(),
    }));

    const prompt = normalizedMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    let responseText = null;
    let provider = 'ollama';
    let lastError = null;

    try {
      const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          prompt,
          stream: false,
          options: { temperature: 0.2 },
        }),
      });

      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Ollama responded with ${r.status}: ${text}`);
      }

      const json = await r.json();
      responseText = json.response || (typeof json === 'string' ? json : JSON.stringify(json));
    } catch (ollamaError) {
      lastError = ollamaError;
      provider = 'deepseek';

      try {
        responseText = await deepSeekService.chatCompletion(normalizedMessages, {
          temperature: 0.2,
          maxTokens: 1200,
        });
      } catch (deepSeekError) {
        lastError = deepSeekError;
      }
    }

    if (!responseText) {
      const fallbackMessage = lastError ? lastError.message || String(lastError) : 'Unknown error';
      console.error('[minimal-api-proxy] chat stream failed:', fallbackMessage);
      return res.status(503).json({
        success: false,
        error: 'Failed to process chat stream',
        details: fallbackMessage,
      });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const providerLabel = provider === 'deepseek' && deepSeekService.mockMode ? 'deepseek-mock' : provider;
    if (providerLabel !== 'ollama') {
      const reason = lastError ? lastError.message || String(lastError) : 'Unknown';
      console.warn(
        `[minimal-api-proxy] Falling back to ${providerLabel} for RAG chat: ${reason}`
      );
    }

    res.write(`data: ${JSON.stringify({ type: 'status', message: 'processing', provider: providerLabel })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'content', content: responseText, provider: providerLabel })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[minimal-api-proxy] chat stream failed:', err && (err.stack || err.message || err));
    return res
      .status(503)
      .json({ success: false, error: 'Failed to process chat stream', details: err.message || String(err) });
  }
});

// Ingest URL endpoint used by frontend proxy
app.post('/api/rag/ingest/url', async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ success: false, error: 'url required' });

  // Simple strategy: ask Ollama to summarize the URL (frontend can then store it client-side). For true RAG ingestion, DB/vector store is required.
  try {
    const prompt = `Summarize the content at this URL in three concise sentences: ${url}`;
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.0 },
      }),
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({
        success: false,
        error: 'Ollama generate returned non-OK',
        status: r.status,
        details: text,
      });
    }
    const json = await r.json();
    return res.json({ success: true, url, summary: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

app.get('/api/rag/test', (req, res) =>
  res.json({ success: true, message: 'Minimal proxy RAG ready' })
);

// Health endpoint expected by start-all-services.js: /api/rag/health
app.get('/api/rag/health', async (req, res) => {
  try {
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
    if (!r.ok)
      return res
        .status(502)
        .json({ success: false, error: 'Ollama /api/tags returned non-OK', status: r.status });
    const json = await r.json().catch(() => ({}));
    return res.json({ success: true, service: 'minimal-proxy', models: json.models || [] });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

// Development-only endpoints to persist DeepSeek conversation memory and execution records
// These write to data/*.json when a DB isn't configured. Keep them minimal and safe for dev.
app.post('/api/deepseek/memory', async (req, res) => {
  try {
    const { conversationId, key, value } = req.body || {};
    if (!conversationId || !key)
      return res.status(400).json({ success: false, error: 'conversationId and key are required' });
    if (pgPool) {
      const q = `INSERT INTO deepseek_memory (conversation_id, key, value) VALUES ($1,$2,$3) RETURNING id, created_at`;
      const values = [String(conversationId), String(key), value || null];
      const r = await pgPool.query(q, values);
      const entry = {
        id: r.rows[0].id,
        conversationId: String(conversationId),
        key: String(key),
        value,
        createdAt: r.rows[0].created_at,
      };
      return res.json({ success: true, entry });
    }
    await ensureDataDir();
    const entry = {
      id: Date.now(),
      conversationId: String(conversationId),
      key: String(key),
      value,
      createdAt: new Date().toISOString(),
    };
    await appendJsonFile('deepseek_memory.json', entry);
    return res.json({ success: true, entry });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to save memory', details: err.message });
  }
});

app.get('/api/deepseek/memory', async (req, res) => {
  try {
    const { conversationId } = req.query || {};
    if (pgPool) {
      const q = conversationId
        ? `SELECT * FROM deepseek_memory WHERE conversation_id = $1 ORDER BY created_at DESC`
        : `SELECT * FROM deepseek_memory ORDER BY created_at DESC LIMIT 1000`;
      const vals = conversationId ? [String(conversationId)] : [];
      const r = await pgPool.query(q, vals);
      return res.json({ success: true, results: r.rows });
    }
    await ensureDataDir();
    const all = await readJsonFile('deepseek_memory.json');
    const results = conversationId
      ? all.filter(e => String(e.conversationId) === String(conversationId))
      : all;
    return res.json({ success: true, results });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to read memory', details: err.message });
  }
});

app.post('/api/deepseek/record_execution', async (req, res) => {
  try {
    const { model, prompt, response: resp, tokens, metadata } = req.body || {};
    if (pgPool) {
      const q = `INSERT INTO prompt_executions (model, prompt, response, tokens, metadata) VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`;
      const values = [
        model || null,
        prompt || null,
        resp || null,
        tokens || null,
        metadata || null,
      ];
      const r = await pgPool.query(q, values);
      const entry = {
        id: r.rows[0].id,
        model,
        prompt,
        response: resp,
        tokens,
        metadata,
        createdAt: r.rows[0].created_at,
      };
      return res.json({ success: true, entry });
    }
    await ensureDataDir();
    const entry = {
      id: Date.now(),
      model: model || null,
      prompt: prompt || null,
      response: resp || null,
      tokens: tokens || null,
      metadata: metadata || null,
      createdAt: new Date().toISOString(),
    };
    await appendJsonFile('prompt_executions.json', entry);
    return res.json({ success: true, entry });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to record execution', details: err.message });
  }
});

app.get('/api/deepseek/executions', async (req, res) => {
  try {
    if (pgPool) {
      const r = await pgPool.query(
        'SELECT * FROM prompt_executions ORDER BY created_at DESC LIMIT 1000'
      );
      return res.json({ success: true, results: r.rows });
    }
    await ensureDataDir();
    const all = await readJsonFile('prompt_executions.json');
    return res.json({ success: true, results: all });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to read executions', details: err.message });
  }
});

// Manager auth middleware for service control endpoints
function requireManagerAuth(req, res, next) {
  if (!MANAGER_API_KEY) return next(); // no API key configured -> open in dev
  const header =
    req.headers['x-manager-key'] ||
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));
  if (!header || header !== MANAGER_API_KEY)
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  return next();
}

// --- Simple dev service manager endpoints ---
const managedProcesses = new Map();

function serviceStatusEntry(service) {
  const proc = managedProcesses.get(service.id);
  let running = false;
  let pid = null;
  if (proc && proc.pid) {
    pid = proc.pid;
    try {
      // Check if a process with this pid still exists. process.kill(pid, 0)
      // does not actually kill the process but will throw if the pid is invalid.
      process.kill(pid, 0);
      running = true;
    } catch (e) {
      running = false;
    }
  }

  // If we don't have a managed process reference, do a best-effort check of
  // the OS process list to see if a candidate process exists (useful when
  // the service command spawns children and the original child exits).
  if (!running) {
    try {
      const { execSync } = require('child_process');
      let procList = '';
      if (process.platform === 'win32') {
        procList = execSync('tasklist /FO LIST /NH', { encoding: 'utf8', timeout: 2000 });
      } else {
        procList = execSync('ps -eo pid,args', { encoding: 'utf8', timeout: 2000 });
      }
      const checkStrings = [service.command].concat(service.args || []);
      if (procList && checkStrings.some(s => s && procList.includes(s))) {
        running = true;
      }
    } catch (e) {
      // ignore errors here; this is a best-effort heuristic for dev usage
    }
  }

  return {
    id: service.id,
    label: service.label,
    optional: !!service.optional,
    running,
    pid,
    command: service.command,
    args: service.args,
  };
}

async function startServiceById(id) {
  const service = servicesConfig.find(s => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  if (managedProcesses.has(id)) {
    const existing = managedProcesses.get(id);
    if (existing && existing.exitCode == null) return existing;
  }

  const child = spawn(service.command, service.args || [], {
    cwd: service.cwd || process.cwd(),
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  managedProcesses.set(id, child);

  // Persist start event to DB if available
  if (pgPool) {
    try {
      const q = `INSERT INTO service_processes (service_id, pid, command, args, status, start_time) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id`;
      const vals = [id, child.pid, service.command, JSON.stringify(service.args || []), 'running'];
      const r = await pgPool.query(q, vals);
      // attach db id to child for later update
      child._dbProcessId = r.rows[0].id;
    } catch (e) {
      console.warn('Failed to persist service start', e && e.message ? e.message : e);
    }
  }

  child.stdout?.on('data', data => {
    const out = data.toString();
    console.log(`[svc:${id}] ${out.trim()}`);
  });
  child.stderr?.on('data', data => {
    const out = data.toString();
    console.error(`[svc:${id}] ERR ${out.trim()}`);
  });
  child.on('exit', (code, signal) => {
    console.log(`[svc:${id}] exited code=${code} signal=${signal}`);
    // ensure we remove the reference so status queries won't show it as running
    // Update DB record if present
    try {
      if (child && child._dbProcessId && pgPool) {
        pgPool
          .query(
            'UPDATE service_processes SET status=$1, stop_time=NOW(), updated_at=NOW() WHERE id=$2',
            ['stopped', child._dbProcessId]
          )
          .catch(() => {});
      }
    } catch (er) {}
    managedProcesses.delete(id);
  });

  child.on('error', err => {
    console.error(`[svc:${id}] process error`, err && err.message ? err.message : err);
  });

  // Give the child a moment to surface an immediate failure (e.g., missing script)
  await new Promise(resolve => setTimeout(resolve, 400));
  if (child.exitCode != null) {
    const code = child.exitCode;
    managedProcesses.delete(id);
    throw new Error(`Process for service ${id} exited immediately with code=${code}`);
  }

  return child;
}

async function stopServiceById(id) {
  const child = managedProcesses.get(id);
  if (!child) throw new Error(`Service not running: ${id}`);
  try {
    // Attempt a graceful shutdown first
    try {
      child.kill('SIGTERM');
    } catch (e) {
      // on Windows or in some environments kill may throw; fall back
      try {
        child.kill();
      } catch (ee) {}
    }
    // give it a moment
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (child.exitCode == null) {
      try {
        child.kill('SIGKILL');
      } catch (e) {
        console.error('Failed to SIGKILL', e?.message || e);
      }
    }
  } finally {
    // Mark DB record as stopped if present
    try {
      if (child && child._dbProcessId && pgPool) {
        await pgPool.query(
          'UPDATE service_processes SET status=$1, stop_time=NOW(), updated_at=NOW() WHERE id=$2',
          ['stopped', child._dbProcessId]
        );
      }
    } catch (e) {
      console.warn('Failed to persist service stop', e && e.message ? e.message : e);
    }
    managedProcesses.delete(id);
  }
}

app.get('/api/services', requireManagerAuth, (req, res) => {
  try {
    const list = servicesConfig.map(service => serviceStatusEntry(service));
    return res.json({ success: true, services: list });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to list services', details: err.message });
  }
});

app.post('/api/services/:id/start', requireManagerAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const child = await startServiceById(id);
    return res.json({ success: true, id, pid: child.pid });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: `Failed to start ${id}`, details: err.message });
  }
});

app.post('/api/services/:id/stop', requireManagerAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await stopServiceById(id);
    return res.json({ success: true, id });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: `Failed to stop ${id}`, details: err.message });
  }
});

app.get('/api/services/:id/status', requireManagerAuth, (req, res) => {
  const { id } = req.params;
  try {
    const service = servicesConfig.find(s => s.id === id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    return res.json({ success: true, status: serviceStatusEntry(service) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to get status', details: err.message });
  }
});

// Ensure data dir exists before starting server
ensureDataDir().catch(err =>
  console.warn('ensureDataDir error', err && err.message ? err.message : err)
);

// Start server with port fallback if default port is in use
async function startServer(preferredPort) {
  let port = Number(preferredPort) || 3001;
  const maxAttempts = 8;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Ensure DB schema if available before listening
      if (pgPool) await ensureDBSchema();

      await new Promise((resolve, reject) => {
        const server = app
          .listen(port, '0.0.0.0')
          .once('listening', () => resolve(server))
          .once('error', err => reject(err));
      });
      console.log(`Minimal proxy API listening on ${port}, forwarding to ${OLLAMA_ENDPOINT}`);
      return;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        port = port + 1;
        continue;
      }
      console.error('Failed to start server', err && err.message ? err.message : err);
      process.exit(1);
    }
  }
  console.error('Unable to bind any port starting at', preferredPort);
  process.exit(1);
}

console.log('Starting minimal-api-proxy server...');
startServer(process.env.MINIMAL_API_PORT || PORT).catch(err => {
  console.error('Server failed to start', err && err.message ? err.message : err);
  process.exit(1);
});

// Graceful shutdown: kill spawned children on exit
function killAllChildren() {
  for (const [id, child] of managedProcesses.entries()) {
    try {
      console.log('Stopping child', id, child && child.pid ? child.pid : 'unknown');
      child.kill();
    } catch (e) {
      console.warn('Error killing child', id, e && e.message ? e.message : e);
    }
  }
}

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  killAllChildren();
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  killAllChildren();
  process.exit(0);
});
