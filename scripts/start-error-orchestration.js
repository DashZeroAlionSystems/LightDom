#!/usr/bin/env node

/**
 * Error Orchestration Service Startup Script
 *
 * Starts the DeepSeek-powered error analysis and remediation system
 *
 * Features:
 * - Polls for errors needing analysis
 * - Calls DeepSeek/Ollama for diagnosis
 * - Creates tickets/PRs based on confidence
 * - Manages approval workflows
 *
 * @module scripts/start-error-orchestration
 */

const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Load environment
require('dotenv').config();

// Configuration paths
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'error-orchestration.config.json');
const SCHEMA_PATH = path.join(
  __dirname,
  '..',
  'config',
  'schemas',
  'error-orchestration.schema.json'
);

// Validate config exists
if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`[ERROR] Configuration not found: ${CONFIG_PATH}`);
  console.error('Please create error-orchestration.config.json from the template');
  process.exit(1);
}

// Load configuration
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

function getLogFormatter(activeConfig) {
  const template = activeConfig?.logging?.format || '{service}{attribute}{status} - {message}';
  return (level, service, attribute, status, message) => {
    const formatted = template
      .replace('{service}', service)
      .replace('{attribute}', attribute)
      .replace('{status}', status)
      .replace('{message}', message);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  };
}

let runtimeConfig = config;
let logStructured = getLogFormatter(runtimeConfig);

logStructured('info', 'error-orchestrator', 'config', 'loaded', 'Configuration file parsed');

// Validate against schema if available
if (fs.existsSync(SCHEMA_PATH)) {
  try {
    const Ajv = require('ajv');
    const ajv = new Ajv({ allErrors: true });
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
      console.error('[ERROR] Configuration validation failed:');
      console.error(JSON.stringify(validate.errors, null, 2));
      process.exit(1);
    }

    logStructured(
      'info',
      'error-orchestrator',
      'config',
      'validated',
      'Configuration matches schema'
    );
  } catch (err) {
    logStructured(
      'warn',
      'error-orchestrator',
      'config',
      'schema-warning',
      `Schema validation skipped: ${err.message}`
    );
  }
}

const activeEnvironment = process.env.ERROR_ORCHESTRATION_ENV || config.activeEnvironment || 'dev';

function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') {
    return target;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      target[key] = value.slice();
      return;
    }

    if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      mergeDeep(target[key], value);
      return;
    }

    target[key] = value;
  });

  return target;
}

function applyEnvironmentConfig(baseConfig, environmentKey) {
  const cloned = JSON.parse(JSON.stringify(baseConfig));
  const envConfig = cloned.environments?.[environmentKey];
  const environmentName = envConfig?.name || environmentKey;

  if (envConfig?.analysis) {
    mergeDeep(cloned.analysis, envConfig.analysis);
  }

  if (envConfig?.actions) {
    mergeDeep(cloned.actions, envConfig.actions);
  }

  if (envConfig?.git) {
    mergeDeep(cloned.git, envConfig.git);
  }

  if (envConfig?.notifications) {
    mergeDeep(cloned.notifications, envConfig.notifications);
  }

  cloned.runtime = {
    activeEnvironment: environmentKey,
    environmentName,
    severityGate: envConfig?.severityGate || ['error', 'critical'],
    sla: envConfig?.sla || null,
  };

  return cloned;
}

runtimeConfig = applyEnvironmentConfig(config, activeEnvironment);
logStructured = getLogFormatter(runtimeConfig);

logStructured(
  'info',
  'error-orchestrator',
  'config',
  'environment-selected',
  `Active environment: ${runtimeConfig.runtime.environmentName}`
);

async function verifyDependencies(activeConfig) {
  const endpoint = activeConfig?.ollama?.endpoint?.url;
  const healthPath = activeConfig?.dependencies?.ollama?.healthEndpoint || '/api/tags';
  const requiredModels = activeConfig?.dependencies?.ollama?.requiredModels || [
    activeConfig?.ollama?.endpoint?.model,
  ];

  if (!endpoint) {
    throw new Error('Ollama endpoint missing from configuration');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${endpoint}${healthPath}`, { signal: controller.signal });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Ollama health check failed (${response.status}): ${text}`);
    }

    const payload = await response.json().catch(() => ({}));
    const availableModels = Array.isArray(payload.models)
      ? payload.models
          .map(model => {
            if (typeof model === 'string') {
              return model;
            }
            if (model && typeof model === 'object') {
              return model.name || model.model || null;
            }
            return null;
          })
          .filter(Boolean)
      : [];
    const missingModels = requiredModels.filter(model => !availableModels.includes(model));

    if (missingModels.length > 0) {
      throw new Error(
        `Missing required Ollama models: ${missingModels.join(', ')}. Run: ollama pull ${missingModels[0]}`
      );
    }

    if (Array.isArray(activeConfig?.dependencies?.ollama?.ragTools)) {
      try {
        const { AGENT_TOOLS } = require('../api/agent-tools.js');
        const toolNames = AGENT_TOOLS.map(tool => tool.name);
        const missingTools = activeConfig.dependencies.ollama.ragTools.filter(
          tool => !toolNames.includes(tool)
        );
        if (missingTools.length > 0) {
          logStructured(
            'warn',
            'error-orchestrator',
            'dependency',
            'tool-missing',
            `Agent tools not registered: ${missingTools.join(', ')}`
          );
        }
      } catch (toolError) {
        logStructured(
          'warn',
          'error-orchestrator',
          'dependency',
          'tool-check-skipped',
          `Unable to inspect agent tools: ${toolError.message}`
        );
      }
    }

    logStructured(
      'info',
      'error-orchestrator',
      'dependency',
      'ollama-ready',
      `Ollama models verified: ${requiredModels.join(', ')}`
    );
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Initialize database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

