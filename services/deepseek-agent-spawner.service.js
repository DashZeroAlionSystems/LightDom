/**
 * DeepSeek Agent Instance Spawner
 * 
 * Spawns DeepSeek agent instances for smaller, focused tasks
 * - Task queue management
 * - Agent lifecycle (spawn, monitor, terminate)
 * - Resource allocation
 * - Result aggregation
 * 
 * @module services/deepseek-agent-spawner
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import axios from 'axios';

export class DeepSeekAgentSpawner extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      db: config.db,
      ollamaEndpoint: config.ollamaEndpoint || 'http://127.0.0.1:11434',
      model: config.model || 'deepseek-coder',
      maxConcurrentAgents: config.maxConcurrentAgents || 5,
      agentTimeout: config.agentTimeout || 300000, // 5 minutes
      retryAttempts: config.retryAttempts || 3,
      ...config,
    };
    
    if (!this.config.db) {
      throw new Error('Database connection required for DeepSeekAgentSpawner');
    }
    
    this.activeAgents = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
  }
  
  /**
   * Spawn an agent instance for a task
   */
  async spawnAgent(task) {
    const agentId = crypto.randomUUID();
    
    console.log(`🤖 Spawning agent ${agentId} for task: ${task.type}`);
    
    const agent = {
      id: agentId,
      taskId: task.id,
      type: task.type,
      status: 'spawning',
      spawnedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      context: task.context,
      result: null,
      error: null,
    };
    
    this.activeAgents.set(agentId, agent);
    
    // Save agent to database
    await this.saveAgentToDb(agent);
    
    // Start agent execution
    this.executeAgent(agent, task).catch(error => {
      console.error(`Agent ${agentId} execution failed:`, error);
      agent.status = 'failed';
      agent.error = error.message;
    });
    
    this.emit('agent:spawned', agent);
    
    return agentId;
  }
  
  /**
   * Execute agent task
   */
  async executeAgent(agent, task) {
    try {
      agent.status = 'running';
      agent.lastActivity = new Date().toISOString();
      
      await this.updateAgentInDb(agent);
      
      // Execute task based on type
      let result;
      
      switch (task.type) {
        case 'error_analysis':
          result = await this.executeErrorAnalysis(agent, task);
          break;
          
        case 'code_generation':
          result = await this.executeCodeGeneration(agent, task);
          break;
          
        case 'code_review':
          result = await this.executeCodeReview(agent, task);
          break;
          
        case 'refactoring':
          result = await this.executeRefactoring(agent, task);
          break;
          
        case 'documentation':
          result = await this.executeDocumentation(agent, task);
          break;
          
        case 'test_generation':
          result = await this.executeTestGeneration(agent, task);
          break;
          
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      agent.status = 'completed';
      agent.result = result;
      agent.completedAt = new Date().toISOString();
      
      await this.updateAgentInDb(agent);
      
      this.emit('agent:completed', agent);
      
      // Auto-terminate completed agent after delay
      setTimeout(() => this.terminateAgent(agent.id), 60000);
      
      return result;
      
    } catch (error) {
      agent.status = 'failed';
      agent.error = error.message;
      agent.completedAt = new Date().toISOString();
      
      await this.updateAgentInDb(agent);
      
      this.emit('agent:failed', agent);
      
      throw error;
    }
  }
  
  /**
   * Execute error analysis task
   */
  async executeErrorAnalysis(agent, task) {
    const { errorReport, codeContext } = task.context;
    
    const prompt = `Analyze this error and provide a diagnosis:

Error Type: ${errorReport.error_type}
Component: ${errorReport.component}
Message: ${errorReport.message}

Stack Trace:
${errorReport.stackTrace || 'N/A'}

Related Code Context:
${codeContext.files.slice(0, 3).map(f => `
File: ${f.path}
\`\`\`
${f.content.split('\n').slice(0, 50).join('\n')}
\`\`\`
`).join('\n')}

Provide:
1. Root cause analysis
2. Potential fixes
3. Confidence score (0-1)
4. Recommended action (log_only, create_ticket, generate_pr, auto_fix)`;

    const response = await this.callDeepSeek(prompt, {
      system: 'You are an expert software engineer analyzing errors. Provide structured, actionable analysis.',
    });
    
    return this.parseAnalysisResponse(response);
  }
  
  /**
   * Execute code generation task
   */
  async executeCodeGeneration(agent, task) {
    const { specification, context } = task.context;
    
    const prompt = `Generate code based on this specification:

${specification}

Context:
${JSON.stringify(context, null, 2)}

Generate:
1. Implementation code
2. Unit tests
3. Documentation
4. Integration notes`;

    const response = await this.callDeepSeek(prompt, {
      system: 'You are an expert software engineer. Generate clean, tested, documented code.',
    });
    
    return this.parseCodeGenerationResponse(response);
  }
  
  /**
   * Execute code review task
   */
  async executeCodeReview(agent, task) {
    const { code, filePath, context } = task.context;
    
    const prompt = `Review this code:

File: ${filePath}

\`\`\`
${code}
\`\`\`

Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Code quality assessment
2. Potential issues
3. Security concerns
4. Performance suggestions
5. Best practice recommendations`;

    const response = await this.callDeepSeek(prompt, {
      system: 'You are a senior code reviewer. Provide constructive, specific feedback.',
    });
    
    return this.parseReviewResponse(response);
  }
  
  /**
   * Execute refactoring task
   */
  async executeRefactoring(agent, task) {
    const { code, refactoringGoal, filePath } = task.context;
    
    const prompt = `Refactor this code to ${refactoringGoal}:

File: ${filePath}

\`\`\`
${code}
\`\`\`

Provide:
1. Refactored code
2. Explanation of changes
3. Migration guide if needed
4. Tests for refactored code`;

    const response = await this.callDeepSeek(prompt, {
      system: 'You are an expert at code refactoring. Maintain functionality while improving code quality.',
    });
    
    return this.parseRefactoringResponse(response);
  }
  
  /**
   * Execute documentation task
   */
  async executeDocumentation(agent, task) {
    const { code, filePath, documentationType } = task.context;
    
    const prompt = `Generate ${documentationType} documentation for:

File: ${filePath}

\`\`\`
${code}
\`\`\`

Include:
1. Overview
2. API documentation
3. Usage examples
4. Configuration options
5. Common patterns`;

    const response = await this.callDeepSeek(prompt, {
      system: 'You are a technical writer. Create clear, comprehensive documentation.',
    });
    
    return { documentation: response };
  }
  
  /**
   * Execute test generation task
   */
  async executeTestGeneration(agent, task) {
    const { code, filePath, testFramework } = task.context;
    
    const prompt = `Generate ${testFramework} tests for:

File: ${filePath}

\`\`\`
${code}
\`\`\`

Generate:
1. Unit tests covering main functionality
2. Edge case tests
3. Error handling tests
4. Integration test suggestions`;

    const response = await this.callDeepSeek(prompt, {
      system: 'You are an expert at test-driven development. Create comprehensive, maintainable tests.',
    });
    
    return this.parseTestResponse(response);
  }
  
  /**
   * Call DeepSeek via Ollama
   */
  async callDeepSeek(prompt, options = {}) {
    const { system = '', temperature = 0.7, maxTokens = 4096 } = options;
    
    try {
      const response = await axios.post(
        `${this.config.ollamaEndpoint}/api/generate`,
        {
          model: this.config.model,
          prompt: prompt,
          system: system,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        },
        {
          timeout: this.config.agentTimeout,
        }
      );
      
      return response.data.response;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama service is not running. Please start Ollama.');
      }
      throw error;
    }
  }
  
  /**
   * Parse analysis response
   */
  parseAnalysisResponse(response) {
    try {
      // Try to extract JSON if present
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Otherwise return structured text
      return {
        analysis: response,
        parsed: false,
      };
    } catch (error) {
      return {
        analysis: response,
        parsed: false,
        parseError: error.message,
      };
    }
  }
  
  /**
   * Parse code generation response
   */
  parseCodeGenerationResponse(response) {
    const codeBlocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = regex.exec(response)) !== null) {
      codeBlocks.push({
        language: match[1] || 'unknown',
        code: match[2],
      });
    }
    
    return {
      fullResponse: response,
      codeBlocks,
    };
  }
  
  /**
   * Parse review response
   */
  parseReviewResponse(response) {
    return {
      review: response,
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Parse refactoring response
   */
  parseRefactoringResponse(response) {
    return this.parseCodeGenerationResponse(response);
  }
  
  /**
   * Parse test response
   */
  parseTestResponse(response) {
    return this.parseCodeGenerationResponse(response);
  }
  
  /**
   * Queue a task for agent execution
   */
  async queueTask(task) {
    const taskId = crypto.randomUUID();
    
    const queuedTask = {
      id: taskId,
      type: task.type,
      priority: task.priority || 5,
      context: task.context,
      status: 'queued',
      queuedAt: new Date().toISOString(),
      attempts: 0,
    };
    
    // Save to database
    await this.saveTaskToDb(queuedTask);
    
    // Add to queue (priority queue)
    this.taskQueue.push(queuedTask);
    this.taskQueue.sort((a, b) => a.priority - b.priority);
    
    this.emit('task:queued', queuedTask);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return taskId;
  }
  
  /**
   * Process task queue
   */
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.taskQueue.length > 0) {
      // Check if we can spawn more agents
      if (this.activeAgents.size >= this.config.maxConcurrentAgents) {
        // Wait for an agent to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      // Get next task
      const task = this.taskQueue.shift();
      
      if (!task) break;
      
      try {
        task.status = 'processing';
        await this.updateTaskInDb(task);
        
        // Spawn agent for task
        const agentId = await this.spawnAgent(task);
        task.agentId = agentId;
        
      } catch (error) {
        console.error(`Failed to process task ${task.id}:`, error);
        
        task.attempts++;
        task.status = 'failed';
        task.error = error.message;
        
        // Retry if under limit
        if (task.attempts < this.config.retryAttempts) {
          task.status = 'queued';
          this.taskQueue.push(task);
        }
        
        await this.updateTaskInDb(task);
      }
    }
    
    this.isProcessing = false;
  }
  
  /**
   * Terminate an agent
   */
  async terminateAgent(agentId) {
    const agent = this.activeAgents.get(agentId);
    
    if (!agent) {
      return;
    }
    
    console.log(`🛑 Terminating agent ${agentId}`);
    
    agent.status = 'terminated';
    agent.terminatedAt = new Date().toISOString();
    
    await this.updateAgentInDb(agent);
    
    this.activeAgents.delete(agentId);
    
    this.emit('agent:terminated', agent);
  }
  
  /**
   * Get agent status
   */
  getAgentStatus(agentId) {
    return this.activeAgents.get(agentId);
  }
  
  /**
   * Get all active agents
   */
  getActiveAgents() {
    return Array.from(this.activeAgents.values());
  }
  
  /**
   * Get task queue status
   */
  getQueueStatus() {
    return {
      queued: this.taskQueue.length,
      active: this.activeAgents.size,
      maxConcurrent: this.config.maxConcurrentAgents,
    };
  }
  
  /**
   * Save agent to database
   */
  async saveAgentToDb(agent) {
    const query = `
      INSERT INTO deepseek_agent_instances
        (id, task_id, type, status, spawned_at, context)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    try {
      await this.config.db.query(query, [
        agent.id,
        agent.taskId,
        agent.type,
        agent.status,
        agent.spawnedAt,
        JSON.stringify(agent.context)
      ]);
    } catch (error) {
      console.debug('Failed to save agent to DB:', error.message);
    }
  }
  
  /**
   * Update agent in database
   */
  async updateAgentInDb(agent) {
    const query = `
      UPDATE deepseek_agent_instances
      SET status = $1,
          result = $2,
          error = $3,
          last_activity = $4,
          completed_at = $5,
          terminated_at = $6
      WHERE id = $7
    `;
    
    try {
      await this.config.db.query(query, [
        agent.status,
        JSON.stringify(agent.result),
        agent.error,
        agent.lastActivity,
        agent.completedAt,
        agent.terminatedAt,
        agent.id
      ]);
    } catch (error) {
      console.debug('Failed to update agent in DB:', error.message);
    }
  }
  
  /**
   * Save task to database
   */
  async saveTaskToDb(task) {
    const query = `
      INSERT INTO deepseek_agent_tasks
        (id, type, priority, context, status, queued_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    try {
      await this.config.db.query(query, [
        task.id,
        task.type,
        task.priority,
        JSON.stringify(task.context),
        task.status,
        task.queuedAt
      ]);
    } catch (error) {
      console.debug('Failed to save task to DB:', error.message);
    }
  }
  
  /**
   * Update task in database
   */
  async updateTaskInDb(task) {
    const query = `
      UPDATE deepseek_agent_tasks
      SET status = $1,
          agent_id = $2,
          attempts = $3,
          error = $4
      WHERE id = $5
    `;
    
    try {
      await this.config.db.query(query, [
        task.status,
        task.agentId,
        task.attempts,
        task.error,
        task.id
      ]);
    } catch (error) {
      console.debug('Failed to update task in DB:', error.message);
    }
  }
}

export default DeepSeekAgentSpawner;
