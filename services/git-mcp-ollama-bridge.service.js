/**
 * Git MCP to Ollama Bridge Service
 * 
 * Enables git MCP server to communicate with Ollama MCP server
 * Facilitates GitHub Desktop sync pipeline through DeepSeek
 * 
 * @module services/git-mcp-ollama-bridge
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { simpleGit } from 'simple-git';

export class GitMcpOllamaBridge extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      ollamaEndpoint: config.ollamaEndpoint || 'http://127.0.0.1:11434',
      model: config.model || 'deepseek-coder',
      gitMcpEndpoint: config.gitMcpEndpoint || 'http://localhost:3003',
      repoPath: config.repoPath || process.cwd(),
      autoSync: config.autoSync !== false,
      syncInterval: config.syncInterval || 300000, // 5 minutes
      ...config,
    };
    
    this.git = simpleGit(this.config.repoPath);
    this.syncInProgress = false;
    this.lastSync = null;
  }
  
  /**
   * Initialize the bridge
   */
  async initialize() {
    console.log('🌉 Initializing Git MCP to Ollama Bridge...');
    
    // Verify Ollama is accessible
    await this.verifyOllamaConnection();
    
    // Start auto-sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }
    
    console.log('✅ Bridge initialized');
    this.emit('initialized');
    
    return this;
  }
  
  /**
   * Verify Ollama connection
   */
  async verifyOllamaConnection() {
    try {
      const response = await axios.get(`${this.config.ollamaEndpoint}/api/tags`, {
        timeout: 5000,
      });
      
      console.log('✅ Ollama connection verified');
      return true;
    } catch (error) {
      console.warn('⚠️  Ollama not accessible:', error.message);
      return false;
    }
  }
  
  /**
   * Sync repository with GitHub using DeepSeek analysis
   */
  async syncWithGitHub() {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress...');
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      console.log('🔄 Starting GitHub sync...');
      
      // Get current status
      const status = await this.git.status();
      
      // If there are changes, analyze them with DeepSeek
      if (status.modified.length > 0 || status.not_added.length > 0) {
        const changes = await this.analyzeChanges(status);
        
        // Commit changes
        await this.commitChanges(changes);
      }
      
      // Pull latest changes
      await this.git.pull('origin', status.current);
      
      // Push local changes
      if (status.ahead > 0) {
        await this.git.push('origin', status.current);
      }
      
      this.lastSync = new Date().toISOString();
      
      console.log('✅ GitHub sync completed');
      this.emit('sync:completed', { timestamp: this.lastSync });
      
    } catch (error) {
      console.error('Failed to sync with GitHub:', error);
      this.emit('sync:failed', { error: error.message });
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Analyze changes using DeepSeek
   */
  async analyzeChanges(status) {
    console.log('🔍 Analyzing changes with DeepSeek...');
    
    // Get diff for changed files
    const diffs = [];
    
    for (const file of [...status.modified, ...status.not_added]) {
      try {
        const diff = await this.git.diff([file]);
        diffs.push({ file, diff });
      } catch (error) {
        console.warn(`Failed to get diff for ${file}:`, error.message);
      }
    }
    
    // Send to DeepSeek for analysis
    const prompt = `Analyze these code changes and generate a descriptive commit message:

${diffs.map(d => `File: ${d.file}\n\`\`\`diff\n${d.diff}\n\`\`\``).join('\n\n')}

