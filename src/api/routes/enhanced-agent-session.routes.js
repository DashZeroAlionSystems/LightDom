import { Router } from 'express';

const router = Router();

// Health check for agent session routes
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Agent session routes operational (stub)' });
});

// Placeholder list endpoint
router.get('/', (_req, res) => {
  res.json({ sessions: [], message: 'Enhanced agent session list not yet implemented' });
});

export default router;
