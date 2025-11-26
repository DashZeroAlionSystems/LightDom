// Minimal API Server (proxy-style) that forwards requests to Ollama directly
import { spawn } from 'child_process';
import cors from 'cors';
import { randomUUID } from 'crypto';
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

const CRAWLER_STORE_FILE = 'crawlee-crawlers.json';
const CRAWLER_TYPES_FILE = 'crawlee-crawler-types.json';

const DEFAULT_CRAWLER_CONFIG = {
  maxRequestsPerCrawl: 1000,
  maxConcurrency: 10,
  minConcurrency: 1,
  maxRequestRetries: 3,
  requestHandlerTimeoutSecs: 60,
  navigationTimeoutSecs: 60,
  keepAlive: true,
  useSessionPool: true,
  persistCookiesPerSession: true,
};

const DEFAULT_REQUEST_CONFIG = {
  headless: true,
  ignoreSslErrors: false,
  useChrome: false,
};

const DEFAULT_URL_PATTERNS = {
  include: ['*'],
  exclude: [],
  maxDepth: 3,
  sameDomain: true,
  respectRobotsTxt: true,
};

const DEFAULT_STORAGE_CONFIG = {
  enableDatasets: true,
  enableKeyValueStores: true,
  enableRequestQueues: true,
  persistStorage: true,
  purgeOnStart: false,
};

const DEFAULT_ERROR_HANDLING = {
  maxRequestRetries: 3,
  retryDelayMs: 1000,
  maxRetryDelayMs: 60000,
  retryMultiplier: 2,
  ignoreHttpErrors: false,
  ignoreSslErrors: false,
};

const DEFAULT_STATS = {
  requestsTotal: 0,
  requestsFinished: 0,
  requestsFailed: 0,
};

const DEFAULT_TYPE_SELECTORS = {
  title: 'title',
  description: 'meta[name="description"]',
  links: 'a[href]',
};

