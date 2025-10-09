import { EventEmitter } from 'events';
import { TaskManager } from './TaskManager';
import { HeadlessChromeService } from './HeadlessChromeService';
import { Logger } from '../../utils/Logger';
import axios from 'axios';

export interface CursorAPIFunction {
  name: string;
  description: string;
  parameters: any[];
  returnType: string;
  implementation: string;
}

export interface N8nWorkflowConfig {
  id: string;
  name: string;
  description: string;
  webhookUrl: string;
  status: 'active' | 'inactive' | 'error';
  lastExecuted?: Date;
  executionCount: number;
}

export interface IntegrationConfig {
  cursorAPI: {
    enabled: boolean;
    baseUrl: string;
    apiKey?: string;
  };
  n8n: {
    enabled: boolean;
    baseUrl: string;
    apiKey?: string;
    webhookSecret?: string;
  };
  headlessChrome: {
    enabled: boolean;
    maxConcurrency: number;
    defaultTimeout: number;
  };
}

export class CursorN8nIntegrationService extends EventEmitter {
  private taskManager: TaskManager;
  private headlessChromeService: HeadlessChromeService;
  private logger: Logger;
  private config: IntegrationConfig;
  private cursorFunctions: Map<string, CursorAPIFunction> = new Map();
  private n8nWorkflows: Map<string, N8nWorkflowConfig> = new Map();
  private isInitialized = false;

  constructor(
    taskManager: TaskManager,
    headlessChromeService: HeadlessChromeService,
    config: IntegrationConfig
  ) {
    super();
    this.taskManager = taskManager;
    this.headlessChromeService = headlessChromeService;
    this.config = config;
    this.logger = new Logger('CursorN8nIntegrationService');
    
    this.initializeCursorFunctions();
    this.setupTaskEventHandlers();
  }

