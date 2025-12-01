/**
 * Scraper Manager API Routes
 * Provides REST endpoints for managing scraper instances
 */

import express from 'express';
import { ScraperManagerService } from '../services/scraper-manager-service.js';

export function createScraperManagerRoutes(config = {}) {
  const router = express.Router();
  const scraperManager = new ScraperManagerService(config);
  
  // Initialize on first request
  let initialized = false;
  async function ensureInitialized() {
    if (!initialized) {
      await scraperManager.initialize();
      initialized = true;
    }
  }

  // Get service status
  router.get('/status', async (req, res) => {
    try {
      await ensureInitialized();
      const status = await scraperManager.getStatus();
      res.json({ success: true, status });
    } catch (error) {
      console.error('Failed to get scraper manager status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // List all instances
  router.get('/instances', async (req, res) => {
    try {
      await ensureInitialized();
      const instances = await scraperManager.listInstances();
      res.json({ success: true, instances });
    } catch (error) {
      console.error('Failed to list instances:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get specific instance
  router.get('/instances/:id', async (req, res) => {
    try {
      await ensureInitialized();
      const instance = await scraperManager.getInstance(req.params.id);
      res.json({ success: true, instance });
    } catch (error) {
      console.error('Failed to get instance:', error);
      res.status(404).json({ success: false, error: error.message });
    }
  });

  // Create new instance
  router.post('/instances', async (req, res) => {
    try {
      await ensureInitialized();
      const { name, config } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' });
      }
      
      const instance = await scraperManager.createInstance(name, config);
      res.json({ success: true, instance });
    } catch (error) {
      console.error('Failed to create instance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Start instance
  router.post('/instances/:id/start', async (req, res) => {
    try {
      await ensureInitialized();
      const instance = await scraperManager.startInstance(req.params.id);
      res.json({ success: true, instance });
    } catch (error) {
      console.error('Failed to start instance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Stop instance
  router.post('/instances/:id/stop', async (req, res) => {
    try {
      await ensureInitialized();
      const instance = await scraperManager.stopInstance(req.params.id);
      res.json({ success: true, instance });
    } catch (error) {
      console.error('Failed to stop instance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete instance
  router.delete('/instances/:id', async (req, res) => {
    try {
      await ensureInitialized();
      await scraperManager.deleteInstance(req.params.id);
      res.json({ success: true, message: 'Instance deleted' });
    } catch (error) {
      console.error('Failed to delete instance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get instance seeds
  router.get('/instances/:id/seeds', async (req, res) => {
    try {
      await ensureInitialized();
      const { status } = req.query;
      const seeds = await scraperManager.getInstanceSeeds(req.params.id, status);
      res.json({ success: true, seeds });
    } catch (error) {
      console.error('Failed to get instance seeds:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Add URL seed to instance
  router.post('/instances/:id/seeds', async (req, res) => {
    try {
      await ensureInitialized();
      const { url, priority, tags, metadata } = req.body;
      
      if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
      }
      
      const seed = await scraperManager.addUrlSeed(req.params.id, url, {
        priority,
        tags,
        metadata,
      });
      
      res.json({ success: true, seed });
    } catch (error) {
      console.error('Failed to add URL seed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Add multiple URL seeds to instance
  router.post('/instances/:id/seeds/bulk', async (req, res) => {
    try {
      await ensureInitialized();
      const { urls } = req.body;
      
      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ success: false, error: 'URLs array is required' });
      }
      
      const seeds = await scraperManager.addUrlSeeds(req.params.id, urls);
      res.json({ success: true, seeds, count: seeds.length });
    } catch (error) {
      console.error('Failed to add URL seeds:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get instance statistics
  router.get('/instances/:id/stats', async (req, res) => {
    try {
      await ensureInitialized();
      const stats = await scraperManager.getInstanceStats(req.params.id);
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Failed to get instance stats:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default createScraperManagerRoutes;
