/**
 * Blockchain Persistence Integration
 * Main integration script that ties together all persistence components
 */

import { persistentBlockchainStorage } from '../core/PersistentBlockchainStorage';
import { browserRefreshHandler } from './BrowserRefreshHandler';

export class BlockchainPersistenceIntegration {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the persistence system
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing Blockchain Persistence System...');

      // Load persistent data on startup
      await persistentBlockchainStorage.loadPersistentData();

      // Setup browser refresh handling
      browserRefreshHandler.setupAutomaticRefresh();

      // Setup periodic sync
      this.setupPeriodicSync();

      // Setup error handling
      this.setupErrorHandling();

      this.isInitialized = true;
      console.log('✅ Blockchain Persistence System initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing persistence system:', error);
    }
  }

  /**
   * Setup periodic synchronization
   */
  private setupPeriodicSync(): void {
    // Sync every 30 seconds
    setInterval(async () => {
      try {
        await persistentBlockchainStorage.forceSync();
        console.log('🔄 Periodic sync completed');
      } catch (error) {
        console.error('❌ Periodic sync failed:', error);
      }
    }, 30000);

    // Save state every 10 seconds
    setInterval(async () => {
      try {
        await persistentBlockchainStorage.saveCurrentState();
        console.log('💾 State saved');
      } catch (error) {
        console.error('❌ State save failed:', error);
      }
    }, 10000);
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    // Log error to console
    console.error('Error handled:', error);

    // Save error state
    this.saveErrorState(error);

    // Attempt recovery
    this.attemptRecovery();
  }

  /**
   * Save error state
   */
  private async saveErrorState(error: any): Promise<void> {
    try {
      const errorData = {
        timestamp: Date.now(),
        message: error.message || 'Unknown error',
        stack: error.stack || '',
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      localStorage.setItem('lightdom_error', JSON.stringify(errorData));
    } catch (saveError) {
      console.error('Failed to save error state:', saveError);
    }
  }

  /**
   * Attempt recovery
   */
  private async attemptRecovery(): Promise<void> {
    try {
      // Clear corrupted data
      await persistentBlockchainStorage.clearAllData();

      // Reload from backup
      await persistentBlockchainStorage.loadPersistentData();

      console.log('🔄 Recovery attempted');
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
    }
  }

  /**
   * Get system status
   */
  public async getSystemStatus(): Promise<{
    initialized: boolean;
    lastSync: number;
    syncStatus: string;
    storageStats: any;
    errorCount: number;
  }> {
    const syncStatus = await persistentBlockchainStorage.getSyncStatus();
    const storageStats = await persistentBlockchainStorage.getStorageStats();
    const errorData = localStorage.getItem('lightdom_error');
    const errorCount = errorData ? 1 : 0;

    return {
      initialized: this.isInitialized,
      lastSync: syncStatus.lastSync,
      syncStatus: syncStatus.status,
      storageStats,
      errorCount
    };
  }

  /**
   * Force full sync
   */
  public async forceFullSync(): Promise<void> {
    try {
      console.log('🔄 Starting full sync...');
      await persistentBlockchainStorage.forceSync();
      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  public async clearAllData(): Promise<void> {
    try {
      await persistentBlockchainStorage.clearAllData();
      await browserRefreshHandler.clearRefreshData();
      localStorage.removeItem('lightdom_error');
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Export all data
   */
  public async exportAllData(): Promise<Blob> {
    try {
      const data = {
        persistentData: await persistentBlockchainStorage.getFromIndexedDB('persistentData'),
        refreshData: localStorage.getItem('lightdom_sync'),
        errorData: localStorage.getItem('lightdom_error'),
        exportDate: Date.now(),
        version: '1.0.0'
      };

      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from backup
   */
  public async importData(blob: Blob): Promise<void> {
    try {
      const text = await blob.text();
      const data = JSON.parse(text);

      if (data.persistentData) {
        await persistentBlockchainStorage.saveToIndexedDB('persistentData', data.persistentData);
      }

      if (data.refreshData) {
        localStorage.setItem('lightdom_sync', data.refreshData);
      }

      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('❌ Error importing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainPersistenceIntegration = new BlockchainPersistenceIntegration();
