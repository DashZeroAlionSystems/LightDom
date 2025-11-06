/**
 * Admin Settings Service
 * Service for managing admin settings throughout the application
 */

import { AdminSettings, SettingsValidationResult, SettingsChangeLog } from '@/types/api/AdminSettingsTypes';

class AdminSettingsService {
  private settings: AdminSettings;
  private changeLog: SettingsChangeLog[] = [];

  constructor() {
    this.settings = this.getDefaultSettings();
    this.loadFromStorage();
  }

  private getDefaultSettings(): AdminSettings {
    return {
      general: {
        appName: 'LightDom',
        version: '1.0.0',
        environment: 'development',
        debugMode: false,
        maintenanceMode: false,
        timezone: 'UTC',
        language: 'en',
        theme: 'dark',
        logLevel: 'info'
      },
      performance: {
        cacheEnabled: true,
        cacheStrategy: 'memory',
        cacheTTL: 3600,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
        enableCompression: true,
        enableGzip: true,
        enableBrotli: true,
        maxMemoryUsage: 512,
        enableCaching: true
      },
      blockchain: {
        network: 'mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/your-key',
        privateKey: '',
        contractAddress: '',
        gasLimit: 21000,
        gasPrice: 20,
        enableMining: false,
        miningDifficulty: 1,
        blockTime: 15,
        enableStaking: false
      },
      security: {
        enable2FA: true,
        enableWebAuthn: false,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        lockoutDuration: 900,
        enableRateLimiting: true,
        rateLimitWindow: 900,
        rateLimitMax: 100,
        enableCORS: true,
        allowedOrigins: ['http://localhost:3000'],
        enableCSRF: true,
        enableXSSProtection: true,
        enableContentSecurityPolicy: true
      },
      api: {
        baseUrl: 'http://localhost:3001',
        version: 'v1',
        enableSwagger: true,
        enableMetrics: true,
        enableHealthCheck: true,
        maxRequestSize: 10485760,
        enableCaching: true,
        cacheTTL: 300,
        enableRateLimiting: true,
        rateLimitWindow: 900,
        rateLimitMax: 1000
      },
      ui: {
        theme: 'dark',
        primaryColor: '#1890ff',
        secondaryColor: '#722ed1',
        borderRadius: 6,
        fontSize: 14,
        enableAnimations: true,
        enableTransitions: true,
        enableHoverEffects: true,
        enableRippleEffects: true,
        enableShadows: true,
        enableGradients: true
      },
      database: {
        host: 'localhost',
        port: 5432,
        database: 'lightdom',
        username: 'postgres',
        password: '',
        ssl: false,
        poolSize: 10,
        connectionTimeout: 30000,
        enableLogging: false,
        enableMetrics: true,
        enableBackup: true,
        backupInterval: 86400
      },
      email: {
        provider: 'smtp',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: '',
        password: '',
        from: 'noreply@lightdom.com',
        enableTLS: true,
        enableSSL: false,
        enableAuthentication: true,
        enableDebug: false
      },
      monitoring: {
        enableMetrics: true,
        metricsInterval: 60000,
        enableLogging: true,
        logLevel: 'info',
        logFormat: 'json',
        enableAlerts: true,
        alertThreshold: 0.8,
        enableHealthChecks: true,
        healthCheckInterval: 30000,
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        errorTrackingService: 'sentry'
      }
    };
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('lightdom_admin_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('lightdom_admin_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save settings to storage:', error);
    }
  }

  private validateSetting(category: keyof AdminSettings, key: string, value: any): string | null {
    const categorySettings = this.settings[category];
    if (!categorySettings || !(key in categorySettings)) {
      return `Invalid setting: ${category}.${key}`;
    }

    const currentValue = categorySettings[key];
    const currentType = typeof currentValue;
    const newType = typeof value;

    if (currentType !== newType) {
      return `Type mismatch for ${category}.${key}: expected ${currentType}, got ${newType}`;
    }

    // Additional validation rules
    if (key === 'port' && (typeof value === 'number') && (value < 1 || value > 65535)) {
      return 'Port must be between 1 and 65535';
    }

    if (key === 'timeout' && (typeof value === 'number') && value < 0) {
      return 'Timeout must be non-negative';
    }

    if (key === 'maxConcurrentRequests' && (typeof value === 'number') && value < 1) {
      return 'Max concurrent requests must be at least 1';
    }

    return null;
  }

  private addToChangeLog(
    category: keyof AdminSettings,
    key: string,
    oldValue: any,
    newValue: any,
    changedBy: string,
    reason?: string
  ): void {
    const change: SettingsChangeLog = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      settingId: `${category}.${key}`,
      oldValue,
      newValue,
      changedBy,
      changedAt: new Date(),
      reason
    };

