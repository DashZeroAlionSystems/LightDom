import { databaseIntegration } from '../DatabaseIntegration.js';
import { AtomBlueprint, ComponentBlueprint, DashboardBlueprint, WorkflowBlueprint } from './PromptWorkflowBuilder';

const getPool = async () => {
  if (!databaseIntegration) {
    throw new Error('WorkflowRepository: databaseIntegration unavailable in browser context');
  }
  await databaseIntegration.initialize();
  if (!databaseIntegration.pool) {
    throw new Error('WorkflowRepository: database pool not available');
  }
  return databaseIntegration.pool;
};

export interface WorkflowRecord {
  id: string;
  schema_key: string;
  prompt: string;
  dataset_name: string;
  dataset_description: string | null;
  categories: any;
  hyperparameters: any;
  created_by: string | null;
  created_at: string;
}

export interface WorkflowAttributeRecord {
  workflow_id: string;
  attr_key: string;
  label: string;
  category: string | null;
  description: string | null;
  weight: number | null;
  enrichment_prompt?: string | null;
}

export interface WorkflowSeedRecord {
  workflow_id: string;
  url: string;
  intent: string | null;
  cadence: string | null;
  schema_attributes: string[];
  weight: number;
}

export interface WorkflowRunRecord {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  metrics: any;
  notes: string | null;
  created_by: string | null;
}

export interface TrainingArtifactRecord {
  id: string;
  workflow_run_id: string;
  type: string;
  storage_uri: string;
  metadata: any;
  created_at: string;
}

export interface WorkflowTemplateRecord {
  id: string;
  template_key: string;
  label: string;
  description: string | null;
  primary_prompt: string | null;
  schema_context: any;
  default_tasks: any[];
  default_atoms: any[];
  default_components: any[];
  default_dashboards: any[];
  created_by: string | null;
  created_at: string;
}

export interface WorkflowTemplateTaskRecord {
  id: string;
  template_id: string;
  task_key: string;
  task_label: string;
  schema_refs: any[];
  handler_type: string;
  handler_config: any;
  is_optional: boolean;
  ordering: number;
  ui_wizard_step: number | null;
}

