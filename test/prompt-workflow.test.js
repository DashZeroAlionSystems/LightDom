/**
 * Prompt Workflow Tests
 * 
 * Comprehensive tests for schema-based prompt workflows
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PromptTestSuite,
  PromptValidator,
  MockPromptEngine,
  assertions,
  PromptTestResult
} from '../services/prompt-testing-utilities.js';
import { SchemaBasedWorkflowTemplates, WorkflowTemplateRegistry } from '../schemas/schema-based-workflow-templates.js';

describe('Prompt Testing Utilities', () => {
  describe('PromptValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new PromptValidator();
    });

    describe('validateTemplate', () => {
      it('should validate a valid template', () => {
        const template = {
          id: 'test-template',
          name: 'Test Template',
          template: 'Hello {{name}}, you are {{age}} years old.',
          variables: [
            { name: 'name', type: 'string', required: true },
            { name: 'age', type: 'number', required: true }
          ]
        };

        const result = validator.validateTemplate(template);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect missing required fields', () => {
        const template = {
          name: 'Test Template'
        };

        const result = validator.validateTemplate(template);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing required field: id');
        expect(result.errors).toContain('Missing required field: template');
      });

      it('should detect undeclared variables', () => {
        const template = {
          id: 'test-template',
          name: 'Test Template',
          template: 'Hello {{name}}, {{undeclared}}',
          variables: [{ name: 'name', type: 'string' }]
        };

        const result = validator.validateTemplate(template);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('undeclared'))).toBe(true);
      });

      it('should detect unused declared variables', () => {
        const template = {
          id: 'test-template',
          name: 'Test Template',
          template: 'Hello {{name}}',
          variables: [
            { name: 'name', type: 'string' },
            { name: 'unused', type: 'string' }
          ]
        };

        const result = validator.validateTemplate(template);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('unused'))).toBe(true);
      });

      it('should validate output schema', () => {
        const template = {
          id: 'test-template',
          name: 'Test Template',
          template: 'Generate output',
          outputSchema: {
            type: 'object',
            properties: {
              result: { type: 'string' }
            }
          }
        };

        const result = validator.validateTemplate(template);
        expect(result.valid).toBe(true);
      });
    });

    describe('validateOutput', () => {
      it('should validate output against schema', () => {
        const schema = {
          type: 'object',
          required: ['name', 'score'],
          properties: {
            name: { type: 'string' },
            score: { type: 'number', minimum: 0, maximum: 100 }
          }
        };

        const validOutput = { name: 'Test', score: 85 };
        const result = validator.validateOutput(validOutput, schema);
        expect(result.valid).toBe(true);
      });

      it('should detect schema violations', () => {
        const schema = {
          type: 'object',
          required: ['name', 'score'],
          properties: {
            name: { type: 'string' },
            score: { type: 'number', minimum: 0, maximum: 100 }
          }
        };

        const invalidOutput = { name: 'Test', score: 150 };
        const result = validator.validateOutput(invalidOutput, schema);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should detect missing required fields', () => {
        const schema = {
          type: 'object',
          required: ['name', 'score'],
          properties: {
            name: { type: 'string' },
            score: { type: 'number' }
          }
        };

        const invalidOutput = { name: 'Test' };
        const result = validator.validateOutput(invalidOutput, schema);
        expect(result.valid).toBe(false);
      });
    });

    describe('validateVariables', () => {
      it('should validate required variables', () => {
        const definitions = [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: true }
        ];

        const result = validator.validateVariables({ name: 'John', age: 30 }, definitions);
        expect(result.valid).toBe(true);
      });

      it('should detect missing required variables', () => {
        const definitions = [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: true }
        ];

        const result = validator.validateVariables({ name: 'John' }, definitions);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('age'))).toBe(true);
      });

      it('should validate variable types', () => {
        const definitions = [
          { name: 'count', type: 'number', required: true }
        ];

        const result = validator.validateVariables({ count: 'not a number' }, definitions);
        expect(result.valid).toBe(false);
      });

      it('should validate string length constraints', () => {
        const definitions = [
          {
            name: 'code',
            type: 'string',
            required: true,
            validation: { minLength: 3, maxLength: 10 }
          }
        ];

        expect(validator.validateVariables({ code: 'ab' }, definitions).valid).toBe(false);
        expect(validator.validateVariables({ code: 'abc' }, definitions).valid).toBe(true);
        expect(validator.validateVariables({ code: 'verylongcode' }, definitions).valid).toBe(false);
      });
    });
  });

  describe('MockPromptEngine', () => {
    let mockEngine;

    beforeEach(() => {
      mockEngine = new MockPromptEngine();
    });

    it('should register and retrieve templates', () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        template: 'Hello {{name}}'
      };

      mockEngine.registerTemplate(template);
      const prompt = mockEngine.generatePrompt('test-template', { name: 'World' });
      expect(prompt).toBe('Hello World');
    });

    it('should track call history', () => {
      mockEngine.registerTemplate({
        id: 'test-template',
        template: 'Test {{var}}'
      });

      mockEngine.generatePrompt('test-template', { var: 'value1' });
      mockEngine.generatePrompt('test-template', { var: 'value2' });

      const calls = mockEngine.getCalls();
      expect(calls).toHaveLength(2);
      expect(calls[0].variables.var).toBe('value1');
      expect(calls[1].variables.var).toBe('value2');
    });

    it('should support mock responses', () => {
      mockEngine.setMockResponse('test-template', { result: 'mocked' });
      const response = mockEngine.getMockResponse('test-template');
      expect(response).toEqual({ result: 'mocked' });
    });

    it('should assert template was called', () => {
      mockEngine.registerTemplate({
        id: 'test-template',
        template: 'Test {{var}}'
      });

      mockEngine.generatePrompt('test-template', { var: 'expected' });

      expect(() => mockEngine.assertCalled('test-template', { var: 'expected' })).not.toThrow();
      expect(() => mockEngine.assertCalled('uncalled-template')).toThrow();
    });

    it('should handle object variables', () => {
      mockEngine.registerTemplate({
        id: 'test-template',
        template: 'Data: {{data}}'
      });

      const prompt = mockEngine.generatePrompt('test-template', {
        data: { key: 'value', nested: { inner: true } }
      });

      expect(prompt).toContain('"key":"value"');
      expect(prompt).toContain('"nested"');
    });
  });

  describe('PromptTestSuite', () => {
    let testSuite;
    let mockEngine;

    beforeEach(() => {
      testSuite = new PromptTestSuite({ name: 'Test Suite' });
      mockEngine = new MockPromptEngine();
    });

    it('should add and run tests', async () => {
      mockEngine.registerTemplate({
        id: 'simple-template',
        template: 'Hello {{name}}'
      });
      mockEngine.setMockResponse('simple-template', { greeting: 'Hello World' });

      testSuite.setMockResponse('simple-template', { greeting: 'Hello World' });
      testSuite.addTest({
        name: 'Simple Test',
        templateId: 'simple-template',
        variables: { name: 'World' },
        outputSchema: {
          type: 'object',
          properties: { greeting: { type: 'string' } }
        }
      });

      const summary = await testSuite.runAll(mockEngine);
      expect(summary.totalTests).toBe(1);
      expect(summary.passed).toBe(1);
      expect(summary.passRate).toBe(100);
    });

    it('should detect test failures', async () => {
      testSuite.setMockResponse('failing-template', { invalid: 123 });
      testSuite.addTest({
        name: 'Failing Test',
        templateId: 'failing-template',
        outputSchema: {
          type: 'object',
          required: ['requiredField'],
          properties: { requiredField: { type: 'string' } }
        }
      });

      const summary = await testSuite.runAll();
      expect(summary.failed).toBe(1);
      expect(summary.passRate).toBe(0);
    });

    it('should run custom assertions', async () => {
      testSuite.setMockResponse('assertion-template', { score: 85 });
      testSuite.addTest({
        name: 'Assertion Test',
        templateId: 'assertion-template',
        assertions: [
          assertions.hasProperty('score'),
          (output) => output.score >= 80
        ]
      });

      const summary = await testSuite.runAll();
      expect(summary.passed).toBe(1);
    });

    it('should emit events during test run', async () => {
      const events = [];
      testSuite.on('suite-start', (data) => events.push({ type: 'start', data }));
      testSuite.on('test-complete', (data) => events.push({ type: 'test', data }));
      testSuite.on('suite-complete', (data) => events.push({ type: 'complete', data }));

      testSuite.setMockResponse('event-template', { result: 'ok' });
      testSuite.addTest({
        name: 'Event Test',
        templateId: 'event-template'
      });

      await testSuite.runAll();

      expect(events.some(e => e.type === 'start')).toBe(true);
      expect(events.some(e => e.type === 'test')).toBe(true);
      expect(events.some(e => e.type === 'complete')).toBe(true);
    });
  });

  describe('Assertions', () => {
    it('hasProperty should check nested properties', () => {
      const output = { level1: { level2: { value: 'test' } } };
      expect(assertions.hasProperty('level1.level2.value')(output)).toBe(true);
      expect(assertions.hasProperty('level1.missing')(output)).toBe(false);
    });

    it('propertyEquals should compare values', () => {
      const output = { name: 'test', count: 5 };
      expect(assertions.propertyEquals('name', 'test')(output)).toBe(true);
      expect(assertions.propertyEquals('count', 5)(output)).toBe(true);
      expect(assertions.propertyEquals('count', 10)(output)).toBe(false);
    });

    it('propertyMatches should match patterns', () => {
      const output = { email: 'test@example.com' };
      expect(assertions.propertyMatches('email', '@example\\.com$')(output)).toBe(true);
      expect(assertions.propertyMatches('email', '@other\\.com$')(output)).toBe(false);
    });

    it('arrayHasLength should check array lengths', () => {
      const output = { items: [1, 2, 3, 4, 5] };
      expect(assertions.arrayHasLength('items', 3, 10)(output)).toBe(true);
      expect(assertions.arrayHasLength('items', 6)(output)).toBe(false);
      expect(assertions.arrayHasLength('items', undefined, 4)(output)).toBe(false);
    });

    it('isValidJSON should validate JSON', () => {
      expect(assertions.isValidJSON()({ valid: 'object' })).toBe(true);
      expect(assertions.isValidJSON()('{"valid": "json"}')).toBe(true);
      expect(assertions.isValidJSON()('not json')).toBe(false);
    });
  });

  describe('PromptTestResult', () => {
    it('should create test result with all properties', () => {
      const result = new PromptTestResult('test-template', true, {
        executionTime: 150,
        output: { data: 'test' },
        rawResponse: '{"data": "test"}'
      });

      expect(result.passed).toBe(true);
      expect(result.executionTime).toBe(150);
      expect(result.output).toEqual({ data: 'test' });
      expect(result.timestamp).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const result = new PromptTestResult('test-template', false, {
        executionTime: 100,
        validationErrors: [{ message: 'Invalid output' }],
        error: new Error('Test error')
      });

      const json = result.toJSON();
      expect(json.passed).toBe(false);
      expect(json.error).toBe('Test error');
      expect(json.validationErrors).toHaveLength(1);
    });
  });
});

describe('Schema-Based Workflow Templates', () => {
  describe('WorkflowTemplateRegistry', () => {
    let registry;

    beforeEach(() => {
      registry = new WorkflowTemplateRegistry();
    });

    it('should have all predefined templates', () => {
      const templateIds = registry.listTemplateIds();
      expect(templateIds).toContain('workflow-prompt-code-review');
      expect(templateIds).toContain('workflow-prompt-seo-analysis');
      expect(templateIds).toContain('workflow-prompt-data-extraction');
      expect(templateIds).toContain('workflow-prompt-component-generation');
      expect(templateIds).toContain('workflow-prompt-test-generation');
      expect(templateIds).toContain('workflow-prompt-optimization');
    });

    it('should retrieve template by ID', () => {
      const template = registry.getTemplate('workflow-prompt-code-review');
      expect(template).toBeDefined();
      expect(template.name).toBe('Code Review Workflow');
      expect(template.category).toBe('code-review');
    });

    it('should filter templates by category', () => {
      const seoTemplates = registry.getTemplatesByCategory('seo-analysis');
      expect(seoTemplates.length).toBeGreaterThan(0);
      expect(seoTemplates.every(t => t.category === 'seo-analysis')).toBe(true);
    });

    it('should register custom templates', () => {
      const customTemplate = {
        id: 'custom-template',
        name: 'Custom Template',
        template: 'Custom prompt: {{input}}',
        category: 'custom'
      };

      registry.registerTemplate(customTemplate);
      const retrieved = registry.getTemplate('custom-template');
      expect(retrieved).toEqual(customTemplate);
    });
  });

  describe('Template Validation', () => {
    let validator;

    beforeEach(() => {
      validator = new PromptValidator();
    });

    it('should validate all predefined templates', () => {
      const templates = Object.values(SchemaBasedWorkflowTemplates);
      
      for (const template of templates) {
        const result = validator.validateTemplate(template);
        expect(result.valid).toBe(true);
      }
    });

    it('should have valid output schemas for all templates', () => {
      const templates = Object.values(SchemaBasedWorkflowTemplates);
      
      for (const template of templates) {
        if (template.outputSchema) {
          // Verify schema can be compiled
          expect(() => {
            const ajv = new (require('ajv').default)({ strict: false });
            ajv.compile(template.outputSchema);
          }).not.toThrow();
        }
      }
    });
  });

  describe('Template Execution Simulation', () => {
    let mockEngine;
    let testSuite;

    beforeEach(() => {
      mockEngine = new MockPromptEngine();
      testSuite = new PromptTestSuite({ name: 'Template Tests' });

      // Register all templates
      Object.values(SchemaBasedWorkflowTemplates).forEach(template => {
        mockEngine.registerTemplate(template);
      });
    });

    it('should execute code review template', async () => {
      const mockResponse = {
        overallScore: 8,
        summary: 'Good code quality',
        issues: [
          {
            severity: 'minor',
            type: 'style',
            line: 10,
            description: 'Missing semicolon',
            suggestion: 'Add semicolon'
          }
        ],
        strengths: ['Clean structure', 'Good naming'],
        recommendations: ['Add more comments']
      };

      testSuite.setMockResponse('workflow-prompt-code-review', mockResponse);
      testSuite.addTest({
        name: 'Code Review Test',
        templateId: 'workflow-prompt-code-review',
        variables: {
          language: 'typescript',
          code: 'const x = 1',
          criteria: 'best practices'
        },
        outputSchema: SchemaBasedWorkflowTemplates.codeReview.outputSchema
      });

      const summary = await testSuite.runAll(mockEngine);
      expect(summary.passed).toBe(1);
    });

    it('should execute SEO analysis template', async () => {
      const mockResponse = {
        seoScore: 75,
        technicalIssues: [
          {
            issue: 'Missing meta description',
            impact: 'high',
            fix: 'Add meta description tag'
          }
        ],
        contentOptimizations: [],
        schemaRecommendations: [],
        prioritizedActions: [
          {
            priority: 1,
            action: 'Add meta description',
            expectedImpact: 'Improved click-through rate'
          }
        ]
      };

      testSuite.setMockResponse('workflow-prompt-seo-analysis', mockResponse);
      testSuite.addTest({
        name: 'SEO Analysis Test',
        templateId: 'workflow-prompt-seo-analysis',
        variables: {
          pageData: { html: '<html></html>' },
          keywords: ['seo', 'optimization']
        },
        outputSchema: SchemaBasedWorkflowTemplates.seoAnalysis.outputSchema
      });

      const summary = await testSuite.runAll(mockEngine);
      expect(summary.passed).toBe(1);
    });

    it('should execute data extraction template', async () => {
      const mockResponse = {
        success: true,
        extractedData: { name: 'Test', value: 123 },
        confidence: 0.95,
        warnings: [],
        unmappedFields: []
      };

      testSuite.setMockResponse('workflow-prompt-data-extraction', mockResponse);
      testSuite.addTest({
        name: 'Data Extraction Test',
        templateId: 'workflow-prompt-data-extraction',
        variables: {
          sourceData: 'Name: Test, Value: 123',
          schema: { type: 'object' }
        },
        outputSchema: SchemaBasedWorkflowTemplates.dataExtraction.outputSchema
      });

      const summary = await testSuite.runAll(mockEngine);
      expect(summary.passed).toBe(1);
    });
  });
});
