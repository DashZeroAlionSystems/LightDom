import { Router } from 'express';

const router = Router();

// Health check for agent management routes
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Agent management routes operational (stub)' });
});

// Placeholder list endpoint
router.get('/', (_req, res) => {
  res.json({ agents: [], message: 'Agent management list not yet implemented' });
});

export default router;