export interface WorkflowInstanceRecord {
  id: string;
  template_id: string | null;
  workflow_id: string | null;
  status: string;
  prompt_payload: any;
  active_tasks: any[];
  linked_schema_nodes: any;
  tf_model_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ComponentSchemaLinkRecord {
  id: string;
  component_id: string | null;
  atom_id: string | null;
  schema_uri: string;
  role: string | null;
  style_token_refs: any[];
  metadata: any;
  created_at: string;
}

export interface TfBaseModelRecord {
  id: string;
  model_name: string;
  version: string;
  architecture: string;
  storage_uri: string;
  feature_schema: any;
  last_validated_metrics: any;
  created_at: string;
}

export interface TfModelInstanceRecord {
  id: string;
  workflow_instance_id: string | null;
  base_model_id: string | null;
  status: string;
  training_args: any;
  checkpoint_uri: string | null;
  metadata: any;
  created_at: string;
  completed_at: string | null;
}

export interface WorkflowAdminTask {
  id: string;
  label: string;
  status: string;
  description?: string;
  lastRunAt?: string | null;
}

export interface WorkflowAdminAttribute {
  id: string;
  label: string;
  type?: string | null;
  enrichmentPrompt?: string | null;
  drilldownPrompts?: string[];
  status?: string | null;
}

export interface WorkflowAdminSummary {
  id: string;
  campaignName: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  scriptInjected: boolean;
  n8nWorkflowId?: string | null;
  tensorflowInstanceId?: string | null;
  seoScore?: number | null;
  automationThreshold?: number | null;
  pendingAutomation?: boolean;
  createdAt: string;
  updatedAt: string;
  tasks: WorkflowAdminTask[];
  attributes: WorkflowAdminAttribute[];
}
export interface NeuralNetworkInstanceRecord {
  id: string;
  workflow_id: string | null;
  workflow_instance_id: string | null;
  label: string;
  model_type: string;
  current_version: string | null;
  status: string;
  automation_enabled: boolean;
  config: Record<string, any>;
  metrics: Record<string, any>;
  last_trained_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NeuralTrainingRunRecord {
  id: string;
  neural_instance_id: string;
  training_job_id: string | null;
  workflow_run_id: string | null;
  status: string;
  dataset_overview: Record<string, any>;
  hyperparameters: Record<string, any>;
  metrics: Record<string, any>;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface NeuralTrainingSchemaVersionRecord {
  id: string;
  neural_instance_id: string;
  version: number;
  schema_snapshot: Record<string, any>;
  attributes: any[];
  discovered_links: any[];
  created_at: string;
}

export interface NeuralSchemaLinkRecord {
  id: string;
  workflow_id: string;
  source_type: string;
  source_id: string | null;
  schema_uri: string;
  relation: Record<string, any>;
  confidence: number | null;
  metadata: Record<string, any>;
  discovered_at: string;
}

export interface NeuralAttributeSuggestionRecord {
  id: string;
  workflow_id: string;
  suggestion: Record<string, any>;
  confidence: number | null;
  status: string;
  created_at: string;
  applied_at: string | null;
  applied_attribute_id: string | null;
}



export class WorkflowRepository {
  async initialize() {
    await getPool();
  }

  async createWorkflow(data: Omit<WorkflowRecord, 'created_at'>, attributes: WorkflowAttributeRecord[], seeds: WorkflowSeedRecord[]) {
    await this.initialize();

    const pool = await getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO workflows (id, schema_key, prompt, dataset_name, dataset_description, categories, hyperparameters, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          data.id,
          data.schema_key,
          data.prompt,
          data.dataset_name,
          data.dataset_description,
          JSON.stringify(data.categories ?? []),
          JSON.stringify(data.hyperparameters ?? {}),
          data.created_by ?? null,
        ],
      );

      for (const attr of attributes) {
        await client.query(
          `INSERT INTO workflow_attributes (workflow_id, attr_key, label, category, description, weight)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [data.id, attr.attr_key, attr.label, attr.category ?? null, attr.description ?? null, attr.weight ?? null],
        );
      }

      for (const seed of seeds) {
        await client.query(
          `INSERT INTO workflow_seeds (workflow_id, url, intent, cadence, schema_attributes, weight)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            data.id,
            seed.url,
            seed.intent ?? null,
            seed.cadence ?? null,
            JSON.stringify(seed.schema_attributes ?? []),
            seed.weight ?? 1,
          ],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listWorkflows(): Promise<WorkflowRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const result = await pool.query('SELECT * FROM workflows ORDER BY created_at DESC');
    return result.rows;
  }

  async getWorkflow(id: string): Promise<WorkflowRecord & { attributes: WorkflowAttributeRecord[]; seeds: WorkflowSeedRecord[] } | null> {
    await this.initialize();
    const pool = await getPool();
    const workflowRes = await pool.query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (workflowRes.rowCount === 0) return null;

    const [attributesRes, seedsRes] = await Promise.all([
      pool.query('SELECT * FROM workflow_attributes WHERE workflow_id = $1 ORDER BY attr_key', [id]),
      pool.query('SELECT * FROM workflow_seeds WHERE workflow_id = $1', [id]),
    ]);

    return {
      ...workflowRes.rows[0],
      attributes: attributesRes.rows,
      seeds: seedsRes.rows,
    };
  }

  async listAttributes(workflowId: string): Promise<WorkflowAttributeRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      'SELECT * FROM workflow_attributes WHERE workflow_id = $1 ORDER BY attr_key',
      [workflowId],
    );
    return rows;
  }

