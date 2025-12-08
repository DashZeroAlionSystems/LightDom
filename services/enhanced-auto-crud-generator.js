/**
 * Enhanced Auto-CRUD Route Generator
 * Automatically generates CRUD APIs for all new system tables
 * Integrates with category system and provides dynamic route mounting
 */

import express from 'express';

export class EnhancedAutoCrudGenerator {
  constructor(dbPool) {
    this.db = dbPool;
    this.generatedRoutes = new Map();
    this.tableConfigs = new Map();
    
    // Initialize table configurations
    this.initializeTableConfigs();
  }

  /**
   * Initialize configurations for all new tables
   */
  initializeTableConfigs() {
    // Neural Network Tables
    this.tableConfigs.set('neural_network_instances', {
      tableName: 'neural_network_instances',
      primaryKey: 'instance_id',
      displayName: 'Neural Network Instances',
      basePath: '/api/neural-networks/instances',
      searchFields: ['name', 'description', 'model_type'],
      filterFields: ['client_id', 'model_type', 'status'],
      sortFields: ['created_at', 'updated_at', 'last_trained_at'],
      relationships: [
        { table: 'neural_network_training_sessions', foreignKey: 'instance_id' },
        { table: 'neural_network_predictions', foreignKey: 'instance_id' }
      ]
    });

    this.tableConfigs.set('neural_network_training_sessions', {
      tableName: 'neural_network_training_sessions',
      primaryKey: 'session_id',
      displayName: 'Training Sessions',
      basePath: '/api/neural-networks/training-sessions',
      searchFields: ['status'],
      filterFields: ['instance_id', 'status'],
      sortFields: ['started_at', 'completed_at'],
      parentTable: 'neural_network_instances'
    });

    this.tableConfigs.set('neural_network_predictions', {
      tableName: 'neural_network_predictions',
      primaryKey: 'prediction_id',
      displayName: 'Predictions',
      basePath: '/api/neural-networks/predictions',
      searchFields: [],
      filterFields: ['instance_id', 'is_correct'],
      sortFields: ['created_at'],
      parentTable: 'neural_network_instances'
    });

    // Data Mining Tables
    this.tableConfigs.set('data_mining_jobs', {
      tableName: 'data_mining_jobs',
      primaryKey: 'job_id',
      displayName: 'Data Mining Jobs',
      basePath: '/api/data-mining/jobs',
      searchFields: ['name', 'description', 'job_type'],
      filterFields: ['status', 'job_type', 'client_id', 'campaign_id'],
      sortFields: ['created_at', 'start_time', 'priority'],
      relationships: [
        { table: 'data_mining_results', foreignKey: 'job_id' },
        { table: 'data_mining_schedules', foreignKey: 'job_template_id' }
      ]
    });

    this.tableConfigs.set('data_mining_results', {
      tableName: 'data_mining_results',
      primaryKey: 'result_id',
      displayName: 'Mining Results',
      basePath: '/api/data-mining/results',
      searchFields: ['category', 'source_url'],
      filterFields: ['job_id', 'validation_passed', 'category'],
      sortFields: ['extracted_at', 'extraction_quality'],
      parentTable: 'data_mining_jobs'
    });

    this.tableConfigs.set('data_mining_schedules', {
      tableName: 'data_mining_schedules',
      primaryKey: 'schedule_id',
      displayName: 'Mining Schedules',
      basePath: '/api/data-mining/schedules',
      searchFields: ['name', 'description'],
      filterFields: ['enabled', 'schedule_type'],
      sortFields: ['next_run_at', 'last_run_at'],
      parentTable: 'data_mining_jobs'
    });

    // Training Data Tables
    this.tableConfigs.set('training_datasets', {
      tableName: 'training_datasets',
      primaryKey: 'dataset_id',
      displayName: 'Training Datasets',
      basePath: '/api/training/datasets',
      searchFields: ['name', 'description', 'domain', 'task'],
      filterFields: ['dataset_type', 'domain', 'is_public'],
      sortFields: ['created_at', 'updated_at', 'quality_score'],
      relationships: [
        { table: 'training_records', foreignKey: 'dataset_id' },
        { table: 'training_metrics', foreignKey: 'dataset_id' }
      ]
    });

    this.tableConfigs.set('training_records', {
      tableName: 'training_records',
      primaryKey: 'record_id',
      displayName: 'Training Records',
      basePath: '/api/training/records',
      searchFields: ['source_type'],
      filterFields: ['dataset_id', 'split_type', 'is_outlier', 'is_synthetic'],
      sortFields: ['created_at', 'quality_score'],
      parentTable: 'training_datasets'
    });

    this.tableConfigs.set('training_metrics', {
      tableName: 'training_metrics',
      primaryKey: 'metric_id',
      displayName: 'Training Metrics',
      basePath: '/api/training/metrics',
      searchFields: ['metric_type', 'phase'],
      filterFields: ['session_id', 'dataset_id', 'metric_type', 'phase'],
      sortFields: ['recorded_at', 'epoch'],
      parentTable: 'neural_network_training_sessions'
    });

    // Service Tables
    this.tableConfigs.set('service_definitions', {
      tableName: 'service_definitions',
      primaryKey: 'service_id',
      displayName: 'Service Definitions',
      basePath: '/api/services/definitions',
      searchFields: ['name', 'display_name', 'description', 'service_type'],
      filterFields: ['service_type', 'category', 'status', 'deployment_type'],
      sortFields: ['created_at', 'updated_at'],
      relationships: [
        { table: 'service_health_checks', foreignKey: 'service_id' },
        { table: 'service_logs', foreignKey: 'service_id' }
      ]
    });

    this.tableConfigs.set('service_health_checks', {
      tableName: 'service_health_checks',
      primaryKey: 'check_id',
      displayName: 'Service Health Checks',
      basePath: '/api/services/health-checks',
      searchFields: [],
      filterFields: ['service_id', 'status', 'check_type'],
      sortFields: ['checked_at'],
      parentTable: 'service_definitions'
    });

    this.tableConfigs.set('service_logs', {
      tableName: 'service_logs',
      primaryKey: 'log_id',
      displayName: 'Service Logs',
      basePath: '/api/services/logs',
      searchFields: ['message', 'level'],
      filterFields: ['service_id', 'level', 'request_id'],
      sortFields: ['logged_at'],
      parentTable: 'service_definitions'
    });

    // Seeding Tables
    this.tableConfigs.set('seeding_strategies', {
      tableName: 'seeding_strategies',
      primaryKey: 'strategy_id',
      displayName: 'Seeding Strategies',
      basePath: '/api/seeding/strategies',
      searchFields: ['name', 'description', 'strategy_type'],
      filterFields: ['strategy_type', 'status', 'is_default'],
      sortFields: ['created_at', 'success_rate']
    });

    this.tableConfigs.set('seed_quality_metrics', {
      tableName: 'seed_quality_metrics',
      primaryKey: 'metric_id',
      displayName: 'Seed Quality Metrics',
      basePath: '/api/seeding/quality-metrics',
      searchFields: [],
      filterFields: ['seed_id'],
      sortFields: ['measured_at', 'overall_quality']
    });

    // Attribute Tables
    this.tableConfigs.set('attribute_templates', {
      tableName: 'attribute_templates',
      primaryKey: 'template_id',
      displayName: 'Attribute Templates',
      basePath: '/api/attributes/templates',
      searchFields: ['name', 'description', 'attribute_type'],
      filterFields: ['attribute_type', 'category', 'status', 'is_public'],
      sortFields: ['created_at', 'usage_count', 'success_rate']
    });

    this.tableConfigs.set('attribute_extraction_history', {
      tableName: 'attribute_extraction_history',
      primaryKey: 'history_id',
      displayName: 'Attribute Extraction History',
      basePath: '/api/attributes/extraction-history',
      searchFields: ['source_url', 'extraction_method'],
      filterFields: ['attribute_id', 'validation_passed'],
      sortFields: ['extracted_at', 'confidence_score']
    });
  }

