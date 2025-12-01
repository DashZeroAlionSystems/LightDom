import CrawleeSeederIntegration from './crawlee-seeder-integration.js';
import CrawleeService from './crawlee-service.js';

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const DEFAULT_BUNDLE_ID = 'attribute_bundle_all';
const DEFAULT_CAMPAIGN_ID = 'attribute_campaign';

export default class AttributeCrawlerManager {
  constructor(db, options = {}) {
    this.db = db;
    this.crawleeService = options.crawleeService || new CrawleeService(db);
    this.seederIntegration =
      options.seederIntegration ||
      new CrawleeSeederIntegration(db, { crawleeService: this.crawleeService });
    this.defaultSeederId =
      options.defaultSeederId || process.env.CRAWLER_SEEDER_ID || 'default-topic-seeder';
    this.defaultCampaignId = options.defaultCampaignId || DEFAULT_CAMPAIGN_ID;
  }

  async ensureAttributeCampaign(options = {}) {
    const attributeNames = Array.isArray(options.attributes) ? options.attributes : null;
    const includeBundle = options.includeBundle !== false;
    const campaignId = options.campaignId || this.defaultCampaignId;
    const attributes = await this.loadAttributeDefinitions(attributeNames);

    if (attributes.length === 0) {
      return { ensured: [], bundle: null };
    }

    const ensured = [];

    for (const attribute of attributes) {
      const crawlerConfig = this.composeCrawlerConfig([attribute], {
        campaignId,
        seederServiceId: this.seederIdForAttribute(attribute.attribute_name),
        bundle: false,
      });
      await this.ensureSeedingService(crawlerConfig.seeder_service_id, {
        name: `Attribute Seeder: ${attribute.attribute_name}`,
        description: `Seeder queue for attribute ${attribute.attribute_name}`,
        payload: { attribute: attribute.attribute_name },
      });
      const action = await this.upsertCrawler(crawlerConfig);
      ensured.push({ attribute: attribute.attribute_name, crawlerId: crawlerConfig.id, action });
    }

    let bundleSummary = null;

    if (includeBundle) {
      const bundleId = options.bundleId || DEFAULT_BUNDLE_ID;
      const bundleConfig = this.composeCrawlerConfig(attributes, {
        campaignId,
        seederServiceId: this.seederIdForBundle(bundleId),
        bundle: true,
        bundleId,
      });
      await this.ensureSeedingService(bundleConfig.seeder_service_id, {
        name: 'Attribute Bundle Seeder',
        description: 'Seeder queue for bundled attribute crawler',
        payload: { bundle: bundleId, attributes: attributes.map(item => item.attribute_name) },
      });
      const action = await this.upsertCrawler(bundleConfig);
      bundleSummary = {
        crawlerId: bundleConfig.id,
        action,
        attributes: attributes.map(item => item.attribute_name),
      };
    }

    return { ensured, bundle: bundleSummary };
  }

