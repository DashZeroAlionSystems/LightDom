import { spawn } from 'child_process';

export default function createOllamaEmbeddingClient(config = {}) {
  const model = config.model || process.env.EMBEDDING_MODEL || 'nomic-embed-text';
  const baseUrl = (config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');

  async function embed(texts = []) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Ollama embedding request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.data.map((item) => item.embedding);
  }

  return {
    embed,
    model,
  };
}
