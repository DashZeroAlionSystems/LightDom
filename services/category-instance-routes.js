/**
 * Category Instance API Routes
 * RESTful API for creating and managing category instances
 */

import express from 'express';
import { CategoryInstanceFactory } from './category-instance-factory.js';

export function createCategoryInstanceRoutes(db) {
  const router = express.Router();
  const factory = new CategoryInstanceFactory(db);

  /**
   * GET /api/categories
   * List all available category types
   */
  router.get('/', (req, res) => {
    const categories = Object.keys(factory.categoryTableMap).map(key => ({
      type: key,
      table: factory.categoryTableMap[key],
      defaultConfig: factory.defaultConfigs[key],
      hierarchyRules: factory.hierarchyRules[key]
    }));

    res.json({
      success: true,
      categories,
      total: categories.length
    });
  });

  /**
   * GET /api/categories/:category/config
   * Get default configuration for a category type
   */
  router.get('/:category/config', (req, res) => {
    try {
      const { category } = req.params;
      const customization = req.query;

      const config = factory.generateConfig(category, customization);

      res.json({
        success: true,
        category,
        config
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/categories/config/all
   * Generate configs for all category types
   */
  router.get('/config/all', (req, res) => {
    const { appName } = req.query;
    const configs = factory.generateAllConfigs(appName);

    res.json({
      success: true,
      configs,
      categories: Object.keys(configs)
    });
  });

  /**
   * POST /api/categories/:category
   * Create a new instance of a category
   */
  router.post('/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const instanceData = req.body;
      const options = {
        validateHierarchy: req.query.validateHierarchy !== 'false',
        createRelationships: req.query.createRelationships !== 'false'
      };

      const result = await factory.createInstance(category, instanceData, options);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating instance:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/categories/batch
   * Create multiple instances at once
   */
  router.post('/batch', async (req, res) => {
    try {
      const { instances } = req.body;
      const options = {
        validateHierarchy: req.query.validateHierarchy !== 'false',
        createRelationships: req.query.createRelationships !== 'false'
      };

      if (!Array.isArray(instances)) {
        throw new Error('instances must be an array');
      }

      const result = await factory.createInstances(instances, options);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating instances:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/categories/hierarchy
   * Create a complete hierarchy from config
   */
  router.post('/hierarchy', async (req, res) => {
    try {
      const config = req.body;

      const result = await factory.createHierarchyFromConfig(config);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating hierarchy:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/categories/:category
   * List instances of a category type
   */
  router.get('/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const filters = req.query;

      const instances = await factory.listInstances(category, filters);

      res.json({
        success: true,
        category,
        instances,
        total: instances.length
      });
    } catch (error) {
      console.error('Error listing instances:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/categories/:category/:id
   * Get a specific instance by ID
   */
  router.get('/:category/:id', async (req, res) => {
    try {
      const { category, id } = req.params;

      const instance = await factory.getInstance(category, id);

      if (!instance) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      res.json({
        success: true,
        category,
        instance
      });
    } catch (error) {
      console.error('Error getting instance:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/categories/:category/:id/hierarchy
   * Get hierarchy (parents and children) for an instance
   */
  router.get('/:category/:id/hierarchy', async (req, res) => {
    try {
      const { category, id } = req.params;

      const hierarchy = await factory.getHierarchy(category, id);

      res.json({
        success: true,
        hierarchy
      });
    } catch (error) {
      console.error('Error getting hierarchy:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/categories/:category/:id/execute
   * Execute an action on an instance (start, stop, run, etc.)
   */
  router.post('/:category/:id/execute', async (req, res) => {
    try {
      const { category, id } = req.params;
      const { action, params } = req.body;

      // Get the instance
      const instance = await factory.getInstance(category, id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      // Execute based on category and action
      let result;
      const tableName = factory.categoryTableMap[category];

      switch (action) {
        case 'start':
          result = await db.query(
            `UPDATE ${tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            ['running', id]
          );
          break;

        case 'stop':
          result = await db.query(
            `UPDATE ${tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            ['stopped', id]
          );
          break;

        case 'pause':
          result = await db.query(
            `UPDATE ${tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            ['paused', id]
          );
          break;

        case 'resume':
          result = await db.query(
            `UPDATE ${tableName} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            ['running', id]
          );
          break;

        case 'execute':
        case 'run':
          // For workflows, crawlers, data_mining
          result = await db.query(
            `UPDATE ${tableName} 
             SET status = $1, last_run_at = NOW(), total_runs = COALESCE(total_runs, 0) + 1, updated_at = NOW() 
             WHERE id = $2 RETURNING *`,
            ['running', id]
          );
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Log the execution
      await factory.logExecution(category, id, action, 'completed', {
        input: { action, params },
        output: result.rows[0]
      });

      res.json({
        success: true,
        category,
        instance: result.rows[0],
        action,
        message: `${action} executed successfully`
      });
    } catch (error) {
      console.error('Error executing action:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/categories/:category/:id
   * Update an instance
   */
  router.put('/:category/:id', async (req, res) => {
    try {
      const { category, id } = req.params;
      const updates = req.body;
      const tableName = factory.categoryTableMap[category];

      if (!tableName) {
        throw new Error(`Invalid category: ${category}`);
      }

      // Build update query
      const fields = Object.keys(updates).filter(key => !key.startsWith('_'));
      const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
      const values = fields.map(key => {
        const value = updates[key];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      });

      const query = `
        UPDATE ${tableName}
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [id, ...values]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      res.json({
        success: true,
        category,
        instance: result.rows[0],
        message: 'Instance updated successfully'
      });
    } catch (error) {
      console.error('Error updating instance:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/categories/:category/:id
   * Delete an instance
   */
  router.delete('/:category/:id', async (req, res) => {
    try {
      const { category, id } = req.params;
      const tableName = factory.categoryTableMap[category];

      if (!tableName) {
        throw new Error(`Invalid category: ${category}`);
      }

      const result = await db.query(
        `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      res.json({
        success: true,
        category,
        instance: result.rows[0],
        message: 'Instance deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting instance:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/categories/:category/:id/api/:functionName
   * Call an API function on a service instance
   */
  router.post('/:category/:id/api/:functionName', async (req, res) => {
    try {
      const { category, id, functionName } = req.params;
      const params = req.body;

      if (category !== 'service') {
        throw new Error('API functions only available on service instances');
      }

      const instance = await factory.getInstance(category, id);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: 'Service instance not found'
        });
      }

      // Find the function in api_functions
      const apiFunction = instance.api_functions?.find(f => f.name === functionName);
      if (!apiFunction) {
        return res.status(404).json({
          success: false,
          error: `Function ${functionName} not found on service instance`
        });
      }

      // Log the function call
      await factory.logExecution(category, id, `api:${functionName}`, 'completed', {
        input: params,
        output: { called: true }
      });

      // In a real implementation, this would route to the actual service
      // For now, return a success response
      res.json({
        success: true,
        service: instance.name,
        function: functionName,
        params,
        message: `Function ${functionName} called successfully`,
        note: 'This is a mock response. In production, this would call the actual service.'
      });
    } catch (error) {
      console.error('Error calling API function:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createCategoryInstanceRoutes;
