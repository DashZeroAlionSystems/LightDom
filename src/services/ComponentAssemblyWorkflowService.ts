/**
 * Component Assembly Workflow Service
 * 
 * Orchestrates the assembly of complex components from atomic building blocks
 * Manages the workflow of component generation, validation, and deployment
 * 
 * @module ComponentAssemblyWorkflowService
 */

import { planningService, ExecutionPlan } from './PlanningService.js';
import { componentGeneratorService, ComponentGenerationRequest } from './ComponentGeneratorService.js';
import { componentLibraryService } from './ComponentLibraryService.js';
import { validationService } from './ValidationService.js';
import { getDatabaseService } from './DatabaseService.js';
import fs from 'fs/promises';
import path from 'path';

export interface ComponentAssemblyRequest {
  projectName: string;
  description: string;
  components: ComponentSpec[];
  outputDirectory: string;
  designSystem?: string;
  includeTests?: boolean;
  includeStories?: boolean;
}

export interface ComponentSpec {
  name: string;
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  useCase: string;
  baseComponents?: string[]; // Schema IDs
  customProps?: Record<string, any>;
}

export interface AssemblyResult {
  workflowId: string;
  plan: ExecutionPlan;
  components: GeneratedComponentInfo[];
  summary: {
    totalComponents: number;
    successCount: number;
    failureCount: number;
    outputDirectory: string;
  };
}

export interface GeneratedComponentInfo {
  name: string;
  type: string;
  filePath: string;
  success: boolean;
  error?: string;
}

export class ComponentAssemblyWorkflowService {
  private dbService: ReturnType<typeof getDatabaseService>;

  constructor() {
    this.dbService = getDatabaseService();
  }

  /**
   * Execute component assembly workflow
   */
  async executeAssembly(request: ComponentAssemblyRequest): Promise<AssemblyResult> {
    console.log(`🔧 Starting component assembly workflow: ${request.projectName}`);

    // Step 1: Generate execution plan
    const plan = await this.generateAssemblyPlan(request);
    console.log(`✅ Execution plan generated with ${plan.steps.length} steps`);

    // Step 2: Execute the plan
    const components = await this.executePlan(plan, request);

    // Step 3: Generate summary
    const summary = {
      totalComponents: components.length,
      successCount: components.filter(c => c.success).length,
      failureCount: components.filter(c => !c.success).length,
      outputDirectory: request.outputDirectory,
    };

    console.log(`✨ Assembly workflow completed: ${summary.successCount}/${summary.totalComponents} components generated`);

    // Step 4: Save workflow result
    await this.saveWorkflowResult(plan.planId, request, components);

    return {
      workflowId: plan.planId,
      plan,
      components,
      summary,
    };
  }

