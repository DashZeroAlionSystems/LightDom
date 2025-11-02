# Frontend API Integration Guide

This guide shows how to consume the LightDom API from React/TypeScript frontend components.

## TypeScript Type Generation

### Using openapi-typescript

Install the package:
```bash
npm install --save-dev openapi-typescript
```

Generate types from OpenAPI spec:
```bash
npx openapi-typescript http://localhost:3001/api-docs.json --output src/api/types/api.d.ts
```

Add to `package.json`:
```json
{
  "scripts": {
    "generate:api-types": "openapi-typescript http://localhost:3001/api-docs.json -o src/api/types/api.d.ts"
  }
}
```

---

## API Client Setup

### Base API Client

**File**: `frontend/src/api/client.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (handle errors)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new APIClient();
```

---

## Schema Definitions

### Example: Auth Schemas

**File**: `frontend/src/api/schemas/auth.schema.ts`

```typescript
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  walletAddress?: string;
  agreeToTerms: boolean;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  profile: {
    avatar: string | null;
    bio: string;
    location: string;
    website: string;
  };
  stats: {
    totalOptimizations: number;
    tokensEarned: number;
    spaceSaved: number;
    reputation: number;
    level: number;
  };
}

export interface APIError {
  success: false;
  code: number;
  message: string;
  stack?: string;
}
```

---

## API Service Layer

### Auth Service Example

**File**: `frontend/src/api/services/auth.service.ts`

```typescript
import { api } from '../client';
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '../schemas/auth.schema';

export class AuthService {
  /**
   * Register a new user
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return api.post<SignupResponse>('/api/auth/signup', data);
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/auth/login', data);
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{ success: boolean; data: { user: User } }>(
      '/api/auth/profile'
    );
    return response.data.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.put<{ success: boolean; data: { user: User } }>(
      '/api/auth/profile',
      updates
    );
    return response.data.user;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
```

---

## React Hooks

### useAuth Hook

**File**: `frontend/src/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';
import { authService } from '../api/services/auth.service';
import { User, LoginRequest, SignupRequest } from '../api/schemas/auth.schema';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user on mount if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (err: any) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.signup(data);
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data);
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
```

---

## Component Usage Examples

### Login Component

```typescript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Redirect or show success
    } catch (err) {
      // Error is already set in hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Data Fetching Component

```typescript
import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

interface DashboardStats {
  totalOptimizations: number;
  tokensEarned: number;
  spaceSaved: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.get<{ success: boolean; data: DashboardStats }>(
          '/api/stats/dashboard'
        );
        setStats(data.data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Total Optimizations: {stats.totalOptimizations}</div>
      <div>Tokens Earned: {stats.tokensEarned}</div>
      <div>Space Saved: {stats.spaceSaved}</div>
    </div>
  );
};
```

---

## React Query Integration

For better caching and state management:

```bash
npm install @tanstack/react-query
```

### Query Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Using Queries

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/services/auth.service';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => authService.updateProfile(updates),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
```

---

## Environment Configuration

**File**: `frontend/.env`

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

**File**: `frontend/.env.production`

```bash
VITE_API_URL=https://api.lightdom.io
VITE_WS_URL=wss://api.lightdom.io
```

---

## WebSocket Integration

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;

  connect() {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    this.socket = io(WS_URL);

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  unsubscribe(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  emit(event: string, data: any) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}

export const ws = new WebSocketClient();
```

---

## Error Handling

### Global Error Handler

```typescript
import { AxiosError } from 'axios';
import { APIError } from '../api/schemas/auth.schema';

export const handleAPIError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as APIError;
    return apiError?.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};
```

---

## Testing

### API Mock for Tests

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock-token',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      })
    );
  }),
];

export const server = setupServer(...handlers);
```

---

## Best Practices

1. **Type Safety**: Always use TypeScript types generated from OpenAPI
2. **Error Handling**: Handle errors consistently across the app
3. **Loading States**: Show loading indicators during API calls
4. **Caching**: Use React Query for intelligent caching
5. **Token Management**: Store tokens securely, refresh when needed
6. **WebSocket**: Use for real-time updates
7. **Testing**: Mock API calls in tests
8. **Environment**: Use environment variables for API URLs

---

## Quick Reference

```typescript
// Basic GET
const data = await api.get('/api/endpoint');

// POST with data
const result = await api.post('/api/endpoint', { field: 'value' });

// PUT update
const updated = await api.put('/api/endpoint/:id', updates);

// DELETE
await api.delete('/api/endpoint/:id');

// With React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: () => api.get('/api/endpoint'),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => api.post('/api/endpoint', data),
});
```
