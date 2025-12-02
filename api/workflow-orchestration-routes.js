/**
 * Workflow Orchestration API Routes
 * 
 * REST API for managing the hierarchical workflow system:
 * Campaigns → Workflows → Services → Data Streams → Attributes
 * 
 * Features:
 * - Full CRUD for all entity types
 * - Hierarchical navigation
 * - DeepSeek integration for attribute suggestions
 * - Workflow bundling and auto-creation
 */

import express from 'express';
import { getWorkflowOrchestrationService } from '../services/workflow-orchestration-service.js';

const router = express.Router();

// Get service instance
const getService = () => getWorkflowOrchestrationService();

// ============================================================================
// CAMPAIGNS
// ============================================================================

/**
 * GET /api/workflow-orchestration/campaigns
 * List all campaigns
 */
router.get('/campaigns', async (req, res) => {
  try {
    const { status, search, includeWorkflows } = req.query;
    const campaigns = await getService().listCampaigns({ status, search });
    
    if (includeWorkflows === 'true') {
      for (const campaign of campaigns) {
        const full = await getService().getCampaign(campaign.id, { includeWorkflows: true });
        campaign.workflows = full.workflows;
      }
    }
    
    res.json({ success: true, campaigns, count: campaigns.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/campaigns
 * Create a new campaign
 */
router.post('/campaigns', async (req, res) => {
  try {
    const campaign = await getService().createCampaign(req.body);
    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow-orchestration/campaigns/:id
 * Get campaign by ID
 */
router.get('/campaigns/:id', async (req, res) => {
  try {
    const { includeWorkflows, deep } = req.query;
    const campaign = await getService().getCampaign(req.params.id, { 
      includeWorkflows: includeWorkflows === 'true',
      deep: deep === 'true'
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflow-orchestration/campaigns/:id
 * Update campaign
 */
router.put('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await getService().updateCampaign(req.params.id, req.body);
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/workflow-orchestration/campaigns/:id
 * Delete campaign
 */
router.delete('/campaigns/:id', async (req, res) => {
  try {
    const result = await getService().deleteCampaign(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/campaigns/:id/workflows
 * Add workflow to campaign
 */
router.post('/campaigns/:id/workflows', async (req, res) => {
  try {
    const { workflowId } = req.body;
    const result = await getService().addWorkflowToCampaign(req.params.id, workflowId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// WORKFLOWS
// ============================================================================

/**
 * GET /api/workflow-orchestration/workflows
 * List all workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const { campaignId, status, includeServices } = req.query;
    const workflows = await getService().listWorkflows({ campaignId, status });
    
    if (includeServices === 'true') {
      for (const workflow of workflows) {
        const full = await getService().getWorkflow(workflow.id, { includeServices: true });
        workflow.services = full.services;
      }
    }
    
    res.json({ success: true, workflows, count: workflows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/workflows
 * Create a new workflow
 */
router.post('/workflows', async (req, res) => {
  try {
    const workflow = await getService().createWorkflow(req.body);
    res.status(201).json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow-orchestration/workflows/:id
 * Get workflow by ID
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const { includeServices, deep } = req.query;
    const workflow = await getService().getWorkflow(req.params.id, {
      includeServices: includeServices === 'true',
      deep: deep === 'true'
    });
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflow-orchestration/workflows/:id
 * Update workflow
 */
router.put('/workflows/:id', async (req, res) => {
  try {
    const workflow = await getService().updateWorkflow(req.params.id, req.body);
    res.json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/workflow-orchestration/workflows/:id
 * Delete workflow
 */
router.delete('/workflows/:id', async (req, res) => {
  try {
    const result = await getService().deleteWorkflow(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/workflows/:id/start
 * Start workflow
 */
router.post('/workflows/:id/start', async (req, res) => {
  try {
    const workflow = await getService().startWorkflow(req.params.id);
    res.json({ success: true, workflow, message: 'Workflow started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/workflows/:id/stop
 * Stop workflow
 */
router.post('/workflows/:id/stop', async (req, res) => {
  try {
    const workflow = await getService().stopWorkflow(req.params.id);
    res.json({ success: true, workflow, message: 'Workflow stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/workflows/:id/execute
 * Execute workflow
 */
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const execution = await getService().executeWorkflow(req.params.id);
    res.json({ success: true, execution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflow-orchestration/workflows/:id/triggers/:triggerIndex
 * Update workflow trigger state
 */
router.put('/workflows/:id/triggers/:triggerIndex', async (req, res) => {
  try {
    const { enabled } = req.body;
    const workflow = await getService().setWorkflowTriggerState(
      req.params.id,
      parseInt(req.params.triggerIndex),
      enabled
    );
    res.json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SERVICES
// ============================================================================

/**
 * GET /api/workflow-orchestration/services
 * List all services
 */
router.get('/services', async (req, res) => {
  try {
    const { workflowId, type, includeDataStreams } = req.query;
    const services = await getService().listServices({ workflowId, type });
    
    if (includeDataStreams === 'true') {
      for (const service of services) {
        const full = await getService().getService(service.id, { includeDataStreams: true });
        service.dataStreams = full.dataStreams;
      }
    }
    
    res.json({ success: true, services, count: services.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/services
 * Create a new service
 */
router.post('/services', async (req, res) => {
  try {
    const service = await getService().createService(req.body);
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow-orchestration/services/:id
 * Get service by ID
 */
router.get('/services/:id', async (req, res) => {
  try {
    const { includeDataStreams, deep } = req.query;
    const service = await getService().getService(req.params.id, {
      includeDataStreams: includeDataStreams === 'true',
      deep: deep === 'true'
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflow-orchestration/services/:id
 * Update service
 */
router.put('/services/:id', async (req, res) => {
  try {
    const service = await getService().updateService(req.params.id, req.body);
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/workflow-orchestration/services/:id
 * Delete service
 */
router.delete('/services/:id', async (req, res) => {
  try {
    const result = await getService().deleteService(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// DATA STREAMS
// ============================================================================

/**
 * GET /api/workflow-orchestration/data-streams
 * List all data streams
 */
router.get('/data-streams', async (req, res) => {
  try {
    const { serviceId, sourceType, includeAttributes } = req.query;
    const dataStreams = await getService().listDataStreams({ serviceId, sourceType });
    
    if (includeAttributes === 'true') {
      for (const stream of dataStreams) {
        const full = await getService().getDataStream(stream.id, { includeAttributes: true });
        stream.attributes = full.attributes;
      }
    }
    
    res.json({ success: true, dataStreams, count: dataStreams.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/data-streams
 * Create a new data stream
 */
router.post('/data-streams', async (req, res) => {
  try {
    const dataStream = await getService().createDataStream(req.body);
    res.status(201).json({ success: true, dataStream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow-orchestration/data-streams/:id
 * Get data stream by ID
 */
router.get('/data-streams/:id', async (req, res) => {
  try {
    const { includeAttributes } = req.query;
    const dataStream = await getService().getDataStream(req.params.id, {
      includeAttributes: includeAttributes === 'true'
    });
    
    if (!dataStream) {
      return res.status(404).json({ error: 'Data stream not found' });
    }
    
    res.json({ success: true, dataStream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflow-orchestration/data-streams/:id
 * Update data stream
 */
router.put('/data-streams/:id', async (req, res) => {
  try {
    const dataStream = await getService().updateDataStream(req.params.id, req.body);
    res.json({ success: true, dataStream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/workflow-orchestration/data-streams/:id
 * Delete data stream
 */
router.delete('/data-streams/:id', async (req, res) => {
  try {
    const result = await getService().deleteDataStream(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ATTRIBUTES
// ============================================================================

/**
 * GET /api/workflow-orchestration/attributes
 * List all attributes
 */
router.get('/attributes', async (req, res) => {
  try {
    const { dataStreamId, category, type } = req.query;
    const attributes = await getService().listAttributes({ dataStreamId, category, type });
    res.json({ success: true, attributes, count: attributes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/attributes
 * Create a new attribute
 */
router.post('/attributes', async (req, res) => {
  try {
    const attribute = await getService().createAttribute(req.body);
    res.status(201).json({ success: true, attribute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow-orchestration/attributes/:id
 * Get attribute by ID
 */
router.get('/attributes/:id', async (req, res) => {
  try {
    const attribute = await getService().getAttribute(req.params.id);
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    res.json({ success: true, attribute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workflow-orchestration/attributes/:id
 * Update attribute
 */
router.put('/attributes/:id', async (req, res) => {
  try {
    const attribute = await getService().updateAttribute(req.params.id, req.body);
    res.json({ success: true, attribute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/workflow-orchestration/attributes/:id
 * Delete attribute
 */
router.delete('/attributes/:id', async (req, res) => {
  try {
    const result = await getService().deleteAttribute(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// DEEPSEEK INTEGRATION
// ============================================================================

/**
 * POST /api/workflow-orchestration/attributes/suggest
 * Get DeepSeek attribute suggestions for a topic
 */
router.post('/attributes/suggest', async (req, res) => {
  try {
    const { topic, category = 'seo' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const suggestions = await getService().suggestAttributesWithDeepSeek(topic, category);
    res.json({ success: true, suggestions, topic, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow-orchestration/data-streams/:id/generate-attributes
 * Generate attributes for a data stream using DeepSeek
 */
router.post('/data-streams/:id/generate-attributes', async (req, res) => {
  try {
    const { topic, category = 'seo' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const attributes = await getService().createAttributesFromSuggestions(
      req.params.id,
      topic,
      category
    );
    
    res.status(201).json({ success: true, attributes, count: attributes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// WORKFLOW BUNDLING
// ============================================================================

/**
 * POST /api/workflow-orchestration/bundles
 * Create a complete workflow bundle (Campaign → Workflow → Service → DataStream → Attributes)
 */
router.post('/bundles', async (req, res) => {
  try {
    const { name, description, topics, category, useDeepSeek } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const bundle = await getService().createWorkflowBundle({
      name,
      description,
      topics: topics || [],
      category: category || 'seo',
      useDeepSeek: useDeepSeek !== false
    });
    
    res.status(201).json({ success: true, bundle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * GET /api/workflow-orchestration/statistics
 * Get system statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const statistics = getService().getStatistics();
    res.json({ success: true, statistics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
