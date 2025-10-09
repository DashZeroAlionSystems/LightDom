#!/usr/bin/env node

/**
 * LightDom Production Management Dashboard
 * Web-based dashboard for production management and monitoring
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomProductionDashboard {
  constructor() {
    this.app = express();
    this.port = process.env.DASHBOARD_PORT || 8080;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
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
  }

  setupRoutes() {
    // Dashboard home
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // System status
    this.app.get('/api/status', async (req, res) => {
      try {
        const status = await this.getSystemStatus();
        res.json({ success: true, data: status });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Service management
    this.app.post('/api/services/:service/start', async (req, res) => {
      try {
        await this.startService(req.params.service);
        res.json({ success: true, message: `Service ${req.params.service} started` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/services/:service/stop', async (req, res) => {
      try {
        await this.stopService(req.params.service);
        res.json({ success: true, message: `Service ${req.params.service} stopped` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/services/:service/restart', async (req, res) => {
      try {
        await this.restartService(req.params.service);
        res.json({ success: true, message: `Service ${req.params.service} restarted` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Deployment
    this.app.post('/api/deploy', async (req, res) => {
      try {
        const { environment = 'production' } = req.body;
        await this.deployApplication(environment);
        res.json({ success: true, message: 'Deployment started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Database operations
    this.app.post('/api/database/migrate', async (req, res) => {
      try {
        await this.runDatabaseMigrations();
        res.json({ success: true, message: 'Database migrations completed' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/database/backup', async (req, res) => {
      try {
        const backupFile = await this.createDatabaseBackup();
        res.json({ success: true, message: 'Database backup created', file: backupFile });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Monitoring
    this.app.get('/api/monitoring/metrics', async (req, res) => {
      try {
        const metrics = await this.getMonitoringMetrics();
        res.json({ success: true, data: metrics });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/monitoring/alerts', async (req, res) => {
      try {
        const alerts = await this.getAlerts();
        res.json({ success: true, data: alerts });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Logs
    this.app.get('/api/logs/:service', async (req, res) => {
      try {
        const { service } = req.params;
        const { lines = 100 } = req.query;
        const logs = await this.getServiceLogs(service, parseInt(lines));
        res.json({ success: true, data: logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Security
    this.app.post('/api/security/scan', async (req, res) => {
      try {
        await this.runSecurityScan();
        res.json({ success: true, message: 'Security scan started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Performance
    this.app.post('/api/performance/test', async (req, res) => {
      try {
        const { type = 'load' } = req.body;
        await this.runPerformanceTest(type);
        res.json({ success: true, message: 'Performance test started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Maintenance
    this.app.post('/api/maintenance/start', async (req, res) => {
      try {
        await this.startMaintenanceMode();
        res.json({ success: true, message: 'Maintenance mode started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/maintenance/stop', async (req, res) => {
      try {
        await this.stopMaintenanceMode();
        res.json({ success: true, message: 'Maintenance mode stopped' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  setupWebSocket() {
    // WebSocket for real-time updates
    this.app.get('/ws', (req, res) => {
      res.send('WebSocket endpoint - implement with ws library');
    });
  }

  async getSystemStatus() {
    const services = [
      { name: 'api-server', port: 3001, path: '/api/health' },
      { name: 'frontend', port: 3000, path: '/' },
      { name: 'monitoring', port: 9090, path: '/metrics' }
    ];

    const status = {
      timestamp: new Date().toISOString(),
      services: {},
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    for (const service of services) {
      try {
        const response = await fetch(`http://localhost:${service.port}${service.path}`);
        status.services[service.name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          port: service.port,
          lastCheck: new Date().toISOString()
        };
      } catch (error) {
        status.services[service.name] = {
          status: 'unhealthy',
          port: service.port,
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }
    }

    return status;
  }

  async startService(serviceName) {
    const { execSync } = await import('child_process');
    execSync(`systemctl start lightdom-${serviceName}`, { stdio: 'pipe' });
  }

  async stopService(serviceName) {
    const { execSync } = await import('child_process');
    execSync(`systemctl stop lightdom-${serviceName}`, { stdio: 'pipe' });
  }

  async restartService(serviceName) {
    const { execSync } = await import('child_process');
    execSync(`systemctl restart lightdom-${serviceName}`, { stdio: 'pipe' });
  }

  async deployApplication(environment) {
    const { execSync } = await import('child_process');
    
    // Pull latest changes
    execSync('git pull origin main', { cwd: projectRoot, stdio: 'inherit' });
    
    // Install dependencies
    execSync('npm ci --only=production', { cwd: projectRoot, stdio: 'inherit' });
    
    // Build application
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    
    // Run database migrations
    execSync('npm run db:migrate', { cwd: projectRoot, stdio: 'inherit' });
    
    // Restart services
    execSync('systemctl restart lightdom-api lightdom-enhanced', { stdio: 'pipe' });
  }

  async runDatabaseMigrations() {
    const { execSync } = await import('child_process');
    execSync('npm run db:migrate', { cwd: projectRoot, stdio: 'inherit' });
  }

  async createDatabaseBackup() {
    const { execSync } = await import('child_process');
    const timestamp = new Date().toISOString().split('T')[0];
    const backupFile = `backup_${timestamp}.sql`;
    
    execSync(`pg_dump -h localhost -U lightdom_prod dom_space_harvester_prod > ${backupFile}`, { stdio: 'inherit' });
    execSync(`gzip ${backupFile}`, { stdio: 'pipe' });
    
    return `${backupFile}.gz`;
  }

  async getMonitoringMetrics() {
    try {
      const response = await fetch('http://localhost:9090/metrics');
      const metrics = await response.text();
      return { metrics };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getAlerts() {
    try {
      const response = await fetch('http://localhost:3001/api/alerts');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      return [];
    }
  }

  async getServiceLogs(service, lines) {
    try {
      const { execSync } = await import('child_process');
      const output = execSync(`journalctl -u lightdom-${service} -n ${lines} --no-pager`, { 
        encoding: 'utf8' 
      });
      return output.split('\n').filter(line => line.trim());
    } catch (error) {
      return [`Error: ${error.message}`];
    }
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

  async runPerformanceTest(type) {
    const { spawn } = await import('child_process');
    const process = spawn('node', ['scripts/run-performance-tests.js'], {
      cwd: projectRoot,
      stdio: 'pipe'
    });
    
    process.stdout.on('data', (data) => {
      console.log(`Performance test: ${data}`);
    });
    
    process.stderr.on('data', (data) => {
      console.error(`Performance test error: ${data}`);
    });
  }

  async startMaintenanceMode() {
    await fs.writeFile('/tmp/lightdom-maintenance', 'true');
    
    const maintenancePage = `
<!DOCTYPE html>
<html>
<head>
    <title>LightDom - Maintenance</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .maintenance { background: #f0f0f0; padding: 30px; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="maintenance">
        <h1>🚧 Maintenance Mode</h1>
        <p>LightDom is currently undergoing maintenance.</p>
        <p>We'll be back online shortly.</p>
    </div>
</body>
</html>
    `;
    
    await fs.writeFile('/app/public/maintenance.html', maintenancePage);
  }

  async stopMaintenanceMode() {
    try {
      await fs.unlink('/tmp/lightdom-maintenance');
      await fs.unlink('/app/public/maintenance.html');
    } catch (error) {
      // Files might not exist
    }
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightDom Production Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #0f172a;
            color: #ffffff;
        }
        .container {
            max-width: 1400px;
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
        .logs {
            background: #0f172a;
            color: #e2e8f0;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LightDom Production Dashboard</h1>
            <button class="refresh-btn" onclick="refreshData()">Refresh Data</button>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>System Status</h3>
                <div id="system-status">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Service Management</h3>
                <div id="service-management">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Deployment</h3>
                <div id="deployment">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Database Operations</h3>
                <div id="database-ops">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Monitoring</h3>
                <div id="monitoring">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Security</h3>
                <div id="security">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Performance</h3>
                <div id="performance">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Maintenance</h3>
                <div id="maintenance">Loading...</div>
            </div>
        </div>
        
        <div class="card">
            <h3>Service Logs</h3>
            <div id="service-logs">Loading...</div>
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

        async function postData(url, data = {}) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                console.error('Failed to post data:', error);
                return null;
            }
        }

        async function refreshData() {
            await Promise.all([
                updateSystemStatus(),
                updateServiceManagement(),
                updateDeployment(),
                updateDatabaseOps(),
                updateMonitoring(),
                updateSecurity(),
                updatePerformance(),
                updateMaintenance(),
                updateServiceLogs()
            ]);
        }

        async function updateSystemStatus() {
            const data = await fetchData('/api/status');
            if (data && data.success) {
                const status = data.data;
                document.getElementById('system-status').innerHTML = \`
                    <div class="metric">
                        <span>Uptime:</span>
                        <span>\${Math.floor(status.system.uptime / 3600)}h \${Math.floor((status.system.uptime % 3600) / 60)}m</span>
                    </div>
                    <div class="metric">
                        <span>Memory Usage:</span>
                        <span>\${(status.system.memory.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div class="metric">
                        <span>Platform:</span>
                        <span>\${status.system.platform}</span>
                    </div>
                    <div class="metric">
                        <span>Node Version:</span>
                        <span>\${status.system.nodeVersion}</span>
                    </div>
                \`;
            }
        }

        async function updateServiceManagement() {
            const data = await fetchData('/api/status');
            if (data && data.success) {
                const services = data.data.services;
                let html = '';
                for (const [name, service] of Object.entries(services)) {
                    html += \`
                        <div class="metric">
                            <span>\${name}:</span>
                            <span class="status \${service.status}">\${service.status}</span>
                        </div>
                        <div>
                            <button class="btn btn-success" onclick="startService('\${name}')">Start</button>
                            <button class="btn btn-danger" onclick="stopService('\${name}')">Stop</button>
                            <button class="btn" onclick="restartService('\${name}')">Restart</button>
                        </div>
                    \`;
                }
                document.getElementById('service-management').innerHTML = html;
            }
        }

        async function updateDeployment() {
            document.getElementById('deployment').innerHTML = \`
                <button class="btn btn-success" onclick="deployApplication()">Deploy to Production</button>
                <button class="btn" onclick="deployApplication('staging')">Deploy to Staging</button>
            \`;
        }

        async function updateDatabaseOps() {
            document.getElementById('database-ops').innerHTML = \`
                <button class="btn" onclick="runMigrations()">Run Migrations</button>
                <button class="btn btn-success" onclick="createBackup()">Create Backup</button>
            \`;
        }

        async function updateMonitoring() {
            document.getElementById('monitoring').innerHTML = \`
                <button class="btn" onclick="viewMetrics()">View Metrics</button>
                <button class="btn" onclick="viewAlerts()">View Alerts</button>
            \`;
        }

        async function updateSecurity() {
            document.getElementById('security').innerHTML = \`
                <button class="btn btn-danger" onclick="runSecurityScan()">Run Security Scan</button>
            \`;
        }

        async function updatePerformance() {
            document.getElementById('performance').innerHTML = \`
                <button class="btn" onclick="runPerformanceTest('load')">Load Test</button>
                <button class="btn" onclick="runPerformanceTest('stress')">Stress Test</button>
                <button class="btn" onclick="runPerformanceTest('spike')">Spike Test</button>
            \`;
        }

        async function updateMaintenance() {
            document.getElementById('maintenance').innerHTML = \`
                <button class="btn btn-danger" onclick="startMaintenance()">Start Maintenance</button>
                <button class="btn btn-success" onclick="stopMaintenance()">Stop Maintenance</button>
            \`;
        }

        async function updateServiceLogs() {
            const logs = await fetchData('/api/logs/api-server?lines=50');
            if (logs && logs.success) {
                const logLines = logs.data.slice(-20).join('\\n');
                document.getElementById('service-logs').innerHTML = \`
                    <div class="logs">\${logLines}</div>
                \`;
            }
        }

        // Service management functions
        async function startService(service) {
            const result = await postData(\`/api/services/\${service}/start\`);
            if (result && result.success) {
                alert(result.message);
                refreshData();
            }
        }

        async function stopService(service) {
            const result = await postData(\`/api/services/\${service}/stop\`);
            if (result && result.success) {
                alert(result.message);
                refreshData();
            }
        }

        async function restartService(service) {
            const result = await postData(\`/api/services/\${service}/restart\`);
            if (result && result.success) {
                alert(result.message);
                refreshData();
            }
        }

        // Deployment functions
        async function deployApplication(environment = 'production') {
            const result = await postData('/api/deploy', { environment });
            if (result && result.success) {
                alert(result.message);
            }
        }

        // Database functions
        async function runMigrations() {
            const result = await postData('/api/database/migrate');
            if (result && result.success) {
                alert(result.message);
            }
        }

        async function createBackup() {
            const result = await postData('/api/database/backup');
            if (result && result.success) {
                alert(\`\${result.message}: \${result.file}\`);
            }
        }

        // Monitoring functions
        async function viewMetrics() {
            const data = await fetchData('/api/monitoring/metrics');
            if (data && data.success) {
                console.log('Metrics:', data.data);
                alert('Metrics logged to console');
            }
        }

        async function viewAlerts() {
            const data = await fetchData('/api/monitoring/alerts');
            if (data && data.success) {
                console.log('Alerts:', data.data);
                alert(\`\${data.data.length} alerts logged to console\`);
            }
        }

        // Security functions
        async function runSecurityScan() {
            const result = await postData('/api/security/scan');
            if (result && result.success) {
                alert(result.message);
            }
        }

        // Performance functions
        async function runPerformanceTest(type) {
            const result = await postData('/api/performance/test', { type });
            if (result && result.success) {
                alert(result.message);
            }
        }

        // Maintenance functions
        async function startMaintenance() {
            const result = await postData('/api/maintenance/start');
            if (result && result.success) {
                alert(result.message);
            }
        }

        async function stopMaintenance() {
            const result = await postData('/api/maintenance/stop');
            if (result && result.success) {
                alert(result.message);
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
      console.log(`🚀 LightDom Production Dashboard running on port ${this.port}`);
      console.log(`📊 Dashboard: http://localhost:${this.port}`);
    });
  }
}

// Start production dashboard
const dashboard = new LightDomProductionDashboard();
dashboard.start();

export { LightDomProductionDashboard };
