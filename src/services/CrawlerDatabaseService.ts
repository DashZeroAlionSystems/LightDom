/**
 * Crawler Database Service
 * Handles all database operations for the web crawler system
 * Integrates crawler results with PostgreSQL database
 */

import { databaseIntegration } from './DatabaseIntegration.js';

export interface CrawlResult {
  url: string;
  domain: string;
  timestamp: Date;
  spaceSaved: number;
  optimizations: Array<{
    type: string;
    count: number;
    potentialSavings: number;
    description: string;
  }>;
  domStats: {
    totalElements: number;
    unusedElements: number;
    deadCSS: number;
    orphanedJS: number;
  };
  performance: {
    loadTime: number;
    memoryUsage: number;
    domNodes: number;
  };
  schemas?: any[];
  backlinks?: any[];
  merkleRoot?: string;
  merkleProof?: string[];
  crawlId: string;
}

export interface DOMOptimizationRecord {
  url: string;
  spaceSavedBytes: number;
  tokensEarned: number;
  optimizationTypes: string[];
  crawlTimestamp: Date;
  performanceMetrics: any;
  optimizationProof: string;
  workerId?: string;
}

export class CrawlerDatabaseService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      await databaseIntegration.initialize();
      this.initialized = true;
      console.log('✅ Crawler Database Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Crawler Database Service:', error);
      throw error;
    }
  }

  /**
   * Save crawl target to database
   */
  async saveCrawlTarget(url: string, domain: string, priority: number = 5) {
    await this.initialize();

    try {
      const result = await databaseIntegration.query(
        `INSERT INTO crawl_targets (url, domain, priority, status, discovered_at, crawl_depth, retry_count)
         VALUES ($1, $2, $3, 'pending', NOW(), 0, 0)
         ON CONFLICT (url) DO UPDATE
         SET priority = $3, status = 'pending'
         RETURNING id`,
        [url, domain, priority]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Failed to save crawl target:', error);
      throw error;
    }
  }

  /**
   * Update crawl target status
   */
  async updateCrawlTargetStatus(url: string, status: string, errorMessage?: string) {
    await this.initialize();

    try {
      await databaseIntegration.query(
        `UPDATE crawl_targets
         SET status = $2, last_crawled_at = NOW(), error_message = $3
         WHERE url = $1`,
        [url, status, errorMessage || null]
      );
    } catch (error) {
      console.error('Failed to update crawl target status:', error);
    }
  }

  /**
   * Save DOM optimization results to database
   */
  async saveDOMOptimization(data: DOMOptimizationRecord): Promise<number> {
    await this.initialize();

    try {
      const result = await databaseIntegration.query(
        `INSERT INTO dom_optimizations (
          url, space_saved_bytes, tokens_earned, optimization_types,
          crawl_timestamp, performance_metrics, optimization_proof, worker_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          data.url,
          data.spaceSavedBytes,
          data.tokensEarned,
          data.optimizationTypes,
          data.crawlTimestamp,
          JSON.stringify(data.performanceMetrics),
          data.optimizationProof,
          data.workerId || null
        ]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Failed to save DOM optimization:', error);
      throw error;
    }
  }

  /**
   * Save detailed optimization breakdown
   */
  async saveOptimizationDetails(
    optimizationId: number,
    details: Array<{
      type: string;
      elementSelector?: string;
      bytesSaved: number;
      confidenceScore: number;
    }>
  ) {
    await this.initialize();

    try {
      for (const detail of details) {
        await databaseIntegration.query(
          `INSERT INTO optimization_details (
            optimization_id, optimization_type, element_selector,
            bytes_saved, confidence_score
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            optimizationId,
            detail.type,
            detail.elementSelector || null,
            detail.bytesSaved,
            detail.confidenceScore
          ]
        );
      }
    } catch (error) {
      console.error('Failed to save optimization details:', error);
    }
  }

  /**
   * Save schema data extracted from crawl
   */
  async saveSchemaData(url: string, schemas: any[]) {
    await this.initialize();

    try {
      for (const schema of schemas) {
        await databaseIntegration.query(
          `INSERT INTO schema_data (
            url, schema_type, schema_data, confidence_score,
            validation_status, extracted_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            url,
            schema.type || 'unknown',
            JSON.stringify(schema.data),
            schema.confidence || 0.8,
            'pending'
          ]
        );
      }
    } catch (error) {
      console.error('Failed to save schema data:', error);
    }
  }

  /**
   * Save backlink network data
   */
  async saveBacklinks(sourceUrl: string, backlinks: any[]) {
    await this.initialize();

    try {
      const sourceDomain = new URL(sourceUrl).hostname;

      for (const link of backlinks) {
        const targetDomain = link.targetUrl ? new URL(link.targetUrl).hostname : '';

        await databaseIntegration.query(
          `INSERT INTO backlink_network (
            source_url, target_url, source_domain, target_domain,
            anchor_text, link_type, link_strength, discovered_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT DO NOTHING`,
          [
            sourceUrl,
            link.targetUrl || '',
            sourceDomain,
            targetDomain,
            link.anchorText || '',
            link.type || 'internal',
            link.strength || 0.5
          ]
        );
      }
    } catch (error) {
      console.error('Failed to save backlinks:', error);
    }
  }

  /**
   * Save complete crawl result
   */
  async saveCrawlResult(result: CrawlResult) {
    await this.initialize();

    try {
      const domain = new URL(result.url).hostname;

      // Update crawl target status
      await this.updateCrawlTargetStatus(result.url, 'completed');

      // Calculate tokens earned (1 token per 1KB saved)
      const tokensEarned = result.spaceSaved / 1024;

      // Save DOM optimization
      const optimizationId = await this.saveDOMOptimization({
        url: result.url,
        spaceSavedBytes: result.spaceSaved,
        tokensEarned,
        optimizationTypes: result.optimizations.map(o => o.type),
        crawlTimestamp: result.timestamp,
        performanceMetrics: result.performance,
        optimizationProof: result.merkleRoot || '',
        workerId: undefined
      });

      // Save optimization details
      const details = result.optimizations.map(opt => ({
        type: opt.type,
        bytesSaved: opt.potentialSavings,
        confidenceScore: 0.85
      }));
      await this.saveOptimizationDetails(optimizationId, details);

      // Save schema data if present
      if (result.schemas && result.schemas.length > 0) {
        await this.saveSchemaData(result.url, result.schemas);
      }

      // Save backlinks if present
      if (result.backlinks && result.backlinks.length > 0) {
        await this.saveBacklinks(result.url, result.backlinks);
      }

      console.log(`✅ Saved crawl result for ${result.url} - ${result.spaceSaved} bytes saved`);

      return optimizationId;
    } catch (error) {
      console.error('Failed to save crawl result:', error);
      // Update target status to error
      await this.updateCrawlTargetStatus(result.url, 'error', error.message);
      throw error;
    }
  }

  /**
   * Get crawler statistics
   */
  async getCrawlerStats() {
    await this.initialize();

    try {
      const result = await databaseIntegration.query(`
        SELECT
          COUNT(*) as total_urls_crawled,
          SUM(space_saved_bytes) as total_space_saved,
          SUM(tokens_earned) as total_tokens_earned,
          AVG(space_saved_bytes) as avg_space_per_url,
          COUNT(DISTINCT worker_id) as active_workers
        FROM dom_optimizations
        WHERE crawl_timestamp > NOW() - INTERVAL '24 hours'
      `);

      const targetStats = await databaseIntegration.query(`
        SELECT
          status,
          COUNT(*) as count
        FROM crawl_targets
        GROUP BY status
      `);

      return {
        ...result.rows[0],
        statusBreakdown: targetStats.rows
      };
    } catch (error) {
      console.error('Failed to get crawler stats:', error);
      return null;
    }
  }

  /**
   * Get recent optimizations
   */
  async getRecentOptimizations(limit: number = 50) {
    await this.initialize();

    try {
      const result = await databaseIntegration.query(
        `SELECT
          id, url, space_saved_bytes, tokens_earned,
          optimization_types, crawl_timestamp, worker_id
         FROM dom_optimizations
         ORDER BY crawl_timestamp DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get recent optimizations:', error);
      return [];
    }
  }

  /**
   * Register active crawler worker
   */
  async registerCrawler(crawlerId: string, specialization: string = 'general') {
    await this.initialize();

    try {
      await databaseIntegration.query(
        `INSERT INTO active_crawlers (
          crawler_id, specialization, status, pages_per_second,
          efficiency_percent, total_pages_processed, total_space_harvested
        ) VALUES ($1, $2, 'idle', 0, 100, 0, 0)
        ON CONFLICT (crawler_id) DO UPDATE
        SET status = 'active'`,
        [crawlerId, specialization]
      );
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
    await this.initialize();

    try {
      let query = `UPDATE active_crawlers SET status = $2`;
      const params: any[] = [crawlerId, status];
      let paramIndex = 3;

      if (currentUrl) {
        query += `, current_url = $${paramIndex}`;
        params.push(currentUrl);
        paramIndex++;
      }

      if (stats) {
        if (stats.pagesProcessed !== undefined) {
          query += `, total_pages_processed = $${paramIndex}`;
          params.push(stats.pagesProcessed);
          paramIndex++;
        }
        if (stats.spaceHarvested !== undefined) {
          query += `, total_space_harvested = $${paramIndex}`;
          params.push(stats.spaceHarvested);
          paramIndex++;
        }
        if (stats.pagesPerSecond !== undefined) {
          query += `, pages_per_second = $${paramIndex}`;
          params.push(stats.pagesPerSecond);
          paramIndex++;
        }
        if (stats.efficiency !== undefined) {
          query += `, efficiency_percent = $${paramIndex}`;
          params.push(stats.efficiency);
          paramIndex++;
        }
      }

      query += ` WHERE crawler_id = $1`;

      await databaseIntegration.query(query, params);
    } catch (error) {
      console.error('Failed to update crawler status:', error);
    }
  }

  /**
   * Get active crawlers
   */
  async getActiveCrawlers() {
    await this.initialize();

    try {
      const result = await databaseIntegration.query(
        `SELECT * FROM active_crawlers WHERE status IN ('active', 'processing') ORDER BY crawler_id`
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get active crawlers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const crawlerDatabaseService = new CrawlerDatabaseService();
