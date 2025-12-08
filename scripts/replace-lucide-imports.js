#!/usr/bin/env node
"use strict";

// Simple codemod to replace named imports from 'lucide-react' with a namespace import
// and update JSX usages to use LucideIcons.<IconName>.
// Usage:
//   # Dry run (default) - shows files that would be changed
//   node scripts/replace-lucide-imports.js
//   # Apply changes
//   node scripts/replace-lucide-imports.js --apply

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = ['frontend/src'];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply') || args.includes('-a');

async function walk(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results = results.concat(await walk(full));
    } else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) {
      results.push(full);
    }
  }
  return results;
}

function parseNamedImports(importSpec) {
  // importSpec is the string inside { ... }
  return importSpec
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(token => {
      // token may be like IconName or IconName as Alias
      const m = token.match(/^([A-Za-z0-9_]+)(?:\s+as\s+([A-Za-z0-9_]+))?$/);
      if (!m) return null;
      const original = m[1];
      const local = m[2] || m[1];
      return { original, local };
    })
    .filter(Boolean);
}

async function transformFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  if (!/from\s+['"]lucide-react['"]/.test(content)) return null;
  if (/import\s*\*\s*as\s+LucideIcons\s*from\s*['"]lucide-react['"]/.test(content)) {
    // already using namespace import - nothing to do
    return null;
  }

  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/gm;
  const matches = Array.from(content.matchAll(importRegex));
  if (matches.length === 0) return null;

  // Collect mappings and compute new content
  let mappings = [];
  for (const m of matches) {
    const spec = m[1];
    const parsed = parseNamedImports(spec);
    mappings.push(...parsed);
  }
  if (mappings.length === 0) return null;

  // Remove all matching import lines and insert a single namespace import
  const firstMatchIndex = matches[0].index;
  const lastMatch = matches[matches.length - 1];
  const lastEnd = lastMatch.index + lastMatch[0].length;

  let newContent = content.slice(0, firstMatchIndex) + "import * as LucideIcons from 'lucide-react';\n" + content.slice(lastEnd);

  // Replace JSX tag usages like <Icon ...> and </Icon>
  for (const { local, original } of mappings) {
    // Replace opening tags: <LocalName , <LocalName/ , <LocalName>
    const openTag = new RegExp('<\\s*' + local + '(?=[\\s/>])', 'g');
    newContent = newContent.replace(openTag, '<LucideIcons.' + original);

    // Replace closing tags: </LocalName>
    const closeTag = new RegExp('</\\s*' + local + '(?=[\\s>])', 'g');
    newContent = newContent.replace(closeTag, '</LucideIcons.' + original);
  }

  return { filePath, original: content, transformed: newContent, mappings };
}

async function run() {
  const filesToProcess = [];
  for (const d of TARGET_DIRS) {
    const dir = path.join(ROOT, d);
    try {
      const files = await walk(dir);
      filesToProcess.push(...files);
    } catch (err) {
      // ignore missing directories
    }
  }

  let changes = [];
  for (const f of filesToProcess) {
    try {
      const res = await transformFile(f);
      if (res) changes.push(res);
    } catch (err) {
      console.error('Error processing', f, err.message);
    }
  }

  if (changes.length === 0) {
    console.log('No lucide-react named-imports found to replace.');
    return;
  }

  console.log(`Found ${changes.length} file(s) that will be updated:`);
  for (const c of changes) {
    console.log(' -', path.relative(ROOT, c.filePath), '(', c.mappings.map(m => m.local).join(', '), ')');
  }

  if (!APPLY) {
    console.log('\nDry run: no files were changed. Run with --apply to write changes.');
    return;
  }

  // Apply changes
  for (const c of changes) {
    await fs.writeFile(c.filePath, c.transformed, 'utf8');
    console.log('Patched', path.relative(ROOT, c.filePath));
  }

  console.log('\nDone. Please review changes and run your test/dev server.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