  async upsertAttribute(
    workflowId: string,
    attrKey: string,
    updates: Partial<WorkflowAttributeRecord> & { enrichment_prompt?: string | null },
  ): Promise<WorkflowAttributeRecord> {
    await this.initialize();
    const pool = await getPool();

    const existing = await pool.query(
      'SELECT * FROM workflow_attributes WHERE workflow_id = $1 AND attr_key = $2',
      [workflowId, attrKey],
    );

    const current = existing.rows[0] ?? {};
    const nextLabel = updates.label ?? current.label ?? attrKey;
    const nextCategory = updates.category ?? current.category ?? null;
    const nextDescription = updates.description ?? current.description ?? null;
    const nextWeight =
      updates.weight !== undefined ? updates.weight : current.weight ?? null;
    const nextEnrichment =
      updates.enrichment_prompt ?? (updates as any).enrichmentPrompt ?? current.enrichment_prompt ?? null;

    if (existing.rowCount) {
      const { rows } = await pool.query(
        `UPDATE workflow_attributes
         SET label = $3,
             category = $4,
             description = $5,
             weight = $6,
             enrichment_prompt = $7
         WHERE workflow_id = $1 AND attr_key = $2
         RETURNING *`,
        [workflowId, attrKey, nextLabel, nextCategory, nextDescription, nextWeight, nextEnrichment],
      );
      return rows[0];
    }

    const { rows } = await pool.query(
      `INSERT INTO workflow_attributes (
         workflow_id,
         attr_key,
         label,
         category,
         description,
         weight,
         enrichment_prompt
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [workflowId, attrKey, nextLabel, nextCategory, nextDescription, nextWeight, nextEnrichment],
    );

    return rows[0];
  }

  async upsertNeuralNetworkInstance(
    record: Partial<NeuralNetworkInstanceRecord> & { workflow_instance_id: string; label: string; model_type: string },
  ): Promise<NeuralNetworkInstanceRecord> {
    await this.initialize();
    const pool = await getPool();

    const payload = {
      workflow_id: record.workflow_id ?? null,
      workflow_instance_id: record.workflow_instance_id,
      label: record.label,
      model_type: record.model_type,
      current_version: record.current_version ?? null,
      status: record.status ?? 'provisioning',
      automation_enabled: record.automation_enabled ?? false,
      config: JSON.stringify(record.config ?? {}),
      metrics: JSON.stringify(record.metrics ?? {}),
      last_trained_at: record.last_trained_at ?? null,
    };

    const { rows } = await pool.query(
      `INSERT INTO neural_network_instances (
         workflow_id,
         workflow_instance_id,
         label,
         model_type,
         current_version,
         status,
         automation_enabled,
         config,
         metrics,
         last_trained_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
       )
       ON CONFLICT (workflow_instance_id)
       DO UPDATE SET
         workflow_id = EXCLUDED.workflow_id,
         label = EXCLUDED.label,
         model_type = EXCLUDED.model_type,
         current_version = COALESCE(EXCLUDED.current_version, neural_network_instances.current_version),
         status = EXCLUDED.status,
         automation_enabled = EXCLUDED.automation_enabled,
         config = EXCLUDED.config,
         metrics = EXCLUDED.metrics,
         last_trained_at = COALESCE(EXCLUDED.last_trained_at, neural_network_instances.last_trained_at),
         updated_at = NOW()
       RETURNING *`,
      [
        payload.workflow_id,
        payload.workflow_instance_id,
        payload.label,
        payload.model_type,
        payload.current_version,
        payload.status,
        payload.automation_enabled,
        payload.config,
        payload.metrics,
        payload.last_trained_at,
      ],
    );

    const row = rows[0];
    return {
      ...row,
      config: row.config ?? {},
      metrics: row.metrics ?? {},
    };
  }

  async updateNeuralNetworkInstance(
    id: string,
    updates: {
      status?: string;
      automation_enabled?: boolean;
      config?: Record<string, any>;
      metrics?: Record<string, any>;
      last_trained_at?: string | null;
      current_version?: string | null;
    },
  ): Promise<NeuralNetworkInstanceRecord | null> {
    await this.initialize();
    const pool = await getPool();

    const fields: string[] = [];
    const values: any[] = [];

    if (typeof updates.status === 'string') {
      fields.push(`status = $${fields.length + 1}`);
      values.push(updates.status);
    }

    if (typeof updates.automation_enabled === 'boolean') {
      fields.push(`automation_enabled = $${fields.length + 1}`);
      values.push(updates.automation_enabled);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'config')) {
      fields.push(`config = $${fields.length + 1}`);
      values.push(JSON.stringify(updates.config ?? {}));
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'metrics')) {
      fields.push(`metrics = $${fields.length + 1}`);
      values.push(JSON.stringify(updates.metrics ?? {}));
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'last_trained_at')) {
      fields.push(`last_trained_at = $${fields.length + 1}`);
      values.push(updates.last_trained_at ?? null);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'current_version')) {
      fields.push(`current_version = $${fields.length + 1}`);
      values.push(updates.current_version ?? null);
    }

    if (!fields.length) {
      return this.getNeuralNetworkInstance(id);
    }

    fields.push('updated_at = NOW()');

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE neural_network_instances SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (!rows.length) return null;

    const row = rows[0];
    return {
      ...row,
      config: row.config ?? {},
      metrics: row.metrics ?? {},
    };
  }

  async createRun(workflowId: string, status: string, createdBy?: string | null): Promise<WorkflowRunRecord> {
    await this.initialize();
    const pool = await getPool();
    const result = await pool.query(
      `INSERT INTO workflow_runs (workflow_id, status, created_by)
       VALUES ($1,$2,$3) RETURNING *`,
      [workflowId, status, createdBy ?? null],
    );
    return result.rows[0];
  }

  async updateRun(runId: string, updates: Partial<WorkflowRunRecord>) {
    await this.initialize();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status) {
      fields.push(`status = $${fields.length + 1}`);
      values.push(updates.status);
    }
    if (updates.completed_at) {
      fields.push(`completed_at = $${fields.length + 1}`);
      values.push(updates.completed_at);
    }
    if (updates.metrics) {
      fields.push(`metrics = $${fields.length + 1}`);
      values.push(JSON.stringify(updates.metrics));
    }
    if (updates.notes) {
      fields.push(`notes = $${fields.length + 1}`);
      values.push(updates.notes);
    }

    if (!fields.length) return;

    values.push(runId);
    const pool = await getPool();
    await pool.query(
      `UPDATE workflow_runs SET ${fields.join(', ')} WHERE id = $${fields.length + 1}`,
      values,
    );
  }

  async listRuns(workflowId: string): Promise<WorkflowRunRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const result = await pool.query(
      'SELECT * FROM workflow_runs WHERE workflow_id = $1 ORDER BY started_at DESC',
      [workflowId],
    );
    return result.rows;
  }

  async addArtifact(runId: string, type: string, storageUri: string, metadata: any = {}) {
    await this.initialize();
    const pool = await getPool();
    await pool.query(
      `INSERT INTO training_artifacts (workflow_run_id, type, storage_uri, metadata)
       VALUES ($1,$2,$3,$4)`,
      [runId, type, storageUri, JSON.stringify(metadata)],
    );
  }

  async listArtifacts(runId: string): Promise<TrainingArtifactRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const result = await pool.query(
      'SELECT * FROM training_artifacts WHERE workflow_run_id = $1 ORDER BY created_at DESC',
      [runId],
    );
    return result.rows;
  }

  // ---------------------------------------------------------------------------
  // Workflow templates and instances
  // ---------------------------------------------------------------------------

  async createTemplate(
    template: Omit<WorkflowTemplateRecord, 'id' | 'created_at'>,
    tasks: Omit<WorkflowTemplateTaskRecord, 'id' | 'template_id'>[] = [],
  ): Promise<WorkflowTemplateRecord & { tasks: WorkflowTemplateTaskRecord[] }> {
    await this.initialize();
    const pool = await getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO workflow_templates (
           template_key, label, description, primary_prompt, schema_context,
           default_tasks, default_atoms, default_components, default_dashboards,
           created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [
          template.template_key,
          template.label,
          template.description ?? null,
          template.primary_prompt ?? null,
          JSON.stringify(template.schema_context ?? {}),
          JSON.stringify(template.default_tasks ?? []),
          JSON.stringify(template.default_atoms ?? []),
          JSON.stringify(template.default_components ?? []),
          JSON.stringify(template.default_dashboards ?? []),
          template.created_by ?? null,
        ],
      );

      const inserted = rows[0];
      const taskRows: WorkflowTemplateTaskRecord[] = [];

      for (const task of tasks) {
        const { rows: taskResult } = await client.query(
          `INSERT INTO workflow_template_tasks (
             template_id, task_key, task_label, schema_refs,
             handler_type, handler_config, is_optional, ordering, ui_wizard_step
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           RETURNING *`,
          [
            inserted.id,
            task.task_key,
            task.task_label,
            JSON.stringify(task.schema_refs ?? []),
            task.handler_type,
            JSON.stringify(task.handler_config ?? {}),
            task.is_optional ?? false,
            task.ordering ?? 0,
            task.ui_wizard_step ?? null,
          ],
        );
        taskRows.push(taskResult[0]);
      }

      await client.query('COMMIT');

      return {
        ...inserted,
        schema_context: inserted.schema_context ?? {},
        default_tasks: inserted.default_tasks ?? [],
        default_atoms: inserted.default_atoms ?? [],
        default_components: inserted.default_components ?? [],
        default_dashboards: inserted.default_dashboards ?? [],
        tasks: taskRows,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  }

  async listWorkflowAdminSummaries(): Promise<WorkflowAdminSummary[]> {
    await this.initialize();
    const pool = await getPool();

    const { rows } = await pool.query(
      `SELECT
         wi.id,
         wi.status,
         wi.prompt_payload,
         wi.active_tasks,
         wi.automation_state,
         wi.automation_threshold,
         wi.tf_model_id,
         wi.created_at,
         wi.updated_at,
         w.dataset_name,
         w.created_by,
         COALESCE(wi.prompt_payload -> 'owner' ->> 'name', w.created_by) AS owner_name,
         COALESCE(wi.prompt_payload -> 'owner' ->> 'email', w.created_by) AS owner_email
       FROM workflow_instances wi
       LEFT JOIN workflows w ON wi.workflow_id = w.id
       ORDER BY wi.updated_at DESC NULLS LAST, wi.created_at DESC`,
    );

    const fallbackId = (prefix: string, position: number) => `${prefix}-${position}`;

    return rows.map((row, index) => {
      const promptPayload = (row.prompt_payload ?? {}) as Record<string, any>;
      const automationState = (row.automation_state ?? {}) as Record<string, any>;
      const tasksRaw = Array.isArray(row.active_tasks) ? (row.active_tasks as any[]) : [];
      const attributesRaw = Array.isArray(promptPayload.attributes) ? promptPayload.attributes : [];

      const tasks: WorkflowAdminTask[] = tasksRaw.map((task: any, taskIndex: number) => ({
        id: String(task.id ?? task.taskId ?? fallbackId('task', taskIndex)),
        label: String(task.label ?? task.name ?? `Task ${taskIndex + 1}`),
        status: String(task.status ?? 'pending'),
        description: typeof task.description === 'string' ? task.description : undefined,
        lastRunAt: task.lastRunAt ? String(task.lastRunAt) : undefined,
      }));

      const attributes: WorkflowAdminAttribute[] = attributesRaw.map((attribute: any, attrIndex: number) => ({
        id: String(attribute.id ?? attribute.key ?? fallbackId('attr', attrIndex)),
        label: String(attribute.label ?? attribute.name ?? `Attribute ${attrIndex + 1}`),
        type: attribute.type ?? attribute.category ?? null,
        enrichmentPrompt: attribute.enrichmentPrompt ?? attribute.prompt ?? null,
        drilldownPrompts: Array.isArray(attribute.drilldownPrompts)
          ? attribute.drilldownPrompts.map((value: any) => String(value))
          : [],
        status: attribute.status ?? undefined,
      }));

      return {
        id: String(row.id),
        campaignName: row.dataset_name ?? promptPayload.campaignName ?? `Workflow ${index + 1}`,
        ownerName: row.owner_name ?? promptPayload.owner?.name ?? row.created_by ?? 'Unknown owner',
        ownerEmail: row.owner_email ?? promptPayload.owner?.email ?? 'unknown@example.com',
        status: row.status ?? 'draft',
        scriptInjected: Boolean(
          automationState.scriptInjected ?? promptPayload.scriptInjected ?? false,
        ),
        n8nWorkflowId: promptPayload.n8nWorkflowId ?? automationState.n8nWorkflowId ?? null,
        tensorflowInstanceId: row.tf_model_id ?? automationState.tfModelId ?? null,
        seoScore: promptPayload.seoScore ?? automationState.seoScore ?? null,
        automationThreshold: row.automation_threshold ?? automationState.threshold ?? null,
        pendingAutomation: Boolean(
          automationState.pendingAutomation ?? automationState.pending ?? false,
        ),
        createdAt: row.created_at,
        updatedAt: row.updated_at ?? row.created_at,
        tasks,
        attributes,
      };
    });
  }

  async listNeuralNetworkInstances(options: { workflowId?: string; includeMetrics?: boolean } = {}): Promise<NeuralNetworkInstanceRecord[]> {
    await this.initialize();
    const pool = await getPool();

    const conditions: string[] = [];
    const values: any[] = [];

    if (options.workflowId) {
      conditions.push('workflow_id = $1');
      values.push(options.workflowId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM neural_network_instances ${whereClause} ORDER BY updated_at DESC NULLS LAST, created_at DESC`,
      values,
    );

    return rows.map((row) => ({
      ...row,
      config: row.config ?? {},
      metrics: options.includeMetrics ? row.metrics ?? {} : {},
    }));
  }

  async getNeuralNetworkInstance(id: string): Promise<NeuralNetworkInstanceRecord | null> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM neural_network_instances WHERE id = $1', [id]);
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      config: row.config ?? {},
      metrics: row.metrics ?? {},
    };
  }

