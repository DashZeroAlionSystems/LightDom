/**
 * Campaign Instance Orchestrator
 * 
 * Creates and manages all instances needed for a campaign:
 * - Service instances
 * - Data mining instances
 * - Seeder instances
 * - Crawler instances
 * - Neural network instances
 */

import { EventEmitter } from 'events';
import deepSeekService from './deepseek-api-service.js';
import enhancedSeedingService from './enhanced-seeding-service.js';

class CampaignInstanceOrchestrator extends EventEmitter {
  constructor() {
    super();
    
    this.campaigns = new Map();
    this.instances = new Map();
  }

  /**
   * Create complete campaign with all instances
   */
  async createCampaignWithInstances(config) {
    const {
      campaignId,
      name,
      description,
      targetUrl,
      prompt,
      options = {}
    } = config;

    const campaign = {
      id: campaignId || `campaign_${Date.now()}`,
      name,
      description,
      targetUrl,
      prompt,
      options,
      createdAt: new Date().toISOString(),
      status: 'initializing',
      instances: {
        services: [],
        dataMining: [],
        seeders: [],
        crawlers: [],
        neuralNetworks: []
      }
    };

    this.campaigns.set(campaign.id, campaign);

    try {
      // Step 1: Create service instances
      campaign.instances.services = await this.createServiceInstances(campaign);
      
      // Step 2: Create data mining instances
      campaign.instances.dataMining = await this.createDataMiningInstances(campaign);
      
      // Step 3: Create seeder instances
      campaign.instances.seeders = await this.createSeederInstances(campaign);
      
      // Step 4: Create crawler instances
      campaign.instances.crawlers = await this.createCrawlerInstances(campaign);
      
      // Step 5: Create neural network instances
      campaign.instances.neuralNetworks = await this.createNeuralNetworkInstances(campaign);

      campaign.status = 'ready';
      this.emit('campaign:ready', campaign);

      return campaign;
    } catch (error) {
      console.error('Error creating campaign instances:', error);
      campaign.status = 'error';
      campaign.error = error.message;
      throw error;
    }
  }

