// Minimal API Server (proxy-style) that forwards requests to Ollama directly
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.MINIMAL_API_PORT || process.env.PORT || 3001;
// Prefer the canonical OLLAMA_BASE_URL env var but fall back to older names for compatibility
const OLLAMA_ENDPOINT = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11500';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-coder';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Minimal proxy API', timestamp: new Date().toISOString() });
});

// Proxy /api/ollama/health -> direct Ollama /api/models or simple health
app.get('/api/ollama/health', async (req, res) => {
  try {
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
    if (!r.ok)
      return res
        .status(502)
        .json({ success: false, error: 'Ollama /api/tags returned non-OK', status: r.status });
    const json = await r.json();
    return res.json({ success: true, status: 'ok', models: json.models });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

// POST /api/ollama/generate -> forward to Ollama generate
app.post('/api/ollama/generate', async (req, res) => {
  const { prompt, options = {} } = req.body || {};
  if (!prompt) return res.status(400).json({ success: false, error: 'prompt is required' });

  try {
    const body = { model: DEFAULT_MODEL, prompt, stream: false, options };
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return res.json({ success: true, response: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Failed to contact Ollama', details: err.message });
  }
});

// Ingest URL endpoint used by frontend proxy
app.post('/api/rag/ingest/url', async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ success: false, error: 'url required' });

  // Simple strategy: ask Ollama to summarize the URL (frontend can then store it client-side). For true RAG ingestion, DB/vector store is required.
  try {
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
        .json({
          success: false,
          error: 'Ollama generate returned non-OK',
          status: r.status,
          details: text,
        });
    }
    const json = await r.json();
    return res.json({ success: true, url, summary: json.response });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

app.get('/api/rag/test', (req, res) =>
  res.json({ success: true, message: 'Minimal proxy RAG ready' })
);

// Health endpoint expected by start-all-services.js: /api/rag/health
app.get('/api/rag/health', async (req, res) => {
  try {
    const r = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
    if (!r.ok) return res.status(502).json({ success: false, error: 'Ollama /api/tags returned non-OK', status: r.status });
    const json = await r.json().catch(() => ({}));
    return res.json({ success: true, service: 'minimal-proxy', models: json.models || [] });
  } catch (err) {
    return res.status(503).json({ success: false, error: 'Unable to reach Ollama', details: err.message });
  }
});

console.log('Starting minimal-api-proxy server...');
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Minimal proxy API listening on ${PORT}, forwarding to ${OLLAMA_ENDPOINT}`)
);
