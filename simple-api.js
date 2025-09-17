// Minimal API Server for LightDom
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'running',
      database: 'pending',
      blockchain: 'pending'
    }
  });
});

// Basic blockchain endpoint
app.get('/api/blockchain/status', (req, res) => {
  res.json({
    network: 'local',
    status: 'running',
    blockHeight: 1,
    miners: 0,
    hashRate: '0 H/s'
  });
});

// DOM optimization endpoint
app.post('/api/optimization/submit', (req, res) => {
  const { url, spaceSaved, optimizations } = req.body;
  
  logInfo(`Optimization submitted for ${url}: ${spaceSaved} bytes saved`);
  
  res.json({
    success: true,
    transactionId: `tx_${Date.now()}`,
    reward: spaceSaved * 0.001, // DSH tokens
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    totalOptimizations: 0,
    spaceSaved: 0,
    activeMiners: 0,
    blocksMined: 0,
    dshTokens: 0
  });
});

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

app.listen(port, () => {
  console.log(`🚀 LightDom API Server running at http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`⛓️  Blockchain status: http://localhost:${port}/api/blockchain/status`);
});

export default app;
