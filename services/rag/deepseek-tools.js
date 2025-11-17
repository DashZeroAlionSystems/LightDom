/**
 * DeepSeek Computer Use Tools
 * Provides command execution, Git workflow, and development task automation
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Maximum command execution time (30 seconds)
const COMMAND_TIMEOUT = 30000;

// Allowed commands for safety
const ALLOWED_COMMANDS = {
  git: [
    'status', 'log', 'diff', 'branch', 'checkout', 'add', 'commit', 
    'push', 'pull', 'clone', 'remote', 'fetch', 'merge', 'rebase',
    'stash', 'tag', 'show', 'config'
  ],
  npm: ['install', 'run', 'start', 'test', 'build', 'list', 'outdated', 'update'],
  node: ['--version', '-v'],
  ls: true,
  dir: true,
  pwd: true,
  cd: true,
  mkdir: true,
  cat: true,
  echo: true,
  type: true, // Windows equivalent of cat
  where: true, // Windows equivalent of which
  which: true,
};

/**
 * Execute shell command with safety checks
 */
export async function executeCommand(command, options = {}) {
  const {
    cwd = process.cwd(),
    shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    timeout = COMMAND_TIMEOUT,
    env = process.env
  } = options;

  // Safety check - validate command
  const [cmd, ...args] = command.trim().split(/\s+/);
  const cmdLower = cmd.toLowerCase();

  // Check if command is allowed
  if (!isCommandAllowed(cmdLower, args)) {
    throw new Error(`Command not allowed for security reasons: ${cmd}`);
  }

  try {
    const result = await execAsync(command, {
      cwd,
      shell,
      timeout,
      env,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    return {
      success: true,
      stdout: result.stdout,
      stderr: result.stderr,
      command,
      cwd
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      command,
      cwd
    };
  }
}

/**
 * Check if command is allowed
 */
function isCommandAllowed(cmd, args) {
  // Check if command is in allowed list
  if (ALLOWED_COMMANDS[cmd] === true) {
    return true;
  }

  if (Array.isArray(ALLOWED_COMMANDS[cmd])) {
    // For commands with subcommands (like git), check first arg
    if (args.length === 0) return false;
    return ALLOWED_COMMANDS[cmd].includes(args[0]);
  }

  return false;
}

/**
 * Git Operations
 */
export const gitTools = {
  /**
   * Get repository status
   */
  async status(repoPath = process.cwd()) {
    return executeCommand('git status --short', { cwd: repoPath });
  },

  /**
   * Create a new branch
   */
  async createBranch(branchName, repoPath = process.cwd()) {
    return executeCommand(`git checkout -b ${branchName}`, { cwd: repoPath });
  },

  /**
   * Switch to branch
   */
  async switchBranch(branchName, repoPath = process.cwd()) {
    return executeCommand(`git checkout ${branchName}`, { cwd: repoPath });
  },

  /**
   * Stage files
   */
  async add(files = '.', repoPath = process.cwd()) {
    return executeCommand(`git add ${files}`, { cwd: repoPath });
  },

  /**
   * Commit changes
   */
  async commit(message, repoPath = process.cwd()) {
    const escapedMessage = message.replace(/"/g, '\\"');
    return executeCommand(`git commit -m "${escapedMessage}"`, { cwd: repoPath });
  },

  /**
   * Push changes
   */
  async push(remote = 'origin', branch = '', repoPath = process.cwd()) {
    const cmd = branch ? `git push ${remote} ${branch}` : `git push ${remote}`;
    return executeCommand(cmd, { cwd: repoPath });
  },

  /**
   * Pull changes
   */
  async pull(remote = 'origin', branch = '', repoPath = process.cwd()) {
    const cmd = branch ? `git pull ${remote} ${branch}` : `git pull ${remote}`;
    return executeCommand(cmd, { cwd: repoPath });
  },

  /**
   * Get diff
   */
  async diff(files = '', repoPath = process.cwd()) {
    const cmd = files ? `git diff ${files}` : 'git diff';
    return executeCommand(cmd, { cwd: repoPath });
  },

  /**
   * Get commit log
   */
  async log(count = 10, repoPath = process.cwd()) {
    return executeCommand(`git log --oneline -n ${count}`, { cwd: repoPath });
  },

  /**
   * List branches
   */
  async listBranches(repoPath = process.cwd()) {
    return executeCommand('git branch -a', { cwd: repoPath });
  },

  /**
   * Create issue/ticket (using Git commit message convention)
   */
  async createIssue(title, description, labels = [], repoPath = process.cwd()) {
    const labelsStr = labels.length > 0 ? `[${labels.join(', ')}]` : '';
    const commitMessage = `${labelsStr} ${title}\n\n${description}`;
    
    // Create a new branch for the issue
    const branchName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await this.createBranch(`issue/${branchName}`, repoPath);
    
    return {
      success: true,
      branchName: `issue/${branchName}`,
      title,
      description
    };
  }
};

/**
 * File System Operations
 */
export const fileTools = {
  /**
   * Read file
   */
  async read(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        success: true,
        content,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  },

  /**
   * Write file
   */
  async write(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return {
        success: true,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  },

  /**
   * List directory
   */
  async list(dirPath = '.') {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const entries = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: path.join(dirPath, item.name)
      }));
      
      return {
        success: true,
        entries,
        path: dirPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: dirPath
      };
    }
  },

  /**
   * Create directory
   */
  async mkdir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return {
        success: true,
        path: dirPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: dirPath
      };
    }
  }
};

/**
 * Project Management Tools
 */
export const projectTools = {
  /**
   * Install dependencies
   */
  async installDependencies(projectPath = process.cwd()) {
    return executeCommand('npm install', { cwd: projectPath });
  },

  /**
   * Run npm script
   */
  async runScript(scriptName, projectPath = process.cwd()) {
    return executeCommand(`npm run ${scriptName}`, { cwd: projectPath });
  },

  /**
   * Start project
   */
  async start(projectPath = process.cwd()) {
    return executeCommand('npm start', { cwd: projectPath });
  },

  /**
   * Build project
   */
  async build(projectPath = process.cwd()) {
    return executeCommand('npm run build', { cwd: projectPath });
  },

  /**
   * Run tests
   */
  async test(projectPath = process.cwd()) {
    return executeCommand('npm test', { cwd: projectPath });
  },

  /**
   * Get project info
   */
  async getInfo(projectPath = process.cwd()) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      return {
        success: true,
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        scripts: Object.keys(packageJson.scripts || {}),
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {})
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * System Information Tools
 */
export const systemTools = {
  /**
   * Get system info
   */
  async getInfo() {
    return {
      success: true,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cwd: process.cwd(),
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      }
    };
  },

  /**
   * Get environment variables
   */
  async getEnv(keys = []) {
    const env = {};
    
    if (keys.length === 0) {
      // Return safe subset of env vars
      const safeKeys = Object.keys(process.env).filter(key => 
        !key.includes('KEY') && 
        !key.includes('SECRET') && 
        !key.includes('TOKEN') &&
        !key.includes('PASSWORD')
      );
      
      safeKeys.forEach(key => {
        env[key] = process.env[key];
      });
    } else {
      keys.forEach(key => {
        env[key] = process.env[key];
      });
    }
    
    return {
      success: true,
      env
    };
  }
};

/**
 * All tools combined
 */
export const deepseekTools = {
  command: executeCommand,
  git: gitTools,
  file: fileTools,
  project: projectTools,
  system: systemTools
};

export default deepseekTools;
