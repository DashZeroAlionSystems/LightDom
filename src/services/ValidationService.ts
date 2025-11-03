/**
 * ValidationService
 * 
 * Provides schema-driven validation using Zod
 * Converts ld-schema definitions to Zod validators dynamically
 * 
 * Features:
 * - Dynamic Zod schema generation from ld-schema JSON
 * - Validation at API boundaries
 * - Integration with WorkflowTemplatingService
 * - Support for nested schemas and references
 * 
 * @module ValidationService
 */

import { z, ZodSchema, ZodTypeAny } from 'zod';

export interface LdSchemaProperty {
  type: string; // 'string', 'number', 'boolean', 'object', 'array'
  description?: string;
  required?: boolean;
  default?: any;
  enum?: any[];
  items?: LdSchemaProperty; // For arrays
  properties?: Record<string, LdSchemaProperty>; // For objects
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

export interface LdSchema {
  $id: string;
  type: 'object';
  title?: string;
  description?: string;
  properties: Record<string, LdSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

export class ValidationService {
  private schemaCache: Map<string, ZodSchema> = new Map();

  /**
   * Generate a Zod validator from an ld-schema definition
   */
  generateValidatorFromLdSchema(ldSchema: LdSchema): ZodSchema {
    // Check cache first
    if (this.schemaCache.has(ldSchema.$id)) {
      return this.schemaCache.get(ldSchema.$id)!;
    }

    const zodSchema = this.buildZodSchema(ldSchema);
    this.schemaCache.set(ldSchema.$id, zodSchema);
    return zodSchema;
  }

  /**
   * Build a Zod schema from ld-schema definition
   */
  private buildZodSchema(ldSchema: LdSchema): ZodSchema {
    const shape: Record<string, ZodTypeAny> = {};

    // Build shape from properties
    for (const [key, prop] of Object.entries(ldSchema.properties)) {
      let zodField = this.buildZodField(prop);

      // Make optional if not in required array
      if (!ldSchema.required?.includes(key)) {
        zodField = zodField.optional();
      }

      // Add default if provided
      if (prop.default !== undefined) {
        zodField = zodField.default(prop.default);
      }

      shape[key] = zodField;
    }

    // Create object schema
    let zodSchema = z.object(shape);

    // Handle additional properties
    if (ldSchema.additionalProperties === false) {
      zodSchema = zodSchema.strict();
    }

    return zodSchema;
  }

  /**
   * Build a Zod field from an ld-schema property
   */
  private buildZodField(prop: LdSchemaProperty): ZodTypeAny {
    let zodField: ZodTypeAny;

    // Handle enum first (works for any type)
    if (prop.enum) {
      return z.enum(prop.enum as [string, ...string[]]);
    }

    switch (prop.type) {
      case 'string':
        zodField = z.string();
        if (prop.minLength !== undefined) {
          zodField = (zodField as z.ZodString).min(prop.minLength);
        }
        if (prop.maxLength !== undefined) {
          zodField = (zodField as z.ZodString).max(prop.maxLength);
        }
        if (prop.pattern) {
          zodField = (zodField as z.ZodString).regex(new RegExp(prop.pattern));
        }
        break;

      case 'number':
      case 'integer':
        zodField = z.number();
        if (prop.minimum !== undefined) {
          zodField = (zodField as z.ZodNumber).min(prop.minimum);
        }
        if (prop.maximum !== undefined) {
          zodField = (zodField as z.ZodNumber).max(prop.maximum);
        }
        if (prop.type === 'integer') {
          zodField = (zodField as z.ZodNumber).int();
        }
        break;

      case 'boolean':
        zodField = z.boolean();
        break;

      case 'array':
        const itemSchema = prop.items
          ? this.buildZodField(prop.items)
          : z.any();
        zodField = z.array(itemSchema);
        break;

      case 'object':
        if (prop.properties) {
          const nestedShape: Record<string, ZodTypeAny> = {};
          for (const [key, nestedProp] of Object.entries(prop.properties)) {
            nestedShape[key] = this.buildZodField(nestedProp);
          }
          zodField = z.object(nestedShape);
        } else {
          zodField = z.record(z.any());
        }
        break;

      case 'null':
        zodField = z.null();
        break;

      default:
        zodField = z.any();
    }

    return zodField;
  }

  /**
   * Validate data against a Zod schema
   */
  validate<T = any>(data: unknown, zodSchema: ZodSchema): ValidationResult<T> {
    try {
      const validatedData = zodSchema.parse(data);
      return {
        success: true,
        data: validatedData as T,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            path: err.path.map(String),
            message: err.message,
          })),
        };
      }

      return {
        success: false,
        errors: [
          {
            path: [],
            message: error instanceof Error ? error.message : 'Unknown validation error',
          },
        ],
      };
    }
  }

  /**
   * Validate data against an ld-schema definition
   */
  validateWithLdSchema<T = any>(
    data: unknown,
    ldSchema: LdSchema
  ): ValidationResult<T> {
    const zodSchema = this.generateValidatorFromLdSchema(ldSchema);
    return this.validate<T>(data, zodSchema);
  }

  /**
   * Create a middleware for Express/API validation
   */
  createValidationMiddleware(ldSchema: LdSchema) {
    const zodSchema = this.generateValidatorFromLdSchema(ldSchema);

    return (req: any, res: any, next: any) => {
      const result = this.validate(req.body, zodSchema);

      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.errors,
        });
      }

      // Attach validated data to request
      req.validatedData = result.data;
      next();
    };
  }

  /**
   * Clear schema cache
   */
  clearCache(): void {
    this.schemaCache.clear();
  }

  /**
   * Get cached schema
   */
  getCachedSchema(schemaId: string): ZodSchema | undefined {
    return this.schemaCache.get(schemaId);
  }

  /**
   * Remove schema from cache
   */
  removeCachedSchema(schemaId: string): boolean {
    return this.schemaCache.delete(schemaId);
  }
}

// Singleton instance
export const validationService = new ValidationService();

export default ValidationService;
