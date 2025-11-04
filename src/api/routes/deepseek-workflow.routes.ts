/**
 * DeepSeek Workflow API Routes
 * REST API endpoints for DeepSeek-powered workflow generation and management
 */

import express, { Router, Request, Response } from 'express';
import { DeepSeekConfigLoader, DEFAULT_DEEPSEEK_CONFIG } from '../../config/deepseek-config.js';
import { DeepSeekPromptEngine } from '../../services/deepseek-prompt-engine.js';
import { SchemaGeneratorService } from '../../services/schema-generator.js';
import { WorkflowOrchestrator } from '../../services/workflow-orchestrator.js';
import { GitStateManager } from '../../services/git-state-manager.js';

const router: Router = express.Router();

// Initialize services
const configLoader = new DeepSeekConfigLoader();
const config = configLoader.getConfig();
const promptEngine = new DeepSeekPromptEngine(config);
const schemaGenerator = new SchemaGeneratorService(configLoader);
const orchestrator = new WorkflowOrchestrator(config);
const stateManager = new GitStateManager({
  repository: process.env.GIT_STATE_REPO || '',
  branch: `state/${process.env.NODE_ENV || 'development'}`,
  autoCommit: true,
  commitMessage: 'chore: auto-commit workflow state [skip ci]',
  conflictResolution: 'theirs',
});

/**
 * GET /api/deepseek/config
 * Get current DeepSeek configuration
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: configLoader.getConfig(),
  });
});

/**
 * PUT /api/deepseek/config
 * Update DeepSeek configuration
 */
router.put('/config', (req: Request, res: Response) => {
  try {
    configLoader.updateConfig(req.body);
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: configLoader.getConfig(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update configuration',
    });
  }
});

/**
 * GET /api/deepseek/templates
 * List available prompt templates
 */
router.get('/templates', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  
  const templates = category
    ? promptEngine.getTemplatesByCategory(category as any)
    : promptEngine.listTemplates();

  res.json({
    success: true,
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      variables: t.variables,
    })),
  });
});

/**
 * POST /api/deepseek/prompt/generate
 * Generate a prompt from template
 */
router.post('/prompt/generate', (req: Request, res: Response) => {
  try {
    const { templateId, variables, context } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'templateId is required',
      });
    }

    const prompt = promptEngine.generatePrompt(templateId, variables, context);

    res.json({
      success: true,
      prompt,
      templateId,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prompt',
    });
  }
});

/**
 * POST /api/deepseek/schema/generate
 * Generate schema using DeepSeek
 */
router.post('/schema/generate', async (req: Request, res: Response) => {
  try {
    const { description, context, options } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'description is required',
      });
    }

    const schema = await schemaGenerator.generateSchema({
      description,
      context,
      options,
    });

    res.json({
      success: true,
      schema,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate schema',
    });
  }
});

/**
 * POST /api/deepseek/schema/map/generate
 * Generate complete schema map
 */
router.post('/schema/map/generate', async (req: Request, res: Response) => {
  try {
    const { description, options } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'description is required',
      });
    }

    const schemaMap = await schemaGenerator.generateSchemaMap(description, options);

    res.json({
      success: true,
      schemaMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate schema map',
    });
  }
});

/**
 * GET /api/deepseek/schema/:schemaId
 * Get schema by ID
 */
router.get('/schema/:schemaId', (req: Request, res: Response) => {
  const schema = schemaGenerator.getSchema(req.params.schemaId);

  if (!schema) {
    return res.status(404).json({
      success: false,
      error: 'Schema not found',
    });
  }

  res.json({
    success: true,
    schema,
  });
});

/**
 * GET /api/deepseek/schemas
 * List all schemas
 */
router.get('/schemas', (req: Request, res: Response) => {
  const schemas = schemaGenerator.listSchemas();

  res.json({
    success: true,
    schemas,
    count: schemas.length,
  });
});

/**
 * POST /api/deepseek/workflow/generate
 * Generate workflow from natural language
 */
router.post('/workflow/generate', async (req: Request, res: Response) => {
  try {
    const { description, context } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'description is required',
      });
    }

    const workflow = await orchestrator.generateWorkflow(description, context);

    // Save to Git state
    await stateManager.saveWorkflowState(workflow.id, workflow, `Generated workflow: ${workflow.name}`);

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate workflow',
    });
  }
});

