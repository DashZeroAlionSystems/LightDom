#!/usr/bin/env node
/**
 * Seed crawler types by fetching metadata from Crawlee docs (when available)
 * and upserting into Postgres `crawler_types` table. Falls back to writing
 * data/crawlee-crawler-types.json when DB is unreachable.
 *
 * Usage:
 *   node scripts/seed-crawler-types-from-web.js
 *   node scripts/seed-crawler-types-from-web.js --from-web    # attempt to fetch pages
 *   node scripts/seed-crawler-types-from-web.js --dry-run     # print only, no DB/file writes
 *
 * Environment:
 *   - Uses DATABASE_URL if present, otherwise DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.
 */
import { load } from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';

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

function coerceFeatureList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => (item === undefined || item === null ? '' : String(item).trim()))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    return Object.values(value)
      .map(item => (item === undefined || item === null ? '' : String(item).trim()))
      .filter(Boolean);
  }
  return [];
}

function normalizeCrawlerTypeRecord(type) {
  const rawId = type?.id || type?.name || '';
  const id = createCrawlerTypeSlug(rawId) || String(rawId).trim();

  return {
    id,
    name: type?.name || id || 'Crawler Type',
    description: type?.description || '',
    features: coerceFeatureList(type?.features),
    usage: type?.usage || '',
    docs_url: type?.docs_url || null,
    default_config: type?.default_config || {},
    default_request_config: type?.default_request_config || {},
    default_url_patterns: type?.default_url_patterns || {},
    default_selectors: type?.default_selectors || {},
    notes: type?.notes || null,
  };
}

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
      launchOptions: { args: ['--disable-dev-shm-usage'] },
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
  },
  {
    id: 'basic',
    name: 'BasicCrawler',
    description: 'Low-level crawler with fine control over request queue and handlers.',
    features: ['Fine-grained control', 'Custom request handlers'],
    usage: 'Use when you need direct control over request lifecycle and queuing.',
    docs_url: 'https://crawlee.dev/docs/api/basic-crawler/class/BasicCrawler',
    default_config: {
      maxRequestsPerCrawl: 1000,
      maxConcurrency: 5,
      requestHandlerTimeoutSecs: 60,
    },
  },
];

const CREATE_TABLE_SQL = `
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
`;

const UPSERT_SQL = `
INSERT INTO crawler_types (
  id, name, description, features, usage, docs_url,
  default_config, default_request_config, default_url_patterns,
  default_selectors, notes
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
  updated_at = CURRENT_TIMESTAMP;
`;

