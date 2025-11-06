#!/usr/bin/env node

/**
 * LightDom Production Management CLI
 * Comprehensive command-line tool for production management
 */

import { Command } from 'commander';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomProductionCLI {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('lightdom-cli')
      .description('LightDom Production Management CLI')
      .version('1.0.0');

    // System Management Commands
    this.program
      .command('status')
      .description('Check system status')
      .action(() => this.checkSystemStatus());

    this.program
      .command('start')
      .description('Start all services')
      .action(() => this.startServices());

    this.program
      .command('stop')
      .description('Stop all services')
      .action(() => this.stopServices());

    this.program
      .command('restart')
      .description('Restart all services')
      .action(() => this.restartServices());

    // Health and Monitoring Commands
    this.program
      .command('health')
      .description('Check system health')
      .option('-v, --verbose', 'Verbose output')
      .action((options) => this.checkHealth(options));

    this.program
      .command('metrics')
      .description('Show system metrics')
      .option('-f, --format <format>', 'Output format (json, table)', 'table')
      .action((options) => this.showMetrics(options));

    this.program
      .command('logs')
      .description('View system logs')
      .option('-s, --service <service>', 'Service name (api, enhanced, frontend)')
      .option('-l, --lines <number>', 'Number of lines to show', '100')
      .option('-f, --follow', 'Follow log output')
      .action((options) => this.viewLogs(options));

    // Deployment Commands
    this.program
      .command('deploy')
      .description('Deploy application')
      .option('-e, --environment <env>', 'Environment (staging, production)', 'production')
      .option('-f, --force', 'Force deployment')
      .action((options) => this.deployApplication(options));

    this.program
      .command('rollback')
      .description('Rollback to previous version')
      .option('-v, --version <version>', 'Version to rollback to')
      .action((options) => this.rollbackApplication(options));

    // Database Commands
    this.program
      .command('db:migrate')
      .description('Run database migrations')
      .option('-e, --environment <env>', 'Environment', 'production')
      .action((options) => this.runDatabaseMigrations(options));

    this.program
      .command('db:backup')
      .description('Create database backup')
      .option('-o, --output <file>', 'Output file')
      .action((options) => this.createDatabaseBackup(options));

    this.program
      .command('db:restore')
      .description('Restore database from backup')
      .option('-f, --file <file>', 'Backup file')
      .action((options) => this.restoreDatabase(options));

    // Monitoring Commands
    this.program
      .command('monitor:start')
      .description('Start monitoring services')
      .action(() => this.startMonitoring());

    this.program
      .command('monitor:stop')
      .description('Stop monitoring services')
      .action(() => this.stopMonitoring());

    this.program
      .command('monitor:status')
      .description('Check monitoring status')
      .action(() => this.checkMonitoringStatus());

    // Security Commands
    this.program
      .command('security:scan')
      .description('Run security scan')
      .action(() => this.runSecurityScan());

    this.program
      .command('security:audit')
      .description('Run security audit')
      .action(() => this.runSecurityAudit());

    this.program
      .command('ssl:renew')
      .description('Renew SSL certificates')
      .action(() => this.renewSSLCertificates());

    // Backup Commands
    this.program
      .command('backup:create')
      .description('Create full system backup')
      .option('-t, --type <type>', 'Backup type (full, incremental)', 'full')
      .action((options) => this.createSystemBackup(options));

    this.program
      .command('backup:list')
      .description('List available backups')
      .action(() => this.listBackups());

    this.program
      .command('backup:restore')
      .description('Restore from backup')
      .option('-f, --file <file>', 'Backup file')
      .action((options) => this.restoreFromBackup(options));

    // Performance Commands
    this.program
      .command('perf:test')
      .description('Run performance tests')
      .option('-t, --type <type>', 'Test type (load, stress, spike)', 'load')
      .action((options) => this.runPerformanceTests(options));

    this.program
      .command('perf:analyze')
      .description('Analyze performance metrics')
      .action(() => this.analyzePerformance());

    // Maintenance Commands
    this.program
      .command('maintenance:start')
      .description('Start maintenance mode')
      .action(() => this.startMaintenanceMode());

    this.program
      .command('maintenance:stop')
      .description('Stop maintenance mode')
      .action(() => this.stopMaintenanceMode());

    this.program
      .command('cleanup')
      .description('Clean up old files and logs')
      .option('-d, --days <days>', 'Days to keep', '30')
      .action((options) => this.cleanupOldFiles(options));
  }

  async checkSystemStatus() {
    console.log('🔍 Checking LightDom system status...');
    
    const services = [
      { name: 'API Server', port: 3001, path: '/api/health' },
      { name: 'Frontend', port: 3000, path: '/' },
      { name: 'Monitoring', port: 9090, path: '/metrics' }
    ];

    for (const service of services) {
      try {
        const response = await fetch(`http://localhost:${service.port}${service.path}`);
        const status = response.ok ? '✅ Running' : '❌ Error';
        console.log(`${service.name}: ${status}`);
      } catch (error) {
        console.log(`${service.name}: ❌ Not running`);
      }
    }

    // Check system resources
    const memUsage = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
    const loadAvg = os.loadavg()[0];
    
    console.log(`\n📊 System Resources:`);
    console.log(`Memory Usage: ${memUsage.toFixed(1)}%`);
    console.log(`Load Average: ${loadAvg.toFixed(2)}`);
    console.log(`Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`);
  }

  async startServices() {
    console.log('🚀 Starting LightDom services...');
    
    const services = ['lightdom-api', 'lightdom-enhanced'];
    
    for (const service of services) {
      try {
        const { execSync } = await import('child_process');
        execSync(`systemctl start ${service}`, { stdio: 'pipe' });
        console.log(`✅ Started ${service}`);
      } catch (error) {
        console.log(`❌ Failed to start ${service}: ${error.message}`);
      }
    }
    
    // Wait for services to be ready
    console.log('⏳ Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await this.checkSystemStatus();
  }

  async stopServices() {
    console.log('🛑 Stopping LightDom services...');
    
    const services = ['lightdom-api', 'lightdom-enhanced'];
    
    for (const service of services) {
      try {
        const { execSync } = await import('child_process');
        execSync(`systemctl stop ${service}`, { stdio: 'pipe' });
        console.log(`✅ Stopped ${service}`);
      } catch (error) {
        console.log(`❌ Failed to stop ${service}: ${error.message}`);
      }
    }
  }

  async restartServices() {
    console.log('🔄 Restarting LightDom services...');
    await this.stopServices();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await this.startServices();
  }

  async checkHealth(options) {
    console.log('🏥 Checking system health...');
    
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const health = await response.json();
      
      if (options.verbose) {
        console.log(JSON.stringify(health, null, 2));
      } else {
        console.log(`Overall Status: ${health.data.overall}`);
        console.log(`Uptime: ${Math.floor(health.data.system.uptime / 3600)}h`);
        console.log(`Memory: ${(health.data.system.memory.used / 1024 / 1024).toFixed(1)} MB`);
        
        if (health.data.alerts && health.data.alerts.length > 0) {
          console.log(`\n⚠️ Active Alerts: ${health.data.alerts.length}`);
          health.data.alerts.forEach(alert => {
            console.log(`  - ${alert.type}: ${alert.message}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }

  async showMetrics(options) {
    console.log('📊 System metrics:');
    
    try {
      const response = await fetch('http://localhost:9090/metrics');
      const metrics = await response.text();
      
      if (options.format === 'json') {
        // Parse Prometheus metrics to JSON
        const lines = metrics.split('\n');
        const parsedMetrics = {};
        
        for (const line of lines) {
          if (line && !line.startsWith('#')) {
            const [metric, value] = line.split(' ');
            if (metric && value) {
              parsedMetrics[metric] = parseFloat(value);
            }
          }
        }
        
        console.log(JSON.stringify(parsedMetrics, null, 2));
      } else {
        console.log(metrics);
      }
    } catch (error) {
      console.error('❌ Failed to fetch metrics:', error.message);
    }
  }

  async viewLogs(options) {
    const service = options.service || 'all';
    const lines = options.lines || '100';
    const follow = options.follow ? '-f' : '';
    
    console.log(`📝 Viewing logs for ${service}...`);
    
    try {
      const { execSync } = await import('child_process');
      
      if (service === 'all') {
        execSync(`journalctl -u lightdom-api -u lightdom-enhanced -n ${lines} ${follow}`, { stdio: 'inherit' });
      } else {
        execSync(`journalctl -u lightdom-${service} -n ${lines} ${follow}`, { stdio: 'inherit' });
      }
    } catch (error) {
      console.error('❌ Failed to view logs:', error.message);
    }
  }

  async deployApplication(options) {
    console.log(`🚀 Deploying to ${options.environment}...`);
    
    try {
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
      await this.restartServices();
      
      console.log('✅ Deployment completed successfully');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
    }
  }

  async rollbackApplication(options) {
    console.log(`🔄 Rolling back application...`);
    
    try {
      const { execSync } = await import('child_process');
      
      if (options.version) {
        execSync(`git checkout ${options.version}`, { cwd: projectRoot, stdio: 'inherit' });
      } else {
        // Rollback to previous commit
        execSync('git checkout HEAD~1', { cwd: projectRoot, stdio: 'inherit' });
      }
      
      // Restart services
      await this.restartServices();
      
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  async runDatabaseMigrations(options) {
    console.log('🗄️ Running database migrations...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm run db:migrate', { 
        cwd: projectRoot, 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: options.environment }
      });
      
      console.log('✅ Database migrations completed');
    } catch (error) {
      console.error('❌ Database migration failed:', error.message);
    }
  }

  async createDatabaseBackup(options) {
    const outputFile = options.output || `backup_${new Date().toISOString().split('T')[0]}.sql`;
    
    console.log(`💾 Creating database backup: ${outputFile}...`);
    
    try {
      const { execSync } = await import('child_process');
      execSync(`pg_dump -h localhost -U lightdom_prod dom_space_harvester_prod > ${outputFile}`, { stdio: 'inherit' });
      execSync(`gzip ${outputFile}`, { stdio: 'inherit' });
      
      console.log(`✅ Database backup created: ${outputFile}.gz`);
    } catch (error) {
      console.error('❌ Database backup failed:', error.message);
    }
  }

  async restoreDatabase(options) {
    console.log(`🔄 Restoring database from: ${options.file}...`);
    
    try {
      const { execSync } = await import('child_process');
      
      // Stop services
      await this.stopServices();
      
      // Restore database
      if (options.file.endsWith('.gz')) {
        execSync(`gunzip -c ${options.file} | psql -h localhost -U lightdom_prod dom_space_harvester_prod`, { stdio: 'inherit' });
      } else {
        execSync(`psql -h localhost -U lightdom_prod dom_space_harvester_prod < ${options.file}`, { stdio: 'inherit' });
      }
      
      // Start services
      await this.startServices();
      
      console.log('✅ Database restore completed');
    } catch (error) {
      console.error('❌ Database restore failed:', error.message);
    }
  }

  async startMonitoring() {
    console.log('📊 Starting monitoring services...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('systemctl start prometheus', { stdio: 'pipe' });
      execSync('systemctl start grafana-server', { stdio: 'pipe' });
      
      console.log('✅ Monitoring services started');
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error.message);
    }
  }

  async stopMonitoring() {
    console.log('📊 Stopping monitoring services...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('systemctl stop prometheus', { stdio: 'pipe' });
      execSync('systemctl stop grafana-server', { stdio: 'pipe' });
      
      console.log('✅ Monitoring services stopped');
    } catch (error) {
      console.error('❌ Failed to stop monitoring:', error.message);
    }
  }

  async checkMonitoringStatus() {
    console.log('📊 Checking monitoring status...');
    
    const services = ['prometheus', 'grafana-server'];
    
    for (const service of services) {
      try {
        const { execSync } = await import('child_process');
        const status = execSync(`systemctl is-active ${service}`, { encoding: 'utf8' }).trim();
        console.log(`${service}: ${status === 'active' ? '✅ Running' : '❌ Stopped'}`);
      } catch (error) {
        console.log(`${service}: ❌ Not installed`);
      }
    }
  }

  async runSecurityScan() {
    console.log('🔒 Running security scan...');
    
    try {
      const { execSync } = await import('child_process');
      
      // Run npm audit
      execSync('npm audit --audit-level=moderate', { cwd: projectRoot, stdio: 'inherit' });
      
      // Run dependency check
      execSync('npm outdated', { cwd: projectRoot, stdio: 'inherit' });
      
      console.log('✅ Security scan completed');
    } catch (error) {
      console.error('❌ Security scan failed:', error.message);
    }
  }

  async runSecurityAudit() {
    console.log('🔒 Running security audit...');
    
    try {
      const { execSync } = await import('child_process');
      
      // Check for security issues
      execSync('npm audit --audit-level=high', { cwd: projectRoot, stdio: 'inherit' });
      
      // Check file permissions
      execSync('find /app -type f -perm /4000', { stdio: 'pipe' });
      
      console.log('✅ Security audit completed');
    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
    }
  }

  async renewSSLCertificates() {
    console.log('🔒 Renewing SSL certificates...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('certbot renew --quiet', { stdio: 'inherit' });
      
      // Reload nginx
      execSync('systemctl reload nginx', { stdio: 'pipe' });
      
      console.log('✅ SSL certificates renewed');
    } catch (error) {
      console.error('❌ SSL renewal failed:', error.message);
    }
  }

  async createSystemBackup(options) {
    const timestamp = new Date().toISOString().split('T')[0];
    const backupFile = `lightdom_backup_${timestamp}.tar.gz`;
    
    console.log(`💾 Creating ${options.type} system backup...`);
    
    try {
      const { execSync } = await import('child_process');
      
      // Create backup
      execSync(`tar -czf ${backupFile} /app/logs /app/artifacts /app/config /var/backups/lightdom`, { stdio: 'inherit' });
      
      console.log(`✅ System backup created: ${backupFile}`);
    } catch (error) {
      console.error('❌ System backup failed:', error.message);
    }
  }

  async listBackups() {
    console.log('📋 Available backups:');
    
    try {
      const { execSync } = await import('child_process');
      execSync('ls -la /var/backups/lightdom/', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
    }
  }

  async restoreFromBackup(options) {
    console.log(`🔄 Restoring from backup: ${options.file}...`);
    
    try {
      const { execSync } = await import('child_process');
      
      // Stop services
      await this.stopServices();
      
      // Restore files
      execSync(`tar -xzf ${options.file} -C /`, { stdio: 'inherit' });
      
      // Start services
      await this.startServices();
      
      console.log('✅ System restore completed');
    } catch (error) {
      console.error('❌ System restore failed:', error.message);
    }
  }

  async runPerformanceTests(options) {
    console.log(`⚡ Running ${options.type} performance tests...`);
    
    try {
      const { execSync } = await import('child_process');
      
      // Install k6 if not present
      try {
        execSync('k6 version', { stdio: 'pipe' });
      } catch (error) {
        console.log('Installing k6...');
        execSync('sudo apt-get install -y k6', { stdio: 'inherit' });
      }
      
      // Run performance test
      const testFile = `tests/performance/${options.type}-test.js`;
      execSync(`k6 run ${testFile}`, { cwd: projectRoot, stdio: 'inherit' });
      
      console.log('✅ Performance tests completed');
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
    }
  }

  async analyzePerformance() {
    console.log('📊 Analyzing performance metrics...');
    
    try {
      const response = await fetch('http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])');
      const data = await response.json();
      
      console.log('Performance Analysis:');
      console.log(`Request Rate: ${data.data.result[0]?.value[1] || 'N/A'} req/s`);
      
      // Additional analysis would go here
      console.log('✅ Performance analysis completed');
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
    }
  }

  async startMaintenanceMode() {
    console.log('🔧 Starting maintenance mode...');
    
    try {
      // Create maintenance flag file
      await fs.writeFile('/tmp/lightdom-maintenance', 'true');
      
      // Show maintenance page
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
      
      console.log('✅ Maintenance mode started');
    } catch (error) {
      console.error('❌ Failed to start maintenance mode:', error.message);
    }
  }

  async stopMaintenanceMode() {
    console.log('🔧 Stopping maintenance mode...');
    
    try {
      // Remove maintenance flag file
      await fs.unlink('/tmp/lightdom-maintenance');
      
      // Remove maintenance page
      await fs.unlink('/app/public/maintenance.html');
      
      console.log('✅ Maintenance mode stopped');
    } catch (error) {
      console.error('❌ Failed to stop maintenance mode:', error.message);
    }
  }

  async cleanupOldFiles(options) {
    const days = parseInt(options.days) || 30;
    
    console.log(`🧹 Cleaning up files older than ${days} days...`);
    
    try {
      const { execSync } = await import('child_process');
      
      // Clean up old logs
      execSync(`find /app/logs -type f -mtime +${days} -delete`, { stdio: 'pipe' });
      
      // Clean up old backups
      execSync(`find /var/backups/lightdom -type f -mtime +${days} -delete`, { stdio: 'pipe' });
      
      // Clean up old artifacts
      execSync(`find /app/artifacts -type f -mtime +${days} -delete`, { stdio: 'pipe' });
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  async run() {
    await this.program.parseAsync(process.argv);
  }
}

// Create and run CLI
const cli = new LightDomProductionCLI();
cli.run().catch(console.error);

export { LightDomProductionCLI };
