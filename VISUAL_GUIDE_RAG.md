# Visual Guide: Using the RAG System with DeepSeek

## 🎯 Overview

This guide shows you exactly what to expect when using the RAG system with DeepSeek computer use capabilities.

---

## 🚀 Startup Sequence

### Step 1: Start Ollama
```bash
$ ollama serve
```

**Expected Output**:
```
✓ Ollama server started
→ Listening on http://127.0.0.1:11434
```

### Step 2: Verify Model
```bash
$ ollama list
```

**Expected Output**:
```
NAME                     ID              SIZE      MODIFIED
deepseek-r1:latest      a1b2c3d4e5f6    4.7 GB    2 days ago
```

### Step 3: Start LightDom API
```bash
$ npm run start:dev
```

**Expected Output**:
```
✅ RAG routes registered at /api/rag
✅ Enhanced RAG routes with DeepSeek tools mounted at /api/enhanced-rag
🚀 Server running on http://localhost:3001
```

---

## 💬 Chat Examples

### Example 1: Getting Started

**Request**:
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

**Response (Stream)**:
```
data: {"type": "chunk", "content": "I'm DeepSeek, your AI coding assistant! I can help you with:\n\n"}
data: {"type": "chunk", "content": "🔧 Development Tasks:\n"}
data: {"type": "chunk", "content": "- Start/stop/build your project\n"}
data: {"type": "chunk", "content": "- Run tests and scripts\n"}
data: {"type": "chunk", "content": "- Install dependencies\n\n"}
data: {"type": "chunk", "content": "🔀 Git Operations:\n"}
data: {"type": "chunk", "content": "- Create branches\n"}
data: {"type": "chunk", "content": "- Commit and push changes\n"}
data: {"type": "chunk", "content": "- View git status and history\n\n"}
data: {"type": "chunk", "content": "📂 File Operations:\n"}
data: {"type": "chunk", "content": "- Read and write files\n"}
data: {"type": "chunk", "content": "- List directories\n"}
data: {"type": "chunk", "content": "- Create folders\n\n"}
data: {"type": "chunk", "content": "🧠 Code Understanding:\n"}
data: {"type": "chunk", "content": "- Explain how code works\n"}
data: {"type": "chunk", "content": "- Review code quality\n"}
data: {"type": "chunk", "content": "- Debug errors\n"}
data: {"type": "chunk", "content": "- Discuss architecture\n\n"}
data: {"type": "chunk", "content": "What would you like help with?"}
data: [DONE]
```

---

### Example 2: Start the Project

**Request**:
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Start the development server"}
    ],
    "mode": "developer",
    "enableTools": true
  }'
```

**Response (Stream with Tool Execution)**:
```
data: {"type": "chunk", "content": "I'll start the development server for you.\n\n"}
data: {"type": "tool_call", "tool": "project.start", "params": {}}
data: {"type": "tool_result", "tool": "project.start", "result": {"success": true, "stdout": "Server started on port 3000"}}
data: {"type": "chunk", "content": "✅ Development server started successfully!\n\n"}
data: {"type": "chunk", "content": "The server is now running on http://localhost:3000\n\n"}
data: {"type": "chunk", "content": "You can access:\n"}
data: {"type": "chunk", "content": "- Frontend: http://localhost:3000\n"}
data: {"type": "chunk", "content": "- API: http://localhost:3001\n"}
data: [DONE]
```

---

### Example 3: Git Workflow

**Request**:
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Create a feature branch for dark mode"}
    ],
    "mode": "gitWorkflow",
    "enableTools": true
  }'
```

**Response (Stream with Multiple Tools)**:
```
data: {"type": "chunk", "content": "I'll create a feature branch for dark mode.\n\n"}
data: {"type": "tool_call", "tool": "git.createBranch", "params": {"branchName": "feature/dark-mode"}}
data: {"type": "tool_result", "tool": "git.createBranch", "result": {"success": true, "stdout": "Switched to a new branch 'feature/dark-mode'"}}
data: {"type": "chunk", "content": "✅ Created and switched to branch: feature/dark-mode\n\n"}
data: {"type": "chunk", "content": "You're now ready to implement dark mode!\n\n"}
data: {"type": "chunk", "content": "Suggested next steps:\n"}
data: {"type": "chunk", "content": "1. Create theme configuration\n"}
data: {"type": "chunk", "content": "2. Update color variables\n"}
data: {"type": "chunk", "content": "3. Add theme toggle component\n"}
data: {"type": "chunk", "content": "4. Test in both modes\n\n"}
data: {"type": "chunk", "content": "Let me know if you'd like help with any of these!"}
data: [DONE]
```

