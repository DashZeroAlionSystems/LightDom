#!/usr/bin/env node

/**
 * LightDom Monitoring and Analytics Server
 * Provides comprehensive monitoring, metrics, and analytics
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LightDomMonitoringServer {
  constructor() {
    this.app = express();
    this.port = process.env.MONITORING_PORT || 9090;
    this.metricsPath = process.env.METRICS_PATH || '/metrics';
    
    this.metrics = {
      system: {},
      services: {},
      performance: {},
      errors: [],
      alerts: []
    };
    
    this.setupMiddleware();
    this.setupRoutes();
    this.startMetricsCollection();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(join(__dirname, '..', 'public')));
    
    // CORS for monitoring endpoints
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  setupRoutes() {
    // Metrics endpoint (Prometheus format)
    this.app.get(this.metricsPath, (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(this.generatePrometheusMetrics());
    });

    // JSON metrics endpoint
    this.app.get('/api/metrics', (req, res) => {
      res.json({
        success: true,
        data: this.metrics,
        timestamp: new Date().toISOString()
      });
    });

    // System health endpoint
    this.app.get('/api/health', async (req, res) => {
      try {
        const health = await this.getSystemHealth();
        res.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Performance analytics
    this.app.get('/api/analytics/performance', (req, res) => {
      res.json({
        success: true,
        data: this.getPerformanceAnalytics(),
        timestamp: new Date().toISOString()
      });
    });

    // Error analytics
    this.app.get('/api/analytics/errors', (req, res) => {
      res.json({
        success: true,
        data: this.getErrorAnalytics(),
        timestamp: new Date().toISOString()
      });
    });

    // Service status
    this.app.get('/api/services/status', async (req, res) => {
      try {
        const status = await this.getServicesStatus();
        res.json({
          success: true,
          data: status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Dashboard endpoint
    this.app.get('/dashboard', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // Alert management
    this.app.post('/api/alerts', (req, res) => {
      const { type, message, severity } = req.body;
      this.addAlert(type, message, severity);
      res.json({ success: true, message: 'Alert added' });
    });

    this.app.get('/api/alerts', (req, res) => {
      res.json({
        success: true,
        data: this.metrics.alerts,
        timestamp: new Date().toISOString()
      });
    });
  }

  startMetricsCollection() {
    // Collect system metrics every 10 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 10000);

    // Collect service metrics every 30 seconds
    setInterval(() => {
      this.collectServiceMetrics();
    }, 30000);

    // Collect performance metrics every 60 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000);

    // Clean up old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 300000);
  }

  collectSystemMetrics() {
    this.metrics.system = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: process.cpuUsage(),
      platform: os.platform(),
      arch: os.arch(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      cpus: os.cpus().length,
      networkInterfaces: Object.keys(os.networkInterfaces()).length
    };
  }

  async collectServiceMetrics() {
    const services = [
      { name: 'api-server', url: 'http://localhost:3001/api/health' },
      { name: 'frontend', url: 'http://localhost:3000' },
      { name: 'blockchain', url: 'http://localhost:3001/api/blockchain/stats' },
      { name: 'crawler', url: 'http://localhost:3001/api/crawler/stats' }
    ];

    this.metrics.services = {};

    for (const service of services) {
      try {
        const startTime = Date.now();
        const response = await fetch(service.url);
        const responseTime = Date.now() - startTime;
        
        this.metrics.services[service.name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date().toISOString(),
          statusCode: response.status
        };
      } catch (error) {
        this.metrics.services[service.name] = {
          status: 'unhealthy',
          error: error.message,
          lastCheck: new Date().toISOString(),
          responseTime: null
        };
      }
    }
  }

  collectPerformanceMetrics() {
    const now = Date.now();
    
    // Calculate performance metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.performance = {
      timestamp: new Date().toISOString(),
      memory: {
        usage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    };

    // Check for performance alerts
    this.checkPerformanceAlerts();
  }

  checkPerformanceAlerts() {
    const memoryUsage = (this.metrics.system.memory.used / this.metrics.system.memory.total) * 100;
    const loadAverage = this.metrics.system.loadAverage[0];
    
    if (memoryUsage > 90) {
      this.addAlert('memory', `High memory usage: ${memoryUsage.toFixed(1)}%`, 'warning');
    }
    
    if (loadAverage > 5) {
      this.addAlert('cpu', `High CPU load: ${loadAverage.toFixed(2)}`, 'warning');
    }
    
    // Check service health
    for (const [serviceName, service] of Object.entries(this.metrics.services)) {
      if (service.status === 'unhealthy') {
        this.addAlert('service', `Service ${serviceName} is unhealthy`, 'error');
      }
    }
  }

  addAlert(type, message, severity = 'info') {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts = this.metrics.alerts.slice(-100);
    }
    
    console.log(`🚨 [${severity.toUpperCase()}] ${type}: ${message}`);
  }

  async getSystemHealth() {
    const health = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      services: this.metrics.services,
      system: {
        uptime: process.uptime(),
        memory: this.metrics.system.memory,
        cpu: this.metrics.system.cpu,
        loadAverage: this.metrics.system.loadAverage
      },
      alerts: this.metrics.alerts.filter(alert => 
        new Date(alert.timestamp) > new Date(Date.now() - 3600000) // Last hour
      )
    };

    // Determine overall health
    const unhealthyServices = Object.values(health.services)
      .filter(service => service.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      health.overall = 'unhealthy';
    }

    return health;
  }

  async getServicesStatus() {
    const status = {};
    
    for (const [serviceName, service] of Object.entries(this.metrics.services)) {
      status[serviceName] = {
        ...service,
        uptime: service.lastCheck ? 
          (Date.now() - new Date(service.lastCheck).getTime()) / 1000 : 0
      };
    }
    
    return status;
  }

  getPerformanceAnalytics() {
    return {
      memory: {
        current: this.metrics.performance.memory.usage,
        trend: this.calculateTrend('memory'),
        peak: this.getPeakValue('memory')
      },
      cpu: {
        current: this.metrics.performance.cpu.user,
        trend: this.calculateTrend('cpu'),
        peak: this.getPeakValue('cpu')
      },
      uptime: this.metrics.performance.uptime,
      loadAverage: this.metrics.performance.loadAverage
    };
  }

  getErrorAnalytics() {
    const errors = this.metrics.errors;
    const last24Hours = errors.filter(error => 
      new Date(error.timestamp) > new Date(Date.now() - 86400000)
    );
    
    return {
      total: errors.length,
      last24Hours: last24Hours.length,
      byType: this.groupByType(errors),
      recent: errors.slice(-10)
    };
  }

  groupByType(items) {
    const grouped = {};
    items.forEach(item => {
      const type = item.type || 'unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return grouped;
  }

  calculateTrend(metric) {
    // Simple trend calculation (would need historical data in real implementation)
    return 'stable';
  }

  getPeakValue(metric) {
    // Return peak value (would need historical data in real implementation)
    return this.metrics.performance[metric]?.usage || 0;
  }

  cleanupOldData() {
    const oneHourAgo = Date.now() - 3600000;
    
    // Clean up old errors
    this.metrics.errors = this.metrics.errors.filter(error => 
      new Date(error.timestamp).getTime() > oneHourAgo
    );
    
    // Clean up old alerts
    this.metrics.alerts = this.metrics.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }

  generatePrometheusMetrics() {
    let metrics = '';
    
    // System metrics
    metrics += `# HELP lightdom_system_uptime_seconds System uptime in seconds\n`;
    metrics += `# TYPE lightdom_system_uptime_seconds counter\n`;
    metrics += `lightdom_system_uptime_seconds ${this.metrics.system.uptime || 0}\n\n`;
    
    metrics += `# HELP lightdom_system_memory_usage_bytes System memory usage in bytes\n`;
    metrics += `# TYPE lightdom_system_memory_usage_bytes gauge\n`;
    metrics += `lightdom_system_memory_usage_bytes ${this.metrics.system.memory?.used || 0}\n\n`;
    
    // Service metrics
    for (const [serviceName, service] of Object.entries(this.metrics.services)) {
      metrics += `# HELP lightdom_service_status Service status (1=healthy, 0=unhealthy)\n`;
      metrics += `# TYPE lightdom_service_status gauge\n`;
      metrics += `lightdom_service_status{service="${serviceName}"} ${service.status === 'healthy' ? 1 : 0}\n`;
      
      if (service.responseTime) {
        metrics += `# HELP lightdom_service_response_time_seconds Service response time in seconds\n`;
        metrics += `# TYPE lightdom_service_response_time_seconds gauge\n`;
        metrics += `lightdom_service_response_time_seconds{service="${serviceName}"} ${service.responseTime / 1000}\n`;
      }
    }
    
    return metrics;
  }

  generateDashboardHTML() {
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
            padding: 20px;
            background: #0f172a;
            color: #ffffff;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
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
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .alert {
            background: #fef3c7;
            color: #92400e;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .alert.error {
            background: #fee2e2;
            color: #991b1b;
        }
        .alert.warning {
            background: #fef3c7;
            color: #92400e;
        }
        .refresh-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
        }
        .refresh-btn:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LightDom Monitoring Dashboard</h1>
            <button class="refresh-btn" onclick="refreshData()">Refresh Data</button>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>System Health</h3>
                <div id="system-health">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Services Status</h3>
                <div id="services-status">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Performance Metrics</h3>
                <div id="performance-metrics">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Recent Alerts</h3>
                <div id="recent-alerts">Loading...</div>
            </div>
        </div>
    </div>

    <script>
        async function fetchData(url) {
            try {
                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                console.error('Failed to fetch data:', error);
                return null;
            }
        }

        async function refreshData() {
            await Promise.all([
                updateSystemHealth(),
                updateServicesStatus(),
                updatePerformanceMetrics(),
                updateRecentAlerts()
            ]);
        }

        async function updateSystemHealth() {
            const data = await fetchData('/api/health');
            if (data && data.success) {
                const health = data.data;
                document.getElementById('system-health').innerHTML = \`
                    <div class="metric">
                        <span>Overall Status:</span>
                        <span class="status \${health.overall}">\${health.overall}</span>
                    </div>
                    <div class="metric">
                        <span>Uptime:</span>
                        <span>\${Math.floor(health.system.uptime / 3600)}h \${Math.floor((health.system.uptime % 3600) / 60)}m</span>
                    </div>
                    <div class="metric">
                        <span>Memory Usage:</span>
                        <span>\${(health.system.memory.used / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div class="metric">
                        <span>Load Average:</span>
                        <span>\${health.system.loadAverage[0].toFixed(2)}</span>
                    </div>
                \`;
            }
        }

        async function updateServicesStatus() {
            const data = await fetchData('/api/services/status');
            if (data && data.success) {
                const services = data.data;
                let html = '';
                for (const [name, service] of Object.entries(services)) {
                    html += \`
                        <div class="metric">
                            <span>\${name}:</span>
                            <span class="status \${service.status}">\${service.status}</span>
                        </div>
                    \`;
                }
                document.getElementById('services-status').innerHTML = html;
            }
        }

        async function updatePerformanceMetrics() {
            const data = await fetchData('/api/analytics/performance');
            if (data && data.success) {
                const perf = data.data;
                document.getElementById('performance-metrics').innerHTML = \`
                    <div class="metric">
                        <span>Memory Usage:</span>
                        <span>\${perf.memory.current.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>CPU Usage:</span>
                        <span>\${perf.cpu.current.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Load Average:</span>
                        <span>\${perf.loadAverage[0].toFixed(2)}</span>
                    </div>
                \`;
            }
        }

        async function updateRecentAlerts() {
            const data = await fetchData('/api/alerts');
            if (data && data.success) {
                const alerts = data.data.slice(-5); // Last 5 alerts
                let html = '';
                alerts.forEach(alert => {
                    html += \`
                        <div class="alert \${alert.severity}">
                            <strong>\${alert.type}:</strong> \${alert.message}
                            <br><small>\${new Date(alert.timestamp).toLocaleString()}</small>
                        </div>
                    \`;
                });
                document.getElementById('recent-alerts').innerHTML = html || 'No recent alerts';
            }
        }

        // Initial load
        refreshData();
        
        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
    </script>
</body>
</html>
    `;
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`📊 LightDom Monitoring Server running on port ${this.port}`);
      console.log(`📈 Metrics endpoint: http://localhost:${this.port}${this.metricsPath}`);
      console.log(`📊 Dashboard: http://localhost:${this.port}/dashboard`);
      console.log(`🏥 Health endpoint: http://localhost:${this.port}/api/health`);
    });
  }
}

// Start monitoring server
const monitoringServer = new LightDomMonitoringServer();
monitoringServer.start();

export { LightDomMonitoringServer };
