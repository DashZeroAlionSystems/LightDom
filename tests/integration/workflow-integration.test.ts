/**
 * Integration Tests for Workflow Wizard
 * 
 * This test suite validates the complete end-to-end workflow
 * for component generation using the Workflow Wizard.
 * 
 * Prerequisites:
 * - PostgreSQL database running
 * - Ollama service running with deepseek-r1:1.5b model
 * - API server running on port 3001
 */

import { describe, it, before, after, expect } from '@jest/globals';
import { Pool } from 'pg';
import { io as SocketIOClient, Socket } from 'socket.io-client';
import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';

describe('Workflow Wizard Integration Tests', () => {
  let db: Pool;
  let socket: Socket;
  let workflowId: string;

  before(async () => {
    // Setup database connection
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    // Test database connection
    await db.query('SELECT NOW()');

    // Setup WebSocket connection
    socket = SocketIOClient(WS_URL, {
      transports: ['websocket'],
    });

    await new Promise((resolve) => {
      socket.on('connect', resolve);
    });
  });

  after(async () => {
    // Cleanup
    if (socket) {
      socket.disconnect();
    }
    if (db) {
      await db.end();
    }
  });

  describe('Health Checks', () => {
    it('should return healthy status from API server', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      expect(response.ok).toBe(true);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.database).toBe('connected');
    });

    it('should have database tables created', async () => {
      const tables = ['content_entities', 'ai_interactions', 'schema_library'];
      
      for (const table of tables) {
        const result = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [table]);
        
        expect(result.rows[0].exists).toBe(true);
      }
    });

    it('should have component schemas loaded', async () => {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM schema_library'
      );
      
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThan(0);
      console.log(`  ✓ Found ${count} component schemas`);
    });
  });

  describe('Prompt Analysis', () => {
    it('should analyze a simple prompt', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflow/analyze-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a login form with email and password fields',
          model: 'deepseek-r1:1.5b'
        })
      });

      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config.componentName).toBeDefined();
      expect(result.config.componentType).toBeDefined();
      expect(result.config.baseComponents).toBeInstanceOf(Array);
      
      console.log(`  ✓ Analyzed prompt, suggested: ${result.config.componentName} (${result.config.componentType})`);
    });

    it('should handle complex prompts', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflow/analyze-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'I need a data grid component with sorting, filtering, and pagination. It should display user data with columns for name, email, role, and status.',
          model: 'deepseek-r1:1.5b'
        })
      });

      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.config.baseComponents.length).toBeGreaterThan(0);
      
      console.log(`  ✓ Complex prompt analyzed, ${result.config.baseComponents.length} base components suggested`);
    });
  });

  describe('Component Generation', () => {
    it('should generate a complete component', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflow/generate-component`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Simple contact form with name and email',
          componentName: 'ContactForm',
          componentType: 'molecule',
          baseComponents: ['ld:input', 'ld:button', 'ld:label'],
          requirements: {
            functionality: 'Contact form with validation',
            designSystem: 'Material Design 3'
          },
          model: 'deepseek-r1:1.5b'
        })
      });

      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(result.workflow.id).toBeDefined();
      expect(result.workflow.status).toBe('completed');
      expect(result.workflow.result).toBeDefined();
      expect(result.workflow.result.component).toBeDefined();
      
      workflowId = result.workflow.id;
      
      console.log(`  ✓ Component generated successfully (workflow: ${workflowId})`);
      console.log(`  ✓ Generated code length: ${result.workflow.result.component.length} characters`);
    }, 60000); // Increase timeout for AI generation

    it('should save workflow to database', async () => {
      expect(workflowId).toBeDefined();
      
      const result = await db.query(`
        SELECT * FROM content_entities 
        WHERE entity_type = 'ld:ComponentWorkflow' 
        AND entity_data->>'id' = $1
      `, [workflowId]);

      expect(result.rowCount).toBe(1);
      
      const workflow = result.rows[0];
      expect(workflow.entity_data.status).toBe('completed');
      expect(workflow.entity_data.componentName).toBe('ContactForm');
      
      console.log(`  ✓ Workflow persisted to database`);
    });
  });

  describe('Workflow Management', () => {
    it('should list all workflows', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflows`);
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.workflows).toBeInstanceOf(Array);
      expect(result.workflows.length).toBeGreaterThan(0);
      
      console.log(`  ✓ Found ${result.workflows.length} workflow(s)`);
    });

    it('should get workflow by ID', async () => {
      expect(workflowId).toBeDefined();
      
      const response = await fetch(`${API_BASE_URL}/api/workflows/${workflowId}`);
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(result.workflow.id).toBe(workflowId);
      expect(result.workflow.componentName).toBe('ContactForm');
      
      console.log(`  ✓ Retrieved workflow details`);
    });

    it('should filter workflows by status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflows?status=completed`);
      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.workflows).toBeInstanceOf(Array);
      
      // All workflows should be completed
      result.workflows.forEach((w: any) => {
        expect(w.status).toBe('completed');
      });
      
      console.log(`  ✓ Filtered workflows by status (${result.workflows.length} completed)`);
    });
  });

  describe('WebSocket Real-Time Updates', () => {
    it('should receive workflow status updates', (done) => {
      const testPromise = new Promise<void>(async (resolve, reject) => {
        // Listen for workflow updates
        socket.on('workflow:status', (data: any) => {
          console.log(`  ✓ Received WebSocket update:`, data);
          expect(data.workflowId).toBeDefined();
          expect(data.status).toBeDefined();
          resolve();
        });

        // Trigger a workflow to generate an event
        try {
          await fetch(`${API_BASE_URL}/api/workflow/generate-component`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'Simple button component',
              componentName: 'TestButton',
              componentType: 'atom',
              baseComponents: ['ld:button'],
              requirements: {
                functionality: 'Clickable button'
              },
              model: 'deepseek-r1:1.5b'
            })
          });
        } catch (error) {
          reject(error);
        }

        // Timeout after 30 seconds
        setTimeout(() => {
          reject(new Error('WebSocket update timeout'));
        }, 30000);
      });

      testPromise.then(() => done()).catch(done);
    }, 35000);
  });

  describe('Error Handling', () => {
    it('should handle invalid prompts gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflow/analyze-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: '',
          model: 'deepseek-r1:1.5b'
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle missing workflow ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflows/invalid-id`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle invalid component configuration', async () => {
      const response = await fetch(`${API_BASE_URL}/api/workflow/generate-component`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required fields
          componentName: 'TestComponent'
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent workflow requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 5; i++) {
        requests.push(
          fetch(`${API_BASE_URL}/api/workflow/analyze-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Test component ${i}`,
              model: 'deepseek-r1:1.5b'
            })
          })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach((response) => {
        expect(response.ok).toBe(true);
      });

      console.log(`  ✓ Processed 5 concurrent requests in ${duration}ms (avg: ${duration / 5}ms)`);
    }, 30000);
  });
});

// Export for use in test runner
export default describe;
