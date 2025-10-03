/**
 * Admin Settings Service
 * Manages application settings with persistence and validation
 */

import { 
  AdminSettings, 
  SettingField, 
  SettingsValidationResult, 
  SettingsChangeLog,
  GeneralSettings,
  PerformanceSettings,
  BlockchainSettings,
  SecuritySettings,
  APISettings,
  UISettings,
  DatabaseSettings,
  EmailSettings,
  MonitoringSettings
} from '../types/AdminSettingsTypes';

class AdminSettingsService {
  private settings: AdminSettings;
  private changeLog: SettingsChangeLog[] = [];
  private readonly STORAGE_KEY = 'lightdom_admin_settings';
  private readonly CHANGELOG_KEY = 'lightdom_settings_changelog';

  constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
    this.loadChangeLog();
  }

  /**
   * Get default settings with populated values
   */
  private getDefaultSettings(): AdminSettings {
    return {
      general: {
        appName: 'LightDom Platform',
        appVersion: '1.0.0',
        environment: 'development',
        debugMode: true,
        maintenanceMode: false,
        defaultLanguage: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        currency: 'USD',
        maxUsers: 1000,
        sessionTimeout: 30,
        enableRegistration: true,
        requireEmailVerification: true,
        enableTwoFactorAuth: false,
      },
      performance: {
        maxConcurrentOptimizations: 10,
        optimizationTimeout: 300,
        cacheEnabled: true,
        cacheTTL: 60,
        maxCacheSize: 512,
        enableCompression: true,
        compressionLevel: 6,
        enableCDN: false,
        cdnUrl: '',
        maxFileUploadSize: 100,
        maxConcurrentUploads: 5,
        enableLazyLoading: true,
        enablePrefetching: true,
        workerThreads: 4,
      },
      blockchain: {
        network: 'testnet',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
        chainId: 11155111,
        gasLimit: 21000,
        gasPrice: 20,
        enableAutoGasEstimation: true,
        maxRetries: 3,
        retryDelay: 5,
        enableEventLogging: true,
        contractAddresses: {
          token: '0x0000000000000000000000000000000000000000',
          optimization: '0x0000000000000000000000000000000000000000',
          storage: '0x0000000000000000000000000000000000000000',
          nft: '0x0000000000000000000000000000000000000000',
        },
        enableMining: false,
        miningDifficulty: 4,
        blockTime: 15,
      },
      security: {
        enableHTTPS: true,
        sslCertificatePath: '/etc/ssl/certs/lightdom.crt',
        enableCORS: true,
        corsOrigins: ['http://localhost:3000', 'https://lightdom.com'],
        enableRateLimiting: true,
        rateLimitWindow: 15,
        rateLimitMaxRequests: 100,
        enableCSRFProtection: true,
        csrfSecret: 'your-csrf-secret-key',
        enableXSSProtection: true,
        enableSQLInjectionProtection: true,
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        sessionSecret: 'your-session-secret-key',
        jwtSecret: 'your-jwt-secret-key',
        jwtExpiration: 24,
        enableAuditLogging: true,
      },
      api: {
        baseUrl: 'http://localhost:3001',
        apiVersion: 'v1',
        enableSwagger: true,
        swaggerPath: '/api/docs',
        enableGraphQL: false,
        graphqlPath: '/graphql',
        enableWebSocket: true,
        webSocketPath: '/ws',
        maxRequestSize: 10,
        requestTimeout: 30,
        enableRequestLogging: true,
        enableResponseLogging: false,
        enableMetrics: true,
        metricsPath: '/metrics',
        enableHealthCheck: true,
        healthCheckPath: '/health',
        enableCaching: true,
        cacheStrategy: 'memory',
      },
      ui: {
        theme: 'light',
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
        accentColor: '#faad14',
        borderRadius: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 14,
        enableAnimations: true,
        animationDuration: 300,
        enableRippleEffect: true,
        enableTooltips: true,
        enableNotifications: true,
        notificationDuration: 5,
        enableKeyboardShortcuts: true,
        enableAccessibilityMode: false,
        enableHighContrast: false,
        enableReducedMotion: false,
        defaultPageSize: 20,
        enableInfiniteScroll: true,
        enableVirtualScrolling: false,
      },
      database: {
        host: 'localhost',
        port: 5432,
        database: 'lightdom',
        username: 'lightdom_user',
        password: 'your-database-password',
        ssl: false,
        sslCert: '',
        sslKey: '',
        sslCA: '',
        connectionPoolSize: 10,
        connectionTimeout: 30,
        queryTimeout: 60,
        enableQueryLogging: false,
        enableSlowQueryLogging: true,
        slowQueryThreshold: 1000,
        enableBackup: true,
        backupInterval: 24,
        backupRetentionDays: 30,
        enableReplication: false,
        replicaHosts: [],
      },
      email: {
        provider: 'smtp',
        host: 'smtp.gmail.com',
        port: 587,
        username: 'your-email@gmail.com',
        password: 'your-app-password',
        fromEmail: 'noreply@lightdom.com',
        fromName: 'LightDom Platform',
        enableSSL: false,
        enableTLS: true,
        enableAuthentication: true,
        enableWelcomeEmails: true,
        enablePasswordResetEmails: true,
        enableNotificationEmails: true,
        enableMarketingEmails: false,
        emailTemplatePath: '/templates/emails',
        enableEmailQueue: true,
        queueSize: 1000,
        retryAttempts: 3,
        retryDelay: 5,
      },
      monitoring: {
        enableMetrics: true,
        metricsPort: 9090,
        enableHealthChecks: true,
        healthCheckPort: 8080,
        enableLogging: true,
        logLevel: 'info',
        logFormat: 'json',
        logFilePath: '/var/log/lightdom',
        enableRemoteLogging: false,
        remoteLoggingUrl: '',
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        errorTrackingService: 'sentry',
        errorTrackingKey: 'your-sentry-dsn',
        enableUptimeMonitoring: true,
        uptimeCheckInterval: 5,
        enableAlerting: true,
        alertEmail: 'admin@lightdom.com',
        alertWebhook: '',
      },
    };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * Load change log from localStorage
   */
  private loadChangeLog(): void {
    try {
      const stored = localStorage.getItem(this.CHANGELOG_KEY);
      if (stored) {
        this.changeLog = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load change log:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Save change log to localStorage
   */
  private saveChangeLog(): void {
    try {
      localStorage.setItem(this.CHANGELOG_KEY, JSON.stringify(this.changeLog));
    } catch (error) {
      console.error('Failed to save change log:', error);
    }
  }

  /**
   * Get all settings
   */
  public getAllSettings(): AdminSettings {
    return { ...this.settings };
  }

  /**
   * Get settings by category
   */
  public getSettingsByCategory(category: keyof AdminSettings): any {
    return { ...this.settings[category] };
  }

  /**
   * Get a specific setting value
   */
  public getSetting(category: keyof AdminSettings, key: string): any {
    return this.settings[category]?.[key];
  }

  /**
   * Update a specific setting
   */
  public updateSetting(
    category: keyof AdminSettings, 
    key: string, 
    value: any, 
    changedBy: string = 'admin',
    reason?: string
  ): SettingsValidationResult {
    const validation = this.validateSetting(category, key, value);
    
    if (validation.isValid) {
      const oldValue = this.settings[category]?.[key];
      this.settings[category] = { ...this.settings[category], [key]: value };
      
      // Log the change
      this.logChange(category, key, oldValue, value, changedBy, reason);
      
      // Save to storage
      this.saveSettings();
    }
    
    return validation;
  }

  /**
   * Update multiple settings at once
   */
  public updateMultipleSettings(
    updates: Array<{
      category: keyof AdminSettings;
      key: string;
      value: any;
    }>,
    changedBy: string = 'admin',
    reason?: string
  ): SettingsValidationResult {
    const errors: Record<string, string> = {};
    const validUpdates: Array<{ category: keyof AdminSettings; key: string; value: any }> = [];

    // Validate all updates first
    for (const update of updates) {
      const validation = this.validateSetting(update.category, update.key, update.value);
      if (!validation.isValid) {
        Object.assign(errors, validation.errors);
      } else {
        validUpdates.push(update);
      }
    }

    // If all validations pass, apply all updates
    if (Object.keys(errors).length === 0) {
      for (const update of validUpdates) {
        const oldValue = this.settings[update.category]?.[update.key];
        this.settings[update.category] = { 
          ...this.settings[update.category], 
          [update.key]: update.value 
        };
        this.logChange(update.category, update.key, oldValue, update.value, changedBy, reason);
      }
      this.saveSettings();
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Reset settings to defaults
   */
  public resetToDefaults(changedBy: string = 'admin'): void {
    const oldSettings = { ...this.settings };
    this.settings = this.getDefaultSettings();
    
    // Log the reset
    this.logChange('general', 'all', oldSettings, this.settings, changedBy, 'Reset to defaults');
    
    this.saveSettings();
  }

  /**
   * Validate a setting value
   */
  private validateSetting(category: keyof AdminSettings, key: string, value: any): SettingsValidationResult {
    const errors: Record<string, string> = {};
    const settingPath = `${category}.${key}`;

    // Basic validation rules
    if (value === null || value === undefined) {
      errors[settingPath] = 'Value cannot be null or undefined';
    }

    // Category-specific validation
    switch (category) {
      case 'general':
        if (key === 'maxUsers' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Max users must be a positive number';
        }
        if (key === 'sessionTimeout' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Session timeout must be a positive number';
        }
        break;
      
      case 'performance':
        if (key === 'maxConcurrentOptimizations' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Max concurrent optimizations must be a positive number';
        }
        if (key === 'optimizationTimeout' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Optimization timeout must be a positive number';
        }
        break;
      
      case 'blockchain':
        if (key === 'chainId' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Chain ID must be a positive number';
        }
        if (key === 'gasLimit' && (typeof value !== 'number' || value < 21000)) {
          errors[settingPath] = 'Gas limit must be at least 21000';
        }
        break;
      
      case 'security':
        if (key === 'passwordMinLength' && (typeof value !== 'number' || value < 6)) {
          errors[settingPath] = 'Password minimum length must be at least 6';
        }
        if (key === 'jwtExpiration' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'JWT expiration must be at least 1 hour';
        }
        break;
      
      case 'api':
        if (key === 'maxRequestSize' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Max request size must be a positive number';
        }
        if (key === 'requestTimeout' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Request timeout must be a positive number';
        }
        break;
      
      case 'ui':
        if (key === 'fontSize' && (typeof value !== 'number' || value < 8 || value > 24)) {
          errors[settingPath] = 'Font size must be between 8 and 24';
        }
        if (key === 'borderRadius' && (typeof value !== 'number' || value < 0 || value > 20)) {
          errors[settingPath] = 'Border radius must be between 0 and 20';
        }
        break;
      
      case 'database':
        if (key === 'port' && (typeof value !== 'number' || value < 1 || value > 65535)) {
          errors[settingPath] = 'Port must be between 1 and 65535';
        }
        if (key === 'connectionPoolSize' && (typeof value !== 'number' || value < 1)) {
          errors[settingPath] = 'Connection pool size must be a positive number';
        }
        break;
      
      case 'email':
        if (key === 'port' && (typeof value !== 'number' || value < 1 || value > 65535)) {
          errors[settingPath] = 'Port must be between 1 and 65535';
        }
        if (key === 'fromEmail' && !this.isValidEmail(value)) {
          errors[settingPath] = 'Invalid email format';
        }
        break;
      
      case 'monitoring':
        if (key === 'metricsPort' && (typeof value !== 'number' || value < 1 || value > 65535)) {
          errors[settingPath] = 'Metrics port must be between 1 and 65535';
        }
        if (key === 'logLevel' && !['debug', 'info', 'warn', 'error'].includes(value)) {
          errors[settingPath] = 'Log level must be one of: debug, info, warn, error';
        }
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Log a setting change
   */
  private logChange(
    category: keyof AdminSettings,
    key: string,
    oldValue: any,
    newValue: any,
    changedBy: string,
    reason?: string
  ): void {
    const changeLog: SettingsChangeLog = {
      id: Date.now().toString(),
      settingId: `${category}.${key}`,
      oldValue,
      newValue,
      changedBy,
      changedAt: new Date(),
      reason
    };

    this.changeLog.unshift(changeLog);
    
    // Keep only last 1000 changes
    if (this.changeLog.length > 1000) {
      this.changeLog = this.changeLog.slice(0, 1000);
    }

    this.saveChangeLog();
  }

  /**
   * Get change log
   */
  public getChangeLog(): SettingsChangeLog[] {
    return [...this.changeLog];
  }

  /**
   * Get change log for a specific setting
   */
  public getSettingChangeLog(settingId: string): SettingsChangeLog[] {
    return this.changeLog.filter(change => change.settingId === settingId);
  }

  /**
   * Export settings to JSON
   */
  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  public importSettings(jsonString: string, changedBy: string = 'admin'): SettingsValidationResult {
    try {
      const importedSettings = JSON.parse(jsonString);
      const oldSettings = { ...this.settings };
      
      // Validate imported settings structure
      const validation = this.validateImportedSettings(importedSettings);
      if (!validation.isValid) {
        return validation;
      }

      this.settings = { ...this.getDefaultSettings(), ...importedSettings };
      this.logChange('general', 'all', oldSettings, this.settings, changedBy, 'Settings imported');
      this.saveSettings();

      return { isValid: true, errors: {} };
    } catch (error) {
      return {
        isValid: false,
        errors: { import: 'Invalid JSON format' }
      };
    }
  }

  /**
   * Validate imported settings structure
   */
  private validateImportedSettings(settings: any): SettingsValidationResult {
    const errors: Record<string, string> = {};
    const defaultSettings = this.getDefaultSettings();

    // Check if all required categories exist
    for (const category of Object.keys(defaultSettings)) {
      if (!settings[category]) {
        errors[category] = `Missing category: ${category}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get settings categories with metadata
   */
  public getSettingsCategories(): Array<{
    id: keyof AdminSettings;
    name: string;
    description: string;
    icon: string;
    settingCount: number;
  }> {
    return [
      {
        id: 'general',
        name: 'General',
        description: 'Basic application configuration',
        icon: 'SettingOutlined',
        settingCount: Object.keys(this.settings.general).length
      },
      {
        id: 'performance',
        name: 'Performance',
        description: 'Performance optimization settings',
        icon: 'ThunderboltOutlined',
        settingCount: Object.keys(this.settings.performance).length
      },
      {
        id: 'blockchain',
        name: 'Blockchain',
        description: 'Blockchain and smart contract settings',
        icon: 'BlockOutlined',
        settingCount: Object.keys(this.settings.blockchain).length
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security and authentication settings',
        icon: 'SecurityScanOutlined',
        settingCount: Object.keys(this.settings.security).length
      },
      {
        id: 'api',
        name: 'API',
        description: 'API configuration and endpoints',
        icon: 'ApiOutlined',
        settingCount: Object.keys(this.settings.api).length
      },
      {
        id: 'ui',
        name: 'User Interface',
        description: 'UI theme and appearance settings',
        icon: 'BgColorsOutlined',
        settingCount: Object.keys(this.settings.ui).length
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Database connection and configuration',
        icon: 'DatabaseOutlined',
        settingCount: Object.keys(this.settings.database).length
      },
      {
        id: 'email',
        name: 'Email',
        description: 'Email service configuration',
        icon: 'MailOutlined',
        settingCount: Object.keys(this.settings.email).length
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        description: 'Monitoring and logging settings',
        icon: 'MonitorOutlined',
        settingCount: Object.keys(this.settings.monitoring).length
      }
    ];
  }
}

// Export singleton instance
export const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;