/**
 * Automation Orchestrator
 * Coordinates between Cursor API and n8n for comprehensive app management
 */

import { EventEmitter } from 'events';
import { cursorAPIIntegration, CursorWorkflow, AutomationRule } from './CursorAPIIntegration';
import { n8nWorkflowManager, N8NWorkflow, WorkflowTemplate } from './N8NWorkflowManager';
import { lightDomFramework } from './LightDomFramework';

export interface AutomationConfig {
  enableCursorAPI: boolean;
  enableN8N: boolean;
  enableLightDomIntegration: boolean;
  monitoringInterval: number;
  alertThresholds: AlertThresholds;
  automationRules: AutomationRuleConfig[];
}

export interface AlertThresholds {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  errorRate: number;
  responseTime: number;
  storageUtilization: number;
  miningSuccessRate: number;
}

export interface AutomationRuleConfig {
  name: string;
  description: string;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConditionConfig {
  type: 'metric' | 'event' | 'schedule' | 'webhook';
  metric?: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'matches';
  value: any;
  threshold?: number;
}

export interface ActionConfig {
  type: 'cursor_workflow' | 'n8n_workflow' | 'lightdom_action' | 'notification' | 'webhook';
  workflowId?: string;
  action?: string;
  config: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AutomationEvent {
  id: string;
  type: 'metric_alert' | 'workflow_execution' | 'system_event' | 'user_action';
  source: 'cursor' | 'n8n' | 'lightdom' | 'system';
  timestamp: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolvedAt?: string;
}

export interface AutomationStats {
  totalEvents: number;
  activeWorkflows: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecution: string;
  uptime: number;
}

export class AutomationOrchestrator extends EventEmitter {
  private config: AutomationConfig;
  private events: Map<string, AutomationEvent> = new Map();
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  constructor(config?: Partial<AutomationConfig>) {
    super();
    
    this.config = {
      enableCursorAPI: true,
      enableN8N: true,
      enableLightDomIntegration: true,
      monitoringInterval: 30000,
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90,
        errorRate: 10,
        responseTime: 5000,
        storageUtilization: 80,
        miningSuccessRate: 70
      },
      automationRules: [],
      ...config
    };
    
    this.setupEventHandlers();
  }