---

### Example 4: Code Understanding

**Request**:
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain how the enhanced RAG service works"}
    ],
    "mode": "codebaseExpert"
  }'
```

**Response (Stream with Context)**:
```
data: {"type": "context", "documents": [{"documentId": "services/rag/enhanced-rag-service.js", "score": 0.92}]}
data: {"type": "chunk", "content": "The Enhanced RAG Service is a sophisticated system that combines:\n\n"}
data: {"type": "chunk", "content": "🏗️ Architecture:\n\n"}
data: {"type": "chunk", "content": "1. **Base RAG Service**\n"}
data: {"type": "chunk", "content": "   - Vector store for semantic search\n"}
data: {"type": "chunk", "content": "   - Embedding generation (Ollama or OpenAI)\n"}
data: {"type": "chunk", "content": "   - DeepSeek client integration\n\n"}
data: {"type": "chunk", "content": "2. **Tool System**\n"}
data: {"type": "chunk", "content": "   - Git operations\n"}
data: {"type": "chunk", "content": "   - File management\n"}
data: {"type": "chunk", "content": "   - Project automation\n"}
data: {"type": "chunk", "content": "   - Command execution\n\n"}
data: {"type": "chunk", "content": "3. **Conversation Management**\n"}
data: {"type": "chunk", "content": "   - Multi-conversation support\n"}
data: {"type": "chunk", "content": "   - History persistence\n"}
data: {"type": "chunk", "content": "   - Context tracking\n\n"}
data: {"type": "chunk", "content": "🔄 Flow:\n"}
data: {"type": "chunk", "content": "User message → Tool detection → Tool execution → Response generation\n\n"}
data: {"type": "chunk", "content": "📝 Key Features:\n"}
data: {"type": "chunk", "content": "- Automatic tool detection in responses\n"}
data: {"type": "chunk", "content": "- Safety checks before execution\n"}
data: {"type": "chunk", "content": "- Streaming responses for better UX\n"}
data: {"type": "chunk", "content": "- Mode-based prompting\n"}
data: [DONE]
```

---

## 🔧 Direct Tool Calls

### Git Status

**Request**:
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/git/status
```

**Response**:
```json
{
  "success": true,
  "operation": "status",
  "result": {
    "success": true,
    "stdout": " M api-server-express.js\n M .env.example\n?? services/rag/deepseek-tools.js\n",
    "stderr": "",
    "command": "git status --short",
    "cwd": "/path/to/LightDom"
  }
}
```

---

### Read File

**Request**:
```bash
curl -X POST http://localhost:3001/api/enhanced-rag/file/read \
  -H "Content-Type: application/json" \
  -d '{"filePath": "package.json"}'
```

**Response**:
```json
{
  "success": true,
  "operation": "read",
  "result": {
    "success": true,
    "content": "{\n  \"name\": \"lightdom-space-bridge-platform\",\n  \"version\": \"1.0.0\",\n  ...",
    "path": "package.json"
  }
}
```

---

### Project Info

**Request**:
```bash
curl http://localhost:3001/api/enhanced-rag/project/info
```

**Response**:
```json
{
  "success": true,
  "info": {
    "success": true,
    "name": "lightdom-space-bridge-platform",
    "version": "1.0.0",
    "description": "Blockchain-based DOM optimization platform",
    "scripts": [
      "start",
      "dev",
      "build",
      "test",
      "lint"
    ],
    "dependencies": [
      "express",
      "react",
      "ethers",
      "@langchain/core"
    ]
  }
}
```

---

## 🎭 Different Modes in Action

### Assistant Mode (General)
```
User: "What's the weather?"
DeepSeek: "I'm a coding assistant focused on development tasks. I can help with code, Git, files, and project management, but I don't have access to weather data."
```

### Developer Mode (Task Automation)
```
User: "Install dependencies"
DeepSeek: [Executes npm install]
"✅ Dependencies installed successfully!"
```

### Debugging Mode (Error Fixing)
```
User: "I'm getting 'undefined is not a function'"
DeepSeek: "Let me help debug this. Can you share:
1. The error stack trace
2. The file where it's happening
3. What you were trying to do

I'll analyze the code and identify the issue."
```