  async seedFromCrawledSites(options = {}) {
    const attributeNames = Array.isArray(options.attributes) ? options.attributes : null;
    const includeBundle = options.includeBundle !== false;
    const limit = Number(options.limit || 200);
    const attributes = await this.loadAttributeDefinitions(attributeNames);

    if (attributes.length === 0) {
      return { totalUrls: 0, seeded: [] };
    }

    const seedsResult = await this.db.query(
      `SELECT url, domain, seo_quality_score, updated_at
         FROM crawled_sites
        WHERE url IS NOT NULL
        ORDER BY updated_at DESC NULLS LAST
        LIMIT $1`,
      [limit]
    );

    const campaignId = options.campaignId || this.defaultCampaignId;

    const urls = seedsResult.rows.map(row => ({
      url: row.url,
      priority: 5,
      metadata: {
        domain: row.domain,
        source: 'crawled_sites',
        seo_quality_score: row.seo_quality_score,
        updated_at: row.updated_at,
        campaignId,
      },
    }));

    const seededDetails = [];

    for (const attribute of attributes) {
      const seederId = this.seederIdForAttribute(attribute.attribute_name);
      await this.ensureSeedingService(seederId, {
        name: `Attribute Seeder: ${attribute.attribute_name}`,
        description: `Seeder queue for attribute ${attribute.attribute_name}`,
        payload: { attribute: attribute.attribute_name },
      });
      const response = await this.seederIntegration.addUrlsToSeeder(
        seederId,
        urls.map(entry => ({
          url: entry.url,
          priority: entry.priority,
          metadata: {
            ...entry.metadata,
            attribute: attribute.attribute_name,
            attributes: [attribute.attribute_name],
          },
        }))
      );
      seededDetails.push({
        attribute: attribute.attribute_name,
        seederId,
        inserted: response.count,
      });
    }

    if (includeBundle) {
      const bundleId = options.bundleId || DEFAULT_BUNDLE_ID;
      const seederId = this.seederIdForBundle(bundleId);
      await this.ensureSeedingService(seederId, {
        name: 'Attribute Bundle Seeder',
        description: 'Seeder queue for bundled attribute crawler',
        payload: { bundle: bundleId, attributes: attributes.map(item => item.attribute_name) },
      });
      const response = await this.seederIntegration.addUrlsToSeeder(
        seederId,
        urls.map(entry => ({
          url: entry.url,
          priority: entry.priority,
          metadata: {
            ...entry.metadata,
            bundle: bundleId,
            attributes: attributes.map(item => item.attribute_name),
          },
        }))
      );
      seededDetails.push({ bundle: true, seederId, inserted: response.count });
    }

    return { totalUrls: urls.length, seeded: seededDetails };
  }

  async startAttributeCampaign(options = {}) {
    const attributeNames = Array.isArray(options.attributes) ? options.attributes : null;
    const includeBundle = options.includeBundle !== false;
    const attributes = await this.loadAttributeDefinitions(attributeNames);

    if (attributes.length === 0) {
      return { started: [], bundle: null };
    }

    const started = [];
    for (const attribute of attributes) {
      const crawlerId = this.crawlerIdForAttribute(attribute.attribute_name);
      const result = await this.seederIntegration.startContinuousCrawling(crawlerId);
      started.push({ attribute: attribute.attribute_name, crawlerId, result });
    }

    let bundleResult = null;
    if (includeBundle) {
      const bundleId = options.bundleId || DEFAULT_BUNDLE_ID;
      const crawlerId = this.crawlerIdForBundle(bundleId);
      bundleResult = await this.seederIntegration.startContinuousCrawling(crawlerId);
    }

    return { started, bundle: bundleResult };
  }

  async getSeedSummary(options = {}) {
    const attributeNames = Array.isArray(options.attributes) ? options.attributes : null;
    const includeBundle = options.includeBundle !== false;
    const attributes = await this.loadAttributeDefinitions(attributeNames);

    const summary = [];
    for (const attribute of attributes) {
      const seederId = this.seederIdForAttribute(attribute.attribute_name);
      const stats = await this.seederIntegration.getSeederStats(seederId);
      summary.push({ attribute: attribute.attribute_name, seederId, stats });
    }

    let bundleSummary = null;
    if (includeBundle) {
      const bundleId = options.bundleId || DEFAULT_BUNDLE_ID;
      const seederId = this.seederIdForBundle(bundleId);
      const stats = await this.seederIntegration.getSeederStats(seederId);
      bundleSummary = { bundle: bundleId, seederId, stats };
    }

    return { attributes: summary, bundle: bundleSummary };
  }