  /**
   * Generate all CRUD routes for configured tables
   */
  generateAllRoutes() {
    const masterRouter = express.Router();

    for (const [tableName, config] of this.tableConfigs) {
      const router = this.generateTableRoutes(config);
      this.generatedRoutes.set(tableName, router);
      
      // Mount to master router
      masterRouter.use(config.basePath, router);
      
      console.log(`✅ Generated CRUD routes for ${config.displayName} at ${config.basePath}`);
    }

    return masterRouter;
  }

  /**
   * Generate CRUD routes for a specific table
   */
  generateTableRoutes(config) {
    const router = express.Router();
    const { tableName, primaryKey, searchFields, filterFields, sortFields } = config;

    // CREATE
    router.post('/', async (req, res) => {
      try {
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
          INSERT INTO ${tableName} (${keys.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;
        
        const result = await this.db.query(query, values);
        res.status(201).json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // READ (List with pagination, filtering, sorting, search)
    router.get('/', async (req, res) => {
      try {
        const {
          page = 1,
          limit = 50,
          sort = 'created_at',
          order = 'DESC',
          search,
          ...filters
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClauses = [];
        const queryParams = [];
        let paramIndex = 1;

        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
          if (filterFields.includes(key) && value) {
            whereClauses.push(`${key} = $${paramIndex}`);
            queryParams.push(value);
            paramIndex++;
          }
        }

        // Apply search
        if (search && searchFields.length > 0) {
          const searchClauses = searchFields.map(field => 
            `${field}::text ILIKE $${paramIndex}`
          );
          whereClauses.push(`(${searchClauses.join(' OR ')})`);
          queryParams.push(`%${search}%`);
          paramIndex++;
        }

        const whereClause = whereClauses.length > 0 
          ? `WHERE ${whereClauses.join(' AND ')}` 
          : '';

        // Validate sort field
        const sortField = sortFields.includes(sort) ? sort : sortFields[0] || 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Count total
        const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
        const countResult = await this.db.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data
        const dataQuery = `
          SELECT * FROM ${tableName}
          ${whereClause}
          ORDER BY ${sortField} ${sortOrder}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        queryParams.push(parseInt(limit), offset);
        
        const result = await this.db.query(dataQuery, queryParams);

        res.json({
          success: true,
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        console.error(`Error listing ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // READ (Get by ID)
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = `SELECT * FROM ${tableName} WHERE ${primaryKey} = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error getting ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // UPDATE
    router.put('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        
        const query = `
          UPDATE ${tableName}
          SET ${setClause}
          WHERE ${primaryKey} = $1
          RETURNING *
        `;
        
        const result = await this.db.query(query, [id, ...values]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error updating ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // PATCH (Partial update)
    router.patch('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        
        const query = `
          UPDATE ${tableName}
          SET ${setClause}
          WHERE ${primaryKey} = $1
          RETURNING *
        `;
        
        const result = await this.db.query(query, [id, ...values]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error patching ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // DELETE
    router.delete('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = `DELETE FROM ${tableName} WHERE ${primaryKey} = $1 RETURNING *`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error deleting ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Bulk operations
    router.post('/bulk', async (req, res) => {
      try {
        const { items } = req.body;
        
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Items array is required'
          });
        }

        const results = [];
        for (const item of items) {
          const keys = Object.keys(item);
          const values = Object.values(item);
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          
          const query = `
            INSERT INTO ${tableName} (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
          `;
          
          const result = await this.db.query(query, values);
          results.push(result.rows[0]);
        }

        res.status(201).json({
          success: true,
          data: results,
          count: results.length
        });
      } catch (error) {
        console.error(`Error bulk creating ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    return router;
  }

  /**
   * Get configuration for a specific table
   */
  getTableConfig(tableName) {
    return this.tableConfigs.get(tableName);
  }

  /**
   * Get all table configurations
   */
  getAllTableConfigs() {
    return Array.from(this.tableConfigs.values());
  }

  /**
   * Get generated router for a specific table
   */
  getTableRouter(tableName) {
    return this.generatedRoutes.get(tableName);
  }
}

export default EnhancedAutoCrudGenerator;
