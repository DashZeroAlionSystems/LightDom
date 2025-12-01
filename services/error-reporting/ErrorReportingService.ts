/**
 * Error Reporting Service
 *
 * Captures runtime errors, deduplicates, persists to database,
 * and queues for DeepSeek analysis
 *
 * @module services/error-reporting/ErrorReportingService
 */

import { createHash } from 'crypto';
import EventEmitter from 'events';
import type { QueryablePool } from './types.js';

export interface ErrorReport {
  id?: string;
  errorHash: string;
  errorType: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  stackTrace?: string;
  component: string;
  service?: string;
  context?: Record<string, any>;
  environment?: string;
}

export interface ErrorReportingOptions {
  db: QueryablePool;
  config?: ErrorOrchestrationConfig;
  logger?: Console;
}

export interface ErrorOrchestrationConfig {
  runtime?: {
    activeEnvironment?: string;
    environmentName?: string;
    severityGate?: Array<'critical' | 'error' | 'warning' | 'info'>;
    sla?: {
      expectedResolutionMinutes?: number;
      reviewCadenceMinutes?: number;
    } | null;
  };
  logging?: {
    format?: string;
    policy?: string;
  };
  security?: {
    redaction?: {
      enabled: boolean;
      patterns: string[];
      customRegex?: string[];
    };
  };
  analysis?: {
    thresholds?: {
      minOccurrences: number;
    };
  };
  actions?: {
    workflow?: {
      expectedResolutionMinutes?: number;
      maxParallelFixes?: number;
      escalationPolicy?: string;
    };
  };
}

export interface ErrorEventLogPayload {
  errorId?: string;
  service: string;
  attribute: string;
  status: string;
  message: string;
  metadata?: Record<string, any>;
}

export class ErrorReportingService extends EventEmitter {
  private db: QueryablePool;
  private config: ErrorOrchestrationConfig;
  private logger: Console;
  private redactionPatterns: RegExp[];
  private logTemplate: string;
  private severityGate: Array<'critical' | 'error' | 'warning' | 'info'>;
  private activeEnvironment: string;

  constructor(options: ErrorReportingOptions) {
    super();
    this.db = options.db;
    this.config = options.config || {};
    this.logger = options.logger || console;

    // Compile redaction patterns
    this.redactionPatterns = this.compileRedactionPatterns();
    this.logTemplate = this.config.logging?.format || '{service}{attribute}{status} - {message}';
    this.activeEnvironment =
      this.config.runtime?.activeEnvironment || process.env.ERROR_ORCHESTRATION_ENV || 'dev';
    this.severityGate = this.config.runtime?.severityGate || ['error', 'critical'];

    this.logger.info(
      this.formatLogMessage(
        'error-reporting',
        this.activeEnvironment,
        'initialized',
        'Service ready'
      )
    );
  }

  /**
   * Report an error to the system
   */
  async reportError(error: Error | string, context: Partial<ErrorReport> = {}): Promise<string> {
    try {
      const errorReport = this.buildErrorReport(error, context);
      const reportId = await this.persistError(errorReport);

      await this.logEvent({
        errorId: reportId,
        service: errorReport.service || 'error-reporting',
        attribute: errorReport.component,
        status: 'captured',
        message: errorReport.message,
        metadata: {
          environment: errorReport.environment,
          severity: errorReport.severity,
        },
      });

      // Emit event for real-time monitoring
      this.emit('error:reported', { id: reportId, ...errorReport });

      // Check if we should trigger analysis
      if (await this.shouldTriggerAnalysis(errorReport)) {
        await this.logEvent({
          errorId: reportId,
          service: errorReport.service || 'error-reporting',
          attribute: errorReport.component,
          status: 'queued',
          message: 'Error met analysis threshold',
        });
        this.emit('error:needsAnalysis', { id: reportId, ...errorReport });
      }

      return reportId;
    } catch (err) {
      this.logger.error('[ErrorReportingService] Failed to report error:', err);
      throw err;
    }
  }

