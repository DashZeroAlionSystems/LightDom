/**
 * Attribute Configuration Loader
 * 
 * Loads and validates SEO attribute configurations from config/seo-attributes.json
 * Provides dynamic access to attribute metadata for extraction, validation, and ML training
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface AttributeConfig {
  id: number;
  category: string;
  selector: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'url' | 'array';
  mlWeight: number;
  validation: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string | null;
    optimal?: number;
    errorMessage?: string;
  };
  scraping: {
    method: 'text' | 'attr' | 'computed' | 'count';
    attribute?: string;
    fallback?: any;
    transform?: string;
    computation?: string;
    multiple?: boolean;
    joinWith?: string;
  };
  training: {
    featureType: 'numerical' | 'categorical' | 'text' | 'embedding';
    encoding?: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    normalization?: string;
  };
  seeding?: {
    source: string;
    refreshFrequency: string;
    qualityThreshold: number;
  };
}

export interface OptimizationRecommendation {
  id: number;
  name: string;
  description: string;
  priority: string;
  confidence: number;
  requiredAttributes: string[];
  conditions: Array<{
    attribute: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    target: string;
    method: string;
    params: any;
  }>;
}

export interface SEOAttributesConfig {
  $schema: string;
  title: string;
  description: string;
  version: string;
  attributes: Record<string, AttributeConfig>;
  optimizationRecommendations?: Record<string, OptimizationRecommendation>;
  trainingConfiguration?: any;
  metadata?: any;
}

export class AttributeConfigLoader {
  private config: Map<string, AttributeConfig> = new Map();
  private optimizations: Map<string, OptimizationRecommendation> = new Map();
  private fullConfig: SEOAttributesConfig | null = null;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || join(__dirname, '../config/seo-attributes.json');
    this.loadConfig();
  }

  /**
   * Load configuration from JSON file
   */
  private loadConfig(): void {
    try {
      const data = readFileSync(this.configPath, 'utf-8');
      this.fullConfig = JSON.parse(data) as SEOAttributesConfig;
      
      // Load attributes
      if (this.fullConfig.attributes) {
        for (const [key, value] of Object.entries(this.fullConfig.attributes)) {
          this.config.set(key, value);
        }
      }
      
      // Load optimization recommendations
      if (this.fullConfig.optimizationRecommendations) {
        for (const [key, value] of Object.entries(this.fullConfig.optimizationRecommendations)) {
          this.optimizations.set(key, value);
        }
      }
      
      console.log(`✅ Loaded ${this.config.size} attribute configurations`);
      console.log(`✅ Loaded ${this.optimizations.size} optimization recommendations`);
    } catch (error) {
      console.error('❌ Failed to load attribute configuration:', error);
      throw new Error(`Failed to load config from ${this.configPath}: ${error}`);
    }
  }

  /**
   * Get configuration for a specific attribute
   */
  getConfig(attributeName: string): AttributeConfig | undefined {
    return this.config.get(attributeName);
  }

  /**
   * Get all attribute configurations
   */
  getAllConfigs(): Map<string, AttributeConfig> {
    return this.config;
  }

  /**
   * Get all attributes as object
   */
  getAllConfigsAsObject(): Record<string, AttributeConfig> {
    return Object.fromEntries(this.config.entries());
  }

  /**
   * Get attributes by category
   */
  getByCategory(category: string): AttributeConfig[] {
    return Array.from(this.config.values())
      .filter(c => c.category === category);
  }

  /**
   * Get attributes by ML weight threshold
   */
  getByMLWeight(minWeight: number): AttributeConfig[] {
    return Array.from(this.config.values())
      .filter(c => c.mlWeight >= minWeight)
      .sort((a, b) => b.mlWeight - a.mlWeight);
  }

  /**
   * Get attributes by importance
   */
  getByImportance(importance: 'critical' | 'high' | 'medium' | 'low'): AttributeConfig[] {
    return Array.from(this.config.values())
      .filter(c => c.training.importance === importance);
  }

  /**
   * Get critical attributes (ML weight > 0.10 or importance = critical)
   */
  getCriticalAttributes(): AttributeConfig[] {
    return Array.from(this.config.values())
      .filter(c => c.mlWeight > 0.10 || c.training.importance === 'critical');
  }

  /**
   * Get all attribute names
   */
  getAllAttributeNames(): string[] {
    return Array.from(this.config.keys());
  }

  /**
   * Get optimization recommendation by ID
   */
  getOptimization(optimizationId: string): OptimizationRecommendation | undefined {
    return this.optimizations.get(optimizationId);
  }

  /**
   * Get all optimization recommendations
   */
  getAllOptimizations(): OptimizationRecommendation[] {
    return Array.from(this.optimizations.values());
  }

  /**
   * Get optimizations by priority
   */
  getOptimizationsByPriority(priority: string): OptimizationRecommendation[] {
    return Array.from(this.optimizations.values())
      .filter(o => o.priority === priority);
  }

  /**
   * Get training configuration
   */
  getTrainingConfig(): any {
    return this.fullConfig?.trainingConfiguration || {};
  }

  /**
   * Get metadata
   */
  getMetadata(): any {
    return this.fullConfig?.metadata || {};
  }

  /**
   * Validate attribute value against configuration
   */
  validateAttribute(attributeName: string, value: any): {
    valid: boolean;
    errors: string[];
  } {
    const config = this.getConfig(attributeName);
    if (!config) {
      return {
        valid: false,
        errors: [`Attribute ${attributeName} not found in configuration`]
      };
    }

    const errors: string[] = [];
    const validation = config.validation;

    // Required check
    if (validation.required && (value === null || value === undefined || value === '')) {
      errors.push(validation.errorMessage || `${attributeName} is required`);
    }

    // Type-specific validations
    if (value !== null && value !== undefined && value !== '') {
      switch (config.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${attributeName} must be a string`);
          } else {
            if (validation.minLength && value.length < validation.minLength) {
              errors.push(`${attributeName} must be at least ${validation.minLength} characters`);
            }
            if (validation.maxLength && value.length > validation.maxLength) {
              errors.push(`${attributeName} must be at most ${validation.maxLength} characters`);
            }
            if (validation.pattern) {
              const regex = new RegExp(validation.pattern);
              if (!regex.test(value)) {
                errors.push(`${attributeName} does not match required pattern`);
              }
            }
          }
          break;

        case 'integer':
        case 'float':
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue)) {
            errors.push(`${attributeName} must be a number`);
          } else {
            if (validation.min !== undefined && numValue < validation.min) {
              errors.push(`${attributeName} must be at least ${validation.min}`);
            }
            if (validation.max !== undefined && numValue > validation.max) {
              errors.push(`${attributeName} must be at most ${validation.max}`);
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${attributeName} must be a boolean`);
          }
          break;

        case 'url':
          if (typeof value !== 'string') {
            errors.push(`${attributeName} must be a URL string`);
          } else {
            try {
              new URL(value);
            } catch (e) {
              errors.push(`${attributeName} must be a valid URL`);
            }
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Reload configuration from file
   */
  reload(): void {
    this.config.clear();
    this.optimizations.clear();
    this.loadConfig();
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    totalAttributes: number;
    attributesByCategory: Record<string, number>;
    attributesByImportance: Record<string, number>;
    criticalAttributes: number;
    totalOptimizations: number;
    version: string;
  } {
    const attributesByCategory: Record<string, number> = {};
    const attributesByImportance: Record<string, number> = {};

    for (const config of this.config.values()) {
      // Count by category
      attributesByCategory[config.category] = (attributesByCategory[config.category] || 0) + 1;
      
      // Count by importance
      const importance = config.training.importance;
      attributesByImportance[importance] = (attributesByImportance[importance] || 0) + 1;
    }

    return {
      totalAttributes: this.config.size,
      attributesByCategory,
      attributesByImportance,
      criticalAttributes: this.getCriticalAttributes().length,
      totalOptimizations: this.optimizations.size,
      version: this.fullConfig?.version || 'unknown'
    };
  }
}

// Singleton instance
let configLoaderInstance: AttributeConfigLoader | null = null;

/**
 * Get singleton instance of AttributeConfigLoader
 */
export function getAttributeConfigLoader(configPath?: string): AttributeConfigLoader {
  if (!configLoaderInstance) {
    configLoaderInstance = new AttributeConfigLoader(configPath);
  }
  return configLoaderInstance;
}

export default AttributeConfigLoader;
