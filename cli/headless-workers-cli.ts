#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs/promises';
import ora from 'ora';
import path from 'path';
import { NeuralComponentBuilder } from '../src/schema/NeuralComponentBuilder';
import { SchemaComponentMapper } from '../src/schema/SchemaComponentMapper';
import { SchemaServiceFactory } from '../src/services/SchemaServiceFactory';
import { WorkerPoolManager } from '../src/services/WorkerPoolManager';

const program = new Command();

program
  .name('headless-workers-cli')
  .description('CLI tool for managing LightDom headless worker systems')
  .version('1.0.0');

// Worker Pool Commands
const workerPoolCmd = program.command('worker-pool').description('Worker pool management');

workerPoolCmd
  .command('start')
  .description('Initialize and start worker pool')
  .option('-w, --workers <number>', 'Number of workers', '4')
  .option(
    '-s, --strategy <type>',
    'Pooling strategy (round-robin, least-busy, random)',
    'least-busy'
  )
  .action(async options => {
    const spinner = ora('Starting worker pool...').start();
    try {
      const pool = new WorkerPoolManager({
        maxWorkers: parseInt(options.workers),
        poolingStrategy: options.strategy as any,
      });
      await pool.initialize();
      spinner.succeed(chalk.green(`Worker pool started with ${options.workers} workers`));
      const status = pool.getStatus();
      console.log(chalk.blue('\\nPool Status:'));
      const totalWorkers = status.workers.length;
      const activeWorkers = status.workers.filter(
        worker => worker.status === 'idle' || worker.status === 'busy'
      ).length;
      console.log(`  Workers: ${activeWorkers}/${totalWorkers}`);
      console.log(`  Strategy: ${options.strategy}`);
      console.log(`  Queued tasks: ${status.queueSize}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to start worker pool'));
      console.error(error);
      process.exit(1);
    }
  });

// Schema Commands
const schemaCmd = program.command('schema').description('Schema management');

schemaCmd
  .command('list')
  .description('List all component schemas')
  .action(async () => {
    const spinner = ora('Loading schemas...').start();
    try {
      const mapper = new SchemaComponentMapper();
      await mapper.initialize();
      const schemas = mapper.getAllSchemas();
      spinner.succeed(chalk.green(`Found ${schemas.length} schemas`));

      schemas.forEach(schema => {
        console.log(chalk.blue(`\n${schema.name} (${schema['lightdom:componentType']})`));
        console.log(`  ID: ${schema['@id']}`);
        console.log(`  Use cases: ${schema['lightdom:useCase'].join(', ')}`);
      });
    } catch (error) {
      spinner.fail(chalk.red('Failed to load schemas'));
      console.error(error);
      process.exit(1);
    }
  });

// Service Commands
const serviceCmd = program.command('service').description('Service orchestration');

serviceCmd
  .command('list')
  .description('List all services')
  .action(async () => {
    const spinner = ora('Loading services...').start();
    try {
      const factory = new SchemaServiceFactory();
      await factory.initialize();
      const services = factory.getAllServices();

      spinner.succeed(chalk.green(`Found ${services.length} services`));
      services.forEach(service => {
        const statusColor = service.status === 'running' ? chalk.green : chalk.gray;
        const schemaName = service.schema?.name || service.id;
        const schemaType = service.schema?.['lightdom:serviceType'] || 'unknown';
        console.log(statusColor(`\n${schemaName} [${service.status}]`));
        console.log(`  ID: ${service.id}`);
        console.log(`  Type: ${schemaType}`);
      });
    } catch (error) {
      spinner.fail(chalk.red('Failed to list services'));
      console.error(error);
      process.exit(1);
    }
  });

// Component Commands
const componentCmd = program.command('component').description('Component generation');

componentCmd
  .command('generate')
  .description('Generate React component')
  .argument('<useCase>', 'Use case description')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (useCase, options) => {
    const spinner = ora('Generating component...').start();
    try {
      const mapper = new SchemaComponentMapper();
      const builder = new NeuralComponentBuilder(mapper);
      await mapper.initialize();
      await builder.initialize();

      const result = await builder.generateComponent({
        useCase,
        context: { typescript: true },
      });

      const componentName = result.schema['lightdom:reactComponent'];
      spinner.succeed(chalk.green(`Component generated: ${componentName}`));

      if (options.output) {
        const outputDir = path.resolve(options.output);
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(path.join(outputDir, `${componentName}.tsx`), result.code);
        console.log(chalk.blue(`\nFiles saved to: ${outputDir}`));
      } else {
        console.log(chalk.blue('\\nGenerated Code:'));
        console.log(result.code);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to generate component'));
      console.error(error);
      process.exit(1);
    }
  });

// Dev Commands
const devCmd = program.command('dev').description('Development tools');

devCmd
  .command('container')
  .description('Start dev container with live preview')
  .option('-p, --port <number>', 'Port number', '3100')
  .action(async options => {
    console.log(chalk.green(`Dev container would start at http://localhost:${options.port}`));
    console.log(chalk.blue('Run: node start-dev-container.js'));
  });

program.parse();