  async loadAttributeDefinitions(attributeNames = null) {
    const params = [];
    let query = `
      SELECT ac.attribute_name, ac.config, ac.active,
             sac.category, sac.description, sac.priority
        FROM attribute_configurations ac
        LEFT JOIN seo_attributes_config sac
          ON sac.attribute_name = ac.attribute_name
       WHERE ac.active = true`;

    if (attributeNames && attributeNames.length > 0) {
      params.push(attributeNames);
      query += ` AND ac.attribute_name = ANY($${params.length})`;
    }

    query += ' ORDER BY COALESCE(sac.priority, 0) DESC, ac.attribute_name ASC';

    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      attribute_name: row.attribute_name,
      config: this.normalizeConfig(row.config),
      category: row.category,
      description: row.description,
      priority: row.priority,
    }));
  }

  normalizeConfig(config) {
    if (!config) {
      return {};
    }

    if (typeof config === 'object') {
      return config;
    }

    try {
      return JSON.parse(config);
    } catch (error) {
      console.warn('Failed to parse attribute configuration JSON:', error.message);
      return {};
    }
  }

  composeCrawlerConfig(attributes, options = {}) {
    const attributeNames = attributes.map(attr => attr.attribute_name);
    const isBundle = options.bundle === true;
    const primaryAttribute = attributeNames[0];
    const crawlerId = isBundle
      ? this.crawlerIdForBundle(options.bundleId || DEFAULT_BUNDLE_ID)
      : this.crawlerIdForAttribute(primaryAttribute);

    return {
      id: crawlerId,
      name: isBundle
        ? `Attribute Bundle: ${attributeNames.length} fields`
        : `Attribute: ${primaryAttribute}`,
      description: isBundle
        ? `Aggregated attribute crawler covering ${attributeNames.join(', ')}`
        : `Crawler for attribute ${primaryAttribute}`,
      type: 'cheerio',
      campaign_id: options.campaignId || this.defaultCampaignId,
      seeder_service_id: options.seederServiceId || this.defaultSeederId,
      config: {
        maxRequestsPerCrawl: 1000,
        maxConcurrency: options.maxConcurrency || 4,
        maxRequestRetries: 2,
        requestHandlerTimeoutSecs: 75,
      },
      metadata: {
        template: 'attribute-crawler',
        attribute: isBundle ? null : primaryAttribute,
        attributes: attributeNames,
        bundle: isBundle,
        campaignId: options.campaignId || this.defaultCampaignId,
        seeder_service_id: options.seederServiceId || this.defaultSeederId,
      },
      tags: isBundle ? ['attribute', 'bundle', 'campaign'] : ['attribute', primaryAttribute],
      request_handler: this.buildRequestHandler(attributes),
    };
  }

  buildRequestHandler(attributes) {
    const specPayload = attributes.map(attribute => {
      const config = attribute.config || {};
      return {
        name: attribute.attribute_name,
        selector: config.selector || null,
        attr: config.attr || config.attribute || null,
        type: config.type || 'string',
        delimiter: config.delimiter || null,
        defaultValue: config.defaultValue,
      };
    });

    const specsLiteral = JSON.stringify(specPayload);

    return `
return (async () => {
  const specs = ${specsLiteral};
  const requestMeta = request && request.userData ? request.userData : {};
  const metaAttributes = Array.isArray(requestMeta.attributes) && requestMeta.attributes.length
    ? requestMeta.attributes
    : specs.map(spec => spec.name);
  const primaryAttribute = requestMeta.attribute || (metaAttributes.length === 1 ? metaAttributes[0] : null);
  const cheerioApi = typeof $ === 'function' ? $ : null;
  const now = new Date().toISOString();

  const toNumber = value => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(String(value).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toBoolean = value => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === null || value === undefined) {
      return null;
    }
    const normalized = String(value).trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
      return false;
    }
    return null;
  };

  const getFromSelector = spec => {
    if (!cheerioApi || !spec.selector) {
      return null;
    }
    const element = cheerioApi(spec.selector).first();
    if (!element || element.length === 0) {
      return null;
    }
    if (spec.attr && element.attr(spec.attr)) {
      const candidate = element.attr(spec.attr).trim();
      if (candidate) {
        return candidate;
      }
    }
    const attrNames = ['content', 'href', 'src', 'alt', 'title', 'value'];
    for (const attributeName of attrNames) {
      const candidate = element.attr(attributeName);
      if (candidate && candidate.trim()) {
        return candidate.trim();
      }
    }
    const textValue = element.text().trim();
    return textValue || null;
  };

  const bodyText = (() => {
    if (cheerioApi) {
      const body = cheerioApi('body');
      if (body && body.length > 0) {
        return body.text() || '';
      }
    }
    if (typeof document !== 'undefined' && document.body) {
      return document.body.innerText || document.body.textContent || '';
    }
    return '';
  })();

  const result = {
    url: request?.url || (typeof location !== 'undefined' ? location.href : null),
    title: (() => {
      if (cheerioApi) {
        const titleNode = cheerioApi('title').first();
        const text = titleNode && titleNode.length > 0 ? titleNode.text().trim() : null;
        if (text) {
          return text;
        }
      }
      if (typeof document !== 'undefined' && document.title) {
        return document.title;
      }
      return null;
    })(),
    capturedAt: now,
    attributes: {},
    attributeContext: {
      primaryAttribute,
      attributes: metaAttributes,
      bundle: requestMeta.bundle || null,
      seeder: requestMeta.seeder_service_id || requestMeta.seederServiceId || null,
      campaignId: requestMeta.campaignId || null,
      userData: requestMeta,
    },
  };

  for (const spec of specs) {
    let value = getFromSelector(spec);

    if (value === null) {
      switch (spec.name) {
        case 'wordCount':
          value = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
          break;
        case 'paragraphCount':
          if (cheerioApi) {
            value = cheerioApi('p').length;
          } else if (typeof document !== 'undefined' && document.querySelectorAll) {
            value = document.querySelectorAll('p').length;
          }
          break;
        case 'isSecure':
          value = (result.url || '').startsWith('https://');
          break;
        default:
          break;
      }
    }

    if (spec.type === 'number') {
      value = toNumber(value);
    } else if (spec.type === 'boolean') {
      value = toBoolean(value);
    } else if (spec.type === 'array' && typeof value === 'string') {
      const delimiter = spec.delimiter || ',';
      value = value
        .split(delimiter)
        .map(entry => entry.trim())
        .filter(Boolean);
    }

    if ((value === null || value === undefined) && spec.defaultValue !== undefined) {
      value = spec.defaultValue;
    }

    result.attributes[spec.name] = value;
  }

  return result;
})();
`;
  }

  async upsertCrawler(config) {
    try {
      await this.crawleeService.getCrawler(config.id);
      await this.crawleeService.updateCrawler(config.id, {
        name: config.name,
        description: config.description,
        config: config.config,
        metadata: config.metadata,
        request_handler: config.request_handler,
        tags: config.tags,
        campaign_id: config.campaign_id,
        seeder_service_id: config.seeder_service_id,
      });
      return 'updated';
    } catch (error) {
      if (error && /crawler not found/i.test(error.message)) {
        await this.crawleeService.createCrawler(config);
        return 'created';
      }
      throw error;
    }
  }

  async ensureSeedingService(seederServiceId, options = {}) {
    await this.db.query(
      `INSERT INTO seeding_services (id, name, description, config, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         config = EXCLUDED.config,
         status = 'active',
         updated_at = NOW()`,
      [
        seederServiceId,
        options.name || seederServiceId,
        options.description || 'Automated attribute crawler seeding service',
        JSON.stringify(options.payload || {}),
      ]
    );
  }

  seederIdForAttribute(attributeName) {
    return `attribute:${slugify(attributeName)}`;
  }

  crawlerIdForAttribute(attributeName) {
    return `attribute_${slugify(attributeName)}`;
  }

  seederIdForBundle(bundleId) {
    const id = bundleId || DEFAULT_BUNDLE_ID;
    return `attribute-bundle:${slugify(id)}`;
  }

  crawlerIdForBundle(bundleId) {
    const id = bundleId || DEFAULT_BUNDLE_ID;
    return `attribute_bundle_${slugify(id)}`;
  }
}
