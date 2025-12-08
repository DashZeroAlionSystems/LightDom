import CrawleeSeederIntegration from './crawlee-seeder-integration.js';
import CrawleeService from './crawlee-service.js';
import { NeuralNetworkInstanceService } from './NeuralNetworkInstanceService.js';

const DEFAULT_CRAWLER_ID = 'crawler_default_topic';
const DEFAULT_SEEDER_ID = 'default-topic-seeder';
const DEFAULT_TOPICS = [
  'seo optimization',
  'web performance',
  'accessibility best practices'
];

const DEFAULT_TOPIC_SEEDS = [
  {
    topic: 'seo optimization',
    urls: [
      'https://moz.com/learn/seo/what-is-seo',
      'https://ahrefs.com/blog/seo-basics/',
      'https://searchengineland.com/library/channel/seo'
    ]
  },
  {
    topic: 'web performance',
    urls: [
      'https://web.dev/learn/performance/',
      'https://developer.mozilla.org/docs/Learn/Performance',
      'https://www.smashingmagazine.com/guides/performance/'
    ]
  },
  {
    topic: 'accessibility best practices',
    urls: [
      'https://www.w3.org/WAI/fundamentals/accessibility-intro/',
      'https://webaim.org/standards/wcag/checklist',
      'https://developer.mozilla.org/docs/Learn/Accessibility'
    ]
  }
];

const DEFAULT_REQUEST_HANDLER = `return (async () => {
  const extractMeta = (selector) => {
    const value = $(selector).attr('content');
    return value ? value.trim() : null;
  };

  const headings = {};
  ['h1','h2','h3','h4','h5','h6'].forEach(level => {
    headings[level] = $(level).map((i, el) => $(el).text().trim()).get();
  });

  const keywordsMeta = extractMeta('meta[name="keywords"]');
  const keywords = keywordsMeta ? keywordsMeta.split(',').map(item => item.trim()).filter(Boolean) : [];

  const links = $('a[href]').map((i, el) => ({
    href: $(el).attr('href'),
    text: $(el).text().trim(),
    rel: $(el).attr('rel') || ''
  })).get().slice(0, 100);

  const images = $('img').map((i, el) => ({
    src: $(el).attr('src'),
    alt: $(el).attr('alt') || '',
    title: $(el).attr('title') || ''
  })).get().slice(0, 40);

  const structuredData = $('script[type="application/ld+json"]').map((i, el) => {
    try {
      return JSON.parse($(el).text());
    } catch (err) {
      return null;
    }
  }).get().filter(Boolean);

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    url: request.url,
    title: $('title').text().trim() || null,
    description: extractMeta('meta[name="description"]'),
    keywords,
    canonicalUrl: $('link[rel="canonical"]').attr('href') || null,
    robotsMeta: extractMeta('meta[name="robots"]'),
    headings,
    links,
    images,
    structuredData,
    content: bodyText.slice(0, 20000),
    metadata: {
      domStats: {
        totalElements: $('*').length,
        scriptCount: $('script[src]').length,
        stylesheetCount: $('link[rel="stylesheet"]').length
      }
    }
  };
})();`;

export async function ensureDefaultCrawlerSetup(db, options = {}) {
  const { startContinuous = false } = options;
  const crawleeService = new CrawleeService(db);
  const seederIntegration = new CrawleeSeederIntegration(db, { crawleeService });

  await seederIntegration.ensureSeederSchema();
  const neuralInstanceId = await ensureDefaultNeuralInstance(db);

  await db.query(
    `INSERT INTO seeding_services (id, name, description, config, status)
     VALUES ($1, $2, $3, $4, 'active')
     ON CONFLICT (id) DO UPDATE SET
       config = EXCLUDED.config,
       status = 'active',
       updated_at = NOW()`,
    [
      DEFAULT_SEEDER_ID,
      'Default Topic Seeder',
      'Neural-assisted topic discovery seeds',
      JSON.stringify({ topics: DEFAULT_TOPICS, neuralInstanceId })
    ]
  );

  await bootstrapCrawler(db, crawleeService, neuralInstanceId);
  await seedDefaultTopics(db);

  if (startContinuous) {
    seederIntegration.setupResultListeners();
    await seederIntegration.startContinuousCrawling(DEFAULT_CRAWLER_ID);
  }

  return {
    crawlerId: DEFAULT_CRAWLER_ID,
    seederServiceId: DEFAULT_SEEDER_ID,
    neuralInstanceId,
    topics: DEFAULT_TOPICS,
    continuousStarted: startContinuous
  };
}

async function ensureDefaultNeuralInstance(db) {
  const existing = await db.query(
    'SELECT id FROM neural_network_instances WHERE model_type = $1 ORDER BY created_at ASC LIMIT 1',
    ['seo']
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const service = new NeuralNetworkInstanceService(db);
  const instance = await service.createInstance({
    name: 'Default SEO Neural Instance',
    description: 'Bootstrap neural network powering default crawler topic discovery',
    model_type: 'seo',
    load_default_models: true,
    architecture: { preset: 'transformer' },
    data_config: { source: 'default-bootstrap' }
  });

  await db.query(
    `UPDATE neural_network_instances
     SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"is_default":true}'::jsonb
     WHERE id = $1`,
    [instance.id]
  );

  return instance.id;
}

async function bootstrapCrawler(db, crawleeService, neuralInstanceId) {
  const existing = await db.query('SELECT id FROM crawlee_crawlers WHERE id = $1', [DEFAULT_CRAWLER_ID]);

  if (existing.rows.length === 0) {
    await crawleeService.createCrawler({
      id: DEFAULT_CRAWLER_ID,
      name: 'Default Topic Explorer',
      description: 'Neural-enhanced default crawler for topic discovery',
      type: 'cheerio',
      seeder_service_id: DEFAULT_SEEDER_ID,
      request_handler: DEFAULT_REQUEST_HANDLER,
      config: {
        maxConcurrency: 5,
        maxRequestsPerCrawl: 200,
        requestHandlerTimeoutSecs: 120,
        maxRequestRetries: 2
      },
      metadata: {
        isDefault: true,
        topics: DEFAULT_TOPICS,
        neuralInstanceId
      },
      tags: ['default', 'neural', 'topic']
    });
  } else {
    await crawleeService.updateCrawler(DEFAULT_CRAWLER_ID, {
      seeder_service_id: DEFAULT_SEEDER_ID,
      metadata: {
        isDefault: true,
        topics: DEFAULT_TOPICS,
        neuralInstanceId
      }
    });
  }
}

async function seedDefaultTopics(db) {
  for (const entry of DEFAULT_TOPIC_SEEDS) {
    for (const url of entry.urls) {
      await db.query(
        `INSERT INTO url_seeds (seeder_service_id, url, priority, metadata, status)
         VALUES ($1, $2, $3, $4, 'pending')
         ON CONFLICT (seeder_service_id, url) DO NOTHING`,
        [
          DEFAULT_SEEDER_ID,
          url,
          7,
          JSON.stringify({ topic: entry.topic, source: 'default-bootstrap' })
        ]
      );
    }
  }
}
