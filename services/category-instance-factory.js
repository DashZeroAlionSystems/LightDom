/**
 * Category Instance Factory Service
 * Creates and manages instances of different category types
 * Supports: app, campaign, service, workflow, seed, crawler, scheduler, neural_network, data_mining, data_stream, attribute
 */

import { Pool } from 'pg';

export class CategoryInstanceFactory {
  constructor(dbPool) {
    this.db = dbPool;
    
    // Map of category types to their table names
    this.categoryTableMap = {
      app: 'apps',
      campaign: 'campaigns',
      service: 'service_instances',
      workflow: 'workflow_instances',
      seed: 'seed_instances',
      seeder: 'seed_instances',
      crawler: 'crawler_instances',
      scheduler: 'scheduler_instances',
      neural_network: 'neural_network_instances',
      data_mining: 'data_mining_instances',
      data_stream: 'data_stream_instances',
      attribute: 'attribute_instances',
      model: 'model_registry',
      training_data: 'training_datasets'
    };
    
    // Default configurations for each category
    this.defaultConfigs = {
      app: {
        status: 'active',
        config: {},
        metadata: {}
      },
      campaign: {
        status: 'draft',
        campaign_type: 'general',
        config: {},
        progress: 0
      },
      service: {
        status: 'stopped',
        service_type: 'api',
        instance_config: {},
        api_functions: [],
        health_check_config: { enabled: true, interval: 30000 }
      },
      workflow: {
        status: 'draft',
        workflow_type: 'automation',
        steps: [],
        variables: {},
        trigger_config: {},
        data_stream_ids: []
      },
      seed: {
        status: 'pending',
        seed_type: 'url',
        priority: 5,
        metadata: {}
      },
      seeder: {
        status: 'pending',
        seed_type: 'url',
        priority: 5,
        metadata: {}
      },
      crawler: {
        status: 'idle',
        crawler_type: 'puppeteer',
        target_config: { urls: [] },
        extraction_rules: {},
        concurrency: 1
      },
      scheduler: {
        status: 'inactive',
        schedule_type: 'cron',
        timezone: 'UTC',
        payload: {}
      },
      neural_network: {
        status: 'untrained',
        model_type: 'sequential',
        architecture: {},
        training_config: {}
      },
      data_mining: {
        status: 'pending',
        target_type: 'web',
        target_config: {},
        mining_strategy: 'default',
        extraction_rules: {},
        priority: 5
      },
      data_stream: {
        status: 'inactive',
        source_config: {},
        destination_config: {},
        transformation_rules: [],
        attribute_ids: []
      },
      attribute: {
        attribute_type: 'string',
        is_required: false,
        validation_rules: {},
        display_config: {},
        data_stream_ids: []
      },
      model: {
        status: 'draft',
        model_type: 'foundation',
        provider: 'internal',
        configuration: {},
        metadata: {}
      },
      training_data: {
        dataset_type: 'classification',
        domain: 'general',
        task: 'prediction',
        split_config: {
          train: 0.7,
          validation: 0.15,
          test: 0.15
        },
        features_schema: [],
        labels_schema: []
      }
    };
    
    // Validation rules for hierarchical relationships
    this.hierarchyRules = {
      campaign: { required_parent: 'app' },
      service: { optional_parents: ['app', 'campaign'] },
      workflow: { required_parent: 'campaign', optional_parent: 'service' },
      seed: { optional_parents: ['app', 'campaign'] },
      seeder: { optional_parents: ['app', 'campaign'] },
      crawler: { optional_parents: ['app', 'campaign', 'workflow'] },
      data_mining: { optional_parents: ['app', 'campaign', 'workflow'] },
      data_stream: { required_parent: 'workflow' },
      scheduler: { required_parent: 'app' },
      neural_network: { optional_parents: ['app', 'campaign'] },
      attribute: { required_parent: 'app' },
      model: { optional_parents: ['app', 'service', 'neural_network'] },
      training_data: { optional_parents: ['app', 'neural_network', 'model'] }
    };
  }

