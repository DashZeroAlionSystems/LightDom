/**
 * Workflow Wizard Service
 * 
 * Handles AI-powered component generation workflows using Ollama/DeepSeek
 * Manages workflow state, component generation, and database persistence
 * 
 * @module WorkflowWizardService
 */

import { OllamaService } from './ai/OllamaService.js';
import { componentGeneratorService, ComponentGenerationRequest } from './ComponentGeneratorService.js';
import { componentLibraryService } from './ComponentLibraryService.js';
import { getDatabaseService } from './DatabaseService.js';

export interface PromptAnalysisRequest {
  prompt: string;
  model?: string;
}

export interface PromptAnalysisResult {
  componentName: string;
  componentType: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  baseComponents: string[];
  requirements: {
    functionality: string;
    designSystem: string;
    accessibility: boolean;
    responsive: boolean;
  };
  suggestedProps: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

export interface ComponentGenerationWorkflowRequest {
  prompt: string;
  componentName: string;
  componentType: string;
  designSystem: string;
  baseComponents?: string[];
  model?: string;
}

export interface Workflow {
  id: string;
  name: string;
  prompt: string;
  config: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  componentCode?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export class WorkflowWizardService {
  private ollamaService: OllamaService;
  private dbService: ReturnType<typeof getDatabaseService>;

  constructor() {
    this.ollamaService = new OllamaService();
    this.dbService = getDatabaseService();
  }

  /**
   * Analyze user prompt and generate component configuration using DeepSeek
   */
  async analyzePrompt(request: PromptAnalysisRequest): Promise<PromptAnalysisResult> {
    console.log('🔍 Analyzing prompt with DeepSeek...');

    const systemPrompt = `You are an expert UI/UX designer and React developer. Analyze the user's component description and extract structured information.

Your response MUST be valid JSON with this exact structure:
{
  "componentName": "PascalCaseName",
  "componentType": "atom|molecule|organism|template|page",
  "baseComponents": ["ld:component-id"],
  "requirements": {
    "functionality": "detailed description",
    "designSystem": "Material Design 3|Ant Design|Chakra UI|Custom",
    "accessibility": true,
    "responsive": true
  },
  "suggestedProps": [
    {
      "name": "propName",
      "type": "string|number|boolean|object|array|function",
      "required": true,
      "description": "what this prop does"
    }
  ]
}

Guidelines:
- componentName: Convert description to PascalCase (e.g., "login form" → "LoginForm")
- componentType: Choose based on complexity (button=atom, form field=molecule, full form=organism)
- baseComponents: Select from: ld:button, ld:input, ld:label, ld:card, ld:select, ld:checkbox, ld:radio, ld:textarea, ld:badge, ld:alert, ld:spinner, ld:link, ld:icon, ld:form-field, ld:search-bar
- Always set accessibility and responsive to true
- Extract all props mentioned in the description`;

    const userPrompt = `Analyze this component description and return ONLY valid JSON:

"${request.prompt}"

Remember: Return ONLY the JSON object, no other text.`;

    try {
      const response = await this.ollamaService.chat(
        userPrompt,
        systemPrompt,
        request.model || 'deepseek-r1:1.5b'
      );

      // Try to extract JSON from the response
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to parse the whole response as JSON
        jsonMatch = [response];
      }

      const config = JSON.parse(jsonMatch[0]);

      // Validate and sanitize
      const result: PromptAnalysisResult = {
        componentName: config.componentName || this.extractComponentName(request.prompt),
        componentType: config.componentType || 'organism',
        baseComponents: Array.isArray(config.baseComponents) ? config.baseComponents : [],
        requirements: {
          functionality: config.requirements?.functionality || request.prompt,
          designSystem: config.requirements?.designSystem || 'Material Design 3',
          accessibility: config.requirements?.accessibility !== false,
          responsive: config.requirements?.responsive !== false,
        },
        suggestedProps: Array.isArray(config.suggestedProps) ? config.suggestedProps : [],
      };

      console.log('✅ Prompt analyzed successfully');
      return result;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Fallback: basic analysis
      return {
        componentName: this.extractComponentName(request.prompt),
        componentType: this.guessComponentType(request.prompt),
        baseComponents: this.suggestBaseComponents(request.prompt),
        requirements: {
          functionality: request.prompt,
          designSystem: 'Material Design 3',
          accessibility: true,
          responsive: true,
        },
        suggestedProps: [],
      };
    }
  }

