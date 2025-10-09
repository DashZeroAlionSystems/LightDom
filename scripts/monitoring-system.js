#!/usr/bin/env node

/**
 * LightDom Advanced Monitoring & Alerting System
 * Real-time monitoring with intelligent alerting and automated responses
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomMonitoringSystem {
  constructor() {
    this.app = express();
    this.port = process.env.MONITORING_PORT || 8085;
    
    this.metrics = new Map();
    this.alerts = new Map();
    this.incidents = new Map();
    this.notifications = [];
    this.subscribers = new Map();
    
    this.alertRules = new Map();
    this.incidentResponse = new Map();
    this.healthChecks = new Map();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupMonitoring();
    this.setupAlerting();
    this.initializeDefaultRules();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(join(__dirname, '..', 'public')));
    
    // CORS for API endpoints
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logRequest(req);
      next();
    });
  }

  setupRoutes() {
    // Monitoring dashboard
    this.app.get('/', (req, res) => {
      res.send(this.generateMonitoringDashboardHTML());
    });

    // Metrics endpoints
    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.getAllMetrics();
        res.json({ success: true, data: metrics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/metrics/:service', async (req, res) => {
      try {
        const { service } = req.params;
        const metrics = await this.getServiceMetrics(service);
        res.json({ success: true, data: metrics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/metrics', async (req, res) => {
      try {
        const { service, metric, value, tags = {} } = req.body;
        await this.recordMetric(service, metric, value, tags);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Health check endpoints
    this.app.get('/api/health', async (req, res) => {
      try {
        const health = await this.getSystemHealth();
        res.json({ success: true, data: health });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/health/:service', async (req, res) => {
      try {
        const { service } = req.params;
        const health = await this.getServiceHealth(service);
        res.json({ success: true, data: health });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/health/:service', async (req, res) => {
      try {
        const { service } = req.params;
        const { status, message, details } = req.body;
        await this.updateServiceHealth(service, status, message, details);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Alert management
    this.app.get('/api/alerts', async (req, res) => {
      try {
        const { status, severity, service } = req.query;
        const alerts = await this.getAlerts(status, severity, service);
        res.json({ success: true, data: alerts });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/alerts', async (req, res) => {
      try {
        const { service, metric, condition, threshold, severity, message } = req.body;
        const alert = await this.createAlert(service, metric, condition, threshold, severity, message);
        res.json({ success: true, data: alert });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.put('/api/alerts/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const alert = await this.updateAlert(id, updates);
        res.json({ success: true, data: alert });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.delete('/api/alerts/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await this.deleteAlert(id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/alerts/:id/acknowledge', async (req, res) => {
      try {
        const { id } = req.params;
        const { acknowledgedBy, note } = req.body;
        await this.acknowledgeAlert(id, acknowledgedBy, note);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/alerts/:id/resolve', async (req, res) => {
      try {
        const { id } = req.params;
        const { resolvedBy, resolution } = req.body;
        await this.resolveAlert(id, resolvedBy, resolution);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Incident management
    this.app.get('/api/incidents', async (req, res) => {
      try {
        const { status, severity } = req.query;
        const incidents = await this.getIncidents(status, severity);
        res.json({ success: true, data: incidents });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/incidents', async (req, res) => {
      try {
        const { title, description, severity, affectedServices, alerts } = req.body;
        const incident = await this.createIncident(title, description, severity, affectedServices, alerts);
        res.json({ success: true, data: incident });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.put('/api/incidents/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const incident = await this.updateIncident(id, updates);
        res.json({ success: true, data: incident });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/incidents/:id/close', async (req, res) => {
      try {
        const { id } = req.params;
        const { closedBy, resolution } = req.body;
        await this.closeIncident(id, closedBy, resolution);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Notification management
    this.app.get('/api/notifications', async (req, res) => {
      try {
        const { unread } = req.query;
        const notifications = await this.getNotifications(unread === 'true');
        res.json({ success: true, data: notifications });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/notifications', async (req, res) => {
      try {
        const { type, title, message, severity, channels } = req.body;
        const notification = await this.sendNotification(type, title, message, severity, channels);
        res.json({ success: true, data: notification });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.put('/api/notifications/:id/read', async (req, res) => {
      try {
        const { id } = req.params;
        await this.markNotificationRead(id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Dashboard data
    this.app.get('/api/dashboard/overview', async (req, res) => {
      try {
        const overview = await this.getDashboardOverview();
        res.json({ success: true, data: overview });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/dashboard/services', async (req, res) => {
      try {
        const services = await this.getServiceStatus();
        res.json({ success: true, data: services });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/dashboard/metrics', async (req, res) => {
      try {
        const { period = '1h', service } = req.query;
        const metrics = await this.getDashboardMetrics(period, service);
        res.json({ success: true, data: metrics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Real-time updates
    this.app.get('/api/stream', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      const clientId = crypto.randomUUID();
      this.subscribers.set(clientId, res);

      req.on('close', () => {
        this.subscribers.delete(clientId);
      });

      // Send initial data
      this.sendToClient(clientId, {
        type: 'connected',
        data: { clientId, timestamp: new Date().toISOString() }
      });
    });
  }

  setupMonitoring() {
    // Monitor system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Monitor service health every minute
    setInterval(() => {
      this.checkServiceHealth();
    }, 60000);

    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  setupAlerting() {
    // Check alert conditions every 30 seconds
    setInterval(() => {
      this.checkAlertConditions();
    }, 30000);

    // Process incident escalation every 5 minutes
    setInterval(() => {
      this.processIncidentEscalation();
    }, 300000);
  }

  initializeDefaultRules() {
    // Default alert rules
    this.alertRules.set('high_cpu', {
      service: 'system',
      metric: 'cpu_usage',
      condition: '>',
      threshold: 80,
      severity: 'warning',
      message: 'High CPU usage detected'
    });

    this.alertRules.set('high_memory', {
      service: 'system',
      metric: 'memory_usage',
      condition: '>',
      threshold: 85,
      severity: 'warning',
      message: 'High memory usage detected'
    });

    this.alertRules.set('api_error_rate', {
      service: 'api',
      metric: 'error_rate',
      condition: '>',
      threshold: 5,
      severity: 'critical',
      message: 'High API error rate detected'
    });

    this.alertRules.set('response_time', {
      service: 'api',
      metric: 'response_time',
      condition: '>',
      threshold: 5000,
      severity: 'warning',
      message: 'High API response time detected'
    });

    this.alertRules.set('service_down', {
      service: '*',
      metric: 'status',
      condition: '==',
      threshold: 'down',
      severity: 'critical',
      message: 'Service is down'
    });
  }

  async collectSystemMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version
    };

    this.metrics.set(`system_${Date.now()}`, metrics);

    // Calculate derived metrics
    const memoryUsage = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    const cpuUsage = metrics.cpu.user / 1000000; // Convert to seconds

    await this.recordMetric('system', 'cpu_usage', cpuUsage);
    await this.recordMetric('system', 'memory_usage', memoryUsage);
    await this.recordMetric('system', 'uptime', metrics.uptime);
  }

  async checkServiceHealth() {
    const services = ['api', 'admin', 'analytics', 'production', 'integration'];
    
    for (const service of services) {
      try {
        const port = this.getServicePort(service);
        const response = await fetch(`http://localhost:${port}/health`, {
          timeout: 5000
        });
        
        const health = {
          service,
          status: response.ok ? 'healthy' : 'unhealthy',
          port,
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - Date.now() // Mock response time
        };

        this.healthChecks.set(service, health);
        await this.recordMetric(service, 'status', response.ok ? 1 : 0);
        
      } catch (error) {
        const health = {
          service,
          status: 'unhealthy',
          port: this.getServicePort(service),
          error: error.message,
          lastCheck: new Date().toISOString()
        };

        this.healthChecks.set(service, health);
        await this.recordMetric(service, 'status', 0);
      }
    }
  }

  getServicePort(service) {
    const ports = {
      'api': 3001,
      'admin': 8081,
      'analytics': 8082,
      'production': 8080,
      'integration': 8084
    };
    return ports[service] || 8080;
  }

  async recordMetric(service, metric, value, tags = {}) {
    const metricData = {
      id: crypto.randomUUID(),
      service,
      metric,
      value,
      tags,
      timestamp: new Date().toISOString()
    };

    this.metrics.set(metricData.id, metricData);
    
    // Check if this metric triggers any alerts
    await this.checkMetricAlerts(service, metric, value);
  }

  async checkMetricAlerts(service, metric, value) {
    for (const [ruleId, rule] of this.alertRules.entries()) {
      if ((rule.service === service || rule.service === '*') && rule.metric === metric) {
        const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold);
        
        if (shouldAlert) {
          await this.createAlert(
            service,
            metric,
            rule.condition,
            rule.threshold,
            rule.severity,
            rule.message,
            { value, ruleId }
          );
        }
      }
    }
  }

  evaluateCondition(value, condition, threshold) {
    switch (condition) {
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      case '!=':
        return value !== threshold;
      default:
        return false;
    }
  }

  async createAlert(service, metric, condition, threshold, severity, message, details = {}) {
    const alertId = crypto.randomUUID();
    const alert = {
      id: alertId,
      service,
      metric,
      condition,
      threshold,
      severity,
      message,
      details,
      status: 'active',
      createdAt: new Date().toISOString(),
      acknowledgedAt: null,
      resolvedAt: null,
      acknowledgedBy: null,
      resolvedBy: null
    };

    this.alerts.set(alertId, alert);
    
    // Send notification
    await this.sendNotification('alert', `Alert: ${message}`, 
      `${service} - ${metric} ${condition} ${threshold}`, severity, ['dashboard']);

    // Check if this should create an incident
    if (severity === 'critical') {
      await this.checkIncidentCreation(alert);
    }

    return alert;
  }

  async checkIncidentCreation(alert) {
    // Check if there's already an active incident for this service
    const existingIncident = Array.from(this.incidents.values())
      .find(incident => 
        incident.status === 'active' && 
        incident.affectedServices.includes(alert.service)
      );

    if (!existingIncident) {
      await this.createIncident(
        `Critical Alert: ${alert.message}`,
        `Service ${alert.service} is experiencing issues. ${alert.details.value}`,
        'high',
        [alert.service],
        [alert.id]
      );
    } else {
      // Add alert to existing incident
      existingIncident.alerts.push(alert.id);
      this.incidents.set(existingIncident.id, existingIncident);
    }
  }

  async createIncident(title, description, severity, affectedServices, alerts) {
    const incidentId = crypto.randomUUID();
    const incident = {
      id: incidentId,
      title,
      description,
      severity,
      affectedServices,
      alerts,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
      closedBy: null,
      resolution: null
    };

    this.incidents.set(incidentId, incident);
    
    // Send notification
    await this.sendNotification('incident', `Incident: ${title}`, 
      description, severity, ['dashboard', 'email']);

    return incident;
  }

  async sendNotification(type, title, message, severity, channels) {
    const notificationId = crypto.randomUUID();
    const notification = {
      id: notificationId,
      type,
      title,
      message,
      severity,
      channels,
      read: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);

    // Send to all subscribers
    this.broadcastToSubscribers({
      type: 'notification',
      data: notification
    });

    return notification;
  }

  broadcastToSubscribers(data) {
    for (const [clientId, res] of this.subscribers.entries()) {
      this.sendToClient(clientId, data);
    }
  }

  sendToClient(clientId, data) {
    const res = this.subscribers.get(clientId);
    if (res) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  async getAllMetrics() {
    return Array.from(this.metrics.values()).slice(-1000); // Last 1000 metrics
  }

  async getServiceMetrics(service) {
    return Array.from(this.metrics.values())
      .filter(m => m.service === service)
      .slice(-100);
  }

  async getSystemHealth() {
    const services = Array.from(this.healthChecks.values());
    const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      overall: overallHealth,
      services,
      timestamp: new Date().toISOString()
    };
  }

  async getServiceHealth(service) {
    return this.healthChecks.get(service) || {
      service,
      status: 'unknown',
      lastCheck: new Date().toISOString()
    };
  }

  async updateServiceHealth(service, status, message, details) {
    const health = {
      service,
      status,
      message,
      details,
      lastCheck: new Date().toISOString()
    };

    this.healthChecks.set(service, health);
  }

  async getAlerts(status, severity, service) {
    let alerts = Array.from(this.alerts.values());

    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }

    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    if (service) {
      alerts = alerts.filter(a => a.service === service);
    }

    return alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateAlert(id, updates) {
    const alert = this.alerts.get(id);
    if (alert) {
      Object.assign(alert, updates);
      this.alerts.set(id, alert);
    }
    return alert;
  }

  async deleteAlert(id) {
    this.alerts.delete(id);
  }

  async acknowledgeAlert(id, acknowledgedBy, note) {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = acknowledgedBy;
      alert.note = note;
      this.alerts.set(id, alert);
    }
  }

  async resolveAlert(id, resolvedBy, resolution) {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = resolvedBy;
      alert.resolution = resolution;
      this.alerts.set(id, alert);
    }
  }

  async getIncidents(status, severity) {
    let incidents = Array.from(this.incidents.values());

    if (status) {
      incidents = incidents.filter(i => i.status === status);
    }

    if (severity) {
      incidents = incidents.filter(i => i.severity === severity);
    }

    return incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateIncident(id, updates) {
    const incident = this.incidents.get(id);
    if (incident) {
      Object.assign(incident, updates);
      incident.updatedAt = new Date().toISOString();
      this.incidents.set(id, incident);
    }
    return incident;
  }

  async closeIncident(id, closedBy, resolution) {
    const incident = this.incidents.get(id);
    if (incident) {
      incident.status = 'closed';
      incident.closedAt = new Date().toISOString();
      incident.closedBy = closedBy;
      incident.resolution = resolution;
      this.incidents.set(id, incident);
    }
  }

  async getNotifications(unread = false) {
    let notifications = this.notifications;

    if (unread) {
      notifications = notifications.filter(n => !n.read);
    }

    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async markNotificationRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  async getDashboardOverview() {
    const activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'active').length;
    const activeIncidents = Array.from(this.incidents.values()).filter(i => i.status === 'active').length;
    const unreadNotifications = this.notifications.filter(n => !n.read).length;
    const services = Array.from(this.healthChecks.values());
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;

    return {
      timestamp: new Date().toISOString(),
      alerts: {
        active: activeAlerts,
        total: this.alerts.size
      },
      incidents: {
        active: activeIncidents,
        total: this.incidents.size
      },
      notifications: {
        unread: unreadNotifications,
        total: this.notifications.length
      },
      services: {
        healthy: healthyServices,
        total: totalServices,
        health: totalServices > 0 ? (healthyServices / totalServices) * 100 : 0
      }
    };
  }

  async getServiceStatus() {
    return Array.from(this.healthChecks.values());
  }

  async getDashboardMetrics(period, service) {
    const now = Date.now();
    const periodMs = this.parsePeriod(period);
    const cutoffTime = now - periodMs;

    let metrics = Array.from(this.metrics.values())
      .filter(m => new Date(m.timestamp).getTime() > cutoffTime);

    if (service) {
      metrics = metrics.filter(m => m.service === service);
    }

    return this.aggregateMetrics(metrics);
  }

  parsePeriod(period) {
    const periods = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    return periods[period] || periods['1h'];
  }

  aggregateMetrics(metrics) {
    const aggregated = {};
    
    metrics.forEach(metric => {
      const key = `${metric.service}_${metric.metric}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          service: metric.service,
          metric: metric.metric,
          values: [],
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity
        };
      }
      
      const agg = aggregated[key];
      agg.values.push(metric.value);
      agg.count++;
      agg.sum += metric.value;
      agg.min = Math.min(agg.min, metric.value);
      agg.max = Math.max(agg.max, metric.value);
    });

    // Calculate averages
    Object.values(aggregated).forEach(agg => {
      agg.average = agg.sum / agg.count;
    });

    return Object.values(aggregated);
  }

  async checkAlertConditions() {
    // This would check all active alerts against current metrics
    // For now, it's handled in recordMetric
  }

  async processIncidentEscalation() {
    // Check for incidents that need escalation
    const activeIncidents = Array.from(this.incidents.values())
      .filter(i => i.status === 'active');

    for (const incident of activeIncidents) {
      const age = Date.now() - new Date(incident.createdAt).getTime();
      const escalationTime = 30 * 60 * 1000; // 30 minutes

      if (age > escalationTime && incident.severity !== 'critical') {
        incident.severity = 'critical';
        this.incidents.set(incident.id, incident);
        
        await this.sendNotification('escalation', 
          `Incident Escalated: ${incident.title}`,
          `Incident has been escalated to critical severity`,
          'critical',
          ['dashboard', 'email', 'slack']
        );
      }
    }
  }

  async cleanupOldMetrics() {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [id, metric] of this.metrics.entries()) {
      if (new Date(metric.timestamp).getTime() < cutoffTime) {
        this.metrics.delete(id);
      }
    }
  }

  logRequest(req) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // Store in metrics for analysis
    this.recordMetric('monitoring', 'request_count', 1, {
      method: req.method,
      endpoint: req.url.split('?')[0]
    });
  }

  generateMonitoringDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightDom Monitoring Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #0f172a;
            color: #ffffff;
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
        .status.warning {
            background: #f59e0b;
            color: white;
        }
        .status.critical {
            background: #dc2626;
            color: white;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: #334155;
            border-radius: 4px;
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
        .alert-item {
            background: #334155;
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
            border-left: 4px solid #ef4444;
        }
        .alert-item.warning {
            border-left-color: #f59e0b;
        }
        .alert-item.critical {
            border-left-color: #dc2626;
        }
        .incident-item {
            background: #334155;
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
            border-left: 4px solid #dc2626;
        }
        .notification-item {
            background: #334155;
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
        }
        .notification-item.unread {
            background: #475569;
        }
        .refresh-btn {
            background: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
        }
        .refresh-btn:hover {
            background: #059669;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid #334155;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        .tab.active {
            border-bottom-color: #3b82f6;
            color: #3b82f6;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 LightDom Monitoring Dashboard</h1>
        <button class="refresh-btn" onclick="refreshData()">Refresh Data</button>
    </div>

    <div class="container">
        <div class="tabs">
            <div class="tab active" onclick="switchTab('overview')">Overview</div>
            <div class="tab" onclick="switchTab('services')">Services</div>
            <div class="tab" onclick="switchTab('alerts')">Alerts</div>
            <div class="tab" onclick="switchTab('incidents')">Incidents</div>
            <div class="tab" onclick="switchTab('metrics')">Metrics</div>
            <div class="tab" onclick="switchTab('notifications')">Notifications</div>
        </div>

        <div id="overview" class="tab-content active">
            <div class="grid">
                <div class="card">
                    <h3>System Overview</h3>
                    <div id="system-overview">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Active Alerts</h3>
                    <div id="active-alerts">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Active Incidents</h3>
                    <div id="active-incidents">Loading...</div>
                </div>
                
                <div class="card">
                    <h3>Service Health</h3>
                    <div id="service-health">Loading...</div>
                </div>
            </div>
        </div>

        <div id="services" class="tab-content">
            <div class="card">
                <h3>Service Status</h3>
                <div id="service-status">Loading...</div>
            </div>
        </div>

        <div id="alerts" class="tab-content">
            <div class="card">
                <h3>All Alerts</h3>
                <div id="all-alerts">Loading...</div>
            </div>
        </div>

        <div id="incidents" class="tab-content">
            <div class="card">
                <h3>All Incidents</h3>
                <div id="all-incidents">Loading...</div>
            </div>
        </div>

        <div id="metrics" class="tab-content">
            <div class="card">
                <h3>System Metrics</h3>
                <div id="system-metrics">Loading...</div>
            </div>
        </div>

        <div id="notifications" class="tab-content">
            <div class="card">
                <h3>Notifications</h3>
                <div id="all-notifications">Loading...</div>
            </div>
        </div>
    </div>

    <script>
        let eventSource = null;

        // Tab switching
        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
            
            loadTabData(tabName);
        }

        // Load tab data
        async function loadTabData(tabName) {
            switch (tabName) {
                case 'overview':
                    await loadOverview();
                    break;
                case 'services':
                    await loadServices();
                    break;
                case 'alerts':
                    await loadAlerts();
                    break;
                case 'incidents':
                    await loadIncidents();
                    break;
                case 'metrics':
                    await loadMetrics();
                    break;
                case 'notifications':
                    await loadNotifications();
                    break;
            }
        }

        // API calls
        async function apiCall(url) {
            try {
                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                console.error('API call failed:', error);
                return null;
            }
        }

        // Overview data
        async function loadOverview() {
            const data = await apiCall('/api/dashboard/overview');
            if (data && data.success) {
                const overview = data.data;
                
                document.getElementById('system-overview').innerHTML = \`
                    <div class="metric">
                        <span>Overall Health:</span>
                        <span class="status \${overview.services.health > 80 ? 'healthy' : overview.services.health > 60 ? 'warning' : 'unhealthy'}">\${overview.services.health.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Healthy Services:</span>
                        <span>\${overview.services.healthy}/\${overview.services.total}</span>
                    </div>
                    <div class="metric">
                        <span>Active Alerts:</span>
                        <span>\${overview.alerts.active}</span>
                    </div>
                    <div class="metric">
                        <span>Active Incidents:</span>
                        <span>\${overview.incidents.active}</span>
                    </div>
                \`;
                
                document.getElementById('active-alerts').innerHTML = \`
                    <div class="metric">
                        <span>Total Alerts:</span>
                        <span>\${overview.alerts.total}</span>
                    </div>
                    <div class="metric">
                        <span>Active Alerts:</span>
                        <span>\${overview.alerts.active}</span>
                    </div>
                \`;
                
                document.getElementById('active-incidents').innerHTML = \`
                    <div class="metric">
                        <span>Total Incidents:</span>
                        <span>\${overview.incidents.total}</span>
                    </div>
                    <div class="metric">
                        <span>Active Incidents:</span>
                        <span>\${overview.incidents.active}</span>
                    </div>
                \`;
                
                document.getElementById('service-health').innerHTML = \`
                    <div class="metric">
                        <span>Health Score:</span>
                        <span>\${overview.services.health.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Healthy Services:</span>
                        <span>\${overview.services.healthy}</span>
                    </div>
                    <div class="metric">
                        <span>Total Services:</span>
                        <span>\${overview.services.total}</span>
                    </div>
                \`;
            }
        }

        // Services data
        async function loadServices() {
            const data = await apiCall('/api/dashboard/services');
            if (data && data.success) {
                const services = data.data;
                let html = '';
                
                services.forEach(service => {
                    html += \`
                        <div class="metric">
                            <span>\${service.service}:</span>
                            <span class="status \${service.status}">\${service.status}</span>
                        </div>
                        <div class="metric">
                            <span>Port:</span>
                            <span>\${service.port}</span>
                        </div>
                        <div class="metric">
                            <span>Last Check:</span>
                            <span>\${new Date(service.lastCheck).toLocaleString()}</span>
                        </div>
                        <hr style="border-color: #334155; margin: 10px 0;">
                    \`;
                });
                
                document.getElementById('service-status').innerHTML = html;
            }
        }

        // Alerts data
        async function loadAlerts() {
            const data = await apiCall('/api/alerts');
            if (data && data.success) {
                const alerts = data.data;
                let html = '';
                
                alerts.forEach(alert => {
                    html += \`
                        <div class="alert-item \${alert.severity}">
                            <div class="metric">
                                <span>Service:</span>
                                <span>\${alert.service}</span>
                            </div>
                            <div class="metric">
                                <span>Metric:</span>
                                <span>\${alert.metric}</span>
                            </div>
                            <div class="metric">
                                <span>Severity:</span>
                                <span class="status \${alert.severity}">\${alert.severity}</span>
                            </div>
                            <div class="metric">
                                <span>Message:</span>
                                <span>\${alert.message}</span>
                            </div>
                            <div class="metric">
                                <span>Status:</span>
                                <span>\${alert.status}</span>
                            </div>
                            <div class="metric">
                                <span>Created:</span>
                                <span>\${new Date(alert.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                                <button class="btn" onclick="acknowledgeAlert('\${alert.id}')">Acknowledge</button>
                                <button class="btn btn-success" onclick="resolveAlert('\${alert.id}')">Resolve</button>
                            </div>
                        </div>
                    \`;
                });
                
                document.getElementById('all-alerts').innerHTML = html;
            }
        }

        // Incidents data
        async function loadIncidents() {
            const data = await apiCall('/api/incidents');
            if (data && data.success) {
                const incidents = data.data;
                let html = '';
                
                incidents.forEach(incident => {
                    html += \`
                        <div class="incident-item">
                            <div class="metric">
                                <span>Title:</span>
                                <span>\${incident.title}</span>
                            </div>
                            <div class="metric">
                                <span>Severity:</span>
                                <span class="status \${incident.severity}">\${incident.severity}</span>
                            </div>
                            <div class="metric">
                                <span>Status:</span>
                                <span>\${incident.status}</span>
                            </div>
                            <div class="metric">
                                <span>Affected Services:</span>
                                <span>\${incident.affectedServices.join(', ')}</span>
                            </div>
                            <div class="metric">
                                <span>Created:</span>
                                <span>\${new Date(incident.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                                <button class="btn btn-success" onclick="closeIncident('\${incident.id}')">Close</button>
                            </div>
                        </div>
                    \`;
                });
                
                document.getElementById('all-incidents').innerHTML = html;
            }
        }

        // Metrics data
        async function loadMetrics() {
            const data = await apiCall('/api/dashboard/metrics?period=1h');
            if (data && data.success) {
                const metrics = data.data;
                let html = '';
                
                metrics.forEach(metric => {
                    html += \`
                        <div class="metric">
                            <span>\${metric.service} - \${metric.metric}:</span>
                            <span>Avg: \${metric.average.toFixed(2)}, Min: \${metric.min.toFixed(2)}, Max: \${metric.max.toFixed(2)}</span>
                        </div>
                    \`;
                });
                
                document.getElementById('system-metrics').innerHTML = html;
            }
        }

        // Notifications data
        async function loadNotifications() {
            const data = await apiCall('/api/notifications');
            if (data && data.success) {
                const notifications = data.data;
                let html = '';
                
                notifications.forEach(notification => {
                    html += \`
                        <div class="notification-item \${notification.read ? '' : 'unread'}">
                            <div class="metric">
                                <span>Type:</span>
                                <span>\${notification.type}</span>
                            </div>
                            <div class="metric">
                                <span>Title:</span>
                                <span>\${notification.title}</span>
                            </div>
                            <div class="metric">
                                <span>Message:</span>
                                <span>\${notification.message}</span>
                            </div>
                            <div class="metric">
                                <span>Severity:</span>
                                <span class="status \${notification.severity}">\${notification.severity}</span>
                            </div>
                            <div class="metric">
                                <span>Created:</span>
                                <span>\${new Date(notification.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                                <button class="btn" onclick="markNotificationRead('\${notification.id}')">Mark Read</button>
                            </div>
                        </div>
                    \`;
                });
                
                document.getElementById('all-notifications').innerHTML = html;
            }
        }

        // Alert management functions
        async function acknowledgeAlert(alertId) {
            try {
                const response = await apiCall(\`/api/alerts/\${alertId}/acknowledge\`, {
                    method: 'POST',
                    body: JSON.stringify({ acknowledgedBy: 'admin' })
                });
                if (response.success) {
                    alert('Alert acknowledged');
                    loadAlerts();
                }
            } catch (error) {
                alert('Failed to acknowledge alert: ' + error.message);
            }
        }

        async function resolveAlert(alertId) {
            try {
                const response = await apiCall(\`/api/alerts/\${alertId}/resolve\`, {
                    method: 'POST',
                    body: JSON.stringify({ resolvedBy: 'admin', resolution: 'Resolved by admin' })
                });
                if (response.success) {
                    alert('Alert resolved');
                    loadAlerts();
                }
            } catch (error) {
                alert('Failed to resolve alert: ' + error.message);
            }
        }

        async function closeIncident(incidentId) {
            try {
                const response = await apiCall(\`/api/incidents/\${incidentId}/close\`, {
                    method: 'POST',
                    body: JSON.stringify({ closedBy: 'admin', resolution: 'Closed by admin' })
                });
                if (response.success) {
                    alert('Incident closed');
                    loadIncidents();
                }
            } catch (error) {
                alert('Failed to close incident: ' + error.message);
            }
        }

        async function markNotificationRead(notificationId) {
            try {
                const response = await apiCall(\`/api/notifications/\${notificationId}/read\`, {
                    method: 'PUT'
                });
                if (response.success) {
                    loadNotifications();
                }
            } catch (error) {
                alert('Failed to mark notification as read: ' + error.message);
            }
        }

        // Refresh all data
        async function refreshData() {
            await loadOverview();
            await loadServices();
            await loadAlerts();
            await loadIncidents();
            await loadMetrics();
            await loadNotifications();
        }

        // Real-time updates
        function startRealTimeUpdates() {
            eventSource = new EventSource('/api/stream');
            
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                console.log('Real-time update:', data);
                
                // Refresh data when we receive updates
                if (data.type === 'notification' || data.type === 'alert' || data.type === 'incident') {
                    refreshData();
                }
            };
            
            eventSource.onerror = function(event) {
                console.error('EventSource failed:', event);
            };
        }

        // Initial load
        loadOverview();
        startRealTimeUpdates();
        
        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
    </script>
</body>
</html>
    `;
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`🏥 LightDom Monitoring System running on port ${this.port}`);
      console.log(`📊 Monitoring Dashboard: http://localhost:${this.port}`);
    });
  }
}

// Start monitoring system
const monitoringSystem = new LightDomMonitoringSystem();
monitoringSystem.start();

export { LightDomMonitoringSystem };
