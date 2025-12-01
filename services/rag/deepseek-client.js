function isLocalhost(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function resolveBaseUrl(config) {
  if (config.baseUrl) return config.baseUrl;
  const envOllama = process.env.OLLAMA_ENDPOINT || process.env.OLLAMA_API_URL;
  if (envOllama) return envOllama;
  const envDeepSeek = process.env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_BASE_URL;
  if (envDeepSeek) return envDeepSeek;
  return 'http://127.0.0.1:11434';
}

export default function createDeepSeekClient(config = {}) {
  const rawBaseUrl = resolveBaseUrl(config);
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  const timeout = config.timeout || Number.parseInt(process.env.DEEPSEEK_TIMEOUT || '60000', 10);
  const isOllama = isLocalhost(baseUrl);
  const remoteDefaultModel =
    process.env.DEEPSEEK_MODEL || process.env.DEEPSEEK_DEFAULT_MODEL || 'deepseek-reasoner';
  const defaultModel = isOllama
    ? process.env.OLLAMA_MODEL || 'deepseek-r1:latest'
    : remoteDefaultModel;
  const model = config.model || defaultModel;

  if (!isOllama && !apiKey) {
    console.warn(
      '[rag] DEEPSEEK_API_KEY not provided; remote DeepSeek API calls will fail until configured.'
    );
  }

  async function chat(messages, options = {}) {
    const url = isOllama
      ? `${baseUrl.replace(/\/v1$/i, '')}/api/chat`
      : `${baseUrl}/chat/completions`;
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
        let errorDetail = '';
        try {
          const bodyText = await response.text();
          if (bodyText) {
            try {
              const parsed = JSON.parse(bodyText);
              errorDetail =
                parsed?.error?.message ||
                parsed?.message ||
                (Object.keys(parsed || {}).length ? JSON.stringify(parsed) : '');
            } catch {
              errorDetail = bodyText;
            }
          }
        } catch (parseError) {
          errorDetail = parseError?.message || '';
        }

        const messageSuffix = errorDetail ? `: ${errorDetail}` : '';
        throw new Error(`DeepSeek request failed (${response.status})${messageSuffix}`);
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
