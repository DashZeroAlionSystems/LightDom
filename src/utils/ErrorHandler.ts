import { Logger } from './Logger';
import { HeadlessChromeError } from '../types/HeadlessTypes';
import { CrawlError } from '../types/CrawlerTypes';
import { OptimizationError } from '../types/OptimizationTypes';

export interface ErrorContext {
  service: string;
  operation: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: ErrorContext;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export class ErrorHandler {
  private logger: Logger;
  private errorReports: Map<string, ErrorReport> = new Map();
  private errorCounter = 0;

  constructor() {
    this.logger = new Logger('ErrorHandler');
  }

  /**
   * Handle and categorize errors
   */
  handleError(error: Error, context: ErrorContext): ErrorReport {
    const errorReport = this.createErrorReport(error, context);
    
    // Log the error
    this.logError(errorReport);
    
    // Store the error report
    this.errorReports.set(errorReport.id, errorReport);
    
    // Emit event for monitoring
    this.emit('error', errorReport);
    
    return errorReport;
  }

  /**
   * Create error report from error and context
   */
  private createErrorReport(error: Error, context: ErrorContext): ErrorReport {
    const errorType = this.categorizeError(error);
    const severity = this.determineSeverity(error, context);
    
    return {
      id: `error_${Date.now()}_${++this.errorCounter}`,
      type: errorType,
      severity,
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      },
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error): string {
    if (error instanceof HeadlessChromeError) {
      return 'headless-chrome';
    }
    
    if (error instanceof CrawlError) {
      return 'crawl';
    }
    
    if (error instanceof OptimizationError) {
      return 'optimization';
    }
    
    if (error.name === 'TimeoutError') {
      return 'timeout';
    }
    
    if (error.name === 'NetworkError') {
      return 'network';
    }
    
    if (error.name === 'ValidationError') {
      return 'validation';
    }
    
    if (error.name === 'AuthenticationError') {
      return 'authentication';
    }
    
    if (error.name === 'AuthorizationError') {
      return 'authorization';
    }
    
    if (error.name === 'RateLimitError') {
      return 'rate-limit';
    }
    
    if (error.name === 'ResourceNotFoundError') {
      return 'not-found';
    }
    
    if (error.name === 'ConfigurationError') {
      return 'configuration';
    }
    
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors
    if (error.name === 'OutOfMemoryError' || 
        error.message.includes('FATAL') ||
        error.message.includes('CRITICAL')) {
      return 'critical';
    }
    
    // High severity errors
    if (error.name === 'TimeoutError' ||
        error.name === 'NetworkError' ||
        error.message.includes('connection') ||
        error.message.includes('timeout') ||
        context.service === 'headless' && error.message.includes('browser')) {
      return 'high';
    }
    
    // Medium severity errors
    if (error.name === 'ValidationError' ||
        error.name === 'RateLimitError' ||
        error.message.includes('validation') ||
        error.message.includes('rate limit')) {
      return 'medium';
    }
    
    // Low severity errors
    if (error.name === 'ResourceNotFoundError' ||
        error.message.includes('not found') ||
        error.message.includes('404')) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Log error with appropriate level
   */
  private logError(errorReport: ErrorReport): void {
    const { severity, message, context } = errorReport;
    
    const logData = {
      errorId: errorReport.id,
      type: errorReport.type,
      severity,
      service: context.service,
      operation: context.operation,
      metadata: context.metadata
    };
    
    switch (severity) {
      case 'critical':
        this.logger.error(message, { ...logData, level: 'fatal' });
        break;
      case 'high':
        this.logger.error(message, logData);
        break;
      case 'medium':
        this.logger.warn(message, logData);
        break;
      case 'low':
        this.logger.info(message, logData);
        break;
    }
  }

  /**
   * Create specific error types
   */
  static createHeadlessChromeError(message: string, code: string, context?: Record<string, any>): HeadlessChromeError {
    const error = new Error(message) as HeadlessChromeError;
    error.code = code;
    error.context = context;
    error.name = 'HeadlessChromeError';
    return error;
  }

  static createCrawlError(message: string, code: string, url: string, retryable: boolean = false): Error {
    const error = new Error(message);
    error.name = 'CrawlError';
    (error as any).code = code;
    (error as any).url = url;
    (error as any).timestamp = new Date().toISOString();
    (error as any).retryable = retryable;
    return error;
  }

  static createOptimizationError(message: string, code: string, url: string, ruleId?: string): Error {
    const error = new Error(message);
    error.name = 'OptimizationError';
    (error as any).code = code;
    (error as any).url = url;
    (error as any).timestamp = new Date().toISOString();
    (error as any).retryable = true;
    (error as any).ruleId = ruleId;
    return error;
  }

  static createTimeoutError(message: string, timeout: number): Error {
    const error = new Error(message);
    error.name = 'TimeoutError';
    (error as any).timeout = timeout;
    return error;
  }

  static createNetworkError(message: string, url?: string): Error {
    const error = new Error(message);
    error.name = 'NetworkError';
    (error as any).url = url;
    return error;
  }

  static createValidationError(message: string, field?: string): Error {
    const error = new Error(message);
    error.name = 'ValidationError';
    (error as any).field = field;
    return error;
  }

  static createRateLimitError(message: string, retryAfter?: number): Error {
    const error = new Error(message);
    error.name = 'RateLimitError';
    (error as any).retryAfter = retryAfter;
    return error;
  }

  /**
   * Resolve an error report
   */
  resolveError(errorId: string, resolvedBy: string, resolution: string): boolean {
    const errorReport = this.errorReports.get(errorId);
    if (!errorReport) return false;
    
    errorReport.resolved = true;
    errorReport.resolvedAt = new Date().toISOString();
    errorReport.resolvedBy = resolvedBy;
    errorReport.resolution = resolution;
    errorReport.updatedAt = new Date().toISOString();
    
    this.logger.info(`Error resolved: ${errorId}`, { resolvedBy, resolution });
    this.emit('errorResolved', errorReport);
    
    return true;
  }

  /**
   * Get error report by ID
   */
  getErrorReport(errorId: string): ErrorReport | undefined {
    return this.errorReports.get(errorId);
  }

  /**
   * Get all error reports
   */
  getAllErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values());
  }

