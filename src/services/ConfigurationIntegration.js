/**
 * ConfigurationIntegration - Connects all unused configuration files
 * Integrates browserbase, monitoring, scaling, and blockchain configs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConfigurationIntegration {
  constructor() {
    console.log('⚙️ Initializing ConfigurationIntegration...');
    
    this.configBase = path.join(process.cwd(), 'config/environments');
    this.configs = {};
    this.initialized = false;
  }
  
  /**
   * Load all configuration files
   */
  async initialize() {
    if (this.initialized) {
      console.log('ConfigurationIntegration already initialized');
      return;
    }
    
    console.log('📁 Loading configuration files...');
    
    try {
      // Load all configs
      await this.loadBrowserbaseConfig();
      await this.loadBlockchainConfig();
      await this.loadMonitoringConfig();
      await this.loadScalingConfig();
      await this.loadSecurityConfig();
      await this.loadDatabaseConfig();
      await this.loadEnvironmentConfigs();
      
      this.initialized = true;
      console.log('✅ ConfigurationIntegration initialized successfully');
    } catch (error) {
      console.error('❌ Configuration initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Load Browserbase configuration
   */
  async loadBrowserbaseConfig() {
    try {
      const configPath = path.join(this.configBase, 'browserbase.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.configs.browserbase = JSON.parse(configData);
      
      // Apply environment variable substitutions
      this.configs.browserbase = this.substituteEnvVars(this.configs.browserbase);
      
      console.log('✅ Loaded Browserbase configuration');
    } catch (error) {
      console.warn('⚠️ Could not load Browserbase config:', error.message);
      this.configs.browserbase = this.getDefaultBrowserbaseConfig();
    }
  }
  
  /**
   * Load blockchain configurations
   */
  async loadBlockchainConfig() {
    try {
      const contractsPath = path.join(this.configBase, 'blockchain/contracts.json');
      const networksPath = path.join(this.configBase, 'blockchain/networks.json');
      
      const contracts = await fs.readFile(contractsPath, 'utf8');
      const networks = await fs.readFile(networksPath, 'utf8');
      
      this.configs.blockchain = {
        contracts: JSON.parse(contracts),
        networks: JSON.parse(networks)
      };
      
      console.log('✅ Loaded blockchain configurations');
    } catch (error) {
      console.warn('⚠️ Could not load blockchain configs:', error.message);
      this.configs.blockchain = this.getDefaultBlockchainConfig();
    }
  }
  
  /**
   * Load monitoring configuration
   */
  async loadMonitoringConfig() {
    try {
      const metricsPath = path.join(this.configBase, 'monitoring/metrics.json');
      const metricsData = await fs.readFile(metricsPath, 'utf8');
      
      this.configs.monitoring = {
        metrics: JSON.parse(metricsData),
        // Add runtime monitoring configuration
        runtime: {
          healthCheckInterval: 60000, // 1 minute
          metricsCollectionInterval: 30000, // 30 seconds
          alertThresholds: {
            cpu: 80,
            memory: 85,
            responseTime: 5000,
            errorRate: 5
          }
        }
      };
      
      console.log('✅ Loaded monitoring configuration');
    } catch (error) {
      console.warn('⚠️ Could not load monitoring config:', error.message);
      this.configs.monitoring = this.getDefaultMonitoringConfig();
    }
  }
  
  /**
   * Load scaling configuration
   */
  async loadScalingConfig() {
    try {
      const scalingPath = path.join(this.configBase, 'scaling/scaling.json');
      const scalingData = await fs.readFile(scalingPath, 'utf8');
      
      this.configs.scaling = JSON.parse(scalingData);
      
      // Add auto-scaling rules
      this.configs.scaling.autoScaling = {
        enabled: true,
        minReplicas: 1,
        maxReplicas: 10,
        targetCPU: 70,
        targetMemory: 75,
        scaleUpThreshold: 3, // consecutive checks
        scaleDownThreshold: 5
      };
      
      console.log('✅ Loaded scaling configuration');
    } catch (error) {
      console.warn('⚠️ Could not load scaling config:', error.message);
      this.configs.scaling = this.getDefaultScalingConfig();
    }
  }
  
  /**
   * Load security configuration
   */
  async loadSecurityConfig() {
    try {
      const policiesPath = path.join(this.configBase, 'security/policies.json');
      const policiesData = await fs.readFile(policiesPath, 'utf8');
      
      this.configs.security = {
        policies: JSON.parse(policiesData),
        // Add runtime security configuration
        runtime: {
          enableWAF: true,
          enableDDoSProtection: true,
          rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100,
            message: 'Too many requests'
          },
          cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
          }
        }
      };
      
      console.log('✅ Loaded security configuration');
    } catch (error) {
      console.warn('⚠️ Could not load security config:', error.message);
      this.configs.security = this.getDefaultSecurityConfig();
    }
  }
  
  /**
   * Load database configuration
   */
  async loadDatabaseConfig() {
    try {
      const schemaPath = path.join(this.configBase, 'database/schema.sql');
      const migrationsPath = path.join(this.configBase, 'database/migrations.sql');
      
      const schema = await fs.readFile(schemaPath, 'utf8');
      const migrations = await fs.readFile(migrationsPath, 'utf8');
      
      this.configs.database = {
        schema,
        migrations,
        connection: {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME || 'dom_space_harvester',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          ssl: process.env.DB_SSL === 'true'
        }
      };
      
      console.log('✅ Loaded database configuration');
    } catch (error) {
      console.warn('⚠️ Could not load database config:', error.message);
      this.configs.database = this.getDefaultDatabaseConfig();
    }
  }
  
  /**
   * Load environment-specific configurations
   */
  async loadEnvironmentConfigs() {
    const environments = ['development', 'staging', 'production'];
    this.configs.environments = {};
    
    for (const env of environments) {
      try {
        const envPath = path.join(this.configBase, `${env}.env`);
        const envData = await fs.readFile(envPath, 'utf8');
        
        // Parse .env file
        const envVars = {};
        envData.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        });
        
        this.configs.environments[env] = envVars;
        console.log(`✅ Loaded ${env} environment configuration`);
      } catch (error) {
        console.warn(`⚠️ Could not load ${env} config:`, error.message);
      }
    }
  }
  
  /**
   * Get configuration by key
   */
  getConfig(key) {
    return this.configs[key];
  }
  
  /**
   * Get all configurations
   */
  getAllConfigs() {
    return { ...this.configs };
  }
  
  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig(environment = 'development') {
    return this.configs.environments?.[environment] || {};
  }
  
  /**
   * Apply configuration to process environment
   */
  applyEnvironment(environment = 'development') {
    const envConfig = this.getEnvironmentConfig(environment);
    
    Object.entries(envConfig).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
    
    console.log(`✅ Applied ${environment} environment configuration`);
  }
  
  // Utility methods
  substituteEnvVars(obj) {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVar = value.slice(2, -1);
        result[key] = process.env[envVar] || value;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.substituteEnvVars(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  // Default configurations
  getDefaultBrowserbaseConfig() {
    return {
      browserbase: {
        enabled: false,
        apiKey: '',
        projectId: '',
        defaultViewport: { width: 1920, height: 1080 }
      }
    };
  }
  
  getDefaultBlockchainConfig() {
    return {
      contracts: {},
      networks: {
        localhost: {
          url: 'http://localhost:8545',
          chainId: 1337
        }
      }
    };
  }
  
  getDefaultMonitoringConfig() {
    return {
      metrics: { enabled: true },
      runtime: {
        healthCheckInterval: 60000,
        metricsCollectionInterval: 30000
      }
    };
  }
  
  getDefaultScalingConfig() {
    return {
      enabled: false,
      autoScaling: {
        enabled: false,
        minReplicas: 1,
        maxReplicas: 3
      }
    };
  }
  
  getDefaultSecurityConfig() {
    return {
      policies: {},
      runtime: {
        enableWAF: false,
        enableDDoSProtection: false,
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          max: 100
        }
      }
    };
  }
  
  getDefaultDatabaseConfig() {
    return {
      schema: '',
      migrations: '',
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'lightdom',
        user: 'postgres',
        password: 'postgres'
      }
    };
  }
}

// Export singleton instance
export const configurationIntegration = new ConfigurationIntegration();


