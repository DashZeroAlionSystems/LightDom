@echo off
REM Chrome React Dev Container - Simple Startup Script
REM Provides detailed error reporting and debugging

echo.
echo 🚀 CHROME REACT DEV CONTAINER STARTUP
echo =====================================
echo.

REM Enable command echoing for debugging
echo [DEBUG] Current directory: %cd%
echo [DEBUG] Script location: %~dp0
echo [DEBUG] Command line: %0 %*
echo.

REM Step 1: Check Node.js installation
echo [1/6] 🔍 Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js not found in PATH
    echo.
    echo 🔧 SOLUTION: Install Node.js from https://nodejs.org/
    echo    Or add Node.js to your PATH environment variable
    echo.
    goto :error
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Step 2: Check if we're in the right directory
echo [2/6] 📁 Checking project directory...
if not exist "enterprise-chrome-react-workflow.js" (
    echo ❌ ERROR: enterprise-chrome-react-workflow.js not found
    echo 📍 Current directory: %cd%
    echo 🔧 SOLUTION: Run this script from the project root directory
    echo.
    goto :error
)
echo ✅ Project files found
echo.

REM Step 3: Check/create node_modules
echo [3/6] 📦 Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies (this may take a few minutes)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Failed to install dependencies
        echo 🔧 SOLUTION: Check your internet connection and npm permissions
        echo.
        goto :error
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)
echo.

REM Step 4: Check Puppeteer specifically
echo [4/6] 🤖 Checking Puppeteer...
node -e "try { require('puppeteer'); console.log('✅ Puppeteer available'); } catch(e) { console.log('❌ Puppeteer not found'); process.exit(1); }" 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Puppeteer...
    call npm install puppeteer
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Failed to install Puppeteer
        echo 🔧 SOLUTION: Try installing globally: npm install -g puppeteer
        echo.
        goto :error
    )
    echo ✅ Puppeteer installed
) else (
    echo ✅ Puppeteer ready
)
echo.

REM Step 5: Check port availability and free them
echo [5/6] 🔌 Checking ports...
set PORTS_OK=1

REM Check port 3001
netstat -an | findstr ":3001 " >nul 2>nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 in use, attempting to free...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo Killing process %%a on port 3001
        taskkill /pid %%a /f >nul 2>nul
    )
    timeout /t 2 /nobreak >nul
)

REM Check port 3002
netstat -an | findstr ":3002 " >nul 2>nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3002 in use, attempting to free...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
        echo Killing process %%a on port 3002
        taskkill /pid %%a /f >nul 2>nul
    )
    timeout /t 2 /nobreak >nul
)

REM Check port 3003
netstat -an | findstr ":3003 " >nul 2>nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3003 in use, attempting to free...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do (
        echo Killing process %%a on port 3003
        taskkill /pid %%a /f >nul 2>nul
    )
    timeout /t 2 /nobreak >nul
)

echo ✅ Ports checked
echo.

REM Step 6: Start the system
echo [6/6] 🎯 Starting Chrome React Dev Container...
echo.
echo This will launch:
echo   • Headless Chrome browser with React environment
echo   • Live code execution system
echo   • Admin dashboard for monitoring
echo   • WebSocket real-time communication
echo.
echo Press Ctrl+C to stop the system
echo.
echo ==================================================
echo.

REM Start the workflow
node enterprise-chrome-react-workflow.js

REM Check exit code
if %errorlevel% equ 0 (
    goto :success
) else (
    echo.
    echo ❌ ERROR: Workflow exited with code %errorlevel%
    echo 🔧 Check the error messages above for troubleshooting
    goto :error
)

:success
echo.
echo 🎊 SUCCESS: Chrome React Dev Container started successfully!
echo.
echo 🌐 Access your system:
echo    🔴 Live React Editor: http://localhost:3001
echo    🔵 Admin Dashboard:   http://localhost:3003
echo    🟢 Health Check:      http://localhost:3001/health
echo.
echo 📊 To restart: Run this script again
echo 🛑 To stop: Press Ctrl+C or close this window
echo.
pause
exit /b 0

:error
echo.
echo 💥 STARTUP FAILED
echo ================
echo.
echo 🔧 TROUBLESHOOTING STEPS:
echo.
echo 1. Install Node.js: https://nodejs.org/
echo 2. Run: npm install
echo 3. Ensure you're in the project root directory
echo 4. Check that all required files exist
echo 5. Try: node cross-platform-chrome-react-demo.js (for diagnostics)
echo.
echo 📞 For more help, run the diagnostic script:
echo    node cross-platform-chrome-react-demo.js
echo.
pause
exit /b 1
