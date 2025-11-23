/**
 * Neural Network Instance Service
 * Comprehensive service for managing neural network instances with data streams,
 * attributes, crawler integration, and seeder services
 */

import { Pool } from 'pg';
import * as tf from '@tensorflow/tfjs-node';

export class NeuralNetworkInstanceService {
  constructor(dbPool) {
    this.db = dbPool;
    this.activeModels = new Map(); // Cache for loaded models
  }

  /**
   * Create a new neural network instance with default scraping/mining models
   * @param {Object} config - Instance configuration
   * @returns {Promise<Object>} Created instance
   */
  async createInstance(config) {
    const {
      name,
      description,
      model_type = 'scraping',
      architecture = {},
      training_config = {},
      data_config = {},
      load_default_models = true
    } = config;

    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Create the neural network instance
      const instanceResult = await client.query(`
        INSERT INTO neural_network_instances (
          name, description, model_type, architecture, 
          training_config, data_config, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'initializing')
        RETURNING *
      `, [name, description, model_type, architecture, training_config, data_config]);

      const instance = instanceResult.rows[0];

      // Load default models if requested
      if (load_default_models) {
        await this.loadDefaultModels(instance.id, model_type, client);
      }

      // Create default data streams
      await this.createDefaultDataStreams(instance.id, client);

      // Create default attributes
      await this.createDefaultAttributes(instance.id, model_type, client);

      // Setup crawler integration if scraping model
      if (model_type === 'scraping' || model_type === 'seo') {
        await this.setupCrawlerIntegration(instance.id, client);
      }

      // Setup seeder integration
      await this.setupSeederIntegration(instance.id, client);

      // Update status to ready
      await client.query(`
        UPDATE neural_network_instances 
        SET status = 'ready', updated_at = NOW()
        WHERE id = $1
      `, [instance.id]);

      await client.query('COMMIT');

      return {
        ...instance,
        status: 'ready'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Load default pre-trained models for the instance
   * @param {string} instanceId - Neural network instance ID
   * @param {string} modelType - Type of model
   * @param {Object} client - Database client
   */
  async loadDefaultModels(instanceId, modelType, client) {
    // Get default models for this type
    const modelsResult = await client.query(`
      SELECT * FROM neural_network_models
      WHERE model_type = $1 AND is_default = true AND status = 'available'
    `, [modelType]);

    const models = modelsResult.rows;

    // Store reference to loaded models in instance metadata
    if (models.length > 0) {
      const modelRefs = models.map(m => ({
        model_id: m.id,
        model_name: m.model_name,
        model_type: m.model_type,
        loaded_at: new Date().toISOString()
      }));

      await client.query(`
        UPDATE neural_network_instances
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{loaded_models}',
          $1::jsonb
        )
        WHERE id = $2
      `, [JSON.stringify(modelRefs), instanceId]);
    }

    return models;
  }

  /**
   * Create default data streams for the instance
   * @param {string} instanceId - Neural network instance ID
   * @param {Object} client - Database client
   */
  async createDefaultDataStreams(instanceId, client) {
    const streams = [
      {
        name: 'Training Data Input',
        stream_type: 'training',
        source_type: 'database',
        destination_type: 'model',
        source_config: { table: 'neural_network_training_data' }
      },
      {
        name: 'Prediction Input',
        stream_type: 'input',
        source_type: 'api',
        destination_type: 'model',
        source_config: { endpoint: '/api/neural-networks/predict' }
      },
      {
        name: 'Results Output',
        stream_type: 'output',
        source_type: 'model',
        destination_type: 'database',
        destination_config: { table: 'neural_network_predictions' }
      }
    ];

    for (const stream of streams) {
      await client.query(`
        INSERT INTO neural_network_data_streams (
          neural_network_id, name, stream_type, source_type, 
          destination_type, source_config, destination_config, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      `, [
        instanceId,
        stream.name,
        stream.stream_type,
        stream.source_type,
        stream.destination_type,
        stream.source_config || {},
        stream.destination_config || {}
      ]);
    }
  }

  /**
   * Create default attributes for the instance
   * @param {string} instanceId - Neural network instance ID
   * @param {string} modelType - Type of model
   * @param {Object} client - Database client
   */
  async createDefaultAttributes(instanceId, modelType, client) {
    let attributes = [];

    if (modelType === 'scraping' || modelType === 'seo') {
      attributes = [
        {
          name: 'url_depth',
          type: 'crawling',
          description: 'URL depth in site hierarchy',
          algorithm_config: {
            enabled: true,
            algorithm_type: 'numeric',
            preprocessing: ['normalize'],
            feature_extraction: { method: 'direct' }
          },
          training_config: { enabled: true, importance_weight: 0.8 }
        },
        {
          name: 'page_load_time',
          type: 'performance',
          description: 'Page load time in milliseconds',
          algorithm_config: {
            enabled: true,
            algorithm_type: 'numeric',
            preprocessing: ['normalize', 'log_transform'],
            feature_extraction: { method: 'direct' }
          },
          training_config: { enabled: true, importance_weight: 0.6 }
        },
        {
          name: 'keyword_density',
          type: 'seo',
          description: 'Target keyword density in content',
          algorithm_config: {
            enabled: true,
            algorithm_type: 'numeric',
            preprocessing: ['normalize'],
            feature_extraction: { method: 'calculated' }
          },
          seo_config: {
            rank_weight: 0.9,
            trust_score: 0.7,
            optimization_priority: 'high'
          },
          training_config: { enabled: true, importance_weight: 1.0 }
        },
        {
          name: 'content_quality',
          type: 'seo',
          description: 'Overall content quality score',
          algorithm_config: {
            enabled: true,
            algorithm_type: 'composite',
            preprocessing: ['normalize'],
            feature_extraction: { method: 'ml_model' }
          },
          seo_config: {
            rank_weight: 1.0,
            trust_score: 0.8,
            optimization_priority: 'high'
          },
          drilldown_config: {
            enabled: true,
            related_attributes: ['readability', 'grammar', 'structure'],
            visualization_type: 'tree',
            depth_limit: 2
          },
          training_config: { enabled: true, importance_weight: 1.0 }
        }
      ];
    } else if (modelType === 'data_mining') {
      attributes = [
        {
          name: 'data_completeness',
          type: 'data_mining',
          description: 'Percentage of fields with valid data',
          algorithm_config: {
            enabled: true,
            algorithm_type: 'numeric',
            preprocessing: ['normalize'],
            feature_extraction: { method: 'calculated' }
          },
          mining_config: {
            enabled: true,
            mining_strategy: 'continuous',
            sources: ['scraped_data'],
            update_frequency: 'realtime'
          },
          training_config: { enabled: true, importance_weight: 0.9 }
        }
      ];
    }

    for (const attr of attributes) {
      await client.query(`
        INSERT INTO neural_network_attributes (
          neural_network_id, attribute_name, attribute_type, description,
          algorithm_config, mining_config, drilldown_config, seo_config, training_config
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        instanceId,
        attr.name,
        attr.type,
        attr.description,
        attr.algorithm_config || {},
        attr.mining_config || {},
        attr.drilldown_config || {},
        attr.seo_config || {},
        attr.training_config || {}
      ]);
    }
  }

  /**
   * Setup crawler integration for the instance
   * @param {string} instanceId - Neural network instance ID
   * @param {Object} client - Database client
   */
  async setupCrawlerIntegration(instanceId, client) {
    await client.query(`
      INSERT INTO neural_network_crawler_config (
        neural_network_id,
        optimization_config,
        extraction_config,
        performance_config,
        training_data_config,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'active')
    `, [
      instanceId,
      {
        enabled: true,
        priority_scoring: true,
        url_prediction: true,
        content_filtering: true,
        duplicate_detection: true
      },
      {
        dynamic_selectors: true,
        structure_learning: true,
        pattern_recognition: true
      },
      {
        adaptive_concurrency: true,
        smart_throttling: true,
        retry_prediction: true
      },
      {
        collect_successful_patterns: true,
        collect_failed_patterns: true,
        collect_performance_metrics: true
      }
    ]);
  }

  /**
   * Setup seeder integration for the instance
   * @param {string} instanceId - Neural network instance ID
   * @param {Object} client - Database client
   */
  async setupSeederIntegration(instanceId, client) {
    await client.query(`
      INSERT INTO neural_network_seeder_config (
        neural_network_id,
        translation_config,
        url_generation_config,
        related_topics_config,
        status
      )
      VALUES ($1, $2, $3, $4, 'active')
    `, [
      instanceId,
      {
        enabled: true,
        use_semantic_similarity: true,
        expand_related_topics: true,
        confidence_threshold: 0.7
      },
      {
        enabled: true,
        predict_valuable_urls: true,
        prioritize_by_relevance: true,
        filter_duplicates: true
      },
      {
        enabled: true,
        max_depth: 2,
        max_suggestions: 10,
        relevance_threshold: 0.6
      }
    ]);
  }

  /**
   * Add a data stream to an existing neural network instance
   * @param {string} instanceId - Neural network instance ID
   * @param {Object} streamConfig - Data stream configuration
   * @returns {Promise<Object>} Created data stream
   */
  async addDataStream(instanceId, streamConfig) {
    const {
      name,
      stream_type,
      source_type,
      destination_type,
      source_config = {},
      destination_config = {},
      transformation_rules = [],
      attribute_mappings = []
    } = streamConfig;

    const result = await this.db.query(`
      SELECT add_data_stream_to_neural_network(
        $1::uuid, $2, $3, $4, $5, $6, $7, $8
      ) as stream_id
    `, [
      instanceId,
      name,
      stream_type,
      source_type,
      destination_type,
      source_config,
      destination_config,
      attribute_mappings
    ]);

    const streamId = result.rows[0].stream_id;

    // Get the created stream
    const streamResult = await this.db.query(`
      SELECT * FROM neural_network_data_streams WHERE id = $1
    `, [streamId]);

    return streamResult.rows[0];
  }

  /**
   * Combine attributes into a data stream
   * @param {string} instanceId - Neural network instance ID
   * @param {string[]} attributeIds - Array of attribute IDs to combine
   * @param {string} streamName - Name for the combined stream
   * @returns {Promise<Object>} Created data stream
   */
  async combineAttributes(instanceId, attributeIds, streamName) {
    const result = await this.db.query(`
      SELECT combine_attributes_for_neural_network(
        $1::uuid, $2::uuid[], $3
      ) as stream_id
    `, [instanceId, attributeIds, streamName]);

    const streamId = result.rows[0].stream_id;

    // Get the created stream
    const streamResult = await this.db.query(`
      SELECT * FROM neural_network_data_streams WHERE id = $1
    `, [streamId]);

    return streamResult.rows[0];
  }

  /**
   * Get all instances with their relationships
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of instances
   */
  async getAllInstances(filters = {}) {
    let query = 'SELECT * FROM v_neural_network_overview WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.model_type) {
      query += ` AND model_type = $${paramIndex}`;
      params.push(filters.model_type);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Get a single instance with all related data
   * @param {string} instanceId - Neural network instance ID
   * @returns {Promise<Object>} Instance with relationships
   */
  async getInstance(instanceId) {
    const client = await this.db.connect();
    
    try {
      // Get main instance
      const instanceResult = await client.query(`
        SELECT * FROM v_neural_network_overview WHERE id = $1
      `, [instanceId]);

      if (instanceResult.rows.length === 0) {
        return null;
      }

      const instance = instanceResult.rows[0];

      // Get data streams
      const streamsResult = await client.query(`
        SELECT * FROM neural_network_data_streams 
        WHERE neural_network_id = $1
        ORDER BY created_at DESC
      `, [instanceId]);

      // Get attributes
      const attributesResult = await client.query(`
        SELECT * FROM neural_network_attributes 
        WHERE neural_network_id = $1 AND is_active = true
        ORDER BY attribute_name
      `, [instanceId]);

      // Get crawler config
      const crawlerResult = await client.query(`
        SELECT * FROM neural_network_crawler_config 
        WHERE neural_network_id = $1
      `, [instanceId]);

      // Get seeder config
      const seederResult = await client.query(`
        SELECT * FROM neural_network_seeder_config 
        WHERE neural_network_id = $1
      `, [instanceId]);

      return {
        ...instance,
        data_streams: streamsResult.rows,
        attributes: attributesResult.rows,
        crawler_config: crawlerResult.rows[0] || null,
        seeder_config: seederResult.rows[0] || null
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get attribute drilldown data
   * @param {string} attributeId - Attribute ID
   * @returns {Promise<Object>} Drilldown data with related attributes
   */
  async getAttributeDrilldown(attributeId) {
    const attrResult = await this.db.query(`
      SELECT * FROM neural_network_attributes WHERE id = $1
    `, [attributeId]);

    if (attrResult.rows.length === 0) {
      return null;
    }

    const attribute = attrResult.rows[0];
    const drilldownConfig = attribute.drilldown_config;

    if (!drilldownConfig.enabled) {
      return {
        attribute,
        related: [],
        drilldown_enabled: false
      };
    }

    // Get related attributes based on configuration
    const relatedResult = await this.db.query(`
      SELECT * FROM neural_network_attributes
      WHERE neural_network_id = $1
        AND attribute_name = ANY($2)
        AND is_active = true
    `, [attribute.neural_network_id, drilldownConfig.related_attributes || []]);

    return {
      attribute,
      related: relatedResult.rows,
      drilldown_enabled: true,
      visualization_type: drilldownConfig.visualization_type,
      depth_limit: drilldownConfig.depth_limit
    };
  }

  /**
   * Add training data to a neural network instance
   * @param {string} instanceId - Neural network instance ID
   * @param {Object} trainingData - Training data configuration
   * @returns {Promise<Object>} Created training data record
   */
  async addTrainingData(instanceId, trainingData) {
    const {
      data_source,
      data_type,
      input_features,
      target_values,
      quality_score = null
    } = trainingData;

    const result = await this.db.query(`
      INSERT INTO neural_network_training_data (
        neural_network_id, data_source, data_type,
        input_features, target_values, quality_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      instanceId,
      data_source,
      data_type,
      input_features,
      target_values,
      quality_score
    ]);

    return result.rows[0];
  }

  /**
   * Setup project organization research for the neural network
   * @param {string} instanceId - Neural network instance ID
   * @returns {Promise<Object>} Research configuration
   */
  async setupProjectOrganizationResearch(instanceId) {
    const researchTopics = [
      {
        topic: 'Development Workflow Organization',
        type: 'organizing_skills',
        findings: {
          recommendations: [
            'Use feature-based folder structure',
            'Implement module boundaries',
            'Separate concerns by layer'
          ]
        }
      },
      {
        topic: 'Crawlee and TensorFlow Integration',
        type: 'development_best_practices',
        findings: {
          recommendations: [
            'Use Crawlee for robust web scraping',
            'Feed scraped data to TensorFlow for training',
            'Implement feedback loop for continuous improvement'
          ]
        }
      }
    ];

    const results = [];
    for (const research of researchTopics) {
      const result = await this.db.query(`
        INSERT INTO neural_network_project_research (
          neural_network_id, research_topic, research_type,
          findings, status
        )
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING *
      `, [instanceId, research.topic, research.type, research.findings]);
      
      results.push(result.rows[0]);
    }

    return results;
  }

  /**
   * Delete a neural network instance
   * @param {string} instanceId - Neural network instance ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteInstance(instanceId) {
    const result = await this.db.query(`
      DELETE FROM neural_network_instances WHERE id = $1
    `, [instanceId]);

    return result.rowCount > 0;
  }
}
