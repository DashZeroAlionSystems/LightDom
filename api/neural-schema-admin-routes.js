/**
 * Neural Schema Admin API Routes
 * 
 * Exposes the neural schema admin orchestrator via REST API
 */

import { Router } from 'express';
import NeuralSchemaAdminOrchestrator from '../services/neural-schema-admin-orchestrator.js';

export function createNeuralSchemaAdminRoutes(dbPool) {
  const router = Router();
  
  // Initialize the orchestrator
  const orchestrator = new NeuralSchemaAdminOrchestrator(dbPool, {
    enableAutoCrud: true,
    enableNeuralStyleGuide: true,
    enableStorybookGeneration: true
  });

  // Initialize on module load
  let initPromise = orchestrator.initialize().catch(error => {
    console.error('Failed to initialize Neural Schema Admin Orchestrator:', error);
  });

  /**
   * GET /api/neural-admin/status
   * Get orchestrator status
   */
  router.get('/status', async (req, res) => {
    try {
      await initPromise;
      const status = orchestrator.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/models
   * Get all registered neural models
   */
  router.get('/models', async (req, res) => {
    try {
      await initPromise;
      const models = orchestrator.getModelRegistry();
      res.json({
        total: models.length,
        models: models
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-admin/modules/generate
   * Generate admin module from database table
   */
  router.post('/modules/generate', async (req, res) => {
    try {
      await initPromise;
      
      const { tableName, options } = req.body;
      
      if (!tableName) {
        return res.status(400).json({ error: 'tableName is required' });
      }

      const result = await orchestrator.generateAdminModuleFromSchema(tableName, options || {});
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/modules
   * List all generated admin modules
   */
  router.get('/modules', async (req, res) => {
    try {
      await initPromise;
      
      const result = await dbPool.query(`
        SELECT 
          id, module_name, display_name, description, icon, 
          category_id, ui_config, auto_generated, created_at, status
        FROM neural_admin_modules
        WHERE status = 'active'
        ORDER BY display_name
      `);
      
      res.json({
        total: result.rows.length,
        modules: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/modules/:moduleName
   * Get specific admin module configuration
   */
  router.get('/modules/:moduleName', async (req, res) => {
    try {
      await initPromise;
      
      const { moduleName } = req.params;
      
      const result = await dbPool.query(
        'SELECT * FROM neural_admin_modules WHERE module_name = $1 AND status = $2',
        [moduleName, 'active']
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-admin/styleguide/generate
   * Generate style guide from brand guidelines
   */
  router.post('/styleguide/generate', async (req, res) => {
    try {
      await initPromise;
      
      const { brandGuidelines, options } = req.body;
      
      if (!brandGuidelines) {
        return res.status(400).json({ error: 'brandGuidelines is required' });
      }

      const result = await orchestrator.generateStyleGuideFromBrand(brandGuidelines, options || {});
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/styleguides
   * List all generated style guides
   */
  router.get('/styleguides', async (req, res) => {
    try {
      await initPromise;
      
      const result = await dbPool.query(`
        SELECT 
          id, name, source_url, neural_model_used, model_confidence,
          generated_at, status
        FROM neural_style_guides
        WHERE status = 'active'
        ORDER BY generated_at DESC
      `);
      
      res.json({
        total: result.rows.length,
        styleguides: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/styleguides/:id
   * Get specific style guide with full details
   */
  router.get('/styleguides/:id', async (req, res) => {
    try {
      await initPromise;
      
      const { id } = req.params;
      
      const result = await dbPool.query(
        'SELECT * FROM neural_style_guides WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Style guide not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/neural-admin/components/generate
   * Generate components from style guide
   */
  router.post('/components/generate', async (req, res) => {
    try {
      await initPromise;
      
      const { styleGuideId, options } = req.body;
      
      if (!styleGuideId) {
        return res.status(400).json({ error: 'styleGuideId is required' });
      }

      const result = await orchestrator.generateComponentsFromStyleGuide(styleGuideId, options || {});
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/components
   * List all generated components
   */
  router.get('/components', async (req, res) => {
    try {
      await initPromise;
      
      const { styleGuideId } = req.query;
      
      let query = `
        SELECT 
          c.id, c.component_name, c.component_type, c.neural_model_used,
          c.model_confidence, c.alignment_score, c.generated_at, c.status,
          s.name as style_guide_name
        FROM neural_generated_components c
        LEFT JOIN neural_style_guides s ON c.style_guide_id = s.id
        WHERE c.status = 'active'
      `;
      
      const params = [];
      
      if (styleGuideId) {
        query += ' AND c.style_guide_id = $1';
        params.push(styleGuideId);
      }
      
      query += ' ORDER BY c.generated_at DESC';
      
      const result = await dbPool.query(query, params);
      
      res.json({
        total: result.rows.length,
        components: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/components/:id
   * Get specific component with full code
   */
  router.get('/components/:id', async (req, res) => {
    try {
      await initPromise;
      
      const { id } = req.params;
      
      const result = await dbPool.query(
        'SELECT * FROM neural_generated_components WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Component not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/database/tables
   * List all database tables for admin module generation
   */
  router.get('/database/tables', async (req, res) => {
    try {
      await initPromise;
      
      const result = await dbPool.query(`
        SELECT 
          table_name,
          (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      res.json({
        total: result.rows.length,
        tables: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/neural-admin/database/tables/:tableName/schema
   * Get schema for specific table
   */
  router.get('/database/tables/:tableName/schema', async (req, res) => {
    try {
      await initPromise;
      
      const { tableName } = req.params;
      
      const schema = await orchestrator.getTableSchema(tableName);
      
      res.json(schema);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createNeuralSchemaAdminRoutes;
