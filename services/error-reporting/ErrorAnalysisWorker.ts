/**
 * Error Analysis Worker
 *
 * Background worker that:
 * 1. Polls for errors needing analysis
 * 2. Calls DeepSeek for diagnosis
 * 3. Creates actionable outcomes (tickets/PRs)
 * 4. Manages state transitions
 *
 * @module services/error-reporting/ErrorAnalysisWorker
 */

import EventEmitter from 'events';
import DeepSeekAnalysisClient from './DeepSeekAnalysisClient.js';
import ErrorReportingService from './ErrorReportingService.js';
import type { QueryablePool } from './types.js';

type SeverityLevel = 'critical' | 'error' | 'warning' | 'info';
const VALID_SEVERITIES: SeverityLevel[] = ['critical', 'error', 'warning', 'info'];
const isValidSeverity = (level: string): level is SeverityLevel =>
  VALID_SEVERITIES.includes(level as SeverityLevel);

export interface ErrorAnalysisWorkerOptions {
  db: QueryablePool;
  config: any;
  logger?: Console;
}

export class ErrorAnalysisWorker extends EventEmitter {
  private db: QueryablePool;
  private config: any;
  private logger: Console;
  private errorService: ErrorReportingService;
  private deepseekClient: DeepSeekAnalysisClient;
  private isRunning = false;
  private intervalHandle?: NodeJS.Timeout;
  private logTemplate: string;
  private severityGate: SeverityLevel[];
  private activeEnvironment: string;

  constructor(options: ErrorAnalysisWorkerOptions) {
    super();
    this.db = options.db;
    this.config = options.config;
    this.logger = options.logger || console;

    this.errorService = new ErrorReportingService({
      db: this.db,
      config: this.config,
      logger: this.logger,
    });

    this.deepseekClient = new DeepSeekAnalysisClient({
      db: this.db,
      config: this.config,
      logger: this.logger,
    });
    this.logTemplate = this.config.logging?.format || '{service}{attribute}{status} - {message}';
    this.activeEnvironment =
      this.config.runtime?.environmentName ||
      this.config.runtime?.activeEnvironment ||
      process.env.ERROR_ORCHESTRATION_ENV ||
      'dev';
    this.severityGate = (this.config.runtime?.severityGate || ['error', 'critical'])
      .map((level: string) => level.toLowerCase())
      .filter(isValidSeverity);

    this.log('info', 'error-worker', this.activeEnvironment, 'initialized', 'Worker ready');
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('warn', 'error-worker', this.activeEnvironment, 'already-running', 'Start skipped');
      return;
    }

    this.isRunning = true;
    const intervalMs = this.config.analysis?.scheduling?.intervalMs || 60000;

    this.log(
      'info',
      'error-worker',
      this.activeEnvironment,
      'starting',
      `Interval ${intervalMs}ms`
    );

    // Run immediately
    this.processErrors().catch(err =>
      this.log(
        'error',
        'error-worker',
        this.activeEnvironment,
        'initial-run-failed',
        err instanceof Error ? err.message : String(err)
      )
    );

    // Schedule periodic runs
    this.intervalHandle = setInterval(() => {
      this.processErrors().catch(err =>
        this.log(
          'error',
          'error-worker',
          this.activeEnvironment,
          'scheduled-run-failed',
          err instanceof Error ? err.message : String(err)
        )
      );
    }, intervalMs);

