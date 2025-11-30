/**
 * Crawlee Service - Highly Configurable Web Crawling Service
 *
 * This service provides a comprehensive wrapper around Crawlee that:
 * - Supports multiple crawler types (Cheerio, Playwright, Puppeteer, JSDOM, HTTP)
 * - Integrates with campaign and seeder services
 * - Persists all data to database
 * - Provides real-time monitoring and statistics
 * - Allows 24/7 continuous crawling
 * - Supports advanced configuration options
 */

import {
  CheerioCrawler,
  HttpCrawler,
  JSDOMCrawler,
  PlaywrightCrawler,
  PuppeteerCrawler,
} from 'crawlee';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import CrawlerNeuralIntegration from './crawler-neural-integration.js';

class CrawleeService extends EventEmitter {
  constructor(db, config = {}) {
    super();

    this.db = db;
    this.config = {
      defaultCrawlerType: config.defaultCrawlerType || 'cheerio',
      enableLogging: config.enableLogging !== false,
      enablePersistence: config.enablePersistence !== false,
      statsSnapshotInterval: config.statsSnapshotInterval || 60000, // 1 minute
      enableNeuralIntegration: config.enableNeuralIntegration !== false,
      ...config,
    };

    // Active crawler instances
    this.activeCrawlers = new Map();

    // Stats collection intervals
    this.statsIntervals = new Map();

    // Neural integration
    this.neuralIntegration = null;
    this.neuralInitPromise = null;
    this.neuralIntegrationDisabled = false;
  }

  /**
   * Create a new Crawlee crawler instance
   */
  async createCrawler(crawlerConfig) {
    try {
      const crawlerId = crawlerConfig.id || `crawler_${Date.now()}_${randomUUID()}`;

      // Default configuration
      const defaultConfig = {
        id: crawlerId,
        name: crawlerConfig.name || 'Unnamed Crawler',
        description: crawlerConfig.description || '',
        type: crawlerConfig.type || this.config.defaultCrawlerType,
        status: 'idle',
        config: {
          maxRequestsPerCrawl: 1000,
          maxConcurrency: 10,
          minConcurrency: 1,
          maxRequestRetries: 3,
          requestHandlerTimeoutSecs: 60,
          navigationTimeoutSecs: 60,
          keepAlive: true,
          useSessionPool: true,
          persistCookiesPerSession: true,
          ...crawlerConfig.config,
        },
        request_config: {
          headers: {},
          proxy: null,
          useChrome: false,
          ignoreSslErrors: false,
          headless: true,
          ...crawlerConfig.request_config,
        },
        autoscaling_config: {
          enabled: true,
          minConcurrency: 1,
          maxConcurrency: 10,
          desiredConcurrency: 5,
          desiredConcurrencyRatio: 0.9,
          scaleUpStepRatio: 0.1,
          scaleDownStepRatio: 0.05,
          ...crawlerConfig.autoscaling_config,
        },
        session_pool_config: {
          maxPoolSize: 1000,
          sessionOptions: {
            maxAgeSecs: 3000,
            maxUsageCount: 50,
            maxErrorScore: 3,
          },
          ...crawlerConfig.session_pool_config,
        },
        proxy_config: {
          enabled: false,
          proxyUrls: [],
          ...crawlerConfig.proxy_config,
        },
        storage_config: {
          enableDatasets: true,
          enableKeyValueStores: true,
          enableRequestQueues: true,
          persistStorage: true,
          purgeOnStart: false,
          ...crawlerConfig.storage_config,
        },
        request_queue_config: {
          maxConcurrency: 1000,
          maxRequestsPerMinute: 120,
          autoRequestQueueCleanup: true,
          ...crawlerConfig.request_queue_config,
        },
        error_handling_config: {
          maxRequestRetries: 3,
          retryDelayMs: 1000,
          maxRetryDelayMs: 60000,
          retryMultiplier: 2,
          ignoreHttpErrors: false,
          ignoreSslErrors: false,
          ...crawlerConfig.error_handling_config,
        },
        url_patterns: {
          include: ['*'],
          exclude: [],
          maxDepth: 3,
          sameDomain: true,
          respectRobotsTxt: true,
          ...crawlerConfig.url_patterns,
        },
        selectors: crawlerConfig.selectors || {},
        request_handler: crawlerConfig.request_handler || null,
        failed_request_handler: crawlerConfig.failed_request_handler || null,
        pre_navigation_hooks: crawlerConfig.pre_navigation_hooks || [],
        post_navigation_hooks: crawlerConfig.post_navigation_hooks || [],
        schedule: crawlerConfig.schedule || null,
        campaign_id: crawlerConfig.campaign_id || null,
        seeder_service_id: crawlerConfig.seeder_service_id || null,
        created_by: crawlerConfig.created_by || null,
        tags: crawlerConfig.tags || [],
        metadata: crawlerConfig.metadata || {},
      };

      // Insert into database
      await this.db.query(
        `
        INSERT INTO crawlee_crawlers (
          id, name, description, type, status, config, request_config,
          autoscaling_config, session_pool_config, proxy_config, storage_config,
          request_queue_config, error_handling_config, url_patterns, selectors,
          request_handler, failed_request_handler, pre_navigation_hooks, post_navigation_hooks,
          schedule, campaign_id, seeder_service_id, created_by, tags, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *
      `,
        [
          defaultConfig.id,
          defaultConfig.name,
          defaultConfig.description,
          defaultConfig.type,
          defaultConfig.status,
          JSON.stringify(defaultConfig.config),
          JSON.stringify(defaultConfig.request_config),
          JSON.stringify(defaultConfig.autoscaling_config),
          JSON.stringify(defaultConfig.session_pool_config),
          JSON.stringify(defaultConfig.proxy_config),
          JSON.stringify(defaultConfig.storage_config),
          JSON.stringify(defaultConfig.request_queue_config),
          JSON.stringify(defaultConfig.error_handling_config),
          JSON.stringify(defaultConfig.url_patterns),
          JSON.stringify(defaultConfig.selectors),
          defaultConfig.request_handler,
          defaultConfig.failed_request_handler,
          defaultConfig.pre_navigation_hooks,
          defaultConfig.post_navigation_hooks,
          defaultConfig.schedule ? JSON.stringify(defaultConfig.schedule) : null,
          defaultConfig.campaign_id,
          defaultConfig.seeder_service_id,
          defaultConfig.created_by,
          JSON.stringify(defaultConfig.tags),
          JSON.stringify(defaultConfig.metadata),
        ]
      );

      this.log('info', `Crawler created: ${crawlerId}`, { crawlerId });
      this.emit('crawler:created', { crawlerId, config: defaultConfig });

      return defaultConfig;
    } catch (error) {
      this.log('error', 'Failed to create crawler', { error: error.message });
      throw error;
    }
  }

