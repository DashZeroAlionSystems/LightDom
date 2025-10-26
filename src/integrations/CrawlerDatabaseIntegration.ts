/**
 * Crawler Database Integration
 * Connects RealWebCrawlerSystem with CrawlerDatabaseService
 * to persist crawl results to PostgreSQL
 */

import { crawlerDatabaseService } from '../services/CrawlerDatabaseService';

export class CrawlerDatabaseIntegration {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await crawlerDatabaseService.initialize();
      this.initialized = true;
      console.log('✅ Crawler Database Integration initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Crawler Database Integration:', error);
      throw error;
    }
  }

  /**
   * Callback for RealWebCrawlerSystem to save crawl results
   * This should be passed as onOptimization callback to the crawler
   */
  async saveCrawlResult(data: { url: string; analysis: any; result: any }) {
    try {
      const { url, analysis, result } = data;

      // Transform crawler result to match database schema
      const crawlResult = {
        url: result.url,
        domain: new URL(result.url).hostname,
        timestamp: result.timestamp,
        spaceSaved: result.spaceSaved || 0,
        optimizations: result.optimizations || [],
        domStats: result.domStats || {
          totalElements: 0,
          unusedElements: 0,
          deadCSS: 0,
          orphanedJS: 0
        },
        performance: result.performance || {
          loadTime: 0,
          memoryUsage: 0,
          domNodes: 0
        },
        schemas: result.schemas || [],
        backlinks: result.backlinks || [],
        merkleRoot: result.merkleRoot,
        merkleProof: result.merkleProof,
        crawlId: result.crawlId
      };

      // Save to database
      const optimizationId = await crawlerDatabaseService.saveCrawlResult(crawlResult);

      console.log(`💾 Saved crawl result to database: ${url} (ID: ${optimizationId})`);

      return { success: true, optimizationId };

    } catch (error) {
      console.error('Failed to save crawl result:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a crawler worker in the database
   */
  async registerCrawler(crawlerId: string, specialization: string = 'general') {
    try {
      await crawlerDatabaseService.registerCrawler(crawlerId, specialization);
      console.log(`📝 Registered crawler: ${crawlerId}`);
    } catch (error) {
      console.error('Failed to register crawler:', error);
    }
  }

  /**
   * Update crawler worker status
   */
  async updateCrawlerStatus(
    crawlerId: string,
    status: string,
    currentUrl?: string,
    stats?: {
      pagesProcessed?: number;
      spaceHarvested?: number;
      pagesPerSecond?: number;
      efficiency?: number;
    }
  ) {
    try {
      await crawlerDatabaseService.updateCrawlerStatus(crawlerId, status, currentUrl, stats);
    } catch (error) {
      console.error('Failed to update crawler status:', error);
    }
  }

  /**
   * Add URL to crawl queue
   */
  async addToCrawlQueue(url: string, priority: number = 5) {
    try {
      const domain = new URL(url).hostname;
      await crawlerDatabaseService.saveCrawlTarget(url, domain, priority);
      console.log(`➕ Added to crawl queue: ${url} (priority: ${priority})`);
    } catch (error) {
      console.error('Failed to add to crawl queue:', error);
    }
  }

  /**
   * Get pending crawl targets from database
   */
  async getPendingTargets(limit: number = 100) {
    try {
      await crawlerDatabaseService.initialize();
      const { databaseIntegration } = await import('../services/DatabaseIntegration.js');

      const result = await databaseIntegration.query(
        `SELECT * FROM crawl_targets
         WHERE status = 'pending'
         ORDER BY priority DESC, discovered_at ASC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get pending targets:', error);
      return [];
    }
  }

  /**
   * Get crawler statistics
   */
  async getStats() {
    try {
      const stats = await crawlerDatabaseService.getCrawlerStats();
      return stats;
    } catch (error) {
      console.error('Failed to get crawler stats:', error);
      return null;
    }
  }
}

// Export singleton
export const crawlerDatabaseIntegration = new CrawlerDatabaseIntegration();

/**
 * Helper function to create a crawler with database integration
 */
export function createDatabaseIntegratedCrawler(RealWebCrawlerSystem: any, config: any = {}) {
  // Initialize integration
  crawlerDatabaseIntegration.initialize().catch(console.error);

  // Create crawler with database callback
  const crawler = new RealWebCrawlerSystem({
    ...config,
    // Add callback to save results to database
    onOptimization: async (data: any) => {
      await crawlerDatabaseIntegration.saveCrawlResult(data);
    }
  });

  return crawler;
}
