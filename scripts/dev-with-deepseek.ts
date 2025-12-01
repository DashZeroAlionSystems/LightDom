/**
 * Dev Server with Auto-Start Services
 *
 * Starts Vite dev server with automatic DeepSeek/Ollama service
 * Ensures RAG chat is always available
 */

import axios from 'axios';
import chalk from 'chalk';
import { spawn, type ChildProcess } from 'child_process';

// Use OLLAMA_HOST if set, otherwise fall back to OLLAMA_ENDPOINT or default
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost:11434';
const OLLAMA_ENDPOINT = `http://${OLLAMA_HOST}`.replace('http://http://', 'http://');
const VITE_PORT = 3000;
const API_PORT = 3001;

class DevServerManager {
  ollamaProcess: ChildProcess | null = null;
  apiProcess: ChildProcess | null = null;
  viteProcess: ChildProcess | null = null;

  async start() {
    console.log(chalk.cyan('\n🚀 LightDom Development Server Starting...\n'));

    // Start Ollama first
    await this.startOllama();

    // Wait for Ollama to be ready
    await this.waitForService(OLLAMA_ENDPOINT, 'Ollama');

    // Start API server
    await this.startAPIServer();

    // Wait for API to be ready
    await this.waitForService(`http://localhost:${API_PORT}/api/health`, 'API Server');

    // Start Vite
    await this.startVite();

    console.log(chalk.green('\n✅ All services started successfully!\n'));
    console.log(chalk.cyan('   Frontend: ') + chalk.white(`http://localhost:${VITE_PORT}`));
    console.log(chalk.cyan('   API:      ') + chalk.white(`http://localhost:${API_PORT}`));
    console.log(chalk.cyan('   Ollama:   ') + chalk.white(OLLAMA_ENDPOINT));
    console.log(chalk.gray('\n   Press Ctrl+C to stop all services\n'));
  }

  private async startOllama() {
    console.log(chalk.yellow('⚙️  Starting Ollama service...'));

    // Check if already running
    try {
      await axios.get(`${OLLAMA_ENDPOINT}/api/tags`, { timeout: 2000 });
      console.log(chalk.green('✅ Ollama already running'));
      return;
    } catch (error) {
      // Not running, start it
    }

    try {
      this.ollamaProcess = spawn('ollama', ['serve'], {
        stdio: 'pipe',
        shell: true,
      });

      this.ollamaProcess.stdout?.on('data', data => {
        if (data.toString().includes('Listening')) {
          console.log(chalk.green('✅ Ollama service started'));
        }
      });

      this.ollamaProcess.stderr?.on('data', data => {
        const msg = data.toString();
        if (!msg.includes('address already in use')) {
          console.error(chalk.red('Ollama:'), msg);
        }
      });
    } catch (error: any) {
      console.error(chalk.yellow('⚠️  Could not start Ollama automatically'));
      console.log(chalk.gray('Please start Ollama manually: ollama serve'));
    }
  }

  private async startAPIServer() {
    console.log(chalk.yellow('⚙️  Starting API server...'));

    this.apiProcess = spawn('node', ['api-server-express.js'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: API_PORT.toString() },
    });

    this.apiProcess.on('error', error => {
      console.error(chalk.red('API Server error:'), error);
    });
  }

  private async startVite() {
    console.log(chalk.yellow('⚙️  Starting Vite dev server...'));

    this.viteProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
    });

    this.viteProcess.on('error', error => {
      console.error(chalk.red('Vite error:'), error);
    });
  }

  private async waitForService(url: string, name: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(url, { timeout: 1000 });
        console.log(chalk.green(`✅ ${name} is ready`));
        return;
      } catch (error) {
        // Service not ready yet
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error(`${name} failed to start within timeout`);
  }

  async stop() {
    console.log(chalk.yellow('\n🛑 Stopping all services...'));

    if (this.viteProcess) {
      this.viteProcess.kill();
      console.log(chalk.gray('Stopped Vite'));
    }

    if (this.apiProcess) {
      this.apiProcess.kill();
      console.log(chalk.gray('Stopped API server'));
    }

    if (this.ollamaProcess) {
      this.ollamaProcess.kill();
      console.log(chalk.gray('Stopped Ollama'));
    }

    console.log(chalk.green('\n✅ All services stopped\n'));
    process.exit(0);
  }
}

// Start the manager
const manager = new DevServerManager();

manager.start().catch(error => {
  console.error(chalk.red('\n❌ Failed to start services:'), error.message);
  process.exit(1);
});

// Handle shutdown
process.on('SIGINT', () => manager.stop());
process.on('SIGTERM', () => manager.stop());