  /**
   * Start a crawler instance
   */
  async startCrawler(crawlerId, seedUrls = []) {
    try {
      // Get crawler configuration from database
      const result = await this.db.query('SELECT * FROM crawlee_crawlers WHERE id = $1', [
        crawlerId,
      ]);

      if (result.rows.length === 0) {
        throw new Error(`Crawler not found: ${crawlerId}`);
      }

      const crawlerConfig = result.rows[0];

      // Check if already running
      if (this.activeCrawlers.has(crawlerId)) {
        throw new Error(`Crawler already running: ${crawlerId}`);
      }

      // Create the appropriate crawler instance based on type
      const crawler = await this._createCrawlerInstance(crawlerId, crawlerConfig);

      // Add seed URLs
      if (seedUrls.length > 0) {
        await this.addSeeds(crawlerId, seedUrls);
      }

      // Get seeds from database
      const seedsResult = await this.db.query(
        'SELECT * FROM crawlee_crawler_seeds WHERE crawler_id = $1 AND status = $2 ORDER BY priority DESC',
        [crawlerId, 'pending']
      );

      const seeds = seedsResult.rows.map(seed => ({
        url: seed.url,
        label: seed.label,
        userData: seed.user_data,
      }));

      // Update status to running
      await this.db.query(
        'UPDATE crawlee_crawlers SET status = $1, started_at = $2, last_run_at = $3 WHERE id = $4',
        ['running', new Date(), new Date(), crawlerId]
      );

      // Store active crawler
      this.activeCrawlers.set(crawlerId, crawler);

      // Start stats collection
      this._startStatsCollection(crawlerId);

      // Run the crawler
      await crawler.run(seeds);

      // Update status to completed
      await this.db.query(
        'UPDATE crawlee_crawlers SET status = $1, finished_at = $2 WHERE id = $3',
        ['completed', new Date(), crawlerId]
      );

      this.log('info', `Crawler completed: ${crawlerId}`, { crawlerId });
      this.emit('crawler:completed', { crawlerId });

      // Cleanup
      this.activeCrawlers.delete(crawlerId);
      this._stopStatsCollection(crawlerId);

      return { success: true, crawlerId };
    } catch (error) {
      await this.db.query('UPDATE crawlee_crawlers SET status = $1 WHERE id = $2', [
        'error',
        crawlerId,
      ]);

      this.log('error', `Crawler failed: ${crawlerId}`, { error: error.message });
      this.emit('crawler:error', { crawlerId, error: error.message });

      throw error;
    }
  }

