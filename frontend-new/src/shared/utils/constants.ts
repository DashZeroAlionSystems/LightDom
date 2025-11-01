/**
 * Application constants
 */

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_BILLING: '/admin/billing',
  ADMIN_SYSTEM: '/admin/system',
  ADMIN_LOGS: '/admin/logs',

  // Feature routes
  BLOCKCHAIN: '/blockchain',
  WALLET: '/wallet',
  SEO: '/seo',
  CRAWLER: '/crawler',
  METAVERSE: '/metaverse',
  AI_CONTENT: '/ai-content',
  WEBSITES: '/websites',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'lightdom_auth_token',
  USER: 'lightdom_user',
  THEME: 'lightdom_theme',
  LANGUAGE: 'lightdom_language',
} as const;

/**
 * Query keys for React Query
 */
export const QUERY_KEYS = {
  AUTH: 'auth',
  USER: 'user',
  DASHBOARD: 'dashboard',
  BLOCKCHAIN: 'blockchain',
  WALLET: 'wallet',
  SEO: 'seo',
  CRAWLER: 'crawler',
  METAVERSE: 'metaverse',
  AI_CONTENT: 'ai-content',
  WEBSITES: 'websites',
} as const;

/**
 * Application limits
 */
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_UPLOAD_FILES: 10,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;
