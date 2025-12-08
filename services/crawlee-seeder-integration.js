/**
 * Crawlee Seeder Integration
 * Connects Crawlee crawlers with the URL seeder service
 */

import CrawleeService from './crawlee-service.js';

class CrawleeSeederIntegration {
  constructor(db, options = {}) {
    this.db = db;
    this.crawleeService = options.crawleeService || new CrawleeService(db);
    this.pollingTimers = new Map();
  }

  /**
   * Create a crawler that continuously pulls from a seeder service
   */
  async createSeededCrawler(config) {
    try {
      const {
        name,
        description,
        seeder_service_id,
        crawlerType = 'cheerio',
        selectors = {},
        batchSize = 10,
        pollInterval = 60000, // 1 minute
      } = config;

      console.log(`Creating seeded crawler for service: ${seeder_service_id}`);

      // Create the crawler
      const crawler = await this.crawleeService.createCrawler({
        name: name || `Seeded Crawler: ${seeder_service_id}`,
        description: description || 'Crawler fed by seeder service',
        type: crawlerType,
        seeder_service_id,
        selectors,
        config: {
          maxConcurrency: 5,
          maxRequestRetries: 3,
        },
        metadata: {
          batchSize,
          pollInterval,
          isSeeded: true,
        },
        tags: ['seeded', 'continuous'],
      });

      console.log(`✅ Seeded crawler created: ${crawler.id}`);
      return crawler;
    } catch (error) {
      console.error('Failed to create seeded crawler:', error);
      throw error;
    }
  }

  /**
   * Start continuous crawling from seeder service
   */
  async startContinuousCrawling(crawlerId) {
    try {
      const crawler = await this.crawleeService.getCrawler(crawlerId);

      if (!crawler.seeder_service_id) {
        throw new Error('Crawler is not configured with a seeder service');
      }

      console.log(`Starting continuous crawling for: ${crawlerId}`);

      // Set up polling for new seeds
      const batchSize = crawler.metadata?.batchSize || 10;
      const pollInterval = crawler.metadata?.pollInterval || 60000;

      if (this.pollingTimers.has(crawlerId)) {
        return { success: true, crawlerId, polling: true, message: 'polling already active' };
      }

      const scheduleNext = () => {
        const timer = setTimeout(() => {
          poll().catch(err => console.error('Error in seeder polling loop:', err));
        }, pollInterval);
        this.pollingTimers.set(crawlerId, timer);
      };

      const poll = async () => {
        try {
          // Get next batch of URLs from seeder service
          const seeds = await this.getNextSeedBatch(crawler.seeder_service_id, batchSize);

          if (seeds.length > 0) {
            console.log(`Adding ${seeds.length} seeds to crawler ${crawlerId}`);
            await this.crawleeService.addSeeds(crawlerId, seeds);

            // Start crawler if not already running
            const currentStatus = await this.getCrawlerStatus(crawlerId);
            if (currentStatus === 'idle') {
              await this.crawleeService.startCrawler(crawlerId);
            }
          }
        } catch (error) {
          console.error('Error in seeder polling:', error);
        } finally {
          scheduleNext();
        }
      };

      await poll();

      return { success: true, crawlerId, polling: true };
    } catch (error) {
      console.error('Failed to start continuous crawling:', error);
      throw error;
    }
  }

  /**
   * Get next batch of URLs from seeder service
   */
  async getNextSeedBatch(seederServiceId, batchSize) {
    try {
      // Check if seeding_services table exists and query it
      const result = await this.db.query(
        `
        SELECT url, priority, metadata
        FROM url_seeds
        WHERE seeder_service_id = $1
          AND status = 'pending'
        ORDER BY priority DESC, created_at ASC
        LIMIT $2
      `,
        [seederServiceId, batchSize]
      );

      // Mark as processing
      if (result.rows.length > 0) {
        const urls = result.rows.map(row => row.url);
        await this.db.query(
          `
          UPDATE url_seeds
          SET status = 'processing', updated_at = NOW()
          WHERE seeder_service_id = $1
            AND url = ANY($2::text[])
        `,
          [seederServiceId, urls]
        );
      }

      return result.rows.map(row => {
        const metadata = row.metadata || {};
        return {
          url: row.url,
          priority: row.priority || 0,
          userData: {
            ...metadata,
            seeder_service_id: metadata.seeder_service_id || seederServiceId,
          },
        };
      });
    } catch (error) {
      console.error('Failed to get seed batch:', error);
      return [];
    }
  }

