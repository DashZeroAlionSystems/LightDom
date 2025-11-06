#!/usr/bin/env node

/**
 * Enhanced Crawler Orchestration Service
 * Wraps enhanced-web-crawler-service with an Express API for workflow access.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crawler from '../enhanced-web-crawler-service.js';

const PORT = Number(process.env.CRAWLER_PORT || 4200);
const HOST = process.env.CRAWLER_HOST || '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

let crawlerInitialized = false;

async function ensureInitialized() {
  if (!crawlerInitialized) {
    await crawler.initialize?.();
    crawlerInitialized = true;
  }
}

app.get('/health', (_req, res) => {
  const status = crawler.getStatus?.() || { status: 'unknown' };
  res.json({
    status: 'ok',
    service: 'Enhanced Crawler Service',
    timestamp: new Date().toISOString(),
    details: status,
  });
});

app.post('/start', async (req, res) => {
  try {
    await ensureInitialized();
    await crawler.startCrawling();
    res.json({ success: true, status: crawler.getStatus?.() });
  } catch (error) {
    console.error('Failed to start crawler:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/stop', async (_req, res) => {
  try {
    await crawler.stopCrawling?.();
    res.json({ success: true, status: crawler.getStatus?.() });
  } catch (error) {
    console.error('Failed to stop crawler:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/crawl-once', async (req, res) => {
  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ success: false, error: 'url is required' });
  }
  try {
    await ensureInitialized();
    const result = await crawler.crawlUrl(url);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Single crawl failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/status', (_req, res) => {
  res.json({ success: true, status: crawler.getStatus?.() });
});

app.get('/stats', (_req, res) => {
  res.json({ success: true, stats: crawler.getStats?.() });
});

app.get('/recent', (req, res) => {
  const limit = Number(req.query.limit || 10);
  res.json({ success: true, items: crawler.getRecentCrawls?.(limit) || [] });
});

const server = app.listen(PORT, HOST, async () => {
  console.log(`🕸️  Enhanced Crawler Service listening on http://${HOST}:${PORT}`);
  try {
    await ensureInitialized();
    console.log('✅ Crawler initialized');
  } catch (error) {
    console.error('❌ Crawler initialization failed:', error.message);
  }
});

async function shutdown() {
  console.log('\n🛑 Shutting down Enhanced Crawler Service...');
  await crawler.stopCrawling?.();
  await crawler.close?.();
  server.close(() => {
    console.log('✅ Crawler service stopped');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
