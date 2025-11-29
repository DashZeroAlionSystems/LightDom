import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_ROOT = resolve(process.cwd(), 'storyMining/data');

export function resolveBatchPath(batchId: string, subPath = ''): string {
  return resolve(DATA_ROOT, batchId, subPath);
}

export function ensureBatchDirectories(batchId: string): void {
  const base = resolveBatchPath(batchId);
  if (!existsSync(base)) {
    mkdirSync(base, { recursive: true });
  }
  const processedDirs = [
    resolve(base, 'processed'),
    resolve(base, 'processed/screenshots'),
    resolve(base, 'processed/stories'),
    resolve(base, 'processed/layers'),
    resolve(base, 'processed/metadata'),
  ];
  for (const dir of processedDirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
