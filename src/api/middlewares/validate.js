/**
 * Validation Middleware
 * Validates request data against schemas
 */

import { ApiError } from '../utils/ApiError.js';

/**
 * Generic validation middleware
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };
    
    const { error, value } = schema.validate(req.body, validationOptions);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    
    // Replace request body with validated value
    req.body = value;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };
    
    const { error, value } = schema.validate(req.query, validationOptions);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    
    req.query = value;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate URL parameters
 */
export const validateParams = (schema) => (req, res, next) => {
  try {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
    };
    
    const { error, value } = schema.validate(req.params, validationOptions);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    
    req.params = value;
    next();
  } catch (err) {
    next(err);
  }
};

export default {
  validate,
  validateQuery,
  validateParams,
};
