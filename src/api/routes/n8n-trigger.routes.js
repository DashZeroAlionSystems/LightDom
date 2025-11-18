/**
 * N8N Workflow Trigger API Routes
 * 
 * Express routes for managing workflow triggers
 */

import express from 'express';
import N8NWorkflowTriggerService from '../services/n8n-workflow-trigger-service.js';

const router = express.Router();

// Initialize trigger service
const triggerService = new N8NWorkflowTriggerService();

/**
 * GET /api/n8n/triggers
 * List triggers
 */
router.get('/triggers', (req, res) => {
  try {
    const filters = {
      campaignId: req.query.campaignId,
      enabled: req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined,
      eventType: req.query.eventType
    };

    const triggers = triggerService.listTriggers(filters);

    res.json({
      success: true,
      count: triggers.length,
      triggers
    });
  } catch (error) {
    console.error('Failed to list triggers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/triggers/:id
 * Get specific trigger
 */
router.get('/triggers/:id', (req, res) => {
  try {
    const trigger = triggerService.getTrigger(req.params.id);

    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    res.json({
      success: true,
      trigger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/triggers
 * Create trigger
 */
router.post('/triggers', async (req, res) => {
  try {
    const trigger = await triggerService.createTrigger(req.body);

    res.json({
      success: true,
      trigger
    });
  } catch (error) {
    console.error('Failed to create trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/n8n/triggers/:id
 * Update trigger
 */
router.patch('/triggers/:id', async (req, res) => {
  try {
    const trigger = triggerService.getTrigger(req.params.id);

    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    // Update enabled status
    if (req.body.enabled !== undefined) {
      if (req.body.enabled) {
        await triggerService.enableTrigger(req.params.id);
      } else {
        triggerService.disableTrigger(req.params.id);
      }
    }

    // Update other fields
    if (req.body.condition !== undefined) {
      trigger.condition = req.body.condition;
    }
    if (req.body.description !== undefined) {
      trigger.description = req.body.description;
    }

    res.json({
      success: true,
      trigger
    });
  } catch (error) {
    console.error('Failed to update trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/n8n/triggers/:id
 * Delete trigger
 */
router.delete('/triggers/:id', async (req, res) => {
  try {
    const result = await triggerService.deleteTrigger(req.params.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Failed to delete trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/trigger-templates
 * Get available templates
 */
router.get('/trigger-templates', (req, res) => {
  try {
    const templates = triggerService.getTemplates();

    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/triggers/stats
 * Get trigger statistics
 */
router.get('/triggers/stats', (req, res) => {
  try {
    const stats = triggerService.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/triggers/executions
 * Get execution history
 */
router.get('/triggers/executions', (req, res) => {
  try {
    const filters = {
      triggerId: req.query.triggerId,
      success: req.query.success !== undefined ? req.query.success === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const history = triggerService.getExecutionHistory(filters);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/triggers/emit-event
 * Emit a campaign event (for testing)
 */
router.post('/triggers/emit-event', (req, res) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }

    triggerService.emitCampaignEvent(eventType, data || {});

    res.json({
      success: true,
      message: 'Event emitted',
      eventType,
      data
    });
  } catch (error) {
    console.error('Failed to emit event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export both router and trigger service for use in campaign orchestrator
export { triggerService };
export default router;
