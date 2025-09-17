import { LaunchOptions, PageOptions, NavigationOptions, ScreenshotOptions, PDFOptions } from '../types/HeadlessTypes';
import { CrawlOptions } from '../types/CrawlerTypes';
import { OptimizationOptions } from '../types/OptimizationTypes';

export interface HeadlessConfig {
  headless: {
    enabled: boolean;
    maxPages: number;
    launchOptions: LaunchOptions;
    pageOptions: PageOptions;
    navigationOptions: NavigationOptions;
    screenshotOptions: ScreenshotOptions;
    pdfOptions: PDFOptions;
  };
  crawler: {
    enabled: boolean;
    maxConcurrentCrawls: number;
    defaultTimeout: number;
    retryAttempts: number;
    retryDelay: number;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    blockedDomains: string[];
    allowedDomains: string[];
    maxDepth: number;
    maxPages: number;
    respectRobots: boolean;
    followRedirects: boolean;
    maxRedirects: number;
    delayBetweenRequests: number;
    enableJavaScript: boolean;
    enableImages: boolean;
    enableCSS: boolean;
    enableFonts: boolean;
    enableMedia: boolean;
  };
  optimization: {
    enabled: boolean;
    maxConcurrentOptimizations: number;
    defaultTimeout: number;
    retryAttempts: number;
    retryDelay: number;
    optimizationLevel: 'basic' | 'standard' | 'aggressive';
    enabledRules: string[];
    disabledRules: string[];
    generateReport: boolean;
    takeScreenshots: boolean;
    generatePDF: boolean;
    preserveOriginal: boolean;
    backupOriginal: boolean;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    alertThresholds: {
      memoryUsage: number;
      cpuUsage: number;
      errorRate: number;
      queueBacklog: number;
      responseTime: number;
    };
    retention: {
      metrics: number;
      alerts: number;
      logs: number;
    };
    notifications: {
      email: boolean;
      slack: boolean;
      webhook: boolean;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
    lazyConnect: boolean;
  };
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    logDirectory: string;
    maxFileSize: number;
    maxFiles: number;
  };
}

export const defaultConfig: HeadlessConfig = {
  headless: {
    enabled: true,
    maxPages: 10,
    launchOptions: {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      ignoreDefaultArgs: false,
      handleSIGINT: true,
      handleSIGTERM: true,
      handleSIGHUP: true,
      timeout: 30000,
      protocolTimeout: 30000,
      slowMo: 0,
      devtools: false,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
      }
    },
    pageOptions: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    navigationOptions: {
      waitUntil: 'networkidle2',
      timeout: 30000,
      waitForSelector: undefined
    },
    screenshotOptions: {
      fullPage: true,
      type: 'png',
      quality: 90,
      omitBackground: false,
      encoding: 'base64'
    },
    pdfOptions: {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      displayHeaderFooter: false,
      scale: 1,
      preferCSSPageSize: true,
      tagged: false
    }
  },
  crawler: {
    enabled: true,
    maxConcurrentCrawls: 5,
    defaultTimeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    viewport: {
      width: 1920,
      height: 1080
    },
    blockedDomains: [],
    allowedDomains: [],
    maxDepth: 3,
    maxPages: 100,
    respectRobots: true,
    followRedirects: true,
    maxRedirects: 5,
    delayBetweenRequests: 1000,
    enableJavaScript: true,
    enableImages: true,
    enableCSS: true,
    enableFonts: true,
    enableMedia: true
  },
  optimization: {
    enabled: true,
    maxConcurrentOptimizations: 3,
    defaultTimeout: 120000,
    retryAttempts: 3,
    retryDelay: 5000,
    optimizationLevel: 'standard',
    enabledRules: [],
    disabledRules: [],
    generateReport: true,
    takeScreenshots: true,
    generatePDF: true,
    preserveOriginal: true,
    backupOriginal: true
  },
  monitoring: {
    enabled: true,
    interval: 60000,
    alertThresholds: {
      memoryUsage: 80,
      cpuUsage: 80,
      errorRate: 10,
      queueBacklog: 100,
      responseTime: 5000
    },
    retention: {
      metrics: 7,
      alerts: 30,
      logs: 30
    },
    notifications: {
      email: false,
      slack: false,
      webhook: false
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: true,
    logDirectory: 'logs',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }
};

