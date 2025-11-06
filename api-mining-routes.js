import { IntegratedOptimizationMiner } from './blockchain/IntegratedOptimizationMiner.js';

/**
 * Add mining routes to Express app
 */
export function addMiningRoutes(app, config = {}) {
  let miningSystem = null;

  // Initialize mining system lazily
  const getMiningSystem = async () => {
    if (!miningSystem) {
      miningSystem = new IntegratedOptimizationMiner({
        crawlerConfig: {
          maxConcurrency: config.maxConcurrency || 2,
          requestDelay: config.requestDelay || 1000,
          maxDepth: config.maxDepth || 1,
          ...config.crawlerConfig
        },
        miningConfig: {
          rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
          chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '1337'),
          miningInterval: 15000,
          minOptimizationsPerBlock: 2,
          ...config.miningConfig
        },
        seedUrls: config.seedUrls || [
          'https://example.com',
          'https://httpbin.org',
          'https://jsonplaceholder.typicode.com'
        ]
      });
      
      await miningSystem.initialize();
    }
    return miningSystem;
  };

  // Get mining statistics
  app.get('/api/mining/stats', async (req, res) => {
    try {
      const system = await getMiningSystem();
      const status = system.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start mining
  app.post('/api/mining/start', async (req, res) => {
    try {
      const system = await getMiningSystem();
      
      if (system.isRunning) {
        return res.status(400).json({ error: 'Mining is already running' });
      }

      await system.start();
      res.json({ success: true, message: 'Mining started successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stop mining
  app.post('/api/mining/stop', async (req, res) => {
    try {
      const system = await getMiningSystem();
      
      if (!system.isRunning) {
        return res.status(400).json({ error: 'Mining is not running' });
      }

      await system.stop();
      res.json({ success: true, message: 'Mining stopped' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get recent blocks
  app.get('/api/mining/blocks/recent', async (req, res) => {
    try {
      const system = await getMiningSystem();
      
      if (!system.miner) {
        return res.json([]);
      }

      const limit = parseInt(req.query.limit) || 10;
      const blocks = system.miner.minedBlocks.slice(-limit).reverse();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get training data
  app.get('/api/mining/training-data', async (req, res) => {
    try {
      const system = await getMiningSystem();
      
      if (!system.miner) {
        return res.status(400).json({ error: 'Mining system not initialized' });
      }

      const trainingData = await system.miner.getTrainingData();
      res.json(trainingData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export training data
  app.post('/api/mining/export-training-data', async (req, res) => {
    try {
      const system = await getMiningSystem();
      await system.exportTrainingData();
      res.json({ success: true, message: 'Training data exported' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get SEO insights
  app.get('/api/mining/seo-insights', async (req, res) => {
    try {
      const system = await getMiningSystem();
      const insights = await system.generateSEOInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit optimization manually (for testing)
  app.post('/api/mining/submit-optimization', async (req, res) => {
    try {
      const system = await getMiningSystem();
      const { url, spaceSaved, optimizations } = req.body;
      
      if (!url || !spaceSaved) {
        return res.status(400).json({ error: 'URL and spaceSaved are required' });
      }

      const optimization = {
        url,
        spaceSaved,
        optimizations: optimizations || [],
        timestamp: new Date().toISOString(),
        crawlId: `manual_${Date.now()}`
      };

      await system.miner.addOptimization(optimization);
      res.json({ success: true, message: 'Optimization queued for mining' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log('✅ Mining routes added to API server');
}
