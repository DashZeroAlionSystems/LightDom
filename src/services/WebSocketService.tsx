/**
 * WebSocket Service for Real-time Communication
 * Exodus wallet-inspired real-time data streaming
 * Handles live updates for desktop dashboards
 */

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url: string;
  token?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
}

export interface RealTimeData {
  mining: {
    hashRate: number;
    blocksMined: number;
    difficulty: number;
    earnings: number;
    efficiency: number;
    activeMiners: number;
  };
  system: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    temperature: number;
    uptime: number;
  };
  analytics: {
    activeUsers: number;
    totalOptimizations: number;
    tokensEarned: number;
    networkHashRate: number;
  };
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    service: string;
  }>;
}

export interface WebSocketEvents {
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: Error) => void;
  'reconnect': (attemptNumber: number) => void;
  'real-time-update': (data: RealTimeData) => void;
  'mining-update': (data: RealTimeData['mining']) => void;
  'system-update': (data: RealTimeData['system']) => void;
  'analytics-update': (data: RealTimeData['analytics']) => void;
  'alert': (alert: RealTimeData['alerts'][0]) => void;
  'user-activity': (data: { userId: string; action: string; timestamp: string }) => void;
  'service-status': (data: { service: string; status: string; metrics: any }) => void;
  'optimization-complete': (data: { id: string; url: string; savings: number; tokens: number }) => void;
  'block-mined': (data: { blockNumber: number; reward: number; miner: string }) => void;
  'transaction-update': (data: { hash: string; status: string; confirmations: number }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isDestroyed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      timeout: 10000,
      ...config,
    };
    this.maxReconnectAttempts = this.config.reconnectAttempts || 5;
    this.reconnectDelay = this.config.reconnectDelay || 1000;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error('WebSocket service has been destroyed'));
        return;
      }

      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = io(this.config.url, {
          auth: this.config.token ? { token: this.config.token } : undefined,
          timeout: this.config.timeout,
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true,
          forceNew: true,
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connect');
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.emit('disconnect');
          
          if (!this.isDestroyed && reason === 'io server disconnect') {
            // Server initiated disconnect, try to reconnect
            this.attemptReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        });

        // Real-time data events
        this.socket.on('real-time-update', (data: RealTimeData) => {
          this.emit('real-time-update', data);
        });

        this.socket.on('mining-update', (data: RealTimeData['mining']) => {
          this.emit('mining-update', data);
        });

        this.socket.on('system-update', (data: RealTimeData['system']) => {
          this.emit('system-update', data);
        });

        this.socket.on('analytics-update', (data: RealTimeData['analytics']) => {
          this.emit('analytics-update', data);
        });

        this.socket.on('alert', (alert: RealTimeData['alerts'][0]) => {
          this.emit('alert', alert);
        });

        this.socket.on('user-activity', (data: { userId: string; action: string; timestamp: string }) => {
          this.emit('user-activity', data);
        });

        this.socket.on('service-status', (data: { service: string; status: string; metrics: any }) => {
          this.emit('service-status', data);
        });

        this.socket.on('optimization-complete', (data: { id: string; url: string; savings: number; tokens: number }) => {
          this.emit('optimization-complete', data);
        });

        this.socket.on('block-mined', (data: { blockNumber: number; reward: number; miner: string }) => {
          this.emit('block-mined', data);
        });

        this.socket.on('transaction-update', (data: { hash: string; status: string; confirmations: number }) => {
          this.emit('transaction-update', data);
        });

        // Reconnection events
        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
          this.emit('reconnect', attemptNumber);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`WebSocket reconnection attempt ${attemptNumber}`);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed');
          this.emit('error', new Error('Reconnection failed'));
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect().catch(() => {
          // Connection failed, will trigger another reconnect attempt
        });
      }
    }, delay);
  }

  /**
   * Check if connected to the server
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Send a message to the server
   */
  send(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribe(channel: string, callback: (data: any) => void): void {
    this.send('subscribe', { channel });
    this.on(channel, callback);
  }

  /**
   * Unsubscribe from real-time data updates
   */
  unsubscribe(channel: string, callback?: (data: any) => void): void {
    this.send('unsubscribe', { channel });
    if (callback) {
      this.off(channel, callback);
    }
  }

  /**
   * Add event listener
   */
  on<K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof WebSocketEvents>(event: K, listener?: WebSocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      return;
    }

    if (listener) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.socket?.connected) return 'connected';
    if (this.socket) return 'disconnected';
    return 'error';
  }

  /**
   * Update authentication token
   */
  updateToken(token: string): void {
    this.config.token = token;
    if (this.socket) {
      this.socket.auth = { token };
      this.socket.disconnect();
      this.connect();
    }
  }

  /**
   * Destroy the WebSocket service
   */
  destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.eventListeners.clear();
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    connected: boolean;
    reconnectAttempts: number;
    uptime: number;
    lastConnected?: Date;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      uptime: this.socket ? Date.now() - (this.socket as any).serverStartTime : 0,
      lastConnected: this.socket ? new Date() : undefined,
    };
  }
}

// Singleton instance for the application
let webSocketInstance: WebSocketService | null = null;

/**
 * Get or create WebSocket service instance
 */
export function getWebSocketService(config?: WebSocketConfig): WebSocketService {
  if (!webSocketInstance) {
    if (!config) {
      throw new Error('WebSocket config is required for first initialization');
    }
    webSocketInstance = new WebSocketService(config);
  }
  return webSocketInstance;
}

/**
 * Destroy WebSocket service instance
 */
export function destroyWebSocketService(): void {
  if (webSocketInstance) {
    webSocketInstance.destroy();
    webSocketInstance = null;
  }
}

/**
 * React hook for WebSocket service
 */
export function useWebSocket(config: WebSocketConfig) {
  const [socket, setSocket] = useState<WebSocketService | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastData, setLastData] = useState<RealTimeData | null>(null);

  useEffect(() => {
    const wsService = new WebSocketService(config);
    setSocket(wsService);

    // Status listeners
    const handleConnect = () => setStatus('connected');
    const handleDisconnect = () => setStatus('disconnected');
    const handleError = () => setStatus('error');

    wsService.on('connect', handleConnect);
    wsService.on('disconnect', handleDisconnect);
    wsService.on('error', handleError);

    // Data listeners
    const handleRealTimeUpdate = (data: RealTimeData) => {
      setLastData(data);
    };

    wsService.on('real-time-update', handleRealTimeUpdate);

    // Connect to server
    wsService.connect().catch(console.error);

    return () => {
      wsService.off('connect', handleConnect);
      wsService.off('disconnect', handleDisconnect);
      wsService.off('error', handleError);
      wsService.off('real-time-update', handleRealTimeUpdate);
      wsService.destroy();
    };
  }, [config.url, config.token]);

  return {
    socket,
    status,
    lastData,
    isConnected: status === 'connected',
    send: (event: string, data?: any) => socket?.send(event, data),
    subscribe: (channel: string, callback: (data: any) => void) => socket?.subscribe(channel, callback),
    unsubscribe: (channel: string, callback?: (data: any) => void) => socket?.unsubscribe(channel, callback),
  };
}

export default WebSocketService;
