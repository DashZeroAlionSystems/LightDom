/**
 * Blockchain command implementation
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { existsSync } from 'fs';

export async function runBlockchain(options) {
  console.log(chalk.blue('⛓️ LightDom Blockchain Manager'));
  
  if (options.deploy) {
    console.log(chalk.cyan(`🚀 Deploying contracts to ${options.network}...`));
    
    // Check if contracts directory exists
    if (!existsSync('contracts')) {
      throw new Error('Contracts directory not found');
    }
    
    // Set environment for network
    process.env.NETWORK = options.network;
    
    if (options.network === 'localhost') {
      console.log(chalk.gray('Using local network (Hardhat/Anvil)'));
      execSync('npm run deploy:local', { stdio: 'inherit' });
    } else if (options.network === 'testnet') {
      console.log(chalk.gray('Deploying to testnet'));
      execSync('npm run deploy:testnet', { stdio: 'inherit' });
    } else if (options.network === 'mainnet') {
      console.log(chalk.yellow('⚠️ Deploying to mainnet - please confirm'));
      execSync('npm run deploy:mainnet', { stdio: 'inherit' });
    } else {
      execSync(`npx hardhat run scripts/deploy.ts --network ${options.network}`, { stdio: 'inherit' });
    }
    
    console.log(chalk.green('✅ Contract deployment completed'));
    return;
  }
  
  if (options.test) {
    console.log(chalk.cyan('🧪 Testing smart contracts...'));
    
    if (!existsSync('contracts')) {
      throw new Error('Contracts directory not found');
    }
    
    execSync('npm run test:contracts', { stdio: 'inherit' });
    console.log(chalk.green('✅ Contract tests completed'));
    return;
  }
  
  if (options.verify) {
    console.log(chalk.cyan(`🔍 Verifying contracts on ${options.network}...`));
    
    if (options.network === 'localhost') {
      console.log(chalk.yellow('⚠️ Cannot verify contracts on localhost'));
      return;
    }
    
    // This would typically require contract addresses from deployment
    console.log(chalk.gray('Verification requires contract addresses from deployment'));
    console.log(chalk.gray('Use: npx hardhat verify --network <network> <address> <constructor-args>'));
    return;
  }
  
  // Default: show blockchain info
  console.log(chalk.cyan('⛓️ LightDom Blockchain Development Tools'));
  console.log(chalk.gray('Available commands:'));
  console.log(chalk.gray('  --deploy              Deploy smart contracts'));
  console.log(chalk.gray('  --test                Run contract tests'));
  console.log(chalk.gray('  --verify              Verify contracts on explorer'));
  console.log(chalk.gray('  --network <network>   Network to use (localhost|testnet|mainnet)'));
  console.log(chalk.gray(''));
  console.log(chalk.gray('Direct npm scripts:'));
  console.log(chalk.gray('  npm run test:contracts    Test smart contracts'));
  console.log(chalk.gray('  npm run deploy:local      Deploy to localhost'));
  console.log(chalk.gray('  npm run deploy:testnet    Deploy to testnet'));
  console.log(chalk.gray('  npm run deploy:mainnet    Deploy to mainnet'));
}