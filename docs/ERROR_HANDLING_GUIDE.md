# Error Handling & Retry Mechanism Guide

## Overview

This guide provides a comprehensive error handling system for the LightDom platform, including automatic retry mechanisms, error delegation, and intelligent error diagnosis.

## Table of Contents

1. [Error Handling Architecture](#error-handling-architecture)
2. [Global Error Interceptor](#global-error-interceptor)
3. [Retry Mechanism](#retry-mechanism)
4. [Error Classification](#error-classification)
5. [Error Delegation System](#error-delegation-system)
6. [Automatic Error Diagnosis](#automatic-error-diagnosis)
7. [Logging & Monitoring](#logging--monitoring)
8. [Configuration](#configuration)

---

## Error Handling Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Application Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   API    │  │ Services │  │ Database │  │ External │    │
│  │  Routes  │  │          │  │  Calls   │  │   APIs   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────────────────────────────────────────────┘
                            ↓ (errors)
┌───────────────────────────────────────────────────────────────┐
│                  Error Interceptor Layer                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  • Capture all errors                                │    │
│  │  • Classify error type                               │    │
│  │  • Determine if retryable                            │    │
│  │  • Add context & metadata                            │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    │                │
              Retryable?         Not Retryable
                    │                │
                    ↓                ↓
      ┌─────────────────────┐  ┌──────────────┐
      │  Retry Mechanism    │  │  Error Log   │
      │  • Exponential      │  │  • Store     │
      │    backoff          │  │  • Notify    │
      │  • Max retries      │  │  • Delegate  │
      │  • Circuit breaker  │  └──────────────┘
      └─────────────────────┘
                ↓
         Success / Failed
                ↓
      ┌─────────────────────┐
      │  Error Analytics    │
      │  • Pattern detect   │
      │  • Root cause       │
      │  • Suggestions      │
      └─────────────────────┘
```

---

## Global Error Interceptor

### Express Middleware

```javascript
// middleware/error-handler.js
import { ErrorLogger } from '../services/error-logger.js';
import { ErrorClassifier } from '../services/error-classifier.js';

export class GlobalErrorHandler {
  constructor(dbPool) {
    this.db = dbPool;
    this.logger = new ErrorLogger(dbPool);
    this.classifier = new ErrorClassifier();
  }

  /**
   * Express error handling middleware
   */
  middleware() {
    return async (err, req, res, next) => {
      try {
        // Classify error
        const classification = this.classifier.classify(err);

        // Add request context
        const context = {
          url: req.url,
          method: req.method,
          params: req.params,
          query: req.query,
          body: req.body,
          user: req.user?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        };

        // Log error
        const errorLog = await this.logger.log({
          error: err,
          classification,
          context,
          timestamp: new Date()
        });

        // Determine response
        const statusCode = this.getStatusCode(classification);
        const response = this.getErrorResponse(err, classification);

        // Send response
        res.status(statusCode).json(response);

        // Trigger error delegation if needed
        if (classification.severity === 'critical') {
          await this.delegateError(errorLog);
        }
      } catch (handlingError) {
        // Fallback error response
        console.error('Error in error handler:', handlingError);
        res.status(500).json({
          error: 'An unexpected error occurred',
          errorId: 'HANDLER_ERROR'
        });
      }
    };
  }

  getStatusCode(classification) {
    const statusMap = {
      validation: 400,
      authentication: 401,
      authorization: 403,
      not_found: 404,
      conflict: 409,
      rate_limit: 429,
      server: 500,
      database: 503,
      external: 502
    };

    return statusMap[classification.category] || 500;
  }

  getErrorResponse(err, classification) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const response = {
      error: classification.userMessage || 'An error occurred',
      errorId: classification.id,
      category: classification.category,
      retryable: classification.retryable
    };

    if (isDevelopment) {
      response.details = {
        message: err.message,
        stack: err.stack,
        classification
      };
    }

    if (classification.suggestedActions) {
      response.suggestedActions = classification.suggestedActions;
    }

    return response;
  }

  async delegateError(errorLog) {
    // Implementation in Error Delegation System section
  }
}
```

### Database Schema

```sql
-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_id VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB DEFAULT '{}',
    classification JSONB DEFAULT '{}',
    retryable BOOLEAN DEFAULT false,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    delegated_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Error patterns table (for pattern detection)
CREATE TABLE IF NOT EXISTS error_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_hash VARCHAR(64) UNIQUE NOT NULL,
    error_category VARCHAR(50),
    message_pattern TEXT,
    occurrence_count INTEGER DEFAULT 1,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    suggested_fix TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Error resolutions table
CREATE TABLE IF NOT EXISTS error_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_log_id UUID REFERENCES error_logs(id) ON DELETE CASCADE,
    resolution_type VARCHAR(50), -- 'auto_retry', 'manual_fix', 'workaround'
    resolution_details TEXT,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_error_logs_category ON error_logs(category);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_patterns_category ON error_patterns(error_category);
CREATE INDEX idx_error_patterns_occurrence ON error_patterns(occurrence_count DESC);
```

---

## Retry Mechanism

### Retry Service with Exponential Backoff

```javascript
// services/retry-service.js
export class RetryService {
  constructor(config = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      initialDelay: config.initialDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      backoffMultiplier: config.backoffMultiplier || 2,
      jitter: config.jitter !== false,
      retryableErrors: config.retryableErrors || [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ENETUNREACH',
        'EAI_AGAIN'
      ]
    };
  }

  /**
   * Execute function with retry logic
   */
  async execute(fn, context = {}) {
    let lastError;
    let attempt = 0;

    while (attempt < this.config.maxRetries) {
      try {
        const result = await fn();
        
        // Success - reset circuit breaker if applicable
        if (context.circuitBreaker) {
          context.circuitBreaker.recordSuccess();
        }

        return result;
      } catch (error) {
        lastError = error;
        attempt++;

        // Check if error is retryable
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Check if max retries exceeded
        if (attempt >= this.config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);

        console.log(
          `Retry attempt ${attempt}/${this.config.maxRetries} after ${delay}ms delay. Error: ${error.message}`
        );

        // Wait before retry
        await this.sleep(delay);

        // Record retry attempt
        if (context.errorLogId) {
          await this.recordRetry(context.errorLogId, attempt);
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed after ${this.config.maxRetries} retries: ${lastError.message}`
    );
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error) {
    // Check error code
    if (this.config.retryableErrors.includes(error.code)) {
      return true;
    }

    // Check HTTP status codes
    if (error.status) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      return retryableStatuses.includes(error.status);
    }

    // Check error type
    if (error.retryable === true) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateDelay(attempt) {
    let delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);

    // Apply max delay cap
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Record retry attempt in database
   */
  async recordRetry(errorLogId, attempt) {
    if (!this.db) return;

    await this.db.query(
      'UPDATE error_logs SET retry_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [attempt, errorLogId]
    );
  }
}
```

### Circuit Breaker Pattern

```javascript
// services/circuit-breaker.js
export class CircuitBreaker {
  constructor(config = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,
      monitoringPeriod: config.monitoringPeriod || 10000
    };

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = [];
    this.lastFailureTime = null;
  }

  /**
   * Execute function with circuit breaker
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordSuccess() {
    if (this.state === 'HALF_OPEN') {
      // Reset circuit breaker
      this.state = 'CLOSED';
      this.failures = [];
    }
  }

  recordFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;

    // Remove old failures outside monitoring period
    this.failures = this.failures.filter(
      time => now - time < this.config.monitoringPeriod
    );

    // Check if threshold exceeded
    if (this.failures.length >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.warn('Circuit breaker opened due to too many failures');
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = [];
    this.lastFailureTime = null;
  }
}
```

---

## Error Classification

```javascript
// services/error-classifier.js
import crypto from 'crypto';

export class ErrorClassifier {
  classify(error) {
    const category = this.categorize(error);
    const severity = this.getSeverity(category, error);
    const retryable = this.isRetryable(category, error);
    const userMessage = this.getUserMessage(category);
    const suggestedActions = this.getSuggestedActions(category, error);

    const errorId = this.generateErrorId(error);

    return {
      id: errorId,
      category,
      severity,
      retryable,
      userMessage,
      suggestedActions,
      originalMessage: error.message,
      code: error.code,
      stack: error.stack
    };
  }

  categorize(error) {
    // Database errors
    if (error.code?.startsWith('23') || error.name === 'SequelizeError') {
      return 'database';
    }

    // Network errors
    if (['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
      return 'network';
    }

    // Authentication errors
    if (error.status === 401 || error.name === 'UnauthorizedError') {
      return 'authentication';
    }

    // Authorization errors
    if (error.status === 403) {
      return 'authorization';
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.status === 400) {
      return 'validation';
    }

    // Not found errors
    if (error.status === 404) {
      return 'not_found';
    }

    // Rate limiting
    if (error.status === 429) {
      return 'rate_limit';
    }

    // External API errors
    if (error.isAxiosError || error.name === 'FetchError') {
      return 'external';
    }

    // Default to server error
    return 'server';
  }

  getSeverity(category, error) {
    const severityMap = {
      validation: 'low',
      not_found: 'low',
      authentication: 'medium',
      authorization: 'medium',
      rate_limit: 'medium',
      network: 'high',
      external: 'high',
      database: 'critical',
      server: 'critical'
    };

    return severityMap[category] || 'medium';
  }

  isRetryable(category, error) {
    const retryableCategories = ['network', 'external', 'rate_limit'];
    
    if (retryableCategories.includes(category)) {
      return true;
    }

    // Check specific status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    if (error.status && retryableStatuses.includes(error.status)) {
      return true;
    }

    return false;
  }

  getUserMessage(category) {
    const messages = {
      validation: 'The provided data is invalid. Please check your input.',
      authentication: 'Authentication failed. Please log in again.',
      authorization: 'You do not have permission to perform this action.',
      not_found: 'The requested resource was not found.',
      rate_limit: 'Too many requests. Please try again later.',
      network: 'A network error occurred. Please check your connection.',
      external: 'An external service is unavailable. Please try again later.',
      database: 'A database error occurred. Please try again.',
      server: 'An internal server error occurred. Please try again.'
    };

    return messages[category] || 'An error occurred. Please try again.';
  }

  getSuggestedActions(category, error) {
    const actions = {
      validation: [
        'Check input format',
        'Verify required fields',
        'Review validation rules'
      ],
      authentication: [
        'Log in again',
        'Check credentials',
        'Reset password if needed'
      ],
      authorization: [
        'Contact administrator',
        'Verify permissions',
        'Check user role'
      ],
      not_found: [
        'Verify resource ID',
        'Check URL',
        'Ensure resource exists'
      ],
      rate_limit: [
        'Wait before retrying',
        'Reduce request frequency',
        'Contact support for rate limit increase'
      ],
      network: [
        'Check internet connection',
        'Retry request',
        'Contact support if persists'
      ],
      external: [
        'Retry request',
        'Check external service status',
        'Wait for service recovery'
      ],
      database: [
        'Retry operation',
        'Contact administrator',
        'Check database status'
      ],
      server: [
        'Retry request',
        'Report error with ID',
        'Contact support'
      ]
    };

    return actions[category] || ['Retry request', 'Contact support'];
  }

  generateErrorId(error) {
    const hash = crypto.createHash('md5');
    hash.update(error.message + (error.code || '') + (error.stack || ''));
    return hash.digest('hex').substring(0, 8).toUpperCase();
  }
}
```

---

## Error Delegation System

```javascript
// services/error-delegation.js
export class ErrorDelegationService {
  constructor(dbPool, notificationService) {
    this.db = dbPool;
    this.notifications = notificationService;
  }

  /**
   * Delegate error to appropriate handler
   */
  async delegateError(errorLog) {
    const { classification, severity, category } = errorLog;

    // Determine delegation target
    const delegationTarget = this.getDelegationTarget(severity, category);

    // Create delegation record
    await this.db.query(
      'UPDATE error_logs SET delegated_to = $1 WHERE id = $2',
      [delegationTarget, errorLog.id]
    );

    // Notify appropriate team/system
    await this.notifyDelegationTarget(delegationTarget, errorLog);

    // Auto-remediation for known patterns
    await this.attemptAutoRemediation(errorLog);
  }

  getDelegationTarget(severity, category) {
    if (severity === 'critical') {
      return category === 'database' ? 'database_team' : 'devops_team';
    }

    if (severity === 'high') {
      return 'engineering_team';
    }

    if (category === 'validation') {
      return 'product_team';
    }

    return 'support_team';
  }

  async notifyDelegationTarget(target, errorLog) {
    const message = `
      Error delegated to ${target}
      
      Error ID: ${errorLog.id}
      Category: ${errorLog.category}
      Severity: ${errorLog.severity}
      Message: ${errorLog.message}
      
      Context: ${JSON.stringify(errorLog.context, null, 2)}
    `;

    // Send notification based on target
    const notificationChannels = {
      database_team: ['slack_database', 'email_database_oncall'],
      devops_team: ['slack_devops', 'pagerduty'],
      engineering_team: ['slack_engineering', 'email_engineering'],
      product_team: ['slack_product'],
      support_team: ['support_ticket_system']
    };

    const channels = notificationChannels[target] || [];

    for (const channel of channels) {
      await this.notifications.send(channel, message, {
        priority: errorLog.severity,
        errorId: errorLog.id
      });
    }
  }

  async attemptAutoRemediation(errorLog) {
    // Check for known error patterns
    const pattern = await this.findErrorPattern(errorLog);

    if (pattern && pattern.suggested_fix) {
      console.log(`Attempting auto-remediation for error ${errorLog.id}`);
      
      try {
        // Execute remediation based on pattern
        await this.executeRemediation(pattern.suggested_fix, errorLog);
        
        // Mark as resolved
        await this.db.query(
          `UPDATE error_logs 
           SET resolved = true, resolved_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [errorLog.id]
        );

        // Record resolution
        await this.db.query(
          `INSERT INTO error_resolutions 
           (error_log_id, resolution_type, resolution_details, resolved_by)
           VALUES ($1, $2, $3, $4)`,
          [errorLog.id, 'auto_retry', pattern.suggested_fix, 'system']
        );
      } catch (remediationError) {
        console.error('Auto-remediation failed:', remediationError);
      }
    }
  }

  async findErrorPattern(errorLog) {
    const patternHash = this.generatePatternHash(errorLog);

    const result = await this.db.query(
      'SELECT * FROM error_patterns WHERE pattern_hash = $1',
      [patternHash]
    );

    if (result.rows.length > 0) {
      // Update pattern occurrence
      await this.db.query(
        `UPDATE error_patterns 
         SET occurrence_count = occurrence_count + 1, last_seen = CURRENT_TIMESTAMP
         WHERE pattern_hash = $1`,
        [patternHash]
      );

      return result.rows[0];
    } else {
      // Create new pattern
      await this.db.query(
        `INSERT INTO error_patterns 
         (pattern_hash, error_category, message_pattern, metadata)
         VALUES ($1, $2, $3, $4)`,
        [
          patternHash,
          errorLog.category,
          errorLog.message,
          JSON.stringify({ firstErrorId: errorLog.id })
        ]
      );

      return null;
    }
  }

  generatePatternHash(errorLog) {
    // Create hash from error category and message pattern
    const hash = crypto.createHash('md5');
    const pattern = errorLog.message.replace(/\d+/g, 'N').replace(/[a-f0-9-]{36}/g, 'UUID');
    hash.update(errorLog.category + pattern);
    return hash.digest('hex');
  }

  async executeRemediation(fix, errorLog) {
    // Parse and execute remediation actions
    // This would be customized based on your application needs
    console.log('Executing remediation:', fix);
  }
}
```

---

## Automatic Error Diagnosis

```javascript
// services/error-diagnosis.js
export class ErrorDiagnosisService {
  constructor(dbPool) {
    this.db = dbPool;
  }

  /**
   * Analyze error and provide diagnosis
   */
  async diagnose(errorLog) {
    const diagnosis = {
      errorId: errorLog.id,
      category: errorLog.category,
      possibleCauses: [],
      recommendations: [],
      relatedErrors: [],
      pattern: null
    };

    // Find possible causes
    diagnosis.possibleCauses = this.identifyCauses(errorLog);

    // Generate recommendations
    diagnosis.recommendations = this.generateRecommendations(errorLog);

    // Find related errors
    diagnosis.relatedErrors = await this.findRelatedErrors(errorLog);

    // Check for patterns
    diagnosis.pattern = await this.detectPattern(errorLog);

    return diagnosis;
  }

  identifyCauses(errorLog) {
    const causes = [];

    // Database errors
    if (errorLog.category === 'database') {
      if (errorLog.message.includes('connection')) {
        causes.push('Database connection pool exhausted');
        causes.push('Database server unavailable');
      }
      if (errorLog.message.includes('timeout')) {
        causes.push('Slow database query');
        causes.push('Database server overloaded');
      }
      if (errorLog.message.includes('constraint')) {
        causes.push('Data integrity violation');
        causes.push('Invalid foreign key reference');
      }
    }

    // Network errors
    if (errorLog.category === 'network') {
      causes.push('Network connectivity issue');
      causes.push('DNS resolution failure');
      causes.push('Firewall blocking request');
    }

    // External API errors
    if (errorLog.category === 'external') {
      causes.push('External service down');
      causes.push('API rate limit exceeded');
      causes.push('Invalid API credentials');
    }

    return causes;
  }

  generateRecommendations(errorLog) {
    const recommendations = [];

    if (errorLog.category === 'database') {
      recommendations.push('Increase database connection pool size');
      recommendations.push('Optimize slow queries');
      recommendations.push('Add database indexes');
      recommendations.push('Scale database resources');
    }

    if (errorLog.category === 'network') {
      recommendations.push('Check network configuration');
      recommendations.push('Verify DNS settings');
      recommendations.push('Review firewall rules');
    }

    if (errorLog.category === 'external') {
      recommendations.push('Implement exponential backoff');
      recommendations.push('Add circuit breaker');
      recommendations.push('Cache external API responses');
      recommendations.push('Verify API credentials');
    }

    if (errorLog.retryable) {
      recommendations.push('Enable automatic retry mechanism');
    }

    return recommendations;
  }

  async findRelatedErrors(errorLog) {
    // Find errors with similar patterns in last 24 hours
    const result = await this.db.query(
      `SELECT id, category, message, created_at, context
       FROM error_logs
       WHERE category = $1
       AND created_at > NOW() - INTERVAL '24 hours'
       AND id != $2
       ORDER BY created_at DESC
       LIMIT 10`,
      [errorLog.category, errorLog.id]
    );

    return result.rows;
  }

  async detectPattern(errorLog) {
    const patternHash = this.generatePatternHash(errorLog);

    const result = await this.db.query(
      'SELECT * FROM error_patterns WHERE pattern_hash = $1',
      [patternHash]
    );

    if (result.rows.length > 0) {
      const pattern = result.rows[0];
      
      return {
        hash: pattern.pattern_hash,
        occurrences: pattern.occurrence_count,
        firstSeen: pattern.first_seen,
        lastSeen: pattern.last_seen,
        suggestedFix: pattern.suggested_fix
      };
    }

    return null;
  }

  generatePatternHash(errorLog) {
    const hash = crypto.createHash('md5');
    const pattern = errorLog.message.replace(/\d+/g, 'N').replace(/[a-f0-9-]{36}/g, 'UUID');
    hash.update(errorLog.category + pattern);
    return hash.digest('hex');
  }
}
```

---

## Logging & Monitoring

```javascript
// services/error-logger.js
export class ErrorLogger {
  constructor(dbPool) {
    this.db = dbPool;
  }

  async log(errorData) {
    const { error, classification, context, timestamp } = errorData;

    const result = await this.db.query(
      `INSERT INTO error_logs 
       (error_id, category, severity, message, stack_trace, context, classification, retryable)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        classification.id,
        classification.category,
        classification.severity,
        error.message,
        error.stack,
        JSON.stringify(context),
        JSON.stringify(classification),
        classification.retryable
      ]
    );

    return result.rows[0];
  }

  async getErrorStats(timeRange = '24 hours') {
    const result = await this.db.query(
      `SELECT 
         category,
         severity,
         COUNT(*) as count,
         COUNT(*) FILTER (WHERE resolved = true) as resolved_count,
         AVG(retry_count) as avg_retries
       FROM error_logs
       WHERE created_at > NOW() - INTERVAL '${timeRange}'
       GROUP BY category, severity
       ORDER BY count DESC`
    );

    return result.rows;
  }
}
```

---

## Configuration

```javascript
// config/error-handling.js
export const errorHandlingConfig = {
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryableErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN'
    ]
  },

  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 10000
  },

  logging: {
    logLevel: process.env.LOG_LEVEL || 'info',
    includeStack: process.env.NODE_ENV === 'development',
    sensitiveFields: ['password', 'token', 'apiKey', 'secret']
  },

  notification: {
    criticalErrors: {
      channels: ['slack', 'pagerduty', 'email'],
      recipients: ['oncall@example.com']
    },
    highErrors: {
      channels: ['slack', 'email'],
      recipients: ['engineering@example.com']
    }
  }
};
```

---

## Usage Examples

### Wrap API Calls with Retry

```javascript
import { RetryService } from './services/retry-service.js';

const retryService = new RetryService();

// Example: API call with retry
async function fetchUserData(userId) {
  return await retryService.execute(async () => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      const error = new Error('API request failed');
      error.status = response.status;
      throw error;
    }
    return response.json();
  });
}
```

### Use Circuit Breaker

```javascript
import { CircuitBreaker } from './services/circuit-breaker.js';

const breaker = new CircuitBreaker();

async function callExternalAPI() {
  return await breaker.execute(async () => {
    // External API call
    return await fetch('https://external-api.com/data');
  });
}
```

---

## Best Practices

1. **Always classify errors** before handling
2. **Use appropriate retry strategies** for different error types
3. **Implement circuit breakers** for external services
4. **Log errors with context** for debugging
5. **Monitor error patterns** for early detection
6. **Set up alerts** for critical errors
7. **Provide user-friendly error messages**
8. **Include suggested actions** in error responses
9. **Regular review** of error logs and patterns
10. **Continuously improve** error handling based on patterns

---

## Next Steps

- Setup [Monitoring Dashboard](./MONITORING_DASHBOARD.md)
- Implement [Alert System](./ALERT_SYSTEM.md)
- Configure [Log Aggregation](./LOG_AGGREGATION.md)
