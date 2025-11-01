import Bull from 'bull';
import { databaseIntegration } from '../DatabaseIntegration.js';
import { workflowRepository } from './WorkflowRepository';
import { ServiceHub } from '../ServiceHub';
import { WorkflowBlueprint } from './PromptWorkflowBuilder';
import { dataMiningAutomation } from '../../neural/DataMiningAutomation';
import { SEOTrainingPipelineService } from '../api/SEOTrainingPipelineService';

export const MINING_QUEUE_NAME = 'lightdom:mining';
export const TRAINING_QUEUE_NAME = 'lightdom:training';

const hub = ServiceHub.getInstance();

const miningQueue = new Bull(MINING_QUEUE_NAME, process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const trainingQueue = new Bull(TRAINING_QUEUE_NAME, process.env.REDIS_URL || 'redis://127.0.0.1:6379');
let trainingService: SEOTrainingPipelineService | null = null;

export const registerQueueProcessors = async () => {
  await databaseIntegration.initialize();
  await hub.initialize();

  miningQueue.process(async (job) => {
    const { queueId } = job.data as { queueId: string };
    await handleMiningJob(queueId);
  });

  trainingQueue.process(async (job) => {
    const { trainingJobId } = job.data as { trainingJobId: string };
    await handleTrainingJob(trainingJobId);
  });
};

type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

const logJobEvent = async (
  jobId: string,
  jobType: 'mining' | 'training',
  status: JobStatus,
  message: string,
  payload?: Record<string, unknown>,
) => {
  const pool = databaseIntegration.pool!;
  await pool.query(
    `INSERT INTO job_event_log (job_id, job_type, status, message, payload)
     VALUES ($1,$2,$3,$4,$5)`,
    [jobId, jobType, status, message, JSON.stringify(payload ?? {})],
  );
};

const handleMiningJob = async (queueId: string) => {
  const pool = databaseIntegration.pool!;
  const { rows } = await pool.query('SELECT * FROM mining_queue WHERE id = $1', [queueId]);
  if (!rows.length) return;
  const queue = rows[0];

  await pool.query('UPDATE mining_queue SET status = $1, started_at = NOW() WHERE id = $2', ['running', queueId]);
  await logJobEvent(queueId, 'mining', 'running', 'Mining workflow started', { workflowId: queue.workflow_id });

  const mined = await runPromptBasedMining(queue.workflow_id, queue.prompt);

  await workflowRepository.applyBlueprint(queue.workflow_id, mined.blueprint);
  await logJobEvent(queueId, 'mining', 'running', 'Blueprint applied', {
    atoms: mined.blueprint.atoms.length,
    components: mined.blueprint.components.length,
    dashboards: mined.blueprint.dashboards.length,
  });

  const stages = ['atom-mining', 'component-assembly', 'dashboard-mapping'];

  for (const stage of stages) {
    const { rows: jobRows } = await pool.query(
      `INSERT INTO mining_jobs (queue_id, stage, status) VALUES ($1,$2,'running') RETURNING *`,
      [queueId, stage],
    );

    try {
      await logJobEvent(jobRows[0].id, 'mining', 'running', `${stage} started`, {});

      let result: Record<string, unknown> | undefined;
      if (stage === 'atom-mining') {
        result = await runAtomMining(mined, queue.workflow_id);
      } else if (stage === 'component-assembly') {
        result = await runComponentAssembly(mined, queue.workflow_id);
      } else if (stage === 'dashboard-mapping') {
        result = await runDashboardMapping(mined, queue.workflow_id);
      }

      await pool.query(
        'UPDATE mining_jobs SET status = $1, completed_at = NOW(), result = $2 WHERE id = $3',
        ['completed', JSON.stringify(result ?? {}), jobRows[0].id],
      );
      await logJobEvent(jobRows[0].id, 'mining', 'completed', `${stage} completed`, result);
    } catch (error: any) {
      await pool.query(
        'UPDATE mining_jobs SET status = $1, completed_at = NOW(), result = $2 WHERE id = $3',
        ['failed', JSON.stringify({ error: error?.message || 'Unknown error' }), jobRows[0].id],
      );
      await logJobEvent(jobRows[0].id, 'mining', 'failed', `${stage} failed`, { error: error?.message });
      throw error;
    }
  }

  await pool.query('UPDATE mining_queue SET status = $1, completed_at = NOW() WHERE id = $2', ['completed', queueId]);
  await logJobEvent(queueId, 'mining', 'completed', 'Mining workflow completed', {});

  const run = await workflowRepository.createRun(queue.workflow_id, 'queued');
  const { rows: trainingJob } = await pool.query(
    `INSERT INTO training_jobs (mining_job_id, workflow_run_id, status) VALUES ($1,$2,'queued') RETURNING id`,
    [null, run.id],
  );

  await trainingQueue.add({ trainingJobId: trainingJob[0].id });
  await logJobEvent(trainingJob[0].id, 'training', 'queued', 'Training job queued', { workflowRunId: run.id });
};

type MinedResult = ReturnType<typeof dataMiningAutomation.generateDashboardFromPrompt>;

export const runPromptBasedMining = async (workflowId: string | null | undefined, basePrompt: string) => {
  const workflow = workflowId ? await workflowRepository.getWorkflow(workflowId) : null;

  const attributePrompts = (workflow?.attributes ?? []).map((attribute) => {
    const enrichment = attribute.enrichment_prompt?.trim();
    if (enrichment && enrichment.length > 0) {
      return `${attribute.label}: ${enrichment}`;
    }
    if (attribute.description) {
      return `${attribute.label}: ${attribute.description}`;
    }
    return `${attribute.label}`;
  });

  const aggregatedPrompt = [basePrompt, ...attributePrompts].filter(Boolean).join('\n');
  const mined = dataMiningAutomation.generateDashboardFromPrompt(aggregatedPrompt);

  const blueprint: WorkflowBlueprint = {
    schemaKey: basePrompt.toLowerCase().includes('analytics') ? 'analytics-insights' : 'seo-content',
    datasetName: `${mined.workflow.name} Dataset`,
    datasetDescription: mined.workflow.description,
    atoms: mined.atoms.map((atom) => ({
      key: atom.id,
      name: atom.name,
      category: atom.category,
      description: atom.schema?.description ?? atom.name,
      schema: {},
      extractionRules: {},
    })),
    components: mined.components.map((component) => ({
      key: component.id,
      name: component.name,
      category: component.category,
      description: component.description,
      schema: {},
      metadata: component.metadata ?? {},
      atomKeys: component.atoms.map((atom) => atom.templateId),
    })),
    dashboards: [{
      key: mined.dashboard.id,
      name: mined.dashboard.name,
      description: mined.dashboard.description,
      domain: mined.dashboard.category,
      layout: mined.dashboard.layout ? { ...mined.dashboard.layout } : {},
      metadata: mined.dashboard.metadata ?? {},
      components: mined.dashboard.components.map((component) => ({
        componentKey: component.templateId,
        position: component.position ? { ...component.position } : {},
        settings: component.props ?? {},
      })),
    }],
    defaultSeedUrls: (workflow?.seeds ?? []).map((seed) => seed.url),
    categories: workflow?.categories ?? [mined.dashboard.category],
    hyperparameters: {
      autoTrain: true,
      attributePrompts,
    },
  };

  return { mined, blueprint, attributePrompts };
};

const runAtomMining = async (
  mined: { mined: MinedResult; blueprint: WorkflowBlueprint },
  workflowId: string,
) => {
  const { mined: data } = mined;
  return {
    workflowId,
    atoms: data.atoms.map((atom) => ({ key: atom.id, name: atom.name, category: atom.category })),
    totalAtoms: data.atoms.length,
  };
};

const runComponentAssembly = async (
  mined: { mined: MinedResult; blueprint: WorkflowBlueprint },
  workflowId: string,
) => {
  const { mined: data } = mined;
  const components = data.components.map((component) => ({
    key: component.id,
    name: component.name,
    atoms: component.atoms.map((atom) => atom.templateId),
  }));
  return {
    workflowId,
    components,
    totalComponents: components.length,
  };
};

const runDashboardMapping = async (
  mined: { mined: MinedResult; blueprint: WorkflowBlueprint },
  workflowId: string,
) => {
  const { mined: data } = mined;
  const dashboards = [{
    key: data.dashboard.id,
    name: data.dashboard.name,
    components: data.dashboard.components.map((component) => component.templateId),
  }];

  return {
    workflowId,
    dashboards,
    totalDashboards: dashboards.length,
  };
};

const handleTrainingJob = async (trainingJobId: string) => {
  const pool = databaseIntegration.pool!;
  const { rows } = await pool.query('SELECT * FROM training_jobs WHERE id = $1', [trainingJobId]);
  if (!rows.length) return;

  await pool.query('UPDATE training_jobs SET status = $1, started_at = NOW() WHERE id = $2', ['running', trainingJobId]);
  await logJobEvent(trainingJobId, 'training', 'running', 'Training started', {});

  try {
    if (!trainingService) {
      trainingService = new SEOTrainingPipelineService(pool);
    }

    const modelId = await trainingService.trainRankingPredictionModel();
    const metrics = await pool.query('SELECT * FROM seo_models WHERE id = $1', [modelId]);
    const row = metrics.rows[0];
    if (!row) {
      throw new Error(`Model metadata not found for id ${modelId}`);
    }
    const payload = {
      modelId,
      accuracy: row?.accuracy,
      f1Score: row?.f1_score,
      trainingSamples: row?.training_samples,
      durationSeconds: row?.training_duration_seconds,
    };
    await pool.query(
      'UPDATE training_jobs SET status = $1, completed_at = NOW(), metrics = $2 WHERE id = $3',
      ['completed', JSON.stringify(payload), trainingJobId],
    );
    await logJobEvent(trainingJobId, 'training', 'completed', 'Training completed', payload);
  } catch (error: any) {
    await pool.query(
      'UPDATE training_jobs SET status = $1, completed_at = NOW(), metrics = $2 WHERE id = $3',
      ['failed', JSON.stringify({ error: error?.message || 'Unknown error' }), trainingJobId],
    );
    await logJobEvent(trainingJobId, 'training', 'failed', 'Training failed', { error: error?.message });
  }
};
