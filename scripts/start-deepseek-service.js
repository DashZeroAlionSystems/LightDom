#!/usr/bin/env node

/**
 * DeepSeek Orchestration Service
 * Lightweight Express server that exposes DeepSeek automation endpoints
 * and provides a health check for the startup script.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import deepSeekService from '../services/deepseek-api-service.js';

const PORT = Number(process.env.DEEPSEEK_PORT || 4100);
const HOST = process.env.DEEPSEEK_HOST || '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.get('/health', async (_req, res) => {
  try {
    const status = await deepSeekService.healthCheck();
    res.json({
      status: 'ok',
      service: 'DeepSeek Orchestration Service',
      timestamp: new Date().toISOString(),
      details: status,
    });
  } catch (error) {
    console.error('DeepSeek health check failed:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'DeepSeek Orchestration Service',
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
    });
  }
});

app.post('/workflow/generate', async (req, res) => {
  const { prompt, options } = req.body || {};

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'prompt is required',
    });
  }

  try {
    const workflow = await deepSeekService.generateWorkflowFromPrompt(prompt, options);
    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Failed to generate workflow:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/seeds/generate', async (req, res) => {
  const { campaignDescription, clientSiteUrl, options } = req.body || {};

  if (!campaignDescription || !clientSiteUrl) {
    return res.status(400).json({
      success: false,
      error: 'campaignDescription and clientSiteUrl are required',
    });
  }

  try {
    const seeds = await deepSeekService.generateURLSeeds(campaignDescription, clientSiteUrl, options);
    res.json({ success: true, seeds });
  } catch (error) {
    console.error('Failed to generate seeds:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/schema/generate', async (req, res) => {
  const { purpose, existingSchemas = [], options } = req.body || {};

  if (!purpose) {
    return res.status(400).json({
      success: false,
      error: 'purpose is required',
    });
  }

  try {
    const schema = await deepSeekService.buildCrawlerSchema(purpose, existingSchemas, options);
    res.json({ success: true, schema });
  } catch (error) {
    console.error('Failed to generate schema:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/pipeline/generate', async (req, res) => {
  const { schemas, goal, options } = req.body || {};

  if (!Array.isArray(schemas) || schemas.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'schemas array is required',
    });
  }

  try {
    const pipeline = await deepSeekService.generateWorkflowPipeline(schemas, goal, options);
    res.json({ success: true, pipeline });
  } catch (error) {
    console.error('Failed to generate pipeline:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/config/optimize', async (req, res) => {
  const { currentConfig, analyticsData, options } = req.body || {};

  if (!currentConfig || typeof currentConfig !== 'object') {
    return res.status(400).json({ success: false, error: 'currentConfig object is required' });
  }

  try {
    const optimized = await deepSeekService.optimizeCrawlerConfig(currentConfig, analyticsData, options);
    res.json({ success: true, optimized });
  } catch (error) {
    console.error('Failed to optimize config:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`🧠 DeepSeek Orchestration Service listening on http://${HOST}:${PORT}`);
});

function shutdown() {
  console.log('\n🛑 Shutting down DeepSeek Orchestration Service...');
  server.close(() => {
    console.log('✅ DeepSeek service stopped');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
