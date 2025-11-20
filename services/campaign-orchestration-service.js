/**
 * Campaign Orchestration Service
 * 
 * Coordinates complete campaign creation from prompts.
 * Manages all instances: research, mining, seeding, workflow, services, and APIs.
 * 
 * Features:
 * - Create complete campaigns from natural language prompts
 * - Orchestrate research → attributes → mining → workflow pipeline
 * - Link instances together
 * - Track campaign progress
 * - Manage campaign lifecycle
 */

import { EventEmitter } from 'events';
import researchInstanceService from './research-instance-service.js';
import attributeDiscoveryService from './attribute-discovery-service.js';
import dataMiningInstanceService from './data-mining-instance-service.js';
import deepSeekService from './deepseek-api-service.js';

class CampaignOrchestrationService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      autoStartCampaigns: config.autoStartCampaigns !== false,
      ...config
    };

    this.campaigns = new Map();
    this.db = config.db || null;
  }

  /**
   * Create a complete campaign from a prompt
   */
  async createCampaignFromPrompt(prompt, options = {}) {
    try {
      console.log(`🚀 Creating campaign from prompt: "${prompt.substring(0, 50)}..."`);

      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      // Parse campaign name from prompt or use default
      const campaignName = options.name || this.extractCampaignName(prompt);

      const campaign = {
        campaign_id: campaignId,
        name: campaignName,
        description: options.description || `Campaign created from: ${prompt}`,
        prompt,
        status: 'initializing',
        research_id: null,
        mining_id: null,
        seeding_id: null,
        workflow_instance_id: null,
        linked_services: [],
        linked_apis: [],
        configuration: options.configuration || {},
        progress: {
          research: 'pending',
          attributes: 'pending',
          mining: 'pending',
          seeding: 'pending',
          workflow: 'pending',
          services: 'pending',
          apis: 'pending'
        },
        metrics: {
          total_tasks: 0,
          completed_tasks: 0,
          failed_tasks: 0,
          data_points_collected: 0
        },
        metadata: options.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.campaigns.set(campaignId, campaign);

      if (this.db) {
        await this.saveCampaignToDB(campaign);
      }

      this.emit('campaignCreated', campaign);
      
      // Log campaign creation
      await this.logEvent(campaignId, 'campaign_created', { prompt });

      // Start campaign orchestration asynchronously
      this.orchestrateCampaign(campaignId, prompt, options).catch(error => {
        console.error(`Campaign orchestration failed for ${campaignId}:`, error);
        this.updateCampaignStatus(campaignId, 'failed', { error: error.message });
      });

      console.log(`✅ Campaign created: ${campaignId}`);
      return campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Orchestrate the complete campaign pipeline
   */
  async orchestrateCampaign(campaignId, prompt, options = {}) {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      // Phase 1: Research
      await this.updateCampaignStatus(campaignId, 'researching');
      await this.logEvent(campaignId, 'phase_started', { phase: 'research' });
      
      const topic = this.extractTopic(prompt);
      const research = await researchInstanceService.kickoffResearch(topic, prompt, {
        initiatedFrom: 'campaign',
        campaignId,
        ...options.research
      });

      campaign.research_id = research.research_id;
      campaign.progress.research = 'completed';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'research', researchId: research.research_id });

      // Wait for research to complete
      await this.waitForResearch(research.research_id);

      // Phase 2: Attribute Discovery
      campaign.progress.attributes = 'in_progress';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_started', { phase: 'attributes' });

      const attributes = await attributeDiscoveryService.discoverAttributes(research.research_id);
      
      campaign.progress.attributes = 'completed';
      campaign.metadata.attributeCount = attributes.length;
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'attributes', count: attributes.length });

      // Phase 3: Data Mining Instance
      await this.updateCampaignStatus(campaignId, 'configuring');
      campaign.progress.mining = 'in_progress';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_started', { phase: 'mining' });

      const mining = await dataMiningInstanceService.createFromResearch(research.research_id, {
        name: `${campaign.name} - Mining`,
        ...options.mining
      });

      campaign.mining_id = mining.mining_id;
      campaign.progress.mining = 'completed';
      campaign.metadata.enabledAttributesCount = mining.enabled_attributes.length;
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'mining', miningId: mining.mining_id });

      // Phase 4: Seeding Instance
      campaign.progress.seeding = 'in_progress';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_started', { phase: 'seeding' });

      const seeding = await this.createSeedingInstance(campaign, mining, options.seeding);
      
      campaign.seeding_id = seeding.seeding_id;
      campaign.progress.seeding = 'completed';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'seeding', seedingId: seeding.seeding_id });

      // Phase 5: Workflow Instance
      campaign.progress.workflow = 'in_progress';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_started', { phase: 'workflow' });

      const workflowInstance = await this.createWorkflowInstance(campaign, mining, options.workflow);
      
      campaign.workflow_instance_id = workflowInstance.workflow_instance_id;
      campaign.progress.workflow = 'completed';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'workflow', workflowInstanceId: workflowInstance.workflow_instance_id });

      // Phase 6: Service Instances
      campaign.progress.services = 'in_progress';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_started', { phase: 'services' });

      const services = await this.createServiceInstances(campaign, mining, options.services);
      
      campaign.linked_services = services.map(s => s.service_instance_id);
      campaign.progress.services = 'completed';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'services', count: services.length });

      // Phase 7: API Instances
      campaign.progress.apis = 'in_progress';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_started', { phase: 'apis' });

      const apis = await this.createAPIInstances(campaign, mining, options.apis);
      
      campaign.linked_apis = apis.map(a => a.api_instance_id);
      campaign.progress.apis = 'completed';
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'phase_completed', { phase: 'apis', count: apis.length });

      // Mark campaign as ready
      await this.updateCampaignStatus(campaignId, 'ready');
      await this.logEvent(campaignId, 'campaign_ready', {});

      // Auto-start if configured
      if (this.config.autoStartCampaigns && options.autoStart !== false) {
        await this.startCampaign(campaignId);
      }

      console.log(`✅ Campaign orchestration completed: ${campaignId}`);
      this.emit('campaignOrchestrated', campaign);

      return campaign;
    } catch (error) {
      console.error(`Campaign orchestration failed for ${campaignId}:`, error);
      await this.updateCampaignStatus(campaignId, 'failed', { error: error.message });
      await this.logEvent(campaignId, 'error', { error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * Wait for research to complete
   */
  async waitForResearch(researchId, timeout = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const research = await researchInstanceService.getResearch(researchId);
      
      if (research.status === 'completed') {
        return research;
      }
      
      if (research.status === 'failed') {
        throw new Error(`Research ${researchId} failed`);
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`Research ${researchId} timed out`);
  }

  /**
   * Create seeding instance for the campaign
   */
  async createSeedingInstance(campaign, mining, options = {}) {
    const seedingId = `seeding_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const seeding = {
      seeding_id: seedingId,
      name: `${campaign.name} - Seeding`,
      mining_id: mining.mining_id,
      seeding_strategy: options.strategy || 'backlink_discovery',
      seed_urls: mining.target_urls || [],
      discovered_urls: [],
      backlink_sources: [],
      competitor_sites: options.competitorSites || [],
      url_filters: options.filters || {
        include: ['.*'],
        exclude: ['\\.pdf$', '\\.zip$', '\\.exe$']
      },
      priority_rules: options.priorityRules || [],
      status: 'pending',
      discovered_count: 0,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.db) {
      await this.saveSeedingInstanceToDB(seeding);
    }

    return seeding;
  }

  /**
   * Create workflow instance for the campaign
   */
  async createWorkflowInstance(campaign, mining, options = {}) {
    const workflowInstanceId = `workflow_inst_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const workflowInstance = {
      workflow_instance_id: workflowInstanceId,
      workflow_id: options.workflowId || null,
      mining_id: mining.mining_id,
      name: `${campaign.name} - Workflow`,
      description: `Workflow instance for ${campaign.name}`,
      status: 'created',
      configuration: options.config || {},
      execution_count: 0,
      last_execution_at: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.db) {
      await this.saveWorkflowInstanceToDB(workflowInstance);
    }

    return workflowInstance;
  }

  /**
   * Create service instances for the campaign
   */
  async createServiceInstances(campaign, mining, options = {}) {
    const services = [];
    const serviceTypes = options.types || ['crawler', 'storage', 'analytics'];

    for (const type of serviceTypes) {
      const serviceId = `service_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const service = {
        service_instance_id: serviceId,
        service_type: type,
        mining_id: mining.mining_id,
        name: `${campaign.name} - ${type}`,
        endpoint_url: options.endpoints?.[type] || null,
        configuration: options.configs?.[type] || {},
        credentials: {},
        status: 'inactive',
        health_check_url: null,
        last_health_check: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      services.push(service);

      if (this.db) {
        await this.saveServiceInstanceToDB(service);
      }
    }

    return services;
  }

  /**
   * Create API instances for the campaign
   */
  async createAPIInstances(campaign, mining, options = {}) {
    const apis = [];
    const apiConfigs = options.apis || [];

    for (const config of apiConfigs) {
      const apiId = `api_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const api = {
        api_instance_id: apiId,
        mining_id: mining.mining_id,
        api_name: config.name,
        api_type: config.type || 'rest',
        base_url: config.baseUrl,
        authentication: config.auth || {},
        endpoints: config.endpoints || [],
        rate_limits: config.rateLimits || {},
        status: 'configured',
        request_count: 0,
        error_count: 0,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      apis.push(api);

      if (this.db) {
        await this.saveAPIInstanceToDB(api);
      }
    }

    return apis;
  }

  /**
   * Start campaign execution
   */
  async startCampaign(campaignId) {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      if (campaign.status !== 'ready') {
        throw new Error(`Campaign must be in 'ready' status. Current: ${campaign.status}`);
      }

      await this.updateCampaignStatus(campaignId, 'running');
      campaign.started_at = new Date().toISOString();
      await this.updateCampaignInDB(campaign);
      await this.logEvent(campaignId, 'campaign_started', {});

      // Queue mining instance
      await dataMiningInstanceService.queueMiningInstance(campaign.mining_id);

      // Start mining execution
      await dataMiningInstanceService.startMiningInstance(campaign.mining_id);

      this.emit('campaignStarted', campaign);
      console.log(`▶️ Campaign started: ${campaignId}`);

      return campaign;
    } catch (error) {
      console.error('Failed to start campaign:', error);
      throw error;
    }
  }

  /**
   * Extract campaign name from prompt
   */
  extractCampaignName(prompt) {
    // Simple heuristic to extract a name from the prompt
    const words = prompt.split(/\s+/).slice(0, 5);
    return words.join(' ').replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50) || 'Untitled Campaign';
  }

  /**
   * Extract topic from prompt
   */
  extractTopic(prompt) {
    // Extract the main topic/subject from the prompt
    // This is a simple implementation - could be enhanced with NLP
    const promptLower = prompt.toLowerCase();
    
    // Look for common patterns
    const patterns = [
      /research (?:on |about )?(.+?)(?:\s+for|\s+in|\s+with|$)/i,
      /mine (?:data )?(?:on |about )?(.+?)(?:\s+for|\s+from|$)/i,
      /extract (?:data )?(?:on |about )?(.+?)(?:\s+for|\s+from|$)/i,
      /analyze (.+?)(?:\s+for|\s+in|\s+with|$)/i,
      /(.+?)(?:\s+data mining|\s+research|\s+analysis|$)/i
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: use first few words
    return prompt.split(/\s+/).slice(0, 3).join(' ');
  }

  /**
   * Get campaign
   */
  async getCampaign(campaignId) {
    let campaign = this.campaigns.get(campaignId);

    if (!campaign && this.db) {
      campaign = await this.loadCampaignFromDB(campaignId);
      if (campaign) {
        this.campaigns.set(campaignId, campaign);
      }
    }

    return campaign;
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId, status, metadata = {}) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    campaign.status = status;
    campaign.updated_at = new Date().toISOString();
    campaign.metadata = { ...campaign.metadata, ...metadata };

    if (this.db) {
      await this.updateCampaignInDB(campaign);
    }

    this.emit('campaignStatusChanged', { campaignId, status, metadata });
  }

  /**
   * Log campaign event
   */
  async logEvent(campaignId, eventType, eventData = {}, severity = 'info') {
    const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const log = {
      log_id: logId,
      campaign_id: campaignId,
      event_type: eventType,
      event_data: eventData,
      severity,
      message: `${eventType}: ${JSON.stringify(eventData)}`,
      created_at: new Date().toISOString()
    };

    if (this.db) {
      await this.saveLogToDB(log);
    }

    console.log(`📝 [${severity.toUpperCase()}] Campaign ${campaignId}: ${eventType}`);
  }

  /**
   * List campaigns
   */
  async listCampaigns(filters = {}) {
    if (this.db) {
      return await this.listCampaignsFromDB(filters);
    }

    let campaigns = Array.from(this.campaigns.values());

    if (filters.status) {
      campaigns = campaigns.filter(c => c.status === filters.status);
    }

    return campaigns;
  }

  // Database operations (placeholders - implement based on DB client)
  async saveCampaignToDB(campaign) {
    if (!this.db) return;
    // Implementation depends on DB client
  }

  async updateCampaignInDB(campaign) {
    if (!this.db) return;
    // Implementation depends on DB client
  }

  async loadCampaignFromDB(campaignId) {
    if (!this.db) return null;
    // Implementation depends on DB client
  }

  async listCampaignsFromDB(filters = {}) {
    if (!this.db) return [];
    // Implementation depends on DB client
  }

  async saveSeedingInstanceToDB(seeding) {
    if (!this.db) return;
    // Implementation depends on DB client
  }

  async saveWorkflowInstanceToDB(workflowInstance) {
    if (!this.db) return;
    // Implementation depends on DB client
  }

  async saveServiceInstanceToDB(service) {
    if (!this.db) return;
    // Implementation depends on DB client
  }

  async saveAPIInstanceToDB(api) {
    if (!this.db) return;
    // Implementation depends on DB client
  }

  async saveLogToDB(log) {
    if (!this.db) return;
    // Implementation depends on DB client
  }
}

// Export singleton instance
const campaignOrchestrationService = new CampaignOrchestrationService();
export default campaignOrchestrationService;
