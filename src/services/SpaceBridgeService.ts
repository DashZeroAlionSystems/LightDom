import { Logger } from '../utils/Logger';
import { io, Socket } from 'socket.io-client';

export interface Bridge {
  id: string;
  bridge_id: string;
  source_chain: string;
  target_chain: string;
  bridge_capacity: number;
  current_volume: number;
  is_operational: boolean;
  validator_count: number;
  last_transaction?: Date;
  status: 'active' | 'inactive' | 'maintenance' | 'upgrading';
  created_at: Date;
  updated_at: Date;
}

export interface BridgeMessage {
  id: string;
  message_id: string;
  bridge_id: string;
  user_name: string;
  user_id?: string;
  message_text: string;
  message_type: 'text' | 'system' | 'optimization' | 'space_mined' | 'bridge_event';
  metadata?: any;
  created_at: Date;
}

export interface SpaceBridgeConnection {
  id: string;
  optimization_id: string;
  bridge_id: string;
  space_mined_kb: number;
  biome_type?: string;
  connection_strength: number;
  created_at: Date;
}

export interface BridgeStats {
  total_messages: number;
  active_participants: number;
  total_space_connected: number;
  last_message_at?: Date;
  bridge_capacity: number;
  current_volume: number;
}

export interface OptimizationResult {
  id: string;
  url: string;
  space_saved_kb: number;
  biome_type: string;
  optimization_type: string;
  timestamp: Date;
}

export class SpaceBridgeService {
  private logger: Logger;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private currentBridge: string | null = null;
  private messageHandlers: Map<string, (message: BridgeMessage) => void> = new Map();
  private typingUsers: Set<string> = new Set();

  constructor() {
    this.logger = new Logger('SpaceBridgeService');
  }

