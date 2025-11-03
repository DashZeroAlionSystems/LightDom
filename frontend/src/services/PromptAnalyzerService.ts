/**
 * Prompt Analyzer Service
 * Analyzes natural language prompts to generate workflow configurations
 */

import { WorkflowSchema, TaskReference } from './WorkflowWizardService';

export interface PromptAnalysis {
  intent: string;
  category: string;
  suggestedName: string;
  tasks: TaskReference[];
  keywords: string[];
  entities: {
    urls?: string[];
    models?: string[];
    databases?: string[];
    schedules?: string[];
  };
}

export class PromptAnalyzerService {
  private readonly taskPatterns = {
    webScraping: /scrape|extract|crawl|fetch|collect|mine|harvest/i,
    dataProcessing: /process|transform|clean|normalize|format|parse/i,
    mlTraining: /train|model|ml|neural|tensorflow|ai|learn/i,
    analysis: /analyze|evaluate|measure|assess|calculate|compute/i,
    storage: /store|save|persist|database|insert|update/i,
    notification: /notify|alert|email|send|message/i,
    scheduling: /schedule|cron|daily|hourly|weekly|recurring/i,
  };

  /**
   * Analyze a natural language prompt and generate workflow configuration
   */
  async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
    const keywords = this.extractKeywords(prompt);
    const entities = this.extractEntities(prompt);
    const category = this.determineCategory(keywords);
    const tasks = this.generateTasks(prompt, keywords, entities);

