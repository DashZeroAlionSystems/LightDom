/**
 * Schema Protection Service
 * 
 * Protects proprietary rich snippet schemas and SEO templates
 * from being copied or reverse-engineered by competitors
 */

import { SEOEncryptionService, getEncryptionService } from './encryption';

interface ProtectedSchema {
  id: string;
  type: string;
  encryptedTemplate: any;
  publicMetadata: {
    schemaType: string;
    version: string;
    effectiveness: number; // 0-100 score shown to clients
    category: string;
  };
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SchemaTemplate {
  type: string;
  structure: any;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: any;
  optimizationHints: any;
  performanceMetrics?: {
    avgClickThroughRate?: number;
    avgRankingImprovement?: number;
    avgConversionIncrease?: number;
  };
}

/**
 * Rich Snippet Schema Protection
 * Secures proprietary schema templates
 */
export class SchemaProtectionService {
  private encryptionService: SEOEncryptionService;
  private schemaRegistry: Map<string, ProtectedSchema> = new Map();

  constructor() {
    this.encryptionService = getEncryptionService();
    this.initializeDefaultSchemas();
  }

  /**
   * Initialize default protected schemas
   */
  private initializeDefaultSchemas(): void {
    // Add enterprise-grade schema templates
    const defaultSchemas: SchemaTemplate[] = [
      {
        type: 'Product',
        structure: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          // Internal optimization structure - encrypted
          _optimization: {
            priceStrategy: 'dynamic',
            reviewAggregation: 'weighted',
            availabilityDisplay: 'realtime'
          }
        },
        requiredFields: ['name', 'offers', 'aggregateRating'],
        optionalFields: ['brand', 'description', 'image', 'sku'],
        validationRules: {
          offers: { minPrice: true, availability: true },
          rating: { minValue: 0, maxValue: 5 }
        },
        optimizationHints: {
          // Proprietary optimization logic
          dynamicPricing: true,
          competitorTracking: true
        },
        performanceMetrics: {
          avgClickThroughRate: 4.8,
          avgRankingImprovement: 23,
          avgConversionIncrease: 15
        }
      },
      {
        type: 'Article',
        structure: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          _optimization: {
            headlineOptimization: 'ml-powered',
            contentAnalysis: 'semantic',
            imageSelection: 'performance-weighted'
          }
        },
        requiredFields: ['headline', 'author', 'datePublished'],
        optionalFields: ['image', 'publisher', 'description'],
        validationRules: {
          headline: { minLength: 30, maxLength: 110 },
          datePublished: { format: 'ISO8601' }
        },
        optimizationHints: {
          headlineABTest: true,
          readingTimeCalc: true,
          featuredImageOptimization: true
        },
        performanceMetrics: {
          avgClickThroughRate: 3.2,
          avgRankingImprovement: 18,
          avgConversionIncrease: 8
        }
      },
      {
        type: 'LocalBusiness',
        structure: {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          _optimization: {
            geoTargeting: 'precision',
            reviewStrategy: 'aggregated',
            hoursDisplay: 'smart'
          }
        },
        requiredFields: ['name', 'address', 'telephone'],
        optionalFields: ['openingHours', 'priceRange', 'image'],
        validationRules: {
          address: { structured: true, verified: true },
          telephone: { format: 'E164' }
        },
        optimizationHints: {
          localSEO: true,
          mapOptimization: true,
          reviewManagement: true
        },
        performanceMetrics: {
          avgClickThroughRate: 6.5,
          avgRankingImprovement: 35,
          avgConversionIncrease: 28
        }
      }
    ];

