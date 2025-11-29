/**
 * Relationship Training Data Generator
 * 
 * Generates training data for the neural relationship predictor
 * based on common UI patterns, n8n workflows, and component relationships.
 * 
 * @module services/relationship-training-generator
 */

import { EventEmitter } from 'events';
import { RELATIONSHIP_TYPES } from './neural-relationship-predictor.js';

/**
 * Training data patterns for different domains
 */
const TRAINING_PATTERNS = {
  // UI Component patterns
  ui_components: [
    {
      sourceType: 'button',
      patterns: [
        {
          relationship: { type: RELATIONSHIP_TYPES.COMPONENT_CLICK, target: 'onClick' },
          confidence: 0.95,
          context: 'primary action button',
        },
        {
          relationship: { 
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION, 
            target: 'click_feedback',
            animejs: {
              targets: 'element',
              scale: [1, 0.95, 1],
              duration: 200,
              easing: 'easeInOutQuad',
            },
          },
          confidence: 0.9,
        },
        {
          relationship: { type: RELATIONSHIP_TYPES.COMPONENT_STYLE, target: 'primary_style' },
          confidence: 0.85,
        },
      ],
    },
    {
      sourceType: 'card',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION,
            target: 'hover_elevation',
            animejs: {
              targets: 'element',
              translateY: -5,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              duration: 300,
              easing: 'easeOutQuad',
            },
          },
          confidence: 0.9,
        },
        {
          relationship: { type: RELATIONSHIP_TYPES.COMPONENT_CLICK, target: 'onClick' },
          confidence: 0.7,
        },
      ],
    },
    {
      sourceType: 'modal',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION,
            target: 'entrance',
            animejs: {
              targets: 'element',
              scale: [0.9, 1],
              opacity: [0, 1],
              duration: 300,
              easing: 'easeOutCubic',
            },
          },
          confidence: 0.95,
        },
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION,
            target: 'backdrop',
            animejs: {
              targets: 'backdrop',
              opacity: [0, 0.5],
              duration: 200,
            },
          },
          confidence: 0.9,
        },
      ],
    },
    {
      sourceType: 'dropdown',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION,
            target: 'expand',
            animejs: {
              targets: 'menu',
              height: [0, 'auto'],
              opacity: [0, 1],
              duration: 250,
              easing: 'easeOutQuad',
            },
          },
          confidence: 0.9,
        },
        {
          relationship: { type: RELATIONSHIP_TYPES.UX_NAVIGATION, target: 'keyboard' },
          confidence: 0.85,
        },
      ],
    },
  ],
  
  // Status indicator patterns
  status_indicators: [
    {
      sourceType: 'service_status',
      patterns: [
        {
          status: 'success',
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ICON,
            target: 'CheckCircle',
            color: '#52c41a',
          },
          animation: {
            animejs: {
              targets: 'icon',
              scale: [0.8, 1.1, 1],
              opacity: [0, 1],
              duration: 500,
              easing: 'easeOutElastic(1, .5)',
            },
          },
          confidence: 0.95,
        },
        {
          status: 'loading',
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ICON,
            target: 'LoadingOutlined',
            color: '#1890ff',
          },
          animation: {
            animejs: {
              targets: 'icon',
              rotate: 360,
              duration: 1000,
              loop: true,
              easing: 'linear',
            },
          },
          confidence: 0.95,
        },
        {
          status: 'error',
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ICON,
            target: 'CloseCircle',
            color: '#ff4d4f',
          },
          animation: {
            animejs: {
              targets: 'icon',
              translateX: [-5, 5, -5, 5, 0],
              duration: 400,
              easing: 'easeInOutQuad',
            },
          },
          confidence: 0.95,
        },
        {
          status: 'warning',
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ICON,
            target: 'ExclamationCircle',
            color: '#faad14',
          },
          animation: {
            animejs: {
              targets: 'icon',
              scale: [1, 1.1, 1],
              duration: 600,
              loop: 3,
              easing: 'easeInOutQuad',
            },
          },
          confidence: 0.9,
        },
      ],
    },
  ],
  
  // Form patterns
  forms: [
    {
      sourceType: 'form',
      patterns: [
        {
          relationship: { type: RELATIONSHIP_TYPES.UX_VALIDATION, target: 'realtime' },
          confidence: 0.9,
        },
        {
          relationship: { type: RELATIONSHIP_TYPES.WORKFLOW_TRIGGER, target: 'submit' },
          n8n: {
            nodeType: 'n8n-nodes-base.webhook',
            parameters: { httpMethod: 'POST', path: 'form-submit' },
          },
          confidence: 0.85,
        },
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION,
            target: 'submit_feedback',
            animejs: {
              targets: 'submit-button',
              scale: [1, 0.95, 1],
              duration: 200,
            },
          },
          confidence: 0.8,
        },
      ],
    },
    {
      sourceType: 'input',
      patterns: [
        {
          relationship: { type: RELATIONSHIP_TYPES.UX_VALIDATION, target: 'blur' },
          confidence: 0.85,
        },
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_ANIMATION,
            target: 'focus',
            animejs: {
              targets: 'element',
              borderColor: '#1890ff',
              boxShadow: '0 0 0 2px rgba(24,144,255,0.2)',
              duration: 200,
            },
          },
          confidence: 0.8,
        },
      ],
    },
  ],
  
  // N8N Workflow patterns
  n8n_workflows: [
    {
      sourceType: 'data_pipeline',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.WORKFLOW_TRIGGER,
            target: 'webhook',
          },
          n8n: {
            nodeType: 'n8n-nodes-base.webhook',
            parameters: { httpMethod: 'POST', responseMode: 'responseNode' },
          },
          confidence: 0.9,
        },
        {
          relationship: {
            type: RELATIONSHIP_TYPES.WORKFLOW_TRANSFORM,
            target: 'process',
          },
          n8n: {
            nodeType: 'n8n-nodes-base.function',
            parameters: { functionCode: '// Process data\nreturn items;' },
          },
          confidence: 0.85,
        },
        {
          relationship: {
            type: RELATIONSHIP_TYPES.WORKFLOW_ACTION,
            target: 'store',
          },
          n8n: {
            nodeType: 'n8n-nodes-base.postgres',
            parameters: { operation: 'insert' },
          },
          confidence: 0.8,
        },
      ],
    },
    {
      sourceType: 'api_integration',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.WORKFLOW_TRIGGER,
            target: 'schedule',
          },
          n8n: {
            nodeType: 'n8n-nodes-base.scheduleTrigger',
            parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 * * * *' }] } },
          },
          confidence: 0.85,
        },
        {
          relationship: {
            type: RELATIONSHIP_TYPES.WORKFLOW_ACTION,
            target: 'api_call',
          },
          n8n: {
            nodeType: 'n8n-nodes-base.httpRequest',
            parameters: { method: 'GET' },
          },
          confidence: 0.9,
        },
      ],
    },
    {
      sourceType: 'notification',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.WORKFLOW_ACTION,
            target: 'send_notification',
          },
          n8n: {
            nodeType: 'n8n-nodes-base.httpRequest',
            parameters: { method: 'POST', url: 'notification-service' },
          },
          confidence: 0.85,
        },
      ],
    },
  ],
  
  // Style guide patterns
  styleguide: [
    {
      sourceType: 'primary_action',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_STYLE,
            target: 'primary_button',
            styles: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
            },
          },
          confidence: 0.9,
        },
      ],
    },
    {
      sourceType: 'secondary_action',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_STYLE,
            target: 'secondary_button',
            styles: {
              background: 'transparent',
              border: '1px solid #d9d9d9',
              color: '#333',
              borderRadius: '8px',
              padding: '12px 24px',
            },
          },
          confidence: 0.85,
        },
      ],
    },
    {
      sourceType: 'danger_action',
      patterns: [
        {
          relationship: {
            type: RELATIONSHIP_TYPES.COMPONENT_STYLE,
            target: 'danger_button',
            styles: {
              background: '#ff4d4f',
              color: 'white',
              borderRadius: '8px',
              padding: '12px 24px',
            },
          },
          confidence: 0.9,
        },
      ],
    },
  ],
};

