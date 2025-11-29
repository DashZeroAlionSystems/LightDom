/**
 * Master System Orchestrator
 * 
 * Coordinates all services and systems for complete AI-powered autonomous development.
 * This is the top-level orchestrator that manages:
 * - System Startup Orchestrator (manages service lifecycle)
 * - Campaign Management (data mining campaigns)
 * - Smart Navigation (AI workflow decisions)
 * - Codebase Indexing (knowledge graph building)
 * - Autonomous Agents (self-healing code)
 * - Training Data Generation (ML training)
 * - TensorFlow Models (pattern recognition)
 * - Storybook Discovery (component mining)
 * - SEO Mining (schema extraction)
 * - Anime.js Design (fluid components)
 * 
 * @module MasterSystemOrchestrator
 */

import EventEmitter from 'events';
import { SystemStartupOrchestrator } from './system-startup-orchestrator.js';
import { CampaignManagementService } from './campaign-management-service.js';
import { SmartNavigationSystem } from './smart-navigation-system.js';
import { CodebaseIndexingService } from './codebase-indexing-service.js';
import { AutonomousCodeAgent } from './autonomous-code-agent.js';
import { TrainingDataGenerator } from './training-data-generator.js';
import { TensorFlowCodeModel } from './tensorflow-code-model.js';
import { StorybookCrawler } from './storybook-crawler.js';
import { SEOMiningService } from './seo-mining-service.js';
import { AnimejsFluidDesignService } from './animejs-fluid-design-service.js';

/**
 * @typedef {Object} MasterOrchestratorConfig
 * @property {Object} database - Database configuration
 * @property {Object} ai - AI service configuration
 * @property {boolean} autoStart - Auto-start all services
 * @property {boolean} autoIndex - Auto-index codebase on startup
 * @property {boolean} autoAgent - Auto-start autonomous agent
 * @property {boolean} autoCampaign - Auto-start default campaigns
 * @property {string} mode - Operation mode: 'development', 'production', 'testing'
 * @property {Object} services - Service-specific configurations
 */

