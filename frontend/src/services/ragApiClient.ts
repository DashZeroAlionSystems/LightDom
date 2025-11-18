/**
 * RAG API Client with Automatic Retry and Error Handling
 * 
 * Implements:
 * - Exponential backoff retry logic
 * - Connection status monitoring
 * - Clear error messages
 * - TypeScript types for type safety
 */

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface RagHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'initializing';
  timestamp: string;
  uptime?: number;
  components?: {
    database: { status: string; lastCheck: string | null; error: string | null };
    vectorStore: { status: string; lastCheck: string | null; error: string | null };
    embedding: { status: string; lastCheck: string | null; error: string | null };
    llm: { status: string; lastCheck: string | null; error: string | null };
  };
  connection?: {
    isConnected: boolean;
    retryCount: number;
    maxRetries: number;
    lastError: string | null;
  };
  circuitBreaker?: {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
  };
  environment?: {
    hasOllama: boolean;
    hasDeepSeek: boolean;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatStreamOptions {
  query?: string;
  temperature?: number;
  maxTokens?: number;
  topK?: number;
}

class RagApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'RagApiError';
  }
}

class RagApiClient {
  private apiBase: string;
  private retryConfig: Required<RetryConfig>;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private healthStatus: RagHealthStatus | null = null;
  private healthCallbacks: Set<(status: RagHealthStatus) => void> = new Set();

  constructor(
    apiBase: string = '/api',
    retryConfig: RetryConfig = {}
  ) {
    this.apiBase = apiBase.replace(/\/$/, '');
    this.retryConfig = {
      maxRetries: retryConfig.maxRetries ?? 5,
      initialDelay: retryConfig.initialDelay ?? 1000,
      maxDelay: retryConfig.maxDelay ?? 30000,
      backoffMultiplier: retryConfig.backoffMultiplier ?? 2,
    };
    
    // Start periodic health checks
    this.startHealthMonitoring();
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    // Initial health check
    this.checkHealth().catch(err => {
      console.warn('Initial RAG health check failed:', err.message);
    });

    // Periodic health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth().catch(err => {
        console.warn('Periodic RAG health check failed:', err.message);
      });
    }, 30000);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Subscribe to health status updates
   */
  onHealthUpdate(callback: (status: RagHealthStatus) => void): () => void {
    this.healthCallbacks.add(callback);
    
    // Send current status immediately if available
    if (this.healthStatus) {
      callback(this.healthStatus);
    }
    
    return () => {
      this.healthCallbacks.delete(callback);
    };
  }

  /**
   * Get current health status
   */
  getHealthStatus(): RagHealthStatus | null {
    return this.healthStatus;
  }

  /**
   * Check if RAG service is available
   */
  isAvailable(): boolean {
    if (!this.healthStatus) return false;
    
    return (
      this.healthStatus.status === 'healthy' &&
      this.healthStatus.circuitBreaker?.state !== 'open'
    );
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelay
    );
    
    // Add jitter (0-30% of delay)
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return exponentialDelay + jitter;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch with automatic retry
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt: number = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // If response is ok, return it
      if (response.ok) {
        return response;
      }
      
      // For 4xx errors (client errors), don't retry
      if (response.status >= 400 && response.status < 500) {
        const text = await response.text();
        throw new RagApiError(
          `RAG API error: ${response.statusText}`,
          response.status,
          text
        );
      }
      
      // For 5xx errors (server errors), retry
      if (attempt < this.retryConfig.maxRetries) {
        const delay = this.calculateRetryDelay(attempt);
        console.warn(
          `RAG API request failed with status ${response.status}. ` +
          `Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})...`
        );
        await this.sleep(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      throw new RagApiError(
        `RAG API request failed after ${this.retryConfig.maxRetries} attempts`,
        response.status
      );
    } catch (error) {
      // For network errors, retry
      if (
        error instanceof TypeError &&
        error.message.includes('fetch') &&
        attempt < this.retryConfig.maxRetries
      ) {
        const delay = this.calculateRetryDelay(attempt);
        console.warn(
          `RAG API network error: ${error.message}. ` +
          `Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})...`
        );
        await this.sleep(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Check RAG service health
   */
  async checkHealth(): Promise<RagHealthStatus> {
    try {
      const response = await fetch(`${this.apiBase}/rag/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      
      const status: RagHealthStatus = await response.json();
      this.healthStatus = status;
      
      // Notify subscribers
      this.healthCallbacks.forEach(callback => callback(status));
      
      return status;
    } catch (error) {
      const errorStatus: RagHealthStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        connection: {
          isConnected: false,
          retryCount: 0,
          maxRetries: this.retryConfig.maxRetries,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      };
      
      this.healthStatus = errorStatus;
      this.healthCallbacks.forEach(callback => callback(errorStatus));
      
      throw new RagApiError('Failed to check RAG health', undefined, error);
    }
  }

  /**
   * Trigger manual reconnection
   */
  async reconnect(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/rag/reconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new RagApiError('Reconnection failed', response.status);
      }
      
      // Refresh health status
      await this.checkHealth();
    } catch (error) {
      throw new RagApiError(
        'Failed to reconnect RAG service',
        undefined,
        error
      );
    }
  }

  /**
   * Stream chat with RAG
   */
  async streamChat(
    messages: ChatMessage[],
    options: ChatStreamOptions = {},
    onChunk: (chunk: string) => void,
    onContext?: (documents: unknown[]) => void
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new RagApiError(
        'RAG service is unavailable. Please check your connection and try again.',
        503
      );
    }

    try {
      const response = await this.fetchWithRetry(
        `${this.apiBase}/rag/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ messages, ...options }),
        }
      );

      if (!response.body) {
        throw new RagApiError('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            
            const data = trimmed.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'context' && onContext) {
                onContext(parsed.documents || []);
              } else if (parsed.type === 'error') {
                throw new RagApiError(parsed.message || 'Stream error');
              } else if (typeof parsed === 'string') {
                onChunk(parsed);
              } else if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (parseError) {
              // If not JSON, treat as plain text chunk
              if (data && data !== '[DONE]') {
                onChunk(data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof RagApiError) {
        throw error;
      }
      throw new RagApiError(
        'Failed to stream chat with RAG service',
        undefined,
        error
      );
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopHealthMonitoring();
    this.healthCallbacks.clear();
  }
}

export { RagApiClient, RagApiError, type RagHealthStatus, type ChatMessage, type ChatStreamOptions };
