# Complete RAG System with ORC and DeepSeek Integration Guide

## 🎯 Overview

This guide provides comprehensive documentation for the enhanced RAG (Retrieval-Augmented Generation) system integrated with ORC (Ollama Remote Chat) and DeepSeek, including computer use capabilities, Git workflow automation, and codebase interaction.

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Installation & Setup](#installation--setup)
3. [ORC (Ollama) Integration](#orc-ollama-integration)
4. [DeepSeek Configuration](#deepseek-configuration)
5. [Prompt Engineering](#prompt-engineering)
6. [Computer Use Tools](#computer-use-tools)
7. [Git Workflow Automation](#git-workflow-automation)
8. [Codebase Interaction](#codebase-interaction)
9. [API Reference](#api-reference)
10. [Examples](#examples)
11. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - Chat interface                                           │
│  - Tool execution UI                                        │
│  - Real-time streaming                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Enhanced RAG Service                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Conversation Management  │  Tool Execution         │   │
│  │  Prompt Engineering       │  Codebase Indexing      │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼──────┐              ┌────────▼────────┐
│   ORC/       │              │   Vector Store  │
│   Ollama     │              │   (PostgreSQL)  │
│  DeepSeek    │              │  + pgvector     │
└──────────────┘              └─────────────────┘
       │
┌──────▼────────────────────────────────────┐
│         DeepSeek Tools                    │
│  - Git Operations                         │
│  - File System                            │
│  - Command Execution                      │
│  - Project Management                     │
└───────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
# LangChain and Ollama dependencies (if not already installed)
npm install --legacy-peer-deps @langchain/core @langchain/community @langchain/ollama langchain

# Additional dependencies
npm install better-sqlite3 multer
```

### 2. Install Ollama

#### macOS/Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Windows
Download from [https://ollama.com](https://ollama.com)

### 3. Pull DeepSeek Model

```bash
# Latest DeepSeek R1 (recommended)
ollama pull deepseek-r1:latest

# Alternative: DeepSeek Coder
ollama pull deepseek-coder

# Smaller variant for testing
ollama pull deepseek-r1:7b
```

### 4. Start Ollama Server

```bash
# Default port 11434
ollama serve

# Custom port
OLLAMA_HOST=127.0.0.1:11500 ollama serve
```

### 5. Configure Environment

Add to `.env`:

```bash
# ORC/Ollama Configuration
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest
OLLAMA_TIMEOUT=60000

# DeepSeek API (optional, for remote fallback)
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-coder

# RAG Configuration
RAG_EMBED_PROVIDER=ollama  # or 'openai'
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=120

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom
```

### 6. Initialize Database

```bash
# Create vector extension
psql -d lightdom -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations (if available)
npm run migrate
```

---

## ORC (Ollama) Integration

### What is ORC?

ORC (Ollama Remote Chat) is the integration layer between the RAG system and Ollama, providing:
- Local LLM serving
- Streaming responses
- Context management
- Tool integration

### Configuration

```javascript
// services/rag/enhanced-rag-service.js
const service = createEnhancedRagService({
  db: poolInstance,
  config: {
    useOllamaEmbeddings: true,  // Use Ollama for embeddings
    ollama: {
      endpoint: 'http://localhost:11434',
      model: 'deepseek-r1:latest',
      temperature: 0.7,
      maxTokens: 2048
    }
  }
});
```

### Using ORC

```javascript
// Chat with ORC
const messages = [
  { role: 'user', content: 'Explain the RAG system architecture' }
];

for await (const event of service.chatWithTools(messages, {
  conversationId: 'my-session',
  mode: 'codebaseExpert',  // Use codebase expert mode
  enableTools: true
})) {
  if (event.type === 'chunk') {
    console.log(event.content);
  }
}
```

---

## DeepSeek Configuration

### Modes

DeepSeek supports multiple modes for different tasks:

1. **assistant** - General-purpose assistant
2. **codebaseExpert** - Deep codebase understanding
3. **developer** - Development task automation
4. **gitWorkflow** - Git operations specialist
5. **debugging** - Error diagnosis and fixing
6. **codeReview** - Code review and quality
7. **architecture** - System design

### Selecting a Mode

```javascript
// API Request
POST /api/enhanced-rag/chat/tools/stream
{
  "messages": [
    { "role": "user", "content": "Review this code..." }
  ],
  "mode": "codeReview",
  "enableTools": true
}
```

### Mode Capabilities

| Mode | Strengths | Use Cases |
|------|-----------|-----------|
| assistant | General help | Questions, explanations |
| codebaseExpert | Code understanding | Architecture questions, debugging |
| developer | Task automation | Running scripts, file operations |
| gitWorkflow | Git operations | Commits, branches, PRs |
| debugging | Error fixing | Bug diagnosis, fixes |
| codeReview | Quality checks | Review, best practices |
| architecture | System design | Design discussions, planning |

---

## Prompt Engineering

### System Prompts

System prompts are pre-configured for each mode. See `services/rag/prompt-templates.js`.

### Custom Prompts

```javascript
import { buildPrompt, systemPrompts } from './services/rag/prompt-templates.js';

// Build custom prompt
const prompt = buildPrompt('developer', 'codeGeneration', {
  args: ['Create a REST API endpoint', 'javascript'],
  additionalContext: 'Use Express.js and follow project conventions'
});
```

### Task Prompts

```javascript
import { taskPrompts } from './services/rag/prompt-templates.js';

// Code generation prompt
const genPrompt = taskPrompts.codeGeneration('Create a user service', 'typescript');

// Bug fix prompt
const bugPrompt = taskPrompts.bugFix('TypeError: undefined is not a function', 'In API route handler');

// Testing prompt
const testPrompt = taskPrompts.testing(codeSnippet, 'vitest');
```

### Response Formatting

```javascript
import { responseFormatters } from './services/rag/prompt-templates.js';

// Format code block
const code = responseFormatters.codeBlock('console.log("Hello")', 'javascript');

// Format command
const cmd = responseFormatters.command('npm install', 'Install dependencies');

// Format result
const result = responseFormatters.result(true, { installed: true });
```

---

## Computer Use Tools

### Available Tools

DeepSeek has access to these tools for computer use:

#### 1. Command Execution
```javascript
// Execute safe commands
TOOL:command({"command": "npm start"})
TOOL:command({"command": "node --version"})
```

#### 2. Git Operations
```javascript
// Git status
TOOL:git.status()

// Create branch
TOOL:git.createBranch({"branchName": "feature/new-feature"})

// Commit changes
TOOL:git.commit({"message": "feat: add new feature"})

// Push
TOOL:git.push()
```

#### 3. File Operations
```javascript
// Read file
TOOL:file.read({"filePath": "/path/to/file.js"})

// Write file
TOOL:file.write({"filePath": "/path/to/file.js", "content": "..."})

// List directory
TOOL:file.list({"dirPath": "/path/to/dir"})

// Create directory
TOOL:file.mkdir({"dirPath": "/path/to/newdir"})
```

#### 4. Project Management
```javascript
// Install dependencies
TOOL:project.installDependencies()

// Start project
TOOL:project.start()

// Run build
TOOL:project.build()

// Run tests
TOOL:project.test()

// Get project info
TOOL:project.getInfo()
```

#### 5. System Information
```javascript
// Get system info
TOOL:system.getInfo()

// Get environment variables (safe subset)
TOOL:system.getEnv()
```

### Tool Safety

- Only whitelisted commands are allowed
- Destructive operations require explicit confirmation
- File operations are validated
- Git operations use safe defaults
- Environment access is restricted

### Using Tools in Chat

Example conversation:

```
User: Can you start the project?

DeepSeek: I'll start the project for you.

TOOL:project.start()

[Tool executes]

DeepSeek: ✅ Project started successfully! The development server is now running on port 3000.
```

---

## Git Workflow Automation

### Automated Workflows

DeepSeek can automate entire Git workflows:

#### Example 1: Feature Branch Workflow

```
User: Create a new feature for user authentication

DeepSeek:
1. Creating feature branch...
   TOOL:git.createBranch({"branchName": "feature/user-authentication"})
   
2. Branch created. I'll help you implement the feature.
   [Implementation steps...]
   
3. Once complete, I'll commit the changes:
   TOOL:git.add({"files": "."})
   TOOL:git.commit({"message": "feat: add user authentication"})
   
4. Pushing to remote:
   TOOL:git.push({"remote": "origin", "branch": "feature/user-authentication"})

Ready for pull request!
```

#### Example 2: Bug Fix Workflow

```
User: Fix the login bug

DeepSeek:
1. Creating hotfix branch...
   TOOL:git.createBranch({"branchName": "hotfix/login-bug"})
   
2. Analyzing the issue...
   TOOL:file.read({"filePath": "src/auth/login.js"})
   
3. Found the issue. Applying fix...
   TOOL:file.write({"filePath": "src/auth/login.js", "content": "..."})
   
4. Committing fix:
   TOOL:git.commit({"message": "fix: resolve login validation error"})
   
5. Pushing fix:
   TOOL:git.push()

Bug fixed and pushed!
```

### Issue/Ticket Creation

```javascript
// Create issue with Git workflow
TOOL:git.createIssue({
  "title": "Add dark mode support",
  "description": "Implement dark mode theme switching",
  "labels": ["feature", "ui"]
})
```

This creates a new branch `issue/add-dark-mode-support` and sets up the workflow.

### Commit Message Conventions

DeepSeek follows conventional commits:

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

---

## Codebase Interaction

### Indexing Codebase

```javascript
// Index entire codebase
POST /api/enhanced-rag/codebase/index
{
  "projectPath": "/path/to/project",
  "patterns": ["**/*.js", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", ".git"]
}
```

### Querying Codebase

```javascript
// Ask about code
POST /api/enhanced-rag/chat/tools/stream
{
  "messages": [
    {
      "role": "user",
      "content": "How does the RAG system work in this codebase?"
    }
  ],
  "mode": "codebaseExpert"
}
```

DeepSeek will:
1. Search vector store for relevant code
2. Analyze architecture
3. Explain implementation
4. Provide examples

### Code Navigation

```
User: Show me the RAG service implementation

DeepSeek:
Let me find that for you...
TOOL:file.read({"filePath": "services/rag/rag-service.js"})

Here's the RAG service implementation:

[Shows code with explanation]

Key components:
1. Vector store initialization
2. Embedding client
3. DeepSeek client integration
4. Document upsert functionality
5. Similarity search

Would you like me to explain any specific part?
```

---

## API Reference

### Chat with Tools (Streaming)

```http
POST /api/enhanced-rag/chat/tools/stream
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Your message" }
  ],
  "conversationId": "optional-id",
  "mode": "assistant",
  "enableTools": true,
  "temperature": 0.7,
  "maxTokens": 2048
}
```

Response: Server-Sent Events (SSE)

```javascript
data: {"type": "chunk", "content": "Hello", "conversationId": "..."}
data: {"type": "tool_call", "tool": "git.status", "params": {}}
data: {"type": "tool_result", "tool": "git.status", "result": {...}}
data: {"type": "done", "conversationId": "...", "retrieved": [...]}
data: [DONE]
```

### Execute Tool

```http
POST /api/enhanced-rag/tool/execute
Content-Type: application/json

{
  "tool": "git.status",
  "params": {},
  "conversationId": "optional-id"
}
```

Response:
```json
{
  "success": true,
  "tool": "git.status",
  "result": {
    "success": true,
    "stdout": "...",
    "stderr": "",
    "command": "git status --short",
    "cwd": "/path/to/repo"
  }
}
```

### Git Operations

```http
POST /api/enhanced-rag/git/:operation
Content-Type: application/json

{
  // Operation-specific parameters
}
```

Operations:
- `status` - Get repository status
- `createBranch` - Create new branch
- `switchBranch` - Switch to branch
- `add` - Stage files
- `commit` - Commit changes
- `push` - Push to remote
- `pull` - Pull from remote
- `diff` - View changes
- `log` - View commit history
- `listBranches` - List branches

### File Operations

```http
POST /api/enhanced-rag/file/:operation
Content-Type: application/json

{
  // Operation-specific parameters
}
```

Operations:
- `read` - Read file
- `write` - Write file
- `list` - List directory
- `mkdir` - Create directory

### Project Operations

```http
POST /api/enhanced-rag/project/:operation
Content-Type: application/json

{
  "projectPath": "/optional/path"
}
```

Operations:
- `installDependencies` - npm install
- `runScript` - npm run <script>
- `start` - npm start
- `build` - npm run build
- `test` - npm test
- `getInfo` - Get package.json info

### Conversation Management

```http
# Get conversation
GET /api/enhanced-rag/conversation/:id

# Clear conversation
DELETE /api/enhanced-rag/conversation/:id

# List all conversations
GET /api/enhanced-rag/conversations
```

### Health Check

```http
GET /api/enhanced-rag/health
```

Response:
```json
{
  "status": "ok",
  "vectorStore": { "status": "ok", ... },
  "embeddings": { "status": "ok", ... },
  "llm": { "status": "ok", ... },
  "tools": { "status": "ok", "available": 5 },
  "conversations": { "active": 3 }
}
```

---

## Examples

### Example 1: Start Project

```javascript
// User request
"Can you start the project?"

// API call
POST /api/enhanced-rag/chat/tools/stream
{
  "messages": [
    { "role": "user", "content": "Can you start the project?" }
  ],
  "mode": "developer",
  "enableTools": true
}

// DeepSeek response (streaming)
1. "I'll start the project for you."
2. [Tool call: project.start()]
3. [Tool result: success]
4. "✅ Project started! Running on port 3000."
```

### Example 2: Create Feature Branch

```javascript
// Direct API call
POST /api/enhanced-rag/git/createBranch
{
  "branchName": "feature/dark-mode"
}

// Response
{
  "success": true,
  "operation": "createBranch",
  "result": {
    "success": true,
    "stdout": "Switched to a new branch 'feature/dark-mode'",
    ...
  }
}
```

### Example 3: Code Review

```javascript
POST /api/enhanced-rag/chat/tools/stream
{
  "messages": [
    {
      "role": "user",
      "content": "Review the changes in src/services/rag/enhanced-rag-service.js"
    }
  ],
  "mode": "codeReview"
}

// DeepSeek will:
1. Read the file
2. Analyze code quality
3. Check best practices
4. Provide detailed review
5. Suggest improvements
```

### Example 4: Debug Error

```javascript
POST /api/enhanced-rag/chat/tools/stream
{
  "messages": [
    {
      "role": "user",
      "content": "I'm getting 'Cannot read property of undefined' in the API"
    }
  ],
  "mode": "debugging",
  "enableTools": true
}

// DeepSeek will:
1. Ask for more context (stack trace, file)
2. Read relevant files
3. Analyze the error
4. Identify root cause
5. Suggest fix
6. Optionally apply fix
```

---

## Troubleshooting

### Ollama Not Connecting

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve

# Check model is pulled
ollama list

# Pull model if missing
ollama pull deepseek-r1:latest
```

### Tools Not Executing

1. Check command whitelist in `deepseek-tools.js`
2. Verify permissions
3. Check error logs
4. Test tool directly:

```javascript
POST /api/enhanced-rag/tool/execute
{
  "tool": "system.getInfo",
  "params": {}
}
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -d lightdom -c "SELECT 1;"

# Verify vector extension
psql -d lightdom -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Check connection string
echo $DATABASE_URL
```

### RAG Not Returning Results

1. Index codebase:
```javascript
POST /api/enhanced-rag/codebase/index
{
  "projectPath": "/path/to/project"
}
```

2. Verify embeddings:
```bash
psql -d lightdom -c "SELECT COUNT(*) FROM rag_chunks;"
```

3. Check health:
```bash
curl http://localhost:3001/api/enhanced-rag/health
```

### Performance Issues

- Reduce `maxTokens` in requests
- Use smaller DeepSeek model variant
- Limit conversation history
- Optimize vector search with `topK` parameter

---

## Best Practices

1. **Mode Selection**: Choose appropriate mode for task
2. **Tool Safety**: Review tool executions before confirming
3. **Conversation Management**: Clear old conversations regularly
4. **Codebase Indexing**: Re-index after major changes
5. **Error Handling**: Always check tool results
6. **Security**: Never expose sensitive environment variables
7. **Performance**: Use streaming for long responses

---

## Next Steps

1. ✅ RAG system operational with ORC
2. ✅ DeepSeek tools configured
3. ✅ Prompt engineering templates ready
4. ✅ Computer use capabilities enabled
5. ✅ Git workflow automation available

**You can now chat with DeepSeek and have it:**
- Execute commands
- Manage Git workflows
- Read and write files
- Start/stop projects
- Review code
- Debug issues
- And more!

Start by trying:
```bash
POST /api/enhanced-rag/chat/tools/stream
{
  "messages": [
    { "role": "user", "content": "Show me the project structure" }
  ],
  "mode": "developer",
  "enableTools": true
}
```

---

## Support & Resources

- **Documentation**: This file
- **API Reference**: `/api/enhanced-rag/` endpoints
- **Tools Reference**: `/api/enhanced-rag/tools`
- **Health Check**: `/api/enhanced-rag/health`
- **Ollama Docs**: https://ollama.com
- **LangChain Docs**: https://js.langchain.com/

Happy coding with DeepSeek! 🚀
