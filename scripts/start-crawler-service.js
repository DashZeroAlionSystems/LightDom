#!/usr/bin/env node

/**
 * Enhanced Crawler Orchestration Service
 * Wraps enhanced-web-crawler-service with an Express API for workflow access.
 */

import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import crawler from '../enhanced-web-crawler-service.js';
import CrawlerOrchestrationService from '../services/crawler-orchestration-service.js';

const PORT = Number(process.env.CRAWLER_PORT || 4200);
const HOST = process.env.CRAWLER_HOST || '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

const orchestrator = new CrawlerOrchestrationService();
let orchestratorReady = false;

async function ensureInitialized() {
  if (!orchestratorReady) {
    await orchestrator.initialize();
    orchestratorReady = true;
  }
}

app.get('/health', async (_req, res) => {
  try {
    await ensureInitialized();
    const status = await orchestrator.getStatus();
    res.json({
      status: 'ok',
      service: 'Crawler Orchestration Service',
      timestamp: new Date().toISOString(),
      details: status,
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.post('/configure', async (req, res) => {
  try {
    await ensureInitialized();
    await orchestrator.configureLegacyCrawler(req.body || {});
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to configure crawler:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/start', async (req, res) => {
  try {
    await ensureInitialized();
    const status = await orchestrator.startLegacyCrawler(req.body?.config || {});
    res.json({ success: true, status });
  } catch (error) {
    console.error('Failed to start legacy crawler:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/start-all', async (_req, res) => {
  try {
    await ensureInitialized();
    const started = await orchestrator.startManagedCrawlers();
    res.json({ success: true, started });
  } catch (error) {
    console.error('Failed to start crawlers:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/ensure-template', async (req, res) => {
  try {
    await ensureInitialized();
    const templateId = await orchestrator.ensureTemplate(req.body || {});
    res.json({ success: true, templateId });
  } catch (error) {
    console.error('Failed to ensure template:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/seed/sync', async (req, res) => {
  try {
    await ensureInitialized();
    const seederServiceId = req.body?.seederServiceId || req.body?.seeder_service_id;
    const seeds = req.body?.seeds || [];
    const result = await orchestrator.syncTemplateSeeds(seederServiceId, seeds);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to sync seeds:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/attribute-campaign/ensure', async (req, res) => {
  try {
    await ensureInitialized();
    const result = await orchestrator.ensureAttributeCampaign(req.body || {});
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to ensure attribute campaign:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/attribute-campaign/seed', async (req, res) => {
  try {
    await ensureInitialized();
    const result = await orchestrator.seedAttributeCampaign(req.body || {});
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to seed attribute campaign:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/attribute-campaign/start', async (req, res) => {
  try {
    await ensureInitialized();
    const result = await orchestrator.startAttributeCampaign(req.body || {});
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to start attribute campaign:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/attribute-campaign/summary', async (req, res) => {
  try {
    await ensureInitialized();
    const queryOptions = {
      includeBundle: req.query.includeBundle !== 'false',
    };
    if (req.query.attributes) {
      queryOptions.attributes = String(req.query.attributes)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
    if (req.query.bundleId) {
      queryOptions.bundleId = req.query.bundleId;
    }
    const result = await orchestrator.attributeSeedSummary(queryOptions);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to fetch attribute campaign summary:', error.message);
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
    await crawler.initialize();
    const result = await crawler.crawlUrl(url);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Single crawl failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/stop', async (_req, res) => {
  try {
    await ensureInitialized();
    await crawler.stopCrawling?.();
    res.json({ success: true, status: crawler.getStatus?.() });
  } catch (error) {
    console.error('Failed to stop crawler:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/status', async (_req, res) => {
  try {
    await ensureInitialized();
    const status = await orchestrator.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Failed to fetch status:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/stats', async (_req, res) => {
  try {
    await ensureInitialized();
    const stats = crawler.getStats?.();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Failed to fetch stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/recent', async (req, res) => {
  try {
    await ensureInitialized();
    const limit = Number(req.query.limit || 10);
    const items = crawler.getRecentCrawls?.(limit) || [];
    res.json({ success: true, items });
  } catch (error) {
    console.error('Failed to fetch recent crawls:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/seeding/stats', async (_req, res) => {
  try {
    await ensureInitialized();
    const stats = await orchestrator.refreshSeederStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Failed to fetch seeding stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(PORT, HOST, async () => {
  console.log(`🕸️  Crawler orchestration service listening on http://${HOST}:${PORT}`);
  try {
    await ensureInitialized();
    console.log('✅ Crawler orchestrator initialized');
  } catch (error) {
    console.error('❌ Crawler orchestration initialization failed:', error.message);
  }
});

async function shutdown() {
  console.log('\n🛑 Shutting down crawler orchestration service...');
  try {
    await orchestrator.shutdown();
  } catch (error) {
    console.error('Failed to shutdown orchestrator cleanly:', error.message);
  }

  server.close(() => {
    console.log('✅ Crawler service stopped');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
