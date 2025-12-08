/**
 * API Auto-Generator Service
 * Automatically generates CRUD and use-case APIs based on database schema metadata
 */

import express from 'express';
import { Pool } from 'pg';

export class ApiAutoGeneratorService {
  constructor(dbPool) {
    this.db = dbPool;
    this.generatedRoutes = new Map();
    this.useCaseHandlers = new Map();
    
    // Register default use-case handlers
    this.registerDefaultUseCaseHandlers();
  }

  /**
   * Register default use-case handlers for common operations
   */
  registerDefaultUseCaseHandlers() {
    // Workflow use-cases
    this.useCaseHandlers.set('workflows:execute', async (db, id, params) => {
      const result = await db.query(
        'UPDATE workflows SET status = $1, last_executed_at = NOW(), execution_count = execution_count + 1 WHERE id = $2 RETURNING *',
        ['running', id]
      );
      return { success: true, workflow: result.rows[0] };
    });

    this.useCaseHandlers.set('workflows:pause', async (db, id) => {
      const result = await db.query(
        'UPDATE workflows SET status = $1 WHERE id = $2 RETURNING *',
        ['paused', id]
      );
      return { success: true, workflow: result.rows[0] };
    });

    this.useCaseHandlers.set('workflows:resume', async (db, id) => {
      const result = await db.query(
        'UPDATE workflows SET status = $1 WHERE id = $2 RETURNING *',
        ['active', id]
      );
      return { success: true, workflow: result.rows[0] };
    });

    // Service use-cases
    this.useCaseHandlers.set('services:health_check', async (db, id) => {
      const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
      const service = result.rows[0];
      
      if (!service) {
        throw new Error('Service not found');
      }

      // Simulate health check (in production, actually ping the service)
      const isHealthy = Math.random() > 0.1; // 90% success rate
      
      await db.query(
        'UPDATE services SET last_health_check = NOW(), status = $1 WHERE id = $2',
        [isHealthy ? 'running' : 'unhealthy', id]
      );

      return { 
        success: true, 
        service_id: id,
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
    });

    this.useCaseHandlers.set('services:restart', async (db, id) => {
      await db.query(
        'UPDATE services SET status = $1, updated_at = NOW() WHERE id = $2',
        ['restarting', id]
      );
      
      // Simulate restart delay
      setTimeout(async () => {
        await db.query(
          'UPDATE services SET status = $1 WHERE id = $2',
          ['running', id]
        );
      }, 2000);

      return { success: true, message: 'Service restart initiated' };
    });

    // Data mining use-cases
    this.useCaseHandlers.set('datamining:execute_job', async (db, id) => {
      const result = await db.query(
        'UPDATE datamining SET status = $1, last_run_at = NOW(), total_runs = total_runs + 1, next_run_at = NULL WHERE id = $2 RETURNING *',
        ['running', id]
      );
      return { success: true, job: result.rows[0] };
    });

    this.useCaseHandlers.set('datamining:schedule', async (db, id, params) => {
      const { schedule_config } = params;
      const result = await db.query(
        'UPDATE datamining SET schedule_config = $1, status = $2, next_run_at = $3 WHERE id = $4 RETURNING *',
        [schedule_config, 'scheduled', params.next_run_at || new Date(Date.now() + 3600000), id]
      );
      return { success: true, job: result.rows[0] };
    });

    // SEO use-cases
    this.useCaseHandlers.set('seo:analyze', async (db, id) => {
      const result = await db.query('SELECT * FROM seo WHERE id = $1', [id]);
      const seo = result.rows[0];
      
      // Simulate SEO analysis
      const analysis = {
        score: Math.floor(Math.random() * 100),
        issues: ['Missing meta description', 'Title too short'],
        recommendations: ['Add meta description', 'Expand title to 50-60 characters']
      };

      await db.query(
        'UPDATE seo SET score = $1, issues = $2, recommendations = $3, analyzed_at = NOW() WHERE id = $4',
        [analysis.score, JSON.stringify(analysis.issues), JSON.stringify(analysis.recommendations), id]
      );

      return { success: true, analysis };
    });

    // Task use-cases
    this.useCaseHandlers.set('tasks:execute', async (db, id) => {
      const result = await db.query(
        'UPDATE tasks SET status = $1, started_at = NOW() WHERE id = $2 RETURNING *',
        ['running', id]
      );
      return { success: true, task: result.rows[0] };
    });

    this.useCaseHandlers.set('tasks:retry', async (db, id) => {
      const result = await db.query(
        'UPDATE tasks SET status = $1, retry_count = retry_count + 1, error_details = NULL WHERE id = $2 AND retry_count < max_retries RETURNING *',
        ['pending', id]
      );
      
      if (result.rowCount === 0) {
        throw new Error('Task cannot be retried (max retries reached or not found)');
      }
      
      return { success: true, task: result.rows[0] };
    });

    this.useCaseHandlers.set('tasks:cancel', async (db, id) => {
      const result = await db.query(
        'UPDATE tasks SET status = $1, completed_at = NOW() WHERE id = $2 RETURNING *',
        ['cancelled', id]
      );
      return { success: true, task: result.rows[0] };
    });

    // Agent use-cases
    this.useCaseHandlers.set('agents:activate', async (db, id) => {
      const result = await db.query(
        'UPDATE agents SET status = $1, last_active_at = NOW() WHERE id = $2 RETURNING *',
        ['active', id]
      );
      return { success: true, agent: result.rows[0] };
    });

    this.useCaseHandlers.set('agents:train', async (db, id, params) => {
      const { training_data } = params;
      // In production, this would trigger actual training
      await db.query(
        'UPDATE agents SET performance_score = performance_score + 0.1, updated_at = NOW() WHERE id = $1',
        [id]
      );
      return { success: true, message: 'Training initiated' };
    });

    // Schema use-cases
    this.useCaseHandlers.set('schemas:generate_api', async (db, id) => {
      const result = await db.query('SELECT * FROM schemas WHERE id = $1', [id]);
      const schema = result.rows[0];
      
      if (!schema) {
        throw new Error('Schema not found');
      }

      // Generate API definition
      const apiDef = {
        table_name: schema.entity_type,
        api_path: `/api/generated/${schema.entity_type}`,
        crud_operations: ['create', 'read', 'update', 'delete'],
        use_case_operations: schema.api_config?.use_cases || []
      };

      return { success: true, api_definition: apiDef };
    });
  }

  /**
   * Scan database tables and generate APIs based on _meta column
   */
  async scanAndGenerateAPIs() {
    try {
      // Get all tables with _meta column
      const tablesQuery = `
        SELECT 
          table_name,
          column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = '_meta'
      `;
      
      const result = await this.db.query(tablesQuery);
      const tables = result.rows.map(row => row.table_name);

      console.log(`📊 Found ${tables.length} tables with auto-generation metadata`);

      // Generate routes for each table
      for (const tableName of tables) {
        await this.generateRoutesForTable(tableName);
      }

      return {
        success: true,
        tables_processed: tables.length,
        routes_generated: this.generatedRoutes.size
      };
    } catch (error) {
      console.error('Error scanning tables:', error);
      throw error;
    }
  }

  /**
   * Generate CRUD and use-case routes for a specific table
   */
  async generateRoutesForTable(tableName) {
    try {
      // Get table metadata
      const metaQuery = `
        SELECT _meta 
        FROM ${tableName} 
        LIMIT 1
      `;
      
      let meta;
      try {
        const result = await this.db.query(metaQuery);
        meta = result.rows[0]?._meta || { api_enabled: true, crud_enabled: true };
      } catch (error) {
        // If table is empty, use defaults
        meta = { api_enabled: true, crud_enabled: true };
      }

      if (!meta.api_enabled) {
        console.log(`⏭️  Skipping ${tableName} (API disabled in metadata)`);
        return null;
      }

      const router = express.Router();
      const basePath = `/api/${tableName.replace(/_/g, '-')}`;

      // Generate CRUD routes
      if (meta.crud_enabled !== false) {
        this.generateCRUDRoutes(router, tableName, meta);
      }

      // Generate use-case routes
      if (meta.use_cases && Array.isArray(meta.use_cases)) {
        this.generateUseCaseRoutes(router, tableName, meta.use_cases);
      }

      this.generatedRoutes.set(tableName, {
        router,
        basePath,
        meta
      });

      console.log(`✅ Generated routes for ${tableName} at ${basePath}`);
      
      return { tableName, basePath, meta };
    } catch (error) {
      console.error(`Error generating routes for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Generate standard CRUD routes
   */
  generateCRUDRoutes(router, tableName, meta) {
    const searchFields = meta.search_fields || [];
    const filterFields = meta.filter_fields || [];

    // CREATE - POST /
    router.post('/', async (req, res) => {
      try {
        const data = req.body;
        const columns = Object.keys(data).filter(k => k !== '_meta');
        const values = columns.map(k => data[k]);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const query = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders.join(', ')})
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

    // READ - GET /
    router.get('/', async (req, res) => {
      try {
        const { page = 1, limit = 50, search, sort, order = 'DESC', ...filters } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        const queryParams = [];
        let paramIndex = 1;

        // Add search
        if (search && searchFields.length > 0) {
          const searchConditions = searchFields.map(field => {
            queryParams.push(`%${search}%`);
            return `${field}::text ILIKE $${paramIndex++}`;
          });
          whereClause = `WHERE (${searchConditions.join(' OR ')})`;
        }

        // Add filters
        const filterConditions = [];
        for (const [key, value] of Object.entries(filters)) {
          if (filterFields.includes(key)) {
            queryParams.push(value);
            filterConditions.push(`${key} = $${paramIndex++}`);
          }
        }

        if (filterConditions.length > 0) {
          whereClause += (whereClause ? ' AND ' : 'WHERE ') + filterConditions.join(' AND ');
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
        const countResult = await this.db.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        // Get data
        const orderClause = sort ? `ORDER BY ${sort} ${order}` : 'ORDER BY created_at DESC';
        const dataQuery = `
          SELECT * FROM ${tableName} 
          ${whereClause} 
          ${orderClause} 
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        const dataResult = await this.db.query(dataQuery, [...queryParams, limit, offset]);

        res.json({
          success: true,
          data: dataResult.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error(`Error reading ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // READ ONE - GET /:id
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = `SELECT * FROM ${tableName} WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Record not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error reading ${tableName}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // UPDATE - PUT /:id
    router.put('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const columns = Object.keys(data).filter(k => k !== '_meta' && k !== 'id');
        const values = columns.map(k => data[k]);
        const setClauses = columns.map((col, i) => `${col} = $${i + 2}`);

        const query = `
          UPDATE ${tableName} 
          SET ${setClauses.join(', ')}, updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `;

        const result = await this.db.query(query, [id, ...values]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Record not found'
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

    // DELETE - DELETE /:id
    router.delete('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Record not found'
          });
        }

        res.json({
          success: true,
          message: 'Record deleted successfully',
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
  }

  /**
   * Generate use-case specific routes
   */
  generateUseCaseRoutes(router, tableName, useCases) {
    for (const useCase of useCases) {
      const handlerKey = `${tableName}:${useCase}`;
      const handler = this.useCaseHandlers.get(handlerKey);

      if (!handler) {
        console.warn(`⚠️  No handler found for use case: ${handlerKey}`);
        continue;
      }

      // POST /:id/{useCase}
      router.post(`/:id/${useCase.replace(/_/g, '-')}`, async (req, res) => {
        try {
          const { id } = req.params;
          const params = req.body;

          const result = await handler(this.db, id, params);
          
          res.json({
            success: true,
            ...result
          });
        } catch (error) {
          console.error(`Error executing ${useCase}:`, error);
          res.status(500).json({
            success: false,
            error: error.message
          });
        }
      });

      console.log(`  ✓ Added use-case route: POST /:id/${useCase.replace(/_/g, '-')}`);
    }
  }

  /**
   * Register custom use-case handler
   */
  registerUseCaseHandler(tableName, useCase, handler) {
    const key = `${tableName}:${useCase}`;
    this.useCaseHandlers.set(key, handler);
    console.log(`✅ Registered custom use-case handler: ${key}`);
  }

  /**
   * Mount all generated routes to an Express app
   */
  mountRoutes(app) {
    let routeCount = 0;
    
    for (const [tableName, routeInfo] of this.generatedRoutes) {
      app.use(routeInfo.basePath, routeInfo.router);
      routeCount++;
      console.log(`📍 Mounted: ${routeInfo.basePath}`);
    }

    console.log(`\n✅ Mounted ${routeCount} auto-generated API routes`);
    
    return routeCount;
  }

  /**
   * Get list of all generated routes
   */
  getGeneratedRoutes() {
    const routes = [];
    
    for (const [tableName, routeInfo] of this.generatedRoutes) {
      const useCases = routeInfo.meta.use_cases || [];
      
      routes.push({
        table: tableName,
        basePath: routeInfo.basePath,
        crud: routeInfo.meta.crud_enabled !== false,
        useCases,
        endpoints: [
          ...(routeInfo.meta.crud_enabled !== false ? [
            { method: 'POST', path: routeInfo.basePath, description: 'Create' },
            { method: 'GET', path: routeInfo.basePath, description: 'List all' },
            { method: 'GET', path: `${routeInfo.basePath}/:id`, description: 'Get one' },
            { method: 'PUT', path: `${routeInfo.basePath}/:id`, description: 'Update' },
            { method: 'DELETE', path: `${routeInfo.basePath}/:id`, description: 'Delete' }
          ] : []),
          ...useCases.map(uc => ({
            method: 'POST',
            path: `${routeInfo.basePath}/:id/${uc.replace(/_/g, '-')}`,
            description: `Use case: ${uc}`
          }))
        ]
      });
    }
    
    return routes;
  }
}

export default ApiAutoGeneratorService;
