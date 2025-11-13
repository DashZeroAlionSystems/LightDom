import express from 'express';

const router = express.Router();

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11500';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'deepseek-coder';

router.get('/health', async (req, res) => {
  try {
    // Check Ollama tags endpoint as a lightweight health check
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
    if (!r.ok)
      return res.status(502).json({ ok: false, message: 'Ollama unreachable', status: r.status });
    const json = await r.json().catch(() => ({}));
    return res.json({ ok: true, service: 'rag-fallback', models: json.models || [] });
  } catch (err) {
    return res.status(503).json({ ok: false, error: err.message });
  }
});

// Ingest a URL: minimal fallback that asks Ollama to summarize the page.
router.post('/ingest/url', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'url required' });

    const prompt = `Summarize the content at this URL in three concise sentences: ${url}`;

    const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.0 },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(502)
        .json({ success: false, error: 'Ollama generate failed', status: r.status, details: text });
    }

    const json = await r.json();
    return res.json({ success: true, url, summary: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

// Simple query proxy to Ollama chat/generate
router.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt required' });

    const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7 },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(502)
        .json({ success: false, error: 'Ollama generate failed', status: r.status, details: text });
    }

    const json = await r.json();
    return res.json({ success: true, response: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

// Chat endpoint for compatibility with frontend
router.post('/chat', async (req, res) => {
  try {
    const { message, messages, model } = req.body || {};

    // Support both 'message' (single string) and 'messages' (array) formats
    let prompt;
    if (messages && Array.isArray(messages)) {
      // Convert messages array to a single prompt
      prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    } else if (message) {
      prompt = message;
    } else {
      return res.status(400).json({ success: false, error: 'message or messages required' });
    }

    const selectedModel = model || DEFAULT_MODEL;
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        stream: false,
        options: { temperature: 0.7 },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(502)
        .json({ success: false, error: 'Ollama generate failed', status: r.status, details: text });
    }

    const json = await r.json();
    return res.json({ success: true, response: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

// Streaming chat endpoint for real-time responses
router.post('/chat/stream', async (req, res) => {
  try {
    const { message, messages, model } = req.body || {};

    // Support both 'message' (single string) and 'messages' (array) formats
    let prompt;
    if (messages && Array.isArray(messages)) {
      // Convert messages array to a single prompt
      prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    } else if (message) {
      prompt = message;
    } else {
      return res.status(400).json({ success: false, error: 'message or messages required' });
    }

    const selectedModel = model || DEFAULT_MODEL;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        stream: true,
        options: { temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.write(`data: ${JSON.stringify({ error: 'Ollama generate failed', details: text })}\n\n`);
      return res.end();
    }

    // Stream the response chunks
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
          }
          if (json.done) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }

    res.end();
  } catch (err) {
    res.write(
      `data: ${JSON.stringify({ error: 'Unable to reach Ollama', details: err.message })}\n\n`
    );
    res.end();
  }
});

export default router;
