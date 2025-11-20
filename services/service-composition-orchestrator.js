/**
 * Service Composition Orchestrator
 * 
 * Orchestrates the execution of services composed from multiple API endpoints.
 * Supports sequential, parallel, and conditional execution patterns.
 */

import axios from 'axios';
import { EventEmitter } from 'events';

class ServiceCompositionOrchestrator extends EventEmitter {
  constructor(registry, config = {}) {
    super();
    this.registry = registry;
    this.config = {
      maxConcurrency: config.maxConcurrency || 5,
      defaultTimeout: config.defaultTimeout || 30000,
      retryDefaults: {
        maxRetries: 3,
        backoff: 'exponential',
        initialDelay: 1000
      },
      ...config
    };
    
    this.activeExecutions = new Map();
  }

  /**
   * Execute a service by composing its bound endpoints
   */
  async executeService(serviceId, inputData = {}, options = {}) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.emit('execution:start', { executionId, serviceId });
      
      // Get service bindings
      const bindings = await this.registry.getServiceBindings(serviceId);
      
      if (!bindings || bindings.length === 0) {
        throw new Error(`No endpoint bindings found for service: ${serviceId}`);
      }
      
      // Sort by binding_order
      bindings.sort((a, b) => a.binding_order - b.binding_order);
      
      // Execute endpoints in sequence
      let context = { ...inputData };
      const results = [];
      
      for (const binding of bindings) {
        if (!binding.is_active) {
          continue;
        }
        
        // Check condition if specified
        if (binding.condition && !this.evaluateCondition(binding.condition, context)) {
          this.emit('execution:skip', { executionId, binding: binding.binding_id });
          continue;
        }
        
        // Execute endpoint
        try {
          const result = await this.executeEndpoint(binding, context, options);
          results.push({
            binding_id: binding.binding_id,
            endpoint_id: binding.endpoint_id,
            success: true,
            result
          });
          
          // Update context with result
          if (binding.output_mapping) {
            context = this.applyOutputMapping(context, result, binding.output_mapping);
          } else {
            context.lastResult = result;
          }
          
          this.emit('execution:step', { executionId, binding: binding.binding_id, result });
          
        } catch (error) {
          this.emit('execution:error', { executionId, binding: binding.binding_id, error });
          
          // Handle error based on policy
          if (binding.on_error === 'stop') {
            throw error;
          } else if (binding.on_error === 'retry' && binding.retry_policy) {
            const retryResult = await this.retryEndpoint(binding, context, options);
            results.push(retryResult);
          } else if (binding.fallback_endpoint_id) {
            const fallbackResult = await this.executeFallback(
              binding.fallback_endpoint_id, 
              context, 
              options
            );
            results.push(fallbackResult);
          } else {
            // Continue with error logged
            results.push({
              binding_id: binding.binding_id,
              endpoint_id: binding.endpoint_id,
              success: false,
              error: error.message
            });
          }
        }
      }
      
      this.emit('execution:complete', { executionId, results });
      