  /**
   * Generate component using AI workflow
   */
  async generateComponentWorkflow(request: ComponentGenerationWorkflowRequest): Promise<{
    workflow: Workflow;
    component: any;
  }> {
    console.log(`🚀 Starting component generation workflow for: ${request.componentName}`);

    // Create workflow record
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: Workflow = {
      id: workflowId,
      name: request.componentName,
      prompt: request.prompt,
      config: {
        componentName: request.componentName,
        componentType: request.componentType,
        designSystem: request.designSystem,
        baseComponents: request.baseComponents || [],
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save workflow to database
    await this.saveWorkflow(workflow);

    try {
      // Update status to processing
      workflow.status = 'processing';
      await this.updateWorkflow(workflow);

      // Get or select base components
      let baseComponents = request.baseComponents || [];
      
      if (baseComponents.length === 0) {
        baseComponents = this.suggestBaseComponents(request.prompt);
      }

      // Generate component using ComponentGeneratorService
      const genRequest: ComponentGenerationRequest = {
        componentName: request.componentName,
        componentType: request.componentType as any,
        baseComponents,
        requirements: {
          functionality: request.prompt,
          designSystem: request.designSystem,
          accessibility: true,
          responsive: true,
        },
        aiGeneration: {
          useAI: true,
          model: request.model || 'deepseek-r1:1.5b',
          includeTests: true,
          includeStories: false,
        },
        output: {
          typescript: true,
          styling: 'CSS Modules',
        },
      };

      const component = await componentGeneratorService.generateComponent(genRequest);

      // Update workflow with success
      workflow.status = 'completed';
      workflow.componentCode = component.code;
      workflow.updatedAt = new Date().toISOString();
      await this.updateWorkflow(workflow);

      console.log(`✅ Component generated successfully: ${request.componentName}`);

      return { workflow, component };
    } catch (error) {
      // Update workflow with failure
      workflow.status = 'failed';
      workflow.error = error instanceof Error ? error.message : String(error);
      workflow.updatedAt = new Date().toISOString();
      await this.updateWorkflow(workflow);

      throw error;
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<Workflow[]> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:ComponentWorkflow' 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    return result.rows.map(row => row.content as Workflow);
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:ComponentWorkflow' 
       AND content->>'id' = $1`,
      [workflowId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].content as Workflow;
  }

  /**
   * Save workflow to database
   */
  private async saveWorkflow(workflow: Workflow): Promise<void> {
    await this.dbService.query(
      `INSERT INTO content_entities (type, title, description, content, metadata, tags)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'ld:ComponentWorkflow',
        workflow.name,
        workflow.prompt,
        JSON.stringify(workflow),
        JSON.stringify({
          workflowId: workflow.id,
          status: workflow.status,
          componentType: workflow.config.componentType,
        }),
        ['workflow', 'component-generation', workflow.status],
      ]
    );

    console.log(`💾 Workflow saved: ${workflow.id}`);
  }

  /**
   * Update workflow in database
   */
  private async updateWorkflow(workflow: Workflow): Promise<void> {
    await this.dbService.query(
      `UPDATE content_entities 
       SET content = $1, 
           metadata = $2,
           tags = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE type = 'ld:ComponentWorkflow' 
       AND content->>'id' = $4`,
      [
        JSON.stringify(workflow),
        JSON.stringify({
          workflowId: workflow.id,
          status: workflow.status,
          componentType: workflow.config.componentType,
        }),
        ['workflow', 'component-generation', workflow.status],
        workflow.id,
      ]
    );

    console.log(`📝 Workflow updated: ${workflow.id} - Status: ${workflow.status}`);
  }

  /**
   * Extract component name from prompt
   */
  private extractComponentName(prompt: string): string {
    // Simple heuristic: take first few words and convert to PascalCase
    const words = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(w => w.length > 0)
      .slice(0, 3);

    return words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }

  /**
   * Guess component type from prompt
   */
  private guessComponentType(prompt: string): 'atom' | 'molecule' | 'organism' | 'template' | 'page' {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('page') || lowerPrompt.includes('screen')) {
      return 'page';
    }

    if (lowerPrompt.includes('layout') || lowerPrompt.includes('template')) {
      return 'template';
    }

    if (
      lowerPrompt.includes('form') ||
      lowerPrompt.includes('table') ||
      lowerPrompt.includes('grid') ||
      lowerPrompt.includes('list') ||
      lowerPrompt.includes('dashboard')
    ) {
      return 'organism';
    }

    if (
      lowerPrompt.includes('card') ||
      lowerPrompt.includes('field') ||
      lowerPrompt.includes('search')
    ) {
      return 'molecule';
    }

    return 'atom';
  }

  /**
   * Suggest base components from prompt
   */
  private suggestBaseComponents(prompt: string): string[] {
    const components: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('button')) components.push('ld:button');
    if (lowerPrompt.includes('input') || lowerPrompt.includes('field')) components.push('ld:input');
    if (lowerPrompt.includes('form')) components.push('ld:form-field');
    if (lowerPrompt.includes('card')) components.push('ld:card');
    if (lowerPrompt.includes('select') || lowerPrompt.includes('dropdown')) components.push('ld:select');
    if (lowerPrompt.includes('checkbox')) components.push('ld:checkbox');
    if (lowerPrompt.includes('radio')) components.push('ld:radio');
    if (lowerPrompt.includes('textarea')) components.push('ld:textarea');
    if (lowerPrompt.includes('badge') || lowerPrompt.includes('tag')) components.push('ld:badge');
    if (lowerPrompt.includes('alert') || lowerPrompt.includes('message')) components.push('ld:alert');
    if (lowerPrompt.includes('loading') || lowerPrompt.includes('spinner')) components.push('ld:spinner');
    if (lowerPrompt.includes('link')) components.push('ld:link');
    if (lowerPrompt.includes('icon')) components.push('ld:icon');
    if (lowerPrompt.includes('search')) components.push('ld:search-bar');

    // Default fallback
    if (components.length === 0) {
      components.push('ld:card', 'ld:button');
    }

    return components;
  }
}

// Singleton instance
export const workflowWizardService = new WorkflowWizardService();

export default WorkflowWizardService;
