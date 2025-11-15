#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdtemp, readFile, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { stdin as input, stdout as output } from 'process';
import { createInterface } from 'readline/promises';
import { fileURLToPath } from 'url';

import {
    DEFAULT_OLLAMA_HOST,
    fetchLocalModelCatalog,
    normalizeHost,
    OllamaModelInfo,
} from './lib/ollama-utils.js';

interface CliOptions {
  config?: string;
  host?: string;
  model?: string;
  bundle?: string;
  persist?: boolean;
  listOnly?: boolean;
}

interface McpServerEntry {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

interface McpConfig {
  mcpServers: Record<string, McpServerEntry>;
  bundles?: Record<string, string[]>;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config' && i + 1 < argv.length) {
      options.config = argv[++i];
    } else if (arg === '--host' && i + 1 < argv.length) {
      options.host = argv[++i];
    } else if (arg === '--model' && i + 1 < argv.length) {
      options.model = argv[++i];
    } else if (arg === '--bundle' && i + 1 < argv.length) {
      options.bundle = argv[++i];
    } else if (arg === '--persist') {
      options.persist = true;
    } else if (arg === '--list') {
      options.listOnly = true;
    }
  }

  return options;
}

function resolveProjectRoot(): string {
  const current = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(current, '..');
}

function resolveConfigPath(projectRoot: string, override?: string): string {
  if (override) {
    return path.isAbsolute(override) ? override : path.resolve(projectRoot, override);
  }

  return path.resolve(projectRoot, 'config', 'mcp', 'ollama-mcp-servers.json');
}

function formatModel(model: OllamaModelInfo): string {
  const size = model.sizeHuman ?? (model.sizeBytes ? `${model.sizeBytes} bytes` : 'unknown');
  const parts = [model.name, `size=${size}`, `source=${model.source}`];
  if (model.families?.length) {
    parts.push(`families=${model.families.join(',')}`);
  }
  return parts.join(' | ');
}

async function chooseModel(models: OllamaModelInfo[], preferred?: string): Promise<OllamaModelInfo | { name: string }> {
  if (preferred) {
    const match = models.find(model => model.name === preferred);
    if (match) {
      return match;
    }
    return { name: preferred };
  }

  if (!models.length) {
    const rl = createInterface({ input, output });
    const manual = await rl.question('No local models found. Enter a model name to use: ');
    rl.close();
    return { name: manual.trim() };
  }

  const rl = createInterface({ input, output });
  let filtered = models;

  while (true) {
    console.log('\nAvailable Ollama models (use /filter to narrow down, or type manual):');
    filtered.forEach((model, index) => {
      console.log(`  ${index + 1}. ${formatModel(model)}`);
    });

    const answer = await rl.question('Select model number, type /filter <text>, or enter manual name: ');

    if (answer.startsWith('/filter')) {
      const [, ...searchParts] = answer.split(' ');
      const search = searchParts.join(' ').toLowerCase();
      filtered = models.filter(model => formatModel(model).toLowerCase().includes(search));
      if (!filtered.length) {
        console.log('No models matched that filter. Showing all models again.');
        filtered = models;
      }
      continue;
    }

    if (answer.toLowerCase() === 'manual') {
      const manual = await rl.question('Enter model name: ');
      rl.close();
      return { name: manual.trim() };
    }

    const choice = Number(answer);
    if (!Number.isNaN(choice) && choice >= 1 && choice <= filtered.length) {
      const selected = filtered[choice - 1];
      rl.close();
      return selected;
    }

    console.log('Invalid selection, please try again.');
  }
}

function listBundles(config: McpConfig): Array<{ name: string; servers: string[] }> {
  return Object.entries(config.bundles || {}).map(([name, servers]) => ({ name, servers }));
}

async function chooseBundle(
  config: McpConfig,
  preferred?: string,
): Promise<{ bundleName: string | null; serverNames: string[] }> {
  const bundles = listBundles(config);
  const serverEntries = Object.entries(config.mcpServers);
  const defaultEnabled = serverEntries
    .filter(([, server]) => !server.disabled)
    .map(([name]) => name);

  if (preferred) {
    const match = bundles.find(bundle => bundle.name === preferred);
    if (match) {
      return { bundleName: match.name, serverNames: match.servers };
    }
    console.warn(`Requested bundle "${preferred}" not found. Falling back to manual selection.`);
  }

  if (bundles.length === 0) {
    if (defaultEnabled.length) {
      return { bundleName: null, serverNames: defaultEnabled };
    }

    return { bundleName: null, serverNames: serverEntries.map(([name]) => name) };
  }

  const rl = createInterface({ input, output });

  while (true) {
    console.log('\nAvailable MCP bundles:');
    bundles.forEach((bundle, index) => {
      console.log(`  ${index + 1}. ${bundle.name} (${bundle.servers.length} servers)`);
    });
    console.log(`  ${bundles.length + 1}. Custom selection`);

    const answer = await rl.question('Choose a bundle (#) or select custom: ');
    const choice = Number(answer);

    if (!Number.isNaN(choice) && choice >= 1 && choice <= bundles.length) {
      const bundle = bundles[choice - 1];
      rl.close();
      return { bundleName: bundle.name, serverNames: bundle.servers };
    }

    if (choice === bundles.length + 1 || answer.toLowerCase() === 'custom') {
      rl.close();
      return { bundleName: null, serverNames: await chooseCustomServers(config) };
    }

    console.log('Invalid selection, please try again.');
  }
}

