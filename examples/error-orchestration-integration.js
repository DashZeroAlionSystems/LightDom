/**
 * Error Orchestration Integration Example
 *
 * Demonstrates how to integrate the error orchestration system
 * into the LightDom API server.
 *
 * @module examples/error-orchestration-integration
 */

import express from 'express';
import { Pool } from 'pg';
import config from '../config/error-orchestration.config.json' assert { type: 'json' };
import ErrorReportingService from '../services/error-reporting/ErrorReportingService.js';

// Initialize database
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize error reporting service
const errorService = new ErrorReportingService({
  db,
  config,
  logger: console,
});

// Listen to events (optional)
errorService.on('error:reported', ({ id, hash }) => {
  console.log(`[ErrorOrchestration] Error reported: ${id} (hash: ${hash.substring(0, 8)})`);
});

errorService.on('error:needsAnalysis', ({ id, hash, occurrences }) => {
  console.log(`[ErrorOrchestration] Error needs analysis: ${id} (occurrences: ${occurrences})`);
});

// Example 1: Global error handlers
process.on('uncaughtException', async error => {
  console.error('[FATAL] Uncaught exception:', error);

  try {
    await errorService.reportError({
      errorType: error.name || 'UncaughtException',
      severity: 'critical',
      message: error.message,
      stackTrace: error.stack,
      component: 'process',
      service: 'api-server',
      context: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (reportError) {
    console.error('[ErrorOrchestration] Failed to report error:', reportError);
  }

  // Still exit on uncaught exceptions
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('[ERROR] Unhandled rejection:', reason);

  try {
    await errorService.reportError({
      errorType: 'UnhandledRejection',
      severity: 'error',
      message: String(reason),
      stackTrace: reason instanceof Error ? reason.stack : undefined,
      component: 'async',
      service: 'api-server',
      context: {
        promise: String(promise),
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (reportError) {
    console.error('[ErrorOrchestration] Failed to report error:', reportError);
  }
});

// Example 2: Express error middleware
export function errorReportingMiddleware(err, req, res, next) {
  // Report error asynchronously
  errorService
    .reportError({
      errorType: err.name || 'ExpressError',
      severity: err.statusCode >= 500 ? 'critical' : 'error',
      message: err.message,
      stackTrace: err.stack,
      component: 'express',
      service: req.baseUrl || 'api',
      context: {
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        query: req.query,
        params: req.params,
        headers: {
          'user-agent': req.get('user-agent'),
          'content-type': req.get('content-type'),
        },
        user: req.user?.id,
      },
      environment: process.env.NODE_ENV || 'development',
    })
    .catch(reportError => {
      console.error('[ErrorOrchestration] Failed to report error:', reportError);
    });

  // Send response
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

// Example 3: Try-catch wrapper for async routes
export function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(async error => {
      // Report error
      await errorService
        .reportError({
          errorType: error.name || 'AsyncRouteError',
          severity: 'error',
          message: error.message,
          stackTrace: error.stack,
          component: 'route',
          service: req.route?.path || 'unknown',
          context: {
            method: req.method,
            path: req.path,
          },
          environment: process.env.NODE_ENV || 'development',
        })
        .catch(reportError => {
          console.error('[ErrorOrchestration] Failed to report error:', reportError);
        });

      // Pass to error middleware
      next(error);
    });
  };
}

// Example 4: Database error reporting
export async function reportDatabaseError(error, operation, context = {}) {
  await errorService.reportError({
    errorType: error.code || 'DatabaseError',
    severity: 'critical',
    message: error.message,
    stackTrace: error.stack,
    component: 'database',
    service: 'postgresql',
    context: {
      operation,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      ...context,
    },
    environment: process.env.NODE_ENV || 'development',
  });
}

// Example 5: Integration with API server
export function setupErrorOrchestration(app) {
  // Add error reporting middleware
  app.use(errorReportingMiddleware);

  // Health check endpoint
  app.get('/api/error-orchestration/health', async (req, res) => {
    try {
      const health = await errorService.healthCheck();
      res.status(health.status === 'healthy' ? 200 : 503).json(health);
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Error statistics endpoint (admin only)
  app.get('/api/error-orchestration/stats', async (req, res) => {
    // TODO: Add authentication middleware
    try {
      const stats = await errorService.getErrorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Manual error report endpoint (for client-side errors)
  app.post('/api/error-orchestration/report', express.json(), async (req, res) => {
    try {
      const { type, message, stack, component, context } = req.body;

      const errorId = await errorService.reportError({
        errorType: type || 'ClientError',
        severity: 'error',
        message,
        stackTrace: stack,
        component: component || 'client',
        service: 'frontend',
        context: {
          ...context,
          userAgent: req.get('user-agent'),
          ip: req.ip,
        },
        environment: process.env.NODE_ENV || 'development',
      });

      res.json({ success: true, errorId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log('[ErrorOrchestration] Integrated with API server');
}

// Example 6: Usage in a route
export function exampleRoute(app) {
  app.get(
    '/api/example',
    asyncErrorHandler(async (req, res) => {
      // Simulate database operation
      try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.query.id]);

        if (result.rows.length === 0) {
          const error = new Error('User not found');
          error.statusCode = 404;
          throw error;
        }

        res.json(result.rows[0]);
      } catch (error) {
        if (error.statusCode === 404) {
          throw error; // Will be handled by asyncErrorHandler
        }

        // Report database error
        await reportDatabaseError(error, 'SELECT_USER', {
          userId: req.query.id,
        });

        throw error;
      }
    })
  );
}

// Export for use in api-server-express.js
export { errorService };
export default {
  errorService,
  errorReportingMiddleware,
  asyncErrorHandler,
  reportDatabaseError,
  setupErrorOrchestration,
};
