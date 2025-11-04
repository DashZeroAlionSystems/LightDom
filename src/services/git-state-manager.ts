/**
 * Git-Based State Manager
 * Manages workflow and component state using Git for versioning and rollback
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface StateSnapshot {
  id: string;
  timestamp: Date;
  workflowId?: string;
  componentId?: string;
  state: any;
  metadata: {
    author: string;
    message: string;
    tags?: string[];
  };
  commitHash?: string;
}

export interface GitConfig {
  repository: string;
  branch: string;
  autoCommit: boolean;
  commitMessage: string;
  conflictResolution: 'ours' | 'theirs' | 'manual';
}

/**
 * Git State Manager
 * Provides Git-based state persistence for workflows and components
 */
export class GitStateManager {
  private config: GitConfig;
  private stateDir: string;
  private initialized: boolean = false;

  constructor(config: GitConfig, stateDir: string = './.lightdom-state') {
    this.config = config;
    this.stateDir = stateDir;
  }

  /**
   * Initialize Git repository for state management
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create state directory if it doesn't exist
    if (!existsSync(this.stateDir)) {
      mkdirSync(this.stateDir, { recursive: true });
    }

    // Initialize Git repo if not already initialized
    try {
      execSync('git rev-parse --git-dir', { cwd: this.stateDir, stdio: 'ignore' });
    } catch {
      execSync('git init', { cwd: this.stateDir });
      execSync('git config user.name "LightDom State Manager"', { cwd: this.stateDir });
      execSync('git config user.email "state@lightdom.com"', { cwd: this.stateDir });
    }

    // Create initial commit if repo is empty
    try {
      execSync('git rev-parse HEAD', { cwd: this.stateDir, stdio: 'ignore' });
    } catch {
      writeFileSync(join(this.stateDir, '.gitkeep'), '');
      execSync('git add .gitkeep', { cwd: this.stateDir });
      execSync('git commit -m "chore: initialize state repository"', { cwd: this.stateDir });
    }

    // Checkout or create state branch
    try {
      execSync(`git checkout ${this.config.branch}`, { cwd: this.stateDir, stdio: 'ignore' });
    } catch {
      execSync(`git checkout -b ${this.config.branch}`, { cwd: this.stateDir });
    }

    this.initialized = true;
  }

  /**
   * Save workflow state to Git
   */
  async saveWorkflowState(
    workflowId: string,
    state: any,
    message?: string
  ): Promise<StateSnapshot> {
    await this.initialize();

    const snapshot: StateSnapshot = {
      id: `workflow-${workflowId}-${Date.now()}`,
      timestamp: new Date(),
      workflowId,
      state,
      metadata: {
        author: 'system',
        message: message || `Update workflow state: ${workflowId}`,
      },
    };

    // Write state to file
    const statePath = join(this.stateDir, 'workflows', `${workflowId}.json`);
    const stateParentDir = join(this.stateDir, 'workflows');
    
    if (!existsSync(stateParentDir)) {
      mkdirSync(stateParentDir, { recursive: true });
    }

    writeFileSync(statePath, JSON.stringify(snapshot, null, 2));

    // Commit if auto-commit is enabled
    if (this.config.autoCommit) {
      snapshot.commitHash = await this.commitChanges(
        `workflows/${workflowId}.json`,
        snapshot.metadata.message
      );
    }

    return snapshot;
  }

  /**
   * Save component state to Git
   */
  async saveComponentState(
    componentId: string,
    state: any,
    message?: string
  ): Promise<StateSnapshot> {
    await this.initialize();

    const snapshot: StateSnapshot = {
      id: `component-${componentId}-${Date.now()}`,
      timestamp: new Date(),
      componentId,
      state,
      metadata: {
        author: 'system',
        message: message || `Update component state: ${componentId}`,
      },
    };

    // Write state to file
    const statePath = join(this.stateDir, 'components', `${componentId}.json`);
    const stateParentDir = join(this.stateDir, 'components');
    
    if (!existsSync(stateParentDir)) {
      mkdirSync(stateParentDir, { recursive: true });
    }

    writeFileSync(statePath, JSON.stringify(snapshot, null, 2));

    // Commit if auto-commit is enabled
    if (this.config.autoCommit) {
      snapshot.commitHash = await this.commitChanges(
        `components/${componentId}.json`,
        snapshot.metadata.message
      );
    }

    return snapshot;
  }

