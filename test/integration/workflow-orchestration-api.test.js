/**
 * Integration tests for Workflow Orchestration API endpoints
 * Tests the complete hierarchy: Campaign → Workflow → Service → DataStream → Attribute
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('Workflow Orchestration API Integration Tests', () => {
  let testContext = {};

  describe('Campaign Management', () => {
    test('should create a campaign', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/campaigns`,
        {
          name: 'Test Campaign',
          description: 'Integration test campaign',
          status: 'draft'
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.campaign).toHaveProperty('id');
      expect(response.data.campaign.name).toBe('Test Campaign');
      
      testContext.campaignId = response.data.campaign.id;
    });

    test('should list campaigns', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/campaigns`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.campaigns)).toBe(true);
      expect(response.data.campaigns.length).toBeGreaterThan(0);
    });

    test('should get campaign by ID', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/campaigns/${testContext.campaignId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.campaign.id).toBe(testContext.campaignId);
    });

    test('should update campaign', async () => {
      const response = await axios.put(
        `${API_BASE_URL}/api/workflow-orchestration/campaigns/${testContext.campaignId}`,
        {
          status: 'active',
          description: 'Updated description'
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.campaign.status).toBe('active');
      expect(response.data.campaign.description).toBe('Updated description');
    });
  });

  describe('Workflow Management', () => {
    test('should create a workflow', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/workflows`,
        {
          campaignId: testContext.campaignId,
          name: 'Test Workflow',
          description: 'Integration test workflow',
          triggers: ['manual', 'schedule'],
          triggerConfig: {
            schedule: {
              cron: '0 * * * *',
              timezone: 'UTC'
            }
          },
          status: 'active'
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.workflow).toHaveProperty('id');
      expect(response.data.workflow.name).toBe('Test Workflow');
      expect(response.data.workflow.triggers).toContain('manual');
      
      testContext.workflowId = response.data.workflow.id;
    });

    test('should list workflows for campaign', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/workflows?campaignId=${testContext.campaignId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.workflows)).toBe(true);
      expect(response.data.workflows.length).toBeGreaterThan(0);
    });

    test('should execute workflow', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/workflows/${testContext.workflowId}/execute`
      );

      expect(response.status).toBe(200);
      expect(response.data.execution).toHaveProperty('id');
      expect(response.data.execution.status).toBe('running');
      
      testContext.executionId = response.data.execution.id;
    });

    test('should get workflow execution status', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/workflows/${testContext.workflowId}/executions/${testContext.executionId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.execution.id).toBe(testContext.executionId);
    });

    test('should stop workflow', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/workflows/${testContext.workflowId}/stop`
      );

      expect(response.status).toBe(200);
      expect(response.data.stopped).toBe(true);
    });
  });

  describe('Service Management', () => {
    test('should create a service', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/services`,
        {
          workflowId: testContext.workflowId,
          name: 'Test API Service',
          type: 'api',
          config: {
            endpoint: 'https://api.example.com/data',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.service).toHaveProperty('id');
      expect(response.data.service.name).toBe('Test API Service');
      expect(response.data.service.type).toBe('api');
      
      testContext.serviceId = response.data.service.id;
    });

    test('should list services for workflow', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/services?workflowId=${testContext.workflowId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.services)).toBe(true);
      expect(response.data.services.length).toBeGreaterThan(0);
    });

    test('should update service', async () => {
      const response = await axios.put(
        `${API_BASE_URL}/api/workflow-orchestration/services/${testContext.serviceId}`,
        {
          config: {
            endpoint: 'https://api.example.com/v2/data',
            method: 'POST'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.service.config.endpoint).toBe('https://api.example.com/v2/data');
    });
  });

  describe('Data Stream Management', () => {
    test('should create a data stream', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/data-streams`,
        {
          serviceId: testContext.serviceId,
          name: 'Test Data Stream',
          source: 'api',
          destination: 'database',
          transformations: [
            {
              type: 'map',
              field: 'name',
              operation: 'uppercase'
            }
          ]
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.dataStream).toHaveProperty('id');
      expect(response.data.dataStream.name).toBe('Test Data Stream');
      expect(response.data.dataStream.source).toBe('api');
      
      testContext.dataStreamId = response.data.dataStream.id;
    });

    test('should list data streams for service', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/data-streams?serviceId=${testContext.serviceId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.dataStreams)).toBe(true);
      expect(response.data.dataStreams.length).toBeGreaterThan(0);
    });

    test('should generate attributes with DeepSeek', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/data-streams/${testContext.dataStreamId}/generate-attributes`,
        {
          topic: 'user profile',
          count: 5
        }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.attributes)).toBe(true);
      expect(response.data.attributes.length).toBe(5);
      expect(response.data.attributes[0]).toHaveProperty('name');
      expect(response.data.attributes[0]).toHaveProperty('type');
      expect(response.data.attributes[0].generated_by).toBe('deepseek');
      
      testContext.generatedAttributes = response.data.attributes;
    });
  });

  describe('Attribute Management', () => {
    test('should create an attribute', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/attributes`,
        {
          dataStreamId: testContext.dataStreamId,
          name: 'user_id',
          type: 'string',
          description: 'Unique user identifier',
          validation: {
            required: true,
            pattern: '^[a-z0-9_]+$'
          },
          generated_by: 'manual'
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.attribute).toHaveProperty('id');
      expect(response.data.attribute.name).toBe('user_id');
      
      testContext.attributeId = response.data.attribute.id;
    });

    test('should list attributes for data stream', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/attributes?dataStreamId=${testContext.dataStreamId}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.attributes)).toBe(true);
      expect(response.data.attributes.length).toBeGreaterThan(0);
    });

    test('should get attribute suggestions', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/attributes/suggest`,
        {
          topic: 'product catalog',
          count: 3
        }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.suggestions)).toBe(true);
      expect(response.data.suggestions.length).toBe(3);
    });

    test('should update attribute', async () => {
      const response = await axios.put(
        `${API_BASE_URL}/api/workflow-orchestration/attributes/${testContext.attributeId}`,
        {
          description: 'Updated description',
          validation: {
            required: true,
            minLength: 5
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.attribute.description).toBe('Updated description');
    });

    test('should delete attribute', async () => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/workflow-orchestration/attributes/${testContext.attributeId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.deleted).toBe(true);
    });
  });

  describe('Workflow Bundles', () => {
    test('should create complete workflow bundle', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/workflow-orchestration/bundles`,
        {
          name: 'SEO Analysis Bundle',
          description: 'Complete SEO analysis workflow',
          topics: ['h1', 'meta', 'title'],
          category: 'seo',
          triggers: ['manual', 'schedule'],
          scheduleConfig: {
            cron: '0 2 * * *',
            timezone: 'UTC'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.bundle).toHaveProperty('campaign');
      expect(response.data.bundle).toHaveProperty('workflow');
      expect(response.data.bundle).toHaveProperty('service');
      expect(response.data.bundle).toHaveProperty('dataStream');
      expect(response.data.bundle).toHaveProperty('attributes');
      
      expect(Array.isArray(response.data.bundle.attributes)).toBe(true);
      expect(response.data.bundle.attributes.length).toBeGreaterThan(0);
      
      // Verify all attributes are generated by DeepSeek
      response.data.bundle.attributes.forEach(attr => {
        expect(attr.generated_by).toBe('deepseek');
      });
    });
  });

  describe('Statistics and Analytics', () => {
    test('should get system statistics', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/stats`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('campaigns');
      expect(response.data).toHaveProperty('workflows');
      expect(response.data).toHaveProperty('services');
      expect(response.data).toHaveProperty('dataStreams');
      expect(response.data).toHaveProperty('attributes');
      
      expect(response.data.campaigns).toBeGreaterThan(0);
      expect(response.data.workflows).toBeGreaterThan(0);
    });

    test('should get campaign analytics', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/workflow-orchestration/campaigns/${testContext.campaignId}/analytics`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('workflows');
      expect(response.data).toHaveProperty('executions');
      expect(response.data).toHaveProperty('successRate');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid campaign creation', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/workflow-orchestration/campaigns`,
          {
            // Missing required name field
            description: 'Test'
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    test('should handle non-existent campaign', async () => {
      try {
        await axios.get(
          `${API_BASE_URL}/api/workflow-orchestration/campaigns/nonexistent-id`
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    test('should handle invalid workflow triggers', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/workflow-orchestration/workflows`,
          {
            campaignId: testContext.campaignId,
            name: 'Invalid Workflow',
            triggers: ['invalid_trigger']
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Cleanup', () => {
    test('should delete data stream', async () => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/workflow-orchestration/data-streams/${testContext.dataStreamId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.deleted).toBe(true);
    });

    test('should delete service', async () => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/workflow-orchestration/services/${testContext.serviceId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.deleted).toBe(true);
    });

    test('should delete workflow', async () => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/workflow-orchestration/workflows/${testContext.workflowId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.deleted).toBe(true);
    });

    test('should delete campaign', async () => {
      const response = await axios.delete(
        `${API_BASE_URL}/api/workflow-orchestration/campaigns/${testContext.campaignId}`
      );

      expect(response.status).toBe(200);
      expect(response.data.deleted).toBe(true);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  const { execSync } = require('child_process');
  try {
    execSync('npx jest ' + __filename, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}

module.exports = {
  API_BASE_URL
};
