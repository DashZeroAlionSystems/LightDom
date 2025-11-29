#!/usr/bin/env ts-node

import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

import {
    DEFAULT_OLLAMA_HOST,
    fetchLocalModelCatalog,
    fetchRegistryCatalog,
    normalizeHost,
    renderModelCatalog,
} from './lib/ollama-utils.js';

interface CliOptions {
  host?: string;
  query?: string;
  json?: boolean;
  limit?: number;
  includeRegistry?: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--host' && i + 1 < argv.length) {
      options.host = argv[++i];
    } else if (arg === '--query' && i + 1 < argv.length) {
      options.query = argv[++i];
      options.includeRegistry = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--limit' && i + 1 < argv.length) {
      const maybeNumber = Number(argv[++i]);
      if (!Number.isNaN(maybeNumber)) {
        options.limit = maybeNumber;
      }
    } else if (arg === '--all-registry') {
      options.includeRegistry = true;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const cliOptions = parseArgs(process.argv.slice(2));
  const host = normalizeHost(cliOptions.host || process.env.OLLAMA_HOST || process.env.OLLAMA_ENDPOINT || DEFAULT_OLLAMA_HOST);

  const localResult = await fetchLocalModelCatalog({ host });
  const registryResult = cliOptions.includeRegistry
    ? await fetchRegistryCatalog({ query: cliOptions.query, limit: cliOptions.limit })
    : { models: [], warnings: [], endpoint: undefined };

  const allWarnings = [...localResult.warnings, ...registryResult.warnings];

  if (cliOptions.json) {
    const payload = {
      host,
      queriedAt: new Date().toISOString(),
      localModels: localResult.models,
      registryEndpoint: registryResult.endpoint,
      registryModels: registryResult.models,
      warnings: allWarnings,
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const projectRoot = path.dirname(fileURLToPath(import.meta.url));
  console.log(`📡 Ollama host: ${host}`);
  console.log(`📂 Working directory: ${projectRoot}`);

  if (localResult.models.length) {
    console.log('\n🧠 Local model catalog');
    console.log(renderModelCatalog(localResult.models));
  } else {
    console.log('\n⚠️  No local models detected. Use `ollama pull <model>` to download one.');
  }

  if (registryResult.models.length) {
    console.log(`\n🌍 Registry snapshot${cliOptions.query ? ` for query "${cliOptions.query}"` : ''}`);
    console.log(renderModelCatalog(registryResult.models));
  } else if (cliOptions.includeRegistry) {
    console.log('\n⚠️  No registry models found for the given parameters.');
  }

  if (allWarnings.length) {
    console.log('\n⚠️  Warnings:');
    for (const warning of allWarnings) {
      console.log(`   • ${warning}`);
    }
  }
}

main().catch(error => {
  console.error('Failed to build Ollama model catalog:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
