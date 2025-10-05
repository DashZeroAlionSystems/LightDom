#!/usr/bin/env node

/**
 * Monitoring Setup Script
 * Configures comprehensive monitoring and alerting for the LightDom platform
 * Adheres to enterprise coding rules
 */

const fs = require('fs');
const path = require('path');

class MonitoringSetup {
  constructor() {
    this.config = {
      monitoring: {
        healthChecks: {
          interval: 30000,
          timeout: 10000,
          retries: 3
        },
        metrics: {
          collectionInterval: 60000,
          retentionPeriod: '30d'
        },
        alerts: {
          errorRate: { threshold: 1, unit: 'percent' },
          responseTime: { threshold: 2000, unit: 'milliseconds' },
          cpuUsage: { threshold: 80, unit: 'percent' },
          memoryUsage: { threshold: 85, unit: 'percent' },
          diskUsage: { threshold: 90, unit: 'percent' }
        }
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  createHealthCheckConfig() {
    this.log('Creating health check configuration...');
    
    const healthCheckConfig = {
      healthChecks: [
        {
          name: 'api-health',
          url: '/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
          interval: 30000
        },
        {
          name: 'database-health',
          url: '/health/database',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000,
          interval: 60000
        },
        {
          name: 'blockchain-health',
          url: '/health/blockchain',
          method: 'GET',
          expectedStatus: 200,
          timeout: 15000,
          interval: 120000
        },
        {
          name: 'crawler-health',
          url: '/health/crawler',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000,
          interval: 300000
        }
      ],
      alerts: {
        slack: {
          webhook: process.env.SLACK_WEBHOOK_URL,
          channel: '#lightdom-alerts'
        },
        email: {
          smtp: {
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          },
          to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || ['dev-team@lightdom.com'],
          from: 'noreply@lightdom.com'
        }
      }
    };

    fs.writeFileSync(
      'monitoring/health-checks.json',
      JSON.stringify(healthCheckConfig, null, 2)
    );

    this.log('Health check configuration created', 'success');
  }

  createPrometheusConfig() {
    this.log('Creating Prometheus configuration...');
    
    const prometheusConfig = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'lightdom-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'lightdom-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'lightdom-crawler'
    static_configs:
      - targets: ['crawler:3001']
    metrics_path: '/metrics'
    scrape_interval: 60s

  - job_name: 'lightdom-optimizer'
    static_configs:
      - targets: ['optimizer:3002']
    metrics_path: '/metrics'
    scrape_interval: 60s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
`;

    fs.writeFileSync('monitoring/prometheus.yml', prometheusConfig);
    this.log('Prometheus configuration created', 'success');
  }

  createGrafanaDashboards() {
    this.log('Creating Grafana dashboards...');
    
    const dashboardConfig = {
      dashboard: {
        id: null,
        title: 'LightDom Platform Overview',
        tags: ['lightdom', 'platform'],
        timezone: 'browser',
        panels: [
          {
            id: 1,
            title: 'API Response Time',
            type: 'graph',
            targets: [
              {
                expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
                legendFormat: '95th percentile'
              }
            ]
          },
          {
            id: 2,
            title: 'Error Rate',
            type: 'graph',
            targets: [
              {
                expr: 'rate(http_requests_total{status=~"5.."}[5m])',
                legendFormat: '5xx errors'
              }
            ]
          },
          {
            id: 3,
            title: 'CPU Usage',
            type: 'graph',
            targets: [
              {
                expr: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
                legendFormat: 'CPU Usage %'
              }
            ]
          },
          {
            id: 4,
            title: 'Memory Usage',
            type: 'graph',
            targets: [
              {
                expr: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
                legendFormat: 'Memory Usage %'
              }
            ]
          },
          {
            id: 5,
            title: 'Database Connections',
            type: 'graph',
            targets: [
              {
                expr: 'pg_stat_database_numbackends',
                legendFormat: 'Active Connections'
              }
            ]
          },
          {
            id: 6,
            title: 'Blockchain Transactions',
            type: 'graph',
            targets: [
              {
                expr: 'rate(blockchain_transactions_total[5m])',
                legendFormat: 'Transactions/sec'
              }
            ]
          }
        ],
        time: {
          from: 'now-1h',
          to: 'now'
        },
        refresh: '30s'
      }
    };

    fs.writeFileSync(
      'monitoring/grafana/dashboards/lightdom-overview.json',
      JSON.stringify(dashboardConfig, null, 2)
    );

    this.log('Grafana dashboards created', 'success');
  }

  createAlertRules() {
    this.log('Creating alert rules...');
    
    const alertRules = `
groups:
  - name: lightdom.rules
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value }}%"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value }}%"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis cache is not responding"

      - alert: BlockchainConnectionDown
        expr: up{job="blockchain"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Blockchain connection is down"
          description: "Blockchain node connection is not responding"

      - alert: CrawlerDown
        expr: up{job="crawler"} == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Web crawler is down"
          description: "Web crawler service is not responding"
`;

    fs.writeFileSync('monitoring/rules/lightdom.yml', alertRules);
    this.log('Alert rules created', 'success');
  }

  createDockerCompose() {
    this.log('Creating Docker Compose for monitoring stack...');
    
    const dockerCompose = `
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: lightdom-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/rules:/etc/prometheus/rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: lightdom-grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel

  alertmanager:
    image: prom/alertmanager:latest
    container_name: lightdom-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'

  node-exporter:
    image: prom/node-exporter:latest
    container_name: lightdom-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
`;

    fs.writeFileSync('monitoring/docker-compose.yml', dockerCompose);
    this.log('Docker Compose configuration created', 'success');
  }

  createAlertManagerConfig() {
    this.log('Creating AlertManager configuration...');
    
    const alertManagerConfig = `
global:
  smtp_smarthost: '${process.env.SMTP_HOST}:587'
  smtp_from: 'noreply@lightdom.com'
  smtp_auth_username: '${process.env.SMTP_USER}'
  smtp_auth_password: '${process.env.SMTP_PASS}'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: '${process.env.SLACK_WEBHOOK_URL}'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: '${process.env.ALERT_EMAIL_RECIPIENTS}'
        subject: '[CRITICAL] LightDom Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
    slack_configs:
      - api_url: '${process.env.SLACK_WEBHOOK_URL}'
        channel: '#lightdom-alerts'
        title: 'Critical Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'warning-alerts'
    slack_configs:
      - api_url: '${process.env.SLACK_WEBHOOK_URL}'
        channel: '#lightdom-warnings'
        title: 'Warning Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
`;

    fs.writeFileSync('monitoring/alertmanager.yml', alertManagerConfig);
    this.log('AlertManager configuration created', 'success');
  }

  createMonitoringScripts() {
    this.log('Creating monitoring scripts...');
    
    const healthCheckScript = `#!/bin/bash
# Health Check Script for LightDom Platform

set -e

API_URL="http://localhost:3000"
HEALTH_ENDPOINTS=(
  "/health"
  "/health/database"
  "/health/blockchain"
  "/health/crawler"
)

check_endpoint() {
  local endpoint=$1
  local response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
  
  if [ "$response" -eq 200 ]; then
    echo "✅ $endpoint is healthy"
    return 0
  else
    echo "❌ $endpoint is unhealthy (HTTP $response)"
    return 1
  fi
}

echo "Starting health checks for LightDom platform..."

all_healthy=true
for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
  if ! check_endpoint "$endpoint"; then
    all_healthy=false
  fi
done

if [ "$all_healthy" = true ]; then
  echo "🎉 All health checks passed!"
  exit 0
else
  echo "💥 Some health checks failed!"
  exit 1
fi
`;

    fs.writeFileSync('scripts/health-check.sh', healthCheckScript);
    fs.chmodSync('scripts/health-check.sh', '755');

    const metricsScript = `#!/usr/bin/env node
// Metrics Collection Script for LightDom Platform

const os = require('os');
const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor() {
    this.metrics = {};
  }

  collectSystemMetrics() {
    this.metrics.system = {
      cpu: {
        usage: this.getCPUUsage(),
        cores: os.cpus().length,
        loadAverage: os.loadavg()
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch()
    };
  }

  collectApplicationMetrics() {
    // This would typically collect metrics from your application
    this.metrics.application = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      pid: process.pid,
      memoryUsage: process.memoryUsage()
    };
  }

  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length,
      usage: 100 - ~~(100 * totalIdle / totalTick)
    };
  }

  saveMetrics() {
    const metricsFile = path.join(__dirname, '..', 'monitoring', 'metrics.json');
    fs.writeFileSync(metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  collect() {
    this.collectSystemMetrics();
    this.collectApplicationMetrics();
    this.saveMetrics();
    console.log('Metrics collected successfully');
  }
}

const collector = new MetricsCollector();
collector.collect();
`;

    fs.writeFileSync('scripts/collect-metrics.js', metricsScript);
    fs.chmodSync('scripts/collect-metrics.js', '755');

    this.log('Monitoring scripts created', 'success');
  }

  createPackageJsonScripts() {
    this.log('Adding monitoring scripts to package.json...');
    
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.scripts = {
      ...packageJson.scripts,
      'monitor:start': 'docker-compose -f monitoring/docker-compose.yml up -d',
      'monitor:stop': 'docker-compose -f monitoring/docker-compose.yml down',
      'monitor:restart': 'npm run monitor:stop && npm run monitor:start',
      'monitor:logs': 'docker-compose -f monitoring/docker-compose.yml logs -f',
      'monitor:health': 'bash scripts/health-check.sh',
      'monitor:metrics': 'node scripts/collect-metrics.js',
      'monitor:setup': 'node scripts/monitoring-setup.js',
      'health:check': 'npm run monitor:health',
      'metrics:collect': 'npm run monitor:metrics'
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    this.log('Package.json scripts updated', 'success');
  }

  setup() {
    this.log('Setting up comprehensive monitoring for LightDom platform...');
    
    // Create monitoring directory structure
    const dirs = [
      'monitoring',
      'monitoring/grafana',
      'monitoring/grafana/dashboards',
      'monitoring/grafana/provisioning',
      'monitoring/rules',
      'scripts'
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create all monitoring configurations
    this.createHealthCheckConfig();
    this.createPrometheusConfig();
    this.createGrafanaDashboards();
    this.createAlertRules();
    this.createDockerCompose();
    this.createAlertManagerConfig();
    this.createMonitoringScripts();
    this.createPackageJsonScripts();

    this.log('Monitoring setup completed successfully!', 'success');
    this.log('Next steps:', 'info');
    this.log('1. Set up environment variables for SMTP and Slack', 'info');
    this.log('2. Run: npm run monitor:start', 'info');
    this.log('3. Access Grafana at http://localhost:3000 (admin/admin)', 'info');
    this.log('4. Access Prometheus at http://localhost:9090', 'info');
  }
}

// Run monitoring setup
if (require.main === module) {
  const monitoring = new MonitoringSetup();
  monitoring.setup();
}

module.exports = MonitoringSetup;
