/**
 * Attribute Discovery Service
 * 
 * Analyzes research instances to extract and define data mining attributes.
 * Creates configurable attribute definitions with mining algorithms.
 * 
 * Features:
 * - Extract attributes from research analysis
 * - Define mining algorithms for each attribute
 * - Generate configurable options
 * - Prioritize attributes by relevance
 * - Map attributes to schema properties
 */

import { EventEmitter } from 'events';
import researchInstanceService from './research-instance-service.js';
import deepSeekService from './deepseek-api-service.js';

class AttributeDiscoveryService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxAttributesPerResearch: config.maxAttributesPerResearch || 50,
      minConfidenceScore: config.minConfidenceScore || 0.5,
      ...config
    };

    this.attributes = new Map();
    this.db = config.db || null;
  }

  /**
   * Discover attributes from a research instance
   */
  async discoverAttributes(researchId, options = {}) {
    try {
      console.log(`🔍 Discovering attributes for research: ${researchId}`);

      const research = await researchInstanceService.getResearch(researchId);
      if (!research) {
        throw new Error(`Research instance ${researchId} not found`);
      }

      if (research.status !== 'completed') {
        throw new Error(`Research must be completed before discovering attributes. Current status: ${research.status}`);
      }

      // Analyze research data to extract attributes
      const attributes = await this.analyzeResearchForAttributes(research);

      // Enrich attributes with mining algorithms
      const enrichedAttributes = await this.enrichAttributesWithAlgorithms(attributes, research);

      // Save attributes to database
      const savedAttributes = [];
      for (const attr of enrichedAttributes) {
        const saved = await this.saveAttribute(researchId, attr);
        savedAttributes.push(saved);
      }

      this.emit('attributesDiscovered', { researchId, count: savedAttributes.length });
      console.log(`✅ Discovered ${savedAttributes.length} attributes for research ${researchId}`);

      return savedAttributes;
    } catch (error) {
      console.error('Failed to discover attributes:', error);
      throw error;
    }
  }

  /**
   * Analyze research to extract attribute definitions
   */
  async analyzeResearchForAttributes(research) {
    const attributes = [];
    const analysis = research.metadata?.analysis || {};

    // Extract from core concepts
    if (analysis.coreConcepts) {
      for (const concept of analysis.coreConcepts) {
        attributes.push({
          name: this.normalizeAttributeName(concept),
          category: 'content',
          description: `${concept} attribute`,
          data_type: 'string',
          priority: 8
        });
      }
    }

    // Extract from discovered schemas
    if (research.discovered_schemas) {
      for (const schema of research.discovered_schemas) {
        if (schema.properties) {
          for (const prop of schema.properties) {
            const attrName = typeof prop === 'string' ? prop : prop.name;
            attributes.push({
              name: this.normalizeAttributeName(attrName),
              category: this.categorizeAttribute(attrName),
              description: `${attrName} from ${schema['@type']} schema`,
              data_type: this.inferDataType(attrName),
              priority: 7
            });
          }
        }
      }
    }

    // Add standard web attributes
    const standardAttributes = this.getStandardWebAttributes(research.topic);
    attributes.push(...standardAttributes);

    // Remove duplicates and merge
    return this.deduplicateAttributes(attributes);
  }

  /**
   * Enrich attributes with mining algorithms and configuration
   */
  async enrichAttributesWithAlgorithms(attributes, research) {
    const enriched = [];

    for (const attr of attributes) {
      // Determine mining algorithm based on attribute type
      const algorithm = this.determineMiningAlgorithm(attr);
      
      // Generate selector strategy
      const selectorStrategy = this.generateSelectorStrategy(attr);
      
      // Generate configurable options
      const configurableOptions = this.generateConfigurableOptions(attr);
      
      // Generate validation rules
      const validationRules = this.generateValidationRules(attr);

      enriched.push({
        ...attr,
        mining_algorithm: algorithm,
        selector_strategy: selectorStrategy,
        configurable_options: configurableOptions,
        validation_rules: validationRules,
        is_required: attr.priority >= 8
      });
    }

    return enriched;
  }

  /**
   * Determine appropriate mining algorithm for attribute
   */
  determineMiningAlgorithm(attribute) {
    const { name, category, data_type } = attribute;
    const nameLower = name.toLowerCase();

    // Special cases for different mining algorithms
    if (nameLower.includes('meta') || nameLower.includes('og:')) {
      return 'meta_extraction';
    }

    if (nameLower.includes('link') || data_type === 'url') {
      return 'link_extraction';
    }

    if (nameLower.includes('image') || data_type === 'image') {
      return 'image_extraction';
    }

    if (category === 'seo' || nameLower.includes('keyword') || nameLower.includes('title')) {
      return 'seo_extraction';
    }

    if (category === 'performance' || nameLower.includes('speed') || nameLower.includes('load')) {
      return 'performance_measurement';
    }

    if (category === 'behavior' || nameLower.includes('click') || nameLower.includes('event')) {
      return 'event_tracking';
    }

    if (data_type === 'number' && (nameLower.includes('count') || nameLower.includes('score'))) {
      return 'computed_metric';
    }

    // Default to DOM extraction
    return 'dom_extraction';
  }

  /**
   * Generate selector strategy for attribute
   */
  generateSelectorStrategy(attribute) {
    const { name, data_type, mining_algorithm } = attribute;
    const nameLower = name.toLowerCase();
    const strategy = {
      type: 'css_selector',
      selectors: [],
      fallback: null
    };

    switch (mining_algorithm) {
      case 'meta_extraction':
        strategy.type = 'meta_tag';
        strategy.selectors = [
          `meta[name="${nameLower}"]`,
          `meta[property="${nameLower}"]`,
          `meta[property="og:${nameLower}"]`,
          `meta[name="twitter:${nameLower}"]`
        ];
        break;

      case 'link_extraction':
        strategy.selectors = [
          `a[href*="${nameLower}"]`,
          `.${nameLower} a`,
          `#${nameLower} a`,
          'a'
        ];
        break;

      case 'image_extraction':
        strategy.selectors = [
          `img[alt*="${nameLower}"]`,
          `.${nameLower} img`,
          `#${nameLower} img`,
          'img'
        ];
        break;

      case 'seo_extraction':
        if (nameLower.includes('title')) {
          strategy.selectors = ['title', 'h1', 'meta[property="og:title"]'];
        } else if (nameLower.includes('description')) {
          strategy.selectors = ['meta[name="description"]', 'meta[property="og:description"]'];
        } else if (nameLower.includes('keyword')) {
          strategy.selectors = ['meta[name="keywords"]'];
        }
        break;

      default:
        // Default DOM selectors
        strategy.selectors = [
          `[data-${nameLower}]`,
          `.${nameLower}`,
          `#${nameLower}`,
          `[class*="${nameLower}"]`,
          `[id*="${nameLower}"]`
        ];
    }

    // Add XPath fallback for complex extractions
    if (data_type === 'string' || data_type === 'text') {
      strategy.xpath_fallback = `//*[contains(@class, '${nameLower}')]//text()`;
    }

    return strategy;
  }

  /**
   * Generate configurable options for attribute
   */
  generateConfigurableOptions(attribute) {
    const options = [];
    const { data_type, mining_algorithm } = attribute;

    // Common options
    options.push({
      name: 'enabled',
      type: 'boolean',
      default: true,
      description: 'Enable/disable extraction of this attribute'
    });

    options.push({
      name: 'selector_override',
      type: 'string',
      default: '',
      description: 'Custom CSS selector override'
    });

    // Data type specific options
    if (data_type === 'string' || data_type === 'text') {
      options.push({
        name: 'max_length',
        type: 'number',
        default: 1000,
        description: 'Maximum character length'
      });

      options.push({
        name: 'trim_whitespace',
        type: 'boolean',
        default: true,
        description: 'Remove extra whitespace'
      });
    }

    if (data_type === 'number') {
      options.push({
        name: 'parse_method',
        type: 'select',
        options: ['parseInt', 'parseFloat', 'custom'],
        default: 'parseFloat',
        description: 'Method to parse number values'
      });
    }

    if (data_type === 'array') {
      options.push({
        name: 'max_items',
        type: 'number',
        default: 100,
        description: 'Maximum number of items to collect'
      });

      options.push({
        name: 'delimiter',
        type: 'string',
        default: ',',
        description: 'Delimiter for splitting text into array'
      });
    }

    // Algorithm specific options
    if (mining_algorithm === 'link_extraction') {
      options.push({
        name: 'include_external',
        type: 'boolean',
        default: true,
        description: 'Include external links'
      });

      options.push({
        name: 'include_internal',
        type: 'boolean',
        default: true,
        description: 'Include internal links'
      });
    }

    if (mining_algorithm === 'image_extraction') {
      options.push({
        name: 'include_data_urls',
        type: 'boolean',
        default: false,
        description: 'Include base64 data URLs'
      });

      options.push({
        name: 'min_width',
        type: 'number',
        default: 0,
        description: 'Minimum image width in pixels'
      });

      options.push({
        name: 'min_height',
        type: 'number',
        default: 0,
        description: 'Minimum image height in pixels'
      });
    }

    return options;
  }

  /**
   * Generate validation rules for attribute
   */
  generateValidationRules(attribute) {
    const rules = {};
    const { name, data_type, is_required } = attribute;

    rules.required = is_required || false;

    switch (data_type) {
      case 'string':
      case 'text':
        rules.minLength = 1;
        rules.maxLength = 10000;
        rules.pattern = null;
        break;

      case 'number':
        rules.min = null;
        rules.max = null;
        rules.integer = false;
        break;

      case 'url':
        rules.pattern = '^https?://';
        rules.allowRelative = true;
        break;

      case 'email':
        rules.pattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
        break;

      case 'date':
        rules.format = 'ISO8601';
        rules.minDate = null;
        rules.maxDate = null;
        break;

      case 'boolean':
        rules.truthy = ['true', '1', 'yes', 'on'];
        rules.falsy = ['false', '0', 'no', 'off'];
        break;

      case 'array':
        rules.minItems = 0;
        rules.maxItems = 100;
        rules.uniqueItems = false;
        break;
    }

    return rules;
  }

  /**
   * Get standard web attributes for any topic
   */
  getStandardWebAttributes(topic) {
    return [
      {
        name: 'page_title',
        category: 'seo',
        description: 'Page title from title tag',
        data_type: 'string',
        priority: 10
      },
      {
        name: 'meta_description',
        category: 'seo',
        description: 'Meta description tag content',
        data_type: 'string',
        priority: 9
      },
      {
        name: 'canonical_url',
        category: 'seo',
        description: 'Canonical URL',
        data_type: 'url',
        priority: 8
      },
      {
        name: 'og_image',
        category: 'metadata',
        description: 'Open Graph image',
        data_type: 'url',
        priority: 6
      },
      {
        name: 'main_content',
        category: 'content',
        description: 'Main page content',
        data_type: 'text',
        priority: 9
      },
      {
        name: 'headings',
        category: 'structure',
        description: 'Page headings (h1-h6)',
        data_type: 'array',
        priority: 7
      },
      {
        name: 'internal_links',
        category: 'structure',
        description: 'Internal page links',
        data_type: 'array',
        priority: 6
      },
      {
        name: 'external_links',
        category: 'structure',
        description: 'External page links',
        data_type: 'array',
        priority: 5
      },
      {
        name: 'images',
        category: 'content',
        description: 'Page images',
        data_type: 'array',
        priority: 5
      },
      {
        name: 'structured_data',
        category: 'metadata',
        description: 'JSON-LD structured data',
        data_type: 'object',
        priority: 7
      }
    ];
  }

  /**
   * Normalize attribute name
   */
  normalizeAttributeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  /**
   * Categorize attribute based on name
   */
  categorizeAttribute(name) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('meta') || nameLower.includes('og:') || nameLower.includes('twitter:')) {
      return 'metadata';
    }
    if (nameLower.includes('title') || nameLower.includes('description') || nameLower.includes('keyword')) {
      return 'seo';
    }
    if (nameLower.includes('heading') || nameLower.includes('link') || nameLower.includes('navigation')) {
      return 'structure';
    }
    if (nameLower.includes('image') || nameLower.includes('video') || nameLower.includes('media')) {
      return 'media';
    }
    if (nameLower.includes('click') || nameLower.includes('event') || nameLower.includes('interaction')) {
      return 'behavior';
    }
    if (nameLower.includes('speed') || nameLower.includes('load') || nameLower.includes('performance')) {
      return 'performance';
    }

    return 'content';
  }

  /**
   * Infer data type from attribute name
   */
  inferDataType(name) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('url') || nameLower.includes('link') || nameLower.includes('href')) {
      return 'url';
    }
    if (nameLower.includes('email')) {
      return 'email';
    }
    if (nameLower.includes('date') || nameLower.includes('time') || nameLower.includes('published')) {
      return 'date';
    }
    if (nameLower.includes('price') || nameLower.includes('count') || nameLower.includes('score') || nameLower.includes('rating')) {
      return 'number';
    }
    if (nameLower.includes('image') || nameLower.includes('photo') || nameLower.includes('picture')) {
      return 'image';
    }
    if (nameLower.includes('is_') || nameLower.includes('has_') || nameLower.includes('enabled')) {
      return 'boolean';
    }
    if (nameLower.includes('list') || nameLower.includes('items') || nameLower.includes('tags') || name.endsWith('s')) {
      return 'array';
    }

    return 'string';
  }

  /**
   * Deduplicate attributes by name
   */
  deduplicateAttributes(attributes) {
    const seen = new Map();

    for (const attr of attributes) {
      const existing = seen.get(attr.name);
      if (!existing || attr.priority > existing.priority) {
        seen.set(attr.name, attr);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Save attribute definition
   */
  async saveAttribute(researchId, attribute) {
    const attributeId = `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const attrRecord = {
      attribute_id: attributeId,
      research_id: researchId,
      name: attribute.name,
      category: attribute.category,
      description: attribute.description,
      data_type: attribute.data_type,
      selector_strategy: attribute.selector_strategy,
      mining_algorithm: attribute.mining_algorithm,
      validation_rules: attribute.validation_rules,
      transformation_function: attribute.transformation_function || null,
      priority: attribute.priority,
      is_required: attribute.is_required,
      configurable_options: attribute.configurable_options,
      metadata: {},
      created_at: new Date().toISOString()
    };

    this.attributes.set(attributeId, attrRecord);

    if (this.db) {
      await this.saveAttributeToDB(attrRecord);
    }

    return attrRecord;
  }

  /**
   * Get attributes for a research instance
   */
  async getAttributesByResearch(researchId) {
    if (this.db) {
      return await this.loadAttributesFromDB(researchId);
    }

    return Array.from(this.attributes.values())
      .filter(attr => attr.research_id === researchId);
  }

  // Database operations
  async saveAttributeToDB(attribute) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO attribute_definitions 
        (attribute_id, research_id, name, category, description, data_type, selector_strategy, 
         mining_algorithm, validation_rules, transformation_function, priority, is_required, 
         configurable_options, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          attribute.attribute_id,
          attribute.research_id,
          attribute.name,
          attribute.category,
          attribute.description,
          attribute.data_type,
          JSON.stringify(attribute.selector_strategy),
          attribute.mining_algorithm,
          JSON.stringify(attribute.validation_rules),
          attribute.transformation_function,
          attribute.priority,
          attribute.is_required,
          JSON.stringify(attribute.configurable_options),
          JSON.stringify(attribute.metadata),
          attribute.created_at
        ]
      );
    } catch (error) {
      console.error('Failed to save attribute to database:', error);
    }
  }

  async loadAttributesFromDB(researchId) {
    if (!this.db) return [];

    try {
      const result = await this.db.query(
        'SELECT * FROM attribute_definitions WHERE research_id = $1 ORDER BY priority DESC',
        [researchId]
      );

      return result.rows || [];
    } catch (error) {
      console.error('Failed to load attributes from database:', error);
      return [];
    }
  }
}

// Export singleton instance
const attributeDiscoveryService = new AttributeDiscoveryService();
export default attributeDiscoveryService;
