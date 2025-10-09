// Simple API Server for LightDom
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import crawler from './web-crawler-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'LightDom API Server'
  });
});

// Mock metaverse mining data endpoint
app.get('/api/metaverse/mining-data', (req, res) => {
  const mockData = {
    totalMined: Math.floor(Math.random() * 10000),
    activeMiners: Math.floor(Math.random() * 100),
    tokensEarned: Math.floor(Math.random() * 1000),
    lastUpdate: new Date().toISOString(),
    miningRate: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100)
  };
  
  res.json(mockData);
});

// Mock blockchain data endpoint
app.get('/api/blockchain/stats', (req, res) => {
  const mockData = {
    totalTransactions: Math.floor(Math.random() * 100000),
    activeContracts: Math.floor(Math.random() * 50),
    gasPrice: Math.floor(Math.random() * 100),
    blockHeight: Math.floor(Math.random() * 1000000),
    networkHash: Math.floor(Math.random() * 1000000000)
  };
  
  res.json(mockData);
});

// Mock optimization data endpoint
app.get('/api/optimization/stats', (req, res) => {
  const mockData = {
    totalOptimizations: Math.floor(Math.random() * 1000),
    spaceSaved: Math.floor(Math.random() * 10000),
    performanceGain: Math.floor(Math.random() * 100),
    lastOptimization: new Date().toISOString()
  };
  
  res.json(mockData);
});

// Space Mining API endpoints
app.get('/api/space-mining/spatial-structures', (req, res) => {
  const mockData = {
    structures: [
      {
        id: 'struct-1',
        name: 'Quantum DOM Cluster',
        type: 'spatial',
        coordinates: { x: 100, y: 200, z: 50 },
        energy: Math.floor(Math.random() * 1000),
        status: 'active',
        lastMined: new Date().toISOString()
      },
      {
        id: 'struct-2',
        name: 'Light DOM Fragment',
        type: 'fragment',
        coordinates: { x: 150, y: 300, z: 75 },
        energy: Math.floor(Math.random() * 800),
        status: 'mining',
        lastMined: new Date().toISOString()
      }
    ],
    totalStructures: 2,
    activeMining: 1
  };
  
  res.json(mockData);
});

app.get('/api/space-mining/isolated-doms', (req, res) => {
  const mockData = {
    doms: [
      {
        id: 'dom-1',
        url: 'https://example.com',
        size: Math.floor(Math.random() * 10000),
        complexity: Math.floor(Math.random() * 100),
        lastCrawled: new Date().toISOString(),
        status: 'isolated'
      },
      {
        id: 'dom-2',
        url: 'https://test.com',
        size: Math.floor(Math.random() * 8000),
        complexity: Math.floor(Math.random() * 80),
        lastCrawled: new Date().toISOString(),
        status: 'processing'
      }
    ],
    totalDOMs: 2,
    processing: 1
  };
  
  res.json(mockData);
});

app.get('/api/space-mining/bridges', (req, res) => {
  const mockData = {
    bridges: [
      {
        id: 'bridge-1',
        name: 'Metaverse Bridge Alpha',
        status: 'connected',
        throughput: Math.floor(Math.random() * 1000),
        latency: Math.floor(Math.random() * 100),
        lastActivity: new Date().toISOString()
      },
      {
        id: 'bridge-2',
        name: 'Quantum Bridge Beta',
        status: 'connecting',
        throughput: Math.floor(Math.random() * 800),
        latency: Math.floor(Math.random() * 150),
        lastActivity: new Date().toISOString()
      }
    ],
    totalBridges: 2,
    active: 1
  };
  
  res.json(mockData);
});

app.get('/api/space-mining/stats', (req, res) => {
  const mockData = {
    totalMined: Math.floor(Math.random() * 100000),
    activeMiners: Math.floor(Math.random() * 50),
    tokensEarned: Math.floor(Math.random() * 5000),
    miningRate: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100),
    lastUpdate: new Date().toISOString()
  };
  
  res.json(mockData);
});

// Web Crawler API endpoints
app.get('/api/crawler/stats', (req, res) => {
  const stats = crawler.getStats();
  res.json(stats);
});

app.get('/api/crawler/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const recent = crawler.getRecentCrawls(limit);
  res.json({ crawls: recent });
});

app.post('/api/crawler/start', (req, res) => {
  crawler.startCrawling();
  res.json({ message: 'Crawler started', status: 'success' });
});

app.post('/api/crawler/stop', (req, res) => {
  crawler.stopCrawling();
  res.json({ message: 'Crawler stopped', status: 'success' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LightDom API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⛏️  Mining data: http://localhost:${PORT}/api/metaverse/mining-data`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 API Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 API Server shutting down...');
  process.exit(0);
});
