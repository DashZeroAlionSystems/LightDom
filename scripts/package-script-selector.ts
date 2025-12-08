#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';
import { stdin as input, stdout as output } from 'process';
import { createInterface } from 'readline/promises';
import { fileURLToPath } from 'url';

interface ScriptEntry {
  name: string;
  command: string;
}

function resolveProjectRoot(): string {
  const current = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(current, '..');
}

async function loadScripts(projectRoot: string): Promise<ScriptEntry[]> {
  const packageJsonPath = path.resolve(projectRoot, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts || {};

  return Object.entries<string>(scripts)
    .map(([name, command]) => ({ name, command }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function displayScripts(scripts: ScriptEntry[]): void {
  if (!scripts.length) {
    console.log('No npm scripts found.');
    return;
  }

  scripts.forEach((script, index) => {
    console.log(`${String(index + 1).padStart(3, ' ')}. ${script.name} -> ${script.command}`);
  });
}

async function launchScript(script: ScriptEntry): Promise<void> {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  console.log(`\n▶ Running script: ${script.name}`);
  const child = spawn(npmCommand, ['run', script.name], {
    stdio: 'inherit',
    env: process.env,
  });

  await new Promise<void>((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${script.name} exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

async function main(): Promise<void> {
  const projectRoot = resolveProjectRoot();
  const scripts = await loadScripts(projectRoot);

  if (!scripts.length) {
    console.log('No scripts available in package.json.');
    return;
  }

  let filtered = scripts;
  const rl = createInterface({ input, output });

  try {
    while (true) {
      console.log('\nAvailable npm scripts:');
      displayScripts(filtered.slice(0, 50));
      if (filtered.length > 50) {
        console.log(`...and ${filtered.length - 50} more. Use /filter to narrow the list.`);
      }

      const answer = await rl.question("Enter script number, '/filter text', or 'q' to quit: ");

      if (answer.toLowerCase() === 'q' || answer.toLowerCase() === 'quit') {
        break;
      }

      if (answer.startsWith('/filter')) {
        const query = answer.replace('/filter', '').trim().toLowerCase();
        if (!query) {
          filtered = scripts;
          console.log('Filter cleared. Showing all scripts.');
        } else {
          filtered = scripts.filter(entry =>
            entry.name.toLowerCase().includes(query) ||
            entry.command.toLowerCase().includes(query)
          );
          if (!filtered.length) {
            console.log('No scripts matched that filter.');
            filtered = scripts;
          }
        }
        continue;
      }

      const index = Number(answer) - 1;
      if (Number.isNaN(index) || index < 0 || index >= filtered.length) {
        console.log('Invalid selection. Please try again.');
        continue;
      }

      const script = filtered[index];
      try {
        await launchScript(script);
      } catch (error: any) {
        console.error(error.message || error);
      }

      const continueAnswer = await rl.question('Run another script? [y/N] ');
      if (continueAnswer.trim().toLowerCase() !== 'y') {
        break;
      }
    }
  } finally {
    rl.close();
  }
}

main().catch(error => {
  console.error('Script launcher failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
