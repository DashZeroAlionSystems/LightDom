/**
 * Lead Generation API Routes
 * REST API for managing leads captured from campaigns
 */

import express from 'express';
import LeadGenerationService from '../services/lead-generation-service.js';

/**
 * Create lead generation routes
 * @param {Object} db - Database pool
 * @param {Object} io - Socket.io instance (optional)
 * @returns {express.Router} Express router
 */
export function createLeadRoutes(db, io = null) {
  const router = express.Router();
  const leadService = new LeadGenerationService(db, io);

  /**
   * GET /api/leads
   * Get all leads with filtering and pagination
   */
  router.get('/', async (req, res) => {
    try {
      const {
        status,
        quality,
        sourceType,
        sourceId,
        assignedTo,
        minScore,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await leadService.getLeads({
        status,
        quality,
        sourceType,
        sourceId,
        assignedTo,
        minScore: minScore ? parseInt(minScore) : undefined,
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        sortBy,
        sortOrder,
      });

      res.json(result);
    } catch (error) {
      console.error('Error getting leads:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/leads/statistics
   * Get lead statistics
   */
  router.get('/statistics', async (req, res) => {
    try {
      const stats = await leadService.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting lead statistics:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/leads/source-performance
   * Get source performance metrics
   */
  router.get('/source-performance', async (req, res) => {
    try {
      const performance = await leadService.getSourcePerformance();
      res.json(performance);
    } catch (error) {
      console.error('Error getting source performance:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/leads/:id
   * Get a specific lead by ID with activities
   */
  router.get('/:id', async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await leadService.getLead(leadId);
      res.json(lead);
    } catch (error) {
      console.error('Error getting lead:', error);
      res.status(error.message === 'Lead not found' ? 404 : 500).json({ error: error.message });
    }
  });

  /**
   * POST /api/leads
   * Create a new lead
   */
  router.post('/', async (req, res) => {
    try {
      const leadData = req.body;

      // Validate required fields
      if (!leadData.email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const lead = await leadService.captureLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/leads/bulk-import
   * Bulk import leads from CSV data
   */
  router.post('/bulk-import', async (req, res) => {
    try {
      const { leads, sourceType, sourceId } = req.body;

      if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ error: 'Leads array is required' });
      }

      const result = await leadService.bulkImport(leads, sourceType, sourceId);
      res.json(result);
    } catch (error) {
      console.error('Error bulk importing leads:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/leads/capture-from-crawler
   * Capture leads from crawler campaign results
   */
  router.post('/capture-from-crawler', async (req, res) => {
    try {
      const { campaignId, results } = req.body;

      if (!campaignId || !Array.isArray(results)) {
        return res.status(400).json({ error: 'Campaign ID and results array are required' });
      }

      const leads = await leadService.captureLeadsFromCrawler(campaignId, results);
      res.json({
        success: true,
        captured: leads.length,
        leads,
      });
    } catch (error) {
      console.error('Error capturing leads from crawler:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PATCH /api/leads/:id
   * Update a lead
   */
  router.patch('/:id', async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const updates = req.body;

      const lead = await leadService.updateLead(leadId, updates);
      res.json(lead);
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PATCH /api/leads/:id/status
   * Update lead status
   */
  router.patch('/:id/status', async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const lead = await leadService.updateStatus(leadId, status);
      res.json(lead);
    } catch (error) {
      console.error('Error updating lead status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/leads/:id/assign
   * Assign lead to a user
   */
  router.post('/:id/assign', async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const lead = await leadService.assignLead(leadId, userId);
      res.json(lead);
    } catch (error) {
      console.error('Error assigning lead:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/leads/:id/tags
   * Add tags to a lead
   */
  router.post('/:id/tags', async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { tags } = req.body;

      if (!Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ error: 'Tags array is required' });
      }

      await leadService.addTags(leadId, tags);
      res.json({ success: true, message: 'Tags added successfully' });
    } catch (error) {
      console.error('Error adding tags:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/leads/:id/activity
   * Log an activity for a lead
   */
  router.post('/:id/activity', async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { activityType, description, data } = req.body;

      if (!activityType) {
        return res.status(400).json({ error: 'Activity type is required' });
      }

      const activity = await leadService.logActivity(leadId, activityType, description, data);
      res.status(201).json(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createLeadRoutes;
