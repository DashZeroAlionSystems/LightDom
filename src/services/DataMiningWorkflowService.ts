/**
 * DataMiningWorkflowService
 * 
 * Service for creating and managing datamining workflows from natural language prompts.
 * Integrates with WorkflowWizardService and schema generation.
 */

import { z } from 'zod';

// Workflow stage enum
export enum WorkflowStage {
  INITIALIZING = 'initializing',
  PROMPT_ANALYSIS = 'prompt_analysis',
  SCHEMA_GENERATION = 'schema_generation',
  WORKFLOW_CREATION = 'workflow_creation',
  DATAMINING_SETUP = 'datamining_setup',
  EXECUTING = 'executing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// DataMining task schema
const DataMiningTaskSchema = z.object({
  '@type': z.literal('DataMiningTask'),
  '@id': z.string(),
  name: z.string(),
  description: z.string(),
  source: z.object({
    type: z.enum(['web', 'api', 'database', 'file']),
    url: z.string().optional(),
    query: z.string().optional(),
    selectors: z.array(z.string()).optional(),
    headers: z.record(z.string()).optional()
  }),
  extraction: z.object({
    fields: z.array(z.object({
      name: z.string(),
      selector: z.string().optional(),
      type: z.enum(['string', 'number', 'boolean', 'date', 'array', 'object']),
      transform: z.string().optional()
    })),
    pagination: z.object({
      enabled: z.boolean(),
      selector: z.string().optional(),
      maxPages: z.number().optional()
    }).optional()
  }),
  storage: z.object({
    type: z.enum(['database', 'file', 'cache']),
    table: z.string().optional(),
    path: z.string().optional(),
    format: z.enum(['json', 'csv', 'jsonl']).optional()
  })
});

// DataMining workflow schema
const DataMiningWorkflowSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('DataMiningWorkflow'),
  '@id': z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  stage: z.nativeEnum(WorkflowStage),
  tasks: z.array(DataMiningTaskSchema),
  schedule: z.object({
    enabled: z.boolean(),
    cron: z.string().optional(),
    interval: z.number().optional()
  }).optional(),
  monitoring: z.object({
    enabled: z.boolean(),
    metrics: z.array(z.string())
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type DataMiningTask = z.infer<typeof DataMiningTaskSchema>;
export type DataMiningWorkflow = z.infer<typeof DataMiningWorkflowSchema>;

interface PromptAnalysis {
  intent: string;
  sources: string[];
  dataFields: string[];
  outputFormat: string;
  frequency: string | null;
}

export class DataMiningWorkflowService {
  private apiEndpoint: string;
  
  constructor(apiEndpoint: string = '/api') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Create a datamining workflow from a natural language prompt
   */
  async createFromPrompt(prompt: string): Promise<DataMiningWorkflow> {
    // Stage 1: Initializing
    const workflowId = `lightdom:datamining:${Date.now()}`;
    let currentStage = WorkflowStage.INITIALIZING;

    // Stage 2: Analyze the prompt
    currentStage = WorkflowStage.PROMPT_ANALYSIS;
    const analysis = await this.analyzePrompt(prompt);

    // Stage 3: Generate schema from analysis
    currentStage = WorkflowStage.SCHEMA_GENERATION;
    const schema = await this.generateSchemaFromAnalysis(analysis);

    // Stage 4: Create workflow structure
    currentStage = WorkflowStage.WORKFLOW_CREATION;
    const tasks = await this.createDataMiningTasks(analysis, schema);

    // Stage 5: Setup datamining configuration
    currentStage = WorkflowStage.DATAMINING_SETUP;
    const workflow: DataMiningWorkflow = {
      '@context': 'https://schema.org',
      '@type': 'DataMiningWorkflow',
      '@id': workflowId,
      name: this.generateWorkflowName(analysis),
      description: `Datamining workflow generated from: "${prompt}"`,
      prompt,
      stage: currentStage,
      tasks,
      monitoring: {
        enabled: true,
        metrics: ['duration', 'records-extracted', 'success-rate', 'errors']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    await this.saveWorkflow(workflow);

    return workflow;
  }

  /**
   * Analyze natural language prompt to extract datamining requirements
   */
  private async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
    // Use AI to analyze the prompt (can integrate with OpenAI, Claude, or local LLM)
    const analysis: PromptAnalysis = {
      intent: '',
      sources: [],
      dataFields: [],
      outputFormat: 'json',
      frequency: null
    };

    // Pattern matching for common datamining scenarios
    const promptLower = prompt.toLowerCase();

    // Detect intent
    if (promptLower.includes('scrape') || promptLower.includes('extract')) {
      analysis.intent = 'web_scraping';
    } else if (promptLower.includes('api') || promptLower.includes('fetch')) {
      analysis.intent = 'api_extraction';
    } else if (promptLower.includes('database') || promptLower.includes('query')) {
      analysis.intent = 'database_mining';
    } else {
      analysis.intent = 'general_extraction';
    }

    // Detect sources (URLs, domains, API endpoints)
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = prompt.match(urlRegex) || [];
    analysis.sources = urls;

    // Detect data fields (words after "get", "extract", "collect")
    const fieldKeywords = ['get', 'extract', 'collect', 'gather', 'mine'];
    for (const keyword of fieldKeywords) {
      const regex = new RegExp(`${keyword}\\s+([\\w\\s,]+?)(?:from|\\.|$)`, 'gi');
      const matches = prompt.match(regex);
      if (matches) {
        matches.forEach(match => {
          const fields = match
            .replace(new RegExp(keyword, 'i'), '')
            .replace(/from|\.$/gi, '')
            .trim()
            .split(/,|\s+and\s+/)
            .map(f => f.trim())
            .filter(f => f.length > 0);
          analysis.dataFields.push(...fields);
        });
      }
    }

    // Detect output format
    if (promptLower.includes('csv')) {
      analysis.outputFormat = 'csv';
    } else if (promptLower.includes('json')) {
      analysis.outputFormat = 'json';
    }

    // Detect frequency
    if (promptLower.includes('hourly')) {
      analysis.frequency = '0 * * * *';
    } else if (promptLower.includes('daily')) {
      analysis.frequency = '0 0 * * *';
    } else if (promptLower.includes('weekly')) {
      analysis.frequency = '0 0 * * 0';
    }

    return analysis;
  }

  /**
   * Generate data schema from prompt analysis
   */
  private async generateSchemaFromAnalysis(analysis: PromptAnalysis): Promise<any> {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'DataSchema',
      '@id': `lightdom:schema:datamining-${Date.now()}`,
      name: 'DataMiningSchema',
      fields: analysis.dataFields.map((field, index) => ({
        '@type': 'SchemaField',
        name: field.replace(/\s+/g, '_').toLowerCase(),
        displayName: field,
        type: this.inferFieldType(field),
        required: index === 0, // First field is usually required
        description: `Extracted ${field} from data source`
      })),
      metadata: {
        generatedFrom: 'prompt',
        intent: analysis.intent,
        createdAt: new Date().toISOString()
      }
    };

    return schema;
  }

  /**
   * Infer field type from field name
   */
  private inferFieldType(fieldName: string): string {
    const nameLower = fieldName.toLowerCase();
    
    if (nameLower.includes('date') || nameLower.includes('time')) {
      return 'date';
    } else if (nameLower.includes('price') || nameLower.includes('amount') || nameLower.includes('count')) {
      return 'number';
    } else if (nameLower.includes('is') || nameLower.includes('has')) {
      return 'boolean';
    } else if (nameLower.includes('list') || nameLower.includes('tags') || nameLower.includes('categories')) {
      return 'array';
    } else {
      return 'string';
    }
  }

  /**
   * Create datamining tasks from analysis and schema
   */
  private async createDataMiningTasks(
    analysis: PromptAnalysis,
    schema: any
  ): Promise<DataMiningTask[]> {
    const tasks: DataMiningTask[] = [];

    // Create tasks based on sources
    for (let i = 0; i < analysis.sources.length; i++) {
      const source = analysis.sources[i];
      
      const task: DataMiningTask = {
        '@type': 'DataMiningTask',
        '@id': `task-mining-${i + 1}`,
        name: `Extract data from ${new URL(source).hostname}`,
        description: `Mine data from ${source}`,
        source: {
          type: 'web',
          url: source,
          selectors: this.generateSelectors(analysis.dataFields)
        },
        extraction: {
          fields: schema.fields.map((field: any) => ({
            name: field.name,
            selector: `[data-field="${field.name}"], .${field.name}`,
            type: field.type,
            transform: field.type === 'date' ? 'parseDate' : undefined
          })),
          pagination: {
            enabled: true,
            selector: 'a.next, button.next, [rel="next"]',
            maxPages: 10
          }
        },
        storage: {
          type: 'database',
          table: 'datamining_results',
          format: analysis.outputFormat as any
        }
      };

      tasks.push(task);
    }

    // If no sources specified, create a generic task
    if (tasks.length === 0) {
      tasks.push({
        '@type': 'DataMiningTask',
        '@id': 'task-mining-1',
        name: 'Generic Data Mining Task',
        description: 'Extract data based on user prompt',
        source: {
          type: 'web',
          url: 'https://example.com',
          query: analysis.intent
        },
        extraction: {
          fields: schema.fields.map((field: any) => ({
            name: field.name,
            type: field.type
          }))
        },
        storage: {
          type: 'database',
          table: 'datamining_results'
        }
      });
    }

    return tasks;
  }

  /**
   * Generate CSS selectors for data fields
   */
  private generateSelectors(fields: string[]): string[] {
    return fields.map(field => {
      const normalized = field.toLowerCase().replace(/\s+/g, '-');
      return `[data-${normalized}], .${normalized}, #${normalized}`;
    });
  }

  /**
   * Generate workflow name from analysis
   */
  private generateWorkflowName(analysis: PromptAnalysis): string {
    const intent = analysis.intent.replace(/_/g, ' ');
    const fields = analysis.dataFields.slice(0, 2).join(' and ');
    return `${intent}: ${fields}`.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Save workflow to database
   */
  private async saveWorkflow(workflow: DataMiningWorkflow): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/workflow-processes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          process_type: 'datamining',
          process_definition_name: workflow.name,
          description: workflow.description,
          schema: workflow,
          is_active: true,
          tags: ['datamining', 'auto-generated'],
          metadata: {
            prompt: workflow.prompt,
            stage: workflow.stage
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save workflow: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }

  /**
   * Update workflow stage
   */
  async updateStage(workflowId: string, stage: WorkflowStage): Promise<void> {
    try {
      await fetch(`${this.apiEndpoint}/workflow-processes/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: { stage },
          updated_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating workflow stage:', error);
      throw error;
    }
  }

  /**
   * Execute datamining workflow
   */
  async executeWorkflow(workflowId: string): Promise<void> {
    try {
      await this.updateStage(workflowId, WorkflowStage.EXECUTING);

      const response = await fetch(
        `${this.apiEndpoint}/workflow-processes/${workflowId}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        await this.updateStage(workflowId, WorkflowStage.FAILED);
        throw new Error(`Workflow execution failed: ${response.statusText}`);
      }

      await this.updateStage(workflowId, WorkflowStage.PROCESSING);
    } catch (error) {
      console.error('Error executing workflow:', error);
      await this.updateStage(workflowId, WorkflowStage.FAILED);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<DataMiningWorkflow | null> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/workflow-processes/${workflowId}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.schema as DataMiningWorkflow;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  /**
   * List all datamining workflows
   */
  async listWorkflows(): Promise<DataMiningWorkflow[]> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/workflow-processes?type=datamining`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.map((item: any) => item.schema as DataMiningWorkflow);
    } catch (error) {
      console.error('Error listing workflows:', error);
      return [];
    }
  }
}

export default DataMiningWorkflowService;
