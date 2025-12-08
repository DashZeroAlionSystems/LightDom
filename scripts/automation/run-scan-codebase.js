#!/usr/bin/env node

/**
 * CLI helper that invokes the scan_codebase agent tool so
 * DeepSeek/RAG always have a fresh snapshot of the repo.
 */

import path from 'path';
import process from 'process';
import { runCodebaseScan } from '../../api/agent-tools.js';

function parseArgs(argv = []) {
  const params = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    switch (key) {
      case 'root':
        params.root = next || '.';
        i += 1;
        break;
      case 'maxFiles':
        params.maxFiles = Number(next);
        i += 1;
        break;
      case 'maxBytes':
        params.maxBytesPerFile = Number(next);
        i += 1;
        break;
      case 'preview':
        params.previewLength = Number(next);
        i += 1;
        break;
      case 'include':
        params.includeExtensions = next ? next.split(',').map((ext) => ext.trim()) : undefined;
        i += 1;
        break;
      case 'exclude':
        params.excludePaths = next ? next.split(',').map((value) => value.trim()) : undefined;
        i += 1;
        break;
      default:
        break;
    }
  }
  return params;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await runCodebaseScan(args);

  console.log('✅ Codebase scan complete');
  console.log(`   Root: ${result.root || path.resolve(process.cwd(), args.root || '.')}`);
  console.log(`   Indexed files: ${result.stats.indexed}`);
  console.log(`   Skipped (extension): ${result.stats.skippedByExtension}`);
  console.log(`   Skipped (size): ${result.stats.skippedBySize}`);
  console.log(`   Output: ${result.indexFile}`);

  if (result.files.length > 0) {
    console.log('   Sample files:');
    result.files.slice(0, 5).forEach((file) => {
      console.log(`     - ${file.path} (${file.size} bytes)`);
    });
  }
}

main().catch((error) => {
  console.error('🚨 Codebase scan failed:', error.message);
  process.exit(1);
});
