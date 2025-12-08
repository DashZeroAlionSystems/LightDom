/**
 * Workflow Generator Service
 * Generates self-executing workflows with minimal user interaction
 * Integrates data mining, schema linking, and component generation
 */

import pg from 'pg';
import ConfigurationManager from './configuration-manager.js';
import SchemaLinkingService from './schema-linking-service.js';

const { Pool } = pg;

export class WorkflowGenerator {
  constructor(dbConfig = null) {
    this.configManager = new ConfigurationManager();
    this.schemaService = new SchemaLinkingService(dbConfig);
    this.pool = new Pool(dbConfig || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5434,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'lightdom_user',
      password: process.env.DB_PASSWORD || 'lightdom_password',
    });
  }

  /**
   * Generate a complete workflow from a simple prompt
   */
  async generateWorkflowFromPrompt(prompt) {
    console.log('🚀 Generating workflow from prompt...\n');
    console.log(`Prompt: "${prompt}"\n`);

    const workflow = {
      id: `workflow-${Date.now()}`,
      name: this.extractWorkflowName(prompt),
      prompt,
      atoms: [],
      components: [],
      dashboards: [],
      settings: [],
      tables: [],
      generatedAt: new Date().toISOString()
    };

    // Step 1: Data Mining - Discover relevant tables
    console.log('📊 Step 1: Data Mining...');
    const tables = await this.mineDataSources(prompt);
    workflow.tables = tables;
    console.log(`   Found ${tables.length} relevant tables\n`);

    // Step 2: Schema Linking - Analyze table relationships
    console.log('🔗 Step 2: Schema Linking...');
    await this.schemaService.analyzeDatabaseSchema();
    console.log('   Schema analysis complete\n');

    // Step 3: Generate Atoms - Create atomic components for each field
    console.log('⚛️  Step 3: Generating Atoms...');
    for (const table of tables) {
      const atoms = await this.generateAtomsForTable(table);
      workflow.atoms.push(...atoms);
    }
    console.log(`   Generated ${workflow.atoms.length} atoms\n`);

    // Step 4: Bundle Atoms into Components
    console.log('🧩 Step 4: Bundling Components...');
    for (const table of tables) {
      const tableAtoms = workflow.atoms.filter(a => a.table === table.name);
      const component = await this.configManager.bundleAtomsToComponent(
        table.name,
        tableAtoms.map(a => a.name),
        { table: table.name, schema: table.schema }
      );
      workflow.components.push(component);
    }
    console.log(`   Created ${workflow.components.length} components\n`);

    // Step 5: Generate Dashboards
    console.log('📋 Step 5: Generating Dashboards...');
    const dashboard = await this.configManager.bundleComponentsToDashboard(
      workflow.name,
      workflow.components
    );
    workflow.dashboards.push(dashboard);
    console.log(`   Created ${workflow.dashboards.length} dashboards\n`);

    // Step 6: Auto-populate Settings
    console.log('⚙️  Step 6: Populating Settings...');
    for (const component of workflow.components) {
      const settings = await this.autoPopulateSettings(component);
      workflow.settings.push(...settings);
    }
    console.log(`   Populated ${workflow.settings.length} settings\n`);

    // Step 7: Save as reusable Setup
    console.log('💾 Step 7: Saving Setup...');
    await this.configManager.saveSetup(workflow.name, {
      ...workflow,
      type: 'complete-workflow',
      reusable: true,
      automated: true
    });
    console.log(`   Setup saved: ${workflow.name}\n`);

    console.log('✅ Workflow generation complete!\n');
    
    return workflow;
  }

  /**
   * Extract workflow name from prompt
   */
  extractWorkflowName(prompt) {
    // Simple name extraction - could be enhanced with NLP
    const words = prompt.toLowerCase().split(' ');
    const keywords = ['create', 'generate', 'build', 'setup', 'configure'];
    
    // Remove common words and take first few significant words
    const significantWords = words
      .filter(w => !keywords.includes(w) && w.length > 3)
      .slice(0, 3);
    
    return significantWords.join('-') || 'auto-workflow';
  }

  /**
   * Mine data sources based on prompt
   */
  async mineDataSources(prompt) {
    const client = await this.pool.connect();
    
    try {
      // Get all tables
      const { rows: tables } = await client.query(`
        SELECT 
          table_schema,
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns 
           WHERE table_schema = t.table_schema 
           AND table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_name
      `);

      // Filter tables based on prompt keywords
      const keywords = this.extractKeywords(prompt);
      const relevantTables = tables.filter(table => {
        const tableName = table.table_name.toLowerCase();
        return keywords.some(keyword => tableName.includes(keyword));
      });

      // If no matches, return all tables (for demo purposes)
      const selectedTables = relevantTables.length > 0 ? relevantTables : tables.slice(0, 5);

      // Get column details for selected tables
      const tablesWithColumns = [];
      for (const table of selectedTables) {
        const { rows: columns } = await client.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position
        `, [table.table_schema, table.table_name]);

        tablesWithColumns.push({
          schema: table.table_schema,
          name: table.table_name,
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default,
            maxLength: col.character_maximum_length
          }))
        });
      }

      return tablesWithColumns;
      
    } finally {
      client.release();
    }
  }

  /**
   * Extract keywords from prompt
   */
  extractKeywords(prompt) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = prompt.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3 && !commonWords.includes(w));
  }

  /**
   * Generate atoms for a table
   */
  async generateAtomsForTable(table) {
    const atoms = [];

    for (const column of table.columns) {
      // Skip system fields
      if (['id', 'created_at', 'updated_at'].includes(column.name)) {
        continue;
      }

      const atomConfig = {
        table: table.name,
        field: column.name,
        label: this.configManager.formatFieldName(column.name),
        dataType: column.type,
        required: !column.nullable,
        componentType: this.configManager.mapColumnTypeToComponent(column.type),
        validation: this.configManager.generateValidation(column),
        defaultValue: column.default || null,
        options: await this.populateFieldOptions(table.name, column)
      };

      const atom = await this.configManager.saveAtom(
        `${table.name}-${column.name}`,
        atomConfig
      );
      
      atoms.push(atom);
    }

    return atoms;
  }

  /**
   * Auto-populate options for dropdown fields
   */
  async populateFieldOptions(tableName, column) {
    // Check if this is an enum or foreign key field
    const client = await this.pool.connect();
    
    try {
      // Check for enum types
      const { rows: enumRows } = await client.query(`
        SELECT e.enumlabel as value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = $1
      `, [column.type]);

      if (enumRows.length > 0) {
        return enumRows.map(row => ({
          label: row.value,
          value: row.value
        }));
      }

      // Check for foreign key relationships
      const { rows: fkRows } = await client.query(`
        SELECT
          ccu.table_name AS foreign_table,
          ccu.column_name AS foreign_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1
          AND kcu.column_name = $2
      `, [tableName, column.name]);

      if (fkRows.length > 0) {
        const fk = fkRows[0];
        // Get some sample values from the foreign table
        const { rows: sampleRows } = await client.query(`
          SELECT ${fk.foreign_column} as value
          FROM ${fk.foreign_table}
          LIMIT 10
        `);

        return sampleRows.map(row => ({
          label: String(row.value),
          value: row.value
        }));
      }

      // For varchar fields with limited distinct values, create options
      if (column.type === 'character varying' || column.type === 'varchar') {
        try {
          const { rows: distinctRows } = await client.query(`
            SELECT DISTINCT ${column.name} as value
            FROM ${tableName}
            WHERE ${column.name} IS NOT NULL
            LIMIT 20
          `);

          if (distinctRows.length > 0 && distinctRows.length <= 15) {
            return distinctRows.map(row => ({
              label: String(row.value),
              value: row.value
            }));
          }
        } catch (err) {
          // Table might not exist or have data yet
          return null;
        }
      }

      return null;
      
    } catch (error) {
      console.error('Error populating options:', error.message);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Auto-populate settings for a component
   */
  async autoPopulateSettings(component) {
    const settings = [];

    for (const atom of component.atoms || []) {
      // Create setting configurations for each atom
      const settingConfig = {
        componentType: atom.componentType,
        field: atom.field,
        label: atom.label,
        required: atom.required,
        validation: atom.validation,
        options: atom.options,
        defaultValue: atom.defaultValue
      };

      // Save as reusable setting
      const setting = await this.configManager.saveSetting(
        `${component.name}-${atom.field}`,
        settingConfig
      );

      settings.push(setting);
    }

    return settings;
  }

  /**
   * Execute a generated workflow
   */
  async executeGeneratedWorkflow(workflowName, userInputs = {}) {
    console.log(`\n🎬 Executing workflow: ${workflowName}\n`);

    const setup = await this.configManager.loadSetup(workflowName);
    if (!setup) {
      throw new Error(`Setup not found: ${workflowName}`);
    }

    const results = {
      workflowName,
      startedAt: new Date().toISOString(),
      steps: [],
      dataInserted: [],
      success: false
    };

    try {
      // For each component in the workflow
      for (const component of setup.components || []) {
        console.log(`  Processing component: ${component.name}`);

        // Get user inputs for this component or use defaults
        const componentInputs = userInputs[component.name] || {};

        // Insert data into database table
        const insertResult = await this.insertDataFromComponent(
          component,
          componentInputs
        );

        results.steps.push({
          component: component.name,
          action: 'insert-data',
          result: insertResult,
          timestamp: new Date().toISOString()
        });

        if (insertResult.success) {
          results.dataInserted.push(insertResult);
          console.log(`    ✅ Data inserted into ${component.table || component.name}`);
        }
      }

      results.completedAt = new Date().toISOString();
      results.success = true;
      console.log(`\n✅ Workflow execution completed successfully!\n`);

    } catch (error) {
      console.error(`\n❌ Workflow execution failed: ${error.message}\n`);
      results.error = error.message;
    }

    return results;
  }

  /**
   * Insert data from component configuration
   */
  async insertDataFromComponent(component, userInputs) {
    const tableName = component.table || component.name;
    const client = await this.pool.connect();

    try {
      // Build insert query from atoms
      const fields = [];
      const values = [];
      const placeholders = [];

      let paramIndex = 1;
      for (const atom of component.atoms || []) {
        const value = userInputs[atom.field] || atom.defaultValue;
        
        // Skip if no value and field is nullable
        if (value === null || value === undefined) {
          if (atom.required) {
            throw new Error(`Required field missing: ${atom.field}`);
          }
          continue;
        }

        fields.push(atom.field);
        values.push(value);
        placeholders.push(`$${paramIndex++}`);
      }

      if (fields.length === 0) {
        return {
          success: false,
          message: 'No fields to insert'
        };
      }

      // Execute insert
      const query = `
        INSERT INTO ${tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const { rows } = await client.query(query, values);

      return {
        success: true,
        table: tableName,
        fieldsInserted: fields.length,
        insertedData: rows[0]
      };

    } catch (error) {
      return {
        success: false,
        table: tableName,
        error: error.message
      };
    } finally {
      client.release();
    }
  }

  /**
   * Generate a self-documenting workflow configuration file
   */
  async generateWorkflowConfig(workflowName) {
    const setup = await this.configManager.loadSetup(workflowName);
    if (!setup) {
      throw new Error(`Setup not found: ${workflowName}`);
    }

    const config = {
      name: workflowName,
      version: '1.0.0',
      description: `Auto-generated workflow for ${workflowName}`,
      setup: setup,
      usage: {
        minimal: `await executeGeneratedWorkflow('${workflowName}')`,
        withInputs: `await executeGeneratedWorkflow('${workflowName}', { /* inputs */ })`
      },
      components: setup.components?.map(c => ({
        name: c.name,
        atoms: c.atoms?.length || 0,
        table: c.table
      })),
      requirements: {
        userInteraction: 'minimal',
        automation: 'full',
        dataSources: setup.tables?.map(t => t.name) || []
      }
    };

    return config;
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
    if (this.schemaService) {
      await this.schemaService.close();
    }
  }
}

export default WorkflowGenerator;
