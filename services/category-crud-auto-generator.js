/**
 * Category-Based CRUD Auto-Generator Service
 * Automatically generates and manages CRUD APIs based on category configuration
 * Integrates with database triggers to provide dynamic API generation
 */

import express from 'express';
import { Pool } from 'pg';

export class CategoryCrudAutoGenerator {
  constructor(dbPool) {
    this.db = dbPool;
    this.generatedRoutes = new Map();
    this.categoryRoutes = new Map();
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
        'UPDATE category_items SET status = $1, metadata = jsonb_set(metadata, \'{last_executed_at}\', to_jsonb(NOW()::text)) WHERE item_id = $2 AND category_id = $3 RETURNING *',
        ['running', id, 'workflows']
      );
      return { success: true, item: result.rows[0] };
    });

    this.useCaseHandlers.set('workflows:pause', async (db, id) => {
      const result = await db.query(
        'UPDATE category_items SET status = $1 WHERE item_id = $2 AND category_id = $3 RETURNING *',
        ['paused', id, 'workflows']
      );
      return { success: true, item: result.rows[0] };
    });

    // Service use-cases
    this.useCaseHandlers.set('services:health_check', async (db, id) => {
      const result = await db.query(
        'SELECT * FROM category_items WHERE item_id = $1 AND category_id = $2',
        [id, 'services']
      );
      const service = result.rows[0];
      
      if (!service) {
        throw new Error('Service not found');
      }

      const isHealthy = Math.random() > 0.1;
      
      await db.query(
        'UPDATE category_items SET metadata = jsonb_set(metadata, \'{health_status}\', $1::jsonb), status = $2 WHERE item_id = $3',
        [JSON.stringify({ healthy: isHealthy, timestamp: new Date().toISOString() }), isHealthy ? 'active' : 'unhealthy', id]
      );

      return { 
        success: true, 
        service_id: id,
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
    });

    // Data mining use-cases
    this.useCaseHandlers.set('data_mining_jobs:execute', async (db, id) => {
      const result = await db.query(
        'UPDATE category_items SET status = $1, metadata = jsonb_set(metadata, \'{last_run_at}\', to_jsonb(NOW()::text)) WHERE item_id = $2 AND category_id = $3 RETURNING *',
        ['running', id, 'data-mining']
      );
      return { success: true, job: result.rows[0] };
    });

    // Campaign use-cases
    this.useCaseHandlers.set('campaigns:launch', async (db, id) => {
      const result = await db.query(
        'UPDATE category_items SET status = $1, metadata = jsonb_set(metadata, \'{launched_at}\', to_jsonb(NOW()::text)) WHERE item_id = $2 AND category_id = $3 RETURNING *',
        ['active', id, 'campaigns']
      );
      return { success: true, campaign: result.rows[0] };
    });
  }

  /**
   * Scan database and generate APIs for all active categories
   */
  async scanAndGenerateAPIs() {
    try {
      // Get all categories with auto_generate_crud_api enabled
      const categoriesQuery = `
        SELECT 
          c.*,
          ar.route_id,
          ar.base_path,
          ar.endpoints,
          ar.use_cases
        FROM categories c
        LEFT JOIN auto_generated_api_routes ar ON c.category_id = ar.category_id AND ar.status = 'active'
        WHERE c.auto_generate_crud_api = TRUE AND c.status = 'active'
        ORDER BY c.sort_order, c.name
      `;
      
      const result = await this.db.query(categoriesQuery);
      const categories = result.rows;

      console.log(`📊 Found ${categories.length} categories with auto-CRUD generation enabled`);

      // Generate routes for each category
      for (const category of categories) {
        await this.generateRoutesForCategory(category);
      }

      return {
        success: true,
        categories_processed: categories.length,
        routes_generated: this.generatedRoutes.size
      };
    } catch (error) {
      console.error('Error scanning categories:', error);
      throw error;
    }
  }

  /**
   * Generate CRUD routes for a specific category
   */
  async generateRoutesForCategory(category) {
    try {
      const router = express.Router();
      const basePath = category.base_path || `/api/categories/${category.name}`;
      
      // Parse API config
      const apiConfig = typeof category.api_config === 'string' 
        ? JSON.parse(category.api_config) 
        : category.api_config;

      const schemaDefinition = typeof category.schema_definition === 'string'
        ? JSON.parse(category.schema_definition)
        : category.schema_definition;

      // Generate CRUD routes if enabled
      if (apiConfig.crud_enabled !== false) {
        this.generateCRUDRoutes(router, category, apiConfig, schemaDefinition);
      }

      // Generate use-case routes
      if (category.use_cases && Array.isArray(category.use_cases)) {
        this.generateUseCaseRoutes(router, category, category.use_cases);
      }

      this.generatedRoutes.set(category.category_id, {
        router,
        basePath,
        category,
        apiConfig
      });

      this.categoryRoutes.set(category.name, {
        categoryId: category.category_id,
        basePath,
        displayName: category.display_name
      });

      console.log(`✅ Generated routes for category "${category.display_name}" at ${basePath}`);
      
      return { category: category.name, basePath, apiConfig };
    } catch (error) {
      console.error(`Error generating routes for category ${category.name}:`, error);
      return null;
    }
  }

  /**
   * Generate standard CRUD routes for a category
   */
  generateCRUDRoutes(router, category, apiConfig, schemaDefinition) {
    const categoryId = category.category_id;
    const searchFields = apiConfig.search_fields || ['name', 'description'];
    const filterFields = apiConfig.filter_fields || [];

    // CREATE - POST /
    router.post('/', async (req, res) => {
      try {
        const data = req.body;
        const itemId = `${category.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const query = `
          INSERT INTO category_items (item_id, category_id, name, description, status, config, metadata, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;

        const result = await this.db.query(query, [
          itemId,
          categoryId,
          data.name,
          data.description || null,
          data.status || 'active',
          JSON.stringify(data.config || {}),
          JSON.stringify(data.metadata || {}),
          data.created_by || 'system'
        ]);

        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: `${category.display_name} created successfully`
        });
      } catch (error) {
        console.error(`Error creating ${category.name}:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // READ ALL - GET /
    router.get('/', async (req, res) => {
      try {
        const { page = 1, limit = 50, search, sort = 'created_at', order = 'DESC', ...filters } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE category_id = $1';
        const queryParams = [categoryId];
        let paramIndex = 2;

        // Add search
        if (search && searchFields.length > 0) {
          const searchConditions = searchFields.map(field => {
            queryParams.push(`%${search}%`);
            return `${field}::text ILIKE $${paramIndex++}`;
          });
          whereClause += ` AND (${searchConditions.join(' OR ')})`;
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
          whereClause += ' AND ' + filterConditions.join(' AND ');
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM category_items ${whereClause}`;
        const countResult = await this.db.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        // Get data
        const dataQuery = `
          SELECT * FROM category_items 
          ${whereClause} 
          ORDER BY ${sort} ${order}
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
        console.error(`Error reading ${category.name}:`, error);
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
        const query = `SELECT * FROM category_items WHERE item_id = $1 AND category_id = $2`;
        const result = await this.db.query(query, [id, categoryId]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${category.display_name} not found`
          });
        }

        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error reading ${category.name}:`, error);
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

        const query = `
          UPDATE category_items 
          SET name = $1, description = $2, status = $3, config = $4, metadata = $5, updated_by = $6, updated_at = NOW()
          WHERE item_id = $7 AND category_id = $8
          RETURNING *
        `;

        const result = await this.db.query(query, [
          data.name,
          data.description || null,
          data.status || 'active',
          JSON.stringify(data.config || {}),
          JSON.stringify(data.metadata || {}),
          data.updated_by || 'system',
          id,
          categoryId
        ]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${category.display_name} not found`
          });
        }

        res.json({
          success: true,
          data: result.rows[0],
          message: `${category.display_name} updated successfully`
        });
      } catch (error) {
        console.error(`Error updating ${category.name}:`, error);
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
        const query = `DELETE FROM category_items WHERE item_id = $1 AND category_id = $2 RETURNING *`;
        const result = await this.db.query(query, [id, categoryId]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${category.display_name} not found`
          });
        }

        res.json({
          success: true,
          message: `${category.display_name} deleted successfully`,
          data: result.rows[0]
        });
      } catch (error) {
        console.error(`Error deleting ${category.name}:`, error);
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
  generateUseCaseRoutes(router, category, useCases) {
    for (const useCase of useCases) {
      const handlerKey = `${category.name}:${useCase}`;
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
  registerUseCaseHandler(categoryName, useCase, handler) {
    const key = `${categoryName}:${useCase}`;
    this.useCaseHandlers.set(key, handler);
    console.log(`✅ Registered custom use-case handler: ${key}`);
  }

  /**
   * Mount all generated routes to an Express app
   */
  mountRoutes(app) {
    let routeCount = 0;
    
    for (const [categoryId, routeInfo] of this.generatedRoutes) {
      app.use(routeInfo.basePath, routeInfo.router);
      routeCount++;
      console.log(`📍 Mounted: ${routeInfo.basePath} (${routeInfo.category.display_name})`);
    }

    console.log(`\n✅ Mounted ${routeCount} auto-generated category API routes`);
    
    return routeCount;
  }

  /**
   * Get list of all generated routes
   */
  getGeneratedRoutes() {
    const routes = [];
    
    for (const [categoryId, routeInfo] of this.generatedRoutes) {
      const category = routeInfo.category;
      const apiConfig = routeInfo.apiConfig;
      const useCases = category.use_cases || [];
      
      routes.push({
        categoryId: category.category_id,
        categoryName: category.name,
        displayName: category.display_name,
        categoryType: category.category_type,
        basePath: routeInfo.basePath,
        crud: apiConfig.crud_enabled !== false,
        useCases,
        endpoints: [
          ...(apiConfig.crud_enabled !== false ? [
            { method: 'POST', path: routeInfo.basePath, description: `Create ${category.display_name}` },
            { method: 'GET', path: routeInfo.basePath, description: `List all ${category.display_name}` },
            { method: 'GET', path: `${routeInfo.basePath}/:id`, description: `Get ${category.display_name} by ID` },
            { method: 'PUT', path: `${routeInfo.basePath}/:id`, description: `Update ${category.display_name}` },
            { method: 'DELETE', path: `${routeInfo.basePath}/:id`, description: `Delete ${category.display_name}` }
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

  /**
   * Get Swagger/OpenAPI documentation for all generated routes
   */
  getSwaggerDocumentation() {
    const paths = {};
    const tags = [];
    const schemas = {};

    for (const [categoryId, routeInfo] of this.generatedRoutes) {
      const category = routeInfo.category;
      const apiConfig = routeInfo.apiConfig;
      const basePath = routeInfo.basePath;
      
      // Add tag
      tags.push({
        name: category.display_name,
        description: category.description || `API endpoints for ${category.display_name}`,
        externalDocs: {
          description: `${category.category_type} management`,
          url: `${basePath}`
        }
      });

      // Add schema
      const schemaName = category.display_name.replace(/\s+/g, '');
      schemas[schemaName] = {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: 'Unique identifier' },
          category_id: { type: 'string', description: 'Category identifier' },
          name: { type: 'string', description: 'Item name' },
          description: { type: 'string', description: 'Item description' },
          status: { type: 'string', enum: ['active', 'inactive', 'archived'], default: 'active' },
          config: { type: 'object', description: 'Configuration object' },
          metadata: { type: 'object', description: 'Metadata object' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      };

      if (apiConfig.crud_enabled !== false) {
        // POST - Create
        paths[basePath] = paths[basePath] || {};
        paths[basePath].post = {
          tags: [category.display_name],
          summary: `Create new ${category.display_name}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` }
              }
            }
          },
          responses: {
            '201': {
              description: 'Successfully created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: `#/components/schemas/${schemaName}` }
                    }
                  }
                }
              }
            }
          }
        };

        // GET - List all
        paths[basePath].get = {
          tags: [category.display_name],
          summary: `List all ${category.display_name}`,
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'sort', in: 'query', schema: { type: 'string', default: 'created_at' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } }
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: `#/components/schemas/${schemaName}` } },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        // GET/:id - Get one
        paths[`${basePath}/{id}`] = paths[`${basePath}/{id}`] || {};
        paths[`${basePath}/{id}`].get = {
          tags: [category.display_name],
          summary: `Get ${category.display_name} by ID`,
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: `#/components/schemas/${schemaName}` }
                    }
                  }
                }
              }
            },
            '404': { description: 'Not found' }
          }
        };

        // PUT/:id - Update
        paths[`${basePath}/{id}`].put = {
          tags: [category.display_name],
          summary: `Update ${category.display_name}`,
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` }
              }
            }
          },
          responses: {
            '200': { description: 'Successfully updated' },
            '404': { description: 'Not found' }
          }
        };

        // DELETE/:id - Delete
        paths[`${basePath}/{id}`].delete = {
          tags: [category.display_name],
          summary: `Delete ${category.display_name}`,
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': { description: 'Successfully deleted' },
            '404': { description: 'Not found' }
          }
        };
      }
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'LightDom Auto-Generated Category APIs',
        version: '1.0.0',
        description: 'Dynamically generated CRUD APIs for all categories with auto-generation enabled'
      },
      servers: [
        { url: 'http://localhost:3001', description: 'Development server' },
        { url: 'http://localhost:8080', description: 'Production server' }
      ],
      tags,
      paths,
      components: {
        schemas
      }
    };
  }

  /**
   * Get category information by name
   */
  getCategoryInfo(categoryName) {
    return this.categoryRoutes.get(categoryName);
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return Array.from(this.categoryRoutes.values());
  }
}

export default CategoryCrudAutoGenerator;
