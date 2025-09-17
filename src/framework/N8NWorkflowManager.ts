/**
 * N8N Workflow Manager
 * Manages n8n workflows for LightDom app automation
 */

import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { lightDomFramework } from './LightDomFramework';

export interface N8NConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface N8NWorkflow {
  id: string;
  name: string;
  nodes: N8NNode[];
  connections: N8NConnections;
  settings: N8NWorkflowSettings;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: any;
  credentials?: any;
  disabled?: boolean;
  notes?: string;
}

export interface N8NConnections {
  [nodeId: string]: {
    main: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

export interface N8NWorkflowSettings {
  executionOrder: 'v1';
  saveDataErrorExecution: 'all' | 'none';
  saveDataSuccessExecution: 'all' | 'none';
  saveManualExecutions: boolean;
  callersPolicy: 'workflowsFromSameOwner';
  errorWorkflow?: string;
}

export interface N8NExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting' | 'new';
  startedAt: string;
  stoppedAt?: string;
  finished?: boolean;
  mode: 'trigger' | 'manual';
  data?: any;
  error?: {
    message: string;
    stack: string;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'optimization' | 'monitoring' | 'deployment' | 'mining' | 'storage';
  tags: string[];
  template: N8NWorkflow;
  variables: WorkflowVariable[];
  requirements: string[];
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
  options?: any[];
}

export class N8NWorkflowManager extends EventEmitter {
  private api: AxiosInstance;
  private config: N8NConfig;
  private workflows: Map<string, N8NWorkflow> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();
  private executions: Map<string, N8NExecution> = new Map();
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: N8NConfig) {
    super();
    
    this.config = config;
    this.api = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
    this.setupEventHandlers();
  }

  /**
   * Initialize the N8N Workflow Manager
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing N8N Workflow Manager...');
    
    try {
      // Test N8N connection
      await this.testConnection();
      
      // Load workflow templates
      await this.loadWorkflowTemplates();
      
      // Load existing workflows
      await this.loadWorkflows();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isRunning = true;
      this.emit('initialized');
      
      console.log('✅ N8N Workflow Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize N8N Workflow Manager:', error);
      throw error;
    }
  }

  /**
   * Test N8N connection
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await this.api.get('/health');
      if (response.status !== 200) {
        throw new Error('N8N health check failed');
      }
      console.log('✅ N8N connection successful');
    } catch (error) {
      console.error('❌ N8N connection failed:', error);
      throw error;
    }
  }

  /**
   * Load workflow templates
   */
  private async loadWorkflowTemplates(): Promise<void> {
    try {
      const templatesPath = path.join(__dirname, 'n8n-workflows.json');
      const templatesData = await fs.readFile(templatesPath, 'utf8');
      const { workflows } = JSON.parse(templatesData);
      
      for (const workflow of workflows) {
        const template: WorkflowTemplate = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          category: this.categorizeWorkflow(workflow),
          tags: this.extractTags(workflow),
          template: workflow,
          variables: this.extractVariables(workflow),
          requirements: this.extractRequirements(workflow)
        };
        
        this.templates.set(template.id, template);
      }
      
      console.log(`✅ Loaded ${this.templates.size} workflow templates`);
    } catch (error) {
      console.error('❌ Failed to load workflow templates:', error);
    }
  }

  /**
   * Categorize workflow based on name and description
   */
  private categorizeWorkflow(workflow: any): WorkflowTemplate['category'] {
    const name = workflow.name.toLowerCase();
    const description = workflow.description.toLowerCase();
    
    if (name.includes('optimization') || description.includes('optimization')) {
      return 'optimization';
    } else if (name.includes('monitoring') || description.includes('monitoring')) {
      return 'monitoring';
    } else if (name.includes('deployment') || description.includes('deployment')) {
      return 'deployment';
    } else if (name.includes('mining') || description.includes('mining')) {
      return 'mining';
    } else if (name.includes('storage') || description.includes('storage')) {
      return 'storage';
    }
    
    return 'monitoring';
  }

  /**
   * Extract tags from workflow
   */
  private extractTags(workflow: any): string[] {
    const tags = ['lightdom'];
    
    if (workflow.name.toLowerCase().includes('auto')) {
      tags.push('automation');
    }
    if (workflow.name.toLowerCase().includes('monitor')) {
      tags.push('monitoring');
    }
    if (workflow.name.toLowerCase().includes('deploy')) {
      tags.push('deployment');
    }
    if (workflow.name.toLowerCase().includes('mining')) {
      tags.push('mining');
    }
    if (workflow.name.toLowerCase().includes('storage')) {
      tags.push('storage');
    }
    
    return tags;
  }

