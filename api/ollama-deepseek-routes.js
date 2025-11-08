/**
 * Ollama DeepSeek API Endpoints
 * Bidirectional streaming communication API for DeepSeek AI via Ollama
 */

import express from 'express';

const router = express.Router();

// Module-level variable for Ollama integration instance
let ollamaDeepseek = null;

/**
 * Initialize Ollama DeepSeek services
 * This is called during server startup
 */
export async function initializeOllamaServices() {
  try {
    // Dynamically import the TypeScript module
    const OllamaModule = await import('../src/ai/OllamaDeepSeekIntegration.js');
    const OllamaDeepSeekIntegration = OllamaModule.OllamaDeepSeekIntegration || OllamaModule.default;

    ollamaDeepseek = new OllamaDeepSeekIntegration({
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'deepseek-r1:latest',
      temperature: 0.7,
      streamingEnabled: true,
      toolsEnabled: true
    });

    await ollamaDeepseek.initialize();

    // Setup event listeners
    ollamaDeepseek.on('workflowCreated', (workflow) => {
      console.log('📝 Workflow created by AI:', workflow.name);
    });

    ollamaDeepseek.on('dataMiningCampaignCreated', (campaign) => {
      console.log('⛏️ Data mining campaign created:', campaign.name);
    });

    ollamaDeepseek.on('workflowComponentAdded', (component) => {
      console.log('🎨 Component added to workflow:', component.type);
    });

    console.log('✅ Ollama DeepSeek services initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Ollama DeepSeek:', error.message);
    throw error;
  }
}

/**
 * Middleware to check if Ollama is initialized
 */
function requireOllama(req, res, next) {
  if (!ollamaDeepseek) {
    return res.status(503).json({
      success: false,
      error: 'Ollama service not initialized. Please ensure Ollama is running (ollama serve)',
      hint: 'Start Ollama with: ollama serve'
    });
  }
  next();
}

/**
 * GET /api/ollama/health
 * Health check for Ollama service
 */
router.get('/health', async (req, res) => {
  try {
    if (!ollamaDeepseek) {
      return res.status(503).json({
        success: false,
        status: 'not_initialized',
        message: 'Ollama service not initialized',
        hint: 'Ensure Ollama is running: ollama serve'
      });
    }

    const status = ollamaDeepseek.getStatus();
    res.json({
      success: true,
      status: 'ok',
      service: 'Ollama DeepSeek',
      details: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      error: error.message
    });
  }
});

/**
 * GET /api/ollama/status
 * Get detailed Ollama DeepSeek status
 */
router.get('/status', requireOllama, (req, res) => {
  try {
    const status = ollamaDeepseek.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/chat
 * Simple chat interface with DeepSeek
 */
router.post('/chat', requireOllama, async (req, res) => {
  const { message, conversationId } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'message is required'
    });
  }

  try {
    const response = await ollamaDeepseek.chat(message, conversationId);
    
    res.json({
      success: true,
      response,
      conversationId: conversationId || `conv-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/stream/start
 * Start a bidirectional conversation stream
 */
router.post('/stream/start', requireOllama, async (req, res) => {
  const { streamId, message, systemPrompt } = req.body;

  if (!streamId || !message) {
    return res.status(400).json({
      success: false,
      error: 'streamId and message are required'
    });
  }

  try {
    await ollamaDeepseek.startBidiStream(streamId, message, systemPrompt);
    
    res.json({
      success: true,
      streamId,
      message: 'Stream started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/stream/send
 * Send a message to an active stream
 */
router.post('/stream/send', requireOllama, async (req, res) => {
  const { streamId, message } = req.body;

  if (!streamId || !message) {
    return res.status(400).json({
      success: false,
      error: 'streamId and message are required'
    });
  }

  try {
    await ollamaDeepseek.sendToStream(streamId, message);
    
    res.json({
      success: true,
      message: 'Message sent to stream'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/stream/stop
 * Stop a bidirectional stream
 */
router.post('/stream/stop', requireOllama, (req, res) => {
  const { streamId } = req.body;

  if (!streamId) {
    return res.status(400).json({
      success: false,
      error: 'streamId is required'
    });
  }

  try {
    ollamaDeepseek.stopStream(streamId);

    res.json({
      success: true,
      message: 'Stream stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ollama/conversation/:conversationId
 * Get conversation history
 */
router.get('/conversation/:conversationId', requireOllama, (req, res) => {
  const { conversationId } = req.params;
  
  try {
    const history = ollamaDeepseek.getConversationHistory(conversationId);

    res.json({
      success: true,
      conversationId,
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
 * DELETE /api/ollama/conversation/:conversationId
 * Clear conversation history
 */
router.delete('/conversation/:conversationId', requireOllama, (req, res) => {
  const { conversationId } = req.params;
  
  try {
    ollamaDeepseek.clearConversation(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/generate
 * Generate text from a prompt
 */
router.post('/generate', requireOllama, async (req, res) => {
  const { prompt, options = {} } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'prompt is required'
    });
  }

  try {
    const response = await ollamaDeepseek.generate(prompt, options);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * WebSocket upgrade for streaming
 * This should be called from the main server to setup WebSocket handlers
 */
export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    if (!ollamaDeepseek) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Ollama service not initialized'
      }));
      ws.close();
      return;
    }

    const streamId = `ws-${Date.now()}`;
    
    console.log(`🔌 WebSocket connected: ${streamId}`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'start') {
          // Setup stream event listeners
          const chunkHandler = ({ streamId: sid, chunk }) => {
            if (sid === streamId) {
              ws.send(JSON.stringify({ type: 'chunk', content: chunk }));
            }
          };

          const completeHandler = ({ streamId: sid, content }) => {
            if (sid === streamId) {
              ws.send(JSON.stringify({ type: 'complete', content }));
            }
          };

          const errorHandler = ({ streamId: sid, error }) => {
            if (sid === streamId) {
              ws.send(JSON.stringify({ type: 'error', error: error.message }));
            }
          };

          ollamaDeepseek.on('chunk', chunkHandler);
          ollamaDeepseek.on('streamComplete', completeHandler);
          ollamaDeepseek.on('error', errorHandler);

          // Start stream
          await ollamaDeepseek.startBidiStream(
            streamId,
            data.message,
            data.systemPrompt
          );
        } else if (data.type === 'send') {
          await ollamaDeepseek.sendToStream(streamId, data.message);
        } else if (data.type === 'stop') {
          ollamaDeepseek.stopStream(streamId);
          ws.close();
        }
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          error: error.message 
        }));
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket disconnected: ${streamId}`);
      if (ollamaDeepseek) {
        ollamaDeepseek.stopStream(streamId);
      }
    });
  });
}

export default router;
