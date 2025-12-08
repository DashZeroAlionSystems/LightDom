/**
 * Campaign Management Service
 * 
 * Orchestrates multiple data mining campaigns with resource management,
 * priority scheduling, and goal tracking.
 * 
 * Features:
 * - Multi-campaign orchestration
 * - Resource allocation (CPU, memory, workers)
 * - Priority-based scheduling
 * - Progress tracking and metrics
 * - Goal achievement monitoring
 * - Rollback support
 * - Campaign dependencies
 * 
 * @module services/campaign-management-service
 */

import EventEmitter from 'events';
import { Worker } from 'worker_threads';
import os from 'os';

/**
 * Campaign types supported by the system
 */
const CAMPAIGN_TYPES = {
  STORYBOOK_DISCOVERY: 'storybook_discovery',
  CODE_ANALYSIS: 'code_analysis',
  SEO_MINING: 'seo_mining',
  TRAINING_DATA: 'training_data',
  COMPONENT_MINING: 'component_mining',
  RELATIONSHIP_ANALYSIS: 'relationship_analysis',
};

/**
 * Campaign status values
 */
const CAMPAIGN_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export class CampaignManagementService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.db = options.db;
    this.campaigns = new Map();
    this.runningCampaigns = new Set();
    this.campaignQueue = [];
    
    // Resource management
    this.maxConcurrentCampaigns = options.maxConcurrentCampaigns || 3;
    this.totalCPUCores = os.cpus().length;
    this.totalMemoryGB = os.totalmem() / (1024 ** 3);
    this.allocatedResources = {
      cpu: 0,
      memory: 0,
      workers: 0,
    };
    
    // Monitoring
    this.metrics = {
      campaignsCreated: 0,
      campaignsCompleted: 0,
      campaignsFailed: 0,
      totalDataMined: 0,
      averageDuration: 0,
    };
  }

  /**
   * Create a new campaign
   */
  async createCampaign(config) {
    const campaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      type: config.type,
      status: CAMPAIGN_STATUS.PENDING,
      priority: config.priority || 5, // 1-10, higher = more important
      
      // Goals and targets
      goals: config.goals || {},
      
      // Resource limits
      resources: {
        maxWorkers: config.resources?.maxWorkers || 4,
        maxCPUPercent: config.resources?.maxCPUPercent || 50,
        maxMemoryMB: config.resources?.maxMemoryMB || 2048,
      },
      
      // Configuration
      configuration: config.configuration || {},
      
      // Dependencies
      dependencies: config.dependencies || [], // Campaign IDs that must complete first
      
      // Metrics
      metrics: {
        startTime: null,
        endTime: null,
        duration: 0,
        itemsProcessed: 0,
        itemsSucceeded: 0,
        itemsFailed: 0,
        progressPercent: 0,
      },
      
      // Results
      results: {
        data: [],
        errors: [],
        summary: {},
      },
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.campaigns.set(campaign.id, campaign);
    this.metrics.campaignsCreated++;
    
    // Save to database if available
    if (this.db) {
      await this._saveCampaignToDB(campaign);
    }
    
    this.emit('campaign:created', campaign);
    
    // Add to queue
    this._addToQueue(campaign);
    
    // Try to start campaigns from queue
    await this._processQueue();
    
    return campaign;
  }

  /**
   * Execute a campaign
   */
  async executeCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }
    
    if (campaign.status === CAMPAIGN_STATUS.RUNNING) {
      throw new Error(`Campaign already running: ${campaignId}`);
    }
    
    // Check dependencies
    const depsComplete = await this._checkDependencies(campaign);
    if (!depsComplete) {
      throw new Error(`Dependencies not met for campaign: ${campaignId}`);
    }
    
    // Check resource availability
    const resourcesAvailable = this._checkResourcesAvailable(campaign);
    if (!resourcesAvailable) {
      throw new Error(`Insufficient resources for campaign: ${campaignId}`);
    }
    
    // Allocate resources
    this._allocateResources(campaign);
    
    // Update status
    campaign.status = CAMPAIGN_STATUS.RUNNING;
    campaign.metrics.startTime = new Date().toISOString();
    this.runningCampaigns.add(campaignId);
    
    this.emit('campaign:started', campaign);
    
    try {
      // Execute based on campaign type
      await this._executeCampaignType(campaign);
      
      // Check if goals achieved
      const goalsAchieved = this._checkGoalsAchieved(campaign);
      
      // Complete campaign
      campaign.status = CAMPAIGN_STATUS.COMPLETED;
      campaign.metrics.endTime = new Date().toISOString();
      campaign.metrics.duration = 
        new Date(campaign.metrics.endTime) - new Date(campaign.metrics.startTime);
      
      this.metrics.campaignsCompleted++;
      this._updateAverageDuration();
      
      this.emit('campaign:completed', { campaign, goalsAchieved });
      
      return { success: true, campaign, goalsAchieved };
      
    } catch (error) {
      campaign.status = CAMPAIGN_STATUS.FAILED;
      campaign.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      
      this.metrics.campaignsFailed++;
      
      this.emit('campaign:failed', { campaign, error });
      
      return { success: false, campaign, error };
      
    } finally {
      // Release resources
      this._releaseResources(campaign);
      this.runningCampaigns.delete(campaignId);
      
      // Update in database
      if (this.db) {
        await this._saveCampaignToDB(campaign);
      }
      
      // Process queue for next campaign
      await this._processQueue();
    }
  }

  /**
   * Execute campaign based on type
   */
  async _executeCampaignType(campaign) {
    switch (campaign.type) {
      case CAMPAIGN_TYPES.STORYBOOK_DISCOVERY:
        return await this._executeStorybookDiscovery(campaign);
      
      case CAMPAIGN_TYPES.CODE_ANALYSIS:
        return await this._executeCodeAnalysis(campaign);
      
      case CAMPAIGN_TYPES.SEO_MINING:
        return await this._executeSEOMining(campaign);
      
      case CAMPAIGN_TYPES.TRAINING_DATA:
        return await this._executeTrainingDataGeneration(campaign);
      
      case CAMPAIGN_TYPES.COMPONENT_MINING:
        return await this._executeComponentMining(campaign);
      
      case CAMPAIGN_TYPES.RELATIONSHIP_ANALYSIS:
        return await this._executeRelationshipAnalysis(campaign);
      
      default:
        throw new Error(`Unknown campaign type: ${campaign.type}`);
    }
  }

  /**
   * Execute Storybook discovery campaign
   */
  async _executeStorybookDiscovery(campaign) {
    const { StorybookCrawler } = await import('./storybook-crawler.js');
    const crawler = new StorybookCrawler(campaign.configuration);
    
    // Track progress
    crawler.on('url:processed', () => {
      campaign.metrics.itemsProcessed++;
      this._updateCampaignProgress(campaign);
    });
    
    crawler.on('component:discovered', (component) => {
      campaign.metrics.itemsSucceeded++;
      campaign.results.data.push(component);
      this.metrics.totalDataMined++;
    });
    
    // Execute
    await crawler.start({
      maxSeeds: campaign.goals.minComponents || 1000,
      discover: true,
      ...campaign.configuration,
    });
    
    campaign.results.summary = crawler.getStats();
  }

  /**
   * Execute code analysis campaign
   */
  async _executeCodeAnalysis(campaign) {
    const { CodebaseIndexingService } = await import('./codebase-indexing-service.js');
    const indexer = new CodebaseIndexingService({
      db: this.db,
      ...campaign.configuration,
    });
    
    indexer.on('entity:indexed', () => {
      campaign.metrics.itemsProcessed++;
      this._updateCampaignProgress(campaign);
    });
    
    const results = await indexer.indexCodebase();
    campaign.results.summary = results;
    campaign.metrics.itemsSucceeded = results.entitiesIndexed;
  }

  /**
   * Execute SEO mining campaign
   */
  async _executeSEOMining(campaign) {
    const { SEOMiningService } = await import('./seo-mining-service.js');
    const seoMiner = new SEOMiningService({
      db: this.db,
      ...campaign.configuration,
    });
    
    const urls = campaign.configuration.urls || [];
    
    for (const url of urls) {
      try {
        const analysis = await seoMiner.analyzePage(url);
        campaign.metrics.itemsProcessed++;
        campaign.metrics.itemsSucceeded++;
        campaign.results.data.push(analysis);
        this._updateCampaignProgress(campaign);
      } catch (error) {
        campaign.metrics.itemsFailed++;
        campaign.results.errors.push({ url, error: error.message });
      }
    }
    
    campaign.results.summary = {
      totalUrls: urls.length,
      succeeded: campaign.metrics.itemsSucceeded,
      failed: campaign.metrics.itemsFailed,
    };
  }

  /**
   * Execute training data generation campaign
   */
  async _executeTrainingDataGeneration(campaign) {
    const { TrainingDataGenerator } = await import('./training-data-generator.js');
    const generator = new TrainingDataGenerator({
      numSimulations: campaign.goals.minSimulations || 100000,
      parallelWorkers: campaign.resources.maxWorkers,
      ...campaign.configuration,
    });
    
    generator.on('simulation:batch', (count) => {
      campaign.metrics.itemsProcessed += count;
      this._updateCampaignProgress(campaign);
    });
    
    const results = await generator.generate();
    campaign.results.summary = results;
    campaign.metrics.itemsSucceeded = results.totalSimulations;
  }

  /**
   * Execute component mining campaign
   */
  async _executeComponentMining(campaign) {
    // Similar to Storybook discovery but focuses on component extraction
    await this._executeStorybookDiscovery(campaign);
  }

  /**
   * Execute relationship analysis campaign
   */
  async _executeRelationshipAnalysis(campaign) {
    const { RelationshipBasedIndexer } = await import('./relationship-based-indexer.js');
    const indexer = new RelationshipBasedIndexer({
      db: this.db,
      ...campaign.configuration,
    });
    
    const recommendations = await indexer.analyzeByRelationships();
    campaign.results.data = recommendations;
    campaign.results.summary = {
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority >= 8).length,
    };
    campaign.metrics.itemsSucceeded = recommendations.length;
  }

  /**
   * Update campaign progress
   */
  _updateCampaignProgress(campaign) {
    const goalKey = Object.keys(campaign.goals)[0];
    if (goalKey) {
      const target = campaign.goals[goalKey];
      const current = campaign.metrics.itemsSucceeded;
      campaign.metrics.progressPercent = Math.min(100, (current / target) * 100);
    }
    
    this.emit('campaign:progress', campaign);
  }

  /**
   * Check if campaign goals are achieved
   */
  _checkGoalsAchieved(campaign) {
    const results = {};
    
    for (const [key, target] of Object.entries(campaign.goals)) {
      const value = campaign.metrics[key] || campaign.metrics.itemsSucceeded;
      results[key] = value >= target;
    }
    
    return Object.values(results).every(v => v);
  }

  /**
   * Check if dependencies are complete
   */
  async _checkDependencies(campaign) {
    if (!campaign.dependencies || campaign.dependencies.length === 0) {
      return true;
    }
    
    for (const depId of campaign.dependencies) {
      const depCampaign = this.campaigns.get(depId);
      if (!depCampaign || depCampaign.status !== CAMPAIGN_STATUS.COMPLETED) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if resources are available
   */
  _checkResourcesAvailable(campaign) {
    const cpuNeeded = (campaign.resources.maxCPUPercent / 100) * this.totalCPUCores;
    const memoryNeeded = campaign.resources.maxMemoryMB / 1024; // Convert to GB
    
    const cpuAvailable = this.totalCPUCores - this.allocatedResources.cpu;
    const memoryAvailable = this.totalMemoryGB - this.allocatedResources.memory;
    
    return cpuAvailable >= cpuNeeded && memoryAvailable >= memoryNeeded;
  }

  /**
   * Allocate resources for campaign
   */
  _allocateResources(campaign) {
    const cpuNeeded = (campaign.resources.maxCPUPercent / 100) * this.totalCPUCores;
    const memoryNeeded = campaign.resources.maxMemoryMB / 1024;
    
    this.allocatedResources.cpu += cpuNeeded;
    this.allocatedResources.memory += memoryNeeded;
    this.allocatedResources.workers += campaign.resources.maxWorkers;
  }

  /**
   * Release resources from campaign
   */
  _releaseResources(campaign) {
    const cpuUsed = (campaign.resources.maxCPUPercent / 100) * this.totalCPUCores;
    const memoryUsed = campaign.resources.maxMemoryMB / 1024;
    
    this.allocatedResources.cpu -= cpuUsed;
    this.allocatedResources.memory -= memoryUsed;
    this.allocatedResources.workers -= campaign.resources.maxWorkers;
    
    // Ensure non-negative
    this.allocatedResources.cpu = Math.max(0, this.allocatedResources.cpu);
    this.allocatedResources.memory = Math.max(0, this.allocatedResources.memory);
    this.allocatedResources.workers = Math.max(0, this.allocatedResources.workers);
  }

  /**
   * Add campaign to queue
   */
  _addToQueue(campaign) {
    this.campaignQueue.push(campaign);
    // Sort by priority (higher first)
    this.campaignQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process campaign queue
   */
  async _processQueue() {
    while (this.campaignQueue.length > 0 && 
           this.runningCampaigns.size < this.maxConcurrentCampaigns) {
      
      const campaign = this.campaignQueue.shift();
      
      // Check if we can run this campaign
      const depsComplete = await this._checkDependencies(campaign);
      const resourcesAvailable = this._checkResourcesAvailable(campaign);
      
      if (depsComplete && resourcesAvailable) {
        // Start campaign asynchronously
        this.executeCampaign(campaign.id).catch(err => {
          console.error(`Campaign execution failed: ${campaign.id}`, err);
        });
      } else {
        // Put back in queue
        this.campaignQueue.unshift(campaign);
        break; // Wait for resources/dependencies
      }
    }
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status !== CAMPAIGN_STATUS.RUNNING) {
      throw new Error(`Cannot pause campaign: ${campaignId}`);
    }
    
    campaign.status = CAMPAIGN_STATUS.PAUSED;
    this.emit('campaign:paused', campaign);
  }

  /**
   * Resume a paused campaign
   */
  async resumeCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status !== CAMPAIGN_STATUS.PAUSED) {
      throw new Error(`Cannot resume campaign: ${campaignId}`);
    }
    
    campaign.status = CAMPAIGN_STATUS.PENDING;
    this._addToQueue(campaign);
    await this._processQueue();
  }

  /**
   * Cancel a campaign
   */
  async cancelCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }
    
    campaign.status = CAMPAIGN_STATUS.CANCELLED;
    this._releaseResources(campaign);
    this.runningCampaigns.delete(campaignId);
    
    this.emit('campaign:cancelled', campaign);
  }

  /**
   * Get campaign status
   */
  getCampaign(campaignId) {
    return this.campaigns.get(campaignId);
  }

  /**
   * List all campaigns
   */
  listCampaigns(filter = {}) {
    let campaigns = Array.from(this.campaigns.values());
    
    if (filter.status) {
      campaigns = campaigns.filter(c => c.status === filter.status);
    }
    
    if (filter.type) {
      campaigns = campaigns.filter(c => c.type === filter.type);
    }
    
    return campaigns;
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeCampaigns: this.runningCampaigns.size,
      queuedCampaigns: this.campaignQueue.length,
      resourceUtilization: {
        cpu: (this.allocatedResources.cpu / this.totalCPUCores) * 100,
        memory: (this.allocatedResources.memory / this.totalMemoryGB) * 100,
        workers: this.allocatedResources.workers,
      },
    };
  }

  /**
   * Update average duration metric
   */
  _updateAverageDuration() {
    const completed = Array.from(this.campaigns.values())
      .filter(c => c.status === CAMPAIGN_STATUS.COMPLETED);
    
    if (completed.length > 0) {
      const totalDuration = completed.reduce((sum, c) => sum + c.metrics.duration, 0);
      this.metrics.averageDuration = totalDuration / completed.length;
    }
  }

  /**
   * Save campaign to database
   */
  async _saveCampaignToDB(campaign) {
    if (!this.db) return;
    
    try {
      await this.db.query(`
        INSERT INTO campaigns (
          id, name, type, status, priority, goals, resources,
          configuration, dependencies, metrics, results, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          metrics = EXCLUDED.metrics,
          results = EXCLUDED.results,
          updated_at = EXCLUDED.updated_at
      `, [
        campaign.id,
        campaign.name,
        campaign.type,
        campaign.status,
        campaign.priority,
        JSON.stringify(campaign.goals),
        JSON.stringify(campaign.resources),
        JSON.stringify(campaign.configuration),
        JSON.stringify(campaign.dependencies),
        JSON.stringify(campaign.metrics),
        JSON.stringify(campaign.results),
        campaign.createdAt,
        campaign.updatedAt,
      ]);
    } catch (error) {
      console.error('Failed to save campaign to DB:', error);
    }
  }
}

export { CAMPAIGN_TYPES, CAMPAIGN_STATUS };
