/**
 * Real-Time Scripting Engine
 * 
 * Secure sandbox for executing user scripts with VM2
 */

import { VM } from 'vm2';
import { EventEmitter } from 'events';
import _ from 'lodash';
import R from 'ramda';

class ScriptingEngine extends EventEmitter {
  constructor() {
    super();
    this.executionHistory = [];
  }

  /**
   * Execute script in sandbox
   */
  async execute(script, context = {}) {
    const startTime = Date.now();

    // Create sandbox
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        // Safe built-ins
        console: {
          log: (...args) => this.emit('log', args),
          error: (...args) => this.emit('error', args)
        },
        
        // Utilities
        _: _,
        R: R,
        
        // Context data
        ...context,
        
        // Helper functions
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        
        // No access to process, require, etc.
      }
    });

    try {
      const result = await vm.run(script);
      
      const executionTime = Date.now() - startTime;
      
      // Log execution
      this.executionHistory.push({
        script: script.substring(0, 100),
        executionTime,
        success: true,
        timestamp: new Date().toISOString()
      });

      this.emit('executed', { result, executionTime });
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Log error
      this.executionHistory.push({
        script: script.substring(0, 100),
        executionTime,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Execute async script
   */
  async executeAsync(script, context = {}) {
    const wrappedScript = `
      (async () => {
        ${script}
      })()
    `;

    return await this.execute(wrappedScript, context);
  }

  /**
   * Get execution history
   */
  getHistory(limit = 100) {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.executionHistory = [];
  }
}

export { ScriptingEngine };