const DEFAULT_CRAWLER_TYPES = [
  {
    id: 'cheerio',
    name: 'CheerioCrawler',
    description:
      'HTML parsing crawler that uses Cheerio to transform static content at high speed.',
    features: ['Low memory footprint', 'Streaming HTML parsing', 'Ideal for static sites'],
    usage: 'Use for high-volume crawling of static HTML pages or content-heavy blogs.',
    docs_url: 'https://crawlee.dev/docs/api/cheerio-crawler/class/CheerioCrawler',
    default_config: {
      maxRequestsPerCrawl: 2000,
      maxConcurrency: 25,
      requestHandlerTimeoutSecs: 30,
      navigationTimeoutSecs: 30,
      useSessionPool: false,
      persistCookiesPerSession: false,
    },
    default_request_config: {
      headless: true,
      ignoreSslErrors: false,
      useChrome: false,
    },
    default_url_patterns: {
      include: ['*'],
      exclude: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp'],
      maxDepth: 3,
      sameDomain: true,
      respectRobotsTxt: true,
    },
    default_selectors: {
      title: 'title',
      description: 'meta[name="description"]',
      content: 'article, main, .content',
      links: 'a[href]',
    },
    notes: 'Does not execute JavaScript; relies on HTML responses returned by the target server.',
  },
  {
    id: 'playwright',
    name: 'PlaywrightCrawler',
    description:
      'Headless browser crawler backed by Playwright for rich SPA rendering and automation.',
    features: ['Full JavaScript execution', 'Cross-browser automation', 'Network interception'],
    usage:
      'Select for modern SPAs, authenticated portals, or when you need deterministic browser sessions.',
    docs_url: 'https://crawlee.dev/docs/api/playwright-crawler/class/PlaywrightCrawler',
    default_config: {
      maxRequestsPerCrawl: 500,
      maxConcurrency: 8,
      navigationTimeoutSecs: 45,
      requestHandlerTimeoutSecs: 90,
      useSessionPool: true,
      persistCookiesPerSession: true,
    },
    default_request_config: {
      headless: true,
      ignoreSslErrors: false,
      useChrome: true,
      launchOptions: {
        args: ['--disable-dev-shm-usage'],
      },
    },
    default_url_patterns: {
      include: ['*'],
      exclude: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.svg'],
      maxDepth: 2,
      sameDomain: true,
      respectRobotsTxt: true,
    },
    default_selectors: {
      title: 'title',
      description: 'meta[name="description"]',
      primaryContent: '[data-main], main, article',
      links: 'a[href]',
    },
    notes:
      'Supports Chromium, Firefox, and WebKit contexts. Handles page.evaluate hooks and browser contexts.',
  },
  {
    id: 'puppeteer',
    name: 'PuppeteerCrawler',
    description:
      'Chrome DevTools protocol powered crawler ideal for screenshot capture and precise control.',
    features: ['Chrome automation', 'Screenshot capture', 'Fine-grained network control'],
    usage: 'Choose when you require Chrome-specific APIs, PDF rendering, or viewport manipulation.',
    docs_url: 'https://crawlee.dev/docs/api/puppeteer-crawler/class/PuppeteerCrawler',
    default_config: {
      maxRequestsPerCrawl: 600,
      maxConcurrency: 6,
      navigationTimeoutSecs: 45,
      requestHandlerTimeoutSecs: 120,
      useSessionPool: true,
      persistCookiesPerSession: true,
    },
    default_request_config: {
      headless: true,
      ignoreSslErrors: false,
      useChrome: true,
      slowMo: 0,
    },
    default_url_patterns: {
      include: ['*'],
      exclude: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.svg', '*.mp4', '*.mp3'],
      maxDepth: 2,
      sameDomain: true,
      respectRobotsTxt: true,
    },
    default_selectors: {
      title: 'title',
      description: 'meta[name="description"]',
      ographImage: 'meta[property="og:image"]',
      links: 'a[href]',
    },
    notes:
      'Utilises Chromium; customise launch options for device emulation or performance tracing.',
  },
  {
    id: 'jsdom',
    name: 'JSDOMCrawler',
    description: 'Node.js powered DOM emulation crawler with lightweight JavaScript execution.',
    features: ['No external browser dependency', 'Partial JavaScript execution', 'Fast startup'],
    usage: 'Use for moderately dynamic sites where full browser automation is unnecessary.',
    docs_url: 'https://crawlee.dev/docs/api/jsdom-crawler/class/JSDOMCrawler',
    default_config: {
      maxRequestsPerCrawl: 1200,
      maxConcurrency: 15,
      navigationTimeoutSecs: 35,
      requestHandlerTimeoutSecs: 60,
      useSessionPool: true,
    },
    default_request_config: {
      headless: true,
      ignoreSslErrors: false,
      useChrome: false,
    },
    default_url_patterns: {
      include: ['*'],
      exclude: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp'],
      maxDepth: 3,
      sameDomain: true,
      respectRobotsTxt: true,
    },
    default_selectors: {
      title: 'title',
      description: 'meta[name="description"]',
      primaryContent: 'article, main, .content',
      links: 'a[href]',
    },
    notes: 'Executes JavaScript inside JSDOM environment; does not provide full browser APIs.',
  },
  {
    id: 'http',
    name: 'HttpCrawler',
    description:
      'Minimal HTTP-based crawler optimised for API harvesting and low-latency scraping.',
    features: ['Extremely fast', 'Stream-friendly', 'Minimal resource usage'],
    usage: 'Best for REST API harvesting, sitemap ingestion, or when rendering is unnecessary.',
    docs_url: 'https://crawlee.dev/docs/api/http-crawler/class/HttpCrawler',
    default_config: {
      maxRequestsPerCrawl: 5000,
      maxConcurrency: 50,
      requestHandlerTimeoutSecs: 15,
      navigationTimeoutSecs: 15,
      useSessionPool: false,
      persistCookiesPerSession: false,
    },
    default_request_config: {
      headless: true,
      ignoreSslErrors: false,
      useChrome: false,
      maxRetries: 2,
    },
    default_url_patterns: {
      include: ['*'],
      exclude: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.svg'],
      maxDepth: 1,
      sameDomain: true,
      respectRobotsTxt: true,
    },
    default_selectors: {
      data: '$',
      links: 'a[href]',
    },
    notes: 'Operates on raw HTTP responses; pair with custom parsers for JSON or XML payloads.',
  },
];

async function loadCrawlerStore() {
  await ensureDataDir();
  const records = await readJsonFile(CRAWLER_STORE_FILE);
  return Array.isArray(records) ? records : [];
}

async function saveCrawlerStore(crawlers) {
  await ensureDataDir();
  const fp = path.join(DATA_DIR, CRAWLER_STORE_FILE);
  await fs.writeFile(fp, JSON.stringify(crawlers, null, 2), 'utf-8');
}

async function getCrawlerFromStore(id) {
  const crawlers = await loadCrawlerStore();
  return crawlers.find(c => c.id === id) || null;
}

