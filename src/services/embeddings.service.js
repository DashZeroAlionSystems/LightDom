import fetch from 'node-fetch';

const OPENAI_URL = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';

export async function embedText(text, { model = 'text-embedding-3-small' } = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');

  const url = `${OPENAI_URL}/embeddings`;
  const payload = {
    model,
    input: text,
    // encoding_format: 'float' // optional
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Embedding request failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  if (!data || !data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Unexpected embedding response format');
  }

  return data.data[0].embedding;
}

export default { embedText };
