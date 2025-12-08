import { Router } from 'express';

const router = Router();

// Health check for styleguide config routes
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Styleguide config routes operational (stub)' });
});

// Placeholder endpoint for fetching styleguide configuration
router.get('/', (_req, res) => {
  res.json({ styleguide: null, message: 'Styleguide configuration not yet implemented' });
});

export default router;
