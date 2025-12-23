/**
 * Prompt Testing Utilities
 * 
 * Provides testing utilities for schema-based prompt workflows
 * Includes validation, mocking, and test runners
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EventEmitter } from 'events';

/**
 * JSON Schema validator with formats support
 */
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Prompt Test Result
 */
export class PromptTestResult {
  constructor(templateId, passed, details = {}) {
    this.templateId = templateId;
    this.passed = passed;
    this.executionTime = details.executionTime || 0;
    this.validationErrors = details.validationErrors || [];
    this.output = details.output || null;
    this.rawResponse = details.rawResponse || '';
    this.error = details.error || null;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      templateId: this.templateId,
      passed: this.passed,
      executionTime: this.executionTime,
      validationErrors: this.validationErrors,
      hasOutput: this.output !== null,
      error: this.error?.message || null,
      timestamp: this.timestamp
    };
  }
}

/**
 * Prompt Test Suite
 */
export class PromptTestSuite extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = options.name || 'Prompt Test Suite';
    this.tests = [];
    this.results = [];
    this.mockResponses = new Map();
    this.options = {
      timeout: options.timeout || 30000,
      retries: options.retries || 0,
      validateOutput: options.validateOutput !== false,
      verbose: options.verbose || false
    };
  }

  /**
   * Add a test case
   */
  addTest(testCase) {
    this.tests.push({
      id: testCase.id || `test-${this.tests.length + 1}`,
      name: testCase.name,
      templateId: testCase.templateId,
      variables: testCase.variables || {},
      expectedOutput: testCase.expectedOutput,
      outputSchema: testCase.outputSchema,
      assertions: testCase.assertions || [],
      timeout: testCase.timeout || this.options.timeout
    });
    return this;
  }

  /**
   * Set mock response for a template
   */
  setMockResponse(templateId, response) {
    this.mockResponses.set(templateId, response);
    return this;
  }

  /**
   * Run all tests
   */
  async runAll(promptEngine) {
    this.emit('suite-start', { name: this.name, testCount: this.tests.length });
    this.results = [];

    for (const test of this.tests) {
      const result = await this.runTest(test, promptEngine);
      this.results.push(result);
      this.emit('test-complete', result);
    }

    const summary = this.getSummary();
    this.emit('suite-complete', summary);
    return summary;
  }

  /**
   * Run a single test
   */
  async runTest(test, promptEngine) {
    const startTime = Date.now();
    
    try {
      // Get mock response if available
      let output;
      if (this.mockResponses.has(test.templateId)) {
        output = this.mockResponses.get(test.templateId);
      } else if (promptEngine) {
        // Execute actual prompt
        const prompt = promptEngine.generatePrompt(test.templateId, test.variables);
        output = await this.executePrompt(prompt, test.timeout);
      } else {
        throw new Error('No prompt engine provided and no mock response set');
      }

      // Parse output if it's a string
      let parsedOutput = output;
      if (typeof output === 'string') {
        try {
          parsedOutput = JSON.parse(output);
        } catch {
          // Keep as string if not valid JSON
        }
      }

      // Validate output against schema
      const validationErrors = [];
      if (this.options.validateOutput && test.outputSchema) {
        const validate = ajv.compile(test.outputSchema);
        const valid = validate(parsedOutput);
        if (!valid) {
          validationErrors.push(...(validate.errors || []).map(e => ({
            path: e.instancePath,
            message: e.message,
            keyword: e.keyword
          })));
        }
      }

      // Run custom assertions
      for (const assertion of test.assertions) {
        try {
          const assertionResult = assertion(parsedOutput);
          if (assertionResult === false) {
            validationErrors.push({
              type: 'assertion',
              message: assertion.name || 'Custom assertion failed'
            });
          }
        } catch (e) {
          validationErrors.push({
            type: 'assertion',
            message: e.message
          });
        }
      }

      const passed = validationErrors.length === 0;
      const executionTime = Date.now() - startTime;

      return new PromptTestResult(test.templateId, passed, {
        executionTime,
        validationErrors,
        output: parsedOutput,
        rawResponse: typeof output === 'string' ? output : JSON.stringify(output)
      });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      return new PromptTestResult(test.templateId, false, {
        executionTime,
        error,
        validationErrors: [{ type: 'execution', message: error.message }]
      });
    }
  }

  /**
   * Execute prompt (to be overridden or use mock)
   */
  async executePrompt(prompt, timeout) {
    // This is a placeholder - in real usage, connect to DeepSeek
    throw new Error('executePrompt not implemented - use setMockResponse or provide promptEngine');
  }

  /**
   * Get test summary
   */
  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalTime = this.results.reduce((sum, r) => sum + r.executionTime, 0);

    return {
      name: this.name,
      totalTests: this.tests.length,
      passed,
      failed,
      passRate: this.tests.length > 0 ? (passed / this.tests.length) * 100 : 0,
      totalExecutionTime: totalTime,
      averageExecutionTime: this.tests.length > 0 ? totalTime / this.tests.length : 0,
      results: this.results.map(r => r.toJSON()),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Prompt Validator
 * Validates prompts and their outputs against schemas
 */
export class PromptValidator {
  constructor() {
    this.schemaCache = new Map();
  }

  /**
   * Validate prompt template structure
   */
  validateTemplate(template) {
    const errors = [];

    if (!template.id) errors.push('Missing required field: id');
    if (!template.name) errors.push('Missing required field: name');
    if (!template.template) errors.push('Missing required field: template');

    // Check for variable placeholders
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const foundVariables = [];
    let match;
    while ((match = variablePattern.exec(template.template)) !== null) {
      foundVariables.push(match[1]);
    }

    // Verify declared variables match template variables
    if (template.variables) {
      const declaredVars = template.variables.map(v => v.name || v);
      const undeclared = foundVariables.filter(v => !declaredVars.includes(v));
      const unused = declaredVars.filter(v => !foundVariables.includes(v));

      if (undeclared.length > 0) {
        errors.push(`Undeclared variables in template: ${undeclared.join(', ')}`);
      }
      if (unused.length > 0) {
        errors.push(`Unused declared variables: ${unused.join(', ')}`);
      }
    }

    // Validate output schema if present
    if (template.outputSchema) {
      try {
        ajv.compile(template.outputSchema);
      } catch (e) {
        errors.push(`Invalid output schema: ${e.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate output against schema
   */
  validateOutput(output, schema) {
    let cacheKey = JSON.stringify(schema);
    let validate = this.schemaCache.get(cacheKey);
    
    if (!validate) {
      validate = ajv.compile(schema);
      this.schemaCache.set(cacheKey, validate);
    }

    const valid = validate(output);
    
    return {
      valid,
      errors: valid ? [] : (validate.errors || []).map(e => ({
        path: e.instancePath,
        message: e.message,
        keyword: e.keyword,
        params: e.params
      }))
    };
  }

  /**
   * Validate variable values
   */
  validateVariables(variables, variableDefinitions) {
    const errors = [];

    for (const def of variableDefinitions) {
      const value = variables[def.name];

      // Check required
      if (def.required && (value === undefined || value === null)) {
        errors.push(`Missing required variable: ${def.name}`);
        continue;
      }

      if (value === undefined) continue;

      // Check type
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (def.type && actualType !== def.type) {
        errors.push(`Variable ${def.name} should be ${def.type}, got ${actualType}`);
      }

      // Check validation rules
      if (def.validation) {
        if (def.validation.minLength && String(value).length < def.validation.minLength) {
          errors.push(`Variable ${def.name} is too short (min: ${def.validation.minLength})`);
        }
        if (def.validation.maxLength && String(value).length > def.validation.maxLength) {
          errors.push(`Variable ${def.name} is too long (max: ${def.validation.maxLength})`);
        }
        if (def.validation.pattern && !new RegExp(def.validation.pattern).test(String(value))) {
          errors.push(`Variable ${def.name} does not match pattern: ${def.validation.pattern}`);
        }
        if (def.validation.enum && !def.validation.enum.includes(value)) {
          errors.push(`Variable ${def.name} must be one of: ${def.validation.enum.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Mock Prompt Engine for testing
 */
export class MockPromptEngine {
  constructor() {
    this.templates = new Map();
    this.mockResponses = new Map();
    this.calls = [];
  }

  /**
   * Register a template
   */
  registerTemplate(template) {
    this.templates.set(template.id, template);
  }

  /**
   * Set mock response for a template
   */
  setMockResponse(templateId, response) {
    this.mockResponses.set(templateId, response);
  }

  /**
   * Generate prompt (tracks calls for assertions)
   */
  generatePrompt(templateId, variables, context) {
    const template = this.templates.get(templateId);
    
    this.calls.push({
      templateId,
      variables,
      context,
      timestamp: new Date().toISOString()
    });

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let prompt = template.template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = typeof value === 'object' ? JSON.stringify(value) : String(value);
      prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    }

    return prompt;
  }

  /**
   * Get mock response
   */
  getMockResponse(templateId) {
    return this.mockResponses.get(templateId);
  }

  /**
   * Get call history
   */
  getCalls() {
    return [...this.calls];
  }

  /**
   * Clear call history
   */
  clearCalls() {
    this.calls = [];
  }

  /**
   * Assert that template was called with specific variables
   */
  assertCalled(templateId, expectedVariables) {
    const call = this.calls.find(c => c.templateId === templateId);
    if (!call) {
      throw new Error(`Template ${templateId} was not called`);
    }
    if (expectedVariables) {
      for (const [key, value] of Object.entries(expectedVariables)) {
        if (JSON.stringify(call.variables[key]) !== JSON.stringify(value)) {
          throw new Error(`Expected variable ${key} to be ${JSON.stringify(value)}, got ${JSON.stringify(call.variables[key])}`);
        }
      }
    }
    return true;
  }
}

/**
 * Create a test assertion helper
 */
export const assertions = {
  hasProperty: (propPath) => (output) => {
    const parts = propPath.split('.');
    let current = output;
    for (const part of parts) {
      if (current === null || current === undefined || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    return true;
  },

  propertyEquals: (propPath, expectedValue) => (output) => {
    const parts = propPath.split('.');
    let current = output;
    for (const part of parts) {
      if (current === null || current === undefined) return false;
      current = current[part];
    }
    return JSON.stringify(current) === JSON.stringify(expectedValue);
  },

  propertyMatches: (propPath, pattern) => (output) => {
    const parts = propPath.split('.');
    let current = output;
    for (const part of parts) {
      if (current === null || current === undefined) return false;
      current = current[part];
    }
    return new RegExp(pattern).test(String(current));
  },

  arrayHasLength: (propPath, minLength, maxLength) => (output) => {
    const parts = propPath.split('.');
    let current = output;
    for (const part of parts) {
      if (current === null || current === undefined) return false;
      current = current[part];
    }
    if (!Array.isArray(current)) return false;
    if (minLength !== undefined && current.length < minLength) return false;
    if (maxLength !== undefined && current.length > maxLength) return false;
    return true;
  },

  isValidJSON: () => (output) => {
    if (typeof output === 'object') return true;
    try {
      JSON.parse(output);
      return true;
    } catch {
      return false;
    }
  }
};

export default {
  PromptTestResult,
  PromptTestSuite,
  PromptValidator,
  MockPromptEngine,
  assertions
};
