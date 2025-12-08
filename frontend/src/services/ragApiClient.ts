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

interface RagComponentStatus {
  status: string;
  error?: string | null;
  provider?: string;
  model?: string;
  endpoint?: string;
  supportedFormats?: string[];
  details?: unknown;
}

interface RagAgentStatus {
  status: string;
  planningEnabled?: boolean;
  availableTools?: string[];
  maxSteps?: number;
}

interface RagFeatureFlags {
  multimodal?: boolean;
  hybridSearch?: boolean;
  versioning?: boolean;
  agentMode?: boolean;
  docling?: boolean;
}

interface RagStats {
  queriesProcessed: number;
  documentsIndexed: number;
  documentsConverted: number;
  imagesProcessed: number;
  toolExecutions: number;
  averageResponseTime: number;
}

interface RagHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'initializing' | 'error';
  timestamp: string;
  llm?: RagComponentStatus & { provider?: string; model?: string };
  vectorStore?: RagComponentStatus;
  ocr?: RagComponentStatus;
  docling?: RagComponentStatus;
  agent?: RagAgentStatus;
  features?: RagFeatureFlags;
  stats?: Partial<RagStats>;
  circuitBreaker?: {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
  };
  connection?: {
    isConnected: boolean;
    retryCount: number;
    maxRetries: number;
    lastError: string | null;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatStreamOptions {
  conversationId?: string;
  mode?: string;
  includeDatabase?: boolean;
  includeCodebase?: boolean;
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

  constructor(apiBase: string = 'http://localhost:3001/api', retryConfig: RetryConfig = {}) {
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

  private buildUrl(path: string): string {
    const trimmedBase = this.apiBase.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${trimmedBase}${normalizedPath}`;
  }

  private normalizeUnifiedHealth(raw: any, responseStatus: number): RagHealthStatus {
    const status =
      typeof raw?.status === 'string'
        ? (raw.status as RagHealthStatus['status'])
        : responseStatus === 206
          ? 'degraded'
          : responseStatus >= 500
            ? 'unhealthy'
            : 'healthy';
    return {
      status,
      timestamp: new Date().toISOString(),
      llm: raw?.llm,
      vectorStore: raw?.vectorStore,
      ocr: raw?.ocr,
      docling: raw?.docling,
      agent: raw?.agent,
      features: raw?.features,
      stats: raw?.stats,
      circuitBreaker: raw?.circuitBreaker ?? { state: 'closed', failures: 0 },
    };
  }

  private normalizeLegacyHealth(raw: any): RagHealthStatus {
    const components = raw?.components ?? {};
    const circuitBreaker = raw?.circuitBreaker ?? { state: 'closed', failures: 0 };
    const normalizeComponent = (component?: any): RagComponentStatus | undefined => {
      if (!component) return undefined;
      return {
        status: component.status ?? 'unknown',
        error: component.error ?? null,
        provider: component.provider,
        model: component.model,
      };
    };

    const statusMap: Record<string, RagHealthStatus['status']> = {
      ok: 'healthy',
      healthy: 'healthy',
      warn: 'degraded',
      degraded: 'degraded',
      error: 'unhealthy',
      unhealthy: 'unhealthy',
    };

    const rawStatus = typeof raw?.status === 'string' ? raw.status.toLowerCase() : 'unhealthy';
    const normalizedStatus =
      statusMap[rawStatus] ?? (circuitBreaker?.state === 'open' ? 'unhealthy' : 'degraded');

    return {
      status: normalizedStatus,
      timestamp: raw?.timestamp ?? new Date().toISOString(),
      llm: normalizeComponent(components.llm),
      vectorStore: normalizeComponent(components.vectorStore),
      ocr: undefined,
      docling: undefined,
      agent: undefined,
      features: undefined,
      stats: undefined,
      circuitBreaker,
      connection: raw?.connection
        ? {
            isConnected: Boolean(raw.connection.isConnected ?? raw.connection.available ?? false),
            retryCount: raw.connection.retryCount ?? 0,
            maxRetries: raw.connection.maxRetries ?? this.retryConfig.maxRetries,
            lastError: raw.connection.lastError ?? null,
          }
        : undefined,
    };
  }
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

    const allowedStatuses = new Set<RagHealthStatus['status']>(['healthy', 'degraded']);
    const breakerState = this.healthStatus.circuitBreaker?.state ?? 'closed';

    return allowedStatuses.has(this.healthStatus.status) && breakerState !== 'open';
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
        throw new RagApiError(`RAG API error: ${response.statusText}`, response.status, text);
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
      const unifiedUrl = this.buildUrl('/unified-rag/health');
      let response = await fetch(unifiedUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      let usedFallback = false;
      if (response.status === 404) {
        usedFallback = true;
        response = await fetch(this.buildUrl('/rag/health'), {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
      }

      const text = await response.text();
      const raw = text
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return {};
            }
          })()
        : {};

      if (!response.ok && response.status !== 206) {
        const errorMessage =
          raw && typeof raw === 'object' && 'error' in raw
            ? ((raw as { error?: string }).error ?? `Health check failed (${response.status})`)
            : `Health check failed (${response.status})`;
        throw new RagApiError(errorMessage, response.status);
      }

      const status = usedFallback
        ? this.normalizeLegacyHealth(raw)
        : this.normalizeUnifiedHealth(raw, response.status);

      this.healthStatus = status;
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
        circuitBreaker: { state: 'open', failures: this.retryConfig.maxRetries },
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
      const unifiedUrl = this.buildUrl('/unified-rag/reinitialize');
      let response = await fetch(unifiedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      let usedFallback = false;
      if (response.status === 404) {
        usedFallback = true;
        response = await fetch(this.buildUrl('/rag/reconnect'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const text = await response.text();
      const details = text
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return {};
            }
          })()
        : {};
      const statusFlag =
        details && typeof details === 'object' && 'status' in details
          ? (details as { status?: string }).status
          : undefined;

      if (!response.ok || (statusFlag && statusFlag !== 'ok')) {
        const baseMessage = usedFallback ? 'Reconnection failed' : 'Reinitialization failed';
        const message =
          details && typeof details === 'object' && 'error' in details
            ? ((details as { error?: string }).error ?? baseMessage)
            : baseMessage;
        throw new RagApiError(message, response.status);
      }

      // Refresh health status
      await this.checkHealth();
    } catch (error) {
      throw new RagApiError('Failed to reinitialize RAG service', undefined, error);
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
        'Unified RAG service is unavailable. Please check your connection and try again.',
        503
      );
    }
    try {
      const endpoints = ['/unified-rag/chat/stream', '/rag/chat/stream'];
      let response: Response | null = null;
      let lastError: unknown = null;

      for (const endpoint of endpoints) {
        try {
          response = await this.fetchWithRetry(this.buildUrl(endpoint), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
            },
            body: JSON.stringify({ messages, ...options }),
          });
          break;
        } catch (error) {
          lastError = error;
          if (error instanceof RagApiError && error.statusCode === 404) {
            continue;
          }
          throw error;
        }
      }

      if (!response) {
        if (lastError instanceof RagApiError) {
          throw lastError;
        }
        throw new RagApiError('Failed to stream chat with RAG service', undefined, lastError);
      }

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

            const data = trimmed.slice(6);

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
            } catch {
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
      throw new RagApiError('Failed to stream chat with RAG service', undefined, error);
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

export {
  RagApiClient,
  RagApiError,
  type ChatMessage,
  type ChatStreamOptions,
  type RagHealthStatus,
};
