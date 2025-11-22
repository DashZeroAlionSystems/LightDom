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
    const apiBase = import.meta.env.VITE_API_URL || '/api';
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
    isAvailable: healthStatus?.status === 'healthy' && healthStatus?.circuitBreaker?.state !== 'open',
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
        
        await client.streamChat(
          messages,
          options,
          onChunk,
          documents => {
            setRetrievedDocuments(documents);
          }
        );
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
      return 'Checking RAG connection...';
    }
    
    if (healthStatus.circuitBreaker?.state === 'open') {
      return 'RAG service temporarily unavailable due to repeated failures';
    }
    
    if (healthStatus.status === 'unhealthy') {
      return 'RAG service is offline';
    }
    
    if (healthStatus.status === 'degraded') {
      return 'RAG service is running with degraded performance';
    }
    
    if (healthStatus.connection && !healthStatus.connection.isConnected) {
      return `Connection failed: ${healthStatus.connection.lastError || 'Unknown error'}`;
    }
    
    return 'RAG service is online';
  }, [healthStatus]);

  const getStatusColor = useCallback(() => {
    if (!healthStatus || healthStatus.status === 'initializing') {
      return 'gray';
    }
    
    if (
      healthStatus.status === 'unhealthy' ||
      healthStatus.circuitBreaker?.state === 'open'
    ) {
      return 'red';
    }
    
    if (
      healthStatus.status === 'degraded' ||
      healthStatus.circuitBreaker?.state === 'half-open'
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
