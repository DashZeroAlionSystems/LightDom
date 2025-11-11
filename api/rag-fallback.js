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

export default router;