async function chooseCustomServers(config: McpConfig): Promise<string[]> {
  const entries = Object.entries(config.mcpServers);
  const rl = createInterface({ input, output });

  console.log('\nAvailable MCP servers:');
  entries.forEach(([name, server], index) => {
    const status = server.disabled ? 'disabled' : 'enabled';
    console.log(`  ${index + 1}. ${name} (${status})`);
  });

  const answer = await rl.question('Enter comma separated numbers (e.g., 1,3) or press Enter to use enabled defaults: ');
  rl.close();

  if (!answer.trim()) {
    return entries.filter(([, server]) => !server.disabled).map(([name]) => name);
  }

  const indices = answer.split(',').map(part => Number(part.trim()) - 1).filter(index => !Number.isNaN(index));
  const serverNames = indices
    .filter(index => index >= 0 && index < entries.length)
    .map(index => entries[index][0]);

  if (!serverNames.length) {
    console.warn('No valid selections detected. Using all configured servers.');
    return entries.map(([name]) => name);
  }

  return Array.from(new Set(serverNames));
}

async function promptYesNo(question: string, defaultAnswer = false): Promise<boolean> {
  const rl = createInterface({ input, output });
  const suffix = defaultAnswer ? '[Y/n]' : '[y/N]';
  const answer = (await rl.question(`${question} ${suffix} `)).trim().toLowerCase();
  rl.close();

  if (!answer) {
    return defaultAnswer;
  }

  return answer === 'y' || answer === 'yes';
}

async function maybePersistBundle(
  configPath: string,
  config: McpConfig,
  serverNames: string[],
): Promise<string | null> {
  const shouldPersist = await promptYesNo('Save this server selection as a reusable bundle?', false);
  if (!shouldPersist) {
    return null;
  }

  const rl = createInterface({ input, output });
  const name = (await rl.question('Enter bundle name (letters, numbers, dashes): ')).trim();
  rl.close();

  if (!name) {
    console.warn('Bundle name cannot be empty. Skipping persistence.');
    return null;
  }

  if (!/^[a-z0-9\-:_]+$/i.test(name)) {
    console.warn('Bundle name contains unsupported characters. Skipping persistence.');
    return null;
  }

  const bundles = { ...(config.bundles || {}) };
  bundles[name] = serverNames;

  const updated: McpConfig = {
    mcpServers: config.mcpServers,
    bundles,
  };

  await writeFile(configPath, `${JSON.stringify(updated, null, 4)}\n`, 'utf8');
  console.log(`✅ Saved bundle "${name}" to ${configPath}`);
  return name;
}

async function buildTempConfig(
  config: McpConfig,
  serverNames: string[],
): Promise<string> {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'lightdom-mcp-'));
  const tmpPath = path.join(tmpDir, 'servers.json');

  const selected: Record<string, McpServerEntry> = {};
  for (const name of serverNames) {
    const entry = config.mcpServers[name];
    if (!entry) {
      console.warn(`Server "${name}" is not defined in configuration.`);
      continue;
    }

    selected[name] = {
      ...entry,
      disabled: false,
    };
  }

  if (!Object.keys(selected).length) {
    throw new Error('No MCP servers selected. Aborting launch.');
  }

  await writeFile(tmpPath, `${JSON.stringify({ mcpServers: selected }, null, 4)}\n`, 'utf8');
  return tmpPath;
}

function runOllamaMcp(tempConfig: string, modelName: string, host: string): void {
  console.log('\n🚀 Launching DeepSeek Ollama MCP session...');
  console.log(`   Model: ${modelName}`);
  console.log(`   Host: ${host}`);
  console.log(`   Config: ${tempConfig}`);

  const command = `${process.platform === 'win32' ? 'npx.cmd' : 'npx'} --yes tsx scripts/start-ollama-mcp-client.ts`;

  const child = spawn(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      OLLAMA_MCP_MODEL: modelName,
      OLLAMA_HOST: host,
      OLLAMA_MCP_SERVERS: tempConfig,
    },
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code === null ? 1 : code);
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const projectRoot = resolveProjectRoot();
  const configPath = resolveConfigPath(projectRoot, options.config);

  if (!existsSync(configPath)) {
    throw new Error(`MCP server configuration not found at ${configPath}`);
  }

  const config: McpConfig = JSON.parse(await readFile(configPath, 'utf8'));
  const host = normalizeHost(options.host || process.env.OLLAMA_HOST || process.env.OLLAMA_ENDPOINT || DEFAULT_OLLAMA_HOST);

  if (options.listOnly) {
    console.log(`📄 MCP configuration: ${configPath}`);
    console.log('\nServers:');
    Object.entries(config.mcpServers).forEach(([name, entry]) => {
      console.log(`  - ${name} (command=${entry.command}, disabled=${Boolean(entry.disabled)})`);
    });
    console.log('\nBundles:');
    Object.entries(config.bundles || {}).forEach(([name, servers]) => {
      console.log(`  - ${name}: ${servers.join(', ')}`);
    });
    return;
  }

  const catalog = await fetchLocalModelCatalog({ host });
  if (catalog.warnings.length) {
    catalog.warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
  }

  const model = await chooseModel(catalog.models, options.model);
  const bundleSelection = await chooseBundle(config, options.bundle);

  if (!bundleSelection.serverNames.length) {
    throw new Error('No MCP servers selected for the session.');
  }

  if (options.persist && !bundleSelection.bundleName) {
    const persistedName = await maybePersistBundle(configPath, config, bundleSelection.serverNames);
    if (persistedName) {
      bundleSelection.bundleName = persistedName;
    }
  }

  const tempConfig = await buildTempConfig(config, bundleSelection.serverNames);
  runOllamaMcp(tempConfig, model.name, host);
}

main().catch(error => {
  console.error('Failed to launch DeepSeek MCP session:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
