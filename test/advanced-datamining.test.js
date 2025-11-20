/**
 * Tests for Advanced Data Mining Orchestration System
 * 
 * Basic test suite to validate core functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import AdvancedDataMiningOrchestrator from '../services/advanced-datamining-orchestrator.js';
import VisualComponentGenerator from '../services/visual-component-generator.js';

describe('Advanced Data Mining Orchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new AdvancedDataMiningOrchestrator({
      headless: true,
      maxConcurrentJobs: 10
    });
  });

  describe('Tool Management', () => {
    it('should list all available tools', () => {
      const tools = orchestrator.listTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have puppeteer-scraper tool', () => {
      const tools = orchestrator.listTools();
      const scraperTool = tools.find(t => t.id === 'puppeteer-scraper');
      
      expect(scraperTool).toBeDefined();
      expect(scraperTool.name).toBe('Puppeteer Web Scraper');
      expect(scraperTool.capabilities).toContain('scraping');
    });

    it('should have all expected tools', () => {
      const tools = orchestrator.listTools();
      const toolIds = tools.map(t => t.id);
      
      const expectedTools = [
        'puppeteer-scraper',
        'puppeteer-layer-analyzer',
        'playwright-cross-browser',
        'playwright-api-scraper',
        'devtools-performance',
        'devtools-coverage',
        'electron-desktop-automation',
        'hybrid-pattern-miner'
      ];
      
      expectedTools.forEach(expectedTool => {
        expect(toolIds).toContain(expectedTool);
      });
    });
  });

  describe('Workflow Management', () => {
    it('should create a workflow', async () => {
      const workflow = await orchestrator.createWorkflow({
        name: 'Test Workflow',
        description: 'Test description',
        steps: []
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.status).toBe('created');
      expect(workflow.createdAt).toBeDefined();
    });

    it('should generate unique workflow IDs', async () => {
      const workflow1 = await orchestrator.createWorkflow({ name: 'Workflow 1', steps: [] });
      const workflow2 = await orchestrator.createWorkflow({ name: 'Workflow 2', steps: [] });

      expect(workflow1.id).not.toBe(workflow2.id);
    });

    it('should store created workflows', async () => {
      const workflow = await orchestrator.createWorkflow({
        name: 'Test Workflow',
        steps: []
      });

      const api = orchestrator.getCRUDAPI();
      const retrieved = api.getWorkflow(workflow.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(workflow.id);
      expect(retrieved.name).toBe('Test Workflow');
    });
  });

  describe('Campaign Management', () => {
    it('should create a campaign', async () => {
      const campaign = await orchestrator.createCampaign({
        name: 'Test Campaign',
        description: 'Test description',
        workflows: []
      });

      expect(campaign).toBeDefined();
      expect(campaign.id).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.status).toBe('created');
      expect(campaign.analytics).toBeDefined();
    });

    it('should initialize campaign analytics', async () => {
      const campaign = await orchestrator.createCampaign({
        name: 'Test Campaign',
        workflows: [
          { name: 'Workflow 1', steps: [] },
          { name: 'Workflow 2', steps: [] }
        ]
      });

      expect(campaign.analytics.totalWorkflows).toBe(2);
      expect(campaign.analytics.completedWorkflows).toBe(0);
      expect(campaign.analytics.failedWorkflows).toBe(0);
    });
  });

  describe('CRUD API', () => {
    it('should provide CRUD operations', () => {
      const api = orchestrator.getCRUDAPI();

      expect(api.createWorkflow).toBeDefined();
      expect(api.getWorkflow).toBeDefined();
      expect(api.listWorkflows).toBeDefined();
      expect(api.updateWorkflow).toBeDefined();
      expect(api.deleteWorkflow).toBeDefined();
      expect(api.executeWorkflow).toBeDefined();
    });

    it('should update workflow', async () => {
      const api = orchestrator.getCRUDAPI();
      const workflow = await api.createWorkflow({
        name: 'Original Name',
        steps: []
      });

      const updated = api.updateWorkflow(workflow.id, {
        name: 'Updated Name'
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Updated Name');
      expect(updated.updatedAt).toBeDefined();
    });

    it('should delete workflow', async () => {
      const api = orchestrator.getCRUDAPI();
      const workflow = await api.createWorkflow({
        name: 'To Delete',
        steps: []
      });

      const deleted = api.deleteWorkflow(workflow.id);
      expect(deleted).toBe(true);

      const retrieved = api.getWorkflow(workflow.id);
      expect(retrieved).toBeUndefined();
    });

    it('should list all workflows', async () => {
      const api = orchestrator.getCRUDAPI();
      
      await api.createWorkflow({ name: 'Workflow 1', steps: [] });
      await api.createWorkflow({ name: 'Workflow 2', steps: [] });
      await api.createWorkflow({ name: 'Workflow 3', steps: [] });

      const workflows = api.listWorkflows();
      expect(workflows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Event Handling', () => {
    it('should emit workflow created event', (done) => {
      orchestrator.on('workflowCreated', (workflow) => {
        expect(workflow).toBeDefined();
        expect(workflow.name).toBe('Event Test');
        done();
      });

      orchestrator.createWorkflow({ name: 'Event Test', steps: [] });
    });

    it('should emit campaign created event', (done) => {
      orchestrator.on('campaignCreated', (campaign) => {
        expect(campaign).toBeDefined();
        expect(campaign.name).toBe('Campaign Event Test');
        done();
      });

      orchestrator.createCampaign({ name: 'Campaign Event Test', workflows: [] });
    });
  });
});

describe('Visual Component Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new VisualComponentGenerator({
      framework: 'react',
      uiLibrary: 'antd'
    });
  });

  describe('Component Generation', () => {
    const testSchema = {
      fields: [
        { name: 'name', type: 'string', label: 'Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' }
      ]
    };

    const testAPI = {
      list: '/api/entities',
      create: '/api/entities',
      update: '/api/entities/:id',
      delete: '/api/entities/:id',
      view: '/api/entities/:id'
    };

    it('should generate component package', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);

      expect(pkg).toBeDefined();
      expect(pkg.entityName).toBe('Entity');
      expect(pkg.framework).toBe('react');
      expect(pkg.components).toBeDefined();
    });

    it('should generate list component', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const listComponent = pkg.components.list;

      expect(listComponent).toBeDefined();
      expect(listComponent.name).toBe('EntityList');
      expect(listComponent.code).toContain('EntityList');
      expect(listComponent.code).toContain('Table');
      expect(listComponent.dependencies).toContain('react');
      expect(listComponent.dependencies).toContain('antd');
    });

    it('should generate create component', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const createComponent = pkg.components.create;

      expect(createComponent).toBeDefined();
      expect(createComponent.name).toBe('EntityCreate');
      expect(createComponent.code).toContain('EntityCreate');
      expect(createComponent.code).toContain('Form');
    });

    it('should generate edit component', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const editComponent = pkg.components.edit;

      expect(editComponent).toBeDefined();
      expect(editComponent.name).toBe('EntityEdit');
      expect(editComponent.code).toContain('EntityEdit');
      expect(editComponent.code).toContain('useParams');
    });

    it('should generate view component', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const viewComponent = pkg.components.view;

      expect(viewComponent).toBeDefined();
      expect(viewComponent.name).toBe('EntityView');
      expect(viewComponent.code).toContain('EntityView');
      expect(viewComponent.code).toContain('Descriptions');
    });

    it('should generate visual editor component', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const editorComponent = pkg.components.visualEditor;

      expect(editorComponent).toBeDefined();
      expect(editorComponent.name).toBe('EntityVisualEditor');
      expect(editorComponent.code).toContain('DragDropContext');
    });

    it('should generate config editor component', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const configComponent = pkg.components.configEditor;

      expect(configComponent).toBeDefined();
      expect(configComponent.name).toBe('EntityConfigEditor');
      expect(configComponent.features).toBeDefined();
    });

    it('should generate routes', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);
      const routes = pkg.routes;

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);

      const listRoute = routes.find(r => r.path === '/entities');
      expect(listRoute).toBeDefined();
      expect(listRoute.component).toBe('EntityList');
    });

    it('should include API configuration', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);

      expect(pkg.api).toBeDefined();
      expect(pkg.api.list).toBe('/api/entities');
      expect(pkg.api.create).toBe('/api/entities');
    });

    it('should include schema', () => {
      const pkg = generator.generateComponentPackage('Entity', testAPI, testSchema);

      expect(pkg.schema).toBeDefined();
      expect(pkg.schema.fields).toBeDefined();
      expect(pkg.schema.fields.length).toBe(2);
    });
  });

  describe('Form Field Generation', () => {
    it('should generate text input for string fields', () => {
      const pkg = generator.generateComponentPackage('Test', {
        list: '/api/test',
        create: '/api/test',
        update: '/api/test/:id',
        delete: '/api/test/:id',
        view: '/api/test/:id'
      }, {
        fields: [{ name: 'title', type: 'string', label: 'Title' }]
      });

      const createComponent = pkg.components.create;
      expect(createComponent.code).toContain('<Input />');
    });

    it('should generate textarea for text fields', () => {
      const pkg = generator.generateComponentPackage('Test', {
        list: '/api/test',
        create: '/api/test',
        update: '/api/test/:id',
        delete: '/api/test/:id',
        view: '/api/test/:id'
      }, {
        fields: [{ name: 'content', type: 'textarea', label: 'Content' }]
      });

      const createComponent = pkg.components.create;
      expect(createComponent.code).toContain('Input.TextArea');
    });

    it('should add required validation', () => {
      const pkg = generator.generateComponentPackage('Test', {
        list: '/api/test',
        create: '/api/test',
        update: '/api/test/:id',
        delete: '/api/test/:id',
        view: '/api/test/:id'
      }, {
        fields: [{ name: 'email', type: 'email', label: 'Email', required: true }]
      });

      const createComponent = pkg.components.create;
      expect(createComponent.code).toContain('required');
    });
  });
});

describe('Integration Tests', () => {
  it('should work together - orchestrator and generator', async () => {
    const orchestrator = new AdvancedDataMiningOrchestrator();
    const generator = new VisualComponentGenerator();

    // Create a workflow
    const workflow = await orchestrator.createWorkflow({
      name: 'Integration Test Workflow',
      steps: []
    });

    // Generate components for the workflow entity
    const pkg = generator.generateComponentPackage('Workflow', {
      list: '/api/datamining/workflows',
      create: '/api/datamining/workflows',
      update: '/api/datamining/workflows/:id',
      delete: '/api/datamining/workflows/:id',
      view: '/api/datamining/workflows/:id'
    }, {
      fields: [
        { name: 'name', type: 'string', label: 'Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' }
      ]
    });

    expect(workflow).toBeDefined();
    expect(pkg).toBeDefined();
    expect(pkg.components.list.name).toBe('WorkflowList');
  });
});
