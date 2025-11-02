/**
 * Configuration Management Service
 * Manages the distinction between Setup (workflows) and Settings (attributes)
 * Enables reusable, self-generating workflow configurations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConfigurationManager {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), 'config', 'workflow-configs');
    this.settingsPath = path.join(this.configPath, 'settings');
    this.setupPath = path.join(this.configPath, 'setups');
    this.atomsPath = path.join(this.configPath, 'atoms');
    
    this.ensureDirectories();
  }

  /**
   * Ensure configuration directories exist
   */
  ensureDirectories() {
    [this.configPath, this.settingsPath, this.setupPath, this.atomsPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * SETTINGS: Store reusable attribute configurations
   * Settings are individual component properties (toggles, dropdowns, inputs)
   */
  async saveSetting(name, settingConfig) {
    const setting = {
      id: `setting-${name}-${Date.now()}`,
      name,
      type: 'setting',
      ...settingConfig,
      savedAt: new Date().toISOString(),
      reusable: true
    };

    const filepath = path.join(this.settingsPath, `${name}.json`);
    fs.writeFileSync(filepath, JSON.stringify(setting, null, 2));
    
    console.log(`💾 Setting saved: ${name}`);
    return setting;
  }

  /**
   * Load a setting by name
   */
  async loadSetting(name) {
    const filepath = path.join(this.settingsPath, `${name}.json`);
    if (!fs.existsSync(filepath)) {
      return null;
    }
    
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  /**
   * List all available settings
   */
  async listSettings() {
    const files = fs.readdirSync(this.settingsPath);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  /**
   * SETUP: Store complete workflow configurations
   * Setups are full workflow definitions with multiple steps
   */
  async saveSetup(name, setupConfig) {
    const setup = {
      id: `setup-${name}-${Date.now()}`,
      name,
      type: 'setup',
      ...setupConfig,
      savedAt: new Date().toISOString(),
      reusable: true
    };

    const filepath = path.join(this.setupPath, `${name}.json`);
    fs.writeFileSync(filepath, JSON.stringify(setup, null, 2));
    
    console.log(`🔧 Setup saved: ${name}`);
    return setup;
  }

  /**
   * Load a setup by name
   */
  async loadSetup(name) {
    const filepath = path.join(this.setupPath, `${name}.json`);
    if (!fs.existsSync(filepath)) {
      return null;
    }
    
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  /**
   * List all available setups
   */
  async listSetups() {
    const files = fs.readdirSync(this.setupPath);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  /**
   * ATOMS: Store atomic component definitions
   * Atoms are the smallest reusable building blocks
   */
  async saveAtom(name, atomConfig) {
    const atom = {
      id: `atom-${name}-${Date.now()}`,
      name,
      type: 'atom',
      ...atomConfig,
      savedAt: new Date().toISOString(),
      reusable: true
    };

    const filepath = path.join(this.atomsPath, `${name}.json`);
    fs.writeFileSync(filepath, JSON.stringify(atom, null, 2));
    
    console.log(`⚛️  Atom saved: ${name}`);
    return atom;
  }

  /**
   * Load an atom by name
   */
  async loadAtom(name) {
    const filepath = path.join(this.atomsPath, `${name}.json`);
    if (!fs.existsSync(filepath)) {
      return null;
    }
    
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  /**
   * Bundle atoms into a component
   * Atoms → Component
   */
  async bundleAtomsToComponent(componentName, atomNames, additionalConfig = {}) {
    const atoms = [];
    
    for (const atomName of atomNames) {
      const atom = await this.loadAtom(atomName);
      if (atom) {
        atoms.push(atom);
      }
    }

    const component = {
      id: `component-${componentName}-${Date.now()}`,
      name: componentName,
      type: 'component',
      atoms,
      composition: atomNames,
      ...additionalConfig,
      createdAt: new Date().toISOString()
    };

    return component;
  }

  /**
   * Bundle components into a dashboard
   * Components → Dashboard
   */
  async bundleComponentsToDashboard(dashboardName, components, layout = {}) {
    const dashboard = {
      id: `dashboard-${dashboardName}-${Date.now()}`,
      name: dashboardName,
      type: 'dashboard',
      components,
      layout: {
        type: 'grid',
        columns: 12,
        responsive: true,
        ...layout
      },
      createdAt: new Date().toISOString()
    };

    return dashboard;
  }

  /**
   * Bundle dashboards into a workflow
   * Dashboards → Workflow
   */
  async bundleDashboardsToWorkflow(workflowName, dashboards, triggers = [], automation = {}) {
    const workflow = {
      id: `workflow-${workflowName}-${Date.now()}`,
      name: workflowName,
      type: 'workflow',
      dashboards,
      steps: dashboards.map((dashboard, index) => ({
        id: `step-${index}`,
        dashboard: dashboard.name,
        action: 'configure',
        order: index
      })),
      triggers,
      automation: {
        enabled: true,
        minimalInteraction: true,
        ...automation
      },
      createdAt: new Date().toISOString()
    };

    // Save as setup
    await this.saveSetup(workflowName, workflow);

    return workflow;
  }

  /**
   * Generate component from schema
   * Auto-creates atoms and bundles them into a component
   */
  async generateComponentFromSchema(tableName, columns, featureSettings = {}) {
    const atoms = [];
    
    for (const column of columns) {
      // Skip meta fields
      if (['id', 'created_at', 'updated_at'].includes(column.name)) {
        continue;
      }

      // Create atom for each field
      const atomConfig = {
        field: column.name,
        label: this.formatFieldName(column.name),
        dataType: column.type,
        required: !column.nullable,
        componentType: this.mapColumnTypeToComponent(column.type),
        validation: this.generateValidation(column),
        defaultValue: column.default || null
      };

      const atom = await this.saveAtom(`${tableName}-${column.name}`, atomConfig);
      atoms.push(atom);
    }

    // Bundle atoms into component
    const component = await this.bundleAtomsToComponent(
      tableName,
      atoms.map(a => a.name),
      {
        table: tableName,
        settings: featureSettings
      }
    );

    return component;
  }

  /**
   * Map database column types to UI component types
   */
  mapColumnTypeToComponent(columnType) {
    const typeMap = {
      'boolean': 'toggle',
      'integer': 'number',
      'bigint': 'number',
      'numeric': 'number',
      'decimal': 'number',
      'text': 'textarea',
      'varchar': 'input',
      'character varying': 'input',
      'jsonb': 'json-editor',
      'json': 'json-editor',
      'timestamp': 'datetime',
      'date': 'date',
      'uuid': 'uuid-display'
    };
    
    return typeMap[columnType.toLowerCase()] || 'input';
  }

  /**
   * Generate validation rules from column definition
   */
  generateValidation(column) {
    const rules = [];
    
    if (!column.nullable) {
      rules.push({ type: 'required', message: `${column.name} is required` });
    }
    
    if (column.maxLength) {
      rules.push({ type: 'maxLength', value: column.maxLength });
    }
    
    if (['integer', 'bigint'].includes(column.type)) {
      rules.push({ type: 'integer' });
    }
    
    return rules;
  }

  /**
   * Format field name from snake_case to Title Case
   */
  formatFieldName(name) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Create a self-generating workflow from prompt
   * Minimal user interaction required
   */
  async createSelfGeneratingWorkflow(workflowPrompt, options = {}) {
    const {
      dataMining = true,
      schemaLinking = true,
      autoPopulate = true,
      minimalInteraction = true
    } = options;

    const workflow = {
      id: `self-gen-${Date.now()}`,
      name: workflowPrompt.name || 'Auto-Generated Workflow',
      type: 'self-generating',
      prompt: workflowPrompt,
      phases: [],
      automation: {
        dataMining,
        schemaLinking,
        autoPopulate,
        minimalInteraction
      },
      createdAt: new Date().toISOString()
    };

    // Phase 1: Data Mining (if enabled)
    if (dataMining) {
      workflow.phases.push({
        id: 'phase-data-mining',
        name: 'Data Mining',
        action: 'discover-data-sources',
        automated: true,
        steps: [
          { action: 'scan-database-tables', automated: true },
          { action: 'analyze-data-patterns', automated: true },
          { action: 'identify-relationships', automated: true }
        ]
      });
    }

    // Phase 2: Schema Linking (if enabled)
    if (schemaLinking) {
      workflow.phases.push({
        id: 'phase-schema-linking',
        name: 'Schema Linking',
        action: 'link-schemas',
        automated: true,
        steps: [
          { action: 'analyze-schema-structure', automated: true },
          { action: 'create-linked-schemas', automated: true },
          { action: 'generate-component-configs', automated: true }
        ]
      });
    }

    // Phase 3: Component Generation
    workflow.phases.push({
      id: 'phase-component-generation',
      name: 'Component Generation',
      action: 'generate-components',
      automated: true,
      steps: [
        { action: 'create-atoms-from-schema', automated: true },
        { action: 'bundle-atoms-to-components', automated: true },
        { action: 'configure-component-settings', automated: autoPopulate }
      ]
    });

    // Phase 4: Dashboard Assembly
    workflow.phases.push({
      id: 'phase-dashboard-assembly',
      name: 'Dashboard Assembly',
      action: 'assemble-dashboards',
      automated: true,
      steps: [
        { action: 'bundle-components-to-dashboards', automated: true },
        { action: 'apply-layout-configs', automated: true },
        { action: 'populate-default-values', automated: autoPopulate }
      ]
    });

    // Phase 5: Workflow Finalization
    workflow.phases.push({
      id: 'phase-workflow-finalization',
      name: 'Workflow Finalization',
      action: 'finalize-workflow',
      automated: !minimalInteraction,
      steps: [
        { action: 'validate-configuration', automated: true },
        { action: 'save-reusable-configs', automated: true },
        { action: 'user-review', automated: false, required: minimalInteraction }
      ]
    });

    // Save as setup
    await this.saveSetup(workflow.name, workflow);

    return workflow;
  }

  /**
   * Execute a self-generating workflow
   */
  async executeSelfGeneratingWorkflow(workflow, context = {}) {
    const results = {
      workflowId: workflow.id,
      phases: [],
      atoms: [],
      components: [],
      dashboards: [],
      settings: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      success: false
    };

    try {
      for (const phase of workflow.phases) {
        console.log(`\n🔄 Executing Phase: ${phase.name}`);
        const phaseResult = await this.executePhase(phase, context);
        results.phases.push(phaseResult);

        // Collect generated artifacts
        if (phaseResult.atoms) results.atoms.push(...phaseResult.atoms);
        if (phaseResult.components) results.components.push(...phaseResult.components);
        if (phaseResult.dashboards) results.dashboards.push(...phaseResult.dashboards);
        if (phaseResult.settings) results.settings.push(...phaseResult.settings);
      }

      results.completedAt = new Date().toISOString();
      results.success = true;
      
      console.log('\n✅ Self-generating workflow completed successfully!');
      console.log(`   Atoms created: ${results.atoms.length}`);
      console.log(`   Components created: ${results.components.length}`);
      console.log(`   Dashboards created: ${results.dashboards.length}`);
      console.log(`   Settings saved: ${results.settings.length}`);

    } catch (error) {
      console.error('\n❌ Workflow execution failed:', error);
      results.error = error.message;
    }

    return results;
  }

  /**
   * Execute a single phase of the workflow
   */
  async executePhase(phase, context) {
    const phaseResult = {
      phaseId: phase.id,
      phaseName: phase.name,
      steps: [],
      atoms: [],
      components: [],
      dashboards: [],
      settings: [],
      success: false
    };

    try {
      for (const step of phase.steps) {
        console.log(`  → ${step.action}`);
        const stepResult = await this.executeStep(step, context);
        phaseResult.steps.push(stepResult);

        // Collect artifacts from step
        if (stepResult.atoms) phaseResult.atoms.push(...stepResult.atoms);
        if (stepResult.components) phaseResult.components.push(...stepResult.components);
        if (stepResult.dashboards) phaseResult.dashboards.push(...stepResult.dashboards);
        if (stepResult.settings) phaseResult.settings.push(...stepResult.settings);
      }

      phaseResult.success = true;
    } catch (error) {
      console.error(`  ❌ Phase failed: ${error.message}`);
      phaseResult.error = error.message;
    }

    return phaseResult;
  }

  /**
   * Execute a single step (placeholder for actual implementation)
   */
  async executeStep(step, context) {
    // This would integrate with actual services
    // For now, return a mock result
    return {
      stepAction: step.action,
      automated: step.automated,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get configuration summary
   */
  async getConfigurationSummary() {
    const settings = await this.listSettings();
    const setups = await this.listSetups();
    const atoms = fs.readdirSync(this.atomsPath).filter(f => f.endsWith('.json'));

    return {
      settings: {
        count: settings.length,
        items: settings
      },
      setups: {
        count: setups.length,
        items: setups
      },
      atoms: {
        count: atoms.length,
        items: atoms.map(f => f.replace('.json', ''))
      }
    };
  }
}

export default ConfigurationManager;
