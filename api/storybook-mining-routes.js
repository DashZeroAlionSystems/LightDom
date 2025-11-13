/**
 * Storybook Mining API Routes
 * Provides REST endpoints for mining components and generating Storybook stories
 */

import express from 'express';
import { StorybookMiningService } from '../services/storybook-mining-service.js';

export function createStorybookMiningRoutes(config = {}) {
  const router = express.Router();
  const miningService = new StorybookMiningService(config);
  
  // Initialize on first request
  let initialized = false;
  async function ensureInitialized() {
    if (!initialized) {
      await miningService.initialize();
      initialized = true;
    }
  }

  // Get service status
  router.get('/status', async (req, res) => {
    try {
      await ensureInitialized();
      const status = await miningService.getStatus();
      res.json({ success: true, status });
    } catch (error) {
      console.error('Failed to get mining service status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mine a single website
  router.post('/mine', async (req, res) => {
    try {
      await ensureInitialized();
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
      }
      
      const components = await miningService.mineWebsite(url);
      res.json({ success: true, components, count: components.length });
    } catch (error) {
      console.error('Failed to mine website:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mine multiple design sites
  router.post('/mine/batch', async (req, res) => {
    try {
      await ensureInitialized();
      const { sites } = req.body;
      
      if (!Array.isArray(sites)) {
        return res.status(400).json({ success: false, error: 'Sites array is required' });
      }
      
      const results = await miningService.mineDesignSites(sites);
      res.json({ success: true, results });
    } catch (error) {
      console.error('Failed to mine sites:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mine default design sites (TensorFlow, Kaggle, Material Design, etc.)
  router.post('/mine/defaults', async (req, res) => {
    try {
      await ensureInitialized();
      const results = await miningService.mineDesignSites();
      res.json({ success: true, results });
    } catch (error) {
      console.error('Failed to mine default sites:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Generate Storybook story for a component
  router.post('/stories/generate/:componentId', async (req, res) => {
    try {
      await ensureInitialized();
      const filePath = await miningService.generateStorybookStory(req.params.componentId);
      res.json({ success: true, filePath });
    } catch (error) {
      console.error('Failed to generate story:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // List mined components
  router.get('/components', async (req, res) => {
    try {
      await ensureInitialized();
      const { limit = 100, offset = 0, componentType } = req.query;
      
      let query = 'SELECT * FROM mined_components';
      const params = [];
      
      if (componentType) {
        query += ' WHERE component_type = $1';
        params.push(componentType);
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), parseInt(offset));
      
      const result = await miningService.db.query(query, params);
      res.json({ success: true, components: result.rows });
    } catch (error) {
      console.error('Failed to list components:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get component attributes (data streams)
  router.get('/components/:id/attributes', async (req, res) => {
    try {
      await ensureInitialized();
      const result = await miningService.db.query(
        `SELECT * FROM component_attributes 
         WHERE component_id = $1
         ORDER BY data_stream, attribute_name`,
        [req.params.id]
      );
      res.json({ success: true, attributes: result.rows });
    } catch (error) {
      console.error('Failed to get component attributes:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get data streams
  router.get('/data-streams', async (req, res) => {
    try {
      await ensureInitialized();
      const result = await miningService.db.query(`
        SELECT 
          data_stream,
          collection,
          COUNT(*) as attribute_count,
          COUNT(DISTINCT component_id) as component_count
        FROM component_attributes
        GROUP BY data_stream, collection
        ORDER BY data_stream
      `);
      res.json({ success: true, dataStreams: result.rows });
    } catch (error) {
      console.error('Failed to get data streams:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default createStorybookMiningRoutes;
