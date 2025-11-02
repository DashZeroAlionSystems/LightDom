#!/usr/bin/env node

/**
 * Data Mining CLI
 * Command-line interface for managing background data mining operations
 * 
 * Usage:
 *   npm run mining:start <subject>     - Start mining for a subject
 *   npm run mining:status              - Show all mining jobs
 *   npm run mining:job <id>            - Show specific job details
 *   npm run mining:add <config-file>   - Add new mining subject from config
 *   npm run mining:pause <id>          - Pause a mining job
 *   npm run mining:resume <id>         - Resume a mining job
 *   npm run mining:stop <id>           - Stop a mining job
 */

import { program } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import BackgroundDataMiningService from '../services/background-mining-service.js';
import AIConfigGenerator from '../services/ai-config-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global service instance
let miningService = null;

/**
 * Initialize mining service
 */
async function initService() {
  if (!miningService) {
    miningService = new BackgroundDataMiningService({
      workerCount: 3,
      maxConcurrentCrawls: 5,
      crawlDelayMs: 1000
    });

    // Setup event handlers
    miningService.on('job:created', (job) => {
      console.log(chalk.green(`✅ Job created: ${job.name} (${job.id})`));
    });

    miningService.on('job:paused', (job) => {
      console.log(chalk.yellow(`⏸️  Job paused: ${job.name}`));
    });

    miningService.on('job:resumed', (job) => {
      console.log(chalk.green(`▶️  Job resumed: ${job.name}`));
    });

    miningService.on('job:stopped', (job) => {
      console.log(chalk.red(`🛑 Job stopped: ${job.name}`));
    });

    miningService.on('task:completed', (task) => {
      console.log(chalk.gray(`  ✓ ${task.url} [${task.attribute.name}]`));
    });

    miningService.on('task:failed', (task, error) => {
      console.log(chalk.red(`  ✗ ${task.url} [${task.attribute.name}]: ${error.message}`));
    });
  }
  return miningService;
}

/**
 * Start mining service in daemon mode
 */
