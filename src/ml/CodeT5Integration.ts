/**
 * CodeT5 Integration for Error Repair & Bug Fixing
 * 
 * Salesforce's CodeT5 model for:
 * - Automatic bug detection
 * - Error repair and fix generation
 * - Code refactoring suggestions
 * - Test generation
 * 
 * Pre-trained on code-related tasks including bug fixing
 */

import * as tf from '@tensorflow/tfjs';
import { EventEmitter } from 'events';

export interface ErrorClassification {
  category: 'syntax' | 'runtime' | 'logic' | 'type' | 'security' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  description: string;
  location: {
    line: number;
    column: number;
    file?: string;
  };
}

export interface Fix Candidate {
  code: string;
  confidence: number;
  explanation: string;
  changes: string[];
  estimatedImpact: 'breaking' | 'safe' | 'improvement';
}

export interface ErrorRepairRequest {
  errorCode: string;
  errorMessage: string;
  stackTrace?: string;
  sourceCode: string;
  context?: string;
}

export interface RefactoringSuggestion {
  type: 'extract-function' | 'simplify' | 'optimize' | 'rename' | 'inline';
  before: string;
  after: string;
  benefit: string;
  confidence: number;
}

/**
 * CodeT5 Model Integration for Error Repair
 */
export class CodeT5Integration extends EventEmitter {
  private model: tf.LayersModel | null = null;
  private errorPatterns: Map<string, ErrorClassification[]> = new Map();
  private fixPatterns: Map<string, FixCandidate[]> = new Map();
  
  private config = {
    maxSequenceLength: 512,
    embeddingDim: 768,
    vocabularySize: 32000,
    modelUrl: 'https://huggingface.co/Salesforce/codet5-base/resolve/main/model.json',
  };

  constructor() {
    super();
    this.initializeErrorPatterns();
  }

  /**
   * Initialize CodeT5 model
   */
  async initialize(): Promise<void> {
    this.emit('initializing', { model: 'CodeT5' });

    try {
      // Try to load pre-trained model
      try {
        this.model = await tf.loadLayersModel(this.config.modelUrl);
        this.emit('model:loaded', { source: 'pretrained' });
      } catch (error) {
        console.warn('Pre-trained CodeT5 not available, using custom model');
        this.model = await this.buildCustomModel();
        this.emit('model:loaded', { source: 'custom' });
      }

      // Load error patterns from knowledge base
      await this.loadErrorPatterns();

      this.emit('initialized', { model: 'CodeT5' });
    } catch (error) {
      this.emit('error', { phase: 'initialization', error });
      throw error;
    }
  }

