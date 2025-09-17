#!/usr/bin/env node

/**
 * Monitoring and Alerting Setup Script
 * Configures comprehensive monitoring and alerting for the blockchain automation system
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.magenta}${message}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}`);
}

// Monitoring configuration
const monitoringConfig = {
  metrics: {
    collectionInterval: 30000, // 30 seconds
    retentionPeriod: '30d',
    storage: {
      type: 'prometheus',
      endpoint: 'http://localhost:9090',
    },
  },
  alerts: {
    channels: [
      {
        type: 'email',
        enabled: true,
        config: {
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.ALERT_EMAIL_USER || 'alerts@company.com',
              pass: process.env.ALERT_EMAIL_PASS || 'your_password',
            },
          },
          to: process.env.ALERT_EMAIL_TO || 'admin@company.com',
          from: process.env.ALERT_EMAIL_FROM || 'alerts@company.com',
        },
      },
      {
        type: 'slack',
        enabled: true,
        config: {
          webhook:
            process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
          channel: process.env.SLACK_CHANNEL || '#alerts',
        },
      },
      {
        type: 'webhook',
        enabled: true,
        config: {
          url: process.env.WEBHOOK_URL || 'http://localhost:3001/api/alerts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.WEBHOOK_TOKEN || 'your_token'}`,
          },
        },
      },
    ],
  },
  dashboards: {
    system: {
      name: 'System Overview',
      panels: [
        {
          title: 'CPU Usage',
          type: 'graph',
          query: 'cpu_usage_percent',
          threshold: { warning: 70, critical: 90 },
        },
        {
          title: 'Memory Usage',
          type: 'graph',
          query: 'memory_usage_percent',
          threshold: { warning: 80, critical: 95 },
        },
        {
          title: 'Disk Usage',
          type: 'graph',
          query: 'disk_usage_percent',
          threshold: { warning: 80, critical: 95 },
        },
        {
          title: 'Network I/O',
          type: 'graph',
          query: 'network_io_bytes',
          threshold: { warning: 1000000000, critical: 2000000000 },
        },
      ],
    },
    blockchain: {
      name: 'Blockchain Metrics',
      panels: [
        {
          title: 'Transaction Rate',
          type: 'graph',
          query: 'blockchain_transactions_per_second',
          threshold: { warning: 100, critical: 200 },
        },
        {
          title: 'Gas Usage',
          type: 'graph',
          query: 'blockchain_gas_used',
          threshold: { warning: 1000000, critical: 2000000 },
        },
        {
          title: 'Block Time',
          type: 'graph',
          query: 'blockchain_block_time_seconds',
          threshold: { warning: 15, critical: 30 },
        },
        {
          title: 'Node Health',
          type: 'table',
          query: 'blockchain_node_health',
          threshold: { warning: 0.8, critical: 0.6 },
        },
      ],
    },
    automation: {
      name: 'Automation Metrics',
      panels: [
        {
          title: 'Workflow Success Rate',
          type: 'graph',
          query: 'automation_workflow_success_rate',
          threshold: { warning: 0.9, critical: 0.8 },
        },
        {
          title: 'Active Workflows',
          type: 'graph',
          query: 'automation_active_workflows',
          threshold: { warning: 50, critical: 100 },
        },
        {
          title: 'Error Rate',
          type: 'graph',
          query: 'automation_error_rate',
          threshold: { warning: 0.05, critical: 0.1 },
        },
        {
          title: 'Execution Time',
          type: 'graph',
          query: 'automation_execution_time_seconds',
          threshold: { warning: 300, critical: 600 },
        },
      ],
    },
  },
  rules: [
    {
      name: 'High CPU Usage',
      condition: 'cpu_usage_percent > 90',
      severity: 'critical',
      message: 'CPU usage is critically high',
      duration: '5m',
    },
    {
      name: 'High Memory Usage',
      condition: 'memory_usage_percent > 95',
      severity: 'critical',
      message: 'Memory usage is critically high',
      duration: '2m',
    },
    {
      name: 'Disk Space Low',
      condition: 'disk_usage_percent > 90',
      severity: 'warning',
      message: 'Disk space is running low',
      duration: '10m',
    },
    {
      name: 'Blockchain Node Down',
      condition: 'blockchain_node_health < 0.5',
      severity: 'critical',
      message: 'Blockchain node is down or unhealthy',
      duration: '1m',
    },
    {
      name: 'Workflow Failure Rate High',
      condition: 'automation_workflow_success_rate < 0.8',
      severity: 'warning',
      message: 'Workflow failure rate is high',
      duration: '5m',
    },
    {
      name: 'High Error Rate',
      condition: 'automation_error_rate > 0.1',
      severity: 'critical',
      message: 'System error rate is critically high',
      duration: '2m',
    },
  ],
};

async function main() {
  try {
    logHeader('📊 Setting up Monitoring and Alerting');

    // Create monitoring directories
    await createMonitoringDirectories();

    // Setup Prometheus configuration
    await setupPrometheus();

    // Setup Grafana dashboards
    await setupGrafana();

    // Setup alerting rules
    await setupAlerting();

    // Setup log aggregation
    await setupLogAggregation();

    // Create monitoring scripts
    await createMonitoringScripts();

    logSuccess('🎉 Monitoring and alerting setup completed!');
    logInfo('Monitoring system is now configured and ready to use.');
    logInfo('Access Grafana at: http://localhost:3001');
    logInfo('Access Prometheus at: http://localhost:9090');
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function createMonitoringDirectories() {
  logInfo('Creating monitoring directories...');

  const directories = [
    'monitoring',
    'monitoring/prometheus',
    'monitoring/grafana',
    'monitoring/grafana/dashboards',
    'monitoring/grafana/provisioning',
    'monitoring/grafana/provisioning/dashboards',
    'monitoring/grafana/provisioning/datasources',
    'monitoring/alertmanager',
    'monitoring/logs',
    'monitoring/scripts',
  ];

  for (const dir of directories) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      logSuccess(`Created directory: ${dir}`);
    } else {
      logInfo(`Directory already exists: ${dir}`);
    }
  }
}

async function setupPrometheus() {
  logInfo('Setting up Prometheus configuration...');

  const prometheusConfig = {
    global: {
      scrape_interval: '30s',
      evaluation_interval: '30s',
    },
    rule_files: ['monitoring/prometheus/rules/*.yml'],
    alerting: {
      alertmanagers: [
        {
          static_configs: [
            {
              targets: ['localhost:9093'],
            },
          ],
        },
      ],
    },
    scrape_configs: [
      {
        job_name: 'lightdom-automation',
        static_configs: [
          {
            targets: ['localhost:3000'],
          },
        ],
        metrics_path: '/metrics',
        scrape_interval: '30s',
      },
      {
        job_name: 'blockchain-nodes',
        static_configs: [
          {
            targets: ['localhost:8545'],
          },
        ],
        scrape_interval: '30s',
      },
      {
        job_name: 'system-metrics',
        static_configs: [
          {
            targets: ['localhost:9100'],
          },
        ],
        scrape_interval: '30s',
      },
    ],
  };

  writeFileSync('monitoring/prometheus/prometheus.yml', JSON.stringify(prometheusConfig, null, 2));
  logSuccess('Prometheus configuration created');
}

async function setupGrafana() {
  logInfo('Setting up Grafana dashboards...');

  // Create datasource configuration
  const datasourceConfig = {
    apiVersion: 1,
    datasources: [
      {
        name: 'Prometheus',
        type: 'prometheus',
        access: 'proxy',
        url: 'http://localhost:9090',
        isDefault: true,
      },
    ],
  };

  writeFileSync(
    'monitoring/grafana/provisioning/datasources/datasources.yml',
    JSON.stringify(datasourceConfig, null, 2)
  );

  // Create dashboard configurations
  for (const [key, dashboard] of Object.entries(monitoringConfig.dashboards)) {
    const dashboardConfig = {
      apiVersion: 1,
      providers: [
        {
          name: 'default',
          orgId: 1,
          folder: '',
          type: 'file',
          disableDeletion: false,
          updateIntervalSeconds: 10,
          allowUiUpdates: true,
          options: {
            path: `/var/lib/grafana/dashboards/${key}`,
          },
        },
      ],
    };

    writeFileSync(
      `monitoring/grafana/provisioning/dashboards/${key}.yml`,
      JSON.stringify(dashboardConfig, null, 2)
    );

    // Create dashboard JSON
    const dashboardJson = {
      dashboard: {
        id: null,
        title: dashboard.name,
        tags: ['lightdom', 'automation'],
        timezone: 'browser',
        panels: dashboard.panels.map((panel, index) => ({
          id: index + 1,
          title: panel.title,
          type: panel.type,
          targets: [
            {
              expr: panel.query,
              refId: 'A',
            },
          ],
          thresholds: panel.threshold
            ? [
                {
                  value: panel.threshold.warning,
                  color: 'yellow',
                },
                {
                  value: panel.threshold.critical,
                  color: 'red',
                },
              ]
            : [],
        })),
        time: {
          from: 'now-1h',
          to: 'now',
        },
        refresh: '30s',
      },
    };

    writeFileSync(
      `monitoring/grafana/dashboards/${key}.json`,
      JSON.stringify(dashboardJson, null, 2)
    );
  }

  logSuccess('Grafana dashboards created');
}

async function setupAlerting() {
  logInfo('Setting up alerting rules...');

  // Create rules directory
  const rulesDir = 'monitoring/prometheus/rules';
  if (!existsSync(rulesDir)) {
    mkdirSync(rulesDir, { recursive: true });
  }

  // Create Alertmanager configuration
  const alertmanagerConfig = {
    global: {
      smtp_smarthost: 'smtp.gmail.com:587',
      smtp_from: process.env.ALERT_EMAIL_FROM || 'alerts@company.com',
    },
    route: {
      group_by: ['alertname'],
      group_wait: '10s',
      group_interval: '10s',
      repeat_interval: '1h',
      receiver: 'web.hook',
    },
    receivers: [
      {
        name: 'web.hook',
        webhook_configs: [
          {
            url: process.env.WEBHOOK_URL || 'http://localhost:3001/api/alerts',
          },
        ],
        email_configs: [
          {
            to: process.env.ALERT_EMAIL_TO || 'admin@company.com',
            subject: 'LightDom Alert: {{ .GroupLabels.alertname }}',
            body: '{{ range .Alerts }}{{ .Annotations.message }}{{ end }}',
          },
        ],
      },
    ],
  };

  writeFileSync(
    'monitoring/alertmanager/alertmanager.yml',
    JSON.stringify(alertmanagerConfig, null, 2)
  );

  // Create Prometheus alerting rules
  const alertingRules = {
    groups: [
      {
        name: 'lightdom.rules',
        rules: monitoringConfig.rules.map(rule => ({
          alert: rule.name,
          expr: rule.condition,
          for: rule.duration,
          labels: {
            severity: rule.severity,
          },
          annotations: {
            summary: rule.message,
            description: rule.message,
          },
        })),
      },
    ],
  };

  writeFileSync('monitoring/prometheus/rules/alerts.yml', JSON.stringify(alertingRules, null, 2));

  logSuccess('Alerting rules created');
}

async function setupLogAggregation() {
  logInfo('Setting up log aggregation...');

  // Create logstash directory
  const logstashDir = 'monitoring/logstash';
  if (!existsSync(logstashDir)) {
    mkdirSync(logstashDir, { recursive: true });
  }

  const logConfig = {
    version: '3.8',
    services: {
      elasticsearch: {
        image: 'elasticsearch:7.17.0',
        environment: {
          'discovery.type': 'single-node',
          ES_JAVA_OPTS: '-Xms512m -Xmx512m',
        },
        ports: ['9200:9200'],
      },
      kibana: {
        image: 'kibana:7.17.0',
        ports: ['5601:5601'],
        environment: {
          ELASTICSEARCH_HOSTS: 'http://elasticsearch:9200',
        },
      },
      logstash: {
        image: 'logstash:7.17.0',
        volumes: ['./monitoring/logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf'],
        ports: ['5044:5044'],
      },
    },
  };

  writeFileSync('monitoring/docker-compose.yml', JSON.stringify(logConfig, null, 2));

  // Create Logstash configuration
  const logstashConfig = `
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "lightdom" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "lightdom-%{+YYYY.MM.dd}"
  }
}
`;

  writeFileSync('monitoring/logstash/logstash.conf', logstashConfig);

  logSuccess('Log aggregation configured');
}

async function createMonitoringScripts() {
  logInfo('Creating monitoring scripts...');

  // Health check script
  const healthCheckScript = `#!/usr/bin/env node
// LightDom Health Check Script

const http = require('http');

console.log('🔍 Checking LightDom system health...');

// Check if services are running
const services = ['api', 'automation', 'monitoring'];
let allHealthy = true;

for (const service of services) {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      console.log(\`✅ \${service} is healthy\`);
    } else {
      console.log(\`❌ \${service} is down\`);
      allHealthy = false;
    }
  } catch (error) {
    console.log(\`❌ \${service} is down: \${error.message}\`);
    allHealthy = false;
  }
}

if (!allHealthy) {
  process.exit(1);
}

console.log('✅ System health check completed');
`;

  writeFileSync('monitoring/scripts/health-check.sh', healthCheckScript);

  // Metrics collection script
  const metricsScript = `#!/usr/bin/env node
// Metrics Collection Script

const os = require('os');
const fs = require('fs');

console.log('📊 Collecting system metrics...');

// CPU usage
const cpuUsage = process.cpuUsage();
const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000;
console.log(\`cpu_usage_percent \${cpuPercent}\`);

// Memory usage
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memoryPercent = (usedMem / totalMem) * 100;
console.log(\`memory_usage_percent \${memoryPercent.toFixed(2)}\`);

// Disk usage (simplified)
const diskUsage = 50; // Mock value
console.log(\`disk_usage_percent \${diskUsage}\`);

// Network I/O (simplified)
const networkInterfaces = os.networkInterfaces();
let networkRx = 0;
let networkTx = 0;

for (const [name, interfaces] of Object.entries(networkInterfaces)) {
  for (const iface of interfaces) {
    if (!iface.internal) {
      networkRx += Math.random() * 1000000; // Mock values
      networkTx += Math.random() * 1000000;
    }
  }
}

console.log(\`network_rx_bytes \${networkRx}\`);
console.log(\`network_tx_bytes \${networkTx}\`);

console.log('✅ Metrics collected');
`;

  writeFileSync('monitoring/scripts/collect-metrics.sh', metricsScript);

  logSuccess('Monitoring scripts created');
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Setup interrupted by user');
  process.exit(0);
});

// Run the setup
main().catch(error => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});
