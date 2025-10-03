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
    
    // Setup blockchain API routes
    this.setupBlockchainRoutes();
    
    // Setup optimization API routes
    this.setupOptimizationRoutes();
    
    // Setup website API routes
    this.setupWebsiteRoutes();
    
    // Setup analytics API routes
    this.setupAnalyticsRoutes();
    
    // Setup authentication API routes
    this.setupAuthRoutes();
    
    // Setup mining API routes
    this.setupMiningRoutes();
    
    // Setup space mining API routes
    this.setupSpaceMiningRoutes();
    
    // Setup metaverse mining API routes
    this.setupMetaverseMiningRoutes();
    
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

  async start(port = 3001) {
    try {
      if (this.dbDisabled) {
        console.log('⚠️  Database disabled (DB_DISABLED=true). Starting without DB connection.');
      } else {
        // Test database connection
        await this.db.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
      }

      // Initialize blockchain
      await this.initializeBlockchain();

      // Initialize integration service (commented out until TypeScript files are compiled)
      // await this.integrationService.initialize();
      // console.log('✅ Cursor-N8n integration service initialized');

        // Start supervisor
        await this.supervisor.start();
        
        // Start blockchain runner (optional - can be started later)
        try {
          await this.blockchainRunner.start();
        } catch (error) {
          console.warn('⚠️ Blockchain runner failed to start:', error.message);
          console.log('ℹ️ Blockchain runner will be available after server is fully started');
        }

      // Start server
      this.server.listen(port, () => {
        console.log(`🚀 DOM Space Harvester API running on port ${port}`);
        console.log(`📊 Dashboard: http://localhost:${port}/api/health`);
        console.log(`🔌 WebSocket: ws://localhost:${port}`);
        console.log(`📁 Database: ${process.env.DB_NAME || 'dom_space_harvester'}`);
        if (this.blockchainEnabled) {
          console.log(`⛓️  Blockchain: ${this.provider ? 'Connected' : 'Disabled'}`);
        }
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
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
      }
    ];

    return mockUsers.find(user => user.email === email && user.password === password);
  }

  generateJWT(user) {
    // Mock JWT generation - in production, use proper JWT library
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
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
  apiServer.start(port);
}

export { DOMSpaceHarvesterAPI };