#!/usr/bin/env node

/**
 * LightDom Service Management CLI
 * Rich, interactive CLI for managing service bundles
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { Command } from 'commander';
import { ConsoleFormatter } from '../src/config/console-config.js';
import { deepseekInstanceManager } from '../src/services/deepseek-instance-manager.js';
import { headlessAPIManager } from '../src/services/headless-api-manager.js';
import { richSnippetEngine } from '../src/services/rich-snippet-engine.js';
import { serviceOrchestrator } from '../src/services/service-orchestrator.js';

const program = new Command();
const console = new ConsoleFormatter();

program
  .name('lightdom-services')
  .description('LightDom Service Orchestration CLI')
  .version('1.0.0');

// Service Bundle Commands
program
  .command('bundle:list')
  .description('List all service bundles')
  .action(() => {
    const bundles = serviceOrchestrator.getAllBundles();

    const table = new Table({
      head: ['Bundle Name', 'Status', 'Services', 'Auto-Start', 'Health Check'],
      style: { head: ['cyan'] },
    });

    bundles.forEach(bundle => {
      table.push([
        bundle.name,
        bundle.status === 'running' ? chalk.green(bundle.status) : chalk.yellow(bundle.status),
        bundle.services.length,
        bundle.config.autoStart ? chalk.green('Yes') : chalk.gray('No'),
        bundle.config.healthCheckInterval
          ? chalk.green(`${bundle.config.healthCheckInterval}ms`)
          : chalk.gray('Disabled'),
      ]);
    });

    console.log(table.toString());
  });

program
  .command('bundle:start <name>')
  .description('Start a service bundle')
  .action(async name => {
    try {
      console.log(console.formatServiceMessage('CLI', `Starting bundle: ${name}`, 'info'));
      await serviceOrchestrator.startBundle(name);
      console.log(console.formatServiceMessage('CLI', `Bundle ${name} started`, 'success'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('bundle:stop <name>')
  .description('Stop a service bundle')
  .action(async name => {
    try {
      console.log(console.formatServiceMessage('CLI', `Stopping bundle: ${name}`, 'warning'));
      await serviceOrchestrator.stopBundle(name);
      console.log(console.formatServiceMessage('CLI', `Bundle ${name} stopped`, 'success'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('bundle:status <name>')
  .description('Get bundle status')
  .action(name => {
    const bundle = serviceOrchestrator.getBundleStatus(name);
    if (!bundle) {
      console.error(chalk.red(`Bundle ${name} not found`));
      process.exit(1);
    }

    console.log(
      console.formatServiceBundle(
        bundle.name,
        bundle.services.map(s => ({
          name: s.schema.name,
          status: s.status,
          port: s.port,
        }))
      )
    );
  });

// DeepSeek Instance Commands
program
  .command('deepseek:create <id>')
  .description('Create a new DeepSeek instance')
  .option('--headless', 'Run in headless mode', true)
  .option('--width <width>', 'Viewport width', '1920')
  .option('--height <height>', 'Viewport height', '1080')
  .action(async (id, options) => {
    try {
      console.log(console.formatServiceMessage('CLI', `Creating DeepSeek instance: ${id}`, 'info'));

      const instance = await deepseekInstanceManager.createInstance(id, {
        headless: options.headless,
        viewport: {
          width: parseInt(options.width),
          height: parseInt(options.height),
        },
      });

      console.log(
        console.formatInstanceInfo(instance.id, 'DeepSeek Chrome', 'active', {
          viewport: `${options.width}x${options.height}`,
          headless: options.headless,
        })
      );
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('deepseek:list')
  .description('List all DeepSeek instances')
  .action(() => {
    const instances = deepseekInstanceManager.getInstances();

    const table = new Table({
      head: ['Instance ID', 'Status', 'Created', 'Last Activity'],
      style: { head: ['cyan'] },
    });

    instances.forEach(instance => {
      table.push([
        instance.id,
        instance.status === 'ready'
          ? chalk.green(instance.status)
          : instance.status === 'busy'
            ? chalk.yellow(instance.status)
            : instance.status === 'error'
              ? chalk.red(instance.status)
              : chalk.gray(instance.status),
        instance.createdAt.toLocaleString(),
        instance.lastActivity.toLocaleString(),
      ]);
    });

    console.log(table.toString());
  });

program
  .command('deepseek:prompt <id> <prompt>')
  .description('Send a prompt to a DeepSeek instance')
  .option('--context <context>', 'Additional context (JSON)', '{}')
  .action(async (id, prompt, options) => {
    try {
      const context = JSON.parse(options.context);

      console.log(console.formatServiceMessage('CLI', `Sending prompt to ${id}`, 'info'));

      const response = await deepseekInstanceManager.sendPrompt(id, prompt, context);

      console.log(console.formatDataStream('DeepSeek Response', response, 'deepseek'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('deepseek:stop <id>')
  .description('Stop a DeepSeek instance')
  .action(async id => {
    try {
      console.log(console.formatServiceMessage('CLI', `Stopping instance: ${id}`, 'warning'));
      await deepseekInstanceManager.stopInstance(id);
      console.log(console.formatServiceMessage('CLI', `Instance ${id} stopped`, 'success'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

// Rich Snippet Commands
program
  .command('snippet:generate <type>')
  .description('Generate a rich snippet')
  .option('--data <data>', 'Snippet data (JSON)', '{}')
  .action((type, options) => {
    try {
      const data = JSON.parse(options.data);

      console.log(console.formatServiceMessage('CLI', `Generating ${type} snippet`, 'info'));

      const snippet = richSnippetEngine.generateSnippet(`cli-${Date.now()}`, {
        type,
        data,
        seoOptimized: true,
        enableStructuredData: true,
      });

      console.log(console.formatDataStream('Rich Snippet', snippet, 'snippet'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('snippet:product')
  .description('Generate a product rich snippet')
  .requiredOption('--name <name>', 'Product name')
  .option('--price <price>', 'Product price')
  .option('--description <description>', 'Product description')
  .option('--image <image>', 'Product image URL')
  .action(options => {
    try {
      console.log(console.formatServiceMessage('CLI', 'Generating product snippet', 'info'));

      const snippet = richSnippetEngine.generateProductSnippet({
        name: options.name,
        price: options.price,
        description: options.description,
        image: options.image,
      });

      console.log(chalk.green('✓ Product snippet generated'));
      console.log(chalk.cyan('ID:'), snippet.id);
      console.log(chalk.cyan('HTML:'));
      console.log(snippet.html);
      console.log(chalk.cyan('Structured Data:'));
      console.log(JSON.stringify(snippet.structuredData, null, 2));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

// Health & Monitoring Commands
program
  .command('health')
  .description('Display system health status')
  .action(() => {
    const bundles = serviceOrchestrator.getAllBundles();
    const instances = deepseekInstanceManager.getInstances();

    console.log(chalk.cyan.bold('\n=== System Health Status ===\n'));

    console.log(chalk.white('Service Bundles:'));
    bundles.forEach(bundle => {
      const runningServices = bundle.services.filter(s => s.status === 'running').length;
      const totalServices = bundle.services.length;
      const status =
        runningServices === totalServices
          ? chalk.green('✓ Healthy')
          : runningServices > 0
            ? chalk.yellow('⚠ Degraded')
            : chalk.red('✗ Down');

      console.log(`  ${bundle.name}: ${status} (${runningServices}/${totalServices} running)`);
    });

    console.log(chalk.white('\nDeepSeek Instances:'));
    instances.forEach(instance => {
      const status =
        instance.status === 'ready'
          ? chalk.green('✓ Ready')
          : instance.status === 'busy'
            ? chalk.yellow('⚙ Busy')
            : instance.status === 'error'
              ? chalk.red('✗ Error')
              : chalk.gray('◯ ' + instance.status);

      console.log(`  ${instance.id}: ${status}`);
    });

    console.log('');
  });

program
  .command('monitor')
  .description('Start real-time monitoring')
  .action(() => {
    console.log(chalk.cyan.bold('\n=== Real-time Service Monitor ===\n'));
    console.log(chalk.gray('Press Ctrl+C to exit\n'));

    setInterval(() => {
      const bundles = serviceOrchestrator.getAllBundles();
      const runningServices = bundles.reduce(
        (acc, bundle) => acc + bundle.services.filter(s => s.status === 'running').length,
        0
      );
      const totalServices = bundles.reduce((acc, bundle) => acc + bundle.services.length, 0);

      console.log(console.formatProgress('Monitor', 'Services', runningServices, totalServices));
    }, 5000);
  });

// Info Commands
program
  .command('info')
  .description('Display system information')
  .action(() => {
    console.log(chalk.cyan.bold('\n=== LightDom Service Orchestration Platform ===\n'));
    console.log(chalk.white('Version:'), '1.0.0');
    console.log(chalk.white('Node:'), process.version);
    console.log(chalk.white('Platform:'), process.platform);
    console.log(chalk.white('Arch:'), process.arch);

    const bundles = serviceOrchestrator.getAllBundles();
    const instances = deepseekInstanceManager.getInstances();

    console.log(chalk.white('\nRegistered Bundles:'), bundles.length);
    console.log(chalk.white('Active Instances:'), instances.length);
    console.log('');
  });

// Headless API Commands
program
  .command('api:init')
  .description('Initialize headless API manager')
  .option('--workers <count>', 'Number of workers', '3')
  .option('--cache <strategy>', 'Cache strategy', 'network-first')
  .action(async options => {
    try {
      console.log(console.formatServiceMessage('CLI', 'Initializing headless API', 'info'));

      const manager = new (
        await import('../src/services/headless-api-manager.js')
      ).HeadlessAPIManager({
        workers: parseInt(options.workers),
        enableServiceWorkers: true,
        enableAnalytics: true,
        cacheStrategy: options.cache,
      });

      await manager.initialize();

      console.log(console.formatServiceMessage('CLI', 'Headless API initialized', 'success'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('api:process <url>')
  .description('Process a URL with headless API')
  .option('--text', 'Extract text', false)
  .option('--links', 'Extract links', false)
  .option('--images', 'Extract images', false)
  .action(async (url, options) => {
    try {
      console.log(console.formatServiceMessage('CLI', `Processing URL: ${url}`, 'info'));

      const result = await headlessAPIManager.processURL(url, {
        extractText: options.text,
        extractLinks: options.links,
        extractImages: options.images,
      });

      console.log(console.formatDataStream('Result', result, 'api'));
    } catch (error) {
      console.error(console.formatError('CLI', error));
      process.exit(1);
    }
  });

program
  .command('api:workers')
  .description('Display worker status')
  .action(() => {
    const workers = headlessAPIManager.getWorkerStatus();

    const table = new Table({
      head: ['Worker ID', 'Status', 'Requests Processed'],
      style: { head: ['cyan'] },
    });

    workers.forEach(worker => {
      table.push([
        worker.id,
        worker.status === 'idle'
          ? chalk.green(worker.status)
          : worker.status === 'busy'
            ? chalk.yellow(worker.status)
            : chalk.red(worker.status),
        worker.requestsProcessed,
      ]);
    });

    console.log(table.toString());
  });

program
  .command('api:analytics')
  .description('Display aggregated analytics')
  .action(() => {
    const analytics = headlessAPIManager.getAggregatedAnalytics();

    if (!analytics) {
      console.log(chalk.yellow('No analytics data available'));
      return;
    }

    console.log(chalk.cyan.bold('\n=== Headless API Analytics ===\n'));
    console.log(chalk.white('Total Requests:'), analytics.totalRequests);
    console.log(chalk.white('Avg Load Time:'), `${analytics.avgLoadTime.toFixed(2)}ms`);
    console.log(chalk.white('Min Load Time:'), `${analytics.minLoadTime}ms`);
    console.log(chalk.white('Max Load Time:'), `${analytics.maxLoadTime}ms`);
    console.log(chalk.white('Avg Node Count:'), Math.round(analytics.avgNodeCount));
    console.log(chalk.white('Workers:'), analytics.workers);
    console.log(chalk.white('Queue Length:'), analytics.queueLength);
    console.log('');
  });

program.parse();
