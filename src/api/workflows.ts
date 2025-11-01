import express from 'express';
import { workflowService } from '../services/workflow/WorkflowService';
import { selfLearningAgent } from '../services/ai/SelfLearningAgent';

const router = express.Router();

// Create or replace a workflow
router.post('/workflows', express.json(), (req, res) => {
  const { id, name, steps } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const w = workflowService.createWorkflow({ id, name, steps });
  return res.json({ ok: true, workflow: w });
});

// List workflows
router.get('/workflows', (_req, res) => {
  return res.json({ ok: true, workflows: workflowService.listWorkflows() });
});

// Run a workflow
router.post('/workflows/:id/run', express.json(), async (req, res) => {
  const id = req.params.id;
  const start = Date.now();
  const result = await workflowService.runWorkflow(id, req.body?.context);
  const duration = Date.now() - start;
  selfLearningAgent.observe({ workflowId: id, timestamp: new Date().toISOString(), durationMs: duration, success: result.ok });
  return res.json({ ok: true, id, result, duration });
});

// Suggest automations based on observed executions
router.get('/workflows/suggestions', (_req, res) => {
  const suggestions = selfLearningAgent.suggestAutomations();
  return res.json({ ok: true, suggestions });
});

export default router;