  normalizeCategoryKey(category) {
    if (!category) return '';
    return category
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Create a new category instance
   */
  async createInstance(category, instanceData, options = {}) {
    const normalizedCategory = this.normalizeCategoryKey(category);
    const tableName = this.categoryTableMap[normalizedCategory];
    if (!tableName) {
      throw new Error(`Invalid category type: ${category}`);
    }

    // Validate hierarchy if needed
    if (options.validateHierarchy !== false) {
      await this.validateHierarchy(normalizedCategory, instanceData);
    }

    // Merge with defaults
    const config = this.mergeWithDefaults(normalizedCategory, instanceData);

    // Build insert query
    const { query, values } = this.buildInsertQuery(tableName, config);

    try {
      const result = await this.db.query(query, values);
      const instance = result.rows[0];

      // Create relationships if parent IDs are provided
      if (options.createRelationships !== false) {
        await this.createRelationships(normalizedCategory, instance.id, instanceData);
      }

      // Log creation
      await this.logExecution(normalizedCategory, instance.id, 'create', 'completed', {
        input: config,
        output: instance
      });

      return {
        success: true,
        category,
        normalizedCategory,
        instance,
        message: `${category} instance created successfully`
      };
    } catch (error) {
      console.error(`Error creating ${category} instance:`, error);
      throw error;
    }
  }

  /**
   * Create multiple instances at once
   */
  async createInstances(instances, options = {}) {
    const results = [];
    const errors = [];

    for (const instanceConfig of instances) {
      const { category, data } = instanceConfig;
      try {
        const result = await this.createInstance(category, data, options);
        results.push(result);
      } catch (error) {
        errors.push({
          category,
          data,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      created: results,
      errors,
      summary: {
        total: instances.length,
        succeeded: results.length,
        failed: errors.length
      }
    };
  }

  /**
   * Create a complete hierarchy from a config
   */
  async createHierarchyFromConfig(config) {
    const results = {};
    const normalizedConfig = {};

    Object.entries(config || {}).forEach(([key, value]) => {
      normalizedConfig[this.normalizeCategoryKey(key)] = value;
    });
    
    // Create in hierarchical order
    const order = [
      'app',
      'campaign',
      'service',
      'workflow',
      'seed',
      'seeder',
      'crawler',
      'scheduler',
      'neural_network',
      'model',
      'training_data',
      'data_mining',
      'data_stream',
      'attribute'
    ];

    for (const category of order) {
      if (normalizedConfig[category]) {
        const rawItems = normalizedConfig[category];
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];
        
        for (const item of items) {
          // Resolve parent references from previous creations
          const resolvedData = this.resolveReferences(item, results);
          
          const result = await this.createInstance(category, resolvedData, {
            validateHierarchy: true,
            createRelationships: true
          });
          
          // Store result with reference name if provided
          if (item._ref) {
            if (!results[category]) results[category] = {};
            results[category][item._ref] = result.instance;
          }
        }
      }
    }

    return {
      success: true,
      hierarchy: results,
      message: 'Hierarchy created successfully'
    };
  }

  /**
   * Generate default config for a category
   */
  generateConfig(category, customization = {}) {
    const normalizedCategory = this.normalizeCategoryKey(category);
    const defaultConfig = this.defaultConfigs[normalizedCategory];
    if (!defaultConfig) {
      throw new Error(`Unknown category: ${category}`);
    }

    const config = {
      ...defaultConfig,
      ...customization,
      name: customization.name || `${normalizedCategory}-${Date.now()}`,
      description: customization.description || `Auto-generated ${normalizedCategory} instance`
    };

    // Add category-specific required fields
    switch (normalizedCategory) {
      case 'seed':
      case 'seeder':
        if (!config.seed_value) {
          config.seed_value = `https://example.com/${normalizedCategory}`;
        }
        break;
      case 'attribute':
        if (!config.entity_type) {
          config.entity_type = 'default';
        }
        if (!config.attribute_name) {
          config.attribute_name = `attr_${Date.now()}`;
        }
        break;
      case 'data_stream':
        if (!config.source_type) config.source_type = 'api';
        if (!config.destination_type) config.destination_type = 'database';
        break;
      case 'crawler':
        if (!config.target_config || !config.target_config.urls) {
          config.target_config = { urls: ['https://example.com'] };
        }
        break;
      case 'data_mining':
        if (!config.target_config) {
          config.target_config = { source: 'web' };
        }
        break;
      case 'model':
        if (!config.provider) {
          config.provider = 'internal';
        }
        break;
      case 'training_data':
        if (!config.split_config) {
          config.split_config = { train: 0.7, validation: 0.15, test: 0.15 };
        }
        break;
    }

    return config;
  }

  /**
   * Generate configs for all category types
   */
  generateAllConfigs(appName = 'demo-app') {
    const configs = {
      app: this.generateConfig('app', { name: appName }),
      campaign: this.generateConfig('campaign', { 
        name: `${appName}-campaign`,
        campaign_type: 'seo_optimization'
      }),
      service: this.generateConfig('service', {
        name: `${appName}-service`,
        service_type: 'crawler',
        api_functions: [
          { name: 'crawl', method: 'POST', path: '/crawl' },
          { name: 'status', method: 'GET', path: '/status' }
        ]
      }),
      workflow: this.generateConfig('workflow', {
        name: `${appName}-workflow`,
        workflow_type: 'data_extraction',
        steps: [
          { id: 1, type: 'crawl', config: {} },
          { id: 2, type: 'extract', config: {} },
          { id: 3, type: 'store', config: {} }
        ]
      }),
      seed: this.generateConfig('seed', {
        seed_type: 'url',
        seed_value: 'https://example.com/data'
      }),
      seeder: this.generateConfig('seeder', {
        seed_type: 'url',
        seed_value: 'https://example.com/data'
      }),
      crawler: this.generateConfig('crawler', {
        name: `${appName}-crawler`,
        target_config: {
          urls: ['https://example.com'],
          selectors: { title: 'h1', content: 'article' }
        }
      }),
      scheduler: this.generateConfig('scheduler', {
        name: `${appName}-scheduler`,
        schedule_type: 'cron',
        schedule_expression: '0 0 * * *',
        target_entity_type: 'crawler'
      }),
      neural_network: this.generateConfig('neural_network', {
        name: `${appName}-nn`,
        model_type: 'sequential',
        architecture: {
          layers: [
            { type: 'dense', units: 128, activation: 'relu' },
            { type: 'dropout', rate: 0.2 },
            { type: 'dense', units: 1, activation: 'sigmoid' }
          ]
        }
      }),
      data_mining: this.generateConfig('data_mining', {
        job_name: `${appName}-mining`,
        target_type: 'web',
        mining_strategy: 'content_extraction',
        extraction_rules: {
          selectors: { title: 'h1', description: 'meta[name="description"]' }
        }
      }),
      data_stream: this.generateConfig('data_stream', {
        name: `${appName}-stream`,
        source_type: 'crawler',
        destination_type: 'database',
        data_format: 'json'
      }),
      attribute: this.generateConfig('attribute', {
        entity_type: 'content',
        attribute_name: 'title',
        attribute_type: 'string',
        is_required: true
      }),
      model: this.generateConfig('model', {
        name: `${appName}-model`,
        model_type: 'foundation',
        provider: 'internal'
      }),
      training_data: this.generateConfig('training_data', {
        name: `${appName}-dataset`,
        dataset_type: 'classification'
      })
    };

    return configs;
  }

  /**
   * Validate hierarchy rules
   */
  async validateHierarchy(category, data) {
    const normalizedCategory = this.normalizeCategoryKey(category);
    const rules = this.hierarchyRules[normalizedCategory];
    if (!rules) return true;

    // Check required parent
    if (rules.required_parent) {
      const parentIdField = `${rules.required_parent}_id`;
      if (!data[parentIdField]) {
        throw new Error(`${category} requires a ${rules.required_parent}_id`);
      }
      
      // Verify parent exists
      const parentTable = this.categoryTableMap[rules.required_parent];
      const result = await this.db.query(
        `SELECT id FROM ${parentTable} WHERE id = $1`,
        [data[parentIdField]]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Parent ${rules.required_parent} with id ${data[parentIdField]} not found`);
      }
    }

    return true;
  }

  /**
   * Merge instance data with defaults
   */
  mergeWithDefaults(category, data) {
    const defaults = this.defaultConfigs[category] || {};
    return {
      ...defaults,
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Build SQL insert query
   */
  buildInsertQuery(tableName, data) {
    const fields = Object.keys(data).filter(key => !key.startsWith('_'));
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    const values = fields.map(key => {
      const value = data[key];
      // Convert objects/arrays to JSON
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    return { query, values };
  }

  /**
   * Create relationship records
   */
  async createRelationships(category, instanceId, data) {
    const relationships = [];

    // Find parent relationships
    const parentFields = Object.keys(data).filter(key => key.endsWith('_id') && data[key]);
    
    for (const field of parentFields) {
      const parentCategory = field.replace('_id', '');
      if (this.categoryTableMap[parentCategory]) {
        relationships.push({
          parent_category: parentCategory,
          parent_id: data[field],
          child_category: category,
          child_id: instanceId,
          relationship_type: 'belongs_to'
        });
      }
    }

    // Insert relationships
    for (const rel of relationships) {
      try {
        await this.db.query(
          `INSERT INTO category_relationships 
           (parent_category, parent_id, child_category, child_id, relationship_type)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [rel.parent_category, rel.parent_id, rel.child_category, rel.child_id, rel.relationship_type]
        );
      } catch (error) {
        console.error('Error creating relationship:', error);
      }
    }

    return relationships;
  }

  /**
   * Resolve references in config
   */
  resolveReferences(data, results) {
    const resolved = { ...data };
    
    // Look for _ref fields and resolve them
    Object.keys(resolved).forEach(key => {
      if (key.endsWith('_ref')) {
        const refPath = resolved[key].split('.');
        const [category, refName] = refPath;
        
        if (results[category] && results[category][refName]) {
          const idField = key.replace('_ref', '_id');
          resolved[idField] = results[category][refName].id;
        }
        
        delete resolved[key];
      }
    });

    return resolved;
  }

  /**
   * Log execution history
   */
  async logExecution(category, instanceId, executionType, status, details = {}) {
    try {
      await this.db.query(
        `INSERT INTO instance_execution_history 
         (instance_category, instance_id, execution_type, status, completed_at, input_params, output_result)
         VALUES ($1, $2, $3, $4, NOW(), $5, $6)`,
        [
          category,
          instanceId,
          executionType,
          status,
          JSON.stringify(details.input || {}),
          JSON.stringify(details.output || {})
        ]
      );
    } catch (error) {
      console.error('Error logging execution:', error);
    }
  }

  /**
   * Get instance by ID
   */
  async getInstance(category, id) {
    const normalizedCategory = this.normalizeCategoryKey(category);
    const tableName = this.categoryTableMap[normalizedCategory];
    if (!tableName) {
      throw new Error(`Invalid category: ${category}`);
    }

    const result = await this.db.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * List instances by category
   */
  async listInstances(category, filters = {}) {
    const normalizedCategory = this.normalizeCategoryKey(category);
    const tableName = this.categoryTableMap[normalizedCategory];
    if (!tableName) {
      throw new Error(`Invalid category: ${category}`);
    }

    let query = `SELECT * FROM ${tableName}`;
    const conditions = [];
    const values = [];

    // Apply filters
    Object.keys(filters).forEach((key, index) => {
      conditions.push(`${key} = $${index + 1}`);
      values.push(filters[key]);
    });

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, values);
    return result.rows;
  }

  /**
   * Get category hierarchy for an instance
   */
  async getHierarchy(category, instanceId) {
    const normalizedCategory = this.normalizeCategoryKey(category);
    // Get ancestors (parents)
    const ancestors = await this.db.query(
      `SELECT parent_category, parent_id, relationship_type
       FROM category_relationships
       WHERE child_category = $1 AND child_id = $2`,
      [normalizedCategory, instanceId]
    );

    // Get descendants (children)
    const descendants = await this.db.query(
      `SELECT child_category, child_id, relationship_type
       FROM category_relationships
       WHERE parent_category = $1 AND parent_id = $2`,
      [normalizedCategory, instanceId]
    );

    return {
      category: normalizedCategory,
      instance_id: instanceId,
      ancestors: ancestors.rows,
      descendants: descendants.rows
    };
  }
}

export default CategoryInstanceFactory;