export class ConfigManager {
  private config: HeadlessConfig;
  private logger: any;

  constructor(logger: any) {
    this.logger = logger;
    this.config = this.loadConfig();
  }

  private loadConfig(): HeadlessConfig {
    try {
      // Load from environment variables
      const envConfig = this.loadFromEnvironment();
      
      // Merge with default config
      const config = this.mergeConfigs(defaultConfig, envConfig);
      
      // Validate config
      this.validateConfig(config);
      
      this.logger.info('Configuration loaded successfully');
      return config;
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      return defaultConfig;
    }
  }

  private loadFromEnvironment(): Partial<HeadlessConfig> {
    return {
      headless: {
        enabled: process.env.HEADLESS_ENABLED === 'true',
        maxPages: parseInt(process.env.HEADLESS_MAX_PAGES || '10'),
        launchOptions: {
          headless: process.env.HEADLESS_MODE === 'false' ? false : 'new',
          args: process.env.HEADLESS_ARGS ? process.env.HEADLESS_ARGS.split(',') : undefined,
          timeout: parseInt(process.env.HEADLESS_TIMEOUT || '30000'),
          ignoreHTTPSErrors: process.env.HEADLESS_IGNORE_HTTPS === 'true'
        }
      },
      crawler: {
        enabled: process.env.CRAWLER_ENABLED === 'true',
        maxConcurrentCrawls: parseInt(process.env.CRAWLER_MAX_CONCURRENT || '5'),
        defaultTimeout: parseInt(process.env.CRAWLER_TIMEOUT || '30000'),
        retryAttempts: parseInt(process.env.CRAWLER_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.CRAWLER_RETRY_DELAY || '1000'),
        userAgent: process.env.CRAWLER_USER_AGENT,
        maxDepth: parseInt(process.env.CRAWLER_MAX_DEPTH || '3'),
        maxPages: parseInt(process.env.CRAWLER_MAX_PAGES || '100'),
        respectRobots: process.env.CRAWLER_RESPECT_ROBOTS === 'true',
        followRedirects: process.env.CRAWLER_FOLLOW_REDIRECTS === 'true',
        maxRedirects: parseInt(process.env.CRAWLER_MAX_REDIRECTS || '5'),
        delayBetweenRequests: parseInt(process.env.CRAWLER_DELAY || '1000'),
        enableJavaScript: process.env.CRAWLER_ENABLE_JS === 'true',
        enableImages: process.env.CRAWLER_ENABLE_IMAGES === 'true',
        enableCSS: process.env.CRAWLER_ENABLE_CSS === 'true',
        enableFonts: process.env.CRAWLER_ENABLE_FONTS === 'true',
        enableMedia: process.env.CRAWLER_ENABLE_MEDIA === 'true'
      },
      optimization: {
        enabled: process.env.OPTIMIZATION_ENABLED === 'true',
        maxConcurrentOptimizations: parseInt(process.env.OPTIMIZATION_MAX_CONCURRENT || '3'),
        defaultTimeout: parseInt(process.env.OPTIMIZATION_TIMEOUT || '120000'),
        retryAttempts: parseInt(process.env.OPTIMIZATION_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.OPTIMIZATION_RETRY_DELAY || '5000'),
        optimizationLevel: process.env.OPTIMIZATION_LEVEL as 'basic' | 'standard' | 'aggressive' || 'standard',
        enabledRules: process.env.OPTIMIZATION_ENABLED_RULES ? process.env.OPTIMIZATION_ENABLED_RULES.split(',') : [],
        disabledRules: process.env.OPTIMIZATION_DISABLED_RULES ? process.env.OPTIMIZATION_DISABLED_RULES.split(',') : [],
        generateReport: process.env.OPTIMIZATION_GENERATE_REPORT === 'true',
        takeScreenshots: process.env.OPTIMIZATION_TAKE_SCREENSHOTS === 'true',
        generatePDF: process.env.OPTIMIZATION_GENERATE_PDF === 'true',
        preserveOriginal: process.env.OPTIMIZATION_PRESERVE_ORIGINAL === 'true',
        backupOriginal: process.env.OPTIMIZATION_BACKUP_ORIGINAL === 'true'
      },
      monitoring: {
        enabled: process.env.MONITORING_ENABLED === 'true',
        interval: parseInt(process.env.MONITORING_INTERVAL || '60000'),
        alertThresholds: {
          memoryUsage: parseInt(process.env.MONITORING_MEMORY_THRESHOLD || '80'),
          cpuUsage: parseInt(process.env.MONITORING_CPU_THRESHOLD || '80'),
          errorRate: parseInt(process.env.MONITORING_ERROR_RATE_THRESHOLD || '10'),
          queueBacklog: parseInt(process.env.MONITORING_QUEUE_BACKLOG_THRESHOLD || '100'),
          responseTime: parseInt(process.env.MONITORING_RESPONSE_TIME_THRESHOLD || '5000')
        },
        retention: {
          metrics: parseInt(process.env.MONITORING_METRICS_RETENTION || '7'),
          alerts: parseInt(process.env.MONITORING_ALERTS_RETENTION || '30'),
          logs: parseInt(process.env.MONITORING_LOGS_RETENTION || '30')
        },
        notifications: {
          email: process.env.MONITORING_EMAIL_NOTIFICATIONS === 'true',
          slack: process.env.MONITORING_SLACK_NOTIFICATIONS === 'true',
          webhook: process.env.MONITORING_WEBHOOK_NOTIFICATIONS === 'true'
        }
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
        lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true'
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: process.env.LOG_CONSOLE !== 'false',
        enableFile: process.env.LOG_FILE !== 'false',
        logDirectory: process.env.LOG_DIRECTORY || 'logs',
        maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'), // 10MB
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
      }
    };
  }

