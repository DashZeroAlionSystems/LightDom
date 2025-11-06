/**
 * Campaign Container Manager
 * 
 * Manages containerized instances of campaign web crawler workers.
 * Each container runs isolated worker instances with their own configs.
 * Supports real-time monitoring, schema-based LLM integration, and simulations.
 * 
 * Features:
 * - Container lifecycle management
 * - Worker instance orchestration
 * - Real-time data aggregation
 * - Schema plugin system for LLM configuration
 * - Virtual simulation environments
 * - Two-way communication hub
 */

import { EventEmitter } from 'events';
import CampaignWebCrawlerWorker from './campaign-web-crawler-worker.js';
import campaignOrchestrationService from './campaign-orchestration-service.js';

class CampaignContainerManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxContainers: config.maxContainers || 10,
      maxWorkersPerContainer: config.maxWorkersPerContainer || 5,
      enableRealTimeAggregation: config.enableRealTimeAggregation !== false,
      enableLLMIntegration: config.enableLLMIntegration !== false,
      ...config
    };

    // Container registry
    this.containers = new Map();
    
    // Worker registry
    this.workers = new Map();
    
    // Real-time data aggregation
    this.dataAggregator = {
      enabled: this.config.enableRealTimeAggregation,
      streams: new Map(),
      buffer: [],
      subscribers: new Set()
    };

    // Schema plugin registry for LLM
    this.schemaPlugins = new Map();
    
    // LLM integration
    this.llmIntegration = {
      enabled: this.config.enableLLMIntegration,
      tools: new Map(),
      metadata: new Map(),
      conversations: []
    };

    // Simulation environment
    this.simulationEnvironment = {
      containers: new Map(),
      scenarios: [],
      results: []
    };
  }

  /**
   * Create a container for a campaign
   */
  async createContainer(campaignId, config = {}) {
    try {
      const containerId = `container_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      console.log(`📦 Creating container for campaign: ${campaignId}`);
      
      // Load campaign
      const campaign = await campaignOrchestrationService.getCampaign(campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }
      
      const container = {
        containerId,
        campaignId,
        miningId: campaign.mining_id,
        status: 'created',
        workers: new Map(),
        config: {
          maxWorkers: config.maxWorkers || this.config.maxWorkersPerContainer,
          isolation: config.isolation || 'process',
          ...config
        },
        stats: {
          totalWorkers: 0,
          activeWorkers: 0,
          dataExtracted: 0,
          errors: 0
        },
        dataStream: {
          enabled: true,
          aggregatedData: [],
          lastUpdate: Date.now()
        },
        createdAt: new Date().toISOString()
      };
      
      this.containers.set(containerId, container);
      
      // Register schema plugins from campaign
      await this.registerCampaignSchemas(campaign, containerId);
      
      this.emit('containerCreated', container);
      console.log(`✅ Container created: ${containerId}`);
      
      return container;
    } catch (error) {
      console.error('Container creation failed:', error);
      throw error;
    }
  }

  /**
   * Register schema plugins from campaign for LLM configuration
   */
  async registerCampaignSchemas(campaign, containerId) {
    if (!this.llmIntegration.enabled) return;
    
    console.log('📋 Registering campaign schemas as LLM plugins');
    
    // Get research schemas
    if (campaign.research_id) {
      const researchService = (await import('./research-instance-service.js')).default;
      const research = await researchService.getResearch(campaign.research_id);
      
      if (research && research.discovered_schemas) {
        for (const schema of research.discovered_schemas) {
          this.registerSchemaPlugin(containerId, schema);
        }
      }
    }
    
    // Get attribute schemas
    if (campaign.mining_id) {
      const attributeService = (await import('./attribute-discovery-service.js')).default;
      const miningService = (await import('./data-mining-instance-service.js')).default;
      
      const miningInstance = await miningService.getMiningInstance(campaign.mining_id);
      if (miningInstance && miningInstance.research_id) {
        const attributes = await attributeService.getAttributesByResearch(miningInstance.research_id);
        
        // Convert attributes to schema plugins
        for (const attr of attributes) {
          this.registerAttributeAsPlugin(containerId, attr);
        }
      }
    }
  }

  /**
   * Register schema as LLM plugin
   */
  registerSchemaPlugin(containerId, schema) {
    const plugin = {
      pluginId: `plugin_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      containerId,
      schemaId: schema['@id'],
      schemaType: schema['@type'],
      name: schema.name,
      properties: schema.properties || [],
      metadata: {
        source: schema.source || 'research',
        confidence: schema.confidence || 0.8
      },
      llmMetadata: {
        description: schema.description,
        context: schema['@context'],
        useCases: ['data_extraction', 'validation', 'enrichment']
      }
    };
    
    this.schemaPlugins.set(plugin.pluginId, plugin);
    
    // Register as LLM metadata
    this.llmIntegration.metadata.set(plugin.pluginId, {
      type: 'schema',
      schema: plugin,
      capabilities: ['extract', 'validate', 'transform']
    });
    
    console.log(`✅ Registered schema plugin: ${plugin.name}`);
  }

  /**
   * Register attribute as schema plugin
   */
  registerAttributeAsPlugin(containerId, attribute) {
    const plugin = {
      pluginId: `attr_plugin_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      containerId,
      attributeId: attribute.attribute_id,
      name: attribute.name,
      category: attribute.category,
      dataType: attribute.data_type,
      miningAlgorithm: attribute.mining_algorithm,
      selectorStrategy: attribute.selector_strategy,
      configurableOptions: attribute.configurable_options,
      llmMetadata: {
        description: attribute.description,
        skillType: 'data_mining',
        parameters: this.convertToLLMParameters(attribute)
      }
    };
    
    this.schemaPlugins.set(plugin.pluginId, plugin);
    
    // Register as LLM tool
    const llmTool = {
      type: 'function',
      function: {
        name: `extract_${attribute.name}`,
        description: attribute.description,
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to extract data from'
            },
            ...this.convertOptionsToParameters(attribute.configurable_options)
          },
          required: ['url']
        }
      }
    };
    
    this.llmIntegration.tools.set(plugin.pluginId, llmTool);
    
    console.log(`✅ Registered attribute plugin: ${plugin.name}`);
  }

  /**
   * Convert attribute to LLM parameters
   */
  convertToLLMParameters(attribute) {
    return {
      name: attribute.name,
      type: attribute.data_type,
      algorithm: attribute.mining_algorithm,
      category: attribute.category,
      priority: attribute.priority,
      required: attribute.is_required
    };
  }

  /**
   * Convert configurable options to LLM parameters
   */
  convertOptionsToParameters(options) {
    const params = {};
    
    if (options) {
      for (const option of options) {
        params[option.name] = {
          type: option.type,
          description: option.description,
          default: option.default
        };
        
        if (option.type === 'select' && option.options) {
          params[option.name].enum = option.options;
        }
      }
    }
    
    return params;
  }

  /**
   * Get LLM configuration for a container
   */
  getLLMConfiguration(containerId) {
    const tools = [];
    const metadata = [];
    
    // Get plugins for this container
    for (const [pluginId, plugin] of this.schemaPlugins) {
      if (plugin.containerId === containerId) {
        const tool = this.llmIntegration.tools.get(pluginId);
        if (tool) {
          tools.push(tool);
        }
        
        const meta = this.llmIntegration.metadata.get(pluginId);
        if (meta) {
          metadata.push(meta);
        }
      }
    }
    
    return {
      tools,
      metadata,
      systemPrompt: this.generateLLMSystemPrompt(containerId),
      capabilities: this.getContainerCapabilities(containerId)
    };
  }

  /**
   * Generate LLM system prompt based on container configuration
   */
  generateLLMSystemPrompt(containerId) {
    const container = this.containers.get(containerId);
    if (!container) return '';
    
    const plugins = Array.from(this.schemaPlugins.values())
      .filter(p => p.containerId === containerId);
    
    return `You are a data mining AI assistant with access to ${plugins.length} specialized tools for extracting web data.

Available schemas and capabilities:
${plugins.map(p => `- ${p.name}: ${p.llmMetadata?.description || 'Data extraction tool'}`).join('\n')}

You can extract structured data from websites, validate it against schemas, and provide insights.
Use the available tools to answer questions about website data and SEO metrics.`;
  }

  /**
   * Get container capabilities
   */
  getContainerCapabilities(containerId) {
    const plugins = Array.from(this.schemaPlugins.values())
      .filter(p => p.containerId === containerId);
    
    const capabilities = new Set();
    
    for (const plugin of plugins) {
      if (plugin.miningAlgorithm) {
        capabilities.add(`extract_${plugin.category}`);
      }
      if (plugin.schemaType) {
        capabilities.add(`validate_${plugin.schemaType}`);
      }
    }
    
    return Array.from(capabilities);
  }

  /**
   * Spawn worker in container
   */
  async spawnWorker(containerId, config = {}) {
    const container = this.containers.get(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    if (container.workers.size >= container.config.maxWorkers) {
      throw new Error('Container at maximum worker capacity');
    }
    
    console.log(`🚀 Spawning worker in container: ${containerId}`);
    
    try {
      // Create worker
      const worker = new CampaignWebCrawlerWorker({
        headless: true,
        containerMode: true,
        realTimeStreaming: true,
        enableSimulation: true,
        ...config
      });
      
      // Initialize with mining instance
      await worker.initialize(container.miningId, config);
      
      // Subscribe to worker data stream
      worker.subscribe((data) => {
        this.aggregateData(containerId, data);
      });
      
      // Register worker
      container.workers.set(worker.workerId, worker);
      this.workers.set(worker.workerId, worker);
      
      container.stats.totalWorkers++;
      container.stats.activeWorkers++;
      
      this.emit('workerSpawned', {
        containerId,
        workerId: worker.workerId
      });
      
      console.log(`✅ Worker spawned: ${worker.workerId}`);
      
      return worker;
    } catch (error) {
      console.error('Worker spawn failed:', error);
      throw error;
    }
  }

  /**
   * Aggregate data from workers
   */
  aggregateData(containerId, data) {
    if (!this.dataAggregator.enabled) return;
    
    const container = this.containers.get(containerId);
    if (!container) return;
    
    // Add to container stream
    container.dataStream.aggregatedData.push({
      ...data,
      containerId,
      timestamp: Date.now()
    });
    
    container.dataStream.lastUpdate = Date.now();
    container.stats.dataExtracted++;
    
    // Add to global aggregator
    this.dataAggregator.buffer.push({
      ...data,
      containerId
    });
    
    // Notify subscribers
    for (const subscriber of this.dataAggregator.subscribers) {
      try {
        subscriber(data, containerId);
      } catch (error) {
        console.error('Aggregator subscriber error:', error);
      }
    }
    
    this.emit('dataAggregated', { containerId, data });
  }

  /**
   * Subscribe to aggregated data stream
   */
  subscribeToAggregatedData(callback) {
    this.dataAggregator.subscribers.add(callback);
    
    return () => {
      this.dataAggregator.subscribers.delete(callback);
    };
  }

  /**
   * Start container (start all workers)
   */
  async startContainer(containerId) {
    const container = this.containers.get(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    console.log(`▶️ Starting container: ${containerId}`);
    
    container.status = 'running';
    
    // Start all workers
    const workers = Array.from(container.workers.values());
    await Promise.all(workers.map(w => w.start()));
    
    this.emit('containerStarted', container);
  }

  /**
   * Stop container (stop all workers)
   */
  async stopContainer(containerId) {
    const container = this.containers.get(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    console.log(`⏹️ Stopping container: ${containerId}`);
    
    container.status = 'stopped';
    
    // Stop all workers
    const workers = Array.from(container.workers.values());
    await Promise.all(workers.map(w => w.stop()));
    
    container.stats.activeWorkers = 0;
    
    this.emit('containerStopped', container);
  }

  /**
   * Create simulation environment
   */
  async createSimulationEnvironment(campaignId, scenarios) {
    console.log('🎮 Creating simulation environment');
    
    const simEnv = {
      envId: `simenv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      campaignId,
      scenarios,
      containers: new Map(),
      results: [],
      status: 'ready'
    };
    
    // Create container for each scenario
    for (const scenario of scenarios) {
      const container = await this.createContainer(campaignId, {
        simulation: true,
        scenario: scenario.id,
        ...scenario.config
      });
      
      simEnv.containers.set(scenario.id, container.containerId);
    }
    
    this.simulationEnvironment.containers.set(simEnv.envId, simEnv);
    
    return simEnv;
  }

  /**
   * Run simulation across all scenarios
   */
  async runSimulation(envId) {
    const simEnv = this.simulationEnvironment.containers.get(envId);
    if (!simEnv) {
      throw new Error(`Simulation environment ${envId} not found`);
    }
    
    console.log('🎮 Running simulation...');
    simEnv.status = 'running';
    
    const results = [];
    
    // Run each scenario container
    for (const [scenarioId, containerId] of simEnv.containers) {
      console.log(`Running scenario: ${scenarioId}`);
      
      const container = this.containers.get(containerId);
      
      // Spawn worker and run
      const worker = await this.spawnWorker(containerId);
      await worker.start();
      
      // Collect results
      results.push({
        scenarioId,
        containerId,
        stats: container.stats,
        dataExtracted: container.dataStream.aggregatedData.length
      });
    }
    
    simEnv.results = results;
    simEnv.status = 'completed';
    
    this.emit('simulationCompleted', simEnv);
    
    return results;
  }

  /**
   * Get container status
   */
  getContainerStatus(containerId) {
    const container = this.containers.get(containerId);
    if (!container) return null;
    
    return {
      containerId: container.containerId,
      campaignId: container.campaignId,
      status: container.status,
      stats: container.stats,
      workers: Array.from(container.workers.values()).map(w => w.getStatus()),
      dataStreamStats: {
        enabled: container.dataStream.enabled,
        dataPoints: container.dataStream.aggregatedData.length,
        lastUpdate: container.dataStream.lastUpdate
      },
      llmConfig: this.getLLMConfiguration(containerId)
    };
  }

  /**
   * Get all containers status
   */
  getAllContainersStatus() {
    return Array.from(this.containers.keys()).map(id => this.getContainerStatus(id));
  }

  /**
   * Destroy container
   */
  async destroyContainer(containerId) {
    const container = this.containers.get(containerId);
    if (!container) return;
    
    console.log(`🗑️ Destroying container: ${containerId}`);
    
    // Stop all workers
    await this.stopContainer(containerId);
    
    // Remove workers
    for (const workerId of container.workers.keys()) {
      this.workers.delete(workerId);
    }
    
    // Remove container
    this.containers.delete(containerId);
    
    // Clean up plugins
    for (const [pluginId, plugin] of this.schemaPlugins) {
      if (plugin.containerId === containerId) {
        this.schemaPlugins.delete(pluginId);
        this.llmIntegration.tools.delete(pluginId);
        this.llmIntegration.metadata.delete(pluginId);
      }
    }
    
    this.emit('containerDestroyed', { containerId });
  }
}

export default CampaignContainerManager;
export { CampaignContainerManager };
