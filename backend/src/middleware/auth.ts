import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    address: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (!decoded || !decoded.id || !decoded.address) {
      throw new CustomError('Invalid token', 401);
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      address: decoded.address,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions', 403);
    }

    next();
  };
};

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.user.role !== 'host' && req.user.role !== 'admin') {
    throw new CustomError('Host role required', 403);
  }

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new CustomError('Admin role required', 403);
  }

  next();
};