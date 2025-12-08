import { Router } from 'express';

const router = Router();

// Health check for DeepSeek chat routes
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'DeepSeek chat routes operational (stub)' });
});

// Placeholder chat endpoint
router.post('/session', (_req, res) => {
  res.json({ reply: null, message: 'DeepSeek chat session handling not yet implemented' });
});

export default router;
