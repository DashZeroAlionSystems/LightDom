/**
 * Common TypeScript types used across the application
 */

/**
 * User role types
 */
export type UserRole = 'user' | 'admin' | 'moderator';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Generic error type
 */
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
