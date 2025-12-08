/**
 * React Hooks for RAG API Client
 *
 * Provides easy-to-use React hooks for RAG functionality with
 * automatic connection management and error handling.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ChatMessage,
  type ChatStreamOptions,
  type RagHealthStatus,
  RagApiClient,
  RagApiError,
} from '../services/ragApiClient';

// Global singleton client instance
let globalRagClient: RagApiClient | null = null;

function getRagClient(): RagApiClient {
  if (!globalRagClient) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    globalRagClient = new RagApiClient(apiBase);
  }
  return globalRagClient;
}

/**
 * Hook to access RAG health status
 */
export function useRagHealth() {
  const [healthStatus, setHealthStatus] = useState<RagHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const client = getRagClient();
      const status = await client.checkHealth();
      setHealthStatus(status);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check health';
      setError(message);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reconnect = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const client = getRagClient();
      await client.reconnect();
      await checkHealth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reconnect';
      setError(message);
    } finally {
      setIsChecking(false);
    }
  }, [checkHealth]);

  useEffect(() => {
    const client = getRagClient();

    // Get initial status
    const initialStatus = client.getHealthStatus();
    if (initialStatus) {
      setHealthStatus(initialStatus);
    }

    // Subscribe to health updates
    const unsubscribe = client.onHealthUpdate(status => {
      setHealthStatus(status);
    });

    return unsubscribe;
  }, []);

  return {
    healthStatus,
    isChecking,
    error,
    isAvailable: healthStatus ? getRagClient().isAvailable() : false,
    checkHealth,
    reconnect,
  };
}

/**
 * Hook for RAG chat streaming
 */
export function useRagChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrievedDocuments, setRetrievedDocuments] = useState<unknown[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { healthStatus, isAvailable } = useRagHealth();

  const streamChat = useCallback(
    async (
      messages: ChatMessage[],
      options: ChatStreamOptions,
      onChunk: (chunk: string) => void
    ): Promise<void> => {
      // Check if service is available
      if (!isAvailable) {
        const errorMessage =
          healthStatus?.circuitBreaker?.state === 'open'
            ? 'RAG service is temporarily unavailable due to repeated failures. Please try again later.'
            : 'RAG service is not available. Please check your connection.';

        setError(errorMessage);
        throw new RagApiError(errorMessage, 503);
      }

      setIsStreaming(true);
      setError(null);
      setRetrievedDocuments([]);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const client = getRagClient();

        await client.streamChat(messages, options, onChunk, documents => {
          setRetrievedDocuments(documents);
        });
      } catch (err) {
        if (err instanceof RagApiError) {
          setError(err.message);
          throw err;
        }

        const message = err instanceof Error ? err.message : 'Chat stream failed';
        setError(message);
        throw new RagApiError(message);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isAvailable, healthStatus]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    streamChat,
    cancelStream,
    isStreaming,
    error,
    retrievedDocuments,
    isAvailable,
    healthStatus,
  };
}

/**
 * Hook to display RAG connection status
 */
export function useRagConnectionStatus() {
  const { healthStatus, isAvailable, reconnect, isChecking } = useRagHealth();

  const getStatusMessage = useCallback(() => {
    if (!healthStatus) {
      return 'Checking unified RAG connection...';
    }

    if (healthStatus.circuitBreaker?.state === 'open') {
      return 'Unified RAG temporarily unavailable due to repeated failures';
    }

    const failingComponents: string[] = [];
    const evaluateComponent = (label: string, component?: { status?: string | null }) => {
      if (!component?.status) {
        return;
      }
      const normalized = component.status.toLowerCase();
      const okStates = ['healthy', 'ok', 'available', 'disabled', 'not_configured'];
      if (!okStates.includes(normalized)) {
        failingComponents.push(label);
      }
    };

    evaluateComponent('LLM', healthStatus.llm);
    evaluateComponent('Vector store', healthStatus.vectorStore);
    evaluateComponent('Docling', healthStatus.docling);
    evaluateComponent('OCR', healthStatus.ocr);
    evaluateComponent('Agent', healthStatus.agent);

    if (healthStatus.status === 'unhealthy' || healthStatus.status === 'error') {
      if (failingComponents.length > 0) {
        return `Unified RAG offline (${failingComponents.join(', ')})`;
      }
      return 'Unified RAG is offline';
    }

    if (failingComponents.length > 0 || healthStatus.status === 'degraded') {
      const componentSummary =
        failingComponents.length > 0 ? ` (${failingComponents.join(', ')})` : '';
      return `Unified RAG degraded${componentSummary}`;
    }

    return 'Unified RAG is online';
  }, [healthStatus]);

  const getStatusColor = useCallback(() => {
    if (!healthStatus || healthStatus.status === 'initializing') {
      return 'gray';
    }

    const failingComponents: string[] = [];
    const evaluateComponent = (component?: { status?: string | null }) => {
      if (!component?.status) {
        return;
      }
      const normalized = component.status.toLowerCase();
      const okStates = ['healthy', 'ok', 'available', 'disabled', 'not_configured'];
      if (!okStates.includes(normalized)) {
        failingComponents.push(normalized);
      }
    };

    evaluateComponent(healthStatus.llm);
    evaluateComponent(healthStatus.vectorStore);
    evaluateComponent(healthStatus.docling);
    evaluateComponent(healthStatus.ocr);
    evaluateComponent(healthStatus.agent);

    if (
      healthStatus.status === 'unhealthy' ||
      healthStatus.status === 'error' ||
      healthStatus.circuitBreaker?.state === 'open'
    ) {
      return 'red';
    }

    if (
      healthStatus.status === 'degraded' ||
      healthStatus.circuitBreaker?.state === 'half-open' ||
      failingComponents.length > 0
    ) {
      return 'yellow';
    }

    return 'green';
  }, [healthStatus]);

  return {
    statusMessage: getStatusMessage(),
    statusColor: getStatusColor(),
    isAvailable,
    healthStatus,
    reconnect,
    isReconnecting: isChecking,
  };
}

export default useRagChat;
