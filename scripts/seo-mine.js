#!/usr/bin/env node

/**
 * SEO Mining CLI
 * 
 * Command-line interface for SEO mining operations.
 */

import { SEOMiningService } from '../services/seo-mining-service.js';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';

const program = new Command();

program
  .name('seo-mine')
  .description('SEO Mining CLI for schema extraction and analysis')
  .version('1.0.0');

// Analyze command
program
  .command('analyze')
  .description('Analyze URL(s) for SEO and schema markup')
  .option('-u, --url <url>', 'Single URL to analyze')
  .option('-f, --file <file>', 'File with URLs (one per line)')
  .option('-o, --output <file>', 'Output file for results (JSON)')
  .action(async (options) => {
    console.log(chalk.blue('\n🔍 SEO Analysis\n'));
    
    try {
      const seoMiner = new SEOMiningService();
      let urls = [];
      
      if (options.url) {
        urls = [options.url];
      } else if (options.file) {
        const content = await fs.readFile(options.file, 'utf8');
        urls = content.split('\n').filter(line => line.trim());
      } else {
        console.error(chalk.red('Error: Provide --url or --file'));
        process.exit(1);
      }
      
      console.log(`Analyzing ${urls.length} URL(s)...\n`);
      
      const results = [];
      for (const url of urls) {
        console.log(chalk.gray(`  → ${url}`));
        const analysis = await seoMiner.analyzePage(url);
        results.push(analysis);
        
        console.log(chalk.green(`    ✓ Score: ${analysis.score}/100`));
        console.log(chalk.gray(`    Schemas: ${analysis.schemas.join(', ')}`));
      }
      
      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(results, null, 2));
        console.log(chalk.green(`\n✓ Results saved to ${options.output}`));
      }
      
      console.log();
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Extract rules command
program
  .command('extract-rules')
  .description('Extract attribute rules for ML training')
  .option('-u, --urls <urls>', 'Comma-separated URLs')
  .option('-f, --file <file>', 'File with URLs (one per line)')
  .option('-o, --output <file>', 'Output file (JSONL)', 'seo_rules.jsonl')
  .action(async (options) => {
    console.log(chalk.blue('\n📋 Extracting Attribute Rules\n'));
    
    try {
      const seoMiner = new SEOMiningService();
      let urls = [];
      
      if (options.urls) {
        urls = options.urls.split(',');
      } else if (options.file) {
        const content = await fs.readFile(options.file, 'utf8');
        urls = content.split('\n').filter(line => line.trim());
      } else {
        console.error(chalk.red('Error: Provide --urls or --file'));
        process.exit(1);
      }
      
      console.log(`Extracting rules from ${urls.length} URL(s)...\n`);
      
      const rules = await seoMiner.extractAttributeRules(urls);
      
      // Save as JSONL
      const jsonl = rules.map(rule => JSON.stringify(rule)).join('\n');
      await fs.writeFile(options.output, jsonl);
      
      console.log(chalk.green(`✓ Extracted ${rules.length} rules`));
      console.log(chalk.green(`✓ Saved to ${options.output}\n`));
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Competitor analysis command
program
  .command('competitor')
  .description('Analyze competitor SEO')
  .requiredOption('-u, --url <url>', 'Competitor URL')
  .requiredOption('-q, --query <query>', 'Search query')
  .option('-o, --output <file>', 'Output file (JSON)')
  .action(async (options) => {
    console.log(chalk.blue('\n🎯 Competitor Analysis\n'));
    
    try {
      const seoMiner = new SEOMiningService();
      
      console.log(`Analyzing: ${options.url}`);
      console.log(`Query: ${options.query}\n`);
      
      const analysis = await seoMiner.analyzeCompetitor(options.url, options.query);
      
      console.log(chalk.green('Results:'));
      console.log(`  Score: ${analysis.score}/100`);
      console.log(`  Keywords: ${analysis.keywords.length}`);
      console.log(`  Backlinks: ${analysis.backlinks}`);
      console.log(`  Domain Authority: ${analysis.domainAuthority}`);
      console.log(`  Schemas Used: ${analysis.schemas.join(', ')}`);
      
      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(analysis, null, 2));
        console.log(chalk.green(`\n✓ Saved to ${options.output}`));
      }
      
      console.log();
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Batch analyze command
program
  .command('batch')
  .description('Batch analyze multiple URLs in parallel')
  .requiredOption('-f, --file <file>', 'File with URLs (one per line)')
  .option('-w, --workers <num>', 'Number of parallel workers', '4')
  .option('-o, --output <file>', 'Output file (JSON)', 'batch_results.json')
  .action(async (options) => {
    console.log(chalk.blue('\n⚡ Batch Analysis\n'));
    
    try {
      const seoMiner = new SEOMiningService();
      
      const content = await fs.readFile(options.file, 'utf8');
      const urls = content.split('\n').filter(line => line.trim());
      
      console.log(`Analyzing ${urls.length} URLs with ${options.workers} workers...\n`);
      
      const results = await seoMiner.batchAnalyze(urls, {
        workers: parseInt(options.workers),
      });
      
      await fs.writeFile(options.output, JSON.stringify(results, null, 2));
      
      console.log(chalk.green(`\n✓ Analyzed ${results.length} URLs`));
      console.log(chalk.green(`✓ Saved to ${options.output}\n`));
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
