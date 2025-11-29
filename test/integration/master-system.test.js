/**
 * Integration Tests for Master System Orchestrator
 * 
 * Tests the complete system integration including all services and orchestrators.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MasterSystemOrchestrator } from '../../services/master-system-orchestrator.js';

describe('Master System Orchestrator Integration', () => {
  let orchestrator;

  beforeAll(async () => {
    // Initialize orchestrator for testing
    orchestrator = new MasterSystemOrchestrator({
      autoStart: false,
      autoIndex: false,
      autoAgent: false,
      autoCampaign: false,
      mode: 'testing',
      services: {
        startup: { autoRestart: false },
        campaigns: { maxConcurrent: 1 },
        training: { numSimulations: 100, parallelWorkers: 1 },
      },
    });
  });

  afterAll(async () => {
    if (orchestrator && orchestrator.status === 'running') {
      await orchestrator.stop();
    }
  });

  describe('Initialization', () => {
    it('should initialize all orchestrators', async () => {
      await orchestrator.initialize();
      expect(orchestrator.status).toBe('initialized');
      expect(orchestrator.orchestrators).toBeDefined();
      expect(Object.keys(orchestrator.orchestrators).length).toBeGreaterThan(5);
    });

    it('should have all required orchestrators', () => {
      const requiredOrchestrators = [
        'startup',
        'campaigns',
        'navigation',
        'indexing',
        'agent',
        'training',
        'tensorflow',
        'storybook',
        'seo',
        'design',
      ];

      requiredOrchestrators.forEach((name) => {
        expect(orchestrator.orchestrators[name]).toBeDefined();
      });
    });
  });

  describe('Status Management', () => {
    it('should return system status', () => {
      const status = orchestrator.getStatus();
      
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('uptime');
      expect(status).toHaveProperty('metrics');
      expect(status).toHaveProperty('orchestrators');
    });

    it('should track metrics', () => {
      const status = orchestrator.getStatus();
      
      expect(status.metrics).toHaveProperty('servicesRunning');
      expect(status.metrics).toHaveProperty('campaignsActive');
      expect(status.metrics).toHaveProperty('agentsRunning');
      expect(status.metrics).toHaveProperty('indexingProgress');
      expect(status.metrics).toHaveProperty('trainingProgress');
    });
  });

  describe('Event Handling', () => {
    it('should emit initialized event', (done) => {
      const testOrchestrator = new MasterSystemOrchestrator({
        autoStart: false,
        mode: 'testing',
      });

      testOrchestrator.once('initialized', () => {
        expect(testOrchestrator.status).toBe('initialized');
        done();
      });

      testOrchestrator.initialize();
    });

    it('should emit error events on failure', (done) => {
      const testOrchestrator = new MasterSystemOrchestrator({
        autoStart: false,
        mode: 'testing',
        database: { invalid: true }, // Intentionally invalid config
      });

      testOrchestrator.once('error', (error) => {
        expect(error).toBeDefined();
        expect(testOrchestrator.status).toBe('error');
        done();
      });

      testOrchestrator.initialize().catch(() => {
        // Expected to fail
      });
    });
  });

  describe('Workflow Execution', () => {
    it('should execute workflows with smart navigation', async () => {
      // Mock the navigation system
      orchestrator.orchestrators.navigation = {
        decideWorkflow: async (params) => ({
          id: 'test-workflow-1',
          goal: params.goal,
          steps: [
            { action: 'index', params: {} },
            { action: 'analyze', params: {} },
            { action: 'fix', params: {} },
          ],
        }),
        executeWorkflow: async (workflow) => {
          return { success: true, workflowId: workflow.id };
        },
      };

      const workflow = await orchestrator.executeWorkflow('test_goal');
      
      expect(workflow).toBeDefined();
      expect(workflow.steps).toHaveLength(3);
      expect(workflow.goal).toBe('test_goal');
    });
  });

  describe('Campaign Management', () => {
    it('should start campaigns', async () => {
      // Mock campaign service
      orchestrator.orchestrators.campaigns = {
        createCampaign: async (config) => ({
          id: 'camp-001',
          name: config.name,
          status: 'created',
        }),
        executeCampaign: async (id) => {
          return { success: true, campaignId: id };
        },
      };

      const campaign = await orchestrator.startCampaign({
        name: 'Test Campaign',
        type: 'test',
        goals: { minItems: 10 },
      });

      expect(campaign).toBeDefined();
      expect(campaign.id).toBe('camp-001');
      expect(orchestrator.metrics.campaignsActive).toBeGreaterThan(0);
    });
  });

  describe('Training Data Generation', () => {
    it('should generate training data', async () => {
      // Mock training generator
      orchestrator.orchestrators.training = {
        generate: async () => {
          return { success: true, simulations: 100 };
        },
        getStats: () => ({
          totalSimulations: 100,
          patternsDiscovered: 10,
          dataHighways: 2,
        }),
      };

      const stats = await orchestrator.generateTrainingData(100);
      
      expect(stats).toBeDefined();
      expect(stats.totalSimulations).toBe(100);
      expect(orchestrator.metrics.trainingProgress).toBe(100);
    });
  });

  describe('System Lifecycle', () => {
    it('should handle start/stop cycle', async () => {
      const testOrchestrator = new MasterSystemOrchestrator({
        autoStart: false,
        autoIndex: false,
        autoAgent: false,
        autoCampaign: false,
        mode: 'testing',
      });

      // Mock all services for testing
      await testOrchestrator.initialize();
      
      // Mock startup service
      testOrchestrator.orchestrators.startup = {
        start: async () => ({ success: true }),
        stop: async () => ({ success: true }),
        getStats: () => ({ servicesRunning: 3 }),
      };

      // Mock TensorFlow
      testOrchestrator.orchestrators.tensorflow = {
        initialize: async () => ({ success: true }),
      };

      // Start
      await testOrchestrator.start();
      expect(testOrchestrator.status).toBe('running');

      // Stop
      await testOrchestrator.stop();
      expect(testOrchestrator.status).toBe('stopped');
    });
  });
});

describe('System Integration Scenarios', () => {
  it('should handle full autonomous development cycle', async () => {
    const orchestrator = new MasterSystemOrchestrator({
      autoStart: false,
      mode: 'testing',
    });

    await orchestrator.initialize();

    // Mock services
    orchestrator.orchestrators.startup = {
      start: async () => ({ success: true }),
      stop: async () => ({ success: true }),
      getStats: () => ({ servicesRunning: 5 }),
    };

    orchestrator.orchestrators.indexing = {
      indexCodebase: async () => ({ entities: 100, relationships: 200 }),
    };

    orchestrator.orchestrators.agent = {
      start: async () => ({ success: true }),
      stop: async () => ({ success: true }),
    };

    orchestrator.orchestrators.tensorflow = {
      initialize: async () => ({ success: true }),
    };

    // Enable auto features
    orchestrator.config.autoIndex = true;
    orchestrator.config.autoAgent = true;

    // Start system
    await orchestrator.start();
    expect(orchestrator.status).toBe('running');
    expect(orchestrator.metrics.agentsRunning).toBe(1);

    // Cleanup
    await orchestrator.stop();
  });

  it('should handle multiple campaigns simultaneously', async () => {
    const orchestrator = new MasterSystemOrchestrator({
      autoStart: false,
      mode: 'testing',
    });

    await orchestrator.initialize();

    // Mock campaign service
    let campaignId = 0;
    orchestrator.orchestrators.campaigns = {
      createCampaign: async (config) => ({
        id: `camp-${++campaignId}`,
        name: config.name,
        status: 'created',
      }),
      executeCampaign: async (id) => ({ success: true, campaignId: id }),
      getActiveCampaigns: async () => [],
    };

    // Start multiple campaigns
    const campaign1 = await orchestrator.startCampaign({
      name: 'Storybook Discovery',
      type: 'storybook_discovery',
    });

    const campaign2 = await orchestrator.startCampaign({
      name: 'SEO Mining',
      type: 'seo_mining',
    });

    expect(campaign1.id).toBe('camp-1');
    expect(campaign2.id).toBe('camp-2');
    expect(orchestrator.metrics.campaignsActive).toBe(2);
  });
});