      return {
        success: true,
        executionId,
        results,
        finalContext: context
      };
      
    } catch (error) {
      this.emit('execution:failed', { executionId, error });
      throw error;
    }
  }

  /**
   * Execute an endpoint chain
   */
  async executeChain(chainId, inputData = {}, options = {}) {
    const executionId = `chain_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.emit('chain:start', { executionId, chainId });
      
      // Get chain execution plan
      const plan = await this.registry.getChainExecutionPlan(chainId);
      
      const startTime = Date.now();
      let results;
      
      // Execute based on chain type
      switch (plan.chain.chain_type) {
        case 'sequential':
          results = await this.executeSequential(plan.endpoints, inputData, options);
          break;
        case 'parallel':
          results = await this.executeParallel(plan.endpoints, inputData, options);
          break;
        case 'conditional':
          results = await this.executeConditional(plan.endpoints, inputData, plan.chain.data_flow, options);
          break;
        default:
          throw new Error(`Unknown chain type: ${plan.chain.chain_type}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      // Update chain statistics
      await this.updateChainStats(chainId, executionTime, true);
      
      this.emit('chain:complete', { executionId, chainId, results });
      
      return {
        success: true,
        executionId,
        chainId,
        executionTime,
        results
      };
      
    } catch (error) {
      this.emit('chain:failed', { executionId, chainId, error });
      await this.updateChainStats(chainId, 0, false);
      throw error;
    }
  }

  /**
   * Execute endpoints sequentially
   */
  async executeSequential(endpoints, inputData, options) {
    let context = { ...inputData };
    const results = [];
    
    for (const endpoint of endpoints) {
      const config = endpoint.config || {};
      const mappedInput = this.applyInputMapping(context, config.input_mapping);
      
      try {
        const result = await this.callEndpoint(endpoint, mappedInput, options);
        results.push({
          endpoint_id: endpoint.endpoint_id,
          success: true,
          result
        });
        
        // Update context
        if (config.output_mapping) {
          context = this.applyOutputMapping(context, result, config.output_mapping);
        } else {
          context.lastResult = result;
        }
        
      } catch (error) {
        results.push({
          endpoint_id: endpoint.endpoint_id,
          success: false,
          error: error.message
        });
        
        if (config.stopOnError) {
          throw error;
        }
      }
    }
    
    return results;
  }

  /**
   * Execute endpoints in parallel
   */
  async executeParallel(endpoints, inputData, options) {
    const promises = endpoints.map(async (endpoint) => {
      const config = endpoint.config || {};
      const mappedInput = this.applyInputMapping(inputData, config.input_mapping);
      
      try {
        const result = await this.callEndpoint(endpoint, mappedInput, options);
        return {
          endpoint_id: endpoint.endpoint_id,
          success: true,
          result
        };
      } catch (error) {
        return {
          endpoint_id: endpoint.endpoint_id,
          success: false,
          error: error.message
        };
      }
    });
    
    return await Promise.all(promises);
  }

  /**
   * Execute endpoints with conditional logic
   */
  async executeConditional(endpoints, inputData, dataFlow, options) {
    let context = { ...inputData };
    const results = [];
    
    for (const endpoint of endpoints) {
      const config = endpoint.config || {};
      
      // Evaluate condition
      if (config.condition && !this.evaluateCondition(config.condition, context)) {
        continue;
      }
      
      const mappedInput = this.applyInputMapping(context, config.input_mapping);
      
      try {
        const result = await this.callEndpoint(endpoint, mappedInput, options);
        results.push({
          endpoint_id: endpoint.endpoint_id,
          success: true,
          result
        });
        
        // Update context based on data flow rules
        if (dataFlow[endpoint.endpoint_id]) {
          context = this.applyDataFlow(context, result, dataFlow[endpoint.endpoint_id]);
        } else {
          context.lastResult = result;
        }
        
      } catch (error) {
        results.push({
          endpoint_id: endpoint.endpoint_id,
          success: false,
          error: error.message
        });
        
        if (config.stopOnError) {
          break;
        }
      }
    }
    
    return results;
  }

  /**
   * Execute a single endpoint
   */
  async executeEndpoint(binding, context, options) {
    const endpoint = await this.registry.getEndpointById(binding.endpoint_id);
    
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${binding.endpoint_id}`);
    }
    
    // Apply input mapping
    const mappedInput = this.applyInputMapping(context, binding.input_mapping);
    
    // Apply transform script if present
    let transformedInput = mappedInput;
    if (binding.transform_script) {
      transformedInput = this.applyTransform(mappedInput, binding.transform_script);
    }
    
    return await this.callEndpoint(endpoint, transformedInput, options);
  }

  /**
   * Call an API endpoint
   */
  async callEndpoint(endpoint, data, options = {}) {
    const startTime = Date.now();
    const executionId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Build request URL
      let url = endpoint.path;
      
      // Replace path parameters
      if (endpoint.path_params && data.pathParams) {
        endpoint.path_params.forEach(param => {
          if (data.pathParams[param.name]) {
            url = url.replace(`:${param.name}`, data.pathParams[param.name]);
          }
        });
      }
      
      // Build full URL
      const baseURL = options.baseURL || process.env.API_BASE_URL || 'http://localhost:3001';
      const fullURL = `${baseURL}${url}`;
      
      // Build request config
      const requestConfig = {
        method: endpoint.method.toLowerCase(),
        url: fullURL,
        timeout: endpoint.timeout_ms || this.config.defaultTimeout,
        headers: options.headers || {}
      };
      
      // Add query params
      if (data.queryParams) {
        requestConfig.params = data.queryParams;
      }
      
      // Add body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        requestConfig.data = data.body || data;
      }
      
      // Make request
      const response = await axios(requestConfig);
      const responseTime = Date.now() - startTime;
      
      // Log execution
      await this.registry.logExecution({
        execution_id: executionId,
        endpoint_id: endpoint.endpoint_id,
        request_method: endpoint.method,
        request_path: url,
        request_params: data.pathParams || {},
        request_body: data.body || data,
        request_headers: requestConfig.headers,
        response_status: response.status,
        response_body: response.data,
        response_time_ms: responseTime,
        started_at: new Date(startTime),
        completed_at: new Date(),
        status: 'success'
      });
      
      return response.data;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed execution
      await this.registry.logExecution({
        execution_id: executionId,
        endpoint_id: endpoint.endpoint_id,
        request_method: endpoint.method,
        request_path: endpoint.path,
        request_params: data.pathParams || {},
        request_body: data.body || data,
        response_status: error.response?.status || null,
        response_body: error.response?.data || {},
        response_time_ms: responseTime,
        started_at: new Date(startTime),
        completed_at: new Date(),
        status: 'error',
        error_message: error.message,
        error_stack: error.stack
      });
      
      throw error;
    }
  }

  /**
   * Retry endpoint execution
   */
  async retryEndpoint(binding, context, options) {
    const retryPolicy = binding.retry_policy || this.config.retryDefaults;
    let lastError;
    
    for (let attempt = 0; attempt < retryPolicy.maxRetries; attempt++) {
      try {
        const result = await this.executeEndpoint(binding, context, options);
        return {
          binding_id: binding.binding_id,
          endpoint_id: binding.endpoint_id,
          success: true,
          result,
          retryAttempt: attempt
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < retryPolicy.maxRetries - 1) {
          const delay = this.calculateBackoff(attempt, retryPolicy);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Execute fallback endpoint
   */
  async executeFallback(fallbackEndpointId, context, options) {
    const endpoint = await this.registry.getEndpointById(fallbackEndpointId);
    const result = await this.callEndpoint(endpoint, context, options);
    
    return {
      endpoint_id: fallbackEndpointId,
      success: true,
      result,
      isFallback: true
    };
  }

  /**
   * Calculate backoff delay
   */
  calculateBackoff(attempt, policy) {
    const initialDelay = policy.initialDelay || 1000;
    
    if (policy.backoff === 'exponential') {
      return initialDelay * Math.pow(2, attempt);
    } else if (policy.backoff === 'linear') {
      return initialDelay * (attempt + 1);
    } else {
      return initialDelay;
    }
  }

  /**
   * Apply input mapping
   */
  applyInputMapping(context, mapping) {
    if (!mapping || Object.keys(mapping).length === 0) {
      return context;
    }
    
    const result = {};
    
    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      result[targetKey] = this.resolveValue(context, sourceKey);
    }
    
    return result;
  }

  /**
   * Apply output mapping
   */
  applyOutputMapping(context, result, mapping) {
    if (!mapping || Object.keys(mapping).length === 0) {
      return { ...context, ...result };
    }
    
    const newContext = { ...context };
    
    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      newContext[targetKey] = this.resolveValue(result, sourceKey);
    }
    
    return newContext;
  }

  /**
   * Apply data flow transformation
   */
  applyDataFlow(context, result, flowRules) {
    const newContext = { ...context };
    
    for (const [key, value] of Object.entries(flowRules)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        // Variable reference
        newContext[key] = this.resolveValue(result, value.substring(1));
      } else {
        newContext[key] = value;
      }
    }
    
    return newContext;
  }

  /**
   * Resolve nested value from object
   */
  resolveValue(obj, path) {
    if (typeof path !== 'string') {
      return path;
    }
    
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Evaluate condition
   */
  evaluateCondition(condition, context) {
    try {
      // Simple condition evaluation
      // In production, use a proper expression evaluator
      if (condition.field && condition.operator && condition.value !== undefined) {
        const fieldValue = this.resolveValue(context, condition.field);
        
        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'notEquals':
            return fieldValue !== condition.value;
          case 'greaterThan':
            return fieldValue > condition.value;
          case 'lessThan':
            return fieldValue < condition.value;
          case 'exists':
            return fieldValue !== undefined && fieldValue !== null;
          case 'notExists':
            return fieldValue === undefined || fieldValue === null;
          default:
            return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Apply transform script
   */
  applyTransform(data, script) {
    try {
      // In production, use a sandboxed JavaScript execution environment
      // For now, simple transformation support
      const transform = new Function('data', `return ${script}`);
      return transform(data);
    } catch (error) {
      console.error('Error applying transform:', error);
      return data;
    }
  }

  /**
   * Update chain statistics
   */
  async updateChainStats(chainId, executionTime, success) {
    const query = `
      UPDATE workflow_endpoint_chains
      SET 
        total_executions = total_executions + 1,
        successful_executions = successful_executions + ${success ? 1 : 0},
        failed_executions = failed_executions + ${success ? 0 : 1},
        avg_execution_time_ms = (
          COALESCE(avg_execution_time_ms * total_executions, 0) + $1
        ) / (total_executions + 1),
        last_executed_at = CURRENT_TIMESTAMP
      WHERE chain_id = $2
    `;
    
    await this.registry.db.query(query, [executionTime, chainId]);
  }
}

export default ServiceCompositionOrchestrator;
