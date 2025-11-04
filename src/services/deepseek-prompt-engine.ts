/**
 * DeepSeek Prompt Template Engine
 * Manages prompt templates for workflow generation, schema creation, and system configuration
 */

import { DeepSeekSystemConfig } from '../config/deepseek-config.js';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'workflow' | 'schema' | 'component' | 'analysis' | 'optimization';
  template: string;
  variables: string[];
  examples?: Array<{ input: Record<string, any>; output: string }>;
}

export interface PromptContext {
  systemConfig: DeepSeekSystemConfig;
  userContext?: Record<string, any>;
  previousInteractions?: string[];
  domainKnowledge?: string[];
}

/**
 * Default Prompt Templates
 * These templates govern how DeepSeek generates workflows, schemas, and configurations
 */
export const DEFAULT_PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  workflowGeneration: {
    id: 'workflow-generation',
    name: 'Workflow Generation',
    description: 'Generate complete workflow schema from natural language description',
    category: 'workflow',
    template: `You are an expert workflow architect for the LightDom platform.

SYSTEM CONTEXT:
- Platform: LightDom - Schema-driven DOM optimization and SEO automation
- Naming Convention: {{namingConvention}}
- Safety Mode: {{safetyMode}}
- Available Services: Crawler, SEO Analyzer, Data Mining, ML Training, N8N Integration

USER REQUEST:
{{userRequest}}

DOMAIN CONTEXT:
{{domainContext}}

REQUIREMENTS:
1. Generate a complete workflow schema in JSON format
2. Use the naming convention: {{namingConvention}}
3. Include all necessary services and their configurations
4. Define task pipeline with proper dependencies
5. Add error handling and retry logic
6. Configure monitoring and logging
7. Set appropriate resource limits

REASONING PROCESS (Chain-of-Thought):
Step 1: Analyze the user request to identify required services
Step 2: Define the task execution order and dependencies
Step 3: Configure service parameters based on best practices
Step 4: Add error handling and monitoring
Step 5: Validate the schema structure

OUTPUT FORMAT:
Generate a JSON workflow schema following this structure:
{
  "workflow": {
    "id": "...",
    "name": "...",
    "description": "...",
    "services": [...],
    "tasks": [...],
    "schedule": {...},
    "errorHandling": {...},
    "monitoring": {...}
  }
}`,
    variables: ['userRequest', 'namingConvention', 'safetyMode', 'domainContext'],
    examples: [
      {
        input: {
          userRequest: 'Create a workflow to crawl competitor websites and analyze their SEO',
          namingConvention: 'camelCase',
          safetyMode: 'strict',
          domainContext: 'E-commerce industry, focus on product pages',
        },
        output: '{"workflow": {"id": "competitorSeoAnalysis_1234", "name": "Competitor SEO Analysis"}}',
      },
    ],
  },

  schemaGeneration: {
    id: 'schema-generation',
    name: 'Schema Map Generation',
    description: 'Generate linked schema maps with relationships',
    category: 'schema',
    template: `You are a schema architect specializing in linked data and semantic relationships.

TASK: Generate a comprehensive schema map with relationships

USER DESCRIPTION:
{{userDescription}}

EXISTING SCHEMAS:
{{existingSchemas}}

REQUIREMENTS:
1. Generate schemas using JSON Schema format
2. Define clear relationships between entities
3. Include validation rules and constraints
4. Use semantic naming following: {{namingConvention}}
5. Add documentation and examples
6. Ensure compatibility with existing schemas

REASONING STEPS:
1. Identify entities and their attributes
2. Map relationships (one-to-many, many-to-many, etc.)
3. Define validation rules
4. Add semantic metadata
5. Generate linked schema definitions

OUTPUT: JSON Schema with relationship mappings`,
    variables: ['userDescription', 'existingSchemas', 'namingConvention'],
  },

  componentGeneration: {
    id: 'component-generation',
    name: 'React Component Generation',
    description: 'Generate React components from schema definitions',
    category: 'component',
    template: `You are a React component generator for the LightDom platform.

SCHEMA INPUT:
{{schemaDefinition}}

DESIGN SYSTEM:
- UI Framework: Ant Design
- Styling: Tailwind CSS
- State Management: React Context
- Form Handling: React Hook Form

REQUIREMENTS:
1. Generate TypeScript React component
2. Include proper type definitions
3. Add form validation based on schema
4. Implement error handling
5. Follow component naming: {{componentNaming}}
6. Use Ant Design components
7. Apply Tailwind CSS classes
8. Add JSDoc comments

REASONING:
1. Parse schema to identify fields and types
2. Map schema types to React components
3. Generate validation logic
4. Create component structure
5. Add styling and accessibility

OUTPUT: Complete TypeScript React component code`,
    variables: ['schemaDefinition', 'componentNaming'],
  },

  campaignOptimization: {
    id: 'campaign-optimization',
    name: 'SEO Campaign Optimization',
    description: 'Optimize SEO campaign configuration for maximum effectiveness',
    category: 'optimization',
    template: `You are an SEO campaign optimization expert.

CAMPAIGN CONTEXT:
{{campaignContext}}

CURRENT TRENDS:
- Schema.org structured data adoption: High priority
- Core Web Vitals: Critical for ranking
- Mobile-first indexing: Essential
- AI-generated content detection: Important
- Local SEO: Growing importance

ANALYSIS REQUIREMENTS:
1. Review current campaign configuration
2. Identify optimization opportunities
3. Suggest schema enhancements
4. Recommend crawling patterns
5. Optimize monitoring metrics

REASONING:
1. Analyze campaign goals and current state
2. Compare against SEO best practices and trends
3. Identify gaps and opportunities
4. Prioritize recommendations
5. Generate optimized configuration

OUTPUT: Optimized campaign configuration with explanations`,
    variables: ['campaignContext'],
  },

  dataMiningStrategy: {
    id: 'data-mining-strategy',
    name: 'Data Mining Strategy',
    description: 'Determine optimal data to mine for training and optimization',
    category: 'analysis',
    template: `You are a data mining strategist for AI/ML training.

OBJECTIVE:
{{objective}}

AVAILABLE DATA SOURCES:
- Web crawl data (DOM structure, content, metadata)
- SEO metrics (rankings, traffic, conversions)
- User interaction data
- Competitor analysis data
- Schema.org structured data

MEMORY CONFIGURATION:
- Context window: {{contextWindow}} tokens
- Retention: {{retentionDays}} days
- Persistence: {{persistence}}

TASK:
1. Identify which data to mine for the objective
2. Determine data collection frequency
3. Define data processing pipeline
4. Specify storage and indexing strategy
5. Configure memory/query patterns for DeepSeek

REASONING:
1. Analyze objective requirements
2. Map data sources to training needs
3. Design efficient collection strategy
4. Optimize for query performance
5. Configure memory management

OUTPUT: Data mining strategy with configuration`,
    variables: ['objective', 'contextWindow', 'retentionDays', 'persistence'],
  },

  selfImprovementPrompt: {
    id: 'self-improvement',
    name: 'Self-Improvement Analysis',
    description: 'Analyze system performance and suggest improvements',
    category: 'optimization',
    template: `You are a system optimization analyst with self-improvement capabilities.

CURRENT SYSTEM STATE:
{{systemMetrics}}

RECENT EXECUTIONS:
{{recentExecutions}}

CONSTRAINTS:
- Safety Mode: {{safetyMode}}
- Max Modifications: {{maxModifications}}
- Human Approval Required: {{requireApproval}}

TASK:
1. Analyze system performance metrics
2. Identify bottlenecks and inefficiencies
3. Suggest safe improvements
4. Prioritize recommendations
5. Generate implementation plan

SAFETY CHECKS:
- All modifications must be reversible
- No access to sensitive data without approval
- Changes must pass validation before execution
- Maintain audit trail of all modifications

REASONING:
1. Review metrics and identify patterns
2. Compare against baseline performance
3. Generate improvement hypotheses
4. Validate safety of each suggestion
5. Create prioritized action plan

OUTPUT: Self-improvement recommendations with safety validation`,
    variables: ['systemMetrics', 'recentExecutions', 'safetyMode', 'maxModifications', 'requireApproval'],
  },
};

