@echo off
REM Manual Chrome React Dev Container Startup
REM Starts components individually for debugging

echo.
echo 🔧 MANUAL CHROME REACT DEV CONTAINER STARTUP
echo ============================================
echo.

REM Check Node.js
echo [1/3] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found
echo.

REM Check files
echo [2/3] Checking required files...
if not exist "chrome-react-dev-container.js" (
    echo ❌ chrome-react-dev-container.js not found
    pause
    exit /b 1
)
if not exist "admin-dashboard.html" (
    echo ❌ admin-dashboard.html not found
    pause
    exit /b 1
)
echo ✅ Required files found
echo.

REM Start container in background
echo [3/3] Starting Chrome React Container...
echo.
echo This will start:
echo   • Chrome browser with React environment
echo   • WebSocket server for real-time updates
echo   • HTTP server for the application
echo.
echo Press Ctrl+C to stop
echo.

start "Chrome React Container" cmd /c "node chrome-react-dev-container.js"

REM Wait a moment for container to start
timeout /t 3 /nobreak >nul

REM Open admin dashboard
echo Opening admin dashboard...
start http://localhost:3003

REM Open React editor
echo Opening React editor...
start http://localhost:3001

echo.
echo 🎯 MANUAL STARTUP COMPLETE
echo =========================
echo.
echo 🌐 Services started:
echo    🔴 React Editor: http://localhost:3001
echo    🔵 Admin Dashboard: http://localhost:3003
echo.
echo 📝 Note: Services are running in background
echo 🛑 To stop: Close the command windows or press Ctrl+C
echo.
pause