  /**
   * Initialize the Space-Bridge service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Space-Bridge service');

      // Connect to WebSocket server
      await this.connectWebSocket();

      // Setup event handlers
      this.setupEventHandlers();

      this.logger.info('Space-Bridge service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Space-Bridge service:', error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket server
   */
  private async connectWebSocket(): Promise<void> {
    try {
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3001' 
        : (typeof window !== 'undefined' ? window.location.origin.replace('http', 'ws') : 'ws://localhost:3001');

      this.socket = io(wsUrl, { 
        transports: ['websocket'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.logger.info('Connected to bridge WebSocket server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.logger.info('Disconnected from bridge WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        this.logger.error('WebSocket connection error:', error);
      });

    } catch (error) {
      this.logger.error('Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Bridge message handler
    this.socket.on('bridge_message', (message: BridgeMessage) => {
      this.logger.info(`Received bridge message: ${message.message_text}`);
      
      // Notify all registered handlers
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          this.logger.error('Error in message handler:', error);
        }
      });
    });

    // Typing indicator handler
    this.socket.on('bridge_typing', ({ user, isTyping }: { user: string; isTyping: boolean }) => {
      if (isTyping) {
        this.typingUsers.add(user);
      } else {
        this.typingUsers.delete(user);
      }
    });

    // Bridge event handler
    this.socket.on('bridge_event', (event: any) => {
      this.logger.info('Bridge event received:', event);
    });
  }

  /**
   * Get all available bridges
   */
  async getBridges(): Promise<Bridge[]> {
    try {
      const response = await fetch('/api/metaverse/bridges');
      if (!response.ok) {
        throw new Error(`Failed to fetch bridges: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridges:', error);
      throw error;
    }
  }

  /**
   * Get bridge details
   */
  async getBridge(bridgeId: string): Promise<Bridge | null> {
    try {
      const response = await fetch(`/api/metaverse/bridge/${bridgeId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch bridge: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridge:', error);
      throw error;
    }
  }

  /**
   * Get bridge chat messages
   */
  async getBridgeMessages(bridgeId: string, limit: number = 50, offset: number = 0): Promise<BridgeMessage[]> {
    try {
      const response = await fetch(`/api/metaverse/bridge/${bridgeId}/chat?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch bridge messages: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridge messages:', error);
      throw error;
    }
  }

  /**
   * Join a bridge chat room
   */
  async joinBridge(bridgeId: string): Promise<void> {
    try {
      if (!this.socket || !this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      // Leave current bridge if any
      if (this.currentBridge) {
        this.socket.emit('bridge_leave', this.currentBridge);
      }

      // Join new bridge
      this.socket.emit('bridge_join', bridgeId);
      this.currentBridge = bridgeId;

      this.logger.info(`Joined bridge: ${bridgeId}`);
    } catch (error) {
      this.logger.error('Failed to join bridge:', error);
      throw error;
    }
  }

  /**
   * Leave current bridge chat room
   */
  async leaveBridge(): Promise<void> {
    try {
      if (!this.socket || !this.isConnected || !this.currentBridge) {
        return;
      }

      this.socket.emit('bridge_leave', this.currentBridge);
      this.currentBridge = null;

      this.logger.info('Left bridge chat room');
    } catch (error) {
      this.logger.error('Failed to leave bridge:', error);
      throw error;
    }
  }

  /**
   * Send a message to bridge chat
   */
  async sendMessage(bridgeId: string, message: string, userName: string = 'Anonymous'): Promise<void> {
    try {
      if (!this.socket || !this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      const messageData = {
        bridgeId,
        user: userName,
        text: message
      };

      this.socket.emit('bridge_message', messageData);
      this.logger.info(`Sent message to bridge ${bridgeId}: ${message}`);
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTyping(bridgeId: string, userName: string, isTyping: boolean): Promise<void> {
    try {
      if (!this.socket || !this.isConnected) {
        return;
      }

      this.socket.emit('bridge_typing', {
        bridgeId,
        user: userName,
        isTyping
      });
    } catch (error) {
      this.logger.error('Failed to send typing indicator:', error);
    }
  }

  /**
   * Connect space mining result to bridge
   */
  async connectSpaceToBridge(optimizationResult: OptimizationResult, bridgeId: string): Promise<SpaceBridgeConnection> {
    try {
      const response = await fetch('/api/metaverse/connect-space-to-bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optimization_id: optimizationResult.id,
          bridge_id: bridgeId,
          space_mined_kb: optimizationResult.space_saved_kb,
          biome_type: optimizationResult.biome_type
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to connect space to bridge: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info(`Connected ${optimizationResult.space_saved_kb}KB of space to bridge ${bridgeId}`);

      // Send notification to bridge chat
      await this.sendMessage(
        bridgeId, 
        `🌐 New space mined: ${optimizationResult.space_saved_kb}KB from ${optimizationResult.url} (${optimizationResult.biome_type} biome)`,
        'Space Miner'
      );

      return data;
    } catch (error) {
      this.logger.error('Failed to connect space to bridge:', error);
      throw error;
    }
  }

  /**
   * Get space-bridge connections
   */
  async getSpaceBridgeConnections(bridgeId?: string): Promise<SpaceBridgeConnection[]> {
    try {
      const url = bridgeId 
        ? `/api/metaverse/space-bridge-connections?bridge_id=${bridgeId}`
        : '/api/metaverse/space-bridge-connections';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch space-bridge connections: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get space-bridge connections:', error);
      throw error;
    }
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats(bridgeId: string): Promise<BridgeStats> {
    try {
      const response = await fetch(`/api/metaverse/bridge/${bridgeId}/stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch bridge stats: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridge stats:', error);
      throw error;
    }
  }

  /**
   * Create a new bridge
   */
  async createBridge(sourceChain: string, targetChain: string, capacity: number = 1000000): Promise<Bridge> {
    try {
      const response = await fetch('/api/metaverse/bridges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_chain: sourceChain,
          target_chain: targetChain,
          bridge_capacity: capacity
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create bridge: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info(`Created new bridge: ${sourceChain} → ${targetChain}`);
      return data;
    } catch (error) {
      this.logger.error('Failed to create bridge:', error);
      throw error;
    }
  }

  /**
   * Register message handler
   */
  onMessage(handler: (message: BridgeMessage) => void): string {
    const handlerId = `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.messageHandlers.set(handlerId, handler);
    return handlerId;
  }

  /**
   * Unregister message handler
   */
  offMessage(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
  }

  /**
   * Get typing users
   */
  getTypingUsers(): string[] {
    return Array.from(this.typingUsers);
  }

  /**
   * Get current bridge
   */
  getCurrentBridge(): string | null {
    return this.currentBridge;
  }

  /**
   * Check if connected
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentBridge = null;
    this.messageHandlers.clear();
    this.typingUsers.clear();
  }

  /**
   * Auto-connect space mining to appropriate bridge
   */
  async autoConnectSpaceMining(optimizationResult: OptimizationResult): Promise<void> {
    try {
      // Determine appropriate bridge based on biome type
      let targetBridge: string;
      
      switch (optimizationResult.biome_type) {
        case 'digital':
        case 'commercial':
          targetBridge = 'bridge_web_dom_metaverse';
          break;
        case 'knowledge':
        case 'professional':
          targetBridge = 'bridge_lightdom_space';
          break;
        case 'social':
        case 'community':
          targetBridge = 'bridge_ethereum_polygon';
          break;
        default:
          targetBridge = 'bridge_web_dom_metaverse';
      }

      // Connect space to bridge
      await this.connectSpaceToBridge(optimizationResult, targetBridge);
      
      this.logger.info(`Auto-connected ${optimizationResult.space_saved_kb}KB space to bridge ${targetBridge}`);
    } catch (error) {
      this.logger.error('Failed to auto-connect space mining:', error);
      throw error;
    }
  }
}

export default SpaceBridgeService;