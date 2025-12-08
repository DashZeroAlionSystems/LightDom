/**
 * DeepSeek Workflow Management API Routes
 * 
 * Provides API endpoints for DeepSeek to:
 * - Manage n8n workflows programmatically
 * - Generate workflows from natural language
 * - Execute and monitor workflows
 */

import express from 'express';
import DeepSeekWorkflowManager from '../services/deepseek-workflow-manager.js';

const router = express.Router();

// Initialize DeepSeek workflow manager
const workflowManager = new DeepSeekWorkflowManager();

/**
 * POST /api/deepseek-workflows/chat
 * Chat with DeepSeek to manage workflows
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await workflowManager.processWorkflowRequest(message, conversationHistory);

    res.json({
      success: true,
      response: result.message,
      toolsExecuted: result.executedTools || {},
      conversationId: result.conversationId
    });
  } catch (error) {
    console.error('Error in DeepSeek chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/deepseek-workflows/templates
 * List available workflow templates
 */
router.get('/templates', async (req, res) => {
  try {
    const { category = 'all' } = req.query;

    const templates = await workflowManager.listWorkflowTemplates(category);

    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/deepseek-workflows/from-template
 * Create workflow from template
 */
router.post('/from-template', async (req, res) => {
  try {
    const { templateName, customName, clientId, activate = true } = req.body;

    if (!templateName) {
      return res.status(400).json({
        success: false,
        error: 'Template name is required'
      });
    }

    const result = await workflowManager.createWorkflowFromTemplate({
      templateName,
      customName,
      clientId,
      activate
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating workflow from template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/deepseek-workflows/custom
 * Create custom workflow
 */
router.post('/custom', async (req, res) => {
  try {
    const { name, description, nodes, connections, tags } = req.body;

    if (!name || !nodes || !connections) {
      return res.status(400).json({
        success: false,
        error: 'Name, nodes, and connections are required'
      });
    }

    const result = await workflowManager.createCustomWorkflow({
      name,
      description,
      nodes,
      connections,
      tags
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating custom workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/deepseek-workflows/generate
 * Generate workflow from natural language description
 */
router.post('/generate', async (req, res) => {
  try {
    const { description, requirements, context } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }

    const result = await workflowManager.generateWorkflowFromDescription(
      description,
      requirements || [],
      context || {}
    );

    res.json(result);
  } catch (error) {
    console.error('Error generating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/deepseek-workflows/:workflowId
 * Edit workflow
 */
router.patch('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    const result = await workflowManager.editWorkflow(workflowId, updates);

    res.json(result);
  } catch (error) {
    console.error('Error editing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/deepseek-workflows/:workflowId/execute
 * Execute workflow
 */
router.post('/:workflowId/execute', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { inputData = {}, logExecution = true } = req.body;

    const result = await workflowManager.executeWorkflow(workflowId, inputData, logExecution);

    res.json(result);
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/deepseek-workflows/:workflowId/status
 * Get workflow status
 */
router.get('/:workflowId/status', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const status = await workflowManager.getWorkflowStatus(workflowId);

    res.json({
      success: true,
      workflow: status
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/deepseek-workflows/:workflowId
 * Delete workflow
 */
router.delete('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const result = await workflowManager.deleteWorkflow(workflowId);

    res.json(result);
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/deepseek-workflows/:workflowId/add-node
 * Add node to workflow
 */
router.post('/:workflowId/add-node', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { node, connectTo } = req.body;

    if (!node) {
      return res.status(400).json({
        success: false,
        error: 'Node configuration is required'
      });
    }

    const result = await workflowManager.addWorkflowNode(workflowId, node, connectTo);

    res.json(result);
  } catch (error) {
    console.error('Error adding node to workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/deepseek-workflows/tools
 * List available DeepSeek tools for workflow management
 */
router.get('/tools', (req, res) => {
  try {
    res.json({
      success: true,
      tools: workflowManager.workflowTools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }))
    });
  } catch (error) {
    console.error('Error listing tools:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
