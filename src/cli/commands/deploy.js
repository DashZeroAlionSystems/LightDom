/**
 * Deploy command implementation
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function runDeploy(options) {
  console.log(chalk.blue('🚀 LightDom Deployment Manager'));
  
  if (options.rollback) {
    console.log(chalk.cyan(`⏪ Rolling back ${options.env} deployment...`));
    
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to rollback ${options.env}?`,
      default: false
    }]);
    
    if (!confirm) {
      console.log(chalk.yellow('Rollback cancelled'));
      return;
    }
    
    // Execute rollback script
    execSync(`npm run deploy:rollback:${options.env}`, { stdio: 'inherit' });
    console.log(chalk.green('✅ Rollback completed'));
    return;
  }
  
  if (options.dryRun) {
    console.log(chalk.cyan(`🔍 Performing dry run deployment to ${options.env}...`));
    console.log(chalk.gray('This will show what would be deployed without making changes'));
  } else {
    console.log(chalk.cyan(`🚀 Deploying to ${options.env}...`));
  }
  
  // Pre-deployment checks
  console.log(chalk.gray('Running pre-deployment checks...'));
  
  try {
    // Run tests
    console.log(chalk.gray('• Running tests...'));
    execSync('npm run test:unit', { stdio: 'pipe' });
    console.log(chalk.green('  ✅ Tests passed'));
    
    // Build application
    console.log(chalk.gray('• Building application...'));
    execSync('npm run build', { stdio: 'pipe' });
    console.log(chalk.green('  ✅ Build successful'));
    
    // Security checks
    console.log(chalk.gray('• Security audit...'));
    execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
    console.log(chalk.green('  ✅ Security audit passed'));
    
  } catch (error) {
    console.log(chalk.red('❌ Pre-deployment checks failed'));
    throw new Error('Deployment aborted due to failed checks');
  }
  
  if (options.dryRun) {
    console.log(chalk.green('✅ Dry run completed - all checks passed'));
    console.log(chalk.cyan('Ready for actual deployment'));
    return;
  }
  
  // Environment-specific deployment
  const deployCommand = options.env === 'production' 
    ? 'npm run deploy:production'
    : 'npm run deploy:staging';
  
  if (options.env === 'production') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: '⚠️ This will deploy to PRODUCTION. Are you sure?',
      default: false
    }]);
    
    if (!confirm) {
      console.log(chalk.yellow('Deployment cancelled'));
      return;
    }
  }
  
  console.log(chalk.cyan(`Executing deployment to ${options.env}...`));
  execSync(deployCommand, { stdio: 'inherit' });
  
  // Post-deployment verification
  console.log(chalk.gray('Running post-deployment verification...'));
  try {
    execSync('npm run test:smoke', { stdio: 'inherit' });
    execSync('npm run health:check', { stdio: 'inherit' });
    console.log(chalk.green('✅ Post-deployment verification passed'));
  } catch (error) {
    console.log(chalk.red('❌ Post-deployment verification failed'));
    console.log(chalk.yellow('Consider running a rollback'));
  }
  
  console.log(chalk.green(`🎉 Deployment to ${options.env} completed successfully!`));
}