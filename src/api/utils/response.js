/**
 * API Response Utilities
 * Standardized response formats
 */

/**
 * Success response
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message,
    data,
  }));
};

/**
 * Paginated response
 */
export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  }));
};

/**
 * Created response
 */
export const createdResponse = (res, data, message = 'Resource created') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response
 */
export const noContentResponse = (res) => {
  res.writeHead(204);
  res.end();
};

/**
 * Catch async errors
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default {
  successResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  catchAsync,
};
