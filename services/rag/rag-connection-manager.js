/**
 * RAG Connection Manager
 * 
 * Implements automatic reconnection with exponential backoff and retry logic
 * for RAG service initialization and recovery.
 */

export class RagConnectionManager {
  constructor({
    logger = console,
    maxRetries = 10,
    initialRetryDelay = 1000,
    maxRetryDelay = 60000,
    backoffMultiplier = 2,
  } = {}) {
    this.logger = logger;
    this.maxRetries = maxRetries;
    this.initialRetryDelay = initialRetryDelay;
    this.maxRetryDelay = maxRetryDelay;
    this.backoffMultiplier = backoffMultiplier;
    
    this.retryCount = 0;
    this.isConnected = false;
    this.lastError = null;
    this.connectionPromise = null;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  calculateRetryDelay() {
    const exponentialDelay = Math.min(
      this.initialRetryDelay * Math.pow(this.backoffMultiplier, this.retryCount),
      this.maxRetryDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return exponentialDelay + jitter;
  }

  /**
   * Connect to RAG service with automatic retry
   */
  async connect(connectFn) {
    // Return existing connection if already connected
    if (this.isConnected && this.connectionPromise) {
      return this.connectionPromise;
    }

    // Return in-progress connection attempt
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._attemptConnection(connectFn);
    return this.connectionPromise;
  }

  /**
   * Internal method to attempt connection with retries
   */
  async _attemptConnection(connectFn) {
    this.retryCount = 0;
    
    while (this.retryCount < this.maxRetries) {
      try {
        this.logger.info(
          `Attempting to connect to RAG service (attempt ${this.retryCount + 1}/${this.maxRetries})`
        );
        
        const result = await connectFn();
        
        this.isConnected = true;
        this.lastError = null;
        this.retryCount = 0;
        
        this.logger.info('Successfully connected to RAG service');
        
        return result;
      } catch (error) {
        this.lastError = error;
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
          this.logger.error(
            `Failed to connect to RAG service after ${this.maxRetries} attempts. Last error: ${error.message}`
          );
          this.connectionPromise = null;
          throw new Error(
            `RAG service connection failed after ${this.maxRetries} attempts: ${error.message}`
          );
        }
        
        const delay = this.calculateRetryDelay();
        this.logger.warn(
          `RAG connection failed (attempt ${this.retryCount}): ${error.message}. ` +
          `Retrying in ${Math.round(delay)}ms...`
        );
        
        await this.sleep(delay);
      }
    }
  }

  /**
   * Disconnect and reset connection state
   */
  disconnect() {
    this.isConnected = false;
    this.connectionPromise = null;
    this.retryCount = 0;
    this.logger.info('Disconnected from RAG service');
  }

  /**
   * Reconnect to RAG service
   */
  async reconnect(connectFn) {
    this.disconnect();
    return this.connect(connectFn);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      lastError: this.lastError ? this.lastError.message : null,
      lastErrorTime: this.lastError ? new Date().toISOString() : null,
    };
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a managed RAG service with automatic reconnection
 */
export function createManagedRagService({
  createServiceFn,
  logger = console,
  connectionManager = null,
}) {
  const manager = connectionManager || new RagConnectionManager({ logger });
  
  let serviceInstance = null;
  
  return {
    /**
     * Get or initialize RAG service
     */
    async getService() {
      if (serviceInstance && manager.isConnected) {
        return serviceInstance;
      }
      
      serviceInstance = await manager.connect(async () => {
        const service = await createServiceFn();
        return service;
      });
      
      return serviceInstance;
    },
    
    /**
     * Force reconnection
     */
    async reconnect() {
      serviceInstance = null;
      return manager.reconnect(async () => {
        const service = await createServiceFn();
        return service;
      });
    },
    
    /**
     * Get connection status
     */
    getStatus() {
      return manager.getStatus();
    },
    
    /**
     * Check if service is available
     */
    isAvailable() {
      return manager.isConnected && serviceInstance !== null;
    },
  };
}

export default RagConnectionManager;
