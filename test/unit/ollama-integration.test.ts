/**
 * Ollama Integration Unit Tests
 * Tests for OllamaDeepSeekIntegration service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OllamaDeepSeekIntegration } from '../../src/ai/OllamaDeepSeekIntegration';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OllamaDeepSeekIntegration', () => {
  let ollama: OllamaDeepSeekIntegration;

  beforeEach(() => {
    ollama = new OllamaDeepSeekIntegration({
      endpoint: 'http://localhost:11434',
      model: 'deepseek-r1',
      temperature: 0.7,
      streamingEnabled: true,
      toolsEnabled: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully when Ollama is available', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { status: 'ok' } });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          models: [{ name: 'deepseek-r1' }],
        },
      });

      await expect(ollama.initialize()).resolves.not.toThrow();
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    });

    it('should throw error when Ollama is not available', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(ollama.initialize()).rejects.toThrow();
    });

    it('should throw error when model is not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { status: 'ok' } });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          models: [{ name: 'other-model' }],
        },
      });

      await expect(ollama.initialize()).rejects.toThrow('Model deepseek-r1 not found');
    });
  });

  describe('chat', () => {
    it('should send chat message successfully', async () => {
      const mockResponse = {
        data: {
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you?',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const response = await ollama.chat('Hello');
      
      expect(response).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          model: 'deepseek-r1',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: 'Hello',
            }),
          ]),
        })
      );
    });

    it('should include tools when toolsEnabled is true', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await ollama.chat('Create a workflow');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tools: expect.arrayContaining([
            expect.objectContaining({
              type: 'function',
              function: expect.objectContaining({
                name: 'create_workflow',
              }),
            }),
          ]),
        })
      );
    });

    it('should maintain conversation history', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          message: {
            role: 'assistant',
            content: 'Response',
          },
        },
      });

      await ollama.chat('First message');
      await ollama.chat('Second message');

      const history = ollama.getConversationHistory();
      expect(history).toHaveLength(4); // 2 user + 2 assistant messages
    });
  });

  describe('tool calling', () => {
    it('should register custom tools', () => {
      const customTool = {
        type: 'function' as const,
        function: {
          name: 'custom_tool',
          description: 'A custom tool',
          parameters: {
            type: 'object' as const,
            properties: {},
            required: [],
          },
        },
      };

      ollama.registerTool(customTool, async () => ({ success: true }));

      const tools = ollama.getRegisteredTools();
      expect(tools).toContainEqual(customTool);
    });

    it('should execute tool when called by AI', async () => {
      const toolHandler = vi.fn().mockResolvedValue({ result: 'success' });
      const workflowTool = ollama.getRegisteredTools().find(
        (t) => t.function.name === 'create_workflow'
      );

      if (workflowTool) {
        ollama.registerTool(workflowTool, toolHandler);

        mockedAxios.post.mockResolvedValueOnce({
          data: {
            message: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: 'call_1',
                  type: 'function',
                  function: {
                    name: 'create_workflow',
                    arguments: JSON.stringify({ name: 'Test Workflow' }),
                  },
                },
              ],
            },
          },
        });

        await ollama.chat('Create a workflow');

        expect(toolHandler).toHaveBeenCalled();
      }
    });
  });

  describe('streaming', () => {
    it('should emit chunks during streaming', async () => {
      const chunks: string[] = [];
      
      ollama.on('chunk', (chunk) => {
        chunks.push(chunk);
      });

      // Mock streaming response
      const mockStream = {
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify({ message: { content: 'Hello ' } }) + '\n');
            handler(JSON.stringify({ message: { content: 'World' } }) + '\n');
            handler(JSON.stringify({ done: true }) + '\n');
          }
          if (event === 'end') {
            handler();
          }
        }),
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockStream });

      await ollama.streamChat('Hello');

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('conversation management', () => {
    it('should clear conversation history', () => {
      ollama.chat('Message 1');
      ollama.chat('Message 2');
      
      expect(ollama.getConversationHistory()).toHaveLength(4);

      ollama.clearConversation();

      expect(ollama.getConversationHistory()).toHaveLength(0);
    });

    it('should manage multiple conversations', () => {
      const convId1 = 'conv1';
      const convId2 = 'conv2';

      ollama.chat('Message in conv 1', { conversationId: convId1 });
      ollama.chat('Message in conv 2', { conversationId: convId2 });

      expect(ollama.getConversationHistory(convId1)).toHaveLength(2);
      expect(ollama.getConversationHistory(convId2)).toHaveLength(2);
    });
  });
});
