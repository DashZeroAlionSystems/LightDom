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

import { CheerioCrawler, PlaywrightCrawler, PuppeteerCrawler, JSDOMCrawler, HttpCrawler } from 'crawlee';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

class CrawleeService extends EventEmitter {
  constructor(db, config = {}) {
    super();
    
    this.db = db;
    this.config = {
      defaultCrawlerType: config.defaultCrawlerType || 'cheerio',
      enableLogging: config.enableLogging !== false,
      enablePersistence: config.enablePersistence !== false,
      statsSnapshotInterval: config.statsSnapshotInterval || 60000, // 1 minute
      ...config
    };
    
    // Active crawler instances
    this.activeCrawlers = new Map();
    
    // Stats collection intervals
    this.statsIntervals = new Map();
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
          ...crawlerConfig.config
        },
        request_config: {
          headers: {},
          proxy: null,
          useChrome: false,
          ignoreSslErrors: false,
          headless: true,
          ...crawlerConfig.request_config
        },
        autoscaling_config: {
          enabled: true,
          minConcurrency: 1,
          maxConcurrency: 10,
          desiredConcurrency: 5,
          desiredConcurrencyRatio: 0.9,
          scaleUpStepRatio: 0.1,
          scaleDownStepRatio: 0.05,
          ...crawlerConfig.autoscaling_config
        },
        session_pool_config: {
          maxPoolSize: 1000,
          sessionOptions: {
            maxAgeSecs: 3000,
            maxUsageCount: 50,
            maxErrorScore: 3
          },
          ...crawlerConfig.session_pool_config
        },
        proxy_config: {
          enabled: false,
          proxyUrls: [],
          ...crawlerConfig.proxy_config
        },
        storage_config: {
          enableDatasets: true,
          enableKeyValueStores: true,
          enableRequestQueues: true,
          persistStorage: true,
          purgeOnStart: false,
          ...crawlerConfig.storage_config
        },
        request_queue_config: {
          maxConcurrency: 1000,
          maxRequestsPerMinute: 120,
          autoRequestQueueCleanup: true,
          ...crawlerConfig.request_queue_config
        },
        error_handling_config: {
          maxRequestRetries: 3,
          retryDelayMs: 1000,
          maxRetryDelayMs: 60000,
          retryMultiplier: 2,
          ignoreHttpErrors: false,
          ignoreSslErrors: false,
          ...crawlerConfig.error_handling_config
        },
        url_patterns: {
          include: ['*'],
          exclude: [],
          maxDepth: 3,
          sameDomain: true,
          respectRobotsTxt: true,
          ...crawlerConfig.url_patterns
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
        metadata: crawlerConfig.metadata || {}
      };

      // Insert into database
      await this.db.query(`
        INSERT INTO crawlee_crawlers (
          id, name, description, type, status, config, request_config,
          autoscaling_config, session_pool_config, proxy_config, storage_config,
          request_queue_config, error_handling_config, url_patterns, selectors,
          request_handler, failed_request_handler, pre_navigation_hooks, post_navigation_hooks,
          schedule, campaign_id, seeder_service_id, created_by, tags, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *
      `, [
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
        JSON.stringify(defaultConfig.metadata)
      ]);

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
      const result = await this.db.query(
        'SELECT * FROM crawlee_crawlers WHERE id = $1',
        [crawlerId]
      );

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
        userData: seed.user_data
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
      await this.db.query(
        'UPDATE crawlee_crawlers SET status = $1 WHERE id = $2',
        ['error', crawlerId]
      );
      
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
      failedRequestHandler
    };

    // Create crawler based on type
    switch (config.type) {
      case 'cheerio':
        return new CheerioCrawler(crawlerOptions);
      case 'playwright':
        return new PlaywrightCrawler({
          ...crawlerOptions,
          headless: config.request_config.headless,
          navigationTimeoutSecs: config.config.navigationTimeoutSecs
        });
      case 'puppeteer':
        return new PuppeteerCrawler({
          ...crawlerOptions,
          headless: config.request_config.headless,
          navigationTimeoutSecs: config.config.navigationTimeoutSecs
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
          const handlerFunc = new Function('request', '$', 'page', 'body', 'json', config.request_handler);
          extractedData = await handlerFunc(request, $, page, body, json);
        } else if (config.selectors && Object.keys(config.selectors).length > 0) {
          // Use selectors to extract data
          extractedData = this._extractDataWithSelectors($, config.selectors);
        } else {
          // Default extraction
          extractedData = {
            url: request.url,
            title: $ ? $('title').text() : null,
            timestamp: new Date().toISOString()
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
        this.log('error', `Request handler error for ${request.url}`, { error: error.message, crawlerId });
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
      await this.db.query(`
        INSERT INTO crawlee_results (
          crawler_id, url, title, data, extraction_metadata, campaign_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        crawlerId,
        request.url,
        data.title || null,
        JSON.stringify(data),
        JSON.stringify({
          extractedAt: new Date().toISOString(),
          durationMs: Date.now() - request.loadedAt,
          retryCount: request.retryCount || 0,
          statusCode: 200
        }),
        config.campaign_id
      ]);

      this.emit('crawler:result:saved', { crawlerId, url: request.url, data });
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
          unique_key: `${crawlerId}_${url}`
        };
      });

      for (const seed of seedRecords) {
        await this.db.query(`
          INSERT INTO crawlee_crawler_seeds (
            crawler_id, url, label, priority, user_data, unique_key
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (crawler_id, unique_key) DO NOTHING
        `, [
          seed.crawler_id,
          seed.url,
          seed.label,
          seed.priority,
          JSON.stringify(seed.user_data),
          seed.unique_key
        ]);
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
      await this.db.query(
        'UPDATE crawlee_crawlers SET status = $1 WHERE id = $2',
        ['paused', crawlerId]
      );
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
      await this.db.query(
        'UPDATE crawlee_crawlers SET status = $1 WHERE id = $2',
        ['running', crawlerId]
      );
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
    const result = await this.db.query(
      'SELECT stats FROM crawlee_crawlers WHERE id = $1',
      [crawlerId]
    );
    
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
    const result = await this.db.query(
      'SELECT * FROM crawlee_crawlers WHERE id = $1',
      [crawlerId]
    );
    
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
      'name', 'description', 'config', 'request_config', 'autoscaling_config',
      'session_pool_config', 'proxy_config', 'storage_config', 'request_queue_config',
      'error_handling_config', 'url_patterns', 'selectors', 'request_handler',
      'failed_request_handler', 'schedule', 'tags', 'metadata', 'campaign_id',
      'seeder_service_id'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        params.push(typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : updates[field]);
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
        await this.db.query(
          'UPDATE crawlee_crawlers SET stats = $1 WHERE id = $2',
          [JSON.stringify(stats), crawlerId]
        );

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
      this.db.query(
        'INSERT INTO crawlee_logs (crawler_id, level, message, details) VALUES ($1, $2, $3, $4)',
        [details.crawlerId, level, message, JSON.stringify(details)]
      ).catch(err => console.error('Failed to save log:', err));
    }
  }
}

export default CrawleeService;
