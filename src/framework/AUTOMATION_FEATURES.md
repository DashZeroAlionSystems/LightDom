# LightDom Automation Features

## 🎭 Overview

The LightDom Framework now includes comprehensive automation features that integrate with Cursor API and n8n for automated app management. These features provide:

- **Cursor API Integration**: Direct integration with Cursor API for code execution and workflow management
- **N8N Workflow Management**: Visual workflow automation using n8n
- **Automation Orchestrator**: Centralized coordination of all automation activities
- **Real-time Monitoring**: Continuous monitoring and alerting
- **Event-driven Automation**: Reactive automation based on system events

## 🚀 Key Features

### 1. Cursor API Integration

#### Workflow Management
```typescript
// Create a Cursor API workflow
const workflow = await lightDomFramework.createCursorWorkflow({
  name: 'Performance Monitor',
  description: 'Monitors performance and triggers optimization',
  trigger: {
    type: 'schedule',
    config: { interval: 300000 }, // 5 minutes
    enabled: true
  },
  status: 'active',
  actions: [
    {
      id: 'check_performance',
      type: 'code_execution',
      name: 'Check Performance Metrics',
      config: {
        language: 'javascript',
        code: `
          const status = lightDomFramework.getStatus();
          if (status.performance.averageProcessingTime > 5000) {
            await lightDomFramework.optimizePerformance();
          }
        `
      },
      enabled: true,
      order: 1
    }
  ]
});
```

#### Automation Rules
```typescript
// Create automation rule
const rule = await lightDomFramework.createAutomationRule({
  name: 'Storage Optimization',
  description: 'Optimizes storage when utilization is high',
  conditions: [
    {
      type: 'age',
      operator: 'greater_than',
      value: 10,
      unit: 'minutes'
    }
  ],
  actions: [
    {
      type: 'cleanup_files',
      config: { threshold: 80 },
      priority: 'medium'
    }
  ],
  enabled: true,
  priority: 'high'
});
```

### 2. N8N Workflow Management

#### Deploy N8N Workflows
```typescript
// Deploy N8N workflow from template
const workflow = await lightDomFramework.deployN8NWorkflow(
  'lightdom-auto-optimization',
  {
    api_url: 'http://localhost:3000',
    slack_webhook: process.env.SLACK_WEBHOOK_URL
  }
);
```

#### Execute N8N Workflows
```typescript
// Execute N8N workflow
const execution = await lightDomFramework.executeN8NWorkflow(
  workflow.id,
  { input: 'test data' }
);
```

### 3. Automation Orchestrator

#### Initialize Automation
```typescript
// Initialize automation orchestrator
await lightDomFramework.initializeAutomation();

// Get automation status
const status = lightDomFramework.getAutomationStatus();
console.log('Automation Status:', status);
```

#### Monitor Automation
```typescript
// Get automation statistics
const stats = lightDomFramework.getAutomationStats();
console.log('Total Events:', stats.totalEvents);
console.log('Active Workflows:', stats.activeWorkflows);
console.log('Success Rate:', stats.successfulExecutions / stats.totalEvents);
```

## 📊 N8N Workflow Templates

### 1. LightDom Auto Optimization
- **Trigger**: Schedule (every 5 minutes)
- **Actions**: 
  - Get LightDom metrics
  - Check performance thresholds
  - Run optimization if needed
  - Send notifications

### 2. LightDom Storage Management
- **Trigger**: Webhook
- **Actions**:
  - Get storage metrics
  - Check storage usage
  - Execute storage optimization
  - Log results

### 3. LightDom Mining Automation
- **Trigger**: Cron (every hour)
- **Actions**:
  - Get mining queue
  - Process mining batches
  - Start mining jobs
  - Monitor progress

### 4. LightDom Deployment Automation
- **Trigger**: Git webhook
- **Actions**:
  - Check git changes
  - Build and test
  - Deploy services
  - Run health checks
  - Send notifications

### 5. LightDom Monitoring Alerts
- **Trigger**: Schedule (every 2 minutes)
- **Actions**:
  - Get system health
  - Check alert thresholds
  - Send alerts to Slack

## 🔧 Configuration

