#!/usr/bin/env node

/**
 * Frontend-Only Startup Script
 * Starts just the Discord-style frontend for testing
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Starting Discord-Style Frontend...');
console.log('=====================================\n');

// Start the frontend
const frontendProcess = spawn('yarn', ['dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_PORT: '3000',
  },
});

frontendProcess.on('error', error => {
  console.error('❌ Frontend error:', error);
});

frontendProcess.on('exit', code => {
  console.log(`Frontend exited with code ${code}`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down frontend...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});
