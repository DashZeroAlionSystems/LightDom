/**
 * Blockchain Node Manager
 * Intelligent management of blockchain nodes with automated scaling, monitoring, and optimization
 */

import { EventEmitter } from 'events';
import { Browser, Page, launch as puppeteerLaunch } from 'puppeteer';
import { install, Browser as BrowserType, BrowserPlatform } from '@puppeteer/browsers';
import { detectBrowserPlatform } from '@puppeteer/browsers';
import { BlockchainNodeConfig } from './BlockchainAutomationManager';

export interface NodeHealth {
  nodeId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  uptime: number;
  lastCheck: Date;
  metrics: NodeMetrics;
  issues: NodeIssue[];
}

export interface NodeMetrics {
  cpu: number;
  memory: number;
  storage: number;
  networkLatency: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  gasUsed: number;
  transactionsProcessed: number;
  blocksMined: number;
}

export interface NodeIssue {
  id: string;
  type: 'performance' | 'connectivity' | 'resource' | 'blockchain' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface ScalingDecision {
  nodeId: string;
  action: 'scale_up' | 'scale_down' | 'maintain' | 'replace';
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  cost: number;
  timeline: string;
  resources?: {
    cpu?: number;
    memory?: number;
    storage?: number;
  };
}

export interface NodePerformance {
  nodeId: string;
  efficiency: number;
  utilization: number;
  throughput: number;
  latency: number;
  errorRate: number;
  costPerTransaction: number;
  roi: number;
}

export class BlockchainNodeManager extends EventEmitter {
  private nodes: Map<string, BlockchainNodeConfig> = new Map();
  private nodeHealth: Map<string, NodeHealth> = new Map();
  private nodePages: Map<string, Page> = new Map();
  private browser: Browser | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private scalingDecisions: Map<string, ScalingDecision> = new Map();
  private performanceHistory: Map<string, NodePerformance[]> = new Map();
  private isInitialized = false;

  constructor() {
    super();
  }

  /**
   * Initialize the node manager
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Blockchain Node Manager...');

    try {
      // Setup browser for node management
      await this.setupBrowser();

      // Initialize monitoring
      this.startMonitoring();

      // Load existing nodes
      await this.loadNodes();

      this.isInitialized = true;
      console.log('✅ Blockchain Node Manager initialized');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Blockchain Node Manager:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Setup browser for node management
   */
  private async setupBrowser(): Promise<void> {
    console.log('🌐 Setting up browser for node management...');

    try {
      const platform = detectBrowserPlatform();
      if (!platform) {
        throw new Error('Could not detect browser platform');
      }

      // Install Chrome for Testing if not already installed
      await install({
        browser: BrowserType.CHROME,
        platform: platform as BrowserPlatform,
        buildId: 'stable',
        cacheDir: './.puppeteer-cache',
      });

      // Launch browser using Puppeteer
      this.browser = await puppeteerLaunch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      console.log('✅ Browser setup completed');
    } catch (error) {
      console.error('❌ Browser setup failed:', error);
      throw error;
    }
  }

  /**
   * Load existing nodes
   */
  private async loadNodes(): Promise<void> {
    // In production, this would load from database
    const defaultNodes: BlockchainNodeConfig[] = [
      {
        nodeId: 'mining-node-1',
        type: 'mining',
        priority: 1,
        resources: { cpu: 4, memory: 8192, storage: 100 },
        blockchain: {
          network: 'mainnet',
          rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
          privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
          gasPrice: '20000000000',
          gasLimit: 500000,
        },
        automation: {
          enabled: true,
          maxConcurrency: 5,
          retryAttempts: 3,
          timeout: 30000,
        },
      },
      {
        nodeId: 'validation-node-1',
        type: 'validation',
        priority: 2,
        resources: { cpu: 2, memory: 4096, storage: 50 },
        blockchain: {
          network: 'mainnet',
          rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
          privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
          gasPrice: '20000000000',
          gasLimit: 300000,
        },
        automation: {
          enabled: true,
          maxConcurrency: 3,
          retryAttempts: 2,
          timeout: 20000,
        },
      },
    ];

    for (const node of defaultNodes) {
      await this.addNode(node);
    }
  }