program
  .command('daemon')
  .description('Start mining service in daemon mode')
  .option('-w, --workers <count>', 'Number of worker threads', '3')
  .action(async (options) => {
    console.log(chalk.bold.blue('🚀 Starting Data Mining Daemon'));
    console.log('');

    const service = await initService();
    await service.start();

    // Keep process running
    process.on('SIGINT', async () => {
      console.log('\n');
      console.log(chalk.yellow('🛑 Shutting down mining daemon...'));
      await service.stop();
      process.exit(0);
    });

    console.log('');
    console.log(chalk.green('✅ Mining daemon is running'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
    console.log('');
  });

/**
 * Create a new mining job
 */
program
  .command('start <subject>')
  .description('Start a new mining job for a subject')
  .option('-u, --urls <urls>', 'Comma-separated seed URLs')
  .option('-a, --attributes <attrs>', 'Comma-separated attributes to mine')
  .option('-c, --config <file>', 'Configuration file path')
  .option('-d, --max-depth <depth>', 'Maximum crawl depth', '3')
  .option('-m, --max-urls <count>', 'Maximum URLs to crawl', '1000')
  .action(async (subject, options) => {
    console.log(chalk.bold.blue(`🔍 Starting Mining: ${subject}`));
    console.log('');

    const service = await initService();
    
    // Ensure service is running
    if (!service.isRunning) {
      await service.start();
    }

    let config = {};
    
    // Load config from file if provided
    if (options.config) {
      const configPath = path.resolve(process.cwd(), options.config);
      const configContent = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } else {
      // Build config from options
      config = {
        name: `Mining: ${subject}`,
        subject: subject,
        description: `Data mining for ${subject}`,
        seedUrls: options.urls ? options.urls.split(',') : [],
        attributes: options.attributes 
          ? options.attributes.split(',').map(attr => ({
              name: attr.trim(),
              selector: null, // Will use default extraction
              priority: 5
            }))
          : [
              { name: 'title', selector: 'title', priority: 10 },
              { name: 'content', selector: 'body', priority: 8 },
              { name: 'links', selector: 'a[href]', priority: 6 }
            ],
        maxDepth: parseInt(options.maxDepth),
        maxUrls: parseInt(options.maxUrls)
      };
    }

    // Validate config
    if (config.seedUrls.length === 0) {
      console.log(chalk.red('❌ Error: No seed URLs provided'));
      console.log(chalk.gray('Use -u or --urls option, or provide a config file'));
      process.exit(1);
    }

    try {
      const jobId = await service.createMiningJob(config);
      
      console.log(chalk.green('✅ Mining job created successfully'));
      console.log('');
      console.log(`   Job ID: ${chalk.yellow(jobId)}`);
      console.log(`   Subject: ${chalk.cyan(subject)}`);
      console.log(`   Seed URLs: ${config.seedUrls.length}`);
      console.log(`   Attributes: ${config.attributes.length}`);
      console.log('');
      console.log(chalk.gray(`Use "npm run mining:job ${jobId}" to monitor progress`));
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Show all mining jobs
 */
program
  .command('status')
  .description('Show status of all mining jobs')
  .action(async () => {
    console.log(chalk.bold.blue('📊 Mining Jobs Status'));
    console.log('');

    const service = await initService();
    const jobs = service.getAllJobs();

    if (jobs.length === 0) {
      console.log(chalk.yellow('No active mining jobs'));
      return;
    }

    const table = new Table({
      head: [
        chalk.cyan('ID'),
        chalk.cyan('Subject'),
        chalk.cyan('Status'),
        chalk.cyan('Progress'),
        chalk.cyan('URLs'),
        chalk.cyan('Tasks'),
        chalk.cyan('Created')
      ],
      colWidths: [10, 20, 12, 12, 10, 10, 12]
    });

    for (const job of jobs) {
      const statusColor = job.status === 'running' ? chalk.green : 
                         job.status === 'paused' ? chalk.yellow :
                         job.status === 'stopped' ? chalk.red : chalk.gray;

      table.push([
        job.id.substring(0, 8),
        job.subject.substring(0, 18),
        statusColor(job.status),
        `${job.progress.percentage}%`,
        `${job.progress.processedUrls}/${job.progress.totalUrls}`,
        `${job.progress.tasksCompleted}/${job.progress.tasksTotal}`,
        new Date(job.createdAt).toLocaleDateString()
      ]);
    }

    console.log(table.toString());
    console.log('');
    console.log(chalk.gray(`Total jobs: ${jobs.length}`));
  });

/**
 * Show specific job details
 */
program
  .command('job <id>')
  .description('Show detailed information about a mining job')
  .option('-f, --follow', 'Follow job progress in real-time')
  .action(async (id, options) => {
    const service = await initService();

    const displayJobDetails = () => {
      const job = service.getJobStatus(id);

      if (!job) {
        console.log(chalk.red(`❌ Job not found: ${id}`));
        process.exit(1);
      }

      console.clear();
      console.log(chalk.bold.blue(`📋 Mining Job Details`));
      console.log('');
      console.log(`   ID: ${chalk.yellow(job.id)}`);
      console.log(`   Name: ${chalk.cyan(job.name)}`);
      console.log(`   Subject: ${chalk.cyan(job.subject)}`);
      console.log(`   Status: ${job.status === 'running' ? chalk.green(job.status) : chalk.yellow(job.status)}`);
      console.log('');
      console.log(chalk.bold('Progress:'));
      console.log(`   Overall: ${chalk.green(job.progress.percentage + '%')}`);
      console.log(`   URLs: ${job.progress.processedUrls}/${job.progress.totalUrls} (${job.progress.successfulCrawls} success, ${job.progress.failedCrawls} failed)`);
      console.log(`   Tasks: ${job.progress.tasksCompleted}/${job.progress.tasksTotal}`);
      console.log('');
      console.log(`   Created: ${new Date(job.createdAt).toLocaleString()}`);
      if (job.startedAt) {
        console.log(`   Started: ${new Date(job.startedAt).toLocaleString()}`);
      }
      if (job.completedAt) {
        console.log(`   Completed: ${new Date(job.completedAt).toLocaleString()}`);
      }
      console.log('');

      if (options.follow) {
        console.log(chalk.gray('Press Ctrl+C to exit'));
      }
    };

    if (options.follow) {
      // Display updates every second
      const interval = setInterval(displayJobDetails, 1000);
      displayJobDetails();

      process.on('SIGINT', () => {
        clearInterval(interval);
        console.log('\n');
        process.exit(0);
      });
    } else {
      displayJobDetails();
    }
  });

/**
 * Add new mining subject from config file or prompt
 */
program
  .command('add <config-file>')
  .description('Add a new mining subject from configuration file')
  .action(async (configFile) => {
    console.log(chalk.bold.blue('➕ Adding Mining Subject'));
    console.log('');

    try {
      const configPath = path.resolve(process.cwd(), configFile);
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      console.log(`   Name: ${chalk.cyan(config.name)}`);
      console.log(`   Subject: ${chalk.cyan(config.subject)}`);
      console.log(`   Attributes: ${config.attributes.length}`);
      console.log(`   Seed URLs: ${config.seedUrls.length}`);
      console.log('');

      // Validate config
      if (!config.subject) {
        throw new Error('Config missing required field: subject');
      }
      if (!config.seedUrls || config.seedUrls.length === 0) {
        throw new Error('Config missing required field: seedUrls');
      }

      const service = await initService();
      
      // Ensure service is running
      if (!service.isRunning) {
        await service.start();
      }

      const jobId = await service.createMiningJob(config);
      
      console.log(chalk.green('✅ Mining subject added successfully'));
      console.log(`   Job ID: ${chalk.yellow(jobId)}`);
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Pause a mining job
 */
program
  .command('pause <id>')
  .description('Pause a running mining job')
  .action(async (id) => {
    const service = await initService();
    
    try {
      await service.pauseJob(id);
      console.log(chalk.yellow(`⏸️  Job paused: ${id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Resume a paused mining job
 */
program
  .command('resume <id>')
  .description('Resume a paused mining job')
  .action(async (id) => {
    const service = await initService();
    
    try {
      await service.resumeJob(id);
      console.log(chalk.green(`▶️  Job resumed: ${id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Stop a mining job
 */
program
  .command('stop <id>')
  .description('Stop a mining job')
  .action(async (id) => {
    const service = await initService();
    
    try {
      await service.stopJob(id);
      console.log(chalk.red(`🛑 Job stopped: ${id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Generate mining config from AI prompt
 */
program
  .command('generate <prompt>')
  .description('Generate mining configuration from natural language prompt')
  .option('-m, --model <name>', 'AI model to use (auto-selects best available)')
  .option('-o, --output <file>', 'Output config file path')
  .option('-u, --urls <urls>', 'Comma-separated target URLs')
  .option('--start', 'Immediately start mining with generated config')
  .action(async (prompt, options) => {
    console.log(chalk.bold.blue('🤖 Generating Mining Configuration'));
    console.log('');
    console.log(`   Prompt: ${chalk.cyan(prompt)}`);
    console.log('');

    try {
      const aiGenerator = new AIConfigGenerator();

      // Test Ollama connection
      console.log(chalk.gray('Testing Ollama connection...'));
      const isAvailable = await aiGenerator.testConnection();
      
      if (!isAvailable) {
        console.log(chalk.yellow('⚠️  Ollama not available, using fallback generation'));
        console.log(chalk.gray('   Tip: Install Ollama from https://ollama.ai'));
        console.log('');
      } else {
        console.log(chalk.green('✓ Connected to Ollama'));
        
        // Get recommended model if not specified
        let model = options.model;
        if (!model) {
          model = await aiGenerator.getRecommendedModel();
          console.log(chalk.gray(`   Using model: ${model}`));
        }
        console.log('');
      }

      // Prepare generation options
      const genOptions = {};
      if (options.urls) {
        genOptions.targetUrls = options.urls.split(',').map(u => u.trim());
      }

      // Generate config
      console.log(chalk.yellow('Generating configuration...'));
      const config = await aiGenerator.generateConfig(prompt, genOptions);
      
      // Validate config
      const errors = aiGenerator.validateConfig(config);
      if (errors.length > 0) {
        console.log(chalk.red('\n❌ Generated config has validation errors:'));
        errors.forEach(err => console.log(chalk.red(`   - ${err}`)));
        process.exit(1);
      }

      console.log(chalk.green('\n✅ Configuration generated successfully'));
      console.log('');
      console.log(chalk.bold('Configuration:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(JSON.stringify(config, null, 2));
      console.log(chalk.gray('─'.repeat(60)));
      console.log('');
      console.log(`   Name: ${chalk.cyan(config.name)}`);
      console.log(`   Subject: ${chalk.cyan(config.subject)}`);
      console.log(`   Seed URLs: ${config.seedUrls.length}`);
      console.log(`   Attributes: ${config.attributes.length}`);
      console.log(`   Max Depth: ${config.config.maxDepth}`);
      console.log(`   Max URLs: ${config.config.maxUrls}`);
      console.log('');

      // Save to file if requested
      if (options.output) {
        await aiGenerator.saveConfig(config, options.output);
        console.log(chalk.green(`💾 Config saved to: ${options.output}`));
        console.log('');
      }

      // Start mining if requested
      if (options.start) {
        console.log(chalk.yellow('Starting mining job...'));
        const service = await initService();
        
        if (!service.isRunning) {
          await service.start();
        }

        const jobId = await service.createMiningJob(config);
        console.log(chalk.green(`✅ Mining job started: ${jobId}`));
        console.log(chalk.gray(`   Use "npm run mining:job ${jobId}" to monitor`));
      } else {
        console.log(chalk.gray('To start mining with this config:'));
        if (options.output) {
          console.log(chalk.gray(`   npm run mining:add ${options.output}`));
        } else {
          console.log(chalk.gray('   Save to file first with -o option, then use mining:add'));
        }
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
      if (error.stack) {
        console.log(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
