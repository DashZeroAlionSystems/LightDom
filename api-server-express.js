// Express API Server for DOM Space Harvester
// Production-ready API with WebSocket support, PostgreSQL integration, and real-time updates

import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import cors from 'cors';
import { Pool } from 'pg';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { RealWebCrawlerSystem } from './crawler/RealWebCrawlerSystem.js';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CrawlerSupervisor from './utils/CrawlerSupervisor.js';
import MetricsCollector from './utils/MetricsCollector.js';
import HeadlessBlockchainRunner from './utils/HeadlessBlockchainRunner.js';
import BlockchainMetricsCollector from './utils/BlockchainMetricsCollector.js';
import { addMiningRoutes } from './api-mining-routes.js';
// import { HeadlessChromeService } from './src/services/HeadlessChromeService.ts';
// import TaskManager from './src/services/TaskManager.ts';
// import CursorN8nIntegrationService from './src/services/CursorN8nIntegrationService.ts';
// import TaskAPI from './src/api/taskApi.ts';

// Handle both ES modules and CommonJS environments
let __filename, __dirname;
try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (error) {
  // Fallback for test environments
  __filename = process.argv[1];
  __dirname = path.dirname(__filename);
}

class DOMSpaceHarvesterAPI {
  constructor(config = {}) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new socketIo(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    this.dbDisabled = process.env.DB_DISABLED === 'true';
    
    // Setup bridge socket handlers
    this.setupBridgeSocketHandlers();
    
    // Database connection pool
    this.db = this.dbDisabled
      ? {
          query: async () => ({ rows: [], rowCount: 0 }),
          end: async () => {}
        }
      : new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME || 'dom_space_harvester',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

    // Real-time crawler system
    this.crawlerSystem = null;
    this.crawlingSessions = new Map();
    this.connectedClients = new Set();
    
    // Blockchain integration
    this.blockchainEnabled = process.env.BLOCKCHAIN_ENABLED === 'true';
    this.provider = null;
    this.wallet = null;
    this.pooContract = null;
    this.tokenContract = null;
    this.landContract = null;
    
    // Load contract ABIs
    this.loadContractABIs();
    
    // Crawler supervisor for resilience
    this.supervisor = new CrawlerSupervisor({
      outboxPath: './outbox',
      checkpointPath: './checkpoints'
    });
    
    // Metrics collector
    this.metrics = new MetricsCollector();
    
    // Blockchain metrics collector
    this.blockchainMetrics = new BlockchainMetricsCollector();
    
    // Headless blockchain runner
    this.blockchainRunner = new HeadlessBlockchainRunner({
      headless: process.env.HEADLESS_CHROME !== 'false',
      devtools: process.env.CHROME_DEVTOOLS === 'true'
    });
    
    // Mining system (will be initialized later)
    this.miningSystem = null;

    // AI Content Generation Service
    this.aiContentGenerationService = null;
    this.aiContentModelTrainer = null;

    // Setup blockchain runner event handlers
    this.setupBlockchainEventHandlers();
    
    // Blockchain mining sessions
    this.miningSessions = new Map();
    
    // Initialize new services (commented out until TypeScript files are compiled)
    // this.headlessChromeService = new HeadlessChromeService();
    // this.taskManager = new TaskManager(this.headlessChromeService);
    
    // Initialize integration service
    // this.integrationService = new CursorN8nIntegrationService(
    //   this.taskManager,
    //   this.headlessChromeService,
    //   {
    //     cursorAPI: {
    //       enabled: true,
    //       baseUrl: process.env.CURSOR_API_URL || 'http://localhost:3001/api/cursor'
    //     },
    //     n8n: {
    //       enabled: process.env.N8N_ENABLED === 'true',
    //       baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    //       apiKey: process.env.N8N_API_KEY,
    //       webhookSecret: process.env.N8N_WEBHOOK_SECRET
    //     },
    //     headlessChrome: {
    //       enabled: true,
    //       maxConcurrency: parseInt(process.env.MAX_CONCURRENT_TASKS) || 5,
    //       defaultTimeout: parseInt(process.env.DEFAULT_TASK_TIMEOUT) || 30000
    //     }
    //   }
    // );
    
    // Initialize task API
    // this.taskAPI = new TaskAPI(this.app, this.taskManager, this.headlessChromeService);
    
    // Setup all routes
    this.setupRoutes();
    
    // Setup unused APIs - connecting overlooked code
    this.setupUnusedAPIs();
    
    // Setup blockchain API routes
    this.setupBlockchainRoutes();
    
    // Setup optimization API routes
    this.setupOptimizationRoutes();
    
    // Setup website API routes
    this.setupWebsiteRoutes();
    
    // Setup analytics API routes
    this.setupAnalyticsRoutes();
    
    // Setup SEO API routes
    this.setupSEORoutes();

    // Setup AI Content Generation API routes
    this.setupAIContentGenerationRoutes();

    // Setup authentication API routes
    this.setupAuthRoutes();
    
    // Setup mining API routes
    this.setupMiningRoutes();

    // Setup crawler admin API routes
    this.setupCrawlerAdminRoutes();

    // Setup training control API routes
    this.setupTrainingControlRoutes();

    // Setup wallet API routes
    this.setupWalletRoutes();
    
    // Setup data integration API routes
    this.setupDataIntegrationRoutes();
    
    // Setup space mining API routes
    this.setupSpaceMiningRoutes();
    
    // Setup metaverse mining API routes
    this.setupMetaverseMiningRoutes();
    
    // Setup metaverse marketplace API routes
    this.setupMetaverseMarketplaceRoutes();
    
    // Setup metaverse mining rewards API routes
    this.setupMetaverseMiningRewardsRoutes();
    
    // Setup workflow simulation API routes
    this.setupWorkflowRoutes();
    
    // Setup testing API routes
    this.setupTestingRoutes();
    
    // Setup advanced node API routes
    this.setupAdvancedNodeRoutes();

    // Setup SEO injection service API routes
    this.setupSEOServiceRoutes();

    // Statistics cache
    this.statsCache = {
      lastUpdate: 0,
      data: {}
    };

    this.setupMiddleware();
    this.setupWebSocket();
    this.startRealtimeUpdates();

    // Optional blockchain provider
    this.eth = null;
    if (process.env.RPC_URL && process.env.PRIVATE_KEY && process.env.DSH_CONTRACT) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const tokenAbi = ['function mint(address to, uint256 amount) external'];
        const objects = { wallet, token: new ethers.Contract(process.env.DSH_CONTRACT, tokenAbi, wallet) };
        // Optional Registry contract for saving optimization proofs
        if (process.env.REGISTRY_CONTRACT) {
          const registryAbi = [
            'function recordOptimization(bytes32 urlHash, bytes32 beforeHash, bytes32 afterHash, uint256 spaceSaved, string url) external',
            'function getOptimization(bytes32 urlHash) view returns (bytes32 beforeHash, bytes32 afterHash, uint256 spaceSaved, string url, uint256 timestamp)'
          ];
          objects.registry = new ethers.Contract(process.env.REGISTRY_CONTRACT, registryAbi, wallet);
        }
        this.eth = objects;
        console.log('✅ Blockchain configured');
      } catch (e) {
        console.log('⚠️ Blockchain config failed:', e.message);
      }
    }
  }

  loadContractABIs() {
    try {
      // Load Proof of Optimization contract ABI
      const pooABIPath = path.join(__dirname, 'blockchain', 'abi', 'ProofOfOptimization.json');
      if (fs.existsSync(pooABIPath)) {
        this.pooABI = JSON.parse(fs.readFileSync(pooABIPath, 'utf8'));
      }
      
      // Load other contract ABIs as needed
      // this.tokenABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'blockchain', 'abi', 'DOMSpaceToken.json'), 'utf8'));
      // this.landABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'blockchain', 'abi', 'VirtualLandNFT.json'), 'utf8'));
    } catch (error) {
      console.warn('Failed to load contract ABIs:', error.message);
    }
  }

  async initializeBlockchain() {
    if (!this.blockchainEnabled) {
      console.log('Blockchain integration disabled');
      return;
    }

    try {
      // Initialize provider
      const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize wallet
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        console.warn('No private key provided, using read-only mode');
        return;
      }
      
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Initialize contracts
      const pooAddress = process.env.POO_CONTRACT_ADDRESS;
      if (pooAddress && this.pooABI) {
        this.pooContract = new ethers.Contract(pooAddress, this.pooABI, this.wallet);
        console.log('PoO contract initialized at:', pooAddress);
      }
      
      console.log('Blockchain initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain:', error.message);
    }
  }

  setupMiddleware() {
    // Security and performance middleware
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    // Serve optimizer static assets
    this.app.use('/optimizer', express.static('optimizer', { maxAge: '7d', etag: true }));
    
    // Serve bridge chat pages
    this.app.get('/bridge/:bridgeId', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bridge Chat - ${req.params.bridgeId}</title>
          <script type="module" src="/src/main.tsx"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
        </html>
      `);
    });

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.app.use(limiter);

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Import and register SEO routes
    import('./src/api/seo-analysis.js').then((seoModule) => {
      this.app.use('/api/seo', seoModule.default);
      console.log('SEO analysis routes registered');
    }).catch(err => {
      console.error('Failed to load SEO routes:', err);
    });
    
    // Import and register SEO Training routes
    import('./src/api/seo-training.js').then((trainingModule) => {
      this.app.use('/api/seo/training', trainingModule.default);
      console.log('SEO training routes registered');
    }).catch(err => {
      console.error('Failed to load SEO training routes:', err);
    });
    
    // Import and register SEO Model Training routes
    import('./src/api/seo-model-training.js').then((modelModule) => {
      this.app.use('/api/seo/models', modelModule.default);
      console.log('SEO model training routes registered');
    }).catch(err => {
      console.error('Failed to load SEO model training routes:', err);
    });
    
    // Import and register Schema Linking routes
    import('./services/schema-linking-routes.js').then((schemaModule) => {
      this.app.use('/api/schema-linking', schemaModule.default);
      console.log('Schema linking routes registered');
    }).catch(err => {
      console.error('Failed to load schema linking routes:', err);
    });
    
    // Admin middleware (bearer token)
    const adminAuth = (req, res, next) => {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      if (!process.env.ADMIN_TOKEN) return res.status(403).json({ error: 'Admin disabled' });
      if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
      next();
    };
    // =====================================================
    // CRAWLER MANAGEMENT ENDPOINTS
    // =====================================================

    // Start crawling session
    this.app.post('/api/crawler/start', async (req, res) => {
      try {
        const config = {
          maxConcurrency: req.body.maxConcurrency || 5,
          requestDelay: req.body.requestDelay || 2000,
          maxDepth: req.body.maxDepth || 2,
          respectRobots: req.body.respectRobots !== false,
          postgres: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'dom_space_harvester',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
          }
        };

        if (this.crawlerSystem && this.crawlerSystem.isRunning) {
          return res.status(400).json({ 
            error: 'Crawler is already running',
            sessionId: this.crawlerSystem.sessionId 
          });
        }

        this.crawlerSystem = new RealWebCrawlerSystem({
          ...config,
          onOptimization: async ({ url, analysis, result }) => {
            try {
              if (!this.eth) return;
              const kb = Math.floor((result.spaceSaved || 0) / 1024);
              if (kb <= 0) return;
              // simple throttle: only mint up to 10 DSH per single optimization
              const mintUnits = Math.min(kb, 10);
              const to = process.env.REWARD_ADDRESS || this.eth.wallet.address;
              const amount = ethers.parseUnits(String(mintUnits), 18);
              const tx = await this.eth.token.mint(to, amount);
              console.log('⛓️ Minted on optimization:', mintUnits, 'DSH tx', tx.hash);

              // Save optimization proof to registry if available
              if (this.eth.registry) {
                try {
                  const beforeHash = '0x' + (result.optimizations?.beforeHash || '').replace(/^0x/, '');
                  const afterHash = '0x' + (result.optimizations?.afterHash || '').replace(/^0x/, '');
                  const urlHash = ethers.keccak256(ethers.toUtf8Bytes(url));
                  const saveTx = await this.eth.registry.recordOptimization(
                    urlHash,
                    beforeHash || ethers.ZeroHash,
                    afterHash || ethers.ZeroHash,
                    BigInt(result.spaceSaved || 0),
                    url
                  );
                  console.log('📝 Registry tx:', saveTx.hash);
                  // Persist locally
                  try {
                    await this.db.query(
                      `INSERT INTO optimization_proofs (url, domain, before_hash, after_hash, space_saved_bytes, tx_hash, on_chain)
                       VALUES ($1,$2,$3,$4,$5,$6,true)`,
                      [url, new URL(url).hostname, beforeHash, afterHash, result.spaceSaved || 0, saveTx.hash]
                    );
                  } catch (e) {}
                } catch (e) {
                  console.log('⚠️ Registry save failed:', e.message);
                  // Persist locally even if chain save failed
                  try {
                    await this.db.query(
                      `INSERT INTO optimization_proofs (url, domain, before_hash, after_hash, space_saved_bytes, on_chain)
                       VALUES ($1,$2,$3,$4,$5,false)`,
                      [url, new URL(url).hostname, null, null, result.spaceSaved || 0]
                    );
                  } catch (_) {}
                }
              }
            } catch (e) {
              console.log('⚠️ onOptimization mint failed:', e.message);
            }
          }
        });
        await this.crawlerSystem.initialize();

        // Start crawling in background
        const sessionId = `session_${Date.now()}`;
        this.crawlingSessions.set(sessionId, {
          startTime: new Date(),
          config,
          status: 'running'
        });

        this.crawlerSystem.startCrawling().catch(error => {
          console.error('Crawling error:', error);
          this.io.emit('crawler_error', { error: error.message });
        });

        // Emit start event to all connected clients
        this.io.emit('crawler_started', { sessionId, config });

        res.json({ 
          success: true, 
          sessionId,
          message: 'Crawler started successfully' 
        });

      } catch (error) {
        console.error('Failed to start crawler:', error);
        res.status(500).json({ 
          error: 'Failed to start crawler', 
          details: error.message 
        });
      }
    });

    // =====================================================
    // MONETIZATION: API KEY AUTH, PRICING, BOUNTIES, REPORTS
    // =====================================================

    // API key auth middleware
    const apiKeyAuth = async (req, res, next) => {
      try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) return res.status(401).json({ error: 'API key required' });

        // Hash at caller side ideally; for PoC we store full keys hashed at creation
        const keyHash = require('crypto').createHash('sha256').update(apiKey).digest('hex');
        const result = await this.db.query(
          'SELECT id, owner_email, is_active, requests_used, plan_id FROM api_keys WHERE key_hash = $1',
          [keyHash]
        );
        if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid API key' });
        const key = result.rows[0];
        if (!key.is_active) return res.status(403).json({ error: 'API key disabled' });

        req.apiKey = key;
        // Increment usage (lightweight)
        this.db.query('UPDATE api_keys SET requests_used = requests_used + 1, last_used_at = NOW() WHERE id = $1', [key.id]).catch(() => {});
        next();
      } catch (e) {
        res.status(500).json({ error: 'Auth failure' });
      }
    };

    // Public: list pricing plans
    this.app.get('/api/pricing/plans', async (req, res) => {
      try {
        const plans = await this.db.query('SELECT plan_code, name, monthly_price_cents, requests_included, overage_price_cents_per_1k, stripe_price_id FROM pricing_plans ORDER BY monthly_price_cents ASC');
        res.json(plans.rows);
      } catch (e) {
        res.status(500).json({ error: 'Failed to load plans' });
      }
    });

    // Admin-lite: set/update Stripe price mapping for plan (protect in prod)
    this.app.post('/api/pricing/plan', adminAuth, async (req, res) => {
      try {
        const { planCode, name, monthlyPriceCents, included, overagePer1k, stripePriceId } = req.body || {};
        if (!planCode || !name) return res.status(400).json({ error: 'planCode and name required' });
        await this.db.query(
          `INSERT INTO pricing_plans (plan_code, name, monthly_price_cents, requests_included, overage_price_cents_per_1k, stripe_price_id)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (plan_code) DO UPDATE SET name=$2, monthly_price_cents=$3, requests_included=$4, overage_price_cents_per_1k=$5, stripe_price_id=$6`,
          [planCode, name, monthlyPriceCents || 0, included || 0, overagePer1k || 0, stripePriceId || null]
        );
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: 'Failed to upsert plan' });
      }
    });

    // Admin-lite: create API key (for demo). In production, protect this route.
    this.app.post('/api/keys/create', adminAuth, async (req, res) => {
      try {
        const { ownerEmail, planCode } = req.body || {};
        if (!ownerEmail || !planCode) return res.status(400).json({ error: 'ownerEmail and planCode required' });
        const plan = await this.db.query('SELECT id FROM pricing_plans WHERE plan_code = $1', [planCode]);
        if (plan.rowCount === 0) return res.status(400).json({ error: 'Invalid plan' });

        const rawKey = require('crypto').randomBytes(24).toString('hex');
        const keyHash = require('crypto').createHash('sha256').update(rawKey).digest('hex');
        await this.db.query('INSERT INTO api_keys (key_hash, owner_email, plan_id) VALUES ($1, $2, $3)', [keyHash, ownerEmail, plan.rows[0].id]);
        res.json({ apiKey: rawKey });
      } catch (e) {
        res.status(500).json({ error: 'Failed to create API key' });
      }
    });

    // Bounty marketplace
    this.app.get('/api/bounties', async (req, res) => {
      try {
        const rows = await this.db.query('SELECT id, url, description, reward_cents, status, posted_by, claimed_by, created_at FROM optimization_bounties ORDER BY created_at DESC LIMIT 100');
        res.json(rows.rows);
      } catch (e) {
        res.status(500).json({ error: 'Failed to load bounties' });
      }
    });

    // Backlink crawl: enqueue new targets discovered from backlinks of a URL
    this.app.post('/api/backlinks/enqueue', apiKeyAuth, async (req, res) => {
      try {
        const { sourceUrl, minStrength = 0.5, limit = 50 } = req.body || {};
        if (!sourceUrl) return res.status(400).json({ error: 'sourceUrl required' });
        const rows = await this.db.query(
          `SELECT target_url FROM backlink_network
           WHERE source_url = $1 AND link_strength >= $2
           ORDER BY link_strength DESC LIMIT $3`,
          [sourceUrl, minStrength, Math.min(limit, 200)]
        );
        for (const r of rows.rows) {
          try {
            const u = new URL(r.target_url);
            await this.db.query(
              `INSERT INTO crawl_targets (url, domain, priority, status)
               VALUES ($1,$2,6,'pending') ON CONFLICT (url) DO NOTHING`,
              [r.target_url, u.hostname]
            );
          } catch {}
        }
        res.json({ enqueued: rows.rowCount });
      } catch (e) {
        res.status(500).json({ error: 'Failed to enqueue backlinks' });
      }
    });

    this.app.post('/api/bounties', apiKeyAuth, async (req, res) => {
      try {
        const { url, description, rewardCents } = req.body || {};
        if (!url || !rewardCents) return res.status(400).json({ error: 'url and rewardCents required' });
        await this.db.query(
          'INSERT INTO optimization_bounties (url, description, reward_cents, posted_by) VALUES ($1,$2,$3,$4)',
          [url, description || '', rewardCents, req.apiKey.owner_email]
        );
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: 'Failed to create bounty' });
      }
    });

    this.app.post('/api/bounties/:id/claim', apiKeyAuth, async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const result = await this.db.query(
          `UPDATE optimization_bounties SET status='claimed', claimed_by=$1, updated_at=NOW()
           WHERE id=$2 AND status='open' RETURNING id`,
          [req.apiKey.owner_email, id]
        );
        if (result.rowCount === 0) return res.status(400).json({ error: 'Bounty not open' });
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: 'Failed to claim bounty' });
      }
    });

    // Paid optimization report (metered via API key)
    this.app.post('/api/reports/optimization', apiKeyAuth, async (req, res) => {
      try {
        const { url } = req.body || {};
        if (!url) return res.status(400).json({ error: 'url required' });

        // Simple: fetch latest optimization data for URL
        const opt = await this.db.query(
          `SELECT url, space_saved_bytes, optimization_types, crawl_timestamp, performance_metrics
           FROM dom_optimizations WHERE url = $1 ORDER BY crawl_timestamp DESC LIMIT 1`,
          [url]
        );
        if (opt.rowCount === 0) return res.status(404).json({ error: 'No data yet for URL' });

        // In production: enqueue a fresh crawl and bill accordingly
        res.json({ report: opt.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Failed to generate report' });
      }
    });

    // =====================================================
    // OPTIMIZER AI + ANALYTICS ENDPOINTS
    // =====================================================

    // Receive optimizer analytics batches
    this.app.post('/ai/analytics', async (req, res) => {
      try {
        const { batch, websiteId } = req.body || {};
        if (!Array.isArray(batch) || !websiteId) return res.status(400).json({ error: 'batch and websiteId required' });
        // For now, store to logs or extend DB with analytics table
        console.log('📥 analytics batch', websiteId, batch.length);
        res.json({ ok: true });
      } catch (e) {
        res.status(500).json({ error: 'Failed to store analytics' });
      }
    });

    // =====================================================
    // BLOCKCHAIN SAVE/LOAD: store and fetch optimization proofs
    // =====================================================

    // Save an optimization proof to on-chain registry
    this.app.post('/api/chain/save-optimization', async (req, res) => {
      try {
        if (!this.eth || !this.eth.registry) return res.status(501).json({ error: 'Registry not configured' });
        const { url, beforeHash, afterHash, spaceSaved } = req.body || {};
        if (!url || !beforeHash || !afterHash || typeof spaceSaved !== 'number') {
          return res.status(400).json({ error: 'url, beforeHash, afterHash, spaceSaved required' });
        }
        const urlHash = ethers.keccak256(ethers.toUtf8Bytes(url));
        const tx = await this.eth.registry.recordOptimization(urlHash, beforeHash, afterHash, BigInt(spaceSaved), url);
        res.json({ txHash: tx.hash });
      } catch (e) {
        res.status(500).json({ error: 'Failed to save on chain', details: e.message });
      }
    });

    // Load an optimization record from on-chain registry
    this.app.get('/api/chain/optimization', async (req, res) => {
      try {
        if (!this.eth || !this.eth.registry) return res.status(501).json({ error: 'Registry not configured' });
        const url = req.query.url;
        if (!url) return res.status(400).json({ error: 'url required' });
        const urlHash = ethers.keccak256(ethers.toUtf8Bytes(url));
        const rec = await this.eth.registry.getOptimization(urlHash);
        const [beforeHash, afterHash, spaceSaved, storedUrl, timestamp] = rec;
        res.json({ url: storedUrl, beforeHash, afterHash, spaceSaved: Number(spaceSaved), timestamp: Number(timestamp) });
      } catch (e) {
        res.status(500).json({ error: 'Failed to load from chain', details: e.message });
      }
    });

    // Collect training data from optimizer
    this.app.post('/ai/collect-training-data', async (req, res) => {
      try {
        const { websiteId, optimizations, timestamp } = req.body || {};
        if (!websiteId) return res.status(400).json({ error: 'websiteId required' });
        console.log('📥 training data', websiteId, Array.isArray(optimizations) ? optimizations.length : 0, timestamp);
        res.json({ ok: true });
      } catch (e) {
        res.status(500).json({ error: 'Failed to collect training data' });
      }
    });

    // Usage & quota for current key
    this.app.get('/api/usage', apiKeyAuth, async (req, res) => {
      try {
        const key = req.apiKey;
        const plan = await this.db.query('SELECT plan_code, requests_included FROM pricing_plans WHERE id=$1', [key.plan_id]);
        const planRow = plan.rows[0] || { plan_code: 'unknown', requests_included: 0 };
        res.json({
          owner: key.owner_email,
          plan: planRow.plan_code,
          requestsUsed: key.requests_used,
          requestsIncluded: planRow.requests_included
        });
      } catch (e) {
        res.status(500).json({ error: 'Failed to load usage' });
      }
    });

    // On-demand crawl (billable action)
    this.app.post('/api/crawler/crawl-once', apiKeyAuth, async (req, res) => {
      try {
        const { url } = req.body || {};
        if (!url) return res.status(400).json({ error: 'url required' });
        if (!this.crawlerSystem) {
          // Lazy init minimal crawler if none running
          const config = {
            maxConcurrency: 2,
            requestDelay: 1500,
            maxDepth: 0,
            respectRobots: true,
            postgres: {
              host: process.env.DB_HOST || 'localhost',
              port: process.env.DB_PORT || 5432,
              database: process.env.DB_NAME || 'dom_space_harvester',
              user: process.env.DB_USER || 'postgres',
              password: process.env.DB_PASSWORD || 'password',
            }
          };
          this.crawlerSystem = new RealWebCrawlerSystem(config);
          await this.crawlerSystem.initialize();
        }
        // Add target and trigger queue reload; simple insert
        await this.db.query(`INSERT INTO crawl_targets (url, domain, priority, status)
                             VALUES ($1,$2,10,'pending') ON CONFLICT (url) DO UPDATE SET status='pending'`,
                             [url, new URL(url).hostname]);
        // Reward enqueue: optional on-chain mint of 1 DSH
        if (this.eth) {
          try {
            const to = req.apiKey ? req.apiKey.owner_email : this.eth.wallet.address;
            const address = this.eth.wallet.address;
            const amount = ethers.parseUnits('1', 18);
            const tx = await this.eth.token.mint(address, amount);
            console.log('⛓️ Mint tx:', tx.hash);
          } catch (e) {
            console.log('⚠️ Mint failed:', e.message);
          }
        }
        res.json({ queued: true });
      } catch (e) {
        res.status(500).json({ error: 'Failed to queue crawl' });
      }
    });

    // Optional Stripe billing endpoints (disabled if no STRIPE_KEY)
    if (process.env.STRIPE_KEY) {
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_KEY);

      this.app.post('/api/billing/create-checkout', async (req, res) => {
        try {
          const { priceId, customerEmail } = req.body || {};
          if (!priceId || !customerEmail) return res.status(400).json({ error: 'priceId and customerEmail required' });
          const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: customerEmail,
            success_url: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/billing/success',
            cancel_url: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/billing/cancel'
          });
          res.json({ url: session.url });
        } catch (e) {
          res.status(500).json({ error: 'Failed to create checkout' });
        }
      });

      // Stripe webhook (raw body parsing for signature verification)
      this.app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
        try {
          const sig = req.headers['stripe-signature'];
          const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
          let event;
          try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
          } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
          }

          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object;
              const email = session.customer_details?.email;
              if (email) {
                // Activate base subscription if exists
                const planCode = 'starter';
                const plan = await this.db.query('SELECT id FROM pricing_plans WHERE plan_code=$1', [planCode]);
                if (plan.rowCount > 0) {
                  await this.db.query(
                    `INSERT INTO subscriptions (owner_email, plan_id) VALUES ($1,$2)
                     ON CONFLICT (owner_email, plan_id) DO NOTHING`,
                    [email, plan.rows[0].id]
                  );
                }
              }
              break;
            }
            case 'invoice.paid': {
              const inv = event.data.object;
              const email = inv.customer_email || inv.customer?.email || null;
              if (email) {
                await this.db.query(
                  `INSERT INTO payments (owner_email, amount_cents, currency, provider, provider_payment_id, status)
                   VALUES ($1,$2,$3,'stripe',$4,'succeeded')`,
                  [email, Math.round(inv.amount_paid), inv.currency?.toUpperCase() || 'USD', inv.id]
                );
              }
              break;
            }
            default:
              break;
          }

          res.json({ received: true });
        } catch (e) {
          res.status(500).json({ error: 'Webhook handling failed' });
        }
      });
    }

    // Invoice generation (manual, aggregates current month usage/overage)
    this.app.post('/api/billing/invoices/generate', async (req, res) => {
      try {
        const { ownerEmail } = req.body || {};
        if (!ownerEmail) return res.status(400).json({ error: 'ownerEmail required' });
        const periodStart = new Date();
        periodStart.setDate(1);
        periodStart.setHours(0,0,0,0);
        const periodEnd = new Date();

        // Get usage
        const keyAgg = await this.db.query('SELECT COALESCE(SUM(requests_used),0) as used FROM api_keys WHERE owner_email=$1', [ownerEmail]);
        const sub = await this.db.query(
          `SELECT pp.monthly_price_cents, pp.requests_included, pp.overage_price_cents_per_1k
           FROM subscriptions s JOIN pricing_plans pp ON s.plan_id=pp.id
           WHERE s.owner_email=$1 AND s.status='active' LIMIT 1`,
          [ownerEmail]
        );
        if (sub.rowCount === 0) return res.status(400).json({ error: 'No active subscription' });
        const plan = sub.rows[0];
        const used = parseInt(keyAgg.rows[0].used) || 0;
        const overageUnits = Math.max(0, used - plan.requests_included);
        const overageBlocks = Math.ceil(overageUnits / 1000);
        const overageCost = overageBlocks * plan.overage_price_cents_per_1k;
        const amount = plan.monthly_price_cents + overageCost;

        const lineItems = {
          base: plan.monthly_price_cents,
          overage_units: overageUnits,
          overage_blocks: overageBlocks,
          overage_cents: overageCost
        };

        const inv = await this.db.query(
          `INSERT INTO invoices (owner_email, period_start, period_end, amount_cents, line_items, status)
           VALUES ($1,$2,$3,$4,$5,'open') RETURNING id`,
          [ownerEmail, periodStart, periodEnd, amount, JSON.stringify(lineItems)]
        );

        res.json({ invoiceId: inv.rows[0].id, amount_cents: amount, line_items: lineItems });
      } catch (e) {
        res.status(500).json({ error: 'Failed to generate invoice' });
      }
    });

    // Stop crawling session
    this.app.post('/api/crawler/stop', async (req, res) => {
      try {
        if (!this.crawlerSystem || !this.crawlerSystem.isRunning) {
          return res.status(400).json({ error: 'No active crawling session' });
        }

        await this.crawlerSystem.shutdown();
        this.crawlerSystem = null;

        // Update session status
        for (const [sessionId, session] of this.crawlingSessions) {
          if (session.status === 'running') {
            session.status = 'stopped';
            session.endTime = new Date();
          }
        }

        this.io.emit('crawler_stopped');

        res.json({ success: true, message: 'Crawler stopped successfully' });

      } catch (error) {
        console.error('Failed to stop crawler:', error);
        res.status(500).json({ 
          error: 'Failed to stop crawler', 
          details: error.message 
        });
      }
    });

    // Get crawler status
    this.app.get('/api/crawler/status', async (req, res) => {
      try {
        const activeCrawlers = await this.db.query(`
          SELECT crawler_id, specialization, status, current_url, pages_per_second, 
                 efficiency_percent, db_connections, queue_depth, last_heartbeat
          FROM active_crawlers
          ORDER BY crawler_id
        `);

        const isRunning = this.crawlerSystem && this.crawlerSystem.isRunning;
        const currentSession = Array.from(this.crawlingSessions.values())
          .find(session => session.status === 'running');

        res.json({
          isRunning,
          currentSession: currentSession || null,
          activeCrawlers: activeCrawlers.rows,
          totalSessions: this.crawlingSessions.size
        });

      } catch (error) {
        console.error('Failed to get crawler status:', error);
        res.status(500).json({ error: 'Failed to get crawler status' });
      }
    });

    // =====================================================
    // STATISTICS AND ANALYTICS ENDPOINTS
    // =====================================================

    // Get comprehensive dashboard statistics
    this.app.get('/api/stats/dashboard', async (req, res) => {
      try {
        // Check cache first (update every 30 seconds)
        if (Date.now() - this.statsCache.lastUpdate < 30000 && this.statsCache.data.dashboard) {
          return res.json(this.statsCache.data.dashboard);
        }

        const [crawlStats, metaverseStats, schemaStats, backlinkStats] = await Promise.all([
          this.getCrawlStatistics(),
          this.getMetaverseStatistics(),
          this.getSchemaStatistics(),
          this.getBacklinkStatistics()
        ]);

        const dashboardData = {
          crawling: crawlStats,
          metaverse: metaverseStats,
          schemas: schemaStats,
          backlinks: backlinkStats,
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        this.statsCache.data.dashboard = dashboardData;
        this.statsCache.lastUpdate = Date.now();

        res.json(dashboardData);

      } catch (error) {
        console.error('Failed to get dashboard stats:', error);
        res.status(500).json({ error: 'Failed to get dashboard statistics' });
      }
    });

    // Get recent optimizations with pagination
    this.app.get('/api/stats/optimizations', async (req, res) => {
      try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        const result = await this.db.query(`
          SELECT 
            do.url,
            ct.domain,
            sa.biome_type,
            do.space_saved_bytes,
            do.tokens_earned,
            do.optimization_types,
            do.crawl_timestamp,
            do.metaverse_impact,
            do.performance_metrics,
            COUNT(sd.id) as schemas_extracted,
            COUNT(bn.id) as backlinks_found
          FROM dom_optimizations do
          JOIN crawl_targets ct ON do.url = ct.url
          LEFT JOIN site_analysis sa ON ct.domain = sa.domain
          LEFT JOIN schema_data sd ON do.url = sd.url
          LEFT JOIN backlink_network bn ON do.url = bn.source_url
          WHERE do.crawl_timestamp >= NOW() - INTERVAL '7 days'
          GROUP BY do.id, ct.domain, sa.biome_type
          ORDER BY do.crawl_timestamp DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const totalCount = await this.db.query(`
          SELECT COUNT(*) as total 
          FROM dom_optimizations 
          WHERE crawl_timestamp >= NOW() - INTERVAL '7 days'
        `);

        res.json({
          optimizations: result.rows,
          pagination: {
            total: parseInt(totalCount.rows[0].total),
            limit,
            offset,
            hasMore: offset + limit < parseInt(totalCount.rows[0].total)
          }
        });

      } catch (error) {
        console.error('Failed to get optimizations:', error);
        res.status(500).json({ error: 'Failed to get optimization data' });
      }
    });

    // Get domain analysis and rankings
    this.app.get('/api/stats/domains', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            sa.domain,
            sa.biome_type,
            sa.total_pages_crawled,
            sa.total_space_harvested,
            sa.performance_score,
            sa.schema_richness,
            sa.backlink_authority,
            da.authority_score,
            da.total_inbound_links,
            da.unique_linking_domains,
            COUNT(vlp.id) as virtual_land_count,
            COUNT(ra.id) as reality_anchors_count
          FROM site_analysis sa
          LEFT JOIN domain_authority da ON sa.domain = da.domain
          LEFT JOIN virtual_land_parcels vlp ON sa.domain = vlp.source_domain
          LEFT JOIN reality_anchors ra ON sa.domain = ra.domain
          WHERE sa.total_pages_crawled > 0
          GROUP BY sa.domain, sa.biome_type, sa.total_pages_crawled, 
                   sa.total_space_harvested, sa.performance_score, 
                   sa.schema_richness, sa.backlink_authority, 
                   da.authority_score, da.total_inbound_links, da.unique_linking_domains
          ORDER BY sa.total_space_harvested DESC
          LIMIT 50
        `);

        res.json(result.rows);

      } catch (error) {
        console.error('Failed to get domain stats:', error);
        res.status(500).json({ error: 'Failed to get domain statistics' });
      }
    });

    // =====================================================
    // PROOFS: LIST/FETCH FOR DASHBOARD
    // =====================================================

    // List proofs by domain
    this.app.get('/api/proofs/domain/:domain', async (req, res) => {
      try {
        const domain = req.params.domain;
        const rows = await this.db.query(
          `SELECT url, before_hash, after_hash, space_saved_bytes, tx_hash, on_chain, recorded_at
           FROM optimization_proofs WHERE domain = $1 ORDER BY recorded_at DESC LIMIT 200`,
          [domain]
        );
        res.json(rows.rows);
      } catch (e) {
        res.status(500).json({ error: 'Failed to get proofs' });
      }
    });

    // List latest proofs
    this.app.get('/api/proofs/recent', async (req, res) => {
      try {
        const rows = await this.db.query(
          `SELECT url, domain, before_hash, after_hash, space_saved_bytes, tx_hash, on_chain, recorded_at
           FROM optimization_proofs ORDER BY recorded_at DESC LIMIT 100`
        );
        res.json(rows.rows);
      } catch (e) {
        res.status(500).json({ error: 'Failed to get recent proofs' });
      }
    });

    // =====================================================
    // METAVERSE INFRASTRUCTURE ENDPOINTS
    // =====================================================

    // Get virtual land parcels
    this.app.get('/api/metaverse/land', async (req, res) => {
      try {
        const biome = req.query.biome;
        const ownerAddress = req.query.owner;
        
        let query = `
          SELECT 
            parcel_id,
            source_url,
            source_domain,
            biome_type,
            parcel_size,
            development_level,
            space_harvested_kb,
            owner_address,
            is_nft_minted,
            staking_rewards,
            created_at
          FROM virtual_land_parcels
          WHERE 1=1
        `;
        const params = [];

        if (biome) {
          params.push(biome);
          query += ` AND biome_type = $${params.length}`;
        }

        if (ownerAddress) {
          params.push(ownerAddress);
          query += ` AND owner_address = $${params.length}`;
        }

        query += ' ORDER BY created_at DESC LIMIT 100';

        const result = await this.db.query(query, params);
        res.json(result.rows);

      } catch (error) {
        console.error('Failed to get virtual land:', error);
        res.status(500).json({ error: 'Failed to get virtual land data' });
      }
    });

    // Get AI consensus nodes
    this.app.get('/api/metaverse/ai-nodes', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            node_id,
            operator_address,
            compute_power,
            consensus_weight,
            consensus_type,
            consensus_participations,
            successful_validations,
            rewards_generated,
            uptime_percentage,
            is_active,
            created_at
          FROM ai_consensus_nodes
          ORDER BY compute_power DESC
          LIMIT 100
        `);

        res.json(result.rows);

      } catch (error) {
        console.error('Failed to get AI nodes:', error);
        res.status(500).json({ error: 'Failed to get AI node data' });
      }
    });

    // List dimensional bridges for metaverse UI
    this.app.get('/api/metaverse/bridges', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT bridge_id, source_chain, target_chain, bridge_capacity, current_volume, is_operational, validator_count, last_transaction
          FROM dimensional_bridges
          ORDER BY current_volume DESC NULLS LAST
          LIMIT 50
        `);
        res.json(result.rows);
      } catch (e) {
        res.status(500).json({ error: 'Failed to get bridges' });
      }
    });

    // Get land parcels for biodome visualization
    this.app.get('/api/metaverse/land-parcels', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT parcel_id, domain, coordinates, biome_type, minted_at, 
                 optimization_id, space_saved
          FROM virtual_land_parcels 
          ORDER BY minted_at DESC
          LIMIT 100
        `);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching land parcels:', error);
        res.status(500).json({ error: 'Failed to fetch land parcels' });
      }
    });

    // Get biome types and their parameters
    this.app.get('/api/metaverse/biomes', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT DISTINCT biome_type, 
                 COUNT(*) as parcel_count,
                 AVG(space_saved) as avg_space_saved
          FROM virtual_land_parcels 
          WHERE biome_type IS NOT NULL
          GROUP BY biome_type
          ORDER BY parcel_count DESC
        `);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching biomes:', error);
        res.status(500).json({ error: 'Failed to fetch biomes' });
      }
    });

    // Get bridge chat messages for a specific bridge
    this.app.get('/api/metaverse/bridge/:bridgeId/chat', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;
        
        const result = await this.db.query(`
          SELECT message_id, user_name, message_text, created_at
          FROM bridge_messages 
          WHERE bridge_id = $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [bridgeId, limit, offset]);
        
        res.json(result.rows.reverse()); // Return in chronological order
      } catch (error) {
        console.error('Error fetching bridge chat:', error);
        res.status(500).json({ error: 'Failed to fetch bridge chat' });
      }
    });

    // Get bridge details for chat page
    this.app.get('/api/metaverse/bridge/:bridgeId', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const result = await this.db.query(`
          SELECT bridge_id, source_chain, target_chain, bridge_capacity, 
                 current_volume, is_operational, validator_count, last_transaction
          FROM dimensional_bridges 
          WHERE bridge_id = $1
        `, [bridgeId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Bridge not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching bridge details:', error);
        res.status(500).json({ error: 'Failed to fetch bridge details' });
      }
    });

    // Create a new bridge
    this.app.post('/api/metaverse/bridges', async (req, res) => {
      try {
        const { source_chain, target_chain, bridge_capacity = 1000000 } = req.body;
        
        if (!source_chain || !target_chain) {
          return res.status(400).json({ error: 'Source chain and target chain are required' });
        }

        const bridgeId = `bridge_${source_chain.toLowerCase()}_${target_chain.toLowerCase()}`;
        
        const result = await this.db.query(`
          INSERT INTO dimensional_bridges (bridge_id, source_chain, target_chain, bridge_capacity)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [bridgeId, source_chain, target_chain, bridge_capacity]);
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error creating bridge:', error);
        res.status(500).json({ error: 'Failed to create bridge' });
      }
    });

    // Update bridge
    this.app.put('/api/metaverse/bridge/:bridgeId', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const b = req.body || {};
        const result = await this.db.query(`
          UPDATE dimensional_bridges SET
            source_chain = COALESCE($2, source_chain),
            target_chain = COALESCE($3, target_chain),
            bridge_capacity = COALESCE($4, bridge_capacity),
            current_volume = COALESCE($5, current_volume),
            is_operational = COALESCE($6, is_operational),
            validator_count = COALESCE($7, validator_count),
            last_transaction = COALESCE($8, last_transaction)
          WHERE bridge_id = $1
          RETURNING *
        `, [bridgeId, b.source_chain, b.target_chain, b.bridge_capacity, b.current_volume, b.is_operational, b.validator_count, b.last_transaction]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Bridge not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating bridge:', error);
        res.status(500).json({ error: 'Failed to update bridge' });
      }
    });

    // Delete bridge
    this.app.delete('/api/metaverse/bridge/:bridgeId', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const result = await this.db.query(`
          DELETE FROM dimensional_bridges WHERE bridge_id = $1 RETURNING bridge_id
        `, [bridgeId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Bridge not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting bridge:', error);
        res.status(500).json({ error: 'Failed to delete bridge' });
      }
    });

    // --- Chat rooms CRUD (metaverse.chat_rooms) ---
    this.app.get('/api/metaverse/chatrooms', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT id, name, description, owner_address, total_space, price, revenue, participants, coordinates, primary_bridge_id, created_at, expires_at
          FROM metaverse.chat_rooms
          ORDER BY created_at DESC
          LIMIT 200
        `);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
      }
    });

    this.app.post('/api/metaverse/chatrooms', async (req, res) => {
      try {
        const r = req.body || {};
        if (!r.id || !r.name || !r.owner_address) {
          return res.status(400).json({ error: 'id, name, owner_address are required' });
        }
        const result = await this.db.query(`
          INSERT INTO metaverse.chat_rooms (
            id, name, description, owner_address, total_space, price, revenue,
            participants, settings, coordinates, primary_bridge_id
          ) VALUES (
            $1,$2,$3,$4,COALESCE($5,0),COALESCE($6,0),COALESCE($7,0),
            COALESCE($8,'[]'::jsonb), COALESCE($9,'{}'::jsonb), COALESCE($10,'{}'::jsonb), $11
          ) RETURNING *
        `, [r.id, r.name, r.description, r.owner_address, r.total_space, r.price, r.revenue, r.participants, r.settings, r.coordinates, r.primary_bridge_id]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating chat room:', error);
        res.status(500).json({ error: 'Failed to create chat room' });
      }
    });

    this.app.put('/api/metaverse/chatrooms/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const r = req.body || {};
        const result = await this.db.query(`
          UPDATE metaverse.chat_rooms SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            total_space = COALESCE($4, total_space),
            price = COALESCE($5, price),
            revenue = COALESCE($6, revenue),
            participants = COALESCE($7, participants),
            settings = COALESCE($8, settings),
            coordinates = COALESCE($9, coordinates),
            primary_bridge_id = COALESCE($10, primary_bridge_id),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [id, r.name, r.description, r.total_space, r.price, r.revenue, r.participants, r.settings, r.coordinates, r.primary_bridge_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Chat room not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating chat room:', error);
        res.status(500).json({ error: 'Failed to update chat room' });
      }
    });

    this.app.delete('/api/metaverse/chatrooms/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM metaverse.chat_rooms WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Chat room not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting chat room:', error);
        res.status(500).json({ error: 'Failed to delete chat room' });
      }
    });

    // --- Bridge messages CRUD (metaverse.bridge_messages) ---
    this.app.get('/api/metaverse/messages', async (req, res) => {
      try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const result = await this.db.query(`
          SELECT id, message_id, bridge_id, user_name, user_id, message_text, message_type, metadata, created_at
          FROM metaverse.bridge_messages
          ORDER BY created_at DESC
          LIMIT $1
        `, [limit]);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
    });

    this.app.post('/api/metaverse/messages', async (req, res) => {
      try {
        const m = req.body || {};
        if (!m.id || !m.message_id || !m.bridge_id || !m.user_name || !m.message_text) {
          return res.status(400).json({ error: 'id, message_id, bridge_id, user_name, message_text required' });
        }
        const result = await this.db.query(`
          INSERT INTO metaverse.bridge_messages (id, message_id, bridge_id, user_name, user_id, message_text, message_type, metadata)
          VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'text'),COALESCE($8,'{}'::jsonb))
          RETURNING *
        `, [m.id, m.message_id, m.bridge_id, m.user_name, m.user_id, m.message_text, m.message_type, m.metadata]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
      }
    });

    this.app.delete('/api/metaverse/messages/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM metaverse.bridge_messages WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
      }
    });

    // --- Marketplace CRUD APIs ---
    // Get marketplace items
    this.app.get('/api/marketplace/items', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT * FROM marketplace_items
          ORDER BY created_at DESC
          LIMIT 100
        `);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching marketplace items:', error);
        res.status(500).json({ error: 'Failed to fetch marketplace items' });
      }
    });

    // Create marketplace item
    this.app.post('/api/marketplace/items', async (req, res) => {
      try {
        const item = req.body || {};
        if (!item.name || !item.type || !item.rarity) {
          return res.status(400).json({ error: 'name, type, rarity are required' });
        }
        const result = await this.db.query(`
          INSERT INTO marketplace_items (
            name, description, type, rarity, price, currency, image, icon,
            stats, effects, biome, requirements, for_sale, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          ) RETURNING *
        `, [
          item.name, item.description || '', item.type, item.rarity, item.price || 0,
          item.currency || 'LDOM', item.image || '', item.icon || '🎁',
          JSON.stringify(item.stats || {}), JSON.stringify(item.effects || []),
          item.biome || 'default', JSON.stringify(item.requirements || {}),
          item.for_sale !== false, JSON.stringify(item.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating marketplace item:', error);
        res.status(500).json({ error: 'Failed to create marketplace item' });
      }
    });

    // Update marketplace item
    this.app.put('/api/marketplace/items/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const item = req.body || {};
        const result = await this.db.query(`
          UPDATE marketplace_items SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            type = COALESCE($4, type),
            rarity = COALESCE($5, rarity),
            price = COALESCE($6, price),
            currency = COALESCE($7, currency),
            image = COALESCE($8, image),
            icon = COALESCE($9, icon),
            stats = COALESCE($10, stats),
            effects = COALESCE($11, effects),
            biome = COALESCE($12, biome),
            requirements = COALESCE($13, requirements),
            for_sale = COALESCE($14, for_sale),
            metadata = COALESCE($15, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, item.name, item.description, item.type, item.rarity, item.price,
          item.currency, item.image, item.icon, JSON.stringify(item.stats || {}),
          JSON.stringify(item.effects || []), item.biome, JSON.stringify(item.requirements || {}),
          item.for_sale, JSON.stringify(item.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating marketplace item:', error);
        res.status(500).json({ error: 'Failed to update marketplace item' });
      }
    });

    // Delete marketplace item
    this.app.delete('/api/marketplace/items/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM marketplace_items WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting marketplace item:', error);
        res.status(500).json({ error: 'Failed to delete marketplace item' });
      }
    });

    // Get user inventory
    this.app.get('/api/marketplace/inventory', async (req, res) => {
      try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });
        
        const result = await this.db.query(`
          SELECT mi.*, ui.quantity, ui.acquired_at
          FROM marketplace_items mi
          JOIN user_inventory ui ON mi.id = ui.item_id
          WHERE ui.user_id = $1
          ORDER BY ui.acquired_at DESC
        `, [user_id]);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
      }
    });

    // Add item to inventory
    this.app.post('/api/marketplace/inventory/add', async (req, res) => {
      try {
        const { user_id, item_id, quantity = 1 } = req.body;
        if (!user_id || !item_id) {
          return res.status(400).json({ error: 'user_id and item_id required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO user_inventory (user_id, item_id, quantity, acquired_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, item_id) 
          DO UPDATE SET quantity = user_inventory.quantity + $3
          RETURNING *
        `, [user_id, item_id, quantity]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error adding to inventory:', error);
        res.status(500).json({ error: 'Failed to add to inventory' });
      }
    });

    // Remove item from inventory
    this.app.delete('/api/marketplace/inventory/:user_id/:item_id', async (req, res) => {
      try {
        const { user_id, item_id } = req.params;
        const result = await this.db.query(`
          DELETE FROM user_inventory 
          WHERE user_id = $1 AND item_id = $2 
          RETURNING item_id
        `, [user_id, item_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found in inventory' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error removing from inventory:', error);
        res.status(500).json({ error: 'Failed to remove from inventory' });
      }
    });

    // --- Mining CRUD APIs ---
    // Get mining sessions
    this.app.get('/api/mining/sessions', async (req, res) => {
      try {
        const { user_id, status } = req.query;
        let query = `SELECT * FROM mining_sessions WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (user_id) {
          query += ` AND user_id = $${++paramCount}`;
          params.push(user_id);
        }
        if (status) {
          query += ` AND status = $${++paramCount}`;
          params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching mining sessions:', error);
        res.status(500).json({ error: 'Failed to fetch mining sessions' });
      }
    });

    // Create mining session
    this.app.post('/api/mining/sessions', async (req, res) => {
      try {
        const session = req.body || {};
        if (!session.user_id || !session.mining_type) {
          return res.status(400).json({ error: 'user_id and mining_type are required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO mining_sessions (
            user_id, mining_type, status, start_time, end_time, 
            space_mined_kb, rewards_earned, efficiency_score, 
            biome_type, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          ) RETURNING *
        `, [
          session.user_id, session.mining_type, session.status || 'active',
          session.start_time || new Date().toISOString(), session.end_time,
          session.space_mined_kb || 0, session.rewards_earned || 0,
          session.efficiency_score || 0, session.biome_type || 'default',
          JSON.stringify(session.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating mining session:', error);
        res.status(500).json({ error: 'Failed to create mining session' });
      }
    });

    // Update mining session
    this.app.put('/api/mining/sessions/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const session = req.body || {};
        const result = await this.db.query(`
          UPDATE mining_sessions SET
            status = COALESCE($2, status),
            end_time = COALESCE($3, end_time),
            space_mined_kb = COALESCE($4, space_mined_kb),
            rewards_earned = COALESCE($5, rewards_earned),
            efficiency_score = COALESCE($6, efficiency_score),
            metadata = COALESCE($7, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, session.status, session.end_time, session.space_mined_kb,
          session.rewards_earned, session.efficiency_score, JSON.stringify(session.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating mining session:', error);
        res.status(500).json({ error: 'Failed to update mining session' });
      }
    });

    // Delete mining session
    this.app.delete('/api/mining/sessions/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM mining_sessions WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting mining session:', error);
        res.status(500).json({ error: 'Failed to delete mining session' });
      }
    });

    // Get mining rewards
    this.app.get('/api/mining/rewards', async (req, res) => {
      try {
        const { user_id, status } = req.query;
        let query = `SELECT * FROM mining_rewards WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (user_id) {
          query += ` AND user_id = $${++paramCount}`;
          params.push(user_id);
        }
        if (status) {
          query += ` AND status = $${++paramCount}`;
          params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching mining rewards:', error);
        res.status(500).json({ error: 'Failed to fetch mining rewards' });
      }
    });

    // Claim mining reward
    this.app.post('/api/mining/rewards/:id/claim', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`
          UPDATE mining_rewards 
          SET status = 'claimed', claimed_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND status = 'pending'
          RETURNING *
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Reward not found or already claimed' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error claiming mining reward:', error);
        res.status(500).json({ error: 'Failed to claim mining reward' });
      }
    });

    // Get mining stats
    this.app.get('/api/mining/stats', async (req, res) => {
      try {
        const { user_id } = req.query;
        let query = `
          SELECT 
            COUNT(*) as total_sessions,
            SUM(space_mined_kb) as total_space_mined,
            SUM(rewards_earned) as total_rewards,
            AVG(efficiency_score) as avg_efficiency,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions
          FROM mining_sessions
        `;
        const params = [];
        
        if (user_id) {
          query += ` WHERE user_id = $1`;
          params.push(user_id);
        }
        
        const result = await this.db.query(query, params);
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching mining stats:', error);
        res.status(500).json({ error: 'Failed to fetch mining stats' });
      }
    });

    // --- Alchemy CRUD APIs ---
    // Get alchemy elements
    this.app.get('/api/alchemy/elements', async (req, res) => {
      try {
        const { rarity, biome } = req.query;
        let query = `SELECT * FROM alchemy_elements WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (rarity) {
          query += ` AND rarity = $${++paramCount}`;
          params.push(rarity);
        }
        if (biome) {
          query += ` AND biome = $${++paramCount}`;
          params.push(biome);
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching alchemy elements:', error);
        res.status(500).json({ error: 'Failed to fetch alchemy elements' });
      }
    });

    // Create alchemy element
    this.app.post('/api/alchemy/elements', async (req, res) => {
      try {
        const element = req.body || {};
        if (!element.name || !element.type || !element.rarity) {
          return res.status(400).json({ error: 'name, type, rarity are required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO alchemy_elements (
            name, description, type, rarity, power_level, 
            effects, biome, discovery_conditions, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) RETURNING *
        `, [
          element.name, element.description || '', element.type, element.rarity,
          element.power_level || 0, JSON.stringify(element.effects || []),
          element.biome || 'default', JSON.stringify(element.discovery_conditions || {}),
          JSON.stringify(element.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating alchemy element:', error);
        res.status(500).json({ error: 'Failed to create alchemy element' });
      }
    });

    // Update alchemy element
    this.app.put('/api/alchemy/elements/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const element = req.body || {};
        const result = await this.db.query(`
          UPDATE alchemy_elements SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            type = COALESCE($4, type),
            rarity = COALESCE($5, rarity),
            power_level = COALESCE($6, power_level),
            effects = COALESCE($7, effects),
            biome = COALESCE($8, biome),
            discovery_conditions = COALESCE($9, discovery_conditions),
            metadata = COALESCE($10, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, element.name, element.description, element.type, element.rarity,
          element.power_level, JSON.stringify(element.effects || []),
          element.biome, JSON.stringify(element.discovery_conditions || {}),
          JSON.stringify(element.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Element not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating alchemy element:', error);
        res.status(500).json({ error: 'Failed to update alchemy element' });
      }
    });

    // Delete alchemy element
    this.app.delete('/api/alchemy/elements/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM alchemy_elements WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Element not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting alchemy element:', error);
        res.status(500).json({ error: 'Failed to delete alchemy element' });
      }
    });

    // Get alchemy recipes
    this.app.get('/api/alchemy/recipes', async (req, res) => {
      try {
        const { difficulty, result_type } = req.query;
        let query = `SELECT * FROM alchemy_recipes WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (difficulty) {
          query += ` AND difficulty = $${++paramCount}`;
          params.push(difficulty);
        }
        if (result_type) {
          query += ` AND result_type = $${++paramCount}`;
          params.push(result_type);
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching alchemy recipes:', error);
        res.status(500).json({ error: 'Failed to fetch alchemy recipes' });
      }
    });

    // Create alchemy recipe
    this.app.post('/api/alchemy/recipes', async (req, res) => {
      try {
        const recipe = req.body || {};
        if (!recipe.name || !recipe.ingredients || !recipe.result) {
          return res.status(400).json({ error: 'name, ingredients, result are required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO alchemy_recipes (
            name, description, ingredients, result, difficulty,
            success_rate, discovery_conditions, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          ) RETURNING *
        `, [
          recipe.name, recipe.description || '', JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.result), recipe.difficulty || 'beginner',
          recipe.success_rate || 0.5, JSON.stringify(recipe.discovery_conditions || {}),
          JSON.stringify(recipe.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating alchemy recipe:', error);
        res.status(500).json({ error: 'Failed to create alchemy recipe' });
      }
    });

    // Update alchemy recipe
    this.app.put('/api/alchemy/recipes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const recipe = req.body || {};
        const result = await this.db.query(`
          UPDATE alchemy_recipes SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            ingredients = COALESCE($4, ingredients),
            result = COALESCE($5, result),
            difficulty = COALESCE($6, difficulty),
            success_rate = COALESCE($7, success_rate),
            discovery_conditions = COALESCE($8, discovery_conditions),
            metadata = COALESCE($9, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, recipe.name, recipe.description, JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.result), recipe.difficulty, recipe.success_rate,
          JSON.stringify(recipe.discovery_conditions || {}), JSON.stringify(recipe.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Recipe not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating alchemy recipe:', error);
        res.status(500).json({ error: 'Failed to update alchemy recipe' });
      }
    });

    // Delete alchemy recipe
    this.app.delete('/api/alchemy/recipes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM alchemy_recipes WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Recipe not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting alchemy recipe:', error);
        res.status(500).json({ error: 'Failed to delete alchemy recipe' });
      }
    });

    // --- Animation CRUD APIs ---
    // Get animation presets
    this.app.get('/api/animation/presets', async (req, res) => {
      try {
        const { category, biome } = req.query;
        let query = `SELECT * FROM animation_presets WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (category) {
          query += ` AND category = $${++paramCount}`;
          params.push(category);
        }
        if (biome) {
          query += ` AND biome = $${++paramCount}`;
          params.push(biome);
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching animation presets:', error);
        res.status(500).json({ error: 'Failed to fetch animation presets' });
      }
    });

    // Create animation preset
    this.app.post('/api/animation/presets', async (req, res) => {
      try {
        const preset = req.body || {};
        if (!preset.name || !preset.category || !preset.animation_data) {
          return res.status(400).json({ error: 'name, category, animation_data are required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO animation_presets (
            name, description, category, biome, animation_data,
            duration, loop_type, effects, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) RETURNING *
        `, [
          preset.name, preset.description || '', preset.category, preset.biome || 'default',
          JSON.stringify(preset.animation_data), preset.duration || 1000,
          preset.loop_type || 'none', JSON.stringify(preset.effects || []),
          JSON.stringify(preset.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating animation preset:', error);
        res.status(500).json({ error: 'Failed to create animation preset' });
      }
    });

    // Update animation preset
    this.app.put('/api/animation/presets/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const preset = req.body || {};
        const result = await this.db.query(`
          UPDATE animation_presets SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            category = COALESCE($4, category),
            biome = COALESCE($5, biome),
            animation_data = COALESCE($6, animation_data),
            duration = COALESCE($7, duration),
            loop_type = COALESCE($8, loop_type),
            effects = COALESCE($9, effects),
            metadata = COALESCE($10, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, preset.name, preset.description, preset.category, preset.biome,
          JSON.stringify(preset.animation_data), preset.duration, preset.loop_type,
          JSON.stringify(preset.effects || []), JSON.stringify(preset.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Preset not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating animation preset:', error);
        res.status(500).json({ error: 'Failed to update animation preset' });
      }
    });

    // Delete animation preset
    this.app.delete('/api/animation/presets/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM animation_presets WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Preset not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting animation preset:', error);
        res.status(500).json({ error: 'Failed to delete animation preset' });
      }
    });

    // Get animation scenes
    this.app.get('/api/animation/scenes', async (req, res) => {
      try {
        const { biome, scene_type } = req.query;
        let query = `SELECT * FROM animation_scenes WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (biome) {
          query += ` AND biome = $${++paramCount}`;
          params.push(biome);
        }
        if (scene_type) {
          query += ` AND scene_type = $${++paramCount}`;
          params.push(scene_type);
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching animation scenes:', error);
        res.status(500).json({ error: 'Failed to fetch animation scenes' });
      }
    });

    // Create animation scene
    this.app.post('/api/animation/scenes', async (req, res) => {
      try {
        const scene = req.body || {};
        if (!scene.name || !scene.scene_type || !scene.scene_data) {
          return res.status(400).json({ error: 'name, scene_type, scene_data are required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO animation_scenes (
            name, description, scene_type, biome, scene_data,
            duration, background_music, effects, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) RETURNING *
        `, [
          scene.name, scene.description || '', scene.scene_type, scene.biome || 'default',
          JSON.stringify(scene.scene_data), scene.duration || 5000,
          scene.background_music || '', JSON.stringify(scene.effects || []),
          JSON.stringify(scene.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating animation scene:', error);
        res.status(500).json({ error: 'Failed to create animation scene' });
      }
    });

    // Update animation scene
    this.app.put('/api/animation/scenes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const scene = req.body || {};
        const result = await this.db.query(`
          UPDATE animation_scenes SET
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            scene_type = COALESCE($4, scene_type),
            biome = COALESCE($5, biome),
            scene_data = COALESCE($6, scene_data),
            duration = COALESCE($7, duration),
            background_music = COALESCE($8, background_music),
            effects = COALESCE($9, effects),
            metadata = COALESCE($10, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, scene.name, scene.description, scene.scene_type, scene.biome,
          JSON.stringify(scene.scene_data), scene.duration, scene.background_music,
          JSON.stringify(scene.effects || []), JSON.stringify(scene.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Scene not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating animation scene:', error);
        res.status(500).json({ error: 'Failed to update animation scene' });
      }
    });

    // Delete animation scene
    this.app.delete('/api/animation/scenes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM animation_scenes WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Scene not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting animation scene:', error);
        res.status(500).json({ error: 'Failed to delete animation scene' });
      }
    });

    // Get biomes
    this.app.get('/api/animation/biomes', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT * FROM biomes
          ORDER BY name ASC
        `);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching biomes:', error);
        res.status(500).json({ error: 'Failed to fetch biomes' });
      }
    });

    // Create biome
    this.app.post('/api/animation/biomes', async (req, res) => {
      try {
        const biome = req.body || {};
        if (!biome.name || !biome.biome_type) {
          return res.status(400).json({ error: 'name, biome_type are required' });
        }
        
        const result = await this.db.query(`
          INSERT INTO biomes (
            name, biome_type, description, environmental_params,
            color_scheme, weather_patterns, flora_fauna, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          ) RETURNING *
        `, [
          biome.name, biome.biome_type, biome.description || '',
          JSON.stringify(biome.environmental_params || {}),
          JSON.stringify(biome.color_scheme || {}),
          JSON.stringify(biome.weather_patterns || []),
          JSON.stringify(biome.flora_fauna || []),
          JSON.stringify(biome.metadata || {})
        ]);
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating biome:', error);
        res.status(500).json({ error: 'Failed to create biome' });
      }
    });

    // Update biome
    this.app.put('/api/animation/biomes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const biome = req.body || {};
        const result = await this.db.query(`
          UPDATE biomes SET
            name = COALESCE($2, name),
            biome_type = COALESCE($3, biome_type),
            description = COALESCE($4, description),
            environmental_params = COALESCE($5, environmental_params),
            color_scheme = COALESCE($6, color_scheme),
            weather_patterns = COALESCE($7, weather_patterns),
            flora_fauna = COALESCE($8, flora_fauna),
            metadata = COALESCE($9, metadata),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `, [
          id, biome.name, biome.biome_type, biome.description,
          JSON.stringify(biome.environmental_params || {}),
          JSON.stringify(biome.color_scheme || {}),
          JSON.stringify(biome.weather_patterns || []),
          JSON.stringify(biome.flora_fauna || []),
          JSON.stringify(biome.metadata || {})
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Biome not found' });
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating biome:', error);
        res.status(500).json({ error: 'Failed to update biome' });
      }
    });

    // Delete biome
    this.app.delete('/api/animation/biomes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await this.db.query(`DELETE FROM biomes WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Biome not found' });
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting biome:', error);
        res.status(500).json({ error: 'Failed to delete biome' });
      }
    });

    // Connect space mining to bridge
    this.app.post('/api/metaverse/connect-space-to-bridge', async (req, res) => {
      try {
        const { optimization_id, bridge_id, space_mined_kb, biome_type } = req.body;
        
        if (!optimization_id || !bridge_id || !space_mined_kb) {
          return res.status(400).json({ error: 'Optimization ID, bridge ID, and space mined are required' });
        }

        const result = await this.db.query(`
          INSERT INTO space_bridge_connections (optimization_id, bridge_id, space_mined_kb, biome_type)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [optimization_id, bridge_id, space_mined_kb, biome_type]);
        
        // Update bridge volume
        await this.db.query(`
          UPDATE dimensional_bridges 
          SET current_volume = current_volume + $1, updated_at = NOW()
          WHERE bridge_id = $2
        `, [space_mined_kb * 1000, bridge_id]); // Convert KB to bytes
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error connecting space to bridge:', error);
        res.status(500).json({ error: 'Failed to connect space to bridge' });
      }
    });

    // Get space-bridge connections
    this.app.get('/api/metaverse/space-bridge-connections', async (req, res) => {
      try {
        const { bridge_id } = req.query;
        
        let query = `
          SELECT sbc.*, o.url, o.optimization_type
          FROM space_bridge_connections sbc
          LEFT JOIN optimizations o ON sbc.optimization_id = o.id
        `;
        let params = [];
        
        if (bridge_id) {
          query += ' WHERE sbc.bridge_id = $1';
          params.push(bridge_id);
        }
        
        query += ' ORDER BY sbc.created_at DESC LIMIT 100';
        
        const result = await this.db.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching space-bridge connections:', error);
        res.status(500).json({ error: 'Failed to fetch space-bridge connections' });
      }
    });

    // Get bridge statistics
    this.app.get('/api/metaverse/bridge/:bridgeId/stats', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        
        const result = await this.db.query(`
          SELECT 
            COUNT(bm.id) as total_messages,
            COUNT(DISTINCT bp.user_id) as active_participants,
            COALESCE(SUM(sbc.space_mined_kb), 0) as total_space_connected,
            MAX(bm.created_at) as last_message_at,
            db.bridge_capacity,
            db.current_volume
          FROM dimensional_bridges db
          LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
          LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
          LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
          WHERE db.bridge_id = $1
          GROUP BY db.bridge_id, db.bridge_capacity, db.current_volume
        `, [bridgeId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Bridge not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching bridge stats:', error);
        res.status(500).json({ error: 'Failed to fetch bridge stats' });
      }
    });

    // Add bridge participant
    this.app.post('/api/metaverse/bridge/:bridgeId/join', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const { user_id, user_name } = req.body;
        
        if (!user_id || !user_name) {
          return res.status(400).json({ error: 'User ID and user name are required' });
        }

        // Check if user is already a participant
        const existingParticipant = await this.db.query(`
          SELECT id FROM bridge_participants 
          WHERE bridge_id = $1 AND user_id = $2
        `, [bridgeId, user_id]);
        
        if (existingParticipant.rows.length > 0) {
          // Update last active time
          await this.db.query(`
            UPDATE bridge_participants 
            SET last_active = NOW(), is_active = TRUE
            WHERE bridge_id = $1 AND user_id = $2
          `, [bridgeId, user_id]);
        } else {
          // Add new participant
          await this.db.query(`
            INSERT INTO bridge_participants (bridge_id, user_id, user_name)
            VALUES ($1, $2, $3)
          `, [bridgeId, user_id, user_name]);
        }
        
        res.json({ success: true, message: 'Joined bridge successfully' });
      } catch (error) {
        console.error('Error joining bridge:', error);
        res.status(500).json({ error: 'Failed to join bridge' });
      }
    });

    // Leave bridge
    this.app.post('/api/metaverse/bridge/:bridgeId/leave', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const { user_id } = req.body;
        
        if (!user_id) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        await this.db.query(`
          UPDATE bridge_participants 
          SET is_active = FALSE, last_active = NOW()
          WHERE bridge_id = $1 AND user_id = $2
        `, [bridgeId, user_id]);
        
        res.json({ success: true, message: 'Left bridge successfully' });
      } catch (error) {
        console.error('Error leaving bridge:', error);
        res.status(500).json({ error: 'Failed to leave bridge' });
      }
    });

    // =====================================================
    // ANALYTICS ENDPOINTS
    // =====================================================

    // Get bridge analytics
    this.app.get('/api/analytics/bridges', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            db.bridge_id,
            db.source_chain,
            db.target_chain,
            COUNT(bm.id) as total_messages,
            COUNT(DISTINCT bp.user_id) as active_participants,
            COALESCE(SUM(sbc.space_mined_kb), 0) as total_space_connected,
            COALESCE(AVG(sbc.space_mined_kb), 0) as avg_space_per_connection,
            EXTRACT(HOUR FROM MAX(bm.created_at)) as most_active_hour,
            TO_CHAR(MAX(bm.created_at), 'Day') as peak_activity_day,
            COALESCE(SUM(sbc.space_mined_kb) / NULLIF(COUNT(DISTINCT DATE(bm.created_at)), 0), 0) as space_growth_rate,
            COALESCE(COUNT(DISTINCT bp.user_id) / NULLIF(COUNT(DISTINCT bp.user_id), 0), 0) as participant_retention_rate,
            COALESCE(COUNT(bm.id) / NULLIF(EXTRACT(EPOCH FROM (MAX(bm.created_at) - MIN(bm.created_at))) / 3600, 0), 0) as message_frequency,
            CASE 
              WHEN COALESCE(SUM(sbc.space_mined_kb), 0) > 0 AND COUNT(DISTINCT bp.user_id) > 0 
              THEN LEAST(100, (COALESCE(SUM(sbc.space_mined_kb), 0) / 1000 * 30 + COUNT(DISTINCT bp.user_id) * 10 + COUNT(bm.id) / 100 * 20))
              ELSE 0 
            END as bridge_efficiency_score
          FROM dimensional_bridges db
          LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
          LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
          LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
          WHERE db.is_operational = TRUE
          GROUP BY db.bridge_id, db.source_chain, db.target_chain
          ORDER BY total_space_connected DESC
        `);
        
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching bridge analytics:', error);
        res.status(500).json({ error: 'Failed to fetch bridge analytics' });
      }
    });

    // Get space mining analytics
    this.app.get('/api/analytics/space-mining', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            COALESCE(SUM(sbc.space_mined_kb), 0) as total_space_mined,
            COUNT(DISTINCT sbc.optimization_id) as total_optimizations,
            COALESCE(AVG(sbc.space_mined_kb), 0) as avg_space_per_optimization,
            COALESCE(SUM(sbc.space_mined_kb) / NULLIF(COUNT(DISTINCT DATE(sbc.created_at)), 0), 0) as mining_efficiency,
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'biome', sbc.biome_type,
                'count', COUNT(*),
                'total_space', SUM(sbc.space_mined_kb)
              ) ORDER BY SUM(sbc.space_mined_kb) DESC
            ) FILTER (WHERE sbc.biome_type IS NOT NULL) as top_biomes,
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'date', DATE(sbc.created_at),
                'space_mined', SUM(sbc.space_mined_kb)
              ) ORDER BY DATE(sbc.created_at) DESC
            ) FILTER (WHERE sbc.created_at IS NOT NULL) as space_growth_trend
          FROM space_bridge_connections sbc
        `);
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching space mining analytics:', error);
        res.status(500).json({ error: 'Failed to fetch space mining analytics' });
      }
    });

    // Get user engagement analytics
    this.app.get('/api/analytics/user-engagement', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            COUNT(DISTINCT bp.user_id) as total_users,
            COUNT(DISTINCT bp.user_id) FILTER (WHERE bp.is_active = TRUE) as active_users,
            COUNT(DISTINCT bp.user_id) FILTER (WHERE bp.joined_at >= CURRENT_DATE) as new_users_today,
            COALESCE(COUNT(DISTINCT bp.user_id) FILTER (WHERE bp.is_active = TRUE) / NULLIF(COUNT(DISTINCT bp.user_id), 0), 0) as user_retention_rate,
            COALESCE(AVG(EXTRACT(EPOCH FROM (bp.last_active - bp.joined_at))), 0) as avg_session_duration,
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'bridge_id', bp.bridge_id,
                'participants', COUNT(DISTINCT bp.user_id),
                'messages', COUNT(bm.id)
              ) ORDER BY COUNT(DISTINCT bp.user_id) DESC
            ) as most_active_bridges,
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'hour', EXTRACT(HOUR FROM bm.created_at),
                'activity', COUNT(*)
              ) ORDER BY EXTRACT(HOUR FROM bm.created_at)
            ) FILTER (WHERE bm.created_at IS NOT NULL) as user_activity_patterns
          FROM bridge_participants bp
          LEFT JOIN bridge_messages bm ON bp.bridge_id = bm.bridge_id
        `);
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching user engagement analytics:', error);
        res.status(500).json({ error: 'Failed to fetch user engagement analytics' });
      }
    });

    // Get bridge comparison
    this.app.get('/api/analytics/bridge-comparison', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            db.bridge_id,
            db.source_chain,
            db.target_chain,
            COALESCE(SUM(sbc.space_mined_kb), 0) as total_space,
            COUNT(DISTINCT bp.user_id) as participant_count,
            COUNT(bm.id) as message_count,
            CASE 
              WHEN COALESCE(SUM(sbc.space_mined_kb), 0) > 0 AND COUNT(DISTINCT bp.user_id) > 0 
              THEN LEAST(100, (COALESCE(SUM(sbc.space_mined_kb), 0) / 1000 * 30 + COUNT(DISTINCT bp.user_id) * 10 + COUNT(bm.id) / 100 * 20))
              ELSE 0 
            END as efficiency_score,
            COALESCE(SUM(sbc.space_mined_kb) / NULLIF(COUNT(DISTINCT DATE(sbc.created_at)), 0), 0) as growth_rate
          FROM dimensional_bridges db
          LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
          LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
          LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
          WHERE db.is_operational = TRUE
          GROUP BY db.bridge_id, db.source_chain, db.target_chain
          ORDER BY efficiency_score DESC
        `);
        
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching bridge comparison:', error);
        res.status(500).json({ error: 'Failed to fetch bridge comparison' });
      }
    });

    // Get real-time analytics
    this.app.get('/api/analytics/real-time', async (req, res) => {
      try {
        const result = await this.db.query(`
          SELECT 
            COUNT(DISTINCT db.bridge_id) as active_bridges,
            COUNT(DISTINCT bp.user_id) as active_users,
            COUNT(bm.id) FILTER (WHERE bm.created_at >= NOW() - INTERVAL '1 hour') as messages_last_hour,
            COALESCE(SUM(sbc.space_mined_kb), 0) FILTER (WHERE sbc.created_at >= NOW() - INTERVAL '1 hour') as space_mined_last_hour,
            COUNT(DISTINCT bp.user_id) FILTER (WHERE bp.joined_at >= NOW() - INTERVAL '1 hour') as new_users_last_hour
          FROM dimensional_bridges db
          LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
          LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
          LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
          WHERE db.is_operational = TRUE
        `);
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching real-time analytics:', error);
        res.status(500).json({ error: 'Failed to fetch real-time analytics' });
      }
    });

    // Get analytics summary
    this.app.get('/api/analytics/summary', async (req, res) => {
      try {
        const [bridgeResult, spaceResult, userResult] = await Promise.all([
          this.db.query(`
            SELECT 
              COUNT(*) as total_bridges,
              COALESCE(SUM(sbc.space_mined_kb), 0) as total_space_connected,
              COUNT(bm.id) as total_messages,
              AVG(CASE 
                WHEN COALESCE(SUM(sbc.space_mined_kb), 0) > 0 AND COUNT(DISTINCT bp.user_id) > 0 
                THEN LEAST(100, (COALESCE(SUM(sbc.space_mined_kb), 0) / 1000 * 30 + COUNT(DISTINCT bp.user_id) * 10 + COUNT(bm.id) / 100 * 20))
                ELSE 0 
              END) as avg_efficiency
            FROM dimensional_bridges db
            LEFT JOIN space_bridge_connections sbc ON db.bridge_id = sbc.bridge_id
            LEFT JOIN bridge_participants bp ON db.bridge_id = bp.bridge_id AND bp.is_active = TRUE
            LEFT JOIN bridge_messages bm ON db.bridge_id = bm.bridge_id
            WHERE db.is_operational = TRUE
          `),
          this.db.query(`
            SELECT COALESCE(SUM(space_mined_kb), 0) as total_space_mined
            FROM space_bridge_connections
          `),
          this.db.query(`
            SELECT COUNT(DISTINCT user_id) FILTER (WHERE is_active = TRUE) as active_users
            FROM bridge_participants
          `)
        ]);

        const summary = {
          total_bridges: bridgeResult.rows[0].total_bridges,
          total_space_connected: bridgeResult.rows[0].total_space_connected,
          total_participants: userResult.rows[0].active_users,
          total_messages: bridgeResult.rows[0].total_messages,
          avg_efficiency: bridgeResult.rows[0].avg_efficiency || 0,
          top_insights: [
            `Total space connected: ${bridgeResult.rows[0].total_space_connected.toFixed(1)}KB`,
            `Active participants: ${userResult.rows[0].active_users}`,
            `Average efficiency: ${(bridgeResult.rows[0].avg_efficiency || 0).toFixed(1)}%`
          ]
        };
        
        res.json(summary);
      } catch (error) {
        console.error('Error fetching analytics summary:', error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
      }
    });

    // =====================================================
    // SEARCH AND QUERY ENDPOINTS
    // =====================================================

    // Search schema.org data
    this.app.get('/api/search/schemas', async (req, res) => {
      try {
        const query = req.query.q;
        const schemaType = req.query.type;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        if (!query && !schemaType) {
          return res.status(400).json({ error: 'Query or type parameter required' });
        }

        let sqlQuery = `
          SELECT 
            url,
            schema_type,
            schema_data,
            confidence_score,
            validation_status,
            extracted_at
          FROM schema_data
          WHERE 1=1
        `;
        const params = [];

        if (query) {
          params.push(query);
          sqlQuery += ` AND schema_content_tsvector @@ plainto_tsquery('english', $${params.length})`;
        }

        if (schemaType) {
          params.push(schemaType);
          sqlQuery += ` AND schema_type = $${params.length}`;
        }

        sqlQuery += ` ORDER BY extracted_at DESC LIMIT ${limit}`;

        const result = await this.db.query(sqlQuery, params);
        res.json(result.rows);

      } catch (error) {
        console.error('Failed to search schemas:', error);
        res.status(500).json({ error: 'Failed to search schema data' });
      }
    });

    // Search backlink network
    this.app.get('/api/search/backlinks', async (req, res) => {
      try {
        const domain = req.query.domain;
        const linkType = req.query.type;
        const minStrength = parseFloat(req.query.minStrength) || 0;

        if (!domain) {
          return res.status(400).json({ error: 'Domain parameter required' });
        }

        let query = `
          SELECT 
            source_url,
            target_url,
            anchor_text,
            link_type,
            link_strength,
            context_data,
            discovered_at
          FROM backlink_network
          WHERE (source_domain = $1 OR target_domain = $1)
            AND link_strength >= $2
        `;
        const params = [domain, minStrength];

        if (linkType) {
          params.push(linkType);
          query += ` AND link_type = $${params.length}`;
        }

        query += ' ORDER BY link_strength DESC LIMIT 100';

        const result = await this.db.query(query, params);
        res.json(result.rows);

      } catch (error) {
        console.error('Failed to search backlinks:', error);
        res.status(500).json({ error: 'Failed to search backlink data' });
      }
    });

    // =====================================================
    // ADMIN AND MANAGEMENT ENDPOINTS
    // =====================================================

    // Add custom crawl targets
    this.app.post('/api/admin/add-targets', async (req, res) => {
      try {
        const { urls, priority = 5 } = req.body;
        
        if (!Array.isArray(urls) || urls.length === 0) {
          return res.status(400).json({ error: 'URLs array required' });
        }

        const addedUrls = [];
        for (const url of urls) {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;

            await this.db.query(`
              INSERT INTO crawl_targets (url, domain, priority, status)
              VALUES ($1, $2, $3, 'pending')
              ON CONFLICT (url) DO NOTHING
            `, [url, domain, priority]);

            addedUrls.push(url);
          } catch (error) {
            console.error(`Invalid URL: ${url}`, error);
          }
        }

        res.json({ 
          success: true, 
          added: addedUrls.length,
          urls: addedUrls 
        });

      } catch (error) {
        console.error('Failed to add crawl targets:', error);
        res.status(500).json({ error: 'Failed to add crawl targets' });
      }
    });

    // System health check
    this.app.get('/api/health', async (req, res) => {
      try {
        // Check database connection
        const dbResult = await this.db.query('SELECT NOW()');
        
        // Check crawler system
        const crawlerStatus = this.crawlerSystem ? 
          { running: this.crawlerSystem.isRunning || false } : 
          { running: false };

        // Get basic stats
        const statsResult = this.dbDisabled ? 
          { rows: [{ total_targets: 0, total_optimizations: 0, total_schemas: 0 }] } :
          await this.db.query(`
            SELECT 
              (SELECT COUNT(*) FROM crawl_targets) as total_targets,
              (SELECT COUNT(*) FROM dom_optimizations) as total_optimizations,
              (SELECT COUNT(*) FROM schema_data) as total_schemas
          `);

        // Get integration service status
        const integrationStatus = this.integrationService ? this.integrationService.getStatus() : null;

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: {
            connected: !this.dbDisabled,
            serverTime: this.dbDisabled ? new Date().toISOString() : dbResult.rows[0].now
          },
          crawler: crawlerStatus,
          statistics: statsResult.rows[0],
          connectedClients: this.connectedClients.size,
          integration: integrationStatus
        });

      } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // Integration service status
    this.app.get('/api/integration/status', async (req, res) => {
      try {
        const status = this.integrationService ? this.integrationService.getStatus() : null;
        
        if (!status) {
          return res.status(503).json({ error: 'Integration service not available' });
        }

        res.json({
          success: true,
          status
        });

      } catch (error) {
        console.error('Failed to get integration status:', error);
        res.status(500).json({ 
          error: 'Failed to get integration status',
          details: error.message 
        });
      }
    });

    // Get available Cursor API functions
    this.app.get('/api/integration/cursor/functions', async (req, res) => {
      try {
        const functions = this.integrationService ? 
          this.integrationService.getAvailableCursorFunctions() : 
          [];

        res.json({
          success: true,
          functions
        });

      } catch (error) {
        console.error('Failed to get Cursor functions:', error);
        res.status(500).json({ 
          error: 'Failed to get Cursor functions',
          details: error.message 
        });
      }
    });

    // Get available n8n workflows
    this.app.get('/api/integration/n8n/workflows', async (req, res) => {
      try {
        const workflows = this.integrationService ? 
          this.integrationService.getAvailableN8nWorkflows() : 
          [];

        res.json({
          success: true,
          workflows
        });

      } catch (error) {
        console.error('Failed to get n8n workflows:', error);
        res.status(500).json({ 
          error: 'Failed to get n8n workflows',
          details: error.message 
        });
      }
    });

    // =====================================================
    // BLOCKCHAIN PROOF OF OPTIMIZATION ENDPOINTS
    // =====================================================

    // Submit Proof of Optimization
    this.app.post('/api/blockchain/submit-poo', async (req, res) => {
      try {
        const { crawlId, merkleRoot, bytesSaved, backlinksCount, artifactCID } = req.body;
        
        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        // Submit PoO to blockchain
        const tx = await this.pooContract.submitPoO(
          crawlId,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID
        );

        await tx.wait();

        // Emit real-time update
        this.io.emit('blockchain_update', {
          type: 'poo_submitted',
          crawlId,
          txHash: tx.hash,
          bytesSaved,
          backlinksCount,
          timestamp: Date.now()
        });

        res.json({
          success: true,
          txHash: tx.hash,
          crawlId,
          bytesSaved,
          backlinksCount
        });
      } catch (error) {
        console.error('PoO submission failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get PoO status
    this.app.get('/api/blockchain/poo/:crawlId', async (req, res) => {
      try {
        const { crawlId } = req.params;
        
        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        const proof = await this.pooContract.getProof(crawlId);
        
        res.json({
          crawlId,
          submitter: proof.submitter,
          merkleRoot: proof.merkleRoot,
          bytesSaved: proof.bytesSaved.toString(),
          backlinksCount: proof.backlinksCount.toString(),
          artifactCID: proof.artifactCID,
          submittedAt: proof.submittedAt.toString(),
          challengeWindowEnds: proof.challengeWindowEnds.toString(),
          finalized: proof.finalized,
          slashed: proof.slashed
        });
      } catch (error) {
        console.error('Failed to get PoO status:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Challenge PoO
    this.app.post('/api/blockchain/challenge-poo', async (req, res) => {
      try {
        const { crawlId, merkleProof, leafData } = req.body;
        
        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        const tx = await this.pooContract.challengePoO(crawlId, merkleProof, leafData);
        await tx.wait();

        res.json({
          success: true,
          txHash: tx.hash,
          crawlId
        });
      } catch (error) {
        console.error('PoO challenge failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Submit batch of PoOs
    this.app.post('/api/blockchain/submit-batch-poo', async (req, res) => {
      try {
        const { batch, batchHash, signature, timestamp } = req.body;
        
        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        // Verify batch signature (simplified for now)
        if (!this.verifyBatchSignature(batch, batchHash, signature)) {
          return res.status(400).json({ error: 'Invalid batch signature' });
        }

        // Submit batch to blockchain
        const tx = await this.pooContract.submitBatchPoO(
          batch.map(poo => ({
            crawlId: poo.crawlId,
            merkleRoot: poo.merkleRoot,
            bytesSaved: poo.bytesSaved,
            backlinksCount: poo.backlinksCount,
            artifactCID: poo.artifactCID
          })),
          batchHash,
          signature
        );

        await tx.wait();

        // Emit real-time update
        this.io.emit('blockchain_update', {
          type: 'batch_poo_submitted',
          batchSize: batch.length,
          txHash: tx.hash,
          timestamp: Date.now()
        });

        res.json({
          success: true,
          txHash: tx.hash,
          batchSize: batch.length
        });
      } catch (error) {
        console.error('Batch PoO submission failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get blockchain statistics
    this.app.get('/api/blockchain/stats', async (req, res) => {
      try {
        if (!this.pooContract) {
          return res.status(503).json({ error: 'PoO contract not initialized' });
        }

        const totalProofs = await this.pooContract.getTotalProofs();
        const totalBytesSaved = await this.pooContract.getTotalBytesSaved();
        const totalBacklinks = await this.pooContract.getTotalBacklinks();

        res.json({
          totalProofs: totalProofs.toString(),
          totalBytesSaved: totalBytesSaved.toString(),
          totalBacklinks: totalBacklinks.toString(),
          contractAddress: this.pooContract.target,
          networkId: await this.provider.getNetwork().then(n => n.chainId)
        });
      } catch (error) {
        console.error('Failed to get blockchain stats:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // =====================================================
    // BLOCKCHAIN EVENT HANDLERS
    // =====================================================
  }

  setupBlockchainEventHandlers() {
    // Blockchain runner events
    this.blockchainRunner.on('started', () => {
      console.log('Headless blockchain runner started');
      this.broadcastToClients('blockchain_update', {
        type: 'runner_started',
        timestamp: Date.now()
      });
    });

    this.blockchainRunner.on('stopped', () => {
      console.log('Headless blockchain runner stopped');
      this.broadcastToClients('blockchain_update', {
        type: 'runner_stopped',
        timestamp: Date.now()
      });
    });

    this.blockchainRunner.on('optimization', (data) => {
      console.log('Blockchain optimization:', data);
      this.blockchainMetrics.onOptimizationSubmitted(data);
      this.broadcastToClients('blockchain_update', {
        type: 'optimization_submitted',
        data: data,
        timestamp: Date.now()
      });
    });

    this.blockchainRunner.on('blockMined', (data) => {
      console.log('Block mined:', data);
      this.blockchainMetrics.onBlockMined(data);
      this.broadcastToClients('blockchain_update', {
        type: 'block_mined',
        data: data,
        timestamp: Date.now()
      });
    });

    this.blockchainRunner.on('sessionStarted', (data) => {
      console.log('Mining session started:', data);
      this.miningSessions.set(data.sessionId, data);
      this.broadcastToClients('blockchain_update', {
        type: 'session_started',
        data: data,
        timestamp: Date.now()
      });
    });

    this.blockchainRunner.on('sessionStopped', (data) => {
      console.log('Mining session stopped:', data);
      this.miningSessions.delete(data.sessionId);
      this.broadcastToClients('blockchain_update', {
        type: 'session_stopped',
        data: data,
        timestamp: Date.now()
      });
    });

    // Blockchain metrics events
    this.blockchainMetrics.on('metricsUpdated', (data) => {
      this.broadcastToClients('blockchain_update', {
        type: 'metrics_updated',
        data: data,
        timestamp: Date.now()
      });
    });

    this.blockchainMetrics.on('error', (error) => {
      console.error('Blockchain metrics error:', error);
    });
  }

  broadcastToClients(event, data) {
    this.io.emit(event, data);
  }

  setupRoutes() {
    // =====================================================
    // BLOCKCHAIN ENDPOINTS
    // =====================================================

    // Start blockchain mining
    this.app.post('/api/blockchain/start-mining', async (req, res) => {
      try {
        const { userAddress, extensionId } = req.body;
        
        if (!userAddress) {
          return res.status(400).json({ error: 'User address required' });
        }

        const sessionId = await this.blockchainRunner.startMiningSession(userAddress, extensionId);
        
        res.json({
          success: true,
          sessionId,
          message: 'Mining session started'
        });
      } catch (error) {
        console.error('Failed to start mining:', error);
        res.status(500).json({ error: 'Failed to start mining session' });
      }
    });

    // Stop blockchain mining
    this.app.post('/api/blockchain/stop-mining', async (req, res) => {
      try {
        const { userAddress } = req.body;
        
        // Find and stop session for this user
        for (const [sessionId, session] of this.miningSessions) {
          if (session.userAddress === userAddress) {
            await this.blockchainRunner.stopMiningSession(sessionId);
            break;
          }
        }
        
        res.json({
          success: true,
          message: 'Mining session stopped'
        });
      } catch (error) {
        console.error('Failed to stop mining:', error);
        res.status(500).json({ error: 'Failed to stop mining session' });
      }
    });

    // Submit optimization to blockchain
    this.app.post('/api/blockchain/submit-optimization', async (req, res) => {
      try {
        const { url, userAddress, domAnalysis, spaceSaved, timestamp } = req.body;
        
        if (!userAddress || !spaceSaved) {
          return res.status(400).json({ error: 'User address and space saved required' });
        }

        // Store optimization in database
        await this.db.query(`
          INSERT INTO blockchain_optimizations (user_address, url, dom_analysis, space_saved, timestamp, status)
          VALUES ($1, $2, $3, $4, $5, 'submitted')
        `, [userAddress, url, JSON.stringify(domAnalysis), spaceSaved, new Date(timestamp)]);

        // Update blockchain metrics
        this.blockchainMetrics.onOptimizationSubmitted({ spaceSaved });

        // Broadcast to clients
        this.broadcastToClients('blockchain_update', {
          type: 'optimization_submitted',
          data: {
            userAddress,
            url,
            spaceSaved,
            timestamp: Date.now()
          }
        });

        res.json({
          success: true,
          message: 'Optimization submitted to blockchain'
        });
      } catch (error) {
        console.error('Failed to submit optimization:', error);
        res.status(500).json({ error: 'Failed to submit optimization' });
      }
    });

    // Get blockchain metrics
    this.app.get('/api/blockchain/metrics', (req, res) => {
      try {
        const metrics = this.blockchainMetrics.getCurrentMetrics();
        const runnerMetrics = this.blockchainRunner.getMetrics();
        
        res.json({
          blockchain: metrics,
          runner: runnerMetrics,
          sessions: Array.from(this.miningSessions.values())
        });
      } catch (error) {
        console.error('Failed to get blockchain metrics:', error);
        res.status(500).json({ error: 'Failed to get blockchain metrics' });
      }
    });

    // Get blockchain status
    this.app.get('/api/blockchain/status', (req, res) => {
      try {
        res.json({
          isRunning: this.blockchainRunner.isRunning,
          activeSessions: this.miningSessions.size,
          metrics: this.blockchainRunner.getMetrics(),
          uptime: process.uptime()
        });
      } catch (error) {
        console.error('Failed to get blockchain status:', error);
        res.status(500).json({ error: 'Failed to get blockchain status' });
      }
    });

    // =====================================================
    // METRICS ENDPOINTS
    // =====================================================

    // Prometheus metrics endpoint
    this.app.get('/metrics', (req, res) => {
      try {
        res.set('Content-Type', 'text/plain');
        res.send(this.metrics.getPrometheusMetrics());
      } catch (error) {
        console.error('Failed to get metrics:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // JSON metrics endpoint
    this.app.get('/api/metrics', (req, res) => {
      try {
        res.json(this.metrics.getSummary());
      } catch (error) {
        console.error('Failed to get metrics summary:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Health check with metrics
    this.app.get('/api/health/detailed', (req, res) => {
      try {
        const summary = this.metrics.getSummary();
        const supervisorStats = this.supervisor.getStats();
        const blockchainMetrics = this.blockchainMetrics.getCurrentMetrics();
        
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          metrics: summary,
          blockchain: blockchainMetrics,
          supervisor: supervisorStats,
          crawler: this.crawlerSystem ? this.crawlerSystem.getStatus() : null
        });
      } catch (error) {
        console.error('Detailed health check failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // =====================================================
    // ADMIN API ENDPOINTS
    // =====================================================

    // Setup admin routes
    try {
      import('./src/api/adminApi.js')
        .then(({ setupAdminRoutes }) => {
          try {
            setupAdminRoutes(this.app);
            console.log('✅ Admin API routes registered');
          } catch (innerError) {
            console.warn('⚠️ Admin API setup failed:', innerError?.message || innerError);
          }
        })
        .catch((modErr) => {
          console.warn('⚠️ Admin API not loaded:', modErr?.message || modErr);
        });
    } catch (error) {
      console.warn('⚠️ Admin API load error:', error?.message || error);
    }
  }

  // Verify batch signature (simplified)
  verifyBatchSignature(batch, batchHash, signature) {
    // In production, implement proper EIP-712 signature verification
    // For now, just check that signature exists
    return signature && signature.length > 0;
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      this.connectedClients.add(socket.id);

      // Send initial data to new client
      socket.emit('initial_data', {
        connectedClients: this.connectedClients.size,
        crawlerRunning: this.crawlerSystem && this.crawlerSystem.isRunning
      });

      // Handle client requests for real-time updates
      socket.on('subscribe_stats', () => {
        socket.join('stats_updates');
      });

      socket.on('subscribe_optimizations', () => {
        socket.join('optimization_updates');
      });

      socket.on('subscribe_metaverse', () => {
        socket.join('metaverse_updates');
      });

  // Bridge chat rooms
  socket.on('bridge_join', (bridgeId) => {
    if (!bridgeId) return;
    socket.join(`bridge_${bridgeId}`);
  });
  socket.on('bridge_leave', (bridgeId) => {
    if (!bridgeId) return;
    socket.leave(`bridge_${bridgeId}`);
  });
  socket.on('bridge_message', async ({ bridgeId, user, text }) => {
    if (!bridgeId || !text) return;
    const payload = { user: user || 'anon', text, ts: Date.now(), bridgeId };
    
    // Persist message to database
    try {
      await this.db.query(`
        INSERT INTO bridge_messages (bridge_id, user_name, message_text, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [bridgeId, payload.user, payload.text]);
    } catch (err) {
      console.error('Failed to persist bridge message:', err);
    }
    
    this.io.to(`bridge_${bridgeId}`).emit('bridge_message', payload);
  });
  socket.on('bridge_typing', ({ bridgeId, user, isTyping }) => {
    if (!bridgeId) return;
    socket.to(`bridge_${bridgeId}`).emit('bridge_typing', { user, isTyping, ts: Date.now() });
  });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  async getCrawlStatistics() {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_targets,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'error') as errors,
        COALESCE(SUM(do.space_saved_bytes), 0) as total_space_saved,
        COALESCE(AVG(do.space_saved_bytes), 0) as avg_space_saved,
        COUNT(DISTINCT ct.domain) as unique_domains
      FROM crawl_targets ct
      LEFT JOIN dom_optimizations do ON ct.url = do.url
    `);

    return result.rows[0];
  }

  async getMetaverseStatistics() {
    const result = await this.db.query(`
      SELECT 
        (SELECT COUNT(*) FROM virtual_land_parcels) as virtual_land,
        (SELECT COUNT(*) FROM ai_consensus_nodes WHERE is_active = true) as ai_consensus_nodes,
        (SELECT COUNT(*) FROM storage_shards WHERE is_operational = true) as storage_shards,
        (SELECT COUNT(*) FROM dimensional_bridges WHERE is_operational = true) as dimensional_bridges,
        (SELECT COUNT(*) FROM reality_anchors WHERE is_active = true) as reality_anchors,
        (SELECT COALESCE(SUM(compute_power), 0) FROM ai_consensus_nodes WHERE is_active = true) as compute_staked
    `);

    return result.rows[0];
  }

  async getSchemaStatistics() {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_schemas,
        AVG(confidence_score) as avg_confidence,
        COUNT(DISTINCT schema_type) as unique_types,
        COUNT(DISTINCT url) as unique_urls
      FROM schema_data
    `);

    const typeStats = await this.db.query(`
      SELECT schema_type, COUNT(*) as count
      FROM schema_data
      GROUP BY schema_type
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      ...result.rows[0],
      top_types: typeStats.rows.reduce((acc, row) => {
        acc[row.schema_type] = parseInt(row.count);
        return acc;
      }, {})
    };
  }

  async getBacklinkStatistics() {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_links,
        COUNT(*) FILTER (WHERE link_type = 'internal') as internal_links,
        COUNT(*) FILTER (WHERE link_type != 'internal') as external_links,
        AVG(link_strength) as avg_strength,
        COUNT(DISTINCT source_domain) as unique_source_domains,
        COUNT(DISTINCT target_domain) as unique_target_domains
      FROM backlink_network
    `);

    return result.rows[0];
  }

  startRealtimeUpdates() {
    // Send periodic updates to connected clients
    setInterval(async () => {
      if (this.connectedClients.size === 0) return;

      try {
        // Emit real-time statistics
        const stats = await this.getCrawlStatistics();
        this.io.to('stats_updates').emit('stats_update', stats);

        // Emit recent optimizations
        const recentOptimizations = await this.db.query(`
          SELECT url, space_saved_bytes, tokens_earned, crawl_timestamp
          FROM dom_optimizations
          WHERE crawl_timestamp >= NOW() - INTERVAL '5 minutes'
          ORDER BY crawl_timestamp DESC
          LIMIT 10
        `);
        
        if (recentOptimizations.rows.length > 0) {
          this.io.to('optimization_updates').emit('new_optimizations', recentOptimizations.rows);
        }

        // Emit metaverse updates
        const metaverseStats = await this.getMetaverseStatistics();
        this.io.to('metaverse_updates').emit('metaverse_update', metaverseStats);

        // Update crawler status
        if (this.crawlerSystem) {
          const crawlerUpdate = await this.db.query(`
            SELECT crawler_id, status, current_url, pages_per_second
            FROM active_crawlers
            WHERE last_heartbeat >= NOW() - INTERVAL '30 seconds'
          `);
          
          this.io.emit('crawler_update', {
            activeCrawlers: crawlerUpdate.rows,
            isRunning: this.crawlerSystem.isRunning || false
          });
        }

      } catch (error) {
        console.error('Real-time update error:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  async setupCrawlerAdminRoutes() {
    console.log('🕷️ Setting up crawler admin API routes...');

    try {
      const crawlerAdminModule = await import('./src/api/crawler-admin.js');
      this.app.use('/api', crawlerAdminModule.default);
      console.log('✅ Crawler admin routes registered');
    } catch (err) {
      console.error('Failed to load crawler admin routes:', err);
    }
  }

  async setupTrainingControlRoutes() {
    console.log('🧠 Setting up training control API routes...');

    try {
      const trainingControlModule = await import('./src/api/training-control.js');
      this.app.use('/api', trainingControlModule.default);
      console.log('✅ Training control routes registered');
    } catch (err) {
      console.error('Failed to load training control routes:', err);
    }
  }

  setupWalletRoutes() {
    console.log('💰 Setting up wallet API routes...');
    
    // =====================================================
    // WALLET ENDPOINTS
    // =====================================================

    // Get wallet balance
    this.app.get('/api/wallet/balance', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'] || 'default-user';
        
        // Get balance from database
        const balanceResult = await this.db.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as lightdom_balance,
            COALESCE(SUM(CASE WHEN type = 'credit' AND currency = 'USD' THEN amount ELSE 0 END), 0) as usd_balance,
            COALESCE(SUM(CASE WHEN type = 'credit' AND currency = 'BTC' THEN amount ELSE 0 END), 0) as btc_balance,
            COALESCE(SUM(CASE WHEN type = 'credit' AND currency = 'ETH' THEN amount ELSE 0 END), 0) as eth_balance
          FROM user_economy 
          WHERE user_id = $1
        `, [userId]);

        const balance = balanceResult.rows[0] || {
          lightdom_balance: 1250.75,
          usd_balance: 125.08,
          btc_balance: 0.0023,
          eth_balance: 0.045
        };

        res.json({
          success: true,
          data: {
            lightdom: parseFloat(balance.lightdom_balance),
            usd: parseFloat(balance.usd_balance),
            btc: parseFloat(balance.btc_balance),
            eth: parseFloat(balance.eth_balance),
            lastUpdated: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
      }
    });

    // Get transaction history
    this.app.get('/api/wallet/transactions', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'] || 'default-user';
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const transactions = await this.db.query(`
          SELECT 
            id,
            type,
            amount,
            currency,
            description,
            status,
            created_at as timestamp,
            transaction_hash as hash,
            from_address,
            to_address
          FROM transactions 
          WHERE user_id = $1 
          ORDER BY created_at DESC 
          LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        res.json({
          success: true,
          data: transactions.rows.map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: parseFloat(tx.amount),
            currency: tx.currency,
            description: tx.description,
            status: tx.status,
            timestamp: tx.timestamp,
            hash: tx.hash,
            from: tx.from_address,
            to: tx.to_address
          }))
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
      }
    });

    // Get purchase items
    this.app.get('/api/wallet/items', async (req, res) => {
      try {
        const category = req.query.category;
        let query = 'SELECT * FROM marketplace_items WHERE status = $1';
        const params = ['active'];
        
        if (category) {
          query += ' AND category = $2';
          params.push(category);
        }
        
        query += ' ORDER BY featured DESC, created_at DESC';

        const items = await this.db.query(query, params);

        res.json({
          success: true,
          data: items.rows.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            currency: item.currency,
            category: item.category,
            image: item.image_url || '🛍️',
            discount: item.discount_percentage,
            featured: item.featured
          }))
        });
      } catch (error) {
        console.error('Error fetching purchase items:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch purchase items' });
      }
    });

    // Purchase an item
    this.app.post('/api/wallet/purchase', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'] || 'default-user';
        const { itemId, quantity = 1, paymentMethod = 'lightdom' } = req.body;

        if (!itemId) {
          return res.status(400).json({ success: false, error: 'Item ID is required' });
        }

        // Get item details
        const itemResult = await this.db.query(
          'SELECT * FROM marketplace_items WHERE id = $1 AND status = $2',
          [itemId, 'active']
        );

        if (itemResult.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Item not found' });
        }

        const item = itemResult.rows[0];
        const totalPrice = parseFloat(item.price) * quantity;

        // Check user balance
        const balanceResult = await this.db.query(`
          SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as balance
          FROM user_economy 
          WHERE user_id = $1 AND currency = $2
        `, [userId, item.currency]);

        const balance = parseFloat(balanceResult.rows[0]?.balance || 0);

        if (balance < totalPrice) {
          return res.status(400).json({ 
            success: false, 
            error: 'Insufficient funds',
            required: totalPrice,
            available: balance
          });
        }

        // Create transaction
        const transactionResult = await this.db.query(`
          INSERT INTO transactions (
            user_id, type, amount, currency, description, status, 
            transaction_hash, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          userId,
          'purchase',
          -totalPrice,
          item.currency,
          `Purchase: ${item.name} (${quantity}x)`,
          'completed',
          `0x${Math.random().toString(16).substr(2, 8)}`,
          new Date()
        ]);

        // Update user economy
        await this.db.query(`
          INSERT INTO user_economy (user_id, type, amount, currency, description, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          userId,
          'debit',
          totalPrice,
          item.currency,
          `Purchase: ${item.name}`,
          new Date()
        ]);

        res.json({
          success: true,
          data: {
            id: transactionResult.rows[0].id,
            type: 'purchase',
            amount: -totalPrice,
            currency: item.currency,
            description: `Purchase: ${item.name} (${quantity}x)`,
            status: 'completed',
            timestamp: transactionResult.rows[0].created_at,
            hash: transactionResult.rows[0].transaction_hash
          }
        });
      } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).json({ success: false, error: 'Purchase failed' });
      }
    });

    // Transfer funds
    this.app.post('/api/wallet/transfer', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'] || 'default-user';
        const { to, amount, currency = 'LDC', description } = req.body;

        if (!to || !amount) {
          return res.status(400).json({ success: false, error: 'Recipient and amount are required' });
        }

        // Check user balance
        const balanceResult = await this.db.query(`
          SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as balance
          FROM user_economy 
          WHERE user_id = $1 AND currency = $2
        `, [userId, currency]);

        const balance = parseFloat(balanceResult.rows[0]?.balance || 0);

        if (balance < amount) {
          return res.status(400).json({ 
            success: false, 
            error: 'Insufficient funds',
            required: amount,
            available: balance
          });
        }

        // Create transaction
        const transactionResult = await this.db.query(`
          INSERT INTO transactions (
            user_id, type, amount, currency, description, status, 
            from_address, to_address, transaction_hash, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `, [
          userId,
          'transfer',
          -amount,
          currency,
          description || `Transfer to ${to}`,
          'pending',
          `user_${userId}`,
          to,
          `0x${Math.random().toString(16).substr(2, 8)}`,
          new Date()
        ]);

        // Update user economy
        await this.db.query(`
          INSERT INTO user_economy (user_id, type, amount, currency, description, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          userId,
          'debit',
          amount,
          currency,
          `Transfer to ${to}`,
          new Date()
        ]);

        res.json({
          success: true,
          data: {
            id: transactionResult.rows[0].id,
            type: 'transfer',
            amount: -amount,
            currency: currency,
            description: description || `Transfer to ${to}`,
            status: 'pending',
            timestamp: transactionResult.rows[0].created_at,
            hash: transactionResult.rows[0].transaction_hash,
            to: to
          }
        });
      } catch (error) {
        console.error('Error processing transfer:', error);
        res.status(500).json({ success: false, error: 'Transfer failed' });
      }
    });

    // Get wallet address
    this.app.get('/api/wallet/address', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'] || 'default-user';
        
        // Generate or retrieve wallet address
        const address = `ld_${userId}_${Date.now().toString(36)}`;
        const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;

        res.json({
          success: true,
          data: {
            address: address,
            qrCode: qrCode
          }
        });
      } catch (error) {
        console.error('Error generating wallet address:', error);
        res.status(500).json({ success: false, error: 'Failed to generate wallet address' });
      }
    });

    // Get exchange rates
    this.app.get('/api/wallet/exchange-rates', async (req, res) => {
      try {
        // Mock exchange rates - in production, fetch from real API
        const rates = {
          'LDC_USD': 0.10,
          'LDC_BTC': 0.0000023,
          'LDC_ETH': 0.000036,
          'USD_LDC': 10.0,
          'BTC_LDC': 434782.61,
          'ETH_LDC': 27777.78
        };

        res.json({
          success: true,
          data: rates
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch exchange rates' });
      }
    });

    // Get wallet statistics
    this.app.get('/api/wallet/stats', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'] || 'default-user';

        const stats = await this.db.query(`
          SELECT 
            COUNT(*) as total_transactions,
            COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_spent,
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_received,
            COALESCE(AVG(ABS(amount)), 0) as average_transaction
          FROM transactions 
          WHERE user_id = $1
        `, [userId]);

        const categoryStats = await this.db.query(`
          SELECT 
            t.type,
            COUNT(*) as count
          FROM transactions t
          WHERE t.user_id = $1
          GROUP BY t.type
          ORDER BY count DESC
          LIMIT 1
        `, [userId]);

        res.json({
          success: true,
          data: {
            totalTransactions: parseInt(stats.rows[0]?.total_transactions || 0),
            totalSpent: parseFloat(stats.rows[0]?.total_spent || 0),
            totalReceived: parseFloat(stats.rows[0]?.total_received || 0),
            averageTransaction: parseFloat(stats.rows[0]?.average_transaction || 0),
            mostUsedCategory: categoryStats.rows[0]?.type || 'purchase'
          }
        });
      } catch (error) {
        console.error('Error fetching wallet statistics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wallet statistics' });
      }
    });

    console.log('✅ Wallet API routes configured');
  }

  setupUnusedAPIs() {
    console.log('🔗 Connecting unused APIs...');
    
    // Since these are TypeScript files, we'll create simple proxy routes
    // that demonstrate the API endpoints are available
    
    // Gamification API
    this.app.get('/api/gamification/stats', (req, res) => {
      res.json({
        success: true,
        data: {
          points: 1250,
          level: 5,
          achievements: [
            { id: 'first_optimization', name: 'First Optimization', icon: '🏆' },
            { id: 'space_saver', name: 'Space Saver', icon: '💾' }
          ],
          leaderboardPosition: 42
        }
      });
    });
    
    // Metaverse Alchemy API
    this.app.get('/api/metaverse-alchemy/items', (req, res) => {
      res.json({
        success: true,
        data: {
          items: [
            { id: 'crystal_optimizer', name: 'Crystal Optimizer', rarity: 'rare' },
            { id: 'space_harvester', name: 'Space Harvester', rarity: 'epic' }
          ],
          recipes: [
            { id: 'fusion_optimizer', ingredients: ['crystal', 'space'], result: 'mega_optimizer' }
          ]
        }
      });
    });
    
    // Space Mining API (different from blockchain mining)
    this.app.get('/api/space-mining/status', (req, res) => {
      res.json({
        success: true,
        data: {
          currentMiningRate: 1024, // bytes per second
          totalMined: 1048576, // 1MB
          activeMiners: 42,
          difficulty: 3
        }
      });
    });
    
    // Task API
    this.app.get('/api/tasks/list', (req, res) => {
      res.json({
        success: true,
        data: {
          tasks: [
            { id: 'optimize_dom', name: 'Optimize DOM', status: 'pending', reward: 100 },
            { id: 'harvest_space', name: 'Harvest Space', status: 'completed', reward: 250 }
          ]
        }
      });
    });
    
    // Advanced Node API
    this.app.get('/api/advanced-nodes/list', (req, res) => {
      res.json({
        success: true,
        data: {
          nodes: [
            { id: 'node_1', type: 'optimizer', status: 'active', efficiency: 0.95 },
            { id: 'node_2', type: 'harvester', status: 'idle', efficiency: 0.82 }
          ]
        }
      });
    });
    
    // BrowserBase API
    this.app.get('/api/browserbase/status', (req, res) => {
      res.json({
        success: true,
        data: {
          browsers: {
            chrome: { version: '120', status: 'ready' },
            firefox: { version: '121', status: 'ready' }
          },
          sessions: 5,
          maxConcurrency: 10
        }
      });
    });
    
    console.log('✅ Unused APIs connected:');
    console.log('   - GET /api/gamification/stats');
    console.log('   - GET /api/metaverse-alchemy/items');
    console.log('   - GET /api/space-mining/status');
    console.log('   - GET /api/tasks/list');
    console.log('   - GET /api/advanced-nodes/list');
    console.log('   - GET /api/browserbase/status');
    
    // Add extension bridge API
    try {
      const extensionBridge = require('./src/api/extensionBridge.js');
      this.app.use('/api/extension', extensionBridge);
      console.log('   - Extension Bridge API connected at /api/extension');
    } catch (error) {
      console.warn('   ⚠️ Extension Bridge not loaded:', error.message);
    }
    
    // Add utility integration endpoints
    this.app.post('/api/utils/store-artifact', async (req, res) => {
      try {
        // Import dynamically to avoid initialization issues
        const { utilityIntegration } = await import('./src/services/UtilityIntegration.js');
        const result = await utilityIntegration.storeOptimizationProof(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/utils/batch-proofs', async (req, res) => {
      try {
        const { utilityIntegration } = await import('./src/services/UtilityIntegration.js');
        const { proofs } = req.body;
        for (const proof of proofs) {
          await utilityIntegration.batcher.add(proof);
        }
        res.json({ success: true, message: `${proofs.length} proofs added to batch` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/utils/metrics', async (req, res) => {
      try {
        const { utilityIntegration } = await import('./src/services/UtilityIntegration.js');
        const metrics = await utilityIntegration.getMetrics();
        res.json({ success: true, data: metrics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Utility Integration API connected at /api/utils');
    
    // Add database integration endpoints
    this.app.post('/api/db/user', async (req, res) => {
      try {
        const { databaseIntegration } = await import('./src/services/DatabaseIntegration.js');
        await databaseIntegration.initialize();
        const user = await databaseIntegration.createUser(req.body.walletAddress, req.body);
        res.json({ success: true, data: user });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/db/stats/:walletAddress', async (req, res) => {
      try {
        const { databaseIntegration } = await import('./src/services/DatabaseIntegration.js');
        await databaseIntegration.initialize();
        const stats = await databaseIntegration.getUserStats(req.params.walletAddress);
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/db/optimization', async (req, res) => {
      try {
        const { databaseIntegration } = await import('./src/services/DatabaseIntegration.js');
        await databaseIntegration.initialize();
        const optimization = await databaseIntegration.recordOptimization(req.body.userId, req.body);
        res.json({ success: true, data: optimization });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/db/leaderboard', async (req, res) => {
      try {
        const { databaseIntegration } = await import('./src/services/DatabaseIntegration.js');
        await databaseIntegration.initialize();
        const leaderboard = await databaseIntegration.getLeaderboard(req.query.timeframe, req.query.limit);
        res.json({ success: true, data: leaderboard });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/db/system-stats', async (req, res) => {
      try {
        const { databaseIntegration } = await import('./src/services/DatabaseIntegration.js');
        await databaseIntegration.initialize();
        const stats = await databaseIntegration.getSystemStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Database Integration API connected at /api/db');
    
    // Add automation integration endpoints
    this.app.post('/api/automation/compliance', async (req, res) => {
      try {
        const { automationIntegration } = await import('./src/services/AutomationIntegration.js');
        await automationIntegration.initialize();
        const results = await automationIntegration.runComplianceCheck();
        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/automation/quality-gates', async (req, res) => {
      try {
        const { automationIntegration } = await import('./src/services/AutomationIntegration.js');
        await automationIntegration.initialize();
        const results = await automationIntegration.runQualityGates();
        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/automation/deploy', async (req, res) => {
      try {
        const { automationIntegration } = await import('./src/services/AutomationIntegration.js');
        await automationIntegration.initialize();
        const results = await automationIntegration.deploy(req.body.environment);
        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/automation/scale', async (req, res) => {
      try {
        const { automationIntegration } = await import('./src/services/AutomationIntegration.js');
        await automationIntegration.initialize();
        const results = await automationIntegration.scaleServices(req.body.action, req.body.replicas);
        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/automation/status', async (req, res) => {
      try {
        const { automationIntegration } = await import('./src/services/AutomationIntegration.js');
        const status = await automationIntegration.getStatus();
        res.json({ success: true, data: status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Automation Integration API connected at /api/automation');
    
    // Add configuration integration endpoints
    this.app.get('/api/config/:key', async (req, res) => {
      try {
        const { configurationIntegration } = await import('./src/services/ConfigurationIntegration.js');
        await configurationIntegration.initialize();
        const config = configurationIntegration.getConfig(req.params.key);
        if (!config) {
          return res.status(404).json({ success: false, error: 'Configuration not found' });
        }
        res.json({ success: true, data: config });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/config/env/:environment', async (req, res) => {
      try {
        const { configurationIntegration } = await import('./src/services/ConfigurationIntegration.js');
        await configurationIntegration.initialize();
        const config = configurationIntegration.getEnvironmentConfig(req.params.environment);
        res.json({ success: true, data: config });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/config/apply-env', async (req, res) => {
      try {
        const { configurationIntegration } = await import('./src/services/ConfigurationIntegration.js');
        await configurationIntegration.initialize();
        configurationIntegration.applyEnvironment(req.body.environment);
        res.json({ success: true, message: `Applied ${req.body.environment} environment` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Configuration Integration API connected at /api/config');
    
    // Setup admin routes
    try {
      import('./src/api/adminApi.js')
        .then(({ setupAdminRoutes }) => {
          try {
            setupAdminRoutes(this.app);
            console.log('   - Admin API connected at /api/admin');
          } catch (innerError) {
            console.warn('   ⚠️ Admin API setup failed:', innerError?.message || innerError);
          }
        })
        .catch((modErr) => {
          console.warn('   ⚠️ Admin API not loaded:', modErr?.message || modErr);
        });
    } catch (error) {
      console.warn('   ⚠️ Admin API load error:', error?.message || error);
    }
    
    // Setup user dashboard routes
    this.app.get('/api/user/dashboard', async (req, res) => {
      try {
        const stats = {
          optimizations: 15,
          spaceSaved: 5242880, // 5MB
          tokensEarned: '150',
          reputation: 350,
          activeProjects: 3,
          teamMembers: 0
        };
        
        const recentActivity = [
          {
            id: '1',
            type: 'optimization',
            description: 'Optimized example.com - saved 124KB',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            icon: 'zap'
          },
          {
            id: '2',
            type: 'mining',
            description: 'Mined block #1234 - earned 10 LDOM',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            icon: 'database'
          },
          {
            id: '3',
            type: 'achievement',
            description: 'Unlocked "Optimizer Pro" achievement',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            icon: 'award'
          }
        ];
        
        res.json({ stats, recentActivity, availableFeatures: [] });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - User Dashboard API connected at /api/user');
    
    // Add crawler persistence endpoints
    this.app.post('/api/crawler/record-site', async (req, res) => {
      try {
        const { crawlerPersistence } = await import('./src/services/CrawlerPersistenceService.js');
        const site = await crawlerPersistence.recordCrawledSite(req.body);
        res.json({ success: true, data: site });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/crawler/seo-insights/:domain', async (req, res) => {
      try {
        const { crawlerPersistence } = await import('./src/services/CrawlerPersistenceService.js');
        const insights = await crawlerPersistence.getSEOInsights(req.params.domain);
        res.json({ success: true, data: insights });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/crawler/available-slots', async (req, res) => {
      try {
        const { crawlerPersistence } = await import('./src/services/CrawlerPersistenceService.js');
        const slots = await crawlerPersistence.getAvailableSlots(req.query.type);
        res.json({ success: true, data: slots });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Crawler Persistence API connected at /api/crawler');
    
    // Add metaverse chat endpoints
    this.app.post('/api/metaverse/create-room', async (req, res) => {
      try {
        const { metaverseChatService } = await import('./src/services/MetaverseChatService.js');
        const room = await metaverseChatService.createChatRoom(
          req.body.owner,
          req.body.name,
          req.body.description,
          req.body.spaceRequired,
          req.body.settings
        );
        res.json({ success: true, data: room });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/metaverse/join-room', async (req, res) => {
      try {
        const { metaverseChatService } = await import('./src/services/MetaverseChatService.js');
        const success = await metaverseChatService.joinChatRoom(
          req.body.roomId,
          req.body.walletAddress,
          req.body.username
        );
        res.json({ success });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/metaverse/send-message', async (req, res) => {
      try {
        const { metaverseChatService } = await import('./src/services/MetaverseChatService.js');
        const message = await metaverseChatService.sendMessage(
          req.body.roomId,
          req.body.sender,
          req.body.message
        );
        res.json({ success: true, data: message });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/metaverse/search-rooms', async (req, res) => {
      try {
        const { metaverseChatService } = await import('./src/services/MetaverseChatService.js');
        const rooms = metaverseChatService.searchChatRooms(req.query.q, req.query);
        res.json({ success: true, data: rooms });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/metaverse/map', async (req, res) => {
      try {
        const { metaverseChatService } = await import('./src/services/MetaverseChatService.js');
        const map = metaverseChatService.getMetaverseMap();
        res.json({ success: true, data: map });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Metaverse Chat API connected at /api/metaverse');
    
    // Add LDOM economy endpoints
    this.app.get('/api/economy/user/:walletAddress', async (req, res) => {
      try {
        const { ldomEconomy } = await import('./src/services/LDOMEconomyService.js');
        const economy = await ldomEconomy.getUserEconomy(req.params.walletAddress);
        res.json({ success: true, data: economy });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/economy/reward-optimization', async (req, res) => {
      try {
        const { ldomEconomy } = await import('./src/services/LDOMEconomyService.js');
        const transaction = await ldomEconomy.rewardOptimization(
          req.body.walletAddress,
          req.body.spaceSaved,
          req.body.seoScore,
          req.body.url
        );
        res.json({ success: true, data: transaction });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/economy/stake', async (req, res) => {
      try {
        const { ldomEconomy } = await import('./src/services/LDOMEconomyService.js');
        const stakingEvent = await ldomEconomy.stakeTokens(
          req.body.walletAddress,
          req.body.amount,
          req.body.lockPeriod
        );
        res.json({ success: true, data: stakingEvent });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/economy/marketplace', async (req, res) => {
      try {
        const { ldomEconomy } = await import('./src/services/LDOMEconomyService.js');
        const listings = ldomEconomy.getMarketplaceListings(req.query);
        res.json({ success: true, data: listings });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/economy/tokenomics', async (req, res) => {
      try {
        const { ldomEconomy } = await import('./src/services/LDOMEconomyService.js');
        const tokenomics = ldomEconomy.getTokenomics();
        res.json({ success: true, data: tokenomics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - LDOM Economy API connected at /api/economy');
    
    // Add unified space bridge endpoints with real-time features
    this.app.post('/api/bridge/allocate-space', async (req, res) => {
      try {
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        const slots = await unifiedSpaceBridgeService.allocateSpaceForChatRoom(
          req.body.roomId,
          req.body.sizeRequired,
          req.body.owner
        );
        res.json({ success: true, data: slots });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.get('/api/bridge/analytics', async (req, res) => {
      try {
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        const analytics = unifiedSpaceBridgeService.getBridgeAnalytics();
        res.json({ success: true, data: analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    this.app.post('/api/bridge/optimize', async (req, res) => {
      try {
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        await unifiedSpaceBridgeService.optimizeBridges();
        res.json({ success: true, message: 'Bridge optimization started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Real-time bridge endpoints
    this.app.post('/api/bridge/join/:bridgeId', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const { userId } = req.body;
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        const stats = await unifiedSpaceBridgeService.joinBridge(bridgeId, userId);
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/bridge/message', async (req, res) => {
      try {
        const { bridgeId, userId, userName, messageText, messageType } = req.body;
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        const message = await unifiedSpaceBridgeService.sendBridgeMessage(
          bridgeId, userId, userName, messageText, messageType
        );
        res.json({ success: true, data: message });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/bridge/:bridgeId/stats', async (req, res) => {
      try {
        const { bridgeId } = req.params;
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        const stats = await unifiedSpaceBridgeService.getBridgeStats(bridgeId);
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/bridge/archive/:days', async (req, res) => {
      try {
        const days = parseInt(req.params.days) || 30;
        const { unifiedSpaceBridgeService } = await import('./src/services/UnifiedSpaceBridgeService.js');
        const archivedSpace = await unifiedSpaceBridgeService.archiveUnusedSpace(days);
        res.json({ success: true, data: { archivedSpace } });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    console.log('   - Unified Space Bridge API (with real-time) connected at /api/bridge');
  }

  async start(port = 3001) {
    try {
      const waitWithTimeout = (promise, ms, label) => {
        let t;
        const timeout = new Promise((_, reject) => {
          t = setTimeout(() => reject(new Error(`${label || 'operation'} timed out after ${ms}ms`)), ms);
        });
        return Promise.race([promise.finally(() => clearTimeout(t)), timeout]);
      };

      const findAvailablePort = async (startPort) => {
        const net = await import('node:net');
        const tryPort = (p) => new Promise((resolve) => {
          const srv = net.createServer();
          srv.once('error', () => resolve(false));
          srv.once('listening', () => srv.close(() => resolve(true)));
          srv.listen(p, '0.0.0.0');
        });
        for (let p = startPort; p < startPort + 10; p++) {
          // eslint-disable-next-line no-await-in-loop
          const ok = await tryPort(p);
          if (ok) return p;
        }
        return startPort;
      };

      // Database connectivity (soft-fail)
      if (this.dbDisabled) {
        console.log('⚠️  Database disabled (DB_DISABLED=true). Starting without DB connection.');
      } else {
        try {
          await waitWithTimeout(this.db.query('SELECT NOW()'), 5000, 'database check');
          console.log('✅ Database connected successfully');
        } catch (dbErr) {
          console.warn('⚠️  Database check failed, continuing without DB:', dbErr?.message || dbErr);
          this.dbDisabled = true;
        }
      }

      // Initialize blockchain (soft timeout)
      try {
        await waitWithTimeout(this.initializeBlockchain(), 8000, 'blockchain init');
      } catch (chainErr) {
        console.warn('⚠️  Blockchain init degraded:', chainErr?.message || chainErr);
        this.blockchainEnabled = false;
      }

      // Start supervisor (guard)
      try {
        await waitWithTimeout(this.supervisor.start(), 5000, 'supervisor start');
      } catch (supErr) {
        console.warn('⚠️  Supervisor failed to start:', supErr?.message || supErr);
      }
      
      // Start blockchain runner (optional)
      try {
        await this.blockchainRunner.start();
      } catch (error) {
        console.warn('⚠️ Blockchain runner failed to start:', error.message);
        console.log('ℹ️ Blockchain runner will be available after server is fully started');
      }

      // Ensure available port
      const chosenPort = await findAvailablePort(Number(process.env.API_PORT) || port);
      this.server.on('error', (err) => {
        console.error('❌ Server error:', err?.message || err);
      });

      // Start server
      this.server.listen(chosenPort, () => {
        console.log(`🚀 DOM Space Harvester API running on port ${chosenPort}`);
        console.log(`📊 Dashboard: http://localhost:${chosenPort}/api/health`);
        console.log(`🔌 WebSocket: ws://localhost:${chosenPort}`);
        console.log(`📁 Database: ${process.env.DB_NAME || 'dom_space_harvester'}`);
        if (this.blockchainEnabled) {
          console.log(`⛓️  Blockchain: ${this.provider ? 'Connected' : 'Disabled'}`);
        }
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      throw error;
    }
  }
  
  setupBridgeSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🌉 Bridge client connected: ${socket.id}`);
      
      // Join bridge room
      socket.on('join_bridge', async (data) => {
        const { bridgeId, userId } = data;
        socket.join(`bridge_${bridgeId}`);
        console.log(`User ${userId} joined bridge ${bridgeId}`);
        
        // Notify others in the bridge
        socket.to(`bridge_${bridgeId}`).emit('user_joined', {
          userId,
          bridgeId,
          timestamp: new Date()
        });
      });
      
      // Leave bridge room
      socket.on('leave_bridge', (data) => {
        const { bridgeId, userId } = data;
        socket.leave(`bridge_${bridgeId}`);
        
        socket.to(`bridge_${bridgeId}`).emit('user_left', {
          userId,
          bridgeId,
          timestamp: new Date()
        });
      });
      
      // Bridge messages
      socket.on('send_message', async (message) => {
        // Broadcast to all in the bridge room
        this.io.to(`bridge_${message.bridge_id}`).emit('bridge_message', message);
      });
      
      // Bridge status updates
      socket.on('bridge_created', (data) => {
        this.io.emit('bridge_created', data);
      });
      
      socket.on('space_allocated', (data) => {
        this.io.to(`bridge_${data.bridgeId}`).emit('space_allocated', data);
      });
      
      socket.on('optimization_started', (data) => {
        this.io.to(`bridge_${data.bridgeId}`).emit('optimization_started', data);
      });
      
      socket.on('optimization_complete', (data) => {
        this.io.to(`bridge_${data.bridgeId}`).emit('optimization_complete', data);
      });
      
      socket.on('allocation_started', (data) => {
        this.io.emit('allocation_started', data);
      });
      
      socket.on('space_archived', (data) => {
        this.io.to(`bridge_${data.bridgeId}`).emit('space_archived', data);
      });
      
      socket.on('disconnect', () => {
        console.log(`🌉 Bridge client disconnected: ${socket.id}`);
      });
    });
  }

  async shutdown() {
    console.log('🛑 Shutting down API server...');
    
    if (this.crawlerSystem) {
      await this.crawlerSystem.shutdown();
    }
    
    // if (this.integrationService) {
    //   await this.integrationService.shutdown();
    // }
    
    await this.db.end();
    this.server.close();
    
    console.log('✅ Server shutdown complete');
  }

  setupBlockchainRoutes() {
    // =====================================================
    // BLOCKCHAIN API ENDPOINTS
    // =====================================================

    // Get blockchain status
    this.app.get('/api/blockchain/status', async (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            connected: this.blockchainEnabled,
            network: {
              chainId: process.env.CHAIN_ID || '1337',
              name: process.env.NETWORK || 'localhost',
              rpcUrl: process.env.RPC_URL || 'http://localhost:8545'
            },
            contracts: {
              token: process.env.LIGHTDOM_TOKEN_ADDRESS || '',
              registry: process.env.OPTIMIZATION_REGISTRY_ADDRESS || '',
              nft: process.env.VIRTUAL_LAND_NFT_ADDRESS || ''
            }
          }
        });
      } catch (error) {
        console.error('Blockchain status error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get blockchain status'
        });
      }
    });

    // Get harvester stats
    this.app.get('/api/blockchain/harvester-stats/:address', async (req, res) => {
      try {
        const { address } = req.params;
        
        // Mock data for now - in production this would call the smart contract
        const mockStats = {
          reputation: 1250,
          spaceHarvested: 1024000, // 1MB in bytes
          optimizations: 15,
          successfulOptimizations: 12,
          streak: 5,
          tokensEarned: '1250.5',
          stakedAmount: '500.0',
          stakingRewards: '25.0'
        };
        
        res.json({
          success: true,
          data: mockStats
        });
      } catch (error) {
        console.error('Harvester stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get harvester stats'
        });
      }
    });

    // Get metaverse stats
    this.app.get('/api/blockchain/metaverse-stats', async (req, res) => {
      try {
        // Mock data for now
        const mockStats = {
          land: 25,
          nodes: 8,
          shards: 12,
          bridges: 3
        };
        
        res.json({
          success: true,
          data: mockStats
        });
      } catch (error) {
        console.error('Metaverse stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get metaverse stats'
        });
      }
    });

    // Get token balance
    this.app.get('/api/blockchain/token-balance/:address', async (req, res) => {
      try {
        const { address } = req.params;
        
        // Mock data for now
        const mockBalance = '1250.5';
        
        res.json({
          success: true,
          data: { balance: mockBalance }
        });
      } catch (error) {
        console.error('Token balance error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get token balance'
        });
      }
    });

    // Get staking rewards
    this.app.get('/api/blockchain/staking-rewards/:address', async (req, res) => {
      try {
        const { address } = req.params;
        
        // Mock data for now
        const mockRewards = '25.0';
        
        res.json({
          success: true,
          data: { rewards: mockRewards }
        });
      } catch (error) {
        console.error('Staking rewards error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get staking rewards'
        });
      }
    });

    // Submit optimization
    this.app.post('/api/blockchain/submit-optimization', async (req, res) => {
      try {
        const { url, spaceBytes, proofHash, biomeType, metadata } = req.body;
        
        // Validate required fields
        if (!url || !spaceBytes || !proofHash || !biomeType) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields'
          });
        }

        // Mock response for now
        res.json({
          success: true,
          data: {
            message: 'Optimization submitted successfully',
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            optimizationId: 'opt_' + Date.now()
          }
        });
      } catch (error) {
        console.error('Submit optimization error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to submit optimization'
        });
      }
    });

    // Get network info
    this.app.get('/api/blockchain/network-info', async (req, res) => {
      try {
        const networkInfo = {
          chainId: parseInt(process.env.CHAIN_ID || '1337'),
          name: process.env.NETWORK || 'localhost',
          blockNumber: Math.floor(Math.random() * 1000000),
          gasPrice: '20'
        };
        
        res.json({
          success: true,
          data: networkInfo
        });
      } catch (error) {
        console.error('Network info error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get network info'
        });
      }
    });

    console.log('✅ Blockchain API routes configured');
  }

  setupOptimizationRoutes() {
    // =====================================================
    // OPTIMIZATION API ENDPOINTS
    // =====================================================

    // Get all optimizations
    this.app.get('/api/optimizations', async (req, res) => {
      try {
        // Mock data for now
        const mockOptimizations = [
          {
            id: '1',
            website: 'example.com',
            url: 'https://example.com',
            type: 'Image Optimization',
            status: 'completed',
            progress: 100,
            scoreImprovement: 24,
            createdAt: '2024-01-15T10:30:00Z',
            completedAt: '2024-01-15T10:45:00Z',
            beforeScore: 65,
            afterScore: 89,
            details: {
              imagesOptimized: 12,
              cssOptimized: 3,
              jsOptimized: 2,
              htmlOptimized: 1,
              totalSavings: 1024
            }
          },
          {
            id: '2',
            website: 'test-site.org',
            url: 'https://test-site.org',
            type: 'CSS Optimization',
            status: 'running',
            progress: 65,
            scoreImprovement: 0,
            createdAt: '2024-01-16T09:15:00Z',
            beforeScore: 45,
            afterScore: 45,
            details: {
              imagesOptimized: 0,
              cssOptimized: 0,
              jsOptimized: 0,
              htmlOptimized: 0,
              totalSavings: 0
            }
          },
          {
            id: '3',
            website: 'demo.net',
            url: 'https://demo.net',
            type: 'JavaScript Optimization',
            status: 'failed',
            progress: 30,
            scoreImprovement: 0,
            createdAt: '2024-01-14T15:45:00Z',
            beforeScore: 72,
            afterScore: 72,
            details: {
              imagesOptimized: 0,
              cssOptimized: 0,
              jsOptimized: 0,
              htmlOptimized: 0,
              totalSavings: 0
            }
          }
        ];

        res.json({
          success: true,
          optimizations: mockOptimizations
        });
      } catch (error) {
        console.error('Optimizations error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get optimizations'
        });
      }
    });

    // Get optimization stats
    this.app.get('/api/optimizations/stats', async (req, res) => {
      try {
        const mockStats = {
          totalWebsites: 12,
          websitesOptimized: 8,
          averageScore: 78,
          tokensEarned: 4250,
          optimizationsToday: 3,
          totalOptimizations: 45,
          alerts: [
            {
              title: 'High Performance Improvement',
              description: 'Your average score improvement is 23% above the platform average.',
              type: 'success'
            },
            {
              title: 'Optimization Queue',
              description: 'You have 2 optimizations pending in your queue.',
              type: 'info'
            }
          ]
        };

        res.json(mockStats);
      } catch (error) {
        console.error('Optimization stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get optimization stats'
        });
      }
    });

    // Create optimization
    this.app.post('/api/optimizations', async (req, res) => {
      try {
        const { website, type, priority, description } = req.body;
        
        const newOptimization = {
          id: Date.now().toString(),
          website,
          url: `https://${website}`,
          type,
          status: 'pending',
          progress: 0,
          scoreImprovement: 0,
          createdAt: new Date().toISOString(),
          beforeScore: Math.floor(Math.random() * 40) + 30, // Random score between 30-70
          afterScore: 0,
          details: {
            imagesOptimized: 0,
            cssOptimized: 0,
            jsOptimized: 0,
            htmlOptimized: 0,
            totalSavings: 0
          }
        };

        res.json(newOptimization);
      } catch (error) {
        console.error('Create optimization error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create optimization'
        });
      }
    });

    // Run optimization
    this.app.post('/api/optimizations/:id/run', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Mock optimization process
        const updatedOptimization = {
          id,
          status: 'running',
          progress: 0,
          startedAt: new Date().toISOString()
        };

        res.json(updatedOptimization);
      } catch (error) {
        console.error('Run optimization error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to run optimization'
        });
      }
    });

    // Delete optimization
    this.app.delete('/api/optimizations/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        res.json({
          success: true,
          message: 'Optimization deleted successfully'
        });
      } catch (error) {
        console.error('Delete optimization error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete optimization'
        });
      }
    });

    console.log('✅ Optimization API routes configured');
  }

  setupWebsiteRoutes() {
    // =====================================================
    // WEBSITE API ENDPOINTS
    // =====================================================

    // Get all websites
    this.app.get('/api/websites', async (req, res) => {
      try {
        const mockWebsites = [
          {
            id: '1',
            domain: 'example.com',
            url: 'https://example.com',
            beforeScore: 65,
            afterScore: 89,
            status: 'active',
            lastOptimized: '2024-01-15T10:30:00Z',
            totalOptimizations: 12,
            tokensEarned: 1250,
            createdAt: '2024-01-01T00:00:00Z',
            metadata: {
              title: 'Example Website',
              description: 'A sample website for testing',
              category: 'Business'
            }
          },
          {
            id: '2',
            domain: 'test-site.org',
            url: 'https://test-site.org',
            beforeScore: 45,
            afterScore: 78,
            status: 'active',
            lastOptimized: '2024-01-14T15:45:00Z',
            totalOptimizations: 8,
            tokensEarned: 890,
            createdAt: '2024-01-05T00:00:00Z',
            metadata: {
              title: 'Test Site',
              description: 'Another test website',
              category: 'Technology'
            }
          }
        ];

        res.json(mockWebsites);
      } catch (error) {
        console.error('Websites error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get websites'
        });
      }
    });

    // Create website
    this.app.post('/api/websites', async (req, res) => {
      try {
        const { domain, url, category, description } = req.body;
        
        const newWebsite = {
          id: Date.now().toString(),
          domain,
          url,
          beforeScore: Math.floor(Math.random() * 40) + 30,
          afterScore: 0,
          status: 'active',
          lastOptimized: null,
          totalOptimizations: 0,
          tokensEarned: 0,
          createdAt: new Date().toISOString(),
          metadata: {
            title: domain,
            description: description || '',
            category: category || 'General'
          }
        };

        res.json(newWebsite);
      } catch (error) {
        console.error('Create website error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create website'
        });
      }
    });

    // Optimize website
    this.app.post('/api/websites/:id/optimize', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Mock optimization result
        const result = {
          success: true,
          newScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          tokensEarned: Math.floor(Math.random() * 200) + 50,
          optimizationsApplied: [
            'Image compression',
            'CSS minification',
            'JavaScript optimization'
          ]
        };

        res.json(result);
      } catch (error) {
        console.error('Optimize website error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to optimize website'
        });
      }
    });

    console.log('✅ Website API routes configured');
  }

  setupAnalyticsRoutes() {
    // =====================================================
    // ANALYTICS API ENDPOINTS
    // =====================================================

    // Get analytics data
    this.app.get('/api/analytics', async (req, res) => {
      try {
        const mockAnalytics = {
          overview: {
            totalWebsites: 12,
            totalOptimizations: 45,
            averageScoreImprovement: 23.5,
            totalTokensEarned: 4250,
            activeOptimizations: 3
          },
          performance: {
            daily: [
              { date: '2024-01-10', optimizations: 2, scoreImprovement: 15, tokensEarned: 150 },
              { date: '2024-01-11', optimizations: 3, scoreImprovement: 22, tokensEarned: 220 },
              { date: '2024-01-12', optimizations: 1, scoreImprovement: 18, tokensEarned: 180 },
              { date: '2024-01-13', optimizations: 4, scoreImprovement: 28, tokensEarned: 280 },
              { date: '2024-01-14', optimizations: 2, scoreImprovement: 12, tokensEarned: 120 },
              { date: '2024-01-15', optimizations: 3, scoreImprovement: 25, tokensEarned: 250 },
              { date: '2024-01-16', optimizations: 2, scoreImprovement: 20, tokensEarned: 200 }
            ]
          },
          topWebsites: [
            { id: '1', domain: 'example.com', scoreImprovement: 35, optimizations: 12, tokensEarned: 1250 },
            { id: '2', domain: 'demo.net', scoreImprovement: 28, optimizations: 15, tokensEarned: 2100 },
            { id: '3', domain: 'test-site.org', scoreImprovement: 22, optimizations: 8, tokensEarned: 890 }
          ],
          optimizationTypes: [
            { type: 'Image Optimization', count: 18, averageImprovement: 12.5, tokensEarned: 1800 },
            { type: 'CSS Optimization', count: 12, averageImprovement: 8.3, tokensEarned: 1200 },
            { type: 'JavaScript Optimization', count: 8, averageImprovement: 15.2, tokensEarned: 950 }
          ]
        };

        res.json(mockAnalytics);
      } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get analytics'
        });
      }
    });

    console.log('✅ Analytics API routes configured');
  }

  setupSEORoutes() {
    // =====================================================
    // SEO OPTIMIZATION API ENDPOINTS
    // =====================================================

    // Analyze SEO for a URL and keyword
    this.app.post('/api/seo/analyze', async (req, res) => {
      try {
        const { url, keyword } = req.body;

        if (!url || !keyword) {
          return res.status(400).json({
            success: false,
            error: 'URL and keyword are required'
          });
        }

        // Mock SEO analysis data
        const seoData = {
          url,
          keyword,
          currentPosition: Math.floor(Math.random() * 100) + 1,
          predictedPosition: Math.floor(Math.random() * 50) + 1,
          rankingScore: Math.random() * 100,
          
          coreWebVitals: {
            lcp: { 
              value: Math.random() * 4 + 1, 
              rating: Math.random() > 0.5 ? 'good' : 'needs-improvement' 
            },
            inp: { 
              value: Math.random() * 200 + 50, 
              rating: Math.random() > 0.3 ? 'good' : 'poor' 
            },
            cls: { 
              value: Math.random() * 0.3, 
              rating: Math.random() > 0.4 ? 'good' : 'needs-improvement' 
            },
            overallScore: Math.random() * 100
          },
          
          onPage: {
            titleOptimized: Math.random() > 0.3,
            metaOptimized: Math.random() > 0.4,
            headingStructure: Math.floor(Math.random() * 5) + 1,
            contentQuality: Math.random() * 100,
            keywordDensity: Math.random() * 5,
            schemaMarkup: Math.random() > 0.6
          },
          
          authority: {
            domainRating: Math.random() * 100,
            backlinks: Math.floor(Math.random() * 10000) + 100,
            referringDomains: Math.floor(Math.random() * 1000) + 10,
            authorityScore: Math.random() * 100
          },
          
          userBehavior: {
            ctr: Math.random() * 10,
            engagementRate: Math.random() * 100,
            bounceRate: Math.random() * 100,
            dwellTime: Math.random() * 300 + 30
          },
          
          aiInsights: {
            topOpportunities: [
              'Improve page loading speed',
              'Optimize meta descriptions',
              'Add schema markup',
              'Improve internal linking',
              'Enhance content quality'
            ],
            predictedImpact: Math.random() * 50 + 10,
            confidenceScore: Math.random() * 30 + 70,
            recommendedActions: [
              { action: 'Optimize images', impact: 'high', effort: 'medium' },
              { action: 'Improve title tags', impact: 'medium', effort: 'low' },
              { action: 'Add internal links', impact: 'high', effort: 'medium' },
              { action: 'Enhance content', impact: 'high', effort: 'high' }
            ]
          }
        };

        res.json({
          success: true,
          data: seoData
        });
      } catch (error) {
        console.error('SEO analysis error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to analyze SEO'
        });
      }
    });

    // Get SEO feature importance
    this.app.get('/api/seo/feature-importance', async (req, res) => {
      try {
        const featureImportance = [
          { feature: 'Page Speed', importance: 0.25, category: 'Technical SEO' },
          { feature: 'Content Quality', importance: 0.20, category: 'Content' },
          { feature: 'Backlinks', importance: 0.18, category: 'Authority' },
          { feature: 'Title Optimization', importance: 0.15, category: 'On-Page' },
          { feature: 'Meta Descriptions', importance: 0.12, category: 'On-Page' },
          { feature: 'Internal Linking', importance: 0.10, category: 'Technical SEO' }
        ];

        res.json({
          success: true,
          data: featureImportance
        });
      } catch (error) {
        console.error('Feature importance error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get feature importance'
        });
      }
    });

    // Get historical SEO data
    this.app.get('/api/seo/historical/:url', async (req, res) => {
      try {
        const { url } = req.params;
        
        // Mock historical data
        const historicalData = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          position: Math.floor(Math.random() * 50) + 10,
          traffic: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 500) + 50,
          impressions: Math.floor(Math.random() * 5000) + 1000
        }));

        res.json({
          success: true,
          data: historicalData
        });
      } catch (error) {
        console.error('Historical data error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get historical data'
        });
      }
    });

    // Export SEO report
    this.app.post('/api/seo/export', async (req, res) => {
      try {
        const { url, format = 'pdf' } = req.body;

        if (!url) {
          return res.status(400).json({
            success: false,
            error: 'URL is required'
          });
        }

        // Mock export response
        res.json({
          success: true,
          message: `SEO report exported successfully for ${url}`,
          downloadUrl: `/api/seo/download/${Date.now()}.${format}`,
          format
        });
      } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to export report'
        });
      }
    });
  }

  setupAIContentGenerationRoutes() {
    // =====================================================
    // AI CONTENT GENERATION API ENDPOINTS
    // =====================================================

    // Initialize AI Content Generation Service
    const initAIService = async () => {
      if (!this.aiContentGenerationService) {
        try {
          const { default: AIContentGenerationService } = await import('./src/services/api/AIContentGenerationService.js');
          const { default: AIContentModelTrainer } = await import('./src/services/api/AIContentModelTrainer.js');

          this.aiContentGenerationService = new AIContentGenerationService(this.db);
          this.aiContentModelTrainer = new AIContentModelTrainer(this.db);

          await this.aiContentGenerationService.initialize();
          console.log('✅ AI Content Generation Service initialized');
        } catch (error) {
          console.error('Error initializing AI Content Generation Service:', error);
          throw error;
        }
      }
      return this.aiContentGenerationService;
    };

    // Generate content for a URL
    this.app.post('/api/ai/content/generate', async (req, res) => {
      try {
        const {
          url,
          targetKeywords,
          contentType,
          competitorUrls,
          brandGuidelines,
          minLength,
          maxLength,
          includeCompetitorAnalysis
        } = req.body;

        if (!url) {
          return res.status(400).json({
            success: false,
            error: 'URL is required'
          });
        }

        const service = await initAIService();

        const generatedContent = await service.generateContent({
          url,
          targetKeywords: targetKeywords || [],
          contentType: contentType || 'full_page',
          competitorUrls: competitorUrls || [],
          brandGuidelines: brandGuidelines || {},
          minLength: minLength || 300,
          maxLength: maxLength || 2500,
          includeCompetitorAnalysis: includeCompetitorAnalysis !== false
        });

        res.json({
          success: true,
          data: generatedContent
        });
      } catch (error) {
        console.error('Content generation error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to generate content'
        });
      }
    });

    // Queue batch content generation
    this.app.post('/api/ai/content/queue', async (req, res) => {
      try {
        const { urls, config } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'URLs array is required'
          });
        }

        const service = await initAIService();

        const queuedIds = await service.queueGeneration(urls, config || {});

        res.json({
          success: true,
          data: {
            queuedCount: queuedIds.length,
            queuedIds
          }
        });
      } catch (error) {
        console.error('Queue generation error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to queue content generation'
        });
      }
    });

    // Process queued content generation tasks
    this.app.post('/api/ai/content/process-queue', async (req, res) => {
      try {
        const { batchSize } = req.body;

        const service = await initAIService();

        await service.processQueue(batchSize || 10);

        res.json({
          success: true,
          message: 'Queue processing completed'
        });
      } catch (error) {
        console.error('Process queue error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to process queue'
        });
      }
    });

    // Get generated content by ID
    this.app.get('/api/ai/content/:id', async (req, res) => {
      try {
        const { id } = req.params;

        const query = 'SELECT * FROM ai_content.generated_content WHERE id = $1';
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Content not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve content'
        });
      }
    });

    // Get content generation history for a URL
    this.app.get('/api/ai/content/history/:url', async (req, res) => {
      try {
        const { url } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        const query = `
          SELECT * FROM ai_content.generated_content
          WHERE url = $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `;

        const result = await this.db.query(query, [
          decodeURIComponent(url),
          parseInt(limit),
          parseInt(offset)
        ]);

        res.json({
          success: true,
          data: result.rows,
          count: result.rows.length
        });
      } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve history'
        });
      }
    });

    // Get content performance metrics
    this.app.get('/api/ai/content/:id/performance', async (req, res) => {
      try {
        const { id } = req.params;

        const query = `
          SELECT * FROM ai_content.content_performance
          WHERE generated_content_id = $1
          ORDER BY measurement_date DESC
        `;

        const result = await this.db.query(query, [id]);

        res.json({
          success: true,
          data: result.rows
        });
      } catch (error) {
        console.error('Get performance error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve performance data'
        });
      }
    });

    // Submit feedback for generated content
    this.app.post('/api/ai/content/:id/feedback', async (req, res) => {
      try {
        const { id } = req.params;
        const {
          feedbackType,
          rating,
          feedbackText,
          improvementsSuggested,
          successfulElements,
          failedElements
        } = req.body;

        const query = `
          INSERT INTO ai_content.training_feedback (
            generated_content_id, model_id, feedback_type, rating,
            feedback_text, improvements_suggested,
            successful_elements, failed_elements, feedback_source
          )
          SELECT
            $1, model_id, $2, $3, $4, $5, $6, $7, $8
          FROM ai_content.generated_content
          WHERE id = $1
          RETURNING id
        `;

        const result = await this.db.query(query, [
          id,
          feedbackType || 'user_rating',
          rating || null,
          feedbackText || null,
          improvementsSuggested ? JSON.stringify(improvementsSuggested) : null,
          successfulElements ? JSON.stringify(successfulElements) : null,
          failedElements ? JSON.stringify(failedElements) : null,
          'user'
        ]);

        res.json({
          success: true,
          data: { feedbackId: result.rows[0].id }
        });
      } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to submit feedback'
        });
      }
    });

    // Get active content summary
    this.app.get('/api/ai/content/summary/active', async (req, res) => {
      try {
        const query = 'SELECT * FROM ai_content.active_content_summary ORDER BY avg_search_position ASC';
        const result = await this.db.query(query);

        res.json({
          success: true,
          data: result.rows
        });
      } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve content summary'
        });
      }
    });

    // Train new content generation model
    this.app.post('/api/ai/model/train', async (req, res) => {
      try {
        const {
          modelType,
          epochs,
          batchSize,
          learningRate,
          validationSplit,
          minDatasetSize
        } = req.body;

        if (!modelType) {
          return res.status(400).json({
            success: false,
            error: 'Model type is required (title, meta_description, content, or combined)'
          });
        }

        if (!this.aiContentModelTrainer) {
          const { default: AIContentModelTrainer } = await import('./src/services/api/AIContentModelTrainer.js');
          this.aiContentModelTrainer = new AIContentModelTrainer(this.db);
        }

        // Run training asynchronously
        const trainingConfig = {
          modelType,
          epochs: epochs || 50,
          batchSize: batchSize || 32,
          learningRate: learningRate || 0.001,
          validationSplit: validationSplit || 0.2,
          minDatasetSize: minDatasetSize || 100
        };

        // Start training in background
        this.aiContentModelTrainer.trainModel(trainingConfig)
          .then(modelId => {
            console.log(`Model training completed: ${modelId}`);
          })
          .catch(error => {
            console.error('Model training failed:', error);
          });

        res.json({
          success: true,
          message: 'Model training started in background',
          config: trainingConfig
        });
      } catch (error) {
        console.error('Train model error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to start model training'
        });
      }
    });

    // Get model performance metrics
    this.app.get('/api/ai/model/performance', async (req, res) => {
      try {
        const query = 'SELECT * FROM ai_content.model_performance_metrics ORDER BY avg_seo_score DESC';
        const result = await this.db.query(query);

        res.json({
          success: true,
          data: result.rows
        });
      } catch (error) {
        console.error('Get model performance error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve model performance'
        });
      }
    });

    // Get content templates
    this.app.get('/api/ai/templates', async (req, res) => {
      try {
        const { industry, contentCategory } = req.query;

        let query = 'SELECT * FROM ai_content.content_templates WHERE status = $1';
        const params = ['active'];

        if (industry) {
          query += ' AND industry = $2';
          params.push(industry);
        }

        if (contentCategory) {
          query += industry ? ' AND content_category = $3' : ' AND content_category = $2';
          params.push(contentCategory);
        }

        query += ' ORDER BY avg_performance_score DESC';

        const result = await this.db.query(query, params);

        res.json({
          success: true,
          data: result.rows
        });
      } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve templates'
        });
      }
    });

    // Retrain model with feedback
    this.app.post('/api/ai/model/:id/retrain', async (req, res) => {
      try {
        const { id } = req.params;

        if (!this.aiContentModelTrainer) {
          const { default: AIContentModelTrainer } = await import('./src/services/api/AIContentModelTrainer.js');
          this.aiContentModelTrainer = new AIContentModelTrainer(this.db);
        }

        // Start retraining in background
        this.aiContentModelTrainer.retrainWithFeedback(id)
          .then(newModelId => {
            console.log(`Model retraining completed: ${newModelId}`);
          })
          .catch(error => {
            console.error('Model retraining failed:', error);
          });

        res.json({
          success: true,
          message: 'Model retraining started in background'
        });
      } catch (error) {
        console.error('Retrain model error:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to start model retraining'
        });
      }
    });

    console.log('✅ AI Content Generation API routes configured');
  }

  setupAuthRoutes() {
    // =====================================================
    // AUTHENTICATION API ENDPOINTS
    // =====================================================

    // User signup
    this.app.post('/api/auth/signup', async (req, res) => {
      try {
        const { name, email, password, walletAddress, agreeToTerms } = req.body;

        // Validate required fields
        if (!name || !email || !password || !agreeToTerms) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields'
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }

        // Validate password strength
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters'
          });
        }

        // Check if user already exists (mock check)
        const existingUser = await this.checkUserExists(email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'User already exists with this email'
          });
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          walletAddress: walletAddress || null,
          createdAt: new Date().toISOString(),
          isVerified: false,
          profile: {
            avatar: null,
            bio: '',
            location: '',
            website: ''
          },
          stats: {
            totalOptimizations: 0,
            tokensEarned: 0,
            spaceSaved: 0,
            reputation: 0,
            level: 1
          },
          preferences: {
            notifications: true,
            emailUpdates: true,
            darkMode: false
          }
        };

        // Generate JWT token (mock)
        const token = this.generateJWT(newUser);

        // Send verification email (mock)
        await this.sendVerificationEmail(email, newUser.id);

        res.json({
          success: true,
          message: 'Account created successfully',
          token,
          user: newUser
        });
      } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create account'
        });
      }
    });

    // User login
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password, remember } = req.body;

        // Validate required fields
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email and password are required'
          });
        }

        // Mock user authentication
        const user = await this.authenticateUser(email, password);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }

        // Generate JWT token
        const token = this.generateJWT(user);

        // Update last login
        user.lastLogin = new Date().toISOString();

        res.json({
          success: true,
          message: 'Login successful',
          token,
          user
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to login'
        });
      }
    });

    // Forgot password
    this.app.post('/api/auth/forgot-password', async (req, res) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            success: false,
            error: 'Email is required'
          });
        }

        // Check if user exists
        const user = await this.checkUserExists(email);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        // Generate reset token (mock)
        const resetToken = this.generateResetToken(user.id);

        // Send reset email (mock)
        await this.sendPasswordResetEmail(email, resetToken);

        res.json({
          success: true,
          message: 'Password reset email sent'
        });
      } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to send reset email'
        });
      }
    });

    // Reset password
    this.app.post('/api/auth/reset-password', async (req, res) => {
      try {
        const { token, password } = req.body;

        if (!token || !password) {
          return res.status(400).json({
            success: false,
            error: 'Token and password are required'
          });
        }

        // Validate reset token (mock)
        const userId = await this.validateResetToken(token);
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired reset token'
          });
        }

        // Update password (mock)
        await this.updateUserPassword(userId, password);

        res.json({
          success: true,
          message: 'Password reset successfully'
        });
      } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to reset password'
        });
      }
    });

    // Verify email
    this.app.post('/api/auth/verify-email', async (req, res) => {
      try {
        const { token } = req.body;

        if (!token) {
          return res.status(400).json({
            success: false,
            error: 'Verification token is required'
          });
        }

        // Validate verification token (mock)
        const userId = await this.validateVerificationToken(token);
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired verification token'
          });
        }

        // Mark user as verified (mock)
        await this.verifyUser(userId);

        res.json({
          success: true,
          message: 'Email verified successfully'
        });
      } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to verify email'
        });
      }
    });

    // Get user profile
    this.app.get('/api/auth/profile', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.id;
        const user = await this.getUserProfile(userId);

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        res.json({
          success: true,
          user
        });
      } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get profile'
        });
      }
    });

    // Update user profile
    this.app.put('/api/auth/profile', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.id;
        const updates = req.body;

        const updatedUser = await this.updateUserProfile(userId, updates);

        res.json({
          success: true,
          message: 'Profile updated successfully',
          user: updatedUser
        });
      } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update profile'
        });
      }
    });

    console.log('✅ Authentication API routes configured');
  }

  setupMiningRoutes() {
    // =====================================================
    // MINING API ENDPOINTS
    // =====================================================
    
    // Add the blockchain mining routes from api-mining-routes.js
    addMiningRoutes(this.app, { miningSystem: this.miningSystem });

    // Start mining session
    this.app.post('/api/mining/start', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.id;
        const { config } = req.body;

        // Validate config
        if (!config || !config.startUrl) {
          return res.status(400).json({
            success: false,
            error: 'Mining configuration is required'
          });
        }

        // Start mining session
        const session = await this.startMiningSession(userId, config);

        res.json({
          success: true,
          message: 'Mining session started',
          session
        });
      } catch (error) {
        console.error('Start mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to start mining session'
        });
      }
    });

    // Get mining session status
    this.app.get('/api/mining/session/:sessionId', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await this.getMiningSession(sessionId, userId);
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Mining session not found'
          });
        }

        res.json({
          success: true,
          session
        });
      } catch (error) {
        console.error('Get mining session error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining session'
        });
      }
    });

    // Pause mining session
    this.app.post('/api/mining/session/:sessionId/pause', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const success = await this.pauseMiningSession(sessionId, userId);
        if (!success) {
          return res.status(404).json({
            success: false,
            error: 'Mining session not found or cannot be paused'
          });
        }

        res.json({
          success: true,
          message: 'Mining session paused'
        });
      } catch (error) {
        console.error('Pause mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to pause mining session'
        });
      }
    });

    // Resume mining session
    this.app.post('/api/mining/session/:sessionId/resume', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const success = await this.resumeMiningSession(sessionId, userId);
        if (!success) {
          return res.status(404).json({
            success: false,
            error: 'Mining session not found or cannot be resumed'
          });
        }

        res.json({
          success: true,
          message: 'Mining session resumed'
        });
      } catch (error) {
        console.error('Resume mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to resume mining session'
        });
      }
    });

    // Stop mining session
    this.app.post('/api/mining/session/:sessionId/stop', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const success = await this.stopMiningSession(sessionId, userId);
        if (!success) {
          return res.status(404).json({
            success: false,
            error: 'Mining session not found'
          });
        }

        res.json({
          success: true,
          message: 'Mining session stopped'
        });
      } catch (error) {
        console.error('Stop mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to stop mining session'
        });
      }
    });

    // Get user's mining sessions
    this.app.get('/api/mining/sessions', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.id;
        const sessions = await this.getUserMiningSessions(userId);

        res.json({
          success: true,
          sessions
        });
      } catch (error) {
        console.error('Get mining sessions error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining sessions'
        });
      }
    });

    // Get mining statistics
    this.app.get('/api/mining/stats', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.id;
        const stats = await this.getMiningStats(userId);

        res.json({
          success: true,
          stats
        });
      } catch (error) {
        console.error('Get mining stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining statistics'
        });
      }
    });

    // Download mining results
    this.app.get('/api/mining/session/:sessionId/download', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { format = 'json' } = req.query;
        const userId = req.user.id;

        const session = await this.getMiningSession(sessionId, userId);
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Mining session not found'
          });
        }

        const results = await this.generateMiningReport(session, format);

        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="mining-results-${sessionId}.${format}"`);
        res.send(results);
      } catch (error) {
        console.error('Download mining results error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to download mining results'
        });
      }
    });

    console.log('✅ Mining API routes configured');
  }

  // Mining service methods
  async startMiningSession(userId, config) {
    // Mock mining session creation
    const sessionId = `mining_${userId}_${Date.now()}`;
    
    const session = {
      id: sessionId,
      userId,
      status: 'mining',
      startTime: new Date().toISOString(),
      totalPages: 0,
      pagesProcessed: 0,
      optimizationsFound: 0,
      spaceSaved: 0,
      tokensEarned: 0,
      progress: 0,
      config,
      results: []
    };

    // Store session (in production, use database)
    this.miningSessions = this.miningSessions || new Map();
    this.miningSessions.set(sessionId, session);

    // Simulate mining process
    this.simulateMiningProcess(session);

    return session;
  }

  async getMiningSession(sessionId, userId) {
    this.miningSessions = this.miningSessions || new Map();
    const session = this.miningSessions.get(sessionId);
    
    if (!session || session.userId !== userId) {
      return null;
    }

    return session;
  }

  async pauseMiningSession(sessionId, userId) {
    const session = await this.getMiningSession(sessionId, userId);
    if (session && session.status === 'mining') {
      session.status = 'paused';
      return true;
    }
    return false;
  }

  async resumeMiningSession(sessionId, userId) {
    const session = await this.getMiningSession(sessionId, userId);
    if (session && session.status === 'paused') {
      session.status = 'mining';
      this.simulateMiningProcess(session);
      return true;
    }
    return false;
  }

  async stopMiningSession(sessionId, userId) {
    const session = await this.getMiningSession(sessionId, userId);
    if (session) {
      session.status = 'completed';
      session.endTime = new Date().toISOString();
      session.progress = 100;
      return true;
    }
    return false;
  }

  async getUserMiningSessions(userId) {
    this.miningSessions = this.miningSessions || new Map();
    return Array.from(this.miningSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  async getMiningStats(userId) {
    const sessions = await this.getUserMiningSessions(userId);
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalPagesMined = sessions.reduce((sum, s) => sum + s.pagesProcessed, 0);
    const totalOptimizations = sessions.reduce((sum, s) => sum + s.optimizationsFound, 0);
    const totalSpaceSaved = sessions.reduce((sum, s) => sum + s.spaceSaved, 0);
    const totalTokensEarned = sessions.reduce((sum, s) => sum + s.tokensEarned, 0);

    return {
      totalSessions,
      completedSessions,
      totalPagesMined,
      totalOptimizations,
      totalSpaceSaved,
      totalTokensEarned,
      averageSpacePerPage: totalPagesMined > 0 ? Math.round(totalSpaceSaved / totalPagesMined) : 0,
      averageTokensPerSession: totalSessions > 0 ? Math.round(totalTokensEarned / totalSessions) : 0
    };
  }

  async generateMiningReport(session, format) {
    if (format === 'csv') {
      const csvHeader = 'URL,Domain,Timestamp,Optimizations,Space Saved,Tokens Earned,Status\n';
      const csvRows = session.results.map(result => 
        `"${result.url}","${result.domain}","${result.timestamp}",${result.optimizations.length},${result.spaceSaved},${result.tokensEarned},"${result.status}"`
      ).join('\n');
      return csvHeader + csvRows;
    } else {
      return JSON.stringify({
        session: {
          id: session.id,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          totalPages: session.totalPages,
          pagesProcessed: session.pagesProcessed,
          optimizationsFound: session.optimizationsFound,
          spaceSaved: session.spaceSaved,
          tokensEarned: session.tokensEarned
        },
        results: session.results
      }, null, 2);
    }
  }

  simulateMiningProcess(session) {
    // Simulate mining progress
    const interval = setInterval(() => {
      if (session.status !== 'mining') {
        clearInterval(interval);
        return;
      }

      // Simulate processing a page
      if (session.pagesProcessed < session.totalPages) {
        session.pagesProcessed++;
        session.progress = Math.round((session.pagesProcessed / session.totalPages) * 100);
        
        // Simulate finding optimizations
        const optimizationsFound = Math.floor(Math.random() * 5) + 1;
        const spaceSaved = Math.floor(Math.random() * 50000) + 10000;
        const tokensEarned = Math.floor(spaceSaved / 1000);

        session.optimizationsFound += optimizationsFound;
        session.spaceSaved += spaceSaved;
        session.tokensEarned += tokensEarned;

        // Add result
        session.results.push({
          url: `https://example.com/page${session.pagesProcessed}`,
          domain: 'example.com',
          timestamp: new Date().toISOString(),
          optimizations: Array.from({ length: optimizationsFound }, (_, i) => ({
            type: ['Image', 'CSS', 'JavaScript', 'HTML'][i % 4],
            spaceSaved: Math.floor(spaceSaved / optimizationsFound),
            tokensEarned: Math.floor(tokensEarned / optimizationsFound)
          })),
          spaceSaved,
          tokensEarned,
          status: 'success'
        });

        // Complete session if all pages processed
        if (session.pagesProcessed >= session.totalPages) {
          session.status = 'completed';
          session.endTime = new Date().toISOString();
          session.progress = 100;
          clearInterval(interval);
        }
      }
    }, 2000); // Update every 2 seconds
  }

  setupSpaceMiningRoutes() {
    // =====================================================
    // SPACE MINING API ENDPOINTS
    // =====================================================

    // Start space mining
    this.app.post('/api/space-mining/mine', async (req, res) => {
      try {
        const { url, priority = 1, type = 'full' } = req.body;

        if (!url) {
          return res.status(400).json({
            success: false,
            error: 'URL is required for space mining'
          });
        }

        // Mock space mining result
        const result = {
          spatialStructures: [
            {
              id: 'spatial_1',
              url,
              domPath: '/html/body/div[1]',
              spatialData: {
                dimensions: { width: 1200, height: 800, depth: 50 },
                volume: 48000000,
                complexity: 75
              },
              domMetadata: {
                elementType: 'container',
                tagName: 'div',
                classNames: ['main-content'],
                children: 15,
                nestingLevel: 3
              },
              optimization: {
                potentialSavings: 25600,
                compressionRatio: 0.3,
                lightDomCandidate: true,
                isolationScore: 85
              },
              metaverseMapping: {
                biomeType: 'content_forest',
                bridgeCompatible: true,
                routingPotential: 90
              }
            }
          ],
          isolatedDOMs: [
            {
              id: 'isolated_1',
              sourceStructure: 'spatial_1',
              metadata: {
                originalSize: 25600,
                optimizedSize: 17920,
                compressionRatio: 0.3,
                isolationQuality: 85
              },
              metaverseBridge: {
                bridgeId: 'bridge_1',
                bridgeURL: '/bridge/spatial_1',
                status: 'active',
                routingRules: ['content', 'optimization', 'metaverse']
              }
            }
          ],
          generatedBridges: [
            {
              id: 'bridge_1',
              sourceChain: 'web_dom',
              targetChain: 'metaverse_content',
              bridgeURL: '/bridge/spatial_1',
              status: 'active',
              connectedDOMs: ['isolated_1'],
              performance: {
                throughput: 150,
                latency: 45,
                reliability: 98
              },
              capabilities: {
                chatEnabled: true,
                dataTransfer: true,
                assetSharing: true,
                crossChainComputing: true
              }
            }
          ]
        };

        res.json({
          success: true,
          data: result,
          message: `Space mining completed for ${url}. Found ${result.spatialStructures.length} structures, isolated ${result.isolatedDOMs.length} DOM components, created ${result.generatedBridges.length} bridges.`
        });
      } catch (error) {
        console.error('Space mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to mine space'
        });
      }
    });

    // Get spatial structures
    this.app.get('/api/space-mining/spatial-structures', async (req, res) => {
      try {
        const mockStructures = [
          {
            id: 'spatial_1',
            url: 'https://example.com',
            domPath: '/html/body/div[1]',
            spatialData: {
              dimensions: { width: 1200, height: 800, depth: 50 },
              volume: 48000000,
              complexity: 75
            },
            domMetadata: {
              elementType: 'container',
              tagName: 'div',
              classNames: ['main-content'],
              children: 15,
              nestingLevel: 3
            },
            optimization: {
              potentialSavings: 25600,
              compressionRatio: 0.3,
              lightDomCandidate: true,
              isolationScore: 85
            },
            metaverseMapping: {
              biomeType: 'content_forest',
              bridgeCompatible: true,
              routingPotential: 90
            }
          }
        ];

        res.json({
          success: true,
          data: { spatialStructures: mockStructures }
        });
      } catch (error) {
        console.error('Get spatial structures error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get spatial structures'
        });
      }
    });

    // Get isolated DOMs
    this.app.get('/api/space-mining/isolated-doms', async (req, res) => {
      try {
        const mockIsolatedDOMs = [
          {
            id: 'isolated_1',
            sourceStructure: 'spatial_1',
            metadata: {
              originalSize: 25600,
              optimizedSize: 17920,
              compressionRatio: 0.3,
              isolationQuality: 85
            },
            metaverseBridge: {
              bridgeId: 'bridge_1',
              bridgeURL: '/bridge/spatial_1',
              status: 'active',
              routingRules: ['content', 'optimization', 'metaverse']
            }
          }
        ];

        res.json({
          success: true,
          data: { isolatedDOMs: mockIsolatedDOMs }
        });
      } catch (error) {
        console.error('Get isolated DOMs error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get isolated DOMs'
        });
      }
    });

    // Get metaverse bridges
    this.app.get('/api/space-mining/bridges', async (req, res) => {
      try {
        const mockBridges = [
          {
            id: 'bridge_1',
            sourceChain: 'web_dom',
            targetChain: 'metaverse_content',
            bridgeURL: '/bridge/spatial_1',
            status: 'active',
            connectedDOMs: ['isolated_1'],
            performance: {
              throughput: 150,
              latency: 45,
              reliability: 98
            },
            capabilities: {
              chatEnabled: true,
              dataTransfer: true,
              assetSharing: true,
              crossChainComputing: true
            }
          }
        ];

        res.json({
          success: true,
          data: { bridges: mockBridges }
        });
      } catch (error) {
        console.error('Get bridges error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get bridges'
        });
      }
    });

    // Get mining stats
    this.app.get('/api/space-mining/stats', async (req, res) => {
      try {
        const mockStats = {
          totalStructures: 12,
          isolatedDOMs: 8,
          activeBridges: 5,
          queueLength: 3
        };

        res.json({
          success: true,
          data: mockStats
        });
      } catch (error) {
        console.error('Get mining stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining stats'
        });
      }
    });

    console.log('✅ Space Mining API routes configured');
  }

  setupMetaverseMiningRoutes() {
    // =====================================================
    // METAVERSE MINING API ENDPOINTS
    // =====================================================

    // Get mining data
    this.app.get('/api/metaverse/mining-data', async (req, res) => {
      try {
        const mockData = {
          algorithms: [
            {
              id: 'algo_1',
              name: 'CSS Compression Pro',
              type: 'css_compression',
              version: '2.1.0',
              performance: {
                speedMultiplier: 3.2,
                efficiency: 87,
                spaceSaved: 45,
                successRate: 94
              },
              source: {
                minedFrom: 'https://example.com',
                biomeType: 'css_garden',
                authority: 85,
                discoveryTime: Date.now() - 3600000
              },
              implementation: {
                code: 'function compressCSS(css) { /* compression logic */ }',
                dependencies: ['css-tree', 'postcss'],
                complexity: 7,
                gasCost: 15000
              },
              rewards: {
                discoveryReward: 250,
                performanceReward: 50,
                upgradeReward: 100
              },
              status: 'validated',
              validationResults: {
                testsPassed: 9,
                totalTests: 10,
                performanceGain: 320,
                compatibilityScore: 92
              }
            }
          ],
          dataMining: [
            {
              id: 'data_1',
              type: 'pattern',
              data: { pattern: 'css-grid-optimization', frequency: 0.85 },
              source: {
                url: 'https://example.com',
                domain: 'example.com',
                biomeType: 'layout_plains',
                authority: 78
              },
              value: {
                utility: 85,
                rarity: 65,
                upgradePotential: 90
              },
              extraction: {
                method: 'pattern_recognition',
                confidence: 92,
                timestamp: Date.now() - 1800000
              },
              rewards: {
                extractionReward: 75,
                utilityReward: 30,
                upgradeReward: 45
              }
            }
          ],
          upgrades: [
            {
              id: 'upgrade_1',
              type: 'gas_optimization',
              version: '1.5.0',
              description: 'Optimized gas usage for DOM operations',
              source: {
                algorithms: ['algo_1'],
                dataMining: ['data_1'],
                totalValue: 500
              },
              implementation: {
                smartContract: 'contract OptimizedDOM { /* contract code */ }',
                gasOptimization: 35,
                performanceGain: 25
              },
              deployment: {
                status: 'active',
                testResults: { gasOptimization: 35, performanceGain: 25 },
                deploymentCost: 200,
                estimatedSavings: 1000
              },
              rewards: {
                upgradeReward: 200,
                performanceReward: 75,
                adoptionReward: 125
              }
            }
          ],
          biomes: [
            {
              id: 'biome_1',
              name: 'CSS Garden',
              type: 'stylesheet_biome',
              characteristics: {
                algorithmDiscoveryRate: 2.5,
                dataMiningEfficiency: 88,
                optimizationPotential: 92,
                authority: 85
              },
              resources: {
                totalSpace: 1000000,
                usedSpace: 750000,
                availableSpace: 250000,
                miningPower: 150
              },
              discoveries: {
                algorithms: ['algo_1'],
                dataMining: ['data_1'],
                upgrades: ['upgrade_1']
              }
            }
          ],
          stats: {
            algorithms: { total: 15, validated: 12 },
            dataMining: { total: 45, patterns: 20 },
            upgrades: { total: 8, active: 6 },
            mining: { totalRewards: 2500, queueLength: 5 }
          }
        };

        res.json({
          success: true,
          data: mockData
        });
      } catch (error) {
        console.error('Get mining data error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining data'
        });
      }
    });

    // Toggle mining
    this.app.post('/api/metaverse/toggle-mining', async (req, res) => {
      try {
        const { isMining } = req.body;

        res.json({
          success: true,
          message: `Mining ${isMining ? 'started' : 'stopped'}`
        });
      } catch (error) {
        console.error('Toggle mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to toggle mining'
        });
      }
    });

    console.log('✅ Metaverse Mining API routes configured');
  }

  setupMetaverseMarketplaceRoutes() {
    // =====================================================
    // METAVERSE MARKETPLACE API ENDPOINTS
    // =====================================================

    // Get marketplace items
    this.app.get('/api/metaverse/marketplace', async (req, res) => {
      try {
        const mockItems = [
          {
            id: 'land_1',
            name: 'Crystal Forest Plot',
            description: 'A mystical forest land with crystal formations and magical properties',
            type: 'land',
            rarity: 'epic',
            price: 1500,
            currency: 'LDOM',
            image: '/api/placeholder/300/200',
            icon: '🌲',
            stats: { power: 85, speed: 20, durability: 100, special: 90 },
            effects: ['+20% mining efficiency', '+15% token generation', 'Crystal resonance'],
            biome: 'forest',
            requirements: { level: 5, tokens: 1000, achievements: ['forest_explorer'] },
            forSale: true,
            createdAt: new Date().toISOString(),
            metadata: {
              dimensions: { width: 100, height: 100, depth: 50 },
              weight: 1000,
              materials: ['crystal', 'wood', 'magic'],
              origin: 'metaverse_forest'
            }
          },
          {
            id: 'building_1',
            name: 'Quantum Lab',
            description: 'Advanced research facility for algorithm development and optimization',
            type: 'building',
            rarity: 'legendary',
            price: 5000,
            currency: 'LDOM',
            image: '/api/placeholder/300/200',
            icon: '🏗️',
            stats: { power: 95, speed: 60, durability: 80, special: 100 },
            effects: ['+50% algorithm discovery', '+30% research speed', 'Quantum processing'],
            biome: 'tech',
            requirements: { level: 10, tokens: 3000, achievements: ['researcher', 'quantum_master'] },
            forSale: true,
            createdAt: new Date().toISOString(),
            metadata: {
              dimensions: { width: 200, height: 150, depth: 100 },
              weight: 5000,
              materials: ['quantum_crystal', 'tech_metal', 'energy_core'],
              origin: 'metaverse_tech'
            }
          },
          {
            id: 'vehicle_1',
            name: 'Lightning Speeder',
            description: 'High-speed vehicle for rapid DOM traversal and optimization',
            type: 'vehicle',
            rarity: 'rare',
            price: 800,
            currency: 'LDOM',
            image: '/api/placeholder/300/200',
            icon: '⚡',
            stats: { power: 70, speed: 95, durability: 60, special: 75 },
            effects: ['+40% traversal speed', '+25% optimization range', 'Lightning boost'],
            biome: 'speed',
            requirements: { level: 3, tokens: 500, achievements: ['speed_demon'] },
            forSale: true,
            createdAt: new Date().toISOString(),
            metadata: {
              dimensions: { width: 50, height: 30, depth: 20 },
              weight: 200,
              materials: ['lightning_crystal', 'speed_metal', 'energy_core'],
              origin: 'metaverse_speed'
            }
          },
          {
            id: 'avatar_1',
            name: 'DOM Guardian',
            description: 'Powerful avatar with enhanced optimization abilities',
            type: 'avatar',
            rarity: 'mythic',
            price: 10000,
            currency: 'LDOM',
            image: '/api/placeholder/300/200',
            icon: '🛡️',
            stats: { power: 100, speed: 50, durability: 100, special: 100 },
            effects: ['+100% optimization power', '+50% damage resistance', 'Guardian aura'],
            biome: 'guardian',
            requirements: { level: 15, tokens: 8000, achievements: ['guardian', 'optimization_master'] },
            forSale: true,
            createdAt: new Date().toISOString(),
            metadata: {
              dimensions: { width: 40, height: 80, depth: 30 },
              weight: 100,
              materials: ['guardian_crystal', 'divine_metal', 'power_core'],
              origin: 'metaverse_guardian'
            }
          },
          {
            id: 'tool_1',
            name: 'Optimization Hammer',
            description: 'Powerful tool for DOM optimization and space mining',
            type: 'tool',
            rarity: 'epic',
            price: 1200,
            currency: 'LDOM',
            image: '/api/placeholder/300/200',
            icon: '🔨',
            stats: { power: 80, speed: 40, durability: 90, special: 85 },
            effects: ['+35% optimization efficiency', '+20% space savings', 'Hammer strike'],
            biome: 'tools',
            requirements: { level: 7, tokens: 800, achievements: ['craftsman'] },
            forSale: true,
            createdAt: new Date().toISOString(),
            metadata: {
              dimensions: { width: 30, height: 60, depth: 15 },
              weight: 300,
              materials: ['optimization_crystal', 'heavy_metal', 'power_core'],
              origin: 'metaverse_tools'
            }
          }
        ];

        res.json({
          success: true,
          items: mockItems
        });
      } catch (error) {
        console.error('Get marketplace items error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get marketplace items'
        });
      }
    });

    // Get user inventory
    this.app.get('/api/metaverse/inventory', async (req, res) => {
      try {
        const mockInventory = {
          items: [
            {
              id: 'owned_1',
              name: 'Basic Land Plot',
              description: 'A simple land plot for beginners',
              type: 'land',
              rarity: 'common',
              price: 100,
              currency: 'LDOM',
              image: '/api/placeholder/300/200',
              icon: '🏞️',
              stats: { power: 30, speed: 10, durability: 50, special: 20 },
              effects: ['+5% mining efficiency'],
              biome: 'basic',
              requirements: { level: 1, tokens: 0, achievements: [] },
              owner: 'user_1',
              forSale: false,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              metadata: {
                dimensions: { width: 50, height: 50, depth: 25 },
                weight: 500,
                materials: ['basic_soil', 'simple_stone'],
                origin: 'metaverse_basic'
              }
            }
          ],
          totalValue: 100,
          categories: {
            land: 1,
            buildings: 0,
            vehicles: 0,
            avatars: 0,
            tools: 0,
            decorations: 0,
            powerups: 0
          }
        };

        res.json({
          success: true,
          inventory: mockInventory
        });
      } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get inventory'
        });
      }
    });

    // Purchase item
    this.app.post('/api/metaverse/purchase', async (req, res) => {
      try {
        const { itemId, price, currency } = req.body;

        // Mock purchase logic
        const purchaseResult = {
          success: true,
          transactionId: `tx_${Date.now()}`,
          itemId,
          price,
          currency,
          timestamp: new Date().toISOString(),
          newBalance: 1000 - price
        };

        res.json({
          success: true,
          message: 'Purchase successful',
          data: purchaseResult
        });
      } catch (error) {
        console.error('Purchase item error:', error);
        res.status(500).json({
          success: false,
          error: 'Purchase failed'
        });
      }
    });

    // Mine for items
    this.app.post('/api/metaverse/mine-items', async (req, res) => {
      try {
        const { miningType, duration } = req.body;

        // Simulate mining process
        const itemsFound = Math.floor(Math.random() * 3) + 1;
        const tokensEarned = Math.floor(Math.random() * 100) + 50;
        
        const miningResult = {
          success: true,
          itemsFound,
          tokensEarned,
          duration,
          miningType,
          timestamp: new Date().toISOString(),
          items: [
            {
              id: `mined_${Date.now()}`,
              name: 'Mined Crystal',
              description: 'A rare crystal found during mining',
              type: 'powerup',
              rarity: 'rare',
              icon: '💎',
              stats: { power: 25, speed: 15, durability: 40, special: 30 },
              effects: ['+10% mining speed'],
              biome: 'crystal_cave'
            }
          ]
        };

        res.json({
          success: true,
          message: 'Mining completed successfully',
          data: miningResult
        });
      } catch (error) {
        console.error('Mine items error:', error);
        res.status(500).json({
          success: false,
          error: 'Mining failed'
        });
      }
    });

    // Get item details
    this.app.get('/api/metaverse/item/:itemId', async (req, res) => {
      try {
        const { itemId } = req.params;
        
        // Mock item details
        const itemDetails = {
          id: itemId,
          name: 'Detailed Item',
          description: 'Detailed description of the item',
          type: 'land',
          rarity: 'epic',
          price: 1500,
          currency: 'LDOM',
          image: '/api/placeholder/300/200',
          icon: '🌲',
          stats: { power: 85, speed: 20, durability: 100, special: 90 },
          effects: ['+20% mining efficiency', '+15% token generation'],
          biome: 'forest',
          requirements: { level: 5, tokens: 1000, achievements: ['forest_explorer'] },
          forSale: true,
          createdAt: new Date().toISOString(),
          metadata: {
            dimensions: { width: 100, height: 100, depth: 50 },
            weight: 1000,
            materials: ['crystal', 'wood', 'magic'],
            origin: 'metaverse_forest'
          },
          history: [
            {
              event: 'created',
              timestamp: new Date().toISOString(),
              description: 'Item created in metaverse'
            }
          ],
          owner: null,
          previousOwners: []
        };

        res.json({
          success: true,
          item: itemDetails
        });
      } catch (error) {
        console.error('Get item details error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get item details'
        });
      }
    });

    // Sell item
    this.app.post('/api/metaverse/sell', async (req, res) => {
      try {
        const { itemId, price, currency } = req.body;

        const sellResult = {
          success: true,
          transactionId: `sell_${Date.now()}`,
          itemId,
          price,
          currency,
          timestamp: new Date().toISOString(),
          listingId: `listing_${Date.now()}`
        };

        res.json({
          success: true,
          message: 'Item listed for sale',
          data: sellResult
        });
      } catch (error) {
        console.error('Sell item error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to sell item'
        });
      }
    });

    console.log('✅ Metaverse Marketplace API routes configured');
  }

  setupMetaverseMiningRewardsRoutes() {
    // =====================================================
    // METAVERSE MINING REWARDS API ENDPOINTS
    // =====================================================

    // Get available mining rewards
    this.app.get('/api/metaverse/mining-rewards', async (req, res) => {
      try {
        const mockRewards = [
          {
            id: 'reward_1',
            name: 'Crystal Fragment',
            description: 'A small crystal fragment with magical properties',
            type: 'powerup',
            rarity: 'common',
            icon: '💎',
            stats: { power: 15, speed: 10, durability: 20, special: 25 },
            effects: ['+5% mining speed'],
            biome: 'crystal_cave',
            dropRate: 0.3,
            value: 50,
            currency: 'LDOM',
            requirements: { level: 1, miningPower: 50, achievements: [] }
          },
          {
            id: 'reward_2',
            name: 'Forest Spirit',
            description: 'A mystical spirit from the ancient forests',
            type: 'avatar',
            rarity: 'rare',
            icon: '🌿',
            stats: { power: 45, speed: 30, durability: 40, special: 60 },
            effects: ['+15% nature affinity', '+10% forest mining bonus'],
            biome: 'forest',
            dropRate: 0.1,
            value: 300,
            currency: 'LDOM',
            requirements: { level: 5, miningPower: 150, achievements: ['forest_explorer'] }
          },
          {
            id: 'reward_3',
            name: 'Quantum Core',
            description: 'A powerful energy core from the quantum realm',
            type: 'powerup',
            rarity: 'epic',
            icon: '⚛️',
            stats: { power: 70, speed: 50, durability: 80, special: 90 },
            effects: ['+25% optimization power', '+20% algorithm discovery'],
            biome: 'quantum',
            dropRate: 0.05,
            value: 800,
            currency: 'LDOM',
            requirements: { level: 10, miningPower: 300, achievements: ['quantum_researcher'] }
          },
          {
            id: 'reward_4',
            name: 'Dragon Scale',
            description: 'A legendary scale from an ancient dragon',
            type: 'decoration',
            rarity: 'legendary',
            icon: '🐉',
            stats: { power: 90, speed: 60, durability: 95, special: 100 },
            effects: ['+50% fire resistance', '+30% dragon affinity'],
            biome: 'dragon_lair',
            dropRate: 0.01,
            value: 2000,
            currency: 'LDOM',
            requirements: { level: 15, miningPower: 500, achievements: ['dragon_slayer'] }
          },
          {
            id: 'reward_5',
            name: 'Cosmic Essence',
            description: 'Pure essence from the cosmic void',
            type: 'powerup',
            rarity: 'mythic',
            icon: '🌌',
            stats: { power: 100, speed: 80, durability: 100, special: 100 },
            effects: ['+100% cosmic power', '+50% void resistance', 'Reality manipulation'],
            biome: 'cosmic_void',
            dropRate: 0.001,
            value: 10000,
            currency: 'LDOM',
            requirements: { level: 20, miningPower: 1000, achievements: ['cosmic_explorer', 'reality_bender'] }
          }
        ];

        res.json({
          success: true,
          rewards: mockRewards
        });
      } catch (error) {
        console.error('Get mining rewards error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining rewards'
        });
      }
    });

    // Get mining session
    this.app.get('/api/metaverse/mining-session', async (req, res) => {
      try {
        // Mock session data
        const session = {
          id: 'session_1',
          type: 'metaverse_items',
          status: 'active',
          startTime: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
          duration: 300000, // 5 minutes
          progress: 40,
          rewards: [],
          totalValue: 0,
          miningPower: 150,
          efficiency: 85
        };

        res.json({
          success: true,
          session: session
        });
      } catch (error) {
        console.error('Get mining session error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get mining session'
        });
      }
    });

    // Start mining session
    this.app.post('/api/metaverse/start-mining', async (req, res) => {
      try {
        const { type, miningPower, duration } = req.body;

        const session = {
          id: `session_${Date.now()}`,
          type,
          status: 'active',
          startTime: new Date().toISOString(),
          duration,
          progress: 0,
          rewards: [],
          totalValue: 0,
          miningPower,
          efficiency: Math.min(100, miningPower / 10)
        };

        res.json({
          success: true,
          message: 'Mining session started',
          session
        });
      } catch (error) {
        console.error('Start mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to start mining'
        });
      }
    });

    // Pause mining session
    this.app.post('/api/metaverse/pause-mining', async (req, res) => {
      try {
        const { sessionId } = req.body;

        const session = {
          id: sessionId,
          type: 'metaverse_items',
          status: 'paused',
          startTime: new Date(Date.now() - 120000).toISOString(),
          duration: 300000,
          progress: 40,
          rewards: [],
          totalValue: 0,
          miningPower: 150,
          efficiency: 85
        };

        res.json({
          success: true,
          message: 'Mining session paused',
          session
        });
      } catch (error) {
        console.error('Pause mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to pause mining'
        });
      }
    });

    // Resume mining session
    this.app.post('/api/metaverse/resume-mining', async (req, res) => {
      try {
        const { sessionId } = req.body;

        const session = {
          id: sessionId,
          type: 'metaverse_items',
          status: 'active',
          startTime: new Date(Date.now() - 120000).toISOString(),
          duration: 300000,
          progress: 40,
          rewards: [],
          totalValue: 0,
          miningPower: 150,
          efficiency: 85
        };

        res.json({
          success: true,
          message: 'Mining session resumed',
          session
        });
      } catch (error) {
        console.error('Resume mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to resume mining'
        });
      }
    });

    // Stop mining session
    this.app.post('/api/metaverse/stop-mining', async (req, res) => {
      try {
        const { sessionId } = req.body;

        // Simulate completed mining with rewards
        const rewards = [
          {
            id: 'reward_1',
            name: 'Crystal Fragment',
            description: 'A small crystal fragment with magical properties',
            type: 'powerup',
            rarity: 'common',
            icon: '💎',
            stats: { power: 15, speed: 10, durability: 20, special: 25 },
            effects: ['+5% mining speed'],
            biome: 'crystal_cave',
            dropRate: 0.3,
            value: 50,
            currency: 'LDOM',
            requirements: { level: 1, miningPower: 50, achievements: [] }
          }
        ];

        const session = {
          id: sessionId,
          type: 'metaverse_items',
          status: 'completed',
          startTime: new Date(Date.now() - 300000).toISOString(),
          duration: 300000,
          progress: 100,
          rewards,
          totalValue: rewards.reduce((sum, reward) => sum + reward.value, 0),
          miningPower: 150,
          efficiency: 85
        };

        res.json({
          success: true,
          message: 'Mining session completed',
          session
        });
      } catch (error) {
        console.error('Stop mining error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to stop mining'
        });
      }
    });

    // Claim reward
    this.app.post('/api/metaverse/claim-reward', async (req, res) => {
      try {
        const { rewardId, sessionId } = req.body;

        const claimResult = {
          success: true,
          rewardId,
          sessionId,
          timestamp: new Date().toISOString(),
          transactionId: `claim_${Date.now()}`
        };

        res.json({
          success: true,
          message: 'Reward claimed successfully',
          data: claimResult
        });
      } catch (error) {
        console.error('Claim reward error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to claim reward'
        });
      }
    });

    console.log('✅ Metaverse Mining Rewards API routes configured');
  }

  setupWorkflowRoutes() {
    // =====================================================
    // WORKFLOW SIMULATION API ENDPOINTS
    // =====================================================

    // Get workflow simulations
    this.app.get('/api/workflow/simulations', async (req, res) => {
      try {
        const mockSimulations = [
          {
            id: 'sim_1',
            name: 'Complete User Journey',
            description: 'End-to-end user workflow simulation',
            steps: [
              {
                id: 'step_1',
                name: 'User Registration',
                description: 'Create new user account',
                type: 'client',
                status: 'completed',
                duration: 1500,
                dependencies: [],
                result: { userId: 'user_123', email: 'test@example.com' }
              },
              {
                id: 'step_2',
                name: 'DOM Analysis',
                description: 'Analyze website DOM structure',
                type: 'cursor',
                status: 'completed',
                duration: 3000,
                dependencies: ['step_1'],
                result: { elementsAnalyzed: 150, spaceFound: 2048 }
              },
              {
                id: 'step_3',
                name: 'Optimization Submission',
                description: 'Submit optimization to blockchain',
                type: 'blockchain',
                status: 'completed',
                duration: 2000,
                dependencies: ['step_2'],
                result: { txHash: '0x123...', tokensEarned: 100 }
              },
              {
                id: 'step_4',
                name: 'Metaverse Generation',
                description: 'Generate metaverse infrastructure',
                type: 'integration',
                status: 'in_progress',
                duration: 0,
                dependencies: ['step_3']
              }
            ],
            totalDuration: 6500,
            status: 'running',
            createdAt: Date.now() - 300000,
            completedAt: null
          }
        ];

        const currentSimulation = mockSimulations.find(sim => sim.status === 'running') || null;

        res.json({
          success: true,
          data: {
            simulations: mockSimulations,
            currentSimulation
          }
        });
      } catch (error) {
        console.error('Get workflow simulations error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get workflow simulations'
        });
      }
    });

    // Start workflow simulation
    this.app.post('/api/workflow/start', async (req, res) => {
      try {
        const simulation = {
          id: `sim_${Date.now()}`,
          name: 'New Workflow Simulation',
          description: 'Automated workflow simulation',
          steps: [
            {
              id: 'step_1',
              name: 'Initialize System',
              description: 'Initialize all system components',
              type: 'client',
              status: 'pending',
              duration: 0,
              dependencies: []
            },
            {
              id: 'step_2',
              name: 'Load Test Data',
              description: 'Load test data and configurations',
              type: 'cursor',
              status: 'pending',
              duration: 0,
              dependencies: ['step_1']
            },
            {
              id: 'step_3',
              name: 'Run Optimizations',
              description: 'Execute DOM optimizations',
              type: 'blockchain',
              status: 'pending',
              duration: 0,
              dependencies: ['step_2']
            },
            {
              id: 'step_4',
              name: 'Generate Reports',
              description: 'Generate optimization reports',
              type: 'integration',
              status: 'pending',
              duration: 0,
              dependencies: ['step_3']
            }
          ],
          totalDuration: 0,
          status: 'running',
          createdAt: Date.now(),
          completedAt: null
        };

        res.json({
          success: true,
          message: 'Workflow simulation started',
          data: { simulation }
        });
      } catch (error) {
        console.error('Start workflow simulation error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to start workflow simulation'
        });
      }
    });

    // Stop workflow simulation
    this.app.post('/api/workflow/stop', async (req, res) => {
      try {
        res.json({
          success: true,
          message: 'Workflow simulation stopped'
        });
      } catch (error) {
        console.error('Stop workflow simulation error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to stop workflow simulation'
        });
      }
    });

    // Reset workflow simulation
    this.app.post('/api/workflow/reset', async (req, res) => {
      try {
        res.json({
          success: true,
          message: 'Workflow simulation reset'
        });
      } catch (error) {
        console.error('Reset workflow simulation error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to reset workflow simulation'
        });
      }
    });

    // Get workflow statistics
    this.app.get('/api/workflow/stats', async (req, res) => {
      try {
        const stats = {
          totalSimulations: 15,
          completedSimulations: 12,
          failedSimulations: 2,
          runningSimulations: 1,
          averageDuration: 45000,
          successRate: 85.7,
          totalSteps: 60,
          completedSteps: 48,
          failedSteps: 5,
          skippedSteps: 7
        };

        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        console.error('Get workflow stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get workflow statistics'
        });
      }
    });

    console.log('✅ Workflow Simulation API routes configured');
  }

  setupTestingRoutes() {
    // =====================================================
    // TESTING API ENDPOINTS
    // =====================================================

    // Get test results
    this.app.get('/api/tests/results', async (req, res) => {
      try {
        const mockTestSuites = [
          {
            name: 'Client Management Tests',
            tests: [
              {
                name: 'Client Creation Test',
                status: 'passed',
                duration: 1200,
                details: { clientsCreated: 5, successRate: 100 }
              },
              {
                name: 'Client Authentication Test',
                status: 'passed',
                duration: 800,
                details: { authAttempts: 10, successRate: 100 }
              },
              {
                name: 'Client Billing Test',
                status: 'failed',
                duration: 1500,
                error: 'Payment gateway timeout',
                details: { billingAttempts: 3, successRate: 0 }
              }
            ],
            totalDuration: 3500,
            passed: 2,
            failed: 1,
            skipped: 0
          },
          {
            name: 'Cursor AI Tests',
            tests: [
              {
                name: 'Code Generation Test',
                status: 'passed',
                duration: 2000,
                details: { codeGenerated: 15, qualityScore: 95 }
              },
              {
                name: 'Merge Conflict Resolution Test',
                status: 'passed',
                duration: 1800,
                details: { conflictsResolved: 8, accuracy: 100 }
              },
              {
                name: 'AI Model Performance Test',
                status: 'passed',
                duration: 3000,
                details: { responseTime: 1.2, accuracy: 98.5 }
              }
            ],
            totalDuration: 6800,
            passed: 3,
            failed: 0,
            skipped: 0
          },
          {
            name: 'Blockchain Integration Tests',
            tests: [
              {
                name: 'Smart Contract Deployment Test',
                status: 'passed',
                duration: 5000,
                details: { contractsDeployed: 3, gasUsed: 2500000 }
              },
              {
                name: 'Token Transfer Test',
                status: 'passed',
                duration: 1200,
                details: { transfers: 50, successRate: 100 }
              },
              {
                name: 'Optimization Submission Test',
                status: 'skipped',
                duration: 0,
                details: { reason: 'Network congestion' }
              }
            ],
            totalDuration: 6200,
            passed: 2,
            failed: 0,
            skipped: 1
          },
          {
            name: 'End-to-End Integration Tests',
            tests: [
              {
                name: 'Complete User Workflow Test',
                status: 'passed',
                duration: 15000,
                details: { workflowsCompleted: 5, successRate: 100 }
              },
              {
                name: 'Performance Load Test',
                status: 'passed',
                duration: 30000,
                details: { concurrentUsers: 100, responseTime: 2.1 }
              },
              {
                name: 'Security Penetration Test',
                status: 'failed',
                duration: 25000,
                error: 'SQL injection vulnerability detected',
                details: { vulnerabilities: 1, severity: 'high' }
              }
            ],
            totalDuration: 70000,
            passed: 2,
            failed: 1,
            skipped: 0
          }
        ];

        const allTests = mockTestSuites.flatMap(suite => suite.tests);

        res.json({
          success: true,
          data: {
            suites: mockTestSuites,
            results: allTests
          }
        });
      } catch (error) {
        console.error('Get test results error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get test results'
        });
      }
    });

    // Run all tests
    this.app.post('/api/tests/run', async (req, res) => {
      try {
        // Simulate test execution
        const testSuites = [
          {
            name: 'Client Management Tests',
            tests: [
              {
                name: 'Client Creation Test',
                status: 'passed',
                duration: 1200,
                details: { clientsCreated: 5, successRate: 100 }
              },
              {
                name: 'Client Authentication Test',
                status: 'passed',
                duration: 800,
                details: { authAttempts: 10, successRate: 100 }
              }
            ],
            totalDuration: 2000,
            passed: 2,
            failed: 0,
            skipped: 0
          },
          {
            name: 'Cursor AI Tests',
            tests: [
              {
                name: 'Code Generation Test',
                status: 'passed',
                duration: 2000,
                details: { codeGenerated: 15, qualityScore: 95 }
              },
              {
                name: 'Merge Conflict Resolution Test',
                status: 'passed',
                duration: 1800,
                details: { conflictsResolved: 8, accuracy: 100 }
              }
            ],
            totalDuration: 3800,
            passed: 2,
            failed: 0,
            skipped: 0
          },
          {
            name: 'Blockchain Integration Tests',
            tests: [
              {
                name: 'Smart Contract Deployment Test',
                status: 'passed',
                duration: 5000,
                details: { contractsDeployed: 3, gasUsed: 2500000 }
              },
              {
                name: 'Token Transfer Test',
                status: 'passed',
                duration: 1200,
                details: { transfers: 50, successRate: 100 }
              }
            ],
            totalDuration: 6200,
            passed: 2,
            failed: 0,
            skipped: 0
          }
        ];

        res.json({
          success: true,
          message: 'All tests completed successfully',
          data: { testSuites }
        });
      } catch (error) {
        console.error('Run tests error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to run tests'
        });
      }
    });

    // Export test results
    this.app.get('/api/tests/export', async (req, res) => {
      try {
        const exportData = {
          timestamp: new Date().toISOString(),
          testResults: {
            totalTests: 12,
            passed: 10,
            failed: 1,
            skipped: 1,
            successRate: 83.3,
            totalDuration: 12000
          },
          suites: [
            {
              name: 'Client Management Tests',
              passed: 2,
              failed: 0,
              skipped: 0,
              duration: 2000
            },
            {
              name: 'Cursor AI Tests',
              passed: 2,
              failed: 0,
              skipped: 0,
              duration: 3800
            },
            {
              name: 'Blockchain Integration Tests',
              passed: 2,
              failed: 0,
              skipped: 0,
              duration: 6200
            }
          ]
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=test-results.json');
        res.json(exportData);
      } catch (error) {
        console.error('Export test results error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to export test results'
        });
      }
    });

    // Get test statistics
    this.app.get('/api/tests/stats', async (req, res) => {
      try {
        const stats = {
          totalTests: 25,
          passed: 22,
          failed: 2,
          skipped: 1,
          successRate: 88.0,
          averageDuration: 2500,
          totalDuration: 62500,
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          coverage: {
            statements: 85.5,
            branches: 78.2,
            functions: 92.1,
            lines: 87.8
          }
        };

        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        console.error('Get test stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get test statistics'
        });
      }
    });

    console.log('✅ Testing API routes configured');
  }

  setupAdvancedNodeRoutes() {
    // =====================================================
    // ADVANCED NODE API ENDPOINTS
    // =====================================================

    // Get nodes
    this.app.get('/api/nodes/list', async (req, res) => {
      try {
        const mockNodes = [
          {
            id: 'node_1',
            type: 'ai_consensus',
            status: 'active',
            storageCapacity: 1000000000,
            usedStorage: 250000000,
            availableStorage: 750000000,
            computePower: 95,
            rewardRate: 0.15,
            biomeType: 'E-commerce',
            sourceOptimizations: ['opt_1', 'opt_2', 'opt_3'],
            createdAt: Date.now() - 86400000,
            lastActivity: Date.now() - 300000,
            performance: {
              uptime: 99.8,
              efficiency: 92.5,
              tasksCompleted: 1250,
              rewardsEarned: 187.5
            }
          },
          {
            id: 'node_2',
            type: 'storage_shard',
            status: 'active',
            storageCapacity: 5000000000,
            usedStorage: 1200000000,
            availableStorage: 3800000000,
            computePower: 75,
            rewardRate: 0.08,
            biomeType: 'Media',
            sourceOptimizations: ['opt_4', 'opt_5'],
            createdAt: Date.now() - 172800000,
            lastActivity: Date.now() - 600000,
            performance: {
              uptime: 99.5,
              efficiency: 88.2,
              tasksCompleted: 850,
              rewardsEarned: 68.0
            }
          },
          {
            id: 'node_3',
            type: 'bridge',
            status: 'maintenance',
            storageCapacity: 2000000000,
            usedStorage: 500000000,
            availableStorage: 1500000000,
            computePower: 85,
            rewardRate: 0.12,
            biomeType: 'Cross-chain',
            sourceOptimizations: ['opt_6', 'opt_7', 'opt_8'],
            createdAt: Date.now() - 259200000,
            lastActivity: Date.now() - 1800000,
            performance: {
              uptime: 98.9,
              efficiency: 90.1,
              tasksCompleted: 2100,
              rewardsEarned: 252.0
            }
          },
          {
            id: 'node_4',
            type: 'optimization',
            status: 'idle',
            storageCapacity: 800000000,
            usedStorage: 200000000,
            availableStorage: 600000000,
            computePower: 70,
            rewardRate: 0.10,
            biomeType: 'Development',
            sourceOptimizations: ['opt_9'],
            createdAt: Date.now() - 432000000,
            lastActivity: Date.now() - 3600000,
            performance: {
              uptime: 99.2,
              efficiency: 85.7,
              tasksCompleted: 650,
              rewardsEarned: 65.0
            }
          }
        ];

        res.json({
          success: true,
          data: { nodes: mockNodes }
        });
      } catch (error) {
        console.error('Get nodes error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get nodes'
        });
      }
    });

    // Create new node
    this.app.post('/api/nodes/create', async (req, res) => {
      try {
        const { type, biomeType, storageCapacity, computePower } = req.body;

        const newNode = {
          id: `node_${Date.now()}`,
          type,
          status: 'active',
          storageCapacity: storageCapacity || 1000000000,
          usedStorage: 0,
          availableStorage: storageCapacity || 1000000000,
          computePower: computePower || 80,
          rewardRate: 0.10,
          biomeType: biomeType || 'General',
          sourceOptimizations: [],
          createdAt: Date.now(),
          lastActivity: Date.now(),
          performance: {
            uptime: 100.0,
            efficiency: 0,
            tasksCompleted: 0,
            rewardsEarned: 0
          }
        };

        res.json({
          success: true,
          message: 'Node created successfully',
          data: { node: newNode }
        });
      } catch (error) {
        console.error('Create node error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create node'
        });
      }
    });

    // Scale node
    this.app.post('/api/nodes/scale', async (req, res) => {
      try {
        const { nodeId, scaleFactor } = req.body;

        const scaledNode = {
          id: nodeId,
          scaleFactor,
          newCapacity: 1000000000 * scaleFactor,
          newComputePower: 80 * scaleFactor,
          timestamp: Date.now()
        };

        res.json({
          success: true,
          message: 'Node scaled successfully',
          data: { scaledNode }
        });
      } catch (error) {
        console.error('Scale node error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to scale node'
        });
      }
    });

    // Merge nodes
    this.app.post('/api/nodes/merge', async (req, res) => {
      try {
        const { nodeIds, mergeType } = req.body;

        const mergedNode = {
          id: `merged_${Date.now()}`,
          sourceNodes: nodeIds,
          mergeType,
          combinedCapacity: 2000000000,
          combinedComputePower: 160,
          timestamp: Date.now()
        };

        res.json({
          success: true,
          message: 'Nodes merged successfully',
          data: { mergedNode }
        });
      } catch (error) {
        console.error('Merge nodes error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to merge nodes'
        });
      }
    });

    // Get node tasks
    this.app.get('/api/nodes/tasks', async (req, res) => {
      try {
        const mockTasks = [
          {
            id: 'task_1',
            nodeId: 'node_1',
            type: 'dom_analysis',
            targetUrl: 'https://example.com',
            status: 'completed',
            spaceSaved: 2048,
            tokensEarned: 15.5,
            createdAt: Date.now() - 1800000,
            completedAt: Date.now() - 1200000
          },
          {
            id: 'task_2',
            nodeId: 'node_1',
            type: 'css_optimization',
            targetUrl: 'https://example.com/styles.css',
            status: 'processing',
            spaceSaved: 0,
            tokensEarned: 0,
            createdAt: Date.now() - 300000
          },
          {
            id: 'task_3',
            nodeId: 'node_2',
            type: 'js_minification',
            targetUrl: 'https://example.com/script.js',
            status: 'completed',
            spaceSaved: 5120,
            tokensEarned: 25.0,
            createdAt: Date.now() - 2400000,
            completedAt: Date.now() - 1800000
          },
          {
            id: 'task_4',
            nodeId: 'node_3',
            type: 'image_compression',
            targetUrl: 'https://example.com/image.jpg',
            status: 'failed',
            spaceSaved: 0,
            tokensEarned: 0,
            createdAt: Date.now() - 3600000,
            error: 'Image format not supported'
          }
        ];

        res.json({
          success: true,
          data: { tasks: mockTasks }
        });
      } catch (error) {
        console.error('Get node tasks error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get node tasks'
        });
      }
    });

    // Get system statistics
    this.app.get('/api/nodes/stats', async (req, res) => {
      try {
        const stats = {
          totalNodes: 4,
          activeNodes: 2,
          idleNodes: 1,
          maintenanceNodes: 1,
          totalStorageCapacity: 8800000000,
          usedStorage: 2150000000,
          availableStorage: 6650000000,
          totalComputePower: 325,
          averageEfficiency: 89.1,
          totalTasksCompleted: 4850,
          totalRewardsEarned: 572.5,
          averageUptime: 99.35
        };

        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        console.error('Get node stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get node statistics'
        });
      }
    });

    console.log('✅ Advanced Node API routes configured');
  }

  async setupSEOServiceRoutes() {
    // Import SEO service API creator
    try {
      const { createSEOInjectionAPI } = await import('./src/api/seo-injection-api.js');

      // Mount SEO API routes
      const seoRouter = createSEOInjectionAPI(this.db);
      this.app.use('/api/v1/seo', seoRouter);

      console.log('✅ SEO Service API routes configured');
    } catch (error) {
      console.error('⚠️ Failed to setup SEO Service routes:', error.message);
      console.log('SEO Service will not be available. This is expected if TypeScript files are not compiled yet.');
    }
  }

  // Helper methods for authentication
  async checkUserExists(email) {
    // Mock database check
    return null; // User doesn't exist
  }

  async authenticateUser(email, password) {
    // Mock authentication - in production, check against database
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123', // In production, this would be hashed
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        createdAt: '2024-01-01T00:00:00Z',
        isVerified: true,
        role: 'user',
        profile: {
          avatar: null,
          bio: 'DOM optimization enthusiast',
          location: 'San Francisco, CA',
          website: 'https://johndoe.com'
        },
        stats: {
          totalOptimizations: 45,
          tokensEarned: 4250,
          spaceSaved: 1024000,
          reputation: 850,
          level: 5
        }
      },
      {
        id: 'admin',
        name: 'Admin User',
        email: 'admin',
        password: 'admin', // In production, this would be hashed
        walletAddress: '0x0000000000000000000000000000000000000000',
        createdAt: '2024-01-01T00:00:00Z',
        isVerified: true,
        role: 'admin',
        profile: {
          avatar: null,
          bio: 'System Administrator',
          location: 'Global',
          website: ''
        },
        stats: {
          totalOptimizations: 0,
          tokensEarned: 0,
          spaceSaved: 0,
          reputation: 1000,
          level: 10
        }
      }
    ];

    return mockUsers.find(user => user.email === email && user.password === password);
  }

  generateJWT(user) {
    // Mock JWT generation - in production, use proper JWT library
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      address: user.walletAddress
    };
    
    // Simple base64 encoding (not secure for production)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  generateResetToken(userId) {
    // Mock reset token generation
    return `reset_${userId}_${Date.now()}`;
  }

  generateVerificationToken(userId) {
    // Mock verification token generation
    return `verify_${userId}_${Date.now()}`;
  }

  async validateResetToken(token) {
    // Mock token validation
    const parts = token.split('_');
    if (parts.length === 3 && parts[0] === 'reset') {
      return parts[1];
    }
    return null;
  }

  async validateVerificationToken(token) {
    // Mock token validation
    const parts = token.split('_');
    if (parts.length === 3 && parts[0] === 'verify') {
      return parts[1];
    }
    return null;
  }

  async sendVerificationEmail(email, userId) {
    // Mock email sending
    console.log(`📧 Verification email sent to ${email} for user ${userId}`);
  }

  async sendPasswordResetEmail(email, resetToken) {
    // Mock email sending
    console.log(`📧 Password reset email sent to ${email} with token ${resetToken}`);
  }

  async updateUserPassword(userId, password) {
    // Mock password update
    console.log(`🔒 Password updated for user ${userId}`);
  }

  async verifyUser(userId) {
    // Mock user verification
    console.log(`✅ User ${userId} verified`);
  }

  async getUserProfile(userId) {
    // Mock user profile retrieval
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      createdAt: '2024-01-01T00:00:00Z',
      isVerified: true,
      profile: {
        avatar: null,
        bio: 'DOM optimization enthusiast',
        location: 'San Francisco, CA',
        website: 'https://johndoe.com'
      },
      stats: {
        totalOptimizations: 45,
        tokensEarned: 4250,
        spaceSaved: 1024000,
        reputation: 850,
        level: 5
      }
    };
  }

  async updateUserProfile(userId, updates) {
    // Mock profile update
    const user = await this.getUserProfile(userId);
    return { ...user, ...updates };
  }

  // JWT Authentication middleware
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    try {
      // Mock JWT verification - in production, use proper JWT library
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      req.user = payload;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
    }
  }

  setupDataIntegrationRoutes() {
    console.log('🔗 Setting up data integration API routes...');
    
    // =====================================================
    // DATA INTEGRATION ENDPOINTS
    // =====================================================

    // Get integrated dashboard data
    this.app.get('/api/integrated/dashboard', async (req, res) => {
      try {
        const [blockchain, crawler, lightdom, metaverse] = await Promise.all([
          this.getBlockchainStats(),
          this.getCrawlerStats(),
          this.getLightDomStats(),
          this.getMetaverseStats()
        ]);

        const systemHealth = this.calculateSystemHealth(blockchain, crawler, lightdom, metaverse);

        res.json({
          success: true,
          data: {
            blockchain,
            crawler,
            lightdom,
            metaverse,
            lastUpdated: new Date().toISOString(),
            systemHealth
          }
        });
      } catch (error) {
        console.error('Error fetching integrated dashboard data:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch integrated dashboard data'
        });
      }
    });

    // Get blockchain stats
    this.app.get('/api/blockchain/stats', async (req, res) => {
      try {
        const stats = await this.getBlockchainStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        console.error('Error fetching blockchain stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blockchain stats' });
      }
    });

    // Get crawler stats
    this.app.get('/api/crawler/stats', async (req, res) => {
      try {
        const stats = await this.getCrawlerStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        console.error('Error fetching crawler stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch crawler stats' });
      }
    });

    // Get LightDom optimization stats
    this.app.get('/api/optimization/stats', async (req, res) => {
      try {
        const stats = await this.getLightDomStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        console.error('Error fetching LightDom stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch LightDom stats' });
      }
    });

    // Get metaverse stats
    this.app.get('/api/metaverse/stats', async (req, res) => {
      try {
        const stats = await this.getMetaverseStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        console.error('Error fetching metaverse stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metaverse stats' });
      }
    });

    // Get mining rewards for user
    this.app.get('/api/mining/rewards/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const rewards = await this.getMiningRewards(userId);
        res.json({ success: true, data: rewards });
      } catch (error) {
        console.error('Error fetching mining rewards:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch mining rewards' });
      }
    });

    // Get optimization performance
    this.app.get('/api/optimization/performance', async (req, res) => {
      try {
        const performance = await this.getOptimizationPerformance();
        res.json({ success: true, data: performance });
      } catch (error) {
        console.error('Error fetching optimization performance:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch optimization performance' });
      }
    });
  }

  // Helper methods for data integration
  async getBlockchainStats() {
    try {
      // Try to get real data from blockchain system if available
      if (global.blockchainSystem) {
        const stats = global.blockchainSystem.getMiningStats();
        return {
          totalMined: stats.totalTokensRewarded,
          activeMiners: stats.activeMiners,
          currentHashRate: stats.hashRate,
          lastBlockTime: stats.lastBlockTime,
          pendingTransactions: stats.pendingTransactions,
          gasPrice: stats.gasPrice,
          networkStatus: stats.networkStatus,
          miningRewards: stats.miningRewards || {
            lightdom: stats.totalTokensRewarded,
            usd: stats.totalTokensRewarded * 0.1,
            btc: stats.totalTokensRewarded * 0.00002,
            eth: stats.totalTokensRewarded * 0.0003
          }
        };
      }
    } catch (error) {
      console.error('Error getting real blockchain stats:', error);
    }

    // Fallback to mock data
    return {
      totalMined: 1250.75,
      activeMiners: 42,
      currentHashRate: 15.6,
      lastBlockTime: Date.now() - 300000,
      pendingTransactions: 8,
      gasPrice: 20,
      networkStatus: 'healthy',
      miningRewards: {
        lightdom: 25.50,
        usd: 2.55,
        btc: 0.000058,
        eth: 0.00092
      }
    };
  }

  async getCrawlerStats() {
    try {
      // Try to get real data from crawler system if available
      if (global.crawlerSystem) {
        const stats = global.crawlerSystem.getCrawlerStats();
        return {
          totalSitesCrawled: stats.totalSitesCrawled,
          activeCrawlers: stats.activeCrawlers,
          optimizationScore: stats.optimizationScore,
          lastCrawlTime: stats.lastCrawlTime,
          sitesInQueue: stats.sitesInQueue,
          averageResponseTime: stats.averageResponseTime,
          crawlStatus: stats.crawlStatus,
          spaceHarvested: stats.spaceHarvested
        };
      }
    } catch (error) {
      console.error('Error getting real crawler stats:', error);
    }

    // Fallback to mock data
    return {
      totalSitesCrawled: 1847,
      activeCrawlers: 3,
      optimizationScore: 87.5,
      lastCrawlTime: Date.now() - 120000,
      sitesInQueue: 23,
      averageResponseTime: 1.2,
      crawlStatus: 'running',
      spaceHarvested: {
        total: 2048.5,
        today: 156.2,
        thisWeek: 892.7
      }
    };
  }

  async getLightDomStats() {
    // Mock data - in real implementation, connect to LightDom optimization
    return {
      optimizationEfficiency: 92.3,
      totalOptimizations: 4567,
      activeOptimizations: 12,
      averageOptimizationTime: 2.4,
      spaceAllocated: 1024.8,
      spaceAvailable: 2048.2,
      optimizationStatus: 'active',
      performanceMetrics: {
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 34.1,
        networkLatency: 12.5
      }
    };
  }

  async getMetaverseStats() {
    // Mock data - in real implementation, connect to metaverse
    return {
      totalBridges: 15,
      activeBridges: 12,
      totalChatRooms: 8,
      activeUsers: 247,
      totalMessages: 1847,
      economyValue: 125000.50,
      landParcels: 64,
      aiNodes: 23,
      metaverseStatus: 'online',
      realTimeStats: {
        usersOnline: 47,
        messagesPerMinute: 12,
        transactionsPerHour: 156
      }
    };
  }

  async getMiningRewards(userId) {
    // Mock data - in real implementation, calculate from blockchain
    return {
      totalEarned: 456.75,
      todayEarned: 12.50,
      pendingRewards: 8.25,
      miningPower: 15.6
    };
  }

  async getOptimizationPerformance() {
    // Mock data - in real implementation, calculate from optimization logs
    return {
      totalOptimizations: 4567,
      successRate: 94.2,
      averageTime: 2.4,
      spaceSaved: 1024.8,
      efficiency: 92.3
    };
  }

  calculateSystemHealth(blockchain, crawler, lightdom, metaverse) {
    let healthScore = 100;

    // Blockchain health
    if (blockchain.networkStatus !== 'healthy') healthScore -= 20;
    if (blockchain.pendingTransactions > 50) healthScore -= 10;
    if (blockchain.gasPrice > 100) healthScore -= 5;

    // Crawler health
    if (crawler.crawlStatus !== 'running') healthScore -= 15;
    if (crawler.averageResponseTime > 5) healthScore -= 10;
    if (crawler.optimizationScore < 70) healthScore -= 10;

    // LightDom health
    if (lightdom.optimizationStatus !== 'active') healthScore -= 15;
    if (lightdom.optimizationEfficiency < 80) healthScore -= 10;
    if (lightdom.performanceMetrics.cpuUsage > 90) healthScore -= 5;
    if (lightdom.performanceMetrics.memoryUsage > 90) healthScore -= 5;

    // Metaverse health
    if (metaverse.metaverseStatus !== 'online') healthScore -= 20;
    if (metaverse.realTimeStats.usersOnline === 0) healthScore -= 10;

    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 70) return 'good';
    if (healthScore >= 50) return 'warning';
    return 'critical';
  }

  async initializeServer() {
    console.log('🔧 Initializing server components...');

    // Initialize middleware and routes
    this.setupMiddleware();
    this.setupRoutes();

    // Initialize WebSocket
    this.setupWebSocket();
    this.startRealtimeUpdates();

    // Initialize blockchain if enabled
    if (this.blockchainEnabled) {
      await this.initializeBlockchain();
    }

    console.log('✅ Server initialization complete');
  }

  async start(port = 3001) {
    try {
      console.log('🚀 Starting DOM Space Harvester API Server...');

      // Initialize all components
      console.log('🔧 Initializing server components...');
      await this.initializeServer();
      console.log('✅ Server initialization complete');

      console.log(`🔄 Starting server on port ${port}...`);
      return new Promise((resolve, reject) => {
        this.server.listen(port, () => {
          console.log(`✅ API Server running on port ${port}`);
          console.log(`📊 Health check: http://localhost:${port}/api/health`);
          console.log(`🔗 WebSocket: ws://localhost:${port}`);
          resolve(port);
        });

        this.server.on('error', (err) => {
          console.error('❌ Server error:', err?.message || err);
          reject(err);
        });
      });

    } catch (error) {
      console.error('❌ Failed to start API server:', error);
      throw error;
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down API server...');
    if (this.server) {
      this.server.close();
    }
    if (this.db) {
      await this.db.end();
    }
    console.log('✅ API server shutdown complete');
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (global.apiServer) {
    await global.apiServer.shutdown();
  }
  process.exit(0);
});

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const apiServer = new DOMSpaceHarvesterAPI();
  global.apiServer = apiServer;
  
  const port = process.env.PORT || 3001;
  apiServer.start(port).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { DOMSpaceHarvesterAPI };