### Environment Variables
```bash
# Cursor API Configuration
CURSOR_API_KEY=your_cursor_api_key
CURSOR_API_URL=https://api.cursor.com

# N8N Configuration
N8N_BASE_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key

# Notification Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
GIT_WEBHOOK_URL=https://your-git-webhook-url.com
```

### Automation Configuration
```typescript
const config = {
  enableCursorAPI: true,
  enableN8N: true,
  enableLightDomIntegration: true,
  monitoringInterval: 30000,
  alertThresholds: {
    cpuUsage: 80,
    memoryUsage: 85,
    diskUsage: 90,
    errorRate: 10,
    responseTime: 5000,
    storageUtilization: 80,
    miningSuccessRate: 70
  }
};
```

## 🎯 Usage Examples

### Basic Setup
```typescript
import { lightDomFramework } from './src/framework';

// Initialize framework with automation
await lightDomFramework.initialize();
await lightDomFramework.initializeAutomation();

// Create storage nodes
const node = await lightDomFramework.createStorageNode({
  name: 'Mining Node',
  capacity: 10000,
  location: 'us-east-1',
  priority: 'high'
});

// Add URLs to mining queue
const jobIds = await lightDomFramework.addMiningJobs([
  { url: 'https://example.com', priority: 'high' },
  { url: 'https://github.com', priority: 'medium' }
]);
```

### Advanced Automation
```typescript
// Create performance monitoring workflow
const performanceWorkflow = await lightDomFramework.createCursorWorkflow({
  name: 'Performance Monitor',
  description: 'Monitors and optimizes performance',
  trigger: {
    type: 'schedule',
    config: { interval: 300000 },
    enabled: true
  },
  status: 'active',
  actions: [
    {
      id: 'monitor_performance',
      type: 'code_execution',
      name: 'Monitor Performance',
      config: {
        language: 'javascript',
        code: `
          const status = lightDomFramework.getStatus();
          const storageMetrics = lightDomFramework.getStorageMetrics();
          const miningStats = lightDomFramework.getMiningStats();
          
          // Check performance thresholds
          if (status.performance.averageProcessingTime > 3000) {
            console.log('High processing time detected');
            // Trigger optimization
          }
          
          if (storageMetrics.utilizationRate > 75) {
            console.log('High storage utilization detected');
            // Trigger storage cleanup
          }
          
          if (miningStats.successRate < 80) {
            console.log('Low mining success rate detected');
            // Trigger mining optimization
          }
        `
      },
      enabled: true,
      order: 1
    }
  ]
});

// Deploy N8N workflows
const n8nWorkflows = await Promise.all([
  lightDomFramework.deployN8NWorkflow('lightdom-auto-optimization'),
  lightDomFramework.deployN8NWorkflow('lightdom-storage-management'),
  lightDomFramework.deployN8NWorkflow('lightdom-mining-automation')
]);
```

### Monitoring and Alerts
```typescript
// Set up event listeners
lightDomFramework.on('automationInitialized', () => {
  console.log('Automation system initialized');
});

lightDomFramework.on('workflowExecuted', (execution) => {
  console.log(`Workflow executed: ${execution.id}`);
});

// Monitor automation status
setInterval(() => {
  const status = lightDomFramework.getAutomationStatus();
  const stats = lightDomFramework.getAutomationStats();
  
  console.log('Automation Status:', {
    orchestrator: status.orchestrator.running,
    cursorAPI: status.cursorAPI.running,
    n8n: status.n8n.running,
    totalEvents: stats.totalEvents,
    activeWorkflows: stats.activeWorkflows
  });
}, 60000); // Check every minute
```

## 🚀 Quick Start

### 1. Start the Framework
```bash
# Start with automation enabled
npm start

# Or start in development mode
npm run start:dev
```

### 2. Run Automation Demo
```bash
# Run comprehensive automation demo
npm run demo:automation
```

### 3. Deploy N8N Workflows
```typescript
// Deploy all LightDom workflows
const workflows = await n8nWorkflowManager.deployAllLightDomWorkflows();
console.log(`Deployed ${workflows.length} workflows`);
```

