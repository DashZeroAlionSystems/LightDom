#!/usr/bin/env node

import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/dom_space_harvester';

const categorySeeds = [
  {
    slug: 'demo',
    displayName: 'Demo',
    description: 'Demo navigation grouping for UI previews',
    defaultTable: 'demo_records',
    configTable: 'demo_config',
    autoGenerateCrud: false,
    metadata: { group: 'frontend' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Demo Showcase',
        description: 'Defines demo showcase ordering and metadata',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Demo Name' },
            route: { type: 'string', title: 'Route' },
            description: { type: 'string', title: 'Description' },
            enabled: { type: 'boolean', title: 'Enabled', default: true },
            tags: { type: 'array', title: 'Tags', items: { type: 'string' } }
          }
        },
        uiSchema: {
          description: { 'ui:widget': 'textarea' }
        },
        defaultPayload: {
          enabled: true,
          tags: []
        },
        autoGenerateCrud: false
      }
    ]
  },
  {
    slug: 'campaign',
    displayName: 'Campaign',
    description: 'End-to-end automation campaigns',
    defaultTable: 'campaigns',
    configTable: 'campaign_config',
    autoGenerateCrud: true,
    metadata: { group: 'operations' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Campaign Blueprint',
        description: 'Baseline campaign configuration schema',
        schema: {
          type: 'object',
          required: ['name', 'campaign_type', 'status'],
          properties: {
            name: { type: 'string', title: 'Name' },
            description: { type: 'string', title: 'Description' },
            campaign_type: { type: 'string', title: 'Campaign Type', default: 'general' },
            status: { type: 'string', title: 'Status', enum: ['draft', 'running', 'paused', 'completed'] },
            config: { type: 'object', title: 'Config', additionalProperties: true },
            progress: { type: 'integer', title: 'Progress', minimum: 0, maximum: 100 }
          }
        },
        uiSchema: {
          description: { 'ui:widget': 'textarea' },
          config: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'draft',
          campaign_type: 'general',
          config: {},
          progress: 0
        }
      }
    ]
  },
  {
    slug: 'service',
    displayName: 'Service',
    description: 'Service instances backing automation',
    defaultTable: 'service_instances',
    configTable: 'service_config',
    autoGenerateCrud: true,
    metadata: { group: 'operations' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Service Instance',
        description: 'Service connection and lifecycle configuration',
        schema: {
          type: 'object',
          required: ['name', 'service_type', 'status'],
          properties: {
            name: { type: 'string', title: 'Name' },
            service_type: { type: 'string', title: 'Service Type', default: 'api' },
            status: { type: 'string', title: 'Status', enum: ['stopped', 'running', 'degraded'] },
            instance_config: { type: 'object', title: 'Instance Config', additionalProperties: true },
            api_functions: {
              type: 'array',
              title: 'API Functions',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', title: 'Name' },
                  method: { type: 'string', title: 'HTTP Method' },
                  path: { type: 'string', title: 'Path' }
                }
              }
            },
            health_check_config: { type: 'object', title: 'Health Check', additionalProperties: true }
          }
        },
        uiSchema: {
          instance_config: { 'ui:widget': 'jsonEditor' },
          health_check_config: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'stopped',
          service_type: 'api',
          instance_config: {},
          api_functions: []
        }
      }
    ]
  },
  {
    slug: 'data-stream',
    displayName: 'Data Stream',
    description: 'Pipelines that move data through the platform',
    defaultTable: 'data_stream_instances',
    configTable: 'data_stream_config',
    autoGenerateCrud: true,
    metadata: { group: 'data' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Data Stream Pipeline',
        description: 'Source to destination stream definition',
        schema: {
          type: 'object',
          required: ['name', 'source_type', 'destination_type'],
          properties: {
            name: { type: 'string', title: 'Name' },
            source_type: { type: 'string', title: 'Source Type' },
            destination_type: { type: 'string', title: 'Destination Type' },
            status: { type: 'string', title: 'Status', enum: ['inactive', 'active', 'error'] },
            source_config: { type: 'object', title: 'Source Config', additionalProperties: true },
            destination_config: { type: 'object', title: 'Destination Config', additionalProperties: true },
            transformation_rules: {
              type: 'array',
              title: 'Transformations',
              items: { type: 'object', additionalProperties: true }
            },
            attribute_ids: { type: 'array', title: 'Attribute IDs', items: { type: 'string' } }
          }
        },
        uiSchema: {
          source_config: { 'ui:widget': 'jsonEditor' },
          destination_config: { 'ui:widget': 'jsonEditor' },
          transformation_rules: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'inactive',
          source_config: {},
          destination_config: {},
          transformation_rules: []
        }
      }
    ]
  },
  {
    slug: 'attribute',
    displayName: 'Attribute',
    description: 'Attributes discovered and managed by the system',
    defaultTable: 'attribute_instances',
    configTable: 'attribute_config',
    autoGenerateCrud: true,
    metadata: { group: 'data' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Attribute Definition',
        description: 'Schema for attribute tracking',
        schema: {
          type: 'object',
          required: ['attribute_name', 'attribute_type'],
          properties: {
            attribute_name: { type: 'string', title: 'Attribute Name' },
            entity_type: { type: 'string', title: 'Entity Type' },
            attribute_type: { type: 'string', title: 'Attribute Type', enum: ['string', 'number', 'boolean', 'json'] },
            is_required: { type: 'boolean', title: 'Required', default: false },
            validation_rules: { type: 'object', title: 'Validation Rules', additionalProperties: true },
            display_config: { type: 'object', title: 'Display Config', additionalProperties: true },
            data_stream_ids: { type: 'array', title: 'Linked Streams', items: { type: 'string' } }
          }
        },
        uiSchema: {
          validation_rules: { 'ui:widget': 'jsonEditor' },
          display_config: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          is_required: false,
          validation_rules: {},
          display_config: {}
        }
      }
    ]
  },
  {
    slug: 'model',
    displayName: 'Model',
    description: 'Model registry entries and configuration',
    defaultTable: 'model_registry',
    configTable: 'model_config',
    autoGenerateCrud: true,
    metadata: { group: 'ai' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Model Registry Entry',
        description: 'Model metadata and deployment settings',
        schema: {
          type: 'object',
          required: ['name', 'model_type'],
          properties: {
            name: { type: 'string', title: 'Name' },
            model_type: { type: 'string', title: 'Model Type' },
            provider: { type: 'string', title: 'Provider' },
            status: { type: 'string', title: 'Status', enum: ['draft', 'active', 'retired'] },
            configuration: { type: 'object', title: 'Configuration', additionalProperties: true },
            metadata: { type: 'object', title: 'Metadata', additionalProperties: true }
          }
        },
        uiSchema: {
          configuration: { 'ui:widget': 'jsonEditor' },
          metadata: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'draft',
          configuration: {},
          metadata: {}
        }
      }
    ]
  },
  {
    slug: 'training-data',
    displayName: 'Training Data',
    description: 'Training datasets managed by the platform',
    defaultTable: 'training_datasets',
    configTable: 'training_data_config',
    autoGenerateCrud: true,
    metadata: { group: 'ai' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Dataset Definition',
        description: 'Defines dataset splits and schema',
        schema: {
          type: 'object',
          required: ['name', 'dataset_type'],
          properties: {
            name: { type: 'string', title: 'Name' },
            dataset_type: { type: 'string', title: 'Dataset Type' },
            domain: { type: 'string', title: 'Domain' },
            task: { type: 'string', title: 'Task' },
            split_config: { type: 'object', title: 'Split Config', additionalProperties: true },
            features_schema: { type: 'array', title: 'Features', items: { type: 'object', additionalProperties: true } },
            labels_schema: { type: 'array', title: 'Labels', items: { type: 'object', additionalProperties: true } }
          }
        },
        uiSchema: {
          split_config: { 'ui:widget': 'jsonEditor' },
          features_schema: { 'ui:widget': 'jsonEditor' },
          labels_schema: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          split_config: { train: 0.7, validation: 0.15, test: 0.15 }
        }
      }
    ]
  },
  {
    slug: 'neural-network',
    displayName: 'Neural Network',
    description: 'Neural network instances and lifecycle',
    defaultTable: 'neural_network_instances',
    configTable: 'neural_network_config',
    autoGenerateCrud: true,
    metadata: { group: 'ai' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Neural Network Instance',
        description: 'Architecture and training configuration',
        schema: {
          type: 'object',
          required: ['name', 'model_type'],
          properties: {
            name: { type: 'string', title: 'Name' },
            model_type: { type: 'string', title: 'Model Type' },
            status: { type: 'string', title: 'Status', enum: ['initializing', 'training', 'ready', 'paused', 'error'] },
            architecture: { type: 'object', title: 'Architecture', additionalProperties: true },
            training_config: { type: 'object', title: 'Training Config', additionalProperties: true },
            data_config: { type: 'object', title: 'Data Config', additionalProperties: true }
          }
        },
        uiSchema: {
          architecture: { 'ui:widget': 'jsonEditor' },
          training_config: { 'ui:widget': 'jsonEditor' },
          data_config: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'initializing',
          architecture: {},
          training_config: {},
          data_config: {}
        }
      }
    ]
  },
  {
    slug: 'admin',
    displayName: 'Admin',
    description: 'Administrative and dashboard assets',
    defaultTable: 'admin_nav_templates',
    configTable: 'admin_config',
    autoGenerateCrud: false,
    metadata: { group: 'operations' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Admin Template',
        description: 'Defines admin template visibility and grouping',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Name' },
            category: { type: 'string', title: 'Category' },
            icon: { type: 'string', title: 'Icon' },
            permissions: { type: 'array', title: 'Permissions', items: { type: 'string' } },
            is_active: { type: 'boolean', title: 'Active', default: true }
          }
        },
        defaultPayload: {
          is_active: true,
          permissions: []
        },
        autoGenerateCrud: false
      }
    ]
  },
  {
    slug: 'crawler',
    displayName: 'Crawler',
    description: 'Crawler instances responsible for acquisition',
    defaultTable: 'crawler_instances',
    configTable: 'crawler_config',
    autoGenerateCrud: true,
    metadata: { group: 'data' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Crawler Definition',
        description: 'Crawler runtime configuration',
        schema: {
          type: 'object',
          required: ['name', 'crawler_type'],
          properties: {
            name: { type: 'string', title: 'Name' },
            crawler_type: { type: 'string', title: 'Crawler Type' },
            status: { type: 'string', title: 'Status', enum: ['idle', 'running', 'paused', 'error'] },
            target_config: { type: 'object', title: 'Target Config', additionalProperties: true },
            extraction_rules: { type: 'object', title: 'Extraction Rules', additionalProperties: true },
            concurrency: { type: 'integer', title: 'Concurrency', minimum: 1, default: 1 }
          }
        },
        uiSchema: {
          target_config: { 'ui:widget': 'jsonEditor' },
          extraction_rules: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'idle',
          target_config: {},
          extraction_rules: {},
          concurrency: 1
        }
      }
    ]
  },
  {
    slug: 'seeder',
    displayName: 'Seeder',
    description: 'Seed lists and discovery orchestrators',
    defaultTable: 'seed_instances',
    configTable: 'seeder_config',
    autoGenerateCrud: true,
    metadata: { group: 'data' },
    defaultConfigs: [
      {
        configKey: 'default',
        displayName: 'Seeder Definition',
        description: 'Seeder strategy configuration',
        schema: {
          type: 'object',
          required: ['name', 'seed_type'],
          properties: {
            name: { type: 'string', title: 'Name' },
            seed_type: { type: 'string', title: 'Seed Type', default: 'url' },
            status: { type: 'string', title: 'Status', enum: ['pending', 'active', 'paused', 'completed'] },
            priority: { type: 'integer', title: 'Priority', minimum: 1, maximum: 10, default: 5 },
            seed_value: { type: 'string', title: 'Seed Value' },
            metadata: { type: 'object', title: 'Metadata', additionalProperties: true }
          }
        },
        uiSchema: {
          metadata: { 'ui:widget': 'jsonEditor' }
        },
        defaultPayload: {
          status: 'pending',
          priority: 5,
          metadata: {}
        }
      }
    ]
  }
];