/**
 * Prompt Engine Class
 */
export class DeepSeekPromptEngine {
  private templates: Map<string, PromptTemplate>;
  private config: DeepSeekSystemConfig;

  constructor(config: DeepSeekSystemConfig) {
    this.config = config;
    this.templates = new Map(Object.entries(DEFAULT_PROMPT_TEMPLATES));
  }

  /**
   * Register a custom prompt template
   */
  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Generate a prompt from template
   */
  generatePrompt(
    templateId: string,
    variables: Record<string, any>,
    context?: PromptContext
  ): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let prompt = template.template;

    // Inject system configuration
    const systemVars = {
      namingConvention: this.config.naming.variableNamingStyle,
      safetyMode: this.config.behavior.safetyMode,
      contextWindow: this.config.memory.contextWindowSize,
      retentionDays: this.config.memory.memoryRetentionDays,
      persistence: this.config.memory.memoryPersistence,
      maxModifications: this.config.behavior.maxSelfModifications,
      requireApproval: this.config.behavior.requireHumanApproval,
      componentNaming: this.config.naming.componentNamePattern,
    };

    // Merge all variables
    const allVars = { ...systemVars, ...variables };

    // Replace template variables
    for (const [key, value] of Object.entries(allVars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, String(value));
    }

    // Add context if provided
    if (context?.previousInteractions && context.previousInteractions.length > 0) {
      prompt += '\n\nPREVIOUS INTERACTIONS:\n' + context.previousInteractions.join('\n');
    }

    if (context?.domainKnowledge && context.domainKnowledge.length > 0) {
      prompt += '\n\nDOMAIN KNOWLEDGE:\n' + context.domainKnowledge.join('\n');
    }

    return prompt;
  }

  /**
   * Get all templates by category
   */
  getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.category === category);
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * List all available templates
   */
  listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Update system configuration
   */
  updateConfig(config: DeepSeekSystemConfig): void {
    this.config = config;
  }
}

export default DeepSeekPromptEngine;
