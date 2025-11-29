/**
 * Crawler Campaign Management Service
 * 
 * Manages crawler campaigns, including:
 * - Campaign creation and configuration
 * - URL seed management
 * - Load balancing across crawler instances
 * - Scheduling and automation
 * - Analytics and reporting
 * - Advanced features: proxies, 3D layers, OCR, robots.txt
 */

import deepSeekService from './deepseek-api-service.js';
import { EventEmitter } from 'events';
import AdvancedCrawlerIntegration from './advanced-crawler-integration-service.js';

class CrawlerCampaignService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxCampaigns: config.maxCampaigns || 50,
      maxCrawlersPerCampaign: config.maxCrawlersPerCampaign || 20,
      defaultPayloadSize: config.defaultPayloadSize || 100,
      loadBalancingStrategy: config.loadBalancingStrategy || 'least-busy',
      enableAutoScaling: config.enableAutoScaling !== false,
      // Advanced features
      enableAdvancedFeatures: config.enableAdvancedFeatures !== false,
      ...config
    };

    // In-memory storage (replace with database in production)
    this.campaigns = new Map();
    this.crawlerInstances = new Map();
    this.schedules = new Map();
    this.analytics = new Map();
    
    this.db = config.db || null;

    // Advanced crawler integration
    if (this.config.enableAdvancedFeatures) {
      this.advancedIntegration = new AdvancedCrawlerIntegration(config);
      console.log('✅ Advanced crawler features enabled');
    } else {
      this.advancedIntegration = null;
    }
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

  // ==================== CLUSTER MANAGEMENT ====================

  /**
   * Create a new crawler cluster
   */
  async createCluster({ name, description, reason, strategy, maxCrawlers, autoScale }) {
    const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const cluster = {
      id: clusterId,
      name,
      description,
      reason,
      strategy: strategy || 'load-balanced',
      maxCrawlers: maxCrawlers || 10,
      autoScale: autoScale !== false,
      status: 'active',
      campaigns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Persist to database if available
    if (this.db) {
      try {
        await this.db.query(`
          INSERT INTO crawler_clusters (id, name, description, reason, strategy, max_crawlers, auto_scale, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          cluster.id,
          cluster.name,
          cluster.description,
          cluster.reason,
          cluster.strategy,
          cluster.maxCrawlers,
          cluster.autoScale,
          cluster.status,
          cluster.createdAt,
          cluster.updatedAt
        ]);
      } catch (error) {
        console.error('Error saving cluster to database:', error);
      }
    }

    this.emit('clusterCreated', cluster);
    console.log(`✅ Cluster created: ${clusterId}`);
    
    return cluster;
  }

  /**
   * List all clusters
   */
  async listClusters(filter = {}) {
    if (this.db) {
      try {
        let query = 'SELECT * FROM crawler_clusters WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (filter.status) {
          query += ` AND status = $${paramCount++}`;
          params.push(filter.status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await this.db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error listing clusters:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Get cluster with campaigns
   */
  async getClusterWithCampaigns(clusterId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      // Get cluster
      const clusterResult = await this.db.query(
        'SELECT * FROM crawler_clusters WHERE id = $1',
        [clusterId]
      );

      if (clusterResult.rows.length === 0) {
        throw new Error(`Cluster not found: ${clusterId}`);
      }

      const cluster = clusterResult.rows[0];

      // Get campaigns in cluster
      const campaignsResult = await this.db.query(`
        SELECT cc.*, cm.priority, cm.role, cm.joined_at
        FROM crawler_campaigns cc
        INNER JOIN cluster_campaigns cm ON cc.id = cm.campaign_id
        WHERE cm.cluster_id = $1
        ORDER BY cm.priority DESC, cm.joined_at DESC
      `, [clusterId]);

      cluster.campaigns = campaignsResult.rows;

      return cluster;
    } catch (error) {
      console.error('Error getting cluster:', error);
      throw error;
    }
  }

  /**
   * Update cluster
   */
  async updateCluster(clusterId, updates) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const fields = [];
      const params = [];
      let paramCount = 1;

      if (updates.name) {
        fields.push(`name = $${paramCount++}`);
        params.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        params.push(updates.description);
      }
      if (updates.reason !== undefined) {
        fields.push(`reason = $${paramCount++}`);
        params.push(updates.reason);
      }
      if (updates.strategy) {
        fields.push(`strategy = $${paramCount++}`);
        params.push(updates.strategy);
      }
      if (updates.maxCrawlers) {
        fields.push(`max_crawlers = $${paramCount++}`);
        params.push(updates.maxCrawlers);
      }
      if (updates.autoScale !== undefined) {
        fields.push(`auto_scale = $${paramCount++}`);
        params.push(updates.autoScale);
      }
      if (updates.status) {
        fields.push(`status = $${paramCount++}`);
        params.push(updates.status);
      }

      fields.push(`updated_at = $${paramCount++}`);
      params.push(new Date().toISOString());

      params.push(clusterId);

      const query = `
        UPDATE crawler_clusters
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await this.db.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating cluster:', error);
      throw error;
    }
  }

  /**
   * Delete cluster
   */
  async deleteCluster(clusterId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      await this.db.query('DELETE FROM crawler_clusters WHERE id = $1', [clusterId]);
      this.emit('clusterDeleted', clusterId);
    } catch (error) {
      console.error('Error deleting cluster:', error);
      throw error;
    }
  }

  /**
   * Add campaign to cluster
   */
  async addCampaignToCluster(clusterId, campaignId, { priority, role }) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const result = await this.db.query(`
        INSERT INTO cluster_campaigns (cluster_id, campaign_id, priority, role, joined_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (cluster_id, campaign_id) DO UPDATE
        SET priority = $3, role = $4
        RETURNING *
      `, [clusterId, campaignId, priority || 5, role, new Date().toISOString()]);

      this.emit('campaignAddedToCluster', { clusterId, campaignId });
      return result.rows[0];
    } catch (error) {
      console.error('Error adding campaign to cluster:', error);
      throw error;
    }
  }

  /**
   * Remove campaign from cluster
   */
  async removeCampaignFromCluster(clusterId, campaignId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      await this.db.query(
        'DELETE FROM cluster_campaigns WHERE cluster_id = $1 AND campaign_id = $2',
        [clusterId, campaignId]
      );

      this.emit('campaignRemovedFromCluster', { clusterId, campaignId });
    } catch (error) {
      console.error('Error removing campaign from cluster:', error);
      throw error;
    }
  }

  // ==================== SEEDING SERVICE MANAGEMENT ====================

  /**
   * Create a new seeding service
   */
  async createSeedingService({ name, type, description, config }) {
    const serviceId = `seeding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const service = {
      id: serviceId,
      name,
      type,
      description,
      config,
      status: 'active',
      enabled: true,
      urlsCollected: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Persist to database if available
    if (this.db) {
      try {
        await this.db.query(`
          INSERT INTO seeding_services (id, name, type, description, config, status, enabled, urls_collected, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          service.id,
          service.name,
          service.type,
          service.description,
          JSON.stringify(service.config),
          service.status,
          service.enabled,
          service.urlsCollected,
          service.createdAt,
          service.updatedAt
        ]);
      } catch (error) {
        console.error('Error saving seeding service to database:', error);
      }
    }

    this.emit('seedingServiceCreated', service);
    console.log(`✅ Seeding service created: ${serviceId}`);
    
    return service;
  }

  /**
   * List seeding services
   */
  async listSeedingServices(filter = {}) {
    if (this.db) {
      try {
        let query = 'SELECT * FROM seeding_services WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (filter.type) {
          query += ` AND type = $${paramCount++}`;
          params.push(filter.type);
        }

        if (filter.status) {
          query += ` AND status = $${paramCount++}`;
          params.push(filter.status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await this.db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error listing seeding services:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Get seeding service
   */
  async getSeedingService(serviceId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM seeding_services WHERE id = $1',
        [serviceId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Seeding service not found: ${serviceId}`);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting seeding service:', error);
      throw error;
    }
  }

  /**
   * Update seeding service
   */
  async updateSeedingService(serviceId, updates) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const fields = [];
      const params = [];
      let paramCount = 1;

      if (updates.name) {
        fields.push(`name = $${paramCount++}`);
        params.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        params.push(updates.description);
      }
      if (updates.config) {
        fields.push(`config = $${paramCount++}`);
        params.push(JSON.stringify(updates.config));
      }
      if (updates.status) {
        fields.push(`status = $${paramCount++}`);
        params.push(updates.status);
      }
      if (updates.enabled !== undefined) {
        fields.push(`enabled = $${paramCount++}`);
        params.push(updates.enabled);
      }

      fields.push(`updated_at = $${paramCount++}`);
      params.push(new Date().toISOString());

      params.push(serviceId);

      const query = `
        UPDATE seeding_services
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await this.db.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating seeding service:', error);
      throw error;
    }
  }

  /**
   * Delete seeding service
   */
  async deleteSeedingService(serviceId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      await this.db.query('DELETE FROM seeding_services WHERE id = $1', [serviceId]);
      this.emit('seedingServiceDeleted', serviceId);
    } catch (error) {
      console.error('Error deleting seeding service:', error);
      throw error;
    }
  }

  /**
   * Attach seeding service to campaign
   */
  async attachSeedingService(campaignId, serviceId, { configOverrides, enabled }) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const result = await this.db.query(`
        INSERT INTO campaign_seeding_services (campaign_id, seeding_service_id, config_overrides, enabled, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (campaign_id, seeding_service_id) DO UPDATE
        SET config_overrides = $3, enabled = $4
        RETURNING *
      `, [
        campaignId,
        serviceId,
        configOverrides ? JSON.stringify(configOverrides) : null,
        enabled !== false,
        new Date().toISOString()
      ]);

      this.emit('seedingServiceAttached', { campaignId, serviceId });
      return result.rows[0];
    } catch (error) {
      console.error('Error attaching seeding service:', error);
      throw error;
    }
  }

  /**
   * Run seeding service to collect URLs
   */
  async runSeedingService(serviceId, campaignId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const service = await this.getSeedingService(serviceId);
      
      // Collect URLs based on service type
      let urls = [];
      
      if (service.type === 'sitemap') {
        urls = await this.collectFromSitemap(service.config, campaignId);
      } else if (service.type === 'search-results') {
        urls = await this.collectFromSearchResults(service.config, campaignId);
      } else if (service.type === 'api') {
        urls = await this.collectFromAPI(service.config, campaignId);
      }

      // Save collected URLs
      for (const url of urls) {
        await this.db.query(`
          INSERT INTO collected_seeds (seeding_service_id, campaign_id, url, source, method, priority, metadata, collected_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [
          serviceId,
          campaignId,
          url.url,
          url.source || service.name,
          service.type,
          url.priority || 5,
          url.metadata ? JSON.stringify(url.metadata) : null,
          new Date().toISOString()
        ]);
      }

      // Update service statistics
      await this.db.query(`
        UPDATE seeding_services
        SET urls_collected = urls_collected + $1, last_run_at = $2
        WHERE id = $3
      `, [urls.length, new Date().toISOString(), serviceId]);

      this.emit('seedsCollected', { serviceId, campaignId, count: urls.length });

      return {
        serviceId,
        campaignId,
        urlsCollected: urls.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error running seeding service:', error);
      throw error;
    }
  }

  /**
   * Collect URLs from sitemap
   */
  async collectFromSitemap(config, campaignId) {
    // Implementation would fetch and parse sitemap XML
    console.log('Collecting from sitemap:', config.sitemapUrl);
    // Return mock data for now
    return [];
  }

  /**
   * Collect URLs from search results
   */
  async collectFromSearchResults(config, campaignId) {
    // Implementation would query search engines
    console.log('Collecting from search results:', config);
    // Return mock data for now
    return [];
  }

  /**
   * Collect URLs from API
   */
  async collectFromAPI(config, campaignId) {
    // Implementation would call external API
    console.log('Collecting from API:', config.apiUrl);
    // Return mock data for now
    return [];
  }

  /**
   * Get collected seeds for a campaign
   */
  async getCollectedSeeds(campaignId, { status, limit = 100 }) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      let query = 'SELECT * FROM collected_seeds WHERE campaign_id = $1';
      const params = [campaignId];
      let paramCount = 2;

      if (status) {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      query += ` ORDER BY priority DESC, collected_at DESC LIMIT $${paramCount}`;
      params.push(limit);

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting collected seeds:', error);
      return [];
    }
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId) {
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      await this.db.query('DELETE FROM crawler_campaigns WHERE id = $1', [campaignId]);
      this.campaigns.delete(campaignId);
      this.emit('campaignDeleted', campaignId);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  // ==================== ADVANCED FEATURES ====================

  /**
   * Initialize advanced features
   */
  async initializeAdvancedFeatures() {
    if (!this.advancedIntegration) {
      throw new Error('Advanced features not enabled');
    }
    return await this.advancedIntegration.initialize();
  }

  /**
   * Add proxy to campaign configuration
   */
  addProxyToCampaign(campaignId, proxyConfig) {
    if (!this.advancedIntegration) {
      throw new Error('Advanced features not enabled');
    }

    const proxy = this.advancedIntegration.addProxy(proxyConfig);
    
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      if (!campaign.configuration.proxies) {
        campaign.configuration.proxies = [];
      }
      campaign.configuration.proxies.push(proxy.id);
      this.campaigns.set(campaignId, campaign);
    }

    return proxy;
  }

  /**
   * Get proxy statistics for campaign
   */
  getProxyStats() {
    if (!this.advancedIntegration) {
      throw new Error('Advanced features not enabled');
    }
    return this.advancedIntegration.getProxyStats();
  }

  /**
   * Enable 3D layers mining for campaign
   */
  async enable3DLayersMining(campaignId, config = {}) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    campaign.configuration.layers3D = {
      enabled: true,
      maxDepth: config.maxDepth || 8,
      minImportance: config.minImportance || 0.4,
      extractCompositing: config.extractCompositing !== false,
      gpuAcceleration: config.gpuAcceleration || 'auto',
    };

    this.campaigns.set(campaignId, campaign);
    
    if (this.db) {
      await this.updateCampaignConfig(campaignId, { configuration: campaign.configuration });
    }

    return campaign;
  }

  /**
   * Enable OCR for campaign
   */
  async enableOCR(campaignId, config = {}) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    campaign.configuration.ocr = {
      enabled: true,
      maxImages: config.maxImages || 4,
      compressionRatio: config.compressionRatio || 0.1,
      minPrecision: config.minPrecision || 0.95,
    };

    this.campaigns.set(campaignId, campaign);
    
    if (this.db) {
      await this.updateCampaignConfig(campaignId, { configuration: campaign.configuration });
    }

    return campaign;
  }

  /**
   * Check robots.txt for campaign URLs
   */
  async checkRobotsTxtForCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (!this.advancedIntegration) {
      return { allowed: true, message: 'Advanced features not enabled' };
    }

    const urlObj = new URL(campaign.clientSiteUrl);
    const robotsCheck = await this.advancedIntegration.getRobotsTxt(urlObj.hostname);

    return {
      allowed: robotsCheck.allowed,
      crawlDelay: robotsCheck.crawlDelay,
      domain: urlObj.hostname,
    };
  }

  /**
   * Test advanced configuration for campaign
   */
  async testAdvancedConfiguration(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (!this.advancedIntegration) {
      return { error: 'Advanced features not enabled' };
    }

    return await this.advancedIntegration.testConfiguration(campaign.clientSiteUrl);
  }

  /**
   * Crawl with advanced features
   */
  async crawlWithAdvancedFeatures(campaignId, url, options = {}) {
    if (!this.advancedIntegration) {
      throw new Error('Advanced features not enabled');
    }

    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Merge campaign configuration with options
    const crawlOptions = {
      ...campaign.configuration,
      ...options,
    };

    return await this.advancedIntegration.crawlAdvanced(url, crawlOptions);
  }

  /**
   * Get advanced features status
   */
  getAdvancedFeaturesStatus() {
    if (!this.advancedIntegration) {
      return {
        enabled: false,
        features: {
          proxies: false,
          robots: false,
          layers3D: false,
          ocr: false,
        },
      };
    }

    return {
      enabled: true,
      initialized: this.advancedIntegration.initialized,
      features: {
        proxies: this.advancedIntegration.configService.config.proxies.enabled,
        robots: this.advancedIntegration.configService.config.robots.enabled,
        layers3D: this.advancedIntegration.configService.config.layers3D.enabled,
        ocr: this.advancedIntegration.configService.config.ocr.enabled,
      },
      stats: {
        proxies: this.advancedIntegration.configService.proxyPool.length,
        robotsCache: this.advancedIntegration.configService.robotsCache.size,
      },
    };
  }
}

// Export singleton instance
const campaignService = new CrawlerCampaignService();

export default campaignService;
export { CrawlerCampaignService };
