/**
 * LightDom Storage Manager
 * Enhanced storage API usage with session storage, managed storage, and data synchronization
 */

class LightDomStorageManager {
  constructor() {
    this.storageTypes = {
      LOCAL: 'local',
      SESSION: 'session',
      MANAGED: 'managed'
    };
    
    this.storageKeys = {
      USER_ADDRESS: 'userAddress',
      IS_MINING: 'isMining',
      METRICS: 'metrics',
      RECENT_OPTIMIZATIONS: 'recentOptimizations',
      OPTIMIZATION_RULES: 'optimizationRules',
      BLOCKCHAIN_CONFIG: 'blockchainConfig',
      ENTERPRISE_POLICIES: 'enterprisePolicies',
      PERFORMANCE_DATA: 'performanceData',
      USER_PREFERENCES: 'userPreferences'
    };
    
    this.init();
  }

  async init() {
    // Check if managed storage is available (enterprise deployments)
    this.managedStorageAvailable = await this.checkManagedStorage();
    
    // Initialize default values
    await this.initializeDefaults();
    
    // Setup storage change listeners
    this.setupStorageListeners();
  }

  async checkManagedStorage() {
    try {
      await chrome.storage.managed.get(['enterpriseRules']);
      return true;
    } catch (error) {
      return false;
    }
  }

  async initializeDefaults() {
    const defaults = {
      [this.storageKeys.IS_MINING]: false,
      [this.storageKeys.METRICS]: {
        optimizations: 0,
        spaceSaved: 0,
        blocksMined: 0,
        peers: 0,
        lastUpdate: Date.now()
      },
      [this.storageKeys.RECENT_OPTIMIZATIONS]: [],
      [this.storageKeys.OPTIMIZATION_RULES]: this.getDefaultOptimizationRules(),
      [this.storageKeys.BLOCKCHAIN_CONFIG]: {
        networkUrl: 'http://localhost:3001/blockchain',
        autoMine: false,
        notificationLevel: 'normal'
      },
      [this.storageKeys.USER_PREFERENCES]: {
        theme: 'dark',
        notifications: true,
        analytics: true,
        autoOptimize: true
      }
    };

    // Set defaults only if they don't exist
    for (const [key, value] of Object.entries(defaults)) {
      const existing = await this.get(key);
      if (existing === null || existing === undefined) {
        await this.set(key, value);
      }
    }
  }

  getDefaultOptimizationRules() {
    return {
      removeUnusedElements: true,
      optimizeStyles: true,
      removeDuplicateScripts: true,
      compressImages: false,
      minifyCSS: true,
      minifyJS: false,
      customRules: []
    };
  }

