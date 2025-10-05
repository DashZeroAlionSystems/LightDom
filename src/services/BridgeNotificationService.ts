import { Logger } from '../utils/Logger';
import { io, Socket } from 'socket.io-client';

export interface BridgeNotification {
  id: string;
  bridge_id: string;
  type: 'space_mined' | 'user_joined' | 'user_left' | 'bridge_created' | 'optimization_complete' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

export interface NotificationPreferences {
  space_mined: boolean;
  user_activity: boolean;
  system_alerts: boolean;
  optimization_updates: boolean;
}

export class BridgeNotificationService {
  private logger: Logger;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private notifications: Map<string, BridgeNotification> = new Map();
  private preferences: NotificationPreferences = {
    space_mined: true,
    user_activity: true,
    system_alerts: true,
    optimization_updates: true
  };
  private notificationHandlers: Map<string, (notification: BridgeNotification) => void> = new Map();

  constructor() {
    this.logger = new Logger('BridgeNotificationService');
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Bridge Notification service');

      // Connect to WebSocket server
      await this.connectWebSocket();

      // Setup event handlers
      this.setupEventHandlers();

      // Load user preferences
      await this.loadPreferences();

      this.logger.info('Bridge Notification service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Bridge Notification service:', error);
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
        this.logger.info('Connected to notification WebSocket server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.logger.info('Disconnected from notification WebSocket server');
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

    // Bridge notification handler
    this.socket.on('bridge_notification', (notification: BridgeNotification) => {
      this.logger.info(`Received bridge notification: ${notification.title}`);
      
      // Check if user wants this type of notification
      if (this.shouldShowNotification(notification.type)) {
        this.notifications.set(notification.id, notification);
        
        // Notify all registered handlers
        this.notificationHandlers.forEach((handler) => {
          try {
            handler(notification);
          } catch (error) {
            this.logger.error('Error in notification handler:', error);
          }
        });
      }
    });

    // System notification handler
    this.socket.on('system_notification', (notification: BridgeNotification) => {
      this.logger.info(`Received system notification: ${notification.title}`);
      
      if (this.shouldShowNotification(notification.type)) {
        this.notifications.set(notification.id, notification);
        
        this.notificationHandlers.forEach((handler) => {
          try {
            handler(notification);
          } catch (error) {
            this.logger.error('Error in notification handler:', error);
          }
        });
      }
    });
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(type: string): boolean {
    switch (type) {
      case 'space_mined':
        return this.preferences.space_mined;
      case 'user_joined':
      case 'user_left':
        return this.preferences.user_activity;
      case 'system_alert':
        return this.preferences.system_alerts;
      case 'optimization_complete':
        return this.preferences.optimization_updates;
      default:
        return true;
    }
  }

  /**
   * Load user preferences from localStorage
   */
  private async loadPreferences(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('bridge_notification_preferences');
        if (saved) {
          this.preferences = { ...this.preferences, ...JSON.parse(saved) };
        }
      }
    } catch (error) {
      this.logger.error('Failed to load preferences:', error);
    }
  }

  /**
   * Save user preferences to localStorage
   */
  async savePreferences(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('bridge_notification_preferences', JSON.stringify(this.preferences));
      }
    } catch (error) {
      this.logger.error('Failed to save preferences:', error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Send a notification to a specific bridge
   */
  async sendBridgeNotification(
    bridgeId: string,
    type: BridgeNotification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      if (!this.socket || !this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      const notification: BridgeNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bridge_id: bridgeId,
        type,
        title,
        message,
        data,
        timestamp: new Date(),
        read: false
      };

      this.socket.emit('send_bridge_notification', notification);
      this.logger.info(`Sent bridge notification to ${bridgeId}: ${title}`);
    } catch (error) {
      this.logger.error('Failed to send bridge notification:', error);
      throw error;
    }
  }

  /**
   * Send a system-wide notification
   */
  async sendSystemNotification(
    type: BridgeNotification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      if (!this.socket || !this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      const notification: BridgeNotification = {
        id: `sys_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bridge_id: 'system',
        type,
        title,
        message,
        data,
        timestamp: new Date(),
        read: false
      };

      this.socket.emit('send_system_notification', notification);
      this.logger.info(`Sent system notification: ${title}`);
    } catch (error) {
      this.logger.error('Failed to send system notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notification.read = true;
        this.notifications.set(notificationId, notification);
      }
    } catch (error) {
      this.logger.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      this.notifications.forEach((notification) => {
        notification.read = true;
        this.notifications.set(notification.id, notification);
      });
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): BridgeNotification[] {
    return Array.from(this.notifications.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): BridgeNotification[] {
    return this.getAllNotifications().filter(notification => !notification.read);
  }

  /**
   * Get notifications for a specific bridge
   */
  getBridgeNotifications(bridgeId: string): BridgeNotification[] {
    return this.getAllNotifications().filter(notification => 
      notification.bridge_id === bridgeId
    );
  }

  /**
   * Clear old notifications (older than 7 days)
   */
  async clearOldNotifications(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      this.notifications.forEach((notification, id) => {
        if (notification.timestamp < sevenDaysAgo) {
          this.notifications.delete(id);
        }
      });
    } catch (error) {
      this.logger.error('Failed to clear old notifications:', error);
    }
  }

  /**
   * Register notification handler
   */
  onNotification(handler: (notification: BridgeNotification) => void): string {
    const handlerId = `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.notificationHandlers.set(handlerId, handler);
    return handlerId;
  }

  /**
   * Unregister notification handler
   */
  offNotification(handlerId: string): void {
    this.notificationHandlers.delete(handlerId);
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
    this.notificationHandlers.clear();
  }

  /**
   * Create space mined notification
   */
  async notifySpaceMined(
    bridgeId: string,
    spaceMined: number,
    url: string,
    biomeType: string
  ): Promise<void> {
    await this.sendBridgeNotification(
      bridgeId,
      'space_mined',
      '🌐 New Space Mined!',
      `${spaceMined}KB of space mined from ${url} (${biomeType} biome)`,
      { spaceMined, url, biomeType }
    );
  }

  /**
   * Create user joined notification
   */
  async notifyUserJoined(bridgeId: string, userName: string): Promise<void> {
    await this.sendBridgeNotification(
      bridgeId,
      'user_joined',
      '👋 User Joined',
      `${userName} joined the bridge chat`,
      { userName }
    );
  }

  /**
   * Create user left notification
   */
  async notifyUserLeft(bridgeId: string, userName: string): Promise<void> {
    await this.sendBridgeNotification(
      bridgeId,
      'user_left',
      '👋 User Left',
      `${userName} left the bridge chat`,
      { userName }
    );
  }

  /**
   * Create optimization complete notification
   */
  async notifyOptimizationComplete(
    bridgeId: string,
    optimizationType: string,
    spaceSaved: number
  ): Promise<void> {
    await this.sendBridgeNotification(
      bridgeId,
      'optimization_complete',
      '⚡ Optimization Complete',
      `${optimizationType} optimization saved ${spaceSaved}KB of space`,
      { optimizationType, spaceSaved }
    );
  }

  /**
   * Create system alert notification
   */
  async notifySystemAlert(title: string, message: string, data?: any): Promise<void> {
    await this.sendSystemNotification(
      'system_alert',
      `🚨 ${title}`,
      message,
      data
    );
  }
}

export default BridgeNotificationService;