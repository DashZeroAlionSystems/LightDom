#!/usr/bin/env node

/**
 * Ollama CLI - Direct AI Chat Interface
 * A simple command-line interface for interacting with Ollama models
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OllamaCLI {
    constructor() {
        this.currentModel = 'llama2:7b';
        this.conversationHistory = [];
        this.isOllamaRunning = false;
        this.rl = null;
        this.ollamaProcess = null;
        this.maxHistoryLength = 50;
        this.configPath = path.join(__dirname, 'ollama-cli-config.json');
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const config = await fs.readFile(this.configPath, 'utf8');
            const data = JSON.parse(config);
            this.currentModel = data.currentModel || 'llama2:7b';
            this.maxHistoryLength = data.maxHistoryLength || 50;
            console.log(`📚 Loaded config: model=${this.currentModel}, maxHistory=${this.maxHistoryLength}`);
        } catch (error) {
            // Config doesn't exist, use defaults
            this.saveConfig();
        }
    }

    async saveConfig() {
        const config = {
            currentModel: this.currentModel,
            maxHistoryLength: this.maxHistoryLength,
            lastUsed: new Date().toISOString()
        };

        try {
            await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
        } catch (error) {
            console.warn('⚠️  Could not save config:', error.message);
        }
    }

    async checkOllamaStatus() {
        return new Promise((resolve) => {
            const check = spawn('ollama', ['list'], { stdio: 'pipe' });

            check.on('close', (code) => {
                this.isOllamaRunning = code === 0;
                resolve(code === 0);
            });

            check.on('error', () => {
                this.isOllamaRunning = false;
                resolve(false);
            });
        });
    }

    async ensureModelAvailable() {
        console.log(`🔍 Checking if model ${this.currentModel} is available...`);

        return new Promise((resolve, reject) => {
            const list = spawn('ollama', ['list'], { stdio: 'pipe' });
            let output = '';

            list.stdout.on('data', (data) => {
                output += data.toString();
            });

            list.on('close', (code) => {
                if (code === 0 && output.includes(this.currentModel)) {
                    console.log(`✅ Model ${this.currentModel} is available`);
                    resolve(true);
                } else {
                    console.log(`📥 Model ${this.currentModel} not found, pulling...`);
                    this.pullModel().then(resolve).catch(reject);
                }
            });

            list.on('error', reject);
        });
    }

    async pullModel() {
        return new Promise((resolve, reject) => {
            const pull = spawn('ollama', ['pull', this.currentModel], { stdio: 'inherit' });

            pull.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Successfully pulled model ${this.currentModel}`);
                    resolve(true);
                } else {
                    reject(new Error(`Failed to pull model ${this.currentModel}`));
                }
            });

            pull.on('error', reject);
        });
    }

    async startOllamaServe() {
        console.log('🚀 Starting Ollama server...');

        return new Promise((resolve, reject) => {
            this.ollamaProcess = spawn('ollama', ['serve'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            let started = false;

            // Wait a bit for the server to start
            setTimeout(() => {
                if (!started) {
                    started = true;
                    console.log('✅ Ollama server started');
                    resolve();
                }
            }, 2000);

            this.ollamaProcess.on('error', (error) => {
                if (!started) {
                    started = true;
                    reject(error);
                }
            });

            // Listen for output to confirm server is running
            this.ollamaProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('listening') || output.includes('ready')) {
                    if (!started) {
                        started = true;
                        console.log('✅ Ollama server started');
                        resolve();
                    }
                }
            });
        });
    }

    async chatWithModel(message) {
        return new Promise((resolve, reject) => {
            // Build context from conversation history
            const context = this.buildContext(message);

            const chat = spawn('ollama', ['run', this.currentModel], { stdio: ['pipe', 'pipe', 'pipe'] });
            let response = '';
            let errorOutput = '';

            chat.stdout.on('data', (data) => {
                response += data.toString();
            });

            chat.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            chat.on('close', (code) => {
                if (code === 0) {
                    // Clean up the response (Ollama might add extra formatting)
                    const cleanResponse = this.cleanResponse(response);
                    this.addToHistory(message, cleanResponse);
                    resolve(cleanResponse);
                } else {
                    reject(new Error(`Ollama chat failed: ${errorOutput}`));
                }
            });

            chat.on('error', reject);

            // Send the context + message
            chat.stdin.write(context);
            chat.stdin.end();
        });
    }

    buildContext(message) {
        // Build conversation context from history
        let context = '';

        // Add recent conversation history (last few exchanges)
        const recentHistory = this.conversationHistory.slice(-6); // Last 3 exchanges

        if (recentHistory.length > 0) {
            context += 'Previous conversation:\n';
            recentHistory.forEach(exchange => {
                context += `User: ${exchange.user}\nAssistant: ${exchange.assistant}\n\n`;
            });
            context += 'Current message: ';
        }

        context += message;

        // Add system prompt for better responses
        const systemPrompt = `
You are a helpful AI assistant. Provide clear, accurate, and useful responses.
Keep your answers concise but comprehensive. Use markdown formatting when appropriate.

${context}
`;

        return systemPrompt;
    }

    cleanResponse(response) {
        // Clean up Ollama's response formatting
        return response
            .trim()
            .replace(/^Assistant: /i, '')
            .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
            .split('\n')
            .filter(line => !line.startsWith('```') || line.length > 3) // Remove empty code blocks
            .join('\n')
            .trim();
    }

    addToHistory(userMessage, assistantResponse) {
        this.conversationHistory.push({
            timestamp: new Date().toISOString(),
            user: userMessage,
            assistant: assistantResponse
        });

        // Keep history within limits
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }

    showHelp() {
        console.log(`
🤖 Ollama CLI - Direct AI Chat Interface

USAGE:
  ollama-cli [options] [message]

COMMANDS:
  <message>          Send a message to the AI
  /help, /h          Show this help
  /quit, /q          Exit the CLI
  /clear, /c         Clear conversation history
  /history, /hist    Show conversation history
  /model <name>      Switch to a different model
  /models            List available models
  /status            Show current status
  /config            Show current configuration
  /save              Save current conversation to file

OPTIONS:
  --model <name>     Use specific model (default: llama2:7b)
  --serve            Start Ollama server if not running
  --no-history       Don't load/save conversation history
  --verbose, -v      Show detailed output

EXAMPLES:
  ollama-cli "Hello, how are you?"
  ollama-cli --model codellama:7b "Write a function to sort an array"
  ollama-cli /model mistral:7b
  ollama-cli /history

MODEL SWITCHING:
  ollama-cli /model llama2:13b    # Switch to larger model
  ollama-cli /model codellama:7b  # Switch to coding model
  ollama-cli /model mistral:7b    # Switch to Mistral model

CONFIGURATION:
  Models are automatically downloaded if not available
  Conversation history is saved between sessions
  Use /clear to reset conversation context

TIPS:
  • Use markdown in your messages for better formatting
  • Ask follow-up questions to maintain context
  • Switch models based on your current task
  • Use /save to export interesting conversations
`);
    }

    async showStatus() {
        const ollamaStatus = await this.checkOllamaStatus();

        console.log(`
🤖 Ollama CLI Status
====================

Ollama Server: ${ollamaStatus ? '🟢 Running' : '🔴 Not Running'}
Current Model: ${this.currentModel}
Conversation Length: ${this.conversationHistory.length} messages
Max History: ${this.maxHistoryLength} messages

Available Models:
`);

        if (ollamaStatus) {
            try {
                const models = await this.listModels();
                models.forEach(model => {
                    const indicator = model === this.currentModel ? '👉' : '  ';
                    console.log(`${indicator} ${model}`);
                });
            } catch (error) {
                console.log('❌ Could not list models');
            }
        } else {
            console.log('Start Ollama server with: ollama serve');
        }
    }

    async listModels() {
        return new Promise((resolve, reject) => {
            const list = spawn('ollama', ['list'], { stdio: 'pipe' });
            let output = '';

            list.stdout.on('data', (data) => {
                output += data.toString();
            });

            list.on('close', (code) => {
                if (code === 0) {
                    const lines = output.split('\n').filter(line => line.trim());
                    // Skip header line and extract model names
                    const models = lines.slice(1).map(line => line.split(/\s+/)[0]).filter(name => name);
                    resolve(models);
                } else {
                    reject(new Error('Failed to list models'));
                }
            });

            list.on('error', reject);
        });
    }

    async switchModel(modelName) {
        console.log(`🔄 Switching to model: ${modelName}`);

        const oldModel = this.currentModel;
        this.currentModel = modelName;

        try {
            await this.ensureModelAvailable();
            console.log(`✅ Successfully switched from ${oldModel} to ${modelName}`);
            await this.saveConfig();
        } catch (error) {
            console.log(`❌ Failed to switch model: ${error.message}`);
            this.currentModel = oldModel; // Revert on failure
        }
    }

    clearHistory() {
        this.conversationHistory = [];
        console.log('🧹 Conversation history cleared');
    }

    showHistory() {
        if (this.conversationHistory.length === 0) {
            console.log('📝 No conversation history');
            return;
        }

        console.log('\n📚 Conversation History');
        console.log('='.repeat(50));

        this.conversationHistory.forEach((exchange, index) => {
            const time = new Date(exchange.timestamp).toLocaleTimeString();
            console.log(`[${time}] You: ${exchange.user.substring(0, 80)}${exchange.user.length > 80 ? '...' : ''}`);
            console.log(`🤖 Assistant: ${exchange.assistant.substring(0, 100)}${exchange.assistant.length > 100 ? '...' : ''}\n`);
        });
    }

    async saveConversation() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `ollama-conversation-${timestamp}.json`;

        const conversation = {
            timestamp: new Date().toISOString(),
            model: this.currentModel,
            exchanges: this.conversationHistory
        };

        try {
            await fs.writeFile(filename, JSON.stringify(conversation, null, 2));
            console.log(`💾 Conversation saved to: ${filename}`);
        } catch (error) {
            console.error(`❌ Failed to save conversation: ${error.message}`);
        }
    }

    async interactiveMode() {
        console.log(`🤖 Ollama CLI - Interactive Mode`);
        console.log(`Model: ${this.currentModel}`);
        console.log(`Type /help for commands, /quit to exit\n`);

        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'You> '
        });

        this.rl.prompt();

        this.rl.on('line', async (input) => {
            const command = input.trim();

            if (command === '') {
                this.rl.prompt();
                return;
            }

            // Handle commands
            if (command.startsWith('/')) {
                await this.handleCommand(command);
                this.rl.prompt();
                return;
            }

            // Handle regular messages
            try {
                console.log('🤖 Thinking...');
                const response = await this.chatWithModel(command);

                console.log('\n🤖 Assistant:');
                console.log(response);
                console.log('');

            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
            }

            this.rl.prompt();
        });

        this.rl.on('close', () => {
            console.log('\n👋 Goodbye!');
            this.cleanup();
            process.exit(0);
        });

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            console.log('\n👋 Goodbye!');
            this.rl.close();
        });
    }

    async handleCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (cmd) {
            case '/help':
            case '/h':
                this.showHelp();
                break;

            case '/quit':
            case '/q':
                this.rl.close();
                break;

            case '/clear':
            case '/c':
                this.clearHistory();
                break;

            case '/history':
            case '/hist':
                this.showHistory();
                break;

            case '/model':
            case '/m':
                if (args[0]) {
                    await this.switchModel(args[0]);
                } else {
                    console.log(`Current model: ${this.currentModel}`);
                    console.log('Usage: /model <model_name>');
                }
                break;

            case '/models':
                try {
                    const models = await this.listModels();
                    console.log('Available models:');
                    models.forEach(model => console.log(`  ${model}`));
                } catch (error) {
                    console.log(`❌ Could not list models: ${error.message}`);
                }
                break;

            case '/status':
            case '/s':
                await this.showStatus();
                break;

            case '/config':
                console.log(`Model: ${this.currentModel}`);
                console.log(`Max History: ${this.maxHistoryLength}`);
                console.log(`Conversation Length: ${this.conversationHistory.length}`);
                break;

            case '/save':
                await this.saveConversation();
                break;

            default:
                console.log(`Unknown command: ${cmd}`);
                console.log('Type /help for available commands');
        }
    }

    cleanup() {
        if (this.ollamaProcess) {
            this.ollamaProcess.kill();
        }
        this.saveConfig();
    }

    async run(args) {
        // Parse command line arguments
        let interactive = true;
        let startServer = false;
        let message = null;

        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '--model':
                    if (args[i + 1]) {
                        this.currentModel = args[i + 1];
                        i++;
                    }
                    break;
                case '--serve':
                    startServer = true;
                    break;
                case '--no-history':
                    this.maxHistoryLength = 0;
                    break;
                case '--verbose':
                case '-v':
                    // Enable verbose logging
                    break;
                default:
                    if (!args[i].startsWith('-')) {
                        message = args[i];
                        interactive = false;
                    }
            }
        }

        // Check Ollama status
        const ollamaRunning = await this.checkOllamaStatus();
        if (!ollamaRunning) {
            if (startServer) {
                await this.startOllamaServe();
            } else {
                console.log('❌ Ollama is not running. Start it with: ollama serve');
                console.log('Or use --serve flag to start it automatically');
                process.exit(1);
            }
        }

        // Ensure model is available
        await this.ensureModelAvailable();

        // Handle single message mode
        if (!interactive && message) {
            try {
                console.log('🤖 Thinking...');
                const response = await this.chatWithModel(message);
                console.log('\n🤖 Assistant:');
                console.log(response);
            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
                process.exit(1);
            }
            this.cleanup();
            return;
        }

        // Start interactive mode
        await this.interactiveMode();
    }
}

// CLI Entry Point
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    const cli = new OllamaCLI();
    cli.showHelp();
    process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
    console.log('Ollama CLI v1.0.0');
    process.exit(0);
}

const cli = new OllamaCLI();
cli.run(args).catch((error) => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
});
