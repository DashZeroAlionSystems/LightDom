import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(moduleDir, '../../design/styleguide.json');
const markdownPath = resolve(moduleDir, '../../docs/styleguide.md');

function ensure(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`Styleguide validation failed: ${message}`);
    process.exitCode = 1;
  }
}

function main(): void {
  const jsonRaw = readFileSync(jsonPath, 'utf8');
  const docRaw = readFileSync(markdownPath, 'utf8');
  const styleguide = JSON.parse(jsonRaw) as {
    version?: string;
    governance?: { changeLog?: Array<{ date?: string; summary?: string }> };
  };

  ensure(Boolean(styleguide.version), 'design/styleguide.json is missing the "version" field.');

  if (styleguide.version) {
    ensure(docRaw.includes('Status:'), 'docs/styleguide.md must include a Status block.');
    ensure(docRaw.includes(styleguide.version), `docs/styleguide.md must reference version ${styleguide.version}.`);
    console.log(`✔ Version ${styleguide.version} referenced in markdown.`);
  }

  const changelog = styleguide.governance?.changeLog ?? [];
  ensure(changelog.length > 0, 'governance.changeLog must contain at least one entry.');
  ensure(docRaw.includes('Changelog'), 'docs/styleguide.md must include a Changelog section.');

  if (process.exitCode === undefined) {
    console.log('Styleguide validation passed.');
  }
}

main();
