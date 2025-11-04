import { Router } from 'express';
import schemaOrchestrationService from '../services/schema-orchestration.service';
import mcpServerService from '../services/mcp-server-integration.service';

const router = Router();

// ===== WORKFLOW TEMPLATES =====

// Create workflow template
router.post('/templates', async (req, res) => {
  try {
    const template = await schemaOrchestrationService.createWorkflowTemplate(req.body);
    res.status(201).json(template);
  } catch (error: any) {
    console.error('Error creating workflow template:', error);
    res.status(500).json({ error: 'Failed to create workflow template', message: error.message });
  }
});

// Get workflow template
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await schemaOrchestrationService.getWorkflowTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Workflow template not found' });
    }
    res.json(template);
  } catch (error: any) {
    console.error('Error getting workflow template:', error);
    res.status(500).json({ error: 'Failed to get workflow template', message: error.message });
  }
});

// List workflow templates
router.get('/templates', async (req, res) => {
  try {
    const { category, active } = req.query;
    const templates = await schemaOrchestrationService.listWorkflowTemplates(
      category as string,
      active ? active === 'true' : undefined
    );
    res.json(templates);
  } catch (error: any) {
    console.error('Error listing workflow templates:', error);
    res.status(500).json({ error: 'Failed to list workflow templates', message: error.message });
  }
});

// Update workflow template
router.patch('/templates/:id', async (req, res) => {
  try {
    const template = await schemaOrchestrationService.updateWorkflowTemplate(
      req.params.id,
      req.body
    );
    if (!template) {
      return res.status(404).json({ error: 'Workflow template not found' });
    }
    res.json(template);
  } catch (error: any) {
    console.error('Error updating workflow template:', error);
    res.status(500).json({ error: 'Failed to update workflow template', message: error.message });
  }
});

// Generate workflow from template
router.post('/templates/:id/generate-workflow', async (req, res) => {
  try {
    const workflow = await schemaOrchestrationService.generateWorkflowFromTemplate(
      req.params.id,
      req.body
    );
    res.status(201).json(workflow);
  } catch (error: any) {
    console.error('Error generating workflow from template:', error);
    res.status(500).json({ error: 'Failed to generate workflow', message: error.message });
  }
});

// Generate campaign from template
router.post('/templates/:id/generate-campaign', async (req, res) => {
  try {
    const campaign = await schemaOrchestrationService.generateCampaignFromTemplate(
      req.params.id,
      req.body
    );
    res.status(201).json(campaign);
  } catch (error: any) {
    console.error('Error generating campaign from template:', error);
    res.status(500).json({ error: 'Failed to generate campaign', message: error.message });
  }
});

// ===== SCHEMA LINKS =====

// Create schema link
router.post('/links', async (req, res) => {
  try {
    const { source_schema_id, target_schema_id, link_type, link_config } = req.body;
    const link = await schemaOrchestrationService.linkSchemas(
      source_schema_id,
      target_schema_id,
      link_type,
      link_config
    );
    res.status(201).json(link);
  } catch (error: any) {
    console.error('Error creating schema link:', error);
    res.status(500).json({ error: 'Failed to create schema link', message: error.message });
  }
});

// Get linked schemas
router.get('/links/:schema_id', async (req, res) => {
  try {
    const { link_type } = req.query;
    const links = await schemaOrchestrationService.getLinkedSchemas(
      req.params.schema_id,
      link_type as string
    );
    res.json(links);
  } catch (error: any) {
    console.error('Error getting linked schemas:', error);
    res.status(500).json({ error: 'Failed to get linked schemas', message: error.message });
  }
});

// Get schema map
router.get('/maps/:schema_id', async (req, res) => {
  try {
    const { max_depth } = req.query;
    const map = await schemaOrchestrationService.getSchemaMap(
      req.params.schema_id,
      max_depth ? parseInt(max_depth as string) : 3
    );
    res.json(map);
  } catch (error: any) {
    console.error('Error getting schema map:', error);
    res.status(500).json({ error: 'Failed to get schema map', message: error.message });
  }
});

// ===== SCHEMA HIERARCHIES =====

// Create schema hierarchy
router.post('/hierarchies', async (req, res) => {
  try {
    const hierarchy = await schemaOrchestrationService.createSchemaHierarchy(req.body);
    res.status(201).json(hierarchy);
  } catch (error: any) {
    console.error('Error creating schema hierarchy:', error);
    res.status(500).json({ error: 'Failed to create schema hierarchy', message: error.message });
  }
});

// Get schema hierarchy
router.get('/hierarchies/:id', async (req, res) => {
  try {
    const hierarchy = await schemaOrchestrationService.getSchemaHierarchy(req.params.id);
    if (!hierarchy) {
      return res.status(404).json({ error: 'Schema hierarchy not found' });
    }
    res.json(hierarchy);
  } catch (error: any) {
    console.error('Error getting schema hierarchy:', error);
    res.status(500).json({ error: 'Failed to get schema hierarchy', message: error.message });
  }
});

