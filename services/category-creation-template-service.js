/**
 * Category Creation Template Service
 * 
 * Template-driven architecture for automatic code generation and scaffolding.
 * When a category is created, this service automatically generates:
 * - CRUD API endpoints
 * - Database schema
 * - Service class with methods
 * - UI components (optional)
 * - Tests (optional)
 * 
 * Features:
 * - Creation templates define structure and behavior
 * - Deletion templates with cleanup rules
 * - Category rules engine applies to all instances
 * - Config-driven class creation
 * - Template inheritance and composition
 * - Auto-registration in system
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export class CategoryCreationTemplateService {
  constructor(dbPool) {
    this.db = dbPool;
    this.templates = new Map(); // category -> template
    this.categoryRules = new Map(); // category -> rules
    this.generatedArtifacts = new Map(); // category -> generated files
    
    // Load default templates
    this.loadDefaultTemplates();
  }

  /**
   * Load default templates for standard categories
   */
  loadDefaultTemplates() {
    // Service category template
    this.templates.set('service', {
      category: 'service',
      description: 'API service instances with health monitoring',
      scaffolding: {
        generateCRUD: true,
        generateAPI: true,
        generateService: true,
        generateUI: true,
        generateTests: false,
        generateMigration: true
      },
      schema: {
        tableName: 'service_instances',
        fields: [
          { name: 'id', type: 'TEXT', primaryKey: true },
          { name: 'name', type: 'TEXT', notNull: true },
          { name: 'service_type', type: 'TEXT', notNull: true },
          { name: 'status', type: 'TEXT', default: "'stopped'" },
          { name: 'instance_config', type: 'JSONB', default: "'{}'" },
          { name: 'api_functions', type: 'JSONB', default: "'[]'" },
          { name: 'health_check_config', type: 'JSONB', default: "'{}'" },
          { name: 'last_health_check', type: 'TIMESTAMP' },
          { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
        ],
        indexes: [
          { name: 'idx_service_status', fields: ['status'] },
          { name: 'idx_service_type', fields: ['service_type'] },
          { name: 'idx_service_config', type: 'GIN', fields: ['instance_config'] }
        ],
        constraints: [
          { type: 'CHECK', condition: "status IN ('stopped', 'starting', 'running', 'stopping', 'error')" }
        ]
      },
      rules: {
        onCreate: [
          { rule: 'generate-api-endpoints', enabled: true },
          { rule: 'register-health-check', enabled: true },
          { rule: 'create-default-functions', enabled: true }
        ],
        onUpdate: [
          { rule: 'update-health-status', enabled: true },
          { rule: 'trigger-restart-if-config-changed', enabled: false }
        ],
        onDelete: [
          { rule: 'cleanup-dependencies', cascade: true },
          { rule: 'archive-logs', enabled: true },
          { rule: 'remove-api-routes', enabled: true }
        ],
        validation: [
          { field: 'name', type: 'string', required: true, minLength: 3 },
          { field: 'service_type', type: 'string', required: true, enum: ['api', 'worker', 'scheduler'] }
        ]
      },
      api: {
        basePath: '/api/services',
        endpoints: [
          { method: 'POST', path: '', handler: 'create', middleware: ['validateRequest'] },
          { method: 'GET', path: '', handler: 'findAll', middleware: [] },
          { method: 'GET', path: '/:id', handler: 'findById', middleware: [] },
          { method: 'PATCH', path: '/:id', handler: 'update', middleware: ['validateRequest'] },
          { method: 'DELETE', path: '/:id', handler: 'delete', middleware: ['confirmDeletion'] },
          { method: 'GET', path: '/:id/health', handler: 'checkHealth', middleware: [] },
          { method: 'POST', path: '/:id/start', handler: 'start', middleware: [] },
          { method: 'POST', path: '/:id/stop', handler: 'stop', middleware: [] },
          { method: 'POST', path: '/:id/restart', handler: 'restart', middleware: [] }
        ],
        customEndpoints: []
      },
      service: {
        className: 'ServiceInstanceManager',
        methods: [
          'create', 'findAll', 'findById', 'update', 'delete',
          'start', 'stop', 'restart', 'checkHealth', 'updateHealthStatus'
        ],
        lifecycle: {
          beforeCreate: ['validateConfig', 'assignId'],
          afterCreate: ['registerHealthCheck', 'createApiEndpoints'],
          beforeDelete: ['stopIfRunning', 'cleanupDependencies'],
          afterDelete: ['archiveLogs', 'removeApiRoutes']
        },
        dependencies: ['database', 'apiRouter', 'healthMonitor']
      },
      ui: {
        components: ['ServiceList', 'ServiceDetail', 'ServiceForm'],
        views: ['list', 'detail', 'create', 'edit'],
        features: ['search', 'filter', 'pagination', 'statusIndicator']
      }
    });

    // Campaign category template
    this.templates.set('campaign', {
      category: 'campaign',
      description: 'Crawler campaign instances',
      inheritsFrom: ['service'],
      scaffolding: {
        generateCRUD: true,
        generateAPI: true,
        generateService: true,
        generateUI: true,
        generateTests: false,
        generateMigration: true
      },
      config: {
        instances: {
          crawler: { count: 'config.maxCrawlers', type: 'crawler' },
          seeder: { count: 2, types: ['sitemap', 'search'] },
          miner: { count: 1, type: 'data_mining' },
          network: { count: 1, type: 'neural_network', optional: true }
        },
        workflows: {
          autoCreate: true,
          templates: ['schema-discovered', 'url-collected', 'data-mined', 'error-threshold']
        }
      },
      schema: {
        tableName: 'campaigns',
        fields: [
          { name: 'id', type: 'TEXT', primaryKey: true },
          { name: 'name', type: 'TEXT', notNull: true },
          { name: 'status', type: 'TEXT', default: "'draft'" },
          { name: 'campaign_type', type: 'TEXT', default: "'general'" },
          { name: 'target_url', type: 'TEXT' },
          { name: 'config', type: 'JSONB', default: "'{}'" },
          { name: 'progress', type: 'INTEGER', default: '0' },
          { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
        ],
        indexes: [
          { name: 'idx_campaign_status', fields: ['status'] },
          { name: 'idx_campaign_type', fields: ['campaign_type'] },
          { name: 'idx_campaign_config', type: 'GIN', fields: ['config'] }
        ]
      },
      rules: {
        onCreate: [
          { rule: 'auto-create-cluster', enabled: true },
          { rule: 'setup-default-seeders', enabled: true },
          { rule: 'create-workflow-triggers', enabled: true },
          { rule: 'initialize-instances', enabled: true }
        ],
        onDelete: [
          { rule: 'cleanup-instances', cascade: true },
          { rule: 'archive-data', enabled: true },
          { rule: 'remove-triggers', enabled: true }
        ],
        validation: [
          { field: 'name', type: 'string', required: true },
          { field: 'targetUrl', type: 'url', required: true }
        ]
      },
      api: {
        basePath: '/api/campaigns',
        endpoints: [
          { method: 'POST', path: '', handler: 'create' },
          { method: 'GET', path: '', handler: 'findAll' },
          { method: 'GET', path: '/:id', handler: 'findById' },
          { method: 'PATCH', path: '/:id', handler: 'update' },
          { method: 'DELETE', path: '/:id', handler: 'delete' },
          { method: 'POST', path: '/:id/start', handler: 'start' },
          { method: 'POST', path: '/:id/pause', handler: 'pause' },
          { method: 'POST', path: '/:id/stop', handler: 'stop' },
          { method: 'GET', path: '/:id/instances', handler: 'getInstances' }
        ]
      }
    });

    // Workflow category template
    this.templates.set('workflow', {
      category: 'workflow',
      description: 'n8n workflow instances',
      scaffolding: {
        generateCRUD: true,
        generateAPI: true,
        generateService: true,
        generateUI: true,
        generateMigration: true
      },
      schema: {
        tableName: 'workflow_instances',
        fields: [
          { name: 'id', type: 'TEXT', primaryKey: true },
          { name: 'name', type: 'TEXT', notNull: true },
          { name: 'status', type: 'TEXT', default: "'draft'" },
          { name: 'workflow_type', type: 'TEXT', notNull: true },
          { name: 'n8n_workflow_id', type: 'TEXT' },
          { name: 'steps', type: 'JSONB', default: "'[]'" },
          { name: 'variables', type: 'JSONB', default: "'{}'" },
          { name: 'trigger_config', type: 'JSONB', default: "'{}'" },
          { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
        ],
        indexes: [
          { name: 'idx_workflow_status', fields: ['status'] },
          { name: 'idx_workflow_type', fields: ['workflow_type'] }
        ]
      },
      rules: {
        onCreate: [
          { rule: 'deploy-to-n8n', enabled: true },
          { rule: 'register-triggers', enabled: true }
        ],
        onDelete: [
          { rule: 'remove-from-n8n', enabled: true },
          { rule: 'cleanup-triggers', enabled: true }
        ]
      },
      api: {
        basePath: '/api/workflows',
        endpoints: [
          { method: 'POST', path: '', handler: 'create' },
          { method: 'GET', path: '', handler: 'findAll' },
          { method: 'GET', path: '/:id', handler: 'findById' },
          { method: 'PATCH', path: '/:id', handler: 'update' },
          { method: 'DELETE', path: '/:id', handler: 'delete' },
          { method: 'POST', path: '/:id/execute', handler: 'execute' },
          { method: 'GET', path: '/:id/executions', handler: 'getExecutions' }
        ]
      }
    });
  }

  /**
   * Create new instance from category template
   */
  async createFromTemplate(data) {
    const { category, name, config } = data;
    
    const template = this.templates.get(category);
    if (!template) {
      throw new Error(`No template found for category: ${category}`);
    }

    // Generate scaffolding
    const artifacts = await this.generateScaffolding(template, data);
    
    // Apply creation rules
    await this.applyCreationRules(template, data);
    
    // Create database record
    const instance = await this.createDatabaseRecord(template, data);
    
    // Register API endpoints
    if (template.scaffolding.generateAPI) {
      await this.registerApiEndpoints(template, instance);
    }
    
    // Store generated artifacts
    this.generatedArtifacts.set(instance.id, artifacts);
    
    return {
      instance,
      artifacts,
      template: template.category
    };
  }

  /**
   * Generate all scaffolding artifacts
   */
  async generateScaffolding(template, data) {
    const artifacts = {
      migration: null,
      service: null,
      api: null,
      ui: null,
      tests: null
    };

    if (template.scaffolding.generateMigration) {
      artifacts.migration = this.generateMigration(template);
    }

    if (template.scaffolding.generateService) {
      artifacts.service = this.generateService(template);
    }

    if (template.scaffolding.generateAPI) {
      artifacts.api = this.generateApiRoutes(template);
    }

    if (template.scaffolding.generateUI) {
      artifacts.ui = this.generateUIComponents(template);
    }

    if (template.scaffolding.generateTests) {
      artifacts.tests = this.generateTests(template);
    }

    return artifacts;
  }

  /**
   * Generate database migration
   */
  generateMigration(template) {
    const { tableName, fields, indexes, constraints = [] } = template.schema;
    
    let sql = `-- Auto-generated migration for ${template.category}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    
    // Fields
    const fieldDefs = fields.map(field => {
      let def = `  ${field.name} ${field.type}`;
      if (field.primaryKey) def += ' PRIMARY KEY';
      if (field.notNull) def += ' NOT NULL';
      if (field.default) def += ` DEFAULT ${field.default}`;
      return def;
    });
    
    sql += fieldDefs.join(',\n');
    sql += '\n);\n\n';
    
    // Indexes
    if (indexes) {
      indexes.forEach(index => {
        const indexType = index.type || 'BTREE';
        sql += `CREATE INDEX IF NOT EXISTS ${index.name} ON ${tableName} `;
        if (index.type === 'GIN') {
          sql += `USING GIN (${index.fields.join(', ')});\n`;
        } else {
          sql += `(${index.fields.join(', ')});\n`;
        }
      });
    }
    
    // Constraints
    if (constraints.length > 0) {
      constraints.forEach(constraint => {
        sql += `\nALTER TABLE ${tableName} ADD CONSTRAINT ${constraint.name || 'check_constraint'} `;
        sql += `CHECK (${constraint.condition});\n`;
      });
    }
    
    return sql;
  }

  /**
   * Generate service class
   */
  generateService(template) {
    const className = template.service?.className || `${template.category}Service`;
    const methods = template.service?.methods || ['create', 'findAll', 'findById', 'update', 'delete'];
    
    let code = `/**\n * Auto-generated ${className}\n * Category: ${template.category}\n */\n\n`;
    code += `export class ${className} {\n`;
    code += `  constructor(dbPool) {\n`;
    code += `    this.db = dbPool;\n`;
    code += `    this.tableName = '${template.schema.tableName}';\n`;
    code += `  }\n\n`;
    
    // Generate CRUD methods
    if (methods.includes('create')) {
      code += `  async create(data) {\n`;
      code += `    const id = data.id || this.generateId();\n`;
      code += `    const query = \`INSERT INTO \${this.tableName} (id, name, config, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *\`;\n`;
      code += `    const result = await this.db.query(query, [id, data.name, JSON.stringify(data.config || {})]);\n`;
      code += `    return result.rows[0];\n`;
      code += `  }\n\n`;
    }
    
    if (methods.includes('findAll')) {
      code += `  async findAll(filters = {}) {\n`;
      code += `    let query = \`SELECT * FROM \${this.tableName}\`;\n`;
      code += `    const params = [];\n`;
      code += `    if (filters.status) {\n`;
      code += `      query += ' WHERE status = $1';\n`;
      code += `      params.push(filters.status);\n`;
      code += `    }\n`;
      code += `    query += ' ORDER BY created_at DESC';\n`;
      code += `    const result = await this.db.query(query, params);\n`;
      code += `    return result.rows;\n`;
      code += `  }\n\n`;
    }
    
    if (methods.includes('findById')) {
      code += `  async findById(id) {\n`;
      code += `    const query = \`SELECT * FROM \${this.tableName} WHERE id = $1\`;\n`;
      code += `    const result = await this.db.query(query, [id]);\n`;
      code += `    return result.rows[0];\n`;
      code += `  }\n\n`;
    }
    
    if (methods.includes('update')) {
      code += `  async update(id, data) {\n`;
      code += `    const query = \`UPDATE \${this.tableName} SET name = $1, config = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *\`;\n`;
      code += `    const result = await this.db.query(query, [data.name, JSON.stringify(data.config || {}), id]);\n`;
      code += `    return result.rows[0];\n`;
      code += `  }\n\n`;
    }
    
    if (methods.includes('delete')) {
      code += `  async delete(id) {\n`;
      code += `    const query = \`DELETE FROM \${this.tableName} WHERE id = $1 RETURNING *\`;\n`;
      code += `    const result = await this.db.query(query, [id]);\n`;
      code += `    return result.rows[0];\n`;
      code += `  }\n\n`;
    }
    
    code += `  generateId() {\n`;
    code += `    return '${template.category}_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);\n`;
    code += `  }\n`;
    code += `}\n`;
    
    return code;
  }

  /**
   * Generate API routes
   */
  generateApiRoutes(template) {
    const basePath = template.api.basePath;
    const endpoints = template.api.endpoints;
    
    let code = `/**\n * Auto-generated API routes for ${template.category}\n */\n\n`;
    code += `import express from 'express';\n`;
    code += `const router = express.Router();\n\n`;
    
    endpoints.forEach(endpoint => {
      const method = endpoint.method.toLowerCase();
      code += `// ${endpoint.method} ${basePath}${endpoint.path}\n`;
      code += `router.${method}('${endpoint.path}', async (req, res) => {\n`;
      code += `  try {\n`;
      
      if (endpoint.handler === 'create') {
        code += `    const result = await service.create(req.body);\n`;
        code += `    res.status(201).json(result);\n`;
      } else if (endpoint.handler === 'findAll') {
        code += `    const results = await service.findAll(req.query);\n`;
        code += `    res.json(results);\n`;
      } else if (endpoint.handler === 'findById') {
        code += `    const result = await service.findById(req.params.id);\n`;
        code += `    if (!result) return res.status(404).json({ error: 'Not found' });\n`;
        code += `    res.json(result);\n`;
      } else if (endpoint.handler === 'update') {
        code += `    const result = await service.update(req.params.id, req.body);\n`;
        code += `    res.json(result);\n`;
      } else if (endpoint.handler === 'delete') {
        code += `    const result = await service.delete(req.params.id);\n`;
        code += `    res.json(result);\n`;
      } else {
        code += `    // Custom handler: ${endpoint.handler}\n`;
        code += `    res.json({ message: 'Handler not implemented' });\n`;
      }
      
      code += `  } catch (error) {\n`;
      code += `    res.status(500).json({ error: error.message });\n`;
      code += `  }\n`;
      code += `});\n\n`;
    });
    
    code += `export default router;\n`;
    
    return code;
  }

  /**
   * Generate UI components
   */
  generateUIComponents(template) {
    const components = [];
    
    if (template.ui?.components.includes('ServiceList')) {
      components.push({
        name: `${template.category}List.tsx`,
        code: this.generateListComponent(template)
      });
    }
    
    return components;
  }

  generateListComponent(template) {
    const componentName = `${template.category.charAt(0).toUpperCase() + template.category.slice(1)}List`;
    
    let code = `import React, { useEffect, useState } from 'react';\n`;
    code += `import { Table, Tag } from 'antd';\n`;
    code += `import axios from 'axios';\n\n`;
    code += `const ${componentName} = () => {\n`;
    code += `  const [data, setData] = useState([]);\n`;
    code += `  const [loading, setLoading] = useState(false);\n\n`;
    code += `  useEffect(() => {\n`;
    code += `    fetchData();\n`;
    code += `  }, []);\n\n`;
    code += `  const fetchData = async () => {\n`;
    code += `    setLoading(true);\n`;
    code += `    const response = await axios.get('${template.api.basePath}');\n`;
    code += `    setData(response.data);\n`;
    code += `    setLoading(false);\n`;
    code += `  };\n\n`;
    code += `  const columns = [\n`;
    code += `    { title: 'ID', dataIndex: 'id', key: 'id' },\n`;
    code += `    { title: 'Name', dataIndex: 'name', key: 'name' },\n`;
    code += `    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag>{status}</Tag> },\n`;
    code += `  ];\n\n`;
    code += `  return <Table dataSource={data} columns={columns} loading={loading} />;\n`;
    code += `};\n\n`;
    code += `export default ${componentName};\n`;
    
    return code;
  }

  /**
   * Generate tests
   */
  generateTests(template) {
    return `// Tests for ${template.category}\n// TODO: Implement tests\n`;
  }

  /**
   * Apply creation rules
   */
  async applyCreationRules(template, data) {
    const rules = template.rules?.onCreate || [];
    
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      switch (rule.rule) {
        case 'generate-api-endpoints':
          // Already handled in scaffolding
          break;
        case 'auto-create-cluster':
          // Create cluster for campaign
          break;
        case 'setup-default-seeders':
          // Create seeder instances
          break;
        case 'create-workflow-triggers':
          // Create n8n triggers
          break;
        case 'initialize-instances':
          // Initialize all configured instances
          break;
      }
    }
  }

  /**
   * Create database record
   */
  async createDatabaseRecord(template, data) {
    const { tableName } = template.schema;
    const id = data.id || this.generateId(template.category);
    
    const query = `
      INSERT INTO ${tableName} (id, name, config, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    try {
      const result = await this.db.query(query, [
        id,
        data.name,
        JSON.stringify(data.config || {})
      ]);
      
      return result.rows[0];
    } catch (error) {
      // Table might not exist, create it
      await this.createTableFromTemplate(template);
      // Retry
      const result = await this.db.query(query, [
        id,
        data.name,
        JSON.stringify(data.config || {})
      ]);
      
      return result.rows[0];
    }
  }

  /**
   * Create table from template
   */
  async createTableFromTemplate(template) {
    const migration = this.generateMigration(template);
    await this.db.query(migration);
  }

  /**
   * Register API endpoints
   */
  async registerApiEndpoints(template, instance) {
    // Store endpoints in registry
    // In production, this would integrate with Express router
    console.log(`Registered API endpoints for ${template.category}:`, template.api.basePath);
  }

  /**
   * Add category rules
   */
  async addCategoryRules(category, rules) {
    this.categoryRules.set(category, rules);
    
    // Update template with new rules
    const template = this.templates.get(category);
    if (template) {
      template.rules = { ...template.rules, ...rules };
    }
  }

  /**
   * Get template for category
   */
  getTemplate(category) {
    return this.templates.get(category);
  }

  /**
   * List all templates
   */
  listTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Generate unique ID
   */
  generateId(category) {
    return `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CategoryCreationTemplateService;