  private mergeConfigs(defaultConfig: HeadlessConfig, envConfig: Partial<HeadlessConfig>): HeadlessConfig {
    return {
      headless: { ...defaultConfig.headless, ...envConfig.headless },
      crawler: { ...defaultConfig.crawler, ...envConfig.crawler },
      optimization: { ...defaultConfig.optimization, ...envConfig.optimization },
      monitoring: { ...defaultConfig.monitoring, ...envConfig.monitoring },
      redis: { ...defaultConfig.redis, ...envConfig.redis },
      logging: { ...defaultConfig.logging, ...envConfig.logging }
    };
  }

  private validateConfig(config: HeadlessConfig): void {
    // Validate headless config
    if (config.headless.maxPages < 1 || config.headless.maxPages > 100) {
      throw new Error('Headless maxPages must be between 1 and 100');
    }

    // Validate crawler config
    if (config.crawler.maxConcurrentCrawls < 1 || config.crawler.maxConcurrentCrawls > 20) {
      throw new Error('Crawler maxConcurrentCrawls must be between 1 and 20');
    }

    // Validate optimization config
    if (config.optimization.maxConcurrentOptimizations < 1 || config.optimization.maxConcurrentOptimizations > 10) {
      throw new Error('Optimization maxConcurrentOptimizations must be between 1 and 10');
    }

    // Validate monitoring config
    if (config.monitoring.interval < 1000 || config.monitoring.interval > 300000) {
      throw new Error('Monitoring interval must be between 1000ms and 300000ms');
    }
  }

  getConfig(): HeadlessConfig {
    return this.config;
  }

  updateConfig(updates: Partial<HeadlessConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.validateConfig(this.config);
    this.logger.info('Configuration updated');
  }

  getHeadlessConfig() {
    return this.config.headless;
  }

  getCrawlerConfig() {
    return this.config.crawler;
  }

  getOptimizationConfig() {
    return this.config.optimization;
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  getRedisConfig() {
    return this.config.redis;
  }

  getLoggingConfig() {
    return this.config.logging;
  }
}

export default ConfigManager;
