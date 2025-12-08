export default function createEmbeddingClient(config = {}) {
  const baseUrl = config.baseUrl || process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  const model = config.model || process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
  const timeout = config.timeout || Number.parseInt(process.env.EMBEDDING_TIMEOUT || '30000', 10);

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for embedding client');
  }

  async function embed(texts = []) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: texts,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Embedding request failed with status ${response.status}`);
      }

      const json = await response.json();
      return json.data.map((item) => item.embedding);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    embed,
    model,
  };
}
