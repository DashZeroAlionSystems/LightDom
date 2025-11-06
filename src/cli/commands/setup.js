/**
 * Setup command implementation
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { existsSync, rmSync, copyFileSync } from 'fs';
import inquirer from 'inquirer';

export async function runSetup(options) {
  console.log(chalk.blue('⚙️ Setting up LightDom Development Environment'));
  
  if (options.fresh) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'This will remove existing setup. Are you sure?',
      default: false
    }]);
    
    if (!confirm) {
      console.log(chalk.yellow('Setup cancelled'));
      return;
    }
    
    console.log(chalk.cyan('🧹 Removing existing setup...'));
    // Remove node_modules, dist, .env
    ['node_modules', 'dist', '.env'].forEach(dir => {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
  
  if (!options.db && !options.contracts) {
    console.log(chalk.cyan('📦 Installing dependencies...'));
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  }
  
  // Setup environment file
  if (!existsSync('.env')) {
    console.log(chalk.cyan('📝 Setting up environment file...'));
    if (existsSync('automation.env')) {
      copyFileSync('automation.env', '.env');
    } else {
      // Create basic .env
      const envContent = `# LightDom Development Environment
NODE_ENV=development
API_PORT=3000
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://localhost:8545
DATABASE_URL=postgresql://localhost:5432/lightdom_dev
`;
      require('fs').writeFileSync('.env', envContent);
    }
    console.log(chalk.green('✅ Environment file created'));
  }
  
  if (!options.deps && !options.contracts) {
    console.log(chalk.cyan('🗄️ Setting up database...'));
    try {
      execSync('createdb lightdom_dev 2>/dev/null || true', { stdio: 'inherit' });
      if (existsSync('postgresql-setup-script.sql')) {
        execSync('psql -d lightdom_dev -f postgresql-setup-script.sql', { stdio: 'inherit' });
      }
      console.log(chalk.green('✅ Database setup completed'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Database setup skipped (PostgreSQL not available)'));
    }
  }
  
  if (!options.deps && !options.db) {
    console.log(chalk.cyan('⛓️ Setting up blockchain contracts...'));
    try {
      execSync('npm run deploy:local', { stdio: 'inherit' });
      console.log(chalk.green('✅ Contracts deployed'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Contract deployment skipped'));
    }
  }
  
  console.log(chalk.green('🎉 Development environment setup completed!'));
  console.log(chalk.cyan('\nNext steps:'));
  console.log(chalk.gray('  npm run dev     - Start development server'));
  console.log(chalk.gray('  npm run test    - Run tests'));
  console.log(chalk.gray('  npm run build   - Build for production'));
}