    return {
      intent: this.extractIntent(prompt),
      category,
      suggestedName: this.generateWorkflowName(prompt),
      tasks,
      keywords,
      entities,
    };
  }

  /**
   * Extract intent from prompt
   */
  private extractIntent(prompt: string): string {
    // Simple intent extraction - in production, use NLP/LLM
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('want to') || lowerPrompt.includes('need to')) {
      const match = prompt.match(/(?:want|need)\s+to\s+(.+?)(?:\.|$)/i);
      return match ? match[1].trim() : prompt;
    }

    return prompt.split('.')[0].trim();
  }

  /**
   * Extract keywords from prompt
   */
  private extractKeywords(prompt: string): string[] {
    const keywords: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const [category, pattern] of Object.entries(this.taskPatterns)) {
      if (pattern.test(lowerPrompt)) {
        keywords.push(category);
      }
    }

    return keywords;
  }

  /**
   * Extract entities like URLs, model names, etc.
   */
  private extractEntities(prompt: string): PromptAnalysis['entities'] {
    const entities: PromptAnalysis['entities'] = {};

    // Extract URLs
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const urls = prompt.match(urlPattern);
    if (urls) {
      entities.urls = urls;
    }

    // Extract model references
    const modelPattern = /\b(?:gpt|bert|llama|mistral|claude|tensorflow|pytorch|model)\b/gi;
    const models = prompt.match(modelPattern);
    if (models) {
      entities.models = Array.from(new Set(models.map(m => m.toLowerCase())));
    }

    // Extract database references
    const dbPattern = /\b(?:postgres|mysql|mongodb|database|table|collection)\b/gi;
    const databases = prompt.match(dbPattern);
    if (databases) {
      entities.databases = Array.from(new Set(databases.map(d => d.toLowerCase())));
    }

    // Extract schedule patterns
    const schedulePattern = /\b(?:daily|hourly|weekly|monthly|every\s+\d+\s+(?:minutes?|hours?|days?))\b/gi;
    const schedules = prompt.match(schedulePattern);
    if (schedules) {
      entities.schedules = schedules;
    }

    return entities;
  }

  /**
   * Determine workflow category based on keywords
   */
  private determineCategory(keywords: string[]): string {
    if (keywords.includes('webScraping')) return 'data-mining';
    if (keywords.includes('mlTraining')) return 'machine-learning';
    if (keywords.includes('analysis')) return 'analytics';
    if (keywords.includes('dataProcessing')) return 'data-processing';
    return 'automation';
  }

  /**
   * Generate workflow name from prompt
   */
  private generateWorkflowName(prompt: string): string {
    // Extract first meaningful phrase
    const firstSentence = prompt.split('.')[0];
    const words = firstSentence
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5);
    
    return words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') + ' Workflow';
  }

  /**
   * Generate tasks based on prompt analysis
   */
  private generateTasks(
    prompt: string,
    keywords: string[],
    entities: PromptAnalysis['entities']
  ): TaskReference[] {
    const tasks: TaskReference[] = [];
    let taskId = 1;

    // Web scraping tasks
    if (keywords.includes('webScraping') && entities.urls) {
      tasks.push({
        '@type': 'WebScrapingTask',
        name: 'Fetch Web Data',
        execution: {
          type: 'function',
          handler: 'webScraper',
          config: {
            urls: entities.urls,
            selectors: [],
          },
        },
        dependsOn: [],
      });
      taskId++;
    }

    // Data processing tasks
    if (keywords.includes('dataProcessing') || keywords.includes('webScraping')) {
      tasks.push({
        '@type': 'DataProcessingTask',
        name: 'Process and Clean Data',
        execution: {
          type: 'function',
          handler: 'dataProcessor',
          config: {
            transformations: ['clean', 'normalize'],
          },
        },
        dependsOn: tasks.length > 0 ? [`task-${taskId - 1}`] : [],
      });
      taskId++;
    }

    // ML training tasks
    if (keywords.includes('mlTraining')) {
      // Load data
      tasks.push({
        '@type': 'DataLoaderTask',
        name: 'Load Training Data',
        execution: {
          type: 'database',
          operation: 'select',
          table: 'training_data',
        },
        dependsOn: [],
      });
      const dataLoadTaskId = taskId++;

      // Preprocess
      tasks.push({
        '@type': 'DataPreprocessingTask',
        name: 'Preprocess Training Data',
        execution: {
          type: 'function',
          handler: 'preprocessor',
          config: {
            normalization: 'standard',
            split: 0.8,
          },
        },
        dependsOn: [`task-${dataLoadTaskId}`],
      });
      const preprocessTaskId = taskId++;

      // Train model
      tasks.push({
        '@type': 'MLTrainingTask',
        name: 'Train TensorFlow Model',
        execution: {
          type: 'ai',
          model: 'tensorflow',
          config: {
            epochs: 50,
            batchSize: 32,
            learningRate: 0.001,
          },
        },
        dependsOn: [`task-${preprocessTaskId}`],
      });
      const trainTaskId = taskId++;

      // Evaluate
      tasks.push({
        '@type': 'MLEvaluationTask',
        name: 'Evaluate Model',
        execution: {
          type: 'function',
          handler: 'modelEvaluator',
          config: {
            metrics: ['accuracy', 'loss', 'precision', 'recall'],
          },
        },
        dependsOn: [`task-${trainTaskId}`],
      });
      taskId++;
    }

    // Analysis tasks
    if (keywords.includes('analysis')) {
      tasks.push({
        '@type': 'AnalysisTask',
        name: 'Analyze Data',
        execution: {
          type: 'function',
          handler: 'dataAnalyzer',
          config: {
            metrics: ['mean', 'median', 'std'],
          },
        },
        dependsOn: tasks.length > 0 ? [`task-${taskId - 1}`] : [],
      });
      taskId++;

      tasks.push({
        '@type': 'ReportGenerationTask',
        name: 'Generate Report',
        execution: {
          type: 'function',
          handler: 'reportGenerator',
          config: {
            format: 'pdf',
            template: 'analysis',
          },
        },
        dependsOn: [`task-${taskId - 1}`],
      });
      taskId++;
    }

    // Storage tasks (if other tasks exist)
    if (tasks.length > 0 && (keywords.includes('storage') || keywords.includes('webScraping'))) {
      tasks.push({
        '@type': 'DatabaseStorageTask',
        name: 'Store Results',
        execution: {
          type: 'database',
          operation: 'insert',
          table: 'workflow_results',
          data: {
            results: '${context.results}',
            timestamp: '${Date.now()}',
          },
        },
        dependsOn: [`task-${taskId - 1}`],
      });
      taskId++;
    }

    // Notification tasks
    if (keywords.includes('notification')) {
      tasks.push({
        '@type': 'NotificationTask',
        name: 'Send Notification',
        execution: {
          type: 'api',
          method: 'POST',
          url: '${env.NOTIFICATION_SERVICE}/notify',
          body: {
            message: 'Workflow completed',
            status: '${context.status}',
          },
        },
        dependsOn: tasks.length > 0 ? [`task-${taskId - 1}`] : [],
      });
      taskId++;
    }

    // Default task if no specific tasks were generated
    if (tasks.length === 0) {
      tasks.push({
        '@type': 'GenericTask',
        name: 'Execute Workflow',
        execution: {
          type: 'function',
          handler: 'genericExecutor',
          config: {
            description: prompt,
          },
        },
        dependsOn: [],
      });
    }

    return tasks;
  }

  /**
   * Create a complete workflow schema from prompt analysis
   */
  async createWorkflowFromPrompt(prompt: string): Promise<Partial<WorkflowSchema>> {
    const analysis = await this.analyzePrompt(prompt);

    const trigger = analysis.entities.schedules
      ? { type: 'schedule' as const, config: { schedule: analysis.entities.schedules[0] } }
      : { type: 'manual' as const, config: {} };

    return {
      '@context': 'https://schema.lightdom.com/workflow/v1',
      '@type': 'Workflow',
      '@id': `lightdom:workflow:${Date.now()}`,
      name: analysis.suggestedName,
      description: prompt,
      version: '1.0.0',
      category: analysis.category,
      priority: 5,
      trigger,
      tasks: analysis.tasks,
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
        fallbackWorkflow: null,
      },
      monitoring: {
        enabled: true,
        logLevel: 'info',
        metrics: ['duration', 'success-rate', 'error-count'],
        alerts: {
          onFailure: {
            enabled: true,
            channels: ['slack'],
            threshold: 3,
          },
        },
      },
      permissions: {
        execute: ['user', 'admin'],
        view: ['*'],
        edit: ['admin'],
      },
      metadata: {
        author: 'workflow-wizard',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: analysis.keywords,
        documentation: '',
      },
    };
  }
}

// Singleton instance
export const promptAnalyzerService = new PromptAnalyzerService();
