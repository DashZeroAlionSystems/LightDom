# RAG Visual Test - Quick Reference

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend
```bash
DB_DISABLED=true node api-server-express.js
```
Wait for: "Server running on port 3001"

### Step 2: Start Frontend
```bash
cd frontend && npm run dev
```
Wait for: "Local: http://localhost:3000"

### Step 3: Run Visual Test
```bash
node scripts/test-rag-manual-visual.js
```

## 📸 What You'll Get

9 screenshots showing:
- ✅ App loaded
- ✅ RAG interface displayed  
- ✅ Connection status (green)
- ✅ Input field focused
- ✅ Test message typed
- ✅ Message sent
- ✅ **RAG responding** ⭐
- ✅ Second interaction
- ✅ Final state

Plus: Beautiful HTML summary page!

## 📁 Find Results

```bash
# Screenshots location
test-screenshots/rag-manual-[timestamp]/

# Open summary page
open test-screenshots/rag-manual-*/index.html
```

## 🔧 Prerequisites

```bash
# Install Playwright if needed
npx playwright install chromium

# Or all browsers
npx playwright install
```

## ⚡ Alternative: Full Automation

```bash
# Auto-starts services, runs tests, cleans up
node scripts/test-rag-visual.js
```

## 📖 Full Documentation

See `RAG_TESTING_GUIDE.md` for:
- Detailed instructions
- Troubleshooting
- Advanced usage
- CI/CD integration

## ✅ Success Indicators

Test passes when you see:
```
✅ TEST COMPLETED SUCCESSFULLY
📁 All screenshots saved to: [path]
📄 Open index.html in that folder to view results
```

## ❌ Troubleshooting

**Backend not running?**
```bash
# Check port
lsof -i :3001

# Kill if needed
kill -9 [PID]
```

**Frontend not running?**
```bash
# Check port
lsof -i :3000

# Kill if needed  
kill -9 [PID]
```

**Playwright error?**
```bash
npx playwright install chromium
```

## 🎯 What This Proves

1. RAG service is online
2. Frontend connects successfully
3. Messages reach RAG
4. RAG responds correctly
5. UI updates properly
6. Error handling works

**All verified with visual proof!** 📸
