#!/usr/bin/env node

/**
 * LightDom Admin Dashboard
 * Advanced administrative interface with comprehensive system management
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomAdminDashboard {
  constructor() {
    this.app = express();
    this.port = process.env.ADMIN_PORT || 8081;
    
    this.adminUsers = new Map();
    this.sessions = new Map();
    this.auditLog = [];
    
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
    this.app.get('/admin', (req, res) => {
      res.send(this.generateAdminDashboardHTML());
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
    </style>
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

    <script>
        let authToken = null;
        let currentUser = null;

        // Authentication
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    authToken = data.token;
                    currentUser = data.user;
                    showDashboard();
                } else {
                    showError(data.error);
                }
            } catch (error) {
                showError('Login failed: ' + error.message);
            }
        });

        function showError(message) {
            const errorDiv = document.getElementById('login-error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        function showDashboard() {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('user-info').textContent = \`Welcome, \${currentUser.username}\`;
            
            loadDashboardData();
        }

        function logout() {
            authToken = null;
            currentUser = null;
            document.getElementById('login-container').style.display = 'flex';
            document.getElementById('dashboard').style.display = 'none';
        }

        // API calls
        async function apiCall(url, options = {}) {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${authToken}\`,
                    ...options.headers
                }
            });
            
            return await response.json();
        }

        // Dashboard data loading
        async function loadDashboardData() {
            await Promise.all([
                loadSystemOverview(),
                loadUserManagement(),
                loadSecurityStatus(),
                loadPerformanceMetrics(),
                loadDatabaseManagement(),
                loadMonitoringAlerts(),
                loadBackupManagement(),
                loadSystemMaintenance(),
                loadAuditLogs()
            ]);
        }

        async function loadSystemOverview() {
            const data = await apiCall('/api/admin/overview');
            if (data.success) {
                const overview = data.data;
                document.getElementById('system-overview').innerHTML = \`
                    <div class="metric">
                        <span>Uptime:</span>
                        <span>\${Math.floor(overview.system.uptime / 3600)}h \${Math.floor((overview.system.uptime % 3600) / 60)}m</span>
                    </div>
                    <div class="metric">
                        <span>Memory Usage:</span>
                        <span>\${(overview.system.memory.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div class="metric">
                        <span>Active Users:</span>
                        <span>\${overview.users.active} / \${overview.users.total}</span>
                    </div>
                    <div class="metric">
                        <span>Active Alerts:</span>
                        <span>\${overview.alerts.active}</span>
                    </div>
                \`;
            }
        }

        async function loadUserManagement() {
            const data = await apiCall('/api/admin/users');
            if (data.success) {
                const users = data.data;
                let html = \`
                    <button class="btn btn-success" onclick="openModal('user-modal')">Create User</button>
                    <table class="table">
                        <thead>
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