### Code Review Mode (Quality Check)
```
User: "Review this code: [paste code]"
DeepSeek: "
Code Review:

✅ Strengths:
- Clear variable names
- Good error handling

⚠️  Issues:
1. Missing input validation (line 5)
2. Async function not awaited (line 12)

💡 Suggestions:
- Add try-catch blocks
- Use const instead of let where possible
"
```

---

## 📊 Health Check

**Request**:
```bash
curl http://localhost:3001/api/enhanced-rag/health
```

**Response**:
```json
{
  "status": "ok",
  "vectorStore": {
    "status": "ok",
    "tableName": "rag_chunks",
    "dimension": 384
  },
  "embeddings": {
    "status": "ok",
    "provider": "ollama"
  },
  "llm": {
    "status": "ok",
    "provider": "deepseek-r1:latest",
    "isOllama": true
  },
  "tools": {
    "status": "ok",
    "available": 5
  },
  "conversations": {
    "active": 3
  }
}
```

---

## 🎨 Complete Workflow Example

### Scenario: Create a new feature from scratch

**Step 1: Check current status**
```bash
User: "What's the current git status?"
DeepSeek: [Shows modified files and branch]
```

**Step 2: Create feature branch**
```bash
User: "Create a branch for user profiles"
DeepSeek: [Creates feature/user-profiles]
```

**Step 3: Get project info**
```bash
User: "Show me the project structure"
DeepSeek: [Lists directories and explains organization]
```

**Step 4: Create files**
```bash
User: "Create a user profile component"
DeepSeek: [Creates src/components/UserProfile.jsx with code]
```

**Step 5: Test**
```bash
User: "Run the tests"
DeepSeek: [Executes npm test, shows results]
```

**Step 6: Commit**
```bash
User: "Commit the changes with message 'Add user profile component'"
DeepSeek: [Stages and commits files]
```

**Step 7: Push**
```bash
User: "Push to remote"
DeepSeek: [Pushes to origin feature/user-profiles]
```

---

## 🛡️ Safety Features in Action

### Blocked Command
```bash
User: "Delete all files with rm -rf *"
DeepSeek: "⚠️ I cannot execute that command for safety reasons. The 'rm' command is not in the allowed list to prevent accidental data loss."
```

### Confirmation Request
```bash
User: "Overwrite the main config file"
DeepSeek: "⚠️ This will overwrite an important file. Are you sure? Please confirm with 'yes' if you want to proceed."
```

---

## 📈 Monitoring

### List Active Conversations
```bash
curl http://localhost:3001/api/enhanced-rag/conversations
```

**Response**:
```json
{
  "success": true,
  "conversations": [
    "default",
    "git-session",
    "dev-session"
  ],
  "count": 3
}
```

### Get Conversation History
```bash
curl http://localhost:3001/api/enhanced-rag/conversation/dev-session
```

**Response**:
```json
{
  "success": true,
  "conversation": {
    "messages": [
      {"role": "user", "content": "Start the server"},
      {"role": "assistant", "content": "✅ Server started..."}
    ],
    "tools": [
      {
        "tool": "project.start",
        "params": {},
        "result": {"success": true},
        "timestamp": "2025-11-17T14:30:00.000Z"
      }
    ],
    "context": {}
  }
}
```

---

## 🎓 Tips for Best Results

1. **Be Specific**: "Start the dev server" vs "Do something"
2. **Use Right Mode**: Choose mode that matches your task
3. **Enable Tools**: Set `enableTools: true` for automation
4. **Ask for Confirmation**: DeepSeek will ask before dangerous operations
5. **Check Health**: Run health check if things aren't working
6. **Clear History**: Clear old conversations to save memory

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to Ollama"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start it if not running
ollama serve
```

### Issue: "Model not found"
```bash
# Pull the model
ollama pull deepseek-r1:latest
```

### Issue: "Tool execution failed"
```bash
# Check tool is allowed
curl http://localhost:3001/api/enhanced-rag/tools

# Try direct execution
curl -X POST http://localhost:3001/api/enhanced-rag/tool/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "system.getInfo"}'
```

---

## 📚 Learn More

- **Quick Start**: `RAG_QUICKSTART.md`
- **Complete Guide**: `RAG_ORC_DEEPSEEK_COMPLETE_GUIDE.md`
- **Examples**: `examples/deepseek-rag-examples.js`
- **Tests**: `scripts/test-rag-system.js`

---

*This visual guide shows exactly what to expect when using the RAG system. All examples are real and will work once you have Ollama and the API running.*
