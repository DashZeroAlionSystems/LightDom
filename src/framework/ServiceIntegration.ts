/**
 * Service Integration Layer
 * Connects all unconnected services to the framework
 */

import { EventEmitter } from 'events';

// Core imports
import { LightDomSlotSystem } from '../core/LightDomSlotSystem';
import { SlotAwareSpaceOptimizer } from '../core/SlotAwareSpaceOptimizer';
import { DOMOptimizationEngine } from '../core/DOMOptimizationEngine';
import { MetaverseMiningEngine } from '../core/MetaverseMiningEngine';
import { GamificationEngine } from '../core/GamificationEngine';
import { BlockchainModelStorage } from '../core/BlockchainModelStorage';

// Service imports
import { MiningService } from '../services/api/MiningService';
import { BlockchainService } from '../services/api/BlockchainService';
import { MetaverseAnimationService } from '../services/api/MetaverseAnimationService';
import { CursorN8nIntegrationService } from '../services/api/CursorN8nIntegrationService';
import { BridgeAnalyticsService } from '../services/api/BridgeAnalyticsService';
import { WebAuthnService } from '../services/api/WebAuthnService';
import { PaymentService } from '../services/api/PaymentService';

// Design system
import { designSystem } from '../styles/design-system';

export interface IntegratedServices {
  // Core services
  slotSystem: LightDomSlotSystem;
  slotOptimizer: SlotAwareSpaceOptimizer;
  domOptimizer: DOMOptimizationEngine;
  miningEngine: MetaverseMiningEngine;
  gamification: GamificationEngine;
  blockchainStorage: BlockchainModelStorage;
  
  // API services
  miningService: MiningService;
  blockchainService: BlockchainService;
  animationService: MetaverseAnimationService;
  cursorN8nService: CursorN8nIntegrationService;
  analyticsService: BridgeAnalyticsService;
  authService: WebAuthnService;
  paymentService: PaymentService;
}

export class ServiceIntegration extends EventEmitter {
  private services: Partial<IntegratedServices> = {};
  private initialized = false;

  constructor() {
    super();
  }

  /**
   * Initialize all services and connect them to the framework
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize core services
      this.services.slotSystem = new LightDomSlotSystem();
      this.services.slotOptimizer = new SlotAwareSpaceOptimizer();
      this.services.domOptimizer = new DOMOptimizationEngine();
      this.services.miningEngine = new MetaverseMiningEngine();
      this.services.gamification = new GamificationEngine();
      this.services.blockchainStorage = new BlockchainModelStorage();

      // Initialize API services
      this.services.miningService = MiningService.getInstance();
      this.services.blockchainService = new BlockchainService({
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '1337')
      });
      this.services.animationService = new MetaverseAnimationService();
      this.services.cursorN8nService = new CursorN8nIntegrationService();
      this.services.analyticsService = new BridgeAnalyticsService();
      this.services.authService = new WebAuthnService();
      this.services.paymentService = new PaymentService();

      // Connect services
      await this.connectServices();
      
      this.initialized = true;
      this.emit('initialized', this.services);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Connect services together
   */
  private async connectServices(): Promise<void> {
    // Connect slot system to DOM optimizer
    if (this.services.slotSystem && this.services.domOptimizer) {
      this.services.domOptimizer.on('optimization', (result) => {
        this.services.slotSystem!.processOptimization(result);
      });
    }

    // Connect mining engine to mining service
    if (this.services.miningEngine && this.services.miningService) {
      this.services.miningEngine.on('blockMined', (block) => {
        this.services.miningService!.submitBlock(block);
      });
    }

    // Connect blockchain service to storage
    if (this.services.blockchainService && this.services.blockchainStorage) {
      this.services.blockchainService.on('transaction', (tx) => {
        this.services.blockchainStorage!.storeTransaction(tx);
      });
    }

    // Connect animation service to gamification
    if (this.services.animationService && this.services.gamification) {
      this.services.gamification.on('achievement', (achievement) => {
        this.services.animationService!.playAchievementAnimation(achievement);
      });
    }

    // Connect analytics to all services
    if (this.services.analyticsService) {
      this.setupAnalytics();
    }
  }

