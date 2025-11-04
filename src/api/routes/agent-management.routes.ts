/**
 * Agent Management API Routes
 * RESTful API endpoints for agent sessions, instances, tools, services, workflows, campaigns, and data streams
 */

import express, { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { AgentManagementService } from '../../services/agent-management.service';

export function createAgentManagementRoutes(db: Pool): Router {
  const router = express.Router();
  const service = new AgentManagementService(db);

  // ============================================================================
  // AGENT SESSIONS
  // ============================================================================

  // Create a new agent session
  router.post('/sessions', async (req: Request, res: Response) => {
    try {
      const session = await service.createSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // Get session by ID
  router.get('/sessions/:session_id', async (req: Request, res: Response) => {
    try {
      const session = await service.getSession(req.params.session_id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  });

  // List all sessions
  router.get('/sessions', async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string,
        agent_type: req.query.agent_type as string
      };
      const sessions = await service.listSessions(filters);
      res.json(sessions);
    } catch (error) {
      console.error('Error listing sessions:', error);
      res.status(500).json({ error: 'Failed to list sessions' });
    }
  });

  // Update session
  router.patch('/sessions/:session_id', async (req: Request, res: Response) => {
    try {
      const session = await service.updateSession(req.params.session_id, req.body);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  });

  // Delete session
  router.delete('/sessions/:session_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteSession(req.params.session_id);
      if (!success) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  });

  // ============================================================================
  // AGENT INSTANCES
  // ============================================================================

  // Create agent instance
  router.post('/instances', async (req: Request, res: Response) => {
    try {
      const instance = await service.createInstance(req.body);
      res.status(201).json(instance);
    } catch (error) {
      console.error('Error creating instance:', error);
      res.status(500).json({ error: 'Failed to create instance' });
    }
  });

  // Get instance by ID
  router.get('/instances/:instance_id', async (req: Request, res: Response) => {
    try {
      const instance = await service.getInstance(req.params.instance_id);
      if (!instance) {
        return res.status(404).json({ error: 'Instance not found' });
      }
      res.json(instance);
    } catch (error) {
      console.error('Error getting instance:', error);
      res.status(500).json({ error: 'Failed to get instance' });
    }
  });

  // List instances
  router.get('/instances', async (req: Request, res: Response) => {
    try {
      const instances = await service.listInstances(req.query.session_id as string);
      res.json(instances);
    } catch (error) {
      console.error('Error listing instances:', error);
      res.status(500).json({ error: 'Failed to list instances' });
    }
  });

  // Update instance
  router.patch('/instances/:instance_id', async (req: Request, res: Response) => {
    try {
      const instance = await service.updateInstance(req.params.instance_id, req.body);
      if (!instance) {
        return res.status(404).json({ error: 'Instance not found' });
      }
      res.json(instance);
    } catch (error) {
      console.error('Error updating instance:', error);
      res.status(500).json({ error: 'Failed to update instance' });
    }
  });

  // Delete instance
  router.delete('/instances/:instance_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteInstance(req.params.instance_id);
      if (!success) {
        return res.status(404).json({ error: 'Instance not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting instance:', error);
      res.status(500).json({ error: 'Failed to delete instance' });
    }
  });

  // ============================================================================
  // AGENT MESSAGES
  // ============================================================================

  // Send message (prompt)
  router.post('/messages', async (req: Request, res: Response) => {
    try {
      const message = await service.sendMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get messages for session
  router.get('/messages/:session_id', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await service.getMessages(req.params.session_id, limit);
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // ============================================================================
  // TOOLS
  // ============================================================================

  // Create tool
  router.post('/tools', async (req: Request, res: Response) => {
    try {
      const tool = await service.createTool(req.body);
      res.status(201).json(tool);
    } catch (error) {
      console.error('Error creating tool:', error);
      res.status(500).json({ error: 'Failed to create tool' });
    }
  });

  // Get tool by ID
  router.get('/tools/:tool_id', async (req: Request, res: Response) => {
    try {
      const tool = await service.getTool(req.params.tool_id);
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      res.json(tool);
    } catch (error) {
      console.error('Error getting tool:', error);
      res.status(500).json({ error: 'Failed to get tool' });
    }
  });

  // List tools
  router.get('/tools', async (req: Request, res: Response) => {
    try {
      const filters = {
        category: req.query.category as string,
        service_type: req.query.service_type as string
      };
      const tools = await service.listTools(filters);
      res.json(tools);
    } catch (error) {
      console.error('Error listing tools:', error);
      res.status(500).json({ error: 'Failed to list tools' });
    }
  });

  // Update tool
  router.patch('/tools/:tool_id', async (req: Request, res: Response) => {
    try {
      const tool = await service.updateTool(req.params.tool_id, req.body);
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      res.json(tool);
    } catch (error) {
      console.error('Error updating tool:', error);
      res.status(500).json({ error: 'Failed to update tool' });
    }
  });

  // Delete tool
  router.delete('/tools/:tool_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteTool(req.params.tool_id);
      if (!success) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting tool:', error);
      res.status(500).json({ error: 'Failed to delete tool' });
    }
  });

  // ============================================================================
  // SERVICES
  // ============================================================================

  // Create service
  router.post('/services', async (req: Request, res: Response) => {
    try {
      const service_obj = await service.createService(req.body);
      res.status(201).json(service_obj);
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  // Get service by ID
  router.get('/services/:service_id', async (req: Request, res: Response) => {
    try {
      const service_obj = await service.getService(req.params.service_id);
      if (!service_obj) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service_obj);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({ error: 'Failed to get service' });
    }
  });

  // List services
  router.get('/services', async (req: Request, res: Response) => {
    try {
      const services = await service.listServices(req.query.category as string);
      res.json(services);
    } catch (error) {
      console.error('Error listing services:', error);
      res.status(500).json({ error: 'Failed to list services' });
    }
  });

  // Update service
  router.patch('/services/:service_id', async (req: Request, res: Response) => {
    try {
      const service_obj = await service.updateService(req.params.service_id, req.body);
      if (!service_obj) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service_obj);
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  // Delete service
  router.delete('/services/:service_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteService(req.params.service_id);
      if (!success) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // ============================================================================
  // WORKFLOWS
  // ============================================================================

  // Create workflow
  router.post('/workflows', async (req: Request, res: Response) => {
    try {
      const workflow = await service.createWorkflow(req.body);
      res.status(201).json(workflow);
    } catch (error) {
      console.error('Error creating workflow:', error);
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  });

  // Get workflow by ID
  router.get('/workflows/:workflow_id', async (req: Request, res: Response) => {
    try {
      const workflow = await service.getWorkflow(req.params.workflow_id);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      console.error('Error getting workflow:', error);
      res.status(500).json({ error: 'Failed to get workflow' });
    }
  });

  // List workflows
  router.get('/workflows', async (req: Request, res: Response) => {
    try {
      const filters = {
        workflow_type: req.query.workflow_type as string,
        is_template: req.query.is_template === 'true'
      };
      const workflows = await service.listWorkflows(filters);
      res.json(workflows);
    } catch (error) {
      console.error('Error listing workflows:', error);
      res.status(500).json({ error: 'Failed to list workflows' });
    }
  });

  // Update workflow
  router.patch('/workflows/:workflow_id', async (req: Request, res: Response) => {
    try {
      const workflow = await service.updateWorkflow(req.params.workflow_id, req.body);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      console.error('Error updating workflow:', error);
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  });

  // Delete workflow
  router.delete('/workflows/:workflow_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteWorkflow(req.params.workflow_id);
      if (!success) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      res.status(500).json({ error: 'Failed to delete workflow' });
    }
  });

  // Execute workflow
  router.post('/workflows/:workflow_id/execute', async (req: Request, res: Response) => {
    try {
      const execution = await service.executeWorkflow({
        workflow_id: req.params.workflow_id,
        input_data: req.body.input_data,
        execution_mode: req.body.execution_mode
      });
      res.status(201).json(execution);
    } catch (error) {
      console.error('Error executing workflow:', error);
      res.status(500).json({ error: 'Failed to execute workflow' });
    }
  });

  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  // Create campaign
  router.post('/campaigns', async (req: Request, res: Response) => {
    try {
      const campaign = await service.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  // Get campaign by ID
  router.get('/campaigns/:campaign_id', async (req: Request, res: Response) => {
    try {
      const campaign = await service.getCampaign(req.params.campaign_id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('Error getting campaign:', error);
      res.status(500).json({ error: 'Failed to get campaign' });
    }
  });

  // List campaigns
  router.get('/campaigns', async (req: Request, res: Response) => {
    try {
      const campaigns = await service.listCampaigns(req.query.status as string);
      res.json(campaigns);
    } catch (error) {
      console.error('Error listing campaigns:', error);
      res.status(500).json({ error: 'Failed to list campaigns' });
    }
  });

  // Update campaign
  router.patch('/campaigns/:campaign_id', async (req: Request, res: Response) => {
    try {
      const campaign = await service.updateCampaign(req.params.campaign_id, req.body);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  });

  // Delete campaign
  router.delete('/campaigns/:campaign_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteCampaign(req.params.campaign_id);
      if (!success) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  });

  // ============================================================================
  // DATA STREAMS
  // ============================================================================

  // Create data stream
  router.post('/data-streams', async (req: Request, res: Response) => {
    try {
      const stream = await service.createDataStream(req.body);
      res.status(201).json(stream);
    } catch (error) {
      console.error('Error creating data stream:', error);
      res.status(500).json({ error: 'Failed to create data stream' });
    }
  });

  // Get data stream by ID
  router.get('/data-streams/:stream_id', async (req: Request, res: Response) => {
    try {
      const stream = await service.getDataStream(req.params.stream_id);
      if (!stream) {
        return res.status(404).json({ error: 'Data stream not found' });
      }
      res.json(stream);
    } catch (error) {
      console.error('Error getting data stream:', error);
      res.status(500).json({ error: 'Failed to get data stream' });
    }
  });

  // List data streams
  router.get('/data-streams', async (req: Request, res: Response) => {
    try {
      const streams = await service.listDataStreams(req.query.campaign_id as string);
      res.json(streams);
    } catch (error) {
      console.error('Error listing data streams:', error);
      res.status(500).json({ error: 'Failed to list data streams' });
    }
  });

  // Update data stream
  router.patch('/data-streams/:stream_id', async (req: Request, res: Response) => {
    try {
      const stream = await service.updateDataStream(req.params.stream_id, req.body);
      if (!stream) {
        return res.status(404).json({ error: 'Data stream not found' });
      }
      res.json(stream);
    } catch (error) {
      console.error('Error updating data stream:', error);
      res.status(500).json({ error: 'Failed to update data stream' });
    }
  });

  // Delete data stream
  router.delete('/data-streams/:stream_id', async (req: Request, res: Response) => {
    try {
      const success = await service.deleteDataStream(req.params.stream_id);
      if (!success) {
        return res.status(404).json({ error: 'Data stream not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting data stream:', error);
      res.status(500).json({ error: 'Failed to delete data stream' });
    }
  });

  // ============================================================================
  // EXECUTIONS
  // ============================================================================

  // Get execution by ID
  router.get('/executions/:execution_id', async (req: Request, res: Response) => {
    try {
      const execution = await service.getExecution(req.params.execution_id);
      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }
      res.json(execution);
    } catch (error) {
      console.error('Error getting execution:', error);
      res.status(500).json({ error: 'Failed to get execution' });
    }
  });

  // List executions
  router.get('/executions', async (req: Request, res: Response) => {
    try {
      const filters = {
        session_id: req.query.session_id as string,
        status: req.query.status as string
      };
      const executions = await service.listExecutions(filters);
      res.json(executions);
    } catch (error) {
      console.error('Error listing executions:', error);
      res.status(500).json({ error: 'Failed to list executions' });
    }
  });

  return router;
}