  /**
   * Add a new blockchain node
   */
  async addNode(nodeConfig: BlockchainNodeConfig): Promise<void> {
    console.log(`➕ Adding node: ${nodeConfig.nodeId}`);

    try {
      // Validate node configuration
      this.validateNodeConfig(nodeConfig);

      // Create node page for management
      if (this.browser) {
        const page = await this.browser.newPage();
        await this.setupNodePage(page, nodeConfig);
        this.nodePages.set(nodeConfig.nodeId, page);
      }

      // Initialize node health
      const health: NodeHealth = {
        nodeId: nodeConfig.nodeId,
        status: 'healthy',
        uptime: 0,
        lastCheck: new Date(),
        metrics: {
          cpu: 0,
          memory: 0,
          storage: 0,
          networkLatency: 0,
          responseTime: 0,
          errorRate: 0,
          throughput: 0,
          gasUsed: 0,
          transactionsProcessed: 0,
          blocksMined: 0,
        },
        issues: [],
      };

      this.nodes.set(nodeConfig.nodeId, nodeConfig);
      this.nodeHealth.set(nodeConfig.nodeId, health);

      console.log(`✅ Node ${nodeConfig.nodeId} added successfully`);
      this.emit('nodeAdded', nodeConfig);
    } catch (error) {
      console.error(`❌ Failed to add node ${nodeConfig.nodeId}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Remove a blockchain node
   */
  async removeNode(nodeId: string): Promise<void> {
    console.log(`➖ Removing node: ${nodeId}`);

    try {
      // Close node page
      const page = this.nodePages.get(nodeId);
      if (page) {
        await page.close();
        this.nodePages.delete(nodeId);
      }

      // Remove from collections
      this.nodes.delete(nodeId);
      this.nodeHealth.delete(nodeId);
      this.scalingDecisions.delete(nodeId);
      this.performanceHistory.delete(nodeId);

      console.log(`✅ Node ${nodeId} removed successfully`);
      this.emit('nodeRemoved', nodeId);
    } catch (error) {
      console.error(`❌ Failed to remove node ${nodeId}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Setup node page for management
   */
  private async setupNodePage(page: Page, nodeConfig: BlockchainNodeConfig): Promise<void> {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('LightDom-NodeManager/1.0');

    // Navigate to blockchain dashboard or management interface
    try {
      await page.goto(nodeConfig.blockchain.rpcUrl, {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });
    } catch (error) {
      console.warn(`⚠️ Could not connect to RPC URL for node ${nodeConfig.nodeId}:`, error);
    }
  }

  /**
   * Validate node configuration
   */
  private validateNodeConfig(nodeConfig: BlockchainNodeConfig): void {
    if (!nodeConfig.nodeId) {
      throw new Error('Node ID is required');
    }

    if (!nodeConfig.blockchain.rpcUrl) {
      throw new Error('RPC URL is required');
    }

    if (nodeConfig.resources.cpu <= 0) {
      throw new Error('CPU resources must be greater than 0');
    }

    if (nodeConfig.resources.memory <= 0) {
      throw new Error('Memory resources must be greater than 0');
    }
  }

  /**
   * Start monitoring all nodes
   */
  private startMonitoring(): void {
    console.log('📊 Starting node monitoring...');

    this.monitoringInterval = setInterval(async () => {
      await this.monitorAllNodes();
    }, 30000); // Monitor every 30 seconds
  }

  /**
   * Monitor all nodes
   */
  private async monitorAllNodes(): Promise<void> {
    const monitoringPromises = Array.from(this.nodes.keys()).map(nodeId =>
      this.monitorNode(nodeId)
    );

    await Promise.allSettled(monitoringPromises);
  }

  /**
   * Monitor a specific node
   */
  async monitorNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    const health = this.nodeHealth.get(nodeId);

    if (!node || !health) {
      console.warn(`⚠️ Node ${nodeId} not found for monitoring`);
      return;
    }

    try {
      console.log(`🔍 Monitoring node: ${nodeId}`);

      // Collect metrics
      const metrics = await this.collectNodeMetrics(nodeId, node);

      // Update health status
      const newHealth = this.updateNodeHealth(nodeId, health, metrics);
      this.nodeHealth.set(nodeId, newHealth);

      // Check for issues
      await this.checkNodeIssues(nodeId, newHealth);

      // Analyze performance
      await this.analyzeNodePerformance(nodeId, metrics);

      // Make scaling decisions
      await this.makeScalingDecision(nodeId, newHealth, metrics);

      this.emit('nodeMonitored', { nodeId, health: newHealth, metrics });
    } catch (error) {
      console.error(`❌ Failed to monitor node ${nodeId}:`, error);
      this.emit('monitoringError', { nodeId, error });
    }
  }

  /**
   * Collect node metrics
   */
  private async collectNodeMetrics(
    nodeId: string,
    node: BlockchainNodeConfig
  ): Promise<NodeMetrics> {
    const page = this.nodePages.get(nodeId);

    if (!page) {
      // Return mock metrics if page not available
      return {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        networkLatency: Math.random() * 100,
        responseTime: Math.random() * 1000,
        errorRate: Math.random() * 5,
        throughput: Math.random() * 1000,
        gasUsed: Math.floor(Math.random() * 100000),
        transactionsProcessed: Math.floor(Math.random() * 100),
        blocksMined: Math.floor(Math.random() * 10),
      };
    }

    try {
      // In production, this would collect real metrics from the blockchain node
      const metrics = await page.evaluate(() => {
        // Mock implementation - in production, this would query the actual blockchain node
        return {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          storage: Math.random() * 100,
          networkLatency: Math.random() * 100,
          responseTime: Math.random() * 1000,
          errorRate: Math.random() * 5,
          throughput: Math.random() * 1000,
          gasUsed: Math.floor(Math.random() * 100000),
          transactionsProcessed: Math.floor(Math.random() * 100),
          blocksMined: Math.floor(Math.random() * 10),
        };
      });

      return metrics;
    } catch (error) {
      console.warn(`⚠️ Failed to collect metrics for node ${nodeId}:`, error);
      return {
        cpu: 0,
        memory: 0,
        storage: 0,
        networkLatency: 0,
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        gasUsed: 0,
        transactionsProcessed: 0,
        blocksMined: 0,
      };
    }
  }

  /**
   * Update node health based on metrics
   */
  private updateNodeHealth(
    nodeId: string,
    currentHealth: NodeHealth,
    metrics: NodeMetrics
  ): NodeHealth {
    const newHealth = { ...currentHealth };
    newHealth.metrics = metrics;
    newHealth.lastCheck = new Date();

    // Determine health status based on metrics
    if (metrics.cpu > 90 || metrics.memory > 90 || metrics.errorRate > 10) {
      newHealth.status = 'unhealthy';
    } else if (metrics.cpu > 70 || metrics.memory > 70 || metrics.errorRate > 5) {
      newHealth.status = 'degraded';
    } else if (metrics.cpu === 0 && metrics.memory === 0) {
      newHealth.status = 'offline';
    } else {
      newHealth.status = 'healthy';
    }

    // Update uptime
    if (newHealth.status === 'healthy' || newHealth.status === 'degraded') {
      newHealth.uptime += 30; // Add 30 seconds
    }

    return newHealth;
  }

  /**
   * Check for node issues
   */
  private async checkNodeIssues(nodeId: string, health: NodeHealth): Promise<void> {
    const issues: NodeIssue[] = [];

    // Check CPU issues
    if (health.metrics.cpu > 90) {
      issues.push({
        id: `cpu-${Date.now()}`,
        type: 'performance',
        severity: 'high',
        description: `High CPU usage: ${health.metrics.cpu.toFixed(1)}%`,
        detectedAt: new Date(),
      });
    }

    // Check memory issues
    if (health.metrics.memory > 90) {
      issues.push({
        id: `memory-${Date.now()}`,
        type: 'resource',
        severity: 'high',
        description: `High memory usage: ${health.metrics.memory.toFixed(1)}%`,
        detectedAt: new Date(),
      });
    }

    // Check error rate issues
    if (health.metrics.errorRate > 10) {
      issues.push({
        id: `error-${Date.now()}`,
        type: 'performance',
        severity: 'critical',
        description: `High error rate: ${health.metrics.errorRate.toFixed(1)}%`,
        detectedAt: new Date(),
      });
    }

    // Check connectivity issues
    if (health.metrics.networkLatency > 1000) {
      issues.push({
        id: `latency-${Date.now()}`,
        type: 'connectivity',
        severity: 'medium',
        description: `High network latency: ${health.metrics.networkLatency.toFixed(0)}ms`,
        detectedAt: new Date(),
      });
    }

    // Update health with new issues
    health.issues = [...health.issues, ...issues];

    if (issues.length > 0) {
      this.emit('nodeIssues', { nodeId, issues });
    }
  }

  /**
   * Analyze node performance
   */
  private async analyzeNodePerformance(nodeId: string, metrics: NodeMetrics): Promise<void> {
    const performance: NodePerformance = {
      nodeId,
      efficiency: this.calculateEfficiency(metrics),
      utilization: (metrics.cpu + metrics.memory) / 2,
      throughput: metrics.throughput,
      latency: metrics.responseTime,
      errorRate: metrics.errorRate,
      costPerTransaction: this.calculateCostPerTransaction(metrics),
      roi: this.calculateROI(metrics),
    };

    // Store performance history
    const history = this.performanceHistory.get(nodeId) || [];
    history.push(performance);

    // Keep only last 100 performance records
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.performanceHistory.set(nodeId, history);

    this.emit('performanceAnalyzed', { nodeId, performance });
  }

  /**
   * Calculate node efficiency
   */
  private calculateEfficiency(metrics: NodeMetrics): number {
    const throughput = metrics.throughput;
    const resourceUsage = (metrics.cpu + metrics.memory) / 2;

    if (resourceUsage === 0) return 0;

    return Math.min(1, throughput / (resourceUsage * 10));
  }

  /**
   * Calculate cost per transaction
   */
  private calculateCostPerTransaction(metrics: NodeMetrics): number {
    if (metrics.transactionsProcessed === 0) return 0;

    const gasCost = metrics.gasUsed * 0.00000002; // Assuming 20 gwei gas price
    return gasCost / metrics.transactionsProcessed;
  }

  /**
   * Calculate ROI
   */
  private calculateROI(metrics: NodeMetrics): number {
    const revenue = metrics.transactionsProcessed * 0.01; // Assuming $0.01 per transaction
    const cost = metrics.gasUsed * 0.00000002;

    if (cost === 0) return 0;

    return ((revenue - cost) / cost) * 100;
  }

  /**
   * Make scaling decision for a node
   */
  private async makeScalingDecision(
    nodeId: string,
    health: NodeHealth,
    metrics: NodeMetrics
  ): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    let decision: ScalingDecision | null = null;

    // Check if scaling is needed
    if (health.status === 'unhealthy' && metrics.cpu > 90) {
      decision = {
        nodeId,
        action: 'scale_up',
        reason: 'High CPU usage causing unhealthy status',
        priority: 'high',
        estimatedImpact: 'Improved performance and stability',
        cost: 1000,
        timeline: '1-2 hours',
        resources: { cpu: node.resources.cpu * 1.5 },
      };
    } else if (health.status === 'healthy' && metrics.cpu < 30 && metrics.memory < 30) {
      decision = {
        nodeId,
        action: 'scale_down',
        reason: 'Low resource utilization',
        priority: 'low',
        estimatedImpact: 'Cost reduction with maintained performance',
        cost: -500,
        timeline: '2-4 hours',
        resources: { cpu: node.resources.cpu * 0.7 },
      };
    } else if (health.status === 'offline') {
      decision = {
        nodeId,
        action: 'replace',
        reason: 'Node is offline and unresponsive',
        priority: 'critical',
        estimatedImpact: 'Restore service availability',
        cost: 2000,
        timeline: '30 minutes',
      };
    }

    if (decision) {
      this.scalingDecisions.set(nodeId, decision);
      this.emit('scalingDecision', decision);
    }
  }

  /**
   * Get node health
   */
  getNodeHealth(nodeId: string): NodeHealth | undefined {
    return this.nodeHealth.get(nodeId);
  }

  /**
   * Get all node health
   */
  getAllNodeHealth(): NodeHealth[] {
    return Array.from(this.nodeHealth.values());
  }

  /**
   * Get scaling decisions
   */
  getScalingDecisions(): ScalingDecision[] {
    return Array.from(this.scalingDecisions.values());
  }

  /**
   * Get node performance history
   */
  getNodePerformanceHistory(nodeId: string): NodePerformance[] {
    return this.performanceHistory.get(nodeId) || [];
  }

  /**
   * Get all nodes
   */
  getAllNodes(): BlockchainNodeConfig[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Shutdown the node manager
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Blockchain Node Manager...');

    try {
      // Stop monitoring
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      // Close all node pages
      for (const [nodeId, page] of this.nodePages) {
        try {
          await page.close();
        } catch (error) {
          console.warn(`⚠️ Error closing page for node ${nodeId}:`, error);
        }
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
      }

      this.isInitialized = false;
      console.log('✅ Blockchain Node Manager shutdown complete');
      this.emit('shutdown');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

export default BlockchainNodeManager;
