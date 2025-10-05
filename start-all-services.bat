@echo off
echo 🚀 Starting LightDom Complete System (Windows)...

REM Kill any existing processes
echo 🧹 Cleaning up existing processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start API Server
echo 📡 Starting API Server...
start "API Server" cmd /k "cd /d %~dp0 && node simple-api-server.js"

REM Wait for API to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🌐 Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

REM Start Electron
echo 🖥️  Starting Electron...
set NODE_ENV=development
start "Electron" cmd /k "cd /d %~dp0 && electron . --dev"

echo ✅ All services started!
echo 🌐 Frontend: Check the Frontend window for the URL
echo 🔌 API: http://localhost:3001
echo 🖥️  Electron: Desktop app should open
echo.
echo Press any key to exit this window...
pause >nul
