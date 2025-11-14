import express from 'express';
import { AGENT_TOOLS, executeTool } from './agent-tools.js';

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

// Streaming chat endpoint for real-time responses with tool support
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

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
      const text = await response.text();
      res.write(`data: ${JSON.stringify({ error: 'Ollama generate failed', details: text })}\n\n`);
      return res.end();
    }

    // Stream the response chunks and detect tool calls
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = '';
    let toolCallDetected = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            accumulatedResponse += json.response;
            res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
          }
          if (json.done) {
            // Check if the response contains a tool call
            if (
              enableTools &&
              accumulatedResponse.includes('"tool"') &&
              accumulatedResponse.includes('"parameters"')
            ) {
              try {
                // Extract JSON tool call from response
                const toolCallMatch = accumulatedResponse.match(
                  /\{[\s\S]*?"tool"[\s\S]*?"parameters"[\s\S]*?\}/
                );
                if (toolCallMatch) {
                  const toolCall = JSON.parse(toolCallMatch[0]);

                  // Signal tool execution
                  res.write(
                    `data: ${JSON.stringify({
                      toolCall: true,
                      tool: toolCall.tool,
                      thought: toolCall.thought,
                    })}\n\n`
                  );

                  // Execute the tool
                  const toolResult = await executeTool(toolCall.tool, toolCall.parameters);

                  // Send tool result back
                  res.write(
                    `data: ${JSON.stringify({
                      toolResult: true,
                      result: toolResult,
                    })}\n\n`
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
                    const followUpReader = followUpResponse.body.getReader();
                    while (true) {
                      const { done: followUpDone, value: followUpValue } =
                        await followUpReader.read();
                      if (followUpDone) break;

                      const followUpChunk = decoder.decode(followUpValue);
                      const followUpLines = followUpChunk.split('\n').filter(line => line.trim());

                      for (const followUpLine of followUpLines) {
                        try {
                          const followUpJson = JSON.parse(followUpLine);
                          if (followUpJson.response) {
                            res.write(
                              `data: ${JSON.stringify({ token: followUpJson.response })}\n\n`
                            );
                          }
                        } catch (e) {
                          // Skip invalid JSON
                        }
                      }
                    }
                  }

                  toolCallDetected = true;
                }
              } catch (parseError) {
                console.error('Error parsing tool call:', parseError);
              }
            }

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

// Get available tools
router.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: AGENT_TOOLS,
    count: AGENT_TOOLS.length,
  });
});

export default router;