  async recordNeuralTrainingRun(
    instanceId: string,
    payload: Partial<NeuralTrainingRunRecord> & { status: string },
  ): Promise<NeuralTrainingRunRecord> {
    await this.initialize();
    const pool = await getPool();

    const { rows } = await pool.query(
      `INSERT INTO neural_training_runs (
         neural_instance_id,
         training_job_id,
         workflow_run_id,
         status,
         dataset_overview,
         hyperparameters,
         metrics,
         notes,
         started_at,
         completed_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
       ) RETURNING *`,
      [
        instanceId,
        payload.training_job_id ?? null,
        payload.workflow_run_id ?? null,
        payload.status,
        JSON.stringify(payload.dataset_overview ?? {}),
        JSON.stringify(payload.hyperparameters ?? {}),
        JSON.stringify(payload.metrics ?? {}),
        payload.notes ?? null,
        payload.started_at ?? new Date().toISOString(),
        payload.completed_at ?? null,
      ],
    );

    const row = rows[0];
    return {
      ...row,
      dataset_overview: row.dataset_overview ?? {},
      hyperparameters: row.hyperparameters ?? {},
      metrics: row.metrics ?? {},
    };
  }

  async updateNeuralTrainingRun(runId: string, updates: Partial<NeuralTrainingRunRecord>): Promise<void> {
    await this.initialize();
    const pool = await getPool();

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status) {
      fields.push(`status = $${fields.length + 1}`);
      values.push(updates.status);
    }
    if (updates.dataset_overview) {
      fields.push(`dataset_overview = $${fields.length + 1}`);
      values.push(JSON.stringify(updates.dataset_overview));
    }
    if (updates.hyperparameters) {
      fields.push(`hyperparameters = $${fields.length + 1}`);
      values.push(JSON.stringify(updates.hyperparameters));
    }
    if (updates.metrics) {
      fields.push(`metrics = $${fields.length + 1}`);
      values.push(JSON.stringify(updates.metrics));
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${fields.length + 1}`);
      values.push(updates.notes);
    }
    if (updates.started_at) {
      fields.push(`started_at = $${fields.length + 1}`);
      values.push(updates.started_at);
    }
    if (updates.completed_at) {
      fields.push(`completed_at = $${fields.length + 1}`);
      values.push(updates.completed_at);
    }

    if (!fields.length) return;

    values.push(runId);
    await pool.query(
      `UPDATE neural_training_runs SET ${fields.join(', ')} WHERE id = $${fields.length + 1}`,
      values,
    );
  }

  async listNeuralTrainingRuns(instanceId: string): Promise<NeuralTrainingRunRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT * FROM neural_training_runs WHERE neural_instance_id = $1 ORDER BY started_at DESC NULLS LAST`,
      [instanceId],
    );

