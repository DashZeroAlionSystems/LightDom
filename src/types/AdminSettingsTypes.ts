/**
 * Admin Settings Types
 * Comprehensive type definitions for admin dashboard settings
 */

export interface GeneralSettings {
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  maintenanceMode: boolean;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  maxUsers: number;
  sessionTimeout: number; // in minutes
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  enableTwoFactorAuth: boolean;
}

export interface PerformanceSettings {
  maxConcurrentOptimizations: number;
  optimizationTimeout: number; // in seconds
  cacheEnabled: boolean;
  cacheTTL: number; // in minutes
  maxCacheSize: number; // in MB
  enableCompression: boolean;
  compressionLevel: number; // 1-9
  enableCDN: boolean;
  cdnUrl: string;
  maxFileUploadSize: number; // in MB
  maxConcurrentUploads: number;
  enableLazyLoading: boolean;
  enablePrefetching: boolean;
  workerThreads: number;
}

export interface BlockchainSettings {
  network: 'mainnet' | 'testnet' | 'local';
  rpcUrl: string;
  chainId: number;
  gasLimit: number;
  gasPrice: number; // in gwei
  enableAutoGasEstimation: boolean;
  maxRetries: number;
  retryDelay: number; // in seconds
  enableEventLogging: boolean;
  contractAddresses: {
    token: string;
    optimization: string;
    storage: string;
    nft: string;
  };
  enableMining: boolean;
  miningDifficulty: number;
  blockTime: number; // in seconds
}

export interface SecuritySettings {
  enableHTTPS: boolean;
  sslCertificatePath: string;
  enableCORS: boolean;
  corsOrigins: string[];
  enableRateLimiting: boolean;
  rateLimitWindow: number; // in minutes
  rateLimitMaxRequests: number;
  enableCSRFProtection: boolean;
  csrfSecret: string;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  sessionSecret: string;
  jwtSecret: string;
  jwtExpiration: number; // in hours
  enableAuditLogging: boolean;
}

export interface APISettings {
  baseUrl: string;
  apiVersion: string;
  enableSwagger: boolean;
  swaggerPath: string;
  enableGraphQL: boolean;
  graphqlPath: string;
  enableWebSocket: boolean;
  webSocketPath: string;
  maxRequestSize: number; // in MB
  requestTimeout: number; // in seconds
  enableRequestLogging: boolean;
  enableResponseLogging: boolean;
  enableMetrics: boolean;
  metricsPath: string;
  enableHealthCheck: boolean;
  healthCheckPath: string;
  enableCaching: boolean;
  cacheStrategy: 'memory' | 'redis' | 'database';
}

export interface UISettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  enableAnimations: boolean;
  animationDuration: number; // in milliseconds
  enableRippleEffect: boolean;
  enableTooltips: boolean;
  enableNotifications: boolean;
  notificationDuration: number; // in seconds
  enableKeyboardShortcuts: boolean;
  enableAccessibilityMode: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  defaultPageSize: number;
  enableInfiniteScroll: boolean;
  enableVirtualScrolling: boolean;
}

export interface DatabaseSettings {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  sslCert: string;
  sslKey: string;
  sslCA: string;
  connectionPoolSize: number;
  connectionTimeout: number; // in seconds
  queryTimeout: number; // in seconds
  enableQueryLogging: boolean;
  enableSlowQueryLogging: boolean;
  slowQueryThreshold: number; // in milliseconds
  enableBackup: boolean;
  backupInterval: number; // in hours
  backupRetentionDays: number;
  enableReplication: boolean;
  replicaHosts: string[];
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  enableSSL: boolean;
  enableTLS: boolean;
  enableAuthentication: boolean;
  enableWelcomeEmails: boolean;
  enablePasswordResetEmails: boolean;
  enableNotificationEmails: boolean;
  enableMarketingEmails: boolean;
  emailTemplatePath: string;
  enableEmailQueue: boolean;
  queueSize: number;
  retryAttempts: number;
  retryDelay: number; // in seconds
}

export interface MonitoringSettings {
  enableMetrics: boolean;
  metricsPort: number;
  enableHealthChecks: boolean;
  healthCheckPort: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFormat: 'json' | 'text';
  logFilePath: string;
  enableRemoteLogging: boolean;
  remoteLoggingUrl: string;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  errorTrackingService: 'sentry' | 'bugsnag' | 'rollbar';
  errorTrackingKey: string;
  enableUptimeMonitoring: boolean;
  uptimeCheckInterval: number; // in minutes
  enableAlerting: boolean;
  alertEmail: string;
  alertWebhook: string;
}

export interface AdminSettings {
  general: GeneralSettings;
  performance: PerformanceSettings;
  blockchain: BlockchainSettings;
  security: SecuritySettings;
  api: APISettings;
  ui: UISettings;
  database: DatabaseSettings;
  email: EmailSettings;
  monitoring: MonitoringSettings;
}

export interface SettingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Record<string, any>;
}

export interface SettingField {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'password' | 'url' | 'email';
  value: any;
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  category: string;
  section: string;
  order: number;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface SettingsChangeLog {
  id: string;
  settingId: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}