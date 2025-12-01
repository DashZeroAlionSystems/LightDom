/**
 * Build command implementation
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { rmSync } from 'fs';

export async function runBuild(options) {
  console.log(chalk.blue('🏗️ Building LightDom Application'));
  
  if (options.clean) {
    console.log(chalk.cyan('🧹 Cleaning build directory...'));
    try {
      rmSync('dist', { recursive: true, force: true });
      console.log(chalk.green('✅ Build directory cleaned'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ No build directory to clean'));
    }
  }
  
  console.log(chalk.cyan(`🔨 Building in ${options.mode} mode...`));
  
  // Set NODE_ENV based on mode
  process.env.NODE_ENV = options.mode;
  
  execSync('npm run build', { stdio: 'inherit' });
  
  if (options.analyze) {
    console.log(chalk.cyan('📊 Analyzing bundle size...'));
    execSync('npm run analyze:bundle', { stdio: 'inherit' });
  }
  
  console.log(chalk.green('✅ Build completed successfully'));
}