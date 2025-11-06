import { Logger } from '../../utils/Logger';

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  theme_color: string;
  background_color: string;
  icons: PWAIcon[];
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl';
  scope: string;
  id?: string;
  prefer_related_applications?: boolean;
  related_applications?: RelatedApplication[];
  shortcuts?: PWAShortcut[];
  screenshots?: PWAScreenshot[];
  edge_side_panel?: PWASidePanel;
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface RelatedApplication {
  platform: string;
  url: string;
  id?: string;
  min_version?: string;
}

export interface PWAShortcut {
  name: string;
  short_name: string;
  description: string;
  url: string;
  icons?: PWAIcon[];
}

export interface PWAScreenshot {
  src: string;
  sizes: string;
  type: string;
  form_factor: 'narrow' | 'wide';
  label: string;
}

export interface PWASidePanel {
  preferred_width: number;
}

export interface ServiceWorkerConfig {
  cacheName: string;
  cacheVersion: string;
  urlsToCache: string[];
  offlinePage: string;
  updateInterval: number;
}

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAService {
  private logger: Logger;
  private manifest: PWAManifest;
  private serviceWorkerConfig: ServiceWorkerConfig;
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled: boolean = false;
  private isOnline: boolean = navigator.onLine;

  constructor(manifest: PWAManifest, serviceWorkerConfig: ServiceWorkerConfig) {
    this.logger = new Logger('PWAService');
    this.manifest = manifest;
    this.serviceWorkerConfig = serviceWorkerConfig;
    this.setupEventListeners();
  }

  /**
   * Initialize PWA service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing PWA service');

      // Register service worker
      await this.registerServiceWorker();

      // Setup install prompt
      this.setupInstallPrompt();

      // Check if already installed
      this.checkInstallationStatus();

      // Setup online/offline handling
      this.setupOnlineOfflineHandling();

      this.logger.info('PWA service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PWA service:', error);
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
      // cast via unknown to avoid TS converting Event -> PWAInstallPrompt directly
      // (the runtime event is a browser-provided prompt event with extra fields)
      this.installPrompt = e as unknown as PWAInstallPrompt;
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
      this.isOnline = true;
      this.logger.info('App is online');
      this.showOnlineNotification();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.logger.info('App is offline');
      this.showOfflineNotification();
    });
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
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.className = 'pwa-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>Update Available</h3>
        <p>A new version of the app is available.</p>
        <button id="update-button" class="btn btn-primary">Update Now</button>
        <button id="dismiss-update" class="btn btn-secondary">Later</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('update-button')?.addEventListener('click', () => {
      this.updatePWA();
    });

    document.getElementById('dismiss-update')?.addEventListener('click', () => {
      notification.remove();
    });
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
   * Show online notification
   */
  private showOnlineNotification(): void {
    this.showNotification('You are back online', 'success');
  }

  /**
   * Show offline notification
   */
  private showOfflineNotification(): void {
    this.showNotification('You are offline. Some features may not be available.', 'warning');
  }

  /**
   * Show notification
   */
  private showNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Create PWA manifest
   */
  createManifest(): string {
    return JSON.stringify(this.manifest, null, 2);
  }

  /**
   * Generate service worker
   */
  generateServiceWorker(): string {
    return `
      const CACHE_NAME = '${this.serviceWorkerConfig.cacheName}-${this.serviceWorkerConfig.cacheVersion}';
      const urlsToCache = ${JSON.stringify(this.serviceWorkerConfig.urlsToCache)};

      // Install event
      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('Opened cache');
              return cache.addAll(urlsToCache);
            })
        );
      });

      // Fetch event
      self.addEventListener('fetch', (event) => {
        event.respondWith(
          caches.match(event.request)
            .then((response) => {
              // Return cached version or fetch from network
              return response || fetch(event.request);
            })
        );
      });

      // Activate event
      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                  console.log('Deleting old cache:', cacheName);
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
      });

      // Handle skip waiting
      self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          self.skipWaiting();
        }
      });
    `;
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
      isOnline: this.isOnline,
      canInstall: !!this.installPrompt,
      hasServiceWorker: 'serviceWorker' in navigator,
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logger.info('App hidden');
      } else {
        this.logger.info('App visible');
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.logger.info('App unloading');
    });
  }

  /**
   * Create PWA HTML template
   */
  createPWAHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="${this.manifest.lang}" dir="${this.manifest.dir}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="${this.manifest.theme_color}">
        <meta name="description" content="${this.manifest.description}">
        
        <title>${this.manifest.name}</title>
        
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
        <link rel="apple-touch-icon" href="/icon-192.png">
        
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${this.manifest.background_color};
            color: #333;
          }
          
          .pwa-install-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${this.manifest.theme_color};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            display: none;
            z-index: 1000;
          }
          
          .pwa-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          
          .pwa-notification-success {
            border-left: 4px solid #4CAF50;
          }
          
          .pwa-notification-warning {
            border-left: 4px solid #FF9800;
          }
          
          .pwa-notification-error {
            border-left: 4px solid #F44336;
          }
        </style>
      </head>
      <body>
        <div id="app">
          <h1>${this.manifest.name}</h1>
          <p>${this.manifest.description}</p>
        </div>
        
        <button id="pwa-install-button" class="pwa-install-button">
          Install App
        </button>
        
        <script>
          // PWA functionality will be added here
        </script>
      </body>
      </html>
    `;
  }
}

export default PWAService;
