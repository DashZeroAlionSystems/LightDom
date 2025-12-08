/**
 * Linked Schema Workflow API Routes
 * 
 * REST API endpoints for:
 * - Relationship prediction
 * - N8N workflow generation from schemas
 * - DeepSeek integration for workflow configuration
 * - Status indicator management
 * - Training data management
 * 
 * @module api/linked-schema-workflow-routes
 */

import express from 'express';
import { NeuralRelationshipPredictor, RELATIONSHIP_TYPES } from '../services/neural-relationship-predictor.js';
import { LinkedSchemaN8nConverter } from '../services/linked-schema-n8n-converter.js';

const router = express.Router();

// Initialize services
const predictor = new NeuralRelationshipPredictor({
  confidenceThreshold: 0.6,
  maxRelationships: 20,
});

const converter = new LinkedSchemaN8nConverter({
  apiBaseUrl: process.env.API_URL || 'http://localhost:3001',
  n8nBaseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
  deepseekApiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
});

/**
 * GET /api/linked-schema/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      predictor: 'active',
      converter: 'active',
    },
    metrics: {
      predictor: predictor.getMetrics(),
      converter: converter.getMetrics(),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/linked-schema/predict
 * Predict relationships for a schema
 */
router.post('/predict', async (req, res) => {
  try {
    const { schema, context = {} } = req.body;
    
    if (!schema) {
      return res.status(400).json({
        success: false,
        error: 'Schema is required',
      });
    }
    
    const relationships = await predictor.predictRelationships(schema, context);
    
    res.json({
      success: true,
      schema: schema.id || schema.name,
      relationships,
      count: relationships.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/generate-component
 * Generate a functional component from relationships
 */
router.post('/generate-component', async (req, res) => {
  try {
    const { 
      schema, 
      relationships,
      options = {} 
    } = req.body;
    
    // If no relationships provided, predict them
    let rels = relationships;
    if (!rels && schema) {
      rels = await predictor.predictRelationships(schema, {
        preferAnimations: options.includeAnimation !== false,
      });
    }
    
    if (!rels || rels.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No relationships available for component generation',
      });
    }
    
    const component = predictor.generateFunctionalComponent(rels, {
      componentType: options.componentType || schema?.type || 'button',
      includeAnimation: options.includeAnimation !== false,
      includeStatus: options.includeStatus !== false,
      framework: options.framework || 'react',
    });
    
    res.json({
      success: true,
      component,
      relationships: rels.length,
    });
  } catch (error) {
    console.error('Component generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/generate-workflow
 * Generate n8n workflow from linked schema
 */
router.post('/generate-workflow', async (req, res) => {
  try {
    const { 
      schema, 
      options = {} 
    } = req.body;
    
    if (!schema) {
      return res.status(400).json({
        success: false,
        error: 'Schema is required',
      });
    }
    
    const workflow = await converter.convertSchemaToWorkflow(schema, {
      templateType: options.templateType || 'dataProcessing',
      includeStatusIndicators: options.includeStatusIndicators !== false,
      includeAnimations: options.includeAnimations !== false,
      generateDeepSeekConfig: options.generateDeepSeekConfig || false,
    });
    
    res.json({
      success: true,
      workflow,
      nodeCount: workflow.nodes.length,
      template: options.templateType || 'dataProcessing',
    });
  } catch (error) {
    console.error('Workflow generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/generate-composite-workflow
 * Generate composite workflow from multiple schemas
 */
router.post('/generate-composite-workflow', async (req, res) => {
  try {
    const { 
      schemas, 
      options = {} 
    } = req.body;
    
    if (!schemas || !Array.isArray(schemas) || schemas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one schema is required',
      });
    }
    
    const workflow = await converter.createCompositeWorkflow(schemas, {
      name: options.name || 'Composite Workflow',
      description: options.description || 'Workflow combining multiple schemas',
      executionMode: options.executionMode || 'sequential',
    });
    
    res.json({
      success: true,
      workflow,
      schemaCount: schemas.length,
      nodeCount: workflow.nodes.length,
    });
  } catch (error) {
    console.error('Composite workflow error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/deepseek/generate
 * Use DeepSeek to generate relationships for functionality
 */
router.post('/deepseek/generate', async (req, res) => {
  try {
    const {
      description,
      schema,
      requirements = [],
    } = req.body;
    
    if (!description && !schema) {
      return res.status(400).json({
        success: false,
        error: 'Description or schema is required',
      });
    }
    
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return res.status(503).json({
        success: false,
        error: 'DeepSeek API key not configured',
      });
    }
    
    const prompt = `You are an expert at generating functional component relationships and n8n workflows.

Given this input:
${description ? `Description: ${description}` : ''}
${schema ? `Schema: ${JSON.stringify(schema, null, 2)}` : ''}
${requirements.length > 0 ? `Requirements: ${requirements.join(', ')}` : ''}

Generate a JSON response with:
1. relationships: Array of component relationships (click actions, styles, animations, icons)
2. n8nWorkflow: Complete n8n workflow definition
3. componentCode: React component code with animejs integration
4. statusIndicator: Status indicator configuration with icons and animations

For animations, use animejs.com patterns like:
- scale: [1, 0.95, 1] for click feedback
- translateY: -5 for hover effects
- rotate: 360 with loop for loading
- opacity: [0, 1] for fade in

For status icons, use Ant Design icons:
- CheckCircle for success
- LoadingOutlined for loading
- CloseCircle for error
- ExclamationCircle for warning

Output valid JSON only.`;

    const response = await fetch(`${process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid DeepSeek response');
    }
    
    let result;
    try {
      const content = data.choices[0].message.content;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/);
      result = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (parseError) {
      result = {
        rawResponse: data.choices[0].message.content,
        parseError: parseError.message,
      };
    }
    
    res.json({
      success: true,
      result,
      usage: data.usage,
    });
  } catch (error) {
    console.error('DeepSeek generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/deepseek/train
 * Configure DeepSeek to use our API for n8n workflows
 */
router.post('/deepseek/train', async (req, res) => {
  try {
    const { examples = [] } = req.body;
    
    // Generate training data for DeepSeek
    const trainingData = examples.map(example => ({
      input: example.input,
      output: {
        apiEndpoint: `${process.env.API_URL || 'http://localhost:3001'}/api/linked-schema/generate-workflow`,
        method: 'POST',
        body: {
          schema: example.schema,
          options: example.options,
        },
      },
      context: 'n8n workflow generation via linked schemas',
    }));
    
    // Also train our local predictor
    const result = await predictor.train(examples.map(e => ({
      sourceType: e.schema?.type || 'component',
      targetType: e.targetType || 'workflow',
      relationship: e.relationship || { type: 'workflow_action', target: 'generate' },
      correct: true,
    })));
    
    // Generate DeepSeek tool definitions
    const tools = converter.generateDeepSeekTools(
      examples.map(e => e.workflow).filter(Boolean)
    );
    
    res.json({
      success: true,
      trainingData,
      tools,
      predictorResult: result,
      instructions: `
To use DeepSeek with our n8n service:

1. Configure DeepSeek function calling with these tools:
${JSON.stringify(tools, null, 2)}

2. When DeepSeek needs to create a workflow, it should call:
   POST ${process.env.API_URL || 'http://localhost:3001'}/api/linked-schema/generate-workflow
   
3. For relationship predictions:
   POST ${process.env.API_URL || 'http://localhost:3001'}/api/linked-schema/predict
   
4. For component generation with animations:
   POST ${process.env.API_URL || 'http://localhost:3001'}/api/linked-schema/generate-component
      `,
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/train
 * Train the relationship predictor
 */
router.post('/train', async (req, res) => {
  try {
    const { examples } = req.body;
    
    if (!examples || !Array.isArray(examples)) {
      return res.status(400).json({
        success: false,
        error: 'Training examples array is required',
      });
    }
    
    const result = await predictor.train(examples);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/linked-schema/patterns
 * Get all registered patterns
 */
router.get('/patterns', (req, res) => {
  try {
    const patterns = predictor.getPatterns();
    
    res.json({
      success: true,
      patterns,
      count: patterns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/linked-schema/relationship-types
 * Get available relationship types
 */
router.get('/relationship-types', (req, res) => {
  res.json({
    success: true,
    types: RELATIONSHIP_TYPES,
  });
});

/**
 * GET /api/linked-schema/templates
 * Get available workflow templates
 */
router.get('/templates', (req, res) => {
  try {
    const templates = converter.getTemplates();
    const nodeTemplates = converter.getNodeTemplates();
    
    res.json({
      success: true,
      workflowTemplates: templates,
      nodeTemplates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/linked-schema/metrics
 * Get service metrics
 */
router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    predictor: predictor.getMetrics(),
    converter: converter.getMetrics(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/linked-schema/export-training-data
 * Export training data
 */
router.post('/export-training-data', (req, res) => {
  try {
    const data = predictor.exportTrainingData();
    
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/import-training-data
 * Import training data
 */
router.post('/import-training-data', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Training data is required',
      });
    }
    
    const result = predictor.importTrainingData(data);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/linked-schema/status-indicator
 * Generate status indicator configuration
 */
router.post('/status-indicator', (req, res) => {
  try {
    const { status = 'idle', service = 'default' } = req.body;
    
    const statusConfigs = {
      success: {
        icon: 'CheckCircle',
        color: '#52c41a',
        animation: {
          animejs: {
            targets: 'element',
            scale: [0.8, 1.1, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)',
          },
        },
        message: 'Operation completed successfully',
      },
      loading: {
        icon: 'LoadingOutlined',
        color: '#1890ff',
        animation: {
          animejs: {
            targets: 'element',
            rotate: 360,
            duration: 1000,
            loop: true,
            easing: 'linear',
          },
        },
        message: 'Processing...',
      },
      error: {
        icon: 'CloseCircle',
        color: '#ff4d4f',
        animation: {
          animejs: {
            targets: 'element',
            translateX: [-5, 5, -5, 5, 0],
            duration: 400,
            easing: 'easeInOutQuad',
          },
        },
        message: 'Operation failed',
      },
      warning: {
        icon: 'ExclamationCircle',
        color: '#faad14',
        animation: {
          animejs: {
            targets: 'element',
            scale: [1, 1.1, 1],
            duration: 600,
            easing: 'easeInOutQuad',
          },
        },
        message: 'Warning: Action required',
      },
      idle: {
        icon: 'MinusCircle',
        color: '#8c8c8c',
        animation: null,
        message: 'Idle',
      },
    };
    
    const config = statusConfigs[status] || statusConfigs.idle;
    
    res.json({
      success: true,
      status,
      service,
      config,
      reactComponent: generateStatusReactComponent(status, config),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate React component for status indicator
 */
function generateStatusReactComponent(status, config) {
  return `import React, { useRef, useEffect } from 'react';
import anime from 'animejs';
import { ${config.icon} } from '@ant-design/icons';
import './StatusIndicator.css';

export const StatusIndicator = ({ status = '${status}', message }) => {
  const iconRef = useRef(null);
  
  useEffect(() => {
    if (iconRef.current && ${JSON.stringify(config.animation)}) {
      const anim = anime({
        targets: iconRef.current,
        ${config.animation?.animejs ? Object.entries(config.animation.animejs)
          .filter(([key]) => key !== 'targets')
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(',\n        ') : ''}
      });
      
      return () => anim.pause();
    }
  }, [status]);
  
  return (
    <div className="status-indicator status-${status}">
      <span ref={iconRef} className="status-icon" style={{ color: '${config.color}' }}>
        <${config.icon} />
      </span>
      <span className="status-message">{message || '${config.message}'}</span>
    </div>
  );
};

export default StatusIndicator;
`;
}

export default router;
