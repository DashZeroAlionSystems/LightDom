import express from 'express';
import { AGENT_TOOLS, executeTool } from './agent-tools.js';

const router = express.Router();

const rawOllamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
const OLLAMA_ENDPOINT = rawOllamaEndpoint.endsWith('/')
  ? rawOllamaEndpoint.slice(0, -1)
  : rawOllamaEndpoint;
const DEFAULT_MODEL =
  process.env.DEEPSEEK_MODEL || process.env.OLLAMA_MODEL || 'deepseek-r1:latest';
const RAG_USE_OLLAMA = process.env.RAG_USE_OLLAMA !== 'false';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY || '';
const DEEPSEEK_BASE_URL = (
  process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1'
).replace(/\/$/, '');
const DEEPSEEK_REMOTE_MODEL = process.env.DEEPSEEK_REMOTE_MODEL || 'deepseek-chat';

const isConnectionError = error => {
  if (!error) return false;
  if (error.code === 'ECONNREFUSED') return true;
  if (error.cause) {
    if (error.cause.code === 'ECONNREFUSED') return true;
    if (Array.isArray(error.cause.errors)) {
      if (error.cause.errors.some(e => e && e.code === 'ECONNREFUSED')) return true;
    }
    if (error.cause.cause && error.cause.cause.code === 'ECONNREFUSED') return true;
  }
  const msg = String(error.message || error);
  return msg.includes('ECONNREFUSED') || msg.includes('fetch failed');
};

const normalizeContent = content => {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') return part;
        if (typeof part === 'object' && part !== null) {
          if (typeof part.text === 'string') return part.text;
          if (typeof part.content === 'string') return part.content;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof content === 'object') {
    if (typeof content.text === 'string') return content.text;
    if (Array.isArray(content.parts)) return normalizeContent(content.parts);
  }
  return String(content);
};

const buildOpenAiMessages = conversation =>
  conversation.map(msg => ({
    role: msg.role || 'user',
    content: normalizeContent(msg.content),
  }));