// Get hierarchies by use case
router.get('/hierarchies/use-case/:use_case', async (req, res) => {
  try {
    const hierarchies = await schemaOrchestrationService.getHierarchiesByUseCase(
      req.params.use_case
    );
    res.json(hierarchies);
  } catch (error: any) {
    console.error('Error getting hierarchies by use case:', error);
    res.status(500).json({ error: 'Failed to get hierarchies', message: error.message });
  }
});

// ===== WORKFLOW SIMULATIONS =====

// Simulate workflow
router.post('/workflows/:id/simulate', async (req, res) => {
  try {
    const simulation = await schemaOrchestrationService.simulateWorkflow(
      req.params.id,
      req.body
    );
    res.status(201).json(simulation);
  } catch (error: any) {
    console.error('Error simulating workflow:', error);
    res.status(500).json({ error: 'Failed to simulate workflow', message: error.message });
  }
});

// Get workflow simulations
router.get('/workflows/:id/simulations', async (req, res) => {
  try {
    const simulations = await schemaOrchestrationService.getWorkflowSimulations(req.params.id);
    res.json(simulations);
  } catch (error: any) {
    console.error('Error getting workflow simulations:', error);
    res.status(500).json({ error: 'Failed to get simulations', message: error.message });
  }
});

// ===== MCP SERVERS =====

// Register MCP server
router.post('/mcp-servers', async (req, res) => {
  try {
    const server = await mcpServerService.registerMCPServer(req.body);
    res.status(201).json(server);
  } catch (error: any) {
    console.error('Error registering MCP server:', error);
    res.status(500).json({ error: 'Failed to register MCP server', message: error.message });
  }
});

// Get MCP server
router.get('/mcp-servers/:id', async (req, res) => {
  try {
    const server = await mcpServerService.getMCPServer(req.params.id);
    if (!server) {
      return res.status(404).json({ error: 'MCP server not found' });
    }
    res.json(server);
  } catch (error: any) {
    console.error('Error getting MCP server:', error);
    res.status(500).json({ error: 'Failed to get MCP server', message: error.message });
  }
});

// List MCP servers
router.get('/mcp-servers', async (req, res) => {
  try {
    const { status } = req.query;
    const servers = await mcpServerService.listMCPServers(status as string);
    res.json(servers);
  } catch (error: any) {
    console.error('Error listing MCP servers:', error);
    res.status(500).json({ error: 'Failed to list MCP servers', message: error.message });
  }
});

// Update MCP server
router.patch('/mcp-servers/:id', async (req, res) => {
  try {
    const server = await mcpServerService.updateMCPServer(req.params.id, req.body);
    if (!server) {
      return res.status(404).json({ error: 'MCP server not found' });
    }
    res.json(server);
  } catch (error: any) {
    console.error('Error updating MCP server:', error);
    res.status(500).json({ error: 'Failed to update MCP server', message: error.message });
  }
});

// Delete MCP server
router.delete('/mcp-servers/:id', async (req, res) => {
  try {
    const deleted = await mcpServerService.deleteMCPServer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'MCP server not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting MCP server:', error);
    res.status(500).json({ error: 'Failed to delete MCP server', message: error.message });
  }
});

// Discover capabilities
router.post('/mcp-servers/:id/discover', async (req, res) => {
  try {
    const capabilities = await mcpServerService.discoverCapabilities(req.params.id);
    res.json(capabilities);
  } catch (error: any) {
    console.error('Error discovering capabilities:', error);
    res.status(500).json({ error: 'Failed to discover capabilities', message: error.message });
  }
});

// Get server capabilities
router.get('/mcp-servers/:id/capabilities', async (req, res) => {
  try {
    const { type } = req.query;
    const capabilities = await mcpServerService.getServerCapabilities(
      req.params.id,
      type as string
    );
    res.json(capabilities);
  } catch (error: any) {
    console.error('Error getting server capabilities:', error);
    res.status(500).json({ error: 'Failed to get capabilities', message: error.message });
  }
});

// Execute MCP tool
router.post('/mcp-servers/:id/execute/:tool_name', async (req, res) => {
  try {
    const result = await mcpServerService.executeMCPTool(
      req.params.id,
      req.params.tool_name,
      req.body
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error executing MCP tool:', error);
    res.status(500).json({ error: 'Failed to execute tool', message: error.message });
  }
});

// Check server health
router.post('/mcp-servers/:id/health', async (req, res) => {
  try {
    const health = await mcpServerService.checkServerHealth(req.params.id);
    res.json(health);
  } catch (error: any) {
    console.error('Error checking server health:', error);
    res.status(500).json({ error: 'Failed to check health', message: error.message });
  }
});

// Check all servers health
router.get('/mcp-servers/health/all', async (req, res) => {
  try {
    const health = await mcpServerService.checkAllServersHealth();
    res.json(health);
  } catch (error: any) {
    console.error('Error checking all servers health:', error);
    res.status(500).json({ error: 'Failed to check health', message: error.message });
  }
});

export default router;
