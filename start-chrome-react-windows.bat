@echo off
REM Windows Batch Script for Chrome React Dev Container
REM This script helps resolve Node.js PATH issues on Windows

echo 🚀 Starting Chrome React Dev Container (Windows)
echo ================================================

REM Check if node is in PATH
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found in PATH
    echo 🔧 Please ensure Node.js is installed and in PATH
    echo 📥 Download from: https://nodejs.org/
    echo.
    echo Alternative: Use full path to node.exe
    echo Example: "C:\Program Files\nodejs\node.exe" enterprise-chrome-react-workflow.js
    pause
    exit /b 1
)

REM Check Node.js version
echo 🔍 Checking Node.js version...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check if we're in the right directory
if not exist "enterprise-chrome-react-workflow.js" (
    echo ❌ Script not found in current directory
    echo 📁 Please run this script from the project root directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

REM Check for required dependencies
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check for Puppeteer
node -e "try { require('puppeteer'); console.log('✅ Puppeteer available'); } catch(e) { console.log('❌ Puppeteer not found'); process.exit(1); }"
if %errorlevel% neq 0 (
    echo 📦 Installing Puppeteer...
    call npm install puppeteer
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Puppeteer
        pause
        exit /b 1
    )
)

REM Check available ports
echo 🔍 Checking port availability...
netstat -an | findstr ":3001 " >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 is in use - attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /pid %%a /f >nul 2>nul
)

netstat -an | findstr ":3002 " >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3002 is in use - attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do taskkill /pid %%a /f >nul 2>nul
)

netstat -an | findstr ":3003 " >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3003 is in use - attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do taskkill /pid %%a /f >nul 2>nul
)

echo ✅ System check completed
echo.

REM Start the Chrome React Workflow
echo 🎯 Starting Chrome React Dev Container Workflow...
echo.
echo This will:
echo   • Launch headless Chrome browser
echo   • Create React development environment
echo   • Start admin dashboard
echo   • Enable live code execution
echo.
echo Press Ctrl+C to stop the system
echo.

node enterprise-chrome-react-workflow.js

REM If workflow exits, show final message
echo.
echo 🎊 Chrome React Dev Container workflow completed!
echo.
echo 🌐 Access your system at:
echo    🔴 Live React Editor: http://localhost:3001
echo    🔵 Admin Dashboard:   http://localhost:3003
echo.
echo 📊 To restart: run this script again
echo 🛑 To stop: Ctrl+C or close this window
echo.

pause
