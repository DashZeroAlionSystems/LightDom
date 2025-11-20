/**
 * OllamaCodebaseIntegration - LLM integration with indexed codebase
 * 
 * Features:
 * - Context-aware code questions and answers
 * - Intelligent code generation with codebase context
 * - Pattern analysis and suggestions
 * - Documentation generation
 * - Code review with best practices
 * - Automatic context selection and chunking
 * 
 * Supported Models:
 * - deepseek-coder:33b (recommended)
 * - codellama:34b
 * - mistral:7b
 * - llama3:70b
 * 
 * @module OllamaCodebaseIntegration
 */

import { EventEmitter } from 'events';
import type { CodebaseIndex, IndexedFile } from './CodebaseIndexer';

/**
 * Ollama API configuration
 */
export interface OllamaConfig {
  ollamaUrl: string;
  model: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

/**
 * Question request
 */
export interface QuestionRequest {
  question: string;
  contextFiles?: string[];
  includeDocumentation?: boolean;
  maxContext?: number;
}

/**
 * Question response
 */
export interface QuestionResponse {
  answer: string;
  explanation: string;
  references: FileReference[];
  confidence: number;
  model: string;
}

/**
 * File reference in response
 */
export interface FileReference {
  file: string;
  relevance: number;
  excerpt?: string;
  lineNumber?: number;
}

/**
 * Code generation request
 */
export interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  contextFiles?: string[];
  includeTests?: boolean;
  includeDocumentation?: boolean;
}

/**
 * Code generation response
 */
export interface CodeGenerationResponse {
  code: string;
  language: string;
  explanation: string;
  imports: string[];
  tests?: string;
  documentation?: string;
  confidence: number;
}

/**
 * Pattern analysis request
 */
export interface PatternAnalysisRequest {
  file: string;
  analyzeType: 'all' | 'good' | 'bad' | 'optimization';
}

/**
 * Pattern analysis response
 */
export interface PatternAnalysisResponse {
  patterns: AnalyzedPattern[];
  suggestions: string[];
  score: number;
}

/**
 * Analyzed pattern
 */
export interface AnalyzedPattern {
  type: string;
  description: string;
  quality: 'good' | 'bad' | 'neutral';
  lineNumber?: number;
  suggestion?: string;
}

/**
 * LLM query to database
 */
export interface LLMQuery {
  id?: number;
  question: string;
  answer: string;
  references: string[];
  confidence: number;
  model: string;
  created_at?: Date;
}

/**
 * OllamaCodebaseIntegration - Main integration class
 */
export class OllamaCodebaseIntegration extends EventEmitter {
  private config: OllamaConfig;
  private codebaseIndex: CodebaseIndex;
  private modelCache: Map<string, any>;

  constructor(config: OllamaConfig, codebaseIndex: CodebaseIndex) {
    super();
    this.config = {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      ...config,
    };
    this.codebaseIndex = codebaseIndex;
    this.modelCache = new Map();
  }

  /**
   * Ask a question about the codebase
   */
  async askQuestion(request: QuestionRequest): Promise<QuestionResponse> {
    this.emit('question:started', { question: request.question });

    try {
      // Find relevant files
      const relevantFiles = this.findRelevantFiles(
        request.question,
        request.contextFiles
      );

      this.emit('question:context-selected', { 
        files: relevantFiles.map(f => f.path) 
      });

      // Build context
      const context = await this.buildContext(relevantFiles, {
        maxTokens: request.maxContext || 4000,
        includeDocumentation: request.includeDocumentation,
      });

      // Generate prompt
      const prompt = this.generateQuestionPrompt(request.question, context);

      // Call Ollama
      const response = await this.callOllama(prompt);

      // Parse response
      const answer: QuestionResponse = {
        answer: response,
        explanation: this.extractExplanation(response),
        references: relevantFiles.map(f => ({
          file: f.path,
          relevance: 0.8,
        })),
        confidence: this.calculateConfidence(response),
        model: this.config.model,
      };

      this.emit('question:completed', { question: request.question });
      return answer;

    } catch (error) {
      this.emit('question:error', { error });
      throw error;
    }
  }