async function updateCrawlerInStore(id, updater) {
  const crawlers = await loadCrawlerStore();
  const index = crawlers.findIndex(c => c.id === id);
  if (index === -1) return null;

  const current = { ...crawlers[index] };
  const updated = await updater(current);

  if (updated === null) {
    crawlers.splice(index, 1);
    await saveCrawlerStore(crawlers);
    return null;
  }

  crawlers[index] = updated;
  await saveCrawlerStore(crawlers);
  return crawlers[index];
}

function normalizeCrawlerRecord(crawler) {
  const createdAt = crawler.created_at || new Date().toISOString();
  const updatedAt = crawler.updated_at || createdAt;

  return {
    id: crawler.id,
    name: crawler.name || 'Crawler',
    description: crawler.description || '',
    type: crawler.type || 'cheerio',
    status: crawler.status || 'idle',
    config: { ...DEFAULT_CRAWLER_CONFIG, ...(crawler.config || {}) },
    request_config: { ...DEFAULT_REQUEST_CONFIG, ...(crawler.request_config || {}) },
    autoscaling_config: {
      enabled: true,
      minConcurrency: 1,
      maxConcurrency: 10,
      desiredConcurrency: 5,
      desiredConcurrencyRatio: 0.9,
      scaleUpStepRatio: 0.1,
      scaleDownStepRatio: 0.05,
      ...(crawler.autoscaling_config || {}),
    },
    session_pool_config: {
      maxPoolSize: 1000,
      sessionOptions: {
        maxAgeSecs: 3000,
        maxUsageCount: 50,
        maxErrorScore: 3,
      },
      ...(crawler.session_pool_config || {}),
    },
    proxy_config: {
      enabled: false,
      proxyUrls: [],
      ...(crawler.proxy_config || {}),
    },
    storage_config: { ...DEFAULT_STORAGE_CONFIG, ...(crawler.storage_config || {}) },
    request_queue_config: {
      maxConcurrency: 1000,
      maxRequestsPerMinute: 120,
      autoRequestQueueCleanup: true,
      ...(crawler.request_queue_config || {}),
    },
    error_handling_config: { ...DEFAULT_ERROR_HANDLING, ...(crawler.error_handling_config || {}) },
    url_patterns: { ...DEFAULT_URL_PATTERNS, ...(crawler.url_patterns || {}) },
    selectors: crawler.selectors || {},
    request_handler: crawler.request_handler || null,
    failed_request_handler: crawler.failed_request_handler || null,
    pre_navigation_hooks: crawler.pre_navigation_hooks || [],
    post_navigation_hooks: crawler.post_navigation_hooks || [],
    schedule: crawler.schedule || null,
    campaign_id: crawler.campaign_id || null,
    seeder_service_id: crawler.seeder_service_id || null,
    created_by: crawler.created_by || null,
    tags: Array.isArray(crawler.tags)
      ? crawler.tags
      : crawler.tags
        ? [crawler.tags].flat().filter(Boolean)
        : [],
    metadata:
      crawler.metadata && typeof crawler.metadata === 'object' && !Array.isArray(crawler.metadata)
        ? { ...crawler.metadata }
        : {},
    stats: { ...DEFAULT_STATS, ...(crawler.stats || {}) },
    seeds: Array.isArray(crawler.seeds) ? crawler.seeds : [],
    results: Array.isArray(crawler.results) ? crawler.results : [],
    logs: Array.isArray(crawler.logs) ? crawler.logs : [],
    created_at: createdAt,
    updated_at: updatedAt,
    started_at: crawler.started_at || null,
    finished_at: crawler.finished_at || null,
    last_run_at: crawler.last_run_at || null,
  };
}

function createCrawlerTypeSlug(value) {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function parseJsonFieldStrict(value, fieldName, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      throw new Error(`Invalid JSON for ${fieldName}`);
    }
  }
  return fallback;
}

function coerceFeatureList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => (item === undefined || item === null ? '' : item.toString().trim()))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    return Object.values(value)
      .map(item => (item === undefined || item === null ? '' : item.toString().trim()))
      .filter(Boolean);
  }
  return [];
}