  /**
   * Create the appropriate Crawlee crawler instance
   */
  async _createCrawlerInstance(crawlerId, config) {
    const requestHandler = this._createRequestHandler(crawlerId, config);
    const failedRequestHandler = this._createFailedRequestHandler(crawlerId, config);

    const crawlerOptions = {
      maxRequestsPerCrawl: config.config.maxRequestsPerCrawl,
      maxConcurrency: config.config.maxConcurrency,
      minConcurrency: config.config.minConcurrency,
      maxRequestRetries: config.config.maxRequestRetries,
      requestHandlerTimeoutSecs: config.config.requestHandlerTimeoutSecs,
      requestHandler,
      failedRequestHandler,
    };

    // Create crawler based on type
    switch (config.type) {
      case 'cheerio':
        return new CheerioCrawler(crawlerOptions);
      case 'playwright':
        return new PlaywrightCrawler({
          ...crawlerOptions,
          headless: config.request_config.headless,
          navigationTimeoutSecs: config.config.navigationTimeoutSecs,
        });
      case 'puppeteer':
        return new PuppeteerCrawler({
          ...crawlerOptions,
          headless: config.request_config.headless,
          navigationTimeoutSecs: config.config.navigationTimeoutSecs,
        });
      case 'jsdom':
        return new JSDOMCrawler(crawlerOptions);
      case 'http':
        return new HttpCrawler(crawlerOptions);
      default:
        throw new Error(`Unsupported crawler type: ${config.type}`);
    }
  }

  /**
   * Create request handler function
   */
  _createRequestHandler(crawlerId, config) {
    return async ({ request, $, page, body, json }) => {
      try {
        let extractedData = {};

        // Use custom request handler if provided
        if (config.request_handler) {
          // Execute custom handler (eval with context)
          const handlerFunc = new Function(
            'request',
            '$',
            'page',
            'body',
            'json',
            config.request_handler
          );
          extractedData = await handlerFunc(request, $, page, body, json);
        } else if (config.selectors && Object.keys(config.selectors).length > 0) {
          // Use selectors to extract data
          extractedData = this._extractDataWithSelectors($, config.selectors);
        } else {
          // Default extraction
          extractedData = {
            url: request.url,
            title: $ ? $('title').text() : null,
            timestamp: new Date().toISOString(),
          };
        }

        // Save to database
        await this._saveResult(crawlerId, request, extractedData, config);

        // Update seed status
        await this.db.query(
          'UPDATE crawlee_crawler_seeds SET status = $1, crawled_at = $2 WHERE crawler_id = $3 AND url = $4',
          ['crawled', new Date(), crawlerId, request.url]
        );

        // Enqueue new URLs if needed
        if ($ && config.url_patterns.maxDepth > (request.userData.depth || 0)) {
          await this._enqueueNewUrls($, request, config);
        }

        this.emit('crawler:page:success', { crawlerId, url: request.url });
      } catch (error) {
        this.log('error', `Request handler error for ${request.url}`, {
          error: error.message,
          crawlerId,
        });
        throw error;
      }
    };
  }

  /**
   * Create failed request handler
   */
  _createFailedRequestHandler(crawlerId, config) {
    return async ({ request, error }) => {
      this.log('error', `Request failed: ${request.url}`, { error: error.message, crawlerId });

      // Update seed status
      await this.db.query(
        'UPDATE crawlee_crawler_seeds SET status = $1, error_message = $2 WHERE crawler_id = $3 AND url = $4',
        ['failed', error.message, crawlerId, request.url]
      );

      this.emit('crawler:page:failed', { crawlerId, url: request.url, error: error.message });
    };
  }

  /**
   * Extract data using selectors
   */
  _extractDataWithSelectors($, selectors) {
    const data = {};

    for (const [key, selector] of Object.entries(selectors)) {
      try {
        if (typeof selector === 'string') {
          data[key] = $(selector).text().trim();
        } else if (selector.selector) {
          const element = $(selector.selector);
          if (selector.attribute) {
            data[key] = element.attr(selector.attribute);
          } else if (selector.multiple) {
            data[key] = element.map((i, el) => $(el).text().trim()).get();
          } else {
            data[key] = element.text().trim();
          }
        }
      } catch (error) {
        this.log('warning', `Failed to extract ${key}`, { selector, error: error.message });
        data[key] = null;
      }
    }

    return data;
  }