  /**
   * Get crawler status
   */
  async getCrawlerStatus(crawlerId) {
    try {
      const result = await this.db.query('SELECT status FROM crawlee_crawlers WHERE id = $1', [
        crawlerId,
      ]);
      return result.rows[0]?.status || 'idle';
    } catch (error) {
      console.error('Failed to get crawler status:', error);
      return 'unknown';
    }
  }

  /**
   * Mark seed as completed
   */
  async markSeedCompleted(seederServiceId, url, success = true) {
    try {
      await this.db.query(
        `
        UPDATE url_seeds
        SET status = $1, completed_at = NOW()
        WHERE seeder_service_id = $2 AND url = $3
      `,
        [success ? 'completed' : 'failed', seederServiceId, url]
      );
    } catch (error) {
      console.error('Failed to mark seed as completed:', error);
    }
  }

  /**
   * Get seeder service stats
   */
  async getSeederStats(seederServiceId) {
    try {
      const result = await this.db.query(
        `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'processing') as processing,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          COUNT(*) as total
        FROM url_seeds
        WHERE seeder_service_id = $1
      `,
        [seederServiceId]
      );

      return (
        result.rows[0] || {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          total: 0,
        }
      );
    } catch (error) {
      console.error('Failed to get seeder stats:', error);
      return null;
    }
  }

  /**
   * Add URLs to seeder service
   */
  async addUrlsToSeeder(seederServiceId, urls) {
    try {
      console.log(`Adding ${urls.length} URLs to seeder: ${seederServiceId}`);

      for (const url of urls) {
        const urlStr = typeof url === 'string' ? url : url.url;
        const priority = typeof url === 'object' ? url.priority : 5;
        const metadata = typeof url === 'object' ? url.metadata || {} : {};
        const payload = {
          ...metadata,
          seeder_service_id: metadata.seeder_service_id || seederServiceId,
        };

        await this.db.query(
          `
          INSERT INTO url_seeds (seeder_service_id, url, priority, metadata, status)
          VALUES ($1, $2, $3, $4, 'pending')
          ON CONFLICT (seeder_service_id, url) DO NOTHING
        `,
          [seederServiceId, urlStr, priority, JSON.stringify(payload)]
        );
      }

      console.log(`✅ URLs added to seeder service`);
      return { success: true, count: urls.length };
    } catch (error) {
      console.error('Failed to add URLs to seeder:', error);
      throw error;
    }
  }

  /**
   * Ensure seeder schema exists
   */
  async ensureSeederSchema() {
    try {
      // Create url_seeds table if not exists
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS url_seeds (
          id SERIAL PRIMARY KEY,
          seeder_service_id VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          priority INTEGER DEFAULT 5,
          metadata JSONB DEFAULT '{}'::jsonb,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          UNIQUE(seeder_service_id, url)
        );

        CREATE INDEX IF NOT EXISTS idx_url_seeds_seeder ON url_seeds(seeder_service_id);
        CREATE INDEX IF NOT EXISTS idx_url_seeds_status ON url_seeds(status);
        CREATE INDEX IF NOT EXISTS idx_url_seeds_priority ON url_seeds(priority DESC);
      `);

      // Create seeding_services table if not exists
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS seeding_services (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          config JSONB DEFAULT '{}'::jsonb,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ Seeder schema verified');
    } catch (error) {
      console.error('Failed to ensure seeder schema:', error);
    }
  }

  stopContinuousCrawling(crawlerId) {
    const timer = this.pollingTimers.get(crawlerId);
    if (timer) {
      clearTimeout(timer);
      this.pollingTimers.delete(crawlerId);
      console.log(`Stopped continuous crawling for: ${crawlerId}`);
    }
  }

  /**
   * Listen to crawler results and update seeder status
   */
  setupResultListeners() {
    this.crawleeService.on('crawler:result:saved', async data => {
      const { crawlerId, url } = data;

      // Get crawler
      const crawler = await this.crawleeService.getCrawler(crawlerId);

      if (crawler.seeder_service_id) {
        await this.markSeedCompleted(crawler.seeder_service_id, url, true);
      }
    });

    this.crawleeService.on('crawler:page:failed', async data => {
      const { crawlerId, url } = data;

      // Get crawler
      const crawler = await this.crawleeService.getCrawler(crawlerId);

      if (crawler.seeder_service_id) {
        await this.markSeedCompleted(crawler.seeder_service_id, url, false);
      }
    });
  }
}

export default CrawleeSeederIntegration;
