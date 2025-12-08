#!/usr/bin/env ts-node

/**
 * Shared Ollama utilities for MCP tooling.
 */

import { spawnSync } from 'child_process';

export const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';

export type OllamaModelSource = 'local-api' | 'local-cli' | 'registry';

export interface OllamaModelInfo {
  name: string;
  digest?: string;
  sizeBytes?: number;
  sizeHuman?: string;
  modified?: string;
  details?: string;
  tags?: string[];
  families?: string[];
  parameterCount?: number;
  quantization?: string;
  source: OllamaModelSource;
}

export interface ModelCatalogResult {
  models: OllamaModelInfo[];
  warnings: string[];
}

export interface RegistryCatalogResult extends ModelCatalogResult {
  endpoint?: string;
}

export function normalizeHost(raw?: string | null): string {
  if (!raw) {
    return DEFAULT_OLLAMA_HOST;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_OLLAMA_HOST;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
}

function formatSizeFromBytes(bytes?: number): string | undefined {
  if (bytes === undefined || Number.isNaN(bytes)) {
    return undefined;
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 2)} ${units[unitIndex]}`;
}

function parseHumanReadableSize(input?: string): number | undefined {
  if (!input) {
    return undefined;
  }

  const match = input.trim().match(/^(\d+(?:\.\d+)?)\s*(bytes|kb|mb|gb|tb)?$/i);
  if (!match) {
    return undefined;
  }

  const value = parseFloat(match[1]);
  const unit = (match[2] || 'bytes').toLowerCase();

  const multipliers: Record<string, number> = {
    bytes: 1,
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) {
    return undefined;
  }

  return Math.round(value * multiplier);
}

function resolveOllamaCommand(): string | undefined {
  const candidates = process.platform === 'win32'
    ? ['ollama.exe', 'ollama']
    : ['ollama'];

  for (const cmd of candidates) {
    const result = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
    if (result.status === 0) {
      return cmd;
    }
  }

  return undefined;
}

function mergeModelEntries(entries: OllamaModelInfo[]): OllamaModelInfo[] {
  const merged = new Map<string, OllamaModelInfo>();

  for (const entry of entries) {
    const existing = merged.get(entry.name);
    if (!existing) {
      merged.set(entry.name, { ...entry });
      continue;
    }

    merged.set(entry.name, {
      ...existing,
      ...entry,
      tags: Array.from(new Set([...(existing.tags || []), ...(entry.tags || [])])).sort(),
      families: Array.from(new Set([...(existing.families || []), ...(entry.families || [])])).sort(),
      source: existing.source,
    });
  }

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchFromLocalApi(host: string, timeoutMs = 4000): Promise<ModelCatalogResult> {
  try {
    const url = new URL('/api/tags', host).toString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      return {
        models: [],
        warnings: [`Ollama API responded with ${response.status} ${response.statusText}`],
      };
    }

    const data = await response.json();

    const models = Array.isArray(data?.models)
      ? data.models
      : Array.isArray(data)
        ? data
        : [];

    const parsed = models.map((model: any): OllamaModelInfo => {
      const sizeBytes = typeof model?.size === 'number' ? model.size : parseHumanReadableSize(model?.size);

      return {
        name: typeof model?.name === 'string' ? model.name : 'unknown',
        digest: typeof model?.digest === 'string' ? model.digest : undefined,
        sizeBytes,
        sizeHuman: formatSizeFromBytes(sizeBytes),
        modified: typeof model?.modified_at === 'string' ? model.modified_at : undefined,
        details: typeof model?.details === 'string' ? model.details : undefined,
        tags: Array.isArray(model?.tags) ? model.tags.filter(Boolean) : undefined,
        families: Array.isArray(model?.families) ? model.families.filter(Boolean) : undefined,
        parameterCount: typeof model?.parameters === 'number' ? model.parameters : undefined,
        quantization: typeof model?.quantization === 'string' ? model.quantization : undefined,
        source: 'local-api',
      };
    }).filter((model: OllamaModelInfo) => model.name !== 'unknown');

    return { models: parsed, warnings: [] };
  } catch (error: any) {
    const reason = error?.message || 'Unknown error';
    return {
      models: [],
      warnings: [`Failed to query Ollama API at ${host}: ${reason}`],
    };
  }
}

function parseCliListOutput(output: string): OllamaModelInfo[] {
  const lines = output.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return [];
  }

  const result: OllamaModelInfo[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) {
      continue;
    }

    const columns = line.split(/\s{2,}/);
    if (columns.length === 0) {
      continue;
    }

    const name = columns[0];
    const sizeHuman = columns[2];
    const sizeBytes = parseHumanReadableSize(sizeHuman);

    result.push({
      name,
      sizeHuman,
      sizeBytes,
      modified: columns[3],
      source: 'local-cli',
    });
  }

  return result;
}

async function fetchFromCli(): Promise<ModelCatalogResult> {
  const warnings: string[] = [];
  const command = resolveOllamaCommand();

  if (!command) {
    return {
      models: [],
      warnings: ['Could not locate the `ollama` CLI on PATH; skipped CLI harvesting.'],
    };
  }

  const cliResult = spawnSync(command, ['list'], { encoding: 'utf8' });
  if (cliResult.status !== 0) {
    const stderr = cliResult.stderr?.toString().trim();
    warnings.push(stderr || `Failed to run \`${command} list\``);
    return { models: [], warnings };
  }

  const models = parseCliListOutput(cliResult.stdout || '');
  return { models, warnings };
}

