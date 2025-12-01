/**
 * Agent Orchestration Integration Service
 * 
 * Integrates all agent mode components:
 * - Health checks
 * - Error investigation
 * - Agent spawning
 * - GitHub automation
 * - Git MCP bridge
 * 
 * @module services/agent-orchestration-integration
 */

import { EventEmitter } from 'events';
import { BidirectionalHealthCheckService } from './bidirectional-health-check.service.js';
import { AgentModeInvestigationService } from './agent-mode-investigation.service.js';
import { DeepSeekAgentSpawner } from './deepseek-agent-spawner.service.js';
import { GitHubAutomationService } from './github-automation.service.js';
import { GitMcpOllamaBridge } from './git-mcp-ollama-bridge.service.js';

export class AgentOrchestrationIntegration extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      db: config.db,
      enableHealthChecks: config.enableHealthChecks !== false,
      enableGitHubAutomation: config.enableGitHubAutomation !== false,
      enableGitMcpBridge: config.enableGitMcpBridge !== false,
      continuousTaskCreation: config.continuousTaskCreation !== false,
      ...config,
    };
    
    if (!this.config.db) {
      throw new Error('Database connection required for AgentOrchestrationIntegration');
    }
    
    this.services = {};
    this.isInitialized = false;
  }
  
  /**
   * Initialize all services
   */
  async initialize() {
    console.log('🚀 Initializing Agent Orchestration Integration...');
    
    try {
      // Initialize health check service
      if (this.config.enableHealthChecks) {
        console.log('📊 Initializing health check service...');
        this.services.healthCheck = new BidirectionalHealthCheckService({
          enableBidirectionalStream: true,
        });
        await this.services.healthCheck.initialize();
      }
      
      // Wait for required services to be healthy
      if (this.config.enableHealthChecks) {
        await this.waitForRequiredServices();
      }
      
      // Initialize investigation service
      console.log('🔍 Initializing investigation service...');
      this.services.investigation = new AgentModeInvestigationService({
        db: this.config.db,
      });
      
      // Initialize agent spawner
      console.log('🤖 Initializing agent spawner...');
      this.services.agentSpawner = new DeepSeekAgentSpawner({
        db: this.config.db,
        maxConcurrentAgents: this.config.maxConcurrentAgents || 5,
      });
      
      // Initialize GitHub automation
      if (this.config.enableGitHubAutomation) {
        console.log('📝 Initializing GitHub automation...');
        this.services.github = new GitHubAutomationService({
          db: this.config.db,
        });
        
        // Start continuous task creation if enabled
        if (this.config.continuousTaskCreation) {
          await this.services.github.startContinuousTaskCreation();
        }
      }
      
      // Initialize Git MCP bridge
      if (this.config.enableGitMcpBridge) {
        console.log('🌉 Initializing Git MCP bridge...');
        this.services.gitMcpBridge = new GitMcpOllamaBridge({
          autoSync: this.config.autoGitSync !== false,
        });
        await this.services.gitMcpBridge.initialize();
      }
      
      // Set up event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      
      console.log('✅ Agent Orchestration Integration initialized successfully');
      this.emit('initialized');
      
      return this;
      
    } catch (error) {
      console.error('Failed to initialize Agent Orchestration Integration:', error);
      throw error;
    }
  }
  
  /**
   * Wait for required services to be healthy
   */
  async waitForRequiredServices() {
    console.log('⏳ Waiting for required services...');
    
    const requiredServices = ['postgres', 'redis'];
    
    for (const serviceId of requiredServices) {
      const isHealthy = await this.services.healthCheck.waitForServiceHealth(serviceId, {
        maxWaitTime: 60000,
      });
      
      if (!isHealthy) {
        throw new Error(`Required service ${serviceId} failed to become healthy`);
      }
    }
    
    console.log('✅ All required services are healthy');
  }
  
  /**
   * Set up event handlers between services
   */
  setupEventHandlers() {
    // When health check detects service failure, log it
    if (this.services.healthCheck) {
      this.services.healthCheck.on('health:update', (data) => {
        if (!data.status.healthy && data.status.required) {
          console.warn(`⚠️  Required service ${data.serviceId} is unhealthy`);
        }
      });
    }
    
    // When agent completes, check if we need to create GitHub issues/PRs
    if (this.services.agentSpawner && this.services.github) {
      this.services.agentSpawner.on('agent:completed', async (agent) => {
        if (agent.type === 'error_analysis' && agent.result) {
          try {
            // Create GitHub issue if confidence is high enough
            if (agent.result.confidence_score >= 0.7) {
              console.log('📝 Creating GitHub issue for analyzed error...');
              const errorReportId = agent.context.errorReport?.id;
              
              if (errorReportId) {
                await this.services.github.createIssueFromError(errorReportId);
              }
            }
          } catch (error) {
            console.error('Failed to create GitHub issue:', error);
          }
        }
      });
    }
    
    // When Git MCP bridge detects conflicts, spawn agent to help resolve
    if (this.services.gitMcpBridge && this.services.agentSpawner) {
      this.services.gitMcpBridge.on('sync:failed', async (data) => {
        if (data.error.includes('conflict')) {
          console.log('🔧 Queuing conflict resolution task...');
          
          await this.services.agentSpawner.queueTask({
            type: 'conflict_resolution',
            priority: 2, // High priority
            context: {
              error: data.error,
            },
          });
        }
      });
    }
  }
  
  /**
   * Handle error report with full workflow
   */
  async handleErrorReport(errorReportId) {
    console.log(`🔄 Handling error report ${errorReportId} with full workflow...`);
    
    try {
      // Step 1: Create investigation context
      const context = await this.services.investigation.createErrorInvestigationContext(errorReportId);
      
      // Step 2: Queue agent task for analysis
      const taskId = await this.services.agentSpawner.queueTask({
        type: 'error_analysis',
        priority: 3,
        context: {
          errorReport: context.error,
          codeContext: context,
        },
      });
      
      console.log(`✅ Queued analysis task ${taskId} for error ${errorReportId}`);
      
      return {
        errorReportId,
        taskId,
        context,
      };
      
    } catch (error) {
      console.error('Failed to handle error report:', error);
      throw error;
    }
  }
  
  /**
   * Handle feature request with full workflow
   */
  async handleFeatureRequest(featureDescription, components = []) {
    console.log('🔄 Handling feature request with full workflow...');
    
    try {
      // Step 1: Create investigation context
      const context = await this.services.investigation.createFeatureInvestigationContext(
        featureDescription,
        components
      );
      
      // Step 2: Queue agent task for code generation
      const taskId = await this.services.agentSpawner.queueTask({
        type: 'code_generation',
        priority: 5,
        context: {
          specification: featureDescription,
          context,
        },
      });
      
      // Step 3: Create GitHub issue
      if (this.services.github) {
        await this.services.github.createIssueFromTask(featureDescription, {
          labels: ['enhancement', 'ai-generated'],
          priority: 'normal',
        });
      }
      
      console.log(`✅ Queued code generation task ${taskId}`);
      
      return {
        taskId,
        context,
      };
      
    } catch (error) {
      console.error('Failed to handle feature request:', error);
      throw error;
    }
  }
  
  /**
   * Get orchestration status
   */
  getStatus() {
    const status = {
      initialized: this.isInitialized,
      services: {},
      timestamp: new Date().toISOString(),
    };
    
    // Health check status
    if (this.services.healthCheck) {
      status.services.healthCheck = this.services.healthCheck.getHealthStatus();
    }
    
    // Agent spawner status
    if (this.services.agentSpawner) {
      status.services.agentSpawner = {
        queueStatus: this.services.agentSpawner.getQueueStatus(),
        activeAgents: this.services.agentSpawner.getActiveAgents().length,
      };
    }
    
    // Git MCP bridge status
    if (this.services.gitMcpBridge) {
      status.services.gitMcpBridge = {
        lastSync: this.services.gitMcpBridge.lastSync,
        syncInProgress: this.services.gitMcpBridge.syncInProgress,
      };
    }
    
    return status;
  }
  
  /**
   * Get service instance
   */
  getService(serviceName) {
    return this.services[serviceName];
  }
  
  /**
   * Shutdown all services
   */
  async shutdown() {
    console.log('🛑 Shutting down Agent Orchestration Integration...');
    
    try {
      // Shutdown Git MCP bridge
      if (this.services.gitMcpBridge) {
        await this.services.gitMcpBridge.shutdown();
      }
      
      // Stop continuous task creation
      if (this.services.github) {
        this.services.github.stopContinuousTaskCreation();
      }
      
      // Shutdown health check
      if (this.services.healthCheck) {
        await this.services.healthCheck.shutdown();
      }
      
      console.log('✅ Agent Orchestration Integration shut down');
      this.emit('shutdown');
      
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
}

export default AgentOrchestrationIntegration;
