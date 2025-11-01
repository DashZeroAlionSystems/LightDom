# Ollama CLI - Direct AI Chat Interface

A lightweight, powerful command-line interface for interacting directly with Ollama AI models. Chat with AI models, switch between different models, manage conversation history, and more - all from your terminal.

## 🚀 Quick Start

### **Prerequisites**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (choose one)
ollama pull llama2:7b      # General purpose
ollama pull codellama:7b   # Code-focused
ollama pull mistral:7b     # Fast and capable
```

### **Basic Usage**
```bash
# Interactive chat
npm run ollama:cli

# Send a single message
node ollama-cli.js "Hello, how are you?"

# Start with auto-server launch
npm run ollama:chat
```

## 🤖 Interactive Mode

Start the interactive chat interface:

```bash
node ollama-cli.js
```

You'll see:
```
🤖 Ollama CLI - Interactive Mode
Model: llama2:7b
Type /help for commands, /quit to exit

You> Hello, tell me about memory systems
🤖 Thinking...
🤖 Assistant:
Memory systems are fascinating! Let me explain...

You>
```

## 📝 Commands

### **Chat Commands**
- `/help`, `/h` - Show help
- `/quit`, `/q` - Exit the CLI
- `/clear`, `/c` - Clear conversation history
- `/history`, `/hist` - Show conversation history
- `/save` - Save current conversation to file

### **Model Management**
- `/model <name>` - Switch to a different model
- `/models` - List all available models
- `/status` - Show current status and configuration

### **Examples**
```bash
# Switch to a coding-focused model
/model codellama:7b

# See what models are available
/models

# Clear conversation and start fresh
/clear

# Save the current conversation
/save
```

## 🎯 Usage Examples

### **General Chat**
```bash
node ollama-cli.js "Explain quantum computing in simple terms"
```

### **Code Assistance**
```bash
node ollama-cli.js --model codellama:7b "Write a React hook for local storage"
```

### **Creative Writing**
```bash
node ollama-cli.js "Write a short story about AI consciousness"
```

### **Analysis & Research**
```bash
node ollama-cli.js "Analyze the pros and cons of microservices architecture"
```

## ⚙️ Configuration

### **Command Line Options**
```bash
# Use a specific model
node ollama-cli.js --model mistral:7b

# Auto-start Ollama server if not running
node ollama-cli.js --serve

# Disable conversation history
node ollama-cli.js --no-history

# Verbose output
node ollama-cli.js --verbose
```

### **Configuration File**
The CLI automatically saves your preferences in `ollama-cli-config.json`:
```json
{
  "currentModel": "llama2:7b",
  "maxHistoryLength": 50,
  "lastUsed": "2025-10-29T01:20:00.000Z"
}
```

### **Environment Variables**
```bash
# Custom Ollama host (if running remotely)
OLLAMA_HOST=http://your-ollama-server:11434
```

## 🧠 Conversation Management

### **Context Awareness**
- Maintains conversation history across messages
- Uses recent context for more relevant responses
- Automatically manages token limits
- Preserves conversation flow

### **History Management**
```bash
# View conversation history
/history

# Clear all history
/clear

# Save conversation to file
/save
# Creates: ollama-conversation-2025-10-29T01-20-00.json
```

### **Multi-Turn Conversations**
The CLI maintains context across multiple interactions:
```
You> What is machine learning?
🤖 Assistant: Machine learning is...

You> Can you give me a practical example?
🤖 Assistant: Certainly! Here's an example... (remembers the ML context)
```

## 🤖 Model Selection Guide

### **General Purpose**
- `llama2:7b` - Balanced performance and capability
- `mistral:7b` - Fast, good quality, efficient
- `llama2:13b` - More capable but slower

### **Code & Technical**
- `codellama:7b` - Excellent for programming tasks
- `codellama:13b` - Advanced code understanding
- `deepseek-coder:6.7b` - Specialized coding model

### **Creative & Analytical**
- `llama2:70b` - Highly capable for complex tasks
- `mixtral:8x7b` - Mixture of experts, very capable
- `neural-chat:7b` - Good for conversational tasks

## 🔧 Advanced Features

### **Batch Processing**
```bash
# Process multiple prompts from a file
cat prompts.txt | while read prompt; do
  echo "=== $prompt ==="
  node ollama-cli.js "$prompt"
  echo
