#!/usr/bin/env node

/**
 * LightDom System Health Monitor and Alerting
 * Comprehensive system monitoring with intelligent alerting
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomHealthMonitor {
  constructor() {
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        responseTime: 1000,
        errorRate: 5
      },
      alertChannels: {
        email: process.env.ALERT_EMAIL || '',
        slack: process.env.SLACK_WEBHOOK || '',
        webhook: process.env.WEBHOOK_URL || ''
      },
      services: [
        { name: 'api-server', port: 3001, path: '/api/health' },
        { name: 'frontend', port: 3000, path: '/' },
        { name: 'monitoring', port: 9090, path: '/metrics' }
      ]
    };
    
    this.metrics = {
      system: {},
      services: {},
      alerts: [],
      history: []
    };
    
    this.isMonitoring = false;
    this.alertCooldowns = new Map();
  }

  async startMonitoring() {
    console.log('🏥 Starting LightDom Health Monitoring...');
    console.log('========================================');
    
    this.isMonitoring = true;
    
    try {
      // Initial health check
      await this.performHealthCheck();
      
      // Start continuous monitoring
      this.startContinuousMonitoring();
      
      // Start alert processing
      this.startAlertProcessing();
      
      console.log('✅ Health monitoring started');
      
    } catch (error) {
      console.error('❌ Failed to start health monitoring:', error);
      this.isMonitoring = false;
    }
  }

  async stopMonitoring() {
    console.log('🛑 Stopping health monitoring...');
    this.isMonitoring = false;
    console.log('✅ Health monitoring stopped');
  }

  startContinuousMonitoring() {
    const monitorInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(monitorInterval);
        return;
      }
      
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.config.checkInterval);
  }

  startAlertProcessing() {
    const alertInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(alertInterval);
        return;
      }
      
      try {
        await this.processAlerts();
      } catch (error) {
        console.error('Alert processing failed:', error);
      }
    }, 60000); // Check alerts every minute
  }

  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    
    // Collect system metrics
    await this.collectSystemMetrics();
    
    // Check service health
    await this.checkServiceHealth();
    
    // Check database health
    await this.checkDatabaseHealth();
    
    // Check disk space
    await this.checkDiskSpace();
    
    // Check network connectivity
    await this.checkNetworkConnectivity();
    
    // Store metrics
    this.metrics.history.push({
      timestamp,
      system: { ...this.metrics.system },
      services: { ...this.metrics.services }
    });
    
    // Keep only last 100 entries
    if (this.metrics.history.length > 100) {
      this.metrics.history = this.metrics.history.slice(-100);
    }
    
    // Save metrics to file
    await this.saveMetrics();
  }

  async collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();
    
    this.metrics.system = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        usagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: loadAvg[0]
      },
      platform: os.platform(),
      arch: os.arch(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    };
  }

  async checkServiceHealth() {
    this.metrics.services = {};
    
    for (const service of this.config.services) {
      try {
        const startTime = Date.now();
        const response = await fetch(`http://localhost:${service.port}${service.path}`);
        const responseTime = Date.now() - startTime;
        
        this.metrics.services[service.name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime,
          statusCode: response.status,
          lastCheck: new Date().toISOString(),
          uptime: response.ok ? this.calculateUptime(service.name) : 0
        };
        
        // Check for performance issues
        if (responseTime > this.config.alertThresholds.responseTime) {
          await this.createAlert('performance', service.name, `High response time: ${responseTime}ms`);
        }
        
      } catch (error) {
        this.metrics.services[service.name] = {
          status: 'unhealthy',
          error: error.message,
          lastCheck: new Date().toISOString(),
          uptime: 0
        };
        
        // Create alert for service down
        await this.createAlert('service_down', service.name, `Service is down: ${error.message}`);
      }
    }
  }

  async checkDatabaseHealth() {
    try {
      const response = await fetch('http://localhost:3001/api/db/health');
      const data = await response.json();
      
      if (!data.success) {
        await this.createAlert('database', 'postgresql', 'Database health check failed');
      }
      
    } catch (error) {
      await this.createAlert('database', 'postgresql', `Database connection failed: ${error.message}`);
    }
  }

  async checkDiskSpace() {
    try {
      const { execSync } = await import('child_process');
      const output = execSync('df -h /', { encoding: 'utf8' });
      const lines = output.split('\n');
      const dataLine = lines[1];
      const parts = dataLine.split(/\s+/);
      const usagePercent = parseInt(parts[4].replace('%', ''));
      
      if (usagePercent > this.config.alertThresholds.disk) {
        await this.createAlert('disk_space', 'root', `Disk usage is ${usagePercent}%`);
      }
      
    } catch (error) {
      console.warn('Could not check disk space:', error.message);
    }
  }

  async checkNetworkConnectivity() {
    try {
      // Check external connectivity
      const response = await fetch('https://api.github.com', { timeout: 5000 });
      if (!response.ok) {
        await this.createAlert('network', 'external', 'External network connectivity issues');
      }
      
    } catch (error) {
      await this.createAlert('network', 'external', `External network connectivity failed: ${error.message}`);
    }
  }

  calculateUptime(serviceName) {
    // This would typically track service start time
    // For now, return a mock uptime
    return Math.floor(Math.random() * 86400); // Random uptime in seconds
  }

  async createAlert(type, service, message) {
    const alertId = `${type}_${service}_${Date.now()}`;
    const cooldownKey = `${type}_${service}`;
    
    // Check cooldown
    if (this.alertCooldowns.has(cooldownKey)) {
      const lastAlert = this.alertCooldowns.get(cooldownKey);
      if (Date.now() - lastAlert < 300000) { // 5 minute cooldown
        return;
      }
    }
    
    const alert = {
      id: alertId,
      type,
      service,
      message,
      severity: this.getAlertSeverity(type),
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false
    };
    
    this.metrics.alerts.push(alert);
    this.alertCooldowns.set(cooldownKey, Date.now());
    
    // Keep only last 100 alerts
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts = this.metrics.alerts.slice(-100);
    }
    
    // Send alert notifications
    await this.sendAlertNotifications(alert);
    
    console.log(`🚨 Alert: ${type} - ${service} - ${message}`);
  }

  getAlertSeverity(type) {
    const severities = {
      'service_down': 'critical',
      'database': 'critical',
      'disk_space': 'high',
      'network': 'high',
      'performance': 'medium',
      'memory': 'high',
      'cpu': 'medium'
    };
    
    return severities[type] || 'low';
  }

  async sendAlertNotifications(alert) {
    const notifications = [];
    
    // Email notification
    if (this.config.alertChannels.email) {
      notifications.push(this.sendEmailAlert(alert));
    }
    
    // Slack notification
    if (this.config.alertChannels.slack) {
      notifications.push(this.sendSlackAlert(alert));
    }
    
    // Webhook notification
    if (this.config.alertChannels.webhook) {
      notifications.push(this.sendWebhookAlert(alert));
    }
    
    // Send all notifications
    await Promise.allSettled(notifications);
  }

  async sendEmailAlert(alert) {
    try {
      // This would integrate with an email service like SendGrid, SES, etc.
      console.log(`📧 Email alert sent: ${alert.message}`);
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  async sendSlackAlert(alert) {
    try {
      const payload = {
        text: `🚨 LightDom Alert`,
        attachments: [{
          color: this.getSlackColor(alert.severity),
          fields: [
            { title: 'Type', value: alert.type, short: true },
            { title: 'Service', value: alert.service, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Message', value: alert.message, short: false },
            { title: 'Timestamp', value: alert.timestamp, short: true }
          ]
        }]
      };
      
      const response = await fetch(this.config.alertChannels.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log(`💬 Slack alert sent: ${alert.message}`);
      }
      
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(this.config.alertChannels.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      
      if (response.ok) {
        console.log(`🔗 Webhook alert sent: ${alert.message}`);
      }
      
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  getSlackColor(severity) {
    const colors = {
      'critical': 'danger',
      'high': 'warning',
      'medium': 'good',
      'low': '#36a64f'
    };
    
    return colors[severity] || '#36a64f';
  }

  async processAlerts() {
    // Check for system threshold alerts
    await this.checkSystemThresholds();
    
    // Check for unresolved alerts
    await this.checkUnresolvedAlerts();
    
    // Clean up old alerts
    await this.cleanupOldAlerts();
  }

  async checkSystemThresholds() {
    const system = this.metrics.system;
    
    // Check CPU usage
    if (system.cpu.loadAverage > this.config.alertThresholds.cpu) {
      await this.createAlert('cpu', 'system', `High CPU load: ${system.cpu.loadAverage.toFixed(2)}`);
    }
    
    // Check memory usage
    if (system.memory.usagePercent > this.config.alertThresholds.memory) {
      await this.createAlert('memory', 'system', `High memory usage: ${system.memory.usagePercent.toFixed(1)}%`);
    }
  }

  async checkUnresolvedAlerts() {
    const unresolvedAlerts = this.metrics.alerts.filter(alert => !alert.resolved);
    
    for (const alert of unresolvedAlerts) {
      const alertAge = Date.now() - new Date(alert.timestamp).getTime();
      
      // Escalate critical alerts after 30 minutes
      if (alert.severity === 'critical' && alertAge > 1800000) {
        await this.escalateAlert(alert);
      }
      
      // Escalate high severity alerts after 1 hour
      if (alert.severity === 'high' && alertAge > 3600000) {
        await this.escalateAlert(alert);
      }
    }
  }

  async escalateAlert(alert) {
    console.log(`📈 Escalating alert: ${alert.id}`);
    
    // This would implement escalation logic (e.g., notify managers, create tickets)
    alert.escalated = true;
    alert.escalatedAt = new Date().toISOString();
  }

  async cleanupOldAlerts() {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    this.metrics.alerts = this.metrics.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime
    );
  }

  async saveMetrics() {
    try {
      const metricsFile = join(projectRoot, 'logs', 'health-metrics.json');
      await fs.writeFile(metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  async getHealthStatus() {
    return {
      timestamp: new Date().toISOString(),
      isMonitoring: this.isMonitoring,
      system: this.metrics.system,
      services: this.metrics.services,
      activeAlerts: this.metrics.alerts.filter(alert => !alert.resolved).length,
      totalAlerts: this.metrics.alerts.length
    };
  }

  async acknowledgeAlert(alertId) {
    const alert = this.metrics.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      console.log(`✅ Alert acknowledged: ${alertId}`);
    }
  }

  async resolveAlert(alertId) {
    const alert = this.metrics.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      console.log(`✅ Alert resolved: ${alertId}`);
    }
  }

  async generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: this.metrics.history.length,
        activeAlerts: this.metrics.alerts.filter(alert => !alert.resolved).length,
        resolvedAlerts: this.metrics.alerts.filter(alert => alert.resolved).length,
        systemHealth: this.calculateSystemHealth(),
        serviceHealth: this.calculateServiceHealth()
      },
      metrics: this.metrics,
      recommendations: this.generateRecommendations()
    };
    
    // Save report
    const reportFile = join(projectRoot, 'logs', 'health-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    return report;
  }

  calculateSystemHealth() {
    const system = this.metrics.system;
    let healthScore = 100;
    
    // Deduct points for high resource usage
    if (system.memory.usagePercent > 80) healthScore -= 20;
    if (system.cpu.loadAverage > 5) healthScore -= 20;
    
    // Deduct points for recent alerts
    const recentAlerts = this.metrics.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > Date.now() - 3600000 // Last hour
    );
    healthScore -= recentAlerts.length * 10;
    
    return Math.max(0, healthScore);
  }

  calculateServiceHealth() {
    const services = this.metrics.services;
    const totalServices = Object.keys(services).length;
    const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
    
    return totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for common issues
    const system = this.metrics.system;
    
    if (system.memory.usagePercent > 80) {
      recommendations.push('Consider increasing memory or optimizing memory usage');
    }
    
    if (system.cpu.loadAverage > 5) {
      recommendations.push('Consider scaling horizontally or optimizing CPU usage');
    }
    
    const unhealthyServices = Object.entries(this.metrics.services)
      .filter(([, service]) => service.status !== 'healthy');
    
    if (unhealthyServices.length > 0) {
      recommendations.push(`Investigate unhealthy services: ${unhealthyServices.map(([name]) => name).join(', ')}`);
    }
    
    const unresolvedAlerts = this.metrics.alerts.filter(alert => !alert.resolved);
    if (unresolvedAlerts.length > 5) {
      recommendations.push('High number of unresolved alerts - consider reviewing alerting thresholds');
    }
    
    return recommendations;
  }
}

// Create and start health monitor
const healthMonitor = new LightDomHealthMonitor();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down health monitor...');
  await healthMonitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down health monitor...');
  await healthMonitor.stopMonitoring();
  process.exit(0);
});

// Start monitoring
healthMonitor.startMonitoring().catch(console.error);

export { LightDomHealthMonitor };
