/**
 * Custom API Error class
 * Used for consistent error handling across the application
 */

export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Helper function to create common HTTP errors
 */
export const httpErrors = {
  badRequest: (message = 'Bad Request') => new ApiError(400, message),
  unauthorized: (message = 'Unauthorized') => new ApiError(401, message),
  forbidden: (message = 'Forbidden') => new ApiError(403, message),
  notFound: (message = 'Not Found') => new ApiError(404, message),
  conflict: (message = 'Conflict') => new ApiError(409, message),
  unprocessable: (message = 'Unprocessable Entity') => new ApiError(422, message),
  tooManyRequests: (message = 'Too Many Requests') => new ApiError(429, message),
  internal: (message = 'Internal Server Error') => new ApiError(500, message),
};

export default ApiError;
