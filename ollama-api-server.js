/**
 * Minimal Ollama API Server
 * Only includes working Ollama endpoints to avoid broken dependencies
 */

import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Simple Ollama client
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

// Global Ollama client
let ollamaClient = null;

// Initialize Ollama
async function initializeOllama() {
  try {
    const endpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11500';
    ollamaClient = new SimpleOllamaClient({
      endpoint,
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

// Middleware to check if Ollama is initialized
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'Minimal Ollama API Server',
    timestamp: new Date().toISOString(),
    ollama: ollamaClient ? 'initialized' : 'not_initialized',
  });
});

// Ollama health check
app.get('/api/ollama/health', async (req, res) => {
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

// Ollama chat endpoint
app.post('/api/ollama/chat', requireOllama, async (req, res) => {
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

// Ollama generate endpoint
app.post('/api/ollama/generate', requireOllama, async (req, res) => {
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

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initializeOllama();

    server.listen(PORT, () => {
      console.log(`🚀 Minimal Ollama API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 Ollama health: http://localhost:${PORT}/api/ollama/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
