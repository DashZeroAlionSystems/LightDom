# Testing the RAG System - Screenshot Guide

## 🎯 Purpose

This guide shows you how to test the RAG (Retrieval-Augmented Generation) system and verify it's working correctly by:
1. Starting the required services (Ollama, API server)
2. Running a simple chat test
3. Taking screenshots of the interaction
4. Verifying the response

---

## 📋 Prerequisites

Before testing, ensure you have:

1. **Ollama installed**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Or download from https://ollama.com
   ```

2. **DeepSeek model pulled**
   ```bash
   ollama pull deepseek-r1:latest
   ```

3. **Dependencies installed**
   ```bash
   npm install
   ```

---

## 🚀 Step-by-Step Testing

### Step 1: Start Ollama

Open a terminal and start Ollama:

```bash
ollama serve
```

**Expected Output:**
```
✓ Ollama server started
→ Listening on http://127.0.0.1:11434
```

**📸 Screenshot 1: Ollama Running**
- Take a screenshot showing Ollama server running
- Should show the listening address

---

### Step 2: Verify Model is Available

In another terminal:

```bash
ollama list
```

**Expected Output:**
```
NAME                     ID              SIZE      MODIFIED
deepseek-r1:latest      a1b2c3d4e5f6    4.7 GB    2 days ago
```

**📸 Screenshot 2: Model List**
- Take a screenshot showing DeepSeek model is available

---

### Step 3: Start API Server

In another terminal:

```bash
cd /path/to/LightDom
npm run start:dev
```

**Expected Output:**
```
🚀 Starting LightDom Development Environment...
✅ RAG routes registered at /api/rag
✅ Enhanced RAG routes with DeepSeek tools mounted at /api/enhanced-rag
🚀 Server running on http://localhost:3001
```

**📸 Screenshot 3: API Server Running**
- Take a screenshot showing the API server started successfully
- Should show the RAG routes mounted

---

### Step 4: Run Chat Test Script

In another terminal:

```bash
cd /path/to/LightDom
node scripts/test-rag-chat.js "hi"
```

**Expected Output:**

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              RAG System Chat Test                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

============================================================
Step 1: Checking Ollama Connection
============================================================

✅ Ollama is running at http://localhost:11434
✅ Found 1 model(s)
  • deepseek-r1:latest
✅ DeepSeek model is available

============================================================
Step 2: Checking API Server
============================================================

✅ API server is running at http://localhost:3001

============================================================
Step 3: Checking RAG System Health
============================================================

✅ RAG system health check passed

RAG System Status:
  Overall Status: ok
  Vector Store: ok
  Embeddings: ok
    Provider: ollama
  LLM: ok
    Provider: deepseek-r1:latest
    Is Ollama: Yes
  Tools: ok
    Available: 5

============================================================
Step 4: Testing Chat
============================================================

ℹ️  Sending message: "hi"

✅ Chat request successful. Streaming response:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DeepSeek Response:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello! I'm DeepSeek, your AI coding assistant integrated into the 
LightDom platform. How can I help you today?

I can assist with:
- Code analysis and generation
- Git workflow management
- File system operations
- Project management
- Debugging and troubleshooting

What would you like help with?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ✨ Chat test completed successfully!

============================================================
Test Summary
============================================================

✅ Ollama Connection: PASSED
✅ API Server: PASSED
✅ RAG Health: PASSED
✅ Chat Test: PASSED

✅ 🎉 All tests passed! (4/4)

📸 To take a screenshot:
   1. Run this script in your terminal
   2. Take a screenshot of the output
   3. The response shown above is from the RAG system
```

**📸 Screenshot 4: Complete Test Output** ⭐ **MOST IMPORTANT**
- Take a screenshot of the entire test output
- This shows:
  - ✅ All services running
  - ✅ Health checks passing
  - ✅ Your message: "hi"
  - ✅ DeepSeek's response
  - ✅ All tests passed

---

### Step 5: Test with Different Messages

Try different messages to see various responses:

#### Example 1: Ask about capabilities
```bash
node scripts/test-rag-chat.js "What can you help me with?"
```

**📸 Screenshot 5: Capabilities Response**
- Shows DeepSeek listing its capabilities

#### Example 2: Technical question
```bash
node scripts/test-rag-chat.js "How does the RAG system work?"
```

**📸 Screenshot 6: Technical Response**
- Shows DeepSeek explaining the RAG system

#### Example 3: Friendly greeting
```bash
node scripts/test-rag-chat.js "Hello! How are you?"
```

**📸 Screenshot 7: Friendly Response**
- Shows DeepSeek responding naturally

