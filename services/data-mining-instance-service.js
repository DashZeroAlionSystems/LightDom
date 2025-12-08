/**
 * Data Mining Instance Service
 * 
 * Manages data mining operations with configurable attributes.
 * Links to research instances and coordinates attribute-based extraction.
 * 
 * Features:
 * - Create mining instances from research
 * - Configure attribute-based extraction
 * - Queue attribute mining tasks
 * - Execute mining operations
 * - Track results and metrics
 */

import { EventEmitter } from 'events';
import researchInstanceService from './research-instance-service.js';
import attributeDiscoveryService from './attribute-discovery-service.js';

class DataMiningInstanceService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      defaultMaxDepth: config.defaultMaxDepth || 3,
      defaultMaxUrls: config.defaultMaxUrls || 100,
      defaultRateLimit: config.defaultRateLimit || 1000,
      ...config
    };

    this.miningInstances = new Map();
    this.db = config.db || null;
  }

  /**
   * Create a data mining instance with attributes
   */
  async createMiningInstance(name, options = {}) {
    try {
      console.log(`⛏️ Creating data mining instance: ${name}`);

      const miningId = `mining_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const instance = {
        mining_id: miningId,
        name,
        description: options.description || `Data mining instance for ${name}`,
        research_id: options.researchId || null,
        status: 'configuring',
        target_urls: options.targetUrls || [],
        enabled_attributes: options.enabledAttributes || [],
        attribute_config: options.attributeConfig || {},
        schedule: options.schedule || null,
        priority: options.priority || 5,
        max_depth: options.maxDepth || this.config.defaultMaxDepth,
        max_urls: options.maxUrls || this.config.defaultMaxUrls,
        rate_limit_ms: options.rateLimit || this.config.defaultRateLimit,
        results_count: 0,
        error_count: 0,
        metadata: options.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.miningInstances.set(miningId, instance);

      if (this.db) {
        await this.saveMiningInstanceToDB(instance);
      }

      this.emit('miningInstanceCreated', instance);
      console.log(`✅ Mining instance created: ${miningId}`);

      return instance;
    } catch (error) {
      console.error('Failed to create mining instance:', error);
      throw error;
    }
  }

  /**
   * Create mining instance from research with auto-configured attributes
   */
  async createFromResearch(researchId, options = {}) {
    try {
      console.log(`🔬 Creating mining instance from research: ${researchId}`);

      // Get research instance
      const research = await researchInstanceService.getResearch(researchId);
      if (!research) {
        throw new Error(`Research instance ${researchId} not found`);
      }

      // Get discovered attributes
      const attributes = await attributeDiscoveryService.getAttributesByResearch(researchId);
      if (attributes.length === 0) {
        // Discover attributes if not already done
        console.log('📋 No attributes found, discovering...');
        await attributeDiscoveryService.discoverAttributes(researchId);
        attributes.push(...await attributeDiscoveryService.getAttributesByResearch(researchId));
      }

      // Enable high-priority attributes by default
      const enabledAttributes = attributes
        .filter(attr => attr.priority >= 7 || attr.is_required)
        .map(attr => attr.attribute_id);

      // Extract target URLs from research
      const targetUrls = this.extractTargetUrls(research);

      // Create instance
      const instance = await this.createMiningInstance(
        `${research.topic} Mining`,
        {
          researchId,
          description: `Data mining for ${research.topic}`,
          targetUrls,
          enabledAttributes,
          attributeConfig: this.createDefaultAttributeConfig(attributes),
          ...options
        }
      );

      // Create attribute mining tasks
      await this.createAttributeMiningTasks(instance.mining_id);

      return instance;
    } catch (error) {
      console.error('Failed to create mining instance from research:', error);
      throw error;
    }
  }

  /**
   * Extract target URLs from research
   */
  extractTargetUrls(research) {
    const urls = [];

    // Extract from wiki links
    if (research.wiki_links) {
      for (const link of research.wiki_links) {
        if (link.url && link.relevance === 'primary') {
          urls.push(link.url);
        }
      }
    }

    // Extract from metadata
    if (research.metadata?.dataSources) {
      for (const source of research.metadata.dataSources) {
        if (source.url) {
          urls.push(source.url);
        }
      }
    }

    // If no URLs found, return empty array (will need manual configuration)
    return urls;
  }

  /**
   * Create default attribute configuration
   */
  createDefaultAttributeConfig(attributes) {
    const config = {};

    for (const attr of attributes) {
      config[attr.attribute_id] = {
        enabled: attr.priority >= 7 || attr.is_required,
        options: this.getDefaultOptions(attr.configurable_options)
      };
    }

    return config;
  }

  /**
   * Get default values for configurable options
   */
  getDefaultOptions(configurableOptions) {
    const defaults = {};

    if (configurableOptions) {
      for (const option of configurableOptions) {
        defaults[option.name] = option.default;
      }
    }

    return defaults;
  }

  /**
   * Add attributes to a mining instance
   */
  async addAttributes(miningId, attributeIds, config = {}) {
    try {
      const instance = await this.getMiningInstance(miningId);
      if (!instance) {
        throw new Error(`Mining instance ${miningId} not found`);
      }

      // Add new attribute IDs
      const newAttributes = attributeIds.filter(id => !instance.enabled_attributes.includes(id));
      instance.enabled_attributes.push(...newAttributes);

      // Merge attribute config
      for (const attrId of attributeIds) {
        if (config[attrId]) {
          instance.attribute_config[attrId] = {
            ...instance.attribute_config[attrId],
            ...config[attrId]
          };
        }
      }

      instance.updated_at = new Date().toISOString();

      if (this.db) {
        await this.updateMiningInstanceInDB(instance);
      }

      // Create mining tasks for new attributes
      await this.createAttributeMiningTasks(miningId, newAttributes);

      this.emit('attributesAdded', { miningId, attributeIds: newAttributes });
      console.log(`✅ Added ${newAttributes.length} attributes to mining instance ${miningId}`);

      return instance;
    } catch (error) {
      console.error('Failed to add attributes:', error);
      throw error;
    }
  }

  /**
   * Create attribute mining tasks
   */
  async createAttributeMiningTasks(miningId, attributeIds = null) {
    try {
      const instance = await this.getMiningInstance(miningId);
      if (!instance) {
        throw new Error(`Mining instance ${miningId} not found`);
      }

      const targetAttributes = attributeIds || instance.enabled_attributes;
      const tasks = [];

      // Create tasks for each URL x Attribute combination
      for (const url of instance.target_urls) {
        for (const attrId of targetAttributes) {
          const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
          
          const task = {
            task_id: taskId,
            mining_id: miningId,
            attribute_id: attrId,
            target_url: url,
            status: 'queued',
            priority: instance.priority,
            retry_count: 0,
            max_retries: 3,
            created_at: new Date().toISOString()
          };

          tasks.push(task);

          if (this.db) {
            await this.saveTaskToDB(task);
          }
        }
      }

      console.log(`📋 Created ${tasks.length} attribute mining tasks for ${miningId}`);
      this.emit('tasksCreated', { miningId, count: tasks.length });

      return tasks;
    } catch (error) {
      console.error('Failed to create attribute mining tasks:', error);
      throw error;
    }
  }

  /**
   * Queue mining instance for execution
   */
  async queueMiningInstance(miningId) {
    try {
      const instance = await this.getMiningInstance(miningId);
      if (!instance) {
        throw new Error(`Mining instance ${miningId} not found`);
      }

      if (instance.status !== 'configuring' && instance.status !== 'paused') {
        throw new Error(`Mining instance must be in 'configuring' or 'paused' status. Current: ${instance.status}`);
      }

      instance.status = 'queued';
      instance.updated_at = new Date().toISOString();

      if (this.db) {
        await this.updateMiningInstanceInDB(instance);
      }

      this.emit('instanceQueued', instance);
      console.log(`📤 Mining instance queued: ${miningId}`);

      return instance;
    } catch (error) {
      console.error('Failed to queue mining instance:', error);
      throw error;
    }
  }

  /**
   * Start mining instance execution
   */
  async startMiningInstance(miningId) {
    try {
      const instance = await this.getMiningInstance(miningId);
      if (!instance) {
        throw new Error(`Mining instance ${miningId} not found`);
      }

      instance.status = 'running';
      instance.started_at = new Date().toISOString();
      instance.updated_at = new Date().toISOString();

      if (this.db) {
        await this.updateMiningInstanceInDB(instance);
      }

      this.emit('instanceStarted', instance);
      console.log(`▶️ Mining instance started: ${miningId}`);

      // Execute mining (async)
      this.executeMining(miningId).catch(error => {
        console.error(`Mining execution failed for ${miningId}:`, error);
        this.updateMiningStatus(miningId, 'failed', { error: error.message });
      });

      return instance;
    } catch (error) {
      console.error('Failed to start mining instance:', error);
      throw error;
    }
  }

  /**
   * Execute mining operations
   */
  async executeMining(miningId) {
    // This is a placeholder for actual mining execution
    // In production, this would:
    // 1. Fetch queued tasks from database
    // 2. Execute each task using the appropriate mining algorithm
    // 3. Extract data using selector strategies
    // 4. Validate extracted data
    // 5. Store results
    // 6. Update task and instance status

    console.log(`🔨 Executing mining for instance: ${miningId}`);
    
    const instance = await this.getMiningInstance(miningId);
    
    // Simulate mining execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    instance.status = 'completed';
    instance.completed_at = new Date().toISOString();
    instance.results_count = instance.target_urls.length * instance.enabled_attributes.length;
    
    if (this.db) {
      await this.updateMiningInstanceInDB(instance);
    }
    
    this.emit('instanceCompleted', instance);
    console.log(`✅ Mining completed for instance: ${miningId}`);
  }

  /**
   * Update mining instance status
   */
  async updateMiningStatus(miningId, status, metadata = {}) {
    const instance = await this.getMiningInstance(miningId);
    if (!instance) {
      throw new Error(`Mining instance ${miningId} not found`);
    }

    instance.status = status;
    instance.updated_at = new Date().toISOString();
    instance.metadata = { ...instance.metadata, ...metadata };

    if (this.db) {
      await this.updateMiningInstanceInDB(instance);
    }

    this.emit('instanceStatusChanged', { miningId, status, metadata });
  }

  /**
   * Get mining instance
   */
  async getMiningInstance(miningId) {
    let instance = this.miningInstances.get(miningId);

    if (!instance && this.db) {
      instance = await this.loadMiningInstanceFromDB(miningId);
      if (instance) {
        this.miningInstances.set(miningId, instance);
      }
    }

    return instance;
  }

  /**
   * List mining instances
   */
  async listMiningInstances(filters = {}) {
    if (this.db) {
      return await this.listMiningInstancesFromDB(filters);
    }

    let instances = Array.from(this.miningInstances.values());

    if (filters.status) {
      instances = instances.filter(i => i.status === filters.status);
    }

    if (filters.researchId) {
      instances = instances.filter(i => i.research_id === filters.researchId);
    }

    return instances;
  }

  // Database operations
  async saveMiningInstanceToDB(instance) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO data_mining_instances 
        (mining_id, name, description, research_id, status, target_urls, enabled_attributes, 
         attribute_config, schedule, priority, max_depth, max_urls, rate_limit_ms, 
         results_count, error_count, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          instance.mining_id,
          instance.name,
          instance.description,
          instance.research_id,
          instance.status,
          JSON.stringify(instance.target_urls),
          JSON.stringify(instance.enabled_attributes),
          JSON.stringify(instance.attribute_config),
          JSON.stringify(instance.schedule),
          instance.priority,
          instance.max_depth,
          instance.max_urls,
          instance.rate_limit_ms,
          instance.results_count,
          instance.error_count,
          JSON.stringify(instance.metadata),
          instance.created_at,
          instance.updated_at
        ]
      );
    } catch (error) {
      console.error('Failed to save mining instance to database:', error);
    }
  }

  async updateMiningInstanceInDB(instance) {
    if (!this.db) return;

    try {
      await this.db.query(
        `UPDATE data_mining_instances 
        SET status = $1, target_urls = $2, enabled_attributes = $3, attribute_config = $4, 
            schedule = $5, priority = $6, max_depth = $7, max_urls = $8, rate_limit_ms = $9,
            results_count = $10, error_count = $11, metadata = $12, updated_at = $13,
            started_at = $14, completed_at = $15
        WHERE mining_id = $16`,
        [
          instance.status,
          JSON.stringify(instance.target_urls),
          JSON.stringify(instance.enabled_attributes),
          JSON.stringify(instance.attribute_config),
          JSON.stringify(instance.schedule),
          instance.priority,
          instance.max_depth,
          instance.max_urls,
          instance.rate_limit_ms,
          instance.results_count,
          instance.error_count,
          JSON.stringify(instance.metadata),
          instance.updated_at,
          instance.started_at || null,
          instance.completed_at || null,
          instance.mining_id
        ]
      );
    } catch (error) {
      console.error('Failed to update mining instance in database:', error);
    }
  }

  async loadMiningInstanceFromDB(miningId) {
    if (!this.db) return null;

    try {
      const result = await this.db.query(
        'SELECT * FROM data_mining_instances WHERE mining_id = $1',
        [miningId]
      );

      if (result.rows && result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (error) {
      console.error('Failed to load mining instance from database:', error);
    }

    return null;
  }

  async listMiningInstancesFromDB(filters = {}) {
    if (!this.db) return [];

    try {
      let query = 'SELECT * FROM data_mining_instances WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.researchId) {
        query += ` AND research_id = $${paramCount}`;
        params.push(filters.researchId);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await this.db.query(query, params);
      return result.rows || [];
    } catch (error) {
      console.error('Failed to list mining instances from database:', error);
      return [];
    }
  }

  async saveTaskToDB(task) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO attribute_mining_tasks 
        (task_id, mining_id, attribute_id, target_url, status, priority, retry_count, max_retries, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          task.task_id,
          task.mining_id,
          task.attribute_id,
          task.target_url,
          task.status,
          task.priority,
          task.retry_count,
          task.max_retries,
          task.created_at
        ]
      );
    } catch (error) {
      console.error('Failed to save task to database:', error);
    }
  }
}

// Export singleton instance
const dataMiningInstanceService = new DataMiningInstanceService();
export default dataMiningInstanceService;