export class MasterSystemOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      autoStart: true,
      autoIndex: false,
      autoAgent: false,
      autoCampaign: false,
      mode: 'development',
      services: {},
      ...config,
    };

    this.orchestrators = {};
    this.status = 'initialized';
    this.startTime = null;
    this.metrics = {
      systemUptime: 0,
      servicesRunning: 0,
      campaignsActive: 0,
      agentsRunning: 0,
      indexingProgress: 0,
      trainingProgress: 0,
    };
  }

  /**
   * Initialize all orchestrators and services
   */
  async initialize() {
    console.log('🚀 Initializing Master System Orchestrator...');
    this.status = 'initializing';
    
    try {
      // 1. System Startup Orchestrator (Priority 1)
      console.log('  ├─ Initializing System Startup Orchestrator...');
      this.orchestrators.startup = new SystemStartupOrchestrator({
        autoRestart: true,
        healthCheckInterval: 30000,
        ...this.config.services.startup,
      });

      // 2. Campaign Management (Priority 2)
      console.log('  ├─ Initializing Campaign Management...');
      this.orchestrators.campaigns = new CampaignManagementService({
        db: this.config.database,
        ...this.config.services.campaigns,
      });

      // 3. Smart Navigation (Priority 3)
      console.log('  ├─ Initializing Smart Navigation System...');
      this.orchestrators.navigation = new SmartNavigationSystem({
        db: this.config.database,
        aiService: this.config.ai,
        ...this.config.services.navigation,
      });

      // 4. Codebase Indexing (Priority 4)
      console.log('  ├─ Initializing Codebase Indexing...');
      this.orchestrators.indexing = new CodebaseIndexingService({
        db: this.config.database,
        deepseekService: this.config.ai?.deepseek,
        ...this.config.services.indexing,
      });

      // 5. Autonomous Agent (Priority 5)
      console.log('  ├─ Initializing Autonomous Agent...');
      this.orchestrators.agent = new AutonomousCodeAgent({
        agentId: 'master-agent-001',
        autoFix: this.config.autoAgent,
        autoPR: this.config.autoAgent,
        db: this.config.database,
        ...this.config.services.agent,
      });

      // 6. Training Data Generator (Priority 6)
      console.log('  ├─ Initializing Training Data Generator...');
      this.orchestrators.training = new TrainingDataGenerator({
        numSimulations: 100000,
        parallelWorkers: 4,
        ...this.config.services.training,
      });

      // 7. TensorFlow Model (Priority 7)
      console.log('  ├─ Initializing TensorFlow Model...');
      this.orchestrators.tensorflow = new TensorFlowCodeModel({
        ...this.config.services.tensorflow,
      });

      // 8. Storybook Crawler (Priority 8)
      console.log('  ├─ Initializing Storybook Crawler...');
      this.orchestrators.storybook = new StorybookCrawler({
        ...this.config.services.storybook,
      });

      // 9. SEO Mining (Priority 9)
      console.log('  ├─ Initializing SEO Mining Service...');
      this.orchestrators.seo = new SEOMiningService({
        db: this.config.database,
        ...this.config.services.seo,
      });

      // 10. Anime.js Design (Priority 10)
      console.log('  └─ Initializing Anime.js Fluid Design...');
      this.orchestrators.design = new AnimejsFluidDesignService({
        ...this.config.services.design,
      });

      this.status = 'initialized';
      console.log('✅ All orchestrators initialized successfully');
      
      this.emit('initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize orchestrators:', error);
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start the complete system
   */
  async start() {
    console.log('\n🎬 Starting Master System...\n');
    this.startTime = Date.now();
    this.status = 'starting';

    try {
      // Phase 1: Start core services
      console.log('📦 Phase 1: Starting Core Services...');
      await this.orchestrators.startup.start();
      this.metrics.servicesRunning = this.orchestrators.startup.getStats().servicesRunning;
      console.log(`  ✓ ${this.metrics.servicesRunning} services running\n`);

      // Phase 2: Index codebase (if enabled)
      if (this.config.autoIndex) {
        console.log('📊 Phase 2: Indexing Codebase...');
        await this.orchestrators.indexing.indexCodebase();
        this.metrics.indexingProgress = 100;
        console.log('  ✓ Codebase indexed\n');
      }

      // Phase 3: Start campaigns (if enabled)
      if (this.config.autoCampaign) {
        console.log('🎯 Phase 3: Starting Default Campaigns...');
        const campaign = await this.orchestrators.campaigns.createCampaign({
          name: 'Default Discovery Campaign',
          type: 'storybook_discovery',
          goals: { minComponents: 1000 },
          resources: { maxWorkers: 4, maxMemoryMB: 2048 },
        });
        await this.orchestrators.campaigns.executeCampaign(campaign.id);
        this.metrics.campaignsActive = 1;
        console.log('  ✓ Campaign started\n');
      }

      // Phase 4: Start autonomous agent (if enabled)
      if (this.config.autoAgent) {
        console.log('🤖 Phase 4: Starting Autonomous Agent...');
        await this.orchestrators.agent.start();
        this.metrics.agentsRunning = 1;
        console.log('  ✓ Agent running\n');
      }

      // Phase 5: Initialize TensorFlow model
      console.log('🧠 Phase 5: Initializing AI Models...');
      await this.orchestrators.tensorflow.initialize();
      console.log('  ✓ TensorFlow model ready\n');

      this.status = 'running';
      this.emit('started');
      
      console.log('✅ Master System Started Successfully!\n');
      this._printStatus();
      
      // Start monitoring
      this._startMonitoring();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start system:', error);
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the complete system
   */
  async stop() {
    console.log('\n🛑 Stopping Master System...\n');
    this.status = 'stopping';

    try {
      // Stop in reverse order
      console.log('Stopping services...');
      
      if (this.orchestrators.agent) {
        await this.orchestrators.agent.stop();
      }
      
      if (this.orchestrators.campaigns) {
        // Stop all active campaigns
        const campaigns = await this.orchestrators.campaigns.getActiveCampaigns();
        for (const campaign of campaigns) {
          await this.orchestrators.campaigns.pauseCampaign(campaign.id);
        }
      }
      
      if (this.orchestrators.startup) {
        await this.orchestrators.startup.stop();
      }

      this.status = 'stopped';
      this.emit('stopped');
      
      console.log('✅ System stopped successfully\n');
      return true;
    } catch (error) {
      console.error('❌ Error stopping system:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Execute a smart workflow
   */
  async executeWorkflow(goal, context = {}) {
    console.log(`\n🎯 Executing Smart Workflow: ${goal}\n`);
    
    try {
      // Use smart navigation to decide workflow
      const workflow = await this.orchestrators.navigation.decideWorkflow({
        goal,
        context,
      });

      console.log('Workflow steps:');
      workflow.steps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.action}`);
      });
      console.log();

      // Execute workflow
      await this.orchestrators.navigation.executeWorkflow(workflow);
      
      console.log('✅ Workflow completed successfully\n');
      return workflow;
    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Start a new campaign
   */
  async startCampaign(config) {
    console.log(`\n📊 Starting Campaign: ${config.name}\n`);
    
    try {
      const campaign = await this.orchestrators.campaigns.createCampaign(config);
      await this.orchestrators.campaigns.executeCampaign(campaign.id);
      this.metrics.campaignsActive++;
      
      console.log('✅ Campaign started successfully\n');
      return campaign;
    } catch (error) {
      console.error('❌ Campaign start failed:', error);
      throw error;
    }
  }

  /**
   * Generate training data
   */
  async generateTrainingData(numSimulations = 100000) {
    console.log(`\n🎓 Generating Training Data: ${numSimulations} simulations\n`);
    
    try {
      await this.orchestrators.training.generate();
      this.metrics.trainingProgress = 100;
      
      console.log('✅ Training data generated successfully\n');
      return this.orchestrators.training.getStats();
    } catch (error) {
      console.error('❌ Training data generation failed:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    this.metrics.systemUptime = this.startTime 
      ? Math.floor((Date.now() - this.startTime) / 1000)
      : 0;

    return {
      status: this.status,
      uptime: this.metrics.systemUptime,
      metrics: this.metrics,
      orchestrators: Object.keys(this.orchestrators).reduce((acc, key) => {
        const orchestrator = this.orchestrators[key];
        if (orchestrator && typeof orchestrator.getStats === 'function') {
          acc[key] = orchestrator.getStats();
        } else {
          acc[key] = { status: 'initialized' };
        }
        return acc;
      }, {}),
    };
  }

  /**
   * Print current status
   */
  _printStatus() {
    const status = this.getStatus();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('        MASTER SYSTEM STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Status:            ${status.status.toUpperCase()}`);
    console.log(`Uptime:            ${status.uptime}s`);
    console.log(`Services Running:  ${status.metrics.servicesRunning}`);
    console.log(`Campaigns Active:  ${status.metrics.campaignsActive}`);
    console.log(`Agents Running:    ${status.metrics.agentsRunning}`);
    console.log(`Indexing:          ${status.metrics.indexingProgress}%`);
    console.log(`Training:          ${status.metrics.trainingProgress}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Start monitoring system health
   */
  _startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      const status = this.getStatus();
      this.emit('status', status);
      
      // Check for issues
      if (status.metrics.servicesRunning < 3) {
        this.emit('warning', 'Low service count');
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop monitoring
   */
  _stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new MasterSystemOrchestrator({
    autoStart: true,
    autoIndex: process.env.AUTO_INDEX === 'true',
    autoAgent: process.env.AUTO_AGENT === 'true',
    autoCampaign: process.env.AUTO_CAMPAIGN === 'true',
    mode: process.env.NODE_ENV || 'development',
  });

  orchestrator.on('status', (status) => {
    console.log(`[${new Date().toISOString()}] System Status:`, status.status);
  });

  orchestrator.on('error', (error) => {
    console.error('System Error:', error);
    process.exit(1);
  });

  try {
    await orchestrator.initialize();
    await orchestrator.start();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await orchestrator.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await orchestrator.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}
