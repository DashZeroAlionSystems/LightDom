/**
 * PWA Notification Service
 * Handles push notifications, background sync, and offline capabilities
 */

export class PWANotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private subscription: PushSubscription | null = null;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Initialize PWA features
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('PWA features not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      // Register background sync
      await this.registerBackgroundSync();

      // Request notification permission
      await this.requestNotificationPermission();

      // Subscribe to push notifications
      await this.subscribeToPushNotifications();

      return true;
    } catch (error) {
      console.error('Failed to initialize PWA features:', error);
      return false;
    }
  }

  /**
   * Register background sync for different data types
   */
  async registerBackgroundSync(): Promise<void> {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background sync not supported');
      return;
    }

    try {
      // Register sync tags for different data types
      await this.registration.sync.register('optimization-sync');
      await this.registration.sync.register('wallet-sync');
      await this.registration.sync.register('blockchain-sync');
      await this.registration.sync.register('crawler-sync');
      
      console.log('Background sync registered');
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    console.log('Notification permission:', permission);
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(): Promise<boolean> {
    if (!this.registration || !this.registration.pushManager) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (!this.subscription) {
        // Create new subscription
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI8pWz1z1cjVvVty4cW0J8uFofOj8M8bGdmq7J2HgEa1bR0CbGQqCN9-8'
          )
        });
      }

      console.log('Push subscription:', this.subscription);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  /**
   * Send a notification
   */
  async sendNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      console.warn('Cannot send notification - permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      body: 'LightDom update',
      icon: '/icon-192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      tag: 'lightdom-notification',
      requireInteraction: false,
      ...options
    };

    await this.registration.showNotification(title, defaultOptions);
  }

  /**
   * Send system alert notification
   */
  async sendSystemAlert(type: 'success' | 'warning' | 'error' | 'info', message: string): Promise<void> {
    const alertConfig = {
      success: {
        title: '✅ Success',
        icon: '/icons/success.png',
        tag: 'system-success'
      },
      warning: {
        title: '⚠️ Warning',
        icon: '/icons/warning.png',
        tag: 'system-warning'
      },
      error: {
        title: '❌ Error',
        icon: '/icons/error.png',
        tag: 'system-error',
        requireInteraction: true
      },
      info: {
        title: 'ℹ️ Info',
        icon: '/icons/info.png',
        tag: 'system-info'
      }
    };

    const config = alertConfig[type];
    await this.sendNotification(config.title, {
      body: message,
      icon: config.icon,
      tag: config.tag,
      requireInteraction: config.requireInteraction || false
    });
  }

  /**
   * Send blockchain mining notification
   */
  async sendMiningNotification(blockNumber: number, tokensRewarded: number): Promise<void> {
    await this.sendNotification('⛏️ Block Mined!', {
      body: `Block #${blockNumber} mined successfully. Rewarded ${tokensRewarded} LightDom tokens.`,
      tag: 'mining-success',
      requireInteraction: false,
      actions: [
        {
          action: 'view-wallet',
          title: 'View Wallet',
          icon: '/icons/wallet.png'
        }
      ]
    });
  }

  /**
   * Send crawler optimization notification
   */
  async sendOptimizationNotification(url: string, spaceSaved: number): Promise<void> {
    await this.sendNotification('🕷️ Optimization Complete', {
      body: `Optimized ${url} and saved ${spaceSaved}MB of space.`,
      tag: 'optimization-complete',
      requireInteraction: false,
      actions: [
        {
          action: 'view-dashboard',
          title: 'View Dashboard',
          icon: '/icons/dashboard.png'
        }
      ]
    });
  }

  /**
   * Send wallet transaction notification
   */
  async sendWalletNotification(type: 'received' | 'sent' | 'purchase', amount: number, currency: string): Promise<void> {
    const typeConfig = {
      received: {
        title: '💰 Payment Received',
        body: `Received ${amount} ${currency}`
      },
      sent: {
        title: '💸 Payment Sent',
        body: `Sent ${amount} ${currency}`
      },
      purchase: {
        title: '🛒 Purchase Complete',
        body: `Purchased item for ${amount} ${currency}`
      }
    };

    const config = typeConfig[type];
    await this.sendNotification(config.title, {
      body: config.body,
      tag: `wallet-${type}`,
      requireInteraction: false
    });
  }

  /**
   * Send metaverse notification
   */
  async sendMetaverseNotification(type: 'bridge' | 'chat' | 'economy', message: string): Promise<void> {
    const typeConfig = {
      bridge: {
        title: '🌉 Bridge Update',
        icon: '/icons/bridge.png'
      },
      chat: {
        title: '💬 New Message',
        icon: '/icons/chat.png'
      },
      economy: {
        title: '💎 Economy Update',
        icon: '/icons/economy.png'
      }
    };

    const config = typeConfig[type];
    await this.sendNotification(config.title, {
      body: message,
      icon: config.icon,
      tag: `metaverse-${type}`,
      requireInteraction: false
    });
  }

  /**
   * Handle notification clicks
   */
  setupNotificationClickHandler(): void {
    if (!this.registration) return;

    this.registration.addEventListener('notificationclick', (event) => {
      event.notification.close();

      const action = event.action;
      const data = event.notification.data;

      // Handle different actions
      switch (action) {
        case 'view-wallet':
          this.navigateToPage('/wallet');
          break;
        case 'view-dashboard':
          this.navigateToPage('/dashboard');
          break;
        case 'view-metaverse':
          this.navigateToPage('/metaverse');
          break;
        default:
          // Default action - open the app
          this.navigateToPage('/');
      }
    });
  }

  /**
   * Navigate to a specific page
   */
  private navigateToPage(path: string): void {
    // Check if app is already open
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.active?.postMessage({
          type: 'NAVIGATE',
          path: path
        });
      });
    });

    // Also try to open in current window
    if (window.location.pathname !== path) {
      window.location.pathname = path;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get subscription info
   */
  getSubscriptionInfo(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Check if PWA features are supported
   */
  isPWASupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if service worker is active
   */
  isServiceWorkerActive(): boolean {
    return this.registration !== null && this.registration.active !== null;
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service Worker updated');
    } catch (error) {
      console.error('Failed to update Service Worker:', error);
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.subscription) return false;

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      console.log('Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }
}

// Create singleton instance
export const pwaNotificationService = new PWANotificationService();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  pwaNotificationService.initialize().then((success) => {
    if (success) {
      console.log('✅ PWA Notification Service initialized');
      pwaNotificationService.setupNotificationClickHandler();
    } else {
      console.warn('⚠️ PWA Notification Service initialization failed');
    }
  });
}
