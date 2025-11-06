/**
 * useOllamaChat Hook
 * React hook for managing Ollama DeepSeek chat conversations
 * Handles WebSocket streaming, message history, and tool calling
 */

import { useState, useEffect, useCallback, useRef } from 'useState', useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:3001/api/ollama';
const OLLAMA_WS_URL = import.meta.env.VITE_OLLAMA_WS_URL || 'ws://localhost:3001';

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface UseOllamaChatOptions {
  streamingEnabled?: boolean;
  toolsEnabled?: boolean;
  onWorkflowCreated?: (workflow: any) => void;
  onDataMiningStarted?: (campaign: any) => void;
}

export const useOllamaChat = (options: UseOllamaChatOptions = {}) => {
  const {
    streamingEnabled = true,
    toolsEnabled = true,
    onWorkflowCreated,
    onDataMiningStarted,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingChunk, setStreamingChunk] = useState('');
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!streamingEnabled) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(OLLAMA_WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'chunk':
                setStreamingChunk((prev) => prev + data.content);
                break;

              case 'tool_call':
                setToolCalls((prev) => [...prev, data.tool]);
                if (data.tool.name === 'create_workflow' && onWorkflowCreated) {
                  onWorkflowCreated(data.result);
                }
                if (data.tool.name === 'create_data_mining_campaign' && onDataMiningStarted) {
                  onDataMiningStarted(data.result);
                }
                break;

              case 'complete':
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: data.content || streamingChunk,
                    tool_calls: data.tool_calls,
                  },
                ]);
                setStreamingChunk('');
                setIsStreaming(false);
                break;

              case 'error':
                console.error('Streaming error:', data.error);
                setIsStreaming(false);
                setStreamingChunk('');
                break;
            }
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [streamingEnabled]);

  // Send message via WebSocket or HTTP
  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);

      if (streamingEnabled && wsRef.current && isConnected) {
        // Send via WebSocket for streaming
        setIsStreaming(true);
        setStreamingChunk('');

        wsRef.current.send(
          JSON.stringify({
            type: conversationId ? 'send' : 'start',
            message: content,
            conversationId,
            tools: toolsEnabled,
          })
        );

        if (!conversationId) {
          setConversationId(Date.now().toString());
        }
      } else {
        // Fallback to HTTP
        try {
          setIsStreaming(true);
          const response = await axios.post(`${OLLAMA_API_URL}/chat`, {
            message: content,
            conversationId,
            tools: toolsEnabled,
          });

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: response.data.response,
              tool_calls: response.data.tool_calls,
            },
          ]);

          if (response.data.tool_calls) {
            setToolCalls((prev) => [...prev, ...response.data.tool_calls]);
          }

          if (!conversationId && response.data.conversationId) {
            setConversationId(response.data.conversationId);
          }
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error;
        } finally {
          setIsStreaming(false);
        }
      }
    },
    [streamingEnabled, isConnected, conversationId, toolsEnabled]
  );

  // Clear conversation
  const clearConversation = useCallback(async () => {
    if (conversationId) {
      try {
        await axios.delete(`${OLLAMA_API_URL}/conversation/${conversationId}`);
      } catch (error) {
        console.error('Failed to clear conversation:', error);
      }
    }

    setMessages([]);
    setToolCalls([]);
    setStreamingChunk('');
    setConversationId(null);
  }, [conversationId]);

  // Get conversation history
  const getConversationHistory = useCallback(async () => {
    if (!conversationId) return [];

    try {
      const response = await axios.get(`${OLLAMA_API_URL}/conversation/${conversationId}`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }, [conversationId]);

  return {
    messages,
    isStreaming,
    isConnected,
    streamingChunk,
    toolCalls,
    conversationId,
    sendMessage,
    clearConversation,
    getConversationHistory,
  };
};

export default useOllamaChat;
