#!/usr/bin/env node

/**
 * Test and validate Ollama installation and setup
 * 
 * This script tests:
 * - Ollama installation
 * - Model availability
 * - Basic chat functionality
 * - Prompt engineering capabilities
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class OllamaSetupTester {
  constructor() {
    this.testResults = [];
    this.recommendedModels = [
      { name: 'llama2:7b', purpose: 'General purpose conversations and analysis' },
      { name: 'codellama:7b', purpose: 'Code generation and technical tasks' },
      { name: 'mistral:7b', purpose: 'Fast responses with good quality' },
      { name: 'phi:2.7b', purpose: 'Lightweight model for quick tasks' }
    ];
  }

  /**
   * Log test result
   */
  log(test, passed, message = '') {
    const result = { test, passed, message, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${test}: ${status}${message ? ` - ${message}` : ''}`);
    
    return passed;
  }

  /**
   * Check if Ollama is installed
   */
  async checkOllamaInstalled() {
    console.log('\n🔍 Test 1: Checking Ollama installation...');
    
    return new Promise((resolve) => {
      exec('which ollama', (error, stdout) => {
        if (error || !stdout.trim()) {
          this.log('Ollama Installation', false, 'Ollama is not installed');
          console.log('\n📥 To install Ollama, run:');
          console.log('   curl -fsSL https://ollama.ai/install.sh | sh');
          console.log('   OR visit: https://ollama.ai/download\n');
          resolve(false);
        } else {
          this.log('Ollama Installation', true, `Found at ${stdout.trim()}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if Ollama service is running
   */
  async checkOllamaRunning() {
    console.log('\n🔍 Test 2: Checking if Ollama service is running...');
    
    return new Promise((resolve) => {
      const check = spawn('ollama', ['list'], { stdio: 'pipe' });
      let output = '';
      let errorOutput = '';

      check.stdout.on('data', (data) => {
        output += data.toString();
      });

      check.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      check.on('close', (code) => {
        if (code === 0) {
          this.log('Ollama Service', true, 'Service is running');
          resolve(true);
        } else {
          this.log('Ollama Service', false, 'Service is not running');
          console.log('\n🚀 To start Ollama service, run:');
          console.log('   ollama serve');
          console.log('   OR it may start automatically on next use\n');
          resolve(false);
        }
      });

      check.on('error', () => {
        this.log('Ollama Service', false, 'Failed to check service status');
        resolve(false);
      });
    });
  }

  /**
   * List available models
   */
  async listModels() {
    console.log('\n🔍 Test 3: Listing available models...');
    
    return new Promise((resolve) => {
      const list = spawn('ollama', ['list'], { stdio: 'pipe' });
      let output = '';

      list.stdout.on('data', (data) => {
        output += data.toString();
      });

      list.on('close', (code) => {
        if (code === 0) {
          const lines = output.trim().split('\n');
          const models = lines.slice(1).filter(line => line.trim()).map(line => {
            const parts = line.split(/\s+/);
            return parts[0];
          });

          if (models.length > 0) {
            this.log('Model Availability', true, `Found ${models.length} models`);
            console.log('   Available models:', models.join(', '));
          } else {
            this.log('Model Availability', false, 'No models found');
            console.log('\n📥 Recommended models to pull:');
            this.recommendedModels.forEach(({ name, purpose }) => {
              console.log(`   - ${name}: ${purpose}`);
              console.log(`     ollama pull ${name}`);
            });
          }
          resolve(models);
        } else {
          this.log('Model Availability', false, 'Failed to list models');
          resolve([]);
        }
      });

      list.on('error', () => {
        this.log('Model Availability', false, 'Error executing ollama list');
        resolve([]);
      });
    });
  }

  /**
   * Test basic chat functionality
   */
  async testBasicChat(model = 'llama2:7b') {
    console.log(`\n🔍 Test 4: Testing basic chat with ${model}...`);
    
    return new Promise((resolve) => {
      const testPrompt = 'Say "Hello, Ollama test successful!" and nothing else.';
      const chat = spawn('ollama', ['run', model, testPrompt], { stdio: 'pipe' });
      let output = '';
      let errorOutput = '';

      // Set a timeout
      const timeout = setTimeout(() => {
        chat.kill();
        this.log('Basic Chat', false, 'Chat test timed out (30s)');
        resolve(false);
      }, 30000);

      chat.stdout.on('data', (data) => {
        output += data.toString();
      });

      chat.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      chat.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0 && output.trim()) {
          this.log('Basic Chat', true, `Response: ${output.trim().substring(0, 50)}...`);
          resolve(true);
        } else if (errorOutput.includes('not found')) {
          this.log('Basic Chat', false, `Model ${model} not found. Run: ollama pull ${model}`);
          resolve(false);
        } else {
          this.log('Basic Chat', false, errorOutput || 'No response received');
          resolve(false);
        }
      });

      chat.on('error', (error) => {
        clearTimeout(timeout);
        this.log('Basic Chat', false, error.message);
        resolve(false);
      });
    });
  }

  /**
   * Test prompt engineering capabilities
   */
  async testPromptEngineering(model = 'llama2:7b') {
    console.log(`\n🔍 Test 5: Testing prompt engineering with ${model}...`);
    
    const testPrompts = [
      {
        name: 'JSON Generation',
        prompt: 'Generate a JSON object with 3 keys: name, age, city. Return ONLY the JSON, no explanation.',
        validator: (response) => {
          try {
            const parsed = JSON.parse(response.trim());
            return parsed.name && parsed.age && parsed.city;
          } catch {
            return false;
          }
        }
      }
    ];

    let allPassed = true;

    for (const test of testPrompts) {
      const result = await new Promise((resolve) => {
        const chat = spawn('ollama', ['run', model, test.prompt], { stdio: 'pipe' });
        let output = '';

        const timeout = setTimeout(() => {
          chat.kill();
          resolve(false);
        }, 30000);

        chat.stdout.on('data', (data) => {
          output += data.toString();
        });

        chat.on('close', (code) => {
          clearTimeout(timeout);
          
          if (code === 0 && output.trim()) {
            const isValid = test.validator(output);
            resolve(isValid);
          } else {
            resolve(false);
          }
        });

        chat.on('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      });

      if (result) {
        this.log(`Prompt Engineering - ${test.name}`, true);
      } else {
        this.log(`Prompt Engineering - ${test.name}`, false);
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Generate test report
   */
  async generateReport() {
    console.log('\n📊 Generating test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.passed).length,
        failed: this.testResults.filter(r => !r.passed).length
      },
      tests: this.testResults,
      recommendations: []
    };

    // Add recommendations based on failures
    const failedTests = this.testResults.filter(r => !r.passed);
    
    if (failedTests.find(t => t.test === 'Ollama Installation')) {
      report.recommendations.push('Install Ollama from https://ollama.ai/download');
    }
    
    if (failedTests.find(t => t.test === 'Ollama Service')) {
      report.recommendations.push('Start Ollama service with: ollama serve');
    }
    
    if (failedTests.find(t => t.test === 'Model Availability')) {
      report.recommendations.push('Pull recommended models with: ollama pull <model-name>');
    }

    // Save report
    const reportPath = path.join(__dirname, '..', '..', 'ollama-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Test report saved to: ${reportPath}`);
    
    return report;
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 OLLAMA SETUP TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    console.log(`\nTests Passed: ${passed}/${total} (${percentage}%)`);
    
    if (percentage === 100) {
      console.log('\n🎉 All tests passed! Ollama is properly configured.');
      console.log('\n📚 Next steps:');
      console.log('   1. Try the Ollama CLI: npm run ollama:cli');
      console.log('   2. Explore prompt templates: see /workflows/automation/ollama-prompts/');
      console.log('   3. Integrate with n8n workflows');
    } else if (percentage >= 50) {
      console.log('\n⚠️  Some tests failed. Review the recommendations above.');
    } else {
      console.log('\n❌ Most tests failed. Please install and configure Ollama.');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Ollama Setup Tests...');
    console.log('This will test your Ollama installation and configuration.\n');

    // Test 1: Installation
    const isInstalled = await this.checkOllamaInstalled();
    if (!isInstalled) {
      await this.generateReport();
      this.printSummary();
      return;
    }

    // Test 2: Service running
    const isRunning = await this.checkOllamaRunning();
    if (!isRunning) {
      await this.generateReport();
      this.printSummary();
      return;
    }

    // Test 3: List models
    const models = await this.listModels();
    
    // Test 4 & 5: Only if we have models
    if (models.length > 0) {
      const testModel = models[0];
      await this.testBasicChat(testModel);
      await this.testPromptEngineering(testModel);
    }

    // Generate report and print summary
    await this.generateReport();
    this.printSummary();
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new OllamaSetupTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Fatal error running tests:', error);
    process.exit(1);
  });
}

module.exports = OllamaSetupTester;
