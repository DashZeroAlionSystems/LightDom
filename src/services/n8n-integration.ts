/**
 * N8N Workflow Integration Service
 * Integrates LightDom workflows with N8N for visual workflow editing and execution
 */

import axios from 'axios';
import { WorkflowDefinition, WorkflowTask } from './workflow-orchestrator.js';

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface N8NConnection {
  node: string;
  type: 'main' | 'ai';
  index: number;
}

export interface N8NWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: N8NNode[];
  connections: Record<string, Record<string, N8NConnection[][]>>;
  settings?: {
    executionOrder?: 'v1';
    saveDataErrorExecution?: 'all' | 'none';
    saveDataSuccessExecution?: 'all' | 'none';
    saveManualExecutions?: boolean;
  };
}

export interface N8NConfig {
  apiUrl: string;
  apiKey?: string;
  webhookUrl: string;
}

/**
 * N8N Integration Service
 */
export class N8NIntegrationService {
  private config: N8NConfig;
  private nodeTypeMapping: Map<string, string>;

  constructor(config: N8NConfig) {
    this.config = config;
    this.nodeTypeMapping = this.initializeNodeTypeMapping();
  }

  /**
   * Initialize node type mapping from LightDom services to N8N nodes
   */
  private initializeNodeTypeMapping(): Map<string, string> {
    return new Map([
      ['crawler', 'n8n-nodes-base.httpRequest'],
      ['seo-analyzer', 'n8n-nodes-base.function'],
      ['data-processor', 'n8n-nodes-base.set'],
      ['ml-engine', 'n8n-nodes-base.code'],
      ['schema-generator', 'n8n-nodes-base.code'],
    ]);
  }

  /**
   * Convert LightDom workflow to N8N workflow
   */
  convertToN8N(workflow: WorkflowDefinition): N8NWorkflow {
    const nodes: N8NNode[] = [];
    const connections: Record<string, Record<string, N8NConnection[][]>> = {};

    // Add trigger node
    nodes.push({
      id: 'trigger',
      name: 'Workflow Trigger',
      type: 'n8n-nodes-base.webhook',
      position: [250, 300],
      parameters: {
        path: `lightdom/${workflow.id}`,
        httpMethod: 'POST',
        responseMode: 'onReceived',
      },
    });

    // Convert tasks to N8N nodes
    let positionY = 300;
    for (const task of workflow.tasks) {
      const node = this.convertTaskToNode(task, positionY);
      nodes.push(node);
      positionY += 150;

      // Create connections
      if (task.dependencies.length === 0) {
        // Connect to trigger
        if (!connections['trigger']) {
          connections['trigger'] = {};
        }
        if (!connections['trigger']['main']) {
          connections['trigger']['main'] = [[]];
        }
        connections['trigger']['main'][0].push({
          node: node.id,
          type: 'main',
          index: 0,
        });
      } else {
        // Connect to dependencies
        for (const depId of task.dependencies) {
          if (!connections[depId]) {
            connections[depId] = {};
          }
          if (!connections[depId]['main']) {
            connections[depId]['main'] = [[]];
          }
          connections[depId]['main'][0].push({
            node: node.id,
            type: 'main',
            index: 0,
          });
        }
      }
    }

    return {
      name: workflow.name,
      active: workflow.schedule?.enabled || false,
      nodes,
      connections,
      settings: {
        executionOrder: 'v1',
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all',
        saveManualExecutions: true,
      },
    };
  }

  /**
   * Convert LightDom task to N8N node
   */
  private convertTaskToNode(task: WorkflowTask, positionY: number): N8NNode {
    const nodeType = this.nodeTypeMapping.get(task.service) || 'n8n-nodes-base.function';

    const node: N8NNode = {
      id: task.id,
      name: task.name,
      type: nodeType,
      position: [500, positionY],
      parameters: this.convertTaskParameters(task, nodeType),
    };

    return node;
  }

  /**
   * Convert task parameters to N8N node parameters
   */
  private convertTaskParameters(task: WorkflowTask, nodeType: string): Record<string, any> {
    switch (nodeType) {
      case 'n8n-nodes-base.httpRequest':
        return this.convertToHttpRequest(task);
      case 'n8n-nodes-base.function':
        return this.convertToFunction(task);
      case 'n8n-nodes-base.code':
        return this.convertToCode(task);
      default:
        return { ...task.input };
    }
  }

  /**
   * Convert to HTTP Request node
   */
  private convertToHttpRequest(task: WorkflowTask): Record<string, any> {
    return {
      url: task.input.url || 'http://localhost:3001/api/execute',
      method: 'POST',
      jsonParameters: true,
      options: {
        timeout: task.timeout || 60000,
      },
      bodyParametersJson: JSON.stringify({
        service: task.service,
        action: task.action,
        input: task.input,
      }),
    };
  }

