/**
 * API-related types
 */

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  errors?: Record<string, string[]>;
}
