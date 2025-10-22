#!/usr/bin/env node

/**
 * LightDom CLI - Project Management Command Line Interface
 * 
 * Usage: node cli.js <command> [options]
 * Or: npm run cli -- <command> [options]
 */

import { program } from 'commander';
import chalk from 'chalk';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Package version
const packageJson = JSON.parse(
  await fs.readFile('./package.json', 'utf8')
);

// CLI Configuration
program
  .name('lightdom')
  .description('LightDom Project Management CLI')
  .version(packageJson.version);

// Utility functions
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  title: (msg) => console.log(chalk.bold.cyan(msg)),
};

const runCommand = (cmd, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
};

// Commands

// Dev commands
program
  .command('dev')
  .description('Start development environment')
  .option('-f, --full', 'Start all services')
  .option('-a, --api', 'Start API only')
  .option('-b, --blockchain', 'Start with blockchain')
  .action(async (options) => {
    try {
      log.title('🚀 Starting Development Environment');

      if (options.full) {
        log.info('Starting PostgreSQL...');
        await runCommand('sudo', ['service', 'postgresql', 'start']).catch(() => {});
        
        log.info('Starting Anvil blockchain...');
        spawn('anvil', ['--host', '0.0.0.0', '--port', '8545'], {
          detached: true,
          stdio: 'ignore',
        }).unref();
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        log.info('Starting application...');
        await runCommand('npm', ['run', 'start:dev']);
      } else if (options.api) {
        await runCommand('npm', ['run', 'api']);
      } else if (options.blockchain) {
        log.info('Starting blockchain...');
        await runCommand('npm', ['run', 'start:blockchain']);
      } else {
        await runCommand('npm', ['run', 'dev']);
      }

      log.success('Development environment started');
    } catch (error) {
      log.error(`Failed to start: ${error.message}`);
      process.exit(1);
    }
  });

// Build commands
program
  .command('build')
  .description('Build the application')
  .option('-a, --analyze', 'Analyze bundle size')
  .option('-e, --electron', 'Build Electron app')
  .action(async (options) => {
    try {
      log.title('🏗️  Building Application');

      if (options.analyze) {
        await runCommand('npm', ['run', 'analyze:bundle']);
      } else if (options.electron) {
        await runCommand('npm', ['run', 'electron:build']);
      } else {
        await runCommand('npm', ['run', 'build']);
      }

      log.success('Build completed');
    } catch (error) {
      log.error(`Build failed: ${error.message}`);
      process.exit(1);
    }
  });

// Test commands
program
  .command('test')
  .description('Run tests')
  .option('-u, --unit', 'Run unit tests only')
  .option('-i, --integration', 'Run integration tests')
  .option('-e, --e2e', 'Run end-to-end tests')
  .option('-c, --coverage', 'Run with coverage')
  .option('-w, --watch', 'Watch mode')
  .action(async (options) => {
    try {
      log.title('🧪 Running Tests');

      let command = ['run'];
      
      if (options.unit) {
        command.push('test:unit');
      } else if (options.integration) {
        command.push('test:integration');
      } else if (options.e2e) {
        command.push('test:e2e');
      } else if (options.coverage) {
        command.push('test:coverage');
      } else {
        command.push('test');
      }

      if (options.watch && !options.coverage) {
        command.push('--', '--watch');
      }

      await runCommand('npm', command);
      log.success('Tests completed');
    } catch (error) {
      log.error(`Tests failed: ${error.message}`);
      process.exit(1);
    }
  });

