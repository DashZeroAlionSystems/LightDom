/**
 * Simplified Ollama DeepSeek API Endpoints
 * Direct communication with Ollama API
 */

import express from 'express';

const router = express.Router();

// Simple Ollama client for basic functionality
class SimpleOllamaClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'http://localhost:11500';
    this.model = options.model || 'deepseek-coder';
    this.temperature = options.temperature || 0.7;
  }

  async chat(message, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: message,
          stream: false,
          options: {
            temperature: this.temperature,
            ...options,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const result = await response.json();
      return result.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error(`Failed to communicate with Ollama: ${error.message}`);
    }
  }

  async generate(prompt, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: this.temperature,
            ...options,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const result = await response.json();
      return result.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw new Error(`Failed to communicate with Ollama: ${error.message}`);
    }
  }

  getStatus() {
    return {
      endpoint: this.endpoint,
      model: this.model,
      temperature: this.temperature,
      status: 'ready',
    };
  }
}

// Module-level variable for Ollama integration instance
let ollamaClient = null;

/**
 * Initialize Ollama services
 */
export async function initializeOllamaServices() {
  try {
    ollamaClient = new SimpleOllamaClient({
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11500',
      model: process.env.OLLAMA_MODEL || 'deepseek-coder',
      temperature: 0.7,
    });

    // Test connection
    await ollamaClient.generate('Hello', { temperature: 0 });
    console.log('✅ Ollama services initialized with deepseek-coder model');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Ollama:', error.message);
    throw error;
  }
}

/**
 * Middleware to check if Ollama is initialized
 */
function requireOllama(req, res, next) {
  if (!ollamaClient) {
    return res.status(503).json({
      success: false,
      error: 'Ollama service not initialized. Please ensure Ollama is running',
      hint: 'Start Ollama with: ollama serve',
    });
  }
  next();
}

/**
 * GET /api/ollama/health
 */
router.get('/health', async (req, res) => {
  try {
    if (!ollamaClient) {
      return res.status(503).json({
        success: false,
        status: 'not_initialized',
        message: 'Ollama service not initialized',
      });
    }

    const status = ollamaClient.getStatus();
    res.json({
      success: true,
      status: 'ok',
      service: 'Ollama DeepSeek',
      details: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      error: error.message,
    });
  }
});

/**
 * POST /api/ollama/chat
 */
router.post('/chat', requireOllama, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'message is required',
    });
  }

  try {
    const response = await ollamaClient.chat(message);
    res.json({
      success: true,
      response,
      conversationId: `conv-${Date.now()}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ollama/generate
 */
router.post('/generate', requireOllama, async (req, res) => {
  const { prompt, options = {} } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'prompt is required',
    });
  }

  try {
    const response = await ollamaClient.generate(prompt, options);
    res.json({
      success: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
