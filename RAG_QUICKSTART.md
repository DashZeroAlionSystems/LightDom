# Quick Start: RAG System with DeepSeek Computer Use

## 🚀 5-Minute Setup

### 1. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Download from https://ollama.com
```

### 2. Pull DeepSeek Model

```bash
ollama pull deepseek-r1:latest
```

### 3. Start Ollama

```bash
ollama serve
```

### 4. Start LightDom

```bash
# Terminal 1: API Server
npm run start:dev

# Terminal 2: Frontend (optional)
npm run dev
```

### 5. Test the System

```bash
# Check health
curl http://localhost:3001/api/enhanced-rag/health

# Test chat
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Show me the project structure"}
    ],
    "mode": "developer",
    "enableTools": true
  }'
```

---

## 💬 Chat with DeepSeek

### Using API

```bash
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Can you help me start this project?"}
    ],
    "mode": "developer",
    "enableTools": true
  }'
```

### Example Requests

#### Ask About Code
```json
{
  "messages": [
    {"role": "user", "content": "Explain how the RAG system works"}
  ],
  "mode": "codebaseExpert"
}
```

#### Start Project
```json
{
  "messages": [
    {"role": "user", "content": "Start the development server"}
  ],
  "mode": "developer",
  "enableTools": true
}
```

#### Create Git Branch
```json
{
  "messages": [
    {"role": "user", "content": "Create a feature branch for dark mode"}
  ],
  "mode": "gitWorkflow",
  "enableTools": true
}
```

#### Debug Error
```json
{
  "messages": [
    {"role": "user", "content": "I'm getting 'undefined is not a function' error"}
  ],
  "mode": "debugging",
  "enableTools": true
}
```

---

## 🛠️ Available Tools

DeepSeek has access to these tools:

### Git Operations
- `git.status()` - Repository status
- `git.createBranch(branchName)` - Create branch
- `git.commit(message)` - Commit changes
- `git.push()` - Push to remote
- `git.diff()` - View changes

### File Operations
- `file.read(filePath)` - Read file
- `file.write(filePath, content)` - Write file
- `file.list(dirPath)` - List directory
- `file.mkdir(dirPath)` - Create directory

### Project Management
- `project.start()` - Start project (npm start)
- `project.build()` - Build project
- `project.test()` - Run tests
- `project.installDependencies()` - npm install
- `project.getInfo()` - Get package.json info

### System
- `system.getInfo()` - System information
- `command(cmd)` - Execute safe command

---

## 📚 Modes

DeepSeek operates in different modes for different tasks:

- **assistant** - General help
- **codebaseExpert** - Code understanding
- **developer** - Task automation
- **gitWorkflow** - Git operations
- **debugging** - Error fixing
- **codeReview** - Code quality
- **architecture** - System design

---

## 🎯 Common Tasks

### Run the Project

**Request:**
```json
{
  "messages": [{"role": "user", "content": "Run the project"}],
  "mode": "developer",
  "enableTools": true
}
```

**What DeepSeek does:**
1. Checks project info
2. Runs `npm start`
3. Confirms it's running

---

### Create Feature Branch

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Create a feature branch for user authentication"}
  ],
  "mode": "gitWorkflow",
  "enableTools": true
}
```

**What DeepSeek does:**
1. Creates branch `feature/user-authentication`
2. Switches to it
3. Confirms ready for development

---

### Fix a Bug

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Fix the login error"}
  ],
  "mode": "debugging",
  "enableTools": true
}
```

**What DeepSeek does:**
1. Reads relevant files
2. Analyzes the error
3. Suggests/applies fix
4. Tests the fix

---

### Review Code

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Review the changes in src/auth/login.js"}
  ],
  "mode": "codeReview"
}
```

**What DeepSeek does:**
1. Reads the file
2. Analyzes code quality
3. Checks best practices
4. Provides detailed review

---

## 🔧 Direct Tool Execution

You can also call tools directly:

### Git Status
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/git/status
```

### Read File
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/file/read \
  -H "Content-Type: application/json" \
  -d '{"filePath": "package.json"}'
```

### Start Project
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/project/start
```

### Execute Command
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/command/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "node --version"}'
```

---

## 🏃 Running the Full Stack

### Option 1: Separate Terminals

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: API Server
npm run start:dev

# Terminal 3: Frontend
npm run dev
```

### Option 2: All-in-One (if configured)

```bash
npm run dev:deepseek
```

---

## ✅ Verify Setup

### 1. Check Ollama
```bash
curl http://localhost:11434/api/tags
# Should list deepseek-r1:latest
```

### 2. Check API Health
```bash
curl http://localhost:3001/api/enhanced-rag/health
# Should return status: "ok"
```

### 3. List Tools
```bash
curl http://localhost:3001/api/enhanced-rag/tools
# Should list available tools
```

### 4. Test Chat
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## 🐛 Troubleshooting

### Ollama Not Running
```bash
# Check if running
curl http://localhost:11434/api/tags

# Start it
ollama serve
```

### Model Not Found
```bash
# List models
ollama list

# Pull model
ollama pull deepseek-r1:latest
```

### API Not Responding
```bash
# Check if running
curl http://localhost:3001/api/health

# Start API
npm run start:dev
```

### Tools Not Working
```bash
# Check tools endpoint
curl http://localhost:3001/api/enhanced-rag/tools

# Test specific tool
curl -X POST http://localhost:3001/api/enhanced-rag/tool/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "system.getInfo"}'
```

---

## 📖 Full Documentation

See [RAG_ORC_DEEPSEEK_COMPLETE_GUIDE.md](./RAG_ORC_DEEPSEEK_COMPLETE_GUIDE.md) for:
- Detailed architecture
- All API endpoints
- Prompt engineering
- Advanced features
- Best practices

---

## 🎉 What You Can Do Now

With DeepSeek and the RAG system, you can:

✅ Chat with AI about your codebase
✅ Execute Git operations via conversation
✅ Start/stop/build your project
✅ Read and write files
✅ Debug errors with AI assistance
✅ Get code reviews
✅ Automate development workflows
✅ Create branches and commits
✅ Index and search your codebase

**Try it now:**
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What can you help me with?"}
    ],
    "mode": "assistant"
  }'
```

Happy coding! 🚀