/**
 * Relationship Training Data Generator
 */
export class RelationshipTrainingGenerator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      outputPath: options.outputPath || './training_data',
      minConfidence: options.minConfidence || 0.6,
      ...options,
    };
    
    this.patterns = TRAINING_PATTERNS;
    this.generatedExamples = [];
    
    this.metrics = {
      examplesGenerated: 0,
      patternsUsed: 0,
      domainsProcessed: 0,
    };
  }

  /**
   * Generate training data from all patterns
   */
  generateAllTrainingData() {
    const trainingData = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      domains: {},
      examples: [],
      statistics: {},
    };
    
    // Process each domain
    for (const [domain, domainPatterns] of Object.entries(this.patterns)) {
      trainingData.domains[domain] = [];
      this.metrics.domainsProcessed++;
      
      for (const sourcePattern of domainPatterns) {
        const examples = this._generateExamplesFromPattern(sourcePattern, domain);
        trainingData.domains[domain].push(...examples);
        trainingData.examples.push(...examples);
        
        this.metrics.patternsUsed++;
        this.metrics.examplesGenerated += examples.length;
      }
    }
    
    // Add statistics
    trainingData.statistics = {
      totalExamples: trainingData.examples.length,
      byDomain: Object.entries(trainingData.domains).reduce((acc, [domain, examples]) => {
        acc[domain] = examples.length;
        return acc;
      }, {}),
      byRelationshipType: this._countByRelationshipType(trainingData.examples),
      averageConfidence: this._calculateAverageConfidence(trainingData.examples),
    };
    
    this.generatedExamples = trainingData.examples;
    
    this.emit('training:generated', {
      count: trainingData.examples.length,
      domains: Object.keys(trainingData.domains),
    });
    
    return trainingData;
  }

  /**
   * Generate examples from a pattern
   */
  _generateExamplesFromPattern(sourcePattern, domain) {
    const examples = [];
    
    for (const pattern of sourcePattern.patterns) {
      if (pattern.confidence < this.options.minConfidence) continue;
      
      const example = {
        id: `${domain}_${sourcePattern.sourceType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domain,
        sourceType: sourcePattern.sourceType,
        targetType: pattern.relationship.target,
        relationship: {
          type: pattern.relationship.type,
          target: pattern.relationship.target,
          confidence: pattern.confidence,
        },
        metadata: {
          context: pattern.context || `${domain} pattern`,
          generatedAt: new Date().toISOString(),
        },
        correct: true,
      };
      
      // Add animation if present
      if (pattern.animejs || pattern.animation?.animejs || pattern.relationship.animejs) {
        example.animation = {
          animejs: pattern.animejs || pattern.animation?.animejs || pattern.relationship.animejs,
        };
      }
      
      // Add n8n config if present
      if (pattern.n8n) {
        example.n8n = pattern.n8n;
      }
      
      // Add styles if present
      if (pattern.relationship.styles) {
        example.styles = pattern.relationship.styles;
      }
      
      // Add status variant if present
      if (pattern.status) {
        example.status = pattern.status;
        example.statusConfig = {
          icon: pattern.relationship.target,
          color: pattern.relationship.color,
        };
      }
      
      examples.push(example);
    }
    
    return examples;
  }

  /**
   * Count examples by relationship type
   */
  _countByRelationshipType(examples) {
    return examples.reduce((acc, example) => {
      const type = example.relationship.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Calculate average confidence
   */
  _calculateAverageConfidence(examples) {
    if (examples.length === 0) return 0;
    const total = examples.reduce((sum, ex) => sum + ex.relationship.confidence, 0);
    return total / examples.length;
  }

  /**
   * Generate schema-specific training data
   */
  generateSchemaTrainingData(schema) {
    const examples = [];
    const schemaType = schema.type?.toLowerCase() || 'component';
    
    // Find matching patterns
    for (const [domain, domainPatterns] of Object.entries(this.patterns)) {
      for (const pattern of domainPatterns) {
        if (pattern.sourceType === schemaType || 
            pattern.sourceType === schema.category?.toLowerCase()) {
          const domainExamples = this._generateExamplesFromPattern(pattern, domain);
          
          // Customize for this schema
          examples.push(...domainExamples.map(ex => ({
            ...ex,
            schemaId: schema.id || schema.name,
            schemaName: schema.name,
            customized: true,
          })));
        }
      }
    }
    
    return examples;
  }

  /**
   * Generate n8n workflow training data
   */
  generateN8nWorkflowTrainingData(options = {}) {
    const {
      workflowType = 'data_pipeline',
      includeAllNodes = true,
    } = options;
    
    const examples = [];
    const n8nPatterns = this.patterns.n8n_workflows;
    
    for (const pattern of n8nPatterns) {
      if (!includeAllNodes && pattern.sourceType !== workflowType) continue;
      
      const workflowExamples = this._generateExamplesFromPattern(pattern, 'n8n_workflows');
      examples.push(...workflowExamples);
    }
    
    // Generate complete workflow examples
    const completeWorkflows = this._generateCompleteWorkflowExamples();
    examples.push(...completeWorkflows);
    
    return {
      examples,
      count: examples.length,
      workflowTypes: [...new Set(examples.map(e => e.sourceType))],
    };
  }

  /**
   * Generate complete workflow examples
   */
  _generateCompleteWorkflowExamples() {
    return [
      {
        id: `workflow_crud_${Date.now()}`,
        domain: 'n8n_workflows',
        sourceType: 'crud_workflow',
        targetType: 'complete_workflow',
        relationship: {
          type: RELATIONSHIP_TYPES.WORKFLOW_ACTION,
          target: 'crud_operations',
          confidence: 0.9,
        },
        n8n: {
          workflow: {
            name: 'CRUD Operations',
            nodes: [
              { type: 'n8n-nodes-base.webhook', name: 'Trigger' },
              { type: 'n8n-nodes-base.function', name: 'Route' },
              { type: 'n8n-nodes-base.postgres', name: 'Database' },
              { type: 'n8n-nodes-base.respondToWebhook', name: 'Response' },
            ],
          },
        },
        correct: true,
        metadata: {
          context: 'complete CRUD workflow template',
          generatedAt: new Date().toISOString(),
        },
      },
      {
        id: `workflow_ai_${Date.now()}`,
        domain: 'n8n_workflows',
        sourceType: 'ai_workflow',
        targetType: 'complete_workflow',
        relationship: {
          type: RELATIONSHIP_TYPES.WORKFLOW_ACTION,
          target: 'ai_processing',
          confidence: 0.85,
        },
        n8n: {
          workflow: {
            name: 'AI Processing',
            nodes: [
              { type: 'n8n-nodes-base.webhook', name: 'Input' },
              { type: 'n8n-nodes-base.function', name: 'Prepare' },
              { type: 'n8n-nodes-base.httpRequest', name: 'DeepSeek API' },
              { type: 'n8n-nodes-base.function', name: 'Process Response' },
              { type: 'n8n-nodes-base.respondToWebhook', name: 'Output' },
            ],
          },
        },
        correct: true,
        metadata: {
          context: 'AI-powered workflow with DeepSeek',
          generatedAt: new Date().toISOString(),
        },
      },
    ];
  }

  /**
   * Generate component with animation training data
   */
  generateAnimationTrainingData() {
    const animations = [];
    
    // Collect all animation patterns
    for (const [domain, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        for (const p of pattern.patterns) {
          if (p.animejs || p.animation?.animejs || p.relationship.animejs) {
            animations.push({
              id: `anim_${domain}_${pattern.sourceType}_${Date.now()}`,
              sourceType: pattern.sourceType,
              animationType: p.relationship.target,
              animejs: p.animejs || p.animation?.animejs || p.relationship.animejs,
              context: p.context || domain,
              confidence: p.confidence,
            });
          }
        }
      }
    }
    
    return {
      animations,
      count: animations.length,
      types: [...new Set(animations.map(a => a.animationType))],
    };
  }

  /**
   * Generate status indicator training data
   */
  generateStatusIndicatorTrainingData() {
    const statusPatterns = this.patterns.status_indicators;
    const indicators = [];
    
    for (const pattern of statusPatterns) {
      for (const p of pattern.patterns) {
        indicators.push({
          id: `status_${p.status}_${Date.now()}`,
          status: p.status,
          icon: p.relationship.target,
          color: p.relationship.color,
          animation: p.animation?.animejs,
          confidence: p.confidence,
        });
      }
    }
    
    return {
      indicators,
      count: indicators.length,
      statuses: [...new Set(indicators.map(i => i.status))],
    };
  }

  /**
   * Add custom pattern
   */
  addCustomPattern(domain, pattern) {
    if (!this.patterns[domain]) {
      this.patterns[domain] = [];
    }
    
    this.patterns[domain].push(pattern);
    
    this.emit('pattern:added', { domain, sourceType: pattern.sourceType });
    
    return {
      success: true,
      domain,
      sourceType: pattern.sourceType,
    };
  }

  /**
   * Export training data to JSON
   */
  exportToJSON() {
    const trainingData = this.generateAllTrainingData();
    return JSON.stringify(trainingData, null, 2);
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalPatterns: Object.values(this.patterns).reduce((sum, p) => sum + p.length, 0),
      domainsAvailable: Object.keys(this.patterns).length,
    };
  }

  /**
   * Get available domains
   */
  getDomains() {
    return Object.keys(this.patterns);
  }

  /**
   * Get patterns for a domain
   */
  getDomainPatterns(domain) {
    return this.patterns[domain] || [];
  }
}

export { TRAINING_PATTERNS };
export default RelationshipTrainingGenerator;
