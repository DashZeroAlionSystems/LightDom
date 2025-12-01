/**
 * Category Management API Routes
 * Provides endpoints for managing categories and triggering auto-CRUD generation
 */

import express from 'express';
import { validateSchemaDefinition } from '../services/category-schema-validator.js';

const router = express.Router();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeSlug = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sanitizeIdentifier = (value) => {
  const safe = value.replace(/[^a-zA-Z0-9_]/g, '');
  return safe.length ? safe : null;
};

const mapCategoryRow = (row) => {
  if (!row) {
    return null;
  }

  const metadata = row.metadata || {};
  const schemaDefinition = row.schema_definition ?? null;

  return {
    category_id: row.category_id,
    slug: row.slug,
    display_name: row.display_name,
    description: row.description,
    parent_category_id: row.parent_category_id ?? metadata.parent_category_id ?? null,
    default_table: row.default_table,
    config_table: row.config_table,
    log_table: row.log_table,
    auto_generate_crud_api: row.auto_generate_crud,
    schema_definition: schemaDefinition,
    metadata,
    status: row.is_active ? 'active' : 'inactive',
    category_type: row.category_type ?? metadata.category_type ?? null,
    icon: row.icon ?? metadata.icon ?? null,
    color: row.color ?? metadata.color ?? null,
    sort_order: row.sort_order ?? metadata.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

const isUuid = (value) => UUID_PATTERN.test(value);

async function findCategoryByIdentifier(db, identifier) {
  if (!identifier) {
    return null;
  }

  const bySlug = await db.query('SELECT * FROM categories WHERE slug = $1', [identifier]);
  if (bySlug.rows.length) {
    return bySlug.rows[0];
  }

  if (isUuid(identifier)) {
    const byId = await db.query('SELECT * FROM categories WHERE category_id = $1::uuid', [identifier]);
    if (byId.rows.length) {
      return byId.rows[0];
    }
  }

  return null;
}

async function countTableRows(db, tableName) {
  if (!tableName) {
    return null;
  }

  const existsResult = await db.query('SELECT to_regclass($1) AS reg', [tableName]);
  if (!existsResult.rows.length || !existsResult.rows[0].reg) {
    return null;
  }

  const countResult = await db.query(`SELECT COUNT(*)::bigint AS total FROM ${tableName}`);
  return Number(countResult.rows[0].total);
}

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
      const { type, status } = req.query;

      const conditions = [];
      const params = [];

      if (status) {
        conditions.push(`is_active = $${params.length + 1}`);
        params.push(status === 'active');
      }

      if (type) {
        conditions.push(`(metadata ->> 'category_type') = $${params.length + 1}`);
        params.push(type);
      }

      const query = `
         SELECT category_id, slug, display_name, description, default_table, config_table, log_table,
           auto_generate_crud, is_active, metadata, schema_definition, created_at, updated_at
           FROM categories
           ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
           ORDER BY COALESCE(
              CASE WHEN (metadata ->> 'sort_order') ~ '^-?\\d+$'
                THEN (metadata ->> 'sort_order')::int
                ELSE NULL
              END,
              0
            ), display_name
      `;

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows.map(mapCategoryRow),
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

      const category = await findCategoryByIdentifier(db, id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: mapCategoryRow(category)
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
        slug,
        name,
        display_name,
        description,
        category_type,
        status = 'active',
        default_table,
        config_table,
        log_table,
        auto_generate_crud_api = true,
        api_config,
        schema_definition,
        parent_category_id,
        icon,
        color,
        sort_order = 0,
        metadata = {},
        created_by = 'system'
      } = req.body;

      const resolvedDisplayName = display_name || name;

      if (!resolvedDisplayName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: display_name or name'
        });
      }

      const slugSource = slug || name || display_name;
      const resolvedSlug = normalizeSlug(slugSource || resolvedDisplayName);

      if (!resolvedSlug) {
        return res.status(400).json({
          success: false,
          error: 'Unable to derive a valid slug for the category'
        });
      }

      let safeDefaultTable = null;
      if (default_table) {
        safeDefaultTable = sanitizeIdentifier(default_table);
        if (safeDefaultTable !== default_table) {
          return res.status(400).json({
            success: false,
            error: 'default_table must use only letters, numbers, or underscores'
          });
        }
      }

      let safeConfigTable = null;
      if (config_table) {
        safeConfigTable = sanitizeIdentifier(config_table);
        if (safeConfigTable !== config_table) {
          return res.status(400).json({
            success: false,
            error: 'config_table must use only letters, numbers, or underscores'
          });
        }
      }

      let safeLogTable = 'instance_execution_history';
      if (log_table === null) {
        safeLogTable = null;
      } else if (log_table) {
        safeLogTable = sanitizeIdentifier(log_table);
        if (safeLogTable !== log_table) {
          return res.status(400).json({
            success: false,
            error: 'log_table must use only letters, numbers, or underscores'
          });
        }
      }

      const schemaPayload = schema_definition ?? [];
      const schemaValidation = validateSchemaDefinition(schemaPayload, {
        categoryId: null,
      });

      if (!schemaValidation.valid) {
        return res.status(422).json({
          success: false,
          error: 'Invalid schema_definition supplied',
          details: schemaValidation.details,
        });
      }
      const combinedMetadata = {
        ...metadata,
        ...(category_type ? { category_type } : {}),
        ...(api_config ? { api_config } : {}),
        ...(icon ? { icon } : {}),
        ...(color ? { color } : {}),
        sort_order,
        created_by,
        ...(parent_category_id ? { parent_category_id } : {})
      };

      const result = await db.query(
        `INSERT INTO categories (
          slug, display_name, description, default_table, config_table, log_table,
          auto_generate_crud, is_active, schema_definition, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
        RETURNING *`,
        [
          resolvedSlug,
          resolvedDisplayName,
          description ?? null,
          safeDefaultTable,
          safeConfigTable,
          safeLogTable,
          auto_generate_crud_api,
          status === 'active',
          JSON.stringify(schemaPayload),
          JSON.stringify(combinedMetadata)
        ]
      );

      const newCategory = result.rows[0];

      if (newCategory) {
        const registryInserts = [];

        if (safeDefaultTable) {
          registryInserts.push(
            db.query(
              `INSERT INTO category_table_registry (category_id, table_type, table_name)
               VALUES ($1, 'data', $2)
               ON CONFLICT (category_id, table_type) DO UPDATE
               SET table_name = EXCLUDED.table_name, updated_at = NOW()`,
              [newCategory.category_id, safeDefaultTable]
            )
          );
        }

        if (safeConfigTable) {
          registryInserts.push(
            db.query(
              `INSERT INTO category_table_registry (category_id, table_type, table_name)
               VALUES ($1, 'config', $2)
               ON CONFLICT (category_id, table_type) DO UPDATE
               SET table_name = EXCLUDED.table_name, updated_at = NOW()`,
              [newCategory.category_id, safeConfigTable]
            )
          );
        }

        if (safeLogTable) {
          registryInserts.push(
            db.query(
              `INSERT INTO category_table_registry (category_id, table_type, table_name)
               VALUES ($1, 'log', $2)
               ON CONFLICT (category_id, table_type) DO UPDATE
               SET table_name = EXCLUDED.table_name, updated_at = NOW()`,
              [newCategory.category_id, safeLogTable]
            )
          );
        }

        if (registryInserts.length) {
          await Promise.all(registryInserts);
        }
      }

      if (auto_generate_crud_api && crudGenerator) {
        try {
          await crudGenerator.scanAndGenerateAPIs();
          console.log(`✅ Auto-generated CRUD API for category: ${resolvedSlug}`);
        } catch (genError) {
          console.error('Error auto-generating CRUD API:', genError);
        }
      }

      res.status(201).json({
        success: true,
        data: mapCategoryRow(newCategory),
        message: `Category "${resolvedDisplayName}" created successfully${auto_generate_crud_api ? ' with auto-generated CRUD API' : ''}`
      });
    } catch (error) {
      console.error('Error creating category:', error);

      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Category with this slug already exists'
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
      const existing = await findCategoryByIdentifier(db, id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      const {
        slug,
        display_name,
        description,
        status,
        default_table,
        config_table,
        log_table,
        auto_generate_crud_api,
        schema_definition,
        category_type,
        api_config,
        icon,
        color,
        sort_order,
        metadata,
        parent_category_id,
        updated_by = 'system'
      } = req.body;

      const updates = [];
      const params = [];
      let paramIndex = 1;

      let safeDefaultTableUpdate;
      let safeConfigTableUpdate;
      let safeLogTableUpdate;

      if (slug !== undefined) {
        const nextSlug = normalizeSlug(slug);
        if (!nextSlug) {
          return res.status(400).json({
            success: false,
            error: 'Invalid slug provided'
          });
        }
        updates.push(`slug = $${paramIndex++}`);
        params.push(nextSlug);
      }

      if (display_name !== undefined) {
        updates.push(`display_name = $${paramIndex++}`);
        params.push(display_name);
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        params.push(description);
      }

      if (status !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        params.push(status === 'active');
      }

      if (default_table !== undefined) {
        safeDefaultTableUpdate = null;
        if (default_table) {
          safeDefaultTableUpdate = sanitizeIdentifier(default_table);
          if (safeDefaultTableUpdate !== default_table) {
            return res.status(400).json({
              success: false,
              error: 'default_table must use only letters, numbers, or underscores'
            });
          }
        }
        updates.push(`default_table = $${paramIndex++}`);
        params.push(safeDefaultTableUpdate ?? null);
      }

      if (config_table !== undefined) {
        safeConfigTableUpdate = null;
        if (config_table) {
          safeConfigTableUpdate = sanitizeIdentifier(config_table);
          if (safeConfigTableUpdate !== config_table) {
            return res.status(400).json({
              success: false,
              error: 'config_table must use only letters, numbers, or underscores'
            });
          }
        }
        updates.push(`config_table = $${paramIndex++}`);
        params.push(safeConfigTableUpdate ?? null);
      }

      if (log_table !== undefined) {
        safeLogTableUpdate = null;
        if (log_table === null) {
          safeLogTableUpdate = null;
        } else if (log_table) {
          safeLogTableUpdate = sanitizeIdentifier(log_table);
          if (safeLogTableUpdate !== log_table) {
            return res.status(400).json({
              success: false,
              error: 'log_table must use only letters, numbers, or underscores'
            });
          }
        }
        updates.push(`log_table = $${paramIndex++}`);
        params.push(safeLogTableUpdate ?? null);
      }

      if (auto_generate_crud_api !== undefined) {
        updates.push(`auto_generate_crud = $${paramIndex++}`);
        params.push(auto_generate_crud_api);
      }

      if (schema_definition !== undefined) {
        const schemaValidation = validateSchemaDefinition(schema_definition, {
          categoryId: existing.category_id,
        });

        if (!schemaValidation.valid) {
          return res.status(422).json({
            success: false,
            error: 'Invalid schema_definition supplied',
            details: schemaValidation.details,
          });
        }

        updates.push(`schema_definition = $${paramIndex++}::jsonb`);
        params.push(JSON.stringify(schema_definition));
      }

      const metadataBase = existing.metadata || {};
      const metadataUpdates = { ...metadataBase };
      let metadataChanged = false;

      if (metadata && typeof metadata === 'object') {
        Object.assign(metadataUpdates, metadata);
        metadataChanged = true;
      }

      const assignMetadata = (key, value) => {
        if (value === undefined) {
          return;
        }
        metadataUpdates[key] = value;
        metadataChanged = true;
      };

      assignMetadata('updated_by', updated_by);
      assignMetadata('category_type', category_type);
      assignMetadata('api_config', api_config);
      assignMetadata('icon', icon);
      assignMetadata('color', color);
      assignMetadata('sort_order', sort_order);
      assignMetadata('parent_category_id', parent_category_id);

      if (metadataChanged) {
        updates.push(`metadata = $${paramIndex++}::jsonb`);
        params.push(JSON.stringify(metadataUpdates));
      }

      if (!updates.length) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updates.push('updated_at = NOW()');

      const query = `
        UPDATE categories
        SET ${updates.join(', ')}
        WHERE category_id = $${paramIndex}
        RETURNING *
      `;

      params.push(existing.category_id);

      const result = await db.query(query, params);

      const updated = result.rows[0];

      const registryUpdates = [];

      if (default_table !== undefined) {
        if (safeDefaultTableUpdate) {
          registryUpdates.push(
            db.query(
              `INSERT INTO category_table_registry (category_id, table_type, table_name)
               VALUES ($1, 'data', $2)
               ON CONFLICT (category_id, table_type) DO UPDATE
               SET table_name = EXCLUDED.table_name, updated_at = NOW()`,
              [updated.category_id, safeDefaultTableUpdate]
            )
          );
        } else {
          registryUpdates.push(
            db.query(
              `DELETE FROM category_table_registry WHERE category_id = $1 AND table_type = 'data'`,
              [updated.category_id]
            )
          );
        }
      }

      if (config_table !== undefined) {
        if (safeConfigTableUpdate) {
          registryUpdates.push(
            db.query(
              `INSERT INTO category_table_registry (category_id, table_type, table_name)
               VALUES ($1, 'config', $2)
               ON CONFLICT (category_id, table_type) DO UPDATE
               SET table_name = EXCLUDED.table_name, updated_at = NOW()`,
              [updated.category_id, safeConfigTableUpdate]
            )
          );
        } else {
          registryUpdates.push(
            db.query(
              `DELETE FROM category_table_registry WHERE category_id = $1 AND table_type = 'config'`,
              [updated.category_id]
            )
          );
        }
      }

      if (log_table !== undefined) {
        if (safeLogTableUpdate) {
          registryUpdates.push(
            db.query(
              `INSERT INTO category_table_registry (category_id, table_type, table_name)
               VALUES ($1, 'log', $2)
               ON CONFLICT (category_id, table_type) DO UPDATE
               SET table_name = EXCLUDED.table_name, updated_at = NOW()`,
              [updated.category_id, safeLogTableUpdate]
            )
          );
        } else {
          registryUpdates.push(
            db.query(
              `DELETE FROM category_table_registry WHERE category_id = $1 AND table_type = 'log'`,
              [updated.category_id]
            )
          );
        }
      }

      if (registryUpdates.length) {
        await Promise.all(registryUpdates);
      }

      if (crudGenerator && (auto_generate_crud_api !== undefined || schema_definition !== undefined)) {
        try {
          await crudGenerator.scanAndGenerateAPIs();
          console.log(`✅ Regenerated CRUD API for category: ${updated.slug}`);
        } catch (genError) {
          console.error('Error regenerating CRUD API:', genError);
        }
      }

      res.json({
        success: true,
        data: mapCategoryRow(updated),
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

      const existing = await findCategoryByIdentifier(db, id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      const result = await db.query(
        'DELETE FROM categories WHERE category_id = $1::uuid RETURNING *',
        [existing.category_id]
      );

      res.json({
        success: true,
        message: 'Category deleted successfully',
        data: mapCategoryRow(result.rows[0])
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
      const { rows: categories } = await db.query(`
        SELECT category_id, slug, display_name, default_table, config_table, log_table,
               auto_generate_crud, is_active, metadata
        FROM categories
        ORDER BY display_name
      `);

      const statistics = [];

      for (const category of categories) {
        const statEntry = {
          category_id: category.category_id,
          slug: category.slug,
          display_name: category.display_name,
          auto_generate_crud: category.auto_generate_crud,
          is_active: category.is_active,
          metadata: category.metadata || {},
          total_items: null,
          total_configs: null,
          total_logs: null
        };

        if (category.default_table) {
          const safeTable = sanitizeIdentifier(category.default_table);
          if (safeTable && safeTable === category.default_table) {
            try {
              const total = await countTableRows(db, safeTable);
              if (total !== null) {
                statEntry.total_items = total;
              }
            } catch (countError) {
              console.warn(`Unable to count rows for table ${safeTable}:`, countError.message);
            }
          }
        }

        if (category.config_table) {
          const safeConfig = sanitizeIdentifier(category.config_table);
          if (safeConfig && safeConfig === category.config_table) {
            try {
              const total = await countTableRows(db, safeConfig);
              if (total !== null) {
                statEntry.total_configs = total;
              }
            } catch (countError) {
              console.warn(`Unable to count rows for table ${safeConfig}:`, countError.message);
            }
          }
        }

        if (category.log_table) {
          const safeLog = sanitizeIdentifier(category.log_table);
          if (safeLog && safeLog === category.log_table) {
            try {
              const total = await countTableRows(db, safeLog);
              if (total !== null) {
                statEntry.total_logs = total;
              }
            } catch (countError) {
              console.warn(`Unable to count rows for table ${safeLog}:`, countError.message);
            }
          }
        }

        statistics.push(statEntry);
      }

      res.json({
        success: true,
        data: statistics
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
      const result = await db.query(`
        SELECT c.slug, c.display_name, r.table_type, r.table_name
        FROM categories c
        LEFT JOIN category_table_registry r ON c.category_id = r.category_id
        ORDER BY c.display_name, r.table_type
      `);

      const configMap = new Map();

      for (const row of result.rows) {
        if (!configMap.has(row.slug)) {
          configMap.set(row.slug, {
            slug: row.slug,
            display_name: row.display_name,
            tables: {}
          });
        }

        if (row.table_type && row.table_name) {
          const entry = configMap.get(row.slug);
          entry.tables[row.table_type] = row.table_name;
        }
      }

      res.json({
        success: true,
        data: Array.from(configMap.values())
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
