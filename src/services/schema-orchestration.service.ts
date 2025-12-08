import pool from '../config/database';

interface WorkflowTemplate {
  template_id?: string;
  name: string;
  description?: string;
  category?: string;
  schema: any;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface SchemaLink {
  link_id?: string;
  source_schema_id: string;
  target_schema_id: string;
  link_type: string;
  link_config?: any;
  created_at?: Date;
}

interface SchemaHierarchy {
  hierarchy_id?: string;
  name: string;
  root_schema_id: string;
  level: number;
  parent_hierarchy_id?: string;
  use_case: string;
  config?: any;
  created_at?: Date;
}

interface WorkflowSimulation {
  simulation_id?: string;
  workflow_id: string;
  input_data: any;
  simulated_output?: any;
  estimated_duration_ms?: number;
  resource_requirements?: any;
  validation_results?: any;
  created_at?: Date;
}

export class SchemaOrchestrationService {
  // Workflow Templates
  async createWorkflowTemplate(template: WorkflowTemplate): Promise<WorkflowTemplate> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO workflow_templates 
         (name, description, category, schema, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          template.name,
          template.description || null,
          template.category || 'general',
          JSON.stringify(template.schema),
          template.is_active !== false
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    const result = await pool.query(
      'SELECT * FROM workflow_templates WHERE template_id = $1',
      [templateId]
    );
    return result.rows[0] || null;
  }

  async listWorkflowTemplates(category?: string, active?: boolean): Promise<WorkflowTemplate[]> {
    let query = 'SELECT * FROM workflow_templates WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(active);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateWorkflowTemplate(templateId: string, updates: Partial<WorkflowTemplate>): Promise<WorkflowTemplate | null> {
    const client = await pool.connect();
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name) {
        setClauses.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        setClauses.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.category) {
        setClauses.push(`category = $${paramCount++}`);
        values.push(updates.category);
      }
      if (updates.schema) {
        setClauses.push(`schema = $${paramCount++}`);
        values.push(JSON.stringify(updates.schema));
      }
      if (updates.is_active !== undefined) {
        setClauses.push(`is_active = $${paramCount++}`);
        values.push(updates.is_active);
      }

