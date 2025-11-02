# Modularization Plan

## Overview

This document outlines the plan to modularize duplicate code and create reusable modules throughout the LightDom codebase.

## Identified Duplicate Patterns

### 1. HTTP Client Configuration

**Duplicate Locations**:
- Multiple API route files create axios instances
- Services recreate HTTP client configuration
- Different timeout and retry settings

**Solution**: Create unified HTTP client

```typescript
// src/lib/http-client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from '@/utils/Logger';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private client: AxiosInstance;
  private logger: Logger;
  
  constructor(config: HttpClientConfig) {
    this.logger = new Logger('HttpClient');
    this.client = axios.create({
      baseURL: config.baseURL || process.env.API_URL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          window.location.href = '/login';
        }
        this.logger.error('Response error:', error);
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

// Default export
export const httpClient = new HttpClient({});
```

**Usage**:
```typescript
import { httpClient } from '@/lib/http-client';

const users = await httpClient.get<User[]>('/api/users');
```

### 2. Error Handling

**Duplicate Locations**:
- Try-catch blocks repeated in every service
- Inconsistent error messages
- No centralized error tracking

**Solution**: Create error handling module

```typescript
// src/lib/error-handler.ts
import { Logger } from '@/utils/Logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHZ_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { service, originalError: originalError?.message }
    );
  }
}

export class ErrorHandler {
  private static logger = new Logger('ErrorHandler');
  
  static handle(error: Error, context?: string): never {
    this.logger.error(`Error in ${context || 'unknown'}:`, error);
    
    // Log to external service (e.g., Sentry)
    if (process.env.SENTRY_DSN) {
      // Sentry.captureException(error);
    }
    
    throw error;
  }
  
  static async handleAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
    }
  }
  
  static wrap<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): T {
    return (async (...args: any[]) => {
      return this.handleAsync(() => fn(...args), context);
    }) as T;
  }
}

// Express error middleware
export function expressErrorHandler(err: Error, req: any, res: any, next: any) {
  ErrorHandler.logger.error('Express error:', err);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

**Usage**:
```typescript
import { ErrorHandler, NotFoundError, ValidationError } from '@/lib/error-handler';

// Wrap async function
export const getUser = ErrorHandler.wrap(async (id: string) => {
  const user = await db.findUser(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  return user;
}, 'UserService.getUser');

// Manual error handling
try {
  await operation();
} catch (error) {
  ErrorHandler.handle(error, 'MyService.operation');
}
```

### 3. Validation

**Duplicate Locations**:
- Email validation repeated
- Password strength checks duplicated
- URL validation in multiple places

**Solution**: Create validation module

```typescript
// src/lib/validators.ts
import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email();

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

export function validatePassword(password: string): {
  valid: boolean;
  errors?: string[];
} {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: result.error.errors.map(e => e.message),
  };
}

// URL validation
export const urlSchema = z.string().url();

export function validateUrl(url: string): boolean {
  return urlSchema.safeParse(url).success;
}

// UUID validation
export const uuidSchema = z.string().uuid();

export function validateUuid(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

// Generic schema validator
export function validate<T>(schema: z.Schema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validateSafe<T>(schema: z.Schema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

// Common schemas
export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  url: urlSchema,
  uuid: uuidSchema,
  
  user: z.object({
    email: emailSchema,
    name: z.string().min(2),
    password: passwordSchema,
  }),
  
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
};
```

**Usage**:
```typescript
import { validateEmail, validatePassword, validate, schemas } from '@/lib/validators';

// Simple validation
if (!validateEmail(email)) {
  throw new Error('Invalid email');
}

// Complex validation
const userData = validate(schemas.user, requestBody);

// Safe validation with error handling
const result = validateSafe(schemas.pagination, query);
if (!result.success) {
  return res.status(400).json({ errors: result.errors });
}
```

### 4. Date/Time Formatting

**Duplicate Locations**:
- Date formatting repeated
- Timezone conversions scattered
- Relative time calculations duplicated

**Solution**: Create formatters module

```typescript
// src/lib/formatters.ts
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export class DateFormatter {
  static format(date: Date | string, formatStr: string = 'PPP'): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr);
  }
  
  static formatDateTime(date: Date | string): string {
    return this.format(date, 'PPP p');
  }
  
  static formatDate(date: Date | string): string {
    return this.format(date, 'PPP');
  }
  
  static formatTime(date: Date | string): string {
    return this.format(date, 'p');
  }
  
  static formatRelative(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  }
  
  static formatISO(date: Date): string {
    return date.toISOString();
  }
}

