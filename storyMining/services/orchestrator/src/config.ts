import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import type { StoryMinerConfig } from './types.js';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const serviceConfigPath = resolve(moduleDir, '../../config/default.json');
const styleguidePath = resolve(moduleDir, '../../../design/styleguide.json');

function readJson<T>(path: string): T {
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as T;
}

interface StyleguideAutomation {
  automation?: {
    queue?: {
      queues?: StoryMinerConfig['queues'];
    };
  };
}

export function loadConfig(): StoryMinerConfig {
  const base = readJson<StoryMinerConfig>(serviceConfigPath);
  const styleguide = readJson<StyleguideAutomation>(styleguidePath);
  const queueOverrides = styleguide.automation?.queue?.queues;
  return {
    ...base,
    queues: queueOverrides ? { ...base.queues, ...queueOverrides } : base.queues,
  };
}