logStructured('info', 'error-orchestrator', 'database', 'initializing', 'Connecting to PostgreSQL');

// Test database connection
db.query('SELECT NOW()')
  .then(() =>
    logStructured('info', 'error-orchestrator', 'database', 'ready', 'Database connection verified')
  )
  .catch(err => {
    logStructured('error', 'error-orchestrator', 'database', 'failed', err.message);
    process.exit(1);
  });

// Dynamically import worker (ESM)
async function startWorker() {
  try {
    await verifyDependencies(runtimeConfig);

    // Import TypeScript file using ts-node or compiled output
    let ErrorAnalysisWorker;

    try {
      // Try to load compiled JS
      const compiledPath = path.join(
        __dirname,
        '..',
        'dist',
        'services',
        'error-reporting',
        'ErrorAnalysisWorker.js'
      );
      if (fs.existsSync(compiledPath)) {
        ErrorAnalysisWorker = (await import(compiledPath)).default;
        logStructured(
          'info',
          'error-orchestrator',
          'worker',
          'module-loaded',
          'Loaded compiled worker build'
        );
      } else {
        // Fall back to TypeScript with ts-node
        require('ts-node').register({
          project: path.join(__dirname, '..', 'tsconfig.server.json'),
        });
        ErrorAnalysisWorker = require('../services/error-reporting/ErrorAnalysisWorker.ts').default;
        logStructured(
          'info',
          'error-orchestrator',
          'worker',
          'module-loaded',
          'Loaded TypeScript worker via ts-node'
        );
      }
    } catch (importErr) {
      logStructured('error', 'error-orchestrator', 'worker', 'load-failed', importErr.message);
      console.error('Please ensure TypeScript is compiled or ts-node is installed');
      process.exit(1);
    }

    // Create worker instance
    const worker = new ErrorAnalysisWorker({
      db,
      config: runtimeConfig,
      logger: console,
    });

    // Set up event listeners
    worker.on('worker:started', () => {
      logStructured(
        'info',
        'error-orchestrator',
        'worker',
        'started',
        'Error analysis worker online'
      );
    });

    worker.on('worker:stopped', () => {
      logStructured(
        'info',
        'error-orchestrator',
        'worker',
        'stopped',
        'Error analysis worker offline'
      );
    });

    worker.on('error:analyzed', ({ id, analysis, action }) => {
      logStructured(
        'info',
        'error-orchestrator',
        id,
        action || 'analyzed',
        `Confidence ${analysis.confidence ?? 'n/a'}`
      );
    });

    worker.on('action:created', ({ errorId, actionType }) => {
      logStructured(
        'info',
        'error-orchestrator',
        errorId,
        `action-${actionType}`,
        'Action persisted to database'
      );
    });

    worker.on('ticket:created', ({ errorId, ticketId }) => {
      logStructured('info', 'error-orchestrator', errorId, 'ticket-created', `Ticket ${ticketId}`);
    });

    worker.on('worker:batch:completed', ({ processed }) => {
      logStructured(
        'info',
        'error-orchestrator',
        'worker',
        'batch-complete',
        `${processed} errors processed`
      );
    });

    worker.on('worker:batch:failed', ({ error }) => {
      logStructured('error', 'error-orchestrator', 'worker', 'batch-failed', error.message);
    });

    // Health check endpoint (optional HTTP server)
    if (config.monitoring?.healthCheckPort) {
      const http = require('http');
      const port = config.monitoring.healthCheckPort;

      const server = http.createServer(async (req, res) => {
        if (req.url === '/health') {
          try {
            const health = await worker.healthCheck();
            res.writeHead(health.status === 'healthy' ? 200 : 503, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify(health, null, 2));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: err.message }));
          }
        } else if (req.url === '/metrics') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('# Metrics endpoint not yet implemented');
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      });

      server.listen(port, () => {
        logStructured('info', 'error-orchestrator', 'health-server', 'listening', `Port ${port}`);
      });
    }

    // Start worker
    await worker.start();

    // Graceful shutdown
    const shutdown = async signal => {
      logStructured(
        'info',
        'error-orchestrator',
        'worker',
        'shutdown',
        `Received signal ${signal}`
      );

      await worker.stop();
      await db.end();

      logStructured('info', 'error-orchestrator', 'worker', 'terminated', 'Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    logStructured(
      'info',
      'error-orchestrator',
      'worker',
      'running',
      'Error orchestration service online'
    );
    logStructured(
      'info',
      'error-orchestrator',
      'worker',
      'schedule',
      `Interval ${runtimeConfig.analysis?.scheduling?.intervalMs || 60000}ms, batch ${runtimeConfig.analysis?.scheduling?.batchSize || 10}`
    );
    logStructured(
      'info',
      'error-orchestrator',
      'worker',
      'thresholds',
      `Min confidence ${runtimeConfig.analysis?.thresholds?.minConfidence || 0.7}, auto-fix ${runtimeConfig.analysis?.thresholds?.autoFixConfidence || 0.9}`
    );
  } catch (error) {
    logStructured(
      'error',
      'error-orchestrator',
      'worker',
      'startup-failed',
      error.message || 'Unknown error'
    );
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Start the service
startWorker();