const pool = new Pool({ connectionString });

const safeIdentifier = value => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Invalid identifier: ${value}`);
  }
  return value;
};

const ensureRegistryEntry = async (client, categoryId, tableType, tableName, ensureSchema = {}) => {
  if (!tableName) return;
  safeIdentifier(tableName);
  await client.query(
    `INSERT INTO category_table_registry (category_id, table_type, table_name, ensure_schema)
     VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT (category_id, table_type) DO UPDATE
     SET table_name = EXCLUDED.table_name,
         ensure_schema = EXCLUDED.ensure_schema,
         updated_at = NOW()`,
    [categoryId, tableType, tableName, JSON.stringify(ensureSchema ?? {})]
  );
};

const ensureConfigTable = async (client, categoryId, definition) => {
  if (!definition.configTable) return;
  const tableName = safeIdentifier(definition.configTable);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
       config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
       config_key TEXT NOT NULL,
       display_name TEXT NOT NULL,
       description TEXT,
       schema_definition JSONB DEFAULT '{}'::jsonb,
       ui_schema_definition JSONB DEFAULT '{}'::jsonb,
       default_payload JSONB DEFAULT '{}'::jsonb,
       auto_generate_crud BOOLEAN DEFAULT TRUE,
       is_active BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW(),
       UNIQUE (category_id, config_key)
     );`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${tableName}_category_idx ON ${tableName} (category_id, config_key);`
  );

  if (definition.defaultConfigs?.length) {
    for (const config of definition.defaultConfigs) {
      await client.query(
        `INSERT INTO ${tableName} (category_id, config_key, display_name, description, schema_definition, ui_schema_definition, default_payload, auto_generate_crud, is_active)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)
         ON CONFLICT (category_id, config_key) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             description = EXCLUDED.description,
             schema_definition = EXCLUDED.schema_definition,
             ui_schema_definition = EXCLUDED.ui_schema_definition,
             default_payload = EXCLUDED.default_payload,
             auto_generate_crud = EXCLUDED.auto_generate_crud,
             is_active = EXCLUDED.is_active,
             updated_at = NOW();`,
        [
          categoryId,
          config.configKey,
          config.displayName,
          config.description ?? null,
          JSON.stringify(config.schema ?? {}),
          JSON.stringify(config.uiSchema ?? {}),
          JSON.stringify(config.defaultPayload ?? {}),
          config.autoGenerateCrud ?? definition.autoGenerateCrud ?? true,
          config.isActive ?? true
        ]
      );
    }
  }
};

const ensureCategory = async (client, definition) => {
  const metadata = definition.metadata ?? {};
  const logTable = definition.logTable ?? 'instance_execution_history';

  const result = await client.query(
    `INSERT INTO categories (slug, display_name, description, default_table, config_table, log_table, auto_generate_crud, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     ON CONFLICT (slug) DO UPDATE
     SET display_name = EXCLUDED.display_name,
         description = EXCLUDED.description,
         default_table = EXCLUDED.default_table,
         config_table = EXCLUDED.config_table,
         log_table = EXCLUDED.log_table,
         auto_generate_crud = EXCLUDED.auto_generate_crud,
         metadata = EXCLUDED.metadata,
         updated_at = NOW()
     RETURNING category_id;`,
    [
      definition.slug,
      definition.displayName,
      definition.description ?? null,
      definition.defaultTable,
      definition.configTable,
      logTable,
      definition.autoGenerateCrud ?? true,
      JSON.stringify(metadata)
    ]
  );

  const categoryId = result.rows[0].category_id;

  if (definition.defaultTable) {
    await ensureRegistryEntry(client, categoryId, 'data', definition.defaultTable);
  }

  if (definition.configTable) {
    await ensureConfigTable(client, categoryId, definition);
    await ensureRegistryEntry(client, categoryId, 'config', definition.configTable);
  }

  if (logTable) {
    await ensureRegistryEntry(client, categoryId, 'log', logTable);
  }

  return categoryId;
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const applied = [];

    for (const definition of categorySeeds) {
      const categoryId = await ensureCategory(client, definition);
      applied.push({ slug: definition.slug, categoryId });
    }

    await client.query('COMMIT');
    for (const entry of applied) {
      console.log(`✔ category ${entry.slug} ensured (${entry.categoryId})`);
    }
    console.log('Category registry bootstrap complete.');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    console.error('Failed to bootstrap categories:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch(error => {
  console.error('Unexpected error during bootstrap:', error);
  process.exitCode = 1;
});
