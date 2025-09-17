/**
 * Comprehensive Error Handling and Validation System
 * Centralized error management for the LightDom platform
 */

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  stack?: string;
  context?: {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorDetails[] = [];
  private maxLogSize = 1000;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and log errors
   */
  public handleError(
    error: Error | string,
    context?: ErrorDetails['context'],
    code?: string
  ): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: code || 'UNKNOWN_ERROR',
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? error : undefined,
      timestamp: Date.now(),
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      context,
    };

    this.logError(errorDetails);
    return errorDetails;
  }

  /**
   * Log error to internal storage
   */
  private logError(error: ErrorDetails): void {
    this.errorLog.push(error);

    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }
  }

  /**
   * Create API error response
   */
  public createApiError(message: string, code: string = 'API_ERROR', details?: any): ApiError {
    return {
      success: false,
      error: code,
      message,
      code,
      details,
      timestamp: Date.now(),
    };
  }

  /**
   * Validate required fields
   */
  public validateRequiredFields(data: any, requiredFields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push({
          field,
          message: `${field} is required`,
          rule: 'required',
        });
      }
    }

    return errors;
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        value: email,
        rule: 'email_format',
      });
    }

    return errors;
  }

  /**
   * Validate Ethereum address
   */
  public validateEthereumAddress(address: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;

    if (!addressRegex.test(address)) {
      errors.push({
        field: 'address',
        message: 'Invalid Ethereum address format',
        value: address,
        rule: 'ethereum_address',
      });
    }

    return errors;
  }

  /**
   * Validate URL format
   */
  public validateURL(url: string): ValidationError[] {
    const errors: ValidationError[] = [];

    try {
      new URL(url);
    } catch {
      errors.push({
        field: 'url',
        message: 'Invalid URL format',
        value: url,
        rule: 'url_format',
      });
    }

    return errors;
  }

  /**
   * Validate numeric range
   */
  public validateNumericRange(
    value: number,
    field: string,
    min?: number,
    max?: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (min !== undefined && value < min) {
      errors.push({
        field,
        message: `${field} must be at least ${min}`,
        value,
        rule: 'min_value',
      });
    }

    if (max !== undefined && value > max) {
      errors.push({
        field,
        message: `${field} must be at most ${max}`,
        value,
        rule: 'max_value',
      });
    }

    return errors;
  }

  /**
   * Validate string length
   */
  public validateStringLength(
    value: string,
    field: string,
    minLength?: number,
    maxLength?: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (minLength !== undefined && value.length < minLength) {
      errors.push({
        field,
        message: `${field} must be at least ${minLength} characters`,
        value,
        rule: 'min_length',
      });
    }

    if (maxLength !== undefined && value.length > maxLength) {
      errors.push({
        field,
        message: `${field} must be at most ${maxLength} characters`,
        value,
        rule: 'max_length',
      });
    }

    return errors;
  }

  /**
   * Validate array length
   */
  public validateArrayLength(
    array: any[],
    field: string,
    minLength?: number,
    maxLength?: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (minLength !== undefined && array.length < minLength) {
      errors.push({
        field,
        message: `${field} must have at least ${minLength} items`,
        value: array.length,
        rule: 'min_array_length',
      });
    }

    if (maxLength !== undefined && array.length > maxLength) {
      errors.push({
        field,
        message: `${field} must have at most ${maxLength} items`,
        value: array.length,
        rule: 'max_array_length',
      });
    }

    return errors;
  }

  /**
   * Validate enum value
   */
  public validateEnum(value: any, field: string, allowedValues: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!allowedValues.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${allowedValues.join(', ')}`,
        value,
        rule: 'enum_value',
      });
    }

    return errors;
  }

  /**
   * Validate model training data
   */
  public validateModelTrainingData(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    const requiredFields = ['modelId', 'modelName', 'version', 'metadata', 'schema', 'connections'];
    errors.push(...this.validateRequiredFields(data, requiredFields));

    // Validate metadata
    if (data.metadata) {
      const metadataRequired = [
        'algorithm',
        'framework',
        'accuracy',
        'precision',
        'recall',
        'f1Score',
      ];
      errors.push(...this.validateRequiredFields(data.metadata, metadataRequired));

      // Validate accuracy range
      if (data.metadata.accuracy !== undefined) {
        errors.push(...this.validateNumericRange(data.metadata.accuracy, 'accuracy', 0, 1));
      }

      // Validate precision range
      if (data.metadata.precision !== undefined) {
        errors.push(...this.validateNumericRange(data.metadata.precision, 'precision', 0, 1));
      }

      // Validate recall range
      if (data.metadata.recall !== undefined) {
        errors.push(...this.validateNumericRange(data.metadata.recall, 'recall', 0, 1));
      }

      // Validate F1 score range
      if (data.metadata.f1Score !== undefined) {
        errors.push(...this.validateNumericRange(data.metadata.f1Score, 'f1Score', 0, 1));
      }
    }

    // Validate schema
    if (data.schema) {
      const schemaRequired = ['inputSchema', 'outputSchema', 'dataTypes'];
      errors.push(...this.validateRequiredFields(data.schema, schemaRequired));
    }

    // Validate connections
    if (data.connections) {
      const connectionsRequired = ['parentModels', 'childModels', 'dependencies'];
      errors.push(...this.validateRequiredFields(data.connections, connectionsRequired));
    }

    return errors;
  }

  /**
   * Validate client data
   */
  public validateClientData(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    const requiredFields = ['email', 'name', 'planId'];
    errors.push(...this.validateRequiredFields(data, requiredFields));

    // Validate email
    if (data.email) {
      errors.push(...this.validateEmail(data.email));
    }

    // Validate plan ID
    if (data.planId) {
      const allowedPlans = ['starter', 'professional', 'enterprise'];
      errors.push(...this.validateEnum(data.planId, 'planId', allowedPlans));
    }

    // Validate name length
    if (data.name) {
      errors.push(...this.validateStringLength(data.name, 'name', 1, 100));
    }

    return errors;
  }

  /**
   * Validate Cursor AI request
   */
  public validateCursorAIRequest(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    const requiredFields = ['prompt', 'context', 'options'];
    errors.push(...this.validateRequiredFields(data, requiredFields));

    // Validate prompt length
    if (data.prompt) {
      errors.push(...this.validateStringLength(data.prompt, 'prompt', 1, 10000));
    }

    // Validate context
    if (data.context) {
      const contextRequired = ['language'];
      errors.push(...this.validateRequiredFields(data.context, contextRequired));

      // Validate language
      if (data.context.language) {
        const allowedLanguages = [
          'javascript',
          'typescript',
          'python',
          'solidity',
          'java',
          'csharp',
        ];
        errors.push(...this.validateEnum(data.context.language, 'language', allowedLanguages));
      }
    }

    // Validate options
    if (data.options) {
      const optionsRequired = [
        'includeComments',
        'includeTests',
        'optimizeForPerformance',
        'followBestPractices',
      ];
      errors.push(...this.validateRequiredFields(data.options, optionsRequired));
    }

    return errors;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): any {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    const recentErrors = this.errorLog.filter(error => error.timestamp > last24Hours);
    const weeklyErrors = this.errorLog.filter(error => error.timestamp > last7Days);

    const errorCodes = this.errorLog.reduce(
      (acc, error) => {
        acc[error.code] = (acc[error.code] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      weeklyErrors: weeklyErrors.length,
      errorCodes,
      mostCommonError: Object.entries(errorCodes).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None',
    };
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(limit: number = 10): ErrorDetails[] {
    return this.errorLog.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Export error log
   */
  public exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
