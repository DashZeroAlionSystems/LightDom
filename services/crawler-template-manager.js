import CrawleeSeederIntegration from './crawlee-seeder-integration.js';
import CrawleeService from './crawlee-service.js';

const BASE_REQUEST_HANDLER = `return (async () => {
  const getMeta = selector => {
    const node = document.querySelector(selector);
    return node ? (node.getAttribute('content') || node.getAttribute('href') || '').trim() : null;
  };

  const headings = {};
  ['h1','h2','h3','h4','h5','h6'].forEach(level => {
    headings[level] = Array.from(document.querySelectorAll(level))
      .map(node => node.textContent?.trim())
      .filter(Boolean);
  });

  const gatherLinks = () => Array.from(document.querySelectorAll('a[href]')).slice(0, 200).map(link => ({
    href: link.href,
    text: link.textContent?.trim() || '',
    rel: link.rel || '',
    title: link.title || ''
  }));

  const gatherImages = () => Array.from(document.querySelectorAll('img[src]')).slice(0, 80).map(img => ({
    src: img.src,
    alt: img.alt || '',
    width: img.width || 0,
    height: img.height || 0,
    loading: img.loading || 'eager'
  }));

  const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map(node => {
      try {
        return JSON.parse(node.textContent || '');
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const textSample = document.body?.innerText || '';

  return {
    url: location.href,
    title: document.title || null,
    description: getMeta('meta[name="description"]'),
    keywords: (getMeta('meta[name="keywords"]') || '')
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean),
    canonicalUrl: getMeta('link[rel="canonical"]'),
    robotsMeta: getMeta('meta[name="robots"]'),
    openGraph: {
      title: getMeta('meta[property="og:title"]'),
      description: getMeta('meta[property="og:description"]'),
      image: getMeta('meta[property="og:image"]'),
      url: getMeta('meta[property="og:url"]')
    },
    twitterCard: {
      card: getMeta('meta[name="twitter:card"]'),
      title: getMeta('meta[name="twitter:title"]'),
      description: getMeta('meta[name="twitter:description"]'),
      image: getMeta('meta[name="twitter:image"]')
    },
    headings,
    links: gatherLinks(),
    images: gatherImages(),
    structuredData,
    content: textSample.slice(0, 50000),
    wordCount: textSample ? textSample.split(/\s+/).filter(Boolean).length : 0,
    paragraphCount: document.querySelectorAll('p').length,
    domStats: {
      totalElements: document.querySelectorAll('*').length,
      scriptCount: document.querySelectorAll('script[src]').length,
      stylesheetCount: document.querySelectorAll('link[rel="stylesheet"]').length,
      inlineStyles: document.querySelectorAll('style').length
    }
  };
})();`;

function normalizeSeeds(input) {
  if (!input) {
    return [];
  }

  const seeds = Array.isArray(input) ? input : [input];
  return seeds
    .map(seed => {
      if (typeof seed === 'string') {
        return { url: seed, priority: 5, metadata: {} };
      }

      if (seed && typeof seed.url === 'string') {
        return {
          url: seed.url,
          priority: typeof seed.priority === 'number' ? seed.priority : 5,
          metadata: seed.metadata || {},
        };
      }

      return null;
    })
    .filter(Boolean);
}

export default class CrawlerTemplateManager {
  constructor(db, options = {}) {
    this.db = db;
    this.templateId = options.templateId || 'crawler_single_template';
    this.defaultSeederId =
      options.defaultSeederId || process.env.CRAWLER_SEEDER_ID || 'default-topic-seeder';
    this.crawleeService = options.crawleeService || new CrawleeService(db);
    this.seederIntegration =
      options.seederIntegration ||
      new CrawleeSeederIntegration(db, { crawleeService: this.crawleeService });
  }

  getBaseTemplateConfig(overrides = {}) {
    const seederServiceId =
      overrides.seeder_service_id || overrides.seederServiceId || this.defaultSeederId;

    return {
      id: overrides.id || this.templateId,
      name: overrides.name || 'Unified DOM Harvester',
      description: overrides.description || 'Reusable crawler template with seeding and ML hooks',
      type: overrides.type || 'cheerio',
      seeder_service_id: seederServiceId,
      request_handler: overrides.request_handler || BASE_REQUEST_HANDLER,
      config: {
        maxRequestsPerCrawl: 500,
        maxConcurrency: 5,
        requestHandlerTimeoutSecs: 90,
        navigationTimeoutSecs: 60,
        maxRequestRetries: 2,
        ...overrides.config,
      },
      request_config: {
        headless: true,
        useChrome: false,
        ignoreSslErrors: false,
        ...overrides.request_config,
      },
      url_patterns: {
        include: ['*'],
        exclude: overrides.excludePatterns || [],
        maxDepth: overrides.maxDepth || 3,
        sameDomain: overrides.sameDomain !== false,
        respectRobotsTxt: overrides.respectRobotsTxt !== false,
        ...overrides.url_patterns,
      },
      metadata: {
        autoStart: overrides.autoStart !== false,
        template: 'single-crawler',
        seedBatchSize: overrides.seedBatchSize || 25,
        tags: overrides.metadata?.tags || [],
        ...(overrides.metadata || {}),
      },
      selectors: overrides.selectors || {},
      tags: Array.from(new Set([...(overrides.tags || []), 'template', 'crawler'])),
      campaign_id: overrides.campaign_id || null,
    };
  }

  async ensureSeeder(seederServiceId, config = {}) {
    await this.db.query(
      `INSERT INTO seeding_services (id, name, description, config, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (id) DO UPDATE SET
         config = EXCLUDED.config,
         status = 'active',
         updated_at = NOW()`,
      [
        seederServiceId,
        config.name || 'Unified Crawler Seeder',
        config.description || 'Primary seeding service for crawler template',
        JSON.stringify(config.payload || {}),
      ]
    );
  }

  async syncSeeds(seederServiceId, seeds) {
    const normalized = normalizeSeeds(seeds);
    if (normalized.length === 0) {
      return { inserted: 0 };
    }

    let inserted = 0;
    for (const seed of normalized) {
      await this.db.query(
        `INSERT INTO url_seeds (seeder_service_id, url, priority, metadata, status)
         VALUES ($1, $2, $3, $4, 'pending')
         ON CONFLICT (seeder_service_id, url) DO NOTHING`,
        [seederServiceId, seed.url, seed.priority, JSON.stringify(seed.metadata || {})]
      );
      inserted += 1;
    }

    return { inserted };
  }

  async ensureTemplate(overrides = {}) {
    const baseConfig = this.getBaseTemplateConfig(overrides);
    await this.ensureSeeder(baseConfig.seeder_service_id, overrides.seederConfig || {});

    const existing = await this.db.query('SELECT id FROM crawlee_crawlers WHERE id = $1', [
      baseConfig.id,
    ]);

    if (existing.rows.length === 0) {
      await this.crawleeService.createCrawler(baseConfig);
    } else {
      const { id, ...updatePayload } = baseConfig;
      await this.crawleeService.updateCrawler(baseConfig.id, updatePayload);
    }

    if (overrides.seeds) {
      await this.syncSeeds(baseConfig.seeder_service_id, overrides.seeds);
    }

    return baseConfig.id;
  }

  async startTemplateCrawler(crawlerId) {
    await this.seederIntegration.ensureSeederSchema();
    this.seederIntegration.setupResultListeners();
    await this.seederIntegration.startContinuousCrawling(crawlerId);
  }
}
