import type { Method } from 'axios';

export type HttpMethod = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch'>;

export interface ServiceEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  description?: string;
  tags?: string[];
  linkedWorkflows?: string[];
}

export interface ServiceDefinition {
  id: string;
  name: string;
  summary: string;
  category: 'operations' | 'automation' | 'data' | 'ai';
  owner?: string;
  docsUrl?: string;
  endpoints: ServiceEndpoint[];
}

export const SERVICE_TAXONOMY: ServiceDefinition[] = [
  {
    id: 'crawler-service',
    name: 'Crawler Service',
    summary: 'Manages discovery and crawling of target domains for SEO analysis.',
    category: 'operations',
    owner: 'Automation Guild',
    docsUrl: 'https://docs.lightdom.dev/services/crawler',
    endpoints: [
      {
        id: 'start-crawl',
        name: 'Start Crawl Job',
        method: 'post',
        path: '/api/crawler/start',
        description: 'Kick off a crawl session using the configured scheduler profile.',
        tags: ['scheduler', 'async'],
        linkedWorkflows: ['crawler-bootstrap', 'dashboard-refresh'],
      },
      {
        id: 'stop-crawl',
        name: 'Stop Crawl Job',
        method: 'post',
        path: '/api/crawler/stop',
        description: 'Gracefully stop all running crawler workers and persist checkpoints.',
        tags: ['scheduler'],
      },
      {
        id: 'crawl-status',
        name: 'Crawl Status',
        method: 'get',
        path: '/api/crawler/status',
        description: 'Retrieve current job metrics including discovered URLs and processing lag.',
        tags: ['metrics', 'dashboard'],
      },
    ],
  },
  {
    id: 'deepseek-orchestrator',
    name: 'DeepSeek Orchestrator',
    summary: 'AI driven automation engine that generates workflows, schemas, and prompt responses.',
    category: 'ai',
    owner: 'DeepSeek Ops',
    docsUrl: 'https://docs.lightdom.dev/services/deepseek',
    endpoints: [
      {
        id: 'chat',
        name: 'Chat Completions',
        method: 'post',
        path: '/api/deepseek/chat',
        description: 'Exchange a conversation payload and receive assistant authored responses.',
        tags: ['ai', 'prompts'],
        linkedWorkflows: ['prompt-conversation'],
      },
      {
        id: 'generate-workflow',
        name: 'Generate Workflow',
        method: 'post',
        path: '/api/deepseek/workflows/generate',
        description: 'Create workflow scaffolding, schemas, and action plans from a prompt.',
        tags: ['automation', 'crud'],
        linkedWorkflows: ['workflow-inventory'],
      },
      {
        id: 'tooling-list',
        name: 'List MCP Tools',
        method: 'get',
        path: '/api/deepseek/tools',
        description: 'Enumerate MCP tooling that can be executed by the orchestrator.',
        tags: ['mcp', 'observability'],
      },
    ],
  },
  {
    id: 'service-orchestrator',
    name: 'Service Orchestrator',
    summary: 'Supervises LightDom micro-services, applies health checks and restart policy.',
    category: 'automation',
    owner: 'Platform Ops',
    docsUrl: 'https://docs.lightdom.dev/services/orchestrator',
    endpoints: [
      {
        id: 'bundles-list',
        name: 'List Bundles',
        method: 'get',
        path: '/api/orchestrator/bundles',
        description: 'Return all registered service bundles with summary health metadata.',
        tags: ['observability'],
      },
      {
        id: 'bundle-start',
        name: 'Start Bundle',
        method: 'post',
        path: '/api/orchestrator/bundles/:bundleId/start',
        description: 'Start every service in a bundle and stream startup events.',
        tags: ['control'],
      },
      {
        id: 'bundle-stop',
        name: 'Stop Bundle',
        method: 'post',
        path: '/api/orchestrator/bundles/:bundleId/stop',
        description: 'Gracefully stop an entire service bundle.',
        tags: ['control'],
      },
    ],
  },
];
