/**
 * DeepSeek API Configuration
 * Central configuration for DeepSeek integration with LightDom
 */

export interface DeepSeekConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  streamEnabled: boolean;
  retryAttempts: number;
  retryDelayMs: number;
  timeout: number;
}

export interface DeepSeekMemoryConfig {
  contextWindowSize: number;
  memoryPersistence: 'database' | 'redis' | 'file';
  memoryRetentionDays: number;
  enableSemanticSearch: boolean;
  vectorDatabaseUrl?: string;
}

export interface DeepSeekReasoningPatterns {
  defaultPattern: 'chain-of-thought' | 'few-shot' | 'zero-shot' | 'tree-of-thought';
  enableSelfReflection: boolean;
  enableCriticalAnalysis: boolean;
  maxReasoningSteps: number;
}

export interface DeepSeekNamingConventions {
  schemaNamePattern: string;
  workflowNamePattern: string;
  componentNamePattern: string;
  variableNamingStyle: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';
  fileNamingStyle: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';
}

export interface DeepSeekBehaviorConfig {
  autoGenerateSchemas: boolean;
  validateBeforeExecution: boolean;
  enableSelfImprovement: boolean;
  safetyMode: 'strict' | 'moderate' | 'permissive';
  maxSelfModifications: number;
  requireHumanApproval: boolean;
}

export interface DeepSeekSystemConfig {
  api: DeepSeekConfig;
  memory: DeepSeekMemoryConfig;
  reasoning: DeepSeekReasoningPatterns;
  naming: DeepSeekNamingConventions;
  behavior: DeepSeekBehaviorConfig;
}

/**
 * Default DeepSeek System Configuration
 * These defaults govern DeepSeek behavior across the LightDom platform
 */
export const DEFAULT_DEEPSEEK_CONFIG: DeepSeekSystemConfig = {
  api: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
    defaultTemperature: 0.7,
    defaultMaxTokens: 4000,
    streamEnabled: false, // Non-streaming for workflow automation
    retryAttempts: 3,
    retryDelayMs: 1000,
    timeout: 60000, // 60 seconds
  },

  memory: {
    contextWindowSize: 8000,
    memoryPersistence: 'database',
    memoryRetentionDays: 30,
    enableSemanticSearch: true,
    vectorDatabaseUrl: process.env.VECTOR_DB_URL,
  },

  reasoning: {
    defaultPattern: 'chain-of-thought',
    enableSelfReflection: true,
    enableCriticalAnalysis: true,
    maxReasoningSteps: 10,
  },

  naming: {
    schemaNamePattern: '{domain}_{entity}_schema',
    workflowNamePattern: '{purpose}_{timestamp}_workflow',
    componentNamePattern: '{Component}{Type}',
    variableNamingStyle: 'camelCase',
    fileNamingStyle: 'kebab-case',
  },

  behavior: {
    autoGenerateSchemas: true,
    validateBeforeExecution: true,
    enableSelfImprovement: true,
    safetyMode: 'strict',
    maxSelfModifications: 5,
    requireHumanApproval: true,
  },
};

/**
 * Configuration loader with environment variable support
 */
export class DeepSeekConfigLoader {
  private config: DeepSeekSystemConfig;

  constructor(customConfig?: Partial<DeepSeekSystemConfig>) {
    this.config = this.mergeConfigs(DEFAULT_DEEPSEEK_CONFIG, customConfig);
  }

  private mergeConfigs(
    defaults: DeepSeekSystemConfig,
    custom?: Partial<DeepSeekSystemConfig>
  ): DeepSeekSystemConfig {
    return {
      api: { ...defaults.api, ...custom?.api },
      memory: { ...defaults.memory, ...custom?.memory },
      reasoning: { ...defaults.reasoning, ...custom?.reasoning },
      naming: { ...defaults.naming, ...custom?.naming },
      behavior: { ...defaults.behavior, ...custom?.behavior },
    };
  }

  getConfig(): DeepSeekSystemConfig {
    return this.config;
  }

  updateConfig(updates: Partial<DeepSeekSystemConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
  }

  /**
   * Load configuration from JSON file
   */
  static async loadFromFile(path: string): Promise<DeepSeekConfigLoader> {
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(path, 'utf-8');
      const customConfig = JSON.parse(fileContent);
      return new DeepSeekConfigLoader(customConfig);
    } catch (error) {
      console.warn(`Failed to load config from ${path}, using defaults`);
      return new DeepSeekConfigLoader();
    }
  }

  /**
   * Save current configuration to JSON file
   */
  async saveToFile(path: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(path, JSON.stringify(this.config, null, 2), 'utf-8');
  }
}

export default DEFAULT_DEEPSEEK_CONFIG;
