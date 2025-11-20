/**
 * Doctor command implementation - diagnose and fix issues
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import inquirer from 'inquirer';

export async function runDoctor(options) {
  console.log(chalk.blue('🩺 LightDom Doctor - Diagnosing Issues'));
  
  const issues = [];
  const fixes = [];
  
  // Check for common issues
  console.log(chalk.cyan('🔍 Scanning for common issues...'));
  
  // Issue 1: Missing node_modules
  if (!existsSync('node_modules')) {
    issues.push({
      id: 'missing-deps',
      severity: 'high',
      title: 'Dependencies not installed',
      description: 'node_modules directory is missing',
      fix: 'Install dependencies with npm install'
    });
  }
  
  // Issue 2: Missing .env file
  if (!existsSync('.env')) {
    issues.push({
      id: 'missing-env',
      severity: 'medium',
      title: 'Environment file missing',
      description: '.env file not found',
      fix: 'Create .env file from template'
    });
  }
  
  // Issue 3: Outdated packages
  try {
    const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
    if (outdated.trim()) {
      const packages = JSON.parse(outdated);
      if (Object.keys(packages).length > 0) {
        issues.push({
          id: 'outdated-packages',
          severity: 'low',
          title: 'Outdated packages detected',
          description: `${Object.keys(packages).length} packages have updates available`,
          fix: 'Update packages with npm update'
        });
      }
    }
  } catch (error) {
    // Ignore - npm outdated returns non-zero exit code when packages are outdated
  }
  
  // Issue 4: TypeScript compilation errors
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (error) {
    issues.push({
      id: 'typescript-errors',
      severity: 'high',
      title: 'TypeScript compilation errors',
      description: 'TypeScript compiler found errors',
      fix: 'Fix TypeScript errors in your code'
    });
  }
  
  // Issue 5: Lint errors
  try {
    execSync('npm run lint', { stdio: 'pipe' });
  } catch (error) {
    issues.push({
      id: 'lint-errors',
      severity: 'medium',
      title: 'ESLint errors detected',
      description: 'Code linting found issues',
      fix: 'Fix linting errors with npm run lint:fix'
    });
  }
  
  // Issue 6: Missing dist directory
  if (!existsSync('dist')) {
    issues.push({
      id: 'missing-build',
      severity: 'low',
      title: 'Application not built',
      description: 'dist directory is missing',
      fix: 'Build application with npm run build'
    });
  }
  
  // Display results
  if (issues.length === 0) {
    console.log(chalk.green('🎉 No issues detected! Your LightDom setup looks great.'));
    return;
  }
  
  console.log(chalk.yellow(`\n⚠️ Found ${issues.length} issue(s):`));
  
  issues.forEach((issue, index) => {
    const severityColor = issue.severity === 'high' ? 'red' : issue.severity === 'medium' ? 'yellow' : 'gray';
    console.log(chalk[severityColor](`\n${index + 1}. ${issue.title} (${issue.severity})`));
    console.log(chalk.gray(`   ${issue.description}`));
    console.log(chalk.cyan(`   💡 ${issue.fix}`));
  });
  
  if (options.fix) {
    console.log(chalk.blue('\n🔧 Attempting automatic fixes...'));
    
    for (const issue of issues) {
      try {
        await applyFix(issue);
        fixes.push(issue.id);
        console.log(chalk.green(`✅ Fixed: ${issue.title}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to fix: ${issue.title} - ${error.message}`));
      }
    }
    
    if (fixes.length > 0) {
      console.log(chalk.green(`\n🎉 Successfully fixed ${fixes.length} issue(s)!`));
    }
  } else {
    const { shouldFix } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldFix',
      message: 'Would you like to attempt automatic fixes?',
      default: true
    }]);
    
    if (shouldFix) {
      await runDoctor({ ...options, fix: true });
    }
  }
}

async function applyFix(issue) {
  switch (issue.id) {
    case 'missing-deps':
      execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
      break;
      
    case 'missing-env':
      const envContent = `# LightDom Environment Configuration
NODE_ENV=development
API_PORT=3000
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://localhost:8545
DATABASE_URL=postgresql://localhost:5432/lightdom_dev
`;
      writeFileSync('.env', envContent);
      break;
      
    case 'outdated-packages':
      execSync('npm update', { stdio: 'inherit' });
      break;
      
    case 'lint-errors':
      execSync('npm run lint:fix', { stdio: 'inherit' });
      break;
      
    case 'missing-build':
      execSync('npm run build', { stdio: 'inherit' });
      break;
      
    case 'typescript-errors':
      throw new Error('TypeScript errors require manual fixing');
      
    default:
      throw new Error(`No automatic fix available for ${issue.id}`);
  }
}