#!/usr/bin/env node

/**
 * Schema Linking Runner Service
 * Automated service that runs schema linking analysis and maintains linked schemas
 */

import SchemaLinkingService from './schema-linking-service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SchemaLinkingRunner {
  constructor(config = {}) {
    this.config = {
      runInterval: config.runInterval || 3600000, // Run every hour by default
      outputDir: config.outputDir || path.join(process.cwd(), 'data', 'linked-schemas'),
      dbConfig: config.dbConfig || null,
      autoStart: config.autoStart !== false
    };
    
    this.service = null;
    this.intervalId = null;
    this.isRunning = false;
    this.lastRun = null;
    this.lastResult = null;
  }

  /**
   * Initialize the runner
   */
  async initialize() {
    console.log('🚀 Initializing Schema Linking Runner...');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.config.outputDir}`);
    }
    
    // Initialize schema linking service
    this.service = new SchemaLinkingService(this.config.dbConfig);
    
    console.log('✅ Schema Linking Runner initialized');
    
    if (this.config.autoStart) {
      await this.start();
    }
  }

  /**
   * Start the automated runner
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Runner is already running');
      return;
    }
    
    console.log('▶️  Starting Schema Linking Runner...');
    this.isRunning = true;
    
    // Run immediately
    await this.runLinkingCycle();
    
    // Schedule periodic runs
    this.intervalId = setInterval(async () => {
      await this.runLinkingCycle();
    }, this.config.runInterval);
    
    console.log(`✅ Runner started (runs every ${this.config.runInterval / 1000}s)`);
  }

  /**
   * Stop the automated runner
   */
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️  Runner is not running');
      return;
    }
    
    console.log('⏹️  Stopping Schema Linking Runner...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    
    if (this.service) {
      await this.service.close();
    }
    
    console.log('✅ Runner stopped');
  }

  /**
   * Run a single linking cycle
   */
  async runLinkingCycle() {
    const cycleStart = Date.now();
    console.log('\n' + '='.repeat(60));
    console.log(`🔄 Starting schema linking cycle at ${new Date().toISOString()}`);
    console.log('='.repeat(60) + '\n');
    
    try {
      // Step 1: Analyze database schema
      console.log('📊 Step 1: Analyzing database schema...');
      const analysisResult = await this.service.analyzeDatabaseSchema();
      
      console.log('\n📈 Analysis Results:');
      console.log(`   Tables: ${analysisResult.tables}`);
      console.log(`   Relationships: ${analysisResult.relationships}`);
      console.log(`   Features: ${analysisResult.features}`);
      
      // Step 2: Export linked schemas
      console.log('\n💾 Step 2: Exporting linked schemas...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = path.join(this.config.outputDir, `linked-schemas-${timestamp}.json`);
      const exportData = await this.service.exportLinkedSchemas(outputPath);
      
      // Step 3: Generate summary report
      console.log('\n📝 Step 3: Generating summary report...');
      const reportPath = this.generateSummaryReport(exportData, timestamp);
      
      // Step 4: Create latest symlink
      this.createLatestSymlink(outputPath);
      
      const cycleDuration = Date.now() - cycleStart;
      this.lastRun = new Date();
      this.lastResult = {
        success: true,
        timestamp: this.lastRun.toISOString(),
        duration: cycleDuration,
        tables: analysisResult.tables,
        relationships: analysisResult.relationships,
        features: analysisResult.features,
        outputPath,
        reportPath
      };
      
      console.log('\n' + '='.repeat(60));
      console.log(`✅ Schema linking cycle completed in ${cycleDuration}ms`);
      console.log('='.repeat(60) + '\n');
      
      return this.lastResult;
      
    } catch (error) {
      console.error('\n❌ Schema linking cycle failed:', error);
      
      this.lastResult = {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      };
      
      throw error;
    }
  }

  /**
   * Generate a human-readable summary report
   */
  generateSummaryReport(exportData, timestamp) {
    const reportPath = path.join(this.config.outputDir, `report-${timestamp}.md`);
    
    const report = [];
    report.push('# Schema Linking Analysis Report\n');
    report.push(`Generated: ${exportData.metadata.exportedAt}\n`);
    report.push('---\n\n');
    
    report.push('## Summary\n\n');
    report.push(`- **Total Tables**: ${exportData.metadata.totalTables}\n`);
    report.push(`- **Total Relationships**: ${exportData.metadata.totalRelationships}\n`);
    report.push(`- **Total Features**: ${exportData.metadata.totalFeatures}\n\n`);
    
    report.push('## Features\n\n');
    for (const feature of exportData.features) {
      report.push(`### ${this.formatName(feature.name)}\n\n`);
      report.push(`- **Tables**: ${feature.tables.length}\n`);
      report.push(`- **Settings**: ${feature.settings.length}\n`);
      report.push(`- **Options**: ${feature.options.length}\n\n`);
      
      if (feature.tables.length > 0) {
        report.push('**Tables:**\n');
        for (const table of feature.tables) {
          report.push(`- ${table.tableName} (${table.columns.length} columns)\n`);
        }
        report.push('\n');
      }
    }
    
    report.push('## Relationships\n\n');
    const relationshipsByType = {};
    for (const rel of exportData.relationships) {
      if (!relationshipsByType[rel.type]) {
        relationshipsByType[rel.type] = [];
      }
      relationshipsByType[rel.type].push(rel);
    }
    
    for (const [type, rels] of Object.entries(relationshipsByType)) {
      report.push(`### ${this.formatName(type)} (${rels.length})\n\n`);
      for (const rel of rels.slice(0, 10)) {
        report.push(`- ${rel.source.table} → ${rel.target?.table || 'N/A'}`);
        if (rel.strength) {
          report.push(` (strength: ${(rel.strength * 100).toFixed(0)}%)`);
        }
        report.push('\n');
      }
      if (rels.length > 10) {
        report.push(`\n_... and ${rels.length - 10} more_\n`);
      }
      report.push('\n');
    }
    
    report.push('## Linked Schema Maps\n\n');
    for (const [featureName, schema] of Object.entries(exportData.linkedSchemas)) {
      if (schema) {
        report.push(`### ${this.formatName(featureName)}\n\n`);
        report.push(`- **Tables**: ${schema.tables.length}\n`);
        report.push(`- **Relationships**: ${schema.relationships.length}\n`);
        report.push(`- **Dashboards**: ${schema.dashboards.length}\n`);
        report.push(`- **Settings**: ${schema.settings.length}\n`);
        report.push(`- **Options**: ${schema.options.length}\n\n`);
      }
    }
    
    fs.writeFileSync(reportPath, report.join(''));
    console.log(`📄 Summary report: ${reportPath}`);
    
    return reportPath;
  }

  /**
   * Create symlink to latest export
   */
  createLatestSymlink(targetPath) {
    const latestPath = path.join(this.config.outputDir, 'latest.json');
    
    try {
      if (fs.existsSync(latestPath)) {
        fs.unlinkSync(latestPath);
      }
      fs.symlinkSync(path.basename(targetPath), latestPath);
      console.log(`🔗 Created symlink: latest.json → ${path.basename(targetPath)}`);
    } catch (error) {
      console.warn('⚠️  Could not create symlink:', error.message);
      // Copy file instead of symlink on Windows
      fs.copyFileSync(targetPath, latestPath);
      console.log(`📄 Copied to: latest.json`);
    }
  }

  /**
   * Format name from snake_case to Title Case
   */
  formatName(name) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get runner status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      lastResult: this.lastResult,
      config: {
        runInterval: this.config.runInterval,
        outputDir: this.config.outputDir
      }
    };
  }

  /**
   * Run once and exit
   */
  async runOnce() {
    console.log('🔄 Running schema linking once...\n');
    await this.runLinkingCycle();
    
    if (this.service) {
      await this.service.close();
    }
    
    console.log('\n✅ Done');
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run-once';
  
  const runner = new SchemaLinkingRunner({
    runInterval: 3600000, // 1 hour
    autoStart: false
  });
  
  await runner.initialize();
  
  switch (command) {
    case 'start':
      await runner.start();
      console.log('\n🔄 Runner is running. Press Ctrl+C to stop.');
      
      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('\n\nReceived SIGINT, shutting down...');
        await runner.stop();
        process.exit(0);
      });
      break;
      
    case 'run-once':
    default:
      await runner.runOnce();
      process.exit(0);
      break;
  }
}

// Export for use as module
export { SchemaLinkingRunner };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
