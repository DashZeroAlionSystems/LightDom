/**
 * Ollama DeepSeek API Endpoints
 * Bidirectional streaming communication API for DeepSeek AI
 */

import express, { Router, Request, Response } from 'express';
import OllamaDeepSeekIntegration from '../ai/OllamaDeepSeekIntegration';

const router = Router();

// Initialize Ollama DeepSeek
let ollamaDeepseek: OllamaDeepSeekIntegration;

/**
 * Initialize Ollama DeepSeek services
 */
export async function initializeOllamaServices() {
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
}

/**
 * GET /api/ollama/status
 * Get Ollama DeepSeek status
 */
router.get('/status', (req: Request, res: Response) => {
  const status = ollamaDeepseek.getStatus();
  res.json({
    success: true,
    status
  });
});

/**
 * POST /api/ollama/chat
 * Simple chat interface with DeepSeek
 */
router.post('/chat', async (req: Request, res: Response) => {
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
  } catch (error: any) {
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
router.post('/stream/start', async (req: Request, res: Response) => {
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
  } catch (error: any) {
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
router.post('/stream/send', async (req: Request, res: Response) => {
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
  } catch (error: any) {
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
router.post('/stream/stop', (req: Request, res: Response) => {
  const { streamId } = req.body;

  if (!streamId) {
    return res.status(400).json({
      success: false,
      error: 'streamId is required'
    });
  }

  ollamaDeepseek.stopStream(streamId);

  res.json({
    success: true,
    message: 'Stream stopped'
  });
});

/**
 * GET /api/ollama/conversation/:conversationId
 * Get conversation history
 */
router.get('/conversation/:conversationId', (req: Request, res: Response) => {
  const { conversationId } = req.params;
  
  const history = ollamaDeepseek.getConversationHistory(conversationId);

  res.json({
    success: true,
    conversationId,
    history
  });
});

/**
 * DELETE /api/ollama/conversation/:conversationId
 * Clear conversation history
 */
router.delete('/conversation/:conversationId', (req: Request, res: Response) => {
  const { conversationId } = req.params;
  
  ollamaDeepseek.clearConversation(conversationId);

  res.json({
    success: true,
    message: 'Conversation cleared'
  });
});

/**
 * WebSocket upgrade for streaming
 */
export function setupWebSocket(wss: any) {
  wss.on('connection', (ws: any, req: any) => {
    const streamId = `ws-${Date.now()}`;
    
    console.log(`🔌 WebSocket connected: ${streamId}`);

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'start') {
          // Setup stream event listeners
          const chunkHandler = ({ streamId: sid, chunk }: any) => {
            if (sid === streamId) {
              ws.send(JSON.stringify({ type: 'chunk', content: chunk }));
            }
          };

          const completeHandler = ({ streamId: sid, content }: any) => {
            if (sid === streamId) {
              ws.send(JSON.stringify({ type: 'complete', content }));
            }
          };

          const errorHandler = ({ streamId: sid, error }: any) => {
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
      } catch (error: any) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          error: error.message 
        }));
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket disconnected: ${streamId}`);
      ollamaDeepseek.stopStream(streamId);
    });
  });
}

export default router;