---

## 🔍 Verification Checklist

Use this checklist to verify the RAG system is working:

- [ ] ✅ Ollama is running and accessible
- [ ] ✅ DeepSeek model is available in Ollama
- [ ] ✅ API server started successfully
- [ ] ✅ RAG routes are mounted at `/api/enhanced-rag`
- [ ] ✅ Health check returns status "ok"
- [ ] ✅ Vector store is operational
- [ ] ✅ Embeddings provider (Ollama) is working
- [ ] ✅ LLM (DeepSeek) is connected
- [ ] ✅ Tools are available
- [ ] ✅ Chat request succeeds
- [ ] ✅ Response is received and displayed
- [ ] ✅ Response is coherent and relevant

---

## 🎨 Screenshot Requirements

When taking screenshots for verification, ensure:

1. **Terminal is visible** - Show the command and output
2. **Timestamps** - If possible, show system time
3. **Complete output** - Don't crop important information
4. **High quality** - Make sure text is readable
5. **Labels** - Add labels or arrows if needed

### Recommended Screenshot Tool

- **macOS**: Cmd+Shift+4 (select area) or Cmd+Shift+5 (screenshot tool)
- **Windows**: Win+Shift+S (Snipping Tool)
- **Linux**: gnome-screenshot, flameshot, or similar

---

## 🎬 Alternative: Screen Recording

If screenshots aren't sufficient, record a screen video showing:

1. Starting Ollama
2. Starting API server
3. Running test script
4. Showing the chat interaction

Tools:
- **macOS**: QuickTime Screen Recording
- **Windows**: Xbox Game Bar (Win+G)
- **Linux**: SimpleScreenRecorder, OBS

---

## 🔧 Troubleshooting Screenshots

If tests fail, take screenshots of:

1. **Error messages** - Full terminal output with errors
2. **Logs** - API server logs showing issues
3. **Health check** - Run `curl http://localhost:3001/api/enhanced-rag/health`

---

## 📊 Expected vs Actual

### ✅ What Good Output Looks Like

```
✅ All green checkmarks
✅ "Chat test completed successfully"
✅ Coherent response from DeepSeek
✅ No error messages
✅ All 4 tests passed
```

### ❌ What Problems Look Like

```
❌ Red X marks
❌ "Cannot connect to..."
❌ Error stack traces
❌ Timeout messages
❌ Failed health checks
```

---

## 🎯 Quick Test Command

For a quick one-line test:

```bash
# Test with "hi"
node scripts/test-rag-chat.js

# Test with custom message
node scripts/test-rag-chat.js "Tell me about yourself"

# Test and save output
node scripts/test-rag-chat.js "hi" | tee test-output.txt
```

---

## 📝 Reporting Results

When sharing screenshots, include:

1. **Screenshot 4** (Complete test output) - REQUIRED
2. **Screenshot 1** (Ollama running) - Optional but helpful
3. **Screenshot 3** (API server running) - Optional but helpful
4. Any error screenshots if tests failed

### Format for Reporting

```markdown
## RAG System Test Results

**Date**: [Your date]
**Environment**: [OS, Node version]

### Test Status: ✅ PASSED / ❌ FAILED

#### Screenshots:
1. [Attach Screenshot 4 - Complete test output]
2. [Optional: Other screenshots]

#### Notes:
- All tests passed successfully
- Response time: ~2 seconds
- DeepSeek responded appropriately
```

---

## 🔄 Continuous Testing

To ensure the RAG system stays functional:

1. **Run tests after changes**
   ```bash
   node scripts/test-rag-chat.js
   ```

2. **Automate testing**
   - Add to CI/CD pipeline
   - Run before deployments
   - Schedule regular health checks

3. **Monitor in production**
   - Use health check endpoint
   - Set up alerts
   - Log response times

---

## 📚 Additional Resources

- **RAG_QUICKSTART.md** - Quick setup guide
- **RAG_ORC_DEEPSEEK_COMPLETE_GUIDE.md** - Complete documentation
- **VISUAL_GUIDE_RAG.md** - Visual examples
- **scripts/test-rag-system.js** - Full validation suite

---

## ✨ Success Criteria

Your RAG system is working correctly if:

✅ Test script runs without errors
✅ All 4 tests pass
✅ DeepSeek responds to messages
✅ Response is relevant and coherent
✅ Health check shows "ok" status
✅ No timeout or connection errors

---

*Take Screenshot 4 (Complete Test Output) and save it as proof that the RAG system is working! This shows the full interaction including your message and DeepSeek's response.*
