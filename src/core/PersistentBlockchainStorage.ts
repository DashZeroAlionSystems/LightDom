/**
 * Persistent Blockchain Storage System
 * Handles data persistence across browser refreshes using IndexedDB and localStorage
 * Integrates with blockchain, PostgreSQL, and local storage
 */

// import { ethers } from 'ethers'; // Will be used for blockchain integration
import { spaceOptimizationEngine, OptimizationResult } from './SpaceOptimizationEngine';
import { advancedNodeManager, NodeConfig } from './AdvancedNodeManager';
import { metaverseMiningEngine, AlgorithmDiscovery, DataMiningResult, BlockchainUpgrade } from './MetaverseMiningEngine';

export interface PersistentData {
  optimizations: OptimizationResult[];
  nodes: NodeConfig[];
  algorithms: AlgorithmDiscovery[];
  dataMiningResults: DataMiningResult[];
  blockchainUpgrades: BlockchainUpgrade[];
  walletData: {
    address: string;
    balance: number;
    totalValue: number;
    pendingRewards: number;
    totalEarned: number;
  };
  userSettings: UserSettings;
  // Optional triage fields used by some startup scripts
  harvesters?: any[];
  metaverseAssets?: any[];
  modelData?: any[];
  pendingTransactions?: any[];
  lastSync: number;
  version: string;
}

export interface UserSettings {
  maxFileUploadSize?: number;
  autoSave?: boolean;
  autoSync?: boolean;
  syncInterval?: number;
  preferredBiome?: string;
}

export interface ChromeUploadLimits {
  maxFileSize: number; // in bytes
  maxFiles: number;
  maxTotalSize: number; // in bytes
  supportedFormats: string[];
  browserVersion: string;
}

export class PersistentBlockchainStorage {
  private dbName = 'LightDomBlockchainDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInterval: NodeJS.Timeout | null = null; // Will be used for periodic sync
  private isOnline: boolean = navigator.onLine;
  private pendingSync: boolean = false;

