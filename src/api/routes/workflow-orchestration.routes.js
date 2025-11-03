/**
 * Workflow Orchestration API Routes
 * 
 * Advanced workflow management with schema-driven automation
 */

import express from 'express';
import workflowOrchestrator from '../../services/workflow-orchestrator.js';

const router = express.Router();

/**
 * @route   POST /api/workflows/create-from-prompt
 * @desc    Create workflow from natural language prompt
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

    const workflow = await workflowOrchestrator.createWorkflowFromPrompt(prompt, options || {});

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/workflows/:workflowId/execute
 * @desc    Execute a workflow
 * @access  Public
 */
router.post('/:workflowId/execute', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { options } = req.body;

    const result = await workflowOrchestrator.executeWorkflow(workflowId, options || {});

    res.json({
      success: true,
      data: result
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
 * @route   POST /api/workflows/:workflowId/resume
 * @desc    Resume a paused or failed workflow
 * @access  Public
 */
router.post('/:workflowId/resume', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const result = await workflowOrchestrator.resumeWorkflow(workflowId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error resuming workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/workflows
 * @desc    List all workflows
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const filter = {
      status: req.query.status
    };

    const workflows = workflowOrchestrator.listWorkflows(filter);

    res.json({
      success: true,
      data: workflows,
      count: workflows.length
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
 * @route   GET /api/workflows/:workflowId
 * @desc    Get workflow status
 * @access  Public
 */
router.get('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const status = workflowOrchestrator.getWorkflowStatus(workflowId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/workflows/tools/available
 * @desc    Get list of available workflow tools
 * @access  Public
 */
router.get('/tools/available', async (req, res) => {
  try {
    const tools = workflowOrchestrator.getAvailableTools();

    res.json({
      success: true,
      data: tools,
      count: tools.length
    });
  } catch (error) {
    console.error('Error getting available tools:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/workflows/tools/execute
 * @desc    Execute a specific tool
 * @access  Public
 */
router.post('/tools/execute', async (req, res) => {
  try {
    const { tool, parameters } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: 'Tool name is required'
      });
    }

    const result = await workflowOrchestrator.executeTool(tool, parameters || {});

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/workflows/tools/register
 * @desc    Register a new custom tool
 * @access  Public
 */
router.post('/tools/register', async (req, res) => {
  try {
    const toolDefinition = req.body;

    if (!toolDefinition.name || !toolDefinition.handler) {
      return res.status(400).json({
        success: false,
        error: 'Tool name and handler are required'
      });
    }

    workflowOrchestrator.registerTool(toolDefinition);

    res.json({
      success: true,
      message: `Tool '${toolDefinition.name}' registered successfully`
    });
  } catch (error) {
    console.error('Error registering tool:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