  /**
   * Create service instances
   */
  async createServiceInstances(campaign) {
    const services = [];

    // Determine what services are needed based on campaign
    const serviceTypes = await this.determineRequiredServices(campaign);

    for (const type of serviceTypes) {
      const service = {
        id: `service_${campaign.id}_${type}_${Date.now()}`,
        campaignId: campaign.id,
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Service`,
        config: await this.generateServiceConfig(campaign, type),
        status: 'active',
        createdAt: new Date().toISOString()
      };

      services.push(service);
      this.instances.set(service.id, service);
    }

    return services;
  }

  /**
   * Determine required services from campaign prompt
   */
  async determineRequiredServices(campaign) {
    const prompt = `
    Campaign: ${campaign.name}
    Description: ${campaign.description}
    Target: ${campaign.targetUrl}
    Original Prompt: ${campaign.prompt}
    
    What services are needed for this campaign?
    Consider: API services, database services, cache services, queue services, etc.
    
    Respond with a JSON array of service types: ["api", "database", "cache", ...]
    `;

    try {
      const response = await deepSeekService.chat({
        message: prompt,
        systemPrompt: 'You are a system architect. Respond only with valid JSON arrays.'
      });

      const jsonMatch = response.content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error determining services:', error);
    }

    // Default services
    return ['api', 'database', 'cache'];
  }

  /**
   * Generate service configuration
   */
  async generateServiceConfig(campaign, serviceType) {
    const prompt = `
    Generate configuration for a ${serviceType} service for this campaign:
    
    Campaign: ${campaign.name}
    Target: ${campaign.targetUrl}
    Purpose: ${campaign.description}
    
    Provide optimal ${serviceType} configuration as JSON.
    `;

    try {
      const response = await deepSeekService.chat({
        message: prompt,
        systemPrompt: 'You are a DevOps expert. Provide production-ready configurations as JSON.'
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error generating service config:', error);
    }

    return this.getDefaultServiceConfig(serviceType);
  }

  /**
   * Create data mining instances
   */
  async createDataMiningInstances(campaign) {
    const instances = [];

    // Determine mining strategies
    const strategies = await this.determineMiningStrategies(campaign);

    for (const strategy of strategies) {
      const instance = {
        id: `mining_${campaign.id}_${strategy.type}_${Date.now()}`,
        campaignId: campaign.id,
        type: 'data-mining',
        strategy: strategy.type,
        name: `${strategy.type} Mining Instance`,
        config: strategy.config,
        status: 'idle',
        createdAt: new Date().toISOString(),
        stats: {
          dataMined: 0,
          schemasFound: 0,
          relationships: 0
        }
      };

      instances.push(instance);
      this.instances.set(instance.id, instance);
    }

    return instances;
  }

  /**
   * Determine mining strategies
   */
  async determineMiningStrategies(campaign) {
    const strategies = [];

    // Always include basic mining
    strategies.push({
      type: 'dom-structure',
      config: {
        depth: campaign.options.maxDepth || 5,
        extractSchemas: true,
        extract3DLayers: campaign.options.layers3D?.enabled || false
      }
    });

    // Add schema mining if needed
    strategies.push({
      type: 'schema-extraction',
      config: {
        types: ['json-ld', 'microdata', 'rdfa', 'opengraph'],
        linkSchemas: true
      }
    });

    // Add OCR if images are involved
    if (campaign.options.ocr?.enabled) {
      strategies.push({
        type: 'ocr-extraction',
        config: {
          precision: campaign.options.ocr.precision || 0.95,
          compressionRatio: campaign.options.ocr.compressionRatio || 0.1
        }
      });
    }

    return strategies;
  }

  /**
   * Create seeder instances with schema relationships
   */
  async createSeederInstances(campaign) {
    const instances = [];

    // Get seeding methods from campaign options
    const methods = campaign.options.seeding?.methods || ['sitemap'];

    for (const method of methods) {
      // Create seeder with schema relationship awareness
      const seeder = await enhancedSeedingService.createWithSchemaRelationship({
        name: `${method} Seeder for ${campaign.name}`,
        type: method,
        baseConfig: campaign.options.seeding?.[method] || {},
        relationshipValue: null, // Will be populated as schemas are discovered
        originalPrompt: campaign.prompt,
        campaignId: campaign.id
      });

      instances.push(seeder);
    }

    return instances;
  }

  /**
   * Create crawler instances
   */
  async createCrawlerInstances(campaign) {
    const instances = [];

    // Determine number of crawlers based on cluster config
    const numCrawlers = campaign.options.cluster?.maxCrawlers || 1;

    for (let i = 0; i < numCrawlers; i++) {
      const instance = {
        id: `crawler_${campaign.id}_${i}_${Date.now()}`,
        campaignId: campaign.id,
        type: 'crawler',
        index: i,
        name: `Crawler ${i + 1}`,
        config: {
          concurrency: campaign.options.concurrency || 5,
          maxDepth: campaign.options.maxDepth || 3,
          maxPages: Math.ceil((campaign.options.maxPages || 1000) / numCrawlers),
          proxies: campaign.options.proxies || {},
          robotsTxt: campaign.options.robotsTxt || { enabled: true },
          ...campaign.options.advanced
        },
        status: 'idle',
        createdAt: new Date().toISOString(),
        stats: {
          pagesCrawled: 0,
          dataMined: 0,
          errors: 0
        }
      };

      instances.push(instance);
      this.instances.set(instance.id, instance);
    }

    return instances;
  }

  /**
   * Create neural network instances for training
   */
  async createNeuralNetworkInstances(campaign) {
    const instances = [];

    // Check if neural network training is needed
    if (!campaign.options.neuralNetwork?.enabled) {
      return instances;
    }

    // Determine network architecture
    const architecture = await this.determineNetworkArchitecture(campaign);

    const instance = {
      id: `nn_${campaign.id}_${Date.now()}`,
      campaignId: campaign.id,
      type: 'neural-network',
      name: 'Training Network',
      architecture,
      config: {
        inputSize: architecture.inputSize,
        hiddenLayers: architecture.hiddenLayers,
        outputSize: architecture.outputSize,
        learningRate: campaign.options.neuralNetwork.learningRate || 0.001,
        batchSize: campaign.options.neuralNetwork.batchSize || 32,
        epochs: campaign.options.neuralNetwork.epochs || 100
      },
      status: 'untrained',
      createdAt: new Date().toISOString(),
      trainingStats: {
        epoch: 0,
        loss: null,
        accuracy: null
      }
    };

    instances.push(instance);
    this.instances.set(instance.id, instance);

    return instances;
  }

  /**
   * Determine neural network architecture
   */
  async determineNetworkArchitecture(campaign) {
    const prompt = `
    Design a neural network architecture for this data mining campaign:
    
    Campaign: ${campaign.name}
    Purpose: ${campaign.description}
    Data Types: ${JSON.stringify(campaign.options.extraction?.types || [])}
    
    Provide architecture as JSON with: inputSize, hiddenLayers (array), outputSize
    `;

    try {
      const response = await deepSeekService.chat({
        message: prompt,
        systemPrompt: 'You are an ML architect. Provide neural network architectures as JSON.'
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error determining architecture:', error);
    }

    // Default architecture
    return {
      inputSize: 100,
      hiddenLayers: [64, 32],
      outputSize: 10
    };
  }

  /**
   * Link seeder with discovered schema relationships
   */
  async linkSeederWithSchema(seederId, schemaRelationship) {
    const seeder = this.instances.get(seederId);
    if (!seeder || seeder.type !== 'seeding') {
      throw new Error('Invalid seeder instance');
    }

    // Update seeder with schema relationship
    await enhancedSeedingService.updateService(seederId, {
      relationshipValue: schemaRelationship
    });

    this.emit('seeder:schema-linked', { seederId, schemaRelationship });
  }

  /**
   * Get campaign with all instances
   */
  getCampaign(campaignId) {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get instance by ID
   */
  getInstance(instanceId) {
    return this.instances.get(instanceId);
  }

  /**
   * List all instances for campaign
   */
  listCampaignInstances(campaignId, type = null) {
    const instances = Array.from(this.instances.values())
      .filter(i => i.campaignId === campaignId);

    if (type) {
      return instances.filter(i => i.type === type);
    }

    return instances;
  }

  /**
   * Start campaign (start all instances)
   */
  async startCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'running';

    // Start all instances
    const allInstances = this.listCampaignInstances(campaignId);
    
    for (const instance of allInstances) {
      instance.status = 'running';
      this.emit('instance:started', instance);
    }

    this.emit('campaign:started', campaign);

    return campaign;
  }

  /**
   * Stop campaign (stop all instances)
   */
  async stopCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'stopped';

    // Stop all instances
    const allInstances = this.listCampaignInstances(campaignId);
    
    for (const instance of allInstances) {
      instance.status = 'stopped';
      this.emit('instance:stopped', instance);
    }

    this.emit('campaign:stopped', campaign);

    return campaign;
  }

  /**
   * Get default service config
   */
  getDefaultServiceConfig(type) {
    const defaults = {
      api: {
        port: 3001,
        cors: true,
        rateLimit: { max: 100, windowMs: 60000 }
      },
      database: {
        type: 'postgresql',
        poolSize: 10,
        timeout: 30000
      },
      cache: {
        type: 'redis',
        ttl: 3600,
        maxSize: '100mb'
      }
    };

    return defaults[type] || {};
  }
}

// Export singleton
const campaignOrchestrator = new CampaignInstanceOrchestrator();

export default campaignOrchestrator;
export { CampaignInstanceOrchestrator };