    return rows.map((row) => ({
      ...row,
      dataset_overview: row.dataset_overview ?? {},
      hyperparameters: row.hyperparameters ?? {},
      metrics: row.metrics ?? {},
    }));
  }

  async recordNeuralSchemaVersion(
    instanceId: string,
    payload: Omit<NeuralTrainingSchemaVersionRecord, 'id' | 'neural_instance_id' | 'created_at'>,
  ): Promise<NeuralTrainingSchemaVersionRecord> {
    await this.initialize();
    const pool = await getPool();

    const { rows } = await pool.query(
      `INSERT INTO neural_training_schema_versions (
         neural_instance_id,
         version,
         schema_snapshot,
         attributes,
         discovered_links
       ) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (neural_instance_id, version)
       DO UPDATE SET
         schema_snapshot = EXCLUDED.schema_snapshot,
         attributes = EXCLUDED.attributes,
         discovered_links = EXCLUDED.discovered_links
       RETURNING *`,
      [
        instanceId,
        payload.version,
        JSON.stringify(payload.schema_snapshot ?? {}),
        JSON.stringify(payload.attributes ?? []),
        JSON.stringify(payload.discovered_links ?? []),
      ],
    );

    const row = rows[0];
    return {
      ...row,
      schema_snapshot: row.schema_snapshot ?? {},
      attributes: row.attributes ?? [],
      discovered_links: row.discovered_links ?? [],
    };
  }

  async listNeuralSchemaVersions(instanceId: string): Promise<NeuralTrainingSchemaVersionRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT * FROM neural_training_schema_versions WHERE neural_instance_id = $1 ORDER BY version DESC`,
      [instanceId],
    );

    return rows.map((row) => ({
      ...row,
      schema_snapshot: row.schema_snapshot ?? {},
      attributes: row.attributes ?? [],
      discovered_links: row.discovered_links ?? [],
    }));
  }

  async listNeuralSchemaLinks(workflowId: string): Promise<NeuralSchemaLinkRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT * FROM neural_schema_links WHERE workflow_id = $1 ORDER BY discovered_at DESC`,
      [workflowId],
    );
    return rows.map((row) => ({
      ...row,
      relation: row.relation ?? {},
      metadata: row.metadata ?? {},
    }));
  }

  async upsertNeuralSchemaLink(link: {
    workflowId: string;
    sourceType: string;
    sourceId?: string | null;
    schemaUri: string;
    relation?: Record<string, any>;
    confidence?: number | null;
    metadata?: Record<string, any>;
  }): Promise<NeuralSchemaLinkRecord> {
    await this.initialize();
    const pool = await getPool();

    const { rows } = await pool.query(
      `INSERT INTO neural_schema_links (
         workflow_id,
         source_type,
         source_id,
         schema_uri,
         relation,
         confidence,
         metadata
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (workflow_id, source_type, source_id, schema_uri)
       DO UPDATE SET
         relation = EXCLUDED.relation,
         confidence = EXCLUDED.confidence,
         metadata = EXCLUDED.metadata,
         discovered_at = NOW()
       RETURNING *`,
      [
        link.workflowId,
        link.sourceType,
        link.sourceId ?? null,
        link.schemaUri,
        JSON.stringify(link.relation ?? {}),
        link.confidence ?? 0.8,
        JSON.stringify(link.metadata ?? {}),
      ],
    );

    const row = rows[0];
    return {
      ...row,
      relation: row.relation ?? {},
      metadata: row.metadata ?? {},
    };
  }

  async listNeuralAttributeSuggestions(workflowId: string): Promise<NeuralAttributeSuggestionRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      `SELECT * FROM neural_attribute_suggestions WHERE workflow_id = $1 ORDER BY created_at DESC`,
      [workflowId],
    );
    return rows.map((row) => ({
      ...row,
      suggestion: row.suggestion ?? {},
    }));
  }

  async createNeuralAttributeSuggestion(payload: {
    workflowId: string;
    suggestion: Record<string, any>;
    confidence?: number | null;
  }): Promise<NeuralAttributeSuggestionRecord> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      `INSERT INTO neural_attribute_suggestions (
         workflow_id,
         suggestion,
         confidence
       ) VALUES ($1,$2,$3) RETURNING *`,
      [
        payload.workflowId,
        JSON.stringify(payload.suggestion ?? {}),
        payload.confidence ?? 0.75,
      ],
    );

    const row = rows[0];
    return {
      ...row,
      suggestion: row.suggestion ?? {},
    };
  }

  async markNeuralAttributeSuggestion(
    suggestionId: string,
    updates: { status?: string; appliedAttributeId?: string | null },
  ): Promise<void> {
    await this.initialize();
    const pool = await getPool();

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status) {
      fields.push(`status = $${fields.length + 1}`);
      values.push(updates.status);
    }
    if (updates.appliedAttributeId !== undefined) {
      fields.push(`applied_attribute_id = $${fields.length + 1}`);
      values.push(updates.appliedAttributeId ?? null);
      fields.push(`applied_at = $${fields.length + 1}`);
      values.push(updates.appliedAttributeId ? new Date().toISOString() : null);
    }

    if (!fields.length) return;

    values.push(suggestionId);
    await pool.query(
      `UPDATE neural_attribute_suggestions SET ${fields.join(', ')} WHERE id = $${fields.length + 1}`,
      values,
    );
  }

  async listTfBaseModels(): Promise<TfBaseModelRecord[]> {
    await this.initialize();
    const pool = await getPool();
    const { rows } = await pool.query(
      'SELECT * FROM tf_base_models ORDER BY updated_at DESC NULLS LAST, created_at DESC',
    );

    return rows.map((row) => ({
      ...row,
      feature_schema: row.feature_schema ?? {},
      last_validated_metrics: row.last_validated_metrics ?? {},
    }));
  }

  async applyBlueprint(workflowId: string, blueprint: WorkflowBlueprint) {
    const pool = await getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const atomIdMap = new Map<string, string>();
      for (const atom of blueprint.atoms) {
        const atomId = await this.upsertAtom(client, atom);
        atomIdMap.set(atom.key, atomId);
      }

      const componentIdMap = new Map<string, string>();
      for (const component of blueprint.components) {
        const componentId = await this.upsertComponent(client, component);
        componentIdMap.set(component.key, componentId);

        for (const atomKey of component.atomKeys) {
          const atomId = atomIdMap.get(atomKey);
          if (!atomId) continue;
          await client.query(
            `INSERT INTO component_atoms (component_id, atom_id, role, binding)
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (component_id, atom_id) DO UPDATE SET binding = EXCLUDED.binding`,
            [componentId, atomId, null, JSON.stringify({})],
          );
        }
      }

      for (const dashboard of blueprint.dashboards) {
        const dashboardId = await this.upsertDashboard(client, dashboard);

        for (const placement of dashboard.components) {
          const componentId = componentIdMap.get(placement.componentKey);
          if (!componentId) continue;
          await client.query(
            `INSERT INTO dashboard_components (dashboard_id, component_id, position, settings)
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (dashboard_id, component_id) DO UPDATE SET position = EXCLUDED.position, settings = EXCLUDED.settings`,
            [
              dashboardId,
              componentId,
              JSON.stringify(placement.position ?? {}),
              JSON.stringify(placement.settings ?? {}),
            ],
          );
        }

        await client.query(
          `INSERT INTO workflow_dashboards (workflow_id, dashboard_id, sort_order, metadata)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (workflow_id, dashboard_id) DO UPDATE SET metadata = EXCLUDED.metadata`,
          [workflowId, dashboardId, 0, JSON.stringify(dashboard.metadata ?? {})],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async upsertAtom(client: any, atom: AtomBlueprint): Promise<string> {
    const existing = await client.query(
      'SELECT id FROM atom_definitions WHERE name = $1 AND (category IS NOT DISTINCT FROM $2)',
      [atom.name, atom.category ?? null],
    );

    if (existing.rowCount) {
      await client.query(
        'UPDATE atom_definitions SET description = $1, schema = $2, extraction_rules = $3, weight = $4 WHERE id = $5',
        [atom.description, JSON.stringify(atom.schema), JSON.stringify(atom.extractionRules), atom.weight ?? null, existing.rows[0].id],
      );
      return existing.rows[0].id;
    }

    const inserted = await client.query(
      `INSERT INTO atom_definitions (name, category, description, schema, extraction_rules, weight)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [atom.name, atom.category ?? null, atom.description, JSON.stringify(atom.schema), JSON.stringify(atom.extractionRules), atom.weight ?? null],
    );
    return inserted.rows[0].id;
  }

  private async upsertComponent(client: any, component: ComponentBlueprint): Promise<string> {
    const existing = await client.query(
      'SELECT id FROM component_definitions WHERE name = $1 AND (variant IS NOT DISTINCT FROM $2)',
      [component.name, component.variant ?? null],
    );

    if (existing.rowCount) {
      await client.query(
        'UPDATE component_definitions SET description = $1, schema = $2, metadata = $3, category = $4 WHERE id = $5',
        [
          component.description,
          JSON.stringify(component.schema),
          JSON.stringify(component.metadata ?? {}),
          component.category,
          existing.rows[0].id,
        ],
      );
      return existing.rows[0].id;
    }

    const inserted = await client.query(
      `INSERT INTO component_definitions (name, variant, description, schema, metadata, category)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [
        component.name,
        component.variant ?? null,
        component.description,
        JSON.stringify(component.schema),
        JSON.stringify(component.metadata ?? {}),
        component.category,
      ],
    );
    return inserted.rows[0].id;
  }

  private async upsertDashboard(client: any, dashboard: DashboardBlueprint): Promise<string> {
    const existing = await client.query('SELECT id FROM dashboard_definitions WHERE name = $1', [dashboard.name]);

    if (existing.rowCount) {
      await client.query(
        'UPDATE dashboard_definitions SET description = $1, domain = $2, layout = $3, metadata = $4 WHERE id = $5',
        [
          dashboard.description,
          dashboard.domain,
          JSON.stringify(dashboard.layout),
          JSON.stringify(dashboard.metadata ?? {}),
          existing.rows[0].id,
        ],
      );
      return existing.rows[0].id;
    }

    const inserted = await client.query(
      `INSERT INTO dashboard_definitions (name, description, domain, layout, metadata)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [
        dashboard.name,
        dashboard.description,
        dashboard.domain,
        JSON.stringify(dashboard.layout),
        JSON.stringify(dashboard.metadata ?? {}),
      ],
    );
    return inserted.rows[0].id;
  }
}

export const workflowRepository = new WorkflowRepository();
