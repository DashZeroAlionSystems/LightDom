// Centralized services configuration used by start-all-services and dev service manager
import path from 'path';

const services = [
  {
    id: 'ollama',
    label: 'Ollama Serve',
    command: process.platform === 'win32' ? 'ollama.exe' : 'ollama',
    args: ['serve'],
    cwd: process.cwd(),
    optional: true,
  },
  {
    id: 'error-orchestration',
    label: 'Error Orchestration (DeepSeek)',
    command: 'node',
    args: ['scripts/start-error-orchestration.js'],
    cwd: process.cwd(),
    optional: true,
    dependsOn: ['ollama'], // Requires Ollama for DeepSeek analysis
  },
  {
    id: 'deepseek',
    label: 'DeepSeek Orchestration',
    command: 'node',
    args: ['scripts/start-deepseek-service.js'],
    cwd: process.cwd(),
  },
  {
    id: 'deepseek-mcp',
    label: 'DeepSeek MCP Client',
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['--yes', 'tsx', 'scripts/start-ollama-mcp-client.ts'],
    cwd: process.cwd(),
    optional: true,
    dependsOn: ['ollama', 'deepseek'],
    stdio: 'inherit',
  },
  {
    id: 'ocr',
    label: 'OCR Worker',
    command: 'node',
    args: ['scripts/run-ocr-worker.js'],
    cwd: process.cwd(),
    optional: true,
  },
  {
    id: 'api',
    label: 'API Server',
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'api'],
    cwd: process.cwd(),
  },
  {
    id: 'crawler',
    label: 'Crawler Service',
    command: 'node',
    args: ['scripts/start-crawler-service.js'],
    cwd: process.cwd(),
  },
  {
    id: 'frontend',
    label: 'Frontend (Vite)',
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.join(process.cwd(), 'frontend'),
  },
  {
    id: 'seeder',
    label: 'Seeder Demo',
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'seeding:demo'],
    cwd: process.cwd(),
  },
  {
    id: 'test-loop',
    label: 'Test Loop (dev)',
    command: 'node',
    args: ['scripts/test-loop.js'],
    cwd: process.cwd(),
    optional: true,
  },
];

export default services;
