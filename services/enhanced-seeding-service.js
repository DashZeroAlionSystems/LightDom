/**
 * Enhanced Seeding Service with Schema Relationship Support
 * 
 * Integrates with DeepSeek to intelligently configure seeding based on
 * schema relationships discovered during data mining
 */

import deepSeekService from './deepseek-api-service.js';
import { EventEmitter } from 'events';

class EnhancedSeedingService extends EventEmitter {
  constructor() {
    super();
    
    this.services = new Map();
    this.schemaRelationships = new Map();
    this.configCache = new Map();
  }

  /**
   * Create seeding service with schema relationship awareness
   */
  async createWithSchemaRelationship(config) {
    const {
      name,
      type,
      baseConfig,
      relationshipValue,
      originalPrompt,
      campaignId
    } = config;

    // Step 1: Generate schema-aware configuration using DeepSeek
    const enhancedConfig = await this.generateSchemaAwareConfig({
      type,
      baseConfig,
      relationshipValue,
      originalPrompt,
      campaignId
    });

    // Step 2: Create the seeding service
    const service = {
      id: `seed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      config: enhancedConfig,
      relationshipValue,
      originalPrompt,
      campaignId,
      createdAt: new Date().toISOString(),
      status: 'active',
      stats: {
        urlsCollected: 0,
        lastRun: null,
        successRate: 0
      }
    };

    this.services.set(service.id, service);
    
    // Store schema relationship
    if (relationshipValue) {
      this.schemaRelationships.set(service.id, relationshipValue);
    }

    this.emit('service:created', service);
    
    return service;
  }

  /**
   * Generate schema-aware configuration using DeepSeek
   */
  async generateSchemaAwareConfig(params) {
    const {
      type,
      baseConfig,
      relationshipValue,
      originalPrompt,
      campaignId
    } = params;

    // Check cache first
    const cacheKey = `${type}_${relationshipValue}_${campaignId}`;
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }

    // Multi-step prompt to DeepSeek
    const promptSteps = [
      {
        step: 1,
        purpose: 'Understand original intent',
        prompt: `Original campaign prompt: "${originalPrompt}"\n\nWhat is the main goal and target of this campaign?`
      },
      {
        step: 2,
        purpose: 'Analyze schema relationship',
        prompt: `The data mining discovered this schema relationship: ${JSON.stringify(relationshipValue, null, 2)}\n\nHow does this schema relationship inform what URLs we should collect?`
      },
      {
        step: 3,
        purpose: 'Generate configuration',
        prompt: `Based on the campaign goal and schema relationship, generate a ${type} seeding service configuration.\n\nBase config: ${JSON.stringify(baseConfig, null, 2)}\n\nProvide an enhanced configuration that targets URLs related to this schema relationship. Return as JSON.`
      }
    ];

    try {
      const config = await this.executeMultiStepPrompt(promptSteps, type);
      
      // Cache the result
      this.configCache.set(cacheKey, config);
      
      return config;
    } catch (error) {
      console.error('Error generating schema-aware config:', error);
      // Fallback to base config
      return baseConfig || this.getDefaultConfig(type);
    }
  }

  /**
   * Execute multi-step prompt engineering with DeepSeek
   */
  async executeMultiStepPrompt(steps, seedType) {
    const context = {
      conversationHistory: [],
      insights: []
    };

    // Execute each step sequentially, building context
    for (const step of steps) {
      const response = await deepSeekService.chat({
        message: step.prompt,
        context: context.conversationHistory,
        systemPrompt: `You are an expert web crawler configuration specialist. 
        You understand URL patterns, sitemap structures, and how to target specific content types.
        Always provide actionable, technical configurations.`
      });

      // Store in conversation history
      context.conversationHistory.push({
        role: 'user',
        content: step.prompt
      });
      context.conversationHistory.push({
        role: 'assistant',
        content: response.content
      });

      // Extract insights
      context.insights.push({
        step: step.step,
        purpose: step.purpose,
        response: response.content
      });
    }

    // Parse final configuration from last response
    const finalResponse = context.insights[context.insights.length - 1].response;
    const config = this.parseConfigFromResponse(finalResponse, seedType);

    return config;
  }

  /**
   * Parse configuration from DeepSeek response
   */
  parseConfigFromResponse(response, seedType) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: parse structured text
      return this.parseStructuredResponse(response, seedType);
    } catch (error) {
      console.error('Error parsing config:', error);
      return this.getDefaultConfig(seedType);
    }
  }

  /**
   * Parse structured text response
   */
  parseStructuredResponse(response, seedType) {
    const config = this.getDefaultConfig(seedType);

    // Extract URL patterns
    const urlPattern = response.match(/URL pattern[s]?:\s*(.+)/i);
    if (urlPattern) {
      config.urlPattern = urlPattern[1].trim();
    }

    // Extract priorities
    const priority = response.match(/priority:\s*(\d+)/i);
    if (priority) {
      config.priority = parseInt(priority[1]);
    }

    // Extract limits
    const maxUrls = response.match(/max[imum]? URLs?:\s*(\d+)/i);
    if (maxUrls) {
      config.maxUrls = parseInt(maxUrls[1]);
    }

    return config;
  }

  /**
   * Get default configuration by type
   */
  getDefaultConfig(type) {
    const defaults = {
      sitemap: {
        followSubSitemaps: true,
        maxUrls: 1000,
        priority: 10,
        urlPattern: null,
        filters: []
      },
      search: {
        engines: ['google'],
        maxResultsPerEngine: 100,
        priority: 8,
        query: null
      },
      api: {
        method: 'GET',
        headers: {},
        priority: 5,
        dataPath: 'urls'
      }
    };

    return defaults[type] || {};
  }

  /**
   * Scrape sitemap with schema awareness
   */
  async scrapeSitemap(serviceId, options = {}) {
    const service = this.services.get(serviceId);
    if (!service || service.type !== 'sitemap') {
      throw new Error('Invalid sitemap service');
    }

    const { config } = service;
    const { url } = options;

    const urls = [];
    const visited = new Set();

    try {
      // Fetch sitemap
      const response = await fetch(url || config.url);
      const xml = await response.text();

      // Parse XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');

      // Extract URLs
      const urlElements = doc.querySelectorAll('url > loc');
      for (const element of urlElements) {
        const urlText = element.textContent.trim();
        
        // Apply schema-aware filters
        if (this.matchesSchemaRelationship(urlText, service)) {
          urls.push({
            url: urlText,
            priority: config.priority || 10,
            source: 'sitemap',
            serviceId,
            collectedAt: new Date().toISOString(),
            metadata: {
              schemaRelated: true,
              relationship: this.schemaRelationships.get(serviceId)
            }
          });
        }

        visited.add(urlText);
      }

      // Follow sub-sitemaps if configured
      if (config.followSubSitemaps) {
        const sitemapElements = doc.querySelectorAll('sitemap > loc');
        for (const element of sitemapElements) {
          const sitemapUrl = element.textContent.trim();
          if (!visited.has(sitemapUrl)) {
            const subUrls = await this.scrapeSitemap(serviceId, { url: sitemapUrl });
            urls.push(...subUrls);
          }
        }
      }

      // Update stats
      service.stats.urlsCollected += urls.length;
      service.stats.lastRun = new Date().toISOString();

      this.emit('urls:collected', { serviceId, count: urls.length });

      return urls;
    } catch (error) {
      console.error('Error scraping sitemap:', error);
      service.stats.successRate = (service.stats.successRate * 0.9); // Decay success rate
      throw error;
    }
  }

  /**
   * Check if URL matches schema relationship
   */
  matchesSchemaRelationship(url, service) {
    const relationship = this.schemaRelationships.get(service.id);
    if (!relationship) {
      return true; // No filter, accept all
    }

    // Check if URL contains relationship patterns
    const { schemaType, targetPath, keywords } = relationship;

    if (schemaType) {
      // Match schema type in URL
      const schemaPattern = schemaType.toLowerCase().replace(/\s+/g, '-');
      if (url.toLowerCase().includes(schemaPattern)) {
        return true;
      }
    }

    if (targetPath && url.includes(targetPath)) {
      return true;
    }

    if (keywords && keywords.length > 0) {
      return keywords.some(keyword => 
        url.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Use config urlPattern if exists
    if (service.config.urlPattern) {
      const pattern = new RegExp(service.config.urlPattern);
      return pattern.test(url);
    }

    return true;
  }

  /**
   * List all services
   */
  listServices(filters = {}) {
    let services = Array.from(this.services.values());

    if (filters.campaignId) {
      services = services.filter(s => s.campaignId === filters.campaignId);
    }

    if (filters.type) {
      services = services.filter(s => s.type === filters.type);
    }

    if (filters.status) {
      services = services.filter(s => s.status === filters.status);
    }

    return services;
  }

  /**
   * Get service by ID
   */
  getService(serviceId) {
    return this.services.get(serviceId);
  }

  /**
   * Update service configuration
   */
  async updateService(serviceId, updates) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    Object.assign(service, updates);
    
    if (updates.config) {
      service.config = { ...service.config, ...updates.config };
    }

    this.emit('service:updated', service);

    return service;
  }

  /**
   * Delete service
   */
  deleteService(serviceId) {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      this.schemaRelationships.delete(serviceId);
      this.emit('service:deleted', { serviceId });
      return true;
    }
    return false;
  }

  /**
   * Clear config cache
   */
  clearCache() {
    this.configCache.clear();
  }
}

// Export singleton
const enhancedSeedingService = new EnhancedSeedingService();

export default enhancedSeedingService;
export { EnhancedSeedingService };
