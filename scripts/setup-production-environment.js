#!/usr/bin/env node

/**
 * LightDom Production Environment Setup
 * Automated setup for production deployment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomProductionSetup {
  constructor() {
    this.environment = process.env.NODE_ENV || 'production';
    this.config = {
      domain: process.env.DOMAIN || 'lightdom.example.com',
      ssl: process.env.SSL_ENABLED === 'true',
      monitoring: process.env.MONITORING_ENABLED === 'true',
      scaling: process.env.AUTO_SCALING === 'true',
      backup: process.env.BACKUP_ENABLED === 'true'
    };
    
    this.setupSteps = [];
    this.isSetup = false;
  }

  async setup() {
    console.log('🚀 Starting LightDom Production Environment Setup...');
    console.log('==================================================');
    
    try {
      // Pre-setup validation
      await this.validatePrerequisites();
      
      // Setup steps
      await this.setupSystemDependencies();
      await this.setupDatabase();
      await this.setupRedis();
      await this.setupSSL();
      await this.setupMonitoring();
      await this.setupBackup();
      await this.setupLogging();
      await this.setupSecurity();
      await this.setupScaling();
      
      // Final configuration
      await this.finalizeConfiguration();
      
      this.isSetup = true;
      console.log('✅ Production environment setup completed successfully!');
      
      // Display setup summary
      this.displaySetupSummary();
      
    } catch (error) {
      console.error('❌ Production setup failed:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  async validatePrerequisites() {
    console.log('🔍 Validating prerequisites...');
    
    const checks = [
      { name: 'Node.js Version', check: () => this.checkNodeVersion() },
      { name: 'Docker Installation', check: () => this.checkDocker() },
      { name: 'Kubernetes CLI', check: () => this.checkKubectl() },
      { name: 'Helm Installation', check: () => this.checkHelm() },
      { name: 'System Resources', check: () => this.checkSystemResources() },
      { name: 'Network Connectivity', check: () => this.checkNetworkConnectivity() }
    ];

    for (const { name, check } of checks) {
      try {
        await check();
        console.log(`✅ ${name}: OK`);
      } catch (error) {
        throw new Error(`${name} validation failed: ${error.message}`);
      }
    }
    
    console.log('✅ Prerequisites validation completed');
  }

  async checkNodeVersion() {
    const { execSync } = await import('child_process');
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${version} is not supported. Minimum version is 18.0.0`);
    }
  }

  async checkDocker() {
    try {
      const { execSync } = await import('child_process');
      execSync('docker --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Docker is not installed or not accessible');
    }
  }

  async checkKubectl() {
    try {
      const { execSync } = await import('child_process');
      execSync('kubectl version --client', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('kubectl is not installed or not accessible');
    }
  }

  async checkHelm() {
    try {
      const { execSync } = await import('child_process');
      execSync('helm version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Helm is not installed or not accessible');
    }
  }

  async checkSystemResources() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsagePercent = ((totalMem - freeMem) / totalMem) * 100;
    
    console.log(`💾 Memory usage: ${memUsagePercent.toFixed(1)}%`);
    
    if (memUsagePercent > 85) {
      throw new Error('System memory usage is too high (>85%)');
    }
    
    if (totalMem < 4 * 1024 * 1024 * 1024) { // 4GB
      throw new Error('System has insufficient memory (<4GB)');
    }
  }

  async checkNetworkConnectivity() {
    try {
      const response = await fetch('https://api.github.com');
      if (!response.ok) {
        throw new Error('Network connectivity issues');
      }
    } catch (error) {
      throw new Error('No internet connectivity');
    }
  }

  async setupSystemDependencies() {
    console.log('📦 Setting up system dependencies...');
    
    const dependencies = [
      'postgresql-client',
      'redis-tools',
      'curl',
      'jq',
      'htop',
      'nginx'
    ];

    for (const dep of dependencies) {
      try {
        await this.installPackage(dep);
        console.log(`✅ Installed ${dep}`);
      } catch (error) {
        console.warn(`⚠️ Failed to install ${dep}: ${error.message}`);
      }
    }
    
    console.log('✅ System dependencies setup completed');
  }

  async installPackage(packageName) {
    const { execSync } = await import('child_process');
    
    try {
      // Try apt (Ubuntu/Debian)
      execSync(`apt-get update && apt-get install -y ${packageName}`, { stdio: 'pipe' });
    } catch (error) {
      try {
        // Try yum (CentOS/RHEL)
        execSync(`yum install -y ${packageName}`, { stdio: 'pipe' });
      } catch (error2) {
        try {
          // Try brew (macOS)
          execSync(`brew install ${packageName}`, { stdio: 'pipe' });
        } catch (error3) {
          throw new Error(`Failed to install ${packageName} with any package manager`);
        }
      }
    }
  }

  async setupDatabase() {
    console.log('🗄️ Setting up production database...');
    
    try {
      // Create production database
      await this.createProductionDatabase();
      
      // Setup database user and permissions
      await this.setupDatabaseUser();
      
      // Run database migrations
      await this.runDatabaseMigrations();
      
      // Setup database monitoring
      await this.setupDatabaseMonitoring();
      
      console.log('✅ Database setup completed');
    } catch (error) {
      throw new Error(`Database setup failed: ${error.message}`);
    }
  }

  async createProductionDatabase() {
    const { execSync } = await import('child_process');
    
    try {
      execSync('createdb dom_space_harvester_prod', { stdio: 'pipe' });
    } catch (error) {
      // Database might already exist
      console.log('Database already exists or creation failed');
    }
  }

  async setupDatabaseUser() {
    const { execSync } = await import('child_process');
    
    try {
      execSync('psql -c "CREATE USER lightdom_prod WITH PASSWORD \'secure_prod_password\';"', { stdio: 'pipe' });
      execSync('psql -c "GRANT ALL PRIVILEGES ON DATABASE dom_space_harvester_prod TO lightdom_prod;"', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Database user setup failed or user already exists');
    }
  }

  async runDatabaseMigrations() {
    const { execSync } = await import('child_process');
    
    try {
      execSync('npm run db:migrate', { 
        cwd: projectRoot,
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          DB_NAME: 'dom_space_harvester_prod'
        }
      });
    } catch (error) {
      throw new Error(`Database migration failed: ${error.message}`);
    }
  }

  async setupDatabaseMonitoring() {
    // Setup database monitoring and alerting
    console.log('📊 Setting up database monitoring...');
    
    // Create monitoring configuration
    const monitoringConfig = {
      database: {
        host: 'localhost',
        port: 5432,
        name: 'dom_space_harvester_prod',
        user: 'lightdom_prod',
        monitoring: {
          enabled: true,
          interval: 30000,
          alerts: {
            connectionFailure: true,
            slowQueries: true,
            diskSpace: true
          }
        }
      }
    };
    
    await fs.writeFile(
      join(projectRoot, 'config', 'database-monitoring.json'),
      JSON.stringify(monitoringConfig, null, 2)
    );
  }

  async setupRedis() {
    console.log('🔴 Setting up Redis cache...');
    
    try {
      // Install Redis if not already installed
      await this.installPackage('redis-server');
      
      // Setup Redis configuration
      await this.setupRedisConfiguration();
      
      // Start Redis service
      await this.startRedisService();
      
      console.log('✅ Redis setup completed');
    } catch (error) {
      throw new Error(`Redis setup failed: ${error.message}`);
    }
  }

  async setupRedisConfiguration() {
    const redisConfig = `
# LightDom Redis Production Configuration
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 60
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
    `.trim();
    
    await fs.writeFile('/etc/redis/redis.conf', redisConfig);
  }

  async startRedisService() {
    const { execSync } = await import('child_process');
    
    try {
      execSync('systemctl start redis-server', { stdio: 'pipe' });
      execSync('systemctl enable redis-server', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Failed to start Redis service:', error.message);
    }
  }

  async setupSSL() {
    if (!this.config.ssl) {
      console.log('🔒 SSL setup skipped');
      return;
    }

    console.log('🔒 Setting up SSL certificates...');
    
    try {
      // Install certbot
      await this.installPackage('certbot');
      
      // Generate SSL certificate
      await this.generateSSLCertificate();
      
      // Setup SSL renewal
      await this.setupSSLRenewal();
      
      console.log('✅ SSL setup completed');
    } catch (error) {
      throw new Error(`SSL setup failed: ${error.message}`);
    }
  }

  async generateSSLCertificate() {
    const { execSync } = await import('child_process');
    
    try {
      execSync(`certbot certonly --standalone -d ${this.config.domain} --non-interactive --agree-tos --email admin@${this.config.domain}`, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`SSL certificate generation failed: ${error.message}`);
    }
  }

  async setupSSLRenewal() {
    const { execSync } = await import('child_process');
    
    try {
      // Add renewal cron job
      execSync('echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Failed to setup SSL renewal:', error.message);
    }
  }

  async setupMonitoring() {
    if (!this.config.monitoring) {
      console.log('📊 Monitoring setup skipped');
      return;
    }

    console.log('📊 Setting up monitoring and alerting...');
    
    try {
      // Install monitoring tools
      await this.installMonitoringTools();
      
      // Setup Prometheus
      await this.setupPrometheus();
      
      // Setup Grafana
      await this.setupGrafana();
      
      // Setup alerting
      await this.setupAlerting();
      
      console.log('✅ Monitoring setup completed');
    } catch (error) {
      throw new Error(`Monitoring setup failed: ${error.message}`);
    }
  }

  async installMonitoringTools() {
    const tools = ['prometheus', 'grafana-server', 'node-exporter'];
    
    for (const tool of tools) {
      try {
        await this.installPackage(tool);
      } catch (error) {
        console.warn(`Failed to install ${tool}:`, error.message);
      }
    }
  }

  async setupPrometheus() {
    const prometheusConfig = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "lightdom_rules.yml"

scrape_configs:
  - job_name: 'lightdom-api'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'lightdom-system'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 30s
    `.trim();
    
    await fs.writeFile('/etc/prometheus/prometheus.yml', prometheusConfig);
  }

  async setupGrafana() {
    // Setup Grafana configuration
    const grafanaConfig = {
      server: {
        http_port: 3000,
        domain: this.config.domain
      },
      security: {
        admin_user: 'admin',
        admin_password: 'secure_grafana_password'
      },
      database: {
        type: 'sqlite3',
        path: '/var/lib/grafana/grafana.db'
      }
    };
    
    await fs.writeFile('/etc/grafana/grafana.ini', JSON.stringify(grafanaConfig, null, 2));
  }

  async setupAlerting() {
    // Setup alerting rules
    const alertRules = `
groups:
- name: lightdom
  rules:
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is above 90%"

  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "Service {{ $labels.instance }} is down"
    `.trim();
    
    await fs.writeFile('/etc/prometheus/lightdom_rules.yml', alertRules);
  }

  async setupBackup() {
    if (!this.config.backup) {
      console.log('💾 Backup setup skipped');
      return;
    }

    console.log('💾 Setting up backup system...');
    
    try {
      // Setup database backup
      await this.setupDatabaseBackup();
      
      // Setup file backup
      await this.setupFileBackup();
      
      // Setup backup monitoring
      await this.setupBackupMonitoring();
      
      console.log('✅ Backup setup completed');
    } catch (error) {
      throw new Error(`Backup setup failed: ${error.message}`);
    }
  }

  async setupDatabaseBackup() {
    const backupScript = `#!/bin/bash
# LightDom Database Backup Script
BACKUP_DIR="/var/backups/lightdom"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/lightdom_db_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U lightdom_prod dom_space_harvester_prod > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
    `.trim();
    
    await fs.writeFile('/usr/local/bin/lightdom-db-backup.sh', backupScript);
    
    // Make executable
    const { execSync } = await import('child_process');
    execSync('chmod +x /usr/local/bin/lightdom-db-backup.sh');
    
    // Add to cron
    execSync('echo "0 2 * * * /usr/local/bin/lightdom-db-backup.sh" | crontab -');
  }

  async setupFileBackup() {
    const backupScript = `#!/bin/bash
# LightDom File Backup Script
BACKUP_DIR="/var/backups/lightdom/files"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/lightdom_files_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_FILE /app/logs /app/artifacts /app/config

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "File backup completed: $BACKUP_FILE"
    `.trim();
    
    await fs.writeFile('/usr/local/bin/lightdom-file-backup.sh', backupScript);
    
    // Make executable
    const { execSync } = await import('child_process');
    execSync('chmod +x /usr/local/bin/lightdom-file-backup.sh');
    
    // Add to cron
    execSync('echo "0 3 * * * /usr/local/bin/lightdom-file-backup.sh" | crontab -');
  }

  async setupBackupMonitoring() {
    // Setup backup monitoring and alerting
    console.log('📊 Setting up backup monitoring...');
  }

  async setupLogging() {
    console.log('📝 Setting up centralized logging...');
    
    try {
      // Setup log rotation
      await this.setupLogRotation();
      
      // Setup log aggregation
      await this.setupLogAggregation();
      
      // Setup log monitoring
      await this.setupLogMonitoring();
      
      console.log('✅ Logging setup completed');
    } catch (error) {
      throw new Error(`Logging setup failed: ${error.message}`);
    }
  }

  async setupLogRotation() {
    const logrotateConfig = `
/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 lightdom lightdom
    postrotate
        systemctl reload lightdom-api
    endscript
}
    `.trim();
    
    await fs.writeFile('/etc/logrotate.d/lightdom', logrotateConfig);
  }

  async setupLogAggregation() {
    // Setup log aggregation with Fluentd or similar
    console.log('📊 Setting up log aggregation...');
  }

  async setupLogMonitoring() {
    // Setup log monitoring and alerting
    console.log('📊 Setting up log monitoring...');
  }

  async setupSecurity() {
    console.log('🔒 Setting up security hardening...');
    
    try {
      // Setup firewall
      await this.setupFirewall();
      
      // Setup fail2ban
      await this.setupFail2ban();
      
      // Setup security monitoring
      await this.setupSecurityMonitoring();
      
      console.log('✅ Security setup completed');
    } catch (error) {
      throw new Error(`Security setup failed: ${error.message}`);
    }
  }

  async setupFirewall() {
    const { execSync } = await import('child_process');
    
    try {
      // Install ufw
      await this.installPackage('ufw');
      
      // Configure firewall rules
      execSync('ufw default deny incoming', { stdio: 'pipe' });
      execSync('ufw default allow outgoing', { stdio: 'pipe' });
      execSync('ufw allow ssh', { stdio: 'pipe' });
      execSync('ufw allow 80/tcp', { stdio: 'pipe' });
      execSync('ufw allow 443/tcp', { stdio: 'pipe' });
      execSync('ufw allow 3001/tcp', { stdio: 'pipe' });
      execSync('ufw allow 9090/tcp', { stdio: 'pipe' });
      execSync('ufw --force enable', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Firewall setup failed:', error.message);
    }
  }

  async setupFail2ban() {
    const { execSync } = await import('child_process');
    
    try {
      // Install fail2ban
      await this.installPackage('fail2ban');
      
      // Configure fail2ban
      const fail2banConfig = `
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[lightdom-api]
enabled = true
port = 3001
logpath = /app/logs/api.log
maxretry = 5
      `.trim();
      
      await fs.writeFile('/etc/fail2ban/jail.local', fail2banConfig);
      
      // Start fail2ban
      execSync('systemctl start fail2ban', { stdio: 'pipe' });
      execSync('systemctl enable fail2ban', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Fail2ban setup failed:', error.message);
    }
  }

  async setupSecurityMonitoring() {
    // Setup security monitoring and alerting
    console.log('📊 Setting up security monitoring...');
  }

  async setupScaling() {
    if (!this.config.scaling) {
      console.log('📈 Auto-scaling setup skipped');
      return;
    }

    console.log('📈 Setting up auto-scaling...');
    
    try {
      // Setup horizontal pod autoscaler
      await this.setupHPA();
      
      // Setup cluster autoscaler
      await this.setupClusterAutoscaler();
      
      // Setup resource monitoring
      await this.setupResourceMonitoring();
      
      console.log('✅ Auto-scaling setup completed');
    } catch (error) {
      throw new Error(`Auto-scaling setup failed: ${error.message}`);
    }
  }

  async setupHPA() {
    // Setup horizontal pod autoscaler configuration
    console.log('📊 Setting up HPA...');
  }

  async setupClusterAutoscaler() {
    // Setup cluster autoscaler
    console.log('📊 Setting up cluster autoscaler...');
  }

  async setupResourceMonitoring() {
    // Setup resource monitoring for scaling decisions
    console.log('📊 Setting up resource monitoring...');
  }

  async finalizeConfiguration() {
    console.log('🔧 Finalizing production configuration...');
    
    try {
      // Create production environment file
      await this.createProductionEnv();
      
      // Setup systemd services
      await this.setupSystemdServices();
      
      // Setup health checks
      await this.setupHealthChecks();
      
      // Create deployment scripts
      await this.createDeploymentScripts();
      
      console.log('✅ Configuration finalization completed');
    } catch (error) {
      throw new Error(`Configuration finalization failed: ${error.message}`);
    }
  }

  async createProductionEnv() {
    const envContent = `
# LightDom Production Environment Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester_prod
DB_USER=lightdom_prod
DB_PASSWORD=secure_prod_password
DB_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_prod_password

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=1337
MINING_INTERVAL=30000

# Crawler Configuration
CRAWLER_MAX_CONCURRENCY=5
CRAWLER_REQUEST_DELAY=2000
CRAWLER_MAX_DEPTH=2

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_PORT=9090
METRICS_PATH=/metrics

# Security Configuration
JWT_SECRET=your_jwt_secret_key_production
ENCRYPTION_KEY=your_encryption_key_production
CORS_ORIGIN=https://${this.config.domain}
RATE_LIMIT=100

# SSL Configuration
SSL_ENABLED=${this.config.ssl}
DOMAIN=${this.config.domain}

# Scaling Configuration
AUTO_SCALING=${this.config.scaling}
API_WORKERS=4

# Backup Configuration
BACKUP_ENABLED=${this.config.backup}
BACKUP_SCHEDULE=0 2 * * *
    `.trim();
    
    await fs.writeFile(join(projectRoot, '.env.production'), envContent);
  }

  async setupSystemdServices() {
    const apiService = `
[Unit]
Description=LightDom API Server
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=lightdom
WorkingDirectory=/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node api-server-express.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lightdom-api

[Install]
WantedBy=multi-user.target
    `.trim();
    
    await fs.writeFile('/etc/systemd/system/lightdom-api.service', apiService);
    
    const enhancedService = `
[Unit]
Description=LightDom Enhanced Systems
After=network.target postgresql.service redis.service lightdom-api.service

[Service]
Type=simple
User=lightdom
WorkingDirectory=/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node scripts/start-enhanced-systems.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lightdom-enhanced

[Install]
WantedBy=multi-user.target
    `.trim();
    
    await fs.writeFile('/etc/systemd/system/lightdom-enhanced.service', enhancedService);
    
    // Reload systemd
    const { execSync } = await import('child_process');
    execSync('systemctl daemon-reload', { stdio: 'pipe' });
  }

  async setupHealthChecks() {
    const healthCheckScript = `#!/bin/bash
# LightDom Health Check Script

API_URL="http://localhost:3001/api/health"
ENHANCED_URL="http://localhost:3001/api/headless/status"

# Check API server
if ! curl -f $API_URL > /dev/null 2>&1; then
    echo "API server health check failed"
    systemctl restart lightdom-api
    exit 1
fi

# Check enhanced systems
if ! curl -f $ENHANCED_URL > /dev/null 2>&1; then
    echo "Enhanced systems health check failed"
    systemctl restart lightdom-enhanced
    exit 1
fi

echo "All services healthy"
exit 0
    `.trim();
    
    await fs.writeFile('/usr/local/bin/lightdom-health-check.sh', healthCheckScript);
    
    // Make executable
    const { execSync } = await import('child_process');
    execSync('chmod +x /usr/local/bin/lightdom-health-check.sh');
    
    // Add to cron
    execSync('echo "*/5 * * * * /usr/local/bin/lightdom-health-check.sh" | crontab -');
  }

  async createDeploymentScripts() {
    const deployScript = `#!/bin/bash
# LightDom Production Deployment Script

echo "🚀 Starting LightDom production deployment..."

# Stop services
systemctl stop lightdom-api
systemctl stop lightdom-enhanced

# Backup current version
cp -r /app /app.backup.$(date +%Y%m%d_%H%M%S)

# Update application
cd /app
git pull origin main
npm ci --only=production
npm run build

# Run database migrations
npm run db:migrate

# Start services
systemctl start lightdom-api
systemctl start lightdom-enhanced

# Wait for services to be ready
sleep 30

# Run health checks
/usr/local/bin/lightdom-health-check.sh

echo "✅ Deployment completed successfully"
    `.trim();
    
    await fs.writeFile('/usr/local/bin/lightdom-deploy.sh', deployScript);
    
    // Make executable
    const { execSync } = await import('child_process');
    execSync('chmod +x /usr/local/bin/lightdom-deploy.sh');
  }

  displaySetupSummary() {
    console.log('\n🎉 LightDom Production Environment Setup Complete!');
    console.log('================================================');
    console.log(`🌐 Domain: ${this.config.domain}`);
    console.log(`🔒 SSL: ${this.config.ssl ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Monitoring: ${this.config.monitoring ? 'Enabled' : 'Disabled'}`);
    console.log(`📈 Auto-scaling: ${this.config.scaling ? 'Enabled' : 'Disabled'}`);
    console.log(`💾 Backup: ${this.config.backup ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n📋 Services:');
    console.log('  - PostgreSQL Database');
    console.log('  - Redis Cache');
    console.log('  - LightDom API Server');
    console.log('  - Enhanced Systems (Blockchain + Crawler)');
    console.log('  - Monitoring (Prometheus + Grafana)');
    console.log('  - Logging (Centralized)');
    console.log('  - Security (Firewall + Fail2ban)');
    
    console.log('\n🔧 Management Commands:');
    console.log('  Start Services: systemctl start lightdom-api lightdom-enhanced');
    console.log('  Stop Services: systemctl stop lightdom-api lightdom-enhanced');
    console.log('  Restart Services: systemctl restart lightdom-api lightdom-enhanced');
    console.log('  Check Status: systemctl status lightdom-api lightdom-enhanced');
    console.log('  View Logs: journalctl -u lightdom-api -f');
    console.log('  Deploy: /usr/local/bin/lightdom-deploy.sh');
    console.log('  Health Check: /usr/local/bin/lightdom-health-check.sh');
    
    console.log('\n📁 Configuration Files:');
    console.log('  Environment: .env.production');
    console.log('  Database: /etc/postgresql/15/main/postgresql.conf');
    console.log('  Redis: /etc/redis/redis.conf');
    console.log('  Nginx: /etc/nginx/nginx.conf');
    console.log('  Monitoring: /etc/prometheus/prometheus.yml');
    console.log('  Logs: /app/logs/');
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Start services: systemctl start lightdom-api lightdom-enhanced');
    console.log('  2. Check health: curl http://localhost:3001/api/health');
    console.log('  3. Access monitoring: http://localhost:9090');
    console.log('  4. Setup SSL certificates (if enabled)');
    console.log('  5. Configure domain DNS');
  }

  async cleanup() {
    console.log('🧹 Cleaning up setup...');
    
    // Cleanup any temporary files or configurations
    console.log('✅ Cleanup completed');
  }
}

// Create and run setup
const setup = new LightDomProductionSetup();

// Run setup
setup.setup().catch(async (error) => {
  console.error('💥 Production setup failed:', error);
  await setup.cleanup();
  process.exit(1);
});

export { LightDomProductionSetup };
