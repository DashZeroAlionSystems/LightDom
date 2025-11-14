/**
 * Configuration Validation Service
 * 
 * Provides Zod-based validation for all configuration types
 * Ensures data integrity and type safety across the system
 */

import { z } from 'zod';

/**
 * Attribute Configuration Schema
 */
export const AttributeConfigSchema = z.object({
  id: z.number().int().positive(),
  category: z.string().min(1),
  selector: z.string().min(1),
  type: z.enum(['string', 'integer', 'float', 'boolean', 'url', 'array']),
  mlWeight: z.number().min(0).max(1),
  validation: z.object({
    required: z.boolean().optional(),
    minLength: z.number().int().positive().optional(),
    maxLength: z.number().int().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().nullable().optional(),
    optimal: z.number().optional(),
    errorMessage: z.string().optional()
  }),
  scraping: z.object({
    method: z.enum(['text', 'attr', 'computed', 'count']),
    attribute: z.string().optional(),
    fallback: z.any().optional(),
    transform: z.string().optional(),
    computation: z.string().optional(),
    multiple: z.boolean().optional(),
    joinWith: z.string().optional()
  }),
  training: z.object({
    featureType: z.enum(['numerical', 'categorical', 'text', 'embedding']),
    encoding: z.string().optional(),
    importance: z.enum(['critical', 'high', 'medium', 'low']),
    normalization: z.string().optional()
  }),
  seeding: z.object({
    source: z.string(),
    refreshFrequency: z.string(),
    qualityThreshold: z.number().min(0).max(1)
  }).optional()
});

/**
 * Model Configuration Schema
 */
export const ModelConfigSchema = z.object({
  inputDimensions: z.number().int().positive().optional().default(192),
  hiddenLayers: z.array(z.number().int().positive()).optional().default([256, 128, 64]),
  outputDimensions: z.number().int().positive().optional().default(50),
  learningRate: z.number().positive().optional().default(0.001),
  batchSize: z.number().int().positive().optional().default(32),
  epochs: z.number().int().positive().optional().default(100),
  validationSplit: z.number().min(0).max(1).optional().default(0.2),
  modelArchitecture: z.enum(['transformer', 'cnn', 'rnn', 'sequential']).optional().default('sequential'),
  dropout: z.number().min(0).max(1).optional().default(0.3),
  activation: z.string().optional().default('relu')
});

/**
 * Training Data Schema
 */
export const TrainingDataSchema = z.object({
  inputs: z.array(z.number()).length(192),
  outputs: z.array(z.number()).length(50),
  metadata: z.any().optional()
});

/**
 * Animation Pattern Schema
 */
export const AnimationPatternSchema = z.object({
  styleguide_name: z.string().min(1),
  styleguide_url: z.string().url(),
  component_type: z.string().min(1),
  animation_name: z.string().min(1),
  code_example: z.string().optional(),
  css_rules: z.any().optional(),
  js_config: z.any().optional(),
  easing_function: z.string().optional(),
  duration: z.number().int().positive().optional(),
  properties: z.any().optional(),
  ux_purpose: z.string().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Optimization Recommendation Schema
 */
export const OptimizationRecommendationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  confidence: z.number().min(0).max(1),
  requiredAttributes: z.array(z.string()),
  conditions: z.array(z.object({
    attribute: z.string(),
    operator: z.string(),
    value: z.any()
  })),
  actions: z.array(z.object({
    type: z.string(),
    target: z.string(),
    method: z.string(),
    params: z.any()
  }))
});

/**
 * SEO Attributes Configuration Schema
 */
export const SEOAttributesConfigSchema = z.object({
  $schema: z.string().url().optional(),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  attributes: z.record(AttributeConfigSchema),
  optimizationRecommendations: z.record(OptimizationRecommendationSchema).optional(),
  trainingConfiguration: z.any().optional(),
  metadata: z.any().optional()
});

/**
 * Configuration Validator Class
 */
export class ConfigurationValidator {
  /**
   * Validate attribute configuration
   */
  static validateAttributeConfig(data: unknown): z.infer<typeof AttributeConfigSchema> {
    return AttributeConfigSchema.parse(data);
  }

  /**
   * Validate model configuration
   */
  static validateModelConfig(data: unknown): z.infer<typeof ModelConfigSchema> {
    return ModelConfigSchema.parse(data);
  }

  /**
   * Validate training data
   */
  static validateTrainingData(data: unknown): z.infer<typeof TrainingDataSchema> {
    return TrainingDataSchema.parse(data);
  }

  /**
   * Validate animation pattern
   */
  static validateAnimationPattern(data: unknown): z.infer<typeof AnimationPatternSchema> {
    return AnimationPatternSchema.parse(data);
  }

  /**
   * Validate optimization recommendation
   */
  static validateOptimizationRecommendation(data: unknown): z.infer<typeof OptimizationRecommendationSchema> {
    return OptimizationRecommendationSchema.parse(data);
  }

  /**
   * Validate SEO attributes configuration
   */
  static validateSEOAttributesConfig(data: unknown): z.infer<typeof SEOAttributesConfigSchema> {
    return SEOAttributesConfigSchema.parse(data);
  }

  /**
   * Safe validate (returns success/error instead of throwing)
   */
  static safeValidate<T extends z.ZodType>(
    schema: T,
    data: unknown
  ): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  }

  /**
   * Validate and get error messages
   */
  static validateWithErrors<T extends z.ZodType>(
    schema: T,
    data: unknown
  ): { valid: boolean; data?: z.infer<T>; errors?: string[] } {
    const result = schema.safeParse(data);
    if (result.success) {
      return { valid: true, data: result.data };
    } else {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { valid: false, errors };
    }
  }
}

/**
 * Type exports for TypeScript usage
 */
export type AttributeConfig = z.infer<typeof AttributeConfigSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type TrainingData = z.infer<typeof TrainingDataSchema>;
export type AnimationPattern = z.infer<typeof AnimationPatternSchema>;
export type OptimizationRecommendation = z.infer<typeof OptimizationRecommendationSchema>;
export type SEOAttributesConfig = z.infer<typeof SEOAttributesConfigSchema>;

export default ConfigurationValidator;
