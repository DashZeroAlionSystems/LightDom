/**
 * PlanningService
 * 
 * Generates execution plans using AI
 * Validates plans against the execution-plan-schema
 * 
 * @module PlanningService
 */

import { OllamaService } from './ai/OllamaService.js';
import { validationService, LdSchema } from './ValidationService.js';
import { getDatabaseService } from './DatabaseService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExecutionPlanStep {
  stepId: string;
  name: string;
  description?: string;
  action: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
  estimatedDuration?: string;
}

export interface ExecutionPlan {
  planId: string;
  templateId: string;
  title: string;
  description?: string;
  steps: ExecutionPlanStep[];
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  status?: 'draft' | 'ready' | 'executing' | 'completed' | 'failed';
  createdAt?: string;
}

export class PlanningService {
  private ollamaService: OllamaService;
  private dbService: ReturnType<typeof getDatabaseService>;
  private executionPlanSchema: LdSchema | null = null;

  constructor() {
    this.ollamaService = new OllamaService();
    this.dbService = getDatabaseService();
  }

  /**
   * Load the execution plan schema
   */
  private async loadExecutionPlanSchema(): Promise<LdSchema> {
    if (this.executionPlanSchema) {
      return this.executionPlanSchema;
    }

    const schemaPath = path.resolve(__dirname, '../../schemas/execution-plan-schema.json');
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    this.executionPlanSchema = JSON.parse(schemaContent);
    return this.executionPlanSchema;
  }

  /**
   * Generate an execution plan from a template
   */
  async generatePlan(
    templateId: string,
    variables: Record<string, any>
  ): Promise<ExecutionPlan> {
    console.log(`🎯 Generating execution plan for template: ${templateId}`);

    // Create prompt for AI
    const prompt = `Generate a detailed execution plan for the following workflow template:

Template ID: ${templateId}
Variables: ${JSON.stringify(variables, null, 2)}

Create a comprehensive execution plan with:
1. A clear title and description
2. Ordered steps with unique IDs
3. For each step:
   - Name and description
   - Specific action to perform
   - Required parameters
   - Dependencies on other steps (if any)
   - Estimated duration

Format the response as JSON matching this structure:
{
  "title": "Plan title",
  "description": "Plan description",
  "steps": [
    {
      "stepId": "step-1",
      "name": "Step name",
      "description": "What this step does",
      "action": "action_name",
      "parameters": {},
      "dependencies": [],
      "estimatedDuration": "5 minutes"
    }
  ]
}`;

    try {
      const startTime = Date.now();
      const response = await this.ollamaService.chat(
        prompt,
        'You are an expert workflow planning AI. Generate detailed, executable plans in JSON format.'
      );
      const duration = Date.now() - startTime;

      // Log the interaction
      await this.ollamaService.logInteraction(prompt, response, {
        service: 'PlanningService',
        metadata: { templateId, variables },
        durationMs: duration,
      });

      // Extract JSON from response
      const jsonMatch = response.match(/```json\n?([\s\S]+?)\n?```/) || response.match(/\{[\s\S]+\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const planData = JSON.parse(jsonStr);

      // Build complete execution plan
      const executionPlan: ExecutionPlan = {
        planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        title: planData.title,
        description: planData.description,
        steps: planData.steps,
        variables,
        metadata: {
          generatedBy: 'PlanningService',
          aiModel: 'ollama:r1',
          generatedAt: new Date().toISOString(),
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
      };

      // Validate against schema
      const schema = await this.loadExecutionPlanSchema();
      const validationResult = validationService.validateWithLdSchema(executionPlan, schema);

      if (!validationResult.success) {
        console.error('❌ Plan validation failed:', validationResult.errors);
        throw new Error(
          `Plan validation failed: ${validationResult.errors?.map((e) => e.message).join(', ')}`
        );
      }

      console.log('✅ Execution plan generated and validated successfully');

      // Save to database
      await this.savePlan(executionPlan);

      return executionPlan;
    } catch (error) {
      console.error('Failed to generate execution plan:', error);
      throw error;
    }
  }

  /**
   * Save an execution plan to the database
   */
  async savePlan(plan: ExecutionPlan): Promise<void> {
    await this.dbService.query(
      `INSERT INTO content_entities (type, title, description, content, metadata, tags)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'ld:ExecutionPlan',
        plan.title,
        plan.description || '',
        JSON.stringify(plan),
        JSON.stringify(plan.metadata || {}),
        ['execution-plan', plan.templateId],
      ]
    );
  }

  /**
   * Get an execution plan by ID
   */
  async getPlan(planId: string): Promise<ExecutionPlan | null> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:ExecutionPlan' 
       AND content->>'planId' = $1`,
      [planId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].content as ExecutionPlan;
  }

  /**
   * Get all plans for a template
   */
  async getPlansByTemplate(templateId: string): Promise<ExecutionPlan[]> {
    const result = await this.dbService.query<any>(
      `SELECT content FROM content_entities 
       WHERE type = 'ld:ExecutionPlan' 
       AND content->>'templateId' = $1
       ORDER BY created_at DESC`,
      [templateId]
    );

    return result.rows.map((row) => row.content as ExecutionPlan);
  }

  /**
   * Update plan status
   */
  async updatePlanStatus(
    planId: string,
    status: 'draft' | 'ready' | 'executing' | 'completed' | 'failed'
  ): Promise<void> {
    await this.dbService.query(
      `UPDATE content_entities 
       SET content = jsonb_set(content, '{status}', $2),
           updated_at = CURRENT_TIMESTAMP
       WHERE type = 'ld:ExecutionPlan' 
       AND content->>'planId' = $1`,
      [planId, JSON.stringify(status)]
    );
  }
}

// Singleton instance
export const planningService = new PlanningService();

export default PlanningService;
