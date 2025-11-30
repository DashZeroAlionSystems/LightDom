/**
 * Linked Schema Workflow Integration Tests
 * 
 * Tests for:
 * - Neural relationship prediction
 * - Linked schema to n8n workflow conversion
 * - Training data generation
 * - Status indicator configurations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NeuralRelationshipPredictor, RELATIONSHIP_TYPES } from '../services/neural-relationship-predictor.js';
import LinkedSchemaN8nConverter from '../services/linked-schema-n8n-converter.js';
import { RelationshipTrainingGenerator, TRAINING_PATTERNS } from '../services/relationship-training-generator.js';

describe('Neural Relationship Predictor', () => {
  let predictor;

  beforeEach(() => {
    predictor = new NeuralRelationshipPredictor({
      confidenceThreshold: 0.6,
      maxRelationships: 20,
    });
  });

  describe('Relationship Prediction', () => {
    it('should predict relationships for button component', async () => {
      const buttonSchema = {
        type: 'button',
        name: 'Submit Button',
        category: 'action',
        onClick: true,
      };

      const relationships = await predictor.predictRelationships(buttonSchema);

      expect(relationships).toBeDefined();
      expect(relationships.length).toBeGreaterThan(0);
      
      // Should include click action
      const clickRel = relationships.find(r => r.type === RELATIONSHIP_TYPES.COMPONENT_CLICK);
      expect(clickRel).toBeDefined();
      expect(clickRel.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should predict status indicator relationships', async () => {
      const statusSchema = {
        type: 'service_status',
        name: 'API Status',
        status: 'success',
      };

      const relationships = await predictor.predictRelationships(statusSchema);

      expect(relationships).toBeDefined();
      
      // Should include icon relationship
      const iconRel = relationships.find(r => r.type === RELATIONSHIP_TYPES.COMPONENT_ICON);
      expect(iconRel).toBeDefined();
    });

    it('should apply context adjustments', async () => {
      const schema = { type: 'button', name: 'Test' };
      
      const defaultRels = await predictor.predictRelationships(schema);
      const animationRels = await predictor.predictRelationships(schema, { preferAnimations: true });
      
      // Animation relationships should have boosted confidence
      const animRel = animationRels.find(r => r.type === RELATIONSHIP_TYPES.COMPONENT_ANIMATION);
      if (animRel) {
        expect(animRel.contextAdjusted).toBe(true);
      }
    });
  });

  describe('Component Generation', () => {
    it('should generate functional component from relationships', async () => {
      const relationships = [
        { type: RELATIONSHIP_TYPES.COMPONENT_CLICK, target: 'onClick', confidence: 0.9 },
        { 
          type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION, 
          target: 'click_feedback',
          animejs: {
            targets: 'element',
            scale: [1, 0.95, 1],
            duration: 200,
          },
          confidence: 0.85,
        },
      ];

      const component = predictor.generateFunctionalComponent(relationships, {
        componentType: 'button',
        framework: 'react',
      });

      expect(component).toBeDefined();
      expect(component.code).toContain('import React');
      expect(component.code).toContain('anime');
      expect(component.type).toBe('button');
      expect(component.framework).toBe('react');
    });
  });

  describe('N8N Workflow Generation', () => {
    it('should generate n8n workflow from relationships', async () => {
      const relationships = [
        {
          type: RELATIONSHIP_TYPES.WORKFLOW_TRIGGER,
          target: 'webhook',
          n8n: {
            nodeType: 'n8n-nodes-base.webhook',
            parameters: { httpMethod: 'POST', path: 'test' },
          },
          confidence: 0.9,
        },
        {
          type: RELATIONSHIP_TYPES.WORKFLOW_ACTION,
          target: 'store',
          n8n: {
            nodes: [
              { type: 'n8n-nodes-base.function', name: 'Process' },
            ],
          },
          confidence: 0.85,
        },
      ];

      const workflow = predictor.generateN8nWorkflow(relationships, {
        workflowName: 'Test Workflow',
      });

      expect(workflow).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.nodes.length).toBeGreaterThan(0);
      expect(workflow.generatedFrom).toBe('neural-relationship-predictor');
    });
  });

  describe('Training', () => {
    it('should train with new examples', async () => {
      const examples = [
        {
          sourceType: 'custom_component',
          targetType: 'custom_action',
          relationship: { type: RELATIONSHIP_TYPES.COMPONENT_CLICK, target: 'custom_click' },
          correct: true,
        },
      ];

      const result = await predictor.train(examples);

      expect(result.success).toBe(true);
      expect(result.examplesAdded).toBe(1);
    });
  });

  describe('Metrics', () => {
    it('should track metrics', async () => {
      const schema = { type: 'button', name: 'Test' };
      await predictor.predictRelationships(schema);

      const metrics = predictor.getMetrics();

      expect(metrics.predictionsGenerated).toBeGreaterThan(0);
      expect(metrics.patternsCount).toBeGreaterThan(0);
    });
  });

  describe('Import/Export', () => {
    it('should export and import training data', async () => {
      const examples = [
        {
          sourceType: 'test',
          targetType: 'test_action',
          relationship: { type: RELATIONSHIP_TYPES.COMPONENT_CLICK, target: 'test' },
          correct: true,
        },
      ];
      await predictor.train(examples);

      const exported = predictor.exportTrainingData();
      
      expect(exported.version).toBe('1.0.0');
      expect(exported.patterns).toBeDefined();
      expect(exported.trainingExamples.length).toBeGreaterThan(0);

      // Import into new predictor
      const newPredictor = new NeuralRelationshipPredictor();
      const result = newPredictor.importTrainingData(exported);

      expect(result.success).toBe(true);
    });
  });
});

describe('Linked Schema N8N Converter', () => {
  let converter;

  beforeEach(() => {
    converter = new LinkedSchemaN8nConverter({
      apiBaseUrl: 'http://localhost:3001',
      n8nBaseUrl: 'http://localhost:5678',
    });
  });

  describe('Schema to Workflow Conversion', () => {
    it('should convert schema to n8n workflow', async () => {
      const schema = {
        id: 'test-schema',
        name: 'Test Schema',
        type: 'data_pipeline',
        fields: [
          { name: 'name', type: 'string' },
          { name: 'value', type: 'number' },
        ],
      };

      const workflow = await converter.convertSchemaToWorkflow(schema, {
        templateType: 'dataProcessing',
      });

      expect(workflow).toBeDefined();
      expect(workflow.name).toContain('Test Schema');
      expect(workflow.nodes.length).toBeGreaterThan(0);
      expect(workflow.connections).toBeDefined();
    });

    it('should include status indicator nodes when requested', async () => {
      const schema = {
        id: 'test-schema',
        name: 'Test',
        type: 'data',
      };

      const workflow = await converter.convertSchemaToWorkflow(schema, {
        includeStatusIndicators: true,
      });

      const statusNode = workflow.nodes.find(n => n.name.includes('Status'));
      expect(statusNode).toBeDefined();
    });
  });

  describe('Composite Workflow', () => {
    it('should create composite workflow from multiple schemas', async () => {
      const schemas = [
        { id: 'schema1', name: 'First Schema', type: 'input' },
        { id: 'schema2', name: 'Second Schema', type: 'process' },
      ];

      const workflow = await converter.createCompositeWorkflow(schemas, {
        name: 'Composite Test',
        executionMode: 'sequential',
      });

      expect(workflow).toBeDefined();
      expect(workflow.name).toBe('Composite Test');
      expect(workflow.meta.schemasIncluded.length).toBe(2);
    });
  });

  describe('Templates', () => {
    it('should provide available templates', () => {
      const templates = converter.getTemplates();

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.find(t => t.key === 'dataProcessing')).toBeDefined();
      expect(templates.find(t => t.key === 'crud')).toBeDefined();
    });

    it('should provide node templates', () => {
      const nodeTemplates = converter.getNodeTemplates();

      expect(nodeTemplates).toBeDefined();
      expect(nodeTemplates.find(t => t.key === 'webhook')).toBeDefined();
      expect(nodeTemplates.find(t => t.key === 'function')).toBeDefined();
    });
  });

  describe('DeepSeek Tools', () => {
    it('should generate DeepSeek tool definitions', async () => {
      const schema = { id: 'test', name: 'Test', type: 'data' };
      const workflow = await converter.convertSchemaToWorkflow(schema);

      const tools = converter.generateDeepSeekTools([workflow]);

      expect(tools).toBeDefined();
      expect(tools.length).toBe(1);
      expect(tools[0].type).toBe('function');
      expect(tools[0].function).toBeDefined();
      expect(tools[0].function.parameters).toBeDefined();
    });
  });

  describe('Metrics', () => {
    it('should track conversion metrics', async () => {
      const schema = { id: 'test', name: 'Test', type: 'data' };
      await converter.convertSchemaToWorkflow(schema);

      const metrics = converter.getMetrics();

      expect(metrics.workflowsGenerated).toBeGreaterThan(0);
      expect(metrics.nodesGenerated).toBeGreaterThan(0);
    });
  });
});

describe('Relationship Training Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new RelationshipTrainingGenerator({
      minConfidence: 0.6,
    });
  });

  describe('Training Data Generation', () => {
    it('should generate all training data', () => {
      const trainingData = generator.generateAllTrainingData();

      expect(trainingData).toBeDefined();
      expect(trainingData.version).toBe('1.0.0');
      expect(trainingData.examples.length).toBeGreaterThan(0);
      expect(trainingData.statistics.totalExamples).toBeGreaterThan(0);
    });

    it('should include multiple domains', () => {
      const trainingData = generator.generateAllTrainingData();

      expect(Object.keys(trainingData.domains).length).toBeGreaterThan(0);
      expect(trainingData.domains.ui_components).toBeDefined();
      expect(trainingData.domains.status_indicators).toBeDefined();
      expect(trainingData.domains.n8n_workflows).toBeDefined();
    });
  });

  describe('Schema-specific Training', () => {
    it('should generate training data for specific schema', () => {
      const schema = {
        id: 'button-schema',
        name: 'Primary Button',
        type: 'button',
      };

      const examples = generator.generateSchemaTrainingData(schema);

      expect(examples).toBeDefined();
      expect(examples.length).toBeGreaterThan(0);
      expect(examples[0].schemaId).toBe('button-schema');
    });
  });

  describe('N8N Workflow Training', () => {
    it('should generate n8n workflow training data', () => {
      const result = generator.generateN8nWorkflowTrainingData({
        includeAllNodes: true,
      });

      expect(result).toBeDefined();
      expect(result.examples.length).toBeGreaterThan(0);
      expect(result.workflowTypes.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Training', () => {
    it('should generate animation training data', () => {
      const result = generator.generateAnimationTrainingData();

      expect(result).toBeDefined();
      expect(result.animations.length).toBeGreaterThan(0);
      
      // All animations should have animejs config
      result.animations.forEach(anim => {
        expect(anim.animejs).toBeDefined();
      });
    });
  });

  describe('Status Indicator Training', () => {
    it('should generate status indicator training data', () => {
      const result = generator.generateStatusIndicatorTrainingData();

      expect(result).toBeDefined();
      expect(result.indicators.length).toBeGreaterThan(0);
      expect(result.statuses).toContain('success');
      expect(result.statuses).toContain('loading');
      expect(result.statuses).toContain('error');
    });
  });

  describe('Custom Patterns', () => {
    it('should add custom patterns', () => {
      const customPattern = {
        sourceType: 'custom_type',
        patterns: [
          {
            relationship: { type: RELATIONSHIP_TYPES.COMPONENT_CLICK, target: 'custom' },
            confidence: 0.9,
          },
        ],
      };

      const result = generator.addCustomPattern('custom_domain', customPattern);

      expect(result.success).toBe(true);
      expect(generator.getDomains()).toContain('custom_domain');
    });
  });

  describe('Export', () => {
    it('should export to JSON', () => {
      const json = generator.exportToJSON();

      expect(json).toBeDefined();
      expect(() => JSON.parse(json)).not.toThrow();
      
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.0.0');
    });
  });

  describe('Available Patterns', () => {
    it('should have UI component patterns', () => {
      expect(TRAINING_PATTERNS.ui_components).toBeDefined();
      expect(TRAINING_PATTERNS.ui_components.length).toBeGreaterThan(0);
    });

    it('should have status indicator patterns', () => {
      expect(TRAINING_PATTERNS.status_indicators).toBeDefined();
    });

    it('should have form patterns', () => {
      expect(TRAINING_PATTERNS.forms).toBeDefined();
    });

    it('should have n8n workflow patterns', () => {
      expect(TRAINING_PATTERNS.n8n_workflows).toBeDefined();
    });

    it('should have styleguide patterns', () => {
      expect(TRAINING_PATTERNS.styleguide).toBeDefined();
    });
  });
});

describe('Integration: Full Workflow', () => {
  it('should generate complete functional system from schema', async () => {
    // 1. Define a linked schema
    const schema = {
      id: 'user-form',
      name: 'User Registration Form',
      type: 'form',
      category: 'input',
      fields: [
        { name: 'username', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'password', type: 'string', required: true },
      ],
    };

    // 2. Predict relationships
    const predictor = new NeuralRelationshipPredictor();
    const relationships = await predictor.predictRelationships(schema);

    expect(relationships.length).toBeGreaterThan(0);

    // 3. Generate component
    const component = predictor.generateFunctionalComponent(relationships, {
      componentType: 'form',
      includeAnimation: true,
      includeStatus: true,
    });

    expect(component.code).toContain('anime');

    // 4. Generate n8n workflow
    const converter = new LinkedSchemaN8nConverter();
    const workflow = await converter.convertSchemaToWorkflow(schema, {
      templateType: 'dataProcessing',
      includeStatusIndicators: true,
    });

    expect(workflow.nodes.length).toBeGreaterThan(0);

    // 5. Generate training data
    const generator = new RelationshipTrainingGenerator();
    const trainingExamples = generator.generateSchemaTrainingData(schema);

    expect(trainingExamples.length).toBeGreaterThan(0);

    // 6. Generate DeepSeek tools
    const tools = converter.generateDeepSeekTools([workflow]);

    expect(tools.length).toBe(1);
    expect(tools[0].function.name).toBeDefined();
  });
});