  /**
   * Extract variables from workflow
   */
  private extractVariables(workflow: any): WorkflowVariable[] {
    const variables: WorkflowVariable[] = [];
    
    // Extract variables from HTTP request nodes
    for (const node of workflow.nodes) {
      if (node.type === 'n8n-nodes-base.httpRequest') {
        if (node.parameters.url && node.parameters.url.includes('{{')) {
          const urlVar = node.parameters.url.match(/\{\{([^}]+)\}\}/g);
          if (urlVar) {
            variables.push({
              name: 'api_url',
              type: 'string',
              description: 'LightDom API URL',
              required: true,
              default: 'http://localhost:3000'
            });
          }
        }
      }
    }
    
    return variables;
  }

  /**
   * Extract requirements from workflow
   */
  private extractRequirements(workflow: any): string[] {
    const requirements: string[] = ['LightDom Framework API'];
    
    // Check for specific node types that require external services
    for (const node of workflow.nodes) {
      if (node.type === 'n8n-nodes-base.slack') {
        requirements.push('Slack API');
      }
      if (node.type === 'n8n-nodes-base.webhook') {
        requirements.push('Webhook endpoint');
      }
      if (node.type === 'n8n-nodes-base.cron') {
        requirements.push('Cron scheduler');
      }
    }
    
    return requirements;
  }

  /**
   * Load existing workflows from N8N
   */
  private async loadWorkflows(): Promise<void> {
    try {
      const response = await this.api.get('/workflows');
      const workflows = response.data.data || response.data;
      
      for (const workflow of workflows) {
        this.workflows.set(workflow.id, workflow);
      }
      
      console.log(`✅ Loaded ${this.workflows.size} existing workflows`);
    } catch (error) {
      console.error('❌ Failed to load workflows:', error);
    }
  }

  /**
   * Deploy a workflow template
   */
  async deployWorkflow(templateId: string, variables: Record<string, any> = {}): Promise<N8NWorkflow> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      // Apply variables to template
      const workflow = this.applyVariables(template.template, variables);
      
      // Deploy to N8N
      const response = await this.api.post('/workflows', workflow);
      const deployedWorkflow = response.data;
      
      this.workflows.set(deployedWorkflow.id, deployedWorkflow);
      this.emit('workflowDeployed', deployedWorkflow);
      
      console.log(`✅ Deployed workflow: ${deployedWorkflow.name}`);
      return deployedWorkflow;
    } catch (error) {
      console.error('❌ Failed to deploy workflow:', error);
      throw error;
    }
  }

  /**
   * Apply variables to workflow template
   */
  private applyVariables(template: N8NWorkflow, variables: Record<string, any>): N8NWorkflow {
    const workflow = JSON.parse(JSON.stringify(template));
    
    // Replace variables in node parameters
    for (const node of workflow.nodes) {
      if (node.parameters) {
        this.replaceVariablesInObject(node.parameters, variables);
      }
    }
    
    return workflow;
  }

  /**
   * Replace variables in object recursively
   */
  private replaceVariablesInObject(obj: any, variables: Record<string, any>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/\{\{([^}]+)\}\}/g, (match: string, varName: string) => {
          return variables[varName] || match;
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.replaceVariablesInObject(obj[key], variables);
      }
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, input?: any): Promise<N8NExecution> {
    try {
      const response = await this.api.post(`/workflows/${workflowId}/execute`, {
        data: input
      });
      
      const execution = response.data;
      this.executions.set(execution.id, execution);
      
      this.emit('workflowExecuted', execution);
      console.log(`🚀 Executed workflow: ${workflowId}`);
      
      return execution;
    } catch (error) {
      console.error('❌ Failed to execute workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<N8NExecution> {
    try {
      const response = await this.api.get(`/executions/${executionId}`);
      const execution = response.data;
      
      this.executions.set(execution.id, execution);
      return execution;
    } catch (error) {
      console.error('❌ Failed to get execution status:', error);
      throw error;
    }
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      await this.api.patch(`/workflows/${workflowId}`, { active: true });
      
      const workflow = this.workflows.get(workflowId);
      if (workflow) {
        workflow.active = true;
        this.workflows.set(workflowId, workflow);
      }
      
      this.emit('workflowActivated', workflowId);
      console.log(`✅ Activated workflow: ${workflowId}`);
    } catch (error) {
      console.error('❌ Failed to activate workflow:', error);
      throw error;
    }
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      await this.api.patch(`/workflows/${workflowId}`, { active: false });
      
      const workflow = this.workflows.get(workflowId);
      if (workflow) {
        workflow.active = false;
        this.workflows.set(workflowId, workflow);
      }
      
      this.emit('workflowDeactivated', workflowId);
      console.log(`✅ Deactivated workflow: ${workflowId}`);
    } catch (error) {
      console.error('❌ Failed to deactivate workflow:', error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.api.delete(`/workflows/${workflowId}`);
      
      this.workflows.delete(workflowId);
      this.emit('workflowDeleted', workflowId);
      
      console.log(`✅ Deleted workflow: ${workflowId}`);
    } catch (error) {
      console.error('❌ Failed to delete workflow:', error);
      throw error;
    }
  }

  /**
   * Deploy all LightDom workflows
   */
  async deployAllLightDomWorkflows(): Promise<N8NWorkflow[]> {
    console.log('🚀 Deploying all LightDom workflows...');
    
    const deployedWorkflows: N8NWorkflow[] = [];
    
    for (const template of this.templates.values()) {
      try {
        const workflow = await this.deployWorkflow(template.id, {
          api_url: 'http://localhost:3000',
          slack_webhook: process.env.SLACK_WEBHOOK_URL || '',
          git_webhook: process.env.GIT_WEBHOOK_URL || ''
        });
        
        deployedWorkflows.push(workflow);
        
        // Activate the workflow
        await this.activateWorkflow(workflow.id);
        
      } catch (error) {
        console.error(`❌ Failed to deploy workflow ${template.name}:`, error);
      }
    }
    
    console.log(`✅ Deployed ${deployedWorkflows.length} workflows`);
    return deployedWorkflows;
  }

  /**
   * Start monitoring workflow executions
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.monitorExecutions();
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Monitor workflow executions
   */
  private async monitorExecutions(): Promise<void> {
    try {
      const response = await this.api.get('/executions', {
        params: {
          limit: 50,
          status: 'running'
        }
      });
      
      const executions = response.data.data || response.data;
      
      for (const execution of executions) {
        if (!this.executions.has(execution.id)) {
          this.executions.set(execution.id, execution);
          this.emit('executionStarted', execution);
        }
        
        // Check if execution completed
        if (execution.finished && !this.executions.get(execution.id)?.finished) {
          this.executions.set(execution.id, execution);
          this.emit('executionCompleted', execution);
        }
      }
    } catch (error) {
      console.error('Failed to monitor executions:', error);
    }
  }

  /**
   * Setup interceptors
   */
  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[N8N] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[N8N] Request error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log(`[N8N] Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error('[N8N] Response error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('workflowDeployed', (workflow) => {
      console.log(`📋 Workflow deployed: ${workflow.name}`);
    });
    
    this.on('workflowActivated', (workflowId) => {
      console.log(`✅ Workflow activated: ${workflowId}`);
    });
    
    this.on('workflowDeactivated', (workflowId) => {
      console.log(`⏸️ Workflow deactivated: ${workflowId}`);
    });
    
    this.on('workflowExecuted', (execution) => {
      console.log(`🚀 Workflow executed: ${execution.id}`);
    });
    
    this.on('executionStarted', (execution) => {
      console.log(`▶️ Execution started: ${execution.id}`);
    });
    
    this.on('executionCompleted', (execution) => {
      console.log(`✅ Execution completed: ${execution.id} - ${execution.status}`);
    });
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): N8NWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): N8NWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow template by ID
   */
  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all workflow templates
   */
  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): N8NExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions
   */
  getAllExecutions(): N8NExecution[] {
    return Array.from(this.executions.values());
  }

  /**
   * Stop the N8N Workflow Manager
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping N8N Workflow Manager...');
    
    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.emit('stopped');
    console.log('✅ N8N Workflow Manager stopped');
  }

  /**
   * Get status
   */
  getStatus(): { running: boolean; workflows: number; templates: number; executions: number } {
    return {
      running: this.isRunning,
      workflows: this.workflows.size,
      templates: this.templates.size,
      executions: this.executions.size
    };
  }
}

// Export singleton instance
export const n8nWorkflowManager = new N8NWorkflowManager({
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678/api/v1',
  apiKey: process.env.N8N_API_KEY || 'demo-key',
  timeout: 30000,
  retryAttempts: 3
});
