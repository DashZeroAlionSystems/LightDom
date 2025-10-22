/**
 * Admin Settings Types
 * Type definitions for admin settings throughout the application
 */

export interface AdminSettings {
  general: GeneralSettings;
  performance: PerformanceSettings;
  blockchain: BlockchainSettings;
  security: SecuritySettings;
  api: ApiSettings;
  ui: UISettings;
  database: DatabaseSettings;
  email: EmailSettings;
  monitoring: MonitoringSettings;
}

export interface GeneralSettings {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  maintenanceMode: boolean;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface PerformanceSettings {
  cacheEnabled: boolean;
  cacheStrategy: 'memory' | 'redis' | 'database';
  cacheTTL: number;
  maxConcurrentRequests: number;
  requestTimeout: number;
  enableCompression: boolean;
  enableGzip: boolean;
  enableBrotli: boolean;
  maxMemoryUsage: number;
  enableCaching: boolean;
}

export interface BlockchainSettings {
  network: 'mainnet' | 'testnet' | 'local';
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  gasLimit: number;
  gasPrice: number;
  enableMining: boolean;
  miningDifficulty: number;
  blockTime: number;
  enableStaking: boolean;
}

export interface SecuritySettings {
  enable2FA: boolean;
  enableWebAuthn: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableRateLimiting: boolean;
  rateLimitWindow: number;
  rateLimitMax: number;
  enableCORS: boolean;
  allowedOrigins: string[];
  enableCSRF: boolean;
  enableXSSProtection: boolean;
  enableContentSecurityPolicy: boolean;
}

export interface ApiSettings {
  baseUrl: string;
  version: string;
  enableSwagger: boolean;
  enableMetrics: boolean;
  enableHealthCheck: boolean;
  maxRequestSize: number;
  enableCaching: boolean;
  cacheTTL: number;
  enableRateLimiting: boolean;
  rateLimitWindow: number;
  rateLimitMax: number;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  fontSize: number;
  enableAnimations: boolean;
  enableTransitions: boolean;
  enableHoverEffects: boolean;
  enableRippleEffects: boolean;
  enableShadows: boolean;
  enableGradients: boolean;
}

export interface DatabaseSettings {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableBackup: boolean;
  backupInterval: number;
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  enableTLS: boolean;
  enableSSL: boolean;
  enableAuthentication: boolean;
  enableDebug: boolean;
}

export interface MonitoringSettings {
  enableMetrics: boolean;
  metricsInterval: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFormat: 'json' | 'text';
  enableAlerts: boolean;
  alertThreshold: number;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  errorTrackingService: 'sentry' | 'bugsnag' | 'rollbar';
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

export interface SettingsUpdate {
  category: keyof AdminSettings;
  key: string;
  value: any;
}

export interface SettingsExport {
  settings: AdminSettings;
  exportedAt: Date;
  exportedBy: string;
  version: string;
}

export interface SettingsImport {
  settings: AdminSettings;
  importedAt: Date;
  importedBy: string;
  source: string;
}