  setupStorageListeners() {
    // Listen for storage changes from other parts of the extension
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  handleStorageChange(changes, namespace) {
    // Broadcast changes to other parts of the extension
    chrome.runtime.sendMessage({
      type: 'STORAGE_CHANGED',
      changes,
      namespace
    }).catch(() => {}); // Ignore errors if no listeners
  }

  // Generic storage methods
  async get(key, storageType = this.storageTypes.LOCAL) {
    try {
      const storage = this.getStorageAPI(storageType);
      const result = await storage.get(key);
      return result[key];
    } catch (error) {
      console.error(`Failed to get ${key} from ${storageType} storage:`, error);
      return null;
    }
  }

  async set(key, value, storageType = this.storageTypes.LOCAL) {
    try {
      const storage = this.getStorageAPI(storageType);
      await storage.set({ [key]: value });
      
      // Emit change event
      this.handleStorageChange({ [key]: { newValue: value } }, storageType);
      
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} in ${storageType} storage:`, error);
      return false;
    }
  }

  async remove(key, storageType = this.storageTypes.LOCAL) {
    try {
      const storage = this.getStorageAPI(storageType);
      await storage.remove(key);
      
      // Emit change event
      this.handleStorageChange({ [key]: { newValue: undefined } }, storageType);
      
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from ${storageType} storage:`, error);
      return false;
    }
  }

  async clear(storageType = this.storageTypes.LOCAL) {
    try {
      const storage = this.getStorageAPI(storageType);
      await storage.clear();
      return true;
    } catch (error) {
      console.error(`Failed to clear ${storageType} storage:`, error);
      return false;
    }
  }

  getStorageAPI(storageType) {
    switch (storageType) {
      case this.storageTypes.SESSION:
        return chrome.storage.session;
      case this.storageTypes.MANAGED:
        return chrome.storage.managed;
      default:
        return chrome.storage.local;
    }
  }

  // Specialized methods for LightDom data
  async getUserAddress() {
    return await this.get(this.storageKeys.USER_ADDRESS);
  }

  async setUserAddress(address) {
    const success = await this.set(this.storageKeys.USER_ADDRESS, address);
    
    if (success) {
      // Also store in session for quick access
      await this.set(this.storageKeys.USER_ADDRESS, address, this.storageTypes.SESSION);
    }
    
    return success;
  }

  async getMiningStatus() {
    return await this.get(this.storageKeys.IS_MINING);
  }

  async setMiningStatus(isMining) {
    const success = await this.set(this.storageKeys.IS_MINING, isMining);
    
    if (success) {
      // Update timestamp in metrics
      const metrics = await this.getMetrics();
      metrics.lastMiningStatusChange = Date.now();
      await this.setMetrics(metrics);
    }
    
    return success;
  }

  async getMetrics() {
    return await this.get(this.storageKeys.METRICS) || this.getDefaultMetrics();
  }

  getDefaultMetrics() {
    return {
      optimizations: 0,
      spaceSaved: 0,
      blocksMined: 0,
      peers: 0,
      lastUpdate: Date.now(),
      lastMiningStatusChange: null
    };
  }

  async setMetrics(metrics) {
    const updatedMetrics = {
      ...metrics,
      lastUpdate: Date.now()
    };
    
    return await this.set(this.storageKeys.METRICS, updatedMetrics);
  }

  async updateMetrics(updates) {
    const currentMetrics = await this.getMetrics();
    const updatedMetrics = {
      ...currentMetrics,
      ...updates,
      lastUpdate: Date.now()
    };
    
    return await this.setMetrics(updatedMetrics);
  }

  async getRecentOptimizations() {
    return await this.get(this.storageKeys.RECENT_OPTIMIZATIONS) || [];
  }

  async addOptimization(optimization) {
    const optimizations = await this.getRecentOptimizations();
    
    const newOptimization = {
      ...optimization,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    optimizations.push(newOptimization);
    
    // Keep only last 100 optimizations
    if (optimizations.length > 100) {
      optimizations.splice(0, optimizations.length - 100);
    }
    
    const success = await this.set(this.storageKeys.RECENT_OPTIMIZATIONS, optimizations);
    
    if (success) {
      // Also store in session for quick access
      await this.set(this.storageKeys.RECENT_OPTIMIZATIONS, optimizations.slice(-10), this.storageTypes.SESSION);
    }
    
    return success ? newOptimization : null;
  }

  async getOptimizationRules() {
    // Check managed storage first for enterprise rules
    if (this.managedStorageAvailable) {
      const enterpriseRules = await this.get('enterpriseRules', this.storageTypes.MANAGED);
      if (enterpriseRules) {
        return this.mergeOptimizationRules(
          await this.get(this.storageKeys.OPTIMIZATION_RULES),
          enterpriseRules
        );
      }
    }
    
    return await this.get(this.storageKeys.OPTIMIZATION_RULES);
  }

  async setOptimizationRules(rules) {
    return await this.set(this.storageKeys.OPTIMIZATION_RULES, rules);
  }

  mergeOptimizationRules(userRules, enterpriseRules) {
    // Enterprise rules take precedence over user rules
    return {
      ...this.getDefaultOptimizationRules(),
      ...userRules,
      ...enterpriseRules,
      // Some enterprise rules cannot be overridden
      ...(enterpriseRules.nonOverridable ? enterpriseRules.nonOverridable : {})
    };
  }

  async getBlockchainConfig() {
    const config = await this.get(this.storageKeys.BLOCKCHAIN_CONFIG);
    
    // Check for enterprise configuration
    if (this.managedStorageAvailable) {
      const enterpriseConfig = await this.get('blockchainConfig', this.storageTypes.MANAGED);
      if (enterpriseConfig) {
        return { ...config, ...enterpriseConfig };
      }
    }
    
    return config;
  }

  async setBlockchainConfig(config) {
    return await this.set(this.storageKeys.BLOCKCHAIN_CONFIG, config);
  }

  async getUserPreferences() {
    return await this.get(this.storageKeys.USER_PREFERENCES);
  }

  async setUserPreferences(preferences) {
    return await this.set(this.storageKeys.USER_PREFERENCES, preferences);
  }

  // Performance data storage (using session storage for temporary data)
  async storePerformanceData(data) {
    const performanceData = await this.get(this.storageKeys.PERFORMANCE_DATA, this.storageTypes.SESSION) || [];
    
    performanceData.push({
      ...data,
      timestamp: Date.now()
    });
    
    // Keep only last 50 performance entries
    if (performanceData.length > 50) {
      performanceData.splice(0, performanceData.length - 50);
    }
    
    return await this.set(this.storageKeys.PERFORMANCE_DATA, performanceData, this.storageTypes.SESSION);
  }

  async getPerformanceData() {
    return await this.get(this.storageKeys.PERFORMANCE_DATA, this.storageTypes.SESSION) || [];
  }

  // Data synchronization methods
  async syncToCloud() {
    try {
      const dataToSync = {
        userAddress: await this.getUserAddress(),
        metrics: await this.getMetrics(),
        optimizationRules: await this.getOptimizationRules(),
        userPreferences: await this.getUserPreferences()
      };
      
      // Send to LightDom cloud service
      const response = await fetch('https://api.lightdom.com/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getUserAddress()}`
        },
        body: JSON.stringify(dataToSync)
      });
      
      if (response.ok) {
        console.log('Data synced to cloud successfully');
        return true;
      } else {
        throw new Error(`Sync failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
      return false;
    }
  }

  async syncFromCloud() {
    try {
      const userAddress = await this.getUserAddress();
      if (!userAddress) return false;
      
      const response = await fetch(`https://api.lightdom.com/sync/${userAddress}`, {
        headers: {
          'Authorization': `Bearer ${userAddress}`
        }
      });
      
      if (response.ok) {
        const cloudData = await response.json();
        
        // Merge cloud data with local data
        if (cloudData.metrics) {
          await this.setMetrics(cloudData.metrics);
        }
        if (cloudData.optimizationRules) {
          await this.setOptimizationRules(cloudData.optimizationRules);
        }
        if (cloudData.userPreferences) {
          await this.setUserPreferences(cloudData.userPreferences);
        }
        
        console.log('Data synced from cloud successfully');
        return true;
      } else {
        throw new Error(`Sync failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to sync from cloud:', error);
      return false;
    }
  }

  // Utility methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async exportData() {
    const data = {
      version: '2.0',
      timestamp: Date.now(),
      userAddress: await this.getUserAddress(),
      metrics: await this.getMetrics(),
      recentOptimizations: await this.getRecentOptimizations(),
      optimizationRules: await this.getOptimizationRules(),
      blockchainConfig: await this.getBlockchainConfig(),
      userPreferences: await this.getUserPreferences()
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.version !== '2.0') {
        throw new Error('Unsupported data format version');
      }
      
      // Import data with validation
      if (data.userAddress) await this.setUserAddress(data.userAddress);
      if (data.metrics) await this.setMetrics(data.metrics);
      if (data.recentOptimizations) await this.set(this.storageKeys.RECENT_OPTIMIZATIONS, data.recentOptimizations);
      if (data.optimizationRules) await this.setOptimizationRules(data.optimizationRules);
      if (data.blockchainConfig) await this.setBlockchainConfig(data.blockchainConfig);
      if (data.userPreferences) await this.setUserPreferences(data.userPreferences);
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Cleanup methods
  async cleanupOldData() {
    const optimizations = await this.getRecentOptimizations();
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const filteredOptimizations = optimizations.filter(opt => opt.timestamp > cutoffDate);
    
    if (filteredOptimizations.length !== optimizations.length) {
      await this.set(this.storageKeys.RECENT_OPTIMIZATIONS, filteredOptimizations);
      console.log(`Cleaned up ${optimizations.length - filteredOptimizations.length} old optimizations`);
    }
  }
}

// Create global instance
window.lightDomStorage = new LightDomStorageManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LightDomStorageManager;
}