/**
 * POST /api/deepseek/workflow/:workflowId/execute
 * Execute a workflow with input validation
 */
router.post('/workflow/:workflowId/execute', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const { input } = req.body;

    // Get workflow to validate input
    const workflow = orchestrator.getWorkflow(workflowId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: `Workflow not found: ${workflowId}`,
      });
    }

    // Validate input if workflow has input schema
    if (workflow.metadata?.inputSchema) {
      // Basic validation - in production, use a schema validator like Ajv
      const requiredFields = workflow.metadata.inputSchema.required || [];
      const missingFields = requiredFields.filter((field: string) => !input?.[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required input fields: ${missingFields.join(', ')}`,
        });
      }
    }

    const execution = await orchestrator.executeWorkflow(workflowId, input);

    // Save execution state
    await stateManager.saveWorkflowState(
      `${workflowId}-exec-${execution.id}`,
      execution,
      `Workflow execution: ${execution.id}`
    );

    res.json({
      success: true,
      execution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute workflow',
    });
  }
});

/**
 * GET /api/deepseek/workflow/:workflowId
 * Get workflow by ID
 */
router.get('/workflow/:workflowId', (req: Request, res: Response) => {
  const workflow = orchestrator.getWorkflow(req.params.workflowId);

  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: 'Workflow not found',
    });
  }

  res.json({
    success: true,
    workflow,
  });
});

/**
 * GET /api/deepseek/workflows
 * List all workflows
 */
router.get('/workflows', (req: Request, res: Response) => {
  const workflows = orchestrator.listWorkflows();

  res.json({
    success: true,
    workflows,
    count: workflows.length,
  });
});

/**
 * GET /api/deepseek/execution/:executionId
 * Get execution by ID
 */
router.get('/execution/:executionId', (req: Request, res: Response) => {
  const execution = orchestrator.getExecution(req.params.executionId);

  if (!execution) {
    return res.status(404).json({
      success: false,
      error: 'Execution not found',
    });
  }

  res.json({
    success: true,
    execution,
  });
});

/**
 * GET /api/deepseek/executions
 * List all executions
 */
router.get('/executions', (req: Request, res: Response) => {
  const executions = orchestrator.listExecutions();

  res.json({
    success: true,
    executions,
    count: executions.length,
  });
});

/**
 * GET /api/deepseek/state/history/:entityType/:entityId
 * Get state history from Git
 */
router.get('/state/history/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const filePath = `${entityType}/${entityId}.json`;
    const history = await stateManager.getHistory(filePath, limit);

    res.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get history',
    });
  }
});

/**
 * POST /api/deepseek/state/rollback
 * Rollback state to previous version
 */
router.post('/state/rollback', async (req: Request, res: Response) => {
  try {
    const { steps = 1 } = req.body;

    await stateManager.rollback(steps);

    res.json({
      success: true,
      message: `Rolled back ${steps} step(s)`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rollback',
    });
  }
});

/**
 * POST /api/deepseek/state/tag
 * Create a tag for current state
 */
router.post('/state/tag', async (req: Request, res: Response) => {
  try {
    const { tagName, message } = req.body;

    if (!tagName) {
      return res.status(400).json({
        success: false,
        error: 'tagName is required',
      });
    }

    await stateManager.createTag(tagName, message);

    res.json({
      success: true,
      message: `Tag created: ${tagName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tag',
    });
  }
});

/**
 * GET /api/deepseek/state/tags
 * List all state tags
 */
router.get('/state/tags', async (req: Request, res: Response) => {
  try {
    const tags = await stateManager.listTags();

    res.json({
      success: true,
      tags,
      count: tags.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list tags',
    });
  }
});

/**
 * POST /api/deepseek/state/sync
 * Sync state with remote Git repository
 */
router.post('/state/sync', async (req: Request, res: Response) => {
  try {
    await stateManager.syncWithRemote();

    res.json({
      success: true,
      message: 'State synced with remote',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync state',
    });
  }
});

/**
 * GET /api/deepseek/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    services: {
      configLoader: 'ready',
      promptEngine: 'ready',
      schemaGenerator: 'ready',
      orchestrator: 'ready',
      stateManager: 'ready',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
