import express from 'express';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';

const exec = promisify(execCb);

function sanitizeBranchName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Branch name is required');
  }

  const trimmed = name.trim();
  if (!/^[A-Za-z0-9._\-/]+$/.test(trimmed)) {
    throw new Error('Branch name contains invalid characters');
  }

  return trimmed;
}

async function runGitCommand(command, args = []) {
  const full = ['git', command, ...args].join(' ');
  const { stdout, stderr } = await exec(full, { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 });
  return {
    stdout: stdout?.trim() ?? '',
    stderr: stderr?.trim() ?? '',
    command: full,
  };
}

export default function createGitRoutes() {
  const router = express.Router();

  router.post('/create-branch', async (req, res) => {
    try {
      const branchName = sanitizeBranchName(req.body?.branchName);
      const checkout = req.body?.checkout !== false;
      const command = checkout ? 'checkout' : 'branch';
      const args = checkout ? ['-b', branchName] : [branchName];

      const result = await runGitCommand(command, args);
      res.json({ status: 'ok', result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, details: error.stderr });
    }
  });

  router.post('/checkout-branch', async (req, res) => {
    try {
      const branchName = sanitizeBranchName(req.body?.branchName);
      const result = await runGitCommand('checkout', [branchName]);
      res.json({ status: 'ok', result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, details: error.stderr });
    }
  });

  router.get('/list-branches', async (_req, res) => {
    try {
      const result = await runGitCommand('branch', ['--all']);
      const branches = result.stdout
        .split('\n')
        .map((line) => line.replace('*', '').trim())
        .filter(Boolean);
      res.json({ status: 'ok', branches });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, details: error.stderr });
    }
  });

  router.get('/status', async (_req, res) => {
    try {
      const result = await runGitCommand('status', ['--short']);
      res.json({ status: 'ok', result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, details: error.stderr });
    }
  });

  router.post('/diff', async (req, res) => {
    try {
      const base = req.body?.base ? sanitizeBranchName(req.body.base) : undefined;
      const compare = req.body?.compare ? sanitizeBranchName(req.body.compare) : undefined;

      if (!compare) {
        throw new Error('compare branch is required');
      }

      const args = base ? [`${base}..${compare}`] : [compare];
      const result = await runGitCommand('diff', args);
      res.json({ status: 'ok', result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, details: error.stderr });
    }
  });

  router.post('/pull', async (req, res) => {
    try {
      const remote = req.body?.remote || 'origin';
      const branch = req.body?.branch ? sanitizeBranchName(req.body.branch) : undefined;
      const args = branch ? [remote, branch] : [remote];
      const result = await runGitCommand('pull', args);
      res.json({ status: 'ok', result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message, details: error.stderr });
    }
  });

  return router;
}
