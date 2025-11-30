/**
 * Schema-Based Workflow Configuration System
 * Provides declarative workflow definitions with rule-based automation
 * and functional step chaining for complex automation workflows
 */

export interface WorkflowSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  metadata: WorkflowMetadata;
  config: WorkflowConfig;
  steps: WorkflowStep[];
  rules: WorkflowRule[];
  triggers: WorkflowTrigger[];
  outputs: WorkflowOutput[];
}

export interface WorkflowMetadata {
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  category: string;
  priority: number;
}

export interface WorkflowConfig {
  environment: 'development' | 'staging' | 'production';
  concurrency: number;
  timeout: number;
  retryPolicy: RetryPolicy;
  errorHandling: ErrorHandlingPolicy;
  logging: LoggingConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'exponential' | 'linear' | 'constant';
  initialDelay: number;
  maxDelay: number;
}

export interface ErrorHandlingPolicy {
  strategy: 'fail-fast' | 'continue' | 'rollback';
  notifications: string[];
  fallbackWorkflow?: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  destinations: string[];
  includeContext: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  config: StepConfig;
  inputs: StepInput[];
  outputs: StepOutput[];
  dependencies: string[];
  conditions: Condition[];
  timeout: number;
  retryable: boolean;
}

export type StepType =
  | 'data-fetch'
  | 'transform'
  | 'calculate'
  | 'ai-analyze'
  | 'blockchain-tx'
  | 'api-call'
  | 'condition'
  | 'loop'
  | 'parallel'
  | 'custom';

export interface StepConfig {
  handler: string;
  parameters: Record<string, any>;
  validation: ValidationRule[];
  caching?: CachingConfig;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'type' | 'range' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  key: string;
}

export interface StepInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  source: 'previous-step' | 'workflow-input' | 'context' | 'constant';
  sourceId?: string;
  required: boolean;
  default?: any;
  transform?: string;
}

export interface StepOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  path: string;
  persist: boolean;
}

export interface Condition {
  type: 'if' | 'unless' | 'switch';
  expression: string;
  actions: ConditionalAction[];
}

export interface ConditionalAction {
  type: 'skip' | 'goto' | 'fail' | 'retry';
  target?: string;
  message?: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  type: 'validation' | 'transformation' | 'decision' | 'alert';
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'matches';
  value: any;
  logicalOp?: 'and' | 'or';
}

export interface RuleAction {
  type: 'set-value' | 'call-function' | 'send-notification' | 'trigger-workflow' | 'log';
  config: Record<string, any>;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event' | 'condition';
  config: TriggerConfig;
  enabled: boolean;
}

export interface TriggerConfig {
  schedule?: string; // cron expression
  webhookUrl?: string;
  eventType?: string;
  conditionExpression?: string;
}

export interface WorkflowOutput {
  name: string;
  type: 'file' | 'database' | 'api' | 'notification' | 'blockchain';
  config: OutputConfig;
}

export interface OutputConfig {
  destination: string;
  format: 'json' | 'csv' | 'xml' | 'binary';
  transform?: string;
  credentials?: string;
}

/**
 * Workflow Schema Validator
 */
