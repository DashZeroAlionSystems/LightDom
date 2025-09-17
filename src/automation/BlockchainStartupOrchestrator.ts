/**
 * Blockchain Startup Orchestrator
 * Master controller for automated blockchain system startup and management
 * Coordinates all components for enterprise-scale blockchain operations
 */

import { EventEmitter } from 'events';
import { BlockchainAutomationManager } from './BlockchainAutomationManager';
import { ProjectManagementFramework } from './ProjectManagementFramework';
import { BlockchainNodeManager } from './BlockchainNodeManager';
import { DOMSpaceHarvesterAPI } from '../api/DOMSpaceHarvesterAPI';
import { WebCrawlerService } from '../services/WebCrawlerService';
import { HeadlessChromeService } from '../services/HeadlessChromeService';

export interface StartupConfig {
  blockchain: {
    network: string;
    rpcUrl: string;
    privateKey: string;
    gasPrice: string;
    gasLimit: number;
  };
  automation: {
    enabled: boolean;
    maxConcurrency: number;
    retryAttempts: number;
    timeout: number;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    metrics: boolean;
    alerts: boolean;
  };
  scaling: {
    enabled: boolean;
    autoScale: boolean;
    minNodes: number;
    maxNodes: number;
  };
  projects: {
    loadOnStartup: boolean;
    autoStart: boolean;
    maxConcurrent: number;
  };
  security: {
    enabled: boolean;
    encryption: boolean;
    authentication: boolean;
    rateLimiting: boolean;
  };
}

export interface StartupStatus {
  phase: 'initializing' | 'starting_services' | 'loading_configurations' | 'starting_monitoring' | 'ready' | 'error';
  progress: number;
  message: string;
  components: ComponentStatus[];
  errors: StartupError[];
  startTime: Date;
  readyTime?: Date;
}

export interface ComponentStatus {
  name: string;
  status: 'pending' | 'starting' | 'running' | 'error' | 'stopped';
  message: string;
  startTime?: Date;
  readyTime?: Date;
  error?: string;
}

