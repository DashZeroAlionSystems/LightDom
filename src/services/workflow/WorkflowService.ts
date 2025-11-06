import { workflowRepository, WorkflowAttributeRecord, WorkflowSeedRecord } from './WorkflowRepository';

export type WorkflowStepDescriptor =
  | { type: 'log'; message: string }
  | { type: 'delay'; ms: number }
  | { type: 'noop' };

export type WorkflowDescriptor = {
  id: string;
  name: string;
  createdAt: string;
  steps: WorkflowStepDescriptor[];
};

/**
 * Simple in-memory workflow service with a small persistence shim.
 * Purpose: provide an intuitive, minimal API for registering and running
 * workflows and a place to attach telemetry for self-learning automation.
 *
 * This is intentionally lightweight and safe (no eval / no executing user
 * provided code). Add step types or handlers as needed.
 */
export class WorkflowService {
  private static instance: WorkflowService | null = null;

  private constructor() {}

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  public async createWorkflow(payload: {
    id: string;
    name: string;
    steps?: WorkflowStepDescriptor[];
    schemaKey?: string;
    prompt?: string;
    datasetName?: string;
    datasetDescription?: string;
    categories?: string[];
    hyperparameters?: Record<string, unknown>;
    attributes?: WorkflowAttributeRecord[];
    seeds?: WorkflowSeedRecord[];
    createdBy?: string | null;
  }): Promise<WorkflowDescriptor> {
    const descriptor: WorkflowDescriptor = {
      id: payload.id,
      name: payload.name,
      createdAt: new Date().toISOString(),
      steps: payload.steps || [],
    };

    await workflowRepository.createWorkflow(
      {
        id: payload.id,
        schema_key: payload.schemaKey ?? 'custom',
        prompt: payload.prompt ?? 'N/A',
        dataset_name: payload.datasetName ?? payload.name,
        dataset_description: payload.datasetDescription ?? null,
        categories: payload.categories ?? [],
        hyperparameters: payload.hyperparameters ?? {},
        created_by: payload.createdBy ?? null,
      },
      payload.attributes ?? [],
      payload.seeds ?? [],
    );

    return descriptor;
  }

  public async getWorkflow(id: string): Promise<(WorkflowDescriptor & { attributes: WorkflowAttributeRecord[]; seeds: WorkflowSeedRecord[] }) | undefined> {
    const record = await workflowRepository.getWorkflow(id);
    if (!record) return undefined;
    return {
      id: record.id,
      name: record.dataset_name,
      createdAt: record.created_at,
      steps: [],
      attributes: record.attributes,
      seeds: record.seeds,
    };
  }

  public async listWorkflows(): Promise<WorkflowDescriptor[]> {
    const rows = await workflowRepository.listWorkflows();
    return rows.map((row) => ({
      id: row.id,
      name: row.dataset_name,
      createdAt: row.created_at,
      steps: [],
    }));
  }

  /**
   * Execute a workflow. Built-in step types are intentionally tiny and safe.
   */
  public async runWorkflow(id: string, context?: any): Promise<{ ok: boolean; results: any[] }> {
    const w = await this.getWorkflow(id);
    if (!w) return { ok: false, results: [{ error: 'workflow-not-found' }] };

    const results: any[] = [];
    for (const step of w.steps) {
      try {
        if (step.type === 'log') {
          // eslint-disable-next-line no-console
          console.info('[workflow.log]', step.message, { workflowId: id, context });
          results.push({ type: 'log', message: step.message });
        } else if (step.type === 'delay') {
          await new Promise((res) => setTimeout(res, step.ms));
          results.push({ type: 'delay', ms: step.ms });
        } else if (step.type === 'noop') {
          results.push({ type: 'noop' });
        } else {
          results.push({ error: 'unknown-step-type', step });
        }
      } catch (err) {
        results.push({ error: err?.toString?.() || String(err) });
      }
    }

    return { ok: true, results };
  }
}

export const workflowService = WorkflowService.getInstance();
