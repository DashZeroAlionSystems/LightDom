/**
 * DeepSeek Auto-Start Service
 *
 * Automatically starts and maintains connection to DeepSeek/Ollama
 * Ensures the service is always running for prompt input
 */

import axios from 'axios';
import chalk from 'chalk';
import { ChildProcess, spawn } from 'child_process';

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
const CHECK_INTERVAL = 5000; // Check every 5 seconds
const MAX_RETRIES = 3;

class DeepSeekAutoService {
  private ollamaProcess: ChildProcess | null = null;
  private isRunning = false;
  private retries = 0;

  async start() {
    console.log(chalk.cyan('🤖 DeepSeek Auto-Start Service initialized'));
    console.log(chalk.gray(`   Endpoint: ${OLLAMA_ENDPOINT}`));

    // Check if Ollama is already running
    const isAlive = await this.checkOllamaHealth();

    if (isAlive) {
      console.log(chalk.green('✅ Ollama is already running'));
      this.isRunning = true;
      this.startHealthMonitoring();
      return;
    }

    // Try to start Ollama
    await this.startOllama();
    this.startHealthMonitoring();
  }

  private async checkOllamaHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${OLLAMA_ENDPOINT}/api/tags`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async startOllama() {
    console.log(chalk.yellow('⚙️  Starting Ollama service...'));

    try {
      // Try to start Ollama (Windows)
      this.ollamaProcess = spawn('ollama', ['serve'], {
        stdio: 'pipe',
        detached: false,
        shell: true,
      });

      this.ollamaProcess.stdout?.on('data', data => {
        const output = data.toString();
        if (output.includes('Listening')) {
          console.log(chalk.green('✅ Ollama service started successfully'));
          this.isRunning = true;
          this.retries = 0;
        }
      });

      this.ollamaProcess.stderr?.on('data', data => {
        console.error(chalk.red('Ollama error:'), data.toString());
      });

      this.ollamaProcess.on('exit', code => {
        console.log(chalk.yellow(`Ollama process exited with code ${code}`));
        this.isRunning = false;
        this.handleRestart();
      });

      // Wait for startup
      await this.waitForOllama();
    } catch (error: any) {
      console.error(chalk.red('Failed to start Ollama:'), error.message);
      console.log(chalk.gray('Please ensure Ollama is installed and in PATH'));
      console.log(chalk.gray('Install: https://ollama.ai/download'));
    }
  }

  private async waitForOllama(maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const isAlive = await this.checkOllamaHealth();
      if (isAlive) {
        console.log(chalk.green('✅ Ollama is ready'));
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Ollama failed to start within timeout');
  }

  private startHealthMonitoring() {
    setInterval(async () => {
      const isAlive = await this.checkOllamaHealth();

      if (!isAlive && this.isRunning) {
        console.log(chalk.yellow('⚠️  Ollama health check failed'));
        this.isRunning = false;
        this.handleRestart();
      } else if (isAlive && !this.isRunning) {
        console.log(chalk.green('✅ Ollama service recovered'));
        this.isRunning = true;
        this.retries = 0;
      }
    }, CHECK_INTERVAL);
  }

  private async handleRestart() {
    if (this.retries >= MAX_RETRIES) {
      console.error(chalk.red(`❌ Maximum restart attempts (${MAX_RETRIES}) reached`));
      console.log(chalk.gray('Please manually check Ollama service'));
      return;
    }

    this.retries++;
    console.log(chalk.yellow(`🔄 Restarting Ollama (attempt ${this.retries}/${MAX_RETRIES})...`));

    await new Promise(resolve => setTimeout(resolve, 3000));
    await this.startOllama();
  }

  async stop() {
    if (this.ollamaProcess) {
      console.log(chalk.yellow('Stopping Ollama service...'));
      this.ollamaProcess.kill();
      this.ollamaProcess = null;
      this.isRunning = false;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      endpoint: OLLAMA_ENDPOINT,
      retries: this.retries,
    };
  }
}

// Singleton instance
const deepSeekService = new DeepSeekAutoService();

// Start service
deepSeekService.start().catch(error => {
  console.error(chalk.red('Failed to start DeepSeek service:'), error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n🛑 Shutting down DeepSeek service...'));
  await deepSeekService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await deepSeekService.stop();
  process.exit(0);
});

export default deepSeekService;
