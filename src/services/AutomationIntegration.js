/**
 * AutomationIntegration - Connects all unused automation scripts
 * Integrates browserbase setup, git automation, monitoring, and scaling
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

export class AutomationIntegration {
  constructor(config = {}) {
    console.log('🤖 Initializing AutomationIntegration with all automation scripts...');
    
    this.config = {
      scriptsPath: config.scriptsPath || path.join(process.cwd(), 'scripts/automation'),
      enableBrowserbase: config.enableBrowserbase !== false,
      enableMonitoring: config.enableMonitoring !== false,
      enableScaling: config.enableScaling !== false,
      enableGitAutomation: config.enableGitAutomation !== false,
      ...config
    };
    
    this.processes = new Map();
    this.automations = {
      browserbase: 'setup-browserbase.js',
      monitoring: 'monitoring-setup.js',
      gitAutomation: 'git-safe-automation.js',
      scaling: 'scaling/auto-scale.sh',
      deployment: 'automated-deployment.js',
      compliance: 'automated-compliance-system.js',
      qualityGates: 'quality-gates.js',
      ruleValidation: 'rule-validation.js',
      enterpriseOrganizer: 'enterprise-organizer.js',
      n8nSetup: 'setup-n8n-mcp.js'
    };
    
    this.initialized = false;
  }
  
  /**
   * Initialize automation systems
   */
  async initialize() {
    if (this.initialized) {
      console.log('AutomationIntegration already initialized');
      return;
    }
    
    console.log('🚀 Starting automation initialization...');
    
    try {
      // Load configuration files
      await this.loadConfigurations();
      
      // Initialize key automations
      if (this.config.enableBrowserbase) {
        await this.setupBrowserbase();
      }
      
      if (this.config.enableMonitoring) {
        await this.setupMonitoring();
      }
      
      if (this.config.enableGitAutomation) {
        await this.setupGitAutomation();
      }
      
      this.initialized = true;
      console.log('✅ AutomationIntegration initialized successfully');
    } catch (error) {
      console.error('❌ Automation initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Load automation configurations
   */
  async loadConfigurations() {
    const configFiles = [
      'rule-validation.config.json',
      '../config/environments/browserbase.json',
      '../config/environments/monitoring/metrics.json',
      '../config/environments/scaling/scaling.json'
    ];
    
    const configs = {};
    
    for (const configFile of configFiles) {
      try {
        const configPath = path.join(this.config.scriptsPath, configFile);
        const configData = await fs.readFile(configPath, 'utf8');
        const configName = path.basename(configFile, '.json');
        configs[configName] = JSON.parse(configData);
        console.log(`✅ Loaded ${configName} configuration`);
      } catch (error) {
        console.warn(`⚠️ Could not load ${configFile}:`, error.message);
      }
    }
    
    this.configurations = configs;
    return configs;
  }
  
  /**
   * Setup Browserbase integration
   */
  async setupBrowserbase() {
    console.log('🌐 Setting up Browserbase integration...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.browserbase);
      const { stdout, stderr } = await execAsync(`node ${scriptPath} --check`);
      
      if (stderr) {
        console.warn('Browserbase setup warnings:', stderr);
      }
      
      console.log('✅ Browserbase integration ready');
      return { success: true, output: stdout };
    } catch (error) {
      console.error('❌ Browserbase setup failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Setup monitoring system
   */
  async setupMonitoring() {
    console.log('📊 Setting up monitoring system...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.monitoring);
      const { stdout } = await execAsync(`node ${scriptPath}`);
      
      console.log('✅ Monitoring system configured');
      return { success: true, output: stdout };
    } catch (error) {
      console.error('❌ Monitoring setup failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Setup Git automation
   */
  async setupGitAutomation() {
    console.log('🔀 Setting up Git automation...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.gitAutomation);
      const { stdout } = await execAsync(`node ${scriptPath} --init`);
      
      console.log('✅ Git automation configured');
      return { success: true, output: stdout };
    } catch (error) {
      console.error('❌ Git automation setup failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Run compliance checks
   */
  async runComplianceCheck() {
    console.log('🔍 Running compliance checks...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.compliance);
      const { stdout } = await execAsync(`node ${scriptPath}`);
      
      const results = this.parseComplianceResults(stdout);
      console.log(`✅ Compliance check complete: ${results.passed}/${results.total} passed`);
      
      return results;
    } catch (error) {
      console.error('❌ Compliance check failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Run quality gates
   */
  async runQualityGates() {
    console.log('🚦 Running quality gates...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.qualityGates);
      const { stdout } = await execAsync(`node ${scriptPath}`);
      
      const results = this.parseQualityResults(stdout);
      console.log(`✅ Quality gates complete: ${results.status}`);
      
      return results;
    } catch (error) {
      console.error('❌ Quality gates failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Run rule validation
   */
  async runRuleValidation() {
    console.log('📏 Running rule validation...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.ruleValidation);
      const { stdout } = await execAsync(`node ${scriptPath}`);
      
      const results = this.parseValidationResults(stdout);
      console.log(`✅ Rule validation complete: ${results.violations} violations found`);
      
      return results;
    } catch (error) {
      console.error('❌ Rule validation failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Deploy application
   */
  async deploy(environment = 'staging') {
    console.log(`🚀 Deploying to ${environment}...`);
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.deployment);
      const { stdout } = await execAsync(`node ${scriptPath} --env ${environment}`);
      
      console.log(`✅ Deployment to ${environment} complete`);
      return { success: true, output: stdout };
    } catch (error) {
      console.error(`❌ Deployment to ${environment} failed:`, error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Scale services
   */
  async scaleServices(action = 'up', replicas = 2) {
    console.log(`📈 Scaling services ${action}...`);
    
    try {
      const scriptName = action === 'up' ? 'scale-up.js' : 'scale-down.js';
      const scriptPath = path.join(this.config.scriptsPath, 'scaling', scriptName);
      
      const { stdout } = await execAsync(`node ${scriptPath} --replicas ${replicas}`);
      
      console.log(`✅ Services scaled ${action} to ${replicas} replicas`);
      return { success: true, output: stdout };
    } catch (error) {
      console.error(`❌ Scaling ${action} failed:`, error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Setup N8N MCP integration
   */
  async setupN8nMCP() {
    console.log('🔧 Setting up N8N MCP integration...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, this.automations.n8nSetup);
      const { stdout } = await execAsync(`node ${scriptPath}`);
      
      console.log('✅ N8N MCP integration configured');
      return { success: true, output: stdout };
    } catch (error) {
      console.error('❌ N8N MCP setup failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Run health check
   */
  async runHealthCheck() {
    console.log('🏥 Running health check...');
    
    try {
      const scriptPath = path.join(this.config.scriptsPath, 'monitoring/health-check.js');
      const { stdout } = await execAsync(`node ${scriptPath}`);
      
      const health = JSON.parse(stdout);
      console.log(`✅ Health check complete: ${health.status}`);
      
      return health;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  // Helper methods
  parseComplianceResults(output) {
    // Simple parser - in reality would parse actual output format
    const lines = output.split('\n');
    const passed = lines.filter(l => l.includes('PASSED')).length;
    const total = lines.filter(l => l.includes('Test:')).length;
    
    return {
      passed,
      total,
      failed: total - passed,
      success: passed === total
    };
  }
  
  parseQualityResults(output) {
    // Simple parser
    return {
      status: output.includes('FAILED') ? 'failed' : 'passed',
      details: output
    };
  }
  
  parseValidationResults(output) {
    // Simple parser
    const violations = (output.match(/violation/gi) || []).length;
    return {
      violations,
      success: violations === 0,
      details: output
    };
  }
  
  /**
   * Get automation status
   */
  async getStatus() {
    const status = {
      initialized: this.initialized,
      configurations: Object.keys(this.configurations || {}),
      runningProcesses: Array.from(this.processes.keys()),
      timestamp: new Date().toISOString()
    };
    
    // Run quick health check
    try {
      status.health = await this.runHealthCheck();
    } catch (error) {
      status.health = { status: 'unknown', error: error.message };
    }
    
    return status;
  }
  
  /**
   * Shutdown automation systems
   */
  async shutdown() {
    console.log('🛑 Shutting down AutomationIntegration...');
    
    // Stop all running processes
    for (const [name, process] of this.processes) {
      console.log(`Stopping ${name}...`);
      process.kill();
    }
    
    this.processes.clear();
    this.initialized = false;
    
    console.log('✅ AutomationIntegration shutdown complete');
  }
}

// Export singleton instance
export const automationIntegration = new AutomationIntegration();