export class WorkflowSchemaValidator {
  /**
   * Validate workflow schema
   */
  validate(schema: WorkflowSchema): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!schema.id) errors.push('Workflow ID is required');
    if (!schema.name) errors.push('Workflow name is required');
    if (!schema.steps || schema.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate steps
    schema.steps.forEach((step, index) => {
      if (!step.id) errors.push(`Step ${index} is missing ID`);
      if (!step.type) errors.push(`Step ${step.id} is missing type`);

      // Validate dependencies
      step.dependencies.forEach(dep => {
        if (!schema.steps.find(s => s.id === dep)) {
          errors.push(`Step ${step.id} depends on non-existent step ${dep}`);
        }
      });

      // Check for circular dependencies
      if (this.hasCircularDependency(schema.steps, step.id)) {
        errors.push(`Circular dependency detected for step ${step.id}`);
      }
    });

    // Validate rules
    schema.rules.forEach(rule => {
      if (!rule.conditions || rule.conditions.length === 0) {
        warnings.push(`Rule ${rule.id} has no conditions`);
      }
      if (!rule.actions || rule.actions.length === 0) {
        warnings.push(`Rule ${rule.id} has no actions`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check for circular dependencies
   */
  private hasCircularDependency(
    steps: WorkflowStep[],
    stepId: string,
    visited: Set<string> = new Set()
  ): boolean {
    if (visited.has(stepId)) return true;

    visited.add(stepId);
    const step = steps.find(s => s.id === stepId);

    if (!step) return false;

    for (const dep of step.dependencies) {
      if (this.hasCircularDependency(steps, dep, new Set(visited))) {
        return true;
      }
    }

    return false;
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Example workflow schemas for common use cases
 */
export const ExampleWorkflows = {
  portfolioOptimization: {
    id: 'portfolio-optimization-v1',
    name: 'Portfolio Optimization Workflow',
    description: 'Automated portfolio optimization using AI and blockchain data',
    version: '1.0.0',
    metadata: {
      author: 'LightDom AI',
      created: new Date(),
      updated: new Date(),
      tags: ['portfolio', 'optimization', 'ai'],
      category: 'finance',
      priority: 1,
    },
    config: {
      environment: 'production' as const,
      concurrency: 5,
      timeout: 300000,
      retryPolicy: {
        maxAttempts: 3,
        backoffStrategy: 'exponential' as const,
        initialDelay: 1000,
        maxDelay: 10000,
      },
      errorHandling: {
        strategy: 'rollback' as const,
        notifications: ['admin@lightdom.com'],
      },
      logging: {
        level: 'info' as const,
        destinations: ['console', 'file'],
        includeContext: true,
      },
    },
    steps: [
      {
        id: 'fetch-market-data',
        name: 'Fetch Market Data',
        type: 'data-fetch' as StepType,
        config: {
          handler: 'marketDataFetcher',
          parameters: {
            sources: ['coingecko', 'binance'],
            symbols: ['BTC', 'ETH', 'SOL'],
          },
          validation: [],
        },
        inputs: [],
        outputs: [
          {
            name: 'marketData',
            type: 'object',
            path: '$.data',
            persist: true,
          },
        ],
        dependencies: [],
        conditions: [],
        timeout: 30000,
        retryable: true,
      },
      {
        id: 'analyze-with-ai',
        name: 'AI Portfolio Analysis',
        type: 'ai-analyze' as StepType,
        config: {
          handler: 'deepseekAnalyzer',
          parameters: {
            model: 'deepseek-reasoner',
            analysisType: 'portfolio_optimization',
          },
          validation: [],
        },
        inputs: [
          {
            name: 'marketData',
            type: 'object',
            source: 'previous-step',
            sourceId: 'fetch-market-data',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'recommendations',
            type: 'array',
            path: '$.recommendations',
            persist: true,
          },
        ],
        dependencies: ['fetch-market-data'],
        conditions: [],
        timeout: 60000,
        retryable: true,
      },
      {
        id: 'execute-rebalance',
        name: 'Execute Portfolio Rebalance',
        type: 'blockchain-tx' as StepType,
        config: {
          handler: 'blockchainExecutor',
          parameters: {
            network: 'ethereum',
            gasStrategy: 'medium',
          },
          validation: [],
        },
        inputs: [
          {
            name: 'recommendations',
            type: 'array',
            source: 'previous-step',
            sourceId: 'analyze-with-ai',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'transactions',
            type: 'array',
            path: '$.txHashes',
            persist: true,
          },
        ],
        dependencies: ['analyze-with-ai'],
        conditions: [
          {
            type: 'if',
            expression: 'recommendations.length > 0',
            actions: [],
          },
        ],
        timeout: 120000,
        retryable: false,
      },
    ],
    rules: [
      {
        id: 'risk-threshold',
        name: 'Risk Threshold Check',
        description: 'Prevent high-risk trades',
        type: 'validation',
        conditions: [
          {
            field: 'recommendation.risks.level',
            operator: 'gt',
            value: 'medium',
          },
        ],
        actions: [
          {
            type: 'send-notification',
            config: {
              channel: 'email',
              recipients: ['risk@lightdom.com'],
              message: 'High-risk recommendation detected',
            },
          },
        ],
        priority: 1,
        enabled: true,
      },
    ],
    triggers: [
      {
        type: 'schedule',
        config: {
          schedule: '0 */4 * * *', // Every 4 hours
        },
        enabled: true,
      },
    ],
    outputs: [
      {
        name: 'optimization-report',
        type: 'file',
        config: {
          destination: './reports/optimization',
          format: 'json',
        },
      },
    ],
  } as WorkflowSchema,

  realtimeMarketMonitor: {
    id: 'realtime-market-monitor-v1',
    name: 'Real-time Market Monitoring',
    description: 'Continuous market monitoring with AI-powered alerts',
    version: '1.0.0',
    metadata: {
      author: 'LightDom AI',
      created: new Date(),
      updated: new Date(),
      tags: ['monitoring', 'realtime', 'alerts'],
      category: 'market-analysis',
      priority: 2,
    },
    config: {
      environment: 'production' as const,
      concurrency: 10,
      timeout: 60000,
      retryPolicy: {
        maxAttempts: 5,
        backoffStrategy: 'constant' as const,
        initialDelay: 5000,
        maxDelay: 5000,
      },
      errorHandling: {
        strategy: 'continue' as const,
        notifications: [],
      },
      logging: {
        level: 'info' as const,
        destinations: ['console'],
        includeContext: false,
      },
    },
    steps: [
      {
        id: 'stream-market-data',
        name: 'Stream Market Data',
        type: 'data-fetch' as StepType,
        config: {
          handler: 'marketDataStreamer',
          parameters: {
            mode: 'websocket',
            frequency: 1000,
          },
          validation: [],
        },
        inputs: [],
        outputs: [
          {
            name: 'priceUpdate',
            type: 'object',
            path: '$.prices',
            persist: false,
          },
        ],
        dependencies: [],
        conditions: [],
        timeout: 5000,
        retryable: true,
      },
      {
        id: 'ai-sentiment-analysis',
        name: 'AI Sentiment Analysis',
        type: 'ai-analyze' as StepType,
        config: {
          handler: 'deepseekSentiment',
          parameters: {
            model: 'deepseek-reasoner',
            realtime: true,
          },
          validation: [],
        },
        inputs: [
          {
            name: 'priceUpdate',
            type: 'object',
            source: 'previous-step',
            sourceId: 'stream-market-data',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'sentiment',
            type: 'object',
            path: '$.sentiment',
            persist: false,
          },
        ],
        dependencies: ['stream-market-data'],
        conditions: [],
        timeout: 10000,
        retryable: true,
      },
    ],
    rules: [
      {
        id: 'price-alert',
        name: 'Significant Price Movement Alert',
        description: 'Alert on significant price changes',
        type: 'alert',
        conditions: [
          {
            field: 'priceUpdate.change',
            operator: 'gt',
            value: 5,
          },
        ],
        actions: [
          {
            type: 'send-notification',
            config: {
              channel: 'push',
              message: 'Significant price movement detected',
            },
          },
        ],
        priority: 1,
        enabled: true,
      },
    ],
    triggers: [
      {
        type: 'manual',
        config: {},
        enabled: true,
      },
    ],
    outputs: [
      {
        name: 'alerts-log',
        type: 'database',
        config: {
          destination: 'postgresql://localhost/lightdom',
          format: 'json',
        },
      },
    ],
  } as WorkflowSchema,
};

export default WorkflowSchema;
