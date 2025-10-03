import { Logger } from './Logger';

export interface PWAConfig {
  cacheName: string;
  cacheVersion: string;
  urlsToCache: string[];
  offlinePage: string;
}

export class PWAInitializer {
  private logger: Logger;
  private config: PWAConfig;
  private installPrompt: any = null;
  private isInstalled: boolean = false;

  constructor(config: PWAConfig) {
    this.logger = new Logger('PWAInitializer');
    this.config = config;
  }

  /**
   * Initialize PWA functionality
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing PWA functionality');

      // Register service worker
      await this.registerServiceWorker();

      // Setup install prompt
      this.setupInstallPrompt();

      // Check installation status
      this.checkInstallationStatus();

      // Setup online/offline handling
      this.setupOnlineOfflineHandling();

      // Setup update handling
      this.setupUpdateHandling();

      this.logger.info('PWA functionality initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PWA functionality:', error);
      throw error;
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        this.logger.info('Service worker registered successfully');

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.logger.info('New service worker available');
                this.showUpdateNotification();
              }
            });
          }
        });

      } catch (error) {
        this.logger.error('Service worker registration failed:', error);
        throw error;
      }
    } else {
      this.logger.warn('Service workers not supported');
    }
  }

  /**
   * Setup install prompt
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.logger.info('Install prompt available');
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.logger.info('PWA installed successfully');
      this.hideInstallButton();
    });
  }

  /**
   * Check installation status
   */
  private checkInstallationStatus(): void {
    // Check if running in standalone mode
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;

    if (this.isInstalled) {
      this.logger.info('PWA is already installed');
      this.hideInstallButton();
    }
  }

  /**
   * Setup online/offline handling
   */
  private setupOnlineOfflineHandling(): void {
    window.addEventListener('online', () => {
      this.logger.info('App is online');
      this.showStatusNotification('You are back online', 'success');
    });

    window.addEventListener('offline', () => {
      this.logger.info('App is offline');
      this.showStatusNotification('You are offline. Some features may not be available.', 'warning');
    });
  }

  /**
   * Setup update handling
   */
  private setupUpdateHandling(): void {
    // Handle update button click
    const updateButton = document.getElementById('update-button');
    if (updateButton) {
      updateButton.addEventListener('click', () => this.updatePWA());
    }

    // Handle dismiss update button click
    const dismissButton = document.getElementById('dismiss-update');
    if (dismissButton) {
      dismissButton.addEventListener('click', () => this.hideUpdateNotification());
    }
  }

  /**
   * Show install button
   */
  private showInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.installPWA());
    }
  }

  /**
   * Hide install button
   */
  private hideInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  /**
   * Install PWA
   */
  async installPWA(): Promise<void> {
    if (!this.installPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.logger.info('User accepted PWA installation');
      } else {
        this.logger.info('User dismissed PWA installation');
      }

      this.installPrompt = null;
    } catch (error) {
      this.logger.error('Failed to install PWA:', error);
      throw error;
    }
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(): void {
    const notification = document.getElementById('pwa-update-notification');
    if (notification) {
      notification.style.display = 'block';
    }
  }

  /**
   * Hide update notification
   */
  private hideUpdateNotification(): void {
    const notification = document.getElementById('pwa-update-notification');
    if (notification) {
      notification.style.display = 'none';
    }
  }

  /**
   * Update PWA
   */
  async updatePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  /**
   * Show status notification
   */
  private showStatusNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    const notification = document.getElementById('pwa-status-notification');
    const messageElement = document.getElementById('pwa-status-message');
    
    if (notification && messageElement) {
      messageElement.textContent = message;
      notification.style.display = 'block';
      
      // Add type-specific styling
      notification.className = `pwa-notification pwa-notification-${type}`;
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Get PWA status
   */
  getPWAStatus(): {
    isInstalled: boolean;
    isOnline: boolean;
    canInstall: boolean;
    hasServiceWorker: boolean;
  } {
    return {
      isInstalled: this.isInstalled,
      isOnline: navigator.onLine,
      canInstall: !!this.installPrompt,
      hasServiceWorker: 'serviceWorker' in navigator,
    };
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Show notification
   */
  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  }

  /**
   * Setup background sync
   */
  async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        try {
          await registration.sync.register('background-sync');
          this.logger.info('Background sync registered');
        } catch (error) {
          this.logger.error('Background sync registration failed:', error);
        }
      }
    }
  }

  /**
   * Setup periodic background sync
   */
  async setupPeriodicBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        try {
          await (registration as any).periodicSync.register('optimization-sync', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          });
          this.logger.info('Periodic background sync registered');
        } catch (error) {
          this.logger.error('Periodic background sync registration failed:', error);
        }
      }
    }
  }
}

export default PWAInitializer;