/**
 * DeepSeek Chat Streaming API
 * 
 * Handles real-time streaming conversations with DeepSeek
 * Generates schemas and components on-the-fly
 */

import { Router, Request, Response } from 'express';
import { PromptToSchemaGenerator } from '../services/ai/PromptToSchemaGenerator.js';
import { Pool } from 'pg';

export function createDeepSeekChatRoutes(db: Pool, deepseekConfig: any): Router {
  const router = Router();
  const schemaGenerator = new PromptToSchemaGenerator(db);

  /**
   * POST /api/deepseek/chat/stream
   * Stream conversation with DeepSeek with real-time feedback
   */
  router.post('/chat/stream', async (req: Request, res: Response) => {
    const { prompt, model = 'deepseek-r1', conversation = [] } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Set up SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Helper function to send SSE data
    const sendEvent = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    try {
      // Step 1: Analyze the prompt
      sendEvent('status', { message: 'Analyzing prompt...' });

      // Build conversation context
      const messages = [
        {
          role: 'system',
          content: `You are an expert AI assistant for the LightDom platform. You help users create workflows, schemas, and components.
          
When analyzing prompts:
1. Break down the request into clear steps
2. Generate appropriate schemas using JSON Schema format
3. Create workflow tasks with dependencies
4. Suggest UI components when applicable

Always structure your responses with clear sections and use JSON where appropriate.`
        },
        ...conversation,
        {
          role: 'user',
          content: prompt
        }
      ];

      // Step 2: Call DeepSeek API (or Ollama for local)
      const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
      
      sendEvent('status', { message: 'Calling DeepSeek...' });

      const deepseekResponse = await fetch(`${ollamaEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: true
        })
      });

      if (!deepseekResponse.ok) {
        throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`);
      }

      const reader = deepseekResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body from DeepSeek');
      }

      let fullResponse = '';
      let thinkingBuffer = '';
      let responseBuffer = '';

      // Step 3: Stream the response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.message?.content) {
              const content = parsed.message.content;
              fullResponse += content;

              // Send content chunk
              sendEvent('content', { content });

              // Check for thinking tags
              if (content.includes('<think>')) {
                thinkingBuffer += content;
              } else if (content.includes('</think>')) {
                thinkingBuffer += content;
                // Extract thinking content
                const thinkMatch = thinkingBuffer.match(/<think>(.*?)<\/think>/s);
                if (thinkMatch) {
                  sendEvent('thinking', { content: thinkMatch[1].trim() });
                }
                thinkingBuffer = '';
              } else if (thinkingBuffer) {
                thinkingBuffer += content;
              } else {
                responseBuffer += content;
              }
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
      }

      // Step 4: Analyze response for schemas and components
      sendEvent('status', { message: 'Analyzing response for schemas...' });

      try {
        // Check if the response contains workflow/schema keywords
        const needsSchema = /workflow|schema|component|task|pipeline/i.test(fullResponse);

        if (needsSchema) {
          // Generate schema from the prompt
          const workflow = await schemaGenerator.generateFromPrompt(prompt);

          // Send generated schema
          sendEvent('schema', {
            schema: {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              tasks: workflow.tasks,
              schemas: workflow.schemas
            }
          });

          // Check if we should generate components
          const needsComponent = /component|ui|interface|form|dashboard/i.test(fullResponse);
          
          if (needsComponent && workflow.tasks.length > 0) {
            // Generate component suggestion
            const componentTask = workflow.tasks.find(t => 
              t.type === 'ui' || t.name.toLowerCase().includes('component')
            );

            if (componentTask) {
              sendEvent('component', {
                component: {
                  name: componentTask.name,
                  type: 'react',
                  description: componentTask.description,
                  schema: componentTask.schema
                }
              });
            }
          }
        }
      } catch (schemaError) {
        console.error('Schema generation error:', schemaError);
        sendEvent('warning', { message: 'Could not auto-generate schema' });
      }

      // Step 5: Complete
      sendEvent('complete', { 
        message: 'Response complete',
        totalLength: fullResponse.length
      });

      res.write('data: [DONE]\n\n');
      res.end();

    } catch (error) {
      console.error('Streaming error:', error);
      sendEvent('error', { 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      res.end();
    }
  });

  /**
   * POST /api/deepseek/chat
   * Non-streaming chat endpoint
   */
  router.post('/chat', async (req: Request, res: Response) => {
    const { prompt, model = 'deepseek-r1', conversation = [] } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert AI assistant for the LightDom platform.'
        },
        ...conversation,
        {
          role: 'user',
          content: prompt
        }
      ];

      const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
      
      const response = await fetch(`${ollamaEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const result = await response.json();

      res.json({
        success: true,
        response: result.message?.content || '',
        model: result.model,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/deepseek/models
   * List available models
   */
  router.get('/models', async (req: Request, res: Response) => {
    try {
      const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
      
      const response = await fetch(`${ollamaEndpoint}/api/tags`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();

      res.json({
        success: true,
        models: data.models || []
      });

    } catch (error) {
      console.error('Models error:', error);
      res.json({
        success: true,
        models: [
          { name: 'deepseek-r1', description: 'DeepSeek R1 - Reasoning model' },
          { name: 'deepseek-chat', description: 'DeepSeek Chat - Conversational model' }
        ]
      });
    }
  });

  return router;
}