const streamWithOllama = async ({
  res,
  writeEvent,
  fullConversation,
  enableTools,
  selectedModel,
}) => {
  const prompt =
    fullConversation.map(m => `${m.role}: ${normalizeContent(m.content)}`).join('\n\n') +
    '\n\nassistant:';

  const requestPayload = {
    model: selectedModel,
    prompt,
    stream: true,
    options: {
      temperature: 0.7,
      num_ctx: 4096,
    },
  };

  let response;
  try {
    response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });
  } catch (error) {
    return { handled: false, error };
  }

  let wroteAny = false;
  const markWrite = payload => {
    wroteAny = true;
    writeEvent({ provider: 'ollama', ...payload });
  };

  if (!response.ok) {
    const text = await response.text().catch(() => '<non-text response>');
    const error = new Error('Ollama responded with non-success status');
    error.status = response.status;
    error.body = text;
    return { handled: false, error };
  }

  if (!response.body) {
    return { handled: false, error: new Error('Ollama response missing body') };
  }

  const decoder = new TextDecoder();
  let accumulatedResponse = '';
  let generationFinished = false;

  const processChunkText = async text => {
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.response) {
          accumulatedResponse += json.response;
          markWrite({ token: json.response });
        }
        if (json.done) {
          if (
            enableTools &&
            accumulatedResponse.includes('"tool"') &&
            accumulatedResponse.includes('"parameters"')
          ) {
            try {
              const toolCallMatch = accumulatedResponse.match(
                /\{[\s\S]*?"tool"[\s\S]*?"parameters"[\s\S]*?\}/
              );
              if (toolCallMatch) {
                const toolCall = JSON.parse(toolCallMatch[0]);
                markWrite({
                  toolCall: true,
                  tool: toolCall.tool,
                  thought: toolCall.thought || null,
                });

                const toolResult = await executeTool(toolCall.tool, toolCall.parameters);

                markWrite({ toolResult: true, result: toolResult });

                const followUpPrompt =
                  fullConversation
                    .map(m => `${m.role}: ${normalizeContent(m.content)}`)
                    .join('\n\n') +
                  `\n\nassistant: ${accumulatedResponse}\n\ntool_result: ${JSON.stringify(
                    toolResult
                  )}\n\nassistant:`;

                const followUpResponse = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: selectedModel,
                    prompt: followUpPrompt,
                    stream: true,
                    options: { temperature: 0.7, num_ctx: 4096 },
                  }),
                });

                if (followUpResponse.ok) {
                  const handleFollowUpChunk = chunk => {
                    const followUpLines = chunk.split('\n').filter(Boolean);
                    for (const l of followUpLines) {
                      try {
                        const fj = JSON.parse(l);
                        if (fj.response) {
                          accumulatedResponse += fj.response;
                          markWrite({ token: fj.response });
                        }
                      } catch (e) {
                        markWrite({ token: l });
                      }
                    }
                  };

                  if (
                    followUpResponse.body &&
                    typeof followUpResponse.body.getReader === 'function'
                  ) {
                    const fr = followUpResponse.body.getReader();
                    while (true) {
                      const { done, value } = await fr.read();
                      if (done) break;
                      const chunk = decoder.decode(value);
                      handleFollowUpChunk(chunk);
                    }
                  } else if (
                    followUpResponse.body &&
                    typeof followUpResponse.body[Symbol.asyncIterator] === 'function'
                  ) {
                    for await (const c of followUpResponse.body) {
                      const chunk = typeof c === 'string' ? c : decoder.decode(c);
                      handleFollowUpChunk(chunk);
                    }
                  } else {
                    const txt = await followUpResponse.text().catch(() => '');
                    if (txt) {
                      accumulatedResponse += txt;
                      markWrite({ token: txt });
                    }
                  }
                } else {
                  const errTxt = await followUpResponse.text().catch(() => '');
                  markWrite({
                    error: 'Follow-up generation failed',
                    details: errTxt,
                  });
                }
              }
            } catch (parseError) {
              console.error('[rag-fallback] Error parsing tool call:', parseError);
              markWrite({ error: 'Tool parsing failed', details: parseError.message });
            }
          }

          markWrite({ done: true });
          generationFinished = true;
        }
      } catch (e) {
        accumulatedResponse += line;
        markWrite({ token: line });
      }
    }
  };

  try {
    if (typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        await processChunkText(chunk);
      }
    } else if (typeof response.body[Symbol.asyncIterator] === 'function') {
      for await (const chunk of response.body) {
        const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk);
        await processChunkText(text);
      }
    } else if (typeof response.body.on === 'function') {
      await new Promise((resolve, reject) => {
        response.body.on('data', async c => {
          try {
            const text = typeof c === 'string' ? c : decoder.decode(c);
            await processChunkText(text);
          } catch (e) {
            console.error('[rag-fallback] stream data handler error', e);
          }
        });
        response.body.on('end', resolve);
        response.body.on('error', reject);
      });
    } else {
      const txt = await response.text().catch(() => '');
      if (txt) await processChunkText(txt);
    }
  } catch (streamErr) {
    console.error('[rag-fallback] Error consuming Ollama stream:', streamErr);
    if (wroteAny) {
      markWrite({ error: 'Stream consumption failed', details: streamErr.message });
      return { handled: true, success: false };
    }
    return { handled: false, error: streamErr };
  }

  if (!generationFinished) {
    markWrite({ done: true });
  }

  return { handled: true, success: true };
};

