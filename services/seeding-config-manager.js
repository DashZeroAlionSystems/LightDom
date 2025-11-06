/**
 * Seeding Configuration Manager
 * 
 * Manages configuration for URL seeding service instances.
 * Provides CRUD operations and template management.
 * Integrates with DeepSeek for AI-powered config generation.
 * 
 * Features:
 * - CRUD operations for seeding configurations
 * - Template system for new instances
 * - DeepSeek workflow integration
 * - Instance isolation and management
 * - Configuration validation
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Conditionally import DeepSeek service
let deepSeekService = null;
try {
  const module = await import('./deepseek-api-service.js');
  deepSeekService = module.default;
} catch (error) {
  console.warn('⚠️  DeepSeek service not available:', error.message);
}

export class SeedingConfigManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      configDir: config.configDir || './config/seeding',
      templateDir: config.templateDir || './config/seeding/templates',
      enableDeepSeek: config.enableDeepSeek !== false,
      validateConfigs: config.validateConfigs !== false,
      ...config
    };

    this.db = config.db || null;
    this.configs = new Map(); // instanceId -> config
    this.templates = new Map(); // templateName -> template
    
    this.init();
  }

  /**
   * Initialize configuration manager
   */
  async init() {
    // Ensure directories exist
    await this.ensureDirectories();
    
    // Load existing configs
    await this.loadConfigs();
    
    // Load templates
    await this.loadTemplates();
    
    console.log('✅ Seeding Configuration Manager initialized');
  }

  /**
   * Ensure necessary directories exist
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(this.config.configDir, { recursive: true });
      await fs.mkdir(this.config.templateDir, { recursive: true });
      console.log('✅ Configuration directories ready');
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  /**
   * Create a new seeding configuration
   */
  async createConfig(data) {
    console.log('📝 Creating new seeding configuration...');

    // Generate unique instance ID
    const instanceId = data.instanceId || this.generateInstanceId();

    // Build configuration from template or data
    let config;
    
    if (data.templateName) {
      // Use template
      const template = this.templates.get(data.templateName);
      if (!template) {
        throw new Error(`Template not found: ${data.templateName}`);
      }
      config = { ...template, ...data };
    } else if (data.prompt && this.config.enableDeepSeek) {
      // Generate from prompt using DeepSeek
      config = await this.generateConfigFromPrompt(data.prompt, data);
    } else {
      // Use provided data
      config = data;
    }

    // Set instance ID
    config.instanceId = instanceId;

    // Add metadata
    config.createdAt = new Date().toISOString();
    config.updatedAt = new Date().toISOString();
    config.status = 'created';

    // Validate configuration
    if (this.config.validateConfigs) {
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
    }

    // Store in memory
    this.configs.set(instanceId, config);

    // Save to file
    await this.saveConfigToFile(instanceId, config);

    // Save to database
    if (this.db) {
      await this.saveConfigToDatabase(config);
    }

    this.emit('configCreated', { instanceId, config });
    console.log(`✅ Configuration created: ${instanceId}`);

    return config;
  }

  /**
   * Read a configuration
   */
  async readConfig(instanceId) {
    // Check memory cache
    let config = this.configs.get(instanceId);

    if (!config) {
      // Load from file
      config = await this.loadConfigFromFile(instanceId);
    }

    if (!config && this.db) {
      // Load from database
      config = await this.loadConfigFromDatabase(instanceId);
    }

    if (!config) {
      throw new Error(`Configuration not found: ${instanceId}`);
    }

    return config;
  }

  /**
   * Update a configuration
   */
  async updateConfig(instanceId, updates) {
    console.log(`📝 Updating configuration: ${instanceId}`);

    // Load existing config
    const config = await this.readConfig(instanceId);

    // Apply updates
    const updatedConfig = {
      ...config,
      ...updates,
      instanceId, // Preserve instance ID
      updatedAt: new Date().toISOString()
    };

    // Validate
    if (this.config.validateConfigs) {
      const validation = this.validateConfig(updatedConfig);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
    }

    // Update in memory
    this.configs.set(instanceId, updatedConfig);

    // Save to file
    await this.saveConfigToFile(instanceId, updatedConfig);

    // Update in database
    if (this.db) {
      await this.saveConfigToDatabase(updatedConfig);
    }

    this.emit('configUpdated', { instanceId, config: updatedConfig });
    console.log(`✅ Configuration updated: ${instanceId}`);

    return updatedConfig;
  }

  /**
   * Delete a configuration
   */
  async deleteConfig(instanceId) {
    console.log(`🗑️  Deleting configuration: ${instanceId}`);

    // Check if exists
    const config = this.configs.get(instanceId);
    if (!config) {
      throw new Error(`Configuration not found: ${instanceId}`);
    }

    // Remove from memory
    this.configs.delete(instanceId);

    // Delete file
    await this.deleteConfigFile(instanceId);

    // Delete from database
    if (this.db) {
      await this.deleteConfigFromDatabase(instanceId);
    }

    this.emit('configDeleted', { instanceId });
    console.log(`✅ Configuration deleted: ${instanceId}`);

    return true;
  }

  /**
   * List all configurations
   */
  async listConfigs(filter = {}) {
    let configs = Array.from(this.configs.values());

    // Apply filters
    if (filter.status) {
      configs = configs.filter(c => c.status === filter.status);
    }

    if (filter.clientId) {
      configs = configs.filter(c => c.clientId === filter.clientId);
    }

    if (filter.campaignId) {
      configs = configs.filter(c => c.campaignId === filter.campaignId);
    }

    return configs;
  }

  /**
   * Generate configuration from prompt using DeepSeek
   */
  async generateConfigFromPrompt(prompt, additionalData = {}) {
    if (!this.config.enableDeepSeek) {
      throw new Error('DeepSeek integration is not enabled');
    }

    if (!deepSeekService) {
      throw new Error('DeepSeek service is not available. Please check DeepSeek API service is installed and configured.');
    }

    console.log('🤖 Generating configuration from prompt using DeepSeek...');

    try {
      // Generate workflow configuration
      const workflow = await deepSeekService.generateWorkflowFromPrompt(prompt, {
        includeSeeding: true
      });

      // Generate URL seeds
      const seeds = await deepSeekService.generateURLSeeds(
        prompt,
        additionalData.clientSiteUrl || '',
        {}
      );

      // Build configuration
      const config = {
        name: workflow.workflowName || 'Unnamed Configuration',
        description: workflow.description || prompt,
        clientId: additionalData.clientId,
        clientSiteUrl: additionalData.clientSiteUrl,
        campaignId: additionalData.campaignId,
        
        // Seeding settings
        maxSeedsPerInstance: 1000,
        seedRefreshInterval: 3600000, // 1 hour
        searchDepth: workflow.configuration?.maxDepth || 3,
        minBacklinkQuality: 0.5,
        
        // Feature flags
        enableSearchAlgorithms: true,
        enableRelatedURLDiscovery: true,
        enableBacklinkGeneration: true,
        
        // Initial seeds
        seeds: this.mergeSeeds(seeds),
        
        // Search configuration
        keywords: this.extractKeywords(prompt),
        topics: this.extractTopics(prompt),
        competitors: additionalData.competitors || [],
        authorityDomains: this.getAuthorityDomains(prompt),
        
        // Crawler integration
        crawlerConfig: {
          maxDepth: workflow.configuration?.maxDepth || 2,
          parallelCrawlers: workflow.configuration?.parallelCrawlers || 5,
          requestDelay: 2000,
          respectRobotsTxt: true
        },
        
        // Rich snippet settings
        richSnippets: {
          enabled: true,
          schemaTypes: ['Organization', 'Article', 'Product', 'WebPage']
        },
        
        // Reporting
        reportingInterval: 86400000, // 24 hours
        emailReports: additionalData.emailReports || false,
        
        // Advanced options
        excludeSameDomain: false,
        followRedirects: true,
        userAgent: 'LightDom-Seeding-Service/1.0'
      };

      console.log('✅ Configuration generated from prompt');
      return config;
    } catch (error) {
      console.error('Failed to generate config from prompt:', error);
      throw new Error(`Configuration generation failed: ${error.message}`);
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const errors = [];

    // Required fields
    if (!config.name) {
      errors.push('name is required');
    }

    if (!config.maxSeedsPerInstance || config.maxSeedsPerInstance < 1) {
      errors.push('maxSeedsPerInstance must be at least 1');
    }

    if (!config.searchDepth || config.searchDepth < 1) {
      errors.push('searchDepth must be at least 1');
    }

    if (config.minBacklinkQuality < 0 || config.minBacklinkQuality > 1) {
      errors.push('minBacklinkQuality must be between 0 and 1');
    }

    // Validate seeds
    if (config.seeds && !Array.isArray(config.seeds)) {
      errors.push('seeds must be an array');
    }

    // Validate crawler config
    if (config.crawlerConfig) {
      if (config.crawlerConfig.maxDepth < 1) {
        errors.push('crawlerConfig.maxDepth must be at least 1');
      }
      if (config.crawlerConfig.parallelCrawlers < 1) {
        errors.push('crawlerConfig.parallelCrawlers must be at least 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create configuration template
   */
  async createTemplate(name, config) {
    console.log(`📋 Creating template: ${name}`);

    const template = {
      ...config,
      templateName: name,
      createdAt: new Date().toISOString()
    };

    // Store in memory
    this.templates.set(name, template);

    // Save to file
    const templatePath = path.join(this.config.templateDir, `${name}.json`);
    await fs.writeFile(templatePath, JSON.stringify(template, null, 2), 'utf-8');

    this.emit('templateCreated', { name, template });
    console.log(`✅ Template created: ${name}`);

    return template;
  }

  /**
   * Load configuration from file
   */
  async loadConfigFromFile(instanceId) {
    try {
      const configPath = path.join(this.config.configDir, `${instanceId}.json`);
      const data = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(data);
      this.configs.set(instanceId, config);
      return config;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfigToFile(instanceId, config) {
    try {
      const configPath = path.join(this.config.configDir, `${instanceId}.json`);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save config to file:', error);
    }
  }

  /**
   * Delete configuration file
   */
  async deleteConfigFile(instanceId) {
    try {
      const configPath = path.join(this.config.configDir, `${instanceId}.json`);
      await fs.unlink(configPath);
    } catch (error) {
      console.error('Failed to delete config file:', error);
    }
  }

  /**
   * Load all configurations
   */
  async loadConfigs() {
    try {
      const files = await fs.readdir(this.config.configDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const instanceId = file.replace('.json', '');
          await this.loadConfigFromFile(instanceId);
        }
      }

      console.log(`✅ Loaded ${this.configs.size} configurations`);
    } catch (error) {
      console.warn('Failed to load configs:', error);
    }
  }

  /**
   * Load templates
   */
  async loadTemplates() {
    try {
      const files = await fs.readdir(this.config.templateDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(this.config.templateDir, file);
          const data = await fs.readFile(templatePath, 'utf-8');
          const template = JSON.parse(data);
          this.templates.set(template.templateName, template);
        }
      }

      console.log(`✅ Loaded ${this.templates.size} templates`);
    } catch (error) {
      console.warn('Failed to load templates:', error);
    }
  }

  /**
   * Save configuration to database
   */
  async saveConfigToDatabase(config) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO seeding_configs 
        (instance_id, name, description, client_id, config_data, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (instance_id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          config_data = EXCLUDED.config_data,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at`,
        [
          config.instanceId,
          config.name,
          config.description,
          config.clientId,
          JSON.stringify(config),
          config.status,
          config.createdAt,
          config.updatedAt
        ]
      );
    } catch (error) {
      console.error('Failed to save config to database:', error);
    }
  }

  /**
   * Load configuration from database
   */
  async loadConfigFromDatabase(instanceId) {
    if (!this.db) return null;

    try {
      const result = await this.db.query(
        `SELECT * FROM seeding_configs WHERE instance_id = $1`,
        [instanceId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const config = result.rows[0].config_data;
      this.configs.set(instanceId, config);
      return config;
    } catch (error) {
      console.error('Failed to load config from database:', error);
      return null;
    }
  }

  /**
   * Delete configuration from database
   */
  async deleteConfigFromDatabase(instanceId) {
    if (!this.db) return;

    try {
      await this.db.query(
        `DELETE FROM seeding_configs WHERE instance_id = $1`,
        [instanceId]
      );
    } catch (error) {
      console.error('Failed to delete config from database:', error);
    }
  }

  /**
   * Generate instance ID
   */
  generateInstanceId() {
    return `seed_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Merge seed lists from DeepSeek
   */
  mergeSeeds(seeds) {
    const allSeeds = [];

    if (seeds.primarySeeds) allSeeds.push(...seeds.primarySeeds);
    if (seeds.competitorSeeds) allSeeds.push(...seeds.competitorSeeds);
    if (seeds.authoritySeeds) allSeeds.push(...seeds.authoritySeeds);
    if (seeds.trainingDataSeeds) allSeeds.push(...seeds.trainingDataSeeds);

    return [...new Set(allSeeds)]; // Remove duplicates
  }

  /**
   * Extract keywords from prompt
   */
  extractKeywords(prompt) {
    // Simple keyword extraction (can be enhanced with NLP)
    const words = prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'that', 'this', 'with'].includes(word));
    
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Extract topics from prompt
   */
  extractTopics(prompt) {
    // Extract potential topics (can be enhanced)
    const topics = [];
    const topicPatterns = [
      /SEO/gi,
      /marketing/gi,
      /e-commerce/gi,
      /blog/gi,
      /business/gi,
      /technology/gi
    ];

    for (const pattern of topicPatterns) {
      if (pattern.test(prompt)) {
        const match = prompt.match(pattern);
        if (match) {
          topics.push(match[0].toLowerCase());
        }
      }
    }

    return [...new Set(topics)];
  }

  /**
   * Get authority domains based on prompt context
   */
  getAuthorityDomains(prompt) {
    // Default authority domains (can be customized)
    const defaults = [
      'google.com',
      'wikipedia.org',
      'forbes.com',
      'techcrunch.com',
      'medium.com'
    ];

    // Add industry-specific domains based on prompt
    if (/e-commerce|shop/i.test(prompt)) {
      defaults.push('shopify.com', 'amazon.com');
    }
    
    if (/tech|software/i.test(prompt)) {
      defaults.push('github.com', 'stackoverflow.com');
    }

    return defaults;
  }
}

export default SeedingConfigManager;