      if (setClauses.length === 0) {
        return this.getWorkflowTemplate(templateId);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(templateId);

      const result = await client.query(
        `UPDATE workflow_templates 
         SET ${setClauses.join(', ')}
         WHERE template_id = $${paramCount}
         RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Generate Workflow from Template
  async generateWorkflowFromTemplate(
    templateId: string,
    options: { name: string; overrides?: any }
  ): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get template
      const templateResult = await client.query(
        'SELECT * FROM workflow_templates WHERE template_id = $1',
        [templateId]
      );

      if (templateResult.rows.length === 0) {
        throw new Error('Template not found');
      }

      const template = templateResult.rows[0];
      const schema = typeof template.schema === 'string' 
        ? JSON.parse(template.schema) 
        : template.schema;

      // Apply overrides
      const finalSchema = { ...schema, ...(options.overrides || {}) };

      // Create workflow
      const workflowResult = await client.query(
        `INSERT INTO agent_workflows 
         (name, workflow_type, configuration, status, generated_from_template_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          options.name,
          template.category || 'generated',
          JSON.stringify(finalSchema),
          'active',
          templateId
        ]
      );

      const workflow = workflowResult.rows[0];

      // Create workflow steps from schema
      if (schema.steps && Array.isArray(schema.steps)) {
        for (let i = 0; i < schema.steps.length; i++) {
          const step = schema.steps[i];
          await client.query(
            `INSERT INTO workflow_steps 
             (workflow_id, step_name, step_order, service_name, configuration)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              workflow.workflow_id,
              step.name,
              i,
              step.service,
              JSON.stringify(step.config || {})
            ]
          );
        }
      }

      await client.query('COMMIT');
      return workflow;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Generate Campaign from Template
  async generateCampaignFromTemplate(
    templateId: string,
    options: { name: string; schedule_config?: any }
  ): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get template
      const template = await this.getWorkflowTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const schema = typeof template.schema === 'string' 
        ? JSON.parse(template.schema) 
        : template.schema;

      // Create campaign
      const campaignResult = await client.query(
        `INSERT INTO agent_campaigns 
         (name, description, status, schedule_config, generated_from_template_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          options.name,
          template.description || `Generated from ${template.name}`,
          'active',
          JSON.stringify(options.schedule_config || {}),
          templateId
        ]
      );

      const campaign = campaignResult.rows[0];

      // Create workflows from schema
      if (schema.workflows && Array.isArray(schema.workflows)) {
        for (const workflowDef of schema.workflows) {
          const workflow = await this.generateWorkflowFromTemplate(
            workflowDef.template_id || templateId,
            { name: workflowDef.name, overrides: workflowDef.config }
          );

          // Link workflow to campaign
          await client.query(
            `INSERT INTO campaign_workflows 
             (campaign_id, workflow_id, execution_order)
             VALUES ($1, $2, $3)`,
            [campaign.campaign_id, workflow.workflow_id, workflowDef.order || 0]
          );
        }
      }

      await client.query('COMMIT');
      return campaign;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Schema Links
  async linkSchemas(
    sourceSchemaId: string,
    targetSchemaId: string,
    linkType: string,
    linkConfig?: any
  ): Promise<SchemaLink> {
    const result = await pool.query(
      `INSERT INTO schema_links 
       (source_schema_id, target_schema_id, link_type, link_config)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        sourceSchemaId,
        targetSchemaId,
        linkType,
        linkConfig ? JSON.stringify(linkConfig) : null
      ]
    );
    return result.rows[0];
  }

  async getLinkedSchemas(schemaId: string, linkType?: string): Promise<SchemaLink[]> {
    let query = `
      SELECT * FROM schema_links 
      WHERE source_schema_id = $1 OR target_schema_id = $1
    `;
    const params: any[] = [schemaId];

    if (linkType) {
      query += ' AND link_type = $2';
      params.push(linkType);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getSchemaMap(rootSchemaId: string, maxDepth: number = 3): Promise<any> {
    const visited = new Set<string>();
    const map: any = { schema_id: rootSchemaId, links: [] };

    const traverse = async (schemaId: string, depth: number): Promise<any> => {
      if (depth >= maxDepth || visited.has(schemaId)) {
        return null;
      }

      visited.add(schemaId);

      const links = await this.getLinkedSchemas(schemaId);
      const linkedSchemas = [];

      for (const link of links) {
        const targetId = link.source_schema_id === schemaId 
          ? link.target_schema_id 
          : link.source_schema_id;

        const subMap = await traverse(targetId, depth + 1);
        if (subMap) {
          linkedSchemas.push({
            link_type: link.link_type,
            link_config: link.link_config,
            schema: subMap
          });
        }
      }

      return { schema_id: schemaId, depth, links: linkedSchemas };
    };

    return await traverse(rootSchemaId, 0);
  }

  // Schema Hierarchies
  async createSchemaHierarchy(hierarchy: SchemaHierarchy): Promise<SchemaHierarchy> {
    const result = await pool.query(
      `INSERT INTO schema_hierarchies 
       (name, root_schema_id, level, parent_hierarchy_id, use_case, config)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        hierarchy.name,
        hierarchy.root_schema_id,
        hierarchy.level,
        hierarchy.parent_hierarchy_id || null,
        hierarchy.use_case,
        hierarchy.config ? JSON.stringify(hierarchy.config) : null
      ]
    );
    return result.rows[0];
  }

  async getSchemaHierarchy(hierarchyId: string): Promise<SchemaHierarchy | null> {
    const result = await pool.query(
      'SELECT * FROM schema_hierarchies WHERE hierarchy_id = $1',
      [hierarchyId]
    );
    return result.rows[0] || null;
  }

  async getHierarchiesByUseCase(useCase: string): Promise<SchemaHierarchy[]> {
    const result = await pool.query(
      'SELECT * FROM schema_hierarchies WHERE use_case = $1 ORDER BY level',
      [useCase]
    );
    return result.rows;
  }

  // Workflow Simulation
  async simulateWorkflow(
    workflowId: string,
    inputData: any
  ): Promise<WorkflowSimulation> {
    const client = await pool.connect();
    try {
      // Get workflow
      const workflowResult = await client.query(
        'SELECT * FROM agent_workflows WHERE workflow_id = $1',
        [workflowId]
      );

      if (workflowResult.rows.length === 0) {
        throw new Error('Workflow not found');
      }

      const workflow = workflowResult.rows[0];

      // Get workflow steps
      const stepsResult = await client.query(
        'SELECT * FROM workflow_steps WHERE workflow_id = $1 ORDER BY step_order',
        [workflowId]
      );

      const steps = stepsResult.rows;

      // Simulate execution
      let simulatedOutput = inputData;
      let estimatedDuration = 0;
      const resourceRequirements: any = {
        cpu: 0,
        memory: 0,
        network: 0
      };

      for (const step of steps) {
        // Estimate duration (mock: 1000ms per step)
        estimatedDuration += 1000;

        // Estimate resources (mock)
        resourceRequirements.cpu += 10;
        resourceRequirements.memory += 100;
        resourceRequirements.network += 50;

        // Mock transformation
        simulatedOutput = {
          ...simulatedOutput,
          [`${step.step_name}_result`]: 'simulated_value'
        };
      }

      // Validate simulation
      const validationResults = {
        is_valid: true,
        warnings: [],
        errors: []
      };

      // Save simulation
      const result = await client.query(
        `INSERT INTO workflow_simulations 
         (workflow_id, input_data, simulated_output, estimated_duration_ms, 
          resource_requirements, validation_results)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          workflowId,
          JSON.stringify(inputData),
          JSON.stringify(simulatedOutput),
          estimatedDuration,
          JSON.stringify(resourceRequirements),
          JSON.stringify(validationResults)
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getWorkflowSimulations(workflowId: string): Promise<WorkflowSimulation[]> {
    const result = await pool.query(
      `SELECT * FROM workflow_simulations 
       WHERE workflow_id = $1 
       ORDER BY created_at DESC`,
      [workflowId]
    );
    return result.rows;
  }
}

export default new SchemaOrchestrationService();
