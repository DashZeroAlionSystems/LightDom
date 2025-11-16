#!/usr/bin/env node
/**
 * Storybook Discovery CLI
 * 
 * Command-line interface for discovering and mining Storybook instances
 * 
 * Usage:
 *   node storybook-discovery-cli.js discover --template quick
 *   node storybook-discovery-cli.js seeds --github
 *   node storybook-discovery-cli.js crawl --url https://storybook.js.org
 */

import { program } from 'commander';
import { StorybookCrawler } from '../services/storybook-crawler.js';
import { StorybookSeederService } from '../services/storybook-seeder-service.js';
import { StorybookDiscoveryService } from '../services/storybook-discovery-service.js';
import { getTemplate, listTemplates, mergeConfig } from '../config/storybook-crawler-templates.js';

// Configure CLI
program
  .name('storybook-discovery')
  .description('Discover and mine Storybook component libraries from the internet')
  .version('1.0.0');

/**
 * Discover command - full discovery and crawling
 */
program
  .command('discover')
  .description('Discover and crawl Storybook instances')
  .option('-t, --template <name>', 'Use configuration template', 'quick')
  .option('-s, --max-seeds <number>', 'Maximum seeds to process', '50')
  .option('--no-discover', 'Skip discovery phase')
  .option('-o, --output <path>', 'Output directory', './storybook-discoveries')
  .action(async (options) => {
    try {
      console.log('🚀 Starting Storybook discovery...');
      console.log(`📋 Template: ${options.template}`);
      
      const template = getTemplate(options.template);
      const config = mergeConfig(options.template, {
        outputDir: options.output,
      });
      
      const crawler = new StorybookCrawler(config);
      
      await crawler.start({
        maxSeeds: parseInt(options.maxSeeds),
        discover: options.discover,
      });
      
      const stats = crawler.getStats();
      
      console.log('\n✅ Discovery complete!');
      console.log(`📊 Statistics:`);
      console.log(`   - Instances crawled: ${stats.instancesCrawled}`);
      console.log(`   - Components mined: ${stats.componentsMined}`);
      console.log(`   - Stories extracted: ${stats.storiesExtracted}`);
      console.log(`   - Errors: ${stats.errors}`);
      
      await crawler.close();
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Discovery failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Seeds command - generate seed URLs
 */
program
  .command('seeds')
  .description('Generate seed URLs for Storybook discovery')
  .option('--github', 'Include GitHub sources')
  .option('--npm', 'Include NPM sources')
  .option('--known', 'Include known sources', true)
  .option('-o, --output <file>', 'Output file', './storybook-seeds.json')
  .action(async (options) => {
    try {
      console.log('🌱 Generating Storybook seeds...');
      
      const seeder = new StorybookSeederService({
        enableGithub: options.github,
        enableNpm: options.npm,
        enableWebSearch: options.known,
      });
      
      await seeder.generateSeeds();
      
      const seeds = seeder.getSeeds();
      const stats = seeder.getStats();
      
      console.log(`\n✅ Generated ${seeds.length} seeds`);
      console.log(`📊 Statistics:`);
      console.log(`   - GitHub: ${stats.githubSeeds}`);
      console.log(`   - NPM: ${stats.npmSeeds}`);
      console.log(`   - Known: ${stats.webSeeds}`);
      
      // Save to file
      const fs = await import('fs/promises');
      await fs.writeFile(
        options.output,
        JSON.stringify(seeder.exportSeeds(), null, 2),
        'utf-8'
      );
      
      console.log(`💾 Saved to ${options.output}`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed generation failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Crawl command - crawl specific URL
 */
program
  .command('crawl')
  .description('Crawl a specific Storybook instance')
  .requiredOption('-u, --url <url>', 'Storybook URL to crawl')
  .option('-d, --depth <number>', 'Crawl depth', '2')
  .option('-o, --output <path>', 'Output directory', './storybook-crawl')
  .action(async (options) => {
    try {
      console.log(`🕷️  Crawling Storybook: ${options.url}`);
      
      const crawler = new StorybookCrawler({
        maxDepth: parseInt(options.depth),
        outputDir: options.output,
      });
      
      await crawler.initialize();
      await crawler.crawlStorybookInstance(options.url);
      
      const data = crawler.getCrawledData();
      const stats = crawler.getStats();
      
      console.log('\n✅ Crawl complete!');
      console.log(`📊 Statistics:`);
      console.log(`   - Components: ${stats.componentsMined}`);
      console.log(`   - Stories: ${stats.storiesExtracted}`);
      
      // Save data
      const fs = await import('fs/promises');
      await fs.mkdir(options.output, { recursive: true });
      await fs.writeFile(
        `${options.output}/crawl-data.json`,
        JSON.stringify(data, null, 2),
        'utf-8'
      );
      
      console.log(`💾 Saved to ${options.output}/crawl-data.json`);
      
      await crawler.close();
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Crawl failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Templates command - list available templates
 */
program
  .command('templates')
  .description('List available configuration templates')
  .action(() => {
    try {
      const templates = listTemplates();
      
      console.log('\n📋 Available Templates:\n');
      
      for (const template of templates) {
        console.log(`  ${template.name}`);
        console.log(`    ${template.description}`);
        console.log('');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to list templates:', error.message);
      process.exit(1);
    }
  });

/**
 * Detect command - check if URL is Storybook
 */
program
  .command('detect')
  .description('Detect if a URL hosts a Storybook instance')
  .requiredOption('-u, --url <url>', 'URL to check')
  .action(async (options) => {
    try {
      console.log(`🔍 Detecting Storybook at: ${options.url}`);
      
      const discovery = new StorybookDiscoveryService();
      await discovery.initialize();
      
      const isStorybook = await discovery.detectStorybook(options.url);
      
      if (isStorybook) {
        console.log('✅ Storybook instance detected!');
      } else {
        console.log('❌ No Storybook instance found');
      }
      
      await discovery.close();
      
      process.exit(isStorybook ? 0 : 1);
    } catch (error) {
      console.error('❌ Detection failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Stats command - show statistics
 */
program
  .command('stats')
  .description('Show statistics from previous crawls')
  .option('-d, --directory <path>', 'Crawl directory', './storybook-crawl')
  .action(async (options) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Read all JSON files in directory
      const files = await fs.readdir(options.directory);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let totalComponents = 0;
      let totalStories = 0;
      let totalInstances = 0;
      
      for (const file of jsonFiles) {
        const content = await fs.readFile(
          path.join(options.directory, file),
          'utf-8'
        );
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          totalInstances += data.length;
          for (const instance of data) {
            totalComponents += instance.components?.length || 0;
            totalStories += instance.stories?.length || 0;
          }
        }
      }
      
      console.log('\n📊 Crawl Statistics:\n');
      console.log(`   Files: ${jsonFiles.length}`);
      console.log(`   Instances: ${totalInstances}`);
      console.log(`   Components: ${totalComponents}`);
      console.log(`   Stories: ${totalStories}`);
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to read stats:', error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
