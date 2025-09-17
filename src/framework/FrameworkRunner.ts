/**
 * Framework Runner - Main entry point for LightDom Framework
 * Orchestrates all framework components and provides unified interface
 */

import { EventEmitter } from 'events';
import { lightDomFramework, FrameworkConfig } from './LightDomFramework';
import { urlQueueManager, QueueConfig } from './URLQueueManager';
import { simulationEngine, SimulationConfig } from './SimulationEngine';
import { apiGateway, APIGatewayConfig } from './APIGateway';

export interface RunnerConfig {
  framework: Partial<FrameworkConfig>;
  queue: Partial<QueueConfig>;
  simulation: Partial<SimulationConfig>;
  api: Partial<APIGatewayConfig>;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableWebhook: boolean;
  webhookUrl?: string;
  autoStart: boolean;
}

export interface FrameworkStatus {
  running: boolean;
  components: {
    framework: boolean;
    queue: boolean;
    simulation: boolean;
    api: boolean;
  };
  uptime: number;
  startTime: number;
  metrics: {
    totalOptimizations: number;
    totalSpaceSaved: number;
    totalTokensDistributed: number;
    activeNodes: number;
    queueSize: number;
    simulationEfficiency: number;
  };
}

export class FrameworkRunner extends EventEmitter {
  private config: RunnerConfig;
  private isRunning = false;
  private startTime = 0;
  private statusInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;

  constructor(config: Partial<RunnerConfig> = {}) {
    super();
    this.config = {
      framework: {},
      queue: {},
      simulation: {},
      api: {},
      enableLogging: true,
      enableMetrics: true,
      enableWebhook: false,
      autoStart: true,
      ...config
    };

    this.setupEventHandlers();
  }

