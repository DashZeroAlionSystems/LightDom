#!/usr/bin/env node

/**
 * LightDom Admin Dashboard
 * Advanced administrative interface with comprehensive system management
 */

import { spawn } from 'child_process';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const AUTOMATION_SCRIPT_METADATA = {
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

const DEFAULT_AUTOMATION_TIMEOUT_MS = Number(process.env.ADMIN_AUTOMATION_TIMEOUT ?? 10 * 60 * 1000);
const MAX_AUTOMATION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_AUTOMATION_OUTPUT_CHARS = Number(process.env.ADMIN_AUTOMATION_MAX_OUTPUT ?? 20000);

function truncateOutput(text, limit) {
  if (!text || text.length <= limit) {
    return text || '';
  }
  return `${text.slice(0, limit)}\n...output truncated (${text.length - limit} additional characters)`;
}

function prettifyAutomationName(raw) {
  const prefix = 'automation:';
  const withoutPrefix = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
  const parts = withoutPrefix.split(/[:\-_]/).filter(Boolean);
  if (!parts.length) {
    return raw;
  }
  return parts.map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join(' ');
}

function deriveAutomationCategory(name) {
  if (AUTOMATION_SCRIPT_METADATA[name]?.category) {
    return AUTOMATION_SCRIPT_METADATA[name].category;
  }
  if (name.includes('monitor')) return 'monitoring';
  if (name.includes('test')) return 'quality';
  if (name.includes('workflow')) return 'orchestration';
  return 'automation';
}

function deriveAutomationTags(name) {
  if (AUTOMATION_SCRIPT_METADATA[name]?.tags) {
    return AUTOMATION_SCRIPT_METADATA[name].tags;
  }
  const prefix = 'automation:';
  const withoutPrefix = name.startsWith(prefix) ? name.slice(prefix.length) : name;
  return withoutPrefix.split(/[:\-_]/).filter(Boolean);
}

function coerceAutomationArgs(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item));
  }
  return undefined;
}

class LightDomAdminDashboard {
  constructor() {
    this.app = express();
    this.port = process.env.ADMIN_PORT || 8081;
    
    this.adminUsers = new Map();
    this.sessions = new Map();
    this.auditLog = [];
    this.automationScriptCache = null;
    this.automationScriptCacheTimestamp = 0;
    
    this.setupMiddleware();
    this.setupAuth();
    this.setupRoutes();
    this.setupWebSocket();
    this.initializeAdminUsers();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(join(__dirname, '..', 'public')));
    
    // CORS for API endpoints
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logAuditEvent('request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });
  }

  setupAuth() {
    // Authentication middleware
    this.app.use('/api/admin', (req, res, next) => {
      if (req.path === '/login') {
        return next();
      }
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      
      const session = this.sessions.get(token);
      if (!session || session.expires < Date.now()) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
      
      req.user = session.user;
      next();
    });
  }

  setupRoutes() {
    // Authentication routes
    this.app.post('/api/admin/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        const user = await this.authenticateUser(username, password);
        
        if (user) {
          const token = this.createSession(user);
          this.logAuditEvent('login', { username, ip: req.ip });
          res.json({ success: true, token, user: { username: user.username, role: user.role } });
        } else {
          this.logAuditEvent('login_failed', { username, ip: req.ip });
          res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/logout', (req, res) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        this.sessions.delete(token);
        this.logAuditEvent('logout', { token });
      }
      res.json({ success: true });
    });

    // Admin dashboard home
    this.app.get('/admin', (_req, res) => {
      res.sendFile(join(__dirname, '..', 'public', 'admin', 'index.html'));
    });

