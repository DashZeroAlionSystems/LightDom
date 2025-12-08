/**
 * Workflow Wizard Configuration Service
 * 
 * Manages workflow wizard configurations for building
 * services and endpoint chains through a guided UI.
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

class WorkflowWizardService {
  constructor(dbPool) {
    this.db = dbPool;
  }

  /**
   * Create a new wizard configuration
   */
  async createWizardConfig(configData) {
    const query = `
      INSERT INTO workflow_wizard_configs (
        config_id, name, description, category, wizard_type,
        steps, form_schema, validation_rules,
        available_endpoints, available_services, presets,
        ui_config, help_text,
        required_fields, field_dependencies,
        output_template, is_active, version
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING *
    `;

    const configId = configData.config_id || `wizard_${uuidv4()}`;

    const values = [
      configId,
      configData.name,
      configData.description || null,
      configData.category || null,
      configData.wizard_type,
      JSON.stringify(configData.steps),
      JSON.stringify(configData.form_schema),
      JSON.stringify(configData.validation_rules || {}),
      JSON.stringify(configData.available_endpoints || []),
      JSON.stringify(configData.available_services || []),
      JSON.stringify(configData.presets || []),
      JSON.stringify(configData.ui_config || {}),
      JSON.stringify(configData.help_text || {}),
      JSON.stringify(configData.required_fields || []),
      JSON.stringify(configData.field_dependencies || {}),
      JSON.stringify(configData.output_template || null),
      configData.is_active !== undefined ? configData.is_active : true,
      configData.version || '1.0.0'
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get wizard configuration by ID
   */
  async getWizardConfig(configId) {
    const query = 'SELECT * FROM workflow_wizard_configs WHERE config_id = $1';
    const result = await this.db.query(query, [configId]);
    return result.rows[0];
  }

  /**
   * Get all wizard configurations
   */
  async getAllWizardConfigs(filters = {}) {
    let query = 'SELECT * FROM workflow_wizard_configs WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters.wizard_type) {
      query += ` AND wizard_type = $${paramIndex}`;
      values.push(filters.wizard_type);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(filters.is_active);
      paramIndex++;
    }

    query += ' ORDER BY category, name';

    const result = await this.db.query(query, values);
    return result.rows;
  }

  /**
   * Update wizard configuration
   */
  async updateWizardConfig(configId, updates) {
    const allowedFields = [
      'name', 'description', 'category', 'wizard_type',
      'steps', 'form_schema', 'validation_rules',
      'available_endpoints', 'available_services', 'presets',
      'ui_config', 'help_text',
      'required_fields', 'field_dependencies',
      'output_template', 'is_active', 'version'
    ];

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        
        // Handle JSONB fields
        const jsonbFields = [
          'steps', 'form_schema', 'validation_rules',
          'available_endpoints', 'available_services', 'presets',
          'ui_config', 'help_text',
          'required_fields', 'field_dependencies', 'output_template'
        ];
        
        if (jsonbFields.includes(key)) {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
        
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(configId);
    const query = `
      UPDATE workflow_wizard_configs 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE config_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete wizard configuration
   */
  async deleteWizardConfig(configId) {
    const query = 'DELETE FROM workflow_wizard_configs WHERE config_id = $1 RETURNING *';
    const result = await this.db.query(query, [configId]);
    return result.rows[0];
  }

  /**
   * Generate wizard from endpoint category
   */
  async generateWizardFromCategory(category, registryService) {
    // Get endpoints in category
    const endpoints = await registryService.getEndpoints({ category, is_active: true });
    
    if (endpoints.length === 0) {
      throw new Error(`No endpoints found in category: ${category}`);
    }

    // Generate wizard steps
    const steps = this.generateWizardSteps(endpoints, category);
    
    // Generate form schema
    const formSchema = this.generateFormSchema(endpoints);
    
    // Create wizard config
    const wizardConfig = {
      name: `${category} Workflow Wizard`,
      description: `Auto-generated wizard for ${category} endpoints`,
      category,
      wizard_type: 'service-composition',
      steps,
      form_schema: formSchema,
      available_endpoints: endpoints.map(e => e.endpoint_id),
      validation_rules: this.generateValidationRules(endpoints),
      ui_config: this.generateUIConfig(category),
      help_text: this.generateHelpText(endpoints)
    };

    return await this.createWizardConfig(wizardConfig);
  }

  /**
   * Generate wizard steps from endpoints
   */
  generateWizardSteps(endpoints, category) {
    const steps = [
      {
        id: 'workflow-info',
        title: 'Workflow Information',
        description: 'Enter basic workflow details',
        fields: ['name', 'description', 'category']
      },
      {
        id: 'select-endpoints',
        title: 'Select Endpoints',
        description: 'Choose which endpoints to include',
        fields: ['endpoints'],
        component: 'EndpointSelector',
        config: {
          category,
          allowMultiple: true,
          showPreview: true
        }
      },
      {
        id: 'configure-flow',
        title: 'Configure Data Flow',
        description: 'Define how data flows between endpoints',
        fields: ['execution_order', 'data_mappings'],
        component: 'FlowConfigurator'
      },
      {
        id: 'advanced-settings',
        title: 'Advanced Settings',
        description: 'Configure error handling and retries',
        fields: ['retry_policy', 'error_handling', 'timeout'],
        optional: true
      },
      {
        id: 'review',
        title: 'Review & Create',
        description: 'Review your workflow configuration',
        component: 'WorkflowPreview',
        fields: []
      }
    ];

    return steps;
  }

  /**
   * Generate JSON Schema for form
   */
  generateFormSchema(endpoints) {
    return {
      type: 'object',
      required: ['name', 'endpoints'],
      properties: {
        name: {
          type: 'string',
          title: 'Workflow Name',
          minLength: 3,
          maxLength: 255
        },
        description: {
          type: 'string',
          title: 'Description',
          maxLength: 1000
        },
        category: {
          type: 'string',
          title: 'Category',
          enum: [...new Set(endpoints.map(e => e.category).filter(Boolean))]
        },
        endpoints: {
          type: 'array',
          title: 'Endpoints',
          items: {
            type: 'object',
            required: ['endpoint_id'],
            properties: {
              endpoint_id: {
                type: 'string',
                enum: endpoints.map(e => e.endpoint_id)
              },
              order: {
                type: 'integer',
                minimum: 0
              },
              condition: {
                type: 'object'
              }
            }
          },
          minItems: 1
        },
        execution_order: {
          type: 'string',
          title: 'Execution Order',
          enum: ['sequential', 'parallel', 'conditional'],
          default: 'sequential'
        },
        data_mappings: {
          type: 'object',
          title: 'Data Mappings',
          additionalProperties: true
        },
        retry_policy: {
          type: 'object',
          title: 'Retry Policy',
          properties: {
            maxRetries: {
              type: 'integer',
              minimum: 0,
              maximum: 10,
              default: 3
            },
            backoff: {
              type: 'string',
              enum: ['none', 'linear', 'exponential'],
              default: 'exponential'
            }
          }
        },
        error_handling: {
          type: 'string',
          title: 'Error Handling',
          enum: ['stop', 'continue', 'retry'],
          default: 'continue'
        },
        timeout: {
          type: 'integer',
          title: 'Timeout (ms)',
          minimum: 1000,
          maximum: 300000,
          default: 30000
        }
      }
    };
  }

  /**
   * Generate validation rules
   */
  generateValidationRules(endpoints) {
    return {
      endpoints: {
        minItems: 1,
        uniqueEndpoints: true
      },
      name: {
        pattern: '^[a-zA-Z0-9\\s-_]+$'
      }
    };
  }

  /**
   * Generate UI configuration
   */
  generateUIConfig(category) {
    return {
      theme: 'default',
      layout: 'stepper',
      showProgress: true,
      allowBack: true,
      showValidation: 'onBlur',
      submitButtonText: 'Create Workflow',
      categoryIcon: this.getCategoryIcon(category)
    };
  }

  /**
   * Generate contextual help text
   */
  generateHelpText(endpoints) {
    return {
      'workflow-info': {
        title: 'Workflow Basics',
        content: 'Give your workflow a descriptive name and description to help identify it later.',
        tips: [
          'Use clear, descriptive names',
          'Include the purpose in the description',
          'Choose an appropriate category'
        ]
      },
      'select-endpoints': {
        title: 'Choose Your Endpoints',
        content: `Select from ${endpoints.length} available endpoints to build your workflow.`,
        tips: [
          'You can select multiple endpoints',
          'Preview endpoint details before adding',
          'Consider the order of execution'
        ]
      },
      'configure-flow': {
        title: 'Data Flow Configuration',
        content: 'Define how data moves between your selected endpoints.',
        tips: [
          'Map output from one endpoint to input of another',
          'Use variables to store intermediate results',
          'Test your data flow before finalizing'
        ]
      }
    };
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const iconMap = {
      'workflow': '🔄',
      'data-mining': '⛏️',
      'ai': '🤖',
      'blockchain': '⛓️',
      'database': '🗄️',
      'api': '🔌'
    };
    
    const categoryLower = category?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryLower.includes(key)) {
        return icon;
      }
    }
    
    return '📋';
  }

  /**
   * Process wizard submission to create workflow
   */
  async processWizardSubmission(configId, formData, registryService, orchestratorService) {
    const config = await this.getWizardConfig(configId);
    
    if (!config) {
      throw new Error('Wizard configuration not found');
    }

    // Validate form data against schema
    // In production, use a JSON Schema validator like ajv
    
    // Create workflow based on wizard type
    let result;
    
    switch (config.wizard_type) {
      case 'service-composition':
        result = await this.createServiceComposition(formData, registryService);
        break;
      case 'endpoint-chain':
        result = await this.createEndpointChain(formData, registryService);
        break;
      case 'data-pipeline':
        result = await this.createDataPipeline(formData, registryService);
        break;
      default:
        throw new Error(`Unknown wizard type: ${config.wizard_type}`);
    }

    return result;
  }

  /**
   * Create service composition from wizard data
   */
  async createServiceComposition(formData, registryService) {
    // Create workflow service
    const serviceQuery = `
      INSERT INTO workflow_services (
        service_id, workflow_id, name, description, service_type,
        bundled_endpoints, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING *
    `;

    const serviceId = `service_${uuidv4()}`;
    const workflowId = formData.workflow_id || `workflow_${uuidv4()}`;

    const serviceValues = [
      serviceId,
      workflowId,
      formData.name,
      formData.description,
      'composed',
      JSON.stringify(formData.endpoints.map(e => e.endpoint_id)),
      true
    ];

    const serviceResult = await this.db.query(serviceQuery, serviceValues);
    const service = serviceResult.rows[0];

    // Bind endpoints to service
    for (let i = 0; i < formData.endpoints.length; i++) {
      const endpoint = formData.endpoints[i];
      await registryService.bindEndpointToService(serviceId, endpoint.endpoint_id, {
        binding_order: endpoint.order || i,
        input_mapping: endpoint.input_mapping || {},
        output_mapping: endpoint.output_mapping || {},
        condition: endpoint.condition
      });
    }

    return {
      type: 'service',
      service,
      binding_count: formData.endpoints.length
    };
  }

  /**
   * Create endpoint chain from wizard data
   */
  async createEndpointChain(formData, registryService) {
    const chain = await registryService.createEndpointChain(
      formData.workflow_id || `workflow_${uuidv4()}`,
      {
        name: formData.name,
        description: formData.description,
        chain_type: formData.execution_order || 'sequential',
        endpoints: formData.endpoints,
        data_flow: formData.data_mappings || {},
        timeout_ms: formData.timeout || 30000,
        retry_strategy: formData.retry_policy || {},
        rollback_on_error: formData.error_handling === 'rollback'
      }
    );

    return {
      type: 'chain',
      chain
    };
  }

  /**
   * Create data pipeline from wizard data
   */
  async createDataPipeline(formData, registryService) {
    // Similar to endpoint chain but with data transformation focus
    return await this.createEndpointChain(formData, registryService);
  }
}

export default WorkflowWizardService;