  /**
   * Start the LightDom Framework
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ LightDom Framework is already running');
      return;
    }

    try {
      console.log('🚀 Starting LightDom Framework...');
      this.startTime = Date.now();

      // Initialize framework
      await lightDomFramework.initialize();
      console.log('✅ Framework initialized');

      // Start simulation engine
      await simulationEngine.start();
      console.log('✅ Simulation engine started');

      // Start API gateway
      await apiGateway.start();
      console.log('✅ API gateway started');

      // Start monitoring
      this.startMonitoring();

      this.isRunning = true;
      this.emit('started', this.getStatus());

      console.log('🎉 LightDom Framework started successfully!');
      console.log(`📊 API available at: http://localhost:${apiGateway.getStatus().port}/api/v1`);
      console.log(`📚 Documentation: http://localhost:${apiGateway.getStatus().port}/api/v1/docs`);

    } catch (error) {
      console.error('❌ Failed to start LightDom Framework:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop the LightDom Framework
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      console.log('🛑 Stopping LightDom Framework...');

      // Stop monitoring
      this.stopMonitoring();

      // Stop API gateway
      await apiGateway.stop();
      console.log('✅ API gateway stopped');

      // Stop simulation engine
      await simulationEngine.stop();
      console.log('✅ Simulation engine stopped');

      // Stop framework
      await lightDomFramework.stop();
      console.log('✅ Framework stopped');

      this.isRunning = false;
      this.emit('stopped');

      console.log('✅ LightDom Framework stopped successfully');

    } catch (error) {
      console.error('❌ Error stopping LightDom Framework:', error);
      throw error;
    }
  }

  /**
   * Restart the framework
   */
  async restart(): Promise<void> {
    console.log('🔄 Restarting LightDom Framework...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.start();
  }

  /**
   * Get framework status
   */
  getStatus(): FrameworkStatus {
    const frameworkStatus = lightDomFramework.getStatus();
    const queueStatus = urlQueueManager.getStatus();
    const simulationStatus = simulationEngine.getSimulationStatistics();
    const apiStatus = apiGateway.getStatus();

    return {
      running: this.isRunning,
      components: {
        framework: frameworkStatus.running,
        queue: true, // Queue manager is always available
        simulation: simulationEngine.isSimulationRunning(),
        api: apiStatus.running
      },
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      startTime: this.startTime,
      metrics: {
        totalOptimizations: frameworkStatus.systemStats.totalTasks || 0,
        totalSpaceSaved: frameworkStatus.systemStats.totalSpaceProcessed || 0,
        totalTokensDistributed: frameworkStatus.systemStats.totalTokensEarned || 0,
        activeNodes: frameworkStatus.systemStats.activeNodes || 0,
        queueSize: queueStatus.total,
        simulationEfficiency: simulationStatus.averageEfficiency || 0
      }
    };
  }

  /**
   * Add URL to optimization queue
   */
  async addURL(
    url: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    siteType: 'ecommerce' | 'blog' | 'corporate' | 'portfolio' | 'news' | 'social' | 'other' = 'other'
  ): Promise<string> {
    if (!this.isRunning) {
      throw new Error('Framework is not running');
    }

    return await lightDomFramework.addURLToQueue(url, priority, siteType);
  }

  /**
   * Add multiple URLs to queue
   */
  async addURLs(
    urls: Array<{
      url: string;
      priority?: 'high' | 'medium' | 'low';
      siteType?: 'ecommerce' | 'blog' | 'corporate' | 'portfolio' | 'news' | 'social' | 'other';
    }>
  ): Promise<string[]> {
    if (!this.isRunning) {
      throw new Error('Framework is not running');
    }

    return urlQueueManager.addURLs(urls);
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return urlQueueManager.getStatus();
  }

  /**
   * Get optimization perks
   */
  getOptimizationPerks(siteType?: string) {
    if (siteType) {
      return lightDomFramework.getOptimizationPerks(siteType);
    }
    return lightDomFramework.getAllOptimizationPerks();
  }

  /**
   * Run simulation
   */
  async runSimulation() {
    if (!this.isRunning) {
      throw new Error('Framework is not running');
    }

    return await simulationEngine.runSimulation();
  }

  /**
   * Get simulation history
   */
  getSimulationHistory() {
    return simulationEngine.getSimulationHistory();
  }

  /**
   * Get framework metrics
   */
  getMetrics() {
    const status = this.getStatus();
    const queueMetrics = urlQueueManager.getMetrics();
    const simulationStats = simulationEngine.getSimulationStatistics();

    return {
      framework: status,
      queue: queueMetrics,
      simulation: simulationStats,
      performance: {
        uptime: status.uptime,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RunnerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Framework events
    lightDomFramework.on('urlAdded', (item) => {
      this.emit('urlAdded', item);
    });

    lightDomFramework.on('optimizationCompleted', (data) => {
      this.emit('optimizationCompleted', data);
    });

    lightDomFramework.on('optimizationFailed', (data) => {
      this.emit('optimizationFailed', data);
    });

    // Simulation events
    simulationEngine.on('simulationCompleted', (result) => {
      this.emit('simulationCompleted', result);
    });

    simulationEngine.on('simulationError', (error) => {
      this.emit('simulationError', error);
    });

    // API events
    apiGateway.on('webhookReceived', (payload) => {
      this.emit('webhookReceived', payload);
    });
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    if (!this.config.enableMetrics) {
      return;
    }

    // Status monitoring every 30 seconds
    this.statusInterval = setInterval(() => {
      const status = this.getStatus();
      this.emit('statusUpdate', status);
    }, 30000);

    // Metrics collection every 5 minutes
    this.metricsInterval = setInterval(() => {
      const metrics = this.getMetrics();
      this.emit('metricsUpdate', metrics);
    }, 5 * 60 * 1000);

    console.log('📊 Monitoring started');
  }

  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    console.log('📊 Monitoring stopped');
  }

  /**
   * Graceful shutdown handler
   */
  setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  }
}

// Export singleton instance
export const frameworkRunner = new FrameworkRunner();

// Auto-start if configured
if (process.env.NODE_ENV !== 'test' && process.env.AUTO_START !== 'false') {
  frameworkRunner.setupGracefulShutdown();
  
  // Start framework
  frameworkRunner.start().catch(error => {
    console.error('❌ Failed to start framework:', error);
    process.exit(1);
  });
}
