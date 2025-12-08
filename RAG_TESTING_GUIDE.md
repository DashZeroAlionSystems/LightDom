# RAG System Visual Testing Guide

## Overview

This guide provides step-by-step instructions for running visual tests of the RAG system with screenshots to verify functionality.

## Test Scripts Available

### 1. Manual Visual Test (Recommended)
**File:** `scripts/test-rag-manual-visual.js`

This test requires you to start services manually, then runs automated browser tests and captures screenshots.

#### Prerequisites
```bash
# Install dependencies if not already done
PUPPETEER_SKIP_DOWNLOAD=true npm install --legacy-peer-deps
```

#### Running the Test

**Terminal 1 - Start Backend:**
```bash
DB_DISABLED=true node api-server-express.js
```

Wait for the message: "Server running on port 3001" or similar.

**Terminal 2 - Start Frontend:**
```bash
cd frontend && npm run dev
# OR from root:
npm run dev
```

Wait for the message: "Local: http://localhost:3000" or similar.

**Terminal 3 - Run Visual Test:**
```bash
node scripts/test-rag-manual-visual.js
```

### 2. Automated Visual Test
**File:** `scripts/test-rag-visual.js`

This test automatically starts services, runs tests, captures screenshots, and cleans up.

#### Running the Test
```bash
node scripts/test-rag-visual.js
```

**Note:** This may be slower as it handles service startup/shutdown automatically.

### 3. API-Only Test
**File:** `scripts/test-rag-e2e.js`

This test validates RAG endpoints without UI screenshots.

#### Running the Test
```bash
# Backend must be running
DB_DISABLED=true node api-server-express.js

# In another terminal:
node scripts/test-rag-e2e.js
```

## What the Tests Do

### Manual Visual Test Steps

1. **Verify Services Running**
   - Checks backend at http://localhost:3001
   - Checks frontend at http://localhost:3000

2. **Test RAG Health Endpoint**
   - Calls `/api/rag/health`
   - Displays component status

3. **Visual Browser Tests**
   - **Screenshot 1:** Application loaded
   - **Screenshot 2:** RAG interface navigated
   - **Screenshot 3:** Connection status visible
   - **Screenshot 4:** Input field focused
   - **Screenshot 5:** Test message typed
   - **Screenshot 6:** Message sent
   - **Screenshot 7:** RAG response received
   - **Screenshot 8:** Second interaction tested
   - **Screenshot 9:** Final state captured

4. **Generate Summary Page**
   - Creates `index.html` with all screenshots
   - Provides visual overview of test results

## Expected Results

### Successful Test Output

```
╔══════════════════════════════════════════════════════════╗
║     RAG System Manual Visual Test                        ║
╚══════════════════════════════════════════════════════════╝

📁 Screenshots will be saved to: /path/to/test-screenshots/rag-manual-[timestamp]

🔍 Checking if services are running...

✅ Backend is running on http://localhost:3001
✅ Frontend is running on http://localhost:3000

🏥 Testing RAG Health Endpoint...

Status: healthy
Components:
  - database: healthy
  - vectorStore: healthy
  - embedding: healthy
  - llm: healthy

🎬 Starting visual test...

📸 Step 1: Loading application...
   ✅ Screenshot saved: 01-app-loaded.png

📸 Step 2: Finding RAG/Chat interface...
   Found 1 potential RAG links:
     - Prompt Console: http://localhost:3000/prompt-console
   ✅ Screenshot saved: 02-rag-interface.png

📸 Step 3: Checking connection status indicator...
   Found status indicators:
     - RAG service is online
   ✅ Screenshot saved: 03-connection-status.png

📸 Step 4: Testing chat functionality...
   Found 1 input fields
   ✅ Screenshot saved: 04-input-focused.png
   ✅ Screenshot saved: 05-message-typed.png
   Message: "Hello! This is a test of the RAG system..."
   ✅ Clicked send button
   ✅ Screenshot saved: 06-message-sent.png
   Waiting for RAG response (10 seconds)...
   ✅ Screenshot saved: 07-rag-response.png
   Found 2 messages on page

📸 Step 5: Testing second interaction...
   ✅ Screenshot saved: 08-second-interaction.png

📸 Step 6: Capturing final state...
   ✅ Screenshot saved: 09-final-state.png

📄 Summary page created: /path/to/test-screenshots/rag-manual-[timestamp]/index.html
🌐 Open in browser: file:///path/to/test-screenshots/rag-manual-[timestamp]/index.html

✅ Visual test completed successfully!

═══════════════════════════════════════════════════════════
✅ TEST COMPLETED SUCCESSFULLY
═══════════════════════════════════════════════════════════

📁 All screenshots saved to: /path/to/test-screenshots/rag-manual-[timestamp]
📄 Open index.html in that folder to view results
```

### Screenshot Examples

The test captures 9 screenshots showing:

1. **01-app-loaded.png** - Initial application load
   - Verifies frontend is accessible
   - Shows navigation and layout