  /**
   * Get error reports by service
   */
  getErrorReportsByService(service: string): ErrorReport[] {
    return Array.from(this.errorReports.values()).filter(
      report => report.context.service === service
    );
  }

  /**
   * Get error reports by severity
   */
  getErrorReportsBySeverity(severity: string): ErrorReport[] {
    return Array.from(this.errorReports.values()).filter(
      report => report.severity === severity
    );
  }

  /**
   * Get unresolved error reports
   */
  getUnresolvedErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values()).filter(
      report => !report.resolved
    );
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): any {
    const reports = Array.from(this.errorReports.values());
    
    const stats: any = {
      total: reports.length,
      resolved: reports.filter(r => r.resolved).length,
      unresolved: reports.filter(r => !r.resolved).length,
      byType: {},
      bySeverity: {},
      byService: {},
      recent: reports.filter(r => 
        new Date(r.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ).length
    };
    
    // Count by type
    reports.forEach(report => {
      stats.byType[report.type] = (stats.byType[report.type] || 0) + 1;
    });
    
    // Count by severity
    reports.forEach(report => {
      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;
    });
    
    // Count by service
    reports.forEach(report => {
      stats.byService[report.context.service] = (stats.byService[report.context.service] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Cleanup old error reports
   */
  cleanupOldReports(maxAge: number = 30 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = Date.now() - maxAge;
    let cleanedCount = 0;
    
    for (const [id, report] of this.errorReports) {
      if (new Date(report.createdAt).getTime() < cutoffTime) {
        this.errorReports.delete(id);
        cleanedCount++;
      }
    }
    
    this.logger.info(`Cleaned up ${cleanedCount} old error reports`);
    return cleanedCount;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    const stats = this.getErrorStatistics();
    return {
      totalErrors: stats.total,
      unresolvedErrors: stats.unresolved,
      recentErrors: stats.recent,
      criticalErrors: stats.bySeverity.critical || 0,
      highSeverityErrors: stats.bySeverity.high || 0
    };
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    // In a real implementation, this would emit to an event emitter
    this.logger.debug(`Event emitted: ${event}`, { data });
  }
}

export default ErrorHandler;
