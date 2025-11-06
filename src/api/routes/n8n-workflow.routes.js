/**
 * N8N Workflow Creator API Routes
 * 
 * API endpoints for N8N workflow management with schema-driven control
 */

import express from 'express';
import n8nService from '../../services/n8n-workflow-creator.js';

const router = express.Router();

/**
 * @route   POST /api/n8n/create-from-prompt
 * @desc    Create N8N workflow from natural language prompt
 * @access  Public
 */
router.post('/create-from-prompt', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const result = await n8nService.createWorkflowFromPrompt(prompt, options || {});

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating N8N workflow from prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/n8n/create-from-schema
 * @desc    Create N8N workflow from LightDom schema
 * @access  Public
 */
router.post('/create-from-schema', async (req, res) => {
  try {
    const { schema, options } = req.body;

    if (!schema) {
      return res.status(400).json({
        success: false,
        error: 'Workflow schema is required'
      });
    }

    const workflow = await n8nService.createWorkflowFromSchema(schema, options || {});

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating N8N workflow from schema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/n8n/:workflowId/activate
 * @desc    Activate N8N workflow
 * @access  Public
 */
router.post('/:workflowId/activate', async (req, res) => {
  try {
    const { workflowId } = req.params;
    await n8nService.activateWorkflow(workflowId);

    res.json({
      success: true,
      message: 'Workflow activated'
    });
  } catch (error) {
    console.error('Error activating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/n8n/:workflowId/deactivate
 * @desc    Deactivate N8N workflow
 * @access  Public
 */
router.post('/:workflowId/deactivate', async (req, res) => {
  try {
    const { workflowId } = req.params;
    await n8nService.deactivateWorkflow(workflowId);

    res.json({
      success: true,
      message: 'Workflow deactivated'
    });
  } catch (error) {
    console.error('Error deactivating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/n8n/:workflowId/execute
 * @desc    Execute N8N workflow manually
 * @access  Public
 */
router.post('/:workflowId/execute', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { data } = req.body;

    const execution = await n8nService.executeWorkflow(workflowId, data || {});

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/n8n/workflows
 * @desc    List all N8N workflows
 * @access  Public
 */
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await n8nService.listWorkflows();

    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    console.error('Error listing workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/n8n/:workflowId
 * @desc    Delete N8N workflow
 * @access  Public
 */
router.delete('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    await n8nService.deleteWorkflow(workflowId);

    res.json({
      success: true,
      message: 'Workflow deleted'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/n8n/subtasks
 * @desc    Create sub-task workflow
 * @access  Public
 */
router.post('/subtasks', async (req, res) => {
  try {
    const { parentWorkflowId, subTasks, options } = req.body;

    if (!parentWorkflowId || !subTasks) {
      return res.status(400).json({
        success: false,
        error: 'Parent workflow ID and sub-tasks are required'
      });
    }

    const workflow = await n8nService.createSubTaskWorkflow(
      parentWorkflowId,
      subTasks,
      options || {}
    );

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating sub-task workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/n8n/health
 * @desc    Check N8N service health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = await n8nService.healthCheck();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error checking N8N health:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
