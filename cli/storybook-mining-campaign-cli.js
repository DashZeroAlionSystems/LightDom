#!/usr/bin/env node

/**
 * Storybook Mining Campaign CLI
 * 
 * Command-line interface for managing the Storybook/Design System mining campaign
 * with neural network integration
 */

import { StorybookMiningCampaign } from './storybook-mining-campaign.js';
import { program } from 'commander';
import chalk from 'chalk';

program
  .name('storybook-mining-campaign')
  .description('Mine Storybooks and design systems with neural network intelligence')
  .version('1.0.0');

program
  .command('start')
  .description('Start the mining campaign')
  .option('-n, --name <name>', 'Campaign name', 'default-campaign')
  .option('-c, --concurrency <number>', 'Max concurrent crawls', '10')
  .option('--no-neural', 'Disable neural network')
  .option('--no-auto-generate', 'Disable auto component generation')
  .option('--no-screenshots', 'Disable screenshot capture')
  .option('--no-ux-mining', 'Disable UX pattern mining')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🚀 Starting Storybook Mining Campaign\n'));
    
    try {
      const campaign = new StorybookMiningCampaign({
        campaignName: options.name,
        crawlerConfig: {
          maxConcurrency: parseInt(options.concurrency),
        },
        autoGeneration: {
          enabled: options.autoGenerate !== false,
          requiresScreenshot: options.screenshots !== false,
          requiresUXMining: options.uxMining !== false,
        },
        neuralConfig: {
          enabled: options.neural !== false,
        },
      });
      
      await campaign.initialize();
      await campaign.start();
      
      // Keep running until CTRL+C
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n\n🛑 Stopping campaign...\n'));
        await campaign.stop();
        process.exit(0);
      });
      
      // Display metrics every 30 seconds
      setInterval(async () => {
        const metrics = await campaign.getMetrics();
        console.log(chalk.cyan('\n📊 Current Metrics:'));
        console.log(`   Components: ${chalk.green(metrics.componentsGenerated)}`);
        console.log(`   Patterns: ${chalk.green(metrics.patternsDiscovered)}`);
        console.log(`   UX Patterns: ${chalk.green(metrics.uxPatternsFound)}`);
        console.log(`   Training Samples: ${chalk.green(metrics.trainingSamplesCollected)}\n`);
      }, 30000);
      
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check campaign status and metrics')
  .option('-n, --name <name>', 'Campaign name', 'default-campaign')
  .action(async (options) => {
    try {
      const campaign = new StorybookMiningCampaign({
        campaignName: options.name,
      });
      
      await campaign.initialize();
      const metrics = await campaign.getMetrics();
      
      console.log(chalk.blue.bold('\n📊 Campaign Status\n'));
      console.log(`${chalk.bold('Campaign:')} ${options.name}`);
      console.log(`${chalk.bold('Neural Instance:')} ${metrics.neuralInstanceId}`);
      console.log(`${chalk.bold('Components Generated:')} ${chalk.green(metrics.componentsGenerated)}`);
      console.log(`${chalk.bold('Patterns Discovered:')} ${chalk.green(metrics.patternsDiscovered)}`);
      console.log(`${chalk.bold('UX Patterns:')} ${chalk.green(metrics.uxPatternsFound)}`);
      console.log(`${chalk.bold('Training Samples:')} ${chalk.green(metrics.trainingSamplesCollected)}\n`);
      
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('list-components')
  .description('List all generated components')
  .option('-n, --name <name>', 'Campaign name', 'default-campaign')
  .action(async (options) => {
    try {
      const { Pool } = await import('pg');
      const db = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lightdom',
      });
      
      const result = await db.query(`
        SELECT gc.component_name, gc.component_type, gc.file_path, gc.story_path,
               gc.screenshot_path, gc.generated_at, mc.name as campaign_name
        FROM generated_components gc
        JOIN mining_campaigns mc ON gc.campaign_id = mc.id
        WHERE mc.name = $1
        ORDER BY gc.generated_at DESC
      `, [options.name]);
      
      console.log(chalk.blue.bold(`\n📦 Generated Components (${result.rows.length})\n`));
      
      if (result.rows.length === 0) {
        console.log(chalk.yellow('No components generated yet.\n'));
      } else {
        result.rows.forEach((row, index) => {
          console.log(chalk.bold(`${index + 1}. ${row.component_name}`));
          console.log(`   Type: ${row.component_type}`);
          console.log(`   File: ${chalk.green(row.file_path)}`);
          console.log(`   Story: ${chalk.green(row.story_path)}`);
          if (row.screenshot_path) {
            console.log(`   Screenshot: ${chalk.cyan(row.screenshot_path)}`);
          }
          console.log(`   Generated: ${row.generated_at.toLocaleString()}\n`);
        });
      }
      
      await db.end();
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('list-patterns')
  .description('List discovered design patterns')
  .option('-n, --name <name>', 'Campaign name', 'default-campaign')
  .option('-b, --best-practices', 'Show only best practices')
  .option('-a, --anti-patterns', 'Show only anti-patterns')
  .action(async (options) => {
    try {
      const { Pool } = await import('pg');
      const db = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lightdom',
      });
      
      let query = `
        SELECT dp.pattern_name, dp.pattern_type, dp.quality_score,
               dp.is_best_practice, dp.is_anti_pattern, dp.frequency,
               dp.similarities, dp.differences
        FROM design_patterns dp
        JOIN mining_campaigns mc ON dp.campaign_id = mc.id
        WHERE mc.name = $1
      `;
      
      if (options.bestPractices) {
        query += ' AND dp.is_best_practice = true';
      }
      if (options.antiPatterns) {
        query += ' AND dp.is_anti_pattern = true';
      }
      
      query += ' ORDER BY dp.quality_score DESC';
      
      const result = await db.query(query, [options.name]);
      
      console.log(chalk.blue.bold(`\n🎨 Design Patterns (${result.rows.length})\n`));
      
      if (result.rows.length === 0) {
        console.log(chalk.yellow('No patterns discovered yet.\n'));
      } else {
        result.rows.forEach((row, index) => {
          const label = row.is_best_practice ? chalk.green('✓ Best Practice') :
                       row.is_anti_pattern ? chalk.red('✗ Anti-Pattern') :
                       chalk.gray('Pattern');
          
          console.log(chalk.bold(`${index + 1}. ${row.pattern_name}`));
          console.log(`   ${label}`);
          console.log(`   Type: ${row.pattern_type}`);
          console.log(`   Quality: ${chalk.yellow(row.quality_score.toFixed(2))}`);
          console.log(`   Frequency: ${row.frequency}`);
          
          if (row.similarities && row.similarities.length > 0) {
            console.log(`   Similarities: ${row.similarities.length} found`);
          }
          if (row.differences && row.differences.length > 0) {
            console.log(`   Differences: ${row.differences.length} found`);
          }
          console.log('');
        });
      }
      
      await db.end();
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('retrain')
  .description('Manually trigger neural network retraining')
  .option('-n, --name <name>', 'Campaign name', 'default-campaign')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🧠 Retraining Neural Network\n'));
    
    try {
      const campaign = new StorybookMiningCampaign({
        campaignName: options.name,
      });
      
      await campaign.initialize();
      
      console.log('Training with latest data...');
      await campaign.checkAndRetrain();
      
      console.log(chalk.green('\n✅ Neural network retrained successfully\n'));
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
