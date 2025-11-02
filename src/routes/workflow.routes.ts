/**
 * Workflow Wizard API Routes
 * 
 * Express routes for the component generation workflow wizard
 * Integrates with DeepSeek/Ollama for AI-powered component generation
 */

import express from 'express';
import { workflowWizardService } from '../services/WorkflowWizardService.js';

const router = express.Router();

/**
 * POST /api/workflow/analyze-prompt
 * Analyze a user prompt and generate component configuration
 */
router.post('/analyze-prompt', async (req, res) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const config = await workflowWizardService.analyzePrompt({ prompt, model });
    
    res.json(config);
  } catch (error) {
    console.error('Error analyzing prompt:', error);
    res.status(500).json({
      error: 'Failed to analyze prompt',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/workflow/generate-component
 * Generate a component using the AI workflow
 */
router.post('/generate-component', async (req, res) => {
  try {
    const {
      prompt,
      componentName,
      componentType,
      designSystem,
      baseComponents,
      model,
    } = req.body;

    if (!prompt || !componentName) {
      return res.status(400).json({ error: 'Prompt and component name are required' });
    }

    const result = await workflowWizardService.generateComponentWorkflow({
      prompt,
      componentName,
      componentType: componentType || 'organism',
      designSystem: designSystem || 'Material Design 3',
      baseComponents,
      model,
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating component:', error);
    res.status(500).json({
      error: 'Failed to generate component',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/workflows
 * Get all component generation workflows
 */
router.get('/', async (req, res) => {
  try {
    const workflows = await workflowWizardService.getWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      error: 'Failed to fetch workflows',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/workflows/:id
 * Get a specific workflow by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await workflowWizardService.getWorkflow(id);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      error: 'Failed to fetch workflow',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/workflow/save-component
 * Save generated component to filesystem
 */
router.post('/save-component', async (req, res) => {
  try {
    const { workflowId, component } = req.body;

    if (!workflowId || !component) {
      return res.status(400).json({ error: 'Workflow ID and component are required' });
    }

    // Component is already saved by ComponentGeneratorService
    // This endpoint can be used for additional post-processing

    res.json({ success: true, message: 'Component already saved by generator' });
  } catch (error) {
    console.error('Error saving component:', error);
    res.status(500).json({
      error: 'Failed to save component',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
