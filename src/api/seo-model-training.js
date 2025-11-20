import { Router } from 'express';

const router = Router();

// Health check for SEO model training routes
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SEO model training routes operational (stub)' });
});

// Placeholder endpoint for listing models
router.get('/', (_req, res) => {
  res.json({ models: [], message: 'SEO model list not yet implemented' });
});

export default router;
