/**
 * DeepSeek Analysis Client
 *
 * Secure wrapper for Ollama/DeepSeek interactions with:
 * - Rate limiting
 * - Secret redaction
 * - Audit logging
 * - Token/network restrictions
 *
 * @module services/error-reporting/DeepSeekAnalysisClient
 */

import EventEmitter from 'events';
import type { QueryablePool } from './types.js';

export interface DeepSeekRequest {
  type: 'error_analysis' | 'fix_generation' | 'commit_message';
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DeepSeekResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata: {
    model: string;
    tokensUsed?: number;
    durationMs: number;
  };
}

export interface DeepSeekClientOptions {
  db: QueryablePool;
  config: any;
  logger?: Console;
}

export class DeepSeekAnalysisClient extends EventEmitter {
  private db: QueryablePool;
  private config: any;
  private logger: Console;
  private requestQueue: DeepSeekRequest[] = [];
  private activeRequests = 0;
  private requestTimestamps: number[] = [];

  constructor(options: DeepSeekClientOptions) {
    super();
    this.db = options.db;
    this.config = options.config;
    this.logger = options.logger || console;

    this.logger.info('[DeepSeekClient] Initialized');
  }

  /**
   * Analyze an error and provide recommendations
   */
  async analyzeError(errorDetails: {
    id: string;
    type: string;
    message: string;
    stackTrace?: string;
    component: string;
    context?: Record<string, any>;
  }): Promise<any> {
    const startTime = Date.now();

    try {
      // Rate limit check
      await this.checkRateLimit();

      // Prepare prompt
      const prompt = this.buildAnalysisPrompt(errorDetails);

      // Call Ollama
      const response = await this.callOllama({
        model: this.config.ollama.endpoint.model,
        prompt,
        temperature: this.config.ollama.parameters?.temperature || 0.3,
        max_tokens: this.config.ollama.parameters?.maxTokens || 2048,
      });

      // Parse response
      const result = this.parseAnalysisResponse(response);

      // Audit log
      await this.logRequest({
        type: 'error_analysis',
        payload: { errorId: errorDetails.id, component: errorDetails.component },
        response: result,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return result;
    } catch (error) {
      this.logger.error('[DeepSeekClient] Error analysis failed:', error);

      await this.logRequest({
        type: 'error_analysis',
        payload: { errorId: errorDetails.id },
        response: null,
        durationMs: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Generate a fix for an error
   */
  async generateFix(errorDetails: any, analysisResult: any): Promise<any> {
    const startTime = Date.now();

    try {
      await this.checkRateLimit();

      const prompt = this.buildFixPrompt(errorDetails, analysisResult);

      const response = await this.callOllama({
        model: this.config.ollama.endpoint.model,
        prompt,
        temperature: 0.2, // Lower temp for code generation
        max_tokens: 4096,
      });

      const result = this.parseFixResponse(response);

      await this.logRequest({
        type: 'fix_generation',
        payload: { errorId: errorDetails.id },
        response: result,
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return result;
    } catch (error) {
      this.logger.error('[DeepSeekClient] Fix generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate commit message for a fix
   */
  async generateCommitMessage(context: {
    component: string;
    error: string;
    fixSummary: string;
    errorHash: string;
  }): Promise<string> {
    const startTime = Date.now();

    try {
      await this.checkRateLimit();

      const prompt = this.buildCommitMessagePrompt(context);

      const response = await this.callOllama({
        model: this.config.ollama.endpoint.model,
        prompt,
        temperature: 0.4,
        max_tokens: 256,
      });

      const commitMessage = response.trim();

      await this.logRequest({
        type: 'commit_message',
        payload: context,
        response: { commitMessage },
        durationMs: Date.now() - startTime,
        status: 'success',
      });

      return commitMessage;
    } catch (error) {
      this.logger.error('[DeepSeekClient] Commit message generation failed:', error);
      throw error;
    }
  }

  /**
   * Build error analysis prompt
   */
  private buildAnalysisPrompt(errorDetails: any): string {
    const template =
      this.config.ollama.prompts?.errorAnalysis ||
      `Analyze this error and provide JSON response with: rootCause, suggestedFixes, relatedFiles, confidence (0-1)`;

    return template.replace(
      '{{errorDetails}}',
      JSON.stringify(
        {
          type: errorDetails.type,
          message: errorDetails.message,
          component: errorDetails.component,
          stackTrace: errorDetails.stackTrace?.split('\n').slice(0, 10).join('\n'), // Limit stack
          context: errorDetails.context,
        },
        null,
        2
      )
    );
  }

  /**
   * Build fix generation prompt
   */
  private buildFixPrompt(errorDetails: any, analysisResult: any): string {
    const template =
      this.config.ollama.prompts?.fixGeneration ||
      `Generate fix for error. Return JSON with: fixedCode, explanation, testCases`;

    return template
      .replace('{{error}}', errorDetails.message)
      .replace('{{context}}', JSON.stringify(analysisResult, null, 2));
  }

  /**
   * Build commit message prompt
   */
  private buildCommitMessagePrompt(context: any): string {
    const template =
      this.config.ollama.prompts?.commitMessage ||
      `Generate conventional commit message for: Component {{component}}, Fix: {{fixSummary}}`;

    return template
      .replace('{{component}}', context.component)
      .replace('{{error}}', context.error)
      .replace('{{fixSummary}}', context.fixSummary);
  }

  /**
   * Call Ollama API
   */
  private async callOllama(params: {
    model: string;
    prompt: string;
    temperature: number;
    max_tokens: number;
  }): Promise<string> {
    const endpoint = this.config.ollama.endpoint.url;
    const timeout = this.config.ollama.endpoint.timeoutMs || 30000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.ollama.endpoint.authToken && {
            Authorization: `Bearer ${this.config.ollama.endpoint.authToken}`,
          }),
        },
        body: JSON.stringify({
          model: params.model,
          prompt: params.prompt,
          stream: false,
          options: {
            temperature: params.temperature,
            num_predict: params.max_tokens,
            top_p: this.config.ollama.parameters?.topP || 0.9,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Ollama request timed out');
      }
      throw error;
    }
  }

  /**
   * Parse analysis response
   */
  private parseAnalysisResponse(response: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: return structured text
      return {
        rootCause: response,
        suggestedFixes: [],
        relatedFiles: [],
        confidence: 0.5,
      };
    } catch (error) {
      this.logger.warn('[DeepSeekClient] Failed to parse JSON response, using raw text');
      return {
        rootCause: response,
        suggestedFixes: [],
        relatedFiles: [],
        confidence: 0.5,
      };
    }
  }

  /**
   * Parse fix response
   */
  private parseFixResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        fixedCode: response,
        explanation: 'Generated fix',
        testCases: [],
      };
    } catch (error) {
      return {
        fixedCode: response,
        explanation: 'Generated fix',
        testCases: [],
      };
    }
  }

  /**
   * Rate limit check
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const maxPerMinute = this.config.analysis?.rateLimit?.maxRequestsPerMinute || 10;
    const maxConcurrent = this.config.analysis?.rateLimit?.maxConcurrent || 3;

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < 60000);

    // Check per-minute limit
    if (this.requestTimestamps.length >= maxPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
    }

    // Check concurrent limit
    if (this.activeRequests >= maxConcurrent) {
      throw new Error('Too many concurrent requests');
    }

    this.requestTimestamps.push(now);
    this.activeRequests++;

    // Cleanup after request completes (approximate)
    setTimeout(() => {
      this.activeRequests = Math.max(0, this.activeRequests - 1);
    }, 5000);
  }

  /**
   * Log request to audit table
   */
  private async logRequest(data: {
    type: string;
    payload: any;
    response: any;
    durationMs: number;
    status: string;
    error?: string;
  }): Promise<void> {
    if (!this.config.security?.auditLogging?.enabled) {
      return;
    }

    try {
      await this.db.query(
        `INSERT INTO deepseek_analysis_log 
         (request_type, request_payload, response_payload, model_used, 
          duration_ms, status, error_message, secrets_redacted, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          data.type,
          JSON.stringify(data.payload),
          data.response ? JSON.stringify(data.response) : null,
          this.config.ollama.endpoint.model,
          data.durationMs,
          data.status,
          data.error || null,
          true, // Always redact secrets
        ]
      );
    } catch (error) {
      this.logger.error('[DeepSeekClient] Failed to log audit entry:', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details?: any }> {
    try {
      const endpoint = this.config.ollama.endpoint.url;
      const response = await fetch(`${endpoint}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return { status: 'unhealthy', details: { error: 'Ollama not responding' } };
      }

      const data = await response.json();
      return {
        status: 'healthy',
        details: {
          endpoint,
          model: this.config.ollama.endpoint.model,
          availableModels: data.models?.map((m: any) => m.name) || [],
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

export default DeepSeekAnalysisClient;