export interface StartupError {
  component: string;
  error: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class BlockchainStartupOrchestrator extends EventEmitter {
  private config: StartupConfig;
  private status: StartupStatus;
  private automationManager: BlockchainAutomationManager | null = null;
  private projectFramework: ProjectManagementFramework | null = null;
  private nodeManager: BlockchainNodeManager | null = null;
  private apiService: DOMSpaceHarvesterAPI | null = null;
  private webCrawlerService: WebCrawlerService | null = null;
  private headlessChromeService: HeadlessChromeService | null = null;
  private isInitialized = false;
  private startupPromise: Promise<void> | null = null;

  constructor(config: StartupConfig) {
    super();
    this.config = config;
    this.status = {
      phase: 'initializing',
      progress: 0,
      message: 'Initializing blockchain startup orchestrator...',
      components: [],
      errors: [],
      startTime: new Date()
    };
  }

  /**
   * Start the complete blockchain system
   */
  async start(): Promise<void> {
    if (this.startupPromise) {
      console.log('⚠️ Startup already in progress');
      return this.startupPromise;
    }

    this.startupPromise = this.performStartup();
    return this.startupPromise;
  }

  /**
   * Perform the complete startup sequence
   */
  private async performStartup(): Promise<void> {
    try {
      console.log('🚀 Starting Blockchain Startup Orchestrator...');
      this.emit('startupStarted', this.status);

      // Phase 1: Initialize core services
      await this.initializeCoreServices();
      
      // Phase 2: Setup automation manager
      await this.setupAutomationManager();
      
      // Phase 3: Setup project management framework
      await this.setupProjectManagementFramework();
      
      // Phase 4: Setup node manager
      await this.setupNodeManager();
      
      // Phase 5: Setup API services
      await this.setupAPIServices();
      
      // Phase 6: Load configurations
      await this.loadConfigurations();
      
      // Phase 7: Start monitoring
      await this.startMonitoring();
      
      // Phase 8: Start automation workflows
      await this.startAutomationWorkflows();
      
      // Phase 9: Finalize startup
      await this.finalizeStartup();
      
      console.log('✅ Blockchain system startup completed successfully');
      this.emit('startupCompleted', this.status);
      
    } catch (error) {
      console.error('❌ Blockchain system startup failed:', error);
      this.addError('orchestrator', error.message, 'critical');
      this.status.phase = 'error';
      this.emit('startupFailed', { status: this.status, error });
      throw error;
    }
  }

  /**
   * Initialize core services
   */
  private async initializeCoreServices(): Promise<void> {
    this.updateStatus('starting_services', 10, 'Initializing core services...');
    
    try {
      // Initialize Web Crawler Service
      this.addComponent('web-crawler', 'starting', 'Initializing web crawler service...');
      this.webCrawlerService = new WebCrawlerService({
        maxConcurrency: this.config.automation.maxConcurrency,
        requestDelay: 1000,
        respectRobots: true
      });
      await this.webCrawlerService.initialize();
      this.updateComponent('web-crawler', 'running', 'Web crawler service initialized');
      
      // Initialize Headless Chrome Service
      this.addComponent('headless-chrome', 'starting', 'Initializing headless Chrome service...');
      this.headlessChromeService = new HeadlessChromeService({
        maxConcurrency: this.config.automation.maxConcurrency,
        timeout: this.config.automation.timeout
      });
      await this.headlessChromeService.initialize();
      this.updateComponent('headless-chrome', 'running', 'Headless Chrome service initialized');
      
      // Initialize API Service
      this.addComponent('api-service', 'starting', 'Initializing API service...');
      this.apiService = new DOMSpaceHarvesterAPI({
        port: process.env.API_PORT || 3000,
        blockchain: this.config.blockchain
      });
      await this.apiService.initialize();
      this.updateComponent('api-service', 'running', 'API service initialized');
      
      console.log('✅ Core services initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize core services:', error);
      this.addError('core-services', error instanceof Error ? error.message : 'Unknown error', 'critical');
      throw error;
    }
  }

  /**
   * Setup automation manager
   */
  private async setupAutomationManager(): Promise<void> {
    this.updateStatus('starting_services', 25, 'Setting up automation manager...');
    
    try {
      this.addComponent('automation-manager', 'starting', 'Initializing automation manager...');
      
      this.automationManager = new BlockchainAutomationManager({
        blockchain: this.config.blockchain,
        automation: this.config.automation,
        crawler: {
          maxConcurrency: this.config.automation.maxConcurrency,
          requestDelay: 1000
        },
        headless: {
          maxConcurrency: this.config.automation.maxConcurrency,
          timeout: this.config.automation.timeout
        },
        api: {
          port: process.env.API_PORT || 3000
        }
      });
      
      await this.automationManager.initialize();
      this.updateComponent('automation-manager', 'running', 'Automation manager initialized');
      
      console.log('✅ Automation manager setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup automation manager:', error);
      this.addError('automation-manager', error instanceof Error ? error.message : 'Unknown error', 'critical');
      throw error;
    }
  }

  /**
   * Setup project management framework
   */
  private async setupProjectManagementFramework(): Promise<void> {
    this.updateStatus('loading_configurations', 40, 'Setting up project management framework...');
    
    try {
      if (!this.automationManager) {
        throw new Error('Automation manager not initialized');
      }
      
      this.addComponent('project-framework', 'starting', 'Initializing project management framework...');
      
      this.projectFramework = new ProjectManagementFramework(this.automationManager);
      await this.projectFramework.initialize();
      this.updateComponent('project-framework', 'running', 'Project management framework initialized');
      
      console.log('✅ Project management framework setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup project management framework:', error);
      this.addError('project-framework', error instanceof Error ? error.message : 'Unknown error', 'high');
      throw error;
    }
  }

  /**
   * Setup node manager
   */
  private async setupNodeManager(): Promise<void> {
    this.updateStatus('loading_configurations', 55, 'Setting up node manager...');
    
    try {
      this.addComponent('node-manager', 'starting', 'Initializing node manager...');
      
      this.nodeManager = new BlockchainNodeManager();
      await this.nodeManager.initialize();
      this.updateComponent('node-manager', 'running', 'Node manager initialized');
      
      console.log('✅ Node manager setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup node manager:', error);
      this.addError('node-manager', error instanceof Error ? error.message : 'Unknown error', 'high');
      throw error;
    }
  }

  /**
   * Setup API services
   */
  private async setupAPIServices(): Promise<void> {
    this.updateStatus('loading_configurations', 70, 'Setting up API services...');
    
    try {
      // API service is already initialized in core services
      this.updateComponent('api-service', 'running', 'API services ready');
      
      console.log('✅ API services setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup API services:', error);
      this.addError('api-services', error instanceof Error ? error.message : 'Unknown error', 'medium');
      throw error;
    }
  }

  /**
   * Load configurations
   */
  private async loadConfigurations(): Promise<void> {
    this.updateStatus('loading_configurations', 80, 'Loading configurations...');
    
    try {
      // Load blockchain nodes
      if (this.automationManager && this.nodeManager) {
        const nodes = this.nodeManager.getAllNodes();
        for (const node of nodes) {
          await this.automationManager.addBlockchainNode(node);
        }
      }
      
      // Load projects if enabled
      if (this.config.projects.loadOnStartup && this.projectFramework) {
        // Projects are loaded automatically in the framework
        console.log('📋 Projects loaded from configuration');
      }
      
      console.log('✅ Configurations loaded');
      
    } catch (error) {
      console.error('❌ Failed to load configurations:', error);
      this.addError('configurations', error instanceof Error ? error.message : 'Unknown error', 'medium');
      throw error;
    }
  }

  /**
   * Start monitoring
   */
  private async startMonitoring(): Promise<void> {
    this.updateStatus('starting_monitoring', 90, 'Starting monitoring systems...');
    
    try {
      if (this.config.monitoring.enabled) {
        console.log('📊 Starting monitoring systems...');
        
        // Monitoring is started automatically in each component
        console.log('✅ Monitoring systems started');
      } else {
        console.log('⚠️ Monitoring disabled in configuration');
      }
      
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      this.addError('monitoring', error instanceof Error ? error.message : 'Unknown error', 'medium');
      throw error;
    }
  }

  /**
   * Start automation workflows
   */
  private async startAutomationWorkflows(): Promise<void> {
    this.updateStatus('starting_monitoring', 95, 'Starting automation workflows...');
    
    try {
      if (this.config.automation.enabled && this.automationManager) {
        console.log('🤖 Starting automation workflows...');
        
        // Start default workflows
        const workflows = [
          'dom-optimization-workflow',
          'monitoring-workflow'
        ];
        
        for (const workflowId of workflows) {
          try {
            await this.automationManager.executeWorkflow(workflowId);
            console.log(`✅ Started workflow: ${workflowId}`);
          } catch (error) {
            console.warn(`⚠️ Failed to start workflow ${workflowId}:`, error);
          }
        }
        
        console.log('✅ Automation workflows started');
      } else {
        console.log('⚠️ Automation disabled in configuration');
      }
      
    } catch (error) {
      console.error('❌ Failed to start automation workflows:', error);
      this.addError('automation-workflows', error instanceof Error ? error.message : 'Unknown error', 'medium');
      throw error;
    }
  }

  /**
   * Finalize startup
   */
  private async finalizeStartup(): Promise<void> {
    this.updateStatus('ready', 100, 'Blockchain system ready');
    this.status.readyTime = new Date();
    this.isInitialized = true;
    
    console.log('🎉 Blockchain system is now ready and operational!');
    console.log(`⏱️ Startup completed in ${this.getStartupDuration()}ms`);
    
    // Log system status
    this.logSystemStatus();
  }

  /**
   * Get startup duration
   */
  private getStartupDuration(): number {
    if (this.status.readyTime) {
      return this.status.readyTime.getTime() - this.status.startTime.getTime();
    }
    return Date.now() - this.status.startTime.getTime();
  }

  /**
   * Log system status
   */
  private logSystemStatus(): void {
    console.log('\n📊 System Status:');
    console.log('================');
    
    for (const component of this.status.components) {
      const status = component.status === 'running' ? '✅' : 
                   component.status === 'error' ? '❌' : 
                   component.status === 'starting' ? '🔄' : '⏸️';
      console.log(`${status} ${component.name}: ${component.message}`);
    }
    
    if (this.status.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      for (const error of this.status.errors) {
        console.log(`❌ ${error.component}: ${error.error}`);
      }
    }
    
    console.log('\n🚀 Blockchain system is ready for operations!');
  }

  /**
   * Update startup status
   */
  private updateStatus(phase: StartupStatus['phase'], progress: number, message: string): void {
    this.status.phase = phase;
    this.status.progress = progress;
    this.status.message = message;
    this.emit('statusUpdate', this.status);
  }

  /**
   * Add component status
   */
  private addComponent(name: string, status: ComponentStatus['status'], message: string): void {
    const component: ComponentStatus = {
      name,
      status,
      message,
      startTime: new Date()
    };
    
    this.status.components.push(component);
    this.emit('componentAdded', component);
  }

  /**
   * Update component status
   */
  private updateComponent(name: string, status: ComponentStatus['status'], message: string): void {
    const component = this.status.components.find(c => c.name === name);
    if (component) {
      component.status = status;
      component.message = message;
      if (status === 'running') {
        component.readyTime = new Date();
      }
      this.emit('componentUpdated', component);
    }
  }

  /**
   * Add startup error
   */
  private addError(component: string, error: string, severity: StartupError['severity']): void {
    const startupError: StartupError = {
      component,
      error,
      timestamp: new Date(),
      severity
    };
    
    this.status.errors.push(startupError);
    this.emit('error', startupError);
  }

  /**
   * Get current status
   */
  getStatus(): StartupStatus {
    return { ...this.status };
  }

  /**
   * Check if system is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.status.phase === 'ready';
  }

  /**
   * Get system health
   */
  getSystemHealth(): { healthy: boolean; components: ComponentStatus[]; errors: StartupError[] } {
    const healthy = this.status.components.every(c => c.status === 'running') && 
                   this.status.errors.filter(e => e.severity === 'critical').length === 0;
    
    return {
      healthy,
      components: [...this.status.components],
      errors: [...this.status.errors]
    };
  }

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down blockchain system...');
    
    try {
      const shutdownPromises = [];
      
      if (this.automationManager) {
        shutdownPromises.push(this.automationManager.shutdown());
      }
      
      if (this.projectFramework) {
        shutdownPromises.push(this.projectFramework.shutdown());
      }
      
      if (this.nodeManager) {
        shutdownPromises.push(this.nodeManager.shutdown());
      }
      
      // Note: These services don't have shutdown methods in the current implementation
      // if (this.webCrawlerService) {
      //   shutdownPromises.push(this.webCrawlerService.shutdown());
      // }
      
      // if (this.headlessChromeService) {
      //   shutdownPromises.push(this.headlessChromeService.shutdown());
      // }
      
      // if (this.apiService) {
      //   shutdownPromises.push(this.apiService.shutdown());
      // }
      
      await Promise.allSettled(shutdownPromises);
      
      this.isInitialized = false;
      console.log('✅ Blockchain system shutdown complete');
      this.emit('shutdown');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

export default BlockchainStartupOrchestrator;
