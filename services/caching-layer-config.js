/**
 * Caching Layer Configuration Service
 * 
 * Manages and activates caching strategies for data mining operations.
 * Provides dynamic configuration loading, profile switching, and 
 * runtime strategy adjustments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CachingLayerConfig extends EventEmitter {
  constructor(configPath = null) {
    super();
    
    this.configPath = configPath || path.join(process.cwd(), 'config', 'caching-strategies.json');
    this.config = null;
    this.activeProfile = 'default';
    this.customOverrides = {};
    
    this.loadConfig();
  }

  /**
   * Load caching configuration from file
   */
  loadConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.warn(`⚠️  Caching config not found at ${this.configPath}, using defaults`);
        this.config = this.getDefaultConfig();
        return;
      }
      
      const configData = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      
      // Validate config
      this.validateConfig();
      
      // Find active profile
      const activeProfiles = Object.entries(this.config.profiles)
        .filter(([_, profile]) => profile.enabled);
      
      if (activeProfiles.length > 0) {
        this.activeProfile = activeProfiles[0][0];
      }
      
      console.log(`✅ Caching config loaded: profile="${this.activeProfile}"`);
      this.emit('config-loaded', { profile: this.activeProfile });
      
    } catch (error) {
      console.error('❌ Error loading caching config:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Reload configuration from disk
   */
  reloadConfig() {
    console.log('🔄 Reloading caching configuration...');
    this.loadConfig();
    this.emit('config-reloaded', { profile: this.activeProfile });
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      version: '1.0.0',
      profiles: {
        default: {
          name: 'Default',
          enabled: true,
          strategy: 'stale-while-revalidate',
          caches: {
            url: { enabled: true, size: 10000, ttl: 86400000, strategy: 'lru' },
            asset: { enabled: true, size: 5000, ttl: 604800000, strategy: 'lru' },
            screenshot: { enabled: true, size: 1000, ttl: 2592000000, strategy: 'lru' },
            ocr: { enabled: true, size: 500, ttl: 2592000000, strategy: 'lru' }
          }
        }
      },
      features: {
        enableOfflineMining: true,
        enableVisualDiffTracking: true,
        enableNetworkMonitoring: true,
        compressionEnabled: true
      },
      database: { enabled: true, provider: 'postgresql' },
      serviceWorker: { enabled: true, version: 3 }
    };
  }

  /**
   * Validate configuration structure
   */
  validateConfig() {
    if (!this.config.profiles || Object.keys(this.config.profiles).length === 0) {
      throw new Error('Configuration must have at least one profile');
    }
    
    if (!this.config.strategies) {
      console.warn('⚠️  No strategies defined, using defaults');
    }
    
    return true;
  }

  /**
   * Switch to a different profile
   */
  switchProfile(profileName) {
    if (!this.config.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" not found`);
    }
    
    // Disable current profile
    if (this.config.profiles[this.activeProfile]) {
      this.config.profiles[this.activeProfile].enabled = false;
    }
    
    // Enable new profile
    this.config.profiles[profileName].enabled = true;
    this.activeProfile = profileName;
    
    console.log(`✅ Switched to profile: ${profileName}`);
    this.emit('profile-switched', { profile: profileName });
    
    return this.getActiveProfile();
  }

  /**
   * Get active profile configuration
   */
  getActiveProfile() {
    const profile = this.config.profiles[this.activeProfile];
    
    if (!profile) {
      return this.config.profiles.default;
    }
    
    // Merge with custom overrides
    return {
      ...profile,
      ...this.customOverrides
    };
  }

  /**
   * Get configuration for Advanced Cache Manager
   */
  getCacheManagerConfig() {
    const profile = this.getActiveProfile();
    const features = this.config.features || {};
    
    return {
      // LRU cache sizes
      urlCacheSize: profile.caches?.url?.size || 10000,
      assetCacheSize: profile.caches?.asset?.size || 5000,
      screenshotCacheSize: profile.caches?.screenshot?.size || 1000,
      ocrCacheSize: profile.caches?.ocr?.size || 500,
      
      // TTL settings
      urlCacheTTL: profile.caches?.url?.ttl || 86400000,
      assetCacheTTL: profile.caches?.asset?.ttl || 604800000,
      screenshotCacheTTL: profile.caches?.screenshot?.ttl || 2592000000,
      ocrCacheTTL: profile.caches?.ocr?.ttl || 2592000000,
      
      // Features
      enableOfflineMining: features.enableOfflineMining !== false,
      enableVisualDiffTracking: features.enableVisualDiffTracking !== false,
      enableNetworkMonitoring: features.enableNetworkMonitoring !== false,
      staleWhileRevalidate: profile.strategy === 'stale-while-revalidate',
      compressionEnabled: features.compressionEnabled !== false,
      
      // Strategy
      defaultCacheTTL: profile.caches?.url?.ttl || 86400000,
      cacheStrategy: profile.strategy || 'stale-while-revalidate'
    };
  }

  /**
   * Get configuration for Cache-Aware Crawler
   */
  getCrawlerConfig() {
    const profile = this.getActiveProfile();
    const features = this.config.features || {};
    
    return {
      enableCDP: features.enableCDP !== false,
      enableOfflineMining: features.enableOfflineMining !== false,
      enableScreenshots: features.enableScreenshots !== false,
      enableOCR: features.enableOCR !== false,
      enableNetworkMonitoring: features.enableNetworkMonitoring !== false,
      
      // Strategy
      cacheStrategy: profile.strategy || 'stale-while-revalidate',
      
      // Training data features
      enableDeduplication: profile.features?.enableDeduplication !== false,
      qualityScoring: profile.features?.qualityScoring || false,
      visualDiff: profile.features?.visualDiff || false,
      autoLabeling: profile.features?.autoLabeling || false
    };
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return this.config.database || { enabled: true, provider: 'postgresql' };
  }

  /**
   * Get service worker configuration
   */
  getServiceWorkerConfig() {
    return this.config.serviceWorker || { enabled: true, version: 3 };
  }

  /**
   * Get strategy configuration
   */
  getStrategy(strategyName) {
    return this.config.strategies?.[strategyName] || null;
  }

  /**
   * Apply custom override for specific cache
   */
  setCacheOverride(cacheName, options) {
    if (!this.customOverrides.caches) {
      this.customOverrides.caches = {};
    }
    
    this.customOverrides.caches[cacheName] = {
      ...this.getActiveProfile().caches?.[cacheName],
      ...options
    };
    
    console.log(`🔧 Cache override applied: ${cacheName}`);
    this.emit('cache-override', { cacheName, options });
  }

  /**
   * Apply feature override
   */
  setFeatureOverride(featureName, enabled) {
    if (!this.customOverrides.features) {
      this.customOverrides.features = {};
    }
    
    this.customOverrides.features[featureName] = enabled;
    
    console.log(`🔧 Feature override applied: ${featureName}=${enabled}`);
    this.emit('feature-override', { featureName, enabled });
  }

  /**
   * Reset all custom overrides
   */
  resetOverrides() {
    this.customOverrides = {};
    console.log('🔄 Custom overrides reset');
    this.emit('overrides-reset');
  }

  /**
   * Get cache size for specific cache type
   */
  getCacheSize(cacheType) {
    const profile = this.getActiveProfile();
    return profile.caches?.[cacheType]?.size || 1000;
  }

  /**
   * Get TTL for specific cache type
   */
  getCacheTTL(cacheType) {
    const profile = this.getActiveProfile();
    return profile.caches?.[cacheType]?.ttl || 86400000;
  }

  /**
   * Check if cache type is enabled
   */
  isCacheEnabled(cacheType) {
    const profile = this.getActiveProfile();
    return profile.caches?.[cacheType]?.enabled !== false;
  }

  /**
   * Get URL pattern strategy
   */
  getUrlStrategy(url) {
    const customStrategies = this.config.customStrategies?.['url-patterns'];
    
    if (!customStrategies) {
      return this.getActiveProfile().strategy;
    }
    
    // Find matching pattern
    for (const [name, config] of Object.entries(customStrategies)) {
      const pattern = new RegExp(config.pattern);
      if (pattern.test(url)) {
        return {
          strategy: config.strategy,
          ttl: config.ttl,
          name
        };
      }
    }
    
    // Default strategy
    return {
      strategy: this.getActiveProfile().strategy,
      ttl: this.getCacheTTL('url'),
      name: 'default'
    };
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig() {
    return this.config.monitoring || {
      enabled: true,
      statsInterval: 300000,
      cleanupInterval: 3600000,
      logLevel: 'info'
    };
  }

  /**
   * Export current configuration
   */
  exportConfig(outputPath = null) {
    const output = outputPath || path.join(process.cwd(), 'config', 'caching-strategies.export.json');
    
    const exportData = {
      ...this.config,
      activeProfile: this.activeProfile,
      customOverrides: this.customOverrides,
      exportedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(output, JSON.stringify(exportData, null, 2));
    console.log(`📤 Configuration exported to: ${output}`);
    
    return output;
  }

  /**
   * List all available profiles
   */
  listProfiles() {
    return Object.entries(this.config.profiles).map(([name, profile]) => ({
      name,
      title: profile.name,
      description: profile.description,
      enabled: profile.enabled,
      strategy: profile.strategy,
      active: name === this.activeProfile
    }));
  }

  /**
   * Get full configuration object
   */
  getFullConfig() {
    return {
      ...this.config,
      activeProfile: this.activeProfile,
      customOverrides: this.customOverrides
    };
  }

  /**
   * Save current configuration to file
   */
  saveConfig(outputPath = null) {
    const output = outputPath || this.configPath;
    
    fs.writeFileSync(output, JSON.stringify(this.config, null, 2));
    console.log(`💾 Configuration saved to: ${output}`);
    
    this.emit('config-saved', { path: output });
  }

  /**
   * Create a new profile
   */
  createProfile(name, config) {
    if (this.config.profiles[name]) {
      throw new Error(`Profile "${name}" already exists`);
    }
    
    this.config.profiles[name] = {
      enabled: false,
      ...config
    };
    
    console.log(`✅ Profile created: ${name}`);
    this.emit('profile-created', { name });
    
    return this.config.profiles[name];
  }

  /**
   * Delete a profile
   */
  deleteProfile(name) {
    if (name === 'default') {
      throw new Error('Cannot delete default profile');
    }
    
    if (!this.config.profiles[name]) {
      throw new Error(`Profile "${name}" not found`);
    }
    
    if (this.activeProfile === name) {
      this.switchProfile('default');
    }
    
    delete this.config.profiles[name];
    
    console.log(`🗑️  Profile deleted: ${name}`);
    this.emit('profile-deleted', { name });
  }

  /**
   * Update profile configuration
   */
  updateProfile(name, updates) {
    if (!this.config.profiles[name]) {
      throw new Error(`Profile "${name}" not found`);
    }
    
    this.config.profiles[name] = {
      ...this.config.profiles[name],
      ...updates
    };
    
    console.log(`✅ Profile updated: ${name}`);
    this.emit('profile-updated', { name });
    
    return this.config.profiles[name];
  }
}

export default CachingLayerConfig;