Generate a conventional commit message following this format:
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Keep the description concise and clear.`;

    try {
      const response = await axios.post(
        `${this.config.ollamaEndpoint}/api/generate`,
        {
          model: this.config.model,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 30000,
        }
      );
      
      const commitMessage = response.data.response.trim();
      
      return {
        files: status.modified.concat(status.not_added),
        message: commitMessage,
      };
      
    } catch (error) {
      console.warn('Failed to analyze with DeepSeek, using default message:', error.message);
      
      return {
        files: status.modified.concat(status.not_added),
        message: `chore: update ${status.modified.length + status.not_added.length} file(s)`,
      };
    }
  }
  
  /**
   * Commit changes
   */
  async commitChanges(changes) {
    console.log('💾 Committing changes...');
    
    // Stage files
    await this.git.add(changes.files);
    
    // Commit with AI-generated message
    await this.git.commit(changes.message);
    
    console.log(`✅ Committed: ${changes.message}`);
  }
  
  /**
   * Handle GitHub Desktop sync pipeline
   */
  async handleDesktopSync(syncRequest) {
    console.log('🖥️  Handling GitHub Desktop sync request...');
    
    try {
      // Get branch information
      const branches = await this.git.branch();
      const currentBranch = branches.current;
      
      // Check for conflicts
      const status = await this.git.status();
      
      if (status.conflicted.length > 0) {
        // Use DeepSeek to help resolve conflicts
        const resolution = await this.resolveConflicts(status.conflicted);
        
        return {
          status: 'conflicts',
          conflicts: status.conflicted,
          resolution,
        };
      }
      
      // Perform sync
      await this.syncWithGitHub();
      
      return {
        status: 'success',
        branch: currentBranch,
        lastSync: this.lastSync,
      };
      
    } catch (error) {
      console.error('Desktop sync failed:', error);
      
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
  
  /**
   * Resolve merge conflicts with DeepSeek assistance
   */
  async resolveConflicts(conflictedFiles) {
    console.log('🔧 Attempting to resolve conflicts with DeepSeek...');
    
    const resolutions = [];
    
    for (const file of conflictedFiles) {
      try {
        // Read conflicted file
        const content = await this.git.show([`HEAD:${file}`]);
        
        // Ask DeepSeek for resolution
        const prompt = `This file has merge conflicts. Suggest a resolution:

File: ${file}

\`\`\`
${content}
\`\`\`

Provide the resolved content without conflict markers.`;

        const response = await axios.post(
          `${this.config.ollamaEndpoint}/api/generate`,
          {
            model: this.config.model,
            prompt: prompt,
            stream: false,
          },
          {
            timeout: 30000,
          }
        );
        
        resolutions.push({
          file,
          suggestion: response.data.response,
          automated: false, // Manual review required
        });
        
      } catch (error) {
        console.warn(`Failed to resolve conflict for ${file}:`, error.message);
        
        resolutions.push({
          file,
          error: error.message,
          automated: false,
        });
      }
    }
    
    return resolutions;
  }
  
  /**
   * Start automatic sync
   */
  startAutoSync() {
    console.log(`🔄 Starting auto-sync (interval: ${this.config.syncInterval}ms)`);
    
    this.syncInterval = setInterval(() => {
      this.syncWithGitHub().catch(error => {
        console.error('Auto-sync failed:', error);
      });
    }, this.config.syncInterval);
  }
  
  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Auto-sync stopped');
    }
  }
  
  /**
   * Get sync status
   */
  async getSyncStatus() {
    const status = await this.git.status();
    
    return {
      branch: status.current,
      ahead: status.ahead,
      behind: status.behind,
      modified: status.modified.length,
      untracked: status.not_added.length,
      conflicted: status.conflicted.length,
      lastSync: this.lastSync,
      syncInProgress: this.syncInProgress,
    };
  }
  
  /**
   * Create a new branch with AI-generated name
   */
  async createBranchWithAI(purpose) {
    console.log('🌿 Creating branch with AI assistance...');
    
    const prompt = `Generate a git branch name for this purpose: ${purpose}

Use kebab-case format. Examples:
- feature/user-authentication
- fix/database-connection-error
- refactor/api-endpoints

Provide only the branch name, no explanation.`;

    try {
      const response = await axios.post(
        `${this.config.ollamaEndpoint}/api/generate`,
        {
          model: this.config.model,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 10000,
        }
      );
      
      const branchName = response.data.response.trim().replace(/[^a-z0-9-/]/gi, '-');
      
      await this.git.checkoutLocalBranch(branchName);
      
      console.log(`✅ Created branch: ${branchName}`);
      
      return branchName;
      
    } catch (error) {
      console.error('Failed to create branch with AI:', error);
      throw error;
    }
  }
  
  /**
   * Shutdown the bridge
   */
  async shutdown() {
    console.log('🛑 Shutting down Git MCP Ollama Bridge...');
    
    this.stopAutoSync();
    
    console.log('✅ Bridge shut down');
    this.emit('shutdown');
  }
}

export default GitMcpOllamaBridge;
