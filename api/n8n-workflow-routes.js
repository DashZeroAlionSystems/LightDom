/**
 * N8N Workflow API Routes
 * 
 * Express routes for managing n8n workflows
 * Integrates with DeepSeek and MCP server
 * 
 * Features:
 * - Workflow CRUD operations
 * - Schema generation and validation
 * - Workflow execution
 * - DeepSeek-powered workflow creation
 * - MCP tool management
 */

import express from 'express';
import axios from 'axios';
import { n8nSchemaGenerator } from '../services/n8n-schema-generator.js';
import { promptEngine } from '../services/deepseek-prompt-templates.js';
import { n8nMCPServer } from '../services/n8n-mcp-server.js';

const router = express.Router();

// N8N API client
const createN8NClient = (apiKey) => axios.create({
  baseURL: process.env.N8N_API_URL || 'http://localhost:5678',
  headers: {
    'X-N8N-API-KEY': apiKey || process.env.N8N_API_KEY || '',
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

/**
 * GET /api/n8n/health
 * Check n8n connection health
 */
router.get('/health', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.get('/api/v1/workflows', { params: { limit: 1 } });
    
    res.json({
      status: 'healthy',
      connected: true,
      baseUrl: process.env.N8N_API_URL || 'http://localhost:5678'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      connected: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/workflows
 * List all workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.get('/api/v1/workflows');
    
    const workflows = response.data.data || response.data || [];
    
    res.json({
      success: true,
      count: workflows.length,
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        tags: w.tags,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      }))
    });
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/workflows/:id
 * Get specific workflow
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.get(`/api/v1/workflows/${req.params.id}`);
    
    res.json({
      success: true,
      workflow: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/workflows
 * Create new workflow
 */
router.post('/workflows', async (req, res) => {
  try {
    const client = createN8NClient();
    const workflowData = req.body;
    
    const response = await client.post('/api/v1/workflows', workflowData);
    
    // Generate schema for new workflow
    const schema = await n8nSchemaGenerator.generateWorkflowSchema(response.data.data || response.data);
    
    res.json({
      success: true,
      workflow: response.data.data || response.data,
      schema
    });
  } catch (error) {
    console.error('Failed to create workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/n8n/workflows/:id
 * Update workflow
 */
router.put('/workflows/:id', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.patch(`/api/v1/workflows/${req.params.id}`, req.body);
    
    res.json({
      success: true,
      workflow: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/n8n/workflows/:id
 * Delete workflow
 */
router.delete('/workflows/:id', async (req, res) => {
  try {
    const client = createN8NClient();
    await client.delete(`/api/v1/workflows/${req.params.id}`);
    
    res.json({
      success: true,
      message: 'Workflow deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/workflows/:id/activate
 * Activate workflow
 */
router.post('/workflows/:id/activate', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.patch(`/api/v1/workflows/${req.params.id}`, { active: true });
    
    res.json({
      success: true,
      workflow: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/workflows/:id/deactivate
 * Deactivate workflow
 */
router.post('/workflows/:id/deactivate', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.patch(`/api/v1/workflows/${req.params.id}`, { active: false });
    
    res.json({
      success: true,
      workflow: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/workflows/:id/execute
 * Execute workflow
 */
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const client = createN8NClient();
    const executionData = req.body.data || {};
    
    const response = await client.post(`/api/v1/workflows/${req.params.id}/execute`, {
      data: executionData
    });
    
    res.json({
      success: true,
      execution: response.data.data || response.data
    });
  } catch (error) {
    console.error('Workflow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/executions/:id
 * Get execution status
 */
router.get('/executions/:id', async (req, res) => {
  try {
    const client = createN8NClient();
    const response = await client.get(`/api/v1/executions/${req.params.id}`);
    
    res.json({
      success: true,
      execution: response.data.data || response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/schemas/generate
 * Generate schemas for all workflows
 */
router.post('/schemas/generate', async (req, res) => {
  try {
    const result = await n8nSchemaGenerator.generateAllSchemas();
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Schema generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/schemas/:workflowId
 * Get schema for specific workflow
 */
router.get('/schemas/:workflowId', async (req, res) => {
  try {
    const schema = n8nSchemaGenerator.getCachedSchema(req.params.workflowId);
    
    if (!schema) {
      // Generate fresh schema
      const client = createN8NClient();
      const response = await client.get(`/api/v1/workflows/${req.params.workflowId}`);
      const workflow = response.data.data || response.data;
      const newSchema = await n8nSchemaGenerator.generateWorkflowSchema(workflow);
      
      return res.json({
        success: true,
        schema: newSchema
      });
    }
    
    res.json({
      success: true,
      schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/deepseek/create-workflow
 * Create workflow using DeepSeek AI
 */
router.post('/deepseek/create-workflow', async (req, res) => {
  try {
    const { type, parameters, description } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Workflow type is required'
      });
    }

    // Generate prompt using template
    const prompt = promptEngine.createWorkflowPrompt(type, {
      task_description: description || parameters.task_description || 'automation workflow',
      input_parameters: JSON.stringify(parameters.inputs || {}),
      expected_output: JSON.stringify(parameters.outputs || {})
    });

    // Call DeepSeek API (placeholder - implement with actual DeepSeek client)
    const deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!deepseekApiKey) {
      return res.status(503).json({
        success: false,
        error: 'DeepSeek API key not configured'
      });
    }

    const deepseekResponse = await axios.post(
      `${deepseekApiUrl}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const workflowJSON = deepseekResponse.data.choices[0].message.content;
    
    // Parse and create workflow in n8n
    let workflowData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = workflowJSON.match(/```json\n([\s\S]*?)\n```/) || 
                       workflowJSON.match(/```\n([\s\S]*?)\n```/);
      
      workflowData = JSON.parse(jsonMatch ? jsonMatch[1] : workflowJSON);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse DeepSeek response as JSON',
        rawResponse: workflowJSON
      });
    }

    // Create workflow in n8n
    const client = createN8NClient();
    const createResponse = await client.post('/api/v1/workflows', workflowData);
    
    res.json({
      success: true,
      workflow: createResponse.data.data || createResponse.data,
      prompt,
      deepseekResponse: workflowJSON
    });
  } catch (error) {
    console.error('DeepSeek workflow creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * GET /api/n8n/prompt-templates
 * List available prompt templates
 */
router.get('/prompt-templates', (req, res) => {
  try {
    const templates = promptEngine.listTemplates();
    
    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/n8n/mcp/refresh
 * Refresh MCP tools from workflows
 */
router.post('/mcp/refresh', async (req, res) => {
  try {
    await n8nMCPServer.refreshTools();
    
    res.json({
      success: true,
      tools: n8nMCPServer.getTools().length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/n8n/mcp/tools
 * Get MCP tools
 */
router.get('/mcp/tools', (req, res) => {
  try {
    const tools = n8nMCPServer.getTools();
    
    res.json({
      success: true,
      count: tools.length,
      tools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
