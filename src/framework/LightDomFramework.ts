/**
 * LightDom Framework - Independent execution framework for DOM optimization
 * Runs independently from mined sites and provides continuous optimization services
 */

import { EventEmitter } from 'events';
import { spaceOptimizationEngine, OptimizationResult } from '../core/SpaceOptimizationEngine';
import { advancedNodeManager, NodeConfig, OptimizationTask } from '../core/AdvancedNodeManager';
import { storageNodeManager, StorageNode, MiningTarget } from './StorageNodeManager';
import { webAddressMiner, MiningJob, MiningResults } from './WebAddressMiner';
import { storageOptimizer, StorageOptimization, StorageMetrics } from './StorageOptimizer';
import { cursorAPIIntegration, CursorWorkflow, AutomationRule } from './CursorAPIIntegration';
import { n8nWorkflowManager, N8NWorkflow, WorkflowTemplate } from './N8NWorkflowManager';
import { automationOrchestrator, AutomationEvent, AutomationStats } from './AutomationOrchestrator';

export interface FrameworkConfig {
  name: string;
  version: string;
  port: number;
  enableSimulation: boolean;
  simulationInterval: number;
  maxConcurrentOptimizations: number;
  enableMetrics: boolean;
  enableWebhook: boolean;
  webhookUrl?: string;
}

export interface URLQueueItem {
  id: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  addedAt: number;
  processedAt?: number;
  optimizationResult?: OptimizationResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
  siteType: 'ecommerce' | 'blog' | 'corporate' | 'portfolio' | 'news' | 'social' | 'other';
  expectedOptimization: {
    type: string[];
    estimatedSavings: number;
    perks: string[];
  };
}

export interface OptimizationPerks {
  siteType: string;
  perks: {
    name: string;
    description: string;
    value: string;
    category: 'performance' | 'seo' | 'security' | 'analytics' | 'monitoring';
    tier: 'basic' | 'premium' | 'enterprise';
  }[];
}

export interface SimulationResult {
  timestamp: number;
  networkEfficiency: number;
  totalOptimizations: number;
  totalSpaceSaved: number;
  totalTokensDistributed: number;
  activeNodes: number;
  averageProcessingTime: number;
  recommendations: string[];
}

export class LightDomFramework extends EventEmitter {
  private config: FrameworkConfig;
  private urlQueue: Map<string, URLQueueItem> = new Map();
  private isRunning = false;
  private simulationInterval?: NodeJS.Timeout;
  private processingQueue: Set<string> = new Set();
  private metrics: Map<string, any> = new Map();
  private optimizationPerks: Map<string, OptimizationPerks> = new Map();

  constructor(config: Partial<FrameworkConfig> = {}) {
    super();
    this.config = {
      name: 'LightDom Framework',
      version: '1.0.0',
      port: 3000,
      enableSimulation: true,
      simulationInterval: 60000, // 1 minute
      maxConcurrentOptimizations: 10,
      enableMetrics: true,
      enableWebhook: false,
      ...config,
    };

    this.initializeOptimizationPerks();
    this.setupEventHandlers();
  }

  /**
   * Initialize the framework
   */
  async initialize(): Promise<void> {
    try {
      console.log(`🚀 Initializing ${this.config.name} v${this.config.version}`);

      // Initialize core components
      await this.initializeCoreComponents();

      // Start simulation if enabled
      if (this.config.enableSimulation) {
        this.startSimulation();
      }

      // Start processing queue
      this.startQueueProcessing();

      this.isRunning = true;
      this.emit('initialized', { config: this.config });

      console.log('✅ LightDom Framework initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize LightDom Framework:', error);
      throw error;
    }
  }

  /**
   * Add URL to optimization queue
   */
  async addURLToQueue(
    url: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    siteType: URLQueueItem['siteType'] = 'other'
  ): Promise<string> {
    const queueItem: URLQueueItem = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      priority,
      status: 'pending',
      addedAt: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      siteType,
      expectedOptimization: this.calculateExpectedOptimization(siteType),
    };

    this.urlQueue.set(queueItem.id, queueItem);

    this.emit('urlAdded', queueItem);
    console.log(`📝 Added URL to queue: ${url} (Priority: ${priority})`);

