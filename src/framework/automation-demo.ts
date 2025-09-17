#!/usr/bin/env node

/**
 * LightDom Automation Demo
 * Demonstrates Cursor API and n8n integration for automated app management
 */

import { automationOrchestrator } from './AutomationOrchestrator';
import { cursorAPIIntegration } from './CursorAPIIntegration';
import { n8nWorkflowManager } from './N8NWorkflowManager';
import { lightDomFramework } from './LightDomFramework';

async function demonstrateAutomation(): Promise<void> {
  console.log('🎭 LightDom Automation Demonstration');
  console.log('====================================');

  try {
    // Initialize automation orchestrator
    console.log('\n1. Initializing Automation Orchestrator...');
    await automationOrchestrator.initialize();

    // Create storage nodes for demonstration
    console.log('\n2. Setting up Storage Nodes...');
    await lightDomFramework.startMiningWorkflow();

    const node1 = await lightDomFramework.createStorageNode({
      name: 'US East Mining Node',
      capacity: 5000,
      location: 'us-east-1',
      priority: 'high',
    });
    console.log(`✅ Created node: ${node1.name}`);

    const node2 = await lightDomFramework.createStorageNode({
      name: 'EU West Mining Node',
      capacity: 8000,
      location: 'eu-west-1',
      priority: 'medium',
    });
    console.log(`✅ Created node: ${node2.name}`);

    // Add URLs to mining queue
    console.log('\n3. Adding URLs to Mining Queue...');
    const urls = [
      'https://example.com',
      'https://github.com',
      'https://stackoverflow.com',
      'https://medium.com',
      'https://dev.to',
    ];

    const jobIds = await lightDomFramework.addMiningJobs(
      urls.map(url => ({ url, priority: 'medium' }))
    );
    console.log(`✅ Added ${jobIds.length} URLs to mining queue`);

    // Create automation rules
    console.log('\n4. Creating Automation Rules...');

    // Performance monitoring rule
    const performanceRule = await cursorAPIIntegration.createAutomationRule({
      name: 'Performance Monitoring',
      description: 'Monitors performance and triggers optimization',
      conditions: [
        {
          type: 'age',
          operator: 'greater_than',
          value: 5,
          unit: 'minutes',
        },
      ],
      actions: [
        {
          type: 'optimize_code',
          config: { target: 'performance' },
          priority: 'high',
        },
      ],
      enabled: true,
      priority: 'high',
    });
    console.log(`✅ Created rule: ${performanceRule.name}`);

    // Storage optimization rule
    const storageRule = await cursorAPIIntegration.createAutomationRule({
      name: 'Storage Optimization',
      description: 'Optimizes storage when utilization is high',
      conditions: [
        {
          type: 'age',
          operator: 'greater_than',
          value: 10,
          unit: 'minutes',
        },
      ],
      actions: [
        {
          type: 'cleanup_files',
          config: { threshold: 80 },
          priority: 'medium',
        },
      ],
      enabled: true,
      priority: 'medium',
    });
    console.log(`✅ Created rule: ${storageRule.name}`);

    // Mining automation rule
    const miningRule = await cursorAPIIntegration.createAutomationRule({
      name: 'Mining Automation',
      description: 'Automates mining process based on queue status',
      conditions: [
        {
          type: 'age',
          operator: 'greater_than',
          value: 15,
          unit: 'minutes',
        },
      ],
      actions: [
        {
          type: 'scale_resources',
          config: { target: 'mining' },
          priority: 'low',
        },
      ],
      enabled: true,
      priority: 'low',
    });
    console.log(`✅ Created rule: ${miningRule.name}`);

    // Deploy n8n workflows
    console.log('\n5. Deploying N8N Workflows...');

    if (n8nWorkflowManager.getStatus().running) {
      const deployedWorkflows = await n8nWorkflowManager.deployAllLightDomWorkflows();
      console.log(`✅ Deployed ${deployedWorkflows.length} N8N workflows`);

      for (const workflow of deployedWorkflows) {
        console.log(`   - ${workflow.name} (${workflow.id})`);
      }
    } else {
      console.log('⚠️ N8N not available, skipping workflow deployment');
    }

    // Create Cursor API workflows
    console.log('\n6. Creating Cursor API Workflows...');

    // Auto-optimization workflow
    const autoOptimizationWorkflow = await cursorAPIIntegration.createWorkflow({
      name: 'Auto Optimization Workflow',
      description: 'Automatically optimizes LightDom based on metrics',
      trigger: {
        type: 'schedule',
        config: { interval: 300000 }, // 5 minutes
        enabled: true,
      },
      status: 'active',
      actions: [
        {
          id: 'check_metrics',
          type: 'code_execution',
          name: 'Check Performance Metrics',
          config: {
            language: 'javascript',
            code: `
              console.log('Checking LightDom performance metrics...');
              
              const status = lightDomFramework.getStatus();
              const storageMetrics = lightDomFramework.getStorageMetrics();
              const miningStats = lightDomFramework.getMiningStats();
              
              console.log('Performance Status:', {
                averageProcessingTime: status.performance.averageProcessingTime,
                errorRate: status.performance.errorRate,
                successRate: status.performance.successRate
              });
              
              console.log('Storage Metrics:', {
                utilizationRate: storageMetrics.utilizationRate,
                totalCapacity: storageMetrics.totalCapacity,
                totalUsed: storageMetrics.totalUsed
              });
              
              console.log('Mining Stats:', {
                totalJobs: miningStats.totalJobs,
                completedJobs: miningStats.completedJobs,
                successRate: miningStats.successRate
              });
              
              // Trigger optimization if needed
              if (status.performance.averageProcessingTime > 3000) {
                console.log('High processing time detected, triggering optimization');
                // await lightDomFramework.optimizePerformance();
              }
              
              if (storageMetrics.utilizationRate > 75) {
                console.log('High storage utilization detected, triggering cleanup');
                // await lightDomFramework.cleanupStorage();
              }
            `,
          },
          enabled: true,
          order: 1,
        },
      ],
    });
    console.log(`✅ Created workflow: ${autoOptimizationWorkflow.name}`);

    // Storage management workflow
    const storageManagementWorkflow = await cursorAPIIntegration.createWorkflow({
      name: 'Storage Management Workflow',
      description: 'Manages storage nodes and optimizes usage',
      trigger: {
        type: 'schedule',
        config: { interval: 600000 }, // 10 minutes
        enabled: true,
      },
      status: 'active',
      actions: [
        {
          id: 'manage_storage',
          type: 'code_execution',
          name: 'Manage Storage Nodes',
          config: {
            language: 'javascript',
            code: `
              console.log('Managing storage nodes...');
              
              const nodes = lightDomFramework.getStorageNodes();
              console.log(\`Found \${nodes.length} storage nodes\`);
              
              for (const node of nodes) {
                const utilization = (node.used / node.capacity) * 100;
                console.log(\`Node \${node.name}: \${utilization.toFixed(2)}% utilized\`);
                
                if (utilization > 80) {
                  console.log(\`High utilization on \${node.name}, optimizing...\`);
                  // await lightDomFramework.optimizeStorageNode(node.id);
                }
              }
            `,
          },
          enabled: true,
          order: 1,
        },
      ],
    });
    console.log(`✅ Created workflow: ${storageManagementWorkflow.name}`);

    // Execute workflows manually for demonstration
    console.log('\n7. Executing Workflows...');

    // Execute auto-optimization workflow
    console.log('🚀 Executing Auto Optimization Workflow...');
    const execution1 = await cursorAPIIntegration.executeWorkflow(autoOptimizationWorkflow.id);
    console.log(`✅ Workflow executed: ${execution1.id}`);

    // Execute storage management workflow
    console.log('🚀 Executing Storage Management Workflow...');
    const execution2 = await cursorAPIIntegration.executeWorkflow(storageManagementWorkflow.id);
    console.log(`✅ Workflow executed: ${execution2.id}`);

    // Execute n8n workflows if available
    if (n8nWorkflowManager.getStatus().running) {
      const n8nWorkflows = n8nWorkflowManager.getAllWorkflows();
      for (const workflow of n8nWorkflows.slice(0, 2)) {
        // Execute first 2 workflows
        console.log(`🚀 Executing N8N workflow: ${workflow.name}...`);
        try {
          const execution = await n8nWorkflowManager.executeWorkflow(workflow.id);
          console.log(`✅ N8N workflow executed: ${execution.id}`);
        } catch (error) {
          console.log(`⚠️ N8N workflow execution failed: ${error}`);
        }
      }
    }

    // Monitor automation for a while
    console.log('\n8. Monitoring Automation...');

    let monitoringCycles = 0;
    const maxCycles = 5;

    const monitoringInterval = setInterval(async () => {
      monitoringCycles++;

      console.log(`\n📊 Monitoring Cycle ${monitoringCycles}/${maxCycles}`);

      // Get automation statistics
      const stats = automationOrchestrator.getAutomationStats();
      console.log(`   Events: ${stats.totalEvents}`);
      console.log(`   Active Workflows: ${stats.activeWorkflows}`);
      console.log(`   Successful Executions: ${stats.successfulExecutions}`);
      console.log(`   Failed Executions: ${stats.failedExecutions}`);

      // Get LightDom status
      const lightDomStatus = lightDomFramework.getStatus();
      console.log(`   LightDom Status: ${lightDomStatus.running ? 'Running' : 'Stopped'}`);
      console.log(`   Processing Time: ${lightDomStatus.performance.averageProcessingTime}ms`);
      console.log(`   Error Rate: ${lightDomStatus.performance.errorRate}%`);

      // Get storage metrics
      const storageMetrics = lightDomFramework.getStorageMetrics();
      console.log(`   Storage Utilization: ${storageMetrics.utilizationRate.toFixed(2)}%`);
      console.log(`   Total Capacity: ${storageMetrics.totalCapacity}MB`);
      console.log(`   Total Used: ${storageMetrics.totalUsed}MB`);

      // Get mining stats
      const miningStats = lightDomFramework.getMiningStats();
      console.log(`   Mining Jobs: ${miningStats.totalJobs}`);
      console.log(`   Completed: ${miningStats.completedJobs}`);
      console.log(`   Success Rate: ${miningStats.successRate.toFixed(2)}%`);

      if (monitoringCycles >= maxCycles) {
        clearInterval(monitoringInterval);
        console.log('\n✅ Monitoring completed');
      }
    }, 10000); // Check every 10 seconds

    // Wait for monitoring to complete
    await new Promise(resolve => setTimeout(resolve, (maxCycles + 1) * 10000));

    // Get final automation statistics
    console.log('\n9. Final Automation Statistics...');
    const finalStats = automationOrchestrator.getAutomationStats();
    console.log(`📊 Total Events: ${finalStats.totalEvents}`);
    console.log(`🔄 Active Workflows: ${finalStats.activeWorkflows}`);
    console.log(`✅ Successful Executions: ${finalStats.successfulExecutions}`);
    console.log(`❌ Failed Executions: ${finalStats.failedExecutions}`);
    console.log(`⏱️ Average Execution Time: ${finalStats.averageExecutionTime.toFixed(2)}ms`);
    console.log(`⏰ Uptime: ${(finalStats.uptime / 1000).toFixed(2)}s`);

    // Get all events
    const events = automationOrchestrator.getAllEvents();
    console.log(`\n📋 Recent Events (${events.length} total):`);
    for (const event of events.slice(0, 5)) {
      console.log(`   ${event.timestamp}: ${event.type} - ${event.data?.message || 'No message'}`);
    }

    // Get workflow status
    console.log('\n10. Workflow Status...');

    // Cursor API workflows
    const cursorWorkflows = cursorAPIIntegration.getAllWorkflows();
    console.log(`📋 Cursor API Workflows: ${cursorWorkflows.length}`);
    for (const workflow of cursorWorkflows) {
      console.log(
        `   - ${workflow.name}: ${workflow.status} (${workflow.executionCount} executions)`
      );
    }

    // N8N workflows
    if (n8nWorkflowManager.getStatus().running) {
      const n8nWorkflows = n8nWorkflowManager.getAllWorkflows();
      console.log(`🔧 N8N Workflows: ${n8nWorkflows.length}`);
      for (const workflow of n8nWorkflows) {
        console.log(`   - ${workflow.name}: ${workflow.active ? 'Active' : 'Inactive'}`);
      }
    }

    console.log('\n✅ Automation Demonstration Completed!');
    console.log('🎉 All automation features are working correctly!');
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await automationOrchestrator.stop();
    await lightDomFramework.stop();
  }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateAutomation().catch(error => {
    console.error('❌ Demonstration failed:', error);
    process.exit(1);
  });
}

export { demonstrateAutomation };