function normalizeCrawlerTypeRecord(type) {
  const rawId = type?.id || type?.name || '';
  const id = rawId.toString().trim();

  const features = coerceFeatureList(type?.features);

  const normalized = {
    id,
    name: type?.name || id || 'Crawler Type',
    description: type?.description || '',
    features,
    usage: type?.usage || '',
    docs_url: type?.docs_url || null,
    default_config: {
      ...DEFAULT_CRAWLER_CONFIG,
      ...(type?.default_config && typeof type.default_config === 'object'
        ? type.default_config
        : {}),
    },
    default_request_config: {
      ...DEFAULT_REQUEST_CONFIG,
      ...(type?.default_request_config && typeof type.default_request_config === 'object'
        ? type.default_request_config
        : {}),
    },
    default_url_patterns: {
      ...DEFAULT_URL_PATTERNS,
      ...(type?.default_url_patterns && typeof type.default_url_patterns === 'object'
        ? type.default_url_patterns
        : {}),
    },
    default_selectors: {
      ...DEFAULT_TYPE_SELECTORS,
      ...(type?.default_selectors && typeof type.default_selectors === 'object'
        ? type.default_selectors
        : {}),
    },
    notes: type?.notes || null,
  };

  if (type?.created_at) normalized.created_at = type.created_at;
  if (type?.updated_at) normalized.updated_at = type.updated_at;

  return normalized;
}