const streamWithDeepSeek = async ({ res, writeEvent, fullConversation }) => {
  if (!DEEPSEEK_API_KEY) {
    return { handled: false, reason: 'missing-key' };
  }

  let response;
  try {
    response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_REMOTE_MODEL,
        messages: buildOpenAiMessages(fullConversation),
        stream: true,
      }),
    });
  } catch (error) {
    return { handled: false, error };
  }

  let wroteAny = false;
  const markWrite = payload => {
    wroteAny = true;
    writeEvent({ provider: 'deepseek', ...payload });
  };

  if (!response.ok) {
    const text = await response.text().catch(() => '<non-text response>');
    const error = new Error('DeepSeek responded with non-success status');
    error.status = response.status;
    error.body = text;
    return { handled: false, error };
  }

  if (!response.body) {
    return { handled: false, error: new Error('DeepSeek response missing body') };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;

  const processChunk = chunk => {
    buffer += chunk;
    while (buffer.includes('\n\n')) {
      const idx = buffer.indexOf('\n\n');
      const rawEvent = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (!rawEvent) continue;

      const dataLines = rawEvent
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trim())
        .filter(Boolean);

      for (const data of dataLines) {
        if (!data) continue;
        if (data === '[DONE]') {
          markWrite({ done: true });
          finished = true;
          return;
        }

        try {
          const payload = JSON.parse(data);
          const choice = payload.choices && payload.choices[0];
          const delta = choice && choice.delta;
          if (delta && delta.content) {
            markWrite({ token: delta.content });
          }
          if (choice && choice.finish_reason && choice.finish_reason !== 'null') {
            markWrite({ done: true, reason: choice.finish_reason });
            finished = true;
            return;
          }
        } catch (err) {
          markWrite({ token: data });
        }
      }
    }
  };

  try {
    if (typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        processChunk(chunk);
        if (finished) break;
      }
    } else if (typeof response.body[Symbol.asyncIterator] === 'function') {
      for await (const value of response.body) {
        const chunk = typeof value === 'string' ? value : decoder.decode(value, { stream: true });
        processChunk(chunk);
        if (finished) break;
      }
    } else {
      const text = await response.text().catch(() => '');
      processChunk(text);
    }
  } catch (error) {
    if (wroteAny) {
      markWrite({ error: 'DeepSeek streaming failed', details: error.message });
      return { handled: true, success: false };
    }
    return { handled: false, error };
  }

  if (!finished) {
    markWrite({ done: true });
  }

  return { handled: true, success: true };
};
router.post('/chat/stream', async (req, res) => {
  try {
    const { message, messages, model, enableTools = true } = req.body || {};

    let conversationHistory = [];
    if (Array.isArray(messages) && messages.length) {
      conversationHistory = messages;
    } else if (message) {
      conversationHistory = [{ role: 'user', content: message }];
    } else {
      return res.status(400).json({ success: false, error: 'message or messages required' });
    }

    const selectedModel = model || DEFAULT_MODEL;

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    let wroteAny = false;
    const writeEvent = payload => {
      wroteAny = true;
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const systemPrompt = enableTools
      ? 'You are DeepSeek, an AI assistant with access to powerful tools for data mining and automation.\n\n' +
        'Available Tools:\n' +
        AGENT_TOOLS.map(
          tool =>
            '- ' +
            tool.name +
            ': ' +
            tool.description +
            '\n  Parameters: ' +
            JSON.stringify(tool.parameters.properties)
        ).join('\n') +
        '\n\nWhen you need to use a tool, respond with JSON in this format:\n' +
        '{\n' +
        '  "thought": "explanation of what you\'re doing",\n' +
        '  "tool": "tool_name",\n' +
        '  "parameters": { "param1": "value1" }\n' +
        '}\n\n' +
        'After the tool executes, you will receive the result and can continue the conversation.\n\n' +
        'You can create complete data mining configurations, start scraping operations, query databases, and more. Be proactive in offering to set up systems for users.'
      : '';

    const fullConversation = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory]
      : conversationHistory;

    let lastLocalError = null;
    let attemptedLocal = false;

    if (RAG_USE_OLLAMA) {
      attemptedLocal = true;
      const ollamaResult = await streamWithOllama({
        res,
        writeEvent,
        fullConversation,
        enableTools,
        selectedModel,
      });

      if (ollamaResult.handled) {
        if (!wroteAny) {
          writeEvent({ error: 'No response generated from Ollama', provider: 'ollama' });
        }
        res.end();
        return;
      }

      lastLocalError = ollamaResult.error || new Error('Unknown Ollama failure');

      if (!isConnectionError(lastLocalError)) {
        writeEvent({
          error: 'Ollama generate failed',
          details: lastLocalError.message || String(lastLocalError),
          provider: 'ollama',
        });
        res.end();
        return;
      }

      if (!DEEPSEEK_API_KEY) {
        writeEvent({
          error: 'RAG provider unavailable',
          details: lastLocalError.message || String(lastLocalError),
          provider: 'ollama',
        });
        res.end();
        return;
      }

      writeEvent({
        info: 'Switching to remote DeepSeek provider due to local Ollama unavailability.',
        provider: 'router',
      });
    }

    if (!DEEPSEEK_API_KEY) {
      const details = attemptedLocal
        ? lastLocalError && (lastLocalError.message || String(lastLocalError))
        : 'Configure OLLAMA_ENDPOINT or provide DEEPSEEK_API_KEY.';
      writeEvent({
        error: 'No RAG providers available',
        details,
        provider: 'router',
      });
      res.end();
      return;
    }

    const deepResult = await streamWithDeepSeek({ res, writeEvent, fullConversation });

    if (deepResult.handled) {
      res.end();
      return;
    }

    const deepError = deepResult.error || new Error('Unknown DeepSeek failure');
    writeEvent({
      error: 'Unable to complete request via DeepSeek',
      details: deepError.message || String(deepError),
      provider: 'deepseek',
    });
    res.end();
  } catch (err) {
    console.error('[rag-fallback] chat/stream failed:', err && (err.stack || err.message || err));
    try {
      res.write(
        `data: ${JSON.stringify({
          error: 'RAG proxy failed',
          details: err instanceof Error ? err.message : String(err),
          provider: 'router',
        })}\n\n`
      );
    } catch (writeErr) {
      console.error('[rag-fallback] failed to send error event:', writeErr);
    }
    try {
      res.end();
    } catch (endErr) {
      console.error('[rag-fallback] failed to end SSE response:', endErr);
    }
  }
});