done
```

### **Integration Scripts**
```javascript
// Use in Node.js scripts
import { spawn } from 'child_process';

function askOllama(question) {
  return new Promise((resolve, reject) => {
    const cli = spawn('node', ['ollama-cli.js', question], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let response = '';
    cli.stdout.on('data', (data) => response += data);
    cli.on('close', () => resolve(response));
    cli.on('error', reject);
  });
}

// Usage
const answer = await askOllama("What is the capital of France?");
```

### **API-Style Usage**
```bash
# Get just the response (for scripting)
node ollama-cli.js "Calculate 15 * 23" | grep -A 100 "🤖 Assistant:" | tail -n +2
```

## 🚨 Troubleshooting

### **Common Issues**

#### **"Ollama is not running"**
```bash
# Start Ollama server
ollama serve

# Or use auto-start
node ollama-cli.js --serve
```

#### **"Model not found"**
```bash
# List available models
ollama list

# Pull a specific model
ollama pull llama2:7b
```

#### **Slow Responses**
```bash
# Try a smaller/faster model
/model mistral:7b

# Or reduce context length
/clear
```

#### **Memory Issues**
```bash
# Clear conversation history
/clear

# Reduce max history in config
# Edit ollama-cli-config.json: "maxHistoryLength": 10
```

### **Performance Tuning**

#### **For Speed**
```bash
# Use smaller models
/model mistral:7b
/model phi:2.7b

# Clear history frequently
/clear
```

#### **For Quality**
```bash
# Use larger models
/model llama2:13b
/model codellama:13b

# Maintain conversation context
# (Don't clear history)
```

#### **For Coding**
```bash
# Use code-specialized models
/model codellama:7b
/model deepseek-coder:6.7b
```

## 📊 Performance Metrics

### **Response Times** (approximate)
- `mistral:7b`: 2-5 seconds per response
- `llama2:7b`: 3-7 seconds per response
- `codellama:7b`: 3-8 seconds per response
- `llama2:13b`: 5-12 seconds per response

### **Memory Usage**
- Base memory: ~4GB RAM
- Per model: +1-4GB depending on size
- Conversation context: Minimal impact

### **Quality Scores** (1-10 scale)
- `llama2:7b`: 7/10 - Good general purpose
- `mistral:7b`: 8/10 - Excellent balance
- `codellama:7b`: 9/10 - Outstanding for code
- `llama2:13b`: 8/10 - Very capable, slower

## 🎯 Best Practices

### **Model Selection**
- **General chat**: `mistral:7b` or `llama2:7b`
- **Coding tasks**: `codellama:7b`
- **Creative writing**: `llama2:13b`
- **Quick answers**: `mistral:7b`

### **Conversation Management**
- Clear history for new topics: `/clear`
- Save important conversations: `/save`
- Switch models for different tasks: `/model <name>`

### **System Resources**
- Close other applications for better performance
- Use smaller models if experiencing slowdowns
- Clear history periodically to reduce memory usage

## 🔗 Integration with Memory Workflow System

The Ollama CLI integrates seamlessly with the Memory Workflow CodeMap:

```bash
# Use Ollama CLI for quick AI queries
node ollama-cli.js "Analyze this code for performance issues"

# Then use in Memory Workflow system
npm run cascade:workflow
```

The CLI serves as a lightweight interface for direct AI interaction, while the full Memory Workflow system provides orchestration and automation capabilities.

## 📄 License

MIT License - Free to use, modify, and distribute.

---

**Direct AI interaction, zero complexity, maximum intelligence.** 🤖💬
