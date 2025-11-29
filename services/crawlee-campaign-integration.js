/**
 * Crawlee Campaign Integration
 * Connects Crawlee crawlers with the campaign system
 */

import CrawleeService from './crawlee-service.js';

class CrawleeCampaignIntegration {
  constructor(db, crawlerCampaignService) {
    this.db = db;
    this.crawlerCampaignService = crawlerCampaignService;
    this.crawleeService = new CrawleeService(db);
    
    // Listen to campaign events
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for campaign integration
   */
  setupEventListeners() {
    // When a campaign is created with Crawlee, create the crawler
    if (this.crawlerCampaignService) {
      this.crawlerCampaignService.on('campaignCreated', async (campaign) => {
        if (campaign.useCrawlee) {
          await this.createCrawlerForCampaign(campaign);
        }
      });

      this.crawlerCampaignService.on('campaignStarted', async (campaign) => {
        if (campaign.useCrawlee && campaign.crawlee_crawler_id) {
          await this.crawleeService.startCrawler(campaign.crawlee_crawler_id);
        }
      });

      this.crawlerCampaignService.on('campaignStopped', async (campaign) => {
        if (campaign.useCrawlee && campaign.crawlee_crawler_id) {
          await this.crawleeService.stopCrawler(campaign.crawlee_crawler_id);
        }
      });
    }

    // Forward Crawlee events to campaign service
    this.crawleeService.on('crawler:result:saved', (data) => {
      this.handleCrawlerResult(data);
    });

    this.crawleeService.on('crawler:completed', (data) => {
      this.handleCrawlerCompleted(data);
    });
  }

  /**
   * Create a Crawlee crawler for a campaign
   */
  async createCrawlerForCampaign(campaign) {
    try {
      console.log(`Creating Crawlee crawler for campaign: ${campaign.id}`);

      // Build crawler configuration from campaign
      const crawlerConfig = {
        name: `Campaign Crawler: ${campaign.name}`,
        description: campaign.description || '',
        type: campaign.crawlerType || 'cheerio',
        campaign_id: campaign.id,
        
        // Use campaign's schema for selectors
        selectors: campaign.schema?.fields || {},
        
        // Use campaign's URL patterns
        url_patterns: {
          include: campaign.seeds?.include || ['*'],
          exclude: campaign.seeds?.exclude || [],
          maxDepth: campaign.configuration?.maxDepth || 3,
          sameDomain: campaign.configuration?.sameDomain !== false,
          respectRobotsTxt: campaign.configuration?.respectRobotsTxt !== false
        },
        
        // Use campaign's configuration
        config: {
          maxRequestsPerCrawl: campaign.configuration?.maxRequestsPerCrawl || 1000,
          maxConcurrency: campaign.configuration?.parallelCrawlers || 10,
          maxRequestRetries: campaign.configuration?.maxRetries || 3
        },
        
        tags: ['campaign', campaign.id]
      };

      const crawler = await this.crawleeService.createCrawler(crawlerConfig);
      
      // Update campaign with crawler ID
      campaign.crawlee_crawler_id = crawler.id;
      if (this.db) {
        await this.db.query(
          'UPDATE seo_campaigns SET crawlee_crawler_id = $1 WHERE id = $2',
          [crawler.id, campaign.id]
        );
      }

      // Add campaign seeds to crawler
      if (campaign.seeds?.urls && campaign.seeds.urls.length > 0) {
        await this.crawleeService.addSeeds(crawler.id, campaign.seeds.urls);
      }

      console.log(`✅ Crawlee crawler created for campaign: ${crawler.id}`);
      return crawler;

    } catch (error) {
      console.error(`Failed to create Crawlee crawler for campaign:`, error);
      throw error;
    }
  }

  /**
   * Handle crawler result and update campaign analytics
   */
  async handleCrawlerResult(data) {
    try {
      const { crawlerId, url, data: extractedData } = data;
      
      // Get crawler to find campaign
      const crawler = await this.crawleeService.getCrawler(crawlerId);
      
      if (crawler.campaign_id) {
        // Update campaign analytics
        if (this.db) {
          await this.db.query(`
            UPDATE seo_campaigns
            SET 
              analytics = jsonb_set(
                analytics,
                '{totalPages}',
                (COALESCE((analytics->>'totalPages')::int, 0) + 1)::text::jsonb
              ),
              analytics = jsonb_set(
                analytics,
                '{pagesProcessed}',
                (COALESCE((analytics->>'pagesProcessed')::int, 0) + 1)::text::jsonb
              )
            WHERE id = $1
          `, [crawler.campaign_id]);
        }
      }
    } catch (error) {
      console.error('Failed to handle crawler result:', error);
    }
  }

  /**
   * Handle crawler completion and update campaign status
   */
  async handleCrawlerCompleted(data) {
    try {
      const { crawlerId } = data;
      
      // Get crawler to find campaign
      const crawler = await this.crawleeService.getCrawler(crawlerId);
      
      if (crawler.campaign_id) {
        // Update campaign status if all crawlers are done
        if (this.db) {
          await this.db.query(`
            UPDATE seo_campaigns
            SET status = 'completed', last_run_at = NOW()
            WHERE id = $1
          `, [crawler.campaign_id]);
        }

        console.log(`✅ Campaign ${crawler.campaign_id} completed`);
      }
    } catch (error) {
      console.error('Failed to handle crawler completion:', error);
    }
  }

  /**
   * Get campaign results from Crawlee
   */
  async getCampaignResults(campaignId, options = {}) {
    try {
      // Get crawler for campaign
      const result = await this.db.query(
        'SELECT crawlee_crawler_id FROM seo_campaigns WHERE id = $1',
        [campaignId]
      );

      if (result.rows.length === 0 || !result.rows[0].crawlee_crawler_id) {
        return [];
      }

      const crawlerId = result.rows[0].crawlee_crawler_id;
      return await this.crawleeService.getCrawlerResults(crawlerId, options);
    } catch (error) {
      console.error('Failed to get campaign results:', error);
      return [];
    }
  }

  /**
   * Get campaign crawler stats
   */
  async getCampaignCrawlerStats(campaignId) {
    try {
      const result = await this.db.query(
        'SELECT crawlee_crawler_id FROM seo_campaigns WHERE id = $1',
        [campaignId]
      );

      if (result.rows.length === 0 || !result.rows[0].crawlee_crawler_id) {
        return null;
      }

      const crawlerId = result.rows[0].crawlee_crawler_id;
      return await this.crawleeService.getCrawlerStats(crawlerId);
    } catch (error) {
      console.error('Failed to get campaign crawler stats:', error);
      return null;
    }
  }

  /**
   * Add crawler_id column to campaigns table if not exists
   */
  async ensureCampaignSchema() {
    try {
      await this.db.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='seo_campaigns' AND column_name='crawlee_crawler_id'
          ) THEN
            ALTER TABLE seo_campaigns ADD COLUMN crawlee_crawler_id VARCHAR(255) REFERENCES crawlee_crawlers(id) ON DELETE SET NULL;
            CREATE INDEX idx_seo_campaigns_crawlee_crawler ON seo_campaigns(crawlee_crawler_id);
          END IF;
        END $$;
      `);
      console.log('✅ Campaign schema updated for Crawlee integration');
    } catch (error) {
      console.error('Failed to update campaign schema:', error);
    }
  }
}

export default CrawleeCampaignIntegration;
