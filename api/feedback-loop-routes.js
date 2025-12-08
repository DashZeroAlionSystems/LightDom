/**
 * Feedback Loop API Routes
 * 
 * Provides REST API endpoints for the feedback loop system
 */

import express from 'express';
import FeedbackLoopService from '../services/feedback-loop-service.js';

export function createFeedbackRouter(dbPool) {
  const router = express.Router();
  const feedbackService = new FeedbackLoopService(dbPool);

  // ====================
  // Feedback Endpoints
  // ====================

  /**
   * POST /api/feedback
   * Record user feedback on a response
   */
  router.post('/feedback', async (req, res) => {
    try {
      const {
        sessionId,
        userId,
        conversationId,
        messageId,
        feedbackType,
        feedbackStrength,
        feedbackReason,
        prompt,
        response,
        modelUsed,
        templateStyle,
        metadata
      } = req.body;

      if (!sessionId || !conversationId || !messageId || !feedbackType) {
        return res.status(400).json({
          error: 'Missing required fields: sessionId, conversationId, messageId, feedbackType'
        });
      }

      const feedback = await feedbackService.recordFeedback({
        sessionId,
        userId,
        conversationId,
        messageId,
        feedbackType,
        feedbackStrength,
        feedbackReason,
        prompt,
        response,
        modelUsed,
        templateStyle,
        metadata
      });

      res.json({
        success: true,
        feedback,
        message: 'Feedback recorded successfully'
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  /**
   * GET /api/feedback/summary
   * Get feedback summary with optional filters
   */
  router.get('/feedback/summary', async (req, res) => {
    try {
      const { modelUsed, templateStyle, feedbackType } = req.query;

      const summary = await feedbackService.getFeedbackSummary({
        modelUsed,
        templateStyle,
        feedbackType
      });

      res.json({ success: true, summary });
    } catch (error) {
      console.error('Error getting feedback summary:', error);
      res.status(500).json({ error: 'Failed to get feedback summary' });
    }
  });

  // ====================
  // Preferences Endpoints
  // ====================

  /**
   * GET /api/preferences
   * Get user preferences
   */
  router.get('/preferences', async (req, res) => {
    try {
      const { sessionId, userId, category } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const preferences = await feedbackService.getPreferences(
        sessionId,
        userId ? parseInt(userId) : null,
        category
      );

      res.json({ success: true, preferences });
    } catch (error) {
      console.error('Error getting preferences:', error);
      res.status(500).json({ error: 'Failed to get preferences' });
    }
  });

  /**
   * POST /api/preferences
   * Set or update a user preference
   */
  router.post('/preferences', async (req, res) => {
    try {
      const {
        userId,
        sessionId,
        category,
        key,
        value,
        source,
        priority,
        confidenceScore,
        expiresAt,
        metadata
      } = req.body;

      if (!sessionId || !category || !key || !value) {
        return res.status(400).json({
          error: 'Missing required fields: sessionId, category, key, value'
        });
      }

      const preference = await feedbackService.upsertPreference({
        userId,
        sessionId,
        category,
        key,
        value,
        source,
        priority,
        confidenceScore,
        expiresAt,
        metadata
      });

      res.json({
        success: true,
        preference,
        message: 'Preference saved successfully'
      });
    } catch (error) {
      console.error('Error saving preference:', error);
      res.status(500).json({ error: 'Failed to save preference' });
    }
  });

  // ====================
  // A/B Testing Endpoints
  // ====================

  /**
   * POST /api/ab-test/campaigns
   * Create a new A/B test campaign
   */
  router.post('/ab-test/campaigns', async (req, res) => {
    try {
      const {
        campaignName,
        campaignDescription,
        testType,
        variantA,
        variantB,
        variantC,
        trafficAllocation,
        minimumSampleSize,
        confidenceThreshold,
        createdBy,
        metadata
      } = req.body;

      if (!campaignName || !testType || !variantA || !variantB) {
        return res.status(400).json({
          error: 'Missing required fields: campaignName, testType, variantA, variantB'
        });
      }

      const campaign = await feedbackService.createAbTestCampaign({
        campaignName,
        campaignDescription,
        testType,
        variantA,
        variantB,
        variantC,
        trafficAllocation,
        minimumSampleSize,
        confidenceThreshold,
        createdBy,
        metadata
      });

      res.json({
        success: true,
        campaign,
        message: 'A/B test campaign created successfully'
      });
    } catch (error) {
      console.error('Error creating A/B test campaign:', error);
      res.status(500).json({ error: 'Failed to create A/B test campaign' });
    }
  });

  /**
   * POST /api/ab-test/campaigns/:id/start
   * Start an A/B test campaign
   */
  router.post('/ab-test/campaigns/:id/start', async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await feedbackService.startAbTestCampaign(parseInt(id));

      res.json({
        success: true,
        campaign,
        message: 'Campaign started successfully'
      });
    } catch (error) {
      console.error('Error starting campaign:', error);
      res.status(500).json({ error: 'Failed to start campaign' });
    }
  });

  /**
   * POST /api/ab-test/assign
   * Assign user to A/B test variant
   */
  router.post('/ab-test/assign', async (req, res) => {
    try {
      const { campaignId, sessionId, userId } = req.body;

      if (!campaignId || !sessionId) {
        return res.status(400).json({
          error: 'Missing required fields: campaignId, sessionId'
        });
      }

      const { assignment, variant } = await feedbackService.assignToAbTest(
        parseInt(campaignId),
        sessionId,
        userId ? parseInt(userId) : null
      );

      res.json({
        success: true,
        assignment,
        variant,
        message: 'Assigned to A/B test variant'
      });
    } catch (error) {
      console.error('Error assigning to A/B test:', error);
      res.status(500).json({ error: 'Failed to assign to A/B test' });
    }
  });

  /**
   * POST /api/ab-test/interaction
   * Record A/B test interaction
   */
  router.post('/ab-test/interaction', async (req, res) => {
    try {
      const { campaignId, sessionId, feedbackType } = req.body;

      if (!campaignId || !sessionId) {
        return res.status(400).json({
          error: 'Missing required fields: campaignId, sessionId'
        });
      }

      await feedbackService.recordAbTestInteraction(
        parseInt(campaignId),
        sessionId,
        feedbackType
      );

      res.json({
        success: true,
        message: 'Interaction recorded'
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
      res.status(500).json({ error: 'Failed to record interaction' });
    }
  });

  /**
   * POST /api/ab-test/questions
   * Add an A/B test question
   */
  router.post('/ab-test/questions', async (req, res) => {
    try {
      const {
        campaignId,
        questionText,
        questionType,
        options,
        showAfterInteractions,
        showProbability,
        metadata
      } = req.body;

      if (!campaignId || !questionText || !questionType) {
        return res.status(400).json({
          error: 'Missing required fields: campaignId, questionText, questionType'
        });
      }

      const question = await feedbackService.addAbTestQuestion({
        campaignId: parseInt(campaignId),
        questionText,
        questionType,
        options,
        showAfterInteractions,
        showProbability,
        metadata
      });

      res.json({
        success: true,
        question,
        message: 'Question added successfully'
      });
    } catch (error) {
      console.error('Error adding question:', error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  });

  /**
   * GET /api/ab-test/questions
   * Get A/B test questions for a user
   */
  router.get('/ab-test/questions', async (req, res) => {
    try {
      const { campaignId, sessionId } = req.query;

      if (!campaignId || !sessionId) {
        return res.status(400).json({
          error: 'Missing required parameters: campaignId, sessionId'
        });
      }

      const questions = await feedbackService.getAbTestQuestions(
        parseInt(campaignId),
        sessionId
      );

      res.json({ success: true, questions });
    } catch (error) {
      console.error('Error getting questions:', error);
      res.status(500).json({ error: 'Failed to get questions' });
    }
  });

  /**
   * POST /api/ab-test/responses
   * Record response to A/B test question
   */
  router.post('/ab-test/responses', async (req, res) => {
    try {
      const {
        questionId,
        assignmentId,
        campaignId,
        responseValue,
        responseVariant,
        interactionCount,
        shownAt,
        responseTimeMs,
        metadata
      } = req.body;

      if (!questionId || !assignmentId || !campaignId || !responseValue) {
        return res.status(400).json({
          error: 'Missing required fields: questionId, assignmentId, campaignId, responseValue'
        });
      }

      const response = await feedbackService.recordAbTestResponse({
        questionId: parseInt(questionId),
        assignmentId: parseInt(assignmentId),
        campaignId: parseInt(campaignId),
        responseValue,
        responseVariant,
        interactionCount,
        shownAt,
        responseTimeMs,
        metadata
      });

      res.json({
        success: true,
        response,
        message: 'Response recorded successfully'
      });
    } catch (error) {
      console.error('Error recording response:', error);
      res.status(500).json({ error: 'Failed to record response' });
    }
  });

  /**
   * GET /api/ab-test/performance/:campaignId
   * Get A/B test performance metrics
   */
  router.get('/ab-test/performance/:campaignId', async (req, res) => {
    try {
      const { campaignId } = req.params;
      const performance = await feedbackService.getAbTestPerformance(parseInt(campaignId));

      res.json({ success: true, performance });
    } catch (error) {
      console.error('Error getting performance:', error);
      res.status(500).json({ error: 'Failed to get performance' });
    }
  });

  /**
   * POST /api/ab-test/campaigns/:id/complete
   * Complete an A/B test and determine winner
   */
  router.post('/ab-test/campaigns/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await feedbackService.completeAbTest(parseInt(id));

      res.json({
        success: true,
        ...result,
        message: 'Campaign completed successfully'
      });
    } catch (error) {
      console.error('Error completing campaign:', error);
      res.status(500).json({ error: 'Failed to complete campaign' });
    }
  });

  // ====================
  // Communication Logs
  // ====================

  /**
   * POST /api/logs/communication
   * Log a communication event
   */
  router.post('/logs/communication', async (req, res) => {
    try {
      const log = await feedbackService.logCommunication(req.body);

      res.json({
        success: true,
        log,
        message: 'Communication logged successfully'
      });
    } catch (error) {
      console.error('Error logging communication:', error);
      res.status(500).json({ error: 'Failed to log communication' });
    }
  });

  /**
   * GET /api/logs/communication
   * Get communication logs with filters
   */
  router.get('/logs/communication', async (req, res) => {
    try {
      const {
        sessionId,
        conversationId,
        serviceName,
        logType,
        status
      } = req.query;

      const logs = await feedbackService.getCommunicationLogs({
        sessionId,
        conversationId,
        serviceName,
        logType,
        status
      });

      res.json({ success: true, logs });
    } catch (error) {
      console.error('Error getting logs:', error);
      res.status(500).json({ error: 'Failed to get logs' });
    }
  });

  // ====================
  // Workflow States
  // ====================

  /**
   * POST /api/workflow/state
   * Update workflow state
   */
  router.post('/workflow/state', async (req, res) => {
    try {
      const state = await feedbackService.updateWorkflowState(req.body);

      res.json({
        success: true,
        state,
        message: 'Workflow state updated successfully'
      });
    } catch (error) {
      console.error('Error updating workflow state:', error);
      res.status(500).json({ error: 'Failed to update workflow state' });
    }
  });

  /**
   * GET /api/workflow/state/:workflowType/:entityId
   * Get current workflow state
   */
  router.get('/workflow/state/:workflowType/:entityId', async (req, res) => {
    try {
      const { workflowType, entityId } = req.params;
      const state = await feedbackService.getCurrentWorkflowState(
        workflowType,
        entityId
      );

      res.json({ success: true, state });
    } catch (error) {
      console.error('Error getting workflow state:', error);
      res.status(500).json({ error: 'Failed to get workflow state' });
    }
  });

  // ====================
  // Utility Endpoints
  // ====================

  /**
   * POST /api/session/generate
   * Generate new session/conversation/message IDs
   */
  router.post('/session/generate', (req, res) => {
    try {
      const { type } = req.body;

      let id;
      switch (type) {
        case 'session':
          id = FeedbackLoopService.generateSessionId();
          break;
        case 'conversation':
          id = FeedbackLoopService.generateConversationId();
          break;
        case 'message':
          id = FeedbackLoopService.generateMessageId();
          break;
        default:
          return res.status(400).json({ error: 'Invalid type' });
      }

      res.json({ success: true, id, type });
    } catch (error) {
      console.error('Error generating ID:', error);
      res.status(500).json({ error: 'Failed to generate ID' });
    }
  });

  return router;
}

export default createFeedbackRouter;