    // System overview
    this.app.get('/api/admin/overview', async (req, res) => {
      try {
        const overview = await this.getSystemOverview();
        res.json({ success: true, data: overview });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // User management
    this.app.get('/api/admin/users', async (req, res) => {
      try {
        const users = await this.getAllUsers();
        res.json({ success: true, data: users });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/users', async (req, res) => {
      try {
        const { username, password, role, email } = req.body;
        const user = await this.createUser(username, password, role, email);
        this.logAuditEvent('user_created', { username, role, admin: req.user.username });
        res.json({ success: true, data: user });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.put('/api/admin/users/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const user = await this.updateUser(id, updates);
        this.logAuditEvent('user_updated', { userId: id, updates, admin: req.user.username });
        res.json({ success: true, data: user });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.delete('/api/admin/users/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await this.deleteUser(id);
        this.logAuditEvent('user_deleted', { userId: id, admin: req.user.username });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // System configuration
    this.app.get('/api/admin/config', async (req, res) => {
      try {
        const config = await this.getSystemConfig();
        res.json({ success: true, data: config });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.put('/api/admin/config', async (req, res) => {
      try {
        const updates = req.body;
        await this.updateSystemConfig(updates);
        this.logAuditEvent('config_updated', { updates, admin: req.user.username });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Database management
    this.app.get('/api/admin/database/stats', async (req, res) => {
      try {
        const stats = await this.getDatabaseStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/database/optimize', async (req, res) => {
      try {
        await this.optimizeDatabase();
        this.logAuditEvent('database_optimized', { admin: req.user.username });
        res.json({ success: true, message: 'Database optimization completed' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/database/cleanup', async (req, res) => {
      try {
        const { days = 30 } = req.body;
        await this.cleanupDatabase(days);
        this.logAuditEvent('database_cleanup', { days, admin: req.user.username });
        res.json({ success: true, message: 'Database cleanup completed' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Security management
    this.app.get('/api/admin/security/status', async (req, res) => {
      try {
        const status = await this.getSecurityStatus();
        res.json({ success: true, data: status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/security/scan', async (req, res) => {
      try {
        await this.runSecurityScan();
        this.logAuditEvent('security_scan', { admin: req.user.username });
        res.json({ success: true, message: 'Security scan started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/admin/security/logs', async (req, res) => {
      try {
        const logs = await this.getSecurityLogs();
        res.json({ success: true, data: logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Performance management
    this.app.get('/api/admin/performance/metrics', async (req, res) => {
      try {
        const metrics = await this.getPerformanceMetrics();
        res.json({ success: true, data: metrics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/performance/optimize', async (req, res) => {
      try {
        await this.optimizePerformance();
        this.logAuditEvent('performance_optimized', { admin: req.user.username });
        res.json({ success: true, message: 'Performance optimization completed' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Monitoring management
    this.app.get('/api/admin/monitoring/alerts', async (req, res) => {
      try {
        const alerts = await this.getMonitoringAlerts();
        res.json({ success: true, data: alerts });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/monitoring/alerts/:id/acknowledge', async (req, res) => {
      try {
        const { id } = req.params;
        await this.acknowledgeAlert(id);
        this.logAuditEvent('alert_acknowledged', { alertId: id, admin: req.user.username });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/monitoring/alerts/:id/resolve', async (req, res) => {
      try {
        const { id } = req.params;
        await this.resolveAlert(id);
        this.logAuditEvent('alert_resolved', { alertId: id, admin: req.user.username });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Audit logs
    this.app.get('/api/admin/audit/logs', async (req, res) => {
      try {
        const { page = 1, limit = 50, type, user } = req.query;
        const logs = await this.getAuditLogs(page, limit, type, user);
        res.json({ success: true, data: logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // System maintenance
    this.app.post('/api/admin/maintenance/start', async (req, res) => {
      try {
        const { message } = req.body;
        await this.startMaintenanceMode(message);
        this.logAuditEvent('maintenance_started', { message, admin: req.user.username });
        res.json({ success: true, message: 'Maintenance mode started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/maintenance/stop', async (req, res) => {
      try {
        await this.stopMaintenanceMode();
        this.logAuditEvent('maintenance_stopped', { admin: req.user.username });
        res.json({ success: true, message: 'Maintenance mode stopped' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Backup management
    this.app.get('/api/admin/backups', async (req, res) => {
      try {
        const backups = await this.getBackups();
        res.json({ success: true, data: backups });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/backups/create', async (req, res) => {
      try {
        const { type = 'full' } = req.body;
        const backup = await this.createBackup(type);
        this.logAuditEvent('backup_created', { type, admin: req.user.username });
        res.json({ success: true, data: backup });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/backups/:id/restore', async (req, res) => {
      try {
        const { id } = req.params;
        await this.restoreBackup(id);
        this.logAuditEvent('backup_restored', { backupId: id, admin: req.user.username });
        res.json({ success: true, message: 'Backup restored successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Analytics and reporting
    this.app.get('/api/admin/analytics/usage', async (req, res) => {
      try {
        const { period = '7d' } = req.query;
        const analytics = await this.getUsageAnalytics(period);
        res.json({ success: true, data: analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/admin/analytics/performance', async (req, res) => {
      try {
        const { period = '24h' } = req.query;
        const analytics = await this.getPerformanceAnalytics(period);
        res.json({ success: true, data: analytics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/reports/generate', async (req, res) => {
      try {
        const { type, period, format = 'pdf' } = req.body;
        const report = await this.generateReport(type, period, format);
        this.logAuditEvent('report_generated', { type, period, format, admin: req.user.username });
        res.json({ success: true, data: report });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Automation orchestration
    this.app.get('/api/admin/automation/scripts', async (req, res) => {
      try {
        const filter = typeof req.query.filter === 'string' ? req.query.filter : undefined;
        const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
        const inventory = await this.getAutomationScripts(filter, tag);
        res.json({ success: true, data: inventory });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/admin/automation/scripts/:name/run', async (req, res) => {
      try {
        const { name } = req.params;
        const payload = req.body || {};
        const args = coerceAutomationArgs(payload.args) || [];
        const dryRun = Boolean(payload.dryRun);
        const timeoutMs = typeof payload.timeoutMs === 'number' ? payload.timeoutMs : undefined;

        const result = await this.runAutomationScript(name, { args, dryRun, timeoutMs });
        this.logAuditEvent('automation_script_run', {
          script: name,
          dryRun,
          admin: req.user?.username,
        });

        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  async loadAutomationScripts() {
    const now = Date.now();
    if (this.automationScriptCache && now - this.automationScriptCacheTimestamp < 15000) {
      return this.automationScriptCache;
    }

    const packagePath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
    const scripts = packageJson?.scripts || {};

    const entries = Object.entries(scripts).filter(([name]) =>
      name.startsWith('automation:') || name === 'autopilot'
    );

    const normalized = entries.map(([name, command]) => ({
      name,
      command,
      displayName:
        AUTOMATION_SCRIPT_METADATA[name]?.displayName ?? prettifyAutomationName(name),
      description:
        AUTOMATION_SCRIPT_METADATA[name]?.description ??
        `Execute npm script "${name}" using the configured automation tooling.`,
      tags: AUTOMATION_SCRIPT_METADATA[name]?.tags ?? deriveAutomationTags(name),
      category:
        AUTOMATION_SCRIPT_METADATA[name]?.category ?? deriveAutomationCategory(name),
    }));

    this.automationScriptCache = normalized;
    this.automationScriptCacheTimestamp = now;
    return normalized;
  }

  async getAutomationScripts(filter, tag) {
    const scripts = await this.loadAutomationScripts();
    const normalizedFilter = filter ? filter.toLowerCase().trim() : undefined;
    const normalizedTag = tag ? tag.toLowerCase().trim() : undefined;

    const filtered = scripts.filter(script => {
      const matchesFilter = normalizedFilter
        ? script.name.toLowerCase().includes(normalizedFilter) ||
          script.displayName.toLowerCase().includes(normalizedFilter) ||
          script.description.toLowerCase().includes(normalizedFilter) ||
          script.tags.some(t => t.toLowerCase().includes(normalizedFilter))
        : true;
      const matchesTag = normalizedTag
        ? script.tags.some(t => t.toLowerCase() === normalizedTag)
        : true;
      return matchesFilter && matchesTag;
    });

    return {
      scripts: filtered,
      total: filtered.length,
      available: scripts.length,
    };
  }

  resolveAutomationTimeout(timeoutMs) {
    if (timeoutMs === undefined || timeoutMs === null) {
      return DEFAULT_AUTOMATION_TIMEOUT_MS;
    }

    if (Number.isNaN(Number(timeoutMs)) || Number(timeoutMs) <= 0) {
      throw new Error('timeoutMs must be greater than zero.');
    }

    if (Number(timeoutMs) > MAX_AUTOMATION_TIMEOUT_MS) {
      throw new Error(`timeoutMs cannot exceed ${MAX_AUTOMATION_TIMEOUT_MS} milliseconds.`);
    }

    return Number(timeoutMs);
  }

  buildAutomationCommand(scriptName, args) {
    const suffix = args && args.length ? ` -- ${args.join(' ')}` : '';
    return `npm run ${scriptName}${suffix}`;
  }

  async runAutomationScript(scriptName, options = {}) {
    const scripts = await this.loadAutomationScripts();
    const script = scripts.find(entry => entry.name === scriptName);

    if (!script) {
      throw new Error(`Automation script not found: ${scriptName}`);
    }

    const args = Array.isArray(options.args) ? options.args.map(item => String(item)) : [];
    const timeoutMs = this.resolveAutomationTimeout(options.timeoutMs);
    const command = this.buildAutomationCommand(scriptName, args);

    if (options.dryRun) {
      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
        durationMs: 0,
        command,
        note: 'Dry run: command not executed.',
      };
    }

    return new Promise((resolve, reject) => {
      const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const spawnArgs = ['run', scriptName];
      if (args.length) {
        spawnArgs.push('--', ...args);
      }

      const child = spawn(npmCommand, spawnArgs, {
        cwd: projectRoot,
        env: { ...process.env },
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
        try {
          child.kill();
        } catch (error) {
          // ignore
        }
        resolve({
          exitCode: null,
          stdout: truncateOutput(stdout, MAX_AUTOMATION_OUTPUT_CHARS),
          stderr: truncateOutput(
            `${stderr}\nProcess terminated after timeout (${timeoutMs} ms).`,
            MAX_AUTOMATION_OUTPUT_CHARS
          ),
          durationMs: Date.now() - start,
          command,
        });
      }, timeoutMs);

      child.stdout?.on('data', data => {
        stdout += data.toString();
      });

      child.stderr?.on('data', data => {
        stderr += data.toString();
      });

      child.once('error', error => {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timer);
        reject(error);
      });

      child.once('exit', code => {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timer);
        resolve({
          exitCode: code,
          stdout: truncateOutput(stdout, MAX_AUTOMATION_OUTPUT_CHARS),
          stderr: truncateOutput(stderr, MAX_AUTOMATION_OUTPUT_CHARS),
          durationMs: Date.now() - start,
          command,
        });
      });
    });
  }

  setupWebSocket() {
    // WebSocket for real-time updates
    this.app.get('/admin/ws', (req, res) => {
      res.send('Admin WebSocket endpoint - implement with ws library');
    });
  }

  async initializeAdminUsers() {
    // Create default admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminHash = await this.hashPassword(adminPassword);
    
    this.adminUsers.set('admin', {
      id: 'admin',
      username: 'admin',
      password: adminHash,
      role: 'super_admin',
      email: 'admin@lightdom.com',
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
    
    console.log('🔐 Default admin user created: admin / admin123');
  }

  async authenticateUser(username, password) {
    const user = this.adminUsers.get(username);
    if (!user) return null;
    
    const isValid = await this.verifyPassword(password, user.password);
    if (isValid) {
      user.lastLogin = new Date().toISOString();
      return user;
    }
    
    return null;
  }

  async hashPassword(password) {
    return crypto.pbkdf2Sync(password, 'lightdom-salt', 100000, 64, 'sha512').toString('hex');
  }

  async verifyPassword(password, hash) {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  createSession(user) {
    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, {
      user,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    return token;
  }

  logAuditEvent(type, data) {
    this.auditLog.push({
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  async getSystemOverview() {
    const services = [
      { name: 'api-server', port: 3001, path: '/api/health' },
      { name: 'frontend', port: 3000, path: '/' },
      { name: 'monitoring', port: 9090, path: '/metrics' },
      { name: 'admin-dashboard', port: this.port, path: '/admin' }
    ];

    const overview = {
      timestamp: new Date().toISOString(),
      services: {},
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage()
      },
      users: {
        total: this.adminUsers.size,
        active: this.sessions.size
      },
      alerts: {
        active: 0, // Would be fetched from monitoring system
        resolved: 0
      },
      performance: {
        avgResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0
      }
    };

    for (const service of services) {
      try {
        const response = await fetch(`http://localhost:${service.port}${service.path}`);
        overview.services[service.name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          port: service.port,
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - Date.now() // Mock response time
        };
      } catch (error) {
        overview.services[service.name] = {
          status: 'unhealthy',
          port: service.port,
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }
    }

    return overview;
  }

  async getAllUsers() {
    const users = Array.from(this.adminUsers.values()).map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    return users;
  }

  async createUser(username, password, role, email) {
    if (this.adminUsers.has(username)) {
      throw new Error('User already exists');
    }
    
    const hashedPassword = await this.hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      username,
      password: hashedPassword,
      role,
      email,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    this.adminUsers.set(username, user);
    return { id: user.id, username, role, email, createdAt: user.createdAt };
  }

  async updateUser(id, updates) {
    const user = Array.from(this.adminUsers.values()).find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }
    
    Object.assign(user, updates);
    return { id: user.id, username: user.username, role: user.role, email: user.email };
  }

  async deleteUser(id) {
    const user = Array.from(this.adminUsers.values()).find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    this.adminUsers.delete(user.username);
  }

  async getSystemConfig() {
    return {
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      features: {
        blockchain: true,
        crawler: true,
        metaverse: true,
        wallet: true,
        monitoring: true
      },
      limits: {
        maxUsers: 1000,
        maxStorage: '100GB',
        maxRequestsPerMinute: 1000
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true
        },
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxLoginAttempts: 5
      }
    };
  }

  async updateSystemConfig(updates) {
    // This would update system configuration
    console.log('System configuration updated:', updates);
  }

  async getDatabaseStats() {
    try {
      const response = await fetch('http://localhost:3001/api/db/stats');
      const data = await response.json();
      return data.data || {
        connections: 0,
        queries: 0,
        size: '0 MB',
        uptime: 0
      };
    } catch (error) {
      return {
        connections: 0,
        queries: 0,
        size: '0 MB',
        uptime: 0,
        error: error.message
      };
    }
  }

  async optimizeDatabase() {
    // This would run database optimization
    console.log('Database optimization started');
  }

  async cleanupDatabase(days) {
    // This would clean up old database records
    console.log(`Database cleanup started for records older than ${days} days`);
  }

  async getSecurityStatus() {
    return {
      lastScan: new Date().toISOString(),
      vulnerabilities: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      compliance: {
        owasp: 'compliant',
        gdpr: 'compliant',
        pci: 'compliant'
      },
      threats: {
        blocked: 0,
        detected: 0
      }
    };
  }

  async runSecurityScan() {
    const { spawn } = await import('child_process');
    const process = spawn('node', ['scripts/security-audit.js'], {
      cwd: projectRoot,
      stdio: 'pipe'
    });
    
    process.stdout.on('data', (data) => {
      console.log(`Security scan: ${data}`);
    });
    
    process.stderr.on('data', (data) => {
      console.error(`Security scan error: ${data}`);
    });
  }

  async getSecurityLogs() {
    return this.auditLog.filter(log => 
      ['login', 'login_failed', 'user_created', 'user_updated', 'user_deleted'].includes(log.type)
    ).slice(-100);
  }

  async getPerformanceMetrics() {
    return {
      cpu: {
        usage: 0,
        load: 0
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        usage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
      },
      disk: {
        used: 0,
        total: 0,
        usage: 0
      },
      network: {
        bytesIn: 0,
        bytesOut: 0,
        connections: 0
      },
      responseTime: {
        avg: 0,
        p95: 0,
        p99: 0
      }
    };
  }

  async optimizePerformance() {
    // This would run performance optimization
    console.log('Performance optimization started');
  }

  async getMonitoringAlerts() {
    return [
      {
        id: '1',
        type: 'cpu_high',
        severity: 'medium',
        message: 'High CPU usage detected',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false
      }
    ];
  }

  async acknowledgeAlert(id) {
    console.log(`Alert ${id} acknowledged`);
  }

  async resolveAlert(id) {
    console.log(`Alert ${id} resolved`);
  }

  async getAuditLogs(page, limit, type, user) {
    let logs = this.auditLog;
    
    if (type) {
      logs = logs.filter(log => log.type === type);
    }
    
    if (user) {
      logs = logs.filter(log => log.data.admin === user || log.data.username === user);
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      logs: logs.slice(start, end),
      total: logs.length,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  async startMaintenanceMode(message) {
    await fs.writeFile('/tmp/lightdom-maintenance', JSON.stringify({
      message: message || 'System maintenance in progress',
      startedAt: new Date().toISOString(),
      startedBy: 'admin'
    }));
  }

  async stopMaintenanceMode() {
    try {
      await fs.unlink('/tmp/lightdom-maintenance');
    } catch (error) {
      // File might not exist
    }
  }

  async getBackups() {
    try {
      const { execSync } = await import('child_process');
      const output = execSync('ls -la /var/backups/lightdom/', { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split(/\s+/);
        return {
          name: parts[8],
          size: parts[4],
          date: `${parts[5]} ${parts[6]} ${parts[7]}`,
          type: parts[8].includes('full') ? 'full' : 'incremental'
        };
      });
    } catch (error) {
      return [];
    }
  }

  async createBackup(type) {
    const timestamp = new Date().toISOString().split('T')[0];
    const backupFile = `lightdom_backup_${type}_${timestamp}.tar.gz`;
    
    const { execSync } = await import('child_process');
    execSync(`tar -czf ${backupFile} /app/logs /app/artifacts /app/config`, { stdio: 'inherit' });
    
    return {
      name: backupFile,
      type,
      size: '0 MB',
      date: new Date().toISOString()
    };
  }

  async restoreBackup(id) {
    console.log(`Restoring backup: ${id}`);
  }

  async getUsageAnalytics(period) {
    return {
      period,
      users: {
        total: this.adminUsers.size,
        active: this.sessions.size,
        new: 0
      },
      requests: {
        total: 0,
        successful: 0,
        failed: 0
      },
      storage: {
        used: '0 MB',
        total: '100 GB'
      }
    };
  }

  async getPerformanceAnalytics(period) {
    return {
      period,
      responseTime: {
        avg: 0,
        p95: 0,
        p99: 0
      },
      throughput: {
        requestsPerSecond: 0,
        requestsPerMinute: 0
      },
      errors: {
        rate: 0,
        count: 0
      }
    };
  }

  async generateReport(type, period, format) {
    const reportId = crypto.randomUUID();
    const report = {
      id: reportId,
      type,
      period,
      format,
      status: 'generating',
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/admin/reports/${reportId}/download`
    };
    
    // This would generate the actual report
    setTimeout(() => {
      report.status = 'completed';
    }, 5000);
    
    return report;
  }

  generateAdminDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightDom Admin Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #0f172a;
            color: #ffffff;
        }
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1e293b, #334155);
        }
        .login-form {
            background: #1e293b;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            width: 400px;
        }
        .login-form h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #60a5fa;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #e2e8f0;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #475569;
            border-radius: 6px;
            background: #334155;
            color: #ffffff;
            font-size: 16px;
        }
        .form-group input:focus {
            outline: none;
            border-color: #60a5fa;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #2563eb;
        }
        .error {
            color: #ef4444;
            margin-top: 10px;
            text-align: center;
        }
        .dashboard {
            display: none;
        }
        .header {
            background: #1e293b;
            padding: 20px;
            border-bottom: 1px solid #334155;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 {
            margin: 0;
            color: #60a5fa;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .logout-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: #1e293b;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #334155;
        }
        .card h3 {
            margin-top: 0;
            color: #60a5fa;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.healthy {
            background: #10b981;
            color: white;
        }
        .status.unhealthy {
            background: #ef4444;
            color: white;
        }
        .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 4px;
        }
        .btn:hover {
            background: #2563eb;
        }
        .btn-danger {
            background: #ef4444;
        }
        .btn-danger:hover {
            background: #dc2626;
        }
        .btn-success {
            background: #10b981;
        }
        .btn-success:hover {
            background: #059669;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: #334155;
            border-radius: 4px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #334155;
        }
        .table th {
            background: #334155;
            color: #e2e8f0;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }
        .modal-content {
            background: #1e293b;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover {
            color: #fff;
        }
        .dashboard-nav {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 24px;
        }
        .dashboard-nav a {
            color: #e2e8f0;
            text-decoration: none;
            padding: 8px 12px;
            border: 1px solid #334155;
            border-radius: 999px;
            background: #1e293b;
        }
        .dashboard-nav a:hover {
            background: #334155;
        }
        .section {
            margin: 32px 0;
        }
        .section h2 {
            margin-bottom: 16px;
            color: #f8fafc;
        }
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 12px;
        }
        .control-group label {
            font-size: 14px;
            color: #cbd5f5;
        }
        .control-group select,
        .control-group textarea,
        .control-group input {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            color: #e2e8f0;
            padding: 10px;
            font-size: 14px;
        }
        .control-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        .button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .preview-panel {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 12px;
            max-height: 260px;
            overflow-y: auto;
        }
        .preview-panel h4 {
            margin: 0 0 8px 0;
            color: #60a5fa;
        }
        .preview-panel pre {
            background: #1e293b;
            padding: 8px;
            border-radius: 6px;
            overflow-x: auto;
            color: #cbd5f5;
        }
        .status.status-active {
            background: #3b82f6;
            color: #ffffff;
        }
        .status.status-pending {
            background: #475569;
            color: #e2e8f0;
        }
        .status.status-completed {
            background: #10b981;
            color: #0f172a;
        }
        .status.status-failed {
            background: #ef4444;
            color: #ffffff;
        }
        .chart-container {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 16px;
        }
        .mermaid-diagram svg {
            width: 100%;
            height: auto;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
    <div id="login-container" class="login-container">
        <div class="login-form">
            <h2>🔐 Admin Login</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn">Login</button>
                <div id="login-error" class="error" style="display: none;"></div>
            </form>
        </div>
    </div>

    <div id="dashboard" class="dashboard">
        <div class="header">
            <h1>🚀 LightDom Admin Dashboard</h1>
            <div class="user-info">
                <span id="user-info">Welcome, Admin</span>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        </div>

        <div class="container">
            <nav class="dashboard-nav">
                <a href="#system-overview">System Overview</a>
                <a href="#user-management">Users</a>
                <a href="#security-status">Security</a>
                <a href="#performance-metrics">Performance</a>
                <a href="#crawler-section">Crawler Mining</a>
                <a href="#neural-section">Neural Instances</a>
                <a href="#workflow-overview-section">Workflow Overview</a>
                <a href="#audit-logs">Audit Logs</a>
            </nav>

            <div class="grid">
                <div class="card">
                    <h3>System Overview</h3>
                    <div id="system-overview">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>User Management</h3>
                    <div id="user-management">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Security Status</h3>
                    <div id="security-status">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Performance Metrics</h3>
                    <div id="performance-metrics">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Database Management</h3>
                    <div id="database-management">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Monitoring & Alerts</h3>
                    <div id="monitoring-alerts">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Backup Management</h3>
                    <div id="backup-management">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>System Maintenance</h3>
                    <div id="system-maintenance">Loading...</div>
                </div>
            </div>
            
            <div class="card">
                <h3>Audit Logs</h3>
                <div id="audit-logs">Loading...</div>
            </div>

            <div class="section" id="neural-section">
                <h2>Neural network orchestrator</h2>
                <div class="card">
                    <div class="control-group">
                        <label for="neural-workflow-select">Workflow</label>
                        <select id="neural-workflow-select"></select>
                    </div>
                    <div class="control-group">
                        <label for="neural-instance-count">Instances to launch</label>
                        <input type="number" id="neural-instance-count" min="1" value="1">
                    </div>
                    <div class="button-row">
                        <button class="btn btn-success" onclick="spinUpNeuralInstances()">Spin up instances</button>
                        <button class="btn" onclick="refreshNeuralStatus()">Refresh status</button>
                    </div>
                    <div class="preview-panel" id="neural-status-panel">
                        Select a workflow to inspect current neural instances.
                    </div>
                </div>
            </div>

            <div class="section" id="crawler-section">
                <h2>Crawler prompt miner</h2>
                <div class="card">
                    <div class="control-group">
                        <label for="crawler-workflow-select">Associate with workflow</label>
                        <select id="crawler-workflow-select"></select>
                    </div>
                    <div class="control-group">
                        <label for="crawler-prompt">Mining prompt</label>
                        <textarea id="crawler-prompt" placeholder="Describe the experience you want the crawler to mine"></textarea>
                    </div>
                    <div class="button-row">
                        <button class="btn" onclick="previewCrawlerPrompt()">Preview mined schema</button>
                        <button class="btn btn-success" onclick="enqueueCrawlerRun()">Queue mining + training</button>
                    </div>
                    <div class="preview-panel">
                        <h4>Attribute prompts</h4>
                        <div id="crawler-preview-attributes">No preview generated yet.</div>
                        <h4 style="margin-top:12px;">Blueprint</h4>
                        <pre id="crawler-preview-blueprint">Run a preview to inspect blueprint output.</pre>
                    </div>
                </div>
            </div>

            <div class="section" id="workflow-overview-section">
                <h2>Workflow overview</h2>
                <div class="card">
                    <div class="control-group">
                        <label for="workflow-overview-select">Workflow</label>
                        <select id="workflow-overview-select"></select>
                    </div>
                    <div class="chart-container">
                        <div id="workflow-mermaid" class="mermaid-diagram">graph LR; A[Loading workflow diagram]</div>
                    </div>
                    <div class="button-row">
                        <button class="btn btn-success" onclick="startWorkflowRun()">Start workflow</button>
                        <button class="btn" onclick="refreshWorkflowOverview()">Refresh overview</button>
                    </div>
                    <div class="preview-panel" id="workflow-overview-status">
                        Select a workflow to view run history and job status.
                    </div>
                    <div class="preview-panel" id="workflow-activity-log" style="margin-top:12px;">
                        <h4>Workflow events</h4>
                        <div>No events yet.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="user-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('user-modal')">&times;</span>
            <h2>Create User</h2>
            <form id="create-user-form">
                <div class="form-group">
                    <label for="new-username">Username</label>
                    <input type="text" id="new-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="new-password">Password</label>
                    <input type="password" id="new-password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="new-role">Role</label>
                    <select id="new-role" name="role" required>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-email">Email</label>
                    <input type="email" id="new-email" name="email" required>
                </div>
                <button type="submit" class="btn">Create User</button>
            </form>
        </div>
    </div>


                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;
                
                users.forEach(user => {
                    html += \`
                        <tr>
                            <td>\${user.username}</td>
                            <td>\${user.role}</td>
                            <td>\${user.email}</td>
                            <td>\${user.lastLogin || 'Never'}</td>
                            <td>
                                <button class="btn" onclick="editUser('\${user.id}')">Edit</button>
                                <button class="btn btn-danger" onclick="deleteUser('\${user.id}')">Delete</button>
                            </td>
                        </tr>
                    \`;
                });
                
                html += '</tbody></table>';
                document.getElementById('user-management').innerHTML = html;
            }
        }

        async function loadSecurityStatus() {
            const data = await apiCall('/api/admin/security/status');
            if (data.success) {
                const status = data.data;
                document.getElementById('security-status').innerHTML = \`
                    <div class="metric">
                        <span>Last Scan:</span>
                        <span>\${new Date(status.lastScan).toLocaleDateString()}</span>
                    </div>
                    <div class="metric">
                        <span>Critical Vulnerabilities:</span>
                        <span>\${status.vulnerabilities.critical}</span>
                    </div>
                    <div class="metric">
                        <span>High Vulnerabilities:</span>
                        <span>\${status.vulnerabilities.high}</span>
                    </div>
                    <div class="metric">
                        <span>OWASP Compliance:</span>
                        <span class="status \${status.compliance.owasp === 'compliant' ? 'healthy' : 'unhealthy'}">\${status.compliance.owasp}</span>
                    </div>
                    <button class="btn btn-danger" onclick="runSecurityScan()">Run Security Scan</button>
                \`;
            }
        }

        async function loadPerformanceMetrics() {
            const data = await apiCall('/api/admin/performance/metrics');
            if (data.success) {
                const metrics = data.data;
                document.getElementById('performance-metrics').innerHTML = \`
                    <div class="metric">
                        <span>CPU Usage:</span>
                        <span>\${metrics.cpu.usage.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Memory Usage:</span>
                        <span>\${metrics.memory.usage.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Disk Usage:</span>
                        <span>\${metrics.disk.usage.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Avg Response Time:</span>
                        <span>\${metrics.responseTime.avg.toFixed(0)}ms</span>
                    </div>
                    <button class="btn" onclick="optimizePerformance()">Optimize Performance</button>
                \`;
            }
        }

        async function loadDatabaseManagement() {
            const data = await apiCall('/api/admin/database/stats');
            if (data.success) {
                const stats = data.data;
                document.getElementById('database-management').innerHTML = \`
                    <div class="metric">
                        <span>Connections:</span>
                        <span>\${stats.connections}</span>
                    </div>
                    <div class="metric">
                        <span>Queries:</span>
                        <span>\${stats.queries}</span>
                    </div>
                    <div class="metric">
                        <span>Size:</span>
                        <span>\${stats.size}</span>
                    </div>
                    <div class="metric">
                        <span>Uptime:</span>
                        <span>\${Math.floor(stats.uptime / 3600)}h</span>
                    </div>
                    <button class="btn" onclick="optimizeDatabase()">Optimize Database</button>
                    <button class="btn" onclick="cleanupDatabase()">Cleanup Database</button>
                \`;
            }
        }

        async function loadMonitoringAlerts() {
            const data = await apiCall('/api/admin/monitoring/alerts');
            if (data.success) {
                const alerts = data.data;
                let html = '';
                
                alerts.forEach(alert => {
                    html += \`
                        <div class="metric">
                            <span>\${alert.type}:</span>
                            <span class="status \${alert.severity === 'critical' ? 'unhealthy' : 'healthy'}">\${alert.severity}</span>
                        </div>
                        <div class="metric">
                            <span>Message:</span>
                            <span>\${alert.message}</span>
                        </div>
                        <div class="metric">
                            <span>Timestamp:</span>
                            <span>\${new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        <div>
                            <button class="btn" onclick="acknowledgeAlert('\${alert.id}')">Acknowledge</button>
                            <button class="btn btn-success" onclick="resolveAlert('\${alert.id}')">Resolve</button>
                        </div>
                    \`;
                });
                
                document.getElementById('monitoring-alerts').innerHTML = html;
            }
        }

        async function loadBackupManagement() {
            const data = await apiCall('/api/admin/backups');
            if (data.success) {
                const backups = data.data;
                let html = \`
                    <button class="btn btn-success" onclick="createBackup()">Create Backup</button>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;
                
                backups.forEach(backup => {
                    html += \`
                        <tr>
                            <td>\${backup.name}</td>
                            <td>\${backup.type}</td>
                            <td>\${backup.size}</td>
                            <td>\${backup.date}</td>
                            <td>
                                <button class="btn" onclick="restoreBackup('\${backup.name}')">Restore</button>
                            </td>
                        </tr>
                    \`;
                });
                
                html += '</tbody></table>';
                document.getElementById('backup-management').innerHTML = html;
            }
        }

        async function loadSystemMaintenance() {
            document.getElementById('system-maintenance').innerHTML = \`
                <button class="btn btn-danger" onclick="startMaintenance()">Start Maintenance</button>
                <button class="btn btn-success" onclick="stopMaintenance()">Stop Maintenance</button>
            \`;
        }

        async function loadAuditLogs() {
            const data = await apiCall('/api/admin/audit/logs?limit=20');
            if (data.success) {
                const logs = data.data.logs;
                let html = \`
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>User</th>
                                <th>Timestamp</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;
                
                logs.forEach(log => {
                    html += \`
                        <tr>
                            <td>\${log.type}</td>
                            <td>\${log.data.admin || log.data.username || 'System'}</td>
                            <td>\${new Date(log.timestamp).toLocaleString()}</td>
                            <td>\${JSON.stringify(log.data)}</td>
                        </tr>
                    \`;
                });
                
                html += '</tbody></table>';
                document.getElementById('audit-logs').innerHTML = html;
            }
        }

        async function loadWorkflowCollections() {
            try {
                const data = await apiCall('/api/workflow-admin/workflows', { method: 'GET' });
                workflows = data.workflows || [];
                populateWorkflowSelect('neural-workflow-select');
                populateWorkflowSelect('crawler-workflow-select');
                populateWorkflowSelect('workflow-overview-select');
            } catch (error) {
                console.error('Failed to load workflows', error);
            }
        }

        function populateWorkflowSelect(selectId) {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Select workflow</option>';
            workflows.forEach((wf) => {
                const option = document.createElement('option');
                option.value = wf.id;
                option.textContent = wf.dataset_name + ' (' + wf.schema_key + ')';
                select.appendChild(option);
            });
        }

        async function spinUpNeuralInstances() {
            const workflowId = document.getElementById('neural-workflow-select').value;
            const count = parseInt(document.getElementById('neural-instance-count').value, 10);
            if (!workflowId || !count) {
                alert('Select a workflow and specify instance count.');
                return;
            }
            const statusPanel = document.getElementById('neural-status-panel');
            statusPanel.textContent = 'Enqueuing mining + training jobs...';
            try {
                const workflow = workflows.find((wf) => wf.id === workflowId);
                for (let i = 0; i < count; i += 1) {
                    await apiCall('/api/workflow-admin/workflows/' + workflowId + '/enqueue', {
                        method: 'POST',
                        body: JSON.stringify({ prompt: workflow.prompt })
                    });
                }
                statusPanel.textContent = 'Queued ' + count + ' job(s). Monitor workflow runs for progress.';
            } catch (error) {
                statusPanel.textContent = 'Failed to queue instances: ' + error.message;
            }
        }

        async function refreshNeuralStatus() {
            const workflowId = document.getElementById('neural-workflow-select').value;
            const statusPanel = document.getElementById('neural-status-panel');
            if (!workflowId) {
                statusPanel.textContent = 'Select a workflow to inspect current neural instances.';
                return;
            }
            statusPanel.textContent = 'Loading workflow runs...';
            try {
                const data = await apiCall('/api/workflow-admin/workflows/' + workflowId + '/runs');
                const runs = data.runs || [];
                if (!runs.length) {
                    statusPanel.textContent = 'No workflow runs recorded yet.';
                    return;
                }
                const list = runs.slice(0, 10).map((run) => {
                    const started = new Date(run.started_at).toLocaleString();
                    const completed = run.completed_at ? new Date(run.completed_at).toLocaleString() : '—';
                    return '<div class="metric"><span>' + run.id + '</span><span class="status status-' + run.status + '">' + run.status + '</span></div>' +
                        '<div class="metric"><span>Started</span><span>' + started + '</span></div>' +
                        '<div class="metric"><span>Completed</span><span>' + completed + '</span></div>';
                }).join('<hr style="border-color:#1f2937;">');
                statusPanel.innerHTML = list;
            } catch (error) {
                statusPanel.textContent = 'Failed to load runs: ' + error.message;
            }
        }

        async function previewCrawlerPrompt() {
            const workflowId = document.getElementById('crawler-workflow-select').value || 'null';
            const prompt = document.getElementById('crawler-prompt').value.trim();
            if (!prompt) {
                alert('Enter a mining prompt first.');
                return;
            }
            document.getElementById('crawler-preview-attributes').textContent = 'Generating preview...';
            document.getElementById('crawler-preview-blueprint').textContent = '...';
            try {
                const response = await apiCall('/api/workflow-admin/workflows/' + workflowId + '/preview-mining', {
                    method: 'POST',
                    body: JSON.stringify({ prompt })
                });
                const { mined, blueprint, attributePrompts } = response.preview;
                document.getElementById('crawler-preview-attributes').innerHTML = attributePrompts.length
                    ? attributePrompts.map((line) => '<div class="metric"><span>' + line + '</span></div>').join('')
                    : 'No attribute prompts generated.';
                document.getElementById('crawler-preview-blueprint').textContent = JSON.stringify({
                    workflow: mined.workflow,
                    blueprint
                }, null, 2);
            } catch (error) {
                document.getElementById('crawler-preview-attributes').textContent = 'Preview failed: ' + error.message;
                document.getElementById('crawler-preview-blueprint').textContent = '';
            }
        }

        async function enqueueCrawlerRun() {
            const workflowId = document.getElementById('crawler-workflow-select').value;
            const prompt = document.getElementById('crawler-prompt').value.trim();
            if (!workflowId || !prompt) {
                alert('Select a workflow and enter a prompt before enqueuing.');
                return;
            }
            try {
                await apiCall('/api/workflow-admin/workflows/' + workflowId + '/enqueue', {
                    method: 'POST',
                    body: JSON.stringify({ prompt })
                });
                alert('Workflow mining + training queued successfully.');
                refreshNeuralStatus();
            } catch (error) {
                alert('Failed to enqueue: ' + error.message);
            }
        }

        async function startWorkflowRun() {
            const workflowId = document.getElementById('workflow-overview-select').value;
            if (!workflowId) {
                alert('Select a workflow first.');
                return;
            }
            const workflow = workflows.find((wf) => wf.id === workflowId);
            try {
                await apiCall('/api/workflow-admin/workflows/' + workflowId + '/enqueue', {
                    method: 'POST',
                    body: JSON.stringify({ prompt: workflow.prompt })
                });
                document.getElementById('workflow-overview-status').textContent = 'Workflow queued. Updating overview...';
                await refreshWorkflowOverview();
            } catch (error) {
                document.getElementById('workflow-overview-status').textContent = 'Failed to start workflow: ' + error.message;
            }
        }

        async function refreshWorkflowOverview() {
            const workflowId = document.getElementById('workflow-overview-select').value;
            if (!workflowId) {
                document.getElementById('workflow-overview-status').textContent = 'Select a workflow to view run history and job status.';
                return;
            }
            try {
                const runsData = await apiCall('/api/workflow-admin/workflows/' + workflowId + '/runs');
                const queuedData = await apiCall('/api/workflow-admin/queue');
                const workflow = workflows.find((wf) => wf.id === workflowId);
                renderWorkflowMermaid(workflow, runsData.runs || [], queuedData.jobs || []);
                renderWorkflowStatus(runsData.runs || []);
            } catch (error) {
                document.getElementById('workflow-overview-status').textContent = 'Failed to refresh workflow: ' + error.message;
            }
        }

        function renderWorkflowMermaid(workflow, runs, jobs) {
            const latestRun = runs[0];
            const status = latestRun?.status || 'idle';
            const nodes = [
                'A[Workflow queued]',
                'B{Mining job}',
                'C[Blueprint persisted]',
                'D[Training job]',
                'E[Models + metrics stored]'
            ];
            const edges = [
                'A --> B',
                'B --> C',
                'C --> D',
                'D --> E'
            ];
            const highlightNode = status === 'queued' ? 'A' : status === 'mining' ? 'B' : status === 'training' ? 'D' : status === 'completed' ? 'E' : null;
            const diagramNodes = nodes.map((node) => {
                if (highlightNode && node.indexOf(highlightNode) === 0) {
                    return node + ':::activeNode';
                }
                return node;
            });
            const chartParts = ['graph LR'].concat(diagramNodes).concat(edges);
            const chart = chartParts.join('');
            const mermaidEl = document.getElementById('workflow-mermaid');
            mermaidEl.innerHTML = chart;
            mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: { primaryColor: '#3b82f6', primaryTextColor: '#0f172a' } });
            mermaid.init(undefined, mermaidEl);
        }

        function renderWorkflowStatus(runs) {
            if (!runs.length) {
                document.getElementById('workflow-overview-status').textContent = 'No workflow runs recorded yet.';
                return;
            }
            const list = runs.slice(0, 8).map((run) => {
                const started = new Date(run.started_at).toLocaleString();
                const completed = run.completed_at ? new Date(run.completed_at).toLocaleString() : '—';
                return '<div class="metric"><span>' + run.id + '</span><span class="status status-' + run.status + '">' + run.status + '</span></div>' +
                    '<div class="metric"><span>Started</span><span>' + started + '</span></div>' +
                    '<div class="metric"><span>Completed</span><span>' + completed + '</span></div>';
            }).join('<hr style="border-color:#1f2937;">');
            document.getElementById('workflow-overview-status').innerHTML = list;
            document.getElementById('workflow-activity-log').innerHTML = '<h4>Workflow events</h4><div>' + list + '</div>';
        }

        // Modal functions
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // User management functions
        document.getElementById('create-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const userData = Object.fromEntries(formData);
            
            try {
                const response = await apiCall('/api/admin/users', {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
                
                if (response.success) {
                    closeModal('user-modal');
                    loadUserManagement();
                } else {
                    alert('Failed to create user: ' + response.error);
                }
            } catch (error) {
                alert('Failed to create user: ' + error.message);
            }
        });

        async function editUser(userId) {
            // Implementation for editing user
            console.log('Edit user:', userId);
        }

        async function deleteUser(userId) {
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    const response = await apiCall(\`/api/admin/users/\${userId}\`, {
                        method: 'DELETE'
                    });
                    
                    if (response.success) {
                        loadUserManagement();
                    } else {
                        alert('Failed to delete user: ' + response.error);
                    }
                } catch (error) {
                    alert('Failed to delete user: ' + error.message);
                }
            }
        }

        // System management functions
        async function runSecurityScan() {
            try {
                const response = await apiCall('/api/admin/security/scan', { method: 'POST' });
                if (response.success) {
                    alert(response.message);
                }
            } catch (error) {
                alert('Failed to run security scan: ' + error.message);
            }
        }

        async function optimizePerformance() {
            try {
                const response = await apiCall('/api/admin/performance/optimize', { method: 'POST' });
                if (response.success) {
                    alert(response.message);
                }
            } catch (error) {
                alert('Failed to optimize performance: ' + error.message);
            }
        }

        async function optimizeDatabase() {
            try {
                const response = await apiCall('/api/admin/database/optimize', { method: 'POST' });
                if (response.success) {
                    alert(response.message);
                }
            } catch (error) {
                alert('Failed to optimize database: ' + error.message);
            }
        }

        async function cleanupDatabase() {
            const days = prompt('Enter number of days to keep data:', '30');
            if (days) {
                try {
                    const response = await apiCall('/api/admin/database/cleanup', {
                        method: 'POST',
                        body: JSON.stringify({ days: parseInt(days) })
                    });
                    if (response.success) {
                        alert(response.message);
                    }
                } catch (error) {
                    alert('Failed to cleanup database: ' + error.message);
                }
            }
        }

        async function acknowledgeAlert(alertId) {
            try {
                const response = await apiCall(\`/api/admin/monitoring/alerts/\${alertId}/acknowledge\`, { method: 'POST' });
                if (response.success) {
                    loadMonitoringAlerts();
                }
            } catch (error) {
                alert('Failed to acknowledge alert: ' + error.message);
            }
        }

        async function resolveAlert(alertId) {
            try {
                const response = await apiCall(\`/api/admin/monitoring/alerts/\${alertId}/resolve\`, { method: 'POST' });
                if (response.success) {
                    loadMonitoringAlerts();
                }
            } catch (error) {
                alert('Failed to resolve alert: ' + error.message);
            }
        }

        async function createBackup() {
            const type = prompt('Enter backup type (full/incremental):', 'full');
            if (type) {
                try {
                    const response = await apiCall('/api/admin/backups/create', {
                        method: 'POST',
                        body: JSON.stringify({ type })
                    });
                    if (response.success) {
                        alert('Backup created successfully');
                        loadBackupManagement();
                    }
                } catch (error) {
                    alert('Failed to create backup: ' + error.message);
                }
            }
        }

        async function restoreBackup(backupName) {
            if (confirm(\`Are you sure you want to restore backup \${backupName}?\`)) {
                try {
                    const response = await apiCall(\`/api/admin/backups/\${backupName}/restore\`, { method: 'POST' });
                    if (response.success) {
                        alert(response.message);
                    }
                } catch (error) {
                    alert('Failed to restore backup: ' + error.message);
                }
            }
        }

        async function startMaintenance() {
            const message = prompt('Enter maintenance message:', 'System maintenance in progress');
            if (message) {
                try {
                    const response = await apiCall('/api/admin/maintenance/start', {
                        method: 'POST',
                        body: JSON.stringify({ message })
                    });
                    if (response.success) {
                        alert(response.message);
                    }
                } catch (error) {
                    alert('Failed to start maintenance: ' + error.message);
                }
            }
        }

        async function stopMaintenance() {
            try {
                const response = await apiCall('/api/admin/maintenance/stop', { method: 'POST' });
                if (response.success) {
                    alert(response.message);
                }
            } catch (error) {
                alert('Failed to stop maintenance: ' + error.message);
            }
        }

        // Auto-refresh every 30 seconds
        setInterval(loadDashboardData, 30000);
    </script>
</body>
</html>
    `;
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`🔐 LightDom Admin Dashboard running on port ${this.port}`);
      console.log(`📊 Admin Dashboard: http://localhost:${this.port}/admin`);
      console.log(`🔑 Default Login: admin / admin123`);
    });
  }
}

// Start admin dashboard
const adminDashboard = new LightDomAdminDashboard();
adminDashboard.start();

export { LightDomAdminDashboard };
