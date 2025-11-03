/**
 * Crawler Campaign Management Service
 * 
 * Manages crawler campaigns, including:
 * - Campaign creation and configuration
 * - URL seed management
 * - Load balancing across crawler instances
 * - Scheduling and automation
 * - Analytics and reporting
 */

import deepSeekService from './deepseek-api-service.js';
import { EventEmitter } from 'events';

class CrawlerCampaignService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxCampaigns: config.maxCampaigns || 50,
      maxCrawlersPerCampaign: config.maxCrawlersPerCampaign || 20,
      defaultPayloadSize: config.defaultPayloadSize || 100,
      loadBalancingStrategy: config.loadBalancingStrategy || 'least-busy',
      enableAutoScaling: config.enableAutoScaling !== false,
      ...config
    };

    // In-memory storage (replace with database in production)
    this.campaigns = new Map();
    this.crawlerInstances = new Map();
    this.schedules = new Map();
    this.analytics = new Map();
    
    this.db = config.db || null;
  }

  /**
   * Create a new crawler campaign from prompt
   */
  async createCampaignFromPrompt(prompt, clientSiteUrl, options = {}) {
    try {
      console.log(`📋 Creating campaign from prompt: "${prompt.substring(0, 50)}..."`);

      // Use DeepSeek to generate workflow configuration
      const workflow = await deepSeekService.generateWorkflowFromPrompt(prompt, options);
      
      // Generate URL seeds
      const seeds = await deepSeekService.generateURLSeeds(prompt, clientSiteUrl, options);
      
      // Build schema
      const schema = await deepSeekService.buildCrawlerSchema(
        `SEO training data for ${clientSiteUrl}`,
        [],
        options
      );

      // Create campaign
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const campaign = {
        id: campaignId,
        name: workflow.workflowName || 'Unnamed Campaign',
        description: workflow.description,
        clientSiteUrl,
        prompt,
        status: 'created',
        workflow,
        seeds: this.mergeSeedLists(seeds),
        schema,
        configuration: {
          ...workflow.configuration,
          parallelCrawlers: this.calculateOptimalCrawlers(seeds),
          payloadSize: options.payloadSize || this.config.defaultPayloadSize,
          loadBalancing: options.loadBalancing || this.config.loadBalancingStrategy
        },
        schedule: workflow.schedule,
        analytics: {
          totalPages: 0,
          pagesProcessed: 0,
          errorCount: 0,
          successRate: 100,
          averageResponseTime: 0,
          spaceSaved: 0,
          tokensEarned: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.campaigns.set(campaignId, campaign);
      
      // Persist to database if available
      if (this.db) {
        await this.saveCampaignToDB(campaign);
      }

      this.emit('campaignCreated', campaign);
      
      console.log(`✅ Campaign created: ${campaignId}`);
      return campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  /**
   * Start a campaign
   */
  async startCampaign(campaignId, options = {}) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    console.log(`🚀 Starting campaign: ${campaign.name}`);

    // Determine crawler allocation strategy
    const crawlerAllocation = this.allocateCrawlers(campaign);
    
    // Initialize crawler instances
    const crawlers = await this.initializeCrawlers(campaign, crawlerAllocation);
    
    // Distribute URLs across crawlers
    const distribution = this.distributeURLs(campaign.seeds, crawlers, campaign.configuration);
    
    // Update campaign status
    campaign.status = 'running';
    campaign.startedAt = new Date().toISOString();
    campaign.crawlers = crawlers.map(c => c.id);
    campaign.urlDistribution = distribution;
    
    this.campaigns.set(campaignId, campaign);

    // Start crawlers
    for (const crawler of crawlers) {
      await this.startCrawlerInstance(crawler, distribution[crawler.id]);
    }

    this.emit('campaignStarted', campaign);
    
    return {
      campaignId,
      status: 'running',
      crawlersActive: crawlers.length,
      totalUrls: campaign.seeds.length,
      message: `Campaign started with ${crawlers.length} crawler instance(s)`
    };
  }

  /**
   * Stop a campaign
   */
  async stopCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    console.log(`🛑 Stopping campaign: ${campaign.name}`);

    // Stop all crawler instances
    if (campaign.crawlers) {
      for (const crawlerId of campaign.crawlers) {
        const crawler = this.crawlerInstances.get(crawlerId);
        if (crawler) {
          await this.stopCrawlerInstance(crawlerId);
        }
      }
    }

    campaign.status = 'stopped';
    campaign.stoppedAt = new Date().toISOString();
    this.campaigns.set(campaignId, campaign);

    this.emit('campaignStopped', campaign);
    
    return { campaignId, status: 'stopped' };
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    campaign.status = 'paused';
    campaign.pausedAt = new Date().toISOString();
    this.campaigns.set(campaignId, campaign);

    // Pause all crawlers
    if (campaign.crawlers) {
      for (const crawlerId of campaign.crawlers) {
        const crawler = this.crawlerInstances.get(crawlerId);
        if (crawler) {
          crawler.status = 'paused';
        }
      }
    }

    this.emit('campaignPaused', campaign);
    return { campaignId, status: 'paused' };
  }

  /**
   * Resume a paused campaign
   */
  async resumeCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    campaign.status = 'running';
    campaign.resumedAt = new Date().toISOString();
    this.campaigns.set(campaignId, campaign);

    // Resume all crawlers
    if (campaign.crawlers) {
      for (const crawlerId of campaign.crawlers) {
        const crawler = this.crawlerInstances.get(crawlerId);
        if (crawler) {
          crawler.status = 'active';
        }
      }
    }

    this.emit('campaignResumed', campaign);
    return { campaignId, status: 'running' };
  }

  /**
   * Get campaign details
   */
  getCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }
    return campaign;
  }

  /**
   * List all campaigns
   */
  listCampaigns(filter = {}) {
    let campaigns = Array.from(this.campaigns.values());
    
    // Apply filters
    if (filter.status) {
      campaigns = campaigns.filter(c => c.status === filter.status);
    }
    
    if (filter.clientSiteUrl) {
      campaigns = campaigns.filter(c => c.clientSiteUrl === filter.clientSiteUrl);
    }
    
    // Sort by creation date (newest first)
    campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return campaigns;
  }

  /**
   * Update campaign configuration
   */
  async updateCampaignConfig(campaignId, updates) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Merge updates
    campaign.configuration = {
      ...campaign.configuration,
      ...updates.configuration
    };
    
    if (updates.schedule) {
      campaign.schedule = {
        ...campaign.schedule,
        ...updates.schedule
      };
    }
    
    campaign.updatedAt = new Date().toISOString();
    this.campaigns.set(campaignId, campaign);

    this.emit('campaignUpdated', campaign);
    return campaign;
  }

  /**
   * Calculate optimal number of crawlers based on seed count and complexity
   */
  calculateOptimalCrawlers(seeds) {
    const totalSeeds = Object.values(seeds).flat().length;
    
    // Base calculation: 1 crawler per 50 URLs
    let optimal = Math.ceil(totalSeeds / 50);
    
    // Apply constraints
    optimal = Math.max(1, optimal); // Minimum 1
    optimal = Math.min(this.config.maxCrawlersPerCampaign, optimal); // Maximum from config
    
    return optimal;
  }

  /**
   * Merge seed lists from different categories
   */
  mergeSeedLists(seeds) {
    const merged = [];
    const seen = new Set();
    
    // Priority order
    const categories = ['primarySeeds', 'competitorSeeds', 'authoritySeeds', 'trainingDataSeeds'];
    
    for (const category of categories) {
      if (seeds[category]) {
        for (const url of seeds[category]) {
          if (!seen.has(url)) {
            merged.push({
              url,
              category,
              priority: seeds.priority?.[url] || 5
            });
            seen.add(url);
          }
        }
      }
    }
    
    // Sort by priority (highest first)
    merged.sort((a, b) => b.priority - a.priority);
    
    return merged;
  }

  /**
   * Allocate crawlers based on campaign requirements
   */
  allocateCrawlers(campaign) {
    const parallelCrawlers = campaign.configuration.parallelCrawlers;
    
    return {
      count: parallelCrawlers,
      strategy: campaign.configuration.loadBalancing,
      payloadSize: campaign.configuration.payloadSize
    };
  }

  /**
   * Initialize crawler instances for a campaign
   */
  async initializeCrawlers(campaign, allocation) {
    const crawlers = [];
    
    for (let i = 0; i < allocation.count; i++) {
      const crawlerId = `crawler_${campaign.id}_${i}`;
      
      const crawler = {
        id: crawlerId,
        campaignId: campaign.id,
        index: i,
        status: 'initializing',
        queue: [],
        processed: 0,
        errors: 0,
        configuration: campaign.configuration,
        createdAt: new Date().toISOString()
      };
      
      this.crawlerInstances.set(crawlerId, crawler);
      crawlers.push(crawler);
    }
    
    return crawlers;
  }

  /**
   * Distribute URLs across crawler instances
   */
  distributeURLs(seeds, crawlers, configuration) {
    const distribution = {};
    const strategy = configuration.loadBalancing;
    
    // Initialize distribution for each crawler
    crawlers.forEach(crawler => {
      distribution[crawler.id] = [];
    });
    
    if (strategy === 'round-robin') {
      // Round-robin distribution
      seeds.forEach((seed, index) => {
        const crawlerIndex = index % crawlers.length;
        distribution[crawlers[crawlerIndex].id].push(seed);
      });
    } else if (strategy === 'least-busy') {
      // Least-busy distribution (initially equal)
      const chunkSize = Math.ceil(seeds.length / crawlers.length);
      crawlers.forEach((crawler, index) => {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, seeds.length);
        distribution[crawler.id] = seeds.slice(start, end);
      });
    } else if (strategy === 'priority-based') {
      // Priority-based distribution (high priority to fewer crawlers)
      const sortedSeeds = [...seeds].sort((a, b) => b.priority - a.priority);
      sortedSeeds.forEach((seed, index) => {
        const crawlerIndex = index % crawlers.length;
        distribution[crawlers[crawlerIndex].id].push(seed);
      });
    } else {
      // Default: equal distribution
      const chunkSize = Math.ceil(seeds.length / crawlers.length);
      crawlers.forEach((crawler, index) => {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, seeds.length);
        distribution[crawler.id] = seeds.slice(start, end);
      });
    }
    
    return distribution;
  }

  /**
   * Start a crawler instance
   */
  async startCrawlerInstance(crawler, urls) {
    crawler.status = 'active';
    crawler.queue = urls;
    crawler.startedAt = new Date().toISOString();
    
    this.crawlerInstances.set(crawler.id, crawler);
    
    this.emit('crawlerStarted', crawler);
    
    // In a real implementation, this would start actual crawling
    console.log(`🕷️  Crawler ${crawler.id} started with ${urls.length} URLs`);
    
    return crawler;
  }

  /**
   * Stop a crawler instance
   */
  async stopCrawlerInstance(crawlerId) {
    const crawler = this.crawlerInstances.get(crawlerId);
    if (!crawler) {
      throw new Error(`Crawler not found: ${crawlerId}`);
    }
    
    crawler.status = 'stopped';
    crawler.stoppedAt = new Date().toISOString();
    
    this.crawlerInstances.set(crawlerId, crawler);
    
    this.emit('crawlerStopped', crawler);
    
    return crawler;
  }

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Aggregate analytics from all crawlers
    const crawlerStats = campaign.crawlers?.map(id => this.crawlerInstances.get(id)).filter(Boolean) || [];
    
    const analytics = {
      campaignId,
      status: campaign.status,
      totalCrawlers: crawlerStats.length,
      activeCrawlers: crawlerStats.filter(c => c.status === 'active').length,
      totalUrls: campaign.seeds.length,
      processedUrls: crawlerStats.reduce((sum, c) => sum + c.processed, 0),
      errorCount: crawlerStats.reduce((sum, c) => sum + c.errors, 0),
      queueSize: crawlerStats.reduce((sum, c) => sum + c.queue.length, 0),
      progress: campaign.seeds.length > 0 
        ? Math.round((crawlerStats.reduce((sum, c) => sum + c.processed, 0) / campaign.seeds.length) * 100)
        : 0,
      ...campaign.analytics
    };
    
    return analytics;
  }

  /**
   * Schedule campaign execution
   */
  async scheduleCampaign(campaignId, schedule) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const scheduleId = `schedule_${campaignId}`;
    
    this.schedules.set(scheduleId, {
      id: scheduleId,
      campaignId,
      frequency: schedule.frequency,
      time: schedule.time,
      enabled: schedule.enabled !== false,
      lastRun: null,
      nextRun: this.calculateNextRun(schedule),
      createdAt: new Date().toISOString()
    });

    campaign.schedule = schedule;
    this.campaigns.set(campaignId, campaign);

    this.emit('campaignScheduled', { campaignId, schedule });
    
    return this.schedules.get(scheduleId);
  }

  /**
   * Calculate next run time for a schedule
   */
  calculateNextRun(schedule) {
    const now = new Date();
    const [hours, minutes] = (schedule.time || '00:00').split(':').map(Number);
    
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow/next occurrence
    if (nextRun <= now) {
      if (schedule.frequency === 'hourly') {
        nextRun.setHours(nextRun.getHours() + 1);
      } else if (schedule.frequency === 'daily') {
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (schedule.frequency === 'weekly') {
        nextRun.setDate(nextRun.getDate() + 7);
      } else if (schedule.frequency === 'monthly') {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }
    
    return nextRun.toISOString();
  }

  /**
   * Save campaign to database
   */
  async saveCampaignToDB(campaign) {
    if (!this.db) return;
    
    try {
      await this.db.query(`
        INSERT INTO crawler_campaigns (
          id, name, description, client_site_url, prompt, status,
          configuration, schedule, analytics, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          configuration = EXCLUDED.configuration,
          schedule = EXCLUDED.schedule,
          analytics = EXCLUDED.analytics,
          updated_at = EXCLUDED.updated_at
      `, [
        campaign.id,
        campaign.name,
        campaign.description,
        campaign.clientSiteUrl,
        campaign.prompt,
        campaign.status,
        JSON.stringify(campaign.configuration),
        JSON.stringify(campaign.schedule),
        JSON.stringify(campaign.analytics),
        campaign.createdAt,
        campaign.updatedAt
      ]);
    } catch (error) {
      console.error('Error saving campaign to database:', error);
    }
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    const campaigns = Array.from(this.campaigns.values());
    const crawlers = Array.from(this.crawlerInstances.values());
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'running').length,
      pausedCampaigns: campaigns.filter(c => c.status === 'paused').length,
      totalCrawlers: crawlers.length,
      activeCrawlers: crawlers.filter(c => c.status === 'active').length,
      totalUrlsQueued: crawlers.reduce((sum, c) => sum + c.queue.length, 0),
      totalUrlsProcessed: crawlers.reduce((sum, c) => sum + c.processed, 0),
      totalErrors: crawlers.reduce((sum, c) => sum + c.errors, 0)
    };
  }
}

// Export singleton instance
const campaignService = new CrawlerCampaignService();

export default campaignService;
export { CrawlerCampaignService };
