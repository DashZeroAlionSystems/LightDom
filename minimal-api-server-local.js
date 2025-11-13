// Minimal API Server for testing (lightweight alternative to full API server)
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.MINIMAL_API_PORT || process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Basic health check
app.get('/api/health', (req, res) => {
  console.log('[minimal-api-local] Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Minimal LightDom API Server (local)',
  });
});

// Mount optional Ollama/DeepSeek simplified routes if available
let ollamaRoutesAvailable = false;
(async () => {
  try {
    const mod = await import('./api/ollama-deepseek-routes.js');
    if (mod && mod.default) {
      app.use('/api/ollama', mod.default);
      console.log('[minimal-api-local] Mounted /api/ollama routes');
      ollamaRoutesAvailable = true;
    }

    if (mod && typeof mod.initializeOllamaServices === 'function') {
      try {
        // ensure environment variable names are respected
        if (process.env.OLLAMA_BASE_URL && !process.env.OLLAMA_ENDPOINT) {
          process.env.OLLAMA_ENDPOINT = process.env.OLLAMA_BASE_URL;
        }
        await mod.initializeOllamaServices();
        console.log('[minimal-api-local] Ollama services initialized');
      } catch (initErr) {
        console.warn('[minimal-api-local] Ollama initialization failed:', initErr.message);
      }
    }
  } catch (err) {
    console.warn('[minimal-api-local] Could not load ollama routes:', err.message);
  }
})();

// POST /api/rag/ingest/url
app.post('/api/rag/ingest/url', async (req, res) => {
  const { url, metadata } = req.body || {};
  if (!url) return res.status(400).json({ success: false, error: 'url is required' });

  // Try mounted local Ollama route first
  try {
    const body = {
      prompt: `Please produce a concise 3-sentence summary of the page at: ${url}`,
      options: { temperature: 0.0 },
    };
    const localGenerateUrl = `http://localhost:${PORT}/api/ollama/generate`;
    const r = await fetch(localGenerateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (r.ok) {
      const json = await r.json();
      return res.json({
        success: true,
        source: 'local-ollama',
        ingestion: { url, summary: json.response },
      });
    }

    const text = await r.text();
    console.warn('[minimal-api-local] Local Ollama generate returned', r.status, text);
  } catch (localErr) {
    console.warn('[minimal-api-local] Local generate failed:', localErr.message);
  }

  // Fallback: call Ollama directly (respect OLLAMA_BASE_URL first)
  try {
    const endpoint =
      process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11500';
    const body = {
      model: process.env.OLLAMA_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-coder',
      prompt: `Please produce a concise 3-sentence summary of the page at: ${url}`,
      stream: false,
      options: { temperature: 0.0 },
    };
    const r2 = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (r2.ok) {
      const json = await r2.json();
      return res.json({
        success: true,
        source: 'direct-ollama',
        ingestion: { url, summary: json.response },
      });
    }

    const text = await r2.text();
    console.warn('[minimal-api-local] Direct Ollama generate returned', r2.status, text);
    return res.status(502).json({
      success: false,
      error: 'Ollama generate returned non-OK',
      status: r2.status,
      details: text,
    });
  } catch (directErr) {
    console.error('[minimal-api-local] Direct Ollama call failed:', directErr.message);
    return res.status(503).json({
      success: false,
      error: 'Unable to reach the RAG chat service. Ensure Ollama and the backend are running.',
      hint: 'Start Ollama with `ollama serve` and/or ensure OLLAMA_BASE_URL is correct',
      details: directErr.message,
    });
  }
});

// Streaming chat endpoint (SSE fallback) for local minimal server
app.post('/api/rag/chat/stream', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    const endpoint =
      process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11500';
    const prompt = messages.map(m => `${m.role || 'user'}: ${m.content || ''}`).join('\n');

    const r = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-coder',
        prompt,
        stream: false,
        options: { temperature: 0.2 },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(502)
        .json({
          success: false,
          error: 'Ollama generate returned non-OK',
          status: r.status,
          details: text,
        });
    }

    const json = await r.json();
    const responseText = json.response || (typeof json === 'string' ? json : JSON.stringify(json));

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'status', message: 'processing' })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'content', content: responseText })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[minimal-api-local] chat stream failed:', err.message);
    return res
      .status(503)
      .json({ success: false, error: 'Failed to process chat stream', details: err.message });
  }
});

// Simple test route
app.get('/api/rag/test', (req, res) =>
  res.json({ success: true, message: 'RAG test endpoint reachable (local)' })
);

console.log('[minimal-api-local] 🚀 Starting Minimal LightDom API Server (local)...');
app.listen(PORT, '0.0.0.0', () =>
  console.log(`[minimal-api-local] 🚀 Server running on port ${PORT}`)
);

// Provide a /api/rag/health endpoint for orchestrators
app.get('/api/rag/health', async (req, res) => {
  try {
    const endpoint =
      process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11500';
    const r = await fetch(`${endpoint}/api/tags`);
    if (!r.ok)
      return res
        .status(502)
        .json({ success: false, error: 'Ollama /api/tags returned non-OK', status: r.status });
    const json = await r.json().catch(() => ({}));
    return res.json({ success: true, service: 'minimal-local', models: json.models || [] });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});
process.on('uncaughtException', err =>
  console.error('[minimal-api-local] Uncaught Exception:', err)
);
process.on('unhandledRejection', (reason, p) =>
  console.error('[minimal-api-local] Unhandled Rejection:', reason)
);