  /**
   * Load workflow state from Git
   */
  async loadWorkflowState(workflowId: string, commitHash?: string): Promise<StateSnapshot | null> {
    await this.initialize();

    const statePath = join(this.stateDir, 'workflows', `${workflowId}.json`);

    if (!existsSync(statePath)) {
      return null;
    }

    // Checkout specific commit if provided
    if (commitHash) {
      try {
        const content = execSync(`git show ${commitHash}:workflows/${workflowId}.json`, {
          cwd: this.stateDir,
          encoding: 'utf-8',
        });
        return JSON.parse(content);
      } catch (error) {
        console.error(`Failed to load state from commit ${commitHash}:`, error);
        return null;
      }
    }

    // Load current state
    const content = readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load component state from Git
   */
  async loadComponentState(componentId: string, commitHash?: string): Promise<StateSnapshot | null> {
    await this.initialize();

    const statePath = join(this.stateDir, 'components', `${componentId}.json`);

    if (!existsSync(statePath)) {
      return null;
    }

    // Checkout specific commit if provided
    if (commitHash) {
      try {
        const content = execSync(`git show ${commitHash}:components/${componentId}.json`, {
          cwd: this.stateDir,
          encoding: 'utf-8',
        });
        return JSON.parse(content);
      } catch (error) {
        console.error(`Failed to load state from commit ${commitHash}:`, error);
        return null;
      }
    }

    // Load current state
    const content = readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Rollback to previous state
   */
  async rollback(steps: number = 1): Promise<void> {
    await this.initialize();

    execSync(`git reset --hard HEAD~${steps}`, { cwd: this.stateDir });
  }

  /**
   * Get state history
   */
  async getHistory(filePath: string, limit: number = 10): Promise<StateSnapshot[]> {
    await this.initialize();

    try {
      const logOutput = execSync(
        `git log -${limit} --pretty=format:"%H|%aI|%s" -- ${filePath}`,
        { cwd: this.stateDir, encoding: 'utf-8' }
      );

      const commits = logOutput.split('\n').filter(line => line.trim());
      const snapshots: StateSnapshot[] = [];

      for (const commit of commits) {
        const [hash, timestamp, message] = commit.split('|');
        
        try {
          const content = execSync(`git show ${hash}:${filePath}`, {
            cwd: this.stateDir,
            encoding: 'utf-8',
          });
          
          const snapshot = JSON.parse(content);
          snapshot.commitHash = hash;
          snapshots.push(snapshot);
        } catch (error) {
          console.warn(`Failed to load commit ${hash}:`, error);
        }
      }

      return snapshots;
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * Create a tag for the current state
   */
  async createTag(tagName: string, message?: string): Promise<void> {
    await this.initialize();

    const tagMessage = message || `Tag: ${tagName}`;
    execSync(`git tag -a ${tagName} -m "${tagMessage}"`, { cwd: this.stateDir });
  }

  /**
   * List all tags
   */
  async listTags(): Promise<string[]> {
    await this.initialize();

    try {
      const output = execSync('git tag', { cwd: this.stateDir, encoding: 'utf-8' });
      return output.split('\n').filter(tag => tag.trim());
    } catch (error) {
      return [];
    }
  }

  /**
   * Checkout a specific tag
   */
  async checkoutTag(tagName: string): Promise<void> {
    await this.initialize();

    execSync(`git checkout ${tagName}`, { cwd: this.stateDir });
  }

  /**
   * Get diff between current state and previous commit
   */
  async getDiff(filePath: string): Promise<string> {
    await this.initialize();

    try {
      return execSync(`git diff HEAD~1 -- ${filePath}`, {
        cwd: this.stateDir,
        encoding: 'utf-8',
      });
    } catch (error) {
      return '';
    }
  }

  /**
   * Commit changes to Git
   */
  private async commitChanges(filePath: string, message: string): Promise<string> {
    execSync(`git add ${filePath}`, { cwd: this.stateDir });
    execSync(`git commit -m "${message}"`, { cwd: this.stateDir });
    
    const hash = execSync('git rev-parse HEAD', {
      cwd: this.stateDir,
      encoding: 'utf-8',
    }).trim();

    return hash;
  }

  /**
   * Sync with remote repository
   */
  async syncWithRemote(): Promise<void> {
    await this.initialize();

    if (!this.config.repository) {
      console.warn('No remote repository configured');
      return;
    }

    try {
      // Add remote if not exists
      try {
        execSync('git remote get-url origin', { cwd: this.stateDir, stdio: 'ignore' });
      } catch {
        execSync(`git remote add origin ${this.config.repository}`, { cwd: this.stateDir });
      }

      // Push changes
      execSync(`git push origin ${this.config.branch}`, { cwd: this.stateDir });
    } catch (error) {
      console.error('Failed to sync with remote:', error);
    }
  }

  /**
   * Pull changes from remote
   */
  async pullFromRemote(): Promise<void> {
    await this.initialize();

    if (!this.config.repository) {
      console.warn('No remote repository configured');
      return;
    }

    try {
      execSync(`git pull origin ${this.config.branch}`, { cwd: this.stateDir });
    } catch (error) {
      console.error('Failed to pull from remote:', error);
      
      // Handle conflicts based on configuration
      if (this.config.conflictResolution === 'ours') {
        execSync('git checkout --ours .', { cwd: this.stateDir });
        execSync('git add .', { cwd: this.stateDir });
        execSync('git commit -m "chore: resolve conflicts (ours)"', { cwd: this.stateDir });
      } else if (this.config.conflictResolution === 'theirs') {
        execSync('git checkout --theirs .', { cwd: this.stateDir });
        execSync('git add .', { cwd: this.stateDir });
        execSync('git commit -m "chore: resolve conflicts (theirs)"', { cwd: this.stateDir });
      }
    }
  }

  /**
   * Clean up old commits (keep only last N commits)
   */
  async cleanup(keepCommits: number = 100): Promise<void> {
    await this.initialize();

    try {
      // Get commit hash to keep
      const keepHash = execSync(`git rev-parse HEAD~${keepCommits}`, {
        cwd: this.stateDir,
        encoding: 'utf-8',
      }).trim();

      // Create orphan branch from that commit
      execSync('git checkout --orphan temp', { cwd: this.stateDir });
      execSync(`git reset --hard ${keepHash}`, { cwd: this.stateDir });
      
      // Delete old branch and rename temp
      execSync(`git branch -D ${this.config.branch}`, { cwd: this.stateDir });
      execSync(`git branch -m ${this.config.branch}`, { cwd: this.stateDir });
      
      // Force push if remote exists
      if (this.config.repository) {
        execSync(`git push -f origin ${this.config.branch}`, { cwd: this.stateDir });
      }
    } catch (error) {
      console.error('Failed to cleanup old commits:', error);
    }
  }
}

export default GitStateManager;
