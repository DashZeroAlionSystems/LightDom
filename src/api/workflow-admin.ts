import express from 'express';
import { workflowRepository } from '../services/workflow/WorkflowRepository';
import { workflowService } from '../services/workflow/WorkflowService';
import { databaseIntegration } from '../services/DatabaseIntegration.js';
import { runPromptBasedMining } from '../services/workflow/MiningQueueProcessor';

const router = express.Router();

router.get('/workflows', async (_req, res) => {
  try {
    const workflows = await workflowRepository.listWorkflows();
    res.json({ ok: true, workflows });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to list workflows' });
  }
});

router.get('/workflows/summary', async (_req, res) => {
  try {
    const workflows = await workflowRepository.listWorkflowAdminSummaries();
    res.json({ ok: true, workflows });
  } catch (error: any) {
    res
      .status(500)
      .json({ ok: false, error: error?.message || 'Failed to load workflow summaries' });
  }
});

router.get('/workflows/:id', async (req, res) => {
  try {
    const workflow = await workflowRepository.getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ ok: false, error: 'Workflow not found' });
    }
    res.json({ ok: true, workflow });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to get workflow' });
  }
});

router.post('/workflows', express.json(), async (req, res) => {
  try {
    const { id, name, schemaKey, prompt, datasetName, datasetDescription, categories, hyperparameters, attributes, seeds, createdBy, steps } = req.body || {};
    if (!id || !name) {
      return res.status(400).json({ ok: false, error: 'id and name are required' });
    }

    const descriptor = await workflowService.createWorkflow({
      id,
      name,
      schemaKey,
      prompt,
      datasetName,
      datasetDescription,
      categories,
      hyperparameters,
      attributes,
      seeds,
      createdBy,
      steps,
    });

    res.status(201).json({ ok: true, workflow: descriptor });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to create workflow' });
  }
});

router.post('/workflows/:id/enqueue', express.json(), async (req, res) => {
  try {
    const { prompt, schemaKey, priority = 5, payload } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ ok: false, error: 'prompt is required' });
    }
    const workflow = await workflowRepository.getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ ok: false, error: 'Workflow not found' });
    }

    await databaseIntegration.initialize();
    if (!databaseIntegration.pool) throw new Error('Database pool unavailable');
    const { rows } = await databaseIntegration.pool.query(
      `INSERT INTO mining_queue (prompt, workflow_id, schema_key, priority, payload)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [prompt, req.params.id, schemaKey ?? workflow.schema_key, priority, JSON.stringify(payload ?? {})],
    );

    res.status(202).json({ ok: true, queue: rows[0] });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to enqueue workflow' });
  }
});

router.get('/workflows/:id/runs', async (req, res) => {
  try {
    const runs = await workflowRepository.listRuns(req.params.id);
    res.json({ ok: true, runs });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to list runs' });
  }
});

router.post('/workflows/:id/preview-mining', express.json(), async (req, res) => {
  try {
    const { prompt } = req.body ?? {};
    if (!prompt) {
      return res.status(400).json({ ok: false, error: 'prompt is required' });
    }

    const workflowId = req.params.id === 'null' || req.params.id === 'undefined' ? undefined : req.params.id;
    const preview = await runPromptBasedMining(workflowId, prompt);
    res.json({ ok: true, preview });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to preview mining workflow' });
  }
});

router.get('/workflows/:id/attributes', async (req, res) => {
  try {
    const attributes = await workflowRepository.listAttributes(req.params.id);
    res.json({ ok: true, attributes });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to list workflow attributes' });
  }
});

router.put('/workflows/:id/attributes/:attrKey', express.json(), async (req, res) => {
  try {
    const { attrKey } = req.params;
    const { label, category, description, weight, enrichmentPrompt } = req.body ?? {};
    const attribute = await workflowRepository.upsertAttribute(req.params.id, attrKey, {
      label,
      category,
      description,
      weight,
      enrichment_prompt: enrichmentPrompt,
    });
    res.json({ ok: true, attribute });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to update workflow attribute' });
  }
});

router.get('/workflow-runs/:runId', async (req, res) => {
  try {
    await databaseIntegration.initialize();
    if (!databaseIntegration.pool) throw new Error('Database pool unavailable');

    const { rows } = await databaseIntegration.pool.query('SELECT * FROM workflow_runs WHERE id = $1', [req.params.runId]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Workflow run not found' });
    }
    const artifacts = await databaseIntegration.pool.query('SELECT * FROM training_artifacts WHERE workflow_run_id = $1 ORDER BY created_at DESC', [req.params.runId]);

    res.json({ ok: true, run: rows[0], artifacts: artifacts.rows });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to get workflow run' });
  }
});

router.get('/queue', async (_req, res) => {
  try {
    await databaseIntegration.initialize();
    if (!databaseIntegration.pool) throw new Error('Database pool unavailable');

    const queue = await databaseIntegration.pool.query(
      'SELECT * FROM mining_queue ORDER BY status, priority DESC, created_at DESC',
    );
    res.json({ ok: true, queue: queue.rows });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to list queue' });
  }
});

router.get('/queue/:id', async (req, res) => {
  try {
    await databaseIntegration.initialize();
    if (!databaseIntegration.pool) throw new Error('Database pool unavailable');

    const queue = await databaseIntegration.pool.query('SELECT * FROM mining_queue WHERE id = $1', [req.params.id]);
    if (!queue.rows.length) {
      return res.status(404).json({ ok: false, error: 'Queue item not found' });
    }

    const [jobs, training] = await Promise.all([
      databaseIntegration.pool.query('SELECT * FROM mining_jobs WHERE queue_id = $1 ORDER BY created_at', [req.params.id]),
      databaseIntegration.pool.query(
        `SELECT tj.* FROM training_jobs tj
         LEFT JOIN workflow_runs wr ON tj.workflow_run_id = wr.id
         WHERE wr.workflow_id = $1
         ORDER BY tj.created_at DESC`,
        [queue.rows[0].workflow_id],
      ),
    ]);

    res.json({ ok: true, queue: queue.rows[0], jobs: jobs.rows, training: training.rows });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to get queue item' });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    await databaseIntegration.initialize();
    if (!databaseIntegration.pool) throw new Error('Database pool unavailable');

    const job = await databaseIntegration.pool.query('SELECT * FROM mining_jobs WHERE id = $1', [req.params.id]);
    if (!job.rows.length) {
      return res.status(404).json({ ok: false, error: 'Job not found' });
    }

    const events = await databaseIntegration.pool.query(
      'SELECT * FROM job_event_log WHERE job_id = $1 AND job_type = $2 ORDER BY created_at',
      [req.params.id, 'mining'],
    );

    res.json({ ok: true, job: job.rows[0], events: events.rows });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to get job' });
  }
});

router.get('/training-jobs/:id', async (req, res) => {
  try {
    await databaseIntegration.initialize();
    if (!databaseIntegration.pool) throw new Error('Database pool unavailable');

    const job = await databaseIntegration.pool.query('SELECT * FROM training_jobs WHERE id = $1', [req.params.id]);
    if (!job.rows.length) {
      return res.status(404).json({ ok: false, error: 'Training job not found' });
    }

    const events = await databaseIntegration.pool.query(
      'SELECT * FROM job_event_log WHERE job_id = $1 AND job_type = $2 ORDER BY created_at',
      [req.params.id, 'training'],
    );

    res.json({ ok: true, job: job.rows[0], events: events.rows });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Failed to get training job' });
  }
});

export default router;
