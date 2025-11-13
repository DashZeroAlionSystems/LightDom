#!/usr/bin/env node
import { spawn } from 'child_process';

// This script launches services/queue-service.js as a detached background process
// so it won't be terminated if the parent shell/session closes. Useful for
// local development when running from editors or CI that may send signals.

const port = process.env.QUEUE_API_PORT || '3060';
const nodeArgs = ['services/queue-service.js'];

console.log('Spawning detached queue-service on port', port);

const child = spawn(process.execPath, nodeArgs, {
  detached: true,
  stdio: 'ignore',
  env: { ...process.env, QUEUE_API_PORT: port },
  cwd: process.cwd(),
});

child.unref();

console.log('Detached queue-service started with pid', child.pid);
