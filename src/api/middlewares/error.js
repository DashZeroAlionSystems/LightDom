/**
 * Error Handling Middleware
 * Centralized error handling for the API
 */

import { ApiError } from '../utils/ApiError.js';

/**
 * Error converter middleware
 * Converts non-ApiError errors to ApiError
 */
export const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Error handler middleware
 * Sends error response to client
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // In production, hide internal server errors
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }
  
  res.locals.errorMessage = err.message;
  
  const response = {
    success: false,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
};

/**
 * Not Found handler
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, 'Route not found');
  next(error);
};

export default {
  errorConverter,
  errorHandler,
  notFound,
};
