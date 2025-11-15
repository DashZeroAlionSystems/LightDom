/**
 * Git Workflow Automation Service
 * 
 * Autonomous git operations for AI agents:
 * - Automatic branch creation
 * - PR management
 * - Commit automation
 * - Merge conflict detection
 * - GitHub integration
 * 
 * Inspired by:
 * - GitHub Desktop workflow
 * - GitKraken automation
 * - Linear's git integration
 * - Graphite's stacked PRs
 */

import { EventEmitter } from 'events';
import { simpleGit } from 'simple-git';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

export class GitWorkflowAutomationService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      repoPath: config.repoPath || process.cwd(),
      baseBranch: config.baseBranch || 'main',
      branchPrefix: config.branchPrefix || 'agent/',
      autoCommit: config.autoCommit !== false,
      autoPR: config.autoPR !== false,
      ...config,
    };

    this.db = config.db;
    this.git = simpleGit(this.config.repoPath);
    
    // GitHub API
    if (config.githubToken) {
      this.octokit = new Octokit({
        auth: config.githubToken,
      });
    }
    
    this.repoOwner = config.repoOwner;
    this.repoName = config.repoName;
  }

  /**
   * Create a new agent-managed branch
   */
  async createAgentBranch(options = {}) {
    const {
      purpose = 'feature',
      description = '',
      relatedIssues = [],
      agentId = 'autonomous',
      agentType = 'code_fix',
    } = options;
    
    console.log(`🌿 Creating agent branch for ${purpose}...`);
    
    // Generate branch name
    const branchName = this.generateBranchName(purpose, description);
    
    try {
      // Ensure we're on base branch and up to date
      await this.git.checkout(this.config.baseBranch);
      await this.git.pull('origin', this.config.baseBranch);
      
      // Create new branch
      await this.git.checkoutLocalBranch(branchName);
      
      // Save to database
      const branch = await this.saveBranchToDb({
        branch_name: branchName,
        base_branch: this.config.baseBranch,
        purpose,
        description,
        related_issues: relatedIssues,
        created_by_agent: agentId,
        agent_type: agentType,
      });
      
      console.log(`✅ Created branch: ${branchName}`);
      
      this.emit('branch:created', { branchName, branch });
      
      return {
        branchName,
        branch,
      };
      
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  /**
   * Make automated commit
   */
  async autoCommit(options = {}) {
    const {
      message,
      files = [],
      agentId = 'autonomous',
    } = options;
    
    if (!message) {
      throw new Error('Commit message is required');
    }
    
    console.log(`💾 Auto-committing: ${message}`);
    
    try {
      // Add files
      if (files.length > 0) {
        await this.git.add(files);
      } else {
        await this.git.add('.');
      }
      
      // Get status
      const status = await this.git.status();
      
      if (status.files.length === 0) {
        console.log('⚠️  No changes to commit');
        return null;
      }
      
      // Commit
      const commit = await this.git.commit(message, files);
      
      console.log(`✅ Committed: ${commit.commit}`);
      
      this.emit('commit:created', {
        sha: commit.commit,
        message,
        files: status.files,
        agentId,
      });
      
      return {
        sha: commit.commit,
        message,
        files: status.files.map(f => f.path),
      };
      
    } catch (error) {
      console.error('Failed to commit:', error);
      throw error;
    }
  }

  /**
   * Push branch to remote
   */
  async pushBranch(branchName = null) {
    const branch = branchName || await this.getCurrentBranch();
    
    console.log(`⬆️  Pushing ${branch} to remote...`);
    
    try {
      await this.git.push('origin', branch, ['--set-upstream']);
      
      console.log(`✅ Pushed ${branch}`);
      
      this.emit('branch:pushed', { branch });
      
      return { branch };
      
    } catch (error) {
      console.error('Failed to push:', error);
      throw error;
    }
  }

  /**
   * Create pull request
   */
  async createPullRequest(options = {}) {
    if (!this.octokit) {
      throw new Error('GitHub token required for PR creation');
    }
    
    const {
      title,
      body = '',
      baseBranch = this.config.baseBranch,
      headBranch = null,
      draft = false,
      agentId = 'autonomous',
      agentReasoning = '',
    } = options;
    
    const branch = headBranch || await this.getCurrentBranch();
    
    if (!title) {
      throw new Error('PR title is required');
    }
    
    console.log(`📝 Creating PR: ${title}`);
    
    try {
      // Push branch first
      await this.pushBranch(branch);
      
      // Create PR
      const pr = await this.octokit.pulls.create({
        owner: this.repoOwner,
        repo: this.repoName,
        title,
        body: this.formatPRBody(body, agentId, agentReasoning),
        head: branch,
        base: baseBranch,
        draft,
      });
      
      console.log(`✅ Created PR #${pr.data.number}`);
      
      // Save to database
      await this.savePRToDb({
        pr_number: pr.data.number,
        branch_id: branch,
        title,
        description: body,
        agent_reasoning: agentReasoning,
      });
      
      this.emit('pr:created', {
        number: pr.data.number,
        url: pr.data.html_url,
        branch,
      });
      
      return {
        number: pr.data.number,
        url: pr.data.html_url,
        branch,
      };
      
    } catch (error) {
      console.error('Failed to create PR:', error);
      throw error;
    }
  }

  /**
   * Auto-create issue when problem is detected
   */
  async createIssue(options = {}) {
    if (!this.octokit) {
      throw new Error('GitHub token required for issue creation');
    }
    
    const {
      title,
      body = '',
      labels = [],
      assignees = [],
      codeIssueId = null,
    } = options;
    
    if (!title) {
      throw new Error('Issue title is required');
    }
    
    console.log(`🐛 Creating issue: ${title}`);
    
    try {
      const issue = await this.octokit.issues.create({
        owner: this.repoOwner,
        repo: this.repoName,
        title,
        body,
        labels,
        assignees,
      });
      
      console.log(`✅ Created issue #${issue.data.number}`);
      
      // Link to code issue if provided
      if (codeIssueId && this.db) {
        await this.db.query(
          `UPDATE code_issues SET 
            metadata = metadata || $1::jsonb 
          WHERE issue_id = $2`,
          [
            JSON.stringify({ github_issue: issue.data.number }),
            codeIssueId,
          ]
        );
      }
      
      this.emit('issue:created', {
        number: issue.data.number,
        url: issue.data.html_url,
      });
      
      return {
        number: issue.data.number,
        url: issue.data.html_url,
      };
      
    } catch (error) {
      console.error('Failed to create issue:', error);
      throw error;
    }
  }

  /**
   * Detect merge conflicts
   */
  async detectMergeConflicts(targetBranch = null) {
    const target = targetBranch || this.config.baseBranch;
    const current = await this.getCurrentBranch();
    
    console.log(`🔍 Checking for merge conflicts with ${target}...`);
    
    try {
      // Fetch latest
      await this.git.fetch('origin', target);
      
      // Try merge --no-commit --no-ff
      try {
        await this.git.raw(['merge', '--no-commit', '--no-ff', `origin/${target}`]);
        
        // Check status
        const status = await this.git.status();
        
        // Abort merge
        await this.git.raw(['merge', '--abort']);
        
        if (status.conflicted.length > 0) {
          console.log(`⚠️  Found ${status.conflicted.length} conflicts`);
          
          return {
            hasConflicts: true,
            conflictedFiles: status.conflicted,
          };
        }
        
        console.log(`✅ No conflicts with ${target}`);
        
        return {
          hasConflicts: false,
          conflictedFiles: [],
        };
        
      } catch (error) {
        // Merge attempt failed - likely has conflicts
        await this.git.raw(['merge', '--abort']).catch(() => {});
        
        return {
          hasConflicts: true,
          conflictedFiles: [],
          error: error.message,
        };
      }
      
    } catch (error) {
      console.error('Failed to detect conflicts:', error);
      throw error;
    }
  }

  /**
   * Get diff summary
   */
  async getDiffSummary(targetBranch = null) {
    const target = targetBranch || this.config.baseBranch;
    
    try {
      const diff = await this.git.diffSummary([`origin/${target}`]);
      
      return {
        filesChanged: diff.files.length,
        insertions: diff.insertions,
        deletions: diff.deletions,
        files: diff.files.map(f => ({
          file: f.file,
          changes: f.changes,
          insertions: f.insertions,
          deletions: f.deletions,
        })),
      };
      
    } catch (error) {
      console.error('Failed to get diff:', error);
      return null;
    }
  }

  /**
   * Check if branch is up to date
   */
  async isUpToDate(targetBranch = null) {
    const target = targetBranch || this.config.baseBranch;
    
    try {
      await this.git.fetch('origin', target);
      
      const status = await this.git.status();
      
      return {
        upToDate: status.behind === 0,
        behind: status.behind,
        ahead: status.ahead,
      };
      
    } catch (error) {
      console.error('Failed to check status:', error);
      return null;
    }
  }

  /**
   * Sync with base branch (GitHub Desktop style)
   */
  async syncWithBase() {
    const current = await this.getCurrentBranch();
    const base = this.config.baseBranch;
    
    console.log(`🔄 Syncing ${current} with ${base}...`);
    
    try {
      // Fetch latest
      await this.git.fetch('origin', base);
      
      // Check status
      const upToDate = await this.isUpToDate(base);
      
      if (upToDate.upToDate) {
        console.log(`✅ Already up to date`);
        return { synced: true, conflicts: false };
      }
      
      // Try to rebase
      try {
        await this.git.rebase([`origin/${base}`]);
        console.log(`✅ Rebased successfully`);
        
        return { synced: true, conflicts: false };
        
      } catch (error) {
        // Rebase failed - likely conflicts
        await this.git.rebase(['--abort']).catch(() => {});
        
        console.log(`⚠️  Rebase failed, attempting merge...`);
        
        // Try merge instead
        try {
          await this.git.merge([`origin/${base}`]);
          console.log(`✅ Merged successfully`);
          
          return { synced: true, conflicts: false };
          
        } catch (mergeError) {
          console.log(`❌ Merge has conflicts`);
          
          return {
            synced: false,
            conflicts: true,
            error: mergeError.message,
          };
        }
      }
      
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  
  generateBranchName(purpose, description) {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    const slug = description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30);
    
    return `${this.config.branchPrefix}${purpose}/${slug}-${hash}`;
  }

  formatPRBody(body, agentId, reasoning) {
    let formatted = body;
    
    formatted += '\n\n---\n';
    formatted += `\n**🤖 Created by Agent**: \`${agentId}\`\n`;
    
    if (reasoning) {
      formatted += `\n**Agent Reasoning**:\n${reasoning}\n`;
    }
    
    formatted += '\n*This PR was automatically created by an AI agent.*';
    
    return formatted;
  }

  async getCurrentBranch() {
    const status = await this.git.status();
    return status.current;
  }

  async saveBranchToDb(branchData) {
    if (!this.db) return branchData;
    
    const branchId = crypto.randomBytes(16).toString('hex');
    
    await this.db.query(
      `INSERT INTO agent_branches (
        branch_id, branch_name, base_branch, purpose, description,
        related_issues, created_by_agent, agent_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        branchId,
        branchData.branch_name,
        branchData.base_branch,
        branchData.purpose,
        branchData.description,
        branchData.related_issues,
        branchData.created_by_agent,
        branchData.agent_type,
      ]
    );
    
    return { ...branchData, branch_id: branchId };
  }

  async savePRToDb(prData) {
    if (!this.db) return prData;
    
    const prId = crypto.randomBytes(16).toString('hex');
    
    await this.db.query(
      `INSERT INTO agent_pull_requests (
        pr_id, branch_id, title, description, pr_number, agent_reasoning
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        prId,
        prData.branch_id,
        prData.title,
        prData.description,
        prData.pr_number,
        prData.agent_reasoning,
      ]
    );
    
    return { ...prData, pr_id: prId };
  }

  /**
   * Get branch status
   */
  async getBranchStatus() {
    const status = await this.git.status();
    
    return {
      branch: status.current,
      ahead: status.ahead,
      behind: status.behind,
      staged: status.staged,
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      renamed: status.renamed,
      conflicted: status.conflicted,
      isClean: status.isClean(),
    };
  }
}

export default GitWorkflowAutomationService;