  /**
   * Generate code with codebase context
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    this.emit('generation:started', { prompt: request.prompt });

    try {
      // Find relevant examples from codebase
      const examples = this.findCodeExamples(
        request.prompt,
        request.contextFiles
      );

      // Build context with examples
      const context = await this.buildContext(examples, {
        maxTokens: 3000,
        includeDocumentation: request.includeDocumentation,
      });

      // Generate prompt
      const prompt = this.generateCodePrompt(request, context);

      // Call Ollama
      const response = await this.callOllama(prompt);

      // Parse generated code
      const code = this.extractCode(response);
      const imports = this.extractImports(code);

      const result: CodeGenerationResponse = {
        code,
        language: request.language || 'typescript',
        explanation: this.extractExplanation(response),
        imports,
        confidence: this.calculateConfidence(response),
      };

      // Generate tests if requested
      if (request.includeTests) {
        result.tests = await this.generateTests(code);
      }

      // Generate documentation if requested
      if (request.includeDocumentation) {
        result.documentation = await this.generateDocumentation(code);
      }

      this.emit('generation:completed', { prompt: request.prompt });
      return result;

    } catch (error) {
      this.emit('generation:error', { error });
      throw error;
    }
  }

  /**
   * Analyze patterns in a file
   */
  async analyzePatterns(request: PatternAnalysisRequest): Promise<PatternAnalysisResponse> {
    this.emit('analysis:started', { file: request.file });

    try {
      const file = this.codebaseIndex.files.get(request.file);
      if (!file) {
        throw new Error(`File not found in index: ${request.file}`);
      }

      // Build prompt for pattern analysis
      const prompt = this.generatePatternAnalysisPrompt(file, request.analyzeType);

      // Call Ollama
      const response = await this.callOllama(prompt);

      // Parse patterns
      const patterns = this.parsePatterns(response);
      const suggestions = this.parseSuggestions(response);
      const score = this.calculatePatternScore(patterns);

      const result: PatternAnalysisResponse = {
        patterns,
        suggestions,
        score,
      };

      this.emit('analysis:completed', { file: request.file, score });
      return result;

    } catch (error) {
      this.emit('analysis:error', { error });
      throw error;
    }
  }

  /**
   * Review code with best practices
   */
  async reviewCode(filePath: string): Promise<{
    issues: string[];
    suggestions: string[];
    score: number;
  }> {
    const file = this.codebaseIndex.files.get(filePath);
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    const prompt = `
Review the following TypeScript code for best practices, potential issues, and improvements:

File: ${file.relativePath}
Language: ${file.language}
Lines: ${file.lines}

Functions: ${file.functions.map(f => f.name).join(', ')}
Classes: ${file.classes.map(c => c.name).join(', ')}

Analyze for:
1. Code quality and maintainability
2. Performance issues
3. Security vulnerabilities
4. TypeScript best practices
5. Error handling
6. Testing considerations

Provide:
- List of issues found
- Suggestions for improvement
- Overall quality score (0-100)
`;

    const response = await this.callOllama(prompt);

    return {
      issues: this.parseIssues(response),
      suggestions: this.parseSuggestions(response),
      score: this.extractScore(response),
    };
  }

  /**
   * Find relevant files for a question
   */
  private findRelevantFiles(
    question: string,
    contextFiles?: string[]
  ): IndexedFile[] {
    const files: IndexedFile[] = [];

    // If specific files requested, use those
    if (contextFiles && contextFiles.length > 0) {
      for (const pattern of contextFiles) {
        for (const [filePath, file] of this.codebaseIndex.files) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          if (regex.test(filePath)) {
            files.push(file);
          }
        }
      }
      return files;
    }

    // Otherwise, find files by keyword matching
    const keywords = this.extractKeywords(question);
    