export class NumberFormatter {
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
  
  static formatNumber(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }
  
  static formatPercent(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num / 100);
  }
  
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

export class StringFormatter {
  static truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
  
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  static camelToTitle(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }
}
```

**Usage**:
```typescript
import { DateFormatter, NumberFormatter, StringFormatter } from '@/lib/formatters';

// Date formatting
const formatted = DateFormatter.formatDateTime(createdAt);
const relative = DateFormatter.formatRelative(updatedAt);

// Number formatting
const price = NumberFormatter.formatCurrency(99.99);
const size = NumberFormatter.formatFileSize(1024000);

// String formatting
const slug = StringFormatter.slugify('Hello World!'); // 'hello-world'
```

### 5. Database Queries

**Duplicate Locations**:
- Similar queries repeated in repositories
- Connection handling duplicated
- Transaction patterns repeated

**Solution**: Create base repository

```typescript
// src/data/repositories/BaseRepository.ts
import { Pool, PoolClient } from 'pg';
import { Logger } from '@/utils/Logger';

export abstract class BaseRepository<T> {
  protected logger: Logger;
  
  constructor(
    protected pool: Pool,
    protected tableName: string
  ) {
    this.logger = new Logger(`${tableName}Repository`);
  }
  
  async findById(id: string): Promise<T | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
  
  async findAll(limit: number = 100, offset: number = 0): Promise<T[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
  
  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await this.pool.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    
    const result = await this.pool.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }
  
  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }
  
  async transaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

**Usage**:
```typescript
// src/data/repositories/UserRepository.ts
import { BaseRepository } from './BaseRepository';
import type { User } from '@/types/user';

export class UserRepository extends BaseRepository<User> {
  constructor(pool: Pool) {
    super(pool, 'users');
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
  
  // Add custom methods
}
```

## Implementation Plan

### Phase 1: Core Utilities (Week 1)
- [ ] Create `src/lib/` directory
- [ ] Implement HttpClient
- [ ] Implement ErrorHandler
- [ ] Implement Validators
- [ ] Implement Formatters
- [ ] Add tests for all utilities

### Phase 2: Data Layer (Week 2)
- [ ] Create `src/data/repositories/` directory
- [ ] Implement BaseRepository
- [ ] Migrate WorkflowRepository to use BaseRepository
- [ ] Create UserRepository
- [ ] Create other repositories

### Phase 3: Service Migration (Week 3)
- [ ] Update services to use HttpClient
- [ ] Update services to use ErrorHandler
- [ ] Update services to use Validators
- [ ] Remove duplicate code from services

### Phase 4: Testing & Documentation (Week 4)
- [ ] Write comprehensive tests
- [ ] Document all new modules
- [ ] Create migration guide
- [ ] Update existing code examples

## Success Metrics

- **Code Reduction**: Target 20% reduction in total lines of code
- **Test Coverage**: Achieve 90% coverage for utilities
- **Performance**: No degradation in response times
- **Developer Experience**: Faster feature development

## Related Documents

- [File Audit](./FILE_AUDIT.md) - Duplicate code identified
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Usage patterns
- [Architecture Documentation](./ARCHITECTURE_DOCUMENTATION.md) - System overview
