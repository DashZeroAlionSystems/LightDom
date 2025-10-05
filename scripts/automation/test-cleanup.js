#!/usr/bin/env node

/**
 * Test Cleanup Script for LightDom Space-Bridge Platform
 * This script cleans up test artifacts and environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.cyan}Running: ${description}${colors.reset}`);
  log(`${colors.yellow}Command: ${command}${colors.reset}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`${colors.green}✓ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

function cleanupTestDirectories() {
  log(`${colors.bright}Cleaning up test directories...${colors.reset}`);
  
  const testDirs = [
    'coverage',
    'test-results',
    'logs',
    'artifacts',
    'temp',
    'node_modules/.cache',
  ];
  
  testDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        log(`${colors.green}✓ Removed directory: ${dir}${colors.reset}`);
      } catch (error) {
        log(`${colors.yellow}⚠ Could not remove directory: ${dir} - ${error.message}${colors.reset}`);
      }
    }
  });
}

function cleanupTestFiles() {
  log(`${colors.bright}Cleaning up test files...${colors.reset}`);
  
  const testFiles = [
    '.env.test',
    'test-report.html',
    'coverage.lcov',
    'test-results.xml',
    'junit.xml',
  ];
  
  testFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        log(`${colors.green}✓ Removed file: ${file}${colors.reset}`);
      } catch (error) {
        log(`${colors.yellow}⚠ Could not remove file: ${file} - ${error.message}${colors.reset}`);
      }
    }
  });
}

function cleanupDockerContainers() {
  log(`${colors.bright}Cleaning up Docker containers...${colors.reset}`);
  
  const commands = [
    { command: 'docker-compose -f docker-compose.test.yml down -v', description: 'Stop test containers and remove volumes' },
    { command: 'docker-compose -f docker-compose.dev.yml down -v', description: 'Stop dev containers and remove volumes' },
    { command: 'docker container prune -f', description: 'Remove stopped containers' },
    { command: 'docker image prune -f', description: 'Remove unused images' },
    { command: 'docker volume prune -f', description: 'Remove unused volumes' },
    { command: 'docker network prune -f', description: 'Remove unused networks' },
  ];
  
  commands.forEach(cmd => {
    try {
      execSync(cmd.command, { stdio: 'pipe' });
      log(`${colors.green}✓ ${cmd.description}${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠ ${cmd.description} - ${error.message}${colors.reset}`);
    }
  });
}

function cleanupNodeModules() {
  log(`${colors.bright}Cleaning up node_modules...${colors.reset}`);
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    try {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      log(`${colors.green}✓ Removed node_modules directory${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠ Could not remove node_modules - ${error.message}${colors.reset}`);
    }
  }
  
  // Clean npm cache
  try {
    execSync('npm cache clean --force', { stdio: 'pipe' });
    log(`${colors.green}✓ Cleaned npm cache${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠ Could not clean npm cache - ${error.message}${colors.reset}`);
  }
}

function cleanupPlaywright() {
  log(`${colors.bright}Cleaning up Playwright...${colors.reset}`);
  
  try {
    execSync('npx playwright uninstall', { stdio: 'pipe' });
    log(`${colors.green}✓ Uninstalled Playwright browsers${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠ Could not uninstall Playwright - ${error.message}${colors.reset}`);
  }
}

function cleanupJest() {
  log(`${colors.bright}Cleaning up Jest...${colors.reset}`);
  
  const jestDirs = [
    '.jest',
    'jest-cache',
  ];
  
  jestDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        log(`${colors.green}✓ Removed Jest directory: ${dir}${colors.reset}`);
      } catch (error) {
        log(`${colors.yellow}⚠ Could not remove Jest directory: ${dir} - ${error.message}${colors.reset}`);
      }
    }
  });
}

function cleanupCoverage() {
  log(`${colors.bright}Cleaning up coverage reports...${colors.reset}`);
  
  const coveragePath = path.join(process.cwd(), 'coverage');
  if (fs.existsSync(coveragePath)) {
    try {
      fs.rmSync(coveragePath, { recursive: true, force: true });
      log(`${colors.green}✓ Removed coverage directory${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠ Could not remove coverage directory - ${error.message}${colors.reset}`);
    }
  }
}

function cleanupLogs() {
  log(`${colors.bright}Cleaning up log files...${colors.reset}`);
  
  const logFiles = [
    '*.log',
    'logs/*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
  ];
  
  logFiles.forEach(pattern => {
    try {
      execSync(`find . -name "${pattern}" -type f -delete`, { stdio: 'pipe' });
      log(`${colors.green}✓ Removed log files: ${pattern}${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠ Could not remove log files: ${pattern} - ${error.message}${colors.reset}`);
    }
  });
}

function cleanupTempFiles() {
  log(`${colors.bright}Cleaning up temporary files...${colors.reset}`);
  
  const tempPatterns = [
    '*.tmp',
    '*.temp',
    '.DS_Store',
    'Thumbs.db',
    '*.swp',
    '*.swo',
    '*~',
  ];
  
  tempPatterns.forEach(pattern => {
    try {
      execSync(`find . -name "${pattern}" -type f -delete`, { stdio: 'pipe' });
      log(`${colors.green}✓ Removed temp files: ${pattern}${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠ Could not remove temp files: ${pattern} - ${error.message}${colors.reset}`);
    }
  });
}

function cleanupArtifacts() {
  log(`${colors.bright}Cleaning up build artifacts...${colors.reset}`);
  
  const artifactDirs = [
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    '.vuepress/dist',
  ];
  
  artifactDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        log(`${colors.green}✓ Removed artifact directory: ${dir}${colors.reset}`);
      } catch (error) {
        log(`${colors.yellow}⚠ Could not remove artifact directory: ${dir} - ${error.message}${colors.reset}`);
      }
    }
  });
}

function cleanupGit() {
  log(`${colors.bright}Cleaning up Git artifacts...${colors.reset}`);
  
  try {
    execSync('git clean -fd', { stdio: 'pipe' });
    log(`${colors.green}✓ Cleaned untracked files${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠ Could not clean Git files - ${error.message}${colors.reset}`);
  }
}

function showCleanupSummary() {
  log(`${colors.bright}Cleanup Summary:${colors.reset}`);
  log(`${colors.green}✓ Test directories removed${colors.reset}`);
  log(`${colors.green}✓ Test files removed${colors.reset}`);
  log(`${colors.green}✓ Docker containers cleaned${colors.reset}`);
  log(`${colors.green}✓ Node modules cleaned${colors.reset}`);
  log(`${colors.green}✓ Playwright browsers removed${colors.reset}`);
  log(`${colors.green}✓ Jest cache cleaned${colors.reset}`);
  log(`${colors.green}✓ Coverage reports removed${colors.reset}`);
  log(`${colors.green}✓ Log files cleaned${colors.reset}`);
  log(`${colors.green}✓ Temporary files removed${colors.reset}`);
  log(`${colors.green}✓ Build artifacts cleaned${colors.reset}`);
  log(`${colors.green}✓ Git artifacts cleaned${colors.reset}`);
}

function main() {
  log(`${colors.bright}${colors.magenta}LightDom Space-Bridge Platform - Test Cleanup${colors.reset}`);
  log(`${colors.cyan}================================================${colors.reset}`);
  
  const startTime = Date.now();
  
  try {
    // Cleanup test directories
    cleanupTestDirectories();
    
    // Cleanup test files
    cleanupTestFiles();
    
    // Cleanup Docker containers
    cleanupDockerContainers();
    
    // Cleanup node modules
    cleanupNodeModules();
    
    // Cleanup Playwright
    cleanupPlaywright();
    
    // Cleanup Jest
    cleanupJest();
    
    // Cleanup coverage
    cleanupCoverage();
    
    // Cleanup logs
    cleanupLogs();
    
    // Cleanup temp files
    cleanupTempFiles();
    
    // Cleanup artifacts
    cleanupArtifacts();
    
    // Cleanup Git
    cleanupGit();
    
    // Show summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    showCleanupSummary();
    
    log(`${colors.cyan}Cleanup completed in ${duration} seconds${colors.reset}`);
    log(`${colors.bright}${colors.green}🎉 Test environment cleaned successfully!${colors.reset}`);
    
  } catch (error) {
    log(`${colors.red}Cleanup failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

switch (command) {
  case 'dirs':
    cleanupTestDirectories();
    break;
  case 'files':
    cleanupTestFiles();
    break;
  case 'docker':
    cleanupDockerContainers();
    break;
  case 'node':
    cleanupNodeModules();
    break;
  case 'playwright':
    cleanupPlaywright();
    break;
  case 'jest':
    cleanupJest();
    break;
  case 'coverage':
    cleanupCoverage();
    break;
  case 'logs':
    cleanupLogs();
    break;
  case 'temp':
    cleanupTempFiles();
    break;
  case 'artifacts':
    cleanupArtifacts();
    break;
  case 'git':
    cleanupGit();
    break;
  case 'all':
  default:
    main();
    break;
}