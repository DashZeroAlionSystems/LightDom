/**
 * Initialize Persistence System
 * Main script to initialize all persistence components on app startup
 */

import { persistentBlockchainStorage } from '../core/PersistentBlockchainStorage';
import { browserRefreshHandler } from './BrowserRefreshHandler';
import { blockchainPersistenceIntegration } from './BlockchainPersistenceIntegration';
import { lightDomStorageAPI } from '../api/LightDomStorageApi';

export class PersistenceInitializer {
  private static instance: PersistenceInitializer;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): PersistenceInitializer {
    if (!PersistenceInitializer.instance) {
      PersistenceInitializer.instance = new PersistenceInitializer();
    }
    return PersistenceInitializer.instance;
  }

  /**
   * Initialize the entire persistence system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Persistence system already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing LightDom Persistence System...');

      // Initialize persistent blockchain storage
      await this.initializeBlockchainStorage();

      // Initialize browser refresh handling
      await this.initializeBrowserRefresh();

      // Initialize blockchain persistence integration
      await this.initializeBlockchainIntegration();

      // Initialize Light DOM storage API
      await this.initializeLightDomStorage();

      // Setup global error handling
      this.setupGlobalErrorHandling();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      this.isInitialized = true;
      console.log('✅ LightDom Persistence System initialized successfully');

      // Log system status
      await this.logSystemStatus();

    } catch (error) {
      console.error('❌ Error initializing persistence system:', error);
      throw error;
    }
  }

  /**
   * Initialize blockchain storage
   */
  private async initializeBlockchainStorage(): Promise<void> {
    console.log('📦 Initializing blockchain storage...');
    
    // Load persistent data
    await persistentBlockchainStorage.loadPersistentData();
    
    // Get Chrome limits
    const chromeLimits = persistentBlockchainStorage.getChromeUploadLimits();
    console.log('Chrome upload limits:', chromeLimits);
    
    console.log('✅ Blockchain storage initialized');
  }

  /**
   * Initialize browser refresh handling
   */
  private async initializeBrowserRefresh(): Promise<void> {
    console.log('🔄 Initializing browser refresh handling...');
    
    // Setup automatic refresh handling
    browserRefreshHandler.setupAutomaticRefresh();
    
    console.log('✅ Browser refresh handling initialized');
  }

  /**
   * Initialize blockchain integration
   */
  private async initializeBlockchainIntegration(): Promise<void> {
    console.log('🔗 Initializing blockchain integration...');
    
    // The integration is already initialized in its constructor
    console.log('✅ Blockchain integration initialized');
  }

  /**
   * Initialize Light DOM storage API
   */
  private async initializeLightDomStorage(): Promise<void> {
    console.log('💾 Initializing Light DOM storage API...');
    
    // Get Chrome limits for display
    const chromeLimits = lightDomStorageAPI.getChromeLimits();
    console.log('Chrome limits configured:', chromeLimits);
    
    console.log('✅ Light DOM storage API initialized');
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    console.log('🛡️ Setting up global error handling...');

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
      this.handleError(event.error);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
    });

    console.log('✅ Global error handling setup complete');
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    console.log('📊 Setting up performance monitoring...');

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          console.log('Memory usage:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
          });
        }
      }, 30000); // Every 30 seconds
    }

    // Monitor storage usage
    setInterval(async () => {
      try {
        const stats = await persistentBlockchainStorage.getStorageStats();
        console.log('Storage usage:', stats);
      } catch (error) {
        console.error('Error getting storage stats:', error);
      }
    }, 60000); // Every minute

    console.log('✅ Performance monitoring setup complete');
  }

  /**
   * Handle errors
   */
  private async handleError(error: any): Promise<void> {
    try {
      // Save error to localStorage
      const errorData = {
        timestamp: Date.now(),
        message: error.message || 'Unknown error',
        stack: error.stack || '',
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      localStorage.setItem('lightdom_error', JSON.stringify(errorData));

      // Attempt to save current state
      await persistentBlockchainStorage.saveCurrentState();

    } catch (saveError) {
      console.error('Error saving error state:', saveError);
    }
  }

  /**
   * Log system status
   */
  private async logSystemStatus(): Promise<void> {
    try {
      const status = await blockchainPersistenceIntegration.getSystemStatus();
      console.log('📊 System Status:', status);
    } catch (error) {
      console.error('Error getting system status:', error);
    }
  }

  /**
   * Get initialization status
   */
  public isSystemInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Force reinitialize
   */
  public async reinitialize(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }

  /**
   * Get system health
   */
  public async getSystemHealth(): Promise<{
    initialized: boolean;
    storage: any;
    sync: any;
    errors: any;
  }> {
    const status = await blockchainPersistenceIntegration.getSystemStatus();
    const storageStats = await persistentBlockchainStorage.getStorageStats();
    const syncStatus = await persistentBlockchainStorage.getSyncStatus();
    const errorData = localStorage.getItem('lightdom_error');

    return {
      initialized: this.isInitialized,
      storage: storageStats,
      sync: syncStatus,
      errors: errorData ? JSON.parse(errorData) : null
    };
  }
}

// Auto-initialize on import
const persistenceInitializer = PersistenceInitializer.getInstance();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    persistenceInitializer.initialize();
  });
} else {
  persistenceInitializer.initialize();
}

export { persistenceInitializer };
