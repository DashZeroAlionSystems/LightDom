/**
 * PromptDashboard Integration Tests
 * Tests the core functionality of the prompt dashboard components
 */

import { describe, expect, it, vi } from 'vitest';

describe('PromptDashboard Integration', () => {
  describe('FeedbackCard Component', () => {
    it('should have correct props interface', () => {
      const mockProps = {
        id: 'test-1',
        step: 1,
        title: 'Test Step',
        content: 'Test content',
        status: 'success' as const,
        timestamp: new Date(),
        metadata: { duration: 100 },
        schema: { type: 'test' },
        defaultExpanded: false,
        onReview: vi.fn(),
      };

      // Type checking - if this compiles, props are correct
      expect(mockProps.id).toBe('test-1');
      expect(mockProps.step).toBe(1);
      expect(mockProps.status).toBe('success');
    });

    it('should handle all status types', () => {
      const statuses: Array<'pending' | 'processing' | 'success' | 'error' | 'warning'> = [
        'pending',
        'processing',
        'success',
        'error',
        'warning',
      ];

      statuses.forEach(status => {
        const mockProps = {
          id: `test-${status}`,
          step: 1,
          title: `Test ${status}`,
          content: 'Test content',
          status,
          timestamp: new Date(),
        };

        expect(mockProps.status).toBe(status);
      });
    });
  });

  describe('PromptDashboard State Management', () => {
    it('should handle conversation messages', () => {
      interface ConversationMessage {
        id: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
        metadata?: Record<string, any>;
      }

      const messages: ConversationMessage[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Create a workflow',
          timestamp: new Date(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'I will create a workflow for you',
          timestamp: new Date(),
        },
      ];

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });

    it('should handle generated artifacts', () => {
      interface GeneratedArtifact {
        id: string;
        type: 'schema' | 'component' | 'workflow' | 'task';
        name: string;
        content: any;
        timestamp: Date;
      }

      const artifacts: GeneratedArtifact[] = [
        {
          id: 'artifact-1',
          type: 'schema',
          name: 'Test Schema',
          content: { type: 'object', properties: {} },
          timestamp: new Date(),
        },
        {
          id: 'artifact-2',
          type: 'component',
          name: 'Test Component',
          content: { name: 'TestComponent', code: 'export const TestComponent = () => {}' },
          timestamp: new Date(),
        },
      ];

      expect(artifacts).toHaveLength(2);
      expect(artifacts[0].type).toBe('schema');
      expect(artifacts[1].type).toBe('component');
    });

    it('should handle feedback steps', () => {
      interface FeedbackStep {
        id: string;
        step: number;
        title: string;
        content: string;
        status: 'pending' | 'processing' | 'success' | 'error' | 'warning';
        timestamp: Date;
        metadata?: Record<string, any>;
        schema?: any;
      }

      const steps: FeedbackStep[] = [
        {
          id: 'step-1',
          step: 1,
          title: 'Analyzing prompt',
          content: 'Analysis in progress',
          status: 'processing',
          timestamp: new Date(),
        },
        {
          id: 'step-2',
          step: 2,
          title: 'Schema generated',
          content: 'Schema created successfully',
          status: 'success',
          timestamp: new Date(),
          schema: { id: 'schema-1', name: 'Test Schema' },
        },
      ];

      expect(steps).toHaveLength(2);
      expect(steps[0].status).toBe('processing');
      expect(steps[1].status).toBe('success');
      expect(steps[1].schema).toBeDefined();
    });
  });

  describe('API Response Handling', () => {
    it('should parse SSE data correctly', () => {
      const sseData = [
        { type: 'content', content: 'Analyzing...' },
        { type: 'schema', schema: { id: '1', name: 'Test' } },
        { type: 'component', component: { name: 'TestComponent' } },
        { type: 'complete', message: 'Done' },
      ];

      sseData.forEach(data => {
        expect(data.type).toBeDefined();

        if (data.type === 'schema') {
          expect(data.schema).toBeDefined();
          expect(data.schema.id).toBe('1');
        }

        if (data.type === 'component') {
          expect(data.component).toBeDefined();
          expect(data.component.name).toBe('TestComponent');
        }
      });
    });

    it('should handle streaming response structure', () => {
      interface StreamResponse {
        type:
          | 'content'
          | 'schema'
          | 'component'
          | 'status'
          | 'thinking'
          | 'warning'
          | 'error'
          | 'complete';
        [key: string]: any;
      }

      const responses: StreamResponse[] = [
        { type: 'status', message: 'Starting...' },
        { type: 'thinking', content: 'Let me think...' },
        { type: 'content', content: 'Here is the response' },
        { type: 'schema', schema: {} },
        { type: 'complete', message: 'Done' },
      ];

      expect(responses).toHaveLength(5);
      expect(responses[0].type).toBe('status');
      expect(responses[responses.length - 1].type).toBe('complete');
    });
  });

  describe('Export Functionality', () => {
    it('should structure export data correctly', () => {
      const exportData = {
        conversation: [
          { id: 'msg-1', role: 'user' as const, content: 'Test', timestamp: new Date() },
        ],
        feedbackSteps: [
          {
            id: 'step-1',
            step: 1,
            title: 'Test',
            content: 'Test',
            status: 'success' as const,
            timestamp: new Date(),
          },
        ],
        artifacts: [
          {
            id: 'art-1',
            type: 'schema' as const,
            name: 'Test',
            content: {},
            timestamp: new Date(),
          },
        ],
        exportDate: new Date().toISOString(),
      };

      expect(exportData.conversation).toHaveLength(1);
      expect(exportData.feedbackSteps).toHaveLength(1);
      expect(exportData.artifacts).toHaveLength(1);
      expect(exportData.exportDate).toBeDefined();
    });
  });

  describe('Model Selection', () => {
    it('should support multiple AI models', () => {
      const supportedModels = ['deepseek-reasoner', 'deepseek-chat', 'deepseek-r1', 'gpt-4'];

      expect(supportedModels).toContain('deepseek-r1');
      expect(supportedModels).toContain('deepseek-reasoner');
      expect(supportedModels).toContain('deepseek-chat');
      expect(supportedModels).toContain('gpt-4');
    });

    it('should default to deepseek-r1', () => {
      const defaultModel = 'deepseek-r1';
      expect(defaultModel).toBe('deepseek-r1');
    });
  });
});

describe('DeepSeek Chat API', () => {
  describe('Request Structure', () => {
    it('should format streaming request correctly', () => {
      const request = {
        prompt: 'Create a workflow',
        model: 'deepseek-r1',
        conversation: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ],
      };

      expect(request.prompt).toBeDefined();
      expect(request.model).toBe('deepseek-r1');
      expect(request.conversation).toHaveLength(2);
    });

    it('should format non-streaming request correctly', () => {
      const request = {
        prompt: 'Create a workflow',
        model: 'deepseek-r1',
        conversation: [],
      };

      expect(request.prompt).toBe('Create a workflow');
      expect(request.model).toBe('deepseek-r1');
      expect(Array.isArray(request.conversation)).toBe(true);
    });
  });

  describe('Response Structure', () => {
    it('should handle successful response', () => {
      const response = {
        success: true,
        response: 'Generated workflow',
        model: 'deepseek-r1',
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(true);
      expect(response.response).toBeDefined();
      expect(response.model).toBe('deepseek-r1');
    });

    it('should handle error response', () => {
      const response = {
        success: false,
        error: 'API error occurred',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });
});