    defaultSchemas.forEach(schema => this.registerSchema(schema));
  }

  /**
   * Register a new protected schema
   */
  registerSchema(template: SchemaTemplate): string {
    const id = `schema_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Encrypt the full template
    const encryptedTemplate = this.encryptionService.encryptSchemaTemplate(template);
    
    // Create fingerprint for tracking
    const fingerprint = this.encryptionService.createFingerprint(template);
    
    // Create protected schema with limited public metadata
    const protectedSchema: ProtectedSchema = {
      id,
      type: template.type,
      encryptedTemplate,
      publicMetadata: {
        schemaType: template.type,
        version: '1.0',
        effectiveness: this.calculateEffectiveness(template.performanceMetrics),
        category: this.categorizeSchema(template.type)
      },
      fingerprint,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.schemaRegistry.set(id, protectedSchema);
    
    return id;
  }

  /**
   * Calculate effectiveness score without revealing exact metrics
   */
  private calculateEffectiveness(metrics?: SchemaTemplate['performanceMetrics']): number {
    if (!metrics) return 70; // Default baseline
    
    const ctrScore = (metrics.avgClickThroughRate || 0) * 10;
    const rankingScore = (metrics.avgRankingImprovement || 0) / 2;
    const conversionScore = (metrics.avgConversionIncrease || 0) * 2;
    
    return Math.min(100, Math.round((ctrScore + rankingScore + conversionScore) / 3));
  }

  /**
   * Categorize schema type
   */
  private categorizeSchema(type: string): string {
    const categories: Record<string, string> = {
      'Product': 'E-commerce',
      'Article': 'Content',
      'LocalBusiness': 'Local SEO',
      'Event': 'Events',
      'Recipe': 'Food & Dining',
      'FAQPage': 'Support',
      'HowTo': 'Educational'
    };
    
    return categories[type] || 'General';
  }

  /**
   * Get schema for client use (decrypted but with usage tracking)
   */
  getSchemaForClient(
    schemaId: string,
    clientId: string,
    context?: any
  ): any {
    const protectedSchema = this.schemaRegistry.get(schemaId);
    
    if (!protectedSchema) {
      throw new Error('Schema not found');
    }
    
    // Decrypt the template
    const template = this.encryptionService.decrypt(
      protectedSchema.encryptedTemplate
    );
    
    // Log usage for tracking
    this.logSchemaUsage(schemaId, clientId, context);
    
    // Return sanitized version without internal optimization hints
    return this.sanitizeSchemaForClient(template);
  }

  /**
   * Remove proprietary optimization hints from schema
   */
  private sanitizeSchemaForClient(template: SchemaTemplate): any {
    const { structure, requiredFields, optionalFields, validationRules } = template;
    
    // Clone structure without internal optimization fields
    const sanitized = JSON.parse(JSON.stringify(structure));
    
    // Remove all fields starting with underscore (internal fields)
    const removeInternalFields = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (!key.startsWith('_')) {
          cleaned[key] = typeof value === 'object' 
            ? removeInternalFields(value) 
            : value;
        }
      }
      return cleaned;
    };
    
    return {
      structure: removeInternalFields(sanitized),
      requiredFields,
      optionalFields,
      validationRules: this.sanitizeValidationRules(validationRules)
    };
  }

  /**
   * Sanitize validation rules to remove proprietary logic
   */
  private sanitizeValidationRules(rules: any): any {
    if (!rules) return {};
    
    const sanitized: any = {};
    for (const [field, rule] of Object.entries(rules)) {
      if (typeof rule === 'object') {
        sanitized[field] = {};
        // Only keep basic validation, not advanced logic
        for (const [key, value] of Object.entries(rule as any)) {
          if (['minLength', 'maxLength', 'format', 'required'].includes(key)) {
            sanitized[field][key] = value;
          }
        }
      }
    }
    return sanitized;
  }

  /**
   * Log schema usage for tracking and preventing abuse
   */
  private logSchemaUsage(schemaId: string, clientId: string, context?: any): void {
    // In production, this would log to database
    console.log(`[Schema Usage] Client: ${clientId}, Schema: ${schemaId}, Time: ${new Date().toISOString()}`);
    
    // Could implement rate limiting here
    // Could detect unusual patterns suggesting data scraping
  }

  /**
   * Get public metadata for all schemas (for client browsing)
   */
  getPublicSchemaCatalog(): any[] {
    return Array.from(this.schemaRegistry.values()).map(schema => ({
      id: schema.id,
      type: schema.type,
      metadata: schema.publicMetadata,
      // Don't include encrypted template or fingerprint
    }));
  }

  /**
   * Generate obfuscated performance report
   * Shows improvement without revealing exact strategies
   */
  generatePerformanceReport(schemaId: string, actualMetrics: any): any {
    const protectedSchema = this.schemaRegistry.get(schemaId);
    
    if (!protectedSchema) {
      throw new Error('Schema not found');
    }
    
    // Create obfuscated report that shows results but not methods
    return {
      schemaType: protectedSchema.type,
      effectiveness: protectedSchema.publicMetadata.effectiveness,
      improvements: {
        // Show relative improvements, not absolute numbers
        ranking: this.obfuscateMetric(actualMetrics.rankingChange, 'increase'),
        traffic: this.obfuscateMetric(actualMetrics.trafficChange, 'increase'),
        engagement: this.obfuscateMetric(actualMetrics.engagementChange, 'rate')
      },
      recommendation: 'Schema optimized based on industry best practices',
      // Don't reveal the actual optimization strategies
    };
  }

  /**
   * Obfuscate metrics to show impact without revealing strategy
   */
  private obfuscateMetric(value: number, type: 'increase' | 'rate'): string {
    if (type === 'increase') {
      if (value > 20) return 'Significant improvement';
      if (value > 10) return 'Moderate improvement';
      if (value > 5) return 'Slight improvement';
      return 'Stable performance';
    } else {
      if (value > 4) return 'Excellent';
      if (value > 3) return 'Good';
      if (value > 2) return 'Average';
      return 'Below average';
    }
  }
}

/**
 * Singleton instance
 */
let schemaProtectionInstance: SchemaProtectionService | null = null;

export function getSchemaProtectionService(): SchemaProtectionService {
  if (!schemaProtectionInstance) {
    schemaProtectionInstance = new SchemaProtectionService();
  }
  return schemaProtectionInstance;
}

export default SchemaProtectionService;
