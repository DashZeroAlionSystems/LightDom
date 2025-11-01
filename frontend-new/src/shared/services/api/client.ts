/**
 * API Client
 *
 * Centralized Axios instance with interceptors for:
 * - Authentication token injection
 * - Error handling
 * - Request/response logging
 * - Retry logic
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/shared/utils/constants';
import type { ApiError, ApiRequestConfig } from '@/shared/types/api';

/**
 * Create axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * - Add authentication token to requests
 * - Log requests in development
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Handle common errors
 * - Transform error responses
 * - Log responses in development
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.config.url, response.data);
    }

    return response;
  },
  async (error) => {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Unknown Error',
      message: error.response?.data?.message || error.message || 'An error occurred',
      errors: error.response?.data?.errors,
    };

    // Handle 401 Unauthorized - redirect to login
    if (apiError.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', apiError);
    }

    return Promise.reject(apiError);
  }
);

/**
 * Generic request method
 */
async function request<T>(config: ApiRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config as AxiosRequestConfig);
  return response.data;
}

/**
 * GET request
 */
export async function get<T>(
  url: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  return request<T>({ method: 'GET', url, params });
}

/**
 * POST request
 */
export async function post<T>(url: string, data?: unknown): Promise<T> {
  return request<T>({ method: 'POST', url, data });
}

/**
 * PUT request
 */
export async function put<T>(url: string, data?: unknown): Promise<T> {
  return request<T>({ method: 'PUT', url, data });
}

/**
 * PATCH request
 */
export async function patch<T>(url: string, data?: unknown): Promise<T> {
  return request<T>({ method: 'PATCH', url, data });
}

/**
 * DELETE request
 */
export async function del<T>(url: string): Promise<T> {
  return request<T>({ method: 'DELETE', url });
}

export { apiClient };
