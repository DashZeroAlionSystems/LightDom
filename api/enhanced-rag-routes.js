/**
 * Enhanced RAG API Routes with DeepSeek Tools and ORC Integration
 */

import express from 'express';
import { createEnhancedRagService } from '../services/rag/enhanced-rag-service.js';

const router = express.Router();

let ragService = null;

/**
 * Initialize RAG service
 */
async function initRagService(db, logger) {
  if (!ragService) {
    ragService = createEnhancedRagService({
      db,
      logger,
      config: {
        useOllamaEmbeddings: process.env.RAG_EMBED_PROVIDER === 'ollama',
        ollama: {
          endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
          model: process.env.OLLAMA_MODEL || 'deepseek-r1:latest'
        },
        deepseek: {
          apiKey: process.env.DEEPSEEK_API_KEY,
          endpoint: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'
        }
      }
    });
  }
  return ragService;
}

/**
 * Chat with tools (streaming)
 */
router.post('/chat/tools/stream', async (req, res) => {
  try {
    const {
      messages,
      conversationId = 'default',
      mode = 'assistant',
      enableTools = true,
      temperature,
      maxTokens
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const service = await initRagService(req.app.locals.db, console);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Stream chat with tools
    for await (const event of service.chatWithTools(messages, {
      conversationId,
      mode,
      enableTools,
      temperature,
      maxTokens
    })) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Enhanced RAG chat failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute tool directly
 */
router.post('/tool/execute', async (req, res) => {
  try {
    const { tool, params, conversationId = 'default' } = req.body;

    if (!tool) {
      return res.status(400).json({ error: 'tool name is required' });
    }

    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeTool(tool, params, conversationId);

    res.json({
      success: true,
      tool,
      result
    });
  } catch (error) {
    console.error('Tool execution failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute command
 */
router.post('/command/execute', async (req, res) => {
  try {
    const { command, options = {} } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }

    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeCommand(command, options);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Command execution failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Git operations
 */
router.post('/git/:operation', async (req, res) => {
  try {
    const { operation } = req.params;
    const params = req.body;

    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeTool(`git.${operation}`, params, 'git-session');

    res.json({
      success: true,
      operation,
      result
    });
  } catch (error) {
    console.error(`Git ${req.params.operation} failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * File operations
 */
router.post('/file/:operation', async (req, res) => {
  try {
    const { operation } = req.params;
    const params = req.body;

    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeTool(`file.${operation}`, params, 'file-session');

    res.json({
      success: true,
      operation,
      result
    });
  } catch (error) {
    console.error(`File ${req.params.operation} failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Project operations
 */
router.post('/project/:operation', async (req, res) => {
  try {
    const { operation } = req.params;
    const params = req.body;

    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeTool(`project.${operation}`, params, 'project-session');

    res.json({
      success: true,
      operation,
      result
    });
  } catch (error) {
    console.error(`Project ${req.params.operation} failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get conversation
 */
router.get('/conversation/:id', async (req, res) => {
  try {
    const service = await initRagService(req.app.locals.db, console);
    const conversation = service.getConversation(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Failed to get conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear conversation
 */
router.delete('/conversation/:id', async (req, res) => {
  try {
    const service = await initRagService(req.app.locals.db, console);
    service.clearConversation(req.params.id);

    res.json({
      success: true,
      message: 'Conversation cleared'
    });
  } catch (error) {
    console.error('Failed to clear conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const service = await initRagService(req.app.locals.db, console);
    const conversations = service.listConversations();

    res.json({
      success: true,
      conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Failed to list conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Index codebase
 */
router.post('/codebase/index', async (req, res) => {
  try {
    const { projectPath = process.cwd(), patterns, exclude } = req.body;

    const service = await initRagService(req.app.locals.db, console);
    const result = await service.indexCodebase(projectPath, { patterns, exclude });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Codebase indexing failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check
 */
router.get('/health', async (req, res) => {
  try {
    const service = await initRagService(req.app.locals.db, console);
    const health = await service.healthCheck();

    const statusCode = health.status === 'ok' ? 200 : health.status === 'warn' ? 206 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Get available tools
 */
router.get('/tools', async (req, res) => {
  try {
    const service = await initRagService(req.app.locals.db, console);
    
    res.json({
      success: true,
      tools: {
        git: [
          'status', 'createBranch', 'switchBranch', 'add', 
          'commit', 'push', 'pull', 'diff', 'log', 
          'listBranches', 'createIssue'
        ],
        file: ['read', 'write', 'list', 'mkdir'],
        project: ['installDependencies', 'runScript', 'start', 'build', 'test', 'getInfo'],
        system: ['getInfo', 'getEnv'],
        command: ['execute']
      }
    });
  } catch (error) {
    console.error('Failed to get tools:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get system info
 */
router.get('/system/info', async (req, res) => {
  try {
    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeTool('system.getInfo', {}, 'system-session');

    res.json({
      success: true,
      info: result
    });
  } catch (error) {
    console.error('Failed to get system info:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get project info
 */
router.get('/project/info', async (req, res) => {
  try {
    const { projectPath = process.cwd() } = req.query;
    
    const service = await initRagService(req.app.locals.db, console);
    const result = await service.executeTool('project.getInfo', { projectPath }, 'project-session');

    res.json({
      success: true,
      info: result
    });
  } catch (error) {
    console.error('Failed to get project info:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