// Database commands
program
  .command('db')
  .description('Database operations')
  .argument('<action>', 'Action: create, migrate, seed, reset, console')
  .action(async (action) => {
    try {
      log.title('🗄️  Database Operations');

      const pgPassword = 'lightdom123';
      const dbUser = 'lightdom';
      const dbName = 'lightdom';

      switch (action) {
        case 'create':
          log.info('Creating database...');
          await runCommand('sudo', ['-u', 'postgres', 'psql', '-c', `CREATE DATABASE ${dbName};`])
            .catch(() => log.warning('Database may already exist'));
          await runCommand('sudo', ['-u', 'postgres', 'psql', '-c', 
            `CREATE USER ${dbUser} WITH PASSWORD '${pgPassword}';`])
            .catch(() => log.warning('User may already exist'));
          await runCommand('sudo', ['-u', 'postgres', 'psql', '-c', 
            `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`]);
          log.success('Database created');
          break;

        case 'migrate':
          log.info('Running migrations...');
          await runCommand('sudo', ['service', 'postgresql', 'start']).catch(() => {});
          const migrateFile = 'postgresql-setup-script.sql';
          try {
            await fs.access(migrateFile);
            await runCommand('bash', ['-c', 
              `PGPASSWORD=${pgPassword} psql -h localhost -U ${dbUser} -d ${dbName} -f ${migrateFile}`
            ]);
            log.success('Migrations completed');
          } catch {
            log.warning('No migration file found');
          }
          break;

        case 'seed':
          log.info('Seeding database...');
          const seedFile = 'database/seed.sql';
          try {
            await fs.access(seedFile);
            await runCommand('bash', ['-c', 
              `PGPASSWORD=${pgPassword} psql -h localhost -U ${dbUser} -d ${dbName} -f ${seedFile}`
            ]);
            log.success('Database seeded');
          } catch {
            log.warning('No seed file found');
          }
          break;

        case 'reset':
          log.warning('Resetting database...');
          await runCommand('sudo', ['-u', 'postgres', 'psql', '-c', `DROP DATABASE IF EXISTS ${dbName};`]);
          await program.commands.find(cmd => cmd.name() === 'db').parseAsync(['node', 'cli.js', 'db', 'create']);
          await program.commands.find(cmd => cmd.name() === 'db').parseAsync(['node', 'cli.js', 'db', 'migrate']);
          log.success('Database reset');
          break;

        case 'console':
          log.info('Opening database console...');
          await runCommand('bash', ['-c', 
            `PGPASSWORD=${pgPassword} psql -h localhost -U ${dbUser} -d ${dbName}`
          ]);
          break;

        default:
          log.error(`Unknown action: ${action}`);
          process.exit(1);
      }
    } catch (error) {
      log.error(`Database operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Blockchain commands
program
  .command('blockchain')
  .description('Blockchain operations')
  .argument('<action>', 'Action: start, stop, compile, test, deploy')
  .action(async (action) => {
    try {
      log.title('⛓️  Blockchain Operations');

      switch (action) {
        case 'start':
          log.info('Starting Anvil blockchain...');
          spawn('anvil', ['--host', '0.0.0.0', '--port', '8545'], {
            detached: true,
            stdio: 'ignore',
          }).unref();
          await new Promise(resolve => setTimeout(resolve, 2000));
          log.success('Blockchain started on http://localhost:8545');
          break;

        case 'stop':
          log.info('Stopping blockchain...');
          await runCommand('pkill', ['-f', 'anvil']).catch(() => {});
          log.success('Blockchain stopped');
          break;

        case 'compile':
          log.info('Compiling contracts...');
          await runCommand('npx', ['hardhat', 'compile']);
          log.success('Contracts compiled');
          break;

        case 'test':
          log.info('Testing contracts...');
          await runCommand('npx', ['hardhat', 'test']);
          log.success('Contract tests passed');
          break;

        case 'deploy':
          log.info('Deploying contracts...');
          await runCommand('npx', ['hardhat', 'run', 'scripts/deploy.ts', '--network', 'localhost']);
          log.success('Contracts deployed');
          break;

        default:
          log.error(`Unknown action: ${action}`);
          process.exit(1);
      }
    } catch (error) {
      log.error(`Blockchain operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Docker commands
program
  .command('docker')
  .description('Docker operations')
  .argument('<action>', 'Action: up, down, build, logs, clean')
  .action(async (action) => {
    try {
      log.title('🐳 Docker Operations');

      switch (action) {
        case 'up':
          log.info('Starting containers...');
          await runCommand('docker-compose', ['up', '-d']);
          log.success('Containers started');
          break;

        case 'down':
          log.info('Stopping containers...');
          await runCommand('docker-compose', ['down']);
          log.success('Containers stopped');
          break;

        case 'build':
          log.info('Building images...');
          await runCommand('docker-compose', ['build']);
          log.success('Images built');
          break;

        case 'logs':
          await runCommand('docker-compose', ['logs', '-f']);
          break;

        case 'clean':
          log.info('Cleaning Docker resources...');
          await runCommand('docker-compose', ['down', '-v', '--remove-orphans']);
          await runCommand('docker', ['system', 'prune', '-f']);
          log.success('Docker cleaned');
          break;

        default:
          log.error(`Unknown action: ${action}`);
          process.exit(1);
      }
    } catch (error) {
      log.error(`Docker operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Quality commands
program
  .command('quality')
  .description('Code quality checks')
  .option('-l, --lint', 'Run linter')
  .option('-f, --format', 'Format code')
  .option('-t, --type-check', 'Type check')
  .option('-a, --all', 'Run all checks')
  .action(async (options) => {
    try {
      log.title('✨ Code Quality Checks');

      if (options.all || options.lint) {
        log.info('Running linter...');
        await runCommand('npm', ['run', 'lint']);
        log.success('Linting passed');
      }

      if (options.all || options.format) {
        log.info('Formatting code...');
        await runCommand('npm', ['run', 'format']);
        log.success('Code formatted');
      }

      if (options.all || options.typeCheck) {
        log.info('Type checking...');
        await runCommand('npm', ['run', 'type-check']);
        log.success('Type check passed');
      }

      if (!options.lint && !options.format && !options.typeCheck && !options.all) {
        log.warning('No checks specified. Use --all to run all checks.');
      }
    } catch (error) {
      log.error(`Quality check failed: ${error.message}`);
      process.exit(1);
    }
  });

// Clean commands
program
  .command('clean')
  .description('Clean project artifacts')
  .option('-b, --build', 'Clean build artifacts')
  .option('-d, --deps', 'Clean dependencies')
  .option('-c, --cache', 'Clean cache')
  .option('-a, --all', 'Clean everything')
  .action(async (options) => {
    try {
      log.title('🧹 Cleaning Project');

      if (options.all || options.build) {
        log.info('Cleaning build artifacts...');
        await runCommand('rm', ['-rf', 'dist/', 'dist-electron/', '.vite/', 'build/']);
        log.success('Build artifacts cleaned');
      }

      if (options.all || options.deps) {
        log.info('Cleaning dependencies...');
        await runCommand('rm', ['-rf', 'node_modules/']);
        log.success('Dependencies cleaned');
      }

      if (options.all || options.cache) {
        log.info('Cleaning cache...');
        await runCommand('npm', ['cache', 'clean', '--force']);
        log.success('Cache cleaned');
      }

      if (!options.build && !options.deps && !options.cache && !options.all) {
        log.warning('No cleanup option specified. Use --all to clean everything.');
      }
    } catch (error) {
      log.error(`Cleanup failed: ${error.message}`);
      process.exit(1);
    }
  });

// Setup command
program
  .command('setup')
  .description('Setup development environment')
  .action(async () => {
    try {
      log.title('⚙️  Setting up Development Environment');

      // Check .env file
      try {
        await fs.access('.env');
        log.info('.env file exists');
      } catch {
        log.info('Creating .env file...');
        await fs.copyFile('.env.example', '.env');
        log.success('.env created');
      }

      // Install dependencies
      log.info('Installing dependencies...');
      await runCommand('npm', ['ci']);
      log.success('Dependencies installed');

      // Setup database
      log.info('Setting up database...');
      await runCommand('sudo', ['service', 'postgresql', 'start']).catch(() => {});
      await program.commands.find(cmd => cmd.name() === 'db').parseAsync(['node', 'cli.js', 'db', 'create']);
      await program.commands.find(cmd => cmd.name() === 'db').parseAsync(['node', 'cli.js', 'db', 'migrate']);
      log.success('Database setup complete');

      // Start blockchain
      log.info('Starting blockchain...');
      await program.commands.find(cmd => cmd.name() === 'blockchain').parseAsync(['node', 'cli.js', 'blockchain', 'start']);

      log.success('✨ Setup complete! Run "node cli.js dev --full" to start.');
    } catch (error) {
      log.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Display project information')
  .action(async () => {
    try {
      log.title('📋 Project Information');
      
      console.log(chalk.cyan('Name:'), packageJson.name);
      console.log(chalk.cyan('Version:'), packageJson.version);
      
      const { stdout: nodeVersion } = await execAsync('node --version');
      console.log(chalk.cyan('Node:'), nodeVersion.trim());
      
      const { stdout: npmVersion } = await execAsync('npm --version');
      console.log(chalk.cyan('NPM:'), npmVersion.trim());
      
      try {
        const { stdout: branch } = await execAsync('git branch --show-current');
        console.log(chalk.cyan('Branch:'), branch.trim());
      } catch {
        console.log(chalk.cyan('Branch:'), 'Not a git repository');
      }

      console.log('\n' + chalk.cyan('Services:'));
      
      // Check PostgreSQL
      try {
        await execAsync('pg_isready -h localhost -p 5432');
        console.log(chalk.green('  ✓ PostgreSQL running'));
      } catch {
        console.log(chalk.yellow('  ⚠ PostgreSQL not running'));
      }

      // Check Anvil
      try {
        await execAsync('curl -s http://localhost:8545');
        console.log(chalk.green('  ✓ Anvil blockchain running'));
      } catch {
        console.log(chalk.yellow('  ⚠ Anvil blockchain not running'));
      }

    } catch (error) {
      log.error(`Failed to get info: ${error.message}`);
    }
  });

// Parse arguments
program.parse();