  /**
   * Generate execution plan for component assembly
   */
  private async generateAssemblyPlan(request: ComponentAssemblyRequest): Promise<ExecutionPlan> {
    console.log('📋 Generating assembly plan...');

    // Build plan manually (could also use PlanningService for AI generation)
    const planId = `assembly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const steps = [];
    let stepNum = 1;

    // Step: Initialize project
    steps.push({
      stepId: `step-${stepNum++}`,
      name: 'Initialize Project',
      description: 'Create output directory and project structure',
      action: 'initialize_project',
      parameters: { directory: request.outputDirectory },
      dependencies: [],
      estimatedDuration: '30 seconds',
    });

    // Step: Load atomic schemas
    steps.push({
      stepId: `step-${stepNum++}`,
      name: 'Load Atomic Schemas',
      description: 'Load all atomic component schemas from library',
      action: 'load_schemas',
      parameters: {},
      dependencies: ['step-1'],
      estimatedDuration: '10 seconds',
    });

    // Steps: Generate each component
    for (const component of request.components) {
      const stepId = `step-${stepNum++}`;
      steps.push({
        stepId,
        name: `Generate ${component.name}`,
        description: `Generate ${component.type} component: ${component.name}`,
        action: 'generate_component',
        parameters: {
          componentName: component.name,
          componentType: component.type,
          useCase: component.useCase,
          baseComponents: component.baseComponents || [],
        },
        dependencies: ['step-2'],
        estimatedDuration: '2 minutes',
      });
    }

    // Step: Validate all components
    steps.push({
      stepId: `step-${stepNum++}`,
      name: 'Validate Components',
      description: 'Run linting and type checking on generated components',
      action: 'validate',
      parameters: {},
      dependencies: steps.slice(2).map(s => s.stepId),
      estimatedDuration: '1 minute',
    });

    // Step: Generate index file
    steps.push({
      stepId: `step-${stepNum++}`,
      name: 'Generate Index',
      description: 'Create index.ts file exporting all components',
      action: 'generate_index',
      parameters: {},
      dependencies: [`step-${stepNum - 2}`],
      estimatedDuration: '10 seconds',
    });

    const plan: ExecutionPlan = {
      planId,
      templateId: 'component-assembly',
      title: `Component Assembly: ${request.projectName}`,
      description: request.description,
      steps,
      variables: {
        projectName: request.projectName,
        componentCount: request.components.length,
        outputDirectory: request.outputDirectory,
      },
      metadata: {
        designSystem: request.designSystem,
        includeTests: request.includeTests,
        includeStories: request.includeStories,
      },
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    await planningService.savePlan(plan);

    return plan;
  }

  /**
   * Execute the assembly plan
   */
  private async executePlan(
    plan: ExecutionPlan,
    request: ComponentAssemblyRequest
  ): Promise<GeneratedComponentInfo[]> {
    const components: GeneratedComponentInfo[] = [];

    // Update plan status
    await planningService.updatePlanStatus(plan.planId, 'executing');

    try {
      // Execute steps in order
      for (const step of plan.steps) {
        console.log(`🔨 Executing: ${step.name}`);

        switch (step.action) {
          case 'initialize_project':
            await this.initializeProject(request.outputDirectory);
            break;

          case 'load_schemas':
            await componentLibraryService.loadAtomicSchemasFromFiles();
            break;

          case 'generate_component':
            const result = await this.generateComponent(step.parameters, request);
            components.push(result);
            break;

          case 'validate':
            // Validation would go here
            console.log('  ⏭️  Validation step (skipped in this version)');
            break;

          case 'generate_index':
            await this.generateIndexFile(components, request.outputDirectory);
            break;

          default:
            console.warn(`  ⚠️  Unknown action: ${step.action}`);
        }
      }

      await planningService.updatePlanStatus(plan.planId, 'completed');
    } catch (error) {
      await planningService.updatePlanStatus(plan.planId, 'failed');
      throw error;
    }

    return components;
  }

  /**
   * Initialize project directory
   */
  private async initializeProject(directory: string): Promise<void> {
    await fs.mkdir(directory, { recursive: true });
    console.log(`  ✅ Created directory: ${directory}`);
  }

  /**
   * Generate a single component
   */
  private async generateComponent(
    params: any,
    request: ComponentAssemblyRequest
  ): Promise<GeneratedComponentInfo> {
    try {
      // Find base components or auto-select
      let baseComponents = params.baseComponents;
      
      if (!baseComponents || baseComponents.length === 0) {
        // Auto-select based on use case
        const allComponents = await componentLibraryService.getAtomicComponents();
        baseComponents = allComponents
          .filter(comp => 
            comp.tags?.some(tag => 
              params.useCase.toLowerCase().includes(tag.toLowerCase())
            )
          )
          .map(comp => comp.schemaId)
          .slice(0, 5); // Limit to 5 most relevant
      }

      const genRequest: ComponentGenerationRequest = {
        componentName: params.componentName,
        componentType: params.componentType,
        baseComponents,
        requirements: {
          functionality: params.useCase,
          designSystem: request.designSystem || 'Material Design 3',
          accessibility: true,
          responsive: true,
        },
        aiGeneration: {
          useAI: true,
          includeTests: request.includeTests ?? true,
          includeStories: request.includeStories ?? false,
        },
        output: {
          directory: request.outputDirectory,
          typescript: true,
          styling: 'CSS Modules',
        },
      };

      const component = await componentGeneratorService.generateComponent(genRequest);

      const filePath = path.join(request.outputDirectory, `${params.componentName}.tsx`);

      return {
        name: params.componentName,
        type: params.componentType,
        filePath,
        success: true,
      };
    } catch (error) {
      console.error(`  ❌ Failed to generate ${params.componentName}:`, error);
      return {
        name: params.componentName,
        type: params.componentType,
        filePath: '',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate index file
   */
  private async generateIndexFile(
    components: GeneratedComponentInfo[],
    outputDirectory: string
  ): Promise<void> {
    const successfulComponents = components.filter(c => c.success);

    const exports = successfulComponents
      .map(c => `export { default as ${c.name} } from './${c.name}';`)
      .join('\n');

    const indexContent = `/**
 * Component Library Index
 * Auto-generated by ComponentAssemblyWorkflowService
 */

${exports}

export default {
  ${successfulComponents.map(c => c.name).join(',\n  ')}
};
`;

    await fs.writeFile(path.join(outputDirectory, 'index.ts'), indexContent, 'utf-8');
    console.log('  ✅ Generated index.ts');
  }

  /**
   * Save workflow result to database
   */
  private async saveWorkflowResult(
    workflowId: string,
    request: ComponentAssemblyRequest,
    components: GeneratedComponentInfo[]
  ): Promise<void> {
    const result = {
      workflowId,
      request,
      components,
      completedAt: new Date().toISOString(),
    };

    await this.dbService.query(
      `INSERT INTO content_entities (type, title, description, content, metadata, tags)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'ld:ComponentAssemblyResult',
        `Assembly: ${request.projectName}`,
        request.description,
        JSON.stringify(result),
        JSON.stringify({
          componentCount: components.length,
          successCount: components.filter(c => c.success).length,
        }),
        ['workflow', 'component-assembly', 'generated'],
      ]
    );
  }

  /**
   * Get workflow results
   */
  async getWorkflowResults(): Promise<any[]> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:ComponentAssemblyResult' 
       ORDER BY created_at DESC`
    );

    return result.rows.map(row => row.content);
  }
}

// Singleton instance
export const componentAssemblyWorkflowService = new ComponentAssemblyWorkflowService();

export default ComponentAssemblyWorkflowService;
