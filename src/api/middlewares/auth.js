/**
 * Authentication Middleware
 * Handles JWT authentication and API key authentication
 */

import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getDatabase } from '../../config/database.js';

/**
 * Verify JWT token
 */
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const decoded = jwt.verify(token, config.security.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

/**
 * API Key authentication
 */
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      throw new ApiError(401, 'API key required');
    }
    
    // Verify API key from database
    const db = getDatabase();
    const result = await db.query(
      'SELECT * FROM api_keys WHERE key = $1 AND active = true',
      [apiKey]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(401, 'Invalid API key');
    }
    
    req.apiKey = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'API key authentication failed'));
    }
  }
};

/**
 * Admin authentication
 */
export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    if (!decoded.isAdmin) {
      throw new ApiError(403, 'Admin access required');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid or expired token'));
    }
  }
};

/**
 * Optional authentication
 * Allows both authenticated and unauthenticated requests
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.security.jwtSecret);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

export default {
  auth,
  apiKeyAuth,
  adminAuth,
  optionalAuth,
};
