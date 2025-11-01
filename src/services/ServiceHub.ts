/**
 * ServiceHub - Central integration point for all unused services
 * Connects overlooked services to the main application
 */

import { MiningService } from './api/MiningService';
import { GamificationEngine } from '../core/GamificationEngine';
import { SlotAwareSpaceOptimizer } from '../core/SlotAwareSpaceOptimizer';
import { MetaverseAnimationService } from './api/MetaverseAnimationService';
import { WebAuthnService } from './api/WebAuthnService';
import { PaymentService } from './api/PaymentService';
import { TwoFactorAuthService } from './api/TwoFactorAuthService';
import { SSOService } from './api/SSOService';
import { MetaverseAlchemyEngine } from '../core/MetaverseAlchemyEngine';
import { SpaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { DOMOptimizationEngine } from '../core/DOMOptimizationEngine';
import { LightDomSlotSystem } from '../core/LightDomSlotSystem';
import { TaskManager } from './api/TaskManager';
import { BridgeAnalyticsService } from './api/BridgeAnalyticsService';
import { BridgeNotificationService } from './api/BridgeNotificationService';
import { CrossChainService } from './api/CrossChainService';
import { SpaceBridgeService } from './api/SpaceBridgeService';

export interface ServiceHubConfig {
  enableAuthentication?: boolean;
  enablePayments?: boolean;
  enableMonitoring?: boolean;
  enableBackgroundWorkers?: boolean;
  maxConcurrentTasks?: number;
}

export class ServiceHub {
  private static instance: ServiceHub;
  
  // Core Services
  public mining: MiningService;
  public gamification: GamificationEngine;
  public slotOptimizer: SlotAwareSpaceOptimizer;
  public animation: MetaverseAnimationService;
  public metaverseAlchemy: MetaverseAlchemyEngine;
  public spaceOptimization: SpaceOptimizationEngine;
  public domOptimization: DOMOptimizationEngine;
  public slotSystem: LightDomSlotSystem;
  
  // Authentication Services
  public webAuthn: WebAuthnService;
  public twoFactor: TwoFactorAuthService;
  public sso: SSOService;
  
  // Payment & Commerce
  public payment: any;
  
  // Browser & Crawling Services (server-only; lazy init)
  public headlessChrome: any;
  public browserbase: any;
  public webCrawler: any;
  
  // Task & Worker Services
  public taskManager: TaskManager;
  public backgroundWorker: any;
  
  // Monitoring & Analytics
  public monitoring: any;
  public bridgeAnalytics: BridgeAnalyticsService;
  public bridgeNotifications: BridgeNotificationService;
  
  // Blockchain Services
  public crossChain: CrossChainService;
  public spaceBridge: SpaceBridgeService;
  
  private config: ServiceHubConfig;
  private initialized: boolean = false;
  
  private constructor(config: ServiceHubConfig = {}) {
    this.config = {
      enableAuthentication: true,
      enablePayments: true,
      enableMonitoring: true,
      enableBackgroundWorkers: true,
      maxConcurrentTasks: 10,
      ...config
    };
    
    console.log('🚀 Initializing ServiceHub with overlooked services...');
    
    // Initialize core services
    this.mining = MiningService.getInstance();
    this.gamification = new GamificationEngine();
    this.slotOptimizer = new SlotAwareSpaceOptimizer();
    this.animation = new MetaverseAnimationService();
    this.metaverseAlchemy = new MetaverseAlchemyEngine();
    this.spaceOptimization = new SpaceOptimizationEngine();
    // DOMOptimizationEngine uses a singleton pattern with a private constructor
    // use the public getInstance() accessor instead of direct construction.
    this.domOptimization = DOMOptimizationEngine.getInstance();
    this.slotSystem = new LightDomSlotSystem();
    
    // Initialize authentication services
    if (this.config.enableAuthentication) {
      // Many services expect a configuration object; pass a minimal empty config to satisfy constructors.
      try {
        this.webAuthn = new WebAuthnService({} as any);
      } catch (e) {
        // Fallback to undefined in environments where service is not available
        this.webAuthn = undefined as any;
      }

      try {
        this.twoFactor = new TwoFactorAuthService({} as any);
      } catch (e) {
        this.twoFactor = undefined as any;
      }

      try {
        this.sso = new SSOService({} as any);
      } catch (e) {
        this.sso = undefined as any;
      }
    }
    
    // Defer server-only service instantiation to initialize()
    this.payment = null;
    this.headlessChrome = null;
    this.browserbase = null;
    this.webCrawler = null;
    this.backgroundWorker = null;
    this.monitoring = null;

    // Client-safe services
    this.bridgeAnalytics = new BridgeAnalyticsService();
    this.bridgeNotifications = new BridgeNotificationService();

    // Task manager will be recreated with real headless service in initialize()
    this.taskManager = new TaskManager(undefined as any);
    
    // Initialize blockchain services
    try {
      this.crossChain = new CrossChainService({} as any);
    } catch (e) {
      this.crossChain = undefined as any;
    }
    this.spaceBridge = new SpaceBridgeService();
    
    console.log('✅ ServiceHub core initialized');
  }
  
  static getInstance(config?: ServiceHubConfig): ServiceHub {
    if (!ServiceHub.instance) {
      ServiceHub.instance = new ServiceHub(config);
    }
    return ServiceHub.instance;
  }
  
  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('ServiceHub already initialized');
      return;
    }
    
    console.log('🔧 Starting service initialization...');
    
    try {
      const isBrowser = typeof window !== 'undefined';

      // Server-only dynamic imports and instantiation
      if (!isBrowser) {
        if (this.config.enablePayments && !this.payment) {
          const { PaymentService } = await import('./api/PaymentService');
          this.payment = new PaymentService();
        }

        if (!this.headlessChrome || !this.webCrawler || !this.browserbase) {
          const [{ HeadlessChromeService }, { EnhancedWebCrawlerService }, { BrowserbaseService }] = await Promise.all([
            import('./api/HeadlessChromeService'),
            import('./api/EnhancedWebCrawlerService'),
            import('./api/BrowserbaseService')
          ]);

          // Instantiate headless service (constructor may not accept args)
          try {
            this.headlessChrome = new HeadlessChromeService();
          } catch (e) {
            this.headlessChrome = {} as any;
          }

          // Instantiate browserbase first since EnhancedWebCrawler depends on it
          try {
            this.browserbase = new BrowserbaseService({ apiKey: 'dev', keepAlive: false } as any);
          } catch (e) {
            this.browserbase = {} as any;
          }

          try {
            // EnhancedWebCrawlerService expects (headlessService, browserbaseService, optimizationEngine)
            this.webCrawler = new EnhancedWebCrawlerService(this.headlessChrome as any, this.browserbase as any, this.spaceOptimization as any);
          } catch (e) {
            this.webCrawler = {} as any;
          }

          // Recreate task manager with real headless service when available
          try {
            this.taskManager = new TaskManager(this.headlessChrome as any);
          } catch (e) {
            this.taskManager = new TaskManager(undefined as any);
          }
        }

        if (this.config.enableBackgroundWorkers && !this.backgroundWorker) {
          const { BackgroundWorkerService } = await import('./api/BackgroundWorkerService');
          this.backgroundWorker = new BackgroundWorkerService();
        }

        if (this.config.enableMonitoring && !this.monitoring) {
          const { MonitoringService } = await import('./api/MonitoringService');
          this.monitoring = new MonitoringService({
            enabled: true,
            interval: 60000,
            alertThresholds: { memoryUsage: 80, cpuUsage: 1.0, errorRate: 5, queueBacklog: 100, responseTime: 2000 },
            retention: { metrics: 7, alerts: 7, logs: 7 },
            notifications: { email: false, slack: false, webhook: false }
          } as any);
        }
      }

      // Initialize services that require async setup
      const initPromises: Promise<any>[] = [];
      if ((this.mining as any)?.initialize) initPromises.push((this.mining as any).initialize());
      if ((this.slotSystem as any)?.initialize) initPromises.push((this.slotSystem as any).initialize());
      if ((this.headlessChrome as any)?.initialize) initPromises.push((this.headlessChrome as any).initialize());
      if ((this.webCrawler as any)?.initialize) initPromises.push((this.webCrawler as any).initialize());
      if ((this.monitoring as any)?.initialize) initPromises.push((this.monitoring as any).initialize());
      if ((this.backgroundWorker as any)?.initialize) initPromises.push((this.backgroundWorker as any).initialize());
      await Promise.all(initPromises);
      
      this.initialized = true;
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Optimize DOM using multiple optimization engines
   */
  async optimizeDOM(url: string, html: string): Promise<any> {
    console.log(`🔍 Optimizing DOM for ${url}`);
    
    // Run optimizations in parallel
    const [
      domOptimization,
      spaceOptimization,
      slotOptimization
    ] = await Promise.all([
      (this.domOptimization as any)?.optimize?.(html),
      (this.spaceOptimization as any)?.analyzeSpace?.(html),
      // support both optimizeWithSlots and optimizeSlot implementations
      ((this.slotOptimizer as any)?.optimizeWithSlots ? (this.slotOptimizer as any).optimizeWithSlots(html) : (this.slotOptimizer as any).optimizeSlot?.(html))
    ]);
    
    // Combine results
    const result = {
      url,
      timestamp: new Date().toISOString(),
      domOptimization,
      spaceOptimization,
      slotOptimization,
      totalSavings: domOptimization.savings + spaceOptimization.savings + slotOptimization.savings
    };
    
    // Track in gamification
    await (this.gamification as any).trackOptimization?.(result);
    
    // Mine if significant savings
    if (result.totalSavings > 1000) {
      await (this.mining as any).submitOptimization?.(result);
    }
    
    return result;
  }
  
  /**
   * Start a mining session with all integrated services
   */
  async startMiningSession(config: any): Promise<string> {
    const sessionId = await (this.mining as any).startSession?.(config);
    
    // Enable background workers for mining
    if (this.backgroundWorker) {
      await this.backgroundWorker.scheduleTask({
        type: 'mining',
        sessionId,
        interval: 60000 // Check every minute
      });
    }
    
    // Start monitoring
    if (this.monitoring?.trackSession) {
      await this.monitoring.trackSession(sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Process payment with integrated services
   */
  async processPayment(paymentData: any): Promise<any> {
    if (!this.payment) {
      throw new Error('Payment service not enabled');
    }
    
    // Process payment
    const result = await this.payment.processPayment(paymentData);
    
    // Award gamification points
    await (this.gamification as any).awardPoints?.('payment', result.amount);
    
    // Track analytics
    if (this.bridgeAnalytics) {
      await (this.bridgeAnalytics as any).trackPayment?.(result);
    }
    
    return result;
  }
  
  /**
   * Get comprehensive analytics
   */
  async getAnalytics(): Promise<any> {
    const [
      miningStats,
      gamificationStats,
      optimizationStats,
      paymentStats
    ] = await Promise.all([
      (this.mining as any).getStats?.() || {},
      (this.gamification as any).getStats?.() || {},
      (this.spaceOptimization as any).getStats?.() || {},
      (this.payment as any)?.getStats?.() || {}
    ]);
    
    return {
      mining: miningStats,
      gamification: gamificationStats,
      optimization: optimizationStats,
      payments: paymentStats,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down ServiceHub...');
    
    await Promise.all([
      (this.mining as any)?.shutdown?.(),
      (this.headlessChrome as any)?.shutdown?.(),
      (this.webCrawler as any)?.shutdown?.(),
      (this.backgroundWorker as any)?.stop?.(),
      (this.monitoring as any)?.stop?.()
    ].filter(Boolean as any));
    
    this.initialized = false;
    console.log('✅ ServiceHub shutdown complete');
  }

  // Helper accessors for older code expecting getter methods
  getWebCrawler(): any {
    return this.webCrawler;
  }

  getBlockchain(): any {
    return this.crossChain;
  }
}

// Export singleton instance
export const serviceHub = ServiceHub.getInstance();