  /**
   * Initialize the integration service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Cursor-N8n integration service...');

      // Initialize headless Chrome service if enabled
      if (this.config.headlessChrome.enabled) {
        await this.headlessChromeService.initialize();
        this.logger.info('Headless Chrome service initialized');
      }

      // Load n8n workflows if enabled
      if (this.config.n8n.enabled) {
        await this.loadN8nWorkflows();
        this.logger.info(`Loaded ${this.n8nWorkflows.size} n8n workflows`);
      }

      this.isInitialized = true;
      this.logger.info('Cursor-N8n integration service initialized successfully');
      this.emit('initialized');

    } catch (error) {
      this.logger.error('Failed to initialize integration service:', error);
      throw error;
    }
  }

  /**
   * Initialize built-in Cursor API functions
   */
  private initializeCursorFunctions(): void {
    const functions: CursorAPIFunction[] = [
      {
        name: 'analyzeDOM',
        description: 'Analyze DOM structure and performance metrics',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL to analyze' },
          { name: 'analysisType', type: 'string', required: false, description: 'Type of analysis (full, performance, structure, resources)' }
        ],
        returnType: 'object',
        implementation: `
          const analysis = {
            totalElements: document.querySelectorAll('*').length,
            images: document.querySelectorAll('img').length,
            scripts: document.querySelectorAll('script').length,
            links: document.querySelectorAll('a').length,
            forms: document.querySelectorAll('form').length,
            performance: {
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
              firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
            },
            imageAnalysis: {
              total: document.querySelectorAll('img').length,
              withoutAlt: document.querySelectorAll('img:not([alt])').length,
              oversized: Array.from(document.querySelectorAll('img')).filter(img => {
                const rect = img.getBoundingClientRect();
                return rect.width > 1920 || rect.height > 1080;
              }).length
            },
            scriptAnalysis: {
              total: document.querySelectorAll('script').length,
              inline: document.querySelectorAll('script:not([src])').length,
              external: document.querySelectorAll('script[src]').length
            }
          };
          return analysis;
        `
      },
      {
        name: 'extractText',
        description: 'Extract all text content from the page',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL to extract text from' }
        ],
        returnType: 'string',
        implementation: `
          return document.body.innerText;
        `
      },
      {
        name: 'getTitle',
        description: 'Get the page title',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL to get title from' }
        ],
        returnType: 'string',
        implementation: `
          return document.title;
        `
      },
      {
        name: 'getMetaTags',
        description: 'Extract all meta tags from the page',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL to extract meta tags from' }
        ],
        returnType: 'object',
        implementation: `
          const metas = {};
          document.querySelectorAll('meta').forEach(meta => {
            const name = meta.name || meta.property || meta.httpEquiv;
            if (name) {
              metas[name] = meta.content;
            }
          });
          return metas;
        `
      }
    ];

    // Register all functions
    functions.forEach(func => {
      this.cursorFunctions.set(func.name, func);
    });

    this.logger.info(`Initialized ${functions.length} Cursor API functions`);
  }

  /**
   * Load n8n workflows from configuration
   */
  private async loadN8nWorkflows(): Promise<void> {
    try {
      // In a real implementation, this would fetch from n8n's API
      // For now, we'll use the predefined workflows
      const workflows: N8nWorkflowConfig[] = [
        {
          id: 'dom-analysis-workflow',
          name: 'DOM Analysis Workflow',
          description: 'Comprehensive DOM analysis for optimization',
          webhookUrl: `${this.config.n8n.baseUrl}/webhook/dom-analysis`,
          status: 'active',
          executionCount: 0
        },
        {
          id: 'javascript-execution-workflow',
          name: 'JavaScript Execution Workflow',
          description: 'Execute custom JavaScript functions in headless Chrome',
          webhookUrl: `${this.config.n8n.baseUrl}/webhook/execute-js`,
          status: 'active',
          executionCount: 0
        }
      ];

      workflows.forEach(workflow => {
        this.n8nWorkflows.set(workflow.id, workflow);
      });

    } catch (error) {
      this.logger.error('Failed to load n8n workflows:', error);
    }
  }

  /**
   * Execute a Cursor API function
   */
  async executeCursorFunction(
    functionName: string,
    parameters: any = {},
    options: {
      url?: string;
      pageId?: string;
      timeout?: number;
    } = {}
  ): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Integration service not initialized');
    }

    const func = this.cursorFunctions.get(functionName);
    if (!func) {
      throw new Error(`Unknown Cursor API function: ${functionName}`);
    }

    this.logger.info(`Executing Cursor function: ${functionName}`);

    try {
      const taskId = this.taskManager.createJavaScriptTask(func.implementation, {
        args: Object.values(parameters),
        pageId: options.pageId,
        url: options.url,
        timeout: options.timeout || this.config.headlessChrome.defaultTimeout,
        priority: 8
      });

      // Wait for task completion
      const result = await this.waitForTaskCompletion(taskId);
      
      this.logger.info(`Cursor function ${functionName} executed successfully`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to execute Cursor function ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Execute an n8n workflow
   */
  async executeN8nWorkflow(
    workflowId: string,
    inputData: any = {},
    options: {
      timeout?: number;
    } = {}
  ): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Integration service not initialized');
    }

    const workflow = this.n8nWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Unknown n8n workflow: ${workflowId}`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    this.logger.info(`Executing n8n workflow: ${workflowId}`);

    try {
      // Trigger the n8n webhook
      const response = await axios.post(workflow.webhookUrl, inputData, {
        timeout: options.timeout || 60000,
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.n8n.webhookSecret && {
            'X-Webhook-Secret': this.config.n8n.webhookSecret
          })
        }
      });

      // Update workflow execution count
      workflow.executionCount++;
      workflow.lastExecuted = new Date();

      this.logger.info(`N8n workflow ${workflowId} executed successfully`);
      return response.data;

    } catch (error) {
      this.logger.error(`Failed to execute n8n workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Wait for a task to complete
   */
  private async waitForTaskCompletion(taskId: string, timeout: number = 30000): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkTask = () => {
        const task = this.taskManager.getTask(taskId);
        
        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        if (task.status === 'completed') {
          resolve(task.result);
          return;
        }

        if (task.status === 'failed') {
          reject(new Error(task.error || 'Task failed'));
          return;
        }

        if (task.status === 'cancelled') {
          reject(new Error('Task was cancelled'));
          return;
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
          reject(new Error('Task execution timeout'));
          return;
        }

        // Continue waiting
        setTimeout(checkTask, 1000);
      };

      checkTask();
    });
  }

  /**
   * Setup task event handlers
   */
  private setupTaskEventHandlers(): void {
    this.taskManager.on('taskCreated', (task) => {
      this.emit('taskCreated', task);
    });

    this.taskManager.on('taskStarted', (task) => {
      this.emit('taskStarted', task);
    });

    this.taskManager.on('taskCompleted', (task) => {
      this.emit('taskCompleted', task);
    });

    this.taskManager.on('taskFailed', (task) => {
      this.emit('taskFailed', task);
    });

    this.taskManager.on('taskCancelled', (task) => {
      this.emit('taskCancelled', task);
    });
  }

  /**
   * Get available Cursor API functions
   */
  getAvailableCursorFunctions(): CursorAPIFunction[] {
    return Array.from(this.cursorFunctions.values());
  }

  /**
   * Get available n8n workflows
   */
  getAvailableN8nWorkflows(): N8nWorkflowConfig[] {
    return Array.from(this.n8nWorkflows.values());
  }

  /**
   * Get integration status
   */
  getStatus(): any {
    return {
      initialized: this.isInitialized,
      cursorAPI: {
        enabled: this.config.cursorAPI.enabled,
        functionsAvailable: this.cursorFunctions.size
      },
      n8n: {
        enabled: this.config.n8n.enabled,
        workflowsAvailable: this.n8nWorkflows.size,
        activeWorkflows: Array.from(this.n8nWorkflows.values()).filter(w => w.status === 'active').length
      },
      headlessChrome: {
        enabled: this.config.headlessChrome.enabled,
        status: this.headlessChromeService.getStatus()
      },
      taskManager: {
        stats: this.taskManager.getStats()
      }
    };
  }

  /**
   * Shutdown the integration service
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Cursor-N8n integration service...');
    
    try {
      await this.taskManager.shutdown();
      await this.headlessChromeService.cleanup();
      
      this.isInitialized = false;
      this.logger.info('Cursor-N8n integration service shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}

export default CursorN8nIntegrationService;