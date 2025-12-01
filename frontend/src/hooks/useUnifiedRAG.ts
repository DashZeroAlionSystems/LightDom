/**
 * useUnifiedRAG - React hook for unified RAG integration
 * 
 * Provides seamless integration between the PromptInput component
 * and the unified RAG service.
 * 
 * Enhanced Features:
 * - Multimodal support (images via DeepSeek OCR)
 * - Hybrid search (keyword + semantic)
 * - Document versioning
 * - Streaming tool execution
 * - Agent mode with planning
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface RAGConfig {
  mode: 'assistant' | 'developer' | 'codebase' | 'agent';
  includeDatabase: boolean;
  includeCodebase: boolean;
  hybridSearch?: boolean;
  temperature?: number;
  maxTokens?: number;
  topK?: number;
}

export interface RAGFeatures {
  multimodal: {
    enabled: boolean;
    ocrEndpoint?: string;
    supportedTypes?: string[];
  };
  hybridSearch: {
    enabled: boolean;
    semanticWeight?: number;
    keywordWeight?: number;
  };
  versioning: {
    enabled: boolean;
    maxVersions?: number;
  };
  agent: {
    enabled: boolean;
    planningEnabled?: boolean;
    availableTools?: string[];
    maxSteps?: number;
  };
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
  ocr?: {
    status: string;
    endpoint?: string;
  };
  agent?: {
    status: string;
    planningEnabled?: boolean;
    availableTools?: string[];
  };
  features?: RAGFeatures;
}

export interface AgentEvent {
  type: 'planning_start' | 'planning_complete' | 'step_start' | 'step_complete' | 'plan_complete' | 'plan_aborted' | 'error';
  step?: number;
  action?: string;
  tool?: string;
  success?: boolean;
  result?: unknown;
  error?: string;
  plan?: unknown[];
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
  features: RAGFeatures | null;
  currentConfig: RAGConfig;
  
  // Actions
  sendPrompt: (prompt: string) => Promise<void>;
  streamPrompt: (prompt: string, onChunk: (chunk: string) => void) => Promise<void>;
  clearConversation: () => void;
  updateConfig: (config: Partial<RAGConfig>) => void;
  checkHealth: () => Promise<RAGHealth>;
  
  // Enhanced Actions (NEW)
  indexImage: (file: File, options?: { title?: string; language?: string }) => Promise<{ documentId: string; chunksIndexed: number }>;
  hybridSearch: (query: string, options?: { limit?: number; semanticWeight?: number; keywordWeight?: number }) => Promise<unknown[]>;
  getDocumentVersions: (documentId: string) => Promise<unknown[]>;
  executeAgentTask: (task: string, context?: Record<string, unknown>) => Promise<unknown>;
  streamAgentTask: (task: string, onEvent: (event: AgentEvent) => void, context?: Record<string, unknown>) => Promise<void>;
  
  // Docling Document Conversion (NEW)
  convertDocument: (file: File, options?: { title?: string; chunkSize?: number; extractTables?: boolean }) => Promise<ConversionResult>;
  convertFromUrl: (url: string, options?: { title?: string; chunkSize?: number }) => Promise<ConversionResult>;
  getSupportedFormats: () => Promise<SupportedFormats>;
  
  // Context
  lastRetrievedDocs: unknown[];
}

export interface ConversionResult {
  success: boolean;
  documentId?: string;
  chunksIndexed?: number;
  version?: number;
  conversion?: {
    format: string;
    markdown?: string;
    tables?: unknown[];
    figures?: unknown[];
    sections?: unknown[];
  };
  error?: string;
}

export interface SupportedFormats {
  formats: Record<string, string[]>;
  all_mimetypes: string[];
  doclingEnabled: boolean;
}

const DEFAULT_CONFIG: RAGConfig = {
  mode: 'assistant',
  includeDatabase: true,
  includeCodebase: true,
  hybridSearch: false,
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

  // ==================== NEW ENHANCED FUNCTIONS ====================

  // Features state
  const [features, setFeatures] = useState<RAGFeatures | null>(null);

  // Fetch features on mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch(`${apiBase}/features`);
        if (response.ok) {
          const data = await response.json();
          setFeatures(data.features);
        } else {
          console.warn('Failed to fetch RAG features:', response.status);
          // Set default features to indicate unavailable state
          setFeatures({
            multimodal: { enabled: false },
            hybridSearch: { enabled: false },
            versioning: { enabled: false },
            agent: { enabled: false },
          });
        }
      } catch (err) {
        console.warn('Error fetching RAG features:', err instanceof Error ? err.message : 'Unknown error');
        // Set default features to indicate unavailable state
        setFeatures({
          multimodal: { enabled: false },
          hybridSearch: { enabled: false },
          versioning: { enabled: false },
          agent: { enabled: false },
        });
      }
    };
    fetchFeatures();
  }, [apiBase]);

  // Index image using OCR (NEW)
  const indexImage = useCallback(async (
    file: File,
    options?: { title?: string; language?: string }
  ): Promise<{ documentId: string; chunksIndexed: number }> => {
    const formData = new FormData();
    formData.append('image', file);
    if (options?.title) formData.append('title', options.title);
    if (options?.language) formData.append('language', options.language);

    const response = await fetch(`${apiBase}/index/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Image indexing failed');
    }

    return response.json();
  }, [apiBase]);

  // Hybrid search (NEW)
  const hybridSearch = useCallback(async (
    query: string,
    options?: { limit?: number; semanticWeight?: number; keywordWeight?: number }
  ): Promise<unknown[]> => {
    const response = await fetch(`${apiBase}/search/hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...options }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Hybrid search failed');
    }

    const data = await response.json();
    return data.results;
  }, [apiBase]);

  // Get document versions (NEW)
  const getDocumentVersions = useCallback(async (documentId: string): Promise<unknown[]> => {
    const response = await fetch(`${apiBase}/document/${encodeURIComponent(documentId)}/versions`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get document versions');
    }

    const data = await response.json();
    return data.versions;
  }, [apiBase]);

  // Execute agent task (NEW)
  const executeAgentTask = useCallback(async (
    task: string,
    context?: Record<string, unknown>
  ): Promise<unknown> => {
    const response = await fetch(`${apiBase}/agent/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Agent execution failed');
    }

    return response.json();
  }, [apiBase]);

  // Stream agent task (NEW)
  const streamAgentTask = useCallback(async (
    task: string,
    onEvent: (event: AgentEvent) => void,
    context?: Record<string, unknown>
  ): Promise<void> => {
    const response = await fetch(`${apiBase}/agent/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Agent stream failed');
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
          const event = JSON.parse(data) as AgentEvent;
          onEvent(event);
        } catch (parseError) {
          // Log parsing errors for debugging but continue processing
          console.debug('Failed to parse agent event:', data.substring(0, 100), parseError);
        }
      }
    }
  }, [apiBase]);

  // Convert document using Docling (NEW)
  const convertDocument = useCallback(async (
    file: File,
    options?: { title?: string; chunkSize?: number; extractTables?: boolean }
  ): Promise<ConversionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.title) formData.append('title', options.title);
    if (options?.chunkSize) formData.append('chunkSize', String(options.chunkSize));
    if (options?.extractTables !== undefined) formData.append('extractTables', String(options.extractTables));

    const response = await fetch(`${apiBase}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Document conversion failed');
    }

    return response.json();
  }, [apiBase]);

  // Convert document from URL using Docling (NEW)
  const convertFromUrl = useCallback(async (
    url: string,
    options?: { title?: string; chunkSize?: number }
  ): Promise<ConversionResult> => {
    const response = await fetch(`${apiBase}/convert/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        title: options?.title,
        chunkSize: options?.chunkSize,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'URL conversion failed');
    }

    return response.json();
  }, [apiBase]);

  // Get supported document formats (NEW)
  const getSupportedFormats = useCallback(async (): Promise<SupportedFormats> => {
    const response = await fetch(`${apiBase}/convert/formats`);
    
    if (!response.ok) {
      throw new Error('Failed to get supported formats');
    }
    
    return response.json();
  }, [apiBase]);

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
    features,
    currentConfig,
    sendPrompt,
    streamPrompt,
    clearConversation,
    updateConfig,
    checkHealth,
    // Enhanced functions
    indexImage,
    hybridSearch,
    getDocumentVersions,
    executeAgentTask,
    streamAgentTask,
    // Docling document conversion
    convertDocument,
    convertFromUrl,
    getSupportedFormats,
    lastRetrievedDocs,
  };
}

export default useUnifiedRAG;
