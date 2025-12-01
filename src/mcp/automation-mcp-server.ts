#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

interface AutomationScript {
  name: string;
  displayName: string;
  description: string;
  command: string;
  tags: string[];
  category: string;
}

interface ListAutomationArgs {
  filter?: string;
  tag?: string;
}

interface DescribeAutomationArgs {
  scriptName: string;
}

interface RunAutomationArgs {
  scriptName: string;
  args?: string[];
  dryRun?: boolean;
  timeoutMs?: number;
}

interface RunResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  command: string;
  note?: string;
}

const SCRIPT_METADATA: Record<string, Partial<AutomationScript>> = {
  'automation:round': {
    displayName: 'Automation Round',
    description: 'Run a single automation round to execute targeted tasks.',
    tags: ['round', 'automation'],
    category: 'orchestration',
  },
  'automation:master': {
    displayName: 'Master Automation',
    description: 'Execute the master automation orchestrator for multi-round automation.',
    tags: ['master', 'automation'],
    category: 'orchestration',
  },
  'automation:master-full': {
    displayName: 'Master Automation (Full)',
    description: 'Run the full master automation workflow including compliance checks.',
    tags: ['master', 'full'],
    category: 'orchestration',
  },
  'automation:enhanced': {
    displayName: 'Enhanced Automation System',
    description: 'Run the enhanced automation system covering compliance and startup checks.',
    tags: ['enhanced', 'compliance'],
    category: 'quality',
  },
  'automation:app-test': {
    displayName: 'App Startup Tester',
    description: 'Test application startup flows including API, frontend, and services.',
    tags: ['testing', 'startup'],
    category: 'quality',
  },
  'automation:organize': {
    displayName: 'Enterprise Organizer',
    description: 'Organize project structure using the enterprise organizer workflow.',
    tags: ['structure', 'organize'],
    category: 'maintenance',
  },
  'automation:git-safe': {
    displayName: 'Git Safe Automation',
    description: 'Run git-safe automation to create backup branches and manage changes.',
    tags: ['git', 'safety'],
    category: 'maintenance',
  },
  'automation:mermaid': {
    displayName: 'Automation Mermaid Generator',
    description: 'Generate Mermaid diagrams for automation workflows.',
    tags: ['documentation', 'mermaid'],
    category: 'reporting',
  },
  'automation:autopilot': {
    displayName: 'Autopilot Automation',
    description: 'Run automation autopilot to coordinate fix rounds with agents.',
    tags: ['autopilot', 'agents'],
    category: 'orchestration',
  },
  'automation:workflow': {
    displayName: 'Workflow Runner',
    description: 'Run automation workflow runner for YAML-defined workflows.',
    tags: ['workflow'],
    category: 'orchestration',
  },
  'automation:workflow:complete': {
    displayName: 'Workflow Runner (Complete)',
    description: 'Execute the complete automation workflow definition.',
    tags: ['workflow', 'complete'],
    category: 'orchestration',
  },
  'automation:complete': {
    displayName: 'Complete Automation System',
    description: 'Run the complete automation system demo.',
    tags: ['demo', 'complete'],
    category: 'demo',
  },
  'automation:monitor': {
    displayName: 'Automation Monitor',
    description: 'Start the automation monitoring system.',
    tags: ['monitoring'],
    category: 'monitoring',
  },
  autopilot: {
    displayName: 'Autopilot Entry',
    description: 'Launch the autopilot entry script.',
    tags: ['autopilot'],
    category: 'orchestration',
  },
};

const nodeProcess: any = (globalThis as any).process;

const DEFAULT_TIMEOUT_MS = Number(nodeProcess?.env?.LIGHTDOM_AUTOMATION_TIMEOUT ?? 15 * 60 * 1000);
const MAX_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_OUTPUT_CHARS = Number(nodeProcess?.env?.LIGHTDOM_AUTOMATION_MAX_OUTPUT ?? 20000);

