#!/usr/bin/env node

/**
 * Automation Pipeline Monitor (CommonJS)
 * Monitors the automation system and provides real-time status updates
 */

const fs = require('fs/promises');
const { exec } = require('child_process');
const { promisify } = require('util');
const http = require('http');

const execAsync = promisify(exec);

class AutomationMonitor {
  constructor() {
    this.monitoring = false;
    this.status = {
      services: {},
      issues: [],
      fixes: [],
      cursorAgents: [],
      linearIssues: []
    };
  }

  // Lightweight fetch that works in Node without global fetch (Node 18+ has fetch, but guard it)
  async safeFetch(url) {
    if (typeof fetch === 'function') {
      return fetch(url);
    }
    // Fallback using http for simple GET
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        // emulate minimal fetch Response API we use (ok + status)
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
      });
      req.on('error', reject);
      req.setTimeout(3000, () => {
        req.destroy(new Error('Request timeout'));
      });
    });
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      monitor: '📊',
      service: '🔧',
      issue: '⚠️'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async checkServiceStatus(serviceName, checkCommand, port = null) {
    try {
      if (port) {
        // Check if service is running on port
        const response = await this.safeFetch(`http://localhost:${port}/api/health`);
        if (response.ok) {
          return { status: 'running', message: `Service running on port ${port}` };
        }
      } else {
        // Check process
        const { stdout } = await execAsync(checkCommand);
        if (stdout.includes(serviceName.toLowerCase())) {
          return { status: 'running', message: 'Process is running' };
        }
      }
      return { status: 'stopped', message: 'Service not running' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async monitorServices() {
    this.log('Monitoring services...', 'monitor');
    
    const services = [
      {
        name: 'API Server',
        checkCommand: 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV',
        port: 3001
      },
      {
        name: 'Frontend Dev Server',
        checkCommand: 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV',
        port: 3000
      },
      {
        name: 'PostgreSQL Database',
        checkCommand: 'tasklist /FI "IMAGENAME eq postgres.exe"',
        port: 5432
      },
      {
        name: 'Redis Cache',
        checkCommand: 'tasklist /FI "IMAGENAME eq redis-server.exe"',
        port: 6379
      },
      {
        name: 'Docker Service',
        checkCommand: 'docker --version'
      }
    ];

    for (const service of services) {
      const status = await this.checkServiceStatus(service.name, service.checkCommand, service.port);
      this.status.services[service.name] = {
        ...status,
        lastChecked: new Date().toISOString(),
        port: service.port
      };
      
      this.log(`${service.name}: ${status.status} - ${status.message}`, status.status);
    }
  }

  async detectIssues() {
    this.log('Detecting issues...', 'monitor');
    
    const issues = [];
    
    // Check for stopped services
    for (const [serviceName, serviceStatus] of Object.entries(this.status.services)) {
      if (serviceStatus.status === 'stopped' || serviceStatus.status === 'error') {
        issues.push({
          id: `service-${serviceName.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'critical',
          title: `${serviceName} is not running`,
          description: serviceStatus.message,
          service: serviceName,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check for port conflicts
    const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
    let activePorts = 0;
    
    for (const port of ports) {
      try {
        const response = await this.safeFetch(`http://localhost:${port}`);
        if (response.ok) {
          activePorts++;
        }
      } catch (error) {
        // Port not active
      }
    }
    
    if (activePorts > 3) {
      issues.push({
        id: 'multiple-ports-active',
        type: 'warning',
        title: 'Multiple development servers running',
        description: `${activePorts} ports are active, which may cause conflicts`,
        timestamp: new Date().toISOString()
      });
    }

    this.status.issues = issues;
    return issues;
  }

  async generateStatusReport() {
    const report = `
# Automation Pipeline Status Report

## 📊 **Service Status**

${Object.entries(this.status.services).map(([name, status]) => `
### ${name}
- **Status**: ${status.status}
- **Message**: ${status.message}
- **Port**: ${status.port || 'N/A'}
- **Last Checked**: ${status.lastChecked}
`).join('')}

## ⚠️ **Issues Detected**

${this.status.issues.length === 0 ? 'No issues detected' : this.status.issues.map(issue => `
### ${issue.title}
- **Type**: ${issue.type}
- **Description**: ${issue.description}
- **Timestamp**: ${issue.timestamp}
`).join('')}

## 🔧 **Recommended Actions**

${this.status.issues.length === 0 ? 'All services are running correctly' : this.status.issues.map(issue => `
### Fix for ${issue.title}
- **Issue**: ${issue.description}
- **Action**: ${this.getRecommendedAction(issue)}
`).join('')}

## 📈 **System Health**

- **Services Running**: ${Object.values(this.status.services).filter(s => s.status === 'running').length}/${Object.keys(this.status.services).length}
- **Issues Detected**: ${this.status.issues.length}
- **Critical Issues**: ${this.status.issues.filter(i => i.type === 'critical').length}
- **Warning Issues**: ${this.status.issues.filter(i => i.type === 'warning').length}

## 🎯 **Next Steps**

1. **Review Issues**: Check all detected issues above
2. **Apply Fixes**: Run recommended actions
3. **Monitor Progress**: Continue monitoring for improvements
4. **Run Automation**: Use \`npm run automation:cursor-linear\` for automated fixes

## Timestamp: ${new Date().toISOString()}
`;

    await fs.writeFile('automation-status-report.md', report);
    this.log('Status report saved: automation-status-report.md', 'success');
    return report;
  }

  getRecommendedAction(issue) {
    const actions = {
      'service-api-server': 'Start API server: node simple-api-server.js',
      'service-frontend-dev-server': 'Start frontend: npm run dev',
      'service-postgresql-database': 'Start PostgreSQL: docker-compose up -d postgres',
      'service-redis-cache': 'Start Redis: docker-compose up -d redis',
      'service-docker-service': 'Install Docker or start Docker service',
      'multiple-ports-active': 'Kill unnecessary processes: taskkill /F /IM node.exe'
    };
    
    return actions[issue.id] || 'Manual intervention required';
  }

  async startMonitoring(interval = 30000) {
    this.log('Starting automation pipeline monitoring...', 'monitor');
    this.monitoring = true;
    
    while (this.monitoring) {
      try {
        await this.monitorServices();
        await this.detectIssues();
        await this.generateStatusReport();
        
        this.log(`Monitoring cycle complete. Next check in ${interval/1000} seconds...`, 'monitor');
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        this.log(`Monitoring error: ${error.message}`, 'error');
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  stopMonitoring() {
    this.log('Stopping automation pipeline monitoring...', 'monitor');
    this.monitoring = false;
  }
}

// Run the monitor
const monitor = new AutomationMonitor();

// Handle graceful shutdown
process.on('SIGINT', () => {
  monitor.stopMonitoring();
  process.exit(0);
});

// Support one-time snapshot via --once
if (process.argv.includes('--once')) {
  (async () => {
    monitor.log('Running one-time status snapshot...', 'monitor');
    await monitor.monitorServices();
    await monitor.detectIssues();
    const report = await monitor.generateStatusReport();
    console.log(report);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  // Start monitoring loop
  monitor.startMonitoring().catch(console.error);
}
