import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

// Simple admin protection: if ADMIN_TOKEN is set, require header x-admin-token to match
function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return next();
  const provided = req.headers['x-admin-token'] || req.headers['authorization'] || '';
  if (provided === adminToken || provided === `Bearer ${adminToken}`) return next();
  return res.status(403).json({ error: 'forbidden' });
}

router.post('/training/run', requireAdmin, express.json(), async (req, res) => {
  const config = req.body || {};
  // Try running the prepare_and_train script which will attempt real Python training.
  // If it fails, fall back to the mock trainer.
  try {
    const runResult = await runScript('node', ['scripts/prepare_and_train.cjs']);
    if (runResult.code === 0) {
      return res.json({ ok: true, source: 'real-trainer', output: runResult.output });
    }

    // Fallback
    const mockResult = await runScript('node', ['scripts/mock_train_and_insert.cjs']);
    if (mockResult.code === 0) {
      return res.json({ ok: true, source: 'mock-trainer', output: mockResult.output });
    }

    return res.status(500).json({ ok: false, errors: [runResult.output, mockResult.output] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

function runScript(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { shell: true });
    let out = '';
    p.stdout.on('data', (d) => { out += d.toString(); });
    p.stderr.on('data', (d) => { out += d.toString(); });
    p.on('close', (code) => resolve({ code, output: out }));
    p.on('error', (err) => resolve({ code: 1, output: String(err) }));
  });
}

export default router;