router.get('/health', async (_req, res) => {
  const report = {
    status: 'ok',
    message: 'RAG fallback proxy is operational',
    endpoint: RAG_USE_OLLAMA ? OLLAMA_ENDPOINT : `${DEEPSEEK_BASE_URL}/chat/completions`,
    model: RAG_USE_OLLAMA ? DEFAULT_MODEL : DEEPSEEK_REMOTE_MODEL,
    providers: {
      ollama: {
        enabled: RAG_USE_OLLAMA,
        endpoint: OLLAMA_ENDPOINT,
        model: DEFAULT_MODEL,
      },
      deepseek: {
        configured: Boolean(DEEPSEEK_API_KEY),
        baseUrl: `${DEEPSEEK_BASE_URL}/chat/completions`,
        model: DEEPSEEK_REMOTE_MODEL,
      },
    },
  };

  if (RAG_USE_OLLAMA) {
    try {
      const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, { method: 'GET' });
      if (!response.ok) {
        report.status = 'warn';
        report.message = 'Ollama responded with non-success status';
        report.details = { status: response.status };
        report.providers.ollama.status = 'unreachable';
      } else {
        const tags = await response.json().catch(() => null);
        if (tags && Array.isArray(tags.models)) {
          report.availableModels = tags.models.map(model => model.name).filter(Boolean);
          report.modelAvailable = report.availableModels.includes(DEFAULT_MODEL);
          report.providers.ollama.status = report.modelAvailable ? 'ready' : 'model-missing';
          report.providers.ollama.availableModels = report.availableModels;
        }
      }
    } catch (error) {
      report.status = 'warn';
      report.message = 'Failed to reach Ollama endpoint';
      report.error = error instanceof Error ? error.message : String(error);
      report.providers.ollama.status = 'unreachable';
    }
  } else {
    report.providers.ollama.status = 'disabled';
  }

  report.providers.deepseek.status = DEEPSEEK_API_KEY ? 'configured' : 'missing-key';

  const statusCode = report.status === 'ok' ? 200 : report.status === 'warn' ? 206 : 503;
  res.status(statusCode).json(report);
});

// Get available tools
router.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: AGENT_TOOLS,
    count: AGENT_TOOLS.length,
  });
});

export default router;
