/**
 * Test command implementation
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

export async function runTest(options) {
  console.log(chalk.blue('🧪 Running LightDom Tests'));
  
  const testCommands = [];
  
  if (options.unit) {
    testCommands.push('npm run test:unit');
  } else if (options.integration) {
    testCommands.push('npm run test:integration');
  } else if (options.e2e) {
    testCommands.push('npm run test:e2e');
  } else {
    // Run all tests if no specific type specified
    if (options.coverage) {
      testCommands.push('npm run test:coverage');
    } else if (options.watch) {
      testCommands.push('npm run test:watch');
    } else {
      testCommands.push('npm run test:all');
    }
  }
  
  for (const command of testCommands) {
    console.log(chalk.cyan(`🔍 Running: ${command}`));
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(chalk.green(`✅ Completed: ${command}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed: ${command}`));
      throw new Error(`Test command failed: ${command}`);
    }
  }
  
  console.log(chalk.green('✅ All tests completed successfully'));
}