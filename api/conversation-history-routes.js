/**
 * Conversation History API Routes
 * 
 * REST API for managing DeepSeek conversation history,
 * knowledge graph, and learning patterns
 */

import { Router } from 'express';
import ConversationHistoryService from '../../services/conversation-history.service.js';

export function createConversationHistoryRoutes(db) {
  const router = Router();
  const service = new ConversationHistoryService(db);

  // Initialize schema on startup
  service.initializeSchema().catch(err => {
    console.error('Failed to initialize conversation history schema:', err);
  });

  /**
   * POST /api/conversations
   * Create or update a conversation
   */
  router.post('/', async (req, res) => {
    try {
      const { conversationId, sessionContext, metadata } = req.body;

      if (!conversationId || !sessionContext) {
        return res.status(400).json({
          success: false,
          error: 'conversationId and sessionContext are required',
        });
      }

      await service.upsertConversation(conversationId, sessionContext, metadata);

      res.json({
        success: true,
        message: 'Conversation created/updated',
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/:conversationId/messages
   * Add a message to conversation
   */
  router.post('/:conversationId/messages', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const message = req.body;

      if (!message.role || !message.content) {
        return res.status(400).json({
          success: false,
          error: 'role and content are required',
        });
      }

      await service.addMessage(conversationId, message);

      res.json({
        success: true,
        message: 'Message added',
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/:conversationId
   * Get full conversation with history and knowledge graph
   */
  router.get('/:conversationId', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const conversation = await service.getFullConversation(conversationId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/:conversationId/history
   * Get conversation message history
   */
  router.get('/:conversationId/history', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const history = await service.getConversationHistory(conversationId);

      res.json({
        success: true,
        history,
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * DELETE /api/conversations/:conversationId
   * Delete a conversation
   */
  router.delete('/:conversationId', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const deleted = await service.deleteConversation(conversationId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        message: 'Conversation deleted',
      });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/:conversationId/stats
   * Get conversation statistics
   */
  router.get('/:conversationId/stats', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const stats = await service.getConversationStats(conversationId);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/:conversationId/knowledge-graph
   * Add entity to knowledge graph
   */
  router.post('/:conversationId/knowledge-graph', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { entityType, entityId, entityData, relationships } = req.body;

      if (!entityType || !entityId || !entityData) {
        return res.status(400).json({
          success: false,
          error: 'entityType, entityId, and entityData are required',
        });
      }

      await service.addToKnowledgeGraph(
        conversationId,
        entityType,
        entityId,
        entityData,
        relationships
      );

      res.json({
        success: true,
        message: 'Entity added to knowledge graph',
      });
    } catch (error) {
      console.error('Add to knowledge graph error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/:conversationId/knowledge-graph
   * Get knowledge graph for conversation
   */
  router.get('/:conversationId/knowledge-graph', async (req, res) => {
    try {
      const { conversationId } = req.params;
      const knowledgeGraph = await service.getKnowledgeGraphForConversation(conversationId);

      res.json({
        success: true,
        knowledgeGraph,
      });
    } catch (error) {
      console.error('Get knowledge graph error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/session/:sessionId
   * Get all conversations for a session
   */
  router.get('/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { limit } = req.query;
      
      const conversations = await service.getSessionConversations(
        sessionId,
        limit ? parseInt(limit) : 10
      );

      res.json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error('Get session conversations error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/learning/pattern
   * Record a learning pattern
   */
  router.post('/learning/pattern', async (req, res) => {
    try {
      const { patternType, patternData, success } = req.body;

      if (!patternType || !patternData || typeof success !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'patternType, patternData, and success are required',
        });
      }

      await service.recordLearningPattern(patternType, patternData, success);

      res.json({
        success: true,
        message: 'Learning pattern recorded',
      });
    } catch (error) {
      console.error('Record learning pattern error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/learning/patterns
   * Get successful learning patterns
   */
  router.get('/learning/patterns', async (req, res) => {
    try {
      const { patternType, minSuccessRate, limit } = req.query;
      
      const patterns = await service.getSuccessfulPatterns(
        patternType,
        minSuccessRate ? parseFloat(minSuccessRate) : 0.7,
        limit ? parseInt(limit) : 10
      );

      res.json({
        success: true,
        patterns,
      });
    } catch (error) {
      console.error('Get learning patterns error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/conversations/search
   * Search conversations
   */
  router.get('/search', async (req, res) => {
    try {
      const { q, sessionId, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query (q) is required',
        });
      }

      const results = await service.searchConversations(
        q,
        sessionId,
        limit ? parseInt(limit) : 10
      );

      res.json({
        success: true,
        results,
      });
    } catch (error) {
      console.error('Search conversations error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}

export default createConversationHistoryRoutes;
