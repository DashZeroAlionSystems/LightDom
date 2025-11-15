function isLocalhost(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export default function createDeepSeekClient(config = {}) {
  const baseUrl = config.baseUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
  const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;
  const model = config.model || process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  const timeout = config.timeout || Number.parseInt(process.env.DEEPSEEK_TIMEOUT || '60000', 10);
  const isOllama = isLocalhost(baseUrl);

  async function chat(messages, options = {}) {
    const url = isOllama ? `${baseUrl.replace(/\/v1$/i, '')}/api/chat` : `${baseUrl}/chat/completions`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const payload = isOllama
        ? {
            model,
            messages,
            stream: options.stream ?? false,
            options: {
              temperature: options.temperature,
              num_predict: options.maxTokens,
            },
          }
        : {
            model,
            messages,
            stream: options.stream ?? false,
            temperature: options.temperature,
            max_tokens: options.maxTokens,
            response_format: options.responseFormat,
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && !isOllama ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `DeepSeek request failed with status ${response.status}`);
      }

      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  async function streamChat(messages, options = {}) {
    const response = await chat(messages, { ...options, stream: true });
    return response.body;
  }

  return {
    chat,
    streamChat,
    isOllama,
    model,
  };
}
