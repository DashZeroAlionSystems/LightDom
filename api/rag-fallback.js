import express from 'express';
import { AGENT_TOOLS, executeTool } from './agent-tools.js';

const router = express.Router();

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11500';
const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || process.env.OLLAMA_MODEL || 'deepseek-coder';
router.post('/chat/stream', async (req, res) => {
  try {
    const { message, messages, model, enableTools = true } = req.body || {};

    // Support both 'message' (single string) and 'messages' (array) formats
    let conversationHistory = [];
    if (messages && Array.isArray(messages)) {
      conversationHistory = messages;
    } else if (message) {
      conversationHistory = [{ role: 'user', content: message }];
    } else {
      return res.status(400).json({ success: false, error: 'message or messages required' });
    }

    const selectedModel = model || DEFAULT_MODEL;

    // Set headers for streaming (SSE)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    // Enhanced system prompt with tool awareness
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

    // Build conversation with system prompt
    const fullConversation = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory]
      : conversationHistory;

    // Convert to prompt format for Ollama
    const prompt =
      fullConversation.map(m => `${m.role}: ${m.content}`).join('\n\n') + '\n\nassistant:';

    const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        stream: true,
        options: {
          temperature: 0.7,
          num_ctx: 4096, // Larger context for tool descriptions
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '<non-text response>');
      console.error('[rag-fallback] Ollama responded with non-OK:', response.status, text);
      res.write(`data: ${JSON.stringify({ error: 'Ollama generate failed', details: text })}\n\n`);
      return res.end();
    }

    // Robust streaming consumption that works across Node/Undici web streams and Node readable streams
    const decoder = new TextDecoder();
    let accumulatedResponse = '';

    const processChunkText = async text => {
      const lines = text.split('\n').filter(line => line.trim());
      for (const line of lines) {
        // Try parse JSON token-style lines, otherwise send raw token
        try {
          const json = JSON.parse(line);
          if (json.response) {
            accumulatedResponse += json.response;
            res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
          }
          if (json.done) {
            // detect and handle tool calls
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
                  res.write(
                    `data: ${JSON.stringify({ toolCall: true, tool: toolCall.tool, thought: toolCall.thought })}\n\n`
                  );

                  const toolResult = await executeTool(toolCall.tool, toolCall.parameters);

                  res.write(
                    `data: ${JSON.stringify({ toolResult: true, result: toolResult })}\n\n`
                  );

                  // Continue conversation with tool result
                  const followUpPrompt =
                    fullConversation.map(m => `${m.role}: ${m.content}`).join('\n\n') +
                    `\n\nassistant: ${accumulatedResponse}\n\ntool_result: ${JSON.stringify(toolResult)}\n\nassistant:`;

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
                    // consume follow-up stream
                    if (
                      followUpResponse.body &&
                      typeof followUpResponse.body.getReader === 'function'
                    ) {
                      const fr = followUpResponse.body.getReader();
                      while (true) {
                        const { done, value } = await fr.read();
                        if (done) break;
                        const chunk = decoder.decode(value);
                        const followUpLines = chunk.split('\n').filter(Boolean);
                        for (const l of followUpLines) {
                          try {
                            const fj = JSON.parse(l);
                            if (fj.response)
                              res.write(`data: ${JSON.stringify({ token: fj.response })}\n\n`);
                          } catch (e) {
                            // ignore non-json
                          }
                        }
                      }
                    } else if (
                      followUpResponse.body &&
                      typeof followUpResponse.body[Symbol.asyncIterator] === 'function'
                    ) {
                      for await (const c of followUpResponse.body) {
                        const chunk = typeof c === 'string' ? c : decoder.decode(c);
                        const followUpLines = chunk.split('\n').filter(Boolean);
                        for (const l of followUpLines) {
                          try {
                            const fj = JSON.parse(l);
                            if (fj.response)
                              res.write(`data: ${JSON.stringify({ token: fj.response })}\n\n`);
                          } catch (e) {}
                        }
                      }
                    } else {
                      const txt = await followUpResponse.text().catch(() => '');
                      if (txt) res.write(`data: ${JSON.stringify({ token: txt })}\n\n`);
                    }
                  }
                }
              } catch (parseError) {
                console.error('[rag-fallback] Error parsing tool call:', parseError);
              }
            }

            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          }
        } catch (e) {
          // not JSON — treat as raw token
          try {
            accumulatedResponse += line;
            res.write(`data: ${JSON.stringify({ token: line })}\n\n`);
          } catch (inner) {
            // last resort: log and continue
            console.error('[rag-fallback] Failed to write token chunk', inner);
          }
        }
      }
    };

    try {
      if (response.body && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          await processChunkText(chunk);
        }
      } else if (response.body && typeof response.body[Symbol.asyncIterator] === 'function') {
        for await (const chunk of response.body) {
          const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk);
          await processChunkText(text);
        }
      } else if (response.body && typeof response.body.on === 'function') {
        // Node.js readable stream
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
        // Fallback: read whole text
        const txt = await response.text().catch(() => '');
        if (txt) await processChunkText(txt);
      }
    } catch (streamErr) {
      console.error('[rag-fallback] Error consuming Ollama stream:', streamErr);
      res.write(
        `data: ${JSON.stringify({ error: 'Stream consumption failed', details: streamErr.message })}\n\n`
      );
    }

    res.end();
  } catch (err) {
    console.error('[rag-fallback] chat/stream failed:', err && (err.stack || err.message || err));
    // Send an SSE error and end
    try {
      res.write(
        `data: ${JSON.stringify({ error: 'Unable to reach Ollama', details: err.message })}\n\n`
      );
    } catch (e) {
      // ignore write errors
    }
    try {
      res.end();
    } catch (e) {}
  }
});

router.get('/health', async (_req, res) => {
  const report = {
    status: 'ok',
    message: 'RAG fallback proxy is operational',
    endpoint: OLLAMA_ENDPOINT,
    model: DEFAULT_MODEL,
  };

  try {
    const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, { method: 'GET' });
    if (!response.ok) {
      report.status = 'warn';
      report.message = 'Ollama responded with non-success status';
      report.details = { status: response.status };
    } else {
      const tags = await response.json().catch(() => null);
      if (tags && Array.isArray(tags.models)) {
        report.availableModels = tags.models.map(model => model.name).filter(Boolean);
        report.modelAvailable = report.availableModels.includes(DEFAULT_MODEL);
      }
    }
  } catch (error) {
    report.status = 'warn';
    report.message = 'Failed to reach Ollama endpoint';
    report.error = error instanceof Error ? error.message : String(error);
  }

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