    this.emit('worker:started');
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    this.log('info', 'error-worker', this.activeEnvironment, 'stopping', 'Graceful shutdown');

    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }

    this.isRunning = false;
    this.emit('worker:stopped');
  }

  /**
   * Process pending errors
   */
  private async processErrors(): Promise<void> {
    if (!this.config.analysis?.scheduling?.enabled) {
      return;
    }

    try {
      const batchSize = this.config.analysis?.scheduling?.batchSize || 10;
      const pendingErrors = await this.errorService.getPendingErrors(batchSize);

      if (pendingErrors.length === 0) {
        this.log('debug', 'error-worker', this.activeEnvironment, 'idle', 'No pending errors');
        return;
      }

      this.log(
        'info',
        'error-worker',
        this.activeEnvironment,
        'processing',
        `${pendingErrors.length} error(s)`
      );

      for (const error of pendingErrors) {
        if (!this.shouldProcessSeverity(error.severity)) {
          this.log(
            'debug',
            'error-worker',
            error.id,
            'skipped-severity',
            `Severity ${error.severity}`
          );
          continue;
        }
        try {
          await this.analyzeAndActOnError(error);
        } catch (err) {
          this.log(
            'error',
            'error-worker',
            error.id,
            'process-failed',
            err instanceof Error ? err.message : String(err)
          );
          // Continue with next error
        }
      }

      this.emit('worker:batch:completed', { processed: pendingErrors.length });
    } catch (error) {
      this.log(
        'error',
        'error-worker',
        this.activeEnvironment,
        'batch-failed',
        error instanceof Error ? error.message : String(error)
      );
      this.emit('worker:batch:failed', { error });
    }
  }

  /**
   * Analyze error and determine action
   */
  private async analyzeAndActOnError(error: any): Promise<void> {
    const { id, error_hash, error_type, message, stack_trace, component, context } = error;

    this.log('info', 'error-worker', id, 'analyzing', component || 'unknown');

    // Mark as analyzing
    await this.errorService.markAnalyzing(id);

    try {
      // Call DeepSeek for analysis
      const analysis = await this.deepseekClient.analyzeError({
        id,
        type: error_type,
        message,
        stackTrace: stack_trace,
        component,
        context: context ? JSON.parse(context) : {},
      });

      this.log(
        'info',
        'error-worker',
        id,
        'analysis-complete',
        `Confidence ${analysis.confidence ?? 'n/a'}`
      );
      await this.errorService.logEvent({
        errorId: id,
        service: 'error-worker',
        attribute: component,
        status: 'analysis-complete',
        message: `Confidence ${analysis.confidence ?? 'n/a'}`,
      });

      // Save analysis result
      await this.errorService.saveAnalysisResult(id, analysis);

      // Determine action based on confidence and config
      const action = this.determineAction(analysis);

      if (action) {
        await this.createAction(id, error_hash, component, analysis, action);
      }

      this.emit('error:analyzed', { id, analysis, action });
    } catch (analysisError) {
      this.log(
        'error',
        'error-worker',
        id,
        'analysis-failed',
        analysisError instanceof Error ? analysisError.message : String(analysisError)
      );
      await this.errorService.logEvent({
        errorId: id,
        service: 'error-worker',
        attribute: component,
        status: 'analysis-failed',
        message: analysisError instanceof Error ? analysisError.message : String(analysisError),
      });

      // Save error status
      await this.db.query(
        `UPDATE error_reports 
         SET status = 'new', analysis_requested_at = NULL
         WHERE id = $1`,
        [id]
      );

      throw analysisError;
    }
  }

  /**
   * Determine what action to take based on analysis
   */
  private determineAction(analysis: any): string | null {
    const confidence = analysis.confidence || 0;
    const minConfidence = this.config.analysis?.thresholds?.minConfidence || 0.7;
    const autoFixConfidence = this.config.analysis?.thresholds?.autoFixConfidence || 0.9;
    const enabledTypes = this.config.actions?.enabledTypes || ['log_only'];

    // Below minimum confidence: log only
    if (confidence < minConfidence) {
      return enabledTypes.includes('log_only') ? 'log_only' : null;
    }

    // High confidence: generate PR if enabled
    if (confidence >= autoFixConfidence && enabledTypes.includes('generate_pr')) {
      return 'generate_pr';
    }

    // Medium confidence: create ticket if enabled
    if (confidence >= minConfidence && enabledTypes.includes('create_ticket')) {
      return 'create_ticket';
    }

    // Default: log only
    return enabledTypes.includes('log_only') ? 'log_only' : null;
  }

  /**
   * Create action record
   */
  private async createAction(
    errorId: string,
    errorHash: string,
    component: string,
    analysis: any,
    actionType: string
  ): Promise<void> {
    this.log('info', 'error-worker', errorId, `action-${actionType}`, 'Creating action record');

    // Generate commit message if creating PR
    let commitMessage = null;
    if (actionType === 'generate_pr') {
      try {
        commitMessage = await this.deepseekClient.generateCommitMessage({
          component,
          error: analysis.rootCause || 'Unknown error',
          fixSummary: analysis.suggestedFixes?.[0] || 'Fix issue',
          errorHash,
        });
      } catch (err) {
        this.log(
          'warn',
          'error-worker',
          errorId,
          'commit-message-failed',
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    // Insert action
    await this.db.query(
      `INSERT INTO error_actions 
       (error_report_id, action_type, action_status, recommendation, 
        confidence_score, commit_message, implementation_plan, related_files)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        errorId,
        actionType,
        'pending',
        JSON.stringify(analysis),
        analysis.confidence || 0,
        commitMessage,
        analysis.suggestedFixes?.[0] || null,
        analysis.relatedFiles || [],
      ]
    );

    this.emit('action:created', { errorId, actionType, analysis });
    await this.errorService.logEvent({
      errorId,
      service: 'error-worker',
      attribute: component,
      status: `action-${actionType}`,
      message: `Confidence ${analysis.confidence ?? 'n/a'}`,
      metadata: {
        actionType,
        commitMessage,
      },
    });

    // If ticket creation enabled, create it
    if (actionType === 'create_ticket') {
      await this.createTicket(errorId, errorHash, component, analysis);
    }
  }

  /**
   * Create ticket in configured system
   */
  private async createTicket(
    errorId: string,
    errorHash: string,
    component: string,
    analysis: any
  ): Promise<void> {
    const ticketSystem = this.config.actions?.ticketing?.system || 'database';

    if (ticketSystem === 'database') {
      // Store ticket in database
      const ticketId = `ERR-${errorHash.substring(0, 8).toUpperCase()}`;
      const labels = this.config.actions?.ticketing?.labels || ['bug', 'automated'];

      this.log('info', 'error-worker', errorId, 'ticket-creating', ticketId);

      // Store in content_entities or similar
      await this.db.query(
        `INSERT INTO content_entities 
         (type, title, description, content, metadata, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          'ld:ErrorTicket',
          `[${component}] ${analysis.rootCause?.substring(0, 100) || 'Error detected'}`,
          `Automatically generated ticket for error ${errorHash}`,
          JSON.stringify({
            errorId,
            errorHash,
            component,
            analysis,
            ticketId,
          }),
          JSON.stringify({
            ticketId,
            source: 'error-orchestration',
            confidence: analysis.confidence,
          }),
          labels,
        ]
      );

      // Update action with ticket ID
      await this.db.query(
        `UPDATE error_actions 
         SET ticket_id = $1, action_status = 'completed'
         WHERE error_report_id = $2 AND action_type = 'create_ticket'`,
        [ticketId, errorId]
      );

      this.emit('ticket:created', { errorId, ticketId });
      await this.errorService.logEvent({
        errorId,
        service: 'error-worker',
        attribute: component,
        status: 'ticket-created',
        message: ticketId,
      });
    } else {
      this.log('warn', 'error-worker', errorId, 'ticket-system-missing', ticketSystem);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details?: any }> {
    const errorServiceHealth = await this.errorService.healthCheck();
    const deepseekHealth = await this.deepseekClient.healthCheck();

    const isHealthy =
      errorServiceHealth.status === 'healthy' && deepseekHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      details: {
        worker: { running: this.isRunning },
        errorService: errorServiceHealth,
        deepseek: deepseekHealth,
      },
    };
  }

  private shouldProcessSeverity(severity?: string | null): boolean {
    if (!severity) {
      return true;
    }

    const lowered = severity.toLowerCase();

    if (!isValidSeverity(lowered)) {
      return false;
    }

    if (this.severityGate.length === 0) {
      return true;
    }

    return this.severityGate.includes(lowered);
  }

  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    service: string,
    attribute: string,
    status: string,
    message: string
  ): void {
    const formatted = this.logTemplate
      .replace('{service}', service)
      .replace('{attribute}', attribute)
      .replace('{status}', status)
      .replace('{message}', message);

    if (level === 'warn') {
      this.logger.warn(formatted);
      return;
    }

    if (level === 'error') {
      this.logger.error(formatted);
      return;
    }

    if (level === 'debug' && typeof this.logger.debug === 'function') {
      this.logger.debug(formatted);
      return;
    }

    this.logger.info(formatted);
  }
}

export default ErrorAnalysisWorker;
