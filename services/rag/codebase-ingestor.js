import { promises as fs } from 'fs';
import path from 'path';

const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.sql'];
const DEFAULT_EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.turbo',
  '.cache',
  'coverage',
  'tmp',
  'temp',
  '.vscode',
]);

function isExcludedDir(name, excludeDirs) {
  if (!name) return false;
  if (excludeDirs.has(name)) return true;
  if (name.startsWith('.')) return excludeDirs.has('*dot');
  return false;
}

async function collectCodeFiles({
  rootDir,
  includeExtensions = DEFAULT_EXTENSIONS,
  excludeDirs = DEFAULT_EXCLUDE_DIRS,
  maxFiles = 500,
}) {
  const files = [];
  const stack = [rootDir];
  const extensions = new Set(includeExtensions);

  while (stack.length && files.length < maxFiles) {
    const current = stack.pop();
    if (!current) continue;

    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (error) {
      // Skip directories we cannot read
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);

      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        if (isExcludedDir(entry.name, excludeDirs)) {
          continue;
        }
        stack.push(entryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!extensions.has(ext)) {
        continue;
      }

      files.push(entryPath);
      if (files.length >= maxFiles) {
        break;
      }
    }
  }

  return files;
}

export async function ingestCodebase({
  ragService,
  rootDir = process.cwd(),
  includeExtensions = DEFAULT_EXTENSIONS,
  excludeDirs = DEFAULT_EXCLUDE_DIRS,
  maxFiles = Number.parseInt(process.env.RAG_INDEX_MAX_FILES || '500', 10),
  batchSize = Number.parseInt(process.env.RAG_INDEX_BATCH_SIZE || '20', 10),
  logger = console,
} = {}) {
  if (!ragService || typeof ragService.upsertDocuments !== 'function') {
    throw new Error('ingestCodebase requires a configured ragService');
  }

  const startTime = Date.now();
  const normalizedRoot = path.resolve(rootDir);
  const exclude = new Set(excludeDirs);
  const files = await collectCodeFiles({
    rootDir: normalizedRoot,
    includeExtensions,
    excludeDirs: exclude,
    maxFiles,
  });

  let documentsProcessed = 0;
  let chunksProcessed = 0;

  const batches = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const docs = [];

    for (const filePath of batch) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        if (!content.trim()) {
          continue;
        }

        const stats = await fs.stat(filePath);
        const relativePath = path.relative(normalizedRoot, filePath).replace(/\\/g, '/');

        docs.push({
          id: `code:${relativePath}`,
          title: relativePath,
          content,
          metadata: {
            path: relativePath,
            sizeBytes: stats.size,
            modifiedAt: stats.mtime.toISOString(),
            source: 'codebase',
          },
        });
      } catch (error) {
        logger.warn?.(`Failed to read ${filePath}: ${error.message}`);
      }
    }

    if (!docs.length) {
      continue;
    }

    const result = await ragService.upsertDocuments(docs);
    documentsProcessed += result.documents;
    chunksProcessed += result.chunks;

    logger.log?.(
      `Indexed batch of ${docs.length} files (total files: ${documentsProcessed}, total chunks: ${chunksProcessed})`
    );
  }

  const durationMs = Date.now() - startTime;

  return {
    status: 'ok',
    filesRequested: files.length,
    documentsProcessed,
    chunksProcessed,
    durationMs,
  };
}

export default ingestCodebase;
