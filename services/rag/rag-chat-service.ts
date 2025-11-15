/**
 * RAG Chat Service with DeepSeek Integration
 *
 * Provides persistent chat functionality with:
 * - Vector store for context retrieval
 * - DeepSeek/Ollama streaming
 * - Conversation history management
 * - Auto-reconnect capabilities
 */

import axios, { AxiosInstance } from 'axios';
import EventEmitter from 'events';

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-r1:latest';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class RAGChatService extends EventEmitter {
  private client: AxiosInstance;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private isConnected = false;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: OLLAMA_ENDPOINT,
      timeout: 60000,
    });

    this.checkConnection();
  }

  private async checkConnection() {
    try {
      await this.client.get('/api/tags');
      this.isConnected = true;
      this.emit('connected');
      console.log('✅ RAG Chat Service connected to Ollama');
    } catch (error) {
      this.isConnected = false;
      this.emit('disconnected');
      console.error('❌ RAG Chat Service connection failed');

      // Retry connection
      setTimeout(() => this.checkConnection(), 5000);
    }
  }

  async chat(conversationId: string, message: string, options: ChatOptions = {}): Promise<string> {
    if (!this.isConnected) {
      throw new Error('RAG Chat Service is not connected');
    }

    // Get or create conversation history
    const history = this.conversationHistory.get(conversationId) || [];

    // Add system prompt if provided
    const messages: ChatMessage[] = [...history];
    if (options.systemPrompt && messages.length === 0) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: message,
    });

    try {
      const response = await this.client.post('/api/chat', {
        model: DEEPSEEK_MODEL,
        messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens,
        },
      });

      const assistantMessage = response.data.message.content;

      // Update conversation history
      messages.push({
        role: 'assistant',
        content: assistantMessage,
      });
      this.conversationHistory.set(conversationId, messages);

      return assistantMessage;
    } catch (error: any) {
      console.error('Chat error:', error.message);
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }

  async *streamChat(
    conversationId: string,
    message: string,
    options: ChatOptions = {}
  ): AsyncGenerator<string> {
    if (!this.isConnected) {
      throw new Error('RAG Chat Service is not connected');
    }

    const history = this.conversationHistory.get(conversationId) || [];
    const messages: ChatMessage[] = [...history];

    if (options.systemPrompt && messages.length === 0) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: message,
    });

    try {
      const response = await this.client.post(
        '/api/chat',
        {
          model: DEEPSEEK_MODEL,
          messages,
          stream: true,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.maxTokens,
          },
        },
        {
          responseType: 'stream',
        }
      );

      let fullResponse = '';

      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullResponse += data.message.content;
              yield data.message.content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      // Update conversation history
      messages.push({
        role: 'assistant',
        content: fullResponse,
      });
      this.conversationHistory.set(conversationId, messages);
    } catch (error: any) {
      console.error('Stream chat error:', error.message);
      throw new Error(`Failed to stream response: ${error.message}`);
    }
  }

  clearConversation(conversationId: string) {
    this.conversationHistory.delete(conversationId);
  }

  getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      endpoint: OLLAMA_ENDPOINT,
      model: DEEPSEEK_MODEL,
      activeConversations: this.conversationHistory.size,
    };
  }
}

// Export singleton instance
export const ragChatService = new RAGChatService();