### 4. Create Automation Rules
```typescript
// Create performance monitoring rule
const rule = await lightDomFramework.createAutomationRule({
  name: 'Performance Alert',
  description: 'Alerts when performance degrades',
  conditions: [
    {
      type: 'age',
      operator: 'greater_than',
      value: 5,
      unit: 'minutes'
    }
  ],
  actions: [
    {
      type: 'notification',
      config: { message: 'Performance alert triggered' },
      priority: 'high'
    }
  ],
  enabled: true,
  priority: 'high'
});
```

## 📈 Monitoring and Analytics

### Automation Statistics
```typescript
const stats = lightDomFramework.getAutomationStats();
console.log('Automation Statistics:', {
  totalEvents: stats.totalEvents,
  activeWorkflows: stats.activeWorkflows,
  successfulExecutions: stats.successfulExecutions,
  failedExecutions: stats.failedExecutions,
  averageExecutionTime: stats.averageExecutionTime,
  uptime: stats.uptime
});
```

### Event Monitoring
```typescript
// Get all automation events
const events = lightDomFramework.getAutomationEvents();
console.log(`Total Events: ${events.length}`);

// Get events by type
const alertEvents = events.filter(e => e.type === 'metric_alert');
const workflowEvents = events.filter(e => e.type === 'workflow_execution');

// Get events by severity
const criticalEvents = events.filter(e => e.severity === 'critical');
const warningEvents = events.filter(e => e.severity === 'warning');
```

### Workflow Status
```typescript
// Get Cursor API workflows
const cursorWorkflows = lightDomFramework.getAllCursorWorkflows();
console.log(`Cursor Workflows: ${cursorWorkflows.length}`);

// Get N8N workflows
const n8nWorkflows = lightDomFramework.getAllN8NWorkflows();
console.log(`N8N Workflows: ${n8nWorkflows.length}`);

// Get automation rules
const rules = lightDomFramework.getAllAutomationRules();
console.log(`Automation Rules: ${rules.length}`);
```

## 🔍 Troubleshooting

### Common Issues

1. **Cursor API Connection Failed**
   - Check CURSOR_API_KEY environment variable
   - Verify CURSOR_API_URL is correct
   - Ensure API key has proper permissions

2. **N8N Workflow Deployment Failed**
   - Check N8N_BASE_URL and N8N_API_KEY
   - Ensure N8N instance is running
   - Verify workflow template exists

3. **Automation Rules Not Triggering**
   - Check rule conditions and thresholds
   - Verify rule is enabled
   - Check monitoring interval settings

4. **Workflow Execution Failed**
   - Check workflow configuration
   - Verify required services are running
   - Check execution logs for errors

### Debug Commands
```bash
# Check automation status
npx lightdom automation status

# Check workflow status
npx lightdom workflows list

# Check automation events
npx lightdom automation events

# Check automation statistics
npx lightdom automation stats
```

## 🔮 Future Enhancements

### Planned Features
- **AI-Powered Automation**: Machine learning for intelligent automation
- **Visual Workflow Builder**: Drag-and-drop workflow creation
- **Advanced Analytics**: Detailed automation analytics and insights
- **Multi-Cloud Support**: Support for multiple cloud providers
- **Real-time Collaboration**: Team collaboration on automation workflows

### Research Areas
- **Automation Intelligence**: Smarter automation decision making
- **Performance Optimization**: Better automation performance
- **Security Integration**: Enhanced security for automation workflows
- **Scalability**: Better handling of large-scale automation

---

## 🎉 Conclusion

The LightDom Automation Features provide a comprehensive solution for automated app management using Cursor API and n8n. With real-time monitoring, intelligent automation, and extensive workflow templates, the framework can automatically manage and optimize the LightDom application with minimal human intervention.

**Key Benefits:**
- ✅ **Automated Management**: Hands-free app management and optimization
- ✅ **Visual Workflows**: Easy-to-use n8n workflow templates
- ✅ **Real-time Monitoring**: Continuous monitoring and alerting
- ✅ **Event-driven Automation**: Reactive automation based on system events
- ✅ **Scalable Architecture**: Easy horizontal scaling
- ✅ **Production Ready**: Robust error handling and recovery

The automation features are now fully integrated and ready for production use! 🚀