    return queueItem.id;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byPriority: Record<string, number>;
    bySiteType: Record<string, number>;
  } {
    const items = Array.from(this.urlQueue.values());

    return {
      total: items.length,
      pending: items.filter(item => item.status === 'pending').length,
      processing: items.filter(item => item.status === 'processing').length,
      completed: items.filter(item => item.status === 'completed').length,
      failed: items.filter(item => item.status === 'failed').length,
      byPriority: {
        high: items.filter(item => item.priority === 'high').length,
        medium: items.filter(item => item.priority === 'medium').length,
        low: items.filter(item => item.priority === 'low').length,
      },
      bySiteType: items.reduce(
        (acc, item) => {
          acc[item.siteType] = (acc[item.siteType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  /**
   * Get optimization perks for site type
   */
  getOptimizationPerks(siteType: string): OptimizationPerks | undefined {
    return this.optimizationPerks.get(siteType);
  }

  /**
   * Get all available perks
   */
  getAllOptimizationPerks(): OptimizationPerks[] {
    return Array.from(this.optimizationPerks.values());
  }

  /**
   * Run continuous simulation
   */
  async runSimulation(): Promise<SimulationResult> {
    const startTime = Date.now();

    try {
      // Get current network stats
      const systemStats = advancedNodeManager.getSystemStats();
      const optimizations = spaceOptimizationEngine.getOptimizations();
      const queueStatus = this.getQueueStatus();

      // Calculate network efficiency
      const networkEfficiency = this.calculateNetworkEfficiency(systemStats, optimizations);

      // Generate recommendations
      const recommendations = this.generateOptimizationRecommendations(systemStats, queueStatus);

      const result: SimulationResult = {
        timestamp: Date.now(),
        networkEfficiency,
        totalOptimizations: optimizations.length,
        totalSpaceSaved: spaceOptimizationEngine.getTotalSpaceHarvested(),
        totalTokensDistributed: spaceOptimizationEngine.getTotalTokensDistributed(),
        activeNodes: systemStats.activeNodes,
        averageProcessingTime: Date.now() - startTime,
        recommendations,
      };

      // Store metrics
      this.metrics.set('lastSimulation', result);

      this.emit('simulationCompleted', result);

      return result;
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      throw error;
    }
  }

  /**
   * Process optimization queue
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue.size >= this.config.maxConcurrentOptimizations) {
      return;
    }

    // Get next item to process
    const nextItem = this.getNextQueueItem();
    if (!nextItem) {
      return;
    }

    this.processingQueue.add(nextItem.id);
    nextItem.status = 'processing';

    try {
      // Process the optimization
      const result = await this.processOptimization(nextItem);

      nextItem.status = 'completed';
      nextItem.processedAt = Date.now();
      nextItem.optimizationResult = result;

      this.emit('optimizationCompleted', { item: nextItem, result });
      console.log(`✅ Optimized: ${nextItem.url} (Saved: ${result.spaceSavedKB}KB)`);
    } catch (error) {
      nextItem.status = 'failed';
      nextItem.error = error instanceof Error ? error.message : 'Unknown error';
      nextItem.retryCount++;

      // Retry if under max retries
      if (nextItem.retryCount < nextItem.maxRetries) {
        nextItem.status = 'pending';
        console.log(
          `🔄 Retrying optimization for: ${nextItem.url} (Attempt ${nextItem.retryCount + 1})`
        );
      } else {
        this.emit('optimizationFailed', { item: nextItem, error });
        console.log(`❌ Failed to optimize: ${nextItem.url}`);
      }
    } finally {
      this.processingQueue.delete(nextItem.id);
    }
  }

  /**
   * Process individual optimization
   */
  private async processOptimization(item: URLQueueItem): Promise<OptimizationResult> {
    // Simulate optimization processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Calculate space saved based on site type and expected optimization
    const baseSavings = this.calculateSpaceSavings(item.siteType, item.expectedOptimization);

    // Create optimization result
    const optimization: Partial<OptimizationResult> = {
      url: item.url,
      spaceSavedBytes: baseSavings,
      optimizationType: item.expectedOptimization.type.join(','),
      biomeType: item.siteType,
      harvesterAddress: '0x0000000000000000000000000000000000000000', // Framework address
    };

    return await spaceOptimizationEngine.processOptimization(optimization);
  }

  /**
   * Initialize core components
   */
  private async initializeCoreComponents(): Promise<void> {
    // Initialize space optimization engine
    console.log('🔧 Initializing Space Optimization Engine...');

    // Initialize advanced node manager
    console.log('🔧 Initializing Advanced Node Manager...');

    // Create initial optimization nodes
    const initialNodes = this.createInitialNodes();
    console.log(`🏗️ Created ${initialNodes.length} initial optimization nodes`);
  }

  /**
   * Create initial optimization nodes
   */
  private createInitialNodes(): NodeConfig[] {
    const nodes: NodeConfig[] = [];

    // Create AI consensus node
    const aiNode = advancedNodeManager.createNode('ai_consensus', 1000, 'digital', []);
    nodes.push(aiNode);

    // Create storage shards
    for (let i = 0; i < 3; i++) {
      const storageNode = advancedNodeManager.createNode('storage_shard', 500, 'digital', []);
      nodes.push(storageNode);
    }

    // Create optimization nodes
    for (let i = 0; i < 5; i++) {
      const optNode = advancedNodeManager.createNode('optimization', 100, 'digital', []);
      nodes.push(optNode);
    }

    return nodes;
  }

  /**
   * Initialize optimization perks
   */
  private initializeOptimizationPerks(): void {
    // E-commerce perks
    this.optimizationPerks.set('ecommerce', {
      siteType: 'ecommerce',
      perks: [
        {
          name: 'Product Image Optimization',
          description: 'Automatic compression and WebP conversion for product images',
          value: '30-50% size reduction',
          category: 'performance',
          tier: 'basic',
        },
        {
          name: 'Checkout Flow Optimization',
          description: 'Streamlined checkout process with reduced DOM complexity',
          value: '25% faster checkout',
          category: 'performance',
          tier: 'premium',
        },
        {
          name: 'SEO Enhancement',
          description: 'Automatic meta tag optimization and structured data',
          value: '15% SEO score improvement',
          category: 'seo',
          tier: 'basic',
        },
        {
          name: 'Security Headers',
          description: 'Automatic security header implementation',
          value: 'A+ security rating',
          category: 'security',
          tier: 'basic',
        },
      ],
    });

    // Blog perks
    this.optimizationPerks.set('blog', {
      siteType: 'blog',
      perks: [
        {
          name: 'Content Optimization',
          description: 'Automatic text compression and lazy loading',
          value: '40% faster load times',
          category: 'performance',
          tier: 'basic',
        },
        {
          name: 'Reading Experience',
          description: 'Optimized typography and spacing',
          value: 'Improved readability',
          category: 'performance',
          tier: 'premium',
        },
        {
          name: 'Social Media Integration',
          description: 'Optimized social sharing buttons and meta tags',
          value: '20% more shares',
          category: 'seo',
          tier: 'basic',
        },
      ],
    });

    // Corporate perks
    this.optimizationPerks.set('corporate', {
      siteType: 'corporate',
      perks: [
        {
          name: 'Professional Branding',
          description: 'Consistent branding and color optimization',
          value: 'Enhanced brand presence',
          category: 'performance',
          tier: 'enterprise',
        },
        {
          name: 'Analytics Integration',
          description: 'Advanced analytics and performance monitoring',
          value: 'Detailed insights',
          category: 'analytics',
          tier: 'enterprise',
        },
        {
          name: 'Security Compliance',
          description: 'GDPR compliance and security hardening',
          value: 'Full compliance',
          category: 'security',
          tier: 'enterprise',
        },
      ],
    });

    // Add more site types as needed...
  }

  /**
   * Calculate expected optimization for site type
   */
  private calculateExpectedOptimization(siteType: string): URLQueueItem['expectedOptimization'] {
    const perks = this.optimizationPerks.get(siteType);

    if (!perks) {
      return {
        type: ['general'],
        estimatedSavings: 50,
        perks: ['basic_optimization'],
      };
    }

    return {
      type: perks.perks.map(p => p.category),
      estimatedSavings:
        perks.perks.reduce((sum, p) => {
          const value = parseInt(p.value.match(/\d+/)?.[0] || '0');
          return sum + value;
        }, 0) / perks.perks.length,
      perks: perks.perks.map(p => p.name),
    };
  }

  /**
   * Calculate space savings based on site type
   */
  private calculateSpaceSavings(
    siteType: string,
    expected: URLQueueItem['expectedOptimization']
  ): number {
    const baseRates: Record<string, number> = {
      ecommerce: 150, // 150KB average
      blog: 80, // 80KB average
      corporate: 120, // 120KB average
      portfolio: 60, // 60KB average
      news: 100, // 100KB average
      social: 200, // 200KB average
      other: 50, // 50KB average
    };

    const baseSavings = baseRates[siteType] || 50;
    const multiplier = 1 + expected.estimatedSavings / 100;

    return Math.floor(baseSavings * multiplier * 1024); // Convert to bytes
  }

  /**
   * Get next item from queue
   */
  private getNextQueueItem(): URLQueueItem | undefined {
    const items = Array.from(this.urlQueue.values())
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        // Priority order: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Then by added time (FIFO)
        return a.addedAt - b.addedAt;
      });

    return items[0];
  }

  /**
   * Calculate network efficiency
   */
  private calculateNetworkEfficiency(
    systemStats: any,
    optimizations: OptimizationResult[]
  ): number {
    const utilization = systemStats.storageUtilization || 0;
    const uptime = systemStats.activeNodes > 0 ? 100 : 0;
    const throughput = optimizations.length / Math.max(1, systemStats.totalNodes);

    return Math.min(100, (utilization + uptime + throughput) / 3);
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(systemStats: any, queueStatus: any): string[] {
    const recommendations: string[] = [];

    if (systemStats.storageUtilization < 50) {
      recommendations.push(
        'Consider adding more optimization nodes to increase storage utilization'
      );
    }

    if (queueStatus.pending > 20) {
      recommendations.push('High queue backlog detected - consider scaling up processing capacity');
    }

    if (systemStats.activeNodes < 5) {
      recommendations.push('Low node count - consider creating more optimization nodes');
    }

    if (queueStatus.failed > queueStatus.completed * 0.1) {
      recommendations.push('High failure rate detected - check node health and retry failed items');
    }

    return recommendations;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('urlAdded', item => {
      console.log(`📝 URL added to queue: ${item.url}`);
    });

    this.on('optimizationCompleted', ({ item, result }) => {
      console.log(`✅ Optimization completed: ${item.url} (${result.spaceSavedKB}KB saved)`);
    });

    this.on('optimizationFailed', ({ item, error }) => {
      console.log(`❌ Optimization failed: ${item.url} - ${error}`);
    });

    this.on('simulationCompleted', result => {
      console.log(`🔄 Simulation completed - Efficiency: ${result.networkEfficiency.toFixed(2)}%`);
    });
  }

  /**
   * Start simulation
   */
  private startSimulation(): void {
    this.simulationInterval = setInterval(async () => {
      try {
        await this.runSimulation();
      } catch (error) {
        console.error('Simulation error:', error);
      }
    }, this.config.simulationInterval);

    console.log('🔄 Started continuous simulation');
  }

  /**
   * Start queue processing
   */
  private startQueueProcessing(): void {
    setInterval(async () => {
      try {
        await this.processQueue();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }, 1000); // Process every second

    console.log('⚡ Started queue processing');
  }

  /**
   * Get framework status
   */
  getStatus(): {
    running: boolean;
    config: FrameworkConfig;
    queueStatus: any;
    systemStats: any;
    metrics: any;
  } {
    return {
      running: this.isRunning,
      config: this.config,
      queueStatus: this.getQueueStatus(),
      systemStats: advancedNodeManager.getSystemStats(),
      metrics: Object.fromEntries(this.metrics),
    };
  }

  /**
   * Stop the framework
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.emit('stopped');
    console.log('🛑 LightDom Framework stopped');
  }

  // ==================== STORAGE NODE MANAGEMENT ====================

  /**
   * Create a new storage node for mining
   */
  async createStorageNode(config: {
    name: string;
    capacity: number;
    location: string;
    priority?: 'high' | 'medium' | 'low';
  }): Promise<StorageNode> {
    return await storageNodeManager.createMiningNode(config);
  }

  /**
   * Get all storage nodes
   */
  getStorageNodes(): StorageNode[] {
    return storageNodeManager.getAllNodes();
  }

  /**
   * Get active storage nodes
   */
  getActiveStorageNodes(): StorageNode[] {
    return storageNodeManager.getActiveNodes();
  }

  /**
   * Get storage node by ID
   */
  getStorageNode(nodeId: string): StorageNode | undefined {
    return storageNodeManager.getNode(nodeId);
  }

  /**
   * Get storage metrics
   */
  getStorageMetrics(): StorageMetrics {
    return storageOptimizer.getStorageMetrics();
  }

  // ==================== WEB ADDRESS MINING ====================

  /**
   * Add a web address to mining queue
   */
  async addMiningJob(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<string> {
    return await webAddressMiner.addMiningJob(url, priority);
  }

  /**
   * Add multiple web addresses to mining queue
   */
  async addMiningJobs(
    urls: Array<{ url: string; priority?: 'high' | 'medium' | 'low' }>
  ): Promise<string[]> {
    return await webAddressMiner.addMiningJobs(urls);
  }

  /**
   * Get mining job by ID
   */
  getMiningJob(jobId: string): MiningJob | undefined {
    return webAddressMiner.getJob(jobId);
  }

  /**
   * Get all mining jobs
   */
  getAllMiningJobs(): MiningJob[] {
    return webAddressMiner.getAllJobs();
  }

  /**
   * Get mining jobs by status
   */
  getMiningJobsByStatus(status: MiningJob['status']): MiningJob[] {
    return webAddressMiner.getJobsByStatus(status);
  }

  /**
   * Get mining statistics
   */
  getMiningStats() {
    return webAddressMiner.getMiningStats();
  }

  // ==================== STORAGE OPTIMIZATION ====================

  /**
   * Optimize storage for a specific node
   */
  async optimizeStorageNode(nodeId: string): Promise<StorageOptimization> {
    const node = storageNodeManager.getNode(nodeId);
    if (!node) {
      throw new Error(`Storage node ${nodeId} not found`);
    }
    return await storageOptimizer.optimizeNode(node);
  }

  /**
   * Get all storage optimizations
   */
  getAllStorageOptimizations(): StorageOptimization[] {
    return storageOptimizer.getAllOptimizations();
  }

  /**
   * Get storage optimizations by node
   */
  getStorageOptimizationsByNode(nodeId: string): StorageOptimization[] {
    return storageOptimizer.getOptimizationsByNode(nodeId);
  }

  /**
   * Get storage optimizations by status
   */
  getStorageOptimizationsByStatus(status: StorageOptimization['status']): StorageOptimization[] {
    return storageOptimizer.getOptimizationsByStatus(status);
  }

  /**
   * Update storage policy
   */
  updateStoragePolicy(
    policy: Partial<{
      maxStorageUsage: number;
      cleanupThreshold: number;
      compressionThreshold: number;
      archivalThreshold: number;
      retentionPeriod: number;
      enableCompression: boolean;
      enableDeduplication: boolean;
      enableArchival: boolean;
      compressionLevel: number;
    }>
  ): void {
    storageOptimizer.updatePolicy(policy);
  }

  /**
   * Get current storage policy
   */
  getStoragePolicy() {
    return storageOptimizer.getPolicy();
  }

  // ==================== INTEGRATED MINING WORKFLOW ====================

  /**
   * Start integrated mining workflow
   */
  async startMiningWorkflow(): Promise<void> {
    console.log('🚀 Starting integrated mining workflow...');

    try {
      // Initialize storage services
      await storageNodeManager.initialize();
      await webAddressMiner.initialize();
      await storageOptimizer.initialize();

      // Create default storage node if none exist
      const nodes = storageNodeManager.getAllNodes();
      if (nodes.length === 0) {
        await this.createStorageNode({
          name: 'Default Mining Node',
          capacity: 10000, // 10GB
          location: 'us-east-1',
          priority: 'high',
        });
      }

      this.emit('miningWorkflowStarted');
      console.log('✅ Integrated mining workflow started');
    } catch (error) {
      console.error('❌ Failed to start mining workflow:', error);
      throw error;
    }
  }

  /**
   * Stop integrated mining workflow
   */
  async stopMiningWorkflow(): Promise<void> {
    console.log('🛑 Stopping integrated mining workflow...');

    try {
      await webAddressMiner.stop();
      await storageOptimizer.stop();
      await storageNodeManager.stop();

      this.emit('miningWorkflowStopped');
      console.log('✅ Integrated mining workflow stopped');
    } catch (error) {
      console.error('❌ Failed to stop mining workflow:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive mining status
   */
  getMiningStatus(): {
    storageNodes: { total: number; active: number; capacity: number; used: number };
    miningJobs: { total: number; active: number; completed: number; failed: number };
    storageOptimizations: { total: number; active: number; completed: number };
    metrics: StorageMetrics;
  } {
    const storageMetrics = this.getStorageMetrics();
    const miningStats = this.getMiningStats();
    const storageNodes = this.getStorageNodes();
    const activeNodes = this.getActiveStorageNodes();

    return {
      storageNodes: {
        total: storageNodes.length,
        active: activeNodes.length,
        capacity: storageMetrics.totalCapacity,
        used: storageMetrics.totalUsed,
      },
      miningJobs: {
        total: miningStats.totalJobs,
        active: miningStats.totalJobs - miningStats.completedJobs - miningStats.failedJobs,
        completed: miningStats.completedJobs,
        failed: miningStats.failedJobs,
      },
      storageOptimizations: {
        total: storageMetrics.optimizationsCompleted,
        active: storageOptimizer.getStatus().activeOptimizations,
        completed: storageMetrics.optimizationsCompleted,
      },
      metrics: storageMetrics,
    };
  }

  // ==================== AUTOMATION & WORKFLOW MANAGEMENT ====================

  /**
   * Initialize automation orchestrator
   */
  async initializeAutomation(): Promise<void> {
    console.log('🎭 Initializing Automation Orchestrator...');

    try {
      await automationOrchestrator.initialize();
      this.emit('automationInitialized');
      console.log('✅ Automation Orchestrator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Automation Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Create Cursor API workflow
   */
  async createCursorWorkflow(
    workflow: Omit<CursorWorkflow, 'id' | 'executionCount' | 'successCount' | 'failureCount'>
  ): Promise<CursorWorkflow> {
    return await cursorAPIIntegration.createWorkflow(workflow);
  }

  /**
   * Execute Cursor API workflow
   */
  async executeCursorWorkflow(workflowId: string, input?: any): Promise<any> {
    return await cursorAPIIntegration.executeWorkflow(workflowId, input);
  }

  /**
   * Get all Cursor API workflows
   */
  getAllCursorWorkflows(): CursorWorkflow[] {
    return cursorAPIIntegration.getAllWorkflows();
  }

  /**
   * Create automation rule
   */
  async createAutomationRule(
    rule: Omit<AutomationRule, 'id' | 'triggerCount' | 'createdAt'>
  ): Promise<AutomationRule> {
    return await cursorAPIIntegration.createAutomationRule(rule);
  }

  /**
   * Get all automation rules
   */
  getAllAutomationRules(): AutomationRule[] {
    return cursorAPIIntegration.getAllAutomationRules();
  }

  /**
   * Deploy N8N workflow
   */
  async deployN8NWorkflow(
    templateId: string,
    variables?: Record<string, any>
  ): Promise<N8NWorkflow> {
    return await n8nWorkflowManager.deployWorkflow(templateId, variables);
  }

  /**
   * Execute N8N workflow
   */
  async executeN8NWorkflow(workflowId: string, input?: any): Promise<any> {
    return await n8nWorkflowManager.executeWorkflow(workflowId, input);
  }

  /**
   * Get all N8N workflows
   */
  getAllN8NWorkflows(): N8NWorkflow[] {
    return n8nWorkflowManager.getAllWorkflows();
  }

  /**
   * Get N8N workflow templates
   */
  getN8NTemplates(): WorkflowTemplate[] {
    return n8nWorkflowManager.getAllTemplates();
  }

  /**
   * Get automation events
   */
  getAutomationEvents(): AutomationEvent[] {
    return automationOrchestrator.getAllEvents();
  }

  /**
   * Get automation statistics
   */
  getAutomationStats(): AutomationStats {
    return automationOrchestrator.getAutomationStats();
  }

  /**
   * Get comprehensive automation status
   */
  getAutomationStatus(): {
    orchestrator: { running: boolean; config: any; stats: AutomationStats };
    cursorAPI: { running: boolean; workflows: number; rules: number; executions: number };
    n8n: { running: boolean; workflows: number; templates: number; executions: number };
    events: AutomationEvent[];
  } {
    return {
      orchestrator: automationOrchestrator.getStatus(),
      cursorAPI: cursorAPIIntegration.getStatus(),
      n8n: n8nWorkflowManager.getStatus(),
      events: automationOrchestrator.getAllEvents(),
    };
  }

  /**
   * Stop automation orchestrator
   */
  async stopAutomation(): Promise<void> {
    console.log('🛑 Stopping Automation Orchestrator...');
    await automationOrchestrator.stop();
    this.emit('automationStopped');
    console.log('✅ Automation Orchestrator stopped');
  }
}

// Export singleton instance
export const lightDomFramework = new LightDomFramework();