function truncate(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}\n...output truncated (${text.length - limit} additional characters)`;
}

function prettifyName(raw: string): string {
  const withoutPrefix = raw.startsWith('automation:') ? raw.slice('automation:'.length) : raw;
  const parts = withoutPrefix.split(/[:\-_]/).filter(Boolean);
  if (!parts.length) {
    return raw;
  }
  return parts
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function deriveCategory(name: string): string {
  if (SCRIPT_METADATA[name]?.category) {
    return SCRIPT_METADATA[name]!.category!;
  }
  if (name.includes('monitor')) {
    return 'monitoring';
  }
  if (name.includes('test')) {
    return 'quality';
  }
  if (name.includes('workflow')) {
    return 'orchestration';
  }
  return 'automation';
}

function deriveTags(name: string): string[] {
  if (SCRIPT_METADATA[name]?.tags) {
    return SCRIPT_METADATA[name]!.tags!;
  }
  const withoutPrefix = name.startsWith('automation:') ? name.slice('automation:'.length) : name;
  return withoutPrefix.split(/[:\-_]/).filter(Boolean);
}

function coerceStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.map((item) => String(item));
}

class AutomationMCPServer {
  private readonly server: any;
  private readonly projectRoot: string;
  private automationScripts: AutomationScript[] = [];

  constructor() {
    this.projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    this.server = new Server(
      {
        name: 'automation-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_automation_scripts',
            description: 'List automation npm scripts available to run.',
            inputSchema: {
              type: 'object',
              properties: {
                filter: {
                  type: 'string',
                  description: 'Filter scripts by name, description, or tags.',
                },
                tag: {
                  type: 'string',
                  description: 'Filter scripts by tag.',
                },
              },
            },
          },
          {
            name: 'describe_automation_script',
            description: 'Get detailed information about a specific automation script.',
            inputSchema: {
              type: 'object',
              properties: {
                scriptName: {
                  type: 'string',
                  description: 'npm script key, e.g. automation:enhanced.',
                },
              },
              required: ['scriptName'],
            },
          },
          {
            name: 'run_automation_script',
            description: 'Execute an automation script via npm run.',
            inputSchema: {
              type: 'object',
              properties: {
                scriptName: {
                  type: 'string',
                  description: 'npm script key to execute.',
                },
                args: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Optional arguments passed after --.',
                },
                dryRun: {
                  type: 'boolean',
                  description: 'Return the command without executing it.',
                },
                timeoutMs: {
                  type: 'number',
                  description: 'Optional timeout in milliseconds (max 30 minutes).',
                },
              },
              required: ['scriptName'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const args = (request.params.arguments as Record<string, unknown>) || {};

      try {
        switch (toolName) {
          case 'list_automation_scripts': {
            const listArgs: ListAutomationArgs = {
              filter: typeof args.filter === 'string' ? args.filter : undefined,
              tag: typeof args.tag === 'string' ? args.tag : undefined,
            };
            const result = await this.handleListAutomation(listArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'describe_automation_script': {
            if (typeof args.scriptName !== 'string') {
              throw new Error('scriptName must be provided as a string.');
            }
            const result = await this.handleDescribeAutomation({ scriptName: args.scriptName });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
          case 'run_automation_script': {
            if (typeof args.scriptName !== 'string') {
              throw new Error('scriptName must be provided as a string.');
            }

            const runArgs: RunAutomationArgs = {
              scriptName: args.scriptName,
              args: coerceStringArray(args.args),
              dryRun: typeof args.dryRun === 'boolean' ? args.dryRun : undefined,
              timeoutMs: typeof args.timeoutMs === 'number' ? args.timeoutMs : undefined,
            };

            const result = await this.handleRunAutomation(runArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
              isError: result.exitCode !== 0,
            };
          }
          default:
            throw new Error(`Unsupported tool: ${toolName}`);
        }
      } catch (error: any) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error && error.stack ? error.stack : undefined;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: message, stack }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async ensureAutomationScripts(): Promise<void> {
    if (this.automationScripts.length) {
      return;
    }

    const packagePath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as { scripts?: Record<string, string> };

    const scripts = packageJson.scripts ?? {};
    const entries = Object.entries(scripts).filter(([name]) => name.startsWith('automation:') || name === 'autopilot');

    this.automationScripts = entries.map(([name, command]) => ({
      name,
      command,
      displayName: SCRIPT_METADATA[name]?.displayName ?? prettifyName(name),
      description:
        SCRIPT_METADATA[name]?.description ?? `Execute npm script "${name}" using the configured automation tooling.`,
      tags: SCRIPT_METADATA[name]?.tags ?? deriveTags(name),
      category: deriveCategory(name),
    }));
  }

  private async handleListAutomation(args: ListAutomationArgs) {
    await this.ensureAutomationScripts();
    const { filter, tag } = args;
    const normalizedFilter = filter?.toLowerCase().trim();
    const normalizedTag = tag?.toLowerCase().trim();

    const scripts = this.automationScripts.filter((script) => {
      const matchesFilter = normalizedFilter
        ? script.name.toLowerCase().includes(normalizedFilter) ||
          script.displayName.toLowerCase().includes(normalizedFilter) ||
          script.description.toLowerCase().includes(normalizedFilter) ||
          script.tags.some((t) => t.toLowerCase().includes(normalizedFilter))
        : true;
      const matchesTag = normalizedTag ? script.tags.some((t) => t.toLowerCase() === normalizedTag) : true;
      return matchesFilter && matchesTag;
    });

    return {
      scripts,
      total: scripts.length,
      available: this.automationScripts.length,
    };
  }

  private async handleDescribeAutomation(args: DescribeAutomationArgs) {
    await this.ensureAutomationScripts();
    const script = this.automationScripts.find((entry) => entry.name === args.scriptName);

    if (!script) {
      throw new Error(`Automation script not found: ${args.scriptName}`);
    }

    return {
      script,
    };
  }

  private async handleRunAutomation(args: RunAutomationArgs) {
    await this.ensureAutomationScripts();
    const script = this.automationScripts.find((entry) => entry.name === args.scriptName);

    if (!script) {
      throw new Error(`Automation script not found: ${args.scriptName}`);
    }

    const timeoutMs = this.resolveTimeout(args.timeoutMs);

    if (args.dryRun) {
      const command = this.buildNpmCommand(script.name, args.args ?? []);
      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
        durationMs: 0,
        command,
        note: 'Dry run: command was not executed.',
      };
    }

    const result = await this.runNpmScript(script.name, args.args ?? [], timeoutMs);
    result.stdout = truncate(result.stdout, MAX_OUTPUT_CHARS);
    result.stderr = truncate(result.stderr, MAX_OUTPUT_CHARS);
    return result;
  }

  private resolveTimeout(requested?: number): number {
    if (!requested) {
      return DEFAULT_TIMEOUT_MS;
    }

    if (requested <= 0) {
      throw new Error('timeoutMs must be greater than zero.');
    }

    if (requested > MAX_TIMEOUT_MS) {
      throw new Error(`timeoutMs cannot exceed ${MAX_TIMEOUT_MS} milliseconds.`);
    }

    return requested;
  }

  private buildNpmCommand(scriptName: string, args: string[]): string {
    const argString = args.length ? ` -- ${args.join(' ')}` : '';
    return `npm run ${scriptName}${argString}`;
  }

  private runNpmScript(scriptName: string, args: string[], timeoutMs: number): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      const npmCommand = nodeProcess?.platform === 'win32' ? 'npm.cmd' : 'npm';
      const spawnArgs = ['run', scriptName];
      if (args.length) {
        spawnArgs.push('--', ...args);
      }

      const child = spawn(npmCommand, spawnArgs, {
        cwd: this.projectRoot,
        env: {
          ...(nodeProcess?.env ?? {}),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let finished = false;
      const start = Date.now();

      const timer = setTimeout(() => {
        if (finished) {
          return;
        }
        finished = true;
        child.kill();
        resolve({
          exitCode: null,
          stdout: truncate(stdout, MAX_OUTPUT_CHARS),
          stderr: truncate(`${stderr}\nProcess terminated after timeout (${timeoutMs} ms).`, MAX_OUTPUT_CHARS),
          durationMs: Date.now() - start,
          command: this.buildNpmCommand(scriptName, args),
        });
      }, timeoutMs);

      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.once('error', (error) => {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timer);
        reject(error);
      });

      child.once('exit', (code) => {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timer);
        resolve({
          exitCode: code,
          stdout,
          stderr,
          durationMs: Date.now() - start,
          command: this.buildNpmCommand(scriptName, args),
        });
      });
    });
  }

  async start(): Promise<void> {
    await this.ensureAutomationScripts();
    console.error(`📦 Loaded ${this.automationScripts.length} automation scripts.`);
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Automation MCP Server ready.');
  }

  async shutdown(): Promise<void> {
    await this.server.close();
  }
}

const directExecutionArg = nodeProcess?.argv?.[1];
const isDirectExecution =
  typeof directExecutionArg === 'string' && import.meta.url === `file://${directExecutionArg}`;

if (isDirectExecution) {
  const server = new AutomationMCPServer();
  const shutdown = async () => {
    console.error('\n📴 Shutting down Automation MCP Server...');
    await server.shutdown();
    nodeProcess?.exit?.(0);
  };

  nodeProcess?.on?.('SIGINT', shutdown);
  nodeProcess?.on?.('SIGTERM', shutdown);

  server.start().catch((error) => {
    console.error('❌ Failed to start Automation MCP Server:', error);
    nodeProcess?.exit?.(1);
  });
}

export default AutomationMCPServer;