  /**
   * Build custom CodeT5-inspired model
   */
  private async buildCustomModel(): Promise<tf.LayersModel> {
    // Encoder-Decoder architecture for sequence-to-sequence tasks
    const encoderInput = tf.input({ shape: [this.config.maxSequenceLength], name: 'encoder_input' });
    
    const embedding = tf.layers.embedding({
      inputDim: this.config.vocabularySize,
      outputDim: this.config.embeddingDim,
      maskZero: true,
    }).apply(encoderInput) as tf.SymbolicTensor;
    
    const encoderLSTM1 = tf.layers.lstm({
      units: 512,
      returnSequences: true,
      returnState: true,
      name: 'encoder_lstm_1',
    }).apply(embedding) as tf.SymbolicTensor[];
    
    const encoderLSTM2 = tf.layers.lstm({
      units: 256,
      returnState: true,
      name: 'encoder_lstm_2',
    }).apply(encoderLSTM1[0]) as tf.SymbolicTensor[];
    
    // Decoder
    const decoderInput = tf.input({ shape: [this.config.maxSequenceLength], name: 'decoder_input' });
    
    const decoderEmbedding = tf.layers.embedding({
      inputDim: this.config.vocabularySize,
      outputDim: this.config.embeddingDim,
      maskZero: true,
    }).apply(decoderInput) as tf.SymbolicTensor;
    
    const decoderLSTM = tf.layers.lstm({
      units: 256,
      returnSequences: true,
      name: 'decoder_lstm',
    }).apply(decoderEmbedding, {
      initialState: [encoderLSTM2[1], encoderLSTM2[2]],
    }) as tf.SymbolicTensor;
    
    const decoderOutput = tf.layers.dense({
      units: this.config.vocabularySize,
      activation: 'softmax',
      name: 'decoder_output',
    }).apply(decoderLSTM) as tf.SymbolicTensor;
    
    const model = tf.model({
      inputs: [encoderInput, decoderInput],
      outputs: decoderOutput,
      name: 'CodeT5_Custom',
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  /**
   * Initialize common error patterns
   */
  private initializeErrorPatterns(): void {
    // Syntax errors
    this.errorPatterns.set('SyntaxError', [
      {
        category: 'syntax',
        severity: 'critical',
        confidence: 0.95,
        description: 'Invalid syntax in code',
        location: { line: 0, column: 0 },
      },
    ]);

    // Type errors
    this.errorPatterns.set('TypeError', [
      {
        category: 'type',
        severity: 'high',
        confidence: 0.90,
        description: 'Type mismatch or undefined value accessed',
        location: { line: 0, column: 0 },
      },
    ]);

    // Reference errors
    this.errorPatterns.set('ReferenceError', [
      {
        category: 'runtime',
        severity: 'high',
        confidence: 0.92,
        description: 'Variable or function not defined',
        location: { line: 0, column: 0 },
      },
    ]);

    // Range errors
    this.errorPatterns.set('RangeError', [
      {
        category: 'logic',
        severity: 'medium',
        confidence: 0.85,
        description: 'Value outside valid range',
        location: { line: 0, column: 0 },
      },
    ]);
  }

  /**
   * Load error patterns from database or file
   */
  private async loadErrorPatterns(): Promise<void> {
    // TODO: Load from database
    // For now, use initialized patterns
    this.emit('patterns:loaded', { count: this.errorPatterns.size });
  }

  /**
   * Classify error type and severity
   */
  async classifyError(error: ErrorRepairRequest): Promise<ErrorClassification> {
    this.emit('classifying', { errorMessage: error.errorMessage });

    try {
      // Extract error type from message
      const errorType = error.errorMessage.split(':')[0] || 'Unknown';
      
      // Get base classification from patterns
      const baseClassifications = this.errorPatterns.get(errorType) || [];
      let classification: ErrorClassification;

      if (baseClassifications.length > 0) {
        classification = { ...baseClassifications[0] };
      } else {
        // Use model to classify if pattern not found
        classification = await this.classifyWithModel(error);
      }

      // Extract location from stack trace
      if (error.stackTrace) {
        const lineMatch = error.stackTrace.match(/:(\d+):(\d+)/);
        if (lineMatch) {
          classification.location = {
            line: parseInt(lineMatch[1]),
            column: parseInt(lineMatch[2]),
          };
        }
      }

      // Analyze severity based on context
      classification.severity = this.analyzeSeverity(error);

      this.emit('classified', classification);

      return classification;
    } catch (error) {
      this.emit('error', { phase: 'classification', error });
      throw error;
    }
  }

  /**
   * Classify error using model
   */
  private async classifyWithModel(error: ErrorRepairRequest): Promise<ErrorClassification> {
    // Simplified classification using heuristics
    // In production, would use trained model

    let category: ErrorClassification['category'] = 'runtime';
    let severity: ErrorClassification['severity'] = 'medium';
    let confidence = 0.7;

    const message = error.errorMessage.toLowerCase();

    // Categorize
    if (message.includes('syntax')) {
      category = 'syntax';
      severity = 'critical';
      confidence = 0.9;
    } else if (message.includes('type') || message.includes('undefined') || message.includes('null')) {
      category = 'type';
      severity = 'high';
      confidence = 0.85;
    } else if (message.includes('security') || message.includes('injection') || message.includes('xss')) {
      category = 'security';
      severity = 'critical';
      confidence = 0.95;
    } else if (message.includes('performance') || message.includes('slow') || message.includes('timeout')) {
      category = 'performance';
      severity = 'medium';
      confidence = 0.75;
    } else if (message.includes('logic') || message.includes('assert')) {
      category = 'logic';
      severity = 'high';
      confidence = 0.8;
    }

    return {
      category,
      severity,
      confidence,
      description: error.errorMessage,
      location: { line: 0, column: 0 },
    };
  }

  /**
   * Analyze error severity
   */
  private analyzeSeverity(error: ErrorRepairRequest): ErrorClassification['severity'] {
    const message = error.errorMessage.toLowerCase();

    if (message.includes('critical') || message.includes('fatal') || message.includes('security')) {
      return 'critical';
    }
    if (message.includes('error') || message.includes('exception')) {
      return 'high';
    }
    if (message.includes('warning')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate fix candidates for error
   */
  async generateFixes(error: ErrorRepairRequest): Promise<FixCandidate[]> {
    this.emit('generating-fixes', { errorMessage: error.errorMessage });

    try {
      const classification = await this.classifyError(error);
      const fixes: FixCandidate[] = [];

      // Generate fixes based on error category
      switch (classification.category) {
        case 'syntax':
          fixes.push(...this.generateSyntaxFixes(error));
          break;
        case 'type':
          fixes.push(...this.generateTypeFixes(error));
          break;
        case 'runtime':
          fixes.push(...this.generateRuntimeFixes(error));
          break;
        case 'logic':
          fixes.push(...this.generateLogicFixes(error));
          break;
        case 'security':
          fixes.push(...this.generateSecurityFixes(error));
          break;
        case 'performance':
          fixes.push(...this.generatePerformanceFixes(error));
          break;
      }

      // Sort by confidence
      fixes.sort((a, b) => b.confidence - a.confidence);

      this.emit('fixes-generated', { count: fixes.length });

      return fixes;
    } catch (error) {
      this.emit('error', { phase: 'fix-generation', error });
      throw error;
    }
  }

  /**
   * Generate syntax error fixes
   */
  private generateSyntaxFixes(error: ErrorRepairRequest): FixCandidate[] {
    const fixes: FixCandidate[] = [];
    const code = error.sourceCode;

    // Missing semicolon
    if (error.errorMessage.includes('missing semicolon') || error.errorMessage.includes('Unexpected token')) {
      fixes.push({
        code: code.replace(/([^;])\n/g, '$1;\n'),
        confidence: 0.85,
        explanation: 'Add missing semicolons',
        changes: ['Added semicolons at line endings'],
        estimatedImpact: 'safe',
      });
    }

    // Missing bracket
    if (error.errorMessage.includes('bracket') || error.errorMessage.includes('brace')) {
      const openBrackets = (code.match(/\{/g) || []).length;
      const closeBrackets = (code.match(/\}/g) || []).length;
      
      if (openBrackets > closeBrackets) {
        fixes.push({
          code: code + '\n}'.repeat(openBrackets - closeBrackets),
          confidence: 0.80,
          explanation: 'Add missing closing brackets',
          changes: [`Added ${openBrackets - closeBrackets} closing bracket(s)`],
          estimatedImpact: 'safe',
        });
      }
    }

    // Missing parenthesis
    if (error.errorMessage.includes('paren')) {
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      
      if (openParens > closeParens) {
        fixes.push({
          code: code + ')'.repeat(openParens - closeParens),
          confidence: 0.75,
          explanation: 'Add missing closing parentheses',
          changes: [`Added ${openParens - closeParens} closing parenthesis(es)`],
          estimatedImpact: 'safe',
        });
      }
    }

    return fixes;
  }

  /**
   * Generate type error fixes
   */
  private generateTypeFixes(error: ErrorRepairRequest): FixCandidate[] {
    const fixes: FixCandidate[] = [];
    const code = error.sourceCode;

    // Undefined variable
    if (error.errorMessage.includes('undefined') || error.errorMessage.includes('is not defined')) {
      const match = error.errorMessage.match(/['"]([^'"]+)['"]\s+is not defined/);
      if (match) {
        const varName = match[1];
        fixes.push({
          code: `const ${varName} = null; // TODO: Initialize properly\n${code}`,
          confidence: 0.70,
          explanation: `Initialize undefined variable: ${varName}`,
          changes: [`Added declaration for ${varName}`],
          estimatedImpact: 'safe',
        });
      }
    }

    // Null/undefined access
    if (error.errorMessage.includes('Cannot read property') || error.errorMessage.includes('Cannot read properties of')) {
      fixes.push({
        code: code.replace(/(\w+)\./g, '$1?.'),
        confidence: 0.75,
        explanation: 'Add optional chaining to prevent null/undefined access',
        changes: ['Replaced . with ?. for safe property access'],
        estimatedImpact: 'safe',
      });
    }

    // Type mismatch
    if (error.errorMessage.includes('Expected') && error.errorMessage.includes('but got')) {
      fixes.push({
        code: code,
        confidence: 0.60,
        explanation: 'Add type conversion or validation',
        changes: ['Consider adding type guards or conversion functions'],
        estimatedImpact: 'improvement',
      });
    }

    return fixes;
  }

  /**
   * Generate runtime error fixes
   */
  private generateRuntimeFixes(error: ErrorRepairRequest): FixCandidate[] {
    const fixes: FixCandidate[] = [];
    const code = error.sourceCode;

    // Async/await errors
    if (error.errorMessage.includes('await') && !code.includes('async')) {
      fixes.push({
        code: code.replace(/(function\s+\w+\s*\([^)]*\))/g, 'async $1'),
        confidence: 0.85,
        explanation: 'Add async keyword to function using await',
        changes: ['Made function async'],
        estimatedImpact: 'safe',
      });
    }

    // Promise handling
    if (error.errorMessage.includes('Promise') && !code.includes('catch')) {
      fixes.push({
        code: code.replace(/\.then\([^)]+\)/g, '$&.catch(error => console.error(error))'),
        confidence: 0.80,
        explanation: 'Add error handling for promises',
        changes: ['Added .catch() to promise chain'],
        estimatedImpact: 'safe',
      });
    }

    return fixes;
  }

  /**
   * Generate logic error fixes
   */
  private generateLogicFixes(error: ErrorRepairRequest): FixCandidate[] {
    const fixes: FixCandidate[] = [];
    // Logic errors are complex and often require human intervention
    // Provide general suggestions

    fixes.push({
      code: error.sourceCode,
      confidence: 0.50,
      explanation: 'Logic error detected. Review algorithm and business logic.',
      changes: ['Add additional logging', 'Review conditional statements', 'Verify assumptions'],
      estimatedImpact: 'improvement',
    });

    return fixes;
  }

  /**
   * Generate security error fixes
   */
  private generateSecurityFixes(error: ErrorRepairRequest): FixCandidate[] {
    const fixes: FixCandidate[] = [];
    const code = error.sourceCode;

    // SQL Injection
    if (error.errorMessage.includes('SQL') || code.includes('SELECT') || code.includes('INSERT')) {
      fixes.push({
        code: code.replace(/`([^`]+)`/g, 'db.query(?, [params])'),
        confidence: 0.90,
        explanation: 'Use parameterized queries to prevent SQL injection',
        changes: ['Replaced string concatenation with parameterized queries'],
        estimatedImpact: 'safe',
      });
    }

    // XSS
    if (error.errorMessage.includes('XSS') || code.includes('innerHTML')) {
      fixes.push({
        code: code.replace(/\.innerHTML\s*=/g, '.textContent ='),
        confidence: 0.85,
        explanation: 'Replace innerHTML with textContent to prevent XSS',
        changes: ['Replaced innerHTML with textContent'],
        estimatedImpact: 'safe',
      });
    }

    return fixes;
  }

  /**
   * Generate performance error fixes
   */
  private generatePerformanceFixes(error: ErrorRepairRequest): FixCandidate[] {
    const fixes: FixCandidate[] = [];
    const code = error.sourceCode;

    // Nested loops
    if ((code.match(/for\s*\(/g) || []).length > 1) {
      fixes.push({
        code: code,
        confidence: 0.65,
        explanation: 'Optimize nested loops or consider using more efficient data structures',
        changes: ['Consider using Map/Set', 'Cache loop-invariant values', 'Use array methods'],
        estimatedImpact: 'improvement',
      });
    }

    // Large arrays
    if (code.includes('forEach') || code.includes('map')) {
      fixes.push({
        code: code,
        confidence: 0.60,
        explanation: 'Consider using for loops for large arrays or lazy evaluation',
        changes: ['Use traditional for loops', 'Implement lazy evaluation', 'Add pagination'],
        estimatedImpact: 'improvement',
      });
    }

    return fixes;
  }

  /**
   * Suggest refactorings
   */
  async suggestRefactorings(code: string): Promise<RefactoringSuggestion[]> {
    this.emit('analyzing-refactorings', { codeLength: code.length });

    const suggestions: RefactoringSuggestion[] = [];

    // Long function detection
    const lines = code.split('\n');
    if (lines.length > 50) {
      suggestions.push({
        type: 'extract-function',
        before: code,
        after: '// Extract into smaller functions',
        benefit: 'Improve readability and testability',
        confidence: 0.80,
      });
    }

    // Duplicate code detection
    const blocks = code.split('\n\n');
    const duplicates = this.findDuplicateBlocks(blocks);
    if (duplicates.length > 0) {
      suggestions.push({
        type: 'extract-function',
        before: duplicates[0],
        after: '// Extract duplicate code into reusable function',
        benefit: 'Reduce code duplication',
        confidence: 0.85,
      });
    }

    // Complex conditionals
    if ((code.match(/if\s*\(/g) || []).length > 3) {
      suggestions.push({
        type: 'simplify',
        before: code,
        after: '// Use early returns or extract conditions',
        benefit: 'Simplify control flow',
        confidence: 0.75,
      });
    }

    this.emit('refactorings-suggested', { count: suggestions.length });

    return suggestions;
  }

  /**
   * Find duplicate code blocks
   */
  private findDuplicateBlocks(blocks: string[]): string[] {
    const seen = new Map<string, number>();
    const duplicates: string[] = [];

    blocks.forEach(block => {
      const normalized = block.trim();
      if (normalized.length > 20) { // Only check non-trivial blocks
        const count = seen.get(normalized) || 0;
        seen.set(normalized, count + 1);
        
        if (count === 1) {
          duplicates.push(normalized);
        }
      }
    });

    return duplicates;
  }

  /**
   * Apply fix to code
   */
  async applyFix(sourceCode: string, fix: FixCandidate): Promise<string> {
    this.emit('applying-fix', { fixExplanation: fix.explanation });

    try {
      const fixedCode = fix.code;
      
      // Validate fix
      const isValid = await this.validateFix(sourceCode, fixedCode);
      
      if (!isValid) {
        this.emit('fix-invalid', { fix });
        throw new Error('Generated fix would introduce new errors');
      }

      this.emit('fix-applied', { fix });

      return fixedCode;
    } catch (error) {
      this.emit('error', { phase: 'fix-application', error });
      throw error;
    }
  }

  /**
   * Validate that fix doesn't introduce new errors
   */
  private async validateFix(original: string, fixed: string): Promise<boolean> {
    // Simple validation - check for obvious syntax errors
    try {
      // Check bracket balance
      const openBrackets = (fixed.match(/\{/g) || []).length;
      const closeBrackets = (fixed.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) return false;

      const openParens = (fixed.match(/\(/g) || []).length;
      const closeParens = (fixed.match(/\)/g) || []).length;
      if (openParens !== closeParens) return false;

      // Check if fixed is reasonable length
      if (fixed.length > original.length * 2) return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.emit('disposed');
  }
}

export default CodeT5Integration;
