# Service Campaigns & Bundling - Complete Guide

## Overview

This comprehensive guide explains how to create, manage, and deploy service campaigns that bundle multiple services, workflows, and API endpoints into cohesive, reusable solutions.

## Table of Contents

1. [Campaign Architecture](#campaign-architecture)
2. [Service Organization](#service-organization)
3. [Campaign Creation Workflow](#campaign-creation-workflow)
4. [Configuration Management](#configuration-management)
5. [Component Generation](#component-generation)
6. [DeepSeek Integration](#deepseek-integration)
7. [Campaign Examples](#campaign-examples)
8. [Best Practices](#best-practices)

---

## Campaign Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                          CAMPAIGN                              │
│  (Complete solution for a business goal)                       │
└────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │ Service │         │ Service │        │ Service │
   │ Bundle 1│         │ Bundle 2│        │ Bundle 3│
   └────┬────┘         └────┬────┘        └────┬────┘
        │                   │                   │
   ┌────┼────┐         ┌────┼────┐        ┌────┼────┐
   │    │    │         │    │    │        │    │    │
  API  n8n  DB        API  n8n  UI       API Config Data
```

### Campaign Hierarchy

1. **Campaign** - Complete business solution
2. **Service Bundles** - Grouped functionality
3. **Components** - Individual services/APIs/workflows
4. **Configuration** - Schema-driven settings

---

## Service Organization

### Service Bundle Structure

```javascript
// Service Bundle Definition
const serviceBundleStructure = {
  id: 'unique-id',
  name: 'Service Bundle Name',
  description: 'What this bundle does',
  category: 'user-management | payment | analytics | integration',
  
  // API Endpoints
  endpoints: [
    {
      id: 'endpoint-1',
      method: 'POST',
      path: '/api/users',
      handler: 'createUser'
    }
  ],
  
  // n8n Workflows
  workflows: [
    {
      id: 'workflow-1',
      template_id: 'user-creation-workflow',
      variables: {}
    }
  ],
  
  // UI Components
  components: [
    {
      id: 'component-1',
      type: 'form',
      schema: {}
    }
  ],
  
  // Database Operations
  database: {
    tables: ['users', 'user_profiles'],
    migrations: ['add_users_table.sql']
  },
  
  // Configuration Schema
  config_schema: {
    type: 'object',
    properties: {}
  },
  
  // Dependencies
  dependencies: ['auth-service', 'email-service'],
  
  // Metadata
  metadata: {
    version: '1.0.0',
    author: 'System',
    tags: ['user', 'authentication']
  }
};
```

---

## Campaign Creation Workflow

### Step-by-Step Campaign Builder

```javascript
// services/campaign-builder.js
export class CampaignBuilder {
  constructor(dbPool) {
    this.db = dbPool;
    this.services = [];
    this.config = {};
  }

  /**
   * Define campaign
   */
  defineCampaign(definition) {
    this.name = definition.name;
    this.description = definition.description;
    this.type = definition.type;
    this.goals = definition.goals || [];
    return this;
  }

  /**
   * Add service bundle
   */
  addService(serviceName, config = {}) {
    this.services.push({
      name: serviceName,
      config,
      order: this.services.length
    });
    return this;
  }

  /**
   * Set campaign configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Build and deploy campaign
   */
  async build() {
    // Validate campaign
    this.validate();

    // Create campaign record
    const campaign = await this.createCampaignRecord();

    // Link services
    await this.linkServices(campaign.id);

    // Generate workflows
    await this.generateWorkflows(campaign.id);

    // Deploy components
    await this.deployComponents(campaign.id);

    // Setup configuration
    await this.setupConfiguration(campaign.id);

    return campaign;
  }

  validate() {
    if (!this.name) {
      throw new Error('Campaign name is required');
    }
    if (this.services.length === 0) {
      throw new Error('Campaign must have at least one service');
    }
  }

  async createCampaignRecord() {
    const result = await this.db.query(
      `INSERT INTO campaigns 
       (name, description, campaign_type, workflow_config, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        this.name,
        this.description,
        this.type,
        JSON.stringify({
          services: this.services,
          goals: this.goals
        }),
        JSON.stringify(this.config)
      ]
    );

    return result.rows[0];
  }

  async linkServices(campaignId) {
    for (const service of this.services) {
      // Get service bundle
      const serviceResult = await this.db.query(
        'SELECT id FROM service_bundles WHERE name = $1',
        [service.name]
      );

      if (serviceResult.rows.length === 0) {
        throw new Error(`Service '${service.name}' not found`);
      }

      const serviceId = serviceResult.rows[0].id;

      // Link to campaign
      await this.db.query(
        `INSERT INTO campaign_services 
         (campaign_id, service_id, execution_order, config)
         VALUES ($1, $2, $3, $4)`,
        [
          campaignId,
          serviceId,
          service.order,
          JSON.stringify(service.config)
        ]
      );
    }
  }

  async generateWorkflows(campaignId) {
    // Generate workflows based on campaign configuration
    // This would integrate with WorkflowTemplateGenerator
  }

  async deployComponents(campaignId) {
    // Deploy UI components, API routes, etc.
  }

  async setupConfiguration(campaignId) {
    // Setup configuration management
  }
}
```

---

## Configuration Management

### Schema-Driven Configuration

```javascript
// services/campaign-config-manager.js
export class CampaignConfigManager {
  constructor(dbPool) {
    this.db = dbPool;
  }

  /**
   * Define configuration schema for campaign
   */
  async defineSchema(campaignId, schema) {
    const result = await this.db.query(
      `INSERT INTO campaign_config_schemas 
       (campaign_id, schema_definition)
       VALUES ($1, $2)
       ON CONFLICT (campaign_id) DO UPDATE 
       SET schema_definition = EXCLUDED.schema_definition
       RETURNING *`,
      [campaignId, JSON.stringify(schema)]
    );

    return result.rows[0];
  }

  /**
   * Get campaign configuration with defaults
   */
  async getConfig(campaignId) {
    // Get schema
    const schemaResult = await this.db.query(
      'SELECT schema_definition FROM campaign_config_schemas WHERE campaign_id = $1',
      [campaignId]
    );

    const schema = schemaResult.rows[0]?.schema_definition || {};

    // Get current config
    const configResult = await this.db.query(
      'SELECT metadata FROM campaigns WHERE id = $1',
      [campaignId]
    );

    const currentConfig = configResult.rows[0]?.metadata || {};

    // Merge with defaults from schema
    const finalConfig = this.mergeWithDefaults(schema, currentConfig);

    return finalConfig;
  }

  mergeWithDefaults(schema, config) {
    const result = { ...config };

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (!(key in result) && 'default' in prop) {
          result[key] = prop.default;
        }
      }
    }

    return result;
  }

  /**
   * Update campaign configuration
   */
  async updateConfig(campaignId, updates) {
    // Get schema for validation
    const schemaResult = await this.db.query(
      'SELECT schema_definition FROM campaign_config_schemas WHERE campaign_id = $1',
      [campaignId]
    );

    const schema = schemaResult.rows[0]?.schema_definition;

    // Validate against schema
    if (schema) {
      this.validateConfig(schema, updates);
    }

    // Update config
    const result = await this.db.query(
      `UPDATE campaigns 
       SET metadata = metadata || $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updates), campaignId]
    );

    return result.rows[0];
  }

  validateConfig(schema, config) {
    // Use Ajv or similar for JSON schema validation
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
      throw new Error(`Configuration validation failed: ${JSON.stringify(validate.errors)}`);
    }

    return true;
  }
}
```

---

## Component Generation

### Schema-Driven Component Generator

```javascript
// services/component-generator.js
export class ComponentGenerator {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Generate CRUD components from schema
   */
  generateCRUDComponents(entityName, schema) {
    const components = {
      list: this.generateListComponent(entityName, schema),
      create: this.generateCreateComponent(entityName, schema),
      edit: this.generateEditComponent(entityName, schema),
      view: this.generateViewComponent(entityName, schema),
      delete: this.generateDeleteComponent(entityName, schema)
    };

    return components;
  }

  /**
   * Generate list component
   */
  generateListComponent(entityName, schema) {
    const columns = this.extractColumns(schema);

    return {
      type: 'Table',
      name: `${entityName}List`,
      props: {
        columns,
        dataSource: `/${entityName.toLowerCase()}s`,
        pagination: true,
        searchable: true,
        filterable: true
      },
      actions: [
        { type: 'create', route: 'create' },
        { type: 'edit', route: 'edit/:id' },
        { type: 'delete', confirm: true }
      ]
    };
  }

  /**
   * Generate create form component
   */
  generateCreateComponent(entityName, schema) {
    const fields = this.extractFormFields(schema);

    return {
      type: 'Form',
      name: `${entityName}CreateForm`,
      props: {
        fields,
        submitUrl: `/${entityName.toLowerCase()}s`,
        method: 'POST',
        onSuccess: { redirect: 'list' }
      },
      validation: this.extractValidation(schema)
    };
  }

  /**
   * Generate edit form component
   */
  generateEditComponent(entityName, schema) {
    const fields = this.extractFormFields(schema);

    return {
      type: 'Form',
      name: `${entityName}EditForm`,
      props: {
        fields,
        fetchUrl: `/${entityName.toLowerCase()}s/:id`,
        submitUrl: `/${entityName.toLowerCase()}s/:id`,
        method: 'PUT',
        onSuccess: { redirect: 'list' }
      },
      validation: this.extractValidation(schema)
    };
  }

  /**
   * Generate view component
   */
  generateViewComponent(entityName, schema) {
    const fields = this.extractDisplayFields(schema);

    return {
      type: 'Detail',
      name: `${entityName}Detail`,
      props: {
        fields,
        fetchUrl: `/${entityName.toLowerCase()}s/:id`
      },
      actions: [
        { type: 'edit', route: 'edit/:id' },
        { type: 'delete', confirm: true }
      ]
    };
  }

  generateDeleteComponent(entityName, schema) {
    return {
      type: 'DeleteConfirmation',
      name: `${entityName}Delete`,
      props: {
        deleteUrl: `/${entityName.toLowerCase()}s/:id`,
        method: 'DELETE',
        onSuccess: { redirect: 'list' },
        confirmMessage: `Are you sure you want to delete this ${entityName.toLowerCase()}?`
      }
    };
  }

  extractColumns(schema) {
    if (!schema.properties) return [];

    return Object.entries(schema.properties)
      .filter(([key, prop]) => !prop.hidden)
      .map(([key, prop]) => ({
        key,
        title: prop.title || this.titleCase(key),
        dataIndex: key,
        type: prop.type,
        sortable: prop.sortable !== false,
        filterable: prop.filterable !== false
      }));
  }

  extractFormFields(schema) {
    if (!schema.properties) return [];

    return Object.entries(schema.properties)
      .filter(([key, prop]) => !prop.readonly && !prop.hidden)
      .map(([key, prop]) => ({
        name: key,
        label: prop.title || this.titleCase(key),
        type: this.mapTypeToFormField(prop.type, prop),
        required: schema.required?.includes(key),
        placeholder: prop.description,
        ...this.extractFieldProps(prop)
      }));
  }

  extractDisplayFields(schema) {
    if (!schema.properties) return [];

    return Object.entries(schema.properties)
      .filter(([key, prop]) => !prop.hidden)
      .map(([key, prop]) => ({
        key,
        label: prop.title || this.titleCase(key),
        type: prop.type,
        format: prop.format
      }));
  }

  extractValidation(schema) {
    const validation = {};

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const rules = [];

        if (schema.required?.includes(key)) {
          rules.push({ required: true, message: `${prop.title || key} is required` });
        }

        if (prop.minLength) {
          rules.push({ min: prop.minLength, message: `Minimum length is ${prop.minLength}` });
        }

        if (prop.maxLength) {
          rules.push({ max: prop.maxLength, message: `Maximum length is ${prop.maxLength}` });
        }

        if (prop.pattern) {
          rules.push({ pattern: new RegExp(prop.pattern), message: `Invalid format` });
        }

        if (prop.type === 'string' && prop.format === 'email') {
          rules.push({ type: 'email', message: 'Invalid email address' });
        }

        if (rules.length > 0) {
          validation[key] = rules;
        }
      }
    }

    return validation;
  }

  mapTypeToFormField(type, prop) {
    const typeMap = {
      string: prop.format === 'email' ? 'email' :
              prop.format === 'password' ? 'password' :
              prop.enum ? 'select' : 'text',
      number: 'number',
      integer: 'number',
      boolean: 'checkbox',
      array: 'multiselect',
      object: 'json'
    };

    return typeMap[type] || 'text';
  }

  extractFieldProps(prop) {
    const props = {};

    if (prop.enum) {
      props.options = prop.enum.map(value => ({
        label: value,
        value
      }));
    }

    if (prop.minimum !== undefined) {
      props.min = prop.minimum;
    }

    if (prop.maximum !== undefined) {
      props.max = prop.maximum;
    }

    if (prop.default !== undefined) {
      props.defaultValue = prop.default;
    }

    return props;
  }

  titleCase(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }
}
```

---

## DeepSeek Integration

### Automatic Schema & Component Generation

```javascript
// services/deepseek-campaign-assistant.js
export class DeepSeekCampaignAssistant {
  constructor(deepseekAPI) {
    this.api = deepseekAPI;
  }

  /**
   * Generate campaign from natural language description
   */
  async generateCampaign(description) {
    const prompt = `
Generate a complete service campaign configuration based on this description:

"${description}"

Return a JSON object with:
1. Campaign name and description
2. Required service bundles
3. Configuration schema
4. Workflow definitions
5. Component specifications

Format as valid JSON.
    `;

    const response = await this.api.complete(prompt);
    const config = JSON.parse(response);

    return config;
  }

  /**
   * Fill configuration schema with defaults
   */
  async fillConfigSchema(schema, context = {}) {
    const prompt = `
Given this JSON schema for a campaign configuration:

${JSON.stringify(schema, null, 2)}

And this context:

${JSON.stringify(context, null, 2)}

Generate appropriate default values for all properties based on best practices.
Return as valid JSON matching the schema.
    `;

    const response = await this.api.complete(prompt);
    const config = JSON.parse(response);

    return config;
  }

  /**
   * Generate component from description
   */
  async generateComponent(type, description) {
    const prompt = `
Generate a ${type} component specification for:

"${description}"

Return a JSON object with component configuration including:
- Component type
- Props
- State requirements
- Event handlers
- Validation rules
    `;

    const response = await this.api.complete(prompt);
    const component = JSON.parse(response);

    return component;
  }
}
```

---

## Campaign Examples

### Example 1: Complete User Management Campaign

```javascript
// campaigns/user-management-campaign.js
export const userManagementCampaign = {
  name: 'Complete User Management',
  description: 'End-to-end user lifecycle management including registration, authentication, profiles, and subscriptions',
  type: 'user-management',
  
  services: [
    {
      name: 'user-authentication',
      config: {
        providers: ['email', 'github', 'google'],
        sessionDuration: '7d',
        mfaEnabled: false
      }
    },
    {
      name: 'user-profiles',
      config: {
        requiredFields: ['email', 'firstName', 'lastName'],
        optionalFields: ['bio', 'avatar', 'company']
      }
    },
    {
      name: 'subscription-management',
      config: {
        provider: 'stripe',
        plans: ['free', 'pro', 'enterprise'],
        billingCycles: ['monthly', 'yearly']
      }
    },
    {
      name: 'email-notifications',
      config: {
        provider: 'sendgrid',
        templates: ['welcome', 'verification', 'password-reset']
      }
    }
  ],
  
  workflows: [
    {
      name: 'New User Registration',
      trigger: 'webhook',
      steps: [
        'validate-input',
        'create-user',
        'create-profile',
        'send-verification-email',
        'assign-free-plan'
      ]
    },
    {
      name: 'SSO Login',
      trigger: 'oauth-callback',
      steps: [
        'verify-oauth-token',
        'find-or-create-user',
        'link-oauth-account',
        'create-session'
      ]
    },
    {
      name: 'Subscription Upgrade',
      trigger: 'payment-success',
      steps: [
        'verify-payment',
        'update-subscription',
        'grant-features',
        'send-confirmation-email'
      ]
    }
  ],
  
  components: [
    {
      name: 'RegistrationForm',
      type: 'form',
      fields: ['email', 'password', 'firstName', 'lastName']
    },
    {
      name: 'LoginForm',
      type: 'form',
      fields: ['email', 'password']
    },
    {
      name: 'SSOButtons',
      type: 'oauth',
      providers: ['github', 'google']
    },
    {
      name: 'UserProfileEditor',
      type: 'form',
      fields: ['firstName', 'lastName', 'bio', 'avatar', 'company']
    },
    {
      name: 'SubscriptionPlans',
      type: 'pricing',
      plans: ['free', 'pro', 'enterprise']
    }
  ],
  
  database: {
    tables: [
      'users',
      'user_profiles',
      'oauth_accounts',
      'user_sessions',
      'user_subscriptions',
      'payment_methods'
    ],
    migrations: [
      '001_create_users.sql',
      '002_create_profiles.sql',
      '003_create_oauth_accounts.sql'
    ]
  },
  
  configuration: {
    type: 'object',
    properties: {
      registration: {
        type: 'object',
        properties: {
          requireEmailVerification: {
            type: 'boolean',
            default: true
          },
          allowSocialSignup: {
            type: 'boolean',
            default: true
          },
          defaultPlan: {
            type: 'string',
            enum: ['free', 'pro', 'enterprise'],
            default: 'free'
          }
        }
      },
      authentication: {
        type: 'object',
        properties: {
          sessionDuration: {
            type: 'string',
            default: '7d'
          },
          mfaEnabled: {
            type: 'boolean',
            default: false
          }
        }
      },
      email: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            enum: ['sendgrid', 'mailgun', 'ses'],
            default: 'sendgrid'
          },
          fromEmail: {
            type: 'string',
            format: 'email',
            default: 'noreply@lightdom.com'
          }
        }
      }
    }
  }
};
```

---

## Best Practices

### 1. Campaign Design Principles

- **Single Responsibility**: Each service bundle should have one clear purpose
- **Modularity**: Services should be independently deployable
- **Configuration-Driven**: Use schemas for all configuration
- **Versioning**: Version campaigns and services
- **Documentation**: Document all components and workflows

### 2. Service Bundling

- **Group Related Functionality**: Bundle related endpoints and workflows
- **Minimize Dependencies**: Reduce coupling between services
- **Define Clear Interfaces**: Use well-defined APIs
- **Handle Failures Gracefully**: Implement error handling
- **Monitor Performance**: Track service metrics

### 3. Configuration Management

- **Use JSON Schema**: Define all configuration with schemas
- **Provide Defaults**: Always include sensible defaults
- **Validate Early**: Validate configuration at build time
- **Environment-Specific**: Support environment overrides
- **Hot Reload**: Allow runtime configuration updates

### 4. Component Generation

- **Schema-Driven**: Generate from schemas when possible
- **Consistent Patterns**: Use standard patterns
- **Customizable**: Allow customization of generated components
- **Type-Safe**: Generate TypeScript types
- **Documented**: Auto-generate documentation

### 5. Workflow Organization

- **Clear Dependencies**: Define workflow execution order
- **Error Handling**: Handle errors at each step
- **Idempotent Operations**: Make operations repeatable
- **Logging**: Log all workflow executions
- **Monitoring**: Track workflow success rates

---

## Deployment Process

### 1. Campaign Deployment Workflow

```javascript
// Example deployment script
async function deployCampaign(campaignConfig) {
  const builder = new CampaignBuilder(db);
  
  // Step 1: Define campaign
  const campaign = await builder
    .defineCampaign({
      name: campaignConfig.name,
      description: campaignConfig.description,
      type: campaignConfig.type
    })
    
  // Step 2: Add services
    .addService('user-authentication', campaignConfig.services.auth)
    .addService('user-profiles', campaignConfig.services.profiles)
    .addService('subscription-management', campaignConfig.services.subscriptions)
    
  // Step 3: Set configuration
    .setConfig(campaignConfig.configuration)
    
  // Step 4: Build and deploy
    .build();
    
  console.log(`Campaign '${campaign.name}' deployed successfully`);
  return campaign;
}
```

---

## Next Steps

- Implement [Campaign Monitoring](./CAMPAIGN_MONITORING.md)
- Setup [A/B Testing](./AB_TESTING_CAMPAIGNS.md)
- Create [Campaign Analytics](./CAMPAIGN_ANALYTICS.md)
- Build [Campaign Templates Library](./CAMPAIGN_TEMPLATES.md)