  /**
   * Setup analytics tracking
   */
  private setupAnalytics(): void {
    const analytics = this.services.analyticsService!;

    // Track slot optimizations
    this.services.slotSystem?.on('slotOptimized', (data) => {
      analytics.trackEvent('slot_optimization', data);
    });

    // Track mining activity
    this.services.miningService?.on('miningStarted', (data) => {
      analytics.trackEvent('mining_started', data);
    });

    // Track gamification events
    this.services.gamification?.on('levelUp', (data) => {
      analytics.trackEvent('user_level_up', data);
    });

    // Track payments
    this.services.paymentService?.on('paymentCompleted', (data) => {
      analytics.trackEvent('payment_completed', data);
    });
  }

  /**
   * Get integrated services
   */
  getServices(): Partial<IntegratedServices> {
    return this.services;
  }

  /**
   * Get design system for UI components
   */
  getDesignSystem() {
    return designSystem;
  }

  /**
   * Optimize DOM using integrated services
   */
  async optimizeDOM(url: string, html: string): Promise<any> {
    const results = {
      standard: null as any,
      slot: null as any,
      gamification: null as any
    };

    // Standard DOM optimization
    if (this.services.domOptimizer) {
      results.standard = await this.services.domOptimizer.optimize(html);
    }

    // Slot-aware optimization
    if (this.services.slotOptimizer) {
      results.slot = await this.services.slotOptimizer.optimizeWithSlots(html);
    }

    // Update gamification
    if (this.services.gamification && results.standard) {
      this.services.gamification.addOptimizationPoints(
        'user123', // Would come from auth
        results.standard.spaceSaved
      );
    }

    // Trigger animation
    if (this.services.animationService && results.standard) {
      this.services.animationService.playOptimizationAnimation(results.standard);
    }

    return results;
  }

  /**
   * Mine optimizations using integrated services
   */
  async mineOptimizations(optimizations: any[]): Promise<any> {
    if (!this.services.miningService || !this.services.blockchainService) {
      throw new Error('Mining services not initialized');
    }

    // Submit to mining service
    const miningResult = await this.services.miningService.mineBlock(optimizations);

    // Submit to blockchain
    const txHash = await this.services.blockchainService.submitProofOfOptimization(
      miningResult.blockHash,
      miningResult.merkleRoot,
      miningResult.totalSpaceSaved
    );

    // Update gamification
    if (this.services.gamification) {
      this.services.gamification.addMiningReward('user123', miningResult.reward);
    }

    return {
      miningResult,
      txHash
    };
  }

  /**
   * Process payment for premium features
   */
  async processPayment(userId: string, plan: string): Promise<any> {
    if (!this.services.paymentService || !this.services.authService) {
      throw new Error('Payment services not initialized');
    }

    // Authenticate user
    const isAuthenticated = await this.services.authService.verifyUser(userId);
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    // Process payment
    const paymentResult = await this.services.paymentService.createSubscription({
      userId,
      plan,
      amount: plan === 'premium' ? 9999 : 19999 // cents
    });

    // Update gamification
    if (this.services.gamification) {
      this.services.gamification.unlockPremiumFeatures(userId);
    }

    return paymentResult;
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(): Promise<any> {
    if (!this.services.analyticsService) {
      throw new Error('Analytics service not initialized');
    }

    const [
      optimizationStats,
      miningStats,
      userStats,
      revenueStats
    ] = await Promise.all([
      this.services.analyticsService.getOptimizationStats(),
      this.services.analyticsService.getMiningStats(),
      this.services.analyticsService.getUserStats(),
      this.services.analyticsService.getRevenueStats()
    ]);

    return {
      optimizationStats,
      miningStats,
      userStats,
      revenueStats,
      timestamp: Date.now()
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    // Cleanup all services
    for (const service of Object.values(this.services)) {
      if (service && typeof (service as any).shutdown === 'function') {
        await (service as any).shutdown();
      }
    }

    this.services = {};
    this.initialized = false;
    this.emit('shutdown');
  }
}

// Export singleton instance
export const serviceIntegration = new ServiceIntegration();

// Helper function to integrate with existing framework
export async function integrateServices(framework: any): Promise<void> {
  await serviceIntegration.initialize();
  const services = serviceIntegration.getServices();
  
  // Inject services into framework
  framework.services = services;
  framework.designSystem = serviceIntegration.getDesignSystem();
  
  // Override framework methods to use integrated services
  const originalOptimize = framework.optimize.bind(framework);
  framework.optimize = async (url: string, html: string) => {
    const integratedResult = await serviceIntegration.optimizeDOM(url, html);
    const originalResult = await originalOptimize(url, html);
    
    return {
      ...originalResult,
      ...integratedResult
    };
  };
  
  console.log('✅ Services successfully integrated into framework');
}
