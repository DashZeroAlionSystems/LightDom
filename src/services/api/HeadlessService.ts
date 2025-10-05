import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ConfigManager } from '../config/HeadlessConfig';
import HeadlessChromeService from './HeadlessChromeService';
import WebCrawlerService from './WebCrawlerService';
import OptimizationEngine from './OptimizationEngine';
import BackgroundWorkerService from './BackgroundWorkerService';
import MonitoringService from './MonitoringService';
import DOMAnalyzer from './DOMAnalyzer';

export class HeadlessService extends EventEmitter {
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private configManager: ConfigManager;
  private headlessChrome: HeadlessChromeService;
  private webCrawler: WebCrawlerService;
  private optimizationEngine: OptimizationEngine;
  private backgroundWorker: BackgroundWorkerService;
  private monitoringService: MonitoringService;
  private domAnalyzer: DOMAnalyzer;
  private isInitialized = false;

  constructor() {
    super();
    this.logger = new Logger('HeadlessService');
    this.errorHandler = new ErrorHandler();
    this.configManager = new ConfigManager(this.logger);
    
    // Initialize services
    this.headlessChrome = new HeadlessChromeService();
    this.webCrawler = new WebCrawlerService();
    this.optimizationEngine = new OptimizationEngine();
    this.backgroundWorker = new BackgroundWorkerService();
    this.monitoringService = new MonitoringService(this.configManager.getMonitoringConfig());
    this.domAnalyzer = new DOMAnalyzer();
  }

  /**
   * Initialize all headless services
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing HeadlessService');

      // Initialize core services
      await this.headlessChrome.initialize();
      await this.webCrawler.initialize();
      await this.optimizationEngine.initialize();
      await this.backgroundWorker.initialize();

      // Register services with monitoring
      this.monitoringService.registerServices({
        headless: this.headlessChrome,
        crawler: this.webCrawler,
        optimization: this.optimizationEngine,
        backgroundWorker: this.backgroundWorker
      });

      // Initialize monitoring
      await this.monitoringService.initialize();

      this.isInitialized = true;
      this.logger.info('HeadlessService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize HeadlessService:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      services: {
        headlessChrome: this.headlessChrome.getStatus(),
        webCrawler: this.webCrawler.getStatus(),
        optimizationEngine: this.optimizationEngine.getStatus(),
        backgroundWorker: this.backgroundWorker.getStatus(),
        monitoringService: this.monitoringService.getStatus()
      },
      config: this.configManager.getConfig(),
      errors: this.errorHandler.getStatus()
    };
  }

  /**
   * Get headless Chrome service
   */
  getHeadlessChromeService(): HeadlessChromeService {
    return this.headlessChrome;
  }

  /**
   * Get web crawler service
   */
  getWebCrawlerService(): WebCrawlerService {
    return this.webCrawler;
  }

  /**
   * Get optimization engine
   */
  getOptimizationEngine(): OptimizationEngine {
    return this.optimizationEngine;
  }

  /**
   * Get background worker service
   */
  getBackgroundWorkerService(): BackgroundWorkerService {
    return this.backgroundWorker;
  }

  /**
   * Get monitoring service
   */
  getMonitoringService(): MonitoringService {
    return this.monitoringService;
  }

  /**
   * Get DOM analyzer
   */
  getDOMAnalyzer(): DOMAnalyzer {
    return this.domAnalyzer;
  }

  /**
   * Get configuration manager
   */
  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * Get error handler
   */
  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * Cleanup all services
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up HeadlessService');

      // Cleanup services in reverse order
      await this.monitoringService.cleanup();
      await this.backgroundWorker.cleanup();
      await this.optimizationEngine.cleanup();
      await this.webCrawler.cleanup();
      await this.headlessChrome.cleanup();

      this.isInitialized = false;
      this.logger.info('HeadlessService cleaned up successfully');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default HeadlessService;