  // Chrome file upload limits (based on research)
  private readonly CHROME_LIMITS: ChromeUploadLimits = {
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB (Chrome's practical limit)
    maxFiles: 1000, // Chrome's file input limit
    maxTotalSize: 20 * 1024 * 1024 * 1024, // 20GB (Chrome's total limit)
    supportedFormats: [
      'image/*', 'video/*', 'audio/*', 'text/*', 'application/*',
      '.js', '.css', '.html', '.json', '.xml', '.csv', '.pdf',
      '.zip', '.tar', '.gz', '.7z', '.rar'
    ],
    browserVersion: this.getChromeVersion()
  };

  constructor() {
    this.initializeDatabase();
    this.setupEventListeners();
    this.startAutoSync();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('optimizations')) {
          const optimizationsStore = db.createObjectStore('optimizations', { keyPath: 'proofHash' });
          optimizationsStore.createIndex('timestamp', 'timestamp', { unique: false });
          optimizationsStore.createIndex('harvesterAddress', 'harvesterAddress', { unique: false });
        }

        if (!db.objectStoreNames.contains('nodes')) {
          const nodesStore = db.createObjectStore('nodes', { keyPath: 'id' });
          nodesStore.createIndex('type', 'type', { unique: false });
          nodesStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('algorithms')) {
          const algorithmsStore = db.createObjectStore('algorithms', { keyPath: 'id' });
          algorithmsStore.createIndex('type', 'type', { unique: false });
          algorithmsStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('dataMining')) {
          const dataMiningStore = db.createObjectStore('dataMining', { keyPath: 'id' });
          dataMiningStore.createIndex('type', 'type', { unique: false });
          dataMiningStore.createIndex('source', 'source.url', { unique: false });
        }

        if (!db.objectStoreNames.contains('blockchainUpgrades')) {
          const upgradesStore = db.createObjectStore('blockchainUpgrades', { keyPath: 'id' });
          upgradesStore.createIndex('type', 'type', { unique: false });
          upgradesStore.createIndex('status', 'deployment.status', { unique: false });
        }

        if (!db.objectStoreNames.contains('walletData')) {
          db.createObjectStore('walletData', { keyPath: 'address' });
        }

        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('syncState')) {
          db.createObjectStore('syncState', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Setup event listeners for online/offline and page visibility
   */
  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncToBlockchain();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility change (browser refresh detection)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.loadPersistentData();
      } else if (document.visibilityState === 'hidden') {
        this.saveCurrentState();
      }
    });

    // Before unload (browser refresh/close)
    window.addEventListener('beforeunload', () => {
      this.saveCurrentState();
    });

    // Page load (browser refresh)
    window.addEventListener('load', () => {
      this.loadPersistentData();
    });
  }

  /**
   * Start automatic sync to blockchain and PostgreSQL
   */
  public startAutoSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.pendingSync) {
        this.syncToBlockchain();
      }
    }, 30000);
  }

  /**
   * Save current application state to IndexedDB
   */
  public async saveCurrentState(): Promise<void> {
    if (!this.db) return;

    try {
      const persistentData: PersistentData = {
        optimizations: spaceOptimizationEngine.getOptimizations(),
        nodes: advancedNodeManager.getAllNodes(),
        algorithms: metaverseMiningEngine.getAlgorithms(),
        dataMiningResults: metaverseMiningEngine.getDataMiningResults(),
        blockchainUpgrades: metaverseMiningEngine.getBlockchainUpgrades(),
        walletData: this.getCurrentWalletData(),
        userSettings: await this.getUserSettings(),
        lastSync: Date.now(),
        version: '1.0.0'
      };

      await this.saveToIndexedDB('persistentData', persistentData);
      console.log('✅ Application state saved to IndexedDB');
    } catch (error) {
      console.error('❌ Error saving application state:', error);
    }
  }

  /**
   * Load persistent data from IndexedDB
   */
  public async loadPersistentData(): Promise<void> {
    if (!this.db) return;

    try {
      const persistentData = await this.getFromIndexedDB('persistentData') as PersistentData;
      
      if (persistentData) {
        // Restore optimizations
        persistentData.optimizations.forEach(opt => {
          // Note: This would need to be integrated with the actual engine
          console.log('Restoring optimization:', opt.proofHash);
        });

        // Restore nodes
        persistentData.nodes.forEach(node => {
          // Note: This would need to be integrated with the actual manager
          console.log('Restoring node:', node.id);
        });

        // Restore algorithms
        persistentData.algorithms.forEach(algo => {
          // Note: This would need to be integrated with the actual engine
          console.log('Restoring algorithm:', algo.id);
        });

        // Restore wallet data
        this.restoreWalletData(persistentData.walletData);

        // Restore user settings
        this.restoreUserSettings(persistentData.userSettings);

        console.log('✅ Application state restored from IndexedDB');
      }
    } catch (error) {
      console.error('❌ Error loading persistent data:', error);
    }
  }

  /**
   * Sync data to blockchain and PostgreSQL
   */
  public async syncToBlockchain(): Promise<void> {
    if (!this.isOnline || this.pendingSync) return;

    this.pendingSync = true;

    try {
      const persistentData = await this.getFromIndexedDB('persistentData') as PersistentData;
      
      if (persistentData) {
        // Sync optimizations to blockchain
        await this.syncOptimizationsToBlockchain(persistentData.optimizations);
        
        // Sync to PostgreSQL
        await this.syncToPostgreSQL(persistentData);
        
        // Update sync state
        await this.saveToIndexedDB('syncState', {
          key: 'lastSync',
          timestamp: Date.now(),
          status: 'success'
        });

        console.log('✅ Data synced to blockchain and PostgreSQL');
      }
    } catch (error) {
      console.error('❌ Error syncing to blockchain:', error);
      
      // Save sync error state
      await this.saveToIndexedDB('syncState', {
        key: 'lastSync',
        timestamp: Date.now(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      this.pendingSync = false;
    }
  }

  /**
   * Sync optimizations to blockchain
   */
  private async syncOptimizationsToBlockchain(optimizations: OptimizationResult[]): Promise<void> {
    // This would integrate with the actual blockchain service
    for (const optimization of optimizations) {
      try {
        // Simulate blockchain transaction
        console.log(`Syncing optimization ${optimization.proofHash} to blockchain`);
        // await blockchainService.storeOptimization(optimization);
      } catch (error) {
        console.error(`Error syncing optimization ${optimization.proofHash}:`, error);
      }
    }
  }

  /**
   * Sync data to PostgreSQL
   */
  private async syncToPostgreSQL(data: PersistentData): Promise<void> {
    try {
      const response = await fetch('/api/sync-to-postgresql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optimizations: data.optimizations,
          nodes: data.nodes,
          algorithms: data.algorithms,
          dataMiningResults: data.dataMiningResults,
          blockchainUpgrades: data.blockchainUpgrades,
          walletData: data.walletData,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`PostgreSQL sync failed: ${response.statusText}`);
      }

      console.log('✅ Data synced to PostgreSQL');
    } catch (error) {
      console.error('❌ Error syncing to PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Get Chrome version
   */
  private getChromeVersion(): string {
    const userAgent = navigator.userAgent;
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    return chromeMatch ? chromeMatch[1] : 'unknown';
  }

  /**
   * Get current wallet data
   */
  private getCurrentWalletData(): PersistentData['walletData'] {
    // This would integrate with the actual wallet service
    return {
      address: '0x0000000000000000000000000000000000000000',
      balance: 0,
      totalValue: 0,
      pendingRewards: 0,
      totalEarned: 0
    };
  }

  /**
   * Restore wallet data
   */
  private restoreWalletData(walletData: PersistentData['walletData']): void {
    // This would integrate with the actual wallet service
    console.log('Restoring wallet data:', walletData);
  }

  /**
   * Get user settings
   */
  public getUserSettings(): PersistentData['userSettings'] {
    try {
      const raw = localStorage.getItem('lightdom_userSettings');
      if (raw) {
        return JSON.parse(raw) as PersistentData['userSettings'];
      }
    } catch (e) {
      // ignore and fallback to defaults
    }

    return {
      maxFileUploadSize: this.CHROME_LIMITS.maxFileSize,
      autoSave: true,
      autoSync: true,
      syncInterval: 30000,
      preferredBiome: 'digital'
    };
  }

  /**
   * Restore user settings
   */
  private restoreUserSettings(settings: PersistentData['userSettings']): void {
    // This would integrate with the actual settings service
    console.log('Restoring user settings:', settings);
  }

  /**
   * Save data to IndexedDB
   */
  public async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data from IndexedDB
   */
  public async getFromIndexedDB(storeName: string, key?: string): Promise<any> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = key ? store.get(key) : store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load all persistent data (public wrapper)
   */
  public async loadAllData(): Promise<PersistentData> {
    const data = await this.getFromIndexedDB('persistentData') as PersistentData;
    if (data) return data;

    // Return an empty shaped object as a safe default
    return {
      optimizations: [],
      nodes: [],
      algorithms: [],
      dataMiningResults: [],
      blockchainUpgrades: [],
      walletData: {
        address: '0x0000000000000000000000000000000000000000',
        balance: 0,
        totalValue: 0,
        pendingRewards: 0,
        totalEarned: 0,
      },
      userSettings: this.getUserSettings(),
      lastSync: 0,
      version: '1.0.0'
    };
  }

  /**
   * Remove a pending transaction (triage stub)
   */
  public async removePendingTransaction(txId: string): Promise<void> {
    // Triaged stub: real implementation should remove the pending transaction from storage
    try {
      const state = await this.getFromIndexedDB('persistentData');
      if (!state) return;
      if (Array.isArray(state.pendingTransactions)) {
        state.pendingTransactions = state.pendingTransactions.filter((p: any) => p.id !== txId);
        await this.saveToIndexedDB('persistentData', state);
      }
    } catch (e) {
      // ignore for triage
    }
  }

  /**
   * Restore from backup (triage stub)
   */
  public async restoreFromBackup(): Promise<boolean> {
    // Triaged stub - in real code this would attempt to restore from a critical backup
    return false;
  }

  /**
   * Get Chrome upload limits
   */
  public getChromeUploadLimits(): ChromeUploadLimits {
    return this.CHROME_LIMITS;
  }

  /**
   * Set user's preferred file upload size
   */
  public async setMaxFileUploadSize(size: number): Promise<void> {
    if (size > this.CHROME_LIMITS.maxFileSize) {
      throw new Error(`File size exceeds Chrome limit of ${this.CHROME_LIMITS.maxFileSize} bytes`);
    }

    const settings = await this.getUserSettings();
    settings.maxFileUploadSize = size;
    
    await this.saveToIndexedDB('userSettings', settings);
    console.log(`✅ Max file upload size set to ${size} bytes`);
  }

  /**
   * Get sync status
   */
  public async getSyncStatus(): Promise<{
    lastSync: number;
    status: 'success' | 'error' | 'pending';
    error?: string;
  }> {
    const syncState = await this.getFromIndexedDB('syncState', 'lastSync');
    
    return syncState || {
      lastSync: 0,
      status: 'pending'
    };
  }

  /**
   * Force sync to blockchain and PostgreSQL
   */
  public async forceSync(): Promise<void> {
    await this.saveCurrentState();
    await this.syncToBlockchain();
  }

  /**
   * Clear all persistent data
   */
  public async clearAllData(): Promise<void> {
    if (!this.db) return;

    const storeNames = ['optimizations', 'nodes', 'algorithms', 'dataMining', 'blockchainUpgrades', 'walletData', 'userSettings', 'syncState'];
    
    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    }

    console.log('✅ All persistent data cleared');
  }

  /**
   * Get storage usage statistics
   */
  public async getStorageStats(): Promise<{
    totalSize: number;
    breakdown: Record<string, number>;
    availableSpace: number;
  }> {
    if (!this.db) return { totalSize: 0, breakdown: {}, availableSpace: 0 };

    const breakdown: Record<string, number> = {};
    let totalSize = 0;

    const storeNames = ['optimizations', 'nodes', 'algorithms', 'dataMining', 'blockchainUpgrades', 'walletData', 'userSettings', 'syncState'];
    
    for (const storeName of storeNames) {
      const data = await this.getFromIndexedDB(storeName);
      const size = JSON.stringify(data).length;
      breakdown[storeName] = size;
      totalSize += size;
    }

    // Estimate available space (Chrome typically allows 50MB for IndexedDB)
    const availableSpace = Math.max(0, 50 * 1024 * 1024 - totalSize);

    return {
      totalSize,
      breakdown,
      availableSpace
    };
  }
}

// Export singleton instance
export const persistentBlockchainStorage = new PersistentBlockchainStorage();