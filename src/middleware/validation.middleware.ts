/**
 * Validation Middleware
 * Express middleware for automatic schema validation
 */

import { Request, Response, NextFunction } from 'express';
import { SchemaValidationService } from '../services/schema-validation.service';
import { Pool } from 'pg';

let validationService: SchemaValidationService | null = null;

/**
 * Initialize validation middleware
 */
export function initializeValidation(db: Pool): void {
  validationService = new SchemaValidationService(db);
  validationService.initialize().catch(err => {
    console.error('Failed to initialize validation service:', err);
  });
}

/**
 * Create validation middleware for specific entity type
 */
export function validateRequest(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validationService) {
      console.warn('Validation service not initialized, skipping validation');
      return next();
    }

    try {
      const data = req.body;
      
      // Validate the request body
      const result = validationService.validate(entityType, data);
      
      if (!result.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: result.errorMessage,
          details: result.errors,
          entity_type: entityType
        });
      }

      // Log successful validation
      await logValidation(entityType, data, 'success');
      
      next();
    } catch (error: any) {
      console.error(`Validation error for ${entityType}:`, error);
      
      // Log failed validation
      await logValidation(entityType, req.body, 'failed', error.message);
      
      return res.status(500).json({
        error: 'Validation error',
        message: error.message
      });
    }
  };
}

/**
 * Validation middleware for array of items
 */
export function validateArrayRequest(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validationService) {
      console.warn('Validation service not initialized, skipping validation');
      return next();
    }

    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const errors: any[] = [];

      for (let i = 0; i < items.length; i++) {
        const result = validationService.validate(entityType, items[i]);
        
        if (!result.valid) {
          errors.push({
            index: i,
            errors: result.errors,
            message: result.errorMessage
          });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `${errors.length} items failed validation`,
          details: errors,
          entity_type: entityType
        });
      }

      next();
    } catch (error: any) {
      console.error(`Array validation error for ${entityType}:`, error);
      return res.status(500).json({
        error: 'Validation error',
        message: error.message
      });
    }
  };
}

/**
 * Get validation service instance
 */
export function getValidationService(): SchemaValidationService | null {
  return validationService;
}

/**
 * Log validation attempt to database
 */
async function logValidation(
  entityType: string,
  data: any,
  status: 'success' | 'failed' | 'warning',
  errorMessage?: string
): Promise<void> {
  if (!validationService) return;

  try {
    const query = `
      INSERT INTO validation_history (entity_type, validation_status, input_data, errors)
      VALUES ($1, $2, $3, $4)
    `;
    
    const errors = errorMessage ? [{ message: errorMessage }] : [];
    
    // Note: This requires access to the database pool
    // In production, this should be done asynchronously to avoid blocking
    // For now, we'll skip the actual database write to avoid circular dependency
    
  } catch (error) {
    console.error('Failed to log validation:', error);
  }
}

/**
 * Validate and sanitize middleware
 * Removes additional properties not in schema
 */
export function validateAndSanitize(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validationService) {
      console.warn('Validation service not initialized, skipping validation');
      return next();
    }

    try {
      const data = req.body;
      
      // Validate the request body
      const result = validationService.validate(entityType, data);
      
      if (!result.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: result.errorMessage,
          details: result.errors,
          entity_type: entityType
        });
      }

      // Data has been sanitized by AJV (removeAdditional: true)
      // Continue with validated and sanitized data
      next();
    } catch (error: any) {
      console.error(`Validation error for ${entityType}:`, error);
      return res.status(500).json({
        error: 'Validation error',
        message: error.message
      });
    }
  };
}

/**
 * Optional validation middleware
 * Validates if data is present, but allows empty requests
 */
export function optionalValidation(entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    return validateRequest(entityType)(req, res, next);
  };
}