  /**
   * Convert to Function node
   */
  private convertToFunction(task: WorkflowTask): Record<string, any> {
    const functionCode = `
// Task: ${task.name}
// Service: ${task.service}
// Action: ${task.action}

const input = ${JSON.stringify(task.input, null, 2)};

// Execute task logic here
const result = {
  taskId: '${task.id}',
  status: 'completed',
  output: input,
  timestamp: new Date().toISOString()
};

return [result];
    `.trim();

    return {
      functionCode,
    };
  }

  /**
   * Convert to Code node
   */
  private convertToCode(task: WorkflowTask): Record<string, any> {
    const jsCode = `
// Task: ${task.name}
const taskInput = ${JSON.stringify(task.input, null, 2)};

// Process task
const result = {
  taskId: '${task.id}',
  service: '${task.service}',
  action: '${task.action}',
  output: taskInput,
  status: 'completed'
};

return result;
    `.trim();

    return {
      mode: 'runOnceForAllItems',
      jsCode,
    };
  }

  /**
   * Create N8N workflow via API
   */
  async createWorkflow(n8nWorkflow: N8NWorkflow): Promise<{ id: string; url: string }> {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/workflows`,
        n8nWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        url: `${this.config.apiUrl.replace('/api/v1', '')}/workflow/${response.data.id}`,
      };
    } catch (error) {
      console.error('Failed to create N8N workflow:', error);
      throw new Error('Failed to create N8N workflow');
    }
  }

  /**
   * Update existing N8N workflow
   */
  async updateWorkflow(workflowId: string, n8nWorkflow: N8NWorkflow): Promise<void> {
    try {
      await axios.patch(
        `${this.config.apiUrl}/workflows/${workflowId}`,
        n8nWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to update N8N workflow:', error);
      throw new Error('Failed to update N8N workflow');
    }
  }

  /**
   * Execute N8N workflow
   */
  async executeWorkflow(workflowId: string, input: Record<string, any>): Promise<any> {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/workflows/${workflowId}/execute`,
        { data: input },
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to execute N8N workflow:', error);
      throw new Error('Failed to execute N8N workflow');
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.config.apiUrl}/executions/${executionId}`,
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey || '',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw new Error('Failed to get execution status');
    }
  }

  /**
   * List all N8N workflows
   */
  async listWorkflows(): Promise<N8NWorkflow[]> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.config.apiKey || '',
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Failed to list workflows:', error);
      throw new Error('Failed to list workflows');
    }
  }

  /**
   * Delete N8N workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await axios.delete(`${this.config.apiUrl}/workflows/${workflowId}`, {
        headers: {
          'X-N8N-API-KEY': this.config.apiKey || '',
        },
      });
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw new Error('Failed to delete workflow');
    }
  }

  /**
   * Activate/Deactivate workflow
   */
  async setWorkflowActive(workflowId: string, active: boolean): Promise<void> {
    try {
      await axios.patch(
        `${this.config.apiUrl}/workflows/${workflowId}`,
        { active },
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to set workflow active status:', error);
      throw new Error('Failed to set workflow active status');
    }
  }

  /**
   * Create workflow structure blocks for visual editor
   */
  createWorkflowBlocks(): Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
    inputs: string[];
    outputs: string[];
  }> {
    return [
      {
        id: 'crawler-block',
        name: 'Web Crawler',
        category: 'data-collection',
        icon: 'spider',
        inputs: ['url', 'config'],
        outputs: ['pages', 'links', 'errors'],
      },
      {
        id: 'seo-analyzer-block',
        name: 'SEO Analyzer',
        category: 'analysis',
        icon: 'search',
        inputs: ['pageData'],
        outputs: ['metrics', 'recommendations'],
      },
      {
        id: 'schema-generator-block',
        name: 'Schema Generator',
        category: 'generation',
        icon: 'code',
        inputs: ['description', 'context'],
        outputs: ['schema', 'validation'],
      },
      {
        id: 'data-processor-block',
        name: 'Data Processor',
        category: 'transformation',
        icon: 'filter',
        inputs: ['rawData', 'rules'],
        outputs: ['processedData'],
      },
      {
        id: 'ml-training-block',
        name: 'ML Training',
        category: 'machine-learning',
        icon: 'brain',
        inputs: ['trainingData', 'config'],
        outputs: ['model', 'metrics'],
      },
      {
        id: 'deepseek-block',
        name: 'DeepSeek AI',
        category: 'ai',
        icon: 'robot',
        inputs: ['prompt', 'context'],
        outputs: ['response', 'reasoning'],
      },
      {
        id: 'campaign-monitor-block',
        name: 'Campaign Monitor',
        category: 'monitoring',
        icon: 'chart',
        inputs: ['campaignId', 'metrics'],
        outputs: ['status', 'alerts'],
      },
    ];
  }
}

export default N8NIntegrationService;
