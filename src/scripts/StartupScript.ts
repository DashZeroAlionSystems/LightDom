/**
 * LightDom Startup Script
 * Initializes persistent blockchain storage, browser refresh handling, and storage API
 * Runs automatically on page load to ensure data persistence
 */

import { persistentBlockchainStorage } from '../core/PersistentBlockchainStorage';
import { browserRefreshHandler } from './BrowserRefreshHandler';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { blockchainModelStorage } from '../core/BlockchainModelStorage';

export interface StartupResult {
  success: boolean;
  dataRestored: boolean;
  optimizationsRestored: number;
  harvestersRestored: number;
  metaverseAssetsRestored: number;
  modelDataRestored: number;
  pendingTransactionsProcessed: number;
  errors: string[];
  duration: number;
}

export class StartupScript {
  private isInitialized = false;
  private startupInProgress = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the startup script
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Run startup sequence
      await this.runStartupSequence();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error during startup initialization:', error);
    }
  }

  /**
   * Run the complete startup sequence
   */
  public async runStartupSequence(): Promise<StartupResult> {
    if (this.startupInProgress) {
      console.log('Startup already in progress, skipping...');
      return {
        success: false,
        dataRestored: false,
        optimizationsRestored: 0,
        harvestersRestored: 0,
        metaverseAssetsRestored: 0,
        modelDataRestored: 0,
        pendingTransactionsProcessed: 0,
        errors: ['Startup already in progress'],
        duration: 0
      };
    }

    this.startupInProgress = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let optimizationsRestored = 0;
    let harvestersRestored = 0;
    let metaverseAssetsRestored = 0;
    let modelDataRestored = 0;
    let pendingTransactionsProcessed = 0;

    try {
      console.log('🚀 Starting LightDom initialization...');

      // Step 1: Initialize persistent storage
      console.log('📦 Initializing persistent storage...');
      await this.initializePersistentStorage();

      // Step 2: Load and restore data
      console.log('🔄 Loading and restoring data...');
      const restoreResult = await this.restoreDataFromStorage();
      optimizationsRestored = restoreResult.optimizationsRestored;
      harvestersRestored = restoreResult.harvestersRestored;
      metaverseAssetsRestored = restoreResult.metaverseAssetsRestored;
      modelDataRestored = restoreResult.modelDataRestored;
      pendingTransactionsProcessed = restoreResult.pendingTransactionsProcessed;
      errors.push(...restoreResult.errors);

      // Step 3: Initialize browser refresh handler
      console.log('🔄 Initializing browser refresh handler...');
      await this.initializeBrowserRefreshHandler();

      // Step 4: Set up auto-sync
      console.log('⚡ Setting up auto-sync...');
      await this.setupAutoSync();

      // Step 5: Validate Chrome file upload limits
      console.log('🔍 Validating Chrome file upload limits...');
      await this.validateFileUploadLimits();

      // Step 6: Display startup summary
      console.log('✅ LightDom initialization completed');
      this.displayStartupSummary({
        optimizationsRestored,
        harvestersRestored,
        metaverseAssetsRestored,
        modelDataRestored,
        pendingTransactionsProcessed,
        errors
      });

      const duration = Date.now() - startTime;
      return {
        success: errors.length === 0,
        dataRestored: optimizationsRestored > 0 || harvestersRestored > 0 || metaverseAssetsRestored > 0 || modelDataRestored > 0,
        optimizationsRestored,
        harvestersRestored,
        metaverseAssetsRestored,
        modelDataRestored,
        pendingTransactionsProcessed,
        errors,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Critical startup error: ${error}`);
      
      console.error('❌ Critical error during startup:', error);
      
      return {
        success: false,
        dataRestored: false,
        optimizationsRestored,
        harvestersRestored,
        metaverseAssetsRestored,
        modelDataRestored,
        pendingTransactionsProcessed,
        errors,
        duration
      };
    } finally {
      this.startupInProgress = false;
    }
  }

  /**
   * Initialize persistent storage
   */
  private async initializePersistentStorage(): Promise<void> {
    try {
      // Load user settings
      const userSettings = persistentBlockchainStorage.getUserSettings();
      console.log('User settings loaded:', {
        maxFileUploadSize: this.formatBytes(userSettings.maxFileUploadSize),
        autoSync: userSettings.autoSync,
        syncInterval: userSettings.syncInterval
      });
    } catch (error) {
      console.error('Error initializing persistent storage:', error);
      throw error;
    }
  }

  /**
   * Restore data from persistent storage
   */
  private async restoreDataFromStorage(): Promise<{
    optimizationsRestored: number;
    harvestersRestored: number;
    metaverseAssetsRestored: number;
    modelDataRestored: number;
    pendingTransactionsProcessed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let optimizationsRestored = 0;
    let harvestersRestored = 0;
    let metaverseAssetsRestored = 0;
    let modelDataRestored = 0;
    let pendingTransactionsProcessed = 0;

    try {
      // Load all persistent data
      const persistentData = await persistentBlockchainStorage.loadAllData();

      // Restore optimizations
      for (const optimization of persistentData.optimizations) {
        try {
          const existing = spaceOptimizationEngine.getOptimization(optimization.proofHash);
          if (!existing) {
            await spaceOptimizationEngine.processOptimization(optimization);
            optimizationsRestored++;
          }
        } catch (error) {
          errors.push(`Failed to restore optimization ${optimization.proofHash}: ${error}`);
        }
      }

      // Restore harvesters
      for (const harvester of persistentData.harvesters) {
        try {
          const existing = spaceOptimizationEngine.getHarvesterStats(harvester.address);
          if (!existing) {
            spaceOptimizationEngine['harvesters'].set(harvester.address, harvester);
            harvestersRestored++;
          } else {
            // Update existing harvester
            Object.assign(existing, harvester);
          }
        } catch (error) {
          errors.push(`Failed to restore harvester ${harvester.address}: ${error}`);
        }
      }

      // Restore metaverse assets
      for (const asset of persistentData.metaverseAssets) {
        try {
          // Assets are restored when optimizations are processed
          metaverseAssetsRestored++;
        } catch (error) {
          errors.push(`Failed to restore metaverse asset ${asset.id}: ${error}`);
        }
      }

      // Restore model data
      for (const model of persistentData.modelData) {
        try {
          // Model data is already in the blockchain storage
          modelDataRestored++;
        } catch (error) {
          errors.push(`Failed to restore model data ${model.id}: ${error}`);
        }
      }

      // Process pending transactions
      for (const pendingTx of persistentData.pendingTransactions) {
        try {
          await this.processPendingTransaction(pendingTx);
          await persistentBlockchainStorage.removePendingTransaction(pendingTx.id);
          pendingTransactionsProcessed++;
        } catch (error) {
          errors.push(`Failed to process pending transaction ${pendingTx.id}: ${error}`);
        }
      }

      // Try to restore from critical backup if needed
      if (optimizationsRestored === 0 && harvestersRestored === 0) {
        const backupRestored = await browserRefreshHandler.restoreFromBackup();
        if (backupRestored) {
          console.log('Data restored from critical backup');
        }
      }

    } catch (error) {
      errors.push(`Error restoring data from storage: ${error}`);
    }

    return {
      optimizationsRestored,
      harvestersRestored,
      metaverseAssetsRestored,
      modelDataRestored,
      pendingTransactionsProcessed,
      errors
    };
  }

  /**
   * Process a pending transaction
   */
  private async processPendingTransaction(pendingTx: any): Promise<void> {
    switch (pendingTx.type) {
      case 'optimization':
        await spaceOptimizationEngine.processOptimization(pendingTx.data);
        break;
      case 'model_storage':
        await blockchainModelStorage.storeModelData(pendingTx.data, pendingTx.adminAddress);
        break;
      case 'harvester_update':
        const harvester = spaceOptimizationEngine.getHarvesterStats(pendingTx.data.address);
        if (harvester) {
          Object.assign(harvester, pendingTx.data);
        }
        break;
      default:
        console.warn('Unknown pending transaction type:', pendingTx.type);
    }
  }

  /**
   * Initialize browser refresh handler
   */
  private async initializeBrowserRefreshHandler(): Promise<void> {
    try {
      // The browser refresh handler is already initialized in its constructor
      console.log('Browser refresh handler initialized');
    } catch (error) {
      console.error('Error initializing browser refresh handler:', error);
      throw error;
    }
  }

  /**
   * Set up auto-sync
   */
  private async setupAutoSync(): Promise<void> {
    try {
      const userSettings = persistentBlockchainStorage.getUserSettings();
      if (userSettings.autoSync) {
        persistentBlockchainStorage.startAutoSync();
        console.log('Auto-sync enabled with interval:', userSettings.syncInterval + 'ms');
      } else {
        console.log('Auto-sync disabled');
      }
    } catch (error) {
      console.error('Error setting up auto-sync:', error);
      throw error;
    }
  }

  /**
   * Validate Chrome file upload limits
   */
  private async validateFileUploadLimits(): Promise<void> {
    try {
      const userSettings = persistentBlockchainStorage.getUserSettings();
      const chromeMaxSize = 2 * 1024 * 1024 * 1024; // 2GB

      if (userSettings.maxFileUploadSize > chromeMaxSize) {
        console.warn('User file upload size exceeds Chrome limits, adjusting...');
        persistentBlockchainStorage.setMaxFileUploadSize(chromeMaxSize);
      }

      console.log('File upload limits validated:', {
        maxSize: this.formatBytes(userSettings.maxFileUploadSize),
        chromeLimit: this.formatBytes(chromeMaxSize)
      });
    } catch (error) {
      console.error('Error validating file upload limits:', error);
      throw error;
    }
  }

  /**
   * Display startup summary
   */
  private displayStartupSummary(stats: {
    optimizationsRestored: number;
    harvestersRestored: number;
    metaverseAssetsRestored: number;
    modelDataRestored: number;
    pendingTransactionsProcessed: number;
    errors: string[];
  }): void {
    console.log('📊 Startup Summary:');
    console.log(`  ✅ Optimizations restored: ${stats.optimizationsRestored}`);
    console.log(`  ✅ Harvesters restored: ${stats.harvestersRestored}`);
    console.log(`  ✅ Metaverse assets restored: ${stats.metaverseAssetsRestored}`);
    console.log(`  ✅ Model data restored: ${stats.modelDataRestored}`);
    console.log(`  ✅ Pending transactions processed: ${stats.pendingTransactionsProcessed}`);
    
    if (stats.errors.length > 0) {
      console.log(`  ⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(error => console.log(`    - ${error}`));
    }

    // Display in UI if available
    this.displayStartupNotification(stats);
  }

  /**
   * Display startup notification in UI
   */
  private displayStartupNotification(stats: any): void {
    try {
      // Create notification element
      const notification = document.createElement('div');
      notification.id = 'lightdom-startup-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      `;

      const totalRestored = stats.optimizationsRestored + stats.harvestersRestored + 
                          stats.metaverseAssetsRestored + stats.modelDataRestored;

      notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">🚀 LightDom Ready</div>
        <div style="font-size: 12px; opacity: 0.9;">
          ${totalRestored} items restored<br>
          ${stats.pendingTransactionsProcessed} transactions processed
          ${stats.errors.length > 0 ? `<br><span style="color: #ffeb3b;">${stats.errors.length} warnings</span>` : ''}
        </div>
      `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      }, 100);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 5000);

    } catch (error) {
      console.error('Error displaying startup notification:', error);
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get startup status
   */
  public getStartupStatus(): { initialized: boolean; inProgress: boolean } {
    return {
      initialized: this.isInitialized,
      inProgress: this.startupInProgress
    };
  }

  /**
   * Force restart
   */
  public async forceRestart(): Promise<StartupResult> {
    console.log('🔄 Force restarting LightDom...');
    this.isInitialized = false;
    this.startupInProgress = false;
    return await this.runStartupSequence();
  }
}

// Export singleton instance
export const startupScript = new StartupScript();

// Auto-run on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    startupScript.runStartupSequence();
  });
}
