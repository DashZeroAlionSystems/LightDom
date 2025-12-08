/**
 * Autonomous Code Agent System
 * 
 * Self-managing development agent that:
 * - Monitors codebase for issues
 * - Creates branches automatically
 * - Fixes bugs and implements features
 * - Creates PRs with reasoning
 * - Learns from outcomes
 * - Manages git workflow
 * 
 * Inspired by:
 * - AutoGPT autonomous loops
 * - Devin AI software engineer
 * - GitHub Copilot Workspace
 * - Cursor IDE's agent mode
 */

import { EventEmitter } from 'events';
import CodebaseIndexingService from './codebase-indexing-service.js';
import GitWorkflowAutomationService from './git-workflow-automation-service.js';

export class AutonomousCodeAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      agentId: config.agentId || 'agent-001',
      agentType: config.agentType || 'general',
      autoFix: config.autoFix !== false,
      autoCommit: config.autoCommit !== false,
      autoPR: config.autoPR !== false,
      maxTasksPerRun: config.maxTasksPerRun || 10,
      minConfidence: config.minConfidence || 0.7,
      ...config,
    };

    this.db = config.db;
    this.deepseekService = config.deepseekService;
    
    // Initialize services
    this.codebaseIndex = new CodebaseIndexingService({
      db: this.db,
      deepseekService: this.deepseekService,
      ...config,
    });
    
    this.gitWorkflow = new GitWorkflowAutomationService({
      db: this.db,
      ...config,
    });
    
    this.isRunning = false;
    this.taskQueue = [];
    
    this.stats = {
      tasksCompleted: 0,
      issuesFixed: 0,
      prsCreated: 0,
      branchesCreated: 0,
      successRate: 0,
    };
  }

  /**
   * Start autonomous agent loop
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Agent already running');
      return;
    }
    
    console.log(`🤖 Starting autonomous agent: ${this.config.agentId}`);
    this.isRunning = true;
    
    try {
      // Step 1: Index codebase
      console.log('\n📊 Phase 1: Codebase Analysis');
      const indexResult = await this.codebaseIndex.indexCodebase();
      
      // Step 2: Identify tasks
      console.log('\n🎯 Phase 2: Task Identification');
      await this.identifyTasks();
      
      // Step 3: Execute tasks
      console.log('\n⚙️  Phase 3: Task Execution');
      await this.executeTasks();
      
      // Step 4: Learn from results
      console.log('\n🧠 Phase 4: Learning');
      await this.learnFromResults();
      
      console.log(`\n✅ Agent run complete`);
      console.log(`📊 Statistics:`);
      console.log(`   Tasks completed: ${this.stats.tasksCompleted}`);
      console.log(`   Issues fixed: ${this.stats.issuesFixed}`);
      console.log(`   PRs created: ${this.stats.prsCreated}`);
      console.log(`   Success rate: ${(this.stats.successRate * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Agent run failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Identify tasks from detected issues
   */
  async identifyTasks() {
    if (!this.db) {
      console.log('⚠️  Database not available');
      return;
    }
    
    // Get open issues from recent analysis
    const result = await this.db.query(`
      SELECT 
        ci.issue_id,
        ci.severity,
        ci.category,
        ci.file_path,
        ci.title,
        ci.description,
        ci.suggestion,
        ci.ai_confidence,
        ce.entity_id,
        ce.name as entity_name,
        ce.entity_type
      FROM code_issues ci
      LEFT JOIN code_entities ce ON ci.related_entity_id = ce.entity_id
      WHERE ci.status = 'open'
      AND ci.severity IN ('critical', 'high', 'medium')
      ORDER BY 
        CASE ci.severity 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        ci.ai_confidence DESC
      LIMIT $1
    `, [this.config.maxTasksPerRun]);
    
    for (const issue of result.rows) {
      // Determine if we can auto-fix
      const canAutoFix = this.canAutoFix(issue);
      
      if (!canAutoFix && this.config.autoFix) {
        console.log(`⏭️  Skipping ${issue.title} - cannot auto-fix`);
        continue;
      }
      
      // Create task
      const task = {
        task_id: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        type: this.determineTaskType(issue),
        issue,
        priority: this.calculatePriority(issue),
        confidence: issue.ai_confidence || 0,
      };
      
      this.taskQueue.push(task);
      
      // Save to database
      await this.saveTask(task);
    }
    
    console.log(`📋 Identified ${this.taskQueue.length} tasks`);
  }

  /**
   * Execute queued tasks
   */
  async executeTasks() {
    // Sort by priority
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    for (const task of this.taskQueue) {
      console.log(`\n🔧 Executing: ${task.issue.title}`);
      
      try {
        // Update task status
        await this.updateTaskStatus(task.task_id, 'running');
        
        // Execute based on type
        let result;
        switch (task.type) {
          case 'code_fix':
            result = await this.executeCodeFix(task);
            break;
          case 'refactor':
            result = await this.executeRefactor(task);
            break;
          case 'documentation':
            result = await this.executeDocumentation(task);
            break;
          default:
            console.log(`⚠️  Unknown task type: ${task.type}`);
            continue;
        }
        
        if (result.success) {
          console.log(`✅ Task completed successfully`);
          this.stats.tasksCompleted++;
          this.stats.issuesFixed++;
          
          await this.updateTaskStatus(task.task_id, 'complete', result);
          
          // Mark issue as resolved
          await this.resolveIssue(task.issue.issue_id, result);
        } else {
          console.log(`❌ Task failed: ${result.error}`);
          await this.updateTaskStatus(task.task_id, 'failed', result);
        }
        
      } catch (error) {
        console.error(`❌ Task execution error:`, error);
        await this.updateTaskStatus(task.task_id, 'failed', { error: error.message });
      }
    }
  }

  /**
   * Execute code fix task
   */
  async executeCodeFix(task) {
    const { issue } = task;
    
    // Step 1: Create branch
    const branchResult = await this.gitWorkflow.createAgentBranch({
      purpose: 'bugfix',
      description: issue.title,
      relatedIssues: [issue.issue_id],
      agentId: this.config.agentId,
      agentType: this.config.agentType,
    });
    
    this.stats.branchesCreated++;
    
    // Step 2: Generate fix using DeepSeek
    if (!this.deepseekService) {
      return {
        success: false,
        error: 'DeepSeek service not available',
      };
    }
    
    const fixPrompt = this.generateFixPrompt(issue);
    const fixResponse = await this.deepseekService.generateCode({
      prompt: fixPrompt,
      context: {
        file: issue.file_path,
        issue: issue.description,
        suggestion: issue.suggestion,
      },
    });
    
    if (!fixResponse || !fixResponse.code) {
      return {
        success: false,
        error: 'Failed to generate fix',
      };
    }
    
    // Step 3: Apply fix
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(this.config.rootDir, issue.file_path);
    await fs.writeFile(filePath, fixResponse.code, 'utf-8');
    
    // Step 4: Commit
    const commitResult = await this.gitWorkflow.autoCommit({
      message: `fix: ${issue.title}\n\nAuto-fix by ${this.config.agentId}\n\nIssue: ${issue.issue_id}`,
      files: [issue.file_path],
      agentId: this.config.agentId,
    });
    
    // Step 5: Create PR if configured
    if (this.config.autoPR) {
      const prResult = await this.gitWorkflow.createPullRequest({
        title: `🤖 Auto-fix: ${issue.title}`,
        body: this.generatePRBody(issue, fixResponse),
        agentId: this.config.agentId,
        agentReasoning: fixResponse.reasoning || 'Automated code fix',
      });
      
      this.stats.prsCreated++;
      
      return {
        success: true,
        branch: branchResult.branchName,
        commit: commitResult.sha,
        pr: prResult.number,
        fix: fixResponse,
      };
    }
    
    return {
      success: true,
      branch: branchResult.branchName,
      commit: commitResult.sha,
      fix: fixResponse,
    };
  }

  /**
   * Execute refactoring task
   */
  async executeRefactor(task) {
    // Similar to executeCodeFix but for refactoring
    return {
      success: false,
      error: 'Refactoring not implemented yet',
    };
  }

  /**
   * Execute documentation task
   */
  async executeDocumentation(task) {
    // Add/improve documentation
    return {
      success: false,
      error: 'Documentation generation not implemented yet',
    };
  }

  /**
   * Learn from task results
   */
  async learnFromResults() {
    if (!this.db) return;
    
    console.log('📚 Analyzing completed tasks for learning...');
    
    const result = await this.db.query(`
      SELECT 
        task_type,
        success,
        confidence_score,
        quality_score,
        output
      FROM agent_tasks
      WHERE agent_id = $1
      AND created_at > NOW() - INTERVAL '7 days'
    `, [this.config.agentId]);
    
    // Calculate success rate
    const totalTasks = result.rows.length;
    const successfulTasks = result.rows.filter(t => t.success).length;
    this.stats.successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;
    
    // Extract patterns from successful fixes
    for (const task of result.rows.filter(t => t.success)) {
      await this.extractLearningPattern(task);
    }
    
    console.log(`✅ Learned from ${result.rows.length} tasks`);
  }

  /**
   * Extract learning pattern from successful task
   */
  async extractLearningPattern(task) {
    if (!this.db || !task.output) return;
    
    try {
      const output = typeof task.output === 'string' 
        ? JSON.parse(task.output) 
        : task.output;
      
      // Create pattern signature
      const signature = this.createPatternSignature(task);
      
      // Check if pattern exists
      const existing = await this.db.query(
        `SELECT * FROM agent_learning_patterns WHERE pattern_signature = $1`,
        [signature]
      );
      
      if (existing.rows.length > 0) {
        // Update existing pattern
        await this.db.query(
          `UPDATE agent_learning_patterns 
           SET success_count = success_count + 1,
               last_used_at = CURRENT_TIMESTAMP
           WHERE pattern_signature = $1`,
          [signature]
        );
      } else {
        // Create new pattern
        await this.db.query(
          `INSERT INTO agent_learning_patterns (
            pattern_id, pattern_type, pattern_name, pattern_signature,
            solution_template, solution_confidence
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            `pattern_${Date.now()}`,
            task.task_type,
            this.generatePatternName(task),
            signature,
            output.fix?.code || '',
            task.confidence_score || 0,
          ]
        );
      }
      
    } catch (error) {
      console.error('Failed to extract learning pattern:', error);
    }
  }

  /**
   * Helper methods
   */
  
  canAutoFix(issue) {
    // Determine if issue can be auto-fixed
    const autoFixableCategories = ['style', 'documentation', 'performance'];
    const autoFixableSeverities = ['low', 'medium'];
    
    return (
      autoFixableCategories.includes(issue.category) ||
      (autoFixableSeverities.includes(issue.severity) && issue.ai_confidence > this.config.minConfidence)
    );
  }

  determineTaskType(issue) {
    if (issue.category === 'documentation') return 'documentation';
    if (issue.category === 'performance') return 'refactor';
    return 'code_fix';
  }

  calculatePriority(issue) {
    const severityScores = {
      critical: 10,
      high: 7,
      medium: 5,
      low: 3,
    };
    
    const base = severityScores[issue.severity] || 1;
    const confidence = (issue.ai_confidence || 0.5) * 5;
    
    return base + confidence;
  }

  generateFixPrompt(issue) {
    return `
Fix the following code issue:

**Issue**: ${issue.title}
**Description**: ${issue.description}
**Suggestion**: ${issue.suggestion || 'Provide appropriate fix'}

**File**: ${issue.file_path}
**Entity**: ${issue.entity_name || 'Unknown'}

Generate complete, working code that resolves this issue. Include your reasoning.
`.trim();
  }

  generatePRBody(issue, fixResponse) {
    return `
## Issue
${issue.title}

## Description
${issue.description}

## Fix Applied
${fixResponse.reasoning || 'Automated fix based on issue analysis'}

## Changed Files
- \`${issue.file_path}\`

## Confidence Score
${((fixResponse.confidence || 0) * 100).toFixed(0)}%

---
**Issue ID**: ${issue.issue_id}
**Severity**: ${issue.severity}
**Category**: ${issue.category}
`.trim();
  }

  createPatternSignature(task) {
    const components = [
      task.task_type,
      task.output?.fix?.type || 'unknown',
    ];
    
    return components.join('_');
  }

  generatePatternName(task) {
    return `${task.task_type}_pattern_${Date.now()}`;
  }

  async saveTask(task) {
    if (!this.db) return;
    
    await this.db.query(
      `INSERT INTO agent_tasks (
        task_id, task_type, task_description, context,
        agent_id, agent_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        task.task_id,
        task.type,
        task.issue.title,
        JSON.stringify({ issue: task.issue }),
        this.config.agentId,
        this.config.agentType,
        'pending',
      ]
    );
  }

  async updateTaskStatus(taskId, status, result = {}) {
    if (!this.db) return;
    
    await this.db.query(
      `UPDATE agent_tasks SET
        status = $1,
        ${status === 'complete' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
        success = $2,
        output = $3,
        error_message = $4
      WHERE task_id = $5`,
      [
        status,
        result.success || false,
        result.success ? JSON.stringify(result) : null,
        result.error || null,
        taskId,
      ]
    );
  }

  async resolveIssue(issueId, result) {
    if (!this.db) return;
    
    await this.db.query(
      `UPDATE code_issues SET
        status = 'resolved',
        resolution = $1,
        resolved_at = CURRENT_TIMESTAMP,
        resolved_by = $2,
        related_pr = $3,
        related_commit = $4
      WHERE issue_id = $5`,
      [
        'Auto-fixed by agent',
        this.config.agentId,
        result.pr || null,
        result.commit || null,
        issueId,
      ]
    );
  }
}

export default AutonomousCodeAgent;
