/**
 * DeepSeek Chat API Routes
 * Provides REST endpoints for chat with DeepSeek AI
 */

import express from 'express';
import { DeepSeekChatService } from '../services/deepseek-chat-service.js';

export function createDeepSeekChatRoutes(config = {}) {
  const router = express.Router();
  const chatService = new DeepSeekChatService(config);
  
  // Initialize on first request
  let initialized = false;
  async function ensureInitialized() {
    if (!initialized) {
      await chatService.initialize();
      initialized = true;
    }
  }

  // Get service status
  router.get('/status', async (req, res) => {
    try {
      await ensureInitialized();
      const status = await chatService.getStatus();
      res.json({ success: true, status });
    } catch (error) {
      console.error('Failed to get chat service status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // List conversations
  router.get('/conversations', async (req, res) => {
    try {
      await ensureInitialized();
      const { limit = 50, archived = false } = req.query;
      const conversations = await chatService.listConversations(
        parseInt(limit),
        archived === 'true'
      );
      res.json({ success: true, conversations });
    } catch (error) {
      console.error('Failed to list conversations:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new conversation
  router.post('/conversations', async (req, res) => {
    try {
      await ensureInitialized();
      const { title, userId, context } = req.body;
      const conversation = await chatService.createConversation(title, userId, context);
      res.json({ success: true, conversation });
    } catch (error) {
      console.error('Failed to create conversation:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get conversation
  router.get('/conversations/:id', async (req, res) => {
    try {
      await ensureInitialized();
      const conversation = await chatService.getConversation(req.params.id);
      res.json({ success: true, conversation });
    } catch (error) {
      console.error('Failed to get conversation:', error);
      res.status(404).json({ success: false, error: error.message });
    }
  });

  // Send message in conversation
  router.post('/conversations/:id/messages', async (req, res) => {
    try {
      await ensureInitialized();
      const { message } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }
      
      const result = await chatService.sendMessage(req.params.id, message.trim());
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Failed to send message:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Archive conversation
  router.post('/conversations/:id/archive', async (req, res) => {
    try {
      await ensureInitialized();
      await chatService.archiveConversation(req.params.id);
      res.json({ success: true, message: 'Conversation archived' });
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete conversation
  router.delete('/conversations/:id', async (req, res) => {
    try {
      await ensureInitialized();
      await chatService.deleteConversation(req.params.id);
      res.json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default createDeepSeekChatRoutes;
