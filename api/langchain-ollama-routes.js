/**
 * LangChain Ollama API Routes
 * 
 * RESTful API endpoints for interacting with LangChain + Ollama DeepSeek integration
 */

import express from 'express';
import { getLangChainOllamaService } from '../services/langchain-ollama-service.js';

const router = express.Router();

/**
 * @route GET /api/langchain/health
 * @desc Check LangChain Ollama service health
 */
router.get('/health', async (req, res) => {
  try {
    const service = getLangChainOllamaService();
    const status = await service.getStatus();
    
    res.json({
      success: true,
      service: 'LangChain Ollama Integration',
      ...status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      service: 'LangChain Ollama Integration',
    });
  }
});

/**
 * @route GET /api/langchain/metrics
 * @desc Get service metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const service = getLangChainOllamaService();
    const metrics = service.getMetrics();
    
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/chat
 * @desc Simple chat without history
 * @body { message: string, options?: object }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, options = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const service = getLangChainOllamaService();
    const result = await service.chat(message, options);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/conversation
 * @desc Conversational chat with history
 * @body { message: string, sessionId?: string, systemPrompt?: string }
 */
router.post('/conversation', async (req, res) => {
  try {
    const { message, sessionId, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const service = getLangChainOllamaService();
    const result = await service.conversationalChat(message, sessionId, systemPrompt);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/chat/stream
 * @desc Streaming chat response (Server-Sent Events)
 * @body { message: string }
 */
router.post('/chat/stream', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const service = getLangChainOllamaService();
    
    for await (const chunk of service.chatStream(message)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/generate/code
 * @desc Generate code based on description
 * @body { description: string, language?: string, context?: string }
 */
router.post('/generate/code', async (req, res) => {
  try {
    const { description, language = 'javascript', context = '' } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required',
      });
    }

    const service = getLangChainOllamaService();
    const result = await service.generateCode(description, language, context);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/generate/workflow
 * @desc Generate workflow based on description
 * @body { description: string, requirements?: string[] }
 */
router.post('/generate/workflow', async (req, res) => {
  try {
    const { description, requirements = [] } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required',
      });
    }

    const service = getLangChainOllamaService();
    const result = await service.generateWorkflow(description, requirements);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/analyze/dom
 * @desc Analyze DOM structure for optimization
 * @body { domStructure: object, metrics: object }
 */
router.post('/analyze/dom', async (req, res) => {
  try {
    const { domStructure, metrics } = req.body;

    if (!domStructure || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'domStructure and metrics are required',
      });
    }

    const service = getLangChainOllamaService();
    const result = await service.analyzeDOMOptimization(domStructure, metrics);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/langchain/sessions
 * @desc List all active conversation sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const service = getLangChainOllamaService();
    const sessions = service.listSessions();

    res.json({
      success: true,
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/langchain/session/:sessionId/history
 * @desc Get conversation history for a session
 */
router.get('/session/:sessionId/history', (req, res) => {
  try {
    const { sessionId } = req.params;
    const service = getLangChainOllamaService();
    const history = service.getConversationHistory(sessionId);

    res.json({
      success: true,
      sessionId,
      history,
      messageCount: history.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/langchain/session/:sessionId
 * @desc Clear conversation history for a session
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const service = getLangChainOllamaService();
    const result = service.clearConversationHistory(sessionId);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/langchain/sessions
 * @desc Clear all conversation histories
 */
router.delete('/sessions', (req, res) => {
  try {
    const service = getLangChainOllamaService();
    const result = service.clearConversationHistory();

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/langchain/config
 * @desc Update service configuration
 * @body { model?: string, temperature?: number, maxTokens?: number, topP?: number }
 */
router.put('/config', (req, res) => {
  try {
    const service = getLangChainOllamaService();
    const result = service.updateConfig(req.body);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/langchain/model
 * @desc Change the active model
 * @body { model: string }
 */
router.put('/model', (req, res) => {
  try {
    const { model } = req.body;

    if (!model) {
      return res.status(400).json({
        success: false,
        error: 'Model name is required',
      });
    }

    const service = getLangChainOllamaService();
    const result = service.setModel(model);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/langchain/chain/custom
 * @desc Execute custom chain with template
 * @body { input: string, template: string, variables?: object }
 */
router.post('/chain/custom', async (req, res) => {
  try {
    const { input, template, variables = {} } = req.body;

    if (!input || !template) {
      return res.status(400).json({
        success: false,
        error: 'Input and template are required',
      });
    }

    const service = getLangChainOllamaService();
    const result = await service.processWithChain(input, template, variables);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
