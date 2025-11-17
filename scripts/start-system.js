#!/usr/bin/env node
/**
 * Start Complete LightDom System
 *
 * Orchestrates all services with health monitoring
 */

import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import SystemCommandInterface, {
  createReadlineConsole,
} from '../services/system-command-interface.js';
import SystemStartupOrchestrator from '../services/system-startup-orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadEnvFile() {
  const candidateFiles = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.development'),
    path.join(projectRoot, '.env.local'),
  ];

  for (const envPath of candidateFiles) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return envPath;
    }
  }

  dotenv.config();
  return null;
}

const loadedEnvPath = loadEnvFile();

const defaultPgPort = process.env.PGPORT || '5433';
process.env.PGPORT = defaultPgPort;

const defaultDatabaseUrl = `postgresql://postgres:postgres@localhost:${defaultPgPort}/dom_space_harvester`;
const defaultPgData = path.join(projectRoot, '.data', 'postgres', 'pgdata');

if (!process.env.PGDATA) {
  process.env.PGDATA = defaultPgData;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
} else {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    if (dbUrl.port !== process.env.PGPORT) {
      dbUrl.port = process.env.PGPORT;
      process.env.DATABASE_URL = dbUrl.toString();
      console.warn(`⚠️  DATABASE_URL port adjusted to match PGPORT (${process.env.PGPORT}).`);
    }
  } catch (error) {
    console.warn('⚠️  Failed to parse DATABASE_URL, using defaults:', error.message);
    process.env.DATABASE_URL = defaultDatabaseUrl;
  }
}

if (process.env.DB_PORT !== process.env.PGPORT) {
  process.env.DB_PORT = process.env.PGPORT;
}
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_DISABLED = process.env.DB_DISABLED === 'true' ? 'true' : 'false';

if (!fs.existsSync(process.env.PGDATA)) {
  fs.mkdirSync(process.env.PGDATA, { recursive: true });
  console.warn(
    `⚠️  PGDATA directory "${process.env.PGDATA}" did not exist and was created. Run initdb if this is a new cluster.`
  );
}

if (!loadedEnvPath) {
  console.log('ℹ️  No explicit .env file found. Using defaults or environment variables.');
} else {
  console.log(`ℹ️  Loaded environment from ${loadedEnvPath}`);
}

console.log(`ℹ️  DATABASE_URL=${process.env.DATABASE_URL}`);
console.log(`ℹ️  PGDATA=${process.env.PGDATA}`);
console.log(`ℹ️  PGPORT=${process.env.PGPORT}`);

async function main() {
  console.log('🚀 LightDom System Startup\n');

  const orchestrator = new SystemStartupOrchestrator({
    autoRestart: process.env.AUTO_RESTART !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    maxRestarts: parseInt(process.env.MAX_RESTARTS) || 3,
    logBufferSize: parseInt(process.env.SERVICE_LOG_BUFFER) || 200,
  });

  const commandInterface = new SystemCommandInterface(orchestrator);
  let readlineInstance = null;
  let commandServer = null;
  const startReadline = () => {
    if (process.env.LIGHTDOM_INTERACTIVE === 'false') {
      return;
    }
    readlineInstance = createReadlineConsole(commandInterface, {
      prompt: process.env.LIGHTDOM_PROMPT || 'lightdom> ',
    });
  };

  const startCommandServer = () => {
    if (process.env.LIGHTDOM_COMMAND_SERVER === 'false') {
      return null;
    }
    const port = Number.parseInt(process.env.LIGHTDOM_COMMAND_PORT || '3333', 10);
    if (Number.isNaN(port) || port <= 0) {
      return null;
    }
    const server = http.createServer(async (req, res) => {
      const origin = 'http://localhost';
      const url = new URL(req.url || '/', origin);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const send = (statusCode, payload) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
      };

      try {
        if (req.method === 'GET' && url.pathname === '/status') {
          const status = orchestrator.getStatus();
          send(200, { ok: true, data: status });
          return;
        }

        if (req.method === 'GET' && url.pathname === '/services') {
          const services = orchestrator.listServices();
          send(200, { ok: true, data: services });
          return;
        }

        if (req.method === 'GET' && url.pathname.startsWith('/logs/')) {
          const serviceId = url.pathname.replace('/logs/', '').trim();
          const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10);
          const logs = orchestrator.getServiceLogs(serviceId, Number.isNaN(limit) ? 20 : limit);
          send(200, { ok: true, data: logs });
          return;
        }

        if (req.method === 'POST' && url.pathname === '/command') {
          const body = await readRequestBody(req);
          const command = body.command || '';
          const result = await commandInterface.execute(command, {
            source: 'http',
            remoteAddress: req.socket.remoteAddress,
          });
          send(result.ok ? 200 : 400, {
            ...result,
            error: result.error ? result.error.message : undefined,
          });
          return;
        }

        send(404, { ok: false, message: 'Not found' });
      } catch (error) {
        send(500, { ok: false, message: error.message });
      }
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`🧭 Command server listening on http://127.0.0.1:${port}`);
    });

    return server;
  };

  const readRequestBody = req =>
    new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        if (!chunks.length) {
          resolve({});
          return;
        }
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    });

  // Listen to events
  orchestrator.on('service:output', ({ serviceId, data }) => {
    console.log(`[${serviceId}] ${data.trim()}`);
  });

  orchestrator.on('service:error', ({ serviceId, data }) => {
    console.error(`[${serviceId}] ERROR: ${data.trim()}`);
  });

  orchestrator.on('service:unhealthy', ({ serviceId, service }) => {
    console.warn(`⚠️  ${service.name} became unhealthy`);
  });

  orchestrator.on('service:recovered', ({ serviceId, service }) => {
    console.log(`✅ ${service.name} recovered`);
  });

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    readlineInstance?.close?.();
    commandServer?.close?.();
    await orchestrator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Shutting down...');
    readlineInstance?.close?.();
    commandServer?.close?.();
    await orchestrator.stop();
    process.exit(0);
  });

  // Start system
  try {
    await orchestrator.start();

    // Keep running
    console.log('\n✅ System running. Press Ctrl+C to stop.\n');
    commandServer = startCommandServer();
    startReadline();
    globalThis.LightDomCommandInterface = commandInterface;
    console.log('🧠 Command interface ready. Type /help for options.');
  } catch (error) {
    console.error('\n❌ System startup failed:', error);
    process.exit(1);
  }
}

// Usage
if (process.argv.includes('--help')) {
  console.log(`
LightDom System Startup

Environment Variables:
  AUTO_RESTART           - Enable auto-restart (default: true)
  HEALTH_CHECK_INTERVAL  - Health check interval in ms (default: 30000)
  MAX_RESTARTS           - Max restart attempts (default: 3)

Examples:
  # Start with defaults
  node scripts/start-system.js
  
  # Disable auto-restart
  AUTO_RESTART=false node scripts/start-system.js
  
  # Custom health check
  HEALTH_CHECK_INTERVAL=60000 node scripts/start-system.js
  `);
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
