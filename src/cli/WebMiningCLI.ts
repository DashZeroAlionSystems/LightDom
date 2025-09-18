#!/usr/bin/env node

/**
 * Web Mining CLI
 * Command-line interface for the web mining system
 */

import { Command } from 'commander';
import { webMiningOrchestrator } from '../core/WebMiningOrchestrator';
import { selfOrganizingFoldingAlgorithm } from '../core/SelfOrganizingFoldingAlgorithm';
import { webTreeShaker } from '../core/WebTreeShaker';
import { personalWebDrive } from '../core/PersonalWebDrive';
import { webMiningDemo } from '../examples/WebMiningDemo';

const program = new Command();

program
  .name('web-mining')
  .description('Personal Web Drive & AI Mining System CLI')
  .version('1.0.0');

// Mining commands
program
  .command('mine')
  .description('Start mining session')
  .option('-u, --urls <urls...>', 'URLs to mine')
  .option('-n, --name <name>', 'Session name')
  .option('-o, --output <file>', 'Output file for results')
  .action(async (options) => {
    try {
      console.log('🚀 Starting mining session...');
      
      const sessionId = await webMiningOrchestrator.startMiningSession(
        options.name || 'CLI Mining Session',
        options.urls || [],
        {
          outputFile: options.output
        }
      );
      
      console.log(`✅ Mining session started: ${sessionId}`);
      
      // Wait for completion
      let session = webMiningOrchestrator.getSession(sessionId);
      while (session && session.status === 'active') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        session = webMiningOrchestrator.getSession(sessionId);
      }
      
      if (session) {
        console.log('\n📊 Session Results:');
        console.log(`  Status: ${session.status}`);
        console.log(`  Space Saved: ${session.metrics.totalSpaceSaved} bytes`);
        console.log(`  Value Extracted: ${session.metrics.totalValueExtracted}`);
        console.log(`  Efficiency: ${session.metrics.efficiency.toFixed(2)}`);
        console.log(`  Quality: ${session.metrics.quality.toFixed(2)}`);
        
        if (options.output) {
          // Save results to file
          const fs = await import('fs/promises');
          await fs.writeFile(options.output, JSON.stringify(session, null, 2));
          console.log(`\n💾 Results saved to: ${options.output}`);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Folding commands
program
  .command('fold')
  .description('Fold data using self-organizing algorithm')
  .option('-d, --data <data>', 'Data to fold (JSON string)')
  .option('-f, --file <file>', 'File containing data to fold')
  .option('-t, --type <type>', 'Data type (hierarchical, temporal, semantic, spatial, network)')
  .action(async (options) => {
    try {
      let data;
      
      if (options.file) {
        const fs = await import('fs/promises');
        const content = await fs.readFile(options.file, 'utf-8');
        data = JSON.parse(content);
      } else if (options.data) {
        data = JSON.parse(options.data);
      } else {
        console.error('❌ Please provide data via --data or --file');
        process.exit(1);
      }
      
      console.log('📁 Folding data...');
      
      const result = await selfOrganizingFoldingAlgorithm.foldData(
        data,
        options.type || 'hierarchical',
        { cli: true }
      );
      
      console.log('\n📊 Folding Results:');
      console.log(`  Original Size: ${result.originalSize} bytes`);
      console.log(`  Folded Size: ${result.foldedSize} bytes`);
      console.log(`  Compression Ratio: ${result.compressionRatio.toFixed(2)}x`);
      console.log(`  Quality Score: ${result.qualityScore}/100`);
      console.log(`  Pattern Used: ${result.foldPattern}`);
      
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Tree shaking commands
program
  .command('shake')
  .description('Tree shake web resources')
  .option('-u, --url <url>', 'URL to tree shake')
  .option('-o, --output <file>', 'Output file for results')
  .action(async (options) => {
    try {
      if (!options.url) {
        console.error('❌ Please provide URL via --url');
        process.exit(1);
      }
      
      console.log(`🌳 Tree shaking ${options.url}...`);
      
      const webNode = await webTreeShaker.mineWebNode(options.url, 'cli-session');
      if (!webNode) {
        console.error('❌ Failed to mine web node');
        process.exit(1);
      }
      
      const shakeResult = await webTreeShaker.treeShakeNode(webNode);
      if (!shakeResult) {
        console.error('❌ Failed to tree shake node');
        process.exit(1);
      }
      
      console.log('\n📊 Tree Shake Results:');
      console.log(`  Space Saved: ${shakeResult.spaceSaved} bytes`);
      console.log(`  Value Extracted: ${shakeResult.valueExtracted}`);
      console.log(`  Quality: ${shakeResult.quality}/100`);
      console.log(`  Patterns: ${shakeResult.patterns.join(', ')}`);
      
      if (options.output) {
        const fs = await import('fs/promises');
        await fs.writeFile(options.output, JSON.stringify(shakeResult, null, 2));
        console.log(`\n💾 Results saved to: ${options.output}`);
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Drive commands
program
  .command('drive')
  .description('Personal web drive operations')
  .option('-u, --url <url>', 'URL to mine')
  .option('-s, --search <query>', 'Search mined data')
  .option('-l, --list', 'List all mined data')
  .option('-a, --analytics', 'Show drive analytics')
  .action(async (options) => {
    try {
      if (options.url) {
        console.log(`💾 Mining ${options.url}...`);
        
        const minedData = await personalWebDrive.startMining(options.url, { cli: true });
        if (minedData) {
          console.log('\n📊 Mined Data:');
          console.log(`  Title: ${minedData.title}`);
          console.log(`  Type: ${minedData.type}`);
          console.log(`  Size: ${minedData.size} bytes`);
          console.log(`  Value: ${minedData.value}`);
          console.log(`  Quality: ${minedData.quality}/100`);
          console.log(`  Tags: ${minedData.tags.join(', ')}`);
        }
      } else if (options.search) {
        console.log(`🔍 Searching for: ${options.search}`);
        
        const results = personalWebDrive.searchMinedData(options.search);
        console.log(`\nFound ${results.length} results:`);
        
        results.forEach((data, index) => {
          console.log(`  ${index + 1}. ${data.title} (${data.type}) - ${data.url}`);
        });
      } else if (options.list) {
        console.log('📋 All Mined Data:');
        
        const allData = personalWebDrive.getAllMinedData();
        allData.forEach((data, index) => {
          console.log(`  ${index + 1}. ${data.title} (${data.type}) - ${data.url}`);
        });
      } else if (options.analytics) {
        console.log('📊 Drive Analytics:');
        
        const analytics = personalWebDrive.getAnalytics();
        console.log(`  Total Data: ${analytics.totalData} items`);
        console.log(`  Total Value: ${analytics.totalValue}`);
        console.log(`  Average Quality: ${analytics.averageQuality.toFixed(1)}`);
        console.log(`  Space Utilization: ${(analytics.spaceUtilization * 100).toFixed(1)}%`);
        console.log(`  Mining Efficiency: ${analytics.miningEfficiency.toFixed(1)}%`);
      } else {
        console.error('❌ Please provide an option: --url, --search, --list, or --analytics');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Demo commands
program
  .command('demo')
  .description('Run system demos')
  .option('-c, --component <component>', 'Specific component to demo (folding, tree-shaker, web-drive, integrated, performance)')
  .action(async (options) => {
    try {
      if (options.component) {
        console.log(`🎯 Running ${options.component} demo...`);
        await webMiningDemo.runComponentDemo(options.component);
      } else {
        console.log('🎯 Running full demo...');
        await webMiningDemo.runDemo();
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Status commands
program
  .command('status')
  .description('Show system status')
  .action(async () => {
    try {
      console.log('📊 System Status:');
      
      // Folding algorithm status
      const foldingMetrics = selfOrganizingFoldingAlgorithm.getPerformanceMetrics();
      console.log('\n📁 Self-Organizing Folding:');
      console.log(`  Total Folds: ${foldingMetrics.totalFolds}`);
      console.log(`  Average Compression: ${foldingMetrics.averageCompressionRatio.toFixed(2)}x`);
      console.log(`  Total Space Saved: ${foldingMetrics.totalSpaceSaved} bytes`);
      
      // Tree shaker status
      const treeShakeMetrics = webTreeShaker.getPerformanceMetrics();
      console.log('\n🌳 Web Tree Shaker:');
      console.log(`  Total Nodes: ${treeShakeMetrics.totalNodes}`);
      console.log(`  Total Results: ${treeShakeMetrics.totalResults}`);
      console.log(`  Total Space Saved: ${treeShakeMetrics.totalSpaceSaved} bytes`);
      
      // Personal web drive status
      const driveAnalytics = personalWebDrive.getAnalytics();
      console.log('\n💾 Personal Web Drive:');
      console.log(`  Total Data: ${driveAnalytics.totalData} items`);
      console.log(`  Total Value: ${driveAnalytics.totalValue}`);
      console.log(`  Space Utilization: ${(driveAnalytics.spaceUtilization * 100).toFixed(1)}%`);
      
      // Orchestrator status
      const overallStats = webMiningOrchestrator.getOverallStatistics();
      console.log('\n🔄 Web Mining Orchestrator:');
      console.log(`  Total Sessions: ${overallStats.totalSessions}`);
      console.log(`  Completed Sessions: ${overallStats.completedSessions}`);
      console.log(`  Total Space Saved: ${overallStats.totalSpaceSaved} bytes`);
      console.log(`  Average Efficiency: ${overallStats.averageEfficiency.toFixed(2)}`);
      
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(`
🚀 Personal Web Drive & AI Mining System CLI

Commands:
  mine     Start mining session
  fold     Fold data using self-organizing algorithm
  shake    Tree shake web resources
  drive    Personal web drive operations
  demo     Run system demos
  status   Show system status
  help     Show this help message

Examples:
  web-mining mine --urls https://github.com/microsoft/vscode https://docs.microsoft.com
  web-mining fold --file data.json --type hierarchical
  web-mining shake --url https://example.com --output results.json
  web-mining drive --url https://example.com
  web-mining drive --search "javascript"
  web-mining drive --analytics
  web-mining demo --component folding
  web-mining status

For more information, visit: https://github.com/your-org/web-mining-system
    `);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}