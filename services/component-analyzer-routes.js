#!/usr/bin/env node

/**
 * Component Analyzer API Routes
 * Provides REST API for screenshot capture, component analysis, and schema generation
 */

import express from 'express';
import ComponentAnalyzerService from './component-analyzer-service.js';

const router = express.Router();
let analyzerService = null;

// Initialize service
const initializeService = async () => {
  if (!analyzerService) {
    analyzerService = new ComponentAnalyzerService();
    await analyzerService.initialize();
  }
  return analyzerService;
};

/**
 * POST /api/component-analyzer/analyze
 * Analyze a URL and extract components
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url, options = {} } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const service = await initializeService();
    const result = await service.analyzeUrl(url, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/analyses
 * Get all analyses
 */
router.get('/analyses', async (req, res) => {
  try {
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      const { rows } = await client.query(`
        SELECT * FROM recent_component_analyses
        ORDER BY captured_at DESC
        LIMIT 50
      `);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/analyses/:analysisId
 * Get specific analysis details
 */
router.get('/analyses/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      // Get analysis
      const analysisResult = await client.query(
        'SELECT * FROM component_analyses WHERE analysis_id = $1',
        [analysisId]
      );
      
      if (analysisResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found'
        });
      }
      
      // Get components
      const componentsResult = await client.query(
        'SELECT * FROM atom_components WHERE analysis_id = $1',
        [analysisId]
      );
      
      res.json({
        success: true,
        data: {
          analysis: analysisResult.rows[0],
          components: componentsResult.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/components
 * Get all atom components with filters
 */
router.get('/components', async (req, res) => {
  try {
    const { 
      type, 
      classification, 
      family, 
      minReuseScore, 
      maxComplexityScore,
      limit = 100 
    } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM atom_components WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (type) {
        query += ` AND component_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }
      
      if (classification) {
        query += ` AND classification = $${paramIndex}`;
        params.push(classification);
        paramIndex++;
      }
      
      if (family) {
        query += ` AND component_family = $${paramIndex}`;
        params.push(family);
        paramIndex++;
      }
      
      if (minReuseScore) {
        query += ` AND reuse_score >= $${paramIndex}`;
        params.push(parseInt(minReuseScore));
        paramIndex++;
      }
      
      if (maxComplexityScore) {
        query += ` AND complexity_score <= $${paramIndex}`;
        params.push(parseInt(maxComplexityScore));
        paramIndex++;
      }
      
      query += ` ORDER BY reuse_score DESC, complexity_score ASC LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/components/statistics
 * Get component statistics
 */
router.get('/components/statistics', async (req, res) => {
  try {
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      const { rows } = await client.query('SELECT * FROM component_statistics ORDER BY count DESC');
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/dashboards
 * Get all dashboard schemas
 */
router.get('/dashboards', async (req, res) => {
  try {
    const { type, active } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM dashboard_schemas WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (type) {
        query += ` AND dashboard_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }
      
      if (active !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(active === 'true');
        paramIndex++;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/component-analyzer/dashboards
 * Create a new dashboard schema
 */
router.post('/dashboards', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      analysisId, 
      dashboardType, 
      layoutType, 
      components, 
      schemaLinks 
    } = req.body;
    
    if (!name || !analysisId) {
      return res.status(400).json({
        success: false,
        error: 'Name and analysisId are required'
      });
    }
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      const schemaId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const query = `
        INSERT INTO dashboard_schemas (
          schema_id, name, description, analysis_id, 
          dashboard_type, layout_type, components, schema_links
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const { rows } = await client.query(query, [
        schemaId,
        name,
        description || null,
        analysisId,
        dashboardType || 'custom',
        layoutType || 'grid',
        JSON.stringify(components || []),
        JSON.stringify(schemaLinks || [])
      ]);
      
      res.json({
        success: true,
        data: rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/seo/components
 * Get SEO components
 */
router.get('/seo/components', async (req, res) => {
  try {
    const { category, impact, status } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM seo_components WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (category) {
        query += ` AND seo_category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (impact) {
        query += ` AND impact_level = $${paramIndex}`;
        params.push(impact);
        paramIndex++;
      }
      
      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      query += ' ORDER BY importance_score DESC';
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching SEO components:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/seo/research
 * Get SEO research data
 */
router.get('/seo/research', async (req, res) => {
  try {
    const { category, impact } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM seo_research_data WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (impact) {
        query += ` AND impact_level = $${paramIndex}`;
        params.push(impact);
        paramIndex++;
      }
      
      query += ' ORDER BY impact_level DESC, last_updated DESC';
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching SEO research:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/seo/mappings
 * Get component SEO mappings
 */
router.get('/seo/mappings', async (req, res) => {
  try {
    const { componentType, seoFeature } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM component_seo_mappings WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (componentType) {
        query += ` AND component_type = $${paramIndex}`;
        params.push(componentType);
        paramIndex++;
      }
      
      if (seoFeature) {
        query += ` AND seo_feature = $${paramIndex}`;
        params.push(seoFeature);
        paramIndex++;
      }
      
      query += ' ORDER BY priority DESC';
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching SEO mappings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/library
 * Get component library
 */
router.get('/library', async (req, res) => {
  try {
    const { type, framework, category, publicOnly = 'true' } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM component_library WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (publicOnly === 'true') {
        query += ` AND is_public = true`;
      }
      
      if (type) {
        query += ` AND component_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }
      
      if (framework) {
        query += ` AND framework = $${paramIndex}`;
        params.push(framework);
        paramIndex++;
      }
      
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      query += ' ORDER BY reuse_count DESC, average_rating DESC LIMIT 100';
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/component-analyzer/visualizations
 * Create a visualization (knowledge graph, mermaid, info chart)
 */
router.post('/visualizations', async (req, res) => {
  try {
    const { 
      name, 
      visualizationType, 
      sourceType, 
      sourceId, 
      data, 
      config 
    } = req.body;
    
    if (!name || !visualizationType || !data) {
      return res.status(400).json({
        success: false,
        error: 'Name, visualizationType, and data are required'
      });
    }
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      const visualizationId = `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const query = `
        INSERT INTO schema_visualizations (
          visualization_id, name, visualization_type, 
          source_type, source_id, data, config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const { rows } = await client.query(query, [
        visualizationId,
        name,
        visualizationType,
        sourceType || null,
        sourceId || null,
        JSON.stringify(data),
        JSON.stringify(config || {})
      ]);
      
      res.json({
        success: true,
        data: rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating visualization:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/visualizations
 * Get all visualizations
 */
router.get('/visualizations', async (req, res) => {
  try {
    const { type, sourceType } = req.query;
    
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      let query = 'SELECT * FROM schema_visualizations WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (type) {
        query += ` AND visualization_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }
      
      if (sourceType) {
        query += ` AND source_type = $${paramIndex}`;
        params.push(sourceType);
        paramIndex++;
      }
      
      query += ' ORDER BY created_at DESC LIMIT 100';
      
      const { rows } = await client.query(query, params);
      
      res.json({
        success: true,
        data: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching visualizations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/component-analyzer/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const service = await initializeService();
    const client = await service.pool.connect();
    
    try {
      await client.query('SELECT 1');
      
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
  if (analyzerService) {
    await analyzerService.close();
  }
  process.exit(0);
});

export default router;
