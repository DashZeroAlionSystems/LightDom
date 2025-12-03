/**
 * Workflow Orchestration Service Unit Tests
 * Tests for the hierarchical workflow management system:
 * Campaigns → Workflows → Services → Data Streams → Attributes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock constants
const mockUUID = '12345678-1234-1234-1234-123456789012';
const mockRandomUUID = vi.fn(() => mockUUID);

// Mock crypto module
vi.mock('crypto', () => ({
  default: { randomUUID: mockRandomUUID },
  randomUUID: mockRandomUUID,
}));

// Import after mocks
import { WorkflowOrchestrationService } from '../../services/workflow-orchestration-service.js';

describe('Workflow Orchestration Service', () => {
  let service: WorkflowOrchestrationService;

  beforeEach(() => {
    service = new WorkflowOrchestrationService();
  });

  describe('Campaigns', () => {
    it('should create a new campaign', async () => {
      const campaign = await service.createCampaign({
        name: 'SEO Campaign',
        description: 'Test campaign for SEO mining',
      });

      expect(campaign).toBeDefined();
      expect(campaign.id).toContain('camp_');
      expect(campaign.name).toBe('SEO Campaign');
      expect(campaign.description).toBe('Test campaign for SEO mining');
      expect(campaign.status).toBe('draft');
      expect(campaign.triggers).toHaveLength(1);
      expect(campaign.triggers[0].type).toBe('manual');
    });

    it('should get a campaign by id', async () => {
      const created = await service.createCampaign({
        name: 'Test Campaign',
      });

      const retrieved = await service.getCampaign(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Campaign');
    });

    it('should return null for non-existent campaign', async () => {
      const result = await service.getCampaign('non_existent_id');
      expect(result).toBeNull();
    });

    it('should update a campaign', async () => {
      const created = await service.createCampaign({
        name: 'Original Name',
      });

      const updated = await service.updateCampaign(created.id, {
        name: 'Updated Name',
        status: 'active',
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.status).toBe('active');
    });

    it('should delete a campaign', async () => {
      const created = await service.createCampaign({
        name: 'To Delete',
      });

      const deleted = await service.deleteCampaign(created.id);
      expect(deleted).toBe(true);

      const retrieved = await service.getCampaign(created.id);
      expect(retrieved).toBeNull();
    });

    it('should list all campaigns', async () => {
      await service.createCampaign({ name: 'Campaign 1' });
      await service.createCampaign({ name: 'Campaign 2' });

      const campaigns = await service.listCampaigns();

      expect(campaigns.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Workflows', () => {
    let campaignId: string;

    beforeEach(async () => {
      const campaign = await service.createCampaign({
        name: 'Parent Campaign',
      });
      campaignId = campaign.id;
    });

    it('should create a workflow', async () => {
      const workflow = await service.createWorkflow({
        name: 'SEO Mining Workflow',
        description: 'Workflow for mining SEO data',
        campaignId,
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toContain('wf_');
      expect(workflow.name).toBe('SEO Mining Workflow');
      expect(workflow.campaignId).toBe(campaignId);
    });

    it('should create workflow with n8n-compatible triggers', async () => {
      const workflow = await service.createWorkflow({
        name: 'Scheduled Workflow',
        campaignId,
        triggers: [
          { type: 'schedule', enabled: true },
          { type: 'webhook', enabled: true },
          { type: 'cron', enabled: true, cron: '0 */6 * * *' },
        ],
      });

      expect(workflow.triggers).toHaveLength(3);
      expect(workflow.triggers[0].type).toBe('schedule');
      expect(workflow.triggers[2].cron).toBe('0 */6 * * *');
    });

    it('should get workflow with nested services', async () => {
      const workflow = await service.createWorkflow({
        name: 'Test Workflow',
        campaignId,
      });

      await service.createService({
        name: 'Test Service',
        workflowId: workflow.id,
      });

      const retrieved = await service.getWorkflow(workflow.id, {
        includeServices: true,
      });

      expect(retrieved?.services).toHaveLength(1);
    });

    it('should add workflow to campaign', async () => {
      const workflow = await service.createWorkflow({
        name: 'Standalone Workflow',
      });

      await service.addWorkflowToCampaign(workflow.id, campaignId);

      const updatedWorkflow = await service.getWorkflow(workflow.id);
      expect(updatedWorkflow?.campaignId).toBe(campaignId);
    });
  });

  describe('Services', () => {
    let workflowId: string;

    beforeEach(async () => {
      const workflow = await service.createWorkflow({
        name: 'Parent Workflow',
      });
      workflowId = workflow.id;
    });

    it('should create a service', async () => {
      const svc = await service.createService({
        name: 'SEO Data Mining API',
        description: 'Service for mining SEO data',
        workflowId,
        type: 'api',
        endpoint: 'https://api.example.com/seo',
      });

      expect(svc).toBeDefined();
      expect(svc.id).toContain('svc_');
      expect(svc.name).toBe('SEO Data Mining API');
      expect(svc.type).toBe('api');
      expect(svc.endpoint).toBe('https://api.example.com/seo');
    });

    it('should list services for a workflow', async () => {
      await service.createService({ name: 'Service 1', workflowId });
      await service.createService({ name: 'Service 2', workflowId });

      const services = await service.listServices({ workflowId });

      expect(services).toHaveLength(2);
    });
  });

  describe('Data Streams', () => {
    let serviceId: string;

    beforeEach(async () => {
      const svc = await service.createService({
        name: 'Parent Service',
      });
      serviceId = svc.id;
    });

    it('should create a data stream', async () => {
      const dataStream = await service.createDataStream({
        name: 'SEO Metrics Stream',
        description: 'Stream of SEO metrics data',
        serviceId,
        sourceType: 'api',
        destinationType: 'database',
      });

      expect(dataStream).toBeDefined();
      expect(dataStream.id).toContain('ds_');
      expect(dataStream.name).toBe('SEO Metrics Stream');
      expect(dataStream.sourceType).toBe('api');
      expect(dataStream.destinationType).toBe('database');
    });

    it('should get data stream with attributes', async () => {
      const dataStream = await service.createDataStream({
        name: 'Test Stream',
        serviceId,
      });

      await service.createAttribute({
        name: 'h1',
        label: 'H1 Heading',
        dataStreamId: dataStream.id,
        type: 'string',
      });

      const retrieved = await service.getDataStream(dataStream.id, {
        includeAttributes: true,
      });

      expect(retrieved?.attributes).toHaveLength(1);
    });
  });

  describe('Attributes', () => {
    let dataStreamId: string;

    beforeEach(async () => {
      const dataStream = await service.createDataStream({
        name: 'Parent Data Stream',
      });
      dataStreamId = dataStream.id;
    });

    it('should create an attribute', async () => {
      const attribute = await service.createAttribute({
        name: 'h1_text',
        label: 'H1 Text',
        description: 'The text content of H1 elements',
        dataStreamId,
        type: 'string',
        category: 'seo',
      });

      expect(attribute).toBeDefined();
      expect(attribute.id).toContain('attr_');
      expect(attribute.name).toBe('h1_text');
      expect(attribute.label).toBe('H1 Text');
      expect(attribute.category).toBe('seo');
    });

    it('should create attribute marked as generated by DeepSeek', async () => {
      const attribute = await service.createAttribute({
        name: 'ai_suggested',
        label: 'AI Suggested Attribute',
        dataStreamId,
        type: 'string',
        generatedByDeepSeek: true,
      });

      expect(attribute.generatedByDeepSeek).toBe(true);
    });

    it('should list attributes for a data stream', async () => {
      await service.createAttribute({ name: 'attr1', dataStreamId });
      await service.createAttribute({ name: 'attr2', dataStreamId });
      await service.createAttribute({ name: 'attr3', dataStreamId });

      const attributes = await service.listAttributes({ dataStreamId });

      expect(attributes).toHaveLength(3);
    });

    it('should filter attributes by category', async () => {
      await service.createAttribute({
        name: 'seo_attr',
        dataStreamId,
        category: 'seo',
      });
      await service.createAttribute({
        name: 'content_attr',
        dataStreamId,
        category: 'content',
      });

      const seoAttributes = await service.listAttributes({
        dataStreamId,
        category: 'seo',
      });

      expect(seoAttributes).toHaveLength(1);
      expect(seoAttributes[0].name).toBe('seo_attr');
    });
  });

  describe('DeepSeek Integration', () => {
    it('should suggest attributes for a topic', async () => {
      const suggestions = await service.suggestAttributes('h1');

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('name');
      expect(suggestions[0]).toHaveProperty('label');
      expect(suggestions[0]).toHaveProperty('type');
    });

    it('should suggest SEO-related attributes', async () => {
      const suggestions = await service.suggestAttributes('meta');

      const names = suggestions.map((s: { name: string }) => s.name);
      expect(names.some((n: string) => n.includes('meta'))).toBe(true);
    });

    it('should generate attributes for a data stream', async () => {
      const dataStream = await service.createDataStream({
        name: 'SEO Stream',
      });

      const generated = await service.generateAttributesForDataStream(
        dataStream.id,
        'seo'
      );

      expect(generated.length).toBeGreaterThan(0);
      expect(generated[0].generatedByDeepSeek).toBe(true);
    });
  });

  describe('Workflow Bundling', () => {
    it('should create a complete workflow bundle', async () => {
      const bundle = await service.createWorkflowBundle({
        name: 'SEO Mining Bundle',
        topics: ['h1', 'title', 'meta'],
        category: 'seo',
      });

      expect(bundle).toBeDefined();
      expect(bundle.campaign).toBeDefined();
      expect(bundle.workflow).toBeDefined();
      expect(bundle.service).toBeDefined();
      expect(bundle.dataStream).toBeDefined();
      expect(bundle.attributes.length).toBeGreaterThan(0);
    });

    it('should create bundle with custom options', async () => {
      const bundle = await service.createWorkflowBundle({
        name: 'Custom Bundle',
        topics: ['performance'],
        category: 'analytics',
        workflowTriggers: [
          { type: 'schedule', enabled: true },
          { type: 'webhook', enabled: true },
        ],
        campaignStatus: 'active',
      });

      expect(bundle.campaign.status).toBe('active');
      expect(bundle.workflow.triggers).toHaveLength(2);
    });

    it('should link all entities in the bundle', async () => {
      const bundle = await service.createWorkflowBundle({
        name: 'Linked Bundle',
        topics: ['links'],
        category: 'seo',
      });

      // Verify campaign contains workflow
      const campaign = await service.getCampaign(bundle.campaign.id, {
        includeWorkflows: true,
      });
      expect(campaign?.workflows?.some((w: { id: string }) => w.id === bundle.workflow.id)).toBe(true);

      // Verify workflow contains service
      const workflow = await service.getWorkflow(bundle.workflow.id, {
        includeServices: true,
      });
      expect(workflow?.services?.some((s: { id: string }) => s.id === bundle.service.id)).toBe(true);

      // Verify service contains data stream
      const svc = await service.getService(bundle.service.id, {
        includeDataStreams: true,
      });
      expect(svc?.dataStreams?.some((ds: { id: string }) => ds.id === bundle.dataStream.id)).toBe(true);

      // Verify data stream contains attributes
      const ds = await service.getDataStream(bundle.dataStream.id, {
        includeAttributes: true,
      });
      expect(ds?.attributes?.length).toBe(bundle.attributes.length);
    });
  });

  describe('Trigger Management', () => {
    it('should add trigger to workflow', async () => {
      const workflow = await service.createWorkflow({
        name: 'Trigger Test',
        triggers: [{ type: 'manual', enabled: true }],
      });

      const updated = await service.addTriggerToWorkflow(workflow.id, {
        type: 'webhook',
        enabled: true,
      });

      expect(updated?.triggers).toHaveLength(2);
    });

    it('should remove trigger from workflow', async () => {
      const workflow = await service.createWorkflow({
        name: 'Trigger Test',
        triggers: [
          { type: 'manual', enabled: true },
          { type: 'webhook', enabled: true },
        ],
      });

      const updated = await service.removeTriggerFromWorkflow(
        workflow.id,
        'webhook'
      );

      expect(updated?.triggers).toHaveLength(1);
      expect(updated?.triggers[0].type).toBe('manual');
    });

    it('should validate n8n-compatible trigger types', async () => {
      const validTypes = ['manual', 'schedule', 'webhook', 'event', 'cron', 'on_demand'];

      for (const triggerType of validTypes) {
        const workflow = await service.createWorkflow({
          name: `${triggerType} workflow`,
          triggers: [{ type: triggerType, enabled: true }],
        });

        expect(workflow.triggers[0].type).toBe(triggerType);
      }
    });
  });

  describe('Statistics', () => {
    it('should return entity statistics', async () => {
      // Create some test data
      await service.createCampaign({ name: 'Test Campaign' });
      await service.createWorkflow({ name: 'Test Workflow' });
      await service.createService({ name: 'Test Service' });
      await service.createDataStream({ name: 'Test Data Stream' });
      await service.createAttribute({ name: 'test_attr' });

      const stats = await service.getStatistics();

      expect(stats.campaigns).toBeGreaterThanOrEqual(1);
      expect(stats.workflows).toBeGreaterThanOrEqual(1);
      expect(stats.services).toBeGreaterThanOrEqual(1);
      expect(stats.dataStreams).toBeGreaterThanOrEqual(1);
      expect(stats.attributes).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Entity Deletion Cascade', () => {
    it('should cascade delete workflow services when deleting workflow', async () => {
      const workflow = await service.createWorkflow({ name: 'To Delete' });
      const svc = await service.createService({
        name: 'Child Service',
        workflowId: workflow.id,
      });

      await service.deleteWorkflow(workflow.id, { cascade: true });

      const deletedService = await service.getService(svc.id);
      expect(deletedService).toBeNull();
    });

    it('should remove workflow from campaign when deleting', async () => {
      const campaign = await service.createCampaign({ name: 'Parent' });
      const workflow = await service.createWorkflow({
        name: 'Child',
        campaignId: campaign.id,
      });

      await service.deleteWorkflow(workflow.id);

      const updatedCampaign = await service.getCampaign(campaign.id, {
        includeWorkflows: true,
      });
      expect(updatedCampaign?.workflows).toHaveLength(0);
    });
  });
});
