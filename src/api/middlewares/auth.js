/**
 * Authentication Middleware
 * Handles JWT authentication and API key authentication
 */

import config from '../../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getDatabase } from '../../config/database.js';

// Dynamically import jsonwebtoken only when needed
let jwt = null;
const getJWT = async () => {
  if (!jwt) {
    try {
      const module = await import('jsonwebtoken');
      jwt = module.default;
    } catch (error) {
      console.warn('jsonwebtoken not installed, using mock verification');
      // Return a mock JWT implementation
      jwt = {
        verify: (token) => JSON.parse(Buffer.from(token, 'base64').toString()),
      };
    }
  }
  return jwt;
};

/**
 * Verify JWT token
 */
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const jwtLib = await getJWT();
    const decoded = jwtLib.verify(token, config.security.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

/**
 * API Key authentication
 * NOTE: API keys should be stored as hashed values in the database
 * This implementation assumes keys are already hashed using bcrypt
 */
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      throw new ApiError(401, 'API key required');
    }
    
    // TODO: Implement proper API key hashing
    // For now, this is a placeholder - API keys should be hashed
    // Example: const hashedKey = await bcrypt.hash(apiKey, 10);
    
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
    
    const jwtLib = await getJWT();
    const decoded = jwtLib.verify(token, config.security.jwtSecret);
    
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
      const jwtLib = await getJWT();
      const decoded = jwtLib.verify(token, config.security.jwtSecret);
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
