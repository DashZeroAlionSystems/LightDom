/**
 * HTTP Client - Unified API Communication
 * Centralized HTTP client with interceptors, error handling, and auth token management
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { Logger } from '@/utils/Logger';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class HttpClient {
  private client: AxiosInstance;
  private logger: Logger;
  private retries: number;
  
  constructor(config: HttpClientConfig = {}) {
    this.logger = new Logger('HttpClient');
    this.retries = config.retries || 3;
    
    this.client = axios.create({
      baseURL: config.baseURL || process.env.VITE_API_URL || 'http://localhost:3001',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        this.logger.debug(`${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Try to refresh token
          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleUnauthorized();
          }
        }
        
        this.logger.error('Response error:', error);
        return Promise.reject(error);
      }
    );
  }
  
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
  
  private setAuthToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }
  
  private clearAuthToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }
  
  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    
    try {
      const response = await axios.post('/api/auth/refresh', { refreshToken });
      const newToken = response.data.token;
      this.setAuthToken(newToken);
      return newToken;
    } catch (error) {
      this.clearAuthToken();
      return null;
    }
  }
  
  private handleUnauthorized() {
    this.clearAuthToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return this.handleResponse(response.data);
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response.data);
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response.data);
  }
  
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response.data);
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return this.handleResponse(response.data);
  }
  
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success && response.data !== undefined) {
      return response.data;
    }
    
    if (response.error) {
      throw new Error(response.error.message || 'Request failed');
    }
    
    throw new Error('Invalid response format');
  }
  
  // File upload helper
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    
    return this.handleResponse(response.data);
  }
}

// Default export - singleton instance
export const httpClient = new HttpClient();

// Export class for custom instances
export default HttpClient;