2. **02-rag-interface.png** - RAG chat interface
   - Shows prompt console or chat page
   - Verifies navigation works

3. **03-connection-status.png** - Connection indicator
   - Shows green/healthy status indicator
   - Confirms RAG service is reachable

4. **04-input-focused.png** - Input field ready
   - Shows cursor in chat input
   - Ready to type message

5. **05-message-typed.png** - Message in input
   - Shows typed test message
   - Before sending

6. **06-message-sent.png** - Message sent
   - Shows message in conversation
   - Waiting for response

7. **07-rag-response.png** - RAG responded
   - Shows assistant's response
   - Confirms RAG is working

8. **08-second-interaction.png** - Follow-up message
   - Shows continued conversation
   - Tests multiple interactions

9. **09-final-state.png** - Complete conversation
   - Shows full conversation history
   - Final state verification

## Viewing Results

### Summary Page

After the test completes, open the generated `index.html` file:

```bash
# From the output, find the path like:
# /path/to/LightDom/test-screenshots/rag-manual-[timestamp]/index.html

# Open in default browser (macOS):
open test-screenshots/rag-manual-*/index.html

# Open in default browser (Linux):
xdg-open test-screenshots/rag-manual-*/index.html

# Open in default browser (Windows):
start test-screenshots/rag-manual-*/index.html
```

The summary page includes:
- Test statistics
- All screenshots in a grid
- Clickable images for full-size view
- Test configuration details
- Completed test steps checklist

### Individual Screenshots

All PNG files are saved in the test directory and can be viewed with any image viewer.

## Troubleshooting

### Backend Not Starting

**Error:** `Backend is NOT running on http://localhost:3001`

**Solution:**
```bash
# Check if port is already in use
lsof -i :3001
# OR
netstat -an | grep 3001

# Kill existing process if needed
kill -9 <PID>

# Start backend
DB_DISABLED=true node api-server-express.js
```

### Frontend Not Starting

**Error:** `Frontend is NOT running on http://localhost:3000`

**Solution:**
```bash
# Check if port is already in use
lsof -i :3000

# Kill existing process if needed
kill -9 <PID>

# Install frontend dependencies
cd frontend && npm install

# Start frontend
npm run dev
```

### Playwright Not Installed

**Error:** `Error: Executable doesn't exist at...`

**Solution:**
```bash
# Install Playwright browsers
npx playwright install chromium

# Or install all browsers
npx playwright install
```

### No Screenshots Captured

**Issue:** Test runs but no screenshots are saved

**Solution:**
1. Check write permissions in project directory
2. Verify `test-screenshots` directory is created
3. Look for error messages in test output
4. Try running with sudo (not recommended) or check directory permissions

### RAG Not Responding

**Issue:** Screenshots show messages but no RAG response

**Possible causes:**
1. **Ollama not running:** Start Ollama service
   ```bash
   # Check Ollama
   curl http://localhost:11434/api/tags
   ```

2. **DeepSeek API key missing:** Set environment variable
   ```bash
   export DEEPSEEK_API_KEY=your_key_here
   ```

3. **Database not initialized:** Check database connection
   ```bash
   # If using DB, ensure it's running
   # Check connection in health endpoint
   curl http://localhost:3001/api/rag/health
   ```

## Advanced Usage

### Custom Test Messages

Edit the test script to send custom messages:

```javascript
// In test-rag-manual-visual.js, find:
const testMessage = 'Hello! This is a test...';

// Change to:
const testMessage = 'Your custom test message here';
```

### Longer Wait Times

If RAG responses are slow, increase wait times:

```javascript
// Find:
await page.waitForTimeout(10000); // 10 seconds

// Change to:
await page.waitForTimeout(30000); // 30 seconds
```

### Headless Mode

To run tests without opening a browser window:

```javascript
// In the test script, find:
const browser = await chromium.launch({ 
  headless: false,  // <-- Change this
  slowMo: 1000,
});

// Change to:
const browser = await chromium.launch({ 
  headless: true,   // <-- Runs hidden
  slowMo: 0,
});
```

### Different Viewport Sizes

To test responsive design:

```javascript
// Find:
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
});

// Change to:
// Mobile
const context = await browser.newContext({
  viewport: { width: 375, height: 667 },
});

// Or tablet
const context = await browser.newContext({
  viewport: { width: 768, height: 1024 },
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: RAG Visual Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Start services
        run: |
          DB_DISABLED=true node api-server-express.js &
          cd frontend && npm run dev &
          sleep 30
      
      - name: Run visual tests
        run: node scripts/test-rag-manual-visual.js
      
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: rag-test-screenshots
          path: test-screenshots/
```

## Summary

These visual tests provide comprehensive verification that:
- ✅ RAG service is running and accessible
- ✅ Frontend displays connection status
- ✅ Users can send messages to RAG
- ✅ RAG responds to messages
- ✅ UI updates correctly
- ✅ Error handling works

All test results are captured in screenshots with timestamps for documentation and debugging.