  /**
   * Build structured error report from error object
   */
  private buildErrorReport(error: Error | string, context: Partial<ErrorReport>): ErrorReport {
    const isErrorObject = error instanceof Error;
    const message = isErrorObject ? error.message : String(error);
    const stackTrace = isErrorObject ? error.stack : undefined;
    const errorType = isErrorObject ? error.constructor.name : 'Error';

    // Redact sensitive information
    const sanitizedMessage = this.redactSecrets(message);
    const sanitizedStack = stackTrace ? this.redactSecrets(stackTrace) : undefined;
    const sanitizedContext = context.context ? this.redactSecretsFromObject(context.context) : {};

    // Generate error hash for deduplication
    const errorHash = this.generateErrorHash({
      type: errorType,
      message: sanitizedMessage,
      component: context.component || 'unknown',
      stack: sanitizedStack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
    });

    return {
      errorHash,
      errorType,
      severity: context.severity || this.inferSeverity(errorType, message),
      message: sanitizedMessage,
      stackTrace: sanitizedStack,
      component: context.component || this.inferComponent(sanitizedStack),
      service: context.service || process.env.SERVICE_NAME,
      context: sanitizedContext,
      environment: context.environment || process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Persist error to database (with deduplication)
   */
  private async persistError(report: ErrorReport): Promise<string> {
    const result = await this.db.query(
      `SELECT upsert_error_report($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        report.errorHash,
        report.errorType,
        report.severity,
        report.message,
        report.stackTrace,
        report.component,
        report.service,
        JSON.stringify(report.context || {}),
      ]
    );

    return result.rows[0].upsert_error_report;
  }

  /**
   * Check if error should trigger DeepSeek analysis
   */
  private async shouldTriggerAnalysis(report: ErrorReport): Promise<boolean> {
    if (!this.severityGate.includes(report.severity)) {
      return false;
    }

    // Check occurrence threshold
    const minOccurrences = this.config.analysis?.thresholds?.minOccurrences || 3;
    const result = await this.db.query(
      `SELECT occurrence_count, status FROM error_reports WHERE error_hash = $1`,
      [report.errorHash]
    );

    if (result.rows.length === 0) return false;

    const { occurrence_count, status } = result.rows[0];

    // Trigger analysis if threshold met and not already analyzed
    return occurrence_count >= minOccurrences && status === 'new';
  }

  /**
   * Generate deterministic hash for error deduplication
   */
  private generateErrorHash(data: {
    type: string;
    message: string;
    component: string;
    stack?: string;
  }): string {
    const normalized = JSON.stringify({
      type: data.type,
      message: data.message.substring(0, 200), // First 200 chars
      component: data.component,
      stack: data.stack?.substring(0, 300), // First 300 chars of stack
    });

    return createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Infer severity from error type and message
   */
  private inferSeverity(
    errorType: string,
    message: string
  ): 'critical' | 'error' | 'warning' | 'info' {
    const lowerMessage = message.toLowerCase();

    // Critical indicators
    if (
      errorType === 'FatalError' ||
      lowerMessage.includes('fatal') ||
      lowerMessage.includes('crash') ||
      lowerMessage.includes('out of memory')
    ) {
      return 'critical';
    }

    // Warning indicators
    if (
      errorType === 'Warning' ||
      lowerMessage.includes('warn') ||
      lowerMessage.includes('deprecated')
    ) {
      return 'warning';
    }

    // Default to error
    return 'error';
  }

  /**
   * Infer component from stack trace
   */
  private inferComponent(stackTrace?: string): string {
    if (!stackTrace) return 'unknown';

    // Extract first file in stack that's not node_modules
    const match = stackTrace.match(/at .+ \((.+?):(\d+):(\d+)\)/);
    if (match) {
      const filePath = match[1];
      const parts = filePath.split(/[/\\]/);
      const relevantParts = parts.filter(p => p !== 'node_modules' && p !== 'dist');

      if (relevantParts.length > 0) {
        return relevantParts[relevantParts.length - 1].replace(/\.(ts|js|tsx|jsx)$/, '');
      }
    }

    return 'unknown';
  }

  /**
   * Redact secrets from string
   */
  private redactSecrets(text: string): string {
    if (!this.config.security?.redaction?.enabled) {
      return text;
    }

    let redacted = text;

    for (const pattern of this.redactionPatterns) {
      redacted = redacted.replace(pattern, match => {
        // Keep first 4 chars visible for debugging
        const visible = match.substring(0, 4);
        return `${visible}***REDACTED***`;
      });
    }

    return redacted;
  }

  /**
   * Redact secrets from object recursively
   */
  private redactSecretsFromObject(obj: Record<string, any>): Record<string, any> {
    if (!this.config.security?.redaction?.enabled) {
      return obj;
    }

    const redacted: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const shouldRedact = this.config.security.redaction.patterns.some(pattern =>
        lowerKey.includes(pattern.toLowerCase())
      );

      if (shouldRedact && typeof value === 'string') {
        redacted[key] = value.substring(0, 4) + '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSecretsFromObject(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Compile redaction patterns from config
   */
  private compileRedactionPatterns(): RegExp[] {
    const patterns: RegExp[] = [];

    if (!this.config.security?.redaction?.enabled) {
      return patterns;
    }

    // Add custom regex patterns
    if (this.config.security.redaction.customRegex) {
      for (const regexStr of this.config.security.redaction.customRegex) {
        try {
          patterns.push(new RegExp(regexStr, 'gi'));
        } catch (err) {
          this.logger.warn(`[ErrorReportingService] Invalid regex pattern: ${regexStr}`);
        }
      }
    }

    return patterns;
  }

  /**
   * Get error statistics
   */
  async getErrorStats(): Promise<any> {
    const result = await this.db.query(`
      SELECT * FROM error_reports_summary
      ORDER BY total_occurrences DESC
      LIMIT 20
    `);

    return result.rows;
  }

  /**
   * Get pending errors for analysis
   */
  async getPendingErrors(limit: number = 10): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM pending_error_analysis 
       ORDER BY occurrences DESC, first_occurrence ASC 
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Mark error as analyzing
   */
  async markAnalyzing(errorId: string): Promise<void> {
    await this.db.query(
      `UPDATE error_reports 
       SET status = 'analyzing', analysis_requested_at = NOW()
       WHERE id = $1`,
      [errorId]
    );
  }

  /**
   * Save analysis result
   */
  async saveAnalysisResult(errorId: string, result: any): Promise<void> {
    await this.db.query(
      `UPDATE error_reports 
       SET status = 'analyzed', 
           analysis_completed_at = NOW(),
           analysis_result = $2
       WHERE id = $1`,
      [errorId, JSON.stringify(result)]
    );

    this.emit('error:analyzed', { errorId, result });
  }

  /**
   * Persist structured event logs to support observability policy
   */
  async logEvent(event: ErrorEventLogPayload): Promise<void> {
    const formatted = this.formatLogMessage(
      event.service,
      event.attribute,
      event.status,
      event.message
    );
    this.logger.info(formatted);

    try {
      await this.db.query(
        `INSERT INTO error_event_logs (error_report_id, service, attribute, status, message, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          event.errorId || null,
          event.service,
          event.attribute,
          event.status,
          event.message,
          JSON.stringify(event.metadata || {}),
        ]
      );
    } catch (error) {
      this.logger.warn(
        this.formatLogMessage(
          'error-reporting',
          'event-log',
          'persist-failed',
          error instanceof Error ? error.message : String(error)
        )
      );
    }
  }

  private formatLogMessage(
    service: string,
    attribute: string,
    status: string,
    message: string
  ): string {
    return this.logTemplate
      .replace('{service}', service)
      .replace('{attribute}', attribute)
      .replace('{status}', status)
      .replace('{message}', message);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details?: any }> {
    try {
      const result = await this.db.query(`SELECT COUNT(*) as pending FROM pending_error_analysis`);
      return {
        status: 'healthy',
        details: {
          pendingAnalysis: parseInt(result.rows[0]?.pending || '0', 10),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }
}

export default ErrorReportingService;
