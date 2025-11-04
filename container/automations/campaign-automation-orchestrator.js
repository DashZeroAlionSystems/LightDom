/**
 * Campaign Automation Orchestrator
 * 
 * Runs complex multi-step automations that accomplish complete workflows.
 * Each automation is a series of tasks that work together to complete one goal.
 */

import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';

class CampaignAutomationOrchestrator extends EventEmitter {
  constructor(services = {}) {
    super();
    
    this.services = services;
    this.runningAutomations = new Map();
    this.completedAutomations = new Map();
    this.automationHistory = [];
    
    // Track metrics
    this.metrics = {
      totalAutomations: 0,
      successfulAutomations: 0,
      failedAutomations: 0,
      averageExecutionTime: 0
    };
  }

  /**
   * Execute a complete automation workflow
   */
  async runAutomation(automationConfig, context = {}) {
    const automationId = uuidv4();
    const startTime = Date.now();
    
    const automation = {
      id: automationId,
      name: automationConfig.name,
      status: 'running',
      startTime,
      context,
      completedTasks: [],
      failedTasks: [],
      currentTask: null,
      results: {}
    };
    
    this.runningAutomations.set(automationId, automation);
    this.metrics.totalAutomations++;
    
    this.emit('automation:started', { automationId, name: automationConfig.name });
    
    try {
      // Execute tasks in sequence
      for (const task of automationConfig.tasks) {
        automation.currentTask = task.id;
        this.emit('task:started', { automationId, taskId: task.id, taskName: task.name });
        
        try {
          const taskResult = await this.executeTask(task, automation, context);
          
          automation.completedTasks.push({
            taskId: task.id,
            name: task.name,
            result: taskResult,
            completedAt: Date.now()
          });
          
          // Store result for use in subsequent tasks
          automation.results[task.id] = taskResult;
          
          this.emit('task:completed', { 
            automationId, 
            taskId: task.id, 
            result: taskResult 
          });
          
          // Check if this task triggers a loop or conditional
          if (task.onSuccess) {
            await this.handleTaskSuccess(task.onSuccess, automation, taskResult);
          }
          
        } catch (error) {
          automation.failedTasks.push({
            taskId: task.id,
            name: task.name,
            error: error.message,
            failedAt: Date.now()
          });
          
          this.emit('task:failed', { 
            automationId, 
            taskId: task.id, 
            error: error.message 
          });
          
          // Handle task failure
          if (task.onFailure === 'abort') {
            throw new Error(`Task ${task.id} failed: ${error.message}`);
          } else if (task.onFailure === 'retry') {
            // Retry the task
            const retryResult = await this.retryTask(task, automation, context, 3);
            automation.results[task.id] = retryResult;
          }
          // Continue to next task if onFailure is 'continue'
        }
      }
      
      // Automation completed successfully
      automation.status = 'completed';
      automation.endTime = Date.now();
      automation.duration = automation.endTime - automation.startTime;
      
      this.completedAutomations.set(automationId, automation);
      this.runningAutomations.delete(automationId);
      this.metrics.successfulAutomations++;
      
      // Update average execution time
      this.updateAverageExecutionTime(automation.duration);
      
      this.emit('automation:completed', { 
        automationId, 
        duration: automation.duration,
        results: automation.results 
      });
      
      // Save to history
      this.automationHistory.push({
        id: automationId,
        name: automation.name,
        status: 'completed',
        duration: automation.duration,
        completedAt: automation.endTime
      });
      
      return {
        success: true,
        automationId,
        results: automation.results,
        duration: automation.duration
      };
      
    } catch (error) {
      automation.status = 'failed';
      automation.endTime = Date.now();
      automation.duration = automation.endTime - automation.startTime;
      automation.error = error.message;
      
      this.completedAutomations.set(automationId, automation);
      this.runningAutomations.delete(automationId);
      this.metrics.failedAutomations++;
      
      this.emit('automation:failed', { automationId, error: error.message });
      
      // Save to history
      this.automationHistory.push({
        id: automationId,
        name: automation.name,
        status: 'failed',
        error: error.message,
        failedAt: automation.endTime
      });
      
      return {
        success: false,
        automationId,
        error: error.message,
        partialResults: automation.results
      };
    }
  }

