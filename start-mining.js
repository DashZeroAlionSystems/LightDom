#!/usr/bin/env node

import { config } from 'dotenv';
import { addMiningRoutes } from './api-mining-routes.js';
import express from 'express';
import cors from 'cors';

// Load environment variables
config();

console.log('🚀 Starting LightDOM Mining System...');
console.log('=====================================');

// Create Express app for mining API
const app = express();
app.use(cors());
app.use(express.json());

// Add mining routes
addMiningRoutes(app, {
  crawlerConfig: {
    maxConcurrency: 3,
    requestDelay: 2000,
    maxDepth: 2
  },
  miningConfig: {
    miningInterval: 30000, // 30 seconds
    minOptimizationsPerBlock: 3
  },
  seedUrls: [
    'https://example.com',
    'https://wikipedia.org',
    'https://github.com',
    'https://stackoverflow.com',
    'https://medium.com',
    'https://dev.to',
    'https://reddit.com',
    'https://news.ycombinator.com'
  ]
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'LightDOM Mining API',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.MINING_API_PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Mining API server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000/mining`);
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/mining/stats');
  console.log('  POST /api/mining/start');
  console.log('  POST /api/mining/stop');
  console.log('  GET  /api/mining/blocks/recent');
  console.log('  GET  /api/mining/training-data');
  console.log('  GET  /api/mining/seo-insights');
  console.log('\n🛑 Press Ctrl+C to stop');
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mining system...');
  process.exit(0);
});