  /**
   * Initialize the automation orchestrator
   */
  async initialize(): Promise<void> {
    console.log('🎭 Initializing Automation Orchestrator...');
    
    try {
      this.startTime = Date.now();
      
      // Initialize Cursor API integration
      if (this.config.enableCursorAPI) {
        await cursorAPIIntegration.initialize();
        console.log('✅ Cursor API integration initialized');
      }
      
      // Initialize N8N workflow manager
      if (this.config.enableN8N) {
        await n8nWorkflowManager.initialize();
        console.log('✅ N8N workflow manager initialized');
      }
      
      // Deploy default workflows
      await this.deployDefaultWorkflows();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isRunning = true;
      this.emit('initialized');
      
      console.log('✅ Automation Orchestrator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Automation Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Deploy default workflows
   */
  private async deployDefaultWorkflows(): Promise<void> {
    console.log('🚀 Deploying default automation workflows...');
    
    try {
      // Deploy Cursor API workflows
      if (this.config.enableCursorAPI) {
        await this.deployCursorWorkflows();
      }
      
      // Deploy N8N workflows
      if (this.config.enableN8N) {
        await n8nWorkflowManager.deployAllLightDomWorkflows();
      }
      
      console.log('✅ Default workflows deployed successfully');
    } catch (error) {
      console.error('❌ Failed to deploy default workflows:', error);
    }
  }

  /**
   * Deploy Cursor API workflows
   */
  private async deployCursorWorkflows(): Promise<void> {
    // Performance monitoring workflow
    await cursorAPIIntegration.createWorkflow({
      name: 'LightDom Performance Monitor',
      description: 'Monitors LightDom performance and triggers optimizations',
      trigger: {
        type: 'schedule',
        config: { interval: 300000 }, // 5 minutes
        enabled: true
      },
      status: 'active',
      actions: [
        {
          id: 'check_performance',
          type: 'code_execution',
          name: 'Check Performance Metrics',
          config: {
            language: 'javascript',
            code: `
              const status = lightDomFramework.getStatus();
              const performance = status.performance;
              
              if (performance.averageProcessingTime > 5000) {
                console.log('High processing time detected, triggering optimization');
                await lightDomFramework.optimizePerformance();
              }
              
              if (performance.errorRate > 10) {
                console.log('High error rate detected, triggering error handling');
                await lightDomFramework.handleHighErrorRate();
              }
            `
          },
          enabled: true,
          order: 1
        }
      ]
    });

    // Storage optimization workflow
    await cursorAPIIntegration.createWorkflow({
      name: 'LightDom Storage Optimizer',
      description: 'Automatically optimizes storage usage',
      trigger: {
        type: 'schedule',
        config: { interval: 600000 }, // 10 minutes
        enabled: true
      },
      status: 'active',
      actions: [
        {
          id: 'check_storage',
          type: 'code_execution',
          name: 'Check Storage Usage',
          config: {
            language: 'javascript',
            code: `
              const metrics = lightDomFramework.getStorageMetrics();
              
              if (metrics.utilizationRate > 80) {
                console.log('High storage utilization detected, triggering cleanup');
                const nodes = lightDomFramework.getStorageNodes();
                
                for (const node of nodes) {
                  if (node.used / node.capacity > 0.8) {
                    await lightDomFramework.optimizeStorageNode(node.id);
                  }
                }
              }
            `
          },
          enabled: true,
          order: 1
        }
      ]
    });

    // Mining automation workflow
    await cursorAPIIntegration.createWorkflow({
      name: 'LightDom Mining Automation',
      description: 'Automates web address mining process',
      trigger: {
        type: 'schedule',
        config: { interval: 1800000 }, // 30 minutes
        enabled: true
      },
      status: 'active',
      actions: [
        {
          id: 'check_mining_queue',
          type: 'code_execution',
          name: 'Check Mining Queue',
          config: {
            language: 'javascript',
            code: `
              const jobs = lightDomFramework.getAllMiningJobs();
              const pendingJobs = jobs.filter(job => job.status === 'pending');
              
              if (pendingJobs.length > 0) {
                console.log(\`Found \${pendingJobs.length} pending mining jobs\`);
                
                // Process jobs in batches
                const batchSize = 5;
                for (let i = 0; i < pendingJobs.length; i += batchSize) {
                  const batch = pendingJobs.slice(i, i + batchSize);
                  console.log(\`Processing batch of \${batch.length} jobs\`);
                  
                  // Process batch (simplified)
                  for (const job of batch) {
                    console.log(\`Processing job: \${job.url}\`);
                  }
                }
              }
            `
          },
          enabled: true,
          order: 1
        }
      ]
    });
  }

  /**
   * Create automation rule
   */
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'triggerCount' | 'createdAt'>): Promise<AutomationRule> {
    try {
      const automationRule = await cursorAPIIntegration.createAutomationRule(rule);
      
      this.emit('automationRuleCreated', automationRule);
      console.log(`✅ Created automation rule: ${automationRule.name}`);
      
      return automationRule;
    } catch (error) {
      console.error('❌ Failed to create automation rule:', error);
      throw error;
    }
  }

  /**
   * Execute automation rule
   */
  async executeAutomationRule(ruleId: string, context?: any): Promise<void> {
    const rule = cursorAPIIntegration.getAutomationRule(ruleId);
    if (!rule) {
      throw new Error(`Automation rule ${ruleId} not found`);
    }

    try {
      console.log(`🤖 Executing automation rule: ${rule.name}`);
      
      // Evaluate conditions
      const shouldExecute = await this.evaluateRuleConditions(rule, context);
      if (!shouldExecute) {
        console.log(`⏭️ Rule conditions not met: ${rule.name}`);
        return;
      }

      // Execute actions
      for (const action of rule.actions) {
        await this.executeAction(action, context);
      }

      rule.triggerCount++;
      this.emit('automationRuleExecuted', rule);
      console.log(`✅ Automation rule executed: ${rule.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to execute automation rule ${rule.name}:`, error);
      this.emit('automationRuleFailed', { rule, error });
    }
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateRuleConditions(rule: AutomationRule, context?: any): Promise<boolean> {
    for (const condition of rule.conditions) {
      const value = await this.getConditionValue(condition, context);
      const threshold = condition.threshold || condition.value;
      
      if (!this.evaluateCondition(condition.operator, value, threshold)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get condition value
   */
  private async getConditionValue(condition: any, context?: any): Promise<any> {
    switch (condition.type) {
      case 'metric':
        return await this.getMetricValue(condition.metric);
      case 'event':
        return context?.event || null;
      case 'schedule':
        return new Date().toISOString();
      case 'webhook':
        return context?.webhook || null;
      default:
        return null;
    }
  }

  /**
   * Get metric value
   */
  private async getMetricValue(metric: string): Promise<any> {
    switch (metric) {
      case 'cpu_usage':
        return this.getCPUUsage();
      case 'memory_usage':
        return this.getMemoryUsage();
      case 'disk_usage':
        return this.getDiskUsage();
      case 'error_rate':
        const status = lightDomFramework.getStatus();
        return status.performance.errorRate;
      case 'response_time':
        return status.performance.averageProcessingTime;
      case 'storage_utilization':
        const storageMetrics = lightDomFramework.getStorageMetrics();
        return storageMetrics.utilizationRate;
      case 'mining_success_rate':
        const miningStats = lightDomFramework.getMiningStats();
        return miningStats.successRate;
      default:
        return 0;
    }
  }

  /**
   * Get CPU usage
   */
  private getCPUUsage(): number {
    // Simplified CPU usage calculation
    return Math.random() * 100;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    // Simplified memory usage calculation
    return Math.random() * 100;
  }

  /**
   * Get disk usage
   */
  private getDiskUsage(): number {
    // Simplified disk usage calculation
    return Math.random() * 100;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(operator: string, value: any, threshold: any): boolean {
    switch (operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'contains':
        return String(value).includes(String(threshold));
      case 'matches':
        return new RegExp(threshold).test(String(value));
      default:
        return false;
    }
  }

  /**
   * Execute action
   */
  private async executeAction(action: any, context?: any): Promise<void> {
    switch (action.type) {
      case 'cursor_workflow':
        await this.executeCursorWorkflow(action.workflowId, context);
        break;
      case 'n8n_workflow':
        await this.executeN8NWorkflow(action.workflowId, context);
        break;
      case 'lightdom_action':
        await this.executeLightDomAction(action.action, action.config, context);
        break;
      case 'notification':
        await this.sendNotification(action.config, context);
        break;
      case 'webhook':
        await this.sendWebhook(action.config, context);
        break;
      default:
        console.log(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute Cursor workflow
   */
  private async executeCursorWorkflow(workflowId: string, context?: any): Promise<void> {
    try {
      await cursorAPIIntegration.executeWorkflow(workflowId, context);
    } catch (error) {
      console.error(`Failed to execute Cursor workflow ${workflowId}:`, error);
    }
  }

  /**
   * Execute N8N workflow
   */
  private async executeN8NWorkflow(workflowId: string, context?: any): Promise<void> {
    try {
      await n8nWorkflowManager.executeWorkflow(workflowId, context);
    } catch (error) {
      console.error(`Failed to execute N8N workflow ${workflowId}:`, error);
    }
  }

  /**
   * Execute LightDom action
   */
  private async executeLightDomAction(action: string, config: any, context?: any): Promise<void> {
    switch (action) {
      case 'optimize_performance':
        await lightDomFramework.optimizePerformance();
        break;
      case 'cleanup_storage':
        const nodes = lightDomFramework.getStorageNodes();
        for (const node of nodes) {
          await lightDomFramework.optimizeStorageNode(node.id);
        }
        break;
      case 'restart_services':
        await lightDomFramework.restart();
        break;
      case 'scale_resources':
        // Implement resource scaling
        break;
      default:
        console.log(`Unknown LightDom action: ${action}`);
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(config: any, context?: any): Promise<void> {
    console.log(`📢 Sending notification: ${config.message}`);
    // Implement notification logic
  }

  /**
   * Send webhook
   */
  private async sendWebhook(config: any, context?: any): Promise<void> {
    console.log(`🔗 Sending webhook to: ${config.url}`);
    // Implement webhook logic
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.monitorSystemHealth();
        await this.checkAutomationRules();
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, this.config.monitoringInterval);
  }

  /**
   * Monitor system health
   */
  private async monitorSystemHealth(): Promise<void> {
    try {
      const status = lightDomFramework.getStatus();
      const storageMetrics = lightDomFramework.getStorageMetrics();
      const miningStats = lightDomFramework.getMiningStats();
      
      // Check alert thresholds
      const alerts = [];
      
      if (status.performance.averageProcessingTime > this.config.alertThresholds.responseTime) {
        alerts.push({
          type: 'response_time',
          message: `High response time: ${status.performance.averageProcessingTime}ms`,
          severity: 'warning'
        });
      }
      
      if (status.performance.errorRate > this.config.alertThresholds.errorRate) {
        alerts.push({
          type: 'error_rate',
          message: `High error rate: ${status.performance.errorRate}%`,
          severity: 'error'
        });
      }
      
      if (storageMetrics.utilizationRate > this.config.alertThresholds.storageUtilization) {
        alerts.push({
          type: 'storage_utilization',
          message: `High storage utilization: ${storageMetrics.utilizationRate}%`,
          severity: 'warning'
        });
      }
      
      if (miningStats.successRate < this.config.alertThresholds.miningSuccessRate) {
        alerts.push({
          type: 'mining_success_rate',
          message: `Low mining success rate: ${miningStats.successRate}%`,
          severity: 'warning'
        });
      }
      
      // Process alerts
      for (const alert of alerts) {
        await this.processAlert(alert);
      }
      
    } catch (error) {
      console.error('Health monitoring error:', error);
    }
  }

  /**
   * Process alert
   */
  private async processAlert(alert: any): Promise<void> {
    const event: AutomationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'metric_alert',
      source: 'lightdom',
      timestamp: new Date().toISOString(),
      data: alert,
      severity: alert.severity,
      resolved: false
    };
    
    this.events.set(event.id, event);
    this.emit('alert', event);
    
    console.log(`🚨 Alert: ${alert.message}`);
  }

  /**
   * Check automation rules
   */
  private async checkAutomationRules(): Promise<void> {
    const rules = cursorAPIIntegration.getAllAutomationRules();
    
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      try {
        await this.executeAutomationRule(rule.id);
      } catch (error) {
        console.error(`Error checking automation rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('alert', (event) => {
      console.log(`🚨 Alert: ${event.data.message}`);
    });
    
    this.on('automationRuleCreated', (rule) => {
      console.log(`🤖 Automation rule created: ${rule.name}`);
    });
    
    this.on('automationRuleExecuted', (rule) => {
      console.log(`✅ Automation rule executed: ${rule.name}`);
    });
    
    this.on('automationRuleFailed', ({ rule, error }) => {
      console.error(`❌ Automation rule failed: ${rule.name} - ${error}`);
    });
  }

  /**
   * Get automation statistics
   */
  getAutomationStats(): AutomationStats {
    const events = Array.from(this.events.values());
    const executions = events.filter(e => e.type === 'workflow_execution');
    const successfulExecutions = executions.filter(e => e.data?.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.data?.status === 'failed').length;
    
    const averageExecutionTime = executions.length > 0 ? 
      executions.reduce((total, e) => total + (e.data?.duration || 0), 0) / executions.length : 0;
    
    const lastExecution = executions.length > 0 ? 
      Math.max(...executions.map(e => new Date(e.timestamp).getTime())) : 0;
    
    return {
      totalEvents: events.length,
      activeWorkflows: this.getActiveWorkflowCount(),
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      lastExecution: lastExecution > 0 ? new Date(lastExecution).toISOString() : '',
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Get active workflow count
   */
  private getActiveWorkflowCount(): number {
    let count = 0;
    
    if (this.config.enableCursorAPI) {
      count += cursorAPIIntegration.getAllWorkflows().filter(w => w.status === 'active').length;
    }
    
    if (this.config.enableN8N) {
      count += n8nWorkflowManager.getAllWorkflows().filter(w => w.active).length;
    }
    
    return count;
  }

  /**
   * Get all events
   */
  getAllEvents(): AutomationEvent[] {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AutomationEvent['type']): AutomationEvent[] {
    return this.getAllEvents().filter(e => e.type === type);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: AutomationEvent['severity']): AutomationEvent[] {
    return this.getAllEvents().filter(e => e.severity === severity);
  }

  /**
   * Stop the automation orchestrator
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Automation Orchestrator...');
    
    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.config.enableCursorAPI) {
      await cursorAPIIntegration.stop();
    }
    
    if (this.config.enableN8N) {
      await n8nWorkflowManager.stop();
    }
    
    this.emit('stopped');
    console.log('✅ Automation Orchestrator stopped');
  }

  /**
   * Get status
   */
  getStatus(): { running: boolean; config: AutomationConfig; stats: AutomationStats } {
    return {
      running: this.isRunning,
      config: this.config,
      stats: this.getAutomationStats()
    };
  }
}

// Export singleton instance
export const automationOrchestrator = new AutomationOrchestrator();
