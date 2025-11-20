#!/usr/bin/env node

import { spawn, spawnSync } from 'child_process';
import process from 'process';

const log = (message) => {
  process.stdout.write(`\x1b[36m[ocr-worker]\x1b[0m ${message}\n`);
};

const error = (message) => {
  process.stderr.write(`\x1b[31m[ocr-worker]\x1b[0m ${message}\n`);
};

function ensureContainerStopped(name) {
  if (!name) return;
  const inspect = spawnSync('docker', ['inspect', name], { stdio: 'ignore' });
  if (inspect.status === 0) {
    log(`Existing container ${name} detected. Attempting to stop and remove it.`);
    const rm = spawnSync('docker', ['rm', '-f', name], { stdio: 'inherit' });
    if (rm.status !== 0) {
      error(`Failed to remove existing container ${name}. Exit code ${rm.status ?? 'unknown'}.`);
    }
  }
}

function maybePullImage(image) {
  const shouldPull = process.env.OCR_WORKER_IMAGE_PULL?.toLowerCase() === 'true';
  if (!shouldPull) return;

  log(`Pulling latest image ${image}...`);
  const pull = spawnSync('docker', ['pull', image], { stdio: 'inherit' });
  if (pull.status !== 0) {
    error(`docker pull ${image} failed with exit code ${pull.status ?? 'unknown'}`);
  }
}

function buildArgs() {
  const containerName = process.env.OCR_WORKER_CONTAINER || 'lightdom-ocr-worker';
  const image = process.env.OCR_WORKER_IMAGE || 'lightdom-ocr-worker:latest';
  const port = process.env.OCR_WORKER_PORT || '4205';
  const compression = process.env.OCR_WORKER_COMPRESSION || 'medium';
  const logLevel = process.env.OCR_WORKER_LOG_LEVEL || 'info';
  const allowMock = process.env.OCR_WORKER_ALLOW_MOCK || 'true';
  const gpuEnabled = process.env.OCR_WORKER_ENABLE_GPU?.toLowerCase() !== 'false';
  const extraArgs = process.env.OCR_WORKER_EXTRA_ARGS ? process.env.OCR_WORKER_EXTRA_ARGS.split(' ') : [];

  const args = [
    'run',
    '--rm',
    '--name',
    containerName,
    '-p',
    `${port}:8080`,
    '-e',
    `OCR_WORKER_COMPRESSION=${compression}`,
    '-e',
    `OCR_WORKER_LOG_LEVEL=${logLevel}`,
    '-e',
    `OCR_WORKER_ALLOW_MOCK=${allowMock}`,
  ];

  if (gpuEnabled) {
    args.push('--gpus', process.env.OCR_WORKER_GPU_TARGET || 'all');
  }

  if (process.env.OCR_REMOTE_ENDPOINT) {
    args.push('-e', `OCR_REMOTE_ENDPOINT=${process.env.OCR_REMOTE_ENDPOINT}`);
  }

  if (process.env.OCR_WORKER_MODEL) {
    args.push('-e', `OCR_WORKER_MODEL=${process.env.OCR_WORKER_MODEL}`);
  }

  if (process.env.OCR_WORKER_TIMEOUT_MS) {
    args.push('-e', `OCR_WORKER_TIMEOUT_MS=${process.env.OCR_WORKER_TIMEOUT_MS}`);
  }

  if (process.env.OCR_WORKER_MAX_IMAGE_MB) {
    args.push('-e', `OCR_WORKER_MAX_IMAGE_MB=${process.env.OCR_WORKER_MAX_IMAGE_MB}`);
  }

  args.push(...extraArgs.filter(Boolean));
  args.push(image);

  return { args, containerName, image };
}

function start() {
  const { args, containerName, image } = buildArgs();
  ensureContainerStopped(containerName);
  maybePullImage(image);

  log(`Starting container ${containerName} from image ${image}`);
  log(`docker ${args.join(' ')}`);

  const child = spawn('docker', args, { stdio: 'inherit' });

  child.on('exit', (code, signal) => {
    if (code === 0) {
      log(`docker run exited cleanly`);
      process.exit(0);
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    error(`docker run exited with ${reason}`);
    process.exit(code ?? 1);
  });

  child.on('error', (err) => {
    error(`Failed to start docker run: ${err.message}`);
    process.exit(1);
  });
}

start();