  /**
   * Execute a single task
   */
  async executeTask(task, automation, context) {
    const taskContext = {
      ...context,
      previousResults: automation.results,
      automationId: automation.id
    };
    
    // Replace variables in task input
    const processedInput = this.processVariables(task.input, taskContext);
    
    // Execute based on task type
    switch (task.type) {
      case 'api_call':
        return await this.executeApiCall(task, processedInput);
        
      case 'data_transformation':
        return await this.executeDataTransformation(task, processedInput);
        
      case 'enrichment':
        return await this.executeEnrichment(task, processedInput);
        
      case 'validation':
        return await this.executeValidation(task, processedInput);
        
      case 'aggregation':
        return await this.executeAggregation(task, processedInput);
        
      case 'loop':
        return await this.executeLoop(task, processedInput, automation, context);
        
      case 'conditional':
        return await this.executeConditional(task, processedInput, automation, context);
        
      case 'parallel':
        return await this.executeParallel(task, processedInput);
        
      case 'wait':
        return await this.executeWait(task, processedInput);
        
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Execute API call task
   */
  async executeApiCall(task, input) {
    const axios = (await import('axios')).default;
    
    const response = await axios({
      method: task.method || 'POST',
      url: task.endpoint,
      data: input,
      headers: task.headers || {},
      timeout: task.timeout || 30000
    });
    
    return response.data;
  }

  /**
   * Execute data transformation task
   */
  async executeDataTransformation(task, input) {
    const _ = (await import('lodash')).default;
    const R = (await import('ramda')).default;
    
    // Apply transformation function
    if (task.transformation === 'map') {
      return _.map(input.data, task.mapper);
    } else if (task.transformation === 'filter') {
      return _.filter(input.data, task.predicate);
    } else if (task.transformation === 'reduce') {
      return _.reduce(input.data, task.reducer, task.initial);
    } else if (task.transformation === 'groupBy') {
      return _.groupBy(input.data, task.key);
    } else if (task.transformation === 'custom') {
      // Execute custom transformation with Ramda
      const fn = eval(`(${task.function})`);
      return fn(input.data);
    }
    
    return input.data;
  }

  /**
   * Execute enrichment task (calls enrichment service)
   */
  async executeEnrichment(task, input) {
    if (!this.services.enrichmentService) {
      throw new Error('EnrichmentService not configured');
    }
    
    const jobs = await this.services.enrichmentService.enqueueBatch(
      input.entityIds,
      task.enrichmentType,
      task.config || {}
    );
    
    // Wait for completion
    const results = await this.waitForJobs(jobs, task.timeout || 300000);
    
    return results;
  }

  /**
   * Execute validation task
   */
  async executeValidation(task, input) {
    const Ajv = (await import('ajv')).default;
    const ajv = new Ajv();
    
    const validate = ajv.compile(task.schema);
    const valid = validate(input.data);
    
    if (!valid) {
      if (task.onInvalid === 'throw') {
        throw new Error(`Validation failed: ${JSON.stringify(validate.errors)}`);
      } else if (task.onInvalid === 'filter') {
        // Return only valid items
        return _.filter(input.data, item => {
          const itemValid = ajv.validate(task.schema, item);
          return itemValid;
        });
      }
    }
    
    return {
      valid,
      errors: validate.errors,
      data: input.data
    };
  }

  /**
   * Execute aggregation task
   */
  async executeAggregation(task, input) {
    const _ = (await import('lodash')).default;
    
    const results = {};
    
    if (task.aggregations.includes('count')) {
      results.count = _.size(input.data);
    }
    
    if (task.aggregations.includes('sum') && task.sumField) {
      results.sum = _.sumBy(input.data, task.sumField);
    }
    
    if (task.aggregations.includes('avg') && task.avgField) {
      results.avg = _.meanBy(input.data, task.avgField);
    }
    
    if (task.aggregations.includes('min') && task.minField) {
      results.min = _.minBy(input.data, task.minField);
    }
    
    if (task.aggregations.includes('max') && task.maxField) {
      results.max = _.maxBy(input.data, task.maxField);
    }
    
    if (task.aggregations.includes('groupBy') && task.groupByField) {
      results.groups = _.groupBy(input.data, task.groupByField);
    }
    
    return results;
  }

  /**
   * Execute loop task (iterate over items)
   */
  async executeLoop(task, input, automation, context) {
    const results = [];
    const items = input.items || [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const loopContext = {
        ...context,
        loopIndex: i,
        loopItem: item,
        loopTotal: items.length
      };
      
      // Execute subtasks for this item
      const subResults = {};
      for (const subTask of task.subtasks) {
        const subResult = await this.executeTask(subTask, automation, loopContext);
        subResults[subTask.id] = subResult;
      }
      
      results.push({
        item,
        results: subResults
      });
      
      // Check loop limit
      if (task.maxIterations && i >= task.maxIterations - 1) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Execute conditional task
   */
  async executeConditional(task, input, automation, context) {
    // Evaluate condition
    const condition = this.evaluateCondition(task.condition, input, automation);
    
    if (condition) {
      // Execute 'then' tasks
      const results = {};
      for (const thenTask of task.then || []) {
        const result = await this.executeTask(thenTask, automation, context);
        results[thenTask.id] = result;
      }
      return { branch: 'then', results };
    } else {
      // Execute 'else' tasks
      const results = {};
      for (const elseTask of task.else || []) {
        const result = await this.executeTask(elseTask, automation, context);
        results[elseTask.id] = result;
      }
      return { branch: 'else', results };
    }
  }

  /**
   * Execute parallel tasks
   */
  async executeParallel(task, input) {
    const promises = task.subtasks.map(subTask => 
      this.executeTask(subTask, { results: {} }, input)
    );
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, result, index) => {
      acc[task.subtasks[index].id] = result;
      return acc;
    }, {});
  }

  /**
   * Execute wait task
   */
  async executeWait(task, input) {
    const delay = input.delay || task.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { waited: delay };
  }

  /**
   * Retry a failed task
   */
  async retryTask(task, automation, context, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.emit('task:retry', { 
          automationId: automation.id, 
          taskId: task.id, 
          attempt 
        });
        
        const result = await this.executeTask(task, automation, context);
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Handle task success actions
   */
  async handleTaskSuccess(actions, automation, result) {
    for (const action of actions) {
      if (action.type === 'notify') {
        this.emit('task:notification', { 
          automationId: automation.id, 
          message: action.message,
          result 
        });
      } else if (action.type === 'webhook') {
        await this.executeApiCall({
          type: 'api_call',
          method: 'POST',
          endpoint: action.url,
          headers: action.headers
        }, result);
      }
    }
  }

  /**
   * Process variables in task input
   */
  processVariables(input, context) {
    // Lodash needs to be synchronously available
    const _ = (typeof window !== 'undefined' && window._) || require('lodash');
    
    if (typeof input === 'string') {
      return input.replace(/\${([^}]+)}/g, (match, path) => {
        return _.get(context, path, match);
      });
    } else if (Array.isArray(input)) {
      return input.map(item => this.processVariables(item, context));
    } else if (typeof input === 'object' && input !== null) {
      const processed = {};
      for (const [key, value] of Object.entries(input)) {
        processed[key] = this.processVariables(value, context);
      }
      return processed;
    }
    
    return input;
  }

  /**
   * Evaluate conditional expression
   */
  evaluateCondition(condition, input, automation) {
    // Lodash needs to be synchronously available, so we'll require it at module level
    const _ = (typeof window !== 'undefined' && window._) || require('lodash');
    
    if (condition.type === 'equals') {
      return _.get(input, condition.field) === condition.value;
    } else if (condition.type === 'greaterThan') {
      return _.get(input, condition.field) > condition.value;
    } else if (condition.type === 'lessThan') {
      return _.get(input, condition.field) < condition.value;
    } else if (condition.type === 'contains') {
      const value = _.get(input, condition.field);
      return Array.isArray(value) && value.includes(condition.value);
    } else if (condition.type === 'exists') {
      return _.has(input, condition.field);
    } else if (condition.type === 'custom') {
      const fn = eval(`(${condition.function})`);
      return fn(input, automation);
    }
    
    return false;
  }

  /**
   * Wait for jobs to complete
   */
  async waitForJobs(jobs, timeout = 300000) {
    const startTime = Date.now();
    const results = [];
    
    for (const job of jobs) {
      while (Date.now() - startTime < timeout) {
        const status = await job.getState();
        
        if (status === 'completed') {
          results.push(await job.returnvalue);
          break;
        } else if (status === 'failed') {
          throw new Error(`Job ${job.id} failed`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Update average execution time metric
   */
  updateAverageExecutionTime(duration) {
    const total = this.metrics.successfulAutomations + this.metrics.failedAutomations;
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (total - 1) + duration) / total;
  }

  /**
   * Get automation status
   */
  getAutomationStatus(automationId) {
    if (this.runningAutomations.has(automationId)) {
      return this.runningAutomations.get(automationId);
    } else if (this.completedAutomations.has(automationId)) {
      return this.completedAutomations.get(automationId);
    }
    
    return null;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      runningCount: this.runningAutomations.size,
      completedCount: this.completedAutomations.size,
      successRate: this.metrics.totalAutomations > 0 
        ? this.metrics.successfulAutomations / this.metrics.totalAutomations 
        : 0
    };
  }

  /**
   * Get automation history
   */
  getHistory(limit = 50) {
    return this.automationHistory.slice(-limit);
  }
}

export default CampaignAutomationOrchestrator;
