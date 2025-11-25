/**
 * useUnifiedRAG - React hook for unified RAG integration
 * 
 * Provides seamless integration between the PromptInput component
 * and the unified RAG service.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface RAGConfig {
  mode: 'assistant' | 'developer' | 'codebase';
  includeDatabase: boolean;
  includeCodebase: boolean;
  temperature?: number;
  maxTokens?: number;
  topK?: number;
}

export interface RAGHealth {
  status: 'healthy' | 'degraded' | 'error' | 'initializing';
  llm?: {
    status: string;
    provider?: string;
    model?: string;
  };
  vectorStore?: {
    status: string;
  };
}

export interface UseUnifiedRAGOptions {
  apiBase?: string;
  conversationId?: string;
  config?: Partial<RAGConfig>;
  autoHealthCheck?: boolean;
}

export interface UseUnifiedRAGResult {
  // State
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  health: RAGHealth | null;
  currentConfig: RAGConfig;
  
  // Actions
  sendPrompt: (prompt: string) => Promise<void>;
  streamPrompt: (prompt: string, onChunk: (chunk: string) => void) => Promise<void>;
  clearConversation: () => void;
  updateConfig: (config: Partial<RAGConfig>) => void;
  checkHealth: () => Promise<RAGHealth>;
  
  // Context
  lastRetrievedDocs: unknown[];
}

const DEFAULT_CONFIG: RAGConfig = {
  mode: 'assistant',
  includeDatabase: true,
  includeCodebase: true,
  temperature: 0.7,
  maxTokens: 4096,
  topK: 5,
};

export function useUnifiedRAG(options: UseUnifiedRAGOptions = {}): UseUnifiedRAGResult {
  const {
    apiBase = '/api/unified-rag',
    conversationId: initialConversationId,
    config: initialConfig,
    autoHealthCheck = true,
  } = options;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<RAGHealth | null>(null);
  const [currentConfig, setCurrentConfig] = useState<RAGConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const [lastRetrievedDocs, setLastRetrievedDocs] = useState<unknown[]>([]);

  // Refs
  const conversationIdRef = useRef(initialConversationId || `conv-${Date.now()}`);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Health check
  const checkHealth = useCallback(async (): Promise<RAGHealth> => {
    try {
      const response = await fetch(`${apiBase}/health`);
      const data = await response.json();
      setHealth(data);
      return data;
    } catch (err) {
      const errorHealth: RAGHealth = {
        status: 'error',
        llm: { status: 'unknown' },
        vectorStore: { status: 'unknown' },
      };
      setHealth(errorHealth);
      return errorHealth;
    }
  }, [apiBase]);

  // Auto health check on mount
  useEffect(() => {
    if (autoHealthCheck) {
      checkHealth();
      
      // Periodic health checks every 30 seconds
      const interval = setInterval(checkHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [autoHealthCheck, checkHealth]);

  // Send prompt (non-streaming)
  const sendPrompt = useCallback(async (prompt: string): Promise<void> => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationId: conversationIdRef.current,
          mode: currentConfig.mode,
          includeDatabase: currentConfig.includeDatabase,
          includeCodebase: currentConfig.includeCodebase,
          temperature: currentConfig.temperature,
          maxTokens: currentConfig.maxTokens,
          topK: currentConfig.topK,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.retrieved) {
        setLastRetrievedDocs(data.retrieved);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, currentConfig]);

  // Stream prompt
  const streamPrompt = useCallback(async (
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    if (!prompt.trim()) return;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    let fullResponse = '';

    try {
      const response = await fetch(`${apiBase}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationId: conversationIdRef.current,
          mode: currentConfig.mode,
          includeDatabase: currentConfig.includeDatabase,
          includeCodebase: currentConfig.includeCodebase,
          temperature: currentConfig.temperature,
          maxTokens: currentConfig.maxTokens,
          topK: currentConfig.topK,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'chunk') {
              fullResponse += parsed.content;
              onChunk(parsed.content);
            } else if (parsed.type === 'context') {
              setLastRetrievedDocs(parsed.retrieved || []);
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error);
            }
          } catch (parseError) {
            // Skip unparseable lines
          }
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiBase, currentConfig]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages([]);
    setError(null);
    setLastRetrievedDocs([]);

    // Generate new conversation ID
    conversationIdRef.current = `conv-${Date.now()}`;

    // Clear on server
    fetch(`${apiBase}/conversation/${conversationIdRef.current}`, {
      method: 'DELETE',
    }).catch(() => {
      // Ignore errors when clearing
    });
  }, [apiBase]);

  // Update config
  const updateConfig = useCallback((config: Partial<RAGConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...config }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    health,
    currentConfig,
    sendPrompt,
    streamPrompt,
    clearConversation,
    updateConfig,
    checkHealth,
    lastRetrievedDocs,
  };
}

export default useUnifiedRAG;