  /**
   * Save result to database
   */
  async _saveResult(crawlerId, request, data, config) {
    try {
      const loadedAt = typeof request.loadedAt === 'number' ? request.loadedAt : null;
      const durationMs = loadedAt !== null ? Math.max(0, Date.now() - loadedAt) : 0;

      const insertResult = await this.db.query(
        `
        INSERT INTO crawlee_results (
          crawler_id, url, title, data, extraction_metadata, campaign_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
        [
          crawlerId,
          request.url,
          data.title || null,
          JSON.stringify(data),
          JSON.stringify({
            extractedAt: new Date().toISOString(),
            durationMs,
            retryCount: request.retryCount || 0,
            statusCode: 200,
          }),
          config.campaign_id,
        ]
      );

      const resultId = insertResult.rows[0]?.id || null;

      this.emit('crawler:result:saved', { crawlerId, url: request.url, data });

      if (resultId) {
        await this._persistAttributeResults({ crawlerId, request, data, config, resultId });
      }

      if (resultId) {
        await this._processNeuralAnalysis(crawlerId, resultId, request, data, config);
      }
    } catch (error) {
      this.log('error', 'Failed to save result', { error: error.message, crawlerId });
    }
  }

  /**
   * Enqueue new URLs found on the page
   */
  async _enqueueNewUrls($, request, config) {
    // Implementation would extract links and add them to the queue
    // This is a simplified version
  }

  /**
   * Add seeds to a crawler
   */
  async addSeeds(crawlerId, seeds) {
    try {
      const seedRecords = seeds.map(seed => {
        const url = typeof seed === 'string' ? seed : seed.url;
        const label = typeof seed === 'object' ? seed.label : null;
        const priority = typeof seed === 'object' ? seed.priority : 0;
        const userData = typeof seed === 'object' ? seed.userData : {};

        return {
          crawler_id: crawlerId,
          url,
          label,
          priority,
          user_data: userData,
          unique_key: `${crawlerId}_${url}`,
        };
      });

      for (const seed of seedRecords) {
        await this.db.query(
          `
          INSERT INTO crawlee_crawler_seeds (
            crawler_id, url, label, priority, user_data, unique_key
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (crawler_id, unique_key) DO NOTHING
        `,
          [
            seed.crawler_id,
            seed.url,
            seed.label,
            seed.priority,
            JSON.stringify(seed.user_data),
            seed.unique_key,
          ]
        );
      }

      this.log('info', `Added ${seedRecords.length} seeds to crawler ${crawlerId}`);
      return { success: true, count: seedRecords.length };
    } catch (error) {
      this.log('error', 'Failed to add seeds', { error: error.message, crawlerId });
      throw error;
    }
  }

  /**
   * Pause a crawler
   */
  async pauseCrawler(crawlerId) {
    const crawler = this.activeCrawlers.get(crawlerId);
    if (crawler) {
      await crawler.autoscaledPool?.pause();
      await this.db.query('UPDATE crawlee_crawlers SET status = $1 WHERE id = $2', [
        'paused',
        crawlerId,
      ]);
      this.emit('crawler:paused', { crawlerId });
    }
  }

  /**
   * Resume a crawler
   */
  async resumeCrawler(crawlerId) {
    const crawler = this.activeCrawlers.get(crawlerId);
    if (crawler) {
      await crawler.autoscaledPool?.resume();
      await this.db.query('UPDATE crawlee_crawlers SET status = $1 WHERE id = $2', [
        'running',
        crawlerId,
      ]);
      this.emit('crawler:resumed', { crawlerId });
    }
  }

  /**
   * Stop a crawler
   */
  async stopCrawler(crawlerId) {
    const crawler = this.activeCrawlers.get(crawlerId);
    if (crawler) {
      await crawler.autoscaledPool?.abort();
      await this.db.query(
        'UPDATE crawlee_crawlers SET status = $1, finished_at = $2 WHERE id = $3',
        ['idle', new Date(), crawlerId]
      );
      this.activeCrawlers.delete(crawlerId);
      this._stopStatsCollection(crawlerId);
      this.emit('crawler:stopped', { crawlerId });
    }
  }

  /**
   * Get crawler statistics
   */
  async getCrawlerStats(crawlerId) {
    const result = await this.db.query('SELECT stats FROM crawlee_crawlers WHERE id = $1', [
      crawlerId,
    ]);

    if (result.rows.length === 0) {
      throw new Error(`Crawler not found: ${crawlerId}`);
    }

    return result.rows[0].stats;
  }

  /**
   * List all crawlers
   */
  async listCrawlers(filters = {}) {
    let query = 'SELECT * FROM crawlee_crawlers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.campaign_id) {
      query += ` AND campaign_id = $${paramCount}`;
      params.push(filters.campaign_id);
      paramCount++;
    }

    if (filters.type) {
      query += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Get crawler details
   */
  async getCrawler(crawlerId) {
    const result = await this.db.query('SELECT * FROM crawlee_crawlers WHERE id = $1', [crawlerId]);

    if (result.rows.length === 0) {
      throw new Error(`Crawler not found: ${crawlerId}`);
    }

    return result.rows[0];
  }

  /**
   * Update crawler configuration
   */
  async updateCrawler(crawlerId, updates) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    const allowedFields = [
      'name',
      'description',
      'config',
      'request_config',
      'autoscaling_config',
      'session_pool_config',
      'proxy_config',
      'storage_config',
      'request_queue_config',
      'error_handling_config',
      'url_patterns',
      'selectors',
      'request_handler',
      'failed_request_handler',
      'schedule',
      'tags',
      'metadata',
      'campaign_id',
      'seeder_service_id',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        params.push(
          typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : updates[field]
        );
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return { success: true };
    }

    fields.push(`updated_at = $${paramCount}`);
    params.push(new Date());
    paramCount++;

    params.push(crawlerId);

    await this.db.query(
      `UPDATE crawlee_crawlers SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      params
    );

    this.emit('crawler:updated', { crawlerId, updates });
    return { success: true };
  }

  /**
   * Delete a crawler
   */
  async deleteCrawler(crawlerId) {
    // Stop if running
    if (this.activeCrawlers.has(crawlerId)) {
      await this.stopCrawler(crawlerId);
    }

    await this.db.query('DELETE FROM crawlee_crawlers WHERE id = $1', [crawlerId]);
    this.emit('crawler:deleted', { crawlerId });
    return { success: true };
  }

  /**
   * Get results for a crawler
   */
  async getCrawlerResults(crawlerId, options = {}) {
    let query = 'SELECT * FROM crawlee_results WHERE crawler_id = $1';
    const params = [crawlerId];
    let paramCount = 2;

    if (options.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(options.limit);
      paramCount++;
    }

    if (options.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(options.offset);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Start collecting statistics
   */
  _startStatsCollection(crawlerId) {
    if (this.statsIntervals.has(crawlerId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const crawler = this.activeCrawlers.get(crawlerId);
        if (!crawler) {
          this._stopStatsCollection(crawlerId);
          return;
        }

        const stats = await crawler.getData();

        // Update stats in database
        await this.db.query('UPDATE crawlee_crawlers SET stats = $1 WHERE id = $2', [
          JSON.stringify(stats),
          crawlerId,
        ]);

        // Save snapshot
        await this.db.query(
          'INSERT INTO crawlee_stats_snapshots (crawler_id, stats) VALUES ($1, $2)',
          [crawlerId, JSON.stringify(stats)]
        );
      } catch (error) {
        this.log('error', 'Failed to collect stats', { error: error.message, crawlerId });
      }
    }, this.config.statsSnapshotInterval);

    this.statsIntervals.set(crawlerId, interval);
  }

  /**
   * Stop collecting statistics
   */
  _stopStatsCollection(crawlerId) {
    const interval = this.statsIntervals.get(crawlerId);
    if (interval) {
      clearInterval(interval);
      this.statsIntervals.delete(crawlerId);
    }
  }

  async _persistAttributeResults({ crawlerId, request, data, config, resultId }) {
    try {
      if (!data || typeof data !== 'object' || !data.attributes || !resultId) {
        return;
      }

      const entries = Object.entries(data.attributes).filter(([, value]) => value !== undefined);
      if (entries.length === 0) {
        return;
      }

      const requestUserData = request?.userData || {};
      const attributeContext = data.attributeContext || {};
      const campaignId =
        attributeContext.campaignId || requestUserData.campaignId || config?.campaign_id || null;
      const seederServiceId =
        attributeContext.seeder ||
        requestUserData.seeder_service_id ||
        requestUserData.seederServiceId ||
        config?.seeder_service_id ||
        config?.metadata?.seeder_service_id ||
        null;
      const bundleId = attributeContext.bundle || requestUserData.bundle || null;

      let storedCount = 0;

      for (const [attributeName, value] of entries) {
        const rawValue = value === undefined ? null : value;

        let stringValue = null;
        let numberValue = null;
        let booleanValue = null;
        let arrayValue = null;

        if (Array.isArray(rawValue)) {
          const normalizedArray = rawValue.map(item =>
            item === null || item === undefined ? null : String(item)
          );
          arrayValue = normalizedArray.some(item => item !== null) ? normalizedArray : null;
        } else if (rawValue === null) {
          // no-op
        } else if (typeof rawValue === 'number') {
          numberValue = Number.isFinite(rawValue) ? rawValue : null;
        } else if (typeof rawValue === 'boolean') {
          booleanValue = rawValue;
        } else if (typeof rawValue === 'object') {
          stringValue = JSON.stringify(rawValue);
        } else {
          stringValue = String(rawValue);
        }

        await this.db.query(
          `INSERT INTO crawler_attribute_results (
            result_id,
            crawler_id,
            seeder_service_id,
            campaign_id,
            url,
            attribute_name,
            raw_value,
            string_value,
            number_value,
            boolean_value,
            array_value,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT DO NOTHING`,
          [
            resultId,
            crawlerId,
            seederServiceId,
            campaignId,
            request?.url || null,
            attributeName,
            JSON.stringify(rawValue),
            stringValue,
            numberValue,
            booleanValue,
            arrayValue,
            JSON.stringify({
              attributeContext,
              requestUserData,
              bundleId,
              crawlerMetadata: config?.metadata || null,
            }),
          ]
        );

        storedCount += 1;
      }

      if (storedCount > 0) {
        const attributeSummary = entries.map(([name, value]) => ({
          name,
          hasValue: value !== null && value !== undefined,
          type: Array.isArray(value) ? 'array' : typeof value,
        }));

        this.log('info', 'Stored attribute extraction result', {
          crawlerId,
          url: request?.url || null,
          resultId,
          campaignId,
          seederServiceId,
          bundleId,
          attributeCount: storedCount,
          attributes: attributeSummary,
        });
      }
    } catch (error) {
      this.log('error', 'Failed to persist attribute results', {
        error: error.message,
        crawlerId,
        resultId,
      });
    }
  }

  async _processNeuralAnalysis(crawlerId, resultId, request, data, config) {
    if (!this.config.enableNeuralIntegration || this.neuralIntegrationDisabled) {
      return;
    }

    try {
      const integration = await this._ensureNeuralIntegration();
      if (!integration) {
        return;
      }

      const payload = this._buildNeuralPayload(request, data, config);
      if (!payload) {
        return;
      }

      const analysis = await integration.processCrawledPage(payload);
      analysis.metadata = {
        ...(analysis.metadata || {}),
        crawlerId,
        crawlerName: config?.name || null,
        resultId,
      };

      const analysisId = await integration.saveAnalysisResults(analysis);
      if (analysisId) {
        await this.db.query('UPDATE crawlee_results SET neural_analysis_id = $1 WHERE id = $2', [
          analysisId,
          resultId,
        ]);
      }

      await this._updateCrawledSiteNeuralData(request.url, analysis, data);
      await this._enqueueNeuralSeeds(config, analysis);
    } catch (error) {
      this.log('error', 'Neural analysis pipeline failed', {
        error: error.message,
        crawlerId,
        url: request.url,
      });
    }
  }

  async _ensureNeuralIntegration() {
    if (!this.config.enableNeuralIntegration || this.neuralIntegrationDisabled) {
      return null;
    }

    if (!this.neuralIntegration) {
      this.neuralIntegration = new CrawlerNeuralIntegration({ db: this.db });
      this.neuralInitPromise = null;
    }

    if (!this.neuralInitPromise) {
      this.neuralInitPromise = this.neuralIntegration
        .initialize()
        .then(() => true)
        .catch(error => {
          this.log('error', 'Unable to initialize neural integration', { error: error.message });
          this.neuralIntegration = null;
          this.neuralIntegrationDisabled = true;
          return false;
        });
    }

    const ready = await this.neuralInitPromise;
    if (!ready) {
      return null;
    }

    return this.neuralIntegration;
  }

  _buildNeuralPayload(request, data, config) {
    const url = request?.url;
    if (!url) {
      return null;
    }

    const textCandidates = [
      typeof data.content === 'string' ? data.content : null,
      typeof data.body === 'string' ? data.body : null,
      typeof data.text === 'string' ? data.text : null,
    ].filter(Boolean);

    let content = textCandidates.find(text => text && text.trim().length > 0) || '';

    const headings = [];
    if (Array.isArray(data.headings)) {
      data.headings.forEach(item => headings.push(String(item)));
    } else if (data.headings && typeof data.headings === 'object') {
      Object.values(data.headings).forEach(group => {
        if (Array.isArray(group)) {
          group.forEach(item => headings.push(String(item)));
        }
      });
    }

    const images = Array.isArray(data.images)
      ? data.images
          .slice(0, 12)
          .map(image => ({
            src: image?.src || image?.url || null,
            alt: image?.alt || '',
            title: image?.title || '',
          }))
          .filter(image => !!image.src)
      : [];

    const structuredData = Array.isArray(data.structuredData) ? data.structuredData : [];

    if (!content && (headings.length > 0 || structuredData.length > 0)) {
      content = headings.join(' ');
    }

    if (!content && images.length > 0) {
      content = images.map(img => img.alt || img.title || img.src).join(' ');
    }

    if (!content) {
      content = JSON.stringify(data).slice(0, 20000);
    }

    const attributes = this._deriveNeuralAttributes(url, data, content);

    return {
      url,
      title: data.title || null,
      metaDescription: data.description || data.metaDescription || null,
      content,
      headings,
      images,
      structuredData,
      attributes,
      metadata: {
        domStats: data?.metadata?.domStats || data?.domInfo || null,
        crawlerId: config?.id || null,
        campaignId: config?.campaign_id || null,
        seederServiceId: config?.seeder_service_id || null,
        topics: config?.metadata?.topics || [],
      },
    };
  }

  _deriveNeuralAttributes(url, data, content) {
    const attributes = {};

    try {
      const pathDepth = new URL(url).pathname.split('/').filter(Boolean).length;
      attributes.url_depth = pathDepth;
    } catch (error) {
      attributes.url_depth = 0;
    }

    const performance = data?.metadata?.performance || {};
    attributes.page_load_time =
      performance.loadTime || performance.pageLoadTime || performance.ttfb || null;

    const keywords = Array.isArray(data?.keywords)
      ? data.keywords
      : typeof data?.keywords === 'string'
        ? data.keywords
            .split(',')
            .map(kw => kw.trim())
            .filter(Boolean)
        : [];

    attributes.keyword_density = this._estimateKeywordDensity(content, keywords);

    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
    attributes.content_quality = Math.min(1, wordCount / 1800);

    if (Array.isArray(data?.links)) {
      attributes.link_volume = data.links.length;
    } else if (data?.links && typeof data.links === 'object') {
      const totals = Object.values(data.links)
        .filter(Array.isArray)
        .reduce((sum, arr) => sum + arr.length, 0);
      attributes.link_volume = totals;
    } else {
      attributes.link_volume = 0;
    }

    return attributes;
  }

  _estimateKeywordDensity(content, keywords) {
    if (!content) {
      return 0;
    }

    const tokens = content.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return 0;
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return Math.min(1, tokens.length / 1200);
    }

    const text = content.toLowerCase();
    let hits = 0;

    keywords.forEach(keyword => {
      const term = keyword?.toString().trim().toLowerCase();
      if (!term) {
        return;
      }
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');
      const matches = text.match(regex);
      hits += matches ? matches.length : 0;
    });

    return Math.min(1, hits / tokens.length);
  }

  _extractTopicsFromAnalysis(analysis) {
    const topics = new Set();

    const predicted = analysis?.predictions?.seo?.topRecommendations;
    if (Array.isArray(predicted)) {
      predicted.forEach(item => {
        if (item?.title) {
          topics.add(item.title);
        }
        if (Array.isArray(item?.keywords)) {
          item.keywords.forEach(keyword => topics.add(keyword));
        }
      });
    }

    const recs = Array.isArray(analysis?.recommendations) ? analysis.recommendations : [];
    recs.forEach(item => {
      if (item?.title) {
        topics.add(item.title);
      }
      if (item?.type) {
        topics.add(item.type);
      }
    });

    const metaTopics = analysis?.metadata?.topics;
    if (Array.isArray(metaTopics)) {
      metaTopics.forEach(topic => topics.add(topic));
    }

    return Array.from(topics)
      .map(value => (value && value.toString ? value.toString().trim() : ''))
      .filter(Boolean)
      .slice(0, 8);
  }

  async _enqueueNeuralSeeds(config, analysis) {
    const seederServiceId = config?.seeder_service_id;
    if (!seederServiceId) {
      return;
    }

    const topics = this._extractTopicsFromAnalysis(analysis);
    if (!topics.length) {
      return;
    }

    const seenUrls = new Set();
    const operations = [];

    topics.forEach(topic => {
      this._generateTopicSeedUrls(topic).forEach(url => {
        if (seenUrls.has(url)) {
          return;
        }
        seenUrls.add(url);
        operations.push(
          this.db
            .query(
              `INSERT INTO url_seeds (seeder_service_id, url, priority, metadata, status)
             VALUES ($1, $2, $3, $4, 'pending')
             ON CONFLICT (seeder_service_id, url) DO NOTHING`,
              [
                seederServiceId,
                url,
                5,
                JSON.stringify({
                  topic,
                  source: 'neural-analysis',
                  generatedAt: new Date().toISOString(),
                }),
              ]
            )
            .catch(error => {
              this.log('warning', 'Failed to enqueue neural seed', {
                error: error.message,
                url,
                crawlerId: config?.id,
              });
            })
        );
      });
    });

    if (operations.length > 0) {
      await Promise.all(operations);
    }
  }

  _generateTopicSeedUrls(topic) {
    const slug = this._slugifyTopic(topic);
    const clean = slug.replace(/-/g, '') || 'technology';

    return [
      `https://en.wikipedia.org/wiki/${slug}`,
      `https://medium.com/tag/${slug}`,
      `https://www.reddit.com/r/${clean}`,
      `https://github.com/topics/${slug}`,
      `https://dev.to/t/${slug}`,
    ];
  }

  _slugifyTopic(topic) {
    return (
      topic
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'web'
    );
  }

  async _updateCrawledSiteNeuralData(url, analysis, data) {
    try {
      const siteId = this._generateSiteId(url);
      const topics = this._extractTopicsFromAnalysis(analysis);
      const recommendations = Array.isArray(analysis?.recommendations)
        ? analysis.recommendations
        : [];
      const embeddings = analysis?.analyses?.embeddings || null;
      const domStats = data?.metadata?.domStats || data?.domInfo || null;
      const renderLayers = this._estimateRenderLayers(data);

      await this.db.query(
        `UPDATE crawled_sites
         SET neural_topics = COALESCE($2::jsonb, neural_topics),
             neural_recommendations = COALESCE($3::jsonb, neural_recommendations),
             neural_embeddings = COALESCE($4::jsonb, neural_embeddings),
             dom_paint_metrics = COALESCE($5::jsonb, dom_paint_metrics),
             render_layers = COALESCE($6::jsonb, render_layers),
             updated_at = NOW()
         WHERE id = $1`,
        [
          siteId,
          topics.length ? JSON.stringify(topics) : null,
          recommendations.length ? JSON.stringify(recommendations) : null,
          embeddings ? JSON.stringify(embeddings) : null,
          domStats ? JSON.stringify(domStats) : null,
          renderLayers ? JSON.stringify(renderLayers) : null,
        ]
      );
    } catch (error) {
      this.log('warning', 'Failed to apply neural data to crawled site', {
        error: error.message,
        url,
      });
    }
  }

  _estimateRenderLayers(data) {
    const stats = data?.metadata?.domStats || data?.domInfo;
    if (!stats) {
      return null;
    }

    const total = Number(stats.totalElements || stats.total_elements || 0);
    const scriptCount = Number(
      stats.scriptCount ?? stats.scripts ?? (Array.isArray(data?.scripts) ? data.scripts.length : 0)
    );
    const stylesheetCount = Number(
      stats.stylesheetCount ??
        stats.stylesheets ??
        (Array.isArray(data?.stylesheets) ? data.stylesheets.length : 0)
    );
    const mediaCount = Array.isArray(data?.images) ? data.images.length : 0;

    const structureCount = Math.max(0, total - scriptCount - stylesheetCount);

    return [
      { name: 'structure', elements: structureCount },
      { name: 'interaction', elements: scriptCount },
      { name: 'styling', elements: stylesheetCount },
      { name: 'media', elements: mediaCount },
    ];
  }

  _generateSiteId(url) {
    return Buffer.from(url)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Log message
   */
  log(level, message, details = {}) {
    if (!this.config.enableLogging) {
      return;
    }

    console[level]?.(`[CrawleeService] ${message}`, details);

    // Save to database if crawler_id is provided
    if (details.crawlerId) {
      this.db
        .query(
          'INSERT INTO crawlee_logs (crawler_id, level, message, details) VALUES ($1, $2, $3, $4)',
          [details.crawlerId, level, message, JSON.stringify(details)]
        )
        .catch(err => console.error('Failed to save log:', err));
    }
  }
}

export default CrawleeService;
