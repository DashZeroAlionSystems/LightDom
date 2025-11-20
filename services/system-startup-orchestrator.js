/**
 * System Startup Orchestrator
 *
 * Comprehensive system that:
 * - Starts all services in correct order
 * - Monitors service health
 * - Restarts failed services
 * - Provides dashboard
 * - Manages process flows
 *
 * Services managed:
 * - Database
 * - API Server
 * - Codebase Indexer
 * - TensorFlow Model
 * - Autonomous Agent
 * - Data Mining
 * - Frontend
 */

import axios from 'axios';
import { spawn, spawnSync } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

export class SystemStartupOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      autoRestart: config.autoRestart !== false,
      healthCheckInterval: config.healthCheckInterval || 30000,
      maxRestarts: config.maxRestarts || 3,
      startupTimeout: config.startupTimeout || 60000,
      ...config,
    };

    this.services = new Map();
    this.isRunning = false;
    this.healthCheckTimer = null;
    this.projectRoot = process.cwd();
    this.moduleAvailability = new Map();
    this.config.logBufferSize = this.config.logBufferSize || 200;
    this.config.logFlushInterval = this.config.logFlushInterval || 5000;
    this.config.logFlushBatchSize = this.config.logFlushBatchSize || 100;
    this.config.logQueueLimit = this.config.logQueueLimit || 2000;
    this.config.logMessageMaxLength = this.config.logMessageMaxLength || 2000;
    this.databaseEnsured = false;
    this.coreTablesEnsured = false;
    this.logQueue = [];
    this.logFlushTimer = null;
    this.logFlushInProgress = false;
    this.logFlushInterval = this.config.logFlushInterval;
    this.logFlushBatchSize = this.config.logFlushBatchSize;
    this.logQueueLimit = this.config.logQueueLimit;
    this.logMessageMaxLength = this.config.logMessageMaxLength;
    this.logPool = null;
    this.logPoolReady = false;
    this.logPoolInitPromise = null;
    this.ollamaModelEnsured = false;
    this.ensuringOllamaModel = null;

    this.defineServices();
  }

  hasModule(moduleName) {
    if (this.moduleAvailability.has(moduleName)) {
      return this.moduleAvailability.get(moduleName);
    }
    try {
      require.resolve(moduleName);
      this.moduleAvailability.set(moduleName, true);
      return true;
    } catch (error) {
      this.moduleAvailability.set(moduleName, false);
      return false;
    }
  }

  fileExists(relativePath) {
    return fs.existsSync(path.resolve(this.projectRoot, relativePath));
  }

  commandExists(command) {
    try {
      const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
      return result.status === 0 || result.status === null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Define all system services
   */
  defineServices() {
    const pgPort = process.env.PGPORT || '5432';
    const ensureDatabaseExists = this.ensureDatabaseExists.bind(this);
    const ollamaEndpoint = (
      process.env.OLLAMA_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://localhost:11434'
    ).replace(/\/$/, '');

    const serviceFlag = (envKey, defaultValue) => {
      const raw = process.env[envKey];
      if (raw === 'true') return true;
      if (raw === 'false') return false;
      return defaultValue;
    };

    // Database
    this.services.set('database', {
      name: 'PostgreSQL Database',
      command: 'postgres',
      args: ['-D', process.env.PGDATA || '/var/lib/postgresql/data', '-p', pgPort],
      healthCheck: async () => {
        try {
          await ensureDatabaseExists();
          const { Pool } = await import('pg');
          const pool = new Pool({ connectionString: process.env.DATABASE_URL });
          await pool.query('SELECT 1');
          await pool.end();
          return true;
        } catch (error) {
          return false;
        }
      },
      priority: 1,
      critical: true,
      enabled: true,
    });

    const ollamaCommand = process.env.OLLAMA_COMMAND || 'ollama';
    const ollamaAvailable = this.commandExists(ollamaCommand);
    const ollamaEnabled = serviceFlag('ENABLE_OLLAMA', ollamaAvailable);
    const ollamaModel =
      process.env.DEEPSEEK_MODEL || process.env.OLLAMA_MODEL || 'deepseek-r1:latest';
    this.services.set('ollama', {
      name: 'Ollama DeepSeek Service',
      command: ollamaCommand,
      args: ['serve'],
      healthCheck: async () => {
        try {
          const response = await axios.get(`${ollamaEndpoint}/api/tags`, { timeout: 3000 });
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 2,
      critical: false,
      enabled: ollamaEnabled,
      skipSpawnIfHealthy: true,
      preventSpawnIfUnavailable: true,
      metadata: {
        endpoint: ollamaEndpoint,
        model: ollamaModel,
        available: ollamaAvailable,
      },
      disableReason: ollamaAvailable ? null : `${ollamaCommand} CLI not available in PATH`,
    });

    // API Server
    this.services.set('api', {
      name: 'API Server',
      command: 'node',
      args: ['api-server-express.js'],
      healthCheck: async () => {
        try {
          const response = await axios.get('http://localhost:3001/health');
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 3,
      critical: true,
      dependsOn: ['database', 'ollama'],
      enabled: true,
    });

    // Frontend
    this.services.set('frontend', {
      name: 'Frontend Dev Server',
      command: 'npm',
      args: ['run', 'dev'],
      healthCheck: async () => {
        try {
          const response = await axios.get('http://localhost:3000');
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 4,
      critical: false,
      dependsOn: ['api'],
      enabled: serviceFlag('ENABLE_FRONTEND', true),
    });

    // Codebase Indexer
    const treeSitterAvailable = this.hasModule('tree-sitter');
    const indexerEnabled = serviceFlag('ENABLE_CODEBASE_INDEXER', treeSitterAvailable);
    this.services.set('indexer', {
      name: 'Codebase Indexer',
      command: 'node',
      args: ['examples/codebase-indexing-example.js'],
      healthCheck: async () => true, // One-time job
      priority: 5,
      critical: false,
      dependsOn: ['database'],
      oneTime: true,
      enabled: indexerEnabled,
      disableReason: treeSitterAvailable
        ? null
        : 'tree-sitter module not installed; run npm install tree-sitter to enable',
    });

    // TensorFlow Model Training
    const tensorflowScriptExists = this.fileExists('scripts/train-tensorflow-model.js');
    const tensorflowEnabled = serviceFlag('ENABLE_TENSORFLOW_MODEL', tensorflowScriptExists);
    this.services.set('tensorflow', {
      name: 'TensorFlow Model',
      command: 'node',
      args: ['scripts/train-tensorflow-model.js'],
      healthCheck: async () => true,
      priority: 6,
      critical: false,
      dependsOn: ['database', 'indexer'],
      oneTime: true,
      enabled: tensorflowEnabled,
      disableReason: tensorflowScriptExists ? null : 'scripts/train-tensorflow-model.js missing',
    });

    // Autonomous Agent
    const agentScriptExists = this.fileExists('examples/autonomous-agent-example.js');
    const agentEnabled = serviceFlag(
      'ENABLE_AUTONOMOUS_AGENT',
      treeSitterAvailable && agentScriptExists
    );
    this.services.set('agent', {
      name: 'Autonomous Agent',
      command: 'node',
      args: ['examples/autonomous-agent-example.js'],
      healthCheck: async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/agents/status');
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 7,
      critical: false,
      dependsOn: ['api', 'tensorflow'],
      enabled: agentEnabled,
      disableReason: !agentScriptExists
        ? 'examples/autonomous-agent-example.js missing'
        : treeSitterAvailable
          ? null
          : 'tree-sitter module not installed; run npm install tree-sitter to enable',
    });
  }

  /**
   * Start all services
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  System already running');
      return;
    }

    console.log('🚀 Starting LightDom System...\n');
    this.isRunning = true;

    try {
      // Sort services by priority
      const sortedServices = Array.from(this.services.entries()).sort(
        (a, b) => a[1].priority - b[1].priority
      );

      // Start services in order
      for (const [serviceId, service] of sortedServices) {
        if (service.enabled === false) {
          const reason = service.disableReason ? ` (${service.disableReason})` : '';
          console.log(`⏭️  Skipping ${service.name}${reason}`);
          continue;
        }
        await this.startService(serviceId, service);
      }

      // Start health monitoring
      this.startHealthMonitoring();

      console.log('\n✅ System startup complete!');
      console.log('\n📊 Service Status:');
      await this.printStatus();

      this.emit('system:started');
    } catch (error) {
      console.error('\n❌ System startup failed:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Start individual service
   */
  async startService(serviceId, service) {
    if (service.enabled === false) {
      const reason = service.disableReason ? ` (${service.disableReason})` : '';
      console.log(`⏭️  ${service.name} disabled${reason}`);
      return;
    }

    console.log(`🔧 Starting ${service.name}...`);

    // Check dependencies
    if (service.dependsOn) {
      for (const depId of service.dependsOn) {
        const dep = this.services.get(depId);
        if (!dep || dep.enabled === false) {
          continue;
        }
        if (!dep.process && !dep.healthy) {
          throw new Error(`Dependency ${dep.name} not running`);
        }
      }
    }

    if (service.skipSpawnIfHealthy) {
      try {
        const alreadyHealthy = await service.healthCheck();
        if (alreadyHealthy) {
          service.healthy = true;
          service.external = true;
          service.startedAt = service.startedAt || Date.now();
          if (service.metadata) {
            service.metadata = { ...service.metadata, attached: true };
          } else {
            service.metadata = { attached: true };
          }
          console.log(`♻️  ${service.name} already running; attaching to external instance`);
          if (serviceId === 'ollama') {
            await this.ensureDeepSeekModel(service.metadata);
          }
          return;
        }
      } catch (error) {
        // proceed to spawn
      }
    }

    // Start process
    if (service.commandPathCheck && !this.fileExists(service.commandPathCheck)) {
      throw new Error(`${service.commandPathCheck} missing`);
    }

    if (
      service.preventSpawnIfUnavailable &&
      service.metadata &&
      service.metadata.available === false
    ) {
      console.warn(
        `⚠️  ${service.name} cannot be spawned because '${service.command}' is not available. Install Ollama or provide an external instance.`
      );
      return;
    }

    const spawnOptions = {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      env: { ...process.env },
      ...(service.spawnOptions || {}),
    };

    const childProcess = spawn(service.command, service.args, spawnOptions);

    service.process = childProcess;
    service.restarts = 0;
    service.startedAt = Date.now();
    service.stopping = false;
    service.logBuffer = service.logBuffer || [];
    service.external = false;
    if (service.metadata) {
      service.metadata = { ...service.metadata, attached: false };
    }

    // Handle output
    childProcess.stdout.on('data', data => {
      const text = data.toString();
      this.recordServiceLog(serviceId, service, 'stdout', text);
      this.emit('service:output', { serviceId, data: text });
    });

    childProcess.stderr.on('data', data => {
      const text = data.toString();
      this.recordServiceLog(serviceId, service, 'stderr', text);
      this.emit('service:error', { serviceId, data: text });
    });

    childProcess.on('error', error => {
      const message = error?.message || String(error);
      this.recordServiceLog(serviceId, service, 'stderr', message);
      console.error(`❌ Failed to start ${service.name}:`, message);
      service.process = null;
      service.healthy = false;
      service.external = false;
      service.startedAt = null;
      if (service.metadata) {
        service.metadata = { ...service.metadata, attached: false };
      }
    });

    // Handle exit
    childProcess.on('exit', code => {
      this.handleServiceExit(serviceId, service, code);
    });

    // Wait for service to be healthy
    if (!service.oneTime) {
      const healthy = await this.waitForHealthy(serviceId, service);

      if (healthy) {
        console.log(`✅ ${service.name} started`);
        service.healthy = true;
        if (serviceId === 'ollama') {
          await this.ensureDeepSeekModel(service.metadata);
        }
      } else {
        console.log(`⚠️  ${service.name} started but health check failed`);
      }
    } else {
      console.log(`✅ ${service.name} started (one-time job)`);
    }
  }

  /**
   * Wait for service to become healthy
   */
  async waitForHealthy(serviceId, service, timeout = this.config.startupTimeout) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const healthy = await service.healthCheck();
        if (healthy) {
          return true;
        }
      } catch (error) {
        // Ignore errors during startup
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  /**
   * Handle service exit
   */
  async handleServiceExit(serviceId, service, code) {
    const wasStopping = service.stopping;
    service.stopping = false;
    service.process = null;
    service.healthy = false;
    service.external = false;
    if (service.metadata) {
      service.metadata = { ...service.metadata, attached: false };
    }

    if (service.oneTime) {
      if (code === 0) {
        console.log(`✅ ${service.name} completed`);
      } else {
        console.log(`⚠️  ${service.name} exited with code ${code}`);
      }
      return;
    }

    console.log(`⚠️  ${service.name} exited with code ${code}`);

    if (!this.isRunning || wasStopping || service.enabled === false) {
      return;
    }

    if (this.config.autoRestart && service.restarts < this.config.maxRestarts) {
      console.log(`🔄 Restarting ${service.name}...`);
      service.restarts++;

      setTimeout(async () => {
        await this.startService(serviceId, service);
      }, 5000);
    } else {
      console.log(`❌ ${service.name} failed to restart`);

      if (service.critical) {
        console.log('⚠️  Critical service failed, stopping system');
        await this.stop();
      }
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckTimer = setInterval(async () => {
      await this.checkAllHealth();
    }, this.config.healthCheckInterval);

    console.log(`💓 Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
  }

  /**
   * Check health of all services
   */
  async checkAllHealth() {
    for (const [serviceId, service] of this.services) {
      if (service.oneTime || (!service.process && !service.external)) continue;

      try {
        const healthy = await service.healthCheck();

        if (!healthy && service.healthy) {
          console.log(`⚠️  ${service.name} health check failed`);
          service.healthy = false;

          this.emit('service:unhealthy', { serviceId, service });
        } else if (healthy && !service.healthy) {
          console.log(`✅ ${service.name} recovered`);
          service.healthy = true;

          this.emit('service:recovered', { serviceId, service });
        }
      } catch (error) {
        console.error(`Health check error for ${service.name}:`, error.message);
      }
    }
  }

  /**
   * Stop all services
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('\n🛑 Stopping system...');
    this.isRunning = false;

    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    if (this.logFlushTimer) {
      clearTimeout(this.logFlushTimer);
      this.logFlushTimer = null;
    }

    await this.flushLogQueue({ force: true }).catch(() => {});

    // Stop services in reverse priority
    const sortedServices = Array.from(this.services.entries()).sort(
      (a, b) => b[1].priority - a[1].priority
    );

    for (const [serviceId, service] of sortedServices) {
      if (serviceId === 'database') {
        await this.flushLogQueue({ force: true }).catch(() => {});
      }
      if (service.process) {
        console.log(`Stopping ${service.name}...`);
        const child = service.process;
        service.stopping = true;
        child.kill('SIGTERM');

        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force kill if still running
        if (!child.killed) {
          child.kill('SIGKILL');
        }

        service.process = null;
        service.healthy = false;
        service.stopping = false;
      }
    }

    console.log('✅ System stopped');
    if (this.logPool) {
      await this.logPool.end().catch(() => {});
      this.logPool = null;
      this.logPoolReady = false;
      this.logPoolInitPromise = null;
    }
    this.emit('system:stopped');
  }

  /**
   * Get system status
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      services: {},
    };

    for (const [serviceId, service] of this.services) {
      status.services[serviceId] = {
        name: service.name,
        healthy: service.healthy || false,
        running: !!service.process || !!service.external,
        restarts: service.restarts || 0,
        uptime: service.startedAt ? Date.now() - service.startedAt : 0,
        enabled: service.enabled !== false,
        disableReason: service.disableReason || null,
        external: !!service.external,
        metadata: service.metadata || null,
      };
    }

    return status;
  }

  /**
   * Print status to console
   */
  async printStatus() {
    const status = this.getStatus();

    for (const [serviceId, serviceStatus] of Object.entries(status.services)) {
      const icon = serviceStatus.healthy ? '✅' : serviceStatus.running ? '⚠️' : '❌';
      const uptime = serviceStatus.uptime ? `${(serviceStatus.uptime / 1000).toFixed(0)}s` : 'N/A';

      const enabledNote = serviceStatus.enabled ? '' : ' [disabled]';
      console.log(
        `${icon} ${serviceStatus.name}: ${serviceStatus.running ? 'Running' : 'Stopped'}${enabledNote} (uptime: ${uptime})`
      );
    }
  }

  /**
   * Restart specific service
   */
  async restartService(serviceId) {
    const service = this.services.get(serviceId);

    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    if (service.external && !service.process) {
      console.log(`♻️  ${service.name} is managed externally; skipping restart`);
      return;
    }

    console.log(`🔄 Restarting ${service.name}...`);

    // Stop service
    if (service.process) {
      service.stopping = true;
      service.process.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Start service
    await this.startService(serviceId, service);
  }

  /**
   * Stop specific service
   */
  async stopService(serviceId, { force = false } = {}) {
    const service = this.services.get(serviceId);

    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    if (!service.process) {
      if (service.external) {
        console.log(`♻️  ${service.name} is attached to an external instance; skipping stop`);
      }
      return false;
    }

    const child = service.process;
    service.stopping = true;
    child.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!child.killed && force) {
      child.kill('SIGKILL');
    }

    service.process = null;
    service.healthy = false;
    service.stopping = false;
    return true;
  }

  /**
   * Start service if not running
   */
  async startServiceById(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }
    if (service.enabled === false) {
      throw new Error(`${service.name} disabled`);
    }
    if (service.process) {
      return false;
    }
    await this.startService(serviceId, service);
    return true;
  }

  /**
   * Toggle service availability
   */
  setServiceEnabled(serviceId, enabled, reason = null) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }
    service.enabled = !!enabled;
    service.disableReason = enabled ? null : reason;
  }

  /**
   * Read recent logs for a service
   */
  getServiceLogs(serviceId, limit = 20) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }
    const entries = service.logBuffer || [];
    return entries.slice(-limit).map(entry => ({
      ...entry,
      timestamp: entry.timestamp,
    }));
  }

  listServices() {
    const result = [];
    for (const [serviceId, service] of this.services) {
      result.push({
        id: serviceId,
        name: service.name,
        enabled: service.enabled !== false,
        running: !!service.process || !!service.external,
        healthy: service.healthy || false,
        priority: service.priority,
        critical: !!service.critical,
        disableReason: service.disableReason || null,
        external: !!service.external,
        metadata: service.metadata || null,
      });
    }
    return result;
  }

  recordServiceLog(serviceId, service, stream, text) {
    if (!service.logBuffer) {
      service.logBuffer = [];
    }
    const lines = text.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const timestamp = Date.now();
      service.logBuffer.push({
        timestamp: Date.now(),
        stream,
        line,
      });
      this.enqueueServiceLog(serviceId, service, stream, line, timestamp);
    }
    if (service.logBuffer.length > this.config.logBufferSize) {
      service.logBuffer.splice(0, service.logBuffer.length - this.config.logBufferSize);
    }
  }

  enqueueServiceLog(serviceId, service, stream, line, timestamp) {
    if (!process.env.DATABASE_URL) {
      return;
    }

    if (!this.logQueue) {
      this.logQueue = [];
    }

    const trimmedLine =
      line.length > this.logMessageMaxLength
        ? `${line.slice(0, this.logMessageMaxLength - 3)}...`
        : line;

    const metadata = {
      sourceTimestamp: new Date(timestamp).toISOString(),
      truncated: trimmedLine.length !== line.length,
    };

    if (service?.process?.pid) {
      metadata.pid = service.process.pid;
    }

    this.logQueue.push({
      serviceId,
      serviceName: service?.name || serviceId,
      stream,
      message: trimmedLine,
      metadata,
    });

    if (this.logQueue.length > this.logQueueLimit) {
      this.logQueue.splice(0, this.logQueue.length - this.logQueueLimit);
    }

    this.scheduleLogFlush();
  }

  scheduleLogFlush() {
    if (this.logFlushTimer || this.logFlushInProgress) {
      return;
    }
    this.logFlushTimer = setTimeout(() => {
      this.logFlushTimer = null;
      this.flushLogQueue().catch(error => {
        console.error('Failed to flush service logs:', error.message);
      });
    }, this.logFlushInterval);
  }

  async flushLogQueue({ force = false } = {}) {
    if (!this.logQueue || this.logQueue.length === 0) {
      return;
    }

    if (this.logFlushInProgress) {
      return;
    }

    if (!this.coreTablesEnsured) {
      this.scheduleLogFlush();
      return;
    }

    let pool;
    try {
      pool = await this.getLogPool();
    } catch (error) {
      this.scheduleLogFlush();
      return;
    }

    if (!pool) {
      this.scheduleLogFlush();
      return;
    }

    this.logFlushInProgress = true;
    let entries = [];

    try {
      const batchSize = force
        ? this.logQueue.length
        : Math.min(this.logFlushBatchSize, this.logQueue.length);
      entries = this.logQueue.splice(0, batchSize);

      if (!entries.length) {
        return;
      }

      const values = [];
      const placeholders = entries.map((entry, index) => {
        const offset = index * 5;
        values.push(
          entry.serviceId,
          entry.serviceName,
          entry.stream,
          entry.message,
          JSON.stringify(entry.metadata || {})
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });

      const query = `
        INSERT INTO system_service_logs (service_id, service_name, stream, message, metadata)
        VALUES ${placeholders.join(', ')}
      `;

      await pool.query(query, values);
    } catch (error) {
      if (entries.length) {
        this.logQueue = entries.concat(this.logQueue);
        if (this.logQueue.length > this.logQueueLimit) {
          this.logQueue.splice(0, this.logQueue.length - this.logQueueLimit);
        }
      }
      console.error('Failed to persist system service logs:', error.message);
    } finally {
      this.logFlushInProgress = false;

      if (this.logQueue.length > 0 && !this.logFlushTimer) {
        this.scheduleLogFlush();
      }
    }

    if (force && this.logQueue.length > 0) {
      await this.flushLogQueue({ force: true });
    }
  }

  async getLogPool() {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    if (this.logPoolReady && this.logPool) {
      return this.logPool;
    }

    if (this.logPoolInitPromise) {
      return this.logPoolInitPromise;
    }

    const init = (async () => {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
      await pool.query('SELECT 1');
      this.logPool = pool;
      this.logPoolReady = true;
      return pool;
    })().catch(error => {
      this.logPoolInitPromise = null;
      this.logPoolReady = false;
      throw error;
    });

    this.logPoolInitPromise = init;
    return init;
  }

  async ensureDatabaseExists() {
    if (this.databaseEnsured) {
      return true;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return true;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(databaseUrl);
    } catch (error) {
      throw error;
    }

    const targetDatabase = parsedUrl.pathname.replace(/^\//, '') || 'postgres';

    const { Pool } = await import('pg');

    const attemptQuery = async (connectionString, query) => {
      const pool = new Pool({ connectionString });
      try {
        await pool.query(query || 'SELECT 1');
      } finally {
        await pool.end().catch(() => {});
      }
    };

    try {
      await attemptQuery(databaseUrl);
      await this.ensureCoreTables(databaseUrl);
      this.databaseEnsured = true;
      return true;
    } catch (error) {
      if (error.code !== '3D000') {
        throw error;
      }
    }

    const adminUrl = new URL(databaseUrl);
    adminUrl.pathname = '/postgres';

    try {
      await attemptQuery(adminUrl.toString(), `CREATE DATABASE "${targetDatabase}"`);
      await attemptQuery(databaseUrl);
      await this.ensureCoreTables(databaseUrl);
      this.databaseEnsured = true;
      console.log(`✅ Created database ${targetDatabase}`);
      return true;
    } catch (error) {
      if (error.code === '42P04') {
        await this.ensureCoreTables(databaseUrl);
        this.databaseEnsured = true;
        return true;
      }
      throw error;
    }
  }

  async ensureCoreTables(connectionString) {
    if (this.coreTablesEnsured) {
      return;
    }

    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString });

    const fallbackAttributes = [
      {
        name: 'title',
        meta: {
          category: 'meta',
          selector: 'title',
          type: 'string',
          mlWeight: 0.1,
        },
      },
      {
        name: 'metaDescription',
        meta: {
          category: 'meta',
          selector: 'meta[name="description"]',
          type: 'string',
          mlWeight: 0.08,
        },
      },
      {
        name: 'metaKeywords',
        meta: {
          category: 'meta',
          selector: 'meta[name="keywords"]',
          type: 'string',
          mlWeight: 0.05,
        },
      },
      {
        name: 'canonical',
        meta: {
          category: 'technical',
          selector: 'link[rel="canonical"]',
          type: 'url',
          mlWeight: 0.05,
        },
      },
      {
        name: 'canonicalUrl',
        meta: {
          category: 'technical',
          selector: 'link[rel="canonical"]',
          type: 'url',
          mlWeight: 0.05,
        },
      },
      {
        name: 'h1Text',
        meta: {
          category: 'content',
          selector: 'h1',
          type: 'string',
          mlWeight: 0.06,
        },
      },
      {
        name: 'h2Text',
        meta: {
          category: 'content',
          selector: 'h2',
          type: 'string',
          mlWeight: 0.04,
        },
      },
      {
        name: 'wordCount',
        meta: {
          category: 'content',
          selector: 'body',
          type: 'number',
          mlWeight: 0.05,
        },
      },
      {
        name: 'isSecure',
        meta: {
          category: 'technical',
          selector: null,
          type: 'boolean',
          mlWeight: 0.04,
        },
      },
      {
        name: 'robots',
        meta: {
          category: 'technical',
          selector: 'meta[name="robots"]',
          type: 'string',
          mlWeight: 0.03,
        },
      },
      {
        name: 'pageLoadTime',
        meta: {
          category: 'performance',
          selector: null,
          type: 'number',
          mlWeight: 0.04,
        },
      },
      {
        name: 'firstContentfulPaint',
        meta: {
          category: 'performance',
          selector: null,
          type: 'number',
          mlWeight: 0.04,
        },
      },
    ];

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS attribute_configurations (
          id SERIAL PRIMARY KEY,
          attribute_name TEXT UNIQUE NOT NULL,
          config JSONB NOT NULL,
          version INTEGER DEFAULT 1,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_attribute_configurations_name ON attribute_configurations(attribute_name)'
      );
      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_attribute_configurations_active ON attribute_configurations(active)'
      );

      await pool.query(`
        CREATE TABLE IF NOT EXISTS seo_attributes_config (
          id SERIAL PRIMARY KEY,
          attribute_name TEXT UNIQUE NOT NULL,
          category TEXT DEFAULT 'general',
          description TEXT,
          data_type TEXT DEFAULT 'string',
          is_active BOOLEAN DEFAULT true,
          priority INTEGER DEFAULT 0,
          scoring_rules JSONB DEFAULT '{}'::jsonb,
          default_value JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_seo_attributes_active ON seo_attributes_config(is_active)'
      );
      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_seo_attributes_category ON seo_attributes_config(category)'
      );

      await pool.query(`
        CREATE TABLE IF NOT EXISTS system_service_logs (
          id BIGSERIAL PRIMARY KEY,
          service_id TEXT NOT NULL,
          service_name TEXT NOT NULL,
          stream TEXT NOT NULL,
          message TEXT NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_system_service_logs_service ON system_service_logs(service_id)'
      );

      await pool.query(
        'CREATE INDEX IF NOT EXISTS idx_system_service_logs_created ON system_service_logs(created_at DESC)'
      );

      const attributeConfigCount = await pool.query(
        'SELECT COUNT(*)::int AS count FROM attribute_configurations WHERE active = true'
      );
      const needsAttributeSeed = Number(attributeConfigCount.rows?.[0]?.count || 0) === 0;

      if (needsAttributeSeed) {
        for (const attr of fallbackAttributes) {
          await pool.query(
            `INSERT INTO attribute_configurations (attribute_name, config, version, active)
             VALUES ($1, $2, 1, true)
             ON CONFLICT (attribute_name) DO UPDATE SET config = EXCLUDED.config, active = true`,
            [attr.name, JSON.stringify(attr.meta)]
          );
        }
      }

      const seoConfigCount = await pool.query(
        'SELECT COUNT(*)::int AS count FROM seo_attributes_config WHERE is_active = true'
      );
      const needsSeoSeed = Number(seoConfigCount.rows?.[0]?.count || 0) === 0;

      if (needsSeoSeed) {
        for (const attr of fallbackAttributes) {
          await pool.query(
            `INSERT INTO seo_attributes_config (attribute_name, category, description, data_type, priority, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             ON CONFLICT (attribute_name) DO UPDATE SET is_active = true`,
            [
              attr.name,
              attr.meta.category,
              `Autogenerated fallback attribute for ${attr.name}`,
              attr.meta.type,
              Math.round((attr.meta.mlWeight || 0) * 1000),
            ]
          );
        }
      }
    } finally {
      await pool.end().catch(() => {});
    }

    this.coreTablesEnsured = true;
    this.scheduleLogFlush();
  }

  async ensureDeepSeekModel(metadata = {}) {
    if (this.ollamaModelEnsured) {
      return;
    }

    if (this.ensuringOllamaModel) {
      await this.ensuringOllamaModel;
      return;
    }

    const endpointRaw =
      metadata.endpoint ||
      process.env.OLLAMA_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://localhost:11434';
    const endpoint = endpointRaw.replace(/\/$/, '');
    const modelName =
      metadata.model ||
      process.env.DEEPSEEK_MODEL ||
      process.env.OLLAMA_MODEL ||
      'deepseek-r1:latest';

    const ensurePromise = (async () => {
      try {
        const tagsResponse = await fetch(`${endpoint}/api/tags`, { method: 'GET' });
        if (tagsResponse.ok) {
          const payload = await tagsResponse.json();
          const models = Array.isArray(payload.models) ? payload.models : [];
          const hasModel = models.some(model => model.name === modelName);
          if (hasModel) {
            this.ollamaModelEnsured = true;
            console.log(`✅ DeepSeek model '${modelName}' already available`);
            return;
          }
        }

        console.log(`⬇️  Pulling DeepSeek model '${modelName}' from Ollama...`);
        const pullResponse = await fetch(`${endpoint}/api/pull`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: modelName }),
        });

        if (!pullResponse.ok || !pullResponse.body) {
          throw new Error(`Pull request failed with status ${pullResponse.status}`);
        }

        const reader = pullResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffered = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffered += decoder.decode(value, { stream: true });
          const parts = buffered.split('\n');
          buffered = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;
            try {
              const event = JSON.parse(part);
              if (event.status) {
                console.log(`   [ollama] ${event.status}`);
              }
            } catch (error) {
              console.log(`   [ollama] ${part.trim()}`);
            }
          }
        }

        if (buffered.trim()) {
          try {
            const event = JSON.parse(buffered.trim());
            if (event.status) {
              console.log(`   [ollama] ${event.status}`);
            }
          } catch (error) {
            console.log(`   [ollama] ${buffered.trim()}`);
          }
        }

        this.ollamaModelEnsured = true;
        console.log(`✅ DeepSeek model '${modelName}' ready for RAG`);
      } catch (error) {
        console.warn('⚠️  Failed to ensure DeepSeek model availability:', error.message || error);
      }
    })();

    this.ensuringOllamaModel = ensurePromise;
    await ensurePromise;
    this.ensuringOllamaModel = null;
  }
}

export default SystemStartupOrchestrator;
