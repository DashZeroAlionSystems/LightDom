/**
 * Workflow Creation Integration Tests
 * End-to-end tests for AI-powered workflow creation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const OLLAMA_URL = 'http://localhost:3001/api/ollama';

describe('Workflow Creation via AI', () => {
  let createdWorkflowId: string;

  beforeAll(async () => {
    // Verify services are running
    try {
      await axios.get(`${API_URL}/health`);
      await axios.get(`${OLLAMA_URL}/status`);
    } catch (error) {
      console.warn('Services may not be running. Some tests may fail.');
    }
  });

  afterAll(async () => {
    // Cleanup created workflow
    if (createdWorkflowId) {
      try {
        await axios.delete(`${API_URL}/workflows/${createdWorkflowId}`);
      } catch (error) {
        console.error('Failed to cleanup:', error);
      }
    }
  });

  it('should create a workflow via AI chat', async () => {
    const response = await axios.post(`${OLLAMA_URL}/chat`, {
      message: 'Create a simple workflow for portfolio optimization with 3 steps',
      tools: true,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('response');
    expect(response.data).toHaveProperty('tool_calls');

    // Check if create_workflow tool was called
    const workflowTool = response.data.tool_calls?.find(
      (call: any) => call.function.name === 'create_workflow'
    );

    expect(workflowTool).toBeDefined();
    
    if (workflowTool) {
      const args = JSON.parse(workflowTool.function.arguments);
      expect(args).toHaveProperty('name');
      expect(args).toHaveProperty('steps');
      expect(Array.isArray(args.steps)).toBe(true);
    }
  }, 30000);

  it('should create workflow with data mining campaign', async () => {
    const response = await axios.post(`${OLLAMA_URL}/chat`, {
      message: 'Create a workflow with data mining for market trends',
      tools: true,
    });

    expect(response.status).toBe(200);

    const miningTool = response.data.tool_calls?.find(
      (call: any) => call.function.name === 'create_data_mining_campaign'
    );

    expect(miningTool).toBeDefined();
  }, 30000);

  it('should add visual components to workflow', async () => {
    const response = await axios.post(`${OLLAMA_URL}/chat`, {
      message: 'Add a dashboard component to visualize portfolio data',
      tools: true,
    });

    expect(response.status).toBe(200);

    const componentTool = response.data.tool_calls?.find(
      (call: any) => call.function.name === 'add_workflow_component'
    );

    expect(componentTool).toBeDefined();
    
    if (componentTool) {
      const args = JSON.parse(componentTool.function.arguments);
      expect(args).toHaveProperty('componentType');
      expect(['chart', 'table', 'form', 'dashboard']).toContain(args.componentType);
    }
  }, 30000);

  it('should query database for workflows', async () => {
    const response = await axios.post(`${OLLAMA_URL}/chat`, {
      message: 'Show me all workflows that are currently enabled',
      tools: true,
    });

    expect(response.status).toBe(200);

    const queryTool = response.data.tool_calls?.find(
      (call: any) => call.function.name === 'query_database'
    );

    expect(queryTool).toBeDefined();
  }, 30000);

  it('should handle complex workflow creation', async () => {
    const response = await axios.post(`${OLLAMA_URL}/chat`, {
      message: `Create a comprehensive portfolio optimization workflow with:
        1. Data fetching step
        2. AI analysis step that depends on data
        3. Risk calculation step
        4. Blockchain transaction step
        Also add data mining for market trends and a dashboard to display results`,
      tools: true,
    });

    expect(response.status).toBe(200);
    expect(response.data.tool_calls).toBeDefined();
    expect(response.data.tool_calls.length).toBeGreaterThan(0);

    // Should call multiple tools
    const toolNames = response.data.tool_calls.map((call: any) => call.function.name);
    expect(toolNames).toContain('create_workflow');
  }, 60000);
});