export async function fetchLocalModelCatalog(options: { host?: string; timeoutMs?: number } = {}): Promise<ModelCatalogResult> {
  const host = normalizeHost(options.host);
  const timeoutMs = options.timeoutMs ?? 4000;

  const [apiResult, cliResult] = await Promise.all([
    fetchFromLocalApi(host, timeoutMs),
    fetchFromCli(),
  ]);

  const merged = mergeModelEntries([...apiResult.models, ...cliResult.models]);
  return {
    models: merged,
    warnings: [...apiResult.warnings, ...cliResult.warnings],
  };
}

export async function fetchRegistryCatalog(options: { query?: string; limit?: number; timeoutMs?: number } = {}): Promise<RegistryCatalogResult> {
  const endpoint = 'https://registry.ollama.ai/api/models';
  const warnings: string[] = [];

  try {
    const params = new URLSearchParams();
    if (options.query) {
      params.set('name', options.query);
    }
    if (options.limit) {
      params.set('limit', String(options.limit));
    }

    const url = params.toString() ? `${endpoint}?${params}` : endpoint;
    const timeoutMs = options.timeoutMs ?? 5000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      warnings.push(`Registry responded with ${response.status} ${response.statusText}`);
      return { models: [], warnings, endpoint: url };
    }

    const data = await response.json();

    const rawModels = Array.isArray(data?.models)
      ? data.models
      : Array.isArray(data)
        ? data
        : [];

    const models = rawModels.map((model: any): OllamaModelInfo => {
      const sizeBytes = typeof model?.size === 'number' ? model.size : parseHumanReadableSize(model?.size);
      return {
        name: typeof model?.name === 'string' ? model.name : 'unknown-registry-model',
        sizeBytes,
        sizeHuman: formatSizeFromBytes(sizeBytes),
        details: typeof model?.description === 'string' ? model.description : undefined,
        parameterCount: typeof model?.parameter_size === 'number' ? model.parameter_size : undefined,
        families: Array.isArray(model?.families) ? model.families.filter(Boolean) : undefined,
        tags: Array.isArray(model?.tags) ? model.tags.filter(Boolean) : undefined,
        source: 'registry',
      };
    }).filter((model: OllamaModelInfo) => model.name !== 'unknown-registry-model');

    return { models, warnings, endpoint: url };
  } catch (error: any) {
    const reason = error?.message || 'Unknown error';
    warnings.push(`Failed to query Ollama registry: ${reason}`);
    return { models: [], warnings, endpoint };
  }
}

export function renderModelCatalog(models: OllamaModelInfo[]): string {
  if (!models.length) {
    return 'No models discovered.';
  }

  const header = 'Name'.padEnd(34) + 'Size'.padEnd(12) + 'Source'.padEnd(12) + 'Details';
  const rows = models.map(model => {
    const size = model.sizeHuman ?? (model.sizeBytes ? formatSizeFromBytes(model.sizeBytes) : 'n/a');
    const detail = model.details ? model.details.slice(0, 60) : '';
    return `${model.name.padEnd(34)}${(size || 'n/a').padEnd(12)}${model.source.padEnd(12)}${detail}`;
  });

  return [header, '-'.repeat(80), ...rows].join('\n');
}
