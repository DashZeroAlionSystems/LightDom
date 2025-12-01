import { Pool } from 'pg';
import crawlerService from '../enhanced-web-crawler-service.js';
import AttributeCrawlerManager from './attribute-crawler-manager.js';
import CrawleeSeederIntegration from './crawlee-seeder-integration.js';
import CrawleeService from './crawlee-service.js';
import CrawlerTemplateManager from './crawler-template-manager.js';
import { URLSeedingService } from './url-seeding-service.js';

function parseJsonField(field) {
  if (!field) {
    return {};
  }

  if (typeof field === 'object') {
    return field;
  }

  try {
    return JSON.parse(field);
  } catch {
    return {};
  }
}

export default class CrawlerOrchestrationService {
  constructor(options = {}) {
    this.initialized = false;
    this.dbPool = null;
    this.crawleeService = null;
    this.seederIntegration = null;
    this.templateManager = null;
    this.seedingService = null;
    this.attributeManager = null;
    this.defaultSeederId =
      options.defaultSeederId || process.env.CRAWLER_SEEDER_ID || 'default-topic-seeder';
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    this.dbPool = this.createPool();
    this.crawleeService = new CrawleeService(this.dbPool);
    this.seederIntegration = new CrawleeSeederIntegration(this.dbPool, {
      crawleeService: this.crawleeService,
    });
    this.templateManager = new CrawlerTemplateManager(this.dbPool, {
      crawleeService: this.crawleeService,
      seederIntegration: this.seederIntegration,
      defaultSeederId: this.defaultSeederId,
    });
    this.attributeManager = new AttributeCrawlerManager(this.dbPool, {
      crawleeService: this.crawleeService,
      seederIntegration: this.seederIntegration,
      defaultSeederId: this.defaultSeederId,
    });

    await this.seederIntegration.ensureSeederSchema();
    this.seederIntegration.setupResultListeners();

    crawlerService.configure({
      seedServiceId: this.defaultSeederId,
      seedBatchSize: Number(process.env.CRAWLER_SEED_BATCH || 50),
      maxConcurrentPages: Number(
        process.env.CRAWLER_MAX_CONCURRENCY || crawlerService.maxConcurrentPages
      ),
    });

    if (process.env.CRAWLER_AUTO_TEMPLATE !== 'false') {
      await this.templateManager.ensureTemplate({});
    }

    if (process.env.CRAWLER_AUTOSTART !== 'false') {
      await this.startSeedingService();
      await this.startManagedCrawlers();

      if (process.env.CRAWLER_ATTRIBUTE_AUTOSTART !== 'false') {
        await this.autoStartAttributeCampaign();
      }
    }

    this.initialized = true;
  }

  createPool() {
    const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
    const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

    if (connectionString) {
      return new Pool({ connectionString, max: 20, ssl });
    }

    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async startSeedingService(config = {}) {
    if (this.seedingService) {
      return this.seedingService.stats;
    }

    this.seedingService = new URLSeedingService({
      db: this.dbPool,
      instanceId: config.instanceId || 'crawler-orchestrator-seeder',
      seedingServiceId: this.defaultSeederId,
      enableSearchAlgorithms: true,
      maxSeedsPerInstance: config.maxSeedsPerInstance || 2000,
    });

    return this.seedingService.start();
  }

  async configureLegacyCrawler(config = {}) {
    crawlerService.configure(config);
  }

  async startLegacyCrawler(config = {}) {
    await this.initialize();
    if (config && Object.keys(config).length > 0) {
      await this.configureLegacyCrawler(config);
    }

    await this.startSeedingService();
    await crawlerService.initialize();
    await crawlerService.hydrateSeedsFromRuntime?.();
    await crawlerService.startCrawling();
    return crawlerService.getStatus?.() || { status: 'started' };
  }

  async ensureTemplate(overrides = {}) {
    await this.initialize();
    return this.templateManager.ensureTemplate(overrides);
  }

  async syncTemplateSeeds(seederServiceId, seeds) {
    await this.initialize();
    return this.templateManager.syncSeeds(seederServiceId || this.defaultSeederId, seeds);
  }

  async startManagedCrawlers() {
    await this.initialize();
    await this.startSeedingService();

    const result = await this.dbPool.query(
      `SELECT id, metadata, seeder_service_id
       FROM crawlee_crawlers
       ORDER BY created_at ASC`
    );

    const started = [];
    for (const row of result.rows) {
      const metadata = parseJsonField(row.metadata);
      const autoStart = metadata.autoStart !== false;
      if (!autoStart) {
        continue;
      }

      try {
        await this.templateManager.startTemplateCrawler(row.id);
        started.push(row.id);
      } catch (error) {
        console.error(`Failed to start crawler ${row.id}:`, error.message);
      }
    }

    return started;
  }

  async refreshSeederStats(seederServiceId = this.defaultSeederId) {
    await this.initialize();
    return this.seederIntegration.getSeederStats(seederServiceId);
  }

  async ensureAttributeCampaign(options = {}) {
    await this.initialize();
    return this.attributeManager.ensureAttributeCampaign(options);
  }

  async seedAttributeCampaign(options = {}) {
    await this.initialize();
    return this.attributeManager.seedFromCrawledSites(options);
  }

  async startAttributeCampaign(options = {}) {
    await this.initialize();
    return this.attributeManager.startAttributeCampaign(options);
  }

  async attributeSeedSummary(options = {}) {
    await this.initialize();
    return this.attributeManager.getSeedSummary(options);
  }

  async autoStartAttributeCampaign() {
    try {
      const ensured = await this.attributeManager.ensureAttributeCampaign({});
      const seeded = await this.attributeManager.seedFromCrawledSites({});
      const started = await this.attributeManager.startAttributeCampaign({});

      console.log('🧩 Attribute campaign ensured:', JSON.stringify(ensured));
      console.log('🌱 Attribute campaign seeded:', JSON.stringify(seeded));
      console.log('🏁 Attribute campaign started:', JSON.stringify(started));
    } catch (error) {
      console.error('⚠️  Failed to auto-start attribute campaign:', error.message);
    }
  }

  async getStatus() {
    await this.initialize();

    const crawlers = await this.crawleeService.listCrawlers({});
    const running = crawlers
      .filter(crawler => crawler.status === 'running')
      .map(crawler => ({
        id: crawler.id,
        name: crawler.name,
        status: crawler.status,
        seeder_service_id: crawler.seeder_service_id,
      }));

    return {
      legacy: crawlerService.getStatus?.() || { status: 'unknown' },
      crawlee: {
        total: crawlers.length,
        running,
        templateId: this.templateManager?.templateId || null,
      },
      seeding: this.seedingService ? this.seedingService.stats : null,
    };
  }

  async shutdown() {
    if (this.crawleeService) {
      const crawlers = await this.crawleeService.listCrawlers({ status: 'running' });
      for (const crawler of crawlers) {
        try {
          await this.crawleeService.stopCrawler(crawler.id);
        } catch (error) {
          console.error(`Failed to stop crawler ${crawler.id}:`, error.message);
        }
      }
    }

    if (crawlerService.stopCrawling) {
      await crawlerService.stopCrawling();
    }

    if (this.seedingService) {
      await this.seedingService.stop();
    }

    if (this.dbPool) {
      await this.dbPool.end();
    }

    this.initialized = false;
  }
}
