# n8n Workflow Templates & Code Generation Guide

## Overview

This guide provides a comprehensive system for creating reusable n8n workflow templates, code generation, and service bundling for the LightDom platform.

## Table of Contents

1. [n8n Workflow Architecture](#n8n-workflow-architecture)
2. [Template Schema System](#template-schema-system)
3. [Code Template Generator](#code-template-generator)
4. [Workflow Bundling](#workflow-bundling)
5. [Variable Injection](#variable-injection)
6. [Workflow Orchestration](#workflow-orchestration)
7. [Pre-built Templates](#pre-built-templates)
8. [Integration with Services](#integration-with-services)

---

## n8n Workflow Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    n8n Workflow System                         │
└────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴────────────────────┐
        │                                        │
   Template Schema                      Code Generator
        │                                        │
        ↓                                        ↓
┌──────────────────┐                  ┌──────────────────┐
│  • JSON Schema   │                  │  • AST Parsing   │
│  • Variables     │                  │  • Code Gen      │
│  • Validation    │                  │  • Injection     │
└──────────────────┘                  └──────────────────┘
                            ↓
              ┌─────────────────────────┐
              │   Workflow Instance     │
              │  • Filled Template      │
              │  • Validated Config     │
              │  • Ready to Execute     │
              └─────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │    n8n Execution        │
              │  • Trigger              │
              │  • Nodes                │
              │  • Connections          │
              └─────────────────────────┘
```

---

## Template Schema System

### Workflow Template Schema

```javascript
// schemas/workflow-template-schema.js
export const workflowTemplateSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'n8n Workflow Template',
  type: 'object',
  required: ['id', 'name', 'nodes', 'connections'],
  properties: {
    id: {
      type: 'string',
      description: 'Unique template identifier'
    },
    name: {
      type: 'string',
      description: 'Template name'
    },
    description: {
      type: 'string',
      description: 'Template description'
    },
    category: {
      type: 'string',
      enum: ['user-management', 'payment', 'email', 'data-processing', 'integration'],
      description: 'Template category'
    },
    variables: {
      type: 'object',
      description: 'Template variables for injection',
      patternProperties: {
        '^[a-zA-Z_][a-zA-Z0-9_]*$': {
          type: 'object',
          required: ['type', 'default'],
          properties: {
            type: {
              type: 'string',
              enum: ['string', 'number', 'boolean', 'object', 'array']
            },
            default: {},
            description: { type: 'string' },
            required: { type: 'boolean' },
            validation: { type: 'object' }
          }
        }
      }
    },
    nodes: {
      type: 'array',
      description: 'Workflow nodes',
      items: {
        type: 'object',
        required: ['name', 'type', 'position'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          typeVersion: { type: 'number' },
          position: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2
          },
          parameters: { type: 'object' },
          credentials: { type: 'object' }
        }
      }
    },
    connections: {
      type: 'object',
      description: 'Node connections'
    },
    settings: {
      type: 'object',
      description: 'Workflow settings',
      properties: {
        executionOrder: {
          type: 'string',
          enum: ['v0', 'v1']
        },
        saveExecutionProgress: { type: 'boolean' },
        saveManualExecutions: { type: 'boolean' }
      }
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Template tags'
    },
    metadata: {
      type: 'object',
      description: 'Additional metadata'
    }
  }
};
```

### Database Schema

```sql
-- Workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    template_schema JSONB NOT NULL,
    variables JSONB DEFAULT '{}',
    nodes JSONB NOT NULL,
    connections JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    version VARCHAR(50) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Workflow instances (generated from templates)
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES workflow_templates(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    variables_data JSONB DEFAULT '{}',
    workflow_definition JSONB NOT NULL,
    n8n_workflow_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'error'
    service_bundle_id UUID,
    campaign_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Workflow executions log
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID REFERENCES workflow_instances(id),
    n8n_execution_id VARCHAR(255),
    status VARCHAR(50), -- 'running', 'success', 'error', 'waiting'
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    execution_data JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING gin(tags);
CREATE INDEX idx_workflow_instances_template_id ON workflow_instances(template_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_instance_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
```

---

## Code Template Generator

```javascript
// services/workflow-template-generator.js
import { v4 as uuidv4 } from 'uuid';
import Ajv from 'ajv';

export class WorkflowTemplateGenerator {
  constructor(dbPool) {
    this.db = dbPool;
    this.ajv = new Ajv();
  }

  /**
   * Create workflow template
   */
  async createTemplate(templateData) {
    const {
      template_id,
      name,
      description,
      category,
      variables = {},
      nodes,
      connections,
      settings = {},
      tags = [],
      metadata = {}
    } = templateData;

    // Validate template structure
    this.validateTemplate(nodes, connections);

    const result = await this.db.query(
      `INSERT INTO workflow_templates 
       (template_id, name, description, category, variables, nodes, connections, settings, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        template_id || uuidv4(),
        name,
        description,
        category,
        JSON.stringify(variables),
        JSON.stringify(nodes),
        JSON.stringify(connections),
        JSON.stringify(settings),
        tags,
        JSON.stringify(metadata)
      ]
    );

    return result.rows[0];
  }

  /**
   * Generate workflow instance from template
   */
  async generateInstance(templateId, instanceData) {
    const { name, description, variables_data = {}, service_bundle_id, campaign_id } = instanceData;

    // Get template
    const templateResult = await this.db.query(
      'SELECT * FROM workflow_templates WHERE id = $1',
      [templateId]
    );

    if (templateResult.rows.length === 0) {
      throw new Error('Template not found');
    }

    const template = templateResult.rows[0];

    // Validate variables
    this.validateVariables(template.variables, variables_data);

    // Generate workflow definition with injected variables
    const workflowDefinition = this.injectVariables(
      {
        nodes: template.nodes,
        connections: template.connections,
        settings: template.settings
      },
      variables_data
    );

    // Create instance
    const result = await this.db.query(
      `INSERT INTO workflow_instances 
       (template_id, name, description, variables_data, workflow_definition, service_bundle_id, campaign_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        templateId,
        name,
        description,
        JSON.stringify(variables_data),
        JSON.stringify(workflowDefinition),
        service_bundle_id,
        campaign_id
      ]
    );

    return result.rows[0];
  }

  /**
   * Validate template structure
   */
  validateTemplate(nodes, connections) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('Template must have at least one node');
    }

    // Validate node structure
    for (const node of nodes) {
      if (!node.name || !node.type || !node.position) {
        throw new Error('Invalid node structure');
      }
    }

    // Validate connections
    if (!connections || typeof connections !== 'object') {
      throw new Error('Invalid connections structure');
    }

    return true;
  }

  /**
   * Validate variables
   */
  validateVariables(templateVariables, providedVariables) {
    for (const [key, varDef] of Object.entries(templateVariables)) {
      if (varDef.required && !(key in providedVariables)) {
        throw new Error(`Required variable '${key}' not provided`);
      }

      if (key in providedVariables) {
        const value = providedVariables[key];
        const expectedType = varDef.type;

        if (!this.checkType(value, expectedType)) {
          throw new Error(
            `Variable '${key}' has wrong type. Expected ${expectedType}, got ${typeof value}`
          );
        }

        // Custom validation
        if (varDef.validation) {
          this.validateValue(value, varDef.validation);
        }
      }
    }

    return true;
  }

  checkType(value, expectedType) {
    if (expectedType === 'array') {
      return Array.isArray(value);
    }
    if (expectedType === 'object') {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    return typeof value === expectedType;
  }

  validateValue(value, validation) {
    if (validation.min !== undefined && value < validation.min) {
      throw new Error(`Value must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && value > validation.max) {
      throw new Error(`Value must be at most ${validation.max}`);
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      throw new Error(`Value does not match pattern ${validation.pattern}`);
    }
  }

  /**
   * Inject variables into workflow definition
   */
  injectVariables(workflowDef, variables) {
    const injected = JSON.parse(JSON.stringify(workflowDef)); // Deep clone

    // Replace variables in nodes
    injected.nodes = injected.nodes.map(node => {
      return this.replaceVariables(node, variables);
    });

    return injected;
  }

  /**
   * Replace variables in object recursively
   */
  replaceVariables(obj, variables) {
    if (typeof obj === 'string') {
      // Replace {{variable}} patterns
      return obj.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
        const value = this.getNestedValue(variables, varName.trim());
        return value !== undefined ? value : match;
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceVariables(item, variables));
    }

    if (obj !== null && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.replaceVariables(value, variables);
      }
      return result;
    }

    return obj;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }
}
```

---

## Workflow Bundling

```javascript
// services/workflow-bundler.js
export class WorkflowBundler {
  constructor(dbPool, templateGenerator) {
    this.db = dbPool;
    this.generator = templateGenerator;
  }

  /**
   * Create workflow bundle from multiple templates
   */
  async createBundle(bundleData) {
    const { name, description, templates, execution_mode = 'sequential' } = bundleData;

    const bundle = {
      name,
      description,
      templates: [],
      execution_mode, // 'sequential', 'parallel', 'conditional'
      created_at: new Date()
    };

    // Generate instances for each template
    for (const templateConfig of templates) {
      const { template_id, variables } = templateConfig;

      const instance = await this.generator.generateInstance(template_id, {
        name: `${name} - ${templateConfig.name || template_id}`,
        variables_data: variables
      });

      bundle.templates.push({
        instance_id: instance.id,
        order: templateConfig.order || 0,
        condition: templateConfig.condition
      });
    }

    return bundle;
  }

  /**
   * Execute workflow bundle
   */
  async executeBundle(bundle) {
    const { execution_mode, templates } = bundle;

    if (execution_mode === 'sequential') {
      return await this.executeSequential(templates);
    } else if (execution_mode === 'parallel') {
      return await this.executeParallel(templates);
    } else if (execution_mode === 'conditional') {
      return await this.executeConditional(templates);
    }
  }

  async executeSequential(templates) {
    const results = [];

    // Sort by order
    const sorted = templates.sort((a, b) => a.order - b.order);

    for (const template of sorted) {
      const result = await this.executeWorkflow(template.instance_id);
      results.push(result);

      // Stop on error
      if (result.status === 'error') {
        break;
      }
    }

    return results;
  }

  async executeParallel(templates) {
    const promises = templates.map(template => 
      this.executeWorkflow(template.instance_id)
    );

    return await Promise.all(promises);
  }

  async executeConditional(templates) {
    const results = [];

    for (const template of templates) {
      // Evaluate condition
      if (template.condition) {
        const conditionMet = this.evaluateCondition(template.condition, results);
        if (!conditionMet) {
          continue;
        }
      }

      const result = await this.executeWorkflow(template.instance_id);
      results.push(result);
    }

    return results;
  }

  evaluateCondition(condition, previousResults) {
    // Simple condition evaluation
    // In production, use a proper expression parser
    return true;
  }

  async executeWorkflow(instanceId) {
    // Integrate with n8n API to execute workflow
    // This is a placeholder - actual implementation would call n8n API
    return {
      instance_id: instanceId,
      status: 'success',
      executed_at: new Date()
    };
  }
}
```

---

## Variable Injection

### Example: User Creation Workflow Template

```json
{
  "id": "user-creation-workflow",
  "name": "User Creation Workflow",
  "description": "Complete user registration and setup",
  "category": "user-management",
  "variables": {
    "email": {
      "type": "string",
      "required": true,
      "validation": {
        "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
      }
    },
    "password": {
      "type": "string",
      "required": true,
      "validation": {
        "min": 8
      }
    },
    "firstName": {
      "type": "string",
      "required": true
    },
    "lastName": {
      "type": "string",
      "required": true
    },
    "planType": {
      "type": "string",
      "default": "free",
      "validation": {
        "pattern": "^(free|pro|enterprise)$"
      }
    },
    "sendWelcomeEmail": {
      "type": "boolean",
      "default": true
    }
  },
  "nodes": [
    {
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "name": "Create User in Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [450, 300],
      "parameters": {
        "operation": "insert",
        "schema": "public",
        "table": "users",
        "columns": "email,password_hash,first_name,last_name",
        "values": "={{$json.email}},={{$json.password_hash}},={{$json.first_name}},={{$json.last_name}}"
      }
    },
    {
      "name": "Hash Password",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [350, 300],
      "parameters": {
        "functionCode": "const bcrypt = require('bcrypt');\nconst password = '{{password}}';\nconst hash = await bcrypt.hash(password, 10);\nreturn [{ email: '{{email}}', password_hash: hash, first_name: '{{firstName}}', last_name: '{{lastName}}' }];"
      }
    },
    {
      "name": "Create Profile",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [650, 300],
      "parameters": {
        "operation": "insert",
        "schema": "public",
        "table": "user_profiles",
        "columns": "user_id",
        "values": "={{$json.id}}"
      }
    },
    {
      "name": "Check Send Email",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300],
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.sendWelcomeEmail}}",
              "value2": true
            }
          ]
        }
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [1050, 200],
      "parameters": {
        "toEmail": "={{$json.email}}",
        "subject": "Welcome to LightDom!",
        "emailType": "html",
        "message": "<h1>Welcome {{firstName}}!</h1><p>Your account has been created successfully.</p>"
      }
    },
    {
      "name": "Assign Plan",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [1050, 400],
      "parameters": {
        "operation": "insert",
        "schema": "public",
        "table": "user_subscriptions",
        "columns": "user_id,plan_id,status",
        "values": "={{$json.user_id}},={{$json.plan_id}},='active'"
      }
    }
  ],
  "connections": {
    "Start": {
      "main": [[{ "node": "Hash Password", "type": "main", "index": 0 }]]
    },
    "Hash Password": {
      "main": [[{ "node": "Create User in Database", "type": "main", "index": 0 }]]
    },
    "Create User in Database": {
      "main": [[{ "node": "Create Profile", "type": "main", "index": 0 }]]
    },
    "Create Profile": {
      "main": [[{ "node": "Check Send Email", "type": "main", "index": 0 }]]
    },
    "Check Send Email": {
      "main": [
        [{ "node": "Send Welcome Email", "type": "main", "index": 0 }],
        [{ "node": "Assign Plan", "type": "main", "index": 0 }]
      ]
    },
    "Send Welcome Email": {
      "main": [[{ "node": "Assign Plan", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Workflow Orchestration

### n8n API Integration

```javascript
// services/n8n-integration.js
import axios from 'axios';

export class N8nIntegration {
  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = process.env.N8N_API_KEY;
  }

  /**
   * Create workflow in n8n
   */
  async createWorkflow(workflowDefinition) {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/workflows`,
      {
        name: workflowDefinition.name,
        nodes: workflowDefinition.nodes,
        connections: workflowDefinition.connections,
        settings: workflowDefinition.settings,
        active: true
      },
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );

    return response.data;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, inputData = {}) {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/workflows/${workflowId}/execute`,
      { data: inputData },
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );

    return response.data;
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId) {
    const response = await axios.get(
      `${this.baseUrl}/api/v1/executions/${executionId}`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );

    return response.data;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId, updates) {
    const response = await axios.patch(
      `${this.baseUrl}/api/v1/workflows/${workflowId}`,
      updates,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );

    return response.data;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId) {
    const response = await axios.delete(
      `${this.baseUrl}/api/v1/workflows/${workflowId}`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );

    return response.data;
  }
}
```

---

## Pre-built Templates

### 1. User Management Campaign

```javascript
export const userManagementCampaign = {
  name: 'Complete User Management',
  description: 'User creation, payment, and onboarding',
  templates: [
    {
      template_id: 'user-creation-workflow',
      name: 'Create User',
      order: 1,
      variables: {
        email: '{{campaign.email}}',
        password: '{{campaign.password}}',
        firstName: '{{campaign.firstName}}',
        lastName: '{{campaign.lastName}}'
      }
    },
    {
      template_id: 'sso-linking-workflow',
      name: 'Link SSO Accounts',
      order: 2,
      condition: '{{campaign.ssoProviders}} !== undefined'
    },
    {
      template_id: 'stripe-setup-workflow',
      name: 'Setup Payment',
      order: 3,
      condition: '{{campaign.planType}} !== "free"'
    },
    {
      template_id: 'portfolio-creation-workflow',
      name: 'Create Portfolio',
      order: 4
    }
  ],
  execution_mode: 'sequential'
};
```

### 2. Payment Processing Workflow

```javascript
export const paymentProcessingWorkflow = {
  id: 'payment-processing-workflow',
  name: 'Payment Processing Workflow',
  category: 'payment',
  variables: {
    userId: { type: 'string', required: true },
    priceId: { type: 'string', required: true },
    paymentMethodId: { type: 'string' }
  },
  nodes: [
    // Stripe customer creation
    // Subscription creation
    // Payment confirmation
    // Invoice generation
    // Notification sending
  ]
};
```

---

## Integration with Services

### API Routes for Template Management

```javascript
// api/workflow-template-routes.js
import express from 'express';
import { WorkflowTemplateGenerator } from '../services/workflow-template-generator.js';
import { WorkflowBundler } from '../services/workflow-bundler.js';
import { N8nIntegration } from '../services/n8n-integration.js';

const router = express.Router();

// Create template
router.post('/templates', async (req, res) => {
  try {
    const generator = new WorkflowTemplateGenerator(req.app.locals.db);
    const template = await generator.createTemplate(req.body);
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate instance from template
router.post('/templates/:id/instances', async (req, res) => {
  try {
    const { id } = req.params;
    const generator = new WorkflowTemplateGenerator(req.app.locals.db);
    const instance = await generator.generateInstance(id, req.body);

    // Create in n8n
    const n8n = new N8nIntegration();
    const n8nWorkflow = await n8n.createWorkflow(instance.workflow_definition);

    // Update instance with n8n ID
    await req.app.locals.db.query(
      'UPDATE workflow_instances SET n8n_workflow_id = $1 WHERE id = $2',
      [n8nWorkflow.id, instance.id]
    );

    res.json({ instance, n8nWorkflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute workflow instance
router.post('/instances/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { inputData = {} } = req.body;

    // Get instance
    const result = await req.app.locals.db.query(
      'SELECT * FROM workflow_instances WHERE id = $1',
      [id]
    );

    const instance = result.rows[0];

    // Execute in n8n
    const n8n = new N8nIntegration();
    const execution = await n8n.executeWorkflow(instance.n8n_workflow_id, inputData);

    // Log execution
    await req.app.locals.db.query(
      `INSERT INTO workflow_executions 
       (workflow_instance_id, n8n_execution_id, status, started_at, execution_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, execution.id, execution.status, new Date(), JSON.stringify(execution)]
    );

    res.json({ execution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create and execute bundle
router.post('/bundles/execute', async (req, res) => {
  try {
    const generator = new WorkflowTemplateGenerator(req.app.locals.db);
    const bundler = new WorkflowBundler(req.app.locals.db, generator);

    const bundle = await bundler.createBundle(req.body);
    const results = await bundler.executeBundle(bundle);

    res.json({ bundle, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## Best Practices

1. **Use schema validation** for all templates
2. **Version your templates** for backward compatibility
3. **Test templates** before production use
4. **Document variables** clearly
5. **Implement error handling** in workflows
6. **Use idempotent operations** where possible
7. **Log all executions** for debugging
8. **Monitor workflow performance**
9. **Implement retry logic** for critical workflows
10. **Keep templates modular** and reusable

---

## Next Steps

- Setup [Workflow Monitoring](./WORKFLOW_MONITORING.md)
- Implement [Workflow Versioning](./WORKFLOW_VERSIONING.md)
- Create [Custom Nodes](./CUSTOM_N8N_NODES.md)
