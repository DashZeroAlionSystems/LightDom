#!/usr/bin/env node

/**
 * LightDom Storage Features Examples
 * Demonstrates storage node creation, web address mining, and storage optimization
 */

import { lightDomFramework } from './LightDomFramework';
import { storageNodeManager } from './StorageNodeManager';
import { webAddressMiner } from './WebAddressMiner';
import { storageOptimizer } from './StorageOptimizer';

async function demonstrateStorageFeatures(): Promise<void> {
  console.log('🚀 LightDom Storage Features Demonstration');
  console.log('==========================================');

  try {
    // Initialize the framework
    console.log('\n1. Initializing LightDom Framework...');
    await lightDomFramework.initialize();
    await lightDomFramework.startMiningWorkflow();

    // Create storage nodes
    console.log('\n2. Creating Storage Nodes...');

    const node1 = await lightDomFramework.createStorageNode({
      name: 'US East Mining Node',
      capacity: 5000, // 5GB
      location: 'us-east-1',
      priority: 'high',
    });
    console.log(`✅ Created node: ${node1.name} (${node1.id})`);

    const node2 = await lightDomFramework.createStorageNode({
      name: 'EU West Mining Node',
      capacity: 8000, // 8GB
      location: 'eu-west-1',
      priority: 'medium',
    });
    console.log(`✅ Created node: ${node2.name} (${node2.id})`);

    const node3 = await lightDomFramework.createStorageNode({
      name: 'Asia Pacific Mining Node',
      capacity: 3000, // 3GB
      location: 'ap-southeast-1',
      priority: 'low',
    });
    console.log(`✅ Created node: ${node3.name} (${node3.id})`);

    // Add web addresses to mining queue
    console.log('\n3. Adding Web Addresses to Mining Queue...');

    const urls = [
      { url: 'https://example.com', priority: 'high' as const },
      { url: 'https://github.com', priority: 'high' as const },
      { url: 'https://stackoverflow.com', priority: 'medium' as const },
      { url: 'https://medium.com', priority: 'medium' as const },
      { url: 'https://dev.to', priority: 'low' as const },
      { url: 'https://css-tricks.com', priority: 'low' as const },
      { url: 'https://smashingmagazine.com', priority: 'medium' as const },
      { url: 'https://web.dev', priority: 'high' as const },
    ];

    const jobIds = await lightDomFramework.addMiningJobs(urls);
    console.log(`✅ Added ${jobIds.length} URLs to mining queue`);

    // Monitor mining progress
    console.log('\n4. Monitoring Mining Progress...');

    let completedJobs = 0;
    const totalJobs = jobIds.length;

    const progressInterval = setInterval(() => {
      const jobs = lightDomFramework.getAllMiningJobs();
      const completed = jobs.filter(job => job.status === 'completed').length;
      const failed = jobs.filter(job => job.status === 'failed').length;
      const active = jobs.filter(job =>
        ['mining', 'analyzing', 'optimizing'].includes(job.status)
      ).length;

      console.log(
        `📊 Mining Progress: ${completed}/${totalJobs} completed, ${failed} failed, ${active} active`
      );

      if (completed + failed >= totalJobs) {
        clearInterval(progressInterval);
        completedJobs = completed;
      }
    }, 2000);

    // Wait for mining to complete
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    clearInterval(progressInterval);

    // Get mining statistics
    console.log('\n5. Mining Statistics...');
    const miningStats = lightDomFramework.getMiningStats();
    console.log(`📈 Total Jobs: ${miningStats.totalJobs}`);
    console.log(`✅ Completed: ${miningStats.completedJobs}`);
    console.log(`❌ Failed: ${miningStats.failedJobs}`);
    console.log(`📊 Success Rate: ${miningStats.successRate.toFixed(2)}%`);
    console.log(`💾 Total Space Saved: ${miningStats.totalSpaceSaved}KB`);
    console.log(`🪙 Total Tokens Earned: ${miningStats.totalTokensEarned}`);

    // Get storage metrics
    console.log('\n6. Storage Metrics...');
    const storageMetrics = lightDomFramework.getStorageMetrics();
    console.log(`📦 Total Nodes: ${storageMetrics.totalNodes}`);
    console.log(`🟢 Active Nodes: ${storageMetrics.activeNodes}`);
    console.log(`💾 Total Capacity: ${storageMetrics.totalCapacity}MB`);
    console.log(`📊 Used Storage: ${storageMetrics.totalUsed}MB`);
    console.log(`📈 Utilization Rate: ${storageMetrics.utilizationRate.toFixed(2)}%`);
    console.log(`🔧 Optimizations Completed: ${storageMetrics.optimizationsCompleted}`);

    // Demonstrate storage optimization
    console.log('\n7. Storage Optimization...');

    // Update storage policy for more aggressive optimization
    lightDomFramework.updateStoragePolicy({
      cleanupThreshold: 50, // Start cleanup at 50% usage
      compressionThreshold: 40, // Start compression at 40% usage
      archivalThreshold: 70, // Start archival at 70% usage
      retentionPeriod: 7, // Keep data for 7 days
    });
    console.log('✅ Updated storage policy for aggressive optimization');

    // Optimize storage for each node
    const nodes = lightDomFramework.getStorageNodes();
    for (const node of nodes) {
      console.log(`🔧 Optimizing storage for node: ${node.name}`);
      const optimization = await lightDomFramework.optimizeStorageNode(node.id);
      console.log(`✅ Optimization completed: ${optimization.spaceSaved}MB saved`);
    }

    // Get final storage metrics
    console.log('\n8. Final Storage Metrics...');
    const finalMetrics = lightDomFramework.getStorageMetrics();
    console.log(`💾 Total Space Saved: ${finalMetrics.spaceSaved}MB`);
    console.log(`🔧 Nodes Optimized: ${finalMetrics.nodesOptimized}`);
    console.log(
      `📊 Average Optimization Time: ${finalMetrics.averageOptimizationTime.toFixed(2)} minutes`
    );

    // Demonstrate node management
    console.log('\n9. Node Management...');

    // Get node details
    for (const node of nodes) {
      const nodeDetails = lightDomFramework.getStorageNode(node.id);
      if (nodeDetails) {
        console.log(`\n📦 Node: ${nodeDetails.name}`);
        console.log(`   ID: ${nodeDetails.id}`);
        console.log(`   Status: ${nodeDetails.status}`);
        console.log(`   Capacity: ${nodeDetails.capacity}MB`);
        console.log(`   Used: ${nodeDetails.used}MB`);
        console.log(`   Available: ${nodeDetails.available}MB`);
        console.log(`   Mining Rate: ${nodeDetails.performance.miningRate.toFixed(2)} jobs/hour`);
        console.log(`   Success Rate: ${nodeDetails.performance.successRate.toFixed(2)}%`);
        console.log(`   Total Space Harvested: ${nodeDetails.performance.totalSpaceHarvested}KB`);
        console.log(`   Total Tokens Earned: ${nodeDetails.performance.totalTokensEarned}`);
      }
    }

    // Demonstrate mining job details
    console.log('\n10. Mining Job Details...');
    const allJobs = lightDomFramework.getAllMiningJobs();
    const completedJobs = allJobs.filter(job => job.status === 'completed');

    for (const job of completedJobs.slice(0, 3)) {
      // Show first 3 completed jobs
      console.log(`\n⛏️ Job: ${job.url}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Priority: ${job.priority}`);
      if (job.results) {
        console.log(`   Original Size: ${job.results.originalSize}KB`);
        console.log(`   Optimized Size: ${job.results.optimizedSize}KB`);
        console.log(`   Space Saved: ${job.results.spaceSaved}KB`);
        console.log(`   Optimization Rate: ${job.results.optimizationRate.toFixed(2)}%`);
        console.log(`   Tokens Earned: ${job.results.tokensEarned}`);
        console.log(`   Optimizations Applied: ${job.results.optimizations.length}`);
      }
    }

    // Get comprehensive mining status
    console.log('\n11. Comprehensive Mining Status...');
    const miningStatus = lightDomFramework.getMiningStatus();
    console.log(
      `📦 Storage Nodes: ${miningStatus.storageNodes.total} total, ${miningStatus.storageNodes.active} active`
    );
    console.log(
      `⛏️ Mining Jobs: ${miningStatus.miningJobs.total} total, ${miningStatus.miningJobs.completed} completed`
    );
    console.log(
      `🔧 Storage Optimizations: ${miningStatus.storageOptimizations.total} total, ${miningStatus.storageOptimizations.completed} completed`
    );

    console.log('\n✅ Storage Features Demonstration Completed!');
    console.log('🎉 All storage features are working correctly!');
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await lightDomFramework.stopMiningWorkflow();
    await lightDomFramework.stop();
  }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateStorageFeatures().catch(error => {
    console.error('❌ Demonstration failed:', error);
    process.exit(1);
  });
}

export { demonstrateStorageFeatures };
