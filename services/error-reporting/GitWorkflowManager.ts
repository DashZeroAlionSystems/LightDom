/**
 * Git Workflow Manager
 *
 * Handles Git operations for automated error remediation:
 * - Branch creation
 * - Staging changes
 * - Committing with formatted messages
 * - Creating PRs
 * - GitHub Desktop integration
 *
 * @module services/error-reporting/GitWorkflowManager
 */

import { exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitWorkflowConfig {
  workflow?: {
    branchPrefix: string;
    autoCommit: boolean;
    requireApproval: boolean;
    draftPR: boolean;
    useGitHubDesktop: boolean;
  };
  commitTemplate?: {
    type: string;
    scope: string;
    format: string;
  };
}

export interface CommitOptions {
  branch?: string;
  message: string;
  files?: string[];
  dryRun?: boolean;
}

export interface PROptions {
  title: string;
  body: string;
  draft?: boolean;
  labels?: string[];
}

export class GitWorkflowManager {
  private config: GitWorkflowConfig;
  private logger: Console;
  private repoRoot: string;

  constructor(config: GitWorkflowConfig, logger: Console = console) {
    this.config = config;
    this.logger = logger;
    this.repoRoot = process.cwd();
  }

  /**
   * Check if we're in a Git repository
   */
  async isGitRepo(): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: this.repoRoot });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', {
      cwd: this.repoRoot,
    });
    return stdout.trim();
  }

  /**
   * Check if working directory is clean
   */
  async isWorkingDirectoryClean(): Promise<boolean> {
    const { stdout } = await execAsync('git status --porcelain', {
      cwd: this.repoRoot,
    });
    return stdout.trim() === '';
  }

  /**
   * Create a new branch for error fix
   */
  async createBranch(errorHash: string): Promise<string> {
    const prefix = this.config.workflow?.branchPrefix || 'fix/deepseek-';
    const branchName = `${prefix}${errorHash.substring(0, 8)}`;

    this.logger.info(`[GitWorkflowManager] Creating branch: ${branchName}`);

    // Check if branch already exists
    try {
      await execAsync(`git rev-parse --verify ${branchName}`, { cwd: this.repoRoot });
      this.logger.warn(`[GitWorkflowManager] Branch ${branchName} already exists`);
      return branchName;
    } catch {
      // Branch doesn't exist, create it
    }

    // Create branch
    await execAsync(`git checkout -b ${branchName}`, { cwd: this.repoRoot });
    this.logger.info(`[GitWorkflowManager] Branch created: ${branchName}`);

    return branchName;
  }

  /**
   * Stage files for commit
   */
  async stageFiles(files: string[]): Promise<void> {
    if (files.length === 0) {
      this.logger.warn('[GitWorkflowManager] No files to stage');
      return;
    }

    this.logger.info(`[GitWorkflowManager] Staging ${files.length} files`);

    for (const file of files) {
      try {
        await execAsync(`git add "${file}"`, { cwd: this.repoRoot });
      } catch (err) {
        this.logger.warn(`[GitWorkflowManager] Failed to stage ${file}:`, err);
      }
    }
  }

  /**
   * Create a commit
   */
  async commit(options: CommitOptions): Promise<string> {
    const { message, files = [], dryRun = false } = options;

    // Validate commit message
    if (!message || message.trim().length === 0) {
      throw new Error('Commit message is required');
    }

    // Stage files if provided
    if (files.length > 0) {
      await this.stageFiles(files);
    }

    // Check if there are staged changes
    const { stdout: stagedFiles } = await execAsync('git diff --cached --name-only', {
      cwd: this.repoRoot,
    });

    if (stagedFiles.trim().length === 0) {
      throw new Error('No staged changes to commit');
    }

    if (dryRun) {
      this.logger.info('[GitWorkflowManager] DRY RUN - would commit with message:');
      this.logger.info(message);
      return 'DRY_RUN';
    }

    // Create commit
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: this.repoRoot,
    });

    // Get commit hash
    const { stdout: commitHash } = await execAsync('git rev-parse HEAD', {
      cwd: this.repoRoot,
    });

    const hash = commitHash.trim();
    this.logger.info(`[GitWorkflowManager] Commit created: ${hash.substring(0, 7)}`);

    return hash;
  }

  /**
   * Format commit message using conventional commits
   */
  formatCommitMessage(options: {
    type: string;
    scope?: string;
    subject: string;
    body?: string;
    footer?: string;
  }): string {
    const { type, scope, subject, body, footer } = options;

    let message = `${type}`;
    if (scope) {
      message += `(${scope})`;
    }
    message += `: ${subject}`;

    if (body) {
      message += `\n\n${body}`;
    }

    if (footer) {
      message += `\n\n${footer}`;
    }

    return message;
  }

  /**
   * Create a pull request
   */
  async createPR(options: PROptions): Promise<{ url?: string; number?: number }> {
    const { title, body, draft = true, labels = [] } = options;

    // Check if GitHub CLI is available
    const hasGH = await this.hasGitHubCLI();

    if (!hasGH) {
      this.logger.warn('[GitWorkflowManager] GitHub CLI not available, skipping PR creation');
      this.logger.info('[GitWorkflowManager] Install gh CLI: https://cli.github.com/');
      return {};
    }

    // Build gh command
    let cmd = `gh pr create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`;

    if (draft) {
      cmd += ' --draft';
    }

    if (labels.length > 0) {
      cmd += ` --label "${labels.join(',')}"`;
    }

    try {
      const { stdout } = await execAsync(cmd, { cwd: this.repoRoot });
      const url = stdout.trim();

      this.logger.info(`[GitWorkflowManager] PR created: ${url}`);

      // Extract PR number from URL
      const match = url.match(/\/pull\/(\d+)$/);
      const number = match ? parseInt(match[1], 10) : undefined;

      return { url, number };
    } catch (err) {
      this.logger.error('[GitWorkflowManager] Failed to create PR:', err);
      throw err;
    }
  }

  /**
   * Check if GitHub CLI is available
   */
  async hasGitHubCLI(): Promise<boolean> {
    try {
      await execAsync('gh --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if GitHub Desktop is available
   */
  async hasGitHubDesktop(): Promise<boolean> {
    if (process.platform === 'win32') {
      // Check Windows paths
      const paths = [
        'C:\\Program Files\\GitHub Desktop\\GitHubDesktop.exe',
        'C:\\Program Files (x86)\\GitHub Desktop\\GitHubDesktop.exe',
        join(process.env.LOCALAPPDATA || '', 'GitHubDesktop\\GitHubDesktop.exe'),
      ];

      return paths.some(p => existsSync(p));
    } else if (process.platform === 'darwin') {
      // Check macOS
      return existsSync('/Applications/GitHub Desktop.app');
    }

    return false;
  }

  /**
   * Open GitHub Desktop to current repo
   */
  async openInGitHubDesktop(): Promise<void> {
    if (!this.config.workflow?.useGitHubDesktop) {
      this.logger.info('[GitWorkflowManager] GitHub Desktop integration disabled');
      return;
    }

    const hasDesktop = await this.hasGitHubDesktop();
    if (!hasDesktop) {
      this.logger.warn('[GitWorkflowManager] GitHub Desktop not found');
      return;
    }

    try {
      // Open using github-desktop:// protocol
      const repoPath = this.repoRoot.replace(/\\/g, '/');
      const url = `github-desktop://openRepo/${repoPath}`;

      if (process.platform === 'win32') {
        await execAsync(`start "" "${url}"`);
      } else if (process.platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }

      this.logger.info('[GitWorkflowManager] Opened in GitHub Desktop');
    } catch (err) {
      this.logger.warn('[GitWorkflowManager] Failed to open GitHub Desktop:', err);
    }
  }

  /**
   * Sync with GitHub Desktop workflow
   */
  async syncWithGitHubDesktop(): Promise<void> {
    // Push to remote
    try {
      const currentBranch = await this.getCurrentBranch();
      await execAsync(`git push -u origin ${currentBranch}`, { cwd: this.repoRoot });
      this.logger.info(`[GitWorkflowManager] Pushed ${currentBranch} to origin`);

      // Open in GitHub Desktop
      await this.openInGitHubDesktop();
    } catch (err) {
      this.logger.error('[GitWorkflowManager] Sync failed:', err);
      throw err;
    }
  }

  /**
   * Complete workflow: branch, commit, push, PR
   */
  async executeWorkflow(options: {
    errorHash: string;
    commitMessage: string;
    files: string[];
    prTitle: string;
    prBody: string;
  }): Promise<{ branch: string; commit: string; pr?: { url?: string; number?: number } }> {
    const { errorHash, commitMessage, files, prTitle, prBody } = options;

    // Safety checks
    if (!(await this.isGitRepo())) {
      throw new Error('Not a Git repository');
    }

    const isClean = await this.isWorkingDirectoryClean();
    if (!isClean && !this.config.workflow?.requireApproval) {
      throw new Error('Working directory has uncommitted changes');
    }

    // Create branch
    const branch = await this.createBranch(errorHash);

    // Commit changes (if auto-commit enabled)
    let commit = '';
    if (this.config.workflow?.autoCommit) {
      commit = await this.commit({ message: commitMessage, files });
    } else {
      this.logger.info('[GitWorkflowManager] Auto-commit disabled, staging files only');
      await this.stageFiles(files);
    }

    // Create PR (if draft enabled)
    let pr;
    if (this.config.workflow?.draftPR) {
      pr = await this.createPR({
        title: prTitle,
        body: prBody,
        draft: true,
        labels: ['automated', 'deepseek-fix'],
      });
    }

    // Sync with GitHub Desktop
    if (this.config.workflow?.useGitHubDesktop) {
      await this.syncWithGitHubDesktop();
    }

    return { branch, commit, pr };
  }
}

export default GitWorkflowManager;