    this.changeLog.unshift(change);
    
    // Keep only last 1000 changes
    if (this.changeLog.length > 1000) {
      this.changeLog = this.changeLog.slice(0, 1000);
    }

    // Save change log to storage
    try {
      localStorage.setItem('lightdom_admin_change_log', JSON.stringify(this.changeLog));
    } catch (error) {
      console.warn('Failed to save change log to storage:', error);
    }
  }

  private loadChangeLogFromStorage(): void {
    try {
      const stored = localStorage.getItem('lightdom_admin_change_log');
      if (stored) {
        this.changeLog = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load change log from storage:', error);
    }
  }

  getAllSettings(): AdminSettings {
    return { ...this.settings };
  }

  getSetting(category: keyof AdminSettings, key: string): any {
    return this.settings[category]?.[key];
  }

  getSettingsByCategory(category: keyof AdminSettings): any {
    return { ...this.settings[category] };
  }

  updateSetting(
    category: keyof AdminSettings,
    key: string,
    value: any,
    changedBy: string = 'admin',
    reason?: string
  ): SettingsValidationResult {
    const validationError = this.validateSetting(category, key, value);
    if (validationError) {
      return {
        isValid: false,
        errors: { [key]: validationError }
      };
    }

    const oldValue = this.settings[category][key];
    this.settings[category][key] = value;
    this.saveToStorage();
    this.addToChangeLog(category, key, oldValue, value, changedBy, reason);

    return { isValid: true, errors: {} };
  }

  updateMultipleSettings(
    updates: Array<{
      category: keyof AdminSettings;
      key: string;
      value: any;
    }>,
    changedBy: string = 'admin',
    reason?: string
  ): SettingsValidationResult {
    const errors: Record<string, string> = {};
    const validUpdates: Array<{
      category: keyof AdminSettings;
      key: string;
      value: any;
    }> = [];

    // Validate all updates first
    for (const update of updates) {
      const validationError = this.validateSetting(update.category, update.key, update.value);
      if (validationError) {
        errors[`${update.category}.${update.key}`] = validationError;
      } else {
        validUpdates.push(update);
      }
    }

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    // Apply all valid updates
    for (const update of validUpdates) {
      const oldValue = this.settings[update.category][update.key];
      this.settings[update.category][update.key] = update.value;
      this.addToChangeLog(update.category, update.key, oldValue, update.value, changedBy, reason);
    }

    this.saveToStorage();
    return { isValid: true, errors: {} };
  }

  resetToDefaults(changedBy: string = 'admin'): void {
    const oldSettings = { ...this.settings };
    this.settings = this.getDefaultSettings();
    this.saveToStorage();
    
    // Log the reset
    this.addToChangeLog('general', 'reset', oldSettings, this.settings, changedBy, 'Reset to default settings');
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(jsonString: string, changedBy: string = 'admin'): SettingsValidationResult {
    try {
      const importedSettings = JSON.parse(jsonString);
      
      // Validate the imported settings structure
      const defaultSettings = this.getDefaultSettings();
      const errors: Record<string, string> = {};

      for (const category in defaultSettings) {
        if (!importedSettings[category]) {
          errors[category] = `Missing category: ${category}`;
          continue;
        }

        for (const key in defaultSettings[category as keyof AdminSettings]) {
          if (!(key in importedSettings[category])) {
            errors[`${category}.${key}`] = `Missing setting: ${category}.${key}`;
            continue;
          }

          const validationError = this.validateSetting(
            category as keyof AdminSettings,
            key,
            importedSettings[category][key]
          );
          if (validationError) {
            errors[`${category}.${key}`] = validationError;
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        return { isValid: false, errors };
      }

      const oldSettings = { ...this.settings };
      this.settings = importedSettings;
      this.saveToStorage();
      this.addToChangeLog('general', 'import', oldSettings, this.settings, changedBy, 'Settings imported');

      return { isValid: true, errors: {} };
    } catch (error) {
      return {
        isValid: false,
        errors: { import: error instanceof Error ? error.message : 'Invalid JSON format' }
      };
    }
  }

  getChangeLog(): SettingsChangeLog[] {
    this.loadChangeLogFromStorage();
    return [...this.changeLog];
  }

  getSettingChangeLog(settingId: string): SettingsChangeLog[] {
    this.loadChangeLogFromStorage();
    return this.changeLog.filter(change => change.settingId === settingId);
  }
}

// Export singleton instance
export const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;
