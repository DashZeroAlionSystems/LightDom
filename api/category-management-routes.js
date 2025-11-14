/**
 * Category Management API Routes
 * Provides endpoints for managing categories and triggering auto-CRUD generation
 */

import express from 'express';

const router = express.Router();

/**
 * Create category management routes
 */
export function createCategoryManagementRoutes(db, crudGenerator) {
  
  /**
   * @swagger
   * /api/category-management/categories:
   *   get:
   *     summary: List all categories
   *     tags: [Category Management]
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *         description: Filter by category type
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter by status
   *     responses:
   *       200:
   *         description: List of categories
   */
  router.get('/categories', async (req, res) => {
    try {
      const { type, status = 'active' } = req.query;
      
      let query = 'SELECT * FROM categories WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (type) {
        query += ` AND category_type = $${paramIndex++}`;
        params.push(type);
      }
      
      if (status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(status);
      }
      
      query += ' ORDER BY sort_order, name';
      
      const result = await db.query(query, params);
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error listing categories:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/categories/{id}:
   *   get:
   *     summary: Get category by ID
   *     tags: [Category Management]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Category details
   *       404:
   *         description: Category not found
   */
  router.get('/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'SELECT * FROM categories WHERE category_id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/categories:
   *   post:
   *     summary: Create a new category
   *     tags: [Category Management]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - display_name
   *               - category_type
   *             properties:
   *               name:
   *                 type: string
   *               display_name:
   *                 type: string
   *               description:
   *                 type: string
   *               category_type:
   *                 type: string
   *               auto_generate_crud_api:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Category created successfully
   */
  router.post('/categories', async (req, res) => {
    try {
      const {
        name,
        display_name,
        description,
        category_type,
        auto_generate_crud_api = true,
        api_config,
        schema_definition,
        parent_category_id,
        icon,
        color,
        sort_order = 0,
        created_by = 'system'
      } = req.body;
      
      // Validate required fields
      if (!name || !display_name || !category_type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, display_name, category_type'
        });
      }
      
      // Generate category ID
      const category_id = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      
      // Default API config
      const defaultApiConfig = {
        crud_enabled: true,
        use_cases: [],
        search_fields: ['name', 'description'],
        filter_fields: ['status', 'category_type'],
        api_enabled: true,
        pagination: {
          enabled: true,
          default_limit: 50,
          max_limit: 100
        },
        authentication: {
          required: false,
          roles: []
        }
      };
      
      const defaultSchemaDefinition = {
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'description', type: 'text', required: false },
          { name: 'status', type: 'string', default: 'active' }
        ]
      };
      
      const query = `
        INSERT INTO categories (
          category_id, name, display_name, description, category_type,
          auto_generate_crud_api, api_config, schema_definition,
          parent_category_id, icon, color, sort_order, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        category_id,
        name,
        display_name,
        description || null,
        category_type,
        auto_generate_crud_api,
        JSON.stringify(api_config || defaultApiConfig),
        JSON.stringify(schema_definition || defaultSchemaDefinition),
        parent_category_id || null,
        icon || null,
        color || null,
        sort_order,
        created_by
      ]);
      
      const newCategory = result.rows[0];
      
      // If auto_generate_crud_api is true, the database trigger will handle API generation
      // But we should also regenerate routes in the service
      if (auto_generate_crud_api && crudGenerator) {
        try {
          await crudGenerator.scanAndGenerateAPIs();
          console.log(`✅ Auto-generated CRUD API for category: ${name}`);
        } catch (genError) {
          console.error('Error auto-generating CRUD API:', genError);
          // Don't fail the request, just log the error
        }
      }
      
      res.status(201).json({
        success: true,
        data: newCategory,
        message: `Category "${display_name}" created successfully${auto_generate_crud_api ? ' with auto-generated CRUD API' : ''}`
      });
    } catch (error) {
      console.error('Error creating category:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/categories/{id}:
   *   put:
   *     summary: Update a category
   *     tags: [Category Management]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Category updated successfully
   *       404:
   *         description: Category not found
   */
  router.put('/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        display_name,
        description,
        auto_generate_crud_api,
        api_config,
        schema_definition,
        status,
        icon,
        color,
        sort_order,
        updated_by = 'system'
      } = req.body;
      
      // Build update query dynamically
      const updates = [];
      const params = [id];
      let paramIndex = 2;
      
      if (display_name !== undefined) {
        updates.push(`display_name = $${paramIndex++}`);
        params.push(display_name);
      }
      
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        params.push(description);
      }
      
      if (auto_generate_crud_api !== undefined) {
        updates.push(`auto_generate_crud_api = $${paramIndex++}`);
        params.push(auto_generate_crud_api);
      }
      
      if (api_config !== undefined) {
        updates.push(`api_config = $${paramIndex++}`);
        params.push(JSON.stringify(api_config));
      }
      
      if (schema_definition !== undefined) {
        updates.push(`schema_definition = $${paramIndex++}`);
        params.push(JSON.stringify(schema_definition));
      }
      
      if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(status);
      }
      
      if (icon !== undefined) {
        updates.push(`icon = $${paramIndex++}`);
        params.push(icon);
      }
      
      if (color !== undefined) {
        updates.push(`color = $${paramIndex++}`);
        params.push(color);
      }
      
      if (sort_order !== undefined) {
        updates.push(`sort_order = $${paramIndex++}`);
        params.push(sort_order);
      }
      
      updates.push(`updated_by = $${paramIndex++}`);
      params.push(updated_by);
      
      updates.push(`updated_at = NOW()`);
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }
      
      const query = `
        UPDATE categories
        SET ${updates.join(', ')}
        WHERE category_id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      // Regenerate routes if needed
      if (crudGenerator && (auto_generate_crud_api !== undefined || api_config !== undefined || schema_definition !== undefined)) {
        try {
          await crudGenerator.scanAndGenerateAPIs();
          console.log(`✅ Regenerated CRUD API for category: ${id}`);
        } catch (genError) {
          console.error('Error regenerating CRUD API:', genError);
        }
      }
      
      res.json({
        success: true,
        data: result.rows[0],
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/categories/{id}:
   *   delete:
   *     summary: Delete a category
   *     tags: [Category Management]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Category deleted successfully
   *       404:
   *         description: Category not found
   */
  router.delete('/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'DELETE FROM categories WHERE category_id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Category deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/routes:
   *   get:
   *     summary: Get all auto-generated routes
   *     tags: [Category Management]
   *     responses:
   *       200:
   *         description: List of auto-generated routes
   */
  router.get('/routes', async (req, res) => {
    try {
      if (!crudGenerator) {
        return res.status(503).json({
          success: false,
          error: 'CRUD generator not initialized'
        });
      }
      
      const routes = crudGenerator.getGeneratedRoutes();
      
      res.json({
        success: true,
        data: routes,
        count: routes.length
      });
    } catch (error) {
      console.error('Error getting routes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/routes/regenerate:
   *   post:
   *     summary: Regenerate all auto-CRUD routes
   *     tags: [Category Management]
   *     responses:
   *       200:
   *         description: Routes regenerated successfully
   */
  router.post('/routes/regenerate', async (req, res) => {
    try {
      if (!crudGenerator) {
        return res.status(503).json({
          success: false,
          error: 'CRUD generator not initialized'
        });
      }
      
      const result = await crudGenerator.scanAndGenerateAPIs();
      
      res.json({
        success: true,
        message: 'Routes regenerated successfully',
        ...result
      });
    } catch (error) {
      console.error('Error regenerating routes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/statistics:
   *   get:
   *     summary: Get category statistics
   *     tags: [Category Management]
   *     responses:
   *       200:
   *         description: Category statistics
   */
  router.get('/statistics', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM v_category_statistics ORDER BY total_items DESC');
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/config:
   *   get:
   *     summary: Get system configuration
   *     tags: [Category Management]
   *     responses:
   *       200:
   *         description: System configuration
   */
  router.get('/config', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM category_system_config ORDER BY config_key');
      
      const config = {};
      for (const row of result.rows) {
        config[row.config_key] = row.config_value;
      }
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error getting config:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /api/category-management/swagger:
   *   get:
   *     summary: Get Swagger documentation for auto-generated APIs
   *     tags: [Category Management]
   *     responses:
   *       200:
   *         description: Swagger/OpenAPI specification
   */
  router.get('/swagger', async (req, res) => {
    try {
      if (!crudGenerator) {
        return res.status(503).json({
          success: false,
          error: 'CRUD generator not initialized'
        });
      }
      
      const swagger = crudGenerator.getSwaggerDocumentation();
      
      res.json(swagger);
    } catch (error) {
      console.error('Error getting swagger:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createCategoryManagementRoutes;