async function fetchPage(url, fetchFn) {
  try {
    const res = await fetchFn(url, {
      method: 'GET',
      headers: {
        'user-agent': 'LightDomSeeder/1.0 (+https://github.com/DashZeroAlionSystems/LightDom)',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      console.warn(`[fetch] ${url} returned HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`[fetch] failed for ${url}: ${err && err.message ? err.message : err}`);
    return null;
  }
}

function extractDocsMetadata(htmlContent, url) {
  try {
    const $ = load(htmlContent);
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      null;

    let features = [];

    // Heuristic #1: look for headings that include "feature" and take next UL
    const headings = $('h1,h2,h3').toArray();
    for (const h of headings) {
      const text = $(h).text().trim().toLowerCase();
      if (text.includes('feature') || text.includes('capabilit') || text.includes('what you')) {
        let next = $(h).next();
        for (let i = 0; i < 6 && next && next.length; i++) {
          if (next.is('ul') || next.is('ol')) {
            features = next
              .find('li')
              .map((i, li) => $(li).text().trim())
              .get();
            break;
          }
          next = next.next();
        }
        if (features.length) break;
      }
    }

    // Heuristic #2: pick an early UL that looks like a feature list
    if (!features.length) {
      $('ul').each((i, el) => {
        const items = $(el)
          .find('li')
          .map((i, li) => $(li).text().trim())
          .get()
          .filter(Boolean);
        if (items.length >= 2 && items.every(s => s.length < 140)) {
          // Prefer lists containing known keywords
          const keywords = [
            'javascript',
            'chrome',
            'playwright',
            'puppeteer',
            'screenshot',
            'network',
            'fast',
            'low',
            'session',
          ];
          const matches = items.filter(it => keywords.some(k => it.toLowerCase().includes(k)));
          if (matches.length > 0) {
            features = items;
            return false; // break
          } else if (!features.length && items.length > 3) {
            features = items; // fallback candidate
          }
        }
      });
    }

    // Heuristic for usage: first paragraph in the main/article or near H1
    let usage = '';
    usage = $('main p').first().text().trim() || $('article p').first().text().trim() || '';
    if (!usage) {
      const h1 = $('h1').first();
      if (h1 && h1.length) {
        let p = h1.nextAll('p').first();
        if (p && p.length) usage = p.text().trim();
      }
    }

    features = Array.from(new Set((features || []).map(s => s.replace(/\s+/g, ' ').trim()))).filter(
      Boolean
    );

    return {
      title: title || null,
      description: description || (usage ? usage.slice(0, 300) : null),
      usage: usage || null,
      features,
    };
  } catch (err) {
    console.warn('extractDocsMetadata failed for', url, err && err.message ? err.message : err);
    return { title: null, description: null, usage: null, features: [] };
  }
}

async function enrichWithWebMetadata(types, fetchFn) {
  for (const t of types) {
    if (!t.docs_url) continue;
    try {
      const htmlContent = await fetchPage(t.docs_url, fetchFn);
      if (!htmlContent) continue;
      const meta = extractDocsMetadata(htmlContent, t.docs_url);
      // Merge heuristics: only replace when we have better info
      if (meta.title) t.name = meta.title;
      if (meta.description && (!t.description || t.description.length < 40))
        t.description = meta.description;
      if (meta.usage && (!t.usage || t.usage.length < 40)) t.usage = meta.usage;
      if ((!t.features || t.features.length === 0) && meta.features && meta.features.length > 0) {
        t.features = meta.features;
      }
    } catch (err) {
      console.warn(
        'enrichWithWebMetadata error for',
        t.docs_url,
        err && err.message ? err.message : err
      );
    }
  }
  return types;
}

async function writeToFileFallback(types) {
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  const fp = path.join(dataDir, 'crawlee-crawler-types.json');
  const normalized = types
    .map(normalizeCrawlerTypeRecord)
    .sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(fp, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('Wrote crawler types to local file fallback:', fp);
}

async function upsertCrawlerType(pool, rawType) {
  const t = normalizeCrawlerTypeRecord(rawType);

  // Serialize JSON/JSONB fields explicitly to avoid PG array literal vs JSON ambiguity
  const featuresJson = JSON.stringify(t.features || []);
  const defaultConfigJson = JSON.stringify(t.default_config || {});
  const defaultRequestConfigJson = JSON.stringify(t.default_request_config || {});
  const defaultUrlPatternsJson = JSON.stringify(t.default_url_patterns || {});
  const defaultSelectorsJson = JSON.stringify(t.default_selectors || {});

  await pool.query(UPSERT_SQL, [
    t.id,
    t.name,
    t.description,
    featuresJson,
    t.usage,
    t.docs_url,
    defaultConfigJson,
    defaultRequestConfigJson,
    defaultUrlPatternsJson,
    defaultSelectorsJson,
    t.notes,
  ]);
  return t;
}

async function main() {
  const args = process.argv.slice(2);
  const fromWeb = args.includes('--from-web');
  const dryRun = args.includes('--dry-run');

  // Build normalized types
  let types = DEFAULT_CRAWLER_TYPES.map(t => normalizeCrawlerTypeRecord(t));

  // Attempt to use a fetch implementation (global fetch or node-fetch fallback)
  let fetchFn;
  if (typeof globalThis.fetch === 'function') {
    fetchFn = globalThis.fetch.bind(globalThis);
  } else {
    try {
      const mod = await import('node-fetch');
      fetchFn = mod.default;
    } catch (_) {
      // Last resort: throw if we need to fetch
      fetchFn = null;
    }
  }

  if (fromWeb) {
    if (!fetchFn) {
      console.warn('--from-web requested but no fetch available; skipping web enrichment.');
    } else {
      console.log('Fetching additional metadata from Crawlee docs (may take a few seconds)...');
      await enrichWithWebMetadata(types, fetchFn);
    }
  }

  if (dryRun) {
    console.log('Dry-run: normalized crawler types (no DB write):');
    console.log(JSON.stringify(types, null, 2));
    return;
  }

  // Build DB pool config
  const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'dom_space_harvester',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 5,
      };

  let pool;
  try {
    pool = new Pool(poolConfig);
    // quick connectivity check
    await pool.query('SELECT 1');
  } catch (err) {
    console.warn(
      'Database not reachable; falling back to file storage. Error:',
      err && err.message ? err.message : err
    );
    await writeToFileFallback(types);
    if (pool) await pool.end().catch(() => {});
    return;
  }

  try {
    console.log('Ensuring crawler_types table exists...');
    await pool.query(CREATE_TABLE_SQL);

    for (const t of types) {
      console.log(`Upserting: ${t.id} — ${t.name}`);
      await upsertCrawlerType(pool, t);
    }
    console.log('Done: crawler types seeded into database.');
  } catch (err) {
    console.error('Seeding failed:', err && (err.message || err));
  } finally {
    await pool.end().catch(() => {});
  }
}

main().catch(err => {
  console.error('Unhandled error in seeder:', err && (err.stack || err.message || err));
  process.exit(1);
});
