/**
 * Enhanced Optimization Server - Complete API server for space optimization tracking
 * Integrates with PostgreSQL database and provides real-time WebSocket updates
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { Pool } from 'pg';
import { optimizationAPI } from '../api/optimizationApi';
import { advancedNodeAPI } from '../api/advancedNodeApi';
import { metaverseMiningAPI } from '../api/metaverseMiningApi';
import { blockchainModelStorageAPI } from '../api/blockchainModelStorageApi';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { userWorkflowSimulator } from '../core/UserWorkflowSimulator';
import { integrationTests } from '../tests/IntegrationTests';

export class OptimizationServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private db: Pool;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Initialize database connection
    this.db = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'lightdom_optimization',
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT || '5432'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupDatabase();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Optimization routes
    this.app.post('/api/optimization/submit', (req, res) => {
      optimizationAPI.submitOptimization(req, res);
    });

    this.app.get('/api/optimization/list', (req, res) => {
      optimizationAPI.getOptimizations(req, res);
    });

    this.app.get('/api/optimization/:proofHash', (req, res) => {
      optimizationAPI.getOptimization(req, res);
    });

    // Harvester routes
    this.app.get('/api/harvester/:address', (req, res) => {
      optimizationAPI.getHarvesterStats(req, res);
    });

    this.app.get('/api/harvester/list', (req, res) => {
      optimizationAPI.getHarvesters(req, res);
    });

    // Metaverse routes
    this.app.get('/api/metaverse/stats', (req, res) => {
      optimizationAPI.getMetaverseStats(req, res);
    });

    this.app.get('/api/metaverse/assets', (req, res) => {
      optimizationAPI.getMetaverseAssets(req, res);
    });

    // Analytics routes
    this.app.get('/api/analytics/optimization', (req, res) => {
      optimizationAPI.getOptimizationAnalytics(req, res);
    });

    this.app.get('/api/feed/optimizations', (req, res) => {
      optimizationAPI.getOptimizationFeed(req, res);
    });

    // Advanced Node Management routes
    this.app.post('/api/nodes/create', (req, res) => {
      advancedNodeAPI.createNode(req, res);
    });

    this.app.get('/api/nodes/list', (req, res) => {
      advancedNodeAPI.getNodes(req, res);
    });

    this.app.get('/api/nodes/:id', (req, res) => {
      advancedNodeAPI.getNode(req, res);
    });

    this.app.post('/api/nodes/:id/scale', (req, res) => {
      advancedNodeAPI.scaleUpNode(req, res);
    });

    this.app.post('/api/nodes/merge', (req, res) => {
      advancedNodeAPI.mergeNodes(req, res);
    });

    this.app.get('/api/nodes/stats', (req, res) => {
      advancedNodeAPI.getSystemStats(req, res);
    });

    this.app.get('/api/nodes/recommendations', (req, res) => {
      advancedNodeAPI.getRecommendations(req, res);
    });

    this.app.post('/api/nodes/network', (req, res) => {
      advancedNodeAPI.createNetwork(req, res);
    });

    this.app.post('/api/nodes/:id/optimize', (req, res) => {
      advancedNodeAPI.runContinuousOptimization(req, res);
    });

    this.app.post('/api/nodes/optimize-storage', (req, res) => {
      advancedNodeAPI.optimizeStorage(req, res);
    });

    // Task Management routes
    this.app.post('/api/tasks/create', (req, res) => {
      advancedNodeAPI.createTask(req, res);
    });

    this.app.get('/api/tasks/list', (req, res) => {
      advancedNodeAPI.getTasks(req, res);
    });

    this.app.post('/api/tasks/process', (req, res) => {
      advancedNodeAPI.processTasks(req, res);
    });

    // Metaverse Mining routes
    this.app.get('/api/metaverse/mining-data', (req, res) => {
      metaverseMiningAPI.getMiningData(req, res);
    });

    this.app.post('/api/metaverse/toggle-mining', (req, res) => {
      metaverseMiningAPI.toggleMining(req, res);
    });

    this.app.post('/api/metaverse/add-task', (req, res) => {
      metaverseMiningAPI.addMiningTask(req, res);
    });

    this.app.get('/api/metaverse/algorithms', (req, res) => {
      metaverseMiningAPI.getAlgorithms(req, res);
    });

    this.app.get('/api/metaverse/data-mining', (req, res) => {
      metaverseMiningAPI.getDataMiningResults(req, res);
    });

    this.app.get('/api/metaverse/upgrades', (req, res) => {
      metaverseMiningAPI.getBlockchainUpgrades(req, res);
    });

    this.app.get('/api/metaverse/biomes', (req, res) => {
      metaverseMiningAPI.getBiomes(req, res);
    });

    this.app.get('/api/metaverse/stats', (req, res) => {
      metaverseMiningAPI.getMiningStats(req, res);
    });

    this.app.post('/api/metaverse/deploy-upgrade', (req, res) => {
      metaverseMiningAPI.deployUpgrade(req, res);
    });

    this.app.post('/api/metaverse/validate-algorithm', (req, res) => {
      metaverseMiningAPI.validateAlgorithm(req, res);
    });

    this.app.get('/api/metaverse/algorithm/:id/code', (req, res) => {
      metaverseMiningAPI.getAlgorithmCode(req, res);
    });

    this.app.get('/api/metaverse/upgrade/:id/contract', (req, res) => {
      metaverseMiningAPI.getUpgradeContract(req, res);
    });

    // Blockchain Model Storage routes
    this.app.post('/api/blockchain-models/store', (req, res) => {
      blockchainModelStorageAPI.storeModelData(req, res);
    });

    this.app.get('/api/blockchain-models/:modelId', (req, res) => {
      blockchainModelStorageAPI.getModelData(req, res);
    });

    this.app.put('/api/blockchain-models/:modelId', (req, res) => {
      blockchainModelStorageAPI.updateModelData(req, res);
    });

    this.app.delete('/api/blockchain-models/:modelId', (req, res) => {
      blockchainModelStorageAPI.deleteModelData(req, res);
    });

    this.app.get('/api/blockchain-models/ids', (req, res) => {
      blockchainModelStorageAPI.getAllModelIds(req, res);
    });

    this.app.get('/api/blockchain-models/count', (req, res) => {
      blockchainModelStorageAPI.getModelCount(req, res);
    });

    this.app.post('/api/blockchain-models/search', (req, res) => {
      blockchainModelStorageAPI.searchModels(req, res);
    });

    this.app.get('/api/blockchain-models/statistics', (req, res) => {
      blockchainModelStorageAPI.getModelStatistics(req, res);
    });

    this.app.post('/api/blockchain-models/admin/add', (req, res) => {
      blockchainModelStorageAPI.addAdmin(req, res);
    });

    this.app.delete('/api/blockchain-models/admin/remove', (req, res) => {
      blockchainModelStorageAPI.removeAdmin(req, res);
    });

    this.app.get('/api/blockchain-models/admin/list', (req, res) => {
      blockchainModelStorageAPI.getAdminAccess(req, res);
    });

    this.app.get('/api/blockchain-models/all', (req, res) => {
      blockchainModelStorageAPI.getAllModels(req, res);
    });

    this.app.get('/api/blockchain-models/admin/verify', (req, res) => {
      blockchainModelStorageAPI.verifyAdminAccess(req, res);
    });

    // Workflow Simulation routes
    this.app.post('/api/workflow/start', async (req, res) => {
      try {
        const simulation = await userWorkflowSimulator.simulateCompleteWorkflow();
        res.json({
          success: true,
          data: { simulation },
          message: 'Workflow simulation started',
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.post('/api/workflow/stop', (req, res) => {
      try {
        userWorkflowSimulator.stopAllSimulations();
        res.json({
          success: true,
          message: 'All simulations stopped',
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.post('/api/workflow/reset', (req, res) => {
      try {
        userWorkflowSimulator.stopAllSimulations();
        res.json({
          success: true,
          message: 'Simulations reset',
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.get('/api/workflow/simulations', (req, res) => {
      try {
        const simulations = userWorkflowSimulator.getAllSimulations();
        const currentSimulation = simulations.find(s => s.status === 'running') || null;
        res.json({
          success: true,
          data: { simulations, currentSimulation },
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.get('/api/workflow/stats', (req, res) => {
      try {
        const stats = userWorkflowSimulator.getSimulationStats();
        res.json({
          success: true,
          data: { stats },
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.get('/api/workflow/status', (req, res) => {
      try {
        const isRunning = userWorkflowSimulator.isSimulatorRunning();
        res.json({
          success: true,
          data: { isRunning },
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    // Integration Testing routes
    this.app.post('/api/tests/run', async (req, res) => {
      try {
        const testSuites = await integrationTests.runAllTests();
        res.json({
          success: true,
          data: { testSuites },
          message: 'All tests completed',
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.get('/api/tests/results', (req, res) => {
      try {
        const results = integrationTests.getTestResults();
        const suites = integrationTests.getTestSuites();
        res.json({
          success: true,
          data: { results, suites },
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    this.app.get('/api/tests/export', (req, res) => {
      try {
        const exportData = integrationTests.exportTestResults();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="test-results.json"');
        res.send(exportData);
      } catch (error: any) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    // Database routes
    this.app.get('/api/db/stats', async (req, res) => {
      try {
        const stats = await this.getDatabaseStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ error: 'Database error', message: error.message });
      }
    });

    this.app.get('/api/db/leaderboard', async (req, res) => {
      try {
        const leaderboard = await this.getLeaderboard();
        res.json({ success: true, data: leaderboard });
      } catch (error) {
        res.status(500).json({ error: 'Database error', message: error.message });
      }
    });

    // Real-time optimization simulation
    this.app.post('/api/simulate/optimization', (req, res) => {
      this.simulateOptimization();
      res.json({ success: true, message: 'Optimization simulation started' });
    });

    // Error handling
    this.app.use(
      (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
      }
    );

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found', message: `Route ${req.path} not found` });
    });
  }

  private setupWebSocket(): void {
    this.io.on('connection', socket => {
      console.log('Client connected:', socket.id);

      socket.on('join_optimization_feed', () => {
        socket.join('optimization_feed');
        console.log('Client joined optimization feed');
      });

      socket.on('leave_optimization_feed', () => {
        socket.leave('optimization_feed');
        console.log('Client left optimization feed');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Broadcast optimization updates
    setInterval(() => {
      const optimizations = spaceOptimizationEngine.getOptimizations();
      if (optimizations.length > 0) {
        const latest = optimizations[0];
        this.io.to('optimization_feed').emit('optimization', {
          type: 'optimization',
          optimization: latest,
        });
      }
    }, 5000);
  }

  private async setupDatabase(): Promise<void> {
    try {
      // Test database connection
      await this.db.query('SELECT NOW()');
      console.log('Database connected successfully');

      // Create tables if they don't exist
      await this.createTables();
      console.log('Database tables ready');
    } catch (error) {
      console.error('Database setup error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createTablesSQL = `
      -- Create harvesters table if not exists
      CREATE TABLE IF NOT EXISTS harvesters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address VARCHAR(42) UNIQUE NOT NULL,
        reputation INTEGER DEFAULT 0,
        total_space_harvested BIGINT DEFAULT 0,
        total_tokens_earned DECIMAL(18, 8) DEFAULT 0,
        optimization_count INTEGER DEFAULT 0,
        land_parcels INTEGER DEFAULT 0,
        ai_nodes INTEGER DEFAULT 0,
        storage_shards INTEGER DEFAULT 0,
        bridges INTEGER DEFAULT 0,
        staking_rewards DECIMAL(18, 8) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create optimizations table if not exists
      CREATE TABLE IF NOT EXISTS optimizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proof_hash VARCHAR(64) UNIQUE NOT NULL,
        harvester_id UUID REFERENCES harvesters(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        space_saved_bytes BIGINT NOT NULL,
        space_saved_kb INTEGER NOT NULL,
        optimization_type VARCHAR(50) NOT NULL,
        biome_type VARCHAR(50) NOT NULL,
        quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
        reputation_multiplier DECIMAL(5, 2) NOT NULL,
        token_reward DECIMAL(18, 8) NOT NULL,
        before_hash VARCHAR(64),
        after_hash VARCHAR(64),
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create metaverse_assets table if not exists
      CREATE TABLE IF NOT EXISTS metaverse_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        optimization_id UUID REFERENCES optimizations(id) ON DELETE CASCADE,
        harvester_id UUID REFERENCES harvesters(id) ON DELETE CASCADE,
        asset_type VARCHAR(50) NOT NULL,
        biome_type VARCHAR(50) NOT NULL,
        size INTEGER NOT NULL,
        staking_rewards DECIMAL(18, 8) NOT NULL,
        development_level INTEGER DEFAULT 1 CHECK (development_level >= 1 AND development_level <= 10),
        source_url TEXT NOT NULL,
        is_staked BOOLEAN DEFAULT FALSE,
        staked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_harvesters_address ON harvesters(address);
      CREATE INDEX IF NOT EXISTS idx_harvesters_reputation ON harvesters(reputation DESC);
      CREATE INDEX IF NOT EXISTS idx_optimizations_proof_hash ON optimizations(proof_hash);
      CREATE INDEX IF NOT EXISTS idx_optimizations_timestamp ON optimizations(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_metaverse_assets_harvester_id ON metaverse_assets(harvester_id);
    `;

    await this.db.query(createTablesSQL);
  }

  private async getDatabaseStats(): Promise<any> {
    const queries = [
      'SELECT COUNT(*) as total_harvesters FROM harvesters',
      'SELECT COUNT(*) as total_optimizations FROM optimizations',
      'SELECT COUNT(*) as total_assets FROM metaverse_assets',
      'SELECT SUM(space_saved_bytes) as total_space_saved FROM optimizations',
      'SELECT SUM(token_reward) as total_tokens_distributed FROM optimizations',
    ];

    const results = await Promise.all(queries.map(query => this.db.query(query)));

    return {
      totalHarvesters: parseInt(results[0].rows[0].total_harvesters),
      totalOptimizations: parseInt(results[1].rows[0].total_optimizations),
      totalAssets: parseInt(results[2].rows[0].total_assets),
      totalSpaceSaved: parseInt(results[3].rows[0].total_space_saved || 0),
      totalTokensDistributed: parseFloat(results[4].rows[0].total_tokens_distributed || 0),
    };
  }

  private async getLeaderboard(): Promise<any> {
    const query = `
      SELECT 
        h.address,
        h.reputation,
        h.total_space_harvested,
        h.total_tokens_earned,
        h.optimization_count,
        h.land_parcels,
        h.ai_nodes,
        h.storage_shards,
        h.bridges,
        RANK() OVER (ORDER BY h.total_space_harvested DESC) as rank_by_space,
        RANK() OVER (ORDER BY h.reputation DESC) as rank_by_reputation
      FROM harvesters h
      ORDER BY h.total_space_harvested DESC
      LIMIT 20
    `;

    const result = await this.db.query(query);
    return result.rows;
  }

  private simulateOptimization(): void {
    const websites = [
      { url: 'github.com', biome: 'digital', authority: 'high' },
      { url: 'stackoverflow.com', biome: 'knowledge', authority: 'high' },
      { url: 'medium.com', biome: 'knowledge', authority: 'medium' },
      { url: 'dev.to', biome: 'digital', authority: 'medium' },
      { url: 'hackernews.com', biome: 'community', authority: 'high' },
      { url: 'techcrunch.com', biome: 'commercial', authority: 'high' },
      { url: 'wired.com', biome: 'knowledge', authority: 'high' },
      { url: 'reddit.com', biome: 'social', authority: 'high' },
    ];

    const target = websites[Math.floor(Math.random() * websites.length)];
    const spaceFound = Math.random() * 20 + 5; // 5-25KB
    const spaceBytes = Math.floor(spaceFound * 1024);
    const tokensFromSpace = spaceFound * 0.15;
    const qualityScore = Math.floor(Math.random() * 30 + 70); // 70-100

    const optimization = {
      url: target.url,
      spaceSavedBytes: spaceBytes,
      optimizationType: ['light-dom', 'css-optimization', 'js-optimization', 'ai-optimization'][
        Math.floor(Math.random() * 4)
      ],
      biomeType: target.biome,
      harvesterAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      beforeHash: `before_${Math.random().toString(16).substr(2, 16)}`,
      afterHash: `after_${Math.random().toString(16).substr(2, 16)}`,
    };

    // Process optimization
    spaceOptimizationEngine
      .processOptimization(optimization)
      .then(result => {
        console.log(
          `Simulated optimization: ${result.spaceSavedKB}KB saved, ${result.tokenReward.toFixed(6)} DSH earned`
        );

        // Broadcast to WebSocket clients
        this.io.to('optimization_feed').emit('optimization', {
          type: 'optimization',
          optimization: result,
        });
      })
      .catch(error => {
        console.error('Error simulating optimization:', error);
      });
  }

  public async start(): Promise<void> {
    try {
      this.server.listen(this.port, () => {
        console.log(`🚀 Optimization Server running on port ${this.port}`);
        console.log(`📊 Dashboard: http://localhost:${this.port}`);
        console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
        console.log(`📈 Health: http://localhost:${this.port}/health`);
      });

      // Start simulation
      setInterval(() => {
        this.simulateOptimization();
      }, 10000); // Every 10 seconds
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.server.close();
      await this.db.end();
      console.log('Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new OptimizationServer();
  server.start().catch(console.error);
}

export default OptimizationServer;