async function loadCrawlerTypesFromFileRaw() {
  await ensureDataDir();
  try {
    const records = await readJsonFile(CRAWLER_TYPES_FILE);
    return Array.isArray(records) ? records : [];
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveCrawlerTypesToFile(types) {
  await ensureDataDir();
  const fp = path.join(DATA_DIR, CRAWLER_TYPES_FILE);
  const normalized = (Array.isArray(types) ? types : [])
    .map(normalizeCrawlerTypeRecord)
    .filter(type => type.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(fp, JSON.stringify(normalized, null, 2), 'utf-8');
}

async function ensureCrawlerTypeTable() {
  if (!pgPool) return;
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS crawler_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      features JSONB DEFAULT '[]'::jsonb,
      usage TEXT,
      docs_url TEXT,
      default_config JSONB DEFAULT '{}'::jsonb,
      default_request_config JSONB DEFAULT '{}'::jsonb,
      default_url_patterns JSONB DEFAULT '{}'::jsonb,
      default_selectors JSONB DEFAULT '{}'::jsonb,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seedCrawlerTypesInDB() {
  if (!pgPool) return;
  try {
    await ensureCrawlerTypeTable();
    const result = await pgPool.query('SELECT COUNT(*)::int AS count FROM crawler_types');
    const count = result.rows?.[0]?.count || 0;
    if (count === 0) {
      for (const type of DEFAULT_CRAWLER_TYPES) {
        await upsertCrawlerTypeRecord(type);
      }
    }
  } catch (err) {
    console.warn(
      'Failed to seed crawler types in Postgres',
      err && err.message ? err.message : err
    );
  }
}

async function loadCrawlerTypesFromDB() {
  await ensureCrawlerTypeTable();
  const result = await pgPool.query(`
    SELECT id, name, description, features, usage, docs_url,
           default_config, default_request_config, default_url_patterns,
           default_selectors, notes, created_at, updated_at
    FROM crawler_types
    ORDER BY name ASC;
  `);

  return result.rows.map(row =>
    normalizeCrawlerTypeRecord({
      ...row,
      created_at: row.created_at ? row.created_at.toISOString?.() || row.created_at : null,
      updated_at: row.updated_at ? row.updated_at.toISOString?.() || row.updated_at : null,
    })
  );
}

async function loadCrawlerTypes() {
  if (pgPool) {
    await seedCrawlerTypesInDB();
    return loadCrawlerTypesFromDB();
  }

  const rawTypes = await loadCrawlerTypesFromFileRaw();
  if (!rawTypes || rawTypes.length === 0) {
    const defaults = DEFAULT_CRAWLER_TYPES.map(normalizeCrawlerTypeRecord);
    await saveCrawlerTypesToFile(defaults);
    return defaults;
  }
  return rawTypes.map(normalizeCrawlerTypeRecord).sort((a, b) => a.name.localeCompare(b.name));
}

async function getCrawlerTypeById(typeId) {
  if (!typeId) return null;
  if (pgPool) {
    await ensureCrawlerTypeTable();
    const result = await pgPool.query(
      `SELECT id, name, description, features, usage, docs_url,
              default_config, default_request_config, default_url_patterns,
              default_selectors, notes, created_at, updated_at
         FROM crawler_types
         WHERE id = $1
         LIMIT 1;`,
      [typeId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return normalizeCrawlerTypeRecord({
      ...row,
      created_at: row.created_at ? row.created_at.toISOString?.() || row.created_at : null,
      updated_at: row.updated_at ? row.updated_at.toISOString?.() || row.updated_at : null,
    });
  }

  const types = await loadCrawlerTypes();
  return types.find(type => type.id === typeId) || null;
}

async function upsertCrawlerTypeRecord(type) {
  const normalized = normalizeCrawlerTypeRecord(type);
  if (!normalized.id) {
    throw new Error('Crawler type id is required');
  }

  if (pgPool) {
    await ensureCrawlerTypeTable();
    await pgPool.query(
      `INSERT INTO crawler_types (
        id, name, description, features, usage, docs_url,
        default_config, default_request_config, default_url_patterns,
        default_selectors, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        usage = EXCLUDED.usage,
        docs_url = EXCLUDED.docs_url,
        default_config = EXCLUDED.default_config,
        default_request_config = EXCLUDED.default_request_config,
        default_url_patterns = EXCLUDED.default_url_patterns,
        default_selectors = EXCLUDED.default_selectors,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP;`,
      [
        normalized.id,
        normalized.name,
        normalized.description,
        normalized.features,
        normalized.usage,
        normalized.docs_url,
        normalized.default_config,
        normalized.default_request_config,
        normalized.default_url_patterns,
        normalized.default_selectors,
        normalized.notes,
      ]
    );
    return normalized;
  }

  const types = await loadCrawlerTypesFromFileRaw();
  const index = types.findIndex(
    type => (type.id || '').toLowerCase() === normalized.id.toLowerCase()
  );
  if (index === -1) {
    types.push(normalized);
  } else {
    types[index] = normalized;
  }
  await saveCrawlerTypesToFile(types);
  return normalized;
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

    await ensureCrawlerTypeTable();
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

    const prompt = normalizedMessages.map(m => `${m.role}: ${m.content}`).join('\n');

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

    const providerLabel =
      provider === 'deepseek' && deepSeekService.mockMode ? 'deepseek-mock' : provider;
    if (providerLabel !== 'ollama') {
      const reason = lastError ? lastError.message || String(lastError) : 'Unknown';
      console.warn(`[minimal-api-proxy] Falling back to ${providerLabel} for RAG chat: ${reason}`);
    }

    res.write(
      `data: ${JSON.stringify({ type: 'status', message: 'processing', provider: providerLabel })}\n\n`
    );
    res.write(
      `data: ${JSON.stringify({ type: 'content', content: responseText, provider: providerLabel })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error(
      '[minimal-api-proxy] chat stream failed:',
      err && (err.stack || err.message || err)
    );
    return res.status(503).json({
      success: false,
      error: 'Failed to process chat stream',
      details: err.message || String(err),
    });
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

// --- Lightweight Crawlee endpoints for development ---
app.get('/api/crawlee/crawler-types', async (req, res) => {
  try {
    const types = await loadCrawlerTypes();
    return res.json({ success: true, types });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to list crawler types', details: err.message });
  }
});

app.get('/api/crawlee/crawler-types/:id', async (req, res) => {
  try {
    const type = await getCrawlerTypeById(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, error: 'Crawler type not found' });
    }
    return res.json({ success: true, type });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to load crawler type', details: err.message });
  }
});

app.post('/api/crawlee/crawler-types', async (req, res) => {
  try {
    const payload = req.body || {};
    const baseId = payload.id || payload.name;
    if (!baseId) {
      return res.status(400).json({ success: false, error: 'name or id is required' });
    }

    const slug = createCrawlerTypeSlug(baseId) || createCrawlerTypeSlug(payload.name);
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Unable to derive crawler type id' });
    }

    const existing = await getCrawlerTypeById(slug);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Crawler type already exists' });
    }

    let defaultConfig;
    let defaultRequestConfig;
    let defaultUrlPatterns;
    let defaultSelectors;

    try {
      defaultConfig = parseJsonFieldStrict(payload.default_config, 'default_config', {});
      defaultRequestConfig = parseJsonFieldStrict(
        payload.default_request_config,
        'default_request_config',
        {}
      );
      defaultUrlPatterns = parseJsonFieldStrict(
        payload.default_url_patterns,
        'default_url_patterns',
        {}
      );
      defaultSelectors = parseJsonFieldStrict(payload.default_selectors, 'default_selectors', {});
    } catch (parseErr) {
      return res.status(400).json({ success: false, error: parseErr.message });
    }

    const typeRecord = {
      id: slug,
      name: payload.name || slug,
      description: payload.description || '',
      usage: payload.usage || '',
      features: coerceFeatureList(payload.features),
      docs_url: payload.docs_url || null,
      notes: payload.notes || null,
      default_config: defaultConfig,
      default_request_config: defaultRequestConfig,
      default_url_patterns: defaultUrlPatterns,
      default_selectors: defaultSelectors,
    };

    const stored = await upsertCrawlerTypeRecord(typeRecord);
    return res.status(201).json({ success: true, type: stored });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to create crawler type', details: err.message });
  }
});

app.get('/api/crawlee/config-template', async (req, res) => {
  try {
    const requestedType = req.query.type || req.query.typeId || req.query.crawlerType;
    let templateType = null;
    if (requestedType) {
      templateType = await getCrawlerTypeById(requestedType);
    }

    const baseTemplate = {
      name: 'My Crawler',
      description: templateType?.description || 'Crawler description',
      type: templateType?.id || 'cheerio',
      config: templateType?.default_config || { ...DEFAULT_CRAWLER_CONFIG },
      request_config: templateType?.default_request_config || { ...DEFAULT_REQUEST_CONFIG },
      url_patterns: templateType?.default_url_patterns || { ...DEFAULT_URL_PATTERNS },
      selectors: templateType?.default_selectors || {
        title: 'h1',
        description: 'meta[name="description"]',
        content: '.main-content',
      },
    };

    return res.json({ success: true, template: baseTemplate, type: templateType || null });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to build config template', details: err.message });
  }
});

app.get('/api/crawlee/crawlers', async (req, res) => {
  try {
    const crawlers = await loadCrawlerStore();
    const normalized = crawlers.map(normalizeCrawlerRecord);
    return res.json({ success: true, crawlers: normalized });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to list crawlers', details: err.message });
  }
});

app.post('/api/crawlee/crawlers', async (req, res) => {
  try {
    const payload = req.body || {};
    const crawlers = await loadCrawlerStore();
    const id = payload.id || `crawler_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const requestedTypeId = payload.type
      ? createCrawlerTypeSlug(payload.type) || payload.type
      : null;
    const typeRecord = requestedTypeId ? await getCrawlerTypeById(requestedTypeId) : null;
    const resolvedType = typeRecord?.id || 'cheerio';

    const configDefaults = typeRecord?.default_config || {};
    const requestConfigDefaults = typeRecord?.default_request_config || {};
    const urlPatternDefaults = typeRecord?.default_url_patterns || {};
    const selectorDefaults = typeRecord?.default_selectors || {};

    const derivedTags =
      Array.isArray(payload.tags) && payload.tags.length > 0
        ? payload.tags
        : typeRecord?.features || [];

    const metadataDefaults = typeRecord?.docs_url
      ? { crawler_type_docs_url: typeRecord.docs_url }
      : {};

    const record = normalizeCrawlerRecord({
      id,
      name: payload.name,
      description: payload.description,
      type: resolvedType,
      status: 'idle',
      config: { ...configDefaults, ...(payload.config || {}) },
      request_config: { ...requestConfigDefaults, ...(payload.request_config || {}) },
      autoscaling_config: payload.autoscaling_config,
      session_pool_config: payload.session_pool_config,
      proxy_config: payload.proxy_config,
      storage_config: payload.storage_config,
      request_queue_config: payload.request_queue_config,
      error_handling_config: payload.error_handling_config,
      url_patterns: { ...urlPatternDefaults, ...(payload.url_patterns || {}) },
      selectors: { ...selectorDefaults, ...(payload.selectors || {}) },
      campaign_id: payload.campaign_id || null,
      seeder_service_id: payload.seeder_service_id || null,
      created_by: payload.created_by || null,
      tags: derivedTags,
      metadata: { ...metadataDefaults, ...(payload.metadata || {}) },
      stats: DEFAULT_STATS,
      seeds: [],
      created_at: now,
      updated_at: now,
    });

    crawlers.unshift(record);
    await saveCrawlerStore(crawlers);

    return res.json({ success: true, crawler: record });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to create crawler', details: err.message });
  }
});

app.get('/api/crawlee/crawlers/:id', async (req, res) => {
  try {
    const crawler = await getCrawlerFromStore(req.params.id);
    if (!crawler) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    return res.json({ success: true, crawler: normalizeCrawlerRecord(crawler) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to get crawler', details: err.message });
  }
});

app.put('/api/crawlee/crawlers/:id', async (req, res) => {
  try {
    const updates = req.body || {};
    const requestedTypeId = updates.type
      ? createCrawlerTypeSlug(updates.type) || updates.type
      : null;
    const proposedType = requestedTypeId ? await getCrawlerTypeById(requestedTypeId) : null;

    const updated = await updateCrawlerInStore(req.params.id, existing => {
      if (!existing) return null;
      const normalized = normalizeCrawlerRecord(existing);
      const next = { ...normalized };

      if (proposedType) {
        next.type = proposedType.id;
        next.config = { ...proposedType.default_config, ...next.config };
        next.request_config = {
          ...proposedType.default_request_config,
          ...next.request_config,
        };
        next.url_patterns = {
          ...proposedType.default_url_patterns,
          ...next.url_patterns,
        };
        next.selectors = { ...proposedType.default_selectors, ...next.selectors };
        if (!updates.tags || updates.tags.length === 0) {
          next.tags = [...proposedType.features];
        }
        if (proposedType.docs_url) {
          next.metadata = {
            ...next.metadata,
            crawler_type_docs_url: proposedType.docs_url,
          };
        }
      }

      if (updates.name !== undefined) next.name = updates.name;
      if (updates.description !== undefined) next.description = updates.description;
      if (updates.type && proposedType) {
        next.type = proposedType.id;
      }
      if (updates.status) next.status = updates.status;
      if (updates.config) next.config = { ...next.config, ...updates.config };
      if (updates.request_config)
        next.request_config = { ...next.request_config, ...updates.request_config };
      if (updates.autoscaling_config)
        next.autoscaling_config = {
          ...normalized.autoscaling_config,
          ...updates.autoscaling_config,
        };
      if (updates.session_pool_config)
        next.session_pool_config = {
          ...next.session_pool_config,
          ...updates.session_pool_config,
        };
      if (updates.proxy_config)
        next.proxy_config = { ...next.proxy_config, ...updates.proxy_config };
      if (updates.storage_config)
        next.storage_config = { ...next.storage_config, ...updates.storage_config };
      if (updates.request_queue_config)
        next.request_queue_config = {
          ...next.request_queue_config,
          ...updates.request_queue_config,
        };
      if (updates.error_handling_config)
        next.error_handling_config = {
          ...next.error_handling_config,
          ...updates.error_handling_config,
        };
      if (updates.url_patterns)
        next.url_patterns = { ...next.url_patterns, ...updates.url_patterns };
      if (updates.selectors) next.selectors = { ...next.selectors, ...updates.selectors };
      if (updates.request_handler !== undefined) next.request_handler = updates.request_handler;
      if (updates.failed_request_handler !== undefined)
        next.failed_request_handler = updates.failed_request_handler;
      if (updates.pre_navigation_hooks)
        next.pre_navigation_hooks = Array.isArray(updates.pre_navigation_hooks)
          ? updates.pre_navigation_hooks
          : next.pre_navigation_hooks;
      if (updates.post_navigation_hooks)
        next.post_navigation_hooks = Array.isArray(updates.post_navigation_hooks)
          ? updates.post_navigation_hooks
          : next.post_navigation_hooks;
      if (updates.schedule !== undefined) next.schedule = updates.schedule;
      if (updates.campaign_id !== undefined) next.campaign_id = updates.campaign_id || null;
      if (updates.seeder_service_id !== undefined)
        next.seeder_service_id = updates.seeder_service_id || null;
      if (updates.tags)
        next.tags = Array.isArray(updates.tags)
          ? updates.tags
          : [updates.tags].flat().filter(Boolean);
      if (updates.metadata)
        next.metadata = {
          ...next.metadata,
          ...(typeof updates.metadata === 'object' && !Array.isArray(updates.metadata)
            ? updates.metadata
            : {}),
        };
      if (updates.stats)
        next.stats = {
          ...next.stats,
          ...(typeof updates.stats === 'object' && !Array.isArray(updates.stats)
            ? updates.stats
            : {}),
        };
      if (updates.seeds && Array.isArray(updates.seeds)) next.seeds = updates.seeds;
      if (updates.results && Array.isArray(updates.results)) next.results = updates.results;

      if (updates.started_at !== undefined) next.started_at = updates.started_at;
      if (updates.finished_at !== undefined) next.finished_at = updates.finished_at;
      if (updates.last_run_at !== undefined) next.last_run_at = updates.last_run_at;

      next.updated_at = new Date().toISOString();
      return next;
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    return res.json({ success: true, crawler: normalizeCrawlerRecord(updated) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to update crawler', details: err.message });
  }
});

app.delete('/api/crawlee/crawlers/:id', async (req, res) => {
  try {
    const crawlers = await loadCrawlerStore();
    const index = crawlers.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    crawlers.splice(index, 1);
    await saveCrawlerStore(crawlers);
    return res.json({ success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to delete crawler', details: err.message });
  }
});

app.post('/api/crawlee/crawlers/:id/start', async (req, res) => {
  try {
    const { seedUrls = [] } = req.body || {};
    const updated = await updateCrawlerInStore(req.params.id, existing => {
      if (!existing) return null;
      const normalized = normalizeCrawlerRecord(existing);
      const now = new Date().toISOString();
      normalized.status = 'running';
      normalized.started_at = now;
      normalized.last_run_at = now;

      if (Array.isArray(seedUrls) && seedUrls.length > 0) {
        const newSeeds = seedUrls
          .map(url => (typeof url === 'string' ? { url } : url))
          .filter(Boolean)
          .map(seed => ({
            url: seed.url,
            label: seed.label || null,
            added_at: now,
            status: 'pending',
            userData: seed.userData || seed.user_data || null,
          }));
        normalized.seeds = [...normalized.seeds, ...newSeeds];
      }

      return { ...normalized, updated_at: now };
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }

    return res.json({ success: true, crawler: normalizeCrawlerRecord(updated) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to start crawler', details: err.message });
  }
});

app.post('/api/crawlee/crawlers/:id/pause', async (req, res) => {
  try {
    const updated = await updateCrawlerInStore(req.params.id, existing => {
      if (!existing) return null;
      const normalized = normalizeCrawlerRecord(existing);
      normalized.status = 'paused';
      normalized.updated_at = new Date().toISOString();
      return normalized;
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    return res.json({ success: true, crawler: normalizeCrawlerRecord(updated) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to pause crawler', details: err.message });
  }
});

app.post('/api/crawlee/crawlers/:id/resume', async (req, res) => {
  try {
    const updated = await updateCrawlerInStore(req.params.id, existing => {
      if (!existing) return null;
      const normalized = normalizeCrawlerRecord(existing);
      normalized.status = 'running';
      normalized.updated_at = new Date().toISOString();
      return normalized;
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    return res.json({ success: true, crawler: normalizeCrawlerRecord(updated) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to resume crawler', details: err.message });
  }
});

app.post('/api/crawlee/crawlers/:id/stop', async (req, res) => {
  try {
    const updated = await updateCrawlerInStore(req.params.id, existing => {
      if (!existing) return null;
      const normalized = normalizeCrawlerRecord(existing);
      normalized.status = 'idle';
      normalized.finished_at = new Date().toISOString();
      normalized.updated_at = normalized.finished_at;
      return normalized;
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    return res.json({ success: true, crawler: normalizeCrawlerRecord(updated) });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to stop crawler', details: err.message });
  }
});

app.get('/api/crawlee/crawlers/:id/stats', async (req, res) => {
  try {
    const crawler = await getCrawlerFromStore(req.params.id);
    if (!crawler) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    const normalized = normalizeCrawlerRecord(crawler);
    return res.json({ success: true, stats: normalized.stats });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to get stats', details: err.message });
  }
});

app.post('/api/crawlee/crawlers/:id/seeds', async (req, res) => {
  try {
    const seedsPayload = req.body?.seeds || [];
    if (!Array.isArray(seedsPayload) || seedsPayload.length === 0) {
      return res.status(400).json({ success: false, error: 'seeds array is required' });
    }

    const updated = await updateCrawlerInStore(req.params.id, existing => {
      if (!existing) return null;
      const normalized = normalizeCrawlerRecord(existing);
      const now = new Date().toISOString();
      const additions = seedsPayload
        .map(seed => (typeof seed === 'string' ? { url: seed } : seed))
        .filter(seed => seed && seed.url)
        .map(seed => ({
          url: seed.url,
          label: seed.label || null,
          priority: seed.priority || 0,
          status: seed.status || 'pending',
          added_at: now,
          userData: seed.userData || seed.user_data || null,
        }));

      normalized.seeds = [...normalized.seeds, ...additions];
      normalized.updated_at = now;
      return normalized;
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }

    return res.json({ success: true, seeds: normalizeCrawlerRecord(updated).seeds });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to add seeds', details: err.message });
  }
});

app.get('/api/crawlee/crawlers/:id/results', async (req, res) => {
  try {
    const crawler = await getCrawlerFromStore(req.params.id);
    if (!crawler) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    const normalized = normalizeCrawlerRecord(crawler);
    return res.json({ success: true, results: normalized.results || [] });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to get results', details: err.message });
  }
});

app.get('/api/crawlee/crawlers/:id/logs', async (req, res) => {
  try {
    const crawler = await getCrawlerFromStore(req.params.id);
    if (!crawler) {
      return res.status(404).json({ success: false, error: 'Crawler not found' });
    }
    const normalized = normalizeCrawlerRecord(crawler);
    return res.json({ success: true, logs: normalized.logs || [] });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to get logs', details: err.message });
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

loadCrawlerTypes().catch(err =>
  console.warn('Failed to warm crawler types store', err && err.message ? err.message : err)
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