    for (const [_, file] of this.codebaseIndex.files) {
      let relevance = 0;

      // Check file path
      for (const keyword of keywords) {
        if (file.relativePath.toLowerCase().includes(keyword.toLowerCase())) {
          relevance += 2;
        }
      }

      // Check function names
      for (const func of file.functions) {
        for (const keyword of keywords) {
          if (func.name.toLowerCase().includes(keyword.toLowerCase())) {
            relevance += 1;
          }
        }
      }

      // Check class names
      for (const cls of file.classes) {
        for (const keyword of keywords) {
          if (cls.name.toLowerCase().includes(keyword.toLowerCase())) {
            relevance += 1;
          }
        }
      }

      if (relevance > 0) {
        files.push(file);
      }
    }

    // Sort by relevance and take top 10
    return files.slice(0, 10);
  }

  /**
   * Extract keywords from question
   */
  private extractKeywords(question: string): string[] {
    // Remove common words
    const stopWords = new Set([
      'how', 'does', 'the', 'work', 'what', 'is', 'a', 'an', 
      'do', 'can', 'where', 'why', 'when', 'which'
    ]);

    const words = question
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    return [...new Set(words)];
  }

  /**
   * Find code examples from codebase
   */
  private findCodeExamples(
    prompt: string,
    contextFiles?: string[]
  ): IndexedFile[] {
    // Similar to findRelevantFiles but focused on code patterns
    return this.findRelevantFiles(prompt, contextFiles);
  }

  /**
   * Build context from files
   */
  private async buildContext(
    files: IndexedFile[],
    options: {
      maxTokens: number;
      includeDocumentation?: boolean;
    }
  ): Promise<string> {
    let context = '';
    let tokenCount = 0;

    for (const file of files) {
      const fileContext = this.buildFileContext(file, options.includeDocumentation);
      const fileTokens = this.estimateTokens(fileContext);

      if (tokenCount + fileTokens > options.maxTokens) {
        break;
      }

      context += fileContext + '\n\n';
      tokenCount += fileTokens;
    }

    return context;
  }

  /**
   * Build context for a single file
   */
  private buildFileContext(file: IndexedFile, includeDocumentation?: boolean): string {
    let context = `File: ${file.relativePath}\n`;
    context += `Language: ${file.language}\n`;
    
    if (file.functions.length > 0) {
      context += `Functions: ${file.functions.map(f => f.name).join(', ')}\n`;
    }

    if (file.classes.length > 0) {
      context += `Classes: ${file.classes.map(c => c.name).join(', ')}\n`;
    }

    if (file.imports.length > 0) {
      context += `Imports: ${file.imports.slice(0, 5).join(', ')}\n`;
    }

    if (includeDocumentation && file.documentation.length > 0) {
      const docs = file.documentation
        .filter(d => d.type === 'jsdoc')
        .slice(0, 3)
        .map(d => d.content)
        .join('\n');
      if (docs) {
        context += `Documentation:\n${docs}\n`;
      }
    }

    return context;
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate question prompt
   */
  private generateQuestionPrompt(question: string, context: string): string {
    return `You are an expert software developer analyzing a codebase.

Context from codebase:
${context}

Question: ${question}

Provide a detailed answer based on the codebase context. Include:
1. Direct answer to the question
2. Explanation with references to specific files/functions
3. Code examples if relevant

Answer:`;
  }

  /**
   * Generate code generation prompt
   */
  private generateCodePrompt(
    request: CodeGenerationRequest,
    context: string
  ): string {
    return `You are an expert ${request.language || 'TypeScript'} developer.

Context from existing codebase:
${context}

Task: ${request.prompt}

Generate production-ready code following the patterns and style from the codebase context.
Include necessary imports and clear comments.

Code:`;
  }

  /**
   * Generate pattern analysis prompt
   */
  private generatePatternAnalysisPrompt(
    file: IndexedFile,
    analyzeType: string
  ): string {
    return `Analyze this ${file.language} file for code patterns:

File: ${file.relativePath}
Functions: ${file.functions.map(f => f.name).join(', ')}
Classes: ${file.classes.map(c => c.name).join(', ')}

Focus on: ${analyzeType} patterns

Identify:
1. Design patterns used (Singleton, Factory, Observer, etc.)
2. Code quality patterns (good practices)
3. Anti-patterns or code smells
4. Optimization opportunities

Provide patterns found and suggestions for improvement.

Analysis:`;
  }

  /**
   * Call Ollama API
   */
  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';

    } catch (error) {
      this.emit('ollama:error', { error });
      throw new Error(`Failed to call Ollama: ${error}`);
    }
  }

  /**
   * Extract explanation from response
   */
  private extractExplanation(response: string): string {
    // Extract explanation section if present
    const match = response.match(/Explanation:?\s*([\s\S]+)/i);
    return match ? match[1].trim() : response;
  }

  /**
   * Extract code from response
   */
  private extractCode(response: string): string {
    // Extract code blocks
    const codeBlockMatch = response.match(/```(?:\w+)?\s*([\s\S]+?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // If no code block, return entire response
    return response.trim();
  }

  /**
   * Extract imports from code
   */
  private extractImports(code: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(response: string): number {
    // Simple heuristic: longer, more detailed responses = higher confidence
    const words = response.split(/\s+/).length;
    if (words < 50) return 0.5;
    if (words < 100) return 0.7;
    if (words < 200) return 0.8;
    return 0.9;
  }

  /**
   * Parse patterns from response
   */
  private parsePatterns(response: string): AnalyzedPattern[] {
    const patterns: AnalyzedPattern[] = [];
    
    // Simple parsing - would be more sophisticated in production
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.includes('pattern') || line.includes('Pattern')) {
        patterns.push({
          type: 'detected',
          description: line.trim(),
          quality: line.toLowerCase().includes('good') ? 'good' : 'neutral',
        });
      }
    }

    return patterns;
  }

  /**
   * Parse suggestions from response
   */
  private parseSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    
    // Look for suggestion sections
    const match = response.match(/Suggestions?:?\s*([\s\S]+?)(?:\n\n|$)/i);
    if (match) {
      const suggestionText = match[1];
      const lines = suggestionText.split('\n').filter(l => l.trim());
      suggestions.push(...lines.map(l => l.replace(/^[-*]\s*/, '').trim()));
    }

    return suggestions;
  }

  /**
   * Parse issues from response
   */
  private parseIssues(response: string): string[] {
    const issues: string[] = [];
    
    const match = response.match(/Issues?:?\s*([\s\S]+?)(?:\n\n|$)/i);
    if (match) {
      const issueText = match[1];
      const lines = issueText.split('\n').filter(l => l.trim());
      issues.push(...lines.map(l => l.replace(/^[-*]\s*/, '').trim()));
    }

    return issues;
  }

  /**
   * Extract score from response
   */
  private extractScore(response: string): number {
    const match = response.match(/score:?\s*(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 70; // Default score
  }

  /**
   * Calculate pattern score
   */
  private calculatePatternScore(patterns: AnalyzedPattern[]): number {
    if (patterns.length === 0) return 50;

    const goodPatterns = patterns.filter(p => p.quality === 'good').length;
    const badPatterns = patterns.filter(p => p.quality === 'bad').length;

    const score = 50 + (goodPatterns * 10) - (badPatterns * 15);
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate tests for code
   */
  private async generateTests(code: string): Promise<string> {
    const prompt = `Generate comprehensive unit tests for this code:

${code}

Use modern testing framework (Jest/Vitest).
Include:
- Happy path tests
- Edge cases
- Error handling
- Mock dependencies if needed

Tests:`;

    const response = await this.callOllama(prompt);
    return this.extractCode(response);
  }

  /**
   * Generate documentation for code
   */
  private async generateDocumentation(code: string): Promise<string> {
    const prompt = `Generate comprehensive JSDoc documentation for this code:

${code}

Include:
- Function/class descriptions
- Parameter descriptions
- Return value descriptions
- Usage examples
- Type information

Documentation:`;

    const response = await this.callOllama(prompt);
    return response.trim();
  }
}

export default OllamaCodebaseIntegration;
